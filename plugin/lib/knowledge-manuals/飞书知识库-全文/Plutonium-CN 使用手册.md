<title>Plutonium-CN 使用手册</title>

# Plutonium-CN核心功能

**Plutonium-CN**可以帮助你简单快捷的将D&D 5e的内容导入导入到游戏中，例如物品、职业和生物等。支持官方资源和第三方资源。

> `5eTools`、`Plutonium`和`Better20`的作用在于帮助你获得**你已经购买的内容**的数字版本。在你查阅这些内容时，请确保你的行为符合当地的法律！
> 
> Plutonium-CN是基于原版Plutonium的简体中文魔改版本，并不是由原作者Giddy维护，遇到任何问题请加QQ群：`1065952534` 联系 **@Kiwee**



# 导入内容

这是Plutonium-CN的主要功能：将5eTools中文站的内容导入到你的世界中。Plutonium-CN可以导入几乎所有类型的内容，包括各种生物、表格等等。在开始介绍导入功能之前，请允许我先介绍一下以下功能：

## 🚫 世界内容黑名单

随着`D&D 5e 2024/2025`规则（也就是我们常说的`5r`）的发布，许多DM还是倾向于使用`2014规则`。自FVTT DND v4.x系统版本以来，`2024规则`被设置为了默认规则。DND系统和Plutonium-CN都支持在两个版本的规则中进行切换。Plutonium的默认设置是`跟随系统版本`。



### 修改系统设置

在设置菜单中选择`配置设定`，在弹出的面板左栏中选择`Dungeons & Dragons Fifth Edition`，然后将规则版本改为`旧版规则（2014）`

