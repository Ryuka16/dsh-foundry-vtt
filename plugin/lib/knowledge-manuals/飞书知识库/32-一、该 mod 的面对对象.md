# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/Sl6QwVxRqi6SUrkKe8wc0yoJnuh

# 一、该 mod 的面对对象
- 具有一定计算机基础的
- 看得懂大部分英文的
- 对自动化需求较高的
提示：如果你有任何觉得少了或者未提及的东西，查看第12章更新日志
https://github.com/thatlonelybugbear/automated-conditions-5e/wiki/Flags-functionality
# 二、mod的基础
Automated conditions 5e，简称为AC5E，本身包含了对系统状态的自动化以及对规则内部分术语的自动化。同时，它还具有干涉掷骰工作流以实现对骰子修改的功能，以下讨论的内容便基于该功能。
首先，AC5E的干涉全部需要通过对角色赋予效果来进行，其格式如下：
| 属性名 | 改变方式 | 数值 |
|---|---|---|
| flags.automated-conditions-5e.ACTIONTYPE.MODE | 覆盖 | 在第三节中讲解 |
其中，属性名根据效果对象的不同分为三种：
| 类型 | 含义 |
|---|---|
| flags.automated-conditions-5e.ACTIONTYPE.MODE | 影响带有此效果角色的掷骰 |
| flags.automated-conditions-5e.aura.ACTIONTYPE.MODE | 影响带有此效果角色为源点，一定范围内角色的掷骰 |
| flags.automated-conditions-5e.grants.ACTIONTYPE.MODE | 影响以带有此效果角色为目标的掷骰 |
在此基础上，又根据action type与mode的不同分为以下几种，可以任意组合actiontype与mode。
| 通用ACTIONTYPE |   |
|---|---|
| ACTIONTYPE | 含义 |
| all | 所有掷骰 |
| attack | 攻击检定 |
| check | 属性检定 |
| damage | 伤害掷骰 |
| save | 豁免掷骰 |
| 特定类型ACTIONTYPE |   |
|---|---|
| ACTIONTYPE | 含义 |
| death | 死亡豁免 |
| concentration | 专注豁免 |
| initiative | 先攻掷骰 |
| skill | 技能检定 |
| tool | 工具检定 |
| MODE | 含义 |
|---|---|
| advantage | 获得优势 |
| noAdvantage | 压制优势 |
| disadvantage | 获得劣势 |
| noDisadvantage | 压制劣势 |
| critical | 强制大成功 |
| noCritical | 压制大成功 |
| fumble | 强制大失败 |
| success | 强制成功 |
| fail | 强制失败 |
| bonus | 添加加值 |
| extraDice | 增加或减少骰子数量 |
| modifier | 对公式进行数学表达式调整 |
| modifyAC | 调整AC |
| modifyDC | 调整DC |
| criticalThreshold | 大成功阈值 |
| fumbleThreshold | 大失败阈值 |
| diceUpgrade | 把基础骰子上升级别（4→6→8→10→12→20→100） |
| diceDowngrade | 把基础骰子下降级别 |
# 三、填写效果数值
当选择好要使用的actiontype和mode后，我们将填写效果内容以使其发挥作用。
请在英文输入法下写作。
AC5E的效果内容是一种评估方式，通过在沙箱中评估表达式为真时，效果起效。表达式数据可以取自掷骰角色、影响角色、其余的关联信息。
现在，我们来看一条示例：
```
rollingActor.abilities.cha.mod >= 4 &&  opponentActor.attributes.hp.pct < 50 && ['fire', 'cold'].some(type=>damageTypes[type]); opponentActor.statuses.incapacitated;
```
这代表判断条件为：
掷骰角色的魅力调整大于等于 4 且 目标角色的HP百分比小于50% 且 伤害类型包含有火焰或寒冷 与 目标角色具有失能状态 两条内容独立检测，其中一条为真即可判定为真。
我们对此了解到，在效果填写中，符号代表的含义如下：
&&：与
||：或
!:非
;：分号前后独立判断，同时具有“或”和分隔不同类型条件的作用。
在这条效果内容中，由于rollingActor.abilities.cha.mod >= 4 &&  opponentActor.attributes.hp.pct < 50 && ['fire', 'cold'].some(type=>damageTypes[type])
和opponentActor.statuses.incapacitated是同种类型的判断条件，因此分号前后有一个为真即整体为真。
更多内容参见激活条件，大部分是相通的。
[激活条件](https://xcnplziulnma.feishu.cn/wiki/SDBHwnvcWigh6gkvZpEc48xQn2f) 
那么，如何填写我们所需要的内容呢？我们将内容部分分成以下几个区域，每个区域之间以;隔开。一旦以这种方式隔开了不同的区域，那么在同类型判断中请使用||。
我们也可以使用Koboldworks - Data Inspector这个mod来取得一个角色身上的基础数据。
## 1、使用计数限制（选填）
| 关键词 | 含义 |
|---|---|
| once | 仅生效1次 |
| usesCount=XXX | 生效指定的次数，可以填写任意能够被读取到的是整数的数据 |
| usesCount=origin | 消耗 “效果来源物品 / 行动” 的使用次数 |
| usesCount=UUID | 消耗 “可通过 UUID 检索到的物品 / 行动” 的使用次数。替换UUID为需要的物品/行动id |
| usesCount=Item.ID.Activity.ID | Item可以替换为物品的uuid、识别符或是直接写物品名字，Activity id是可选项不一定要加上。若替换完成，那么消耗对应物品的使用次数，否则消耗关联物品的使用次数。 |
| usesCount=_, Number | 替换number为一个特定的数值，一次性消耗指定的次数，填写负数可以恢复次数。 |
| usesCount=ActorAttr, Number | 消耗角色本身的一种资源，而不是物品的次数，只要是data inspector能查到的是整数的角色flag，基本上都可以使用，这个消耗是永久的。不填写number默认消耗1次。如果消耗的是生命，那么不触发专注检查。 |
例如：usesCount=Item.Longsword.Activity.attack, 2会消耗拥有该效果的角色身上第一个名为Longsword的物品上，识别符为Attack的行动2次使用次数。
而usesCount=Item.Longsword, Ablaze则消耗名为Longsword, Ablaze的物品的使用次数，而非其行动使用次数。
注意：当效果是被动效应时，这个效果被加上transfer标识。当使用次数耗尽时，transfer标识的效果将会被禁用，而非transfer效果则被删除。
## 2、效果来源限制（选填）