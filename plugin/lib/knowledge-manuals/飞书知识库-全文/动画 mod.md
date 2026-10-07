<title>动画 mod</title>

<synced-source><h1>为什么我的动画或音效无法播放？</h1><p>请遵从以下顺序排查</p><ul><li>确保 FVTT <code>核心</code>设置中的<code>光敏模式</code>关闭。</li></ul><img name="image.png" alt="图片展示了《Dungeons &amp; Dragons Fifth Edition》游戏中的“游戏设定”界面。画面中“核心”选项被红色框突出显示，其右侧显示数字[33]。该图片与文档中“查看AA（automated animation）配置设定，是否勾选了无论是否命中都会播放动画”这一内容相关，可能是在说明在游戏设定中找到相关配置设定的位置，以便进行动画相关设置操作。" mime="image/png" scale="0.688770" src="OoD3bDsluoUIExxv6t6cABYsn53"/><ul><li>是否安装并启用了相应的动画与音效资源库 mod，如jb2a，Animated Spell Effects: Cartoon，psfx等。</li><li>确保sequencer设置里启用了特效与声音</li></ul><img name="QQ_1781194713342.png" alt="图片展示了游戏客户端的特效与声音设置界面。左侧有“启用特效”和“启用声音”选项，右侧对应有勾选框，均被勾选。下方有“允许在该客户端上播放特效”和“允许在该客户端上播放声音”的说明。该图片与文档中“确保sequencer设置里启用了特效与声音”内容相关，直观呈现了特效与声音设置开启状态，是确保动画mod等特效正常运行的前提条件之一。" mime="image/png" scale="1.000000" src="RPjrb1qBZowal6x2mr1cNw3InYg"/><ul><li>确保sequencer的动画权限设置正确（只在gm端能播放动画但玩家端不能时考虑）</li></ul><img name="QQ_1781194759947.png" alt="图片展示了动画模组的权限设置界面。界面上方有“播放特效”“移除所有特效”“播放声音”“为其他人预加载”“使用侧边栏工具”五个选项，每个选项右侧都有下拉框，分别对应“玩家及以上”“GM助手及以上”“玩家及以上”“受信玩家及以上”“玩家及以上”的权限设置。该图片与文档中确保sequencer设置里启用特效与声音，以及动画权限设置正确等内容相关，用于说明权限设置的具体情况。" mime="image/png" scale="1.000000" src="X8qbblLNxofq3fxN4QPcT4Z7nfh"/><ul><li>确保AA的自动动画设置已打开</li></ul><img name="QQ_1781194984059.png" alt="图片展示了游戏设置中“Automated Animations”选项下的“全局自动识别设置”界面。关键信息有：自动动画设置为“开”，并提示在客户端禁用该模组，从Sequencer模组设置中关闭所有动画；JB2A数据位置需根据JB2A托管位置更改，如S3或类似东西上；对玩家隐藏动画栏勾选后玩家无法看见动画栏；禁用近战与远程切换、禁用近战动画切换为远程动画等选项也有所展示。该图片与上下文内容紧密相关，直观呈现了相关设置情况。" mime="image/png" scale="1.000000" src="ADgwbc2gPogPgSxePUkcsRgDnmc"/><ul><li>观察 AA 与 JB2A 设置中的jb2a数据位置，地址是否正确，是否连上了别人的cos桶？</li></ul><img name="image.png" alt="图片展示了Automated Animations的配置设定界面。其中，JB2A数据位置被红框突出显示，提示仅当JB2A托管在外部如S3或类似东西上时才需更改，否则留空，示例为S3Bucket/jb2a_patreon或S3Bucket/JB2A_DnD5e（末尾无斜线）。该图片与文档中检查AA与JB2A设置中jb2a数据位置是否正确，以及是否连上别人cos桶的内容相关，用于指导玩家确认相关设置。" mime="image/png" scale="0.706693" src="QN5obTt69oJMPXxLMmWcs1kZnrf"/><img name="image.png" alt="图片展示的是JB2A - Patreon Complete Collection的设置界面。其中“JB2A - location (default: &#39;modules&#39; )”选项被红框突出显示，其右侧地址栏内容被红框标注。该图片与文档中“观察AA与JB2A设置中的jb2a数据位置，地址是否正确，是否连上了别人的cos桶？”的内容相关，用于辅助说明在查看AA（automated animation）配置设定时，需检查JB2A数据位置地址是否正确，是否连上了别人的cos桶。" mime="image/png" scale="0.620865" src="HnpnbmIxOovsbxxfzz6czVujnld"/><ul><li>查看AA（automated animation）<b><code>配置设定</code></b>，是否勾选了<b><code>无论是否命中都会播放动画</code></b>。</li></ul><img name="image.png" alt="图片展示了AA（Automated Animation）配置设定中的“在命中和未命中时都播放动画”选项，其右侧有一个蓝色勾选框。该选项说明，未命中时动画会擦过目标，需Midi工作流检查命中与否。这与文档中查看AA配置设定，确认是否勾选“无论是否命中都会播放动画”这一操作步骤相关，是确保动画播放设置正确的重要参考内容。" mime="image/png" scale="1.000000" src="EWT9bXetRoX7acxzKHJc4r4pn4c"/><ul><li>查看物品自身标题栏的AA设置，物品是否匹配了动画？或物品本身配置了动画。<code>绿色</code><code>√</code>代表成功匹配，其中<code>Menu:</code>代表具体匹配的哪个动画，下图代表匹配了<code>预设</code>菜单中的<code>火球术</code>动画。</li></ul><img name="image.png" alt="图片展示的是动画mod中物品自身标题栏的AA设置界面。界面上方显示“动画启用”已开启，“自定义Item”未开启，且“已匹配到全局设置”。下方列出三条信息，分别是“Item Animation is enabled but not customized”“Global Automatic Recognition is matched”“Menu: 预设 - Label: 火球术”，每条信息后均有绿色勾形图标。该图片与上下文内容相关，用于说明查看物品自身标题栏AA设置时，物品是否匹配了动画，以及物品本身配置了动画的情况。" mime="image/png" scale="1.000000" src="SCaTbVFjZolm8vxYV3zcIrXZnPb"/><ul><li>查看AA<b><code>全局动画配置</code></b>，是否存在对应动画且能正常预览。</li></ul><img name="image.png" alt="图片展示了物品“长枪”的物品自身标题栏AA设置界面。左侧是物品预览窗口，显示了长枪的图标。右侧是物品属性设置区域，有“来源”“动画”等选项卡，当前选中“动画”选项卡。在“动画”选项卡中，有“预览”按钮，其右侧有“3D Canvas”“声音”“新增”等按钮。该图片与上文提到的查看物品自身标题栏AA设置，以及物品是否匹配动画等内容相关，直观呈现了物品动画设置界面。" mime="image/png" scale="0.730905" src="RyOjbZ4FmoxLffxMd3Pcmnxwnfd"/><ul><li>是否启用了<b><code>全局动画配置</code></b>中<code>Advanced</code>的<code>强制精确匹配查找？</code>开启此选项需要名称完全一致才能匹配，一般情况建议关闭。</li></ul><img name="bd2cf265-f3cf-4248-b18e-f5b24f4f85ea.png" alt="图片展示了物品“火球术”的属性界面。左侧列表中“火球术”被选中，右侧弹出“Advanced Features: 火球术”窗口。窗口中“进阶”标签下有“强制精确匹配查找？”选项，其右侧有红色框突出显示。该图片与上下文内容相关，用于说明在查看物品自身标题栏的AA设置时，若物品配置了动画，需查看“全局动画配置”是否存在对应动画且能正常预览，以及是否启用了“强制精确匹配查找？”选项等操作。" mime="image/png" scale="0.569511" src="WvJ4brltvoTmkfx3ImlceBl3nud"/></synced-source>



