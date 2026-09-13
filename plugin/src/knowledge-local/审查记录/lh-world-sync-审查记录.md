# your-world-sync · 审查记录（错误与解决办法）

> **本文件的用途**：每做完一轮代码审查，在这里追加一节，写清「发现了什么错 → 怎么修的 → 怎么验证的」。
> 目的不是自我批评，是让同一个坑**第二次出现时能被立刻认出来**。
>
> **写入规则**
> 1. 只记**真问题**（能指到代码行、能说出触发条件的）；指不出来源的猜测不进来，或明确标注「未验证」。
> 2. 每条必须有三样：**位置**（函数名 + 版本时的行号，行号会随版本漂移所以函数名更重要）、**触发条件**（什么操作会踩到）、**修法与验证**。
> 3. 修完了就更新状态（`已修 vX.Y.Z` / `只修一半` / `未修·原因`），不要删旧记录。
> 4. 版本与文件：`<工作目录>\Git源码\your-world-sync\`（`scripts/world-sync.js` 主文件）。
>
> **配套文件**：审阅清单在 `01_跑团工具\FVTT技术资料\搓怪物做效果做mod任何时候，看到了一定要看仔细看\血的教训-代码审阅自检清单篇.md`（14 项）。

---

## 0. 审查是怎么做的（机制）

| 环节 | 做法 | 为什么这样 |
|---|---|---|
| 独立盲审 | 起一个**看不到作者任何判断**的 subagent，只给它代码路径 + 14 项清单 + FVTT 源码路径（`<FVTT安装目录>\resources\app\`），要求输出「问题清单 / 14 项逐项结论 / 未验证部分」，并**禁止改文件** | 作者自审会顺着自己的思路读，看不见自己的盲区；换一双眼睛十行内就能指出来 |
| 改动专审 | 再起一个 subagent 专审「上一轮这 N 处改动**本身**」：修好没修好、有没有引入新 bug、改动之间有没有冲突 | 修补丁比找 bug 更容易翻车，必须单独验 |
| 作者自查 | 我按同一份 14 项清单逐项过一遍，与盲审结果交叉 | 两边都命中的才是高置信真问题 |
| 修法与验证 | 每条修完，先写**测试断言**（`vm.createContext` 加载真实脚本 + 打桩）再改代码；跑全量回归 | 「声称修了但没生效」在本项目出现过 6 次，只靠读代码确认不了 |
| 存档 | 本文件 + 每版打包 + GitHub Release | 可追溯、可回退 |

> **⚠️ 本项目最稳定的失效模式（四轮共 6 次）**：
> **「上一轮声称修好了、实际只改了一半」** —— 例如声称「恢复失败回滚也改批量」而代码只改了回档；
> 声称「diff 两边都规范化」而只改了一边。**修完必须回头读一遍自己刚写的代码，或写断言把它钉住。**

---

## 轮次 1 · 审 v1.2.0（首轮盲审，19 条 → 核实 8 条真问题）

审查者：独立 subagent，通读全文（不看作者判断）。**当时我自己的 52 项单元测试全绿，却一个都没抓到。**

| # | 严重度 | 问题 | 位置 | 触发条件与现象 | 修法 |
|---|---|---|---|---|---|
| 1 | **致命** | 「存主世界」与导入「设为主快照」**直接覆盖主快照，零备份** | `openSyncPanel` 的 save callback、`openSnapImportDialog` 的 asMaster 分支 | 手滑或在一个配置不全的世界点一次「存主世界」→ 全服务器的恢复基准被污染，**无法反悔** | v1.2.1：覆盖前先 `backupMasterSnapshot()` 另存 `.prev`；v1.2.4：备份失败则**中止覆盖**并说明原因 |
| 2 | 严重 | 面板模块列表里残留 `n !== "core"` 过滤 | `nsCheckboxListHTML` | 面板列表**永久缺 core 行** → 面板恢复静默跳过全部 `core.*`，而 `buildSelection` 又把它算进差异 → **「恢复完还一直报差异」死循环** | v1.2.2：删掉该条件，改为「当前世界 ∪ 快照」并集 |
| 3 | 严重 | **同一份偏好三种含义** | `buildSelection`（`\|\| !picked.length` 空=custom→当全部）vs `saveScopePref`（0 勾选存成 custom+0）vs `selectionFromPanel`（0 勾选=什么都不恢复） | 用户取消全部勾选后保存，下次进世界的含义随路径而异 | v1.2.2：`saveScopePref` 拒绝保存 0 勾选（并提示）；三条路径统一语义 |
| 4 | 严重 | `storageRead` 硬编码 `"/" + STORAGE_DIR` | `storageRead` | 配了路由前缀的服务器（`ROUTE_PREFIX`）**必然 404**；且 404/5xx 一律返回 null → 界面显示「尚未保存主世界快照」（**把读失败讲成不存在**） | v1.2.2：改用 `foundry.utils.getRoute()`（出处 `public/scripts/foundry.mjs:1248-1255`，导出 `:61351`）+ 新增 `storageLastError` 区分 404 与 5xx |
| 5 | 一般 | 回档路径**没有上锁** | `rollbackApplyLog` | 两个 GM/两个标签页同时回档 → 互相覆盖 | v1.2.1：回档也走 `acquireLock` + `try/finally` 释放 |
| 6 | 一般 | 锁的「自己人」判定用 `l.userId !== game.user.id` | `acquireLock` | **同一个 GM 开两个标签页 → 双双放行**，锁形同虚设 | v1.2.2：改 sessionStorage 里的 `myOwner()`（每标签页一个随机 ID） |
| 7 | 一般 | 回滚失败被 `catch (e2) { console.error }` 吞掉，外层仍提示「恢复失败，**已自动回滚**」 | `applySnapshot` / `proceedApplySnap` | 回滚也失败时，界面在**说假话**，用户以为世界已还原 | v1.2.2：记 `e.__rollbackFailed`，按三态给话（未开始 / 已回滚 / 回滚也失败·请勿刷新） |
| 8 | 一般 | 判「这个 key 在本世界存不存在」用的是**导出时的过滤结果** | `applySnapshot` 写入循环 | 外来快照含 `your-world-sync.*` 或 user 级键时，会 `createDocuments` **造出同 key 的第二份 Setting 文档** | v1.2.2：改用 `currentMap.get(key)?.doc ?? getSettingDoc(key)` 单一路径；v1.2.4：统一「同 key 取第一份」对齐官方 `getSetting(key,user=null)=find(...)` |
| 9 | 一般 | 面板可重复打开（无单例）+ `refreshStatus` 用 `$(".wsync-app.wsync-panel").first()` 定位 | `openSyncPanel` / `refreshStatus` | 连点两次开两个面板；关窗后元素因 `slideUp` 滞留约 200ms → 刷新状态**写错窗口** | v1.2.2：`openPanelDlg` 单例 + `refreshStatus` 改用传入的 `dlg.element` |
| 10 | 一般 | 回档把「本来就不存在（无需处理）」计入「**已回档 N 项**」并宣称「已全部还原」 | `rollbackApplyLog` / `doRollback` | 虚报战果，用户以为回了很多其实什么都没动 | v1.2.2：拆 `restored` / `untouched`，报告分开讲 |
| 11-19 | 建议 | 死字段 `sourceWorldId`（只写不读）／快照无条目上限／通知未转义／死变量 `style="--dot"`／`nth-of-type` 配色耦合／`applyLogFile` 中文名被压成 `____` 撞名／恢复模组列表可能把本模块自己关掉／README 四处过强断言／按钮文案与行为不符 | 各处 | — | 分别修于 v1.2.2 / v1.2.5（见对应轮次） |

**它同时排除了 3 个假警报（也是有价值的产出）**：
- `value` 传 JSON 字符串**正确**（`common/data/fields.mjs:2982-3027` JSONField 会 parse/stringify）
- `.json` 覆盖写**允许**（`MEDIA_FILE_CATEGORIES` 含 TEXT，`common/constants.mjs:1664-1671`）
- `persistentStorage` 的 storage 目录在**模块更新时会保留**（`dist/packages/installer.mjs`）
- `styleWindow` / `refreshStatus` 的执行时机没问题（`client/appv1/api/dialog-v1.mjs:128` 的 `data.render` 在 activateListeners 内触发）

---

## 轮次 2 · 专审 v1.2.1 / v1.2.2 的改动本身（17 条）

审查者：第二个独立 subagent，**只审上一轮那些改动**。

> **这一轮的最大价值**：它发现 v1.2.1/v1.2.2 引入/未修的「**读失败被当成空数据**」有**三条独立路径**，症状全都伪装成正常状态。

| # | 严重度 | 问题 | 位置 | 触发条件与现象 | 修法 |
|---|---|---|---|---|---|
| 2.1 | 严重 | 回档账本**读失败被当成「没有账本」** | `readApplyLogStore` | 服务器抽风/断网 → 用户看到「本世界暂无可回档记录」，**把「读不到」讲成「不存在」** | v1.2.4：新增 `applyLogReadError`，在第一处 `storageRead` 之后**立刻**捕获（防 `storageLastError` 被后续调用覆写）；`doRollback` 按它区分文案 |
| 2.2 | 严重 | 主快照备份**静默失效** | `backupMasterSnapshot` 的 `if (!old) return null;` | 旧快照**存在但读失败** → 判定为「没有旧快照」→ 跳过备份，而通知仍说「已保存」，**用户以为有退路其实没有** | v1.2.4：返回 `{ok,path}` / `{ok:false,reason:'readError'\|'writeError',detail}`；两个调用点在失败时**中止保存**并明说原因 |
| 2.3 | 严重 | 锁回读失败被当成「别人抢了锁」 | `acquireLock` 回读校验（`JSON.parse(null)` 不抛错 → `l2?.operationId` 为 undefined ≠ 自己 → 拒绝） | 锁文件读不到 → 用户看到「已有进行中的操作（另一位 GM）」，**其实是自己刚写的锁读不回来** | v1.2.4：只在**回读到明确的、非自己的 operationId** 时才拒绝 |
| 2.4 | 严重 | **同一个 key 两套查找规则** | `collectWorldSettings` 的 `out.set(key,…)`（后覆盖前）vs `getSettingDoc` 的 `find`（取第一个） | 世界里存在重复 Setting 文档时 → 恢复更新一份、回档更新另一份，**两边对不上** | v1.2.4：`collectWorldSettings` 改为「同 key 只取第一份」+ 一次性 warn；写入改用 `getSettingDoc` 单一路径（对齐官方 `client/documents/collections/world-settings.mjs:35-37`） |
| 2.5 | 一般 | `statusSnapCache` 没有失效点 | 导入「设为主快照」成功后 | 面板状态栏仍显示**旧基准**，与刚设的新基准不符 | v1.2.4：asMaster 成功后 `statusSnapCache = null` |
| 2.6 | 一般 | `storageRead` 的 `return await r.text()` 写在 try **之外** | `storageRead` | 读 body 过程中断线 → 异常逃逸到调用点（如 `openRestoreConfirm` 首行无 catch）→ **用户点了没反应** | v1.2.4：移入 try，失败记 `storageLastError` 返回 null |
| 2.7 | 一般 | 锁 TTL 30 秒**不续期** + 锁文件**跨世界单槽** | `LOCK_TTL_MS` / `LOCK_FILE` | 大世界（实测 1298 项）恢复可能超过 30 秒 → 第二个流程闯进来 | v1.2.4：TTL 提到 `120000`（约 2 分钟），4 处通知文案同步 |
| 2.8 | 一般 | `parseSnapshot` **只校验 key 不校验 `value`** | `parseSnapshot` | 条目缺 value → `JSON.stringify(undefined)` = undefined → 写入抛 `must be a serialized JSON string`（出处 `common/data/fields.mjs:3013-3014`），整个批量失败 | v1.2.4：加 `if (!("value" in item)) throw` |
| 2.9 | 一般 | 快照无条目上限 | `parseSnapshot` | 超大/损坏文件可能撑爆浏览器内存 | v1.2.2：> 20000 条拒绝导入 |
| 2.10 | 一般 | `storageLastError` 是**单变量**，会被后续调用覆写 | 模块级变量 | 早先的错误原因被后面的成功读覆盖 → 界面给错归因 | v1.2.4：关键路径（账本）改为**立刻**捕获到专用变量 |

**它明确列出的未验证部分**（值得学习的诚实）：
无真机运行验证；`e.__rollbackFailed` 三态只核到头部注释；未在用户服务器检查是否存在重复 Setting 文档；未打印 `game.world.id`；未拿到主快照真实条目数；README 48 行改动未逐行审；**「报告期间文件被并发改写 3 次（1792→1540→1828→1864 行），行号会漂移，建议先冻结再审」**。

> 最后这句话成了后面流程的改进点：**审查期间必须冻结代码**，否则行号对不上、审阅结论会漂。

---

## 轮次 3 · 审 v1.2.3 / v1.2.4（17 条，含 1 致命）

| # | 严重度 | 问题 | 位置 | 触发条件与现象 | 修法 |
|---|---|---|---|---|---|
| 3.1 | **致命** | v1.2.4 新增的「跳过本机未安装模组的键」**只加在写入循环**，而**记账循环在它之前**、记的是全部 `diff.changed` | `applySnapshot` 记账 vs 写入顺序 | 账本把「本来不存在、这次也不会创建」的键记成 `present:false` → 回档时按「恢复为键不存在」执行**删除** → 用户此后装上了那个模组并精心配置过的值，**在一次看似无关的回档中被删掉且不可撤销** | v1.2.5：先算 `plan`（真正会写入的项），**账本 / 失败回滚 / 返回值 / 报告弹窗四者全部以 plan 为准**；判据抽成 `isNsUnavailable(key)` 并被 `diffSnapshot` 共用（否则被跳过的键永远算差异 → 每次进世界弹提醒、永不收敛） |
| 3.2 | 严重 | **假锁**：v1.2.4 把 `beginOp` 放在拿锁**之后**，且拒绝分支在 `try/finally` **之外** | `applySnapshot` | 拿锁被拒时闸没被释放 → 后续 2 分钟 TTL 内**所有人都被「已有进行中的操作」挡住**，而其实没有任何操作在跑 | v1.2.5：闸提到 `acquireLock` **之前**；所有 return/throw 路径都在 `try/finally` 内 |
| 3.3 | 严重 | 被锁拒绝/被守卫拒绝时仍提示「当前世界与主世界基准一致，无需恢复」 | `proceedApplySnap` | 「恢复失败」被讲成「本来就没差异」，**用户以为不需要恢复** | v1.2.5：`if (res.locked \|\| res.denied \|\| res.busy) return;`；空计划时区分「真无差异」与「全被跳过」 |
| 3.4 | 严重 | 面板首刷**双读快照**，`refreshStatus(true)` 每次都强读 | `openSyncPanel` render | 每次开面板多一次 9MB 下载 | v1.2.5：改 `refreshStatus(false)` 真正复用 `statusSnapCache` |
| 3.5 | 一般 | `unavailable` 统计与勾选范围无关 | `applySnapshot` | 只勾一个模块时提示「另有 N 项未恢复」，容易误解 | v1.2.5：文案明确为「快照里有 N 项属于本世界没装的模组」（**已知仍有轻微误导，见下端「仍在观察」**） |
| 3.6-3.17 | 一般/建议 | `window.lhWorldSync.rollback` 绕过会话闸／重复 key 警告每次刷屏／legacy 账本读失败未记错／锁文案仍写「30 秒」／报告分组统计用的清单来源不统一 等 | 各处 | — | v1.2.5 逐条修（`_dupKeyWarned` 一次性门、写入口加闸、文案统一为「约 2 分钟」等） |

**这一轮暴露的方法论问题**：v1.2.4 一次性改了 19 处，改动量太大，导致**新引入的致命问题与旧问题混在一起**，审阅者要靠猜才能分清哪些是旧问题哪些是新引入。
→ 改进：**后续单轮改动控制在 10 处以内**，并且**改完先自己冻结、再送审**。

---

## 轮次 4 · 审 v1.2.5 的改动本身（进行中）

- 审查者：第四个独立 subagent（专审 v1.2.5 那 6 组改动 + 全文 14 项）
- 重点怀疑清单（我自己先列出来的，供交叉验证）：
  1. `plan` 重排后，**四条路径（写入/记账/回滚/报告）是否真的全都用了 plan**，有没有漏掉的地方仍用 `diff.changed`
  2. `unavailable` 计数**没有考虑 selection** → 只勾部分模块时是否误导
  3. `isNsUnavailable` 被 `diffSnapshot` 共用后，对「面板勾选一个未安装模组」的场景是否有影响
  4. `beginOp` 提前后，是否存在「占着闸但没拿锁」的窗口
  5. `storageRead` 与 `applyLogReadError` 在「主账本成功、旧账本失败」时是否会误报
### 结论：v1.2.5 的 6 组声明 → **3 组完全修好、2 组只落一半、1 组引入新问题**；另发现 13 条新问题（0 致命 / 2 严重 / 5 一般 / 6 建议）

**确认修好的（逐行核对，不是口头确认）**：
- ① `plan` 重排：写入 `world-sync.js:1001-1011`、记账 `:1015-1022`、失败回滚 `:1046`、报告 `:1074` 四条路径**确实全部落到 `plan`**；计数链路 `proceedApplySnap → openApplyReportDialog(res.applied) → applied.length → saveLastReport` 也干净。`isNsUnavailable` 的三个调用点（diff `:767` / 统计 `:955` / 计划 `:1004`）同源。
- ② 报告计数与漂移检测同源：`findDriftedKeys` 比的是 `log.after`，而 `after` 记的是 `keepSelfEnabled` 之后的**实际写入值**（`:1021`）。
- ③ 闸提前：`beginOp` `:965` 在 `acquireLock` `:969` 之前，唯一的早退 `:960` 在拿闸之前，被拒分支 `:976` 落在 try 内、`finally` 统一释放 → 不存在「占闸没拿锁」「拿锁没人放」的窗口。
- **v1.2.4 那条致命账本路径（把不会创建的键记成 `present:false` 供回档删除）确认封死。**

**只修一半 / 引入新问题的**：
- ④ 「busy 不再补假话」前半真修（`:1402`），后半的「有差异但全被跳过」分支（`:1406-1407`）**不可达** —— `diffSnapshot` 已过滤掉不可用键，`skippedNs` 成了全文件无人读的死变量；而它想覆盖的真实场景改从「基准一致」那条路溜走了（→ 见 4.4）。
- ⑤ 面板首次刷新不再 force 生效了，但**引入了陈旧缓存**（→ 见 4.6）。

| # | 严重度 | 问题 | 位置（v1.2.5 时行号） | 触发条件与现象 | 修法 |
|---|---|---|---|---|---|
| 4.1 | 严重 | 旧账本（`apply-log.json`）读失败被记进 `applyLogReadError`，而那份文件**只读不写** | `readApplyLogStore` `:846` / `writeApplyLog` `:867-870` | 服务器对一份永远不会被写的文件持续报错时 → **用户的每一次恢复都被中止**，理由还是错的（「为避免覆盖本世界原有的回档记录」） | **v1.2.6**：单独记进新变量 `legacyLogReadError`，只影响回档提示，不阻断恢复 |
| 4.2 | 严重 | 回档路径与该规则相反：主账本读失败、旧账本却读到了条目时照常回档 | `rollbackApplyLog` `:1086-1089` | 用**可能已经过期的旧值**批量覆盖世界；随后 `markLogRolledBack` 还会把主账本里更新的那条标成「已回档」，撤销点语义被污染 | **v1.2.6**：主账本读失败一律拒绝回档（与写入路径对齐）；主账本本来就没有、旧账本又读不到时，也如实说「读不到」而不是「没有记录」 |
| 4.3 | 一般 | 「另有 N 项未恢复」的口径与实现不符 | `applySnapshot` `:953-956` | 拿**整份快照**统计，不看勾选范围、不看排除键 → 只勾一个模块也报「另有 250 项未恢复」，还把 `core.time` 这类故意永不恢复的键算了进去；README/头注释的描述与代码不一致 | **v1.2.6**：抽出 `collectUnavailable()`（三条件：非排除键 + 模组确实没装 + 在本次勾选范围内），面板早退 / 文件导入 / 自动提醒 / 状态栏 / 写入通知五处共用 |
| 4.4 | 一般 | 差异为空时一律说「一致」 | 面板 `:1789` / 文件导入 `:1751` / 自动提醒 `:2025` 三处早退 | 「能恢复的那部分已经一致、另有 N 项从未落地」被掩盖（跨服务器搬家、缺装几个模组的主场景），用户以为已经恢复完了 | **v1.2.6**：三处早退都区分「真一致」与「另有 N 项缺模组」，面板状态栏也补上这一行 |
| 4.5 | 一般 | 面板勾选列表把「本机没装的模组」显示成可勾选 | `nsCheckboxListHTML` `:1208-1224` | 勾了却不生效（UI 承诺与行为不符）：点恢复只得到一句「基准一致，无需恢复」 | **v1.2.6**：整行标灰（`.wsync-ns-off`）+ 写明「本机未安装这个模组 · 本次不会恢复」 |
| 4.6 | 一般 | 快照解析失败时旧缓存不清 → 状态栏拿**上一次**的基准算差异 | `openSyncPanel` `:1813-1825` / `refreshStatus` `:1962` | 主快照损坏 / schema 不符 / 条目超限时，界面显示得「好好的」，数字却来自上一份快照 | **v1.2.6**：先清缓存再解析，两条失败路径都清 |
| 4.7 | 一般 | finally 里先放闸、后放锁 | `applySnapshot` `:1075-1078` | 同标签页的下一个操作可能被上一个的 `releaseLock`（「读→判归属→写」非原子序列）误删锁 | **v1.2.6**：调换顺序（先 `releaseLock` 再 `endOp`） |
| 4.8-4.13 | 建议 | 死变量 `skippedNs` 与不可达分支 / `markLogRolledBack` 静默失效（「已回档过」防护无声消失）/ 账本格式异常被静默当空后覆盖（升 schema 时会丢旧记录）/ 「另有 N 项没恢复」只活在瞬时通知里（刷新即消失）/ `saveLastReport` 的死字段 `sourceWorld` 命名反了 / `applySnapshot` 对外签名不校验 `precomputed` | 各处 | —— | **v1.2.6** 逐条处理：死代码并进 `unavailable`、标记失败留日志、格式异常先另存 `.bak-<时间戳>`、`skipped` 进入报告与回看清单、删死字段；签名校验保留现状（有 `assertGM` 兜底）并在下节记录 |

**它自报没验证到的部分（诚实清单，值得学）**：HTTP 层真实行为（`storageRead` 的 404 判定、`uploadPersistent` 空 path 的语义）、真机双客户端并发时序与锁 TTL 边界、Dialog v1 的 `options.jQuery` 默认值与 Enter 提交是否传 event、面板首次 render 时元素是否已挂载、跨服务器搬家的实际观感、v13 新皮肤下的 CSS 渲染。

**它顺手排除的假警报**：`game.modules` 里**未启用但已安装**的模组**仍然存在**（源码级坐实 `dist/packages/world.mjs`：world-data 构造 `modules: u`，`l = db.Setting.getValue("core.moduleConfiguration")`）→ `isNsUnavailable` 只跳过「真的没装」，新世界一键读回的主场景不受影响。

---

## 轮次 5 · 专审 v1.2.6 的修复本身（0 致命 / 1 严重 / 6 一般 / 10 建议）

- 审查者：第六个独立 subagent。这轮刻意**换角度**：明确交代它重点覆盖**从未被逐行审过的区域**（`styles/world-sync.css` 全文、`README.md` 全文、v1.2.1~v1.2.6 新增却未被专审的 UI 函数，以及 v1.2.6 那 13 处修复本身）。
- 它自报的未验证项：CSS computed 实测、`renderSidebar` 真实时机与切 tab 后按钮是否留存、`uploadPersistent` 返回结构、fa 图标渲染、`core.moduleConfiguration` 写入后 core 的反馈、Release 包整包一致性。

| # | 严重度 | 问题 | 位置（v1.2.6 时行号） | 触发条件与现象 | 修法 |
|---|---|---|---|---|---|
| 5.1 | 严重 | 回档说明弹窗只判 `applyLogReadError`、**没判** `legacyLogReadError` | `openRollbackDialog` `:1607`（对照 `doRollback` `:1188` 已修对） | 主账本 404（404 会把 `storageLastError` 清空 → `applyLogReadError=null`）+ 旧账本读失败 → 界面说「本世界暂无可回档记录」，而撤销点就在那份读不到的文件里；该弹窗只有「关闭」按钮，走不到会说真话的 `doRollback` | **v1.2.7**：改 `const readErr = applyLogReadError || legacyLogReadError;` |
| 5.2 | 一般 | v1.2.6 的「解析失败清缓存」只修了一半 | `refreshStatus` `:2097-2100` | `statusSnapCache = text ? parseSnapshot(text) : null;` —— `parseSnapshot` 抛错时**赋值语句根本不执行**，旧快照留在缓存里，之后不带参数的刷新拿旧基准算差异还显示得好好的 | **v1.2.7**：重读前先 `statusSnapCache = null;`，catch 里也清 |
| 5.3 | 一般 | `legacyLogReadError` 陈旧值永不清零 | `readApplyLogStore` `:885-891` | 唯一的重设点在「主账本读不到」的分支里，主账本一旦读到就直接 `return` → 上一轮遗留的旧错误一直留着，会把一次**正常读取**讲成「读取失败」 | **v1.2.7**：每次读取开头先 `legacyLogReadError = null;` |
| 5.4 | 一般 | 账本坏了只说「暂无可回档记录」；且 `.bak` 每次读取都新增一个 | `readApplyLogStore` `:856-871` + 弹窗 `:1604-1609` | 坏在哪、备份叫什么只在 console；`.bak-<Date.now()>` 每打开一次面板就多一个，与 README「不会累积文件」自相矛盾 | **v1.2.7**：新增 `applyLogCorrupt`（原因 + 备份名）并显示在弹窗；另存文件名改用**内容指纹** `contentTag()`，同内容不重复备 |
| 5.5 | 一般 | 账本只校验 `{schema, worlds}` 两层，**内容不校验** | `:856` + `rollbackApplyLog` `:1209-1226` | 结构合法但内容不对时（如 `prev:{"dnd5e.foo":"bar"}`），回档会照账本里的键去**删、去写真实 Setting 文档**（`p.present` 为 undefined → 判 falsy → 执行删除） | **v1.2.7**：新增 `validateApplyLogEntry()`（prev 是对象 / 每条是对象 / `present` 是布尔 / 键名含点 / 条目上限 20000），主账本与旧账本两条读路径都调用 |
| 5.6 | 一般 | 保存「不参与恢复的设置」后不刷新状态栏 | `openSyncPanel` `:2056-2069` | 排除表变了，状态栏那行差异数仍按旧排除表算（「保存范围」分支末尾有这一步，这里漏了） | **v1.2.7**：`notify.ok` 后补 `refreshStatus()` |
| 5.7 | 一般 | 蓝白（唯一浅色）主题下强调色几乎不可读 | `styles/world-sync.css:21` | `--wsync-accent2: #f5a623` 在 `--wsync-surface: #f7fbff` 上对比度仅 **1.95:1**（WCAG 需 4.5:1）；使用点 `:178`（模组配置行名）、`:244`（差异标签）、`:383`、`:395`（「查看清单」入口） | 待办（下一轮）：只改 bluewhite 一组，accent2 → `#a35200` 一类、accent → `#1565c0`；其余四套 >7:1 不动 |
| 5.8 | 建议×10 | ① `:1472`「完整清单见导出快照」指向不实；② `:1546` `<span class="wsync-v-master">` 与 `:1470` `.wsync-v-arrow` 类名不一致；③ `.wsync-btn`(`css:202-216`) 的 `border-radius`/`font-size` 无 `!important`，被 FVTT `body.game .app button`(`foundry2.css:11805-11816`，(0,2,2)) 吃掉；④ `.wsync-diff-row code`(`css:236-241`) 吃到 FVTT 全局 `code{display:block;background:var(--color-code-bg)}`(`foundry2.css:3243-3256`)，浅色主题下 `#cceeff44`(`:2581-2584`)；⑤ 主题圆点 deep 用 `var(--wsync-accent)` 随主题变、bluewhite 圆点与面板底色同色(`css:116/123`)；⑥ `:1014` 去重 O(n²)；⑦ `:2117` 非法时间显示 Invalid Date；⑧ README:29 漏「→增加项/→减少项」；⑨ `:2219` 用 `title` 而非 `data-tooltip`；⑩ 锁读写失败静默降级只在 console | 各处 | —— | 待办（下一轮集中处理，与 5.7 一起） |

