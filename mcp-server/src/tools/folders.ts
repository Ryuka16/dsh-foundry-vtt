import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Deps, ToolHandle, ToolModule } from "./types.js";
import { ok, fail, withErrors, targeting, targetingQuery } from "./types.js";

const FOLDER_TYPES = [
  "Actor",
  "Item",
  "Scene",
  "JournalEntry",
  "RollTable",
  "Cards",
  "Macro",
  "Playlist",
] as const;

export const foldersModule: ToolModule = {
  register(server: McpServer, deps: Deps): ToolHandle[] {
    const tool = server.registerTool(
      "foundry_manage_folder",
      {
        title: "Manage Foundry Folder",
        description:
          "Create or delete a Foundry folder. After creating a folder, pass the returned uuid as the folder argument when creating entities. " +
          "Limitation: finding existing folders requires structure:read (not in v1 scope) — only freshly-created folder UUIDs are known.",
        inputSchema: {
          action: z.enum(["create", "delete"]).describe("create or delete"),

          // create
          name: z.string().optional().describe("[create] Folder name"),
          folderType: z
            .enum(FOLDER_TYPES)
            .optional()
            .describe(
              "[create] Document class this folder holds, e.g. Actor or Item"
            ),
          parentFolderId: z
            .string()
            .optional()
            .describe("[create] UUID of parent folder (optional)"),

          // delete
          folderId: z
            .string()
            .optional()
            .describe("[delete] UUID/id of the folder to delete"),
          deleteAll: z
            .boolean()
            .optional()
            .describe(
              "[delete] If true, also delete all entities inside the folder (irreversible)"
            ),

          ...targeting,
        },
        // Mixed: create is safe, delete is destructive. We annotate
        // conservatively (destructive) because the tool can delete.
        annotations: { openWorldHint: true, destructiveHint: true },
      },
      withErrors(async (args) => {
        const query: Record<string, string | number | boolean | undefined> = {
          ...targetingQuery(args),
        };

        if (args.action === "create") {
          if (!args.name) return fail("create requires name");
          if (!args.folderType) return fail("create requires folderType");
          // The relay accepts these params via query even for POST.
          query.name = args.name;
          query.folderType = args.folderType;
          if (args.parentFolderId) query.parentFolderId = args.parentFolderId;
          return ok(await deps.callRelay("POST", "/create-folder", { query }));
        }

        // delete
        if (!args.folderId) return fail("delete requires folderId");
        query.folderId = args.folderId;
        if (args.deleteAll !== undefined) query.deleteAll = args.deleteAll;
        return ok(await deps.callRelay("DELETE", "/delete-folder", { query }));
      })
    );
    return [tool];
  },
};
