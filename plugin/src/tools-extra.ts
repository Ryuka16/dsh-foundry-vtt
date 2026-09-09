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
  reg(simple(h, 'foundry_execute_js',
    '⚠️ 在世界内直接执行 JavaScript（POST /execute-js）。这是最高权限的底层操作：可读写世界任意数据、可调用任何 Foundry API。**只用于其他工具覆盖不到的特殊操作；写脚本前先想清楚后果，不确定就先用 foundry_get_entity 读数据结构再写。注意：此端点默认被 REST API 模块设置禁用，未开启会返回 400 "execute-js is disabled in REST API module settings. A GM must enable it to allow JavaScript execution."——优先改用专用工具（foundry_update_entity 支持内嵌物品 uuid Actor.<actorId>.Item.<itemId>，可直接改 actor 身上物品的 system/effects，改物品自动化特性通常不需要 execute_js）。**',
    'POST', '/execute-js',
    { script: { type: 'string', description: '要执行的 JavaScript 代码' } },
    [],
    ['script']))
  reg(simple(h, 'foundry_structure',
    '读世界目录结构（GET /structure）：文件夹树与实体清单。types 可逗号分隔过滤（Scene/Actor/Item/JournalEntry/RollTable/Cards/Macro/Playlist）；recursive 递归子目录。',
    'GET', '/structure',
    { path: { type: 'string', description: '起始路径（null=根）' }, types: { type: 'string', description: '类型过滤，逗号分隔' }, recursive: { type: 'boolean', description: '递归读取' }, recursiveDepth: { type: 'number', description: '递归深度（默认 5）' }, includeEntityData: { type: 'boolean', description: '含完整实体数据' } },
    [],
    [], ['path', 'types', 'recursive', 'recursiveDepth', 'includeEntityData']))

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
  reg(simple(h, 'foundry_world_info',
    '读世界综合信息（GET /world-info）：世界名/系统版本/Foundry 版本/已装模块/玩家列表等。',
    'GET', '/world-info', {}, [], [], []))
  reg(simple(h, 'foundry_get_folder',
    '按名字查文件夹（GET /get-folder），返回文件夹 uuid（建实体时 folder 参数用）。',
    'GET', '/get-folder',
    { name: { type: 'string', description: '文件夹名' } },
    ['name'],
    [], ['name']))
  reg(simple(h, 'foundry_player_list',
    '列出玩家/用户简表（GET /players）。',
    'GET', '/players', {}, [], [], []))
}
