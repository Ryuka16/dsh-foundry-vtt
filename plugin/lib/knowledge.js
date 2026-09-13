/**
 * foundry_knowledge —— 按需读用户本地 FVTT 资料库（血泪教训/数据字典/图标真源）。
 *
 * 解决「AI 碰到 reference 内置模板覆盖不到的深层问题（复杂 flags/宏/陷阱/光环）
 * 只能猜或浪费 token 现查世界」的问题：把用户亲手沉淀的资料库做成可检索的本地知识源。
 * - topic 白名单：只允许读资料库里明确列出的文件，防任意文件读取。
 * - query 行搜索：大文件（data-dict 389KB）先 grep 定位再用 offset 读原文。
 * - offset 分页：每页 ≤ PAGE_SIZE 字符，避免大文件整份灌进上下文。
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const PAGE_SIZE = 4000;
const MAX_GREP_LINES = 40;
const MAX_LINE_CHARS = 400;
/** 图标真源清单缓存（6560 条，首次检索时读入，之后按目录/关键词过滤）。 */
let ICON_CACHE = null;
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
];
const EFFECT_DIRS = ['icons/magic/', 'icons/skills/'];
/**
 * 内置知识文档（随插件包发布，clone 仓库的人没有本机资料库也能用）。
 * 文件位于 <插件包>/lib/knowledge-docs/*.md（build 时从 src/knowledge-docs/ 拷贝）。
 * 内容 = 本机资料库精华的通用化提炼（结构模板/效应配方/宏体系/纪律与坑）。
 */
const BUILTIN_KB_DIR = join(dirname(fileURLToPath(import.meta.url)), 'knowledge-docs');
/** 内置样本库目录（随插件包发布）：<插件包>/lib/samples，分类文件夹 + 用户拖入的真实配置实体 JSON。 */
const BUILTIN_SAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'samples');
/**
 * 内置原样文档库（随插件包发布）：<插件包>/lib/knowledge-manuals。
 * 内容 = 模块官方文档（28 个模块）+ 飞书知识库（57 篇）的 .md 原文（不含配图）。
 * 与 knowledge-docs（提炼件）的区别：这边是原文，可 grep 到具体 API/字段的原始出处。
 */
const BUILTIN_MANUALS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'knowledge-manuals');
/**
 * 内置「本机资料库」副本（随插件包发布）：<插件包>/lib/knowledge-local。
 * 内容 = 原知识库沉淀的通用化副本（已脱敏：去掉本地路径与自建模块 id），
 * 含数据字典/怪物规格/自动化指北/宏体系/CPR 指南/坑书 14 篇/monk wiki 等。
 * 查找顺序：本机 knowledgeDir（用户可能已更新）→ 内置副本（任何环境可用）。
 */
