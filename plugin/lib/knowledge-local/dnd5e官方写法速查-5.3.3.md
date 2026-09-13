# dnd5e 官方写法速查（5.3.3 / Foundry V13）

> **版本声明（重要）**
> 本文全部内容取自 **dnd5e 官方 wiki**，并已对齐到 **你正在用的版本世代**。
>
> | 项 | 值 |
> |---|---|
> | 目标环境 | Foundry VTT **13.351** + dnd5e **5.3.3** |
> | 文档来源 | `github.com/foundryvtt/dnd5e/wiki`（官方 wiki，git 仓库 `dnd5e.wiki.git`） |
> | 对齐 commit | **`009ff4f`（2026-03-31）** —— 6.0.0 大改之前的最后一版，页头标注 "Up to date as of **5.3.0**" |
> | 6.0.0 对比 | commit `17bd5d3`（2026-09-10），页头标注 "Up to date as of 6.0.0" |
> | 5.3.3 发布时间 | 2026-05-07（5.3.x 是 V13 世代最后一支；**6.0.0 只支持 Foundry v14+**） |
>
> **本机留档**：
> - 5.3.x 版 wiki（44 个 md）：`99_临时草稿\dnd5e-wiki\md-53x\`
> - 6.0.0 版 wiki（27 个 md）：`99_临时草稿\dnd5e-wiki\md\`
> - wiki git 仓库：`99_临时草稿\dnd5e-wiki-git\`
>
> 查不到出处的条目一律标注「未验证」，不臆造。

---

## 目录

1. [Enrichers · 描述里怎么自动取值](#一enrichers--描述里怎么自动取值)
2. [Roll Formulas · 豁免 / 熟练 / 属性引用](#二roll-formulas--豁免--熟练--属性引用)
3. [Activities · 活动体系](#三activities--活动体系)
4. [各活动类型专属字段](#四各活动类型专属字段)
5. [**Active Effects · 让被动特性真正生效**](#五active-effects--让被动特性真正生效)
6. [System HTML · 描述里的官方样式类](#六system-html--描述里的官方样式类)
7. [5.3.x 与 6.0.0 差异（避坑表）](#七53x-与-600-差异避坑表)
8. [实测记录与已知陷阱](#八实测记录与已知陷阱)

---

## 一、Enrichers · 描述里怎么自动取值

Enricher 写在**物品描述或传记的富文本**里，由 dnd5e 在渲染时替换成实际值。
5.3.x 支持 8 类：**Attack / Award / Check / Damage·Heal / Item / Lookup / Reference / Save**
（6.0.0 才多出 Language）。

### 1.1 Attack —— 攻击检定

| 写法 | 结果 |
|---|---|
| `[[/attack]]` | **无参 → 自动取本物品上的第一个 attack 活动**，并随宿主属性调整 |
| `[[/attack +5]]` / `[[/attack formula=5]]` | 固定 +5 命中 |
| `[[/attack 5 thrown]]` / `[[/attack formula=5 attackMode=thrown]]` | 指定攻击模式 |
| `[[/attack activity=<16位ID>]]` | 指定具体活动 |
| `[[/attack extended]]` | 展开成完整怪卡句式（`"Melee Weapon Attack: [+16] to hit, reach 15 ft, one target"`） |

官方原句：*"it can fetch data automatically from the item's attack activity and will be adjusted with the stats of the creature to which the item is added."* —— **这就是「部件挂到任何怪身上都自动算对加值」的机制。**

**选项表**：`activity`(ID) / `attackMode`(Choice) / `format`(Choice: short·long·extended) / `formula`(Formula) / `rules`(Choice: 2014·2024，只影响 extended 的呈现)

**报错条件**：既没 formula 又没 attack 活动 / 同时指定 formula 与 activity / 命中公式非法

### 1.2 Check —— 属性·技能·工具检定

| 写法 | 结果 |
|---|---|
| `[[/check dex]]` | `[Dexterity]` |
| `[[/check dex format=long]]` | `[Dexterity check]` |
| `[[/check dex 15]]` / `[[/check ability=dexterity dc=15]]` | `[DC 15 Dexterity]` |
| `[[/check ability=acr/ath]]` / `[[/check acr ath]]` | 多技能 |
| **`[[/check dex dc=@abilities.con.dc]]`** | **DC 用公式（取宿主的体质 DC）** |
| `[[/check activity=<16位ID>]]` / `[[/check]]` | 从 check 活动取值 |
| `[[/skill perception 15 passive format=long]]` | 被动句式 |

- `[[/check]]`、`[[/skill]]`、`[[/tool]]` **三个起始词可以互换**。
- 工具+技能组合（现代规则）：两者都熟练 → 优势。
- **选项**：`ability` / `activity` / `dc`(Formula) / `format` / `rules` / `skill` / `tool`

### 1.3 Damage / Heal —— 伤害与治疗

| 写法 | 结果 |
|---|---|
| `[[/damage 2d6 fire]]` | 掷 2d6 火焰 |
| **`[[/damage average]]`** | **无参 → 取本物品活动的伤害，并显示均值** |
| `[[/damage 2d6 fire average]]` | 带均值 |
| `[[/heal 2d4 + 2]]` | 治疗 |

**选项**：`activity` / `attackMode` / `average`(Boolean) / `format` / `formula`(Formula) / `rules` / `type`(Choice)
**注意**：Damage/Heal 的选项表多一列 **Global**（`activity` / `attackMode` / `average` / `format` 可作全局选项）。

> ⚠️ **实测陷阱**：`[[/damage average]]` 渲染时**自带伤害类型名**。描述里再写「点挥砍伤害」会变成重复——写「造成 … 伤害」即可。

### 1.4 Lookup —— 把宿主数据写进描述

| 写法 | 结果 |
|---|---|
| **`[[lookup @name]]`** | 宿主 actor 的名字 |
| `[[lookup @name]]{the creature}` | 带**回退文本**（取不到时显示 `the creature`） |
| `[[lookup @name lowercase\|uppercase\|capitalize]]` | 大小写变换 |
| **`[[lookup @save.dc.value activity=<ID>]]`** | **把活动算好的 DC 显示出来** |
| `[[lookup @labels.description.affects activity=<ID>]]` | 目标描述，如 `each creature` |
| `[[lookup @labels.description.template activity=<ID>]]` | 模板，如 `20-foot Sphere` |
| `[[lookup @labels.description.range activity=<ID>]]` | 射程，如 `120 feet` |

**官方完整实例**（照抄即可得到自动同步的描述句）：

```
DC [[lookup @save.dc.value activity=<ID>]], [[lookup @labels.description.affects activity=<ID>]] in a [[lookup @labels.description.template activity=<ID>]] centered on a point within [[lookup @labels.description.range activity=<ID>]].
```

→ 渲染结果：`DC 14, each creature in a 10-foot-radius Sphere centered on a point within 30 feet.`

**选项**：`activity`(ID) / `path`(@-Path) / `style`(Choice)
`path` 取不到值时，**显示原路径**，除非用 `{回退}`。

### 1.5 Save —— 豁免

| 写法 | 结果 |
|---|---|
| `[[/save dex]]` | `[Dexterity]` |
| `[[/save dex format=long]]` | `[Dexterity saving throw]` |
| `[[/save dex 15]]` / `[[/save ability=dexterity dc=15]]` | `[DC 15 Dexterity]` |
| `[[/save ability=str/dex dc=20]]` / `[[/save strength dexterity 20]]` | 多属性豁免 |
| **`[[/save dex dc=@abilities.con.dc]]`** | **DC 用公式** |
| `[[/save activity=<ID>]]` / `[[/save]]` | 从 save 活动取值 |
| **`[[/concentration dc=15]]`** / `[[/concentration]]` / `[[/concentration ability=cha]]` | **专注豁免**（专用 enricher，wiki 5.3.x 明确列出） |

**选项**：`ability` / `activity` / `dc`(Formula) / `format`(short·long)

> **`dc` 的官方约束原文**：*"Specific number or formula used for the DC. **Formula must not contain dice values.** Can only be used inferred with a number, formulas must contains the `dc=` prefix"*
> ⇒ **DC 公式里不能有骰子**；纯数字可省略 `dc=`，带公式必须写 `dc=`。

### 1.6 Reference —— 规则引用

| 写法 | 结果 |
|---|---|
| `&Reference[condition=prone]` / `&Reference[Prone]` / `&Reference[prone]` | 成链接 + 悬浮说明 |
| `&Reference[blinded apply=false]` | 不带「施加」按钮 |
| `&Reference[rule="Difficult Terrain"]` / `&Reference[Difficult Terrain]` | 引用其他规则 |

**选项**：`apply`(Boolean) / Varies(Choice)

### 1.7 Item —— 使用物品

见 wiki `Enrichers.md` 的 "Item Use Enrichers" 段（第 347 行起）。

---

## 二、Roll Formulas · 豁免 / 熟练 / 属性引用

> 官方自检方法（wiki 原句）：选中 token 后开 F12，粘贴
> `console.log(canvas.tokens.controlled[0].actor.getRollData());`
> 或装 "Autocomplete Inline Properties" 模块，或右键 actor → Export Data。

### 2.1 熟练加值（你最关心的部分）

| 公式 | 含义 |
|---|---|
| `@prof` | Actor 的熟练加值 |
| `@prof.term` | 视系统设置，可能是固定值或骰子 |
| **`@prof.flat`** | **固定值（无视设置）** |
| `@prof.dice` | 骰子形式（无视设置） |
| `@prof.multiplier` | 情境倍率：**0 / 0.5 / 1 / 2** |
| `@attributes.prof` | 基础数值熟练加值（不反映熟练骰等选项） |

### 2.2 属性

`@abilities.str|dex|con|int|wis|cha` 三字母代码，可加后缀：

| 后缀 | 含义 |
|---|---|
| `.value` | 属性值 |
| `.mod` | 属性调整值 |
| **`.dc`** | **基于该属性的特性 DC，等于 `8 + prof + modifier`** |
| `.checkBonus` | 属性检定的固定加值 |
| `.checkProf` | 属性检定的熟练详情 |
| **`.save.value`** | **豁免固定加值（不含骰子加值）** |
| `.saveBonus` | 豁免额外固定加值 |
| `.saveProf` | 豁免熟练详情 |

### 2.3 技能

`@skills.acr|ani|arc|ath|dec|his|ins|itm|inv|med|nat|prc|prf|per|rel|slt|ste|sur`

| 后缀 | 含义 |
|---|---|
| `.mod` | 默认属性调整值 |
| `.prof` | 技能熟练详情 |
| `.bonus` | 技能检定固定加值 |
| `.total` | 技能检定总调整值（不含骰子） |
| `.passive` | 被动值 = `10 + total + bonuses.passive` |

### 2.4 法术与施法

| 公式 | 含义 |
|---|---|
| `@attributes.spell.dc` | 法术豁免 DC |
| `@attributes.spell.mod` | 施法属性调整值 |
| `@attributes.spell.attack` | 法术攻击加值 |
| `@attributes.spell.abilityLabel` | 施法属性本地化名 |
| `@spells.spell1/.spell2/.../.pact` | 法术位（`.value` / `.max` / `.override` / `.level` / `.label`） |

### 2.5 其他常用属性

| 公式 | 含义 |
|---|---|
| `@attributes.ac.value` | 最终 AC |
| `@attributes.ac.flat` | **5.3.x 定义**：若 AC 计算方式为 `flat` 则它就是最终值；`natural` 方式下作 `base` |
| `@attributes.hp.value` / `.max` / `.temp` / `.tempmax` / `.pct` | 生命值 |
| `@attributes.hd.value` / `.max` / `.largest` / `.bySize.d6` | 生命骰 |
| `@attributes.init.mod` / `.prof` / `.total` | 先攻 |
| `@attributes.movement.walk` / `.fly` / `.swim` / `.climb` / `.burrow` | **5.3.x 移速路径** |
| `@attributes.senses.darkvision` / `.blindsight` / `.tremorsense` / `.truesight` | **5.3.x 感官路径** |
| `@attributes.exhaustion` | 力竭等级 0–6 |
| `@attributes.concentration.limit` / `.save` | 专注上限 / 专注豁免总加值 |
| `@attributes.death.success` / `.failure` | 死亡豁免 |
| `@details.cr` / `.level` / `.tier` / `.xp.value` | CR / 等级 / 层级 / XP |
| `@classes.<identifier>.levels` / `.hd.denomination` / `.tier` | 职业 |
| `@scale.<父项id>.<量表id>` | 量表值（`.number` / `.die` / `.faces`） |
| `@flags.*` | 任意自定义对象 |
| `@statuses.<状态id>` | 有该状态返回 `1`，否则无 |
| `@statuses.concentrating` / `.exhaustion` | 专注数 / 力竭层数 |

### 2.6 ★ 物品上的额外公式（写部件必须懂）

物品的 roll data 是 **actor roll data 的扩展**，额外多了 `@activity` / `@mod` / `@scaling` / `@item`：

| 公式 | 官方含义 |
|---|---|
| **`@mod`** | **当前影响该活动使用的属性调整值** |
| `@scaling` | 当前缩放值（3 环法术按 3 环放 = `1`） |
| `@scaling.increase` | 超出基准的缩放步数 |
| `@consumed.hd` | 消耗的生命骰公式 |
| `@item.uses.value` / `.max` | 物品有限使用次数 |
| `@item.level` / `.levels` | 法术环阶 / 职业等级 |
| `@labels.activation` | `"Action"` |
| `@labels.description.affects` / `.range` / `.template` / `.templateSize` / `.templateType` | 目标/射程/模板描述 |
| `@labels.school` | `"Transmutation"` |

> **`@mod` 是部件库的关键** —— 说明官方设计上「部件写公式、挂到宿主自动取宿主的属性」。

### 2.7 特殊骰子修饰符

- **`adv` / `dis`**：优势/劣势。比 `2dXkh` 更好之处是**正确处理更大骰池**（`3d6adv` = 掷两次 3d6 取总和高者）。
- 可带数字：**`1d20adv2` = 掷 3d20 取高**（等同 `3d20kh`，精灵 Accuracy 用）。

---

## 三、Activities · 活动体系

> 官方定位：*"The activities system is a new method for adding things that can be done by an item. It replaces the older method of defining a single action for an item with a much more flexible system."*

### 3.1 活动类型（⚠️ 5.3.x 只有 11 种）

| 类型 | 作用 |
|---|---|
| **Attack** | 做攻击检定并掷伤害 |
| **Cast** | 通过物品施放法术 |
| **Check** | 进行属性检定 |
| **Damage** | 无需检定的直接伤害 |
| **Enchant** | 给物品施加附魔 |
| **Forward** | 以不同消耗/缩放触发另一个活动 |
| **Heal** | 治疗 |
| **Save** | 要求豁免并掷伤害 |
| **Summon** | 召唤生物到场景 |
| **Transform** | 用另一个 actor 的数据改变本 actor |
| **Utility** | 掷任意公式，或仅表示「发生了某事」 |

> **6.0.0 新增第 12 种 Teleport —— 5.3.x 没有，不要写。**

### 3.2 三个标签页

**Identity（身份）**
- `Name`：活动名；留空则用类型名
- `Icon`：图标
- `Chat Flavor`：聊天卡上的补充文字
- `Description`：活动描述（**聊天卡优先显示活动描述，而非物品描述**）
- **`Measured Template Prompt`**：定义了范围效果时，是否默认弹出模板放置；不勾也能从聊天卡按钮放
- 可见性开关：`Require Attunement` / `Require Magic` / `Require Identification` / `Level Limit` / `Class Identifier`

**Activation（激活）** —— 三个子标签
- **Time**：激活耗时与条件；Duration 决定活动持续多久
  - 官方原句（5.3.x）：*"When applying an active effect from the activity, the duration and expiry event here will be used for the effect unless the effect already has a duration specified."*
- **Consumption**：消耗目标列表（消耗什么、多少、怎么缩放）
  - `Consumption Scaling`：是否允许缩放（法术不显示，环阶决定缩放）
  - **`Usage` / `Recovery`：活动自己的有限使用池**
    - 官方原句：*"Unlike uses defined on an item, which are accessible to any activity on the item as well as any other item on the same actor, these uses are only consumable from this activity. In order to use these uses, a consumption target with the type **"Activity Uses"** must be set up."*
- **Targeting**：Range / Targets / Area

**Effect（效果）**
- **Applied Effects**：物品上的 ActiveEffect 里，哪些可在聊天卡上施加给目标
- 每个效果的 `Additional Settings` 里有等级限制

> **6.0.0 才有的 `Area of Effect Behaviors`（配合 Region）在 5.3.x 不存在。**

---

## 四、各活动类型专属字段

### 4.1 Attack（Effect 标签页）

**Attack Details**
| 字段 | 含义 |
|---|---|
| `Attack Ability` | 用来攻击的属性，**并作为 `@mod` 用在伤害公式里** |
| `To Hit Bonus` | 命中检定额外加值 |
| **`Flat To Hit`** | **只用 `To Hit Bonus`，不加攻击者的熟练与属性调整值** |
| `Critical Threshold` | 暴击阈值（攻击骰最小多少算重击） |

**Attack Damage**
| 字段 | 含义 |
|---|---|
| `Include Base Damage` | 武器/弹药专有，是否把物品自带伤害算进来 |
| `Extra Critical Damage` | 暴击时加到第一段伤害上的额外公式（**这段不翻倍**） |

**Identity 上的两项**：`Attack Type`（melee/ranged）、`Attack Classification`（weapon/spell/unarmed）—— 影响从 actor 应用到攻击/伤害掷骰上的加值。

### 4.2 Save（Effect 标签页）

| 字段 | 含义 |
|---|---|
| `Challenge Ability`（5.3.x 单数） | 要求用哪个属性豁免 |
| **`DC Calculation`** | **三选一：属性默认 DC / 相关施法 DC / 自定义公式** |
| **`DC Formula`** | **自定义公式填这里** |
| `Damage on Save` | 豁免成功时伤害如何处理的说明文字 |

> ⚠️ **6.0.0 才加的 `Save Bonus`（豁免额外加值公式）在 5.3.x 不存在。**

### 4.3 Check（Effect 标签页）

| 字段 | 含义 |
|---|---|
| `Associated Skills or Tools` | 一个或多个技能/工具；留空则做单次属性检定 |
| `Check Ability` | 检定属性（设了技能/工具则覆盖其默认属性） |
| `Check Bonus` | 检定额外加值公式 |
| `DC Calculation` / `DC Formula` | 同 Save |

### 4.4 Utility（Effect 标签页）

| 字段 | 含义 |
|---|---|
| `Roll Label` | 按钮标签（替默认 "Roll"） |
| `Roll Formula` | 活动投掷公式 |
| Identity 上还有 | `Roll Prompt`（是否弹投掷对话框）、`Visible to All` |

---

## 五、Active Effects · 让被动特性真正生效

> **为什么单列这一节**：一个只有描述、没有活动的特性（例如「魔法抗性」）挂到怪身上**只是一段文字**，不会自动带来豁免优势。要真生效必须配 **ActiveEffect + changes**。
>
> 本节出自 5.3.x 的 `Active-Effect-Guide.md`（858 行）。原文档标题：*"This document only covers Active Effects available to the Core dnd5e System."*

### 5.1 通用规则

**图例（官方 Legend）**
- `[number]`：替换成一个数字。允许用 roll data，但**结果必须是数字（不许有骰子）**。
- `[formula]`：可以填任意骰子公式（例如祝福术的 Effect Value 是 `1d4`）。**这类字段总是允许 roll data。**

**官方重要提醒（原文）**：
> *"When using formulas in an Active Effect Value, the actor sheet display that corresponds to the changed value will not always display the evaluated formula, but it will be applied when rolled."*

⇒ **公式写的加值，怪卡上可能看不到，但掷骰时确实生效** —— 别因为「卡上没显示」就以为没效果。

**Change Mode（变更模式）全表**

| 模式 | 说明 |
|---|---|
| `Add` | 加值（`-1` 即减）。**对集合类也可用**：`mgc` 加魔法属性、`-mgc` 移除 |
| `Subtract` | 减（**V14 或更高才可用** —— 你是 V13，别用） |
| `Multiply` | 乘 |
| `Override` | 覆盖。对文本可用 `{}` 保留原值：把「胸甲」覆盖成 `Arcane Propulsive {}` → `Arcane Propulsive 胸甲` |
| `Downgrade` | 仅当现值**大于**给定时才降低 |
| `Upgrade` | 仅当现值**小于**给定时才提升（如山丘巨人之力手套） |
| `Custom` | 由系统/模块定义逻辑；**dnd5e 本身不用** |

### 5.2 完整配方表（官方 46 条全录）

> 列含义：**Attribute Key** / **Change Mode** / **Effect Value** / **Roll Data?**（该项能否用 `@` 公式）
> `[abbreviation]`、`[movementType]`、`[senseType]`、`[damageType]`、`[conditionType]`、`[creatureType]` 均为占位符。

**属性与豁免**

| Attribute Key | Mode | Value | Roll Data |
|---|---|---|---|
| `system.abilities.[abbr].value` | Override | `[number]` | No |
| `system.abilities.[abbr].value` | Upgrade | `[number]` | No |
| `system.abilities.[abbr].bonuses.save` | Add | `[formula]` | Yes |
| `system.abilities.[abbr].bonuses.check` | Add | `[formula]` | Yes |
| **`system.abilities.[abbr].save.roll.mode`** | Add | `1` | No |
| `system.bonuses.abilities.check` | Add | `[formula]` | Yes |
| `system.bonuses.abilities.save` | Add | `[formula]` | Yes |
| `system.attributes.init.bonus` | Add | `[formula]` | Yes |
| `system.attributes.concentration.bonuses.save` | Add | `[formula]` | Yes |
| `system.attributes.concentration.limit` | Override | `[number]` | No |

**技能与工具**

| Attribute Key | Mode | Value | Roll Data |
|---|---|---|---|
| `system.skills.[abbr].bonuses.check` | Add | `[formula]` | Yes |
| `system.skills.[abbr].bonuses.passive` | Add | `[number]` | No |
| `system.skills.[abbr].roll.mode` | Add | `1` | No |
| `system.skills.[abbr].value` | Upgrade | `[number]` | No |
| `system.bonuses.abilities.skill` | Add | `[formula]` | Yes |
| `system.tools.[abbr].bonuses.check` | Add | `[formula]` | Yes |
| `system.tools.[abbr].value` | Upgrade | `[number]` | No |

**移动与感官**

| Attribute Key | Mode | Value | Roll Data |
|---|---|---|---|
| `system.attributes.movement.[movementType]` | Multiply | `[formula]` | Yes |
| `system.attributes.movement.[movementType]` | Upgrade | `[formula]` | Yes |
| `system.attributes.movement.bonus` | Add | `[formula]` | Yes |
| `system.attributes.movement.ignoredDifficultTerrain` | Add | `[difficultTerrainTypes]` | No |
| `system.attributes.senses.ranges.[senseType]` | Upgrade | `[number]` | No |
| `system.attributes.senses.ranges.[senseType]` | Override | `[number]` | No |

**防御（AC / HP / 法术 DC）**

| Attribute Key | Mode | Value | Roll Data |
|---|---|---|---|
| `system.attributes.ac.bonus` | Add | `[number]` | Yes |
| `system.attributes.ac.calc` | Override | `custom` | — |
| `system.attributes.ac.formula` | Override | `12 + @abilities.int.mod` | — |
| `system.bonuses.spell.dc` | Add | `[number]` | Yes |
| `system.attributes.hp.tempmax` | Add | `[number]` | No |
| `system.attributes.hp.bonuses.overall` | Add | `[number]` | Yes |
| `system.attributes.hp.bonuses.level` | Add | `[number]` | Yes |

**攻击与伤害**

| Attribute Key | Mode | Value | Roll Data |
|---|---|---|---|
| `system.bonuses.mwak.attack` | Add | `[formula]` | Yes |
| `system.bonuses.msak.attack` | Add | `[formula]` | Yes |
| `system.bonuses.rwak.attack` | Add | `[formula]` | Yes |
| `system.bonuses.rsak.attack` | Add | `[formula]` | Yes |
| `system.bonuses.mwak.damage` | Add | `[formula]` | Yes |
| `system.bonuses.msak.damage` | Add | `[formula]` | Yes |
| `system.bonuses.rwak.damage` | Add | `[formula]` | Yes |
| `system.bonuses.rsak.damage` | Add | `[formula]` | Yes |

> **带伤害类型的写法示例（官方）**：`system.bonuses.mwak.damage` / Add / **`1d8[radiant]`** —— 方括号里指定伤害类型。
> 四个前缀含义：`m`=melee、`r`=ranged、`wak`=weapon attack、`sak`=spell attack。

**抗性 / 免疫 / 易伤**

| Attribute Key | Mode | Value |
|---|---|---|
| `system.traits.ci.value` | Add | `[conditionType]` |
| `system.traits.di.value` | Add | `[damageType]`（`ALL`=全部） |
| `system.traits.dr.value` | Add | `[damageType]` |
| `system.traits.dv.value` | Add | `[damageType]` |
| `system.traits.dm.amount.[damageType]` | Add | `[number]` |

**其他**

| Attribute Key | Mode | Value | Roll Data |
|---|---|---|---|
| `system.details.type.value` | Override | `[creatureType]` | — |
| `system.details.type.subtype` | Override | `[text]` | — |
| `system.scale.barbarian.rages.value` | Add | `[number]` | No |
| `system.scale.rogue.sneak-attack.number` | Add | `[number]` | No |
| `system.scale.rogue.sneak-attack.faces` | Add | `[number]` | No |
| `system.scale.rogue.sneak-attack.modifiers` | Add | `[text]` | No |
| `system.attributes.prof` | Override | `[number]` | No |

**`conditionType` 全表（16 个，源 `CONFIG.DND5E.conditionTypes`）**
`blinded` / `charmed` / `deafened` / `diseased` / `exhaustion` / `frightened` / `grappled` / `incapacitated` / `invisible` / `paralyzed` / `petrified` / `poisoned` / `prone` / `restrained` / `stunned` / `unconscious`

**`damageType` 全表（14 个，源 `CONFIG.DND5E.damageTypes`）**
`ALL` / `acid` / `bludgeoning` / `cold` / `fire` / `force` / `lightning` / `necrotic` / `piercing` / `poison` / `psychic` / `radiant` / `slashing` / `thunder`

**公式里可用的 roll data 示例（官方示例表）**
`@abilities.dex.mod` / `@prof` / `@details.level` / `@details.cr` / `@classes.barbarian.levels`

**官方给的完整实例**：用 `@abilities.cha.mod` 加到 `system.bonuses.abilities.save` 来模拟圣武士的守护光环。

### 5.3 与「魔法抗性无效应」的关系

- 「魔法抗性 = 对法术的豁免有优势」在纯 ActiveEffect 里**表达不了条件**（`save.roll.mode` 是**该属性的所有豁免**，没有「仅对法术」的开关）。
- 因此这类部件有两种做法：
  1. **纯描述**（现状）：挂上去只是文字，卡上不产生任何自动效果 —— 这就是你看到的「没有效应」。
  2. **描述 + ActiveEffect**：能加无条件的效果（如伤害抗性、状态免疫、全豁免加值）。
  3. **要带条件的**（仅对法术）：需靠 **DAE / midi-qol 的条件表达式**（world 里这两个都装了），**具体 flag 写法本次未查证，不作为结论**。

---

## 六、System HTML · 描述里的官方样式类

> 出自 5.3.x `System-HTML.md`（5 个小节，与 6.0.0 内容一致）。
> 官方原句：*"These styles can be applied to any text field by using the menu options under the 'Custom' menu or by editing the Source HTML </>."*

### 6.1 Advice / Quest 图文框

```html
<div class="fvtt advice">
    <figure class="icon">
        <img src="icons/equipment/chest/robe-layered-red.webp" class="round">
    </figure>
    <article>
        <h4>Casting in Armor</h4>
        <p>文本内容……</p>
    </article>
