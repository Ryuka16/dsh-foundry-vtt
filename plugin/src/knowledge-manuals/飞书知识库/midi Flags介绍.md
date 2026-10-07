# midi Flags介绍

<callout emoji="🤠"><p><b>注意：</b>几乎所有的midi flag的值中接受类似于使用条件的js语句判断（参考<cite doc-id="SDBHwnvcWigh6gkvZpEc48xQn2f" file-type="wiki" title="激活条件" type="doc"></cite>），你可以依赖此来实现一些有条件的优势/劣势</p></callout>

本文档是通过效果可以设置的 `flags.midi-qol.*` 标志的参考。



## **通过效果设置标志**

所有 midi-qol 标志都应使用效果中的`自定义`模式进行设置。`自定义`模式通过`midiCustomEffect()`触发 midi-qol 的特殊处理。

**示例：** 

```Plain Text
flags.midi-qol.advantage.attack.all 自定义 1
```

---

### **`自定义`模式处理方式**

当应用`自定义`模式的效果时，midi-qol 根据标志类型处理其值：

| **标志类别** | **值处理方式** |
|-|-|
| 延迟求值 | 值按原样存储，稍后在检查标志时求值 |
| 字符串 (onUseMacroName, DR.all 等)  | 值存储为字符串 |
| 数字 (DR.{attackType})  | 值解析为数字 |
| 布尔 (默认) | 值作为条件表达式求值 |

### **BooleanFormula 字段**

许多 midi-qol 标志在 DAE 中注册为 **BooleanFormula** 字段。BooleanFormula 是 DAE 的 \`BooleanFormulaField\` 类提供的自定义字段类型，它接受布尔值 (\`true\`/\`false\`) 或在运行时作为条件公式求值的字符串表达式。在 DAE Active Effect 编辑器中，BooleanFormula 字段会显示一个专门的输入框，允许输入简单的开关或条件表达式。

以下章节中标记为 **BooleanFormula** 的标志接受：

- `1`, `true` — 始终激活
- `0`, `false` — 从不激活
- 条件表达式字符串（例如 `abilities.str.mod >= 3`）— 在运行时求值

优势、劣势、noAdvantage、noDisadvantage、fail、success、critical、noCritical、fumble、noFumble、grants、magicResistance 和 magicVulnerability 类别中的所有 **求值** 标志都是 BooleanFormula 字段。

此外，以下特殊标志也是 BooleanFormula：`neverTarget`、`ignoreNearbyFoes`、`potentCantrip`、`sculptSpells`、`carefulSpells`、`sharpShooter`、`uncanny-dodge`、`inMotion`、`initiativeAdv`、`initiativeDisadv`、`initiativeNoAdv`、`initiativeNoDisadv`、`advantage.concentration`、`disadvantage.concentration`、`noAdvantage.concentration`、`noDisadvantage.concentration`、`fail.disadvantage.heavy` 和 `canFlank`。



**延迟求值标志** 包括：

- `flags.midi-qol.optional.*` - 可选加值效果
- `flags.midi-qol.advantage.*``/``disadvantage.*` - 优势/劣势条件
- `flags.midi-qol.grants.*` - 应用于其他目标的效果
- `flags.midi-qol.fail.*``/``success.*` - 自动失败/成功条件
- `flags.midi-qol.critical.*``/``noCritical.*` - 重击调整
- `flags.midi-qol.superSaver.*``/``semiSuperSaver.*` - 豁免伤害修改
- `flags.midi-qol.max.damage.*``/``min.damage.*` - 伤害骰极端值
- `flags.midi-qol.OverTime` - 持续效果定义
- `flags.midi-qol.rangeOverride.*` - 射程覆盖条件
- `flags.midi-qol.ignoreCover``/``ignoreWalls` - 忽略掩护/墙壁条件

对于**延迟**标志，值可以是：

- `true`, `1` → 存储为布尔值 `true`
- `false`, `0` → 存储为布尔值 `false`
- 任何其他字符串 → 按原样存储以便后续条件求值

---

### **特殊值处理**

#### **onUseMacroName 标志**

`flags.midi-qol.onUseMacroName` 标志有特殊处理。值格式为：`宏引用, 传递类型`。此标志可用以通过主动效果指定角色的onUse宏使宏在特定时点触发

其中**宏引用**可以是：

- `ItemMacro` - 调用物品的宏（自动重写为包含物品UUID）
- `ItemMacro.{itemUuid}` - 调用特定物品的宏
- `ActivityMacro` - 调用行动的宏（自动重写为包含行动UUID）
- `ActivityMacro.{activityUuid}` - 调用特定行动的宏
- `ActivityMacro.{activityName}` - 按名称调用行动（解析为UUID）
- `Macro.{macroName}` - 调用世界/合集宏

而 `传递类型` 是宏传递阶段（例如 `preItemRoll`, `postActiveEffects` 等）。

---

**自动重写：**

| **输入值** | **重写为** |
|-|-|
| `ItemMacro` (在转移的效果上) | `ItemMacro.{父物品UUID}` |
| `ItemMacro` (在非转移的效果上) | `ItemMacro.{起源物品UUID}` |
| `ActivityMacro` (带有 DAE 行动标志) | `ActivityMacro.{dae``行动``UUID}` |
| `ActivityMacro` (在转移的效果上) | `ActivityMacro.{首个``行动``UUID}` |
| `ActivityMacro` (在非转移的效果上) | `ActivityMacro.{``来源``首个``行动``UUID}` |
| `ActivityMacro.{名称}` | `ActivityMacro.{已解析``行动``UUID}` |

最终存储的值包含附加了 `|` 的起源物品 UUID：

```Plain Text
[传递类型]宏引用|起源物品UUID
```

多个 onUseMacroName 效果用逗号连接。

---

#### **可选加值标志中的 ItemMacro**

当使用 `ItemMacro` 作为可选加值标志的值时（例如 `flags.midi-qol.optional.NAME.attack.all`），它会自动重写：

| **输入值** | **重写为** |
|-|-|
| `ItemMacro` (起源是物品) | `ItemMacro.{起源物品UUID}` |
| `ItemMacro` (起源是 ActiveEffect) | `ItemMacro.{效果起源UUID}` |
| `ItemMacro` (起源包含 ActiveEffect) | `ItemMacro.{父物品UUID}` (从路径中剥离 ActiveEffect) |

这允许效果引用其源物品的宏，而无需硬编码 UUID。

---

## **标志访问类型**

标志以两种方式访问：

| **访问类型** | **描述** |
|-|-|
| 求值 | 值被视为条件表达式并使用`evalCondition()`求值。可以包含掷骰数据引用，如 `@abilities.str.mod > 2` |
| 直接 | 值直接作为数字、布尔值或字符串读取，无需表达式求值 |
| 特殊 | 自定义处理逻辑（参见计数格式选项、增益值） |

以下每个部分都标明了其标志的访问类型。

---

## **条件表达式求值**

标记为**求值**的标志可以包含条件表达式。这些表达式在运行时使用`evalCondition()`求值。

### **基本语法**

| **值** | **结果** |
|-|-|
| `1`, `true` | 始终激活 |
| `0`, `false` | 永不激活 |
| `expression` | 求值 - 结果为真则激活 |

---

### **数据引用**

条件数据可直接在表达式中使用。`@`前缀是可选的 - 两种形式都有效：

```Plain Text
abilities.str.mod >= 3           // 直接访问（首选）
@abilities.str.mod >= 3          // 也有效（掷骰公式语法）

