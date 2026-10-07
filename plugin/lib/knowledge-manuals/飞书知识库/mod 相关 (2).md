<title>mod 相关</title>

![图片展示了一条聊天记录，用户“种岛葵”以LV100君主身份发言，内容为“我草拟吗的，装个fvt贵成这样，还装不上，特码的mod都看不到，你们不是运维吗？给我干活！”。该图片位于介绍如何找到并下载mod的文档中，可能是用户在安装mod时遇到问题后，对系统运维人员的不满表达，与上下文关于mod安装的介绍形成对比，突显用户在安装mod过程中遇到的困扰。](https://feishu.cn/file/Ao68bA7d7o7f9axBbafcPXb7nBe)

# 已经知道一个 mod 的名字/缩写/ID，我该如何找到并下载这个mod？

<callout emoji="🤠"><p>如果你没有安装加速补丁<cite doc-id="GBLNw30Biiq6iKk8DF8cx4oMnAb" file-type="wiki" title="FVTT 系统与MOD下载加速代理 v12-14支持" type="doc"></cite>，那么请参阅<cite doc-id="TatpwFDdQiAEzekbIuFcfOTDnUh" file-type="wiki" title="手动安装教程" type="doc"></cite>。</p></callout>

**<cite doc-id="LQZ9wobcrilskDkxOTzc9rj7neU" file-type="wiki" title="mod 访问一览表" type="doc"></cite>**提供了大多数常用mod的访问链接，你可以直接使用加速补丁，右键你想要安装版本的Manifest URL，复制链接

![图片展示了mod的版本列表及对应操作按钮。其中，Version 13.0.42版本下，有“Manifest URL”和“Read Notes”两个按钮，其中“Manifest URL”按钮被红色圈出突出显示。该图片与文档中mod安装步骤相关，对应文档中“右键你想要安装版本的Manifest URL，复制链接”这一步骤，用于指导用户在mod版本列表中找到并复制Manifest URL。](https://feishu.cn/file/ZtaHbjflwojSgXxEUumcvcSsnRh)

之后回到你 FVTT 的主界面，打开安装mod，将你复制的链接粘贴到下图所示的框内并点击安装

![图片展示的是FVTT（Foundry Virtual Tabletop）安装模组界面。左侧为模组分类列表，如全部、基础内容、独占内容等。右侧是筛选模组区域，显示了Gatherer、FX Bus等模组信息，包括作者、版本号、状态（已安装/未安装）及安装按钮。界面底部有“清单地址”栏，标注为https://path/to/module.json，下方有“安装”按钮。该图片与文档中介绍安装mod的上下文相关，用于指导用户在FVTT主界面安装模组时的操作。](https://feishu.cn/file/VF39b2PT4odzu7x9PmnczJcwnRc)

fvtt会自动帮你处理好依赖项的安装。



# 如何判断一个包的类型是系统，mod，还是世界？

取决于包的json，module.json是mod，world.json是世界，system.json是系统，他们在用户数据文件夹中分别处于modules/systens/worlds文件夹下。



# 在线安装 mod 一直报错？下载卡进度不动？

你的服务器无法直连Github。

可以使用<cite doc-id="GBLNw30Biiq6iKk8DF8cx4oMnAb" file-type="wiki" title="FVTT 系统与MOD下载加速代理 v12-14支持" type="doc"></cite>进行换源处理从而实现在线下载，亦或者使用<cite doc-id="TatpwFDdQiAEzekbIuFcfOTDnUh" file-type="wiki" title="手动安装教程" type="doc"></cite>来下载 mod。

需注意，对于一些将资源挂载在其他国外网站（如Google云盘）的mod，加速补丁无法处理，你需要手动安装或者使用其他手段。



# 我在<cite doc-id="LQZ9wobcrilskDkxOTzc9rj7neU" file-type="wiki" title="mod 访问一览表" type="doc"></cite>中找不到我想要的mod

FVTT 官网的搜索功能较差，我们更推荐使用Bing国际版/谷歌等搜索引擎，输入`fvtt+你要搜索的mod名/id`的方式来找到对应 mod 的 GitHub/官网页面。

![图片展示了在Bing搜索引擎中搜索“fvtt midi”后的结果页面。页面上方有Bing图标及搜索框，搜索框内显示“fvtt midi”。搜索结果中，第一个是“Midi Quality of Life Improvements | Foundry Virtual Tabletop”，其下方有“翻译此结果”选项；第二个是“Purchase”，内容为购买软件许可；第三个是“Midi SRD”，介绍其由Kandashi创建，以帮助用户。该图片与文档中介绍使用搜索引擎查找mod信息的内容相关，直观呈现了搜索结果样式。](https://feishu.cn/file/NGiSbAMupoRcTBxvYROcJ5bLnXe)



# **关于 mod 错误提示**

正常安装 mod 后可能会出现如下类似的错误提示（右上角感叹号点开），这时我们只需要关注**`红色报错`**，而**`黄色警告`**可以忽略。

例如下图就属于**`黄色警告`**，这是因为字段缺失（FVTT版本更新导致的），但不影响 mod 的读取（除非作者标注了特定版本，但那种也会有提示）。

![这张图片展示了FVTT（Foundry Virtual Tabletop）的插件模组界面，呈现出mod运行时的警告提示内容。界面内标识出“软件包警告(t)”的提示项，下方针对名为“Translation: 中文 \[DnD5E\]”的模组，标注其清单中存在未知键的问题，对应上下文提到的黄色警告类型，该警告由FVTT版本更新导致字段缺失，不影响mod的正常读取，仅需关注红色报错即可，黄色警告无需处理。](https://feishu.cn/file/LRDfbIqAPoVT7Yx2aSuc7rPEnRc)

# 由于依赖问题，无法启动该项 MOD

![图片展示的是FVTT模组（MOD）启动时出现的错误提示信息。画面中以白色文字显示“由于依赖问题，无法启动该项”，背景为深色。该图片与文档中“由于依赖问题，无法启动该项MOD”部分内容对应，直观呈现了文档所描述的错误提示样式，帮助用户快速识别此类错误情况。](https://feishu.cn/file/TY69bhzKFopCXTxW26WcOazEnRd)

FVTT 会在 MOD 的 `module.json` 里读取依赖项。如果依赖的 MOD 没安装、没启用，或者版本不符合要求，FVTT 就会自动阻止这个 MOD 启动，并显示“由于依赖问题，无法启动该项”。

在“管理模组”里找到无法启用的 MOD，把鼠标移到“依赖问题”提示上，FVTT 一般会告诉你缺少或版本不符的依赖项。按照提示把对应 MOD 安装、更新并启用，然后重新启用原 MOD 即可。

如果没有显示具体原因，可以打开该 MOD 的 `module.json`，查看 `relationships.requires`，里面列出的就是它要求的依赖项。

# 启动世界或 mod 的时候提示需要依赖怎么办？

查看对应mod的`module.json`或对应世界包的`world.json`，找到json当中relationship下requires，安装其中提到的全部mod（你可以通过Bing搜索`FVTT``+对应id`的方式来快速找到依赖mod）

<callout emoji="❗">
部分mod对依赖项/系统的版本有要求，如下图对 DAE 的版本限定在最低v13.0.4，要求dnd5e系统为5.2.0到5.2.99
</callout>

![图片展示的是一个JSON文件中“relationship”下的“requires”部分。其中包含三个依赖项，分别是“socketlib”、“lib-wrapper”和“dae”，它们的“type”均为“module”。此外，“dae”还设置了“compatibility”范围，最低版本为“13.0.4”。该图片与文档中关于mod错误提示的内容相关，用于说明部分mod对依赖项/系统的版本有要求，如图中对DAE的版本限定在最低v13.0.4，要求dnd5e系统为5.2.0到5.2.99。](https://feishu.cn/file/MS6fb9iuYouAtXxyhK8cNPLqncg)

<readonly-block href="https://player.bilibili.com/player.html?bvid=1JDMQzUERU&amp;share_source=copy_web&amp;vd_source=85d1ba3ac08e6f1597e74e590f6eccc4" type="iframe"></readonly-block>



# 为什么 FVTT 官网搜不到 ClassPack 或 Plutonium？

无版权，所以这些 mod 是上架不了的。

<bookmark name="GitHub - HJSmile/classpack: 方便车卡" href="https://github.com/HJSmile/classpack"></bookmark>

<bookmark name="GitHub - TheGiddyLimit/plutonium-next: Distribution repository, please ignore." href="https://github.com/TheGiddyLimit/plutonium-next"></bookmark>



# ClassPack没有 v13 版本怎么办？

classpack的 v12 最新版可以在 v13 正常使用，之所以迟迟不更新 v13 版本是因为工作组的各位最近有事没法干活。



# FVTT V13 系统为什么我按照教程安装了 mod，却仍没有显示？

<callout emoji="❗"><p>使用<cite doc-id="GBLNw30Biiq6iKk8DF8cx4oMnAb" file-type="wiki" title="FVTT 系统与MOD下载加速代理 v12-14支持" type="doc"></cite>可以有效规避此问题。</p><p>如果没有进行在线安装，那么请确保自己阅读了<cite doc-id="TatpwFDdQiAEzekbIuFcfOTDnUh" file-type="wiki" title="手动安装教程" type="doc"></cite>。</p></callout>

1. 确认自己下载的 mod 与系统匹配，系统不适配的 mod 不会在世界中的模组管理器内显示。例如，仅限 PF2e 的 mod 在 DND 系统的世界中不会显示在世界的模组管理器中，但是会在主界面的模组中显示。
2. mod 版本太旧，`mod``ule.json` 文件里没有`id`。FVTT V13 必须读取 `module.json` 文件的`id`字段，部分 mod（如`千菓的合集`）需要添加`id`字段才能在 FVTT 识别，如添加 `"id": "dnd5e_collection_2024"`（注意末尾是否需要添加`英文逗号`）。

   > **为什么我按照上述方式添加了 id 字段还是无法读取？**
   > 
   > 使用记事本修改 `module.json` 后无法正常读取 mod，或修改 `world.json` 后无法读取世界包。
   > 
   > 此错误是因为输入了中文逗号/误删文本/没注意末尾多出来的逗号等大意引起，还有的可能是`文件编码`导致。
   > 
   > 若是`文件编码`导致的读取失败，你需要将 mod 的 `module.json` 文本编码变为`utf-8`格式；或者将世界包的 `world.json` 文本编码变为`utf-8-bom`。

   > **文件编码：**
   > 
   > 最好是不要直接使用记事本编辑 `module.json` 或 `world.json` 文件，使用 notepdd++ 或其他专业软件编辑更为合适，这样不会导致文件编码出现变化。
3. 文件夹嵌套
4. 没有根据`id`重新命名 mod 文件夹
5. 手动安装 mod 后没有重启 FVTT
6. mod 与版本不匹配，下载版本支持的mod
7. 打包仓库而不是下载release
8. 没有去除 mod 验证，没有将 module.json 中的`"protected": ``true` 改成 `false`并删除 signature 文件，多适用于拼车 mod，此时报错一般如下：`Invalid signature file for protected module "xxxx"`

![图片展示了两个报错信息，均为“Invalid signature file for protected module 'boss-loot-adventures-premium'”和“Invalid signature file for protected module 'boss-loot-assets-premium'”。这些报错信息位于文档中介绍FVTT V13系统mod安装问题时，对应报错与原因部分。上下文提到此类报错级别为warning，无需关心，图片直观呈现了报错内容，帮助理解mod安装问题中可能出现的报错情况。](https://feishu.cn/file/ZtIlbls4DoiPXbxE6fvcIJkLnWf)

1. 其实没有安装，不过是自己脑补安装了（😃）
2. 其实没有启用，不过是自己脑补启用了（😃）

以下是报错与对应的原因，级别为warning的都不需要关心：

| 报错原文 | 级别 | 原因 | 是否加载 | 推荐处理 |
|-|-|-|-|-|
| `Invalid signature file for protected module "{id}"` | error | 付费模块签名校验失败（许可证/版本/签名文件不匹配） | 否 | 去除module.json中的  <br/>`"protected": true` |
| `Error loading module "{path}": {message}` | error | `module.json` 无法读取或 JSON 解析失败（损坏/截断/编码问题） | 否 | 修复编码格式或卸载重装 |
| `Invalid module "{id}" detected in directory "{dir}"` | error | `module.json` 的 `id` 与所在文件夹名不一致 | 否 | 修改文件夹名称使之与`module.json`中的id一致 |
| `Metadata validation failed for module "{id}": {message}` | error | `module.json` 严格校验失败（缺字段、非法 id/版本、引用文件不存在、compendium 非法等） | 否 | 按照教程重装mod，尤其不要自作聪明地打包仓库 |
| `The file "{file}" included by module {id} does not exist` | error（多为上一个报错的子原因） | `module.json` 引用的脚本/样式/语言/compendium 文件缺失 | 否 | 补齐文件或重装。尤其注意不要打包仓库，去下release |
| `The "{title}" module's manifest contained the following unknown keys: ...` | warning | `module.json` 含 FVTT 不认识的字段 | 是 | 可忽略；可反馈作者清理 |
| 字段级校验失败（validationFailures） | warning | 个别字段值不合法但可回退处理 | 是 | 可忽略 |
| `Failed data migration for {name}: {message}` | warning | `module.json` 从旧版本迁移失败 | 是 | 一般可忽略，留意兼容性，必要时重装 |
| `Database ... failed connection and cannot be accessed`（compendium 连接失败） | error | 模块 compendium 数据库损坏/无法连接 | 部分 | 卸载重装；勿手工删除合集包文件 |



# DSN（DIce So Nice）设置无法打开？

原因未知的bug，一般来说新建一个GM账号，使用新的GM账号进行设置就可以解决。



# Item Piles无法正常使用？

几乎所有此类问题都是因为没有**安装对应系统子mod（如Item Piles:DND5e）**导致的。如果安装了依然有问题，请确保两者均更新至系统兼容的最新版本，并尝试重置Item Piles的系统默认设置（常见于从旧版本升级的世界包）

![图片展示的是Item Piles模组配置界面中的“系统专门设置”选项卡。界面上方有“导出配置”“导入配置”“关闭”按钮。下方有“重置系统专门设定为默认”提示，说明此操作将把物品堆的所有设置重置为当前游戏系统的默认设置。右侧有一个“重置设置”按钮，其背景为灰色，按钮上有黑色的重置图标。该图片与文档中“重置Item Piles的系统默认设置（常见于从旧版本升级的世界包）”的内容相关，直观呈现了重置设置的操作位置。](https://feishu.cn/file/IUFObTbhAoV1YoxH0SIcjpkFnP9)



# 为什么我的动画或音效无法播放？

<cite doc-id="MjSTwAHuFi9JfCkt8bUcVhrAnMd" file-type="wiki" title="动画 mod" type="doc"></cite>