/**
 * foundry_knowledge —— 按需读用户本地 FVTT 资料库（血泪教训/数据字典/图标真源）。
 *
 * 解决「AI 碰到 reference 内置模板覆盖不到的深层问题（复杂 flags/宏/陷阱/光环）
 * 只能猜或浪费 token 现查世界」的问题：把用户亲手沉淀的资料库做成可检索的本地知识源。
 * - topic 白名单：只允许读资料库里明确列出的文件，防任意文件读取。
 * - query 行搜索：大文件（data-dict 389KB）先 grep 定位再用 offset 读原文。
 * - offset 分页：每页 ≤ PAGE_SIZE 字符，避免大文件整份灌进上下文。
 */

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const PAGE_SIZE = 4000
const MAX_GREP_LINES = 40
const MAX_LINE_CHARS = 400

/** 图标真源清单缓存（6560 条，首次检索时读入，之后按目录/关键词过滤）。 */
let ICON_CACHE: string[] | null = null

/**
 * 图标检索用的大类权重名单（只是「哪一类更像实物图」的粗分，不是路径映射）。
 * 物品类提权：AI 建物品/给效果配图时最常要的是这类写真图。
 * 特效与技能类降权：多为法术光效与技能符号，当物品图标不合适（但 AI 显式加 dir 指定时照样能查到）。
 * 只影响同级别候选的排序（±15 分），不改变命中范围，不会漏掉任何图。
 */
const ITEM_DIRS = [
  'icons/weapons/',
  'icons/equipment/',
  'icons/containers/',
  'icons/consumables/',
  'icons/commodities/',
  'icons/tools/',
  'icons/sundries/',
  'icons/plants/',
]
const EFFECT_DIRS = ['icons/magic/', 'icons/skills/']

/**
 * 内置知识文档（随插件包发布，clone 仓库的人没有本机资料库也能用）。
 * 文件位于 <插件包>/lib/knowledge-docs/*.md（build 时从 src/knowledge-docs/ 拷贝）。
 * 内容 = 本机资料库精华的通用化提炼（结构模板/效应配方/宏体系/纪律与坑）。
 */
const BUILTIN_KB_DIR = join(dirname(fileURLToPath(import.meta.url)), 'knowledge-docs')

/** 内置样本库目录（随插件包发布）：<插件包>/lib/samples，分类文件夹 + 用户拖入的真实配置实体 JSON。 */
const BUILTIN_SAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'samples')

/**
 * 内置原样文档库（随插件包发布）：<插件包>/lib/knowledge-manuals。
 * 内容 = 模块官方文档（29 个模块，144 篇）+ 飞书知识库原文（**已归并为一套，243 篇**）的 .md 原文（不含配图），共 387 篇。
 * 与 knowledge-docs（提炼件）的区别：这边是原文，可 grep 到具体 API/字段的原始出处。
 * ⚠️ 2026-10-07 归并：原先「编号版 57 篇」与「Wiki 全文版 186 篇」两个目录已合成一个「飞书知识库」（243 篇），
 *    17 个 feishu-* 主题路径因此一行未改。
 *    归并前逐篇做过正文行级重合度比对：**只有 3 篇重合度 >= 90%**（09-在线安装教程 98% / 41-DND资源 97% / 42-自动化核心 96%），
 *    其余 53 篇都有独有内容（30-掷骰数据 3% / 21-dnd5.3兼容性检查表 0% / 55-函数签名 16% / 43-midi-qol标志参考 19%），
 *    所以**一篇没删、全量并入** —— 当时若按「指纹命中」粗判删掉编号版，会丢掉动态引用总表、兼容性检查表、函数签名等关键内容。
 */
const BUILTIN_MANUALS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'knowledge-manuals')

/**
 * 内置「本机资料库」副本（随插件包发布）：<插件包>/lib/knowledge-local。
 * 内容 = 原知识库沉淀的通用化副本（已脱敏：去掉本地路径与自建模块 id），
 * 含数据字典/怪物规格/自动化指北/宏体系/CPR 指南/坑书 14 篇/monk wiki 等。
 * 查找顺序：本机 knowledgeDir（用户可能已更新）→ 内置副本（任何环境可用）。
 */
const BUILTIN_LOCAL_DIR = join(dirname(fileURLToPath(import.meta.url)), 'knowledge-local')

/** 内置主题：topic → 内置文档文件名 + 描述。 */
const BUILTIN_TOPICS: Record<string, { file: string; desc: string }> = {
  'kb-structure': { file: '01-结构模板.md', desc: 'dnd5e 5.3.x 结构模板：武器（damage.base 铁律）/豁免三件套+层级铁律/ActiveEffect/NPC 骨架/feat+spell/状态 id 全集' },
  'kb-effects': { file: '02-效应配方.md', desc: '效应配方：mode 表/加伤（bonuses）/OverTime 持续伤害/常用 flags/物品宏三件套/光环/DAE 机制与 change-key 配方/激活条件/附魔/Optional/反应触发' },
  'kb-macros': { file: '03-宏体系.md', desc: '宏体系：挂宏 6 位置/Document 模型铁律/MidiQOL 常用函数/世界脚本与 CPR fork/DAE 宏/socket 远程委托/调试三板斧' },
  'kb-pitfalls': { file: '04-纪律与坑.md', desc: '纪律与坑：开工五病根七铁律/高频坑速查（effects 层级/伤害骰两说/DC 两说/图标 404/回读误报）/术语对照/卡面纪律/世界数据纪律' },
  deploy: { file: '05-部署与排障.md', desc: '部署与排障手册（随插件发布）：架构/一次性安装四步/配对码流程与 relay 字段/故障速查表/408「世界在线但请求全超时」自诊断与处理/配置字段/日常运维。**遇到配对、装模块、连不上、超时 408 先读这个**' },
  'icon-map': { file: '06-图标地图.md', desc: '图标分类地图（随插件发布）：13 大类路径前缀 + icons/svg 全清单 + 高频实战映射（武器/护甲/药水/法术/状态/token 去哪找）。**找图标先读这个定位前缀，再去 icons 主题 grep**' },
  icons: { file: 'fvtt-icon-paths.txt', desc: '图标路径真源 6560 条（随插件发布，任何环境可用）：query 搜关键词（如 halberd/potion-red/poison）拿真路径照抄，绝不猜。查不到就换词根，别自己拼路径' },
}

