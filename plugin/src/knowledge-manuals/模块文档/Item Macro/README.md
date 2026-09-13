# Item Macro
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Foundry-Workshop/Item-Macro?style=for-the-badge) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FFoundry-Workshop%2FItem-Macro%2Fmaster%2Fmodule.json&label=Foundry%20Min%20Version&query=$.compatibility.minimum&colorB=orange&style=for-the-badge) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FFoundry-Workshop%2FItem-Macro%2Fmaster%2Fmodule.json&label=Foundry%20Verified&query=$.compatibility.verified&colorB=orange&style=for-the-badge)  
![License](https://img.shields.io/github/license/Foundry-Workshop/Item-Macro?style=for-the-badge) ![GitHub Releases](https://img.shields.io/github/downloads/Foundry-Workshop/Item-Macro/latest/module.zip?style=for-the-badge) ![GitHub All Releases](https://img.shields.io/github/downloads/Foundry-Workshop/Item-Macro/module.zip?style=for-the-badge&label=Downloads+total)  
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white&link=https%3A%2F%2Fdiscord.gg%2FXkTFv8DRDc)](https://discord.gg/XkTFv8DRDc)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/foundryworkshop)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/forien)

This is a FoundryVTT module for the multiple systems (list below). It allow macros to be saved inside of an item and for various different ways to execute macros.  

You can execute the macro from the "item" class using the executeMacro(...args) function, from the character sheet (if the settings are satisfied to do so), from the hotbar using the default rollItemMacro function for your system (if the settings are satisfied to do so), or from token-action-hud.

# Installation

_**Item Macro v2.1.0 onwards will not work with DnD 5e 3.3.1**_   
_If you do not use the newest version of the DnD 5e system, please do not update Item Macro and install v2.0.1 instead using [this manifest link](https://github.com/Foundry-Workshop/Item-Macro/releases/download/v2.0.1/module.json)._  
_You can read more about these changes in [v2.1.0 Release](https://github.com/Foundry-Workshop/Item-Macro/releases/tag/v2.1.0) notes._

_**Item Macro v1.11.0 onwards will not work with DnD 5e 2.4.**_   
_If you do not use the newest version of the DnD 5e system, please do not update Item Macro and install v1.10.5 instead using [this manifest link](https://github.com/Foundry-Workshop/Item-Macro/releases/download/v1.10.5/module.json)._  
_You can read more about these changes in [v1.11.0 Release](https://github.com/Foundry-Workshop/Item-Macro/releases/tag/v1.11.0) notes._

1. Inside Foundry's Configuration and Setup screen, go to **Add-on Modules**
2. Click "Install Module"
3. Install module using one of the two approaches:
   - Search for the Module and install using the Module Manager, or
   - In the Manifest URL field paste: `https://github.com/Foundry-Workshop/Item-Macro/releases/latest/download/module.json`.

# Supported systems

Item Macro can be run on any system, but unless there is direct support for your system, you will only be able to trigger Item Macros manually (via Item Macro Config), or programatically (via normal Macros etc.)

- [Shadow of the Demon Lord](https://foundryvtt.com/packages/demonlord)
- [Dungeons & Dragons Fifth Edition](https://foundryvtt.com/packages/dnd5e)
- [Dragonbane](https://foundryvtt.com/packages/dragonbane)
- [Dungeon Crawl Classics](https://foundryvtt.com/packages/ddc)
- [Dungeon World](https://foundryvtt.com/packages/dungeonworld)
- [Old-School Essentials](https://foundryvtt.com/packages/ose)
- [Pathfinder Second Edition](https://foundryvtt.com/packages/pf2e)
- [Shadowrun 5th Edition](https://foundryvtt.com/packages/shadowrun5e)
- [Starfinder](https://foundryvtt.com/packages/sfrpg)
- [Savage Worlds Adventure Edition](https://foundryvtt.com/packages/swade)
- [Symbaroum](https://foundryvtt.com/packages/symbaroum)
- [Warhammer Fantasy Roleplay 4th Edition](https://foundryvtt.com/packages/wfrp4e)
- [Simple Worldbuilding System](https://foundryvtt.com/packages/worldbuilding)
- [World of Darkness 20th Edition](https://foundryvtt.com/packages/worldofdarkness)
- [Worls Without Number](https://foundryvtt.com/packages/wwn)

# Usage

Once activated, open an Item Sheet, click on the Item Macro button to open the Macro window.
![In Action](https://i.gyazo.com/a973845c112317bbef57691cfc657cb0.gif)

Various different settings will change the way Item Macro interacts with the game server.
![In Action](https://i.gyazo.com/34c41d778628a1b35adf11e0810e080c.png)

With no settings enabled, you can still execute the macro that is saved in the item, perfect for macros!
![In Action](https://i.gyazo.com/26ab88645e554ac5b7522a4e8b926e3c.gif)

Added context menu support allowing GM users to mass update item-macros on like named items throughout the game!
(the context menu is on items in the game directory, will update all item-macros in the item-directory, actor items, and token items)

## Added Item Functionality

1. `Item.hasMacro()` => returns boolean on if the item has a macro command
2. `Item.getMacro()` => returns Macro instance, if the item has a macro command
3. `Item.setMacro(Macro)` => overwrites and saves given Macro to the Item
4. `Item.executeMacro(...args)` => executes Macro command, giving `item`, `speaker`, `actor`, `token`, `character`, and `event` constants. This is recognized as the macro itself. Pass an event as the first argument.

## Added System Functionality

### Dungeons & Dragons Fifth Edition

Starting from v1.11.0, Item Macro changed how it's supporting DnD 5e (3.0.0+). Here is the breakdown:
1. Item Macro now directly listens to `dnd5e.preUseItem` Hook
   - Because of that, there no longer is distinction between using item from sheet, macro or any other way
   - Because of that, using plain `item.use()` in Item Macro is now disabled as it can lead to uncontrolled infinite loops
   - Since good practice dictates that all 3rd party modules, including custom sheets, should make use of `item.use()`, this means that all of them should now be supported by default
2. `Character Sheet Hook` and `Right Click Override` settings for dnd5e are now removed in favor of single `Override default macro execution`
3. Item Macros that you wish to still execute "standard" `item.use()` must now do it in one of two ways:
   1. Return `true` from macro, or
   2. Call `item.use({}, {skipItemMacro: true})` instead (passing `skipItemMacro = true` in `options` argument)

### Simple Worldbuilding

* Item names on actor sheets have been converted to rollable links that will execute the macro attached to the item when the "Enable Character Sheet Hook" is enabled.
* Item names will now highlight on hover to indicate this added functionality.
* Dragging an item to the hotbar will create a macro utilizing an added system helper `game.worldbuilding.rollItemMacro(itemNameString)`.
* Dropping formula-type item attributes will continue to create the default `new Roll` system macro.

# Contact

For questions, feature requests, or bug reports, feel free to contact me on the Foundry Discord (`forien`) or open an issue here directly.

You are also welcome to [join my Discord](https://discord.gg/XkTFv8DRDc) where you can talk about this and other Foundry modules.

# Support

If you wish to support module's development, please consider [becoming my Patreon](https://www.patreon.com/foundryworkshop) or donating [through Paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6P2RRX7HVEMV2&source=url) or [Ko-Fi](https://ko-fi.com/forien). Thanks!

# Acknowledgements
* Big shoutout to Kekilla, the original author, for making this module!
* Thanks to Honeybadger for contributions and keeping module functional
* Thanks to kgar for contributing compatibility with his `Tidy 5e Sheet` module!

# License

This Foundry VTT module, written by Kekilla, is licensed under a [MIT License](https://github.com/Kekilla0/Item-Macro/blob/main/LICENSE).

This work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).
