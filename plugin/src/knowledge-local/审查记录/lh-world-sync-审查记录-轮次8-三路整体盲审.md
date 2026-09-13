# your-world-sync 审查记录 · 第八轮（三路整体盲审）

> 审查对象：`<工作目录>\Git源码\your-world-sync\`（起点 v1.3.0，2686 行 / 185,740 字节）
> 本轮方法：**三路互不通气的独立盲审**，全部要求「从零通读，不参考任何提交历史或别人的意见」
> 汇总结论：**三路共报出约 45 条 → 按「会不会丢数据 / 会不会永久卡死」筛选 → 修 13 处，其余全部记档**
> 修复版本：**v1.3.1**（commit `81d1573` / release `v1.3.1`）

---

## 0. 本轮为什么要换方法

前七轮都是「作者先改 → 审改动」，属于**作者视角审自己的东西**。第七轮结束时用户指出：「不是，我是说整体审查，你又开始一步一步做了，就会当局者迷旁观者清」。本轮因此改成三个**不同角色**的独立视角，并行通读全文件，且**不给它们我已知的问题清单**（避免框住视线）。

| 视角 | 角色设定 | 关注点 | 报出 |
|---|---|---|---|
| ① 对抗破坏者 | 专门找「永久失去 / 写坏世界 / 永远卡住 / 假防护」 | 攻击路径、可复现的破坏步骤 | 12 条 + 假防护 10 条 |
| ② 冷读接手者 | 第一次拿到这个模块，要判断能不能放心交给别人用 | 数据安全、状态一致性、结构债 | 8 条 + 顺手 3 条 |
| ③ 文档对现实 | 先只读 README 建立预期，再逐条去代码核对 | 「说得到做不到」 | 32 兑现 / 11 部分兑现 / 3 不兑现 |

**三路独立撞在同一点上**：②说得最直白——「这不是『一个模块』，是『一个模块 + 一份逐年加固的防御工事』」；②还独立复现了「同一类事实存多份副本」这个结构性病（读失败状态 6 个模块级变量、恢复范围 2 套来源、锁的作用域与被保护资源不匹配、账本「读-用」不配对）。

---

## 1. 修掉的 13 处（按「会丢数据 / 永久卡死」标准筛出）

### 致命级（会永久失去东西）

| # | 问题 | 位置（v1.3.0） | 触发条件与后果 | 修法 | 修于 |
|---|---|---|---|---|---|
| 1 | **导入 →「设为主快照」完全没有覆盖前体检** | `openSnapImportDialog` 的 asMaster 分支；体检只存在于存主世界按钮（:2320-2339） | 导入一份空快照（`settings` 允许是空数组）→ 覆盖 8.8MB 基准；之后在任意小世界点一次「存主世界」→ 唯一那份 `.prev` 也被覆盖 → 服务器上再无完整副本，而 UI 还在说「上一份已备份为 X」（`.prev` 全文件只写不读） | 体检抽成 `preflightMasterOverwrite(newCount, label)`，两条覆盖路径共用同一判据 | v1.3.1 |
| 2 | **体检可被缓存为空整段短路** | 存主世界按钮里 `const nMaster = Array.isArray(statusSnapCache?.settings) ? … : null` → `nMaster === null` 时只 `console.warn` 后照常覆盖 | 读缓存失败 / 主快照内容不合法 → 判据不可用 → 反而更容易覆盖成功（与防手滑的目的相反） | 体检自己读服务器上的主快照拿**真实**条目数；读不到即返回 `{ok:false, reason:"readError"}` 拒绝覆盖；体检自身抛错也改为取消本次保存 | v1.3.1 |
| 3 | **二次确认标志是「每页一次」** | `let snapshotForceAck = false;`（:666）置位 :2329、清零 :2335/:2359 | 被警告后关掉面板、换个世界再点 → 判据直接失效，等于从没确认过 | 改成 `masterOverwriteAck` 存「已确认的那一份新内容的**条目数**」，`masterOverwriteAck === newCount` 才放行，换一份内容必须重新确认 | v1.3.1 |
| 4 | **`core.moduleConfiguration` 整体覆盖 → 静默关掉目标世界独有的模组** | `keepSelfEnabled()`（:1362，只保本模块自己）+ `applySnapshot` 的 `updateDocuments` 整串写回 | 快照来自「当时没装模组 M 的世界」→ 恢复进装着 M 的世界 → 配置里没有 M 的键 → **刷新后 M 的脚本不被加载**（= M 被关掉），而界面报告「同步成功」 | 改成**合并写入**：以当前世界打底，只覆盖快照里显式存在的键；`keepSelfEnabled` 增加可选第三参 `currentValue`，差异检测路径不传（保持原行为） | v1.3.1 |
| 5 | **锁按世界隔离，被保护的主快照却是全局单文件** | `acquireLock` 判据 `l.worldId === currentWorldId()`；`MASTER_FILE`/`MASTER_PREV_FILE` 在模块 storage 下所有世界共享 | 两个 DM 各开一个世界同时点「存主世界」→ worldId 不同 → 双方都放行 → 都写同一个文件、都提示成功 → 可造出「主快照=A 的内容、`.prev`=B 的内容」，而 `.prev` 只有一代 | 「存主世界 / 导入设为主快照」标为 `scope:"global"`；判据改为「任一方是全局操作就不看 worldId」 | v1.3.1 |
| 6 | **回档账本在锁外读、锁内用** | `rollbackApplyLog`：`const log = await readApplyLog()` 在 :1570，`withOpLock("rollback")` 在 :1591 | 等锁期间别人完成一次「恢复主世界」→ 本流程仍按**旧账本**覆盖世界（用旧值抹掉更近的值）；随后 `markLogRolledBack()` 还会把**新账本**标成「已回档过」 | 进锁后重读账本并核对 `opId`，不一致即返回 `{stale:true}` 并在 UI 提示「记录已被另一次操作更新，本次回档已取消」 | v1.3.1 |
| 7 | **回档会删掉「后来又被真正配置过」的值** | `rollbackApplyLog` 对 `prev.present === false` 的键无条件 `deleteDocuments`（:1512） | 恢复时创建了键 K（账本记 present:false）→ 用户之后真的把 K 配起来了 → 回档把 K 删掉，**没有任何副本**（`before` 只在内存，账本的 `after[K]` 记的还是当初写进去的值） | 比对账本 `after[key]` 与当前值，不一致即 `continue` 保留不动；新增 `keptDrift` 并在回档报告里单列「这 N 项是你在恢复之后又改过的，已原样保留」 | v1.3.1 |

### 其余 6 处

| # | 问题 | 修法 |
|---|---|---|
| 8 | 锁的到期时间只有读侧信任写侧时钟：`expiresAt` 由写锁方本机算出，时钟快进 / 手工改锁文件 / 还原旧锁都可能塞进极大值 → 所有其他 GM 被**永久拒绝**，而提示还写着「约 2 分钟后自动解锁」 | 读侧加 `min(expiresAt, startedAt + 2×LOCK_TTL_MS)` 上限 |
| 9 | 锁文件读 / 写失败时**静默**跳过互斥（:710-713 / :729-734）→ 两个 GM 可同时恢复、各写各的账本、撤销点互相覆盖，界面无异常 | 两个分支各补 `notify.warn("…本次未做互斥检查，请不要与他人同时操作。")` |
| 10 | 写入失败的提示退化成符号：core 上传失败会返回 `{}` / `undefined` / `false`，原样拼进文案就是「快照写入失败:{}」——而这正对应「磁盘已满 / 目录不可写 / 文件过大」 | `storageWrite` 按返回值类型给出可读原因 |
| 11 | `window.lhWorldSync` 在**模块顶层**求值，而 `game` 只在 `DOMContentLoaded` 回调里创建 → 抛 ReferenceError，这个控制台入口从来不存在 | 挪进 `Hooks.once("ready")` |
| 12 | 面板的模块勾选列表在「读主快照失败」时**静默退化**（`storageRead` 对 5xx 不抛异常，只返回 `{text:null,error}`，所以那个 catch 根本不会执行）→ 列表只剩当前世界已有的模块，用户可能保存残缺的恢复范围 | 解构 `error`，失败时 `notify.warn("…下面的模块列表可能不完整，请勿据此保存恢复范围")` |
| 13 | README 未写「卸载模块会连 storage 一起删」 | README 加一条，并给出出处（`dist/packages/package.mjs` 的 `uninstall` 递归删除；只有 `installer.mjs` 的安装/更新会保留） |

---

## 2. 判为真、但按用户标准**不修**（全部记档）

> 用户明确决策（原话）：「**收手：只修会伤到你的，其余记档**」。以下都**不会丢数据、不会永久卡死**。

| 来源 | 条目 | 影响范围（如实说） |
|---|---|---|
| 接手者 #4 | `.prev` 只写不读、界面没有入口（`MASTER_PREV_FILE` 仅 1 处写、`applyLogPrevFile()` 仅 1 处写，全文件无读点） | **数据还在服务器上**，只是要手工改文件名。README 已写明「只能在服务器上手工改回来」 |
| 接手者 #7 | 读失败 / 账本状态有 6 个模块级变量，其中 `applyLogCorrupt` **永不清零**；`readApplyLogStore()` 是「读」函数却会写 `.bak` | 一次坏账本之后，同页面会话内后续打开回档弹窗仍会展示**过去**的原因（可达性窄：有可用条目时走不到该分支） |
| 接手者 #8 / 文档 #3 | 恢复范围两套来源：面板手动路径读 DOM 勾选，导入与自动提醒读已保存偏好；`buildSelection` 的注释却声称「四条路径共用同一套规则」 | 不丢数据，是**行为与文档不一致**：改了勾选没点「保存范围」时，6 秒后自动提醒弹窗里点恢复用的是旧偏好 |
| 上手三处之一 | `applySnapshot` 的 `precomputed` 后门跳过差异过滤（且暴露在 `window.lhWorldSync`） | GM 本来就有权限，不是提权；属「护栏只在部分路径生效」 |
| 第三路 S6 | 助理 GM / 权限被撤时：账本先写成功、`updateDocuments` 被整体拒 → 账本停在 pending → 之后回档无漂移提示 | 权限失败是**抛错**（已坐实：用户世界日志 `lacks permission to update Setting`），不会谎报成功；只是原因文案会归到「磁盘满 / 目录权限」 |
| 第三路 S9 | 快照 / 账本 / 锁在公网未鉴权可读（`express.static(paths.data)` 在会话中间件之前） | **用户已知情并明确选择「暂不处理，我自己知道就行」**；本轮只在 README 里维持那一条说明 |
| 第三路 S10 | `readScopePref` 对缺失/损坏一律 fail-open（按「全部」恢复，且默认带 `core.moduleConfiguration`） | 恢复范围比预期大，但可再改回来；不算丢数据 |
| 第三路 S11 | 导入他人快照可写任意 world 设置（无「与本世界已注册键对表」） | 用户导入的是自己的文件；能力本身是设计意图 |
| 第三路 S12 残项 / 我自查 | `storageWrite` 无超时（v1.3.0 只给读取加了 30 秒超时） | 官方 `FilePicker.upload` 内部 fetch 不传 signal 且 catch 里 `return {}`，只能 `Promise.race`，超时后无法确认是否落盘 —— 修它会引入「不确定是否已写入」的新语义，风险大于收益 |
| 文档 #2 / #4 | 回档措辞过强（README 说「不会停在半路」，代码自己的失败分支承认「可能停在中间状态」）；「玩家端面板仍可打开查看」不兑现（非 GM 首行 `assertGM` 直接 return） | 纯文档措辞。**已在 v1.3.1 的 README 中把第 13 条之外的部分保留原样**，留待下次一并订正 |
| 对抗路假防护 10 条中其余 | 回档漂移警告不阻断按钮、`findDriftedKeys` 对 pending 返回 `[]`、差异清单无条件打控制台、`notify:false` 压掉 core 的 ErrorTooLarge 提示等 | 均为「提示不准确 / 防护不够硬」，不改变数据结果 |

---

## 3. 三路共同排除的假警报（有源码依据，**不要再查**）

- `Finding.uploadPersistent(MODULE_ID, "", file, {}, {notify:false})` 的落点 = `modules/your-world-sync/storage/`，与 `STORAGE_DIR` 一致；`module.json` 的 `persistentStorage:true` 是硬前提（`client/applications/apps/file-picker.mjs:505-513`）
- `JSON.stringify(value)` 写 Setting 正确、不会双重编码（`common/data/fields.mjs:3002-3010` 的 `JSONField._cast/_validateType`）
- `getSettingDoc(key)` = `getSetting(key, null)` 与 core 语义一致（`client/documents/collections/world-settings.mjs:35-37`）
- 深色主题下 Dialog 底部按钮不会黑字黑底（core 的 `body.game .app.dialog .dialog-buttons button` 无 `!important`，本模块的 `.dialog-button` 带 `!important` 胜出）
- `triggerDownload` 的捕获阶段 `stopPropagation` + `bubbles:false` 确有必要（`client/game.mjs:2018` 冒泡监听 + `:2049-2055` 对任何 `a[href]` 做 `preventDefault` + `window.open`）
- hook 名 `renderSidebar` 成立（`client/applications/api/application.mjs:1226-1233` 按 `render` + `cls.name` 拼名；类名 `Sidebar` 见 `client/applications/sidebar/sidebar.mjs:23`）
- 五套主题的 `--wsync-*` 变量无缺项；无 `setInterval` 常驻心跳；无未调用函数
- `SETTINGS_MODIFY` 的默认角色包含 ASSISTANT（`public/scripts/foundry.mjs:4013-4017`）→ 助理 GM 不会因权限被整批拒绝（这也修正了第三路 S6 的严重度）

---

## 4. 本轮**坐实**的新事实（可指认，供以后直接用）

| 事实 | 出处 |
|---|---|
| **`moduleConfiguration` 缺键 = 该模组不加载** | `dist/server/views/view.mjs` 的 `_getStaticContent` 只注入 `moduleConfig[id] === true` 的模组；`dist/packages/world.mjs` 发世界数据时 `e.active = l[e.id] ?? false` |
| **`globalThis.game` 只在 `DOMContentLoaded` 回调里创建** | `public/scripts/foundry.mjs:181079-181097` |
| **模组脚本是 `<script type="module">`（defer 语义，早于 DOMContentLoaded）** | `templates/views/layouts/main.hbs:28` |
| **卸载模块会递归删除模块目录，`persistentStorage` 无例外** | `dist/packages/package.mjs` 的 `uninstall` → `fs.rm(dir, {recursive:true, force:true})`；仅 `dist/packages/installer.mjs` 的 install/update 保留 storage |
| **Setting 权限失败形态 = 抛错**（不是静默过滤） | `common/documents/setting.mjs:81-93` 的 `#canModify` + 用户世界日志实据 `lacks permission to update Setting` |
| 助理 GM 白名单只有 9 个 `core.*` 键；`core.permissions` 仅全权 GM | `common/documents/setting.mjs:57 / 65-66` |

