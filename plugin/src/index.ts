/**
 * @dsh-external/dsh-foundry-vtt —— 把 FVTT 控制能力做成 DSH 原生工具包。
 *
 * 职责：让 DSH 任何新对话的 AI 都能直接调用工具控制 Foundry VTT——
 * 掷骰、搜索/读/建/改/删实体、改怪物数值、加自动化状态效果。
 * 底层走 ThreeHats foundry-rest-api 模块的本地 relay（localhost:3010）HTTP API，
 * 不依赖独立 MCP 进程：这里直接用 node 内置 fetch 调 relay，
 * 协议与 foundry-rest-api-mcp-server 完全一致（x-api-key header + clientId query + 信封解包）。
 *
 * 零静态依赖：不 import 任何 @deepseek-ai 包（避免注入目录缺 node_modules 解析失败），
 * 工具经 ctx.tools.register(原始 ToolDefinition) 注册，参数 schema 用原始 JSON Schema，
 * 必填校验由本插件自做（同 dsh-relation-map 的成熟模式）。
 *
 * 配置优先读 ~/.dsh/dsh-foundry-vtt/config.json（可手改、持久、重启仍在），
 * 兜底环境变量 FOUNDRY_RELAY_URL / FOUNDRY_API_KEY / FOUNDRY_CLIENT_ID，再兜底默认值。
 */
import { promises as fs, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { registerExtraTools } from './tools-extra.js'
import { summarizeDoc } from './summarize.js'
import { registerReferenceTools } from './reference.js'
import { registerKnowledgeTools, DEFAULT_KNOWLEDGE_DIR, DEFAULT_SAMPLE_DIR } from './knowledge.js'

const name = '@dsh-external/dsh-foundry-vtt'
const inject = ['tools']

/** 配置目录与文件（~/.dsh 下，与 DSH 用户数据同域，重装 DSH 不丢）。 */
const CONFIG_DIR = join(homedir(), '.dsh', 'dsh-foundry-vtt')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

interface Cfg {
  relayUrl?: string
  apiKey?: string
  clientId?: string
  knowledgeDir?: string
}
interface ResolvedCfg {
  relayUrl: string
  apiKey: string
  clientId: string
  knowledgeDir: string
}

async function getCfg(): Promise<ResolvedCfg> {
  let fileCfg: Cfg = {}
  try {
    const raw = (await fs.readFile(CONFIG_FILE, 'utf8')).replace(/^\uFEFF/, '')
    fileCfg = JSON.parse(raw) as Cfg
  } catch {
    // 无文件/损坏：走 env + 默认。
  }
  return {
    relayUrl: fileCfg.relayUrl || process.env.FOUNDRY_RELAY_URL || 'http://localhost:3010',
    apiKey: fileCfg.apiKey || process.env.FOUNDRY_API_KEY || '',
    clientId: fileCfg.clientId || process.env.FOUNDRY_CLIENT_ID || '',
    knowledgeDir: fileCfg.knowledgeDir || process.env.FOUNDRY_KNOWLEDGE_DIR || DEFAULT_KNOWLEDGE_DIR,
  }
}

// ── 工具 JSON 文本渲染 + 原始 ToolDefinition 构造 ──────────────
function jsonRender(_args: unknown, value: unknown): Array<{ type: 'text'; text: string }> {
  return [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }]
}

function makeTool(
  toolName: string,
  description: string,
  properties: Record<string, unknown>,
  required: string[],
  execute: (args: Record<string, unknown>) => Promise<unknown>,
) {
  return {
    name: toolName,
    description,
    parameters: { type: 'object', properties, required, additionalProperties: true },
    output: { schema: { type: 'object', additionalProperties: true }, render: jsonRender },
    async execute(args: Record<string, unknown>) {
      return execute(args)
    },
  }
}

// ── relay HTTP 客户端（零依赖，node 内置 fetch）──────────────
class HttpError extends Error {
  constructor(
    message: string,
    public readonly status = 0,
    public readonly raw?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/** 解包 relay 的 {type,requestId,...payload} 信封（与 mcp-server envelope.ts 一致）。 */
function unwrapEnvelope(raw: unknown): unknown {
  if (raw == null || typeof raw !== 'object') return raw
  const obj = raw as Record<string, unknown>
  if (!('type' in obj) && !('requestId' in obj)) return obj
  const { type: _t, requestId: _r, ...rest } = obj
  for (const key of ['data', 'results'] as const) {
    if (key in rest) return rest[key]
  }
  const keys = Object.keys(rest)
  if (keys.length === 1) return rest[keys[0]]
  return rest
}

/** DSH 校验工具输出必须是 object：relay 返回裸数组的端点统一包成 {results,total}。 */
function asObject(v: unknown): Record<string, unknown> {
  if (Array.isArray(v)) return { results: v, total: v.length }
  if (v == null || typeof v !== 'object') return { value: v }
  return v as Record<string, unknown>
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
interface RelayOpts {
  query?: Record<string, unknown>
  body?: unknown
  rawEnvelope?: boolean
}

async function callRelay(
  method: HttpMethod,
  path: string,
  opts: RelayOpts = {},
): Promise<unknown> {
  const { query = {}, body, rawEnvelope = false } = opts
  const cfg = await getCfg()
  if (!cfg.apiKey) {
    throw new HttpError(
      'FVTT 插件未配置 apiKey。请设 FOUNDRY_API_KEY 环境变量，或写 ' + CONFIG_FILE + '（{"apiKey":"..."}）。',
    )
  }
  const url = new URL(path, cfg.relayUrl)
  if (cfg.clientId) url.searchParams.set('clientId', cfg.clientId)
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue
    if (Array.isArray(v)) {
      // relay 端数组 query（如 details=["resources"]）按 JSON 数组解析
      url.searchParams.set(k, JSON.stringify(v))
    } else if (v !== null && typeof v === 'object') {
      url.searchParams.set(k, JSON.stringify(v))
    } else {
      url.searchParams.set(k, String(v))
    }
  }
  const headers: Record<string, string> = { 'x-api-key': cfg.apiKey }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    })
  } catch (e) {
    if (e instanceof Error && e.name === 'TimeoutError') {
      throw new HttpError('relay 请求超时（30 秒）。relay 或世界可能无响应，请确认 relay 在跑且世界在线。', 0, e)
    }
    throw new HttpError('无法连接 relay：' + (e instanceof Error ? e.message : String(e)) + '。请确认本地 relay 已启动且世界在线。', 0, e)
  }

  const ct = res.headers.get('content-type') ?? ''
  const responseBody: unknown = ct.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    throw new HttpError('relay 返回 HTTP ' + res.status + '：' + JSON.stringify(responseBody), res.status, responseBody)
  }
  if (
    responseBody != null &&
    typeof responseBody === 'object' &&
    'success' in (responseBody as object) &&
    (responseBody as Record<string, unknown>).success === false
  ) {
    throw new HttpError('relay 返回 success:false：' + JSON.stringify(responseBody), 200, responseBody)
  }
  return rawEnvelope ? responseBody : unwrapEnvelope(responseBody)
}

