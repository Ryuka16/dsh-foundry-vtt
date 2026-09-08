# foundry-rest-api-mcp-server

An MCP (Model Context Protocol) server that wraps the **ThreeHats Foundry VTT REST API relay**, so an LLM agent (Claude Code / Claude Desktop) can author and manage Foundry VTT content — primarily **creating D&D 5e creatures** — through native MCP tools instead of raw HTTP calls.

> **Status:** V1 implemented. The stdio MCP server lives under [`src/`](./src) with unit tests under [`test/`](./test). See **[Install & configure](#install--configure)** below to run it. The original plan that drove the build is in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

---

## What this is

The relay (`github.com/ThreeHats/foundryvtt-rest-api-relay`, public host `https://foundryrestapi.com`) bridges a running Foundry world to a REST API over a WebSocket. A Foundry-side module connects out to the relay; external clients then call REST endpoints, authenticating with an `x-api-key` header and targeting a world via a `clientId` query param.

This MCP server is a **thin, typed client** of that relay. It does **not** talk to Foundry directly and requires **no Foundry-side code of its own** (the relay's module handles that). That is the key differentiator from existing Foundry MCP servers, which all ship a custom Foundry module + socket (see [`IMPLEMENTATION_PLAN.md` § Prior Art](./IMPLEMENTATION_PLAN.md)).

## v1 scope (locked)

v1 implements the relay's **document-authoring surface** — these five scopes only:

| Scope | Endpoints | Capability |
|---|---|---|
| `clients:read` | `GET /clients` | Discover connected worlds → pick `clientId` |
| `search` | `GET /search` | Find actors/items/etc. by name (world + compendiums) |
| `entity:read` | `GET /get` | Read any document (by UUID or current selection) |
| `entity:write` | `POST /create`, `PUT /update`, `DELETE /delete`, `/give`, `/remove`, `/increase`, `/decrease`, `/kill` | Create / update / delete documents; tweak actor inventory & attributes |
| `structure:write` | `POST /create-folder`, `DELETE /delete-folder` | Organize content into folders |

This delivers the headline use case end-to-end: **build a dnd5e NPC/monster** (abilities, HP, AC, CR, traits, embedded attacks) as a real Foundry actor, search/read existing creatures to clone-and-tweak, and file everything into folders.

Everything else in the relay (dice rolls, chat, encounters/combat, scenes, canvas/tokens, effects, files, users, macro execution, streaming events) is **out of v1 scope** and documented as clearly-marked **Future Phases** — each unlocks by adding one scope and one tool module.

> Optional companion: adding **`structure:read`** (`GET /structure`, `GET /get-folder`) would let us *find* existing folders, not just create them. Cheap and read-only; deferred for now.

## Architecture decisions (the short list)

- **Language/runtime:** TypeScript, Node ≥ 18 (target Node 20 LTS), ESM-only.
- **SDK:** `@modelcontextprotocol/sdk@^1.29` (the shipped 1.x line). The renamed V2 SDK (`@modelcontextprotocol/server`) is not stable until ~mid-2026; migration later is mechanical. Build on 1.x now.
- **Transport:** stdio.
- **HTTP:** native `fetch` (no axios).
- **Validation:** `zod` (peer of the SDK).
- **Build/package:** `tsup` → single `npx`-runnable bin.
- **Config:** env vars — `FOUNDRY_API_KEY` (the `x-api-key`), `FOUNDRY_RELAY_URL` (default `https://foundryrestapi.com`), `FOUNDRY_CLIENT_ID` (optional; auto-resolves if one world is online), `FOUNDRY_USER_ID` (optional; omit = GM-level).
- **Tool surface:** small set of mostly single-purpose tools (~9 in v1), façades only where operations are homogeneous. Per-endpoint-explosion is explicitly avoided — LLM tool-selection reliability degrades past ~30–40 tools and every tool is permanent context cost.

## Install & configure

### Build from source

```bash
npm install
npm run build      # → dist/index.js (executable, #!/usr/bin/env node)
npm test           # unit tests (mocked fetch)
npm run inspect    # launch the MCP Inspector against dist/index.js
```

### Environment variables

| Var | Required | Default | Purpose |
|---|---|---|---|
| `FOUNDRY_API_KEY` | **yes** | — | Sent as the `x-api-key` header. Must include all five v1 scopes (see below). |
| `FOUNDRY_RELAY_URL` | no | `https://foundryrestapi.com` | Relay base URL. Set to `http://localhost:3010` for a self-hosted relay. |
| `FOUNDRY_CLIENT_ID` | no | auto-resolves | Which connected world to target. Auto-resolves when exactly one world is online. |
| `FOUNDRY_USER_ID` | no | GM-level | Scope actions to a Foundry user's permissions. Omit for GM access. |

On startup the server logs the online world(s) to **stderr** and disables `foundry_create_creature` if the active world's system isn't `dnd5e`.

### Tools (v1)

`foundry_list_worlds` · `foundry_search` · `foundry_get_entity` · `foundry_create_entity` · `foundry_update_entity` · `foundry_delete_entity` · `foundry_modify_actor` · `foundry_create_creature` · `foundry_manage_folder`

### Claude Code (`.mcp.json`)

Add to `.mcp.json` in your project root (or via `claude mcp add`):

```json
{
  "mcpServers": {
    "foundry": {
      "command": "node",
      "args": ["/absolute/path/to/foundry-rest-api-mcp-server/dist/index.js"],
      "env": {
        "FOUNDRY_API_KEY": "your-scoped-key",
        "FOUNDRY_CLIENT_ID": "fvtt_8bfa06d76c0c1ac5"
      }
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "foundry": {
      "command": "node",
      "args": ["/absolute/path/to/foundry-rest-api-mcp-server/dist/index.js"],
      "env": {
        "FOUNDRY_API_KEY": "your-scoped-key",
        "FOUNDRY_CLIENT_ID": "fvtt_8bfa06d76c0c1ac5"
      }
    }
  }
}
```

> Once published to npm, replace `"command": "node", "args": ["…/dist/index.js"]` with `"command": "npx", "args": ["-y", "foundry-rest-api-mcp-server"]`.

### Live smoke test (optional)

A gated end-to-end test creates then deletes a throwaway JournalEntry against the real relay:

```bash
FOUNDRY_LIVE_TEST=1 FOUNDRY_API_KEY=... FOUNDRY_CLIENT_ID=... npm test
```

## How to use this repo (for the implementing agent)

1. Read [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) top to bottom. Work the **phases in order**; each step lists its goal, the files it touches, the exact work, and an acceptance check.
2. Read [`EXECUTION_STRATEGY.md`](./EXECUTION_STRATEGY.md) for **how to run the build** — recommended model/effort per ticket, the sequential-foundation → parallel-fan-out → sequential-convergence order, and the branch-per-work-stream (trunk-based) strategy with worktrees + CI gates.
3. Use [`API_SPEC.md`](./API_SPEC.md) as the authoritative endpoint reference (request/response shapes, scopes, quirks, the dnd5e NPC schema notes).
4. Pull granular, ordered tasks from the **[V1 project board](https://github.com/users/PhillypHenning/projects/4)** / [issues](https://github.com/PhillypHenning/foundry-rest-api-mcp-server/issues) (milestone `V1 — Content Authoring`). Each issue carries goal, endpoint+scope, file paths, acceptance criteria, and `Depends on #N`.
5. The [`reference/`](./reference/) folder holds the relay's own docs/examples, mirrored verbatim from the upstream **MIT**-licensed repo for offline ground-truth (attribution in [`reference/SOURCE.md`](./reference/SOURCE.md); regenerate with [`scripts/fetch-reference.sh`](./scripts/fetch-reference.sh)). Filenames mirror their repo paths (e.g. `docs_md_api_entity.md`, `docs_examples_dnd5e-examples.json`).

## Decision records & specs
- [`decisions/`](./decisions/) — **architecture & management** decisions as ADRs, numbered `NNNN-*.md`. Each captures one decision (status · context · decision · consequences) and is immutable once **Accepted**; a later ADR **supersedes** an earlier one by reference, so history is never edited in place. Index + convention: [`decisions/README.md`](./decisions/README.md).
- [`specs/`](./specs/) — **technical** component specs, numbered `NNNN-*.md` — the internal contracts the code implements (relay client, tool surface, dnd5e NPC builder). Index: [`specs/README.md`](./specs/README.md).

The top-level docs (`IMPLEMENTATION_PLAN.md`, `EXECUTION_STRATEGY.md`, `API_SPEC.md`) are the elaborated references; the ADRs are the atomic, supersede-able record of *why*.

## Getting a properly-scoped API key (do this before any write works)

A read-only key returns `403 API key lacks required scope: entity:write`. You cannot add scopes to an existing key value — mint a new one that includes all five v1 scopes:

- **Dashboard:** log in at `https://foundryrestapi.com` → **API Keys** → **Create Scoped Key** → tick `clients:read`, `search`, `entity:read`, `entity:write`, `structure:write` → copy the key (shown once).
- **Programmatic (device flow):** `POST /auth/key-request` with `{"appName":"foundry-mcp","scopes":["clients:read","search","entity:read","entity:write","structure:write"]}` → open the returned `approvalUrl` → poll `GET /auth/key-request/:code/status` until `approved` (the response then includes `apiKey`).

The known target world for this project is **"Wilds Beyond the Witchlight"**, `clientId` `fvtt_8bfa06d76c0c1ac5` (dnd5e 5.2.2, Foundry v13.351).
