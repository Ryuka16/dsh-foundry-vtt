# Architecture Decision Records (ADRs)

Numbered, append-only records of the decisions behind this project. The format is intentionally lightweight (Nygard-style).

## Convention
- Filenames are `NNNN-kebab-title.md`, zero-padded, monotonically increasing. Never renumber.
- One decision per file. Keep it short; link to the elaborated docs (`../IMPLEMENTATION_PLAN.md`, `../EXECUTION_STRATEGY.md`, `../API_SPEC.md`) for detail.
- **Statuses:** `Proposed` → `Accepted` → (`Superseded` | `Deprecated`).
- ADRs are **immutable once Accepted**. To change a decision, write a *new* ADR that sets `Supersedes: NNNN`, and edit only the old ADR's status line to `Superseded by: MMMM`. History is never rewritten.
- Copy [`0000-template.md`](./0000-template.md) to start a new one.

These records are **architecture & management** decisions. Purely **technical** contracts live in [`../specs/`](../specs/); where a decision carries technical detail (e.g. error handling), the *decision* is recorded here and the *mechanics* in the matching spec.

## Index
| # | Decision (architecture / management) | Status |
|---|---|---|
| [0001](./0001-wrap-relay-as-mcp-server.md) | Wrap the ThreeHats relay as a TypeScript MCP server | Accepted |
| [0002](./0002-mcp-typescript-sdk-1x.md) | Build on `@modelcontextprotocol/sdk` 1.x (defer V2) | Accepted |
| [0003](./0003-v1-scope-five-scopes.md) | V1 scope = five scopes (content authoring) | Accepted |
| [0004](./0004-grouped-tool-surface.md) | ~9 single-purpose tools, not per-endpoint | Accepted |
| [0005](./0005-creatures-via-generic-create.md) | Creatures via generic `POST /create` + mirror-from-live | Accepted |
| [0006](./0006-config-and-targeting.md) | Configuration & secrets model | Accepted |
| [0007](./0007-model-effort-allocation.md) | Model/effort: Sonnet workhorse, Opus for hard parts | Accepted |
| [0008](./0008-parallelization-strategy.md) | Sequential foundation → parallel streams → convergence | Accepted |
| [0009](./0009-branching-trunk-per-stream.md) | Trunk-based, one branch per work-stream | Accepted |
| [0010](./0010-vendor-reference-docs-mit.md) | Vendor upstream MIT docs into `reference/` | Accepted |
