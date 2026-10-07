# DND系统文本增强器指南

dnd5e 系统添加了许多有用的增强器，可在日志、物品或角色描述中使用。这些增强器将基于整个 5e 版本中使用的标准格式生成文本，并提供能正确接入系统的投掷及相关行为。

### **使用本指南**

本指南详细介绍了系统提供的各类增强器。每个章节列出了多个使用示例、可配置的选项表格，以及可能导致增强器失效的若干问题。

选项表格描述了可提供给增强器的选项。选项在增强器中的格式为 `<名称>=<值>`。如果**推断**列被勾选，表示通常可以省略名称，仅提供值即可。

如果值中需要包含空格，则必须使用双引号括起来：`<名称>="两个单词`"。**组合**列表示该选项可以带空格而不需引号。

**公式**列表示值接受的数据类型。各种格式的列表及描述见下方折叠块。

> - **布尔值**：`true` 或 `false`。
> - **选项值**：多个选项中的一个，将在表格下方的选项描述中说明。
> - **公式**：投掷或计算表达式。
> - **@-路径**：引用文档数据中某部分的路径，以 \`@\` 符号开头，如投掷公式中所用。不能包含空格或其他计算细节。
> - **ID**：文档的16位 ID，可通过右键点击文档标题中的按钮获得。

## **攻击增强器**

攻击增强器允许使用提供的公式或关联的活动进行攻击检定投掷。

在需要没有关联数据块的攻击检定（例如冒险中的飞镖陷阱）时，攻击增强器提供了一种简便的投掷方式。编写 `[[/attack +5]]` 或 `[[/attack formula=5]]` 将允许投掷一个固定 +5 的攻击检定。点击后会打开标准的攻击检定对话框，可添加情景加值以及优势/劣势投掷，这比默认的投掷增强器（例如 `[[/r 1d20 + 5]]`）更有优势。

该增强器在构建 NPC 数据块的物品时也很有帮助，因为它可以从物品的攻击活动中自动获取数据，并根据装备该物品的生物的数据进行调整。此时你只需编写 `[[/attack]]` 即可关联第一个攻击活动，或者如需指定特定活动则编写 `[[/attack activity=jdRTb04FngE1B8cF]]`。为简化数据块构建，增强器包含一个 `extended` 选项，可添加额外的攻击细节以匹配标准的 NPC 数据块格式（例如 `"近战攻击检定：[+16]，触及 15 尺"`）。扩展增强器的格式将根据包含该增强器的角色的规则版本进行调整，如果使用 legacy 规则，则会显示为 `"近战武器攻击：[+16] 命中，触及 15 尺，单一目标"`。

#### **示例**

```Plain Text
// 示例：固定 +5 命中
[[/attack formula=5]]
[[/attack +5]]

// 示例：使用特定攻击模式
[[/attack formula=5 attackMode=thrown]]
[[/attack 5 thrown]]

// 示例：链接到物品上的特定活动，使用其命中加值
[[/attack activity=jdRTb04FngE1B8cF]]
[[/attack]]

