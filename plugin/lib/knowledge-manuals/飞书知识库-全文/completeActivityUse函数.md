<title>completeActivityUse函数</title>

`completeActivityUse` 是 Midi-QOL 提供的**核心 API**，用于**程序化地执行一个行动（Activity）的完整流程**（包括资源消耗、攻击检定、豁免检定、伤害应用、效果处理等）。它封装了整个工作流（Workflow），是替代手动调用 `activity.use()` 的推荐方式。

# **函数签名**

```JavaScript
MidiQOL.completeActivityUse(activityRef, usage, dialog, message)
```

# **参数说明**

| 参数 | 类型 | 描述 |
|-|-|-|
| `activityRef` | `Activity` 或 `string` | 要执行的行动对象，或行动的 UUID（字符串） |
| `usage` | `Object` | 执行配置（见下文） |
| `dialog` | `Object` | 对话框配置（控制是否弹出选择/确认窗口） |
| `message` | `Object` | 聊天消息配置（控制最终卡片的行为） |

**返回值**：`Promise<Workflow | undefined>` – 工作流对象，若流程被中止则返回 `undefined`。

## **`usage` 参数**

`usage` 是一个普通对象，最常用的字段是 **`midiOptions`**，其他字段（如 `create`、`consume`）会直接传递给底层的行动方法。

### 顶层参数, 由dnd5e系统提供

| 字段 | 类型 | 默认值 | 说明 |
|-|-|-|-|
| `consume` | `boolean \| ConsumptionConfig` | `true` | 控制资源消耗。可为 `true`（消耗所有可用资源）、`false`（不消耗）或一个对象：  <br/>- `action`: `boolean` – 是否消耗动作/附赠动作等  <br/>- `resources`: `number[]` – 要消耗的资源索引（来自 `consumption.targets`）（或`boolean`）  <br/>- `spellSlot`: `boolean` – 是否消耗法术位 |
| `create` | `boolean \| CreationConfig` | `true` | 控制是否创建额外内容（如测量板）：  <br/>- `measuredTemplate`: `boolean` – 是否放置区域测量板 |
| `concentration` | `ConcentrationConfig` | `{}` | 专注配置：  <br/>- `begin`: `boolean` – 是否开始专注  <br/>- `end`: `string` – 要结束的专注效果 ID（可选） |
| `scaling` | `number \| false` | `0` | 升阶等级（例如法术升环等级）。`false` 表示不扩展 |
| `spell` | `SpellSlotConfig` | `{}` | 法术位配置：  <br/>- `slot`: `string` – 使用的法术位键名（如 `"spell3"`） |
| `cause` | `CauseConfig` | `{}` | 关联的“原因”行动（用于 转进Forward 行动）：  <br/>- `activity`: `string` – 原因行动的相对 UUID  <br/>- `resources`: `boolean \| number[]` – 是否消耗原因行动的资源 |
| `event` | `PointerEvent` | `undefined` | 原始鼠标/键盘事件（用于检测 Shift/Ctrl 等修饰键） |
| `subsequentActions` | `boolean` | `true` | 是否触发后续动作（如攻击后的伤害掷骰） |
| `hasConsumption` | `boolean` | (自动计算) | 是否有任何资源消耗（用于决定是否显示对话框） |
| `workflow` | `Workflow` |  | 外部传入的工作流实例（一般由 `completeActivityUse` 内部创建，不需要手动提供）。 |
| `midiOptions` | `Object` |  | 详见下节。 |
| `sequenceId` | `string` |  | 调用链追踪 ID（内部使用） |
| `legacy` | `boolean` | `false` | 是否使用旧版行动系统（内部使用，一般忽略） |

> 当执行的物品为法术时`scaling`参数有时会失效, 请使用`spell.slot : 'spell3'`或类似的字段直接指定环位

#### 顶层快捷方式字段

“顶层快捷方式字段”是指直接放在 `usage` 对象最外层（第一级）的简单字段，用于快速设置最常用的自动化选项，而无需手动构造嵌套的 `midiOptions` 对象。以下字段都可以直接写在 `usage` 的根对象上

优势/劣势/重击/大失败

- `advantage`
- `disadvantage`
- `critical`
- `fumble`

