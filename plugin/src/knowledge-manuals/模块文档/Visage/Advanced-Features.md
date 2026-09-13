Visage includes several powerful features designed for power users, world builders, and macro scripters. This page details how to get the most out of these tools.

## 1. Wildcard Images

Visage fully supports wildcard file paths, allowing you to create a single Visage or Mask that randomises its appearance every time it is applied.

### How it Works

Instead of selecting a specific file (e.g., `cultist_01.png`), you can use special characters in the file path to select from a group of files.

* **`*` (Asterisk):** Matches any sequence of characters.
  * *Example:* `tokens/cultists/*.png` will pick a random png file from that folder.
  * *Example:* `tokens/guards/human_male_*.webp` will only pick files starting with "human_male_".

* **`?` (Question Mark):** Matches any single character.
  * *Example:* `tokens/dragon_color_?.png` will match `dragon_color_1.png` but not `dragon_color_10.png`.

### Usage

1. Open the **Editor** for a Visage.
2. In the **Image Path** field, manually type your wildcard path or use the filepicker to select one that closely matches what you want and then edit it in the field.
3. The **Live Preview** will immediately select a random image to show you it is working.
4. **Save.** Now, every time you apply this Visage to a token, Visage will roll on the wildcard table and pick a new image.

*Note: Visage also supports S3 bucket wildcards if you host your assets externally.*

## 2. Animated Tokens (Video)

Visage natively supports animated token art. You can use video files in the **Image Path** field just like static images.

* **Supported Formats:** `.webm`, `.mp4`
  * **Behaviour:** Video tokens automatically loop, play without sound (muted), and autoplay.
  * **Preview:** The Editor and Gallery will display the animation live, so you can check for seamless looping before saving.

## 3. Ghost Edit Protection

One of the dangers of using cosmetic modules is accidentally overwriting your "real" token data. Visage includes a safety feature called **Ghost Edit Protection**.

If you open the core Foundry **Token Configuration** window (by double-clicking a token) while a Visage is active:

1. Visage intercepts the window.
2. It temporarily swaps the data back to show you the **Original Token** (or Prototype) settings.
3. It displays a warning banner: *"Token Configuration: A Visage is currently active on this token. Changes made here will modify the default Token, not the Visage."*

This ensures that if you change the token's Vision, or Resources, you are updating the token itself, not the temporary disguise.

## 4. The Developer API & Macros

Visage exposes a robust API for macro writers and system developers. You can use these methods to automate transformations via triggers, traps, or chat macros.

You can access the API via `game.modules.get("visage").api` or simply `Visage`.

### The Main API

#### `apply(token, visageId, [options])`

Adds a Visage (Identity or Overlay) to the token's active stack.

* **token**: `Token` object or ID string.
* **visageId**: `string` - The UUID of the item to apply.
* **options**: Object containing modification flags:
  * `switchIdentity` (boolean): If `true`, forces this item to act as an **Identity** (swaps base texture). If `false`, forces **Overlay** (stacks on top). *Default: Auto-detected from item's `mode`.*
  * `clearStack` (boolean): If `true`, removes all existing layers before applying. *Default: `false`.*
* **Returns**: `Promise<boolean>`

#### `remove(token, visageId)`

Removes a specific layer from the token's stack.

* **token**: `Token` object or ID.
* **visageId**: `string` - The UUID of the layer to remove.
* **Returns**: `Promise<boolean>`

#### `revert(token)`

Clears the entire stack (Identities and Overlays) and restores the token to its original default appearance.

* **token**: `Token` object or ID.
* **Returns**: `Promise<boolean>`

#### `isActive(token, visageId)`

Checks if a specific Visage is currently active in the stack.

* **Returns**: `boolean`

#### `getAvailable(token)`

Returns an array of all Visage data objects (Local and Global) available to this token's actor.

#### `resolvePath(path)`

Resolves a wildcard path string or S3 URL into a concrete file path.

### Broadcast Hooks

Visage automatically broadcasts its state changes globally using standard Foundry Hooks. Other module developers or GM world scripts can listen to these hooks to trigger external logic (like chat messages, mechanical updates, or soundboards) without needing to attach individual macro effects to every Visage.

* **`visageApplied`**: Fires when a Visage is successfully applied.
  * **Signature:** `Hooks.on("visageApplied", (token, visageData) => { ... })`
* **`visageRemoved`**: Fires when a specific Visage layer is removed from a token.
  * **Signature:** `Hooks.on("visageRemoved", (token, visageId) => { ... })`
