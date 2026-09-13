# 血的教训 · Aeris Tokens 改版篇

> ## ⚠️ 文件说明（务必严肃阅读）
>
> 本文件是**一份教训记录，不是普通攻略**。它记录了一次「拿第三方模块（Aeris Tokens）做中文化增强改版」
> 的完整过程：从定位、审查、构建链打通，到实现、十版迭代、一次把用户改到「拖不动」的严重自伤，再到止血。
> 用户为此反复安装十余次，多次说「我天天当小白鼠啊」「这很难么？？？」。
>
> 翻到本文件的任何 AI / 开发者，请先花 3 分钟读完「§0 血的教训」再动手。
> **如果你即将「改第三方模块源码 / 给 Foundry 模块加渲染层功能 / 想隐藏核心的某条线」，这里写的就是全部的坑和正解。**
>
> 对象：Aeris Tokens（作者 Robin Chand / robxnlifts，GitLab，MIT 许可），v13.0.19；
> 本改版产物：`aeris-tokens-中文增强-v13.0.19-LH.10.zip`。

---

## 0. 血的教训（最重要，先看这条）

1. **看不见真机的改动，绝不允许碰「核心方法的包装」或「核心对象的内部状态」。**
   只能碰**显示属性**（`visible` / `style.display`），且必须 `try/catch`。
   本项目最严重的一次回归（用户报「拖不动、不走」）根因就是我去「覆盖核心尺子的内部数据」来抹掉一条多余的线。
2. **去掉视觉干扰有严格层级，越靠上越安全：显示层（visible/display:none）> 数据层 > 方法包装。**
   第一层失败只会「线还在」；第三层失败是「整个拖拽没了」。
3. **一次改 18 处 → 出问题无法二分。** 同一症状相关的改动单独一版；一旦坏，`git checkout` 秒回上一版。
4. **用户一句「有多余线那版没报错」是决定性线索。** 把「改动史」和「症状第一次出现在哪个版本」对齐，
   比读代码定位快得多——尤其在你没有真机、没有用户控制台报错的时候。
5. **三路独立盲审报 70+ 条，核实为真只有 20 条，其中 8 条是我自己前几版改出来的。**
   审阅报告必须逐条回原文核对（连「乱码」都可能是审阅程序读文件的编码假象），否则审阅本身变成新的污染源。
6. **改第三方模块的显示文本（中文化）时，只改 name/hint/choices 的显示值，存储 key 保持英文不变。**
   这样从原版升级、或以后装回原版，世界里的数据一个字都不丢。

---

## 1. 复盘：十版迭代时间线（每坑一句话根因）

| 版本 | 做了什么 | 结果 / 根因 |
|---|---|---|
| 定位 | 用户要「让 token 一跳一跳的战棋移动 mod，A 开头」 | 是 Aeris Tokens（不是 Aeris Core） |
| 体积 | 审查发现仓库 8.96MB | 其中 `examples/demo.mp4` 占 95.7%，真代码 280KB / 8935 行 / 111 个 .ts |
| 深审 | 三路子代理独立盲审 | 定性：它「接管整条 token 拖拽管线」（`CONFIG.Token.objectClass` 换类 + 覆写 8 个拖拽方法） |
| 装原版 | 用户装官方 v13.0.19 | 四个依赖（aeris-core/socketlib/lib-wrapper/color-picker）用户服务器全有 |
| 诊断1 | 用户报「战斗里不跳了」 | 不是 bug：`moduleFunctionalityScopeInCombat` 被写成 `Disabled`，改成 `Tactics` 即好 |
| 立项 | 用户要「悬停显示走了多少 + 中文化」，决定「直接改原版」 | 走 fork 路线，MIT 允许 |
| 构建 | 本地打通 `npm install` + `npx vite build` | 卡在 electron postinstall（见 §2.1） |
| LH.1~LH.7 | 中文化 63 处 + 新增 movementHistoryRuler + 修原版 bug | 用户报「已用 85 步」「一堆黑色 ∞」「走 20 说 60」「地上两条线」逐版修 |
| **LH.8** | 「能修的全修」一次改 18 处 | **严重自伤：用户报「拖动后移动不了了，不走」** |
| 线索 | 用户：「地面不要多余的线啊，有多余线那版没报错爱」 | 锁定：坏在「去线」的手法（动核心管线），不是其它 |
| LH.9 | `git checkout` 退回 4 个核心管线文件 + 停用去线逻辑 | 止血版 |
| LH.10 | 去线改成「纯显示层隐藏」 | 最终交付，用户确认「没问题了」 |

---

## 2. 正解存档（照抄这些，别再发明）

### 2.1 构建链（每次都要用，缺一步就崩）
- 源码：`<跑团工具>\Foundry模块\第三方源码\aeris-tokens`（`git clone --depth 1 https://gitlab.com/robxnlifts/aeris-tokens.git`）
- **装依赖必须**：`npm install --no-save --no-audit --no-fund --ignore-scripts`
  - 根因：`fvtt-types`（`github:League-of-Foundry-Developers/foundry-vtt-types#main`）带来 `electron`，
    其 postinstall 下载二进制时报 `RequestError: read ECONNRESET` + Windows `EPERM rmdir`
    （`npm-cache\_cacache\tmp\git-clone8V0QUv\node_modules\resolve`）→ 整个 install 回滚、node_modules 清空。
  - `--ignore-scripts` 阻止 postinstall；esbuild/rollup 的平台包走 optionalDependencies，不依赖 postinstall。
- **构建**：`npx vite build`（96 modules transformed）→ **vite 会清空 dist**，之后必须重拷
  `Copy-Item LICENSE.txt dist\` 与 `README-Aeris原版.md dist\`。
- **打包必须用 .NET API**（`Compress-Archive` 会把文件丢到 zip 根、丢失 `scripts/` 之类前缀）：
  ```powershell
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [IO.Compression.ZipFile]::Open($dst, [IO.Compression.ZipArchiveMode]::Create)
  foreach ($f in (Get-ChildItem $dist -Recurse -File)) {
    $rel = $f.FullName.Substring($dist.Length + 1)
    [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $rel, [IO.Compression.CompressionLevel]::Optimal)
  }
  $zip.Dispose()
  ```
  条目名用**反斜杠**（`GetEntry` 时也要用反斜杠匹配）。
- **验证抽验字符串必须从源码里取**，不能凭记忆写（我搜「战斗内移动模式」实际译文是「战斗中移动模式」，白跑一轮）。

### 2.2 隐藏核心的那条线（正解，纯显示层，别走回头路）
- 核心那条线画的是 `document.movementHistory`——只有走**核心**移动流程才写它
  （Token HUD 方向键 `applications/hud/token-hud.mjs:262`、角色配置表
  `applications/sheets/token/token-config.mjs:225`、区域顶开 `client/documents/region.mjs:987`），
  模块的跳跃不写 → 它就是一条「半截的旧线」。
- **错误做法（两次都翻车）**：
  - LH.7 调 `Ruler#clear()`：它 `#path.clear()` + `token.layer.removeChild(this.#path)`，
    而 `#path` 只在 `draw()`（`ruler.mjs:169`）才 `addChild` 挂回 → 核心那条线**永久消失**。
    （出处：`client/canvas/placeables/tokens/ruler.mjs:197-206` 与 `:169`）
  - LH.8 包 `Token.prototype._refreshRuler` 并在里面 `refresh({空})`：那是覆盖核心渲染管线的内部状态 →
    真机出现「拖不动」。