/** 资料库白名单：topic → 相对 knowledgeDir 的文件路径（真实文件名，已 glob 确认）。 */
const TOPICS: Record<string, { file: string; desc: string }> = {
  'iron-rules': { file: 'FVTT-已验证机制速查与开工铁律.md', desc: '已验证机制键名速查 + 开工铁律 + 废弃路线清单（做效果前先读）' },
  'data-dict': { file: 'FVTT-data-dict-v9_1.md', desc: 'FVTT 机制数据字典 389KB（§14 CPR/§17 OverTime/§26 宏挂载/§30C Optional 加值），大文件先 query 定位' },
  'monster-spec': { file: 'FVTT-monster-spec-v2_1.md', desc: '怪物/物品 JSON 结构规范 92KB（含 M7 宏三件套）' },
  'icons-local': { file: 'fvtt-icon-paths.txt', desc: '本机图标真源文件（与内置 topic:"icons" 同一份内容；保留此条目仅为兼容旧引用，正常请用内置 icons）' },
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
  // ↓ 以下为随包发布的内置副本新增主题（knowledge-local/ 下），本机不存在时自动走内置
  'auto-guide': { file: '(已瘦身)自动化指北——哪些自动化需要用到什么？.md', desc: '自动化指北 393KB（中文）：哪些效果需要哪些模块/写法，做自动化前先查这张总表。大文件先 query 定位' },
  'macro-compendium': { file: '(已瘦身)宏相关.md', desc: '宏相关汇编 103KB：挂宏位置/宏类型/常用写法总集。大文件先 query 定位' },
  'dnd5e-quickref': { file: 'dnd5e官方写法速查-5.3.3.md', desc: 'dnd5e 官方写法速查（已按 5.3.3 校准，不是 wiki 现行的 6.0.0）：字段与路径权威出处' },
  'midi-guide': { file: 'midi入门指南（必看）.md', desc: 'midi 入门指南 28KB（中文）：midi-qol 从零到能用的完整教程' },
  'cpr-universe': { file: '(已瘦身)CPR宇宙使用指南.md', desc: 'CPR 宇宙使用指南 27KB（中文）：Cauldron of Plentiful Resources 全貌' },
  'overtime': { file: 'OvertimeActivity使用说明.md', desc: 'OverTime 行动版使用说明（行动级持续伤害写法）' },
  'map-troubleshoot': { file: 'Foundry地图加载问题排查手册.md', desc: '地图加载问题排查手册（场景打不开/加载失败）' },
  'aeris-tokens': { file: 'Aeris-Tokens-设置中文化方案.md', desc: 'aeris-tokens 设置中文化方案（模块 UI 汉化做法）' },
  'world-sync': { file: '血的教训\\血的教训-世界同步装置篇.md', desc: '世界同步装置踩坑史 40KB：跨世界同步的完整失败与正解' },
  'code-review': { file: '血的教训\\血的教训-代码审阅自检清单篇.md', desc: '代码审阅自检清单（交付前逐项过）' },
  'release-check': { file: '血的教训\\血的教训-发布校验与查证纪律篇.md', desc: '发布校验与查证纪律：发布前必数产物 / 被质疑先查证' },
  'aeris-rework': { file: '血的教训\\血的教训-Aeris-Tokens改版篇.md', desc: 'aeris-tokens 改版踩坑史 50KB（拖拽寻路禁区）' },
  'third-party-sync': { file: '血的教训\\血的教训-第三方同步模块并发写设置篇.md', desc: '第三方同步模块并发写设置坑' },
}

/** 默认资料库根目录（可用 config.json 的 knowledgeDir 覆盖）。 */
/**
 * ★★ 任务级入口表 —— foundry_howto 用它把「我要做什么」映射到「该读哪篇血泪教训 + 关键步骤」。
 * 为什么要有这张表：实测过「文档就在包里、索引也有，AI 依然不读，直接上手猜着做」。
 * 根因不是没文档，是没入口 —— AI 的本能是「找工具」，那就把文档入口做成工具。
 * 新增坑书时同步加一行；keys 要覆盖口语说法（用户/AI 会怎么说这件事）。
 */
const HOWTO: Array<{ keys: string[]; title: string; file: string; also?: string; steps: string[] }> = [
  {
    keys: ['建卡', '角色卡', '建角色', '角色', '等级', '升级', '升级授予', 'advancement', '子职', '授予', 'character', 'level', 'create actor', '熟练', '技能选择'],
    title: '建角色卡 / 改等级 / 升级授予（advancement）',
    file: '血的教训/血的教训-建卡与升级授予篇.md',
    also: 'LH建卡器-规格与重建说明.md',
    steps: [
      '等级的真实落点：挂在 actor 身上的 class item 的 system.levels —— 不是 actor 上的字段',
      '装 class/race/background 用 actor.createEmbeddedDocuments("Item",[doc.toObject()])（安全路径）',
      '跑 advancement 的 API：HitPoints 要【逐级】apply(L,{},{initial:true})；Trait 先 await adv.automaticApplicationValue(lv,{initial:true})，有值再 apply；ItemGrant apply(lv,{},{initial:true})；Subclass apply(3,{uuid},{})【不能带 initial】；ScaleValue 不用调（空函数）',
      '★ 致命坑：advancement.apply() 只改内存，绕过升级向导 = 僵尸物品 —— 之后 update()/delete() 全报 Item "xxx" does not exist，而且是当场就坏。正确姿势 = 影子卡算 → 真卡 createEmbeddedDocuments(items,{keepId:true})',
      '读 advancement 必须用 d.toObject().system.advancement（d.system.advancement 是 Collection，Object.keys 恒为 0）',
      '验证要看【派生值】：details.level / abilities.X.proficient / traits.armorProf（SetField，读要用 Array.from）/ actor.items.size',
      'HP 最后单独补：actor.update({"system.attributes.hp.value": max})',
    ],
  },
  {
    keys: ['批量', '跑批', '大量', '几百', 'bulk', '一次建很多', '批量改', '批量建'],
    title: '批量建 / 批量改（一次 >20 条）',
    file: '血的教训/血的教训-批量改模组数据篇.md',
    steps: [
      '逐条 await item.update() 会拖垮 relay（HTTP 408）',
      'Item.create 一次几百条会【静默返回 0】（世界一条没写、零报错，后面几批跟着失败）',
      '超时 ≠ 没执行 —— 先回读看数据在不在，别直接改参数重跑（会造重复）',
      '插件已有 foundry_create_batch（内建分批 30 条 / 90ms），优先用它',
    ],
  },
  {
    keys: ['消耗', '耗用', '找不到耗用项', 'consumption', '扣次数', '充能', '限次', '次数'],
    title: '消耗 / 目标 / 报「找不到耗用项」',
    file: '血的教训/血的教训-CPR脱钩与消耗目标篇.md',
    steps: [
      'consumption.targets 写 UUID 会坏、写 identifier 能活（_remapConsumptionTarget 只在当前 actor 上找物品）',
      '池不足抛 ConsumptionError 阻止使用，绝不静默也不扣负数',
      '限次特性点了不扣次数 → 查 consumption.targets 是不是空数组',
    ],
  },
  {
    keys: ['运行时值', 'labels', 'dc.value', '派生值', '不生效', '探针', 'probe', '读不到', '游戏里不对'],
    title: '读运行时值 / 卡面全对但游戏里不生效',
    file: '血的教训/血的教训-读运行时值的五个陷阱.md',
    steps: [
      'labels / dc.value 是 prepareData 算出来的，GET /get 拿不到 → 用 foundry_inspect{labels:true} 或 execute_js',
      '活动级 effects 的权威读法：it.toObject().system.activities[aid].effects（a._source.effects 不刷新、a.effects 的 _id 被隐藏）',
      '卡面全对但不生效 → 第一动作是 foundry_reference{topic:"probe"} 拿一段 F12 探针给使用者跑，别改代码猜',
    ],
  },
  {
    keys: ['跑批', '弹框', '看门狗', '零污染', 'DialogV2', '污染', '对话框'],
    title: '跑批零污染 / 弹框看门狗',
    file: '血的教训/血的教训-跑批零污染六源与弹框看门狗篇.md',
    steps: ['六源清单 / 五类框三类按钮 / 受控实验法 —— 批量作业前读一遍'],
  },
  {
    keys: ['造物', '配方', 'lh-crafting', '材料', '成品', '导入包', '商店'],
    title: '造物模块（lh-crafting）建卡 / 导入包',
    file: 'lh-crafting/造物-建卡与导入包.md',
    steps: [
      '写进 game.items 不进模块！必须写世界合集包 world.lh-crafting-data',
      '身份键是 flags.lh-crafting.splitKey，没有它就等于不存在',
      'pack.deleteDocuments 在 Foundry v13 不存在 → 用 pack.documentClass.deleteDocuments(ids,{pack:pack.collection})',
      'relay 黑名单绕过：game["settings"]["set"](...) 可用（字符串里没有连续的 game.settings.set）',
    ],
  },
  {
    keys: ['发版', '发布', 'release', '打包', '验证', '证据', '质疑', '你到底验证没'],
    title: '发布校验与查证纪律',
    file: '血的教训/血的教训-发布校验与查证纪律篇.md',
    steps: [
      '发布前必须【数产物】（zip 条目数、各目录文件数）并与上一版对比',
      '被质疑时第一动作是跑命令拿证据，不是解释、不是让用户去试',
      'zip 条目用反斜杠分隔，检查前要 -replace 归一，否则全部假阴性',
    ],
  },
  {
    keys: ['双形态', '变形武器', '多形态', '切换', '变形'],
    title: '双形态武器与活动自动化',
    file: '血的教训/血的教训-双形态武器与活动自动化篇.md',
    steps: ['transform 活动是「把 actor 变成另一个 actor」，不是物品变形；双形态用两把独立物品 + 切换宏，别用单物品多活动 + 宏切活动集合'],
  },
  {
    keys: ['世界同步', '多世界', '搬运', 'world-sync', '换世界'],
    title: '世界同步装置',
    file: '血的教训/血的教训-世界同步装置篇.md',
    steps: [],
  },
  {
    keys: ['坑', '总典', '全部坑', '还有什么坑', '十条', 'checklist'],
    title: '踩坑总典（459 条坑 + 831 条解法）',
    file: '血的教训/FVTT踩坑总典-血泪教训合集.md',
    steps: ['开头的「〇 · 只读十条」是最贵的十条 —— 接手任何 FVTT 活儿之前先看这个'],
  },
]

