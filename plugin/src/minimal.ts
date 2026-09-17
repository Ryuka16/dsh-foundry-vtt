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

import { randomBytes, createHash } from 'node:crypto'

export interface MinimalHelpers {
  makeTool: (
    name: string,
    desc: string,
    props: Record<string, unknown>,
    required: string[],
    execute: (args: Record<string, unknown>) => Promise<unknown>,
  ) => { name: string }
  callRelay: (method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, opts?: Record<string, unknown>) => Promise<unknown>
  asObject: (v: unknown) => Record<string, unknown>
  normalizeDocIds: (doc: unknown) => { doc: unknown; renamed: string[] }
  targetingQuery: (args: Record<string, unknown>) => Record<string, unknown>
}

type Reg = (t: { name: string }) => void
type Args = Record<string, unknown>

const ID16 = () => randomBytes(8).toString('hex')

/** heal 活动的 types 是【闭集三键】（dnd5e 源码 config.mjs L2340 DND5E.healingTypes）：
 *   healing（治疗）/ temphp（临时生命）/ maximum（提升最大生命）。
 *  ⚠️ 填伤害类型（如 necrotic）不行 —— midi 的 getDamageType（utils.ts L29-41）会把它落进
 *     damageTypes 分支，治疗语义未定义。midi 按 types.first() 分派。
 *  2026-09-14 补：原先三处写死 ['healing']，等于「临时生命 / 提升最大生命」这类需求根本没入口。 */
const HEAL_TYPES = ['healing', 'temphp', 'maximum']
const healTypesOf = (h: Record<string, unknown> | undefined): string[] => {
  const t = typeof h?.types === 'string' ? h.types.trim() : ''
  return HEAL_TYPES.includes(t) ? [t] : ['healing']
}
const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
const SAVE_KEY = 'dnd5eactivity100'

/**
 * midi-qol 的 `otherActivityId` 原生默认值 —— 按活动类型不同，**不要一律写 "none"**。
 *
 * 2026-09-16 由 midi-qol v13.0.55 源码核实（`MidiActivityMixin.ts` 的
 * `AttackActivity.otherActivity` getter）：
 *
 *     if (otherActivityId === "none" || undefined) return undefined   // ← 先短路
 *     ... 之后才走 ammunitionItem 分支（弹药自带的自动化伤害活动）
 *
 * ⇒ 对**弓 / 弩**这类有弹药的武器，attack 活动写 "none" 会**切断弹药链**，
 *   弹药自带的伤害活动不再结算。"none" 的语义是「显式拒绝绑定」，
 *   只有确实想禁用弹药链 / 未来自动绑定时才用。
 *
 * 原生默认：attack = ""（auto 探测）；check / save / utility = "none"。
 * 纯单活动时两者等价（auto 探测排除自身、0 候选），但保留 "" 更安全。
 */
// 活动级 midiProperties 透传（midi-qol 的 MidiActivityMixin.defineSchema，共 29 键）。
// ⚠️ 只展开调用方**显式给的键**；没给就整个键都不写，让 dnd5e / midi 填它们自己的 initial 值
//    （写 midiProperties: {} 有把 29 键默认值抹空的风险，所以空对象一律不展开）。
// 最常用的三个（2026-09-14 源码核实）：
//   automationOnly      true = 不进「选择活动」弹窗、不能手动掷，只能被自动化 / otherActivityId 调用
//                       —— 「attack + 追击」这类同物品多活动时，隐藏追击活动的标准姿势
//   triggeredActivityId 结算后自动触发同 item 的另一活动（写活动 id / identifier / 跨物品 UUID；"none" = 不触发）
//                       —— 与 otherActivityId 是两套机制：otherActivity 是「同一次使用连带结算」，
//                          triggered 是「这一次结算完之后，另开一个独立 workflow」
//   identifier          活动别名（只能英文数字破折号下划线），可被 otherActivityId / triggeredActivityId 按名字引用
const mpPatch = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const mp = v as Record<string, unknown>
  return Object.keys(mp).length ? { midiProperties: mp } : {}
}
const MIDI_ORIGINAL_OTHER_ID = (kind: string): string => (kind === 'attack' ? '' : 'none')
// ⚠️ otherActivityId 是 midi-qol 通过 MidiActivityMixin 注入的字段，**只存在于 attack / check / save / utility 四类活动上**
// （来源：midi-qol 源码把该字段定义在 src/module/activities/{Attack,Check,Save,Utility}Activity.ts 的活动 schema 顶层）。
// 其余类型（damage / heal / summon / transform / enchant / cast / forward / order）schema 里没有这个键，
// 写了会被 dnd5e 静默清洗 —— 实测：damage 活动落库后 otherActivityId 读回是 undefined（check 是 "none"）。
// ⇒ 按类型条件展开，别无脑给所有 kind 都塞这个键。
const MIDI_OTHER_TYPES = ['attack', 'check', 'save', 'utility']
const otherIdPatch = (kind: string): Record<string, unknown> =>
  MIDI_OTHER_TYPES.includes(kind) ? { otherActivityId: MIDI_ORIGINAL_OTHER_ID(kind) } : {}

/**
 * folder 参数归一：它必须是**纯 16 位字母数字 ID**。
 * 传 "Folder.xxx" 会被 dnd5e 拒（DataModelValidationError "folder: must be a valid 16-character alphanumeric ID"），
 * 用户/AI 常带着前缀，这里统一剥掉。
 * ⚠️ 另一个实测坑：POST /create 的 folder 是**顶层字段**（与 entityType/data 平级），
 * 塞进 data 里会被静默忽略（30/30 次落根目录、不报错）。
 */
const stripFolder = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  if (!s) return undefined
  const m = /^Folder\.([A-Za-z0-9]{16})$/.exec(s)
  return m ? m[1] : s
}

/**
 * save.ability 归一成数组。
 * ⚠️ 实测坑：schema 里 save.ability 是**字符串**（enum: str/dex/...），
 * 但代码原先只判 `Array.isArray()` → 传 "wis" 永远落成默认的 ["dex"]（法术豁免属性静默错掉）。
 */
const toAbilityArray = (v: unknown, fallback: string[]): string[] => {
  if (Array.isArray(v)) {
    const arr = v.filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim())
    return arr.length ? arr : fallback
  }
  if (typeof v === 'string' && v.trim()) return [v.trim()]
  return fallback
}
const ITEM_TYPES = [
  'weapon', 'equipment', 'consumable', 'loot', 'tool', 'container', 'feat',
  'spell', 'class', 'subclass', 'race', 'background', 'facility',
  // backpack：dnd5e 遗留类型，只有 system.json 的 documentTypes 里登记、lang/en.json 没有它。
  // 实测可创建（结构与 container 相同），但 dnd5e 会把它迁移成 container（源码 dnd5e.mjs:21107 "Migrate backpack -> container."），
  // 且侧边栏列表里根本不显示（dnd5e.mjs:22542 `return this.TYPES.filter(t => t !== "backpack")`）。
  // 保留是为了兼容老模组数据；新建物品请优先用 container。
  'backpack',
] as const

/** 各类型 system.type.value 的合法取值（来自 dnd5e 官方样本实测；不在此列的会被 dnd5e 清洗掉）。 */
const SUBTYPES: Record<string, string[]> = {
  equipment: ['light', 'medium', 'heavy', 'shield', 'clothing', 'trinket', 'vehicle'],
  consumable: ['potion', 'food', 'scroll', 'ammo', 'poison', 'wand', 'rod'],
  loot: ['', 'gem', 'art', 'gear', 'treasure', 'junk', 'material', 'resource'],
  feat: ['feat'],
  race: ['humanoid', 'beast', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'monstrosity', 'ooze', 'plant', 'undead'],
  facility: ['basic', 'special'],
}

/** 法术 8 学派（实测火球术 school:"evo"）。 */
const SCHOOLS = ['abj', 'con', 'div', 'enc', 'evo', 'ill', 'nec', 'trs'] as const

/** 把 damage 参数折成 activities.<id>.damage.parts[] 的一个元素（法术伤害实测结构）。 */
function dmgParts(d: Record<string, unknown>): unknown[] {
  const types = Array.isArray(d.types) ? d.types : ['fire']
  if (typeof d.formula === 'string' && d.formula.trim()) {
    return [{
      number: 1, denomination: 6, bonus: '', types,
      custom: { enabled: true, formula: d.formula.trim() },
      scaling: { mode: '', number: null, formula: '' },
    }]
  }
  if (typeof d.number === 'number' || typeof d.denomination === 'number') {
    return [{
      number: typeof d.number === 'number' ? d.number : 1,
      denomination: typeof d.denomination === 'number' ? d.denomination : 6,
      bonus: typeof d.bonus === 'string' ? d.bonus : '',
      types,
      custom: { enabled: false, formula: '' },
      scaling: { mode: '', number: null, formula: '' },
    }]
  }
  return []
}

/**
 * 把用户传的 `activities` 数组追加为**额外活动**（多活动支持）。
 *
 * 为什么必须有（实测依据，a882 会话）：
 * 本工具原先每类只建 1~2 个活动（weapon 最多 attack + save，其余类型恒 1 个）。
 * 遇到「一卡多活动」—— 双形态武器 = 斩(attack) + 轰(save) + 变形(utility) —— 直接超纲：
 * AI **整场 0 次调用本工具**，退回 `foundry_create_entity` 手搓 7KB 完整 JSON
 * （日志原话：「用 foundry_create_entity（foundry_create_item_minimal 建不了三活动）」）。
 *
 * 装配规则：
 * - ID 从 `dnd5eactivity200` 起、按 100 步进 —— 避开主活动 `dnd5eactivity000`
 *   与 weapon 的豁免活动 `dnd5eactivity100`，与 dnd5e 自己的命名一致。
 * - 每个活动的字段结构**照抄样本库实测落库形态**，不是发明出来的。
 * - 各活动的 `otherActivityId` 按 **midi 原生默认值**填（attack = ""、其余 = "none"），
 *   即 attack 仍会走 midi 的 auto 探测。要显式串接就把元素里的 `linkedTo`
 *   填目标活动的 `name`（或它的 id），本函数会把 otherActivityId 指过去。
 */
