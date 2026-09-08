import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Deps, ToolHandle, ToolModule } from "./types.js";
import { ok, withErrors } from "./types.js";

export interface ClientInfo {
  clientId: string;
  worldTitle?: string;
  isOnline?: boolean;
  systemId?: string;
  systemVersion?: string;
  foundryVersion?: string;
}

/** Fetch the raw `{ clients, total }` payload from GET /clients. */
export async function listClients(
  deps: Deps
): Promise<{ clients: ClientInfo[]; total: number }> {
  const data = (await deps.callRelay("GET", "/clients", {
    rawEnvelope: true,
  })) as { clients?: ClientInfo[]; total?: number };
  const clients = data.clients ?? [];
  return { clients, total: data.total ?? clients.length };
}

/**
 * Resolve which connected world is active: the configured clientId if set,
 * otherwise the sole online world. Returns undefined if it can't be determined.
 */
export async function resolveActiveWorld(
  deps: Deps
): Promise<ClientInfo | undefined> {
  const { clients } = await listClients(deps);
  if (deps.config.clientId) {
    return clients.find((c) => c.clientId === deps.config.clientId);
  }
  const online = clients.filter((c) => c.isOnline);
  return online.length === 1 ? online[0] : undefined;
}

export const worldsModule: ToolModule = {
  register(server: McpServer, deps: Deps): ToolHandle[] {
    const tool = server.registerTool(
      "foundry_list_worlds",
      {
        title: "List Foundry Worlds",
        description:
          "List all Foundry VTT worlds/clients connected to the relay, including their online status, system, and version info.",
        inputSchema: {},
        annotations: { readOnlyHint: true, openWorldHint: true },
      },
      withErrors(async () => ok(await listClients(deps)))
    );
    return [tool];
  },
};

export async function checkStartupConnection(deps: Deps): Promise<void> {
  try {
    const { clients } = await listClients(deps);
    const online = clients.filter((c) => c.isOnline);

    if (online.length === 0) {
      process.stderr.write(
        "[foundry-mcp] Warning: No Foundry worlds are currently online.\n"
      );
      return;
    }

    for (const c of online) {
      const active = !deps.config.clientId || deps.config.clientId === c.clientId;
      process.stderr.write(
        `[foundry-mcp] Online world: "${c.worldTitle}" (${c.clientId}) system=${c.systemId} ${c.systemVersion ?? ""}${active ? " ← active" : ""}\n`
      );
    }

    if (
      deps.config.clientId &&
      !clients.some((c) => c.clientId === deps.config.clientId)
    ) {
      process.stderr.write(
        `[foundry-mcp] Warning: FOUNDRY_CLIENT_ID="${deps.config.clientId}" not found in client list.\n`
      );
    }
  } catch (e) {
    process.stderr.write(
      `[foundry-mcp] Warning: Could not check relay connectivity: ${e}\n`
    );
  }
}