attributes.hp.value < attributes.hp.max / 2
classes.barbarian.levels >= 5
item.level >= 3
details.cr >= 10
```

**注意：** `@`语法使用`Roll.replaceFormulaData()`进行替换，而直接访问使用沙箱代理。两者产生相同结果。

---

### **表达式中可用的数据**

#### **角色数据（来自 \`actor.getRollData()\`）**

| **路径** | **描述** |
|-|-|
| `abilities.{abl}.mod` | 属性调整值（str, dex, con, int, wis, cha） |
| `abilities.{abl}.value` | 属性值 |
| `abilities.{abl}.save` | 豁免检定加值 |
| `attributes.hp.value` | 当前生命值 |
| `attributes.hp.max` | 最大生命值 |
| `attributes.hp.temp` | 临时生命值 |
| `attributes.ac.value` | 护甲等级 |
| `attributes.prof` | 熟练加值 |
| `attributes.spell.dc` | 法术豁免DC |
| `classes.{className}.levels` | 职业等级 |
| `details.level` | 角色等级 |
| `details.cr` | 挑战等级（NPC） |
| `resources.primary.value` | 主要资源值 |
| `flags` | 角色标志 |
| `actor.raceOrType` | 角色的种族或生物类型 |
| `actor.typeOrRace` | 角色的生物类型或种族 |
| `items` | 角色物品掷骰数据数组 |
| `equippedItems` | 角色已装备物品掷骰数据数组 |

---

#### **物品数据**

| **路径** | **描述** |
|-|-|
| `item.level` | 物品/法术环阶 |
| `item.type` | 物品类型 |
| `item.attunement` | 同调状态 |
| `item.equipped` | 物品是否已装备 |
| `isAttuned` | 物品是否同调 |

---

#### **目标数据（当存在目标时）**

| **路径** | **描述** |
|-|-|
| `target.abilities.{abl}.mod` | 目标的属性调整值 |
| `target.attributes.hp.value` | 目标的当前生命值 |
| `target.attributes.ac.value` | 目标的 AC |
| `target.details.cr` | 目标的 CR |
| `target.raceOrType` | 目标的种族或生物类型 |
| `target.typeOrRace` | 目标的生物类型或种族 |
| `target.saved` | 目标豁免检定成功（在工作流中） |
| `target.failedSave` | 目标豁免检定失败 |
| `target.superSaver` | 目标具有反射闪避特性 |
| `target.semiSuperSaver` | 目标具有半反射闪避特性 |
| `target.isHit` | 目标被命中 |
| `target.isCombatTurn` | 是否是目标的战斗回合 |
| `target.items` | 目标物品掷骰数据数组 |
| `target.equippedItems` | 目标已装备物品掷骰数据数组 |
| `target.canSee` | 目标可以看到角色 |
| `target.canSense` | 目标可以感知到角色 |
| `canSee` | 角色可以看到目标 |
| `canSense` | 角色可以感知到目标 |
| `raceOrType` | 与 target.raceOrType 相同 |
| `typeOrRace` | 与 target.typeOrRace 相同 |

---

#### **工作流数据（在工作流中时）**

| **路径** | **描述** |
|-|-|
| `workflow` 或 `w` | 完整的工作流对象 |
| `activity` 或 `a` | 正在使用的行动 |
| `hasSave` | 行动有豁免 |
| `hasAttack` | 行动有攻击 |
| `hasDamage` | 行动有伤害 |
| `shouldRollDamage` | 应掷伤害 |
| `damageTypes.{type}` | 伤害包含此类型（火焰、冷冻等） |
| `riderStatuses.{status}` | 效果应用此状态 |

---

#### **战斗数据**

| **路径** | **描述** |
|-|-|
| `combatRound` | 当前战斗轮次 |
| `combatTurn` | 当前战斗回合 |
| `combatTime` | 轮次 + 回合/100 |
| `isCombatTurn` | 是否是角色的战斗回合 |
| `actor.isCombatTurn` | 同上 |

---

#### **UUID 和 ID 引用**

| **路径** | **描述** |
|-|-|
| `tokenUuid` | 角色/施法者的token UUID |
| `targetUuid` | 目标的token UUID |
| `targetActorUuid` | 目标角色的 UUID |
| `targetId` | 目标的token ID |
| `targetActorId` | 目标角色的 ID |

---

#### **特殊值**

| **路径** | **描述** |
|-|-|
| `humanoid` | 类人生物种族字符串数组：`["human", "humanoid", "elven", "elf", "half-elf", "drow", "dwarf", "dwarven", "halfling", "gnome", "tiefling", "orc", "dragonborn", "half-orc"]` |
| `worldTime` | 游戏世界时间 |
| `isConcentrationCheck` | 是否为专注检定 |
| `isDeathSave` | 是否为死亡豁免 |
| `CONFIG` | Foundry CONFIG 对象 |
| `CONST` | Foundry CONST 对象 |

---

### **辅助函数**

这些函数在表达式中可用。角色/token参数接受 UUID（使用 `tokenUuid`, `targetUuid`）：

| **函数** | **描述** |
|-|-|
| `hasCondition(actorOrUuid, "condition")` | 如果角色有条件则返回 1，否则返回 0 |
| `checkIncapacitated(actorOrUuid)` | 如果失去行动能力则返回条件名称，否则返回 false |
| `checkDefeated(actorOrUuid)` | 如果被击败则返回 1，否则返回 0 |
| `findNearby(disposition, tokenOrUuid, distance, options)` | 返回附近token数组 |
| `findNearbyCount(disposition, tokenOrUuid, distance, options)` | 返回附近token计数 |
| `checkNearby(disposition, tokenOrUuid, distance, options)` | 如果附近有任何满足阵营限制的token则返回 true |
| `canSee(tokenOrUuid, targetOrUuid)` | 如果token可以看到目标则返回 true |
| `canSense(tokenOrUuid, targetOrUuid)` | 如果token可以感知到目标则返回 true |
| `computeDistance(token1OrUuid, token2OrUuid, options)` | 返回token之间的距离 |
| `fromUuidSync(uuid)` | 同步通过 UUID 检索文档 |
| `Roll` | Foundry Roll 类 |
| `abs()`, `floor()`, `ceil()`, `min()`, `max()` 等 | 数学函数（直接使用，无需 `Math.` 前缀） |
| `evalRaceOrType(actorOrUuid)` | 返回种族或类型（小写），优先种族 |
| `evalTypeOrRaceEval(actorOrUuid)` | 返回类型或种族（小写），优先类型 |

**findNearby 参数**

```JavaScript
{
  includeIncapacitated: false,  // 包括失去行动能力的token
  includeToken: false,          // 包括源token
  canSee: false,                // 仅能看见源的token
  isSeen: false                 // 仅被源看见的token
}
```

**disposition 值**

- `-1` = 敌对
- `0` = 中立
- `1` = 友好
- `null` = 任意阵营

---

### **表达式示例**

**简单条件**

```Plain Text
1                                    // 始终激活
abilities.str.mod >= 3               // 力量调整值 3 或更高
attributes.hp.value < attributes.hp.max / 2   // 低于一半生命值
classes.barbarian.levels >= 3        // 野蛮人等级 3+
```

**使用辅助函数**

```Plain Text
hasCondition(tokenUuid, "raging")       // 角色有狂暴条件
!checkIncapacitated(tokenUuid)          // 角色未失去行动能力
findNearbyCount(-1, tokenUuid, 5) >= 1  // 有敌人距离角色 5 英尺内
hasCondition(targetUuid, "frightened")  // 目标被恐慌
canSee(tokenUuid, targetUuid)           // 角色可以看到目标
```

**复杂条件**

```Plain Text
abilities.str.mod >= 3 && classes.fighter.levels >= 5
target.details.cr >= 10 || target.attributes.hp.max >= 100
hasCondition(tokenUuid, "raging") && attributes.hp.value > 0
```

**伤害类型条件**

```Plain Text
damageTypes.fire                    // 攻击造成火焰伤害
damageTypes.radiant || damageTypes.fire   // 火焰或光耀伤害
```

**种族/类型条件**

```Plain Text
raceOrType === "undead"             // 目标是不死生物
humanoid.includes(raceOrType)       // 目标是类人生物
["fiend", "undead"].includes(target.raceOrType)  // 邪魔或不死生物
```

### **复杂效果示例：防护善恶**

此法术保护一个生物免受异怪、天界生物、元素生物、精类生物、邪魔和不死生物的攻击。这些生物类型对受保护生物的攻击具有劣势，并且受保护生物对抗它们效果的豁免检定获得优势。

| **属性键** | **更改模式** | **效果值** |
|-|-|-|
| `flags.midi-qol.grants.disadvantage.attack.all` | 自定义 | `["aberration","celestial","elemental","fey","fiend","undead"].includes(actor.raceOrType)` |
| `flags.midi-qol.advantage.save.all` | 自定义 | `["aberration","celestial","elemental","fey","fiend","undead"].includes(actor.raceOrType)` |

**工作原理：**

- 效果应用于 **目标**（受保护的生物）
- `grants.disadvantage.attack.all`：当生物攻击目标时，`actor.raceOrType` 指的是 **攻击者的** 生物类型——如果匹配，攻击者具有劣势
- `advantage.save.all`：当目标进行豁免时，`actor.raceOrType` 指的是 **攻击者的** 生物类型（强制目标进行豁免的那个）——如果匹配，目标在该豁免上获得优势

---

### **效果中的条件值**

对于使用`自定义`模式的效果，使用三元运算符处理条件值：

```Plain Text
键: flags.midi-qol.advantage.attack.all
模式: 自定义
值: hasCondition(tokenUuid, "raging") ? 1 : false
```

表达式作为 JavaScript 求值，结果决定标志值。

**格式：** `condition ? 为真时的值 : 为假时的值`

| **示例值** | **含义** |
|-|-|
| `1` | 始终为真 |
| `abilities.str.mod >= 3 ? 1 : false` | 如果力量调整值 >= 3 则为真 |
| `classes.rogue.levels ? 2 : false` | 如果有盗贼等级则返回 2 |
| `hasCondition(tokenUuid, "enlarged") ? abilities.str.mod : 0` | 如果变巨则返回力量调整值，否则为 0 |

---

## **优势**

在各种掷骰类型上给予优势。所有优势标志均为**求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

### **所有检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.advantage.all` | 求值 | 所有D20检定优势 |
| `flags.midi-qol.advantage.ability.all` | 求值 | 所有豁免检定、属性检定和技能检定优势 |

---

