# FVTT 怪物 AI 生成规范 v2.1

> 本文档是给 AI 的指令集。AI 读完后，依据 DM 提供的怪物设计意图，输出**一个可直接 Import 到 Foundry VTT 的 Actor JSON**（带满自动化），并**同步输出一份「自动化日志」**记录所有实现细节。所有结构均提取自真实可用样本，未经验证的字段一律不得出现。
>
> **v2.1 修订（三项实测补订，来源：魔剑士改版卡 + 全库 F12 法术导出）**：① **自身目标 `override`**——显式设 `affects.type:"self"` 的自我增益 utility 必须配 `target.override:true`，否则 UI 选不中自身、增益落空；模板型 AOE 不需要（坐实见 §5.2、§M13⑥、§6）。② **世界包法术挂接工作流**——官方法术从"只列清单交 DM 手拖"升级为"**精简卡 + 挂接宏**"：卡内不写官方法术，随怪交付一个按 compendium UUID 从世界包 `fromUuid`→`createEmbeddedDocuments` 自动挂接的脚本宏（去重、可重复跑）；UUID 取自**字典新增 §37「法术 / 物品 UUID 库」**（DM 用 F12 一次性导出的全库 name→UUID，50 包 2900+ 条）。AI 无法直连实时世界，§37 即"探针结果"。涉及 §M8、§6、字典 §37。③ **怪物命名风格**——`name`/`token.name` 用**简短描述性称号**（`中文称号 English Title` 无括号，如 `提线剑姬`/`焰纹剑客`），**禁止凭空起人名、禁止用"者"作后缀**（坐实见 §0bis、§6）。
> **v2.0.2 补订（法术处理总则）**：确立「**官方法术只列清单、自创才手写**」硬规则，更新 §M8、§6 自检、§7 禁忌、字典 §6bis F。**判定**：法术是否官方，以资料库《5E万法大全》清单（英文名匹配）为准。**官方法术**（清单中有）——绝不手写其描述 / activity / effect / 机制，**也不放进 Actor JSON**；仅随怪交付一份**官方法术清单**（按环阶分组：中文名 + 英文名 + 环阶），由 DM 用自有 FVTT 版本配置；即便火球术 / 火焰箭这类常见法术也只列不写。**自创 / 魔改法术**（清单中没有）——必须完整手写外壳 + activity + effect 做满自动化。理由：手写官方法术机制极易出错，而 FVTT 内已有权威且配好自动化的版本。本则收紧并取代 §6bis F / §18 旧"建 stub item 再用 CPR 医药箱匹配"做法。**（v2.1 进一步把"只列清单"升级为"挂接宏自动挂接"，见上。）**
> **v2.0.1 补订（术语硬规则）**：新增「**卡面用词照字典 §36 术语对照表**」硬规则，并入 §0bis A、§6 自检、§7 禁忌。`description.value` / `item.name` 内一切玩家可见术语（伤害 / 状态 / 属性 / 技能 / 学派 / 生物类型 / 物品属性）必须逐字照字典 §36（国内官方译名 / 本地化包权威源），不得凭记忆自译。高频易错：`psychic`=**心灵**（非"精神"）、`necrotic`=**暗蚀**（非"死灵"；"死灵"仅指 `nec` 学派"死灵系"）。§36 中显示英文或未解析 i18n 键（如 `SGEH.property.wep.*`）的词 = 本地化包未提供中文，**禁止自译、须走 §9 向 DM 索取**。同步把 §8 范例卡面「死灵伤害」对齐为「暗蚀伤害」。
> **v2.0 修订**：经 F12 探针（木桩 token 视野导出 + AA 6.8.1 autorec 全库 + 火球/暗影步 item flag）坐实三组此前空白结构——① **token 视野**：仅填 `senses.ranges.*` 只动卡面、token 仍是瞎的；必须同时配 `prototypeToken.sight`(enabled/range/visionMode) + `detectionModes`（感官→id 映射）。旧骨架的 `sight.enabled:false`/`detectionModes:[]` 为错误默认，本版已纠正。② **指示物命名**：`appendNumber` 默认 `false`（不加数字后缀）；普通/可成群小怪开 `prependAdjective`（只加随机形容词前缀，如「愤怒的哥布林」），具名/精英/Boss 关。③ **动画**：`flags.autoanimations` 完整 schema（melee/range/templatefx/ontoken/preset 五形态）+ 从 autorec 提炼的「招式类型→动画」调色板。详见新增 **§12**，数据见字典 v9 §33–§35。
>
> **v1.7 修订**：以 **F12 控制台 `CONFIG.DND5E` 全量 dump** 为权威源，把目标 / 模板 / 活动类型等枚举**一次性坐实**（不再靠逐个导出试探）。要点：① `target.affects.type` 完整 9 值 `self/ally/enemy/creature/willing/object/space/creatureOrObject/any` 全部坐实——**`enemy` 闭环**；② **修正旧版模板类型笔误**：`areaTargetTypes` 真值为 `radius/sphere/circle/cylinder/cube/square/wall/line/cone/emanationNoTemplate`，**系统中无 `rect`**（旧 §M3 写错，本版改正）；③ `activityTypes` 全集 `attack/cast/check/damage/enchant/forward/heal/order/save/summon/transform/utility` 坐实；④ 其余 `itemActionTypes`/`attackTypes`/`attackClassifications`/`weaponTypes`/`armorTypes`/`limitedUsePeriods` 等与字典逐一对齐盖章（详见字典 v8 §32 CONFIG 权威枚举快照）。涉及 §M1、§M3、§5.2。
>
> **v1.6 修订**：坐实「**有限次数能力的两段式配置**」与「**目标阵营筛选**」两组实测必需结构（来源：真实导出探针——焦炉守夜人炉火吐息、木桩、火球魔杖、威力法杖）。实测三处此前缺漏：① 豁免 AOE 的 `target.affects.type` **必须显式填**（否则模板里没有豁免对象，用了不掷豁免）；② 凡 item 设了充能/每日次数，该能力 **activity 内必须加 `consumption.targets:[{type:"itemUses",value:"N"}]`**，否则用了不扣 `uses.spent`，充能/次数永不消耗（表现为"用了仍满充能"）；③ **阵营筛选走 `target.affects.type`（值 `creature`/`ally`/`self`…），不是 midi 的 `autoTargetType`（后者实测恒 `"any"`）**。同步坐实 `uses.recovery` 全谱（含部分回复 `type:"formula"`+`formula` 骰子串）与多消耗（同一 item 不同 activity 可设不同 `value`，火球魔杖各环 1~7 逐发坐实）。涉及 §M3、§M4、§5.2、§6、§7、§8。
>
> **v1.5 修订**：确立「**卡面 / 日志分离**」硬规则。实测痛点：把实现说明（如"已写入抗性栏""自动生效""由DM手动判定"、某条 midi flag 的完整路径与原理解释）塞进 item 的 `description.value`，会让玩家/DM 在台面上看到一大段技术注释，污染角色卡观感。**新规：`description.value` 只写"官方风格的能力描述"——即这条能力在游戏内做什么（命中/伤害/豁免/效果/时机），不写任何实现/自动化/调试说明。** 所有"用了什么 activity/key/flag、哪条降级及原因、DM 需手动做什么、`-self` 写死 DC 等特殊配置"一律移入**随 Actor JSON 一并交付的自动化日志**（新增 §0bis）。同步把 §0 降级条、§6 自检清单、§7 禁忌、§8 范例中残留的"由DM手动判定"等实现注释从卡面清出。涉及 §0、§0bis、§6、§7、§8。
>
> **v1.4 修订**：新增「**以自身为中心的 AOE 必须排除自身**」配置。实测：自身为心的范围攻击（半径/光环式 `circle`、或从自身发出的 `cone`/`line`）默认会把**施法者本人**也算进模板，并对自己结算豁免与伤害（如「战锤震地」会震到自己）。解决：把该 activity 的 **`target.affects.special` 设为 `"-self"`**（对应 Foundry UI「目标 → 特殊目标」输入框填 `-self`）；该键对附魔/Active Effect 词条同样适用，路径一致 `activities[<id>].target.affects.special`。已补进 §M3 配方、§5.2、§6、§8 范例。涉及 §M3、§5.2、§6、§8。
>
> **v1.3 修订**：新增「**一个 item 只放一个会结算的主 activity**」硬规则。实测（见下）：把"单体攻击 activity"与"范围豁免 activity"塞进**同一个** weapon item 后，midi-qol 会借 `otherActivityCompatible`/otherActivity 合并机制把两者串成**同一张结算卡连续结算**——使用一次会先按命中结算单体伤害、再让目标做豁免、豁免失败又叠加范围伤害，一次打出本不该同时发生的**双份伤害**。正确做法：**每个会结算伤害/豁免的能力各自独立成一个 item**（单体直击一个 weapon、范围震地另一个 item），用「多重攻击」feat 描述本回合如何组合。涉及 §0、§4 通则、§6、§7。
>
> **v1.2 修订**：确立**全自动化为最高优先级**——每项能力都要尽力做成 Foundry 内可自动执行的结构，**禁止把"由DM手动判定/施加"当成偷懒出口**。新增「§0 自动化铁律」「§5.1 已验证 midi-qol flag（优势/劣势等）」「§4 M13 触发型自我增益模式」「§9 求助流程：没把握的 key 怎么办」。涉及 §0、§4、§5、§6、§9。
>
> **v1.1 修订**：修正 AC 计算规则。原 v1.0「AC 一律用 `flat`」在怪物携带会贡献 AC 的盾/甲 item 时会导致重复计算（`natural` 计算下盾牌仍在固定 AC 之上再 +2）。现区分两种写法：无加 AC 装备 → `calc:"natural"`+`flat`；持盾/穿甲 item → `calc:"default"` 并把 AC 拆进已装备护甲/盾。涉及 §0 第 5 条、§2 填写说明、§6 自检清单、附录 A2。

---

## 0. 平台与硬约束（违反即作废）

| 项 | 值 |
|---|---|
| 系统 | dnd5e **5.3.3** |
| 核心 | Foundry VTT core **13.351** |
| 自动化 | midi-qol 13.x / DAE / times-up / itemacro / ActiveAuras / Automated Evocations |
| 规则版本 | **2014**（所有 `source.rules` 一律填 `"2014"`） |
| 输出 | 单个 Actor JSON 对象，`type:"npc"` |

**自动化铁律（第一优先级，凌驾于其它所有偏好）**

> 本规范的存在目的是产出**全自动化怪物**。DM 要的是导入即用、战斗中点一下就自己跑完判定的怪物，**不是一份需要 DM 自己掷骰、自己加减、自己施加状态的说明书**。

- **每一项能力都必须尽最大努力做成 Foundry 内可自动执行的结构**：`attack` / `save` / `heal` / `utility` / `summon` activity + DAE `effect` + 已验证的 midi-qol / DAE / 系统 key。能自动的绝不写"手判"。
- **严禁把"由DM手动判定/手动施加/手动追加伤害"当作默认出口。** 这是偷懒，不是设计。看到自己正要写"由DM……"，先停下来问："这真的没有自动化路径吗？"——绝大多数常见机制（优势/劣势、额外伤害、临时增益、施加状态、抗性、移速/AC 变化）都有现成 key（见 §5、§5.1、§8.2）。
- **遇到没把握的 key/路径时，正确做法不是退回手判，而是走 §9 求助流程**：中断生成、向 DM 要精确路径（DM 可在 Foundry 里建好该效果并导出一个参考 item 给你），拿到后**把它补进 §5/§5.1 的 key 表**，从此记住、复用。
- 仅当某效果**确实无法用任何已验证 key 表达**时，才允许降级，且降级顺序为：① **一键开关 effect**（DM 点一下 effect 即生效，例如"血怒"做成可切换的 `+1d6` 伤害 effect）→ ② **itemacro 宏**（见 M7）→ ③ 最后才是手判。**任何降级都必须在「自动化日志」里注明：缺的是哪个 key、为什么没全自动、DM 需要做什么——这些写进日志，不写进 item 描述。** item 的 `description.value` 始终只放官方风格的能力描述（见 §0bis）。

**字段纪律（最重要）**

