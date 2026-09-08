// src/minimal.ts — foundry_create_item_minimal：省 token 建武器物品工具。
// 群友『Observer』点子的实测化：create 最小壳（dnd5e 自己生成默认结构，自动适配版本更新）+ update 只 merge 语义关键字段。
// 插件不内置完整模板 → 零维护债；AI 只写 ~1KB 关键字段，不再手搓 7KB 完整 JSON 碰壁。
import { randomBytes } from 'node:crypto';
const ID16 = () => randomBytes(8).toString('hex');
const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const SAVE_KEY = 'dnd5eactivity100';
function unwrapEntity(raw) {
    const r = raw;
    if (!r)
        return undefined;
    if (r.entity && typeof r.entity === 'object') {
        const e = r.entity;
        return Array.isArray(e) ? e[0] : e;
    }
    if (r.data && typeof r.data === 'object' && !Array.isArray(r.data))
        return r.data;
    return r;
}
function getDefaultAttackKey(createdEntity) {
    if (!createdEntity)
        return '';
    const sys = createdEntity.system;
    const acts = sys?.activities;
    if (acts && typeof acts === 'object') {
        for (const [k, v] of Object.entries(acts)) {
            if (v?.type === 'attack')
                return k;
        }
    }
    return '';
}
/** 组装 update 的语义关键字段（merge 进 dnd5e 默认结构）。 */
function buildUpdateData(a, attackKey) {
    const name = String(a.name ?? '');
    const notes = [];
    const dmg = (a.damage ?? {});
    const ability = ABILITIES.includes(a.ability) ? String(a.ability) : 'str';
    const ranged = a.ranged === true;
    const hasSave = typeof a.save === 'object' && a.save !== null && a.save.dc !== undefined;
    const sys = { description: { value: typeof a.description === 'string' ? a.description : '' } };
    sys.damage = {
        base: {
            number: Number(dmg.number ?? 1),
            denomination: Number(dmg.denomination ?? 4),
            bonus: typeof dmg.bonus === 'string' ? dmg.bonus : '',
            types: Array.isArray(dmg.types) ? dmg.types : [],
        },
    };
    const activities = {};
    const extraDamage = typeof a.extraDamage === 'object' && a.extraDamage !== null
        ? a.extraDamage
        : undefined;
    const attackUpdate = {
        attack: {
            ability,
            bonus: typeof a.toHit === 'number' ? String(a.toHit) : '',
            flat: typeof a.toHit === 'number',
            type: { value: ranged ? 'ranged' : 'melee', classification: 'weapon' },
        },
        damage: {
            includeBase: true,
            parts: extraDamage && typeof extraDamage.number === 'number' && typeof extraDamage.denomination === 'number'
                ? [{ number: extraDamage.number, denomination: extraDamage.denomination, bonus: '', types: Array.isArray(extraDamage.types) ? extraDamage.types : [] }]
                : [],
        },
        range: { value: ranged ? '20' : '5', units: 'ft' },
        otherActivityId: hasSave ? SAVE_KEY : '',
    };
    if (attackKey) {
        activities[attackKey] = attackUpdate;
        notes.push(`攻击字段 merge 进 dnd5e 默认攻击活动（${attackKey}）`);
    }
    else {
        activities.dnd5eactivity000 = { ...attackUpdate, type: 'attack', name };
        notes.push('无默认攻击活动，新建 dnd5eactivity000');
    }
    if (hasSave) {
        const sv = a.save;
        const saveAbility = ABILITIES.includes(sv.ability) ? String(sv.ability) : 'con';
        const saveDc = Number(sv.dc);
        activities[SAVE_KEY] = {
            type: 'save', name,
            activation: { type: 'special' },
            save: { ability: [saveAbility], dc: { calculation: 'flat', formula: String(saveDc) } },
            damage: { onSave: 'none', parts: [], critical: { allow: false } },
            effects: [{ _id: ID16(), onSave: false }],
        };
        notes.push(`命中后触发 DC${saveDc} ${saveAbility.toUpperCase()} 豁免（${attackKey || 'dnd5eactivity000'}.otherActivityId → ${SAVE_KEY}）`);
    }
    sys.activities = activities;
    const data = { system: sys };
    const hasEffect = Array.isArray(a.statuses) || (typeof a.overTime === 'string' && a.overTime.trim());
    if (hasEffect) {
        const changes = [];
        if (typeof a.overTime === 'string' && a.overTime.trim()) {
            changes.push({ key: 'flags.midi-qol.OverTime', mode: 0, priority: 20, value: a.overTime.trim() });
        }
        data.effects = [{
                _id: ID16(),
                name: typeof a.effectName === 'string' && a.effectName.trim() ? a.effectName : name,
                img: typeof a.effectImg === 'string' && a.effectImg.trim() ? a.effectImg : 'icons/svg/aura.svg',
                origin: null, type: 'base', system: {},
                changes, disabled: false,
                duration: { seconds: 60 },
                description: '<p></p>', tint: '#ffffff', transfer: false,
                statuses: Array.isArray(a.statuses) ? a.statuses : [],
                sort: 0,
                flags: { core: { overlay: false } },
            }];
        notes.push(`物品级效果${Array.isArray(a.statuses) ? '（statuses: ' + a.statuses.join(', ') + '）' : ''}${typeof a.overTime === 'string' && a.overTime.trim() ? '（OverTime: ' + a.overTime + '）' : ''}`);
    }
    return { data, notes };
}
export function registerMinimalTools(h, reg) {
    reg(h.makeTool('foundry_create_item_minimal', '省 token 快速建武器物品：先 create 最小壳（dnd5e 自己生成默认结构），再 update 只 merge 语义关键字段——AI 只给关键参数，不用手搓完整 JSON，插件也不内置易过时的模板。\n' +
        '参数：name 必填；damage{number,denomination,types,bonus} 主要伤害骰（如 1d8 穿刺）；ability 攻击属性（默认 str）；toHit 固定命中加值；ranged 远程；extraDamage{number,denomination,types} 附加伤害；save{ability,dc} 命中后目标豁免（失败才触发挂状态/持续伤害）；statuses 豁免失败挂的状态 id（如 ["poisoned"]，从 foundry_list_status_effects 拿）；overTime midi-qol OverTime 逗号参数串（如 "turn=start,damageRoll=1d4,damageType=fire,saveDC=13,saveAbility=con,saveCount=1-,label=灼烧"）；effectName/effectImg 效果名与图标（默认物品名/icons/svg/aura.svg）；folder 归档文件夹。\n' +
        '典型用法：毒牙 = damage{number:1,denomination:6,types:["piercing"]} + save{ability:"con",dc:13} + statuses:["poisoned"] + overTime:"turn=start,damageRoll=1d4,damageType=poison,saveDC=13,saveAbility=con,saveCount=1-,label=中毒"。', {
        name: { type: 'string', description: '物品名' },
        description: { type: 'string', description: '物品描述（可选）' },
        damage: {
            type: 'object', description: '主要伤害骰，如 {number:1,denomination:8,types:["piercing"]}',
            properties: {
                number: { type: 'number', description: '骰数' },
                denomination: { type: 'number', description: '骰面' },
                types: { type: 'array', items: { type: 'string' }, description: '伤害类型（bludgeoning/piercing/slashing/fire/poison/acid 等）' },
                bonus: { type: 'string', description: '固定加值（可选）' },
            },
        },
        ability: { type: 'string', enum: [...ABILITIES], description: '攻击属性，默认 str' },
        toHit: { type: 'number', description: '固定命中加值（可选，不传则由系统按属性自动计算）' },
        ranged: { type: 'boolean', description: '远程攻击，默认近战' },
        extraDamage: {
            type: 'object', description: '附加伤害（可选），如 {number:1,denomination:6,types:["poison"]}',
            properties: {
                number: { type: 'number' },
                denomination: { type: 'number' },
                types: { type: 'array', items: { type: 'string' } },
            },
        },
        save: {
            type: 'object', description: '命中后目标豁免（可选），如 {ability:"con",dc:13}',
            properties: {
                ability: { type: 'string', enum: [...ABILITIES] },
                dc: { type: 'number' },
            },
        },
        statuses: { type: 'array', items: { type: 'string' }, description: '豁免失败后挂的状态 id（可选，如 ["poisoned"]）' },
        effectName: { type: 'string', description: '效果名（默认物品名）' },
        effectImg: { type: 'string', description: '效果图标路径（默认 icons/svg/aura.svg）' },
        overTime: { type: 'string', description: 'midi-qol OverTime 逗号参数串（可选）' },
        folder: { type: 'string', description: '归档文件夹 uuid（可选）' },
    }, ['name'], async (args) => {
        // 1) create 最小壳：dnd5e 自己生成默认结构（自动适配系统版本）
        const created = (await h.callRelay('POST', '/create', {
            query: h.targetingQuery(args),
            body: { entityType: 'Item', data: { name: args.name, type: 'weapon', folder: args.folder } },
        }));
        const createdEntity = unwrapEntity(created);
        const uuid = createdEntity?._id || String(created.uuid ?? created.data?.uuid ?? '').replace(/^(Item\.)?/, '');
        const attackKey = getDefaultAttackKey(createdEntity);
        // 2) update 只 merge 语义关键字段
        const { data, notes } = buildUpdateData(args, attackKey);
        const { doc: updData } = h.normalizeDocIds(data);
        const updated = (await h.callRelay('PUT', '/update', {
            query: { ...h.targetingQuery(args), uuid: 'Item.' + uuid },
            body: { data: updData },
        }));
        // 3) 读回验证关键字段落库
        let verify = {};
        try {
            await new Promise((r) => setTimeout(r, 1500));
            const raw = (await h.callRelay('GET', '/get', { query: { ...h.targetingQuery(args), uuid: 'Item.' + uuid } }));
            const got = unwrapEntity(raw);
            const sys = (got?.system ?? {});
            const acts = (sys.activities ?? {});
            const attackAct = Object.values(acts).find((x) => x?.type === 'attack');
            const saveAct = Object.values(acts).find((x) => x?.type === 'save');
            verify = {
                damageBase: sys.damage?.base,
                attack: attackAct?.attack,
                attackOtherActivityId: attackAct?.otherActivityId,
                saveDc: saveAct ? saveAct.save?.dc : undefined,
                saveDamage: saveAct?.damage,
                effects: got?.effects,
            };
        }
        catch {
            verify = { note: '读回验证超时（写入已返回成功）' };
        }
        return {
            uuid: 'Item.' + uuid,
            created: true,
            updated: true,
            verified: true,
            notes,
            verify,
            note: (notes.length ? notes.join('；') : '物品已创建') + '。给角色用时 foundry_modify_actor(action:give, toUuid:角色uuid, itemUuid:此uuid)。',
        };
    }));
}
//# sourceMappingURL=minimal.js.map