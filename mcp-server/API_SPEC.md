# Foundry REST API Relay — Grounded Spec

Authoritative reference for implementing the MCP server. Sourced from `github.com/ThreeHats/foundryvtt-rest-api-relay@main` (latest **v3.3.0**, 2026-06-03) — raw docs are mirrored in [`reference/`](./reference/).

**Legend:** 🟢 = in v1 scope · ⚪ = future phase. `in`: q=query, b=body, qb=query-or-body, h=header, p=path. Auth + transport conventions in §A apply to every endpoint.

---

## A. Cross-cutting conventions (read first)

### Auth & targeting
- **API key:** header **`x-api-key: <scoped-key>`** on every data request. Long-lived; no per-request login for data calls. (Dashboard/`/auth/*` management uses `Authorization: Bearer <sessionToken>` instead — not needed by this server.)
- **`clientId` is a QUERY PARAM, not a header.** There is no `x-client-id` header anywhere. It selects which connected Foundry world the relay routes to. It is *optional* and auto-resolves: 1 world online → that one; 0 online → **404**; >1 online with an unscoped key → **400** listing the clients. A key can be bound to a `scopedClientId` (then the caller can't override).
- **`userId`** (optional, q or b) scopes to a Foundry user's permissions; **omit for GM-level access** (the normal mode for this server). Writes that pass a `userId` also require that user to OWN the target document.
- **Param duality:** most scalar params are accepted in **both** query and body. Convention to adopt: `clientId`/`userId` always in query; for GET/DELETE put other scalars in query; for POST/PUT put them in the JSON body; the big `data` object always in the body.

### Response envelope
Most JSON responses wrap the payload:
```
{ "type": "<operation>-result", "requestId": "<operation>_<epochMillis>", ...payload }
```
**The payload key is NOT consistent** — unwrap defensively (return the known key if present, else the whole object). Observed keys by op:
- `/create` → `uuid` (string) + `entity` (object)
- `/get` → `uuid` + `data` (object)
- `/update` → `uuid` + `entity` (**array**)
- `/delete` → `uuid` + `success:true`
- `/kill` → `results` (array)
- `/search` → `filter` + `results` (array)
- `/create-folder` → `data:{ id, uuid, name, type, parentFolder }`
- `/delete-folder` → `data:{ deleted, folderId, entitiesDeleted, foldersDeleted }`
- `/clients` → `{ clients:[...], total }` (**no** `type`/`requestId`)
- dnd5e/effects/scene/canvas/user → under `data`
- session endpoints → bare objects, no envelope (special-case them)

`requestId` reflects an internal REST→WS bridge; HTTP responses are already resolved (no polling needed), but some ops (screenshots, large uploads) are slow — use generous timeouts.

### Errors — KNOWN GAP
No shipped example contains a non-200 body, so the **error envelope shape is undocumented**. Implement defensively: branch on HTTP status, and also treat a 200 with `success:false` or a missing expected key as a failure. Status codes confirmed across docs:
| Code | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 400 | bad params; or `clientId` ambiguous (>1 client, unscoped key) — body lists clients |
| 401 | missing/invalid/expired `x-api-key` |
| 403 | scope check failed — literal: `API key lacks required scope: <scope>` |
| 404 | no client connected (clientId unresolvable); or entity/user not found |
| 410 | key-request exchange code reused |
| 429 | rate/quota exceeded |

### Base URLs
- Public relay REST: `https://foundryrestapi.com` · WS: `wss://foundryrestapi.com`
- Self-host: `http://localhost:3010` · `ws://localhost:3010` (default `PORT=3010`)
- (Legacy v2 host, still in some docs: `https://foundryvtt-rest-api-relay.fly.dev`)

### Rate limits (public host)
Free tier marketed at 100 req/month (server-configured `MONTHLY_REQUEST_LIMIT`, docs also show 5000); 1000/day; per-key burst `PER_MINUTE_REQUEST_LIMIT=300`. Paid ($5/mo) = unlimited. Self-host = unlimited by default.

---

## B. v1 endpoints (IN SCOPE) — full detail

### 🟢 Clients — `clients:read`
```
GET /clients | params: (x-api-key header only) | → { clients:[ {clientId, isOnline, worldId, worldTitle, foundryVersion, systemId, systemTitle, systemVersion, customName?} ], total }
```
`clientId` format `fvtt_<16hex>`. Includes offline known-clients (each has `isOnline`). Liveness-only public probe: `GET /api/clients/:clientId/active` → `{active:bool}`.

### 🟢 Search — `search`
```
GET /search | params: clientId:q, query:string:q, filter:string:q, excludeCompendiums:bool:q, limit:number:q(def 200,max 500), minified:bool:q, ownedByUserId:string:q, userId:qb | → { filter, results:[...] }
```
- `filter` simple: `"Actor"`. Compound: `"documentType:Item,subType:weapon"` (keys: documentType, subType, folder, package, resultType).
- Result object fields: `documentType, folder, id, name, package, packageName, subType, uuid, icon, journalLink (@UUID[...]{name}), tagline, formattedMatch, resultType (e.g. WorldEntity)`.
- `minified:true` → only uuid/id/name/img/documentType. Compendiums included unless `excludeCompendiums`.
- UUID format: `<DocType>.<id>` (e.g. `Actor.2midVQ1laJFMrN4D`); embedded: `Actor.<id>.Item.<id>`; compendium: `Compendium.<pkg>.<name>.<DocType>.<id>`.
- **Primary way to turn a name into a UUID** for the read/update/delete tools.

### 🟢 Entity — `entity:read` / `entity:write`
```
GET    /get      | entity:read  | clientId:q, uuid:q, selected:bool:qb, actor:bool:q, userId:qb | → uuid + data(object). Target by uuid OR selected=true (current Foundry selection). actor=true → return the Actor of a selected token.
POST   /create   | entity:write | clientId:q, userId:qb | body: entityType:string(R), data:object(R), folder:string(o, folder UUID), keepId:bool(o), override:bool(o) | → uuid + entity
PUT    /update   | entity:write | clientId:q, uuid:q, selected:bool:qb, actor:bool:q, userId:qb | body: data:object(R, partial) | → uuid + entity[]
DELETE /delete   | entity:write | clientId:q, uuid:q, selected:bool:qb, userId:qb | → uuid + success
POST   /give     | entity:write | clientId:q, selected:qb, userId:qb | body: fromUuid?, toUuid?, itemUuid? | itemName?, quantity? | transfer item between actors
POST   /remove   | entity:write | clientId:q, selected:qb, userId:qb | body: actorUuid?, itemUuid? | itemName?, quantity? | remove item from actor
POST   /increase | entity:write | clientId:q, uuid:q, selected:qb, userId:qb | body: attribute:string(R, dotted path), amount:number(R) | bump numeric attribute up
POST   /decrease | entity:write | clientId:q, uuid:q, selected:qb, userId:qb | body: attribute:string(R), amount:number(R) | bump numeric attribute down
POST   /kill     | entity:write | clientId:q, uuid:q, selected:qb, userId:qb | set HP to 0
```
`entityType` ∈ `Actor, Item, Scene, JournalEntry, RollTable, Cards, Macro, Playlist, …` (any Foundry document class). `data` is a **raw Foundry document** for that class/system — the relay does NOT define a slim schema; validity is enforced by Foundry on the target world.

Verbatim examples:
```jsonc
// PUT /update?clientId=...&uuid=Actor.u3iSEGYdk5UNZy7X   (partial — only changed fields)
{ "data": { "name": "Updated Test Actor" } }
// POST /give?clientId=...
{ "toUuid": "Actor.u3iSEGYdk5UNZy7X", "itemUuid": "Item.D93PIxs5khbE6wqm", "quantity": 1 }
// POST /increase?clientId=...&uuid=Actor.u3iSEGYdk5UNZy7X
{ "attribute": "prototypeToken.height", "amount": 5 }
```

### 🟢 Structure (folders) — `structure:write` (in scope) / `structure:read` (companion, deferred)
```
POST   /create-folder | structure:write | name:qb(R), folderType:qb(R), parentFolderId:qb(o), clientId:q, userId:qb | → data:{ id, uuid, name, type, parentFolder }
DELETE /delete-folder | structure:write | folderId:qb(R), deleteAll:bool:qb(o), clientId:q, userId:qb | → data:{ deleted, folderId, entitiesDeleted, foldersDeleted }
GET    /structure     | structure:read  | clientId:q, includeEntityData:bool:q, path:q, recursive:bool:q, recursiveDepth:number:q(def 5), types:q, userId:qb | folder & compendium tree   ⚪ needs structure:read
GET    /get-folder    | structure:read  | name:qb(R), clientId:q, userId:qb | one folder by name        ⚪ needs structure:read
GET    /contents/:path | (deprecated)   | → error pointing to /structure
```
`folderType` = the document class the folder holds (`Actor`, `Scene`, `Item`, …). Structure examples pass params via **query** even for POST/DELETE. Capture the returned folder `uuid` and pass it as `folder` to `POST /create` to file new content.

---

## C. The dnd5e creature-creation reality (highest-value, read carefully)

**There is NO `create-actor`/`create-creature` endpoint, and NO actor-creation example anywhere in the relay docs.** Creatures are made with the generic **`POST /create`** (`entityType:"Actor"`, `data.type:"npc"`). The `data.system` object must conform to the **dnd5e system's NPC data model on the target world (dnd5e v5.2.2 / Foundry v13)** — Foundry validates it.

**Critical version caveat:** the relay's recorded examples were captured on **dnd5e 4.3.8 / Foundry 12.331**, but the target world is **dnd5e 5.2.2 / Foundry v13.351**. Field paths like `system.abilities.*`, `system.attributes.hp`, `system.details.cr` are stable, **but the weapon/attack & damage model changed in dnd5e 4.x+ (the "activities" model)** and differs from older `system.damage.parts`. **Do not trust a hand-authored attack schema.** The reliable procedure:

> **Mirror-from-live:** before authoring, `GET /get` (or `search` then `get`) a real v5.2.2 NPC — e.g. have the GM drag an SRD monster into the world and select it (`GET /get?selected=true&actor=true`), or read a Compendium monster by UUID. Capture its `data.system` + `items[]` (attacks/features are embedded **Item** docs of `type:"weapon"`/`"feat"`) and use that exact layout as the template. The `create_creature` helper builds against the *observed* schema, not a guessed one.

Illustrative NPC `POST /create` skeleton (top-level shape is correct; treat `items[]` attack internals as **TO BE VERIFIED** against a live v5.2.2 read):
```jsonc
{
  "entityType": "Actor",
  "data": {
    "name": "Jabberwocky",
    "type": "npc",
    "img": "icons/creatures/...",
    "system": {
      "abilities": { "str": {"value":19}, "dex": {"value":14}, "con": {"value":17},
                     "int": {"value":7}, "wis": {"value":12}, "cha": {"value":10} },
      "attributes": {
        "ac": { "flat": 15, "calc": "natural" },
        "hp": { "value": 90, "max": 90, "formula": "12d10+24" },
        "movement": { "walk": 40, "fly": 60, "units": "ft" },
        "senses": { "darkvision": 60, "units": "ft" }
      },
      "details": { "cr": 6, "type": {"value":"monstrosity"}, "alignment": "Chaotic Evil",
                   "source": {"custom":"Witchlight Homebrew"}, "biography": {"value":"<p>…</p>"} },
      "traits": { "size": "huge", "languages": {"value":[]},
                  "dr": {"value":[]}, "di": {"value":[]}, "dv": {"value":[]}, "ci": {"value":[]} }
    },
    "items": [ /* embedded weapon/feat Items — schema VERIFIED from a live v5.2.2 NPC */ ],
    "prototypeToken": { "name": "Jabberwocky", "actorLink": false, "disposition": -1 }
  }
}
```
**Adding an attack to an EXISTING actor** within v1 scope: include it in `items[]` at creation, or `PUT /update` the actor's full `items` array. (The dnd5e `/give` endpoint only moves *existing* items and is out of v1 scope anyway.)

---

## D. Future-phase endpoints (OUT of v1 scope) — inventory

Each group = one future phase = one added scope + one tool module. Detail lives in `reference/`; summarized here so the plan can resume without re-research.

### ⚪ DnD5e helpers — scope `dnd5e`
`GET /dnd5e/get-actor-details` · `POST /dnd5e/{modify-item-charges, short-rest, long-rest, skill-check, ability-save, ability-check, death-save, modify-experience, break-concentration, concentration-save, equip-item, attune-item, transfer-currency, modify-currency, prepare-spell, use-ability, use-feature, use-spell, use-item}` · `GET /dnd5e/concentration`. All target existing actors by `actorUuid`/`actorName`. Roll endpoints take `advantage`/`disadvantage`/`bonus`/`createChatMessage`.

### ⚪ Sheet — scope `sheet:read`
`GET /sheet` (uuid|selected, format/quality/scale) → **binary PNG/JPEG** (not JSON). Emit as MCP image content.

### ⚪ Effects — `effects:read`/`effects:write`
`GET /effects` (uuid), `GET /effects/list` (valid statusIds), `POST /effects` (add `statusId` like `"poisoned"` or custom `effectData{name,icon,changes[]}`), `DELETE /effects` (effectId|statusId). (Note: can be partially done in v1 via `/update` of the actor's `effects[]`.)

### ⚪ Encounter/combat — `encounter:read`/`encounter:manage`
`GET /encounters` · `POST /{start-encounter, next-turn, next-round, last-turn, last-round, end-encounter, add-to-encounter, remove-from-encounter}`. `encounter` param defaults to active combat. Live combat events are **WebSocket-only** (`/ws/api`, `subscribe-combat-events`).

### ⚪ Chat — `chat:read`/`chat:write`
`GET /chat`, `POST /chat` (body `content`(R), whisper/speaker/alias/chatType/flavor), `DELETE /chat/:messageId`, `DELETE /chat` (flush, GM). `GET /chat/subscribe` = SSE (scope `events:subscribe`).

### ⚪ Roll — `roll:read`/`roll:execute`
`GET /rolls`, `GET /lastroll`, `POST /roll` (body `formula`(R), flavor, createChatMessage, speaker, whisper). `GET /rolls/subscribe` = SSE.

### ⚪ Macro — `macro:list`/`macro:execute`/`macro:write`
`GET /macros`, `POST /macro/:uuid/execute` (body `args`). `macro:execute` also gated by server `ALLOW_MACRO_EXECUTE`.

### ⚪ Playlist — `playlist:control`
`GET /playlists`, `POST /playlist/{play,stop,next,volume}`, `POST /play-sound`, `POST /stop-sound`.

### ⚪ Scene — `scene:read`/`scene:write`
`GET /scene`, `POST /scene`, `PUT /scene`, `DELETE /scene`, `POST /switch-scene`, `GET /scene/image` (**raw binary** screenshot), `GET /scene/image/raw` (image inside JSON envelope). NB: Scene *documents* are creatable via v1 `entity:write`; only switching/screenshots need `scene:*`.

### ⚪ Canvas — `canvas:read`/`canvas:write`
`GET|POST|PUT|DELETE /canvas/:documentType` (`documentType` ∈ tokens, tiles, drawings, lights, sounds, notes, templates, walls, regions), `GET /measure-distance`, `POST /move-token` (x,y,uuid|name,waypoints,animate). Placing tokens on a scene = `canvas:write`.

### ⚪ User — `user:read`/`user:write`
`GET /users`, `GET /user`, `POST /user` (name(R),role 0–4,password), `PUT /user`, `DELETE /user`. GM-only.

### ⚪ Utility / World — `entity:read` + `world:info` + `execute-js`
`POST /select`, `GET /selected`, `GET /players` (these use `entity:read` — **available in v1!**), `GET /world-info` (`world:info`), `POST /execute-js` (`execute-js` — arbitrary code; gate behind explicit opt-in env, highest risk).

### ⚪ FileSystem — `file:read`/`file:write`
`GET /file-system`, `GET /download` (`format=binary|base64`; base64 returns a `data:<mime>;base64,…` URI), `POST /upload` (`fileData` base64 data-URI, 250 MB; metadata in query). No multipart.

### ⚪ Session — `session:manage`
`POST /session-handshake`, `POST /start-session`, `DELETE /end-session`, `GET /session` — headless Foundry (puppeteer) lifecycle. Bespoke headers (`x-foundry-url`, `x-username`, `x-world-name`), bare (un-enveloped) responses.

### ⚪ Streaming — `events:subscribe`
SSE: `GET /{hooks,encounters,actor,scene,chat,rolls}/subscribe`. Named events; `connected` first, then e.g. `roll`, `chat-create|update|delete`, `hook-event`. Header auth needs a fetch-based SSE client (native browser `EventSource` can't set headers). WS alt: `/ws/api` with `{type:"auth",token}` then `{type:"subscribe",channel}`. MCP tools are request/response → surface via notifications/resources or a polling "get latest" tool; not a normal tool call.

### ⚪ Auth/management — Bearer session (not `x-api-key`)
`POST /auth/{register,login,logout,key-request,key-request/exchange}`, `GET /auth/key-request/:code/status`, `POST /auth/api-keys`, etc. Only relevant if the server ever automates key minting; otherwise users mint keys in the dashboard.

---

## E. Complete scope vocabulary (32 scopes)

`entity:read`, `entity:write`, `roll:read`, `roll:execute`, `chat:read`, `chat:write`, `encounter:read`, `encounter:manage`, `macro:list`, `macro:execute`, `macro:write`, `scene:read`, `scene:write`, `canvas:read`, `canvas:write`, `effects:read`, `effects:write`, `user:read`, `user:write`, `file:read`, `file:write`, `playlist:control`, `world:info`, `clients:read`, `sheet:read`, `session:manage`, `events:subscribe`, `execute-js`, `search`, `dnd5e`, `structure:read`, `structure:write`.

New keys default to a read-only set; scoped keys must list each scope explicitly. `execute-js` and `macro:execute` are additionally gated by server env flags and are GM-sensitive.

**v1 key must include:** `clients:read`, `search`, `entity:read`, `entity:write`, `structure:write`.
