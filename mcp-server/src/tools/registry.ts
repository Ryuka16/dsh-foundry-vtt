import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Deps, ToolHandle } from "./types.js";
import { worldsModule } from "./worlds.js";
import { searchModule } from "./search.js";
import { entityModule } from "./entity.js";
import { creatureModule } from "./creature.js";
import { foldersModule } from "./folders.js";
import { rollsModule } from "./rolls.js";
import { effectsModule } from "./effects.js";

export interface RegisteredTools {
  /** The dnd5e creature builder — gated off on non-dnd5e worlds. */
  creatureTool: ToolHandle;
}

export function registerAllModules(
  server: McpServer,
  deps: Deps
): RegisteredTools {
  worldsModule.register(server, deps);
  searchModule.register(server, deps);
  entityModule.register(server, deps);
  const [creatureTool] = creatureModule.register(server, deps);
  foldersModule.register(server, deps);
  rollsModule.register(server, deps);
  effectsModule.register(server, deps);
  return { creatureTool };
}