### **攻击检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.advantage.attack.all` | 求值 | 所有攻击类型优势 |
| `flags.midi-qol.advantage.attack.{attackType}` | 求值 | 特定攻击类型优势 |
| `flags.midi-qol.advantage.attack.{ability}` | 求值 | 使用特定属性的攻击优势 |

**攻击类型:** *mwak, rwak, msak, rsak. 属性: str, dex, con, int, wis, cha.*

---

### **豁免检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.advantage.save.all` | 求值 | 所有豁免检定优势 |
| `flags.midi-qol.advantage.save.{ability}` | 求值 | 特定豁免检定优势 |

**属性:** *str, dex, con, int, wis, cha.*

---

### **属性检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.advantage.check.all` | 求值 | 所有属性检定和技能检定优势 |
| `flags.midi-qol.advantage.check.{ability}` | 求值 | 特定属性检定优势 |

**属性:** *str, dex, con, int, wis, cha.*

---

### **技能检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.advantage.skill.all` | 求值 | 所有技能检定优势 |
| `flags.midi-qol.advantage.skill.{skill}` | 求值 | 特定技能检定优势 |

**技能:** *acr, ani, arc, ath, dec, his, ins, itm, inv, med, nat, prc, per, prf, rel, slt, ste, sur.*

> 属性检定优势/劣势标志也适用于使用该属性的技能。例如，`advantage.ability.check.dex` 赋予 acr, slt, ste 检定优势（所有基于 dex 的技能）。

---

### **工具检定**

| **标志** | **访问类型** | **描述** |
|-|-|-|
| `flags.midi-qol.advantage.tool.all` | 求值 | 所有工具检定获得优势 |
| `flags.midi-qol.advantage.tool.{tool}` | 求值 | 特定工具检定获得优势 |

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver。*

---

### **特殊优势**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.advantage.concentration` | 求值 | 专注检定优势 |
| `flags.midi-qol.advantage.deathSave` | 求值 | 死亡豁免优势。  <br/>**原生替代：** `system.attributes.death.roll.mode = 1` |
| `flags.midi-qol.advantage.initiative` | 求值 | 先攻检定优势 |
| `flags.dnd5e.initiativeAdv` | 求值 | 先攻检定优势（DND系统） |

---

## **劣势**

在各种掷骰类型上给予劣势。所有劣势标志均为**求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

### **所有检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.disadvantage.all` | 求值 | 所有 d20 检定劣势 |
| `flags.midi-qol.disadvantage.ability.all` | 求值 | 所有豁免检定、属性检定和技能检定劣势 |

---

### **攻击检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.disadvantage.attack.all` | 求值 | 所有攻击检定劣势 |
| `flags.midi-qol.disadvantage.attack.{attackType}` | 求值 | 特定攻击类型劣势 |
| `flags.midi-qol.disadvantage.attack.{ability}` | 求值 | 使用特定属性的攻击检定劣势 |

**攻击类型:** *mwak, rwak, msak, rsak. 属性: str, dex, con, int, wis, cha.*

---

### **豁免检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.disadvantage.save.all` | 求值 | 所有豁免检定劣势 |
| `flags.midi-qol.disadvantage.save.{ability}` | 求值 | 特定豁免检定劣势 |

**属性:** *str, dex, con, int, wis, cha.*

---

### **属性检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.disadvantage.check.all` | 求值 | 所有属性检定劣势 |
| `flags.midi-qol.disadvantage.check.{ability}` | 求值 | 特定属性检定劣势 |

**属性:** *str, dex, con, int, wis, cha.*

---

### **技能检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.disadvantage.skill.all` | 求值 | 所有技能检定劣势 |
| `flags.midi-qol.disadvantage.skill.{skill}` | 求值 | 特定技能检定劣势 |

**技能:** *acr, ani, arc, ath, dec, his, ins, itm, inv, med, nat, prc, per, prf, rel, slt, ste, sur.*

> 属性检定优势/劣势标志也适用于使用该属性的技能。例如，`disadvantage.check.str` 对 ath 检定施加劣势（基于 str 的技能）。

---

### **工具检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.disadvantage.tool.all` | 求值 | 所有工具检定具有劣势 |
| `flags.midi-qol.disadvantage.tool.{tool}` | 求值 | 特定工具检定具有劣势 |

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver。*

---

### **特殊劣势**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.disadvantage.concentration` | 求值 | 专注检定劣势 |
| `flags.midi-qol.disadvantage.deathSave` | 求值 | 死亡豁免劣势。  <br/>**原生替代：** `system.attributes.death.roll.mode = -1` |
| `flags.midi-qol.disdvantage.initiative` | 求值 | 先攻检定劣势 |
| `flags.dnd5e.initiativeDisadv` | 求值 | 先攻检定劣势（DND系统） |

---

## **无法获得优势**

各种类型的掷骰无法获得优势。这些标志即使在有其他来源赋予优势时也会取消优势。所有 noAdvantage 标志都是 **求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

### **所有检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noAdvantage.all` | 求值 | 所有 d20 检定无法获得优势 |

### **攻击检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noAdvantage.attack.all` | 求值 | 所有攻击检定无法获得优势 |
| `flags.midi-qol.noAdvantage.attack.{attackType}` | 求值 | 特定攻击检定无法获得优势 |

**攻击类型：***mwak, rwak, msak, rsak。*

### **豁免检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noAdvantage.save.all` | 求值 | 所有豁免检定无法获得优势 |
| `flags.midi-qol.noAdvantage.save.{ability}` | 求值 | 特定豁免检定无法获得优势 |

**属性：***str, dex, con, int, wis, cha。*

### **属性检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noAdvantage.check.all` | 求值 | 所有属性检定无法获得优势 |
| `flags.midi-qol.noAdvantage.check.{ability}` | 求值 | 特定属性检定无法获得优势 |

**属性：***str, dex, con, int, wis, cha。*

### **技能检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noAdvantage.skill.all` | 求值 | 所有技能检定无法获得优势 |
| `flags.midi-qol.noAdvantage.skill.{skill}` | 求值 | 特定技能检定无法获得优势 |
| `flags.midi-qol.noAdvantage.skill.{ability}` | 求值 | 使用特定属性的技能检定无法获得优势 |

**技能：***acr, ani, arc, ath, dec, his, ins, itm, inv, med, nat, prc, per, prf, rel, slt, ste, sur。*

**属性：***str, dex, con, int, wis, cha。*

### **工具检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noAdvantage.tool.all` | 求值 | 所有工具检定无法获得优势 |
| `flags.midi-qol.noAdvantage.tool.{tool}` | 求值 | 特定工具检定无法获得优势 |

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver。*

### **特殊检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noAdvantage.concentration` | 求值 | 专注检定无法获得优势 |
| `flags.midi-qol.noAdvantage.deathSave` | 求值 | 死亡豁免无法获得优势 |
| `flags.midi-qol.noAdvantage.initiative` | 求值 | 先攻检定无法获得优势 |
| `flags.dnd5e.initiativeNoAdv` | 求值 | 先攻检定无法获得优势（DND系统） |

---

## **无法承受劣势**

各种类型掷骰无法承受劣势。这些标志即使在有其他来源施加劣势时也会取消劣势。所有 noDisadvantage 标志都是 **求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

### **所有检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noDisadvantage.all` | 求值 | 所有 d20 检定无法承受劣势 |

### **攻击检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noDisadvantage.attack.all` | 求值 | 所有攻击检定无法承受劣势 |
| `flags.midi-qol.noDisadvantage.attack.{attackType}` | 求值 | 特定攻击检定无法承受劣势 |

**攻击类型：***mwak, rwak, msak, rsak。*

### **豁免检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noDisadvantage.save.all` | 求值 | 所有豁免检定无法承受劣势 |
| `flags.midi-qol.noDisadvantage.save.{ability}` | 求值 | 特定豁免检定无法承受劣势 |

**属性：***str, dex, con, int, wis, cha。*

### **属性检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noDisadvantage.check.all` | 求值 | 所有属性检定无法承受劣势 |
| `flags.midi-qol.noDisadvantage.check.{ability}` | 求值 | 特定属性检定无法承受劣势 |

**属性：***str, dex, con, int, wis, cha。*

### **技能检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noDisadvantage.skill.all` | 求值 | 所有技能检定无法承受劣势 |
| `flags.midi-qol.noDisadvantage.skill.{skill}` | 求值 | 特定技能检定无法承受劣势 |
| `flags.midi-qol.noDisadvantage.skill.{ability}` | 求值 | 使用特定属性的技能检定无法承受劣势 |

**技能：***acr, ani, arc, ath, dec, his, ins, itm, inv, med, nat, prc, per, prf, rel, slt, ste, sur。*

**属性：***str, dex, con, int, wis, cha。*

### **工具检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noDisadvantage.tool.all` | 求值 | 所有工具检定无法承受劣势 |
| `flags.midi-qol.noDisadvantage.tool.{tool}` | 求值 | 特定工具检定无法承受劣势 |

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver。*

