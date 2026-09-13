# Tutorial 8: Creatures of the Night (Event Triggers)

**Goal:** Let's create a monster that only reveals its true form when the sun goes down. We are going to create an *Identity* that automatically swaps a token's artwork to a Vampire whenever the scene's darkness level gets too high.

## Prerequisites

- **Role:** Player or Game Master (We are making this a *Local* rule for a specific token)
- **Required Modules:** Visage

## Concepts Covered

- Creating an Event automation condition
- Using the Darkness event trigger
- Understanding how *Visage* responds to environmental changes

## Step-by-Step Guide

### Phase 1: Creating the Vampire Identity

1. **Create a New Visage:** Open the *Local Library* and create a new *Visage*.
2. **Set the Metadata:** Name it "Vampire Form", set the Mode to **Identity**, and set sharing to *Private*.
3. **Set the Appearance:** Check the box for **Image** and use the file picker to select a terrifying vampire token. (If you want them to look bigger and scarier, you can also check the *Scale* box and set it to 120%).

### Phase 2: The Event Condition

1. **Open the Automation Tab:** In the *Visage Editor*, click the *Automation* tab.
2. **Enable Automation:** Click the *Enable Automation* toggle at the top.
3. **Add a Condition:** Click the **Add Event** button. A new condition card will appear. Click it to open the *Inspector*.
4. **Configure the Event:**
   - **Event ID:** Click the dropdown and select **Scene Darkness**.
   - **Operator:** Change this to **> (Greater than)**.
   - **Value:** Type `0.5`.

   > **Tip:** Foundry's scene darkness is measured on a scale of `0` (bright daylight) to `1` (pitch black). By setting the value to `0.5`, this *Visage* will trigger as soon as the scene crosses into twilight/nighttime!

5. **Limit the Target (Optional but Recommended):** If you save this right now, *every* token on the map will turn into a vampire when it gets dark! To fix this:
   - Click the back arrow to exit the Event Inspector.
   - Click **Add Attribute** and open its *Inspector*.
   - Set the Data Path to `name` (the token's name), Operator to `contains`, Data Type to `String`, and Value to `Strahd` (or whatever your NPC is named).
   - Now, *Visage* will only apply the Vampire Form if the token is named Strahd AND it is dark out.
6. **Save:** Save your *Visage*.

## Testing It Out

1. **Check the Canvas:** Make sure your target token (e.g., Strahd) is on the canvas.
2. **Change the Sun:** Open the core Foundry *Lighting Controls* (the lightbulb icon on the left toolbar) and click the **Transition to Night** button, or manually drag the Darkness Level slider past 0.5.
3. **Watch the Canvas:** As the map darkens, your NPC will instantly transform into their Vampire Form!
4. **Bring the Dawn:** Transition the scene back to daylight (Darkness < 0.5). The token will automatically revert to its human disguise.

## Pro-Tips & Creative Ideas

- **The Combat Event:** You can use Event triggers for more than just the environment! If you set the Event ID to **Combat** and the Operator to **Active**, you can create a *Visage* that automatically gives a token a "weapons drawn" appearance the moment the GM rolls initiative for them.
- **The Elevation Event:** If you play in a system with lots of verticality, create an *Overlay* with the Event ID set to **Elevation**, Operator `> (Greater than)`, and Value `0`. Add a dark, semi-transparent circle as a background visual effect. Now, whenever a token flies up into the air, they automatically get a drop-shadow on the ground beneath them!