function appendExtraActivities(acts: Record<string, unknown>, specs: unknown, notes: string[], itemHasUses = false, expectFields: Array<{ path: string; want: unknown }> = []): string[] {
  const made: string[] = []
  if (!Array.isArray(specs) || !specs.length) return made
  const KINDS = ['attack', 'save', 'heal', 'utility', 'summon', 'check', 'damage', 'transform']
  // 先分配 id，再统一处理 linkedTo（可能要指向后面声明的活动）
  const idByName = new Map<string, string>()
  const plan: Array<{ id: string; s: Record<string, unknown>; kind: string }> = []
  let n = 200
  for (const raw of specs) {
    if (!raw || typeof raw !== 'object') continue
    const s = raw as Record<string, unknown>
    const kind = typeof s.kind === 'string' && KINDS.includes(s.kind) ? s.kind : ''
    if (!kind) {
      notes.push('⚠️ activities 里有一项缺 kind（或取值非法），已跳过；合法值：' + KINDS.join('/'))
      continue
    }
    const id = 'dnd5eactivity' + String(n)
    n += 100
    const nm = typeof s.name === 'string' && s.name.trim() ? s.name.trim() : kind
    idByName.set(nm.toLowerCase(), id)
    plan.push({ id, s, kind })
  }
  for (const { id, s, kind } of plan) {
    const actName = typeof s.name === 'string' && s.name.trim() ? s.name.trim() : kind
    const aType = typeof s.activationType === 'string' && s.activationType.trim()
      ? s.activationType.trim()
      : (kind === 'utility' ? 'special' : 'action')
    const sd = (s.damage ?? {}) as Record<string, unknown>
    const svx = (s.save ?? {}) as Record<string, unknown>
    const hx = (s.healing ?? {}) as Record<string, unknown>
    // 逐活动射程与目标（2026-09-17 补齐：原先只有 rangeUnits，range.value 与 target 全无入口）
    const exUnits = typeof s.rangeUnits === 'string' && s.rangeUnits.trim() ? s.rangeUnits.trim() : 'self'
    const exRangeVal = s.rangeValue === undefined || s.rangeValue === null ? '' : String(s.rangeValue)
    const exTargetRaw = (s.target ?? {}) as Record<string, unknown>
    const exTmpl = (exTargetRaw.template ?? {}) as Record<string, unknown>
    const exAff = (exTargetRaw.affects ?? {}) as Record<string, unknown>
    // 这个活动扣不扣物品次数（2026-09-17：原先是「物品有 uses 就无脑全挂」，且 consumes 没进 schema）
    const consumesThis = itemHasUses || s.consumes === true
    const common: Record<string, unknown> = {
      name: actName,
      activation: { type: aType, value: null, override: false },
      // ⚠️ targets 空数组 = 这个活动不消耗任何东西 ⇒ 限次物品点多少次都不扣次数，
      // 限次形同虚设（第三方实测报告 #5）。物品有 uses 时（或 AI 显式传 consumes:true）
      // 必须挂 itemUses，卡面才会在每次使用时扣 1。
      consumption: {
        targets: consumesThis
          ? [{ type: 'itemUses', value: '1', target: '', scaling: { mode: '', formula: '' } }]
          : [],
        scaling: { allowed: false, max: '' },
        spellSlot: false,
      },
      duration: { concentration: s.concentration === true, value: '', units: 'inst', special: '', override: false },
      effects: [],
      // 逐活动 range：units + value 都可填（2026-09-17 补 value —— 原先只有 units，
      // 导致「穿刺（30 尺线形）」这类需要精确射程的额外活动填不了，只能事后 patch）
      range: { override: false, units: exUnits, value: exRangeVal },
      // 逐活动 target：传入的字段覆盖默认空值（template 做线形/锥形/球形，affects 做目标类型）
      target: {
        template: { count: '', contiguous: false, type: '', size: '', width: '', height: '', units: 'ft', stationary: false, ...exTmpl },
        affects: { count: '', type: '', choice: false, special: '', ...exAff },
        prompt: false,
        override: false,
      },
      uses: { spent: 0, max: '', recovery: [] },
      sort: 0,
      img: null,
      // 按 midi 原生默认值走（attack=""、其余 "none"）—— 见 MIDI_ORIGINAL_OTHER_ID 注释：
      // attack 写死 "none" 会切断弓弩的弹药链。要各活动独立请显式 linkedTo，或用
      // foundry_patch_item 改 otherActivityId:"none"。
      ...otherIdPatch(kind),
      // 逐活动 midiProperties（activities[] 每项可传一个对象，只写显式键）
      ...mpPatch(s.midiProperties),
    }
    // ★ 把「显式传进来的键」逐条纳入落库校验（2026-09-17 修）。
    //   原先 midiProperties / target / range.value 全都不在 expectFields 里 ——
    //   传了 ignoreTraits 被 dnd5e 清洗掉，工具照样回 verified:true，是假的安心。
    const actPath = 'system.activities.' + id + '.'
    // 点名消耗（原先静默给每个额外活动挂 itemUses，调用方不知道）
    if (consumesThis) {
      const ctag = 'itemUses 消耗'
      if (!notes.some((x) => x.includes(ctag))) {
        notes.push('⚠️ 额外活动已挂 itemUses 消耗（每次使用扣 1 次物品次数）—— 不该扣的活动请传 consumes:false')
      }
    }
    if (exRangeVal !== '') expectFields.push({ path: actPath + 'range.value', want: exRangeVal })
    for (const tk of Object.keys(exTmpl)) expectFields.push({ path: actPath + 'target.template.' + tk, want: exTmpl[tk] })
    for (const ak of Object.keys(exAff)) expectFields.push({ path: actPath + 'target.affects.' + ak, want: exAff[ak] })
    const mpIn = (s.midiProperties ?? {}) as Record<string, unknown>
    if (mpIn && typeof mpIn === 'object' && !Array.isArray(mpIn)) {
      for (const mk of Object.keys(mpIn)) expectFields.push({ path: actPath + 'midiProperties.' + mk, want: mpIn[mk] })
    }
    if (typeof s.linkedTo === 'string' && s.linkedTo.trim()) {
      const target = idByName.get(s.linkedTo.trim().toLowerCase())
      if (target) {
        common.otherActivityId = target
        notes.push(`  ↳ ${actName} 的 otherActivityId → ${target}`)
      } else {
        notes.push(`  ⚠️ ${actName} 的 linkedTo="${s.linkedTo}" 没匹配到任何活动，未串接`)
      }
    }
    if (kind === 'attack') {
      acts[id] = {
        ...common,
        type: 'attack',
        attack: {
          ability: ABILITIES.includes(s.ability as (typeof ABILITIES)[number]) ? String(s.ability) : 'str',
          bonus: typeof s.toHit === 'number' ? String(s.toHit) : '',
          critical: { threshold: null },
          flat: typeof s.toHit === 'number',
          type: { value: s.ranged === true ? 'ranged' : 'melee', classification: 'weapon' },
        },
        damage: { critical: { bonus: '' }, includeBase: true, parts: dmgParts(sd) },
      }
    } else if (kind === 'save') {
      const rawDc = String(svx.dc ?? '').trim()
      const dcObj = rawDc === 'spellcasting'
        ? { calculation: 'spellcasting', formula: '' }
        : { calculation: '', formula: rawDc || '13' }
      acts[id] = {
        ...common,
        type: 'save',
        save: { ability: toAbilityArray(svx.ability, ['con']), dc: dcObj },
        damage: { onSave: typeof s.onSave === 'string' ? String(s.onSave) : 'none', parts: dmgParts(sd), critical: { allow: false } },
      }
      notes.push(`  豁免活动 DC ${JSON.stringify(dcObj)}`)
    } else if (kind === 'check') {
      // check 活动：dnd5e 5.3.3 的检定活动（config.mjs:4403 activityTypes 之一）。
      // ⚠️ 字段以源码为准：BaseCheckActivityData.defineSchema()（dnd5e.mjs L12414）只有
      //    check{ ability: StringField, associated: SetField, dc:{ calculation, formula } }
      //    ⇒ ability 是【单个字符串】不是数组；【没有 roll 字段】——实测写 roll 会被 dnd5e 静默清洗。
      const ck = (s.check ?? {}) as Record<string, unknown>
      const rawCdc = String(ck.dc ?? '').trim()
      const cdcObj = rawCdc === 'spellcasting'
        ? { calculation: 'spellcasting', formula: '' }
        : { calculation: '', formula: rawCdc || '13' }
      const ckAbility = typeof ck.ability === 'string' && ck.ability.trim() ? ck.ability.trim() : 'str'
      // associated = 该检定关联的技能/工具 id 集合（如 ["stealth"]、["thieves"]），SetField，可留空。
      // ⚠️ 检定公式【不存活动里】—— 点按钮时由 dnd5e 核心现算：actor.rollSkill / rollAbility / rollTool
      //    （check.mjs #rollCheck，公式 = d20 + 属性修正 + 技能熟练）。活动层没有公式入口。
      //    「+X 加值」的正确落点（按作用域选）：
      //      · tool 类型物品 → item.system.bonus（#rollCheck 里 rollData.bonus = this.item.system.bonus）
      //      · 角色级通用   → system.bonuses.abilities.check / .save / .skill（creature.mjs L35-40，FormulaField）
      //      · 单技能/单工具 → system.skills.<key>.bonuses.check、system.tools.<key>.bonuses.check
      //      · 活动级带值   → 只能走 midi 宏（onUseMacroName 在 preAttackRoll 注入 rollData）或 DAE 改角色字段
      const ckAssoc = Array.isArray(ck.associated)
        ? (ck.associated as unknown[]).filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim())
        : []
      acts[id] = {
        ...common,
        type: 'check',
        check: { ability: ckAbility, associated: ckAssoc, dc: cdcObj },
      }
      notes.push(`  检定活动 ability=${ckAbility}${ckAssoc.length ? ' associated=[' + ckAssoc.join(',') + ']' : ''} DC ${JSON.stringify(cdcObj)}`)
    } else if (kind === 'damage') {
      // damage 活动：纯伤害（不带攻击掷骰、不带豁免）。
      // ⚠️ 源码 damage-data.mjs：schema 只有 damage{ critical:{allow,bonus}, parts[] }。
      //    includeBase 是【attack 活动】的字段（attack-data.mjs L40，初始 true，意为「把物品自带
      //    基础伤害并入 parts」）—— damage 活动【没有】这个字段，写了会被 Foundry DataModel
      //    keepUnknown:false 静默丢弃（实测读回 undefined），不是 bug。
      acts[id] = {
        ...common,
        type: 'damage',
        damage: { critical: { allow: false }, parts: dmgParts(sd) },
      }
    } else if (kind === 'heal') {
      acts[id] = {
        ...common,
        type: 'heal',
        healing: {
          number: typeof hx.number === 'number' ? hx.number : 1,
          denomination: typeof hx.denomination === 'number' ? hx.denomination : 8,
          bonus: typeof hx.bonus === 'string' ? hx.bonus : '',
          types: healTypesOf(hx),
          custom: typeof hx.formula === 'string' && hx.formula ? { enabled: true, formula: String(hx.formula) } : { enabled: false, formula: '' },
        },
      }
    } else if (kind === 'summon') {
      const sm = (s.summon ?? {}) as Record<string, unknown>
      const smTypes = Array.isArray(sm.types) && sm.types.length ? (sm.types as string[]) : ['beast']
      acts[id] = {
        ...common,
        type: 'summon',
        bonuses: { ac: '', hd: '', hp: '', attackDamage: '', saveDamage: '', healing: '' },
        creatureSizes: [],
        creatureTypes: smTypes,
        match: { attacks: false, disposition: true, proficiency: false, saves: false, ability: '' },
        profiles: [{ count: sm.count === undefined ? '1' : String(sm.count), cr: sm.cr === undefined ? '1' : String(sm.cr), name: '', _id: ID16(), uuid: null, types: smTypes, level: { min: null, max: null } }],
        summon: { mode: 'cr', prompt: true },
        friendlySummon: false,
      }
    } else if (kind === 'transform') {
      // transform 活动 = 把自己 polymorph 成另一个 Actor，【不是】「物品换形态」。
      // 源码 BaseTransformActivityData.defineSchema()（dnd5e.mjs L28800-28823）：
      //   profiles[] = { _id, cr(公式), level{min,max}, movement(Set), name, sizes(Set), types(Set),
      //                  uuid: DocumentUUIDField({ type: "Actor" }) }   ← uuid 必须指向 Actor
      //   settings   = EmbeddedDataField(TransformationSetting, { nullable: true, initial: null })
      //                ⇒ 【不写 settings 完全合法】；写了的话各 Set 的 initial 是动态的
      //                  （从 CONFIG.DND5E.transformation[category] 取 default:true 的键，L28431-28435）
      //   transform  = { customize, mode(初始 "cr"), preset }
      // 可用过滤：availableProfiles getter = (level.min ?? -Infinity) <= relevantLevel <= (level.max ?? Infinity)
      //          ⇒ level 不写 = 任何等级都能选（所以只在显式传 levelMin/levelMax 时才写这两个键）
      // ⚠️ midi 侧 transform 的 possibleOtherActivity = false ⇒ 不能当子活动，故不写 otherActivityId。
      const tf = (s.transform ?? {}) as Record<string, unknown>
      const tfUuid = typeof tf.uuid === 'string' ? tf.uuid.trim() : ''
      const tfArr = (v: unknown): string[] =>
        Array.isArray(v)
          ? (v as unknown[]).filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim())
          : []
      const lv: Record<string, number> = {}
      if (typeof tf.levelMin === 'number' && Number.isFinite(tf.levelMin)) lv.min = tf.levelMin
      if (typeof tf.levelMax === 'number' && Number.isFinite(tf.levelMax)) lv.max = tf.levelMax
      const profile: Record<string, unknown> = {
        _id: ID16(),
        cr: tf.cr === undefined ? '' : String(tf.cr),
        level: lv,
        movement: tfArr(tf.movement),
        name: typeof tf.name === 'string' ? tf.name : '',
        sizes: tfArr(tf.sizes),
        types: tfArr(tf.types),
      }
      if (tfUuid) profile.uuid = tfUuid
      const ts = (s.transformSettings ?? {}) as Record<string, unknown>
      const tsObj: Record<string, unknown> = {}
      for (const k of ['effects', 'keep', 'merge', 'other']) {
        const v = tfArr(ts[k])
        if (v.length) tsObj[k] = v
      }
      if (ts.spellLists !== undefined) tsObj.spellLists = tfArr(ts.spellLists)
      for (const k of ['tempFormula', 'minimumAC', 'preset']) {
        if (typeof ts[k] === 'string') tsObj[k] = ts[k]
      }
      if (typeof ts.transformTokens === 'boolean') tsObj.transformTokens = ts.transformTokens
      acts[id] = {
        ...common,
        type: 'transform',
        profiles: [profile],
        settings: Object.keys(tsObj).length ? tsObj : null,
        transform: {
          customize: tf.customize === true,
          mode: typeof tf.mode === 'string' && tf.mode.trim() ? tf.mode.trim() : 'cr',
          preset: typeof tf.preset === 'string' ? tf.preset : '',
        },
      }
      if (!tfUuid) {
        notes.push('  ⚠️ transform 活动缺 transform.uuid —— dnd5e 要求它指向一个 Actor（DocumentUUIDField{type:"Actor"}），否则这个活动点不动')
      }
      notes.push(`  变身活动 profiles[0] uuid=${tfUuid || '(缺)'} cr=${String(profile.cr)} level=${JSON.stringify(lv)}`)
    } else {
      acts[id] = {
        ...common,
        type: 'utility',
        description: { chatFlavor: typeof s.useFlavor === 'string' ? s.useFlavor : '' },
        roll: { prompt: false, visible: false, name: '', formula: '' },
      }
    }
    made.push(id)
    notes.push(`额外活动 ${id}（${kind}：${actName}，激活 ${aType}）`)
  }
  return made
}

function unwrapEntity(raw: unknown): Record<string, unknown> | undefined {
  const r = raw as Record<string, unknown> | undefined
  if (!r) return undefined
  if (r.entity && typeof r.entity === 'object') {
    const e = r.entity
    return Array.isArray(e) ? (e[0] as Record<string, unknown>) : (e as Record<string, unknown>)
  }
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) return r.data as Record<string, unknown>
  return r
}

function getDefaultAttackKey(createdEntity: Record<string, unknown> | undefined): string {
  if (!createdEntity) return ''
  const sys = createdEntity.system as Record<string, unknown> | undefined
  const acts = sys?.activities
  if (acts && typeof acts === 'object') {
    for (const [k, v] of Object.entries(acts as Record<string, unknown>)) {
      if ((v as Record<string, unknown>)?.type === 'attack') return k
    }
  }
  return ''
}

/** 键名排序的稳定序列化 —— 只在算凭证哈希时用，键顺序无关。 */
function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null'
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']'
  const o = v as Record<string, unknown>
  const keys = Object.keys(o).filter((k) => o[k] !== undefined).sort()
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(o[k])).join(',') + '}'
}

/**
 * 「用户已过目」凭证（2026-09-14 用户令：**先让我过一眼，只有我说可以，再做进去**）。
 * = 除 preview / confirmToken 外全部参数的 sha256 前 16 位。
 * 意义：参数一旦填错或改动，凭证就对不上 → 工具拒绝落库、重发预览。
 * 所以「没看过这一版就建不进去」是**代码保证**的，不靠 AI 自觉。
 */
function confirmTokenFor(args: Record<string, unknown>): string {
  const clone: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(args)) {
    if (k === 'preview' || k === 'confirmToken') continue
    clone[k] = v
  }
  return createHash('sha256').update(stableStringify(clone)).digest('hex').slice(0, 16)
}

/**
 * 效果图标选择：按状态/伤害类型语义匹配真源 webp。
 * 为什么不用 icons/svg/*：那 118 条是抽象的方块图（aura.svg 等），当效果图标观感很差；
 * 真源 6560 条里 6248 个是 .webp 实物图标，好看得多。以下路径逐条经真源核对存在（未验证的一律不写）。
 */
const EFFECT_ICON_BY_DAMAGE: Record<string, string> = {
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
}
const EFFECT_ICON_BY_STATUS: Record<string, string> = {
  poisoned: 'icons/creatures/abilities/stinger-poison-green.webp',
  bleeding: 'icons/skills/wounds/blood-drip-droplet-red.webp',
  burning: 'icons/magic/fire/flame-burning-hand-orange.webp',
  invisible: 'icons/magic/perception/eye-ringed-glow-angry-red.webp',
  charmed: 'icons/magic/control/mouth-smile-deception-purple.webp',
}
const DEFAULT_EFFECT_ICON = 'icons/magic/control/silhouette-aura-energy.webp'

/** 优先顺序：显式 effectImg > statuses 语义 > OverTime 里的 damageType > damage.types > 通用兜底。 */
/**
 * flags.dae.stackable —— DAE 的重复施加去重策略（dae.ts _preCreateActiveEffect L570-700）。
 * ⚠️ 缺省 / 空串 = 【不去重】：重复命中会叠出多份同名效果（最容易踩的坑）。
 * 默认给 noneName（同 origin + 同名替换 = 刷新而不是叠层）；要叠层用 count（名称变「名字 (n)」，删除时递减）。
 * 挂 statuses 的效果其实安全（statuses 已存在会被 DAE 忽略，L687-689）；危险的是没有 statuses 的纯 OverTime 效果。
 */