const DEFAULT_KNOWLEDGE_DIR = 'C:\\Users\\龙华\\Desktop\\智能体\\01_跑团工具\\FVTT技术资料'

/**
 * 实战坑表 —— AI 自己记的（由 foundry_learn 工具维护）。
 *
 * 存本机 `~/.dsh/dsh-foundry-vtt/learned.md`：**不进 git、不污染别人的包、换世界也不丢**。
 * 设计意图：AI 现场踩到的坑（必须带验证过的正确解法）写下来，下一个 AI 开局读
 * foundry_knowledge{topic:"learned"} 就能拿到 —— 同一个坑不踩第二次，越用越快。
 */
const LEARNED_DIR = join(homedir(), '.dsh', 'dsh-foundry-vtt')
const LEARNED_FILE = join(LEARNED_DIR, 'learned.md')

interface LearnedEntry {
  id: string
  title: string
  time: string
  tags: string[]
  symptom: string
  cause: string
  fix: string
}

/** 解析 learned.md：按 `## [Lxxx] 标题` 切块，取五个字段。文件不存在/格式乱都返回已解析到的部分。 */
function parseLearned(text: string): LearnedEntry[] {
  const out: LearnedEntry[] = []
  const blocks = text.split('\n## [')
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    const m = /^(L\d+)\]\s*(.*)$/.exec(b.slice(0, b.indexOf('\n') < 0 ? b.length : b.indexOf('\n')))
    if (!m) continue
    const nl = b.indexOf('\n')
    const body = nl < 0 ? '' : b.slice(nl + 1)
    const pick = (label: string): string => {
      const mm = new RegExp('- \\*\\*' + label + '\\*\\*: ?([^\\n]*)').exec(body)
      return mm ? mm[1].trim() : ''
    }
    out.push({
      id: m[1],
      title: m[2].trim(),
      time: pick('时间'),
      tags: pick('标签')
        .split(/[,，\s]+/)
        .filter(Boolean),
      symptom: pick('现象'),
      cause: pick('根因'),
      fix: pick('正确做法'),
    })
  }
  return out
}

/** 渲染 learned.md（AI 可读、人也可读）。 */
function renderLearned(entries: LearnedEntry[]): string {
  const parts: string[] = [
    '# 实战坑表（AI 自己记的）',
    '',
    '> 由 foundry_learn 工具维护：动手时踩到的坑 + **验证过的**正确解法。',
    '> 下一个 AI 开局读 foundry_knowledge{topic:"learned"} 就能拿到，同一个坑不踩第二次。',
    '',
  ]
  for (const e of entries) {
    parts.push('## [' + e.id + '] ' + e.title)
    parts.push('- **时间**: ' + e.time)
    if (e.tags.length) parts.push('- **标签**: ' + e.tags.join(', '))
    parts.push('- **现象**: ' + e.symptom)
    parts.push('- **根因**: ' + e.cause)
    parts.push('- **正确做法**: ' + e.fix)
    parts.push('')
  }
  return parts.join('\n')
}

async function readLearned(): Promise<LearnedEntry[]> {
  try {
    if (!existsSync(LEARNED_FILE)) return []
    return parseLearned((await readFile(LEARNED_FILE, 'utf8')).replace(/^\uFEFF/, ''))
  } catch {
    return []
  }
}

async function writeLearned(entries: LearnedEntry[]): Promise<void> {
  await mkdir(LEARNED_DIR, { recursive: true })
  await writeFile(LEARNED_FILE, renderLearned(entries), 'utf8')
}

