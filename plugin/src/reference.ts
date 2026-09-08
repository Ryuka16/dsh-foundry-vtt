/**
 * 内置基础参考库 —— 解决「AI 每次现查样本怪/样本物品照抄结构」的 token 浪费。
 *
 * 模板来源：用户世界 gesila（dnd5e 5.3.3, Foundry 13.351）实测验证过的实体结构
 * （僵尸/啃咬/尸毒豁免/巨蜘蛛样本），未验证字段已明确标注。
 * AI 需要结构模板时用 foundry_reference{topic} 一次本地调用拿到，
 * 替代 foundry_search + foundry_get_entity 拉完整样本（一次省几十 KB）。
 */

const REFERENCE: Record<string, string> = {
  weapon: `【dnd5e 5.3.3 武器物品模板 · 已验证】
流程：foundry_create_entity{entityType:"Item", data:<本模板>} 创建物品 → foundry_modify_actor{action:"give", itemUuid} 给怪物。
铁律：伤害骰只写 system.damage.base{number,denomination,bonus,types}；activities 的 damage.parts 必须留空数组 + includeBase:true；写 parts[].formula 会被 5.3.3 清洗成空（怪物没伤害）。

最小可用模板（啃咬 1d8 穿刺）：
{
  "name": "啃咬",
  "type": "weapon",
  "img": "icons/weapons/fangs/fangs-bite.webp",
  "system": {
    "description": { "value": "" },
    "source": { "rules": "2024", "book": "", "page": "", "custom": "" },
    "quantity": 1,
    "weight": { "value": 0, "units": "lb" },
    "price": { "value": 0, "denomination": "gp" },
    "attunement": "",
    "equipped": true,
    "rarity": "",
    "identified": true,
    "properties": [],
    "proficient": false,
    "type": { "value": "natural", "baseItem": "" },
    "range": { "value": null, "long": null, "units": "ft" },
    "uses": { "spent": 0, "max": null, "recovery": [] },
    "damage": {
      "base": { "number": 1, "denomination": 8, "bonus": "", "types": ["piercing"],
        "custom": { "enabled": false, "formula": "" },
        "scaling": { "mode": "", "number": null, "formula": "" } }
    },
    "activities": {
      "dnd5eactivity000": {
        "type": "attack",
        "name": "",
        "activation": { "type": "action", "value": 1, "condition": "" },
        "duration": { "value": "inst", "units": "inst", "concentration": false },
        "range": { "value": 5, "long": null, "units": "ft" },
        "target": { "template": { "type": null, "count": "", "contiguous": false, "units": "" },
          "affects": { "type": "creature", "count": 1, "special": "" } },
        "attack": { "ability": "str", "bonus": "3", "critical": { "threshold": null },
          "flat": false, "type": { "value": "melee", "classification": "weapon" } },
        "damage": { "critical": { "bonus": "" }, "includeBase": true, "parts": [] },
        "effects": [],
        "consumption": { "scaling": { "allowed": false, "max": "" }, "targets": [] },
        "otherActivityId": "",
        "uses": { "spent": 0, "max": null, "recovery": [] },
        "properties": [],
        "_id": "dnd5eactivity000"
      }
    }
  },
  "effects": [],
  "flags": {}
}
要点：attack.ability 用 str/dex 等缩写；attack.bonus 写总加值字符串（如 "3"）或留 "" 让系统算；range.value 5 = 近战 5 尺。带毒版本三件套：attack 设 "otherActivityId":"dnd5eactivity100" + save 活动（见 save-activity）+ 物品顶层 effects 放毒 ActiveEffect（见 effect）——缺一不可，详情见 save-activity 的层级铁律。`,

  'save-activity': `【5.3.3 豁免活动模板 · 已验证（僵尸啃咬尸毒实测正常 + 多多剑翻车案例修正）】
攻击命中后目标过豁免、失败中状态。三件套缺一不可：

① attack 活动必须设 "otherActivityId": "dnd5eactivity100" 指向 save 活动（漏了 = 攻击不触发豁免，多多剑翻车点之一）
② save 活动本体：
{
  "dnd5eactivity100": {
    "type": "save",
    "name": "",
    "activation": { "type": "", "value": null, "condition": "" },
    "duration": { "value": "", "units": "inst", "concentration": false },
    "range": { "value": null, "long": null, "units": "spec" },
    "target": { "template": { "type": null, "count": "", "contiguous": false, "units": "" },
      "affects": { "type": "creature", "count": 1, "special": "" } },
    "save": {
      "ability": ["con"],
      "dc": { "calculation": "flat", "formula": "11" },
      "scaling": { "mode": "none", "formula": "", "bonus": "" }
    },
    "damage": { "critical": { "bonus": "" }, "includeBase": false, "parts": [] },
    "effects": [ { "_id": "d23QTwP434lw72W2", "onSave": false } ],
    "consumption": { "scaling": { "allowed": false, "max": "" }, "targets": [] },
    "uses": { "spent": 0, "max": null, "recovery": [] },
    "properties": [],
    "_id": "dnd5eactivity100"
  }
}
③ 真正的中毒效果挂【物品级 effects 数组】（ActiveEffect 结构），不是 activity.effects！

⚠️ 层级铁律（多多剑翻车根因）：save activity 的 effects 是【空壳】{_id, onSave:false}——往里面塞 name/statuses/duration 会被 5.3.3 清洗成空（实测：statuses 全丢）。挂状态（poisoned 等）必须写在物品顶层 effects 数组（ActiveEffect 结构，见 effect 主题）。僵尸啃咬 = 本模板 + 物品级「尸毒」ActiveEffect，用户实测正常；照抄勿改。
要点：dc.formula 写固定数字字符串（如 "11"）；onSave:false = 豁免失败才生效。`,

  effect: `【物品 ActiveEffect 自动化模板 · 已验证（僵尸啃咬尸毒实测正常）】
放进物品/特性顶层的 effects 数组（注意：不是 activity 的 effects！层级见 save-activity 铁律）。或直接用 foundry_add_effect{uuid, statusId:"poisoned"} 给 actor 挂现成状态（最简单，推荐优先）。

{
  "name": "尸毒",
  "icon": "icons/magic/poison/dagger-poison-green.webp",
  "statuses": ["poisoned"],
  "duration": { "seconds": 3600, "rounds": null, "turns": null, "startTime": null, "startRound": null, "startTurn": null },
  "disabled": false,
  "transfer": false,
  "changes": [
    { "key": "flags.midi-qol.disadvantage.attack.all", "mode": 0, "value": "1", "priority": 20 }
  ],
  "flags": {},
  "origin": null
}
要点：
- statuses 放状态 id（poisoned/prone 等，见 status-list）→ 命中后目标被挂对应状态（与 save activity 配合：豁免失败才触发）
- changes 是附加自动化：常用 key "flags.midi-qol.disadvantage.attack.all"（攻击劣势）、"flags.midi-qol.disadvantage.check.all"（检定劣势）——需要 midi-qol 模块；mode 0=覆盖 2=加 5=减
- 完整「命中→豁免→失败中毒」链路 = weapon 的 attack 活动 + otherActivityId 指向 save 活动 + 本模板（见 save-activity）`,

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
- 无视护甲：flags.midi-qol.ignoreArmor mode 0 "true"（+ flags.dae.specialDuration:["1Attack"] 下一次攻击后消失）
- 无视盾牌：flags.midi-qol.ignoreShield mode 0 "true"
- 重击阈值：flags.midi-qol.criticalThreshold mode 0 "19"（19-20 重击）
- 移动减速：system.attributes.movement.walk mode 1 value "0.5"（速度减半）
mode 表：0=CUSTOM（交模块处理，midi flags 都用这个）/ 1=MULTIPLY乘 / 2=ADD加 / 3=DOWNGRADE / 4=UPGRADE / 5=OVERRIDE
⚠️ 需要 midi-qol 模块（用户已装 13.0.55）。不确定的键先 foundry_knowledge 查 data-dict 或用户世界找样本，0 样本不用。`,

  'midi-over-time': `【持续伤害/持续效果 OverTime · 出自用户资料库 data-dict §17 + 开工铁律】
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
- 其余常用 flags：optional.*（见 bonuses）、OverTime（见 midi-over-time）、ignoreArmor/ignoreShield/criticalThreshold（见 bonuses）
⚠️ 任何没把握的 flags 键先 foundry_knowledge 查资料库或用 grep 找用户世界样本，0 样本 = 臆造，禁用。`,

  'item-macro': `【物品宏三件套 · 出自用户资料库「midi的物品宏使用指南」，磁轭手铳金标准实测通过】
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
}

