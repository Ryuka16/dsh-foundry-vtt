# Aeris Tokens

Dynamic movement range and path preview overlays for Foundry VTT. See exactly which tiles a token can reach as you drag, customise colors and hotkeys, and enjoy smooth, animated movement.

If you’d like to help fund future improvements, you can buy me a coffee - thank you for any support!

<a href='https://ko-fi.com/A0A41CU13I' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Feature Demo

![](assets/demo.mp4)

## Key Features

-   **Animated Movement**: Tokens jump to their target positions when dragged, with animations being synced across connected clients.
-   **Dynamic Tile Grid**: A BFS-generated grid responsively shows reachable tiles based on token speed. A hotkey can be used to increase the grid's size, and api is provided to dynamically change it.
-   **Square/Hex Support**: Both square and hex grids are fully supported, including all 4 variations of hex grids.
-   **Customisable Grid Colors**: Set your own grid colors; optionally show them to other users during movement.
-   **Live Path Preview**: While dragging, your current path is visually traced, updated in real-time, and shared with other clients.
-   **Optional Movement Sounds**: Play a sound on token move; use built-in or custom files.
-   **Performance Toggle**: Disable grid generation to improve performance on slower systems.

## How It Works

When a token is placed or moved, the module runs a **bucketed Dijkstra** (a cost-ordered BFS) to find all reachable grid tiles based on movement speed, token size, and collision rules. Because alternating diagonals can carry a non-unit cost, bucketing by cost guarantees each tile’s recorded distance is the minimum possible. To prevent unbounded searches, any raw movement speed over 24 tiles triggers a one-time warning and the search is capped at 24.

Accurately checking each tile for collisions could be prohibitively slow using Foundry's default approach. Foundry's built-in collision system is designed for large-scale checks like vision and light propagation, where evaluating all canvas walls makes sense. But for pathfinding, we only need to test whether movement from one tile to an adjacent tile is blocked - requiring a much faster, localized check.

---

### Fast Collision via Wall Index

Rather than asking Foundry to test every wall on each step, we **preload** all walls into a **spatial index** and then use `LocalSweepPolygon` to compute - and cache - the outcome of **tile-to-adjacent-tile** collision tests in a **navigation grid** (`NavGrid`):

1. **Spatial Wall Index**
   On startup (and whenever walls are created, moved, or deleted), we divide the map into grid-aligned cells and record exactly which wall segments intersect each cell.

2. **Local Collision Cache**
   For each cell, we run `LocalSweepPolygon.testCollision` against its neighboring cells - using only the small set of walls in those two cells - and record whether movement between them is blocked.

3. **Navigation Grid Storage**
   Those pass/fail results become the `connections` list in each `NavGrid` cell (a 2D array of `NavCell`), so at runtime you never re-run a polygon test - you simply look up whether two adjacent cells are connected.

4. **Incremental Updates**
   When a wall changes, we recompute only its affected cells (and their neighbors), keeping the grid fresh in milliseconds without rebuilding the entire map.

By front-loading collision work into this spatial index plus navigation grid, per-tile movement checks are reduced to O(1) lookups - delivering around **20× faster** adjacency tests than `token.checkCollision`. Global vision and lighting still use Foundry’s default system.

You can benchmark the improvement with:

```js
aerisTokens.benchmarkCollisionTest(_token, 10000, 100);
```

This will test 10,000 random movement directions from the token’s current position within a 100-pixel radius, comparing the results against `ClockwiseSweepPolgygon` and `token.checkCollision`.

---

### Painted Tiles and Movement Trails

As the user drags a token, a **movement trail** is dynamically constructed from the origin to the current tile under the cursor. This trail:

-   Always remains within the set of precomputed reachable tiles.
-   Enforces per-step collision checks against nearby walls.
-   Supports full backtracking - returning over previous tiles will rewind the trail.
-   Merges minor directional changes to simplify the visual representation.
-   Only permits diagonal movement when at least one of the adjacent cardinal directions is valid.

Internally, this system uses a local BFS to recompute the path from the trail’s last valid step to the current tile.

---

### Animation and Sync

-   Tokens animate like chess pieces: lift, slide, drop
-   Optional sounds play per tile moved
-   Movement visuals sync across clients using sockets

Settings allow customizing grid visuals, sounds, and logic.

## API Hooks

This module exposes extensible behavior through a series of hook calls. These are intended for **system developers**, **module authors**, or GMs who want to customize or override behaviors such as movement modes, range indicators, and grid-travel sounds.