1. **只能使用本规范出现过的字段、key、flag 路径。禁止编造任何标识符。** 不确定的字段一律省略——dnd5e 5.x 导入时会用 schema 默认值补全，省略远比臆造安全。**但请注意区分两种"不确定"**：㈠ 无关紧要的 schema 字段（如某个 midiProperties 子项）→ **省略**；㈡ 实现某个能力**自动化所必需**的 key/路径（如某条优势 flag、某种伤害加值路径）→ **绝不能因为不确定就省略掉自动化、退回手判**，而要走 §9 求助流程向 DM 问清精确路径，再补进 §5/§5.1 key 表。换言之：「不臆造」约束的是**乱猜**，不是**自动化本身**。
2. `_id` 为 16 位字母数字 `[A-Za-z0-9]{16}`。**item 与 effect 的 _id 在整个 Actor 内唯一**；**activity id 仅需在所属 item 内唯一**（不同 item 之间可重名，从 `dnd5eactivity000` 起递增）。activity 的 `effects[]._id` 必须**等于**它要施加的那个 effect 在该 item 的 `effects[]` 中的 `_id`（这是引用关系，两者必须相同）。
3. `effect.origin` 一律填空字符串 `""` 或直接省略。**禁止指向任何 compendium 路径**（导入后必失效）。
4. **存盘 DC 直接在 `activity.save.dc.formula` 写死数字**（如 `"15"`），`calculation` 留空 `""`。不依赖全局法术 DC 计算。
5. **数值一律写死**：HP 给 `value`+`max`+`formula`；属性给 `value`。不依赖派生计算。**AC 分两种情况**（详见 §2 填写说明「AC 计算的两种正确写法」）：怪物**身上没有任何会贡献 AC 的装备 item** 时，用天生护甲 `ac:{ "calc":"natural", "flat":N }`；怪物**带了会加 AC 的盾/甲 item**（DM 希望在面板看到这些装备）时，**必须改用 `ac:{ "calc":"default" }` 并把 AC 来源拆进已装备的护甲/盾 item**，由系统自动算出 AC。⚠️ 切勿在 `natural`/`flat` 的固定 AC 之上再挂已装备的盾牌——`natural` 计算会让盾牌在该数字之上**再 +2**，叠加光环后 AC 被重复计算虚高（如「天生 18 + 盾 2 + 光环 1 = 21」）。
6. **midiProperties 默认省略**——仅当需要非默认 midi 行为（链式触发、强制自动目标等）时，才在该 activity 内单独写出需要的字段。
7. **`_stats.compendiumSource` 与 `_stats.duplicateSource` 一律为 `null`**（或整个省略 `_stats`）。绝不保留指向 `Scene.…Token.…` 的来源路径——这种失效 UUID 会在战斗中触发 `fromUuid` 未捕获错误，**中断数据库写入事务，表现为传奇点数不扣、流程卡死、莫名暂停**。⚠️ 特别注意：**若在场景 token 实例上编辑过某个 item，FVTT 会自动把该 token 的 UUID 写进 compendiumSource**；导出或复用前必须清除（或改在侧边栏 Actor 本体上编辑，而非画布 token 上）。
8. **一个 item 只放一个"会结算"的主 activity（与 §4 通则同一条铁律）。** "会结算"指会掷命中、掷豁免或直接造成伤害/治疗的 activity（`attack`/`save`/含 `damage` 的 / `heal`）。**禁止在同一个 item 内并列两个这类 activity**（典型错误：把"单体劈砍"和"范围横扫"塞进同一把战锤）。实测后果：midi-qol 会借其 `otherActivityCompatible`/otherActivity 合并机制把它们串成**同一张卡连续结算**——先按命中结算单体伤害 → 再让目标做豁免 → 豁免失败再叠加范围伤害，使用**一次**就打出**双份**伤害。⚠️ 注意：activity 自带的 `midiProperties.otherActivityCompatible` 默认即为 `true`（来自真实导出样本），所以**只要同一 item 里有两个会结算的 activity，默认就会被合并**，不是偶发。**正确做法：拆成两个独立 item，各放一个主 activity**（单体直击=一个 `weapon`；范围震地=另一个 item，按 M3 做 `save`+模板）。回合内打几次、打哪几个，交给「多重攻击」feat（M2）的**描述**说明，DM 分别点击对应 item 触发。（同根源亦见 §M9：传奇动作也必须独立成 item。）一个 item 内放多个 activity **仅在它们彼此不结算**时才安全——例如一个 `utility` 开关 + 它要施加的被动 effect。

> ⚠️ **勘误（2026-09-15 · 源码级 + 实机验证）**：本条**现象对、归因错**。真正触发连带的是**主活动的 `otherActivityId` 为空串** —— midi-qol 里 `attack` 的该字段默认即 `""` = **自动探测**（`check`/`save`/`utility` 默认 `"none"`）；`otherActivityCompatible` 只是**资格标记**（默认 true），只影响编辑期下拉与自动探测。
> ⇒ **把每个会结算的活动的 `otherActivityId` 显式写成 `"none"`，同一 item 内即可安全共存多个活动，不必拆物品**（显式填 id 时 midi 不复查兼容标记）。
> ✅ **已实测**：《挽歌》（attack + save 同 item）点斩不带豁免、点裂弦不带攻击、不弹「选择活动」、伤害不串、DC 正确。
> 另：13.0.55 已**不存在**「自动合并行动」设置（`autoMergeActivityOther` 自 12.4.31 起从源码移除，只剩 i18n 文案）。
> 详见 `搓怪物做效果做mod任何时候，看到了一定要看仔细看\midi-otherActivity-源码级结论.md`。§0 摘要版同样适用本勘误。

---

## 0bis. 描述纪律与自动化日志（卡面 / 日志分离 · v1.5 新增）

> 一句话：**卡面是给桌上玩家看的规则文本，日志是给 DM / 实现者看的技术档案。** 凡"玩家不需要知道、只有搭建怪物的人才关心"的内容，一律进日志、不进卡面。

### A. 卡面描述纪律 —— `description.value` 只放官方风格能力描述

每个 item 的 `system.description.value` 只写"这条能力在游戏内做什么"，用官方怪物档案（stat block）的口吻：动作类型、触及 / 射程、命中或豁免（属性 + DC）、伤害骰与类型、附加效果与持续时间、触发时机。用 HTML（`<p>` / `<strong>` / `<ul>` / `<li>`）排版即可。

**术语用词（硬规则）**：卡面与 `item.name` 内一切玩家可见术语——伤害类型、状态、属性、技能、法术学派、生物类型、物品属性——**必须逐字照《数据字典》§36 术语对照表（国内官方译名 / 本地化包权威源）**，不得凭记忆自译。高频易错：`psychic`=**心灵**（非"精神"）、`necrotic`=**暗蚀**（非"死灵"；"死灵"仅指 `nec` 学派"死灵系"）。**§36 中显示英文或未解析 i18n 键（如 `SGEH.property.wep.*`）的词 = 本地化包未提供中文，禁止自行翻译，须走 §9 向 DM 索取**。注意：代码字段（`damage.*.types`、`traits.*.value` 等）仍填英文 key，本规则只约束**给玩家看的文字**。

**怪物命名风格（硬规则 · v2.1 新增）**：怪物 / NPC 的 `name` 与 `prototypeToken.name` 用**简短的描述性称号**，不要凭空编造人名。

- **格式**：`中文称号 English Title`，中英之间一个空格、**无缝拼接、无括号**（如 `多重攻击 Multiattack` 的拼法）。
- **要点**：① 中文称号 = 简短的**风格修饰 + 角色名词**，2–6 字为宜，例如 `提线剑姬`、`焰纹剑客`、`残烬暴徒`、`赤喉刺客`、`枯井的药徒`、`碎月之刃`（参照范式：`XX剑姬` / `XX暴徒` / `XX之X` / `XX的X徒` / `XX刺客`）。② **禁止**给怪物起凭空人名（如"维瑞莎""卡维斯"这类自造名字）——除非 DM 明确要求具名 NPC 并给出名字。③ **禁止**用"者"作角色后缀（如"复仇者""守望者"）——`者` 一律换成更具画面感的角色名词（姬 / 客 / 徒 / 卫 / 刃 / 巫 / 屠 / 徒 / 傀 等）或"之X"结构。
- **正例**：`提线剑姬 Marionette Bladedancer`、`焰纹剑客 Emberglyph Blade`、`枯冢守卫 Barrow Sentinel`。
- **反例**：`提线复仇者维瑞莎 Vressa the Marionette Avenger`（含自造人名 + "者"）、`秘法魔剑士 Arcane Spellblade`（"士"类职业标签，平淡，建议改 `符火剑客` 一类）。

**禁止写进 `description.value`（一律移入日志）：**

- 实现 / 调试注释："已写入抗性栏""自动生效""已做成 DAE effect""通过 activity.effects 引用"等。
- 任何 midi-qol / DAE / 系统 key 或 flag 的路径与原理解释（如 `flags.midi-qol.advantage.attack.mwak` 是什么、为何这样配）。
- "由DM手动判定 / 由DM手动施加 / DM 需要……"这类操作指引。
- 降级说明（缺哪个 key、为什么没全自动、降到了哪一级）。
- `-self`、写死 DC、HP 按 4 人计算等"为什么这么填"的技术备注。

**正例（官方风格，✅）**：`<p>近战武器攻击：触及 10 尺，单一目标。命中：2d8+6 钝击伤害，外加 1d8 火焰伤害。</p>`

**反例（含实现注释，❌）**：`<p>近战武器攻击……（已做成 attack activity，includeBase=true，火焰走 damage.parts；DM 直接点此 item 触发）。</p>`

> 被动 / 抗性类能力同理：卡面写"该生物对毒素伤害免疫。"即可，**不写**"已写入抗性栏、自动生效，原版优势抗毒未做自动化、如需请导出参考 Active Effect"——这些进日志。

### B. 自动化日志 —— 每只怪物必交付的第二份产物

生成 Actor JSON 时，**同时**输出一份「自动化日志」（Markdown 即可，与 JSON 一并交付，**不写进 JSON 内部**）。日志至少包含：

1. **怪物概览**：名称、CR、体型、AC 写法（`natural` / `default` 及原因）、HP（若为动态公式，注明按 4 人 = N 计算）、传奇 / 巢穴 / 光环 / 召唤是否启用。
2. **逐能力实现表**：每条能力一块，记录——
   - 能力名（与卡面一致）
   - item 类型（`feat` / `weapon` / `spell`）+ 主 activity 类型（`attack` / `save` / `heal` / `utility` / `summon` / 无）
   - 用到的关键 key / flag / 模板（如 `flags.midi-qol.advantage.attack.mwak`、`target.template = cone 60ft`、`save.dc.formula = "17"`、充能 `recharge 5`）
   - 自动化程度：**全自动** / **降级**（注明降到哪级：开关 effect → 宏 → 手判，及原因）
   - **DM 需手动做什么**（若有）
   - 特殊配置备注（`-self` 排除自身、写死 DC、伤害按 4 人估算等）
3. **待补 / 求助项**：任何按 §9 需向 DM 索要的精确 key / 路径、召唤物 compendium UUID、world UUID 等占位。

> 日志把原本会污染卡面的全部技术信息收纳成一处：DM 一眼看清"哪条全自动、哪条要自己点、缺什么"，而卡面保持干净。

---

## 1. 输入契约：DM 需要提供什么

AI 在生成前，应确认已掌握以下信息；缺失项向 DM 索要，**不要替 DM 猜数值**。

- **身份**：中/英文名、体型（tiny/sm/med/lg/huge/garg）、类型（如 `dragon`/`fiend`/`aberration`）、阵营、CR
- **核心数值**：六维（str/dex/con/int/wis/cha）、AC、HP（数值或 HD 公式如 `19d12+133`）、熟练加值
- **移动**：walk / fly / swim / climb / burrow（ft）
- **感官**：darkvision / blindsight / tremorsense / truesight（ft），被动察觉
- **防御**：伤害抗性 `dr` / 免疫 `di` / 易伤 `dv` / 状态免疫 `ci`
- **熟练**：豁免熟练的属性、技能熟练
- **语言**
- **能力清单**：每条 = 名称 + 动作类型（动作 / 附赠 / 反应 / 传奇 / 巢穴 / 被动）+ 机制描述（命中/伤害/豁免/效果）
- **施法（如有）**：施法属性、法术 DC、各环法术位数、法术列表
- **传奇（如有）**：传奇动作点数（legact.max）、传奇抗性次数（legres.max）、各传奇动作及消耗点数
- **巢穴（如有）**：巢穴动作内容（先攻 20 触发）
- **召唤（如有）**：召唤物的 **compendium UUID**、数量、召唤动画名
- **光环（如有）**：半径、影响对象（盟友/敌人/全体）、增益/减益内容
- **自动化深度**：基础（命中伤害豁免）/ 带 DAE 状态 / 带 itemacro 复杂逻辑

---

## 2. Actor 顶层骨架

下面是必填核心结构（占位用 `<<...>>`）。未列出的子字段可省略，导入时补默认。

