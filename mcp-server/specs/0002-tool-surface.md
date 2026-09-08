# Spec 0002 — V1 tool surface

- **Status:** Living · **Implements:** issues #4–#13 · **Decisions:** [0004](../decisions/0004-grouped-tool-surface.md)

~9 tools. Each accepts optional `clientId` (default env/auto) and `userId`. `inputSchema` is a raw zod shape.

| Tool | Endpoint(s) | Scope | Key inputs | Annotations |
|---|---|---|---|---|
| `foundry_list_worlds` | `GET /clients` | clients:read | — | readOnly |
| `foundry_search` | `GET /search` | search | `query`, `filter?`, `limit?`, `minified?` | readOnly |
| `foundry_get_entity` | `GET /get` | entity:read | `uuid?` \| `selected?`, `actor?` | readOnly |
| `foundry_create_entity` | `POST /create` | entity:write | `entityType`, `data`, `folder?`, `keepId?`, `override?` | — |
| `foundry_update_entity` | `PUT /update` | entity:write | `uuid?`\|`selected?`, `data` (partial) | idempotent |
| `foundry_delete_entity` | `DELETE /delete` | entity:write | `uuid?`\|`selected?` | **destructive** |
| `foundry_modify_actor` | `/give` `/remove` `/increase` `/decrease` `/kill` | entity:write | `action` enum + per-action args | — |
| `foundry_create_creature` | `POST /create` (dnd5e NPC) | entity:write | see [spec 0003](./0003-dnd5e-npc-creature.md) | — |
| `foundry_manage_folder` | `/create-folder` `/delete-folder` | structure:write | `action`, `name`/`folderType`/`parentFolderId?` \| `folderId`/`deleteAll?` | create —, delete destructive |

## Registration
Modules implement `ToolModule { register(server, deps) }`; `registry.ts` pre-imports all module files (stubs in the foundation) so parallel streams never edit a shared file. Result helpers: `ok(data)`, `fail(message)`. Gating (issue #14): disable a group's tools if its scope is absent; hide `foundry_create_creature` when `systemId !== "dnd5e"`.
