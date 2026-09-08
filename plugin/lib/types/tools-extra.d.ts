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
    makeTool: (name: string, desc: string, props: Record<string, unknown>, required: string[], execute: (args: Record<string, unknown>) => Promise<unknown>) => {
        name: string;
    };
    callRelay: (method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, opts?: Record<string, unknown>) => Promise<unknown>;
    asObject: (v: unknown) => Record<string, unknown>;
    targetingQuery: (args: Record<string, unknown>) => Record<string, unknown>;
}
type Reg = (t: {
    name: string;
}) => void;
export declare function registerExtraTools(h: ExtraHelpers, reg: Reg): void;
export {};