const DAE_STACKABLE = ['multi', 'none', 'noneName', 'noneNameOnly', 'count', 'countDeleteDecrement']
function stackableOf(a: Args): string {
  const s = typeof a.stackable === 'string' ? a.stackable.trim() : ''
  return DAE_STACKABLE.includes(s) ? s : 'noneName'
}
function pickEffectIcon(a: Args): string {
  if (typeof a.effectImg === 'string' && a.effectImg.trim()) return a.effectImg.trim()
  if (Array.isArray(a.statuses)) {
    for (const s of a.statuses as string[]) if (EFFECT_ICON_BY_STATUS[s]) return EFFECT_ICON_BY_STATUS[s]
  }
  const ot = typeof a.overTime === 'string' ? a.overTime : ''
  const m = /damageType=([a-zA-Z]+)/.exec(ot)
  if (m && EFFECT_ICON_BY_DAMAGE[m[1].toLowerCase()]) return EFFECT_ICON_BY_DAMAGE[m[1].toLowerCase()]
  const dt = (a.damage as Record<string, unknown> | undefined)?.types
  if (Array.isArray(dt)) {
    for (const t of dt as string[]) if (EFFECT_ICON_BY_DAMAGE[t]) return EFFECT_ICON_BY_DAMAGE[t]
  }
  return DEFAULT_EFFECT_ICON
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
const DEFAULT_ITEM_ICON = 'icons/weapons/swords/sword-guard.webp'

/** 优先：显式 img > 真源 webp 兜底。 */
function pickItemIcon(a: Args): string {
  if (typeof a.img === 'string' && a.img.trim()) return a.img.trim()
  return DEFAULT_ITEM_ICON
}

interface Built {
  data: Record<string, unknown>
  notes: string[]
  expectInfo: {
    effectId: string | null
    hasSave: boolean
    hasEffect: boolean
    durSec: number | null
    /** 该类型需要校验的额外字段：{ 读回路径字符串, 期望值 } */
    expectFields: { path: string; want: unknown }[]
  }
}

/** 从物品文档按路径读值，如 'system.type.value'，或带数组下标的 'system.activities.x.consumption.targets[0].type'。
 *  ⚠️ 必须先把 [n] 折成 .n —— 2026-09-14 第三方复检的坐标：这里原先是裸 path.split('.')，
 *  遇到 'targets[0]' 会拿整串当键名去查 → 永远 undefined → 必检项误报「未落库」，
 *  而同一份数据用 foundry_diff 的 readPathLoose（带 replace(/\[(\d+)\]/g,'.$1')）读出来是对的。
 *  同一份数据两套读法 = 必然打架，所以这里跟 readPathLoose 对齐。 */
function readPath(doc: Record<string, unknown> | undefined, path: string): unknown {
  let cur: unknown = doc
  for (const seg of path.replace(/\[(\d+)\]/g, '.$1').split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[seg]
  }
  return cur
}

/** uses.recovery —— dnd5e 要的是**对象数组**，裸字符串会被静默丢弃。
 *  ⚠️ 2026-09-14 第三方实测（内存临时文档，未碰世界数据）：
 *      recovery:"day"                              → 落库 {period:"lr",  type:"recoverAll"}  ← 值丢了，回退长休
 *      recovery:[{period:"day",type:"recoverAll"}] → 落库 {period:"day", type:"recoverAll"}  ← 原样保留
 *    证明 "day" 本身合法，损失来自「裸字符串」这个形式；_source 构造时即被规范化，所以世界里的件也是 lr
 *    —— 属「回执说 A、数据是 B」那类静默降级（旧代码的 notes 还回显「（day 恢复）」，与实际不符）。
 *  样本库实证（真实导出件）：period 取值只有 lr 5 件 / day 3 件 / turnStart 2 件，type 一律 "recoverAll"。
 *
 *  recharge —— 结论 2026-09-14 被复核反转过一次，别再按旧说法警告：
 *    源码 `F:\FVTT\data\systems\dnd5e\dnd5e.mjs:4350-4366` 的 `static prepareData(rollData, labels)`
 *    （注释自述：Should be called during the `prepareFinalData` stage）写着：
 *        for ( const recovery of this.uses.recovery ) {
 *          if ( recovery.period === "recharge" ) {
 *            recovery.formula ??= "6";
 *            recovery.type = "recoverAll";
 *            recovery.recharge = { options: UsesField.rechargeOptions };
 *    ⇒ type 与 recharge 子对象**都是 dnd5e 自己在 prepareFinalData 阶段补的**，
 *      下面手写的 type:"recoverAll" 正好就是它要的值 —— 不是「结构缺失」。
 *      （先前用内存临时文档测不到子对象，是临时文档停在构造阶段、没走 prepareFinalData，把阶段差当成了缺失。）
 *    ⇒ 真正值得警告的只有 formula：`recovery.formula ??= "6"` 意味着**不传就是充能 6**，
 *      而本函数的字符串入参带不了 formula ⇒ `recovery:"recharge"` 永远等于「充能 6」，做不出充能 5。
 *      要充能 5 就传对象数组 `[{period:'recharge', type:'recoverAll', formula:'5'}]`，或建完手工设。 */
function buildRecovery(u: Record<string, unknown>, notes: string[]): { rec: unknown[]; recPeriods: string[] } {
  const rec: unknown[] = typeof u.recovery === 'string' && u.recovery.trim()
    ? [{ period: u.recovery.trim(), type: 'recoverAll' }]
    : Array.isArray(u.recovery) ? u.recovery : []
  const recPeriods = rec.map((r) => (r && typeof r === 'object'
    ? String((r as Record<string, unknown>).period ?? '')
    : String(r)))
  if (recPeriods.includes('recharge')) {
    // 只警告 formula 这一件事：type 与 recharge 子对象由 dnd5e 自己补（dnd5e.mjs:4361-4364）。
    // 调用方若已按对象数组显式给了 formula，就没什么可提醒的了。
    const hasFormula = rec.some((r) => r && typeof r === 'object'
      && (r as Record<string, unknown>).formula !== undefined)
    if (!hasFormula) {
      notes.push('⚠️ recovery "recharge"：类型没问题（dnd5e 自己会补 recoverAll 与充能选项），'
        + '但充能数值会固定为 dnd5e 默认的 6 —— 本参数字符串形式带不了 formula。'
        + "要充能 5 请传对象数组 [{period:'recharge', type:'recoverAll', formula:'5'}]，或建完手工设")
    }
  }
  return { rec, recPeriods }
}

/** price / weight —— 13 类物品通用。2026-09-14 第三方实测：原先**根本没有这两个入参**，
 *  任何要标价的物品（酒、宝石、战利品）建完都必须再补一次 foundry_update_entity。
 *  结构照样本库实测（全样本 denomination 都是 gp、weight units 都是 lb）：
 *    price  = {"value":25,"denomination":"gp"}
 *    weight = {"value":2,"units":"lb"}
 *  value 落库是**数字**（不是字符串），所以这里 Number() 后校验有限性，非数字就整个跳过（不写脏值）。 */
function applyPriceWeight(
  sys: Record<string, unknown>,
  a: Args,
  expectFields: Array<{ path: string; want: unknown }>,
  notes: string[],
): void {
  if (a.price !== undefined && a.price !== null && a.price !== '') {
    const pv = Number(a.price)
    if (Number.isFinite(pv)) {
      const denom = typeof a.priceDenomination === 'string' && a.priceDenomination.trim() ? a.priceDenomination.trim() : 'gp'
      sys.price = { value: pv, denomination: denom }
      expectFields.push({ path: 'system.price.value', want: pv })
      notes.push('价格 ' + pv + ' ' + denom)
    }
  }
  if (a.weight !== undefined && a.weight !== null && a.weight !== '') {
    const wv = Number(a.weight)
    if (Number.isFinite(wv)) {
      const units = typeof a.weightUnits === 'string' && a.weightUnits.trim() ? a.weightUnits.trim() : 'lb'
      sys.weight = { value: wv, units }
      expectFields.push({ path: 'system.weight.value', want: wv })
      notes.push('重量 ' + wv + ' ' + units)
    }
  }
}

/** 非武器类型：只 merge 该类型真实存在的字段（多写的键会被 dnd5e 清洗掉）。 */
function buildNonWeapon(a: Args, itemType: string): Built {
  const name = String(a.name ?? '')
  const notes: string[] = []
  const sys: Record<string, unknown> = { description: { value: typeof a.description === 'string' ? a.description : '' } }
  const expectFields: { path: string; want: unknown }[] = []

  const typeGiven = typeof a.subtype === 'string' && (a.subtype as string).length > 0 ? String(a.subtype) : ''
  const baseItem = typeof a.baseItem === 'string' ? String(a.baseItem) : ''

  // ── system.type：每类的形状不同（实测）──
  if (itemType === 'equipment') {
    const v = typeGiven || 'clothing'
    sys.type = { value: v, baseItem }
    expectFields.push({ path: 'system.type.value', want: v })
    notes.push(`equipment 子类型 ${v}${baseItem ? '（baseItem: ' + baseItem + '）' : ''}`)
  } else if (itemType === 'consumable') {
    const v = typeGiven || 'potion'
    sys.type = { value: v, subtype: '' }
    expectFields.push({ path: 'system.type.value', want: v })
    notes.push(`consumable 子类型 ${v}${v === 'food' && /wine|ale|酒|饮|beer|drink/i.test(name) ? '（⚠️ 酒水实测也是 food，不是 drink）' : ''}`)
  } else if (itemType === 'loot') {
    sys.type = { value: typeGiven, subtype: '' }
    if (typeGiven) expectFields.push({ path: 'system.type.value', want: typeGiven })
    notes.push(`loot${typeGiven ? ' 子类型 ' + typeGiven : '（无子类型）'}——该类型没有 uses 字段`)
  } else if (itemType === 'tool') {
    sys.type = { value: '', baseItem }
    if (baseItem) expectFields.push({ path: 'system.type.baseItem', want: baseItem })
    notes.push(`tool${baseItem ? '（baseItem: ' + baseItem + '）' : ''}`)
  } else if (itemType === 'feat') {
    sys.type = { value: 'feat', subtype: '' }
    notes.push('feat 特性')
  } else if (itemType === 'race') {
    const v = typeGiven || 'humanoid'
    const sub = typeof a.raceSubtype === 'string' ? String(a.raceSubtype) : ''
    sys.type = { value: v, subtype: sub, custom: '' }
    expectFields.push({ path: 'system.type.value', want: v })
    notes.push(`race 生物类型 ${v}${sub ? '（亚种 ' + sub + '）' : ''}`)
  } else if (itemType === 'facility') {
    // 实测 + 源码双证：facility 的 type.value ∈ basic|special，且 baseItem 是**布尔 false**（其他类型是字符串）
    // 依据 dnd5e.mjs:71605 `type: new ItemTypeField({ value: "basic", baseItem: false })`、
    //      dnd5e.mjs:56556 `const otherType = facilityType === "basic" ? "special" : "basic"`
    const v = typeGiven === 'special' ? 'special' : 'basic'
    sys.type = { value: v, baseItem: false }
    expectFields.push({ path: 'system.type.value', want: v })
    notes.push(`facility 类型 ${v}（basic=基础设施 / special=特殊设施）`)
    if (typeof a.facilityLevel === 'number') {
      sys.level = a.facilityLevel
      expectFields.push({ path: 'system.level', want: a.facilityLevel })
      notes.push(`设施等级 ${a.facilityLevel}`)
    }
    if (typeof a.description === 'string' && a.description) notes.push('其余字段（building/craft/progress/enlargeable 等）交给 dnd5e 默认')
  }
  // container / spell / class / subclass / background 都没有 system.type（实测）

  // ── 护甲值（仅 equipment）──
  if (itemType === 'equipment') {
    const ar = a.armor as Record<string, unknown> | undefined
    const hasArmorValue = ar && ar.value !== undefined && ar.value !== null
    if (hasArmorValue || (typeGiven && ['light', 'medium', 'heavy', 'shield'].includes(typeGiven))) {
      const av = hasArmorValue ? Number(ar!.value) : null
      // dex: null = 敏捷加值不受限；0 = 重甲完全不加（实测：轻甲 dex:null，重甲 dex:0）
      const dexCap = ar && ar.dex !== undefined ? (ar.dex === null ? null : Number(ar.dex)) : null
      sys.armor = { value: av, dex: dexCap }
      if (av !== null) expectFields.push({ path: 'system.armor.value', want: av })
      notes.push(`护甲值 ${av ?? '—'}${dexCap === null ? '（敏捷加值不限）' : '（敏捷上限 ' + dexCap + '）'}`)
    }
  }

  // ── 力量要求 / 隐匿劣势 ──
  if (itemType === 'equipment' && typeof a.strength === 'number') {
    sys.strength = a.strength
    expectFields.push({ path: 'system.strength', want: a.strength })
    notes.push(`力量要求 ${a.strength}`)
  }

  // ── properties（magical / stealthDisadvantage 等）──
  if (Array.isArray(a.properties) && (a.properties as unknown[]).length) {
    sys.properties = a.properties
    notes.push('properties: ' + (a.properties as string[]).join(', '))
  } else if (a.magical === true) {
    sys.properties = ['mgc']
    notes.push('properties: mgc（魔法物品）')
  }

  // ── 稀有度（通用字段，实测 system.rarity 直接是字符串："" | common | uncommon | rare | veryRare | legendary | artifact）──
  if (typeof a.rarity === 'string' && a.rarity.trim()) {
    sys.rarity = a.rarity.trim()
    expectFields.push({ path: 'system.rarity', want: a.rarity.trim() })
    notes.push('稀有度 ' + a.rarity.trim())
  }

  // ── 射程 / 持续时间（spell 等类型卡面要显示，不传时 dnd5e 会留 "self" / "inst"）──
  // 实测坑：只传 rangeUnits 时 activity 层的 range 会变，但 **system.range 永远停在 self**，
  // 结果是「描述写 60 尺、卡面显示自身」。这里两层一起写，并支持 rangeValue 填数值。
  // ⚠️ 但只有 spell 有 item 级 system.range：feat / race / class / background / loot / tool /
  // container 的 DataModel 里根本没这个字段，写了会被 dnd5e 静默丢弃，而下面的
  // expectFields 仍然去校验它 —— 工具反过来误报「未落库」（第三方实测报告 #6）。
  const supportsItemRange = itemType === 'spell'
  if (supportsItemRange && (typeof a.rangeUnits === 'string' || typeof a.rangeValue === 'string' || typeof a.rangeValue === 'number')) {
    const rUnits = typeof a.rangeUnits === 'string' && a.rangeUnits.trim() ? a.rangeUnits.trim() : 'self'
    const rValue = a.rangeValue === undefined || a.rangeValue === null ? '' : String(a.rangeValue)
    sys.range = { value: rValue, units: rUnits, special: '', override: false }
    expectFields.push({ path: 'system.range.units', want: rUnits })
    notes.push(`射程 ${rValue || '—'} ${rUnits}`)
  }
  if (itemType === 'spell' && (typeof a.durationValue === 'string' || typeof a.durationValue === 'number' || typeof a.durationUnits === 'string')) {
    const dValue = a.durationValue === undefined || a.durationValue === null ? '' : String(a.durationValue)
    const dUnits = typeof a.durationUnits === 'string' && a.durationUnits.trim() ? a.durationUnits.trim() : 'inst'
    sys.duration = { value: dValue, units: dUnits, concentration: a.concentration === true, special: '', override: false }
    notes.push(`持续 ${dValue || '—'} ${dUnits}${a.concentration === true ? '（专注，已写 properties.concentration）' : ''}`)
  }

  // ── uses ──
  // 2026-09-14 第三方实测纠正：原先写成 `if (itemType === 'consumable')`，注释还写着「仅 consumable；
  // loot 没有 uses」—— 这把戒指/护符/奇物全挡在门外了。样本库实证（71 件带 uses）：
  //   consumable 21 ✓  weapon 5（磁轭手铳 max="@prof"、魔晶石巨剑 max=1、篡位者的死颅 max=1）
  //   equipment 3（传送门装置 max=3、妄质百变腕甲 max=1、问号宝箱砖 max=3）  feat 4
  //   loot 一件都没有 —— loot 确实没有 uses，这条原判断是对的，错的是把它推广到了所有非 consumable。
  // 所以：consumable 不传也建默认次数池；其余有该字段的类型「传了才写」。
  const USES_TYPES = ['consumable', 'equipment', 'weapon', 'feat', 'tool']
  const usesObj = a.uses && typeof a.uses === 'object' ? (a.uses as Record<string, unknown>) : undefined
  if (USES_TYPES.includes(itemType) && (itemType === 'consumable' || usesObj !== undefined)) {
    const u = usesObj ?? {}
    const max = u.max === undefined ? '1' : String(u.max)
    // ⚠️ 原来不传就默认 true，导致「垂柳杖 max:7」用完自毁（子代理实测 P1）。
    // 按子类型推断更合理：药水/弹药/毒药/卷轴 属于消耗品，用掉就消失；
    // 魔杖/法杖（wand/rod）是可充能道具，默认保留。
    const defaultAutoDestroy = itemType === 'consumable' && !['wand', 'rod'].includes(typeGiven)
    const autoDestroy = u.autoDestroy === undefined ? defaultAutoDestroy : u.autoDestroy === true
    const rr = buildRecovery(u, notes)
    sys.uses = { max, autoDestroy, spent: 0, recovery: rr.rec }
    expectFields.push({ path: 'system.uses.max', want: max })
    if (rr.recPeriods.length) expectFields.push({ path: 'system.uses.recovery[0].period', want: rr.recPeriods[0] })
    notes.push(`可使用 ${max === '' ? '∞' : max} 次${autoDestroy ? '（用尽销毁）' : ''}${rr.recPeriods.length ? '（' + rr.recPeriods.join('/') + ' 恢复）' : ''}`)
  }

  // 价格与重量（13 类通用）
  applyPriceWeight(sys, a, expectFields, notes)

  // ── 容量（仅 container）──
  if (itemType === 'container' || itemType === 'backpack') {
    const cap = (a.capacity ?? {}) as Record<string, unknown>
    const w = cap.weight === undefined ? 30 : Number(cap.weight)
    sys.capacity = { weight: { value: w, units: 'lb' }, volume: { units: 'cubicFoot' } }
    expectFields.push({ path: 'system.capacity.weight.value', want: w })
    notes.push(`容量 ${w} lb`)
  }

  // ── spell 独有字段（实测 Fireball / Fire Bolt / Cure Wounds / Light）──
  if (itemType === 'spell') {
    const lv = typeof a.spellLevel === 'number' ? a.spellLevel : 0
    const school = typeof a.school === 'string' && (SCHOOLS as readonly string[]).includes(a.school) ? String(a.school) : 'evo'
    const spProps = Array.isArray(a.spellComponents) ? (a.spellComponents as string[]).slice() : []
    // ⚠️ 专注的真正落点是 properties 里的 "concentration"（实测祝福术 = ["vocal","somatic","material","concentration","mgc"]）。
    //    system.duration 只有 {value,units} 没有 concentration 字段；activity.duration.concentration 恒为 false（陷阱，别往那写）。
    if (a.concentration === true && !spProps.includes('concentration')) spProps.push('concentration')
    sys.level = lv
    sys.school = school
    sys.method = typeof a.spellMethod === 'string' ? String(a.spellMethod) : 'spell'
    sys.prepared = typeof a.prepared === 'number' ? a.prepared : 1
    sys.properties = spProps
    sys.materials = { value: '', consumed: false, cost: 0, supply: 1 }
    expectFields.push({ path: 'system.level', want: lv })
    expectFields.push({ path: 'system.school', want: school })
    notes.push(`法术 ${lv} 环，学派 ${school}${spProps.length ? '，成分 ' + spProps.join('/') : ''}`)
  }

  // ── race 的移速 / 感官（实测 race system 键含 movement、senses）──
  if (itemType === 'race') {
    const mv = a.movement as Record<string, unknown> | undefined
    if (mv && typeof mv === 'object') {
      sys.movement = mv
      notes.push('移速 ' + JSON.stringify(mv))
    }
    const sn = a.senses as Record<string, unknown> | undefined
    if (sn && typeof sn === 'object') {
      sys.senses = sn
      notes.push('感官 ' + JSON.stringify(sn))
    }
  }

  // ── identifier（spell / class / subclass / race / background / feat 等都有）──
  if (typeof a.identifier === 'string' && a.identifier.trim()
    && ['spell', 'class', 'subclass', 'race', 'background', 'feat'].includes(itemType)) {
    sys.identifier = a.identifier.trim()
    expectFields.push({ path: 'system.identifier', want: a.identifier.trim() })
    notes.push('identifier: ' + a.identifier.trim())
  }

  // ── subclass 的 classIdentifier（实测键名就叫这个，指向所属职业的 identifier）──
  if (itemType === 'subclass' && typeof a.classIdentifier === 'string' && a.classIdentifier.trim()) {
    sys.classIdentifier = a.classIdentifier.trim()
    expectFields.push({ path: 'system.classIdentifier', want: a.classIdentifier.trim() })
    notes.push('所属职业 identifier: ' + a.classIdentifier.trim())
  }

  // ── 上面 USES_TYPES 没覆盖到的类型（spell 等）也可能传 uses，这里兜底 ──
  // ⚠️ 必须与上一块**互斥**：原来这里写的是 `itemType !== 'consumable' && !== 'loot' && !== 'container'`，
  //    与 USES_TYPES 在 equipment/weapon/feat/tool 上重叠 → 两块各建一次 sys.uses、各 push 一条 notes，
  //    实测出现「可使用 3 次 | 可使用 3 次（day 恢复）」两句重复回显。
  if (!USES_TYPES.includes(itemType) && itemType !== 'loot' && itemType !== 'container'
    && usesObj && usesObj.max !== undefined) {
    const rr = buildRecovery(usesObj, notes)
    sys.uses = { max: String(usesObj.max), spent: 0, recovery: rr.rec }
    expectFields.push({ path: 'system.uses.max', want: String(usesObj.max) })
    if (rr.recPeriods.length) expectFields.push({ path: 'system.uses.recovery[0].period', want: rr.recPeriods[0] })
    notes.push(`可使用 ${String(usesObj.max) === '' ? '∞' : usesObj.max} 次${rr.recPeriods.length ? '（' + rr.recPeriods.join('/') + ' 恢复）' : ''}`)
  }

  // ── 活动级公共字段（2026-09-14 第三方复检抓的两条静默失效，都栽在这两个变量上）──
  // ① itemHasUses：活动挂不挂 itemUses，决定「点使用扣不扣次数」。原先只认 consumable，
  //    导致 feat / tool 设了 uses.max 也落 []，点了不扣（报告实测：feat + uses.max:"3" → targets 读回 undefined）。
  //    判据改成「这个物品最终有没有 uses.max」—— 直接看已组装好的 sys.uses，最准。
  const itemHasUses = !!(sys.uses && String((sys.uses as Record<string, unknown>).max ?? '') !== '')
  // ② actRange：活动级 range 原先写死 {value:'', units:'self'}，rangeValue 报成功却不落库（diff: want "60" got ""）。
  //    注意与 item 级 sys.range 的差别：只有 spell 的 DataModel 里有 system.range（上面 supportsItemRange 那道门管的是它），
  //    但**活动级 range 所有类型都能写** —— 参数给了就写进去。
  const actRange = {
    value: a.rangeValue === undefined || a.rangeValue === null ? '' : String(a.rangeValue),
    units: typeof a.rangeUnits === 'string' && a.rangeUnits.trim() ? a.rangeUnits.trim() : 'self',
    special: '',
    override: false,
  }

  // ── 药水/卷轴的 heal 活动 ──
  const acts: Record<string, unknown> = {}
  const heal = a.healing as Record<string, unknown> | undefined
  const hasHealAct = itemType === 'consumable' && !!heal && !!(heal.number || heal.denomination || heal.formula)
  if (hasHealAct) {
    acts.dnd5eactivity000 = {
      type: 'heal',
      name,
      activation: { type: typeof a.activationType === 'string' ? a.activationType : 'action', value: 1, condition: '', override: false },
      consumption: { targets: itemHasUses ? [{ type: 'itemUses', value: '1', target: '', scaling: { mode: '', formula: '' } }] : [], scaling: { allowed: false, max: '' }, spellSlot: true },
      duration: { concentration: false, value: '', units: 'inst', special: '', override: false },
      range: actRange,
      healing: {
        number: typeof heal.number === 'number' ? heal.number : 1,
        denomination: typeof heal.denomination === 'number' ? heal.denomination : 4,
        bonus: typeof heal.bonus === 'string' ? heal.bonus : '',
        types: healTypesOf(heal),
        custom: heal.formula ? { enabled: true, formula: String(heal.formula) } : { enabled: false, formula: '' },
      },
      effects: [],
      target: { template: { count: '', contiguous: false, type: '', size: '', width: '', height: '', units: 'ft', stationary: false }, affects: { count: '1', type: 'creature', choice: false, special: '' }, prompt: false, override: false },
      sort: 0,
      ...mpPatch(a.midiProperties),
    }
    notes.push(`heal 活动：恢复 ${heal.formula ?? (heal.number ?? 1) + 'd' + (heal.denomination ?? 4)}`)
  }

  // ── utility 活动：点「使用」时把 chatFlavor 发到聊天卡（道具弹文案的实现点，实测结构参照官方 Rations）──
  // 用户 2026-09-14 定：healing 与 useFlavor **同时给时两个都建**（原先写成 else if，药水的文案被静默吞掉）。
  // 键名避让：heal 已占用 dnd5eactivity000 时，utility 用 dnd5eactivity100。
  const flavorText = typeof a.useFlavor === 'string' ? a.useFlavor.trim() : ''
  // 2026-09-14 第三方实测补：原先只给了 consumable/tool/feat，**equipment 被漏掉**——
  // 奇物「点使用弹文案」是常规用法（样本库「问号宝箱砖」就是 equipment/trinket + utility 活动）。
  // loot 也一并放开：用户世界的「血缘命匣」就是 loot + utility（点「辨认血脉」弹文案）。
  const wantsUtility = (itemType === 'consumable' || itemType === 'tool' || itemType === 'feat'
    || itemType === 'equipment' || itemType === 'loot') && !!flavorText
  if (wantsUtility) {
    const uKey = hasHealAct ? 'dnd5eactivity100' : 'dnd5eactivity000'
    acts[uKey] = {
      type: 'utility',
      name,
      activation: { type: typeof a.activationType === 'string' ? a.activationType : 'action', value: null, condition: '', override: false },
      consumption: { targets: itemHasUses ? [{ type: 'itemUses', value: '1', target: '', scaling: { mode: '', formula: '' } }] : [], scaling: { allowed: false, max: '' }, spellSlot: true },
      description: { chatFlavor: flavorText },
      duration: { concentration: false, value: '', units: 'inst', special: '', override: false },
      effects: [],
      range: actRange,
      target: { template: { count: '', contiguous: false, type: '', size: '', width: '', height: '', units: 'ft', stationary: false }, affects: { count: '', type: '', choice: false, special: '' }, prompt: false, override: false },
      uses: { spent: 0, max: '', recovery: [] },
      roll: { prompt: false, visible: false, name: '', formula: '' },
      sort: 0,
      otherActivityId: 'none',
      ...mpPatch(a.midiProperties),
    }
    notes.push('utility 活动（点使用时把文案发到聊天卡）' + (hasHealAct ? '（与 heal 活动并存：' + uKey + '）' : ''))
  }

  // ── 把上面两条静默失效变成**必检项**（2026-09-14 第三方复检点破的根子）──
  // 原先 problems 只核伤害骰 / 活动类型 / _id 关联，**没核 consumption.targets 与活动级 range**，
  // 所以「feat 设了 uses.max 却落空数组」能一路 verified:true 过关 —— 不是用例选错，是校验器漏项。
  // 现在落库不对就 problems 非空、verified:false。
  const checkActKeys: string[] = []
  if (hasHealAct) checkActKeys.push('dnd5eactivity000')
  if (wantsUtility) checkActKeys.push(hasHealAct ? 'dnd5eactivity100' : 'dnd5eactivity000')
  if (itemType === 'spell') checkActKeys.push('dnd5eactivity000')
  for (const k of checkActKeys) {
    if (itemHasUses) expectFields.push({ path: 'system.activities.' + k + '.consumption.targets[0].type', want: 'itemUses' })
    if (actRange.value !== '' || actRange.units !== 'self') {
      expectFields.push({ path: 'system.activities.' + k + '.range.units', want: actRange.units })
    }
    // ★ 主活动 midiProperties 逐键落库校验（2026-09-17 补：原先透传了却完全不核，
    //   传了 ignoreTraits 被 dnd5e 清洗掉照样回 verified:true）
    const mpTop = (a.midiProperties ?? {}) as Record<string, unknown>
    if (mpTop && typeof mpTop === 'object' && !Array.isArray(mpTop)) {
      for (const mk of Object.keys(mpTop)) {
        expectFields.push({ path: 'system.activities.' + k + '.midiProperties.' + mk, want: mpTop[mk] })
      }
    }
  }

  // ── spell 的活动：attack / save / heal / utility ──
  // 实测对应：Fire Bolt=attack（attack.type.classification 为空串）、Fireball=save（DC calculation:"spellcasting"）、
  //            Cure Wounds=heal（bonus "@mod"）、Light=utility。给了 spellActivity 就用它，否则按参数自动推断。
  if (itemType === 'spell') {
    const sd = (a.damage ?? {}) as Record<string, unknown>
    const hasDmg = sd.number !== undefined || sd.denomination !== undefined || (typeof sd.formula === 'string' && sd.formula.trim() !== '')
    const sv2 = a.save as Record<string, unknown> | undefined
    const hasSv2 = !!sv2 && sv2.dc !== undefined && sv2.dc !== null
    const hasHeal2 = !!heal && !!(heal.number || heal.denomination || heal.formula)
    const hasSummon = !!(a.summon && typeof a.summon === 'object')
    const actKind = typeof a.spellActivity === 'string' && ['attack', 'save', 'heal', 'utility', 'summon'].includes(a.spellActivity)
      ? String(a.spellActivity)
      : hasSummon ? 'summon' : hasHeal2 ? 'heal' : hasDmg ? (hasSv2 ? 'save' : 'attack') : 'utility'

    const common: Record<string, unknown> = {
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
      ...otherIdPatch(actKind),
      // 法术主活动的 midiProperties（顶层参数，只写显式键）
      ...mpPatch(a.midiProperties),
    }

    if (actKind === 'attack') {
      acts.dnd5eactivity000 = {
        ...common,
        type: 'attack',
        attack: { ability: '', bonus: '', critical: { threshold: null }, flat: false, type: { value: a.ranged === false ? 'melee' : 'ranged', classification: '' } },
        damage: { critical: { bonus: '' }, includeBase: true, parts: dmgParts(sd) },
      }
      notes.push('attack 活动（法术攻击，damage 走 includeBase + parts）')
      expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'attack' })
    } else if (actKind === 'save') {
      const rawSd = sv2?.dc === undefined ? '' : String(sv2.dc).trim()
      const dcObj = rawSd === '' || rawSd === 'spellcasting'
        ? { calculation: 'spellcasting', formula: '' }
        : /^\d+$/.test(rawSd) ? { calculation: '', formula: rawSd } : { calculation: '', formula: rawSd }
      acts.dnd5eactivity000 = {
        ...common,
        type: 'save',
        save: { ability: toAbilityArray(sv2?.ability, ['dex']), dc: dcObj },
        damage: { onSave: 'half', parts: dmgParts(sd), critical: { allow: false } },
      }
      notes.push('save 活动（法术豁免），DC ' + JSON.stringify(dcObj))
      expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'save' })
    } else if (actKind === 'heal') {
      acts.dnd5eactivity000 = {
        ...common,
        type: 'heal',
        healing: {
          number: typeof heal?.number === 'number' ? heal.number : 1,
          denomination: typeof heal?.denomination === 'number' ? heal.denomination : 8,
          // ⚠️ 原来不传就默认注入 "@mod"，把「1d8」悄悄变成「1d8 + 施法调整值」（子代理实测 P1）。
          // 现在不传就是空——想要加施法属性调整值请显式传 bonus:"@mod"。
          bonus: typeof heal?.bonus === 'string' ? heal.bonus : '',
          types: healTypesOf(heal),
          custom: typeof heal?.formula === 'string' && heal.formula ? { enabled: true, formula: String(heal.formula) } : { enabled: false, formula: '' },
        },
      }
      notes.push('heal 活动（法术治疗）')
      expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'heal' })
    } else if (actKind === 'summon') {
      // 实测结构来自官方 Conjure Animals（Compendium.dnd5e.spells24「Conjure Animals」的 dnd5eactivity000）。
      // ⚠️ profiles[]._id 必须是 16 位字母数字（AI 自己写常写成 17 位被拒 400），这里用 ID16() 生成。
      const sm = (a.summon ?? {}) as Record<string, unknown>
      const smTypes = Array.isArray(sm.types) && sm.types.length ? (sm.types as string[]) : ['beast']
      const smCr = sm.cr === undefined ? '1' : String(sm.cr)
      const smCount = sm.count === undefined ? '1' : String(sm.count)
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
      }
      notes.push(`summon 活动（召唤 CR ${smCr} × ${smCount}，类型 ${smTypes.join('/')}）`)
      expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'summon' })
    } else {
      acts.dnd5eactivity000 = {
        ...common,
        type: 'utility',
        description: { chatFlavor: typeof a.useFlavor === 'string' ? a.useFlavor : '' },
        roll: { prompt: false, visible: false, name: '', formula: '' },
      }
      notes.push('utility 活动（法术通用）')
      expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: 'utility' })
    }
  }

  appendExtraActivities(acts, a.activities, notes, itemHasUses)

  if (Object.keys(acts).length) {
    sys.activities = acts
    expectFields.push({ path: 'system.activities.dnd5eactivity000.type', want: acts.dnd5eactivity000 && (acts.dnd5eactivity000 as Record<string, unknown>).type })
  }

  const data: Record<string, unknown> = { system: sys }

  // ── 物品级效果（feat / 奇物可挂被动自动化；结构与武器那条共用）──
  const hasEffect = Array.isArray(a.statuses) || (typeof a.overTime === 'string' && a.overTime.trim()) || (typeof a.changes === 'object' && a.changes !== null)
  let effectId: string | null = null
  const durSec = typeof a.durationSeconds === 'number' && Number.isFinite(a.durationSeconds) ? a.durationSeconds : null
  if (hasEffect) {
    effectId = ID16()
    const changes: unknown[] = []
    // transfer 的判据只看「用户显式传的被动加值」，**不含 OverTime**：
    //   被动加值（AC+1 之类）→ transfer:true（装备即生效，对照 SRD Luckstone）
    //   OverTime / statuses  → transfer:false（那是「命中后施加给目标」的效果，装备者不该自己一直中招）
    let explicitChanges = 0
    if (Array.isArray(a.changes)) {
      for (const c of a.changes as Record<string, unknown>[]) {
        if (c && typeof c === 'object' && typeof c.key === 'string') { changes.push(c); explicitChanges++ }
      }
    }
    if (typeof a.overTime === 'string' && a.overTime.trim()) {
      changes.push({ key: 'flags.midi-qol.OverTime', mode: 0, priority: 20, value: a.overTime.trim() })
    }
    data.effects = [{
      _id: effectId,
      name: typeof a.effectName === 'string' && a.effectName.trim() ? a.effectName : name,
      img: pickEffectIcon(a),
      // ⚠️ 不要写 origin: null —— 那会**覆盖** dnd5e 本该自动填的来源 uuid，
      // 结果内嵌 AE 的 origin 落成 null（第三方实测报告：工具照样回 verified:true，
      // 用户得再补一次 update 才修好）。不传这个键，让系统自己填。
      type: 'base', system: {},
      changes, disabled: false,
      duration: { seconds: durSec },
      description: '<p></p>', tint: '#ffffff', transfer: explicitChanges > 0,
      statuses: Array.isArray(a.statuses) ? a.statuses : [],
      sort: 0,
      flags: { core: { overlay: false }, dae: { stackable: stackableOf(a) } },
    }]
    notes.push(`物品级效果（${changes.length} 条 change${Array.isArray(a.statuses) ? '，statuses: ' + (a.statuses as string[]).join(', ') : ''}，时长 ${durSec === null ? '永久' : durSec + '秒'}）`)
  }

  return { data, notes, expectInfo: { effectId, hasSave: false, hasEffect: !!hasEffect, durSec, expectFields } }
}

