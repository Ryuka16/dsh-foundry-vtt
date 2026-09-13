# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/N9ZuwyOkqiHCmCkID9WcU32qnec

![图片](images/Ao68bA7d7o7f9axBbafcPXb7nBe.png)
# 已经知道一个 mod 的名字/缩写/ID，我该如何找到并下载这个mod？
> 💡 
[手动安装教程](https://xcnplziulnma.feishu.cn/wiki/TatpwFDdQiAEzekbIuFcfOTDnUh)[FVTT 下载加速代理](https://xcnplziulnma.feishu.cn/wiki/GBLNw30Biiq6iKk8DF8cx4oMnAb)如果你没有安装加速补丁 ，那么请参阅 。
[mod 访问一览表](https://xcnplziulnma.feishu.cn/wiki/LQZ9wobcrilskDkxOTzc9rj7neU) 提供了大多数常用mod的访问链接，你可以直接使用加速补丁，右键你想要安装版本的Manifest URL，复制链接
![图片](images/ZtaHbjflwojSgXxEUumcvcSsnRh.png)
之后回到你 FVTT 的主界面，打开安装mod，将你复制的链接粘贴到下图所示的框内并点击安装
![图片](images/VF39b2PT4odzu7x9PmnczJcwnRc.png)
fvtt会自动帮你处理好依赖项的安装。
# 如何判断一个包的类型是系统，mod，还是世界？
取决于包的json，module.json是mod，world.json是世界，system.json是系统，他们在用户数据文件夹中分别处于modules/systens/worlds文件夹下。
# 在线安装 mod 一直报错？下载卡进度不动？
你的服务器无法直连Github。
[手动安装教程](https://xcnplziulnma.feishu.cn/wiki/TatpwFDdQiAEzekbIuFcfOTDnUh)[FVTT 下载加速代理](https://xcnplziulnma.feishu.cn/wiki/GBLNw30Biiq6iKk8DF8cx4oMnAb)可以使用 进行换源处理从而实现在线下载，亦或者使用 来下载 mod。
需注意，对于一些将资源挂载在其他国外网站（如Google云盘）的mod，加速补丁无法处理，你需要手动安装或者使用其他手段。
# [mod 访问一览表](https://xcnplziulnma.feishu.cn/wiki/LQZ9wobcrilskDkxOTzc9rj7neU)我在 中找不到我想要的mod
FVTT 官网的搜索功能较差，我们更推荐使用Bing国际版/谷歌等搜索引擎，输入fvtt+你要搜索的mod名/id的方式来找到对应 mod 的 GitHub/官网页面。
![图片](images/NGiSbAMupoRcTBxvYROcJ5bLnXe.png)
# 关于 mod 错误提示
正常安装 mod 后可能会出现如下类似的错误提示（右上角感叹号点开），这时我们只需要关注红色报错，而黄色警告可以忽略。
例如下图就属于黄色警告，这是因为字段缺失（FVTT版本更新导致的），但不影响 mod 的读取（除非作者标注了特定版本，但那种也会有提示）。
![图片](images/LRDfbIqAPoVT7Yx2aSuc7rPEnRc.png)
# 启动世界或 mod 的时候提示需要依赖怎么办？
查看对应mod的module.json或对应世界包的world.json，找到json当中relationship下requires，安装其中提到的全部mod（你可以通过Bing搜索FVTT+对应id的方式来快速找到依赖mod）
> 💡 
部分mod对依赖项/系统的版本有要求，如下图对 DAE 的版本限定在最低v13.0.4，要求dnd5e系统为5.2.0到5.2.99
![图片](images/MS6fb9iuYouAtXxyhK8cNPLqncg.png)
🎬 嵌入视频: 
# 为什么 FVTT 官网搜不到 ClassPack 或 Plutonium？
无版权，所以这些 mod 是上架不了的。
🔗 书签: 
🔗 书签: 
# ClassPack没有 v13 版本怎么办？
classpack的 v12 最新版可以在 v13 正常使用，之所以迟迟不更新 v13 版本是因为工作组的各位最近有事没法干活。
# FVTT V13 系统为什么我按照教程安装了 mod，却仍没有显示？
> 💡 
[FVTT 下载加速代理](https://xcnplziulnma.feishu.cn/wiki/GBLNw30Biiq6iKk8DF8cx4oMnAb)使用 可以有效规避此问题。
[手动安装教程](https://xcnplziulnma.feishu.cn/wiki/TatpwFDdQiAEzekbIuFcfOTDnUh)如果没有进行在线安装，那么请确保自己阅读了 。
1. 确认自己下载的 mod 与系统匹配，系统不适配的 mod 不会在世界中的模组管理器内显示。例如，仅限 PF2e 的 mod 在 DND 系统的世界中不会显示在世界的模组管理器中，但是会在主界面的模组中显示。
1. mod 版本太旧，module.json 文件里没有id。FVTT V13 必须读取 module.json 文件的id字段，部分 mod（如千菓的合集）需要添加id字段才能在 FVTT 识别，如添加 "id": "dnd5e_collection_2024"（注意末尾是否需要添加英文逗号）。
  为什么我按照上述方式添加了 id 字段还是无法读取？
  使用记事本修改 module.json 后无法正常读取 mod，或修改 world.json 后无法读取世界包。
  此错误是因为输入了中文逗号/误删文本/没注意末尾多出来的逗号等大意引起，还有的可能是文件编码导致。
  若是文件编码导致的读取失败，你需要将 mod 的 module.json 文本编码变为utf-8格式；或者将世界包的 world.json 文本编码变为utf-8-bom。
  文件编码：
  最好是不要直接使用记事本编辑 module.json 或 world.json 文件，使用 notepdd++ 或其他专业软件编辑更为合适，这样不会导致文件编码出现变化。
1. 文件夹嵌套
1. 没有根据id重新命名 mod 文件夹
1. 手动安装 mod 后没有重启 FVTT
1. mod 与版本不匹配，下载版本支持的mod
1. 打包仓库而不是下载release
1. 没有去除 mod 验证，没有将 module.json 中的"protected": true 改成 false并删除 signature 文件，多适用于拼车 mod，此时报错一般如下：Invalid signature file for protected module "xxxx"
![图片](images/ZtIlbls4DoiPXbxE6fvcIJkLnWf.png)
1. 其实没有安装，不过是自己脑补安装了（😃）
1. 其实没有启用，不过是自己脑补启用了（😃）
以下是报错与对应的原因，级别为warning的都不需要关心：
| 报错原文 | 级别 | 原因 | 是否加载 | 推荐处理 |
|---|---|---|---|---|
| Invalid signature file for protected module "{id}" | error | 付费模块签名校验失败（许可证/版本/签名文件不匹配） | 否 | 去除module.json中的 "protected": true |
| Error loading module "{path}": {message} | error | module.json 无法读取或 JSON 解析失败（损坏/截断/编码问题） | 否 | 修复编码格式或卸载重装 |
| Invalid module "{id}" detected in directory "{dir}" | error | module.json 的 id 与所在文件夹名不一致 | 否 | 修改文件夹名称使之与module.json中的id一致 |
| Metadata validation failed for module "{id}": {message} | error | module.json 严格校验失败（缺字段、非法 id/版本、引用文件不存在、compendium 非法等） | 否 | 按照教程重装mod，尤其不要自作聪明地打包仓库 |
| The file "{file}" included by module {id} does not exist | error（多为上一个报错的子原因） | module.json 引用的脚本/样式/语言/compendium 文件缺失 | 否 | 补齐文件或重装。尤其注意不要打包仓库，去下release |
| The "{title}" module's manifest contained the following unknown keys: ... | warning | module.json 含 FVTT 不认识的字段 | 是 | 可忽略；可反馈作者清理 |
| 字段级校验失败（validationFailures） | warning | 个别字段值不合法但可回退处理 | 是 | 可忽略 |
| Failed data migration for {name}: {message} | warning | module.json 从旧版本迁移失败 | 是 | 一般可忽略，留意兼容性，必要时重装 |
| Database ... failed connection and cannot be accessed（compendium 连接失败） | error | 模块 compendium 数据库损坏/无法连接 | 部分 | 卸载重装；勿手工删除合集包文件 |
# DSN（DIce So Nice）设置无法打开？
原因未知的bug，一般来说新建一个GM账号，使用新的GM账号进行设置就可以解决。
# Item Piles无法正常使用？
几乎所有此类问题都是因为没有安装对应系统子mod（如Item Piles:DND5e）导致的。如果安装了依然有问题，请确保两者均更新至系统兼容的最新版本，并尝试重置Item Piles的系统默认设置（常见于从旧版本升级的世界包）
![图片](images/IUFObTbhAoV1YoxH0SIcjpkFnP9.png)
# 为什么我的动画或音效无法播放？
[动画 mod](https://xcnplziulnma.feishu.cn/wiki/MjSTwAHuFi9JfCkt8bUcVhrAnMd) 