### **特殊检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noDisadvantage.concentration` | 求值 | 专注检定无法承受劣势 |
| `flags.midi-qol.noDisadvantage.deathSave` | 求值 | 死亡豁免无法承受劣势 |
| `flags.midi-qol.noDisadvantage.initiative` | 求值 | 先攻检定无法承受劣势 |
| `flags.dnd5e.initiativeNoDisadv` | 求值 | 先攻检定无法承受劣势（DND5e 系统标志） |

---

## **强制重击**

强制转为重击。所有重击标志均为**求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.critical.all` | 求值 | 强制所有攻击类型自动造成重击 |
| `flags.midi-qol.critical.{attackType}` | 求值 | 强制特定攻击类型自动造成重击 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util.*

> 我们仍然不知道为什么attackType里会有save.....

---

## **无法重击**

不会造成重击。所有无法重击标志均为**求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noCritical.all` | 求值 | 所有攻击类型不会造成重击 |
| `flags.midi-qol.noCritical.{attackType}` | 求值 | 特定攻击类型不会造成重击 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util.*

---

## **强制大失败**

强制转为大失败。所有大失败标志均为**求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.fumble.all` | 求值 | 强制所有攻击类型自动大失败 |
| `flags.midi-qol.fumble.{attackType}` | 求值 | 特定攻击类型自动大失败 |

**攻击类型：***mwak, rwak, msak, rsak, heal, other, save, util。*

---

## **无法大失败**

检定不会大失败。所有无法大失败标志均为**求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.noFumble.all` | 求值 | 所有攻击类型不会大失败 |
| `flags.midi-qol.noFumble.{attackType}` | 求值 | 特定攻击类型不会大失败 |

**攻击类型：***mwak, rwak, msak, rsak, heal, other, save, util。*

---

## **自动失败**

强制进行的检定自动失败。所有失败标志都是 **求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

### **属性检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.fail.all` | 求值 | 所有行动自动失败 |
| `flags.midi-qol.fail.abi``attack.save``lity.all` | 求值 | 所有基于属性的检定自动失败 |
| `flags.midi-qol.fail.ability.save.all` | 求值 | 所有豁免检定自动失败 |
| `flags.midi-qol.fail.ability.save.{ability}` | 求值 | 特定豁免检定自动失败 |
| `flags.midi-qol.fail.ability.check.all` | 求值 | 所有属性检定自动失败 |
| `flags.midi-qol.fail.ability.check.{ability}` | 求值 | 特定属性检定自动失败 |

**属性:** *str, dex, con, int, wis, cha.*

---

### **攻击检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.fail.attack.all` | 求值 | 所有攻击检定自动失败 |
| `flags.midi-qol.fail.attack.{attackType}` | 求值 | 特定攻击类型自动失败 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util.*

---

### **技能检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.fail.skill.all` | 求值 | 所有技能检定自动失败 |
| `flags.midi-qol.fail.skill.{skill}` | 求值 | 特定技能检定自动失败 |

**技能:** *acr, ani, arc, ath, dec, his, ins, itm, inv, med, nat, prc, per, prf, rel, slt, ste, sur.*

---

### **工具检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.fail.tool.all` | 求值 | 所有工具检定自动失败 |
| `flags.midi-qol.fail.tool.{tool}` | 求值 | 特定工具检定自动失败 |

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver。*

---

### **施法**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.fail.spell.vocal` | 求值 | 无法施放带有言语成分的法术 |
| `flags.midi-qol.fail.spell.somatic` | 求值 | 无法施放带有姿势成分的法术 |
| `flags.midi-qol.fail.spell.material` | 求值 | 无法施放带有材料成分的法术 |

---

## **自动成功**

强制进行的检定自动成功。所有成功标志都是 **求值**（条件表达式）并在 DAE 中注册为 **BooleanFormula** 字段。

### **攻击检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.success.attack.all` | 求值 | 所有攻击自动成功 |
| `flags.midi-qol.success.attack.{attackType}` | 求值 | 特定攻击类型自动成功 |

**攻击类型：***mwak, rwak, msak, rsak, heal, other, save, util。*

---

### **属性检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.success.ability.all` | 求值 | 豁免检定和属性检定自动成功 |
| `flags.midi-qol.success.ability.save.all` | 求值 | 所有豁免检定自动成功 |
| `flags.midi-qol.success.ability.save.{ability}` | 求值 | 特定豁免检定自动成功 |
| `flags.midi-qol.success.ability.check.all` | 求值 | 所有属性检定自动成功 |
| `flags.midi-qol.success.ability.check.{ability}` | 求值 | 特定属性检定自动成功 |

**属性：***str, dex, con, int, wis, cha。*

---

### **技能检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.success.skill.all` | 求值 | 所有技能检定自动成功 |
| `flags.midi-qol.success.skill.{skill}` | 求值 | 特定技能检定自动成功 |

**技能：***acr, ani, arc, ath, dec, his, ins, itm, inv, med, nat, prc, per, prf, rel, slt, ste, sur。*

---

### **工具检定**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.success.tool.all` | 求值 | 所有工具检定自动成功 |
| `flags.midi-qol.success.tool.{tool}` | 求值 | 特定工具检定自动成功 |

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver。*

---

### **死亡豁免**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.success.deathSave` | 求值 | 死亡豁免自动成功 |

---

## **对抗（目标效果）**

应用于目标的标志，影响对其进行的攻击/掷骰。所有对抗标志均为 **求值**（条件表达式），除非另有说明。

### **对抗攻击者优势**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.advantage.attack.all` | 求值 | 被攻击时，攻击者在所有攻击检定上获得优势 |
| `flags.midi-qol.grants.advantage.attack.{attackType}` | 求值 | 被攻击时，攻击者在特定攻击类型的攻击检定上获得优势 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util.*

---

### **对抗攻击者劣势**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.disadvantage.attack.all` | 求值 | 被攻击时，攻击者在所有攻击检定上承受劣势 |
| `flags.midi-qol.grants.disadvantage.attack.{attackType}` | 求值 | 被攻击时，在特定攻击类型的攻击检定上承受劣势 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util.*

---

### **对抗重击**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.critical.all` | 求值 | 被攻击时，攻击者所有攻击类型的攻击检定自动重击 |
| `flags.midi-qol.grants.critical.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击检定自动重击 |
| `flags.midi-qol.grants.critical.range` | 直接 | 被攻击时，发起攻击的生物在此距离内的攻击检定自动重击（数值） |
| `flags.midi-qol.grants.criticalThreshold` | 求值 | 被攻击时，调整攻击者的重击阈值 |

**攻击类型:** *mwak, rwak, msak, rsak.*

**多目标行为：**对于攻击多个目标的攻击，如果 **任意** 目标具有 `grants.critical`，则该攻击自动重击。

---

### **对抗无法重击**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.noCritical.all` | 求值 | 被攻击时，攻击者所有攻击类型的攻击检定无法重击 |
| `flags.midi-qol.grants.noCritical.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击不会造成重击 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util.*

**多目标行为：** 对于攻击多个目标的攻击，**所有** 目标都必须具有 `grants.noCritical` 才能阻止重击。

---

### **对抗大失败**

强制对抗目标的D20检定自动大失败。对于攻击多个目标的攻击，如果 **任意** 目标具有此标志，则攻击检定自动大失败。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.fumble.all` | 求值 | 被攻击时，攻击者所有攻击类型的攻击检定自动大失败 |
| `flags.midi-qol.grants.fumble.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击检定自动大失败 |

**攻击类型：***mwak, rwak, msak, rsak。*

---

### **对抗无法大失败**

对抗目标的D20检定无法大失败。对于攻击多个目标的攻击，**所有** 目标都必须具有此标志才能防止大失败。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.noFumble.all` | 求值 | 被攻击时，攻击者所有攻击类型的攻击检定不会大失败 |
| `flags.midi-qol.grants.noFumble.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击检定不会大失败 |

**攻击类型：***mwak, rwak, msak, rsak。*

---

### **对抗攻击加值/减值**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.attack.bonus.all` | 求值 | 被攻击时，攻击者的攻击检定获得加值 |
| `flags.midi-qol.grants.attack.bonus.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击检定获得加值 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util.*

---

### **对抗攻击成功/失败**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.attack.success.all` | 求值 | 被攻击时，攻击者的攻击检定自动成功 |
| `flags.midi-qol.grants.attack.success.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击检定自动成功 |
| `flags.midi-qol.grants.attack.fail.all` | 求值 | 被攻击时，攻击者的攻击检定自动失败 |
| `flags.midi-qol.grants.attack.fail.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击检定自动失败 |

**攻击类型:** *mwak, rwak, msak, rsak.*

---