---

## 5. 三路自报「未验证」的部分（本轮也没能验证）

1. `world.onUpdateModuleConfiguration()` 是否会给缺失键补默认值（**若补，则第 4 条严重度下调**）—— 建议实测：A 世界停用某模组 → 存主世界 → 恢复到装着它的 B 世界 → 刷新看它是否还在
2. Foundry 卸载模块的 UI 是否有「会删除文件」的明确警告（`resources/app` 下没有 `lang/en.json`）
3. 客户端数据库后端在 socket 断开时是抛错还是永不 settle（决定「断网时按钮无反应」的确切表现）
4. socket 层 `manageFiles` 是否真的没有 remove / rename 动作（若有，`.prev` 多代轮转的前提需要重估）
5. 服务器 `/upload` 是否有体积上限（只确认 core 存在 `ErrorTooLarge` 分支）
6. **以上全部是静态审查 + 对 Foundry 源码比对，本轮没有任何运行时验证**

---

## 6. 本轮我自己的失误（照实记）

1. **改 `keepSelfEnabled` 的调用签名后，`afterMap` 是否同步** —— 差点重演 v1.2.3 那个「账本记的是想要写的值、不是实际写入的值」的老坑；这次在改的时候一并处理了（`afterMap.set(c.key, keepSelfEnabled(c.key, c.to, currentMap.get(c.key)?.value))`），并写进了测试断言。
2. **测试断言写错了两处，被测试反抓出来**：① 正则里 `\\.` 在 JS 正则字面量中匹配的是「字面反斜杠 + 任意字符」，导致版本断言永远不通过；② 测「服务器上还没有主快照」时忘了 `files` 是全局共享 Map，前一条用例留下的主快照还在，于是拿到了 `oldCount=100`。
3. **`edit` 工具再次拦下一次误改**：`const log = await readApplyLog();` 在文件里匹配到 2 处（回档路径与回档弹窗路径），若按第一个命中替换会改错函数 —— 这正是 v1.2.9 那次「批量替换锤点不唯一、误删 600 行」的同类风险，这次被工具的唯一性校验挡住。
4. **本轮改动量 13 处，超过我自己定的「单轮 ≤10 处」**：原因是用户明确要求「一次性改好，别再分批」，且筛出的都是同一类（丢数据）。代价是风险叠加，靠 24 条新增断言（含 8 条真跑代码的行为断言）兜底。

