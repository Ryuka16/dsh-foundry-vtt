// src/minimal.ts — foundry_create_item_minimal：省 token 建物品工具（全类型）。
// 群友『Observer』点子的实测化：create 最小壳（dnd5e 自己生成默认结构，自动适配版本更新）+ update 只 merge 语义关键字段。
// 插件不内置完整模板 → 零维护债；AI 只写 ~1KB 关键字段，不再手搓 7KB 完整 JSON 碰壁。
//
// 支持 7 类物品，结构全部来自世界内官方样本实测（非推测）：
//   weapon     → system.type{value:"martialM",baseItem:"halberd"} + damage.base + attack/save 活动
//   equipment  → system.type{value:"heavy"/"light"/"medium"/"shield"/"clothing"/"trinket"} + armor{value,dex}
//   consumable → system.type{value:"potion"/"food"/"scroll"/"ammo"/"poison"/"wand"/"rod",subtype:""} + uses{max,autoDestroy}
//                ⚠️ 酒水实测也是 value:"food"（不是 "drink"）——值来自样本「普通红酒（罐装）Common Wine (Pitcher)」
//   loot       → system.type{value:"",subtype:""}，**没有 uses 字段**（宝石/宝物/杂物）
//   tool       → system.type{value:"",baseItem:"thief"} + check 活动
//   container  → **没有 system.type**，改用 system.capacity{weight:{value,units}}
//   feat       → system.type{value:"feat",subtype:""}（特性，可挂自动化）
import { randomBytes } from 'node:crypto';
const ID16 = () => randomBytes(8).toString('hex');
const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const SAVE_KEY = 'dnd5eactivity100';
/**
 * folder 参数归一：它必须是**纯 16 位字母数字 ID**。
 * 传 "Folder.xxx" 会被 dnd5e 拒（DataModelValidationError "folder: must be a valid 16-character alphanumeric ID"），
 * 用户/AI 常带着前缀，这里统一剥掉。
 * ⚠️ 另一个实测坑：POST /create 的 folder 是**顶层字段**（与 entityType/data 平级），
 * 塞进 data 里会被静默忽略（30/30 次落根目录、不报错）。
 */
const stripFolder = (v) => {
    if (typeof v !== 'string')
        return undefined;
    const s = v.trim();
    if (!s)
        return undefined;
    const m = /^Folder\.([A-Za-z0-9]{16})$/.exec(s);
    return m ? m[1] : s;
};
/**
 * save.ability 归一成数组。
 * ⚠️ 实测坑：schema 里 save.ability 是**字符串**（enum: str/dex/...），
 * 但代码原先只判 `Array.isArray()` → 传 "wis" 永远落成默认的 ["dex"]（法术豁免属性静默错掉）。
 */
const toAbilityArray = (v, fallback) => {
    if (Array.isArray(v)) {
        const arr = v.filter((x) => typeof x === 'string' && !!x.trim()).map((x) => x.trim());
        return arr.length ? arr : fallback;
    }
    if (typeof v === 'string' && v.trim())
        return [v.trim()];
    return fallback;
};
const ITEM_TYPES = [
    'weapon', 'equipment', 'consumable', 'loot', 'tool', 'container', 'feat',
    'spell', 'class', 'subclass', 'race', 'background', 'facility',
    // backpack：dnd5e 遗留类型，只有 system.json 的 documentTypes 里登记、lang/en.json 没有它。
    // 实测可创建（结构与 container 相同），但 dnd5e 会把它迁移成 container（源码 dnd5e.mjs:21107 "Migrate backpack -> container."），
    // 且侧边栏列表里根本不显示（dnd5e.mjs:22542 `return this.TYPES.filter(t => t !== "backpack")`）。
    // 保留是为了兼容老模组数据；新建物品请优先用 container。
    'backpack',
];
/** 各类型 system.type.value 的合法取值（来自 dnd5e 官方样本实测；不在此列的会被 dnd5e 清洗掉）。 */
const SUBTYPES = {
    equipment: ['light', 'medium', 'heavy', 'shield', 'clothing', 'trinket', 'vehicle'],
    consumable: ['potion', 'food', 'scroll', 'ammo', 'poison', 'wand', 'rod'],
    loot: ['', 'gem', 'art', 'gear', 'treasure', 'junk', 'material', 'resource'],
    feat: ['feat'],
    race: ['humanoid', 'beast', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'monstrosity', 'ooze', 'plant', 'undead'],
    facility: ['basic', 'special'],
};
/** 法术 8 学派（实测火球术 school:"evo"）。 */
const SCHOOLS = ['abj', 'con', 'div', 'enc', 'evo', 'ill', 'nec', 'trs'];
/** 把 damage 参数折成 activities.<id>.damage.parts[] 的一个元素（法术伤害实测结构）。 */
function dmgParts(d) {
    const types = Array.isArray(d.types) ? d.types : ['fire'];
    if (typeof d.formula === 'string' && d.formula.trim()) {
        return [{
                number: 1, denomination: 6, bonus: '', types,
                custom: { enabled: true, formula: d.formula.trim() },
                scaling: { mode: '', number: null, formula: '' },
            }];
    }
    if (typeof d.number === 'number' || typeof d.denomination === 'number') {
        return [{
                number: typeof d.number === 'number' ? d.number : 1,
                denomination: typeof d.denomination === 'number' ? d.denomination : 6,
                bonus: typeof d.bonus === 'string' ? d.bonus : '',
                types,
                custom: { enabled: false, formula: '' },
                scaling: { mode: '', number: null, formula: '' },
            }];
    }
    return [];
}
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
/**
 * 效果图标选择：按状态/伤害类型语义匹配真源 webp。
 * 为什么不用 icons/svg/*：那 118 条是抽象的方块图（aura.svg 等），当效果图标观感很差；
 * 真源 6560 条里 6248 个是 .webp 实物图标，好看得多。以下路径逐条经真源核对存在（未验证的一律不写）。
 */
const EFFECT_ICON_BY_DAMAGE = {
    poison: 'icons/creatures/abilities/stinger-poison-green.webp',
    fire: 'icons/magic/fire/flame-burning-hand-orange.webp',
    cold: 'icons/magic/water/snowflake-ice-blue.webp',
    acid: 'icons/magic/acid/dissolve-drip-droplet-smoke.webp',
    lightning: 'icons/magic/lightning/bolt-strike-blue.webp',
    thunder: 'icons/magic/sonic/explosion-impact-shock-wave.webp',
    radiant: 'icons/magic/holy/barrier-shield-winged-cross.webp',
    necrotic: 'icons/magic/unholy/strike-body-explode-disintegrate.webp',
    psychic: 'icons/magic/control/silhouette-aura-energy.webp',
    force: 'icons/magic/light/beam-explosion-pink-purple.webp',
    healing: 'icons/magic/life/cross-area-circle-green-white.webp',
    slashing: 'icons/skills/wounds/blood-drip-droplet-red.webp',
    piercing: 'icons/skills/wounds/blood-drip-droplet-red.webp',
    bludgeoning: 'icons/skills/wounds/injury-triple-slash-bleed.webp',
};
const EFFECT_ICON_BY_STATUS = {
    poisoned: 'icons/creatures/abilities/stinger-poison-green.webp',
    bleeding: 'icons/skills/wounds/blood-drip-droplet-red.webp',
    burning: 'icons/magic/fire/flame-burning-hand-orange.webp',
    invisible: 'icons/magic/perception/eye-ringed-glow-angry-red.webp',
    charmed: 'icons/magic/control/mouth-smile-deception-purple.webp',
};
const DEFAULT_EFFECT_ICON = 'icons/magic/control/silhouette-aura-energy.webp';
/** 优先顺序：显式 effectImg > statuses 语义 > OverTime 里的 damageType > damage.types > 通用兜底。 */
function pickEffectIcon(a) {
    if (typeof a.effectImg === 'string' && a.effectImg.trim())
        return a.effectImg.trim();
    if (Array.isArray(a.statuses)) {
        for (const s of a.statuses)
            if (EFFECT_ICON_BY_STATUS[s])
                return EFFECT_ICON_BY_STATUS[s];
    }
    const ot = typeof a.overTime === 'string' ? a.overTime : '';
    const m = /damageType=([a-zA-Z]+)/.exec(ot);
    if (m && EFFECT_ICON_BY_DAMAGE[m[1].toLowerCase()])
        return EFFECT_ICON_BY_DAMAGE[m[1].toLowerCase()];
    const dt = a.damage?.types;
    if (Array.isArray(dt)) {
        for (const t of dt)
            if (EFFECT_ICON_BY_DAMAGE[t])
                return EFFECT_ICON_BY_DAMAGE[t];
    }
    return DEFAULT_EFFECT_ICON;
}
/**
 * 物品图标：只做两件事——(1) 尊重显式 img；(2) 没有 img 时给一个真源 webp 兜底。
 * 为什么不内置「物品名 → 图标路径」映射表：图标清单（lib/knowledge-docs/fvtt-icon-paths.txt，6560 条）
 * 已经是完整且按目录聚好的，AI 用 foundry_search_icon / foundry_knowledge{topic:"icons"} 现查即可，
 * 内置映射表既不可能覆盖全（真源里连 longsword/warhammer/handaxe 这些整词都没有），
 * 又会随真源更新而腐坏。所以：让 AI 查，插件只兜底。
 * 为什么必须有兜底：dnd5e 建物品时不给 img，系统会填 systems/dnd5e/icons/svg/items/weapon.svg
 * —— 抽象方块图，难看（用户明确要求不要 svg）。
 */