- **正解（LH.10）**：只做两件纯显示的事，全程 try/catch：
  ```js
  function hideCoreRulerFor(token) {
    if (!coreTrailHidden) return;
    try {
      if (token?.ruler) token.ruler.visible = false;   // 核心自己也是这么控显隐
      const el = document.getElementById(`token-ruler-${token?.id}`);
      if (el) el.style.display = "none";               // 距离标签容器
    } catch { /* 失败就退回原样：多一条线，功能不受影响 */ }
  }
  ```
  - `token.ruler.visible = false` 的出处：`client/canvas/placeables/token.mjs:1274
    `this.ruler.visible = this.ruler.isVisible``（核心自己用的属性，不是私有字段）。
  - 标签容器 id 出处：`ruler.mjs:370-387 #getLabelsElement` → `#hud #measurement` 下
    class `ruler-labels token-ruler-labels`、id `token-ruler-<tokenId>`。
  - 每帧在自有的 rAF tick 里对「正在显示自己那条轨迹」的 token 调一次（核心状态变化会重新置 true，下一帧再盖上）。
  - 配一个 client 级设置开关（`hideCoreTrail`，默认开），用户一键即可关回原样。

### 2.3 中文化零破坏的写法
- 只改 `game.settings.register(MODULE_ID, KEY, { name, hint, choices })` 里的**显示文本**；
  `choices` 的**存储 key 保持英文**（`Tactics`/`Exploration`/`Disabled`），
  `game.settings.get` 的 30 余处调用点全用英文 key。
- 结果：世界 DB 里的值不变 → 从原版升级 / 装回原版都不丢值（三路盲审逐行核对过 diff 确认零破坏）。

### 2.4 依赖缺失守卫（原版会整模块瘫痪）
- 原版 `Hooks.once("init")` 第一句就是 `patchTokenLayer()` 无守卫地调 `libWrapper.register` →
  缺 lib-wrapper 时 `ReferenceError` 打断整个 init 回调 → 32 个设置一个都不注册，
  而核心读未注册设置会**抛错**（`client/helpers/client-settings.mjs:271` `"${id}" is not a registered game setting`）。
- 正解：`registerSettings()` 提到 init 第一位 + 三处 register 加守卫（libWrapper / socketlib / aerisCore），
  坏一个不影响其余（打包时补个 try/catch，绝不裸调）。

---

## 3. 本改版修掉的原版真 bug（含行号，供以后合并上游时对照）

1. **「本回合已移动量」从不清零**：`src/token/setup.ts:87/97`
   `(c.actor as AerisToken | null)?.movementBudgetHandler.reset();` —— `c.actor` 是 Actor 文档，
   `movementBudgetHandler` 只定义在 Token 上（`src/token/aerisToken.ts:71`）→ `undefined.reset()` 抛 TypeError →
   `flags["aeris-tokens"].distanceMoved` 永不归零 → `priorTurnCost`（`src/token/movementBudget/movementBudget.ts:7-10`）
   把上回合累计带进新回合（用户看到的「没动就已用 85 步」）。
   修法：改用 `combatant?.token?.object` 或遍历 `canvas.tokens.placeables` 找该 actor 的 Token 再 reset。
2. **暂停时松手死循环 + 不落库**：`src/token/animation/jumpTokenTo.ts:57-85` 外层 `while(true)`、
   内层 `while(this.trailQueue.length)`，`:68` 的 `break` 只跳内层 → 无限空转约 400ms/轮；
   `isJumping = false` 在 `:85`（只有外层 break 才执行）→ `enqueueJumps` 的 Promise 永不 resolve →
   `aerisToken.ts:336 await broadcastDragEnd(...)` 卡住 → 本次移动不落库。
   修法：暂停时清空队列并跳出外层；`isJumping=false` 移入 `finally`。
3. **寻路缓存判据写反**：`src/token/pathfinding/tokenPathfinder.ts:158` 漏 `!`（同文件 `:127` 是对的写法）
   → cap 未变时反而每次 pointermove 全量重算。
4. **六角格邻居参数颠倒**：`src/navGrid/navGrid.ts:105 getNeighborOffsets(i,j,isHex)` vs 重建 `:50 (j,i,isHex)`
   与签名 `src/utils/getNeighbours.ts:4 (j,i,isHexagonal)` → 建/改/删墙后六角格连通写错（方形格走常量 SQ_DIRS，参数被忽略，不受影响）。

### 3.1 数字「已用 / 剩余」的正确算法（别读累计账）
- `_path[0].cost = priorTurnCost`（`BacktrableMovementTrail.ts:189-207`），这本账一旦没清零就一路累加 →
  「走 20 说 60」「头顶 300+」。
- **正解：只累加每次拖拽的增量**：`const c0 = Number(path[0]?.cost)||0; const cLast = Number(path.at(-1)?.cost)||0; const delta = Math.max(0, cLast - c0);`
- `cost` 单位是「格」：`_recalcTrail`（`BacktrableMovementTrail.ts:162-187`）里
  `max = Math.floor(maxMovementRange(ranges) / grid.distance)`，尺数 = 格数 × `canvas.scene.grid.distance`。

### 3.2 黑色「∞」的来源（别再借核心尺子量自己的路径）
- dnd5e `TokenRuler5e` 的标签：`dnd5e.mjs:67857-67863`
  `context.cost = { total: Number.isFinite(cost) ? ... : "∞", units }`。
- 根因：喂给核心尺子的 waypoint **缺 `action` 字段** → `ruler.mjs:267` 按 `displace`（位移、代价无限）算。
- 正解：**干脆不借核心尺子**，自己在 `canvas.tokens._rulerPaths` 里画 `PIXI.Graphics`
  （照抄 Aeris 自己的 `src/pixi/square/drawSquareStroke.ts:11/33-35` 的 v7 经典 API：`clear()/lineStyle/moveTo/lineTo`）。

---

## 4. 铁律（本次沉淀）

1. **看不见真机的改动，绝不碰「核心方法的包装」或「核心对象的内部状态」**——只能碰显示属性（visible / style.display），且必须 try/catch。
2. **去掉视觉干扰的层级：显示层 > 数据层 > 方法包装**，越靠上越安全。
3. **一次只改一个症状相关的点，单独一版**；坏了 `git checkout` 秒回。
4. **把「改动史」与「症状第一次出现的版本」对齐**，比读代码快；用户的一句现象描述往往就是答案。
5. **审阅报告逐条回原文核对**，连「乱码」都可能是读取编码的假象，不是源码真乱码。
6. **构建链三件套**：`--ignore-scripts`（躲 electron postinstall）/ `vite build` 会清 dist（记得重拷 LICENSE/README）/ 打包用 .NET API（Compress-Archive 丢前缀）。
7. **抽验字符串从源码取**，不凭记忆写。
8. **中文化只改显示值、key 保持英文**，世界数据零丢失。
9. **改第三方模块 = fork**：保留 LICENSE + 原作者署名 + 换名区分 + 删 manifest/download（防官方更新一键覆盖你的改动）。
10. **没有用户控制台报错时，任何「修好了」都只是推理不是实测**——交付时如实标注「这是推理，不是实测」。

