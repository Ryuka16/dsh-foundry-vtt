<title>Overtime使用说明</title>

# 推荐观看

<readonly-block href="https://player.bilibili.com/player.html?bvid=1kUYkzxEt1&amp;share_source=copy_web&amp;vd_source=85d1ba3ac08e6f1597e74e590f6eccc4" type="iframe"></readonly-block>

视频录制时为旧版Overtime效果，但配置原理基本一致，建议配合使用。

---

# 什么是Overtime？

用于随时间变化的伤害效果（例如回合开始/结束时豁免并受到伤害等）或使用动作进行检定来挣脱某项效应。这是不使用行动系统创建Overtime效果的基于标志的方法。

与行动系统不同，使用`flags.midi-qol.OverTime`也可以实现石化术/疫病术这种豁免计数类效果。

**`flags.midi-qol.OverTime——“覆盖”或”自定义”——特殊表达式`**

其中，**特殊表达式**是以逗号分隔的字段列表。

关于使用@来调用哪个目标字段（如施法者的豁免DC还是目标的当前生命值），请详细查看末尾`Overtime使用@fields（字段）`介绍。

---

# **Overtime语法**

 参数是由逗号`,`分隔的 `key`` ``=`` ``value` 键值对，你也可以使用 `#` 作为分隔符。

overtime前面的`key`需要严格按照给定的来，如applyCondition不能写为ApplyCondition或applycondition；

```Plain Text
turn=start/end, 
damageRoll=公式, 
damageType=类型, 
saveDC=数值, 
saveAbility=属性, 
label="名称"
```

---

## 核心参数

| **参数** | **描述** | **默认值** |
|-|-|-|
| `turn` | 角色回合开始或结束时触发：`start` 或 `end` | `start`（回合开始） |
| `label` / `name` | 效果的显示名称（名称包含空格时使用引号） | 效果名称 |
| `applyCondition` / `condition` | Overtime效果处理/触发必须为真的条件表达式。  <br/>例如，`applyCondition=@attributes.hp.value > 0 && ##attributes.hp.value < ##attributes.hp.max`用于**再生**。 | - |

---

## 伤害参数

| **参数** | **描述** | **默认值** |
|-|-|-|
| `damageRoll` | 伤害掷骰公式。例如 `2d6`，`1d8+@abilities.con.mod` | - |
| `damageType` | 伤害类型：火焰、冷冻、毒素、暗蚀等**（需要输入英文，如piercing）**。  <br/>可以指定 "**healing**"（治疗）或 "**temphp**"（临时生命）来应用治疗或临时生命。临时生命只有在掷骰的临时生命值大于现有临时生命值时才会应用。 | 无类型 |
| `damageBeforeSave` | `true`表示伤害会在豁免检定之前施加（如**血光剑**）。`false`表示只有在豁免失败时才会施加伤害。 | `false` |
| `saveDamage` | 豁免成功后，受到的伤害：`nodamage`（无伤），`halfdamage`（半伤），`fulldamage`（全伤） | `nodamage` |

---

## 豁免/检定参数

| **参数** | **描述** | **默认值** |
|-|-|-|
| `saveDC` | 豁免DC，支持@字段表达式，如`@attributes.spell.dc`为法术豁免DC。 | - |
| `saveAbility` | 属性：力量/敏捷/体质/智力/感知/魅力**（需要注意使用的是缩写如slt/acr/ani/arc）**。  <br/>使用 `\|` 表示多个可选选项，例如 `con\|wis`代表允许使用体质或感知属性进行检定。 | - |
| `rollType` | 掷骰类型：`save`（豁免检定），`check`（属性检定），或 `skill`（技能检定） | `save`（如果设置了 saveAbility） |
| `saveMagic` | 就魔法抗性（需要midi设置`魔法抗性`效果）而言，该豁免检定被视为 "魔法豁免检定"。 | `false` |
| `saveRemove` | `true/false` - 豁免成功则移除效果。  <br/>V14正式弃用，使用 `saveCount=1-`代替 | `true` |

