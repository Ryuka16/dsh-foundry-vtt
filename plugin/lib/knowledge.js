/**
 * foundry_knowledge —— 按需读用户本地 FVTT 资料库（血泪教训/数据字典/图标真源）。
 *
 * 解决「AI 碰到 reference 内置模板覆盖不到的深层问题（复杂 flags/宏/陷阱/光环）
 * 只能猜或浪费 token 现查世界」的问题：把用户亲手沉淀的资料库做成可检索的本地知识源。
 * - topic 白名单：只允许读资料库里明确列出的文件，防任意文件读取。
 * - query 行搜索：大文件（data-dict 389KB）先 grep 定位再用 offset 读原文。
 * - offset 分页：每页 ≤ PAGE_SIZE 字符，避免大文件整份灌进上下文。
 */
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
const PAGE_SIZE = 4000;
const MAX_GREP_LINES = 40;
const MAX_LINE_CHARS = 400;
/** 资料库白名单：topic → 相对 knowledgeDir 的文件路径（真实文件名，已 glob 确认）。 */
const TOPICS = {
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
};
/** 默认资料库根目录（可用 config.json 的 knowledgeDir 覆盖）。 */
const DEFAULT_KNOWLEDGE_DIR = 'C:\\Users\\龙华\\Desktop\\智能体\\01_跑团工具\\FVTT技术资料';
/**
 * 注册 foundry_knowledge 工具。
 * @param REG 工具注册函数（与 registerReferenceTools 同签名）
 * @param getKnowledgeDir 解析 knowledgeDir 的函数（由 index.ts 注入，读 config）
 */
export function registerKnowledgeTools(REG, getKnowledgeDir) {
    const topics = Object.keys(TOPICS);
    const tool = {
        name: 'foundry_knowledge',
        description: '按需读用户本地 FVTT 技术资料库（血泪教训/数据字典/图标真源/世界宏金标准，用户亲手沉淀，优先级高于任何猜测）。**碰到 reference 内置模板没覆盖的深层问题（复杂 flags/宏/陷阱/光环/图标路径）先查这里，0 实例的键名禁用。** 用法：① 大文件先传 query 关键词 grep 定位（返回匹配行+行号）；② 再传 offset 读原文页（每页 ' + PAGE_SIZE + ' 字符）。topic 清单：' + topics.join('/'),
        parameters: {
            type: 'object',
            properties: {
                topic: { type: 'string', enum: topics, description: '资料文件主题：' + topics.join(' / ') },
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
            const entry = TOPICS[topic];
            if (!entry) {
                return { topic, error: '未知资料主题「' + topic + '」。可用：' + topics.join(', ') };
            }
            const root = getKnowledgeDir();
            const file = resolve(join(root, entry.file));
            let text;
            try {
                text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
            }
            catch (e) {
                return {
                    topic,
                    file: entry.file,
                    error: '资料库文件读取失败：' + file + '（' + (e instanceof Error ? e.message : String(e)) + '）。可检查 config.json 的 knowledgeDir 指向资料库根目录。',
                };
            }
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
                    return { topic, file: entry.file, query, totalChars: text.length, matched: 0, content: '「' + query + '」无匹配行。换关键词，或传 offset 读全文（文件 ' + text.length + ' 字符）。' };
                }
                const truncated = hits.length >= MAX_GREP_LINES ? '\n（已达 ' + MAX_GREP_LINES + ' 行上限，可能还有更多匹配；可换更精确关键词）' : '';
                return {
                    topic, file: entry.file, query, matched: hits.length, totalChars: text.length,
                    content: '【' + entry.desc + '】\n文件：' + entry.file + '\n匹配「' + query + '」' + hits.length + ' 行：\n' + hits.join('\n') + truncated,
                };
            }
            const offset = Math.max(0, Math.floor(Number(args.offset) || 0));
            const chunk = text.slice(offset, offset + PAGE_SIZE);
            const nextOffset = offset + chunk.length;
            const hasMore = nextOffset < text.length;
            return {
                topic,
                file: entry.file,
                desc: entry.desc,
                totalChars: text.length,
                offset,
                nextOffset,
                hasMore,
                content: '【' + entry.desc + '】\n文件：' + entry.file + '（共 ' + text.length + ' 字符）\n第 ' + offset + '–' + nextOffset + ' 字符' + (hasMore ? '（还有更多，传 offset=' + nextOffset + ' 继续读）' : '（已到末尾）') + '：\n' + chunk,
            };
        },
    };
    REG(tool);
}
export { DEFAULT_KNOWLEDGE_DIR, TOPICS };
//# sourceMappingURL=knowledge.js.map