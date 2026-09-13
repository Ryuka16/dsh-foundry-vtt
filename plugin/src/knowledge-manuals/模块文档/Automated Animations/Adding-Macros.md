Automated Animations version 2.0 and above has the ability to use Macros in several ways. Macros will require the use of the Advanced Macros module, which is now a dependency of Automated Animations.  
  
# Adding Macros  
  
### Options
**When to Play**  
Macros on Items can be played in one of 2 ways.  
1. **Concurrent with Animation**: The Macro will play alongside the Animation Sequence (at the same time)  
2. **Await Macro Completion**: The Macro will be played "inside" the Sequence. This means the Macro will finish running before the Animation Sequence begins.  
3. **Macro with No Animation**: If this option is used, the Animation Menu options will be ignored and ONLY the Macro will be used.  
  
**Macro Name**  
The Name field for the Macro accepts 3 types.  
1. The EXACT Name of the macro that exists in the Game world
2. The Compendium reference for a Macro stored in said compendium. Noted as ``Compendium.[module name or just the word "world"].[compendium name].[macro name or ID]``. A-A provides an Autocomplete datalist to help quick add macros, even from compendiums  
3. From the Item Macro module. Set the Name EXACTLY to `ItemMacro`, and the stored Item Macro will be used.
  
**Sending Data to the Macro**  
In the `Send Args` field, you can send your own data to the macro in one of two ways.  
* Strings can be sent separated by commas. This will be provided in `args[2]` as an array of the string elements.  
* You can send an Object to the macro simply by writing out the data in Object format. This is a `textarea` input so there is no formatting checks until the workflow starts.  

# Available Data  
Data passed to the Marco includes the following:  **[Workflow, SystemData, ...UserData]**
  
## Workflow  
* **args[0]**  
  
The Workflow is the originating data that triggered Automated Animations. Typically this is the Chat Message data, but can also be specific Hooks. For example, if you are on DnD 5e and using Midi-QOL then most workflows (except items with Templates) will be the Midi-QOL data.  
  
## System Data  
* **args[1]**  
  
The compiled Data from Automated Animations includes the following:  
1. **sourceToken** : The originating Token on the canvas that used the item  
2. **actor** : The actor to which the **sourceToken** belongs.  
3. **allTargets** : All targets of the User as an Array  
4. **hitTargets** : an Array of "hit" targets if the item used was an attack roll. (Currently only works on DnD5e with Midi-QOL and PF2e)  
5. **item** : The Item that was used  
  
**There is more data passed, but the majority pertains solely to Automated Animations and may be subject to change. Log the *args* from a macro to see all available data**  
  
## User Data  
* **args[2]**  
  
User Input data is passed using the **Send Args** field of the Macro section. This field accepts strings separated by commas, and sends them to the Macro as an ``Array`` in ``args[2]``.  
- For example: The following is input into the **Send Args** field - **red axe, 3, true**. When the data is passed to the Macro, the **args** will read 
 
**args[2] = [red axe, 3, true]** 

  
# Example use of the Macro Field  
Lets say we are completely disabling an animation on a single Item and wish to use a Macro in its place. For a sample, let's replace the Fire Bolt Animation on an item.  
  
First, lets set the macro name to newFireBolt and the type to Script, then in the command line type ``console.log(args)``. Then on our item we will put the exact macro name into the **Macro Name** field.  
  
Next, target a token and roll your Fire Bolt item with the Attack and Damage. In the console (F12) you will now see what you have available to you. The output is an Array of items as noted in the Sections above. For this exercise we will now set a constant in our Macro as ``const data = args[1]``. This will give us access to the compiled Data structure from Automated Animations.  
  
Now let's write our code. I'll use a simple macro to recreate an attack using Sequencer:  
  
```js
const data = args[1];

let fireBolt = new Sequence();
for (let target of data.allTargets) {
fireBolt.effect()
 .file("jb2a.fire_bolt.blue")
 .atLocation(data.sourceToken)
 .stretchTo(target)
}
fireBolt.play()
```
Now, when you attack it will execute the macro and play the animation Sequence as defined above.  

Let's take this a step further and say you have a single macro that is used across multiple items and you want to change the color of the Fire Bolt without writing separate Macros. For this, we can use the **Send Args** field to send even more data to the macro. In this example let's dynamically set the color of the animation with a variable and send that from the Item.  
  
In the **Send Args** field I will type **purple** to send that to the Macro. Using our ``console.log(args)`` statement you will see that ``args[2] = purple``. We can now change our Macro above to accommodate this.  
```js
const data = args[1];
const color = args[2] !== undefined ? args[2] : "blue";

let fireBolt = new Sequence();
for (let target of data.allTargets) {
fireBolt.effect()
 .file(`jb2a.fire_bolt.${color}`)
 .atLocation(data.sourceToken)
 .stretchTo(target)
}
fireBolt.play()
```  
I have set a constant as **color** and assigned it to the data in ``args[2]``, there is also a fallback in case ``args[2]`` was left blank. Now when we use the item a Purple fire bolt animation will play.  
  
# Active Effect Macros  
An exception to the **args** passed to the Macro is with Active Effects:  
* ``args[0]`` in Macros for Active Effects will be either ``on`` of ``off``, depending on the status of the Active Effect.  
* Example Macro: This example Macro will fade the Token Opacity to ``0`` when the Active Effect is created, and return it to ``Opacity 1`` when the Active Effect is removed. The workflow normally in ``args[0]`` can still be accessed from ``args[1]``
```js
if (args[0] === "on") {
 let data = args[1];
  new Sequence()
   .animation()
    .on(data.sourceToken)
    .fadeOut(500)
    .opacity(0)
   .play()
}

if (args[0] === "off") {
 let data = args[1];
  new Sequence()
   .animation()
    .on(data.sourceToken)
    .fadeIn(500)
    .opacity(1)
   .play()
}
```