---

## 成功/失败计数参数

<callout emoji="❗">
当你想要实现再生这种不会因为豁免移除的效果时，无需设置计数参数。
</callout>

根据累计豁免成功或失败的次数来控制效果移除或永久化：

| **参数** | **描述** | **默认值** |
|-|-|-|
| `saveCount` | `N[-+]effectSpec` - N 次成功豁免后的行为 | - |
| `failCount` | `N[-+]effectSpec` - N 次失败豁免后的行为 | - |

**语法：** 

`saveCount=N[-+]effectSpec` 或 `failCount=N[-+]effectSpec`

- **N：**触发动作所需的成功/失败豁免次数
- **-**（减号）**：**达到计数时移除该Overtime效果
- **+**（加号）**：**使该Overtime效果永久化（不再进行豁免检定）
- **effectSpec**（可选）**：**达到计数时添加到角色身上的效果/状态

**effectSpec选项：**

- `statusId`：应用一个状态效果，例如 `petrified`（石化），`prone`（倒地），`stunned`（震慑）
- `statusId|overlay`：应用状态作为Token覆盖层
- `effectUuid`：通过主动效果 UUID 应用效果
- `function.函数名`：调用一个全局函数
- `Macro.宏名`：按名称执行一个世界宏
- `ItemMacro`：执行创建此效果物品上的宏
- `ItemMacro.物品名或UUID`：执行特定物品的宏
- `ActivityMacro`：执行创建此效果行动上的宏
- `ActivityMacro.uuid`：执行特定行动的宏

**示例：**

```Plain Text
saveCount=3-           # 3次成功豁免后移除效果
failCount=2+           # 2次失败豁免后永久化（不再进行豁免）
failCount=3-petrified  # 3次失败后：添加石化状态并移除效果
failCount=3+stunned    # 3次失败后：添加震慑状态并永久化
saveCount=2-prone      # 2次成功后：添加倒地状态并移除效果
```

**注意：**

- 当指定了 `saveCount` 或 `failCount` 时，`saveRemove=true` 将被忽略；
- effectSpec 总是**添加**到角色身上（它不会替换掉Overtime效果）；
- 对于永久效果，可以结合使用 `removeCondition` 来允许后续移除。

---

## 动作豁免参数

用于需要玩家使用动作尝试豁免的效果（例如挣脱擒抱）：

| **参数** | **描述** | 默认值 |
|-|-|-|
| `actionSave` | 有相当多的效果需要目标使用动作来尝试对效果进行豁免。此参数意味着不会自动掷出豁免，而是等待轮到角色的回合时掷出适当的检定。这样就可以支持 "**角色可以使用其动作来对效果进行豁免检定/属性检定**"。  <br/>`dialog`：弹出对话框提示玩家使用动作  <br/>`roll`：玩家通过聊天卡片手动掷骰 | - |

当 `actionSave=dialog` 时：在回合开始时提示玩家使用动作进行豁免。

当 `actionSave=roll` 时：在回合开始时创建聊天卡片，玩家在使用其动作时点击进行掷骰。

---

## 显示参数

| **参数** | **描述** | **默认值** |
|-|-|-|
| `chatFlavor` | 聊天消息的附加说明文本 | - |
| `rollMode` | 掷骰可见性：`publicroll`（公开），`gmroll`（暗骰），`blindroll`（盲掷），`selfroll`（自骰） | - |
| `actionType` | 物品动作类型（用于显示）：近战武器攻击（`mwak`），远程武器攻击（`rwak`），近战法术攻击（`msak`），远程法术攻击（`rsak`），其他（`other`） | `other` |

---

## 高级参数