/**
 * 注册 foundry_reference 工具：一次本地调用返回精简模板，零 HTTP、零延迟。
 * execute 返回 {topic, template} 满足 DSH 对象输出校验；
 * render 把 template 以纯文本输出（不包 JSON 外层转义），AI 复制即用。
 */
export function registerReferenceTools(REG: (t: { name: string }) => void) {
  const topics = Object.keys(REFERENCE)

  const tool: { name: string } & Record<string, unknown> = {
    name: 'foundry_reference',
    description:
      '内置 dnd5e 5.3.3 结构参考库（本地模板，零 HTTP 延迟，秒回省 token）。**建物品/加自动化/写怪物前先查这里，别再 search+get_entity 拉完整样本怪照抄（一次几十 KB 白花钱）。** 结构模板：weapon=武器物品（伤害骰放 damage.base 铁律）；save-activity=豁免活动（咬中过豁免中状态）；effect=ActiveEffect 自动化（statuses+changes）；creature=NPC 数值骨架（僵尸样例）；feat=被动特性物品；spell=法术物品；status-list=常用状态 id。效应配方：bonuses=加伤/减益/改动键速查；midi-over-time=持续伤害 OverTime；midi-flags=midi-qol 常用 flags+macroPass 表；item-macro=物品宏三件套+宏体骨架；aura=光环效果。工作纪律：iron-rules=开工七铁律（先查证再动手）；pitfalls=高频坑速查（effects 层级/DC 两说/图标 404 等）。',
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
      render: (_args: unknown, value: unknown): Array<{ type: 'text'; text: string }> => {
        const v = value as { topic?: string; template?: string; error?: string } | string
        if (typeof v === 'string') return [{ type: 'text', text: v }]
        if (v && typeof v === 'object' && typeof v.template === 'string') return [{ type: 'text', text: v.template }]
        return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
      },
    },
    async execute(args: Record<string, unknown>) {
      const topic = String(args.topic)
      if (!topic || !REFERENCE[topic]) {
        return { topic, error: '未知主题「' + topic + '」。可用主题：' + topics.join(', ') }
      }
      return { topic, template: REFERENCE[topic] }
    },
  }
  REG(tool)
}

export { REFERENCE }