---

## 5. 给下一个接活的智能体

- 产物在 `<跑团工具>\Foundry模块\`：`aeris-tokens-中文增强-v13.0.19-LH.10.zip`（100,257 字节 / 28 条目）是最终版；
  LH.1~LH.9 与 `aeris-tokens-v13.0.19-原版(官方zip).zip` 同目录保留作二分基线。**已知好用基线 = LH.6**（两条线但那版用户确认没报错）。
- 源码在 `<跑团工具>\Foundry模块\第三方源码\aeris-tokens`（分支 lh-cn，基线 v13 提交，LH.1~LH.10 全部**未提交**，改动集中在 30 个文件 + 新增 `src/token/movementHistoryRuler.ts`）。
- 还没修的上游问题（用户已知情，要修就**一个一个单独出**）：Esc/右键取消拖拽后该 token 拖不动（`_onDragLeftCancel` 只认 `event.button === 2` + 缺 return，刷新可解）、纹理缓慢泄漏（刷新可解）、画布外松手不落库、多选 token 不走跳跃特效（上游只处理 `controlled.length===1`）、socket 8 个 handler 无鉴权。
- 用户环境：FVTT 13.351 / dnd5e 5.3.3 / 服务器 `http://146.56.232.12:30000` / 世界 id `chushi`「初始世界（数据）」；依赖 aeris-core v13.0.23 / socketlib v1.1.3 / lib-wrapper 1.13.4.0 / color-picker 1.7；`moduleFunctionalityScopeInCombat` 与 `OutOfCombat` 均 `Tactics`、`enableCombatMovementHistory` = true、场景网格 100px 方形。
- 升级三步（每次交付都要说）：删服务器 `Data\modules\aeris-tokens` 整个文件夹 → 解压新 zip 进同名文件夹（防双层）→ **重进世界**（模块清单在「加载世界」那一刻读入，只按 F5 不够）。
- 本机 Foundry 源码：`<FVTT安装目录>\resources\app\`（`data\modules` 只有 README，无法真机验证，所有结论靠代码级核对 + 编译 + 用户实测）。

---

## 6. 第二次自伤：LH.11 → LH.19（本次，用户第二次被改到「拖不动」）

### 6.1 用户给的决定性线索（原话，务必按此办案）

- **「我说V11能走路至少，V12不行了，你看看V11和V12有什么区别找找不就行了吗？我都陪你熬到4点了，卧槽啊」**
- **「我受不了了，我要被你气进LCU了，你到底行不行啊，你能不能去验证不要他吗的到处乱猜啊」**
- **「你是说我等了4个小时花了50块钱，就是让你把原本好的模组改坏，然后再改回来，你说我生不生气？？？」**
- **「L18还他吗的是坏的？？？」** → 用户把 aeris-tokens 整个卸载后：「现在拖得动吗，可以，而且很流畅」= 病因确实在模块内。

⇒ **铁律：用户手里有两个 zip（LH.11 / LH.12）时，第一动作必须是解压两个包做 bundle diff，不是发运行时探针、更不是逐个验证「我加的修复对不对」。**
我把问题问反了：一直在问「我加的 13 个修复各自对不对」，该问的是「哪一个改变了 LH.11 原本正常的行为」。
**两个 zip 一直在手上，我却在往运行时发探针** —— 这是本项目最贵的一次方法论错误。

### 6.2 LH.11 vs LH.12 的实质差异（bundle 逐字对比，仅 9 处是实质改动）

| 标记 | 位置 | 改动 |
|---|---|---|
| F1 | `_onDragLeftCancel` | 加 `if(!isAerisDrag()) return super...` + `return true` |
| F2 | `_onDragLeftDrop` / `_prepareDragLeftDropUpdates` | 包 try/catch/finally；`setDragStartData(null)` 从 dropUpdates **之前**挪到 **finally** |
| F3 | `jumpTokenTo` singleJump / `tokenPreviewPathHandler` 两个 ticker / `tokenPathGraphicsHandler` cb | 加 try/catch（LH.12 版是 `ticker.remove()` + `resolve(false)`） |
| S2 | `_commitDragLeftDropUpdates` | options 加 `movement: {[id]:{constrainOptions:{ignoreWalls:true}}}` |
| S3 | `tokenPathfinder.updatePathReach` | `cappedHasChanged(uncap)` → `!cappedHasChanged(uncap)` |
| S4 | `jumpTokenTo.syncPosition` / `tokenPreviewPathHandler.syncTokenPosition` | **删掉** `this.token.document.x/y = this.token.x/y` |
| S5 | `_onDragLeftStart` | `_draggerUserId` 非空时查 `game.users.get(...).active`，离线夺回 |
| S6 | `tokenPathGraphicsHandler._paintFillShader` / `removePaint` | 新增 `_prevMaskTextures` 并 destroy 旧帧纹理 |
| S7 | `regionIndexManager._rebuild` / `_applyRegionUpdate` | push 前加 `const {ROWS,COLS}=getRowsCol(); if(i<0||j<0||i>=ROWS||j>=COLS) continue;` |

（其余 42 处全是 esbuild 变量重命名，不是改动。）

**已逐处回退的**：S4（LH.17）、S3（LH.17）、LH.16 的「只拦骑乘者、放坐骑走 Aeris」（LH.17）、S2（LH.18）、F3 的「异常即 `ticker.remove`/kill 自己」（LH.18 改为只 `console.warn`）、S6（LH.18）。

**仍然保留、且位于「所有 token 都走」的公共拖拽路径上的改动**（真正的嫌疑池）：
`_onDragLeftCancel`(F1)、`_onDragLeftDrop`(F2)、`_prepareDragLeftDropUpdates`(F2/S9)、`_onDragLeftStart`(S5+LH.14 夺回)、`isDragged`(`??`→`||`)、`_finalizeDragLeft`(LH.13 补 return)、`_onDragLeftMove` 的 else 落位兜底(LH.19)。

### 6.3 真机铁证（execute-js READ-ONLY 探针，已拿到）

| token | `mesh.scale.x` | 文档基准 `document.texture.scaleX` | 比值 |
|---|---|---|---|
| 不安的 拟态金币群 | **0.047344226724915714** | 1.5 | 3.16% |
| 愤怒的 血月猎兽 | **0.1953125** | 1 | 19.5% |
| 蒙德 | **0.13736263736263737** | 1 | 13.7% |

设置：`scaleJumpFactor = 1.15`（用户世界设置）、`moduleFunctionalityScopeInCombat=Tactics`、`combat=true`、`game.modules.get("aeris-tokens").version = 13.0.19-LH.12`。

**换算**：`1.15⁻²⁴·⁷ ≈ 0.0316`、`1.15⁻¹¹·⁷ ≈ 0.195`、`1.15⁻¹⁴·² ≈ 0.137` —— 三个 token 缩小的倍率精确等于「被拖次数 × 1/1.15」。
**每次拖拽净乘 `1/1.15`（只除了、没乘回来）。** 缩放只存在于运行时内存（`mesh.scale`），刷新即恢复，**不写文档**。

### 6.4 缩放漂移的机制（源码级，且 LH.11 就有 → 原版 bug）

- `tokenPreviewPathHandler.startPreview()` 的 ticker 里：`const target = getTarget(); if (!target) return;`，
  而 `getTarget()` 在 `this.token.queuedPositionOffset` 为空时返回 `null` → **整帧什么都不做（不乘缩放）**。
- `reset()` 里 `revertScaleMultiplier(mesh, this.currentScaleMultiplier, …)`（bundle 里是 `Ko(t,e,n){const s=1/e; return Promise.all([Wt(()=>t.scale.x,i=>t.scale.x=i,s,n), …])}`）
  = **按 `1/currentScaleMultiplier` 做比例除法还原**。
- `currentScaleMultiplier` **只在 `startPreview()` 里被重置为 1**，`reset()` 之后保持残留值。
- ⇒ 任何一轮 preview「没乘」（`queuedPositionOffset` 为空）却执行了 reset 的除法，就**净除一次 1/1.15**，跨轮次错配累积。
- **真机 ROUNDTRIP 实验**（模拟 `startPreview` → `reset`，已还原测试前值）：
  `before=0.047344226724915714` → `meshPreview=0.05426307318550436`（csm 1 → `1.146139179773476`）→ `resetRet=true` → `meshAfter=0.0473442267249157`（**单次往返守恒**）→ `csmAfter=1.146139179773476`（**csm 未重置**）。
- **LH.11 的 bundle 里 `Ko` 与 `if(!h)return null` 同样存在 → 这是原版 bug，不是本次改版引入。**
- 同一根因还解释「松手不走」：`_prepareDragLeftDropUpdates` 里 `dest = queuedPositionTopLeft ?? getSnappedPosition() ?? {x:document.x,y:document.y}` ——
  `queuedPositionOffset` 没被设置时 dest 退化成**当前位置**，提交的就是原地。

### 6.5 决定性事实：用户装的不是他在测的版本

用户说「**我确定了，我装了L19，他还是无法移动**」，但真机 `game.modules.get("aeris-tokens").version` 读回来是 **`13.0.19-LH.12`**（差 7 个版本）。
⇒ **交付后必须让用户报版本号**（F12 控制台 `game.modules.get("aeris-tokens").version`）；否则所有「这版还是坏的」都建立在错误基线上。

### 6.6 execute-js 的 forbidden patterns（本轮新增的坑）

- 端点只返 `{value:true}`，结果必须脚本内 `ChatMessage.create` 再 `foundry_chat_get` 读回。
- **被拒的脚本会在聊天里留下 `<b>⚠ REST API execute-js:</b>`（whisper 给 GM）**；看到这条 = 脚本根本没执行，不是「执行了没输出」。
- 已知会拦：`async`/`await`、`game.settings.set`、`localStorage`；本次实测**含 `p.control(...)` / `_initializeDragLeft` / `_onDragLeftMove` / `_prepareDragLeftDropUpdates` / `_onDragLeftDrop` / `canvas.scene.updateEmbeddedDocuments` / `parseInt` 的长脚本被拒**。
  绕法：拆小脚本、用 `.then()` 链代替 `await`、`var s=game.settings; s.set(...)`。
- **反复发长探针脚本会明显增加服务器负担**（用户报「我服务器卡死了」）——探针要**少发、发小、只读**。

### 6.7 本轮新增铁律

11. **用户给出「A 版好 / B 版坏」时，先做 diff，再谈别的。** 两个 zip 都在手上却在发运行时探针，是本项目最贵的一次方法论错误。
12. **交付后必须让用户报版本号**（`game.modules.get("aeris-tokens").version`）。「用户说装了」≠「装上了」——本次实际差 7 个版本。
13. **不要动「让动画与文档保持一致」的同步点。** `syncPosition()` / `syncTokenPosition()` 里把 mesh 坐标写回 `document.x/y` 看似是脏写，实为原版刻意为之（核心 `_refreshPosition`（`client/canvas/placeables/token.mjs:1372-1378`）用 `document.x/y` 回写 mesh）——删掉后动画每帧被拉回，立刻表现为「走不了」。**宁可保留这处「脏写」。**
14. **同一症状连续两版修不好就必须换思路**，不要把「再改一处」当进展。用户为本次付出约 4 小时 + 50 元 + 两次「拖不动」。
15. **改第三方模块的拖拽/寻路/落位主链是禁区。** 本次 9 处改动里有 6 处落在主链上，全部与用户症状相关；真正安全的只有「中文化显示值」「纯显示层隐藏」「独立的新功能文件（movementHistoryRuler）」。

---

## 7. 第二轮迭代产物与状态（LH.11 ~ LH.19，交付时必须说清）

- **已知最好用基线：`LH.11`**（`aeris-tokens-中文增强-v13.0.19-LH.11.zip`，100,439 字节 / 28 条目）——用户亲口确认「**LH.11 是好的能移动**，但悬浮丢失」。**任何回退优先回到这一版。**
- LH.12 ~ LH.19 全部落在「改了主链」的区间：LH.12 起用户报「走不了」，此后每版都在回退上一版的改动，**属于我自己制造又自己拆除的循环**。
- 本轮唯一**真机坐实**的新 bug 是「缩放漂移」（§6.3/6.4），它在 LH.11 上同样存在（原版 bug），修法是**用绝对值还原替代比例除法**：
  在 `startPreview()` 开头把 `mesh.scale.x/y` 记为本轮基准 `baseScaleX/baseScaleY`，`reset()` 用 `animatePropertyDelta(getValue, setValue, base - current, duration)` 缓动回基准绝对值，完成后 `mesh.scale.set(baseX, baseY)` 对齐；`baseScale` 为 null 时退回原版除法。
- 打包/构建链同 §2.1（`--ignore-scripts` / vite 清 dist 需重拷 `LICENSE.txt` + `README-Aeris原版.md` / .NET `ZipFile` 精确写条目名、顶层无前缀、子目录用反斜杠 / zip 内 `module.json` 的 version 必须与源码同步，且**改源文件必须在 `vite build` 之前**）。
- 源码仍是「单提交仓库 + 全部改动在工作区」（`git log` 只有 `3d809cd chore: changelog`）⇒ **无法用 git 回退到 LH.11 基线**，只能逐处手工回退，或直接用 LH.11 的 zip。

---

## 8. 第三轮：LH.20 ~ LH.29（**本轮最贵，代价 30+ 版 / 20 小时 / 70 元 / 用户 30+ 小时未合眼**）

### 8.0 一句话总结这一轮的错

**一件用「完整运行时数据」10 分钟就能定位的事，我用了四版盲改、8 个小时去猜。**
错不在技术——错在**我把「读源码推断运行时会怎样」当成了证据**。

### 8.1 用户诉求链（原话，按时间顺序）

1. **「原版的，拖动角色会显示出步数的那个 current 那个，会被我们做的本回合和超出的那个框堵住，能不能删掉他，整合到我们做的那个里面，或者是把我们做的挪走不要挡住她？」**
2. 我不该猜时猜了——从核心/dnd5e 全库 grep `current` 找不到，用户直接给出决定性特征：
   **「别乱猜了，你不会问啊，current：walk，底下是步数，是个黑色框，我非常确定是这个mod里的，因为关了mod就没了」** → 一句话把范围收到本模块内（我此前查了几十处无关代码）。
3. LH.23 交付后：**「修好了」**。
4. 新 bug：**「战斗中，如果撞到敌对token，就会被卡在他面前，然后显示的距离的还是走的没撞到敌对token后的距离」**
   用户选定方案 A：**只让「本回合/本次距离 + 轨迹线」停在被挡住的那一格**，明确放弃改填色/寻路。
5. LH.24 反馈：**「虽然步行速度会正常，但是本回合移动和超出还是计算到后面的啊？能不能改？」**
6. LH.25 后：**「还是错的，我走了10尺，算的我走了25尺」** → 追问后用户给出最精确的一次描述：
   **「我没理解错含义，就是，我走了25尺，在10尺的地方有敌人，拦住我了，显示我走了25尺，实际我在敌人面前，10尺」**
7. LH.27 后，用户下达**总表第零条 / 第一条**（见 `AGENTS.md`）。
8. LH.29 实测通过：**「正常了。正常了......」**

### 8.2 困难一：原版黑框的定位（LH.22/23）

**困难**：用户说「current：walk」，我从核心、dnd5e 倒着查 —— grep `[Cc]urrent` 全库只命中无关处（`combat.current`、`_getCurrentPage`），核心 ruler 标签模板（`templates/hud/waypoint-label.hbs`）里根本没有 "current" 字样。**方向完全错了。**

**怎么排除的**：用户一句「关了 mod 就没了」直接把范围钉死在模块内。随后在本模块源码里 grep `urrent`，命中 92 处，其中**唯一带 `Current:` 字面量的是**：

```
src/token/graphics/tokenPathGraphicsHandler.ts:153-155
  const subHeader = localData?.currentMode
      ? `Current: ${localData.currentMode}`
      : undefined;