* **`visageReverted`**: Fires when a token's stack is completely cleared and restored to its default state.
  * **Signature:** `Hooks.on("visageReverted", (token) => { ... })`

**Example Usage:**

```javascript
// Automatically announce all transformations in the chat
Hooks.on("visageApplied", (token, visageData) => {
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ token: token.document }),
        content: `<i>${token.name} transforms into <b>${visageData.label}</b>!</i>`
    });
});
```

---

### Data Schema Reference

When creating or manipulating Visage data directly via macros or the API, your payload must strictly conform to the unified Visage Data Model. Any deviations, incorrect data types, or unregistered properties will be rejected by the validation engine.

#### 1. Root Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | String | `null` | Unique 16-character string. Automatically generated if omitted. |
| `label` | String | `"New Visage"` | **Required.** The human-readable name in the library. |
| `category` | String | `null` | Folder/category grouping. |
| `tags` | Array<String> | `[]` | Array of string tags for filtering. |
| `mode` | String | `"identity"` | Must be `"identity"` or `"overlay"`. |
| `public` | Boolean | `false` | If true, the Visage is visible in the player HUD. |

#### 2. Visual Changes (`changes` object)

This object defines the physical and visual modifications applied to the token.

| Property | Type | Description |
| --- | --- | --- |
| `name` | String | Token name override. |
| `width` / `height` / `depth` | Number | Token grid dimensions (X, Y, Z). |
| `scale` | Number | Atomic scale override (e.g., `1.5` for 150%). |
| `alpha` | Number | Token opacity (`0.0` to `1.0`). |
| `lockRotation` | Boolean | Locks the token image rotation so it does not turn with facing. |
| `disposition` | Number | Token disposition (`1` Friendly, `0` Neutral, `-1` Hostile, `-2` Secret). |
| `mirrorX` / `mirrorY` | Boolean | Forces horizontal or vertical mirroring. |
| `portrait` | String | File path to overwrite the Actor's character sheet portrait. |
| `texture` | Object | Standard Foundry texture object (`src`, `scaleX`, `scaleY`, `anchorX`, `anchorY`). |
| `light` | Object | Standard Foundry light emission object. |
| `ring` | Object | Dynamic Token Ring configuration. *See Ring Properties below.* |

#### 3. Dynamic Ring Properties (`changes.ring`)

| Property | Type | Description |
| --- | --- | --- |
| `enabled` | Boolean | Activates the dynamic ring. |
| `colors.ring` | Hex String | Hexadecimal colour code for the ring frame (e.g., `"#FF0000"`). |
| `colors.background` | Hex String | Hexadecimal colour code for the ring background. |
| `subject.texture` | String | File path for the pop-out subject art. |
| `subject.scale` | Number | Scale multiplier for the subject art. |
| `effects` | Number | Bitmask for ring animations (`2`=Pulse, `4`=Gradient, `8`=Wave, `16`=Invis). |

#### 4. Effects Array (`changes.effects`)

An array of objects representing attached Sequencer, Audio, Macro, or TokenMagicFX events.

| Property | Type | Description |
| --- | --- | --- |
| `id` | String | **Required.** Unique identifier for the effect. |
| `type` | String | **Required.** `"visual"`, `"audio"`, `"macro"`, or `"tmfx"`. |
| `label` | String | Human-readable name for the editor UI. |
| `disabled` | Boolean | If `true`, the effect will not play. |
| `delay` | Number | Start delay in seconds (can be negative). |
| `path` | String | File path or Sequencer Database key (Visual/Audio only). |
| `scale` | Number | Visual scale multiplier. |
| `opacity` | Number | Visual opacity or Audio volume (`0.0` to `1.0`). |
| `zOrder` | String | `"above"` or `"below"` the token (Visual only). |
| `loop` | Boolean | Whether the effect loops indefinitely. |
| `uuid` | String | The Foundry Document UUID to execute (Macro only). |
| `tmfxPreset` | String | The name of the TokenMagic filter (TMFX only). |

#### 5. Automation Properties (`automation`)

This object defines the rules for when a Visage should automatically apply or remove itself.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | Boolean | `false` | Master toggle for the automation block. |
| `logic` | String | `"AND"` | How conditions are evaluated: `"AND"` (all must be true) or `"OR"` (any must be true). |
| `onEnter.action` | String | `"apply"` | Action when conditions are met: `"apply"` or `"remove"`. |
| `onEnter.priority` | Number | `0` | Resolution priority if multiple Visages trigger simultaneously. |
| `onExit.action` | String | `"remove"` | Action when conditions are no longer met: `"apply"` or `"remove"`. |
| `onExit.priority` | Number | `0` | Resolution priority. |
| `conditions` | Array | `[]` | Array of condition objects (see below). |

