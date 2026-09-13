# Tutorial 3: The Torchbearer (Lighting & Audio)

**Goal:** Let's create a "Holding a Torch" effect. We are going to create an *Overlay* that adds a flickering light source to the token and plays a continuous crackling fire sound. This tutorial introduces the Effects tab inside the *Visage Editor* and the powerful *Sequencer* integration.

## Prerequisites

- **Role:** Player or Game Master
- **Required Modules:** Visage, [Sequencer](https://foundryvtt.com/packages/sequencer), and an audio library like [PSFX](https://foundryvtt.com/packages/psfx) (for the fire sound).

## Concepts Covered

- Configuring the built-in Foundry Light Source via *Visage*
- Using the Effects Tab
- Adding an Audio Effect and adjusting volume
- Using *Sequencer* Database Keys

## Step-by-Step Guide

![Tutorial 3 Visage settings](https://github.com/Filroden/visage/blob/main/images/tutorial_03_01.png)

### Phase 1: Setting up the Light Source

1. **Create a New Visage:** Open either your *Local Library* or the *Global Library* and create a new *Visage*. Name it "Torch" and ensure the Mode is set to *Overlay*.

   > **Tip:** We are using an *Overlay* as this is an effect and also to take advantage of the fact that once applied, the effect can be toggled on and off from the *Selector HUD* without needing to remove and re-apply the *Visage*.

2. **Open the Effects Tab:** In the *Visage Editor*, look to the right side of the live preview stage and click the *Effects* tab.
3. **Enable the Light Source:** You will see a card labelled *Light Source*. Click the *Visibility toggle* (the eye icon) on this card to turn the light on.
4. **Configure the Light:** Click anywhere on the *Light Source* card to open its *Inspector* panel.
   - Set the *Dim Radius* to `40` and the *Bright Radius* to `10`.
   - Pick a warm orange or yellow *Color*.

     > **Tip:** Pick a darker shade of the colour you want as Foundry's light engine can make lighter shades look too bright. Test what works for you.

   - Under the *Animation Type* dropdown, select *Torch (\*)*.

     > **Tip:** You will instantly see the light source appear and flicker around your token in the Live Preview stage! Note that only animation types with an asterisk `(*)` after their name are fully animated in the Live Preview. All animation types will still apply their effects when the *Visage* is applied.

### Phase 2: Adding the Audio Effect

1. **Add an Audio Effect:** Back on the main *Effects* tab, click the **Add Audio** button. A new effect card will appear under the *Audio effects* group.
2. **Open the Audio Inspector:** Click the new Audio card to open its settings.
3. **Set the Audio Path:** In the *Path* field, we need to provide a valid audio file. If you have the PSFX module installed, copy and paste this exact Sequencer Database Key into the box: `psfx.ambient.firesources.fireplace.001`

   > **Tip:** To the side of the filepath input is a *Sequencer Database Key picker* icon. If you click this it will open *Sequencer's* database and you can search through any installed effects and copy the database key ready to paste into the filepath input.

   > **Tip:** You can also enter a standard filepath for a file that is stored inside you "data" folder.

4. **Adjust the Volume:**  Set the *Volume* slider to `0.5` (50%) so the fire crackle isn't too loud.
5. **Ensure it Loops:** Back out of the *Inspector* panel to return to the *Effects* tab. Look at the audio card itself. Ensure the *Loop playback* icon (the circular arrows) is toggled ON so the fire crackles continuously while the *Visage* is active.
6. **Save:** Click the **Save Layer** button.

## Testing It Out

1. **Apply the Visage:** Select your token and apply your new "Torch" *Visage* from the *Selector HUD* or the *Library*.
2. **See and Hear:** The token will immediately begin casting a flickering light across the map, and you should hear the warm crackle of a fire.
3. **Remove it:** Open the *Selector HUD* and remove the "Torch" layer. The light will vanish, and the audio will automatically stop playing.

## Pro-Tips & Creative Ideas

- **Randomised Audio (Partial Keys):** You don't have to link to one specific sound. *Visage* accepts partial *Sequencer* keys. Instead of `psfx.ambient.firesources.fireplace.001`, you could just enter `psfx.ambient.firesources`. Every time you apply the Torch, Visage will randomly pick a different fire sound from that folder (if they exist).
- **Browser Audio Policies:** Browsers strictly block audio from autoplaying until a user interacts with the webpage (the canvas). If you refresh the canvas (F5), you might not hear audio effects applied to tokens until you click somewhere on the canvas.
- **Persistent Effects:** Visage is smart enough to handle scene transitions. If you have a looping audio or visual effect applied to your token and the GM moves you to a new Scene (or you refresh the page), Visage will automatically resume playing your effects once the new scene finishes loading.
