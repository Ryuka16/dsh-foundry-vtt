/**
 * @dsh-external/dsh-foundry-vtt —— 把 FVTT 控制能力做成 DSH 原生工具包。
 *
 * 职责：让 DSH 任何新对话的 AI 都能直接调用工具控制 Foundry VTT——
 * 掷骰、搜索/读/建/改/删实体、改怪物数值、加自动化状态效果。
 * 底层走 ThreeHats foundry-rest-api 模块的本地 relay（localhost:3010）HTTP API，
 * 不依赖独立 MCP 进程：这里直接用 node 内置 fetch 调 relay，
 * 协议与 foundry-rest-api-mcp-server 完全一致（x-api-key header + clientId query + 信封解包）。
 *
 * 零静态依赖：不 import 任何 @deepseek-ai 包（避免注入目录缺 node_modules 解析失败），
 * 工具经 ctx.tools.register(原始 ToolDefinition) 注册，参数 schema 用原始 JSON Schema，
 * 必填校验由本插件自做（同 dsh-relation-map 的成熟模式）。
 *
 * 配置优先读 ~/.dsh/dsh-foundry-vtt/config.json（可手改、持久、重启仍在），
 * 兜底环境变量 FOUNDRY_RELAY_URL / FOUNDRY_API_KEY / FOUNDRY_CLIENT_ID，再兜底默认值。
 */
