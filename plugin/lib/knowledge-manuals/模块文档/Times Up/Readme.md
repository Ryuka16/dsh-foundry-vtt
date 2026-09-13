![](https://img.shields.io/badge/Foundry-v10-informational)
![](https://img.shields.io/badge/Foundry-v11-informational)
![](https://img.shields.io/badge/Foundry-v12-informational)
![](https://img.shields.io/badge/Foundry-v13-informational)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ftimes-up&colorB=4aa94a)
Discord <a href="https://discord.gg/Xd4NEvw5d7"><img src="https://img.shields.io/discord/915186263609454632?logo=discord" alt="chat on Discord"></a>

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/tposney)

## Times-Up
Times up is a temporary solution to support active effects expiring.

* It depends on no other modules and is system agnostic. It should just work.
* It will certainly be deprecated in the future when core supports Active Effect expiry and certainly has bugs.
* Should work with any module that creates active effects on the actor, not limited to DAE.

## Usage
Install the module and watch effects expire. Or not if there are bugs.

## Notes
Times-up support time based (i.e. seconds) expiry of effects and round/turn based expiry of effects.

Round turn expiry is checked on combat update. You can advance by turn or round and it should work correctly. If you run the combat tracker backwards it will not recreate expired effects.

Effects expire on the combat update that sets the duration to 0. 
* If you have an effect applied NOW with a duration of 1 turn it will expire at the end of the current turn.
* Example 1
    Curently: Combat Round 10, Turn 2  
    Start Time:  Round 10, Turn 2.
    Duration: 0 Rounds, 1 Turn.
    The effect will expire at the start of Round 10 turn 3 (i.e. the end of the current turn).
* Example 2
    Currently: Round 10, Turn 2
    Start Time: Round 10, Turn 2
    Duration: 1 Round, 0 Turns
    The effect will expire at the start of Round 11, Turn 2 (.e. the start of the same turn in the next round).
  * Finally  
    Currently: Round 10, Turn 2  
    Start Time: Round 10, Turn 2  
    Duration: 1 Round, 1 Turns  
    The effect will expire at the start of Round 11, Turn 3 (.e. the **end** of the same turn in the next round).

Times-up treats duration as a count down, it does not target a specific turn to expire an effect on or the actor who was at that turn. Turn 4 is ALWAYS the fith turn in the round (turns count from 0) no matter if the actor who was at turn 5 is now at turn 10.

Modules that change the initiative order (e.g combat utility belt re-rolling initiative) will cause unexpected results since times-up has no concept of who is in a give round/turn slot and consequently does not adjust for that. It will naively count down rounds and turns.

If you add actors to combat times-up will continue to count down rounds/turns "correctly".

Behaviour when you have multiple combats active is unpredictable. It should only expire effects on actor/tokens in the combat, but.....

## Special Duration/Expiry##
Expriy start of next turn, end of next turn have been moved from midi-qol to times-up. When set they will expire the effect at the start/end of the targets next turn (must be in combat tracker to work).

If you want effects to last until the start/end of the caster's/attacker's next turn specify 1 round, 1 round + 1 turn as the timed duration for the effect. Also only works properly when in combat.

Part of a co-ordninated release with dae (required to create effects) to support repeated macro calls startEachTurn, endEachTurn, which call a macro at the start/end of a token's turn (while in combat).
 
Effects with this duration are checked each turn start/end (provided the token is in combat) and any macro.execute/macro.itemMacro actions are called each turn with "each" as args[0]. This means that you can create effects that perform an action each turn (start/end) and potentially removes themselves.
To create such an effect;
  * create an effect (must use DAE effect editor or create by hand) with the macro repeat set to startEachTurn or endEachTurn and any macros on the effect will get called each turn.
  * You can delete the effect as part of the macro. 
  * Any other changes in the effect will remain active until the effect is deleted. 
  * You can specify a time based expiry as well for the effect as well.

* Here is a sample macro that rolls a save each turn until the save is made and then the whole active effect is deleted. The save is the item save DC, the type is the item save type and the damage is taken from the "Other" formula. So if the items are configured in that way the same macro can be used for any "if failed save take damage until save" effects.
Consider an effect that applies the condition frightened until a save occurs. Create an effect with whatever changes you want and add the extra macro.execute "Until Save" to the Active Effect.
```
macro.execute CUSTOM "Until Save"
```
The specified macro is called with whatever arguments were specified.
With a script macro defined as "Until Save"
```
// Two versions one that fetches damage/save/dc from item and one that use args like 
// macro.execute CUSTOM "Until Save" cha 15 
// Get some useful info.

const lastArg = args[args.length-1];
console.log("Until Save args are ", ...args);
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
let item = lastArg.efData.flags.dae.itemData;

if (args[0] === "on") {
  // Do any setup/first application as required.
} else if (args[0] === "each") {
  const saveType = item.data.save.ability;
  // const saveType = args[1]; 
  const DC = item.data.save.dc;
  // const DC = parseInt(args[2]);
  const flavor = `${CONFIG.DND5E.abilities[saveType]} DC${DC} ${item?.name || ""}`;
  let save = (await tactor.rollAbilitySave(saveType, {flavor, fastforward: true})).total; 
  if (save > DC) {
    if (tactor) tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId); 
    // remove the effect, this macro will be called again with "off" when the effect has been deleted.
  }
} else if (args[0] === "off") {
// do any clean up
}
```

  The following macro will apply damage until a save is made and uses the item that applied the effect to calculate the save type and dc required.  
```
if (args[0] === "each") {
    const lastArg = args[args.length-1];
    let tactor;
    if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
    else tactor = game.actors.get(lastArg.actorId);
    let token = canvas.tokens.get(lastArg.tokenId);
    let item = lastArg.efData.flags.dae.itemData;
    const saveType = item.data.save.ability;
    const DC = item.data.save.dc;
    const flavor = `${CONFIG.DND5E.abilities[saveType]} DC${DC} ${item.name}`;
    let save = (await tactor.rollAbilitySave(saveType, {flavor, fastforward: true, chatMessage: true})); // could use LMRTFY instead
    if (save.total > DC) {
      if (tactor) tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
    } else { // take more damage
      let damageRoll = new Roll(item.data.formula).roll(); // could be passed as an argument
      new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "piercing", [token], damageRoll, {flavor: `Failed Save for ${item.name}`, item})
    }
  }
```
If the Other formula is 3d6[poison] (or passed as a parameter), for example, it will be treated as poison dmaage.

## Other modules
If you are using DAE to apply effects to tokens (possibly with modi-qol) both modules know about times-up and will allow it to expire effects rather than the about-time based time queue. This means you will no longer see expiry events for effects in the about-time queue.

About-time will continue to operate in conjunction with times-up.

**DAE has been modified to have the following behaviour:** 
If the Effect on an item has a duration specified it will use that when creating the duration of the item. So you can specify the right duration independent of the spell/item duration.  

If the item applying the effect has a duration then that duration will be used. Duration in rounds/turns or a duration in minutes that is less than 10 rounds will be created as rounds/turns if in combat.  

Instantaneous effects are given a duration of 1 turn, so that you can see the effect until the end of the current turn.

If you apply an effect with a duration in rounds/turns it's start time will be undefined until combat is started, at which point it will have the start time set to Round 1, Turn 0 of the combat.

At the end of combat any active effects with a duration in rounds/turns will be automatically expired from the actor.

Version 2 will provide support for effects that expire on a speficied turn slot (rather than #turns passing), which should allow for tracker re-ordering.
