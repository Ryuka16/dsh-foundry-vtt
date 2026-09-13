# Tutorial 10: The Architect's Dilemma (Automation Strategy & Data Mining)

**Goal:** To master *Visage*, you need to think like an architect. This tutorial will teach you *where* to place your automations to keep your game running efficiently, how to use selective conditions, and how to use the browser console to find hidden "Derived" attributes that don't appear in the standard *Attribute Picker*.

## Prerequisites

- **Role:** Player or Game Master
- **Required Modules:** Visage

## Concepts Covered

- Local vs. Global Automations (When to use which)
- The "Halfway House" (Selective Global Rules)
- Using the Browser Console (F12)
- Inspecting the `canvas.tokens.controlled[0].actor` object
- Building custom data paths

## Step-by-Step Guide

### Phase 1: Local vs. Global (The Philosophy)

When you want an event to trigger a *Visage*, you have to decide where that *Visage* lives.

- **Local Automations (Character-Specific):** If an automation is unique to a single character (like a barbarian's "rage" or a specific cursed magic item), build it in their *Local Library*. It keeps the global engine light because Visage only watches for that trigger when that specific token is in the scene.
- **Global Automations (Universal Rules):** If a mechanic affects everyone (like the "Bloodied" condition at 50% HP, or a shadow aura that applies when entering a dark region), build it in the *Global Library*.

### Phase 2: The Halfway House (Selective Global Rules)

What if you have a rule that applies to a *group* of tokens, but not everyone? (For example, a "Zombie Resurrection" visual effect). You shouldn't put it in 50 individual *Local Libraries*, but if you make it *Global*, you don't want your players resurrecting as zombies!

The solution is a **Selective Global Rule**:

1. Build the *Visage* in the *Global Library*.
2. Add your primary trigger (e.g., `Attribute: system.attributes.hp.value <= 0`).
3. Click *Add Attribute* again to add a second condition.
4. Set the path to `name`, the *Data Type* to `String`, the *Operator* to `includes`, and the *Value* to `Zombie`.
5. Ensure the Logic Toggle at the top is set to *AND*.

Now, your *Global Library* remains clean, *Local Libraries* remain empty, and the effect *only* fires when a token dies if their name contains "Zombie".

### Phase 3: The Console Hacker (Finding Hidden Attributes)

As mentioned in Tutorial 6, the *Attribute Picker* only shows "Base" data (permanent database values). Temporary, calculated numbers (like a character's current armour class after casting a spell, or their temporary movement speed) are called "Derived" attributes.

You can still use Derived attributes in *Visage* automations, but you have to find their exact paths yourself using Foundry's backend.

1. **Select a Token:** Click on any token on your canvas.
2. **Open the Console:** Press `F12` on your keyboard (or `Ctrl+Shift+I` on Windows / `Cmd+Option+I` on Mac) to open your browser's Developer Tools. Click the *Console* tab.
3. **The Magic Command:** At the very bottom of the console, type this exact command and press *Enter*:

   `canvas.tokens.controlled[0].actor`

4. **Inspect the Object:** The console will spit out an object that looks like `Actor5e {...}` (or your system's equivalent). Click the small arrow `►` next to it to expand it.
5. **Dig into the System Data:** Scroll down and find the property called `system`. Expand it `►`. This is where almost all of a character's mechanical data lives.
   - *Example:* Expand `attributes`, then look for `ac`. Inside you might see `value: 16`.
6. **Build the Path:** To use this in *Visage*, you just connect the folders you opened with dots.
   - You opened `system` -> `attributes` -> `ac` -> and found `value`.
   - Your final path is: `system.attributes.ac.value`.

   > **Tip:** The path is case-sensitive and you must include any symbols (derived data paths often contain a leading `_` symbol).

7. **Use it in *Visage*:** Go back to the *Visage Editor*, create a condition, and manually type `system.attributes.ac.value` into the Data Path box. You have successfully hacked the matrix.

## Testing It Out

1. **Test your Custom Path:** Set up a quick automation using your new custom path (e.g., Make a token glow if `system.attributes.ac.value > 15`).
2. **Change the Value:** Double-click the token to open its sheet and equip a shield or cast a spell that changes that derived attribute.
3. **Watch the Automation:** *Visage* will instantly read the derived data and trigger the effect!

## Pro-Tips & Creative Ideas

- **Exploring Flags:** Not everything is in the `system` folder. Many modules (like Midi-QOL or condition managers) store their data in a folder called `flags`. If you expand `flags` in the console, you might find a path like `flags.midi-qol.advantage.all`. You can use this path in *Visage* just like any other.
- **Data Type Safety:** When manually typing a custom path, make sure you set the **Data Type** dropdown correctly in the *Visage Editor's* trigger tab. If the value in the console is a word (like `"poisoned"`), set it to String. If it is `true` or `false`, set it to Boolean.

   > **Tip:** *Visage* can only test `number`, `boolean` and `string` data types.
