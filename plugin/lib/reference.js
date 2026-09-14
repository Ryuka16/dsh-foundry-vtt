/**
 * 内置基础参考库 —— 解决「AI 每次现查样本怪/样本物品照抄结构」的 token 浪费。
 *
 * 模板来源：用户世界 gesila（dnd5e 5.3.3, Foundry 13.351）实测验证过的实体结构
 * （僵尸/啃咬/尸毒豁免/巨蜘蛛样本），未验证字段已明确标注。
 * AI 需要结构模板时用 foundry_reference{topic} 一次本地调用拿到，
 * 替代 foundry_search + foundry_get_entity 拉完整样本（一次省几十 KB）。
 */
const REFERENCE = {
    'activity-deep': `【活动与工作流深层语义 · 2026-09-15 源码级核实（dnd5e release-5.3.3 / midi-qol v13.0.55）】
⚠️⚠️ 2026-09-17 Q8 已【实机实测】（世界「特醇佳酿」Foundry 13.351，execute_js 建临时 AE 读真实字段后立刻删除）：
  实测表（duration 输入 → 解析结果）：
    {seconds:60}                      → type="seconds" ｜ remaining=60 ｜ label="60 秒" ｜ isTemporary=true
    {rounds:3}                        → type="**turns**" ｜ remaining=**undefined** ｜ isTemporary=true
    {turns:5}                         → type="turns"     ｜ remaining=undefined ｜ isTemporary=true
    {rounds:3, turns:2}               → type="turns"     ｜ remaining=undefined ｜ isTemporary=true
    {seconds:60, rounds:3}            → type="**seconds**" ｜ remaining=60    ｜ ← **seconds 优先！**
    {combat:null, startRound:2, startTurn:1} → type="none" ｜ remaining=null ｜ label="无"
    {turns:null, rounds:null, seconds:null}  → type="none" ｜ remaining=null ｜ label="无"
    （测试时世界内无激活战斗；所有 startTime 都被核心写成当前 worldTime）
  ⇒ **三条修正（此前文档写的都不准确）**：
    ① **rounds 与 turns 不是「合成结束点」** —— 实测两者都解析成 type="turns"，核心把回合制统一归为 turns；
       rounds 与 turns 的内部换算关系【仍需在真实战斗中测】（无战斗时 remaining 直接 undefined，算不出来）。
    ② **seconds 优先级【高于】rounds** —— 同时给 seconds 和 rounds 时，type 判成 seconds、remaining=60，rounds 被忽略
       （至少 type/remaining 层面）。⇒ 想用回合制就【绝对不要】同时写 seconds。
    ③ **没有 combat 引用时，type 直接是 "none"、label「无」**（既不是 seconds 也不是 turns）—— 不是「退化到秒制」。
  ⇒ 实务结论：要「打 3 轮后消失」写 {rounds:3}（**不要**写 seconds）；战斗中会由 core 按 combat turn 计算 remaining。
     要「现实时间 60 秒」写 {seconds:60}。两条推断（合成结束点 / 过期是 inactive 还是删除）中，
     「合成结束点」**【已被实测证伪】**，改按上面 ① 理解。
⚠️ 2026-09-17 第三批核实补三条（Q4 / Q5 / Q8；Q4 与 Q5 的冲突项已本机 5.2.5 源码实锤）：

▸ Q4 · uses.recovery 的合法值与 formula 语义
  limitedUsePeriods 【完整 9 键】（config.mjs L1432-1473，本机 5.2.5 dnd5e.mjs L42922 起逐行核对【完全一致】）：
    lr ｜ sr ｜ day ｜ dawn(formula:true) ｜ dusk(formula:true) ｜ initiative(type:"special")
    ｜ turnStart(type:"combat") ｜ turnEnd(type:"combat") ｜ turn(type:"combat")
  第 10 项 recharge 是【recoveryOptions getter 尾部附加的】（L1479-1490），【不在】 limitedUsePeriods 里；
    uses.max === 1 时 UI 显示为 "Recharge"。
  recovery schema（uses-field.mjs L21-27）：{ period(initial "lr"), type(initial "recoverAll"), formula(FormulaField) }
  type 合法值【3 个】（recoverUses L138-180 的分支）：
    recoverAll → spent = 0 ｜ loseAll → spent = max ｜ formula → 掷 BasicRoll 决定恢复多少
    （day/dawn/dusk + gritty variant 时额外 alter(7,0,{multiplyNumeric:true})）
  formula 语义【两种】：day / dawn / dusk 上是【恢复量骰】（掷出多少回多少）；
    period="recharge" 时是【判定线】（掷出 ≥ 该值才恢复）。
  ⚠️ sr（短休回复）是【系统原生】，触发点 actor.mjs L2554-2565 —— 短休时 recoverShortRestUses() 对 period==="sr" 的项
    恢复并 unshift("sr")；长休/新一天同理处理 lr / day+dawn+dusk。【不需要任何模块配合】。
    我们样本库 sr 命中 0 只是没人用，不是系统不支持。

▸ Q5 · transform 的 settings（合法性 + 一个实锤冲突）
  schema（transformation-setting.mjs L1-110）：四类 Set（effects / keep / merge / other），
    initial 取 CONFIG.DND5E.transformation[对应目录] 里 default:true 的键（#initial 在 L60-64，本机 5.2.5 对应 L28431）；
    另有 minimumAC(FormulaField) / preset(String nullable) / spellLists(Set) / tempFormula(FormulaField) / transformTokens(Boolean initial true)。
  合法值集 = CONFIG 目录键（config.mjs L3409+）：
    effects = all / origin / otherOrigin / background / class / feat / equipment / spell（all 会禁用 effects.* 其余项）
    keep = physical / mental / saves / skills / gearProf / languages / proficiencies / feats / equipment / spells / bio / type / hp / tempHP / resistances / vision / self
      （saves ↔ merge.saves 互禁；self 会禁用 keep.* + merge.* + minimumAC + tempFormula）
    merge = saves / skills ｜ other = 空
  不写 settings 的运行时行为（transform-data.mjs L86-92）：customize:false 时 new TransformationSetting(...) 用默认 initial
    （即 CONFIG 各目录 default 键）；!customize 时改用 presets[preset] 全套 settings
    ⇒ 【等效于「用该 preset 的完整配置」，不是「什么都不保留」】。
  ⚠️ 【实锤冲突】CONFIG 的 transformation.keep 目录里有 equipment 键，但 transformInto（actor.mjs L35428 起）
    的物品过滤 switch 【不消费它】—— 本机 5.2.5 逐行核对：case "subclass"→keep.class||keep.hp、case "feat"→keep.feats、
    case "race"→keep.type，其余走 **default: return settings.keep.has("items")**（dnd5e.mjs **L35568**）。
    全表 30+ 处 keep.has(...) 里【没有任何 keep.has("equipment")】。
    ⇒ **保留装备加值的生效键是 keep.items，不是 keep.equipment**（后者在 transformInto 里无消费点）。
  spellLists 的 id 经 dnd5e.registry.spellLists.forType(id) 解析（L115-117），合法形如 subclass:moon / class:druid。
  运行时消费：keep.self → 全保留（L35447 起）；merge.saves/skills → 熟练取 max（L35518/L35524）；
    spellLists 有值时按标识符过滤保留法术（L35471 起），keep.spells 只是无 spellLists 时的兜底。

▸ Q8 · Foundry 核心的 ActiveEffect 时长计算 —— 【行级实现未核，明确标注】
  官方仓库 github.com/foundryvtt/foundryvtt 只有 releases 说明、无运行源码；npm 镜像与第三方仓库均取不到 v12/v13 的
  client/esmodules/foundry/client/documents/active-effect.mjs。**行号给不出**。以下是官方 API 文档（foundryvtt.com/api v12 client.ActiveEffect）确认的方法语义：
    updateDuration()      → 把 remaining / label 做成【懒 getter】，仅需要时重算
    _prepareDuration()    → 返回 { type, duration, remaining, label }
    _requiresDurationUpdate() → 【双判据】：seconds 制看 worldTime 是否变化；turns 制看 combat turn 是否变化（且目标是 combatant）
    _getCombatTime(round, turn, nTurns?) → 把「轮+回合」编码成十进制时间码（回合制比较用）
    getInitialDuration()  → { duration: { startTime } }
  秒制 vs 回合制的切换判据：duration.combat 有值且目标是 combatant → 回合制；否则秒制（worldTime）。
  rounds 与 turns 同时给：实现级优先级【未确证】。按 _getCombatTime(round, turn, nTurns) 语义与 DAE 只写 startRound/startTurn 的行为推断：
    回合制里二者不是二选一，而是【合成结束点】（startRound = 当前轮+rounds、startTurn = 当前回合+turns）。【推断，非确证】
  过期行为（inactive 还是删除）：核心把过期效果标记 inactive，删除由 DAE 的 expireEffects 负责
    —— 【分工为推断，待实测】。
  验证法（三组对照，F12）：对同一效果分别写 {seconds:60} / {rounds:3,turns:2} / {combat,startRound,startTurn}，
    读 effect.duration.remaining 与 effect.isTemporary 对照即可把上面两条推断升级为实证。
⚠️ 2026-09-16 第二批源码核实（10 条答复中的 7 条。来源：第三方核 dnd5e release-5.3.3 / midi v13.0.55 / DAE 主分支。
   本机只有 dnd5e 5.2.5（项目跑 5.3.3）且【无 midi / DAE 源码】，故以下属「转述第三方核验结论」，未二次复核；能本地核的已注明）：

▸ P4 · check.dc 的读取路径
  check-data.mjs 的 prepareFinalData（L61-74）：calc 非空 → actor.system.abilities[ability].dc ?? 8 + prof（L70-71）；
  calc 为空 → simplifyBonus(dc.formula, rollData)（L69）；算不出来 → null（L73）。与 save 同构。
  消费点：check.mjs 的 #rollCheck L94-100 → rollData.target = Number.isFinite(dc) ? dc : this.check.dc.value
  ⇒ F12 直接读 item.system.activities.get("<id>").check.dc.value（物品 prepare 之后就是具体数值）；宏里读 workflow.activity.check.dc.value。

▸ P5 · duration 三套计时：dnd5e 不参与剩余时长计算
  dnd5e 5.3.3 的 active-effect.mjs 全文 grep startRound / remaining 的计算逻辑【0 命中】（只有 L449/L1001 的读取）
  ⇒ 剩余时长完全由 Foundry 核心 v13 决定：【有 combat 引用且 startRound 已记录 → 按战斗回合制；否则按 startTime + seconds 现实时间制】。
  谁写：startTime 由核心在创建效果时写（Date.now()）；combat / startRound / startTurn 由核心在战斗中创建时记录，
    且 **DAE 施加 AE 时也显式写**（DAE GMAction.ts L390-396：aeData.duration.startRound = game.combat?.round；startTurn = game.combat?.turn）。
    dnd5e 5.3.3 自身不写（migration.mjs L1051-1052 只在迁移时把这三项清 null）；midi 不写。
  seconds 与 rounds/turns 同时给 → 核心按「战斗中 / 非战斗」二选一，不会两套都算；**惯例是二选一**：要 3 回合就写 rounds:3，别写 seconds。
  无战斗时 rounds 仍有意义（核心按 dnd5e 默认 1 回合 = 6 秒换算成现实时间继续倒计时），但「3 回合」的语义只在战斗内精确。
  ⇒ 我们的做法（duration 留 null = 永久 + midi OverTime 的 saveCount 控止血）是官方组合，不必给默认秒数 —— 给 60 秒反而会在长战斗里提前消失。
  F12 验证：const e = game.actors.getName("X").effects.find(e => e.name === "中毒"); e.duration; 推进回合后重读 e.duration.remaining。

▸ P6 · flags.dnd5e.riders = dnd5e 自己维护的【派生缓存】，工具不要主动写
  谁写：Item5e#preUpdateActivities（module/data/item/templates/activities.mjs L390-414）——
    任何 system.activities 变更时，从所有 enchant 活动的 effects[].riders.{activity,effect} 汇总成 Set，
    非空写 flags.dnd5e.riders、空则写 flags.dnd5e.-=riders 删除（**只含 activity / effect 两个键，item 不进 flag**）。
  谁读：① Activity#isRider（base-activity.mjs L179，item.getFlag("dnd5e","riders.activity")?.includes(id)）→ 编辑器显示；
        ② **功能性读取**：Actor5e#allApplicableEffects（actor.mjs L360-365）—— riders.effect 里列出的效果【被跳过、不单独生效】
           （rider 效果由附魔链自己管理）。
  冲成 {} 的后果：isRider 全 false（编辑器把 rider 活动当普通活动）；actor.mjs L364 的过滤失效（rider 效果若在角色身上会被重复当作适用效果）。
    **但它是派生缓存，下一次任何 system.activities 更新会自动重算覆盖** ⇒ 一般不持久。
  ⇒ 工具策略：不要主动写、不要依赖它存在。走 Item.update 且带 system.activities 变更时 dnd5e 自动重算；
    若更新绕开该路径（直接 patch flags / 只动 effects），自己按同规则补写。
  ⚠️ 本机核实：样本库 105 个导出件里 riders 命中 **368** 处 ⇒ 字段真实且普遍存在。

▸ P7 · spell 的 prepared：0 / 1 / 2 = 未准备 / 已准备 / 始终准备（本主题原先的推断正确）
  字段：module/data/item/spell.mjs L53 → prepared: NumberField({required, nullable:false, integer, min:0, initial:0})
    —— **没有 max 约束**，写 3 也能落库（不报错，UI 按 0/1/2 解释）。
  语义：CONFIG.DND5E.spellPreparationStates（config.mjs L3148-3161）：0=unprepared、1=prepared、2=always；
    迁移确认（spell.mjs L301）if (this.prepared === 2) return {mode:"always", prepared:1}。
  **0 = 未准备**（不是「非准备型」）。是否参与准备计数由施法方式决定：
    canPrepare（L183-186）= !!CONFIG.DND5E.spellcasting[method]?.prepares；
    countsPrepared（L226-229）= prepares && level>0 && prepared===1。
  非准备型方法：施法方式表（config.mjs L3060-3120）里只有 pact、spell 带 prepares:true；atwill / innate / ritual 无
    ⇒ 这些法术的 prepared 不参与计数、不影响施放（施放门槛是 actor 的槽位）。写 0 或 1 无功能差别。
  ⚠️ 一个系统简化值得知道：dnd5e 5.3 里【术士法术的 method 也是 "spell"】（系统只有 spell / pact 两种带槽位的方法，且 spell 标了 prepares:true）
    ⇒ 按系统实际行为，术士法术**也会**显示 prepared 开关并计数。这与规则书「术士不准备法术」不同，是系统简化，不是 bug。

▸ P8 · 检定 / 攻击加值落点：原先列的三个都对，**漏了第四个 —— attack 活动自带 attack.bonus**
  tool：module/data/item/tool.mjs L54 → bonus: FormulaField({required:true}) —— **存在**，支持 @ 数据绑定；
    消费在 check.mjs 的检定（tool 匹配时读 item.system.bonus）。
  攻击加值：attack-data.mjs 的 getAttackData（L260-274）把各部分**全部合进同一个 parts 数组求和**：
    mod（ability≠none 时）+ prof + **bonus: this.attack.bonus（活动级！）**
    + weaponMagic（weapon.magicAvailable ? weapon.magicalBonus，需武器带 mgc 属性才计入）
    + ammoMagic + actorBonus（actor.system.bonuses[actionType].attack）+ situational。
  ⇒ **system.magicalBonus 与 system.bonuses.mwak.attack 不互斥、不覆盖，是同一次掷骰里的两个加项**；magicalBonus 额外要求 magicAvailable。
  ⇒ **活动级入口确实有**：attack 活动的 attack.bonus（attack-data.mjs L26，FormulaField）+ 暴击伤害 damage.critical.bonus（L38）。
    这是攻击唯一的活动级加值入口；check / save / damage 活动没有对应的通用 bonus 字段。
  （本工具 create_item_minimal 的 toHit 参数正是写进 attack.bonus，位置正确。）

▸ P9 · facility 完整结构（本主题原先只写了 type + level）
  完整 system 键（module/data/item/facility.mjs 的 defineSchema L36-79，另混入 ActivitiesTemplate + ItemDescriptionTemplate）：
    building: {built(bool), size("cramped")} ｜ craft: {item(DocumentUUID Item), quantity(1)}
    defenders: {value[], max} ｜ disabled(bool) ｜ enlargeable(bool) ｜ free(bool)
    hirelings: {value[], max} ｜ level(initial **5**) ｜ order(str)
    progress: {value(0), max, order} ｜ size("cramped")
    trade: {creatures{value[],max}, pending{creatures, operation(buy|sell), stocked, value}, profit, stock{stocked,value,max}}
    type: {value:"basic", baseItem:false}
  baseItem:false 的设计意图：其他物品类型的 baseItem 是字符串（指向基础物品、供武器变体继承）；
    facility 没有「基础物品」概念，它是独立结构体，所以此处用布尔 false 表示「本类型无基础物品维度」。
  只写 type.value + level：物品能被核心识别（type=facility 已注册于 itemTypes），
    但建造进度 / 产出 / 贸易等据点工作流会读 progress{value,max,order}、order、trade —— 不写则面板显示未建造、功能空。
    要「可用」的最小集建议：level + progress{value,max,order} + order + size；craft / defenders / hirelings / trade 是各子系统，不用就不写。
  ⚠️ 诚实标注（第三方原话）：sheet 对 null 字段的逐项容忍未逐个实测，建议落库后开据点面板过一眼。
  ⚠️ 本机核实：样本库 105 个导出件里 progress / trade 命中 **0** —— 与我们「只写 type + level」的现状一致，暂无对照样本。

▸ P10 · 多活动「选择活动」弹窗：**没有**「两个都能手动点 + 永不弹窗」的正规设置
  候选计算：MidiActivityChoiceDialog.getActivities（src/module/apps/MidiActivityChoiceDialog.ts L13-24）——
    activities.filter(a => a.canUse !== false && !riders.includes(a.id) && !a.midiProperties?.automationOnly && !a.inProgress)。
    **automationOnly 确实在这一步被过滤**（L18）。
  弹窗判据：create（L27-34）：0 个 → null（整个使用不掷骰）；1 个 → 直接执行不弹；**2+（或 chooseActivity:true）→ 弹窗**。
    这个 ActivityChoiceDialog 是 **dnd5e 核心的类**（dnd5e.applications.activity.ActivityChoiceDialog），midi 只是继承它
    ⇒ **不装 midi 也会弹**（本主题原来只写了 midi 侧，补上这条）。
  hook 签名确认：asyncHooksCallAll("midi-qol.itemUseActivitySelect", { activities, item })（L22）
    —— 我们记的 ({activities, item}) 正确；可删数组条目，删到 1 个就不弹。
  可行变通（社区正规途径）：a) automationOnly:true —— 从候选消失、不再是「手动可点」，但仍是合法活动（otherActivityId 可触发、宏可直接 use()）；
    b) hook 里把 activities 替换成目标单元素（等于指定默认活动）；c) 宏 / 快捷键直接调 item.system.activities.get(id).use(...)，绕过选择弹窗。
何时用：写多活动物品、做变身、让效果按等级生效、读/改运行时值。

▸ relevantLevel（效果等级门槛 · 决定 AE 生不生效）
  计算：module/data/activity/base-activity.mjs L209-213 ——
    keyPath = (item.type === "spell" && item.system.level > 0) ? "item.level"
      : (visibility?.identifier ? "classes.<identifier>.levels" : "details.level")
    return getProperty(this.getRollData(), keyPath) ?? 0
  ⇒ spell → **基础 system.level**（3 环法术用 5 环位施放，relevantLevel 仍是 **3 不是 5**）；
    有 visibility.identifier（职业特性）→ 该职业等级；其余 → details.level（角色总等级）。
  ⚠️ 施放环级只影响 flags.dnd5e.scaling（缩放），**不改 relevantLevel** —— 两者别混。
  过滤：applicableEffects 判 (e.level?.min ?? -Infinity) <= level <= (e.level?.max ?? Infinity)
  ⇒ **level{min:null,max:null} 恒真、任何情况都应用** ✓（默认就该留空）

▸ check 活动的 dc 是「判定线」，不是装饰
  #rollCheck（check.mjs L100）：rollData.target = Number.isFinite(dc) ? dc : this.check.dc.value
  ⇒ 当 target 传给 rollSkill/rollAbility，聊天卡显示「DC x」并**参与成败判定**；
    midi 侧把 check 当 save-like 用（saveActivity?.save || saveActivity?.check），dc.value 就是对比线。
  算值：check-data.mjs prepareFinalData L63-72，与 save 完全同构 —— calculation 非空 → 属性 DC（ability getter 回退）；
    "" → simplifyBonus(formula)；都没有 → null。
  F12 探法：item.system.activities.get("<活动id>").check.dc.value，或 MidiQOL.Workflow.getWorkflow(msgUuid).activity.check.dc.value

▸ transform 活动（把「自己」变成另一个 Actor · 不是物品变形）
  profiles[] 每项：{ _id, cr(公式), level:{min,max}, movement(Set), name, sizes(Set), types(Set), uuid(DocumentUUID **必须指向 Actor**) }
  settings（transformation-setting.mjs）：{ effects(Set), keep(Set), merge(Set), other(Set), minimumAC(公式), preset(字符串), spellLists(Set), tempFormula(公式), transformTokens(布尔, initial true) }
    合法键出自 CONFIG.DND5E.transformation（config.mjs L3409+）：
      keep：physical/mental/saves/skills/gearProf/languages/class/feats/items/spells/bio/type/hp/tempHP/resistances/vision/self
      merge：saves/skills
      effects：all/origin/otherOrigin/background/spell/…
  ⇒ **与 summon 的本质区别**：summon = 在世界上新建独立 actor（召唤物）；
    transform = 把使用者自己 polymorph 成目标 Actor（可再变回来），transformTokens:true 还会改 token 视觉。
    midi 侧 transform 的 possibleOtherActivity = **false**（不能当子活动）。
  可抄骨架（变 CR1 野兽）：
    { "type":"feat", "name":"野性变身（狼）", "activities":[{ "type":"transform", "id":"act_transform",
      "activation":{"type":"bonus"}, "profiles":[{ "_id":"prof_wolf", "cr":"1", "level":{"min":2,"max":null},
      "movement":["walk"], "name":"狼", "sizes":["med"], "types":["beast"], "uuid":"Actor.<目标actorId>" }],
      "transform":{"customize":false,"mode":"cr","preset":"wildshape"},
      "settings":{"keep":["physical","saves","skills","class","feats"],"merge":["saves","skills"],
        "transformTokens":true,"tempFormula":"","minimumAC":""} }] }

▸ flags.dnd5e.scaling（升环放大）
  类型：**数字**（缩放阶数 int），不是对象。
  写入：module/documents/activity/mixin.mjs 的 _prepareUsageScaling（L493-516）——
    usageConfig.scaling = slotLevel − item.system.level（>0 时）；L511-515 写 messageConfig.data.system.scaling，
    并在与现值不同时 item.updateSource({"flags.dnd5e.scaling": usageConfig.scaling}) + item.prepareFinalAttributes()。
  ⚠️ 写在**使用时的物品克隆**上（临时生效、不落库）。
  F12 读「放大后的伤害骰」按优先级：① wf.damageRolls[0].formula（DamageRollComplete 之后，含放大效果）；
    ② wf.item.flags.dnd5e.scaling（阶数）；③ 公式里的 @scaling（= 阶数+1）与 @scaling.increase（= 阶数）。

▸ 读/改运行时值的正确时点（实弹教训）
  · wf.damageRolls 在 MidiActivityMixin 的 #rollDamage（L7605-7606）**掷完后**才填充
    ⇒ preDamageRoll 时是空的（wf.damageRolls?.[0]?.formula === undefined），这不是 bug 是设计。
  · 掷骰前想**读**公式：wf.activity.damage.parts（number/denomination/bonus/scaling）+ wf.item.getRollData()（@mod/@scaling）自己复算；
    最终公式从 DamageRollComplete 起读 wf.damageRolls[].formula。
  · 想**改**公式，三个入口按场景：
      ① midi-qol.preDamageRoll（单参 workflow）—— 没有公式对象，只能改 wf.item.system.damage.parts 再 prepareFinalAttributes()，副作用大、不推荐日常用；
      ② **midi-qol.dnd5ePreCalculateDamage / dnd5eCalculateDamage**（Hooks.ts L1806/L1840/L1871/L1905）——
         签名 (actor, damages, options)，**直接改 damages 数组里每项的 formula**，options.midi.totalDamage 由 midi 在 pre 后重算。
         注意它挂在 dnd5e 的「计算伤害」流（聊天卡伤害计算），不是 workflow 自动掷骰流；
      ③ midi 惯例加伤害：wf.bonusDamageRolls（追加伤害，掷骰后并入汇总）。

▸ 聊天卡上的消费 flag：真键是 use.consumed（不是 otherActivityConsumed）
  WorkflowDataFlags.otherActivityConsumed = "use.consumed"（Workflow.ts **L191**）⇒ 实际路径 **flags.midi-qol.use.consumed**。
  ⇒ 用 getFlag("midi-qol","otherActivityConsumed") **永远读不到**（顶层根本没这个键，只能得到 undefined）。
  写入时机（只在 other-activity 消费路径）：miss 门 L2438 写 false；消费确认 L2589（取消）/L2608（异常）写 false；
    L2600 成功写 consumed（getConsumptionData 的对象，未消耗时为 {}）。
  ⇒ **纯攻击（无子活动）根本不写这个 flag** —— 读到 undefined 是正常的。
  判定写法：getFlag("midi-qol","use.consumed") === false → 跳过；对象 / {} → 已结算。
  同族键：use.otherScaling。经 updatesCache（utils.ts L8926，按 workflow id = 聊天卡 uuid 缓存）→ getCachedDocument 应用。

▸ 活动 uuid 是稳定契约
  生成：item.getRelativeUUID(actor) + ".Activity." + id（documents/activity/mixin.mjs **L984**）
  三种形态（与实弹一致）：世界模板物品 Item.<itemId>.Activity.<活动id>；
    actor 上的物品 Actor.<actorId>.Item.<itemId>.Activity.<活动id>；
    token 上的物品（synthetic actor）Scene.<sceneId>.Token.<tokenId>.Actor.<actorId>.Item.<itemId>.Activity.<活动id>
  ⇒ 宏里定位：fromUuidSync(item.uuid + ".Activity." + activityId) 稳定可用（Foundry 嵌入式文档 uuid 规范）。
    **别手拼 actor 链** —— 用 item.uuid 拼接即可，Foundry 按父链解析。
  出处：dnd5e release-5.3.3 / midi-qol v13.0.55 逐行核实（2026-09-15）。`,
    'roll-data': `【动态引用 @公式 总表 · 出自用户资料库「飞书知识库/30-掷骰数据」+ 样本库实测落点】
何时用：任何公式字段都能塞 @ 引用，别写死数字——同一把武器给谁用、几级用，自动算对。
⚠️ 落点写错会被静默忽略（不报错、只是不生效）；写死 DC 会让高等级角色用起来全是错的。

【最常用】
@mod                            使用该行动时的当前属性调整值（武器伤害最常用："1d8 + @mod"）
@prof / @attributes.prof        熟练加值（@prof 在专精时自动加倍，用 @attributes.prof 规避）
@abilities.str|dex|con|int|wis|cha 的 .mod 调整值 / .value 属性值 / .dc = 8+熟练+调整 / .save.value 豁免
@attributes.spelldc 或 @attributes.spell.dc    施法 DC（做效果最常用）
@details.level / @details.cr    角色等级 / 挑战等级
@classes.<identifier>.levels    某职业等级（如 @classes.paladin.levels）
@scale.<父物品id>.<快捷栏id>    比例值（如 @scale.monk.die、@scale.rogue.sneak-attack）
@item.uses.value / .max、@item.level、@item.levels
@scaling / @scaling.increase    升环比例等级及其增量
其余全表（hp/ac/hd/movement/senses/init/skills/spells/statuses/currency/exhaustion）：
foundry_knowledge{topic:"manuals", file:"飞书知识库/30-掷骰数据.md"}

【@ 与 ## 的区别（DAE 效果专用）】
@字段  → 在【使用者】身上求值（力量18者用物品时 @abilities.str.mod = 8）
##字段 → 不求值，写进目标身上的 change，最终按【目标】的数据算（= 2）

【实测合法落点（样本库全量 grep，全部来自真实世界导出）】
damage.base.custom.formula             "2d6 + @mod +1"、"1@scale.monk.die + @mod"  ← 动态伤害骰走这里（须 custom.enabled:true）
activities.<act>.damage.parts[].bonus  "@mod"
activities.<act>.save.dc.formula       "8 + @prof"、"8 + @prof + @abilities.dex.mod"
activities.<act>.roll.formula          "1d20 + @mod"
healing.bonus / healing.custom.formula "@mod"、"@abilities.cha.mod + @classes.bard.levels"
effects[].changes[].value              OverTime 串内 "saveDC=@attributes.spelldc"；属性增减益 "@abilities.str.mod"
description.value                      富文本：@UUID[Compendium.包.Item.id]{名字}（可点实体链接）、[[lookup @name lowercase]]、[[/r 3d6]] 内联掷骰、[[/check dex dc=@abilities.con.dc]]
attributes.ac.formula                  "12 + @abilities.int.mod"（配合 attributes.ac.calc）

【DC 的坑】save.dc.calculation 实际可用取值只有两种：""（自定义，formula 可写数字也可写公式）、"spellcasting"（跟随使用者的施法 DC）。
⚠️ "flat" 被本资料库两条独立记录判定为不合法（formula 会被忽略、DC 丢回默认值），样本库 98 个 DC 实例中有效使用者为 0。
最省事的写法：不算数，直接引用 @attributes.spelldc 或 @abilities.con.dc。

【公式不生效时的排查顺序】① 是否写进了会被 5.3.3 清洗的字段（典型：activity.damage.parts[].formula 会被清空）② custom.enabled 是否为 true ③ 引用路径是否拼错——F12 打 canvas.tokens.controlled[0].actor.getRollData() 看真实可用键`,
    weapon: `【dnd5e 5.3.3 武器物品模板 · 已验证】
流程：foundry_create_entity{entityType:"Item", data:<本模板>} 创建物品 → foundry_modify_actor{action:"give", itemUuid} 给怪物。
铁律：伤害骰只写 system.damage.base{number,denomination,bonus,types}；activities 的 damage.parts 必须留空数组 + includeBase:true；写 parts[].formula 会被 5.3.3 清洗成空（怪物没伤害）。

完整模板（实测成功：守卫锯肉刀 1d6 挥砍 + 命中触发体质豁免，dnd5e 5.3.3 / Foundry 13.351）：
⚠️ 铁律：直接照抄本结构，字段勿精简——5.3.3 对缺失字段会拒绝（400 "Failed to create entity"）或静默清空。改动的只有：name/img/description/damage.base{number,denomination,types}/attack.ability/range.value/save.dc.formula。
{
  "name": "锯肉刀 Saw Cleaver",
  "type": "weapon",
  "img": "icons/weapons/axes/cleaver-black.webp",
  "system": {
    "description": { "chat": "", "value": "" },
    "source": { "rules": "2014", "revision": 1, "book": "", "page": "", "custom": "", "license": "" },
    "quantity": 1,
    "weight": { "value": 3, "units": "lb" },
    "price": { "value": 10, "denomination": "gp" },
    "attunement": "",
    "equipped": true,
    "rarity": "",
    "identified": true,
    "unidentified": { "description": "" },
    "mastery": "",
    "identifier": "saw-cleaver",
    "properties": [],
    "proficient": 1,
    "type": { "value": "simpleM", "baseItem": "" },
    "range": { "value": 5, "long": null, "reach": 5, "units": "ft" },
    "uses": { "spent": 0, "max": "", "recovery": [] },
    "armor": { "value": 10 },
    "ammunition": {},
    "crew": { "value": [] },
    "container": null,
    "cover": null,
    "hp": { "conditions": "", "dt": null, "max": 0, "value": 0 },
    "damage": {
      "base": { "number": 1, "denomination": 6, "bonus": "", "types": ["slashing"],
        "custom": { "enabled": false, "formula": "" },
        "scaling": { "mode": "", "number": null, "formula": "" } },
      "versatile": { "types": [], "custom": { "enabled": false }, "scaling": { "number": 1 } }
    },
    "activities": {
      "dnd5eactivity000": {
        "_id": "dnd5eactivity000",
        "type": "attack",
        "name": "",
        "activation": { "condition": "", "override": false, "type": "action", "value": 1 },
        "ammunition": "",
        "attack": { "ability": "str", "bonus": "", "critical": { "threshold": null }, "flat": false,
          "type": { "classification": "weapon", "value": "melee" } },
        "attackMode": "oneHanded",
        "attackRollPerTarget": "default",
        "consumption": { "scaling": { "allowed": false, "max": "" }, "spellSlot": true, "targets": [] },
        "damage": { "critical": { "bonus": "" }, "includeBase": true, "parts": [] },
        "description": { "chatFlavor": "" },
        "duration": { "concentration": false, "override": false, "special": "", "units": "inst", "value": "" },
        "effectConditionText": "",
        "effects": [],
        "flags": {},
        "fumbleThreshold": 1,
        "ignoreTraits": { "ida": false, "idi": false, "idm": false, "idr": false, "idv": false },
        "img": null,
        "isOverTimeFlag": false,
        "macroData": { "command": "", "name": "" },
        "midiProperties": { "autoCEEffects": "default", "autoConsume": false, "autoTargetAction": "default",
          "autoTargetType": "any", "automationOnly": false, "chooseEffects": false, "confirmTargets": "default",
          "displayActivityName": false, "forceConsumeDialog": "default", "forceDamageDialog": "default",
          "forceRollDialog": "default", "identifier": "", "ignoreFullCover": false, "ignoreTraits": [],
          "magicDamage": false, "magicEffect": false, "noConcentrationCheck": false,
          "otherActivityAsParentType": true, "otherActivityCompatible": true, "removeChatButtons": "default",
          "rollMode": "default", "skipConcentrationCheck": false, "toggleEffect": false,
          "triggeredActivityConditionText": "", "triggeredActivityConfigure": true, "triggeredActivityConsume": true,
          "triggeredActivityId": "none", "triggeredActivityRollAs": "self", "triggeredActivityTargets": "targets" },
        "otherActivityAsParentType": true,
        "otherActivityId": "dnd5eactivity100",
        "otherActivityUuid": "",
        "overTimeProperties": { "postRemoveConditionText": "", "preRemoveConditionText": "", "rollAs": "target", "saveRemoves": true },
        "range": { "override": false, "special": "", "units": "ft", "value": "5" },
        "sort": 0,
        "target": { "affects": { "choice": false, "count": "", "special": "", "type": "creature" },
          "override": false, "prompt": true,
          "template": { "contiguous": false, "count": "", "height": "", "size": "", "stationary": false,
            "type": "", "units": "ft", "width": "" } },
        "useConditionReason": "",
        "useConditionText": "",
        "uses": { "max": "", "recovery": [], "spent": 0 },
        "visibility": { "level": {}, "requireAttunement": false, "requireIdentification": false, "requireMagic": false }
      }
    }
  },
  "effects": [],
  "flags": { "dnd5e": { "riders": { "activity": [] } } }
}
要点：
- attack.bonus 留 "" = 系统自动算（能力修正+熟练）；写死则写总加值字符串（如 "3"）
- 物品级 range.value 近战写数字 5；活动内 range.value 写字符串 "5"；远程写活动 range.value "80" + units "ft"
- 活动 _id 必须 16 位字母数字：dnd5eactivity000=攻击活动、dnd5eactivity100=豁免活动
- 命中带豁免（毒/流血/麻痹）三件套缺一不可：attack.otherActivityId="dnd5eactivity100" + save 活动（完整模板见 save-activity）+ 物品顶层 effects 放 ActiveEffect（完整模板见 effect）
- type.value 用官方简称（simpleM/simpleR/martialM/martialR/natural）；identifier 英文小写唯一 id（如 saw-cleaver）；系统自动生成 _id/_stats/folder/ownership，不要手写
- img 用图标真源（grep 资料库 fvtt-icon-paths.txt 或照抄示例）`,
    'save-activity': `【5.3.3 豁免活动完整模板 · 实测成功（锯肉刀流血：命中→DC11 体质豁免→失败流血）】
攻击命中后目标过豁免、失败中状态。三件套缺一不可：

① attack 活动必须设 "otherActivityId": "dnd5eactivity100" 指向 save 活动（漏了 = 攻击不触发豁免，多多剑翻车点之一）
② save 活动本体（照抄勿精简，damage 是 onSave 结构不是 includeBase！）：
{
  "dnd5eactivity100": {
    "_id": "dnd5eactivity100",
    "type": "save",
    "name": "流血·体质豁免",
    "activation": { "condition": "", "override": false, "type": "special", "value": null },
    "consumption": { "scaling": { "allowed": false, "max": "" }, "spellSlot": true, "targets": [] },
    "damage": { "critical": { "allow": false }, "onSave": "none", "parts": [] },
    "description": { "chatFlavor": "被锯肉刀砍中的目标必须进行一次 DC 11 体质豁免，失败则流血。" },
    "duration": { "concentration": false, "override": false, "special": "", "units": "inst", "value": "" },
    "effectConditionText": "",
    "effects": [ { "_id": "bleedOT000000001", "level": {}, "onSave": false } ],
    "flags": {},
    "friendlySave": "default",
    "ignoreTraits": { "ida": false, "idi": false, "idm": false, "idr": false, "idv": false },
    "img": null,
    "isOverTimeFlag": false,
    "macroData": { "command": "", "name": "" },
    "midiProperties": { "autoCEEffects": "default", "autoConsume": false, "autoTargetAction": "default",
      "autoTargetType": "any", "automationOnly": false, "chooseEffects": false, "confirmTargets": "default",
      "displayActivityName": false, "forceConsumeDialog": "default", "forceDamageDialog": "default",
      "forceRollDialog": "default", "identifier": "", "ignoreFullCover": false, "ignoreTraits": [],
      "magicDamage": false, "magicEffect": false, "noConcentrationCheck": false,
      "otherActivityAsParentType": true, "otherActivityCompatible": true, "removeChatButtons": "default",
      "rollMode": "default", "skipConcentrationCheck": false, "toggleEffect": false,
      "triggeredActivityConditionText": "", "triggeredActivityConfigure": true, "triggeredActivityConsume": true,
      "triggeredActivityId": "none", "triggeredActivityRollAs": "self", "triggeredActivityTargets": "targets" },
    "otherActivityAsParentType": true,
    "otherActivityId": "",
    "overTimeProperties": { "postRemoveConditionText": "", "preRemoveConditionText": "", "rollAs": "target", "saveRemoves": true },
    "range": { "override": false, "special": "", "units": "self", "value": "" },
    "save": {
      "ability": ["con"],
      "dc": { "calculation": "flat", "formula": "11" }
    },
    "sort": 100000,
    "target": { "affects": { "choice": false, "count": "", "special": "", "type": "creature" },
      "override": false, "prompt": true,
      "template": { "contiguous": false, "count": "", "height": "", "size": "", "stationary": false,
        "type": "", "units": "ft", "width": "" } },
    "useConditionReason": "",
    "useConditionText": "",
    "uses": { "max": "", "recovery": [], "spent": 0 },
    "visibility": { "level": {}, "requireAttunement": false, "requireIdentification": false, "requireMagic": false }
  }
}
③ 真正的中毒/流血效果挂【物品级 effects 数组】（ActiveEffect 结构），不是 activity.effects！

⚠️ 层级铁律（多多剑翻车根因）：save activity 的 effects 是【空壳】[{_id, level:{}, onSave:false}]——往里面塞 name/statuses/duration 会被 5.3.3 清洗成空（实测：statuses 全丢）。挂状态（poisoned 等）/OverTime 必须写在物品顶层 effects 数组（完整 ActiveEffect 模板见 effect 主题）。锯肉刀 = 本模板 + 物品级「流血」ActiveEffect（changes 写 OverTime），实测正常；照抄勿改。
要点：dc.formula 写固定数字字符串（如 "11"）；onSave:false = 豁免失败才生效；save.ability 数组如 ["con"]；_id 必须【恰好】16 位字母数字（如 "bleedOT000000001"=16 位；17 位如 "poisonOT000000001" 会被 5.3.3 拒绝创建报 "Failed to create entity"——实测翻车点，生成后数一遍位数）。

⚠️ 关于本模板里 "otherActivityId": ""（这是原样导出的值，别当成该照抄的习惯）：midi-qol 里 attack 的这个字段【默认就是空串 = 自动探测 auto】。只要本 item 上还有其它类型合格（含 utility）且 otherActivityCompatible 为真的活动，它就会被自动绑到这次攻击上——点一次攻击连带别人的豁免与伤害（实测翻车点，《挽歌》那次）。需要各活动独立时，显式写 "none"（不是 ""）。本插件的 create_item_minimal 建出来的活动已是 "none"，不必手改；只有手搓 JSON 时才要自己写。详见知识库 FVTT-monster-spec-v2_1.md 的勘误块。`,
    effect: `【物品 ActiveEffect 完整模板 · 实测成功（锯肉刀流血 OverTime）】
放进物品/特性顶层的 effects 数组（注意：不是 activity 的 effects！层级见 save-activity 铁律）。照抄勿精简——特别是 img（不是 icon！写 icon 会被 5.3.3 丢弃）。最简情况可用 foundry_add_effect{uuid, statusId:"poisoned"} 给 actor 挂现成状态。

{
  "_id": "bleedOT000000001",
  "name": "流血 Bleeding",
  "img": "icons/skills/wounds/blood-drip-droplet-red.webp",
  "origin": null,
  "type": "base",
  "system": {},
  "changes": [
    { "key": "flags.midi-qol.OverTime", "mode": 0, "priority": 20,
      "value": "turn=start,damageRoll=1d4,damageType=slashing,saveDC=11,saveAbility=con,saveCount=1-,label=流血" }
  ],
  "disabled": false,
  "duration": { "startTime": null, "seconds": 60, "combat": null, "rounds": null,
    "turns": null, "startRound": null, "startTurn": null },
  "description": "<p>伤口流血不止：每回合开始受到 1d4 挥砍伤害，可重复进行 DC 11 体质豁免，成功即止血。</p>",
  "tint": "#ffffff",
  "transfer": false,
  "statuses": [],
  "sort": 0,
  "flags": {
    "core": { "overlay": false },
    "dae": { "disableCondition": "", "disableIncapacitated": false, "dontApply": false,
      "durationExpression": "", "enableCondition": "", "macroRepeat": "none",
      "selfTarget": false, "selfTargetAlways": false, "showIcon": false,
      "specialDuration": [], "stackable": "noneName" }
  }
}
要点：
- img 是图标字段（ActiveEffect 没有 icon 字段，写 icon 会被丢弃）
- statuses 放状态 id（poisoned/prone 等，见 status-list）→ 挂现成状态（与 save activity 配合：豁免失败才触发）
- changes 是附加自动化，常用 key：
  · flags.midi-qol.OverTime：持续伤害/状态，value 逗号式 "turn=start,damageRoll=1d4,damageType=slashing,saveDC=11,saveAbility=con,saveCount=1-,label=流血"（turn=start=每回合开始、saveCount=1-=每回合可豁免移除）
  · flags.midi-qol.disadvantage.attack.all / .check.all：攻击/检定劣势，value "1"
  · 需要 midi-qol 模块；mode 0=覆盖 2=加 5=减
- duration.seconds：状态持续秒数（60=1 分钟=10 轮战斗）；永久状态不写 duration 或用 duration.seconds=null
- 完整「命中→豁免→失败中毒/流血」链路 = weapon 的 attack 活动 otherActivityId 指向 save 活动 + save 活动空壳 effects + 本模板（见 save-activity）`,
    creature: `【dnd5e 5.3.3 NPC 数值骨架 · 核心字段已验证】
建议先 foundry_get_entity(uuid, summary:true) 读一个现成同类怪拿准确字段路径再改；手写参考此骨架（僵尸，已验证数值）：

{
  "name": "僵尸",
  "type": "npc",
  "img": "systems/dnd5e/tokens/undead/Zombie.webp",
  "system": {
    "abilities": {
      "str": { "value": 13, "mod": 1 }, "dex": { "value": 6, "mod": -2 }, "con": { "value": 16, "mod": 3 },
      "int": { "value": 3, "mod": -4 }, "wis": { "value": 6, "mod": -2 }, "cha": { "value": 5, "mod": -3 }
    },
    "attributes": {
      "hp": { "value": 22, "max": 22, "formula": "3d8+9" },
      "ac": { "flat": 8, "formula": "" },
      "movement": { "walk": 20, "fly": 0, "swim": 0, "climb": 0, "burrow": 0, "units": "ft" },
      "senses": { "darkvision": 60, "units": "ft", "special": "" },
      "languages": { "value": "", "custom": "" },
      "details": { "type": { "value": "undead", "subtype": "" }, "alignment": "Neutral Evil",
        "cr": 0.25, "source": { "rules": "2014", "book": "MM", "page": "", "custom": "" } },
      "damage": { "immunities": ["poison"], "resistances": [], "vulnerabilities": [] },
      "conditionImmunities": ["poisoned"]
    }
  },
  "items": [],
  "effects": [],
  "prototypeToken": { "name": "僵尸", "width": 1, "height": 1, "displayBars": 40,
    "displayName": 50, "disposition": -1, "sight": { "enabled": true, "range": 0, "angle": 360, "visionMode": "basic" } },
  "flags": {}
}
要点：元素名小写（"poison"/"fire"）；状态免疫用状态 id；伤害骰在物品 damage.base（见 weapon）不在 actor；特性是 feat 物品放 items（见 feat）。`,
    feat: `【5.3.3 特性物品模板（被动特性，如不死坚韧）· 已验证】
type:"feat"，放怪物 items 数组：
{
  "name": "不死坚韧",
  "type": "feat",
  "img": "icons/magic/death/undead-skeleton-deformed-red.webp",
  "system": {
    "description": { "value": "若受到的伤害使生命值降至 0 且未造成重伤，则改为降至 1 点生命。需通过 DC 5+所受伤害的体质豁免（光辉伤害或重击直接死亡）。" },
    "source": { "rules": "2014", "book": "MM", "page": "", "custom": "" },
    "uses": { "spent": 0, "max": null, "recovery": [] },
    "type": { "value": "monster", "subtype": "" },
    "requirements": "",
    "recharge": { "value": null, "formula": "1d6" },
    "properties": []
  },
  "effects": [],
  "flags": {}
}
要点：纯描述型特性没有自动判定逻辑，FVTT 只展示文本；需要真正自动判定（如豁免失败上状态）用武器 save 活动（见 save-activity）或 ActiveEffect（见 effect）。`,
    spell: `【5.3.3 法术物品模板 · 结构部分验证，细节字段未逐项核对】
type:"spell"；伤害骰同样走 damage.base（见 weapon 铁律），范围法术用 save 活动：
{
  "name": "火球术",
  "type": "spell",
  "img": "icons/magic/fire/projectile-fireball-smoke.webp",
  "system": {
    "description": { "value": "" },
    "source": { "rules": "2024", "book": "PHB", "page": "", "custom": "" },
    "level": 3,
    "school": "evo",
    "preparation": { "mode": "prepared", "prepared": false },
    "properties": ["vocal", "somatic", "material"],
    "materials": { "value": "", "consumed": false, "cost": 0, "supply": 0 },
    "activation": { "type": "action", "value": 1, "condition": "" },
    "duration": { "value": "inst", "units": "inst" },
    "range": { "value": 150, "long": null, "units": "ft" },
    "target": { "template": { "type": "sphere", "size": "20", "count": "", "contiguous": false, "units": "ft" },
      "affects": { "type": "creature", "count": "", "special": "" } },
    "damage": { "base": { "number": 8, "denomination": 6, "bonus": "", "types": ["fire"],
      "custom": { "enabled": false, "formula": "" },
      "scaling": { "mode": "whole", "number": 1, "formula": "" } } },
    "activities": {
      "dnd5eactivity000": {
        "type": "save",
        "name": "",
        "save": { "ability": ["dex"], "dc": { "calculation": "spellcasting", "formula": "" },
          "scaling": { "mode": "none", "formula": "", "bonus": "" } },
        "damage": { "critical": { "bonus": "" }, "includeBase": true, "parts": [] },
        "effects": [],
        "activation": { "type": "action", "value": 1, "condition": "" },
        "duration": { "value": "inst", "units": "inst", "concentration": false },
        "target": { "template": { "type": "sphere", "size": "20", "count": "", "contiguous": false, "units": "ft" },
          "affects": { "type": "creature", "count": "", "special": "" } },
        "_id": "dnd5eactivity000"
      }
    },
    "uses": { "spent": 0, "max": null, "recovery": [] }
  },
  "effects": [],
  "flags": {}
}
要点：dc.calculation:"spellcasting" = 用施法者法术 DC；范围法术 activity type:"save"；升环加成 damage.base.scaling{mode:"whole",number:1} = 每环 +1d6。复杂法术建议再 foundry_get_entity(summary:true) 读一个现成法术核对。`,
    'status-list': `【常用状态效果 id 速查 · dnd5e 核心】
foundry_add_effect{statusId}、effects.statuses 用这些 id（全量用 foundry_list_status_effects 查）：
poisoned 中毒 · paralyzed 麻痹 · prone 倒地 · stunned 震慑 · frightened 恐慌 · charmed 魅惑 ·
blinded 目盲 · deafened 耳聋 · invisible 隐形 · restrained 束缚 · grappled 擒抱 ·
unconscious 昏迷 · petrified 石化 · exhaustion 力竭 · flying 飞行 · incapacitated 失能 ·
dead 死亡 · disease 疾病 · cursed 诅咒 · bleeding 流血 · burning 燃烧
（状态自带的核心规则由状态配置决定；第三方模块另有 dazed/flanked/hasted/slowed/rage 等。）`,
    bonuses: `【加伤/减益/改动速查 · 出自用户资料库「已验证机制速查与开工铁律」+ 用户世界在用键】
全部经 ActiveEffect 的 changes 数组写：{key, mode, value, priority}，挂在物品/特性 effects 里（见 effect 主题）。
- 武器攻击附加伤害：system.bonuses.mwak.damage（近战）/ rwak.damage（远程）/ msak.damage（近战法术）/ rsak.damage（远程法术），mode 2，value "1d4[fire]"（用户世界熔火战旗/秘法魔剑士在用）
- Optional 可弹窗加值：flags.midi-qol.optional.<名字>.damage.all，mode 0，value "1d6[force]"；加 flags.midi-qol.optional.<名字>.force（值=条件表达式，真则强制生效不弹窗）+ .label（弹窗标题）
- ⚠️ 无视护甲：**flags.midi-qol.ignoreArmor / ignoreShield 在 midi-qol v13 源码里查无此键**
  （2026-09-16 对 v13.0.55 / master 全仓 grep 含注释 = 0 命中）⇒ 写入无害但**不会生效，不要依赖**。
  本机资料库《FVTT-已验证机制速查与开工铁律.md》记有这两个键，属旧版本 / 其它模块的残留，
  与其矛盾时以 v13 源码为准。要「无视护甲」的现行做法请查 midi 的 traits / DR 键（见 midi-flags 主题）。
- 重击阈值：flags.midi-qol.criticalThreshold mode 0 "19"（19-20 重击）
- 移动减速：system.attributes.movement.walk mode 1 value "0.5"（速度减半）
mode 表：0=CUSTOM（交模块处理，midi flags 都用这个）/ 1=MULTIPLY乘 / 2=ADD加 / 3=DOWNGRADE / 4=UPGRADE / 5=OVERRIDE
⚠️ 需要 midi-qol 模块（用户已装 13.0.55）。不确定的键先 foundry_knowledge 查 data-dict 或用户世界找样本，0 样本不用。`,
    'midi-over-time': `【持续伤害/持续效果 OverTime · 出自用户资料库 data-dict §17 + 开工铁律】
⚠️ 2026-09-16 补齐完整参数表（midi-qol v13 parseOvertimeDetails / utils.ts，逗号分隔 key=value，值里先做 @字段 替换）：
  turn=start(默认)|end                 触发时点（目标回合开始/结束）
  label（或 name）=文本                掷骰风味名，默认用效果名
  rollType=save|check|skill|damage     可 a|b 多值；默认：有 saveAbility→save，否则 damage
  saveAbility=str..cha                 可 | 多值；掷豁免/检定的属性
  saveDC=数值或公式                    判定线（Roll.safeEval，-1=无）
  saveDamage=nodamage(默认)|halfdamage|fulldamage   豁免后伤害结算方式
  damageRoll=骰式 ｜ damageType=类型 ｜ damageBeforeSave=true|false(默认 false，伤害是否先于豁免)
  saveCount / failCount               见下方语法
  actionSave=dialog|roll              交互式豁免
  applyCondition（兼容 condition）=条件表达式   false 则本回合跳过
  removeCondition=条件文本             满足即移除效果
  allowIncapacitated / killAnim=bool   失能也触发 / 归零播放击杀动画
  macro / itemName / chatFlavor / rollMode    每回合宏 / 掷骰显示名 / 风味 / 掷骰模式
  fastForwardDamage / fastForwardAttack / autoRollAttack / autoRollDamage=bool 默认 true
⚠️ saveRemove / failRemove（写在 OverTime 串里的）自 13.0.43 起【已废弃】（logCompatibilityWarning）→ 用 saveCount/failCount 替代。
   ⚠️ 千万别和【活动字段 overTimeProperties.saveRemoves】搞混 —— 那个是另一个东西，【仍然有效】（样本库大量在用）。

saveCount 语法（parseCountAction）：n[c][-|+][effectSpec]
  1 或 1-      → 1 次豁免成功即【移除】
  2-           → 2 次成功移除（不要求连续）
  2c-          → 2 次【连续】成功移除（失败重置计数）
  2+           → 2 次成功后效果变【永久】（不再被移）
  2-petrified  → 2 次成功移除 + 附加 petrified 状态（3c+prone 同理：3 次连续成功 → 永久 + prone）
  ⚠️ saveCount=1,2 【不合法】—— 逗号是参数分隔符不是计数列表；多条件用单字段 n[-|+][effect]。
  默认（有 saveDC 但无 saveCount/failCount）= {count:1, remove}，一次成功即移除。
我们工具最常用的写法 turn=start,damageRoll=1d4,damageType=poison,saveDC=13,saveAbility=con,saveCount=1-,label=中毒 就是标准形态（saveCount=1- 表示每回合判定直到豁免成功）。
ActiveEffect changes：{ key: "flags.midi-qol.OverTime", mode: 0, value: "<逗号参数串>" }
⚠️ 注意大小写：O 和 T 大写（写 OverTime，写错为 OverTime 静默不触发）。
value 逗号参数串（全部可选，常用组合）：
turn=start,turn=end（触发时点，可同时）
damageRoll=1d4（每轮伤害骰）
damageType=piercing（伤害类型，英文：fire/cold/necrotic=暗蚀/psychic=心灵）
saveDC=14,saveAbility=con（豁免终止，ability 用 str/dex/con/int/wis/cha 缩写）
saveCount=1-（豁免成功几次后结束；"1-" 语法需 midi 13.0.37+，用户 13.0.55 ✓；老写法 saveRemove 已弃用）
label=放血（显示名）
例（放血：每回合开始 1d4 穿刺，体质 DC14 豁免成功即止）：
{ "key": "flags.midi-qol.OverTime", "mode": 0, "value": "turn=start,damageRoll=1d4,damageType=piercing,saveDC=14,saveAbility=con,saveCount=1-,label=放血" }
⚠️ 伤害光环限制：OverTime 挂在 aura（光环）送达的效果上不掉血（用户实测），只做属性增减益。`,
    'midi-flags': `【midi-qol 常用 flags 速查 · 出自用户资料库「midi的物品宏使用指南」+ 43-midi-qol标志参考】
- flags.midi-qol.onUseMacroName 两种写法：
  ① 物品级（挂在物品 flags）方括号式："[postActiveEffects]ItemMacro"——该物品被使用时在指定阶段调用自身宏（用户世界 11 处物品全此模式，金标准）
  ② AE 级（挂 ActiveEffect flags）逗号式："ItemMacro, postAttackRoll"——⚠️ 在用户 midi 13.0.55 实测不触发，禁用；且非转移效果上 ItemMacro 需 AE.origin 填物品 UUID 否则重写成空
- flags.dae.macro { name:"<任意>", type:"script", scope:"global", command:"<宏体JS>" }——物品宏本体存放处（与 onUseMacroName 配套，见 item-macro 主题）
- macroPass（触发时点）全表：preItemRoll 掷骰前 / preAttackRoll 攻击前 / preCheckHits 判定命中前 / postAttackRoll 攻击判定后（命中引爆）/ preDamageRoll 伤害前 / postDamageRoll 伤害后 / preSave 豁免前 / postSave 豁免后 / postActiveEffects 动态效果生效后（施放附魔）/ isDamaged 受击 / isHealed 治疗
- 其余常用 flags：optional.*（见 bonuses）、OverTime（见 midi-over-time）、criticalThreshold（见 bonuses）
  ⚠️ ignoreArmor / ignoreShield 在 v13 已不存在（详见上一条），别再写。
- ⚠️ 同一物品放多个「会结算」的活动时，另见 **other-activity 主题**（otherActivityId 绑定方向、automationOnly、双伤害模型）—— 这块不在 flags 里，但踩坑率最高。
⚠️ 任何没把握的 flags 键先 foundry_knowledge 查资料库或用 grep 找用户世界样本，0 样本 = 臆造，禁用。`,
    'other-activity': `【活动间绑定 otherActivity · 多活动共存 / 连带结算（源码核查 + 实机验证）】
一句话：同一 item 上可以放多个「会结算」的活动，**每个活动的 otherActivityId 显式写 "none" 就互不干扰**；不写（attack 默认空串 = 自动探测）就会被 midi 串到别的活动上，一次点击打出双份。

- otherActivityId 是 **midi-qol 注入的字段，不是 dnd5e 核心**（核心唯一「活动引用活动」的机制是 Forward 活动，module/data/activity/forward-data.mjs 的 activity.id）。它定义在 midi 的 src/module/activities/{Attack,Check,Save,Utility}Activity.ts 活动 schema 顶层。
- **绑定方向 = 主 → 子**：写在**主活动**顶层，值是**被引用子活动**的 id（或 identifier）。只有 attack / check / save / utility 能当主（Changelog:1246 把该设置从 summon/cast/damage/forward/enchant/heal 上移除了）。

▸ **同一个物品放两个 save 活动安全吗？—— 安全，零连带**（2026-09-14 从弹窗源码核实）。
  点物品时的判定流：
    ① 候选过滤（MidiActivityChoiceDialog）：canUse ≠ false 且非 automationOnly 且非 inProgress → 两个都入选
    ② 弹窗（**2 个及以上才弹**）「选择活动」—— 这不是干扰，是标准 UX
    ③ 结算：**只跑选中的那个**；两个默认 otherActivityId = "none" 互不引用 → **零连带**
  ⇒ **两个 save 用不同 DC / 不同属性完全没问题**：DC 是活动自身的（save.dc.calculation/formula + save.ability）
     互不共享；豁免掷骰模式（getSaveRollModeFor）也按各活动自己的配置走。
  ⚠️ **auto 探测是「两遍过滤」（2026-09-15 更正，此前只说了第一遍）**：
     第一遍：automationOnly && otherActivityCompatible && uuid ≠ 自身 → **恰好 1 个**就绑它；
              0 个或 ≥2 个 → 进第二遍。
     第二遍：otherActivityCompatible && uuid ≠ 自身（**不要求 automationOnly**）→ **恰好 1 个**就绑它；
              0 个或 ≥2 个 → 不绑（返回 null，**静默、不报错**）。
     ⇒ 实际后果：「attack(\"\") + 物品上恰好 1 个 save（哪怕它不是 automationOnly）」**第二遍会自动绑定它**
        —— 所以「命中后才豁免」这类结构留空串本来就能工作，**不必显式写 ID**；
        但**两个 save 时出现歧义 → 不绑**，所以「双 save 零连带」的结论不受影响。
     ⇒ 想免弹窗：把子活动设 midiProperties.automationOnly:true（第一遍精确绑定它），
        或在 midi-qol.itemUseActivitySelect 里删候选。
  ⇒ **想免弹窗**：其中一个设 midiProperties.automationOnly:true（会被 auto 探测精确绑定），
     或在 midi-qol.itemUseActivitySelect 里删候选。
  ⇒ **结论：activities[] 里放双 save 可以直接用，不需要任何防护**；唯一要决定的是弹窗 UX（都暴露 vs 藏一个）。
- **默认值（关键）**：attack = ""（**空串 = 自动探测 auto**）；check / save / utility = "none"。
- **运行期解析**（MidiActivityMixin 的 get otherActivity）："" → 自动探测（**两遍过滤，见上**）；"none" → 无；其余 → activities.get(id)，取不到再按 identifier 反查 —— **显式填了 id 就不再复查兼容标记**。
- **资格门槛是双重的**，但**只在编辑期下拉与自动探测时生效**：① possibleOtherActivity 类型门槛（damage/heal/save/check/utility/contested-check 为 true；attack/enchant/summon/cast/forward/overtime/transform 为 false）；② midiProperties.otherActivityCompatible（**默认 true**，schema 在 MidiActivityMixin 的 midiProperties 里）。
- **automationOnly:true**：能从「选择活动」弹窗里藏掉，但**仍可被 otherActivityId 显式调用** —— 这是「给物品加个不占动作栏、不弹窗的隐藏子活动」的标准姿势。
- **弹窗规则**（MidiActivityChoiceDialog）：候选筛选 = canUse !== false && !riders.includes(id) && !midiProperties.automationOnly && !inProgress ⇒ 0 个跳过 / 1 个直接用 / **≥2 个必弹**，没有任何设置能关（v13 已无 autoMergeActivityOther，自 12.4.31 起从源码移除，只剩 i18n 文案）。
- ⚠️ **双伤害模型（设计时必看）**：attack 带伤害 + save 子活动也带伤害 ⇒ **命中后主伤害照算，再按豁免结果结算子伤害：两份都算、两次独立判定**（MidiActivityMixin.rollDamage 先掷自身，再走 rollOtherDamage）。想要「要么命中、要么豁免」只出一份伤害 ⇒ **attack 活动不填伤害**，把伤害全放子活动（Changelog:1771「Dragon Slaying」与 1772 的官方模型）。
- 子活动带 useCondition 时：在 buildOtherDamageMatches() 里对命中集合（attack 主活动 = hitTargets ∪ hitTargetsEC）逐目标求值一次，结果缓存在 workflow.otherDamageMatches；可用变量 = 完整 rollData + @target 状态块（.saved / .failedSave / .isHit / .raceOrType / .items …）。
- **F12 一行验证「这次点击实际结算了哪几个活动」**（本项目排错首选，别猜）：
  const wf = MidiQOL.Workflow.getWorkflow([...game.messages].reverse().find(m => m.flags && m.flags["midi-qol"] && m.flags["midi-qol"].messageType)?.uuid);
  console.log({ main: wf?.activity?.name, other: wf?.otherActivity?.name, mainDmg: wf?.damageRolls?.length, otherDmg: wf?.otherDamageRolls?.length, hit: [...(wf?.hitTargets ?? [])].map(t => t.name), failed: [...(wf?.failedSaves ?? [])].map(t => t.name), otherMatched: [...(wf?.otherDamageMatches ?? [])].map(t => t.name) });
  字段含义：wf.activity = 实际执行的主活动；wf.otherActivity = 被绑定结算的子活动（getter = activity.otherActivity）；wf.damageRolls / wf.otherDamageRolls = 主 / 子伤害；wf.hitTargets / wf.failedSaves = 命中与豁免结果；wf.otherDamageMatches = useCondition 过滤后子伤害真正生效的目标。

⚠️ 旧知识库 FVTT-monster-spec-v2_1.md:54 曾写「禁止同一个 item 内并列两个会结算的 activity，必须拆成独立 item」——**现象对、归因错**：真正的原因是没显式断开 otherActivityId（attack 默认空串 ⇒ 被 auto 探测串接）。该处已追加勘误，不要照旧结论拆物品。
【进阶 · 显式 ID 的边界与豁免门控（源码钉死，2026-09-15 补）】
- **显式填 id 时，possibleOtherActivity 的类型门槛同样零检查**（activities.get(id) 只按 id 取，取不到再按 identifier 反查）。⇒ 手写数据可以让一个 attack 去 otherActivityId 指向另一个 attack —— 编辑器下拉不会列出它（那里用 isOtherActivityCompatible 过滤，门槛是被 UI 挡住的，不是被运行期挡住的）。
- **但不会递归**，有两层保险：① rollOtherDamage 传给嵌套 rollDamage 的 config 里 updateWorkflow: false；② rollDamage 里 config.workflow.otherActivity !== this 守卫（workflow.otherActivity 恒等于主活动的 other，也就是被指向的那个 attack 自己）⇒ 嵌套分支不成立。**结果**：被指向的 attack 若有伤害，它自己的伤害作为 otherDamageRolls 结算；**它自己的 otherActivityId 链条被截断**，不继续往下走。若它没有伤害 parts，则 rollOtherDamage 提前 return undefined = **静默忽略（不报错）**。
- ⚠️ **豁免门控（做「命中后才豁免」必看）**：WorkflowState_WaitForSaves 开头有这道门 —— saveActivity === otherActivity && activity.attack && hitTargets.size === 0 && hitTargetsEC.size === 0 ⇒ 标记 otherActivityConsumed: false、清空 rawOtherDamageDetail、initSaveResults()、**直接跳 SavesComplete：不掷豁免，也不扣子活动消耗**。门控看两个集合：hitTargets 与 hitTargetsEC（**擦边命中** = challengeModeArmorSet && attackTotal ≤ AC && attackTotal ≥ EC），任一非空即继续。部分命中时 failedSaves = new Set(hitTargets)，**只对命中的那些目标掷豁免**。
- ⚠️ **非 attack 主活动（utility / check / save）没有这道门** ⇒ 它绑定的 save 子活动会对**全部 targets** 照常掷豁免。**这条解释了历史上那例「点纯 utility 变形活动也要过豁免」** —— 主活动不是 attack，攻击命中门不适用；移交书里那个「始终没有得到解释」的谜题到此闭合。做变形/开关类 utility 活动时，若不想要豁免，别在它上面挂 save 子活动的链。
- **顺带的推论（据上面两条，非独立实测）**：既然显式 otherActivityId 时运行期完全不查兼容标记与类型门槛，那么《挽歌》那次「两活动 otherActivityId:'none' + 两活动 otherActivityCompatible:false」里，**真正起作用的是 'none'**；compatible:false 属于多余保险（设了无害，不设也应正常）。因此本插件只写 'none'，不动 compatible。

【Forward 活动 vs otherActivityId（不冲突，两条独立路径）】
- **字段不重叠**：dnd5e 核心 Forward 用 activity.id（module/data/activity/forward-data.mjs）；midi 用活动顶层 otherActivityId + midiProperties。无命名冲突。
- **职责互斥**：MidiForwardActivity.possibleOtherActivity = false（Forward 不能被当「子」）；Changelog:1246 同时移除了 Forward 上的 otherActivityId（Forward 也不能当「主」）。
- **机制**：Forward 的 use() 把消耗置零后转发给目标活动 —— 目标若是带 otherActivityId 的 A，A 的 other 链照常结算；目标直接是子活动 B，就绕过 A 单独触发 B。两条路径各自独立 workflow，互不污染。
- ⚠️ 三个实际注意点：① Forward 也是「可选活动」，会进「选择活动」弹窗候选（除非 automationOnly:true），物品上活动一多候选就变多；② 用 Forward 触发时 F12 里 wf.activity 显示的是**目标活动**而不是 Forward 本身（workflow 归目标活动）；③ Forward 指向一个被 automationOnly 隐藏的子活动时仍可直接触发（不经 item 层弹窗）。

⚠️ 出处：以上源码结论来自外部对 tposney/midi-qol v13（commit 6b10be5）与 foundryvtt/dnd5e 4.0.x–6.0.x 的逐行核查，叠加本机《挽歌》（attack + save 同 item，两者显式 "none"）实机点击验证。**本机未独立复核每一项源码坐标** —— 键名与默认值按本条引用，行号属外部报告。`,
    'item-macro': `【物品宏三件套 · 出自用户资料库「midi的物品宏使用指南」，磁轭手铳金标准实测通过】
⚠️ 2026-09-16 v13 宏契约改版（本主题旧文里「args[0]=macroPass」的说法已过时，以本节为准）：
所有 midi 调的宏（物品宏/世界宏/组合包宏/itemacro/DAE itemMacro/DAE activityMacro）统一走
callMacros → callMacro → executeMacroWithScope（Workflow.ts L4262/L4489）。v13 是【命名 scope + args[0]=macroData】：
  macro.execute(scope)   // scope = { workflow, rolledActivity, macroActivity, item, rolledItem, macroItem,
                         //           actor, token, midiData, options, args:[macroData] }
宏体里既可用 args[0].workflow，也可直接用 workflow（两者等价）。
⚠️ macroData 里的 targets / hitTargets / failedSaves 是【拷贝数组】（另附对应 *Uuids 数组）——
   改它们【不生效】；要改必须走 workflow.targets / workflow.hitTargets / workflow.failedSaves。

macroPass 全集（onUseMacroName 里可用的 key）：
  preTargeting｜preItemRoll｜preDamageRollConfig｜preCheckHits｜postAttackRoll｜preDamageRoll｜postDamageRoll｜
  preActiveEffects｜postActiveEffects｜preDamageApplication｜preTargetDamageApplication｜preSave｜postSave｜
  preTargetSave｜postRemoveCondition｜DamageBonus
  目标触发类：isTargeted｜isAttacked｜isAboutToSave｜isDamaged｜postTargetEffectApplication
⚠️ 本插件工具描述里曾写过的 isHealed 【不在全集内】—— 拿不准就别用（改用 isDamaged 反查，或用 DamageBonus 追加伤害）。
⚠️ DamageBonus 是唯一【返回式】宏：返回 {damageRoll, damageType, flavor} 或 Roll → 追加进 bonusDamageRolls。

DAE 侧 AE 宏走的是【完全不同的 args 世界】，别混用：
  由 DAE 的 GMAction.ts _executeMacro 执行，签名 new AsyncFunction("speaker","actor","token","character","item","args", cmd)，
  其中 args[0]="on"（应用时机标记）、args[1]=args.lastArg（含 macroName/effect/actor 上下文）。即旧文说的「on/off/each」。

改数据的黄金三点（宏里改集合一律走 workflow.xxx，不要改 args[0].xxx）：
  workflow.targets（Set）        → targetingComplete（可 return false 取消）/ preTargeting
  workflow.hitTargets（Set）     → midi-qol.hitsChecked（checkHits 之后、显示之前）；更早则改 targets（preCheckHits 时还没算）
  workflow.failedSaves（Set）    → postCheckSaves（掷完已算好）；或 preCheckSaves 改 hitTargets（failedSaves 从它初始化）
  workflow.attackRoll（Roll）    → preCheckHits（checkHits 读它判命中）；attackTotal 只是 setter 快照，改它不影响判定
「命中后触发效果」类自动化，绝大多数用物品宏，不需要世界脚本。
三件套（全放物品的 flags 里）：
{
  "flags": {
    "dae": { "macro": { "name": "<宏名>", "type": "script", "scope": "global", "command": "<宏体JS>" } },
    "midi-qol": { "onUseMacroName": "[postActiveEffects]ItemMacro" }
  }
}
宏体骨架（抄改）：
(async () => {
  const me = canvas.tokens.controlled[0] ?? (typeof token !== "undefined" ? token : null);
  if (!me) return;
  const wf = (typeof workflow !== "undefined" && workflow) ? workflow : ((typeof MidiQOL !== "undefined") ? (MidiQOL.currentWorkflow ?? null) : null);
  const target = Array.from(wf?.hitTargets ?? [])[0] ?? Array.from(wf?.targets ?? [])[0] ?? Array.from(game.user.targets ?? [])[0] ?? null;
  if (!target) return;  // miss → hitTargets 空 → 天然「命中才触发」
  // ... 你的效果逻辑 ...
})();
铁律：① miss 判定靠 hitTargets 空——切勿用 hitTargets>0 判命中（施放时 targets 也计入，会误判）；② AE 的 origin 必填；③ 宏里勿 JSON.stringify(token)（circular 崩），打日志用 console.log(对象)；④ identifier 只能英文数字破折号下划线；⑤ 先抄用户世界金标准（磁轭手铳等），别发明。
AI 实操：先用 foundry_create_entity{entityType:"Macro", data:{name,type:"script",command}} 建世界宏，再用 foundry_update_entity 改物品 flags；或直接 create_entity 建带完整 flags 的物品。`,
    aura: `【光环效果 auraeffects · 出自用户资料库「之前踩过的坑.txt」§光环】
⚠️⚠️ 2026-09-17 【实机实测】世界「特醇佳酿」Foundry 13.351 + dnd5e 5.3.3 + **Aura Effects 1.5.2**（用户实际装的是 1.5.2，
   下面引用的「机制」来自对方核的 1.3.4 —— **版本差两个大版本，不能直接外推**）：
  ✓ 已实证（createEmbeddedDocuments 建源 AE 后立刻读回）：
    · 传入 changes:[{key:"system.attributes.ac.bonus",mode:2,value:"+1"}] → 读回 **changes: [] 【被清空】**，
      但 system 里**确实有 stashedChanges / stashedStatuses 两个键** ⇒ 「运行时暂存进 stashed* 再清空顶层」机制成立。
    · system 实测 **16 个键**（不是对方说的 14）：applyToSelf / bestFormula / canStack / collisionTypes / color /
      combatOnly / disableOnHidden / distanceFormula / disposition / evaluatePreApply / opacity / overrideName /
      script / stashedChanges / stashedStatuses / showRadius。
    · **system.distance getter 求值成功 = 10**（distanceFormula "10"）⇒ 半径求值机制成立。
    · flags.auraeffects.originalType = "base" 正确保留。
  ✗ 第一次没复现 → **已查明根因并复现成功**（源码 + 实测双实锤）：
    ▸ 我第一轮建完 AE 后做了 tok.update({x: tok.x})，**恰好撞上 1.5.2 的 early return**：
      auras.mjs 的 updateToken（L155 起）在 L178 写着
        if (("x" in updates) || ("y" in updates) || ("elevation" in updates)) return;
      ⇒ **位置变化在 1.5.2 里交给 moveToken hook，updateToken 直接退出** —— 同值更新自然什么都不发生。
    ▸ **1.5.2 的真实 hook 面**（auras.mjs registerHooks，L390-412）：
      createActiveEffect / deleteActiveEffect → addRemoveEffect
      createToken / deleteToken / updateToken / **moveToken（1.5.2 主触发）** / updateActiveEffect / deleteActiveEffect
      renderActiveEffectConfig → injectAuraButton（在 AE 配置页注入「转为光环效果」按钮）
      可视化层：canvasInit / drawGridLayer / drawToken / destroyToken / refreshToken / initializeLightSources
    ▸ **1.5.2 已经不用 Region 了**：auras.mjs 全文件搜 canvas.regions / Region **0 命中**，
      可视化搬到了 auraVisualization.mjs。⇒ 「Region 没自动创建」是【按 1.3.4 思路找错了东西】，不是缺陷。
    ▸ 前置条件（updateToken L158-167 的顺序）：game.user.id === userId（发起者）→ **game.users.activeGM 必须存在**
      （否则 ui.notifications.warn("AURAEFFECTS.NoActiveGM") 并 return）→ token.actor 存在。
    ▸ 送达机制（updateActiveEffect L300-321）：
      getNearbyTokens(token, radius, {disposition, collisionTypes}) → executeScript(token, target, effect) 逐目标判定
      → activeGM.query("auraeffects.applyAuraEffects", actorToEffectsMap)（socket query 送达）
      其中 radius = effect.system.distance（getter 求值 distanceFormula）。
    ▸ **实测复现**（源 AE：type "auraeffects.aura"、distanceFormula "500"、disposition 0、changes 带 AC+1，
      挂在场景内 PC「西格蒙德 / PC (2)」上，然后**真移动 token ±80px**）：
      deliveredCount = 1 → actor "伊莱里伦"、type "base"、origin "Actor.dngPu7Di1tv5DxMB.ActiveEffect.Iktdxww7TgEezgoz"、
      **changes 带值** [{key:"system.attributes.ac.bonus", value:"+1", mode:2, priority:20}]、statuses []。
      移回原位 + 删源 AE 后**送达 AE 零残留**。
    ▸ ✅ **同时实证了对方标为「未验证」的那条**：送达 AE 的 changes **确实带值**（对方原注：属模块设计推断，建议 F12 验证）
      ⇒ 光环 AE 的 changes 照常写在顶层即可，送达端能拿到。

    · game.modules.get("auraeffects").api 实测只暴露一个方法：**migrateActiveAuras**。
  ⇒ **结论：1.3.4 的「自动建 Region + 自动送达」在 1.5.2 上未复现**，不能当成事实写进方案。
     **待用户确认**：你平时在世界里是怎么配光环的？（挂在 actor 上还是 token 上？用模块设置面板还是直接建 AE？）
     只有你知道实际操作路径 —— 拿到这条才能定位是我建法不对，还是 1.5.2 换了机制。
⚠️ 以下 1.3.4 机制保留作参考（来源：第三方克隆 Aura Effects v1.3.4 源码核验，本机无该模块源码）：
⚠️ 2026-09-17 完整可运行骨架 + 机制（来源：第三方克隆 Aura Effects v1.3.4 源码核验；本机无该模块源码，未二次复核）：
  【挂载位置】挂在 **actor 的 effects 上**（token.actor.effects）。模块在 createToken / updateToken hook（scripts/auras.mjs）
    里扫 actor effects 中 type === "auraeffects.aura" 的效果，自动建场景 Region 并做 GM 送达。
    ⇒ **全自动，不需要 active-auras 之类的另一个模块**；但【没有 active GM 时不会生效】（模块自带 checkActiveGM 提示）。
  骨架（存为 actor 上的 AE）：
    { "name":"火灵气", "type":"base", "disabled":false, "transfer":false, "statuses":[], "changes":[],
      "system": { "distanceFormula":"10", "disposition":-1, "applyToSelf":false, "collisionTypes":["move"],
                  "color":"#ff0000", "opacity":0.5, "showRadius":true, "evaluatePreApply":true,
                  "overrideName":"", "combatOnly":false, "disableOnHidden":true,
                  "customCheck":"", "script":"", "bestFormula":"" },
      "flags": { "auraeffects": { "originalType": "base" } } }
  【stashedChanges / stashedStatuses 真相】（AuraActiveEffectData.mjs L74-80 的 prepareDerivedData）：
    运行时把 changes 暂存进 stashedChanges、statuses 暂存进 stashedStatuses，然后**清空顶层 changes / statuses**
    —— 目的就是让光环 AE 的改动【不会作用在持有者自己身上】（光环的改动是「送达」给别人的）。
    ⇒ **落库时照常写顶层 changes**（标准 AE 字段）。送达时走 effect.toObject()（queries.mjs L37-55、L57）：
      送达 AE 是 type = originalType ?? "base"、transfer:false、flags.auraeffects.fromAura = <源 uuid> 的【普通 AE】。
    ⚠️ 第三方标注：toObject 展开语义属模块设计推断，**建议 F12 验证送达 AE 的 changes 确实带值**。
  【script 不是每 tick 宏】（helpers.mjs L5-19）：Function("actor","token","sourceToken","rollData", "return Boolean(script)")
    —— 对【每个候选目标 token 判定一次】（决定它进不进光环），返回 false 就跳过该目标。
  【bestFormula / evaluatePreApply】（queries.mjs L64-68、helpers.mjs L111-116）：多个同源光环冲突且 canStack:false 时，
    掷 bestFormula 取最大值择优；evaluatePreApply 控制无 DAE 时是否先在送达前把 changes 公式求值
    （有 DAE 时总是先替换 ## → @ 再算）。
  【半径】system.distance getter = new Roll(distanceFormula || "0", ...).evaluateSync(...).total（格数）；
    Region 半径 = distancePixels * system.distance（helpers.mjs L265）。applyToSelf:false 时持有者自己的 token 被
    auraShouldApply 排除（helpers.mjs L69）。
  【「10 尺内敌人每回合 1d4 火伤」怎么写】把 flags.midi-qol.OverTime 直接写在【源 AE】上
    （turn=end,label=Fire Aura,damageRoll=1d4,damageType=fire,saveAbility=dex,saveDC=13）—— 送达时 flags 整体复制，
    目标 AE 带上 OverTime 后由 midi 每回合跑。
    ⚠️ 第三方标注的验证点：源 AE 自己也带 OverTime，midi 对【持有者自己】是否触发需 F12 实测
    （applyToSelf:false 只影响送达，不影响 midi 遍历自己的 effects）；若会触发，需用 script / DAE specialDuration / 改成送达后再施加来隔离。
⚠️ 2026-09-16【完整字段表】（来源：第三方克隆 Aura Effects v1.3.4 源码核验；本机无该模块源码，未能二次复核）
  定义文件 = scripts/AuraActiveEffectData.mjs 的 AuraActiveEffectData#defineSchema()
  类型名：module.json 注册 documentTypes.ActiveEffect.aura，核心自动加模块前缀
    → 实际 type = "auraeffects.aura"（auras.mjs L278/326/372 判 effect.type !== "auraeffects.aura"；
      lang 里是 TYPES.ActiveEffect.auraeffects.aura）⇒ 本主题原来的 type 写法正确。
  字段（14 个，括号内为 initial）：
    applyToSelf(true) ｜ distanceFormula("0") 半径公式 ｜ disposition(0：-1 敌 / 0 任意 / 1 友)
    collisionTypes(Set{light,move,sight,sound}，initial ["move"]) ｜ combatOnly(false) ｜ canStack(false)
    color(Color) ｜ opacity(0.25) ｜ showRadius(false) ｜ overrideName("") ｜ bestFormula("")
    evaluatePreApply(false) ｜ disableOnHidden(true) ｜ script(JavaScriptField)
    stashedChanges(Array{key,value,mode,priority}) ｜ stashedStatuses(Set)
  distanceFormula 【确实在 system 下】（TypeDataModel 把字段挂到效果的 system 命名空间）✓
  flags.auraeffects.originalType 【确实存在】（AuraActiveEffectSheet.mjs L35，默认回退 "base"）✓
  ⚠️ 版本：该模块 master(2.2.1) 已转 Foundry v14（minimum 14）；v13 环境用 1.3.4 是对的。
  ⚠️ active-auras（Kandashi 的另一模块）用的是 flags.ActiveAuras.isAura 那套，与 auraeffects 无关，别混。
⚠️ 2026-09-16 定性（源码核实）：auraeffects 是【独立模块】（Aura Effects，v1.3.4 出现在 midi 的兼容模块清单
setupModules.ts 里，但 midi 源码【0 处运行时集成】；DAE 也无任何 aura 处理）。
  midi 唯一的光环感知 = OverTime 处理里跳过 effect.flags.ActiveAuras.isAura && ignoreSelf 的源效果
  （utils.ts L1220）—— 那是【另一个模块 active-auras】的 flag，不是本模块。
  ⇒ type:"auraeffects.aura" 的字段清单属于该模块自身，midi/DAE 源码里查不到，别指望从它们反推字段。
⚠️【「伤害光环不掉血」的定论】：midi / DAE / 光环模块都【只同步 AE 的 changes】（AC、加值、状态增减），
  【没有任何代码路径会执行光环的伤害公式】—— 光环直接掉血没有官方支持。
  社区做法就是把 OverTime 挂在送达的效果上，或用 onUseMacro —— 这正是 OverTime 存在的意义。
用于「范围内友军/敌军自动获得某属性增减益」的光环。注意：光环不送伤害（见 midi-over-time 限制）。
ActiveEffect 关键字段：
{
  "name": "勇气光环",
  "type": "auraeffects.aura",
  "system": {
    "distanceFormula": "10",        // 半径（尺，字符串公式，可写 "10" 或 "@attributes.hp.value" 类公式）
    "disposition": 1,               // 1=只影响友军 -1=只影响敌人 0=全体
    "applyToSelf": true,            // 是否也作用于光源自身
    "collisionTypes": ["move"],     // 移动碰撞
    "color": "#ff0000",
    "opacity": 0.3,
    "showRadius": true
  },
  "flags": { "auraeffects": { "originalType": "base" } },
  "transfer": true,
  "changes": [ /* 光环要加的属性增减益，见 bonuses */ ]
}
挂法：效果挂在「光源」角色/物品上（transfer 效果）。需要 auraeffects 模块。`,
    'iron-rules': `【开工铁律 · 出自用户资料库「血的教训-开工方法论篇」，写给 AI 自己的工作纪律】
一句话根本：正确写法从头到尾都摆在用户世界和资料库里；用户是付费 DM，不是测试员。
七条铁律：
1. 开工三查：读坑书（资料库「搓怪物做效果做mod任何时候，看到了一定要看仔细看」目录）→ 查 data-dict/monster-spec（foundry_knowledge）→ grep 用户世界找键名实例。0 实例 = 臆造，不用。
2. 出处责任制：交付里每个键名/API/图标路径必须能指到出处；指不出的标「未验证」或删掉。
3. 先方案后代码：文本方案用户点头再动手；最小切片（1 个法术/1 个物品）实测通过再批量。
4. 本地验证到敢自己点：语法/字段存在性/图标存在性全跑过才交付。
5. 资料 ≠ 实测：资料记载不一定在用户环境生效（AE 级 onUseMacroName、targetUuids 都被 midi 13.0.55 无视）；第一次用必须实测确认。
6. 失败走三步：根因 → 对照金标准 → 最小修复。不绕路加复杂度；同一条错不让用户踩第二次。
7. 教训即时沉淀：翻车 24h 内写进资料库对应篇。
五大病根（反向警示）：臆造优先于查证 / 把资料当实测 / 未验证即交付 / 绕路不复盘 / 教训不闭环。`,
    pitfalls: `【高频坑速查 · 出自用户资料库血泪教训系列 + 本插件实测翻车记录】
1. effects 层级（多多剑翻车）：save/attack activity 的 effects 是空壳 {_id, onSave:false}，塞 name/statuses/duration 会被 5.3.3 清洗成空。挂状态必须写物品顶层 effects（ActiveEffect 结构）。activity.effects 里每个 effect 带 statuses 的写法是另一个模块语境（§十一），REST 通道写物品时按本插件 weapon/save-activity/effect 模板走。
2. save.dc 两说：calculation:"flat" 官方合法、多多剑实测落库保留；但用户资料库另记载「flat 被丢回默认 10」（网格构筑师实测）。DC 不生效时改 calculation:"" + formula:"16" 再验。
3. activity._id 必须 16 位字母数字（如 dnd5eactivity100），非法值被清洗。
4. Import Data（FVTT 导入）只认单对象 JSON，不认数组。
5. 宏 JSON：导入世界宏要删 _id/author 字段。
6. 图标：绝不猜路径。404 已知黑名单：icons/svg/status.svg、trap.svg、dice-target.svg、claw-hooked-barbed.webp。真路径用 foundry_knowledge{topic:"icons"} 或 foundry_file_system 查，再从世界拿实例。
7. 权限：玩家端只能改自己的；ownership 深合并收回权限用 {"-="+userId:null}。unlinked token 要改基础 world actor 的 ownership。
8. 术语对照：necrotic=暗蚀 / psychic=心灵 / radiant=光耀 / bludgeoning=钝击 / piercing=穿刺 / slashing=挥砍。
9. 卡面描述必须有对应真实机制（无机制的纯风味文字=坑，用户会问「这怎么触发」）。
10. 汉化：系统自带 5e_chn 翻译模块（world-info 已确认 5.3.0），实体名可直接写中文。`,
    dae: `【DAE/AE 主动效果机制核心 · 出自用户资料库 data-dict §25/§26/§27】
⚠️ 2026-09-17 specialDuration 完整白名单（来源：DAE 仓库 src/module/Systems/DAEdnd5e.ts L650-700；回合类两项在 src/module/dae.ts L80-87）：
  回合类：turnStart ｜ turnEnd ｜ turnStartSource ｜ turnEndSource ｜ combatEnd ｜ joinCombat
    （后两项【仅当 times-up 模块 active 且版本 > 0.0.9 才注册】）
  动作类：1Action ｜ "Bonus Action" ｜ "Reaction" ｜ "Turn Action" ｜ 1Spell ｜ 1Attack ｜ 1Hit ｜ 1Critical ｜ 1Fumble ｜ 1Reaction ｜ DamageDealt
    带参形式：1Attack:<type> ｜ 1Hit:<type>
    ⚠️ 【"Bonus Action" / "Reaction" / "Turn Action" 三个键名带空格】——写错就静默失效，别自作聪明去掉空格。
  受击类：isAttacked ｜ isDamaged ｜ isHealed ｜ zeroHP ｜ isHit ｜ isHitCritical
  掷骰类：isSave ｜ isSaveSuccess ｜ isSaveFailure ｜ isConcentrationSave ｜ isConcentrationSaveFail ｜ isConcentrationSaveSuccess ｜ isCheck ｜ isSkill ｜ isInitiative
  带参修饰：isSave.<ability> ｜ isSaveSuccess.<ability> ｜ isSaveFailure.<ability> ｜ isCheck.<ability> ｜ isDamaged.<damageType> ｜ isDamaged.healing
  其他：isMoved ｜ longRest ｜ shortRest ｜ newDay
  None = 空串 ""（不设特殊时长）
  触发时机差异：1Attack 只在【攻击动作结算时】清；1Action 在【标准动作完成时】清。
    midi 的 expireMyEffects 只清 1Action / 1Spell / 1Attack / 1Hit / 1Critical / 1Fumble 六种（Workflow.ts L2729），其余值由 DAE 自身的战斗/受击/掷骰 hook 清。
  ⚠️ 写白名单外的值：值集是【精确比对】，不匹配则 DAE 永不主动清 ⇒ 效果变永久。
     此条为【推断】（第三方只定位到值集与 UI 读写，消费端 expire 分支未逐行核），要用就 F12 实测确认。
ActiveEffect 本身就是 DAE 体系（DAE=Dynamic Active Effects 模块），effects[].changes 之外的进阶能力：
- 表达式「为假则移除 / 为真则禁用」：changes 外、效果上的 JS 表达式字段，仅支持角色掷骰数据（如 attributes.hp.value < 50 → HP≥50 移除；!!attributes.ac.equippedArmor → 着甲禁用）
- 持续时间：duration.seconds 自动换算轮数（60秒=10轮）；可填掷骰公式（@abilities.int.mod+2d4 单位秒）；「特殊持续时间」=移动时结束/一次攻击后结束/来源或目标下回合开始等
- 变更模式（含默认优先级）：0 CUSTOM(0)/1 MULTIPLY(10)/2 ADD(20)/3 DOWNGRADE(30)/4 UPGRADE(40)/5 OVERRIDE(50)；同键多更改按优先级低→高应用
- @/## 评估：非转移效果 @字段 在【使用者】身上查；##字段 不求值、施加目标时替成 @字段（力量18者打力量10目标：@abilities.str.mod→18，##abilities.str.mod 在目标算 10）；[[1d8]] 强制引用掷骰数据
- 特殊键（mode 自定义）：macro.execute "宏名" 参数（效果创建/删除/每回合执行世界宏）/ macro.itemMacro（执行来源物品宏）/ macro.createItem 值=物品UUID（效果创建给目标建物品、移除自动删）/ macro.createItemRunMacro / macro.actorUpdate（改常规键改不了的字段且随效果撤销）/ flags.dae.deleteUuid（效果删除时删 value 指向实体）
- DAE 宏 args[0]：'on'(创建)/'off'(删除)/'each'(每回合重复)；'off'/'each' 时 actor/token 未初始化 → 用 lastArg=args[args.length-1]（含 effectId/origin/actorUuid/tokenUuid，取角色优先 uuid）
- 角色侧 change-key 配方精选：优势 abilities.[abl].save.roll.mode 加 1；AC attributes.ac.bonus；法术DC bonuses.spell.dc；临时HP attributes.hp.tempmax；免疫 traits.di.value 加伤害类型；忽略困难地形 attributes.movement.ignoredDifficultTerrain
- ⚠ HP 铁律：切勿 AE 改 hp.value/.max/.temp（用 attributes.hp.tempmax / hp.bonuses.overall / hp.bonuses.level）
出处：data-dict §25/§26/§27 逐字坐实，用户世界在用。

▸ **specialDuration 完整清单（2026-09-15 权威核实：DAE 仓库 src/dae.ts L82-86 + src/module/Systems/DAEdnd5e.ts L651-690，midi 激活时注册）**
  回合类：turnStart / turnEnd（目标回合开始·结束）；turnStartSource / turnEndSource（**来源者**回合开始·结束）；
    combatEnd / joinCombat（战斗结束 / 入战，需 times-up）
  动作类：1Action / "Bonus Action" / "Reaction" / "Turn Action" / 1Spell / 1Attack / 1Hit / 1Critical / 1Fumble / 1Reaction
    （下一次相应动作发生即到期；midi 在 ApplyDynamicEffects 前 expireMyEffects(["1Attack","1Action","1Spell"])）
    可带细分：1Attack:<mwak|rwak|msak|rsak>、1Hit:<type>
  受击/伤害类：isAttacked / isHit / isHitCritical；isDamaged（可 isDamaged.<类型>、isDamaged.healing）/ isHealed / zeroHP / DamageDealt
  掷骰类：isSave / isSaveSuccess / isSaveFailure（可 isSave.<ability>）；isConcentrationSave 及 …Fail / …Success；
    isCheck（可 isCheck.<ability>）/ isSkill / isInitiative
  休整类：longRest / shortRest / newDay
  其他：isMoved；None
  ⚠️ **三个键带空格**："Bonus Action" / "Reaction" / "Turn Action" —— 写成 BonusAction 之类会静默不生效。
  ⚠️ 常见混淆：1Attack（**自己**做出一次攻击）与 isAttacked（**被**攻击）不是一回事；两者常被写反。
  出处：DAE 主分支（本次为核实专门浅克隆了仓库）。`,
    conditions: `【激活条件全集 · 出自用户资料库 data-dict §29 · 条件化自动化核心】
适用于：midi「使用条件/激活效果条件」、触发行动「触发条件」、DAE「为真禁用/为假移除」、Optional .activation/.force。
运算符：&& 与 · || 或 · ?? · ! · ==/=== · < <= > >=
高频变量：damageTypes.fire（本次伤害类型）；target.saved/.failedSave/.isHit/.raceOrType/.attributes.hp.value；workflow.diceRoll==20（攻击掷出20）/.isCritical/.attackMode/.saveDC/.castData.castLevel==4；raceOrType.includes("undead")（目标不死生物）；item.itemType=="spell"/"weapon"/"feat"；workflow.item.system.properties.has("mgc")；combatRound/combatTurn；isAttuned/isDeathSave
就地函数：computeDistance(tokenUuid,targetUuid)<=10；checkNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE,tokenUuid,5)（5尺内有敌）；findNearbyCount(...)
逐字示例（直接抄改）：target.attributes.hp.value < target.attributes.hp.max/2（半血以下）；["lg","med","sm","tiny"].includes(target.traits.size)；target.statuses.frightened（目标被恐慌）；target.attributes.hp.value != target.attributes.hp.max（已损血）；target.items.some(i => i.name=="某物品")；["shortbow","longbow"].includes(workflow.item.system.type?.baseItem)
⚠ 怪物「在某条件下才……」的能力几乎都靠这层。`,
    enchant: `【附魔键值 · 改物品/行动本身 · 出自用户资料库 data-dict §28】
⚠️ 2026-09-17 官方样例骨架（来源：dnd5e 官方包 packs/_source/equipment24/weapons/magical/weapon-1-2-or-3.yml L14-60 活动 / L157-190 AE；
  本机核对 5.2.5：applyEnchantment(profile, item, {...}) 在 dnd5e.mjs L22678、isAppliedEnchantment L21446、hook dnd5e.preApplyEnchantment L22715 ✓）：
  活动 = { type:"enchant", name, activation{...}, consumption{scaling{allowed:false}, spellSlot:true, targets:[]},
           description{chatFlavor:""}, duration{units:"inst", concentration:false, override:false},
           effects:[ { _id:"<aeId>", level:{min:null,max:null}, riders:{activity:[],effect:[],item:[]} } ] }
  物品顶层 effects[0] = { _id:"<aeId>", name:"Weapon +1", type:"enchantment", disabled:true,
    changes:[ {key:"system.magicalBonus", mode:4, value:"1", priority:null},
              {key:"system.rarity", mode:5, value:"uncommon", priority:null},
              {key:"system.properties", mode:2, value:"mgc", priority:null},
              {key:"system.description.value", mode:5, value:"<p>+1 魔法武器。</p>", priority:null},
              {key:"system.price.value", mode:2, value:"400", priority:null} ] }
  ⚠️ 更正：本主题此前给的骨架用 system.bonuses.mwak.attack / .damage（mode 2）——那是【临时攻击加值】的正规落点，
     但【+1 魔法武器】的官方标准写法是 **system.magicalBonus（mode 4）** + properties 加 mgc + rarity 提档 + 价格。
     两者都合法、用途不同：装备本体永久强化用 magicalBonus；buff 式临时加值用 bonuses.*。别混。
  ⚠️ 活动 effects[]._id 【必须】与物品顶层 effects[]._id 一致（否则附魔弹窗里没有可选 profile）。
  enchant.self（enchant.mjs 的 _triggerSubsequentActions L121-133）：默认 false → 打开「附魔」弹窗选 profile，可应用到任意物品；
    true → 跳过选择、直接把 profile 应用到【本物品】（先删已有的同源附魔再建）。
  附魔 AE 挂哪：applyEnchantment L190 ActiveEffect.create(enchantmentData, { parent: item }) → **挂在目标物品上**，不是角色。
    F12 查 item.effects.get("<aeId>")；生效标志是 isAppliedEnchantment getter（active-effect.mjs L98，靠 flags.dnd5e.isAppliedEnchantment）。
    AE 的 transfer 保持 false（物品级原地生效，不往角色传）。
附魔=特殊主动效果，改【物品】而非角色（与 dae 主题的角色侧键不互通）。格式 activities[<类型>].<路径>（类型=attack/save/heal/damage/utility；base 表通用）或 system.*。
- 行动通用：activation.type/value；consumption.spellSlot(仅法术)/targets；duration.concentration；target.affects.count/.type/.special(-self 排除自身)；uses.max/spent/recovery；range.units/.value
- 攻击：attack.ability 覆盖；attack.bonus 加；attack.critical.threshold（降级=覆盖阈值/加=增减）；attack.flat（固定命中）；attack.type.classification/value
- 豁免：save.ability；save.dc.calculation（""=自定义/spellcasting/str…）/.formula/.bonus；damage.onSave（none/half/full）
- 治疗：healing.bonus/.custom.enabled+formula/.denomination/.number/.types
- 系统（改 Item）：system.attuned(布尔)/system.attunement(""/required/optional)/system.damage.parts([["formula","type"]])/system.properties 武器属性缩写（ada精金 amm弹药 fin灵巧 foc法器 hvy重型 lgt轻型 lod装填 mgc魔法 rch长触及 rel重新装填 ret回旋 sil银质 thr投掷 two双手 ver多用）/system.uses{max,spent,recovery}
- 充能恢复 uses.recovery.period：recharge/sr短休/lr长休/day每日/dawn黎明/dusk黄昏/initiative先攻时/turnStart/turnEnd/turn
- 名/图/描述：name 覆盖（{} 保留原名→"短剑, +1"）；img 覆盖路径；system.description.value 覆盖（{} 保留原描述）
⚠ 附魔场景（改现有魔法物品）才用这些；新建物品用 weapon 主题模板。

▸ enchant **活动本身的数据结构**（2026-09-14 按 5.3.3 enchant-data.mjs 核实 —— 与上面的「键值」是两个层面：
  上面那半是「附魔能改什么」，这半是「这个活动长什么样」）：
    effects: AppliedEffectField[{ _id, level:{min,max}, riders:{ activity:Set, effect:Set, item:Set } }]  ← 附魔 rider 引用
    enchant:      { self: bool }                                        ← true = 附魔自身
    restrictions: { allowMagical:bool, categories:Set, properties:Set, type:string }
  ⚠️ 旧资料里若没有 riders / restrictions，那就是旧版 —— 以这半为准。
  附魔武器是常见需求、键少、行为清晰，值得用；组装时注意 effects[]._id 与 riders 引用的对应关系。

▸ 可抄骨架（5.3.3 · +1 附魔长剑 · 2026-09-14 源码核实）：
  物品本体：type "weapon"，damage.parts[0] 是基础骰（如 {number:1,denomination:8,bonus:"1",types:["slashing"]}）。
  附魔用的 AE（**挂在物品的 effects 数组里，不在 system 里**）：
      { "_id": "ae_magic_bonus", "name": "+1 魔法", "type": "enchantment", "transfer": false,
        "changes": [ { "key": "system.bonuses.mwak.attack", "value": "1", "mode": 2 },
                     { "key": "system.bonuses.mwak.damage", "value": "1", "mode": 2 } ] }
  活动：一个 attack（"act_attack"）+ 一个 enchant（"act_enchant"，单独 id 便于 trigger/引用）：
      { "type": "enchant", "id": "act_enchant",
        "enchant": { "self": false },
        "effects": [ { "_id": "ae_magic_bonus", "level": { "min": null, "max": null }, "onSave": false,
                       "riders": { "activity": [], "effect": [], "item": [] } } ],
        "restrictions": { "allowMagical": false, "type": "weapon", "categories": [], "properties": [] } }
  ⚠️ AE 的 type 必须是 "enchantment"，transfer 必须 false（与 daelink 里说的「type 不能是 enchantment」正好相反 ——
     那条说的是**普通效果**不能伪装成附魔，这条说的是**附魔效果**就该是 enchantment，两者别搞混）。

▸ riders 三个 Set（activity / effect / item）= **2026-09-16 更正**：此前写「纯编辑期展示元数据、运行时完全不读」【不准确】。
  精确说法：**enchant.mjs 的应用主流程不读**（applyEnchantment L147-210 只按 _id 取 AE，全文件 grep riders 0 命中）；
  但**附魔 AE 创建之后有一个读取点** —— ActiveEffect5e#_onCreate（active-effect.mjs L607-612）在 isAppliedEnchantment 时
  调用 createRiderEnchantments（L512-576），它读 profile.riders.activity / .effect / .item（L521/L538/L554），
  把 rider 活动（复制＋新 _id＋flags.dnd5e.dependentOn）、rider 效果（删 _id、origin 继承）、
  rider 物品（Item5e.createWithContents + flags.dnd5e.enchantment.origin）创建到目标。
  ⇒ **留空不影响附魔**（结论不变）；空数组与完全不写【等价】（SchemaField 内的 SetField，缺省即空集）；
    塞不存在的 id 【静默忽略】（L523 continue、L540/L557 filter(_=>_)），不报错、不中断。

  依据：enchant-sheet.mjs L44-46 用它渲染「该效果还挂到哪些活动/效果/物品」的选择器，item-sheet.mjs 用它显示 rider 区；
  运行时 enchant.mjs **只按 effects[]._id 克隆 AE 到目标物品**、并把 origin 设为本活动 uuid。
  ⇒ **留空数组不影响任何功能**；要填就填「这个附魔效果同时关联到的」活动 id / 效果 id / 物品 uuid（给 GM 看的归属标注）。

▸ restrictions 语义（enchant.mjs 的 _checkRestrictions，L224-276）：
    allowMagical : false = 拒绝已有 mgc 属性的物品（true/省略 = 允许）
    type         : 只允许该 item 类型（如 "weapon"）；省略 = 不限
    categories   : 用 itemCategories 键（如 ["martial"]），与目标的 item.system.type.value 比对
    properties   : 与目标物品属性**有交集即可**（如 ["mgc"] = 只能附魔「本来就是魔法的」物品）
    **全空 = 完全不限**（默认就该这样）
▸ enchant.self：**true 只用于「附魔作用于自己的物品」**（enchant.self ? this.item.effects.find(e => e.isAppliedEnchantment && e.origin === this.uuid) : ...）
   ⇒ 给队友武器附魔、或附魔目标不是自己时**必须 false**。`,
    optional: `【Optional 可选加值全集 · 出自用户资料库 data-dict §30C】
flags.midi-qol.optional.<NAME>.*（mode 0 自定义），NAME=唯一串（建议同效果/物品名）。条件型加值/幸运重骰/把失败豁免转成功。
- 触发：activation（条件真则弹窗供选）/ force（条件真则强制生效不弹窗）/ label（弹窗标题）
- 目标键：damage.{all|mwak|rwak|msak|rsak} / skill.{all|per|prc…} / attack.{all…} / check.{all|str…} / save.{all|str…} / save.fail.{all|str…}（失败时加；save.fail.dex 配值 success 可把失败豁免转成功）/ ac（给目标AC）/ criticalDamage（true=伤害加值随重击翻倍）/ rollMode
- 次数 count：every(每次)/reaction(耗反应)/数字/turn(本回合一次)/each-turn/each-round/@field(>0可用用后递减)/ItemUses.<identifier|名称>.<值>/ActivityUses.<…>；countAlt=附加须同时可用的计数
- 值可填：骰子表达式 / 数字（配 activation/force 用运算符如 +2）/ reroll、reroll-max/-min/-kh/-kl/-query、reroll-withBonus +1d4 / success（确保成功）/ fail / replace <公式>（如 replace 4d20kh）/ ItemMacro.<itemUUID>（宏返回上述类型之一）
出处：data-dict §30C；经典用法见 bonuses 主题的 optional 摘要。`,
    trigger: `【自动化路由速查 + 反应触发/触发行动 · 出自用户资料库 data-dict §24/§30】
需求→用什么机制（先查有没有预制菜 CPR/系统自带）：
- 物品只在特定条件下可用 → 行动 midi「使用条件」（conditions 主题）
- 一连串操作（攻击后强制豁免等）→ 触发行动（两个独立工作流）
- 改掷骰方式（优势/伤害减免/射程）→ DAE 效果 + midi flags
- 条件加值/优势/重骰 → Optional（optional 主题）
- 固定间隔重复（回合开始/结束）→ OverTime（midi-over-time 主题）
- 光环/区域效果 → auraeffects（aura 主题）
- 特殊持续时间（一次攻击后失效）→ DAE「特殊持续时间」（dae 主题）
- 应用/移除效果时执行操作 → DAE 宏 macro.execute/itemMacro
反应触发条件（反应行动 midi「使用条件」填 reaction==='...'）：preAttack(被攻击前)/isAttacked/isMissed/isHit/isDamaged/isHealed/isSave/isSaveSuccess/isSaveFail/"false"(仅手动)，可与 conditions 组合。
「使用其他行动」（同一工作流，能用的行动有限）vs「触发行动」（独立工作流，可触发所有 midi 行动）二选一；触发行动四键：触发行动/触发条件（主工作流结束后评估）/触发目标/掷骰（视同谁掷）。
挂宏位置：物品宏=物品标题栏 DIME；行动宏=行动标题栏「行动宏编辑器」或 midi 页底；世界宏=右侧栏 </>；角色使用宏=效果 flags.midi-qol.onUseMacroName "<A>,<B>"（A=ItemMacro/ActivityMacro/ActivityMacro.<标识符|uuid|名称>/世界宏名；B=传参）。`,
    'overtime-activity': `【行动版 OverTime · v13 新机制 · 出自用户资料库 data-dict §23 · ⚠ 键名未坐实】
效果 changes 挂 flags.midi-qol.ActivityOverTime，value 指一个【行动】：identifier（如 bleeding-save，跨世界稳，优先）或 uuid（合集内稳，跨世界会变）。
比经典版（midi-over-time 主题）灵活：可每轮召唤/每轮逼一次检定/含 AoE。
配方（流血：每回合掉血、过豁免移除）：
1. 建豁免行动（体质 DC12、1d4 黯蚀、目标类型留空让 midi 覆盖）；该行动 midi 页设「Overtime 行动=true」+「回合开始」+「豁免移除」
2. 攻击行动上指定要应用的效果，效果里挂 ActivityOverTime，value 填 bleeding-save（或该行动 uuid）
规则：调用前检查 attributes.hp.value>0；同一效果可多条按 回合开始→回合结束→优先级（低先）执行；沿用原始施法环数缩放；依赖行动应目标自身，含 AoE 选「光环/光环-半径·无模板」。
⚠ 键名大小写源文档自相矛盾（ActivityOverTime vs ActivityOvertime vs overTime），用户世界 0 实例——精确键名落 JSON 前必须实测或找样本确认，勿按本节直接写死。绝大多数持续伤害需求用经典版 OverTime 即可，需要每轮召唤/每轮检定/AoE 才上行动版。`,
    'probe': `【F12 控制台探针 · midi-qol workflow 运行时快照 · hook 签名已对 v13 globals.ts 核实】
⚠️ 2026-09-16 补【item.use() 完整状态机】（midi v13 Workflow.ts）与每个状态对应的 hook：
  Start → AwaitItemCard ｜ 模板类：AwaitTemplate → TemplatePlaced
  → AoETargetConfirmation → ValidateRoll → PreambleComplete          ← hook targetingComplete（可 return false 取消）· 改 targets 在这
  → WaitForAttackRoll                                                ← hook preAttackRoll
  → preCheckHits → checkHits()（算 hitTargets）→ hitsChecked → AttackRollComplete   ← 改 hitTargets 在这
  → WaitForDamageRoll                                                ← preDamageRoll / preDamageRollConfig（此时 damageRolls 还是空的）
  → DamageRollStarted → DamageRollComplete                           ← DamageBonus 宏；DamageRollComplete hook（damageRolls 已填）
  → WaitForSaves：preCheckSaves → 掷豁免 → postCheckSaves（failedSaves 定）    ← 改 failedSaves 在这
  → ApplyDynamicEffects（effectTargets = failedSaves 或 hitTargets）→ Completed → Cleanup
                                                                     ← preActiveEffects 宏（返回 haltEffectsApplication 可整段拦下）
  旁路：全 miss → ConfirmRoll / RollFinished；确认伤害 → Suspend；abort → Abort / Cancel。
  三个改数据的黄金点：targetingComplete（targets）、hitsChecked（hitTargets）、postCheckSaves（failedSaves）。
用途：世界内自动化「卡面看着全对、打起来不对」时，让使用者贴一次就拿到**完整运行时快照**，
而不是读完源码推断运行时会怎样。覆盖五个面：
  ① 攻击流程（命中 / 未命中 / 豁免 / 伤害各自的目标集合）
  ② 活动链（一次点击实际结算了哪几个活动、主/子关系）
  ③ 效果施加（AE 挂没挂、transfer 值、duration、origin）
  ④ OverTime（每回合触发没、何时移除）
  ⑤ 消耗（使用次数扣了没）

用法：整段粘进 F12 控制台 → 打印 armed → 在世界里正常点一次物品 / 打一次 → 再执行 window.__wfSnap()。

--- 以下整段照抄，中间不要断行 ---
(() => {
  const P = (...a) => console.log("%c[PROBE]", "color:#9BBBF4;font-weight:700", ...a);
  const names = s => [...(s ?? [])].map(t => t.name || t.uuid);
  // ① 攻击流程：命中 / 豁免 / 伤害 的目标集合
  Hooks.on("midi-qol.preAttackRoll", wf => P("preAttackRoll", wf.activity?.name, "targets:", names(wf.targets)));
  Hooks.on("midi-qol.AttackRollComplete", wf => P("AttackRollComplete", "hit:", names(wf.hitTargets), "hitEC:", names(wf.hitTargetsEC)));
  Hooks.on("midi-qol.DamageRollComplete", wf => P("DamageRollComplete",
    "mainRolls:", wf.damageRolls?.length, "otherRolls:", wf.otherDamageRolls?.length,
    "failedSaves:", names(wf.failedSaves), "superSavers:", names(wf.superSavers)));
  Hooks.on("midi-qol.RollComplete", wf => P("RollComplete", wf.activity?.name));
  // ② 活动链：点完一次后运行 window.__wfSnap()
  window.__wfSnap = () => {
    const msg = [...game.messages].reverse().find(m => m.flags?.["midi-qol"]?.messageType);
    const wf = msg && MidiQOL.Workflow.getWorkflow(msg.uuid);
    if (!wf) return P("no workflow — 先点一次物品");
    P("main:", wf.activity?.name, wf.activity?.uuid,
      "| other:", wf.otherActivity?.name, wf.otherActivity?.uuid,
      "| consumed:", wf.chatCard?.getFlag("midi-qol", "use.consumed"),
      "| uses:", wf.item?.system?.uses?.value, "/", wf.item?.system?.uses?.max);
  };
  // ③ 效果施加
  Hooks.on("createActiveEffect", (eff, data, userId) => P("AE:", eff.name, "->", eff.parent?.name,
    "transfer:", eff.transfer, "duration:", JSON.stringify(eff.duration), "origin:", eff.origin));
  // ④ OverTime：回合变更时盘点带 OverTime 标记的效果
  Hooks.on("updateCombat", (combat, up) => {
    if (up.round === undefined && up.turn === undefined) return;
    P("combat r" + combat.round + " t" + combat.turn);
    game.actors?.forEach(a => a.appliedEffects?.filter(e => e.flags?.["midi-qol"]?.OverTime)
      .forEach(e => P("  OT:", e.name, "on", a.name, JSON.stringify(e.flags["midi-qol"].OverTime))));
  });
  // ①b 命中判定前 / 伤害掷骰前（2026-09-14 补：这两处分别是「命中前最后干预点」与「公式注入点」）
  Hooks.on("midi-qol.preCheckHits", wf => P("preCheckHits", "targets:", names(wf.targets), "AC:", wf.targets?.first()?.actor?.system?.attributes?.ac?.value));
  Hooks.on("midi-qol.preDamageRoll", wf => P("preDamageRoll", "formula:", wf.damageRolls?.[0]?.formula ?? wf.otherDamageRolls?.[0]?.formula));
  // ①c 豁免判定前 / 豁免结果 / 活动选择弹窗前（2026-09-14 二次核源码补）
  //    ⚠️ 同批问的 preTargeting、preFormula、preApplyDynamicEffects 三个【全仓 0 命中、不存在】，别加。
  Hooks.on("midi-qol.preCheckSaves", wf => P("preCheckSaves", "targets:", names(wf.targets)));            // Workflow L2468
  Hooks.on("midi-qol.postCheckSaves", wf => P("postCheckSaves", "failedSaves:", names(wf.failedSaves)));  // Workflow L2491
  // 多活动物品专用：弹「选择活动」之前能看到候选（async，参数 { activities, item }）——
  // 想「免弹窗」时在这里删候选，或把多余活动设 midiProperties.automationOnly: true。
  Hooks.on("midi-qol.itemUseActivitySelect", async (data) => P("itemUseActivitySelect 候选:", names(data?.activities), "item:", data?.item?.name));
  // ⑤ 消耗：结算前后对比
  Hooks.on("midi-qol.preItemRoll", wf => P("preItemRoll uses:", wf.item?.system?.uses?.value));
  P("armed — 攻击一次后跑 window.__wfSnap()");
})();
--- 照抄结束 ---

读法速查：
- wf.hitTargets / wf.failedSaves / wf.otherDamageMatches → 这次点了哪几个活动、打中谁、谁豁免失败
- wf.otherActivity.uuid → 主/子活动链（配合 other-activity 主题看）
- createActiveEffect 的输出 → AE 挂没挂、transfer 值、duration、origin
- updateCombat 的盘点 → OverTime 每回合触发与移除
- uses 前后对比 → 消耗是否发生
核心入口就一个：MidiQOL.Workflow.getWorkflow(<chatMessageUuid>)，上面这些字段全在 v13 的 Workflow 实例上。
⚠️ 这是【只读探针】：不改判定逻辑、不写任何数据，跑完可以留着直到刷新页面。`,
    'activity-types': `【dnd5e 5.3.3 活动类型完整清单 · 出自 config.mjs:4403 DND5E.activityTypes · 共 12 种】
⚠️ 2026-09-17 第三批源码核实补两条：
▸ cast 活动（此前本主题只列了名字，没说它干什么）：
  schema（cast-data.mjs L16-39，构造时 delete schema.effects）：
    spell: { ability, challenge: { attack:Number, save:Number, override:Boolean }, level:Number,
             properties: Set(initial ["vocal","somatic","material"]), spellbook: Boolean(initial true),
             uuid: DocumentUUID(类型约束 Item，且 validate 必须是 spell) }
    本机核对（5.2.5 dnd5e.mjs L11221 class BaseCastActivityData / L11230 challenge / L11237 spellbook initial true）✓ 结构一致。
  运行时（cast.mjs 的 use() L71-95）：非嵌入/非 owner 直接 return → 从 actor.sourcedItems.get(spell.uuid)
    按 flags.dnd5e.cachedFor === relativeUUID 找【缓存的法术副本】→ 找不到就 getCachedSpellData() 在 actor 上
    createEmbeddedDocuments("Item", ...) 建副本 → spell.use({...usage, legacy:false}, ...) 委托给法术物品自己的 use 流程；
    首尾各一个 hook：dnd5e.preUseLinkedSpell / dnd5e.postUseLinkedSpell。
  ⇒ 本质：cast 【自己不结算】，它是「把当前物品当作一个链接法术来施放」的中转站 —— 命中/豁免/伤害全部由
    spell.uuid 指向的那个法术物品的 activities 结算。displayInSpellbook（canUse && magicAvailable !== false && spell.spellbook）
    决定它是否出现在法术书里。
  ⇒ 什么时候需要：普通法术物品【不需要】cast（法术书里点「施放」走的是法术物品自身）；
    只有「这个物品去调用另一个法术物品」时才需要（法杖/卷轴/特性引用施放）。判据：spell.uuid 必须指向真实法术，
    spellbook:true 才进法术书候选。
▸ advancement（class / subclass / race / background / feat 的 system.advancement）：
  注册表 8 类（config.mjs L4451-4481；本机核对 5.2.5 L45908 表一致）：
    AbilityScoreImprovement（background/class/race/feat）｜ HitPoints（class）｜ ItemChoice（全部）｜ ItemGrant（全部）
    ｜ ScaleValue（全部）｜ Size（race）｜ Subclass（class）｜ Trait（全部）
  基础 schema（base-advancement.mjs L29-42）：{ _id(randomID), type(validate=typeName), configuration(AdvancementDataField),
    flags, value(AdvancementDataField), level(Number 可选), title(String initial undefined) }
  ItemGrant（item-grant.mjs L26-34）：items:[{uuid, optional}](required)、optional:Boolean(required)、spell:SpellConfigurationData(nullable, initial null)；
    VALID_TYPES L43 = feat/spell/consumable/container/equipment/loot/tool/weapon（本机核对 5.2.5 L38375 完全一致）✓
  最小骨架（class 物品的 system.advancement 数组元素）：
    { "_id":"<randomId>", "type":"ItemGrant", "level":1, "title":"",
      "configuration": { "items":[{"uuid":"Compendium.dnd5e.items.<featId>","optional":false}],
                         "optional":false, "spell":null }, "value":{} }
  ⚠️ 生效时机：advancement 【不自动生效】，走 AdvancementManager 的【用户交互弹窗】——
    加物品进 actor（forNewItem，base-actor-sheet.mjs L1905）／升级按钮（forLevelChange L1224）／改选（forModifyChoices，item-sheet.mjs L772）／
    删物品或删 advancement（item.mjs L1172 / advancement.mjs L262）。apply()（item-grant.mjs L87-123）fromUuid 后 actor.createEmbeddedDocuments("Item",...)。
    automaticApplicationValue 只在无选择项时返回数据，否则仍需用户确认。
  ⇒ advancement: [] 空数组【安全、不报错】（item.mjs L127 _needsAdvancementMigration = Array.isArray(...)、L204-208 hasAdvancements 都是兼容性判断）。
    后果只是：class 升级时不触发任何授予/选择流程 —— 只少功能，不炸。
⚠️ 2026-09-16 补【summon 运行时行为】（dnd5e summon.mjs，源码逐条核实）：
  落点 = 当前场景 Token（canvas.scene.createEmbeddedDocuments("Token", tokensData)，L211）；
  Actor 本体 = dnd5e.documents.Actor5e.fetchExisting(uuid, {origin:"flags.dnd5e.summon.origin"})（必要时从 compendium 导入）。
  ⚠️ 控制权：施法者需 actor.isOwner（L157 检查，否则报错）—— 召唤物默认【不是】独立 NPC 先攻。
  bonuses{ac,hd,hp,attackDamage,saveDamage,healing} 全是【公式字符串】（FormulaField），运行时按 rollData 求值，
  经临时 AE 一次性挂到召唤 actor 副本：ac/hd/hp = OVERRIDE，attackDamage/saveDamage/healing = ADD（getChanges L261-470）。
  profiles[].count 【支持公式】：new Roll(profile.count || "1", rollData)（L504），如 "1 * floor((@item.level-1)/2)"。
  match{...} 各字段都是从施法者同步到召唤物：proficiency（L277）/ disposition（默认 true，L293）/ attacks（L415）/
  saves（L441）/ ability（回退链 match.ability → activity.ability → item.abilityMod → 施法者施法属性，L70）。
  ⚠️ summon.mode：【核心只判 "cr"】（弹 CompendiumBrowser、锁 cr.max=simplifyBonus(profile.cr) 与 types 让 GM 选 NPC）；
     【其他任何值 → 直接用 profile.uuid】（L150）。所以本工具写死 mode:"cr" 是对的（官方 Conjure Animals 也是 cr）。
  summon.prompt 控制是否弹确认对话框。
⚠️ 2026-09-16 补【summon 的 applicableEffects】（本主题此前只说了 bonuses{}）：
  applicableEffects 【不是一个独立字段】，是活动数据基类的 getter
    （module/data/activity/base-activity.mjs L135-143：this.effects.filter(level 覆盖 relevantLevel).map(e => e.effect)）。
  summon-data 没有 override（有 override 的是 enchant/transform，它们返回 null）⇒ summon 走的正是基类实现。
  ⇒ 想让「召唤物一出来就带 buff / 状态」，就在 summon 活动的 effects[] 里填条目
    （{_id, level:{min,max}, onSave}，_id 指向物品顶层 AE —— 与普通活动 effects 写法完全一致）。
  触发点：summon.mjs L481（getChanges 内）actorUpdates.effects.push(...this.applicableEffects.map(e => e.toObject()))
    —— 把活动 effects[] 引用的 AE 原样复制到召唤物 actor 的 effects。
  与 bonuses{} 【互补、不重叠】：bonuses 生成数值型临时 AE（ac/hd/hp = OVERRIDE，attackDamage/saveDamage/healing = ADD，
    getChanges L261-366 区域）；applicableEffects 是原样复制完整 AE（状态、增减益、任意效果）。两个都写不互相覆盖，同 push 进一个数组。
  ⚠️ 本机核实：我们样本库 105 个导出件里 applicableEffects 命中 0 —— 说明默认不写是常态。
| 类型 | 核心字段 | 典型场景 | midi 包装 | 会结算(进弹窗候选) |
| attack  | attack{ability,bonus,critical,flat,type} + damage{parts} | 攻击掷骰 + 伤害 | ✓ | ✓ |
| save    | save{ability[],dc{calculation,formula}} + damage{onSave,parts} + effects[{_id,onSave}] | 豁免 | ✓ | ✓ |
| check   | check{ability,associated,dc{calculation,formula}} | 技能对抗 / 检定 | ✓ | ✓ |
| damage  | damage{critical{allow,bonus},parts} | 纯伤害 | ✓ | ✓ |
| heal    | healing{number,denomination,bonus,types,custom} | 治疗 | ✓ | ✓ |
| utility | roll{formula} + effects | 工具性掷骰 / 只弹文案 | ✓ | ✓ |
| summon  | summon{...} + applicableEffects→召唤物 | 召唤 | ✓ | ✓ |
| transform | profiles[{cr,level,movement,sizes,uuid→Actor}] + settings | 变形 / 变身 | ✓ | ✓ |
| enchant | enchant{...} + applicableEffects | 附魔武器 | ✓ | ✓ |
| cast    | spell{level,properties} + consumption.scaling | 施法 | ✓ | ✓ |
| forward | activity{id} | 转发到另一活动 | ✓ | ✓ |
| order   | （configurable:false） | GM 内部指令 | ✗ | ✗ 不可配置 |

⚠️ 三个常见误解（2026-09-16 源码核实）：
1. **「overtime 活动」不存在** —— OverTime 是 **midi 的效果 flag 机制**（parseOvertimeDetails），不是活动类型。
   持续伤害请走 midi-over-time 主题，别去建什么 overtime 活动。
2. **contested-check 不在 5.3.3 核心** —— midi 有 ContestedCheckActivity.ts 但**未注册进 activityTypes**，属未启用/遗留。
3. **transform 不是「物品变形」** —— 它是把 **actor 变成另一个 actor**（transform.mjs 文档注释、profiles.uuid 类型是 Actor）。
   做双形态武器不要用它，见下。

⚠️ 字段级更正（2026-09-14 从 5.3.3 schema 源头核实）：
- **check 没有 roll 字段**（check-data.mjs：只有 check{ability, associated, dc}）。
  **检定公式根本不存活动里** —— 点按钮时由 dnd5e 核心现算：actor.rollSkill / rollAbility / rollTool（check.mjs #rollCheck，
  公式 = d20 + 属性修正 + 技能熟练）。associated 是关联的技能/工具 id 集合（SetField）。
  「+X 加值」的正确落点：tool 物品走 item.system.bonus（#rollCheck 里 rollData.bonus = this.item.system.bonus，**仅 tool 生效**）；
  角色级走 system.bonuses.abilities.check / .save / .skill（creature.mjs L35-40，FormulaField）；
  单技能/单工具走 system.skills.<key>.bonuses.check / system.tools.<key>.bonuses.check。
  真要「活动级带值」只能走 midi 宏（onUseMacroName 在 preAttackRoll 注入 rollData）或 DAE 改角色字段。
- **damage 没有 includeBase**（damage-data.mjs：只有 damage{critical{allow,bonus}, parts}）。
  includeBase 是 **attack 活动**的字段（attack-data.mjs L40，初始 true = 把物品自带基础伤害并入 parts）；
  写在 damage 活动里会被 Foundry DataModel 的 keepUnknown:false 静默丢弃（读回 undefined）—— 那是正常行为，不是 bug。
- **heal 的 types 是闭集三键**（config.mjs L2340 DND5E.healingTypes）：healing（治疗）/ temphp（临时生命）/ maximum（提升最大生命）。
  midi 的 getDamageType（utils.ts L29-41）三者都识别，按 types.first() 分派。**填伤害类型（如 necrotic）无效** ——
  会落进 damageTypes 分支，治疗语义未定义。
- **damage.parts[].scaling 升环配方**（damage-field.mjs scaledFormula）：
  结构 scaling{mode, number(initial 1), formula}；mode = "whole"（每阶全量）| "half"（floor 半量）| "" 或其它（不缩放）。
  number = 每阶增加的骰子数（作用在第一个骰上）；formula = 每阶追加的数值公式（Roll.alter(increase, 0, {multiplyNumeric:true}) × 阶数）。
  规范「不缩放」形态 = {mode:"", number:null, formula:""}（scaledFormula 里 this.scaling.number ?? 0 兼容 null，合法）。
  官方 upcast 配方（火球，3 环基线 3d6，每环 +1d6）：{number:3, denomination:6, types:["fire"], scaling:{mode:"whole", number:1, formula:""}}
  → 4 环 4d6、5 环 5d6。custom 版：{custom:{enabled:true, formula:"3d6"}, scaling:{mode:"whole", formula:"1d6"}} → 3d6 + 1d6×increase。
  ⚠️ 前提：increase = 施放环级 − 物品基础环级（mixin.mjs L464-467），且**只有 canScale 的活动才计算**
  （consumption.scaling.allowed / 法术位机制）。远程组装非 spell 物品时 usageConfig.scaling 基本是 0 —— 配方写对也不会放大。
- **enchant 的 5.3.3 schema**（enchant-data.mjs）：effects: AppliedEffectField[{_id, level{min,max}, riders:{activity:Set, effect:Set, item:Set}}]
  + enchant:{self:bool} + restrictions:{allowMagical:bool, categories:Set, properties:Set, type:string}。
  旧资料里若没有 riders / restrictions，那就是旧版。附魔武器是常见需求、键少、行为清晰，值得用。
- **cast 的 5.3.3 schema**（cast-data.mjs）：**删除了 base 的 effects**（cast 活动没有效果字段）；
  spell:{ability, challenge:{attack,save,override}, level, properties(initial [vocal,somatic,material]), spellbook(true), uuid(必须指向 spell 类型 Item，schema 强校验)}。
  运行时从 uuid 载入法术并覆盖 name/img/activation/duration/range/target。
  **不建议手写**：依赖法术 uuid + spellbook 机制、无 effects、midi 主要拿它做施法流，远程组装收益低。

▸ **upcast（升环放大）真正生效的三层条件**（2026-09-14 源码核实）：
  ① 计算层（getUsageConfig，mixin.mjs L452-467）：canScale = linked ? linked.consumption.scaling.allowed : this.canScale；
     this.canScale = consumption.scaling.allowed || item.system.canScale（base-activity.mjs L159）。
  ② **spell 物品**：item.system.canScale = (level > 0) && !!CONFIG.DND5E.spellcasting[method]?.slots（spell.mjs L193）
     ⇒ **1 环以上 + 有施法槽模型就自动可缩放，不需要写 consumption.scaling.allowed**。
     requiresSpellSlot = isSpell && canScale；缩放值 = actor.system.spells[slot].level − item.system.level（> 0 才写）。
  ③ **非 spell 物品**：唯一入口就是 consumption.scaling.allowed = true（可加 max 上限公式），
     此时 canConfigureScaling 为真 → 使用弹窗让玩家输入缩放步数。
  生效层：scaling 数字 → 写 flags.dnd5e.scaling → prepareFinalAttributes → 伤害 parts 走
     scaledFormula(rollConfig.scaling ?? rollData.scaling)（mode "whole"/"half"），或公式里直接用 @scaling。
  ⇒ **一句话**：spell 看 system.level + parts[].scaling；**只有非 spell 才需要 consumption.scaling.allowed:true**。
  可抄配置（火球，3 环基线 8d6，每环 +1d6；施法者 5 环施放 = 10d6）：
     { "type": "damage", "id": "act_fireball",
       "consumption": { "spellSlot": true, "scaling": { "allowed": true }, "targets": [] },
       "damage": { "critical": { "allow": false, "bonus": "" },
         "parts": [ { "number": 8, "denomination": 6, "bonus": "", "types": ["fire"],
                      "scaling": { "mode": "whole", "number": 1, "formula": "" } } ] } }

▸ **cast 活动什么时候必须用**（2026-09-14 源码核实）：
  本质（cast.mjs L13）："Activity for casting a spell **from another item**" —— 它**自己不掷骰**，
  use() 把使用转给 spell.uuid 指向的法术物品（spell.use({...legacy:false})），并负责法术书登记（L59-63）。
  **没有别的路的三种场景**：
    ① 要法术出现在角色**法术书**、走「施放」按钮、**扣法术位、选环级** —— 5.x 法术物品的标准主活动就是 cast，
       没有它法术书不认。
    ② 特性 / 魔杖 / 卷轴要**委托施放另一个法术**（spell.uuid 跨物品）—— 原生机制只有 cast。
    ③ 要施法属性统一 / 挑战覆盖（spell.ability、challenge.override）。
  **可以永远不用**：物品只是「掷个伤害 / 豁免骰」、不碰法术位与法术书 → 直接 attack/damage/save 即可。
  ⚠️ 反直觉点：**即使没有 cast，spell 物品上的 damage 活动也能吃升环放大**（canScale 走 item.system.canScale），
     只是没有选环 UI、也不扣法术位。

双形态武器（一件物品两种形态、附赠动作切换）的正确做法（社区标准，最稳）：
  **两把独立物品 + 一个切换宏**。次选：单物品 + ItemMacro 切活动（item.update 改 system.activities）。
  ⚠️ 别用「单个 item 放多个活动 + 宏切换活动集合」—— midi 对运行时改活动集合的兼容性差，最容易碎。
  5.3.3 核心**没有**「物品形态切换」活动。

本插件工具覆盖情况：create_item_minimal 支持 attack/save/heal/utility/summon + **check/damage**（额外活动 activities 数组）；
enchant/cast 属边缘（不常用），forward/order 不用碰（前者能用 otherActivity 代替，后者是 GM 内部指令）。`,
    'midi-properties': `【activity.midiProperties 全键语义 · 出自 MidiActivityMixin.defineSchema · 共 29 键（括号内为 initial）】
⚠️ 2026-09-16 补三条（源码逐条核实）：
① 【专注】midiProperties.noConcentrationCheck（活动级）→ Workflow.ts L1534 设 workflowOptions.noConcentrationCheck=true
   → 跳过自动断专注检查（传给 dnd5e 的 use 与受伤检查）。
   midiProperties.skipConcentrationCheck（活动级）→ MidiActivityMixin L626：当活动【消耗 HP】
   （consumption.targets 含 attributes.hp.value）时把 actor 加入 skipConcentrationActorUuids（L718 清理）
   —— 即「用生命施法不触发专注检查」，两者语义不同别混。
   ⚠️ flags.midi-qol.noConcentrationCheck 这个【flag 形式】在 midi v13 与 dnd5e 5.3.3 源码里【都没有读取点】—— 别写。
   （注意区分：MidiQOL.applyTokenDamage 的 options 里有个同名参数，那是函数选项不是 flag。）
② 自动断专注的三个触发源：受伤（midi patch dnd5e.preUpdateActor，Hooks.ts L200-248，受 doConcentrationCheck 设置控制）／
   再次施放专注法术（dnd5e mixin.mjs L251 item.actor.endConcentration）／
   失能状态施加（需开 concentrationIncapacitatedConditionCheck，patching.ts L2593）。
   跳过检查：options.noConcentrationCheck 或 options.dnd5e.concentrationCheck===false。
   主动断专注：actor.endConcentration(target?)（dnd5e actor.mjs L1065）—— 无参=全断；可传 effect id / AE / Item5e；
   hook dnd5e.preEndConcentration 返回 false 可拦截。
③ 本主题里 identifier / automationOnly / triggeredActivityId / otherActivityCompatible 四键最常用，
   工具里用 activities[].midiProperties（逐活动）或 create_item_minimal 顶层 midiProperties（只作用主活动）传。
活动链触发（**结算后自动触发同 item 另一活动，区别于 otherActivity**）：
  triggeredActivityId("none")  —— 触发目标；triggeredActivityConditionText 条件文案；triggeredActivityTargets("targets") 目标；
  triggeredActivityRollAs("self") 掷骰身份；triggeredActivityConsume(true) 消耗归属；triggeredActivityConfigure(true) 是否可配置。
  ▸ 机制（2026-09-14 源码核实）：主 workflow 走完 → WorkflowState_RollFinished 里**顺序发起第二个独立 workflow**，
    isTriggered = true，带环检测 visitedActivities（A→B→A 会弹错中止）；targetUuids 为空且非 retarget 则不触发。
  ▸ 现成配方（可整段抄）：
      "midiProperties": {
        "triggeredActivityId": "act_xxxx",          // 活动 id / identifier / 跨物品 UUID（getTriggeredActivity 三种都认）
        "triggeredActivityTargets": "hitTargets",   // self | hitTargets | missedTargets | failedSaves | saveTargets | targets | retarget
        "triggeredActivityRollAs": "self",          // self | firstTarget | firstHitTarget | firstMissedTarget | firstSaveTarget | firstFailedSaveTarget
        "triggeredActivityConsume": false,          // false = 触发时不扣被触发活动的资源
        "triggeredActivityConfigure": false,        // false = 跳过被触发活动的配置弹窗
        "triggeredActivityConditionText": ""        // 可选：触发条件（evalCondition）
      }
  ▸ 与 otherActivity 的取舍（**选哪个看这条**）：
       · otherActivity = **同一条结算链内的「第二掷」**（命中→豁免→子伤害 / 子效果），**共享一张聊天卡**、
         受 hit/save 门控、子方类型受限（damage/heal/save/check/utility）→ 做「命中→豁免→中毒」用它。
       · triggered = 主流程完成后**另一个完整独立流程**，可换掷骰身份（如以 firstFailedSaveTarget 掷）、
         可自选目标集、可有自己的消耗与配置弹窗、可用 UUID 跨物品 → 做「命中后追加一发完整攻击 / 附赠追击」用它。
         代价：triggered **不共享**命中 / 豁免门控，条件要靠 conditionText / targets 自己写。
  ▸ 三大常见搭配（社区实际用法，2026-09-14 核实）：
      1. **attack → attack/damage（命中后追加）**：主攻击命中 → 对命中者再打一发。
         **被触发活动设 automationOnly:true**，免得每次点击弹两个活动让你选。← 最常用
      2. **attack → heal/utility**：命中后自愈 / 辅助（targets 用 hitTargets 或 failedSaves）。
      3. **utility → attack**：先过检定再打（targets:"targets"，用 triggeredActivityConditionText 把关）。
  ▸ 「命中后追加一发」可抄骨架：
      { "activities": [
          { "type": "attack", "id": "act_main",
            "midiProperties": { "triggeredActivityId": "act_pursue", "triggeredActivityTargets": "hitTargets",
                                "triggeredActivityRollAs": "self", "triggeredActivityConsume": false,
                                "triggeredActivityConfigure": false } },
          { "type": "attack", "id": "act_pursue", "midiProperties": { "automationOnly": true } } ] }
  ▸ 7 个 targets 实际场景：
      self          对施法者自己（自愈 / 自 buff / 自伤）
      hitTargets    命中者（追加伤害 / 追击）—— **最常用**
      missedTargets 未命中者（失误补偿 / 复仇反击）
      failedSaves   豁免失败者（追加状态 / 二次伤害）
      saveTargets   所有参与豁免的（含成功者）
      targets       最初目标集（无条件追加）
      retarget      重新弹目标选择（二段攻击换目标）
对话窗 / 消耗：
  autoConsume(false) 跳过消耗确认直接扣；forceConsumeDialog("default") always/never/default 强制显示消耗弹窗（L651-652）；
  forceRollDialog("default") 强制掷骰弹窗；forceDamageDialog("default") 强制伤害弹窗。
目标：
  confirmTargets("default") always/never 强制目标确认（activityHelpers L191-192）；autoTargetType("any") 自动目标形状覆盖；
  autoTargetAction("default") 自动选目标动作覆盖。
其他活动资格（**最要紧的一组**）：
  automationOnly(false)  true = **不进「选择活动」弹窗、不能手动掷**，只能被自动化 / otherActivity 调用
                        —— 这是「隐藏子活动」的标准姿势（但仍可被显式 otherActivityId 调起）。
  otherActivityCompatible(true)  **只影响编辑期下拉与 "" 的 auto 探测候选**；显式 otherActivityId 时运行期根本不查它。
  otherActivityAsParentType(true) 子活动伤害按主活动类型判定。
其余：
  identifier("") 活动别名（可被 otherActivityId 引用）；displayActivityName(false) 聊天卡显示活动名；
  rollMode("default") 该活动掷骰模式覆盖；chooseEffects(false) 施加效果前弹选择；toggleEffect(false) 目标已有则移除（开关式）；
  ignoreFullCover(false) 无视全掩体；removeChatButtons("default") 移除聊天卡按钮；magicEffect(false) 豁免按魔法处理；
  magicDamage(false) 伤害项补 mgc 属性；noConcentrationCheck(false) 本次不做专注检定；skipConcentrationCheck(false) 跳过专注状态；
  autoCEEffects("default") 覆盖模块级 CE 效果自动应用；ignoreTraits{idi,idr,idv,ida,idm} 豁免项。

⚠️ 与 other-activity 主题的关系：otherActivity 管「主活动顺手结转另一个活动」，triggeredActivity 管「结算后再触发另一个」。
   两套机制独立，别混用。选哪个看上面那条取舍；「多活动共存但互不连带」请见 other-activity 与 midi-flags。`,
    'daelink': `【物品级效果施加链（命中→豁免失败→中毒）· 2026-09-16 源码核实 · 两条硬约束】
⚠️ 2026-09-16 补【重复施加与堆叠】（DAE _preCreateActiveEffect，dae.ts L570-700）：
去重完全靠 flags.dae.stackable，取值六种：
  缺省 / 空串  → 【不去重】重复命中会叠出多份同名效果（最容易踩的坑）
  "multi"                     → 显式允许堆叠多份
  "none"                      → 同 origin 即替换
  "noneName"                  → 同 origin + 同名替换（药水/法术/状态类最常用，样本库大量在用）
  "noneNameOnly"              → 同名即替换
  "count" / "countDeleteDecrement" → 同 origin+同名时 stacks+1、名称变「名字 (n)」（dae.ts L672-690）；
                                     删除时递减（_preDeleteActiveEffectDecrement L1025+），count 模式一次删全部栈
「不会重复施加」的四种情况：
  ① 效果 id 是 CONFIG.statusEffects 之一且目标已有 → 忽略（L687-689 Attempting to add…ignoring）
  ② 命中了上面任一去重键 ③ midi 侧 use.consumed===false 跳过 other 效果
  ④ preActiveEffects 宏返回 {haltEffectsApplication:true}
flags.dae.dontApply:true → DAE 施加时直接过滤掉该效果（GMAction.ts L314）。
⚠️ 实操建议：写 AE 时【显式给 stackable】—— 挂了 statuses 的中毒类其实安全（statuses 已存在会被忽略），
   但【没有 statuses 的纯 OverTime 效果会叠】，建议 "noneName"（刷新而非叠层）或 "count"（要叠层）。
链路：midi-qol 的 WorkflowState_ApplyDynamicEffects（Workflow.ts L2820-2998）负责把**物品级 AE 复制到豁免失败的目标**上。
     dnd5e 核心**不**做这件事（核心只在 summon 等少数场景用 applicableEffects）。
     触发时机：伤害 / 豁免结算**之后**（WaitForSaves → ApplyDynamicEffects 状态机顺序）。

⚠️⚠️ 两条硬约束（任一条不满足 = 静默失效，不报错）：
1. **id 必须一致**：save 活动的 effects[] 是 dnd5e 的 AppliedEffectField（{_id, level{min,max}, onSave}），
   它的 effect getter 就是 item.effects.get(this._id) —— **这就是引用机制本身**。
   ⇒ activities.<saveId>.effects[0]._id **必须等于** item.effects[<某效果>]._id。
   （本插件 create_item_minimal 已强制两处共用同一个 id，并在 verify 里核对落库值。）
2. **必须装了 DAE 模块**：midi 里是 hasActivityEffects = hasDAE(this) && ...
   ⇒ **没装 DAE 则效果应用整段跳过**。这是「卡面看着全对、打起来没毒」最常见的真正原因。
   遇到「武器看着没毛病但不中毒」，**先问使用者装没装 DAE / DAE 是否启用**，别急着改数据。

其他必需条件：
- transfer 必须 **false**（midi 过滤 transfer !== true）
- type 不能是 "enchantment"
- onSave: false = 豁免成功**不**挂（中毒的标准写法）
- level{min,max} 需覆盖活动 relevantLevel
- statuses 必须是 CONFIG.statusEffects 里的合法 id（如 "poisoned"，可用 foundry_list_status_effects 查）
- origin 非空（Item.<itemId>）—— 溯源用，空着会让依赖 origin 的效果宏/自动化失效

配套写法（本插件 create_item_minimal 的默认形态）：
  物品级 AE = { transfer:false, statuses:[...], changes:[{key:'flags.midi-qol.OverTime', mode:0, priority:20, value:'turn=start,...'}] }
  持续伤害的结束由 OverTime 的 saveCount=1- 负责，**duration 留全 null（永久）** 才是正确做法 —— 见 midi-over-time 主题。`,
};
/**
 * 注册 foundry_reference 工具：一次本地调用返回精简模板，零 HTTP、零延迟。
 * execute 返回 {topic, template} 满足 DSH 对象输出校验；
 * render 把 template 以纯文本输出（不包 JSON 外层转义），AI 复制即用。
 */
