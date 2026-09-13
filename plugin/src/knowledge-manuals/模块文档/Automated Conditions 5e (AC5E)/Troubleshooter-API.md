# Troubleshooter API

Applies to version: `13.5250.6`

AC5e exposes troubleshooting helpers under:

```js
ac5e.troubleshooter
```

Methods:

- `snapshot({ includeLint = true, lintOptions = {} } = {})` -> `object`
- `exportSnapshot({ filename = null } = {})` -> `object`
- `importSnapshot(file = null)` -> `Promise<object | null>`
- `lintFlags({ log = true, includeDisabled = true, includeSceneActors = true, includeWorldItems = true } = {})` -> `object`

## snapshot

```js
const snap = ac5e.troubleshooter.snapshot();
console.log(snap);
```

Snapshot contains:

- user metadata
- Foundry/system/module versions
- AC5e settings
- optional lint report
- active scene/grid/environment details

## exportSnapshot

```js
ac5e.troubleshooter.exportSnapshot();
ac5e.troubleshooter.exportSnapshot({ filename: "ac5e-debug-myworld.json" });
```

Creates and downloads a JSON snapshot file.

Notes:

- `exportSnapshot()` includes lint data by default at `snapshot.ac5e.lint` because it uses `snapshot({ includeLint: true })`.
- If you need a snapshot without lint, call:

```js
const snapshotNoLint = ac5e.troubleshooter.snapshot({ includeLint: false });
```

## importSnapshot

```js
const imported = await ac5e.troubleshooter.importSnapshot();
```

Behavior:

- If no `file` is passed, opens a file picker.
- Reads and parses JSON.
- Logs parsed object to console.
- Returns parsed object (or `null` if canceled).

## lintFlags

```js
const report = ac5e.troubleshooter.lintFlags();
console.log(report.summary);
```

Common options:

```js
ac5e.troubleshooter.lintFlags({
  log: false,
  includeDisabled: true,
  includeSceneActors: true,
  includeWorldItems: true
});
```

The lint report includes findings for malformed/unknown flag keywords, risky values, and source metadata (actor/item/effect/change).

## Typical workflow

```js
const lint = ac5e.troubleshooter.lintFlags({ log: false });
const snapshot = ac5e.troubleshooter.exportSnapshot({ filename: "ac5e-support.json" });
({ lintSummary: lint.summary, generatedAt: snapshot.generatedAt });
```
