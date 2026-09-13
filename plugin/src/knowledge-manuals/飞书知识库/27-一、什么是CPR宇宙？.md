# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/QRDAwvmuhitZ8RkFyB5cwoHWnJx

# 一、什么是CPR宇宙？
CPR（Cauldron of Plentiful Resources）原名Chris's premades，是当前综合性自动化预制最多的一个mod，与其一同开发的还有GPS（Gambit's Premades）和MISC（Midi Item Showcase - Community），如今还有ACC（
Automated Crafted Creations），其使用方法各不相同，但总体而言，全部集中在无处不在的医药箱上。
![图片](images/UhAvb4bYzor8xlxYNSTc9Xj0nPc.png)
---
# 二、从CPR设置开始
## 1、使用之前
首先你确定你需要这样程度的自动化——因为它需要相当多的mod配合。
其次确定你有一定的英文水准。
CPR/GPS/MISC都需要一些前置，请将这些前置安装完毕后再启用。
建议前置全部更新到最新，并保持所有相关mod与系统为最新（查看CPR的github release确定是否匹配最新版本，一般在大版本号更新时证明其需要更新系统。）
> 💡 
如果你在使用巴别塔汉化，请更新至最新版（2026年1月20日写下），自现在开始github和paratranz已经删除了除CPR动作以外的汉化，按需模式不会再使部分CPR特性失效了。
如果你使用的汉化版本不那么新，请开启全量模式，并在modules\dnd-simplified-chinese-babele-patch\translation\cn 文件夹下删除所有chris-premades开头的汉化文件，可以保留chris-premades.CPRActions和chris-premades.CPRActions2024。
> 💡 
[Plutonium-CN中文版](https://xcnplziulnma.feishu.cn/wiki/VYZRwQUhHiZfYAk57spc8cdqnbg)更新推荐：使用 和Plutonium Addon: Automation（PLU中文内测群改版，非giddy原版）导入法术/特性，能做到一键匹配CPR/GPS/MISC，但那些没有自动化匹配的内容其标识符会消失，目前没有看到影响，但对于一些自动化来说需要再手动去对比填入。
CPR依赖 mod：
- midi-QOL
- Socketlib
- Dae
- Times-up
- lib-wrapper
GPS依赖 mod：
- Aura effects
- Sequencer
- Region Attacher
选开：
- JB2A
- FXmaster
- Animated Spell Effects: Cartoon
- Jinker's Animated Art
- PSFX
- Rideable
- routinglib
- Vision 5e
- Visual Active Effects
---
## 2、通用选项
![图片](images/LkC9bjxvGoQRm5x8rk3cmvnSn0f.png)
其他模组检查和其他模组设置检查：
建议不勾选，CPR有对MIDI设置的需求，如果不匹配则会在进入世界时提示，点击聊天栏中的帮我解决即可自动更改设置。
相关权限：
建议设为GM，防止PL手贱。
启用CPR动画：
如果你的GM端配置不够好可以不选
启用嵌入式宏编辑：
在CPR宏编辑一节中讲解。
检查更新：
建议开启，以跟进最新版本。
禁用移动性能警告和移动事件精度：
建议开启为低精度，并禁用警告，除非你是富哥们电脑扛得住高精度检测。
第三方内容：
建议开启，否则第三方内容找不到
职业法术日志：
目前这个选项没有东西，理论上应当选三宝书PHB玩家手册日志（5r）classpack法术列表日志（5e）
---
## 3、对话框选项
![图片](images/Xvmab6FSioz5rKxtuTEczPvFnMn.png)
所见即所得（大概特指使用CPR的dialog函数调出的对话框）
---
## 4、UI选项
![图片](images/AujObWbcQokxx0xicp4c7D5dnIe.png)
![图片](images/RkwjbU35KoppaBxkdDUchoA8nBH.png)
临时效果HUD：
建议开启，会将token身上的临时效果全部加入此页面，可以快速取消效果。
![图片](images/XWoabGVfCoFNsRxUDIdcVPOWnBm.png)
合集ID按钮：
有快速复制合集包uuid需求则开启
![图片](images/CMFLbRRKvo8LnPx84bVcagtan0e.png)
启用效果交互页面：
建议开启，CPR好用功能之一。
![图片](images/XL0zb7dXwonrs8xtfikcW0XEnhf.png)
你可以在这里查看效果、右键编辑已有的系统效果（就像编辑普通的效果一样）为其添加自定义的效果，将需要重复使用的效果拖动到此处储存起来快速取用，也可以在此处新建效果来编辑属于自己的系统状态。
![图片](images/QiyEbn4nEouMxkxxSP9cb3rVnlh.png)
当你的自定义效果被创建后你可以右键添加到状态效果，此时它会像一个普通的系统自带状态一般出现在HUD页面之中
![图片](images/QgVYbwsh8otQF7x8nUrccPhCn1b.png)
[激活条件](https://xcnplziulnma.feishu.cn/wiki/SDBHwnvcWigh6gkvZpEc48xQn2f)而此时我们就已经可以在 中判断该效应的名字了。一个例子，德城mod提供了很多新状态，但是没有效果，一般情况下无法编辑，而有了CPR我们就可以在效果侧边栏对其进行编辑来获得自动化。
导出共享：
按需求开启
快速条件：
建议开启，CPR好用功能之一，开启后在任意行动的midi标签页面新增如下功能：
![图片](images/QQOJbUDN7oerMhxBwlAcyPSAnib.png)
点击此处+号即可打开UI
![图片](images/JPv4bHtOKoOIU8xNcuwcsf8gn1d.png)
来快速填写一些常用的判断条件，让没有js基础的人也能很快地做出自己想要的简单自动物品。
[激活条件](https://xcnplziulnma.feishu.cn/wiki/SDBHwnvcWigh6gkvZpEc48xQn2f)具体判断条件参考 
无处不在的选择工具：
建议不开，框选有时候不是好事
替换状态图标：
建议不开，到现在CPR的部分图标文件地址都是错的，除非你想自己改地址
禁用无效果状态：
建议不开，这会导致许多其实是有效果的状态被移除，比如以太；也会影响到AC5E对状态的自动化，比如燃烧；也有被诅咒这种单纯标记的状态会被移除。
紧凑模式和聊天消息深色模式：
看需求开启
自动效果详情描述：
建议禁用，很多法术描述相当长，这会导致（假设开启VAE）右侧描述占满整个屏幕。
自定义侧边栏、自定义侧边栏按钮缩放和自定义导航缩放：
除非你懂CSS是什么，否则建议不开
设置状态图标的图像：
配合替换状态图标，可以自定义状态图标
隐藏npc效果详情描述：
配合自动效果详情描述，可以避免PL从移动过来的描述中看到BOSS数据和解决办法或是一些不想给的信息
隐藏合集包和隐藏合集包文件夹：
可以屏蔽不想展示的文件夹/合集包，屏蔽后所有人（包括GM）都看不到，但合集包浏览器仍能在有查看权限的情况下查询到相关内容，用于整理合集包侧边栏。
额外物品右键选项：
可以开启，和Item Piles功能略有重复
---
## 5、合集包选项
![图片](images/UzsRbgxnCo0ZPtxUIgGcNoHynYb.png)
部分特性，例如旧荒野变形、旧刃之魔契、旧召唤法术，是需要你从某合集包中选择已经放入此合集包的，符合条件的物品，而此时就需要用这个功能来选择一个特定的合集包。这种类型的能力一般在5e，5r的同名能力不需要这些。
宏合集包：
[如何制作CPR自定义宏](https://xcnplziulnma.feishu.cn/wiki/FT2KwikmSiSOqxkH3VUcLydXn9g)用于自定义CPR宏， 。
额外合集包：
![图片](images/QJXubiXlbo25woxv5sVcgNLGnFc.png)
一般情况下会勾选GPS和MISC，如果你有别的想通过医药箱替换的内容也可以在这里勾选。
---
## 6、游戏机制选项
![图片](images/WOfhbqFPBouDpJxBoIWca5GSncc.png)
![图片](images/Fmi6bsjFxodFY1xHi9ic2NVBn1b.png)
DMG扫荡：
按需开启，5e限定，位于城主指南-城主工坊-战斗选用项-扫荡怪群
为token添加动作：
建议开启，CPR好用功能之一，它的通用动作非常全面。配合巴别塔汉化可以做到中文使用。
传奇动作提示：
建议开启，可以做到提示+点击使用未使用的传奇动作，在多人都有传奇动作的时候有UI多选。
召唤物分组：
按需开启，分组功能可能有人认为折叠起来不直观。
召唤物继承召唤者高度：
按需开启。
同步角色与token体型：
建议开启，但似乎不能在地图上直接更改，至少在侧边栏修改体型后放置到地图上是可以同步的
展示子状态：
按需开启，它和DAE自带的可选功能似乎是重复的，选一个开启即可。
应用midi-qol状态效果：
按需开启，与AC5E功能重复，安装AC5E就不要开这个。
更新伙伴先攻和更新召唤物先攻：
按需开启，召唤物紧跟行动是对的，但也有部分召唤物有自己的先攻。
武器精通自动化：
如果你不想看到NPC人人精通，建议仅玩家，NPC默认全精通
火器自动化：
我没看过critical role，不知道它的火器规则，无法建议。在我仅有的一次开启过程中火铳卡壳后不知道如何修理最终以直接给一把新火铳了事。
状态抗性与易伤：
建议开启，可以通过DAE效果flags.chris-premades.CR.XXX和flags.chris-premades.CV.XXX来使用，功能与AC5E同类效果重复。
玩家自行选择咒唤类型：
按需开启，5e限定，可以让PL自选8狼而不是你选具体咒唤什么生物。
疗愈：
按需开启，5e限定，位于城主指南-城主工坊-冒险选用项-治疗
禁用特殊效果：
按需开启，防止PL抱怨隐形过于真实（安装Vision 5e可以用听力半解决）。
结阵魔法：
按需开启，费伦书特色，开启后将在通用动作中新增一个结阵施法。
英雄激励：
[Optional使用说明](https://xcnplziulnma.feishu.cn/wiki/XTHzwfanviDMMRkTGOCcOnfwnu2)强烈建议开启，由于5r英雄激励比5e用的地方多，CPR该方法比使用 来的方便简洁且更加通用，你只需要点击人物卡等级边上的方块点亮激励指示物即可。
![图片](images/CthBbi5qroBM9Jx9BxicYyqsn5d.png)
为了方便点亮该激励，你可以使用如下宏来激活人类的适应力特性、音乐家能力、领主联盟特工的特性：
```
if (workflow.targets && workflow.targets.size > 0) {
    for (let target of workflow.targets) {
        await chrisPremades.utils.actorUtils.giveHeroicInspiration(target.actor);
    }
}
```
复制以上代码，粘贴至
![图片](images/J6XebhZFXoWYrcxR6qQcqmFHnLg.png)
接下来点击midi-QOL打开调用宏页面，点击加号
![图片](images/MAe8bbJ2yo15zox2OA1c3Nkhnrc.png)
看到这个界面即可关闭。
接下来为该物品创建一个效用行动，如果是人类适应力选择长休结束，如果是音乐家选择特殊。在设置好目标后，对想要添加激励的目标使用即可为其点亮激励指示物。
不用担心英雄激励误给NPC，NPC不具备该数据。
同时，你还可以为PC添加一个被动效应来检测是否拥有激励而不需要点开人物卡确认：
我们为PC卡在效应页面直接创建一个被动效应
![图片](images/QqhEbqTgBokcpXxmrArc6FXhnHd.png)
勾选始终显示效果图标，在表达式，如果为真将禁用效果一栏内填写
```
!attributes.inspiration
```
最后修改效应名称和图标，即可做到在具有激励指示物时在token上显示该被动，而在激励消失时自动禁用。
当然，你也可以使用Monk's tokenbar来在tokenbar上直接看到激励存在与否。
通用动作模式：
配合为token添加动作，建议选择单项物品，否则你会在人物卡里得到大概15-18个不等的通用动作，大量占用空间不说还不能自动删除要一个个删，你的HUD也会被占满。选择单项后你会在token被放置到地图上时获得一个通用动作。
![图片](images/QkfAb6lS5o5YEgx9ktxcMfCTnWc.png)
点击弹出动作列表然后使用。
---
## 7、MOD整合
![图片](images/GPELbNRbYooWmkxeQrzceVJjnHe.png)
建议全开，都是省事功能（除非你到现在还在用DCE）。
---
## 8、房规选项
![图片](images/U1BRbTAYUonBrbxp2npcj9gFnKe.png)
博德之门3武器动作、博德之门3武器动作使用次数和设置博德之门3武器动作：
我的建议是不开，除非你真的很喜欢BG3武器通用动作。目前有bug，两把有交叉通用动作的武器同时装备会陷入无限循环，一旦卸下就会在卡里增加一个通用动作不会跟着卸下而自动删除。我认为CPR可能是很按插拔武器的字面意义来要先卸下第一把再装备第二把武器。
大失败合集包、重击与大失败模式、重击合集：
按需开启，在重击或大失败时会从你设置的合集包里选一个物品使用，工作量巨大。
爆炸性治疗：
按需开启，开启后全局（包括NPC）的治疗掷骰将会获得5r术法爆发同款爆炸，并且无上限。
---
## 9、手动掷骰
![图片](images/FsXQb7uq1o9kFbxnMi1c9GOmn0d.png)
如果你有这个需求就开启
![图片](images/ROXpb213tobbKtxg56WcjKSvnIc.png)
在掷骰后将会出现如上画面，可以填写结果，但你一旦做的不够快就很容易穿帮（对拥有预言法的队伍很有用）。
---
## 10、角色备份
![图片](images/QfoYbTPtronzlQxaEjxc1xHEnJe.png)
如果你有这个需求就可以自建一个空角色合集包然后选择并点击生成备份。
---
## 11、帮助
![图片](images/FIfsbl22ooHpl2x8koccljPfnMf.png)
点击前往教程会出现CPR的简略教程——几乎足够使用。
点击打开故障排除会跳出当前CPR及相关模组设置，点击保存可以在你的下载目录中看到，用于向Chris的discord提交错误报告。
---
# 三、CPR核心机制——医药箱
CPR的一切都集中在这个小小的医药箱里，它能做到的功能远远不止匹配这么简单。
不要在合集包使用医药箱一键匹配CPR！这可能会导致流程卡住！
## 1、一键匹配功能（PC、NPC通用）
无论是PC还是NPC，在人物卡右上角标题栏都会有该医药箱。
![图片](images/TzgSbvkQlovWOWxyPQMc0vK4nhf.png)
点击此CPR应用(医药箱)，可以一键匹配、更新人物身上已有的物品。
匹配时，需要该物品名字与CPR合集包内的英文名字完全一致，大小写、空格敏感。
更新时，只需要点击更新即可。
对于5e来说，classpack采用了中文+英文的形式，这样可以使用以下宏来一键匹配。
📎 文件: 
对于5r来说，巴别塔双语模式已经开发完毕，打开双语开关后使用该宏即可。
对于NPC来说，由于其名字是中文，因此几乎不可能用医药箱来直接匹配怪物特性。
![图片](images/MDbUbqG3PoZNLNxfRzfcjP5Ankc.png)
如果你确定合集包内有该怪物的特性，那么将此处修改为英文的怪物名字（大小写敏感）即可一键应用，不需要改回来。
---
## 2、物品上的医药箱（PC）
![图片](images/MSrAb5jxVoGqG1x5FoucoBppnUb.png)
一般情况下，你将会看到如上界面，这是正常的。现在我们修改其名字为Lay on Hands
![图片](images/X6Cgb2t1fobcihxh4RicOvuXnQh.png)
医药箱变成了黄色，证明此时其已经找到了可匹配对象。
![图片](images/Xm4MbwIbkoZXuExKt3Acsqlxnef.png)
点击选择的自动化下拉菜单点击确认即可完成匹配，通常情况下是绿色。
匹配过程不会将描述删除，它只是更改了CPR标识符，因此你现在可以将它修改为任何名字都不影响使用。
当医药箱是蓝色，证明其拥有一定程度的可选配置。
![图片](images/Co5UbfRH5oP3O3xjIVZc6PNcnpe.png)
以至圣斩为例，你可以在此处更改其内容。
当医药箱是红色，证明其自动化过期，或是规则不匹配。
![图片](images/MwYEbgeEMoAMSfxjKEycqTixnI4.png)
若是规则错误，点击切换物品规则即可。若是因CPR版本更新导致自动化过期，及时点击更新。过时内容可以在角色表上的医药箱看到，并可以一键更新。