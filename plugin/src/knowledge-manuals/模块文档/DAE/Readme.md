![](https://img.shields.io/badge/Foundry-v10-informational)
![](https://img.shields.io/badge/Foundry-v11-informational)
![](https://img.shields.io/badge/Foundry-v12-informational)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fdae&colorB=4aa94a)

Discord <a href="https://discord.gg/Xd4NEvw5d7"><img src="https://img.shields.io/discord/915186263609454632?logo=discord" alt="chat on Discord"></a>

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/tposney)
# Dynamic effects using Active Effects (DAE)



Replacement for dynamic effects

If you have a problem please read the [Issues section](#issues) before reporting a bug.
There is a dedicated discord server for my modules where you can get lots of help: https://discord.gg/BCAYr2D7wE
## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:

`https://gitlab.com/tposney/dae/-/raw/dndv4/src/module.json`

4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

### libWrapper

This module uses the [libWrapper](https://github.com/ruipin/fvtt-lib-wrapper) library for wrapping core methods. It is a hard dependency and it is recommended for the best experience and compatibility with other modules.

### socketLib

This module uses the [socketLib](https://github.com/manuelVo/foundryvtt-socketlib) library for wrapping core methods. It is a hard dependency and it is recommended for the best experience and compatibility with other modules.

## What does DAE do?

First off you probably don't need DAE. The core Foundry system has active effects that do at least 80+% of what you might want. I encourage you to try using just the core active effects and consider DAE *only* if you run into a roadblock on what you want to do.

Foundry core active effects attach to an item and are designated as transfer or non-transfer.
Transfer Effects are transferred to the actor that owns the item when the item is added to the actor's inventory and removed when the item is removed. This is a core foundry function and the implementation of this is done by core foundry.
Non-transfer Effects are not moved from the item to any actor without additional functions, which DAE and Midi-QOL provide.

You can also create active effects directly on an actor and bypass the whole transfer/non-transfer question.

This module modifies how active effects behave over and above what is supported in core. An active effect allows you to modify values on an actor (e.g. Strength). You can create effects directly on an actor or create them on an item and have them transfer to the actor when the item is added to the actor.

DAE does add some features to core active effects, so if the following features might be useful go ahead and use DAE. DAE builds on the core active effects so any core active effect is also a DAE active effect. Any place you edit a core active effect you can use the expanded active effects features.

- Editing of owned item effects is fully supported.
- The ability to reference actor data in active effects data fields like `@abilities.str.value` where core restricts you to numbers and strings. If an active effect modifies a field that will be used in a roll like `system.bonuses.mwak.attack` (and soon to be .bonus fields - dnd1.5), a string field like `@abilities.dex.mod` will get looked up when the roll is made.
- The ability to update derived fields, such as `abilities.dex.mod`. (Work in progress some of these do not do what you might expect, good example initiative mod/bonus).
    * Most/Some of these will be redundant after dnd1.5.
- The ability to perform arithmetic in field data definitions, like `ceil(@classes.rogue.levels/2)`
- Support for an API that allows non-transfer effects to be applied to a target token. In combination with Midi-QOL it allows you to have spells/weapons/features apply non-transfer effects to other tokens.
- An extended active effect editor that provides `CUSTOM` fields, a list of valid fields, a drop down list of options, drop down lists for restricted field values, and the ability to set the priority of an effect.
- The ability to call macros when active effects are applied to an actor.
- Several short hand CUSTOM effects to simplify giving all damage immunities and so on.
- DAE makes the actor flags available in actor.getRollData(), so you can dereference @flags. in expressions
- [Create items tied to an ActiveEffect](##Creating-items-with-DAE), so when the ActiveEffect is deleted, the item disappears as well. Useful for transformations or conjured weapons.

# Index
[Active Effect Expiry](##Active-Effect-Expiry)
[Stackable effects](##Stackable-effects)
[Editing Active Effects](##Editing-Active-Effects)
[Macros](##Macros)
[Macros and transfer effect](##Macros-and-transfer-effect)
[Creating items with DAE](##Creating-items-with-DAE)
[Macro Functions](##Macro-Functions)
[Useful bits](##Useful-bits)
[Sample Items/Macros](##Sample-Items/Macros)
[Module Integrations](##Module-Integrations)
[Issues](##issues)

## Active Effect Expiry

Expiry of effects requires additional [modules](#Module Integrations) to be installed. All of the modules play nicely together. If times-up is installed it takes over the expiry of timed effects.
* about-time provides time based expiry (i.e. duration in seconds/minutes and rounds converted to seconds).
* times-up supports time based expiry plus knows about rounds/turns and links to the combat tracker.
* Midi-QOL supports a handful of special expiries (see below) that are otherwise tricky to support.

When entering the start time on the DAE duration tab the value is interpreted as an offset from the current game time. So 0 means now, +60 means in 1 minutes time, -30 means 30 seconds ago

If you use the special durations listed below be aware that any temporary effect must have a time duration as well. If you don't specify one (in the item or the effect) it will be assumed to be 6 seconds, which means it will expire at the start of the next round. If you want to make sure the special duration will work (i.e. start of the actors next turn) put in a dummy duration that is certain to be long enough, i.e. 2 rounds.

 $`\textcolor{#e67300}{\textsf{\small{Requires Midi-QOL 0.3.35+}}}`$ and does *not* depend on about-time/times-up
Effects support additional expiry options (available on the DAE effect duration screen) that can be chosen:
  * 1Attack: active effects last for one attack - requires workflow automation
  * 1Action: active effects last for one action - requires workflow automation
  * 1Hit: active effects last until the next successful hit - requires workflow automation
  * isAttacked: the effect lasts until the next attack against the target. Requires workflow automation.
  * isDamaged: the effect lasts until the target takes damage. Requires workflow automation.
  * 1Save: the effect lasts until the target makes a save roll. Requires workflow automation.
  All of these effects automatically expire at the end of the combat.
  * Long Rest/Short Rest/New Day
  * There are lots of variations on the above to support different damage types/saves

Requires times-up installed and active:
  * turnStart: effects last until the start of self/target's next turn (check combat tracker)
  * turnEnd: effects last until the end of self/target's next turn (checks combat tracker)
  * If you want an effect on a target that expires at the start of the caster's next turn set the duration to 1 round
  * If you want an effect on a target that expires at the end of the caster's next turn set the duration to 1 round + 1 turn.

See also Midi-qol and OverTime effects which support some conditional expiry options if the actor is in combat.

## Stackable effects

Active effects have a stackable property to define what happens when a new copy of an effect is applied to an actor.
The options for stacking effects are:
  - multi: No existing effects will be removed when this effect is created.
  - none: only one effect with the same origin can be created. So if an item can apply different effects only the most recently applied will be present.
  - noneName: Only one effect with a given name for an origin (item/actor) can exist on an actor. If an existing effect has no origin it **will not** be removed by this option.
  - noneNameOnly: Only one effect with the given name can exist on actor independent of where it came from. This option **will** remove effects with no origin if the name matches.
  - count: dae keeps and displays a count of how many times an effect has been applied, but there is only one effect on the item.
  - DAE applies the rule for the newly created effect, but **does not** re-examine existing effects for their rules. For example:
    - If you have an existing effect with noneNameOnly and apply an effect with noneName the effect creation will go through and both effects will be present. 
    - If you have an existing effect with none and apply an effect with multi, both effects will be present.
  - The check for existing effects (and their removal) is performed **before** the new effects are created, and will only removes effects already on the actor. If you create 2 effects in the same create effects call they will both be created, even if the stackable options would not allow them if created one after the other.
  - If no stacking setting exists on an effect when it is created DAE will set the stackable option
    - Effects whose origin is an actor are set to "multi".
    - Effects whose origin is an item will be set to "noneName".

You can refer to ##/@stackCount for stackable effects which can be used in active effect evaluation. Since you almost always want to refer to the stackCount on the target, for non-passive effects remember to use ##stackCount so it will evaluate on the target not the caster/attacker and for passive effects @stackCount.

## Editing Active Effects

A preliminary edit function is supplied, which may change in the future.
Active effects for Actors and Items can be edited.

### Actor Active Effects

On the title bar of the character sheet is a button for "DAE" that will display a form showing all of the active effects on the actor (transfer and non-transfer). You can change the actor effects to your heart's content - HOWEVER changing the effects on the owned item will overwrite the corresponding active effects on the actor. You are free to create active effects on the actor that are not linked to any item.

Active effects that are transfer effects are displayed with a down arrow. Non-transfer effects are displayed with a right arrow.

If the effect has a duration, the remaining duration is displayed in rounds/turns or seconds.

### Calculations

Core system active effects are calculated before the game system specific calculation of "derived" fields (prepareDerivedData). For dnd5e prepareDerivedData calculates all the ability modifiers, skill totals, and spell slots available. DAE adds an additional effect application pass that occurs after the system specific prepareDerivedData() completes.

Active Effects define the following calculations:
* `CUSTOM`: system/module specific calculation. DAE specifies lots of CUSTOM effects.
* `ADD`: Add a value to the field (if it is numeric) or concatenate if the field is a string.
* `MULTIPLY`: for numeric fields only, multiply the field by a value.
* `OVERRIDE`: replace the field with the supplied value.
* `UPGRADE`: for numeric fields replace the field with the supplied value if it is larger than the field.
* `DOWNGRADE`: for numeric fields replace the field with the supplied value if it is smaller than the field.

Additionally, there is a priority that can be given to each change within an effect. The priority determines the order in which changes will be applied during the applyEffects stage. All changes across all effects are collected and sorted by priority before application (low to high). The default priority for changes are
  * `CUSTOM:     0`
  * `MULTIPLY:  10`
  * `ADD:       20`
  * `DOWNGRADE: 30`
  * `UPGRADE:   40`
  * `OVERRIDE:  50`
So if an actor has the following changes,
`system.attributes.hp.max ADD 10`
`system.attributes.hp.max OVERRIDE 20`
then with default priorities hp.max will be 20, since overrides comes after ADD. If priorities are assigned `system.attributes.hp.max  ADD 10        Priority:100`
`system.attributes.hp.max  OVERRIDE 20   Priority:10`
hp.max will become 30.

DAE allows you to use expressions as well as fixed values. So for example you could have the following
`system.attributes.hp.max ADD "@classes.paladin.levels * @abilities.con.mod"   Priority:100`
`system.attributes.hp.max OVERRIDE "10 + 5 + 6 + 10"   Priority:10`
hp.max will be set to `31 + con.mod * paladin levels`

**Roll once expressions**

```
  system.attributes.ac.value UPGRADE [[1d20+@abilities.dex.mod+5]]
```
When the effect is applied to the actor the expression inside `[[]]` will be evaluated as a roll and the resulting value will replace the change value, all the normal substituions will be appliied (and the @ and ## fields are supported).

**Number** fields are fully evaluated during the applyEffects pass.
**String** fields are not evaluated at all. So setting `system.bonuses.mwak.attack ADD "@abilities.str.mod * 2"` will be evaluated when the attack is rolled, NOT during the prepare data phase, since `system.bonuses.mwak` is a string field.
* Recognizing what are base and derived values is important, since during the first applyEffects phase ONLY base data values are available. If the target field is a string field it does not matter which pass it is in, since evaluation only occurs when the field is used to do a roll.

DAE defines a game system specific set of "derived" values, which are calculated after the system specific prepareDerivedData is called. For DND this means after all modifiers etc are calculated.

### Argument Evaluation

When an effect is applied to an actor (passive or non-transfer) dae will make some changes to the change.value string.

If the effect is applied as a passive/transfer effect few alterations are made.
* If the key is StatusEffect the contents of the referred effect is looked up and added to the effect (this means the number of changes will increase), the name of the effect is changed to the status effect and the icon is changed to the status effect icon.
* If the change has an inline roll specified, the roll is evaluated and the return value replaces the inline roll in change.value
* If the change has @tokenUuid (or @targetUuid) or @actorUuid it is replaced with the uuid of the actor or actor's token (if there is one). This can be useful in some condition evaluation where you can access the actor/token.

The rest of the @fields are left untouched to be looked up when the effect is evaluated in actor.prepareData().

If the effect is a non-transfer effect (i..e applied when you use an item) it is a little more complicated. You may want to refer to values on the actor/token using the item or on the target of the item use. DAE uses the following rule:
@fields are looked up in the actor/token using the item and the @field is replaced with the value from the actor using the item
##fields are not evaluated and the ##field string is replaced with an @field in the change value created on the target actor - where they will follow the evaluation rules for passive effects.

Here's a little example, assume a strength 18 actor which attacks with an item against a strength 10 target which applies an active effect:
@abiltiies.str.mod will evaluate to 18
##abilities.str.mod will evaluate to @abilities.str.mod (and evaluate to 10 when prepareData is called).

For macro.XXXX changes there are a lot of other fields available which will be converted when the effect is applied to the target actor. Look at the macros section.

#### Supported fields for dnd5e

**Pretty much @system.abilities.anything is supported.**

<details><summary>The current list of derived fields for dnd5e - click to expand</summary>
<br>


Fields that have a mode specified below means that ONLY that mode is supported for the effect (and the editor will set the mode when the change is saved)
<br><br>
<details><summary>system.attributes</summary>

| Attribute Key	| Change Mode	| Details 	|
|-----	|:-----------:	|-----	|
| `system.attributes.ac.bonus`            	|            	| This is applied before prepared data so CANNOT include derived fields.	|
| `system.attributes.ac.value`	|            	| This is applied after prepare data so can include derived fields like dex.mod and so on.	|
| `system.attributes.ac.calc`	|	| Accepts any of the predefined calculation types or custom 	|
| `system.attributes.ac.formula`	|	|  if the calc type is custom let's you specifiy your own AC calc formula 	|
| `system.attributes.death.failure`          	|            	| 	|
| `system.attributes.death.success`          	|            	| 	|
| `system.attributes.encumbrance.max`          	|            	| 	|
| `system.attributes.exhaustion`          	|            	| 	|
| `system.attributes.hd` 	| 	| Hit dice modifier	|
| `system.attributes.hp.max`              	|            	| 	|
| `system.attributes.hp.min`              	|            	| 	|
| `system.attributes.hp.temp`          	|            	| 	|
| `system.attributes.hp.tempmax`          	|            	| 	|
| `system.attributes.hp.value`          	|            	| 	|
| `system.attributes.init.bonus`          	|            	| 	|
| `system.attributes.init.mod`          	|            	| 	|
| `system.attributes.init.total`          	|            	| 	|
| `system.attributes.inspiration`          	|            	| 	|
| `system.attributes.movement.all`          	|    CUSTOM   	| 	|
| `system.attributes.movement.TYPE`          	|            	| TYPE: burrow/climb/fly/hover/swim/walk	|
| `system.attributes.movement.units`          	|            	| 	|
| `system.attributes.prof`                	|    CUSTOM   	| Allows addition of a numeric value to `system.abilities.prof`. You can use a negative value to reduce proficiency.<br>When updated, skills, spelldc and saves are updated accordingly (this calculation should be considered beta and if you find something missing let me know).	|
| `system.attributes.senses.TYPE`          	|            	| TYPE: blindsight/darkvision/special/tremorsense/truesight	|
| `system.attributes.senses.units`          	|            	| 	|
| `system.attributes.spellcasting`          	|            	| 	|
| `system.attributes.ac.base`	|	| [- Deprecated as of dnd5e 1.4.x -]	|
| `system.attributes.ac.cover`	|	| [- Deprecated as of dnd5e 1.4.x -]	|
| `system.attributes.ac.flat`	|	| [- Deprecated as of dnd5e 1.4.x -]	|
| `system.attributes.ac.min`	|	| [- Deprecated as of dnd5e 1.4.x -]	|

</details>
<details><summary>system.details</summary>

| Attribute Key	| Change Mode	| Details 	|
|-----	|:-----------:	|-----	|
| `system.details.alignment`          	|            	| 	|
| `system.details.appearance`          	|            	| 	|
| `system.details.background`          	|            	| 	|
| `system.details.biography.public`          	|            	| 	|
| `system.details.biography.value`          	|            	| 	|
| `system.details.TYPE`          	|            	| TYPE: bond/flaw/ideal	|
| `system.details.level`          	|            	| 	|
| `system.details.originalClass`          	|            	| 	|
| `system.details.race`          	|            	| 	|
| `system.details.trait`          	|            	| 	|
| `system.details.xp.max`          	|            	| 	|
| `system.details.xp.min`          	|            	| 	|
| `system.details.xp.value`          	|            	| 	|

</details>
<details><summary>system.traits</summary>

| Attribute Key	| Change Mode	| Details	|
|---------------------------------------	|:----------:	|-------- 	|
| `system.traits.languages.all`	|    CUSTOM	| The actor will be given all languages specified in `CONFIG.DND5E.languages` 	|
| `system.traits.languages.value`	|    CUSTOM	| The value will be added the known languages 	|
| `system.traits.languages.custom`	|    CUSTOM	| The specified string will be appended to the custom language field 	|
| `system.traits.size`	|   OVERRIDE	| Overrides the size setting on the character sheet 	|
| `system.traits.di.all`	|    CUSTOM	| 	|
| `system.traits.dr.all`	|    CUSTOM	| 	|
| `system.traits.dv.all`	|    CUSTOM	| The actor will be given immunity/resistance/vulnerability to all damage types specified in `CONFIG.DND5E.damageResistanceTypes` 	|
| `system.traits.di.custom`	|    CUSTOM	| 	|
| `system.traits.dr.custom`	|    CUSTOM	| 	|
| `system.traits.dv.custom`	|    CUSTOM	| The actor will have the specified string appended to the list of custom immunities/resistances/vulnerabilities. 	|
| `system.traits.di.value`	|    CUSTOM	| 	|
| `system.traits.dr.value`	|    CUSTOM	| 	|
| `system.traits.dv.value`	|    CUSTOM	| The actor will be given immunity/resistance/vulnerability to the specified damage type 	|
| `system.traits.ci.all`	|    CUSTOM	| 	|
| `system.traits.ci.custom`	|    CUSTOM	| 	|
| `system.traits.ci.value`	|    CUSTOM	| Same as above but for `CONFIG.DND5E.conditionTypes` 	|
| `system.traits.armorProf.all`	|    CUSTOM	| 	|
| `system.traits.armorProf.custom`	|    CUSTOM	| 	|
| `system.traits.armorProf.value`	|    CUSTOM	| Same as above but `CONFIG.DND5E.armorProficiencies` 	|
| `system.traits.toolProf.all`	|    CUSTOM	| 	|
| `system.traits.toolProf.custom`	|    CUSTOM	| 	|
| `system.traits.toolProf.value`	|    CUSTOM	| Same as above but `CONFIG.DND5E.toolProficiencies` 	|
| `system.traits.weaponProf.all`	|    CUSTOM	| 	|
| `system.traits.weaponProf.custom`	|    CUSTOM	| 	|
| `system.traits.weaponProf.value`	|    CUSTOM	| Same as above but `CONFIG.DND5E.weaponProficiencies` 	|
</details>
<details><summary>system.resources</summary>

| Attribute Key	| Change Mode	| Details	|
|---------------------------------	|:-----------:	|----------------	|
| `system.resources.legact.max`	|	| Legendary Actions	|
| `system.resources.legres.max`	|	| Legendary Resistance	|
| `system.resources.RES.label`	|   OVERRIDE	|	|
| `system.resources.RES.max`	|	|	|
| `system.resources.RES.lr`	|	| lr/sr = long/short rest	|
| `system.resources.RES.sr`	|	| RES: primary/secondary/tertiary	|


</details>
<details><summary>Attributes and Skills</summary>

| Attribute Key	| Change Mode	| Details	|
|---------------------------------	|:-----------:	|----------------	|
| `system.attributes.ABILITY.dc`	|    CUSTOM	| Adds the value (must be numeric) to the field and recomputes items saving throw dcs.	|
| `system.attributes.ABILITY.min`	|    CUSTOM	| 	|
| `system.attributes.ABILITY.mod`	|   A/M/D/U/O	| Allows modification of the ability modifier.	|
| `system.attributes.ABILITY.proficient`	|     ADD	| Multiplies character proficiency by this amount and adds it to the current value for the ability.	|
| `system.attributes.ABILITY.save`	|   	| Provides a bonus to ability saves. This is only active if the "Use ability save field when rolling saving throws" module setting is enabled. <br>This will use the save plus rather than the ability modifier when rolling saving throws.	|
| `system.attributes.ABILITY.value`	|   	| ABILITY: cha/con/dex/int/str/wis	|
| `system.bonuses.abilities.check`          	|            	| 	|
| `system.bonuses.abilities.save`          	|            	| 	|
| `system.bonuses.abilities.skill`          	|            	| 	|
| `system.skills.SKILL.ability`	|   OVERRIDE	| Dropdown: Strength/Dexterity/Constitution/Intelligence/Wisdom/Charisma	|
| `system.skills.SKILL.mod`	|	| SKILL: acr/ani/arc/ath/dec/his/ins/inv/itm/med/nat/per/prc/prf/rel/slt/ste/sur	|
| `system.skills.SKILL.passive`	|	| This affects the specified skill adjusting modifier or passive value for the skill. <br>Changes to modifier are only reflected when rolling the skill, not on the character sheet.	|
| `system.skills.SKILL.value`	|	| Dropdown: Not Proficient/Proficient/Expertise/Half Proficiency	|

</details>
<details><summary>Spells and Attacks</summary>

| Attribute Key	| Change Mode	| Details	|
|---------------------------------------	|:----------:	|-------- 	|
| `system.bonuses.All-Attacks`	|    CUSTOM	| The specified string field will be appended to `bonuses.mwak.attack`, `bonuses.rwak.attack`, `bonuses.msak.attack`, `bonuses.rsak.attack`	|
| `system.bonuses.All-Damage`	|    CUSTOM	| The specified string field will be appended to each of rwak/mwak/rsak/msak	|
| `system.bonuses.TYPE.attack`          	|   CUSTOM  	| TYPE: heal/msak/mwak/rsak/rwak/spell/weapon	|
| `system.bonuses.TYPE.damage`          	|   CUSTOM  	| TYPE: heal/msak/mwak/rsak/rwak/spell/weapon 	|
| `system.bonuses.save.damage`          	|            	| The specified string will appended to the damage roll for action type saving throw	|
| `system.bonuses.spell.dc` 	|     ANY 	| Always numeric, so any dice expression will be evaluated once when prepareData is called and **NOT** on each spell cast.<br>You cannot do lookups of derived fields for spell.dc calculations. 	|
| `system.spells.pact.level`	|	|	|
| `system.spells.pact.override`	|	| `spellslots.value` is not able to be modified with DAE.	|
| `system.spells.spell[1-9].override`	|	| e.g. `system.spells.spell3.override`	|
| `system.spells.spell[1-9].max`	|	| e.g. `system.spells.spell3.max`	|

</details>
<details><summary>Special Traits Flags</summary>
<br>
These fields accept 0 off, or 1 on.

| Attribute Key                    	| Change Mode 	|
|-----	|:-----------:	|
| `flags.dnd5e.diamondSoul`      	|   OVERRIDE 	|
| `flags.dnd5e.elvenAccuracy` 	|   OVERRIDE 	|
| `flags.dnd5e.halflingLucky`      	|   OVERRIDE 	|
| `flags.dnd5e.initiativeAlert`    	|   OVERRIDE 	|
| `flags.dnd5e.initiativeHalfProf` 	|   OVERRIDE 	|
| `flags.dnd5e.jackOfAllTrades`    	|   OVERRIDE 	|
| `flags.dnd5e.observantFeat`      	|   OVERRIDE 	|
| `flags.dnd5e.powerfulBuild`      	|   OVERRIDE 	|
| `flags.dnd5e.reliableTalent`     	|   OVERRIDE 	|
| `flags.dnd5e.remarkableAthlete`  	|   OVERRIDE 	|

</details>
<details><summary>Misc Fields</summary>

| Attribute Key	| Change Mode	| Details	|
|---------------------------------------	|:----------:	|-------- 	|
| `system.currency.TYPE`          	|            	| TYPE: cp/ep/sp/gp/pp	|
| `flags.dnd5e.meleeCriticalDamageDice` 	| 	| How many dice to roll on melee critical hits.      	|
| `flags.dnd5e.spellCriticalThreshold` 	| 	| Sets the threshold range for spell critical hits.       	|
| `flags.dnd5e.weaponCriticalThreshold` 	| 	| Sets the threshold range for weapon critical hits.       	|
| `flags.dnd5e.initiativeAdv`	| 	| Gives advantage on initiative rolls.	|
| `flags.dnd5e.initiativeDisadv`	| 	| Gives disadvantage on initiative rolls.	|
| `flags.dae`	|   CUSTOM	| 	|
| `flags.dae.onUpdateTarget` | CUSTOM |  See below (special flags.dae) |
| `flags.dae.onUpdateSource` | CUSTOM | See below (special flags.dae) |
| `flags.dnd5e.DamageBonusMacro`	| 	| 	|
| `StatusEffect` | CUSTOM | Applies/removes default/CE/CUB status effects/conditions. **Strongly Preferred** |
| `macro.CE`	|    CUSTOM	| Applies/removes CE Coditions - not really a macro.	|
| `macro.CUB`	|    CUSTOM	| Applies/removes CUB Conditions	- not really a macro. |
| `flags.core.statusId` |   CUSTOM | Display effect icon on token hud when active |

</details>
<details><summary>Macro Fields</summary>
<br>
Macros are called when the effect is transferred to the character (with `args[0] === "on"`) and called again when the active effect is removed (with `args="off"`).

| Attribute Key	| Change Mode	| Details	|
|---------------------------------	|:-----------:	|----------------	|
| `macro.execute`	|    CUSTOM	|	|
| `macro.itemMacro`	|    CUSTOM	| 	|
| `macro.tokenMagic`	|    CUSTOM	| Applies/removes the Token Magic affects.	|

</details>
<details><summary>Special flags.dae...</summary>
<ul>
<li>
flags.dae.deleteOrigin, which if present as a change in an active effect, will when the effect is deleted from the actor, attempt to delete the item pointed to by the effect's origin. The change value does not matter. Only owned items of an actor (any actor) will be deleted, and wont delete World Items or Compendium Items, can be useful for one shot items that you want to remain until the effect they created expires.
</li>
<li>
When an active effecr with a change flags.dae.deleteUuid is deleted, and whose change.value is an owned uuid, token uuid or ActiveEffect uuid, the entity pointed to by the change.value's uuid will be removed. Only tokens/ownedItems/ActiveEffects are supported. This is useful for summoning and gives an easy way to remove the summoned token when the effect/spell expires, or for spells/features that create temporary items on the actor which need to be removed on effect expiry.
</li>
<li>
 "flags.dae.onUpdateTarget" and "flags.dae.onUpdateSource" with the change value being "Label, macroReferece, updateFilter, arguments". macroReference, updateFilter and arguments are all optional. This effect does 2 things:
 <ul>
 <li>
  Creates a flag on the target actor (onUpdateTarget) or the sourceActor (onUpdateSource) that recordds the origin item, the targetToken and the initiating actor's token (sourceToken) and actor (sourceActor) on the target (flags.dae.onUpdateTarget) or the source actor (flags.dae.onUpdateSource). Note that onUpdateSource is different to other active effects in that it is ALWAYS created on the actor using the item/creating the effect and NOT on the target.
  </li>
  <li>allows you specify a macro that will be called whenever the target token/actor filter field is updated. The filter field does not need to reference a single value, system.abilities will call the macro when any ability is update.
  </li>
  <li>
  For example ``flags.dae.onUpdateTarget CUSTOM Arcane Link, ItemMacro,system.attributes.hp.value, 1,2,3 `` will add an entry to actor.system.flags.dae.onUpdateTarget (an array of such entries) on the target actor with:
  <ul>
  <li>args: []<br>
  </li><li>
  filter: 'system.attributes.hp.value', this is used to check that the update contains an update to the specified filter fields, you could use system.attributes.hp for any hp update.
  </li><li>
  flagName: 'Warding Bond'
  </li><li>
  macroName: 'ItemMacro'
  </li><li>
  origin: 'Actor.DMTSWfQs8whM5FtE.Item.fR2J4Ulo0GftObGd'
  </li><li>
  sourceActorUuid: 'Actor.DMTSWfQs8whM5FtE'
  </li><li>
  sourceTokenUuid: 'Scene.XRSav5mOrp1iEC7S.Token.n3mchcs4aaeokawb'
  </li><li>
  targetTokenUuid: 'Scene.XRSav5mOrp1iEC7S.Token.jg2mxFc21dO1q7Qi'
  </li><li>
  Essentailly this allows you to 'link' two actors and if you specifiy a macro to call,react to changes on either/both to manage shared state.
  </li>
  </ul>
  </li>
  </li>
  <li>
  To react to changes on both you need two changes in the effect <br>
    ``flags.dae.onUpdateTarget CUSTOM Actor Link, ItemMacro`` and <br>
    ``flags.dae.onUpdateSource CUSTOM Actor Link, ItemMacro``<br>
    which will create one effect on the target actor and one on the source actor. ItemMacro refers to the item that caused the effect to be created.
  </li>
  <li>
  If no macro is specified just the linkage between source and target will recorded on the target (source) actor. This allows you to examine the linkage in other macros, e.g. hunter's mark or similar in a damage bonus macro.
  </li>
  <li>
  If a macro is specified then whenver the target actor is udpated the maccro will be called with lastArg set appropriately. <br>

| Attribute | Value	| Details	|
|----------------------	|:-----------:	|--------------------------------------------	|
| effectId: | null | |
| origin | onUpdate.origin | the uuid of the origin (item or actor) |
| efData | null | |
| actorId | targetActor.id | the id of the target actor in the onUpdate data |
| actorUuid | targetActor.uuid | the uuid of the target actor in the onUpdate data |
| tokenId | null | |
| tokenUuid | null | |
| actor | this | the actor referenced in the actor.update that triggered the macro |
| updates | | the updates to the actor (you can change these to change the update applied to the actor) |
| options | | options passed to the update |
| user | |  the user that triggered the update |
| sourceActor | | the actor referenced in sourceActorUuid |
| sourceToken | | the token referenced in sourceTokenUuid |
| targetActor | | the actor referenced in targetTokenUuid |
| targetToken | | the token referenced in targetTokenUuid |
| originItem | | the item that caused the flags.dae.onUpdateTarget/Source to be created. |

  </li>
  <li>
  This makes effects like hunters mark simpler, since you just link the actors and have a bonus damage macro that checks the onUpdate effects for the actor. There is a new sample Hunter's Mark (in the midi sample items compendium) that uses these features to implement hunter's mark.
  </li>
  <li>
  Midi-qol sample items contains an implementation of warding bond, that does damage to the caster when the target takes damage. It does not check range to target.
  </li>
  <li>
  You can now implement things like sharing damage betwen two actors, by having the macro (which runs on the preUpdateActor call) modify the damage being applied and apply damame. See the sample item (in the Midi Sample Items compendium) Simple Warding Bond/Warding Bond.
  </li>
  <li>
  Simple Warding Bond creates effects on both the target and the Simple Warding Bond actor and an item macro that shares damage taken between the two actors. Note that your macro must do something to stop the "ping pong" updates of each actor being updated and triggering another call to the macro. You can do this by specifiying actor.update(updates, {onUpdateCalled: true}), which will halt the call chain.
  </li>
  </ul>
</li>
</ul>
</details>
</details>

## Macros

When you have a **non-transfer effect** that includes a macro, the macro is transferred to the target actor and runs when created on the actor. Deletion of the active effect from the target actor calls the macro again with `args[0] = "off"`.
Since the macro attaches to the target actor the macro can schedule itself to be activated on other events, such as combat updates to support damage over time effects.

Dae does not use furnace/advanced macros any longer.
Macro arguments are evaluated when the effect is applied to the target actor, i.e. when the item is rolled. @fields refer to the actor using the item - e.g. @abilities.str.mod is the item user's strength mod.

```js
macro.execute "macro_name" args
macro.ItemMacro args
```
This will call the macro "macro_name" (or the ItemMacro for the item with the effect) with `args[0] = "on"` and the rest of ...args passed through to the macro when the effects are applied to a target token. It will be called with `args[0] = "off"` when the active effect is deleted from the target actor.

In addition to the standard `@values` the following are supported (only as macro arguments):

`@target` will pass the token id of the targeted token.  Active Effects only.
`@targetUuid` will pass the Uuid of the targeted token.  Active E
`@scene` will pass the scene id of the scene on which the user who activated the effect is located.
`@item` will pass the item data of the item that was used in the activation.
`@spellLevel` if using Midi-QOL this will be the spell level the spell was cast at. This is the preferred field to use
`@item.level` if using Midi-QOL this will be the spell level the spell was cast at.
`@damage` The total damage rolled for the attack.
`@token` The id of the token that used the item.
`@tokenUuid` The uuid of the token that used the item.
`@actor` The actor.data for the actor that used the item.
`@actorUuid` the uuid of the actor that used the item
`@FIELD` The value of the FIELD within the actor that used the item, e.g. `@abilities.str.mod`.
`@unique` A randomly generated unique id.
`##field` The `##` means the argument will not be evaluated using caster values, but will be replaced with `@field` when it is applied to the target; and will be evaluated when the macro is called using values from the actor with the effect applied.

### lastArg

In some circumstances (when macros are called with args[0] === "off or args[0] === "each") the standard actor and token variables will **not** be initailised. So inside the macro you can't do actor.anything. To access the actor/token in a way that will always work there is an additional argument (in addition to those specified in the `macro.execute` definition) **lastArg**, which includes a lot of information for executing the macro. You ccan access lastArg via
```let lastArg = args[args.length-1]```. lastArg will always include, at least,
* effectId - the id of the effect being triggered
*  origin:
    the origin of the effect being triggered (use this with ```fromUuidSync(lastArg.origin)``` - usually an item.
* efData - the effect data of the effect being triggered.
* actorId - the id of the actor on whom the effect exists.
* actorUuid - the uuid of the actor fetch it with
```js
  let tokenOrActor = fromUuidSync(lastArg.actorUuid);
  let actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor
```
* tokenId - the id of the token on whom the effect exists, fetch via ```js canvas.scene.tokens.get(lastArg).tokenId) ```
* tokenUuid - the uuid of the token on whom the effect exists, feth via ```js fromUuidSync(lastArg.tokenuuid)  ```

Generally prefer to use the uuids when fetching an actor/token since it will alway work and avoid problems.

For example, if the `macro.execute` definition is `macro.execute CUSTOM "My macro" 5 @abilities.str.mod` then, when the effect is transferred to the target token the macro will be called with `args = ["on", <strength mod of the actor that used the item> lastArg]`
When the effect is deleted from the target actor (either by expiry or explicit deletion) the macro will be called again with `args = ["off", <strength mod of the actor that used the item>, lastArg]`

## Macros and transfer effect

The above discussion applies to non-transfer effects. Transfer effects are applied when the item is equipped by a character.

**macro.itemMacro "macro_name" args**
The same as `macro.execute`, but the item is inspected to find the item macro stored there. You can create item macros with the [Item Macro](https://github.com/Kekilla0/Item-Macro) module.

If you are using `macro.itemMacro` please make sure you disable the Item Macro module config settings:
* "character sheet hook" else when you use the item the macro will get called bypassing Midi-QOL/DAE completely and none of the arguments will get populated.
* "override default macro execution"  If this is enabled the hotbar hooks will directly call the item macro and won't work as expected for DAE/Midi-QOL.

The setting is per player so each player needs to change the setting to disabled.

**macro.actorUpdate args**
There are quite a lot of cases where you want to update some value on an actor's (like temphp) and maybe undo the change when the effect expires. Normally active effects can't effectively handle things like updates to hp, temphp etc since an active effect on the field "locks it", which means you'd have to write macros for those effects to do an actor.update(). This is just a shorthand way to avoid writing a macro.

macro.actorUpdate allows you to update a field on the actor and (optionally) have the update undone when the effect expires, however it does not lock the field value, rather it does an actor.update with the change. This let's you write a variety of effects without having to create macros for them.
  Syntax:
  ```
  macro.updateActor CUSTOM actorUuid type expression targetField undo
  ```

* **actorUuid**: string, e.g. @actorUuid (the casters uuid) or @targetUuid (the target's uuid)
* **type**: number, boolean, string (it's important to match these to the type of the target field)
* **expression**: a roll expression, string, or boolean e.g. "@attributes.dex.mod * 2 + 10" (**must** be in "" marks), the expression can start with one of +-*/ and will treated as a (actor current value + value) etc.
* **targetField**: "string", e.g. system.attrbutes.hp.temp
* **optional undo action** values:
  - missing/true/restore -> restore original value of target field on expiry
  - remove -> subtract the change made to the current value of the field on expiry, i.e. undo the change allowing for changes from other sources.
  - **+-*/value** add/subtract etc value to the current value of the target field
  - **value** set the target field to the value on expiry.
  - The "value" can be a roll expression, which should be enclosed in quotes. The string "undefined" will set the target field to undefined on expiry, useful for some traits etc.

**macro.tokenMagic "filterName"**
Will apply the specified Token Magic filter to each targeted actor when the active effect is applied to the actor and removed when the effect is deleted.

## Creating items with DAE

**macro.createItem CUSTOM uuid**
Will create the item referenced by the Uuid on the target actor. On expiry/removal of the effect the item will be removed, which provides a way of providing a tempoary item/feature to an actor for the duration of the feature. You can quickly get an item's uuid by opening the item and right-clicking the book in the title. You can also drag and drop the item into the effect value.

**macro.createItemRunMacro CUSTOM uuid**
This behaves the same as macro.createItem, but in addition when the item is created on the actor DAE will run the item's Item Macro with args[0] set to "onCreate" allowing you to save the uuid of the created item (passed in lastArg) somewhere for future reference.

**Programmatically create items with active effects**
``` js
const EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES;
const EXAMPLE_TRANSFERRED_EFFECT = {
    label: "Ring of Protection",
    icon: "icons/svg/mystery-man.svg",
    changes: [
      {key: "system.bonuses.abilities.save", value: "+1", mode: EFFECT_MODES.ADD},
      {key: "system.attributes.ac.bonus", value: "+1", mode: EFFECT_MODES.ADD},
    ],
    transfer: true,
  };
  const item = await Item.create({
    name: "Ring of Protection",
    type: "consumable",
  })
  await item.createEmbeddedDocuments("ActiveEffect", [EXAMPLE_TRANSFERRED_EFFECT]);

  let myActor = game.actors.getName("My Actor")
  await myActor.createEmbeddedDocuments("Item", [item])to [item].

  ```
Or just drag the supplied Ring of Protection from the sample items compendium to the actor of you choice.

### flags.dae.deleteUuid

Here's an example, which summons a token, via warpgate and creates an effect to delete it on spell expiry/loss of concentration.
```js
    const summoned = await warpgate.spawn("Flaming Sphere", {embedded: updates}, {}, {});
    if (summoned.length !== 1) return;
    const summonedUuid = `Scene.${canvas.scene.id}.Token.${summoned[0]}`;
    await caster.createEmbeddedDocuments("ActiveEffect", [{
        "changes":  [{"key":"flags.dae.deleteUuid","mode":5,"value": summonedUuid,"priority":"30"}],
        "label": "Flaming Sphere Summon",
        "duration": {seconds: 60, rounds: 10},
        "origin": args[0].itemUuid,
        "icon": "icons/magic/fire/orb-vortex.webp",
    }]);
```

## Macro Functions

Because dropping an item onto a character transfers the active effects to the actor many of the activation functions have been scrapped.

The macro functions in dynamicitems have been replaced in DAE with the following (and you will need to modify any macros you have created):
* Show all the active effects on an actor, marked as active/inactive.
  ```
  new DAE.ActiveEffects(actor, {}).render(true)
  ```
* Apply/remove item transfer effects to a set of targets
  ```
  DAE.doEffects(item, activate, targets, {whisper = false, spellLevel = 0, damageTotal = null})
  ```
  This will transfer the non-transfer effects from the item to the targets.
  `activate` (boolean) enables/disables the actor effects.
  `targets` is an array of target tokens or token ids.

## Useful bits

 * One of the most common things to do with dynamic effects is to create a damage bonus as a number of dice based on level. For DAE this requires a specific syntax in the damage bonus field.
     ```
     (ceil(@classes.rogue.levels/2))d6
     ```
* Changing actor spellDC. The way that works is to use Bonuses Spell DC. Anything else won't do what you want.
* Ability Saving Throw bonuses. The supplied DND5E system does not use the ability save field that you see on the character sheet when rolling saves. Changing that value (which you can do in DAE) will not affect rolls. If you want to be able to change individual ability saving throws you must enable the module setting "Use ability save field when rolling ability saves".
* Some fields are designated as CUSTOM, either they are "special" DAE fields (All-Attacks for example) or the core Active Effect rules don't work for them (damage immunities/languages etc). Generally DAE Custom fields (see list below) add the specified value to the existing system.
* Spell slots. The only way to modify the number of spell slots (that works correctly) is to use the spell slots override field. This is calculated BEFORE any derived values are calculated, so you cannot use ability modifiers or spell slot max in the calculation.
* Conditional expressions (a ? b : c) used to work, but a change in the foundry roll parser means they no longer work.

### Really cool Core functionality that you can use....

You can add your own custom effects without needing any DAE module changes. Say you want to add the average of str.mod and dex.mod to AC (and DAE does not support it) and the expressions don't work...

Core active effects has the idea of CUSTOM effects. If one is encountered when processing the active effects on an actor the system calls Hooks.call("applyActiveEffect")

Write a function that does
``` js
  Hooks.on("applyActiveEffect", myCustomEffect)

  function myCustomEffect(actor, change) {
    // actor is the actor being processed and change a key/value pair
    if (change.key !=== "system.attributes.ac.value") return;
    // If your active effect spec was
    // system.actor.attributes.ac.value (change.key) CUSTOM value (the value is not relevant here, but it gets passed as change.value)
    const actorData = actor.system.data;
    actorsystem.attributes.ac.value += Math.ceil((actorsystem.abilities.str.mod + actorsystem.abilities.dex.mod) / 2);
    // Although you can change fields other than the change.key field you should not as the core active effects tracks all changes made.
  }
```

Your custom effects can create new fields on the actor as well (DAE does this for flags.dnd5e.conditions for example). Just reference the field in the active effect spec and it will be created on the actor when the custom effect updates the value. There is no support for "arbitrary" field specification in the DAE UI (yet) so you would have to create the effect on the actor yourself.

#### Defining fields to appear in the effect editor.
You can also define fields that will be displayed in the DAE effect editor, with auto complete, labels that appear in the field list drop down, sample value (type of values in the field), valid modes and drop down list for the value field. Fields defined this way will auto complete in the field name auto complete

```js
  Hooks.on("dae.modifySpecials", {specKey, specials, charaterSpec} => {
    if (["npc", "character".includes(specKey)]) {
      specials["system.attributes.my.test.field = [ // the actor key that will be set
       "", // A sample value to know the type of the field, typically "", 0, false
       0, // valid modes for the field 0 = custom, -1 = all
       "My Test Field", // the label to display in the dae editor drop down field list
       {a: "Option A", "b", "Option B"}] // the aisgned values and labels to be used in the value drop down list
    }
  })
```  
specKey is one of the actor types, character, npc, vehicle or "union" which are all effect across all actor types.  
You can specify fields that are processed in the baseValues (before prepareDerivedData) or specialValues pass (after prepareDerivedData) of DAE.

### Initiative

Changes to initiative are challenging due to the way it is calculated and rolled in the dnd5e system. Here is a quick guide to what you can do.
  * `init.bonus` is set after prepareDerivedData so will not show up on the character sheet but CAN reference fields like dex.mod
  * `init.total` can be updated and will show up on the character sheet but will NOT be included in rolls.
  So if you want to add @abilities.wis.mod to initiative AND have it show up on the character sheet, you need two changes:
  ```abilities.init.bonus ADD @abilities.wis.mod```
  AND
  ```abilities.init.total ADD @abilities.wis.mod```

## Sample Items/Macros

  There is a compendium of items that have been setup to work with DAE. All active effects work best if both Midi-QOL and about-time/times-up are installed and active, but will still function without them.

## Module Integrations

### Dependencies

DAE **requires** libwrapper and socketlib to be istalled.

### [Midi-QOL](https://gitlab.com/tposney/midi-qol)

When rolling an item (weapon, spell, feature, tool, consumable) using Midi-QOL, non-transfer active effects are applied to the targeted tokens. If the definition of the item indicates that it is self then effects are applied to self. So, a bless spell when cast will apply the active effects to the targeted tokens.

Midi-QOL uses the Foundry targeting system to decide who to apply effects to. If a spell is marked as target self then the effects are applied to the casting/using actor.

If you have a feat "sneak attack" then rolling the feat will apply the non-transfer active effects to the token (i.e. weapon attacks do extra damage). For items with a saving throw active effects are applied if the save fails. Other items apply their effects when applying damage/casting a spell (if no saving throw) or consuming an item (e.g. potion).

### [about-time](https://gitlab.com/tposney/about-time)

If the underlying spell, weapon, feat, consumable etc has a duration then the active effects for that item will be applied to the targeted tokens (or self if the item is specified as self) and after the duration specified in the item the effects will be removed. So a bless spell with a duration of 1 minute will apply the active effect bonuses for 1 minute of gametime. A potion of giant strength will apply the new strength for the duration specified in the potion consumable. There are a few sample items in the premade compendium to get you started.

Times-up is the preferred module for effect expriy.

### [times-up](https://gitlab.com/tposney/times-up)

Times-up is the preferred way to expire effects, since as well as time based expiration it support duration in rounds/turns.

In addition times-up provides some special expirations for effects, turn start and turn end which will cause the effect to expire at the start/end of the character's turn.

Times-up also provides 2 macro repeat settings (turn start/turn end). If set for an effect that has a `macro.execute`/`macro.itemMacro` setting, the macro will be called at the start/end of the characters turn, with `args[0] === "each"`. You can use this setting for damage over time effects.

### [GM-Notes](https://github.com/syl3r86/gm-notes)

If the module is installed and active effects can update the actors gm-notes field. A useful place to track info that can't be applied to the character sheet.

### [Combat Utility Belt](https://github.com/death-save/combat-utility-belt)

CUB conditions are applied in 3 ways:
* StatusEffect, this will lookup the CUB conditon at the time of apllication and copy the system. This is the **strongly** preferred way to apply conditions.
* You create an active effect that takes it's changes from CUB via the drop down list in the DAE Active Effects Screen. "new" is pre-selected but you choose various items from that list, including CUB conditions.
If you select condition (CUB) from the drop down list DAE will copy the active effect from CUB into the actor/item. From then on it won't change, any changes you make in condition lab will NOT be reflected in actors who have the condition applied via DAE/Midi-QOL.
* Using macro.CUB to apply a condition that is looked up from CUB when applied. This should be considered deprecated.

Combat Utility Belt has it's own effects editor that does not support the DAE extras. However, it can create most effects you can create in the DAE editor, but not special durations/expiry options.

### [Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects)

Same application options as for CUB.

# Build fast note

### Prepare a release

In the 99% of the case for prepare a release you must:

- Launch `npm run build` this will generate all the code under the `dist` folder.
- Launch `npm package` for zip all the contents on the `dist` folder, and build the zip file with the correct name under the  `package` folder.

### Developing a release

- Use `npm run build:watch` and `npm run build:link` and check some tutorial online

# Build

## Install all packages

```bash
npm install
```
## npm build scripts

### build

will build the code and copy all necessary assets into the dist folder and make a symlink to install the result into your foundry data; create a
`foundryconfig.json` file with your Foundry Data path.

```json
{
  "dataPath": "~/.local/share/FoundryVTT/"
}
```

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run build
```

### NOTE:

You don't need to build the `foundryconfig.json` file you can just copy the content of the `dist` folder on the module folder under `modules` of Foundry

### build:watch

`build:watch` will build and watch for changes, rebuilding automatically.

```bash
npm run build:watch
```

### clean

`clean` will remove all contents in the dist folder (but keeps the link from build:install).

```bash
npm run clean
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run prettier-format
```

### package

`package` generates a zip file containing the contents of the dist folder generated previously with the `build` command. Useful for those who want to manually load the module or want to create their own release

```bash
npm run package
```

## [Changelog](./Changelog.md)

## Issues

### My DAE does X and I think it should do Y. Or it stopped doing X when I updated.

Did you read the [Changelog](./Changelog.md)? It often has information that might be relevant to problems.
When filing an issue **PLEASE PLEASE PLEASE** include at least the following:
* Foundry Version
* DAE version (latest version does not mean anything to me)
* Other modules you are using and their version, especially things like, Midi-QOL and Better Rolls. And if you routinely use more than 10 modules, please make sure you can reproduce the problem with only a few modules loaded. The problem might be a module interaction. I don't have time to investigate the combination of a 100 modules and their interactions with DAE so it has to be narrowed down.
* If you are using **midi-qol** please export your midi-qol settings from the misc tab and include the json file as an attachment to the bug report.
* Try and give a more complete description than X stopped working.

### I get lots of OwnedItem is deprecated when I open a character sheet.
This is not a problem of the character sheet, but probably a change in item Uuids in 0.8.x.
DAE/Midi-QOL store a reference to the item that created an active effect in the active effect and the created effect will have Actor.id.OwnedItem.id instead of the required Actor.id.Item.id.

There is a script `DAE.cleanEffectOrigins()` which will fix up item origins which include OwnedItem on all actors and tokens in the game. It can be run multiple times either from the console or as a macro.

Needs to be run as a GM.


Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/foundryvtt-item-link-tree/issues), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

If you have any suggestions or feedback, please contact me on discord @tposney

## License

This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).


## Acknowledgements

Bootstrapped with League of Extraordinary FoundryVTT Developers  [foundry-vtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types).

Bootstrapped with League of Extraordinary FoundryVTT Developers  [foundry-vtt-dnd5e-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-dnd5e-types).

Mad props to the 'League of Extraordinary FoundryVTT Developers' community which helped me figure out a lot.


