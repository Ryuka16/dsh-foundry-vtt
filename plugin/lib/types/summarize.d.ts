/**
 * 实体精简器：把 relay 返回的完整实体 JSON 按白名单树提取关键字段。
 *
 * 用于 foundry_get_entity / foundry_import_entity / foundry_get_scene 的 summary:true 模式——
 * 砍掉账单里最大的 token 开销（完整 Actor/Item JSON 一次动辄几十 KB，
 * 而 AI 实际只需要数值、伤害结构、活动/效果摘要这几百字节）。
 *
 * 设计：白名单树 pick（deepPick）。树叶子 true = 取原值；
 * 数组节点 [子树] = 对每个元素应用子树；对象节点 {'*': 子树} = 对 map 的全部值应用子树。
 * 未命中的键直接丢弃；结构有出入只会少字段、不会错字段。
 */
/**
 * 按实体类型挑选白名单树并精简。
 * Actor/Item/Scene 有模板；其余类型（Journal/RollTable/Macro…）只给元信息，
 * 需要完整内容时调用方应使用 summary:false。
 */
export declare function summarizeDoc(doc: unknown): unknown;