</div>
```
`fvtt advice` 与 `fvtt quest` 格式相同：左图右文框。

### 6.2 Narrative 朗读框

```html
<div class="fvtt narrative">
    <p>马鞍袋已被洗劫一空。旁边有一只空的皮质地图筒。</p>
</div>
```

### 6.3 Notable 提示框

```html
<aside class="notable">
    <h4>加入秘密结社</h4>
    <p>文本内容……</p>
</aside>
```

### 6.4 Habitat & Treasure 栖息地/宝藏行

```html
<p class="habitat-treasure">
  <strong>Habitat:</strong> Underdark; <strong>Treasure:</strong> Arcana
</p>
```
（怪物图鉴里怪物描述顶部那一行的样式）

### 6.5 大引文块

```html
<aside class="quote-lg float-right">
  <p><q>引文内容……</q></p>
  <p class="quote-author">—Bilbo Baggins, <em>The Fellowship of the Rings</em></p>
</aside>
```
`quote-lg` 搭配 `float-right` 或 `float-left`；作者用 `quote-author`。

---

## 七、5.3.x 与 6.0.0 差异（避坑表）

**凡是网上搜到的 dnd5e 教程，先确认它是哪一版写的。以下是逐页 diff 出来的硬差异：**

| 项目 | **5.3.x（你用这个）** | 6.0.0 |
|---|---|---|
| **移速路径** | `@attributes.movement.walk/.fly/.swim/.climb/.burrow` | `@attributes.movement.speeds.*` |
| **感官路径** | `@attributes.senses.darkvision/.blindsight/.tremorsense/.truesight` | `@attributes.senses.ranges.*` |
| **法术环阶标签** | `@level` | `@labels.level` |
| `@attributes.ac.flat` | 若 AC 计算为 `flat` 即最终值；`natural` 下作 `base` | 改为「用户输入值，可在特定 AC 公式中引用」 |
| `@attributes.ac.clamped.*` | 无 | 有 |
| `@attributes.piety.value` | 无 | 有 |
| **活动类型** | **11 种（无 Teleport）** | 12 种（含 Teleport） |
| Save 的 `Save Bonus` | **无** | 有 |
| Save 的 `Visible to All` | 无 | 有 |
| Check 的 `Visible to All` | 无 | 有 |
| `Challenge Ability` | **单数** | 复数 `Challenge Abilities` |
| Attack 掷骰对话框的 `Ability` 选项 | 无 | 有（Finesse / 契约刃） |
| **Region / `Area of Effect Behaviors`** | **无** | 有 |
| Enricher 的 **Chat 直接调用**（`/attack` 等） | 无 | 有 |
| Enricher 的 **Language** | 无 | 有 |
| 聊天卡 | 旧样式 | 全面紧凑化 + 分组 targets |
| 核心要求 | **Foundry v13** | **Foundry v14+（硬性）** |

---

## 八、实测记录与已知陷阱

> 以下为**本机实测**（不是 wiki 原文），每条都标了证据来源。

### 8.1 ★ DC 的 `calculation` 字段（存疑，需再验）

**实测数据**（测试桩 CR3 / STR18 / DEX14 / CON16 ⇒ prof=2、con.mod=+3）：
- `save.dc.calculation = "con"` → `dc.value = 13` = `8 + prof + con.mod` ✅
- `save.dc.calculation = ""` → `13`
- `save.dc.calculation = "spellcasting"` → `10`
- **`save.dc.calculation = "flat"` → `dc.value` 恒为 flat 值，`formula` 被忽略**（填 12 / 填公式都一样）

**⚠️ 与官方文档冲突**：wiki 两版都写 *"DC Calculation: ... or using a custom formula"* + *"DC Formula: Place for defining the custom DC formula"*，字面看自定义公式应当生效。

**未验证项**：可能存在 `calculation` 的另一个取值才是「自定义公式」分支（我只枚举了 `con` / `""` / `spellcasting` / `flat`）。
**验证方法**：F12 打印 `CONFIG.DND5E` 下 save DC 相关配置枚举，或读 `dnd5e` 源码中 save 活动的 `dc.calculation` choices 列表。

**当前可用结论**：**要 DC 随属性走，就用 `calculation:"con"`（或对应属性码）；要固定值，别指望 flat+formula。**

### 8.2 Enricher 渲染自检方式

```js
TextEditor.enrichHTML(rawHtml, { rollData: actor.getRollData(), relativeTo: item, async: true })
```
实测有效：`[[lookup @name]]` 渲染成宿主名、`[[/attack]]` 无参自动取活动、`[[/damage average]]` 无参自动取活动伤害且 `@mod` 正确解析、`[[lookup @save.dc.value activity=<id>]]` 取到活动算好的 DC。

### 8.3 其余实测

- **`[[/damage average]]` 自带类型名** —— 描述里不要再写一遍伤害类型。
- **充能 5~6 的结构**（取自世界内 4 个真实样本）：
  ```js
  uses = { max:"1", recovery:[{ period:"recharge", type:"recoverAll", formula:"5",
    recharge:{ options:[ {value:6,label:"充能 6"}, {value:5,label:"充能 5-6"}, ... ] } }] }
  ```
  注意 `CONFIG` 里 `limitedUsePeriods` **没有 `recharge`**，但实际数据里 `period:"recharge"` 是有效的。
- **纯文本 feat 在怪卡上「没有效应」** —— 一个只有描述、没有活动、没有 ActiveEffect 的特性（如「魔法抗性」）挂到怪身上只是**一段文字**，不会自动造成豁免优势之类的效果。要真生效必须配 **ActiveEffect + changes**（写法见 wiki `Active-Effect-Rules` / `Active-Effect-Guide`）或 DAE/midi-qol 的 flag。

### 8.4 待确认（需用户澄清，不猜）

1. **「传奇动作上，发动需要的确实巢穴动作」** —— 用户原话。目前**不确定**指的是：
   - 活动的 `activation.type` 该用 `lair` 而不是 `legendary`？
   - 还是传奇动作物品在怪卡上的归类/显示需要巢穴动作？
   - 还是规则层面「传奇动作的发动条件与巢穴动作相关」？
   ⇒ **未验证，不动手，等用户说明。**

2. **`save.dc.calculation` 的自定义公式取值**（见 6.1）。

---

## 附：本文件来源清单

| 内容 | 出处（5.3.x 版 wiki md） |
|---|---|
| Enrichers 全套 | `md-53x\Enrichers.md`（685 行） |
| Roll Formulas | `md-53x\Roll-Formulas.md` |
| 活动体系与三标签页 | `md-53x\Activities.md` |
| Attack 活动 | `md-53x\Activity-Type-Attack.md` |
| Save 活动 | `md-53x\Activity-Type-Save.md` |
| Check 活动 | `md-53x\Activity-Type-Check.md` |
| Utility 活动 | `md-53x\Activity-Type-Utility.md` |
| **ActiveEffect 46 条配方** | **`md-53x\Active-Effect-Guide.md`（858 行）** |
| 系统 CSS 类 | `md-53x\System-HTML.md` |
| 版本差异 | `md-53x\*` 与 `md\*` 逐页 diff |

**wiki 抓取方式（可复现）**

```powershell
# 单页 raw markdown（推荐，远比抓 HTML 干净：1.8KB vs 328KB）
# https://raw.githubusercontent.com/wiki/foundryvtt/dnd5e/<页面名>.md