```json
{
  "name": "<<中文名 English Name>>",
  "type": "npc",
  "img": "<<token或portrait图片路径，可留默认>>",
  "system": {
    "abilities": {
      "str": { "value": 0, "proficient": 0 },
      "dex": { "value": 0, "proficient": 0 },
      "con": { "value": 0, "proficient": 0 },
      "int": { "value": 0, "proficient": 0 },
      "wis": { "value": 0, "proficient": 0 },
      "cha": { "value": 0, "proficient": 0 }
    },
    "attributes": {
      "ac": { "flat": 0, "calc": "natural", "formula": "" },
      "hp": { "value": 0, "max": 0, "temp": null, "tempmax": null, "formula": "" },
      "init": { "ability": "", "bonus": "0" },
      "movement": { "walk": "0", "fly": "0", "swim": "0", "climb": "0", "burrow": "0", "units": "ft", "hover": false },
      "senses": { "ranges": { "darkvision": null, "blindsight": null, "tremorsense": null, "truesight": null }, "units": "ft", "special": "" },
      "spellcasting": "",
      "spell": { "level": 0 }
    },
    "details": {
      "alignment": "<<如 Chaotic Evil>>",
      "type": { "value": "<<如 dragon>>", "subtype": "", "swarm": "", "custom": "" },
      "cr": 0,
      "biography": { "value": "<<HTML 描述，可空>>", "public": "" }
    },
    "traits": {
      "size": "<<tiny|sm|med|lg|huge|grg>>",
      "di": { "value": [], "bypasses": [], "custom": "" },
      "dr": { "value": [], "bypasses": [], "custom": "" },
      "dv": { "value": [], "bypasses": [], "custom": "" },
      "ci": { "value": [], "custom": "" },
      "languages": { "value": [], "custom": "" }
    },
    "skills": {},
    "spells": {},
    "resources": {},
    "source": { "rules": "2014", "license": "" }
  },
  "prototypeToken": { },
  "items": [],
  "effects": [],
  "flags": {}
}
```

**填写说明**

- `senses`：**dnd5e 5.3 已把感官移入 `ranges` 子对象**——必须写成 `senses.ranges.darkvision`，不能用扁平的 `senses.darkvision`（后者会触发迁移警告）。无该感官时填 `null`，有则填数字（单位由 `units` 定，如 `"ft"`）。
- **AC 计算的两种正确写法（避免盾牌/光环重复叠加）**：dnd5e 在 `natural` 计算下，**任何已装备的盾牌 item 都会在固定 AC 之上再 +2**，因此 AC 的写法必须与怪物身上的装备匹配：
  - **纯天生护甲**（怪物没有任何贡献 AC 的装备 item，绝大多数怪物属此类）：`ac:{ "calc":"natural", "flat":N }`，`N` 直接写最终 AC。骨架默认即此写法。
  - **带护甲/盾 item 的怪物**（持盾、穿甲，且 DM 希望在面板上看到这些装备）：改用 `ac:{ "calc":"default", "flat":N }`（此写法下 `flat` 被忽略，可保留亦可删），**把 AC 拆进已装备的护甲与盾 item**——护甲 item 填 `armor.value`（如锁子甲 16、胸甲 14），盾 item 填 `type.value:"shield"` + `armor.value:2`，二者 `equipped:true`。系统按「护甲基础 + 敏捷(受类别上限) + 盾」自动算出 AC，盾牌只计一次；后续光环 `+1 AC`（如 §M12）也只在此正确基础上叠加。
  - **判定口诀**：身上没有加 AC 的 item → `natural`+`flat`；身上有盾或甲 item → `default` + 数值写进装备。错用 `natural` 会让「天生 18 + 已装备盾 2 + 光环 1 = 21」这种虚高发生。
- `traits.di/dr/dv` 的 `value` 用伤害类型字符串数组，如 `["fire"]`、`["bludgeoning","piercing","slashing"]`。`ci` 用状态字符串，如 `["frightened","charmed"]`。
- `languages.value` 用语言 key 数组，如 `["common","draconic"]`。
- 豁免熟练：在对应 ability 设 `"proficient": 1`。
- 技能熟练：写进 `skills`，如 `"per": { "value": 1, "ability": "wis" }`（value 1=熟练，2=专精）。
- **施法者**额外填：`attributes.spellcasting`（如 `"wis"`）、`spells`（见 M8）、`spell.level`（怪物施法者等级）。
- **传奇/巢穴**额外填 `resources`（见 M9/M10）。

---

## 3. prototypeToken 骨架 + 尺寸映射

```json
"prototypeToken": {
  "name": "<<token名>>",
  "displayName": 20,
  "actorLink": false,
  "width": 1,
  "height": 1,
  "disposition": -1,
  "displayBars": 20,
  "bar1": { "attribute": "attributes.hp" },
  "bar2": { "attribute": "" },
  "appendNumber": false,
  "prependAdjective": true,
  "sight": { "enabled": true, "range": 60, "angle": 360, "visionMode": "darkvision", "color": null, "attenuation": 0.1, "brightness": 0, "saturation": 0, "contrast": 0 },
  "detectionModes": [
    { "id": "lightPerception", "range": 60, "enabled": true },
    { "id": "basicSight", "range": 60, "enabled": true }
  ],
  "texture": { "src": "<<token图片路径>>", "scaleX": 1, "scaleY": 1, "fit": "contain" },
  "disposition": -1
}
```

**尺寸映射表**（`traits.size` → token `width`/`height`）

| size | width/height |
|---|---|
| tiny | 0.5 |
| sm / med | 1 |
| lg | 2 |
| huge | 3 |
| grg | 4 |

> **视野 / 命名 / 动画**：`prototypeToken` 还须按 **§12** 配置 token 视野（`sight`+`detectionModes`，否则 token 看不见）、指示物命名（`appendNumber`/`prependAdjective`）、以及（可选）`flags.autoanimations` 动画。
| grg | 4 |

`disposition`：敌对 `-1`，中立 `0`，友好 `1`。
**带传奇动作的怪物**，把 `bar2.attribute` 设为 `"resources.legact"`，方便台面查看剩余传奇点数。

---

## 4. 能力 → Item 模式库

每个能力对应 `items[]` 里的一个 item（`feat`/`weapon`/`spell`）。item 内 `system.activities` 是对象，key 为 activity id。下面给出各模式的最小可用配方。

> **§4 通则（务必先读）：一个 item = 一个会结算的主 activity。**
>
> 每个会**掷命中 / 掷豁免 / 造成伤害**的能力，都**各自独立成一个 item**。**不要**为了"把战锤的单体劈砍和范围横扫放在一起"而在同一个 weapon 里并列 `attack` + `save` 两个 activity——实测 midi-qol 会把它们合并成**同一张卡连续结算**：命中 → 单体伤害 → 目标豁免 → 失败再吃范围伤害，使用一次打出双份伤害（根源见 §0 第 8 条）。
>
> 正确拆法：**范围攻击单独做成一个 item（M3 `save`+模板）**；**单体攻击单独一个 `weapon`（M1）**；再用**「多重攻击」（M2）**的描述说明本回合如何组合点击。一个 item 内可以有多个 activity，但前提是它们**彼此不结算**（如 `utility` 开关 + 被动 effect）。

### M1 · 近战/远程武器攻击（attack）

item `type:"weapon"`。武器**基础伤害**写在 `system.damage.base`，activity 的 `damage.includeBase:true` 会自动并入。额外伤害（如附加火焰）写进 activity 的 `damage.parts`。

```json
{
  "_id": "<<16位ID>>",
  "name": "啃咬 Bite",
  "type": "weapon",
  "img": "<<图标>>",
  "system": {
    "equipped": true,
    "proficient": 1,
    "type": { "value": "natural", "baseItem": "" },
    "range": { "value": null, "long": null, "units": "ft", "reach": 10 },
    "damage": {
      "base": { "number": 2, "denomination": 10, "bonus": "", "types": ["piercing"] }
    },
    "activities": {
      "dnd5eactivity000": {
        "_id": "dnd5eactivity000",
        "type": "attack",
        "activation": { "type": "action", "value": 1 },
        "range": { "value": "10", "units": "ft" },
        "attack": { "ability": "str", "bonus": "", "type": { "value": "melee", "classification": "weapon" } },
        "damage": {
          "includeBase": true,
          "parts": [
            { "number": 2, "denomination": 6, "bonus": "", "types": ["fire"] }
          ]
        }
      }
    },
    "source": { "rules": "2014" }
  }
}
```

**变量**：`damage.base` = 基础骰（如 2d10 穿刺）；`attack.ability` = str/dex；`attack.type.value` = `melee`/`ranged`；远程武器 `range.value/long` 填射程；`damage.parts` 仅放**额外**伤害类型，无则填 `[]`。命中加值靠 `attack.ability` + `proficient` 自动算，特殊加值写 `attack.bonus`。

### M2 · 多重攻击（feat）

纯说明性条目，`type:"feat"`，无 activity（或仅放一段不掷骰的 `utility`）。描述里写明本回合发动几次哪些攻击。dnd5e 5.x 不自动连击，DM 手动点对应武器。

```json
{
  "_id": "<<16位ID>>",
  "name": "多重攻击 Multiattack",
  "type": "feat",
  "system": {
    "description": { "value": "<<该怪进行一次啃咬和两次爪击。>>" },
    "activities": {},
    "source": { "rules": "2014" }
  }
}
```

### M3 · 豁免 AOE 伤害（save + 模板）

```json
{
  "_id": "<<16位ID>>",
  "name": "火焰吐息 Fire Breath",
  "type": "feat",
  "system": {
    "uses": { "max": "1", "recovery": [ { "period": "recharge", "formula": "5", "type": "recoverAll" } ], "spent": 0 },
    "activities": {
      "dnd5eactivity000": {
        "_id": "dnd5eactivity000",
        "type": "save",
        "activation": { "type": "action", "value": 1 },
        "consumption": { "targets": [ { "type": "itemUses", "value": "1" } ] },
        "save": { "ability": ["dex"], "dc": { "calculation": "", "formula": "21" } },
        "damage": { "onSave": "half", "parts": [ { "number": 18, "denomination": 6, "bonus": "", "types": ["fire"] } ] },
        "target": { "affects": { "type": "self", "special": "-self" }, "template": { "type": "cone", "size": "60", "units": "ft" } }
      }
    },
    "source": { "rules": "2014" }
  }
}
```

**变量**：`save.ability`（数组，如 `["dex"]`）；`save.dc.formula` **写死数字**；`target.template.type`（已坐实全集）= `radius`(半径) / `sphere`(球状) / `circle`(圆形) / `cylinder`(柱状) / `cube`(立方) / `square`(方形) / `wall`(墙形) / `line`(线状·另填 `width`) / `cone`(锥状) / `emanationNoTemplate`(光环·无测量板)，`size` 填尺寸；伤害写 `damage.parts`，半伤填 `damage.onSave:"half"`。**注意：系统无 `rect`**，矩形用 `square`/`cube`/`wall`。

> ⚠️ **v1.6 实测必填两处（缺则功能不生效）：**
> 1. **`target.affects.type` 必须显式填**，否则模板里没有"豁免对象"，用了**不掷豁免**。已坐实全集（§5.2）：`"self"`(以自身为模板原点) / `"creature"`(全体生物) / `"ally"`(仅友军) / `"enemy"`(仅敌方) / `"willing"`(自愿生物) / `"object"`(物件) / `"space"`(空间) / `"creatureOrObject"` / `"any"`(任意)。**自身为心的模板 AoE（spellfire/cone/line/radius 从自身发出）须用 `type:"self"` 让模板以施法者为原点展开**，配 `special:"-self"` 在此基础上排除自身。非自身为心的 AoE 按需选 `creature`/`enemy`/`ally` 等。
> 2. **凡 item 设了 `uses`（充能/每日次数），该 activity 内必须加 `consumption.targets:[{ "type":"itemUses", "value":"1" }]`**，否则用了**不扣 `uses.spent`**，充能/次数永不消耗（详见 §M4）。无限次数的 AOE 则不需要 `consumption.targets`，但 `affects.type` 仍要填。

> ⚠️ **以自身为中心的 AOE 必须写 `type:"self"` + `special:"-self"`（v2.2 修正）**。自身为心的范围（半径/光环式 `circle`，或从自身发出的 `cone`/`line`）配置为：`"affects": { "type": "self", "special": "-self" }`。其中 `type:"self"` 表示模板以施法者自身为原点展开，`special:"-self"` 再将施法者本人从受影响目标中排除。**禁止用 `type:"creature"`+`special:"-self"`**——实测 `type:"creature"` 配自身为心模板时 `-self` 不生效，施法者仍会被卷入。附魔 / Active Effect 词条同理。（投射到远处的 `cone`/`line`/`square` 原点不在施法者身上，不需此规则。）

