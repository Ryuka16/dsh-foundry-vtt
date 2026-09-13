# your-world-sync 审查记录 · v1.3.3（外部审阅四条）

> 本轮性质：**外部审阅**（用户提供的大佬复审报告，非本机盲审 subagent）。
> 审阅对象：`Ryuka16/your-world-sync` v1.3.1，Commit `81d1573133d71443326bc5abea1ff4e141af6cdb`。
> 报告文件：`c:\users\user\downloads\your-world-sync-v1.3.1-four-critical-issues.md`（11.9 KB / 695 行）。
> 我的处置：**逐条到代码里核实，不照抄** —— 四条全部属实，一次修完，出 v1.3.3。

---

## 0. 一句话结论

四条不是代码风格问题，全部指向同一句话：**同一件事存在多套语义**。
这是本项目最稳定的失效模式（八轮审查共报出约 134 条，其中「同一类事实存多份副本 / 同一规则多处实现」占比最高）。

---

## 1. 逐条核实与修复

| # | 报告结论 | 我的核实证据（v1.3.2 时行号） | 判定 | 修法（v1.3.3） |
|---|---|---|---|---|
| 1 | 空 custom 退化成 all | `world-sync.js:1911` `if (pref.mode === "all" \|\| !picked.length)`；而 `saveScopePref:1926` 只拒绝「picked===0 **且** !includeModuleConfig」→「取消全部模块 + 只留模组启用状态」合法（picked 同为 0），却落到那一行变全部。我 L1909 注释「正常操作不会再生成这种偏好」是**错的** | ✅ 属实 | 删兜底：`if (pref.mode === "all")`。范围只由 mode 决定，「允不允许空」只由 saveScopePref 决定 |
| 2 | moduleConfiguration 差异检测 ≠ 实际写入 | `diffSnapshot:1101-1102` `const to = keepSelfEnabled(key, item.value);` —— **没传第三参** → 不合并；写入路径传了 → 合并。当前世界有快照里没有的模组时：恢复 → 刷新 → 报同样差异 → 再恢复，永不收敛 | ✅ 属实 | `const curVal = current.has(key) ? current.get(key) : undefined; const to = keepSelfEnabled(key, item.value, curVal);` —— 差异 / 写入 / 账本 after 三处共用同一规则。**未新增 `effectiveTargetValue()`**，复用已有的 `keepSelfEnabled(key, val, currentValue)`（`world-sync.js:1389`） |
| 3 | 单锁文件表达不了多世界并行锁 | `LOCK_FILE = "operation-lock.json"` 固定单文件 + `scope: isGlobalOp ? "global" : "world"`。B 世界开始恢复覆盖 A 的锁，B 先释放后 A 的第二位 GM 读到「无锁」→ A1/A2 并发写同一世界 | ✅ 属实 | **全局串行**（用户拍板）：判定改为 `if (effExpires > now && !(sameOwner && samePage))` —— 不再看 `worldId`、不再看 `scope`。`scope` 字段保留仅作日志辨认。提示文案补上对方世界名 |
| 4 | `.prev` 备份失败仍覆盖唯一撤销点 | `writeApplyLog:1289-1296` catch 里只有 `console.warn` + `notify.warn`，然后照样 `store.worlds[wid] = newLog`（fail-open） | ✅ 属实 | **fail closed**：catch 里 `throw err`（带 `err.__backupFailed = true`）→ 走 `__notStarted` 路径 → 世界一个设置都不改。`proceedApplySnap` 的 notify.err 加 `__backupFailed` 分支（用错误自带的完整说明，不套用账本那条） |

**我 v1.2.8 原本的设计理由已被推翻**：当时我认为「锁+闸已经失误在前，宁可继续也别说假话」。
报告的论证更强 —— 账本是**唯一**的撤销点，覆盖即永失（服务器上无备份、Foundry 无删除/恢复文件 API）；
fail closed 的代价只是「这次没做成」，用户重试即可。**这个取舍我原来做反了。**

---

## 2. 用户决策

`ask_user_question` 问：第 3 条会改行为（现在承诺「世界级隔离」但实际做不到），怎么改？
三个选项：全部操作全局串行（报告推荐）／改成多世界锁表保留并行／保持现状只记档。

**用户选：全部操作全局串行。**

代价已告知并被接受：某个世界异常退出留下的锁，会让**其他世界**也等到 TTL 到期（约 2 分钟）才能操作 —— 比以前「只挡同世界」体验差一点，换来的是「行为可推理」。

---

## 3. 验证

- `node --check scripts/world-sync.js` → exit 0
- **八套测试脚本 608 项断言全绿**：v120 73 / v121 82 / v123 15 / v124 32 / v126 47 / v127 72 / v128 106 / v130 181
- v130 新增 v1.3.3 专项块（四组行为断言，非文本断言）：
  - ① `buildSelection(snap, {mode:"custom", ns:{}, includeModuleConfig:true})` → `sel.ns` 为空、`includeModuleConfig===true`；对照 `mode:"all"` 取全 3 个 ns
  - ② 当前 `{midi-qol:true, target-only-module:true, your-world-sync:true}` vs 快照 `{midi-qol:true}` → 不含 core.moduleConfiguration、整体 changed 为空；对照 `{midi-qol:true, extra:false}` → 报 1 条且 `to.extra===false && to["your-world-sync"]===true`、`from.extra===true`
  - ③ A 世界 `acquireLock("apply")` 拿锁 → **B 世界（不同 worldId / 不同会话）也被拒**；A 释放后 B 可拿锁；源码无 `crossWorldConflict`
  - ④ 让 `.prev` 写入失败 → `applySnapshot` 抛错且 `__backupFailed===true`、`world-sync.js` 里世界设置值未变、旧账本 `opId` 仍为 `OLD-OP`、旧撤销点仍可读到
