# your-world-sync 审查记录 · 批次 2（v1.2.9）

> 承接《your-world-sync-审查记录-轮次6-整体盲审.md》。
> 轮次 6 的整体盲审把病根定在一句话上：**同一类事实存了多份副本** ——
> 「上次读取成功没有」有 5 个模块级变量、「操作互斥」有 3 套实现、「哪些键该写」有 4 套判据、
> 「失败后怎么还原」有 2 处近乎逐字重复。v1.2.8 先修了「会永久失去东西」的那几条，
> 本批次（v1.2.9）拆掉其中的两类：**读错误的多副本** 与 **互斥的三套实现**。
> 本轮**不改对外行为**，只改结构。

---

## 1. 本批次拆掉的两类多副本

| 事实 | 改前副本数 | 位置（v1.2.8 行号） | 改法 |
|---|---|---|---|
| 「上次读成功了没有」 | 5 个模块级变量 | `storageLastError`(:549) / `applyLogReadError`(:506) / `legacyLogReadError`(:511) / `applyLogCorrupt`(:515) / `statusSnapCache`(:2019) | `storageRead` 改为返回 `{ text, error }`；10 个调用点全部解构；删掉 `storageLastError` |
| 「操作互斥」 | 3 套实现 | `withOpLock`(:713) / `applySnapshot`（:1257 `beginOp` + :1261 `acquireLock` + :1382 `finally`）/ `rollbackApplyLog`（:1419 `acquireLock` + :1497 `finally`） | 统一为**唯一入口** `withOpLock`；新增 `OP_LABELS` 中文名映射与 `label` 参数 |

`storageRead` 的新形状（关键：**只有 404 才是「确实不存在」**）：

```js
async function storageRead(name) {
  const url = foundry.utils.getRoute(norm(STORAGE_DIR) + "/" + name);
  let r;
  try { r = await fetch(url, { cache: "no-store" }); }
  catch (e) { return { text: null, error: "无法连接服务器（" + (e?.message || e) + "）" }; }
  if (r.status === 404) return { text: null, error: null };
  if (!r.ok) return { text: null, error: "服务器返回 HTTP " + r.status + "（" + name + "）" };
  try { return { text: await r.text(), error: null }; }
  catch (e) { return { text: null, error: "读取响应内容失败（" + (e?.message || e) + "）" }; }
}
```

顺带清掉三处「统一后几乎必然漏改」的隐患：

- `doRollback` 与控制台入口 `window.lhWorldSync.rollback` 各自 `beginOp`/`endOp` —— **统一后若不删，会变成自己把自己挡住**（第二次 `beginOp` 必被拒，回档永远返回 `busy`，用户看到「已有操作在进行」）。
- `applySnapshot` / `rollbackApplyLog` 返回值形状不同 → 统一后补形状（`{ applied, skipped, busy, locked, staleSelf }`），否则上层 `res.applied.length` 会变 TypeError。
- `applySnapshot` 的 `const SettingDoc = settingDocumentClass();` 原来在函数顶部，搬进锁内时差点漏掉（见事故 2）。

---

## 2. 本批次施工事故（必读）

### 事故 1：批量替换锚点不唯一，误删约 27KB / 600 行

- **现象**：一个 pwsh 脚本连做 8 处「起点锚点 → 终点锚点」区间替换，脚本自报 8 处全部成功；
  随后 `node --check` 报
  `SyntaxError: Missing catch or finally after try`（`world-sync.js:740` → `}, "恢复主世界");`），
  文件从 171937 字节掉到 133809 字节。
- **根因**：其中第 4 步的起点锚点写的是 `  } finally {`，而这个串在文件里**出现多次**；
  `IndexOf` 取到的是**第一个**（`withOpLock` 自己的 finally，在文件前部），终点却是
  `// 回档：按 applyLog 恢复`（在文件后部）→ 于是从 withOpLock 尾部一路删到回档函数之前，
  把 `backupMasterSnapshot` / `collectWorldSettings` / `buildSnapshot` / `parseSnapshot` /
  `diffSnapshot` / `writeApplyLog` / `applySnapshot` 整段带走。
- **为什么没当场发现**：把 8 处替换当成「一次操作」，全做完才检查一次；脚本只打印了字节数变化。
- **恢复**：损坏版另存 `%TEMP%\wsync-broken-batch2-20260910.js` → `git checkout -- scripts/world-sync.js`
  （HEAD = `426776a` v1.2.8，内容完整）→ 重做。
- **损失**：约 15 分钟重复劳动；**未损失任何已交付物**（v1.2.8 已在 GitHub，本地 zip 另有备份）。
- **重做时有效的改法**：改用 `edit` 工具逐处替换 —— 它**强制 `old_string` 在文件中唯一**，不唯一直接拒绝。
  本次它真的拒绝了两次（`const text = await storageRead(MASTER_FILE);` 匹配 2 次、
  `"appVersion": "1.2.8",` 匹配 2 次），把「锚点不唯一」挡在写入之前。
