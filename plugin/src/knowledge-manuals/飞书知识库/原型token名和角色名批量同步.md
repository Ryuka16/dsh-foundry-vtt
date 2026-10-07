# 原型token名和角色名批量同步

```JavaScript
/*
 * This macro iterates through all actors in the sidebar (Actors Directory)
 * and updates their prototype token's name to match the actor's name.
 *
 * This does NOT affect any tokens already placed on a scene. It only changes
 * the default token settings for each actor.
 */

async function syncPrototypeTokenNames() {
  const actorsToUpdate = [];

  // Loop through all actors in the game
  for (const actor of game.actors) {
    // Check if the prototype token's name is different from the actor's name
    if (actor.prototypeToken.name !== actor.name) {
      // If they are different, add an update operation to our list
      actorsToUpdate.push({
        _id: actor.id,
        'prototypeToken.name': actor.name,
      });
    }
  }

  // If there are actors that need updating, perform the update
  if (actorsToUpdate.length > 0) {
    try {
      await Actor.updateDocuments(actorsToUpdate);
      ui.notifications.info(`同步了 ${actorsToUpdate.length} 个角色原型Token的名称。`);
    } catch (err) {
      ui.notifications.error("更新角色时发生错误，详情请查看控制台 (F12)。");
      console.error("Failed to update prototype token names |", err);
    }
  } else {
    ui.notifications.info("所有角色原型Token的名称已与角色名同步。");
  }
}

// Execute the function
syncPrototypeTokenNames();
```