If you're building a system and want to integrate with these APIs easily, consider cloning [`aeris-tokens-system-template`](https://gitlab.com/robxnlifts/aeris-tokens-system-template). It provides:

-   A minimal, typed integration layer
-   Examples of how to implement and respond to hooks
-   In built ci to more easily create releases

See the examples below for usage patterns.

---

### `aeris-tokens.getMovementModes`

Allows systems or modules to specify which movement modes (e.g. `"walk"`, `"fly"`, `"swim"`) are available for a given actor.

```ts
Hooks.on("aeris-tokens.getMovementModes", (actor: Actor, modes: string[]) => {
    // Add movement modes that should be available for this actor
    if (actor.system.attributes.movement.fly > 0) {
        modes.push("fly");
    }
});
```

#### Parameters:

-   `actor`: The `Actor` being queried.
-   `modes`: An empty array (`string[]`) you can push movement mode names into.

#### Notes:

-   This hook **only determines which movement modes exist**, not their distances or visual styles.
-   `string` entries are validated internally—non-strings or empty values are ignored with a one-time warning.
-   The returned list affects Tab-based mode cycling and visibility in labels.

---

### `aeris-tokens.preGetMovementValue`

Allows you to override the movement rings shown for a given actor and movement mode. This hook is called per mode (e.g. `"walk"`, `"fly"`), and pushing entries into `ranges` replaces the module’s defaults.

```ts
Hooks.on("aeris-tokens.preGetMovementValue", (actor, ranges, mode) => {
    if (mode === "walk") {
        ranges.push({ value: 30, preset: "available" }); // 30 ft = 6 grid units (on 5 ft grid)
    }
});
```

#### Parameters:

-   `actor`: The `Actor` being evaluated.
-   `ranges`: An empty array of `MovementRange` entries. If you push anything into this array, the default behavior is skipped.
-   `mode`: The movement mode being evaluated (e.g. `"walk"`, `"fly"`).

---

#### `MovementRange`:

```ts
interface MovementRange {
    value: number; // distance in *world units* (e.g. feet or meters)
    rgb?: number; // optional 0xRRGGBB color
    a?: number; // optional opacity (0–1)
    preset?: "available" | "bonus"; // optional styling preset
}
```

---

#### Important: Grid Conversion

-   The `value` you supply is interpreted in **distance units** (e.g. feet).
-   Internally, each `value` is **divided by the scene's grid distance** (`canvas.grid?.distance`) to determine how many **grid cells** it spans.

    -   Example: on a 5 ft grid, `value: 30` spans 6 tiles (`30 / 5`).

-   This conversion is done automatically.

---

#### Behavior:

-   If any entries are pushed, default movement ranges are ignored.
-   Entries are sorted by `value`, and the module applies the **first range where `value >= tile distance`**.
-   If no range matches, the last one is used.

---

### `aeris-tokens.resetMovement`

Fires when movement-related state (e.g. dashing) should be reset - typically at the start of a new turn.

```ts
Hooks.on("aeris-tokens.resetMovement", (actor: Actor) => {
    actor.setFlag("my-module", "dashed", false);
});
```

#### Parameters:

-   `actor`: The actor whose movement-related flags should be reset.

#### Use cases:

-   Resetting temporary bonuses like "dashed"
-   Clearing status effects related to movement

---

### `aeris-tokens.getGridTravelSoundOverride`

Allows modules or systems to override the travel sound used when a token moves. Called during path playback, per movement mode and actor.

```ts
Hooks.on(
    "aeris-tokens.getGridTravelSoundOverride",
    (actor, mode, index, results) => {
        if (mode === "fly") {
            results.push("sounds/wing-flap.ogg");
        }
    }
);
```

#### Parameters:

-   `actor`: The `Actor` being moved.
-   `mode`: The current movement mode (e.g. `"walk"`, `"fly"`, `"swim"`).
-   `index`: The current movement index during playback.
-   `results`: An empty array to which you can push a sound path (`string`). If any valid string is pushed, it will override the default sound behavior.

#### Notes:

-   Only the **first valid string** in the array is used.
-   Strings must be non-empty; invalid values are ignored (once with a warning).
-   This is evaluated before default sound resolution.

---

### `token.dragActionHandler.refreshMovement()`

Call this method to force a token to refresh its cached movement data.

