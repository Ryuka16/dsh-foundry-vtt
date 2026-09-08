# 10. Vendor upstream MIT docs into `reference/`

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
The build should not drift on a moving upstream or require network access mid-implementation. The upstream relay repo is **MIT**-licensed.

## Decision
**Mirror** the relay's docs/examples verbatim into `reference/` for offline ground-truth, with attribution in `reference/SOURCE.md`. Regenerate via `scripts/fetch-reference.sh`.

## Consequences
- (+) Stable, offline spec; license respected.
- (−) Mirror can age — regenerate when chasing an upstream change.

## References
- `../reference/SOURCE.md`
