# your-world-sync 审查记录 · v1.3.2（**本轮由用户实测发现，不是盲审提出**）

> 存放约定：本文件属技术资料，**不进模块 Git 仓库**（用户明确要求技术资料不上传 GitHub）。
> 记录规则：只记能指到代码行的真问题；每条含「位置 / 触发条件 / 现象 / 修法 / 验证」；修完更新状态，不删旧记录。

---

## 0. 本轮性质：用户在真实使用中，比任何一轮盲审都更快地找到了问题

前八轮审查（作者自查 + 8 次独立盲审 subagent）都没发现这个问题。用户只做了一件事就把它顶出来了：

> **「不是，ActiveAuras · 9、aeris-tokens · 17 我都看了，都没有啊？但是这是我之前的mod，应该都卸载了，为什么会出现了呢？」**
> 后又追问：「**那他为什么会抓我之前老早就删除卸载后的mod呢？甚至他都没见过，还写未安装这个mod**」

**原因分析**：八轮盲审的输入都是**代码**和**文档**；这个问题在代码里完全「自洽」—— 判据、文案、流程没有一处矛盾，所以读代码读不出来。它只在与**真实世界数据**对撞时才暴露。**这是本轮最有价值的沉淀：盲审能抓逻辑矛盾，抓不到「语义与用户现实不符」。**

---

## 1. 查证（三层，全部可指认）

### 第一层：Foundry 到底删不删模块留下的设置？

用 node 从本机安装目录提取 `<FVTT安装目录>\resources\app\dist\packages\package.mjs` 中 `Package.uninstall(id)` 的完整函数体：

```js
static async uninstall(e){
  if(!e) throw new Error("Unable to delete package with no id provided");
  const t = path.join(this.baseDir, e);
  if(!Files.isPathContained(t, this.baseDir) || !fs.existsSync(t)) throw new Error(`The package ${e} does not exist to uninstall!`);
  await fs.promises.rm(t, {force:!0, recursive:!0}),   // ① 只删模块目录
  this.packages && this.packages.delete(e),            // ② 从内存包列表移除
  globalThis.logger.info(`Uninstalled ${this.type} ${e}`),
  globalThis.packages.warnings.delete(e);
  for(const e of Object.values(PACKAGE_TYPE_MAPPING)) e.reevaluateAvailabilities();  // ③ 重评可用性
  return this.get(e)?.toObject() ?? {id:e}
}
```

同文件关键词统计：`deleteDocuments` **0 处**、`Setting.delete` **0 处**、`"settings"` **0 处**、`game.settings` **0 处**。

→ **结论：卸载模块只删 `Data/modules/<id>` 文件夹，完全不碰世界设置。** 这不是漏做，是设计如此（设置属于世界，不属于模块）。

### 第二层：用户世界里的真实残留量（用户跑的命令）

| 指标 | 实测值 |
|---|---|
| 全部 world 集合文档 | 2693 |
| 其中玩家个人设置（`doc.user` 非空） | 223 |
| 非 user 文档 | 2470 |
| **按本模块判据应进快照** | **2467** |
| 命名空间数 | **129** |
| 用户的自定义排除键 | 未自定义（= 默认三项） |
| 已卸载但设置仍在的键（另一脚本） | **141 项** |

### 第三层：代码判据（`scripts/world-sync.js`）

```js
function nsIsUnavailable(ns) {
  const n = String(ns ?? "");
  if (!n) return false;
  if (n === "core") return false;                  // 核心设置永远可写
  if (n === MODULE_ID) return true;                // 本模块自指键
  if (n === game.system?.id) return false;         // 当前系统的设置
  return !game.modules?.get(n);                    // 未安装的模组   ← 这里把 world 也吞了
}
```

面板列的不是模块清单，而是**世界设置里出现过的命名空间**；流程是「先把世界设置整份抄一遍 → 抄完才逐个 ns 问 `game.modules` 还有没有这个模块」。所以「没有安装」是**事后贴的标签**，不是它以为你装过。

---

## 2. 修复（v1.3.2，共 9 处代码改动）

| # | 位置 | 问题 | 修法 |
|---|---|---|---|
| 1 | `scripts/world-sync.js` 的 `nsIsUnavailable()`，`if (n === "core") return false;` 之后 | **真误判**：`world` 是「世界自己的命名空间」（世界脚本 / 世界宏 / 小游戏用 `game.settings.register` 不写模块 id，键就落在 `world.*` 下；用户世界上有 10 项：`breakout-leaderboard-v2` / `origNamesMap` / `tavern-race-lineup` 等），却被判成「一个名叫 world 的模组没装」，面板上因此出现一个**世上不存在的模块名** | 加分支 `if (n === "world") return false;` —— 与 `core`、当前系统同列白名单（它永远可写） |
| 2 | `describeUnavailable()` | 文案只说「本世界没有安装对应的模组」，没说为什么会有 | 改为：「另有 N 项设置没有恢复：它们属于本世界没有安装的模组（a、b 等）—— 多数是你以前装过、后来卸载的模组。**卸载只删程序不删设置**，那些设置一直留在世界里。哪天把模组装回来，再恢复即可。」 |
| 3 | `nsCheckboxListHTML()` 面板行 | `cnt` = 「本机未安装 · 不会恢复」 | 改为「**本机没有 · 不会恢复**」 |
| 4 | 同上，行的 label | 「（本机未安装这个模组 · 本次不会恢复）」 | 改为「（**本机没有这个模组** · 本次不会恢复）」 |
| 5 | 同上，行的 `title` | 没有解释 | 改为「本机没有安装这个模组（很可能是以前卸载后留下的设置）。它的设置不会被创建 —— 避免在本世界留下一堆没有任何代码会去读的悬空键。重装该模组后即可恢复。」 |
| 6 | `describeSnapshotCompat()`（原 L1041） | 「快照里有 N 个模组**当前服务器未安装**（…）」 | 改为「快照里另有 N 个模组**本机没有安装**（多为以前卸载后残留的设置）：（…）」 |
| 7 | `applySnapshot` 的 console.warn（原 L1583） | 「本机未安装对应模组 ——」 | 改为「本机没有安装对应模组（多为以前卸载后残留的设置）——」 |
| 8 | 恢复报告的 `skippedNote`（原 L2066） | 「本世界没有安装对应的模组」 | 补「（多为以前卸载后残留的设置）」 |
| 9 | 状态栏（原 L2718） | 我上一版改动留下的**双括号** `（多为以前卸载后残留的设置）（a、b 等）` | 改为 `（多为以前卸载后残留的设置：a、b 等）` |

