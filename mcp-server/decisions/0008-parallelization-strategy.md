# 8. Sequential foundation → parallel streams → convergence

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
The shared core (config, `callRelay`, tool registry) is consumed by every tool. The tool modules are mutually independent. The dnd5e schema spike has no code dependency.

## Decision
Run the **foundation (#1–#4) sequentially first** (one agent, merged to `main`), then **fan out the tool streams in parallel** (#5, #6, #7–9, #10, #13), then a **sequential convergence** (#14 hardening → #15 release). Run the **schema spike (#11) in parallel from the start** to de-risk early.

## Consequences
- (+) Maximizes parallelism after a small serial gate; biggest unknown resolved up front.
- (−) Foundation is a hard blocker; its quality gates the rest.

## References
- `../EXECUTION_STRATEGY.md` §2