| **参数** | **描述** | **默认值** |
|-|-|-|
| `removeCondition` | 条件表达式。如果为真，则移除效果 | - |
| `itemName` | 用作Overtime效果掷骰模板的物品的 UUID 或名称。  <br/>可以使用物品特有的flags，描述，宏（未测试）等，但实际行动的效果会被替换 | - |
| `macro` | 在Overtime效果处理期间调用的宏（见下文宏选项） | - |
| `killAnim` | `true/false`，抑制 Sequencer 动画 | `false` |
| `allowIncapacitated` | `true/false`，如果为true，即使具有该效果的token陷入**失能**，也允许进行物品掷骰，这对**律令震慑**等效果非常有用。 | `true` |
| `fastForwardDamage` | `true/false`，跳过伤害对话框 | - |
| `fastForwardAttack` | `true/false`，跳过攻击对话框，实际来说并没有用，overtime效果暂不支持攻击行为。 | - |

**宏选项：**

`macro` 参数支持以下格式：

- `function.函数名`：调用一个全局函数，例如 `function.MidiQOL.doOverTimeDamage`
- `ItemMacro`：执行创建此效果物品上的宏
- `ItemMacro.物品名或UUID`：按名称或 UUID 执行特定物品的宏
- `ActivityMacro`：执行创建此效果行动上的宏
- `ActivityMacro.uuid`：按 UUID 执行特定行动的宏
- `Macro.宏名`：按名称执行一个世界宏

---

# **Overtime提示和技巧**

- 如果该效果可叠加，假设叠加次数为 2 ，则伤害将变为（对于**血光剑**等物品）累计后的伤害。**Overtime示例——血光剑`damageRoll=3d6`** //基础伤害为 3d6，之后叠加 1 次变为 **3d6 + 3d6**
- 同一个效果上可以存在多个OverTime标志。使用不同的`key`，如 `flags.midi-qol.OverTime.burn` 和 `flags.midi-qol.OverTime.poison`
- `itemName`参数可以通过 UUID 或名称引用物品。先搜索角色物品，再搜索世界物品。
- 对于基于行动的Overtime效果（建议 v13+ 使用），请阅读<cite doc-id="W4XwwpanniR5ZYkFnCkcgJ1jnLf" file-type="wiki" title="OvertimeActivity使用说明" type="doc"></cite>

---

# **Overtime使用@fields**

如果你是通过使用物品来施加效果，**@fields**就会变得模棱两可，它们应该指施法者还是目标？两种解释都有理由。

- 当Overtime效果是`非转移效果`时（即作为施加于目标的效应而不是作用于物品拥有者身上的被动效应时） **@字段**默认基于施法者的掷骰数据评估，你可以使用##代替@来引用目标的掷骰数据；

**下面是一个例子，如果我为武器添加以下效果，那么当武器命中目标时，效果就会作用于目标：**

`applyCondition=@attributes.hp.value > 50`

`applyCondition=##attributes.hp.value < 50`

这会在目标身上产生效果，假设攻击者有 75 点生命值，被攻击者生命值有 20 点生命值：

`applyCondition = 75 > 50 //应用了攻击者的生命值进行判断，结果为true`

`applyCondition=20 < 50 //应用了被攻击者的生命值（@attributes.hp.value）进行判断，结果为true`

---

# **Overtime示例**

**简单燃烧（每回合伤害，豁免成功则结束）：**

```Plain Text
turn=end,
damageRoll=1d6, 
damageType=fire, 
saveDC=12, 
saveAbility=dex, 
saveCount=1-, 
label="燃烧"
```

**中毒（伤害 + 豁免，豁免成功则伤害减半）：**

```Plain Text
turn=start, 
damageRoll=2d6, 
damageType=poison, 
saveDC=14, 
saveAbility=con, 
saveDamage=halfdamage, 
saveCount=1-, 
label="中毒"
```

**再生（治疗，无需豁免，仅在受伤时生效）：**

```Plain Text
turn=start, 
damageRoll=2d6, 
damageType=healing, 
applyCondition=##attributes.hp.value < ##attributes.hp.max, 
label="再生"
```