const BUILTIN_LOCAL_DIR = join(dirname(fileURLToPath(import.meta.url)), 'knowledge-local');
/** 内置主题：topic → 内置文档文件名 + 描述。 */
const BUILTIN_TOPICS = {
    'kb-structure': { file: '01-结构模板.md', desc: 'dnd5e 5.3.x 结构模板：武器（damage.base 铁律）/豁免三件套+层级铁律/ActiveEffect/NPC 骨架/feat+spell/状态 id 全集' },
    'kb-effects': { file: '02-效应配方.md', desc: '效应配方：mode 表/加伤（bonuses）/OverTime 持续伤害/常用 flags/物品宏三件套/光环/DAE 机制与 change-key 配方/激活条件/附魔/Optional/反应触发' },
    'kb-macros': { file: '03-宏体系.md', desc: '宏体系：挂宏 6 位置/Document 模型铁律/MidiQOL 常用函数/世界脚本与 CPR fork/DAE 宏/socket 远程委托/调试三板斧' },
    'kb-pitfalls': { file: '04-纪律与坑.md', desc: '纪律与坑：开工五病根七铁律/高频坑速查（effects 层级/伤害骰两说/DC 两说/图标 404/回读误报）/术语对照/卡面纪律/世界数据纪律' },
    deploy: { file: '05-部署与排障.md', desc: '部署与排障手册（随插件发布）：架构/一次性安装四步/配对码流程与 relay 字段/故障速查表/408「世界在线但请求全超时」自诊断与处理/配置字段/日常运维。**遇到配对、装模块、连不上、超时 408 先读这个**' },
    'icon-map': { file: '06-图标地图.md', desc: '图标分类地图（随插件发布）：13 大类路径前缀 + icons/svg 全清单 + 高频实战映射（武器/护甲/药水/法术/状态/token 去哪找）。**找图标先读这个定位前缀，再去 icons 主题 grep**' },
    icons: { file: 'fvtt-icon-paths.txt', desc: '图标路径真源 6560 条（随插件发布，任何环境可用）：query 搜关键词（如 halberd/potion-red/poison）拿真路径照抄，绝不猜。查不到就换词根，别自己拼路径' },
};
/** 资料库白名单：topic → 相对 knowledgeDir 的文件路径（真实文件名，已 glob 确认）。 */
const TOPICS = {
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
};
/** 默认资料库根目录（可用 config.json 的 knowledgeDir 覆盖）。 */
const DEFAULT_KNOWLEDGE_DIR = 'C:\\Users\\龙华\\Desktop\\智能体\\01_跑团工具\\FVTT技术资料';
/** 默认样本库目录（可用 config.json 的 sampleDir 覆盖）：世界导出的真实配置实体 JSON。 */
const DEFAULT_SAMPLE_DIR = 'C:\\Users\\龙华\\Desktop\\智能体\\01_跑团工具\\怪物与物品卡';
/** 样本库已知金标准标签（按文件名关键词匹配，用于索引展示；其余样本用文件名+大小）。 */
const SAMPLE_LABELS = [
    { key: '磁轭手铳', label: '★物品宏金标准（onUseMacroName+dae.macro 三件套完整实例）' },
    { key: '妄质百变腕甲', label: '★复杂活动结构/变身物品（140KB 完整字段实例）' },
    { key: '金属龙吐息武器', label: '★武器自动化版（活动+豁免+效果全配置实例）' },
    { key: '秘法魔剑士', label: '高等级 NPC 完整卡（法术+物品+特性 112KB）' },
    { key: '唯死之舞', label: '带战斗自动化机制的 NPC（67KB）' },
    { key: '巴哈姆特', label: '传奇生物完整卡（32KB）' },
];
/**
 * 注册 foundry_knowledge 工具。
 * @param REG 工具注册函数（与 registerReferenceTools 同签名）
 * @param getKnowledgeDir 解析 knowledgeDir 的函数（由 index.ts 注入，读 config）
 */