![图片展示的是Plutonium设置菜单中的配置设定面板。左栏显示多个选项，右栏对应各选项的设置内容。在右栏“规则版本”处，有一个下拉菜单，可选择“新版规则（2024）”或“旧版规则（2014）”。该图片与上文“修改系统设置”内容相关，直观呈现了在设置菜单中选择“配置设定”后，将规则版本改为“旧版规则（2014）”的操作界面，帮助用户明确操作位置和方式。](https://feishu.cn/file/IZq7bWvawoIAnKxXO9Scc3X8nWl)



### 内容黑名单

作为DM备团时，通常会要求PL只能选择指定的几本规则书或设定集中的资源。这可以通过Plutonium-CN的`世界内容黑名单`工具来实现。首先点击菜单上方的💼按钮。

![图片展示了Plutonium-CN软件中“世界内容黑名单”功能的操作界面。在软件主界面右上角，有一个图标被红色框线突出显示，点击该图标后弹出下拉菜单，其中“世界内容禁用列表”选项也被红色框线突出显示。该图片与文档中“内容黑名单”部分内容相关，用于说明在Plutonium-CN中打开“世界内容黑名单”面板的操作步骤，即点击菜单上方的💼按钮后，选择“世界内容禁用列表”即可。](https://feishu.cn/file/MvAmb608nobauBx98ZkcFKjRnPg)

打开`世界内容黑名单`面板后，选择你想要禁用的资源。（**注意：**`5eTools`选项中包含了所有威世智官方出版的内容。）选完后点击`确认`按钮。

下图展示了黑名单。你可以有选择的禁用整本资源、某个分类下的资源甚至是具体到某个内容。下图展示的例子中禁用了所有`2024资源`。

![图片展示了Plutonium-CN中世界内容黑名单界面。界面上方有多个来源选项，如UA/Etc. Sources、Comedy Sources等，部分选项带有红色删除图标。下方有“添加到黑名单”按钮，以及“导出黑名单”“导入黑名单”“重置黑名单”按钮。下方Blocklist区域显示了黑名单内容，包括来源、分类、名称等信息，每条内容右侧有红色“删除”按钮。该图片与文档中介绍黑名单设置的内容相关，直观呈现了黑名单的操作界面及部分黑名单内容示例。](https://feishu.cn/file/GGKCbdnszoi9PpxJIhJct7M2njg)

这是通过在`来源`下拉框中选择对应的资源，并点击`添加到黑名单`按钮来实现的

当启用黑名单时，导入`职业和子职`的面板会变成下图这样（不包括`2024资源`）：

![图片展示的是Plutonium-CN导入职业/子职界面。左侧为职业/子职分类列表，如吟游诗人、巫术师等。右侧是具体职业/子职名称列表，如低语学院、吟唱学院等，部分名称后有“SCAG”标识。](https://feishu.cn/file/ByUQbe9ORo79wLxaaMGcxDKgn5E)



### 导入导出黑名单

在切换到不同世界后，你可以用这个功能来将旧世界的黑名单导出，并在新世界导入，以免重复设置。这个功能的按钮可以在`来源`下拉框下面找到。导出的格式为Json，导入时通过文件浏览器选择这个文件即可。

下面这段是导出的`content-blocklist.json`文件内容，其中包括`2024规则`的内容。你可以直接复制并将其保存为一个json文件，然后在你的世界中导入这个文件。

```Plain Text
{
    "fileType": "content-blocklist",
    "moduleVersion": "2.2.3",
    "blocklist": [
        {
            "displayName": "*",
            "hash": "*",
            "category": "*",
            "source": "XDMG"
        },
        {
            "displayName": "*",
            "hash": "*",
            "category": "*",
            "source": "XScreen"
        },
        {
            "displayName": "*",
            "hash": "*",
            "category": "*",
            "source": "XMM"
        },
        {
            "displayName": "*",
            "hash": "*",
            "category": "*",
            "source": "XPHB"
        }
    ]
}
```



### Plutonium-CN导入功能 注意事项

有一些人在装好Plutonium-CN后，总是想把全部内容都导入进世界中。基于以下几点原因，我十分不建议你这样做！

- Plutonium-CN的数据都是存放于`本地`的，你不需要担心数据丢失的风险，一旦你装好了这个模组，所有的数据就已经打包在里面了。虽然图片没在里面，但是你可以通过Plutonium-CN的💼来预加载图片。
- 内容一旦从Plutonium导入到游戏中之后，这些内容就不会随着Plutonium-CN的更新而更新（**尤其是现阶段，每次更新都会有一部分机翻内容被人工搬运的高质量内容替换**）。所以，我非常不建议你把Plutonium的内容与导入为合集包使用。
- 当你直接在面板上导入角色数据时（面板上面的三个点的按钮），Plutonium能够利用其自己的工作流和数据，来触发一些自动化功能，如果你从合集包导入的话，可能很多功能无法触发。 
- 在你的世界中导入大量内容可能导致加载时间变慢。建议仅导入实际会用到的内容，如果你的确需要导入大量的内容，建议直接导入到合集包中。



## 导入到世界

导入到右侧导航栏的下列文件夹中：

- 角色
- 物品
- 日志条目
- 随机表

点击导航栏上方的“Plutonium`导入`按钮来打开`导入向导`。

![图片展示的是Plutonium-CN游戏导入器界面。左侧为导入器类型列表，如动作、背景、职业等。中间部分是职业&子职数据来源，有“5eTools”“自制内容”“自定义URL”“AvantGic: 霸王之月”选项，其中“5eTools”被选中。右侧是配置并导入职业&子职的设置区域，有保持暂存开启、导入到目录、导入到合集集等选项，下方有职业、专长、法术等导入内容列表。该图与文档中导入内容部分相关，展示了导入器的具体操作界面。](https://feishu.cn/file/F7oTbx6NAoc3JBxgELGc3aOZnXb)

1. **选择导入器**：选择你想导入的类型
2. **选择数据来源**：选择你想导入的数据来源，以下列图标分类：**☆ 🧪** 

   ![](https://feishu.cn/file/OdsibhjseokBgWxhXPcc1Oinneb)

   -  威世智官方资源 （核心规则、扩展等）请注意：`5etools` 来源中含有所有官方资源

   - 威世智出版的合作资源

   - 预发布资源 (Unearthed Arcana, OneD&D playtest material).

   ![](https://feishu.cn/file/IqYfbTzOJoTAWXxlih5c6tkCntc)

   -  自定义来源

   ![](https://feishu.cn/file/FNIQbFC35obc9FxjLgZct6FMnTl)

   -  自制内容Homebrew (紫色表示公开库中的内容，蓝色表示本地文件)。

有一部分数据类型会有非常非常多的来源，你可以使用上方的“筛选”和“搜索”功能来筛选掉不需要的来源

1. **配置并导入:** 导入来源的概览以及导入位置的配置

   - **导入路径：**决定了内容将会被导入到哪里。你可以修改其路径名、添加子路径或者选择已有的文件夹。
   - 如果你选择`自定义URL`作为来源，你需要在这里输入URL。

所有东西都被设置好后，你就可以点击右下角的按钮来打开导入器了。你可以使用导入器上方的搜索栏和筛选功能来查找你想导入的内容。当你找不到某些内容时，先看看是不是被筛选掉了（有一些内容默认会隐藏掉），这些筛选功能和5etools网站上的一样。

你可以在导入器中点击`+`按钮来预览数据卡。当你找到要导入的内容时，你可以点击左侧的复选框（同时导入多个或者需要进一步配置时）或者点击`▶`按钮来不进行任何配置立即导入。

### 范例: 导入表格

![](https://feishu.cn/file/AW4tbXrGAoGFgsxgzRVct5Xbnff)



## 导入到角色

FoundryVTT中的`角色`指的是角色卡，包括玩家角色卡、NPC角色卡以及载具卡，向其中任意一项导入的步骤都是一样的。可以导入的内容包括角色等级、子职特性、其他角色创建选项、物品、法术等等。

<callout emoji="▶️">
在车卡时，最好直接在角色卡中导入内容，尽量避免从文件夹和合集包中拖拽。
</callout>

### 范例：导入角色等级

![](https://feishu.cn/file/GyiGb8dAEorrGlxKviKcsXRjnfb)

### 范例：导入专长

![](https://feishu.cn/file/TZn0b2ycToJGaGxDxp1cogRankg)

### 范例：导入物品

![](https://feishu.cn/file/LQbtbmzDHorel3xkKWtcMhBvnid)

### 范例：导入种族

![](https://feishu.cn/file/X8ewblQHgoBHnbxaYO4cpqW5nEh)

### 范例：导入法术

![](https://feishu.cn/file/JFkobYCHTolNlMxlovWcm6A5nyh)



## 通过Rivet导入

Rivet是火狐和Chrome浏览器（也支持使用Chrome内核的其他浏览器）的插件。它可以帮助你绕过导入向导，直接将5eTools上的数据卡发送到FoundryVTT上。

当Rivet插件启用时，你会在5eTools的数据卡上看到`通过Rivet`传送的按钮。点击后，对应的内容将发送到你的世界中。在Plutonium上设置后，它也可以直接导入到某个指定的角色Actor上

<figure view-type="Card"><source name="rivet.zip" mime="application/x-zip-compressed" size="39568" token="MNRKb6yFcomLXhxyz3RcWdhSnPb"/></figure>

<figure view-type="Card"><source name="rivet_chrome.zip" mime="application/x-zip-compressed" size="39111" token="OeIMbgLVsoByJixlQqncGl85nFe"/></figure>

<callout emoji="▶️">
每个Plutonium-CN版本对应的Rivet源代码可以在Plutonium-CN模组的根目录中找到。
</callout>

<callout emoji="⚠️">
只有当5eTools和FoundryVTT在同一个浏览器中打开时，Rivet才能正常传送。
</callout>

![](https://feishu.cn/file/C66kbLd44o5NpZxRUXXcekfFnuf)



# 装备商店

![](https://feishu.cn/file/GatJbNo4gokaUkx2MHacNlAznke)



# 兼容Quick Insert模组

<bookmark name="Quick Insert - Search Widget" href="https://foundryvtt.com/packages/quick-insert"></bookmark>

Plutonium-CN完全兼容Quick Insert模组。这个模组的功能介绍和使用说明可以去他的模组网页查阅。这个模组能够很好的覆盖合集包的功能。



# 其他功能

Plutonium-CN为用户提供了大量的功能，其中一部分甚至可以在非DND5e系统中使用，下面将具体介绍这些功能以及他们如何使用。

需要注意的是，其中一部分功能是需要在Plutonium的设置中开启。通常来说，一些侵入式或可选的功能默认是关闭的。

![图片展示了Plutonium-CN的目录功能列表。列表中包含多个功能选项，如目录清理器、目录去重器、目录批量移动器、所有权批量移动器、所有权限批量移动器、Bulk Prototype Token Editor、战利](https://feishu.cn/file/FWHBbjvCFoZ7QAxpDiBcwjPPnMc)



## 美术资源浏览器

美术资源浏览器已不再维护，所以相关的介绍不再展开，有兴趣的可以去[英文Wiki](https://wiki.tercept.net/en/Plutonium/Features-Guide)查看



## 批量移动

此功能可以帮助你在文件夹之间批量移动资源

![图片展示的是Plutonium-CN中批量移动功能的目录批量移动器界面。界面上方有“选择目标目录”下拉菜单，当前显示“请选择”。下方表格中列出了多个文件夹选项，如“生物/命运鬼婆”“生物/坠星传谕使”等，每个选项前都有复选框。表格右侧有“重置”按钮。该界面用于帮助用户在文件夹之间批量移动资源，与文档中介绍的批量移动功能上下文对应。](https://feishu.cn/file/GoRobAGKuokHzmx4KkbcJIe3nef)



## 权限批量编辑器

此功能可以帮助你批量修改目标的权限

![图片展示的是Plutonium-CN的权限批量编辑器界面。界面上方有“筛选”和“搜索角色...”按钮，右上角有“重置”按钮。下方分为“全部玩家”和“Gamemaster”两部分，每部分有“筛选玩家”选项，下方列出多个角色，如“生物/命运鬼婆”等，部分角色下拉菜单显示“None”，部分显示“Owner”，还有“...](https://feishu.cn/file/IUCpbAEv3o9FQYxxfHNc0uqCnUb)



## 聊天合并

将同一个用户的连续发言合并在一起。

![图片展示了Plutonium-CN模组中聊天界面的截图。画面中显示了Gamemaster的聊天记录，内容为“哈哈哈”“牛！”“好多条合在一起了”，每条消息后都有绿色的线条标识。该图片与文档中“其他功能”部分上下文相关，直观呈现了模组聊天功能的实际效果，辅助说明了聊天功能在游戏中的应用情况。](https://feishu.cn/file/MzdsbxXUaomtY2x278yczfyMn8g)



## 紧凑UI

使得UI更加紧凑，以便在同一页中显示更多的内容

<grid>
<column width-ratio="0.500000">
![图片展示了Plutonium-CN模组的紧凑UI界面。界面顶部有“Create Item”“Create Folder”等按钮，以及“Plutonium Import 自动生成](https://feishu.cn/file/Zivibk3m2oIQNoxLlb1cKS3Onwc)
</column>
<column width-ratio="0.500000">
![图片展示了Plutonium-CN模组的紧凑UI界面。界面顶部有“Create Item”“Create Folder”等按钮，以及“Plutonium Import”按钮。下方是“Search Items”搜索框，下方列表显示了“Folder 1”“Folder 2”“Folder 3”等文件夹，以及各文件夹下的“Item 1”“Item 2”等物品。该图片与文档中介绍Plutonium-CN紧凑UI功能的内容相关，直观呈现了该功能下UI界面的样式和布局。](https://feishu.cn/file/YQFsbQ2ZXoUdJqxJZddcjmJGnDe)
</column>
</grid>



## 动画加速

此功能使得某些UI的创建动画更快



## 数据源选择器（白名单）

与黑名单相反，可以配置应当显示哪些内容



## 目录去重器

此功能可以帮助你去掉重复的内容



## 效应语法扩展

Plutonium-CN增加了基础掷骰表达式的效应语法，支持例如`+@abilities.cha.mod`的格式

当[Dynamic Active Effects (DAE)](https://foundryvtt.com/packages/dae)模组安装后此功能将自动禁用



## 效应配置UI扩展

为效应关键词添加搜索功能及优先级选项。

当[Dynamic Active Effects (DAE)](https://foundryvtt.com/packages/dae)模组安装后此功能将自动禁用



## 掷骰数据扩展

为掷骰数据添加`@srd5e`命名空间，包括以下字段

```Python
# `@srd5e.userchar`, as a reference to the current user's character
@srd5e.userchar.name
@srd5e.userchar.id

# ID of the current user
@srd5e.user.id

# `documentName` is the lowercase alpha-numeric-only name of the current document.
# E.g. when rolling a "+1 Longsword" this will be "1longsword".
# The value of this key is always `1`. This allows for expressions of the form: `+(@srd5e.name.eldritchblast * @abilities.cha.mod)`
@srd5e.name.<documentName>
```



## 优化 ESC 键

优化ESC键的功能，使其更符合用户的使用习惯，ESC功能优先级如下

1. 删除（当前光标所在的输入框）
2. 删除图像元素
3. 关闭当前菜单
4. 关闭窗口（按照最近使用开始关闭）
5. 切换主菜单



## 日志清理器

快速清理内容（当你需要排查导入错误时很实用）



## 日志内嵌

此功能可以将5eTools的链接直接嵌入到日志条目中，以便快速导入那些内容。



## 战利品生成器

此功能可以快速生成并导入遭遇获得的战利品。

![图片展示的是Plutonium-CN中战利品生成器界面。左侧有“按CR生成冒险奖励”“按CR随机生成”“战利品表”“队伍战利品”等选项卡，当前选中“按CR随机生成”。下方有“挑战等级”“是库藏宝藏？”等输入框，以及“生成战利品”“清除输出”按钮。右侧为输出区域，显示“个人宝藏 for 挑战等级 0-4”，包含“12 GP in coinage:”及“12 GP”。该界面与文档中战利品生成器功能介绍相关，直观呈现了其操作界面及输出示例。](https://feishu.cn/file/TTQIbVlqgoMXvSxG9ABcw5UAn4L)



## 大规模法术准备工具

大规模法术准备器是为玩家提供批量修改已知或准备法术的工具，比起一个一个选择或删除要快捷得多。操作步骤如下：

1. 点击角色卡上面的工具栏按钮（三个点）
2. 选择大规模法术准备器
3. 在弹出的窗口中选择准备的法术

![图片展示了Plutonium-CN的界面。左侧是角色卡，显示角色为“盗贼”，等级10，生命值10/10，法术点1/1，技能栏有“暗影步”等技能。右侧是“Spell Prepared Toggle”窗口，列出多种法术，如“暗影步”“暗影箭”等，每种法术有等级、耗法术点数、耗时间等信息，还设有“上移”“下移”“删除”等操作按钮。该图与文档中“优化ESC键”部分相关，展示了在该功能下角色卡和法术准备窗口的界面情况。](https://feishu.cn/file/N5AIb3xTOoDk6DxhbaaczQSBnFe)



## 公制单位转换器

Plutonium-CN支持自动将尺、英里等单位转换为公制单位，此功能需要在设置中手动开启，例如：

1. 导入（物品）->换算重量单位
2. 导入（法术）->换算法术范围



## 多重攻击掷骰

可以一键为自动攻击掷骰（此功能在Plutonium-CN中暂不支持）



## 浏览器标签页名称

Plutonium能够将当前场景的名字设置到浏览器标签页上



## ~~外置数据卡~~

~~允许将数据卡在新窗口中打开~~



## 主播模式

最小化Plutonium-CN的英雄。用SRD资源替换5etools和Plutonium的名字，需要在配置中开启。



## 隐藏Token生命值

此功能可以让玩家看到Token受到的的伤害，而不是显示Token的总生命值，若启用，每个Token的总生命值将会在Token的右下角隐藏起来。



## 世界内容黑名单

前文已经介绍过，见**导入内容**章节



# 兼容Midi-QoL模组（自动化）

需要安装一个额外的模组**Plutonium Addon: Automation** (PAA)

**需要使用群友改造的版本才能适配中文版Plutonium-CN**

<bookmark name="Release v10.8.1 · unlsycn/plutonium-addon-automation" href="https://github.com/unlsycn/plutonium-addon-automation/releases/latest"></bookmark>



<callout emoji="🗃️">
更多内容正在施工中...暂时可前往[英文Wiki](https://wiki.tercept.net/en/Plutonium/Features-Guide)查看
</callout>