# Implementation Plan — Foundry REST API MCP Server (V1)

This is the architecture + phase overview. **Granular, pullable work items live as GitHub Issues on the "V1" project board.** This doc gives the implementing agent the big picture; each issue gives a self-contained task with acceptance criteria. Endpoint truth is in [`API_SPEC.md`](./API_SPEC.md); raw relay docs are in [`reference/`](./reference/).

## V1 goal & scope

Ship an `npx`-runnable stdio MCP server that lets an LLM **author Foundry content** — above all, **create dnd5e creatures** — via the ThreeHats relay. Scopes: `clients:read`, `search`, `entity:read`, `entity:write`, `structure:write`.

Definition of done for V1: from Claude, create the Session-9 **Jabberwocky** and **Hagspawn son** as real dnd5e NPC actors (correct HP/AC/CR/abilities/attacks), search/read existing monsters to clone, and file new content into folders — all through MCP tools.

## Architecture

- **TypeScript**, Node ≥ 18 (target 20 LTS), **ESM-only** (`"type":"module"`).
- **`@modelcontextprotocol/sdk@^1.29`** + **`zod`**. (V2 SDK `@modelcontextprotocol/server` not stable yet; migrate later — mechanical.)
- **stdio** transport. **Never write to stdout** except the protocol — log to stderr.
- **Native `fetch`** for HTTP. No axios.
- **Config via env:** `FOUNDRY_API_KEY` (→ `x-api-key` header), `FOUNDRY_RELAY_URL` (default `https://foundryrestapi.com`), `FOUNDRY_CLIENT_ID` (optional; auto-resolves if 1 world online), `FOUNDRY_USER_ID` (optional; omit = GM). Fail fast on missing key.
- **`clientId` → query param; `x-api-key` → header.** (No `x-client-id` header exists.)
- **Build:** `tsup` → `dist/index.js` with `#!/usr/bin/env node`; `bin` entry; published/run via `npx`.

## Tool surface (V1 — ~9 tools)

Deliberately small. Research is decisive: LLM tool-selection degrades past ~30–40 tools and every tool is permanent context cost. Single-purpose tools where annotations differ; façades only for homogeneous actions.

| Tool | Endpoint(s) | Scope | Annotations |
|---|---|---|---|
| `foundry_list_worlds` | `GET /clients` | clients:read | readOnly |
| `foundry_search` | `GET /search` | search | readOnly |
| `foundry_get_entity` | `GET /get` (uuid \| selected) | entity:read | readOnly |
| `foundry_create_entity` | `POST /create` (generic) | entity:write | — |
| `foundry_update_entity` | `PUT /update` (partial) | entity:write | idempotent |
| `foundry_delete_entity` | `DELETE /delete` | entity:write | **destructive** |
| `foundry_modify_actor` | `/give` `/remove` `/increase` `/decrease` `/kill` (action enum) | entity:write | — |
| `foundry_create_creature` | `POST /create` (dnd5e NPC builder) | entity:write | — |
| `foundry_manage_folder` | `/create-folder` `/delete-folder` (action enum) | structure:write | create —, delete destructive |

All tools accept an optional `clientId` (defaults to env/auto-resolved) and optional `userId`.

## Proposed file layout

```
src/
  index.ts          # bin entry: shebang → build server → stdio connect
  server.ts         # createServer(): McpServer + registerAllModules()
  config.ts         # env → validated Config; fail-fast
  relay/
    client.ts       # callRelay(method, path, {query, body}): auth, query assembly, envelope unwrap, timeout
    errors.ts       # RelayError; status→actionable message (esp. 403 scope, 400/404 clientId)
    envelope.ts     # generic unwrap of { type, requestId, ...payload }
  tools/
    types.ts        # ToolModule interface; ok()/fail() result helpers
    registry.ts     # register modules onto the server; scope/system gating
    worlds.ts search.ts entity.ts creature.ts folders.ts
  dnd5e/
    npc-schema.ts   # high-level NPC input → dnd5e v5.2.2 Actor document + embedded items[]
test/               # vitest, mocked fetch
reference/          # relay docs (committed)
.env.example  package.json  tsconfig.json  tsup.config.ts
```

