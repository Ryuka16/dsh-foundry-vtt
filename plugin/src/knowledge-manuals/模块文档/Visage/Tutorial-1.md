# Tutorial 1: Creating a Local Identity (the Wolf Form)

**Goal:** Let’s create a "Wild Shape" or "Illusion" for a specific character. We are going to create *Visage* that changes the token's appearance to a wolf. This is a *Local Visage* because it belongs to that specific token (or actor if the token is linked). It is an *Identity*, because it intended to replace the current token's identity.

## Prerequisites

- **Role:** Player or Game Master
- **Required Modules:** Visage

## Concepts Covered

- Three methods to access the *Local Visage Library*
- Creating a new *Visage*
- Setting Mode to *Identity*
- Changing a token's image
- Applying and removing the *Visage*

## Step-by-Step Guide

![Tutorial 1 Visage settings](https://github.com/Filroden/visage/blob/main/images/tutorial_01_01.png)

### Phase 1: Creating the *Visage*

1. **Open the token's *Visage Library*:** You can access a token's *Visage Library* in three ways:

   - **From the Token HUD:** Right-click your token on the canvas, click the *Visage Icon* (a domino mask) to open the *Selector HUD*, and select the *Configure* button (the cog icon) at the top.
   - **From the Actor Sheet:** Click the *Visage* button in the window header of any open Actor sheet. It will either be in the header or inside the header's context menu depending on your system.
   - **From the Sidebar:** Right-click an Actor in the sidebar and select *Visage*.

   Now the *Visage Library* is open take a look around the interface. Find out more about [[The Visage Library]] here.

   > **Tip**: The Visage Library is the main window for managing your Local (specific to the token) or Global (for GMs) Visages. You know it is the Local Visage Library because it has a gold coloured theme.

2. **Create New Local Layer:** Click the **Create New Local Layer** button to open the *Visage Editor*. New *Local Visages* begin with the current token's appearances already set. More information about [[The Visage Editor]] can be found here.

3. **Reset the *Visage*:** Reset the *Visage* by clicking the *Reset Settings* button so we start with a clean slate.

4. **Give the *Visage* a Label:** In the top bar of the *Visage Editor*, give it a name, e.g., *"Wolf Form"* or *"Wolf Illusion"*. This name will only appear in the *Visage Library* and *Selector HUD* and is to help you remember what it is for.

5. **Switch the *Visage* mode to *Identity*:** Make sure the mode is set to *Identity* so that this Visage is applied as a change to the base token rather than as an *Overlay*.

6. **Option: Assign the *Visage* to a Category and give it some Tags:** As you build a large library of *Visages* you might want to put them into Categories (like folders) or give them Tags (filter keywords) to help you find them faster. If you token is a druid with lots of shapeshift forms, you might want to create a Category called "Shapeshift Forms". You might want to give each form some Tags, such as "Animal", "Monster", "Aquatic".

   > **Tip**: Categories and Tags are entirely options. You don't need to use them. If you decide later you want to put existing Visages into Categories or give them Tags, just edit the Visage and add them.

### Phase 2: Setting up the *Visage* appearance

Still inside the *Visage Editor*:

1. **Select a new token image:** On the Appearance tab to the side of the preview stage, click the checkbox next to Image to show you want to change the image. Then enter the filepath in the input box. You can also click the file picker next to the filepath input to find your chosen new look.

   > **Tip**: As you make changes to the Visage settings, the Live Preview will update and show you the changes you have made. Some changes cannot be easily shown in the Preview so these changes will show in a small table beneath the Preview window.

2. **Option: Change the token's image scale:** Is your new form a different size to your old form? You can change the image's scale by clicking the checkbox before Scale and giving it a new value (these are percentages where '100' is the default), e.g., make it `80` (smaller) or `150` (larger).

   > **Tip**: Scale only changes the size of the image, note the size of the token. To change the size of the token, change the width and height settings.

   > **Tip**: Leave all other appearance settings blank so your token inherits them from the base token. This is a powerful feature of Visage and is how you can later stack Visages on top of each other.

3. **Save the Visage:** As soon as you make any change to settings inside the *Visage Editor* the *Save Local Layer* button will light up to tell you that you have unsaved changes. Click the button to save the Visage. This will close the *Visage Editor*.

You can now see your new *Visage* in the *Visage Library* and in the *Selector HUD*.

## Testing It Out

1. You can apply your new *Visage* two ways:
   - Normally you would right-click your token, click the *Visage* icon in the token's HUD and when the *Selector HUD* opens, click the *Visage* tile you want to apply.
   - You can also apply *Visages* from the *Visage Library*. Click the *Apply* icon (the play symbol) on the right side of the *Visage's* card.
2. When you apply the new *Visage* you will see the token's image transition to the new image (and, if you set a scale, see the image scale change).
3. To remove an *Identity Visage*, apply a different *Identity Visage* or apply the default token (this will always be the first *Visage* tile inside the *Selector HUD* or card inside the *Visage Library*).

## Pro-Tips & Creative Ideas

- **Duplicating a Visage:** You can duplicate this *Visage* to easily create a Bear Form by just swapping the image. Inside the *Visage Library*, find the *Visage* card you want to duplicate, click the *Context Menu* icon (the three vertical dots) and select *Duplicate*. Edit the duplicate, give it a new Label and change the image and you have another form ready to apply.
