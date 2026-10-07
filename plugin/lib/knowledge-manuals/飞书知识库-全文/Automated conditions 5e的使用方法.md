<title>Automated conditions 5e的使用方法</title>

# 一、该 mod 的面对对象

- 具有一定计算机基础的
- 看得懂大部分英文的
- 对自动化需求较高的

提示：如果你有任何觉得少了或者未提及的东西，查看第12章更新日志

https://github.com/thatlonelybugbear/automated-conditions-5e/wiki/Flags-functionality

# 二、mod的基础

[Automated conditions 5e](https://foundryvtt.com/packages/automated-conditions-5e)，简称为AC5E，本身包含了对系统状态的自动化以及对规则内部分术语的自动化。同时，它还具有干涉掷骰工作流以实现对骰子修改的功能，以下讨论的内容便基于该功能。

首先，AC5E的干涉全部需要通过对角色赋予效果来进行，其格式如下：

| **属性名** | **改变方式** | **数值** |
|-|-|-|
| `flags.automated-conditions-5e.ACTIONTYPE.MODE` | 覆盖 | 在第三节中讲解 |

其中，属性名根据效果对象的不同分为三种：

| **类型** | **含义** |
|-|-|
| `flags.automated-conditions-5e.ACTIONTYPE.MODE` | 影响带有此效果角色的掷骰 |
| `flags.automated-conditions-5e.aura.ACTIONTYPE.MODE` | 影响带有此效果角色为源点，一定范围内角色的掷骰 |
| `flags.automated-conditions-5e.grants.ACTIONTYPE.MODE` | 影响以带有此效果角色为目标的掷骰 |

在此基础上，又根据`action type`与`mode`的不同分为以下几种，可以任意组合`actiontype`与`mode`。

| 通用ACTIONTYPE |  |
|-|-|
| **ACTIONTYPE** | **含义** |
| `all` | 所有掷骰 |
| `attack` | 攻击检定 |
| `check` | 属性检定 |
| `damage` | 伤害掷骰 |
| `save` | 豁免掷骰 |

| 特定类型ACTIONTYPE |  |
|-|-|
| **ACTIONTYPE** | **含义** |
| `death` | 死亡豁免 |
| `concentration` | 专注豁免 |
| `initiative` | 先攻掷骰 |
| `skill` | 技能检定 |
| `tool` | 工具检定 |

| **MODE** | **含义** |
|-|-|
| `advantage` | 获得优势 |
| `noAdvantage` | 压制优势 |
| `disadvantage` | 获得劣势 |
| `noDisadvantage` | 压制劣势 |
| `critical` | 强制大成功 |
| `noCritical` | 压制大成功 |
| `fumble` | 强制大失败 |
| `success` | 强制成功 |
| `fail` | 强制失败 |
| `bonus` | 添加加值 |
| `extraDice` | 增加或减少骰子数量 |
| `modifier` | 对公式进行数学表达式调整 |
| `modifyAC` | 调整AC |
| `modifyDC` | 调整DC |
| `criticalThreshold` | 大成功阈值 |
| `fumbleThreshold` | 大失败阈值 |
| `diceUpgrade` | 把基础骰子上升级别（4→6→8→10→12→20→100） |
| `diceDowngrade` | 把基础骰子下降级别 |



# 三、填写效果数值

当选择好要使用的`actiontype`和`mode`后，我们将填写效果内容以使其发挥作用。

**请在英文输入法下写作。**

AC5E的效果内容是一种评估方式，通过在沙箱中评估表达式为真时，效果起效。表达式数据可以取自掷骰角色、影响角色、其余的关联信息。

现在，我们来看一条示例：

```JavaScript
rollingActor.abilities.cha.mod >= 4 &&  opponentActor.attributes.hp.pct < 50 && ['fire', 'cold'].some(type=>damageTypes[type]); opponentActor.statuses.incapacitated;
```

**这代表判断条件为：**

掷骰角色的魅力调整大于等于 4 且 目标角色的HP百分比小于50% 且 伤害类型包含有火焰或寒冷 与 目标角色具有失能状态 两条内容独立检测，其中一条为真即可判定为真。

我们对此了解到，在效果填写中，符号代表的含义如下：

> &&：与
> 
> ||：或
> 
> !:非
> 
> ;：分号前后独立判断，同时具有“或”和分隔不同类型条件的作用。

在这条效果内容中，由于`rollingActor.abilities.cha.mod >= 4 &&  opponentActor.attributes.hp.pct < 50 && ['fire', 'cold'].some(type=>damageTypes[type])`

和`opponentActor.statuses.incapacitated`是同种类型的判断条件，因此分号前后有一个为真即整体为真。

更多内容参见激活条件，大部分是相通的。

<cite doc-id="SDBHwnvcWigh6gkvZpEc48xQn2f" file-type="wiki" title="激活条件" type="doc"></cite>

那么，如何填写我们所需要的内容呢？我们将内容部分分成以下几个区域，每个区域之间以`;`隔开。一旦以这种方式隔开了不同的区域，那么在同类型判断中请使用`||`。

我们也可以使用Koboldworks - Data Inspector这个mod来取得一个角色身上的基础数据。

## 1、使用计数限制（选填）

| **关键词** | **含义** |
|-|-|
| `once` | 仅生效1次 |
| `usesCount=XXX` | 生效指定的次数，可以填写任意能够被读取到的是整数的数据 |
| `usesCount=origin` | 消耗 “效果来源物品 / 行动” 的使用次数 |
| `usesCount=UUID` | 消耗 “可通过 UUID 检索到的物品 / 行动” 的使用次数。替换UUID为需要的物品/行动id |
| `usesCount=Item.ID.Activity.ID` | Item可以替换为物品的uuid、识别符或是直接写物品名字，Activity id是可选项不一定要加上。若替换完成，那么消耗对应物品的使用次数，否则消耗关联物品的使用次数。 |
| `usesCount=_, Number` | 替换number为一个特定的数值，一次性消耗指定的次数，填写负数可以恢复次数。 |
| `usesCount=ActorAttr, Number` | 消耗角色本身的一种资源，而不是物品的次数，只要是data inspector能查到的是整数的角色flag，基本上都可以使用，这个消耗是永久的。不填写number默认消耗1次。如果消耗的是生命，那么不触发专注检查。 |

**例如：**`usesCount=Item.Longsword.Activity.attack, 2`会消耗拥有该效果的角色身上第一个名为Longsword的物品上，识别符为Attack的行动2次使用次数。

而`usesCount=Item.Longsword, Ablaze`则消耗名为`Longsword, Ablaze`的物品的使用次数，而非其行动使用次数。

如果 `usesCount = origin` 无法正常生效，且动态效果施加于自身（如星辰结社德鲁伊职业特性宇宙预兆），请检查并修改：

1. 检查施加动态效果的行动组合，激活 -> 目标，将射程设为“自身”，目标设为“自身”。
2. 检查动态效果，如果勾选了 Midi-QOL 设置项中的“效果应用时应用于自身”或“物品掷骰时应用效果于自身”，将其去掉勾选。

**注意：**当效果是被动效应时，这个效果被加上transfer标识。当使用次数耗尽时，transfer标识的效果将会被禁用，而非transfer效果则被删除。



## 2、效果来源限制（选填）

| **关键词** | **含义** |
|-|-|
| `itemLimited` | 将效果限制为仅对 “来源物品” 的掷骰生效 |



## 3、数据判断

以下是可采用的几大类数据：

### ①角色类别

| **关键词** | **含义** |
|-|-|
| `effectActor` | 效果影响的角色。根据ACTIONTYE的不同，它可以自动检测是自身还是对方（我不认为它有效）。 |
| `nonEffectActor` | 😅不是`effectActor`的角色。 |
| `rollingActor` | 执行掷骰的角色。注意，在豁免检定中，掷 D20 骰的一方为 `rollingActor`。 |
| `opponentActor` | 对方角色（如有）。例如：在攻击检定中，被攻击的角色；在豁免检定中，导致本次豁免发生的角色（如火球术的施法者）。 |
| `auraActor` | 光环来源角色，仅在光环中使用。 |
| `effectOriginActor` | 效果来源角色，例如：猎人印记的施加方即为效果来源角色。 |

以上内容统称为xyzActor，不能单独使用，而要配合以下内容一起使用，将具体关键词替换掉xyzActor。



### ②系统数据（角色面板上的能力、属性等）

**示例：**

`xyzActor.abilities.cha.mod`

`xyzActor.attributes.hp.value`



### ③当前激活场景中的token数据

| **关键词** | **含义** |
|-|-|
| `xyzActor.token.name` | token的名字 |
| `xyzActor.uuid` | token对应角色的uuid |
| `xyzActor.tokenSize` | token大小（结果计算后，例如中型是1，大型是4） |
| `xyzActor.tokenElevation` | token的高度 |
| `xyzActor.tokenSenses` | token拥有的察觉模式 |
| `xyzActor.tokenUuid` | token的uuid（与角色不同） |
| `xyzActor.combatTurn` | 战斗中，计算是第几个行动的（先攻板上最高的为0，依次类推） |
| `xyzActor.isTurn` | 战斗中是否在自己的回合内 |
| `xyzActor.movementTurn` | 战斗中从该token上一回合结束以来总共移动的距离 |
| `xyzActor.movementLastSegment` | 战斗中从该token上一回合结束以来，距离上一个路径点移动的距离 |

以上的数据如果是一个数字，那么需要用数学表达式来判断，详见<cite doc-id="SDBHwnvcWigh6gkvZpEc48xQn2f" file-type="wiki" title="激活条件" type="doc"></cite>开头部分的大于、小于等部分。

**不要在中文键盘下输入大于或小于，如果不确定直接复制激活条件中的符号即可。**

### ④效果与装备

| **关键词** | **含义** |
|-|-|
| `xyzActor.currencyWeight` | 货币总重量 |
| `xyzActor.effects` | 角色激活效应栏里的效应名字（写法为xyzActor.effects.some(effect=>effect.name==='单引号内填写需要检测的效应名字全文')） |
| `xyzActor.equippedItems.names` | 装备的物品名字 |
| `xyzActor.equippedItems.identifiers` | 装备的物品标识符 |
| `xyzActor.hasArmor` | 装备盔甲 |
| `xyzActor.hasArmorLight` | 装备轻甲 |
| `xyzActor.hasArmorMedium` | 装备中甲 |
| `xyzActor.hasArmorHeavy` | 装备重甲 |
| `xyzActor.hasShield ` | 装备盾牌 |
| `xyzActor.items` | 拥有的某件物品的任意详细属性（不会实际改变该物品内容） |
| `xyzActor.level` | 角色的等级/CR |

## **4、状态 生物类型**

包含角色的token状态（如倒地、受伤等）；该角色的生物类型。示例： 

| **关键词** | **含义** |
|-|-|
| `xyzActor.statuses.prone` | 角色具有倒地 |
| `xyzActor.creatureType.includes('elemental')` | 角色的生物类型包含元素 |
| `xyzActor.creatureType.includes('devil')` | 角色生物类型的子类中有填写包含词语devil的字样 |

## **5、全局数据** 

### ① 除角色数据外，还可使用以下实用值：

| **关键词** | **含义** |
|-|-|
| `actorId` | 掷骰角色的 ID |
| `actorUuid` | 掷骰角色的 UUID |
| `tokenId` | 掷骰角色的活跃token的 ID |
| `tokenUuid` | 掷骰角色的活跃token的 UUID |
| `canMove` | 至少有一种不为0的移动速度 |
| `canSee` | 能看到目标 |
| `isTurn` | 目前是角色回合 |
| `opponentActorId` | 目标角色的 ID（若存在） |
| `opponentActorUuid` | 目标角色的 UUID（若存在）  |
| `opponentId` | 目标 token 的 ID（若存在） |
| `opponentUuid` | 目标 token 的 UUID（若存在） |
| `opponentAC` | 目标的AC值 |
| `isSeen` | 目标可以看见角色 |
| `isOpponentTurn` | 在目标的回合内 |
| `ability` | 掷骰关联的能力（如`ability.str` 表示力量） |
| `skill` | 掷骰关联的技能（如 `skill.acr` 表示体操检定） |
| `tool` | 掷骰关联的工具（如 `tool.thief` 表示盗贼工具） |
| `distance` | 目标与掷骰token之间的距离（两者都要存在） |
| `hasAttack` | 类型是攻击 |
| `hasAdvantage` | 攻击有优势 |
| `hasDisavantage` | 攻击有劣势 |
| `isCritical` | 掷骰大成功 |
| `isFumble` | 掷骰大失败 |
| `hasDamage` | 行动带有伤害 |
| `hasHealing` | 行动带有治疗 |
| `hasSave` | 行动是豁免 |
| `isConcentration` | 掷骰是专注 |
| `isInitiative` | `掷骰`是先攻 |
| `isDeathSave` | `掷骰`是死亡豁免 |
| `isCantrip` | `使用`的是戏法 |
| `isSpell` | `使用`的是法术 |
| `spellLevel` | 法术施展时的环级 |
| `castingLevel` | 法术施展时的环级（系统版本差异，若spellLevel不可用） |
| `baseSpellLevel` | 法术本身的基础环级 |
| `scaling` | 法术施展时的环级与基础环级的差值 |
| `attackRollTotal` | 攻击掷骰总数 |
| `attackRollD20` | 攻击掷骰纯D20数值 |
| `attackRollOverAC` | 攻击总值减去对方AC得出的数值 |
| `worldTime` | 当前世界时间（以秒计） |
| `combat` | 活跃战斗的相关数据（若存在活跃战斗） |
| `singleTarget` | 只选择了一个目标 |
| `riderStatuses` | 将要对生物赋予某特定状态的情况，例：riderStatuses.poisoned会在“将要被赋予中毒状态”时为真 |
| `checkNearby` | 检查附近token阵营 |

### ② 对5.1.X以上的系统还有如下内容：

| **关键词** | **含义** |
|-|-|
| `movementLastSegment` | 在战斗中时，返回该角色最后一段走过的距离数值（计算两个路径点之间） |
| `movementTurn` | 在战斗中时，返回该角色自从上个回合以来移动的距离总数 |
| `effectOriginTokenId` | 效果来源token的ID |

## 6、行动与物品本身的数据

若掷骰涉及特定行动或物品，还可访问以下数据：

### ①行动

| **关键词** | **含义** |
|-|-|
| `activity.name` | 行动的名字 |
| `activity.activation.type` | 激活行动的类型，如 action（动作）、bonus（附赠动作）、reaction （反应） |
| `activity.actionType` | 行动使用的动作类型，如 mwak（近战武器攻击）、rsak（远程法术攻击）、 save（豁免） |
| `activity.type` | 行动的类型，如check（检定）、damage（伤害）、utility（效用） |
| `activity.damageTypes` | 涉及的伤害类型 |

### ②物品

| **关键词** | **含义** |
|-|-|
| `item.name` | 物品的名字 |
| `item.type` | 物品本身的一些具体基础配置信息，比如  <br/>value: 'martialR'（军用远程）   <br/>baseItem: 'longbow'（基础物品-长弓）   <br/>label: 'Martial Ranged'（标签：军用远程）   <br/>identifier: 'Compendium.dnd5e.equipment24.Item.phbwepLongbow000'（物品识别符） |
| `item.school` | 针对法术，返回其学派，如evo（塑能），应当是学派前三个字母 |
| `item.identifier` | 物品的识别符 |
| `item.properties` 或 `itemProperties` | 物品上可勾选的标签，如mgc（魔法），fin（灵巧） |
| `itemType` | 物品的大类，如 spell（法术）、feat（专长） |

### ③示例

```Plain Text
(item.properties.has("mgc") && item.properties.has("fin")) || (itemName == "Claw" && damageTypes.poison)  
```

以上可以看到，判断条件为或，而两边的括号内为且，那么两边只要有一个生效即可。

左侧：物品为魔法且灵巧

右侧：物品名称为 Claw 且造成毒素伤害

### ④额外

对于`damageTypes`，它可以做多种或判断，写为

```Plain Text
damageTypes.cold || damageTypes.fire
```

此时只要总伤害包含有就行，而不必该行动全部为该类型伤害

对于`activity.actionType`，也可以写成

```Plain Text
actionType.mwak
```

此时检测攻击类型是近战武器攻击。

对于`checkNearby`，其写法有统一规范，写为

```Plain Text
checkNearby(opponentId, 'different', 5, {count:(distance <= 5 ? 2 : 1)}) 
```

在这之中，分为数个部分。

- `opponentId`处可以填写两种，一是`opponentId`，代表“检测目标周围”；二是`tokenId`，代表“检测自身周围”。
- `different`处填写检测阵营的情况，有如下内容：

| **关键词** | **含义** |
|-|-|
| `different` | 不同阵营（包含中立、未知、敌对） |
| `same` | 同阵营（并非友善，而是和自身设置的阵营相同） |
| `opposite` | 敌对阵营（友善与敌对互为敌对阵营） |
| `all` | 所有阵营 |
| `partyMember` | 仅返回`game.actors.party`的成员，应该是要创建一个小队并设为主要，然后将需要的PC和NPC拖入该小队后检测 |

- 5是距离，以一格的单位长度计算
- `count`内填写具体要检查多少数量，一般情况下写成{count:1}即可，要检查不同距离下的数量才需要做判断。
- 在这之后还可以添加两种内容，以逗号分隔
- `includeToken`,默认为false，需要填写`includeToken: true`，效果为将自身也加入检测token数量判断。
- `includeIncapacitated`,默认为false，需要填写`includeIncapacitated: false`, `true` 或 `only`,效果为是否将失能token也计算在数量内。

## 7、特殊的数据判断

### ①当MODE为bonus时

除了以上通用的判断条件外，在整个效果数值的最前需要填写具体bonus数值。它可以是数字、公式或是引用。

| **关键词** | **含义** |
|-|-|
| `bonus=2` | 固定数值 |
| `bonus=1d4+5` | 使用确定的公式 |
| `bonus=1d4+5[acid]` | 带有伤害类型的公式 |
| `bonus=@abilities.cha.mod` | 掷骰角色的某数值，可以不写rollingActor |
| `bonus=##attributes.spell.dc` | 对方角色的某数值，可以以##来代替opponentActor |
| `bonus=auraActor.attributes.ac.value` | 光环专用，光环来源角色的某数值 |

**不要**对bonus后的数值添加单引号。

以上所有的都需要填写在判断条件的最前方，以分号隔开。

### ②当MODE为modifier时

除了以上通用的判断条件外，在整个效果数值的最前需要填写具体modifier。它是一个表达式，或是特定的一段修饰词。

以下为**伤害掷骰**专用：

| **关键词** | **含义** |
|-|-|
| `modifier=r` | [Dice Modifiers](https://foundryvtt.com/article/dice-modifiers/)  <br/>来自此链接的所有骰子修饰符都可以使用，填写最前方的英文缩写。 |
| `modifier=adv` | 优势 |
| `modifier=dis` | 劣势 |

以下为**D20掷骰**专用：

| **关键词** | **含义** |
|-|-|
| `modifier=max15` | 最高只能投出15 |
| `modifier=min10` | 最低能投出10 |
| `modifier=(rollingActor.attributes.hp.pct > 50 ? min15 : max10)` | 掷骰角色的HP大于50%时，掷1d20min15  <br/>否则掷1d20max10  <br/>在问号前可以填写“对启用哪种调整公式的判断”，问号后填写两种不同的公式，以问号前的数据判断真假来区分，真则1，假则2。 |

以上所有的都需要填写在判断条件的最前方，以分号隔开。

### ③当MODE为modifyAC、modifyDC时

| **关键词** | **含义** |
|-|-|
| `bonus=XXX` | 同普通bonus的写法 |
| `set=XXX` | 同普通bonus的写法，区别为直接将AC或DC设为该值 |

**注意：**

modifyAC不需要ACTIONTYPE，因此直接写为

`flags.automated-conditions-5e.modifyAC`

`flags.automated-conditions-5e.grant.modifyAC`

`flags.automated-conditions-5e.aura.modifyAC`

即可

modifyDC则仍需要填写ACTIONTYPE，因为它可以影响到多种豁免或检定。

### ④当MODE为criticalThreshold、fumbleThreshold时

| **关键词** | **含义** |
|-|-|
| `threshold=-2` | 将阈值降低2，对于大失败阈值来说，阈值为负数则不会出现大失败 |
| `threshold=1` | 将阈值提高1，对于大成功阈值来说，阈值超过20则不会出现大成功 |
| `threshold=1d4` | 将阈值提高该公式的结果，同普通bonus的公式写法 |
| `threshold=(opponentActor.creatureType.includes('dragon') ? -2 : -1)` | 对方角色的种族为龙时，阈值-2，否则-1  <br/>在问号前可以填写“对启用哪种调整公式的判断”，问号后填写两种不同的公式，以问号前的数据判断真假来区分，真则1，假则2。 |
| `set=XXX` | 不对阈值进行调整，直接设定为某个数值，数值写法同bonus |

criticalThreshold、fumbleThreshold不需要填写ACTIONTYPE，它只能影响攻击掷骰。

### ⑤当要启用的效果为 diceUpgrade 或 diceDowngrade 类别时

| **关键词** | **含义** |
|-|-|
| `bonus=XXX` | 同普通 bonus 的写法 |

### ⑥当要启用的效果为aura类别时

必须填写：

`radius=10; `光环范围，必须为一个确定的数值，不能是掷骰公式，可以引用scale或者角色数值

最近更新之后如果不填写范围那么会直接全图有效

可选填写：

- `singleAura;` 同名光环不叠加（以数值最高或距离最近的优先生效）
- `includeSelf;` 光环包括自身
- `allies;` 只影响盟友
- `enemies;` 只影响敌军
- `wallsBlock;`会被墙阻挡
- 既不填写allies也不填写enemies就会影响范围内所有生物

### ⑦当要为同一种内容下多种判断同时生效时

例：“智力，魅力，感知的攻击具有劣势”，不能写多条效果每条判断一种属性，这样将只有第一个或最后一个生效，这和dae的效果不太一样。你需要在值中填写以下内容：

```JavaScript
['int', 'wis', 'cha'].some(a=>ability[a]);
```

或者：

```JavaScript
ability.int || ability.wis || ability.cha;
```

参见范例中的稳步，这样才能将多种属性集成到一条内容中。对于其它的判断类型也是同样，欢迎有JS基础者投递具体写法。

# 四、实用工具

这部分我没有实际使用过，具有编程基础者自行理解

沙箱还公开了一些配置常量

```Plain Text
CONFIG = {abilities, skills, tools, damageTypes, spellSchools,attackModes, actionTypes, itemProperties, etc.}
```

以及如下的辅助函数

```Plain Text
checkDistance(), checkVisibility(), checkCreatureType(), checkArmor()
```

使用以上代码应当可以从选定的token上取得其数据来填写判断。

# 五、范例物品

以下范例物品作为参考。

## 暗杀（刺客3级特性）

```Plain Text
flags.automated-conditions-5e.attack.advantage
```

```Plain Text
combat.round === 1 && rollingActor.combatTurn < opponentActor.combatTurn
```

## 圣武士守护灵光

```Plain Text
flags.automated-conditions-5e.aura.save.bonus
```

```Plain Text
bonus=auraActor.abilities.cha.mod; radius=(auraActor.details.level < 18 ? 10 : 30); allies; singleAura; includeSelf
```

注：`details.level`似乎不起作用，目前来看应该写为`auraActor.level`或`auraActor.levelCr`,待测试。

## 血腥狂怒（鲨华男爵）

```Plain Text
flags.automated-conditions-5e.attack.advantage
```

```Plain Text
opponentActor.attributes.hp.pct < 100
```

## 浴血狂怒（狂战士）

```Plain Text
flags.automated-conditions-5e.attack.advantage
```

```Plain Text
rollingActor.statuses.bloodied || rollingActor.attributes.hp.pct < 50
```

```Plain Text
flags.automated-conditions-5e.save.advantage
```

```Plain Text
rollingActor.statuses.bloodied || rollingActor.attributes.hp.pct < 50
```

## （2014）熊地精突袭打击

```Plain Text
flags.automated-conditions-5e.damage.bonus
```

```Plain Text
bonus=2d6; hasAttack && combat.round === 1 && rollingActor.combatTurn < opponentActor.combatTurn
```

## 冲锋类攻击（可以用CPR通用特性代替）

```Plain Text
flags.automated-conditions-5e.damage.bonus
```

```Plain Text
bonus = 1d8; actionType.mwak && movementLastSegment >= 10
```

## 魔能祈唤：飞蝇斗篷（仅检定）（写两条独立的效果而非合并到一条内）

=== 效果 1 ===

```Plain Text
flags.automated-conditions-5e.check.disadvantage
```

```Plain Text
ability.cha && !skill.itm
```

=== 效果 2 ===

```Plain Text
flags.automated-conditions-5e.check.advantage
```

```Plain Text
ability.cha && skill.itm
```

## **危机感应**（野蛮人2级特性）

```Plain Text
flags.automated-conditions-5e.save.advantage
```

```Plain Text
ability.dex && !rollingActor.statuses.incapacitated
```

## 生命门徒（生命领域3级特性）

```Plain Text
flags.automated-conditions-5e.damage.bonus
```

```Plain Text
bonus = 2 + castingLevel; isSpell && defaultDamageType.healing
```

## 矮人体魄

```Plain Text
flags.automated-conditions-5e.save.advantage
```

```Plain Text
riderStatuses.poisoned
```

## 巨武器战斗风格

```Plain Text
flags.automated-conditions-5e.damage.modifier
```

```Plain Text
modifier = min3; twoHanded && mwak
```

## 起源专长：医疗师（仅重掷）

```Plain Text
flags.automated-conditions-5e.damage.modifier
```

```Plain Text
modifier = r1; healing && isSpell
```

## 猎人印记

```Plain Text
flags.automated-conditions-5e.grants.damage.bonus
```

```Plain Text
bonus = 1d6[force]; effectOriginTokenId === tokenId && hasAttack
```

↑要将该效果施加给对方

## 魔法抗性（需要在魔法的豁免-效应标签勾选为魔法、midi标签页勾选伤害为魔法）

```Plain Text
flags.automated-conditions-5e.save.advantage
```

```Plain Text
mgc
```

↑配合observer的批量勾选魔法宏

~~↑由于midi提供的魔法抗性flag与monk's token bar配合时有问题，建议使用这个~~

~~13.0.37的midi已修复~~

13.0.38的midi又修回去了，现在无论是使用midi的魔法抗性还是AC5E的都会触发一次快进掷骰，从而忽略掉对优势的判断，建议：如果13.0.38停留很久，那么请不要使用请求掷骰类mod，改为从聊天信息掷骰。如果你不在意这个，那么随意。

## 集群战术（CPR更好）

```Plain Text
flags.automated-conditions-5e.attack.advantage
```

```Plain Text
checkNearby(opponentId, 'different', 5, {count:(distance <= 5 ? 2 : 1)}) 
```

## 强力施法（牧师7级特性）

```Plain Text
flags.automated-conditions-5e.damage.bonus
```

```Plain Text
bonus=rollingActor.abilities.wis.mod; item.sourceClass === 'cleric' && isCantrip;
```

## 防护善恶（CPR更好）

```Plain Text
flags.automated-conditions-5e.grants.disadvantage.attack
```

```Plain Text
['aberration', 'celestial', 'elemental', 'fey', 'fiend', 'undead'].some(type => rollingActor.creatureType.includes(type));
```

## 稳步（2014 巨山羊）

```Plain Text
flags.automated-conditions-5e.save.advantage
```

以下任选一个

```Plain Text
riderStatuses.prone && ['dex', 'str'].some(a => ability[a]);
```

```Plain Text
riderStatuses.prone && ['dex', 'str'].includes(options.ability);
```

## 投掷武器战斗风格

```Plain Text
flags.automated-conditions-5e.damage.bonus
```

```Plain Text
bonus=2; activity.attackMode.includes('thrown');
```

# **六、Opt-in（可选生效）功能**

从 v13.5250.5 开始，AC5E 新增了 opt-in 机制。通过在效果数值中添加 optin 关键词，可以将任何 AC5E flag 转变为掷骰对话框中的可选项，而非强制生效的效果。这使得玩家可以在每次掷骰时自由决定是否启用该效果。

## **optin 关键词**

在效果数值的末尾（各区域以 ; 分隔）添加 optin 即可将该效果变为可选项。

兼容性注意：opt-in 功能依赖掷骰配置对话框的显示。若其他 mod 强制设置了 dialog.configure = false，则 opt-in 控件将无法被呈现出来。例如，flash token bar、monk's tokenbar的快进功能，midi设置全自动/快进掷骰功能。

### **opt-in 的展示说明**

在掷骰对话框中，opt-in 条目会被分为两个区域：

| **区域** | **含义** |
|-|-|
| AC5E | 来自掷骰角色自身的 opt-in 条目（普通自源 opt-in） |
| AC5E Ask for permission | 来自其他角色（非掷骰角色）的 opt-in 条目，标签中会显示来源角色名，以明确所有权上下文 |

对于 attack 中的 modifyAC opt-in，其归属区域有特殊规则：

| **来源** | **所在区域** |
|-|-|
| flags.ac5e.modifyAC | 归入 Ask for permission 区域 |
| flags.ac5e.grants.modifyAC | 归入主 AC5E 区域 |
| flags.ac5e.aura.modifyAC（光环来源为掷骰角色本人） | 归入主 AC5E 区域 |
| flags.ac5e.aura.modifyAC（光环来源为其他角色） | 归入 Ask for permission 区域 |

### **opt-in 标签与描述关键词（填入AC5E效果处）**

| **关键词** | **含义** |
|-|-|
| optin | 将该效果变为掷骰对话框中的可选项 |
| name=... | 指定该 opt-in 条目在对话框中显示的名称 |
| description=... | 为该 opt-in 条目添加说明文字，若不填则使用本地化的自动说明 |

### **同一效果中多个同类型 flag 的支持**

在同一个激活效果（Active Effect）中，现在支持多条相同 actiontype 的 flag（无论 opt-in 与否）。若多条未命名的条目产生了重复，系统会自动为它们添加编号（例如 #1、#2）以便在掷骰对话框中区分。

## **optin 使用时机关键词**

以下关键词用于控制该 opt-in 在每场战斗或每个回合/轮中的可用次数，添加在效果数值末尾，以 ; 与其他内容分隔。

| **关键词** | **含义** |
|-|-|
| oncePerTurn | 每个回合只可使用一次，战斗外不受限制 |
| oncePerRound | 每轮只可使用一次，在拥有者的下个回合开始时刷新，战斗外不受限制 |
| oncePerCombat | 整场战斗只可使用一次 |

当使用次数耗尽后，该 opt-in 条目将不再出现在掷骰对话框中，直到刷新时机到来。

## **Final Stand（最后一搏）**

对于使用了 usesCount 且会消耗 HP 的 flag，当一次消耗将导致 HP 降至 0 或以下时，该效果会被自动转化为一个 opt-in，并在对话框标签后附加本地化的提示文字，形如：Final stand (drops to X)，其中 X 为消耗后的剩余 HP 值。

非 opt-in 的条目只有在确实会将 HP 降至 0 或以下时，才会被转化为 Final Stand opt-in。不会导致 HP 降至 0 的效果不会被强制显示为禁用的 opt-in 复选框。

Final Stand 同样支持 description=... 关键词，以提供自定义说明文字。

# **七、新增伤害掷骰功能**

## **addTo：伤害条目的精确归属**

addTo 关键词用于控制 bonus、extraDice、diceUpgrade、diceDowngrade 效果应该追加到哪种伤害类型的部分上，从而实现精确的伤害叠加控制。

| **关键词** | **含义** |
|-|-|
| addTo=all | 应用到所有伤害部分 |
| addTo=base | 仅应用到基础伤害部分 |
| addTo=<damageType> | 仅应用到指定伤害类型的部分，例如 addTo=fire 表示仅追加到火焰伤害 |

addTo 可与伤害类型条件结合使用。例如：

```Plain Text
flags.automated-conditions-5e.damage.bonus | bonus=2d6[acid];addTo=fire
```

含义：当有火焰伤害时，额外追加 2d6 强酸伤害到火焰伤害部分。

```Plain Text
flags.automated-conditions-5e.damage.bonus | bonus=^2;addTo=all
```

含义：将所有伤害部分各乘以 2。

对于 opt-in 的伤害条目，系统会根据当前选择的伤害类型，对不含加值的 opt-in（如 critical、noCritical、advantage）进行可见性控制，只在相关伤害类型激活时显示它们。

## **extraDice 倍率语法**

damage.extraDice 现在支持倍率字面量写法，可以让额外骰子相对于基础骰子项进行比例缩放。

| **写法** | **含义** |
|-|-|
| bonus=x2 | 以基础骰子项的数量为基础，额外追加 2 倍数量的骰子（x、X、^ 均可使用，如 X2 或 ^2） |

示例：

```Plain Text
flags.automated-conditions-5e.damage.extraDice | criticalStatic; bonus=x2
```

含义：重击时，静态追加 2 倍于基础骰子数的额外骰子，且不受重击倍增影响。

## **criticalStatic：重击时静态追加骰子**

criticalStatic 是 damage.extraDice 专用的关键词，用于标记该额外骰子条目只在重击时应用，且不受重击倍增机制影响（即不会被双倍计算）。适用场景：为某种效果（在重击时追加固定骰子，但这些骰子不随重击翻倍）。

| **关键词** | **含义** |
|-|-|
| criticalStatic | 仅在重击时生效，且不受重击倍增影响 |

示例：

```Plain Text
flags.automated-conditions-5e.damage.extraDice | bonus=3;criticalStatic
```

含义：重击时额外追加 3 个骰子，但这 3 个骰子不会因重击而翻倍。

criticalStatic 支持 source / grants / aura 路径，并可与 addTo 配合使用。

## **@spellLevel 变量支持**

damage.bonus 的公式现在支持 @spellLevel 变量，其值会从发起该行动时的物品使用数据中自动解析。例如：

```Plain Text
flags.automated-conditions-5e.damage.bonus | bonus=(@spellLevel - 1)d6
```

## **[random] 随机伤害类型**

damage.bonus 的公式中现在支持 [random] 词元，每次评估时系统会随机从全部伤害类型中选取一种替换它。示例：

```Plain Text
flags.automated-conditions-5e.damage.bonus | bonus=1d6[random]
```

含义：每次触发时，追加 1d6 随机类型的伤害，例如某次可能变为 1d6[fire]，另一次则为 1d6[cold]。

# **八、partialConsume：部分消耗**

partialConsume 是 usesCount 的配套关键词，用于处理当完整消耗量超过当前可用量上限时的情况。添加该关键词后，系统只会消耗剩余的可用量，而不是直接失败。示例：

```Plain Text
usesCount=death.fail,(isCritical ? 2 : 1);partialConsume
```

含义：通常消耗 1 次死亡豁免失败，重击时消耗 2 次。若当前只剩 1 次可用，重击时也只消耗 1 次（而不是失败）。

# **九、update：直接更新角色属性**

update 关键词用于在效果触发时直接修改指定角色的特定属性值，设计上与 info 关键词配合使用（详见更新日志第十二章 v13.5250.11）。支持更新的属性包括：HP、临时 HP、有效最大 HP、力竭、死亡豁免、激励以及能力值。正负值均符合直觉性写法。

| **示例** | **含义** |
|-|-|
| update=rollingActor.hp,-1d6 | 减少掷骰角色的 HP，支持负数与骰子公式 |
| update=opponentActor.exhaustion,1 | 增加目标角色的疲惫层数 |

示例效果数值：

```Plain Text
flags.automated-conditions-5e.use.info | update=opponentActor.exhaustion,1
```

```Plain Text
flags.automated-conditions-5e.damage.info | update=rollingActor.hp,-1d6
```

# **十、convertAdvantage / convertDisadvantage：优势转换**

这两个关键词允许将系统原生的 d20 优势/劣势机制（即掷 2d20 取高/低）转换为 AC5E 控制的加值公式，骰子仍以直接掷骰方式投出，优势/劣势状态由公式体现。

| **关键词** | **含义** |
|-|-|
| convertAdvantage | 将优势转换为 AC5E 驱动的加值公式，而非掷 2d20kh1 |
| convertDisadvantage | 将劣势转换为 AC5E 驱动的加值公式，而非掷 2d20kl1 |

即使使用了转换，hasAdvantage / hasDisadvantage 关键词仍可正常用于下游判断条件中。

全局开关：在世界设置中可以启用全局级别的优势/劣势转换，并分别为优势和劣势提供替代公式。若某一方留空，则保留系统原有行为。单条规则中的 convertAdvantage / convertDisadvantage 可以在全局开关关闭时仍强制对该条规则生效。

# **十一、abilityOverride：攻击能力值覆盖**

abilityOverride 可作为攻击专用的 AC5E 评估 flag 使用（包括 grants 和 aura 变体），用于改变本次攻击使用的能力值（例如将力量攻击改为魅力攻击）。提示中会以紧凑形式展示胜出的覆盖，格式示例：Ability: DEX → CHA (New Effect)。

写法：

```Plain Text
flags.automated-conditions-5e.attack.abilityOverride | override=cha; optin
```

# **十二、更新日志**

本章记录各版本对已有功能的优化与关键词补充，供有需要时查阅。

## **v13.5250.5 其他更新**

• 自身目标行动允许在未明确选择 token 目标时使用。

• 当掷骰在完成前被取消（post-roll 阶段 rolls 为空）时，usesCount 不再被消耗。

• 在 source / grants / aura 路径下，range 相关 flag 现在支持颗粒度更细的覆盖控制（详见 v13.5250.7 更新日志中的完整 range 键列表）。

• DAE 自动补全已扩展，支持 use.fail、各 actiontype 的显式键名，以及仅伤害可用的骰子大小键（source / grants / aura 路径均支持）。

• 使用前失败警告现在带有 AC5E: 归因标注，支持可选的 description=... 原因文本，以及 chance=<number> 掷骰上下文的反馈显示。

• 新增 ac5e.troubleshooter 快照工具，可导出/导入包含 AC5E 设置、Foundry/系统/模组版本及场景网格配置的诊断 JSON 包（API：ac5e.troubleshooter.snapshot()、ac5e.troubleshooter.exportSnapshot()、ac5e.troubleshooter.importSnapshot(file)）。

• 状态自动化重构：状态表在 ready 时初始化一次，公开 ac5e.statusEffectsReady 用于覆盖注册，支持按需的状态抑制 flag（如 noProne），并提供 tooltip 可见性控制。覆盖示例：Hooks.on("ac5e.statusEffectsReady", ({ overrides }) => overrides.register({ status: "prone", hook: "attack", type: "subject", apply: ({ result }) => result === "disadvantage" ? "" : result }));

• Cadence 重置辅助 API：await ac5e.cadence.reset()（或带参数 await ac5e.cadence.reset({ combatUuid })）。

• 补全了非英语语言缺失的本地化键，以英文内容作为回退值。

## **v13.5250.6**

• Cadence 修复：修复了 oncePerTurn 条目的重置行为，使 opt-in 与非 opt-in 的 cadence flag 均能在回合切换时正确解锁。Cadence 持久化现在替换完整的 flags.automated-conditions-5e.cadence 对象，防止旧的嵌套使用条目在更新后残留。

• 硬化了效果删除处理，防止与其他战斗/效果自动化模组产生双重删除竞争：重复 UUID 的删除操作会先去重再分发；文档不存在时的删除错误改为无操作处理，不再产生噪声报错。

• 掷骰对话框中 AC5E 所选的默认按钮即使在其他模组试图移动焦点时也能更可靠地保持焦点。

• DAE 自动补全现在仅在 flags.automated-conditions-5e.\* 下显示规范键名；flags.ac5e.\* 短别名在运行时仍受支持，但不推荐在新效果中使用。

• 新增 no<Status> 关键词（如 noProne），在 source、grants、aura 路径下均支持，例如 flags.automated-conditions-5e.grants.noProne。状态覆盖的 tooltip 现可包含覆盖名称，格式示例：Prone (Ignore Prone in Rage)。

• 新增 Context Keyword Registry API，用于注册可复用的评估别名：运行时注册 ac5e.contextKeywords.register({ key, expression })；世界级持久注册使用 ac5e.contextKeywords.registerPersistent({ key, expression })；相关 Hook：ac5e.contextKeywordsReady。

• 新增 ac5e.usageRules API：支持 register / remove / clear / list，以及 canPersist 和 reloadPersistent。支持 persistent: true 的世界级注册路径（存储在模组设置中）；含 evaluate 函数的规则只能运行时注册；持久化规则须使用可序列化的表达式字段（如 condition）。新增 scope 支持：scope: "effect"（默认）保持规则作为效果驱动的关键词辅助；scope: "universal" 额外发出直接的伪规则条目，用于全局应用。

• 故障排查快照现在包含 AC5E flag 的 lint 报告，可快速定位格式错误的键、疑似拼写错误的关键词及其他风险条目。

• 修复了 once / usesCount 引用格式错误时导致队列任务崩溃的问题；阈值类 tooltip 标签现在能正常渲染，不再显示 [object Object]。

• 修复了攻击掷骰选中目标时取消对话框可能报 roll.evaluate is not a function 的边界问题。

## **v13.5250.7**

• MidiQOL 兼容性大幅扩展：AC5E 现在摄入 Midi 追踪器对优势/劣势/失败/成功的归因并去重重叠原因。已知限制：MidiQOL 启用时，AC5E 专属的 bonus / extraDice 原因在部分工作流中尚未完全通过 Midi 原生 tooltip 归因管线渲染，此类情况下仍使用 AC5E 回退 tooltip 内容。

• range flag 扩展，新增以下覆盖键（可在 effect / grants / aura 路径下使用，可作为独立开关或可评估表达式）：

| **关键词** | **含义** |
|-|-|
| nearbyFoeDisadvantage / noNearbyFoeDisadvantage | 控制是否因附近敌人而触发远程劣势 |
| longDisadvantage / noLongDisadvantage | 控制是否因超出普通射程而触发远程劣势 |
| fail / outOfRangeFail / noFail / noOutOfRangeFail | 控制是否因超出最大射程而直接失败 |

 

• 修复了 usesCount 在非角色目标上引发报错的问题，现改为无操作处理。

• Final Stand 触发范围扩展：新增疲惫达到配置最大层数、abilities.<abilityId>.value 降至 0、hp.max 类消耗路径导致值 <= 0 三种触发路径。

• 物品数量更新路径修复：现在直接将解析后的 newQuantity 写入 system.quantity，确保正确生效。

• 重构 \_hasItem 辅助函数，支持通过 identifier、name、id 或 uuid 进行物品匹配；在模组 API 和评估沙箱中公开了 ac5e.hasItem(...)。

• 新增针对 AC5E 钩子追踪和 \_setAC5eProperties 的调试开关，无需开启完整全局调试日志。

• 伤害公式变换流程重做：统一变换通道现在同时应用于基础和 opt-in 伤害项（extraDice、骰子升降级、优势/劣势骰子处理及公式运算符）。新增伤害 formula operator（\* / /）与 addTo 组合支持；伤害公式数据引用现通过 Roll.replaceFormulaData(...) 解析后再进行变换。

## **v13.5250.8**

• 修复了 save / check 对话框在切换能力值（含 MidiQOL 能力下拉菜单）时不重新评估的问题：AC5E 现在在 d20 掷骰配置对话框的 ability 变更时重新运行 flag 评估，修复了切换能力后 save.modifyDC 等能力绑定 flag 仍停留在初始能力上的问题。

• 技能和工具检定也跟随相同的能力切换重新评估路径，保持修改器/优势/DC 行为在切换能力后的一致性。

• MidiQOL 的 save / check 归因现在包含 AC5E modifyDC 原因。

• 新增 ac5e.debug.usesCount，用于针对性地调试 usesCount 的执行逻辑。

• 快进 d20 掷骰现在能将 AC5E 解析出的优势状态正确同步到掷骰选项/配置中，改善了 MidiQOL 模式下无对话框时的一致性。

## **v13.5250.8.1 / v13.5250.8.2**

• 重做了 MidiQOL 对 save / check 工作流的属性归因同步，使 AC5E 的优势原因及 modifyDC 原因更可靠地传入 Midi tooltip 归因列表。

• 修复：当 Midi 工作流元数据缺失时（包括先攻相关分支），AC5E 现在会回退为显示自己的聊天 tooltip，确保原因信息仍然可见。

## **v13.5250.9**

• criticalThreshold / fumbleThreshold 现在支持带骰子和数学辅助函数（如 min(...)、max(...)）的数值表达式作为阈值公式，例如 set=min(4, 1d8)。

• 修复了 d20 对话框中将 AC5E opt-in 的优势/劣势效果关闭后未正确还原到正常状态的问题：对话框现在先从冻结的基准状态重建，再重新应用当前 opt-in 状态，防止取消选中后旧模式残留。

• 新增 ac5e.usageRules.showKeys()，用于查看对象形式注册所支持的键名及预期用法。

• 合并了 MidiQOL 中 save / check 的 modifyDC 归因展示，多个来源现在渲染为一行合并的原因列表，而非多行重复的 Modified DC X (Y)；set 基准值与加法 bonus 的逻辑不变（set 作为基准，再叠加加值）。

• object 形式的 ac5e.usageRules.register({...}) 中，独立布尔值（如 partialConsume、criticalStatic）的序列化回运行时评估修复：保持结构化注册与等价原始字符串规则的行为一致。

## **v13.5250.10**

• d20 与伤害掷骰目标持久化重做：攻击掷骰现在能更可靠地持久化其解析后的目标 AC 快照，关联的伤害掷骰可复用该快照。这使 modifyAC 和强制命中/未命中的哨兵 AC 修改在攻击裁定、伤害对话框及生成的聊天消息之间保持对齐。从 attack、save 或 check 行动触发的伤害掷骰现在从该工作流最新的关联掷骰消息中读取数据。

• d20 掷骰模式覆盖处理改进：手动对话框选择若与 AC5E 建议模式不同，现在被视为显式覆盖；Alt / Ctrl 在非覆盖组合键时仍作为追加优势/劣势来源；Shift+Alt / Shift+Ctrl 在 AC5E 拥有的工作流中现在行为一致地作为显式覆盖按键处理。用户显式覆盖 AC5E 建议的 d20 模式时，AC5E 会跳过本应在被绕过的模式计算中消耗的 usesCount / cadence。

• MidiQOL 与 AC5E 两个分支的 tooltip 对等性改进：恢复了 d20 对话框覆盖时 MidiQOL 掷骰对话框的 AC5E 归因；AC5E 回退的 check / save / skill tooltip 在 MidiQOL 启用但未驱动实际工作流时，对按键和覆盖归因的处理更加一致。

• 精简了沙箱掷骰上下文字段：新增通用 d20Total、d20Result、d20ResultOverTarget 风格的数据读取，同时保留旧别名以向后兼容；攻击/伤害目标值现在优先从已持久化的目标快照中读取，而非过时的实时 AC 回退。

• 伤害对话框重渲染行为稳定化。

• 减少了冗余的掷骰对话框同步工作，移除了不必要的目标/DC DOM 同步和重量级能力对话框重渲染路径。

• 简化了攻击对话框刷新行为：攻击模式和弹药变更现在就地刷新 AC5E 攻击状态，而非强制触发完整的对话框重建/渲染周期。

• 修复了攻击掷骰对话框 modifyAC opt-in tooltip 在后续对话框重建时使用错误基础 AC 的问题：攻击掷骰对话框、聊天 tooltip 及最终目标 AC 裁定现在始终对齐到相同的修改后 AC 快照。

## **v13.5250.11**

• info 关键词（use / attack / damage / save / check 全类型支持）：完整 flag 写法为

```Plain Text
flags.automated-conditions-5e.use.info
```

```Plain Text
flags.automated-conditions-5e.attack.info 
```

等，用于在不改变掷骰公式的情况下仅显示 AC5E 原因并处理副效果。info 条目现在可在 AC5E / Midi tooltip 归因中正确显示，并在动作成功后的 use 流程中存活。info 与 update 的配合示例：

```Plain Text
flags.automated-conditions-5e.use.info | update=opponentActor.exhaustion,1
```

```Plain Text
flags.automated-conditions-5e.damage.info | update=rollingActor.hp,-1d6
```

• AC5E 默认距离计算优化：默认 AC5E 距离辅助函数现在复用已缓存的 token 边界点；MidiQOL 距离处理路径仍使用传统距离计算。

• ac5e.hasItem(...)、ac5e.getItem(...)、ac5e.getItems(...) 辅助函数更新：默认改为精确名称匹配；新增 ac5e.getItem(...) 作为返回第一个匹配结果的辅助函数；match 选项支持 name（默认）、identifier、id、uuid、any；nameMode 选项支持 exact（默认）、partial；type 选项可按物品类型筛选。示例：ac5e.getItems(\_token.id, "fire", { match: "any", nameMode: "partial" }) 返回所有名称或标识符包含 fire 的物品。

• 新增世界设置，用于全局启用优势/劣势转换公式覆盖，并可分别为优势和劣势提供替代公式（某一侧留空则保持系统原有行为）。

• 超出范围的失败判断现在在动作流程更早的阶段应用，使警告和阻断提示与主 AC5E 范围检查对齐。

• 伤害聊天归因稳定化：包括 MidiQOL 关联攻击+伤害消息在内，伤害 tooltip 现在能更可靠地保留 AC5E 的 Extra Dice 及其他选中 opt-in 的原因。