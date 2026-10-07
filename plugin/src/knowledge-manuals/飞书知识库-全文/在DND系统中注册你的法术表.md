<title>在DND系统中注册你的法术表</title>

# 新建法术列表

较新版本的dnd中添加了一种新的日志类型——法术列表。

![图片展示了DND系统DND系统中新建法术列表的操作界面。在“创建页面”下拉菜单中，“法术列表”选项被高亮显示。这与上文提到的“新建一个日志，并点击左下角的创建页面，并选择类型为法术列表，即可创建一份新的法术列表”相呼应，直观呈现了创建法术列表时选择类型的操作步骤，帮助用户明确操作位置。](https://feishu.cn/file/BEFxbKFHMojJVbxhCezcoK3bn8g)

新建一个日志，并点击左下角的创建页面，并选择类型为法术列表，即可创建一份新的法术列表。

![图片展示了DND系统中新建法术列表的界面。左侧为法术列表设置区域，有层级、法术列表类型、识别符、分组模式等可选项，当前层级为1，类型为职业，识别符为wizard，分组模式为环阶。右侧是法术列表区域，提示请将法术或法术文件夹拖拽到列表中。该图片与上文新建法术列表的操作说明相关，直观呈现了创建法术列表时的界面设置情况。](https://feishu.cn/file/Fvqfbjh7MoovsMxdzsOcV0lan9e)

创建法术列表时，SRD 或当前模组提供的任何法术都可以拖到法术列表中。对于引用可能不可用的法术的模组，可以使用侧边栏上的加号控件添加一个未链接的法术配置。这需要包含法术的名称、识别符、环阶和学派，以便正确组织。它还可以包含关于可在哪本书籍中找到法术的信息。`原始来源`字段接受法术的 UUID，如果找到提供该法术的模组，将显示指向该法术的链接。否则，将显示其占位符名称。

![图片展示的是DND系统中法术配置界面。界面上方显示“法术配置”。左侧有“法术”分类，包含Name、识别符、等级、学派等输入框。右侧“来源”分类下有规则书、页面/章节、自定义标签、原始来源等输入框。该界面与文档中新建法术列表的内容相关，用于配置法术的名称、识别符、等级、学派等信息，以及设置其来源。](https://feishu.cn/file/RzZEbZpCmohEvpx9JaHccKkbnqA)

<callout emoji="❗">
在dnd v5及以上的版本中，只有拥有识别符的法术才能正常显示在合集包浏览器中。
</callout>

法术列表有一个类型和识别符，这使得可以通过合集包浏览器查看来自多个来源的合并法术列表（如，相同职业的法术列表会自动合并），以及通过升级——选择物品将选择限制到特定的法术列表。

以职业法术列表为例，此处的识别符必须与职业物品详情页的识别符一致。背景/种族/子职业类似。

![图片展示了DND系统中“Wizard”职业的详情界面。界面中“识别符”处以红色框突出显示，其值为“wizard”，并有文字说明此职业的数据可以在掷骰公式中使用@classes.wizard取得，识别符只能包含字母（a - z）、数字（0 - 9）、半角破折号（-）和半角下划线（_）。该图片与上下文内容相关，上下文介绍了法术列表的类型和识别符，以及职业法术列表识别符需与职业物品详情页一致等信息，此图直观呈现了识别符的填写示例。](https://feishu.cn/file/P0bHbwQPpofhOTxXsp2cM14PnLe)

也可以指定默认的分组模式，尽管查看者始终可以更改他们查看列表的方式。可以按法术环阶、法术学派或法术名称的首字母进行分组。

为了方便我们注册法术列表，一般需要将这份日志放入合集包之中（因为合集包内日志的UUID始终不变）并导入成mod。



# 注册法术列表

法术列表的日志条目页面可以在module.json的标志中注册，允许系统自动加载它们，并填充合集包浏览器中可用的共享法术列表，并为其他功能提供支持。

为了注册法术列表，你需要在module.json中添加以下字段，并"spellLists"中的内容替换为你的法术列表的UUID

```JSON
{
  "flags": {
    "dnd5e": {
      "spellLists": [
        "Compendium.dnd5e.rules.JournalEntry.QvPDSUsAiEn3hD8s.JournalEntryPage.ziBzRlrpBm1KVV0j",
        "Compendium.dnd5e.rules.JournalEntry.QvPDSUsAiEn3hD8s.JournalEntryPage.cuG9d7J9fQH9InYT",
        "Compendium.dnd5e.rules.JournalEntry.QvPDSUsAiEn3hD8s.JournalEntryPage.MWiN7ILEO0Vd3zAZ",
        "Compendium.dnd5e.rules.JournalEntry.QvPDSUsAiEn3hD8s.JournalEntryPage.FhucONA0yRZQjMmb",
        "Compendium.dnd5e.rules.JournalEntry.QvPDSUsAiEn3hD8s.JournalEntryPage.sANq9JMycfSq3A5d",
        "Compendium.dnd5e.rules.JournalEntry.QvPDSUsAiEn3hD8s.JournalEntryPage.PVgly1xB2S2I8GLQ",
        "Compendium.dnd5e.rules.JournalEntry.QvPDSUsAiEn3hD8s.JournalEntryPage.mx4TsSbBIAaAkhQ7",
        "Compendium.dnd5e.rules.JournalEntry.QvPDSUsAiEn3hD8s.JournalEntryPage.k7Rs5EyXeA0SFTXD"
      ]
    }
  }
}
```

一般来说，在module.json中注册的法术列表不一定要归属于该mod的合集包内，不过为了维护需要，他们最好一致。



## 如何获取法术列表的UUID？

对于已创建的法术列表，进入编辑模式后，点击右上角的文档按钮即可复制UUID

![图片展示的是DND系统中法术列表的编辑界面。界面上方显示“层级1”及“法术列表类型”为“职业”等信息，右侧有“显示页面标题”等选项。下方有“识别符”“分组模式”等设置区域，以及“描述”区域，可进行格式、字体等编辑。右上角有“文档”按钮，点击后可复制UUID，图片右侧红色框突出显示了该“文档”按钮。此图与文档中介绍法术列表注册时复制UUID的操作说明相关，直观呈现了操作位置。](https://feishu.cn/file/WHe8bZngloElF8xKcaRclVh6nSc)

需要注意的是**日志的UUID与日志页面的UUID不同**，而法术列表的UUID归属于日志页面的UUID。

> **日志的UUID：**JournalEntry.u4Yrqv4DpttHTwY6
> 
> **日志页面（法术列表）的UUID：**JournalEntry.u4Yrqv4DpttHTwY6.JournalEntryPage.x2O6VSSOjtdNDc8s