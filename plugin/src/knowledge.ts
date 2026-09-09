/**
 * foundry_knowledge —— 按需读用户本地 FVTT 资料库（血泪教训/数据字典/图标真源）。
 *
 * 解决「AI 碰到 reference 内置模板覆盖不到的深层问题（复杂 flags/宏/陷阱/光环）
 * 只能猜或浪费 token 现查世界」的问题：把用户亲手沉淀的资料库做成可检索的本地知识源。
 * - topic 白名单：只允许读资料库里明确列出的文件，防任意文件读取。
 * - query 行搜索：大文件（data-dict 389KB）先 grep 定位再用 offset 读原文。
 * - offset 分页：每页 ≤ PAGE_SIZE 字符，避免大文件整份灌进上下文。
 */

import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PAGE_SIZE = 4000
const MAX_GREP_LINES = 40
const MAX_LINE_CHARS = 400

/**
 * 内置知识文档（随插件包发布，clone 仓库的人没有本机资料库也能用）。
 * 文件位于 <插件包>/lib/knowledge-docs/*.md（build 时从 src/knowledge-docs/ 拷贝）。
 * 内容 = 本机资料库精华的通用化提炼（结构模板/效应配方/宏体系/纪律与坑）。
 */
const BUILTIN_KB_DIR = join(dirname(fileURLToPath(import.meta.url)), 'knowledge-docs')

/** 内置样本库目录（随插件包发布）：<插件包>/lib/samples，分类文件夹 + 用户拖入的真实配置实体 JSON。 */
const BUILTIN_SAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'samples')

/** 内置主题：topic → 内置文档文件名 + 描述。 */
const BUILTIN_TOPICS: Record<string, { file: string; desc: string }> = {
  'kb-structure': { file: '01-结构模板.md', desc: 'dnd5e 5.3.x 结构模板：武器（damage.base 铁律）/豁免三件套+层级铁律/ActiveEffect/NPC 骨架/feat+spell/状态 id 全集' },
  'kb-effects': { file: '02-效应配方.md', desc: '效应配方：mode 表/加伤（bonuses）/OverTime 持续伤害/常用 flags/物品宏三件套/光环/DAE 机制与 change-key 配方/激活条件/附魔/Optional/反应触发' },
  'kb-macros': { file: '03-宏体系.md', desc: '宏体系：挂宏 6 位置/Document 模型铁律/MidiQOL 常用函数/世界脚本与 CPR fork/DAE 宏/socket 远程委托/调试三板斧' },
  'kb-pitfalls': { file: '04-纪律与坑.md', desc: '纪律与坑：开工五病根七铁律/高频坑速查（effects 层级/伤害骰两说/DC 两说/图标 404/回读误报）/术语对照/卡面纪律/世界数据纪律' },
  deploy: { file: '05-部署与排障.md', desc: '部署与排障手册（随插件发布）：架构/一次性安装四步/配对码流程与 relay 字段/故障速查表/408「世界在线但请求全超时」自诊断与处理/配置字段/日常运维。**遇到配对、装模块、连不上、超时 408 先读这个**' },
}

