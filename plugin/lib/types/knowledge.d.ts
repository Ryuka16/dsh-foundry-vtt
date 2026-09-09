/**
 * foundry_knowledge —— 按需读用户本地 FVTT 资料库（血泪教训/数据字典/图标真源）。
 *
 * 解决「AI 碰到 reference 内置模板覆盖不到的深层问题（复杂 flags/宏/陷阱/光环）
 * 只能猜或浪费 token 现查世界」的问题：把用户亲手沉淀的资料库做成可检索的本地知识源。
 * - topic 白名单：只允许读资料库里明确列出的文件，防任意文件读取。
 * - query 行搜索：大文件（data-dict 389KB）先 grep 定位再用 offset 读原文。
 * - offset 分页：每页 ≤ PAGE_SIZE 字符，避免大文件整份灌进上下文。
 */
/** 资料库白名单：topic → 相对 knowledgeDir 的文件路径（真实文件名，已 glob 确认）。 */
declare const TOPICS: Record<string, {
    file: string;
    desc: string;
}>;
/** 默认资料库根目录（可用 config.json 的 knowledgeDir 覆盖）。 */
declare const DEFAULT_KNOWLEDGE_DIR = "C:\\Users\\\u9F99\u534E\\Desktop\\\u667A\u80FD\u4F53\\01_\u8DD1\u56E2\u5DE5\u5177\\FVTT\u6280\u672F\u8D44\u6599";
/** 默认样本库目录（可用 config.json 的 sampleDir 覆盖）：世界导出的真实配置实体 JSON。 */
declare const DEFAULT_SAMPLE_DIR = "C:\\Users\\\u9F99\u534E\\Desktop\\\u667A\u80FD\u4F53\\01_\u8DD1\u56E2\u5DE5\u5177\\\u602A\u7269\u4E0E\u7269\u54C1\u5361";
/**
 * 注册 foundry_knowledge 工具。
 * @param REG 工具注册函数（与 registerReferenceTools 同签名）
 * @param getKnowledgeDir 解析 knowledgeDir 的函数（由 index.ts 注入，读 config）
 */
export declare function registerKnowledgeTools(REG: (t: {
    name: string;
}) => void, getKnowledgeDir: () => string, getSampleDir: () => string): void;
export { DEFAULT_KNOWLEDGE_DIR, DEFAULT_SAMPLE_DIR, TOPICS };
