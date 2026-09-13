# Tutorial 9: The Visage Librarian (Gallery Actions)

**Goal:** As your collection of *Visages* grows, you will need to know how to manage them efficiently. This tutorial covers the advanced actions hidden inside the *Visage Library's* popup menu, teaching you how to duplicate effects, share *Visages* between players and the GM, make permanent character changes, and safely back up your library.

## Prerequisites

- **Role:** Game Master (Players can use some of these features, but GMs have access to all of them)
- **Required Modules:** Visage

## Concepts Covered

- Accessing the *Visage* Card Context Menu (the vertical stack of dots)
- Duplicating *Visages* to quickly create variants
- Promoting *Local Visages* to the *Global Library*
- Copying *Global Visages* to a token's *Local Library*
- Using *Make Default* to permanently change a token's base appearance
- *Exporting* and *Importing* Visages with duplication safeguards

## Step-by-Step Guide

### Phase 1: The Basics (Duplication)

Why build a new *Visage* from scratch when you can just copy one?

1. **Open the Library:** Open either your *Local Library* or the *Global Library*.
2. **Open the Context Menu:** On any *Visage* card, look at the three action buttons at the bottom. Click the third icon (the three vertical dots) to open the advanced actions list.
3. **Duplicate:** Click *Duplicate*. A perfect copy of that *Visage* will instantly appear in your library.
4. **Edit the Variant:** Click the *Edit* (pencil) icon on your new duplicate. Change the *Label* (e.g., from "Red Fire Aura" to "Blue Fire Aura") and tweak the colour. You just saved yourself minutes of setup.

### Phase 2: Sharing Visages (Promote & Copy)

GMs and players often need to trade *Visages*.

1. **Promote to Global (Player to GM):** Imagine a player creates an amazing "Disguise" in their *Local Library*, and as the GM, you want to use it for your NPC assassins.
   - Open that player's *Local Library*.
   - Click the Context Menu on their *Visage* card.
   - Select *Promote to Global Library*. A copy is instantly sent to your *Global Library* for you to use anywhere.
2. **Copy to Local (GM to Player):** Imagine you (the GM) build a complex "Lycanthrope Curse" *Visage* in your *Global Library*. You want the cursed player to be able to turn it on and off themselves.
   - Select the player's token on the canvas.
   - Open your *Global Library*.
   - Click the Context Menu on the "Curse" *Visage* and select *Copy to Local Library of selected token(s)*. The player will now see it in their *Selector HUD* and *Local Library*.

   > **Tip:** Changes made to either copy will not affect the other. Once a copy has been made it is treated as a totally different *Visage*.

### Phase 3: Permanent Changes (Make Default)

Normally, *Visages* are non-destructive layers. But what if a character loses an arm, gets a permanent scar, or puts on a cursed ring they cannot remove?

1. **Create the New Look:** Create a *Visage* that represents the character's new permanent state.
2. **Make Default:** Click the Context Menu on that *Visage* card and select *Make Default*.
3. **The Swap:** *Visage* will permanently overwrite the token's core data with these new settings. Don't panic. It will automatically take the token's *old* default settings, bundle them up, and save them as a brand new *Visage* in the library as a backup.

### Phase 4: Exporting & Importing (The Backup Plan)

You can easily back up your creations or share them between different campaign worlds.

1. **Export a Single Visage:** Click the Context Menu on any *Visage* card and select *Export Visage*. This saves a `.json` file of just that specific *Visage* to your computer.
2. **Export an Entire Library:** Look for the main *Export* button in the *Visage Library* interface. Clicking this will bundle every *Visage* in that library (*Global* or *Local*) into a single `.json` backup file.
3. **Import Visages:** Click the main *Import* button and select a previously exported `.json` file.
4. **The Safety Nets:** You don't need to worry about accidentally ruining your library when importing. Visage has built-in protections:
   - **Duplicate Prevention:** Visage checks the unique ID of every imported item. If a *Visage* with that exact ID already exists in your library, it safely skips it to prevent duplicates.
   - **Automatic Migration:** If you import a *Visage* created in an older version of the module, Visage will automatically intercept it, clean the data, and upgrade it to the newest format during the import process.

## Testing It Out (The Recycle Bin)

Let's test the final safety net!

1. **Delete a Visage:** Click the Context Menu on a *Visage* you don't need and click *Delete*.
2. **Check the Bin:** The *Visage* disappears, but it isn't gone forever. Look at the top of the *Visage Library* window and toggle over to the *Recycle Bin*.
3. **Restore or Destroy:** Here you will see your deleted *Visage*. You can either click *Restore* to put it back in your *Library*, or click *Destroy* to permanently delete it.

> **Tip:** Visage automatically empties items from the Recycle Bin after 30 days to keep your world database lean.

## Pro-Tips & Creative Ideas

- **Quick Automation Toggle:** If a *Visage* has automation conditions attached to it, you don't need to open the Editor to turn them on or off. You can click the "Power" icon directly on the *Visage* card in the Library to toggle its automation state instantly!
- **Transferring Characters:** If a player is moving their character to a completely new Foundry world, make sure to **Export** their Local Library first. Once the GM imports their character actor into the new world, you can **Import** their Local Library `.json` to restore all their disguises and forms.
