The following are example macros using the existing API (which is still very basic at this stage).

## Applying a Visage to a token

Change the visageId = "zU9sLxeFW5uwJDnd" to the ID of your Visage.

```javascript

/**
 * Apply Visage to selected tokens
 */
async function applyVisage() {
    // 1. Check if the Visage API is available
    const visageApi = game.modules.get("visage")?.api;
    if (!visageApi) {
        ui.notifications.error("The Visage module is not active or the API is unavailable.");
        return;
    }

    // 2. Get the currently selected tokens
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
        ui.notifications.warn("Please select at least one token.");
        return;
    }

    // 3. The unique ID of the Visage from your JSON
    const visageId = "zU9sLxeFW5uwJDnd";

    // 4. Apply the Visage to all selected tokens
    for (const token of tokens) {
        try {
            // The apply method accepts either the token document, token object, or token ID
            await visageApi.apply(token.id, visageId);
            console.log(`Visage | Successfully applied Visage to ${token.name}`);
        } catch (err) {
            console.error(`Visage | Failed to apply Visage to ${token.name}`, err);
        }
    }
}

applyVisage();

```

## Revert selected tokens to their default states

```javascript

/**
 * Return selected tokens to their Full Default Visage
 */
async function revertToDefault() {
    // 1. Check if the Visage API is available
    const visageApi = game.modules.get("visage")?.api;
    if (!visageApi) {
        ui.notifications.error("The Visage module is not active or the API is unavailable.");
        return;
    }

    // 2. Get the currently selected tokens
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
        ui.notifications.warn("Please select at least one token to revert.");
        return;
    }

    // 3. Revert each token
    for (const token of tokens) {
        try {
            // The revert method strips away the Visage stack and restores the base token
            await visageApi.revert(token.id);
            console.log(`Visage | Successfully reverted ${token.name} to default.`);
        } catch (err) {
            console.error(`Visage | Failed to revert ${token.name}`, err);
        }
    }
}

revertToDefault();

```
