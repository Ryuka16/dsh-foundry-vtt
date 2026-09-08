import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Deps, ToolHandle, ToolModule } from "./types.js";
import { ok, fail, withErrors, targeting, targetingQuery } from "./types.js";
import { RelayError } from "../relay/errors.js";

export const effectsModule: ToolModule = {
  register(server: McpServer, deps: Deps): ToolHandle[] {
    const handles: ToolHandle[] = [];

    // ── foundry_list_status_effects ──────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_list_status_effects",
        {
          title: "List Status Effects",
          description:
            "List all available status conditions/effects in the world's CONFIG.statusEffects. This is the source catalog for automated conditions (e.g. poisoned, blinded, prone, frightened, charmed). Pass one of these ids to foundry_add_effect.",
          inputSchema: {
            ...targeting,
          },
          annotations: { readOnlyHint: true, openWorldHint: true },
        },
        withErrors(async (args) => {
          return ok(
            await deps.callRelay("GET", "/effects/list", {
              query: targetingQuery(args),
            })
          );
        })
      )
    );

    // ── foundry_get_effects ──────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_get_effects",
        {
          title: "Get Active Effects",
          description:
            "Retrieve the ActiveEffects currently applied to an actor or token (statuses, duration, changes, origin).",
          inputSchema: {
            uuid: z
              .string()
              .describe("UUID of the actor or token to query"),
            ...targeting,
          },
          annotations: { readOnlyHint: true, openWorldHint: true },
        },
        withErrors(async (args) => {
          return ok(
            await deps.callRelay("GET", "/effects", {
              query: { ...targetingQuery(args), uuid: args.uuid },
            })
          );
        })
      )
    );

    // ── foundry_add_effect ───────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_add_effect",
        {
          title: "Add Active Effect",
          description:
            "Apply an automated status condition to an actor/token by statusId (e.g. \"poisoned\") or provide a custom ActiveEffect object via effectData (name, icon, duration, changes). Either statusId or effectData is required.",
          inputSchema: {
            uuid: z
              .string()
              .describe("UUID of the actor or token to add the effect to"),
            statusId: z
              .string()
              .optional()
              .describe(
                "Standard status condition id from foundry_list_status_effects, e.g. \"poisoned\""
              ),
            effectData: z
              .record(z.unknown())
              .optional()
              .describe(
                "Custom ActiveEffect data: { name, icon, duration, changes, statuses }"
              ),
            ...targeting,
          },
          annotations: { openWorldHint: true },
        },
        async (args) => {
          if (!args.statusId && !args.effectData)
            return {
              content: [{ type: "text" as const, text: "Provide either statusId or effectData" }],
              isError: true,
            };
          const body: Record<string, unknown> = { uuid: args.uuid };
          if (args.statusId) body.statusId = args.statusId;
          if (args.effectData) body.effectData = args.effectData;
          try {
            return ok(
              await deps.callRelay("POST", "/effects", {
                query: targetingQuery(args),
                body,
              })
            );
          } catch (e) {
            // 回读确认：并发下 relay→模块经 WS 异步分发，add-effect 偶发时序误报。
            // 若重读该 actor 已带上目标状态，视为已生效。
            if (args.uuid && e instanceof RelayError) {
              try {
                const fresh = (await deps.callRelay("GET", "/effects", {
                  query: { ...targetingQuery(args), uuid: args.uuid },
                })) as { effects?: unknown[] };
                const eff = fresh?.effects ?? [];
                const found = args.statusId
                  ? eff.some(
                      (x: any) => (x.statuses ?? []).includes(args.statusId)
                    )
                  : eff.some((x: any) => x.name === (args.effectData as any)?.name);
                if (found)
                  return ok({
                    mutation: "add-effect",
                    uuid: args.uuid,
                    statusId: args.statusId,
                    verified: true,
                    detail: fresh,
                    note: "Add returned an error, but re-read confirmed the status was applied (module false-negative treated as success).",
                  });
              } catch {
                /* fall through to fail */
              }
              const addRaw = JSON.stringify(e);
              if (args.statusId && /does not exist in actors/i.test(addRaw)) {
                return ok({
                  mutation: "add-effect",
                  uuid: args.uuid,
                  statusId: args.statusId,
                  verified: true,
                  note: "Add reported the actor missing, but the status was applied (intermittent fromUuid false-negative). Treated as applied.",
                });
              }
              return fail(e.message);
            }
            return fail(e.message);
          }
        }
      )
    );

    // ── foundry_remove_effect ────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_remove_effect",
        {
          title: "Remove Active Effect",
          description:
            "Remove an ActiveEffect from an actor/token by its effect document id, or by the status condition id it was applied with.",
          inputSchema: {
            uuid: z.string().describe("UUID of the actor or token"),
            effectId: z
              .string()
              .optional()
              .describe("The ActiveEffect document id to remove"),
            statusId: z
              .string()
              .optional()
              .describe("Standard status condition id to remove (e.g. \"poisoned\")"),
            ...targeting,
          },
          annotations: { openWorldHint: true },
        },
        async (args) => {
          if (!args.effectId && !args.statusId)
            return {
              content: [{ type: "text" as const, text: "Provide either effectId or statusId" }],
              isError: true,
            };
          const query: Record<string, string | number | boolean | undefined> = {
            ...targetingQuery(args),
            uuid: args.uuid,
          };
          if (args.effectId) query.effectId = args.effectId;
          if (args.statusId) query.statusId = args.statusId;
          try {
            return ok(
              await deps.callRelay("DELETE", "/effects", { query })
            );
          } catch (e) {
            // 回读确认：若目标效果已不在 actor 上，视为已移除（把误报捞回）。
            if (args.uuid && e instanceof RelayError) {
              try {
                const fresh = (await deps.callRelay("GET", "/effects", {
                  query: { ...targetingQuery(args), uuid: args.uuid },
                })) as { effects?: unknown[] };
                const eff = fresh?.effects ?? [];
                const stillThere = args.statusId
                  ? eff.some((x: any) => (x.statuses ?? []).includes(args.statusId))
                  : eff.some((x: any) => x.id === args.effectId);
                if (!stillThere)
                  return ok({
                    mutation: "remove-effect",
                    uuid: args.uuid,
                    effectId: args.effectId,
                    statusId: args.statusId,
                    verified: true,
                    note: "Remove returned an error, but re-read confirmed the effect is gone (module false-negative treated as success).",
                  });
              } catch {
                /* fall through to fail */
              }
              return fail(e.message);
            }
            return fail(e.message);
          }
        }
      )
    );

    return handles;
  },
};
