import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRequire } from "module";
import type { Config } from "./config.js";
import { makeCallRelay } from "./relay/client.js";
import { registerAllModules } from "./tools/registry.js";
import type { Deps } from "./tools/types.js";
import type { ToolHandle } from "./tools/types.js";
import {
  checkStartupConnection,
  resolveActiveWorld,
  type ClientInfo,
} from "./tools/worlds.js";

const require = createRequire(import.meta.url);

function getVersion(): string {
  try {
    const pkg = require("../package.json") as { version: string };
    return pkg.version;
  } catch {
    return "0.1.0";
  }
}

export async function createServer(config: Config): Promise<McpServer> {
  const server = new McpServer({ name: "foundry-relay", version: getVersion() });
  const callRelay = makeCallRelay(config);
  const deps: Deps = { callRelay, config };

  const { creatureTool } = registerAllModules(server, deps);

  // Non-blocking startup: log connectivity, then gate system-specific tools.
  void startupGating(deps, creatureTool);

  return server;
}

async function startupGating(
  deps: Deps,
  creatureTool: ToolHandle
): Promise<void> {
  await checkStartupConnection(deps);
  try {
    const active = await resolveActiveWorld(deps);
    applySystemGating(active, creatureTool);
  } catch {
    /* connectivity already warned in checkStartupConnection */
  }
}

/**
 * Disable system-specific tools when the active world's system can be
 * positively confirmed as something other than dnd5e. If the world can't be
 * resolved (none online / ambiguous), tools stay enabled — the relay's own
 * validation rejects misuse, and we avoid hiding tools on a transient probe
 * failure.
 */
export function applySystemGating(
  active: ClientInfo | undefined,
  creatureTool: ToolHandle
): void {
  if (active && active.systemId && active.systemId !== "dnd5e") {
    creatureTool.disable();
    process.stderr.write(
      `[foundry-mcp] foundry_create_creature disabled: active world system is "${active.systemId}", not dnd5e.\n`
    );
  }
}
