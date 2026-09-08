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
/** ActiveEffect 摘要：名字/状态/时长/自动化 changes（含 midi-qol 键）。 */
const EFFECT_TREE = {
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
        uses: { spent: true, max: true, recovery: true },
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
                damage: { includeBase: true, critical: { bonus: true }, parts: [{ formula: true }] },
                save: { ability: true, dc: { calculation: true, formula: true }, scaling: true },
                effects: [EFFECT_TREE],
                uses: { spent: true, max: true, recovery: true },
                consumption: true,
                scaling: { mode: true, formula: true },
                heal: { formula: true },
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
        if ('activities' in s || 'damage' in s)
            return deepPick(d, ITEM_TREE);
    }
    return { name: d.name, type: d.type, _id: d._id, folder: d.folder, note: '该实体类型无精简模板；需要完整内容请用 summary:false' };
}
//# sourceMappingURL=summarize.js.map