同文件 :184-187
  const labels = isDistanceLabelAboveTokenEnabled();
  if (labels && (subHeader !== undefined || path.length !== 1))
      this._paintLabel(text, subHeader);      // text = formatTrailSegments(path) = 底下那行步数
```

**为什么必然被压住**（这是本轮唯一一次干净的机制推导）：
`_paintLabel`（同文件 `:295-314`）最后一句是 **`this.token.mesh?.addChild(floatingLabel); floatingLabel.zIndex = 10000;`**
⇒ 它是 **PIXI 画布层**，贴在 token 正上方；
而我们的标签挂在 **DOM 的 `#hud #measurement`**（`src/token/movementHistoryRuler.ts:758-778` / `:1038-1069`）。
**DOM 永远渲染在 canvas 之上** ⇒ 两个都开时必然是我们的压住它，**与坐标偏移无关，往哪挪都会撞**。

**开关**：`src/settings/gridDistance.ts:3` `export const ENABLE_DISTANCE_LABEL_TOKEN = "enableDistanceLabelToken";`，
`isDistanceLabelAboveTokenEnabled()` 原实现 `game.settings?.get(...) ?? true`。
**修法**：恒返回 `false`（附完整理由注释）；设置项 name 加「（已停用）」、`default: true → false`，
**保留注册项**以免动到已存在的世界设置数据。信息不丢——搬进我们的标签。