import { promises as fs, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { registerExtraTools } from './tools-extra.js';
/** 注入系统提示的工作铁律：强制 AI 先查模板/样本/真源，再写 JSON。每个新对话 AI 自动看到。 */
const DESC_STYLE_PROMPT = `## FVTT 文案风格（写物品/怪物/特性/法术的描述与聊天文案时，一律照此执行）

出处：用户提示词库 05_扮演技巧.md 第十四节「描写的度」+ 第二十三节「祛 AI 味」、04_战斗描述.md。
用户已因「太 AI 了」打回多次，这不是建议，是交付标准。

### 一、长度：写到「能动、能查、有感觉」就停
每多写一句，先问自己：**「这句不写，玩家会错过什么？」** 错过的是线索/伏笔/情绪 → 留；错过的只是「画面更美、更全」→ 删。
**外观与氛围 2~4 句**（不超过一段）；特性与法术的机制说明 1~3 句。
**详细 ≠ 堆形容词。** 详细 = 给具体可验证的细节（锈迹、蜡封、刻字、气味、数量、痕迹），让玩家能顺着去查。
⚠️ **机制必须写进描述**（照下一节的官方格式）—— 卡面的活动页玩家未必点开，截图、打印、讨论时更是只有描述，
**第一次拿到这东西的人只能靠描述知道它能干什么**。只写氛围不写效果 = 交付不合格。
用户没给的设定**不要自己编**（教义、来历、人名、地名一概不加）；用户给的词就照用，不加戏。

### 一之二、物品描述的官方格式（照 5E 不全书 · 城主指南的写法）
官方排版是「**总述一段 + 每个效果各自一段**」，段与段之间空一行。
**是自然段，不是 markdown 小标题**（不要 ##、不要 - 列表、不要加粗条目名当标题）——
卡面上小标题会读起来像说明书。但**效果之间必须分段，绝不挤成一整坨**。

- **第 1 段：外观与来历**（材质、形状、明显特征、来路；2~3 句）
- **之后：一个独立效果一段**，段首可以直接带效果名，再把该效果机制交代完
- **并列项各自一段**（按钮 1/2/3 那种、三档充能消耗那种，一项一段，不要写成一行里的分号列表）

官方实例（王者权杖，11 段）：
  第 1 段：这把权杖顶端有尖刺状凸起。它还是一把魔法硬头锤。你用它发动的攻击检定和伤害掷骰获得 +3 加值。王者权杖的杖柄上排列着六个不同的按钮……
  第 2 段：六个按钮 Six Buttons。你可以用一个附赠动作按下权杖六个按钮之一。某个按钮的效应将一直生效，直到你按下另一个按钮……
  第 3~8 段：如果你按下按钮 1，权杖将变为一把焰舌 Flame Tongue。…… ／ 按钮 2…… ／ 按钮 3……（**每项一段**）
  第 9 段：吸取生命 Drain Life。用权杖发动近战攻击命中一生物时，你可以迫使目标进行一次 DC 17 的体质豁免。……
  第 10 段：麻痹 Paralyze。用权杖发动近战攻击命中一名生物时，……
  第 11 段：惊惧 Terrify。持握此权杖期间，……

对应 FVTT 实现：system.description.value 是 HTML，**用多个 p 标签分段**（一段一个 p 标签），不要用 h3、不要用 ul/li、不要一整段塞到底。

**每个效果都得交代全这 7 件事**，缺一件玩家就得追问 DM：
1. 用什么动作（一个动作 / 一个附赠动作 / 一个反应 / 无需动作）
2. 什么时候能用（持握时 / 佩戴并同调后 / 用近战武器命中时 / 每天一次）
3. 距离或范围（30 尺内 / 15 尺锥形 / 触及）
4. 对抗方式（DC X 的【属性】豁免 / 一次攻击检定 / 无需对抗）
5. 结果（失败受 NdM 点【伤害类型】伤害 / 陷入【状态】 / 成功则伤害减半）
6. 持续与重试（持续 1 分钟；目标可在它的每回合结束时再次尝试该豁免，成功则终止效应）
7. 充能与恢复（N 发充能、消耗几发、多久恢复几发；或「此后直到次日黎明前无法再次启动」）

**官方句式（直接套用）**：
- 被动加值：「你用它发动的攻击检定和伤害掷骰获得 +3 加值。」「佩戴它并完成同调后，你的 AC 获得 +1 加值。」
- 主动使用：「你可以用**一个动作**……」「你可以用**一个附赠动作**……」
- 命中触发：「用**近战武器**发动攻击**命中一生物时**，你可以迫使目标进行一次 **DC 13 的体质豁免**。」
- 豁免结果：「如果**豁免失败**，则目标将受**额外 1d6 点黯蚀伤害**，且在**每回合开始时**重复此伤害；**豁免成功**则终止该效应。」
- 持续与重试：「目标将**麻痹 1 分钟**。目标可以在**它的每轮结束时**再次尝试该豁免，**成功则终止其身上的相应效应**。」
- 充能：「这件物品有 **3 发充能**……**每天黎明时恢复 1 发**已消耗的充能。」
- 重置：「此后**直到次日黎明前**，该属性都无法再次启动。」

**术语一律用官方译名，不要自造**：
- 对抗叫**豁免**（不写「抵抗」「抗性检定」）
- 动作叫**一个动作 / 一个附赠动作 / 一个反应**（不写「主行动」「附加动作」）
- 伤害类型 13 种：**钝击 / 穿刺 / 挥砍 / 强酸 / 冷冻 / 火焰 / 闪电 / 雷鸣 / 毒素 / 心灵 / 光耀 / 黯蚀 / 力场**
  —— 注意是「**黯蚀**」不是「暗蚀」
- **DC** 用大写；使用次数叫**充能**；装备绑定叫**同调**
- 时间用**回合**（自己的回合）与**轮**（每轮结束时）

**这些写法一律不合格**：只写氛围不写机制 / 写成代码腔（damage.base、save DC 之类）/ 漏掉动作类型或距离 /
自造术语（抗性检定、暗蚀伤害、主行动）/ 把机制塞在括号里一笔带过。

### 二、AI 味 = 没有逻辑重音
写完**自己念一遍**：念不顺、找不到重音在哪，就是没写好。
**AI 烂句式黑名单（一律不许出现）**：
- 显得就你知道：很多人不知道的是 / 你可能想不到 / 鲜为人知的是 / 你有没有想过 / 你会发现
- 强行拔高：这背后隐藏着一个深刻的秘密 / 看似…实际上是 / 从某种意义上来说 / 站在历史的长河中
- 假转折假逻辑：我们不妨换一个角度来看 / 首先我们要明确一个概念 / 值得一提的是 / 真正重要的不是…而是
- 假装深沉强行闭环：值得我们深思的是 / 这告诉了我们一个道理 / 真正的原因是 / 背后的逻辑是 / 这也是为什么
- 模板填空式的动作词缀：抄起 / 压低重心 / 自斜上方劈落 / 一记漂亮的
**判据一句话**：这句话有没有「作者跳出来替角色、替玩家说话」的腔调？有，就是 AI 味，删掉或改成角色自己的话。

### 三、战斗与效果文案（写 useFlavor / chatFlavor / 触发文案时）
- 不要分段报告（第一斧、第二斧）、不要大白话（啪啪啪三下）、不要规则说明（造成 2d6 火焰伤害）、不要 DM 视角（它对玩家造成）
- **展示，不要告知** —— 用感官（视觉/听觉/嗅觉/触觉）传达发生了什么
- 未命中和豁免成功**也可以很精彩**：不是「你砍偏了」，而是**对手做了什么**（用矛拨开剑刃、箭矢钉入身后石壁、一口咬碎箭杆）
- 伤害类型用感官而非数值：火焰=水泡鼓起/焦臭；冷冻=呵气成冰/关节僵死；毒素=血管发黑从伤口蔓延/视野发绿；暗蚀=肤色灰败/眼眶凹陷；心灵=颅内有异物感/念头变陌生
- 一段话三五句，不拖沓不敷衍

### 四、用户要调性时
用户说「加点氛围」「像棺材那种厚重」「别太网文」时，**只调语气，不改长度上限，不加机制**；改完仍要满足上面三条。`;
const WORKFLOW_PROMPT = `## FVTT 工作铁律（写任何 FVTT 内容前必须遵守）
0. **默认先给用户过目；他说不用看，就直接建**：
- 建东西前**默认先出一版预览**（创建类工具不带 confirmToken 即预览，不写进世界），把**名称 / 数值 / 描述文案原文 / 机制**讲给用户听。这是默认动作，不是每次都要请示。
- **用户说「不用看 / 直接建 / 你定就行」时，不要再问一遍** —— 自己拿预览返回的 confirmToken 立刻建下去。他要的是省事，不是多一轮往返。
- 用户说「改一下」就改参数、重出预览；**不要把「用户同意过任务」理解成「我可以随便改」**。
- 落库后回报要具体：uuid + 实际落库的关键值，不是「已完成」三个字。
1. 先查后写，严禁凭记忆手搓 dnd5e JSON：
- 结构模板 → foundry_reference（主题：weapon/roll-data/save-activity/effect/creature/feat/spell/status-list/bonuses/midi-over-time/midi-flags/other-activity/activity-types/midi-properties/daelink/probe/item-macro/aura/dae/conditions/enchant/optional/trigger/overtime-activity/iron-rules/pitfalls），模板秒回，照抄改数值。**写任何公式/DC/加值字段前先看 roll-data**；写多活动物品前看 other-activity + activity-types；**卡面全对但游戏里不生效，第一动作是 foundry_reference{topic:"probe"} 拿一段 F12 探针给使用者跑，别改代码猜**；**「命中 → 豁免 → 中毒」不生效先看 daelink**（最常见原因：没装 DAE 模块，midi 里 hasActivityEffects = hasDAE(this) && ... 整段跳过）。
- 真实样本 → foundry_knowledge topic:"samples" 列索引找同类实体（怪物卡/武器/状态与中毒/持续伤害OverTime/光环/物品宏/DAE特殊时长/法术特性/装备/奇物），file 读样本（大文件先 query 关键词再 offset 翻页）。0 实例的键名禁止写进文档。
- 图标路径 → **做物品/效果/token 前，先 foundry_search_icon{keyword:"sword"} 检索，把返回的候选列表看一遍，自己挑一张最贴的填进 img / effectImg**（这是你的活，别指望插件替你选）。可加 dir:"weapons/polearms" 收窄、一次最多 200 条。搜不到就换词根（longsword → sword、warhammer → hammer、handaxe → axe、quarterstaff → staff —— 这些整词在真源里不存在），或 foundry_file_system{source:"public", path:"icons/weapons"} 翻真实目录看实物；要分类全貌时读 topic:"icon-map"（13 大类 + 效果图标对照表）。6560 条真源随插件发布，任何环境可用。**一律用 webp（真源 6248 条实物图），禁止用 icons/svg/ 那 118 条抽象方块图（aura.svg/circle.svg 之类），也不要用 systems/dnd5e/icons/svg/ 那 237 条系统 UI 图标**。禁止猜路径，猜错 = 卡面裂图。
- **模块 API / 标志名 / 函数签名** → 先 foundry_knowledge topic:"manuals" 不带 file 列索引（28 个模块官方文档 + 57 篇飞书原文，随插件发布），再 file 读原文、query grep 定位。**要写具体模块的东西时必查**：Sequencer 特效、midi-qol flags、DAE 键名、AC5E、TokenMagic、Rest Recovery、Automated Animations、CPR 宏。**纯 dnd5e 结构不用查**（走上面第 1、2 行就够）。
- CPR 宏 identifier → foundry_knowledge topic:"cpr-mapping" 查映射表，禁止瞎编（本机资料库主题，未配置时查不到，那就直接照 manuals 里的 CPR 文档走）。
- **dnd5e 系统自身写法**（活动字段/公式引用/AC/移动/感官/角色卡结构）→ topic:"dnd5e-quickref"，**已按 5.3.3 校准**。⚠️ 别照抄 dnd5e 官方 wiki——那是 6.0.0（只支持 Foundry v14+），移速 @attributes.movement.speeds.*、感官 @attributes.senses.ranges.*、12 种活动类型等本项目全没有，照抄必错。写 dnd5e 原生字段前先查它。
- **做自动化 / 写宏 / 查模块机制** → 资料库已随包发布（内置副本，任何环境可用，先来这里别凭记忆）：topic:"auto-guide"（自动化指北 393KB，哪些效果要哪些模块的总表）、topic:"macro-compendium"（宏汇编 103KB）、topic:"midi-guide"（midi 入门）、topic:"cpr-universe"（CPR 宇宙指南）、topic:"data-dict"（数据字典）、topic:"monster-spec"（怪物规格）。**不确定有哪些文件就先 topic:"local" 列全索引**（70 个文件带路径）。
- 坑书与专项 → topic:"pitfalls"（坑书总集）/ topic:"methodology"（方法论）/ topic:"creature-guide"（搓怪物模板）/ topic:"item-macro"（物品宏指南）/ topic:"aura"（光环）/ topic:"iron-rules"（开工铁律）/ topic:"traps" / topic:"forced-move" / topic:"world-sync" / topic:"code-review" / topic:"release-check" / topic:"overtime" 等。这些属资料库主题：本机有更新版会优先用本机，没有则用内置副本，**动手前先看这个坑有没有踩过**。
- **dnd5e 5.3.3 文档内所有 _id 必须恰好 16 位字母数字**（如 "dnd5eactivity000"、"bleedOT000000001"）；超 16 位（如 "poisonOT000000001" 17 位）会被系统拒绝创建，报 "Failed to create entity"。activity 引用（otherActivityId/otherActivityUuid）与 effects[]._id 指向的 id 也要遵守并保持一致。生成 id 时数清楚位数；插件会自动把超长 _id 规范成合法 16 位（同值引用同步替换）。
2. 世界包有现成怪：foundry_search 搜（SRD 在 package:dnd5e.monsters，汉化包中英文都搜）→ foundry_import_entity → foundry_place_token，禁止新建替代导入。
3. 写操作落库后按工具说明回读验证；工具返回 isError 时先看 note/verified 字段判定是否模块回读误报，再决定重试。
4. 拿不准的键名/参数/路径：先查，查不到就明说不知道并问用户，禁止臆造。
5. 多世界路由：所有工具自动作用于「当前唯一在线」的世界（用户浏览器开着的那个）。动手前先 foundry_list_worlds 确认在线世界名；若报 "Multiple clients connected"，让用户关掉多余的世界页面再重试，不要瞎猜世界。
6. 环境类问题先读内置教程，别自己造轮子：
- 配对 / 装模块 / 连不上 relay / 请求超时 / 报 408 → **先 foundry_knowledge topic:"deploy"**（内置部署与排障手册：配对流程、Enter Code、408 自诊断、常见坑），按它做。
- 用户要配对码 → 直接调 foundry_mint_pairing_code，不要读教程文件、不要写 PowerShell 脚本（Windows 执行策略会拦，实测三次全失败）。
- 工具报「is not a function / 未注册」→ 插件没加载：让用户刷新 DSH（或 dev_reload_package dsh-foundry-vtt），不要绕路用 pwsh 直调 relay 代替工具。
- 排障顺序固定：foundry_list_worlds 看世界在线 → 不行读 topic:"deploy" → 仍不行再向用户要信息。禁止在 relay 的 Go 源码里逐文件找根因（实测会耗掉一小时）。
7. **公式与 DC 一律用 @ 动态引用，不要写死数字**：
- 写伤害/DC/加值/条件字段前 → 先 foundry_reference{topic:"roll-data"} 查合法落点（落点写错会被静默忽略，不报错、只是不生效）。
- 常用：@mod（行动属性调整值）｜@prof 或 @attributes.prof（熟练；@prof 在专精时自动加倍）｜@abilities.con.mod｜@attributes.spelldc（施法DC）｜@details.cr｜@classes.X.levels｜@scale.X.Y（比例值）。
- 落点：伤害公式 → foundry_create_item_minimal 的 damage.formula；DC → save.dc 直接传字符串（如 "8 + @prof + @abilities.dex.mod"）；OverTime 串内可写 saveDC=@attributes.spelldc。
- ⚠️ **save.dc.calculation 的官方枚举共 8 项**：""（用 formula 算）｜"spellcasting"（跟随施法 DC）｜str｜dex｜con｜int｜wis｜cha（用**持用者该属性的 DC**）。
  **"flat" 不在枚举里，别写** —— 但它是 truthy，源码会走「属性分支」：
  · F:\\FVTT\\data\\systems\\dnd5e\\dnd5e.mjs L24798 prepareFinalData：if ( this.save.dc.calculation ) ability = this.ability; else dc.value = simplifyBonus(formula);
  · L24743-24747 get ability()：不在 CONFIG.DND5E.abilities 里的值（如 flat）→ 回退 this.save.ability.first()
  ⇒ 写 "flat" 的真实后果 = **formula 被整段跳过，DC 变成持用者属性 DC**（和写 "con" 行为一样，但它依赖 save.ability 的排列顺序，不稳且 UI 里选不到）。
  ⇒ **两种设计意图各自的正规写法**：要「DC 随持用者变」→ 写 "con" / "dex"；要「固定 DC」→ 写 "" + formula:"16"。别混。
  ⚠️ 物品躺在世界目录（没有持有者）时 dc.value 读到的是兜底 **8** —— **那不是最终值，别据此判定 DC 坏了**（我曾据此误报过一次）。
  ⇒ 验证方法：挂到角色身上 → execute_js 读 a.save.dc.value，看是否等于你写的数字或该角色的属性 DC。
- 理由：写死 DC 的武器，角色一升级就是错的。
8. **做武器 / 法术 / 消耗品 / 特性时，动画与声音是标配，不用等用户提**：
- 建完物品立刻用 foundry_patch_item 写 flags.autoanimations（完整外壳与各字段见 foundry_reference{topic:"fx-anim"}）。
- ★★ sound 的 7 个字段：enable / file / volume / delay / startTime / repeat / repeatDelay —— **只写 {enable:false} 等于根本没配**。只配 video 不配 sound = 半成品（实测事故：武器动画配对了但没声音，用户得手动提醒）。
- 素材已装好三个包：psfx（音效，如 psfx.weapon-attacks.sword.v1、psfx.weapon-swooshes.necrotic=暗蚀）、blfx、jb2a（动画，如 jb2a.melee_attack.03.*）。sound.file 既可写数据库路径（psfx.xxx），也可写直接文件路径（modules/.../x.mp3）。
- 最省事的办法：抄现成条目 —— execute_js 读 game.settings.get("autoanimations","aaAutorec-melee")（120 条）/ "aaAutorec-range"（159 条），全都带完整 sound，改个名和路径就能用。
- 动画路径不许猜：用 execute_js 调 Sequencer.Database.entryExists("jb2a.xxx") 验证（**返回路径串 = 存在，返回 undefined = 不存在**），或用 foundry_file_system 浏览目录。路径猜错 = 卡面裂图 + 不播。
9. **建角色 / 怪物卡时，token 的显示名称一律设成「拥有者悬停时显示」**：
- 字段 = prototypeToken.displayName，值是**数字**（枚举来自 foundry.CONST.TOKEN_DISPLAY_MODES；⚠️ v13 的 CONFIG.Token.displayModes **已不存在**，读它得 undefined、localize 出 n/a）：
  · 0 = NONE 从不显示　· 10 = CONTROL 仅控制者可见　· **20 = OWNER_HOVER 拥有者悬停时**　· 30 = HOVER 悬停时　· 40 = OWNER 仅拥有者　· 50 = ALWAYS 始终显示
- **默认给 20**：玩家不该一眼看到全场 token 的名字。NPC / 怪物 / 角色卡都按这个建 —— 建卡时设的是**原型**，以后放到地图上的 token 都自动继承。
- foundry_create_creature **已自动写入 displayName:20**（无需你操心）；但**用 foundry_create_entity 手搓 Actor JSON 时必须自己写上 prototypeToken.displayName:20**，漏了就是 0 = 从不显示，玩家看不到名字。
- 已有实体要补：foundry_update_entity{uuid, data:{prototypeToken:{displayName:20}}}。
- ⚠️ 改 prototypeToken **不影响已放上地图的 token**（那是独立文档）—— 要改已放置的用 foundry_canvas_update{documentType:"tokens", data:{displayName:20}}。
10. **给怪物 / 角色配 token 视野：visionMode 一律写 basic，别写 darkvision**：
- 字段：prototypeToken.sight{enabled, range, angle, visionMode, ...} + prototypeToken.detectionModes[]。
- ★ **visionMode 恒为 "basic"** —— 用 darkvision 渲染模式会让**屏幕变成一片黑白**（用户亲验，观感极差）。
  D&D 的「黑暗视觉 60 尺」是由 system.attributes.senses.ranges.darkvision（卡面数值）+ detectionModes 里的 basicSight（实际探测）二者表达的，**与渲染模式无关**，别拿 visionMode 去表达感官。
- detectionModes 映射：黑暗视觉→basicSight ｜ 真视→seeAll ｜ 盲视→blindsight ｜ 颤动感知→feelTremor；**必含 lightPerception**（看得见被照亮处）。sight.range 取所有感官里的最大距离。
- ⚠️ 只填 system.attributes.senses.ranges.* 而不配 token 视野 = **token 全瞎**（玩家操控这只怪时眼前一片黑）。
11. **物品 / 怪物的描述里必须用富文本 enricher，不要只写死文字**：
- 写在 system.description.value 里，卡面会渲染成**可点击的名字与掷骰按钮**。官方怪物与物品的描述全是这么写的，不写就是死文字。
- 引用名字：@UUID[Compendium.dnd5e.items.Item.xxxxx]{显示的名字}（点击在侧栏打开；玩家需 Observe 以上权限）；&Reference[prone]（dnd5e 规则引用，自动识别名字、带 tooltip）。
- 掷骰按钮：[[/attack +8]] ｜ [[/save dex 14]] ｜ [[/check dex 12]] ｜ [[/damage 2d6 fire]] ｜ [[/heal 1d8]] ｜ [[/item xxx]] ｜ [[/skill prc]] ｜ [[/tool thief]] ｜ [[/concentration]] ｜ [[/award 100 xp]]
  可加显示标签：[[/save dex 14]]{敏捷豁免}；核心通用掷骰：[[/r 3d6]]。
- 最正规的「绑活动」按钮（dnd5e 官方写法，点了走该活动完整流程）：<a class="roll-action" data-type="attack" data-formula="+8" data-activity-uuid="活动uuid">+8 攻击</a>
- ⚠️ **写错不会报错** —— 不匹配 enricher 正则的内容会原样显示成纯文本，FVTT 不会提示你写错了。
- 完整语法表见 foundry_reference{topic:"item-fields"}，或 foundry_knowledge{topic:"local", file:"FVTT-monster-spec-v2_1.md"} 的 §12.3。`;
import { summarizeDoc } from './summarize.js';
import { registerReferenceTools } from './reference.js';
import { registerKnowledgeTools, DEFAULT_KNOWLEDGE_DIR, DEFAULT_SAMPLE_DIR } from './knowledge.js';
import { registerMinimalTools } from './minimal.js';
/** dnd5e 文档 _id 铁律：恰好 16 位字母数字。超长/非法 id 会被 5.3.3 拒绝创建。 */
const ID_RE = /^[A-Za-z0-9]{16}$/;
/** 加密级纯随机 16 位（crypto.randomBytes → hex，均匀分布，Node 内置零依赖）。 */
function randomId16() {
    return randomBytes(8).toString('hex');
}
/**
 * 根治版文档 id 规范化：不管 AI 写什么，落库必为合法 16 位加密级随机。
 * ① 所有 _id 字段值：非法（非字符串/超长/带特殊字符/长度不对）→ 换随机 16 位；
 * ② activities 的键名（键名本身就是 id，是 otherActivityId 的引用锚点）：非法键 → 换随机并同步引用；
 * ③ 缺失 _id：effects 数组元素补随机、activities 活动对象补键名；
 * ④ 同旧值引用（otherActivityId / effects[]._id 指向物品级效果等）同步替换，引用不断链。
 */
/**
 * 'Folder.xxx' → 'xxx'（MidiActor 的 folder 字段只收纯 16 位字母数字 ID，带前缀实测报
 * DataModelValidationError: folder: must be a valid 16-character alphanumeric ID）。
 */
function stripFolderPrefix(v) {
    if (typeof v === 'string' && /^Folder\.([A-Za-z0-9]{16})$/.test(v))
        return v.slice(7);
    return v;
}
function normalizeDocIds(doc) {
    const map = new Map();
    const fresh = () => {
        let s = randomId16();
        while (map.has(s))
            s = randomId16();
        return s;
    };
    const collect = (v) => {
        if (Array.isArray(v)) {
            for (const x of v)
                collect(x);
            return;
        }
        if (v && typeof v === 'object') {
            const o = v;
            // ① _id 字段：非 16 位字母数字的字符串，或压根不是字符串
            if (o._id !== undefined && !(typeof o._id === 'string' && ID_RE.test(o._id)) && !map.has(String(o._id))) {
                map.set(String(o._id), fresh());
            }
            // ② activities 键名（键名即 id）
            const acts = o.activities;
            if (acts && typeof acts === 'object' && !Array.isArray(acts)) {
                for (const k of Object.keys(acts)) {
                    if (!ID_RE.test(k) && !map.has(k))
                        map.set(k, fresh());
                }
            }
            for (const k of Object.keys(o))
                collect(o[k]);
        }
    };
    collect(doc);
    const rewrite = (v) => {
        if (typeof v === 'string')
            return map.get(v) ?? v;
        if (Array.isArray(v))
            return v.map(rewrite);
        if (v && typeof v === 'object') {
            const src = v;
            const o = {};
            for (const k of Object.keys(src)) {
                o[map.get(k) ?? k] = rewrite(src[k]);
            }
            // _id 字段特判（放循环后，避免被循环覆盖）：非字符串或非法字符串 → 换映射值或现生成
            if (src._id !== undefined && !(typeof src._id === 'string' && ID_RE.test(src._id))) {
                o._id = map.get(String(src._id)) ?? fresh();
            }
            // folder 字段特判：剥 'Folder.' 前缀（MidiActor 只收纯 16 位 ID）
            if (typeof src.folder === 'string' && /^Folder\./.test(src.folder)) {
                o.folder = src.folder.replace(/^Folder\./, '');
            }
            // ③ 缺失补齐：effects 数组元素缺 _id → 补随机
            if (Array.isArray(o.effects)) {
                for (const e of o.effects) {
                    if (e && typeof e === 'object' && e._id === undefined) {
                        ;
                        e._id = fresh();
                    }
                }
            }
            // activities：活动对象 _id 无条件同步为键名（键名才是引用锚点，两者必须一致）
            const acts = o.activities;
            if (acts && typeof acts === 'object' && !Array.isArray(acts)) {
                for (const [k, av] of Object.entries(acts)) {
                    if (av && typeof av === 'object') {
                        ;
                        av._id = k;
                    }
                }
            }
            return o;
        }
        return v;
    };
    const rewritten = rewrite(doc);
    return { doc: rewritten, renamed: [...map.keys()] };
}
const name = '@dsh-external/dsh-foundry-vtt';
const inject = ['tools'];
/** 配置目录与文件（~/.dsh 下，与 DSH 用户数据同域，重装 DSH 不丢）。 */
const CONFIG_DIR = join(homedir(), '.dsh', 'dsh-foundry-vtt');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
async function getCfg() {
    let fileCfg = {};
    try {
        const raw = (await fs.readFile(CONFIG_FILE, 'utf8')).replace(/^\uFEFF/, '');
        fileCfg = JSON.parse(raw);
    }
    catch {
        // 无文件/损坏：走 env + 默认。
    }
    return {
        relayUrl: fileCfg.relayUrl || process.env.FOUNDRY_RELAY_URL || 'http://localhost:3010',
        apiKey: fileCfg.apiKey || process.env.FOUNDRY_API_KEY || '',
        clientId: fileCfg.clientId || process.env.FOUNDRY_CLIENT_ID || '',
        knowledgeDir: fileCfg.knowledgeDir || process.env.FOUNDRY_KNOWLEDGE_DIR || DEFAULT_KNOWLEDGE_DIR,
        relayExePath: fileCfg.relayExePath || process.env.FOUNDRY_RELAY_EXE || '',
        relayDataDir: fileCfg.relayDataDir || '',
        relayAdminEmail: fileCfg.relayAdminEmail || '',
        relayAdminPassword: fileCfg.relayAdminPassword || '',
        relayHealthUrl: fileCfg.relayHealthUrl || process.env.FOUNDRY_RELAY_HEALTH_URL || '',
    };
}
// ── 工具 JSON 文本渲染 + 原始 ToolDefinition 构造 ──────────────
function jsonRender(_args, value) {
    return [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }];
}
/**
 * 递归剔除 undefined / function / symbol。
 *
 * 为什么必须有：DSH 校验工具输出必须是 **lossless JSON**，`{a: undefined}` 经 JSON 序列化会丢键，
 * 于是整条工具结果被判 `returned invalid output: value is not lossless JSON` ——
 * **AI 拿不到任何返回值**（连 uuid 都看不见），等于这个工具在 harness 里完全瞎做。
 * 实测：create_item_minimal 的 verify 对象里有 12 个可选字段为 undefined（armor/uses/capacity/
 * damageBase/attack/attackOtherActivityId/saveDc/saveActivityEffectId/itemEffectId/effectDuration/
 * activityType…），导致该工具 30/30 次返回失败。
 * 放在 makeTool 出口统一处理 → 91 个工具全部受益，不必逐个手改。
 */
