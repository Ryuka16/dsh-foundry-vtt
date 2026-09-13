# Tutorial 6: The "Bloodied" Condition (Attribute Triggers)

**Goal:** Let's make the game react to the players. We are going to create a "Bloodied" *Overlay* that automatically applies itself whenever a token drops to 50% of its maximum hit points, and automatically removes itself when they are healed. This tutorial introduces the powerful Automation Engine and the *Attribute Picker*.

## Prerequisites

- **Role:** Game Master (We are making this a *Global rule* for all tokens)
- **Required Modules:** Visage

## Concepts Covered

- Enabling *Visage* automation via the *Automation* Tab
- Creating an automation condition
- Using the *Attribute Picker* to find data paths
- Understanding the difference between "Base" and "Derived" attributes
- Setting percentage conditions and understanding denominators

## Step-by-Step Guide

### Phase 1: Creating the "Bloodied" Visuals

1. **Create a New Visage:** Open the *Global Library* and create a new *Visage*.
2. **Set the Metadata:** Name it "Bloodied", set the Mode to *Overlay* and sharing to *Private*.
3. **Set the Appearance:** We want a subtle visual cue. Switch to the *Effects* tab, toggle on the *Dynamic Ring*, and open its *Inspector*. Set the *Ring Colour* to a deep red. Set the *Pulse* checkbox under *Ring Effects*. (Alternatively, you could add a red tint via the Light Source, or add a blood splatter visual effect under the token.)

### Phase 2: The Automation Condition

Now we tell Visage *when* to apply this overlay.

1. **Open the Automation Tab:** In the *Visage Editor*, click the *Automation* tab.
2. **Enable Automation:** Click the *Enable Automation* toggle at the top. This tells Visage to actively monitor the game for this specific *Visage*.
3. **Add a Condition:** Click the *Add Attribute* button. A new condition card will appear. Click it to open the *Inspector*.
4. **Set the Math:** We want this to trigger when HP is at or below 50%.
   - **Data Type:** Set this to `Number`.
   - **Operator:** Change this to `<= (Less than or equal)`.
   - **Value:** Type `50`.
   - **Mode:** Ensure this is set to `Percentage (Calculates vs Max)`.

### Phase 3: The Attribute Picker & Denominators

Visage needs to know *what* data it is checking. We need to point it to the token's Hit Points.

1. **Open the Attribute Picker:** Next to the *Actor Data Path* field at the top of the *Inspector*, click the *List* icon. This opens the *Attribute Picker*, which displays a searchable list of the data stored on the token's actor.
2. **Find the HP:** Type "hp" into the search bar. You should see a path that looks something like `system.attributes.hp.value` (this varies slightly depending on your game system). Click it to select it.

   > **Tip: Base vs. Derived Attributes.** The *Attribute Picker* is incredibly smart, but it only displays "Base" attributes (data permanently saved to the actor database, like your core HP or Strength score). It does *not* show "Derived" attributes (temporary numbers the system calculates on the fly, like your current AC after casting a spell). However, Visage *can* still read derived attributes. If you know the exact data path for a derived attribute, you can type it manually into the *Actor Data Path* box. We will cover how to find these hidden paths in a later tutorial.

3. **The Denominator Path:** Because we set our Mode to `%`, Visage needs to know what the "Maximum" is to calculate 50%.
   - **Implicit (Let Visage Guess):** If you leave the *Denominator Path* blank, Visage is usually smart enough to guess. If your Path is `system.attributes.hp.value`, it will automatically look for `system.attributes.hp.max`.
   - **Explicit (Tell Visage Exactly):** If your game system uses unusual naming (like `hp.current` and `hp.total`), you should use the *Attribute Picker* or manually type the maximum path into the *Denominator Path* box to ensure the math works perfectly.
4. **Save:** Click the **Save Global Layer** button.

## Testing It Out

1. **Check the Canvas:** Make sure you have a token on the canvas that has full HP. Notice that the Bloodied ring is *not* active.

   > **Tip:** Automated *Visages* do not need to be manually applied to tokens. So long as their *Enable Automation* toggle is on, they will apply and remove themselves.

   > **Tip:** You can toggle the *Enable Automation* inside the *Visage Library*. If a *Visage* has an automation condition, it will show a "power on" icon in the Visage's card. Click it to toggle it on (green) or off (grey).

   > **Tip:** You can quickly filter the *Visage Library* to show only *Visages* with automations by clicking the "power on" icon in the filter row above the grid of cards. This lets you see all automated *Visages* and which ones are active.

2. **Take Damage:** Double-click the token to open its character sheet, or use your system's damage tools, and reduce its HP to 50% or below.
3. **Watch the Magic:** The moment the HP drops, the token's Dynamic Ring will instantly turn red!
4. **Heal Up:** Increase the token's HP back above 50%. The red ring will automatically disappear. You have just built a fully automated *Visage*.

## Pro-Tips & Creative Ideas

- **Multiple Conditions:** You aren't limited to just one condition. You could click "Add Condition" again to make a Visage that only applies if a token is below 50% HP **AND** has 0 temporary hit points.
- **Selective Conditions:** *Global Visages* will usually be universal. You can use conditions to limit them to only certain tokens. For example, you could add a condition that the token's name includes "goblin" or the creature type is "monster", etc.
- **The "Priority" Setting:** At the top of the *Automation* tab, there is a Priority number. If a token triggers two different automated *Visages* at the same time:
  - if the Visages are *Identities*, the one with the higher Priority number will be applied (the "Highlander" rule).
  - if the Visages are *Overlays*, the one with the higher Priority number will be placed higher in the active stack.