**它顺手排除的假警报（有源码依据，值得记下来避免重复怀疑）**：
- `.wsync-app .dialog-buttons` 选择器命中成立（`templates/app-window.html:1` + `application-v1.mjs:433-434`）
- **深色主题下 Dialog 按钮黑字黑底已安全**：FVTT `body.game .app.dialog .dialog-buttons button`（`foundry2.css:12362-12366`）与 `.default`（`:5135-5137`）都**没有** `!important`，模块的 `.dialog-button` 带 `!important` 胜出
- `triggerDownload` 的捕获阶段 `stopPropagation` + `bubbles:false` **确有必要**（`client/game.mjs:2018` 在冒泡阶段监听、`:2049-2055` 对任何 `a[href]` 一律 `preventDefault + window.open`，且**不看 `download` 属性**）
- 以 JSON 字符串写 Setting `value` 与官方同路（`client-settings.mjs:284-293`、`fields.mjs:3007-3010/3018-3021`）
- `renderSidebar` 钩名来历属实（`application.mjs:523` hookName="render" + `:1226-1233` 按 `cls.name` 拼名 + `sidebar.mjs:23` 类名 Sidebar）
- CSS 五套主题 12 个变量无一缺项、无未定义引用（`var(--wsync-mono, ui-monospace, monospace)`(`css:407`) 有兜底属有意）
- 无 `setInterval`、无未调用函数