function pruneUndefined(v) {
    if (Array.isArray(v))
        return v.map((x) => pruneUndefined(x));
    // ⚠️ Set / Map / Date 必须先于普通对象分支处理：它们 typeof 也是 'object'，
    // 走 Object.entries 会得到 []（Set/Map 的条目不在自有可枚举属性上；Date 同理），
    // 于是被静默转成 `{}` —— 不是报错，是「成功但内容没了」，
    // 与 undefined 同类但更隐蔽（第三方实测报告：Set 传下去就崩）。
    if (v instanceof Set)
        return Array.from(v).map((x) => pruneUndefined(x));
    if (v instanceof Map)
        return pruneUndefined(Object.fromEntries(v));
    if (v instanceof Date)
        return v;
    if (v && typeof v === 'object') {
        const out = {};
        for (const [k, x] of Object.entries(v)) {
            if (x === undefined)
                continue;
            // function / symbol 同样不是 lossless JSON（序列化后整个键消失）
            if (typeof x === 'function' || typeof x === 'symbol')
                continue;
            out[k] = pruneUndefined(x);
        }
        return out;
    }
    if (typeof v === 'function' || typeof v === 'symbol')
        return undefined;
    return v;
}
/** 按点号路径取值，支持数组下标：`system.activities.x.save.dc.formula`、`a.b[0].c`。 */
function readPathLoose(root, path) {
    const segs = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter((s) => s !== '');
    let cur = root;
    for (const s of segs) {
        if (cur === null || cur === undefined)
            return undefined;
        cur = cur[s];
    }
    return cur;
}
/**
 * 宽松相等：dnd5e 会把很多值规范化（'' ↔ null、0 ↔ '0'、数字 ↔ 字符串），
 * 严格比较会把「其实已经落库了」误报成不一致 —— 那正是这个工具要消灭的假信号。
 */
function eqLoose(a, b) {
    if (a === b)
        return true;
    const empty = (x) => x === undefined || x === null || x === '';
    if (empty(a) && empty(b))
        return true;
    if (empty(a) || empty(b))
        return false;
    if (typeof a === 'object' || typeof b === 'object')
        return JSON.stringify(a) === JSON.stringify(b);
    return String(a) === String(b);
}
function makeTool(toolName, description, properties, required, execute) {
    return {
        name: toolName,
        description,
        parameters: { type: 'object', properties, required, additionalProperties: true },
        output: { schema: { type: 'object', additionalProperties: true }, render: jsonRender },
        async execute(args) {
            return pruneUndefined(await execute(args));
        },
    };
}
// ── relay HTTP 客户端（零依赖，node 内置 fetch）──────────────
class HttpError extends Error {
    status;
    raw;
    constructor(message, status = 0, raw) {
        super(message);
        this.status = status;
        this.raw = raw;
        this.name = 'HttpError';
    }
}
/** 解包 relay 的 {type,requestId,...payload} 信封（与 mcp-server envelope.ts 一致）。 */
function unwrapEnvelope(raw) {
    if (raw == null || typeof raw !== 'object')
        return raw;
    const obj = raw;
    if (!('type' in obj) && !('requestId' in obj))
        return obj;
    const { type: _t, requestId: _r, ...rest } = obj;
    for (const key of ['data', 'results']) {
        if (key in rest)
            return rest[key];
    }
    const keys = Object.keys(rest);
    if (keys.length === 1)
        return rest[keys[0]];
    return rest;
}
/** DSH 校验工具输出必须是 object：relay 返回裸数组的端点统一包成 {results,total}。 */
function asObject(v) {
    if (Array.isArray(v))
        return { results: v, total: v.length };
    if (v == null || typeof v !== 'object')
        return { value: v };
    return v;
}
async function callRelay(method, path, opts = {}) {
    const { query = {}, body, rawEnvelope = false } = opts;
    const cfg = await getCfg();
    if (!cfg.apiKey) {
        throw new HttpError('FVTT 插件未配置 apiKey。请设 FOUNDRY_API_KEY 环境变量，或写 ' + CONFIG_FILE + '（{"apiKey":"..."}）。');
    }
    const url = new URL(path, cfg.relayUrl);
    if (cfg.clientId)
        url.searchParams.set('clientId', cfg.clientId);
    for (const [k, v] of Object.entries(query)) {
        if (v === undefined)
            continue;
        if (Array.isArray(v)) {
            // relay 端数组 query（如 details=["resources"]）按 JSON 数组解析
            url.searchParams.set(k, JSON.stringify(v));
        }
        else if (v !== null && typeof v === 'object') {
            url.searchParams.set(k, JSON.stringify(v));
        }
        else {
            url.searchParams.set(k, String(v));
        }
    }
    const headers = { 'x-api-key': cfg.apiKey };
    if (body !== undefined)
        headers['Content-Type'] = 'application/json';
    let res;
    try {
        res = await fetch(url.toString(), {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(30_000),
        });
    }
    catch (e) {
        if (e instanceof Error && e.name === 'TimeoutError') {
            throw new HttpError('relay 请求超时（30 秒）。' + (await diagnoseRelayStall(cfg)), 0, e);
        }
        throw new HttpError('无法连接 relay：' + (e instanceof Error ? e.message : String(e)) +
            '。请确认 relay 已启动（浏览器打开 ' + cfg.relayUrl.replace(/\/$/, '') + '/api/health 应返回 ok）且 FVTT 世界页面开着。', 0, e);
    }
    const ct = res.headers.get('content-type') ?? '';
    const responseBody = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
        // 408 = relay 收到了请求但模块没回；自诊断给结论，别让 AI 去读 relay 源码找根因。
        const extra = res.status === 408 ? ' ' + (await diagnoseRelayStall(cfg)) : '';
        throw new HttpError('relay 返回 HTTP ' + res.status + '：' + JSON.stringify(responseBody) + extra, res.status, responseBody);
    }
    if (responseBody != null &&
        typeof responseBody === 'object' &&
        'success' in responseBody &&
        responseBody.success === false) {
        throw new HttpError('relay 返回 success:false：' + JSON.stringify(responseBody), 200, responseBody);
    }
    return rawEnvelope ? responseBody : unwrapEnvelope(responseBody);
}
/**
 * 408 / 超时自诊断：relay 仍登记客户端（世界「显示在线」）但数据请求全部超时
 * = relay ↔ FVTT 模块的 WebSocket 通道僵死，重启 relay 即可恢复（实测有效）。
 * 目的：让 AI 一次拿到结论 + 处理办法，而不是去读 relay 的 Go 源码找根因
 * （朋友那台实测为此绕了近一小时）。
 */