# 拿历史版本（对齐特定 dnd5e 世代）
git clone https://github.com/foundryvtt/dnd5e.wiki.git
cd dnd5e.wiki
git log --pretty=format:'%h %ad %s' --date=short -20   # 找 commit
git show <commit>:<页面名>.md                           # 取那一版原文
```

- **对齐 5.3.x** → commit `009ff4f`（2026-03-31）→ 本机 `md-53x\`（44 个页面）
- **对齐 6.0.0** → commit `17bd5d3`（2026-09-10）→ 本机 `md\`（27 个页面）
- 每页页头的 `![Up to date as of X.Y.Z]` 徽章会直接标明该页对应哪个系统版本 —— **看到任何 dnd5e 教程，先看这个徽章**。
- 6.0.0 独有、5.3.x **没有**的 4 个页面：`Active-Effect-Rules` / `Active-Effects` / `Activity-Behaviors` / `Activity-Type-Teleport`。

**本机文件位置**
- 本文件：`01_跑团工具\FVTT技术资料\dnd5e官方写法速查-5.3.3.md`
- wiki 留档：`99_临时草稿\dnd5e-wiki\md-53x\`（5.3.x，44 页）、`99_临时草稿\dnd5e-wiki\md\`（6.0.0，27 页）、`99_临时草稿\dnd5e-wiki-git\`（git 仓库）