/** 资料库白名单：topic → 相对 knowledgeDir 的文件路径（真实文件名，已 glob 确认）。 */
const TOPICS: Record<string, { file: string; desc: string }> = {
  'iron-rules': { file: 'FVTT-已验证机制速查与开工铁律.md', desc: '已验证机制键名速查 + 开工铁律 + 废弃路线清单（做效果前先读）' },
  'data-dict': { file: 'FVTT-data-dict-v9_1.md', desc: 'FVTT 机制数据字典 389KB（§14 CPR/§17 OverTime/§26 宏挂载/§30C Optional 加值），大文件先 query 定位' },
  'monster-spec': { file: 'FVTT-monster-spec-v2_1.md', desc: '怪物/物品 JSON 结构规范 92KB（含 M7 宏三件套）' },
  icons: { file: 'fvtt-icon-paths.txt', desc: '图标路径真源 323KB，grep 拿真路径，绝不猜（先 query 搜关键词）' },
  'item-macro': { file: 'midi的物品宏使用指南.md', desc: '物品宏完整指南（三件套/macroPass 全表/宏体骨架/铁律）' },
  'creature-guide': { file: '01_搓怪物.md', desc: '搓怪物提示词模板（5 步流程 + 必读资料清单）' },
  'world-macros': { file: '世界脚本的宏.json', desc: '用户世界脚本宏合集 JSON（找现成宏金标准）' },
  'macro-format': { file: '世界脚本宏格式规范.md', desc: '世界脚本宏格式规范' },
  'world-script': { file: '世界脚本管理器使用教程.md', desc: '世界脚本管理器使用教程' },
  'fx-sync': { file: 'FVTT特效同步规范-fxExecCode.md', desc: '特效同步规范 fxExecCode' },
  'cpr-mapping': { file: 'dnd5e_classpack-cpr-mapping.json', desc: 'dnd5e classpack ↔ CPR 怪物映射表（找 CPR 怪物对应关系）' },
  pitfalls: { file: '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\之前踩过的坑.txt', desc: 'socket/权限/LHGM 委托/光环/附身符七大坑（最高优先级坑书）' },
  methodology: { file: '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\血的教训-开工方法论篇.md', desc: '开工方法论总纲（五病根+七铁律+资料索引优先级）' },
  'forced-move': { file: '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\血的教训-强迫目标移动篇.md', desc: '冲击印记 5 小时击退翻车史与正解（强迫目标移动/命中引爆）' },
  traps: { file: '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\血的教训-简单陷阱篇.md', desc: 'Region 陷阱/场景按钮/浮动面板翻车史与正解' },
  armband: { file: '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\制作妄质百变腕甲-踩坑与新知识.md', desc: '活动结构/特殊时长/change 键全表（做可变身物品必读）' },
  'css-panel': { file: '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\血的教训-CSS面板配置篇.md', desc: '模块 UI 面板/自定义 CSS/Dialog 弹窗样式坑' },
  'remote-ui': { file: '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\血的教训-远程盲调UI篇.md', desc: '远程盲调 UI 的坑' },
  dialog: { file: '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\血的教训-DialogV2弹窗选择器篇.md', desc: 'DialogV2 弹窗选择器坑' },
  'feishu-index': { file: '飞书知识库\\00-总目录-FVTT从入门到入土.md', desc: '飞书知识库总目录（56 篇索引，先看这个找该读哪篇）' },
  'feishu-flags': { file: '飞书知识库\\43-midi-qol标志参考.md', desc: 'midi-qol 标志参考（onUseMacroName 逗号式出处）' },
  'feishu-keys': { file: '飞书知识库\\46-属性键值.md', desc: '属性键值表' },
  'feishu-midi-funcs': { file: '飞书知识库\\50-MidiQOL函数大全.md', desc: 'MidiQOL 函数大全（宏里能调的函数）' },
  'feishu-signatures': { file: '飞书知识库\\55-函数签名.md', desc: '函数签名速查' },
  'feishu-conditions': { file: '飞书知识库\\36-激活条件.md', desc: '激活条件语法' },
  'feishu-auto-core': { file: '飞书知识库\\42-自动化核心.md', desc: '自动化核心概念' },
  'feishu-dnd53': { file: '飞书知识库\\29-DND5e v5.x.x.md', desc: 'DND5e v5.x.x 系统说明（Line 84 有宏存放位置）' },
  'feishu-exhaustion': { file: '飞书知识库\\34-力竭.md', desc: '力竭机制（macroPass 判别范本）' },
  'feishu-macro': { file: '飞书知识库\\16-宏相关.md', desc: '宏相关（挂宏/宏类型总览）' },
  'feishu-macro-basics': { file: '飞书知识库\\39-宏基础入门教程.md', desc: '宏基础入门教程' },
  'feishu-cpr-macro': { file: '飞书知识库\\47-CPR自定义宏制作.md', desc: 'CPR 自定义宏制作（fork 官方宏流程）' },
  'feishu-syntax': { file: '飞书知识库\\45-语法.md', desc: 'CPR 宏语法' },
  'feishu-other-actions': { file: '飞书知识库\\49-使用其他行动.md', desc: '使用其他行动（多行动联动）' },
  'feishu-reaction': { file: '飞书知识库\\52-MIDI反应自动化.md', desc: 'MIDI 反应自动化' },
  'feishu-multi-save': { file: '飞书知识库\\53-midi多属性豁免.md', desc: 'midi 多属性豁免' },
  'feishu-self-target': { file: '飞书知识库\\54-特殊目标-self.md', desc: '特殊目标 self（自我施法目标）' },
}