const DEFAULT_ITEM_ICON = 'icons/weapons/swords/sword-guard.webp';
/** 优先：显式 img > 真源 webp 兜底。 */
function pickItemIcon(a) {
    if (typeof a.img === 'string' && a.img.trim())
        return a.img.trim();
    return DEFAULT_ITEM_ICON;
}
/** 从物品文档按路径读值，如 'system.type.value'。 */
function readPath(doc, path) {
    let cur = doc;
    for (const seg of path.split('.')) {
        if (cur === null || cur === undefined || typeof cur !== 'object')
            return undefined;
        cur = cur[seg];
    }
    return cur;
}
/** 非武器类型：只 merge 该类型真实存在的字段（多写的键会被 dnd5e 清洗掉）。 */
function buildNonWeapon(a, itemType) {
    const name = String(a.name ?? '');
    const notes = [];
    const sys = { description: { value: typeof a.description === 'string' ? a.description : '' } };
    const expectFields = [];
    const typeGiven = typeof a.subtype === 'string' && a.subtype.length > 0 ? String(a.subtype) : '';
    const baseItem = typeof a.baseItem === 'string' ? String(a.baseItem) : '';
    // ── system.type：每类的形状不同（实测）──
    if (itemType === 'equipment') {
        const v = typeGiven || 'clothing';
        sys.type = { value: v, baseItem };
        expectFields.push({ path: 'system.type.value', want: v });
        notes.push(`equipment 子类型 ${v}${baseItem ? '（baseItem: ' + baseItem + '）' : ''}`);
    }
    else if (itemType === 'consumable') {
        const v = typeGiven || 'potion';
        sys.type = { value: v, subtype: '' };
        expectFields.push({ path: 'system.type.value', want: v });
        notes.push(`consumable 子类型 ${v}${v === 'food' && /wine|ale|酒|饮|beer|drink/i.test(name) ? '（⚠️ 酒水实测也是 food，不是 drink）' : ''}`);
    }
    else if (itemType === 'loot') {
        sys.type = { value: typeGiven, subtype: '' };
        if (typeGiven)
            expectFields.push({ path: 'system.type.value', want: typeGiven });
        notes.push(`loot${typeGiven ? ' 子类型 ' + typeGiven : '（无子类型）'}——该类型没有 uses 字段`);
    }
    else if (itemType === 'tool') {
        sys.type = { value: '', baseItem };
        if (baseItem)
            expectFields.push({ path: 'system.type.baseItem', want: baseItem });
        notes.push(`tool${baseItem ? '（baseItem: ' + baseItem + '）' : ''}`);
    }
    else if (itemType === 'feat') {
        sys.type = { value: 'feat', subtype: '' };
        notes.push('feat 特性');
    }
    else if (itemType === 'race') {
        const v = typeGiven || 'humanoid';
        const sub = typeof a.raceSubtype === 'string' ? String(a.raceSubtype) : '';
        sys.type = { value: v, subtype: sub, custom: '' };
        expectFields.push({ path: 'system.type.value', want: v });
        notes.push(`race 生物类型 ${v}${sub ? '（亚种 ' + sub + '）' : ''}`);
    }
    else if (itemType === 'facility') {
        // 实测 + 源码双证：facility 的 type.value ∈ basic|special，且 baseItem 是**布尔 false**（其他类型是字符串）
        // 依据 dnd5e.mjs:71605 `type: new ItemTypeField({ value: "basic", baseItem: false })`、
        //      dnd5e.mjs:56556 `const otherType = facilityType === "basic" ? "special" : "basic"`
        const v = typeGiven === 'special' ? 'special' : 'basic';
        sys.type = { value: v, baseItem: false };
        expectFields.push({ path: 'system.type.value', want: v });
        notes.push(`facility 类型 ${v}（basic=基础设施 / special=特殊设施）`);
        if (typeof a.facilityLevel === 'number') {
            sys.level = a.facilityLevel;
            expectFields.push({ path: 'system.level', want: a.facilityLevel });
            notes.push(`设施等级 ${a.facilityLevel}`);
        }
        if (typeof a.description === 'string' && a.description)
            notes.push('其余字段（building/craft/progress/enlargeable 等）交给 dnd5e 默认');
    }
    // container / spell / class / subclass / background 都没有 system.type（实测）
    // ── 护甲值（仅 equipment）──
    if (itemType === 'equipment') {
        const ar = a.armor;
        const hasArmorValue = ar && ar.value !== undefined && ar.value !== null;
        if (hasArmorValue || (typeGiven && ['light', 'medium', 'heavy', 'shield'].includes(typeGiven))) {
            const av = hasArmorValue ? Number(ar.value) : null;
            // dex: null = 敏捷加值不受限；0 = 重甲完全不加（实测：轻甲 dex:null，重甲 dex:0）
            const dexCap = ar && ar.dex !== undefined ? (ar.dex === null ? null : Number(ar.dex)) : null;
            sys.armor = { value: av, dex: dexCap };
            if (av !== null)
                expectFields.push({ path: 'system.armor.value', want: av });
            notes.push(`护甲值 ${av ?? '—'}${dexCap === null ? '（敏捷加值不限）' : '（敏捷上限 ' + dexCap + '）'}`);
        }
    }
    // ── 力量要求 / 隐匿劣势 ──
    if (itemType === 'equipment' && typeof a.strength === 'number') {
        sys.strength = a.strength;
        expectFields.push({ path: 'system.strength', want: a.strength });
        notes.push(`力量要求 ${a.strength}`);
    }
    // ── properties（magical / stealthDisadvantage 等）──
    if (Array.isArray(a.properties) && a.properties.length) {
        sys.properties = a.properties;
        notes.push('properties: ' + a.properties.join(', '));
    }
    else if (a.magical === true) {
        sys.properties = ['mgc'];
        notes.push('properties: mgc（魔法物品）');
    }
    // ── 稀有度（通用字段，实测 system.rarity 直接是字符串："" | common | uncommon | rare | veryRare | legendary | artifact）──
    if (typeof a.rarity === 'string' && a.rarity.trim()) {
        sys.rarity = a.rarity.trim();
        expectFields.push({ path: 'system.rarity', want: a.rarity.trim() });
        notes.push('稀有度 ' + a.rarity.trim());
    }
    // ── 射程 / 持续时间（spell 等类型卡面要显示，不传时 dnd5e 会留 "self" / "inst"）──
    // 实测坑：只传 rangeUnits 时 activity 层的 range 会变，但 **system.range 永远停在 self**，
    // 结果是「描述写 60 尺、卡面显示自身」。这里两层一起写，并支持 rangeValue 填数值。
    if (typeof a.rangeUnits === 'string' || typeof a.rangeValue === 'string' || typeof a.rangeValue === 'number') {
        const rUnits = typeof a.rangeUnits === 'string' && a.rangeUnits.trim() ? a.rangeUnits.trim() : 'self';
        const rValue = a.rangeValue === undefined || a.rangeValue === null ? '' : String(a.rangeValue);
        sys.range = { value: rValue, units: rUnits, special: '', override: false };
        expectFields.push({ path: 'system.range.units', want: rUnits });
        notes.push(`射程 ${rValue || '—'} ${rUnits}`);
    }
    if (itemType === 'spell' && (typeof a.durationValue === 'string' || typeof a.durationValue === 'number' || typeof a.durationUnits === 'string')) {
        const dValue = a.durationValue === undefined || a.durationValue === null ? '' : String(a.durationValue);
        const dUnits = typeof a.durationUnits === 'string' && a.durationUnits.trim() ? a.durationUnits.trim() : 'inst';
        sys.duration = { value: dValue, units: dUnits, concentration: a.concentration === true, special: '', override: false };
        notes.push(`持续 ${dValue || '—'} ${dUnits}${a.concentration === true ? '（专注，已写 properties.concentration）' : ''}`);
    }
    // ── uses（仅 consumable；loot 没有 uses）──
    if (itemType === 'consumable') {
        const u = (a.uses ?? {});
        const max = u.max === undefined ? '1' : String(u.max);
        // ⚠️ 原来不传就默认 true，导致「垂柳杖 max:7」用完自毁（子代理实测 P1）。
        // 按子类型推断更合理：药水/弹药/毒药/卷轴 属于消耗品，用掉就消失；
        // 魔杖/法杖（wand/rod）是可充能道具，默认保留。
        const defaultAutoDestroy = !['wand', 'rod'].includes(typeGiven);
        const autoDestroy = u.autoDestroy === undefined ? defaultAutoDestroy : u.autoDestroy === true;
        sys.uses = { max, autoDestroy, spent: 0, recovery: [] };
        notes.push(`可使用 ${max === '' ? '∞' : max} 次${autoDestroy ? '（用尽销毁）' : ''}`);
    }
    // ── 容量（仅 container）──
    if (itemType === 'container' || itemType === 'backpack') {
        const cap = (a.capacity ?? {});
        const w = cap.weight === undefined ? 30 : Number(cap.weight);
        sys.capacity = { weight: { value: w, units: 'lb' }, volume: { units: 'cubicFoot' } };
        expectFields.push({ path: 'system.capacity.weight.value', want: w });
        notes.push(`容量 ${w} lb`);
    }
    // ── spell 独有字段（实测 Fireball / Fire Bolt / Cure Wounds / Light）──
    if (itemType === 'spell') {
        const lv = typeof a.spellLevel === 'number' ? a.spellLevel : 0;
        const school = typeof a.school === 'string' && SCHOOLS.includes(a.school) ? String(a.school) : 'evo';
        const spProps = Array.isArray(a.spellComponents) ? a.spellComponents.slice() : [];
        // ⚠️ 专注的真正落点是 properties 里的 "concentration"（实测祝福术 = ["vocal","somatic","material","concentration","mgc"]）。
        //    system.duration 只有 {value,units} 没有 concentration 字段；activity.duration.concentration 恒为 false（陷阱，别往那写）。
        if (a.concentration === true && !spProps.includes('concentration'))
            spProps.push('concentration');
        sys.level = lv;
        sys.school = school;
        sys.method = typeof a.spellMethod === 'string' ? String(a.spellMethod) : 'spell';
        sys.prepared = typeof a.prepared === 'number' ? a.prepared : 1;
        sys.properties = spProps;
        sys.materials = { value: '', consumed: false, cost: 0, supply: 1 };
        expectFields.push({ path: 'system.level', want: lv });
        expectFields.push({ path: 'system.school', want: school });
        notes.push(`法术 ${lv} 环，学派 ${school}${spProps.length ? '，成分 ' + spProps.join('/') : ''}`);
    }
    // ── race 的移速 / 感官（实测 race system 键含 movement、senses）──
    if (itemType === 'race') {
        const mv = a.movement;
        if (mv && typeof mv === 'object') {
            sys.movement = mv;
            notes.push('移速 ' + JSON.stringify(mv));
        }
        const sn = a.senses;
        if (sn && typeof sn === 'object') {
            sys.senses = sn;
            notes.push('感官 ' + JSON.stringify(sn));
        }
    }
    // ── identifier（spell / class / subclass / race / background / feat 等都有）──
    if (typeof a.identifier === 'string' && a.identifier.trim()
        && ['spell', 'class', 'subclass', 'race', 'background', 'feat'].includes(itemType)) {
        sys.identifier = a.identifier.trim();
        expectFields.push({ path: 'system.identifier', want: a.identifier.trim() });
        notes.push('identifier: ' + a.identifier.trim());
    }
    // ── subclass 的 classIdentifier（实测键名就叫这个，指向所属职业的 identifier）──
    if (itemType === 'subclass' && typeof a.classIdentifier === 'string' && a.classIdentifier.trim()) {
        sys.classIdentifier = a.classIdentifier.trim();
        expectFields.push({ path: 'system.classIdentifier', want: a.classIdentifier.trim() });
        notes.push('所属职业 identifier: ' + a.classIdentifier.trim());
    }
    // ── consumable 之外的类型也可能要 uses（feat 等），统一支持 ──
    if (itemType !== 'consumable' && itemType !== 'loot' && itemType !== 'container'
        && a.uses && typeof a.uses === 'object' && a.uses.max !== undefined) {
        const u2 = a.uses;
        const rec = typeof u2.recovery === 'string' ? [u2.recovery] : [];
        sys.uses = { max: String(u2.max), spent: 0, recovery: rec };
        notes.push(`可使用 ${String(u2.max) === '' ? '∞' : u2.max} 次${rec.length ? '（' + rec[0] + ' 恢复）' : ''}`);
    }
    // ── 药水/卷轴的 heal 或 utility 活动（可选）──
    const acts = {};
    const heal = a.healing;
    if (itemType === 'consumable' && heal && (heal.number || heal.denomination || heal.formula)) {
        acts.dnd5eactivity000 = {
            type: 'heal',
            name,
            activation: { type: typeof a.activationType === 'string' ? a.activationType : 'action', value: 1, condition: '', override: false },
            consumption: { targets: [{ type: 'itemUses', value: '1', target: '', scaling: {} }], scaling: { allowed: false, max: '' }, spellSlot: true },
            duration: { concentration: false, value: '', units: 'inst', special: '', override: false },
            healing: {
                number: typeof heal.number === 'number' ? heal.number : 1,
                denomination: typeof heal.denomination === 'number' ? heal.denomination : 4,
                bonus: typeof heal.bonus === 'string' ? heal.bonus : '',
                types: ['healing'],
                custom: heal.formula ? { enabled: true, formula: String(heal.formula) } : { enabled: false, formula: '' },
            },
            effects: [],
            target: { template: { count: '', contiguous: false, type: '', size: '', width: '', height: '', units: 'ft', stationary: false }, affects: { count: '1', type: 'creature', choice: false, special: '' }, prompt: false, override: false },
            sort: 0,
        };
        notes.push(`heal 活动：恢复 ${heal.formula ?? (heal.number ?? 1) + 'd' + (heal.denomination ?? 4)}`);
    }
    else if ((itemType === 'consumable' || itemType === 'tool' || itemType === 'feat') && typeof a.useFlavor === 'string' && a.useFlavor.trim()) {
        // utility 活动：点「使用」时把 chatFlavor 发到聊天卡（道具弹文案的实现点，实测结构参照官方 Rations）
        acts.dnd5eactivity000 = {
            type: 'utility',
            name,
            activation: { type: typeof a.activationType === 'string' ? a.activationType : 'action', value: null, condition: '', override: false },
            consumption: { targets: itemType === 'consumable' ? [{ type: 'itemUses', value: '1', target: '', scaling: {} }] : [], scaling: { allowed: false, max: '' }, spellSlot: true },
            description: { chatFlavor: a.useFlavor.trim() },
            duration: { concentration: false, value: '', units: 'inst', special: '', override: false },
            effects: [],
            range: { value: '', units: 'self', special: '', override: false },
            target: { template: { count: '', contiguous: false, type: '', size: '', width: '', height: '', units: 'ft', stationary: false }, affects: { count: '', type: '', choice: false, special: '' }, prompt: false, override: false },
            uses: { spent: 0, max: '', recovery: [] },
            roll: { prompt: false, visible: false, name: '', formula: '' },
            sort: 0,
            otherActivityId: 'none',
        };
        notes.push('utility 活动（点使用时把文案发到聊天卡）');
    }
    // ── spell 的活动：attack / save / heal / utility ──
    // 实测对应：Fire Bolt=attack（attack.type.classification 为空串）、Fireball=save（DC calculation:"spellcasting"）、
    //            Cure Wounds=heal（bonus "@mod"）、Light=utility。给了 spellActivity 就用它，否则按参数自动推断。
    if (itemType === 'spell') {
        const sd = (a.damage ?? {});
        const hasDmg = sd.number !== undefined || sd.denomination !== undefined || (typeof sd.formula === 'string' && sd.formula.trim() !== '');
        const sv2 = a.save;
        const hasSv2 = !!sv2 && sv2.dc !== undefined && sv2.dc !== null;
        const hasHeal2 = !!heal && !!(heal.number || heal.denomination || heal.formula);
        const hasSummon = !!(a.summon && typeof a.summon === 'object');
        const actKind = typeof a.spellActivity === 'string' && ['attack', 'save', 'heal', 'utility', 'summon'].includes(a.spellActivity)
            ? String(a.spellActivity)
            : hasSummon ? 'summon' : hasHeal2 ? 'heal' : hasDmg ? (hasSv2 ? 'save' : 'attack') : 'utility';
        const common = {
            name,
            activation: { type: typeof a.activationType === 'string' ? a.activationType : 'action', value: null, override: false },
            consumption: { targets: [], scaling: { allowed: false, max: '' }, spellSlot: true },
            duration: { concentration: false, value: '', units: 'inst', special: '', override: false },
            effects: [],
            range: { override: false, units: typeof a.rangeUnits === 'string' ? String(a.rangeUnits) : 'self' },
            target: { template: { count: '', contiguous: false, type: '', size: '', width: '', height: '', units: 'ft', stationary: false }, affects: { count: '', type: '', choice: false, special: '' }, prompt: false, override: false },
            uses: { spent: 0, max: '', recovery: [] },
            sort: 0,
            img: null,
            otherActivityId: 'none',
        };
        if (actKind === 'attack') {
            acts.dnd5eactivity000 = {
                ...common,
                type: 'attack',
                attack: { ability: '', bonus: '', critical: { threshold: null }, flat: false, type: { value: a.ranged === false ? 'melee' : 'ranged', classification: '' } },
                damage: { critical: { bonus: '' }, includeBase: true, parts: dmgParts(sd) },
            };
            notes.push('attack 活动（法术攻击，damage 走 includeBase + parts）');
            expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'attack' });
        }
        else if (actKind === 'save') {
            const rawSd = sv2?.dc === undefined ? '' : String(sv2.dc).trim();
            const dcObj = rawSd === '' || rawSd === 'spellcasting'
                ? { calculation: 'spellcasting', formula: '' }
                : /^\d+$/.test(rawSd) ? { calculation: '', formula: rawSd } : { calculation: '', formula: rawSd };
            acts.dnd5eactivity000 = {
                ...common,
                type: 'save',
                save: { ability: toAbilityArray(sv2?.ability, ['dex']), dc: dcObj },
                damage: { onSave: 'half', parts: dmgParts(sd), critical: { allow: false } },
            };
            notes.push('save 活动（法术豁免），DC ' + JSON.stringify(dcObj));
            expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'save' });
        }
        else if (actKind === 'heal') {
            acts.dnd5eactivity000 = {
                ...common,
                type: 'heal',
                healing: {
                    number: typeof heal?.number === 'number' ? heal.number : 1,
                    denomination: typeof heal?.denomination === 'number' ? heal.denomination : 8,
                    // ⚠️ 原来不传就默认注入 "@mod"，把「1d8」悄悄变成「1d8 + 施法调整值」（子代理实测 P1）。
                    // 现在不传就是空——想要加施法属性调整值请显式传 bonus:"@mod"。
                    bonus: typeof heal?.bonus === 'string' ? heal.bonus : '',
                    types: ['healing'],
                    custom: typeof heal?.formula === 'string' && heal.formula ? { enabled: true, formula: String(heal.formula) } : { enabled: false, formula: '' },
                },
            };
            notes.push('heal 活动（法术治疗）');
            expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'heal' });
        }
        else if (actKind === 'summon') {
            // 实测结构来自官方 Conjure Animals（Compendium.dnd5e.spells24「Conjure Animals」的 dnd5eactivity000）。
            // ⚠️ profiles[]._id 必须是 16 位字母数字（AI 自己写常写成 17 位被拒 400），这里用 ID16() 生成。
            const sm = (a.summon ?? {});
            const smTypes = Array.isArray(sm.types) && sm.types.length ? sm.types : ['beast'];
            const smCr = sm.cr === undefined ? '1' : String(sm.cr);
            const smCount = sm.count === undefined ? '1' : String(sm.count);
            acts.dnd5eactivity000 = {
                ...common,
                type: 'summon',
                bonuses: { ac: '', hd: '', hp: '', attackDamage: '', saveDamage: '', healing: '' },
                creatureSizes: [],
                creatureTypes: smTypes,
                match: { attacks: false, disposition: true, proficiency: false, saves: false, ability: '' },
                profiles: [{ count: smCount, cr: smCr, name: '', _id: ID16(), uuid: null, types: smTypes, level: { min: null, max: null } }],
                summon: { mode: 'cr', prompt: true },
                friendlySummon: false,
            };
            notes.push(`summon 活动（召唤 CR ${smCr} × ${smCount}，类型 ${smTypes.join('/')}）`);
            expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'summon' });
        }
        else {
            acts.dnd5eactivity000 = {
                ...common,
                type: 'utility',
                description: { chatFlavor: typeof a.useFlavor === 'string' ? a.useFlavor : '' },
                roll: { prompt: false, visible: false, name: '', formula: '' },
            };
            notes.push('utility 活动（法术通用）');
            expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'utility' });
        }
    }
    if (Object.keys(acts).length) {
        sys.activities = acts;
        expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: acts.dnd5eactivity000 && acts.dnd5eactivity000.type });
    }
    const data = { system: sys };
    // ── 物品级效果（feat / 奇物可挂被动自动化；结构与武器那条共用）──
    const hasEffect = Array.isArray(a.statuses) || (typeof a.overTime === 'string' && a.overTime.trim()) || (typeof a.changes === 'object' && a.changes !== null);
    let effectId = null;
    const durSec = typeof a.durationSeconds === 'number' && Number.isFinite(a.durationSeconds) ? a.durationSeconds : null;
    if (hasEffect) {
        effectId = ID16();
        const changes = [];
        // transfer 的判据只看「用户显式传的被动加值」，**不含 OverTime**：
        //   被动加值（AC+1 之类）→ transfer:true（装备即生效，对照 SRD Luckstone）
        //   OverTime / statuses  → transfer:false（那是「命中后施加给目标」的效果，装备者不该自己一直中招）
        let explicitChanges = 0;
        if (Array.isArray(a.changes)) {
            for (const c of a.changes) {
                if (c && typeof c === 'object' && typeof c.key === 'string') {
                    changes.push(c);
                    explicitChanges++;
                }
            }
        }
        if (typeof a.overTime === 'string' && a.overTime.trim()) {
            changes.push({ key: 'flags.midi-qol.OverTime', mode: 0, priority: 20, value: a.overTime.trim() });
        }
        data.effects = [{
                _id: effectId,
                name: typeof a.effectName === 'string' && a.effectName.trim() ? a.effectName : name,
                img: pickEffectIcon(a),
                origin: null, type: 'base', system: {},
                changes, disabled: false,
                duration: { seconds: durSec },
                description: '<p></p>', tint: '#ffffff', transfer: explicitChanges > 0,
                statuses: Array.isArray(a.statuses) ? a.statuses : [],
                sort: 0,
                flags: { core: { overlay: false } },
            }];
        notes.push(`物品级效果（${changes.length} 条 change${Array.isArray(a.statuses) ? '，statuses: ' + a.statuses.join(', ') : ''}，时长 ${durSec === null ? '永久' : durSec + '秒'}）`);
    }
    return { data, notes, expectInfo: { effectId, hasSave: false, hasEffect: !!hasEffect, durSec, expectFields } };
}
/** 组装 update 的语义关键字段（merge 进 dnd5e 默认结构）。 */
function buildUpdateData(a, attackKey, itemType) {
    if (itemType !== 'weapon')
        return buildNonWeapon(a, itemType);
    const name = String(a.name ?? '');
    const notes = [];
    const dmg = (a.damage ?? {});
    const ability = ABILITIES.includes(a.ability) ? String(a.ability) : 'str';
    const ranged = a.ranged === true;
    const hasSave = typeof a.save === 'object' && a.save !== null && a.save.dc !== undefined;
    const sys = { description: { value: typeof a.description === 'string' ? a.description : '' } };
    // ⚠️ 动态引用（@ 公式）的合法落点（样本库实测）：
    //   固定骰   → number/denomination/bonus
    //   动态骰   → custom.enabled:true + custom.formula（如 "2d6 + @mod +1"、"1@scale.monk.die + @mod"）
    //   changes 里 → value 写 @abilities.str.mod / OverTime 串里塞 saveDC=@attributes.spelldc
    // 写错位置会被静默忽略（不报错，只是不生效）。
    const dmgFormula = typeof dmg.formula === 'string' && dmg.formula.trim() ? dmg.formula.trim() : '';
    sys.damage = {
        base: {
            number: Number(dmg.number ?? 1),
            denomination: Number(dmg.denomination ?? 4),
            bonus: typeof dmg.bonus === 'string' ? dmg.bonus : '',
            types: Array.isArray(dmg.types) ? dmg.types : [],
            custom: dmgFormula ? { enabled: true, formula: dmgFormula } : { enabled: false, formula: '' },
        },
    };
    if (typeof a.magicalBonus === 'string' || typeof a.magicalBonus === 'number') {
        sys.magicalBonus = String(a.magicalBonus);
        notes.push(`魔法加值 +${String(a.magicalBonus)}`);
    }
    const props = Array.isArray(a.properties) ? a.properties.slice() : [];
    if (a.magical === true && !props.includes('mgc'))
        props.push('mgc');
    if (props.length) {
        sys.properties = props;
        notes.push('properties: ' + props.join(', '));
    }
    // ── 武器类别（⚠️ 实测坑：不设 system.type 时 dnd5e 会填默认 {value:"simpleM",baseItem:""}）──
    // 后果实锤：传 baseItem:"longbow" 建出来的长弓是「简单**近战**武器」，射程/属性/熟练全错，
    // 而且不报任何错。所以给 baseItem 就必须同时写对 value。
    // value 取值实测（SRD 原版）：martialM(军用近战)/martialR(军用远程)/simpleM(简单近战)/simpleR(简单远程)
    const baseItemName = typeof a.baseItem === 'string' ? a.baseItem.trim() : '';
    const weaponTypeGiven = typeof a.weaponType === 'string' ? a.weaponType.trim() : '';
    if (baseItemName || weaponTypeGiven) {
        const wt = weaponTypeGiven || (ranged ? 'martialR' : 'martialM');
        sys.type = { value: wt, baseItem: baseItemName };
        notes.push(`武器类别 ${wt}${baseItemName ? '（baseItem: ' + baseItemName + '）' : ''}`);
    }
    // ── 稀有度（⚠️ weapon 分支也必须处理！）──
    // 实锤（子代理重跑 30 件，3/3 复现）：rarity 原来只加在 buildNonWeapon 里，
    // 武器传 rarity 会被**静默丢弃**——不落库、不报错、verify 还回 verified:true。
    if (typeof a.rarity === 'string' && a.rarity.trim()) {
        sys.rarity = a.rarity.trim();
        notes.push('稀有度 ' + a.rarity.trim());
    }
    // ── 射程（⚠️ 原来硬编码 ranged?'20':'5'，item 级 system.range 完全没写）──
    // 实锤（同上，2/2 复现）：长弓建出来 item 级 range 为空、活动级恒 20ft，都不报错。
    // 现在：传了 rangeValue/rangeLong/rangeUnits 就照传，item 级与活动级一起写。
    const rVal = a.rangeValue === undefined || a.rangeValue === null ? '' : String(a.rangeValue);
    const rLong = a.rangeLong === undefined || a.rangeLong === null ? '' : String(a.rangeLong);
    const rUnits = typeof a.rangeUnits === 'string' && a.rangeUnits.trim() ? a.rangeUnits.trim() : 'ft';
    if (rVal || rLong) {
        sys.range = { value: rVal, long: rLong, units: rUnits, special: '', override: false };
        notes.push(`射程 ${rVal}${rLong ? '/' + rLong : ''} ${rUnits}`);
    }
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
        range: { value: rVal || (ranged ? '20' : '5'), units: rUnits },
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
    // ⚠️ dnd5e 靠 save 活动 effects[0]._id 去物品 effects 数组里取实际效果。
    // 两处各自 ID16() 会得到不同 id → 豁免失败时取不到效果 → 自动化静默失效（不报错、看着全对）。
    // 因此物品级效果与 save 活动必须共用同一个 id。
    const hasEffect = Array.isArray(a.statuses) || (typeof a.overTime === 'string' && a.overTime.trim());
    const effectId = hasEffect ? ID16() : null;
    // 时长：不传 = 永久（null）。持续伤害类效果通常由 OverTime 的 saveCount 决定何时结束，
    // 硬编码秒数会让效果中途自己消失（"直到豁免成功"这类需求必须是永久）。
    const durSec = typeof a.durationSeconds === 'number' && Number.isFinite(a.durationSeconds) ? a.durationSeconds : null;
    if (hasSave) {
        const sv = a.save;
        const saveAbility = ABILITIES.includes(sv.ability) ? String(sv.ability) : 'con';
        // ⚠️ DC 的 calculation 取值（资料库 + 样本库实测，53 个 spellcasting / 45 个空串 / 2 个 flat）：
        //   ""            → 自定义：用 formula，可写数字（"13"）也可写公式（"8 + @prof + @abilities.dex.mod"）
        //   "spellcasting"→ 跟随使用者的施法 DC（formula 留空）
        //   "flat"        → ⚠️ 资料库两条独立记录称其不合法、formula 会被忽略、DC 丢回默认值；已弃用
        // 实测样本：system.activities.<act>.save.dc.formula = "8 + @prof + @abilities.dex.mod"
        const rawDc = String(sv.dc ?? '').trim();
        const dcObj = rawDc === 'spellcasting'
            ? { calculation: 'spellcasting', formula: '' }
            : { calculation: '', formula: rawDc || '13' };
        activities[SAVE_KEY] = {
            type: 'save', name,
            activation: { type: 'special' },
            save: { ability: [saveAbility], dc: dcObj },
            damage: { onSave: 'none', parts: [], critical: { allow: false } },
            effects: [{ _id: effectId ?? ID16(), onSave: false }],
        };
        notes.push(`命中后触发 ${dcObj.calculation === 'spellcasting' ? '施法' : dcObj.formula} DC ${saveAbility.toUpperCase()} 豁免（${attackKey || 'dnd5eactivity000'}.otherActivityId → ${SAVE_KEY}）`);
    }
    sys.activities = activities;
    const data = { system: sys };
    if (hasEffect) {
        const changes = [];
        // 武器路径没有 changes 参数 → explicitChanges 恒 0 → transfer:false（命中后施加给目标，正确）
        const explicitChanges = 0;
        if (typeof a.overTime === 'string' && a.overTime.trim()) {
            changes.push({ key: 'flags.midi-qol.OverTime', mode: 0, priority: 20, value: a.overTime.trim() });
        }
        data.effects = [{
                _id: effectId,
                name: typeof a.effectName === 'string' && a.effectName.trim() ? a.effectName : name,
                img: pickEffectIcon(a),
                origin: null, type: 'base', system: {},
                changes, disabled: false,
                duration: { seconds: durSec },
                description: '<p></p>', tint: '#ffffff', transfer: explicitChanges > 0,
                statuses: Array.isArray(a.statuses) ? a.statuses : [],
                sort: 0,
                flags: { core: { overlay: false } },
            }];
        notes.push(`物品级效果${Array.isArray(a.statuses) ? '（statuses: ' + a.statuses.join(', ') + '）' : ''}${typeof a.overTime === 'string' && a.overTime.trim() ? '（OverTime: ' + a.overTime + '）' : ''}（时长：${durSec === null ? '永久' : durSec + '秒'}，_id 与 save 活动共用 ${String(effectId)}）`);
    }
    return { data, notes, expectInfo: { effectId, hasSave: !!hasSave, hasEffect: !!hasEffect, durSec, expectFields: [] } };
}
export function registerMinimalTools(h, reg) {
    reg(h.makeTool('foundry_create_item_minimal', '省 token 快速建物品（**全类型**）：先 create 最小壳（dnd5e 自己生成默认结构），再 update 只 merge 语义关键字段——AI 只给关键参数，不用手搓完整 JSON，插件也不内置易过时的模板。\n' +
        '**itemType 支持 dnd5e 全部 13 类**（默认 weapon）：weapon 武器 ｜ equipment 护甲/衣物/奇物 ｜ consumable 药水/食物/酒水/卷轴/弹药/毒药 ｜ loot 材料/宝石/杂物 ｜ tool 工具 ｜ container 容器 ｜ feat 特性 ｜ spell 法术 ｜ class 职业 ｜ subclass 子职业 ｜ race 种族 ｜ background 背景 ｜ facility 据点设施。\n' +
        '各类型关键参数：\n' +
        '・weapon：damage{number,denomination,types,bonus,formula} + ability/toHit/ranged/extraDamage + save{ability,dc} + statuses + overTime\n' +
        '・equipment：subtype(light/medium/heavy/shield/clothing/trinket) + armor{value,dex}（dex:null=敏捷不限、0=重甲不加）+ strength + properties(如 ["stealthDisadvantage"])\n' +
        '・consumable：subtype(potion/food/scroll/ammo/poison/wand/rod) + uses{max,autoDestroy} + healing{number,denomination,formula}（药水治疗）或 useFlavor（点使用时弹的文案）\n' +
        '  ⚠️ consumable/tool/feat **只有传了 useFlavor 才会有 utility 活动** —— 不传的话卷轴/弹药/毒药/食物/魔杖建出来「点使用」什么都不会发生（无参数可补救，只能重建或自己补活动）。\n' +
        '  ⚠️ autoDestroy 不传时按子类型推断：药水/弹药/毒药/卷轴 → true（用掉消失）；**魔杖/法杖 wand/rod → false**（可充能道具，别让它自毁）。要覆盖就显式传。\n' +
        '・loot：subtype(gem/art/gear/treasure/junk 可留空) —— 该类型**没有 uses**，别传\n' +
        '・tool：baseItem(如 "thief") + useFlavor（可选，check 类工具）\n' +
        '・container：capacity{weight}（磅）\n' +
        '・backpack：结构与 container 完全相同，是 dnd5e 的遗留类型（只有 system.json 登记、lang 里没有）。**新建请用 container**——dnd5e 会把 backpack 迁移成 container，且它根本不显示在侧边栏列表里\n' +
        '・feat：可挂 changes/statuses/overTime 做被动自动化\n' +
        '・spell：spellLevel(0-9) + school(abj/con/div/enc/evo/ill/nec/trs) + spellComponents(["vocal","somatic","material","concentration"]) + spellActivity(attack/save/heal/utility/summon，不传按参数自动推断) + damage/save/healing/useFlavor/summon{cr,count,types}。DC 不传或传 "spellcasting" = 跟随施法者 DC。召唤法术给 summon{cr:"1",count:"2",types:["beast"]} 即可（活动结构照抄官方 Conjure Animals，profiles 的 _id 由插件生成，别自己写）\n' +
        '・class / subclass：identifier（英文数字破折号下划线）+ classIdentifier（子职业指向职业）。等级表/advancement 结构复杂，建议从官方包导入而非手搓\n' +
        '・race：raceSubtype（生物类型，默认 humanoid）+ movement + senses + identifier。⚠️ lang 里的 raceLegacy 只是旧显示的别名（en.json `TYPES.Item.raceLegacy`），**type 值仍然是 race**——实测传 itemType:"raceLegacy" 会被 dnd5e 拒 400\n' +
        '・background：identifier + description\n' +
        '・facility：subtype(basic 基础设施 / special 特殊设施，默认 basic) + facilityLevel（设施等级）。⚠️ 其余字段（building/craft/progress/enlargeable 等）由 dnd5e 默认填，本工具不碰\n' +
        '⚠️ 实测冷知识：**酒水也是 subtype:"food"**（不是 "drink"）；loot 没有 uses 字段；container 没有 system.type。\n' +
        '⚠️ 动态引用（@ 公式）落点错了会被静默忽略：伤害公式 → damage.formula；DC → save.dc 字符串；被动加值 → changes[].value；OverTime 参数 → overTime 串内；不确定先 foundry_reference{topic:"roll-data"} 查。\n' +
        '典型用法：毒牙 = itemType:"weapon" + damage{number:1,denomination:6,types:["piercing"]} + save{ability:"con",dc:13} + statuses:["poisoned"] + overTime:"turn=start,damageRoll=1d4,damageType=poison,saveDC=13,saveAbility=con,saveCount=1-,label=中毒"。\n' +
        '图标：img/effectImg 强烈建议先用 foundry_search_icon 检索候选自己挑（不传会落兜底图并标 iconSource:"default"）。\n' +
        '返回的 verified 是**真校验结果**（不是硬编码 true）：核对该类型的关键字段是否落库（武器的 save活动effects[0]._id = 物品效果 _id、otherActivityId 指向、伤害骰；护甲的 armor.value/type.value；消耗品的 uses/type.value；容器的 capacity 等）；任一项不过则 verified:false 并附 problems。看到 verified:false 请按 problems 修，不要当成成功交付。', {
        name: { type: 'string', description: '物品名' },
        itemType: { type: 'string', enum: [...ITEM_TYPES], description: '物品大类，默认 weapon。equipment=护甲/衣物/奇物 ｜ consumable=药水/食物/酒水/卷轴/弹药 ｜ loot=材料/宝石/杂物 ｜ tool=工具 ｜ container=容器 ｜ feat=特性 ｜ spell=法术 ｜ class/subclass=职业/子职业 ｜ race=种族 ｜ background=背景 ｜ facility=据点设施 ｜ backpack=遗留容器（新建请用 container）' },
        spellLevel: { type: 'number', description: '【spell】法术环阶 0-9（0 = 戏法）' },
        school: { type: 'string', enum: [...SCHOOLS], description: '【spell】学派：abj 防护/con 咒法/div 预言/enc 附魔/evo 塑能/ill 幻术/nec 死灵/trs 变化' },
        spellComponents: { type: 'array', items: { type: 'string' }, description: '【spell】成分，如 ["vocal","somatic","material","concentration"]（落 system.properties，**与物品的 properties 不是一回事**）' },
        spellActivity: { type: 'string', enum: ['attack', 'save', 'heal', 'utility', 'summon'], description: '【spell】法术活动类型。不传则自动推断：给了 summon 参数→summon；有 healing→heal；有 damage 且有 save→save；有 damage→attack；都没有→utility' },
        spellMethod: { type: 'string', description: '【spell】施展方式（默认 "spell"）' },
        prepared: { type: 'number', description: '【spell】准备状态：0=未准备、1=已准备（默认）、2=始终准备' },
        identifier: { type: 'string', description: '【spell/class/subclass/race/background/feat】系统标识符，只能英文数字破折号下划线，如 "fireball"' },
        classIdentifier: { type: 'string', description: '【subclass】所属职业的 identifier，如 "fighter"' },
        raceSubtype: { type: 'string', description: '【race】亚种标识，如 "elf"、"dwarf"' },
        movement: { type: 'object', description: '【race】移速，如 {walk:30,fly:60}——**实测 race 的移速在 system.movement 下，不走 5.3.x 的 attributes 路径**' },
        senses: { type: 'object', description: '【race】感官，如 {darkvision:60}' },
        facilityLevel: { type: 'number', description: '【facility】设施等级（据点系统，实测默认 5）' },
        summon: {
            type: 'object', description: '【spell】召唤活动参数（结构照抄官方 Conjure Animals）。给了它就自动生成 summon 活动：profiles 里的 CR/数量/生物类型',
            properties: {
                cr: { type: ['string', 'number'], description: '召唤物挑战等级，如 "1" 或 0.5' },
                count: { type: ['string', 'number'], description: '数量，可给公式如 "1 * floor((@item.level - 1) / 2)"' },
                types: { type: 'array', items: { type: 'string' }, description: '生物类型，如 ["beast"]、["fey"]' },
            },
        },
        subtype: { type: 'string', description: '细分类型（对应 system.type.value）：equipment→light/medium/heavy/shield/clothing/trinket；consumable→potion/food（⚠️酒水也是 food）/scroll/ammo/poison/wand/rod；loot→gem/art/gear/treasure/junk（可留空）' },
        baseItem: { type: 'string', description: '基础物品标识（tool 常用，如 "thief" 盗贼工具；**weapon 强烈建议给**，如 "halberd"/"longbow" 长弓 → 配合 weaponType 才能落对 martialR）' },
        weaponType: { type: 'string', description: '【weapon】武器类别，取值 martialM(军用近战)/martialR(军用远程)/simpleM(简单近战)/simpleR(简单远程)。⚠️ **不传会落 dnd5e 默认的 simpleM（简单近战）** —— 长弓/手弩这类远程武器会被建成近战武器，不报错但数据是错的。给了 baseItem 强烈建议同时给这个（远程用 martialR，近战用 martialM）。' },
        rarity: { type: 'string', description: '稀有度（通用）：common / uncommon / rare / veryRare / legendary / artifact。魔法物品建议填，否则卡面不显示稀有度。' },
        rangeValue: { type: ['string', 'number'], description: '【weapon/spell 等】射程数值（如 60、120、150）。⚠️ 武器不传时活动射程会落默认的 20ft（远程）/5ft（近战）且 item 级 system.range 为空——远程武器务必传它。' },
        rangeLong: { type: ['string', 'number'], description: '【weapon】长射程数值（如长弓 150/600 的 600）。只有武器需要。' },
        rangeUnits: { type: 'string', description: '【spell 等】射程单位："ft"(尺) / "mi"(里) / "touch"(触碰) / "self"(自身) / "spec"(特殊)。默认 "self"' },
        durationValue: { type: ['string', 'number'], description: '【spell 等】持续时间数值（如 1、10）' },
        durationUnits: { type: 'string', description: '【spell 等】持续时间单位："inst"(立即) / "round" / "turn" / "minute" / "hour" / "day" / "perm"(永久) / "spec"。默认 "inst"' },
        concentration: { type: 'boolean', description: '【spell】是否需要专注（默认 false）' },
        description: { type: 'string', description: '物品描述' },
        damage: {
            type: 'object', description: '【武器】主要伤害骰，如 {number:1,denomination:8,types:["piercing"]}',
            properties: {
                number: { type: 'number', description: '骰数' },
                denomination: { type: 'number', description: '骰面' },
                types: { type: 'array', items: { type: 'string' }, description: '伤害类型（bludgeoning/piercing/slashing/fire/poison/acid 等）' },
                bonus: { type: 'string', description: '固定加值（可选）' },
                formula: { type: 'string', description: '动态伤害公式（可选，支持 @ 引用）。走 damage.base.custom.formula，如 "2d6 + @mod +1"、"1@scale.monk.die + @mod"；给了它就别再给 number/denomination' },
            },
        },
        ability: { type: 'string', enum: [...ABILITIES], description: '【武器】攻击属性，默认 str' },
        toHit: { type: 'number', description: '【武器】固定命中加值（可选，不传则由系统按属性自动计算）' },
        ranged: { type: 'boolean', description: '【武器】远程攻击，默认近战' },
        magical: { type: 'boolean', description: '【通用】是否魔法物品（自动加 properties:["mgc"]）' },
        magicalBonus: { type: ['string', 'number'], description: '【武器】魔法加值，如 1 = +1 武器（落 system.magicalBonus）' },
        properties: { type: 'array', items: { type: 'string' }, description: '【通用】属性列表，如 ["mgc","hvy","two","rch"]、护甲的 ["stealthDisadvantage"]' },
        armor: {
            type: 'object', description: '【equipment 护甲】如 {value:16,dex:0}。dex: null=敏捷加值不受限（轻甲）、0=重甲完全不加',
            properties: { value: { type: 'number', description: '护甲值（盾是 2）' }, dex: { type: ['number', 'null'], description: '敏捷加值上限；null=不限' } },
        },
        strength: { type: 'number', description: '【equipment】力量要求，如重甲 13（不达标会减速）' },
        uses: {
            type: 'object', description: '【consumable】如 {max:"1",autoDestroy:true}（喝掉就消失）。loot 没有这个字段',
            properties: { max: { type: ['string', 'number'], description: '最大次数，"" = 无限' }, autoDestroy: { type: 'boolean', description: '用尽自动销毁' } },
        },
        capacity: {
            type: 'object', description: '【container 容器】如 {weight:30}（磅）',
            properties: { weight: { type: 'number', description: '可容纳重量（磅）' } },
        },
        healing: {
            type: 'object', description: '【consumable 药水/卷轴】治疗量，如 {number:2,denomination:4,bonus:"2"}（Potion of Healing = 2d4+2）',
            properties: { number: { type: 'number' }, denomination: { type: 'number' }, bonus: { type: 'string' }, formula: { type: 'string', description: '动态治疗公式（可选，支持 @ 引用）' } },
        },
        useFlavor: { type: 'string', description: '【consumable/tool/feat】点「使用」时发到聊天卡的风味文案（utility 活动）' },
        activationType: { type: 'string', description: '【活动】激活方式，默认 action（bonus/reaction/action/special）' },
        save: {
            type: 'object', description: '【武器】命中后目标豁免（可选）。dc 给数字=固定DC；给字符串=公式（支持 @ 动态引用）',
            properties: {
                ability: { type: 'string', enum: [...ABILITIES] },
                dc: { type: ['number', 'string'], description: '13 = 固定DC ｜ "8 + @prof + @abilities.dex.mod" = 公式 ｜ "@attributes.spelldc" = 引用施法DC ｜ "spellcasting" = 跟随使用者施法DC' },
            },
        },
        extraDamage: {
            type: 'object', description: '【武器】附加伤害（可选），如 {number:1,denomination:6,types:["poison"]}',
            properties: { number: { type: 'number' }, denomination: { type: 'number' }, types: { type: 'array', items: { type: 'string' } } },
        },
        statuses: { type: 'array', items: { type: 'string' }, description: '物品级效果挂的状态 id（如 ["poisoned"]，从 foundry_list_status_effects 拿）' },
        changes: { type: 'array', items: { type: 'object' }, description: '被动自动化改动（可选），如 [{key:"system.attributes.ac.bonus",mode:2,value:"+2",priority:20}]、[{key:"system.bonuses.mwak.damage",mode:2,value:"1d4[fire]"}]' },
        img: { type: 'string', description: '物品图标路径（**强烈建议自己挑**）：建物品前先用 foundry_search_icon{keyword:"hammer"} 检索候选，看一眼返回的列表挑张顺眼的填进来（搜不到就换词根，或加 dir 收窄）。不传 = 落兜底剑图 icons/weapons/swords/sword-guard.webp，返回值会标 iconSource:"default" 提醒你去换。' },
        effectName: { type: 'string', description: '效果名（默认物品名）' },
        effectImg: { type: 'string', description: '效果图标路径（可选）。不传时按 statuses/伤害类型自动选真源 webp（中毒→毒刺、火焰→燃烧、挥砍→血滴等）。⚠️ 不要用 icons/svg/ 那 118 条抽象方块图' },
        overTime: { type: 'string', description: 'midi-qol OverTime 逗号参数串（可选）。saveCount=1- 表示「每回合判定，直到豁免成功才结束」' },
        durationSeconds: { type: 'number', description: '效果时长（秒）。**不传 = 永久**（推荐）：持续伤害类由 OverTime 的 saveCount 决定何时结束，填 60 之类的秒数会让效果中途自己消失' },
        folder: { type: 'string', description: '归档文件夹 uuid（可选，纯 16 位 ID 或 Folder.xxx 均可，自动剥前缀）' },
    }, ['name'], async (args) => {
        const itemType = ITEM_TYPES.includes(args.itemType) ? String(args.itemType) : 'weapon';
        // 1) create 最小壳：dnd5e 自己生成默认结构（自动适配系统版本）
        const created = (await h.callRelay('POST', '/create', {
            query: h.targetingQuery(args),
            body: { entityType: 'Item', data: { name: args.name, type: itemType, img: pickItemIcon(args) }, folder: stripFolder(args.folder) },
        }));
        const createdEntity = unwrapEntity(created);
        const uuid = createdEntity?._id || String(created.uuid ?? created.data?.uuid ?? '').replace(/^(Item\.)?/, '');
        const attackKey = getDefaultAttackKey(createdEntity);
        // 2) update 只 merge 语义关键字段
        const { data, notes, expectInfo } = buildUpdateData(args, attackKey, itemType);
        const { doc: updData } = h.normalizeDocIds(data);
        await h.callRelay('PUT', '/update', {
            query: { ...h.targetingQuery(args), uuid: 'Item.' + uuid },
            body: { data: updData },
        });
        // 3) 读回验证：真比对，不是把字段抄回来就算过（曾因「硬编码 verified:true」交付过坏武器）
        const argAny = args;
        const problems = [];
        let verify = {};
        try {
            await new Promise((r) => setTimeout(r, 1500));
            const raw = (await h.callRelay('GET', '/get', { query: { ...h.targetingQuery(args), uuid: 'Item.' + uuid } }));
            const got = unwrapEntity(raw);
            const sys = (got?.system ?? {});
            const acts = (sys.activities ?? {});
            const attackAct = Object.values(acts).find((x) => x?.type === 'attack');
            const saveAct = Object.values(acts).find((x) => x?.type === 'save');
            const itemEffects = Array.isArray(got?.effects) ? got.effects : [];
            const itemImg = String(got?.img ?? '');
            if (itemImg.includes('/svg/'))
                problems.push(`物品图标仍是 svg（${itemImg}）—— 期望真源 webp 图`);
            const effectImgGot = String(itemEffects[0]?.img ?? '');
            if (expectInfo.hasEffect && effectImgGot.includes('/svg/'))
                problems.push(`效果图标仍是 svg（${effectImgGot}）—— 期望真源 webp 图`);
            const saveEffId = Array.isArray(saveAct?.effects) ? saveAct.effects[0]?._id : undefined;
            const itemEffId = itemEffects[0]?._id;
            const dmgBase = (sys.damage?.base ?? {});
            if (itemType === 'weapon') {
                if (argAny.damage && !dmgBase.denomination)
                    problems.push('伤害骰 damage.base 未落库');
                if (expectInfo.hasSave) {
                    if (!saveAct)
                        problems.push('save 活动未落库');
                    else {
                        if (saveEffId !== itemEffId) {
                            problems.push(`save活动 effects[0]._id(${String(saveEffId)}) ≠ 物品效果 _id(${String(itemEffId)}) → 豁免失败取不到效果，自动化会静默失效`);
                        }
                        if (attackAct && attackAct.otherActivityId !== saveAct._id) {
                            problems.push(`攻击活动 otherActivityId(${String(attackAct.otherActivityId)}) 未指向 save 活动(${String(saveAct._id)})`);
                        }
                    }
                }
            }
            else {
                // 非武器：逐条核对该类型“必须有”的字段
                for (const ef of expectInfo.expectFields) {
                    if (ef.want === undefined || ef.want === null || ef.want === '')
                        continue;
                    const gotVal = readPath(got, ef.path);
                    if (gotVal === undefined)
                        problems.push(`${ef.path} 未落库（期望 ${JSON.stringify(ef.want)}）—— 该键名可能不被 dnd5e 接受，或被系统清洗`);
                    else if (String(gotVal) !== String(ef.want))
                        problems.push(`${ef.path} = ${JSON.stringify(gotVal)}，期望 ${JSON.stringify(ef.want)}（被 dnd5e 改写或清洗）`);
                }
            }
            if (expectInfo.hasEffect && itemEffects.length === 0)
                problems.push('物品级效果未落库');
            verify = {
                itemType,
                typeValue: readPath(got, 'system.type.value'),
                armor: sys.armor,
                uses: sys.uses,
                capacity: sys.capacity,
                properties: sys.properties,
                damageBase: itemType === 'weapon' ? dmgBase : undefined,
                attack: itemType === 'weapon' ? attackAct?.attack : undefined,
                attackOtherActivityId: itemType === 'weapon' ? attackAct?.otherActivityId : undefined,
                saveDc: saveAct ? saveAct.save?.dc : undefined,
                saveActivityEffectId: saveEffId,
                itemEffectId: itemEffId,
                effectDuration: itemEffects[0]?.duration,
                activityType: readPath(got, 'system.activities.dnd5eactivity000.type'),
                img: itemImg,
                effectImg: effectImgGot,
                problems,
            };
        }
        catch {
            problems.push('读回校验超时/失败（写入已返回成功，但未能核对落库）');
            verify = { note: 'read-back failed' };
        }
        const iconGiven = typeof args.img === 'string' && args.img.trim().length > 0;
        return {
            uuid: 'Item.' + uuid,
            itemType,
            created: true,
            updated: true,
            verified: problems.length === 0,
            iconSource: iconGiven ? 'given' : 'default',
            notes,
            verify,
            note: (problems.length ? '⚠️ 未通过校验：' + problems.join('；') + '。' : '')
                + (notes.length ? notes.join('；') : '物品已创建')
                + (iconGiven ? '' : '。⚠️ 图标用的是兜底剑图（你没指定）—— 建议 foundry_search_icon 看一遍候选，挑张贴切的再用 foundry_update_entity 换上')
                + '。给角色用时 foundry_modify_actor(action:give, toUuid:角色uuid, itemUuid:此uuid)。',
        };
    }));
}
//# sourceMappingURL=minimal.js.map