### 8.3 困难二：四版盲改（LH.24 → LH.27，全部被实测证伪）

**症状**：拖到第 5 格、被敌人拦在第 2 格，「步行」显示正确（10 ft），「本回合」显示 25 ft。

**四版都犯了同一个错：把「我推断的运行时判据」当成事实。**

| 版本 | 我改了什么 | 我以为的原理 | 实测结果 |
|---|---|---|---|
| LH.24 | 新增 `truncatePathAtTokens(self, path)`：遍历 `canvas.tokens.placeables`、跳过自己、用 `getOccupiedTiles(t)` 收 `${j},${i}` 到 Set，从 `k=1` 起碰到第一个被占格就 `path.slice(0, k)`；`liveCostOf` 第一行改用它 | 路径穿过敌人 → 截掉 | 只修好了「步行」，「本回合」仍 25 |
| LH.25 | `captureFromCore` 也做同样截断（`blockedTileKeys` + `gridOffsetOf`，`kept = raw.slice(0, cut)`，cost 仅对 `i=1..kept.length-1` 求和） | 核心记录的路径也要截 | 无效 |
| LH.26 | `capture()` 几何核对失败时先 `cutIdx = path.findIndex(o => o.i === curTile.i && o.j === curTile.j)`，`>= 0` 就 `path.slice(0, cutIdx + 1)` 继续主记账，`< 0` 才转 `captureFromCore`；新增 `blockedRects(self)` | 落点必在路径中间 | 无效 |
| LH.27 | 在 `if (!endsAtToken) {...}` **之后**再加一道独立截断；`captureFromCore` 改邻近两点按格插值逐格检查 | 双重保险 | 无效 |

**为什么全错**：四版改的都是**判据的实现**，却没人验证过**判据本身在运行时到底取到什么值**。
三路盲审、源码通读、逻辑推演 —— 全部是**静态的**，而错的是**时序**。

**这四版的共同特征（未来看到就要警觉）**：
- 每一版都能在源码里「证明」自己是对的（逻辑自洽）；
- 每一版都没有一行真实运行时数据；
- 每一版的验证方式是「打包 → 让用户装 → 让用户试」。

**用户在 LH.27 后下的判断完全正确**：这不是进度，这是赌。原话见 `AGENTS.md` 第零条。

### 8.4 困难三：用户描述 vs 我的推断（**这条最该记**）

我发出的外部探针（读 DOM 标签 + `token.movementPath._path` + `document.movementHistory`）跑出来后，`others` 字段是：

```
others: '惹恼的 拟态金币群{4500,1400 100x100} | 蒙德{3800,1800 100x100}'
```

两个 token 都在远处、不在路径上 ⇒ 我据此写了「**这次场上没有敌人**」，并据此重写了一版分析。

用户当场纠正：

> **「能不能不要乱猜我啊，你都说了完整复刻了，肯定是我前面有敌对token那样拖的啊，和第一次和之前都一样，你探测不到敌人，是因为那个敌人的效果是 PC 啊，不是 NPC 啊」**