> ⚠️ **范围攻击务必单独成 item，不要和同名武器的单体攻击合并在一个 item 内**（否则 midi 会串卡、一次使用双重结算——见 §0 第 8 条 / §4 通则）。即便它们共用一把"战锤"，也应拆为「战锤·单体直击」（M1 `weapon`）与「战锤·范围震地」（本模块 `save`）两个独立 item。

### M4 · 充能 / 每日次数 / 部分回复（uses.recovery + consumption）

**有限次数能力 = 两段式配置，缺一不可：**
- **① item 级 `system.uses`** 定义池子与怎么恢复（`max` 池大小、`recovery[]`、`spent:0`）。
- **② activity 级 `consumption.targets`** 定义这一下消耗几格——**必须加**，否则用了不扣 `uses.spent`，充能/次数永不消耗（实测"用了仍满充能"的根因）：`"consumption": { "targets": [ { "type": "itemUses", "value": "1" } ] }`。

> **`max`（池大小）与 `consumption.targets[].value`（每次消耗）相互独立。** 同一 item 的不同 activity 可设不同 `value`：火球魔杖一个 7 格池子，七个施法 activity 分别消耗 1/2/3/4/5/6/7 格（各环火球）；"大招吃 2 格"就把那条 activity 的 `value` 写 `"2"`，小招仍 `"1"`。

**`uses.recovery[].period`（恢复周期，已坐实）**：`recharge`(充能) `sr`(短休) `lr`(长休) `day`(每日) `dawn`(黎明) `dusk`(黄昏) `initiative`(先攻时) `turnStart` `turnEnd` `turn`。

**`uses.recovery[].type`（恢复方式，已坐实）**：
- `"recoverAll"` —— 回满到 `max`。配 `recharge` 还要 `formula`（d6 触发下限，≥ 该值即回满）。
- `"formula"` + `"formula":"<骰子串>"` —— **部分回复**：回复掷出的格数（魔杖/法杖那种）。坐实样本：火球魔杖 `{ "period":"lr", "type":"formula", "formula":"1d6+1" }`；威力法杖 `{ "period":"dawn", "type":"formula", "formula":"2d8+4" }`。

**即用配方（逐字可抄）**：

```text
充能 5-6（单格池·d6≥5回满）
"uses": { "max": "1", "spent": 0, "recovery": [ { "period": "recharge", "formula": "5", "type": "recoverAll" } ] }
  └ 充能 2-6 → formula "2"；充能 6 → formula "6"

N 次 / 长休回满（你举的例：6 次长休）
"uses": { "max": "6", "spent": 0, "recovery": [ { "period": "lr", "type": "recoverAll" } ] }
  └ 短休 "sr"、每日 "day"、黎明 "dawn"、先攻时 "initiative"，结构同（按周期回满不需 formula）

部分回复（魔杖/法杖：黎明回 2d8+4 格）
"uses": { "max": "20", "spent": 0, "recovery": [ { "period": "dawn", "type": "formula", "formula": "2d8+4" } ] }

叠加恢复（recovery 是数组，可多条：充能 5-6 且长休强制回满）
"recovery": [ { "period": "recharge", "formula": "5", "type": "recoverAll" }, { "period": "lr", "type": "recoverAll" } ]
```

> 以上每条都必须在能力的 **activity 内**配 `consumption.targets:[{ "type":"itemUses", "value":"1" }]`（多消耗改 `value`），才会真正扣格。

### M5 · 被动特性 / 抗性（transfer effect）

被动靠 item 上挂一个 `transfer:true` 的 effect，自动施加给拥有者。例：标记一个自定义 flag、或直接改属性。

```json
{
  "_id": "<<16位ID>>",
  "name": "<<被动名，如 史诗首领>>",
  "type": "feat",
  "system": { "description": { "value": "<<规则文本>>" }, "activities": {}, "source": { "rules": "2014" } },
  "effects": [
    {
      "_id": "<<16位ID>>",
      "name": "<<效果名>>",
      "img": "<<图标>>",
      "type": "base",
      "transfer": true,
      "disabled": false,
      "origin": "",
      "changes": [
        { "key": "system.attributes.ac.bonus", "mode": 2, "value": "2", "priority": 20 }
      ],
      "duration": {},
      "statuses": []
    }
  ]
}
```

`changes` 的 key/mode 见 **第 5 节 DAE 速查**。

### M6 · 施加状态 / debuff（activity.effects → DAE effect）

主动能力命中/失败豁免后给目标挂状态：在 item 上定义一个**非 transfer** 的 effect，并在 activity 的 `effects` 数组里**引用其 _id**。

```json
{
  "_id": "<<16位ID>>",
  "name": "<<能力名>>",
  "type": "feat",
  "system": {
    "activities": {
      "dnd5eactivity000": {
        "_id": "dnd5eactivity000",
        "type": "save",
        "activation": { "type": "action", "value": 1 },
        "save": { "ability": ["con"], "dc": { "calculation": "", "formula": "15" } },
        "effects": [ { "_id": "<<下面effect的_id>>" } ]
      }
    },
    "source": { "rules": "2014" }
  },
  "effects": [
    {
      "_id": "<<16位ID，与上面引用一致>>",
      "name": "中毒",
      "img": "<<图标>>",
      "type": "base",
      "transfer": false,
      "disabled": false,
      "origin": "",
      "statuses": ["poisoned"],
      "changes": [],
      "duration": { "seconds": 60 }
    }
  ]
}
```

**要点**：施加纯状态（如中毒/恐慌）时，`statuses` 填状态 key 即可，midi 会处理豁免成功不施加。需要数值增益减益时再加 `changes`。

### M7 · 临时HP / 再生 / 复杂逻辑（itemacro）

需要脚本逻辑（如赋予临时 HP、回合开始回血）时，宏体**双写**于 `flags.dae.macro` 与 `flags.itemacro.macro`，由 `flags.midi-qol.onUseMacroName` 触发。

```json
{
  "_id": "<<16位ID>>",
  "name": "<<能力名>>",
  "type": "feat",
  "system": { "activities": { "...": "..." }, "source": { "rules": "2014" } },
  "flags": {
    "midi-qol": { "onUseMacroName": "[postActiveEffects]ItemMacro" },
    "itemacro": { "macro": { "command": "<<宏代码字符串>>" } },
    "dae": { "macro": { "name": "<<能力名>>", "img": "<<图标>>", "type": "script", "scope": "global", "command": "<<与itemacro相同的宏代码>>" } }
  }
}
```

`onUseMacroName` 时点：`[postActiveEffects]`（效果应用后）、`[preDamageRoll]`、`[postDamageRoll]` 等。宏体内 `args[0]` 为 `"on"`/`"off"`，`args[args.length-1]` 含 `tokenId` 等上下文。**宏代码须能通过 `new Function()` 语法校验**。

### M8 · 施法者（spellcasting + spell items）

Actor 顶层设：

```json
"attributes": { "spellcasting": "wis", "spell": { "level": 5 } },
"spells": {
  "spell1": { "value": 4, "override": 4 },
  "spell2": { "value": 3, "override": 3 },
  "spell3": { "value": 2, "override": 2 }
}
```

每个法术作为 `type:"spell"` 的 item：

```json
{
  "_id": "<<16位ID>>",
  "name": "灵体卫士 Spirit Guardians",
  "type": "spell",
  "system": {
    "level": 3,
    "school": "con",
    "method": "spell",
    "prepared": 1,
    "properties": ["vocal", "somatic", "concentration"],
    "activation": { "type": "action", "value": 1 },
    "duration": { "value": "10", "units": "minute" },
    "activities": { "...": "<<按 M1/M3/M6 配 activity>>" },
    "source": { "rules": "2014" }
  }
}
```

`school` 缩写：abj/con/div/enc/evo/ill/nec/trs。法术内的存盘 DC 同样**写死**在 activity（或留空让其用全局 spellcasting，但写死最稳）。

**法术处理总则（官方只列、自创才写 · v2.0.2 硬规则）**

判定一个法术是否"官方"：以资料库 **《5E万法大全》法术清单**为准——清单中存在（按**英文名**匹配）即官方法术。

- **官方法术（清单中有）**：**绝不手写**其描述 / activity / effect / 任何机制（伤害骰、豁免、射程、范围、特殊规则），**也不放进 Actor JSON**。手写官方法术机制极易出错，且 DM 的 FVTT 内已有权威且配好自动化的版本。**交付方式（v2.1 升级·优先）**：改用 DM 世界包的现成版本——见下「**世界包法术挂接工作流**」，按 UUID 从世界包自动挂接，DM 不必手拖、不必删改。**即便火球术、火焰箭这类最常见法术，只要在清单中，一律只列不写。**

**世界包法术挂接工作流（v2.1 · 替代"手拖" / "只列清单"）**

> 来源坐实：用户改版卡（魔剑士）——把手写的 Fire Bolt/Shocking Grasp/Shatter 等换成世界包版本后，每条 spell item 的 `_stats.compendiumSource` 指向其 compendium UUID（如 `Compendium.dnd5e_classpack.new-icon.Item.Oa5hMlxdpwLNtLWp`）。**Foundry 的 Actor JSON 无法"惰性引用"compendium 法术（导入只会原样嵌入 items[]，不会按 UUID 现取）**，所以正确做法不是把法术写进卡，而是：

1. **Actor JSON 精简**：`items[]` 内**只放自创法术 / 自定义能力**；官方法术**一条都不写**（连 stub 都不建）。但**保留施法者配置**：`attributes.spellcasting`、`attributes.spell.level`（注意按 CR 设对，过高会派生多余高环法术位）、`spells.spellN`（各环法术位）。
2. **随怪交付一个「挂接宏」**（标准 Foundry 脚本宏，不写进 JSON）：导入精简卡后，DM 在画布上选中该怪 token、执行宏，宏按 compendium UUID 从世界包 `fromUuid()` 取出带真自动化的法术、`createEmbeddedDocuments("Item", …)` 挂到该 Actor 上；按 `_stats.compendiumSource` / 同名去重，可重复运行。模板：

```javascript
const SPELLS = [
  ["火焰箭 Fire Bolt", "Compendium.dnd5e_classpack.new-icon.Item.Oa5hMlxdpwLNtLWp"],
  /* …更多 [显示名, 完整UUID]，UUID 取自字典 §37 UUID 库… */
];
const actor = canvas.tokens.controlled[0]?.actor;
if (!actor) { ui.notifications.warn("先在画布上选中该怪 token"); }
else {
  const toAdd = [];
  for (const [label, uuid] of SPELLS) {
    const src = await fromUuid(uuid);
    if (!src) { ui.notifications.warn(`未找到：${label}`); continue; }
    if (actor.items.some(i => foundry.utils.getProperty(i,"_stats.compendiumSource")===uuid || i.name===src.name)) continue;
    const obj = src.toObject();
    foundry.utils.setProperty(obj, "_stats.compendiumSource", uuid);
    toAdd.push(obj);
  }
  if (toAdd.length) await actor.createEmbeddedDocuments("Item", toAdd);
  ui.notifications.info(`已挂接 ${toAdd.length} 个世界包法术`);
}
```

3. **UUID 从哪来**：见**字典 §37「法术 / 物品 UUID 库」**（DM 用 F12 一次性导出的全库 name→UUID，跨 50 个包、2900+ 条）。优先选**带自动化的包**：`dnd5e_classpack` / `chris-premades.CPRSpells(2024)` / `gambits-premades.gps-spells` / `dlkhm-spell-tools-item` / `midi-item-showcase-community`，其次官方 `dnd5e.spells(24)`。§37 没有的法术，按 §9 让 DM 在世界里拖一次该法术再导出、把 `_stats.compendiumSource` 给你，追加进 §37 即可。
4. **AI 不能自取**：AI 无法直连 DM 的实时世界 / 浏览器 F12 控制台去现探；§37 的 UUID 库即"探针结果"，由 DM 跑一次导出宏喂给 AI，之后长期复用。
- **自创 / 魔改法术（清单中没有，或对官方法术做了非标准改动）**：**必须完整手写**——spell item 外壳（§6bis）+ activity（命中 / 豁免 / 伤害 / 模板，§M1/M3/M6）+ effect（上状态 / 增益），做满自动化，与怪物自定义能力同等对待。

**怪物施法者交付格式**：
1. Actor JSON 内**保留施法者配置**：`attributes.spellcasting`、`attributes.spell.level`、`spells.spellN`（各环法术位），以及一个「施法 Spellcasting」描述性 feat（官方风格写明 DC / 法术攻击 / 已备法术名——此 feat 的法术名清单即等于交付给 DM 的官方法术清单）。
2. Actor JSON 的 `items[]` 内**只放自创法术的 spell item**；官方法术**不建任何 item（连 stub 都不建）**。
3. 随怪交付**官方法术清单**，DM 据此补入自有版本。

