/**
 * tools-extra.ts —— dsh-foundry-vtt 全量工具补齐（第二批）。
 *
 * 一次性把 ThreeHats relay openapi.json（106 端点）中所有「游戏操作面」端点包成 DSH 工具：
 * dnd5e 系统操作 / 遭遇与回合 / 场景与画布 / 聊天 / 用户管理 / 宏与 JS / 文件 / 声音与播放列表 / 世界信息。
 *
 * 明确不包（有意为之）：
 * - /auth/key-request* 4 个：API key 管理属于运维面，不给 AI。
 * - subscribe 类 6 个 SSE 流（/actor /scene /chat /rolls /encounters /hooks）：监听能力用户已明确砍掉（指令驱动模式）。
 * - /contents/{path}：openapi 标注 deprecated。
 * - /session /start-session /end-session /session-handshake：headless puppeteer 无头会话，
 *   与本地 GM 浏览器架构冲突且需要加密口令，包了只会让 AI 误用。
 * - /scene/image /scene/image/raw /sheet：返回图片二进制，插件 fetch 走 JSON 解析会炸，暂不包。
 * - /download：默认二进制流，同上。
 */

export interface ExtraHelpers {
  makeTool: (
    name: string,
    desc: string,
    props: Record<string, unknown>,
    required: string[],
    execute: (args: Record<string, unknown>) => Promise<unknown>,
  ) => { name: string }
  callRelay: (method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, opts?: Record<string, unknown>) => Promise<unknown>
  asObject: (v: unknown) => Record<string, unknown>
  targetingQuery: (args: Record<string, unknown>) => Record<string, unknown>
}

type Reg = (t: { name: string }) => void
type Args = Record<string, unknown>

/**
 * relay 端的 forbidden-patterns 黑名单 —— 逐条抄自 relay 源码
 * `go-relay/internal/handler/helpers/validation.go:7-32` 的 `forbiddenPatterns`（共 24 条）。
 *
 * ⚠️ 关键事实（决定了这条预检非做不可）：relay 是**拿正则扫整个脚本文本**，
 * 不做语法分析、也不看上下文 —— 所以这些词**出现在注释、字符串、甚至变量名里一样会被拒**。
 * 实测：AI 在注释里写 "globalThis" 解释用法，整段脚本直接被
 * `HTTP 400 {"error":"Script contains forbidden patterns"}` 挡下，且**不告诉你是哪个词**。
 * 提交前先在本地扫一遍，把「撞墙 → 自己猜哪句话坏了」变成一条可读的提示。
 */