**本轮我自己在修的过程中犯的错（也记下来）**：改 `refreshStatus` 函数体时**忘了改参数名**（`forceSnap` → `snapOverride`），函数体引用了不存在的变量 —— `node --check` 只验语法、**抓不到**；是文本断言 `async function refreshStatus(snapOverride)` 抓到的。教训：**重命名参数时，签名与函数体必须一起改，并且要有断言把两者绑在一起。**

---

## 汇总统计

| 轮次 | 审的对象 | 报出条数 | 核实为真 | 其中致命 | 其中严重 |
|---|---|---|---|---|---|
| 1 | v1.2.0 全文 | 19 | 8（+9 建议） | 1 | 3 |
| 2 | v1.2.1/v1.2.2 改动 | 17 | 10 | 0 | 4 |
| 3 | v1.2.3/v1.2.4 改动 | 17 | 11 | 1 | 4 |
| 4 | v1.2.5 改动 | 19 | 14 | 0 | 2 |
| 5 | v1.2.6 改动 + CSS/README 全文 | 17 | 7（另 10 条建议） | 0 | 1 |

**六轮累计：报出 89 条，核实为真 50 条，其中致命 2 条、严重 14 条。**
（第 5 轮的 7 处修复落在 **v1.2.7**，测试总数 **321 项**全绿：v120 73 / v121 82 / v123 15 / v124 32 / v126 47 / v127 72。5.7 与 5.8 那 11 条列进下一轮。）