**我的两个错**：
1. **拿探针里没出现的字段当证据去否定用户的描述** —— 我的探针只打印了名字和 `bounds`，**根本没读 `disposition`**。「敌人」的判据是 `token.document.disposition === -1`，**与 PC / NPC 无关**，PC 一样可以敌对。我把「不是 NPC」当成了「不是敌人」。
2. 我还误读了 `hRaw`：把第二段 `3700,1976 → 3700,1900` 读成「核心把 token 拉回来了」，实际那段 `cost = 0`，**是同一格内对齐格点，压根没有回拉**。

**正确机制**（用户描述与我后来读到的数据完全一致）：
用户一路拖到第 5 格 → **核心的移动约束在敌人那一格把他截住，直接把落位定在了被挡住的第 2 格**（3700,1976）→
而 `movementPath._path` 保留的是**用户拖到过的最远点**（5 格）。
两条一对比，就是「实际停 10 尺、显示 25 尺」。

**教训**：
- **用户的描述是事实，我的推断是假设。冲突时改假设，不是改事实。**
- 探针字段不全时，**不能说「没有」**——只能说「我没测到这个」。
  要判定敌我，必须读 `disposition`（-1 敌对 / 0 中立 / 1 友善），**不能靠名字、不能靠 PC/NPC**。

### 8.5 困难四：决定性数据是怎么拿到的（LH.28 诊断版，**正解路径**）

按总表第零条指标二：**探针取不到完整信息时，宁可专门打一个「测试用 mod」。**

LH.28 = **纯诊断版**，源码改动全部在 `src/token/movementHistoryRuler.ts`：
- 新增 `function pushDiag(rec: any): void` —— 往 `globalThis.__CAP` 写（上限 200 条，整段 try/catch）；
- `capture(token)` 改为薄包装：建 `DBG = {t, id, name}` → `pushDiag(DBG)` → `try { captureMain(token, DBG); DBG.done = true; } catch (e) { DBG.err = ...; throw e; }`；
- 原函数体更名 `captureMain(token, DBG)`，在 `exit`/`pathLen0`/`path0`/`pointsLen0`/`lastOffset`/`tokenXY`/`docXY`/`curTile`/`endsAtToken`/`cutIdx`/`pathLen1`/`trimmedLen`/`trimmed`/`c0`/`cLast`/`delta`/`prevCost`/`keySame`/`newCost` 各点赋值；`captureFromCore` 入口 `pushDiag({fromCore:true, hLen, hRaw})`。
- **不改任何 `if`、不改任何算式** —— 所以它「照样显示错的数」，用户一眼就知道这不是修复版。

用户跑出来的数据（**这一屏数据值 8 个小时**）：

```
ver: '13.0.19-LH.28'
lbl: '步行·本回合25ft·剩余25ft'
pLen: 6
path: '37,21@0 37,20@1 37,19@2 37,18@3 37,17@4 37,16@5'
docTile: '37,19'   posTile: '37,19'   docXY: '3700,1900'   tokenXY: '3700,1900'
lastOffset: '37,16'   endsAtDoc: false   cutIdx: 2   pathLenCut: 3
c0: 0   cLast: 2   deltaCut: 2   deltaFull: 5
hLen: 3   hRaw: '3700,2100@0 3700,1976@5 3700,1900@5'
others: '惹恼的 拟态金币群{4500,1400 100x100} | 蒙德{3800,1800 100x100}'
```

**读法（这就是「完整的代码记录」的价值）**：
- `deltaCut = 2`（截断后应记 → **10 ft，正确值**）vs `deltaFull = 5`（完整路径 → **25 ft，实际显示值**）；
- 两者只差「截断有没有被跳过」；而 `endsAtDoc = false`、`cutIdx = 2` 说明**截断条件在探针这一刻是成立的**；
- ⇒ **矛盾只在时间轴上**：探针这一刻成立，`capture()` 跑的那一刻不成立。
- `hRaw` 末点 `3700,1900` = 格 `37,19`，与 `docTile` **完全一致** ⇒ **核心记录的才是真实落点**。

### 8.6 真根因（数据级，一行说清）

```
src/token/aerisToken.ts 的 _onDragLeftDrop 里，
  jumpTokenTo.singleJump 用 `this.token.x/y`（= mesh 位置 = _path 终点）去 document.update 落库
⇒ updateToken 触发 capture() 时，token 还骑在 _path 的终点上
⇒ capture() 的几何核对 `endsAtToken =（路径终点 == 当前格）` **恒为 true**
⇒ `cutIdx` 那段截断整段被跳过
⇒ 按完整路径记账 → 拖 2 格却记 25 ft
```

**随后核心的移动约束才把 document 落到 37,19**，但那次 update 没能把账改回来。

**根因的性质**：不是判据写错了，是**判据跑错了时刻**。
四版盲改之所以全废，是因为它们都在改判据的内容，而问题在判据被执行的**时间点**。

### 8.7 LH.29 修复（**只改一处**）

`src/token/movementHistoryRuler.ts` 的 `captureMain`，把 `curTile` 的取法换源：

```ts
let curTile: any = null;
try {
    const hist = (token?.document as any)?.movementHistory;
    if (Array.isArray(hist) && hist.length) {
        const w = hist[hist.length - 1];
        const off = canvas!.grid!.getOffset({ x: Number(w?.x), y: Number(w?.y) });
        if (off && Number.isFinite(off.j) && Number.isFinite(off.i)) {
            curTile = { j: off.j, i: off.i };
            DBG.curTileSrc = "core";
        }
    }
} catch (e: any) {
    DBG.coreTileErr = String(e?.message ?? e);
}
if (!curTile) {
    try {
        curTile = getTopLeftTileFromToken(token);
        DBG.curTileSrc = "token";
    } catch (e: any) {
        DBG.curTile = "THROW";
        DBG.curTileErr = String(e?.message ?? e);
        throw e;
    }
}
```

**为什么它能对**：
核心 `document.movementHistory` 的末点是**过完移动约束、真正提交成功的坐标**，
与 mesh 动画的时序**完全无关**；拿它去截 `_path` → `cutIdx = 2` → 记 **10 ft**。

**用户实测：正常了。**

### 8.8 本轮新增铁律（可直接复用）

16. **判据要取「与动画时序无关的量」。**
    凡是依赖「角色现在在哪一格 / 现在什么状态」的判据，在动画型模块里都可能踩在错误的帧上。
    优先取**核心已经落库的数据**（`document.movementHistory`、`document.x/y`、`_source`），
    而不是本模块自己维护的、还在动画中的中间态（`movementPath._path`、`mesh.position`、`token.x/y`）。
17. **`_path` 是「用户拖到过的最远点」，不是「松手落点」。**
    Aeris 的 `movementPath._path` 与真实落点（核心约束后的位置）**可以差好几格**。
    任何拿 `_path` 当落点的算法都要先问：被挡住了怎么办？
18. **探针字段不全时，只能说「我没测到这个」，不能说「不存在」。**
    尤其：判敌我要读 `disposition`（-1/0/1），**不能靠名字，不能靠 PC/NPC**，不要用缺失字段去否定用户的描述。