// 示例：显示扩展攻击描述
[[/attack activity=jdRTb04FngE1B8cF format=extended]]
[[/attack extended]]
```

#### 选项

| 名称 | 格式 | 推断 | 组合 |
|-|-|-|-|
| `activity` | ID |  |  |
| `attackMode` | 选项值 | ✔ |  |
| `format` | 选项值 | ✔ |  |
| `formula` | 公式 | ✔ | ✔ |
| `rules` | 选项值 |  |  |

- `activity`：通过 ID 指定同一物品上的特定活动
- `attackMode`：指定要使用的攻击模式
- `format`：显示模式，可选 `short`、`long` 或 `extended`
- `formula`：用于投掷命中的公式
- `rules`：规则版本（`2014` 或 `2024`），仅在使用 `extended` 格式选项时影响显示

#### 可能的问题

- 未指定公式且未找到攻击活动
- 同时显式设置了公式和活动 ID
- 命中公式无效

## 检定增强器

检定增强器允许使用执行投掷角色的所有正确调整值进行属性检定、技能检定和工具检定。

在特性描述或日志条目中经常会要求进行属性检定。现在你可以简单地编写 `[[/check dex]]`，它将被格式化为 `"[敏捷]"`，该文本是一个链接，点击后会打开投掷检定对话框。默认只显示属性名称，但可以通过编写 `[[/check dex format=long]]` 扩展为 `"[敏捷检定]"`。

该格式也支持完整的属性名称（例如 `[[/check dexterity]]`）和带前缀的写法（例如 `[[/check ability=dex]]`），以提高清晰度。

可以通过斜杠分隔多个技能或工具（使用显式键时，如 `[[/check skill=acr/ath]]`）或在不使用键时分别指定每个技能（如 `[[/check acr ath]]`）来提供多个技能或工具。如果未提供属性，则每个技能或工具将使用其默认属性。如果提供了属性，则所有技能和工具都将使用该属性。*不支持提供多个属性。*

在投掷中包含 DC 会将其显示在描述中并传递给投掷，在聊天中高亮显示结果是成功还是失败。`[[/check dex 15]]` 或 `[[/check ability=dexterity dc=15]]` 会变成 `"[DC 15 敏捷]"` 或 `"[DC 15 敏捷检定]"`（如果设置了 `format=long`）。

DC 可以是固定值，也可以是根据拥有该增强器的物品所属角色的属性解析的公式。因此添加 `[[/check dex dc=@abilities.con.dc]]` 会将 DC 设置为拥有此增强器的生物上预计算的体质 DC。

在检定增强器上使用 `passive` 选项会显示被动描述，并为属于主队伍的角色启用增强的被动提示。可以使用 `[[/skill perception 15 passive format=long]]` 来生成文本 `"被动感知（察觉）值为 15 或更高"`，或者省略格式选项以显示更短的 `"DC 15 被动感知（察觉）"`。

`[[/check]]`、`[[/skill]]`、`[[/tool]]` 起始词可以互换，最终投掷将根据输入内容呈现。所以 `[[/check dexterity athletics]]` 将使用角色的运动熟练项（如果有）进行敏捷检定。

对于技能或工具检定，属性是可选的。如果提供了属性，则投掷者默认会使用该属性，即使其角色表上的默认属性不同。否则，他们将使用角色表上为该技能设置的任何属性。

使用2024规则时，可以将单个工具与一个或多个技能组合，允许玩家使用该工具进行这些技能检定。如果玩家在技能或工具上具有熟练项，则提供熟练项加值；如果两者都熟练，则在投掷上获得优势。显示为 `"[敏捷（巧手）] 检定使用盗贼工具"`。

当在物品上使用时，增强器还可以从\[检定活动\](Activity-Type-Check)中查找其属性、相关熟练项和 DC。这可以通过显式指定活动 ID（例如 `[[/check activity=RLQlsLo5InKHZadn]]`）或留空让增强器自动定位物品上的第一个检定活动（例如 `[[/check]]`）来完成。

检定增强器提供两种不同的格式，可根据上下文使用。`short` 格式仅显示检定名称（例如 `"[敏捷]"` 或 `"[力量（运动）]"`），而 `long` 格式会额外加上“检定”一词（例如 `"[敏捷] 检定"` 或 `"[力量（运动）] 检定"`）。



#### 示例



```Plain Text
// 示例：进行敏捷检定
[[/check ability=dexterity]]
[[/check dexterity]]
[[/check dex]]

// 示例：为敏捷检定添加 DC
[[/check ability=dexterity dc=20]]
[[/check dexterity 20]]
[[/check DC 20 Dexterity]]

// 示例：使用默认属性进行体操检定，可使用 check 或 skill 关键字
[[/check skill=acrobatics]]
[[/check acrobatics]]
[[/skill skill=acrobatics]]
[[/skill acrobatics]]

// 示例：在技能检定中指定替代属性
[[/skill ability=strength skill=intimidation dc=20]]
[[/skill DC 20 Strength (Intimidation)]]
[[/skill strength intimidation 20]]

// 示例：使用默认属性进行多个技能检定
[[/check skill=acr/ath dc=15]]
[[/check acrobatics athletics 15]]
[[/skill skill=acr/ath dc=15]]
[[/skill acrobatics athletics 15]]

// 示例：使用单个属性进行多个技能检定
[[/check ability=str skill=dec/per dc=15]]
[[/check strength deception persuasion 15]]
[[/skill ability=str skill=dec/per dc=15]]
[[/skill strength deception persuasion 15]]

// 示例：在技能检定中使用工具
[[/check skill=sur tool=navg]]
[[/check skill=sur tool=navg rules=2024]]