- **沉淀铁律**：
  1. 批量文本替换前**先数锚点出现次数**：
     `([regex]::Matches($s, [regex]::Escape($a))).Count`，不为 1 就必须带上下文或改用唯一性工具。
  2. **绝不把「多步替换 + 最后统一检查」当成一次操作**；每步之后立即 `node --check`。
  3. 改代码优先用会强制唯一性的编辑工具，脚本替换只用于短且唯一的 ASCII 串。

### 事故 2：把函数体搬进闭包时，漏搬了函数顶部的一行声明

- **现象**：把 `rollbackApplyLog` 的函数体包进 `withOpLock(...)` 时，
  `const SettingDoc = settingDocumentClass();` 随被替换掉的那段一起消失，
  而函数后段（:1425-1427 的 `SettingDoc.deleteDocuments` 等）仍在用它。
- **如何暴露的**：**不是人眼**，是测试 —— 七套里三套直接崩
  （`wsync-v120-test.js:273` / `wsync-v121-test.js:229` / `wsync-v123-test.js:234`，
  抛出时带 `__rollbackFailed: true`），另三套的回档用例 FAIL。
- **修法**：把该行移进 `withOpLock` 回调开头，并加注释说明它原来是函数顶部的。
- **沉淀**：搬「函数顶部声明」进闭包时，要专门核对**闭包之后**是否还在用这些变量；
  `node --check` 只证明语法通，**证明不了作用域对** —— 这一条只有测试能抓。

---

## 3. 验证（全部本地实测）

- `node --check` exit 0；`module.json` 解析通过（version 1.2.9 / `relationships.systems` 长度 0）
- **七套测试脚本 427 项断言全绿**：
  v120 73 / v121 82 / v123 15 / v124 32 / v126 47 / v127 72 / v128 106
- 因返回值形状与文案变化，**5 条断言按预期更新**（逐条判定，不是「删掉碍事的断言」）：
  1. `%TEMP%\wsync-v121-test.js` L370/L378：`storageRead` 返回值由 `text` 改为 `{ text, error }`
  2. `%TEMP%\wsync-v121-test.js` L246/L305：提示文案带上操作名（「已有进行中的『存主快照』操作」/「已有进行中的『恢复主世界』操作」）
  3. `%TEMP%\wsync-v121-test.js` L337 与 `%TEMP%\wsync-v128-test.js` L626/L627：版本断言 1.2.8 → 1.2.9（含正则转义写法 `1\.2\.8` 那一处）
  4. `%TEMP%\wsync-v124-test.js` L382-385：读 body 失败用例改为断言 `rBody.text === null && rBody.error`
  5. `%TEMP%\wsync-v126/127/128-test.js` L410-411：G5「先放锁再放闸」的文本断言迁移到 `withOpLock` 内部（原锚点已随代码搬走）
- 五处版本同步：`module.json:5` / JS 头注释 / `MODULE_VERSION` / `styles/world-sync.css:2` / `README.md` 的 appVersion ×2
- 结构自检：`withOpLock` 定义 1 处、调用 4 处；`beginOp`/`endOp` 各 2 处（1 定义 + 1 调用）；
  `acquireLock`/`releaseLock` 各 1 处（都在 `withOpLock` 内）；`storageLastError` 真实赋值 **0 处**
- 包：`01_跑团工具\Foundry模块\your-world-sync.zip` = 80703 字节 / 5 条目
  （module.json 979 / README.md 34912 / LICENSE 1059 / scripts\world-sync.js 176178 / styles\world-sync.css 13129）；
  旧包备份为 `your-world-sync.zip.v128.bak`（78850）

---

## 4. 本批次**没**验证到的（需真机）

- `withOpLock` 的 `label` 参数在真实提示里的显示（桩里只验了文案字符串本身）
- 双 GM / 双标签页并发下的锁行为时序
- `storageRead` 返回结构变化后，HTTP 层真实的 404 / 5xx / 断网三种表现
- 面板状态栏在「读失败」时新文案的实际观感

---

## 5. 仍在观察（判断=本次不改）

- `applySnapshot` 对外暴露的 `precomputed` 参数不校验类型（有 `assertGM` 兜底）
- `getSettingDoc` 只认 `user === null`
- 快照含本模块自指键时整份拒收（有意为之）

---

## 6. 剩余批次（未开工）

- **批次 3（v1.2.10）**：B1 真正导出差异清单 / B2 导出快照口径 / B6 导入后 `refreshStatus` / B9·B10 README 修正 / B11 存主世界后重建勾选列表 / C1 `copyText` 加 await+catch / C2 所有网络与 socket 调用加超时 + 闸自愈 / C3 reload 与操作互锁
- **批次 4（v1.2.11）**：D1 回滚只删本次 create 返回的 `_id` / D2 白名单命名空间（拒收任意 `core.*`）/ D3 `world.id` 缺失时拒绝写账本 / E1 diff 缓存 / E2 `out.includes` 改 Set / E3 导入加 `f.size` 上限
- **批次 5（v1.2.12）**：卫生项（`setTheme` 全局选择器、文案统一、变更日志瘦身、玩家端 `autoPrompt` 不可见、`window.lhWorldSync` 玩家端限制、面板一点即关致状态栏看不到等）