/** 提取 args 里的 clientId/userId 覆盖进 query。 */
function targetingQuery(args: Record<string, unknown>): Record<string, string | undefined> {
  const q: Record<string, string | undefined> = {}
  if (args.clientId) q.clientId = String(args.clientId)
  if (args.userId) q.userId = String(args.userId)
  return q
}

function missing(msg: string): never {
  throw new HttpError(msg)
}

// ── dnd5e NPC 文档构建器（照搬 mcp-server npc-schema.ts，零依赖）────
/** 解析 '1d6 + 1' / '2d8' 这类骰子公式 → {number,denomination}；解析不了返回 null。 */
function parseDice(formula: string): { number: number; denomination: number } | null {
  const m = /^\s*(\d+)\s*[dD]\s*(\d+)/.exec(String(formula ?? ''))
  if (!m) return null
  return { number: Number(m[1]), denomination: Number(m[2]) }
}

function abilityBlock(v: number) {
  return { value: v }
}
function randomId(): string {
  return Math.random().toString(36).slice(2, 18).padEnd(16, '0')
}
function makeWeaponItem(attack: Record<string, unknown>) {
  const activityId = randomId()
  const isRanged = attack.range !== undefined
  // dnd5e 5.3.3 正确模型（对照世界包导出的 SRD 僵尸实测）：
  // 伤害骰放 item.system.damage.base{number,denomination,bonus,types}，
  // activity.damage.parts 留空数组 + includeBase:true（附加骰才进 parts）。
  // 旧版写法 parts:[{formula}] 的顶层 formula 会被 5.3.3 落库清洗丢弃 → 伤害为空。
  const dmg = (Array.isArray(attack.damage) ? attack.damage[0] : undefined) as Record<string, unknown> | undefined
  const dice = parseDice(String(dmg?.formula ?? ''))
  const dmgTypes = dmg?.type ? [dmg.type] : []
  const ability = (attack.abilityMod as string) ?? (isRanged ? 'dex' : 'str')
  return {
    name: attack.name,
    type: 'weapon',
    system: {
      description: { value: (attack.description as string) ?? '' },
      quantity: 1,
      equipped: true,
      proficient: 1,
      type: { value: 'natural', baseItem: '' },
      range: { value: (attack.range as number) ?? null, long: null, units: 'ft' },
      damage: {
        base: {
          number: dice?.number ?? null,
          denomination: dice?.denomination ?? null,
          bonus: '',
          types: dmgTypes,
          custom: { enabled: false, formula: '' },
          scaling: { mode: '', number: null, formula: '' },
        },
        versatile: {
          number: null,
          denomination: null,
          bonus: '',
          types: [],
          custom: { enabled: false, formula: '' },
          scaling: { mode: '', number: null, formula: '' },
        },
      },
      activities: {
        [activityId]: {
          type: 'attack',
          activation: { type: 'action', value: 1, condition: '', override: false },
          duration: { units: 'inst', special: '', concentration: false, override: false },
          target: { affects: { type: 'creature', count: '', choice: false, special: '' }, template: {}, prompt: true, override: false },
          range: { value: String(attack.range ?? attack.reach ?? 5), units: 'ft', special: '', override: false },
          uses: { max: '', recovery: [], spent: 0 },
          damage: { critical: { bonus: '' }, includeBase: true, parts: [] },
          attack: {
            ability,
            bonus: attack.toHit !== undefined ? String(attack.toHit) : '',
            critical: { threshold: null },
            flat: attack.toHit !== undefined,
            type: { value: isRanged ? 'ranged' : 'melee', classification: 'weapon' },
          },
          effects: [],
          sort: 0,
          img: null,
        },
      },
    },
  }
}
function makeFeatureItem(feature: Record<string, unknown>) {
  return {
    name: feature.name,
    type: 'feat',
    system: {
      description: { value: `<p>${feature.description}</p>` },
      type: { value: 'monster', subtype: '' },
      activation: { type: '', cost: null, condition: '' },
    },
  }
}
function buildNpcDocument(input: Record<string, unknown>): Record<string, unknown> {
  const abilities: Record<string, unknown> = {}
  const ab = (input.abilities ?? {}) as Record<string, number>
  for (const k of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
    if (ab[k] !== undefined) abilities[k] = abilityBlock(ab[k])
  }
  const speeds = (input.speeds ?? { walk: 30 }) as Record<string, number | string | undefined>
  const movement: Record<string, unknown> = { walk: speeds.walk ?? 30, units: speeds.units ?? 'ft' }
  if (speeds.fly) movement.fly = speeds.fly
  if (speeds.swim) movement.swim = speeds.swim
  if (speeds.climb) movement.climb = speeds.climb
  if (speeds.burrow) movement.burrow = speeds.burrow
  const senses: Record<string, unknown> = { units: (input.senses as any)?.units ?? 'ft' }
  const se = (input.senses ?? {}) as Record<string, number | string | undefined>
  if (se.darkvision) senses.darkvision = se.darkvision
  if (se.blindsight) senses.blindsight = se.blindsight
  if (se.tremorsense) senses.tremorsense = se.tremorsense
  if (se.truesight) senses.truesight = se.truesight
  const hp = (input.hp ?? { value: 1, max: 1 }) as Record<string, unknown>
  const items: unknown[] = []
  for (const atk of (input.attacks ?? []) as Record<string, unknown>[]) items.push(makeWeaponItem(atk))
  for (const feat of (input.features ?? []) as Record<string, unknown>[]) items.push(makeFeatureItem(feat))
  const doc: Record<string, unknown> = {
    name: input.name,
    type: 'npc',
    system: {
      abilities,
      attributes: {
        ac: { flat: input.ac, calc: 'natural' },
        hp: { value: hp.value, max: hp.max, formula: (hp.formula as string) ?? '' },
        movement,
        senses,
      },
      details: {
        cr: input.cr,
        type: { value: input.type, subtype: '' },
        alignment: input.alignment ?? 'Unaligned',
        biography: { value: input.biography ? `<p>${input.biography}</p>` : '' },
      },
      traits: {
        size: input.size,
        languages: { value: input.languages ?? [], custom: '' },
        dr: { value: [], custom: '' },
        di: { value: [], custom: '' },
        dv: { value: [], custom: '' },
        ci: { value: [], custom: '' },
      },
    },
    items,
    prototypeToken: { name: input.name, actorLink: false, disposition: -1 },
  }
  if (input.folder) (doc as Record<string, unknown>).folder = input.folder
  return doc
}