export function registerReferenceTools(REG) {
    const topics = Object.keys(REFERENCE);
    const tool = {
        name: 'foundry_reference',
        description: '内置 dnd5e 5.3.3 结构参考库（本地模板，零 HTTP 延迟，秒回省 token）。**建物品/加自动化/写怪物前先查这里，别再 search+get_entity 拉完整样本怪照抄（一次几十 KB 白花钱）。** 结构模板：weapon=武器物品（伤害骰放 damage.base 铁律）；roll-data=**动态引用 @公式总表**（写任何公式/DC/加值前先查，别写死数字）；save-activity=豁免活动（咬中过豁免中状态）；effect=ActiveEffect 自动化（statuses+changes）；creature=NPC 数值骨架（僵尸样例）；feat=被动特性物品；spell=法术物品；status-list=常用状态 id。效应配方：bonuses=加伤/减益/改动键速查；midi-over-time=持续伤害 OverTime；midi-flags=midi-qol 常用 flags+macroPass 表；other-activity=**活动间绑定 otherActivity**（多活动共存/连带结算/双伤害模型/automationOnly）；probe=**F12 控制台运行时探针**（midi workflow 五面快照，卡面全对但打起来不对时先跑它）；activity-types=**dnd5e 5.3.3 全部 12 种活动类型**（含三个常见误解 + 双形态武器正确做法）；activity-deep=**活动与工作流深层语义**（relevantLevel 等级门槛如何算 / check.dc 是判定线 / transform 变身骨架 / flags.dnd5e.scaling 升环 / 消费 flag 真键是 use.consumed / 活动 uuid 稳定契约 / 读改运行时值的正确时点）；midi-properties=**midiProperties 全部 29 键语义**；daelink=**物品级效果施加链**（命中→豁免→中毒，含 _id 一致性与「必须装 DAE」两条硬约束）；item-macro=物品宏三件套+宏体骨架；aura=光环效果；dae=DAE 主动效果机制（特殊时长/macro.execute/change-key 配方）；conditions=激活条件全集（运算符/变量/示例）；enchant=附魔键值（改物品/行动）+ **附魔活动 schema**（5.3.3 的 riders/restrictions/self）；optional=Optional 可选加值全集；trigger=自动化路由+反应触发/触发行动；overtime-activity=行动版 OverTime（⚠键名未坐实）。工作纪律：iron-rules=开工七铁律（先查证再动手）；pitfalls=高频坑速查（effects 层级/DC 两说/图标 404 等）。',
        parameters: {
            type: 'object',
            properties: {
                topic: { type: 'string', enum: topics, description: '要查的模板主题：' + topics.join(' / ') },
            },
            required: ['topic'],
            additionalProperties: true,
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render: (_args, value) => {
                const v = value;
                if (typeof v === 'string')
                    return [{ type: 'text', text: v }];
                if (v && typeof v === 'object' && typeof v.template === 'string')
                    return [{ type: 'text', text: v.template }];
                return [{ type: 'text', text: JSON.stringify(value, null, 2) }];
            },
        },
        async execute(args) {
            const topic = String(args.topic);
            if (!topic || !REFERENCE[topic]) {
                return { topic, error: '未知主题「' + topic + '」。可用主题：' + topics.join(', ') };
            }
            return { topic, template: REFERENCE[topic] };
        },
    };
    REG(tool);
}
export { REFERENCE };
//# sourceMappingURL=reference.js.map