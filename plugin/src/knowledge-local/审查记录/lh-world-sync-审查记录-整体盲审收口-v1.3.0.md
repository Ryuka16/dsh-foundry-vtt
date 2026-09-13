# your-world-sync · 审查记录 · 整体盲审收口（v1.3.0）

> 本篇记录「七轮盲审所报问题全部修完」的这一轮。轮次 1~5 见 `your-world-sync-审查记录.md`，
> 轮次 6（整体盲审，三路视角）见 `your-world-sync-审查记录-轮次6-整体盲审.md`，
> 批次 2（v1.2.9）见 `your-world-sync-审查记录-批次2-v1.2.9.md`。

---

## 0. 为什么这一轮不再分批

用户原话（2026-09-10）：

> 「我的天啊，我token，就被你这么浪费啊，你到底能不能一次性改好，怎么还有9项」

**我的错**：我把「单轮改动 ≤10 处」这条自己定的工程习惯，当成了必须遵守的流程，于是把
剩余 20 项拆成批次 3/4/5 分三次交付。对用户来说这不是「更稳」，而是**多付两轮对话的钱
和两轮等待**。那条习惯的目的（避免新旧 bug 混淆）完全可以用「一次改完 + 立刻跑全量断言」
达到，不需要拆交付。

**结论（写进纪律）**：分批交付不是安全措施，是成本。要控制的是「同一轮里改动的**耦合度**」，
不是改动条数；验证强度靠**断言**保证，不靠**拖延**保证。

---

## 1. 本轮收口的 13 项（v1.3.0）

| 编号 | 严重度 | 问题 | 修法 | 位置（函数/标记） |
|---|---|---|---|---|
| C2 | 一般 | 网络读取没有超时：服务器「TCP 连上但不回包」时 fetch 无限挂起，面板停在读取中，用户唯一能做的刷新恰是历史上出事的入口 | 加 30 秒超时（AbortController），覆盖响应头与响应体两段；用 `typeof` 探测，缺该 API 的环境退化为无超时而不是抛错 | `storageRead()` / `STORAGE_TIMEOUT_MS` |
| D3 | 一般 | 取不到 `game.world.id` 时账本退化为用世界标题当文件名 → 两个同名世界写到同一份账本，互相挤掉撤销点 | 新增 `hasStableWorldId()`；`writeApplyLog()` 开头校验，缺 id 则抛错中止（世界零改动） | `hasStableWorldId()` / `writeApplyLog()` |
| D2 | 一般 | 外来快照可带进「本模块恒定排除的键」（core.time / core.permissions / mcp-bridge.lastActivity） | `parseSnapshot()` 循环里加 `EXCLUDE_DEFAULT.includes(item.key)` 拒收 | `parseSnapshot()` |
| D1 | 一般 | 失败回滚用 `getSettingDoc` 反查文档来删 —— 刚创建的文档在集合缓存里可能还查不到，落空就把新文档留在世界里，成为同 key 的第二份 Setting | 记录 `createDocuments()` 返回的文档 id（`createdByKey`），回滚时按 id 删，反查只作兜底 | `applySnapshot()` / `rollbackApplyLog()` |
| E3 | 一般 | 导入文件先 `f.text()` 全量读进内存，再看内容 —— 几百 MB 的 json 直接卡死浏览器 | 先查 `f.size`，超过 32 MB 直接拒绝 | `openFilePanel()` 的 import-file 分支 |
| E2 | 建议 | `collectUnavailable()` 用 `out.includes()` 去重，1435 项时 O(n²)，而该函数在面板每次刷新/勾选变化/恢复前后都跑 | 改 `Set` | `collectUnavailable()` |
| E1 | 建议 | 面板每勾一下都重新遍历 Settings 集合重建 Map | `getCurrentMap()` 加 2 秒短时缓存；写操作后的状态刷新显式清缓存 | `getCurrentMap()` / `refreshStatus()` |
| B6 | 一般 | 「设为主快照」换了基准，面板状态栏仍显示旧基准（只清了缓存、没有重读触发点） | 加模块级 `panelDirty`，面板 render 时据它强制重读 | `panelDirty` / `openSyncPanel().render` |
| C3 | 建议 | 恢复完成后 10 秒无条件自动刷新 —— 若此时仍有操作在写，刷新会掐断它 | 自动刷新前检查 `_opInFlightAt`，有操作则暂停刷新并提示 | `openApplyReportDialog()` |
| C1 | 一般 | `copyText` 不 await 不 catch：剪贴板被浏览器拒绝时仍显示「已复制」，用户粘到的是旧内容 | 改为 `async` 并 await，失败向上抛（调用点已有 catch） | `copyText()` / copy-full 分支 |
| B2 | 建议 | 「导出快照」按钮实际导出的是**当前世界设置**而非服务器主快照，文案误导 | 按钮与说明改写为「导出当前世界设置」，并指出主快照的正确取法 | `openFilePanel()` |
| B1 | 建议 | 差异超 120 项时提示「完整清单见导出快照」，而导出文件里没有差异标记，对不出来 | 把完整差异键 `console.log` 输出，提示改为指控制台 | `openDiffDialog()` |
| 卫生 | 建议 | ① `setTheme` 用全局 `$(".wsync-app")` 选窗口（会改到正在关闭的旧窗口）② 玩家端 window 上暴露写入口 ③ 自动提醒开关对玩家可见但无效 | ① 改 `.window-app.wsync-themed` ② 写入口只在 GM 端暴露（函数内 assertGM 仍保留）③ 非 GM 隐藏该开关 | `setTheme()` / `_readonlyApi` / `openSyncPanel().render` |

