# [[Monk's Little Details|https://foundryvtt.com/packages/monks-little-details]]

A module that provides a lot of tiny quality-of-life changes.

# Installation

Install the module via Foundry's Add-on Modules screen.

# Usage & Features

This module contains a great many features; all of them can toggled or modified in the module settings.

### Add DnD Statuses

This feature adds more conditions commonly used in D&D 5th Edition to the status effects. This is available for most systems (besides PF2), but only 5e will have the statuses pre-populated. Effects added by this module are visual only and do not allow for modifying actor statistics.

#### Custom Status Effects

You can add custom effects in the module settings. Effects added by this module are visual only and do not allow for modifying actor statistics.

* $\color{red}{\textsf{PF 2E:}}$ This feature does not work in this system.

### Altered Token Statuses

[[https://github.com/ironmonk88/monks-module-wiki/blob/866188e245f7768e85da0cf119bc837837014b9b/Monks_Little_Details/Altered_Token_HUD_Statuses/Altered_Token_HUD_Statuses.png]]

This features adds names to the statuses so you don't need to remember what status is what. It also adds a ``Clear All`` button at the top that will remove all statuses from that token.

### Compendium Art Updater

[[https://github.com/ironmonk88/monks-module-wiki/blob/1f242085b7934c352dc721f4a6f61db99267c6cc/Monks_Little_Details/Compendium_Art_Updater/Compendium_Art_Updater.png]]

This is accessed via a button in the module settings, and allows you to select a compendium and update actor and token art, along with actor sounds from [[Monk's Sound Enhancements]].

The three folders will be searched one by one in order; for example, if you would prefer your art to be prioritized with topdown art first, then framed art, then unframed art:

* Folder 1 targets a folder with topdown token art.
* Folder 2 targets a folder with framed token art.
* Folder 3 targets a folder with unframed avatar art.

It will search folder 1 for any matching art, then search folder 2 for any matching art that is still missing, then do the same for folder 3.

### Compendium Shortcuts Toolbar

[[https://github.com/ironmonk88/monks-module-wiki/blob/237685ae4a10bd10e98240dceceaa355be6b67c6/Monks_Little_Details/Compendium_Shortcuts_Toolbar/Compendium_Shortcuts_Toolbar_Example.gif]]

Adds a row of shortcut buttons to jump to each section of the compendium types.

Also adds `Type` & `Source` sorting to the compendium directory, as well as allowing folders to have their own sorting.

### Core CSS Changes

#### Image Changes

[[https://github.com/ironmonk88/monks-module-wiki/blob/599d62ab9fef74b43d1eebd2e36e1563ca9521d0/Monks_Little_Details/Core_CSS_Changes/Core_CSS_Changes_Compendium.png]]

Changes the images displayed for filepickers & compendiums to contain the image instead of cropping them.

#### Scene Compendium Changes

[[https://github.com/ironmonk88/monks-module-wiki/blob/b45948c96f907a1982452b4bfc657f832b78af55/Monks_Little_Details/Core_CSS_Changes/Core_CSS_Changes__Scenes_Compendium.png]]

Changes scene compendiums to match the scene directory styling; the wider image will more closely match the scene preview from the directory.

### Dual Monitor

Lets you choose where a new pop up window will be centered.
* None
* Left
* Right

### File Browser Favorites

[[https://github.com/ironmonk88/monks-module-wiki/blob/95e56310b0428c9cd5f68af9df68b54ed51aa7ae/Monks_Little_Details/File_Browser_Favorites/File_Browser_Favorites.png]]

Adds a dropdown in the file browser to select your commonly used folders; you can also favorite these folders to always have quick access to them.

### Find My Token

[[https://github.com/ironmonk88/monks-module-wiki/blob/9234745de69af8859b20d53fe8d33045a5516af8/Monks_Little_Details/Find_My_Token/Find_My_Token.png]]

Adds a button on the token tools side; clicking the button works slightly differently depending on the permission level of the user.

* Gamemaster: Cycles the GM's currently selected token through all tokens on the scene.
* Player: Selects their currently assigned token and pans the canvas to it. 

### Gamemaster Teleport Tokens

[[https://github.com/ironmonk88/monks-module-wiki/blob/8d2cad868d8660426fb55978df498fd6aa7d632b/Monks_Little_Details/GM_Teleport_Tokens/GM_Teleport_Tokens.gif]]

Adds a hotkey (default `M`) so the Gamemaster can teleport tokens around the scene without revealing the fog of war between.

### ~~Hide Unused Cursors~~

$\color{red}{\textsf{This feature has been removed in v13 due to Foundry locking out that option.}}$

~~Hides unused cursors from any user levels that lack permission to use them. Core Foundry just sticks unused cursors in the upper left corner; this can lead to meta-gaming and players being able to figure the map size when it isn't meant to be, such as turning off Fog Exploration and using a black canvas background like the example pic.~~

### Highlight Status Effects

[[https://github.com/ironmonk88/monks-module-wiki/blob/cb8841c5badcaa81661457d05966dd1ce3573924/Monks_Little_Details/Highlight_Status_Effects/Highlight_Status_Effects.png]]

Highlights status effects icons in the token HUD; if you use colored status effect images you may want to disable this in the module settings.

### Macro Tabs

Hitting the `Tab` key in the macro editor will add an indent instead of tabbing to the next field.

### Macro Editor Memory

Saves the size & positioning of the macro editor window; this is per-macro.

### Module Management Changes

Adds coloring to denote module dependency and availability; and allows clicking on dependencies to scroll to them in the module list.

### Move Pause Icon

Moves the game paused icon to the center of the screen in an attempt to increase visibility and decrease the rate of the question "Why can't I move?".

### Pause Border

[[https://github.com/ironmonk88/monks-module-wiki/blob/e9d978028574f1f96149f749385706516bb4751c/Monks_Little_Details/Paused_Border/Paused_Border.png]]

Adds a highlight around the edge of Foundry while the game is paused to help indicate that the game is paused. The color can be configured in the module settings.

### Quick Copy Filepath

[[https://github.com/ironmonk88/monks-module-wiki/blob/ee09a767bfee2336c9e1ce583e04462329d31633/Monks_Little_Details/Quick_Copy_Filepath/Quick_Copy_Filepath.png]]

Adds a button in the header of various document types to quickly copy their image filepath; so you don't need to import things or unlock a compendium in order to get an image you want to use elsewhere.

### Quick Transform

[[https://github.com/ironmonk88/monks-module-wiki/blob/c7900a3a9ab03adcc33daa1921463cf234943fd1/Monks_Little_Details/Quick_Transform/Quick_Transform.gif]]

Adds the `Transform` option to the right-click context menu on actors. Requires the 5e setting `Allow Polymorphing` on.

D&D 5th Edition only.

### Reposition the Collapsed Sidebar Button

Moves the sidebar button when collapsed so it's always in the same general location as it's un-collapsed location.

### Right Click to Open Last Actor

Right-clicking the actor directory will provide slightly different functionality depending on the permission level of the user, instead of popping out the actor directory.

* Gamemaster: Opens the last opened actor sheet.
* Player: Opens the character sheet of their assigned actor.

### Scene Palette

[[https://github.com/ironmonk88/monks-module-wiki/blob/f03b0c1a4cb105b424c5d2ae75256462b3b1b59f/Monks_Little_Details/Scene_Palette/Scene_Palette_Example.gif]]

Adds this button to the scene configuration window; when it runs, it will pick the top 5 most dominant colors of that scene and let you set the scene's background color to one of those; calculating the colors may take several seconds depending on the size of the scene.

### Sidebar Memory

Saved the last tab shown and the expand state of the sidebar so upon next load Foundry will restore what you were looking at.

### Sort Status Effects

Allows you to sort status effects alphabetically in the token HUD in rows, columns, or leave in the default unsorted state.

### Swap Target and Settings Buttons

[[https://github.com/ironmonk88/monks-module-wiki/blob/bc6e3350800272489d987fe166276a5a08fdbab7/Monks_Little_Details/Swap_Buttons/Swap_Buttons.png]]

Moves the target button on the token HUD to the middle and the settings button to the bottom.

### Tool Layer Hotkeys

Adds configurable hotkeys to quickly swap between tools.

### Use DnD 5th Edition Invisible Icon

[[https://github.com/ironmonk88/monks-module-wiki/blob/2e8a6753b60ae857723067922d7c36e5c096dbd7/Monks_Little_Details/Swapped_Invisible_Icon/Swapped_Invisible_Icon.png]]

On the token HUD's show/hide button, this replaces core Foundry's cloaked figure icon with the same icon used for D&D 5th Edition's ``Invisible`` condition.

### User Palette

[[https://github.com/ironmonk88/monks-module-wiki/blob/385dd76d2cada18f1e4164da31b7808d8dc62629/Monks_Little_Details/User_Palette/User_Palette_Example.gif]]

Adds this button to the userconfiguration window; when it runs, it will pick the top 5 most dominant colors of that user's profile image and let you set the user's color to one of those.

### View Compendium Scene's Artwork

Adds an button to scenes in a compendium will open a preview window of that scene's artwork.

This feature does not work if the scene does not have a background image.

# Bug Reporting

Please feel free to contact me on Discord if you have any questions or concerns. ironmonk88#4075

If submitting a ticket, please do so on this module's GitHub [[here|https://github.com/ironmonk88/monks-little-details/issues]].

# License
This Foundry VTT module, written by Ironmonk, is licensed under [GNU GPLv3.0](https://www.gnu.org/licenses/gpl-3.0.en.html), supplemented by [Commons Clause](https://commonsclause.com/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).