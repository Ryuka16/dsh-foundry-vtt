# 9. Trunk-based: one short-lived branch per work-stream

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
Parallel agents need to avoid stepping on each other. Options weighed: one branch for the whole project (serializes, mega-PR, conflict-prone), branch per phase (phases contain parallel tickets → intra-phase conflicts, long-lived), branch per work-stream.

## Decision
**Trunk-based with one short-lived branch per work-stream** off `main`; **foundation merged first**. Parallel agents work in **git worktrees**. Eliminate the only shared-file conflict by **pre-stubbing the registry** and giving **one file per stream**. Gate merges on **CI (build+test)** and an **Opus review** for correctness-critical PRs (#3, #12).

## Consequences
- (+) Small reviewable PRs, near-zero conflicts, clear history.
- (−) More branches/PRs to manage; requires the registry-stub discipline.
- Rejected: single mega-branch; per-phase branches.

## References
- `../EXECUTION_STRATEGY.md` §3