### **对抗无法获得优势/劣势**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.noAdvantage.attack.all` | 求值 | 被攻击时，攻击者的攻击检定无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.attack.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击检定无法获得优势 |
| `flags.midi-qol.grants.noDisadvantage.attack.all` | 求值 | 被攻击时，攻击者的攻击检定无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.attack.{attackType}` | 求值 | 被攻击时，攻击者特定攻击类型的攻击检定无法承受劣势 |

**攻击类型:** *mwak, rwak, msak, rsak.*

---

### **对抗最大/最小伤害**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.max.damage.all` | 求值 | 承受伤害时，所有伤害掷骰造成最大伤害 |
| `flags.midi-qol.grants.max.damage.{attackType}` | 求值 | 承受伤害时，特定伤害掷骰造成最大伤害 |
| `flags.midi-qol.grants.min.damage.all` | 求值 | 承受伤害时，所有伤害掷骰造成最小伤害 |
| `flags.midi-qol.grants.min.damage.{attackType}` | 求值 | 承受伤害时，特定伤害掷骰造成最小伤害 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, save.*

---

### **对抗豁免/检定优势**

这些标志设置在**源角色**上，影响被迫进行豁免或检定的目标。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.Advantage.all` |  | 携带此效果的生物迫使其他生物进行D20检定时，目标在所有D20检定上获得优势 |
| `flags.midi-qol.grants.advantage.save.all` | 求值 | 携带此效果的生物迫使其他生物进行豁免检定时，目标在所有豁免检定上获得优势 |
| `flags.midi-qol.grants.advantage.save.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定豁免检定时，目标在豁免检定上获得优势 |
| `flags.midi-qol.grants.disadvantage.save.all` | 求值 | 携带此效果的生物迫使其他生物进行豁免检定时，目标在所有豁免检定上承受劣势 |
| `flags.midi-qol.grants.disadvantage.save.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定豁免检定时，目标在豁免检定上承受劣势 |
| `flags.midi-qol.grants.advantage.check.all` | 求值 | 携带此效果的生物迫使其他生物进行属性检定时，目标在所有属性检定上获得优势 |
| `flags.midi-qol.grants.advantage.check.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定属性检定时，目标在属性检定上获得优势 |
| `flags.midi-qol.grants.disadvantage.check.all` | 求值 | 携带此效果的生物迫使其他生物进行属性检定时，目标在所有属性检定上获得优势 |
| `flags.midi-qol.grants.advantage.skill.all` | 求值 | 携带此效果的生物迫使其他生物进行技能检定时，目标在所有技能检定上获得优势 |
| `flags.midi-qol.grants.advantage.skill.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定属性技能检定时，目标在技能检定上获得优势 |
| `flags.midi-qol.grants.disadvantage.skill.all` | 求值 | 携带此效果的生物迫使其他生物进行技能检定时，目标在所有技能检定上承受劣势 |
| `flags.midi-qol.grants.advantage.tool.all` | 求值 | 携带此效果的生物迫使其他生物进行工具检定时，目标在所有工具检定上承受优势 |
| `flags.midi-qol.grants.advantage.tool.{toolId}` | 求值 | 携带此效果的生物迫使其他生物进行工具检定时，目标在特定工具检定上承受优势 |
| `flags.midi-qol.grants.disadvantage.tool.all` | 求值 | 携带此效果的生物迫使其他生物进行工具检定时，目标在所有工具检定上承受劣势 |
| `flags.midi-qol.grants.disadvantage.tool.{toolId}` | 求值 | 携带此效果的生物迫使其他生物进行工具检定时，目标在特定工具检定上承受劣势 |

**属性:** *str, dex, con, int, wis, cha.*

**技能：***acr, ani, arc, ath, dec, his, ins, itm, inv, med, nat, prc, per, prf, rel, slt, ste, sur*

---

### **对抗豁免、检定、技能、工具的无法获得优势/劣势**

这些标志设置在**源角色**上，由该角色强迫其他目标进行的检定无法获得优势/劣势，即使目标通常从其他来源获得它们也是如此。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.grants.noAdvantage.all` | 求值 | 携带此效果的生物迫使其他生物进行D20检定时，目标在所有D20检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.save.all` | 求值 | 携带此效果的生物迫使其他生物进行豁免检定时，目标在所有豁免检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.save.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定豁免检定时，目标在豁免检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.check.all` | 求值 | 携带此效果的生物迫使其他生物进行属性检定时，目标在所有属性检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.check.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定属性检定时，目标在属性检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.skill.all` | 求值 | 携带此效果的生物迫使其他生物进行技能检定时，目标在所有技能检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.skill.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定属性技能检定时，目标在技能检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.skill.{skillId}` | 求值 | 携带此效果的生物迫使其他生物进行特定技能检定时，目标在技能检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.tool.all` | 求值 | 携带此效果的生物迫使其他生物进行工具检定时，目标在所有工具检定上无法获得优势 |
| `flags.midi-qol.grants.noAdvantage.tool.{toolId}` | 求值 | 携带此效果的生物迫使其他生物进行特定工具检定时，目标在工具检定上无法获得优势 |
| `flags.midi-qol.grants.noDisadvantage.all` | 求值 | 携带此效果的生物迫使其他生物进行D20检定时，目标在所有D20检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.save.all` | 求值 | 携带此效果的生物迫使其他生物进行豁免检定时，目标在所有豁免检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.save.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定豁免检定时，目标在豁免检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.check.all` | 求值 | 携带此效果的生物迫使其他生物进行属性检定时，目标在所有属性检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.check.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定属性检定时，目标在属性检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.skill.all` | 求值 | 携带此效果的生物迫使其他生物进行技能检定时，目标在所有技能检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.skill.{ability}` | 求值 | 携带此效果的生物迫使其他生物进行特定属性技能检定时，目标在技能检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.skill.{skillId}` | 求值 | 携带此效果的生物迫使其他生物进行特定技能检定时，目标在技能检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.tool.all` | 求值 | 携带此效果的生物迫使其他生物进行工具检定时，目标在所有工具检定上无法承受劣势 |
| `flags.midi-qol.grants.noDisadvantage.tool.{toolId}` | 求值 | 携带此效果的生物迫使其他生物进行特定工具检定时，目标在工具检定上无法承受劣势 |

**属性：***str, dex, con, int, wis, cha。*

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver*

---

## **魔法抗性/易伤**

对魔法效果的豁免获得优势或劣势。所有魔法抗性/易伤标志均为**求值**（条件表达式）。

### **魔法抗性**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.magicResistance.all` | 求值 | 对抗魔法时所有检定获得优势 |
| `flags.midi-qol.magicResistance.save.all` | 求值 | 对抗魔法时所有豁免检定获得优势 |
| `flags.midi-qol.magicResistance.{ability}` | 求值 | 对抗魔法时特定属性进行的检定获得优势 |
| `flags.midi-qol.magicResistance.check.all` | 求值 | 对抗魔法时所有属性检定获得优势 |
| `flags.midi-qol.magicResistance.skill.all` | 求值 | 对抗魔法时所有技能检定获得优势 |

**属性:** *str, dex, con, int, wis, cha.*

---

### **魔法易伤**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.magicVulnerability.all` | 求值 | 对抗魔法时所有检定承受劣势 |
| `flags.midi-qol.magicVulnerability.all.{ability}` | 求值 | 对抗魔法时特定属性进行的检定承受劣势 |

**属性:** *str, dex, con, int, wis, cha.*

---

## **最小/最大骰值**

设置D20检定（非总计）的最小值或最大值。所有最小/最大标志均为**直接**（数值）。

**注意：**某些标志已映射到系统字段（已弃用）。

### **最大掷骰**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.max.ability.save.all` | 直接 | 所有豁免检定的最大D20掷骰值 |
| `flags.midi-qol.max.ability.save.{ability}` | 直接 | 特定豁免检定的最大D20掷骰值 |
| `flags.midi-qol.max.ability.save.concentration` | 直接 | 专注豁免检定的最大D20掷骰值  <br/>**映射到：** `system.attributes.concentration.roll.max` |
| `flags.midi-qol.max.ability.check.all` | 直接 | 所有属性检定的最大D20掷骰值 |
| `flags.midi-qol.max.ability.check.{ability}` | 直接 | 特定属性检定的最大D20掷骰值 |
| `flags.midi-qol.max.skill.all` | 直接 | 所有技能检定的最大D20掷骰值 |
| `flags.midi-qol.max.skill.{skill}` | 直接 | 特定技能检定的最大D20掷骰值  <br/>**映射到：** `system.skills.{skill}.roll.max` |
| `flags.midi-qol.max.tool.all` | 直接 | 所有工具检定的最大D20掷骰值 |
| `flags.midi-qol.max.tool.{tool}` | 直接 | 特定工具检定的最大D20掷骰值 |

**属性:** *str, dex, con, int, wis, cha*

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver*

---

