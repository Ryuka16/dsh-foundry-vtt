## **NOTE**: In most Instances Automated Animations only needs access to the Item being used. As well as a way to differentiate between Attack and Damage rolls if the system rolls those separately. 
    

Automated Animations access to a few key pieces of information for the module to work.  
  
# Required Data
1. Item: The Item instance that is being used  
2. Source Token: The Token that is using the Item  
3. Target(s): The current targets when the Item is used/rolled  
  
For MOST systems, this data is obtained using the **createChatMessage** hook. Other systems, such as Warhammer, provide system specific hooks that can be  used to grab the information.  
  


Furthermore, many systems roll separately for Attack and Damage. The Chat Message needs to be evaluated in these cases to determine if the player is rolling an Attack or Damage, OR in some cases the item has neither an Attack OR Damage roll, so that would need to be evaluated as well.  
  
To check if your system has this data, you can start by putting ``CONFIG.debug.hooks = true`` into the dev Console (F12). Now, every time you use an Item Hook calls will display and you can investigate and search for the data. Generally the ``createChatMessage`` hook will contain some of the data. Using the DnD5e CORE system as an example:  
  
* The ``createChatMessage`` hook has the ``Item ID`` in the HTML. Reference the ``static async dnd5e(input, isChat)`` function, line 49, in ``src/system-handlers/getdata-by-system.js``. Using this I attempt to extract the Item ID. Then the following line first checks to see if the ``Item ID`` was logged in the Chat Message data, then falls back to the HTML.  
* From there you will need to get the Token that is using the item, and then the list of Targets (if any) that are targetted.  
  
# Registering Settings and Hooks in A-A  
  
* Specific settings can be created in the ``initSettings.js`` file under the ``src`` folder  
  
* Hooks should be registered for the game system by creating a new file in the ``src/system-support`` folder. Reference the ``aa-dnd5e.js`` file as a template for registering the hooks and parsing relevant data. This should provide an exported function named ``systemHooks()`` that contains all the necessary Hooks to register. Be sure to add this to the ``index.js`` file in this folder to export as the game system id.
  
If you are using the ``createChatMessage`` hook it is important to be able to separate out Attack and Damage rolls if your system has those and rolls them separately. Otherwise animations will fire every time something is rolled.  At the start of the function you should also use ``if (msg.user.id !== game.user.id) { return };`` to prevent animations being created from every connected client.  

# Compiling System data  
After registering the Hooks, and sending the hook data to a function, you'll need to call ``const handler = await systemData.make(message or hook data here)``. This then sends the data to ``system-data.js`` in ``src/system-handlers``. The next step requires creating a ``static async`` function in ``getdata-by-system.js`` in the same folder location. Use the existing ones as an example of what should be returned.  
  
The full workflow goes something like:  

* index.js  
Hook calls and sends the data to the function. The function then separates out attack/damage if needed and calls ``const handler = await systemData.make(message or hook data here)``  
  
* system-data.js  
Sends the received data to  
  
* getdata-by-system.js  
This compiles all the data to get the Item, Source Token and any Targets and sends the data back to compile all the relevant A-A data. This is then returned to the handler constant in  
  
* autoAnimations.js  
After compiling the Handler, a quick check to ensure ``handler.item`` and ``handler.sourceToken`` both exists before sending it to ``trafficCop(handler)``  