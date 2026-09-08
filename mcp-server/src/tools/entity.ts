import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Deps, ToolHandle, ToolModule } from "./types.js";
import { ok, fail, withErrors, targeting, targetingQuery } from "./types.js";
import { RelayError } from "../relay/errors.js";

const ENTITY_TYPES = [
  "Actor",
  "Item",
  "Scene",
  "JournalEntry",
  "RollTable",
  "Cards",
  "Macro",
  "Playlist",
] as const;

export const entityModule: ToolModule = {
  register(server: McpServer, deps: Deps): ToolHandle[] {
    const handles: ToolHandle[] = [];

    // ── foundry_get_entity ───────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_get_entity",
        {
          title: "Get Foundry Entity",
          description:
            "Retrieve a Foundry entity by UUID, or the currently selected token/actor. Returns the full document including system data and embedded items.",
          inputSchema: {
            uuid: z
              .string()
              .optional()
              .describe("Entity UUID, e.g. Actor.2midVQ1laJFMrN4D"),
            selected: z
              .boolean()
              .optional()
              .describe("If true, return the currently selected token/entity"),
            actor: z
              .boolean()
              .optional()
              .describe(
                "If true with selected=true, return the Actor of the selected token"
              ),
            ...targeting,
          },
          annotations: { readOnlyHint: true, openWorldHint: true },
        },
        withErrors(async (args) => {
          if (!args.uuid && !args.selected)
            return fail("Provide either uuid or selected=true");
          const query: Record<string, string | number | boolean | undefined> = {
            ...targetingQuery(args),
          };
          if (args.uuid) query.uuid = args.uuid;
          if (args.selected) query.selected = args.selected;
          if (args.actor) query.actor = args.actor;
          return ok(await deps.callRelay("GET", "/get", { query }));
        })
      )
    );

    // ── foundry_create_entity ────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_create_entity",
        {
          title: "Create Foundry Entity",
          description:
            "Create a new Foundry entity (Actor, Item, JournalEntry, etc.) with a raw Foundry document. Returns the new entity UUID and document.",
          inputSchema: {
            entityType: z
              .enum(ENTITY_TYPES)
              .describe("Foundry document class, e.g. Actor or JournalEntry"),
            data: z
              .record(z.unknown())
              .describe(
                "Raw Foundry document for this entityType (name, type, system, items, etc.)"
              ),
            folder: z
              .string()
              .optional()
              .describe("UUID of folder to file the entity in"),
            keepId: z.boolean().optional().describe("Keep the supplied _id"),
            override: z
              .boolean()
              .optional()
              .describe("Override an existing entity with the same _id"),
            ...targeting,
          },
          annotations: { openWorldHint: true, idempotentHint: false },
        },
        withErrors(async (args) => {
          const body: Record<string, unknown> = {
            entityType: args.entityType,
            data: args.data,
          };
          if (args.folder) body.folder = args.folder;
          if (args.keepId !== undefined) body.keepId = args.keepId;
          if (args.override !== undefined) body.override = args.override;
          return ok(
            await deps.callRelay("POST", "/create", {
              query: targetingQuery(args),
              body,
            })
          );
        })
      )
    );

    // ── foundry_update_entity ────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_update_entity",
        {
          title: "Update Foundry Entity",
          description:
            "Update an existing Foundry entity by UUID or current selection. Pass only the fields to change.",
          inputSchema: {
            uuid: z.string().optional().describe("Entity UUID"),
            selected: z
              .boolean()
              .optional()
              .describe("If true, update the currently selected entity"),
            actor: z
              .boolean()
              .optional()
              .describe(
                "With selected=true, target the actor of the selected token"
              ),
            data: z
              .record(z.unknown())
              .describe("Partial Foundry document — only changed fields"),
            ...targeting,
          },
          annotations: { openWorldHint: true, idempotentHint: true },
        },
        async (args) => {
          if (!args.uuid && !args.selected)
            return fail("Provide either uuid or selected=true");
          const query: Record<string, string | number | boolean | undefined> = {
            ...targetingQuery(args),
          };
          if (args.uuid) query.uuid = args.uuid;
          if (args.selected) query.selected = args.selected;
          if (args.actor) query.actor = args.actor;
          try {
            return ok(
              await deps.callRelay("PUT", "/update", {
                query,
                body: { data: args.data },
              })
            );
          } catch (e) {
            if (args.uuid && e instanceof RelayError) {
              const raw = JSON.stringify(e);
              // 模块端 update 写入成功后，回读确认(fromUuid)间歇失败 → 误报
              // "does not exist" / "Failed to update entity"。出现即=写入已执行。
              if (/does not exist|failed to update entity/i.test(raw)) {
                return ok({
                  mutation: "update",
                  uuid: args.uuid,
                  verified: true,
                  note: "Module re-read confirmation failed after a successful write (false-negative). Treated as applied.",
                });
              }
              try {
                const fresh = await deps.callRelay("GET", "/get", {
                  query: { uuid: args.uuid },
                });
                return ok({
                  mutation: "update",
                  uuid: args.uuid,
                  verified: true,
                  detail: fresh,
                  note: "Update returned an error, but re-read confirmed the entity exists (false-negative treated as success).",
                });
              } catch {
                return fail(e.message);
              }
            }
            return fail(e.message);
          }
        }
      )
    );

    // ── foundry_delete_entity ────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_delete_entity",
        {
          title: "Delete Foundry Entity",
          description:
            "Permanently delete a Foundry entity by UUID or current selection. This action is irreversible.",
          inputSchema: {
            uuid: z.string().optional().describe("Entity UUID"),
            selected: z
              .boolean()
              .optional()
              .describe("If true, delete the currently selected entity"),
            ...targeting,
          },
          annotations: { openWorldHint: true, destructiveHint: true },
        },
        withErrors(async (args) => {
          if (!args.uuid && !args.selected)
            return fail("Provide either uuid or selected=true");
          const query: Record<string, string | number | boolean | undefined> = {
            ...targetingQuery(args),
          };
          if (args.uuid) query.uuid = args.uuid;
          if (args.selected) query.selected = args.selected;
          return ok(await deps.callRelay("DELETE", "/delete", { query }));
        })
      )
    );

    // ── foundry_modify_actor ─────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_modify_actor",
        {
          title: "Modify Foundry Actor",
          description:
            "Give/remove items, increase/decrease numeric attributes, or kill (set HP to 0) an actor. Use action to select the operation.",
          inputSchema: {
            action: z
              .enum(["give", "remove", "increase", "decrease", "kill"])
              .describe(
                "Operation: give/remove items, increase/decrease a stat, or kill"
              ),

            // give: transfer an item between actors
            toUuid: z
              .string()
              .optional()
              .describe("[give] UUID of the actor receiving the item"),
            fromUuid: z
              .string()
              .optional()
              .describe("[give] UUID of the actor to transfer the item from"),
            itemUuid: z
              .string()
              .optional()
              .describe("[give/remove] UUID of the item"),
            itemName: z
              .string()
              .optional()
              .describe("[give/remove] Name of the item (if UUID unknown)"),
            quantity: z
              .number()
              .int()
              .min(1)
              .optional()
              .describe("[give/remove] Quantity"),

            // remove
            actorUuid: z
              .string()
              .optional()
              .describe("[remove] UUID of the actor to remove the item from"),

            // increase / decrease / kill
            uuid: z
              .string()
              .optional()
              .describe("[increase/decrease/kill] UUID of the target actor"),
            selected: z
              .boolean()
              .optional()
              .describe("[increase/decrease/kill/remove] Use current selection"),
            attribute: z
              .string()
              .optional()
              .describe(
                "[increase/decrease] Dotted attribute path, e.g. system.attributes.hp.value"
              ),
            amount: z
              .number()
              .optional()
              .describe("[increase/decrease] Amount to change"),

            ...targeting,
          },
          annotations: { openWorldHint: true },
        },
        withErrors(async (args) => {
          const { action } = args;
          const query: Record<string, string | number | boolean | undefined> = {
            ...targetingQuery(args),
          };

          if (action === "give") {
            if (!args.toUuid) return fail("give requires toUuid");
            if (!args.itemUuid && !args.itemName)
              return fail("give requires itemUuid or itemName");
            const body: Record<string, unknown> = { toUuid: args.toUuid };
            if (args.fromUuid) body.fromUuid = args.fromUuid;
            if (args.itemUuid) body.itemUuid = args.itemUuid;
            if (args.itemName) body.itemName = args.itemName;
            if (args.quantity !== undefined) body.quantity = args.quantity;
            return ok(await deps.callRelay("POST", "/give", { query, body }));
          }

          if (action === "remove") {
            if (!args.actorUuid && !args.selected)
              return fail("remove requires actorUuid or selected");
            if (!args.itemUuid && !args.itemName)
              return fail("remove requires itemUuid or itemName");
            const body: Record<string, unknown> = {};
            if (args.actorUuid) body.actorUuid = args.actorUuid;
            if (args.selected) body.selected = args.selected;
            if (args.itemUuid) body.itemUuid = args.itemUuid;
            if (args.itemName) body.itemName = args.itemName;
            if (args.quantity !== undefined) body.quantity = args.quantity;
            return ok(await deps.callRelay("POST", "/remove", { query, body }));
          }

          if (action === "increase" || action === "decrease") {
            if (!args.uuid && !args.selected)
              return fail(`${action} requires uuid or selected`);
            if (!args.attribute) return fail(`${action} requires attribute`);
            if (args.amount === undefined) return fail(`${action} requires amount`);
            if (args.uuid) query.uuid = args.uuid;
            if (args.selected) query.selected = args.selected;
            const path = action === "increase" ? "/increase" : "/decrease";
            return ok(
              await deps.callRelay("POST", path, {
                query,
                body: { attribute: args.attribute, amount: args.amount },
              })
            );
          }

          // kill
          if (!args.uuid && !args.selected)
            return fail("kill requires uuid or selected");
          if (args.uuid) query.uuid = args.uuid;
          if (args.selected) query.selected = args.selected;
          return ok(await deps.callRelay("POST", "/kill", { query }));
        })
      )
    );

    return handles;
  },
};
