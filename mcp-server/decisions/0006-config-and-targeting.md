# 6. Configuration & secrets model

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
The relay authenticates with a static API key and routes to a world via a client id. The MCP server must hold secrets safely and target the right world.

## Decision
Read config from **env**: `FOUNDRY_API_KEY` (required), `FOUNDRY_RELAY_URL` (default `https://foundryrestapi.com`), `FOUNDRY_CLIENT_ID` (optional), `FOUNDRY_USER_ID` (optional, omit = GM). Send the key as the **`x-api-key` header**; send **`clientId`/`userId` as query params** (never headers — no `x-client-id` exists). Auto-resolve `clientId` when exactly one world is online. **Never** accept the API key as a tool argument.

## Consequences
- (+) Standard MCP config; the key never enters model context.
- (−) Multi-world setups must set `FOUNDRY_CLIENT_ID` explicitly.

## References
- `../README.md`, `specs/0001-relay-http-client.md`
