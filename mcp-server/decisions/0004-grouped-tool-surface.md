# 4. ~9 single-purpose tools, not per-endpoint

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
The relay has ~80 endpoints. Research is consistent: LLM tool-selection reliability degrades past ~30–40 tools, and every registered tool is a permanent context-window cost.

## Decision
Expose a **small set (~9) of mostly single-purpose tools**. Use **façade tools with an `action` enum only where operations are homogeneous** (`foundry_modify_actor`, `foundry_manage_folder`). Reject one-tool-per-endpoint.

## Consequences
- (+) Small, reliable, cheap-to-load surface; precise annotations on the single-purpose tools.
- (−) Façades need per-action runtime validation and carry coarser annotations.

## References
- `../IMPLEMENTATION_PLAN.md` §Tool surface, `specs/0002-tool-surface.md`
