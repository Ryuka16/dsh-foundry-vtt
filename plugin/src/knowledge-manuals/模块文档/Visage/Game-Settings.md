## Import Presets

Import pre-made Visages into your Global Library. These will be imported into their own categories. Visage and category names will be localised on import based on the current language set within Foundry. These presets are set as overlays and are intended to affect a single setting, so they can be added to the stack on any token and then be easily toggled from the Selector HUD.

![Import Visage Samples](https://github.com/Filroden/visage/blob/main/images/v3/visage-import-samples.png?raw=true)

Currently the module includes the following Visage packs:

- **Light Sources**: Apply light sources to simulate torches, candles, hooded/unhooded lanterns, etc. Lights use the DnD5e standard ranges but they can easily be edited once imported.
- **Token Sizes**: Presets for a range of token sizes (0.5 x0.5, 1 x 1, etc).
- **Image Scaling**: Presets to change image scale (50%, 200%, etc).
- **Image Orientation**: Image flips and mirrors.
- **Dispositions:** Friendly, neutral, hostile and secret.
- **Rotation Lock:** Lock on or off.

## Calendar Configuration

If your world uses a custom calendar, you can define the fundamental passage of time here to ensure time-based Visage automations calculate correctly.

- **Hours in a Day:** Defines the total hours in a single planetary day. Defaults to 24.
- **Minutes in an Hour:** Defines the number of minutes in a standard hour. Defaults to 60.

## Quick Visages

- **Default Quick Visage Image Directory**: Select a default folder. The Selector HUD will automatically display any images from this directory (and its sub-folders) that match a token's name.
- **Rebuild Quick Visage Cache:** If you add or remove images from your selected directory, click this button to update the cache so Visage can instantly find them.

## Export Diagnostic Log

Click this button to generate a JSON file containing your environment details, active modules, and Visage data to help the developer troubleshoot bugs.

## Specific System Overrides

Enable Visage to be able to override system specific token appearance protections. See [[System Specific Notes]] for more details.

## Disable Welcome Message

Turn off the 'Welcome to Visage' chat card.

## Cleanse Scene Tokens / Cleanse World Tokens

Removes all Visage module data from tokens in the current scene / in the world. Use these options with caution as there is no undo.

## Migrate Data

Manually trigger the data migration script.

- Use this option if you have imported old actors with Visage data from earlier versions.
- Use this setting if your Visages are not showing correctly.
