/**
 * 内置基础参考库 —— 解决「AI 每次现查样本怪/样本物品照抄结构」的 token 浪费。
 *
 * 模板来源：用户世界 gesila（dnd5e 5.3.3, Foundry 13.351）实测验证过的实体结构
 * （僵尸/啃咬/尸毒豁免/巨蜘蛛样本），未验证字段已明确标注。
 * AI 需要结构模板时用 foundry_reference{topic} 一次本地调用拿到，
 * 替代 foundry_search + foundry_get_entity 拉完整样本（一次省几十 KB）。
 */
const REFERENCE = {
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
        description: '内置 dnd5e 5.3.3 结构参考库（本地模板，零 HTTP 延迟，秒回省 token）。**建物品/加自动化/写怪物前先查这里，别再 search+get_entity 拉完整样本怪照抄（一次几十 KB 白花钱）。** 主题：weapon=武器物品模板（伤害骰放 damage.base 铁律）；save-activity=豁免活动（咬中过豁免中状态）；effect=ActiveEffect 自动化（statuses+changes）；creature=NPC 数值骨架（僵尸样例）；feat=被动特性物品；spell=法术物品；status-list=常用状态 id 速查。',
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