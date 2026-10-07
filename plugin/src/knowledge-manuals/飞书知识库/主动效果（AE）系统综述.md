<title>主动效果（AE）系统综述</title>

> 本文档杂揉了dae相关内容

# 视频链接

<readonly-block href="https://player.bilibili.com/player.html?bvid=1vKbrzhE7U&amp;share_source=copy_web&amp;vd_source=85d1ba3ac08e6f1597e74e590f6eccc4" type="iframe"></readonly-block>



# 主动效果详情页

![图片展示的是《D&D 5E》中“英雄誓言巨剑+1”主动效果详情页。页面上方显示效果名称及图标，下方有“图标着色颜色”“效果描述”“格式”“效果暂停”“将效果应用于角色”等选项，其中“图标着色颜色”处有#ffffff的输入框，下方有格式设置按钮。该图片与文档中介绍主动效果详情页内容相关，直观呈现了详情页的界面布局及部分功能选项。](https://feishu.cn/file/PcvTbMPYFo5Xl9xJwbXcYzDknvq)

`图标着色颜色`：如其所述，会为图标自动着色，效果如下图：

![这张图片展示了两个带有时钟标识的图标，是主动效果详情页中“图标着色颜色”效果的示例。上方图标为深灰色背景搭配红色十字形图案及白色时钟标识，下方图标为浅红灰色背景搭配交叉刀剑图案及白色时钟标识，直观呈现了“为图标自动着色”的效果，对应上下文提及的“图标着色颜色”效果说明，清晰展示了该功能对不同基础图标进行颜色填充后的呈现样式。](https://feishu.cn/file/RsFJbvMxko2jacxo27ec3G3Nn3k)

`效果描述`：在此处为效果写入描述

`效果暂停`：暂时禁用效果而不是移除它，需要注意的是，与字面意义不同，当你使用[**Times Up**](https://foundryvtt.com/packages/times-up/)自动计算效果持续时间时，勾选了效果暂停的效应依然会正常计算持续时间。

`将效果应用于角色`：如其所述，有另一个常用的称呼**转移效果**。从代码角度来说，标记为转移效果的AE将直接作用于物品所有者（或者说item的`parent`文档，一般为`actor`），但是不会出现在`actor.effects`当中

![图片展示了主动效果（AE）系统中“状态条件”和“单独状态条件”的设置界面。上方“状态条件”部分说明在受该激活效应影响时，目标将被视为具有这些额外的状态条件；下方“单独状态条件”部分说明当该激活效应被应用时，这些额外的状态条件将被分别施加。这两部分由\[DAE\]添加，仅适用于非转移效果，需启用DAE才能使用。](https://feishu.cn/file/L40ZbWlrNooOfKxOtUXcRZkfnRh)

`状态条件`：在受效果影响时视为具有此项内的状态，如目盲，麻痹，石化等，以此施加的状态会随着该效应的移除而移除。

`单独状态条件`：当效果被应用于目标时也应用此项内的状态，以此方式施加的状态与效应相互独立。

---

![图片展示的是“主动效果（AE）系统综述”中“主动效果详情页”部分的DAE设置界面。界面上方有“DAE”标题，下方有“表达式，如果为假将从角色中移除效果”和“表达式，如果为真将禁用效果”两个输入框，用于填写js表达式。此外，还有“可叠加”下拉菜单，当前显示“效果不会按效果名称和效果来源叠加”选项，以及“始终显示效果图标”和“图标覆盖”设置项。该图片与上下文介绍的DAE功能设置相关，直观呈现了相关设置界面。](https://feishu.cn/file/SDp1bUR1soLqSaxtUj8cNFc6nSf)

> 这一部分的内容由[DAE](https://foundryvtt.com/packages/dae/)添加，也就是说，你需要启用**DAE**才能使用这些功能

`表达式，如果为假将从角色中移除效果`：仅适用于**非转移效果**（也即那些效果应用于目标的效应）。如其所述，你需要在此处填入js表达式<cite doc-id="SDBHwnvcWigh6gkvZpEc48xQn2f" file-type="wiki" title="激活条件" type="doc"></cite>，若条件评估为假，则该效果将从角色身上移除，以`attributes.hp.value < 50`为例，效果将在当前被应用的角色生命值大于等于 50 时自动移除。此处的判断语句仅支持角色的<cite doc-id="PxmxwHtBniay5LkIH7nce8LunGh" file-type="wiki" title="掷骰数据" type="doc"></cite>，不支持工作流数据。

`表达式，如果为真将禁用效果`：你需要在此处填入js表达式<cite doc-id="SDBHwnvcWigh6gkvZpEc48xQn2f" file-type="wiki" title="激活条件" type="doc"></cite>，若条件评估为真，则该效果将从角色身上禁用，以`!!attributes.ac.equippedArmor`为例，效果将在当前角色着装护甲时自动禁用。此处的判断语句仅支持角色的<cite doc-id="PxmxwHtBniay5LkIH7nce8LunGh" file-type="wiki" title="掷骰数据" type="doc"></cite>，不支持工作流数据。

`可叠加`：你可以在此处决定效果的叠加方式，有以下几个选项

- **效果不会按效果名称和来源叠加**：如其所述，同名效果无论来源是何都不会叠加。非**转移效果**默认为此选项。
- **效果不会按效果名称叠加**：如其所述，如果名称匹配，此选项将删除没有来源的效果。
- **效果不会按来源叠加**：允许来源不同的同名效果叠加，比如魅惑类效果
- **效果可多次叠加**：如其所述，但是其会叠加n个效应于角色身上而不是一个效应有n层。
- **每次效果增加计数 1**：效果每次叠加时，不是额外创建一个相同效果，而是在原效果名称后添加一个(n)，n是叠加的层数，适用于叠层效果。此选项叠加的效果在删除时会删除所有层数。此时你可以用 `##/@stackCount`来在条件评估或者修改中引用效果叠加的层数：其中`##stackCount`表示效果应用目标身上的效果叠加计数，`@stackCount`表示效果来源角色身上的效果叠加计数。
- **应用增加 1 叠加，删除减少 1 叠加，叠加为 0 时删除**：效果每次叠加时，不是额外创建一个相同效果，而是在原效果名称后添加一个(n)，n是叠加的层数，适用于叠层效果。此选项叠加的效果在删除时只会删除 1 层效果。此时你可以用`##/@stackCount`来在条件评估或者修改中引用效果叠加的层数：其中`##stackCount`表示效果应用目标身上的效果叠加计数，`@stackCount`表示效果来源角色身上的效果叠加计数。

`始终显示效果图标`：如其所述。

`图标覆盖`：勾选此项时，效应图标将直接覆盖于token之上，如图所示：

![图片展示了主动效果详情页中“图标覆盖”功能的示例。画面中有一个角色头像，其面部被一个带有黑色线条的黄色图标覆盖，图标上有“X”和“禁止”标志。该图片与文档中介绍主动效果详情页“图标覆盖”功能的内容相关，直观呈现了勾选此项时，效应图标将直接覆盖于token之上的效果，帮助用户理解该功能的实际展示效果。](https://feishu.cn/file/ApOxbpDp4ooMulxQA9Xcu5PZnbc)

> 神经，这个功能到底有什么用。

---

![这张图片是FoundryVTT平台Midi-QOL模块中，主动效果系统的设置选项界面。界面上的设置项依次为“如果角色陷入失能，则效果结束”，对应勾选后会检查角色是否存在midi定义的失能类状态，失能效果触发时会结束主动效果；接下来是“效果应用时应用于自身”，勾选后主动效果会应用到使用者而非目标；还有“物品掷骰时应应用于自身”，特殊说明为不依据掷骰结果，无论触发效果是否成功都应用于自身；最后是“不应用效果”，勾选后在Daemonaeon或Midi应用主动效果时会跳过该设置项。](https://feishu.cn/file/GUNKb78omomtAExyVErcfHEhnCf)

`如果角色陷入失能，则效果结束`：若勾选，将使用midi的`checkIncapacitated`检查失能或会附加失能的状态（准确来说，是midi定义的**incapacitatedConditions**数组，包括DND系统自带的失能，麻痹，石化，死亡，昏迷，震慑与[DCE](https://foundryvtt.com/packages/dfreds-convenient-effects/)的同名状态），若角色身上有满足条件的状态，则效果自动结束。

`效果应用时应用于自身`：如其所述。

`物品掷骰时应用效果于自身`：如其所述。

`不应用效果`：如其所述。

---

# 持续时间

![这张图片是主动效果（AE）系统的设置界面，对应文档中持续时间相关的功能设置，界面包含多个和效果时长相关的填写项。具体有“效果持续时间（秒）”“以秒计数的效果时间掷骰公式”“效果开始回合”的输入栏，还有“效果时长（战斗）”的“战斗轮”“回合”填写项，以及“遭遇战”“效果起始”的“轮（ROUND）”“回合”填写栏，该界面用于配置主动效果的持续时间相关参数，和文档中关于效果持续时间的规则说明相呼应。](https://feishu.cn/file/ZynWbV3VtoQBQXxSJDdcrWPbndb)

`效果持续时间（秒）`：如其所述，需要注意的是，当你没有在`效果时长（战斗）`填写数据时，DAE会利用这里填写的时间自动转换为轮数，如在这里填 60 对应 10 轮。

`以秒计数的效果时间掷骰公式`：允许你在此处填写<cite doc-id="JtcnwpeyJip9rGkAkRBcoGFan0c" file-type="wiki" title="掷骰公式" type="doc"></cite>与引用<cite doc-id="PxmxwHtBniay5LkIH7nce8LunGh" file-type="wiki" title="掷骰数据" type="doc"></cite>作为效果持续时间的值，如`@abilities.int.mod+2d4`，单位为秒。

`效果开始回合`：无需在意，系统会自动填写

`效果时长（战斗）`：如其所述，在此处填写了数据的话，在战斗中将覆盖`效果持续时间（秒）`，支持m轮n回合的持续时间。

`遭遇战`：不用管

`效果起始`：系统自动填写，不用管。

![这张图片展示的是主动效果（AE）系统中与持续时间相关的配置界面，对应文档里关于DAE（主动效果）系统的持续时间设置内容。界面清晰显示了两个核心配置项，上方的“宏重复”下拉框，对应文档中提到的宏重复触发规则，用于设置每回合开始或结束时触发DAE宏；下方的“特殊持续时间”选项，带有添加按钮，关联文档中提及的特殊持续时间配置，可设置如移动时效果结束等特殊时长，还能通过CPR的医药箱进行相关配置。](https://feishu.cn/file/ZgG3be4JhoJEIIxtNzRcFLtUnxe)

`宏重复`：允许你在每回合开始/每回合结束时触发DAE宏，在宏中的对应触发参数是`args[0] == 'each'`

`特殊持续时间`：允许效果持有特殊的持续时间，如移动时效果结束，进行一次攻击时效果结束，持续到来源角色的下回合开始，持续到目标的下回合开始等，请通过下拉框自行探索。你也可以通过[CPR](https://foundryvtt.com/packages/chris-premades)的医药箱来配置特殊持续时间

---

# 修改

![图片展示的是主动效果（AE）系统中修改界面的部分内容。界面上方有“详情”“持续时间”“修改”“Active Auras”等选项卡。在“修改”选项卡下，有“属性名”“改变方式”“数值”“优先”等输入框，其中“属性名”显示为“<UNKNOWN>”，“改变方式”为“加”，“数值”为20，右上角有“+”和“删除”图标。该图片与上下文介绍的主动效果系统中修改内容相关，直观呈现了修改界面的操作区域。](https://feishu.cn/file/PMHrbZJOzorJUpx9yiacTxPznmc)

此页面用以决定效果的绝大部分实际更改

你可以使用图中右上角的➕来创建一个新的更改，也可以点击左侧的垃圾桶图标来删除指定的更改。

`属性名`：一般也称为`键值/属性键`。要修改的内容，DAE允许自动补全，你也可以参考<cite doc-id="RWvAwy1ZJias4Bk6UgwcSwcgnMe" file-type="wiki" title="主动效果属性键" type="doc"></cite>和<cite doc-id="W2XYwGUu2i3O5MkswVzckLD6ngd" file-type="wiki" title="midi Flags介绍" type="doc"></cite>以及下文的由模组提供的特殊键值来探索有哪些键值可用。

`改变方式`：决定`属性名`以何种方式更改。

| **变更模式** | **描述** |
|-|-|
| 加 | 将提供的值添加到指定的属性。对于数值属性，可以通过指定要加的值为 `+1` 或 `-1` 来增加或减少特定值。对于集合（例如物品属性或角色的伤害抗性），这可用于添加或删除条目（例如，`mgc` 添加魔法属性，或 `-mgc` 移除它）。 |
| 乘 | 将定义的属性乘以效果值字段中的数值，例如输入`5`代表乘以`5`。 |
| 覆盖 | 将定义的属性替换为效果值字段中提供的值。如果应用于文本值（如名称或描述），可以使用一对花括号 `{}` 来在最终输出中包含被覆盖的值。因此，用 `Arcane Propulsive {}` 覆盖`胸甲`的名称将导致最终名称为`Arcane Propulsive胸甲`。 |
| 降级 | 对应属性的值不能超过设定的值。例如设定`@abilities.dex.value`降级为`20`，代表敏捷属性值不能超过`20`。 |
| 升级 | 对应属性的值不能低于设定的值。例如设定`@attributes.ac.value`升级为`16`，代表`AC`不能低于`16`。 |
| 自定义 | 自定义变更模式应用由游戏系统或附加模组定义的逻辑。DND5e系统不使用自定义变更模式。 |

`值`：`属性名`改变的值/条件判断等，取决于具体的键值，其接受的数据与评估方式均有不同，可参考<cite doc-id="RWvAwy1ZJias4Bk6UgwcSwcgnMe" file-type="wiki" title="主动效果属性键" type="doc"></cite>与<cite doc-id="W2XYwGUu2i3O5MkswVzckLD6ngd" file-type="wiki" title="midi Flags介绍" type="doc"></cite>

`优先`：效果中的每个变更都可以被赋予一个优先级。优先级决定了在 applyEffects 阶段应用更改的顺序。所有效果的所有更改都会被收集并按优先级排序（从低到高）后再进行应用。变更的默认优先级为

- `自定义``: 0`
- `乘``: 10`
- `加``: 20`
- `降级``: 30`
- `升级``: 40`
- `覆盖``: 50`

因此，如果一个角色有以下更改，  
`system.attributes.hp.max ADD 10`  
`system.attributes.hp.max OVERRIDE 20`  
在默认优先级下，hp.max 将是 20，因为 OVERRIDE 在 ADD 之后。如果分配了优先级：  
`system.attributes.hp.max ADD 10 优先级:100`  
`system.attributes.hp.max OVERRIDE 20 优先级:10`  
hp.max 将变为 30。

---

## **使用数据路径查找正确的属性键**

如果没有现成的物品或角色可供便捷地参考，要确定用于主动效果的正确的属性键可能起初看起来有点棘手。这确实涉及使用开发者工具（`F12` 或在 macOS 上使用 `Cmd+Shift+I`）。不过，一些简单的命令可以显示所有可能被更改的数据路径。然后，这些数据路径就可以用来确定你需要在主动效果中输入的属性键。

请使用以下方法来确定可用于主动效果的属性键：

1. 打开你的开发者工具（`F12` 或在 macOS 上使用 `Cmd+Shift+I`）。
2. 点击**控制台**选项卡。
3. 在底部的控制台提示符处，粘贴以下代码，然后按 Enter 键：要获取角色的可能数据路径：要获取物品的可能数据路径：

   ```JavaScript
   const types = Actor.implementation.TYPES;
   const shells = types.map(t => new Actor.implementation({name: t, type: t}));
   shells.forEach(s => console.log(`${s.type}`, '类型的角色拥有以下可用的属性键：\n系统.\n', s.toObject().system));
   ```

   ```JavaScript
   const types = Item.implementation.TYPES;
   const shells = types.map(t => new Item.implementation({name: t, type: t}));
   shells.forEach(s => console.log(`${s.type}`, '类型的物品拥有以下可用的属性键：\n系统.\n', s.toObject().system));
   ```

当你运行此命令时，将显示可以被主动效果影响的可用数据路径列表。然后，你可以在创建主动效果时使用这些数据路径作为属性键。请记住包含 `system.` 前缀。例如，因为一个`character`类型角色的力量值可以在 `system > abilities > str > value` 下找到，所以`character`类型角色力量值的属性键是 `system.abilities.str.value`。

**查找数据路径的旧方法**

如果前面介绍的方法没有返回预期的输出，那么你的游戏系统可能没有使用系统数据模型。如果是这样，请尝试改用此方法。

**确定角色或物品类型**

第一步是找出你的游戏系统中存在哪些类型的角色或物品。

1. 打开你的开发者工具（`F12` 或在 macOS 上使用 `Cmd+Shift+I`）。
2. 点击**控制台**选项卡。
3. 在底部的控制台提示符处，粘贴 `game.system.model.Actor` 或 `game.system.model.Item` 并按 Enter 键。
4. 根据你使用的命令，会显示角色或物品的类型列表，这些列表会被压缩成一行，你可以点击展开。

一旦你知道想要更改哪种类型的角色，就可以通过类似的过程获取该角色类型可修改的特质列表。如果前面的方法不起作用，请尝试：`Object.keys(foundry.utils.flattenObject(game.system.model.Actor.角色类型))`，将**角色类型**替换为你选择的角色类型，例如 `character`（PC）。

例如，如果你正在使用DND5e游戏系统并希望查找玩家角色的数据路径，你将使用 `Object.keys(foundry.utils.flattenObject(game.system.model.Actor.character))`。

此脚本的输出为你提供了一个非常简化、可扩展的数据路径列表，你的系统可能会修改这些路径。

---

## 参数评估

当一个效果应用到角色身上时（被动或不可转移），DAE会对`change.value`字符串进行一些修改。

如果效果作为被动/**转移效果**应用，则几乎不做修改。

- 如果更改有内联掷骰指定，则评估该掷骰，返回值替换`change.value`中的内联掷骰。
- 如果更改有`@tokenUuid`（或`@targetUuid`）或`@actorUuid`，它将被替换为角色或其token的uuid（如果有的话）。这在某些条件评估中很有用，你可以访问角色/token。

其余的@字段保持不变，以便在`actor.prepareData()`中评估效果时进行查找。

如果效果是**非转移效果**（即在物品使用时应用），情况会稍微复杂一些。你可能希望引用使用物品的角色/token上的值，或物品使用目标上的值。DAE 使用以下规则：

@字段在使用物品的角色/token中查找，并用来自使用物品的角色的值替换@字段。

### 字段不被评估，并且 ## 字段字符串在目标角色上创建的更改值中被替换为 @ 字段 - 在那里它们将遵循被动效果的评估规则。

这里有一个小例子：假设一个力量调整值 18 的角色使用一个物品攻击一个力量调整值 10 的目标，并应用一个主动效果：

`@abilities.str.mod`将评估为 18

`##abilities.str.mod`将评估为`@abilities.str.mod`（并在最终被调用时评估为10）。

对于`macro.XXXX`更改，有许多其他字段可用，这些字段将在效果应用到目标角色时被转换。

---

# 由模组提供的特殊键值

除了系统自带的属性键值之外，一些模组也提供了一系列的额外键值可供使用，其中最为常用的MIDI flags与AC5e flags在以下两篇文档中皆有介绍与整理<cite doc-id="W2XYwGUu2i3O5MkswVzckLD6ngd" file-type="wiki" title="midi Flags介绍" type="doc"></cite><cite doc-id="Sl6QwVxRqi6SUrkKe8wc0yoJnuh" file-type="wiki" title="Automated conditions 5e的使用方法" type="doc"></cite>。

DAE则提供了一些其他的键值，我们在此省略不言自明的，仅介绍需要特别解释的

<table><colgroup><col/><col/><col/></colgroup><tbody><tr><td><b>属性键</b></td><td><b>修改模式</b></td><td><b>含义</b></td></tr><tr><td><code>flags.dae.*</code></td><td>自定义</td><td>在应用效应的目标设置一个dae flag，并允许你通过<code>@flags.dae.*</code>的方式来引用</td></tr><tr><td><code>flags.dae.onUpdateTarget</code></td><td>自定义</td><td>见下文</td></tr><tr><td><code>flags.dae.onUpdateSource</code></td><td>自定义</td><td>见下文</td></tr><tr><td><code>flags.dnd5e.DamageBonusMacro</code></td><td>自定义</td><td>添加伤害加值宏，宏将在伤害加值阶段自动触发</td></tr><tr><td><code>macro.execute</code></td><td>自定义</td><td>效果创建/删除/每回合执行宏，详见下文<b>DAE宏</b>部分</td></tr><tr><td><code>macro.itemMacro</code></td><td>自定义</td><td>效果创建/删除/每回合执行效果来源物品上的宏，详见下文<b>DAE宏</b>部分</td></tr><tr><td><code>flags.dae.deleteOrigin</code></td><td>自定义</td><td>见下文</td></tr><tr><td><code>flags.dae.deleteUuid</code></td><td>自定义</td><td>见下文</td></tr><tr><td><code>macro.createItem</code></td><td>自定义</td><td>值为要创建物品的UUID，你可以直接将物品拖到值的框中自动生成，此键值允许你在效果创建时为效果应用的目标创建一个物品，并在效果移除时自动删除它</td></tr><tr><td><code>macro.createItemRunMacro</code></td><td>自定义</td><td>其行为与 macro.createItem 相同，但此外，当物品在角色身上创建时，DAE 将运行该物品的物品宏，<code>args[0]</code> 设置为 "onCreate"，允许你将创建物品的 uuid（在 lastArg 中传递）保存到某处以供将来参考。</td></tr><tr><td><code>macro.activityMacro</code></td><td>自定义</td><td>效果创建/删除时/每回合执行效果来源物品行动上的行动宏，详见下文DAE宏部分</td></tr><tr><td><code>macro.actorUpdate</code></td><td>自定义</td><td>详见<cite doc-id="ZeLAwD52pijnUkkzHhGcIxpTnnf" file-type="wiki" title="macro.actorUpdate使用方法" type="doc"></cite></td></tr></tbody></table>

### `flags.dae.onUpdateTarget`与`flags.dae.onUpdateSource`

`flags.dae.onUpdateTarget` 和 `flags.dae.onUpdateSource`，更改值为 `Label, macroReference, updateFilter, arguments`。

`macroReference`、`updateFilter` 和 `arguments` 都是可选的。此效果做两件事：

1. 在**目标角色（onUpdateTarget）**或**来源角色（onUpdateSource）**上创建一个标志，记录来源物品、目标token和发起角色的token（sourceToken）和角色（sourceActor）到目标（`flags.dae.onUpdateTarget`）或来源角色（`flags.dae.onUpdateSource`）。

   注意：`onUpdateSource`与其他主动效果不同，它**总是**在使用物品/创建效果的角色上创建，而不是在目标上。

1. 允许你指定一个宏，每当目标token/角色的过滤器字段被更新时调用。过滤器字段不需要引用单个值，`system.abilities` 将在任何属性值更新时调用宏。

#### **示例**

```Plain Text
flags.dae.onUpdateTarget | 自定义 | Arcane Link, ItemMacro, system.attributes.hp.value, 1, 2, 3
```

将在目标角色的 `actor.system.flags.dae.onUpdateTarget`（一个此类条目的数组）中添加一个条目，包含：

- **args**: `[]`
- **filter**: `system.attributes.hp.value`（用于检查更新是否包含对指定过滤器字段的更新，你也可以用 `system.attributes.hp`来响应任何 hp 更新）
- **flagName**: `Warding Bond`
- **macroName**: `ItemMacro`
- **origin**: `Actor.DMTSWfQs8whM5FtE.Item.fR2J4Ulo0GftObGd`
- **sourceActorUuid**: `Actor.DMTSWfQs8whM5FtE`
- **sourceTokenUuid**: `Scene.XRSav5mOrp1iEC7S.Token.n3mchcs4aaeokawb`
- **targetTokenUuid**: `Scene.XRSav5mOrp1iEC7S.Token.jg2mxFc21dO1q7Qi`

本质上，这允许你**链接**两个角色，并且如果你指定要调用的宏，则可以响应任一/两者的更改来管理共享状态。

#### **响应双方的更改**

要响应双方的更改，你需要在效果中有两个更改：

```Plain Text
flags.dae.onUpdateTarget | 自定义 | Actor Link, ItemMacro
flags.dae.onUpdateSource | 自定义 | Actor Link, ItemMacro
```

这将在目标角色和来源角色上各创建一个效果。`ItemMacro` 指的是导致效果被创建的物品上的物品宏。

#### **不使用宏**

如果没有指定宏，则只会在目标（来源）角色上记录来源和目标之间的链接。这允许你在其他宏中检查链接，例如，在伤害加值宏中检查**猎人印记**或类似效果。

#### **使用宏**

如果指定了宏，那么每当目标角色被更新时，宏都会被调用，`lastArg` 被适当设置。

| **属性** | **值** | **详情** |
|-|-|-|
| `effectId` | `null` |  |
| `origin` | `onUpdate.origin` | 来源（物品或角色）的 uuid |
| `efData` | `null` |  |
| `actorId` | `targetActor.id` | onUpdate 数据中目标角色的 id |
| `actorUuid` | `targetActor.uuid` | onUpdate 数据中目标角色的 uuid |
| `tokenId` | `null` |  |
| `tokenUuid` | `null` |  |
| `actor` | `this` | 触发宏的 `actor.update` 中引用的角色 |
| `updates` |  | 对角色的更新（你可以更改这些以改变应用于角色的更新） |
| `options` |  | 传递给更新的选项 |
| `user` |  | 触发更新的用户 |
| `sourceActor` |  | `sourceActorUuid` 中引用的角色 |
| `sourceToken` |  | `sourceTokenUuid` 中引用的token |
| `targetActor` |  | `targetTokenUuid` 中引用的角色 |
| `targetToken` |  | `targetTokenUuid` 中引用的token |
| `originItem` |  | 导致 `flags.dae.onUpdateTarget`/`Source` 被创建的物品。 |

#### **应用示例**

- **猎人印记**：这使得像猎人印记这样的效果更简单，因为你只需链接角色，并有一个检查角色`onUpdate`效果的伤害加值宏。在 midi 示例物品合集中有一个新的猎人印记示例，它使用这些功能来实现猎人印记。
- **守护之链**：midi 示例物品包含了一个守护之链的实现，当目标受到伤害时会对施法者造成伤害。它不检查与目标的距离。
- **伤害分担**：你现在可以实现像两个角色之间分担伤害这样的功能，通过让宏（在preUpdateActor调用中运行）修改正在应用的伤害并应用伤害。请参见示例物品（在 midi 示例物品合集中）简单的守护之链/守护之链。

#### **注意事项**

简单的守护之链在目标和简单的守护之链角色身上都创建效果，并有一个在两名角色之间分担所受伤害的物品宏。请注意，你的宏必须做些什么来停止每个角色被更新并触发另一个宏调用的更新。你可以通过指定 `actor.update(updates, {onUpdateCalled: true})` 来实现，这将停止调用链。（很明显的，如果不这么做，将进入不会停止的死循环）。

---

### `flags.dae.deleteOrigin`

`flags.dae.deleteOrigin`，如果作为更改存在于主动效果中，则当效果从角色身上删除时，将尝试删除效果来源指向的物品。更改值无关紧要。只会删除角色（任何角色）拥有的物品，不会删除世界物品或合集物品，对于你希望保留直到它们创建的效果过期的一次性物品很有用。

---

### `flags.dae.deleteUuid`

当具有更改 `flags.dae.deleteUuid` 的主动效果被删除时，如果其`change.value`是一个物品的 uuid、token uuid 或主动效果uuid，则将删除该 uuid 指向的实体。仅支持token/拥有物品/主动效果。这对于在角色身上创建临时物品并在效果过期时需要移除的法术/特性很有用。但是，为什么不用`macro.createItem`呢？



# DAE宏

`macro.itemMacro` 与 `macro.execute` 以及`macro.activityMacro` 允许在效果创建/删除时执行宏，在安装[**Times Up**](https://foundryvtt.com/packages/times-up/)后，你可以通过**宏重复**来让宏在每回合开始/结束执行，同时，你可以在更改值中向args中传入参数以方便你在宏中引用。语法如下：

```JavaScript
macro.execute "宏名称" 参数
macro.ItemMacro 参数
```

宏参数在效果应用到目标角色时评估，即在物品掷骰时。@字段指的是使用物品的角色 - 例如`@abilities.str.mod`是物品使用者的力量调整值。

除了标准的`@values`外，以下也支持（仅作为宏参数）：

- `@target` 将传递目标token的token id，仅限主动效果。
- `@targetUuid` 将传递目标token的 Uuid，仅限主动效果。
- `@scene` 将传递激活效果的用户所在场景的场景 id。
- `@item` 将传递激活中使用的物品的物品数据。
- `@spellLevel` 如果使用 Midi-QOL，这将是施放法术的法术环阶。这是首选的字段。
- `@item.level` 如果使用 Midi-QOL，这将是施放法术的法术环阶。
- `@damage` 攻击掷骰的总伤害值。
- `@token` 使用物品的token的 id。
- `@tokenUuid` 使用物品的token的 uuid。
- `@actor` 使用物品的角色的<cite doc-id="PxmxwHtBniay5LkIH7nce8LunGh" file-type="wiki" title="掷骰数据" type="doc"></cite>。
- `@actorUuid` 使用物品的角色的 uuid。
- `@FIELD` 使用物品的角色中 FIELD 的值，例如 `@abilities.str.mod`。
- `@unique` 随机生成的唯一 id。
- `##field` `##` 表示参数将不会使用来源值评估，而是在应用到目标时替换为`@field`；并且当调用宏时，将使用应用了效果的角色的值进行评估。

默认情况下，DAE宏会在效果创建和效果删除时都执行一次，如果你启用了宏重复，在你选定的时点宏也会自动执行。你可以通过`if(args[0] == 'on/each/off'){}`来让宏在不同的时点执行不同的效果，`args[0] == 'on'`为效果创建时，`args[0] == 'off'`为效果删除时，`args[0] == 'each'`为你在宏重复时选择的时点。

---

### lastArg

在某些情况下（当宏被调用时 `args[0] === "off"` 或 `args[0] === "each"`），标准的角色和token变量将不会被初始化。所以在宏内部你不能做actor.anything。要以一种总是有效的方式访问角色/token，有一个额外的参数（在 `macro.execute` 定义中指定的那些之外）lastArg，它包含了很多用于执行宏的信息。你可以通过 `let lastArg = args[args.length-1]` 访问 lastArg。lastArg 总是至少包含：

- **effectId**：被触发的效果的 id
- **origin**: 被触发的效果的来源（使用 `fromUuidSync(lastArg.origin)` - 通常是一个物品。
- **efData**：被触发的效果的效果数据。
- **actorId**：效果存在的角色的 id。
- **actorUuid**：角色的 uuid，可以通过以下方式获取：

```JavaScript
let tokenOrActor = fromUuidSync(lastArg.actorUuid);
let actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor
```

- **tokenId**：效果存在的token的 id，通过 `canvas.scene.tokens.get(lastArg.tokenId)` 获取。
- **tokenUuid**：效果存在的token的 uuid，通过 `fromUuidSync(lastArg.tokenUuid)` 获取。

通常，在获取角色/token时优先使用 uuid，因为它总是有效并能避免问题。

例如，如果 `macro.execute` 的定义是 `macro.execute CUSTOM "我的宏" 5 @abilities.str.mod`，那么当效果转移到目标token时，宏将被调用，`args = ["on", <使用物品的角色的力量调整值>, lastArg]`  
当效果从目标角色删除时（无论是过期还是显式删除），宏将再次被调用，`args = ["off", <使用物品的角色的力量调整值>, lastArg]`

---

# 可能有用的API