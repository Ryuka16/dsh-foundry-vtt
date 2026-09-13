The Automation tab allows you to set up rules that tell Visage to actively monitor the game and automatically apply or remove the Visage when specific conditions are met.

![Visage Global Editor Automation Tab](https://github.com/Filroden/visage/blob/main/images/global_editor_automation.png)

- **Enable Automation:** Click the toggle at the top to activate the automation engine for this Visage.
- **Logic Toggle:** If you add multiple conditions, you can use the Logic Toggle to dictate how they interact. Setting it to **AND** means all conditions must be met for the Visage to trigger. Setting it to **OR** means the Visage triggers if *any* condition is met.

## Condition Types

There are three types of conditions you can add:

### 1. Attribute Conditions

This condition checks the numerical, string, or boolean data stored on an actor's sheet (like Hit Points, AC, or Name).

- **Data Path:** The specific path to the data you want to check (e.g., `system.attributes.hp.value`).
- **Data Type:** Set this to `Number`, `String`, or `Boolean` depending on what kind of data the path holds.
- **Operator:** Choose how to compare the data (e.g., `<= (Less than or equal)`, `includes`, `==`).
- **Value:** The target value to test against (e.g., `50`, `Zombie`).
- **Mode:** For numbers, choose whether to test the `Absolute` value or a `Percentage (Calculates vs Max)`.
- **Denominator Path:** If using Percentage mode, you can manually type the maximum path (e.g., `system.attributes.hp.max`), or leave it blank to let Visage guess the maximum automatically.

#### The Attribute Picker

To help find Data Paths, click the **List icon** next to the path field to open the Attribute Picker. It displays a searchable list of data stored on the actor.

> *Note: The Attribute Picker only displays "Base" attributes (permanently saved data). To trigger off "Derived" attributes (temporary calculated numbers), you must manually find the path in the browser console (`F12`) and type it into the Data Path box. See [[Tutorial 10]] for more information on this.*

### 2. Status Conditions

This condition monitors the active effects and statuses applied to the token.

- **Status ID:** A dropdown containing all the core status effects built into your game system (like *Magic Shield* or *Prone*). It automatically populates with any Active Effects currently applied to the selected token.
- **Custom Status Name:** If your effect isn't in the dropdown, leave the dropdown blank and manually type the exact name here.
- **Operator:** Select **Is Applied** to trigger when the status is gained, or **Is Removed** to trigger when the status is removed.

### 3. Event Conditions

This condition monitors broader environmental or system events.

- **Event Type:** Select the event to monitor.
  - **Combat Encounter:** Set a condition for when a token starts or leaves combat.
  - **Token Elevation:** Set an elevation threshold as a condition.
  - **Token Facing:** Set a condition if the token's rotation is between or outside two angles.
  - **Scene Darkness:** Set a condition based on scene darkness levels (to simulate day/night transitions, etc).
  - **Scene Global Illumination:** Allow a Visage to be applied if the scene's global illumination is on or off.
  - **Scene Region:** Set conditions if the token is inside or outside a region (using either the Region's ID or its name).
  - **Targeted by Player:** Automate a Visage if the token is being targeted or not.
  - **Time of Day:** Automate a Visage based on the Foundry world clock and whether it should apply when it is inside or outside the specified time window.
  - **Scene Weather:** Change your token based on the scene's current weather effect.
  - **Hide/Show Token:** Automate a Visage when a token is hidden or revealed via the token HUD. Tip: To trigger effects for both hiding and revealing, you must create two separate Visages (use the "Duplicate Visage" action to do this quickly).
    > **Note:** This automation only triggers on visibility changes made after the Visage is activated, preventing it from immediately applying to all tokens on a scene.
- **Dynamic Inputs**: The available operator and value fields will change automatically depending on the Event Type you select. For example, setting Scene Darkness provides a mathematical threshold (`> 0.5`), whereas Scene Weather simply asks if the weather is `Active` or `Inactive`.