### **最小掷骰**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.min.ability.save.all` | 直接 | 所有豁免检定的最小D20掷骰值 |
| `flags.midi-qol.min.ability.save.{ability}` | 直接 | 特定豁免检定的最小D20掷骰值 |
| `flags.midi-qol.min.ability.save.concentration` | 直接 | 专注豁免检定的最小D20掷骰值  <br/>**映射到：** `system.attributes.concentration.roll.min` |
| `flags.midi-qol.min.ability.check.all` | 直接 | 所有属性检定的最小D20掷骰值 |
| `flags.midi-qol.min.ability.check.{ability}` | 直接 | 特定属性检定的最小D20掷骰值 |
| `flags.midi-qol.min.skill.{skill}` | 直接 | 特定技能检定的最小D20掷骰值  <br/>**映射到：** `system.skills.{skill}.roll.min` |
| `flags.midi-qol.min.tool.all` | 直接 | 所有工具检定的最小D20掷骰值 |
| `flags.midi-qol.min.tool.{tool}` | 直接 | 特定工具检定的最小D20掷骰值 |

**属性:** *str, dex, con, int, wis, cha*

**工具：***alchemist, bagpipes, brewer, calligrapher, card, carpenter, cartographer, chess, cobbler, cook, dice, disg, drum, dulcimer, flute, forg, glassblower, herb, horn, jeweler, leatherworker, lute, lyre, mason, navg, painter, panflute, pois, potter, shawm, smith, thief, tinker, viol, weaver, woodcarver*

---

## **伤害调整**

### **最大/最小伤害**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.max.damage.all` | 直接 | 所有伤害掷骰最大化 |
| `flags.midi-qol.max.damage.{attackType}` | 直接 | 特定攻击类型伤害最大化 |
| `flags.midi-qol.min.damage.all` | 直接 | 所有伤害掷骰最小化 |
| `flags.midi-qol.min.damage.{attackType}` | 直接 | 特定攻击类型伤害最小化 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util*

---

### **伤害重掷**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.damage.reroll-kh` | 直接 | 重掷伤害骰，保留最高值 |
| `flags.midi-qol.damage.reroll-kl` | 直接 | 重掷伤害骰，保留最低值 |

---

### **伤害调整**

伤害调整现使用DND5e的 `system.traits.dm` 字段。

**重要：** 符号约定遵循**负值减少伤害**，正值增加伤害。

#### **按伤害类型**

减少特定类型的伤害（例如火焰、挥砍）

| **字段** | **模式** | **值** | **效果** |
|-|-|-|-|
| `system.traits.dm.amount.fire` | 加 | -5 | 减少火焰伤害 5 点 |
| `system.traits.dm.amount.slashing` | 加 | -10 | 减少挥砍伤害 10 点 |
| `system.traits.dm.amount.{damageType}` | 加 | -X | 减少 {damageType} 伤害 X 点 |

**伤害类型:** *强酸, 钝击, 冷冻, 火焰, 力场, 闪电, 黯蚀, 穿刺, 毒素, 心灵, 光耀, 挥砍, 雷鸣*

#### **按攻击/行动类型** 

根据造成伤害的方式减少伤害

| **字段** | **模式** | **值** | **效果** |
|-|-|-|-|
| `system.traits.dm.midi.all` | 加 | -5 | 减少所有伤害 5 点 |
| `system.traits.dm.midi.mwak` | 加 | -3 | 减少近战武器攻击伤害 3 点 |
| `system.traits.dm.midi.rwak` | 加 | -3 | 减少远程武器攻击伤害 3 点 |
| `system.traits.dm.midi.msak` | 加 | -3 | 减少近战法术攻击伤害 3 点 |
| `system.traits.dm.midi.rsak` | 加 | -3 | 减少远程法术攻击伤害 3 点 |
| `system.traits.dm.midi.spell` | 加 | -5 | 减少所有法术伤害 5 点 |
| `system.traits.dm.midi.heal` | 加 | -2 | 减少受到的治疗 2 点 |

**行动类型:** *mwak, rwak, msak, rsak, heal, other, save, util, abil, ench, summ*

#### **按伤害属性**

根据武器/法术属性减少伤害

| **字段** | **模式** | **值** | **效果** |
|-|-|-|-|
| `system.traits.dm.midi.non-magical` | 加 | -5 | 减少非魔法伤害 5 点 |
| `system.traits.dm.midi.non-magical-physical` | 加 | -5 | 减少非魔法物理伤害 5 点 |
| `system.traits.dm.midi.non-silver-physical` | 加 | -5 | 减少非镀银物理伤害 5 点 |
| `system.traits.dm.midi.non-adamant-physical` | 加 | -5 | 减少非精金物理伤害 5 点 |
| `system.traits.dm.midi.non-physical` | 加 | -5 | 减少非物理伤害 5 点 |
| `system.traits.dm.midi.non-spell` | 加 | -5 | 减少非法术伤害 5 点 |
| `system.traits.dm.midi.physical` | 加 | -5 | 减少物理伤害 5 点 |

#### **伤害调整示例**

**野蛮人狂暴（抵抗物理伤害）：**

```Plain Text
system.traits.dm.midi.non-magical-physical 加 -99
```

（使用抗性特质来代替伤害减半）

**重甲大师（减少非魔法物理伤害 3 点）：**

```Plain Text
system.traits.dm.midi.non-magical-physical 加 -3
```

**火焰护盾（减少冷冻伤害 5 点）：**

```Plain Text
system.traits.dm.amount.cold 加 -5
```

---

## **射程调整**

调整物品射程值。射程标志为**求值**（带有掷骰数据的表达式）。

### **标准射程**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.range.all` | 求值 | 修改所有物品的射程（使用加模式和表达式） |
| `flags.midi-qol.range.{attackType}` | 求值 | 修改特定攻击类型的射程 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util*

---

### **长距离射程**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.long.all` | 求值 | 修改所有物品的长距离射程 |
| `flags.midi-qol.long.{attackType}` | 求值 | 修改特定攻击类型的长距离射程 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util*

---

### **射程覆盖**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.rangeOverride.attack.all` | 求值 | 覆盖所有攻击的射程 |
| `flags.midi-qol.rangeOverride.attack.{attackType}` | 求值 | 覆盖特定攻击类型的射程 |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util*

---

### **射程示例**

将射程设置为 5

```Plain Text
flags.midi-qol.range.all 加 5 - item.range.value 
```

---

## **豁免调整**

### **反射闪避**

豁免成功不受伤害，豁免失败受一半伤害。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.superSaver.all` | 直接 | 豁免成功无伤害，豁免失败半伤（所有豁免） |
| `flags.midi-qol.superSaver.{ability}` | 直接 | 特定豁免检定的反射闪避 |

**属性:** *str, dex, con, int, wis, cha*

---

### **半反射闪避**

豁免成功不受伤害，豁免失败受正常伤害。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.semiSuperSaver.all` | 直接 | 豁免成功无伤害（所有豁免） |
| `flags.midi-qol.semiSuperSaver.{ability}` | 直接 | 特定豁免检定的半反射闪避 |

**属性:** *str, dex, con, int, wis, cha*

---

### **豁免加值**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.concentrationSaveBonus` | 求值 | 专注豁免加值  <br/>**映射到：** `system.attributes.concentration.bonuses.save` |
| `flags.midi-qol.deathSaveBonus` | 求值 | 死亡豁免加值  <br/>**映射到：**`system.attributes.death.bonuses.save` |
| `flags.midi-qol.save.fail.all` | 求值 | 任何豁免检定失败时应用的加值 |
| `flags.midi-qol.save.fail.{ability}` | 求值 | 特定豁免检定失败时应用的加值 |

**属性:** *str, dex, con, int, wis, cha*

---

## **可选加值效果**

**访问类型：** 混合 - 参见下表中每种标志类型

可选加值会在触发时提示玩家应用它们，用效果的名称替换`NAME`。

### **示例 - 幸运重掷**

要创建类似**幸运**的效果，允许重掷一次攻击骰并保留最高结果，请添加以下效果更改：

| **属性键** | **更改模式** | **效果值** |
|-|-|-|
| `flags.midi-qol.optional.lucky.label` | 自定义 | 幸运 - 重掷攻击 |
| `flags.midi-qol.optional.lucky.attack.all` | 自定义 | reroll-kh |
| `flags.midi-qol.optional.lucky.count` | 自定义 | 1 |

当角色进行攻击掷骰时，会提示他们使用`幸运 - 重掷攻击`。如果激活，攻击将被重掷并保留最高结果。`count` 为 1 意味着此效果在耗尽前只能使用一次。

---

### **配置**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.label` | 直接 | 增益的显示标签 |
| `flags.midi-qol.optional.NAME.count` | 特殊 | 剩余使用次数（参见下面的**计数格式**） |
| `flags.midi-qol.optional.NAME.countAlt` | 特殊 | 替代使用次数（参见下面的**计数格式**） |
| `flags.midi-qol.optional.NAME.activation` | 求值 | 增益的激活条件 |
| `flags.midi-qol.optional.NAME.force` | 求值 | 强制激活的条件 |
| `flags.midi-qol.optional.NAME.macroToCall` | 直接 | 要执行的宏 |

---

**计数格式选项：**

