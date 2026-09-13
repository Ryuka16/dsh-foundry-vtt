The **Global** and **Local** **Visage Libraries** are the central management interfaces for all your Visages. Whether you are managing the many faces of a Changeling or a library of effects, the interfaces remain consistent, intuitive, and powerful.

## Two Modes, One Interface

The module uses colour-coding to help you instantly recognise which "Mode" you are working in:

### The Visage Local Library (🟡 Gold Theme)

Accessed from the HUD, from an actor's sheet header or by right-clicking an actor in the sidebar. Manage Visages specific to that token/actor.

![Visage Local Library](https://github.com/Filroden/visage/blob/main/images/local_library.png)

### The Visage Global Library (🔵 Blue Theme)

Accessed via Scene Controls. Create Identities and Overlays usable by the GM on any token. Apply them to one or more selected tokens, or even **drag and drop** them onto tokens, to take immediate effect.

The Global Gallery has a Token Manager which can be opened using the button in the top right of the window. This shows all tokens in the current scene, their Visage Identity and a count of any Overlays applied. You can filter the list by typing in the search bar or clicking "Active Visages Only".

![Visage Global Library showing the Token Manager open](https://github.com/Filroden/visage/blob/main/images/global_library_token_manager.png)

Each token card has two buttons:

- Open its Local Library
- Ping the token on the canvas

If you click the token card it will reveal a detailed view of the token's active stack and show available Local Visages which can be applied to the token (just like using [[The Visage Selector HUD]]).

![Visage Global Library showing the token's detailed view](https://github.com/Filroden/visage/blob/main/images/global_library_token_inspector.png)

## Browsing & Filtering

The sidebar and top bar provides powerful tools to help you organise and find your assets:

- **Search Bar:** Filters items by **Name** or **Tag**. This is a real-time filter that updates as you type.
- **Categories:** Click a category name (e.g., "Disguises", "Dispositions") to view only items in that group.
- **Tags:** Tags appear as interactive pills on the cards and in the sidebar. Click a tag to filter by it. You can select multiple tags to refine your search (e.g., finding items tagged "Beast" and "Fire").
- **Quick Filters:** There are three quick filters in the top bar:
  - Public Visages: This filter is only active in the Global Library and shows the GM which Global Visages they are sharing with players (Visages with sharing set to "Public")
  - Locked and Hidden Visages: This filter is only active in the Local Library if viewed by the GM. It shows the GM all Local Visages that have restrictions applied (set to "Locked" or "Hidden").
  - Automated Visages: This filter is always available to all users and shows any Visage where an automation is configured (whether they are enabled or not).

How much you use Categories and Tags is up to you. If you only have a small library they are not needed, but they become more and more powerful the bigger the library becomes.

## Managing Visages

### Creating Visages

- **Create New {Global/Local} Layer:** Click the **+** button in the sidebar to open the **Editor** and create a new Visage.

### Export and Import Library

- You can export the entire library and save the JSON file so it can be later imported. This is a great way to take backups, to add Visages from one token onto another, or to transfer Visages from one world to another.
- When you import, the module detects how old your export file is. If there has been any changes to the data model, it will migrate it to the new format.
- No Visage will be overwritten. The Import process detects if a Visage already exists with the same unique identifying number and will skip those.

### Visage Card Actions

Each Visage Card contains actions. The first three (apply, edit and mode) are always visible. The other actions are inside a menu which is opened by clicking the third, "kebab", icon.

- **Apply:** Apply works differently depending if you are in the Global or Local Library:
  - In the Global library, you must first select one or more tokens on the canvas. Clicking the Apply (play) icon will apply that Visage to the selected token(s). You can also drag and drop the Visage card onto a token to apply it.
  - In the Local library, clicking apply will apply it to its local token.
- **Edit:** For existing Visages, click the **Pencil** icon on any Visage card to modify it. Note that changes to Visages update immediately for future applications, but do not retroactively change tokens that already have the Visage. If you want the changes to take effect you will need to apply it again.
- **Mode:** You can quickly switch the Visage's mode (**Identity** or **Overlay**) without having to open the editor. Note that you can also apply the Visage in its opposite mode inside the Context Menu menu (see below).

#### Visage Card Context Menu

![Visage Library popup context menu](https://github.com/Filroden/visage/blob/main/images/visage_card_more_actions.png)

- **Apply as {Identity/Overlay}:** Apply the Visage as an Identity (if it is setup as an Overlay) and as an Overlay (if setup as an Identity).
- **Duplicate**: Create a copy of an existing Visage.
- **Copy Macro API:** Copy a formatted API command to your clipboard (complete with a human-readable comment), allowing you to trigger specific Visages from your own external scripts.

  Example:

  ```javascript
  game.modules.get("visage").api.apply(token.id, "rx4wAmJiS8KLAGZ7"); // Applies: "Burning Filroden"
  ```

- **Promote to Global Library**: As a GM, do you like a particular look one of your players has made and want to use it on other tokens? Simply "Promote" (copy) it to the Global Library.
- **Copy to Local Library of selected token(s)**: As a GM, you can also do the reverse, and transfer a Global Visage to the selected token(s)'s Local Library, giving that player the freedom to use it from their Selector HUD.
- **Export Visage**: Export the chosen Visage.
- **Make Default**: Found a permanent new look? You can now swap a Visage to become the token's new "Default" state directly from the Library. The module automatically creates a backup of the previous default appearance, so you never lose your history.
- **Delete**: Soft delete (send to Recycle Bin). Visage features a safety net for your data by sending the Visage to a Recycle Bin where it will be held for 30 days. You can access the Recycle Bin by switching tabs (Library / Recycle Bin). Inside the bin you can see any deleted Visages and either **Restore** or **Destroy** them.