/** 组装 update 的语义关键字段（merge 进 dnd5e 默认结构）。 */
function buildUpdateData(a: Args, attackKey: string, itemType: string): Built {
  if (itemType !== 'weapon') return buildNonWeapon(a, itemType)

  const name = String(a.name ?? '')
  const notes: string[] = []
  const dmg = (a.damage ?? {}) as Record<string, unknown>
  const ability = ABILITIES.includes(a.ability as (typeof ABILITIES)[number]) ? String(a.ability) : 'str'
  const ranged = a.ranged === true
  const hasSave = typeof a.save === 'object' && a.save !== null && (a.save as Record<string, unknown>).dc !== undefined

  const sys: Record<string, unknown> = { description: { value: typeof a.description === 'string' ? a.description : '' } }
  // 武器分支原先根本没有期望字段收集（return 里写死 `expectFields: []`），2026-09-14 补上，
  // 让 price / weight / uses 这些新字段也能被 verify 段真正核对（否则又是一次「回执说成功、数据是空的」）。
  const expectFields: { path: string; want: unknown }[] = []
  // ⚠️ 动态引用（@ 公式）的合法落点（样本库实测）：
  //   固定骰   → number/denomination/bonus
  //   动态骰   → custom.enabled:true + custom.formula（如 "2d6 + @mod +1"、"1@scale.monk.die + @mod"）
  //   changes 里 → value 写 @abilities.str.mod / OverTime 串里塞 saveDC=@attributes.spelldc
  // 写错位置会被静默忽略（不报错，只是不生效）。
  const dmgFormula = typeof dmg.formula === 'string' && dmg.formula.trim() ? dmg.formula.trim() : ''
  sys.damage = {
    base: {
      number: Number(dmg.number ?? 1),
      denomination: Number(dmg.denomination ?? 4),
      bonus: typeof dmg.bonus === 'string' ? dmg.bonus : '',
      types: Array.isArray(dmg.types) ? dmg.types : [],
      custom: dmgFormula ? { enabled: true, formula: dmgFormula } : { enabled: false, formula: '' },
    },
  }
  if (typeof a.magicalBonus === 'string' || typeof a.magicalBonus === 'number') {
    sys.magicalBonus = String(a.magicalBonus)
    notes.push(`魔法加值 +${String(a.magicalBonus)}`)
  }
  const props = Array.isArray(a.properties) ? (a.properties as string[]).slice() : []
  if (a.magical === true && !props.includes('mgc')) props.push('mgc')
  if (props.length) {
    sys.properties = props
    notes.push('properties: ' + props.join(', '))
  }

  // ── 武器类别（⚠️ 实测坑：不设 system.type 时 dnd5e 会填默认 {value:"simpleM",baseItem:""}）──
  // 后果实锤：传 baseItem:"longbow" 建出来的长弓是「简单**近战**武器」，射程/属性/熟练全错，
  // 而且不报任何错。所以给 baseItem 就必须同时写对 value。
  // value 取值实测（SRD 原版）：martialM(军用近战)/martialR(军用远程)/simpleM(简单近战)/simpleR(简单远程)
  const baseItemName = typeof a.baseItem === 'string' ? a.baseItem.trim() : ''
  const weaponTypeGiven = typeof a.weaponType === 'string' ? a.weaponType.trim() : ''
  if (baseItemName || weaponTypeGiven) {
    const wt = weaponTypeGiven || (ranged ? 'martialR' : 'martialM')
    sys.type = { value: wt, baseItem: baseItemName }
    notes.push(`武器类别 ${wt}${baseItemName ? '（baseItem: ' + baseItemName + '）' : ''}`)
  }

  // ── 稀有度（⚠️ weapon 分支也必须处理！）──
  // 实锤（子代理重跑 30 件，3/3 复现）：rarity 原来只加在 buildNonWeapon 里，
  // 武器传 rarity 会被**静默丢弃**——不落库、不报错、verify 还回 verified:true。
  if (typeof a.rarity === 'string' && a.rarity.trim()) {
    sys.rarity = a.rarity.trim()
    notes.push('稀有度 ' + a.rarity.trim())
  }

  // ── 射程（⚠️ 原来硬编码 ranged?'20':'5'，item 级 system.range 完全没写）──
  // 实锤（同上，2/2 复现）：长弓建出来 item 级 range 为空、活动级恒 20ft，都不报错。
  // 现在：传了 rangeValue/rangeLong/rangeUnits 就照传，item 级与活动级一起写。
  const rVal = a.rangeValue === undefined || a.rangeValue === null ? '' : String(a.rangeValue)
  const rLong = a.rangeLong === undefined || a.rangeLong === null ? '' : String(a.rangeLong)
  const rUnits = typeof a.rangeUnits === 'string' && a.rangeUnits.trim() ? a.rangeUnits.trim() : 'ft'
  if (rVal || rLong) {
    sys.range = { value: rVal, long: rLong, units: rUnits, special: '', override: false }
    notes.push(`射程 ${rVal}${rLong ? '/' + rLong : ''} ${rUnits}`)
  }

  const activities: Record<string, unknown> = {}
  const extraDamage = typeof a.extraDamage === 'object' && a.extraDamage !== null
    ? (a.extraDamage as { number?: number; denomination?: number; types?: string[] })
    : undefined
  const attackUpdate: Record<string, unknown> = {
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
    // hasSave 时显式指向豁免活动（主 → 子）；否则写 ""（**midi 对 attack 的原生默认值**）。
    // ⚠️ 2026-09-16 源码核实纠正了本行 2026-09-15 的写法：那时为防「多活动被连带结算」
    //    在无 save 时写死 'none'。但 midi-qol v13 的 `AttackActivity.otherActivity` getter 是
    //        if (otherActivityId === "none" || undefined) return undefined   // ← 先短路
    //        ... 之后才走 ammunitionItem 分支
    //    ⇒ 写 "none" 会**切断弓/弩的弹药链**（弹药自带的自动化伤害活动不再结算）。
    //    纯单活动时 "" 与 "none" 等价（auto 探测排除自身、0 候选），所以保留 "" 更安全。
    // 真要「多活动互不连带」：用 linkedTo 显式串接，或事后 foundry_patch_item 改成
    // otherActivityId:"none"。不必写 otherActivityCompatible —— 显式 ID 时运行期不查它。
    otherActivityId: hasSave ? SAVE_KEY : '',
    // 主攻击活动的 midiProperties（顶层参数，只写显式键）——
    // 例如自动化追击：「命中后追加一发」= 主活动写 triggeredActivityId:"<追击活动id>"，
    // 追击活动（走 activities[] 数组）写 midiProperties:{ automationOnly: true } 免得弹两个。
    ...mpPatch(a.midiProperties),
  }
  if (attackKey) {
    // ⚠️ 2026-09-17 实测否决了「指定主活动键名」这条路（原计划用 mainActivityId）：
    //   · `-=<旧键>` 在这个更新路径上不生效（旧活动键始终还在）
    //   · 传非 16 位键名（strike001）会被 dnd5e 规范化成随机 16 位 id
    //   · 传 16 位键名（abcdef0123456789 / dnd5eactivity001）键名保留，但值是增量对象、
    //     缺 type 等必填 ⇒ 落库后活动类型无效
    //   四组对照实验见 docs/工具反馈-鞘中惊雷.md 第 5 条。
    //   ⇒ 所以主活动只能沿用 Foundry 生成的随机键；要引用它请「先建 → 读键 → 再 update」。
    //     预览里的 mainActivityNote 会说明这一点。
    activities[attackKey] = attackUpdate
    notes.push('攻击字段 merge 进 dnd5e 默认攻击活动（' + attackKey + '）')
    // 主活动 midiProperties 落库校验（2026-09-17 补：原先 12 处透传零覆盖）
    const mpMain = (a.midiProperties ?? {}) as Record<string, unknown>
    if (mpMain && typeof mpMain === 'object' && !Array.isArray(mpMain)) {
      for (const mk of Object.keys(mpMain)) {
        expectFields.push({ path: 'system.activities.' + attackKey + '.midiProperties.' + mk, want: mpMain[mk] })
      }
    }
  } else {
    activities.dnd5eactivity000 = { ...attackUpdate, type: 'attack', name }
    notes.push('无默认攻击活动，新建 dnd5eactivity000')
  }

  // ⚠️ dnd5e 靠 save 活动 effects[0]._id 去物品 effects 数组里取实际效果。
  // 两处各自 ID16() 会得到不同 id → 豁免失败时取不到效果 → 自动化静默失效（不报错、看着全对）。
  // 因此物品级效果与 save 活动必须共用同一个 id。
  const hasEffect = Array.isArray(a.statuses) || (typeof a.overTime === 'string' && a.overTime.trim())
  const effectId = hasEffect ? ID16() : null
  // 时长：不传 = 永久（null）。持续伤害类效果通常由 OverTime 的 saveCount 决定何时结束，
  // 硬编码秒数会让效果中途自己消失（"直到豁免成功"这类需求必须是永久）。
  const durSec = typeof a.durationSeconds === 'number' && Number.isFinite(a.durationSeconds) ? a.durationSeconds : null

  if (hasSave) {
    const sv = a.save as Record<string, unknown>
    const saveAbility = ABILITIES.includes(sv.ability as (typeof ABILITIES)[number]) ? String(sv.ability) : 'con'
    // ⚠️ DC 的 calculation 取值（资料库 + 样本库实测，53 个 spellcasting / 45 个空串 / 2 个 flat）：
    //   ""            → 自定义：用 formula，可写数字（"13"）也可写公式（"8 + @prof + @abilities.dex.mod"）
    //   "spellcasting"→ 跟随使用者的施法 DC（formula 留空）
    //   "flat"        → ⚠️ 资料库两条独立记录称其不合法、formula 会被忽略、DC 丢回默认值；已弃用
    // 实测样本：system.activities.<act>.save.dc.formula = "8 + @prof + @abilities.dex.mod"
    const rawDc = String(sv.dc ?? '').trim()
    const dcObj = rawDc === 'spellcasting'
      ? { calculation: 'spellcasting', formula: '' }
      : { calculation: '', formula: rawDc || '13' }
    activities[SAVE_KEY] = {
      type: 'save', name,
      activation: { type: 'special' },
      save: { ability: [saveAbility], dc: dcObj },
      damage: { onSave: 'none', parts: [], critical: { allow: false } },
      effects: [{ _id: effectId ?? ID16(), onSave: false }],
      // 子活动显式写 "none"：它只被主活动（attack）引用，不该自己再去找绑定对象。
      // 实测 2026-09-16：不写这个字段时 dnd5e 落库是 ""（= midi 的 auto 探测），
      // 意味着子活动也会尝试绑定同 item 上的其它合格活动。save 没有弹药链，写 none 无副作用。
      otherActivityId: 'none',
    }
    notes.push(`命中后触发 ${dcObj.calculation === 'spellcasting' ? '施法' : dcObj.formula} DC ${saveAbility.toUpperCase()} 豁免（${attackKey || 'dnd5eactivity000'}.otherActivityId → ${SAVE_KEY}）`)
  }
  // 武器也能有次数池（样本实证：磁轭手铳 max="@prof"、魔晶石巨剑 max=1、篡位者的死颅 max=1）。
  // 原先武器分支根本不写 sys.uses —— 结果是活动挂了 itemUses 要扣次数，物品却没有次数池可扣。
  const wUses = a.uses && typeof a.uses === 'object' ? (a.uses as Record<string, unknown>) : undefined
  let weaponHasUses = false
  if (wUses && wUses.max !== undefined) {
    const wmax = String(wUses.max)
    sys.uses = { max: wmax, autoDestroy: wUses.autoDestroy === true, spent: 0, recovery: [] }
    weaponHasUses = true
    expectFields.push({ path: 'system.uses.max', want: wmax })
    notes.push('可使用 ' + (wmax === '' ? '∞' : wmax) + ' 次' + (wUses.autoDestroy === true ? '（用尽销毁）' : ''))
  }

  // 价格与重量（13 类通用）
  applyPriceWeight(sys, a, expectFields, notes)

  appendExtraActivities(activities, a.activities, notes, weaponHasUses)
  sys.activities = activities

  const data: Record<string, unknown> = { system: sys }
  if (hasEffect) {
    const changes: unknown[] = []
    // 武器路径没有 changes 参数 → explicitChanges 恒 0 → transfer:false（命中后施加给目标，正确）
    const explicitChanges = 0
    if (typeof a.overTime === 'string' && a.overTime.trim()) {
      changes.push({ key: 'flags.midi-qol.OverTime', mode: 0, priority: 20, value: a.overTime.trim() })
    }
    data.effects = [{
      _id: effectId,
      name: typeof a.effectName === 'string' && a.effectName.trim() ? a.effectName : name,
      img: pickEffectIcon(a),
      // ⚠️ 不要写 origin: null —— 那会**覆盖** dnd5e 本该自动填的来源 uuid，
      // 结果内嵌 AE 的 origin 落成 null（第三方实测报告：工具照样回 verified:true，
      // 用户得再补一次 update 才修好）。不传这个键，让系统自己填。
      type: 'base', system: {},
      changes, disabled: false,
      duration: { seconds: durSec },
      description: '<p></p>', tint: '#ffffff', transfer: explicitChanges > 0,
      statuses: Array.isArray(a.statuses) ? a.statuses : [],
      sort: 0,
      flags: { core: { overlay: false }, dae: { stackable: stackableOf(a) } },
    }]
    notes.push(`物品级效果${Array.isArray(a.statuses) ? '（statuses: ' + (a.statuses as string[]).join(', ') + '）' : ''}${typeof a.overTime === 'string' && a.overTime.trim() ? '（OverTime: ' + a.overTime + '）' : ''}（时长：${durSec === null ? '永久' : durSec + '秒'}，_id 与 save 活动共用 ${String(effectId)}）`)
  }
  return { data, notes, expectInfo: { effectId, hasSave: !!hasSave, hasEffect: !!hasEffect, durSec, expectFields } }
}