| **值** | **描述** |
|-|-|
| `3`（数字） | 固定使用次数，每次使用递减 |
| `each-turn` | 战斗中每回合重置 |
| `each-round` | 战斗中每轮重置 |
| `turn` | 仅在角色回合可用 |
| `reaction` | 与反应使用挂钩 |
| `bonusAction` | 与附赠动作使用挂钩 |
| `every` | 始终可用（无限） |
| `ItemUses.identifier.{itemIdentifier}` | 链接到物品的使用次数（例如 `ItemUses.identifier.bardic-inspiration`） |
| `ItemUses.partialNameMatch.{itemName}` | （例如 `ItemUses.Insp`） |
| `ItemUses.exactNameMatch.{itemName}` | （例如 `ItemUses.exactNameMatch.Bardic Inspiration`） |
| `ItemUses.{itemName}` | 仅向后兼容（例如 `ItemUses.Bardic Inspiration`） |
| `ActivityUses.identifier.{itemIdentifier}.{activityIdentifier}` | 链接到活动的使用次数（例如 `ActivityUses.identifier.bardic-inspiration.sing-song`） |
| `ActivityUses.id.{itemID}.{activityID}` | （例如 `ActivityUses.id.iLKpfoGF7rGpvNWD.NegUUOdFH35S3xNi`） |
| `ActivityUses.partialNameMatch.{itemName}.{activityName}` | （例如 `ActivityUses.partialNameMatch.Insp.Song`） |
| `ActivityUses.exactNameMatch.{itemName}.{activityName}` | （例如 `ActivityUses.exactNameMatch.Bardic Inspiration.Sing Song`） |
| `ActivityUses.{itemName}.{activityName}` | （例如 `ActivityUses.Bardic Inspiration.Sing Song`） |
| `@{path}` | 引用角色数据（例如 `@resources.primary.value`） |

---

**增益选项：**

为可选加值标志设置的值决定了应用增益时会发生什么：

| **值** | **描述** |
|-|-|
| `+1d4`, `2d6`, `+5` | 添加到掷骰的骰子表达式或数字 |
| `reroll` | 重掷整个掷骰 |
| `reroll-query` | 重掷并提示确认替换 |
| `reroll-kh` | 重掷，保留原骰和新骰中的最高值 |
| `reroll-kl` | 重掷，保留原骰和新骰中的最低值 |
| `reroll-max` | 使用最大骰值重掷 |
| `reroll-min` | 使用最小骰值重掷 |
| `reroll-withBonus {expr}` | 重掷并添加加值（例如 `reroll-withBonus 1d4`） |
| `replace {formula}` | 用新公式完全替换掷骰（例如 `replace 10 + @abilities.dex.mod`） |
| `success` | 强制掷骰成功（将结果设为 99） |
| `fail` | 强制掷骰失败（将结果设为 -1） |
| `critical` | 将掷骰视为重击（用于攻击，`见下面的注意事项`） |
| `ItemMacro` | 调用应用效果的那个物品的物品宏 |
| `ItemMacro.{name}` | 调用物品宏（例如 `ItemMacro.Lucky`） |
| `Macro.{name}` | 调用世界/合集宏 |
| `function.{name}` | 调用已注册函数 |

<callout emoji="❗">
**可选加值重击的注意事项**
除非启用了以下设置，否则 `critical` 值对检定、豁免或技能无效：
`设置 > MidiQOL > 工作流设置 > 规则选项卡`
（房规）大成功/大失败对豁免总是成功/失败
</callout>

---

#### **可选加值标志中的 ItemMacro**

当使用 `ItemMacro` 作为可选加值标志的值时（例如 `flags.midi-qol.optional.NAME.attack.all`），它会自动重写：

| **输入值** | **重写为** |
|-|-|
| `ItemMacro`（源是物品） | `ItemMacro.{originItemUuid}` |
| `ItemMacro`（源是 ActiveEffect） | `ItemMacro.{effectOriginUuid}` |
| `ItemMacro`（源包含 ActiveEffect） | `ItemMacro.{parentItemUuid}`（从路径中移除 ActiveEffect） |

这允许效果引用其源物品的宏，而无需硬编码 UUID。

**示例：**

- `flags.midi-qol.optional.lucky.attack.all ``自定义`` reroll-kh` - **幸运**专长重掷，保留最高值
- `flags.midi-qol.optional.bless.save.all ``自定义`` 1d4` - **祝福术**为豁免增加 1d4
- `flags.midi-qol.optional.shield.ac ``自定义`` +5` - **护盾术**增加 +5 AC

---

### **攻击加值**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.attack.all` | 求值 | 可选攻击加值（所有） |
| `flags.midi-qol.optional.NAME.attack.{attackType}` | 求值 | 可选攻击加值（特定类型） |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util*

---

### **攻击失败加值**

仅在攻击未命中时提示。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.attack.fail.all` | 求值 | 未命中时的可选加值（所有） |
| `flags.midi-qol.optional.NAME.attack.fail.{attackType}` | 求值 | 未命中时的可选加值（特定类型） |

**攻击类型:** *mwak, rwak, msak, rsak*

---

### **豁免加值**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.save.all` | 求值 | 可选豁免加值（所有） |
| `flags.midi-qol.optional.NAME.save.{ability}` | 求值 | 可选豁免加值（特定属性） |

**属性:** *str, dex, con, int, wis, cha*

---

### **豁免失败加值**

仅在豁免失败时提示。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.save.fail.all` | 求值 | 豁免失败时的可选加值（所有） |
| `flags.midi-qol.optional.NAME.save.fail.{ability}` | 求值 | 豁免失败时的可选加值（特定属性） |

**属性:** *str, dex, con, int, wis, cha*

---

### **属性检定加值**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.check.all` | 求值 | 可选属性检定加值（所有） |
| `flags.midi-qol.optional.NAME.check.{ability}` | 求值 | 可选属性检定加值（特定属性） |

**属性:** *str, dex, con, int, wis, cha*

---

### **属性检定失败加值**

仅在属性检定失败时提示。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.check.fail.all` | 求值 | 属性检定失败时的可选加值（所有） |
| `flags.midi-qol.optional.NAME.check.fail.{ability}` | 求值 | 属性检定失败时的可选加值（特定属性） |

**属性:** *str, dex, con, int, wis, cha*

---

### **技能加值**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.skill.all` | 求值 | 可选技能检定加值（所有） |
| `flags.midi-qol.optional.NAME.skill.{skill}` | 求值 | 可选技能检定加值（特定技能） |
| `flags.midi-qol.optional.NAME.skill.fail.all` | 求值 | 技能检定失败时的可选加值（所有） |

**技能:** *acr, ani, arc, ath, dec, his, ins, inv, itm, med, nat, prc, per, prf, rel, slt, ste, sur*

---

### **伤害加值**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.damage.all` | 求值 | 可选伤害加值（所有） |
| `flags.midi-qol.optional.NAME.damage.{attackType}` | 求值 | 可选伤害加值（特定类型） |

**攻击类型:** *mwak, rwak, msak, rsak, heal, other, save, util*

---

### **其他可选**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.optional.NAME.ac` | 求值 | 可选 AC 加值（反应） |
| `flags.midi-qol.optional.NAME.criticalDamage` | 求值 | 可选加值伤害可以重击 |
| `flags.midi-qol.optional.NAME.displayBonusRolls` | 直接 | 覆盖此增益的显示设置（true/false） |
| `flags.midi-qol.optional.NAME.rollMode` | 直接 | 此增益的掷骰模式（公开掷骰, 暗骰, 盲骰, 自骰） |

---

## **特殊标志**

### **战斗特性**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.ignoreNearbyFoes` | 求值 | 忽略附近敌人对远程攻击施加的劣势 |
| `flags.midi-qol.sharpShooter` | 求值 | 攻击最大射程内的敌人时，远程武器攻击检定不会因为超过常规射程承受劣势  <br/>**映射到：** `flags.dnd5e.sharpShooter` |
| `flags.midi-qol.uncanny-dodge` | 求值 | 减半受到的伤害 |
| `flags.midi-qol.potentCantrip` | 求值 | 戏法在豁免成功时仍会造成一半伤害 |
| `flags.midi-qol.neverTarget` | 求值 | token不能被选择为目标 |
| `flags.midi-qol.inMotion` | 求值 | token正在移动 |
| `flags.midi-qol.canFlank` | 求值 | token可以参与夹击 |
| `flags.midi-qol.fail.disadvantage.heavy` | 求值 | 重型武器攻击劣势，参见14/24 phb中关于重型武器的描述部分 |

---

### **施法特性**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.sculptSpells` | 直接 | 豁免法术的预选目标自动成功并获得**反射闪避**状态 |
| `flags.midi-qol.carefulSpells` | 直接 | 豁免法术的预选目标自动成功 |

---

### **OverTime效果**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.OverTime` | 直接 | 配置在回合开始/结束时触发的效果（字符串格式） |

关于 OverTime 的语法和参数，请参见 <cite doc-id="U6eAwHEiPiOkOBkq2gBcFdI0nSe" file-type="wiki" title="Overtime使用说明（v13.0.36及之前）" type="doc"></cite>或者<cite doc-id="VsctwBD3JiMG5BkoUrjcRLytn5g" file-type="wiki" title="Overtime使用说明" type="doc"></cite>。