**六轮共 8 次「声称修了、实际只改了一半」** —— 这是本项目最稳定的失效模式，比任何具体 bug 都值得记。
（第 5 轮一次就抓到两处：v1.2.6 的「解析失败清缓存」只改了 `openSyncPanel` 那条路、`refreshStatus` 那条没改；v1.2.6 的「旧账本读失败只影响回档提示」也只改了 `doRollback`、弹窗没改。规律：**同一件事有 N 条路径时，改完必须逐条点名核对，不能只改自己想到的那一条。**）

---

## 沉淀下来的做法（下个项目直接照用）

1. **审查期间冻结代码**：审阅者拿到的行号必须能对上，否则结论漂移、白审一轮。
2. **一轮改动不超过 10 处**：改太多会把自己新引入的 bug 与旧问题混在一起，分不清。
3. **修完立刻写断言**：用 `vm.createContext` 加载真实脚本 + 打桩，跑端到端用例（例：恢复 → 装上该模组并配置 → 回档 → 断言配置仍在）。本项目 228 项测试就是这个模式下攒出来的。
4. **「声称改了」必须回读验证**：头注释写了、代码没改，这种情况出现过 6 次。写完回头读一遍自己刚写的代码。
5. **区分「读失败」与「不存在」**：这是本项目出现频率最高的伪装 bug（账本 / 备份 / 锁三条路径都有过）。任何 `if (!x) → 当成空` 的写法都要停下来想一秒。
6. **写操作要可逆**：覆盖前备份（`.prev`）、失败后自动还原、失败还原也失败时必须**如实说**，不能让界面说假话。

---

## 仍在观察（已知但暂未改）

- `applySnapshot` 的对外签名 `window.lhWorldSync.applySnapshot(snap, selection, precomputed)` 里 `precomputed` 只判 `Array.isArray`，控制台可传伪造清单绕过 selection（第四轮 T6）—— 写入口有 `assertGM` 兜底、且只有 GM 能用，暂不改。
- ~~旧版合并账本（`apply-log.json`）的读失败提示只在 console 里，面板不显示~~ → **v1.2.7 已修**（弹窗同时读 `legacyLogReadError`，见 5.1）。
- **蓝白主题对比度（5.7）与 5.8 那 10 条建议** —— 留待下一轮集中处理。本轮刻意把改动压在 7 处以内（教训：v1.2.4 一次改 19 处，把新引入的 bug 与旧问题混在一起，排查成本翻倍）。
- 「本机未安装的模组」在面板里仍可勾选（只是标灰），偏好里可能存着它们的名字 —— 语义无害（diff 会过滤），暂不改。
- `getSettingDoc` 只认 `user === null`（user 级设置同集合存在复本，边界极低）。
- 自指键（`your-world-sync.*`）**整份拒收**偏硬，但出于安全保留。