This is useful when external changes (e.g. effects, conditions, settings) affect available movement ranges or modes.

```ts
token.dragActionHandler?.refreshMovement();
```

#### Behavior:

-   Recomputes movement modes via `callGetMovementModes(actor)`.
-   Recomputes movement ranges per mode.
-   Resets `currentAction` if it no longer matches any mode.

---

## Installation

1. Copy the manifest URL: https://robxnlifts.gitlab.io/aeris-tokens/v12/module.json
2. Paste the manifest URL at the bottom of the install module interface in foundry. This can be found by:
    1. Opening FoundryVTT
    2. Navigating to the **"Add-On-Modules"** tab
    3. Clicking **"Install module"** at the top"
    4. The Manifest URL text box is at the bottom of the new window
3. Click **install**. Install any other dependencies that are required.
4. Open your world and activate the **Aeris UI** module.

## Compatibility

-   **Foundry VTT**: Version 12
-   **Required Modules**:

    -   socketlib
    -   Color Picker
    -   libWrapper

-   **Recommended Modules**:
    -   [Aeris Cinematic View](https://gitlab.com/robxnlifts/aeris-cinematic-view)

## Contributors

-   **ddbrown30** ([@ddbrown30](https://gitlab.com/ddbrown30))
    Originated the navigation-grid concept that front-loads and caches tile-to-tile collision checks.

## Attribution

Movement and pathfinding design inspired by _Tales of Fablecraft_.

The grid movement sound effects (`menu.ogg`, `menu_2.ogg`, `menu_3.ogg`, `menu_4.ogg`, `menu_5.ogg`, `pop_ui_click.ogg`) are sourced from:

-   [Menu Button](https://pixabay.com/sound-effects/menu-buttom-190020/)
-   [Video Game Menu Click Sounds](https://pixabay.com/sound-effects/video-game-menu-click-sounds-148373/)
-   [Casual Click Pop UI 2](https://pixabay.com/sound-effects/casual-click-pop-ui-2-262119/)
-   Licensed under the [Pixabay Content License](https://pixabay.com/service/license-summary/)
-   Free for commercial and non-commercial use, no attribution required (attribution given voluntarily)

The original files were converted to `.ogg` format for use in this module.

Additional sound effects (`sfx_grass_step_l.ogg`, `sfx_grass_step_r.ogg`) are sourced from:

-   [Grass Foot Step Sounds (Yo Frankie)](https://opengameart.org/content/grass-foot-step-sounds-yo-frankie)
-   Licensed under Creative Commons Attribution 3.0 (CC-BY 3.0)
-   Attribution: "Yo Frankie" – Blender Foundation / OpenGameArt.org

The original files were converted to .ogg format for use in this module.

## Troubleshooting

### Movement Path

Aeris Tokens needs a **data path** (dot-path) to your actor’s movement value in its data. This is the field it reads to determine how far your token can move.

Below are the built-in defaults for common systems:

-   **D&D 5E**
    `system.attributes.movement.walk`

-   **Pathfinder 2E**
    `system.attributes.speed.total`

If your system stores speed elsewhere, you'll need to find where it's located and input the correct path into the settings.

---

### Custom Font Setup

If you want to use any Google Font for your distance labels, follow these steps:

1.  **Browse Google Fonts**
    Open [Google Fonts](https://fonts.google.com/) and locate the font you’d like (e.g. _Dancing Script_).

2.  **Get the embed code**

    -   Click **Get Font**.
    -   Click **Get embed code**.
    -   Select the **Web** tab.
    -   Switch to the **@import** sub-tab.
    -   You’ll see something like:
        ```html
        <style>
            @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap");
        </style>
        ```

3.  **Copy the @import**
    Copy only the `@import` line (including the semicolon), for example:
    ```css
    @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap");
    ```
4.  **Paste into your module settings**

    -   Go to Module Settings → Aeris Tokens → CSS @import for your font.
    -   Replace the default import with the line you copied above.

5.  **Set the font-family name**

    -   In Module Settings → Aeris Tokens → Font-Family name, enter the exact font name as shown on Google Fonts (e.g. Dancing Script).

Foundry will then fetch the new font and rebake it for you.
If the font fails to load, you’ll see a warning and it will fall back to either the default (Cal Sans) or your system default.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have feedback, feel free to reach out to me on **Discord**: `@robxnlifts`, or join my [discord server](https://discord.gg/gpHgGBxNSz) which has a specific channel for this module.
