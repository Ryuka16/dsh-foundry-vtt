## How my modules interact ##

### dynamiceffects ###
Dynamiceffects applies passive (you have an item in your inventory) and active (applied to your targets) effects to actors/tokens (i.e. characters).

### Passive Effects ###
Passive effects only affect the character who has the item in their inventory and effects only apply if the item is in the inventory and 1 of 3 conditions are met:
1. The item is marked as "always active".
2. The item is marked as "active when equipped" and it is equipped.
3. The items is attuned and equipped.  

Passive effects turn on/off as the above conditions are met or not.

### Active effects ###
Active effects are applied to the targeted tokens when explicity activated. When activated the targeted toekns have the effects applied to them, note that if the target specifier in the item is "self" effects will be applied to whoever has the item. You can have an item with active effects in your inventory and it wont do anything until activated. 

There is a special active effect called macro.execute which calls a macro and passes arguments to it. This requires the furnace module with active effects turned on.

Macros are called with the first argument being "on" indicating the effect is to be applied and "off" indicating that it should be turned off. You can specifiy arguments to the macro e.g. macro.excute = MyMacro 10 @target. Qhich means that the macro MyMacro will be called with the arguments "on" 10 and the tokenID of the target.

Dynamiceffects posts a message to the chat when applying/removing an item's active effects if there are any non-macro effects.
There are a couple of macro functions supplied to help activate/deactivate items - useful if you are not using minor-qol.

### about-time ###
about-time creates a game clock and can schedule events to happen in the future. about-time does not generate any chat cards.

### minor-qol ###
minor-qol provides some automation of combat/spell activation, i.e. rolling damage/checking hits and so on. minor-qol creates the hit/save/undo damage chat cards as required. Minor-qol will activate

### Interactions ###
They interact as follows:
1. if dynamiceffects detects that about-time is active then when it applies an **active** effect it will schedule the removal of that effect by looking at the duration specified in the item. For macro effects it will call the macro with the first argument being "off".
2. Dynamiceffects supplies a macro function **togglePassiveEffect** "i.e. can be called in a macro" that works for passive effects to toggle those on (i.e. make it equipped or always active) and if about-time is installed will use about-time to schedule turning it off in the future.
3. minor-qol checks if dynamiceffects is installed and will call the dynamiceffeccts "appplyActiveEffect" funciton when an attack hits or damage is appled or a save fails as appropriate.

### warning ###
I wrote these modules primarily for use in my campaign (I am delighted if people find them useful) and I always run with all of the turned on and full automation of minor-qol. This means:
1. requests for new features will be filtered by how useful they are to me to run my game. If not it will depend on the amount of time I have spare.
2. The most tested path of interaction is with all of the modules on. Behaviour with some modules turned off, different sets of automation turned on/off will be checked, but by definition not as thoroughly as the setup I use. Bugs will definitely be more common in the other paths.