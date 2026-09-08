# Spec 0001 — Relay HTTP client (`callRelay`)

- **Status:** Living · **Implements:** issue #3 · **Decisions:** [0006](../decisions/0006-config-and-targeting.md)

> This spec is the **technical** home for envelope-unwrap and error-mapping mechanics (an implementation concern, not an architecture decision).

The single function every tool uses to reach the relay.

## Signature
`callRelay(method, path, { query?, body?, timeoutMs? }) -> Promise<unwrapped payload>`

## Behavior
- **Base URL:** `config.relayUrl` (default `https://foundryrestapi.com`).
- **Headers:** always `x-api-key: <config.apiKey>`; `Content-Type: application/json` when a body is sent.
- **Query:** always append `clientId` (arg → `config.clientId`) and `userId` (if set). Never send these as headers.
- **Body:** JSON-serialize for POST/PUT.
- **Timeout:** default 30s via `AbortController`; allow per-call override for slow ops.

## Response unwrap (`envelope.ts`)
Relay wraps as `{ type:"<op>-result", requestId, ...payload }`. Return the first present known key (`data`, `entity`, `results`, `uuid`, `clients`), else the whole object. Special-case `/clients` (no `type`) and session endpoints (bare objects).

## Errors (`errors.ts`)
`RelayError(status, code, message, raw)`. Mapping:
| Status | Message intent |
|---|---|
| 401 | invalid/expired `x-api-key` |
| 403 | parse `lacks required scope: X` → "mint a key with scope X (README)" |
| 400/404 (clientId) | "no/ambiguous world; set FOUNDRY_CLIENT_ID or check the world is online" |
| 429 | rate/quota exceeded |
Also treat HTTP 200 with `success:false` as an error. Tools convert `RelayError` into an `isError` result (do not throw across the MCP boundary).

## Tests
Mocked `fetch`: header/query assembly, body serialization, envelope unwrap per op, each status → correct `RelayError`.
