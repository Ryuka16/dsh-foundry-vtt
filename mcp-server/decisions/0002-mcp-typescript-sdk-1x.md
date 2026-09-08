# 2. Build on `@modelcontextprotocol/sdk` 1.x (defer V2)

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
Two SDK lines exist: the shipped `@modelcontextprotocol/sdk` (1.x, stable) and an unreleased V2 (`@modelcontextprotocol/server`, ~mid-2026) with renamed imports and `zod/v4`.

## Decision
Target **`@modelcontextprotocol/sdk@^1.29`** with the **stdio** transport, Node ≥ 18, ESM. Use `zod` for input schemas (raw shape objects, not `z.object()`).

## Consequences
- (+) Stable API that current MCP clients expect.
- (−) A future V2 migration (package name + import paths + zod import style) — mechanical; `McpServer`/`registerTool`/annotations concepts carry over.

## References
- `../EXECUTION_STRATEGY.md`, `specs/0002-tool-surface.md`
