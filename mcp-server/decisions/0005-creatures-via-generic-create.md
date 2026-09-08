# 5. Creatures via generic `POST /create` + mirror-from-live

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded by:** —

## Context
There is **no** dnd5e create-actor endpoint. Creatures are Foundry Actor documents built for the target system (dnd5e **v5.2.2**). The relay's recorded examples are dnd5e **4.3.8**, and the weapon/damage ("activities") model changed in 4.x+ — a hand-authored attack schema is likely wrong.

## Decision
Create creatures with the generic **`POST /create`** (`entityType:"Actor"`, `data.type:"npc"`). **Mirror-from-live first:** read a real v5.2.2 NPC (spike #11), capture the exact `system` + embedded weapon schema, and build `foundry_create_creature` against the verified shape.

## Consequences
- (+) Eliminates the version-drift risk before writing creature code.
- (−) Adds a research spike; the creature builder depends on it.

## References
- `../API_SPEC.md` §C, `specs/0003-dnd5e-npc-creature.md`, issues #11 / #12