// 示例：被动检定
[[/skill skill=perception dc=15 passive=true]]
[[/skill DC 15 passive Perception]]

// 示例：使用公式作为 DC
[[/check int dc=@abilities.charisma.dc]]
[[/check cha dc="8 + @prof"]]

// 示例：工具与载具检定
[[/tool ability=dexterity tool=thief]]
[[/tool ability=strength vehicle=water]]

// 示例：链接到检定活动，显式或自动
[[/check activity=RLQlsLo5InKHZadn]]
[[/check]]
```

#### 选项

| 名称 | 格式 | 推断 | 组合 |
|-|-|-|-|
| `ability` | 选项值 | ✔ |  |
| `activity` | ID |  |  |
| `dc` | 公式 | ✔ |  |
| `format` | 选项值 | ✔ |  |
| `rules` | 选项值 |  |  |
| `skill` | 选项值 | ✔ |  |
| `tool` | 选项值 | ✔ |  |

- `ability`：检定使用的属性
- `activity`：同一物品上活动的 ID，将从中获取详情
- `dc`：用于 DC 的特定数字或公式。公式不能包含骰子值。仅当为数字时可推断使用，公式必须包含 `dc=` 前缀，且公式中的空格需用引号括起
- `format`：显示模式，`short` 或 `long`
- `rules`：规则版本（`2014` 或 `2024`），仅影响同时使用技能和工具时的行为
- `skill` 或 `tool`：要投掷的技能或工具。如果未指定属性，则使用该技能的默认属性。skii和tool的缩写参见<cite doc-id="PxmxwHtBniay5LkIH7nce8LunGh" file-type="wiki" title="掷骰数据" type="doc"></cite>

#### 可能的问题

- 未指定属性或熟练项，且未找到检定活动
- 同时显式设置了属性/熟练项和活动 ID
- 未指定属性，也无法从熟练项类型推断
- 指定的技能或工具熟练项未找到
- DC 公式无效

## 伤害增强器

与简单的行内投掷链接（旧的 `[[/r 2d6]]`）不同，伤害增强器允许正确关联伤害类型与投掷，自动计算平均值，并在点击时呈现伤害投掷对话框，允许以重击方式投掷或添加临时加值。

伤害增强器的基本格式是 `[[/damage {公式} {类型}]]`，因此编写 `[[/damage 2d6 fire]]` 将被解析为文本中的 `"[2d6] 火焰"`，骰子公式可点击投掷。如果更喜欢显式语法，也可以写成 `[[/damage formula=2d6 type=fire]]`。

对于 5e 版本中多处显示的格式，可以使用 `average` 标志自动计算平均值。输入 `[[/damage 2d6 fire average]]` 或 `[[/damage 2d6 fire average=true]]` 将显示为 `"7 ([2d6]) 火焰"`。如果由于某种原因系统无法自动计算平均值，或者你想显示不同的值，可以输入自定义值。因此 `[[/damage 2d6kh fire average=5]]` 将显示 `"5 (2d6kh) 火焰"`。

公式还可以包含会在显示前计算的公式值。如果你想为怪物添加一个特性，使其伤害投掷包含调整值，可以编写 `[[/damage 1d6 + @abilities.dex.mod slashing]]`，它将根据拥有该物品的角色的敏捷调整值进行解析。

<callout emoji="❗">
公式中输入的任何值都将基于物品所有者的属性解析，而不是最终执行投掷的角色。
</callout>

增强器支持多种伤害类型，可在投掷伤害时选择。可以通过在简单形式中列出每种伤害类型（例如 `[[/damage 1d4 fire cold]]`）或在键值形式中使用斜杠分隔（例如 `[[/damage 1d4 type=fire/cold]]`）来指定。

如果需要多个不同伤害类型的投掷，可以使用 & 符号分隔每个投掷。编写 `[[/damage 1d6 钝击 & 1d4 火焰]]` 将同时投掷 1d6 钝击和 1d4 火焰。& 符号的每一侧都有自己的公式和伤害类型，但其他属性如 `average` 在多个部分之间共享，只需指定一次。

当在物品上使用时，增强器还可以从攻击，伤害或豁免活动中查找其公式和类型。这可以通过显式指定活动 ID（例如 `[[/damage activity=RLQlsLo5InKHZadn]]`）或留空让增强器自动定位物品上的第一个活动（例如 `[[/damage]]`）来完成。

如果指定了活动，则伤害投掷将通过该活动执行，而不是直接从增强器执行。这意味着如果与持有该物品的角色相关，可能会添加调整值和其他加值到伤害投掷中。

伤害增强器提供三种不同的格式，可根据上下文使用。`short` 格式仅显示公式和伤害类型（例如 `"[1d4] 火焰"`）。`long` 格式会额外加上“伤害”一词（例如 `"[1d4] 火焰伤害"`）。`extended` 格式专为 NPC 数据块设计，包含“命中：”前缀（例如 `"命中：[1d4] 火焰伤害"`）。默认使用 `short` 格式。

### 治疗增强器

虽然可以使用标准伤害增强器并指定治疗类型之一（`healing` 或 `temp`）来提供治疗，但也有一个专用的增强器使其更清晰。可以使用 `[[/heal {公式}]]` 格式进行普通治疗，使用 `[[/heal {公式} temp]]` 进行临时生命值治疗。这也接受与伤害增强器相同的 `average` 参数。

在推断活动时，`heal` 形式将获取第一个治疗行动，而 `damage` 形式将获取第一个造成伤害的攻击、伤害或豁免活动。

#### 示例

```Plain Text
// 示例：简单伤害公式
[[/damage formula="1d6 + 2" type=fire]]
[[/damage formula=1d6+2 type=fire]]
[[/damage 1d6 + 2 fire]]