**验证**：`node --check` exit 0；八套测试脚本 **587 项断言全绿**（v120 73 / v121 82 / v123 15 / v124 32 / v126 47 / v127 72 / v128 106 / v130 160，含本版新增 9 项）；版本五处同步（`module.json` / JS 头注释 / `MODULE_VERSION` / CSS 头 / README appVersion 两处）。
**测试断言更新 9 条**（全部为预期变更，逐条核对过是旧文案被我改了，不是功能坏了）：`notes.some(n => n.includes("未安装"))` → `"没有安装"`；`describeUnavailable(...).includes("没有安装对应的模组")` → `"本世界没有安装的模组"`；`r.rows.includes("本机未安装这个模组")` → `"本机没有这个模组"`（各 4 份脚本副本）。

---

## 3. ⚠️ 未解疑点（**必须记住，未查清**）

| 项 | 数值 |
|---|---|
| 服务器主快照 `/modules/your-world-sync/storage/world-snapshot-master.json` | **1322 项** / 129 命名空间 / 9,268,088 字节 |
| 快照元信息 | `appVersion: "1.3.1"`，`sourceWorld: "初始世界（数据）"`，`savedAt: 2026-09-10T08:49:18.062Z` |
| 同一世界当前按模块判据**应进快照** | **2467 项** / 129 命名空间 |
| 差额 | **1145 项**，但**命名空间数完全一致（129 = 129）** |

**目前无法解释。既不能断定是抄漏，也不能断定旧快照是历史遗留。** 已核实：两边对 `doc.user` 的判定一致（模块 `if (doc.user) continue;` vs 用户脚本 `!d.user`），排除键也都是默认三项，所以差异**不在过滤条件上**。

**验证方法（已嵌进正常流程，不需要额外操作）**：装 1.3.2 之后点一次「存主世界」，看通知里的条目数 ——
- 若是 **2400 上下** → 之前的 1322 属历史遗留（旧快照是另一时期存的），一切正常；
- 若仍是 **1300 上下** → 真的抄漏了 1145 项，需要另开一轮查（届时抓 `collectWorldSettings()` 的实际返回）。

另需注意：该世界历史上曾出现过 **1435 项**的快照记录（v1.2.6 部署验证时实测），**比现在的 1322 还多 113 项**，且两次 `savedAt` 不同 → 快照确实被重存过，项数在变。

---

## 4. 本版交付

- 提交 `1c27e57`「v1.3.2：把「本机没装这个模组」说准，world 不再被误判成模组」（4 files, +48/−18）→ push main → tag v1.3.2 → Release **https://github.com/Ryuka16/your-world-sync/releases/tag/v1.3.2**（Latest，非草稿非预发布，2026-09-10T09:05:51Z）
- 包：`<跑团工具>\Foundry模块\your-world-sync.zip` = **95178 字节 / 5 条目**（module.json 979 / README.md 42834 / LICENSE 1059 / `scripts\world-sync.js` 206287 / `styles\world-sync.css` 13129）；旧包备份 `your-world-sync.zip.v131.bak`（93622）
- 线上核验：manifest HTTP 200 `version=1.3.2` `systems=0`；download HTTP 200 Content-Length 95178（与本地一致）

---

## 5. 沉淀（写进方法论）

1. **盲审抓逻辑矛盾，抓不到「语义与用户现实不符」**。八轮盲审输入都是代码与文档，这个问题在代码里完全自洽。**用户拿真实世界数据一撞就出来了** —— 所以「让用户跑一条只读诊断脚本」的性价比，可能高于再起一轮盲审。
2. **「读失败 ≠ 不存在」之外，还有第二种伪装：把「类别判断」当成「事实陈述」**。代码问的是「`game.modules` 里有没有这个 id」，输出给用户的却是「你没有安装这个 mod」—— 前者是判据，后者是断言。**凡是把机器判据翻译成人话的地方，都要连判据本身一起交代**（这里是「卸载只删程序不删设置」）。
3. **命名空间不都是模块**。`core` / 当前系统 id / **`world`** 三者都不是模块，但它们都能在世界设置里出现。凡是「用 id 去 `game.modules` 查是否存在」的判据，都要先把这三者摘出来。
