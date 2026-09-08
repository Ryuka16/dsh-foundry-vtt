# 7. Model/effort: Sonnet workhorse, Opus for the hard parts

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
Tickets vary from mechanical (scaffold) to ambiguous/high-blast-radius (relay core, dnd5e schema). Running everything on the top model is wasteful; running everything on a small model risks the hard parts.

## Decision
**Sonnet 4.6 (medium effort)** is the default workhorse. **Opus 4.8 (high/xhigh)** is reserved for: orchestration & PR review, the `callRelay` core (#3), the dnd5e schema **spike (#11, xhigh)**, and the **creature builder (#12)**. Haiku 4.5 optional for pure boilerplate.

## Consequences
- (+) Spend is concentrated where ambiguity and blast radius live.
- (−) Mixed-model runs need the orchestrator to set per-agent model/effort.

## References
- `../EXECUTION_STRATEGY.md` §1
