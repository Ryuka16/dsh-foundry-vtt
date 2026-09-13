# Tutorial 7: The Magic Shield (Status / Active Effect Triggers)

**Goal:** Let's create a magical barrier that physically appears on the canvas when a character casts a shield spell. We are going to create an *Overlay* that automatically applies a visual effect whenever a token gains the "Magic Shield" status, and removes itself when the spell ends.

## Prerequisites

- **Role:** Game Master (We are making this a *Global* rule for all tokens)
- **Required Modules:** Visage, [Sequencer](https://foundryvtt.com/packages/sequencer) and either an animation library like [JB2A](https://foundryvtt.com/packages/JB2A_DnD5e) or your own animation asset.

## Concepts Covered

- Creating a Status automation condition
- Using core Foundry Status Effects
- Triggering *Visages* based on "Active" or "Inactive" states

## Step-by-Step Guide

### Phase 1: Creating the Shield Visuals

1. **Create a New Visage:** Open the *Global Library* and create a new *Visage*.
2. **Set the Metadata:** Name it "Magic Shield" and set the Mode to *Overlay*.
3. **Set the Appearance:** Switch to the *Effects* tab.
   - *If you have Sequencer/JB2A:* Click **Add Visual**, open the *Inspector*, and paste a shield animation path (e.g., `jb2a.shield.01.loop.blue`). Set it to loop.
   - *If you do not have Sequencer:* Toggle on the *Dynamic Ring* and set its colour to a bright, glowing blue.

### Phase 2: The Status Condition

1. **Open the Automation Tab:** In the *Visage Editor*, click the *Automation* tab.
2. **Enable Automation:** Click the *Enable Automation* toggle at the top.
3. **Add a Condition:** Click the *Add Status* button. A new condition card will appear. Click it to open the *Inspector*.
4. **Configure the Status:**
   - **Status ID:** Click the dropdown. This menu contains all the core status effects built into your game system. Scroll down and select *Magic Shield*.
   - **Operator:** Make sure this is set to *Is Applied*. This tells *Visage*: *"Apply this Overlay when the Magic Shield status becomes active."*
5. **Save:** Save your *Visage*.

## Testing It Out

1. **Check the Canvas:** Make sure you have a token on the canvas.
2. **Apply the Status Effect:** Right-click the token to open the core Foundry Token HUD. Click the *Assign Status Effects* icon (usually a person surrounded by an aura) and click the *Magic Shield* icon to apply it to the token.
3. **Watch the Canvas:** As soon as the status icon appears on the token, *Visage* will instantly detect it and apply your effect.
4. **Remove the Status:** Open the Token HUD again and toggle the Magic Shield status off. The visual overlay will immediately vanish.

## Pro-Tips & Creative Ideas

- **Active Effects:** What if your system uses an active effect that isn't in the standard dropdown list? No problem. The dropdown automatically populates with any Active Effects that are currently applied to the token you are looking at. You can also leave the dropdown blank and manually type the exact name of the effect into the *Custom Status Name* box.
- **The "Inactive" Operator:** You can use the Operator dropdown to trigger a *Visage* when a status is **removed**. For example, you could create a one-time "Shatter" visual effect that plays specifically when the Magic Shield status becomes *Inactive*!
