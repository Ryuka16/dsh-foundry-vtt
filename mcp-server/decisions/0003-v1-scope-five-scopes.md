# 3. V1 scope = five scopes (content authoring)

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
The relay exposes ~80 endpoints across 32 scopes. V1 needs a coherent, valuable first slice; the driving use case is authoring content / creatures.

## Decision
V1 is limited to **`clients:read`, `search`, `entity:read`, `entity:write`, `structure:write`**. All other groups (rolls, chat, combat, scenes, canvas, effects, files, users, macro-exec, streaming) are explicitly **out of scope** and tracked as future phases.

## Consequences
- (+) Delivers creature creation end-to-end with a tiny surface.
- (−) No dice/chat/combat in V1. `structure:read` deferred → can create folders but not enumerate existing ones.
- Each future group unlocks by adding one scope + one tool module.

## References
- `../API_SPEC.md` §E, GitHub milestone `V1 — Content Authoring`