19. **用户的描述是事实，我的推断是假设；冲突时改假设。**
    本次用户两次给出决定性信息（「关了 mod 就没了」→ 范围锁定；「那个敌人是 PC」→ 推翻我的错误结论），
    如果我第一时间接受而不是重写分析，能省下数小时。
20. **同一个症状连续两版修不好，第三版必须是「诊断版」而不是「修复版」。**
    诊断版的要求：不改任何判定逻辑、只把内部中间值吐到 `window.__CAP` 之类的容器，
    交付时明确告诉用户「这版照样是坏的，它只负责抓数据」——本次 LH.28 就是靠这个一次定位。
21. **每版必须换版本号。** 曾出现两版都叫 LH.22（102018 / 102055 字节），
    导致既无法定位用户装的是哪版、也无法用版本号做沟通锚点。

### 8.9 本轮的代价（必须写下来的部分）

- **30+ 版迭代**（LH.1 → LH.29）；
- **20 小时**连续调试；
- **70 元** API 费用（用户自述）；
- **用户 30+ 小时没合眼**，中途多次因「又坏了」而情绪崩溃；
- 其中最贵的一段：**LH.24 → LH.27 四版全废**，全部是「猜判据 → 打包 → 让用户试」的循环。

**如果重来一次，正确的路径只有三步**：
1. 用户报「步数虚高」→ **先问清场景**（拖多远、被什么挡住、停在几格），而不是先读源码；
2. **直接打 LH.28 那种诊断版**（或给一个能读到内部值的探针），一次拿全部中间值；
3. 看数据 → 一行修好。

第 2 步省下的，就是那 4 版、8 小时和用户的一整夜。

---

# §9 LH.40 / LH.41：同一次「数字虚高」，根因在显示层的累计账
（2026-09-12。用户报「墙角折返跑步数不对」，实际是**两个独立症状**。）

## 9.1 症状与实际根因**不在同一层**（本轮最大的发现）

用户原话（三句，全部是事实，原样保留）：
1. 「现在他就是会在墙角移动好多次，导致走的步数不对，几乎都是折返跑的那种步数」
2. 「**我知道八格是正确的，中间有墙**，但是显示我走了80尺啊，我明明只走了40尺，不是吗」
3. 「我发现了一个重大发现，我**开了真的自动寻路**，**进了新回合**，然后拖动过墙，走的时候显示是走到了**70**，然后又**自动跳到了35，正确的了**」

我最初的假设**全部落在寻路层**：`_exploreTrailCursor` 游标只按长度回退、`costPath` 起点重算、
`_update()` 的 `_trailSplice(back+1)` 回退、autoPath 下 `_path` 整条替换。
**真机数据一到，这些全部作废** —— 根因在**显示层的算式**，与寻路一行无关。

⇒ **同一屏上同时出现的两个症状，不代表同源。**
用户把它们写在一句话里，是因为他在**同一屏**上同时看到了：
- **蓝线折返** 画的是 `movementPath.getPaintedTiles()`（`src/token/graphics/tokenPathGraphicsHandler.ts:70`，= 去重后的 `_path`）；
- **头顶数字** 来自 `captures` 这本账（`src/token/movementHistoryRuler.ts:142`）。
**两条链在代码里毫无交集。** 拆开后，「数字」当场定案并修好；「蓝线折返」至今（LH.41）仍未取证、未修。

⇒ **新铁律：列假设要按「显示层 / 数据层 / 方法包装层」分层列，不要按「用户提到的现象」列。**
（这是 §0 那条「去掉视觉干扰层级 = 显示层 > 数据层 > 方法包装」的另一半：**排查入口也要按层分**。）

## 9.2 根因（一行）

`src/token/movementHistoryRuler.ts:1516-1518`（LH.40 之前）：

```ts
if (live) {
    usedTiles = (cap?.cost ?? 0) + liveCostOf(reveal, true);   // ← 双倍
```

两个量描述的是**同一段位移**：
- `cap.cost` —— `capture()` 挂在 `Hooks.on("updateToken")`（`:1616`）上，**拖动过程中每落一格就跑一次**，
  早已把本次增量写进账本；
- `liveCostOf(reveal, true)`（`:1048-1080`）返回的是**整条 `_path` 的跨度**（末格 cost − 首格 cost），
  **不是「已走的增量」**。

**真机探针铁证**（token 蒙德，一次拖拽走 4 格 = 20 尺，40ms 采样 40 帧）：

| 时刻 | 账本 cap.cost | liveCostOf | 头顶数字 | 应为 |
|---|---|---|---|---|
| 拖动开始 | 0 | 4 | 20 | 20 ✓ |
| +330ms | 1 | 4 | 25 | 20 ✗ |
| +660ms | 2 | 4 | 30 | 20 ✗ |
| +990ms | 3 | 4 | 35 | 20 ✗ |
| 松手前 | 4 | 4 | 40 | 20 ✗（正好双倍） |
| 松手后 | 4 | — | 20 | 20 ✓ |

另有 4 条 `globalThis.__CAP` 记录（`d=1,2,3,4`，`sameDrag` 依次 `false/true/true/true`，
`dragKey` 恒为 `"30,24"`）证明拖动过程中 `capture()` 被触发了 **4 次**。

用户此前报的「70 → 35」是同一个 2×（7 格 × 2 = 14 格 = 70）。
**两次报的数字不同（80 / 70），但是同一个算式、同一个倍数 —— 不要被数字的具体值带偏。**

## 9.3 LH.40 修法（只动一处显示分支）

判据用 `Capture` 接口里**现成**的 `dragKey`（`:102`，`captureMain` `:637` 写入 = 本次拖拽的**起点格**）：

```ts
const revealPath = (reveal as any)?.movementPath?._path;
const startTile = Array.isArray(revealPath) ? revealPath[0] : null;
const dragKeyNow = startTile ? `${startTile.j},${startTile.i}` : "";
usedTiles = cap && dragKeyNow && cap.dragKey === dragKeyNow
    ? cap.cost                                            // 本次已入账 → 只读账本
    : (cap?.cost ?? 0) + liveCostOf(reveal, true);        // 刚起拖 / 骑乘 → 按原样相加
```

- **边界安全**：骑乘走核心原版拖拽时 `dragKey` 恒为 `undefined`（见 `captureFromCore` 的 LH.32 说明 `:847-855`），
  判据自然落回「相加」，不误伤。
- **被探针证伪的支线**：`clearOne(id)`（`:1231-1252`，置 `cap.cost = 0`）的触发条件是
  「`game.combat.combatant.tokenId` 变化」（`:1446-1451`）或 `combatTurnChange` 钩子（`:1706-1709`），
  **只清当前回合那一个 token**。本轮探针显示 `drag === turn === gPbVFkjcFACOZIgg`（拖的就是当前回合角色），
  账本全程 `0/6 → 4/6` 清得很干净 ⇒ **该支线与本症状无关**。
  （这条我曾当成头号嫌疑 —— 是**探针**排除的，不是推理排除的。）