**人类定身术（需使用动作豁免，回合结束时豁免）：**

```Plain Text
turn=end, 
saveDC=@attributes.spell.dc, 
saveAbility=wis, 
saveCount=1-, 
actionSave=roll, 
label="人类定身术"
```

**带条件的伤害（仅在生命值低于最大值时生效）：**

```Plain Text
turn=start, 
damageRoll=1d6, 
damageType=necrotic, 
applyCondition=##attributes.hp.value < ##attributes.hp.max, 
label="持续伤口"
```

**挣脱擒抱（动作豁免，力量或敏捷二选一）：**

```Plain Text
turn=start, 
saveDC=14, 
saveAbility=str|dex, 
rollType=check, 
actionSave=dialog, 
saveCount=1-, 
label="被擒抱"
```

**石化术（豁免失败2次 = 石化）：**

```Plain Text
turn=end, 
saveDC=@attributes.spell.dc, 
saveAbility=con, 
saveCount=2-, 
failCount=3-petrified, 
label="血肉化为石头"
```

豁免失败2次后，目标石化且效果结束。豁免成功3次后，效果直接结束。

**疫病术（豁免失败3次 = 永久疾病）：**

```Plain Text
turn=end, 
saveDC=@attributes.spell.dc, 
saveAbility=con, 
saveCount=3-, 
failCount=3+, 
damageRoll=2d6, 
damageType=poison, 
label="疫病术"
```

豁免失败3次后，疾病变为永久（不再进行豁免）。豁免成功3次后，效果结束。

**渐进诅咒（永久化，可通过 removeCondition 条件逃脱）：**

```Plain Text
turn=end, 
saveDC=15, 
saveAbility=wis, 
failCount=2+, 
removeCondition=##attributes.hp.value < 2, 
label="蔓延诅咒"
```

豁免失败2次后，变为永久。仅当生命值低于2时（或通过其他方法如移除诅咒）才能被移除。

---

# 快速编辑Overtime

Midi v13.0.43及以上内置了overtime快速编辑器，你需要启用DAE并确保其版本为13.0.19及以上。

当你向一个效果添加了一个键为`flags.midi-qol.Overtime`的更改之后，会在值输入框的下方出现图中框住的图标