/** 本地日期 yyyy-mm-dd（不用 toISOString，那是 UTC，东八区会差一天）。 */
function todayLocal(): string {
  return new Date().toLocaleDateString('sv-SE')
}

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
      '按需读 FVTT 技术知识。七级：① 内置知识主题（随插件发布，任何环境可用，优先）：' + builtinTopics.join('/') + '；② 原样文档库（topic:"manuals"，随插件发布，任何环境可用）：29 个模块的官方文档（144 篇）+ 飞书知识库原文（243 篇，已归并为一套，含总目录/函数签名/属性键值/激活条件/ATL语法等编号篇），共 387 篇——查模块 API/字段/函数签名的原始出处来这里，别猜；③ 资料库主题（topic 见下，**已随插件发布内置副本，任何环境可用**；本机 knowledgeDir 有更新版本时自动优先用它）：数据字典/怪物规格/自动化指北/宏汇编/midi 指南/CPR 宇宙/坑书/方法论等；④ topic:"local" = 内置资料库全索引（列全部文件路径，其余文件用 topic:"local", file:"<路径>" 读）；⑤ 样本库（topic:"samples"，世界导出的真实配置实体 JSON——建物品/怪/自动化前先来这找同类真实样本，照抄结构改数值，一次过）；⑥ ★★ topic:"all" + query = 【全库关键词检索】：跨全部内置知识库（主题文档 + 资料库 + 模块文档 + 飞书原文）搜一个词，返回一串「■ 文件路径 + L行号 + 该行原文」，**不知道要看哪一篇时就用它** —— 这是「直接问资料库」的入口，别硬猜、别凭记忆。；⑦ topic:"learned" = 【实战坑表】—— AI 自己记的坑与验证过的解法（由 foundry_learn 写入，存本机，跨会话跨世界累积）。**动手前顺手看一眼**，能避开已经踩过的坑；自己踩到新坑、确认解法之后用 foundry_learn 补一条，下一个 AI 就省一次。**碰到 foundry_reference 内置模板没覆盖的深层问题（复杂 flags/宏/陷阱/光环/图标路径）先查这里，0 实例的键名禁用。** 用法：① topic:"manuals"/"samples"/"local" 不带 file 参数 = 列出索引；② 带 file 参数（索引里的路径）= 读原文（大文件先传 query 关键词 grep 定位，再传 offset 翻页，每页 ' + PAGE_SIZE + ' 字符）；③ 资料库/内置主题同理：大文件先 query 定位再 offset 读原文。',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: '知识主题。内置：' + builtinTopics.join(' / ') + '；原样文档库："manuals"（模块官方文档 + 飞书知识库原文）；资料库（随包发布内置副本，本机有则优先）：' + topics.join(' / ') + '；"local"（内置资料库全索引，列全部文件路径）；样本库："samples"（世界导出的真实配置实体，抄改首选）；"learned"（实战坑表：AI 自己记的坑与正确解法，跨会话累积）' },
        file: { type: 'string', description: '可选：文档/样本路径（topic 为 "manuals" / "samples" / "local" 时用，传对应索引里列出的完整路径）' },
        query: { type: 'string', description: '按行搜索关键词（如 "OverTime"/"建卡"/"光环"），返回匹配行（含行号，最多 40 行/文件）。★ 两种用法：① 带 file 时 = 在该文件内 grep（大文件先 query 定位再 offset 读原文）；② **不带 file 时 = 在范围内全库检索** —— topic:"all" 跨全部知识库、topic:"local" 只搜资料库。不知道看哪一篇时用第 ② 种。' },
        offset: { type: 'number', description: '可选：从第几个字符开始读原文（无 query 时生效，默认 0）。返回值里有 nextOffset 与 hasMore 用于翻页。' },
        group: { type: 'string', description: '可选：只列 manuals 里某一组的文件（组名子串匹配，如 "midi-qol" / "CPR" / "Sequencer" / "飞书知识库"）。★ 不传 group 时只返回分组概览（组名 + 篇数），想看某组有哪些文件再传它 —— 这样省大量 token。分组名写错时会返回全部可用组名。' },
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

      // 实战坑表：AI 自己记的（foundry_learn 写入，存本机 ~/.dsh/dsh-foundry-vtt/learned.md）
      if (topic === 'learned') {
        const entries = await readLearned()
        if (!entries.length) {
          return {
            topic,
            total: 0,
            content:
              '还没有记录。\n动手时踩到坑、并且**确认了正确解法之后**，用 foundry_learn{action:"add", title, symptom, cause, fix, tags} 记下来 ——\n下一个 AI 开局就能读到，同一个坑不踩第二次。',
          }
        }
        const q = args.query === undefined ? '' : String(args.query).trim()
        if (q) {
          const low = q.toLowerCase()
          const hit = entries.filter((e) =>
            (e.id + ' ' + e.title + ' ' + e.tags.join(' ') + ' ' + e.symptom + ' ' + e.cause + ' ' + e.fix).toLowerCase().includes(low)
          )
          return {
            topic,
            query: q,
            total: entries.length,
            matched: hit.length,
            content: hit.length
              ? renderLearned(hit)
              : '没有匹配「' + q + '」的记录。现有条目：' + entries.map((e) => e.id + ' ' + e.title).join(' | '),
          }
        }
        return { topic, total: entries.length, content: renderLearned(entries) }
      }

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

      // 原样文档库：模块官方文档 + 飞书知识库（随 git 发布）。topic="manuals"。
      if (topic === 'manuals') {
        if (!existsSync(BUILTIN_MANUALS_DIR)) {
          return { topic, error: '原样文档库不可用：内置目录不存在（' + BUILTIN_MANUALS_DIR + '）。' }
        }
        const fileName = args.file === undefined ? '' : String(args.file)
        const groupArg = args.group === undefined ? '' : String(args.group).trim()
        if (!fileName) {
          let files: Array<{ rel: string; size: number }>
          try {
            files = (await walkTree(BUILTIN_MANUALS_DIR))
              .filter((f) => f.rel.toLowerCase().endsWith('.md'))
              .sort((a, b) => a.rel.localeCompare(b.rel))
          } catch (e) {
            return { topic, error: '原样文档库读取失败：' + (e instanceof Error ? e.message : String(e)) }
          }
          // 分组：模块文档/<模块>/<文件>.md → "模块文档/<模块>"；飞书知识库/<文件>.md → "飞书知识库"
          // 每行列**完整相对路径**（多个模块有同名 README.md，只列裸名 AI 拼不出 file 参数）
          const tree = new Map<string, string[]>()
          for (const f of files) {
            const seg = f.rel.split('/')
            const group = seg.length >= 3 ? seg[0] + '/' + seg[1] : seg[0]
            if (!tree.has(group)) tree.set(group, [])
            tree.get(group)!.push(f.rel + '（' + Math.max(1, Math.round(f.size / 1024)) + 'KB）')
          }
          const groupNames = Array.from(tree.keys()).sort()
          // 给了 group：只列这一组（单组超过 GROUP_MAX 篇就截断并提示改用 query）
          if (groupArg) {
            const want = groupArg.toLowerCase()
            const hit = groupNames.filter((g) => g.toLowerCase().includes(want))
            if (!hit.length) {
              return {
                topic,
                group: groupArg,
                error: '没有匹配的分组。可用分组名（共 ' + groupNames.length + ' 个）：' + groupNames.join(' | '),
              }
            }
            const lines: string[] = []
            for (const g of hit) {
              const items = (tree.get(g) || []).slice().sort()
              lines.push('  ' + g + '（' + items.length + ' 篇）')
              for (const it of items.slice(0, GROUP_MAX)) lines.push('    ' + it)
              if (items.length > GROUP_MAX) {
                lines.push('    …还有 ' + (items.length - GROUP_MAX) + ' 篇未列出 —— 这个组太大，改用 topic:"all" + query:"关键词" 检索更快')
              }
            }
            return {
              topic,
              group: groupArg,
              matchedGroups: hit,
              total: files.length,
              content:
                '【原样文档库 · 分组 ' + hit.join(' / ') + '】\n' +
                lines.join('\n') +
                '\n\n用法：foundry_knowledge{topic:"manuals", file:"<上面缩进行里的完整路径，直接照抄>"}。大文件（>20KB）先加 query 关键词 grep 定位（如 "onUseMacroName"/"flags"/"workflow"），再传 offset 翻页（每页 ' + PAGE_SIZE + ' 字符）。',
            }
          }
          // 没给 group：只列**分组概览**（原来是 378 篇全列，一次要 1.5 万字符 ≈ 1 万 token）
          const ov: string[] = []
          for (const g of groupNames) ov.push('  ' + g + '（' + (tree.get(g) || []).length + ' 篇）')
          return {
            topic,
            total: files.length,
            groups: groupNames.length,
            content:
              '【原样文档库索引】共 ' + files.length + ' 篇 / ' + groupNames.length + ' 个分组（模块官方文档 + 飞书知识库原文，随 git 发布，任何环境可用）：\n' +
              ov.join('\n') +
              '\n\n怎么往下查（按省 token 排序）：\n' +
              '★ 想找某个主题的内容 → topic:"all" + query:"关键词"（跨全部知识库检索，比翻目录快得多）\n' +
              '★ 想看某一组里有哪些文件 → 再传 group:"<组名>"（如 group:"midi-qol"、group:"CPR"、group:"飞书知识库"）\n' +
              '★ 已经知道文件路径 → file:"<完整路径>" 直接读；大文件先加 query 关键词 grep，再传 offset 翻页（每页 ' + PAGE_SIZE + ' 字符）',
          }
        }
        // 有 file：读文档，防目录逃逸
        const rootResolved = resolve(BUILTIN_MANUALS_DIR)
        const target = resolve(join(BUILTIN_MANUALS_DIR, fileName))
        const inside = target.startsWith(rootResolved + '\\') || target.startsWith(rootResolved + '/')
        if (!inside || !existsSync(target)) {
          return { topic, file: fileName, error: '文档未找到：「' + fileName + '」。file 请用 manuals 索引里列出的完整路径（如 "模块文档/Sequencer/index.md"）。' }
        }
        let text: string
        try {
          text = (await readFile(target, 'utf8')).replace(/^\uFEFF/, '')
        } catch (e) {
          return { topic, file: fileName, error: '文档读取失败：' + (e instanceof Error ? e.message : String(e)) }
        }
        return servePage(args, topic, fileName, '原样文档原文（模块官方文档 / 飞书知识库）', text)
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

      // ★ 全库检索：topic="all" + query ⇒ 跨全部内置知识库（docs/local/manuals）关键词检索。
      // 为什么单独做一个 topic：AI 经常「不知道要看哪一篇」——
      // 这时它既列不出索引（太多）也没法 grep（grep 要求先给 file），就卡死了。
      // 这个入口就是为那一刻准备的：给一个词，还它一串「文件 + 行号」。
      if (topic === 'all' || topic === 'search') {
        const q = args.query === undefined ? '' : String(args.query).trim()
        if (!q) {
          return {
            topic,
            error: 'topic:"all" 是【全库关键词检索】，必须带 query（例如 query:"建卡"、"OverTime"、"批量"）。' +
              '只想列索引就用 topic:"local"；想读某一篇就用 topic + file:"<路径>"。',
          }
        }
        const roots: Array<{ name: string; dir: string }> = [
          { name: '内置主题文档（结构模板/图标地图/部署排障）', dir: BUILTIN_KB_DIR },
          { name: '内置资料库（血的教训/审查记录/提示词库/自动化指北/数据字典）', dir: BUILTIN_LOCAL_DIR },
          { name: '模块文档与飞书原文（29 个模块 + 飞书知识库）', dir: BUILTIN_MANUALS_DIR },
        ]
        const parts: string[] = []
        let scannedTotal = 0
        let hitTotal = 0
        for (const r of roots) {
          if (!existsSync(r.dir)) continue
          const res = await searchTree(r.dir, q)
          scannedTotal += res.scanned
          hitTotal += res.hits.length
          if (res.hits.length) parts.push(formatSearchResult(q, r.name, res))
        }
        if (!parts.length) {
          return {
            topic, query: q, scannedFiles: scannedTotal, matched: 0,
            content: '【全库检索】跨全部内置知识库（扫了 ' + scannedTotal + ' 个文件）搜「' + q + '」无匹配。\n' +
              '① 换关键词或换词根（中文、英文各试一次）；② 用 topic:"local" 列索引人工找；' +
              '③ 先 foundry_howto{task:"<你的任务>"} 看有没有现成流程；④ 再没有就说实话缺什么，别编。',
          }
        }
        return { topic, query: q, scannedFiles: scannedTotal, matched: hitTotal, content: parts.join('\n\n') }
      }

      // 内置资料库总索引：topic="local"（随包发布的脱敏资料库副本，任何环境可用）
      if (topic === 'local') {
        if (!existsSync(BUILTIN_LOCAL_DIR)) {
          return { topic, error: '内置资料库副本不存在：' + BUILTIN_LOCAL_DIR + '（插件包不完整，请重装插件）' }
        }
        const fileName = args.file === undefined ? '' : String(args.file)
        // ★ 不带 file 却有 query ⇒ 在资料库范围内全库检索，而不是傻傻只列索引。
        // 这修掉了「文档在包里但 AI 读不到」的技术根因：以前不带 file 时 query 会被直接忽略。
        if (!fileName && args.query !== undefined && String(args.query).trim()) {
          const q = String(args.query).trim()
          const res = await searchTree(BUILTIN_LOCAL_DIR, q)
          return {
            topic, query: q, scope: '内置资料库', scannedFiles: res.scanned, matched: res.hits.length,
            content: formatSearchResult(q, '内置资料库', res),
          }
        }
        if (fileName) {
          const rootResolved = resolve(BUILTIN_LOCAL_DIR)
          const target = resolve(join(BUILTIN_LOCAL_DIR, fileName))
          const inside = target.startsWith(rootResolved + '\\') || target.startsWith(rootResolved + '/')
          if (!inside || !existsSync(target)) {
            return { topic, file: fileName, error: '资料未找到：「' + fileName + '」。file 请用 topic:"local" 索引里列出的相对路径。' }
          }
          let text: string
          try {
            text = (await readFile(target, 'utf8')).replace(/^\uFEFF/, '')
          } catch (e) {
            return { topic, file: fileName, error: '资料读取失败：' + (e instanceof Error ? e.message : String(e)) }
          }
          return servePage(args, topic, fileName, '内置资料库原文（随插件发布，已脱敏）', text)
        }
        let files: Array<{ rel: string; size: number }>
        try {
          files = (await walkTree(BUILTIN_LOCAL_DIR)).sort((a, b) => a.rel.localeCompare(b.rel))
        } catch (e) {
          return { topic, error: '内置资料库读取失败：' + (e instanceof Error ? e.message : String(e)) }
        }
        const tree = new Map<string, Array<{ rel: string; KB: number }>>()
        for (const f of files) {
          const slash = f.rel.indexOf('/')
          const top = slash > 0 ? f.rel.slice(0, slash) : '(根目录)'
          const rest = slash > 0 ? f.rel.slice(slash + 1) : f.rel
          if (!tree.has(top)) tree.set(top, [])
          tree.get(top)!.push({ rel: rest, KB: Math.max(1, Math.round(f.size / 1024)) })
        }
        const lines: string[] = []
        for (const [top, items] of tree) {
          lines.push('  ' + top + '/')
          for (const it of items) lines.push('    ' + it.rel + '（' + it.KB + 'KB）')
        }
        return {
          topic,
          total: files.length,
          content:
            '【内置资料库索引】共 ' + files.length + ' 个文件（随插件发布，任何环境可用；已脱敏）：\n' +
            lines.join('\n') +
            '\n\n用法：① 有专用主题的直接用主题名读 —— data-dict（数据字典）/monster-spec（怪物规格）/auto-guide（自动化指北）/macro-compendium（宏汇编）/dnd5e-quickref（5.3.3 官方写法）/midi-guide/cpr-universe/cpr-mapping/pitfalls（坑书）/methodology（方法论）/iron-rules/world-macros/世界脚本相关等；② 其余文件用 topic:"local", file:"<上面的相对路径>" 读；③ 大文件先加 query 关键词 grep 定位，再 offset 翻页。\n**做自动化、写宏、查模块机制前先来这里找对应资料，别凭记忆。**',
        }
      }

      // 资料库主题：① 本机 knowledgeDir（用户可能已更新）② 内置副本（随包发布，任何环境可用）
      const entry = TOPICS[topic]
      if (!entry) {
        return { topic, error: '未知知识主题「' + topic + '」。内置：' + builtinTopics.join(', ') + '；资料库主题（随包发布或本机 knowledgeDir）：' + topics.join(', ') + '；另有 topic:"local" 可列内置资料库全索引。' }
      }
      // ① 本机 knowledgeDir 优先（你自己的资料可能已更新）
      const root = getKnowledgeDir()
      if (root && existsSync(root)) {
        const file = resolve(join(root, entry.file))
        try {
          const text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')
          return servePage(args, topic, entry.file, entry.desc + '（本机资料库）', text)
        } catch { /* 本机没有这份 → 落到内置副本 */ }
      }
      // ② 内置副本兜底（随包发布，别人没有本机资料库也能用）
      // 注：内置副本里把坑书目录名简化为「血的教训」，此处做路径映射（本机仍用原目录名）
      const legacyDir = '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\'
      const mappedFile = entry.file.startsWith(legacyDir) ? '血的教训\\' + entry.file.slice(legacyDir.length) : entry.file
      const builtinCopy = join(BUILTIN_LOCAL_DIR, mappedFile)
      if (existsSync(builtinCopy)) {
        let text: string
        try {
          text = (await readFile(builtinCopy, 'utf8')).replace(/^\uFEFF/, '')
        } catch (e) {
          return { topic, file: mappedFile, error: '内置副本读取失败：' + (e instanceof Error ? e.message : String(e)) }
        }
        return servePage(args, topic, mappedFile, entry.desc + '（随插件发布的内置副本）', text)
      }
      return {
        topic,
        file: entry.file,
        error: '资料「' + entry.file + '」在本机 knowledgeDir 与内置副本中都不存在（本机 knowledgeDir 指向「' + root + '」）。用 topic:"local" 可看内置资料库完整文件清单。',
      }
    },
  }
  /**
   * 图标检索库：在真源清单（6560 条）里按目录 + 关键词搜路径，一次给一批候选。
   * 为什么单独做工具：foundry_knowledge{topic:"icons"} 是「行 grep + 40 行上限 + 带行号」的通用读法，
   * 找图标时想一次看全某个目录（如 icons/weapons/swords 有 88 条）会被截断，行号格式还要再解析一遍。
   * 这个工具专做检索：可限定目录、可多关键词、最多 200 条、只返回裸路径（token 最省）。
   * 插件不内置任何「物品名 → 图标」映射：映射不可能覆盖全（真源里连 longsword/warhammer/handaxe
   * 这些整词都没有），且会随真源更新而腐坏——让 AI 现查，插件只负责搜得快。
   */
  const learnTool: { name: string } & Record<string, unknown> = {
    name: 'foundry_learn',
    description:
      '★ 实战坑表：把这次动手踩到的坑 + **验证过的**正确解法记下来，下一个 AI 开局就能读到。' +
      '铁律：**同一个坑连踩两次是在烧用户的钱** —— 确认了正确解法之后（实测过的，不是猜的）立刻记。' +
      '记什么：现象（报错原文 / 数值没变 / 卡面不对）+ 根因（查证过的机制）+ 正确做法（能 work 的具体写法或命令）+ 标签。' +
      '写在哪：本机 ~/.dsh/dsh-foundry-vtt/learned.md —— 不进 git、不污染别人的包、换世界也不丢。' +
      '用法：action:"add"（默认）新增 / "list" 看全部 / "update" 按 id 改 / "remove" 按 id 删。' +
      '读回来：foundry_knowledge{topic:"learned"}（可用 query 关键词筛）。' +
      '找不到参考、自己试出来的东西，更应该记 —— 那正是别人会重复踩的坑。',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['add', 'list', 'update', 'remove'], description: '默认 add。' },
        id: { type: 'string', description: 'update / remove 时必填，形如 "L003"。' },
        title: { type: 'string', description: '一句话说清是什么坑（如「光环改了效果不生效」）。' },
        symptom: { type: 'string', description: '现象：你看到什么（报错原文 / 数值没变 / 卡面不对）。' },
        cause: { type: 'string', description: '根因：为什么（查证过的机制，不是猜的）。' },
        fix: { type: 'string', description: '正确做法：验证过能 work 的具体写法/命令/字段。' },
        tags: { type: 'array', items: { type: 'string' }, description: '标签（如 ["aura","auraeffects"]），方便下次检索。' },
      },
      required: [],
      additionalProperties: true,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_a: unknown, v: unknown): Array<{ type: 'text'; text: string }> => {
        const o = v as Record<string, unknown> | undefined
        if (o && typeof o.error === 'string') return [{ type: 'text', text: String(o.error) }]
        if (o && o.action === 'list') {
          const es = Array.isArray(o.entries) ? (o.entries as Array<Record<string, unknown>>) : []
          const lines = ['【实战坑表】共 ' + String(o.total ?? 0) + ' 条']
          for (const e of es) {
            const tg = Array.isArray(e.tags) && e.tags.length ? '   #' + (e.tags as string[]).join(' #') : ''
            lines.push('  [' + String(e.id) + '] ' + String(e.title) + tg)
          }
          if (o.note) lines.push(String(o.note))
          return [{ type: 'text', text: lines.join('\n') }]
        }
        if (o && o.added) {
          const en = (o.entry ?? {}) as Record<string, unknown>
          return [{ type: 'text', text: '已记下 [' + String(o.added) + '] ' + String(en.title ?? '') + '（共 ' + String(o.total ?? '') + ' 条）\n' + String(o.note ?? '') }]
        }
        if (o && o.updated) return [{ type: 'text', text: '已更新 [' + String(o.updated) + ']' }]
        if (o && o.removed) return [{ type: 'text', text: '已删除 [' + String(o.removed) + ']，剩 ' + String(o.remaining ?? '') + ' 条' }]
        return [{ type: 'text', text: JSON.stringify(v, null, 2) }]
      },
    },
    async execute(args: Record<string, unknown>) {
      const action = String(args.action ?? 'add').toLowerCase()
      const entries = await readLearned()

      if (action === 'list') {
        return {
          action,
          total: entries.length,
          file: LEARNED_FILE,
          entries: entries.map((e) => ({ id: e.id, title: e.title, time: e.time, tags: e.tags })),
          note: entries.length
            ? '读全文：foundry_knowledge{topic:"learned"}；按关键词筛：topic:"learned" + query:"关键词"。'
            : '还没有记录。',
        }
      }

      if (action === 'remove') {
        const id = String(args.id ?? '').toUpperCase().trim()
        if (!id) return { action, error: 'remove 需要传 id（如 "L003"）。当前有 ' + entries.length + ' 条：' + entries.map((e) => e.id).join(', ') }
        const left = entries.filter((e) => e.id !== id)
        if (left.length === entries.length) {
          return { action, error: '没有 id = ' + id + ' 的记录。现有：' + entries.map((e) => e.id).join(', ') }
        }
        await writeLearned(left)
        return { action, removed: id, remaining: left.length, file: LEARNED_FILE }
      }

      if (action === 'update') {
        const id = String(args.id ?? '').toUpperCase().trim()
        const idx = entries.findIndex((e) => e.id === id)
        if (idx < 0) {
          return { action, error: '没有 id = ' + id + ' 的记录。现有：' + entries.map((e) => e.id).join(', ') }
        }
        const old = entries[idx]
        const g = (k: string, d: string): string =>
          typeof args[k] === 'string' && String(args[k]).trim() ? String(args[k]).trim() : d
        entries[idx] = {
          ...old,
          title: g('title', old.title),
          symptom: g('symptom', old.symptom),
          cause: g('cause', old.cause),
          fix: g('fix', old.fix),
          tags: Array.isArray(args.tags) ? (args.tags as unknown[]).map(String) : old.tags,
          time: todayLocal(),
        }
        await writeLearned(entries)
        return { action, updated: id, total: entries.length, file: LEARNED_FILE, entry: entries[idx] }
      }

      // add（默认）
      const title = String(args.title ?? '').trim()
      if (!title) {
        return {
          action,
          error:
            'add 需要 title（一句话说清是什么坑）。当前有 ' + entries.length + ' 条。' +
            '建议一并给 symptom / cause / fix —— 只记标题的话下次还是不知道怎么办。',
        }
      }
      const nums = entries.map((e) => parseInt(e.id.slice(1), 10)).filter((n) => Number.isFinite(n))
      const next = 'L' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')
      const entry: LearnedEntry = {
        id: next,
        title,
        time: todayLocal(),
        tags: Array.isArray(args.tags) ? (args.tags as unknown[]).map(String) : [],
        symptom: String(args.symptom ?? '').trim(),
        cause: String(args.cause ?? '').trim(),
        fix: String(args.fix ?? '').trim(),
      }
      entries.push(entry)
      await writeLearned(entries)
      return {
        action,
        added: next,
        total: entries.length,
        file: LEARNED_FILE,
        entry,
        note: '下次（以及下一个 AI）用 foundry_knowledge{topic:"learned"} 读回来。',
      }
    },
  }

  const howtoTool: { name: string } & Record<string, unknown> = {
    name: 'foundry_howto',
    description:
      '★★ 任务级入口：给一个任务关键词（如「建角色卡」「批量改」「消耗目标」「造物配方」「卡面对但不生效」），' +
      '返回【该读哪篇血泪教训 + 关键步骤清单】。' +
      '★ 动手做一个「本项目第一次做」的任务之前先调它 —— 血泪教训都写在文档里，猜着做会连踩 30 版。' +
      '判据只有一句：这件事我在本项目里做过没有？没做过就查。' +
      '返回里带 file 路径，用 foundry_knowledge{topic:"local", file:...} 读全文。',
    parameters: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: '任务关键词（口语即可），如「建角色卡」「批量改物品」「消耗目标」「造物配方」「卡面全对但游戏里不生效」「发版前检查」',
        },
      },
      required: ['task'],
      additionalProperties: true,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_a: unknown, v: unknown): Array<{ type: 'text'; text: string }> => {
        const o = v as
          | { matched?: boolean; title?: string; file?: string; steps?: string[]; hint?: string; availableTasks?: string[]; error?: string }
          | undefined
        if (o && typeof o.error === 'string') return [{ type: 'text', text: o.error }]
        if (!o || o.matched !== true) {
          const list = Array.isArray(o?.availableTasks) ? o.availableTasks : []
          return [{ type: 'text', text: '没匹配到已知任务。可选：\n- ' + list.join('\n- ') + '\n' + String(o?.hint ?? '') }]
        }
        const lines = ['【' + String(o.title ?? '') + '】', '必读：' + String(o.file ?? '')]
        if (Array.isArray(o.steps) && o.steps.length) {
          lines.push('关键步骤：')
          for (const s of o.steps) lines.push('  · ' + s)
        }
        if (o.hint) lines.push(String(o.hint))
        return [{ type: 'text', text: lines.join('\n') }]
      },
    },
    async execute(args: Record<string, unknown>) {
      const task = String(args.task ?? '')
        .toLowerCase()
        .trim()
      const allTitles = HOWTO.map((h) => h.title)
      if (!task) {
        return { error: 'task 必填：传任务关键词（口语即可），如「建角色卡」「批量改」「消耗目标」', availableTasks: allTitles }
      }
      const scored = HOWTO.map((h) => ({
        h,
        score: h.keys.reduce((n, k) => (task.includes(k.toLowerCase()) ? n + 1 : n), 0),
      }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
      if (!scored.length) {
        return {
          matched: false,
          availableTasks: allTitles,
          hint:
            '\n换更口语的说法再试一次；或列全索引 foundry_knowledge{topic:"local"}（不带 file）；' +
            '或直接读总典的「〇 · 只读十条」：foundry_knowledge{topic:"local", file:"血的教训/FVTT踩坑总典-血泪教训合集.md"}',
        }
      }
      const top = scored[0].h
      const readCmd = 'foundry_knowledge{topic:"local", file:"' + top.file + '"}'
      const also = top.also ? '\n配套 API 表：foundry_knowledge{topic:"local", file:"' + top.also + '"} 第三节' : ''
      return {
        matched: true,
        title: top.title,
        file: top.file,
        alsoFile: top.also ?? null,
        steps: top.steps,
        readCommand: readCmd,
        otherMatches: scored.slice(1, 4).map((x) => x.h.title),
        hint: '★ 下一步：先读全文再动手 —— ' + readCmd + also,
      }
    },
  }

  const iconTool: { name: string } & Record<string, unknown> = {
    name: 'foundry_search_icon',
    description:
      '图标检索库：在 6560 条图标真源清单里搜路径，**返回一串候选给你自己挑**。' +
      '做物品 / 效果 / token 需要图标时走这里：想个英文词（sword / dagger / potion / fire / skull / zombie）搜一下，' +
      '**把返回的列表看一遍，挑一张最贴的照抄进 img / effectImg** —— 不要凭记忆拼路径，也不要闭眼抓第一条。' +
      '可加 dir 限定目录收窄（weapons / weapons/polearms / magic/fire / consumables / creatures）；' +
      '搜不到就换更粗的词根（longsword → sword、warhammer → hammer、quarterstaff → staff、handaxe → axe），' +
      '或干脆用 foundry_file_system{source:"public", path:"icons/weapons"} 翻真实目录看实物。',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '必填：路径里的英文词（如 sword / dagger / potion / fire / skull）。多个词用空格分隔，任一命中即返回。' },
        dir: { type: 'string', description: '可选：限定目录前缀，如 weapons / weapons/polearms / magic/fire / consumables / creatures / skills' },
        limit: { type: 'number', description: '可选：最多返回多少条（默认 30，上限 200）' },
      },
      required: ['keyword'],
      additionalProperties: true,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_a: unknown, v: unknown): Array<{ type: 'text'; text: string }> => {
        const o = v as { icons?: string[]; error?: string; hint?: string } | undefined
        if (o && typeof o.error === 'string') return [{ type: 'text', text: o.error }]
        const list = Array.isArray(o?.icons) ? o.icons : []
        const hint = typeof o?.hint === 'string' ? '\n(' + o.hint + ')' : ''
        return [{ type: 'text', text: list.length ? list.join('\n') + hint : '无匹配' + hint }]
      },
    },
    async execute(args: Record<string, unknown>) {
      const words = String(args.keyword ?? '')
        .toLowerCase()
        .split(/[\s,]+/)
        .filter((w) => w.length >= 2)
      if (!words.length) return { error: 'keyword 必填：传路径里的英文词，如 sword / dagger / potion' }
      const dir = String(args.dir ?? '')
        .toLowerCase()
        .replace(/^icons\//, '')
        .replace(/^\/+|\/+$/g, '')
      const limit = Math.min(200, Math.max(1, Math.floor(Number(args.limit) || 30)))

      const file = join(BUILTIN_KB_DIR, 'fvtt-icon-paths.txt')
      if (!existsSync(file)) return { error: '图标真源清单缺失：' + file + '（插件包不完整，请重装插件）' }
      let cache = ICON_CACHE
      if (!cache) {
        const text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')
        cache = text
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter((s) => s.startsWith('icons/') || s.startsWith('systems/'))
        ICON_CACHE = cache
      }
      const pool = dir
        ? cache.filter((p) => p.toLowerCase().includes('/' + dir + '/') || p.toLowerCase().endsWith('/' + dir))
        : cache
      // dir 猜错时别只回一句「无匹配」—— 直接把该前缀下**真实存在的子目录**列出来。
      // 为什么：AI 猜 dir 经常猜错（实测把 equipment/armor 当目录，而真源里是
      // equipment/chest、equipment/neck、equipment/head…），只说「去读 topic:icon-map」
      // 等于让 AI 再赌一次，白烧一轮 token。
      let dirHint = ''
      if (dir && pool.length === 0) {
        // 用 dir 的**首段**去找同级真实子目录：dir="equipment/armor"（不存在）→ head="equipment"
        // → 列出 equipment/chest、equipment/neck、equipment/head… 这样 AI 一眼就知道该改成什么，
        // 而不是再去赌一次。实测真源里 equipment/armor 并不存在，正确的段是 chest/neck/head 等。
        const head = dir.split('/')[0]
        const segs = new Set<string>()
        for (const p of cache) {
          const low = p.toLowerCase()
          const i = low.indexOf(head + '/')
          if (i < 0) continue
          const rest = low.slice(i + head.length + 1)
          const seg = rest.split('/')[0]
          if (seg && !seg.includes('.')) segs.add(head + '/' + seg)
        }
        const list = [...segs].sort().slice(0, 40)
        dirHint = list.length
          ? '⚠️ dir:"' + dir + '" 下没有任何匹配（该路径段在真源 6560 条里不存在）。' +
            '「' + head + '/」下**真实存在的子目录**共 ' + segs.size + ' 个：' + list.join(' / ') +
            '。挑一个重试，或**去掉 dir** 只用关键词检索。'
          : '⚠️ dir:"' + dir + '" 在真源 6560 条里不存在。去掉 dir 重试，或先读 topic:"icon-map" 看大类前缀（共 258 个二级目录）。'
      }
      // 相关性排序（纯算法，不硬编码任何目录表）：
      //   ① 关键词命中「文件名开头」> 「文件名中间」> 「只在目录段命中」；
      //   ② 扩展名偏好 webp(+30，真源 6248 条实物图) > png(+10) > svg(-50，118 条抽象方块图，用户明确不要)；
      //   ③ 物品类目录微调 +15 / 特效技能类 -15；
      //   ④ 同分时路径短者优先。
      // 为什么必须排：清单按目录顺序排，halberd 原样返回会先给
      // icons/consumables/plants/tearthumb-halberd-leaf-green.webp（戟叶植物）；
      // 而只按文件名权重排又会把 icons/svg/sword.svg 顶到 icons/weapons/swords/sword-guard.webp 前面。
      const score = (p: string, terms: string[]): number => {
        const file = p.slice(p.lastIndexOf('/') + 1).toLowerCase()
        const l = p.toLowerCase()
        const dirSeg = p.slice(0, p.lastIndexOf('/')).toLowerCase()
        let s = 0
        for (const w of terms) {
          if (file.startsWith(w)) s += 100
          else if (file.includes(w)) s += 50
          // 目录段命中要单独算分：搜 warhammer 降级成 hammer 后，
          // icons/weapons/hammers/hammer-flared-steel.webp（武器锤，目录名就叫 hammers）
          // 与 icons/tools/hand/hammer-and-nail.webp（钉锤，只有文件名含 hammer）本来同分，
          // 「路径短者优先」会让工具锤赢——加上目录分才能让武器锤排前。
          if (dirSeg.includes(w)) s += 25
          else if (l.includes(w)) s += 10
        }
        s += p.endsWith('.webp') ? 30 : p.endsWith('.png') ? 10 : -50
        // 大类微调（物品类 +15 / 特效与技能类 -15）：只动 15 分，远小于「文件名开头命中 +100」，
        // 只在同级别候选之间调序，不会把正确的图挤下去。依据是真源 13 个大类的条数分布——
        // weapons 685 / equipment 1064 / containers 281 / consumables 565 / commodities 1117 /
        // tools 228 / sundries 369 是物品写真；magic 1097 / skills 309 多为法术特效与技能符号。
        if (ITEM_DIRS.some((d) => l.startsWith(d))) s += 15
        else if (EFFECT_DIRS.some((d) => l.startsWith(d))) s -= 15
        return s - p.length / 1000
      }

      // 词根降级（实测刚需）：真源里 warhammer / handaxe / quarterstaff / rapier / lance 这些整词不存在，
      // 只做整词子串匹配会 0 命中——实测建「战锤 / 手斧 / 长棍」三个物品时全部跳过（命中 0）。
      // 所以在原词 0 命中时，按「从右往左截断」找词根（warhammer→hammer / handaxe→axe / quarterstaff→staff），
      // 只取第一个真能命中的后缀，不做过度扩展。
      const terms = [...words]
      let matched = pool.filter((p) => {
        const l = p.toLowerCase()
        return terms.some((w) => l.includes(w))
      })
      let degradedFrom = ''
      if (matched.length === 0) {
        outer: for (const w of words) {
          for (let len = w.length - 1; len >= 3; len--) {
            const sub = w.slice(w.length - len)
            const cand = pool.filter((p) => p.toLowerCase().includes(sub))
            if (cand.length) {
              matched = cand
              terms.length = 0
              terms.push(sub)
              degradedFrom = w
              break outer
            }
          }
        }
      }
      const hits = matched.sort((a, b) => score(b, terms) - score(a, terms))

      return {
        keyword: String(args.keyword ?? ''),
        dir: dir || '(全部)',
        total: hits.length,
        returned: Math.min(hits.length, limit),
        icons: hits.slice(0, limit),
        hint:
          hits.length === 0
            ? (dirHint || '无匹配。换个更通用的说法，或先读 topic:"icon-map" 看该类图标在哪个目录下')
            : (degradedFrom
                ? '「' + degradedFrom + '」在真源里没有整词，已自动降级用词根「' + terms[0] + '」检索；结果不对就换更准的词，或加 dir 指定目录。'
                : '') +
              (hits.length > limit
                ? '共 ' + hits.length + ' 条，只返回前 ' + limit + ' 条——加 dir 收窄或换更具体的词'
                : '把路径原样照抄进 img / effectImg（不要自己拼）'),
      }
    },
  }
  REG(tool)
  REG(learnTool)
  REG(iconTool)
  REG(howtoTool)
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

