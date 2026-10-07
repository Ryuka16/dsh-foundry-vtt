# 如何制作CPR自定义宏

1. 为了后续方便，这一步与下一步也必须在最开始就做好，首先，创造一个宏合集包，你可以随意将其命名。



1. 打开配置设定，切换到CPR的配置设定，打开合集包选项，选择宏合集包，然后选定你创建的合集包

![图片展示了《Dungeons & Dragons 5.150》游戏中的“游戏设定”界面。左侧为“Cauldron of Plentiful Resources”合集包的配置设定，有通用选项、对话框选项、UI选项等分类。右侧是“Cauldron of Plentiful Resources”合集包的配置界面，显示了专长合集、宏合集包、怪物合集包等选项，其中“宏合集包”选项被红色箭头指向。该图片与文档中制作CPR自定义宏的上下文相关，用于说明在游戏设定中找到宏合集包选项的操作步骤。](https://feishu.cn/file/XgOAb2l9BoBotuxpW9ac47svn3c)



1. 如果第二步配置成功，当你在新建的宏合集包中创建新宏时，应该会默认自动插入这一段代码：

![图片展示的是CPR宏编辑界面。界面顶部显示“宏 - 宏”，下方有“类型”选项，当前选中“脚本宏”。在“为指定用户执行”输入框下方，有一段代码，内容为“const { DialogApp, Crosshairs, Summons, Teleport, utils: \[activityUtils, actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, macroUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils, thirdPartyUtils\]} = chrisPremades;”。该图片与上文介绍在CPR的GitHub找到宏并查看其代码内容的操作步骤相关，用于说明找到的宏代码样式。](https://feishu.cn/file/GmHsbasGlo6IbtxAMiVc5lKUnTd)



1. 接下来前往CPR的[GitHub](https://github.com/chrisk123999/chris-premades)，找到你想要修改的宏，然后将代码拉到最底部，你应当可以看到以export开头的数行代码，如下图，记住这个宏有几个export，这决定我们需要创建几个宏：

![图片展示了CPR自定义宏中储法戒指的代码。代码包含两个export代码块，分别为ringOfSpellStoring和ringOfSpellStoringSpell。ringOfSpellStoring定义了戒指的名称、版本、midi信息（包含pass、macro、priority等），还设置了equipcallback和unequipcallback。ringOfSpellStoringSpell则定义了戒指的spell名称、版本、midi信息。该图片与上文提到的前往CPR GitHub找到宏，查看以export开头的代码，以决定创建宏数量的内容相关，直观呈现了宏代码结构。](https://feishu.cn/file/MfSRbEpdYod1iqxYsBkcemzpnbc)

如上图，储法戒指的宏有两个export代码块，因此我们需要创建两个宏，命名无关大雅。



1. 分别注意不同的export代码块中引用的宏，以储法戒指为例，

```Plain Text
export let ringOfSpellStoring = {
    name: 'Ring of Spell Storing (0/5)',
    version: '1.1.0',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: use,
                priority: 50
            }
        ]
    },
    equipment: {
        ringOfSpellStoring: {
            equipCallback: equipOrUpdateRing,
            unequipCallback: unequipRing
        }
    },
    ddbi: {
        renamedItems: {
            'Ring of Spell Storing': 'Ring of Spell Storing (0/5)'
        }
    }
};
```

注意到`export let ringOfSpellStoring`中调用了`use,equipOrUpdateRing,unequipRing` 三个宏/函数，同理可得`export let ringOfSpellStoringSpell` 中只调用了`earlySpell`一个宏/函数。



1. 复制函数/宏，要注意不要复制以`import` 开头的代码，已知我们需要两个宏，如果第一个宏是`ringOfSpellStoring` 部分，注意到它的导出export调用了三个函数，因此我们需要将这三个函数`async function use({workflow}),async function equipOrUpdateRing(item),async function unequipRing(item)`的代码全部复制到新宏中。 接下来第二个宏是`ringOfSpellStoringSpell` 部分，因此只需要复制粘贴`async function earlySpell({workflow})` 的代码。之后你可以修改对应的宏代码以达成你想要的效果。



1. 替换`export let something =` 为`return` 然后将剩下的所有的export代码复制到对应的新宏底部，并添加标识符`identifier: 'something’` 以及对应的`rules: 'legacy'` 或是 `rules: 'modern'` （取决于这个物品用于5e还是5e），以储法戒指的`ringOfSpellStoring` 部分为例，这一步最后的效果应该是:

```Plain Text
return {
    identifier: 'ringOfSpellStoring',
    name: 'Ring of Spell Storing (0/5)',
    rules: 'legacy',
    version: '1.1.0',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: use,
                priority: 50
            }
        ]
    },
    equipment: {
        ringOfSpellStoring: {
            equipCallback: equipOrUpdateRing,
            unequipCallback: unequipRing
        }
    },
    ddbi: {
        renamedItems: {
            'Ring of Spell Storing': 'Ring of Spell Storing (0/5)'
        }
    }
};
```



1. 在此明确：如果你只完成了以上步骤，那么恭喜你已经制作好了你的第一个cpr自定义宏，但是需要注意的是这么做的宏会覆盖原本的自动化，我们接下来介绍如何创建新的自动化，为此我们只需要修改`identifier` 为一个新的唯一的值，比如`identifier: 'MynewringOfSpellStoring',`



1. 将自定义的新自动化绑定到指定物品：为此你需要将物品导出为JSON，然后为其中添加如下字段

```Plain Text
    "chris-premades": {
      "info": {
      identifier: 'ringOfSpellStoring',
      rules: 'legacy',
      },
      "macros": {
        "midi": {
          "item": [
            "ringOfSpellStoring"
          ]
        }
      },
      "equipment": {
        "identifier": "ringOfSpellStoring"
      },
    },
```

具体如何添加取决于原宏的export部分。

或是直接使用以下函数

```JavaScript
chrisPremades.utils.effectUtils.addMacro(物品, 宏类型（如'midi.item'）, [标识符]);
```