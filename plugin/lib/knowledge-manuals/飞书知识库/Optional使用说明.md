<title>Optional使用说明</title>

可选加值（optional bonus effect）是midi的另一项有用的功能，它既可以用于修改自身的骰值（如幸运专长），也可用于在特定条件下为掷骰添加加值。



# 属性键值

可选加值的相关键值均为`flags.midi-qol.optional.NAME.<key> OVERRIDE specification`的形式，由于你可能有许多条目与一个特定的可选加值相关，**总是**用唯一的字符串替换键的 **`NAME`** 部分（最好与效应名称与物品名称一致）。

**`flags.midi-qol.optional.NAME.activation`** 

一个条件，如果评估为真，将触发可选的弹出窗口，以便玩家可以选择使用它。

你可参照<cite doc-id="SDBHwnvcWigh6gkvZpEc48xQn2f" file-type="wiki" title="激活条件" type="doc"></cite>来写对应的判断条件，需要注意的是部分midi版本存在错误。



**`flags.midi-qol.optional.NAME.force`** 

一个条件，如果评估为真，将在不弹出对话框询问玩家的情况下强制应用可选加值。

你可参照<cite doc-id="SDBHwnvcWigh6gkvZpEc48xQn2f" file-type="wiki" title="激活条件" type="doc"></cite>来写对应的判断条件，需要注意的是部分midi版本存在错误。



**`flags.midi-qol.optional.NAME.damage.all/mwak/rwak/msak/rsak`** 

应用于造成伤害的加值。



**`flags.midi-qol.optional.NAME.skill.all/per/prc/itm/etc`** 

应用于技能掷骰的加值



**`flags.midi-qol.optional.NAME.attack.all/mwak/rwak/msak/rsak`** 

加值在攻击检定后添加



**`flags.midi-qol.optional.NAME.check.all/str/dex/etc`**

加值在属性检定掷骰后添加



**`flags.midi-qol.optional.NAME.save.all/str/dex/etc`** 

加值在豁免检定后添加，需要midi设置开启`自动快进`。



**`flags.midi-qol.optional.NAME.save.fail.all/str/dex`** 和**`flags.midi-qol.optional.NAME.check.fail.all/str/dex`** 

加值在检定失败时添加



**`flags.midi-qol.optional.NAME.skill.fail.all/str/dex/etc`** 

如果角色被迫从物品使用中进行豁免检定，可选加值将被激活

例如 **`flags.midi-qol.optional.NAME.save.fail.dex`**` 覆盖 success `将允许豁免者将失败的豁免转换为成功。



**`flags.midi-qol.optional.NAME.label`** 

对话框中使用的标签



**`flags.midi-qol.optional.NAME.criticalDamage`** 

optional如果添加了伤害加值，这个标志为true代表这个伤害加值的伤害骰也会随着重击翻倍



**`flags.midi-qol.optional.NAME.ac`** 

应用于目标 AC 的加值 - 在目标所有者的客户端上提示——类似反应掷骰



**`flags.midi-qol.optional.NAME.rollMode`**

任何额外的掷骰将以指定的掷骰模式进行，使用**`publicroll/gmroll/blindroll/selfroll`** 之一。



**`flags.midi-qol.optional.NAME.macroToCall`**, **`ItemMacro`** 或 **`world macro name`** 

当用户选择使用可选加值时执行宏，参数与 MidiQOL onUse 宏中的相同。



## 使用次数

**`flags.midi-qol.optional.NAME.count`** 

效果可以使用多少次（如**幸运Lucky**有`3`次），如果不存在，加值将是单次使用（吟游**诗人激励Bardic Inspiration**）。

- **every** - 你可以在每次出现时使用可选效果
- **reaction** - 行为如同反应掷骰，即消耗你的反应
- **a number** - 效果在失效前可以使用的次数
- **turn** - 在你的回合中可以使用一次（假设在战斗中）。
- **each-turn** - 每回合可以使用一次（假设在战斗中）。
- **each-round** - 每轮可以在任何回合使用一次（假设在战斗中）。

**特殊使用次数**