export function registerMinimalTools(h: MinimalHelpers, reg: Reg): void {
  reg(h.makeTool('foundry_create_item_minimal',
    '⚠️ **两步走（默认预览，可跳过）**：不带 confirmToken 时**只返回预览、不落库** —— 这是默认动作：把预览里的描述文案 / 数值 / 机制讲给用户听。**用户说「不用看 / 直接建 / 你定」时不要再问**，直接拿预览返回的 confirmToken 立刻调第二次建下去；参数改一个字凭证就失效，会重新回到预览。\n' +
    '省 token 快速建物品（**全类型**）：先 create 最小壳（dnd5e 自己生成默认结构），再 update 只 merge 语义关键字段——AI 只给关键参数，不用手搓完整 JSON，插件也不内置易过时的模板。\n' +
    '**itemType 支持 dnd5e 全部 13 类**（默认 weapon）：weapon 武器 ｜ equipment 护甲/衣物/奇物 ｜ consumable 药水/食物/酒水/卷轴/弹药/毒药 ｜ loot 材料/宝石/杂物 ｜ tool 工具 ｜ container 容器 ｜ feat 特性 ｜ spell 法术 ｜ class 职业 ｜ subclass 子职业 ｜ race 种族 ｜ background 背景 ｜ facility 据点设施。\n' +
    '各类型关键参数：\n' +
    '・weapon：damage{number,denomination,types,bonus,formula} + ability/toHit/ranged/extraDamage + save{ability,dc} + statuses + overTime\n' +
    '・equipment：subtype(light/medium/heavy/shield/clothing/trinket) + armor{value,dex}（dex:null=敏捷不限、0=重甲不加）+ strength + properties(如 ["stealthDisadvantage"])\n' +
    '・consumable：subtype(potion/food/scroll/ammo/poison/wand/rod) + uses{max,autoDestroy} + healing{number,denomination,formula}（药水治疗）或 useFlavor（点使用时弹的文案）\n' +
    '  ⚠️ consumable/tool/feat **只有传了 useFlavor 才会有 utility 活动** —— 不传的话卷轴/弹药/毒药/食物/魔杖建出来「点使用」什么都不会发生（无参数可补救，只能重建或自己补活动）。给了 healing 又给 useFlavor 时**两个活动都建**（治疗 + 弹文案）。\n' +
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
    '・cpr：**CPR（chris-premades）flags**，原样写入 flags["chris-premades"]（填 id 调用 CPR 现成通用特性，或绑自定义宏）。⚠️ 先查 foundry_reference{topic:"cpr"}，别猜键名\n' +
    '⚠️ 实测冷知识：**酒水也是 subtype:"food"**（不是 "drink"）；loot 没有 uses 字段；container 没有 system.type。\n' +
    '⚠️ 动态引用（@ 公式）落点错了会被静默忽略：伤害公式 → damage.formula；DC → save.dc 字符串；被动加值 → changes[].value；OverTime 参数 → overTime 串内；不确定先 foundry_reference{topic:"roll-data"} 查。\n' +
    '典型用法：毒牙 = itemType:"weapon" + damage{number:1,denomination:6,types:["piercing"]} + save{ability:"con",dc:13} + statuses:["poisoned"] + overTime:"turn=start,damageRoll=1d4,damageType=poison,saveDC=13,saveAbility=con,saveCount=1-,label=中毒"。\n' +
    '图标：img/effectImg 强烈建议先用 foundry_search_icon 检索候选自己挑（不传会落兜底图并标 iconSource:"default"）。\n' +
    '返回的 verified 是**真校验结果**（不是硬编码 true）：核对该类型的关键字段是否落库（武器的 save活动effects[0]._id = 物品效果 _id、otherActivityId 指向、伤害骰；护甲的 armor.value/type.value；消耗品的 uses/type.value；容器的 capacity 等）；任一项不过则 verified:false 并附 problems。看到 verified:false 请按 problems 修，不要当成成功交付。\n' +
    '⚠️ **description 必须写全机制，而且按官方排版分段**（**总述一段 + 每个独立效果各自一段**，段间空一行；是自然段不是 markdown 小标题——不要 ##、不要 - 列表、不要加粗条目名当标题，但也**绝不挤成一整坨**；FVTT 里 system.description.value 是 HTML，用多个 <p> 分段）：第 1 段写外观与来历（2~3 句），之后一个独立效果一段、并列项（按钮 1/2/3 那种）各自一段，**每个效果都要交代全 7 件事** —— ①用什么动作 ②什么时候能用 ③距离或范围 ④对抗方式（DC X 的【属性】豁免）⑤结果（失败受 NdM 点【伤害类型】伤害 / 陷入状态 / 成功减半）⑥持续与重试 ⑦充能与恢复。**活动页玩家未必点开，第一次拿到这东西的人只能靠描述知道它能干什么；只写氛围不写机制＝不合格。** 术语用官方译名（豁免 / 一个动作 / 一个附赠动作 / 充能 / 同调 / 黯蚀——不是「暗蚀」），不要写成代码腔。官方实例（王者权杖 11 段）与可套用句式见系统提示的「一之二、物品描述的官方格式」。\n' +
    '⚠️ **「命中 → 豁免失败 → 挂状态/持续伤害」这条链依赖 DAE 模块**：midi-qol 里是 hasActivityEffects = hasDAE(this) && ... ⇒ **没装 DAE（或 DAE 未启用）则物品级效果整段跳过**。使用者若反馈「武器看着没毛病但不中毒/不上状态」，先确认装没装 DAE，别急着改数据。该链还有一条硬约束：save 活动 effects[0]._id 必须等于物品级 effects 的 _id（本工具已强制两处共用同一 id，并在 verify 里核对落库值）。详见 foundry_reference{topic:"daelink"}。\n' +
    '⭐ **midiProperties（midi-qol 活动设置，29 键）**：主活动用顶层 midiProperties，activities[] 里的额外活动用它们自己那份。最常用三个：automationOnly:true（不进「选择活动」弹窗、不能手动掷，只能被自动化 / otherActivityId 调用 —— 「攻击 + 追击」这类同物品多活动时隐藏追击活动的标准姿势）、triggeredActivityId（这次结算完之后**另开一个独立 workflow** 触发它 —— 与 otherActivityId 的「同一次使用连带结算」是两套机制）、identifier（活动别名，只能英文数字破折号下划线，可被 otherActivityId / triggeredActivityId 按名字引用）。完整 29 键语义见 foundry_reference{topic:"midi-properties"}。',
    {
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
      cpr: { type: 'object', description: '【CPR】Cauldron of Plentiful Resources（模块 id chris-premades）的 flags，**原样深合并进 flags["chris-premades"]**。三种形态 —— ①通用特性（填 id 调现成的 44 条）：{ config: { generic: { "<id>": { applied: true, ...字段 } } }, macros: { midi: { item: ["<id>"] } } }；②自定义宏绑定物品：{ info: { identifier: "...", rules: "legacy"|"modern" }, macros: { midi: { item: ["..."] } }, equipment: { identifier: "..." } }；③★嵌入式宏（就地写 JS，不依赖宏对象）：{ embeddedMacros: [ { name: "Poison Tick", type: "midi-item", pass: "rollFinished", priority: 50, macro: "<JS 代码字符串，体内可直接裸用 workflow / effectUtils / rollUtils 等 CPR utils，可 await>" } ] }。⚠️ 嵌入式宏的 type / pass 取值见 foundry_reference{topic:"cpr"} 的事件表（17 类事件、midi-item 的 11 个 pass），别猜；macros.midi.item 填的是【宏名数组】，{pass,macro,priority} 是【宏对象内部】的结构，两者别混。' },
      price: { type: ['number', 'string'], description: '价格数值（**13 类通用**）。落 system.price.value，形如 {value:25,denomination:"gp"}。不传 = 不在卡面标价（建完还得再补一次 update）' },
      priceDenomination: { type: 'string', description: '价格币种，默认 gp（铜币 cp / 银币 sp / 金币 gp / 白金币 pp）' },
      weight: { type: 'number', description: '重量（磅，**13 类通用**）。落 system.weight = {value,units:"lb"}。不传 = 卡面重量空' },
      weightUnits: { type: 'string', description: '重量单位，默认 lb' },
      activities: {
        type: 'array',
        description: '【多活动】**一卡多活动**时用（如双形态武器：斩 attack + 轰 save + 变形 utility）。传了它就在主活动（由顶层参数决定）之外**追加**这些活动，ID 自动从 dnd5eactivity200 起按 100 步进分配。⚠️ 实测教训：本工具原先每类只建 1~2 个活动，遇到多活动直接超纲，AI 只好放弃本工具去手搓 7KB JSON —— 有这个参数就别再手搓了。kind 可选 attack/save/heal/utility/summon/**check**/**damage**（dnd5e 5.3.3 共 12 种活动类型，其余 transform/enchant/cast/forward/order 用不到或属边缘 —— 详见 foundry_reference{topic:"activity-types"}）。check 用 check{ability（单个字符串）,dc}；damage 用 damage{number,denomination,types}，两者都可带 name/activationType。',
        items: {
          type: 'object',
          properties: {
            kind: { type: 'string', enum: ['attack', 'save', 'heal', 'utility', 'summon', 'check', 'damage', 'transform'], description: '活动类型（必填）' },
            name: { type: 'string', description: '活动名（不传就用 kind）' },
            activationType: { type: 'string', description: '激活方式：action/bonus/reaction/special（utility 默认 special，其余默认 action）' },
            damage: { type: 'object', description: '该活动的伤害：attack 走 includeBase+parts（**includeBase 只属于 attack 活动**）；save/damage 走 parts。可给 {number,denomination,types} 或 {formula:"2d6+@mod"}' },
            save: { type: 'object', description: '【save】{ability:"dex", dc:"13" 或 "@attributes.spelldc" 或 "spellcasting"}' },
            onSave: { type: 'string', description: '【save】豁免成功时的伤害处理："none"（默认）/ "half" / "full"' },
            check: { type: 'object', description: '【check】{ability:"str", dc:"13", associated:["stealth"]}。⚠️ **检定公式不存活动里** —— 点按钮时由 dnd5e 核心现算（actor.rollSkill / rollAbility / rollTool）。associated 是关联的技能/工具 id 集合（可留空）。「+X 加值」的落点：tool 物品走 item.system.bonus；角色级走 system.bonuses.abilities.check / .save / .skill；单技能走 system.skills.<key>.bonuses.check。活动层没有公式入口。' },
            healing: { type: 'object', description: '【heal】{number,denomination,bonus,formula,types}。types 是**闭集三键**：healing（治疗，默认）/ temphp（临时生命）/ maximum（提升最大生命）—— 填伤害类型（如 necrotic）无效，治疗语义未定义' },
            useFlavor: { type: 'string', description: '【utility】点「使用」时发到聊天卡的文案' },
            summon: { type: 'object', description: '【summon】{cr,count,types}' },
            transform: { type: 'object', description: '【transform】变身目标（把自己变成另一个 Actor）：{uuid（**必填**，指向 Actor，如 "Actor.xxxx"）, cr（公式字符串）, name, types:["beast"], sizes:["med"], movement:["walk"], levelMin, levelMax, mode:"cr", preset, customize}。levelMin/levelMax 不传 = 任何等级都能用（dnd5e 的 availableProfiles 过滤是 (min ?? -Infinity) <= 等级 <= (max ?? Infinity)）' },
            transformSettings: { type: 'object', description: '【transform】可选，变身时保留/合并哪些东西：{effects,keep,merge,other,spellLists,tempFormula,minimumAC,preset,transformTokens}。**不传 = dnd5e 用默认**（各集合的默认项由 CONFIG.DND5E.transformation 决定，卡面上也能改）' },
            linkedTo: { type: 'string', description: '【主活动用】填**被引用子活动**的 name（或 id），本活动的 otherActivityId 会指向它。方向 = 主 → 子：只有 attack/check/save/utility 能当主；子活动需类型合格（damage/heal/save/check/utility）且 midiProperties.otherActivityCompatible=true 才会被自动探测到。不填则写 none（不绑定）。' },
            rangeUnits: { type: 'string', description: '该活动的射程单位（默认 self）。⚠️ 只给 units 的话 value 是空的 —— 要精确射程请同时给 rangeValue' },
            rangeValue: { type: ['string', 'number'], description: '【该活动】射程数值（如 30 / 60 / 150）。落 activities.<id>.range.value。「穿刺·30 尺线形」这类额外活动必填' },
            target: { type: 'object', description: '【该活动】目标与模板。{template:{type:"line"|"cone"|"sphere"|"cube"|"circle"|"cylinder"|"radius"|"square"|"wall", size, width, height, units:"ft", count, contiguous, stationary}, affects:{type:"creature"|"enemy"|"ally"|"self"|"object"|"space"|"creatureOrObject"|"any"|"willing", count, choice, special}}。⚠️ 9 种 template.type 各自读不同尺寸字段（line 读 size+width、cone 只读 size、sphere 读 size…），完整对照表见 foundry_reference{topic:"item-fields"}' },
            consumes: { type: 'boolean', description: '【该活动】是否消耗物品次数。不传 = 跟物品走（物品有 uses.max 就自动挂 itemUses 每次扣 1；没有就不消耗）。显式传 false = 这个活动不扣次数（多活动里只有部分该扣时用，如「蓄力斩扣次数、追刃不扣」）' },
            concentration: { type: 'boolean', description: '是否需要专注' },
            midiProperties: { type: 'object', description: '【该活动】midi-qol 活动级设置（29 键，**只写你要改的**；不写就整个键不传，走 dnd5e/midi 自己的默认值）。最常用三个：automationOnly:true（不进「选择活动」弹窗、不能手动掷，只能被自动化/otherActivityId 调用 —— 「攻击 + 追击」这类同物品多活动时，隐藏追击活动的标准姿势）；triggeredActivityId:"<另一活动的 id 或 identifier>"（这次结算完之后**另开一个独立 workflow** 触发它 —— 与 otherActivityId 的「同一次使用连带结算」是两套机制）；identifier（活动别名，只能英文数字破折号下划线，可被 otherActivityId / triggeredActivityId 按名字引用）。⚠️ triggeredActivityTargets 七值：self（自己）/ hitTargets（命中的目标，最常用）/ missedTargets（没打中的）/ failedSaves（豁免失败的）/ saveTargets（被要求豁免的）/ targets（最初选中的）/ retarget（重新选目标）。完整 29 键语义见 foundry_reference{topic:"midi-properties"}。' },
          },
          required: ['kind'],
        },
      },
      midiProperties: { type: 'object', description: '【主活动】主活动的 midi-qol 设置（只写要改的键）。⚠️ 只作用于**主活动**；activities[] 数组里的额外活动用它们自己那份。常用配方：主活动 {triggeredActivityId:"dnd5eactivity200"} + 那个追击活动 {automationOnly:true} = 「命中后追加一发」。⚠️ triggeredActivityTargets 七值：self（自己）/ hitTargets（命中的目标，最常用）/ missedTargets（没打中的）/ failedSaves（豁免失败的）/ saveTargets（被要求豁免的）/ targets（最初选中的）/ retarget（重新选目标）。⭐ 主活动的**键名无法预先指定**（Foundry 随机生成；实测传自定义键名会被规范化或落成无效活动）—— 要引用主活动请「先建 → foundry_inspect 读键 → 再 update」。完整 29 键见 foundry_reference{topic:"midi-properties"}。' },
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
        properties: { number: { type: 'number' }, denomination: { type: 'number' }, bonus: { type: 'string' }, formula: { type: 'string', description: '动态治疗公式（可选，支持 @ 引用）' }, types: { type: 'string', enum: ['healing', 'temphp', 'maximum'], description: '治疗类型（默认 healing）：healing 治疗 / temphp 临时生命 / maximum 提升最大生命' } },
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
      stackable: { type: 'string', enum: DAE_STACKABLE, description: 'flags.dae.stackable —— 重复施加的去重策略（默认 noneName = 同 origin+同名替换，即刷新而非叠层）。⚠️ 不写这个键时 DAE 的默认行为是【不去重】，重复命中会叠出多份同名效果；要叠层用 count（名称会变成「名字 (n)」）；挂 statuses 的效果本来就会被忽略（statuses 已存在时 DAE 跳过）' },
      statuses: { type: 'array', items: { type: 'string' }, description: '物品级效果挂的状态 id（如 ["poisoned"]，从 foundry_list_status_effects 拿）' },
      changes: { type: 'array', items: { type: 'object' }, description: '被动自动化改动（可选），如 [{key:"system.attributes.ac.bonus",mode:2,value:"+2",priority:20}]、[{key:"system.bonuses.mwak.damage",mode:2,value:"1d4[fire]"}]' },
      img: { type: 'string', description: '物品图标路径（**强烈建议自己挑**）：建物品前先用 foundry_search_icon{keyword:"hammer"} 检索候选，看一眼返回的列表挑张顺眼的填进来（搜不到就换词根，或加 dir 收窄）。不传 = 落兜底剑图 icons/weapons/swords/sword-guard.webp，返回值会标 iconSource:"default" 提醒你去换。' },
      effectName: { type: 'string', description: '效果名（默认物品名）' },
      effectImg: { type: 'string', description: '效果图标路径（可选）。不传时按 statuses/伤害类型自动选真源 webp（中毒→毒刺、火焰→燃烧、挥砍→血滴等）。⚠️ 不要用 icons/svg/ 那 118 条抽象方块图' },
      overTime: { type: 'string', description: 'midi-qol OverTime 逗号参数串（可选）。saveCount=1- 表示「每回合判定，直到豁免成功才结束」' },
      durationSeconds: { type: 'number', description: '效果时长（秒）。**不传 = 永久**（推荐）：持续伤害类由 OverTime 的 saveCount 决定何时结束，填 60 之类的秒数会让效果中途自己消失' },
      folder: { type: 'string', description: '归档文件夹 uuid（可选，纯 16 位 ID 或 Folder.xxx 均可，自动剥前缀）' },
      preview: { type: 'boolean', description: '试写模式。**现在这已是默认行为** —— 不带有效 confirmToken 时，本工具一律只返回预览、不落库（传不传 preview 都一样）。' },
      confirmToken: { type: 'string', description: '**落库凭证**：上一步预览返回的那个 confirmToken。带上它才会真的创建（不带＝只出预览）；参数与预览时不一致就带不动，会重新回到预览。用户说「直接建」时就用它。' },
    },
    ['name'],
    async (args: Args) => {
      const itemType = ITEM_TYPES.includes(args.itemType as (typeof ITEM_TYPES)[number]) ? String(args.itemType) : 'weapon'

      // 0) 预览优先（2026-09-14 用户定：**默认给你看，可跳过**）
      //    规则：不带 confirmToken（或显式 preview:true）→ 只返回预览、不落库；
      //    带对 confirmToken → 直接建（用户说「不用看 / 直接建」时 AI 自己走完这两步，不打扰他）。
      //    预览时 attackKey 用 'dnd5eactivity000' 占位：create 那一刻 dnd5e 才生成真实键名，
      //    故预览里的活动键名可能与最终值不同（结构、字段、数值都是准的）。
      const argRec = args as Record<string, unknown>
      const givenToken = typeof argRec.confirmToken === 'string' ? argRec.confirmToken : ''
      const expectedToken = confirmTokenFor(argRec)
      if (argRec.preview === true || givenToken === '' || givenToken !== expectedToken) {
        const { data: pvData, notes: pvNotes } = buildUpdateData(args, 'dnd5eactivity000', itemType)
        const pvAsRec = pvData as Record<string, unknown>
        const pvMem = (pvAsRec.system ?? {}) as Record<string, unknown>
        const pvImg = pickItemIcon(args)
        const pvWarn: string[] = []
        if (!(typeof args.img === 'string' && args.img.trim())) {
          pvWarn.push('你没给 img —— 预览里用的是兜底剑图 ' + pvImg + '。真建之前建议先 foundry_search_icon 挑一张贴切的。')
        }
        if (itemType === 'weapon' && !(typeof args.weaponType === 'string' && args.weaponType.trim()) && !(typeof args.baseItem === 'string' && args.baseItem.trim())) {
          pvWarn.push('武器没给 weaponType/baseItem —— dnd5e 会落默认 simpleM（简单近战）。远程武器务必给 weaponType:"martialR"，否则长弓会变成近战武器。')
        }
        // ⚠️ ActiveEffect 挂在**文档顶层** effects，不在 system 里（实测 dump：顶层键 = system, effects）
        const pvEffects = Array.isArray(pvAsRec.effects) ? (pvAsRec.effects as Array<Record<string, unknown>>) : []
        if (pvEffects.length > 0) {
          const e0 = pvEffects[0] ?? {}
          pvWarn.push('物品级效果 transfer=' + String(e0.transfer) + '（true=装备即生效的被动加值；false=被使用时施加给目标）。传了 changes 才会是 true。')
        }
        return {
          preview: true,
          nothingWritten: true,
          confirmToken: expectedToken,
          wouldCreate: { name: args.name, type: itemType, img: pvImg, folder: stripFolder(args.folder) ?? null },
          wouldUpdate: h.normalizeDocIds(pvData).doc,
          card: {
            name: args.name, itemType,
            img: pvImg,
            systemType: (pvMem.type ?? null) as unknown,
            damage: (pvMem.damage ?? null) as unknown,
            rarity: pvMem.rarity ?? null,
            activities: Object.keys((pvMem.activities ?? {}) as Record<string, unknown>),
            effects: pvEffects.map((e) => ({ name: e.name ?? null, transfer: e.transfer ?? null, statuses: e.statuses ?? null, img: e.img ?? null, changes: e.changes ?? null })),
            description: String(((pvMem.description as Record<string, unknown>) ?? {}).value ?? ''),
          },
          notes: pvNotes,
          warnings: pvWarn,
          mainActivityNote: itemType === 'weapon'
            ? 'card.activities 里列出的键 = 预览态键名。⚠️ 主攻击活动的**真实键名由 Foundry 创建时随机生成**（预览里的 dnd5eactivity000 只是占位）—— **无法预先指定**（实测：传自定义键名会被规范化或落成无效活动）。要让 triggeredActivityId / otherActivityId 指向主活动，只能「先建 → 用 foundry_inspect 读键 → 再 update」；额外活动的键是可预测的（dnd5eactivity200 / 300 …），可以直接引用。'
            : 'card.activities 里列出的键就是最终键名（主活动固定 dnd5eactivity000；与 heal 并存时 utility 用 dnd5eactivity100）。',
          hint: '这是**预览**，世界里什么都没变。把 card / notes 的内容讲给用户听 —— 尤其 description（描述文案）与 damage / save 数值、warnings 里的提醒。用户说「可以」→ 带 confirmToken 原样调第二次建下去；**用户说「不用看 / 直接建」→ 立刻带 confirmToken 建，不要再问**；用户说「改一下」→ 改参数重新出预览。',
        }
      }

      // 1) create 最小壳：dnd5e 自己生成默认结构（自动适配系统版本）
      const created = (await h.callRelay('POST', '/create', {
        query: h.targetingQuery(args),
        body: { entityType: 'Item', data: { name: args.name, type: itemType, img: pickItemIcon(args) }, folder: stripFolder(args.folder) },
      })) as Record<string, unknown>
      const createdEntity = unwrapEntity(created)
      const uuid = (createdEntity?._id as string) || String(created.uuid ?? (created.data as Record<string, unknown>)?.uuid ?? '').replace(/^(Item\.)?/, '')
      const attackKey = getDefaultAttackKey(createdEntity)

      // 2) update 只 merge 语义关键字段
      const { data, notes, expectInfo } = buildUpdateData(args, attackKey, itemType)
      // ⚠️ 内嵌 ActiveEffect 的 origin 必须显式写成 `Item.<自身id>`：
      // dnd5e 在 create 最小壳那一刻物品还没有 id，不会自动填 —— 实测落库就是 null
      //（第三方报告 #2：工具照样回 verified:true，用户得再补一次 update 才修好）。
      // update 阶段 uuid 已经有了，这里一次补齐，省掉「建完还要手动补一刀」。
      // 格式依据：样本库 171 处世界内物品效果全是 "origin": "Item.<itemId>"
      //（如 lib/samples/01-武器与攻击/fvtt-Item-锋锐巨剑-+3-EZVu11cOT8Z4pjyt.json:7）。
      const dataAsRec = data as Record<string, unknown>
      if (Array.isArray(dataAsRec.effects)) {
        for (const e of dataAsRec.effects as Array<Record<string, unknown>>) {
          if (e && typeof e === 'object') e.origin = 'Item.' + uuid
        }
      }
      // CPR（Cauldron of Plentiful Resources / 模块 id chris-premades）flags 透传：
      // 用户给什么就原样深合并进 flags["chris-premades"]，本工具不解释内容
      // —— CPR 的 schema 随版本变，写法见 foundry_reference{topic:"cpr"}。
      const cprGiven = (args as Record<string, unknown>).cpr
      if (cprGiven && typeof cprGiven === 'object' && !Array.isArray(cprGiven) && Object.keys(cprGiven as object).length > 0) {
        const fl = (dataAsRec.flags as Record<string, unknown>) ?? {}
        const prev = (fl['chris-premades'] as Record<string, unknown>) ?? {}
        fl['chris-premades'] = { ...prev, ...(cprGiven as Record<string, unknown>) }
        dataAsRec.flags = fl
        notes.push('CPR flags 已写入 flags.chris-premades')
      }
      const { doc: updData } = h.normalizeDocIds(data)
      await h.callRelay('PUT', '/update', {
        query: { ...h.targetingQuery(args), uuid: 'Item.' + uuid },
        body: { data: updData },
      })

      // 3) 读回验证：真比对，不是把字段抄回来就算过（曾因「硬编码 verified:true」交付过坏武器）
      const argAny = args as Record<string, unknown>
      const problems: string[] = []
      let verify: Record<string, unknown> = {}
      try {
        await new Promise((r) => setTimeout(r, 1500))
        const raw = (await h.callRelay('GET', '/get', { query: { ...h.targetingQuery(args), uuid: 'Item.' + uuid } })) as Record<string, unknown>
        const got = unwrapEntity(raw)
        const sys = (got?.system ?? {}) as Record<string, unknown>
        const acts = (sys.activities ?? {}) as Record<string, unknown>
        const attackAct = Object.values(acts).find((x) => (x as Record<string, unknown>)?.type === 'attack') as Record<string, unknown> | undefined
        const saveAct = Object.values(acts).find((x) => (x as Record<string, unknown>)?.type === 'save') as Record<string, unknown> | undefined
        const itemEffects = Array.isArray(got?.effects) ? (got.effects as Record<string, unknown>[]) : []
        const itemImg = String(got?.img ?? '')
        if (itemImg.includes('/svg/')) problems.push(`物品图标仍是 svg（${itemImg}）—— 期望真源 webp 图`)
        const effectImgGot = String(itemEffects[0]?.img ?? '')
        if (expectInfo.hasEffect && effectImgGot.includes('/svg/')) problems.push(`效果图标仍是 svg（${effectImgGot}）—— 期望真源 webp 图`)
        const saveEffId = Array.isArray(saveAct?.effects) ? (saveAct!.effects as Record<string, unknown>[])[0]?._id : undefined
        const itemEffId = itemEffects[0]?._id
        const dmgBase = ((sys.damage as Record<string, unknown>)?.base ?? {}) as Record<string, unknown>

        if (itemType === 'weapon') {
          if (argAny.damage && !dmgBase.denomination) problems.push('伤害骰 damage.base 未落库')
          if (expectInfo.hasSave) {
            if (!saveAct) problems.push('save 活动未落库')
            else {
              if (saveEffId !== itemEffId) {
                problems.push(`save活动 effects[0]._id(${String(saveEffId)}) ≠ 物品效果 _id(${String(itemEffId)}) → 豁免失败取不到效果，自动化会静默失效`)
              }
              if (attackAct && attackAct.otherActivityId !== saveAct._id) {
                problems.push(`攻击活动 otherActivityId(${String(attackAct.otherActivityId)}) 未指向 save 活动(${String(saveAct._id)})`)
              }
            }
          }
        } else {
          // 非武器：逐条核对该类型“必须有”的字段
          for (const ef of expectInfo.expectFields) {
            if (ef.want === undefined || ef.want === null || ef.want === '') continue
            const gotVal = readPath(got, ef.path)
            if (gotVal === undefined) problems.push(`${ef.path} 未落库（期望 ${JSON.stringify(ef.want)}）—— 该键名可能不被 dnd5e 接受，或被系统清洗`)
            else if (String(gotVal) !== String(ef.want)) problems.push(`${ef.path} = ${JSON.stringify(gotVal)}，期望 ${JSON.stringify(ef.want)}（被 dnd5e 改写或清洗）`)
          }
        }
        if (expectInfo.hasEffect && itemEffects.length === 0) problems.push('物品级效果未落库')
        // 多活动共存时的 midi 串接提示（**不是错误，是 midi 的原生行为**）：
        // attack 的 otherActivityId 原生默认就是 ""（auto 探测），同 item 上存在其它
        // 「类型合格 + otherActivityCompatible=true」的活动时会被自动绑到这次攻击上。
        // ⚠️ 别再用 "none" 一刀切 —— 见 MIDI_ORIGINAL_OTHER_ID 注释：写死 "none" 会切断
        //    弓弩的弹药链。要各活动独立，用 linkedTo 显式串接，或事后 patch 成 "none"。
        const actEntries = Object.entries(acts)
        if (actEntries.length >= 2) {
          for (const [k, v] of actEntries) {
            const av = (v ?? {}) as Record<string, unknown>
            if (av.otherActivityId === '' && String(av.type) === 'attack') {
              // ⚠️ 这是**提示**不是错误 —— 塞进 problems 会让一个完全正常的物品被判 verified:false，
              //    实测踩过（2026-09-16 验证脚本 ③ 用例）。midi 原生默认就是这个行为。
              notes.push(
                `提示：活动 ${k}(attack) 的 otherActivityId 是空串 = midi 原生 auto 探测。同 item 上还有 ${actEntries.length - 1} 个活动，点这次攻击时 midi 可能连带结算它们（这是它的默认行为，不是 bug）。若要各活动独立：用 linkedTo 显式串接子活动，或 foundry_patch_item{activityPatch:{"${k}":{"otherActivityId":"none"}}}（注意 none 会同时切断弓弩的弹药链）`,
              )
            }
          }
        }
        // 内嵌效果 origin 是溯源用的：空着会让「这个效果来自哪件物品」断链（第三方报告 #2）。
        if (itemEffects.length > 0 && !itemEffects[0]?.origin) {
          problems.push(`内嵌效果 origin 为空（应为 Item.${uuid}）`)
        }

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
          saveDc: saveAct ? (saveAct.save as Record<string, unknown>)?.dc : undefined,
          saveActivityEffectId: saveEffId,
          itemEffectId: itemEffId,
          effectDuration: itemEffects[0]?.duration,
          activityType: readPath(got, 'system.activities.dnd5eactivity000.type'),
          img: itemImg,
          effectImg: effectImgGot,
          problems,
        }
      } catch {
        problems.push('读回校验超时/失败（写入已返回成功，但未能核对落库）')
        verify = { note: 'read-back failed' }
      }

      const iconGiven = typeof args.img === 'string' && args.img.trim().length > 0
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
      }
    },
  ))

  reg(h.makeTool('foundry_patch_item',
    '改造一个**已有物品**：删活动 / 改活动字段 / 挂物品宏 / 合并任意 flags —— 一次调用完成，**不用写 execute_js**。\n' +
    '**为什么有这个工具**：实测 AI 在做双形态武器那次会话里调了 **20 次 execute_js**，干的全是这些事（克隆、删活动、改 flags、挂宏）——既危险（能碰任意世界数据）又容易撞 relay 的 24 条 forbidden-patterns 黑名单（那次撞了 2 次）。\n' +
    '**挂物品宏会自动写全三处**（少写一处就静默不触发，这是最常见的坑）：\n' +
    '  ① `flags["midi-qol"].onUseMacroName = "[<macroPass>]ItemMacro"`\n' +
    '  ② `flags.itemacro.macro = {name,type:"script",scope,command}`\n' +
    '  ③ `flags.dae.macro = {name,type:"script",scope,command}`\n' +
    '**删活动**用 removeActivities（内部走 dnd5e 的 `-=` 合并写法，实测生效）。\n' +
    '支持**内嵌物品 uuid**（`Actor.<actorId>.Item.<itemId>`）—— 改角色身上那件时用它；改世界模板对已 give 出去的副本**没有影响**（give 是复制一份）。\n' +
    '写完会**回读校验**，返回 verified + problems（不是硬编码 true）。',
    {
      uuid: { type: 'string', description: '物品 uuid（Item.xxx 或内嵌 Actor.<actorId>.Item.<itemId>）' },
      removeActivities: { type: 'array', items: { type: 'string' }, description: '要删除的活动 id 数组，如 ["dnd5eactivity001","dnd5eactivity002"]' },
      activityPatch: { type: 'object', description: '按活动 id 合并字段，如 {"dnd5eactivity000": {"otherActivityId": "dnd5eactivity100"}}' },
      macroPass: { type: 'string', description: "物品宏触发时机（给了它才挂宏）。常用：postActiveEffects / preItemRoll / postAttackRoll / preDamageRoll / postDamageRoll / preCheckHits / isDamaged / isHealed。⚠️ 别自己拼 '[pass]ItemMacro' 串——本工具按物品级写法组装，AE 级逗号式在 midi 13.0.55 实测不触发" },
      macroName: { type: 'string', description: '宏名（不传 = 物品名 + "·宏"）' },
      macroCommand: { type: 'string', description: '宏代码（函数体，可直接用 token/game/MidiQOL/args 等；⚠️ 勿用 JSON.stringify(token)）' },
      macroScope: { type: 'string', description: "'global'（默认）或 'actor'" },
      onUseMacroName: { type: 'string', description: '高级用法：直接覆盖 flags["midi-qol"].onUseMacroName 原串（传了就忽略 macroPass）' },
      flags: { type: 'object', description: '要合并的任意 flags —— **深合并**：只覆盖你给的那几个叶子键，同层其他键保持原值（例：给 {"autoanimations":{"sound":{"volume":0.5}}} 只改音量，不会把同层的 video / dbSection / menu 冲掉；**不需要先读全量再整体重写**）。AA 动画挂 {"autoanimations": {...}}；CPR 用 {"chris-premades": {...}}（先查 foundry_reference{topic:"cpr"}）' },
      unsetFlags: { type: 'array', items: { type: 'string' }, description: '要删除的 flags 点号路径，如 ["midi-qol.onUseMacroName","dae.macro"]' },
    },
    ['uuid'],
    async (args: Args) => {
      const uuid = String(args.uuid ?? '').trim()
      if (!uuid) return { error: 'uuid 必填' }
      const fullUuid = uuid.startsWith('Actor.') ? uuid : uuid.startsWith('Item.') ? uuid : 'Item.' + uuid
      const notes: string[] = []

      const sysPatch: Record<string, unknown> = {}
      if (Array.isArray(args.removeActivities) && args.removeActivities.length) {
        const acts: Record<string, unknown> = {}
        for (const id of args.removeActivities as unknown[]) {
          if (typeof id === 'string' && id.trim()) acts['-=' + id.trim()] = null
        }
        if (Object.keys(acts).length) {
          sysPatch.activities = acts
          notes.push('删除活动 ' + (args.removeActivities as unknown[]).join(', '))
        }
      }
      if (args.activityPatch && typeof args.activityPatch === 'object') {
        const prev = (sysPatch.activities ?? {}) as Record<string, unknown>
        for (const [id, val] of Object.entries(args.activityPatch as Record<string, unknown>)) {
          prev[id] = val
        }
        sysPatch.activities = prev
        notes.push('活动字段 merge：' + Object.keys(args.activityPatch as Record<string, unknown>).join(', '))
      }

      // ── 物品宏三件套 ──
      const flagPatch: Record<string, unknown> = {}
      const rawOnUse = typeof args.onUseMacroName === 'string' && args.onUseMacroName.trim() ? args.onUseMacroName.trim() : ''
      const pass = typeof args.macroPass === 'string' && args.macroPass.trim() ? args.macroPass.trim() : ''
      if (pass || rawOnUse) {
        const cmd = typeof args.macroCommand === 'string' ? args.macroCommand : ''
        if (!cmd.trim() && !rawOnUse) {
          return { error: '挂了 macroPass 但没给 macroCommand —— 宏体为空不会做任何事' }
        }
        const mName = typeof args.macroName === 'string' && args.macroName.trim() ? args.macroName.trim() : '未命名宏'
        const mScope = typeof args.macroScope === 'string' && args.macroScope.trim() ? args.macroScope.trim() : 'global'
        const onUse = rawOnUse || `[${pass.replace(/^\[|\]$/g, '')}]ItemMacro`
        flagPatch['midi-qol'] = { onUseMacroName: onUse }
        const macroObj = { name: mName, type: 'script', scope: mScope, command: cmd }
        flagPatch.itemacro = { macro: macroObj }
        flagPatch.dae = { macro: macroObj }
        notes.push(`物品宏：onUseMacroName="${onUse}" + itemacro.macro + dae.macro（三处同写，名 "${mName}"，scope ${mScope}）`)
      }
      if (args.flags && typeof args.flags === 'object' && !Array.isArray(args.flags)) {
        for (const [k, v] of Object.entries(args.flags as Record<string, unknown>)) {
          if (v && typeof v === 'object' && !Array.isArray(v) && flagPatch[k] && typeof flagPatch[k] === 'object') {
            flagPatch[k] = { ...(flagPatch[k] as Record<string, unknown>), ...(v as Record<string, unknown>) }
          } else {
            flagPatch[k] = v
          }
        }
        notes.push('合并 flags：' + Object.keys(args.flags as Record<string, unknown>).join(', '))
      }
      if (Array.isArray(args.unsetFlags) && args.unsetFlags.length) {
        for (const path of args.unsetFlags as unknown[]) {
          if (typeof path !== 'string' || !path.trim()) continue
          const parts = path.trim().split('.')
          let cur = flagPatch
          for (let i = 0; i < parts.length - 1; i++) {
            const k = parts[i]
            if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}
            cur = cur[k] as Record<string, unknown>
          }
          cur['-=' + parts[parts.length - 1]] = null
        }
        notes.push('删除 flags：' + (args.unsetFlags as unknown[]).join(', '))
      }

      if (!Object.keys(sysPatch).length && !Object.keys(flagPatch).length) {
        return { error: '没有任何要改的东西 —— 至少给 removeActivities / activityPatch / macroPass / flags / unsetFlags 之一' }
      }

      const data: Record<string, unknown> = {}
      if (Object.keys(sysPatch).length) data.system = sysPatch
      if (Object.keys(flagPatch).length) data.flags = flagPatch

      await h.callRelay('PUT', '/update', {
        query: { ...h.targetingQuery(args), uuid: fullUuid },
        body: { data },
      })

      // ── 回读校验（真比对）──
      const problems: string[] = []
      let verify: Record<string, unknown> = {}
      try {
        await new Promise((r) => setTimeout(r, 1500))
        const raw = (await h.callRelay('GET', '/get', { query: { ...h.targetingQuery(args), uuid: fullUuid } })) as Record<string, unknown>
        const got = unwrapEntity(raw)
        const acts = ((got?.system as Record<string, unknown>)?.activities ?? {}) as Record<string, unknown>
        const gFlags = (got?.flags ?? {}) as Record<string, unknown>
        const midi = (gFlags['midi-qol'] ?? {}) as Record<string, unknown>
        const itemacro = (gFlags.itemacro ?? {}) as Record<string, unknown>
        const dae = (gFlags.dae ?? {}) as Record<string, unknown>

        if (Array.isArray(args.removeActivities)) {
          for (const id of args.removeActivities as unknown[]) {
            if (typeof id === 'string' && acts[id]) problems.push(`活动 ${id} 仍在（未被删除）`)
          }
        }
        if (pass || rawOnUse) {
          const wantOnUse = rawOnUse || `[${pass.replace(/^\[|\]$/g, '')}]ItemMacro`
          if (String(midi.onUseMacroName ?? '') !== wantOnUse) {
            problems.push(`flags["midi-qol"].onUseMacroName = ${JSON.stringify(midi.onUseMacroName)}，期望 ${JSON.stringify(wantOnUse)}`)
          }
          const ia = (itemacro.macro ?? {}) as Record<string, unknown>
          if (!ia.command) problems.push('flags.itemacro.macro.command 未落库 → ItemMacro 取不到宏体')
          const dm = (dae.macro ?? {}) as Record<string, unknown>
          if (!dm.command) problems.push('flags.dae.macro.command 未落库')
        }
        for (const path of (Array.isArray(args.unsetFlags) ? (args.unsetFlags as string[]) : [])) {
          let cur: unknown = gFlags
          for (const seg of path.split('.')) cur = (cur as Record<string, unknown> | undefined)?.[seg]
          if (cur !== undefined) problems.push(`flags.${path} 仍存在（未删除）`)
        }
        verify = {
          activityIds: Object.keys(acts),
          activityTypes: Object.fromEntries(Object.entries(acts).map(([k, v]) => [k, (v as Record<string, unknown>)?.type])),
          onUseMacroName: midi.onUseMacroName,
          itemacroHasCommand: !!(itemacro.macro as Record<string, unknown> | undefined)?.command,
          daeHasCommand: !!(dae.macro as Record<string, unknown> | undefined)?.command,
          flagScopes: Object.keys(gFlags),
          problems,
        }
      } catch {
        problems.push('读回校验超时/失败（写入已返回成功，但未能核对落库）')
        verify = { note: 'read-back failed' }
      }

      return {
        uuid: fullUuid,
        verified: problems.length === 0,
        notes,
        verify,
        note: (problems.length ? '⚠️ 未通过校验：' + problems.join('；') + '。' : '改动已确认落库。')
          + (notes.length ? ' ' + notes.join('；') : ''),
      }
    },
  ))
}