---

## 2. 本轮我自己的三个错（同一轮里发生、同一轮里改掉）

1. **改断言名却没改断言值**：更新 v121/v128 的版本断言时，我把 `ok("…1.2.9")` 的名字改成
   1.3.0，但正则与比较值仍是 `1.2.9`（`/const MODULE_VERSION = "1\.2\.9";/`、
   `w.__eval("MODULE_VERSION") === "1.2.9"`）→ 断言名说 1.3.0、断言体测旧值，跑出来 3 条 FAIL。
   **教训**：断言名与断言体是两处，改版本号要一起 grep，别只改看得见的那处。
2. **为测试环境新增 API 时忘了沙箱**：加 `AbortController` 后，七套测试全部崩在
   `ReferenceError: AbortController is not defined`（测试用 `vm.createContext`，是干净全局）
   → 改成 `typeof` 探测式写法。这也是**更正确的生产代码**：探测式写法在缺 API 的环境退化而不是抛错。
3. **`old_string` 匹配到两处**：改 README 的 `  "appVersion": "1.2.9",` 时报 matched 2 times ——
   另一处是缩进更深的同名行，2 空格版本是它的子串。**这次是 edit 工具的唯一性校验拦下的**，
   不是我自己发现的。教训与批次 2 一致：改文本用强制唯一匹配的工具，不要用脚本批量 Cut。

---

## 3. 验证（全部本地实测）

- `node --check scripts/world-sync.js` → exit 0
- **八套测试脚本 554 项断言全绿**：
  v120 73 / v121 82 / v123 15 / v124 32 / v126 47 / v127 72 / v128 106 / **v130 127（本轮新增）**
- v130 = 由 v128 复制后追加 **21 条**本轮断言（超时常量、hasStableWorldId、createdByKey 两条路径、
  MAX_IMPORT_BYTES 与「校验在读之前」的相对位置断言、getCurrentMap、panelDirty 两处、
  C3/C1/B1/B2 文案与结构、玩家端 `_readonlyApi`、玩家隐藏开关、setTheme 选择器等）
- 版本五处同步：`module.json` / JS 头注释 / `MODULE_VERSION` / CSS 头 / README appVersion ×2 → 全部 1.3.0
- 中文直引号扫描 12 处，全部为模板串/HTML 属性内的合法引号
- 包：`01_跑团工具\Foundry模块\your-world-sync.zip` = **85462 字节 / 5 条目**
  （module.json 979 / README.md 37330 / LICENSE 1059 / scripts\world-sync.js 185740 / styles\world-sync.css 13129）；
  旧包备份 `.v129.bak`（80703）

---

## 4. 发布

- commit **1db97c3**「v1.3.0：第七轮整体盲审剩余 13 项一次收口」（4 files, +197/−62）
- push main（74863f1..1db97c3）→ tag v1.3.0
- Release：https://github.com/Ryuka16/your-world-sync/releases/tag/v1.3.0

---

## 5. 状态：盲审清单已清空

轮次 1~7 累计报出 **约 89 条**，核实为真 **63 条**，其中致命 2 条、严重 14 条，**全部已修**。
仍在「观察、判断=不改」的 3 条（均已在各轮记录里写明理由）：

1. `window.lhWorldSync.applySnapshot` 的 `precomputed` 参数只判 `Array.isArray`（有 assertGM 兜底）。
2. 旧合并账本的读失败提示只写 console（该文件只读不写，影响面小）。
3. 自指键（`your-world-sync.*`）在 `parseSnapshot` 里是整份拒收而非跳过（有意偏硬）。

### 只能真机验证、本地无法覆盖的（部署后建议实测）

- HTTP 层真实行为：`storageRead` 的 404/5xx/超时三态、`uploadPersistent` 空 path 语义
- 双客户端并发时序与 2 分钟锁 TTL
- Dialog v1 的 `options.jQuery` 默认值、Enter 是否带 event
- 面板首次 render 时元素是否已挂载（`refreshStatus` 的 `dlg.element` 判定）
- 跨服务器搬家的实际观感（缺模组提示、模块开关恢复）
- v13 下 CSS 的实际渲染（五套主题对比度）