async function diagnoseRelayStall(cfg) {
    const base = cfg.relayUrl.replace(/\/$/, '');
    const out = [];
    try {
        const r = await fetch(base + '/clients', {
            headers: { 'x-api-key': cfg.apiKey },
            signal: AbortSignal.timeout(6000),
        });
        if (r.ok) {
            const j = (await r.json());
            const c = (j.clients ?? [])[0];
            if (c) {
                const seen = Number(c.lastSeen ?? 0);
                const age = seen > 0 ? Math.round((Date.now() - seen) / 1000) : -1;
                out.push('【自诊断】relay 侧仍登记着客户端 world=' + String(c.worldId ?? '?') +
                    (age >= 0 ? '（最后心跳 ' + age + ' 秒前）' : '') +
                    '，但数据请求全部超时 → 这是 relay↔模块的 WebSocket 通道僵死，不是「世界没开」。');
            }
            else {
                out.push('【自诊断】relay 侧没有任何客户端登记 → 世界页面没连上（确认 FVTT 页面开着、模块已配对、模块里 Relay URL 是 ws:// 开头）。');
            }
        }
        else {
            out.push('【自诊断】/clients 返回 HTTP ' + r.status + ' → relay 自身异常。');
        }
    }
    catch {
        out.push('【自诊断】连 /clients 都失败 → relay 进程可能已死。');
    }
    out.push('【处理，实测有效】重启 relay：结束 relay.exe 进程后重开（DSH 启动时插件会自动拉起；也可双击 relay 目录的 start-relay.bat），然后在 FVTT 页面按 F5 刷新一次，再重试原操作。');
    return out.join(' ');
}
/**
 * 用 config 里的 relay 管理员账号走完整配对流程，产出 6 位配对码。
 * 让新对话的 AI 不必去磁盘找教程、更不必自己造 PowerShell 脚本
 * （朋友那台就这么撞上「running scripts is disabled on this system」，三次失败）。
 * 流程字段全部取自 relay 源码 auth.go / pair_request.go（已查证）：
 *   POST /auth/login {email,password} → {sessionToken}
 *   POST /auth/pair-request {worldId(必填),worldTitle,systemId,...} → {code,pairUrl}
 *   POST /auth/pair-request/{code}/approve（Bearer session）{remoteScopes,allowedTargetClients,remoteRequestsPerHour} → {success:true}
 *   GET  /auth/pair-request/{code}/status → {status,pairingCode}
 */
async function mintPairingCode(worldId, worldTitle, systemId) {
    const cfg = await getCfg();
    const base = cfg.relayUrl.replace(/\/$/, '');
    if (!cfg.relayAdminEmail || !cfg.relayAdminPassword) {
        throw new HttpError('未配置 relay 管理员账号，无法自动出码。请在 ' + CONFIG_FILE +
            ' 补 "relayAdminEmail" 与 "relayAdminPassword"（须与 relay 启动时的 ADMIN_EMAIL / ADMIN_PASSWORD 一致）。');
    }
    const call = async (path, init = {}) => {
        let res;
        try {
            res = await fetch(base + path, {
                ...init,
                headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
                signal: AbortSignal.timeout(15_000),
            });
        }
        catch (e) {
            throw new HttpError('配对流程连 relay 失败（' + path + '）：' + (e instanceof Error ? e.message : String(e)), 0, e);
        }
        const text = await res.text();
        let body = text;
        try {
            body = JSON.parse(text);
        }
        catch { /* 非 JSON 响应保留原文 */ }
        if (!res.ok) {
            throw new HttpError('配对流程 ' + path + ' 返回 HTTP ' + res.status + '：' + text.slice(0, 300), res.status, body);
        }
        return (body ?? {});
    };
    const login = await call('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cfg.relayAdminEmail, password: cfg.relayAdminPassword }),
    });
    const token = String(login.sessionToken ?? '');
    if (!token) {
        throw new HttpError('relay 登录未返回 sessionToken（检查 relayAdminEmail / relayAdminPassword 是否与 relay 启动参数一致）：' + JSON.stringify(login).slice(0, 200));
    }
    const auth = { Authorization: 'Bearer ' + token };
    const pr = await call('/auth/pair-request', {
        method: 'POST',
        body: JSON.stringify({ worldId, worldTitle, systemId, serverFingerprint: 'dsh-foundry-vtt' }),
    });
    const code = String(pr.code ?? '');
    if (!code)
        throw new HttpError('未拿到配对请求 code：' + JSON.stringify(pr).slice(0, 200));
    await call('/auth/pair-request/' + encodeURIComponent(code) + '/approve', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ remoteScopes: ['*'], allowedTargetClients: [], remoteRequestsPerHour: 10000 }),
    });
    const st = await call('/auth/pair-request/' + encodeURIComponent(code) + '/status');
    const pairingCode = String(st.pairingCode ?? '');
    if (!pairingCode) {
        throw new HttpError('已批准但未返回 6 位配对码（status=' + String(st.status ?? '?') + '）：' + JSON.stringify(st).slice(0, 200));
    }
    return {
        pairingCode,
        requestCode: code,
        pairUrl: String(pr.pairUrl ?? base + '/pair/' + code),
        status: String(st.status ?? 'approved'),
        instruction: '把 ' + pairingCode + ' 给用户，让他在 FVTT 模块设置 → REST API Connection → Manage Connection 里点「Enter Code」输入（5 分钟内有效）。' +
            '前提：模块里 Relay URL 已填 ws://localhost:3010 这类 ws:// 地址、模块已启用、FVTT 页面开着。',
    };
}
/** 提取 args 里的 clientId/userId 覆盖进 query。 */
function targetingQuery(args) {
    const q = {};
    if (args.clientId)
        q.clientId = String(args.clientId);
    if (args.userId)
        q.userId = String(args.userId);
    return q;
}
function missing(msg) {
    throw new HttpError(msg);
}
// ── dnd5e NPC 文档构建器（照搬 mcp-server npc-schema.ts，零依赖）────
/** 解析 '1d6 + 1' / '2d8' 这类骰子公式 → {number,denomination}；解析不了返回 null。 */
function parseDice(formula) {
    const m = /^\s*(\d+)\s*[dD]\s*(\d+)/.exec(String(formula ?? ''));
    if (!m)
        return null;
    return { number: Number(m[1]), denomination: Number(m[2]) };
}
function abilityBlock(v) {
    return { value: v };
}
function randomId() {
    return Math.random().toString(36).slice(2, 18).padEnd(16, '0');
}
function makeWeaponItem(attack) {
    const activityId = randomId();
    const isRanged = attack.range !== undefined;
    // dnd5e 5.3.3 正确模型（对照世界包导出的 SRD 僵尸实测）：
    // 伤害骰放 item.system.damage.base{number,denomination,bonus,types}，
    // activity.damage.parts 留空数组 + includeBase:true（附加骰才进 parts）。
    // 旧版写法 parts:[{formula}] 的顶层 formula 会被 5.3.3 落库清洗丢弃 → 伤害为空。
    const dmg = (Array.isArray(attack.damage) ? attack.damage[0] : undefined);
    const dice = parseDice(String(dmg?.formula ?? ''));
    const dmgTypes = dmg?.type ? [dmg.type] : [];
    const ability = attack.abilityMod ?? (isRanged ? 'dex' : 'str');
    return {
        name: attack.name,
        type: 'weapon',
        system: {
            description: { value: attack.description ?? '' },
            quantity: 1,
            equipped: true,
            proficient: 1,
            type: { value: 'natural', baseItem: '' },
            range: { value: attack.range ?? null, long: null, units: 'ft' },
            damage: {
                base: {
                    number: dice?.number ?? null,
                    denomination: dice?.denomination ?? null,
                    bonus: '',
                    types: dmgTypes,
                    custom: { enabled: false, formula: '' },
                    scaling: { mode: '', number: null, formula: '' },
                },
                versatile: {
                    number: null,
                    denomination: null,
                    bonus: '',
                    types: [],
                    custom: { enabled: false, formula: '' },
                    scaling: { mode: '', number: null, formula: '' },
                },
            },
            activities: {
                [activityId]: {
                    type: 'attack',
                    activation: { type: 'action', value: 1, condition: '', override: false },
                    duration: { units: 'inst', special: '', concentration: false, override: false },
                    target: { affects: { type: 'creature', count: '', choice: false, special: '' }, template: {}, prompt: true, override: false },
                    range: { value: String(attack.range ?? attack.reach ?? 5), units: 'ft', special: '', override: false },
                    uses: { max: '', recovery: [], spent: 0 },
                    damage: { critical: { bonus: '' }, includeBase: true, parts: [] },
                    attack: {
                        ability,
                        bonus: attack.toHit !== undefined ? String(attack.toHit) : '',
                        critical: { threshold: null },
                        flat: attack.toHit !== undefined,
                        type: { value: isRanged ? 'ranged' : 'melee', classification: 'weapon' },
                    },
                    effects: [],
                    sort: 0,
                    img: null,
                },
            },
        },
    };
}
function makeFeatureItem(feature) {
    return {
        name: feature.name,
        type: 'feat',
        system: {
            description: { value: `<p>${feature.description}</p>` },
            type: { value: 'monster', subtype: '' },
            activation: { type: '', cost: null, condition: '' },
        },
    };
}
function buildNpcDocument(input) {
    const abilities = {};
    const ab = (input.abilities ?? {});
    for (const k of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
        if (ab[k] !== undefined)
            abilities[k] = abilityBlock(ab[k]);
    }
    const speeds = (input.speeds ?? { walk: 30 });
    const movement = { walk: speeds.walk ?? 30, units: speeds.units ?? 'ft' };
    if (speeds.fly)
        movement.fly = speeds.fly;
    if (speeds.swim)
        movement.swim = speeds.swim;
    if (speeds.climb)
        movement.climb = speeds.climb;
    if (speeds.burrow)
        movement.burrow = speeds.burrow;
    const senses = { units: input.senses?.units ?? 'ft' };
    const se = (input.senses ?? {});
    if (se.darkvision)
        senses.darkvision = se.darkvision;
    if (se.blindsight)
        senses.blindsight = se.blindsight;
    if (se.tremorsense)
        senses.tremorsense = se.tremorsense;
    if (se.truesight)
        senses.truesight = se.truesight;
    const hp = (input.hp ?? { value: 1, max: 1 });
    const items = [];
    for (const atk of (input.attacks ?? []))
        items.push(makeWeaponItem(atk));
    for (const feat of (input.features ?? []))
        items.push(makeFeatureItem(feat));
    const doc = {
        name: input.name,
        type: 'npc',
        system: {
            abilities,
            attributes: {
                ac: { flat: input.ac, calc: 'natural' },
                hp: { value: hp.value, max: hp.max, formula: hp.formula ?? '' },
                movement,
                senses,
            },
            details: {
                cr: input.cr,
                type: { value: input.type, subtype: '' },
                alignment: input.alignment ?? 'Unaligned',
                biography: { value: input.biography ? `<p>${input.biography}</p>` : '' },
            },
            traits: {
                size: input.size,
                languages: { value: input.languages ?? [], custom: '' },
                dr: { value: [], custom: '' },
                di: { value: [], custom: '' },
                dv: { value: [], custom: '' },
                ci: { value: [], custom: '' },
            },
        },
        items,
        prototypeToken: { name: input.name, actorLink: false, disposition: -1, displayName: 20 },
    };
    if (input.folder)
        doc.folder = input.folder;
    return doc;
}
/** relay 守护：DSH 启动时检查 relay 健康，没跑就静默拉起（隐藏窗口，detached 不随 DSH 退出）。
 *  直接 spawn relay.exe + 环境变量，不经 .ps1 脚本——Windows PowerShell 5.1 按 GBK 读无 BOM 的 UTF-8 脚本，
 *  中文路径会乱码（实测：Set-Location 找不到路径），绕过脚本才是根治。 */