![图片展示了Midi v13.0.43及以上版本中，向法术添加`flags.midi-qol.Overtime`更改后的界面。在数值输入框下方，有一个被红色框突出显示的图标。该图标是Midi内置的Overtime快速编辑器的入口，当向法术添加了键为`flags.midi-qol.Overtime`的更改后，点击此图标即可打开Overtime快速编辑器，进行相关设置。此图与上文介绍的Overtime快速编辑功能相呼应，直观呈现了操作入口位置。](https://feishu.cn/file/BW2KbYnsOoT70uxI4zicu17Anzh)

点击它，你就可以打开midi内置的Overtime快速编辑器

![图片展示的是Midi v13.0.43及以上内置的Overtime快速编辑器界面。界面上方显示“OverTime编辑: 新 法术”。编辑器包含时机、掷骰配置、伤害、条件、高级等板块。其中，时机板块有标签和回合设置；掷骰配置板块有掷骰类型和伤害掷骰设置；伤害板块有伤害类型设置；条件板块有应用条件和移除条件；高级板块有自动攻击检定、快速攻击、自动伤害掷骰、快速伤害等选项。该图片与文档中介绍Overtime快速编辑器的内容相关，直观呈现了编辑器界面。](https://feishu.cn/file/UtRRbhJJZoCHG0xcY3oc09q5nqd)

---

# **扩展—CPR配置Overtime**

借助[CPR](https://foundryvtt.com/packages/chris-premades)（<cite doc-id="QRDAwvmuhitZ8RkFyB5cwoHWnJx" file-type="wiki" title="CPR宇宙使用指南" type="doc"></cite>），我们可以快速配置Overtime，而无需自己去输入字段

1.找到需要配置的效果，以**人类定身术**为例。

![图片展示的是《D&D 5E》扩展 - CPR配置Overtime中的“人类定身术”配置界面。界面上方有“细节”“时长”“更改”“光环”四个选项卡，当前选中“更改”选项卡。下方表格中显示“属性名”为“MEI”，“改变方式”“属性值”“优先级”等字段为空。界面底部有“提交变更”按钮。该图片与文档中介绍Overtime配置步骤的内容相关，展示了配置页面的样式及部分字段情况。](https://feishu.cn/file/UvOWbcgRyoJZDVxMF7EcyJglnzb)

2.点击右上角的`医疗箱`

![图片展示了《地下城与勇士》中“人类定身术”的配置界面。界面上方有“医疗箱”图标，右上角有红色箭头指向该图标。界面中部显示“人类定身术”名称，下方有“细节”“时长”“更改”“光环”四个标签，当前选中“更改”标签。在“更改”标签下，有“属性名”“改变方式”“属性值”“优先级”四个字段，其中“属性名”字段被红色框突出显示。该图片与文档中“扩展—CPR配置Overtime”部分内容相关，用于说明点击右上角“医疗箱”后进入的配置界面情况。](https://feishu.cn/file/KG2abb3MBo4d98xfbXGc6c5CnAh)

3.点击Overtime，然后再点击添加

![图片展示了在CPR配置Overtime时的操作界面。界面上方显示“Cauldron of Plentiful Resources Configuration: 人类定身术”。右侧有“医疗箱”图标，点击后可进入Overtime配置。下方有“配置”和“Overtime”选项，其中“Overtime”被红色箭头指向。下方还有“添加Overtime”按钮，同样被红色箭头指向。该图片与文档中“点击右上角的‘医疗箱’，点击Overtime，然后再点击添加”的操作步骤对应，直观呈现了操作位置。](https://feishu.cn/file/YpzqbP4qioRO4AxrBjtcx2x9nHb)

4.来到配置页面，依次开始配置，这里需要说明几点，字段完全就是和Overtime一致，但有个别翻译可能有些出入。

![图片展示的是《D&D 5E》游戏中的“人类定身术”配置界面。界面顶部显示“Cauldron of Plentiful Resources Configuration: 人类定身术”。参数部分包括触发条件、聊天描述、失能目标有效等，如触发条件为“回合结束时”，聊天描述为“人类定身术”。掷骰部分有掷骰类型、使用的技能或属性、豁免DC、豁免成功时受伤情况等设置，如掷骰类型为“豁免骰”，使用的技能或属性为“感知”，豁免DC为“施法方式DC”，豁免成功时受伤情况为“无伤”。最下方有“确认”按钮。该图与文档中CPR配置Overtime的上下文相关，展示了配置界面。](https://feishu.cn/file/VSQSbe3Erouy3BxasZwcIEr9nHf)

5.点击确认，可以发现自动给我们新增了属性

![图片展示的是Midi v13.0.37中人类定身术的配置界面。属性名显示为flags.midi-qot.OverTime，改变方式为自定义，属性值为“turn=end, name=人类定身术, allowIncapacitated=true, roll1=Type=save, saveAbility=wis, saveDC=15, roll2=Type=save, saveAbility=con, saveDC=15”。界面右下角有“提交变更”按钮。该图片与文档中旧版本迁移部分内容相关，用于说明Midi v13.0.37中对Overtime Effect更新后，实现类似石化术豁免成功/失败计数法术/特性自动化的配置情况。](https://feishu.cn/file/BbbkbjfbooFH3sxTL2OcAxeqnep)

6.提交变更，结束配置

---

# 旧版本迁移

Midi v13.0.37中对Overtime Effect进行了重大更新，允许我们实现类似于石化术这类要求豁免成功/豁免失败计数的法术/特性自动化，当然，语法也与旧版有所区别，旧版的语法在当前仍然适用，但是会在v14后移除兼容。你可以使用以下宏批量迁移原本旧合集包内的overtime物品以适配新版语法：

```JavaScript
const PACK_NAME = "world.Item-8TjMccWRz7rLmV8b"; // 例如 "dnd5e.items"
const KEY_TO_MATCH = "flags.midi-qol.OverTime";
async function updateCompendiumEffects() {
    const pack = game.packs.get(PACK_NAME);
    if (!pack) {
        ui.notifications.error(`找不到合集包: ${PACK_NAME}`);
        return;
    }
    // 获取所有 index 准备遍历
    const docs = await pack.getDocuments();
    let updatedCount = 0;
    ui.notifications.info(`正在处理合集包 ${PACK_NAME}...`);
    for (let item of docs) {
        let itemUpdates = [];
        let hasChanges = false;
        const effects = item.effects.toObject();
        for (let effect of effects) {
            let effectModified = false;
            effect.changes = effect.changes.map(change => {
                if (change.key === KEY_TO_MATCH) {
                    let val = change.value;                    
                    // 正则处理：允许 = 前后有空格
                    // 处理 saveRemove = true -> saveCount=1
                    if (val.match(/saveRemove\s*=\s*true/i)) {
                        val = val.replace(/saveRemove\s*=\s*true/gi, "saveCount=1-");
                        effectModified = true;
                    } 
                    // 处理 saveRemove = false -> 删除 (替换为空，后续清理)
                    else if (val.match(/saveRemove\s*=\s*false/i)) {
                        // 移除该片段，并处理可能残留的多余逗号
                        val = val.replace(/saveRemove\s*=\s*false/gi, "").replace(/,+/g, ",").replace(/^,|,$/g, "");
                        effectModified = true;
                    }                  
                    change.value = val;
                }
                return change;
            });
            if (effectModified) {
                hasChanges = true;
            }
        }
        if (hasChanges) {
            // 将修改后的 effects 数组写回
            await item.update({ effects: effects });
            updatedCount++;
        }
    }
    ui.notifications.info(`处理完成！共更新了 ${updatedCount} 个物品。`);
}
updateCompendiumEffects();
```

<callout emoji="❗">
更新前确保合集包已解锁，并做好备份。
</callout>

---

对于世界内物品和世界内角色身上的物品，采用以下宏迁移：

```JavaScript
const KEY_TO_MATCH = "flags.midi-qol.OverTime";
async function updateWorldItemsAndActorItems() {
    let updatedItemsCount = 0;
    const worldItems = game.items.contents;
    const actorItems = game.actors.reduce((acc, actor) => {
        return acc.concat(actor.items.contents);
    }, []);
    const allItems = [...worldItems, ...actorItems];
    ui.notifications.info(`正在扫描世界内的 ${allItems.length} 个物品...`);
    for (let item of allItems) {
        const effects = item.effects.toObject();
        let itemModified = false;
        for (let effect of effects) {
            let effectModified = false;
            effect.changes = effect.changes.map(change => {
                if (change.key === KEY_TO_MATCH) {
                    let val = change.value || "";
                    if (val.match(/saveRemove\s*=\s*true/i)) {
                        val = val.replace(/saveRemove\s*=\s*true/gi, "saveCount=1-");
                        effectModified = true;
                    } 
                    else if (val.match(/saveRemove\s*=\s*false/i)) {
                        val = val.replace(/saveRemove\s*=\s*false/gi, "")
                                 .replace(/,+/g, ",")
                                 .replace(/^,|,$/g, "")
                                 .trim();
                        effectModified = true;
                    }                    
                    change.value = val;
                }
                return change;
            });
            if (effectModified) {
                itemModified = true;
            }
        }
        if (itemModified) {
            // 更新该物品
            await item.update({ effects: effects });
            updatedItemsCount++;
        }
    }
    ui.notifications.info(`处理完成！共更新了世界内 ${updatedItemsCount} 个物品。`);
}
updateWorldItemsAndActorItems();
```

---