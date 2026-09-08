import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Deps, ToolHandle, ToolModule } from "./types.js";
import { ok, withErrors, targeting, targetingQuery } from "./types.js";

export const rollsModule: ToolModule = {
  register(server: McpServer, deps: Deps): ToolHandle[] {
    const handles: ToolHandle[] = [];

    // ── foundry_roll ─────────────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_roll",
        {
          title: "Roll Dice",
          description:
            "Roll dice in the Foundry world with a formula (e.g. \"1d20+5\" or \"5d6\"). Optionally create a chat message, add flavor text, set a speaker, or whisper the result to specific users.",
          inputSchema: {
            formula: z
              .string()
              .describe("The roll formula to evaluate, e.g. \"1d20 + 5\""),
            flavor: z.string().optional().describe("Optional flavor text for the roll"),
            createChatMessage: z
              .boolean()
              .optional()
              .describe("Whether to create a chat message for the roll"),
            speaker: z
              .string()
              .optional()
              .describe("Speaker UUID/token actor for the roll"),
            whisper: z
              .array(z.string())
              .optional()
              .describe("User IDs to whisper the result to (private roll if set)"),
            ...targeting,
          },
          annotations: { openWorldHint: true },
        },
        withErrors(async (args) => {
          const body: Record<string, unknown> = { formula: args.formula };
          if (args.flavor) body.flavor = args.flavor;
          if (args.createChatMessage !== undefined)
            body.createChatMessage = args.createChatMessage;
          if (args.speaker) body.speaker = args.speaker;
          if (args.whisper) body.whisper = args.whisper;
          return ok(
            await deps.callRelay("POST", "/roll", {
              query: targetingQuery(args),
              body,
            })
          );
        })
      )
    );

    // ── foundry_get_recent_rolls ─────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_get_recent_rolls",
        {
          title: "Get Recent Rolls",
          description:
            "Retrieve the most recent rolls made in the Foundry world, newest first.",
          inputSchema: {
            limit: z
              .number()
              .optional()
              .describe("Number of rolls to return (default 20)"),
            ...targeting,
          },
          annotations: { readOnlyHint: true, openWorldHint: true },
        },
        withErrors(async (args) => {
          return ok(
            await deps.callRelay("GET", "/rolls", {
              query: { ...targetingQuery(args), ...(args.limit ? { limit: args.limit } : {}) },
            })
          );
        })
      )
    );

    // ── foundry_get_last_roll ────────────────────────────────────────────────
    handles.push(
      server.registerTool(
        "foundry_get_last_roll",
        {
          title: "Get Last Roll",
          description: "Retrieve the most recent roll made in the Foundry world.",
          inputSchema: {
            ...targeting,
          },
          annotations: { readOnlyHint: true, openWorldHint: true },
        },
        withErrors(async (args) => {
          return ok(
            await deps.callRelay("GET", "/lastroll", {
              query: targetingQuery(args),
            })
          );
        })
      )
    );

    return handles;
  },
};
