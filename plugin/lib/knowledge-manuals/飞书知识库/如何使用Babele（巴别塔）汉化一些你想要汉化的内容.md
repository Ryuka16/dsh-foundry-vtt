<title>如何使用Babele（巴别塔）汉化一些你想要汉化的内容</title>

本文转载自 <cite type="user" user-id="ou_b9e32790d239fc137cfa6202e2ccb3cb" user-name="时泠"></cite> 老师所撰写的博客文章，以下为原文地址：

[如何使用Babele（巴别塔）汉化一些你想要汉化的内容](https://leave-time.me/posts/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8babele%E5%B7%B4%E5%88%AB%E5%A1%94%E6%B1%89%E5%8C%96%E4%B8%80%E4%BA%9B%E4%BD%A0%E6%83%B3%E8%A6%81%E6%B1%89%E5%8C%96%E7%9A%84%E5%86%85%E5%AE%B9/)



# 前言

首先，还是一样，文档是好东西，得读：

[Documentation](https://gitlab.com/riccisi/foundryvtt-babele/-/wikis/Docs)

不要望而生畏，其实使用这个非常简单。本文将安装额外的两个模组进行辅助：

[Data Inspector](https://gitlab.com/koboldworks/agnostic/data-inspector) 与 [BTFG Module](https://github.com/DjLeChuck/foundryvtt-babele-translation-files-generator)



# 工作原理

巴别塔汉化的工作原理其实非常简单，所有的卡片（包括日志等）都是按照一定的结构去组织的，以COC为例子（P.S.:别问我为什么不用DND，我只是举个例子。）

![图片展示 addCriterion“Data Inspector”爆破”界面，展示了技能“Demolitions”的数据结构。左侧为数据路径，右侧是键值对组织的信息，如archetype、description、keeper等。右键单击key可复制路径，右键单击value可复制值。图片与上下文关系紧密，直观呈现了巴别塔汉化工作原理中卡片数据结构的组织 addCriterion“Data inspector:爆破”界面，展示了技能“Demolitions”的数据结构。左侧为数据路径，右侧是键值对组织的信息，如archetype、description、keeper等。右键单击key可复制路径，右键单击value可复制值。图片与上下文关系紧密，直观呈现了巴别塔汉化工作原理中卡片数据结构的组织方式，帮助理解数据是按照键值对（Key-Value）方式组织起来的。](https://feishu.cn/file/WL9ObojjXoUJSrxzustcJxCinsb)

给没有学过JSON与MAP相关结构的人在此科普一下：这里的信息是按照键值对（Key-Value）的方式组织起来的，类似高中数学我们学习过的映射。其中键是一个独一无二的标识符，而值则是对应的信息。

通过`Data Inspector`，我们可以直接拿到这个结构的键值信息，有什么用呢？

巴别塔的汉化原理和键值对有关。它实际上是在做替换的工作，它会按照你设置好的配置规则搜索相关字段，那之后将你的翻译文件中对应的值代替这个值。

不过如果你只是简单的翻译合集包的物品名称倒不需要这么麻烦……



# 准备工作

首先，我们来看巴别塔的翻译文件怎么写：

```Plain Text
{
  "label": "compendium_label",
  "folders": {
    "Folder A": "folder_A_translation",
    "Folder B": "folder_B_translation",
    "Folder C": "folder_C_translation"
  },
  "entries": {
    "document_name": {
      "field": "field_translation"
    }
  }
}
```

- **lable：**合集包的包名或者系统的名字（是包名）
- **folders：**如果你的合集包包括文件夹，那么这个地方的键就是你的文件夹名，值则是翻译
- **entires：**是翻译的对象，每个键是你要翻译物品的名字/ID，值则是翻译。

例如我翻译的部分对象：

```Plain Text
{
  "label": "Skills",
  "folders": {},
  "entries": {
    "Accounting": {
      "name": "会计"
    },
    "Animal Handling": {
      "name": "动物驯养"
    },
    "Anthropology": {
      "name": "人类学"
    },
    "Appraise": {
      "name": "鉴定师"
    },
    "Archaeology": {
      "name": "考古学"
    },
    "Art/Craft (Acting)": {
      "name": "艺术/技艺（表演）"
    },
    "Art/Craft (Any)": {
      "name": "艺术/技艺（任意）"
    },
    "Art/Craft (Fine Art)": {
      "name": "艺术/技艺（美术）"
    }
  }
}
```

在合集中，巴别塔会做出如下的步骤：

1. 找到名为`Skills`的合集包
2. 按照`entries`的规则，搜寻符合键的物品，例如，找到名为`Accounting`的物品
3. 将其替换为`name`的内容，例如名为`Accounting`的物品，名称会被替换为`会计`。
4. 结束

非常简单，对吧，那我们要开始加快速度了。



# 加入自定义映射

你说，诶，我不想只翻译名字，还有描述呢，这我肯定也要翻译的。这时候我们就要开始使用`Data Insepctor`了。还是按照这张图举例子

![图片展示的是Data Inspector界面，用于查看和编辑数据。界面左侧是数据路径栏，可进行搜索和过滤操作。右侧是数据内容区域，显示了技能、职业等数据项，如技能类型为skill，职业为CoC75skill，数据模型为n/a。其中，description下的value值被红色框突出显示，其值为“<p>See the Call of Cthulhu - 7th Ed C...”。该图片与上下文紧密相关，直观呈现了文档中提到的巴别塔翻译字段时，`description`下`value`存放描述这一内容。](https://feishu.cn/file/ZQh9bXVbmooAdqx3OyjcN8ftn5e)

这时候你注意到，`description`下的`value`是存放描述的地方，那么我们怎么让巴别塔能翻译这里呢？

在巴别塔内，有一个字段叫做`mapping`，这是你用来建立映射的地方。我们先来看格式：

```Plain Text
{
  "mapping": {
     "translated_field": "original_field"
  }
}
```

- **translated_field：**是你想要翻译的字段别名。
- **original_field:** 是你想要翻译字段的完整路径，按照我们刚刚讲的例子，这里的`description`的键完整名字叫做`system.description.value`，这就是路径。

映射规则应该是这样的：

```Plain Text
{
  "mapping": {
     "description": "system.description.value"
  }
}
```

接下来，你就可以通过在`entires`对象内的翻译中加入`description`来翻译简介了。

```Plain Text
{
  "label": "Skills",
  "folders": {},
  "entries": {
    "Accounting": {
      "name": "会计",
      "description": "<p>See the Call of Cthulhu - 7th Ed Core Rulebook</p>"
    }
  }
}
```



# 保存翻译文件

当我们做完翻译，该如何使用呢？

当然，巴别塔提供了两种方式，一种是将其作为模组挂载，另外一种则是保存到本地让巴别塔加载。我们主要讲第二种，第一种需要有模组制作基础，我这里简单提一下：

## 模组加载

你需要在你的脚本文件中使用巴别塔API的注册模块：

```Plain Text
Hooks.once('babele.init', (babele) => {
    babele.register({
      module: 'FoundryVTT-dnd5e-it',
      lang: 'it',
      dir: 'compendium'
    });
});
```

那之后，保证自己翻译文件的文件夹结构正确：

```Plain Text
modules/
  your_module_name/
    module_dir/
        compendium_name.json
```

## 本地文件

巴别塔的设置中有一个翻译文件目录，将其设置好后，巴别塔会读取文件夹下的对应语言文件夹下的翻译文件，例如：

```Plain Text
 babele
└──  cn
    ├──  call-of-cthulhu-foundryvtt-investigator-wizard.investigator-wizard.json
    └──  CoC7.skills.json
```

，这里我设置了翻译目录为`/data/babele`，将json文件放在cn文件夹下。





# 导出未翻译的翻译文件

为了方便翻译，我们使用`BTFG`这个模组帮我们导出巴别塔的翻译文件。

来到你想翻译的合集包，点击右上角的三个点，那之后你会看到这个画面：

![图片展示图片为“Compendium exporter”界面，显示了“Skills”合集包的导出设置。界面提示导出的合集包不能包含已由Babele汉化的数据。可进行“Custom data mapping”自定义数据映射，如将“description”映射到“system.description.value”；选择“Existing translation file”更新现有翻译文件；勾选“Sort all entries alphabetically”等选项；还有“Generate a Foundry module template”生成模块模板功能。该图与上下文介绍的导出未翻译的翻译文件操作相关，展示了操作时的界面及可设置的选项。](https://feishu.cn/file/FqvPbkeEUolcnKxtrr9cDyPFnvf)

我们只需要关注两个部分：

1. `Custom data mapping`，和我们讲到的mapping规则相同，设置之后会按照你的规则导出对应字段
2. `Use id as entry key`，勾选这项后，翻译的键将会变成文档UUID，推荐有重复名字时使用。

然后点击`Generate translate file`即可。