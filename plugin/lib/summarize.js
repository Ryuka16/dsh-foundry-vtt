/**
 * 实体精简器：把 relay 返回的完整实体 JSON 按白名单树提取关键字段。
 *
 * 用于 foundry_get_entity / foundry_import_entity / foundry_get_scene 的 summary:true 模式——
 * 砍掉账单里最大的 token 开销（完整 Actor/Item JSON 一次动辄几十 KB，
 * 而 AI 实际只需要数值、伤害结构、活动/效果摘要这几百字节）。
 *
 * 设计：白名单树 pick（deepPick）。树叶子 true = 取原值；
 * 数组节点 [子树] = 对每个元素应用子树；对象节点 {'*': 子树} = 对 map 的全部值应用子树。
 * 未命中的键直接丢弃；结构有出入只会少字段、不会错字段。
 */
function deepPick(src, tree) {
    if (tree === true)
        return src;
    if (Array.isArray(tree)) {
        if (!Array.isArray(src))
            return undefined;
        const sub = tree[0];
        const out = src.map((s) => deepPick(s, sub)).filter((v) => v !== undefined);
        return out.length ? out : undefined;
    }
    if (tree && typeof tree === 'object') {
        if (src == null || typeof src !== 'object')
            return undefined;
        const s = src;
        const t = tree;
        if ('*' in t) {
            const sub = t['*'];
            const out = {};
            for (const [k, v] of Object.entries(s)) {
                const picked = deepPick(v, sub);
                if (picked !== undefined)
                    out[k] = picked;
            }
            return out;
        }
        const out = {};
        for (const [k, v] of Object.entries(t)) {
            const picked = deepPick(s[k], v);
            if (picked !== undefined)
                out[k] = picked;
        }
        return out;
    }
    return undefined;
}
/** ActiveEffect 摘要：名字/状态/时长/自动化 changes（含 midi-qol 键）。
 *  _id 必须保留：save 活动的 effects[0]._id 要靠它去物品 effects 里取效果，
 *  剥掉会渲染成 {}，看着像「关联失败」，也让人无法核对。 */
