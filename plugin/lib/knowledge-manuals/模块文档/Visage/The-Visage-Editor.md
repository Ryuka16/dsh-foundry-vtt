The **Visage Editor** is where you define the look and feel of your transformations. Whether you are creating a specific look for a character (Identity) or a generic effect for the world (Overlay), the interface is unified, giving you full control over every cosmetic aspect of the token.

## The Interface Layout

![Visage Global Editor](https://github.com/Filroden/visage/blob/main/images/global_editor.png)

The editor is divided into a header (for Visage metadata), a large preview stage (to see what it will look like) and a side panel with three tabs allowing you to configure core appearance, effects, and automation.

## Editor Header

The header contains information about the Visage to make it easier to find in the Visage Library.

You can set:

- **Label:** The display name of the Visage (e.g., "Wolf Form" or "Invisibility"). This is just to help you find it; it is not applied to the token.
- **Visibility:**
  - [Global Visages only] In the Global Visage Editor there is an additional toggle to make the Visage "Public" or "Private" (the default). Public global visages become visible inside players' Selector HUDs and they can apply them to their own tokens.
  - [Local Visages and GM only] In the Local Visage Editor there is an additional toggle to make the Visage "Visible", "Locked" or "Hidden".
    - "Visible" Visages can be seen and edited by the owning player (the default).
    - "Locked" Visages can be seen by the owning player but not edited.
    - "Hidden" Visages cannot be seen by the owning player unless they have been applied by the GM to their token.
       > Note: When a "Hidden" Visage is applied it will show in the player's Selector HUD with the label "GM Applied Identity" or "GM Applied Overlay". Players cannot remove any "Hidden" Visages applied by the GM.
- **Mode:** Set whether the Visage will be applied as an **Identity** or as an **Overlay**.
- **Category:** Use this to group items in the Library (e.g., "Dispositions", "Outfits", "Conditions"). You can enter anything here. It will show you a dropdown of existing categories and try to autocomplete as you type.
- **Tags:** Add searchable keywords to help find this item later (e.g., "Beast", "Fire", "Illusion"). You can enter anything here. It will show you a dropdown of existing categories and try to autocomplete as you type. Pressing Enter or Tab will "complete" the current tag (it will turn into a pill) and allow you start adding another.

## The Live Preview Stage

- **Live Preview:** The largest area is given to a live preview stage to show an approximation of how your token will look when this Visage is applied. If no token image is selected it will show the Visage icon instead (so you can still see the effects of scale, width/height or opacity changes). The stage can pan and zoom using the mouse or the icons which appear when you hover over the area. You can also reset the stage to fill the area with the token. You can also toggle a grid to show the current size of the token (in map grid units). This allows you to get a sense of how scale, width and height are affecting the token.
- **Visage metadata settings:** Beneath the stage is a summary of the main appearance settings showing exactly the same detail that will appear on the Visage's card inside the Library.

## The Configuration Tabs

To the right of the live preview stage are three tabs where you build your Visage:

- **[[Appearance]]:** Change the core token properties like image, scale, and dimensions.
- **[[Effects]]:** Add dynamic rings, lighting, and audio/visual effects.
- **[[Automation]]:** Set up rules to automatically apply or remove the Visage based on game events.
