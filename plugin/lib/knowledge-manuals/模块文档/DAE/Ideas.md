## Things to implement
Active effects on actors
fixed value applied to base values (i.e. template.json).
* how to apply to non template data. 
  * if applied to
* how to calculatre from derived values. 
  * when the effect is applied -> fixed value? (actor update, item update)
  * add a dervied value pass? and calc, each dae would be 

* what do specs look like, compared to active effects?
* How to migrate from dynamic effects -> dae?

* Bless spell, item effect +1d4 to bonuses.
* Class features that set flags are auto transfer effects.
* level increase HP -> uses classes.levels (derived) + con.mod(derived) -> HP.max
   during prepare data do what ? Change the active effects to refelct, or do the calcs and update actor.
   do calculation when item updates/long rest - pro low impact, no other impact to effects system.
* update to derived effect e.g. spell dc. When done? needs to be after derived calc phase.   

How do base actor effects work with dae? One effect definition. Are derived fields defined at the point of the pass? If so could be a value replacement and then fits into normal application.

Solution
Derived fields pass, after prepareData pass. 
Curated list of effects includes all base fields. Base fields are just fixed values?
Calculate based on Roll of @fields.
* flags Special case of AC. Which is a single AC override based on all fields.
* flgs saving throws per ability bonus 

