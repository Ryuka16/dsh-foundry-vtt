# Tutorial 2: Creating a Global Overlay (the Enlarge Buff)

**Goal:** Let's create an "Enlarge" effect that can be used on any character or monster. We are going to create a *Visage* that increases a token's size while keeping its original artwork. This is a *Global Visage* because it lives in the world's shared library, and it is an *Overlay* because it modifies the token without replacing its core identity.

## Prerequisites

- **Role:** Game Master (Only GMs can create *Global Visages*)
- **Required Modules:** Visage

## Concepts Covered

- Accessing the *Global Visage Library* via Scene Controls
- Setting Mode to *Overlay*
- Understanding Inheritance (leaving the image blank)
- Adjusting token dimensions
- Applying *Visages* via drag-and-drop

## Step-by-Step Guide

![Tutorial 2 Visage settings](https://github.com/Filroden/visage/blob/main/images/tutorial_02_01.png)

### Phase 1: Creating the *Visage*

1. **Open the *Global Visage Library*:** Go to the Token Controls menu on the left side of the screen and click the *Visage Icon* (the domino mask). This opens the *Global Library*(identifiable by its blue theme).
2. **Create New:** Click the **Create New Global Layer** button at the bottom of the window to open the *Visage Editor*.

   > **Tip:** Unlike *Local Visages*, a new *Global Visage* will start with no settings applied so there is no need to press *Reset Settings*.

### Phase 2: Configuring the Appearance

1. **Set the Metadata:** In the header, type "Enlarge" into the *Label* field. Ensure the *Mode* dropdown is set to **Overlay**.

   > **Tip:** *Overlays* stack on top of *Identities* and the base token, allowing you to combine multiple effects.

2. **Leave the Image Blank:** Do not select an image in the image field. By leaving it blank, the *Visage* will automatically inherit the token's current artwork.
3. **Change the Size:** Under the Appearance tab, click the checkboxes next to *Width* and *Height* to activate those fields. Enter `2` in both inputs.

   > **Tip:** Foundry requires an absolute size value, so a size of `2` will only increase the size of the token if the original token's size was smaller. You can quickly make multiple *Visages* with different token sizes. A sample of re-size Visages can be imported from Foundry's *Game Setting* under *Visage*.

4. **Save the Visage:** Click the *Save Global Layer* button to close the editor and save your new buff.

## Testing It Out

There are two ways a GM can apply a *Global Visage*:

1. **Drag and Drop:** Drag the "Enlarge" *Visage* card directly from the *Global Library* window and drop it onto any token on the canvas.
   - *Alternative:* Select one or more tokens on the canvas, then click the *Apply* (play icon) button directly on the *Visage* card.
2. **Watch the Stack:** The token will instantly grow to a 2x2 size while keeping its original image! If you apply this on top of the "Wolf Form" you made in Tutorial 1, it will perfectly preserve the wolf image and become a Giant Wolf.
3. **Remove it:** Right-click the token and open its *Selector HUD*. You will see the "Enlarge" overlay listed at the very top of the HUD. Click the *X* to remove it and shrink the token back to normal.

   > **Tip:** If this is an effect you might use frequently then don't remove it, just hide it by toggling the visibility icon inside the "Enlarge" overlay.

## Pro-Tips & Creative Ideas

- **Public vs. Private:** In the *Visage Editor's* header, there is a **Public/Private** toggle. If you set it to **Public**, your players will be able to see this "Enlarge" *Visage* in their own *Selector HUDs* and apply it for themselves!
- **The Invisibility Overlay:** You can duplicate this *Visage* to easily create an "Invisibility" buff. Just uncheck the Width and Height boxes, check the *Opacity* box, set the slider to 50%, and rename it.