<synced_reference src-block-id="I1x6d74dGsdGgvbW1ClcgNlGnme" src-token="JNnpdE3LFohK3QxUAUXcjonBncc"></synced_reference>



# 视频教程

<readonly-block href="https://player.bilibili.com/player.html?bvid=1ESm9BvEpt" type="iframe"></readonly-block>



# 动画核心

以下 mod 为 FVTT 提供了基础的动画功能，为核心必备。

## Sequencer（依赖）

Sequencer可以实现完全自定义的动画，但不借助其他 mod 辅助只能依靠自己写宏。

<bookmark name="Sequencer" href="https://foundryvtt.com/packages/sequencer/"></bookmark>

Sequencer具有完整的宏教程网站，感兴趣的可以自己去查阅学习一下

<bookmark name="Sequencer" href="https://fantasycomputer.works/FoundryVTT-Sequencer/"></bookmark>



## **Automated Animations（AA）**

AA 只能根据`物品名称`来自动匹配动画并播放，具有可视化界面配置，~~但无法根据`行动组合`名称来识别播放动画~~现以支持对行动组合名称的识别，需要在物品的AA按钮中单独配置。

<bookmark name="Automated Animations" href="https://foundryvtt.com/packages/autoanimations"></bookmark>



## BLFX Assets & Animation Editor（付费）

