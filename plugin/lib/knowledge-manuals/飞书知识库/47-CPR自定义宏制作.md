# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/FT2KwikmSiSOqxkH3VUcLydXn9g

1. 为了后续方便，这一步与下一步也必须在最开始就做好，首先，创造一个宏合集包，你可以随意将其命名。
1. 打开配置设定，切换到CPR的配置设定，打开合集包选项，选择宏合集包，然后选定你创建的合集包
![图片](images/XgOAb2l9BoBotuxpW9ac47svn3c.png)
1. 如果第二步配置成功，当你在新建的宏合集包中创建新宏时，应该会默认自动插入这一段代码：
![图片](images/GmHsbasGlo6IbtxAMiVc5lKUnTd.png)
1. 接下来前往CPR的GitHub，找到你想要修改的宏，然后将代码拉到最底部，你应当可以看到以export开头的数行代码，如下图，记住这个宏有几个export，这决定我们需要创建几个宏：
![图片](images/MfSRbEpdYod1iqxYsBkcemzpnbc.png)
如上图，储法戒指的宏有两个export代码块，因此我们需要创建两个宏，命名无关大雅。
1. 分别注意不同的export代码块中引用的宏，以储法戒指为例，
```
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
注意到export let ringOfSpellStoring中调用了use,equipOrUpdateRing,unequipRing 三个宏/函数，同理可得export let ringOfSpellStoringSpell 中只调用了earlySpell一个宏/函数。
1. 复制函数/宏，要注意不要复制以import 开头的代码，已知我们需要两个宏，如果第一个宏是ringOfSpellStoring 部分，注意到它的导出export调用了三个函数，因此我们需要将这三个函数async function use({workflow}),async function equipOrUpdateRing(item),async function unequipRing(item)的代码全部复制到新宏中。 接下来第二个宏是ringOfSpellStoringSpell 部分，因此只需要复制粘贴async function earlySpell({workflow}) 的代码。之后你可以修改对应的宏代码以达成你想要的效果。
1. 替换export let something = 为return 然后将剩下的所有的export代码复制到对应的新宏底部，并添加标识符identifier: 'something’ 以及对应的rules: 'legacy' 或是 rules: 'modern' （取决于这个物品用于5e还是5e），以储法戒指的ringOfSpellStoring 部分为例，这一步最后的效果应该是:
```
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
1. 在此明确：如果你只完成了以上步骤，那么恭喜你已经制作好了你的第一个cpr自定义宏，但是需要注意的是这么做的宏会覆盖原本的自动化，我们接下来介绍如何创建新的自动化，为此我们只需要修改identifier 为一个新的唯一的值，比如identifier: 'MynewringOfSpellStoring',
1. 将自定义的新自动化绑定到指定物品：为此你需要将物品导出为JSON，然后为其中添加如下字段
```
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
```
chrisPremades.utils.effectUtils.addMacro(物品, 宏类型（如'midi.item'）, [标识符]);
```