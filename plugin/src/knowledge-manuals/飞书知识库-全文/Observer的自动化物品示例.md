<title>Observer的自动化物品示例</title>

本文档预计提供一些自动化示例——他们可能基础也可能复杂，你可以根据他们（如果有所帮助的话）来制作你的自动化

# 力竭

由于DAE自带的叠加型效果无法堆叠**力竭**层数，因此，为了实现当“**豁免失败时，目标的力竭等级+1**”的效果需要使用宏

```JavaScript
for (const token of workflow.failedSaves) {    //迭代workflow.failedSaves中的token，即所有豁免失败目标
  const actor = token.actor;
  const currentExhaustion = actor.system.attributes?.exhaustion ?? 0;
  const newExhaustion = Math.min(currentExhaustion + 1, 6); 
  actor.update({
    "system.attributes.exhaustion": newExhaustion
  });
}
```

使用方法是将其放入物品的`DIME`中，并在标题栏省略号下的midi-qol中绑定物品`DIME`，`macroPass`为`在动态效果应用后`

![图片展示了Midi-QOL插件中物品调用宏的设置界面。左侧有“物品DIME” 自动生成纠错](https://feishu.cn/file/Rz49bBulgomm5fxaFQ7cqesVn3f)

当然，还有一种可以将**力竭**与你的效应绑定的方法，只需在效应的修改中写入

```JavaScript
macro.actorUpdate | Custom | @targetUuid number "+1" system.attributes.exhaustion remove
```

即可，如下图

![图片展示了Midi-QOL插件中“更新角色字段”属性的设置界面。属性名为“macro.actorUpdate”，改变方式为自定义，数值为“@targetUuid number ”+1” system.attributes.exhaustion remove”，优先级为20。该图片与文档中介绍力竭自动化示例的内容相关，用于说明在Midi-QOL中将力竭与效应绑定的方法，即在效应修改中写入特定代码，此代码即为图片中展示的代码内容。](https://feishu.cn/file/MPzGbtDbBorNw7x7GLUcIMQ1nhh)

此外，如果你想让你的效果可以叠加，最好在dae的叠加选项中**选择`效果可多次叠加`而不是`增加计数`**



# 魔法物品类

魔法物品是一个不错的示例，他们往往会包含被动效果/特殊的主动行动

## 王座之旨武器

![图片展示了王座之旨武器Weapon of Throne's Command的详细信息。该武器为任意类型，极珍稀且需同调。使用时攻击检定和伤害掷骰+1。此外，获得威吓和游说中未熟练项技能的熟练。施法方面，有5发充能，可附赠动作并花费1发或多发充能施展命令术、诚实之域等法术，每天黎明时恢复1d4发已消耗的充能。此图与上下文介绍王座之旨武器的内容紧密相关，是对该武器具体属性的详细说明。](https://feishu.cn/file/LyPkbMqIpoYEl8x6GZocyJu0nRd)

我们只介绍武器基底为`长剑`的情况，首先，新建一个装备物品，在物品的详情页配置好基础武器为`长剑`，并在武器属性里勾选`多用`和`魔法`。在接下来的`魔法`中选择`需同调`，并在魔法加值中填入`1`。

![图片展示的是《D&D 5E 角色扮演》中物品创建界面中武器详情部分。武器类型为军用近战，基础武器为长剑 Longsword，熟练等级为自动化，精通为多用、魔法。在魔法属性中，需同调选项被勾选，加值为1。该图片与上下文紧密相关，上下文提到接下来按照长剑的属性填充伤害、射程和充能，此图展示了基础武器等关键属性设置，是物品创建过程中基础属性配置的直观呈现。](https://feishu.cn/file/D7ELbfQRco7l79xaw5Ic6ASynEd)

接下来按照`长剑`的属性填充伤害，`射程`和`充能`

![图片展示 addCriterion“魔法物品类”后，按照上下文提示，需对“长剑”属性进行填充。图片展示的是物品属性编辑界面，其中“伤害”部分被突出显示。伤害公式为“d6”，类型为“单体”，多用公式为“d10”，可用次数消耗为0，最大值为5，恢复周期为“黎明”，恢复方式为“自定义公式”，公式为“1d4”。该图片与上下文紧密相关，直观呈现了“长剑”伤害属性的设置情况。](https://feishu.cn/file/OT3HbLWQSolTTOxOwhncdubFnTp)

第二步，创建被动效果“**此外，你获得威吓和游说两个技能中你没有熟练项技能的熟练。**”，打开物品的效应选项卡，点击右下角的＋号新建一个效应，然后右键新建的效应进入编辑界面

![图片展示的是物品编辑界面中“失效效应”选项卡下的内容。上方有搜索框，可输入“失效效应”进行搜索。下方列表中显示“王座之旨长剑”作为失效效应，来源也是“王座之旨长剑”，右侧有编辑、删除和更多操作按钮。该图片与上下文关系紧密，上下文提到在物品的效应选项卡新建一个效应后，需进入“修改”选项卡进行相关配置，此图直观呈现了失效效应的展示情况，辅助理解物品编辑操作。](https://feishu.cn/file/E1PYb1JgNor7TkxC5rAcdn93nOf)

由于我们是在此处的＋号处创建的效应，因此其`将效果应用至角色`默认为真，我们只需要进入`修改`选项卡，输入如下两条修改

![图片展示的是魔法物品效应编辑界面中的修改选项卡内容。其中有两条修改信息，第一条是对“system.skills.itm.value”属性，以“加”的改变方式，加上“Proficient”，数值为20，对应“威吓熟练度”；第二条是对“system.skills.per.value”属性，同样以“加”的改变方式，加上“Proficient”，数值为20，对应“游说熟练度”。此图与上文提到的在效应编辑界面的修改选项卡中输入两条修改的内容相匹配。](https://feishu.cn/file/W6qhbzPSdowQYdxOYTWcc5E1nDh)

**接下来我们完成魔法物品的施法特性：**

这一步对于dnd v4以上的系统是极为简单的，你只需要将合集包内的法术直接拖入物品的行动组合标签卡内，系统会自动为你生成施法行动，你只需要配置施法行动中的`法术`标签卡和`激活—>消耗`标签卡，使其与物品描述相匹配

![图片展示的是《D&D 5E》魔法物品中“命令术 Command”法术的编辑界面。界面中“施法属性”为“施法方式”，“施法环阶”为1环，无视词条为空，覆盖数值勾选，攻击加值和豁免DC未填写。该图片与上下文紧密相关，上下文提到在魔法物品的施法特性编辑中，只需配置施法行动中的“法术”和“激活—>消耗”标签卡，此图直观呈现了“命令术”法术的编辑设置情况，帮助理解配置步骤。](https://feishu.cn/file/PmXxbBdhGoZu8BxQYGecNEx5nlf)

![图片展示的是魔法物品的施法特性编辑界面。在“激活”选项卡下，有“时间”“消耗”“目标”等设置项，其中“消耗”标签被选中。在“消耗”标签内，“类型”下拉菜单选中“物品使用次数”，“数量”输入框显示数字1。该图片与文档中介绍魔法物品施法特性的内容相关，直观呈现了在合集包内法术拖入物品行动组合标签卡后，配置施法行动中“激活—>消耗”标签卡的操作界面。](https://feishu.cn/file/M1J4b4S7Xo0SkmxPsOpcf6THnAm)



# 光环类：

光环类的自动化主要依赖于以下四种途径

- **Active Aura ：**祖宗之法，适用于FVTT v12版本及以下，当然v13也能用，性能优化较差，支持**沉默术**之类的区域性效应
- **Aura Effects ：**v13新增的光环mod，支持可视化光环范围，性能优化比Active Aura强，但不支持**沉默术**之类的区域性效应
- **CPR ：**如果你的光环不需要太过复杂的逻辑，不需要使用CPR的光环，其需要一定的宏基础，且性能优化也是最差的
- **AC5e ：**使用情况有所局限的光环，性能优化最好

需要注意的是，在v14之后，由于区域和测量版的更改，这些光环mod**或许**将不再需要。

## 守护灵光

圣武士的守护灵光使用AC5e的光环最佳，你只需要在**守护灵光**的修改中插入以下即可

![图片展示的是FVTT中圣武士守护灵光的动态效果设置界面。在“修改”选项卡下，属性名为“](https://feishu.cn/file/SySFb3niGoLjb2xZ0upcLsaEngb)

其中`(auraActor.details.level < 18 ? 10 : 30)`是三元运算符，表示评估条件`auraActor.details.level < 18`若满足则返回10，不满足则返回30



## 再生光环

以如下私设为例：

> **愈疗曲**
> 
> 你的灵光（10尺半径）会治愈盟友。只要乐曲持续，当盟友在你的灵光范围内开始其回合时，将恢复1d4点生命值。

这是一个overtime效果，因此AC5e不能实现这一效应，我们需要aura effect或者active aura，以aura effect为例，你首先需要在效果的详情页点击`转化为光环`，然后在修改中插入如下overtime效果

![图片展示了在D&D数字表格中创建Over Time效果的界面。左侧显示效果名称“flags.midi-qol.OverTime”，右侧有“自定义”下拉菜单，旁边是数字“20”和垃圾桶图标。右侧弹出窗口详细列出Over Time效果参数，包括“turn=start”“allowIncapacitated=true”等，还显示了“damageRoll=1d4”“damageType=healing”“rollMode=publicroll”等具体设置。该图片与文档中介绍光环类效果，需在效果详情页点击“转化为光环”后修改的内容相关，展示了具体参数设置。](https://feishu.cn/file/XghNb1piDoXHG1xBRFHcsn1znbf)

然后在光环标签页内作如下修改

![图片展示的是Token效果中光环标签页的设置界面。其中“距离”设置为10；“作用于自身”选项已勾选；“阵营”下拉菜单选为“友善”；“效果名称”为“愈疗曲”；“光环可叠加”选项未勾选；“最佳公式”区域为空白。该图片与文档中介绍光环类效果的上下文相关，是对文档中提到的在光环标签页内作修改内容的直观呈现。](https://feishu.cn/file/Heorb49x0orkfix92aSck0IVnJc)

<callout emoji="❗">
注意：Active Aura和Aura Effects这类转移AE至符合条件的token上的光环不会随着源效应的更改而改变受影响token上的效应，如果你想使用宏来更新光环，应当删除原光环并创建新光环
</callout>



## 匕首之云类

这类光环的自动化略显复杂，而且刚需Active Aura，本质上来说，他们不是光环，而是**测量版效果**（当然你也可以用CPR的测量版效果，但是我没试过就是了）

首先，我们需要在法术的`DIME`中插入如下宏以调用Active Aura的`applyTemplate`函数，在物品的`DIME`中插入以下宏，设置`macroPass`为在`动态效果生效前`：

```JavaScript
if (args[0].macroPass === "preActiveEffects" || args[0].tag === "OnUse") {
  return await game.modules.get("ActiveAuras").api.AAHelpers.applyTemplate(args);
}
```

接下来新建一个名为**匕首之云**的宏，代码如下，此宏的目的是为了在效果创建的时候对被影响的token造成伤害：

```JavaScript
let lastArg = args[args.length-1]
if(args[0] == 'off') return;
const castLevel = args[1];
const OriginItem = await fromUuid(lastArg.origin);
const spellLevel = OriginItem.system.level;
const activityEntry = OriginItem.system.activities.contents.find(item => item.name === "OvertimeDamage");
const itemData = activityEntry.item.toObject();
if (castLevel > spellLevel) {foundry.utils.setProperty(itemData, "flags.dnd5e.scaling", castLevel - spellLevel);}
let itemActor = activityEntry.item?.actor;
foundry.utils.setProperty(itemData, "flags.midi-qol.syntheticItem", true);
const newItem = new CONFIG.Item.documentClass(itemData, { parent: itemActor });
newItem.prepareData();
if (newItem.system?.prepareFinalAttributes) {
  newItem.prepareFinalAttributes();
}
let overTimeActivity = newItem.system?.activities?.find(a => a.id === activityEntry.id);
const target = MidiQOL.actorFromUuid(lastArg.tokenUuid);
console.log(target)
const usage = {
  midiOptions: {
    targetUuids: [target.uuid],
    checkGMstatus: true,
    workflowOptions: {
      autoConsumeResource: "both",
      noProvokeReaction: true,
    }
  }
};
const dialog = {
  configure: false ,
};
const message = {
  create: true
};
const DamageWorkflow = await MidiQOL.completeActivityUse(overTimeActivity, usage, dialog, message);
```

接下来在**匕首之云**法术中新建两个行动，一个是`效用`，它用以放置测量版，在效用的效应标签页点击效应上的+号，创建一个新的`非转移效果`：

![图片展示了《D&D 5E》中“匕首之云Cloud of Daggers”法术的效用设置界面。在“应用效应”下拉框中选中“匕首之云Cloud of Daggers”，下方有“掷骰”区域，包含“掷骰标签”和“掷骰公式”输入框，以及“所有人可见”选项。该图片与上文介绍“匕首之云”法术效用的宏设置内容相关，直观呈现了宏在法术效用设置中的应用位置及界面样式。](https://feishu.cn/file/Z4PhbbT7co4Oy6xHBwVchDiBnub)

之后进入新建效应的编辑页，修改其持续时间与法术描述符合，并在修改标签页中插入以下键值

![图片展示的是《DnD5e》中“匕首之云Cloud of Daggers”法术的“修改”标签页。在“属性名”栏，有“flags.midi-qol.ActivityOverTime”和“flag.midi-qol.ActivityOverTime”两个属性，数值分别为“OvertimeDamage”和“20”。在“macro.execute”栏，数值为“匕首之云 @item.level 20”。该图片与文档中“匕首之云”法术的宏设置内容相关，是宏代码中插入的键值部分的展示，直观呈现了宏执行时的参数设置情况。](https://feishu.cn/file/C6opbEKDZo6wRXxNCC6cMbj1nTd)

其中`macro.execute`的值中**匕首之云**是你刚刚创建的宏名称，`@item.level`则是传入的参数，表示施法时法术的环阶。

接下来在Active Auras界面作如下修改：

![这张图片展示的是Active Auras界面的设置项内容，该设置是为匕首之云自动化配置的操作环节之一。界面内的设置项包括光环目标、名称覆盖、光环半径、检查阵营、检查生物类型、自定义检查等，其中“光环半径”设置为“按网格比例测量”，“检查生物类型”设置为“类人humanoid/野兽beast等”，“自定义检查”设置为“JavaScript”，“将主动效果图标应用于受影响的token”选项已被勾选，其余大部分设置项为未填入内容的状态。该界面的配置需与上下文提到的匕首之云自动化流程相匹配，是实现该效果自动化的关键设置步骤。](https://feishu.cn/file/Z1lQbi1y2oXzWzxpa1Hckggbnue)

![这是Active Auras界面的设置截图，对应文档中匕首之云自动化光环类物品配置的操作步骤。截图中显示了多项设置选项，“将主动效果图标应用于受影响的token”和“每回合只能触发一次光环”两项的右侧勾选框已被激活，“仅在当前生物的回合激活”选项的勾选框未被选中，“墙壁阻挡这一光环”的下拉选项设置为“使用模组默认”，“添加状态条件”也为下拉选项，相关设置用于完成匕首之云光环的自动化配置。](https://feishu.cn/file/N1nNb3RORokUZmx3Nwnc2RjOnxb)

之后再新建一个名为`OvertimeDamage`的行动，并修改其midi标签页的标识符与之匹配，此外还做以下修改：

![这张图片展示的是OvertimeDamage行动的编辑界面，是匕首之云自动化设置流程中的对应操作界面。界面顶部有“标识”“激活”“效应”“MIDI-QOL”等标签，当前处于“激活”标签页。该页面中，激活项已勾选，激活消耗显示为“无”，激活条件栏为空；持续时间项同样已勾选，时长设置为“立即”，还有“专注”选项，提示“生物必须维持专注来保持效应激活”，对应文档中新建OvertimeDamage行动并修改相关设置的操作步骤。](https://feishu.cn/file/V0fzbRMfXov7eqxd093c1GwqnDe)

![图片展示的是名为“OvertimeDamage”的法术行动的MIDI标签页。其中“消耗”标签被选中，显示“耗用法术位”选项，询问“使用此行动是否应耗用该法术的一个法术位？”，下方有“是”和“否”两个选项。该图片与文档中“匕首之云”法术自动化流程相关，是在介绍新建名为“OvertimeDamage”的行动时，对该行动在MIDI标签页中“消耗”设置的说明。](https://feishu.cn/file/IsVabWI5joviazxfzjccOlhinMs)



![图片展示的是在D&D 5E中使用Observer进行物品自动化时，对“OvertimeDamage”行动的设置界面。界面中“激活”标签页被选中，显示了射程为自身，特殊射程为空，覆盖目标为使用此目标数值而非物品数值，目标类型和形状为空等信息。该图片与上文在法术中新建“OvertimeDamage”行动并修改其midi标签页标识符相呼应，直观呈现了操作设置的具体内容。](https://feishu.cn/file/Kf3gb4PzBoOXmzxZ2cocFBZgnQh)

![图片展示了在Active Auras界面新建行动时，其midi标签页中标识符的设置界面。标识符处显示“OvertimeDamage”，下方有“行动的标识符”说明。该图片与上文在Active Auras界面作修改的内容相关，是在完成匕首之云法术自动化过程中，新建名为`OvertimeDamage`的行动后，在此界面进行标识符设置的步骤说明，以确保行动标识符与新建行动匹配。](https://feishu.cn/file/JQmwbqnoRoj4g6x76dkcYRkVnJe)

![图片展示的是《D&D 5E》中“OvertimeDamage”行动的MIDI标签页设置。其中“是Over Time”选项被勾选，表明该行动组合可以是一个Over Time行动；“回合选择”下拉菜单选中“回合开始或结束”；“豁免移除”选项未勾选；“行动前移除条件”和“行动后移除条件”均为空白；“行动宏”选项未勾选。该图片与上文在Active Auras界面新建“OvertimeDamage”行动后，对MIDI标签页进行相关设置的内容相呼应，是其操作步骤的呈现。](https://feishu.cn/file/V9eQbW6jjoeKacxnuIecC2Gcnpc)

那么匕首之云的自动化便完成了。

当然，不难发现，如果像是**沉默术**这样的在进入区域内自动应用效果而没有其他额外描述的法术，我们只需要在`DIME`中插入宏调用Active Aura的`applyTemplate`函数并配置光环即可。



# 检测光照的自动化

一般来说我们无法直接获取token的光照条件，因为这并非rolldata而是场景数据，为此只能通过cpr的`getLightLevel`函数写宏来实现，以下是一个“若攻击目标处于黑暗或微光光照下，则本次攻击获得优势”的宏，将其作为物品宏绑定于物品上，macroPass为preWaitForAttackRoll

```JavaScript
const target = workflow.targets.first();
const lightLevel = chrisPremades.utils.tokenUtils.getLightLevel(target);
if(lightLevel !== 'dark' && lightLevel !== 'dim' ) return;
workflow.advantage = true;
```



# 特殊的overtime

## 每回合开始/结束进行检定，若失败则移除效果

与一般的豁免成功移除效果不一样，也许有的overtime需要你每回合进行一次检定以维持效果：以Overtime行动为例，当然你也可以使用旧版的Overtime的macro来实现类似的效果，你只需要在Overtime行动中插入如下行动宏:

```JavaScript
if(workflow.failedSaves.size == 0) return;
const effectName = '你的效果名'; //替换为你的Overtime效果名
const effect = workflow.actor.effects.find(e => e.name === effectName);
await effect.delete()
```

并设置macroPass为`动态效果生效后`或是`RollFinished`



## 连续豁免（不想搬，先鸽一鸽）

考虑石化术和疫病术这种“在累计三次豁免成功后，本法术终止。在累计三次豁免失败后，该生物变为石头并在持续时间内视为陷入石化状态。成功或失败的检定不需要连续；只要记录各情况的次数直至其中一方累计三次为止。”的法术，与一般的Overtime效应不同，处理的时候要更麻烦一些



## 受伤时进行豁免

以塔莎狂笑术为例，部分法术的Overtime要求目标在受伤时也进行一次豁免，



# 针对满足条件的生物有额外效应/伤害类

这是一个比较笼统的分类，以最简单的

> **屠龙者 Dragon Slayer**  
> *武器（任意剑），珍稀*  
> 你用该魔法武器发动的攻击检定和伤害掷骰获得+1加值。  
> 你以该武器命中龙时，它将受到与剑的伤害类型相同的额外3d6伤害。此处的“龙”指任何生物类型为龙类的生物，包括 **龙龟dragon turtle** 和 **飞龙wyvern** 等。

为例，首先新建任意一把剑，配置好相应的行动后新建一个伤害行动，伤害行动的名称无关紧要，只需要确保伤害行动有如下配置：

![图片展示的是MIDI-QOL模组中伤害行动的配置界面。界面中“射程”部分显示射程数值为0，单位为尺，特殊射程为空；“目标”部分类型下拉菜单显示为“生物”，形状下拉菜单显示为“圆形”；“消耗”部分未显示具体内容。该图片与文档中针对满足条件生物有额外效应/伤害类的示例内容相关，用于说明伤害行动配置时的参数设置情况。](https://feishu.cn/file/WJ14bhxMYolVvZx0fsDcoqKGnVd)

![图片展示的是一个名为“MIDI状态”的界面，其中“使用条件”栏内显示为“raceOrType.includes(“dragon”)”。下方有提示“必须为真以允许行动使用继续的条件”。该图片与文档中针对满足条件的生物有额外效应/伤害类示例内容相关，用于说明在新建伤害行动时，需在使用条件中填入此代码，以确保只有符合条件的生物才能触发该伤害行动。](https://feishu.cn/file/OVlvbgkjbodXvtxBSt5cKn2Inig)

![图片展示了物品配置中“仅自动化”和“其他行动兼容”两个选项。其中“仅自动化”选项被勾选，下方提示“该行动仅用于midi自动化，不能手动使用”；“其他行动兼容”选项也被勾选，下方提示“可用作其他行动”。该图片与文档中针对满足条件的生物有额外效应/伤害类的物品示例配置相关，用于说明在物品配置时，需将“仅自动化”和“其他行动兼容”选项勾选，以确保物品仅用于midi自动化，不能手动使用，且可用作其他行动。](https://feishu.cn/file/Fbu8bkGX7oncLwxPBz1cP6i6nyh)

其中务必在使用条件中填入`raceOrType.includes("dragon")`或是`["dragon"].includes(raceOrType)`，并在攻击行动中修改midi标签页如下

![图片展示了物品配置中“使用其他行动”选项的界面。左侧为“使用其他行动”选项，右侧下拉框显示“伤害”，并有向下箭头标识。下方文字说明“额外的行动以执行“其他other”伤害”。该图片与文档中针对满足条件生物有额外伤害类效果的物品配置示例相关，用于说明在物品伤害行动配置中，需在使用条件中填入特定条件，如`raceOrType.includes("dragon")`，并在此界面进行相关设置。](https://feishu.cn/file/RqIib1H6ZoVfSxxCnqjcOXornoe)



# 强制位移

我个人对More Activities不太喜欢，因此强制位移往往需要利用宏来实现，取决于你的喜好和mod安装情况，你可以选用midi的moveToken函数或者cpr的pushToken函数。

豁免失败则目标被推离施法者十尺

```JavaScript
const Distance = -10; 
if (!workflow.failedSaves.size) return;//豁免成功直接返回 
let targetToken = await workflow.targets.first(); 
await chrisPremades.utils.tokenUtils.pushToken (workflow.token, targetToken, Distance)
```

而这是引力裂沟的自动化，它的参考源点是测量版中心

```JavaScript
(async () => {
  const template = await fromUuid(workflow.templateUuid);
  console.log(template);
  const Tpoint = { x: template.x , y: template.y };
  for (let token of workflow.failedSaves) {
    try {
      const target = token;
      const distance = -15;
      const animate = true;
      const checkCollision = true
      await MidiQOL.moveTokenAwayFromPoint(target,distance,Tpoint,animate,checkCollision);
    } catch (error) {
      console.error(`移动token ${token.name} 时出错:`, error);
    }
  }
})();
```

当然了，也可以实现类似心灵遥控的在一个范围内手动选择位移位置的效果

```JavaScript
(async () => {
  const RANGE_FT = 30;
  const TIMEOUT = 20000;
  const COLOR = 0x66ccff;
  const token = MidiQOL.getTokenForActor(macroItem.actor);
  if (!token) {
    ui.notifications.warn("请先选择一个Token");
    return;
  }
  const gridSize = canvas.grid.size;
  const feetPerSquare = canvas.scene.grid?.distance ?? 5;
  const maxSquares = Math.max(1, Math.floor(RANGE_FT / feetPerSquare));
  const radiusPx = maxSquares * gridSize;
  const originCenter = {
    x: token.center?.x ?? token.x + token.w / 2,
    y: token.center?.y ?? token.y + token.h / 2
  };
  const highlight = new PIXI.Graphics();
  highlight.lineStyle(2, COLOR, 0.9);
  highlight.beginFill(COLOR, 0.08);
  highlight.drawCircle(originCenter.x, originCenter.y, radiusPx);
  highlight.endFill();
  highlight.zIndex = 9999;
  canvas.app.stage.addChild(highlight);
  ui.notifications.info(`请在圆圈内选择传送位置`);
  const waitForClick = (timeout) => new Promise(resolve => {
    const handleClick = (event) => {
      try { canvas.app.stage.off("pointerdown", handleClick); } catch (e) {}
      try {
        const pos = event.data.getLocalPosition(canvas.app.stage);
        const snapped = canvas.grid.getSnappedPoint({ x: pos.x, y: pos.y }, { mode: CONST.GRID_SNAPPING_MODES.CENTER });
        resolve(snapped);
      } catch (e) {
        resolve(null);
      }
    };
    canvas.app.stage.on("pointerdown", handleClick);
    setTimeout(() => {
      try { canvas.app.stage.off("pointerdown", handleClick); } catch (e) {}
      resolve(null);
    }, timeout);
  });
  const tokenGridW = Number(token.document.width ?? 1);
  const tokenGridH = Number(token.document.height ?? tokenGridW);
  while (true) {
    const clickedCenter = await waitForClick(TIMEOUT);
    if (!clickedCenter) {
      ui.notifications.warn("请点击选择位置");
      continue;
    }
    const clickedCol = Math.floor(clickedCenter.x / gridSize);
    const clickedRow = Math.floor(clickedCenter.y / gridSize);
    const topLeftCol = clickedCol - Math.floor(tokenGridW / 2);
    const topLeftRow = clickedRow - Math.floor(tokenGridH / 2);
    const centerX = (topLeftCol + tokenGridW / 2) * gridSize;
    const centerY = (topLeftRow + tokenGridH / 2) * gridSize;
    const distFt = Math.hypot(centerX - originCenter.x, centerY - originCenter.y) / gridSize * feetPerSquare;
    if (distFt > RANGE_FT) {
      ui.notifications.warn(`距离超出限制 (${Math.round(distFt)}ft)`);
      continue;
    }
    const destRect = new PIXI.Rectangle(
      topLeftCol * gridSize,
      topLeftRow * gridSize,
      tokenGridW * gridSize,
      tokenGridH * gridSize
    );
    const occupied = canvas.tokens.placeables.some(t => {
      if (t.id === token.id) return false;
      const r = new PIXI.Rectangle(t.x, t.y, t.w, t.h);
      return destRect.right > r.left && destRect.left < r.right &&
             destRect.bottom > r.top && destRect.top < r.bottom;
    });
    if (occupied) {
      ui.notifications.warn("位置被占用");
      continue;
    }
    try { canvas.app.stage.removeChild(highlight); } catch (e) {}
    const destPos = { x: Math.round(centerX), y: Math.round(centerY) };
    try {
      await MidiQOL.moveToken(token, destPos, true);
      break;
    } catch (e) {
      break;
    }
  }
})();
```



# AOE目标筛选

直接调用CPR的函数可以允许我们按生物种类或者其他条件来筛选AOE的目标

```JavaScript
let validTargets = [];     
for (let i of workflow.targets) {         
if (chrisPremades.utils.actorUtils.typeOrRace(i.actor) !== 'undead') continue;//筛选目标生物类型，此处为'undead'不死生物         
if (i.actor.system.attributes.hp.value === 0) continue;//跳过生命值为0的目标        
validTargets.push(i);     
}     
await chrisPremades.utils.workflowUtils.updateTargets(validTargets);
```

macroPass为`preambleComplete`