---

## 7. 汇总统计（截至本轮）

| 项 | 数值 |
|---|---|
| 审查轮次 | 8 |
| 累计报出 | 约 134 条 |
| 核实为真 | 约 76 条（致命 3 / 严重 17） |
| 已修 | 约 63 条 |
| 判为真但不修（记档） | 约 13 条 |
| 其中「我自己修出来的问题」 | 9 次 |
| 回归测试 | 八套脚本 **578 项断言全绿** |
| 当前版本 | **v1.3.1**（`81d1573` / release `v1.3.1`） |

---

## 8. 本轮沉淀的做法（下次直接照做）

1. **换视角审，比换工具审有效**：三个「角色」（破坏者 / 接手者 / 文档对现实）比再读一遍代码多找出至少 5 条致命路径。
2. **审阅期必须冻结代码**：接手者第一句话就是「审阅对象是移动靶」——它读的过程中我在改（185740→197922 字节），导致它的行号全部漂移，复核成本上升。
3. **报出的条目必须分两类落地**：「会不会丢数据 / 会不会永久卡死」修，「提示不准确 / 防护不够硬」记档 —— 否则会陷入「越修越多、越修越怕」的循环。
4. **写操作的三条铁律**（本项目反复验证）：覆盖前必须能反悔 → 反悔失败必须如实说 → 「读失败」绝不是「不存在」。
5. **同一件事有几条路径，就要点几次名**：体检只有一条路径有、`storageRead` 只有一个调用点丢了 `error`、锁只在一个方向判了 worldId —— 每一处「漏了一条路径」都是这样来的。