> 本则收紧并取代字典 §6bis F / §18 旧做法中"为官方法术建 stub item 再用 CPR 医药箱匹配"的部分——现在官方法术连 stub 都不建，直接列清单交 DM。上方 §M8 的 `灵体卫士 Spirit Guardians` 仅作 spell item **外壳结构示意**；它本身是官方法术，按本则实际不应写进 JSON、只列清单。

### M9 · 传奇动作（legact + activation.type:"legendary"）

**无需自动化脚本**——纯数值配置，系统自动扣点。

Actor 顶层：

```json
"resources": {
  "legact": { "max": 3, "spent": 0 },
  "legres": { "max": 3, "spent": 0 }
}
```

⚠️ **传奇动作必须写成独立的 item，绝不能与基础动作共用同一个 item。** 若一个 item 同时含 `action` 和 `legendary` 两种 activity，系统会把基础动作也列进传奇动作面板，点它走的是普通 activity → **不扣传奇点**。正确做法：基础攻击一个 item，传奇版「强击」另起一个独立 item（参考官方红龙——基础「尾击 Tail」与传奇「尾击攻击 Tail Attack」是两个分开的 weapon）。

独立传奇 item 内的 activity，把 `activation` 设为：

```json
"activation": { "type": "legendary", "value": 1 }
```

`value` = 消耗的传奇点数。系统识别 `legendary` 激活后自动从 `legact` 扣点。另放一条纯说明 feat「传奇动作」描述规则文本（无 activity）。

### M10 · 巢穴动作（lair resource）

Actor 顶层：

```json
"resources": { "lair": { "value": true, "initiative": 20, "inside": false } }
```

巢穴动作能力的 activity 用 `"activation": { "type": "lair", "value": 1 }`。先攻 20 由 DM 手动触发执行。

### M11 · 召唤（summon activity + Automated Evocations）

**主用**原生 summon activity，`profiles[].uuid` 填召唤物的 **compendium UUID**（稳定可预填、导入即用）：

```json
{
  "_id": "<<16位ID>>",
  "name": "放狗 Release the Hounds",
  "type": "feat",
  "system": {
    "activities": {
      "dnd5eactivity000": {
        "_id": "dnd5eactivity000",
        "type": "summon",
        "activation": { "type": "action", "value": 1 },
        "summon": { "prompt": true, "mode": "" },
        "profiles": [
          { "_id": "<<16位ID>>", "count": "2", "name": "", "uuid": "Compendium.your-dm-toolkit.your-actors.Actor.<<召唤物ID>>", "types": [] }
        ]
      }
    },
    "source": { "rules": "2014" }
  }
}
```

**可选增强**——召唤动画走 Automated Evocations，加在 **Actor 顶层** `flags`：

```json
"flags": {
  "automated-evocations": { "companions": [ { "id": "Actor.<<world UUID>>", "number": "2", "animation": "magic2" } ] }
}
```

> DM 提供：召唤物 compendium UUID（compendium 内右键 → Copy UUID）、数量、动画名。world UUID 若未知可省略 automated-evocations，导入后在面板手动选。

### M12 · 光环（effect type:"auraeffects.aura" + ActiveAuras flag）

光环 = item 上一个 `transfer:true` 的特殊 effect。**注意 `type` 是 `"auraeffects.aura"` 不是 `base`**。

```json
{
  "_id": "<<16位ID>>",
  "name": "冲锋阵型 Charge Aura",
  "type": "feat",
  "system": { "description": { "value": "<<光环说明>>" }, "activities": {}, "source": { "rules": "2014" } },
  "effects": [
    {
      "_id": "<<16位ID>>",
      "name": "冲锋阵型 (+10尺移速)",
      "img": "<<图标>>",
      "type": "auraeffects.aura",
      "transfer": true,
      "disabled": false,
      "origin": "",
      "duration": {},
      "statuses": [],
      "changes": [
        { "key": "system.attributes.movement.walk", "mode": 2, "value": "10", "priority": 20 }
      ],
      "flags": {
        "ActiveAuras": { "isAura": true, "aura": "Allies", "radius": "15", "ignoreSelf": true, "hostile": false, "wallsBlock": "system", "displayTemp": true },
        "auraeffects": { "originalType": "base" }
      }
    }
  ]
}
```

**变量**：`ActiveAuras.aura` = `"Allies"`/`"Enemy"`/`"All"`；`radius` = 半径（ft，字符串）；`changes` 放给范围内单位的增益减益。

### M13 · 触发型自我增益（utility activity 挂 round 时长 effect）

用于「**在回合开始时/触发时，自己获得某增益直到下回合**」这类能力（鲁莽攻击、狂暴、蓄力、架势切换等）。**这是把"由DM手动施加优势/状态"变成全自动的标准做法**：一个 `utility` activity（自身目标、`activation.type:"special"` 特殊时机、时长 1 回合），点击后给自己挂上一条或多条 round 时长的 effect，effect 用 midi/DAE key 表达实际增益。

下面是「鲁莽攻击」的最小自动化配方（自身近战攻击获得优势，代价是敌人攻击自己也获得优势，持续到下回合开始）：

```json
{
  "_id": "<<16位ID>>",
  "name": "鲁莽攻击  Reckless",
  "type": "feat",
  "img": "icons/skills/melee/maneuver-greatsword-yellow.webp",
  "system": {
    "description": { "value": "<p>回合开始时可决定鲁莽进攻：本回合所有近战武器攻击具有优势，但直到其下回合开始，针对它的攻击检定也具有优势。</p>" },
    "type": { "value": "monster", "subtype": "" },
    "activities": {
      "dnd5eactivity000": {
        "_id": "dnd5eactivity000",
        "type": "utility",
        "name": "开启鲁莽",
        "activation": { "type": "special", "value": null },
        "duration": { "value": "1", "units": "round" },
        "target": { "affects": { "type": "self" } },
        "range": { "units": "self" },
        "effects": [
          { "_id": "<<effA 同下>>" },
          { "_id": "<<effB 同下>>" }
        ]
      }
    },
    "source": { "rules": "2014" }
  },
  "effects": [
    {
      "_id": "<<effA 16位>>",
      "name": "鲁莽攻击(攻击优势)",
      "img": "icons/skills/melee/maneuver-greatsword-yellow.webp",
      "type": "base",
      "transfer": false,
      "disabled": false,
      "origin": "",
      "duration": { "rounds": 1 },
      "statuses": [],
      "changes": [
        { "key": "flags.midi-qol.advantage.attack.mwak", "mode": 0, "value": "1", "priority": 20 }
      ]
    },
    {
      "_id": "<<effB 16位>>",
      "name": "鲁莽攻击(被攻击优势)",
      "img": "icons/skills/melee/maneuver-greatsword-yellow.webp",
      "type": "base",
      "transfer": false,
      "disabled": false,
      "origin": "",
      "duration": { "rounds": 1 },
      "statuses": [],
      "changes": [
        { "key": "flags.midi-qol.grants.advantage.attack.all", "mode": 0, "value": "1", "priority": 20 }
      ]
    }
  ]
}
```

**要点**：① activity 类型 `utility`，`activation.type:"special"`（特殊/触发时机；若该能力消耗动作则用 `"action"`/`"bonus"`）。② activity 的 `effects[]._id` 必须等于本 item `effects[]` 里对应 effect 的 `_id`（引用关系，同 M6）。③ effect 用 `duration.rounds` 控制持续回合，`transfer:false`（非常驻，用了才挂）。④ midi-qol flag 的 `mode` 用 **0（CUSTOM）**、`value:"1"`。⑤ 该模式同样适用于自我增益伤害/抗性/移速——只需替换 `changes` 里的 key（见 §5.1）。⑥ **自身目标 utility 的 `target` 必须写 `{ "affects": { "type": "self" }, "override": true }`**——漏掉 `override:true` 则 UI 选不中自身、增益落空（见 §5.2 坐实行）。

---

## 5. DAE changes 速查表

`changes` 元素结构：`{ "key": "...", "mode": N, "value": "...", "priority": 20 }`

**mode 取值**（来自 Foundry ACTIVE_EFFECT_MODES）

| mode | 含义 |
|---|---|
| 0 | CUSTOM（交模组处理，如 ActiveAuras 自定义） |
| 1 | MULTIPLY 乘 |
| 2 | ADD 加 |
| 3 | DOWNGRADE 取低 |
| 4 | UPGRADE 取高 |
| 5 | OVERRIDE 覆盖 |

**已验证可用的 key（仅列样本中出现过的，扩展前须确认）**

| key | 用途 |
|---|---|
| `system.attributes.ac.bonus` | AC 加值 |
| `system.attributes.movement.walk` | 步行速度（增益减益均可，mode 2 加） |
| `system.bonuses.mwak.damage` | 近战武器**伤害**加值（真实 schema 字段，见样本焦炉守夜人 `system.bonuses`）；value 填骰子串如 `"1d6"`，可做"血怒/狂暴 +Xd6"之类的开关式伤害增益 |
| `system.bonuses.mwak.attack` | 近战武器**命中**加值；value 填数字/骰子串 |
| `flags.dnd5e.<<自定义标记>>` | 挂自定义 flag（如 `flags.dnd5e.epicBoss`） |

> 上表 `mwak` 可换成 `rwak`（远程武器）、`msak`（近战法术）、`rsak`（远程法术）得到对应加值路径。

### 5.1 已验证 midi-qol flag（优势 / 劣势等自动化）

> midi-qol flag 用于把"优势/劣势/自动失败/重投"这类机制做成全自动。**统一用 `mode: 0`（CUSTOM）、`value: "1"`、`priority: 20`**。下表为**已用真实导出样本验证**的 key（来自「鲁莽攻击」成品）：

| key | 含义 |
|---|---|
| `flags.midi-qol.advantage.attack.mwak` | 自身**近战武器攻击**获得优势 |
| `flags.midi-qol.grants.advantage.attack.all` | **敌方对自己的所有攻击**获得优势（鲁莽的代价 / 被束缚目标等） |

**同构家族（结构相同，首次用前按 §9 向 DM 确认精确末段）**：
- 自身优势：`flags.midi-qol.advantage.attack.{mwak|rwak|msak|rsak|all}`、`flags.midi-qol.advantage.save.{str|dex|con|int|wis|cha|all}`、`flags.midi-qol.advantage.ability.check.{...}`
- 自身劣势：把上面的 `advantage` 换成 `disadvantage`
- 施加给攻击自己的人：`flags.midi-qol.grants.advantage.attack.all` / `flags.midi-qol.grants.disadvantage.attack.all`（让攻击自己的敌人吃劣势＝"易于防守"）
- 这些 flag 配合 **M13** 的 utility activity（点击即挂、round 时长）使用，或做成常驻 `transfer:true` 的被动 effect。

> 其它未列出的 key（如 `system.traits.di.value`、`flags.midi-qol.fail.*`、`flags.midi-qol.optional.*`）DAE/midi 均支持，但**首次使用前必须按 §9 向 DM 确认精确路径，不得凭印象填写**。确认后请把新 key 追加到本表，后续直接复用。

### 5.2 已验证目标配置（target.affects）

> 与 DAE/midi flag 同理，目标（template / affects）也有需写死的配置。下表为**已用真实导出样本验证**的项（来源：焦炉守夜人、木桩、火球魔杖、威力法杖）：