// 示例：显示平均伤害
[[/damage formula=2d6 type=radiant average=true]]
[[/damage 2d6 radiant average]]

// 示例：提供两种不同伤害类型选项
[[/damage formula=1d10 type=bludgeoning|slashing]]
[[/damage formula=1d10 type=bludgeoning/slashing]]
[[/damage 1d10 bludgeoning slashing]]

// 示例：包含两个不同的伤害投掷
[[/damage formula="1d6 + 2" type=piercing & formula=1d4 type=fire average=true]]
[[/damage 1d6 + 2 piercing & 1d4 fire average]]

// 示例：标准治疗
[[/heal formula="2d4 + 2" type=healing]]
[[/heal formula="2d4 + 2"]]
[[/heal 2d4 + 2 healing]]
[[/heal 2d4 + 2]]
[[/damage formula="2d4 + 2" type=healing]]
[[/damage 2d4 + 2 healing]]

// 示例：临时生命值
[[/heal formula=10 type=temphp]]
[[/heal 10 temp]]
[[/damage formula=10 type=temphp]]
[[/damage 10 temp]]

// 示例：链接到有伤害的活动（攻击、伤害或豁免），显式或自动
[[/damage activity=RLQlsLo5InKHZadn]]
[[/damage]]

// 示例：链接到活动时指定攻击模式
[[/damage activity=RLQlsLo5InKHZadn attackMode=twoHanded]]
[[/damage twoHanded]]

// 示例：使用扩展增强器格式
[[/damage activity=RLQlsLo5InKHZadn extended]]
[[/damage extended]]