快进与自动投掷

- `fastForward` （全局跳过所有对话框）
- `fastForwardAttack` （仅跳过攻击对话框）
- `fastForwardDamage` （仅跳过伤害对话框）
- `autoRollAttack` （自动投攻击骰）
- `autoRollDamage` （自动投伤害骰）

伤害与治疗

- `versatile` （使用双手伤害）
- `damageMultiplier` （伤害倍率，如 0.5）

宏与钩子

- `noOnUseMacro`
- `onlyOnUseItemMacros`
- `noTargetOnUseMacro`

检查绕过

- `noConcentrationCheck`
- `noProvokeReaction`
- `allowIncapacitated`
- `noUseWarning`

工作流控制

- `forceCompletion`
- `targetConfirmation`

### `midiOptions`参数

#### 目标选择字段

| 字段 | 类型 | 描述 |
|-|-|-|
| `targetsToUse` | `Set<Token>` | 直接指定目标 Token 集合。优先级最高。 |
| `targetUuids` | `string[]` | 目标 Token 的 UUID 数组（会转为 Set）。 |
| `ignoreUserTargets` | `boolean` | 若为 `true`，完全忽略用户当前选中的目标，只使用 `targetsToUse` 或 `targetUuids` 指定的目标。默认`true ` |
| `preSelectedTargetUuids` | `string[]` | 预先选中的目标 UUID（用于法术塑形等需要提前标记目标的场景，会存入 workflow）。 |