## Cross-cutting requirements (apply to every tool)

1. **Result shape:** success → `{ content:[{type:"text", text:<json>}] }`; operational errors → `{ content:[...], isError:true }` (don't throw for relay/HTTP failures — surface status + body so the model can recover). Reserve throws for protocol faults.
2. **Envelope unwrap:** return the known payload key if present, else the whole object; handle `/clients` and session bare shapes.
3. **Error mapping:** 403 → "key missing scope X; mint a key with [...]"; 400/404 clientId → "no/ambiguous world; pass clientId or check the world is online"; 429 → rate limit.
4. **Annotations:** set `readOnlyHint`/`destructiveHint`/`idempotentHint`; `openWorldHint:true` everywhere (external server). Defaults are conservative — omitting hints forces approval friction on safe reads.
5. **Validation:** zod input schema per tool (raw shape object, not `z.object()`). Validate before any fetch.
6. **No secrets in args:** API key only from env, never a tool parameter.

## Phase plan → issues

Work phases in order; within a phase, issues may parallelize once the shared core (Phase 1) exists.

- **Phase 0 — Scaffold:** project setup, deps, tsup/tsconfig, MCP stdio skeleton, `.env.example`, config loader.
- **Phase 1 — Relay core:** `callRelay` fetch wrapper (auth, query, envelope unwrap, error mapping), `ToolModule` interface + registry. *Shared foundation — everything depends on it.*
- **Phase 2 — Read tools:** `foundry_list_worlds`, `foundry_search`, `foundry_get_entity` + startup connection check.
- **Phase 3 — Write tools:** `foundry_create_entity`, `foundry_update_entity`, `foundry_delete_entity`, `foundry_modify_actor`.
- **Phase 4 — Creature builder:** spike to verify the dnd5e **v5.2.2** NPC + attack/activities schema from a live read (`reference/dnd5e-5.2.2-npc-schema.md`), then `foundry_create_creature`.
- **Phase 5 — Folders:** `foundry_manage_folder`; wire `folder` UUID into create tools.
- **Phase 6 — Harden & ship:** annotations + scope/system gating, vitest (mocked fetch) + gated live smoke test, README config snippets, MCP Inspector validation, optional npm publish.

## Parallelization guidance (for the implementing agent)

After Phase 1's shared core lands, the tool modules (`worlds`, `search`, `entity`, `creature`, `folders`) conform to one `ToolModule` interface and can be built **in parallel by separate sub-agents** — each owns one file under `src/tools/`, depends only on `relay/client.ts` + `tools/types.ts`, and ships with its own unit tests. Merge, then do Phase 6 hardening once.

## Known risks / gaps to resolve during build

- **dnd5e attack/damage schema (HIGH):** the relay's recorded examples are dnd5e 4.3.8; target is **5.2.2**, which uses the newer **activities** damage model. Do not hand-author attacks — mirror from a live v5.2.2 NPC (Phase 4 spike) before building `create_creature`.
- **Error envelope shape (MED):** no error example in the docs; confirm the failure body against the live relay and finalize `errors.ts` mapping.
- **`/scene/image/raw` raw-vs-wrapped (LOW, future phase):** branch on Content-Type.
- **clientId discovery:** `/clients` (clients:read, in scope) handles it; auto-resolve when one world is online.

## Future phases (post-V1, each = +1 scope + 1 module)

dnd5e helpers (`dnd5e`) · sheet images (`sheet:read`) · effects (`effects:*`) · encounters/combat (`encounter:*`) · chat (`chat:*`) · rolls (`roll:*`) · macros (`macro:*`) · playlists (`playlist:control`) · scenes (`scene:*`) · canvas/tokens (`canvas:*`) · users (`user:*`) · world-info/select (`world:info`, `entity:read`) · files (`file:*`) · sessions (`session:manage`) · streaming events (`events:subscribe`, via notifications/polling) · `execute-js` (opt-in, high-risk). See [`API_SPEC.md` §D](./API_SPEC.md).