// 示例：链接到治疗活动，显式或自动
[[/heal activity=jdRTb04FngE1B8cF]]
[[/heal]]
```

#### 选项

| 名称 | 格式 | 推断 | 组合 | 全局 |
|-|-|-|-|-|
| `activity` | ID |  |  | ✔ |
| `attackMode` | 选项值 | ✔ |  | ✔ |
| `average` | 布尔值 |  |  | ✔ |
| `format` | 选项值 | ✔ |  | ✔ |
| `formula` | 公式 | ✔ | ✔ |  |
| `rules` | 选项值 |  |  |  |
| `type` | 选项值 | ✔ |  |  |

**注意**：全局列表示可以在任何伤害部分中指定这些选项，但将应用于整个增强内容（因此 `[[/damage 1d4 fire & 1d6 bludgeoning average]]` 和 `[[/damage 1d4 fire average & 1d6 bludgeoning]]` 是等效的）。

- `activity`：同一物品上活动的 ID，将从中获取详情
- `attackMode`：投掷伤害时指定要使用的攻击模式。主要用于直接从攻击活动投掷时
- `average`：在增强文本中显示计算的平均伤害与投掷公式（例如 `7 (2d6) 钝击`）
- `format`：显示模式，`short`、`long` 或 `extended`
- `formula`：用于伤害投掷的公式
- `rules`：规则版本（`2014` 或 `2024`），仅在使用 `extended` 格式选项时影响显示
- `type`：一种或多种伤害或治疗类型

#### 可能的问题

- 未指定公式且未找到带有伤害或治疗的活动
- 同时显式设置了公式和活动 ID
- 伤害公式无效

## 物品使用增强器

物品增强器允许通过增强链接使用物品。有几种不同的方法创建物品增强器，这将决定物品的使用方式：

**按物品名称**：`[[/item 啃咬]]`

这类似于系统宏，就像你把该物品拖到了宏热栏上。点击时，它会检查选中的指示物或你指定的角色。如果该指示物或角色拥有匹配名称的物品，则使用该物品，否则显示警告。

**按物品和活动名称**：`[[/item 啃咬 activity=毒素]]`

使用没有活动的物品名称会在有多个活动时打开活动选择对话框。要触发物品上的特定活动，可以包含活动名称。活动名称前必须加上 `activity=`，如果名称中有空格则必须用引号括起来（例如 `[[/item 触手 activity="挣脱触手"]]`）。

**按 UUID**：`[[/item Actor.p26xCjCCTQm5fRN3.Item.amUUCouL69OK1GZU]]`

UUID 包含对角色及其拥有的物品的引用。点击时，增强器会找到指定的角色并使用指定的物品。

**按相对 ID**：`[[/item amUUCouL69OK1GZU]]` 或 `[[/item .amUUCouL69OK1GZU]]`

相对 ID 可以包含对拥有物品的引用，可以是 ID，也可以是相对 UUID（注意前面的 `.`）。点击时，增强器将使用其所在位置（角色表、物品表或聊天卡片）来确定拥有该卡片或表的指示物或角色，以便从该所有者处使用指定物品。

在使用物品 ID 引用物品时，也可以像上述物品名称一样使用活动名称。

## 查找增强器

查找增强器允许引用角色投掷数据中的数据并将其显示在描述中。这对于自动包含生物名称（`[[lookup @name]]`）或类型（`[[lookup @details.type.config.label]]`）非常有用，但也可用于引用<cite doc-id="PxmxwHtBniay5LkIH7nce8LunGh" file-type="wiki" title="掷骰数据" type="doc"></cite>中通常可用的任何值。

当在物品上使用时，增强器还可以通过提供活动 ID 来查找活动值（`[[lookup @save.dc.value activity=jdRTb04FngE1B8cF]]`）。

还有一些额外的参数可用于转换结果文本：

- `[[lookup @name lowercase]]`：将文本转换为全小写（例如 "adult white dragon"）
- `[[lookup @name uppercase]]`：将文本转换为全大写（例如 "ADULT WHITE DRAGON"）
- `[[lookup @name capitalize]]`：将文本的第一个单词首字母大写（例如 "Adult white dragon"）

#### 示例



```Plain Text
// 示例：以小写显示角色名称
[[lookup @name lowercase]]

// 示例：显示带后备值的角色名称
[[lookup @name]]{the creature}

// 示例：从活动中查找值
[[lookup @save.dc.value activity=jdRTb04FngE1B8cF]]
```

#### 选项

| 名称 | 格式 | 推断 | 组合 |
|-|-|-|-|
| `activity` | ID |  |  |
| `path` | @-路径 | ✔ |  |
| `style` | 选项值 | ✔ |  |

- `activity`：要在其中查找值的活动 ID
- `path`：要显示的公式路径，参见<cite doc-id="PxmxwHtBniay5LkIH7nce8LunGh" file-type="wiki" title="掷骰数据" type="doc"></cite>获取有限列表。如果在路径处未找到值（例如在不在角色上的物品中查找角色名称），则增强器将显示原始路径，除非使用增强器的标签提供了后备值
- `style`：应用于最终值的格式。可以是 `capitalize`、`lowercase` 或 `uppercase`

## 引用增强器

`&Reference` 增强器允许轻松引用规则页面，并显示包含特定规则内容的丰富提示。它内置支持属性、技能、状态、伤害类型等。

使用该增强器非常简单，只需输入 `&Reference`，并在方括号内包含引用的规则名称即可。例如 `&Reference[prone]` 将被转换为 `[倒地]`，链接到 SRD 规则中的倒地页面，并显示倒地状态描述的提示框。

#### 示例

```Plain Text
// 示例：引用状态
&Reference[condition=prone]
&Reference[Prone]
&Reference[prone]

// 示例：引用状态但不显示应用按钮
&Reference[blinded apply=false]