export function registerKnowledgeTools(REG, getKnowledgeDir, getSampleDir) {
    const topics = Object.keys(TOPICS);
    const builtinTopics = Object.keys(BUILTIN_TOPICS);
    const tool = {
        name: 'foundry_knowledge',
        description: '按需读 FVTT 技术知识。五级：① 内置知识主题（随插件发布，任何环境可用，优先）：' + builtinTopics.join('/') + '；② 原样文档库（topic:"manuals"，随插件发布，任何环境可用）：28 个模块的官方文档 + 57 篇飞书知识库原文——查模块 API/字段/函数签名的原始出处来这里，别猜；③ 资料库主题（topic 见下，**已随插件发布内置副本，任何环境可用**；本机 knowledgeDir 有更新版本时自动优先用它）：数据字典/怪物规格/自动化指北/宏汇编/midi 指南/CPR 宇宙/坑书/方法论等；④ topic:"local" = 内置资料库全索引（列全部文件路径，其余文件用 topic:"local", file:"<路径>" 读）；⑤ 样本库（topic:"samples"，世界导出的真实配置实体 JSON——建物品/怪/自动化前先来这找同类真实样本，照抄结构改数值，一次过）。**碰到 foundry_reference 内置模板没覆盖的深层问题（复杂 flags/宏/陷阱/光环/图标路径）先查这里，0 实例的键名禁用。** 用法：① topic:"manuals"/"samples"/"local" 不带 file 参数 = 列出索引；② 带 file 参数（索引里的路径）= 读原文（大文件先传 query 关键词 grep 定位，再传 offset 翻页，每页 ' + PAGE_SIZE + ' 字符）；③ 资料库/内置主题同理：大文件先 query 定位再 offset 读原文。',
        parameters: {
            type: 'object',
            properties: {
                topic: { type: 'string', description: '知识主题。内置：' + builtinTopics.join(' / ') + '；原样文档库："manuals"（模块官方文档 + 飞书知识库原文）；资料库（随包发布内置副本，本机有则优先）：' + topics.join(' / ') + '；"local"（内置资料库全索引，列全部文件路径）；样本库："samples"（世界导出的真实配置实体，抄改首选）' },
                file: { type: 'string', description: '可选：文档/样本路径（topic 为 "manuals" / "samples" / "local" 时用，传对应索引里列出的完整路径）' },
                query: { type: 'string', description: '可选：按行搜索关键词（如 "OverTime"/"光环"/"图标"），返回最多 40 行匹配（含行号）。大文件先 query 定位再 offset 读原文。' },
                offset: { type: 'number', description: '可选：从第几个字符开始读原文（无 query 时生效，默认 0）。返回值里有 nextOffset 与 hasMore 用于翻页。' },
            },
            required: ['topic'],
            additionalProperties: true,
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render: (_args, value) => {
                const v = value;
                if (typeof v === 'string')
                    return [{ type: 'text', text: v }];
                if (v && typeof v === 'object' && typeof v.content === 'string')
                    return [{ type: 'text', text: v.content }];
                return [{ type: 'text', text: JSON.stringify(value, null, 2) }];
            },
        },
        async execute(args) {
            const topic = String(args.topic);
            // 内置主题：读插件包自带 knowledge-docs（任何环境可用）
            if (BUILTIN_TOPICS[topic]) {
                const entry = BUILTIN_TOPICS[topic];
                const file = join(BUILTIN_KB_DIR, entry.file);
                if (!existsSync(file)) {
                    return { topic, error: '内置知识文档缺失：' + file + '（插件包不完整，请重装插件）' };
                }
                let text;
                try {
                    text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
                }
                catch (e) {
                    return { topic, file: entry.file, error: '内置文档读取失败：' + (e instanceof Error ? e.message : String(e)) };
                }
                return servePage(args, topic, entry.file, entry.desc, text);
            }
            // 原样文档库：模块官方文档 + 飞书知识库（随 git 发布）。topic="manuals"。
            if (topic === 'manuals') {
                if (!existsSync(BUILTIN_MANUALS_DIR)) {
                    return { topic, error: '原样文档库不可用：内置目录不存在（' + BUILTIN_MANUALS_DIR + '）。' };
                }
                const fileName = args.file === undefined ? '' : String(args.file);
                if (!fileName) {
                    let files;
                    try {
                        files = (await walkTree(BUILTIN_MANUALS_DIR))
                            .filter((f) => f.rel.toLowerCase().endsWith('.md'))
                            .sort((a, b) => a.rel.localeCompare(b.rel));
                    }
                    catch (e) {
                        return { topic, error: '原样文档库读取失败：' + (e instanceof Error ? e.message : String(e)) };
                    }
                    // 分组：模块文档/<模块>/<文件>.md → "模块文档/<模块>"；飞书知识库/<文件>.md → "飞书知识库"
                    // 每行列**完整相对路径**（多个模块有同名 README.md，只列裸名 AI 拼不出 file 参数）
                    const tree = new Map();
                    for (const f of files) {
                        const seg = f.rel.split('/');
                        const group = seg.length >= 3 ? seg[0] + '/' + seg[1] : seg[0];
                        if (!tree.has(group))
                            tree.set(group, []);
                        tree.get(group).push(f.rel + '（' + Math.max(1, Math.round(f.size / 1024)) + 'KB）');
                    }
                    const lines = [];
                    for (const [group, items] of tree) {
                        lines.push('  ' + group + '（' + items.length + ' 篇）');
                        for (const it of items.slice().sort())
                            lines.push('    ' + it);
                    }
                    return {
                        topic,
                        total: files.length,
                        content: '【原样文档库索引】共 ' + files.length + ' 篇（模块官方文档 + 飞书知识库原文，随 git 发布，任何环境可用）：\n' +
                            lines.join('\n') +
                            '\n\n用法：foundry_knowledge{topic:"manuals", file:"<下面缩进行里的完整路径，直接照抄>"}。大文件（>20KB）先加 query 关键词 grep 定位（如 "onUseMacroName"/"flags"/"workflow"），再传 offset 翻页（每页 ' + PAGE_SIZE + ' 字符）。查模块 API 原始出处、字段名、函数签名时来这里，别猜。',
                    };
                }
                // 有 file：读文档，防目录逃逸
                const rootResolved = resolve(BUILTIN_MANUALS_DIR);
                const target = resolve(join(BUILTIN_MANUALS_DIR, fileName));
                const inside = target.startsWith(rootResolved + '\\') || target.startsWith(rootResolved + '/');
                if (!inside || !existsSync(target)) {
                    return { topic, file: fileName, error: '文档未找到：「' + fileName + '」。file 请用 manuals 索引里列出的完整路径（如 "模块文档/Sequencer/index.md"）。' };
                }
                let text;
                try {
                    text = (await readFile(target, 'utf8')).replace(/^\uFEFF/, '');
                }
                catch (e) {
                    return { topic, file: fileName, error: '文档读取失败：' + (e instanceof Error ? e.message : String(e)) };
                }
                return servePage(args, topic, fileName, '原样文档原文（模块官方文档 / 飞书知识库）', text);
            }
            // 样本库：内置（随 git 发布的分类样本库）+ 本机扩展目录。topic="samples"。
            if (topic === 'samples') {
                const roots = [{ root: BUILTIN_SAMPLES_DIR, label: '内置样本库（随 git 发布）' }];
                const localRoot = getSampleDir();
                if (localRoot && existsSync(localRoot) && resolve(localRoot) !== resolve(BUILTIN_SAMPLES_DIR)) {
                    roots.push({ root: localRoot, label: '本机扩展' });
                }
                const fileName = args.file === undefined ? '' : String(args.file);
                if (!fileName) {
                    // 无 file：列分类树索引。
                    const parts = [];
                    let totalFiles = 0;
                    for (const r of roots) {
                        if (!existsSync(r.root))
                            continue;
                        try {
                            const files = (await walkTree(r.root)).sort((a, b) => a.rel.localeCompare(b.rel));
                            totalFiles += files.filter((f) => f.rel.toLowerCase().endsWith('.json')).length;
                            // 按顶层文件夹分组成树
                            const tree = new Map();
                            for (const f of files) {
                                const slash = f.rel.indexOf('/');
                                const top = slash > 0 ? f.rel.slice(0, slash) : f.rel;
                                const rest = slash > 0 ? f.rel.slice(slash + 1) : '';
                                if (!tree.has(top))
                                    tree.set(top, []);
                                tree.get(top).push({ rel: rest, KB: Math.round(f.size / 1024) });
                            }
                            const lines = ['■ ' + r.label + '：' + r.root];
                            for (const [top, items] of tree) {
                                if (items.length === 1 && items[0].rel === '') {
                                    lines.push('  ' + top + '（' + items[0].KB + 'KB）');
                                }
                                else {
                                    lines.push('  ' + top + '/');
                                    for (const it of items)
                                        lines.push('    ' + it.rel + '（' + it.KB + 'KB）');
                                }
                            }
                            parts.push(lines.join('\n'));
                        }
                        catch (e) {
                            parts.push('■ ' + r.label + '：' + r.root + '（读取失败：' + (e instanceof Error ? e.message : String(e)) + '）');
                        }
                    }
                    if (parts.length === 0) {
                        return { topic, error: '样本库不可用：内置样本目录与 sampleDir 均不存在。' };
                    }
                    return {
                        topic,
                        total: totalFiles,
                        content: '【样本库索引】共 ' + totalFiles + ' 个样本 JSON（世界导出的真实配置实体——建东西前先来这找同类样本：读它的结构→照抄→改数值，一次过）：\n' +
                            parts.join('\n') +
                            '\n\n用法：foundry_knowledge{topic:"samples", file:"<分类文件夹>/<文件名>"} 读样本（内置样本需带分类子路径，如 "01-武器与攻击/xxx.json"）；每个分类文件夹里有 README 说明放什么。大文件先加 query 关键词 grep 定位（如 "OverTime"/"onUseMacroName"/"activities"），再 offset 翻页。',
                    };
                }
                // 有 file：先查内置样本树，再查本机扩展。防目录逃逸。
                for (const r of roots) {
                    if (!existsSync(r.root))
                        continue;
                    const rootResolved = resolve(r.root);
                    const target = resolve(join(r.root, fileName));
                    if ((target.startsWith(rootResolved + '\\') || target.startsWith(rootResolved + '/')) && existsSync(target)) {
                        let text;
                        try {
                            text = (await readFile(target, 'utf8')).replace(/^\uFEFF/, '');
                        }
                        catch (e) {
                            return { topic, file: fileName, error: '样本读取失败：' + (e instanceof Error ? e.message : String(e)) };
                        }
                        const label = SAMPLE_LABELS.find((s) => fileName.includes(s.key));
                        return servePage(args, topic, fileName, (label ? label.label + '；' : '') + '世界导出的真实配置实体 JSON，结构可照抄（改 name/数值/描述）。', text);
                    }
                }
                return { topic, file: fileName, error: '样本文件未找到：「' + fileName + '」。file 请用 samples 索引里列出的路径（内置样本带分类文件夹前缀）。' };
            }
            // 内置资料库总索引：topic="local"（随包发布的脱敏资料库副本，任何环境可用）
            if (topic === 'local') {
                if (!existsSync(BUILTIN_LOCAL_DIR)) {
                    return { topic, error: '内置资料库副本不存在：' + BUILTIN_LOCAL_DIR + '（插件包不完整，请重装插件）' };
                }
                const fileName = args.file === undefined ? '' : String(args.file);
                if (fileName) {
                    const rootResolved = resolve(BUILTIN_LOCAL_DIR);
                    const target = resolve(join(BUILTIN_LOCAL_DIR, fileName));
                    const inside = target.startsWith(rootResolved + '\\') || target.startsWith(rootResolved + '/');
                    if (!inside || !existsSync(target)) {
                        return { topic, file: fileName, error: '资料未找到：「' + fileName + '」。file 请用 topic:"local" 索引里列出的相对路径。' };
                    }
                    let text;
                    try {
                        text = (await readFile(target, 'utf8')).replace(/^\uFEFF/, '');
                    }
                    catch (e) {
                        return { topic, file: fileName, error: '资料读取失败：' + (e instanceof Error ? e.message : String(e)) };
                    }
                    return servePage(args, topic, fileName, '内置资料库原文（随插件发布，已脱敏）', text);
                }
                let files;
                try {
                    files = (await walkTree(BUILTIN_LOCAL_DIR)).sort((a, b) => a.rel.localeCompare(b.rel));
                }
                catch (e) {
                    return { topic, error: '内置资料库读取失败：' + (e instanceof Error ? e.message : String(e)) };
                }
                const tree = new Map();
                for (const f of files) {
                    const slash = f.rel.indexOf('/');
                    const top = slash > 0 ? f.rel.slice(0, slash) : '(根目录)';
                    const rest = slash > 0 ? f.rel.slice(slash + 1) : f.rel;
                    if (!tree.has(top))
                        tree.set(top, []);
                    tree.get(top).push({ rel: rest, KB: Math.max(1, Math.round(f.size / 1024)) });
                }
                const lines = [];
                for (const [top, items] of tree) {
                    lines.push('  ' + top + '/');
                    for (const it of items)
                        lines.push('    ' + it.rel + '（' + it.KB + 'KB）');
                }
                return {
                    topic,
                    total: files.length,
                    content: '【内置资料库索引】共 ' + files.length + ' 个文件（随插件发布，任何环境可用；已脱敏）：\n' +
                        lines.join('\n') +
                        '\n\n用法：① 有专用主题的直接用主题名读 —— data-dict（数据字典）/monster-spec（怪物规格）/auto-guide（自动化指北）/macro-compendium（宏汇编）/dnd5e-quickref（5.3.3 官方写法）/midi-guide/cpr-universe/cpr-mapping/pitfalls（坑书）/methodology（方法论）/iron-rules/world-macros/世界脚本相关等；② 其余文件用 topic:"local", file:"<上面的相对路径>" 读；③ 大文件先加 query 关键词 grep 定位，再 offset 翻页。\n**做自动化、写宏、查模块机制前先来这里找对应资料，别凭记忆。**',
                };
            }
            // 资料库主题：① 本机 knowledgeDir（用户可能已更新）② 内置副本（随包发布，任何环境可用）
            const entry = TOPICS[topic];
            if (!entry) {
                return { topic, error: '未知知识主题「' + topic + '」。内置：' + builtinTopics.join(', ') + '；资料库主题（随包发布或本机 knowledgeDir）：' + topics.join(', ') + '；另有 topic:"local" 可列内置资料库全索引。' };
            }
            // ① 本机 knowledgeDir 优先（你自己的资料可能已更新）
            const root = getKnowledgeDir();
            if (root && existsSync(root)) {
                const file = resolve(join(root, entry.file));
                try {
                    const text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
                    return servePage(args, topic, entry.file, entry.desc + '（本机资料库）', text);
                }
                catch { /* 本机没有这份 → 落到内置副本 */ }
            }
            // ② 内置副本兜底（随包发布，别人没有本机资料库也能用）
            // 注：内置副本里把坑书目录名简化为「血的教训」，此处做路径映射（本机仍用原目录名）
            const legacyDir = '搓怪物做效果做mod任何时候，看到了一定要看仔细看\\';
            const mappedFile = entry.file.startsWith(legacyDir) ? '血的教训\\' + entry.file.slice(legacyDir.length) : entry.file;
            const builtinCopy = join(BUILTIN_LOCAL_DIR, mappedFile);
            if (existsSync(builtinCopy)) {
                let text;
                try {
                    text = (await readFile(builtinCopy, 'utf8')).replace(/^\uFEFF/, '');
                }
                catch (e) {
                    return { topic, file: mappedFile, error: '内置副本读取失败：' + (e instanceof Error ? e.message : String(e)) };
                }
                return servePage(args, topic, mappedFile, entry.desc + '（随插件发布的内置副本）', text);
            }
            return {
                topic,
                file: entry.file,
                error: '资料「' + entry.file + '」在本机 knowledgeDir 与内置副本中都不存在（本机 knowledgeDir 指向「' + root + '」）。用 topic:"local" 可看内置资料库完整文件清单。',
            };
        },
    };
    /**
     * 图标检索库：在真源清单（6560 条）里按目录 + 关键词搜路径，一次给一批候选。
     * 为什么单独做工具：foundry_knowledge{topic:"icons"} 是「行 grep + 40 行上限 + 带行号」的通用读法，
     * 找图标时想一次看全某个目录（如 icons/weapons/swords 有 88 条）会被截断，行号格式还要再解析一遍。
     * 这个工具专做检索：可限定目录、可多关键词、最多 200 条、只返回裸路径（token 最省）。
     * 插件不内置任何「物品名 → 图标」映射：映射不可能覆盖全（真源里连 longsword/warhammer/handaxe
     * 这些整词都没有），且会随真源更新而腐坏——让 AI 现查，插件只负责搜得快。
     */
    const iconTool = {
        name: 'foundry_search_icon',
        description: '图标检索库：在 6560 条图标真源清单里搜路径，**返回一串候选给你自己挑**。' +
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
            render: (_a, v) => {
                const o = v;
                if (o && typeof o.error === 'string')
                    return [{ type: 'text', text: o.error }];
                const list = Array.isArray(o?.icons) ? o.icons : [];
                const hint = typeof o?.hint === 'string' ? '\n(' + o.hint + ')' : '';
                return [{ type: 'text', text: list.length ? list.join('\n') + hint : '无匹配' + hint }];
            },
        },
        async execute(args) {
            const words = String(args.keyword ?? '')
                .toLowerCase()
                .split(/[\s,]+/)
                .filter((w) => w.length >= 2);
            if (!words.length)
                return { error: 'keyword 必填：传路径里的英文词，如 sword / dagger / potion' };
            const dir = String(args.dir ?? '')
                .toLowerCase()
                .replace(/^icons\//, '')
                .replace(/^\/+|\/+$/g, '');
            const limit = Math.min(200, Math.max(1, Math.floor(Number(args.limit) || 30)));
            const file = join(BUILTIN_KB_DIR, 'fvtt-icon-paths.txt');
            if (!existsSync(file))
                return { error: '图标真源清单缺失：' + file + '（插件包不完整，请重装插件）' };
            let cache = ICON_CACHE;
            if (!cache) {
                const text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
                cache = text
                    .split(/\r?\n/)
                    .map((s) => s.trim())
                    .filter((s) => s.startsWith('icons/') || s.startsWith('systems/'));
                ICON_CACHE = cache;
            }
            const pool = dir
                ? cache.filter((p) => p.toLowerCase().includes('/' + dir + '/') || p.toLowerCase().endsWith('/' + dir))
                : cache;
            // dir 猜错时别只回一句「无匹配」—— 直接把该前缀下**真实存在的子目录**列出来。
            // 为什么：AI 猜 dir 经常猜错（实测把 equipment/armor 当目录，而真源里是
            // equipment/chest、equipment/neck、equipment/head…），只说「去读 topic:icon-map」
            // 等于让 AI 再赌一次，白烧一轮 token。
            let dirHint = '';
            if (dir && pool.length === 0) {
                // 用 dir 的**首段**去找同级真实子目录：dir="equipment/armor"（不存在）→ head="equipment"
                // → 列出 equipment/chest、equipment/neck、equipment/head… 这样 AI 一眼就知道该改成什么，
                // 而不是再去赌一次。实测真源里 equipment/armor 并不存在，正确的段是 chest/neck/head 等。
                const head = dir.split('/')[0];
                const segs = new Set();
                for (const p of cache) {
                    const low = p.toLowerCase();
                    const i = low.indexOf(head + '/');
                    if (i < 0)
                        continue;
                    const rest = low.slice(i + head.length + 1);
                    const seg = rest.split('/')[0];
                    if (seg && !seg.includes('.'))
                        segs.add(head + '/' + seg);
                }
                const list = [...segs].sort().slice(0, 40);
                dirHint = list.length
                    ? '⚠️ dir:"' + dir + '" 下没有任何匹配（该路径段在真源 6560 条里不存在）。' +
                        '「' + head + '/」下**真实存在的子目录**共 ' + segs.size + ' 个：' + list.join(' / ') +
                        '。挑一个重试，或**去掉 dir** 只用关键词检索。'
                    : '⚠️ dir:"' + dir + '" 在真源 6560 条里不存在。去掉 dir 重试，或先读 topic:"icon-map" 看大类前缀（共 258 个二级目录）。';
            }
            // 相关性排序（纯算法，不硬编码任何目录表）：
            //   ① 关键词命中「文件名开头」> 「文件名中间」> 「只在目录段命中」；
            //   ② 扩展名偏好 webp(+30，真源 6248 条实物图) > png(+10) > svg(-50，118 条抽象方块图，用户明确不要)；
            //   ③ 物品类目录微调 +15 / 特效技能类 -15；
            //   ④ 同分时路径短者优先。
            // 为什么必须排：清单按目录顺序排，halberd 原样返回会先给
            // icons/consumables/plants/tearthumb-halberd-leaf-green.webp（戟叶植物）；
            // 而只按文件名权重排又会把 icons/svg/sword.svg 顶到 icons/weapons/swords/sword-guard.webp 前面。
            const score = (p, terms) => {
                const file = p.slice(p.lastIndexOf('/') + 1).toLowerCase();
                const l = p.toLowerCase();
                const dirSeg = p.slice(0, p.lastIndexOf('/')).toLowerCase();
                let s = 0;
                for (const w of terms) {
                    if (file.startsWith(w))
                        s += 100;
                    else if (file.includes(w))
                        s += 50;
                    // 目录段命中要单独算分：搜 warhammer 降级成 hammer 后，
                    // icons/weapons/hammers/hammer-flared-steel.webp（武器锤，目录名就叫 hammers）
                    // 与 icons/tools/hand/hammer-and-nail.webp（钉锤，只有文件名含 hammer）本来同分，
                    // 「路径短者优先」会让工具锤赢——加上目录分才能让武器锤排前。
                    if (dirSeg.includes(w))
                        s += 25;
                    else if (l.includes(w))
                        s += 10;
                }
                s += p.endsWith('.webp') ? 30 : p.endsWith('.png') ? 10 : -50;
                // 大类微调（物品类 +15 / 特效与技能类 -15）：只动 15 分，远小于「文件名开头命中 +100」，
                // 只在同级别候选之间调序，不会把正确的图挤下去。依据是真源 13 个大类的条数分布——
                // weapons 685 / equipment 1064 / containers 281 / consumables 565 / commodities 1117 /
                // tools 228 / sundries 369 是物品写真；magic 1097 / skills 309 多为法术特效与技能符号。
                if (ITEM_DIRS.some((d) => l.startsWith(d)))
                    s += 15;
                else if (EFFECT_DIRS.some((d) => l.startsWith(d)))
                    s -= 15;
                return s - p.length / 1000;
            };
            // 词根降级（实测刚需）：真源里 warhammer / handaxe / quarterstaff / rapier / lance 这些整词不存在，
            // 只做整词子串匹配会 0 命中——实测建「战锤 / 手斧 / 长棍」三个物品时全部跳过（命中 0）。
            // 所以在原词 0 命中时，按「从右往左截断」找词根（warhammer→hammer / handaxe→axe / quarterstaff→staff），
            // 只取第一个真能命中的后缀，不做过度扩展。
            const terms = [...words];
            let matched = pool.filter((p) => {
                const l = p.toLowerCase();
                return terms.some((w) => l.includes(w));
            });
            let degradedFrom = '';
            if (matched.length === 0) {
                outer: for (const w of words) {
                    for (let len = w.length - 1; len >= 3; len--) {
                        const sub = w.slice(w.length - len);
                        const cand = pool.filter((p) => p.toLowerCase().includes(sub));
                        if (cand.length) {
                            matched = cand;
                            terms.length = 0;
                            terms.push(sub);
                            degradedFrom = w;
                            break outer;
                        }
                    }
                }
            }
            const hits = matched.sort((a, b) => score(b, terms) - score(a, terms));
            return {
                keyword: String(args.keyword ?? ''),
                dir: dir || '(全部)',
                total: hits.length,
                returned: Math.min(hits.length, limit),
                icons: hits.slice(0, limit),
                hint: hits.length === 0
                    ? (dirHint || '无匹配。换个更通用的说法，或先读 topic:"icon-map" 看该类图标在哪个目录下')
                    : (degradedFrom
                        ? '「' + degradedFrom + '」在真源里没有整词，已自动降级用词根「' + terms[0] + '」检索；结果不对就换更准的词，或加 dir 指定目录。'
                        : '') +
                        (hits.length > limit
                            ? '共 ' + hits.length + ' 条，只返回前 ' + limit + ' 条——加 dir 收窄或换更具体的词'
                            : '把路径原样照抄进 img / effectImg（不要自己拼）'),
            };
        },
    };
    REG(tool);
    REG(iconTool);
}
/** 递归列目录下所有文件（相对路径 + 字节数）。 */
async function walkTree(dir, prefix = '') {
    const out = [];
    let entries;
    try {
        entries = await readdir(dir, { withFileTypes: true });
    }
    catch {
        return out;
    }
    for (const e of entries) {
        const rel = prefix ? prefix + '/' + e.name : e.name;
        const full = join(dir, e.name);
        if (e.isDirectory()) {
            out.push(...(await walkTree(full, rel)));
        }
        else {
            out.push({ rel, size: (await readFile(full)).length });
        }
    }
    return out;
}
/** 分页/检索服务：query 走行 grep，否则 offset 分页。 */
async function servePage(args, topic, fileName, desc, text) {
    const query = args.query === undefined ? '' : String(args.query);
    if (query) {
        const lines = text.split(/\r?\n/);
        const hits = [];
        for (let i = 0; i < lines.length && hits.length < MAX_GREP_LINES; i++) {
            const line = lines[i];
            if (line.toLowerCase().includes(query.toLowerCase())) {
                hits.push('L' + (i + 1) + ': ' + line.slice(0, MAX_LINE_CHARS));
            }
        }
        if (hits.length === 0) {
            return { topic, file: fileName, query, totalChars: text.length, matched: 0, content: '「' + query + '」无匹配行。换关键词，或传 offset 读全文（文件 ' + text.length + ' 字符）。' };
        }
        const truncated = hits.length >= MAX_GREP_LINES ? '\n（已达 ' + MAX_GREP_LINES + ' 行上限，可能还有更多匹配；可换更精确关键词）' : '';
        return {
            topic, file: fileName, query, matched: hits.length, totalChars: text.length,
            content: '【' + desc + '】\n文件：' + fileName + '\n匹配「' + query + '」' + hits.length + ' 行：\n' + hits.join('\n') + truncated,
        };
    }
    const offset = Math.max(0, Math.floor(Number(args.offset) || 0));
    const chunk = text.slice(offset, offset + PAGE_SIZE);
    const nextOffset = offset + chunk.length;
    const hasMore = nextOffset < text.length;
    return {
        topic,
        file: fileName,
        desc,
        totalChars: text.length,
        offset,
        nextOffset,
        hasMore,
        content: '【' + desc + '】\n文件：' + fileName + '（共 ' + text.length + ' 字符）\n第 ' + offset + '–' + nextOffset + ' 字符' + (hasMore ? '（还有更多，传 offset=' + nextOffset + ' 继续读）' : '（已到末尾）') + '：\n' + chunk,
    };
}
export { DEFAULT_KNOWLEDGE_DIR, DEFAULT_SAMPLE_DIR, TOPICS };
//# sourceMappingURL=knowledge.js.map