/** 默认资料库根目录（可用 config.json 的 knowledgeDir 覆盖）。 */
const DEFAULT_KNOWLEDGE_DIR = 'C:\\Users\\龙华\\Desktop\\智能体\\01_跑团工具\\FVTT技术资料'

/** 默认样本库目录（可用 config.json 的 sampleDir 覆盖）：世界导出的真实配置实体 JSON。 */
const DEFAULT_SAMPLE_DIR = 'C:\\Users\\龙华\\Desktop\\智能体\\01_跑团工具\\怪物与物品卡'

/** 样本库已知金标准标签（按文件名关键词匹配，用于索引展示；其余样本用文件名+大小）。 */
const SAMPLE_LABELS: Array<{ key: string; label: string }> = [
  { key: '磁轭手铳', label: '★物品宏金标准（onUseMacroName+dae.macro 三件套完整实例）' },
  { key: '妄质百变腕甲', label: '★复杂活动结构/变身物品（140KB 完整字段实例）' },
  { key: '金属龙吐息武器', label: '★武器自动化版（活动+豁免+效果全配置实例）' },
  { key: '秘法魔剑士', label: '高等级 NPC 完整卡（法术+物品+特性 112KB）' },
  { key: '唯死之舞', label: '带战斗自动化机制的 NPC（67KB）' },
  { key: '巴哈姆特', label: '传奇生物完整卡（32KB）' },
]

/**
 * 注册 foundry_knowledge 工具。
 * @param REG 工具注册函数（与 registerReferenceTools 同签名）
 * @param getKnowledgeDir 解析 knowledgeDir 的函数（由 index.ts 注入，读 config）
 */
