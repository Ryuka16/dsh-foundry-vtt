# DAE与midi提供的额外自动重写变量

除了默认的<cite doc-id="PxmxwHtBniay5LkIH7nce8LunGh" file-type="wiki" title="掷骰数据" type="doc"></cite>，DAE和MIDI额外提供了一些可以引用并自动重写的变量

### 伤害与掷骰结果（Dynamics & Rolls）

*最常用于调整伤害值、附加效果或触发条件。*

| 变量名 | 类型 | 含义 | 来源 |
|-|-|-|-|
| `@damageTotal` | Number | 当前目标受到的总伤害（含所有类型，未经抗性/免疫计算） | Midi-QOL |
| `@damage` / `@damageApplied` | Number | 当前目标 HP 实际减少量（不包含作用于临时生命值的伤害，且是计算完抗性/免疫之后的结果） | Midi-QOL |
| `@damageComponents` | Object | 按类型汇总的伤害对象，如 `{fire: 10, lightning: 5}` | Midi-QOL |
| `@bonusDamage` | Number | 额外伤害总量 | Midi-QOL |
| `@otherDamage` | Number | 其他伤害总量 | Midi-QOL |
| `@critical` | Boolean | 是否为重击 | Midi-QOL |
| `@fumble` | Boolean | 是否为失误（大失败） | Midi-QOL |
| `@utilityRollTotal` | Number | 效用行动的掷骰结果（若有） | Midi-QOL |

---

### 施法者与物品

*用于获取触发效果的角色、物品或行动信息。*

| 变量名 | 类型 | 含义 | 来源 |
|-|-|-|-|
| `@actorUuid` | String | 施法者 Actor 的 UUID | DAE / Midi |
| `@tokenUuid` | String | 施法者 Token 的 UUID | DAE / Midi |
| `@token` | String (ID) | 施法者 Token 的 ID | DAE |
| `@item` | Object | 触发物品的掷骰数据（`getRollData().item`） | DAE / Midi |
| `@itemData` | Object | 触发物品的纯数据对象（`toObject(false)`） | DAE |
| `@itemId` / `@itemUuid` | String | 触发物品的 ID / UUID | DAE |
| `@activity` | Object | 触发行动的数据对象（`getRollData().activity`） | Midi-QOL |
| `@origin` | String | 效果的来源 UUID（通常为活动或物品的 UUID） | Midi-QOL（动态设置） |

---

### 法术等级与缩放（Spell Level & Scaling）

*主要用于施法相关的效果。*

| 变量名 | 类型 | 含义 | 来源 |
|-|-|-|-|
| `@spellLevel` | Number | 当前施放的法术等级（或物品等级） | DAE / Midi |
| `@itemLevel` | Number | 同 `spellLevel`（兼容别名） | DAE |
| `@flags.dnd5e.spellLevel` | Number | 从聊天卡片提取的法术等级 | Midi-QOL |
| `@flags.dnd5e.scaling` | Number | 缩放等级 | Midi-QOL |

---

### 目标与场景

| 变量名 | 类型 | 含义 | 来源 |
|-|-|-|-|
| `@target` | String (ID) | 目标 Token 的 ID（占位符） | DAE |
| `@targetUuid` | String | 目标 Token 的 UUID（占位符） | DAE |
| `@targetActorUuid` | String | 目标 Actor 的 UUID（占位符） | DAE |
| `@scene` | String (ID) | 当前场景的 ID | DAE |
| `@itemCardUuid` | String | 物品卡片（聊天消息）的 UUID | DAE / Midi |

---

### 通用

| 变量名 | 类型 | 含义 | 来源 |
|-|-|-|-|
| `@unique` | String | 随机生成的唯一 ID（用于区分多次调用） | DAE |
| `@change` | String (JSON) | 当前正在处理的 Change 对象的 JSON 字符串 | DAE |
| `@stackCount` | Number | Effect 的当前堆叠层数 | DAE（在 GMAction 中注入） |
| `@toggleEffect` | Boolean | 是否为切换效果（来自活动属性） | Midi-QOL |
| `@workflowOptions` | Object | Midi-QOL 工作流的workflowOptions对象 | Midi-QOL |