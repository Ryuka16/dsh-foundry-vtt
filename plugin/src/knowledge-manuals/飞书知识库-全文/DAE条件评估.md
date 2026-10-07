<title>DAE条件评估</title>

本节介绍DAE赋予AE的两个特殊字段，或者说flag的写法与用法

![图片展示了DAE（条件评估）中两个特殊字段的填写方式。上方是“表达式，如果为假将从角色中移除效果”，下方是“表达式，如果为真将禁用效果”，每个表达式后都有一个灰色的输入框。该图片与上下文紧密相关，上下文介绍了DAE赋予AE的两个特殊字段，即Enable Condition和Disable Condition的写法与用法，此图直观呈现了这两个字段的填写样式，帮助理解其在AE中的应用。](https://feishu.cn/file/GHjHbWGkXo1GKqxNuQ1cVuqHn0b)

为了称呼方便，我们会使用Enable Condition来称呼“表达式，如果为假则从角色中移除效果”；使用Disable Condition来称呼“表达式，如果为真则禁用效果”。他们的效果几乎是字面意思。

需要注意的是Enable Condition并不适用于标记为`transfer === true`的效应（即勾选了效应应用于角色的AE，一般来说，就是物品给予的被动效应），因为他们不会出现在`actor.effects`中，而是被存储在`item.effects`中。

如果你不知道这两个字段在哪/是干什么的，那说明你不应该打开这个页面。

# 表达式的评估流程

表达式的评估在dae中由如下的`dae.eval`函数进行，如果你看不懂，可以不用管下面的代码块

```JavaScript
static safeEval(expression, sandbox, onErrorReturn = undefined) {
        let result;
        const preSetupError = "MidiQOL or fromUuidSync used before setup complete";
        try {
            const src = 'with (sandbox) { return ' + expression + '}';
            const evl = new Function('sandbox', src);
            sandbox = foundry.utils.mergeObject(sandbox, { Roll });
            sandbox = foundry.utils.mergeObject(sandbox, { fromUuidSync, getToken, getAttributeValue: this.getAttributeValue, MidiQOL: globalThis.MidiDAEEval ?? {} });
            if (!DAEReadyComplete && typeof expression === "string" && (expression.includes("fromUuidSync") || expression.includes("MidiQOL"))) {
                throw new Error(preSetupError);
            }
            const sandboxProxy = new Proxy(sandbox, {
                has: () => true, // Include everything
                get: (t, k) => k === Symbol.unscopables ? undefined : (t[k] ?? Math[k]),
                set: () => false && console.error("You may not set properties of the sandbox environment") // No-op
            });
            result = evl(sandboxProxy);
        }
        catch (err) {
            const message = `dae | safeEval | expression evaluation failed ${expression}`;
            if (err.message === preSetupError) {
                console.warn(message, err);
                warn(message, preSetupError);
            }
            else {
                console.warn(message, err);
                console.warn(`Actor: ${sandbox.name} ${sandbox.actorUuid}`);
                if (sandbox.item)
                    console.warn(`Item: ${sandbox.item.name} ${sandbox.item.itemUuid}`);
            }
            result = onErrorReturn;
        }
        if (Number.isNumeric(result))
            return Number(result);
        if (Number.isNaN(result))
            result = onErrorReturn;
        return result;
    }
```

但实际上的处理由`processConditionalEffects`进行，其中对我们来说重要的部分如下

```JavaScript
export async function processConditionalEffects(actor, updates) {
    if (!game.users?.activeGM?.isSelf)
        return;
    if (!actor || !["character", "npc"].includes(actor.type))
        return;
    const tokenDocument = tokenForActor(actor)?.document;
    const token = tokenDocument?.object;
    // while (token?.animationContexts?.get(token.animationName)?.to) await delay(100);
    // @ts-expect-error missing in fvtt-types currently
    await token?.movementAnimationPromise;
    const rollData = actor.getRollData();
    const effectItem = game.items?.getName(i18n("dae.ConditionalEffectsItem"));
    ......
    for (let effect of actor.effects) {
        let condition = effect?.flags?.dae?.enableCondition;
        if (condition) {
            // add other things to rollData
            rollData.combat = game.combat;
            rollData.time = game.time;
            rollData.effect = effect.toObject();
            const expression = Roll.replaceFormulaData(condition, rollData);
            // rollData.origin = fromUuidSync(effect.origin);
            const result = daeSystemClass.safeEval(expression, rollData);
            if (!result) {
                await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
            }
        }
    }
    for (let effect of actor.allApplicableEffects()) {
        const disableCondition = foundry.utils.getProperty(effect, "flags.dae.disableCondition");
        if (typeof disableCondition === "string" && disableCondition.trim() !== "") {
            const rollData = (effect.parent?.getRollData() ?? {});
            rollData.effect = effect.toObject();
            let value = Roll.replaceFormulaData(disableCondition, rollData, { missing: "0", warn: false });
            try { // Roll parser no longer accepts some expressions it used to so we will try and avoid using it
                let disabled;
                if (value.includes("dae.eval(") || value.includes("dae.roll(")) {
                    disabled = daeSystemClass.safeEvalExpression(value, rollData);
                    disabled = daeSystemClass.safeEval(disabled, rollData);
                }
                else
                    disabled = daeSystemClass.safeEval(value, rollData);
                if (!!disabled !== effect.disabled) {
                    if (debugEnabled > 0)
                        warn("setting disabled effect", effect, disabled);
                    await effect.update({ disabled: !!disabled });
                }
            }
            catch (err) {
                warn("diabledCondition error", err);
            }
        }
    }
    await token?.drawEffects();
}
```

它实际上构造了：

```Plain Text
with (sandbox) {
  return 表达式;
}
```

因此表达式使用 JavaScript 语法：

```Plain Text
attributes.hp.value > 0
```

```Plain Text
attributes.hp.value > 0 &&
attributes.hp.value <= attributes.hp.max / 2
```

```Plain Text
traits.size === "lg"
```

不要写 `return`，也不要以分号分隔多个语句。

# 何时重新求值

当前 DAE 会在以下事件中调度条件检查：

- `updateActor`
- Actor 所属 `updateItem`
- `createActiveEffect`
- `updateActiveEffect`
- `deleteActiveEffect`
- Token 移动时的 `updateToken`

不会因为以下事件必然立即重算：

- 单纯切换战斗回合；
- 单纯经过世界时间；
- 仅改变场景光照；
- 其他模组改变了某个外部状态但没有更新 Actor、Item 或 Effect。

因此：

- HP、资源、属性条件最可靠；
- 战斗回合、时间、距离、视线条件需要额外触发 Actor/Token 更新；
- 如果需要精确的回合持续时间，优先使用 Active Effect 自带的持续时间 或 DAE 特殊持续时间。

# 共有可用字段

如`processConditionalEffects`所展示，基础数据由`const rollData = actor.getRollData();`给出，也即角色的[掷骰数据](https://xcnplziulnma.feishu.cn/wiki/PxmxwHtBniay5LkIH7nce8LunGh) 。这并非恒定，根据系统与系统版本的不同掷骰数据可用的字段也不相同。实际的基础字段取决于：

- 当前游戏系统；
- Actor 类型；
- dnd5e 版本；
- Actor 上的动态派生数据；
- 其他模组是否扩展 `getRollData()`。

对于dnd系统而言，其角色的`getRollData()`方法定义如下

```JavaScript
/** @inheritdoc
 * @param {RollDataOptions} [options]
 * @returns {ActorRollData}
 */
getRollData({ deterministic=false }={}) {
  let data;
  if ( this.system.getRollData ) data = this.system.getRollData({ deterministic });
  else data = {...super.getRollData()};
  data.flags = {...this.flags};
  data.name = this.name;
  data.statuses = {};
  for ( const status of this.statuses ) {
    data.statuses[status] = status === "exhaustion"
      ? this.system.attributes?.exhaustion ?? 1
      : status === "concentrating" ? this.concentration.effects.size : 1;
  }
  return data;
}
```

简单来说，这返回的数据大体如下

```Java
// 伪代码
return {
  ...actor.system,          // 包含所有 system 下的数据（属性、技能、HP、AC 等）
  name: actor.name,         // 额外添加：角色的顶层名称
  flags: actor.flags,       // 额外添加：角色的顶层标志（包括 dnd5e 下的自定义标志）
  statuses: { ... },        // 额外添加：计算后的状态效果对象（如 exhaustion: 1）
  classes: { ... },         // 额外添加：便捷计算的职业信息（原 system 中无此字段）
  subclasses: { ... },      // 额外添加：便捷计算的子职业信息
  prof: new Proficiency()   // 额外添加：便捷的熟练加值对象（虽然 system 中也有，但这里转为对象）
}
```

如上所见，dnd系统和dae系统都额外扩展了掷骰数据里的数据，我们来详细介绍一下扩展的数据对象。这一部分的字段是Enable Condition和Disable Condition所共有可用的。

<callout emoji="❗">
这里的`actor` 无论何时都是指AE的最终应用目标。
</callout>

## `statuses`

dnd5e 加入的状态对象：

```Plain Text
statuses
```

普通状态存在时通常为 `1`：

```Plain Text
statuses.poisoned === 1
```

更简单：

```Plain Text
!!statuses.poisoned
```

特殊状态：

```Plain Text
statuses.exhaustion
```

表示力竭等级。

```Plain Text
statuses.concentrating
```

表示专注相关效果数量。

状态不存在时属性一般是 `undefined`：

```Plain Text
!statuses.poisoned
```

如果状态 ID 包含连字符，应使用方括号：

```Plain Text
statuses["some-status-id"]
```

## `statusesSet`

DAE 额外加入的原生 `Set`：

```Plain Text
statusesSet.has("poisoned")
```

```Plain Text
!statusesSet.has("dead")
```

它比 `statuses` 更适合单纯判断状态是否存在。

## `effects`

DAE 设置为 Actor 当前已应用的效果集合：

```Plain Text
effects
```

例：

```Plain Text
effects.some(e => e.name === "Bless")
```

更推荐根据 `origin` 判断：

```Plain Text
effects.some(e => e.origin === "Item.abcdef123456")
```

按 flag 判断：

```Plain Text
effects.some(e => e.flags?.dae?.someFlag === true)
```

不要用自身效果名称作为保留条件，例如：

```Plain Text
effects.some(e => e.name === effect.name)
```

因为它几乎永远会看到自身。

## `actorId`

```Plain Text
actorId
```

只包含 Actor 的普通 ID，例如：

```Plain Text
actorId === "AbCdEf123456"
```

## `actorUuid`

```Plain Text
actorUuid
```

可能是：

```Plain Text
Actor.abc123
```

或者合成 Token Actor 相关 UUID。

推荐使用它取得真实 Actor 文档：

```Plain Text
fromUuidSync(actorUuid)
```

判断 Actor 类型：

```Plain Text
fromUuidSync(actorUuid).type === "npc"
```

判断是否拥有物品：

```Plain Text
fromUuidSync(actorUuid).items.some(
  i => i.system.identifier === "shield"
)
```

## `token`

DAE 加入的延迟 getter，尝试取得代表该 Actor 的 Token 对象：

```Plain Text
token
```

Actor 没有可用 Token 时可能是 `undefined`：

```Plain Text
token?.document.disposition === 1
```

## `tokenId`

```Plain Text
tokenId
```

没有 Token 时可能返回字符串 `"undefined"`。

## `tokenUuid`

```Plain Text
tokenUuid
```

例如：

```Plain Text
Scene.abc.Token.def
```

没有 Token 时也可能返回字符串 `"undefined"`。

建议先判断：

```Plain Text
tokenUuid !== "undefined"
```

## `effect`

Enable 和 Disable 求值时都会加入：

```Plain Text
effect
```

这是当前 Active Effect 的 `toObject()` 数据，不是 ActiveEffect 文档实例。

常用字段：

```Plain Text
effect.name
effect.id
effect._id
effect.origin
effect.disabled
effect.duration
effect.flags
effect.statuses
effect.changes
```

例：

```Plain Text
effect.origin === "Item.abcdef"
```

```Plain Text
effect.flags?.dae?.stackable === "noneName"
```

又或者效果的堆叠数

```Plain Text
effect.flags?.dae?.stacks === 5
```

# 只适用Enable Condition的字段

## `combat`

只在检查 Actor 上现存的 Enable Condition 时加入：

```Plain Text
combat
```

例：

```Plain Text
combat?.started === true
```

```Plain Text
combat?.round <= 3
```

```Plain Text
combat?.combatant?.actorId === actorId
```

但 DAE 没有为这项功能直接监听 `updateCombat`，所以切换回合不保证立即重新求值。

## `time`

只在 Actor 上现存的 Enable Condition 中加入：

```Plain Text
time
```

这是 `game.time` 对象，不是单纯的世界时间数字。

同样，世界时间变化本身不保证触发条件检查。

# 只适用Disable Condition的字段

Disable Condition 如果属于转移效果，`effect.parent` 可能是 Item。此时使用的是：

```Plain Text
item.getRollData()
```

除 Actor 数据外，一般还会有：

```Plain Text
item
labels
scaling     //sacling在此处没有特别的用处，因为它基本上只会在物品使用的prepare data阶段有具体的值
```

例如：

```Plain Text
item.equipped === true
```

实际字段路径取决于该 Item 类型。

# 可调用的函数

条件评估支持同步函数调用，但不支持所有的全局函数

## 支持对象自身的方法

可以调用从 Roll Data 取得的对象方法：

```Plain Text
statusesSet.has("poisoned")
```

```Plain Text
traits.dr.value.has("fire")
```

```Plain Text
effects.some(e => e.name === "Bless")
```

```Plain Text
["lg", "huge", "grg"].includes(traits.size)
```

```Plain Text
name.toLowerCase().includes("goblin")
```

```Plain Text
fromUuidSync(actorUuid).items.find(
  i => i.system.identifier === "shield"
)
```

支持箭头函数：

```Plain Text
effects.some(e => e.statuses?.has("poisoned"))
```

## 支持裸写 Math 函数

DAE 的求值代理会把找不到的变量名转到 `Math` 对象。

因此可以写：

```Plain Text
floor(attributes.hp.max / 2)
```

```Plain Text
ceil(details.level / 2)
```

```Plain Text
max(attributes.hp.value, 0)
```

```Plain Text
min(attributes.hp.value, attributes.hp.max)
```

```Plain Text
abs(abilities.str.mod)
```

注意：当前实现没有直接把 `Math` 对象放入 sandbox，因此推荐：

```Plain Text
max(a, b)
```

而不要依赖：

```Plain Text
Math.max(a, b)
```

可用的通常包括：

```Plain Text
abs
ceil
floor
round
max
min
pow
sqrt
sign
trunc
```

条件中不要使用 `random()`，否则同一个条件可能随机创建、删除或禁用效果。

## DAE 明确注入的函数和对象

求值器明确提供：

```Plain Text
Roll
fromUuidSync
getToken
getAttributeValue
MidiQOL
```

### `fromUuidSync(uuid)`

同步取得 Foundry 文档：

```Plain Text
fromUuidSync(actorUuid).type === "npc"
```

```Plain Text
fromUuidSync(actorUuid).items.some(
  i => i.system.identifier === "rage"
)
```

按 effect origin 查找来源：

```Plain Text
fromUuidSync(effect.origin)?.name === "Rage"
```

使用可选链，因为 UUID 可能无效：

```Plain Text
fromUuidSync(effect.origin)?.type === "feat"
```

### `getToken(reference)`

可接受：

- UUID 字符串；
- Actor；
- Item；
- ActiveEffect；
- TokenDocument；
- Token。

例：

```Plain Text
getToken(actorUuid)?.document.disposition === 1
```

```Plain Text
getToken(actorUuid)?.document.hidden === false
```

### `getAttributeValue(documentUuid, path)`

根据 UUID 找到 Actor，再读取 Actor 文档上的完整路径。

因为它直接读取 Actor 文档，此处要包含 `system.`：

```Plain Text
getAttributeValue(
  actorUuid,
  "system.attributes.hp.value"
) > 0
```

读取 flag：

```Plain Text
getAttributeValue(
  actorUuid,
  "flags.world.someFlag"
) === true
```

如果无法取得值，通常返回 `null`；传入的第一个参数不是字符串时返回空字符串。

### `Roll`

`Roll` 类可用，但条件最好保持确定性。

技术上可以写：

```Plain Text
new Roll("1 + 2").evaluateSync().total === 3
```

不建议用骰子作为 Enable Condition：

```Plain Text
new Roll("1d20").evaluateSync().total > 10
```

因为一次重算可能删除，另一次又产生不同结果，而且普通 Enable 效果删除后无法自行恢复。

### `MidiQOL`

如果 Midi-QOL 已安装并完成 setup，DAE 会注入 `globalThis.MidiDAEEval`，因此所有的Midi命名空间下的函数均可用<cite doc-id="MsIxwWNkKiavqBkHVYOcBEcon46" file-type="wiki" title="MIDI与DAE函数全录" type="doc"></cite>。

# 不支持或不应使用的函数

## 异步函数

求值函数不是 `async`，不会等待 Promise：

```Plain Text
await fromUuid(...)
```

不能使用。

以下也不合适：

```Plain Text
fromUuid(...)
```

它返回 Promise，而 Promise 本身是真值，会造成错误判定。

应使用：

```Plain Text
fromUuidSync(...)
```

## 未注入的浏览器或 Foundry 全局对象

不要假定这些命名空间可用：

```Plain Text
game
canvas
ui
foundry
CONFIG
Math
Object
Array
JSON
console
```

求值代理会遮蔽外部全局变量；没有被放入 sandbox 的名字通常得到 `undefined`。

已有数组的实例方法可以用：

```Plain Text
effects.some(...)
```

但不要依赖：

```Plain Text
Array.isArray(effects)
```

## 会修改文档的函数

技术上可以经由 `fromUuidSync()` 调用文档方法：

```Plain Text
fromUuidSync(actorUuid).update(...)
```

但绝对不应该在条件里这样做。

原因：

- 条件可能频繁求值；
- `update()` 返回 Promise，Promise 是 truthy；
- 更新会再次触发条件检查；
- 容易造成递归更新、竞态或队列循环。

条件表达式应当是纯读取、无副作用。

# 表达式编写规则

## 推荐直接访问字段

推荐：

```Plain Text
attributes.hp.value > 0
```

数值字段也可以写：

```Plain Text
@attributes.hp.value > 0
```

`@` 会在正式求值前由 `Roll.replaceFormulaData()` 做文本替换。

但是字符串不推荐使用 `@`：

```Plain Text
traits.size === "lg"
```

不要写：

```Plain Text
@traits.size === "lg"
```

因为替换后可能变成：

```Plain Text
lg === "lg"
```

其中 `lg` 没有引号。

Set、数组和对象方法也必须直接访问：

```Plain Text
statusesSet.has("poisoned")
```

## 使用严格比较

推荐：

```Plain Text
attributes.hp.value === 0
```

```Plain Text
traits.size !== "tiny"
```

不要写单个等号：

```Plain Text
attributes.hp.value = 0
```

这是赋值，不是比较。

## 对可能不存在的字段使用保护

```Plain Text
(details.level ?? 0) >= 5
```

```Plain Text
flags.world?.enabled === true
```

```Plain Text
fromUuidSync(effect.origin)?.type === "feat"
```

```Plain Text
effects?.some(e => e.name === "Bless") ?? false
```

# DAEConditionalEffects 教程

## 它是什么

`DAEConditionalEffects` 是一个特殊名称的世界 Item：

```Plain Text
i18n("dae.ConditionalEffectsItem")  //目前由记忆汉化为"DAE状态效果"
```

DAE 会查找：

```Plain Text
game.items.getName(i18n("dae.ConditionalEffectsItem"))
```

并把该 Item 内的 Active Effects 当成全局条件模板。

## 创建方法

运行 DAE 自带宏：

```Plain Text
DAE: Create Sample DAEConditionalEffects
```

该宏读取：

```Plain Text
modules/dae/data/DAEConditionalEffects.json
```

然后创建世界 Item。

也可以手动创建一个名称精确为：

```Plain Text
i18n("dae.ConditionalEffectsItem")
```

的世界 Item。

不要：

- 改名；
- 只放在合集包中；
- 创建多个同名 Item 并期待全部被扫描。

`game.items.getName()` 通常只返回一个同名世界 Item。

## 配置步骤

1. 创建或打开世界 Item `DAEConditionalEffects`。
2. 在这个 Item 上新建 Active Effect。
3. 确保是非转移效果（不勾选效果应用于角色）。
4. 配置效果的更改、状态条件、图标等。
5. 在 Enable Condition 中写“该效果应当存在的条件”。
6. 保存。
7. 更新一个 Character/NPC 的 HP 或其他相关属性，触发检查。

## 工作过程

对于 Item 中每个未禁用的条件效果：

```Plain Text
条件为真
  → Actor 上没有对应效果
  → 创建效果

条件为假
  → Actor 上已有对应效果
  → Actor 效果自己的 Enable Condition 删除它

以后条件再次为真
  → 重新创建
```

创建出来的 Actor 效果使用源效果 UUID 作为 `origin`，DAE 据此判断它是否已经存在。

## 示例：NPC 的hp归零时自动死亡

模组示例使用了：

```Plain Text
actorType === "npc" && attributes.hp.value <= 0
```

但是当前 dnd5e 5.x 的掷骰数据没有可靠地定义 `actorType`，DAE 也没有自行加入该字段。建议改为：

```Plain Text
fromUuidSync(actorUuid).type === "npc" &&
attributes.hp.value <= 0
```

## 示例：Character 的hp归零时自动昏迷

```Plain Text
fromUuidSync(actorUuid).type === "character" &&
attributes.hp.value <= 0
```

## 示例：中毒时自动附加额外减益

```Plain Text
statusesSet.has("poisoned")
```

注意不要让模板效果本身也添加 `poisoned`，否则可能形成自我维持条件。源状态移除后，由于模板效果又提供了相同状态，条件可能仍然为真。

## 示例：不死生物自动获得特殊效果

```Plain Text
fromUuidSync(actorUuid).type === "npc" &&
details.type?.value === "undead"
```

使用 Midi-QOL：

```Plain Text
MidiQOL.typeOrRace?.(actorUuid) === "undead"
```

## 示例：特定 flag 控制全局效果

```Plain Text
flags.world?.nightBlessing === true
```

这是一种非常稳定的设计：其他宏只负责设置 flag，DAEConditionalEffects 负责根据 flag 创建或删除效果。

## 注意事项

### 它是全局规则

`DAEConditionalEffects` 中的每个效果都会被拿去检查所有发生更新的 Character/NPC。

因此条件必须明确限制适用对象。

不要写过于宽泛的：

```Plain Text
true
```

这会尝试为所有 Character/NPC 创建该效果。

### 初次创建时没有 `effect`、`combat`、`time`

源模板首次判断只使用：

```Plain Text
actor.getRollData()
```

因此不能写：

```Plain Text
combat.round === 1
```

```Plain Text
time.worldTime > 1000
```

```Plain Text
effect.name === "Something"
```

这些字段只在已经生成到 Actor 上的 Enable Condition 阶段才被加入，无法解决“第一次是否创建”的问题。

### 只处理 Character 和 NPC

当前源码明确限制：

```Plain Text
["character", "npc"].includes(actor.type)
```

载具、小队等类型不会被处理。

### 需要活动 GM

条件处理函数首先检查：

```Plain Text
game.users.activeGM.isSelf
```

没有活动 GM 时不会创建、删除或切换条件效果。

# 一些示例

## Enable Codition

### 示例：只在存活时保留

```Plain Text
attributes.hp.value > 0
```

### 示例：只在半血以下且尚未倒地时保留

```Plain Text
attributes.hp.value > 0 &&
attributes.hp.value <= attributes.hp.max / 2
```

### 示例：只在拥有临时 HP 时保留

```Plain Text
(attributes.hp.temp ?? 0) > 0
```

### 示例：只在中毒状态存在时保留

```Plain Text
statusesSet.has("poisoned")
```

中毒状态移除后，这个效果也会被删除。

### 示例：只在装备盾牌时保留

```Plain Text
fromUuidSync(actorUuid).items.some(
  i => i.type === "equipment" &&
       i.system.type?.value === "shield" &&
       i.system.equipped
)
```

## Disable Condition

### 示例：生命值为0时暂时禁用

```Plain Text
attributes.hp.value <= 0
```

治疗到 1 HP 后，条件变假，效果重新启用。

### 示例：中毒时禁用

```Plain Text
statusesSet.has("poisoned")
```

解毒后自动恢复。

### 示例：力竭达到三级时禁用

```Plain Text
attributes.exhaustion >= 3
```

也可用：

```Plain Text
(statuses.exhaustion ?? 0) >= 3
```