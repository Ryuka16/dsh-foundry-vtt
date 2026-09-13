The **Visage Selector HUD** is the main tool for controlling your token's appearance during gameplay. It is designed to be lightweight and fast, allowing you to swap Identities or add/remove/hide Overlays without opening a configuration window and changing settings each time.

To access the Visage Selector HUD, right-click any token you own on the canvas to open the standard Foundry Token HUD, then click the **Visage Icon**.

![Visage icon on token HUD](https://github.com/Filroden/visage/blob/main/images/local_library_token_control.png)

The Selector HUD opens as a floating panel and positions itself next to the Token, either to its left or right depending on the space available. The HUD includes a **Pin toggle**, allowing you to switch it to a standard, resizable window.

## The Visage Selector HUD layout

![Visage Selector HUD](https://github.com/Filroden/visage/blob/main/images/visage_selector_layout.png)

- **The Header:** This contains the Global Visage visibility toggle (to show/hide any Visages shared by the GM) and the Configure icon to open the Local Library for that token.

  ![Visage Selector HUD Header](https://github.com/Filroden/visage/blob/main/images/visage_selector_header.png)

- **Current Overlays layers:** Next, if any Overlays are active on the token, they are shown at the top. Each Overlay can be dismissed individually by clicking its Close icon (X), or all Overlays removed by clicking "Remove All Layers". Local Overlays are shown in 🟡 gold, and Global Overlays (applied by the GM) are shown in 🔵 blue. Overlays can be re-ordered by dragging and dropping them. You can also toggle an Overlay on/off. If any one-time effects are set up for the Overlay, they will replay if shown again.
- **Local Identities:** Next is a grid of tiles which can be applied as Identities.
- **Local Overlays:** Finally, there is a grid of tiles which can be applied as Overlays.
- **Quick Visages:** If you have selected a **Quick Visage Image Directory** in the game settings, any images in that folder or its sub-folders that match the token's name will be shown in a simple grid below the Identities and Overlays. Clicking one of these images will create a new Local Identity and apply it to the token immediately.

  ![Visage Selector HUD in window mode showing the Quick Visage grid](https://github.com/Filroden/visage/blob/main/images/visage_selector_hud_quick_visages.png)

### The Visage Tiles

Each tile is a live preview of what the token will look like if you apply it.

- **Default Tile:** The first tile is always the **Default** form. Clicking this returns the token to its original (or prototype) appearance (stripping the active Identity but keeping any active Overlays).
- **Live Preview:** The image shown is not just a thumbnail; it renders the actual token art, including any **Dynamic Ring** effects (Pulse, Wave, etc.) and video animations if you use a video file for the token image. It also shows the token at the selected opacity (against a chequerboard background to help see it is active).

### Badges & Indicators

To help you identify forms at a glance, tiles display **Chips** and **Badges** around the border to indicate specific data changes.

**Chip** and **Badge** locations and descriptions:

- Top left corner: **Default** The top left tile is always the Default and shows a gold icon.
- Top border: **Scale/Dimensions:** If a form changes the token's size (e.g., `2x2`) or scale (e.g., `150%`), a small chip will appear showing the new values. If the size is standard (`1x1`, `100%`), this chip is hidden to reduce clutter.
- Top right corner: **Active Identity** A green icon is shown in the top right corner of the Identity currently applied to the token.
- Bottom border: **Disposition:** If a disposition is set it will be shown here in the usual Foundry colours.

To the side of the image are additional icons, which show additional data changes:

- **Portrait**: If the Visage also changes the actor sheet portrait it will show a photo icon against a gold badge. Hovering over the icon will show the image.
- **Effects**: If the Visage has visual or audio effects, or has a light source configured, it will show a wand icon against a light blue badge. If you hover over the badge you will see a tooltip showing the effects.
- **Automation:** If the Visage has automation conditions attached, it will show a power icon. This icon is green if the automation is currently active and grey if it is disabled.
- **Rotation Lock**: If the token image has its rotation set.
- **Random Image:** If your image includes wildcards an icon will show in the bottom left corner. Applying this Visage again will choose a random image matching your wildcard settings.
- **Flip/Mirror:** If a Horizontal or Vertical flip has been applied, a purple icon will appear in the bottom right corner.

Most icons have a tooltip if hovered over them. The effects badge shows which effects will be applied for that Visage:

![Visage Selector HUD tile tooltip for effects](https://github.com/Filroden/visage/blob/main/images/visage_selector_hud_effects_tooltip.png?raw=true)

## Restore Default Token

If you want to reset the token to their "Original Form":

- Click the **Default Visage** (top left tile) and click the **Remove All Layers** button.