export function registerKnowledgeTools(
  REG: (t: { name: string }) => void,
  getKnowledgeDir: () => string,
  getSampleDir: () => string,
) {
  const topics = Object.keys(TOPICS)
  const builtinTopics = Object.keys(BUILTIN_TOPICS)

  const tool: { name: string } & Record<string, unknown> = {
    name: 'foundry_knowledge',
    description:
      '按需读 FVTT 技术知识。三级：① 内置知识主题（随插件发布，任何环境可用，优先）：' + builtinTopics.join('/') + '；② 本机资料库（血泪教训/数据字典/图标真源/世界宏金标准，若配置了 knowledgeDir 才有，主题：' + topics.join('/') + '）；③ 本地样本库（topic:"samples"，世界导出的真实配置实体 JSON——建物品/怪/自动化前先来这找同类真实样本，照抄结构改数值，一次过）。**碰到 foundry_reference 内置模板没覆盖的深层问题（复杂 flags/宏/陷阱/光环/图标路径）先查这里，0 实例的键名禁用。** 用法：① topic:"samples" 不带 file 参数 = 列出样本目录索引（文件名+大小+标签）；② 带 file 参数（索引里的文件名）= 读该样本（大文件先传 query 关键词 grep 定位，再传 offset 翻页，每页 ' + PAGE_SIZE + ' 字符）；③ 资料库/内置主题同理：大文件先 query 定位再 offset 读原文。',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: '知识主题。内置：' + builtinTopics.join(' / ') + '；本机资料库：' + topics.join(' / ') + '；本地样本库："samples"（世界导出的真实配置实体，抄改首选）' },
        file: { type: 'string', description: '可选：样本文件名（仅 topic:"samples" 时用，文件名从 samples 索引拿）' },
        query: { type: 'string', description: '可选：按行搜索关键词（如 "OverTime"/"光环"/"图标"），返回最多 40 行匹配（含行号）。大文件先 query 定位再 offset 读原文。' },
        offset: { type: 'number', description: '可选：从第几个字符开始读原文（无 query 时生效，默认 0）。返回值里有 nextOffset 与 hasMore 用于翻页。' },
      },
      required: ['topic'],
      additionalProperties: true,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args: unknown, value: unknown): Array<{ type: 'text'; text: string }> => {
        const v = value as { content?: string; error?: string } | string
        if (typeof v === 'string') return [{ type: 'text', text: v }]
        if (v && typeof v === 'object' && typeof v.content === 'string') return [{ type: 'text', text: v.content }]
        return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
      },
    },
    async execute(args: Record<string, unknown>) {
      const topic = String(args.topic)

      // 内置主题：读插件包自带 knowledge-docs（任何环境可用）
      if (BUILTIN_TOPICS[topic]) {
        const entry = BUILTIN_TOPICS[topic]
        const file = join(BUILTIN_KB_DIR, entry.file)
        if (!existsSync(file)) {
          return { topic, error: '内置知识文档缺失：' + file + '（插件包不完整，请重装插件）' }
        }
        let text: string
        try {
          text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')
        } catch (e) {
          return { topic, file: entry.file, error: '内置文档读取失败：' + (e instanceof Error ? e.message : String(e)) }
        }
        return servePage(args, topic, entry.file, entry.desc, text)
      }

      // 样本库：内置（随 git 发布的分类样本库）+ 本机扩展目录。topic="samples"。
      if (topic === 'samples') {
        const roots: Array<{ root: string; label: string }> = [{ root: BUILTIN_SAMPLES_DIR, label: '内置样本库（随 git 发布）' }]
        const localRoot = getSampleDir()
        if (localRoot && existsSync(localRoot) && resolve(localRoot) !== resolve(BUILTIN_SAMPLES_DIR)) {
          roots.push({ root: localRoot, label: '本机扩展' })
        }
        const fileName = args.file === undefined ? '' : String(args.file)
        if (!fileName) {
          // 无 file：列分类树索引。
          const parts: string[] = []
          let totalFiles = 0
          for (const r of roots) {
            if (!existsSync(r.root)) continue
            try {
              const files = (await walkTree(r.root)).sort((a, b) => a.rel.localeCompare(b.rel))
              totalFiles += files.filter((f) => f.rel.toLowerCase().endsWith('.json')).length
              // 按顶层文件夹分组成树
              const tree = new Map<string, Array<{ rel: string; KB: number }>>()
              for (const f of files) {
                const slash = f.rel.indexOf('/')
                const top = slash > 0 ? f.rel.slice(0, slash) : f.rel
                const rest = slash > 0 ? f.rel.slice(slash + 1) : ''
                if (!tree.has(top)) tree.set(top, [])
                tree.get(top)!.push({ rel: rest, KB: Math.round(f.size / 1024) })
              }
              const lines = ['■ ' + r.label + '：' + r.root]
              for (const [top, items] of tree) {
                if (items.length === 1 && items[0].rel === '') {
                  lines.push('  ' + top + '（' + items[0].KB + 'KB）')
                } else {
                  lines.push('  ' + top + '/')
                  for (const it of items) lines.push('    ' + it.rel + '（' + it.KB + 'KB）')
                }
              }
              parts.push(lines.join('\n'))
            } catch (e) {
              parts.push('■ ' + r.label + '：' + r.root + '（读取失败：' + (e instanceof Error ? e.message : String(e)) + '）')
            }
          }
          if (parts.length === 0) {
            return { topic, error: '样本库不可用：内置样本目录与 sampleDir 均不存在。' }
          }
          return {
            topic,
            total: totalFiles,
            content:
              '【样本库索引】共 ' + totalFiles + ' 个样本 JSON（世界导出的真实配置实体——建东西前先来这找同类样本：读它的结构→照抄→改数值，一次过）：\n' +
              parts.join('\n') +
              '\n\n用法：foundry_knowledge{topic:"samples", file:"<分类文件夹>/<文件名>"} 读样本（内置样本需带分类子路径，如 "01-武器与攻击/xxx.json"）；每个分类文件夹里有 README 说明放什么。大文件先加 query 关键词 grep 定位（如 "OverTime"/"onUseMacroName"/"activities"），再 offset 翻页。',
          }
        }
        // 有 file：先查内置样本树，再查本机扩展。防目录逃逸。
        for (const r of roots) {
          if (!existsSync(r.root)) continue
          const rootResolved = resolve(r.root)
          const target = resolve(join(r.root, fileName))
          if ((target.startsWith(rootResolved + '\\') || target.startsWith(rootResolved + '/')) && existsSync(target)) {
            let text: string
            try {
              text = (await readFile(target, 'utf8')).replace(/^\uFEFF/, '')
            } catch (e) {
              return { topic, file: fileName, error: '样本读取失败：' + (e instanceof Error ? e.message : String(e)) }
            }
            const label = SAMPLE_LABELS.find((s) => fileName.includes(s.key))
            return servePage(args, topic, fileName, (label ? label.label + '；' : '') + '世界导出的真实配置实体 JSON，结构可照抄（改 name/数值/描述）。', text)
          }
        }
        return { topic, file: fileName, error: '样本文件未找到：「' + fileName + '」。file 请用 samples 索引里列出的路径（内置样本带分类文件夹前缀）。' }
      }

      // 本机资料库主题：依赖用户环境的 knowledgeDir
      const entry = TOPICS[topic]
      if (!entry) {
        return { topic, error: '未知知识主题「' + topic + '」。内置：' + builtinTopics.join(', ') + '；本机资料库（若已配置 knowledgeDir）：' + topics.join(', ') }
      }
      const root = getKnowledgeDir()
      if (!root || !existsSync(root)) {
        return {
          topic,
          file: entry.file,
          error: '本机资料库未找到（knowledgeDir 指向「' + root + '」不存在）。当前环境没有本机资料库时，请改用内置主题：' + builtinTopics.join(', ') + '（随插件发布，覆盖结构模板/效应配方/宏体系/纪律坑）。',
        }
      }
      const file = resolve(join(root, entry.file))
      let text: string
      try {
        text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')
      } catch (e) {
        return {
          topic,
          file: entry.file,
          error: '资料库文件读取失败：' + file + '（' + (e instanceof Error ? e.message : String(e)) + '）。可检查 config.json 的 knowledgeDir 指向资料库根目录。',
        }
      }
      return servePage(args, topic, entry.file, entry.desc, text)
    },
  }
  REG(tool)
}

