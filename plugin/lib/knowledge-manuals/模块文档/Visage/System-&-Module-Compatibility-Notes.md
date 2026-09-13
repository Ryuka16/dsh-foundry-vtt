Specific compatibility changes have been made to Visage to work correctly with the following systems and modules:

Systems:

- Pathfinder 2e (PF2E)

Modules:

- Baileywiki's Mass Edit and Scenescapes
- Dylan's Automated Tokens
- Token Magic FX (TMFX)

## Systems

### Pathfinder 2e (PF2E)

In the PF2E system, a token's dimensions and image scale are strictly locked to the Actor's statistics to ensure game rules (like reach, flanking, and emanations) work correctly.

If the "Specific System Overrides" game setting is enabled by the GM, then the module handles this lock for you:

- **Automatic Unlock**: If you apply a Visage that modifies the **Dimensions (Width/Height)** or **Scale**, Visage will temporarily unlock the token to allow the transformation.
- **Automatic Restoration**: If you remove that Visage, or edit the stack so that no active layers are modifying the size, Visage will **re-enable the lock**.
  - **Note**: This immediately returns control to the PF2E system, which will snap the token back to the correct size for the Actor.

## Modules

### Baileywiki's Mass Edit and Scenescapes

Visage is compatible with Mass Edit and its Scenescapes feature. When applying a Visage inside an active Scenescape, Visage will successfully apply your chosen textures and data, while gracefully allowing Mass Edit to adjust the token's final visual scale to maintain the scene's 3D depth of field.

#### Mass Edit Data Protection (Auto-Revert)

Because Mass Edit is incredibly powerful and bypasses Foundry's standard Token Configuration window, it views a token's currently visible "disguise" as its actual base data. If you were to apply bulk edits and save changes to a disguised token, Mass Edit would permanently bake that temporary disguise into the token's core data.

To prevent accidental data corruption, Visage features an automated safety workflow:

- **Pre-Emptive Revert**: If you select tokens with active Visages and open the Mass Edit tool, Visage will intercept the window. It will warn you of the risk and ask to temporarily revert the tokens to their default state.

- **Safe Editing**: If you accept, Visage removes the disguises, logs their exact configuration in memory, and allows Mass Edit to proceed with clean token data.

- **Automatic Restoration**: When you finish your bulk edits and close the Mass Edit window normally, Visage will prompt you to automatically restore all the removed Visages back onto your modified tokens.

- **Manual Restore (Safety Net)**: If you close the Mass Edit window and change your mind, or accidentally dismiss the final restore prompt, you can manually trigger the restoration loop by running this command in a Foundry script macro or your browser console (F12):

   ```javascript
   game.modules.get("visage").api.restoreMassEdit()
   ```

### Dylan's Animated Tokens

If Dylan's Animated Tokens is enabled, Visage will display a dedicated settings group within the Appearance tab. This allows you to configure any Visage as a sprite sheet.

Because DAT relies on user-interface interactions to calculate its image offsets, Visage cannot trigger DAT's internal calculations directly. Instead, Visage automatically replicates this logic behind the scenes to determine the exact anchor offsets and layout adjustments required. This makes sure any Visage applying a sprite sheet achieves the same canvas alignment as a native DAT token. Furthermore, Visage entirely bypasses this logic when applying standard static tokens, ensuring both modules run together without conflict.

![Dylan's Animated Tokens](https://github.com/Filroden/visage/blob/main/images/dylans_animated_tokens.png)

### Token Magic FX (TMFX)

#### Applying Token Magic FX: Filters vs. Macros

Visage provides two distinct ways to trigger Token Magic FX (TMFX) visual effects, but they handle lifecycle management very differently. Understanding this difference is crucial for building clean, automated Visages.

1. The "Add Filter" Button (Recommended)

   This is the native integration. When you apply a TMFX effect using the **Add Filter** button (selecting a Core Preset, a Community Gallery Preset, or pasting a Custom JSON Payload), Visage maintains complete control over that effect.

   - **Lifecycle Managed:** Visage assigns a unique tracking ID to the filter.
   - **Auto-Cleanup:** When the Visage is removed, toggled off, or overwritten by a new Identity mask, Visage explicitly commands TMFX to delete that specific filter, leaving everything else untouched.

2. The "Add Macro" Button (Unmanaged)

   Macros are powerful, but they act as a "black box". When you use **Add Macro** to trigger a custom TMFX script, Visage simply pushes the button to run your code. It does not know *what* your code actually does (whether it spawned a fire effect, played a sound, or sent a chat message).

   - **Lifecycle Unmanaged:** Because Visage cannot read the contents of your macro, it cannot automatically clean up the effects it creates.
   - **Manual Cleanup Required:** If you apply a TMFX effect via a macro, that effect will permanently stay on the token even after the Visage is removed, unless you manually clear it or write a secondary "On Exit" macro to remove it or an "on Entry" macro to clear pre-existing filters. It is also recommended to add a small time delay to the macro so that any token's appearance changes have been applied and the TMFX filter uses the new appearance properties.

**Best Practice:** Always use **Add Filter** for TMFX effects to ensure Visage can automatically clean up the canvas when the scene changes!

### Tokenizer

Visage accepts Tokeniser filenames (which use cache busters after the file type).
