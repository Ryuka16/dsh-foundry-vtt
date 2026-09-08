# 1. Wrap the ThreeHats relay as a TypeScript MCP server

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
Goal: let an LLM author Foundry VTT content (above all, dnd5e creatures). Foundry exposes data through the ThreeHats `foundryvtt-rest-api-relay` (a Foundry-side module connects out to a relay; external clients call REST). Existing Foundry MCP servers all ship their own Foundry module + socket.

## Decision
Build a thin **TypeScript, stdio MCP server** that is purely a *client* of the relay — no custom Foundry-side code of our own.

## Consequences
- (+) No Foundry module to install/maintain; works through the hosted relay; clean HTTP surface that maps to tools.
- (−) Bound by what the relay exposes, its scopes, rate limits, and availability.
- Differentiator vs prior art (which embeds a module).

## References
- `../README.md`, `../IMPLEMENTATION_PLAN.md`
