<title>从夯到拉评价fvtt文字团体验优化mod</title>

**观前声明：**

1. 本文均为**主观**使用体感，不代表所有人的使用的体验，mod的功能只要是合乎你的心意那就是夯爆了
2. 本文的评鉴对象是基于，需要gm折腾的程度，从简至繁而将其分为了三个部分，请量力进行参考，对mod的评判标准基本为两点：**文字阅读体验**和**跑团时的易用程度**，虽说我是花里胡哨爱好者，但文字团一定要有好的文字体验（？），以及我很懒惰，根本不想在带团的时候进行过多的操作，由此本文列出的mod皆基于这两点来进行评价
3. 使用环境为fvtt v13，系统dnd5e v5.2.4、Triangle Agency v1.2.04，mod基本是按照标出的版本进行评价的，可能会与最新版有出入🙃

# 一、残疾人拯救计划

这一部分基本是基于原生聊天优化建议。

## 原生fvtt聊天

> 未来可期

难以想象，都6202年了原生的聊天功能还是那么原始朴素，在qq和微信的舒适圈中长大的我们到底该怎么吃下这一坨，简陋到我都怀疑官方都不玩文字团的吗，不打些辅助mod真的没法用，要啥没啥，掷骰要打指令，私聊也要打指令，指令还要靠mod（[Chat Commander](https://foundryvtt.com/packages/_chatcommands/)）才能自动补全，甚至你不选中token就无法以该角色进行发言，使用体验就突出一个残疾感，关于用法，你想知道的都在基础教程<cite doc-id="YKM8wZDbjiakxRkHeyGckb2tnvh" file-type="wiki" title="聊天" type="doc"></cite>里了哦，~~不会真想去体验原生吧~~

但对于稍微玩过一些v11 v12版本的我来说，v13已经有很大的进步了，而这正是聊天卡片的功能~~其实只是收编了mod功能~~，听说v14还要支持markdown编辑了，只要官方一直增加~~收编~~新功能，那有朝一日也能玩上功能强大的原生聊天吧（不切实际地幻想ing）

### 评级：v12以前 拉完了，v13勉强 NPC

### dlc：聊天气泡的邪道用法

![图片展示了《从夯到拉》评价中关于聊天气泡的设置选项。左侧有“聊天气泡”和“聚焦发言”两个选项，右侧分别有勾选图标。其中“聊天气泡”选项说明，启用后角色发言或表情时，消息将以气泡框形式显示在指示物上方；“聚焦发言”选项说明，显示聊天气泡时，自动将视角平移到正在发言的指示物。该图片与上下文紧密相关，直观呈现了文档中提到的聊天气泡功能设置，为玩家提供使用参考。](https://feishu.cn/file/QixdbeyihorAJqxggjncZKb7nFf)

曾经在大群讨论时想到的一个邪道玩法，那种在地城里探险的环节，走着走着突然有一个变形怪之类的敌人加入了你们的token队伍里，这种时候dm发言就会暴露，那么该怎么办呢，首先找个uimod，把原生聊天信息的页面给pl们没收（或者用聊天分栏mod将所有文字聊天隐藏），大伙只用聊天气泡进行对话，在视野不透明的地下城中，分散的玩家走着走着队伍里突然多了一个人，接下来就该上演经典蜘蛛侠对指了。

注：没有实际尝试过，均为脑测

## [Character Chat Selector](https://foundryvtt.com/packages/character-chat-selector) v3.4.5

> 请选择你的轮椅

理所当然，FVTT的社区生态向来擅长补足官方短板。围绕原生聊天的优化，其实已经有不少mod——比如**Dice Tray骰盘**、**Tabbed Whispers聊天分页**，都能显著改善基础体验，你可以根据自己想要的功能自行挑选mod，这里就不展开赘述了，这里就推荐一个集大成的**Character Chat Selector**

<figure view-type="Preview"><source name="Character Chat Selector.mp4" mime="video/mp4" origin-height="1080.000000" origin-width="1920.000000" size="7371537" token="AlPxbvozloo3JgxGZtlcaNIenhb"/></figure>

此mod基本满足了文字聊天的基础，让你不用要选中token后才能以它身份说话，甚至更进一步还有markdown支持、聊天卡片编辑&美化和快捷键角色切换的等等功能，详细的都可以在mod页面和设置里进行查看。

### 评级：顶级

## [PopOut!](https://foundryvtt.com/packages/popout/) v2.23

> 我喜欢用是因为我有两个屏幕

“gm，gm，我还是不习惯在一个页面的侧边栏上聊天”有时候换了一个平台不习惯使用是十分正常的事情，又或者是想一直保持侧边栏关闭的状态，那么主播推荐以下这款，借助这个mod可以把你的聊天窗口弹出成一个额外的浏览器窗口。

可能大伙更多是用这个弹出角色或日志之类的，而要弹出聊天窗口也是相当简单，只要**右键聊天页面的按钮**，就能用PopOut!把页面弹出了，然后你就获得了一个能自由缩放的窗口，可以把它放在另一个屏幕，或借助某些置顶软件来快乐地玩耍了。

![图片展示了FVTT文字团体验优化mod中聊天记录界面右上角的图标。图标为一个带有箭头的圆环，箭头指向右上方。该图标位于聊天记录标题“聊天记录”右侧，其右侧还有“X”关闭按钮。此图标与上下文的关系是，上下文提到借助PopOut!mod可以把聊天窗口弹出成一个额外的浏览器窗口，右键聊天页面按钮后即可用此图标弹出聊天窗口，方便用户自由缩放窗口。](https://feishu.cn/file/VxC7bJAJDo1sdqxXdqVc9L8Wn8b)

### 评级：顶级

## [Carolingian UI](https://foundryvtt.com/packages/crlngn-ui) v2.25.0

> 成也卡洛琳，败也卡洛琳

文字团文字团，字也是重中之重，fvtt原生的确提供了添加额外字体的设置，然后。。然后你会发现它根本就没有自带换字体的功能，替换字体mod更是少之又少，而能替换聊天卡片字体的就卡洛琳独此一家了（叹气），看到这里的朋友可能并不清楚卡洛琳的恶名远扬，这东西就像一匹野马，会一头扎进你的css里，你可能会花很大的功夫来调整它，哪怕调整完了你也不知道它什么时候会在背后踹你一脚，关于它详细设置这里就不展开了（其实不是很想研究），想要用它的字体更换功能的朋友，我的建议是只开字体那部分设置，其他东西统统不要用。

**那么我们接下来就来看看要怎么在fvtt里添加字体并替换吧**

1. 首先要在网上下载心仪的字体文件，一般otf就行，然后放入你的fvtt文件夹里
2. 在核心设置-添加额外字体中添加该字体

![图片展示了在fvtt中配置额外字体的界面。界面中有“文件”和“系统”字体类型选项，当前选中“文件”。字体族处提示自行输入字体名称，字体重为Bold 700，字体样式为标准，字体文件为“assets/drakkenheim/Fonts/ChillDuanHeiSong_WideMedium.otf”。该图片与上下文紧密相关，上下文介绍了在fvtt里添加字体并替换的操作步骤，此图直观呈现了添加字体的具体设置界面，帮助用户了解如何在fvtt中配置额外字体。](https://feishu.cn/file/IaTDbxdSconWy8xSQZQcDfsmnXf)

1. 在卡洛琳设置里，如果只想修改聊天卡片的字体，就修改界面字体就好，可以直接选中之前添加的字体，也可以把字体族名字直接复制上去

### 评级：只用字体替换功能就是 人上人

# 二、在fvtt玩文字冒险是否搞错了什么

这一部分是基于想给pl们带来类视觉小说文字冒险感觉的优化建议。

## [Theatre Inserts](https://foundryvtt.com/packages/theatre) v3.3.0

> 理想很美好，现实很骨感

肯定有不少人在刚刚看到小剧场的第一反应是，好耶，我可以像replay视频那样来进行跑团，但是实际用下来就会感觉完全不是这回事，如果说你就是冲着这玩意就花了50刀来玩文字团fvtt，那我的评价是不如去玩ccfolia，两者要花费的功夫差不多，但隔壁的门槛只有一个梯子，下面请看我设置该mod的从期待到卸载的心路历程吧

**立绘。**带团前夕，你兴冲冲地对每个PL测试立绘，然后发现：诶，大小不一致？有的是token图，有的是全身，有的是半身，要怎么微调它们的大小呢。打开设置页——没法单独调，要调只能全改，当然可以把图都拉到统一大小，但对有立绘强迫症的人来说，唯一的解法是打开PS，自己动手。

![图片展示了 addCriterion图片展示了两个角色立绘，左侧是“测试”角色，为黄色头发的女性，手持武器，右侧是“半龙 Half-Dragon”角色，为红色皮肤的龙人，手持武器。画面下方文字说明“虽然只是举例，立绘之间的大小就是不得不去ps里调整才行”。该图片与上下文紧密相关，上下文提到在fvtt玩文字冒险时，立绘大小不一致，需在PS里调整，此图以实例呈现了立绘大小不一致的情况，直观说明 addCriterion图片展示了两个角色立绘，左侧是“测试”角色，为黄色头发的女性，手持武器，右侧是“半龙 Half-Dragon”角色，为红色皮肤的龙人，手持武器。画面下方文字说明“虽然只是举例，立绘之间的大小就是不得不去ps里调整才行”。该图片与上下文紧密相关，上下文提到在fvtt玩文字冒险时，立绘大小不一致，需在PS里调整 addCriterion图片展示了两个角色立 addCriterion图片展示了两个角色立绘，左侧是“测试”角色，为黄色头发的女性，手持武器，右侧是“半龙 Half-Dragon”角色，为红色皮肤的龙人，手持武器。画面下方文字说明“虽然只是举例，立绘](https://feishu.cn/file/VAGEbOycdo2NwCxRhRlcnNwXnBh)

**字体。**好不容易把图都修完，试试多人对话吧。一发消息，这宋体怎么这么难看，行距字距也读着不舒服。打开设置，找到字体选项，往模组文件里塞字体文件，反复尝试——换不了。再仔细一看，哦，原来是换角色名的字体啊。连卡洛琳都换不了对话框的字体，我投降。

**差分。**文字冒险怎么能没有差分。小剧场确实支持，也支持自己加。AI制图时代搞点差分不算难事，但当你实际用就会发现：选择差分，要点开对话框上的选项，再选需要的差分。听上去很简单，但额外的点击——对我来说已经宣判死刑了。PL操作不多，还能想起来选一选；当GM时要干的事多了，转头就忘有这个东西的存在

![看起来不错？这是因为我用的立绘是官方推荐的格式大小才有这个效果](https://feishu.cn/file/CRyxbNZJ1orYWBxNlGncPeyenme)

顺带一提，ccfolia是可以通过关键词自动切换差分的，虽然也要记，但只需要在输入的时候加个词就行，吊打小剧场。

小剧场还支持文字特效和旁白模式，演出效果确实不错。但搭配上面那俩问题——难看的宋体和没有快捷操作，再好的特效也是摆设。

更根本的痛点是注意力：RP的时候，眼睛一定是盯着右侧聊天记录和输入框的。文字优先，立绘是添头。小剧场的别扭就在这儿——你对话框里有内容，但内容被看不太可能。

它自己也意识到了，于是天才般地表示：既然你们都在看聊天记录，那我把聊天记录没收吧。

玩完一轮，我再也不想碰这玩意的设置了。还有角色名字无法隐藏、给PL开权限他们就会乱开的问题。

当然，也可能是文字团不太行，或者单纯是我懒。只是想展示立绘的GM们，还是可以改无对话框模式用的。

### 评级：NPC

## [Ginzzzu's Portraits & NPC Dock](https://foundryvtt.com/packages/ginzzzu-portraits) v1.17.0

> 青出于蓝而胜于蓝

有些mod作者会沉浸在自己的艺术里把mod越做越臃肿（点名批评某c姓mod），这时候人们可以选择无视那些不用的东西，也可以去选择更轻巧又更好的替代mod，文字团展示立绘，根本就无需小剧场，这款mod就能满足gm展示立绘需要的一切。

<figure view-type="Preview"><source name="Ginzzzu&#39;s Portraits &amp; NPC Dock.mp4" mime="video/mp4" origin-height="1080.000000" origin-width="1920.000000" size="59033818" token="Hg3Wb7tc9oOlO1xEj6Tc6ryZnwe"/></figure>

说实话这种简单直观开盖即食的mod我都懒得详细介绍怎么用，就简单说说它比较小剧场的优点吧。各个角色的立绘大小都可单独调整，此乃一胜；没有直接显示npc的名字，此乃二胜；我很喜欢它的红温小动画，此乃三胜。

唯一可惜的是它和小剧场都不支持动态立绘的展示，以及它没有快捷键切换立绘和工作台的显示/隐藏，不然我应该会直接给到一个夯。

### 评级：顶级

## [Narrator Tools](https://foundryvtt.com/packages/narrator-tools/) v1.0.1

> 来都来了，不再踩一脚小剧场再走吗

有的兄弟可能会问，诶这小剧场的旁白我还挺想用的，那么有没有平替呢，有的兄弟包有的，Narrator Tools能用指令来发送旁白，以及通过直接在文档里右键要发布的内容，关于详细的介绍直接查看主页即可，基本上只要记得`/narrate (or /narration) [message]` 这个指令，虽然不像小剧场那样直接按个按键就能发，但旁白的内容基本都可以提前在日志里准备好，所以我觉得这方面只是小问题，顺带一提，如果你熟悉修改日志的文案格式，这个也可以发出一些有格式的内容。

![黑体就是比宋体眉清目秀](https://feishu.cn/file/FCuobgzXHo3g9sxxJWXcIUxCnId)

### 评级：人上人

## [MRKB Background Display](https://foundryvtt.com/packages/mrkb-background-display) v1.0.0

> 突然发现我自己喜欢用的几个mod都疑似是韩国人做的

那么我们有了展示立绘和展示旁白的功能后，展示cg也应该是不可或缺的，传统做法当然是建一个个场景然后切换，但这里一个推出不久的新mod可以完美满足我们换cg而不用换场景的需求，具体使用方法就如下显示，不过美中不足的是它也没有快捷键支持，以及只支持PNG、JPEG、GIF格式的文件

![图片展示了Foundry Virtual Tabletop平台界面。左侧有多个图标，包括人物、1、场景、物品等。画面中央是灰色网格背景，右下角有播放控制栏，显示“Foundry(0:00)”及“0:00”。右上角有“-”和“X”按钮。该图片与文档中介绍的“mrkb-background-display”mod相关，用于展示了使用该mod时的界面情况，辅助说明其占位符处上下文提到的展示cg功能。](https://feishu.cn/file/RqddbOAyUoaJMtxtfSvckIRmnOM)

### 评级：人上人

### dlc：webm格式支持与Monk's Common Display适配

如果mod不支持webm格式的话，我那些精美的动态cg难道都要转成gif吗，偶内该，我不要干那么麻烦的事情啊

![图片展示了两个场景，左侧哆啦A梦旁有文字“哆啦基 addCriterion米我想用的mod不支持 addCriterion支持webm格式在GitHub上提issue作者也不理我”，右侧哆啦A梦旁文字为 addCriterion真拿你没办法看我的”。图片与上下文内容相关，上下文提到如果mod不支持webm格式，作者会面临转成gif的麻烦，而该图片以哆啦A梦形象幽默地指出作者在GitHub提issue时被作者无视，暗示作者者在处理此类问题时可能不够积极。](https://feishu.cn/file/OMo1bUoSxoKxRkxc2UwcfSo3nMe)

<figure view-type="Card"><source name="mrkb-background-display支持webm版.zip" mime="application/x-zip-compressed" size="10006" token="IJarbOoyYocRyJxbOQvcxUcrnyd"/></figure>

以及对Monk's Common Display这个mod有使用需求的gm，可以根据以下步骤添加白名单

1. 打开文件：`monks-common-display/css/monks-common-display.css`
2. 找到文件开头的这一长串 CSS 规则 (大约在第 6 行)：
3. codeCSS

```CSS
body.hide-ui > *:not(#logo):not(#interface):not(#board):not(#hud):not(#ui-left):not(#ui-middle):not(#ui-right):not(#confetti-canvas):not(#dice-box-canvas):not(#pause):not(#notifications):not(#narrator):not(#combat-popout):not(.image-popout):not(.journal-sheet):not(.journal-attached):not(#slideshow-display):not(#slideshow-canvas):not(#combat-carousel):not(#levels3d):not(#av-config):not(#camera-views):not(#combat-dock):not(#conversation-hud-background):not(.story-sheet):not(#boss-bar):not(#epic-roll-5e):not(.bossOverlay):not(.illandril-grid-labels--grid--container):not(.illandril-grid-labels--ruler--container),
```

1. 在这长串的 `:not()` 的**末尾，添加 `:not(#mrkb-display)`。**

## [Cinematic Cut-ins](https://foundryvtt.com/packages/cinematic-cut-ins) v1.7.0（付费）

> 就好JRPG这口

其实我一直在犹豫要不要把这玩意放上来，因为严格来说这里已经逐渐脱离单纯文字聊天的讨论了，但是我都来玩fvtt了，正是文字的局限性，才让我想通过立绘、旁白、cg、乃至音乐动画上给我的pl们提升体验，那么这款玩具，持续勤奋更新ing的动画预制菜，绝对是目前比较简单好上手的动画宏mod，其实还是演示视频做得比较好看，总之就是下限帮你摆好了，上限则要你自己去探索了。

<figure view-type="Preview"><source name="Cinematic Cut-ins.mp4" mime="video/mp4" origin-height="1080.000000" origin-width="1920.000000" size="51844889" token="RNRFbty1losN4HxhhubcUshAn1c"/></figure>

具体用法，你打开菜单后设置都是比较简单易懂，像简单的自动化它也有举例，这种玩具只要自己上手玩玩就能无师自通（暴言），这是[官方教程](https://www.notion.so/Cinematic-Cut-ins-Official-Wiki-2c8a9504d08780c8a694dcf0ffc791f2)的链接，我觉得主要的难点还是在怎么找到合适图/动画/音效，以及除了战斗特写像大成功大失败都可以做，总之就是爱捣鼓就多做。jpg

### 评级：对于热爱花里胡哨玩意的GM 夯

### dlc：拼车群

The Glitch Smith的全部mod现已加入93拼车豪华套餐：180316129

## [Visual Novel Maker](https://foundryvtt.com/packages/visual-novel-maker) v1.1.2（付费）

> 不是，怎么真能玩旮旯game啊

同是上一个 mod 的作者作品，具体效果可以直接看演示视频。简单来说，它基本包含了前面那些小剧场 mod 除了旁白之外的大部分功能，而且功能量还要更进一步，**角色立绘和背景cg都是支持动图gif或webm**的

<figure view-type="Preview"><source name="videoplayback.mp4" mime="video/mp4" origin-height="360.000000" origin-width="640.000000" size="10775033" token="JrrEbfcNqo3JtVxqqJScNgFFnyd"/></figure>

你不仅可以**自定义对话框、字体和 UI 风格**，还能提前设计好 NPC 对话、分支选项，甚至做出类似 Galgame 的演出流程，不过这一切的工作量就都得给GM来背负了。从角色立绘、表情、背景，到节点式对话、分支选项、演出节奏，本质上都需要 GM 自己提前配置。效果确实能做得非常华丽，但对应的准备成本也会直线上升。

它还带有**语音反馈立绘功能**，也就是检测当前是谁在语音里说话，并高亮他选择的对应角色。不过实际体验下来，这部分效果其实没有特别明显。更多是当前说话角色保持正常显示，其他角色自动淡化，整体存在感不算特别强，~~提这个其实是为了纪念逝去的毛子mod Drama Director~~  

### 评级：旮旯game里可不是这样的 顶级

# 三、越是捣鼓fvtt，就越会发现MOD的能力是有极限的

这一部分是基于想借助外部力量来提升体验的优化建议。

## [菠萝文字团工具嵌入](https://foundryvtt.com/packages/Boluo-chat-embed-Foundry) v2.2.0

> 大概是饺子醋吧大概

正如上文所提到的，fvtt的原生文字体验是一团糟，那么最简单的办法不就是不用fvtt自带的聊天吗，下面请看，我们伟大的星尘佬带着他的mod和sealchat过来了，~~有人要说了为什么用sealchat而不用qq呢，因为我骰子似了😭~~，关于sealchat的强大我就不再赘述了，可以去看星尘佬的[介绍视频](https://www.bilibili.com/video/BV1iDiiBDEbh/?spm_id_from=333.337.search-card.all.click&vd_source=bbdcdd386a6baa22697fa4711d34f924)，关于功能与部署他都详细介绍了。

那说回mod，使用也十分简单，只要在设置里，把你sealchat的链接贴上去就可立刻在fvtt里爽玩sealchat了，建议可以把聊天卡片也打开噢

在最新的更新中，还有crpg实时对话框功能，配合上sealchat的打字快速差分切换，简简单单吊打一众小剧场mod，详情可看以下介绍视频

<readonly-block href="https://player.bilibili.com/player.html?bvid=1opRtBkEvX&amp;share_source=copy_web&amp;vd_source=f8a0f6267cc36a53596d3586eaf626f8" type="iframe"></readonly-block>

### 评级：星尘佬伟大 夯

### dlc：聊天同步宏

想要让fvtt的聊天内容（主要是掷骰内容）同步到sealchat上，可以使用它的webhook功能，在sealchat创建成功后，在fvtt建立以下脚本宏填入你的ip和token后启动，就可以将你的掷骰记录啥的发送到sealchat上了，该宏不保证能发送某些有自动化功能的卡片，所以请根据自己的情况进行使用。~~其实宏我是让ai做的，如果你觉得发送的内容需要调整可以直接丢给ai让它帮你改~~

![图片展示了SealChat聊天界面的更多功能选项。点击界面右上角的“更多”按钮后弹出下拉菜单，其中“Webhook”选项被红色框线突出显示。该图片与上下文紧密相关，上下文提到在最新更新中，使用sealchat的聊天同步宏，可将fvtt的聊天内容（如掷骰内容）同步到sealchat上，图片直观呈现了实现这一功能的Webhook选项所在位置，帮助用户快速找到相关设置入口。](https://feishu.cn/file/AP8rbA3ZtoNfuexBiI0cd1KOncf)

```JavaScript
// --- 配置信息 ---
const SEAL_CONFIG = {
    url: "http://你的ip地址/api/v1/webhook/channels/你的频道代码/messages",
    token: "你的token"
};

// --- 开关逻辑 ---
if (window.sealChatHookId) {
    Hooks.off("createChatMessage", window.sealChatHookId);
    window.sealChatHookId = null;
    ui.notifications.warn("SealChat 同步已【关闭】");
} else {
    window.sealChatHookId = Hooks.on("createChatMessage", (msg) => {
        if (msg.whisper.length > 0 || msg.blind) return;

        // 1. 获取发送人名字 (优先使用角色名/别名)
        const speakerName = msg.alias || msg.author?.name || "未知";

        // 2. 处理正文：清理 HTML 并保留换行
        let cleanText = msg.content
            .replace(/<(br|p|div)[^>]*>/gi, '\n') 
            .replace(/<[^>]*>?/gm, '')
            .replace(/\n\s*\n/g, '\n')
            .trim();

        // 3. 处理掷骰详情
        let rollInfo = "";
        if (msg.rolls && msg.rolls.length > 0) {
            const rollDetails = msg.rolls.map(r => `(${r.formula}) = ${r.total}`).join('\n');
            rollInfo = `\n\n【🎲 掷骰详情】\n${rollDetails}`;
        }

        // 4. 组装最终文本：[发送人] + 换行 + 正文 + 掷骰
        // 在最开头明确标注发送人
        let finalMessage = `【👤 发送人：${speakerName}】\n${cleanText}${rollInfo}`;

        if (!finalMessage.trim()) return;

        // 5. 执行同步
        fetch(SEAL_CONFIG.url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SEAL_CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "op": "message.create",
                "message": { "content": finalMessage },
                "identity": { "displayName": speakerName } // 同时保留身份显示
            })
        }).catch(err => console.error("SealChat 同步失败:", err));
    });

    ui.notifications.info("SealChat 终极同步已开启！(含发送人姓名)");
}
```

## 宏与ai

> 纪念当初还没变蠢的哈基米3

看到这里的朋友也许会觉得我是什么代码大佬也说不定，能自己修改mod还会做宏之类的，其实我一丁点js都不会，关于mod的修改和宏的制作，都是我问ai或让它生成的，虽然其中也不乏打回重做和不停鞭策，结果就是我依靠免费ai就成功让他做了我想要在fvtt上实现的简单目标（再难也做不出来），所以想要优化自己体验的朋友，不要害怕使用宏，勇敢地向ai提出自己的需求，反正，pl们不会知道你的代码有多屎的（？）

我使用的是Google ai studio的gemini 3 pro，那么我就简单说说我的焚决吧，~~那当然是“救命啊，这里报错了”（贴代码）~~，关于mod的微调，这个建议在伤筋动骨前还是先备份，然后给贴上文件树+文件代码（要是太多就只贴文件树），然后提出想要的功能，运气好，它就能帮你做好，运气不好，你就得反复拉扯，毕竟我用的是免费的，实在做不出来放弃也是很重要的；宏也是同理，反而宏的实现比mod更简单，一定要多测试，报错了记得去f12控制台把内容贴给他

### 评级：越贵越夯