BLFX 本身也附带了很多额外的动画素材，且可根据`行动组合`来识别播放动画，但相对动画配置较少。

<bookmark name="BLFX Assets &amp;     Animation Editor Premium" href="https://foundryvtt.com/packages/boss-loot-assets-premium"></bookmark>



# 动画音效素材

这些是一些较为常用的动画/音效素材，当然你也可以自己去找其他的资源。

动画素材必须为 **webm** 格式**（FVTT 仅支持此格式）**，且为**透明通道**（你也可以选择非透明通道的）。

## JB2A - Jules&Ben's Animated Assets（付费）

<bookmark name="JB2A - Jules&amp;    Ben&#39;s Animated Assets" href="https://foundryvtt.com/packages/JB2A_DnD5e/"></bookmark>

**JB2A海盗下载链接：**

<bookmark name="kemono.cr" href="https://kemono.cr/patreon/user/24402428/post/56246490"></bookmark>

<bookmark name="夸克网盘分享" href="https://pan.quark.cn/s/059bce82bf3b"></bookmark>

**如果JB2A使用COS地址，那么请按照如下所示：**

`https://resource-``你的存储桶链接/JB2A`

![这张图片展示的是动画mod相关配置界面里，JB2A资源路径的设置区域。该区域对应配置项为“JB2A - location (default: 'modules')”，其说明指出该配置项仅在JB2A模块托管在外部S3存储桶或类似服务时才修改，无需填写示例仅作参考。图中该配置项的输入框里显示了“https://resource-你的存储桶链接/JB2A”的示例内容，该内容是设置JB2A使用COS地址时需要填写的资源路径，被红色框线突出标注，与文档中说明的JB2A资源地址配置要求相呼应。](https://feishu.cn/file/JwUcb8jABo46Uwx33S6cFfIfnyf)

![图片展示了COSBrowser界面中JB2A动画素材的存储情况。界面显示“存储桶列表”下的“JB2A > jb2a_patreon”路径，下方有“上传”“新建”“下载”等操作按钮。图片中突出显示了“Library”文件夹，其图标为蓝色文件夹，位于界面下方。该图片与文档中JB2A动画素材的下载链接相关，用于说明在COSBrowser中找到JB2A动画素材的位置，辅助用户下载素材。](https://feishu.cn/file/Mg7LbN0sOoSTMyx1GwacdO7gnOg)



## PSFX - Peri's Sound Effects

具有付费版本，但免费版本就已经足够使用了。

<bookmark name="PSFX - Peri&#39;s Sound Effects" href="https://foundryvtt.com/packages/psfx"></bookmark>



## Eskie Effects Free

具有付费版本，个人推荐订阅。

<bookmark name="Eskie Effects Free" href="https://foundryvtt.com/packages/eskie-effects-free"></bookmark>



## The Kinemancer（付费）

<bookmark name="The Kinemancer" href="https://foundryvtt.com/packages/thekinemancer/"></bookmark>



## Matt.M Animations的一系列 mod（付费）

<bookmark name="Matt.M Animations" href="https://foundryvtt.com/creators/mattm-animations/"></bookmark>



## Animated Spell Effects: Cartoon

<bookmark name="Animated Spell Effects: Cartoon (Jack Kerouac)" href="https://foundryvtt.com/packages/animated-spell-effects-cartoon"></bookmark>



## 其他动画特效

<figure view-type="Card"><source name="特效 (1).7z" size="15526412" token="KFApbg58CokO4Wxava7cxmtBnkb"/></figure>

**除JB2A特效库（部分动画与上述其他动画存在重叠）**

**链接：**https://pan.baidu.com/s/1wfB\_\_HSXDyfTNTIwd-O98w?pwd=FVTT 

**提取码：**FVTT



## 音效网站

爱给网是不错的音效库，不过部分音效需要 VIP，且每天额度有限。

<bookmark name="爱给网_音效配乐_3D模型_视频素材_免费下载" href="https://www.aigei.com/"></bookmark>

**爱给网音效合集**

**链接：**https://pan.baidu.com/s/1hPjYaw2Nr25jJWsfobbTLQ?pwd=FVTT 

**提取码：**FVTT



# 预设动画配置

用来快速配置 AA 动画的预设，方便快速上手使用

## D&D5e Animations

中文汉化后的D&D5e Animations配置导入文件如下

<figure view-type="Card"><source name="DND5e 动画全汉化(2024)—AA导入(D&amp;amp;D5e Animations 3.1.1) (1).zip" mime="application/x-zip-compressed" size="283735" token="UA1ybZEMIoI5scxM52BcNz0Fnbf"/></figure>

### 如何导入？

首先打开AA设置的全局自动识别设置

![图片展示了《Dungeons & Dragons Fifth Edition》游戏中的“全局”界面。左侧为功能分类栏，如“核心”“Dungeons & Dragons Fifth Edition”等。右侧是“全局自动识别设置”区域，包含“打开全局自动识别菜单”开关，可从客户端禁用该模组，从Sequencer模组设置中关闭所有动画；“禁用自动识别”开关，只有自定义配置的物品才会播放动画；“全局延时”可设置以毫秒为单位延迟所有动画的开始时间；“JB2A数据位置”需刷新，仅当JB2A托管在外部如S3或类似东西上时才更改；“禁用近战与远程切换”开关，禁用近战动画切换为远程动画。](https://feishu.cn/file/J8zQb2zQqomStrx11agcjlIOnQe)

点击弹出窗口最底部的菜单管理器

![图片展示的是AA设置的全局自动识别设置界面。界面上方有“近战”“远程”“在TOKEN上”“测量板”“光环”“预设”“主动效果”等选项卡。下方列表中列出了多种武器名称，如匕首、疾风连击、巨斧等。界面底部有“菜单管理器”按钮，用红色框突出显示。该图片与文档中介绍导入D&D5e Animations配置文件的操作步骤相关，是点击弹出窗口最底部菜单管理器后显示的界面。](https://feishu.cn/file/LoMibfQYsotA5nx549jc6LbJnrA)

选择合并菜单或覆盖菜单

![图片展示的是AA设置的菜单管理器界面。界面上方有“Menu Manager”标题及“X”关闭按钮。下方有四个操作选项，分别是“重置回初始设置”（清除当前设置并重置为初始设置）、“合并菜单”（将新设置与已有设置合并）、“覆盖菜单”（清除当前设置并导入新设置）、“导出设定菜单”（将当前设置导出为JSON文件）。其中“合并菜单”按钮以绿色突出显示，与上下文介绍的导入D&D5e Animations配置文件时选择合并菜单的操作相呼应。](https://feishu.cn/file/X9jdbTwb6o8UGvxBpfKcAbMXnce)

在此界面选择你下载好的json文件

![图片展示的是动画mod中“Merge Menus”窗口界面。窗口标题为“Merge Menus”，中间显示“Select a File”字样。下方“来源数据”区域有“选择文件”](https://feishu.cn/file/A0SbbL11LovH6Zx5d9YcSqLgnng)



# 补充 mod

以下 mod 增强了动画的表现或是新增了一些有趣的动画。

## Aeris Animations

提供了一些额外的动画宏（mod合集之中），可绑定在物品上触发（关于宏相关 mod，可在<cite doc-id="P8FJw744PiKEAvkHCZ5cxViOnkV" file-type="wiki" title="FVTT mod 分类" type="doc"></cite>中查看）。

<figure view-type="Preview"><source name="example-01 (1).mp4" mime="video/mp4" origin-height="1080.000000" origin-width="1920.000000" size="20618596" token="PKhnb5zo1o5BKExvRTvcT3nfnxe"/></figure>

<bookmark name="Aeris Animations" href="https://foundryvtt.com/packages/aeris-animations"></bookmark>

**点评：**特别炫酷的动画宏，强烈推荐安装，缺点就是需要给物品绑定，或者你也可以直接通过宏进行触发。



## Automated Animations For All

根据根据聊天中的`物品名称`触发AA的自动动画。换句话说，每当聊天中出现带有兼容动画的物品名称时，动画就会被播放。

因此，任何在使用时将`物品名称`输出到聊天的系统都会触发动画。如果用户在聊天中手动输入`物品名称`，比如场景描述，情况也同样适用。触发也可以限定在战斗回合。

<bookmark name="Automated Animations For All" href="https://foundryvtt.com/packages/automated-animations-for-all"></bookmark>

**点评：**感觉有些意义不明，AA本身就可以匹配`物品名称`触发动画，或许有一些特殊需求的用户会安装。



## Cinematic Cut-ins（付费）

自动播放特写动画（例如敌人上场、回合开始时或攻击检定后进行特写播放）的 mod，可视化的配置页面，快速的动画配置。

<figure view-type="Preview"><source name="Cinematic Cut-ins Feature Showcase.mp4" mime="video/mp4" origin-height="1080.000000" origin-width="1920.000000" size="54138045" token="Q02fbUOAQokjZgxx4UGcc0fGnse"/></figure>

**FVTT中相关控件：**

![图片展示了FVTT中Cinematic Cut-ins模组的配置界面。左侧为角色选择区域，可搜索角色并创建小队。右侧有常规、触发等标签，当前选中“常规”。常规 addCriterion](https://feishu.cn/file/WIlVbu346oJqmdxd8QLcmLc4nWc)

<bookmark name="Cinematic Cut-ins" href="https://foundryvtt.com/packages/cinematic-cut-ins"></bookmark>

**点评：**如果你是喜欢追求特写动画，那么这个 mod 一定不能错过。



## Cut-in Manager（V12适配）

和上述`Cinematic Cut-ins`一样，都是用于处理特写的 mod。

**FVTT中相关控件：**

![图片展示了FVTT中“特写管理器”相关控件。画面左侧是FVTT界面的工具栏，其中“特写管理器”图标被红色框线突出显示，图标为一个黑色的相机轮廓。该图片与文档中介绍“Cut-in Manager（V12适配）”mod的内容相关，该mod用于处理特写，此图直观呈现了FVTT中与特写管理相关的界面元素，辅助说明该mod在FV](https://feishu.cn/file/LUlvbZ6g6oAT5ZxInFqcOD4inwd)

<bookmark name="Cut-in Manager" href="https://foundryvtt.com/packages/cutin-manager"></bookmark>

**点评：**该 mod 暂时没有适配V13的版本，我自己实测下来发现UI界面存在问题无法正常使用。此外，该 mod 需要自己寻找或制作对应的动画（或图片）素材用于触发，相对`Cinematic Cut-ins`而言更加费时费力。



## Danger Zone

用于制作场景动画的 mod，可以实现风暴、闪电降临亦或者其他更加酷炫的场景。同时该 mod 也适合用于制作一些陷阱（可以实现自动豁免检定）。

![图片展示的是FVTT游戏场景，画面以深色调为主，中央有一个类似机械装置的结构，周围环绕着发光的球体。上方有一个带有线条连接的圆形图案，整体氛围神秘莫测。该图片与文档中介绍的“Danger Zone”动画mod相关，用以直观呈现该mod可能带来的场景动画效果，帮助玩家理解其能实现的高度自动化场景动画功能。](https://feishu.cn/file/B9QebSFVZoxlwOxjwIlcBKPunZg)

**相关教程：**

教程录制时间较早，但实际使用过程中大部分功能并未发生太多变化，等之后我有空看看能不能重新录制一期。

<readonly-block href="https://player.bilibili.com/player.html?bvid=1SD42177g6&amp;share_source=copy_web&amp;vd_source=85d1ba3ac08e6f1597e74e590f6eccc4" type="iframe"></readonly-block>

<bookmark name="An Add-on Module for Foundry Virtual Tabletop" href="https://foundryvtt.com/packages/danger-zone"></bookmark>

**点评：**这个 mod 可以实现高度的场景动画自动化，且具有可视化界面方便快速上手，缺点就是需要耗费一定时间去仔细配置。总之，如果你希望让你的 BOSS 战或场景探索更加难忘，那么`Danger Zone`一定是你必须下载的一个 mod。



## FXMaster

一个扩展 FVTT 天气动画的 mod，这个 mod 具有付费版本，但我个人认为普通版本目前就合适了（付费目前额外动画较少）。

<figure view-type="Preview"><source name="FXMaster.mp4" mime="video/mp4" origin-height="867.000000" origin-width="3206.000000" size="6843181" token="VHVSbSXYpoW5AIx0HOtcttpTnEp"/></figure>

**场景环境设置：**

位于`场景配置`中的`环境`页面。

![图片展示的是FVTT场景配置中“环境”页面的“天气效果”设置区域。画面右侧弹出一个下拉菜单，列出多种天气效果选项，如秋叶、下雨、暴雨等，部分选项后标注了“FXMaster”。该图片与文档中“场景环境设置”部分对应，直观呈现了FVTT中可选择的天气效果类型，帮助用户了解在场景配置中设置天气效果的操作界面及可选内容。](https://feishu.cn/file/VqMDb40oGowrA0xczjlc37Dknhg)

**FVTT中相关控件：**

![图片展示的是FVTT中“粒子特效管理”界面。界面分为“天气”“环境”“动物”三个板块，每个板块下有多个特效选项，如天气板块有云朵、雾气、下雨等，环境板块有秋叶、气泡、余烬等，动物板块有蝙蝠、鸟类、老鹰等。每个特效选项右侧都有一个带有“+”的开关按钮。该图片与文档中“FVTT中相关控件”部分对应，直观呈现了FVTT中粒子特效的管理界面及部分特效选项。](https://feishu.cn/file/Gp4lbfMzKoORCfxf7o4cA8k2noc)

**滤镜相关配置：**

![图片展示 addCriterion](https://feishu.cn/file/UAAFbbYwGoiqiyxCHbyctqYjn1b)

**动画管理器：**

与`Sequencer`和`BLFX`的管理器类似，个人认为加载速度太慢，不太实用。

要放置动画效果，只需将其从窗口拖到画布上，画布上会创建一个包含你动画的`图块`。

![](https://feishu.cn/file/IKjqbDCa8o4brNx1mbhcxCgInle)

**区域行为：**

`粒子特效`和`滤镜特效`代表只在`区域`范围内播放对应的特效，

默认情况下，通过`控件`添加的`粒子特效`会在整个场景中显示。其中`抑制`代表的是该区域内不会播放特效，适合具有`房顶`的场景。

![图片展示了动画mod中FXMaster特效的相关内容。左侧有四个特效名称 addCriterion图片展示了动画mod中FXMaster特效的相关内容。左侧有四个特效，分别是“FXMaster：粒子特效”“FXMaster：滤镜特效”“FXMaster：抑制场景粒子”“FXMaster：抑制场景滤镜”。右侧是对应特效的图标，分别是粒子特效图标、滤镜特效图标、抑制场景粒子图标、抑制场景滤镜图标。该图片与上下文介绍的区域行为中粒子特效和滤镜特效的内容相关，直观呈现了这些特效的图标样式。](https://feishu.cn/file/RoqVbZ3CuoCDTIxdMj3c3tJanJ2)

<bookmark name="An Add-on Module for Foundry Virtual Tabletop" href="https://foundryvtt.com/packages/fxmaster/"></bookmark>

**点评：**如果你要使用动画，那么这个 mod 属于必装 mod 之一，新增的天气动画极大程度让场景更加具有代入感，而滤镜特效也能让你实现一些特殊的场景播片。顺便一提，这个 mod 所做的特效可以`转换为宏`（在控件具有对应按钮）。



## Genga: System Agnostic Anime Animations

提供了一些好玩的动画宏，除了下面展示的外，还包括`JOJO梗/To Be Continued`的相关动画，娱乐程度拉满。

<figure view-type="Preview"><source name="Genga.mp4" mime="video/mp4" origin-height="1016.000000" origin-width="1920.000000" size="1341674" token="LM5Db8u2GopB4txm8BocTqlEnFe"/></figure>

<bookmark name="Genga: System Agnostic Anime Animations" href="https://foundryvtt.com/packages/genga"></bookmark>

**点评：**娱乐动画 mod，感兴趣的用户可以安装。



## Map Shine

为地图制作者提供一个强大的工具包，以最快且技术上最简单的方式添加动画和特效。

<bookmark name="An Add-on Module for Foundry Virtual Tabletop" href="https://foundryvtt.com/packages/map-shine"></bookmark>

**点评：**我没用过，点评不了...感兴趣的用户可以自行去查阅官网，阅读说明，表现力还是很不错的，不过缺点就是`无汉化`。



## Media Binder（付费）

该 mod 主要用于将图片或动画链接到 Token 上，AA等其他 mod 已可取代此功能。

<figure view-type="Preview"><source name="Media Binder For Foundry VTT.mp4" mime="video/mp4" origin-height="1080.000000" origin-width="1920.000000" size="11021315" token="SYsmbtNf5onKTexwmjKcwueAnzc"/></figure>

<bookmark name="Media Binder" href="https://foundryvtt.com/packages/media-binder"></bookmark>

**点评：**适合对于动画有轻量需求的用户，但总体而言并不值得使用。



## O is for Objection!

动画宏 mod，和`Aeris Animations`类似，需要宏触发或者绑定特定物品。

<figure view-type="Preview"><source name="O is for Objection!.mp4" mime="video/mp4" origin-height="1118.000000" origin-width="1340.000000" size="1694337" token="SMKkbUtesoMvY2xWfKccLRu0nJh"/></figure>

<bookmark name="O is for Objection!" href="https://foundryvtt.com/packages/objection"></bookmark>

**点评：**我只说一句话：**异议！**



## Ouija Board for Sequencer

你甚至可以在 FVTT 玩恐鬼症X

<figure view-type="Preview"><source name="Ouija Board for Foundry VTT Sequencer.mp4" mime="video/mp4" origin-height="1080.000000" origin-width="1920.000000" size="8951597" token="HZ6Wb2KDzowl2JxkOlAcKqR0nWf"/></figure>

<bookmark name="Ouija board for Sequencer" href="https://foundryvtt.com/packages/ouija-board-for-sequencer"></bookmark>

**点评：**我的观众需要光（教皇声音）



## Sequencer Database Entries

暂且还没使用

<bookmark name="Sequencer Database Entries" href="https://foundryvtt.com/packages/sequencer-database-entries"></bookmark>



## Share Media

GM可以利用此 mod 快速且无缝地与玩家分享图片和视频。只需将鼠标悬停在日志、角色或物品卡中的任何图片或视频上，即可立即与玩家分享。

下面是群友的一个演示视频：

<figure view-type="Preview"><source name="Share Media.mp4" mime="video/mp4" origin-height="1004.000000" origin-width="1916.000000" size="1398818" token="HpjVb7Cp4oDj1vx4rWpcRuOlnWd"/></figure>

<bookmark name="Share Media" href="https://foundryvtt.com/packages/share-media"></bookmark>

**点评：**功能并不复杂，但确实是比较方便的一个 mod，你也可以利用`Cinematic Cut-ins`、`Cut-in Manager`或`Sequencer`的宏等 mod 来实现对应的功能。



## Sora's Animation Placer（推荐）

该 mod 旨在简化 GM 从本地或 FVTT 文件源中快速浏览、分类、收藏动画（WebM、MP4 等）和静态图片，并将它们作为图块 (Tiles) 或 指示物 (Tokens) 拖放到场景中的过程。

<bookmark name="GitHub - SORA-dnd/sora-animation-placer" href="https://github.com/SORA-dnd/sora-animation-placer"></bookmark>

**点评：**一目了然的浏览器布局让GM不再需要将大量时间浪费在翻找文件列表上，推荐安装（顺便说一句这次是中文教程了）。



## Sora-s-atmosphere-player（推荐）

用于快速切换场景动画宏。

<bookmark name="Sora-s-atmosphere-player" href="https://foundryvtt.com/packages/sequencer-webm-orb"></bookmark>

**点评：**我说必须拷打 **@Sora**，甚至连中文教程都不写一个，总之因为是群友的 mod，推荐一手。



## Sprite Animations

![图片展示了《最终幻想6》游戏画面，背景于“Sprite Animations”mod介绍部分。画面中，角色们在雪地场景中，左侧有一个蓝色的怪物，右侧有四个不同姿态的角色，包括手持武器的男性角色、穿着绿色长袍的女性角色、穿着蓝色长袍的女性角色以及手持大剑的男性角色。画面左下角有“Sprite Animations”字样，右下角显示“Public Beta”字样。该图片直观呈现了该mod可能实现的动画效果，与上下文介绍的“目前全部动画都需要自己做”相呼应。](https://feishu.cn/file/EoaAb2bzeo8SqSxTsPmcd4sZndd)

<bookmark name="Sprite Animations" href="https://foundryvtt.com/packages/sprite-animations"></bookmark>

**点评：**一个如果能实现就特别NB的 mod，但现在看起来更像是画大饼——目前全部动画都需要自己做。



## Sprite Shadows

和上面`Sprite Animations`一起的配套 mod。

![图片展示了FVTT（Fantasy Grounds Visual Tabletop）中使用“Swarms”mod的场景。画面中，左侧是一个多臂的怪物，手持武器，身上有红色标记，地面有蓝色光点。右侧是一个身穿紫色服装的角色，手持武器。背景为石墙，墙上有手持武器的雕像。该图片与文档中介绍“Swarms”mod的内容相关，直观呈现了该mod在游戏中的效果，强调其适用于集群的动画，让集群怪物更写实。](https://feishu.cn/file/PnBHbeyB3ogfjjxnYrMc6GO9nkc)

<bookmark name="Sprite Shadows" href="https://foundryvtt.com/packages/sprite-shadows"></bookmark>

**点评：**光影选项打开（Bushi）。



## Swarms

一个适用于集群的动画 mod，让你的集群怪物看着更加写实。

![图片展示了一个游戏场景，地面上有两团集群怪物，左侧是紫色集群，右侧是黑色集群。画面右下角还有一个带有头像的圆形标识物。图片与上文介绍的“Swarms”动画mod相关，该mod适用于集群，能让集群怪物看起来更写实，展示了使用该mod后游戏中集群怪物的呈现效果，体现了此mod在增强游戏画面写实性方面的作用。](https://feishu.cn/file/OYq6bTNgmoJVuUxZAjAczUidnJd)

**FVTT中相关控件：**

位于`指示物（或Token）控件`之中的`外观`选项。

![图片展示了位于介绍FVTT中“Swarms”动画mod的上下文部分，展示了Token外观控件中“Swarms”相关设置。画面中“Swarms”选项被红色框突出显示，包括“启用集群”开关、“数量”数值为20、“速度”数值为1、“动画”下拉菜单选“圆形”等设置项，还显示了“更新Token”按钮。该图片直观呈现了文档中提到的“Swarms”mod在FVTT中相关控件设置的具体内容。](https://feishu.cn/file/IB99bzPJGouHDuxs3bfclcbrniS)

<bookmark name="An Add-on Module for Foundry Virtual Tabletop" href="https://foundryvtt.com/packages/swarm"></bookmark>

**点评：**强烈推荐安装的一个 mod，尤其推荐使用蟑螂集群！



## Theater of the Mind Manager

<bookmark name="Theater of the Mind Manager" href="https://foundryvtt.com/packages/totm-manager"></bookmark>

**点评：**我没用过，点评不了...感兴趣的用户可以自行去查阅官网，阅读说明，缺点是`无汉化`。



## Token Magic FX

<bookmark name="Token Magic FX" href="https://foundryvtt.com/packages/tokenmagic/"></bookmark>

**点评：**时代的尘埃，已完全被 AA 和 BLFX 替代，虽作者还在更新，但个人认为并不值得安装了。



## Token Magic FX - Automatic Wounds

与上面`Token Magic FX`搭配一起使用的 mod。

<bookmark name="TokenMagic Automatic Wounds" href="https://foundryvtt.com/packages/tokenmagic-automatic-wounds"></bookmark>

**点评：**太丑，而且`Token Magic FX`本身也并不推荐安装了。



## Token Variant Art

可以根据`效果`名称（如倒地、麻痹或震慑等）或一些特定条件（例如生命值低于 50%，飞行高度大于 10 尺）等为 Token 附加上对应的效果。

**相关教程：**

<readonly-block href="https://player.bilibili.com/player.html?bvid=1z1421R7QN&amp;share_source=copy_web&amp;vd_source=85d1ba3ac08e6f1597e74e590f6eccc4" type="iframe"></readonly-block>

<bookmark name="Token Variant Art" href="https://foundryvtt.com/packages/token-variants/"></bookmark>

**点评：**这个 mod 最强大的功能远不止附加动画，强烈推荐安装。



## Universal Animations

根据`物品类型`自动播放绑定的动画，例如执行武器攻击，播放绑定的动画A；或者施展法术远程攻击，播放绑定的动画B。

**FVTT中相关控件：**

![图片展示了FVTT中与动画mod相关的界面。左侧是“Universal Animations”界面，显示了多个动画类型及对应ID。中间是“Spell Attack Cast”等动画设置界面，包含动画类型、物品类型、目标类型等设置项。右侧是“Spell Attack Cast”动画的详细设置界面，有动画类型、动画名称、动画类型等设置项，还显示了动画的缩略图。该图片直观呈现了文档中介绍的FVTT中相关控件界面，帮助理解动画mod的设置操作。](https://feishu.cn/file/SbKZbjwRsoNnEKxKxZccZ5tYnLg)

<bookmark name="Universal Animations" href="https://foundryvtt.com/packages/universal-animations"></bookmark>

**点评：**适合用于 AA 或 BLFX 没设置动画的时候，播放一些通用的动画（比如远程攻击法术默认为蓝色光束、近战武器攻击默认为一次打击特效），但我个人实际使用下来会感觉到略微卡顿，所以视情况进行安装。



## Weather Color Settings

对 FVTT 自带的天气进行着色，例如你希望红色的雾（血雾）或者下绿色的雨（酸雨）。

**FVTT中相关控件：**

位于`场景配置`中的`环境`页面。

![图片展示的是FVTT中`场景配置`下的`环境`页面中`Weather`设置界面。界面中有多个设置项，如`Journal Entry`、`Scene Playlist`等，其中`Weather Effect`下拉菜单选中`Fog`，`Fog Color`显示为#00e1ff，呈现蓝色。下方还有`Weather Color`、`Rain Color`、`Snow Color`等设置项，可调整天气效果颜色。该图片与文档中介绍的`Weather Color Settings`辅助mod相关，直观呈现了mod中对天气着色的设置界面。](https://feishu.cn/file/EM0vbR2AcozeyrxsPC2coZaInnh)

<bookmark name="Weather Color Settings" href="https://foundryvtt.com/packages/weather-color-settings"></bookmark>

**点评：**还算不错的辅助 mod，不过`FXMaster`可以替代这个功能了。