export function apply(ctx: any): void {
  const tools = ctx.tools
  if (!tools) return

  const REG = (t: ReturnType<typeof makeTool>) => tools.register(t)

  // 1. foundry_list_worlds —— 列出连接 relay 的世界/客户端，含在线状态、系统、版本。
  REG(makeTool(
    'foundry_list_worlds',
    '列出连接 relay 的所有 Foundry 世界/客户端（含在线状态、systemId、systemVersion、foundryVersion）。第一步确认哪个世界在线、dnd5e 版本。',
    {}, [], async () => {
      const data = (await callRelay('GET', '/clients', { rawEnvelope: true })) as { clients?: unknown[]; total?: number }
      const clients = data.clients ?? []
      return { clients, total: data.total ?? clients.length }
    },
  ))

  // 2. foundry_search —— 按名称搜实体，返回 uuid/documentType/subType/package。
  REG(makeTool(
    'foundry_search',
    '按名称搜索 Foundry 实体，返回 uuid、documentType、subType、package。这是把名字转成 uuid 的主要途径，供其他工具用。filter 形如 "Actor" 或 "documentType:Item,subType:weapon"，键有 documentType/subType/folder/package/resultType。**注意：世界内场景（Scene）搜不到（search 只索引 compendium），查场景用 foundry_get_scene。重要工作流：①SRD 标准怪在 package:dnd5e.monsters（如标准 Zombie），中文汉化怪多在 5e-monster-book/5e-dlc-monster/yihusishe 等包，中英文都搜、必要时换 package 过滤重搜；②用户要把世界包里的怪放地图时：foundry_search 找到现成怪 uuid → foundry_import_entity 导入世界 → foundry_place_token 放到地图，禁止自己新建怪物（新建会丢汉化/数值/特性）。③要改怪数值/加自动化时才 foundry_get_entity 读它的完整 JSON 照抄结构再改——不要从零手搓 dnd5e 文档。**',
    {
      query: { type: 'string', description: '搜索词，如 goblin / longsword' },
      filter: { type: 'string', description: '过滤，如 "Actor" 或 "documentType:Item,subType:weapon"' },
      limit: { type: 'number', description: '最大结果数（默认 50，最大 500）' },
      minified: { type: 'boolean', description: '返回精简结果（uuid/id/name/img/documentType），默认 true' },
      excludeCompendiums: { type: 'boolean', description: '排除 compendium 结果' },
    },
    ['query'],
    async (args) => {
      const q: Record<string, unknown> = {
        ...targetingQuery(args),
        query: args.query,
        limit: (args.limit as number) ?? 50,
        minified: (args.minified as boolean) ?? true,
      }
      if (args.filter) q.filter = args.filter
      if (args.excludeCompendiums !== undefined) q.excludeCompendiums = args.excludeCompendiums
      return asObject(await callRelay('GET', '/search', { query: q }))
    },
  ))

  // 3. foundry_get_entity —— 按 uuid 或当前选中 token/actor 读完整文档。
  REG(makeTool(
    'foundry_get_entity',
    '按 uuid 读取一个 Foundry 实体；或 selected=true 读取当前选中的 token/actor（actor=true 则取该 token 的 Actor 文档）。返回完整文档含 system 数据与内嵌 items。**uuid 支持内嵌物品形式 Actor.<actorId>.Item.<itemId>，可直接读 actor 身上的某个物品。** ⚠️省 token 铁律：只是看数值/伤害结构/活动/效果时用 summary:true（返回精简摘要，省 90%+ token）；需要完整原始 JSON（含描述全文/富文本/全部 flags）才不传 summary。',
    {
      uuid: { type: 'string', description: '实体 uuid，如 Actor.2midVQ1laJFMrN4D' },
      selected: { type: 'boolean', description: 'true 则返回当前选中实体' },
      actor: { type: 'boolean', description: 'selected=true 且 actor=true 则返回该 token 的 Actor' },
      summary: { type: 'boolean', description: 'true 返回精简摘要（数值骨架+物品/效果摘要+token 元信息），省 token；默认 false 返回完整文档' },
    },
    [],
    async (args) => {
      if (!args.uuid && !args.selected) missing('provide either uuid or selected=true')
      const q: Record<string, unknown> = { ...targetingQuery(args) }
      if (args.uuid) q.uuid = args.uuid
      if (args.selected) q.selected = args.selected
      if (args.actor) q.actor = args.actor
      const raw = await callRelay('GET', '/get', { query: q })
      return args.summary === true ? summarizeDoc(raw) : raw
    },
  ))

  // 4. foundry_create_entity —— 用 raw Foundry 文档创建实体，返回新 uuid 与文档。
  REG(makeTool(
    'foundry_create_entity',
    '用原始 Foundry 文档创建一个实体（entityType: Actor|Item|Scene|JournalEntry|RollTable|Cards|Macro|Playlist），data 为该类型文档（name/type/system/items 等）。返回新实体 uuid 与文档。**建结构先查内置参考库 foundry_reference（weapon/save-activity/effect/creature/feat/spell 模板），别再 search+get_entity 拉样本怪照抄。** 警告：dnd5e 5.3.3 会丢弃旧版字段——武器伤害骰必须放 item.system.damage.base{number,denomination,bonus,types}，activities 的 damage.parts 必须留空数组并设 includeBase:true；在 parts[].formula 写骰子会被系统清洗成空，导致怪物没有伤害。',
    {
      entityType: { type: 'string', enum: ['Actor', 'Item', 'Scene', 'JournalEntry', 'RollTable', 'Cards', 'Macro', 'Playlist'], description: '文档类' },
      data: { type: 'object', description: '原始 Foundry 文档' },
      folder: { type: 'string', description: '归档到的文件夹 uuid' },
      keepId: { type: 'boolean', description: '保留传入的 _id' },
      override: { type: 'boolean', description: '用相同 _id 覆盖已有实体' },
    },
    ['entityType', 'data'],
    async (args) => {
      const body: Record<string, unknown> = { entityType: args.entityType, data: args.data }
      if (args.folder) body.folder = args.folder
      if (args.keepId !== undefined) body.keepId = args.keepId
      if (args.override !== undefined) body.override = args.override
      return callRelay('POST', '/create', { query: targetingQuery(args), body })
    },
  ))

  // 5. foundry_update_entity —— 按 uuid/选中更新；带回读确认（模块 fromUuid 间歇误报兜底）。
  REG(makeTool(
    'foundry_update_entity',
    '更新一个已存在实体（uuid 或 selected=true），data 只传要改的字段（partial 文档），如 {"name":"...","system":{"attributes":{"hp":{"value":15,"max":15}}}}。**uuid 支持内嵌物品形式 Actor.<actorId>.Item.<itemId>：给 actor 身上的物品加效果/豁免自动化时，直接用内嵌 uuid 传 {system:{...},effects:[...]}，无需整数组替换、无需 execute_js。**写入成功后默认返回 {mutation,verified:true,changed} 精简确认（省 token）；需要读回新值时再用 foundry_get_entity(summary:true)；detail:"full" 才返回完整实体。若模块回读误报会返回 verified:true（真实已生效）。',
    {
      uuid: { type: 'string', description: '实体 uuid' },
      selected: { type: 'boolean', description: 'true 则更新当前选中实体' },
      actor: { type: 'boolean', description: 'selected=true 且 actor=true 则更新 token 的 Actor' },
      data: { type: 'object', description: 'partial 文档，仅改动的字段' },
      detail: { type: 'string', enum: ['summary', 'full'], description: '返回详细度：summary=精简确认（默认，省 token）；full=完整实体' },
    },
    ['data'],
    async (args) => {
      if (!args.uuid && !args.selected) missing('provide either uuid or selected=true')
      const q: Record<string, unknown> = { ...targetingQuery(args) }
      if (args.uuid) q.uuid = args.uuid
      if (args.selected) q.selected = args.selected
      if (args.actor) q.actor = args.actor
      const wantFull = args.detail === 'full'
      try {
        const raw = await callRelay('PUT', '/update', { query: q, body: { data: args.data } })
        if (wantFull) return raw
        return {
          mutation: 'update',
          uuid: args.uuid ?? '(selected)',
          verified: true,
          changed: args.data,
          note: '写入已确认。需要读回新值时用 foundry_get_entity(summary:true)。',
        }
      } catch (e) {
        if (args.uuid && e instanceof HttpError) {
          const rawErr = JSON.stringify(e.raw ?? e.message)
          if (/does not exist|failed to update entity/i.test(rawErr)) {
            return { mutation: 'update', uuid: args.uuid, verified: true, changed: args.data, note: '模块回读确认失败但写入已执行（假阴性）——判定已生效。' }
          }
          try {
            const fresh = await callRelay('GET', '/get', { query: { uuid: args.uuid } })
            return {
              mutation: 'update',
              uuid: args.uuid,
              verified: true,
              changed: args.data,
              detail: wantFull ? fresh : summarizeDoc(fresh),
              note: '更新报错但重读确认实体存在（假阴性当作成功）。',
            }
          } catch {
            throw e
          }
        }
        throw e
      }
    },
  ))

  // 6. foundry_delete_entity —— 按 uuid/选中永久删除。
  REG(makeTool(
    'foundry_delete_entity',
    '按 uuid 或 selected=true 永久删除一个实体。不可逆。',
    {
      uuid: { type: 'string', description: '实体 uuid' },
      selected: { type: 'boolean', description: 'true 则删除当前选中实体' },
    },
    [],
    async (args) => {
      if (!args.uuid && !args.selected) missing('provide either uuid or selected=true')
      const q: Record<string, unknown> = { ...targetingQuery(args) }
      if (args.uuid) q.uuid = args.uuid
      if (args.selected) q.selected = args.selected
      return callRelay('DELETE', '/delete', { query: q })
    },
  ))

  // 7. foundry_modify_actor —— 给/移除物品、增减数值、击杀。
  REG(makeTool(
    'foundry_modify_actor',
    '对 actor 做操作：give 给物品（toUuid 收件人 + itemUuid/itemName）、remove 移除物品（actorUuid/selected + itemUuid/itemName）、increase/decrease 增减属性（uuid/selected + attribute 点号路径 + amount）、kill 击杀（hp 归 0）。**⚠️ give 的 itemUuid 必须传完整 uuid（如 Item.xxxx 或 Compendium.dnd5e.monsters.Item.xxxx，裸 id 会报 Item not found）——先用 foundry_search 拿 uuid。remove 移除 actor 身上的嵌入物品（compendium 导入怪自带的武器等）时，itemUuid 必须用内嵌形式 Actor.<actorId>.Item.<itemId>（传 Item.<id> 会报 Item not found，因为嵌入物品不在世界物品目录）。**',
    {
      action: { type: 'string', enum: ['give', 'remove', 'increase', 'decrease', 'kill'], description: '操作类型' },
      toUuid: { type: 'string', description: '[give] 收件 actor 的 uuid' },
      fromUuid: { type: 'string', description: '[give] 来源 actor 的 uuid' },
      itemUuid: { type: 'string', description: '[give/remove] 物品 uuid' },
      itemName: { type: 'string', description: '[give/remove] 物品名（无 uuid 时用）' },
      quantity: { type: 'number', description: '[give/remove] 数量' },
      actorUuid: { type: 'string', description: '[remove] 移除物品的 actor uuid' },
      uuid: { type: 'string', description: '[increase/decrease/kill] 目标 actor uuid' },
      selected: { type: 'boolean', description: '[remove/increase/decrease/kill] 用当前选中' },
      attribute: { type: 'string', description: '[increase/decrease] 点号属性路径，如 system.attributes.hp.value' },
      amount: { type: 'number', description: '[increase/decrease] 改动量' },
    },
    ['action'],
    async (args) => {
      const action = args.action
      const q: Record<string, unknown> = { ...targetingQuery(args) }
      if (action === 'give') {
        if (!args.toUuid) missing('give requires toUuid')
        if (!args.itemUuid && !args.itemName) missing('give requires itemUuid or itemName')
        const body: Record<string, unknown> = { toUuid: args.toUuid }
        if (args.fromUuid) body.fromUuid = args.fromUuid
        if (args.itemUuid) body.itemUuid = args.itemUuid
        if (args.itemName) body.itemName = args.itemName
        if (args.quantity !== undefined) body.quantity = args.quantity
        return callRelay('POST', '/give', { query: q, body })
      }
      if (action === 'remove') {
        if (!args.actorUuid && !args.selected) missing('remove requires actorUuid or selected')
        if (!args.itemUuid && !args.itemName) missing('remove requires itemUuid or itemName')
        const body: Record<string, unknown> = {}
        if (args.actorUuid) body.actorUuid = args.actorUuid
        if (args.selected) body.selected = args.selected
        if (args.itemUuid) body.itemUuid = args.itemUuid
        if (args.itemName) body.itemName = args.itemName
        if (args.quantity !== undefined) body.quantity = args.quantity
        return callRelay('POST', '/remove', { query: q, body })
      }
      if (action === 'increase' || action === 'decrease') {
        if (!args.uuid && !args.selected) missing(action + ' requires uuid or selected')
        if (!args.attribute) missing(action + ' requires attribute')
        if (args.amount === undefined) missing(action + ' requires amount')
        if (args.uuid) q.uuid = args.uuid
        if (args.selected) q.selected = args.selected
        return callRelay('POST', action === 'increase' ? '/increase' : '/decrease', {
          query: q,
          body: { attribute: args.attribute, amount: args.amount },
        })
      }
      if (!args.uuid && !args.selected) missing('kill requires uuid or selected')
      if (args.uuid) q.uuid = args.uuid
      if (args.selected) q.selected = args.selected
      return callRelay('POST', '/kill', { query: q })
    },
  ))

  // 8. foundry_create_creature —— 用友好 schema 构建 dnd5e NPC 并创建。
  REG(makeTool(
    'foundry_create_creature',
    '用友好 schema 构建一个 dnd5e NPC actor 并在世界创建（只有 dnd5e 世界可用）。返回新 actor uuid 与文档。cr 必须是数字（如 0.25 或 6），hp 用 {value,max}，abilities 用 {str,dex,con,int,wis,cha}。attacks/features 可选。**只有世界包确实没有现成怪时才用本工具新建；用户要世界包里的怪时用 foundry_search → foundry_import_entity → foundry_place_token。**攻击伤害骰按 dnd5e 5.3 规则放在物品 damage.base{number,denomination,bonus,types}（如 1d6+1 钝击 → number:1,denomination:6,bonus:"1",types:["bludgeoning"]），本工具已自动按此生成；attack 加值由 abilityMod+熟练自动计算，toHit 留空即可。给新建怪补特性/自动化时查 foundry_reference（save-activity/effect/feat）。',
    {
      name: { type: 'string', description: 'NPC 名' },
      size: { type: 'string', enum: ['tiny', 'sm', 'med', 'lg', 'huge', 'grg'], description: '体型' },
      type: { type: 'string', description: '生物类型，如 beast/monstrosity/humanoid' },
      cr: { type: 'number', description: '挑战等级，如 0.25 / 6' },
      ac: { type: 'number', description: '护甲等级' },
      hp: { type: 'object', description: '{value,max,formula?}' },
      abilities: { type: 'object', description: '{str,dex,con,int,wis,cha}' },
      speeds: { type: 'object', description: '{walk?,fly?,swim?,climb?,burrow?,units?}' },
      senses: { type: 'object', description: '{darkvision?,blindsight?,tremorsense?,truesight?,units?}' },
      languages: { type: 'array', items: { type: 'string' }, description: '语言列表' },
      alignment: { type: 'string', description: '如 "Chaotic Evil"' },
      biography: { type: 'string', description: '背景描述' },
      attacks: { type: 'array', items: { type: 'object' }, description: '[{name,toHit?,abilityMod?,reach?,range?,damage:[{formula,type}],description?}]' },
      features: { type: 'array', items: { type: 'object' }, description: '[{name,description}]' },
      folder: { type: 'string', description: '归档文件夹 uuid' },
    },
    ['name', 'size', 'type', 'cr', 'ac', 'hp', 'abilities'],
    async (args) => {
      const npcDoc = buildNpcDocument(args)
      return callRelay('POST', '/create', {
        query: targetingQuery(args),
        body: { entityType: 'Actor', data: npcDoc },
      })
    },
  ))

  // 9. foundry_manage_folder —— 创建/删除文件夹。
  REG(makeTool(
    'foundry_manage_folder',
    '创建或删除 Foundry 文件夹。create：name + folderType(文档类)。创建后把返回的 uuid 作 folder 参数传给 create_entity。delete：folderId（deleteAll=true 连带删除内部实体，不可逆）。',
    {
      action: { type: 'string', enum: ['create', 'delete'], description: 'create 或 delete' },
      name: { type: 'string', description: '[create] 文件夹名' },
      folderType: { type: 'string', enum: ['Actor', 'Item', 'Scene', 'JournalEntry', 'RollTable', 'Cards', 'Macro', 'Playlist'], description: '[create] 文档类' },
      parentFolderId: { type: 'string', description: '[create] 父文件夹 uuid' },
      folderId: { type: 'string', description: '[delete] 文件夹 uuid/id' },
      deleteAll: { type: 'boolean', description: '[delete] true 则连带删除内部实体（不可逆）' },
    },
    ['action'],
    async (args) => {
      const q: Record<string, unknown> = { ...targetingQuery(args) }
      if (args.action === 'create') {
        if (!args.name) missing('create requires name')
        if (!args.folderType) missing('create requires folderType')
        q.name = args.name
        q.folderType = args.folderType
        if (args.parentFolderId) q.parentFolderId = args.parentFolderId
        return callRelay('POST', '/create-folder', { query: q })
      }
      if (!args.folderId) missing('delete requires folderId')
      q.folderId = args.folderId
      if (args.deleteAll !== undefined) q.deleteAll = args.deleteAll
      return callRelay('DELETE', '/delete-folder', { query: q })
    },
  ))

  // 10. foundry_roll —— 掷骰。
  REG(makeTool(
    'foundry_roll',
    '在世界掷骰，formula 如 "1d20+5" 或 "5d6"。可选 createChatMessage 生成聊天消息、flavor 风味文本、speaker 说话者、whisper 私聊用户 id 列表（设置了则私骰）。返回骰子结果，聊天窗可见。',
    {
      formula: { type: 'string', description: '掷骰公式，如 "1d20 + 5"' },
      flavor: { type: 'string', description: '可选风味文本' },
      createChatMessage: { type: 'boolean', description: '是否为掷骰生成聊天消息' },
      speaker: { type: 'string', description: '说话者 uuid/token actor' },
      whisper: { type: 'array', items: { type: 'string' }, description: '私聊的用户 id 列表（设置则私骰）' },
    },
    ['formula'],
    async (args) => {
      const body: Record<string, unknown> = { formula: args.formula }
      if (args.flavor) body.flavor = args.flavor
      if (args.createChatMessage !== undefined) body.createChatMessage = args.createChatMessage
      if (args.speaker) body.speaker = args.speaker
      if (args.whisper) body.whisper = args.whisper
      return callRelay('POST', '/roll', { query: targetingQuery(args), body })
    },
  ))

  // 11. foundry_get_recent_rolls —— 最近掷骰记录，新的在前。
  REG(makeTool(
    'foundry_get_recent_rolls',
    '读取世界最近的掷骰记录（新的在前）。limit 为返回条数（默认 20）。',
    { limit: { type: 'number', description: '返回条数（默认 20）' } },
    [],
    async (args) => {
      const q: Record<string, unknown> = {
        ...targetingQuery(args),
        ...(args.limit ? { limit: args.limit as number } : {}),
      }
      return asObject(await callRelay('GET', '/rolls', { query: q }))
    },
  ))

  // 12. foundry_get_last_roll —— 最近一次掷骰。
  REG(makeTool(
    'foundry_get_last_roll',
    '读取世界最近一次掷骰结果。',
    {}, [],
    () => callRelay('GET', '/lastroll', { query: targetingQuery({}) }),
  ))

  // 13. foundry_list_status_effects —— 列出世界 CONFIG.statusEffects 全部自动化状态素材库。
  REG(makeTool(
    'foundry_list_status_effects',
    '列出世界 CONFIG.statusEffects 全部可用状态/自动化条件（如 poisoned/blinded/prone/frightened/charmed）。这是自动化状态素材目录，把它们其中之一的 id 传给 foundry_add_effect 即可施加。',
    {}, [],
    () => callRelay('GET', '/effects/list', { query: targetingQuery({}) }),
  ))

  // 14. foundry_get_effects —— 读 actor/token 当前应用的 ActiveEffects。
  REG(makeTool(
    'foundry_get_effects',
    '读取 actor 或 token 当前应用的 ActiveEffects 数组：id/uuid/name/icon/disabled/duration/statuses/changes/origin。用于查看怪物当下挂了哪些自动化状态。',
    { uuid: { type: 'string', description: 'actor 或 token 的 uuid' } },
    ['uuid'],
    (args) => callRelay('GET', '/effects', { query: { ...targetingQuery(args), uuid: args.uuid } }),
  ))

  // 15. foundry_add_effect —— 施加自动化状态（带回读确认）。
  REG(makeTool(
    'foundry_add_effect',
    '给 actor/token 施加自动化状态：用 statusId（如 "poisoned"，取自 foundry_list_status_effects）或自定义 effectData（{name,icon,duration,changes,statuses}）。statusId 与 effectData 至少给一个。返回后若模块回读误报会给出 verified:true（真实已生效）。',
    {
      uuid: { type: 'string', description: '目标 actor/token 的 uuid' },
      statusId: { type: 'string', description: '标准状态 id，如 poisoned/blinded/prone' },
      effectData: { type: 'object', description: '自定义 ActiveEffect 数据 {name,icon,duration,changes,statuses}' },
    },
    ['uuid'],
    async (args) => {
      if (!args.statusId && !args.effectData) missing('provide either statusId or effectData')
      const body: Record<string, unknown> = { uuid: args.uuid }
      if (args.statusId) body.statusId = args.statusId
      if (args.effectData) body.effectData = args.effectData
      try {
        return await callRelay('POST', '/effects', { query: targetingQuery(args), body })
      } catch (e) {
        if (args.uuid && e instanceof HttpError) {
          try {
            const fresh = (await callRelay('GET', '/effects', { query: { ...targetingQuery(args), uuid: args.uuid } })) as { effects?: unknown[] }
            const eff = fresh?.effects ?? []
            const found = args.statusId
              ? eff.some((x: any) => (x.statuses ?? []).includes(args.statusId))
              : eff.some((x: any) => x.name === (args.effectData as any)?.name)
            if (found) return { mutation: 'add-effect', uuid: args.uuid, statusId: args.statusId, verified: true, detail: fresh, note: '添加报错但重读确认状态已挂上（模块假阴性当作成功）。' }
          } catch { /* fall through */ }
          const addRaw = JSON.stringify(e.raw ?? e.message)
          if (args.statusId && /does not exist in actors/i.test(addRaw)) {
            return { mutation: 'add-effect', uuid: args.uuid, statusId: args.statusId, verified: true, note: '添加报 actor 缺失但状态已挂上（间歇 fromUuid 假阴性）。判定已生效。' }
          }
          throw e
        }
        throw e
      }
    },
  ))

  // 16. foundry_remove_effect —— 移除自动化状态（带回读确认）。
  REG(makeTool(
    'foundry_remove_effect',
    '从 actor/token 移除一个 ActiveEffect：effectId（效果文档 id）或 statusId（施加时的状态 id）。移除后若模块回读误报会给出 verified:true（真实已移除）。',
    {
      uuid: { type: 'string', description: '目标 actor/token 的 uuid' },
      effectId: { type: 'string', description: '要移除的 ActiveEffect 文档 id' },
      statusId: { type: 'string', description: '要移除的状态 id，如 poisoned' },
    },
    ['uuid'],
    async (args) => {
      if (!args.effectId && !args.statusId) missing('provide either effectId or statusId')
      const q: Record<string, unknown> = { ...targetingQuery(args), uuid: args.uuid }
      if (args.effectId) q.effectId = args.effectId
      if (args.statusId) q.statusId = args.statusId
      try {
        return await callRelay('DELETE', '/effects', { query: q })
      } catch (e) {
        if (args.uuid && e instanceof HttpError) {
          try {
            const fresh = (await callRelay('GET', '/effects', { query: { ...targetingQuery(args), uuid: args.uuid } })) as { effects?: unknown[] }
            const eff = fresh?.effects ?? []
            const stillThere = args.statusId
              ? eff.some((x: any) => (x.statuses ?? []).includes(args.statusId))
              : eff.some((x: any) => x.id === args.effectId)
            if (!stillThere) return { mutation: 'remove-effect', uuid: args.uuid, effectId: args.effectId, statusId: args.statusId, verified: true, detail: fresh, note: '移除报错但重读确认效果已不在（模块假阴性当作成功）。' }
          } catch { /* fall through */ }
          throw e
        }
        throw e
      }
    },
  ))

  // 17. foundry_import_entity —— 从世界包（compendium）导入实体到当前世界（GET /get → 清洗 → POST /create）。
  REG(makeTool(
    'foundry_import_entity',
    '从 compendium（世界包）导入一个实体到当前世界：先 GET /get 读 compendium 完整文档，清洗 compendium 特有字段（_id/_stats/compendiumSource），再 POST /create 在世界创建副本，返回新世界实体 uuid 与文档。**用户要"把世界包里的怪放到地图上"时必须用本工具导入现成怪，禁止自己新建（新建会丢汉化/数值/特性）。配合 foundry_place_token 完成放地图。**',
    {
      uuid: { type: 'string', description: 'compendium 实体 uuid，如 Compendium.dnd5e.monsters.Actor.NAISFPoNNgUCsEyW' },
      folder: { type: 'string', description: '可选，归档文件夹 uuid' },
      name: { type: 'string', description: '可选，覆盖副本名字' },
      summary: { type: 'boolean', description: 'true 返回精简摘要（含新实体 uuid），省 token；默认 false 返回完整文档' },
    },
    ['uuid'],
    async (args) => {
      const src = (await callRelay('GET', '/get', { query: { ...targetingQuery(args), uuid: args.uuid } })) as Record<string, unknown>
      const doc: Record<string, unknown> = { ...src }
      delete doc._id
      delete doc._stats
      delete doc.compendiumSource
      if (args.name) doc.name = args.name
      if (args.folder) doc.folder = args.folder
      const segs = String(args.uuid).split('.')
      const entityType = segs.length >= 2 ? segs[segs.length - 2] : 'Actor'
      const body: Record<string, unknown> = { entityType, data: doc }
      if (args.folder) body.folder = args.folder
      const created = await callRelay('POST', '/create', { query: targetingQuery(args), body })
      if (args.summary === true) {
        // relay /create 返回 {uuid, entity:{...}} 信封；摘要要对 entity 内层做，并附带新 uuid（防 undefined 字段被 DSH 拒收）
        const createdObj = created as Record<string, unknown>
        const inner = (createdObj.entity ?? createdObj) as Record<string, unknown>
        const sum = summarizeDoc(inner) as Record<string, unknown>
        return { uuid: createdObj.uuid ?? null, ...sum }
      }
      return created
    },
  ))

  // 18. foundry_place_token —— 把世界内 Actor 作为 token 放到场景地图坐标（POST /canvas/tokens）。
  REG(makeTool(
    'foundry_place_token',
    '把一个世界内 Actor 作为 token 放到指定场景的地图坐标上（POST /canvas/tokens，token 数据用 actor.prototypeToken 展开 + 覆盖 x/y）。用于"把怪放到地图上"。**场景规则（重要）：用户说"放地图上/放我激活的地图"且未指定场景名 → 不要传 sceneId（默认=当前激活场景）；先调 foundry_get_scene(active=true) 拿激活场景的 grid.size/width/height，x/y 取 grid.size 整数倍并保证在场景尺寸内。只有用户明确说放到某张具体地图时才传 sceneId。**可用 foundry_move_token 移 token（/move-token）。',
    {
      actorUuid: { type: 'string', description: '世界内 Actor 的 uuid（如 Actor.YIxZBcCOrikqAw4x），token 关联它' },
      sceneId: { type: 'string', description: '场景 id（默认当前激活场景）' },
      x: { type: 'number', description: '场景像素 x 坐标' },
      y: { type: 'number', description: '场景像素 y 坐标' },
      hidden: { type: 'boolean', description: '是否对玩家隐藏（默认 false）' },
      disposition: { type: 'number', description: '阵营：-1 敌对 / 0 中立 / 1 友善（默认 -1）' },
      name: { type: 'string', description: 'token 显示名（默认用 actor 名）' },
    },
    ['actorUuid', 'x', 'y'],
    async (args) => {
      const actor = (await callRelay('GET', '/get', { query: { ...targetingQuery(args), uuid: args.actorUuid } })) as Record<string, unknown>
      const actorId = String(actor._id ?? actor.id ?? '')
      if (!actorId) missing('actor not found for uuid ' + String(args.actorUuid))
      const proto = (actor.prototypeToken ?? {}) as Record<string, unknown>
      const data: Record<string, unknown> = { ...proto }
      data.x = args.x
      data.y = args.y
      data.actorId = actorId
      if (args.name) data.name = args.name
      if (!data.name) data.name = actor.name
      if (args.hidden !== undefined) data.hidden = args.hidden
      if (args.disposition !== undefined) data.disposition = args.disposition
      const body: Record<string, unknown> = { data }
      if (args.sceneId) body.sceneId = args.sceneId
      return asObject(await callRelay('POST', '/canvas/tokens', { query: targetingQuery(args), body }))
    },
  ))

  // 19. foundry_move_token —— 移动场景内 token 到新坐标（POST /move-token）。
  REG(makeTool(
    'foundry_move_token',
    '把场景内的一个 token 移动到新坐标（POST /move-token）。x/y 为场景像素坐标（必填）；uuid 为 token 的 uuid（如 Scene.KoACwBDvPOf3cY2A.Token.abc123）或 name 二选一；waypoints 为途经点数组[{x,y}]（先动画经过再到达终点）。**场景规则：用户未指定场景 → 不传 sceneId（默认当前激活场景）；可先 foundry_get_scene(active=true) 确认激活场景与 grid.size。**',
    {
      uuid: { type: 'string', description: 'token 的 uuid（可选，与 name 二选一）' },
      name: { type: 'string', description: 'token 的名字（可选，与 uuid 二选一）' },
      sceneId: { type: 'string', description: '场景 id（默认当前激活场景）' },
      x: { type: 'number', description: '目标 x 坐标' },
      y: { type: 'number', description: '目标 y 坐标' },
      waypoints: { type: 'array', items: { type: 'object' }, description: '途经点 [{x,y}]（可选，动画经过）' },
      animate: { type: 'boolean', description: '是否动画移动（默认 true）' },
    },
    ['x', 'y'],
    async (args) => {
      if (!args.uuid && !args.name) missing('provide either uuid or name')
      const body: Record<string, unknown> = { x: args.x, y: args.y }
      if (args.uuid) body.uuid = args.uuid
      if (args.name) body.name = args.name
      if (args.sceneId) body.sceneId = args.sceneId
      if (args.waypoints) body.waypoints = args.waypoints
      if (args.animate !== undefined) body.animate = args.animate
      return asObject(await callRelay('POST', '/move-token', { query: targetingQuery(args), body }))
    },
  ))

  // 20. foundry_get_scene —— 读场景（GET /scene）。拿「当前激活场景」的唯一正确途径。
  REG(makeTool(
    'foundry_get_scene',
    '读 Foundry 场景文档（GET /scene）。**这是拿"当前激活场景"的唯一途径**：active=true 返回世界当前激活场景（含 _id/name/width/height/grid.size/tokens），viewed=true 返回 GM 当前正在查看的场景，sceneId/name 拿指定场景，all=true 返回全部场景。用户说"放地图上/放到我激活的地图"且未指定场景名时：先调本工具 active=true 拿激活场景 id + grid.size，再 foundry_place_token 放怪（不传 sceneId 即默认激活场景）。世界内场景用 foundry_search 搜不到（search 只索引 compendium），必须用本工具。⚠️省 token：场景含全量 token 数据很大，放怪/看网格用 summary:true（返回网格+尺寸+token 坐标列表），需要完整文档才不传。',
    {
      active: { type: 'boolean', description: 'true 返回当前激活场景（推荐先试这个）' },
      viewed: { type: 'boolean', description: 'true 返回 GM 当前正在查看的场景' },
      sceneId: { type: 'string', description: '指定场景 id' },
      name: { type: 'string', description: '按场景名查' },
      all: { type: 'boolean', description: 'true 返回全部场景列表' },
      summary: { type: 'boolean', description: 'true 返回精简摘要（网格/尺寸/token 坐标列表），省 token；默认 false 返回完整文档' },
    },
    [],
    async (args) => {
      const q: Record<string, unknown> = { ...targetingQuery(args) }
      if (args.active !== undefined) q.active = args.active
      if (args.viewed !== undefined) q.viewed = args.viewed
      if (args.sceneId) q.sceneId = args.sceneId
      if (args.name) q.name = args.name
      if (args.all !== undefined) q.all = args.all
      const raw = await callRelay('GET', '/scene', { query: q })
      const value = asObject(raw)
      if (args.summary === true) {
        const arr = value.results
        if (Array.isArray(arr)) {
          return { results: arr.map((s) => summarizeDoc(s)), total: value.total }
        }
        return summarizeDoc(value)
      }
      return value
    },
  ))

  // 21+. 全量补齐：dnd5e 系统操作 / 遭遇回合 / 场景画布 / 聊天 / 用户 / 宏 JS / 文件 / 声音 / 世界信息。
  registerExtraTools({ makeTool, callRelay, asObject, targetingQuery }, REG as (t: { name: string }) => void)

  // 87. 内置结构参考库（本地模板，省 token）。
  registerReferenceTools(REG as (t: { name: string }) => void)

  // 88. 按需读用户本地 FVTT 资料库（血泪教训/数据字典/图标真源）+ 本地样本库（真实配置实体 JSON 抄改）。
  registerKnowledgeTools(REG as (t: { name: string }) => void, () => {
    try {
      const raw = readFileSync(CONFIG_FILE, 'utf8').replace(/^\uFEFF/, '')
      const c = JSON.parse(raw) as { knowledgeDir?: string }
      if (c.knowledgeDir) return c.knowledgeDir
    } catch {
      // 无文件/损坏：走 env + 默认。
    }
    return process.env.FOUNDRY_KNOWLEDGE_DIR || DEFAULT_KNOWLEDGE_DIR
  }, () => {
    try {
      const raw = readFileSync(CONFIG_FILE, 'utf8').replace(/^\uFEFF/, '')
      const c = JSON.parse(raw) as { sampleDir?: string }
      if (c.sampleDir) return c.sampleDir
    } catch {
      // 无文件/损坏：走 env + 默认。
    }
    return process.env.FOUNDRY_SAMPLE_DIR || DEFAULT_SAMPLE_DIR
  })

  ctx.logger?.info?.('[' + name + '] FVTT 控制工具已就绪（relay + 88 工具）。配置：' + CONFIG_FILE)
}

export { name, inject }