/** 递归列目录下所有文件（相对路径 + 字节数）。 */
async function walkTree(dir: string, prefix = ''): Promise<Array<{ rel: string; size: number }>> {
  const out: Array<{ rel: string; size: number }> = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const rel = prefix ? prefix + '/' + e.name : e.name
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      out.push(...(await walkTree(full, rel)))
    } else {
      out.push({ rel, size: (await readFile(full)).length })
    }
  }
  return out
}

/** 分页/检索服务：query 走行 grep，否则 offset 分页。 */
async function servePage(args: Record<string, unknown>, topic: string, fileName: string, desc: string, text: string) {
  const query = args.query === undefined ? '' : String(args.query)
  if (query) {
    const lines = text.split(/\r?\n/)
    const hits: string[] = []
    for (let i = 0; i < lines.length && hits.length < MAX_GREP_LINES; i++) {
      const line = lines[i]
      if (line.toLowerCase().includes(query.toLowerCase())) {
        hits.push('L' + (i + 1) + ': ' + line.slice(0, MAX_LINE_CHARS))
      }
    }
    if (hits.length === 0) {
      return { topic, file: fileName, query, totalChars: text.length, matched: 0, content: '「' + query + '」无匹配行。换关键词，或传 offset 读全文（文件 ' + text.length + ' 字符）。' }
    }
    const truncated = hits.length >= MAX_GREP_LINES ? '\n（已达 ' + MAX_GREP_LINES + ' 行上限，可能还有更多匹配；可换更精确关键词）' : ''
    return {
      topic, file: fileName, query, matched: hits.length, totalChars: text.length,
      content: '【' + desc + '】\n文件：' + fileName + '\n匹配「' + query + '」' + hits.length + ' 行：\n' + hits.join('\n') + truncated,
    }
  }

  const offset = Math.max(0, Math.floor(Number(args.offset) || 0))
  const chunk = text.slice(offset, offset + PAGE_SIZE)
  const nextOffset = offset + chunk.length
  const hasMore = nextOffset < text.length
  return {
    topic,
    file: fileName,
    desc,
    totalChars: text.length,
    offset,
    nextOffset,
    hasMore,
    content:
      '【' + desc + '】\n文件：' + fileName + '（共 ' + text.length + ' 字符）\n第 ' + offset + '–' + nextOffset + ' 字符' + (hasMore ? '（还有更多，传 offset=' + nextOffset + ' 继续读）' : '（已到末尾）') + '：\n' + chunk,
  }
}

export { DEFAULT_KNOWLEDGE_DIR, DEFAULT_SAMPLE_DIR, TOPICS }