| 路径 | 已坐实值（CONFIG.DND5E.individualTargetTypes 全集） | 用途 |
|---|---|---|
| `activities[<id>].target.affects.type` | `"self"` / `"ally"` / `"enemy"` / `"creature"` / `"willing"` / `"object"` / `"space"` / `"creatureOrObject"` / `"any"` / `""` | **阵营 / 对象筛选（豁免 AOE 必填）**。`self`=仅自身；`ally`=盟友；`enemy`=敌人；`creature`=任意生物（含自己和友军）；`willing`=自愿生物；`object`=物件；`space`=空间；`creatureOrObject`=生物或物件；`any`=任意；`""`=不限定。**这才是控制"对谁生效"的字段**——⚠ 不是 midi 的 `autoTargetType`（实测全部样本恒 `"any"`，不参与阵营筛选）。坐实来源：F12 `CONFIG.DND5E.individualTargetTypes` 全量 dump + 样本（焦炉 `creature`、木桩 `ally`/`enemy`/`willing`）。 |
| `activities[<id>].target.affects.special` | `"-self"` | **在 `affects.type` 基础上再排除施法者自身**。以自身为中心的范围（半径/光环式 `radius`/`circle`、自身发出的 `cone`/`line`）默认含施法者本人；填 `-self` 排除。可与任意 `type` 组合：`type:"ally"`+`special:"-self"` = "友军但不含自己"（木桩坐实）；`type:"creature"`+`special:"-self"` = "除自己外所有生物"。UI 对应「目标 → 特殊目标」。自身为心的范围一律加上。 |
| `activities[<id>].target.affects.choice` / `.count` | `true`/`false` · 数字串如 `"3"` | `choice:true` = 让施法者在范围内手选；`count` = 至多影响几个（木桩复制件 `choice:true,count:"3"` 坐实）。 |
| `activities[<id>].target.override` | `true` / `false` | **显式设 `affects.type` 时必须配 `override:true`（自身目标尤其）**。坐实来源：奥能过载修订样本——`utility` 自我增益的 `target` 为 `{ "affects": { "type": "self", ... }, "override": true, "prompt": true }`。⚠ **若漏填 `override:true`，Foundry UI 不读取该 `affects` 配置、"目标"页选不中自身，自我增益落空**（对应 UI「目标 → 覆盖目标」开关，须勾上才能改 affects）。**规则**：① 无模板的**自身/单体增益 utility**（`affects.type:"self"`）→ 必须 `override:true`；② **模板型 AOE**（带 `target.template` 的 `save`，配 `affects.type:"creature"`/`-self` 等）→ **不需要** `override`（默认 `false` 即可，模板自带目标解析，焦炉吐息样本坐实 `override:false`）。 |

**`affects.type` 目标模式速记**：
- **全体生物（含自己和友军，非自身为心）**：`"affects": { "type": "creature" }`（不写 `-self`）。
- **自身为心、除自己外所有生物**：`"affects": { "type": "self", "special": "-self" }`——`type:"self"` 让模板以施法者为原点展开，`-self` 排除施法者。（v2.2 修正：不可用 `type:"creature"`+`-self` 替代，实测不生效。）
- **仅友军（不含自己）**：`"affects": { "type": "ally", "special": "-self" }`；含自己则去掉 `-self`。
- **仅敌方**：`"affects": { "type": "enemy" }`（已坐实，伤敌不伤友的 AOE 直接用这个）。
- **自愿生物**（仅愿意者受影响，如群体增益/传送）：`"affects": { "type": "willing", "choice": true }`。

> 配合「友善豁免」：活动级 `friendlySave:"friendlySuccess"`（坐实）让友方目标在该豁免里自动判成功——对 `type:"creature"` 的范围伤害想"波及但不真伤友军"时很有用。


---

## 6. AI 自检清单（输出前逐项核对）

- [ ] **每项能力都已尽力自动化**：通读所有 item，确认没有"本可自动却写成 DM 手判"的能力（优势/劣势→§5.1；额外伤害→`system.bonuses.*.damage`；触发型自我增益→M13；施加状态→M6；抗性/移速/AC→§5）
- [ ] **没有"由DM……"作为偷懒出口**：凡降级为开关 effect / 宏 / 手判的，都在**自动化日志**里写明缺哪个 key、为何降级、DM 要做什么；不确定的 key 已走 §9 问过 DM 而非凭印象省略
- [ ] **卡面 / 日志已分离（§0bis）**：所有 item 的 `description.value` 只含官方风格能力描述，**无任何实现/调试注释**（"已写入抗性栏""自动生效""由DM手动判定"、midi/DAE key 路径解释、`-self`/写死DC/按4人计算等技术备注一律不在卡面）
- [ ] **卡面术语照字典 §36**：`description.value` / `item.name` 内一切玩家可见术语（伤害/状态/属性/技能/学派/生物类型/物品属性）已逐字核对《数据字典》§36 国内官方译名（`psychic`=心灵≠精神、`necrotic`=暗蚀≠死灵）；§36 显示英文或未解析 i18n 键的词未自译、已走 §9 问 DM
- [ ] **已附带一份「自动化日志」**：含怪物概览 + 逐能力实现表（item/activity 类型、用到的 key/flag/模板、全自动或降级及原因、DM 手动事项、特殊配置）+ 待补/求助项
- [ ] 顶层 `type:"npc"`，`system.source.rules:"2014"`
- [ ] item/effect 的 `_id` 在 Actor 内唯一、16 位；activity id 每 item 内唯一即可（不同 item 可重名）
- [ ] activity 引用的 effect `_id` 与 `items[].effects[]._id` 一一对应
- [ ] **每个 item 只含一个"会结算"的主 activity**（`attack`/`save`/`damage`/`heal` 不在同一 item 内并列）；范围攻击与单体攻击已拆成**各自独立的 item**，绝不合并在一把武器里（否则 midi 串成一张卡，一次使用双重结算伤害——见 §0 第 8 条 / §4 通则）
- [ ] **以自身为中心的 AOE 已正确排除自身**：自身为心的范围（`circle`/`radius` 半径 / 自身 `cone`/`line` / 光环式）其 `target.affects` 必须为 `{ "type": "self", "special": "-self" }`——`type:"self"` 让模板以自身为原点，`-self` 排除自身。**禁止用 `type:"creature"`+`-self` 代替，实测不生效**（见 §5.2 / v2.2 修正）
- [ ] **自身目标 utility 已配 `target.override:true`**：凡 activity 显式设 `affects.type:"self"`（自我增益/架势/姿态等），其 `target.override` 必须为 `true`，否则 UI 选不中自身、增益落空（见 §5.2 / §M13⑥）；模板型 AOE 不需要 override
- [ ] **命名风格合规（§0bis）**：`name`/`prototypeToken.name` 为简短描述性称号（`中文称号 English Title` 无括号），未凭空起人名、未用"者"作后缀（见 §0bis 怪物命名风格）
- [ ] **官方法术未写进卡**：官方法术（《5E万法大全》清单 / 字典 §37 UUID 库中有）一条都没写进 `items[]`，改随怪交付「挂接宏 + UUID」从世界包挂接；仅自创法术手写成 spell item（见 §M8 世界包法术挂接工作流）
- [ ] **豁免 AOE 已显式填 `target.affects.type`**（`creature`/`ally`/`self`…）——缺则模板无豁免对象、用了不掷豁免（见 §M3/§5.2）；阵营筛选走 `affects.type`，**不靠** `autoTargetType`
- [ ] **有限次数能力两段齐备**：item 级 `uses`（`max`+`recovery`+`spent`）+ 该 activity 内 `consumption.targets:[{type:"itemUses",value:"N"}]`——缺 `consumption` 则用了不扣格（见 §M4）；部分回复用 `recovery.type:"formula"`+`formula`
- [ ] 每个 attack activity 有 `attack`+`damage`；每个 save activity 有 `save`+（`damage` 或 `effects`）
- [ ] 所有 `save.dc.formula` 为写死数字字符串
- [ ] HP 有 `value`/`max`；AC 写法与装备匹配：**无加 AC 装备 item** → `calc:"natural"`+`flat`；**持盾/穿甲 item** → `calc:"default"` 且 AC 拆进已装备的护甲/盾 item（绝不让盾在 `natural`/`flat` 固定 AC 之上重复 +2）
- [ ] token `width`/`height` 与 `traits.size` 匹配（见尺寸表）
- [ ] 带传奇的怪：`resources.legact` 已设 + 传奇能力 `activation.type:"legendary"`
- [ ] 光环 effect `type:"auraeffects.aura"` + `flags.ActiveAuras.isAura:true`
- [ ] 召唤 `profiles[].uuid` 为 compendium 路径
- [ ] 所有 `effect.origin` 为 `""`
- [ ] 所有 item/effect 的 `_stats.compendiumSource`、`_stats.duplicateSource` 为 `null`（无 `Scene.…Token.…` 残留）
- [ ] 含宏的 item：`onUseMacroName` + `dae.macro` + `itemacro.macro` 三者齐备，宏体可过 `new Function()` 校验
- [ ] **token 视野已配**：会看的怪 `sight.enabled:true`+`range`+`visionMode`，`detectionModes` 按感官列全（darkvision→basicSight、truesight→seeAll、blindsight→blindsight、tremorsense→feelTremor，外加 lightPerception）——只填 `senses.ranges` 不配 token 视野则 token 全瞎（见 §12.1）
- [ ] **指示物命名**：`appendNumber` 默认 `false`（不加数字后缀）；普通/可成群小怪 `prependAdjective:true`（只加随机形容词前缀），具名/精英/Boss `prependAdjective:false`（见 §12.2）
- [ ] **动画**（如需）：按招式类型挂 `flags.autoanimations`（见 §12.3 调色板）；传送类用 `menu:"preset"`+`presetType:"teleportation"`
- [ ] **法术：官方只列、自创才写**：施法者怪物的官方法术（《5E万法大全》清单中有）**未写进 JSON**、仅列「官方法术清单」交 DM；JSON 内仅含**自创 / 魔改**法术的完整 spell item；施法者配置（spellcasting / spell.level / spells 法术位 + 施法 feat）齐备（见 §M8）
- [ ] **没有任何本规范未出现过的字段/key**

---

## 7. 字段填写禁忌（呼应字段纪律）

- 不确定的字段 → **省略**，不要臆造默认值。
- 没有的数据 → 向 DM 索要，不要替 DM 编数值。
- 不要把"单体攻击"与"范围豁免"（或任意两个会结算伤害/豁免的 activity）塞进**同一个 item** → midi-qol 会把它们串成同一张卡连续结算、一次使用打出双份伤害；务必拆成**两个独立 item**（参见 §0 第 8 条、§4 通则、§M9）。
- 不要把实现 / 自动化 / 调试说明写进 item 的 `description.value`（"已写入抗性栏""自动生效""由DM手动判定"、midi/DAE key 路径解释、`-self`/写死DC/按4人计算等）→ 卡面只放官方风格能力描述，这些技术信息一律进**自动化日志**（见 §0bis）。
- 不要凭记忆翻译卡面术语 → 伤害 / 状态 / 属性 / 技能 / 学派 / 生物类型 / 物品属性的玩家可见中文一律照字典 §36（`psychic`=心灵≠精神、`necrotic`=暗蚀≠死灵；"死灵"仅 `nec` 学派）；§36 显示英文或未解析 i18n 键的词不得自译，走 §9 问 DM。
- 不要手写官方法术（《5E万法大全》清单中有的）的描述 / activity / effect / 机制，**也不要把官方法术放进 JSON** → 其机制极易写错，FVTT 内已有权威自动化版本；官方法术一律**只列清单交 DM**，只有清单中没有的**自创 / 魔改**法术才完整手写（v2.0.2，见 §M8）。
- 不要在豁免 AOE 里漏掉 `target.affects.type` → 缺它模板没有豁免对象、用了不掷豁免（v1.6 实测；见 §M3/§5.2）。也不要靠 midi `autoTargetType` 做阵营筛选——它恒 `"any"`，筛选走 `affects.type`。
- 不要给有限次数能力只设 item 级 `uses` 而漏掉 activity 内 `consumption.targets` itemUses → 用了不扣格、充能/次数永不消耗（v1.6 实测；见 §M4）。
- 不要只交付 Actor JSON 而漏掉「自动化日志」→ 日志是 v1.5 起的必交付第二份产物。
- 不要在 JSON 里写注释（`//` 或 `/* */`），导入会校验失败。
- 不要保留来源 compendium 的 `origin` / `_stats.compendiumSource`。
- `img` 路径吃不准就留空 `""`（系统给默认图标）。Foundry 核心图标目录随版本变动，路径写错只是控制台 404 警告，**不影响任何功能**——可后期批量替换。

---

## 8. 完整范例

一只 CR 5 原创怪物「枯萎守望者 Withered Watcher」，覆盖：多重攻击(M2)、武器攻击(M1)、充能豁免AOE(M3+M4)、施加状态(M6)、被动effect(M5)。可直接 Import 验证结构。

