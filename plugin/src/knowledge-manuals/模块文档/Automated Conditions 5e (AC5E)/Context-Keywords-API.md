# Context Keywords API

Applies to version: `13.5250.6`

Related:
- `wiki/Usage-Rules-API.md` for `ac5e.usageRules` runtime/persistent rule registration.

AC5e exposes context keyword helpers under:

```js
ac5e.contextKeywords
ac5e.contextOverrideKeywords
```

Keywords evaluate into booleans and are injected into the AC5e evaluation sandbox.

## `ac5e.contextKeywords` methods

- `register({ key, expression | evaluate, name })` -> `key | null`
- `remove(key)` -> `boolean`
- `clear()` -> `void`
- `list({ source = "all" } = {})` -> `Array`
- `canPersist()` -> `boolean`
- `isPlayerPersistEnabled()` -> `boolean`
- `setPlayerPersistEnabled(enabled)` -> `Promise<boolean>` (GM only)
- `registerPersistent({ key, expression, name })` -> `Promise<key | null>`
- `removePersistent(key)` -> `Promise<boolean>`
- `clearPersistent()` -> `Promise<boolean>`
- `reloadPersistent()` -> `Array`
- `applyToSandbox(sandbox)` -> `sandbox`

## Runtime registration

```js
ac5e.contextKeywords.register({
  key: "opponentIsBoss",
  expression: "Number(opponentActor?.details?.cr ?? 0) >= 10"
});
```

Function-based runtime keyword:

```js
ac5e.contextKeywords.register({
  key: "rollingIsBloodied",
  evaluate: (sandbox) => {
    const hp = Number(sandbox.rollingActor?.attributes?.hp?.value ?? 0);
    const max = Number(sandbox.rollingActor?.attributes?.hp?.effectiveMax ?? 0);
    return max > 0 && hp <= Math.floor(max / 2);
  }
});
```

## Proxy shorthand

```js
// Baseline registration
ac5e.contextKeywords.register({
  key: "opponentIsBoss",
  expression: "Number(opponentActor?.details?.cr ?? 0) >= 10"
});

// Temporary override for a special table rule:
// treat enemies as "boss" when the rolling actor is a Captain.
ac5e.contextOverrideKeywords.opponentIsBoss = (sandbox) => {
  const baseBoss = Number(sandbox.opponentActor?.details?.cr ?? 0) >= 10;
  const isCaptain = String(sandbox.rollingActor?.name ?? "").includes("Captain");
  return baseBoss || isCaptain;
};

// Remove override and fall back to the registered baseline behavior.
delete ac5e.contextOverrideKeywords.opponentIsBoss;
```

## Persistent keywords

Persistent keywords are stored in module settings and replicated through GM-authorized updates.

```js
await ac5e.contextKeywords.registerPersistent({
  key: "isNight",
  expression: "canvas.scene.environment.darknessLevel > 0.5"
});
```

## List and inspect

```js
ac5e.contextKeywords.list(); // merged runtime + persistent
ac5e.contextKeywords.list({ source: "runtime" });
ac5e.contextKeywords.list({ source: "persistent" });
```

## Ready hook

Use the hook to register integrations:

```js
Hooks.on("ac5e.contextKeywordsReady", ({ contextKeywords, contextOverrideKeywords }) => {
  contextKeywords.register({
    key: "rollingIsPartyLead",
    expression: "rollingActor?.name === 'Alice'"
  });
});
```

## Notes

- Runtime entries can use `expression` or `evaluate`.
- Persistent entries accept expression-based definitions (serializable).
- If runtime and persistent share the same key, runtime takes precedence in merged listing/sandbox application.
- In AC5e flag sandbox usage, actor aliases are `rollingActor` and `opponentActor`.