/** 可在全库检索里扫的文本扩展名。 */
const SEARCHABLE_EXT = /\.(md|txt|json|ya?ml)$/i
/** 全库检索的三个上限：最多扫多少文件 / 每文件最多报几行 / 总命中上限。 */
const SEARCH_MAX_FILES = 4000
const SEARCH_PER_FILE = 6
const SEARCH_MAX_HITS = 80
// manuals 分组索引里单组最多列多少篇（超过就截断并提示改用 query 检索）
const GROUP_MAX = 60

interface SearchHit { file: string; line: number; text: string }

/**
 * 全库关键词检索：递归遍历 root 下所有文本文件，逐行做大小写不敏感匹配。
 * 为什么需要：servePage 的 query 只在【已经指定 file】时才生效 ——
 * 不知道看哪一篇的时候就查不了，这正是「文档在包里但 AI 读不到」的技术原因。
 * 这是「直接问资料库」的兜底入口。
 */
async function searchTree(root: string, query: string): Promise<{ scanned: number; hits: SearchHit[]; truncated: boolean }> {
  const q = query.toLowerCase()
  let files: Array<{ rel: string; size: number }>
  try {
    files = (await walkTree(root)).sort((a, b) => a.rel.localeCompare(b.rel))
  } catch {
    return { scanned: 0, hits: [], truncated: false }
  }
  const hits: SearchHit[] = []
  let scanned = 0
  let truncated = false
  for (const f of files) {
    if (scanned >= SEARCH_MAX_FILES) { truncated = true; break }
    if (!SEARCHABLE_EXT.test(f.rel)) continue
    if (f.size > 3_000_000) continue
    scanned++
    let text: string
    try { text = (await readFile(join(root, f.rel), 'utf8')).replace(/^\uFEFF/, '') } catch { continue }
    const lines = text.split(/\r?\n/)
    let n = 0
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].toLowerCase().includes(q)) continue
      hits.push({ file: f.rel, line: i + 1, text: lines[i].trim().slice(0, MAX_LINE_CHARS) })
      n++
      if (n >= SEARCH_PER_FILE || hits.length >= SEARCH_MAX_HITS) break
    }
    if (hits.length >= SEARCH_MAX_HITS) { truncated = true; break }
  }
  return { scanned, hits, truncated }
}