```json
{
  "name": "枯萎守望者 Withered Watcher",
  "type": "npc",
  "img": "icons/creatures/magical/spirit-undead-horned-blue.webp",
  "system": {
    "abilities": {
      "str": { "value": 14, "proficient": 0 },
      "dex": { "value": 16, "proficient": 1 },
      "con": { "value": 15, "proficient": 0 },
      "int": { "value": 6, "proficient": 0 },
      "wis": { "value": 12, "proficient": 1 },
      "cha": { "value": 8, "proficient": 0 }
    },
    "attributes": {
      "ac": { "flat": 14, "calc": "natural", "formula": "" },
      "hp": { "value": 75, "max": 75, "temp": null, "tempmax": null, "formula": "10d8 + 30" },
      "init": { "ability": "", "bonus": "0" },
      "movement": { "walk": "30", "fly": "0", "swim": "0", "climb": "0", "burrow": "0", "units": "ft", "hover": false },
      "senses": { "ranges": { "darkvision": 60, "blindsight": null, "tremorsense": null, "truesight": null }, "units": "ft", "special": "" },
      "spellcasting": "",
      "spell": { "level": 0 }
    },
    "details": {
      "alignment": "Neutral Evil",
      "type": { "value": "undead", "subtype": "", "swarm": "", "custom": "" },
      "cr": 5,
      "biography": { "value": "<p>一具被枯萎魔力束缚的守墓尸骸。</p>", "public": "" }
    },
    "traits": {
      "size": "med",
      "di": { "value": ["poison"], "bypasses": [], "custom": "" },
      "dr": { "value": ["necrotic"], "bypasses": [], "custom": "" },
      "dv": { "value": [], "bypasses": [], "custom": "" },
      "ci": { "value": ["poisoned", "frightened"], "custom": "" },
      "languages": { "value": ["common"], "custom": "" }
    },
    "skills": { "prc": { "value": 1, "ability": "wis" } },
    "spells": {},
    "resources": {},
    "source": { "rules": "2014", "license": "" }
  },
  "prototypeToken": {
    "name": "枯萎守望者",
    "displayName": 20,
    "actorLink": false,
    "width": 1,
    "height": 1,
    "disposition": -1,
    "displayBars": 20,
    "bar1": { "attribute": "attributes.hp" },
    "bar2": { "attribute": "" },
    "appendNumber": false,
    "prependAdjective": true,
    "sight": { "enabled": true, "range": 60, "angle": 360, "visionMode": "darkvision", "color": null, "attenuation": 0.1, "brightness": 0, "saturation": 0, "contrast": 0 },
    "detectionModes": [
      { "id": "lightPerception", "range": 60, "enabled": true },
      { "id": "basicSight", "range": 60, "enabled": true }
    ],
    "texture": { "src": "icons/creatures/magical/spirit-undead-horned-blue.webp", "scaleX": 1, "scaleY": 1, "fit": "contain" }
  },
  "items": [
    {
      "_id": "wwMultiattack001",
      "name": "多重攻击 Multiattack",
      "type": "feat",
      "img": "icons/skills/melee/strike-slashes-orange.webp",
      "system": {
        "description": { "value": "<p>枯萎守望者进行两次腐蚀爪击。</p>" },
        "activities": {},
        "source": { "rules": "2014" }
      }
    },
    {
      "_id": "wwClaw0000000001",
      "name": "腐蚀爪击 Withering Claw",
      "type": "weapon",
      "img": "icons/creatures/claws/claw-curved-jagged-grey.webp",
      "system": {
        "equipped": true,
        "proficient": 1,
        "type": { "value": "natural", "baseItem": "" },
        "range": { "value": null, "long": null, "units": "ft", "reach": 5 },
        "damage": { "base": { "number": 1, "denomination": 6, "bonus": "", "types": ["slashing"] } },
        "activities": {
          "dnd5eactivity000": {
            "_id": "dnd5eactivity000",
            "type": "attack",
            "activation": { "type": "action", "value": 1 },
            "range": { "value": "5", "units": "ft" },
            "attack": { "ability": "dex", "bonus": "", "type": { "value": "melee", "classification": "weapon" } },
            "damage": {
              "includeBase": true,
              "parts": [ { "number": 1, "denomination": 6, "bonus": "", "types": ["necrotic"] } ]
            }
          }
        },
        "source": { "rules": "2014" }
      }
    },
    {
      "_id": "wwBreath00000001",
      "name": "枯萎吐息 Withering Breath",
      "type": "feat",
      "img": "icons/magic/death/skull-energy-light-purple.webp",
      "system": {
        "description": { "value": "<p>30尺锥形区域，敏捷豁免 DC 13，6d6 暗蚀伤害，成功减半。</p>" },
        "uses": { "max": "1", "recovery": [ { "period": "recharge", "formula": "5", "type": "recoverAll" } ], "spent": 0 },
        "activities": {
          "dnd5eactivity000": {
            "_id": "dnd5eactivity000",
            "type": "save",
            "activation": { "type": "action", "value": 1 },
            "consumption": { "targets": [ { "type": "itemUses", "value": "1" } ] },
            "save": { "ability": ["dex"], "dc": { "calculation": "", "formula": "13" } },
            "damage": { "onSave": "half", "parts": [ { "number": 6, "denomination": 6, "bonus": "", "types": ["necrotic"] } ] },
            "target": { "affects": { "type": "self", "special": "-self" }, "template": { "type": "cone", "size": "30", "units": "ft" } }
          }
        },
        "source": { "rules": "2014" }
      }
    },
    {
      "_id": "wwGaze0000000001",
      "name": "枯萎凝视 Withering Gaze",
      "type": "feat",
      "img": "icons/magic/control/fear-fright-monster-purple.webp",
      "system": {
        "description": { "value": "<p>目标感知豁免 DC 13，失败则恐慌1分钟。</p>" },
        "activities": {
          "dnd5eactivity000": {
            "_id": "dnd5eactivity000",
            "type": "save",
            "activation": { "type": "action", "value": 1 },
            "range": { "value": "30", "units": "ft" },
            "save": { "ability": ["wis"], "dc": { "calculation": "", "formula": "13" } },
            "effects": [ { "_id": "wwFearEffect0001" } ]
          }
        },
        "source": { "rules": "2014" }
      },
      "effects": [
        {
          "_id": "wwFearEffect0001",
          "name": "恐慌",
          "img": "icons/magic/control/fear-fright-monster-purple.webp",
          "type": "base",
          "transfer": false,
          "disabled": false,
          "origin": "",
          "statuses": ["frightened"],
          "changes": [],
          "duration": { "seconds": 60 }
        }
      ]
    },
    {
      "_id": "wwUndeadFort0001",
      "name": "不死坚韧 Undead Fortitude",
      "type": "feat",
      "img": "icons/magic/death/undead-skeleton-rampage-yellow.webp",
      "system": {
        "description": { "value": "<p>当该生物降至 0 生命值（且所受伤害并非光耀伤害、亦非重击）时，须进行一次体质豁免，DC = 5 + 所受伤害。豁免成功则保留 1 生命值。</p>" },
        "activities": {},
        "source": { "rules": "2014" }
      },
      "effects": [
        {
          "_id": "wwUndeadFortEff1",
          "name": "不死坚韧",
          "img": "icons/magic/death/undead-skeleton-rampage-yellow.webp",
          "type": "base",
          "transfer": true,
          "disabled": false,
          "origin": "",
          "changes": [ { "key": "flags.dnd5e.undeadFortitude", "mode": 5, "value": "1", "priority": 20 } ],
          "duration": {},
          "statuses": []
        }
      ]
    }
  ],
  "effects": [],
  "flags": {}
}
```

> 此范例中：多重攻击为纯描述、腐蚀爪击合并基础穿刺+附加死灵、枯萎吐息带充能5-6、枯萎凝视通过 activity.effects 引用恐慌 effect、不死坚韧为被动 transfer effect。传奇/召唤/光环按 M9/M11/M12 追加即可。注意：上方所有 item 的 `description.value` **均为官方风格能力描述，无任何实现注释**（§0bis）；实现信息见下方随附的「自动化日志」。

**随附自动化日志（示例 · 与上方 JSON 一并交付）**

> 怪物概览：枯萎守望者 Withered Watcher｜CR 5｜中型 med｜AC 写法 `natural`+`flat`=14（身上无加 AC 装备 item）｜HP 75（`10d8+30`）｜无传奇/巢穴/光环/召唤。

| 能力 | item/activity | 关键 key/模板 | 自动化 | DM 手动 | 备注 |
|---|---|---|---|---|---|
| 多重攻击 Multiattack | feat / 无 | — | 纯描述（系统不自动连击） | 本回合分别点击两次「腐蚀爪击」 | — |
| 腐蚀爪击 Withering Claw | weapon / attack | `damage.base` 1d6 斩 + `parts` 1d6 死灵，`includeBase:true` | 全自动 | — | 命中/伤害自动结算 |
| 枯萎吐息 Withering Breath | feat / save | `cone 30ft`，`save.dc.formula:"13"`，`damage.onSave:"half"`，充能 `recharge 5` + `consumption.targets` itemUses，`target.affects.type:"self"` + `special:"-self"` | 全自动 | — | 以自身为原点·已排除自身；充能正确扣格 |
| 枯萎凝视 Withering Gaze | feat / save | `save.dc.formula:"13"`，`activity.effects` 引用恐慌 effect（`statuses:["frightened"]`，60s） | 全自动 | — | 豁免成功不施加由 midi 处理 |
| 不死坚韧 Undead Fortitude | feat / 无（被动 effect） | `flags.dnd5e.undeadFortitude`（mode 5） | 降级·一键标记 | 降至 0 HP 时由 DM 触发该判定 | 该 flag 仅作标记，触发时机需 DM 把握 |

> 待补/求助项：无。（若改为带召唤/光环版本，则在此列出召唤物 compendium UUID、world UUID、光环半径等占位。）

---

## 9. 求助流程：没把握的 key / 路径怎么办

当某个能力的自动化需要一个**你不在 §5/§5.1 已验证表里、且无法确定精确写法**的 key/flag/路径时，**不要退回手判、也不要凭印象乱填**。按下面的流程走：

1. **先自查**：该机制是否已能用现有已验证 key 表达？（优势/劣势→§5.1；伤害加值→`system.bonuses.*.damage`；移速/AC→§5；状态→M6 的 `statuses`；自我增益→M13）。能就直接做。
2. **不能，就中断生成、向 DM 提问**。提问时要具体，并主动告诉 DM **怎么帮你拿到精确路径**，例如：
   - 「我需要『XXX效果』的 DAE key，但不确定精确末段。**你能否在 Foundry 里对任意 actor 新建一条 Active Effect、用 DAE 的 key 下拉补全找到它，然后把那个 item/effect 导出成 JSON 发我？**」——这是最可靠的方式，导出样本即权威来源（本规范的 §5.1 就是这么来的）。
   - 或：「请帮我在 midi-qol 设置里确认这个 flag 的完整路径」/「请把你世界里某个已实现该效果的怪物导出给我参考」。
3. **拿到 DM 的参考样本后**：提取出精确的 key/结构 → **追加进 §5/§5.1（或对应 M 模块）** → 然后继续生成。**从此这个 key 就是"已验证"，后续直接复用，不再问第二次。**
4. **只有当 DM 明确表示"这个没法自动、就手判吧"时**，才降级，且仍按自动化铁律的降级顺序（开关 effect → 宏 → 手判）并在描述里注明。

> 一句话：**遇到不确定，问 DM 要样本，而不是把活儿丢回给 DM。** 每问一次、记一次，规范的已验证 key 表就长一点，以后越来越能一把做全自动。

---

## 附录 A · 物品 / 魔法物品

物品与怪物的 item 复用**完全相同**的 item / activity / effect 结构——差异只在顶层 `type` 与 `system.type.value`。前述所有模式（M1 攻击 / M3 豁免 / heal / M5 被动 effect / M6 状态）直接适用。

**类型映射**

| 物品 | `type` | `system.type.value` |
|---|---|---|
| 武器 | `weapon` | `simpleM`/`martialM`（近战）、`simpleR`/`martialR`（远程）、`natural` |
| 护甲 | `equipment` | `light` / `medium` / `heavy` / `shield` |
| 饰品·奇物 | `equipment` | `trinket` / `wondrous` / `ring` / `rod` / `wand` / `staff` |
| 消耗品 | `consumable` | `potion` / `scroll` / `ammunition` … |

**魔法三件套**（魔法武器/物品必加）：`properties` 含 `"mgc"`；`rarity` 取 `common/uncommon/rare/veryRare/legendary/artifact`；`attunement` 取 `""`（不需调律）/`"required"`/`"optional"`，并配 `"attuned": false`。

**A1 · 魔法武器**（= M1 攻击 + 魔法加值）

```json
{
  "type": "weapon",
  "system": {
    "type": { "value": "martialM", "baseItem": "battleaxe" },
    "properties": ["mgc"],
    "rarity": "rare", "attunement": "", "proficient": 1,
    "damage": { "base": { "number": 1, "denomination": 8, "bonus": "1", "types": ["slashing"] } },
    "activities": {
      "dnd5eactivity000": {
        "_id": "dnd5eactivity000", "type": "attack",
        "activation": { "type": "action", "value": 1 },
        "attack": { "ability": "str", "bonus": "1", "type": { "value": "melee", "classification": "weapon" } },
        "damage": { "includeBase": true, "parts": [ { "number": 1, "denomination": 6, "bonus": "", "types": ["fire"] } ] }
      }
    },
    "source": { "rules": "2014" }
  }
}
```