const EFFECT_TREE = {
    _id: true,
    name: true,
    icon: true,
    disabled: true,
    statuses: true,
    transfer: true,
    duration: { seconds: true, rounds: true, turns: true, remaining: true },
    changes: [{ key: true, mode: true, value: true, priority: true }],
};
/** 物品摘要：伤害结构 + 活动（攻击/豁免/伤害）+ 装备状态 + 效果。 */
const ITEM_TREE = {
    name: true,
    type: true,
    img: true,
    _id: true,
    folder: true,
    system: {
        description: true,
        damage: { base: true, versatile: true },
        equipped: true,
        proficient: true,
        quantity: true,
        attunement: true,
        rarity: true,
        level: true,
        school: true,
        identified: true,
        type: { value: true, baseItem: true, subtype: true },
        preparation: { mode: true, prepared: true },
        range: { value: true, long: true, units: true },
        activation: { type: true, value: true, condition: true },
        duration: { value: true, units: true, concentration: true },
        target: { template: true, affects: true, count: true },
        properties: true,
        // ⚠️ uses 必须写在 system 层！活动内层的 uses（L115）是另一回事。
        // 实锤：这条原来漏了，导致 consumable 的充能次数/autoDestroy 读不回来，
        // 「魔杖到底会不会自毁」只能读全文才知道（子代理重跑时被迫这么干）。
        uses: { spent: true, max: true, recovery: true, autoDestroy: true },
        // container / backpack 的关键字段（它们没有 activities，靠这个才认得出来）
        // ⚠️ 别在这里重复写 rarity/range/duration/level/school —— 上面已有，重复键 tsc 直接报 TS1117
        capacity: { weight: { value: true, units: true }, volume: { units: true } },
        magicalBonus: true,
        armor: { value: true, dex: true },
        strength: true,
        identifier: true,
        recharge: { value: true, formula: true },
        requirements: true,
        activities: {
            '*': {
                type: true,
                name: true,
                activation: { type: true, value: true, condition: true },
                duration: { value: true, units: true, concentration: true },
                range: { value: true, long: true, units: true },
                target: { template: true, affects: true, count: true },
                attack: { ability: true, bonus: true, critical: { threshold: true }, flat: true, type: { value: true, classification: true } },
                // ⚠️ 5.3.3 的 parts 元素是 {number,denomination,bonus,types}（不是 formula）——
                // 只留 formula 的话整块渲染成 [{}]，看着像「伤害没落上」（实测踩过，一度误判）。
                damage: {
                    includeBase: true,
                    onSave: true,
                    critical: { bonus: true, allow: true },
                    parts: [{ number: true, denomination: true, bonus: true, types: true, formula: true, scaling: { mode: true, number: true, formula: true }, custom: { enabled: true, formula: true } }],
                },
                save: { ability: true, dc: { calculation: true, formula: true }, scaling: true },
                // ⚠️ 键名是 healing 不是 heal —— 写错 heal 会让治疗法术的恢复量被整块吞掉（实测踩过）。
                healing: { number: true, denomination: true, bonus: true, types: true, custom: { enabled: true, formula: true }, scaling: true },
                effects: [EFFECT_TREE],
                uses: { spent: true, max: true, recovery: true, autoDestroy: true },
                consumption: true,
                scaling: { mode: true, formula: true },
                summon: true,
                profiles: true,
                creatureTypes: true,
                area: { type: true, value: true },
                properties: true,
                otherActivityId: true,
                _id: true,
            },
        },
    },
    effects: [EFFECT_TREE],
};
/** Actor 摘要：数值骨架 + 物品/效果摘要 + prototypeToken。 */
const ACTOR_TREE = {
    name: true,
    type: true,
    img: true,
    _id: true,
    folder: true,
    system: {
        attributes: true,
        skills: true,
        statuses: true,
        // 选型刚需：CR 在 system.details.cr —— 没有它，AI 选怪时会以为「世界包的怪都不带 CR」进而自建怪。
        // 只取选型用得到的字段，不含 biography（那会把摘要撑爆）。
        details: { cr: true, level: true, type: true, alignment: true, xp: { value: true }, source: { rules: true, book: true, page: true } },
    },
    items: [ITEM_TREE],
    effects: [EFFECT_TREE],
    prototypeToken: { name: true, x: true, y: true, width: true, height: true, displayBars: true, displayName: true, disposition: true, hidden: true, sight: { enabled: true, range: true, visionMode: true } },
};
/** 场景摘要：网格/尺寸 + token 位置列表（放怪/移怪正需要）。 */
const SCENE_TREE = {
    name: true,
    _id: true,
    active: true,
    width: true,
    height: true,
    padding: true,
    grid: { size: true, type: true, distance: true, units: true },
    background: { src: true },
    tokens: [{ _id: true, name: true, x: true, y: true, elevation: true, width: true, height: true, hidden: true, disposition: true, actorId: true }],
};
/**
 * 按实体类型挑选白名单树并精简。
 * Actor/Item/Scene 有模板；其余类型（Journal/RollTable/Macro…）只给元信息，
 * 需要完整内容时调用方应使用 summary:false。
 */
export function summarizeDoc(doc) {
    if (doc == null || typeof doc !== 'object')
        return doc;
    const d = doc;
    const type = String(d.type ?? '');
    if (type === 'npc' || type === 'character' || type === 'vehicle')
        return deepPick(d, ACTOR_TREE);
    // relay 的 scene 文档顶层常缺 type 字段，用 grid 特征判定
    if (type === 'scene' || (d.grid && typeof d.grid === 'object'))
        return deepPick(d, SCENE_TREE);
    const sys = d.system;
    if (sys && typeof sys === 'object') {
        const s = sys;
        // ⚠️ 判据不能只认 activities/damage —— container（只有 capacity）、equipment（armor）、
        // consumable（uses）都没有 activities，会被误判成「该实体类型无精简模板」而白跑一趟（实测踩过）。
        if ('activities' in s || 'damage' in s || 'capacity' in s || 'armor' in s || 'uses' in s || 'school' in s || 'type' in s) {
            return deepPick(d, ITEM_TREE);
        }
    }
    return { name: d.name, type: d.type, _id: d._id, folder: d.folder, note: '该实体类型无精简模板；需要完整内容请用 summary:false' };
}
//# sourceMappingURL=summarize.js.map