/** 把全库检索结果按文件分组排版 —— 每行都给 文件 + 行号，便于下一步精读。 */
function formatSearchResult(query: string, scope: string, r: { scanned: number; hits: SearchHit[]; truncated: boolean }): string {
  if (!r.scanned) return '【全库检索】' + scope + '（读不到 —— 插件包可能不完整）'
  if (!r.hits.length) {
    return '【全库检索】范围：' + scope + '（扫了 ' + r.scanned + ' 个文件）\n「' + query + '」无匹配。\n换关键词或换词根重试（中文、英文各试一次，如「建卡」与「advancement」）；仍无结果就用 topic:"local" 列索引人工找。'
  }
  const byFile = new Map<string, SearchHit[]>()
  for (const h of r.hits) {
    if (!byFile.has(h.file)) byFile.set(h.file, [])
    byFile.get(h.file)!.push(h)
  }
  const out: string[] = []
  out.push('【全库检索】范围：' + scope + '（扫了 ' + r.scanned + ' 个文件，命中 ' + r.hits.length + ' 行，落在 ' + byFile.size + ' 个文件里）')
  out.push('关键词：「' + query + '」')
  out.push('')
  for (const [file, hs] of byFile) {
    out.push('■ ' + file)
    for (const h of hs) out.push('   L' + h.line + ': ' + h.text)
  }
  out.push('')
  out.push('下一步：挑一个 ■ 路径，用 topic + file:"<该路径>" 读全文（大文件先加 query 定位再 offset 翻页）。')
  if (r.truncated) out.push('（命中已达上限，可能还有更多；换更精确的关键词收窄）')
  return out.join('\n')
}

export { DEFAULT_KNOWLEDGE_DIR, DEFAULT_SAMPLE_DIR, TOPICS }