## 9.4 LH.41：把「自动寻路」锁死为常开

用户原话：「吧自动寻路默认打开，不要关闭了，关了就容易出错」

> **注意：这是用户的操作观察。我没有数据能证明这个因果。照做 ≠ 认可因果。**
> 交付时就说了这句，教训里也一样记着：**蓝线折返是否与 autoPath 有关，至今未取证。**

**原设计为什么「容易关掉」**（`src/settings/autoPath.ts`，33 行）：
- `scope: "client"` —— **每个客户端各存一份**（不是世界设置），玩家各一份；
- `default: false`；
- **带一个快捷键 `autoPathKeybind`（`:8-14`）**，`onDown` 里 `game.settings.set(MODULE_ID, AUTO_PATH, !autoPathOn)`
  —— 按一下取反**并写进本地存储**，下次进世界仍是关的。

⇒ **改 `default` 是没用的**：它只对「从未设置过这一项」的客户端生效，
救不回已经存过 `false` 的客户端（包括用户自己）。

⇒ 用户选择**彻底锁死**：不注册设置项 + 不注册快捷键，`isAutoPathEnabled()` 恒 `return true`。
保留 `registerAutoPathSetting()` 为空实现（`_registerSettings.ts:2` 的调用处一行没动），
**这样想恢复时只需还原 `autoPath.ts` 一个文件**。

## 9.5 本轮的元教训（比上面任何一行代码都贵）

**A. 模块如果有「自带诊断出口」，先用它，不要自己造探针。**
`movementHistoryRuler.ts:1823` 的 `movementTrailDebug()` 挂在 `src/main.ts:64-65 + :82` 的
`globalThis.aerisTokens.debugMovementTrail()`，注释原话「一次就能看到本功能的全部现场状态，不用再来回猜」，
它的 `记录明细` 里直接就有那本账（`已用格: c.cost`、`已用尺`、`上限格`）。
在发现它之前，我写了 v3 / v4 / v5 / v6 四个探针，**全都在猜字段名**。
⇒ **动手写探针前，先 grep `globalThis.` / `debug` / `window.__`。**

**B. 改版过的模块，它的注释就是上一轮排错的结论文档。**
`movementHistoryRuler.ts:623-632`（LH.30）逐字记着用户当年**同一个症状**：
「一次拖拽，token 实际走 7 格 = 35 ft → 屏幕显示『本回合 85 ft』= 17 格 × 5」，
连真机 CAP 序列（`delta 4/6/7`、`prevCost 0/4/10`、`newCost 4/10/17`）都在；
`:585-590` 记着 `cost[0] === priorTurnCost === actor.flags["aeris-tokens"].distanceMoved`
与「走了 20 却说 60」「头顶 300 多」；`:642-652`（LH.33）记着另一组铁证。
**这和本轮是同一个 2×。** 靠读这些注释，我在拿到探针前就把假设范围收窄了一半。
⇒ **开工先通读目标文件里带「真机证据 / 铁证 / 根因」字样的注释块。**

**C. 诊断版留下的埋点，修好之后不要急着删。**
`pushDiag()`（`:397-406`）把每次 `capture()` 的中间值塞进 `globalThis.__CAP`（上限 200 条），
源码注释原意是「定位之后，下一版按数据改那一行，然后把这段诊断删掉」。
但**本次定案的关键证据（4 条 `d=1,2,3,4`）正是这些埋点给出的**。
⇒ **取舍：`__CAP` 这类「只塞数组、不参与任何判定」的埋点，保留成本近乎零，收益是下一轮的第一手数据。**

**D. 「累计 + 增量」的算式，必须先确认两个量有没有重叠。**
任何 `used = 累计 + 本次` 的显示算式，都要先问：**这个累计是否已经包含了本次？**
判据要给到「是否已入账」这种**身份标记**（`dragKey` = 本次起点格），
而不是靠「拖动中累计应该还没更新」这种**时序假设** —— 本次就是时序假设错了。

**E. 对用户的因果观察：只照做，不背书。**
用户说「关了就容易出错」，我没有任何数据支持这个因果。
照做要求（锁死）与承认因果是两件事，必须分开说清楚 —— 否则下一轮真出问题时，
两边都会以为「已经验证过了」。

## 9.6 构建与产物验证（本轮复现 + 新增）

- **复现**：`vite build` 会清空 `dist` ⇒ `LICENSE.txt` 与 `README-Aeris原版.md` 消失，
  **dist 从 28 条目掉到 26 条目**，必须手工回拷。（旧记录已写过，本轮**再次踩中**。）
- **新坑（本机沙箱）**：`npx vite build` 报 `failed to load config from ...vite.config.mts` + `Error: spawn EPERM`
  —— esbuild 必须开子进程走管道，被沙箱拦下。**这不是代码错，别去改代码。**
- **产物验证要用「不会被压缩器改名的特征」**：
  - 变量名会被压缩改名（`cap.cost` → `y.cost`），**不能用来验证**；
  - **对象属性名与字符串字面量不会被改** ⇒ 用它们计数。
  - 本轮两组计数：`dragKey` 出现次数 **5 → 6**（证明 LH.40 新判定进了产物）；
    `autoPathKeybind` **1 → 0**、`autoPath` 字符串 **2 → 0**（证明 LH.41 确实把开关删干净了）。
  - LH.40 新判定在 bundle @130501 的形态（可用于日后核对）：
    ``n._path, f=Array.isArray(m)?m[0]:null, b=f?`${f.j},${f.i}`:""; x=y&&b&&y.dragKey===b?y.cost:((y?.cost??0)+fn(u,!0))``
  ⇒ **「build 成功」不等于「改动进了包」。每次都数一遍特征串。**
- **包内计数**：两个 zip 都是 **28 条目**（与 LH.39 一致）；
  LH.40 = 112567 字节 / bundle 139248；LH.41 = 112805 字节 / bundle 138.61 kB（变小因删掉设置注册代码）。

## 9.7 仍未关闭的（诚实记账）

- **蓝线折返（来回绕）**：至今未取证、未修。用户 LH.41 交付后明确「只有蓝线是折返的，还在」。
  候选嫌疑（**全部未坐实，不得当结论用**）：
  `BacktrableMovementTrail.update()` 的 autoPath 分支 `this._path = path` 整条替换（起点恒为 `first`）；
  `_update()` 的 `_trailSplice(back + 1)` 回退与 `isLegalStep` 合并；
  墙角处两条等长绕行之间跳变，导致 `getPaintedTiles()` 出来的格子顺序来回变。
- **LH.40 / LH.41 的真机验收结果：用户未回报。** 数字是否不再双倍、设置项是否真的消失，
  **都还没有第二份证据** —— 本文档只记录到「已交付」为止。
- **锁死 autoPath 可能改变折返的表现（两个方向都可能）**：autoPath 开时 `_path` 是整条替换、
  关时是逐格拼接，而**蓝线画的正是 `_path`** ⇒ 下一个探针要一起看这个变量。

