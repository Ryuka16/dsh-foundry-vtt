# Cadence API

Applies to version: `13.5250.6`

AC5e exposes cadence helpers under:

```js
ac5e.cadence
```

Methods:

- `reset({ combat, combatUuid } = {})` -> `Promise<boolean>`
- `inspect({ combat, combatUuid } = {})` -> `object | null`

## Overview

Cadence state (`oncePerTurn`, `oncePerRound`, `oncePerCombat`) is stored on the combat document flag:

```txt
flags.automated-conditions-5e.cadence
```

GM writes are authoritative. Player writes route through AC5e GM query handlers.

## reset

```js
await ac5e.cadence.reset();
```

Optional target:

```js
await ac5e.cadence.reset({ combatUuid: "Combat.XYZ..." });
```

Behavior:

- Clears `used.oncePerTurn`, `used.oncePerRound`, `used.oncePerCombat`.
- Updates `last` from the target combat's current `round`, `turn`, `combatantId`.
- Updates `updatedAt`.
- Returns `true` when the write succeeds and is visible locally.

## inspect

```js
const data = ac5e.cadence.inspect();
console.log(data);
```

Typical shape:

```js
{
  combatUuid,
  round,
  turn,
  combatantId,
  cadence // raw cadence flag object from flags.automated-conditions-5e.cadence
}
```

Returns `null` if the target combat cannot be resolved.

## Common checks

```js
const before = ac5e.cadence.inspect();
const ok = await ac5e.cadence.reset();
const after = ac5e.cadence.inspect();
({ ok, before: before?.cadence?.used, after: after?.cadence?.used });
```

## Notes

- Deleting a combat deletes its cadence automatically because cadence is on the combat document.
- Out of combat, `oncePerTurn` and `oncePerRound` are not blocked by cadence state.