#### 6. Automation Conditions (`automation.conditions`)

Each object in the `conditions` array must conform to this schema. The required properties change depending on the `type` of the condition.

| Property | Type | Description |
| --- | --- | --- |
| `id` | String | **Required.** Unique identifier for the condition. |
| `disabled` | Boolean | If `true`, this specific condition is ignored. |
| `type` | String | **Required.** `"attribute"`, `"status"`, or `"event"`. |
| `operator` | String | The comparison operator (e.g., `"lte"`, `"eq"`, `"includes"`, `"active"`). |
| **Attribute Properties** |  | *(Only used if `type` is `"attribute"`)* |
| `path` | String | The actor data path to watch (e.g., `"system.attributes.hp.value"`). |
| `dataType` | String | `"number"`, `"string"`, or `"boolean"`. |
| `mode` | String | `"absolute"` or `"percent"`. |
| `denominatorPath` | String | Optional path to a maximum value for percentage calculations. |
| `value` | Any | The target value to compare against. |
| **Status Properties** |  | *(Only used if `type` is `"status"`)* |
| `statusId` | String | Core status effect ID. |
| `customStatus` | String | Name of a custom active effect. |
| **Event Properties** |  | *(Only used if `type` is `"event"`)* |
| `eventId` | String | `"combat"`, `"targeted"`, `"facing"`, `"elevation"`, `"globalLight"`, `"darkness"`, `"region"`, `"time"`, or `"weather"`. |
| `value` | Number | Target value for elevation or darkness events. |
| `startAngle` / `endAngle` | Number | Degree boundaries for facing events. |
| `regionId` | String | Target scene region ID. |
| `startTime` / `endTime` | String | Time boundaries (e.g., `"06:00"`). |
| `weatherId` / `customWeather` | String | Target weather effect ID. |

### Complete Data Example with Automation

Here is the complete payload illustrating the "Burning Ghost" appearance, updated to automatically apply itself whenever the actor drops to 50% Hit Points or lower.

```json
{
  "label": "Burning Ghost",
  "category": "Undead",
  "tags": ["Fire", "Spooky"],
  "mode": "identity",
  "public": true,
  "automation": {
    "enabled": true,
    "logic": "AND",
    "onEnter": { "action": "apply", "priority": 10 },
    "onExit": { "action": "remove", "priority": 0 },
    "conditions": [
      {
        "id": "hp_threshold",
        "disabled": false,
        "type": "attribute",
        "path": "system.attributes.hp.value",
        "dataType": "number",
        "operator": "lte",
        "mode": "percent",
        "denominatorPath": "system.attributes.hp.max",
        "value": 50
      }
    ]
  },
  "changes": {
    "name": "Vengeful Spirit",
    "disposition": -1,
    "width": 2,
    "height": 2,
    "depth": 2,
    "scale": 1.2,
    "mirrorX": true,
    "alpha": 0.8,
    "lockRotation": true,
    "texture": {
      "src": "path/to/ghost_token.webp",
      "anchorX": 0.5,
      "anchorY": 0.5
    },
    "ring": {
      "enabled": true,
      "colors": {
        "ring": "#FF4400",
        "background": "#000000"
      },
      "effects": 2,
      "subject": {
        "texture": "path/to/ring_subject.webp",
        "scale": 1.0
      }
    },
    "effects": [
      {
        "id": "fire_aura",
        "type": "visual",
        "label": "Flame Base",
        "path": "jb2a.flames.01.orange",
        "scale": 1.5,
        "opacity": 0.8,
        "zOrder": "below",
        "loop": true,
        "delay": -1.0
      }
    ]
  }
}

```

## 5. Data Management (The Bin)

To keep your world database clean, Visage implements an automatic garbage collection system for deleted items.

* **Soft Delete:** When you delete a Visage, it isn't removed from the database immediately. It is flagged as `deleted` and hidden from the main view.
* **30-Day Retention:** Deleted items sit in the **Bin** for 30 days. During this time, they can be **Restored**.
* **Garbage Collection:** After 30 days, Visage automatically permanently deletes these items to free up space in your world data.
* **Manual Destroy:** You can force-delete an item immediately by using the **Destroy** (Ban circle) icon in the Bin tab.