[**@fields**](https://github.com/fields) - 如果 [@field](https://github.com/field) > 0 则可用，使用时递减 [@field](https://github.com/field)。

你可以在计数字段中指定要消耗的资源，直到它用完为止（即 0）。资源可以设置为在休息时刷新，因此这将支持完整的每日使用次数定义。

**ItemUses.field1.field2**

指定特定物品的使用次数：

**`<field1>`**: 可以是以下之一：

- **`identifier`**（标识符是每个物品的特殊识别字符串，通常由你最初创建物品时使用的名称决定，可以通过复制物品的 UUID，然后在开发工具的控制台选项卡中使用 **`fromUuidSync("copied UUID").identifier`** 找到）
- **`partialNameMatch`** 部分匹配
- **`exactNameMatch`** 精确匹配
- **`exact item name`**（仅用于向后兼容）

**`<field2>`**: 基于你在 **`<field1>`** 中使用的值，它可以是：

- 物品的标识符
- 与物品名称部分匹配的单词
- 物品的确切名称
- 什么都没有，因为你已经匹配了物品的确切名称

对于名为 **`Special Mace`** 的物品的示例：

- **`ItemUses.identifier.super-mace`**
- **`ItemUses.partialNameMatch.Mac`**
- **`ItemUses.exactNameMatch.Super Mace`**用于向后兼容
- **`ItemUses.Super Mace`**用于向后兼容



**ActivityUses.field1.field2.field3**

指定特定行动的使用次数：

**`<field1>`**: 可以是以下之一（含义均同上）

- **`identifier`**
- **`id`**
- **`partialNameMatch`**
- **`exactNameMatch`**
- **`行动所在物品的名称`**

**`<field2>`**: 基于你在 **`<field1>`** 中使用的值，它可以是：

- 物品的标识符
- 物品的 id
- 与物品名称部分匹配的单词
- 物品的确切名称
- 行动的确切名称

**`<field3>`**: 基于你在 **`<field1>`** 中使用的值，它可以是：

- 行动的标识符
- 行动的 id
- 与行动名称部分匹配的单词
- 行动的确切名称
- 什么都没有，因为你已经匹配了物品和行动的确切名称。

对于名为 **`Special Mace`** 的物品和名为 **`Super Attack`** 的行动的示例：

- **`ActivityUses.identifier.special-mace.super-attack`**
- **`ActivityUses.id.iLKpfoGF7rGpvNWD.NegUUOdFH35S3xNi`**
- **`ActivityUses.partialNameMatch.mace.super`**
- **`ActivityUses.exactNameMatch.Special Mace.Super Attack`**
- **`ActivityUses.Special Mace.Super Attack`**



**`flags.midi-qol.optional.NAME.countAlt`** 

一个次要条目，可用于指定在检查 **`.count`** 时同时需要可用的不同计数。例如，一个有使用次数并且还需要 **`reaction`** 可用的物品。



# 更改

接下来是`更改`中可以填的值

- 一个骰子表达式（添加到掷骰中）
- 一个数字（当与`.activation`或`.force`可选条目一起使用时使用相关的数学运算符，例如**`+2`**）
- 重新掷骰：

  - **`reroll`**: 重新掷骰并保留新结果
  - **`reroll-max`**: 重新掷骰最大值并保留新结果
  - **`reroll-min`**: 重新掷骰最小值并保留新结果
  - **`reroll-kh`**: 重新掷骰并保留较高结果
  - **`reroll-kl`**: 重新掷骰并保留较低结果
  - **`reroll-query`**: 重新掷骰并询问用户保留哪个结果
  - **`reroll-withBonus`**: 重新掷骰并添加提供的加值，例如：**`reroll-withBonus +1d4`**
- **`success`**: 确保D20掷骰成功（目前使其成为重击）
- **`fail`**: 确保D20掷骰失败
- **`replace <formula>`**: 用新公式替换，例如**`replace 4d20kh`**
- **`ItemMacro.<itemUUID>`**: 可以实现你想要的任何逻辑，并且应返回上述类型之一，例如 **`return '1d6[fire]'`**。以下是一个宏示例，它会返回目标的CR

```Plain Text
let targetCR = workflow.targets.first().actor.system.details.cr;
let bonusCR = Math.max(targetCR, 1);
return `+${bonusCR}`
```



# 物品示例

#### 诗人激励

![图片展示的是《原神》中“诗人激励”动态效果的设置界面。界面中列出了多个属性名，如“flags.midi-qol.optional.诗人激励.attack.all”等，每项属性后有“加”或“减”改变方式，以及对应的属性值，如“1@scale.bard.bardic-inspiration”。界面底部有“提交变更”按钮。该图片与文档中“诗人激励”动态效果的使用说明相关，直观呈现了设置界面及部分属性信息。](https://feishu.cn/file/NcqJbm73UoQeacxSdGbc2NWbn0f)

#### 思维砥石

激活条件为当专注检定时

![图片展示了《原神》中思维砥石MindSharpener的动态效果设置界面。界面中列出了属性名、改变方式、属性值、优先级等信息，如flags.midi - qol.optional_思维砥石MindSharpener.activation属性值为isConcentrationCheck，优先级为20；flags.midi - qol.optional_思维砥石MindSharpener.count属性值为itemUse.思维砥石，优先级同样为20；flags.midi - qol.optional_思维砥石MindSharpener.save.fail.all属性值为success，优先级也为20。该图片与文档中思维砥石的激活条件相关，直观呈现了其动态效果设置内容。](https://feishu.cn/file/PJzhbH2EqoBSHyxwKp7cjGLynlh)

#### 强力施法

![图片展示的是“强力施法PotentSpellcasting”的动态效果设置界面。界面中有“细节”“时长”“更改”“光环”等选项卡。属性名栏有与“强力施法”相关的属性，如force、damage.all、count等，对应的改变方式有覆盖、加等，属性值多为20，优先级栏也有所显示。该图片对应文档中“强力施法”内容部分，展示了其属性设置相关信息，可帮助理解“强力施法”这一物品在系统中的参数设定情况。](https://feishu.cn/file/M5PZb2udOoJ8aLxYFVtcFEUfnmN)

#### 强效塑能

![图片展示了《我的世界》物品模组中“强效塑能”的动态效果设置界面。界面中“时长”选项被选中，显示了三个属性设置项，分别是“flags.midi - qol.optional.强效塑能.force”“flags.midi - qol.optional.强效塑能.count”“flags.midi - qol.optional.强效塑能.damage.all”，其改变方式分别为“覆盖”“加”“加”，属性值分别为“item_school === 'evo' && item_sourceClass === 'wizard'”“every”“+@abilities.int.mod”，优先级均为20。该图片与文档中“强效塑能”内容相关，直观呈现了其激活条件等设置。](https://feishu.cn/file/XP12bYJBOotIC3xZx0TcpOhmnQd)

#### 超限导能

其中激活条件为`item.school === 'evo' && item.sourceClass === 'wizard' && workflow.castData.castLevel <= 5 && item.level > 0`

![图片展示的是《最终幻想14》超限导能的动态效果设置界面。界面中列出了多个属性名，如“flags.midi-qol.optional.超限导能.count”等，对应改变方式均为“覆盖”，属性值涉及“ItemUses.超限导能”“reroll - max”等内容，优先级均为20。该界面与文档中“超限导能”技能的激活条件相关，激活条件为`item.school==='evo'&&item.sourceClass==='wizard'&&workflow.castData.castLevel<=5&&item.level>0`，此图直观呈现了相关动态效果设置参数。](https://feishu.cn/file/Br4HbhBEiow1uXxBA6lceEhon7g)

#### 幸运

![图片展示的是《我的世界》中“幸运”动态效果的属性设置界面。界面中列出了多个属性，如“flags.midi-qol.optional.幸运.attack.fail.all”等，其改变方式均为“加”，属性值有“reroll-kh”“幸运”“itemUses.幸运”等，优先级均为20。该图片与文档中“幸运”动态效果的内容相关，直观呈现了其属性设置情况，帮助理解该动态效果的配置参数。](https://feishu.cn/file/VkW3bKrovojVKxxeTR5cNTW1nrc)

#### 魂灵环绕

![图片展示的是游戏《原神》中“魂灵环绕黯蚀SpiritShroud”技能的动态效果配置界面。界面中列出了多项属性，如flags、damage等，每项属性后有“改变方式”和“属性值”栏，部分属性值为计算公式，如“damage.msk”为“(@scaling+1)/2*d\[s necrotic\]”。界面右上角有“更改”按钮，下方有“提交变更”按钮。该图片与文档中“魂灵环绕”技能的配置说明相关，直观呈现了技能配置的具体内容。](https://feishu.cn/file/Qo7BbAjueoZWlaxT6fEcwZgWnKd)

#### 额外伤害

造成冰冻伤害时额外造成 1 冰冻伤害（仅适用于midi v12.4.62以上）

![图片展示的是《原神》中“Iceheart”物品的时长设置界面。界面中“属性名”列有“flags.midi - qol.optional.Iceheart.activation”等项，“改变方式”均为“覆盖”，“属性值”分别为“damageTypes.cold”“1\[cold\]”“every”，“优先级”均为20。该图片与文档中“物品示例”部分相关，直观呈现了“Iceheart”物品在时长设置方面的属性配置情况，帮助理解其动态效果的设置参数。](https://feishu.cn/file/WsYXb8bmMoIOnIxnOJRcraugn1h)