>  **优先级**：\`targetsToUse\` > \`targetUuids\` > （若 \`ignoreUserTargets=false\`）\`game.user.targets\`。

#### 优劣势/重击/大失败

| 字段 | 类型 | 描述 |
|-|-|-|
| `advantage` | `boolean` | 强制优势（与 `disadvantage` 同时为 `true` 时相互抵消，变为普通）。 |
| `disadvantage` | `boolean` | 强制劣势。 |
| `critical` | `boolean` | 强制本次攻击为重击（优先于自然骰子）。 |
| `fumble` | `boolean` | 强制本次攻击为大失败（优先于自然骰子）。 |

> 这些强制值会覆盖一切效果和条件。

#### 自动掷骰与跳过对话框

| 字段 | 类型 | 描述 |
|-|-|-|
| `fastForward` | `boolean` | 全局快进（同时跳过攻击、伤害、公式等所有对话框）。 |
| `fastForwardAttack` | `boolean` | 仅跳过攻击对话框。 |
| `fastForwardDamage` | `boolean` | 仅跳过伤害对话框。 |
| `autoRollAttack` | `boolean` | 是否自动执行攻击骰（无需用户点击攻击按钮）。如果为 `false`，则会在聊天卡片上显示攻击按钮等待点击。 |
| `autoRollDamage` | `boolean` | 是否自动执行伤害骰（命中后自动投伤害）。 |

> 当 `fastForwardAttack` 或 `fastForwardDamage` 为 `true` 时，`autoRollAttack` / `autoRollDamage` 通常也会隐式生效（取决于配置），但可以单独控制。

#### 绕过检查

| 字段 | 类型 | 描述 |
|-|-|-|
| `proceedChecks` | `Object` | 一个子对象，可以包含以下布尔字段，设为 `false` 可跳过对应的前置检查： |
|  |  | - `checkReaction`：跳过反应消耗检查（不询问是否使用反应） |
|  |  | - `checkBonusAction`：跳过附赠动作消耗检查 |
|  |  | - `checkAoO`：跳过借机攻击检查 |
|  |  | - `checkAllowIncapacitated`：即使目标无法行动也允许执行（无视失能状态） |
|  |  | - `checkComponents`：跳过法术成分检查（言语、姿势、材料） |
|  |  | - `checkTargets`：跳过目标有效性检查 |
|  |  | - `checkUse`：跳过使用条件检查（`useCondition`） |
|  |  | - `callMacros`：跳过 OnUse 宏调用 |
|  |  | - `callHooks`：跳过 Midi-QOL 钩子调用 |
| `noUseWarning` | `boolean` | 如果因使用条件不满足而失败，不显示警告（仅静默失败）。 |
| `noConcentrationCheck` | `boolean` | 跳过专注检定（行动若有伤害，则该伤害不触发目标的专注检定）。 |
| `noProvokeReaction` | `boolean` | 本次行动不会触发目标/自身的反应（如护盾术）。 |
| `noOnUseMacro` | `boolean` | 禁止执行物品/行动上的任何 OnUse 宏。 |

#### 指定执行者

| 字段 | 类型 | 描述 |
|-|-|-|
| `rollAs` | `Actor` 或 `string` (UUID) | 以指定 Actor 的身份执行行动（该 Actor 会成为 `workflow.actor`）。常用于触发式反击、借机攻击等场景。 |
| `checkGMstatus` | `boolean` | 如果目标 Actor 不属于当前用户且不是其拥有的角色，则尝试交给 GM 执行（通过 socket）。 |

> 使用 `rollAs` 时，行动归属的物品（item）必须能够被该 Actor 访问（通常是同一物品或通过 UUID 引用的物品）。如果物品不在该 Actor 的物品栏中，Midi-QOL 会创建一个合成物品（synthetic item）。

#### 工作流控制

| 字段 | 类型 | 描述 |
|-|-|-|
| `workflowOptions` | `Object` | 传递给底层 `Workflow` 构造函数的选项（见下文子表）。 |
| `storeWorkflow` | `boolean` | 是否将工作流对象存入 `Workflow.workflows` 映射中（默认为 `true`，一般无需修改）。 |
| `noOptionalRules` | `boolean` | 临时禁用可选的自动化规则（如特定房规）。 |
| `isReaction` | `boolean` | 标记本次行动为反应（影响后续的“已使用反应”标记）。 |
| `isTriggered` | `boolean` | 标记本次行动是由其他行动触发的（会影响资源消耗确认等）。 |
| `isOverTime` | `boolean` | 标记为持续性效果（OverTime）触发，用于内部区分。 |
| `triggeredActivity` | `boolean` | 同 `isTriggered`。 |
| `forceCompletion` | `boolean` | 即使没有任何命中目标，也会强制完成工作流（否则会在确认窗口处中止）。 |
| `configureDialog` | `boolean` | 直接控制是否显示配置对话框（优先级高于 `fastForward`）。 |
| `targetConfirmation` | `string` | 目标确认窗口控制：`"none"` / `"always"` / `"never"` |

##### `workflowOptions`字段

| 字段 | 类型 | 描述 |
|-|-|-|
| `advantage` | `boolean` | 是否强制优势（覆盖所有来源） |
| `disadvantage` | `boolean` | 是否强制劣势（覆盖所有来源） |
| `fastForward` | `boolean` | 全局快进（同时跳过攻击、伤害、公式对话框） |
| `fastForwardAttack` | `boolean` | 是否跳过攻击对话框 |
| `fastForwardDamage` | `boolean` | 是否跳过伤害对话框 |
| `autoRollAttack` | `boolean` | 是否自动执行攻击骰（无需用户点击） |
| `autoRollDamage` | `boolean` | 是否自动执行伤害骰（命中后自动投掷） |
| `fastForwardAbility` | `boolean` | 是否跳过属性检定对话框（技能、豁免等） |
| `rollToggle` | `boolean` | 内部使用，切换对话框状态（通过快捷键 `RollToggle` 触发） |
| `chatMessage` | `boolean` | 是否在聊天中生成消息 |
| `parts` | `array` | 自定义骰子部分（用于 `Roll` 构建） |
| `other` | `any` | 保留字段，未使用 |
| `targetConfirmation` | `string` | 目标确认窗口控制：`"none"` / `"always"` / `"never"` |
| `preSelectedTargetUuids` | `string[]` | 预先选中的目标 UUID 数组（用于塑形法术等） |
| `ignoreUserTargets` | `boolean` | 忽略用户当前选中的目标 |
| `rollAttackPerTarget` | `boolean` | 是否为每个目标单独投掷攻击（多目标时） |
| `isReaction` | `boolean` | 标记本次行动为反应（会消耗反应次数） |
| `castUsesReaction` | `boolean` | 施法是否消耗反应（用于触发式施法） |
| `castUsesBonusAction` | `boolean` | 施法是否消耗附赠动作 |
| `noProvokeReaction` | `boolean` | 本次行动不会触发目标/自身的反应（如借机攻击） |
| `onlyOnUseItemMacros` | `boolean` | 仅执行物品上挂载的 OnUse 宏，不执行 Actor 上的宏 |
| `noTargetOnUseMacro` | `boolean` | 跳过目标触发类宏（`isTargeted`、`isAttacked` 等） |
| `noConcentrationCheck` | `boolean` | 跳过专注检定 |
| `allowIncapacitated` | `boolean` | 允许失能目标执行动作（无视 `incapacitated` 状态） |
| `noUseWarning` | `boolean` | 如果因使用条件不满足而失败，不显示警告（仅静默失败） |
| `attackRollDSN` | `boolean` | 是否显示 3D 攻击骰子动画（Dice So Nice） |
| `damageRollDSN` | `boolean` | 是否显示 3D 伤害骰子动画 |
| `formulaDSN` | `boolean` | 是否显示 3D 公式骰子动画（Utility 行动） |
| `versatile` | `boolean` | 使用武器的双手伤害骰（versatile damage） |
| `damageMultiplier` | `number` | 伤害倍率（例如 0.5 减半，2 翻倍），在应用伤害时乘以最终数值 |
| `isCritical` | `boolean` | 强制本次行动为重击（优先级高于自然骰子） |
| `isFumble` | `boolean` | 强制本次行动为大失败 |
| `autoConsumeResource` | `string` | 自动消耗资源的策略：`"none"` / `"spell"` / `"item"` / `"both"` |
| `noOnUseMacro` | `boolean` | 全局禁止执行任何 OnUse 宏 |
| `onlyOnUseItemMacros` | `boolean` | 仅执行物品上的宏 |
| `noTargetOnUseMacro` | `boolean` | 跳过目标触发宏 |
| `forceCompletion` | `boolean` | 即使没有任何命中目标，也会强制完成工作流（否则会在确认窗口处中止） |
| `workflowName` | `string` | 工作流名称（用于调试日志） |
| `triggeringWorkflowId` | `string` | 触发当前工作流的父工作流 ID（用于链式触发） |
| `triggeringActivityUuid` | `string` | 触发当前工作流的行动 UUID |
| `workflowData` | `boolean` | 是否在返回值中包含完整的工作流数据（用于链式调用） |
| `isOverTime` | `boolean` | 标记为持续性效果（OverTime）触发，用于内部区分 |
| `coverOrigin` | `object` | 计算掩蔽时的原点坐标 `{ x, y, elevation? }`（用于范围效果） |
| `templateUuid` | `string` | 预先放置的测量版 UUID（用于跳过测量版绘制步骤） |
| `noTemplateHook` | `boolean` | 禁止测量版放置钩子（内部使用） |

#### 伤害/治疗

| 字段 | 类型 | 描述 |
|-|-|-|
| `versatile` | `boolean` | 对于可双手武器，使用双手伤害骰（versatile damage）。 |
| `damageRollDSN` | `boolean` | 是否为此伤害骰显示 3D 骰子动画。 |
| `damageMultiplier` | `number` | 伤害倍率（例如 0.5 减半，2 翻倍），会在应用伤害时乘以最终数值。 |

#### 宏与Hook

| 字段 | 类型 | 描述 |
|-|-|-|
| `noOnUseMacro` | `boolean` | 全局禁用 OnUse 宏（已提到）。 |
| `onlyOnUseItemMacros` | `boolean` | 仅执行物品上挂载的宏，不执行 Actor 上的宏。 |
| `noTargetOnUseMacro` | `boolean` | 跳过目标触发类宏（如 `isTargeted`, `isAttacked` 等）。 |

### 参数合并流程

在 `completeActivityUse2` 内部，会执行以下合并步骤：

1. 创建一个空的 `midiOptions` 对象。
2. 将顶层快捷方式字段（`advantage`, `disadvantage`, `critical`, `fumble`, `fastForward`, `fastForwardAttack`, `fastForwardDamage`, `autoRollAttack`, `autoRollDamage`, `versatile`, `damageMultiplier`, `noOnUseMacro`, `onlyOnUseItemMacros`, `noTargetOnUseMacro`, `noConcentrationCheck`, `noProvokeReaction`, `allowIncapacitated`, `noUseWarning`, `forceCompletion`, `targetConfirmation`）复制到 `midiOptions` 中。
3. 将顶层 `workflowOptions` 对象合并到 `midiOptions.workflowOptions` 中。
4. 将顶层 `midiOptions` 对象合并到最终的 `midiOptions` 中（因此显式指定的 `midiOptions` 会覆盖快捷方式）。
5. 最后将合并后的 `midiOptions` 作为 `usage.midiOptions` 传递给行动的 `use` 方法。

优先级：显式在 `midiOptions` 中设置的字段 > 顶层快捷方式 > 默认值。

也就是说，`workflowOptions` 中的字段可以被 `midiOptions` 中的同名覆盖（例如 `midiOptions.advantage` 会覆盖 `workflowOptions.advantage`）。实际上 `midiOptions.workflowOptions` 是在 `workflowOptions` 之后合并的，但 `midiOptions` 中直接定义的同名字段优先级更高。

##  **`dialog`参数**

控制是否显示配置对话框以及对话框的行为。

| 字段 | 类型 | 默认值 | 说明 |
|-|-|-|-|
| `configure` | `boolean` | `true` | 是否显示配置对话框（用户可调整扩展等级、消耗项等） |
| `applicationClass` | `typeof ActivityUsageDialog` | `ActivityUsageDialog` | 使用的对话框类（不同行动可覆盖） |
| `options` | `object` | `{}` | 传递给对话框构造函数的选项（如 `position`, `window.title`） |
| `sheet` | `ApplicationV2` | `undefined` | 父级表单（用于将对话框渲染为子窗口） |

##  **`message` 参数**

| 字段 | 类型 | 描述 |
|-|-|-|
| `create` | `boolean` | 是否在聊天中创建卡片（通常由工作流自动管理，无需设置） |
| `rollMode` | `string` | 骰子可见模式（`"publicroll"`, `"gmroll"`, `"blindroll"`, `"selfroll"`） |
| `flavor` | `string` | 卡片描述文字 |
| `speaker` | `Object` | 发言者信息（自动从 actor 获取，一般不需要手动指定） |

# **使用示例**

### **基础用法 – 直接执行一个攻击行动**

```JavaScript
const actor = game.actors.getName("Bob");
const item = actor.items.getName("Longsword");
const activity = item.system.activities.get("attack"); // 攻击行动 ID

