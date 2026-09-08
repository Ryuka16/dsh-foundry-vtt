import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CallRelayFn } from "../relay/client.js";
import type { Config } from "../config.js";
import { RelayError } from "../relay/errors.js";

export interface Deps {
  callRelay: CallRelayFn;
  config: Config;
}

/** Structural handle for a registered tool (subset of the SDK's RegisteredTool). */
export interface ToolHandle {
  enable(): void;
  disable(): void;
}

export interface ToolModule {
  /** Registers the module's tools and returns their handles (for gating). */
  register(server: McpServer, deps: Deps): ToolHandle[];
}

type TextResult = { content: Array<{ type: "text"; text: string }> };

export function ok(data: unknown): TextResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function fail(message: string): TextResult & { isError: true } {
  return { content: [{ type: "text", text: message }], isError: true };
}

/**
 * Wraps a tool handler so any RelayError (HTTP, timeout, network, success:false)
 * is surfaced as an isError result instead of thrown. Genuine bugs still throw.
 */
export function withErrors<A>(
  handler: (args: A) => Promise<TextResult | (TextResult & { isError: true })>
): (args: A) => Promise<TextResult | (TextResult & { isError: true })> {
  return async (args: A) => {
    try {
      return await handler(args);
    } catch (e) {
      if (e instanceof RelayError) return fail(e.message);
      throw e;
    }
  };
}

/** Optional per-call targeting overrides shared by every tool. */
export const targeting = {
  clientId: z
    .string()
    .optional()
    .describe("Override the default clientId (which connected world to target)"),
  userId: z
    .string()
    .optional()
    .describe("Override the default userId. Omit for GM-level access."),
};

/** Extracts clientId/userId from tool args into a query fragment. */
export function targetingQuery(args: {
  clientId?: string;
  userId?: string;
}): Record<string, string | undefined> {
  const q: Record<string, string | undefined> = {};
  if (args.clientId) q.clientId = args.clientId;
  if (args.userId) q.userId = args.userId;
  return q;
}
