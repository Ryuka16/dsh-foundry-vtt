import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Deps, ToolHandle, ToolModule } from "./types.js";
import { ok, withErrors, targeting, targetingQuery } from "./types.js";
import { buildNpcDocument } from "../dnd5e/npc-schema.js";

export const CREATURE_TOOL_NAME = "foundry_create_creature";

const SIZE_VALUES = ["tiny", "sm", "med", "lg", "huge", "grg"] as const;

const attackSchema = z.object({
  name: z.string(),
  toHit: z
    .number()
    .optional()
    .describe("Static attack bonus (use this OR abilityMod)"),
  abilityMod: z
    .string()
    .optional()
    .describe('Ability for attack mod, e.g. "str" (use this OR toHit)'),
  reach: z.number().optional().describe("Reach in feet (default 5)"),
  range: z.string().optional().describe('Range string e.g. "20/60 ft" (makes it ranged)'),
  damage: z
    .array(
      z.object({
        formula: z.string().describe('Damage formula, e.g. "2d6+4"'),
        type: z.string().describe('Damage type, e.g. "slashing"'),
      })
    )
    .describe("Damage rolls"),
  description: z.string().optional(),
});

const featureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const creatureModule: ToolModule = {
  register(server: McpServer, deps: Deps): ToolHandle[] {
    // Gating (disable on non-dnd5e worlds) is applied by the server after the
    // startup connection check — see createServer() in server.ts.
    const tool = server.registerTool(
      CREATURE_TOOL_NAME,
      {
        title: "Create dnd5e NPC",
        description:
          "Build a dnd5e 5th-edition NPC actor from a friendly schema and create it in Foundry. " +
          "Returns the new actor UUID and document. Only available when the connected world is dnd5e. " +
          "⚠️ Attack schema targets dnd5e v5.2.2 activities model — verify against a live NPC if attacks look wrong.",
        inputSchema: {
          name: z.string().describe("NPC name"),
          size: z.enum(SIZE_VALUES).describe("tiny|sm|med|lg|huge|grg"),
          type: z
            .string()
            .describe('Creature type, e.g. "beast", "monstrosity", "humanoid"'),
          cr: z.number().describe("Challenge rating, e.g. 0.25 or 6"),
          ac: z.number().int().describe("Armor class (flat/natural)"),
          hp: z.object({
            value: z.number().int(),
            max: z.number().int(),
            formula: z
              .string()
              .optional()
              .describe('HP dice formula, e.g. "4d8+8"'),
          }),
          abilities: z.object({
            str: z.number().int(),
            dex: z.number().int(),
            con: z.number().int(),
            int: z.number().int(),
            wis: z.number().int(),
            cha: z.number().int(),
          }),
          speeds: z
            .object({
              walk: z.number().optional(),
              fly: z.number().optional(),
              swim: z.number().optional(),
              climb: z.number().optional(),
              burrow: z.number().optional(),
              units: z.string().optional(),
            })
            .optional(),
          senses: z
            .object({
              darkvision: z.number().optional(),
              blindsight: z.number().optional(),
              tremorsense: z.number().optional(),
              truesight: z.number().optional(),
              units: z.string().optional(),
            })
            .optional(),
          languages: z.array(z.string()).optional(),
          alignment: z.string().optional().describe('e.g. "Chaotic Evil"'),
          biography: z.string().optional(),
          attacks: z.array(attackSchema).optional(),
          features: z.array(featureSchema).optional(),
          folder: z.string().optional().describe("Folder UUID to file into"),
          ...targeting,
        },
        annotations: { openWorldHint: true, idempotentHint: false },
      },
      withErrors(async (args) => {
        const npcDoc = buildNpcDocument(args);
        return ok(
          await deps.callRelay("POST", "/create", {
            query: targetingQuery(args),
            body: { entityType: "Actor", data: npcDoc },
          })
        );
      })
    );
    return [tool];
  },
};
