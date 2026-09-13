# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/W2XYwGUu2i3O5MkswVzckLD6ngd

> 💡 
[激活条件](https://xcnplziulnma.feishu.cn/wiki/SDBHwnvcWigh6gkvZpEc48xQn2f)注意：几乎所有的midi flag的值中接受类似于使用条件的js语句判断（参考 ），你可以依赖此来实现一些有条件的优势/劣势
本文档是通过效果可以设置的 flags.midi-qol.* 标志的参考。
## 通过效果设置标志
所有 midi-qol 标志都应使用效果中的自定义模式进行设置。自定义模式通过midiCustomEffect()触发 midi-qol 的特殊处理。
示例： 
```
flags.midi-qol.advantage.attack.all 自定义 1
```
---
### 自定义模式处理方式
当应用自定义模式的效果时，midi-qol 根据标志类型处理其值：
| 标志类别 | 值处理方式 |
|---|---|
| 延迟求值 | 值按原样存储，稍后在检查标志时求值 |
| 字符串 (onUseMacroName, DR.all 等)  | 值存储为字符串 |
| 数字 (DR.{attackType})  | 值解析为数字 |
| 布尔 (默认) | 值作为条件表达式求值 |
### BooleanFormula 字段
许多 midi-qol 标志在 DAE 中注册为 BooleanFormula 字段。BooleanFormula 是 DAE 的 `BooleanFormulaField` 类提供的自定义字段类型，它接受布尔值 (`true`/`false`) 或在运行时作为条件公式求值的字符串表达式。在 DAE Active Effect 编辑器中，BooleanFormula 字段会显示一个专门的输入框，允许输入简单的开关或条件表达式。
以下章节中标记为 BooleanFormula 的标志接受：
- 1, true — 始终激活
- 0, false — 从不激活
- 条件表达式字符串（例如 abilities.str.mod >= 3）— 在运行时求值
优势、劣势、noAdvantage、noDisadvantage、fail、success、critical、noCritical、fumble、noFumble、grants、magicResistance 和 magicVulnerability 类别中的所有 求值 标志都是 BooleanFormula 字段。
此外，以下特殊标志也是 BooleanFormula：neverTarget、ignoreNearbyFoes、potentCantrip、sculptSpells、carefulSpells、sharpShooter、uncanny-dodge、inMotion、initiativeAdv、initiativeDisadv、initiativeNoAdv、initiativeNoDisadv、advantage.concentration、disadvantage.concentration、noAdvantage.concentration、noDisadvantage.concentration、fail.disadvantage.heavy 和 canFlank。
延迟求值标志 包括：
- flags.midi-qol.optional.* - 可选加值效果
- flags.midi-qol.advantage.*/disadvantage.* - 优势/劣势条件
- flags.midi-qol.grants.* - 应用于其他目标的效果
- flags.midi-qol.fail.*/success.* - 自动失败/成功条件
- flags.midi-qol.critical.*/noCritical.* - 重击调整
- flags.midi-qol.superSaver.*/semiSuperSaver.* - 豁免伤害修改
- flags.midi-qol.max.damage.*/min.damage.* - 伤害骰极端值
- flags.midi-qol.OverTime - 持续效果定义
- flags.midi-qol.rangeOverride.* - 射程覆盖条件
- flags.midi-qol.ignoreCover/ignoreWalls - 忽略掩护/墙壁条件
对于延迟标志，值可以是：
- true, 1 → 存储为布尔值 true
- false, 0 → 存储为布尔值 false
- 任何其他字符串 → 按原样存储以便后续条件求值
---
### 特殊值处理
#### onUseMacroName 标志
flags.midi-qol.onUseMacroName 标志有特殊处理。值格式为：宏引用, 传递类型。此标志可用以通过主动效果指定角色的onUse宏使宏在特定时点触发
其中宏引用可以是：
- ItemMacro - 调用物品的宏（自动重写为包含物品UUID）
- ItemMacro.{itemUuid} - 调用特定物品的宏
- ActivityMacro - 调用行动的宏（自动重写为包含行动UUID）
- ActivityMacro.{activityUuid} - 调用特定行动的宏
- ActivityMacro.{activityName} - 按名称调用行动（解析为UUID）
- Macro.{macroName} - 调用世界/合集宏
而 传递类型 是宏传递阶段（例如 preItemRoll, postActiveEffects 等）。
---
自动重写：
| 输入值 | 重写为 |
|---|---|
| ItemMacro (在转移的效果上) | ItemMacro.{父物品UUID} |
| ItemMacro (在非转移的效果上) | ItemMacro.{起源物品UUID} |
| ActivityMacro (带有 DAE 行动标志) | ActivityMacro.{dae行动UUID} |
| ActivityMacro (在转移的效果上) | ActivityMacro.{首个行动UUID} |
| ActivityMacro (在非转移的效果上) | ActivityMacro.{来源首个行动UUID} |
| ActivityMacro.{名称} | ActivityMacro.{已解析行动UUID} |
最终存储的值包含附加了 | 的起源物品 UUID：
```
[传递类型]宏引用|起源物品UUID
```
多个 onUseMacroName 效果用逗号连接。
---
#### 可选加值标志中的 ItemMacro
当使用 ItemMacro 作为可选加值标志的值时（例如 flags.midi-qol.optional.NAME.attack.all），它会自动重写：
| 输入值 | 重写为 |
|---|---|
| ItemMacro (起源是物品) | ItemMacro.{起源物品UUID} |
| ItemMacro (起源是 ActiveEffect) | ItemMacro.{效果起源UUID} |
| ItemMacro (起源包含 ActiveEffect) | ItemMacro.{父物品UUID} (从路径中剥离 ActiveEffect) |
这允许效果引用其源物品的宏，而无需硬编码 UUID。
---
## 标志访问类型
标志以两种方式访问：
| 访问类型 | 描述 |
|---|---|
| 求值 | 值被视为条件表达式并使用evalCondition()求值。可以包含掷骰数据引用，如 @abilities.str.mod > 2 |
| 直接 | 值直接作为数字、布尔值或字符串读取，无需表达式求值 |
| 特殊 | 自定义处理逻辑（参见计数格式选项、增益值） |
以下每个部分都标明了其标志的访问类型。
---
## 条件表达式求值
标记为求值的标志可以包含条件表达式。这些表达式在运行时使用evalCondition()求值。
### 基本语法
| 值 | 结果 |
|---|---|
| 1, true | 始终激活 |
| 0, false | 永不激活 |
| expression | 求值 - 结果为真则激活 |
---
### 数据引用
条件数据可直接在表达式中使用。@前缀是可选的 - 两种形式都有效：
```
abilities.str.mod >= 3           // 直接访问（首选）
@abilities.str.mod >= 3          // 也有效（掷骰公式语法）

attributes.hp.value < attributes.hp.max / 2
classes.barbarian.levels >= 5
item.level >= 3
details.cr >= 10
```
注意： @语法使用Roll.replaceFormulaData()进行替换，而直接访问使用沙箱代理。两者产生相同结果。
---
### 表达式中可用的数据
#### 角色数据（来自 `actor.getRollData()`）
| 路径 | 描述 |
|---|---|
| abilities.{abl}.mod | 属性调整值（str, dex, con, int, wis, cha） |
| abilities.{abl}.value | 属性值 |
| abilities.{abl}.save | 豁免检定加值 |
| attributes.hp.value | 当前生命值 |
| attributes.hp.max | 最大生命值 |
| attributes.hp.temp | 临时生命值 |
| attributes.ac.value | 护甲等级 |
| attributes.prof | 熟练加值 |
| attributes.spell.dc | 法术豁免DC |
| classes.{className}.levels | 职业等级 |
| details.level | 角色等级 |
| details.cr | 挑战等级（NPC） |
| resources.primary.value | 主要资源值 |
| flags | 角色标志 |
| actor.raceOrType | 角色的种族或生物类型 |