---

## **动作追踪**

追踪动作资源使用情况。所有动作追踪标志均为**直接**（布尔值/数值/字符串值）。

### **反应追踪**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.actions.reaction` | 直接 | 反应已使用（true/false） |
| `flags.midi-qol.actions.reactionsUsed` | 直接 | 已使用的反应次数 |
| `flags.midi-qol.actions.reactionCombatRound` | 直接 | 使用反应的战斗轮次 |
| `flags.midi-qol.actions.reactionsReset` | 直接 | 反应重置时间（`never`以防止重置） |
| `flags.midi-qol.actions.reactions.max` | 直接 | 反应的最大次数，注意角色默认不定义此flags，因此`+1`不会使反应最大次数变为`2`，你需要填写`+2` |

---

### **附赠动作追踪**

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.actions.bonus` | 直接 | 附赠动作已使用（true/false） |
| `flags.midi-qol.actions.bonusActionsUsed` | 直接 | 已使用的附赠动作次数 |
| `flags.midi-qol.actions.bonusActionCombatRound` | 直接 | 使用附赠动作的战斗轮次 |
| `flags.midi-qol.actions.bonusActionsReset` | 直接 | 附赠动作重置时间（`never`以防止重置） |
| `flags.midi-qol.actions.bonusActions.max` | 直接 | 反应的最大次数，注意角色默认不定义此flags，因此`+1`不会使反应最大次数变为`2`，你需要填写`+2` |

---

## **物品标志**

可以在物品上设置的标志。所有物品标志均为**直接**（字符串/布尔值）。

| **标志** | **访问** | **描述** |
|-|-|-|
| `flags.midi-qol.onUseMacroName` | 直接 | OnUse宏配置 |
| `flags.midi-qol.syntheticItem` | 直接 | 将物品标记为合成的（程序创建） |

---

## **原生DND5e替代项**

一些 midi-qol 标志有原生DND5e等效项。两种方法都有效，但能力不同。

### **死亡豁免字段**

| **原生DND5e字段** | **值** | **描述** |
|-|-|-|
| `system.attributes.death.bonuses.save` | string | 加值公式（例如`+2`, `@abilities.wis.mod`） |
| `system.attributes.death.roll.mode` | number | 1 = 优势, -1 = 劣势, 0 = 正常 |
| `system.attributes.death.roll.min` | number | 骰子最小结果（例如 10 表示不会掷出低于 10） |
| `system.attributes.death.roll.max` | number | 骰子最大结果 |

**与 midi-qol 标志的比较：**

| **特性** | **Midi-qol 标志** | **原生DND5e字段** |
|-|-|-|
| 条件求值 | 是 - 支持 `[条件]` 语法 | 否 - 始终应用 |
| 与其他效果叠加 | 是 - 与其他标志一同求值 | 是 - 由DND5e处理 |
| 优势 + 劣势 | 单独的标志，可以抵消 | 单一的 `roll.mode` 值 |
| 通过效果设置 | 是 | 是 |
| 最小/最大骰子结果 | 否 | 是 (`roll.min`, `roll.max`) |

**何时使用：**

- 使用 **midi-qol 标志**：当你需要条件逻辑时（例如，狂暴时死亡豁免获得优势）
- 使用 **原生DND5e字段**：用于简单、始终生效的加值，或当你需要控制骰子最小/最大值时
- 两者可以一起使用 - 它们会叠加

**示例 - 原生DND5e效果：**

```Plain Text
键: system.attributes.death.bonuses.save
模式: 加
值: +2
```

**示例 - Midi-qol 条件（需要条件）：**

```Plain Text
键: flags.midi-qol.advantage.deathSave
模式: 自定义
值: 1[isRaging]
```

---

## **已弃用标志**

这些标志已弃用，不应使用。请使用指示的替代项。

## **吸收**

\> **已弃用：** 这些标志已映射到`system.traits.da.*`字段。

受到特定类型的伤害将转化为治疗。

| **标志** | **访问** | **映射到** |
|-|-|-|
| `flags.midi-qol.absorption.all` | 直接 | `system.traits.da.midi.all` |
| `flags.midi-qol.absorption.{damageType}` | 直接 | `system.traits.da.{damageType}` |

**伤害类型:** *强酸, 钝击, 冷冻, 火焰, 力场, 闪电, 黯蚀, 穿刺, 毒素, 心灵, 光耀, 挥砍, 雷鸣 等。*

---

### **伤害减免 (DR)**

所有 `flags.midi-qol.DR.*` 标志已弃用。请改用`system.traits.dm.*`字段。

**重要：符号变更！** 旧标志使用**正值**减少伤害。新的`system.traits.dm`字段使用 **负值** 减少伤害（遵循DND5e规则）。

| **已弃用标志** | **映射到** | **迁移示例** |
|-|-|-|
| `flags.midi-qol.DR.all` | `system.traits.dm.midi.all` | 5 → -5 |
| `flags.midi-qol.DR.{damageType}` | `system.traits.dm.amount.{damageType}` | 5 → -5 |
| `flags.midi-qol.DR.{attackType}` | `system.traits.dm.midi.{attackType}` | 5 → -5 |
| `flags.midi-qol.DR.non-magical` | `system.traits.dm.midi.non-magical` | 5 → -5 |
| `flags.midi-qol.DR.non-magical-physical` | `system.traits.dm.midi.non-magical-physical` | 5 → -5 |
| `flags.midi-qol.DR.non-silver` | `system.traits.dm.midi.non-silver-physical` | 5 → -5 |
| `flags.midi-qol.DR.non-adamant` | `system.traits.dm.midi.non-adamant-physical` | 5 → -5 |
| `flags.midi-qol.DR.non-physical` | `system.traits.dm.midi.non-physical` | 5 → -5 |
| `flags.midi-qol.DR.non-spell` | `system.traits.dm.midi.non-spell` | 5 → -5 |
| `flags.midi-qol.DR.spell` | `system.traits.dm.midi.spell` | 5 → -5 |

**攻击类型:** *mwak, rwak, msak, rsak.*

---

### **对抗无法重击标志**

| **已弃用标志** | **访问** | **映射到** |
|-|-|-|
| `flags.midi-qol.fail.critical.all` | 求值 | `flags.midi-qol.grants.noCritical.all` |
| `flags.midi-qol.fail.critical.{attackType}` | 求值 | `flags.midi-qol.grants.noCritical.{attackType}` |

**攻击类型:** *mwak, rwak, msak, rsak*

---

### **对抗无法获得优势/劣势标志**

这些标志已重命名为更清晰的等效项。

| **已弃用标志** | **访问** | **映射到** |
|-|-|-|
| `flags.midi-qol.grants.fail.advantage.attack.all` | 求值 | `flags.midi-qol.grants.noAdvantage.attack.all` |
| `flags.midi-qol.grants.fail.advantage.attack.{type}` | 求值 | `flags.midi-qol.grants.noAdvantage.attack.{type}` |
| `flags.midi-qol.grants.fail.disadvantage.attack.all` | 求值 | `flags.midi-qol.grants.noDisadvantage.attack.all` |
| `flags.midi-qol.grants.fail.disadvantage.attack.{type}` | 求值 | `flags.midi-qol.grants.noDisadvantage.attack.{type}` |

**类型:** *mwak, rwak, msak, rsak, save, check, skill, tool.*

---

### **优势/劣势属性豁免/检定标志**

以下标志为了一致性已重命名。自 v13.0.38 起，路径中包含 `ability` 的旧标志已弃用，并将在 v14 中移除。

| **已弃用标志** | **映射到** |
|-|-|
| `flags.midi-qol.advantage.ability.save.all` | `flags.midi-qol.advantage.save.all` |
| `flags.midi-qol.advantage.ability.save.{ability}` | `flags.midi-qol.advantage.save.{ability}` |
| `flags.midi-qol.advantage.ability.check.all` | `flags.midi-qol.advantage.check.all` |
| `flags.midi-qol.advantage.ability.check.{ability}` | `flags.midi-qol.advantage.check.{ability}` |
| `flags.midi-qol.disadvantage.ability.save.all` | `flags.midi-qol.disadvantage.save.all` |
| `flags.midi-qol.disadvantage.ability.save.{ability}` | `flags.midi-qol.disadvantage.save.{ability}` |
| `flags.midi-qol.disadvantage.ability.check.all` | `flags.midi-qol.disadvantage.check.all` |
| `flags.midi-qol.disadvantage.ability.check.{ability}` | `flags.midi-qol.disadvantage.check.{ability}` |

**属性：***str, dex, con, int, wis, cha*

> 已弃用的标志将通过字段映射和代码级支持继续工作，但会在控制台中生成弃用警告。请更新你的 Active Effects 以使用新的标志名称。

---

### **其他已弃用**

| **已弃用标志** | **访问** | **映射到** |
|-|-|-|
| `flags.midi-qol.sharpShooter` | 求值 | `flags.dnd5e.sharpShooter` |