- 版本五处同步 1.3.3：`module.json:5` / JS 头注释 / `MODULE_VERSION` / `styles/world-sync.css:2` / README appVersion 两处
- 包：`01_跑团工具\Foundry模块\your-world-sync.zip` = **97746 字节 / 5 条目**（module.json 979 / README.md 44906 / LICENSE 1059 / scripts\world-sync.js 210814 / styles\world-sync.css 13129）；旧包备份 `your-world-sync.zip.v132.bak`（95178）
- 发布：commit **24400c4**（4 files, +80/−26）→ push main → tag v1.3.3 → https://github.com/Ryuka16/your-world-sync/releases/tag/v1.3.3
- 线上核验：manifest HTTP 200 version=1.3.3 / systems 数 0；download HTTP 200 / 97746 字节

---

## 4. 测试适配（不是代码 bug，逐条判定）

| 测试 | FAIL 内容 | 判定 |
|---|---|---|
| `wsync-v120-test.js:194` | `buildSelection(custom 空勾选)：兜底为全部` | **预期变更** —— 正是本轮删掉的行为，断言改写为「不再兜底」 |
| `wsync-v124-test.js` 用例⑧（4 条） | 提示拿到「已有进行中的『恢复主世界』操作（GM1 · 世界A 于 … 开始）」 | **全局串行的副作用 + 测试隔离缺陷**：`files` Map 跨 ctx 共享，更早用例残留的锁把本用例挡在门外。修法：用例前显式 `files.delete("operation-lock.json")` |
| `wsync-v130-test.js:763` | `v1.3.1 锁分作用域（写主快照=全局锁）` | **预期变更** —— 分作用域已被全局串行取代，断言改为验证「已无 crossWorldConflict」 |

> 这三条 FAIL 恰好是「全局串行确实生效了」的反向证据 —— 以前世界级锁不会互相挡，所以测试从未暴露这个问题。

---

## 5. 本轮沉淀

1. **外部审阅的价值不在「找出更多条」，而在「指出模型层面的病」**。这份报告的每条都不是「某行写错了」，而是「同一件事在 A 处和 B 处语义不同」—— 这类问题靠跑测试抓不到（测试只验单个路径），靠作者自审也抓不到（作者写的时候脑子里只有一个场景）。
2. **「我以为不能失败，所以失败时继续」是错的**。第 4 条我当初刻意选了 fail-open，理由是「不要因为一个辅助动作失败就阻断主操作」；正确的判断标准是**这次失败会让用户失去什么**：失去的是唯一撤销点 → 必须 fail closed。
3. **承诺的能力要配得上数据模型**。第 3 条的根因是想用「一个标量锁对象」表达「全局锁 + 多把世界锁」，这在信息量上就不成立。要么改数据模型（多世界锁表），要么改承诺（全局串行）—— 报告推荐后者，因为操作本身是低频的。
4. **同一规则有几处实现，就要有几处一起改**（本项目第 N 次重复这条）。
5. **测试之间共享全局状态（`files` Map）会掩盖真实互斥行为** —— 本次是「残留锁挡住后续用例」暴露出来的；反过来想，如果残留的是「本该被挡却放行」，测试永远不会发现。

---

## 6. 汇总统计（截至 v1.3.3）

| 轮次 | 审阅者 | 报出 | 核实为真 | 其中致命 | 其中严重 |
|---|---|---|---|---|---|
| 1 | 独立盲审 subagent（审 v1.2.0 全文） | 19 | 8 | 1 | 3 |
| 2 | 独立盲审（专审 v1.2.1/v1.2.2 改动） | 17 | 10 | 0 | 4 |
| 3 | 独立盲审（专审 v1.2.3/v1.2.4 改动） | 17 | 11 | 1 | 4 |
| 4 | 独立盲审（审 v1.2.5 的 6 组改动） | 19 | 14 | 0 | 2 |
| 5 | 独立盲审（审 v1.2.6 改动 + CSS/README 全文） | 17 | 7 | 0 | 1 |
| 6 | 三路整体盲审（接手者 / 文档对现实 / 对抗破坏者） | 约 30 | 约 20 | 2 | 5 |
| 7 | 三路整体盲审第二轮 | 约 15 | 约 10 | 0 | 3 |
| 8 | 外部审阅（用户提供的大佬报告） | **4** | **4** | 0 | **4** |
| — | 我自己在修的过程中引入的问题 | — | 约 9 次 | — | — |

**八轮累计报出约 138 条，核实为真约 84 条。**

「自称修好、实际只改了一半」已出现 8 次以上 —— 这是本项目第二稳定的失效模式，对策是：**同一件事有 N 条路径时，改完必须逐条点名核对**。