// 示例：引用其他规则
&Reference[rule="Difficult Terrain"]
&Reference[Difficult Terrain]
```

#### 选项

| 名称 | 格式 | 推断 | 组合 |
|-|-|-|-|
| `apply` | 布尔值 |  |  |
| 可变 | 选项值 | ✔ | ✔ |

- `apply`：仅在引用状态时可用，用于防止出现应用状态按钮
- 必要时可以通过规则类别显式引用规则，但通常只需输入所引用规则的名称即可

#### 可能的问题

- 未找到规则

## 豁免增强器

豁免增强器允许使用执行投掷角色的所有正确调整值进行豁免检定投掷。

与检定增强器非常相似，豁免增强器包含两种不同的格式。默认情况下使用短格式。编写 `[[/save dex]]` 将仅显示属性名称 `"[敏捷]"`。可以通过编写 `[[/save dex format=long]]` 扩展为 `"[敏捷豁免检定]"`。

该格式也支持完整的属性名称（例如 `[[/save dexterity]]`）和带前缀的写法（例如 `[[/save ability=dex]]`），以提高清晰度。

可以通过斜杠分隔多个属性（使用显式键时，如 `[[/save ability=str/dex]]`）或在不使用键时分别指定每个属性（如 `[[/save str dex]]`）来提供多个属性。

在投掷中包含 DC 会将其显示在描述中并传递给投掷，在聊天中高亮显示结果是成功还是失败。`[[/save dex 15]]` 或 `[[/save ability=dexterity dc=15]]` 会变成 `"[DC 15 敏捷]"` 或 `"[DC 15 敏捷豁免检定]"`（如果设置了 `format=long`）。

DC 可以是固定值，也可以是根据拥有该增强器的物品所属角色的属性解析的公式。因此添加 `[[/save dex dc=@abilities.con.dc]]` 会将 DC 设置为拥有此增强器的生物上预计算的体质 DC。

当在物品上使用时，增强器还可以从豁免行动中查找其属性、相关熟练项和 DC。这可以通过显式指定活动 ID（例如 `[[/save activity=RLQlsLo5InKHZadn]]`）或留空让增强器自动定位物品上的第一个豁免活动（例如 `[[/save]]`）来完成。

可以使用 `[[/concentration]]` 增强器进行特殊的专注豁免。这将默认使用系统的默认专注属性，但如果需要其他属性，可以在增强器中覆盖（例如 `[[/concentration ability=cha]]`）。此形式也支持指定 DC。

豁免增强器提供两种不同的格式，可根据上下文使用。`short` 格式仅显示属性名称（例如 `"[敏捷]"` 或 `"[专注]"`），而 `long` 格式会额外加上“豁免检定”一词（例如 `"[敏捷] 豁免检定"` 或 `"[专注] 豁免检定"`）。

#### 示例

```Plain Text
// 示例：创建敏捷豁免检定
[[/save ability=dexterity]]
[[/save dexterity]]
[[/save dex]]

// 示例：使用多个属性进行豁免
[[/save ability=str/dex dc=20]]
[[/save strength dexterity 20]]

// 示例：为豁免添加 DC
[[/save ability=dexterity dc=20]]
[[/save dexterity 20]]
[[/save DC 20 Dexterity]]

// 示例：链接到豁免活动，显式或自动
[[/save activity=RLQlsLo5InKHZadn]]
[[/save]]

// 示例：进行带/不带 DC 的专注豁免检定
[[/concentration dc=15]]
[[/concentration 15]]
[[/concentration]]

// 示例：使用不同属性进行专注豁免
[[/concentration ability=cha]]
[[/concentration charisma]]
```

#### 选项

| 名称 | 格式 | 推断 | 组合 |
|-|-|-|-|
| `ability` | 选项值 | ✔ |  |
| `activity` | ID |  |  |
| `dc` | 公式 | ✔ |  |
| `format` | 选项值 | ✔ |  |

- `ability`：进行豁免时使用的属性
- `activity`：同一物品上活动的 ID，将从中获取详情
- `dc`：用于 DC 的特定数字或公式。公式不能包含骰子值。仅当为数字时可推断使用，公式必须包含 `dc=` 前缀
- `format`：显示模式，`short` 或 `long`

#### 可能的问题

- 未指定属性且未找到豁免活动
- 同时显式设置了属性和活动 ID
- DC 公式无效