// 指定目标（当前用户选中的目标会被忽略）
const targets = new Set([canvas.tokens.controlled[0]]);

await MidiQOL.completeActivityUse(activity, {
  midiOptions: {
    targetsToUse: targets,
    ignoreUserTargets: true,
    workflowOptions: {
      autoRollAttack: true,
      autoRollDamage: true,
      fastForwardAttack: true,
      fastForwardDamage: true
    }
  }
}, {
  configure: false  // 不弹出任何对话框
});
```

### **以另一个 actor 的身份执行行动（如触发反击）**

```JavaScript
const sourceActor = game.actors.getName("Orc");      // 触发者
const targetActor = game.actors.getName("Bob");      // 原目标，现在作为执行者
const item = sourceActor.items.getName("Reaction: Parry");
const activity = item.system.activities.get("parry");

await MidiQOL.completeActivityUse(activity, {
  midiOptions: {
    rollAs: targetActor,              // 以 Bob 的身份执行格挡
    targetsToUse: new Set([canvas.tokens.controlled.find(t => t.actor === sourceActor)]),
    checkGMstatus: true               // 若 Bob 是 NPC 则交给 GM 处理
  }
});
```

### **跳过部分检定（不检查反应/附赠动作）**

```JavaScript
await MidiQOL.completeActivityUse(activity, {
  midiOptions: {
    proceedChecks: {
      checkReaction: false,
      checkBonusAction: false
    },
    targetsToUse: someTargetSet
  }
});
```

### **强制重击/大失败**

```JavaScript
await MidiQOL.completeActivityUse(activity, {
  midiOptions: {
    critical: true,
    fumble: false,
    workflowOptions: {
      autoRollAttack: true,
      autoRollDamage: true
    }
  }
});
```