const FORBIDDEN_PATTERNS: Array<[string, RegExp]> = [
  ['localStorage', /localStorage/],
  ['sessionStorage', /sessionStorage/],
  ['document.cookie', /document\.cookie/],
  ['eval(', /eval\(/],
  ['new Worker(', /new Worker\(/],
  ['new SharedWorker(', /new SharedWorker\(/],
  ['__proto__', /__proto__/],
  ['atob(', /atob\(/],
  ['btoa(', /btoa\(/],
  ['crypto.', /crypto\./],
  ['Intl.', /Intl\./],
  ['postMessage(', /postMessage\(/],
  ['XMLHttpRequest', /XMLHttpRequest/],
  ['importScripts(', /importScripts\(/],
  ['apiKey', /apiKey/],
  ['privateKey', /privateKey/],
  ['password', /password/],
  ['Function(', /Function\(/],
  ['Function.constructor', /Function\.constructor/],
  ['globalThis', /globalThis/],
  ['game.settings.set', /game\.settings\.set/],
  ['Reflect.', /Reflect\./],
  ['Proxy', /Proxy/],
  ['import(', /import\(/],
]

/** 逐行扫脚本，返回命中的黑名单项（含行号与那一行原文，方便直接改）。 */
function scanForbidden(script: string): Array<{ pattern: string; line: number; text: string }> {
  const hits: Array<{ pattern: string; line: number; text: string }> = []
  const lines = script.split('\n')
  for (let i = 0; i < lines.length; i++) {
    for (const [label, re] of FORBIDDEN_PATTERNS) {
      if (re.test(lines[i])) hits.push({ pattern: label, line: i + 1, text: lines[i].trim().slice(0, 160) })
    }
  }
  return hits
}

function bodyOf(args: Args, keys: string[]): Record<string, unknown> {
  const b: Record<string, unknown> = {}
  for (const k of keys) if (args[k] !== undefined) b[k] = args[k]
  return b
}

/** 一键工具构造：POST 走 body、GET/DELETE 走 query、path 参数替换、输出包 asObject。 */
function simple(
  h: ExtraHelpers,
  name: string,
  desc: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  props: Record<string, unknown>,
  required: string[],
  bodyKeys: string[] = [],
  queryKeys: string[] = [],
  pathKeys: string[] = [],
) {
  return h.makeTool(name, desc, props, required, async (args: Args) => {
    let p = path
    for (const k of pathKeys) {
      if (args[k] !== undefined) p = p.replace('{' + k + '}', encodeURIComponent(String(args[k])))
    }
    const query: Record<string, unknown> = { ...h.targetingQuery(args) }
    for (const k of queryKeys) if (args[k] !== undefined) query[k] = args[k]
    const opts: Record<string, unknown> = { query }
    if (bodyKeys.length > 0) opts.body = bodyOf(args, bodyKeys)
    return h.asObject(await h.callRelay(method, p, opts))
  })
}

const P_actorActorName = {
  actorUuid: { type: 'string', description: '目标 actor 的 uuid' },
  actorName: { type: 'string', description: '目标 actor 的名字（与 actorUuid 二选一）' },
}
const P_adv = {
  advantage: { type: 'boolean', description: '优势掷骰' },
  disadvantage: { type: 'boolean', description: '劣势掷骰' },
  bonus: { type: 'string', description: '额外加值公式（如 "1d4" 或 "+2"）' },
  createChatMessage: { type: 'boolean', description: '是否发送到聊天窗（默认 true）' },
}
const P_item = {
  itemUuid: { type: 'string', description: '物品的 uuid（与 itemName 二选一）' },
  itemName: { type: 'string', description: '物品的名字（与 itemUuid 二选一）' },
}

export function registerExtraTools(h: ExtraHelpers, reg: Reg): void {
  // ═══ dnd5e 系统操作（21 工具）═══════════════════════════════════
  reg(simple(h, 'foundry_dnd5e_ability_check',
    '为 actor 掷属性检定（POST /dnd5e/ability-check）。ability 用缩写 str/dex/con/int/wis/cha；advantage/disadvantage 二选一；bonus 为额外加值公式。',
    'POST', '/dnd5e/ability-check',
    { actorUuid: { type: 'string', description: 'actor 的 uuid' }, ability: { type: 'string', enum: ['str', 'dex', 'con', 'int', 'wis', 'cha'], description: '属性缩写' }, ...P_adv },
    ['actorUuid', 'ability'],
    ['actorUuid', 'ability', 'advantage', 'disadvantage', 'bonus', 'createChatMessage']))

  reg(simple(h, 'foundry_dnd5e_ability_save',
    '为 actor 掷属性豁免（POST /dnd5e/ability-save）。ability 用缩写 str/dex/con/int/wis/cha。',
    'POST', '/dnd5e/ability-save',
    { actorUuid: { type: 'string', description: 'actor 的 uuid' }, ability: { type: 'string', enum: ['str', 'dex', 'con', 'int', 'wis', 'cha'], description: '属性缩写' }, ...P_adv },
    ['actorUuid', 'ability'],
    ['actorUuid', 'ability', 'advantage', 'disadvantage', 'bonus', 'createChatMessage']))

  reg(simple(h, 'foundry_dnd5e_skill_check',
    '为 actor 掷技能检定（POST /dnd5e/skill-check）。skill 用 dnd5e 技能缩写（如 acr/ath/ste/prc/ins/per）。',
    'POST', '/dnd5e/skill-check',
    { actorUuid: { type: 'string', description: 'actor 的 uuid' }, skill: { type: 'string', description: '技能缩写（acr/ath/ste/prc/ins/per 等）' }, ...P_adv },
    ['actorUuid', 'skill'],
    ['actorUuid', 'skill', 'advantage', 'disadvantage', 'bonus', 'createChatMessage']))

  reg(simple(h, 'foundry_dnd5e_death_save',
    '为 actor 掷死亡豁免（POST /dnd5e/death-save），自动累计成功/失败次数。',
    'POST', '/dnd5e/death-save',
    { actorUuid: { type: 'string', description: 'actor 的 uuid' }, advantage: { type: 'boolean', description: '优势' }, createChatMessage: { type: 'boolean', description: '是否发聊天窗（默认 true）' } },
    ['actorUuid'],
    ['actorUuid', 'advantage', 'createChatMessage']))

  reg(simple(h, 'foundry_dnd5e_concentration_save',
    '为 actor 掷专注豁免（POST /dnd5e/concentration-save），伤害数值用于计算 DC（DC=max(10, 伤害/2 向下取整)）。失败自动打断专注。',
    'POST', '/dnd5e/concentration-save',
    { ...P_actorActorName, damage: { type: 'number', description: '受到的伤害值（算 DC 用）' }, advantage: { type: 'boolean', description: '优势' }, disadvantage: { type: 'boolean', description: '劣势' }, bonus: { type: 'string', description: '额外加值公式' }, createChatMessage: { type: 'boolean', description: '是否发聊天窗（默认 true）' } },
    ['damage'],
    ['actorUuid', 'actorName', 'damage', 'advantage', 'disadvantage', 'bonus', 'createChatMessage']))

  reg(simple(h, 'foundry_dnd5e_concentration',
    '查 actor 当前是否在专注某个法术（GET /dnd5e/concentration），返回专注的法术信息。',
    'GET', '/dnd5e/concentration',
    { ...P_actorActorName }, [],
    [], ['actorUuid', 'actorName']))

  reg(simple(h, 'foundry_dnd5e_break_concentration',
    '主动打断 actor 的专注（POST /dnd5e/break-concentration）。',
    'POST', '/dnd5e/break-concentration',
    { ...P_actorActorName }, [],
    ['actorUuid', 'actorName']))

  reg(simple(h, 'foundry_dnd5e_get_actor_details',
    '读取 dnd5e actor 的详细信息（GET /dnd5e/get-actor-details）。details 为详情类型数组，如 ["resources","items","spells","features","prof"]——按需组合。',
    'GET', '/dnd5e/get-actor-details',
    { actorUuid: { type: 'string', description: 'actor 的 uuid' }, details: { type: 'array', items: { type: 'string' }, description: '详情类型数组（resources/items/spells/features/prof 等）' } },
    ['actorUuid', 'details'],
    [], ['actorUuid', 'details']))

  const useBodyKeys = ['actorUuid', 'abilityUuid', 'abilityName', 'itemUuid', 'itemName', 'targetUuid', 'targetName']
  const useProps = {
    actorUuid: { type: 'string', description: 'actor 的 uuid' },
    abilityUuid: { type: 'string', description: '能力/物品/法术/特性的 uuid。**模块端必填：与 abilityName 二选一——只传 itemName 会报 "abilityUuid or abilityName is required"**' },
    abilityName: { type: 'string', description: '能力/物品/法术/特性的名字（与 uuid 二选一）' },
    itemUuid: { type: 'string', description: '物品的 uuid（同时支持，模块端自动取认识的键）' },
    itemName: { type: 'string', description: '物品的名字（同时支持）' },
    targetUuid: { type: 'string', description: '目标的 uuid（可选）' },
    targetName: { type: 'string', description: '目标的名字（可选）' },
  }
  reg(simple(h, 'foundry_dnd5e_use_item',
    '让 actor 使用一个物品（POST /dnd5e/use-item）：消耗/使用效果、自动扣充能、掷物品相关伤害。**必须传 abilityUuid 或 abilityName（只传 itemName 会被模块拒："abilityUuid or abilityName is required"）**；itemUuid/itemName 会一并透传，但模块端只认 abilityUuid/abilityName 这两个键。',
    'POST', '/dnd5e/use-item',
    { ...useProps }, ['actorUuid'], useBodyKeys))

  reg(simple(h, 'foundry_dnd5e_use_spell',
    '让 actor 施放一个法术（POST /dnd5e/use-spell）：自动消耗法术位、放置模板、掷伤害。',
    'POST', '/dnd5e/use-spell',
    { ...useProps }, ['actorUuid'], useBodyKeys))

  reg(simple(h, 'foundry_dnd5e_use_feature',
    '让 actor 使用一个职业/种族特性（POST /dnd5e/use-feature）：自动扣使用次数、应用效果。',
    'POST', '/dnd5e/use-feature',
    { ...useProps }, ['actorUuid'], useBodyKeys))

  reg(simple(h, 'foundry_dnd5e_use_ability',
    '让 actor 使用一个通用能力条目（POST /dnd5e/use-ability）。',
    'POST', '/dnd5e/use-ability',
    { ...useProps }, ['actorUuid'], useBodyKeys))

  reg(simple(h, 'foundry_dnd5e_equip_item',
    '装备/卸下 actor 的物品（POST /dnd5e/equip-item）。equipped=true 装备、false 卸下；自动联动 AC/伤害/熟练。',
    'POST', '/dnd5e/equip-item',
    { ...P_actorActorName, ...P_item, equipped: { type: 'boolean', description: 'true 装备 / false 卸下' } },
    ['equipped'],
    ['actorUuid', 'actorName', 'itemUuid', 'itemName', 'equipped']))

  reg(simple(h, 'foundry_dnd5e_attune_item',
    '调谐/取消调谐物品（POST /dnd5e/attune-item）。attuned=true 调谐、false 取消。',
    'POST', '/dnd5e/attune-item',
    { ...P_actorActorName, ...P_item, attuned: { type: 'boolean', description: 'true 调谐 / false 取消调谐' } },
    ['attuned'],
    ['actorUuid', 'actorName', 'itemUuid', 'itemName', 'attuned']))

  reg(simple(h, 'foundry_dnd5e_prepare_spell',
    '准备/取消准备法术（POST /dnd5e/prepare-spell）。spellName 为法术名，prepared=true 准备。',
    'POST', '/dnd5e/prepare-spell',
    { actorUuid: { type: 'string', description: 'actor 的 uuid' }, spellName: { type: 'string', description: '法术名' }, prepared: { type: 'boolean', description: 'true 准备 / false 取消' } },
    ['actorUuid', 'spellName', 'prepared'],
    ['actorUuid', 'spellName', 'prepared']))

  reg(simple(h, 'foundry_dnd5e_long_rest',
    '为 actor 执行长休（POST /dnd5e/long-rest）：回满 HP/恢复法术位/恢复特性。newDay 默认 true（换天）。',
    'POST', '/dnd5e/long-rest',
    { ...P_actorActorName, selected: { type: 'boolean', description: '作用于当前选中的 token' }, newDay: { type: 'boolean', description: '是否算新的一天（默认 true）' } },
    [],
    ['actorUuid', 'actorName', 'selected', 'newDay']))

  reg(simple(h, 'foundry_dnd5e_short_rest',
    '为 actor 执行短休（POST /dnd5e/short-rest）：可自动花生命骰回血（autoHD + autoHDThreshold 0-1）。',
    'POST', '/dnd5e/short-rest',
    { ...P_actorActorName, selected: { type: 'boolean', description: '作用于当前选中的 token' }, autoHD: { type: 'boolean', description: '自动花生命骰' }, autoHDThreshold: { type: 'number', description: '低于该 HP 比例（0-1）自动花骰' } },
    [],
    ['actorUuid', 'actorName', 'selected', 'autoHD', 'autoHDThreshold']))

  reg(simple(h, 'foundry_dnd5e_modify_currency',
    '增减 actor 的钱币（POST /dnd5e/modify-currency，delta 式）。currency 用 pp/gp/ep/sp/cp；amount 正数加、负数减。',
    'POST', '/dnd5e/modify-currency',
    { actorUuid: { type: 'string', description: 'actor 的 uuid' }, currency: { type: 'string', enum: ['pp', 'gp', 'ep', 'sp', 'cp'], description: '钱币面额' }, amount: { type: 'number', description: '增减数量（正加负减）' } },
    ['actorUuid', 'currency', 'amount'],
    ['actorUuid', 'currency', 'amount']))

  reg(simple(h, 'foundry_dnd5e_transfer_currency',
    '两个 actor 之间转移钱币（POST /dnd5e/transfer-currency）。currency 为对象如 {"gp":10,"sp":5}，从 source 转到 target。',
    'POST', '/dnd5e/transfer-currency',
    {
      sourceActorUuid: { type: 'string', description: '出钱的 actor uuid（与 name 二选一）' },
      sourceActorName: { type: 'string', description: '出钱的 actor 名' },
      targetActorUuid: { type: 'string', description: '收钱的 actor uuid（与 name 二选一）' },
      targetActorName: { type: 'string', description: '收钱的 actor 名' },
      currency: { type: 'object', description: '面额对象 {"pp":n,"gp":n,"ep":n,"sp":n,"cp":n}' },
    },
    ['currency'],
    ['sourceActorUuid', 'sourceActorName', 'targetActorUuid', 'targetActorName', 'currency']))

  reg(simple(h, 'foundry_dnd5e_modify_experience',
    '增减 actor 的经验值（POST /dnd5e/modify-experience）。amount 可正可负。',
    'POST', '/dnd5e/modify-experience',
    { ...P_actorActorName, selected: { type: 'boolean', description: '作用于当前选中的 token' }, amount: { type: 'number', description: '增减经验值（可负数）' } },
    ['amount'],
    ['actorUuid', 'actorName', 'selected', 'amount']))

  reg(simple(h, 'foundry_dnd5e_modify_item_charges',
    '增减 actor 某物品的充能次数（POST /dnd5e/modify-item-charges）。amount 正加负减。',
    'POST', '/dnd5e/modify-item-charges',
    { actorUuid: { type: 'string', description: 'actor 的 uuid' }, ...P_item, amount: { type: 'number', description: '增减充能数（正加负减）' } },
    ['actorUuid', 'amount'],
    ['actorUuid', 'itemUuid', 'itemName', 'amount']))

  // ═══ 遭遇与回合（9 工具）════════════════════════════════════════
  reg(simple(h, 'foundry_encounter_list',
    '列出当前进行中的战斗遭遇（GET /encounters），含回合数/当前回合/参战者与先攻顺序。',
    'GET', '/encounters', {}, [], [], []))

  reg(simple(h, 'foundry_encounter_start',
    '开始一场新的战斗遭遇（POST /start-encounter）。tokens 为 token uuid 数组；startWithSelected=true 用当前选中的 token；rollAll/rollNPC 自动掷先攻。',
    'POST', '/start-encounter',
    {
      name: { type: 'string', description: '遭遇名' },
      tokens: { type: 'array', items: { type: 'string' }, description: '参战 token 的 uuid 数组' },
      startWithPlayers: { type: 'boolean', description: '把玩家 token 也加入' },
      startWithSelected: { type: 'boolean', description: '用当前选中的 token 开局' },
      rollAll: { type: 'boolean', description: '为所有参战者掷先攻' },
      rollNPC: { type: 'boolean', description: '只为 NPC 掷先攻' },
    },
    [],
    ['name', 'tokens', 'startWithPlayers', 'startWithSelected', 'rollAll', 'rollNPC']))

  reg(simple(h, 'foundry_encounter_end',
    '结束当前战斗遭遇（POST /end-encounter）。encounter 缺省=当前遭遇。',
    'POST', '/end-encounter',
    { encounter: { type: 'string', description: '遭遇 id（缺省=当前遭遇）' } },
    [],
    ['encounter']))

  reg(simple(h, 'foundry_encounter_add',
    '把 token 加入当前遭遇（POST /add-to-encounter）。uuids 为 token uuid 数组；rollInitiative 加入即掷先攻。',
    'POST', '/add-to-encounter',
    { uuids: { type: 'array', items: { type: 'string' }, description: 'token uuid 数组' }, selected: { type: 'boolean', description: '加入当前选中的 token' }, encounter: { type: 'string', description: '遭遇 id（缺省=当前）' }, rollInitiative: { type: 'boolean', description: '加入后掷先攻' } },
    [],
    ['uuids', 'selected', 'encounter', 'rollInitiative']))

  reg(simple(h, 'foundry_encounter_remove',
    '把 token 移出当前遭遇（POST /remove-from-encounter）。',
    'POST', '/remove-from-encounter',
    { uuids: { type: 'array', items: { type: 'string' }, description: 'token uuid 数组' }, selected: { type: 'boolean', description: '移出当前选中的 token' }, encounter: { type: 'string', description: '遭遇 id（缺省=当前）' } },
    [],
    ['uuids', 'selected', 'encounter']))

  const P_enc = { encounter: { type: 'string', description: '遭遇 id（缺省=当前遭遇）' } }
  reg(simple(h, 'foundry_encounter_next_turn', '战斗推进到下一个回合（POST /next-turn）。', 'POST', '/next-turn', { ...P_enc }, [], ['encounter']))
  reg(simple(h, 'foundry_encounter_last_turn', '战斗回退到上一个回合（POST /last-turn）。', 'POST', '/last-turn', { ...P_enc }, [], ['encounter']))
  reg(simple(h, 'foundry_encounter_next_round', '战斗推进到下一轮（POST /next-round）。', 'POST', '/next-round', { ...P_enc }, [], ['encounter']))
  reg(simple(h, 'foundry_encounter_last_round', '战斗回退到上一轮（POST /last-round）。', 'POST', '/last-round', { ...P_enc }, [], ['encounter']))

  // ═══ 场景与画布（11 工具）═══════════════════════════════════════
  reg(simple(h, 'foundry_scene_create',
    '新建一个场景（POST /scene）。data 为场景文档对象 {name,width,height,grid:{size},background:{src} 等}。',
    'POST', '/scene',
    { data: { type: 'object', description: '场景数据对象（name/width/height/grid/background 等）' } },
    ['data'],
    ['data']))

  reg(simple(h, 'foundry_scene_update',
    '更新场景（PUT /scene）。sceneId/name 二选一定位；data 为要改的字段。',
    'PUT', '/scene',
    { sceneId: { type: 'string', description: '场景 id' }, name: { type: 'string', description: '场景名' }, active: { type: 'boolean', description: '直接指向激活场景' }, data: { type: 'object', description: '要更新的字段对象' } },
    ['data'],
    ['sceneId', 'name', 'active', 'data']))

  reg(simple(h, 'foundry_scene_delete',
    '⚠️ 删除场景（DELETE /scene，不可逆）。sceneId/name 二选一。删除前必须与用户确认。',
    'DELETE', '/scene',
    { sceneId: { type: 'string', description: '场景 id' }, name: { type: 'string', description: '场景名' } },
    [],
    [], ['sceneId', 'name']))

  reg(simple(h, 'foundry_scene_switch',
    '切换当前激活场景（POST /switch-scene）。sceneId/name 二选一。这是把玩家/GM 视图切到某张地图的操作。',
    'POST', '/switch-scene',
    { sceneId: { type: 'string', description: '要激活的场景 id' }, name: { type: 'string', description: '要激活的场景名' } },
    [],
    ['sceneId', 'name']))

  const DOC_TYPES = ['tokens', 'tiles', 'drawings', 'lights', 'sounds', 'notes', 'templates', 'walls', 'regions']
  const P_docType = { documentType: { type: 'string', enum: DOC_TYPES, description: '画布文档类型：' + DOC_TYPES.join('/') } }
  reg(simple(h, 'foundry_canvas_get',
    '读画布上的内嵌文档（GET /canvas/{documentType}）：tokens 读 token 列表、walls 读墙、lights 读光源、drawings/notes/tiles/sounds 同理。sceneId 缺省=激活场景。',
    'GET', '/canvas/{documentType}',
    { ...P_docType, sceneId: { type: 'string', description: '场景 id（缺省=激活场景）' }, documentId: { type: 'string', description: '指定文档 id（缺省=全部）' } },
    ['documentType'],
    [], ['sceneId', 'documentId'], ['documentType']))

  reg(simple(h, 'foundry_canvas_create',
    '在画布上创建内嵌文档（POST /canvas/{documentType}）。data 为该文档类型的数据对象（token 用 {x,y,actorId,...}、墙用 {c:[x1,y1,x2,y2],...}）。sceneId 缺省=激活场景。',
    'POST', '/canvas/{documentType}',
    { ...P_docType, data: { type: 'object', description: '文档数据对象' }, sceneId: { type: 'string', description: '场景 id（缺省=激活场景）' } },
    ['documentType', 'data'],
    ['data', 'sceneId'], [], ['documentType']))

  reg(simple(h, 'foundry_canvas_update',
    '更新画布内嵌文档（PUT /canvas/{documentType}）。documentId 为文档 id，data 为要改的字段。',
    'PUT', '/canvas/{documentType}',
    { ...P_docType, documentId: { type: 'string', description: '文档 id' }, data: { type: 'object', description: '要更新的字段' }, sceneId: { type: 'string', description: '场景 id（缺省=激活场景）' } },
    ['documentType', 'documentId', 'data'],
    ['documentId', 'data', 'sceneId'], ['documentId', 'sceneId'], ['documentType']))

  reg(simple(h, 'foundry_canvas_delete',
    '⚠️ 删除画布内嵌文档（DELETE /canvas/{documentType}，不可逆）。删除前与用户确认。',
    'DELETE', '/canvas/{documentType}',
    { ...P_docType, documentId: { type: 'string', description: '文档 id' }, sceneId: { type: 'string', description: '场景 id（缺省=激活场景）' } },
    ['documentType', 'documentId'],
    [], ['documentId', 'sceneId'], ['documentType']))

  reg(simple(h, 'foundry_measure_distance',
    '测量两点/两个 token 之间的距离（GET /measure-distance）。坐标对（originX/Y 与 targetX/Y）或 token 对（uuid/name）二选一。',
    'GET', '/measure-distance',
    {
      originX: { type: 'number', description: '起点 x' }, originY: { type: 'number', description: '起点 y' },
      targetX: { type: 'number', description: '终点 x' }, targetY: { type: 'number', description: '终点 y' },
      originUuid: { type: 'string', description: '起点 token uuid' }, originName: { type: 'string', description: '起点 token 名' },
      targetUuid: { type: 'string', description: '终点 token uuid' }, targetName: { type: 'string', description: '终点 token 名' },
      sceneId: { type: 'string', description: '场景 id（缺省=激活场景）' },
    },
    [],
    [], ['originX', 'originY', 'targetX', 'targetY', 'originUuid', 'originName', 'targetUuid', 'targetName', 'sceneId']))

  reg(simple(h, 'foundry_select',
    '选中画布上的 token（POST /select）。uuids 数组、name 名、all 全选、data 按数据匹配（如 {"attributes.hp.value":20}）。',
    'POST', '/select',
    { uuids: { type: 'array', items: { type: 'string' }, description: '要选中的 uuid 数组' }, name: { type: 'string', description: '按名字选中' }, all: { type: 'boolean', description: '全选' }, overwrite: { type: 'boolean', description: '覆盖现有选择' }, data: { type: 'object', description: '按数据匹配选择' } },
    [],
    ['uuids', 'name', 'all', 'overwrite', 'data']))

  reg(simple(h, 'foundry_get_selected',
    '读取画布上当前选中的 token（GET /selected）。',
    'GET', '/selected', {}, [], [], []))

  // ═══ 聊天（4 工具）══════════════════════════════════════════════
  reg(simple(h, 'foundry_chat_send',
    '发送聊天消息（POST /chat）。content 支持 HTML；speaker 传 actor id 会以该角色名义说话；whisper 传用户 id 数组则私聊；chatType：0=OOC 1=IC 2=Emote 3=Whisper 4=Roll。',
    'POST', '/chat',
    {
      content: { type: 'string', description: '消息内容（支持 HTML）' },
      flavor: { type: 'string', description: '风味文字（显示在消息上方）' },
      speaker: { type: 'string', description: '说话者 actor id' },
      whisper: { type: 'array', items: { type: 'string' }, description: '私聊用户 id 数组' },
      alias: { type: 'string', description: '说话者显示名' },
      chatType: { type: 'number', description: '0=OOC 1=IC 2=Emote 3=Whisper 4=Roll' },
    },
    ['content'],
    ['content', 'flavor', 'speaker', 'whisper', 'alias', 'chatType']))

  reg(simple(h, 'foundry_chat_get',
    '读聊天记录（GET /chat）。limit 条数（默认 10）、offset 翻页、chatType 过滤类型、speaker 过滤说话者。',
    'GET', '/chat',
    { limit: { type: 'number', description: '条数（默认 10）' }, offset: { type: 'number', description: '翻页偏移' }, chatType: { type: 'number', description: '0=OOC 1=IC 2=Emote 3=Whisper 4=Roll' }, speaker: { type: 'string', description: '按说话者过滤' } },
    [],
    [], ['limit', 'offset', 'chatType', 'speaker']))

  reg(simple(h, 'foundry_chat_clear',
    '⚠️ 清空全部聊天消息（DELETE /chat，不可逆）。执行前与用户确认。',
    'DELETE', '/chat', {}, [], [], []))

  reg(simple(h, 'foundry_chat_delete',
    '删除单条聊天消息（DELETE /chat/{messageId}）。messageId 从 foundry_chat_get 结果里拿。',
    'DELETE', '/chat/{messageId}',
    { messageId: { type: 'string', description: '要删的消息 id' } },
    ['messageId'],
    [], [], ['messageId']))

  // ═══ 用户管理（5 工具）═════════════════════════════════════════
  reg(simple(h, 'foundry_user_list', '列出世界全部用户（GET /users）：id/名字/角色/在线状态/颜色。', 'GET', '/users', {}, [], [], []))
  reg(simple(h, 'foundry_user_get', '按 id 或名字查单个用户（GET /user）。', 'GET', '/user',
    { id: { type: 'string', description: '用户 id' }, name: { type: 'string', description: '用户名' } },
    [], [], ['id', 'name']))
  reg(simple(h, 'foundry_user_create',
    '新建用户（POST /user）。role：0=无 1=玩家 2=可信 3=助理 4=GM（默认 1）。password 可选。',
    'POST', '/user',
    { name: { type: 'string', description: '用户名' }, password: { type: 'string', description: '密码（可选）' }, role: { type: 'number', description: '0=无 1=玩家 2=可信 3=助理 4=GM' } },
    ['name'],
    ['name', 'password', 'role']))
  reg(simple(h, 'foundry_user_update',
    '更新用户（PUT /user）。id/name 二选一定位；data 为要改的字段 {name,role,password,color,avatar,...}。',
    'PUT', '/user',
    { id: { type: 'string', description: '用户 id' }, name: { type: 'string', description: '用户名' }, data: { type: 'object', description: '要更新的字段对象' } },
    ['data'],
    ['id', 'name', 'data'], ['id', 'name']))
  reg(simple(h, 'foundry_user_delete',
    '⚠️ 删除用户（DELETE /user，不可逆）。删除前与用户确认。',
    'DELETE', '/user',
    { id: { type: 'string', description: '用户 id' }, name: { type: 'string', description: '用户名' } },
    [], [], ['id', 'name']))

  // ═══ 宏与 JS / 结构（4 工具）═══════════════════════════════════
  reg(simple(h, 'foundry_macro_list', '列出世界全部宏（GET /macros），返回 uuid/名字。', 'GET', '/macros', {}, [], [], []))
  reg(simple(h, 'foundry_macro_execute',
    '执行一个宏（POST /macro/{uuid}/execute）。uuid 从 foundry_macro_list 拿；args 为传给宏的参数对象。',
    'POST', '/macro/{uuid}/execute',
    { uuid: { type: 'string', description: '宏的 uuid' }, args: { type: 'object', description: '传给宏的参数对象（可选）' } },
    ['uuid'],
    ['args'], [], ['uuid']))
  reg(h.makeTool('foundry_execute_js',
    '⚠️ 在世界内直接执行 JavaScript（POST /execute-js）。这是最高权限的底层操作：可读写世界任意数据、可调用任何 Foundry API，返回任意 JSON。\n' +
    '**本工具会先在本地做 forbidden-patterns 预检**（relay 源码 `helpers/validation.go` 的 24 条正则）。命中就不提交，直接返回命中的词 + 行号。\n' +
    '⚠️ **relay 是拿正则扫整个脚本文本，不做语法分析** —— 这些词**写在注释、字符串、变量名里一样会被拒**，且 relay 的报错只说 `Script contains forbidden patterns`、**不告诉你是哪个词**。\n' +
    '24 条黑名单：localStorage / sessionStorage / document.cookie / eval( / new Worker( / new SharedWorker( / __proto__ / atob( / btoa( / crypto. / Intl. / postMessage( / XMLHttpRequest / importScripts( / apiKey / privateKey / password / Function( / Function.constructor / globalThis / game.settings.set / Reflect. / Proxy / import(\n' +
    '**尤其注意 `Proxy` 与 `import(` 是子串匹配** —— 任何含 "Proxy" 的单词（如 ProxyToken、proxyConfig）、任何 `import(` 写法（含 `importScripts(` 之外的正则/字符串）都会中招。躲坑写法：不要在注释里解释这些词，用「该 API」之类替代。\n' +
    '**可用性取决于世界设置**：REST API 模块设置里若没开，会返回 400 "execute-js is disabled in REST API module settings. A GM must enable it to allow JavaScript execution."；开着则正常返回结果（实测有的世界是开着的）。所以：**可以直接试一次**，别因为描述里写着「默认禁用」就放弃——但报上面那条 400 就说明该世界没开，改用专用工具。\n' +
    '优先用专用工具（foundry_update_entity 支持内嵌物品 uuid Actor.<actorId>.Item.<itemId>，可直接改 actor 身上物品的 system/effects；改物品自动化特性通常不需要 execute_js）。真正的用途是**查专用工具拿不到的运行时值**：如 save.dc 算出来的 dc.value（普通 GET /get 看不到）、token texture 是否有效、某个 flag 的真实解析结果。写脚本前先想清楚后果。\n' +
    '**报错排查**：若返回 `Error executing script: <某处的> is not a function` 之类 —— 多半是假设了字段类型（实测踩过 `(p.types || []).join is not a function`，因为 types 是对象不是数组）。先在脚本里 `return { 探到的值: typeof 某字段, 样例: 某字段 }` 探一次真实形状，再写正式逻辑；不要在类型不明时直接 .join()/.map()。',
    { script: { type: 'string', description: '要执行的 JavaScript 代码（会先过 24 条 forbidden-patterns 预检，命中则不提交并回报行号）' } },
    [],
    async (args: Args) => {
      const script = typeof args.script === 'string' ? args.script : ''
      if (!script.trim()) return { error: 'script 为空' }
      const hits = scanForbidden(script)
      if (hits.length) {
        return {
          blocked: true,
          submitted: false,
          note:
            '⚠️ 脚本**未提交**：它会命中 relay 的 forbidden-patterns 校验，必然返回 400 "Script contains forbidden patterns"。' +
            '请按下面的行号改掉这些词后重试（**注释里的也算** —— relay 用正则扫全文，不做语法分析）。',
          hits,
          allPatterns: FORBIDDEN_PATTERNS.map((p) => p[0]),
          scriptLines: script.split('\n').length,
        }
      }
      try {
        return h.asObject(await h.callRelay('POST', '/execute-js', { body: { script } }))
      } catch (e) {
        // 2026-09-14 第三方复检提的最后一条：execute_js 报错既无行号也无上下文 ——
        // 它跑了 27 行脚本，收到一句 "Unexpected token 'return'"，只能逐行找。
        // 这里把脚本行号化并从报错文本里尽量解析出行号，只回出错行附近的窗口（长脚本不至于撑爆上下文）。
        const msg = e instanceof Error ? e.message : String(e)
        const lines = script.split('\n')
        const suspects: number[] = []
        const re = /(?:\bline\s+(\d{1,4})\b|:(\d{1,4}):\d{1,4}\b)/gi
        let m: RegExpExecArray | null
        while ((m = re.exec(msg)) !== null) {
          const n = Number(m[1] ?? m[2])
          if (n >= 1 && n <= lines.length && !suspects.includes(n)) suspects.push(n)
        }
        // relay 的报错**不带行号**，但 "Unexpected token 'X'" 这条可以反查：X 就是脚本里出现过的一个词。
        // 实测（2026-09-14，直连世界验过）：`const a = 1 +\nreturn a` 与 `const a = (1 + 2\nreturn a`
        // 都报 "Unexpected token 'return'"，而 `const a = 1\nreturn a` 是**成功返回 1** 的 ——
        // 说明 return 本身合法（relay 把脚本当函数体跑），真凶是它**上一行**没写完。
        // 所以这里把「出现该词的行」和「它的上一行」一起标出来。
        const tk = /Unexpected token '([^']+)'/.exec(msg)
        if (tk && suspects.length === 0) {
          const word = tk[1]
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].indexOf(word) >= 0) {
              if (!suspects.includes(i + 1)) suspects.push(i + 1)
              if (i > 0 && !suspects.includes(i)) suspects.push(i)
              break
            }
          }
        }
        const win = 25
        const focus = suspects.length ? suspects[0] : 1
        const from = Math.max(1, focus - win)
        const to = Math.min(lines.length, focus + win)
        const numbered: string[] = []
        for (let i = from; i <= to; i++) {
          numbered.push(String(i).padStart(4, ' ') + ' | ' + lines[i - 1] + (suspects.includes(i) ? '   <-- 报错指向这里' : ''))
        }
        const hints: string[] = []
        if (/is not a function/.test(msg)) {
          hints.push('多半是把字段类型想错了（实测踩过 `(p.types || []).join is not a function` —— types 是对象不是数组）。先在脚本里 `return { 探到的值: typeof 某字段, 样例: 某字段 }` 探一次真实形状，再写正式逻辑。')
        }
        if (/Unexpected token|SyntaxError|Invalid or unexpected token/.test(msg)) {
          hints.push('语法错。⚠️ **实测纠正**：报 `Unexpected token \'return\'` 时，问题几乎不在 return —— return 本身是合法的（relay 把脚本当函数体执行），是**它上一行**没写完，解析器才一路撞到 return。真凶通常是：缺右括号、缺操作数（`1 +` 这种末尾悬空）、字符串/引号没闭合、对象字面量缺逗号。先看标出来的第一处嫌疑行的**上一行**。')
        }
        if (/is not defined|not defined|Cannot read propert/.test(msg)) {
          hints.push('变量/属性不存在或为 undefined：世界里的字段名可能与预期不同，先用 typeof 探。')
        }
        if (/disabled in REST API module settings/.test(msg)) {
          hints.push('这个世界没开 execute-js（要在 REST API 模块设置里由 GM 开启）—— 改用专用工具，别在脚本里绕。')
        }
        return {
          error: true,
          message: msg,
          scriptLines: lines.length,
          suspectLines: suspects,
          shownRange: from + '-' + to + '（共 ' + lines.length + ' 行）',
          numberedScript: numbered.join('\n'),
          hints,
          note: '⚠️ 脚本**已提交**但执行失败。下面是带行号的脚本原文' +
            (suspects.length ? '，报错指向的行已标出' : '（报错里没给出行号，从第 1 行给起）') +
            '。读懂再改，不要整段重贴重试。',
        }
      }
    }))
  reg(h.makeTool('foundry_structure',
    '读世界目录结构（GET /structure）：文件夹树与实体清单。types 可逗号分隔过滤（Scene/Actor/Item/JournalEntry/RollTable/Cards/Macro/Playlist）；recursive 递归子目录。\n' +
    '⚠️ **这个工具很容易一次吐出几 MB**（compendium 包会被全量带出，实测单次 3.88 MB，直接撑爆结果被截断落盘）。所以：\n' +
    '① **要查某类实体就一定给 types**（如 types:"Actor" 或 "Item,Scene"）；\n' +
    '② 要进某个文件夹就给 path（Folder id，从 foundry_get_folder 拿）；\n' +
    '③ **不传 recursive 就不递归**，别习惯性开递归；\n' +
    '④ **只想拿几个 uuid 时不要用它** —— 用 foundry_search（按名字）或 foundry_get_folder。\n' +
    '⚠️ 实测提醒：**path / types 的过滤未必生效**（relay 端可能忽略它们，传了仍返回整棵树）。所以别指望靠参数收窄体积——拿到结果后自己挑需要的那部分。',
    {
      types: { type: 'string', description: '类型过滤，逗号分隔（强烈建议给，如 "Actor" / "Item,Scene"）——不给会把 compendium 全量带出，单次可能几 MB' },
      path: { type: 'string', description: '起始路径（文件夹 id；不给=整棵树）' },
      recursive: { type: 'boolean', description: '递归读取（默认不开；开了体积会显著变大）' },
      recursiveDepth: { type: 'number', description: '递归深度（默认 5）' },
      includeEntityData: { type: 'boolean', description: '含完整实体数据（**慎用**，会极大膨胀结果）' },
    },
    [],
    async (args: Args) => {
      const query: Record<string, unknown> = { ...h.targetingQuery(args) }
      for (const k of ['types', 'path', 'recursive', 'recursiveDepth', 'includeEntityData']) {
        if (args[k] !== undefined) query[k] = args[k]
      }
      const out = h.asObject(await h.callRelay('GET', '/structure', { query }))
      if (args.types === undefined && args.path === undefined) {
        return {
          ...out,
          warning: '⚠️ 这次既没给 types 也没给 path —— 返回的是整个世界目录树（含 compendium），体积可能达数 MB。下次请用 types 或 path 限定范围。',
        }
      }
      return out
    }))

  // ═══ 文件（2 工具）══════════════════════════════════════════════
  reg(simple(h, 'foundry_file_system',
    '浏览 Foundry 文件系统（GET /file-system）。source 目录源（data/systems/modules 等）；path 相对路径；recursive 递归列子目录。',
    'GET', '/file-system',
    { path: { type: 'string', description: '相对路径' }, source: { type: 'string', description: '目录源（data/systems/modules 等）' }, recursive: { type: 'boolean', description: '递归列子目录' } },
    [],
    [], ['path', 'source', 'recursive']))
  reg(simple(h, 'foundry_file_upload',
    '上传文件到 Foundry（POST /upload）。fileData 为 base64 编码的文件内容；source/path 定位目录；filename 目标文件名；overwrite 覆盖同名。',
    'POST', '/upload',
    { fileData: { type: 'string', description: 'base64 编码的文件数据' }, filename: { type: 'string', description: '目标文件名' }, path: { type: 'string', description: '目标目录' }, source: { type: 'string', description: '目录源（data 等）' }, mimeType: { type: 'string', description: 'MIME 类型' }, overwrite: { type: 'boolean', description: '覆盖同名文件' } },
    [],
    ['fileData', 'filename', 'path', 'source', 'mimeType', 'overwrite']))

  // ═══ 声音与播放列表（7 工具）═══════════════════════════════════
  reg(simple(h, 'foundry_playlist_list', '列出全部播放列表（GET /playlists）。', 'GET', '/playlists', {}, [], [], []))
  const P_pl = {
    playlistId: { type: 'string', description: '播放列表 id（与 name 二选一）' },
    playlistName: { type: 'string', description: '播放列表名（与 id 二选一）' },
  }
  reg(simple(h, 'foundry_playlist_play',
    '播放播放列表或其中某条音轨（POST /playlist/play）。soundId/soundName 指定单曲，缺省播整表。',
    'POST', '/playlist/play',
    { ...P_pl, soundId: { type: 'string', description: '音轨 id' }, soundName: { type: 'string', description: '音轨名' } },
    [],
    ['playlistId', 'playlistName', 'soundId', 'soundName']))
  reg(simple(h, 'foundry_playlist_stop', '停止播放列表（POST /playlist/stop）。', 'POST', '/playlist/stop', { ...P_pl }, [], ['playlistId', 'playlistName']))
  reg(simple(h, 'foundry_playlist_next', '跳到播放列表下一曲（POST /playlist/next）。', 'POST', '/playlist/next', { ...P_pl }, [], ['playlistId', 'playlistName']))
  reg(simple(h, 'foundry_playlist_volume',
    '设置播放列表音量（POST /playlist/volume）。volume 0.0-1.0；可指定单曲 soundId。',
    'POST', '/playlist/volume',
    { ...P_pl, soundId: { type: 'string', description: '音轨 id（可选）' }, soundName: { type: 'string', description: '音轨名（可选）' }, volume: { type: 'number', description: '音量 0.0-1.0' } },
    ['volume'],
    ['playlistId', 'playlistName', 'soundId', 'soundName', 'volume']))
  reg(simple(h, 'foundry_play_sound',
    '播放一次性音效（POST /play-sound）。src 为音频路径（如 "sounds/effect.mp3"）；volume 0-1；loop 循环。',
    'POST', '/play-sound',
    { src: { type: 'string', description: '音频文件路径' }, volume: { type: 'number', description: '音量 0-1（默认 0.5）' }, loop: { type: 'boolean', description: '循环播放' } },
    ['src'],
    ['src', 'volume', 'loop']))
  reg(simple(h, 'foundry_stop_sound',
    '停止音效（POST /stop-sound）。src 缺省=停止全部。',
    'POST', '/stop-sound',
    { src: { type: 'string', description: '要停的音频路径（缺省=全部）' } },
    [],
    ['src']))

  // ═══ 世界信息 / 其他（3 工具）══════════════════════════════════
  // ⚠️ 默认裁掉已装模块清单：第三方实测反馈「foundry_world_info 每次吐回全量模块（实测 204 个），
  // 这一轮我就为它烧掉一大块上下文」。常用的只有世界名 / 系统版本 / Foundry 版本。
  reg(h.makeTool(
    'foundry_world_info',
    '读世界综合信息（GET /world-info）：世界名/系统版本/Foundry 版本/玩家列表等。⚠️ 已装模块清单**默认省略**（实测 204 个，体积很大）——确实需要完整清单时传 includeModules:true。',
    { includeModules: { type: 'boolean', description: '是否返回完整已装模块清单（默认 false，只回 moduleCount 与提示）' } },
    [],
    async (args: Args) => {
      const obj = h.asObject(await h.callRelay('GET', '/world-info', { query: {} }))
      const mods = obj.modules
      if (args.includeModules !== true && Array.isArray(mods)) {
        obj.moduleCount = mods.length
        delete obj.modules
        obj.modulesHint = `已装 ${mods.length} 个模块，清单已省略；需要完整清单传 includeModules:true`
      }
      return obj
    },
  ))
  reg(simple(h, 'foundry_get_folder',
    '按名字查文件夹（GET /get-folder），返回文件夹 uuid（建实体时 folder 参数用）。',
    'GET', '/get-folder',
    { name: { type: 'string', description: '文件夹名' } },
    ['name'],
    [], ['name']))
  reg(simple(h, 'foundry_player_list',
    '列出玩家/用户简表（GET /players）。',
    'GET', '/players', {}, [], [], []))

  // ═══ 动画/音效检索（2026-09-17 新增，对标 foundry_search_icon）══════════
  // 起因（实测事故）：AI 给武器配了 AA 动画却没配声音，只写了 sound:{enable:false}。
  // 用户判断「我感觉是数据库不全加没有强制要求的原因」—— 查证结果：
  //   · 「数据库不全」**不成立**：jb2a / psfx / blfx 三个包全在，searchFor("sword") 返回 292 条、
  //     ("fire") 388 条、("psfx") 19 条；AA 自己还有 aaAutorec-melee 120 条带完整 sound 的现成模板。
  //   · 真问题是**【没有检索入口】**：图标有 foundry_search_icon，动画什么都没有 ——
  //     那个会话里 AI 为找路径反复调了 8 次 execute_js 去摸索 Sequencer.Database。
  // 实现：把 Sequencer.Database 包成检索工具（经 /execute-js 转发，世界内求值）。
  // ⚠️ 依赖世界开启 execute-js（REST API 模块设置），关着的世界返回 400 —— 描述里写了降级路径。
  reg(h.makeTool(
    'foundry_search_animation',
    '动画/音效检索库：在 Sequencer 数据库（jb2a / psfx / blfx 三包）里搜路径，**返回候选给你自己挑**。\n' +
      '每项含 dbPath（数据库点分路径 —— 填 AA 的 video.customPath / sound.file 用）与 file（真实文件路径 —— 也可直接填）。\n' +
      '用法：配 AA 动画前先搜一次，把候选看一遍再挑；**不要凭记忆拼路径**（猜错 = 不播 + 卡面裂图）。\n' +
      '词根换法：longsword → sword、warhammer → hammer、quarterstaff → staff、暗蚀 → necrotic、火焰 → fire、冰冷 → ice。\n' +
      '⚠️ 库里【没有】D&D 状态名（搜 poisoned / burning 不会有结果）—— 音效走 psfx.* / blfx.sound.*，动画走 jb2a 的招式名（sword / fire / ice / impact…）。\n' +
      '⚠️ **依赖世界开启 execute-js**；若返回 400 "execute-js is disabled in REST API module settings"，让用户去 REST API 模块设置里打开，或改用 foundry_file_system 浏览 modules/jb2a_patreon/Library 目录（source 传 "data"，path 传 "modules/xxx"）。\n' +
      '⚠️ AA 的现成模板更省事：用 execute_js 读 game.settings.get("autoanimations","aaAutorec-melee")（120 条）/ "aaAutorec-range"（159 条），全都带完整 sound。',
    {
      keyword: { type: 'string', description: '英文关键词（如 sword / fire / necrotic / psfx）。多个词用空格分隔，任一命中即返回' },
      kind: { type: 'string', enum: ['all', 'video', 'sound'], description: '按文件类型过滤：video 动画 / sound 音效 / all 全部（默认 all）' },
      limit: { type: 'number', description: '最多返回多少条（默认 30，上限 200）' },
    },
    ['keyword'],
    async (args: Args) => {
      const kw = typeof args.keyword === 'string' ? args.keyword.trim() : ''
      if (!kw) return { error: 'keyword 必填' }
      const limit = Math.min(200, Math.max(1, Number(args.limit ?? 30) || 30))
      const kind = typeof args.kind === 'string' ? args.kind : 'all'
      const words = kw.split(/\s+/).filter(Boolean)
      // kind 过滤必须在扫描【时】就放宽：searchFor("sword") 实测 292 条、("fire") 388 条，
      // 若只扫前 limit*3 条，这 15~90 条可能清一色是 video —— 要音效的人会拿到空结果，
      // 明明库里有却搜不到（这是「数据库不全」错觉的来源）。所以按类型搜时扫到 500 条再筛。
      const scan = kind === 'all' ? limit * 3 : 500
      const script =
        'const words = ' + JSON.stringify(words) + ';\n' +
        'const scan = ' + scan + ';\n' +
        'const seen = {};\n' +
        'const out = [];\n' +
        'for (const w of words) {\n' +
        '  let hits = [];\n' +
        '  try { hits = Sequencer.Database.searchFor(w) || []; } catch (err) { continue; }\n' +
        '  for (const p of hits) {\n' +
        '    if (seen[p]) continue;\n' +
        '    seen[p] = 1;\n' +
        '    let f = ""; let mod = "";\n' +
        '    try { const ent = Sequencer.Database.getEntry(p); f = (ent && ent.file) || ""; mod = (ent && ent.moduleName) || ""; } catch (err2) {}\n' +
        '    out.push({ dbPath: p, file: f, module: mod });\n' +
        '    if (out.length >= scan) break;\n' +
        '  }\n' +
        '  if (out.length >= scan) break;\n' +
        '}\n' +
        'return { total: out.length, entries: out };\n'
      let raw: Record<string, unknown>
      try {
        // ⚠️ /execute-js 的返回是包一层的：{ success: true, result: <脚本的返回值> }
        // （实测踩过：直接读 raw.entries 永远是 undefined，页面看着「检索到 0 条」）
        const env = h.asObject(await h.callRelay('POST', '/execute-js', { body: { script } }))
        raw = env.result && typeof env.result === 'object' && !Array.isArray(env.result)
          ? (env.result as Record<string, unknown>)
          : env
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        const disabled = /execute-js is disabled/i.test(msg)
        return {
          error: true,
          message: msg,
          hint: disabled
            ? '⚠️ 这个世界没开 execute-js，本工具用不了。降级路径：① 让 GM 去 REST API 模块设置里打开；② 改用 foundry_file_system（source:"data"、path:"modules/jb2a_patreon/Library"）浏览真实目录看有哪些动画。'
            : '调用 relay 失败，先 foundry_list_worlds 确认世界在线。',
        }
      }
      const entries = Array.isArray(raw.entries) ? (raw.entries as Array<Record<string, unknown>>) : []
      const isSound = (f: string) => /\.(mp3|ogg|wav|m4a|flac|aac)$/i.test(f)
      const picked = entries
        .filter((e) => {
          const f = String(e.file ?? '')
          if (kind === 'video') return !isSound(f)
          if (kind === 'sound') return isSound(f)
          return true
        })
        .slice(0, limit)
      const videoCount = entries.filter((e) => !isSound(String(e.file ?? ''))).length
      return {
        keyword: kw,
        kind,
        totalScanned: entries.length,
        videoCount,
        soundCount: entries.length - videoCount,
        returned: picked.length,
        entries: picked,
        hint:
          picked.length
            ? '把 dbPath 或 file 照抄进 flags.autoanimations 的 video.customPath / sound.file（sound 还要补齐 enable/file/volume/delay/startTime/repeat/repeatDelay 七个字段，见 foundry_reference{topic:"fx-anim"}）。'
            : '这个关键词没搜到（或都被 kind 过滤掉了）。换个更粗的词根重试，例如 longsword→sword、warhammer→hammer；音效试 psfx，动画试 jb2a。',
      }
    },
  ))
}