`+N` 魔法加值：`attack.bonus` 与 `damage.base.bonus` 都填 `"N"`（字符串）；附加元素伤害放 `damage.parts`。

**A2 · 护甲**（无 activity）

```json
{ "type": "equipment", "system": { "type": { "value": "medium", "baseItem": "breastplate" }, "armor": { "value": 14, "dex": null }, "properties": [], "source": { "rules": "2014" } } }
```

`armor.value` 填基础 AC；`dex: null` 用类别默认敏捷上限（medium 最多 +2）。盾牌用 `type.value:"shield"` + `armor.value:2`。⚠️ **当怪物/NPC 的 AC 要由这些已装备的护甲/盾自动算出时，Actor 顶层 `ac.calc` 必须设为 `"default"`**（而非 `"natural"`）——否则盾牌会在固定 AC 之上重复 +2（详见 §2 填写说明「AC 计算的两种正确写法」）。

**A3 · 消耗品·治疗**（heal activity，用后销毁）

```json
{
  "type": "consumable",
  "system": {
    "type": { "value": "potion" },
    "uses": { "max": "1", "autoDestroy": true, "spent": 0, "recovery": [] },
    "activities": {
      "dnd5eactivity000": {
        "_id": "dnd5eactivity000", "type": "heal",
        "activation": { "type": "action", "value": 1 },
        "consumption": { "targets": [ { "type": "itemUses", "value": "1" } ] },
        "target": { "affects": { "count": "1", "type": "creature" } },
        "healing": { "number": 4, "denomination": 4, "bonus": "4", "types": ["healing"] }
      }
    },
    "source": { "rules": "2014" }
  }
}
```

**A4 · 消耗品·增益 / 魔法物品·被动**（effect）

- 主动喝下生效（药水）：`activity` 用 `utility` 并在其 `effects` 引用一个 **`transfer:false`** 的 effect，effect 带 `duration.seconds`。
- 佩戴持续生效（饰品）：`activities: {}`，挂一个 **`transfer:true`** 的 effect。

effect 的 `changes` 用 DAE 速查表里的真实 key，例如 `system.attributes.ac.bonus`（mode 2 加值）、`system.abilities.str.value`（mode 4 取高，"力量视为至少 N"）。

**参考成品**（本轮已生成并校验）：精铁胸甲（A2 护甲）、赤晶战斧（A1 魔法武器）、炽炉护符（A4 魔法物品被动，+1 AC 且力量≥19）。
### M14 · 原生变形（dnd5e Polymorph/Wildshape · 手动·描述性 feat）

**机制**：dnd5e 原生变形是**纯卡面手动操作**，不是 item / activity / 宏——开本体 Actor 卡 → 把目标形态 Actor 拖进卡 → 弹「配置变形」对话框 → 选预设/勾项 → 点「变形」。变形后结果 Actor 顶层写入 `flags.dnd5e.transformOptions`（+ `originalActor`/`isPolymorphed`/`previousActorIds`）。
**⇒ 怪物 JSON 里放不了原生变形这个动作本身。** 卡面只做一条**描述性 feat（无 activity）**，写官方风格能力文本；GM 操作步骤与预设建议进**自动化日志**（§0bis），不进卡面。

**卡面写法（feat·无 activity）**
```json
{
  "_id": "<<16位ID>>",
  "name": "变形 Transform",
  "type": "feat",
  "img": "icons/magic/control/debuff-energy-hold-purple.webp",
  "system": {
    "description": { "value": "<p>动作：该生物变形为<<目标形态>>，直至死亡或自愿变回。其游戏数值按新形态替换。</p>" },
    "activities": {},
    "source": { "rules": "2014" }
  }
}
```

**自动化日志该写的（不进卡面）**
| 能力 | item/activity | 自动化 | DM 手动 | 备注 |
|---|---|---|---|---|
| 变形 Transform | feat / 无 | 降级·手动 | 开本怪卡 → 拖入目标形态 Actor → 「配置变形」对话框 → 选预设 → 变形 | 原生变形无 item 触发，故手动；预设建议见下 |

**「配置变形」对话框 ↔ `transformOptions` 键**（✅=键名/值已坐实；⚠=标签已知、内部键未证，仅写自定义非预设配置时才需要）
```text
预设 preset：  变形术→"polymorph"✅   荒野变形→"wildshape"✅   默认/仅外观→⚠
keep[]：       精神属性→"mental"✅  特性→"feats"✅  传记→"bio"✅  临时生命值→"tempHP"✅
              生理/豁免熟练/技能熟练/装备熟练/语言/熟练加值/装备/法术/生物类型/生命值与生命骰/伤害抗性/视觉/自身→⚠
merge[]：      豁免熟练→"saves"+mergeSaves:true✅   技能熟练→"skills"+mergeSkills:true✅
effects[]：    该角色→"origin"✅ 其他角色→"otherOrigin"✅ 背景效应→"background"✅
              职业效应→"class"✅ 特性效应→"feat"✅ 法术效应→"spell"✅   所有效应/装备效应→⚠
其他：        最低护甲等级→minimumAC(公式串)✅  保留的法术列表→spellLists[]✅
              临时生命值公式→tempFormula(公式串)✅  变形指示物→transformTokens(bool)✅
预设建议：    整只换形态（数值全替换）选「变形术 polymorph」；保留心智/职业/特性的塑形选「荒野变形 wildshape」
```

> ⚠ 未证内部键不影响使用：实战在对话框直接选预设+勾框即可，无需手写 transformOptions。要补全某个 ⚠ 键：勾上它变形一次，把结果 Actor 的 `transformOptions` 导出即可当场坐实。


---

## 12. 视野 / 指示物命名 / 动画（v2.0 新增 · 已坐实）

> 来源：木桩 token 导出（视野 id 与 sight 字段）、AA 6.8.1 autorec 全库 dump（动画词库）、火球/暗影步 item flag 导出（autoanimations 结构）。环境 Foundry 13.351 / dnd5e 5.3.3 / Automated Animations 6.8.1。

### 12.1 token 视野（最易漏）

`system.attributes.senses.ranges.*` **只填卡面数值**，token 能不能"看见"由 `prototypeToken.sight` + `detectionModes` 决定。两者不配 → token 全瞎（GM 视角无碍，但怪物视野/玩家操控/迷雾揭示全失效）。

**写法**（以黑暗视觉 60 为例）：
```json
"sight": { "enabled": true, "range": 60, "angle": 360, "visionMode": "darkvision",
           "color": null, "attenuation": 0.1, "brightness": 0, "saturation": 0, "contrast": 0 },
"detectionModes": [
  { "id": "lightPerception", "range": 60, "enabled": true },
  { "id": "basicSight",      "range": 60, "enabled": true }
]
```

**感官 → detectionMode id 映射**（id 取自木桩导出，标签为 Foundry 视野页中文）：

| D&D 感官 | `senses.ranges.*` | 视野页标签 | detectionMode `id` |
|---|---|---|---|
| 黑暗视觉 | `darkvision` | 黑暗视觉 | `basicSight` |
| 真视 | `truesight` | 全部可见 | `seeAll` |
| 盲视 | `blindsight` | 盲视 | `blindsight` |
| 振动感知 | `tremorsense` | 感知震颤 | `feelTremor` |
| （基础见光） | — | 感知光照 | `lightPerception` |

规则：`sight.range` 取所有感官中最大距离；有黑暗视觉则 `visionMode:"darkvision"`，否则 `"basic"`。`detectionModes` 必含 `lightPerception`（见被照亮处）+ 对应各感官的 mode。例：黑暗视觉60+真视30 →
```json
"detectionModes": [
  { "id": "lightPerception", "range": 60, "enabled": true },
  { "id": "basicSight",      "range": 60, "enabled": true },
  { "id": "seeAll",          "range": 30, "enabled": true }
]
```
（另有 `senseAll`/`senseInvisibility`/`seeInvisibility` 三种特殊 mode，普通怪不挂。）

### 12.2 指示物命名（appendNumber / prependAdjective）

`prototypeToken` 顶层两布尔：
- `appendNumber`：未关联时在名后追加递增数字（「哥布林 3」）。
- `prependAdjective`：未关联时在名前加随机形容词（「愤怒的哥布林」）。

**规则**：`appendNumber` **默认 `false`**（不加数字后缀，除非 DM 特别想要编号）。`prependAdjective`：普通 / 杂兵 / 可成群的小怪设 **`true`**（只加随机形容词前缀，如「愤怒的哥布林」）；独特 / 具名 / 精英 / Boss 设 **`false`**。

### 12.3 动画（flags.autoanimations）

动画挂在 item 顶层 `flags.autoanimations`；不挂则走 AA 全局自动匹配（泛用、常显简陋）。手挂可精确指定。**外壳**：
```json
"flags": { "autoanimations": {
  "id": "<随机 uuid>", "label": "<招式名>",
  "macro": { "enable": false, "playWhen": "0" },
  "menu": "<melee|range|templatefx|ontoken|preset>",
  "isEnabled": true, "isCustomized": true, "fromAmmo": false, "version": 5,
  "soundOnly": { "sound": { "enable": false } }
  /* + 下列对应形态的字段 */
}}
```
选动画两法：**①分类**——`video:{dbSection,menuType,animation,variant,color,enableCustom:false,customPath:""}`，合法组合见字典 v9 §35 词库；**②直引**——`enableCustom:true` + `customPath:"jb2a.xxx"`（路径从「动画数据库查看器」取，须精确）。`sound` 用 `{enable:true,file:"psfx.xxx",volume:0.75}`。

**五形态要点**（完整 schema + 整段范例见字典 v9 §35）：
- `menu:"melee"`：`primary`(挥砍特效) + `secondary`/`source`/`target`(各带 `enable`) + `meleeSwitch`(远程切换，可关) + `soundOnly`。
- `menu:"range"`：`primary`(弹道) + `secondary`(命中/目标爆) + `source`/`target`。
- `menu:"templatefx"`：`primary` 落在模板上；持续地带（毒云/网）设 `options.persistent:true`+`persistType:"attachtemplate"`，瞬爆（火球）`persistent:false`。
- `menu:"ontoken"`：`primary.options.playOn:"target"`（落目标）或 `"source"`（落自身，用于自增益）。
- `menu:"preset"` + `presetType:"teleportation"`：`data:{start,between,end,options:{range,teleport:true,speed,...},sound}`——传送/闪现专用。⚠ start/end 的启用键 AA 拼作 **`"enabe"`**（非 enable），照抄勿改。

**招式 → 动画调色板**（dbSection/menuType/animation；variant 缺省 `01`/`regular`，color 随属性）：

| 招式类型 | menu | dbSection/menuType/animation | 建议 color |
|---|---|---|---|
| 近战利刃(剑/弯刀/匕首) | melee | melee/weapon/`sword`·`scimitar`·`dagger` | 血→`red`/`darkred` |
| 近战钝击(锤/巨棒/斧) | melee | melee/weapon/`mace`·`greatclub`；或 melee/generic/`2hb`·`2hs` | `regular`/`orange` |
| 近战范围横扫(自身锥) | templatefx | templatefx/cone/`breathweapon` | 随属性 |
| 远程箭 | range | range/weapon/`arrow` | `regular` |
| 远程枪弹 | range | range/weapon/`bullet` | `regular` |
| 远程火法弹 | range | range/spell/`firebolt`·`fireballbeam` | `orange`/`red` |
| 远程死灵/毒弹 | range | range/spell/`eldritchblast`；或 range/generic/`skull`·`poison` | `purple`/`green` |
| 范围豁免·火爆 | templatefx | templatefx/circle/`fireball`·`explosion` | `orange` |
| 范围豁免·毒/腐云 | templatefx | templatefx/circle/`fogcloud`（+persistent） | `green` |
| 范围豁免·锥形吐息 | templatefx | templatefx/cone/`breathweapon`·`coneofcold` | 随属性 |
| 范围豁免·线形 | templatefx | templatefx/ray/`lightningbolt`·`breathweapon` | 随属性 |
| 上状态·束缚/锁链 | ontoken | static/chains/`standard`·`spike`（playOn target） | `regular` |
| 上状态·致眩/恐慌 | ontoken | static/conditions/`stun`·`fear`·`horror` | `regular` |
| 自增益(淬血/狂暴/光环) | ontoken | static/spell/`divinesmite`·`bless`；或 static/magicsign/`evocation`（playOn source） | 随属性 |
| 治疗/血瓶 | ontoken | static/spell/`curewounds`·`generichealing`（playOn target/self） | `green`/`blue` |
| 属性吸取/吸脑 | ontoken | static/spell/`tollthedead`；或 static/eyes/`single` | `purple` |
| 传送/闪现/疾步 | preset | start·end = static/spell/`mistystep`（或 customPath jb2a） | `blue`/随属性 |
