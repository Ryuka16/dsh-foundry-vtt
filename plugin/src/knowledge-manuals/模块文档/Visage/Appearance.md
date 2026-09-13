This section controls the standard token properties.

![Visage Local Editor Appearance Tab](https://github.com/Filroden/visage/blob/main/images/local_editor_appearance.png)

You can set:

- **Name Override:** Changes the text displayed on the token's nameplate. This is perfect for disguises (e.g., an NPC named "Strahd" using a Visage to appear as "Vasili").
- **Image Path:** The file path to the token artwork. This supports static images (`.png`, `.webp`), video files (`.webm`, `.mp4`), and **Wildcards**.
- **Actor Portrait:** The file path to the actor sheet portrait artwork.

- **XYZ or Width/Height/Depth:** Changes the physical grid size of the token (e.g., setting Width/Height/Depth to `2` makes the token take up a 2x2x2 space, effectively "Enlarging" it).
- **Scale:** Adjusts the visual zoom of the artwork inside the token frame. Great for creating the illusion of size without changing the token's actual size.
- **X/Y Anchor Points:** Set the image offset from the centre of the token's footprint.
- **Opacity:** Change if the token should be semi-transparent. Great for creating ghost effects, or to indicate invisibility.

- **Disposition:** Overrides the token's border colour:
  - **Friendly:** Green.
  - **Neutral:** Yellow.
  - **Hostile:** Red.
  - **Secret:** Purple (Appears as owner's default to them, but has no border for others).

- **Rotation Lock:** Set whether the token's image should rotate as it moves.

- **Mirroring:** Flips the image horizontally or vertically.

- **Animate Transition**: Determine if the token will use the standard Foundry transition animation when the Visage is applied or not.

> **Note:** Both Rotation Locks and Mirroring have three states:
>
> - **Unset/no change:** this means the token will inherit these settings from the stack or the default token.
> - **Off/Standard:** this positively sets the token to rotate or to have the standard mirroring direction. This is useful to make sure your Visage overrides whatever is set on the token beneath it.
> - **On/Flipped:** this positively sets the token to have no rotation or to have the flipped mirroring direction.
