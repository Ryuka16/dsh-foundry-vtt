/**
 * 内置基础参考库 —— 解决「AI 每次现查样本怪/样本物品照抄结构」的 token 浪费。
 *
 * 模板来源：用户世界 gesila（dnd5e 5.3.3, Foundry 13.351）实测验证过的实体结构
 * （僵尸/啃咬/尸毒豁免/巨蜘蛛样本），未验证字段已明确标注。
 * AI 需要结构模板时用 foundry_reference{topic} 一次本地调用拿到，
 * 替代 foundry_search + foundry_get_entity 拉完整样本（一次省几十 KB）。
 */
declare const REFERENCE: Record<string, string>;
/**
 * 注册 foundry_reference 工具：一次本地调用返回精简模板，零 HTTP、零延迟。
 * execute 返回 {topic, template} 满足 DSH 对象输出校验；
 * render 把 template 以纯文本输出（不包 JSON 外层转义），AI 复制即用。
 */
export declare function registerReferenceTools(REG: (t: {
    name: string;
}) => void): void;
export { REFERENCE };
