# **External Animation Calls**  
  
**NOTE** Previously this was ``AutoAnimations.playAnimation()`` which as been deprecated in favor of the below option.  
  

Automated Animations provides the ``AutomatedAnimations`` class to access the Automatic Recognition menu, or to play Animations from an external source  
  
### **AutomatedAnimations.playAnimation(sourceToken, item, options)**  
* sourceToken: ``Object`` The token using the Item    
* item: ``Object`` The item being used, or a pseudo Item object with a Name for Automatic Recognition as ``{name: "Dagger"}``  
  
* Options:  
  * playOnMiss: ``Boolean`` - for whether "miss" type animations should play for Melee or Range attacks  
  * targets: ``Array`` or ``Set`` of targets for the animation
  * hitTargets: ``Array`` or ``Set`` - of tokens that were "hit" for an attack
  * template: ``Object`` - An optional parameter to send a Template object or document to the handler  
  * reachCheck: ``Number`` - for additional range a token/item has for Reach in Melee attacks  
  
# **Global Automatic Recognition - Menu Manager**  
### **AutomatedAnimations.AutorecManager**  
* ``.getAutorecEntries()``: returns an Object containing all Global Automatic Recognition menus and their version  
* ``.addMetaData(metaData, options)``: Allows for setting a ``metaData`` field on Global Automatic Recognition menus.  
  * metaData: ``Object`` - Object containing any metaData to tag Entries in a menu  
  * options: ``Object`` - Controls which menu to tag with metaData, default is all Menus.
    * Available menus: 
      * ``melee``: Melee menu
      * ``range``: Range menu
      * ``ontoken``: On Token menu
      * ``templatefx``: Templates menu
      * ``aura``: Aura menu
      * ``preset``: Preset menu
      * ``aefx``: Active Effects menu
    * For instance, if you only want to tag Melee menu entries, pass:
      * ``{ melee: true }``
* ``.exportMenu()``: used to Export your current Global Automatic Recognition menu
* ``.mergeMenus(menu, inObject)``: Merges an incoming menu with the current menu
  * menu: A ``JSON`` file from a previous export
  * inObject: ``Object`` of Boolena values for which menus you would like to merge.  
* ``.overwriteMenus(menu, inObject)``: provide a valid JSON from a previous export to overwrite selected menus.  
  * menu: A ``JSON`` file from a previous export
  * inObject: ``Object`` of Boolena values for which menus you would like to overwrite.  
