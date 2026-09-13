The Effects tab allows you to configure dynamic rings, light sources, and (if you have the Sequencer or Token Magic FX modules enabled) visual, audio, and shader effects.

## The Effects Tab

![Visage Local Editor Effects Tab](https://github.com/Filroden/visage/blob/main/images/local_editor_effects.png)

The tab is organised as follows:

- **Timeline**: Open the Effect Timeline where you can drag visual and audio effect start times relative to the token appearance change.
- **Add Visual / Add Audio / Add Filter / Add Macro**: Buttons to create new effects or call macros.

  > Note: The Add Visual and Add Audio buttons will only show if you have the *Sequencer* module enabled. The Add Filter button will only show if you have the *Token Magic FX* module enabled.

- **Dynamic Ring**
- **Light source**
- **Foreground visual effects**
- **Background visual effects**
- **Audio effects**
- **TokenMagic Filters**
- **Macros**

Effect Cards have up to three controls:

- **Loop playback:** Toggle this control on (default) to play the effect on a continuous loop. Toggle it off to only play it once, when the Visage is applied.
- **Visibility:** You can toggle the visibility of each effect on and off. This affects both the live preview and the Visage itself. It allows you to create additional effects and enable/disable them without having to delete and recreate them.
- **Delete effect:** You can also delete each effect. A confirmation warning will appear.

   > *Note: You can apply any number of visual or audio effects to the Visage or call as many macros as you want on this tab, but only one dynamic ring and one light source can be configured.*

The order of effects can be changed within each group by dragging and dropping them. You can also move visual effects between the foreground and background groups and the module will automatically change the effect to appear either above or below the token.

## The Inspectors

Clicking on any card (Ring, Light, Visual, or Audio) opens the **Inspector** panel to configure its specific settings.

### The Dynamic Ring Inspector

- **Colours:** Customise the **Ring Colour** (the glowing band) and the **Background Colour** (the fill behind the token).
- **Subject Texture Override:** Only use this override if you specifically need the Ring Subject to differ from the Token Image.
- **Subject Scale:** Adjusts how large the subject texture appears within the ring boundary.
- **Effects:** Checkboxes to apply special animations like **Pulse**, **Gradient**, **Wave**, or **Invisibility**.

### The Light Source Inspector

Configure specific settings for the light, including Dim Radius, Bright Radius, Colour, and Animation Types (like Torch or Pulse).

### The Visual / Audio Effect Inspector

- **Label:** An internal name for the effect to help you identify it in the stack.
- **Path:** The file path to the effect. You can use the File Picker to select a local file, or the Sequencer Database button to browse the Sequencer library and copy the Database Key. You can use partial keys and Visage will randomly select any effect that matches the partial key.
- **Start Delay (s):** Set how long *before* (negative) or *after* (positive) you want the effect to start compared to the token's appearance change. This setting is in seconds.

**Visual Settings:**

- **Scale:** Adjust the size of the effect relative to the token.
- **Rotation:** Set a static rotation in degrees, or check **Randomize** to apply a random rotation.
- **Bind Rotation:** Set if the effect should rotate with the token or remain fixed in place. Default is true.
- **Offset X/Y:** Adjust the position of the effect. Units are in `token units` where a value of `1` moves the effect 100% of the token's width.
- **Bind to Sprite:** Set if the effect should follow the token's image or remain attached to the token's logical position (the grid). Default is true.

- **Opacity:** Controls the transparency of the effect.
- **Blend Mode:** Changes how the effect's colors interact with the token and background.
- **Tint:** Apply a colour tint to the effect (whether it is an image or video file).

- **Layer Priority:** Manually switch the effect between "Above" (Foreground) and "Below" (Background).

- **Advanced Sequencer Settings:**

  - **Rendering:** Toggle Mask to Token (clips the effect to the token's artwork) and Constrained by Walls (prevents the effect from bleeding through line-of-sight blockers).
  - **Fade In Transitions:** Duration (ms) and Animation Easing.
  - **Scale In Transitions:** Duration (ms), Scale Multiplier and Animation Easing.

    > Note: Setting a value for Scale Multiplier larger than one will make the visual effect start large and then reduce in size over the duration using the chosen easing curve. A value less than one will start smaller and then increase in size.

**Audio Settings:**

- **Volume:** Controls the playback volume of the sound effect relative to your global volume settings.
- **Fade In/Out (ms)**: Set how quickly the audio's volume fades in or out. Set it to 0 for no fading. This setting is in milliseconds.

### The TokenMagic Filter Inspector

- **Label:** An internal name for the filter to help you identify it in the stack.
- **Filter Preset:** A dropdown menu containing all registered Token Magic FX presets (including any custom ones you have created).
- **Custom JSON Payload:** For power users, you can input a raw JSON array to define bespoke WebGL filters. *Note: If this field is populated, it will completely override any selection made in the Filter Preset dropdown.*
- **Start Delay (s):** Set how long *before* (negative) or *after* (positive) the token's appearance change you want the filter to apply. This setting is in seconds.

> **Strict JSON Formatting for Custom Payloads:** If you are copying filter parameters directly from a standard TokenMagic FX macro, be aware that Visage requires **Strict JSON**. Standard JavaScript objects (which are often used in Foundry macros) will fail to parse and will be ignored by the module.
>
> **Converting Macro Code to JSON:** Visage includes an "Auto-Format" button right above the Custom Payload text box. You do not need to edit the code—simply paste the entire standard TokenMagic macro directly into the box and click the button. Visage will automatically strip away the macro wrapper, extract the core filter parameters, fix any missing quotes, and convert Hex colors to Decimal for you.
>
>Alternatively, if you want to convert the code yourself before pasting it into Foundry, you can use the F12 Developer Console in your browser:
>
>1. Press F12 to open your browser tools and navigate to the Console tab.
>2. Type `JSON.stringify(`
>3. Paste your raw TokenMagic array.
>4. Type `)` and press Enter.
>5. The console will output a perfectly formatted, strict JSON string that you can safely paste into Visage.

> **Important Preview Note:** Token Magic FX uses WebGL shaders that strictly require a physical token on the active canvas to render. Because of this, **filters cannot be previewed in the Visage Editor's Live Preview Stage**. A warning banner will appear in the inspector to remind you of this. To see the filter in action, simply apply the Visage to a token on the scene.

### The Macro Inspector

- **Label:** An internal name for the effect to help you identify it in the stack.
- **Macro UUID:** The Foundry UUID for the macro (e.g., `Macro.2rLaa0AlFD9KDdgl`).
- **Start Delay (s):** Set how long *before* (negative) or *after* (positive)  the token's appearance change you want to call the macro. This setting is in seconds.

## The Timeline

Visual, audio, macro, and filter effects can also be set using the Timeline. Drag the effect's block along the timeline. If blocks overlap, the timeline will stack them so they are always visible. Changes made inside the Timeline automatically update each effect's delay setting.

![Visage Timeline](https://github.com/Filroden/visage/blob/main/images/local_timeline.png)
