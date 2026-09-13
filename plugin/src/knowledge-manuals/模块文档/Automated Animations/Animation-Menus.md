# **Animation menus are separated into 7 categories** 
1. Melee  
2. Range  
3. On Token  
4. Templates  
5. Aura  
6. Preset  
7. Active Effects  

Each of these is available in the Global Automatic Recognition menu.  
Item Menus contain all options except Active Effects  
Active Effects only contain Active Effect options.  
  
# **Overview**
All categories except Preset and Active Effects have the following animation sections:  
* **Source Animation:** *Optional* - Plays an Animation directly on the token who used the Item  
* **Primary Animation:** *Required* - Plays an Animationn based on the menu category that is selected  
* **Secondary Animation:** *Optional* -  Plays an animation on Targets (if any), or Source if no Targets  
* **Target Animation:** *Optional* - Plays an Animation directly on a Targetted token  
  
Each section can be assigned a Sound, and provides Options to configure how it plays. These are in collapsible folders inside the sections.  
  
***NOTE*: The Info icon on OPTION sections will give a more detailed list of what each option setting does.**
  
<p align="center"> 
<img height=375 src=images/Menu01.png>
</p>

## **Section Header Buttons**  
All categories contain a Sound Only and Macro button as the header.  
* **Preview:** Spawns a Video Preview window to see the animations you have selected  
  * **Melee**, **Range**, **On Token**, **Templates** and **Aura** menus  
* **3d Canvas:** Shows the configuration options for Rippers Canvas3D Module to utilize the Particle System for animations on active 3D maps  
  * **Melee**, **Range** and **On Token** menus only  
* **Sound Only:** Sets ONLY a sound to play, and no animation, on item use  
  * **All menus**  
* **Add Macro:** Adds a Macro section to use alongside the Animation  
  * **All menus**  
  
# **Global Automatic Recognition Menu**  
<p align="center"> 
<img height=200 src=images/AutorecMenu.png>
</p>

* 1 - **Category Select:** Choose the Menu you would like to view/edit  
* 2 - **Category Control:** Manipulate the Active Menu
  * Add Sections
  * Close All open Section
  * Search Active menu
  * Sort Active menu alphabetically
  * Overflow Button: Delete all sections
* 3 - **Main Area:** Shows all the configured sections for the Active Menu  
  * Each Section has an Overflow button to Delete/Duplicate at the far right
* 4 - **Menu Manager:** Edit the current Global Automatic Recognition Menu
  * Restore Default Menu
    * Reverts the Global menu to its default state
  * Merge Menus
    * Allows for single or multiple menu merges
  * Overwrite Menu
    * Allows for overwriting single or multiple menus
  * Export Menu
    * Exports your current Global Automatic Recognition menu to a JSON file

# **Item and Active Effect Menus**  
  
**NOTE** By Default, all Items are considered **ENABLED** unless manually disabled by entering the Item's A-A menu and disabling animations 

<p align="center"> 
<img height=300 src=images/ItemMenu.png>
</p>
  
* 1 - Title Bar  
  * Shortcut to Global Automatic Recognition Menu
  * Info button for the Item Menus  
* 2 - Header  
  * **Animation Enabled/Disabled:** Sets Animations for this item
  * **Customize Item:** Customization Animations for the Item (Disables Autorec for this item)
  * **Use Ammo:** For items with Ammunition, enable this to pull Global Animations settings that match the Ammunition name  
  * **Animation Type:** Choose the Animation menu to utilize  
  * **Top Right Section**
    * Signifies if a match is found in the Global Automatic Recognition Menu.
    * Allows Player/GM to Copy matching Autorec settings to this item to modify locally
    * Allows GM to Copy the configured Item settings to the Global Automatic Recognition Menu