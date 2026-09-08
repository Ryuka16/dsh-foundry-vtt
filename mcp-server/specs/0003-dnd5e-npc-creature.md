# Spec 0003 — dnd5e NPC creature builder

- **Status:** Living (pending #11 verification) · **Implements:** issues #11, #12 · **Decisions:** [0005](../decisions/0005-creatures-via-generic-create.md)

`foundry_create_creature` takes a friendly NPC description and assembles a dnd5e **v5.2.2** Actor document submitted via `POST /create`.

## Input (friendly schema)
`name`, `size`, `type`, `cr`, `ac`, `hp{value,max,formula?}`, `abilities{str,dex,con,int,wis,cha}`, `speeds{walk,fly,swim,…}`, `senses?`, `languages?`, `alignment?`, `biography?`, `attacks[]{name, toHit|abilityMod, reach|range, damage[], damageType}`, `features[]{name, description}`, `folder?`.

## Mapping → `data` (top-level shape verified; `items[]` attack internals **TBD by #11**)
- `type:"npc"`; abilities → `system.abilities.<abil>.value`; `system.attributes.hp{value,max,formula}`, `system.attributes.ac{flat,calc:"natural"}`; `system.details.cr`/`.type`/`.alignment`/`.biography`; `system.traits.size`/`.languages`; `system.attributes.movement`/`.senses`.
- `attacks[]`/`features[]` → embedded **Item** docs (`type:"weapon"`/`"feat"`) in `items[]`.
- `prototypeToken{ name, disposition:-1, actorLink:false }`.

## Hard requirement — mirror-from-live (issue #11)
Before authoring attacks, read a real v5.2.2 NPC (`foundry_get_entity` with `selected:true, actor:true`, or a Compendium UUID). The dnd5e **"activities"** damage model (4.x+) differs from the relay's 4.3.8 examples — capture the exact weapon/activities layout in `../reference/dnd5e-5.2.2-npc-schema.md` and build against it. **Do not guess the attack schema.**

## Acceptance
Create the Session-9 **Jabberwocky** and **Hagspawn son** (lvl-7 barbarian) as NPCs that open in Foundry with correct HP/AC/CR and a functioning attack.
