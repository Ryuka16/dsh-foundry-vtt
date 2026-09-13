# Tutorial 4: The Raging Barbarian (Sequencer Visuals)

**Goal:** Let's give a barbarian a terrifying entrance when they rage! We are going to create an *Overlay* that plays a one-time effect over the token, leaves a persistent aura swirling underneath them, and slightly increases their physical size. Then, we will learn how to manipulate the *Visage Selector HUD* to control which effect takes priority when multiple overlays are stacked.

## Prerequisites

- **Role:** Player or Game Master
- **Required Modules:** Visage, [Sequencer](https://foundryvtt.com/packages/sequencer), and an animation library like [JB2A](https://foundryvtt.com/packages/JB2A_DnD5e).

## Concepts Covered

- Adding Visual Effects and adjusting their Scale
- Using Layer Priority (Above vs. Below the token)
- Toggling Loop playback for one-time effects
- Changing Token Grid Dimensions
- Dragging and dropping *Overlays* in the *Selector HUD* to change stack priority

## Step-by-Step Guide

![Tutorial 4 Visage settings](https://github.com/Filroden/visage/blob/main/images/tutorial_04_01.png)

### Phase 1: Token Size and the Persistent Aura

1. **Create a New Visage:** Open your *Local Library* or the *Global Library* and create a new *Visage*. Name it "Rage" and ensure the Mode is set to *Overlay*.
2. **Change the Size:** In the *Visage Editor*, on the *Appearance* tab, check the boxes for *Width* and *Height* and set them both to `1.2`. This will make the barbarian look slightly more imposing when they rage.

   > **Tip:** Changing the token image scale to 120% would be better here, but to illustrate how *Overlays* stack, we are using *Width* and *Height* as we already have another Visage that affects these settings.

3. **Add the Background Aura:** Switch to the *Effects* tab and click **Add Visual**. Click the new card to open the *Inspector*.
   - In the *Path* field, paste: `jb2a.aura_themed.01.orbit.loop.metal.01.red` or find another effect from the *Sequencer Database*.
   - Set the *Layer Priority* to **Below Token**.
   - **Increase the Scale:** Because this effect sits underneath the token, increase the *Scale* slider to `1.5` or `2.0` so it extends visibly beyond the token's borders.

     > **Tip:** Because we are not setting an image appearance in this *Overlay*, the Live Preview shows a "Domino" mask icon as a placeholder so you can see how it would look. Inside the Live Preview area, in the bottom right corner is a "Show Grid" toggle. If you turn this on, it shows the size of the token square.

### Phase 2: The One-Time Burst

1. **Add the Foreground Burst:** Back on the *Effects* tab, click **Add Visual** again to create a second visual effect. Open its *Inspector*.
   - In the *Path* field, paste: `jb2a.condition.boon.01.004.red`
   - Set the *Layer Priority* to **Above Token**.
2. **Turn Off Looping:** We only want this fiery explosion to happen the moment the barbarian enters their rage. Close the *Inspector* to return to the *Effects* tab. On your new foreground effect card, click the **Loop playback** icon (the circular arrows) to toggle it OFF.

   > **Tip:** You can also drag and drop visual effects between Foreground and Background if you want to change their positions. This saves you going into each effect's *Inspector*.

3. **Save:** Click the **Save Layer** button.

## Testing It Out (The Active Stack)

Let's see how *Visage* handles conflicting instructions!

1. **Apply the Rage:** Select your token and apply your new "Rage" *Visage*. You will see the fiery burst play once, the metallic aura loop underneath, and the token grow to a 1.2 x 1.2 size.
2. **Apply the Enlarge Buff:** Now, apply the "Enlarge" *Overlay* you built in Tutorial 2 (which changes the size to 2 x 2). Your token will instantly grow to 2 x 2. *Visage* reads from the top down; because "Enlarge" was applied last, it sits at the top of the stack and its size settings win!
3. **Re-order the Stack:** Right-click the token and open the *Visage Selector HUD*. At the top, you will see your two active *Overlays*. Click and drag the "Rage" overlay so it sits *above* the "Enlarge" overlay.
4. **Watch the Canvas:** The token immediately shrinks back to 1.2 x 1.2! By dragging and dropping, you told *Visage* that the Rage size takes priority over the Enlarge size.

   > **Tip:** You could also have toggled the visibility of the "Enlarge" *Visage* off to achieve the same result.

## Pro-Tips & Creative Ideas

- **Blend Modes:** Inside the visual effect *Inspector*, you will see a setting for *Blend Mode*. All JB2A animations have built-in transparency, so they look great on *Normal*. However, if you ever use your own video files that have a solid black background, change the Blend Mode to *Screen* or *Lighten*. This will turn the black background invisible. For a solid white background, use *Multiply* or *Darken*.
- **Replaying One-Time Effects:** If you want to see your fiery burst again without having to completely remove and re-apply the Rage *Visage*, simply open the *Selector HUD* and toggle the "Show/Hide" icon (the eye) on the Rage overlay off and back on. Showing an overlay will automatically replay any of its one-time effects.

   > **Tip:** If you refresh the canvas, the module will only re-enable persistent effects. After all, they've already made their entrance.