async function ensureRelay() {
    let cfg;
    try {
        cfg = await getCfg();
    }
    catch {
        return;
    }
    const exe = cfg.relayExePath;
    if (!exe)
        return; // 未配置 relayExePath：不自动拉起（发布版默认，用户按需开启）
    const healthUrl = cfg.relayHealthUrl || cfg.relayUrl.replace(/\/$/, '') + '/api/health';
    const probe = async () => {
        try {
            const r = await fetch(healthUrl, { signal: AbortSignal.timeout(2500) });
            return r.ok;
        }
        catch {
            return false;
        }
    };
    if (await probe())
        return; // 已在跑
    const env = { ...process.env };
    env.DB_TYPE = 'sqlite';
    env.PORT = env.PORT || '3010';
    env.APP_ENV = 'production';
    env.LOG_LEVEL = env.LOG_LEVEL || 'info';
    env.PER_MINUTE_REQUEST_LIMIT = '0';
    env.KEY_REQUEST_RATE_LIMIT = env.KEY_REQUEST_RATE_LIMIT || '100000';
    env.PAIRING_RATE_LIMIT = env.PAIRING_RATE_LIMIT || '100000';
    env.FRONTEND_URL = env.FRONTEND_URL || 'http://localhost:3010';
    env.DATA_DIR = cfg.relayDataDir || join(dirname(exe), 'data');
    if (cfg.relayAdminEmail)
        env.ADMIN_EMAIL = cfg.relayAdminEmail;
    if (cfg.relayAdminPassword)
        env.ADMIN_PASSWORD = cfg.relayAdminPassword;
    try {
        const child = spawn(exe, [], {
            cwd: dirname(exe),
            env,
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
        });
        child.unref();
    }
    catch {
        return; // 拉起失败不阻塞 DSH 启动
    }
    for (let i = 0; i < 16; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        if (await probe()) {
            console.log('[dsh-foundry-vtt] relay 已自动启动:', healthUrl);
            return;
        }
    }
    console.warn('[dsh-foundry-vtt] relay 已拉起但 16s 内未就绪:', exe);
}
export function apply(ctx) {
    const tools = ctx.tools;
    if (!tools)
        return;
    // -1. relay 守护：开 DSH 自动确保桥在跑（异步，不阻塞启动）。
    void ensureRelay();
    const REG = (t) => tools.register(t);
    // 0. 工作铁律：注入系统提示段落（每个新对话的 AI 自动看到），强制「先查模板/样本再写」。
    try {
        if (ctx.systemPrompt?.section) {
            const dispose = ctx.systemPrompt.section({ name: 'dsh-foundry-vtt:workflow', order: 150, text: WORKFLOW_PROMPT });
            ctx.effect?.(() => dispose);
            // 文案风格段（order 160，紧随铁律之后）：来源 = 用户提示词库 05_扮演技巧.md §14/§23 + 04_战斗描述.md
            const dispose2 = ctx.systemPrompt.section({ name: 'dsh-foundry-vtt:desc-style', order: 160, text: DESC_STYLE_PROMPT });
            ctx.effect?.(() => dispose2);
        }
    }
    catch { /* 旧环境无 systemPrompt service 时静默降级 */ }
    // 0.5 foundry_mint_pairing_code —— 一键出 6 位配对码（新世界 / 重装后配对用）。
    REG(makeTool('foundry_mint_pairing_code', '一键生成 6 位配对码：用 config.json 里的 relay 管理员账号自动走完 relay 配对流程，返回配对码 + 给用户看的操作指引。**用户说「给我配对码」「新世界要重新配对」「模块装好了要配对」时直接调这个工具**；不要去磁盘上翻教程文件，更不要自己写 PowerShell 脚本去实现（会被 Windows 执行策略拦，实测三次全失败）。前提：config.json 里已配 relayAdminEmail / relayAdminPassword。', {
        worldId: { type: 'string', description: '世界 id（=世界文件夹名；可先随便填，模块交换时会带真实值）。缺省 unknown。' },
        worldTitle: { type: 'string', description: '世界标题（仅记录用，可省略）。' },
        systemId: { type: 'string', description: '游戏系统 id；dnd5e 世界填 "dnd5e"。缺省 dnd5e。' },
    }, [], async (args) => mintPairingCode(String(args.worldId ?? 'unknown'), String(args.worldTitle ?? ''), String(args.systemId ?? 'dnd5e'))));
    // 1. foundry_list_worlds —— 列出连接 relay 的世界/客户端，含在线状态、系统、版本。
    REG(makeTool('foundry_list_worlds', '列出连接 relay 的所有 Foundry 世界/客户端（含在线状态、系统、版本）。第一步确认哪个世界在线、dnd5e 版本。**online=true 的世界会被所有工具自动路由（插件不传 clientId，relay 自动选唯一在线世界）**；若有多个世界同时在线，relay 会报 "Multiple clients connected"，此时请让用户关掉多余的世界页面（一次只开一个世界页），或用户说清要操作哪个世界后再重试。', {}, [], async () => {
        const data = (await callRelay('GET', '/clients', { rawEnvelope: true }));
        const clients = (data.clients ?? []).map((c) => {
            const x = c;
            return {
                clientId: x.clientId,
                worldId: x.worldId,
                worldTitle: x.worldTitle,
                systemId: x.systemId,
                systemVersion: x.systemVersion,
                foundryVersion: x.foundryVersion,
                online: x.connectedSince != null && String(x.connectedSince) !== '' && Number(x.connectedSince) > 0,
            };
        });
        return { clients, total: data.total ?? clients.length };
    }));
    // 2. foundry_search —— 按名称搜实体，返回 uuid/documentType/subType/package。
    REG(makeTool('foundry_search', '按名称搜索 Foundry 实体（GET /search），返回 uuid、documentType、subType、package、resultType。这是把名字转成 uuid 的主要途径，供其他工具用。filter 形如 "Actor" 或 "documentType:Item,subType:weapon"。⚠️ 实测要点（别踩）①resultType 只有 "CompendiumEntity" 一个有效取值，传 Actor/Item/WorldEntity 都返回 0 条——按文档类型筛选用 documentType（Actor/Item/Scene/JournalEntry/RollTable/Macro…）；②**世界内实体同样搜得到**（uuid 形如 Scene.xxx / Actor.xxx，package 为 null），并非只索引 compendium，场景可直接在这里搜，只有已知场景 id 时才用 foundry_get_scene；③relay 原始响应里**没有 total 字段**，本工具已本地补上 total/count。重要工作流：①SRD 标准怪在 package:dnd5e.monsters（如标准 Zombie），中文汉化怪多在 5e-monster-book/5e-dlc-monster/yihusishe 等包，中英文都搜、必要时换 package 过滤重搜；②用户要把世界包里的怪放地图时：foundry_search 找到现成怪 uuid → foundry_import_entity 导入世界 → foundry_place_token 放到地图，禁止自己新建怪物（新建会丢汉化/数值/特性）。③要改怪数值/加自动化时才 foundry_get_entity 读它的完整 JSON 照抄结构再改——不要从零手搓 dnd5e 文档。', {
        query: { type: 'string', description: '搜索词，如 goblin / longsword' },
        filter: { type: 'string', description: '过滤，如 "Actor" 或 "documentType:Item,subType:weapon" 或 "package:dnd5e.monsters"。合法键：documentType / subType / folder / package / resultType（resultType 实测只有 "CompendiumEntity" 有效）。' },
        limit: { type: 'number', description: '最大结果数（默认 50，最大 500）' },
        minified: { type: 'boolean', description: '返回精简结果（uuid/id/name/img/documentType），默认 true' },
        excludeCompendiums: { type: 'boolean', description: '排除 compendium 结果' },
    }, ['query'], async (args) => {
        const q = {
            ...targetingQuery(args),
            query: args.query,
            limit: args.limit ?? 50,
            minified: args.minified ?? true,
        };
        if (args.filter)
            q.filter = args.filter;
        if (args.excludeCompendiums !== undefined)
            q.excludeCompendiums = args.excludeCompendiums;
        const raw = await callRelay('GET', '/search', { query: q });
        const obj = asObject(raw);
        // ⚠️ relay /search 的响应里**没有 total 字段**（实测顶层只有 type/requestId/query/results）。
        // 第三方实测报告里那条「package: 过滤器打空，total:0」，根因就是读了这个不存在的字段；
        // 实测 package:dnd5e.monsters 能正常返回结果。这里本地补上 total/count，省得 AI 再去猜。
        const results = Array.isArray(obj.results) ? obj.results : [];
        const out = { ...obj, total: results.length, count: results.length };
        // package 过滤返 0 时给出真实包名清单（2026-09-14 第三方复检抓的：package:dnd5e_classpack → 0 条）。
        // 过滤器本身是好的 —— 我直调 relay 实测：package:dnd5e.items→52 条、package:dnd5e.equipment24→8 条、
        // package:dnd5e.monsters→2 条，而真实包名是**三段**的 dnd5e_classpack.monsterspack（→2 条）。
        // 真正的问题是「包名写错就静默返 0」，调用方会误以为这个世界压根没有这个东西。所以补一条提示。
        if (results.length === 0 && typeof args.filter === 'string' && args.filter.indexOf('package:') >= 0) {
            try {
                const filterStr = args.filter;
                const q2 = { ...q };
                delete q2.filter;
                const dt = /documentType:([A-Za-z]+)/.exec(filterStr);
                if (dt)
                    q2.filter = 'documentType:' + dt[1];
                const obj2 = asObject(await callRelay('GET', '/search', { query: q2 }));
                const r2 = Array.isArray(obj2.results) ? obj2.results : [];
                const pkgs = Array.from(new Set(r2.map((x) => {
                    const parts = String(x.uuid ?? '').split('.');
                    return parts.length >= 4 ? parts.slice(1, -2).join('.') : '';
                }).filter(Boolean))).slice(0, 12);
                out.packageHint = '⚠️ 加了 package 过滤后 0 条。过滤器本身没坏（实测 package:dnd5e.items→52 条、dnd5e.equipment24→8、dnd5e.monsters→2），'
                    + '所以多半是**包名不完整**：compendium 包名可能是多段的 —— 例如真实包名是 dnd5e_classpack.monsterspack，只写 dnd5e_classpack 就是 0 条。'
                    + (pkgs.length
                        ? '去掉 package 后，关键词命中的结果分布在这些包里 → ' + pkgs.join(' / ') + '。照抄其中一个完整包名重试。'
                        : '去掉 package 过滤再搜一次看看。');
            }
            catch {
                /* 提示拿不到不影响主结果 */
            }
        }
        return out;
    }));
    // 2.5 foundry_diff —— 写完读回，跟「本来要写的」逐路径比对。
    // 存在理由（第三方实测报告最该修的第一条）：这个包的失败模式高度一致 ——
    // 不是报错，是「成功」。所以调用方对每次写入都条件反射读回，调用数直接翻倍。
    // 这里把「读回 + 比对」做成一次调用，并给出 want/got 对照。
    REG(makeTool('foundry_diff', '把「你本来要写的值」和「世界里的实际值」逐路径比对（读回 + 本地 diff）。任何写操作（foundry_create_item_minimal / foundry_update_entity / foundry_patch_item / foundry_add_effect）之后用它一次确认多个字段到底落库没有，省掉「自己 get_entity 再肉眼核对」那一轮。expected 传「点号路径 → 期望值」，路径与 update 的 data 同构、支持数组下标，例：{"system.rarity":"rare","system.damage.base.denomination":8,"system.activities.dnd5eactivity100.save.dc.formula":"13"}。mismatched 非空就是没落库或被系统改写，别当成成功交付。', {
        uuid: { type: 'string', description: '要核对的实体 uuid（支持内嵌物品 Actor.<actorId>.Item.<itemId>）' },
        expected: { type: 'object', description: '点号路径 → 期望值，如 {"system.rarity":"rare","system.attributes.hp.value":15}' },
    }, ['uuid', 'expected'], async (args) => {
        const uuid = String(args.uuid ?? '').trim();
        if (!uuid)
            return { error: 'uuid 必填' };
        const expected = args.expected;
        if (!expected || typeof expected !== 'object' || Array.isArray(expected) || Object.keys(expected).length === 0) {
            return { error: 'expected 必填，且至少给一个「路径: 期望值」，如 {"system.rarity":"rare"}' };
        }
        const raw = await callRelay('GET', '/get', { query: { ...targetingQuery(args), uuid } });
        const rec = raw;
        // ⚠️ /get 通常直接返回实体，但 /create 会包一层 {uuid, entity} —— 两种都兜住。
        const doc = (rec && typeof rec.entity === 'object' && rec.entity) ||
            (rec && typeof rec.data === 'object' && rec.data) ||
            rec;
        const matched = {};
        const mismatched = [];
        for (const [path, want] of Object.entries(expected)) {
            const got = readPathLoose(doc, path);
            if (eqLoose(got, want))
                matched[path] = got;
            else if (got === undefined) {
                // 2026-09-17 补：区分「键名写错（父级都不存在）」与「父级在、字段被清洗」——
                // 《鞘中惊雷》反馈 #2：以前只回「未落库（读回 undefined）」，调用方分不清是写法错还是系统不吃这个键。
                const parent = path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : '';
                const pv = parent ? readPathLoose(doc, parent) : doc;
                mismatched.push({
                    path,
                    want,
                    got,
                    reason: pv === undefined
                        ? '父级路径 ' + (parent || '(根)') + ' 在该文档上不存在 —— 键名写错了（这一层 dnd5e 的 schema 里没有）'
                        : '父级 ' + parent + ' 存在，但该字段被 dnd5e 清洗（schema 不接受这个键，或类型不符）',
                    parentExists: pv !== undefined,
                });
            }
            else {
                mismatched.push({ path, want, got, reason: '值不同（被 dnd5e 改写或规范化）' });
            }
        }
        const total = Object.keys(expected).length;
        return {
            uuid,
            total,
            matchedCount: total - mismatched.length,
            allMatched: mismatched.length === 0,
            matched,
            mismatched,
            hint: mismatched.length === 0
                ? '全部字段与期望一致。'
                : '看 mismatched 的 want/got：未落库多为键名不被 dnd5e 接受，值不同多为系统规范化或清洗。',
        };
    }));
    // 2.6 foundry_inspect —— 一次读回指定字段（+ 可选 labels）。
    // 存在理由（《鞘中惊雷》反馈 #6/#7）：没有「一次读回指定字段」的入口 ——
    // foundry_get_entity 的 summary 会把活动细节精简掉，要看精确字段只能 execute_js 手写路径逐个取；
    // 而 dnd5e **运行时算出来的** labels（伤害/豁免的最终显示值）根本没有任何 get 工具能拿到。
    REG(makeTool('foundry_inspect', '一次读回一个实体的**指定字段值**（只读，不比对）。用途：写完之后想确认某几个字段到底变成了什么，又不想拉整份文档。paths 用点号路径 + [n] 下标（语法同 foundry_diff），例：["system.damage.base.denomination","system.activities.dnd5eactivity100.save.dc.formula","flags.autoanimations.primary.video.customPath"]。labels=true 会额外取 dnd5e **运行时算出来的** labels —— 这是「写进去的」与「算出来的」的唯一对照口径（写进去的 1d8 也可能被算成 2d10，只有 labels 看得见），需要世界开着 execute-js。没找到的路径会进 missing，不会静默消失。', {
        uuid: { type: 'string', description: '实体 uuid（支持内嵌物品 Actor.<actorId>.Item.<itemId>）' },
        paths: { type: 'array', items: { type: 'string' }, description: '要读的点号路径数组，如 ["system.rarity","system.activities.dnd5eactivity000.type"]' },
        labels: { type: 'boolean', description: 'true 则额外读取该物品的运行时 labels（dnd5e prepareData 算出的最终显示值，含 damages/saves/toHit），需世界开启 execute-js' },
    }, [], async (args) => {
        const uuid = String(args.uuid ?? '').trim();
        if (!uuid)
            return { error: 'uuid 必填' };
        const paths = Array.isArray(args.paths)
            ? args.paths.filter((p) => typeof p === 'string' && p.trim()).map((p) => String(p).trim())
            : [];
        const wantLabels = args.labels === true;
        if (!paths.length && !wantLabels)
            return { error: '至少要给 paths（要读哪些字段）或 labels:true' };
        const raw = await callRelay('GET', '/get', { query: { ...targetingQuery(args), uuid } });
        const rec = raw;
        const doc = (rec && typeof rec.entity === 'object' && rec.entity) ||
            (rec && typeof rec.data === 'object' && rec.data) ||
            rec;
        const values = {};
        const missing = [];
        for (const p of paths) {
            const v = readPathLoose(doc, p);
            if (v === undefined)
                missing.push(p);
            else
                values[p] = v;
        }
        const out = {
            uuid,
            name: doc?.name,
            type: doc?.type,
            values,
            missing,
        };
        if (wantLabels) {
            try {
                const script = 'const it = await fromUuid(' + JSON.stringify(uuid) + ');\n' +
                    'if (!it) return { found: false };\n' +
                    'let lb = null;\n' +
                    'try { lb = JSON.parse(JSON.stringify(it.labels ?? null)) } catch (e) { lb = { unserializable: true } }\n' +
                    'return { found: true, labels: lb };';
                const env = await callRelay('POST', '/execute-js', { body: { script } });
                const inner = (env?.result ?? env);
                out.labels = inner?.labels ?? null;
                if (inner?.found === false)
                    out.labelsNote = 'fromUuid 没解析到这个 uuid（可能是不在世界里的 compendium 实体）';
            }
            catch (e) {
                out.labelsNote =
                    'labels 读取失败：' +
                        (e instanceof Error ? e.message : String(e)) +
                        '（世界可能没开 execute-js，或该实体不支持 labels）';
            }
        }
        if (missing.length) {
            out.hint = 'missing 里的路径在当前文档上不存在 —— 键名可能写错，也可能被 dnd5e 清洗（对照 foundry_reference 的模板）';
        }
        return out;
    }));
    // 3. foundry_get_entity —— 按 uuid 或当前选中 token/actor 读完整文档。
    REG(makeTool('foundry_get_entity', '按 uuid 读取一个 Foundry 实体；或 selected=true 读取当前选中的 token/actor（actor=true 则取该 token 的 Actor 文档）。返回完整文档含 system 数据与内嵌 items。**uuid 支持内嵌物品形式 Actor.<actorId>.Item.<itemId>，可直接读 actor 身上的某个物品。** ⚠️省 token 铁律：只是看数值/伤害结构/活动/效果时用 summary:true（返回精简摘要，省 90%+ token）；需要完整原始 JSON（含描述全文/富文本/全部 flags）才不传 summary。', {
        uuid: { type: 'string', description: '实体 uuid，如 Actor.2midVQ1laJFMrN4D' },
        selected: { type: 'boolean', description: 'true 则返回当前选中实体' },
        actor: { type: 'boolean', description: 'selected=true 且 actor=true 则返回该 token 的 Actor' },
        summary: { type: 'boolean', description: 'true 返回精简摘要（数值骨架+物品/效果摘要+token 元信息），省 token；默认 false 返回完整文档' },
    }, [], async (args) => {
        if (!args.uuid && !args.selected)
            missing('provide either uuid or selected=true');
        const q = { ...targetingQuery(args) };
        if (args.uuid)
            q.uuid = args.uuid;
        if (args.selected)
            q.selected = args.selected;
        if (args.actor)
            q.actor = args.actor;
        const raw = await callRelay('GET', '/get', { query: q });
        return args.summary === true ? summarizeDoc(raw) : raw;
    }));
    // 4. foundry_create_entity —— 用 raw Foundry 文档创建实体，返回新 uuid 与文档。
    REG(makeTool('foundry_create_entity', '用原始 Foundry 文档创建一个实体（entityType: Actor|Item|Scene|JournalEntry|RollTable|Cards|Macro|Playlist），data 为该类型文档（name/type/system/items 等）。返回新实体 uuid 与文档。**建结构先查内置参考库 foundry_reference（weapon/save-activity/effect/creature/feat/spell 模板），别再 search+get_entity 拉样本怪照抄。** 警告：dnd5e 5.3.3 会丢弃旧版字段——武器伤害骰必须放 item.system.damage.base{number,denomination,bonus,types}，activities 的 damage.parts 必须留空数组并设 includeBase:true；在 parts[].formula 写骰子会被系统清洗成空，导致怪物没有伤害。文档内所有 _id 必须恰好 16 位字母数字（超长会自动规范化并附 note）。⚠️ 建 Macro 被拦时会报「Allow Macro Creation/Editing」——去 **Foundry 设置 → 模块设置 → Foundry REST API** 打开对应开关（设置键 foundry-rest-api.allowMacroWrite），不用去扫 game.settings 全表。', {
        entityType: { type: 'string', enum: ['Actor', 'Item', 'Scene', 'JournalEntry', 'RollTable', 'Cards', 'Macro', 'Playlist'], description: '文档类' },
        data: { type: 'object', description: '原始 Foundry 文档' },
        folder: { type: 'string', description: '归档到的文件夹 id（传纯 16 位 ID 或 Folder.xxx 均可，自动剥前缀）' },
        keepId: { type: 'boolean', description: '保留传入的 _id' },
        override: { type: 'boolean', description: '用相同 _id 覆盖已有实体' },
    }, ['entityType', 'data'], async (args) => {
        const { doc: data, renamed } = normalizeDocIds(args.data);
        const body = { entityType: args.entityType, data };
        if (args.folder)
            body.folder = stripFolderPrefix(args.folder);
        if (args.keepId !== undefined)
            body.keepId = args.keepId;
        if (args.override !== undefined)
            body.override = args.override;
        const raw = await callRelay('POST', '/create', { query: targetingQuery(args), body });
        if (renamed.length > 0) {
            const out = asObject(raw);
            return { ...out, note: `_id 规范化：${renamed.length} 个超长/非法 _id 已自动替换为合法 16 位（如 ${renamed[0]}）。` };
        }
        return raw;
    }));
    // 5. foundry_update_entity —— 按 uuid/选中更新；带回读确认（模块 fromUuid 间歇误报兜底）。
    REG(makeTool('foundry_update_entity', '更新一个已存在实体（uuid 或 selected=true），data 只传要改的字段（partial 文档），如 {"name":"...","system":{"attributes":{"hp":{"value":15,"max":15}}}}。**uuid 支持内嵌物品形式 Actor.<actorId>.Item.<itemId>：给 actor 身上的物品加效果/豁免自动化时，直接用内嵌 uuid 传 {system:{...},effects:[...]}，无需整数组替换、无需 execute_js。**写入成功后默认返回 {mutation,verified:true,changed} 精简确认（省 token）；需要读回新值时再用 foundry_get_entity(summary:true)；detail:"full" 才返回完整实体。若模块回读误报会返回 verified:true（真实已生效）。', {
        uuid: { type: 'string', description: '实体 uuid' },
        selected: { type: 'boolean', description: 'true 则更新当前选中实体' },
        actor: { type: 'boolean', description: 'selected=true 且 actor=true 则更新 token 的 Actor' },
        data: { type: 'object', description: 'partial 文档，仅改动的字段' },
        detail: { type: 'string', enum: ['summary', 'full'], description: '返回详细度：summary=精简确认（默认，省 token）；full=完整实体' },
    }, ['data'], async (args) => {
        if (!args.uuid && !args.selected)
            missing('provide either uuid or selected=true');
        const q = { ...targetingQuery(args) };
        if (args.uuid)
            q.uuid = args.uuid;
        if (args.selected)
            q.selected = args.selected;
        if (args.actor)
            q.actor = args.actor;
        const wantFull = args.detail === 'full';
        try {
            const { doc: data } = normalizeDocIds(args.data);
            const raw = await callRelay('PUT', '/update', { query: q, body: { data } });
            if (wantFull)
                return raw;
            return {
                mutation: 'update',
                uuid: args.uuid ?? '(selected)',
                verified: true,
                changed: args.data,
                note: '写入已确认。需要读回新值时用 foundry_get_entity(summary:true)。',
            };
        }
        catch (e) {
            if (args.uuid && e instanceof HttpError) {
                const rawErr = JSON.stringify(e.raw ?? e.message);
                if (/does not exist|failed to update entity/i.test(rawErr)) {
                    return { mutation: 'update', uuid: args.uuid, verified: true, changed: args.data, note: '模块回读确认失败但写入已执行（假阴性）——判定已生效。' };
                }
                try {
                    const fresh = await callRelay('GET', '/get', { query: { uuid: args.uuid } });
                    return {
                        mutation: 'update',
                        uuid: args.uuid,
                        verified: true,
                        changed: args.data,
                        detail: wantFull ? fresh : summarizeDoc(fresh),
                        note: '更新报错但重读确认实体存在（假阴性当作成功）。',
                    };
                }
                catch {
                    throw e;
                }
            }
            throw e;
        }
    }));
    // 6. foundry_delete_entity —— 按 uuid/选中永久删除。
    REG(makeTool('foundry_delete_entity', '按 uuid 或 selected=true 永久删除一个实体。不可逆。', {
        uuid: { type: 'string', description: '实体 uuid' },
        selected: { type: 'boolean', description: 'true 则删除当前选中实体' },
    }, [], async (args) => {
        if (!args.uuid && !args.selected)
            missing('provide either uuid or selected=true');
        const q = { ...targetingQuery(args) };
        if (args.uuid)
            q.uuid = args.uuid;
        if (args.selected)
            q.selected = args.selected;
        return callRelay('DELETE', '/delete', { query: q });
    }));
    // 7. foundry_modify_actor —— 给/移除物品、增减数值、击杀。
    REG(makeTool('foundry_modify_actor', '对 actor 做操作：give 给物品（toUuid 收件人 + itemUuid/itemName）、remove 移除物品（actorUuid/selected + itemUuid/itemName）、increase/decrease 增减属性（uuid/selected + attribute 点号路径 + amount）、kill 击杀（hp 归 0）。**⚠️ give 的 itemUuid 必须传完整 uuid（如 Item.xxxx 或 Compendium.dnd5e.monsters.Item.xxxx，裸 id 会报 Item not found）——先用 foundry_search 拿 uuid。remove 移除 actor 身上的嵌入物品（compendium 导入怪自带的武器等）时，itemUuid 必须用内嵌形式 Actor.<actorId>.Item.<itemId>（传 Item.<id> 会报 Item not found，因为嵌入物品不在世界物品目录）。**', {
        action: { type: 'string', enum: ['give', 'remove', 'increase', 'decrease', 'kill'], description: '操作类型' },
        toUuid: { type: 'string', description: '[give] 收件 actor 的 uuid' },
        fromUuid: { type: 'string', description: '[give] 来源 actor 的 uuid' },
        itemUuid: { type: 'string', description: '[give/remove] 物品 uuid' },
        itemName: { type: 'string', description: '[give/remove] 物品名（无 uuid 时用）' },
        quantity: { type: 'number', description: '[give/remove] 数量' },
        actorUuid: { type: 'string', description: '[remove] 移除物品的 actor uuid' },
        uuid: { type: 'string', description: '[increase/decrease/kill] 目标 actor uuid' },
        selected: { type: 'boolean', description: '[remove/increase/decrease/kill] 用当前选中' },
        attribute: { type: 'string', description: '[increase/decrease] 点号属性路径，如 system.attributes.hp.value' },
        amount: { type: 'number', description: '[increase/decrease] 改动量' },
    }, ['action'], async (args) => {
        const action = args.action;
        const q = { ...targetingQuery(args) };
        if (action === 'give') {
            if (!args.toUuid)
                missing('give requires toUuid');
            if (!args.itemUuid && !args.itemName)
                missing('give requires itemUuid or itemName');
            const body = { toUuid: args.toUuid };
            if (args.fromUuid)
                body.fromUuid = args.fromUuid;
            if (args.itemUuid)
                body.itemUuid = args.itemUuid;
            if (args.itemName)
                body.itemName = args.itemName;
            if (args.quantity !== undefined)
                body.quantity = args.quantity;
            return callRelay('POST', '/give', { query: q, body });
        }
        if (action === 'remove') {
            if (!args.actorUuid && !args.selected)
                missing('remove requires actorUuid or selected');
            if (!args.itemUuid && !args.itemName)
                missing('remove requires itemUuid or itemName');
            const body = {};
            if (args.actorUuid)
                body.actorUuid = args.actorUuid;
            if (args.selected)
                body.selected = args.selected;
            if (args.itemUuid)
                body.itemUuid = args.itemUuid;
            if (args.itemName)
                body.itemName = args.itemName;
            if (args.quantity !== undefined)
                body.quantity = args.quantity;
            return callRelay('POST', '/remove', { query: q, body });
        }
        if (action === 'increase' || action === 'decrease') {
            if (!args.uuid && !args.selected)
                missing(action + ' requires uuid or selected');
            if (!args.attribute)
                missing(action + ' requires attribute');
            if (args.amount === undefined)
                missing(action + ' requires amount');
            if (args.uuid)
                q.uuid = args.uuid;
            if (args.selected)
                q.selected = args.selected;
            return callRelay('POST', action === 'increase' ? '/increase' : '/decrease', {
                query: q,
                body: { attribute: args.attribute, amount: args.amount },
            });
        }
        if (!args.uuid && !args.selected)
            missing('kill requires uuid or selected');
        if (args.uuid)
            q.uuid = args.uuid;
        if (args.selected)
            q.selected = args.selected;
        return callRelay('POST', '/kill', { query: q });
    }));
    // 8. foundry_create_creature —— 用友好 schema 构建 dnd5e NPC 并创建。
    REG(makeTool('foundry_create_creature', '用友好 schema 构建一个 dnd5e NPC actor 并在世界创建（只有 dnd5e 世界可用）。返回新 actor uuid 与文档。cr 必须是数字（如 0.25 或 6），hp 用 {value,max}，abilities 用 {str,dex,con,int,wis,cha}。attacks/features 可选。**只有世界包确实没有现成怪时才用本工具新建；用户要世界包里的怪时用 foundry_search → foundry_import_entity → foundry_place_token。**攻击伤害骰按 dnd5e 5.3 规则放在物品 damage.base{number,denomination,bonus,types}（如 1d6+1 钝击 → number:1,denomination:6,bonus:"1",types:["bludgeoning"]），本工具已自动按此生成；attack 加值由 abilityMod+熟练自动计算，toHit 留空即可。给新建怪补特性/自动化时查 foundry_reference（save-activity/effect/feat）。', {
        name: { type: 'string', description: 'NPC 名' },
        size: { type: 'string', enum: ['tiny', 'sm', 'med', 'lg', 'huge', 'grg'], description: '体型' },
        type: { type: 'string', description: '生物类型，如 beast/monstrosity/humanoid' },
        cr: { type: 'number', description: '挑战等级，如 0.25 / 6' },
        ac: { type: 'number', description: '护甲等级' },
        hp: { type: 'object', description: '{value,max,formula?}' },
        abilities: { type: 'object', description: '{str,dex,con,int,wis,cha}' },
        speeds: { type: 'object', description: '{walk?,fly?,swim?,climb?,burrow?,units?}' },
        senses: { type: 'object', description: '{darkvision?,blindsight?,tremorsense?,truesight?,units?}' },
        languages: { type: 'array', items: { type: 'string' }, description: '语言列表' },
        alignment: { type: 'string', description: '如 "Chaotic Evil"' },
        biography: { type: 'string', description: '背景描述' },
        attacks: { type: 'array', items: { type: 'object' }, description: '[{name,toHit?,abilityMod?,reach?,range?,damage:[{formula,type}],description?}]' },
        features: { type: 'array', items: { type: 'object' }, description: '[{name,description}]' },
        folder: { type: 'string', description: '归档文件夹 uuid' },
    }, ['name', 'size', 'type', 'cr', 'ac', 'hp', 'abilities'], async (args) => {
        const { doc: npcDoc } = normalizeDocIds(buildNpcDocument(args));
        return callRelay('POST', '/create', {
            query: targetingQuery(args),
            body: { entityType: 'Actor', data: npcDoc },
        });
    }));
    // 9. foundry_manage_folder —— 创建/删除文件夹。
    REG(makeTool('foundry_manage_folder', '创建或删除 Foundry 文件夹。create：name + folderType(文档类)。创建后把返回的 uuid 作 folder 参数传给 create_entity。delete：folderId（deleteAll=true 连带删除内部实体，不可逆）。', {
        action: { type: 'string', enum: ['create', 'delete'], description: 'create 或 delete' },
        name: { type: 'string', description: '[create] 文件夹名' },
        folderType: { type: 'string', enum: ['Actor', 'Item', 'Scene', 'JournalEntry', 'RollTable', 'Cards', 'Macro', 'Playlist'], description: '[create] 文档类' },
        parentFolderId: { type: 'string', description: '[create] 父文件夹 id（传纯 16 位 ID 或 Folder.xxx 均可，自动剥前缀）' },
        folderId: { type: 'string', description: '[delete] 文件夹 id（传纯 16 位 ID 或 Folder.xxx 均可，自动剥前缀）' },
        deleteAll: { type: 'boolean', description: '[delete] true 则连带删除内部实体（不可逆）' },
    }, ['action'], async (args) => {
        const q = { ...targetingQuery(args) };
        if (args.action === 'create') {
            if (!args.name)
                missing('create requires name');
            if (!args.folderType)
                missing('create requires folderType');
            q.name = args.name;
            q.folderType = args.folderType;
            if (args.parentFolderId)
                q.parentFolderId = stripFolderPrefix(args.parentFolderId);
            return callRelay('POST', '/create-folder', { query: q });
        }
        if (!args.folderId)
            missing('delete requires folderId');
        q.folderId = stripFolderPrefix(args.folderId);
        if (args.deleteAll !== undefined)
            q.deleteAll = args.deleteAll;
        return callRelay('DELETE', '/delete-folder', { query: q });
    }));
    // 10. foundry_roll —— 掷骰。
    REG(makeTool('foundry_roll', '在世界掷骰，formula 如 "1d20+5" 或 "5d6"。可选 createChatMessage 生成聊天消息、flavor 风味文本、speaker 说话者、whisper 私聊用户 id 列表（设置了则私骰）。返回骰子结果，聊天窗可见。', {
        formula: { type: 'string', description: '掷骰公式，如 "1d20 + 5"' },
        flavor: { type: 'string', description: '可选风味文本' },
        createChatMessage: { type: 'boolean', description: '是否为掷骰生成聊天消息' },
        speaker: { type: 'string', description: '说话者 uuid/token actor' },
        whisper: { type: 'array', items: { type: 'string' }, description: '私聊的用户 id 列表（设置则私骰）' },
    }, ['formula'], async (args) => {
        const body = { formula: args.formula };
        if (args.flavor)
            body.flavor = args.flavor;
        if (args.createChatMessage !== undefined)
            body.createChatMessage = args.createChatMessage;
        if (args.speaker)
            body.speaker = args.speaker;
        if (args.whisper)
            body.whisper = args.whisper;
        return callRelay('POST', '/roll', { query: targetingQuery(args), body });
    }));
    // 11. foundry_get_recent_rolls —— 最近掷骰记录，新的在前。
    REG(makeTool('foundry_get_recent_rolls', '读取世界最近的掷骰记录（新的在前）。limit 为返回条数（默认 20）。', { limit: { type: 'number', description: '返回条数（默认 20）' } }, [], async (args) => {
        const q = {
            ...targetingQuery(args),
            ...(args.limit ? { limit: args.limit } : {}),
        };
        return asObject(await callRelay('GET', '/rolls', { query: q }));
    }));
    // 12. foundry_get_last_roll —— 最近一次掷骰。
    REG(makeTool('foundry_get_last_roll', '读取世界最近一次掷骰结果。', {}, [], () => callRelay('GET', '/lastroll', { query: targetingQuery({}) })));
    // 13. foundry_list_status_effects —— 列出世界 CONFIG.statusEffects 全部自动化状态素材库。
    REG(makeTool('foundry_list_status_effects', '列出世界 CONFIG.statusEffects 全部可用状态/自动化条件（如 poisoned/blinded/prone/frightened/charmed）。这是自动化状态素材目录，把它们其中之一的 id 传给 foundry_add_effect 即可施加。', {}, [], () => callRelay('GET', '/effects/list', { query: targetingQuery({}) })));
    // 14. foundry_get_effects —— 读 actor/token 当前应用的 ActiveEffects。
    REG(makeTool('foundry_get_effects', '读取 actor 或 token 当前应用的 ActiveEffects 数组：id/uuid/name/icon/disabled/duration/statuses/changes/origin。用于查看怪物当下挂了哪些自动化状态。', { uuid: { type: 'string', description: 'actor 或 token 的 uuid' } }, ['uuid'], (args) => callRelay('GET', '/effects', { query: { ...targetingQuery(args), uuid: args.uuid } })));
    // 15. foundry_add_effect —— 施加自动化状态（带回读确认）。
    REG(makeTool('foundry_add_effect', '给 actor/token 施加自动化状态：用 statusId（如 "poisoned"，取自 foundry_list_status_effects）或自定义 effectData（{name,icon,duration,changes,statuses}）。statusId 与 effectData 至少给一个。返回后若模块回读误报会给出 verified:true（真实已生效）。', {
        uuid: { type: 'string', description: '目标 actor/token 的 uuid' },
        statusId: { type: 'string', description: '标准状态 id，如 poisoned/blinded/prone' },
        effectData: { type: 'object', description: '自定义 ActiveEffect 数据 {name,icon,duration,changes,statuses}' },
    }, ['uuid'], async (args) => {
        if (!args.statusId && !args.effectData)
            missing('provide either statusId or effectData');
        const body = { uuid: args.uuid };
        if (args.statusId)
            body.statusId = args.statusId;
        if (args.effectData)
            body.effectData = args.effectData;
        try {
            return await callRelay('POST', '/effects', { query: targetingQuery(args), body });
        }
        catch (e) {
            if (args.uuid && e instanceof HttpError) {
                try {
                    const fresh = (await callRelay('GET', '/effects', { query: { ...targetingQuery(args), uuid: args.uuid } }));
                    const eff = fresh?.effects ?? [];
                    const found = args.statusId
                        ? eff.some((x) => (x.statuses ?? []).includes(args.statusId))
                        : eff.some((x) => x.name === args.effectData?.name);
                    if (found)
                        return { mutation: 'add-effect', uuid: args.uuid, statusId: args.statusId, verified: true, detail: fresh, note: '添加报错但重读确认状态已挂上（模块假阴性当作成功）。' };
                }
                catch { /* fall through */ }
                const addRaw = JSON.stringify(e.raw ?? e.message);
                if (args.statusId && /does not exist in actors/i.test(addRaw)) {
                    return { mutation: 'add-effect', uuid: args.uuid, statusId: args.statusId, verified: true, note: '添加报 actor 缺失但状态已挂上（间歇 fromUuid 假阴性）。判定已生效。' };
                }
                throw e;
            }
            throw e;
        }
    }));
    // 16. foundry_remove_effect —— 移除自动化状态（带回读确认）。
    REG(makeTool('foundry_remove_effect', '从 actor/token 移除一个 ActiveEffect：effectId（效果文档 id）或 statusId（施加时的状态 id）。移除后若模块回读误报会给出 verified:true（真实已移除）。', {
        uuid: { type: 'string', description: '目标 actor/token 的 uuid' },
        effectId: { type: 'string', description: '要移除的 ActiveEffect 文档 id' },
        statusId: { type: 'string', description: '要移除的状态 id，如 poisoned' },
    }, ['uuid'], async (args) => {
        if (!args.effectId && !args.statusId)
            missing('provide either effectId or statusId');
        const q = { ...targetingQuery(args), uuid: args.uuid };
        if (args.effectId)
            q.effectId = args.effectId;
        if (args.statusId)
            q.statusId = args.statusId;
        try {
            return await callRelay('DELETE', '/effects', { query: q });
        }
        catch (e) {
            if (args.uuid && e instanceof HttpError) {
                try {
                    const fresh = (await callRelay('GET', '/effects', { query: { ...targetingQuery(args), uuid: args.uuid } }));
                    const eff = fresh?.effects ?? [];
                    const stillThere = args.statusId
                        ? eff.some((x) => (x.statuses ?? []).includes(args.statusId))
                        : eff.some((x) => x.id === args.effectId);
                    if (!stillThere)
                        return { mutation: 'remove-effect', uuid: args.uuid, effectId: args.effectId, statusId: args.statusId, verified: true, detail: fresh, note: '移除报错但重读确认效果已不在（模块假阴性当作成功）。' };
                }
                catch { /* fall through */ }
                throw e;
            }
            throw e;
        }
    }));
    // 17. foundry_import_entity —— 从世界包（compendium）导入实体到当前世界（GET /get → 清洗 → POST /create）。
    REG(makeTool('foundry_import_entity', '从 compendium（世界包）导入一个实体到当前世界：先 GET /get 读 compendium 完整文档，清洗 compendium 特有字段（_id/_stats/compendiumSource），再 POST /create 在世界创建副本，返回新世界实体 uuid 与文档。**用户要"把世界包里的怪放到地图上"时必须用本工具导入现成怪，禁止自己新建（新建会丢汉化/数值/特性）。配合 foundry_place_token 完成放地图。**', {
        uuid: { type: 'string', description: 'compendium 实体 uuid，如 Compendium.dnd5e.monsters.Actor.NAISFPoNNgUCsEyW' },
        folder: { type: 'string', description: '可选，归档文件夹 id（传纯 16 位 ID 或 Folder.xxx 均可，自动剥前缀；推荐不传 folder，导入后用 foundry_update_entity 把 folder 改成目标文件夹纯 ID——两步法最稳）' },
        name: { type: 'string', description: '可选，覆盖副本名字' },
        summary: { type: 'boolean', description: 'true 返回精简摘要（含新实体 uuid），省 token；默认 false 返回完整文档' },
    }, ['uuid'], async (args) => {
        const src = (await callRelay('GET', '/get', { query: { ...targetingQuery(args), uuid: args.uuid } }));
        const doc = { ...src };
        delete doc._id;
        delete doc._stats;
        delete doc.compendiumSource;
        // ⚠️ compendium 源文档带的 folder 是**源包里的**文件夹 id，复制到世界后那个 id 不存在
        // → 世界会静默把 folder 置 null（不报错）。所以先无条件清掉，再按传参设置。
        delete doc.folder;
        if (args.name)
            doc.name = args.name;
        if (args.folder)
            doc.folder = stripFolderPrefix(args.folder);
        const segs = String(args.uuid).split('.');
        const entityType = segs.length >= 2 ? segs[segs.length - 2] : 'Actor';
        const body = { entityType, data: doc };
        if (args.folder)
            body.folder = stripFolderPrefix(args.folder);
        const created = await callRelay('POST', '/create', { query: targetingQuery(args), body });
        if (args.summary === true) {
            // relay /create 返回 {uuid, entity:{...}} 信封；摘要要对 entity 内层做，并附带新 uuid（防 undefined 字段被 DSH 拒收）
            const createdObj = created;
            const inner = (createdObj.entity ?? createdObj);
            const sum = summarizeDoc(inner);
            return { uuid: createdObj.uuid ?? null, ...sum };
        }
        return created;
    }));
    // 18. foundry_place_token —— 把世界内 Actor 作为 token 放到场景地图坐标（POST /canvas/tokens）。
    REG(makeTool('foundry_place_token', '把一个世界内 Actor 作为 token 放到指定场景的地图坐标上（POST /canvas/tokens，token 数据用 actor.prototypeToken 展开 + 覆盖 x/y）。用于"把怪放到地图上"。**场景规则（重要）：用户说"放地图上/放我激活的地图"且未指定场景名 → 不要传 sceneId（默认=当前激活场景）；先调 foundry_get_scene(active=true) 拿激活场景的 grid.size/width/height，x/y 取 grid.size 整数倍并保证在场景尺寸内。只有用户明确说放到某张具体地图时才传 sceneId。**可用 foundry_move_token 移 token（/move-token）。', {
        actorUuid: { type: 'string', description: '世界内 Actor 的 uuid（如 Actor.YIxZBcCOrikqAw4x），token 关联它' },
        sceneId: { type: 'string', description: '场景 id（默认当前激活场景）' },
        x: { type: 'number', description: '场景像素 x 坐标' },
        y: { type: 'number', description: '场景像素 y 坐标' },
        hidden: { type: 'boolean', description: '是否对玩家隐藏（默认 false）' },
        disposition: { type: 'number', description: '阵营：-1 敌对 / 0 中立 / 1 友善（默认 -1）' },
        name: { type: 'string', description: 'token 显示名（默认用 actor 名）' },
    }, ['actorUuid', 'x', 'y'], async (args) => {
        const actor = (await callRelay('GET', '/get', { query: { ...targetingQuery(args), uuid: args.actorUuid } }));
        const actorId = String(actor._id ?? actor.id ?? '');
        if (!actorId)
            missing('actor not found for uuid ' + String(args.actorUuid));
        const proto = (actor.prototypeToken ?? {});
        const data = { ...proto };
        data.x = args.x;
        data.y = args.y;
        data.actorId = actorId;
        if (args.name)
            data.name = args.name;
        if (!data.name)
            data.name = actor.name;
        if (args.hidden !== undefined)
            data.hidden = args.hidden;
        if (args.disposition !== undefined)
            data.disposition = args.disposition;
        const body = { data };
        if (args.sceneId)
            body.sceneId = args.sceneId;
        return asObject(await callRelay('POST', '/canvas/tokens', { query: targetingQuery(args), body }));
    }));
    // 19. foundry_move_token —— 移动场景内 token 到新坐标（POST /move-token）。
    REG(makeTool('foundry_move_token', '把场景内的一个 token 移动到新坐标（POST /move-token）。x/y 为场景像素坐标（必填）；uuid 为 token 的 uuid（如 Scene.KoACwBDvPOf3cY2A.Token.abc123）或 name 二选一；waypoints 为途经点数组[{x,y}]（先动画经过再到达终点）。**场景规则：用户未指定场景 → 不传 sceneId（默认当前激活场景）；可先 foundry_get_scene(active=true) 确认激活场景与 grid.size。**', {
        uuid: { type: 'string', description: 'token 的 uuid（可选，与 name 二选一）' },
        name: { type: 'string', description: 'token 的名字（可选，与 uuid 二选一）' },
        sceneId: { type: 'string', description: '场景 id（默认当前激活场景）' },
        x: { type: 'number', description: '目标 x 坐标' },
        y: { type: 'number', description: '目标 y 坐标' },
        waypoints: { type: 'array', items: { type: 'object' }, description: '途经点 [{x,y}]（可选，动画经过）' },
        animate: { type: 'boolean', description: '是否动画移动（默认 true）' },
    }, ['x', 'y'], async (args) => {
        if (!args.uuid && !args.name)
            missing('provide either uuid or name');
        const body = { x: args.x, y: args.y };
        if (args.uuid)
            body.uuid = args.uuid;
        if (args.name)
            body.name = args.name;
        if (args.sceneId)
            body.sceneId = args.sceneId;
        if (args.waypoints)
            body.waypoints = args.waypoints;
        if (args.animate !== undefined)
            body.animate = args.animate;
        return asObject(await callRelay('POST', '/move-token', { query: targetingQuery(args), body }));
    }));
    // 20. foundry_get_scene —— 读场景（GET /scene）。拿「当前激活场景」的唯一正确途径。
    REG(makeTool('foundry_get_scene', '读 Foundry 场景文档（GET /scene）。**这是拿"当前激活场景"的唯一途径**：active=true 返回世界当前激活场景（含 _id/name/width/height/grid.size/tokens），viewed=true 返回 GM 当前正在查看的场景，sceneId/name 拿指定场景，all=true 返回全部场景。用户说"放地图上/放到我激活的地图"且未指定场景名时：先调本工具 active=true 拿激活场景 id + grid.size，再 foundry_place_token 放怪（不传 sceneId 即默认激活场景）。世界内场景用 foundry_search 搜不到（search 只索引 compendium），必须用本工具。⚠️省 token：场景含全量 token 数据很大，放怪/看网格用 summary:true（返回网格+尺寸+token 坐标列表），需要完整文档才不传。', {
        active: { type: 'boolean', description: 'true 返回当前激活场景（推荐先试这个）' },
        viewed: { type: 'boolean', description: 'true 返回 GM 当前正在查看的场景' },
        sceneId: { type: 'string', description: '指定场景 id' },
        name: { type: 'string', description: '按场景名查' },
        all: { type: 'boolean', description: 'true 返回全部场景列表' },
        summary: { type: 'boolean', description: 'true 返回精简摘要（网格/尺寸/token 坐标列表），省 token；默认 false 返回完整文档' },
    }, [], async (args) => {
        const q = { ...targetingQuery(args) };
        if (args.active !== undefined)
            q.active = args.active;
        if (args.viewed !== undefined)
            q.viewed = args.viewed;
        if (args.sceneId)
            q.sceneId = args.sceneId;
        if (args.name)
            q.name = args.name;
        if (args.all !== undefined)
            q.all = args.all;
        const raw = await callRelay('GET', '/scene', { query: q });
        const value = asObject(raw);
        if (args.summary === true) {
            const arr = value.results;
            if (Array.isArray(arr)) {
                return { results: arr.map((s) => summarizeDoc(s)), total: value.total };
            }
            return summarizeDoc(value);
        }
        return value;
    }));
    // 21+. 全量补齐：dnd5e 系统操作 / 遭遇回合 / 场景画布 / 聊天 / 用户 / 宏 JS / 文件 / 声音 / 世界信息。
    registerExtraTools({ makeTool, callRelay, asObject, targetingQuery }, REG);
    // 87. 内置结构参考库（本地模板，省 token）。
    registerReferenceTools(REG);
    // 88. 按需读用户本地 FVTT 资料库（血泪教训/数据字典/图标真源）+ 本地样本库（真实配置实体 JSON 抄改）。
    registerKnowledgeTools(REG, () => {
        try {
            const raw = readFileSync(CONFIG_FILE, 'utf8').replace(/^\uFEFF/, '');
            const c = JSON.parse(raw);
            if (c.knowledgeDir)
                return c.knowledgeDir;
        }
        catch {
            // 无文件/损坏：走 env + 默认。
        }
        return process.env.FOUNDRY_KNOWLEDGE_DIR || DEFAULT_KNOWLEDGE_DIR;
    }, () => {
        try {
            const raw = readFileSync(CONFIG_FILE, 'utf8').replace(/^\uFEFF/, '');
            const c = JSON.parse(raw);
            if (c.sampleDir)
                return c.sampleDir;
        }
        catch {
            // 无文件/损坏：走 env + 默认。
        }
        return process.env.FOUNDRY_SAMPLE_DIR || DEFAULT_SAMPLE_DIR;
    });
    // 89. 省 token 快速建武器：AI 只给关键字段，插件本地组装实测完整结构一次 create。
    registerMinimalTools({ makeTool, callRelay, asObject, normalizeDocIds, targetingQuery }, REG);
    ctx.logger?.info?.('[' + name + '] FVTT 控制工具已就绪（relay + 89 工具）。配置：' + CONFIG_FILE);
}
export { name, inject };
//# sourceMappingURL=index.js.map