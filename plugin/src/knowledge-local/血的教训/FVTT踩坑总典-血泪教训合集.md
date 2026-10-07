# FVTT 踩坑总典 · 血泪教训合集

> **这份文档写给「下一个接手的人，或下一个 AI」。**
> 每一条都写清两件事：**【坑】**是什么、**【解法】**怎么对。只写现象不写解法的条目一律标注 `原文未给`，不编。
>
> 素材来源（全部留痕可回溯）：
> - `FVTT技术资料\搓怪物做效果做mod任何时候，看到了一定要看仔细看\` —— **19 篇**既有坑书
> - `Foundry模块\lh-crafting（模板）\_开发铁律.md` —— 该项目 **350 条**编号铁律
> - `Foundry模块\lh-crafting（模板）\_进度与交接.md` —— 该项目 **49 节**逐版现场记录
> - 若干历史项目（aeris-tokens / lh-world-sync / gacha-banner / 教学视频库 …）

---

## 〇 · 只读一节的话，读这十条

这十条的共同点是：**不看就会重演，而且重演一次要花掉一整个晚上。**
每一条都在本项目里真实发生过，代价写在括号里。

### 1. 用户说「某功能没了 / 某处坏了」时，第一动作是**要数据**，不是改代码
- **坑**：凭症状猜一个判据 → 打包一版 → 让用户试。一个本该「拿一屏数据、一行改好」的事，被拖成 8 小时的赌博。
  （真实代价：**猜了 30 多版、20 个小时、70 块钱**，用户 30 多个小时没合眼。）
- **解法**：① 交付一个**用户可直接粘贴到 F12 控制台**的探针，一次覆盖**所有可疑分支**，不要「看一个值再决定下一个」；
  ② 探针取不到完整信息时，**专门打一个诊断版 mod**（只把内部中间值输出到全局变量，不改任何判定逻辑）；
  ③ 这一版改动若拿不出对应的**实测字段**，就说明还在猜，**不许打包**；
  ④ 同一症状连续两版修不好，**第三版必须是诊断版而不是修复版**。

### 2. 「静态检查全绿」不等于「这段代码跑过」
- **坑**：一个模块从 1.0.0 一直带着 `this.form = {...}`（`ApplicationV2` 原型上 `form` 是**只读 getter**），
  而**用户从未部署过引入它的那一版** ⇒ 这段代码从未运行过。四个检查脚本（语法 / 名字 / 契约 / 整份求值）全绿。
  真机一开就抛 `TypeError: Cannot set property form of #<ApplicationV2> which has only a getter`，
  而错误在 async 点击处理器里**被 promise 吞掉** ⇒ 界面一点提示都没有，用户只看到「点了没反应」。
- **解法**：在本地把**每个类都 `new` 一遍**（用带只读 getter 的桩基类），并**把所有事件回调包进一个会记账的 `safeHandler`**
  （catch 住 → `console.error` + `ui.notifications.error`），否则异常永远静默。
  核心 `ApplicationV2` / `DialogV2` / `Application` 上只有 getter 没有 setter 的属性共 **10 个**：
  `classList  element  form  hasFrame  id  minimized  rendered  state  title  window`。

### 3. 会抛错的自动化，必须**先干可逆的那一侧**
- **坑**：卖东西的代码先给钱、再删货。删货那一步抛错（无权限 / 文档被锁 / 别的模块的 hook 抛）⇒
  钱已经进账、货还在包里 ⇒ **同一件可以反复卖刷钱**。同型问题还在做菜扣料、领取货物上各出现一次。
- **解法**：凡「A 可逆、B 不可逆」的操作，**先把 B 做完再动 A**；A 失败时能回滚 B。
  调用链上每一处 `await` 都要问一句：**它抛了，前面已经改掉的东西谁来还原？**
  循环里 `await` 发东西必须包 try，**而且清队列要放在必达处**（失败点之前的会被重发、之后的永远发不出）。

### 4. 同一个量有两条判据时，其中一条必然是错的
- **坑**：卡面「材料够不够」是**逐行**判，真正扣钱的函数是**汇总**判。配方同时要 1 金币 + 1 银币、身上只有 1 金币：
  逐行各判都过、合起来凑不出 ⇒ 卡面说「可做」、点下去动不了。同型：钱包总额两套口径、
  订单金额三处各算一次、`due` 显示全价实收差额（**定金的 2 倍，且同一扇窗里两行互相打脸**）。
- **解法**：**「够不够」只能有一个数**，而且必须来自**真正扣钱的那个函数**（本项目统一走 `paymentPlan`）。
  改一个口径时，先 `grep` 它的**每一个**输出点 —— 数值和文案都算。

### 5. `Number(null) === 0`、`Number("") === 0`、`Number(false) === 0`
- **坑**：这三种「没设过」会被当成**合法的 0**。后果各有不同但都很难查：
  - 回收比例没写 ⇒ 当成 **0% 回收**（玩家 20 金币的东西只卖 1 铜）
  - 定金百分比设 0 ⇒ 被 `|| 50` 顶掉，设置**看起来不生效**
  - 留空 = 用兜底 ⇒ **兜底永远走不到**
  - `Number.isFinite(NaN)` 为假但 `NaN < 阈值` 也恒为假 ⇒ 全背包被判腐坏
- **解法**：哨兵值（「没设过」）**不能同时被 `Number()` 消化**。入口处先把 `null` / `undefined` / `""` / `false` / `"  "` 判成
  「没设过」再去 `Number()`；`Number.isFinite` 与 `> 0` 是两句不同的话，必须分开问。

### 6. 报错显示成 `{}` —— 跨 realm 的 `instanceof` 骗了你
- **坑**：在 `node:vm` 沙箱里 `new Error` 不是宿主的 `Error` ⇒ `x instanceof Error` 为假 ⇒ 落到 `JSON.stringify(x)`，
  而 Error 的 `message` / `stack` **不可枚举** ⇒ 真报错内容全变成 `{}`。同型：跨 realm 的 `Map` 不是宿主的 `Map`，
  `v instanceof Map` 为假 ⇒ `JSON.stringify(new Map())` 就是 `"{}"` ⇒ 靠 Map 存状态的窗全被误判「没反应」。
- **解法**：一律用**鸭子类型** —— `if (x && typeof x.message === "string")`、`typeof v.size === "number" && typeof v.get === "function"`。

### 7. 桩不像真货，绿色就是假的
- **坑**：验证器里的桩按印象写，比真货「更宽松」或「更小」⇒ 被测代码和桩一起变，断言永远成立（**自证**）。
  实证：`pack.index` 真货是 Foundry `Collection`（Map 子类，有 `.size` 没有 `.length`），桩写成普通对象 ⇒
  真代码里的 `pack.folders.length` 得 `undefined` → `Math.max(0, NaN)` → **NaN**，而所有闸门全绿。
- **解法**：建桩前先**在真环境里 `Object.getPrototypeOf(x)` 看一眼**，按真货的构造器与方法写；
  桩一旦失真，**它的绿色不算数**。另外：期望值**绝不能从被测数据生成**（从被测数据生成的期望 = 自证的另一种形式）。

### 8. 「玩法做进去了」不等于「用户用得到」
- **坑**：为了响应「太复杂了」，把控件收进了一条**默认折叠**的折叠条 ⇒ 用户三个月后报「这个功能没有」。
  能力早就有，但藏在默认收起的地方 = **没有**。
  同型：界面自己写了一句「拖不进这扇窗」（用户读了、试了、报「功能没了」）—— **功能从未做过，但界面自己写了做不到，比没写更糟**。
- **解法**：用户报「没有 X」时**先 grep 确认 X 到底有没有**；确认有，那就是**可发现性**问题，不是功能问题。
  默认折叠 = 没做。承诺过的能力必须在主界面上就能看见。

### 9. 删除、覆盖、批量替换之前必须请示
- **坑**：一条 .NET zip 打包命令「先删旧包 → 再建新包」，建包失败 ⇒ **一度处于没有产物的状态**。
  一次「按文本替换」的补丁被应用两次 ⇒ 源码里多出一行一模一样的语句，**语法/名字/契约检查全都看不见**。
- **解法**：① 任何删除 / 覆盖先备份，并且**先断言备份逐字节一致才删原件**；
  ② 批量改动**先建到临时位置 → 回读校验 → 全过才 `Move` 到位**（`try/finally` 清理）；
  ③ 每个替换块**必须命中恰好 1 次**，不命中就**在写盘前 throw**（内存改完、`writeFileSync` 放最后）；
  ④ 交付前跑一次**「相邻重复行 = 0」**检查。

### 10. 我沉默的时候本来就是暂停，而且零成本
- **坑**：用户问「有没有办法定时暂停再跑」—— 他问的是**有没有这个功能**，我当成了**指令**直接开工。
  正确动作是先回答「没有 wall-clock scheduler」，然后**停下等他确认**。
  （用户原话：「我最开始问你能不能在谷价的时候跑，半个小时之后再跑，你直接就开始了，我是真一点招没有了。」）
- **解法**：用户问「有没有 X」时，那是**问题**不是**指令**：先回答有没有，再停下。
  我没有定时唤醒能力 —— 但**我沉默时不消耗任何东西**，正确说法是「你走开，回来发一句话（哪怕两个字「继续」）我就接着干」。

---

## 一 · 怎么用这份文档

**格式（每条三段，缺一段就是残条）**：

```
- 坑：<现象 / 判据 / 报错原文 —— 要能当 grep 关键词用>
  解法：<具体怎么对 —— 含确切的 API / 字段 / 命令 / 数值>
  证据：<文件:行号 或 报错原文 或 实测数字（可选，但强烈建议留）>
```

**分层**（按「这个坑在哪一层，就在哪一层防」）：

| 层 | 防它的手段 | 典型 |
|---|---|---|
| **环境层** | 先查证，再动手 | 本地源码版本 ≠ 线上版本；目录索引关着；relay 有黑名单 |
| **架构层** | 结构上不给它机会 | 一条口径一个函数；可逆的先做；缺字段的语义全模块统一 |
| **代码层** | 静态检查 + 行为验证 | 只读属性；跨 realm `instanceof`；`Number()` 的 0 |
| **流程层** | 工序本身防错 | 替换必须命中 1 次；删除先备份；交付前跑闸门 |

**检索建议**：直接对全文 `grep` 关键词（报错原文、函数名、字段名都行）。
每条都尽量保留了**确切的**路径 / 行号 / 报错字符串 —— 那是它的检索入口。

---

## 二 · 目录（按来源分章）

> 四份片段各自保留原始结构（按来源文档分章、章内按主题分组）。
> 没有按「环境层 / 架构层 / 代码层 / 流程层」重排 —— 那要逐条搬运，会漏字。

### 既有坑书 · 大篇（Aeris-Tokens 改版 / 双形态武器与活动自动化 / 强迫目标移动 / AC 加值与 DAE 条件）

来源文件：`_总典-片段1.md`（76,058 字节）

- 血的教训-Aeris-Tokens改版篇
- 血的教训-双形态武器与活动自动化篇
- 血的教训-强迫目标移动篇
- 血的教训-AC加值与DAE条件实测篇
- 本次未能确定的问题

### 既有坑书 · 架构与 UI 篇（世界同步装置 / CSS 面板配置 / 远程盲调 UI / 教学视频库优化）

来源文件：`_总典-片段2.md`（56,776 字节）

- 血的教训-世界同步装置篇
- 血的教训-CSS面板配置篇
- 血的教训-远程盲调UI篇
- 血的教训-教学视频库优化篇
- 本次未能确定的问题

### 既有坑书 · 小篇（midi-otherActivity / 之前踩过的坑 / 妄质百变腕甲 / DialogV2 / 代码审阅自检清单 / 发布校验与查证纪律 / 开工方法论 / 桥接工具链 / 第三方同步并发写 / 简单陷阱 等）

来源文件：`_总典-片段3.md`（76,549 字节）

- midi-otherActivity-源码级结论.md
- 之前踩过的坑.txt
- 制作妄质百变腕甲-踩坑与新知识.md
- 勘误与待办-otherActivity-移交另一个AI.md
- 血的教训-DialogV2弹窗选择器篇.md
- 血的教训-代码审阅自检清单篇.md
- 血的教训-发布校验与查证纪律篇.md
- 血的教训-开工方法论篇.md
- 血的教训-桥接工具链实战篇.md
- 血的教训-第三方同步模块并发写设置篇.md
- 血的教训-简单陷阱篇.md
- 本次未能确定的问题

### lh-crafting 项目专属 · 开发铁律 350 条 + 专题小节

来源文件：`_总典-片段4.md`（133,537 字节）

- 零 · 本项目线上实测结论（2026-09-18，非推测）
- 一 · 模块骨架与生命周期（1–7）
- 二 · 世界包与文件夹（8–11）
- 三 · 批量写、导入、幂等（12–21）
- 四 · 面板与前端（22–41）
- 五 · 玩家权限与 socket（42–50）
- 六 · dnd5e 物品 / 活动 / 效果结构（51–69）
- 七 · 图标与动画（70–71）
- 八 · 发布与打包（72–81）
- 九 · 本地校验与交付纪律（82–92）
- 十 · gacha-banner 可直接搬的视觉技法（零依赖）
- 十一 · 0.4.0 新踩的（93–100）
- 十二 · 0.5.0 新踩的（101–104）
- 十三 · 0.6.0 新踩的（105–113）
- 十四 · 0.7.0 新踩的（114–122）
- 【0.8.0 新增】123–129
- 0.9.0 新增（130–141）
- 1.0.0 新增（142–150）
- 151–156
- ★ 1.2.0 新增铁律（157–165）
- 166–172（2026-09-19，1.2.1「侧边栏都没了」事故后补）
- 1.3.0 新增（173–180）
- 181–184 · 事件委托与版本号（1.3.1 事故）
- 185–193 · 外观重做 / 商店模块化 / 检查器的检查器（1.4.0）
- 194–200（1.5.0 新增）
- 201–204
- 1.7.0 新增（205–210）
- 十二 · 1.9.0 新增铁律（211–217）
- 218–225（1.10.0 这轮）
- 226–238
- 1.13.2 新增铁律（250–253）
- 254–262
- 263–269
- 1.14.5 新立铁律（270–274）
- 275–283
- 284–292（1.14.8 · 三方审查这一轮）
- 293–300（1.14.9：中英双语 + 清死代码）
- 301–308（1.14.9 三方审查那一轮）
- 309–314
- 315–327（注意：315–319 的编号在原文中各出现两次、内容不同）
- 328–338
- 339–343（原文重复两套，内容不同）
- 339–350（1.15.2 / 1.15.3 两轮三方审查里学到的）
- 统计

---

<!-- 来源：血的教训-Aeris-Tokens改版篇 / 双形态武器与活动自动化篇 / 强迫目标移动篇 / AC加值与DAE条件实测篇 -->

## 血的教训-Aeris-Tokens改版篇

### 拖拽/寻路/落位主链（禁区）
- 坑：为抹掉一条多余的线去「覆盖核心尺子的内部数据」→ 用户报「拖动后移动不了了，不走」（本项目最严重回归）
  解法：看不见真机的改动只准碰显示属性（`visible` / `style.display`），且必须 `try/catch`；层级纪律 显示层 > 数据层 > 方法包装
  证据：§0-1，LH.8「一次改 18 处」后的自伤
- 坑：改第三方模块的拖拽/寻路/落位主链 —— LH.11→LH.12 的 9 处实质改动里 6 处落在主链，全部与症状相关
  解法：安全的只有「中文化显示值」「纯显示层隐藏」「独立新功能文件（`movementHistoryRuler.ts`）」三类；主链改动一律不碰
- 坑：删掉 `syncPosition()` / `syncTokenPosition()` 里 mesh 坐标写回 `document.x/y`（看着像脏写）→ 动画每帧被拉回，「走不了」
  解法：**宁可保留这处「脏写」**——核心 `_refreshPosition`（`client/canvas/placeables/token.mjs:1372-1378`）用 `document.x/y` 回写 mesh，是原版刻意为之
- 坑：`_commitDragLeftDropUpdates` options 加 `movement: {[id]:{constrainOptions:{ignoreWalls:true}}}`（S2）、`tokenPathfinder.updatePathReach` 把 `cappedHasChanged(uncap)` 改成取反（S3）、LH.16「只拦骑乘者、放坐骑走 Aeris」、`tokenPathGraphicsHandler` 的 `_prevMaskTextures` destroy（S6）——「看起来对」的改动全部把「能走」改坏
  解法：已逐处回退（S4/S3/S6 LH.17-18、LH.16 LH.17、S2 LH.18）；F3 的「异常即 `ticker.remove`/kill 自己」改为只 `console.warn`
- 坑：包 `Token.prototype._refreshRuler` 并在里面 `refresh({空})` → 覆盖核心渲染管线内部状态 → 真机「拖不动」
  解法：改用纯显示层（见下条）
- 坑：调 `Ruler#clear()` 去掉核心那条线 → 核心线**永久消失**（`#path` 只在 `draw()`（`ruler.mjs:169`）才 `addChild` 挂回，`clear()` 里 `token.layer.removeChild(this.#path)`）
  解法：不要 clear，只做显示层隐藏
- 坑：核心那条线（画 `document.movementHistory`）只在走核心移动流程时写（Token HUD 方向键 `applications/hud/token-hud.mjs:262`、角色配置表 `applications/sheets/token/token-config.mjs:225`、区域顶开 `client/documents/regions.mjs:987`），模块跳跃不写 → 是「半截旧线」
  解法：LH.10 正解（全程 try/catch）：
  ```js
  if (token?.ruler) token.ruler.visible = false;              // 出处 client/canvas/placeables/token.mjs:1274
  const el = document.getElementById(`token-ruler-${token?.id}`);  // 出处 ruler.mjs:370-387 #getLabelsElement
  if (el) el.style.display = "none";
  ```
  每帧在自有的 rAF tick 里对「正在显示自己轨迹」的 token 调一次（核心状态变化会重新置 true，下一帧再盖上）；配 client 级设置 `hideCoreTrail`（默认开）
- 坑：Esc/右键取消拖拽后该 token 拖不动（上游未修）：`_onDragLeftCancel` 只认 `event.button === 2` + 缺 return
  解法：原文未给修法（属于「还没修的上游问题」），刷新可解
- 坑：源码是「单提交仓库 + 全部改动在工作区」（`git log` 只有 `3d809cd`）⇒ 坏了**无法 git 回退**
  解法：只能逐处手工回退，或直接用 LH.11 的 zip（已知最好用基线，用户亲口确认「LH.11 是好的能移动，但悬浮丢失」）

### 记账与数字虚高
- 坑：「本回合已移动量」从不清零：`src/token/setup.ts:87/97` 的 `(c.actor as AerisToken)?.movementBudgetHandler.reset()` —— `c.actor` 是 Actor 文档，`movementBudgetHandler` 只定义在 Token 上（`src/token/aerisToken.ts:71`）→ `undefined.reset()` 抛 TypeError → `flags["aeris-tokens"].distanceMoved` 永不归零 → 用户看到「没动就已用 85 步」
  解法：改用 `combatant?.token?.object` 或遍历 `canvas.tokens.placeables` 找该 actor 的 Token 再 reset
- 坑：暂停时松手死循环 + 不落库：`src/token/animation/jumpTokenTo.ts:57-85` 外层 `while(true)`、内层 `while(this.trailQueue.length)`，`:68` 的 `break` 只跳内层 → 空转约 400ms/轮；`isJumping = false` 在 `:85` → `enqueueJumps` Promise 永不 resolve → `aerisToken.ts:336 await broadcastDragEnd(...)` 卡住
  解法：暂停时清空队列并跳出外层；`isJumping=false` 移入 `finally`
- 坑：寻路缓存判据写反：`src/token/pathfinding/tokenPathfinder.ts:158` 漏 `!`（同文件 `:127` 是对的写法）→ cap 未变时每次 pointermove 全量重算
  解法：补回 `!`
- 坑：读累计账算「已用/剩余」：`_path[0].cost = priorTurnCost`（`BacktrableMovementTrail.ts:189-207`），这本账一旦没清零就一路累加 → 「走 20 说 60」「头顶 300+」
  解法：只累加每次拖拽的增量 `const delta = Math.max(0, cLast - c0);`（`c0=path[0].cost`、`cLast=path.at(-1).cost`）；`cost` 单位是「格」，尺数 = 格数 × `canvas.scene.grid.distance`
- 坑：黑色「∞」：喂给核心尺子的 waypoint **缺 `action` 字段** → `ruler.mjs:267` 按 `displace`（位移、代价无限）算；dnd5e 标签出处 `dnd5e.mjs:67857-67863`
  解法：**干脆不借核心尺子**，自己在 `canvas.tokens._rulerPaths` 里画 `PIXI.Graphics`（照抄 `src/pixi/square/drawSquareStroke.ts:11/33-35` 的 v7 经典 API `clear()/lineStyle/moveTo/lineTo`）
- 坑：头顶数字双倍：`movementHistoryRuler.ts:1516-1518` `usedTiles = (cap?.cost ?? 0) + liveCostOf(reveal, true)` —— `cap.cost` 已含本次增量（`capture()` 挂在 `Hooks.on("updateToken")` `:1616`，拖动中每落一格跑一次），`liveCostOf` 返回的是**整条 `_path` 跨度**
  证据：真机探针（蒙德一次拖 4 格）：0/4→20、1/4→25、2/4→30、3/4→35、4/4→40、松手后 4/—→20；另有 4 条 `globalThis.__CAP` 记录 `d=1,2,3,4`、`dragKey` 恒 `"30,24"` 证明 `capture()` 触发了 4 次
  解法：判据用现成的 `dragKey`（`Capture` 接口 `:102`，`captureMain` `:637` 写入 = 本次拖拽起点格）：`cap.dragKey === dragKeyNow ? cap.cost : (cap?.cost??0) + liveCostOf(reveal,true)`；骑乘走核心拖拽时 `dragKey` 恒 `undefined`，自然落回相加
- 坑：用户两次报的数字不同（「80 尺」「70→35」）却是同一个 2×
  解法：不要被数字的具体值带偏，盯倍数
- 坑：被当成头号嫌疑的 `clearOne(id)`（`:1231-1252`，置 `cap.cost = 0`）其实无关（`drag === turn` 时账本清得很干净）
  解法：这条是**探针**排除的，不是推理排除的
- 坑：`_path` 是「用户拖到过的最远点」，不是「松手落点」（Aeris 的 `movementPath._path` 与核心约束后的真实落点可差好几格）
  解法：任何拿 `_path` 当落点的算法都要先问「被挡住了怎么办」
- 坑：四版盲改（LH.24~LH.27）全部被实测证伪：`truncatePathAtTokens(self,path)`、`captureFromCore` 截断、`cutIdx = path.findIndex(...)`、`if(!endsAtToken){}` 后再加一道 —— 全是改**判据的实现**，没人验证过判据在运行时到底取到什么值
  证据：每版都能在源码里「证明」自己对；每版都没有一行真实运行时数据；每版验证方式都是「打包→让用户装→让用户试」
  解法：见下条真根因
- 坑：真根因（数据级一行）：`src/token/aerisToken.ts` 的 `_onDragLeftDrop` 里 `jumpTokenTo.singleJump` 用 `this.token.x/y`（= mesh 位置 = `_path` 终点）去 `document.update` 落库 ⇒ updateToken 触发 `capture()` 时 token 还骑在 `_path` 终点上 ⇒ `endsAtToken` **恒为 true** ⇒ `cutIdx` 截断整段被跳过 ⇒ 拖 2 格记 25 ft
  解法：LH.29 只改一处 —— `captureMain` 里 `curTile` 改从**核心已落库**的 `token.document.movementHistory` 末点取：`canvas.grid.getOffset({x: w.x, y: w.y})`，取不到再回退 `getTopLeftTileFromToken(token)`；用户实测「正常了」
  证据：LH.28 诊断版数据 `docTile:'37,19' posTile:'37,19' cutIdx:2 deltaCut:2 deltaFull:5 endsAtDoc:false hRaw:'3700,2100@0 3700,1976@5 3700,1900@5'`
- 坑：判据跑错了**时刻**（依赖「角色现在在哪一格」，在动画型模块里踩在错误的帧上）
  解法：判据要取「与动画时序无关的量」——优先 `document.movementHistory` / `document.x/y` / `_source`，而不是 `movementPath._path` / `mesh.position` / `token.x/y`
- 坑：「累计 + 增量」的显示算式，两个量可能重叠（本次就是「累计已含本次」）
  解法：判据要给「是否已入账」这种**身份标记**（`dragKey` = 本次起点格），而不是靠「拖动中累计应该还没更新」这种**时序假设**

### 缩放漂移
- 坑：每拖一次 token 净缩小 `1/1.15`（只除了、没乘回来），跨轮次累积
  证据：`mesh.scale.x` 0.047344226724915714（文档基准 1.5）、0.1953125、0.13736263736263737 —— 精确等于 `1.15⁻²⁴·⁷` / `1.15⁻¹¹·⁷` / `1.15⁻¹⁴·²`；`scaleJumpFactor = 1.15`
  解法：缩放只存在于运行时内存（`mesh.scale`），刷新即恢复、不写文档；修法是**用绝对值还原替代比例除法**：`startPreview()` 开头把 `mesh.scale.x/y` 记为 `baseScaleX/baseScaleY`，`reset()` 用 `animatePropertyDelta(getValue,setValue, base-current, duration)` 缓动回基准，完成后 `mesh.scale.set(baseX,baseY)`；`baseScale` 为 null 时退回原版除法
- 坑：机制（`tokenPreviewPathHandler.startPreview()` 的 ticker 里 `const target = getTarget(); if (!target) return;`，而 `getTarget()` 在 `this.token.queuedPositionOffset` 为空时返回 `null` → 整帧不乘缩放；`reset()` 里 `revertScaleMultiplier` 按 `1/currentScaleMultiplier` 做除法还原；`currentScaleMultiplier` 只在 `startPreview()` 里被重置为 1）⇒ 任何「没乘却执行了 reset 除法」的轮次净除一次
  证据：真机 ROUNDTRIP `before=0.047344226724915714 → meshPreview=0.05426307318550436（csm 1 → 1.146139179773476）→ resetRet=true → meshAfter=0.0473442267249157（单次往返守恒）→ csmAfter=1.146139179773476（csm 未重置）`；LH.11 的 bundle 里 `Ko` 与 `if(!h)return null` 同样存在 ⇒ **原版 bug**
  解法：同上（绝对值还原）
- 坑：「松手不走」同一根因：`_prepareDragLeftDropUpdates` 里 `dest = queuedPositionTopLeft ?? getSnappedPosition() ?? {x:document.x,y:document.y}` —— `queuedPositionOffset` 没被设置时 dest 退化成**当前位置**，提交的就是原地
  解法：原文未给独立修法（与缩放漂移同根因）

### 显示层（标签/黑框）
- 坑：从核心、dnd5e 全库 grep `current` 找用户说的「current：walk」黑框 —— 方向完全错了（只命中 `combat.current`、`_getCurrentPage`，核心 `templates/hud/waypoint-label.hbs` 里根本没有 "current" 字样）
  解法：用户一句「关了 mod 就没了」把范围钉死在模块内；在本模块源码 grep `urrent` 命中 92 处，唯一带 `Current:` 字面量的是 `src/token/graphics/tokenPathGraphicsHandler.ts:153-155`
- 坑：为什么黑框必然被我们压住 —— `_paintLabel`（同文件 `:295-314`）最后一句 `this.token.mesh?.addChild(floatingLabel); floatingLabel.zIndex = 10000;` 是 **PIXI 画布层**；我们的标签挂在 **DOM 的 `#hud #measurement`**（`src/token/movementHistoryRuler.ts:758-778` / `:1038-1069`）⇒ **DOM 永远渲染在 canvas 之上**，与坐标偏移无关、往哪挪都会撞
  解法：`isDistanceLabelAboveTokenEnabled()`（`src/settings/gridDistance.ts:3` `ENABLE_DISTANCE_LABEL_TOKEN = "enableDistanceLabelToken"`）恒返回 `false`；设置项 name 加「（已停用）」、`default: true → false`，**保留注册项**以免动到已存在的世界设置数据；信息搬进我们的标签
- 坑：同一屏同时出现两个症状 ≠ 同源 —— 用户把「蓝线折返」和「头顶数字」写在一句话里
  解法：蓝线画的是 `movementPath.getPaintedTiles()`（`tokenPathGraphicsHandler.ts:70`），头顶数字来自 `captures` 这本账（`movementHistoryRuler.ts:142`），**两条链在代码里毫无交集**；拆开后数字当场定案；列假设要按「显示层/数据层/方法包装层」分层列，不要按用户提到的现象列
- 坑：蓝线折返（来回绕）至今未取证、未修（用户 LH.41 交付后明确「只有蓝线是折返的，还在」）
  解法：原文未给；候选嫌疑**全部未坐实不得当结论用**：`BacktrableMovementTrail.update()` 的 autoPath 分支 `this._path = path` 整条替换、`_update()` 的 `_trailSplice(back + 1)` 回退与 `isLegalStep` 合并、墙角两条等长绕行之间跳变

### 构建打包与产物验证
- 坑：`npm install` 卡在 `fvtt-types`（`github:League-of-Foundry-Developers/foundry-vtt-types#main`）带来的 `electron`，其 postinstall 下载二进制报 `RequestError: read ECONNRESET` + Windows `EPERM rmdir`（`npm-cache\_cacache\tmp\git-clone8V0QUv\node_modules\resolve`）→ 整个 install 回滚、`node_modules` 清空
  解法：`npm install --no-save --no-audit --no-fund --ignore-scripts`（`--ignore-scripts` 阻止 postinstall；esbuild/rollup 的平台包走 optionalDependencies，不依赖 postinstall）
- 坑：`vite build`（96 modules transformed）会**清空 dist** ⇒ `LICENSE.txt` 与 `README-Aeris原版.md` 消失，dist 从 28 条目掉到 26 条目（旧记录写过，本轮再次踩中）
  解法：build 后 `Copy-Item LICENSE.txt dist\` 与 `README-Aeris原版.md dist\`；改源文件必须在 `vite build` **之前**
- 坑：`Compress-Archive` 会把文件丢到 zip 根、丢失 `scripts/` 之类前缀
  解法：用 .NET API
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
  条目名用**反斜杠**（`GetEntry` 匹配也要用反斜杠）；zip 内 `module.json` 的 version 必须与源码同步
- 坑：`npx vite build` 报 `failed to load config from ...vite.config.mts` + `Error: spawn EPERM`
  解法：esbuild 必须开子进程走管道、被本机沙箱拦下 —— **这不是代码错，别去改代码**
- 坑：拿「变量名」验证改动是否进包 —— 变量名会被压缩改名（`cap.cost` → `y.cost`）
  解法：用**对象属性名与字符串字面量**计数（不会被压缩器改）：本轮 `dragKey` 5→6（LH.40 进了产物）、`autoPathKeybind` 1→0、`autoPath` 2→0（LH.41 把开关删干净了）；LH.40 新判定在 bundle @130501 的形态：``n._path, f=Array.isArray(m)?m[0]:null, b=f?`${f.j},${f.i}`:""; x=y&&b&&y.dragKey===b?y.cost:((y?.cost??0)+fn(u,!0))``
- 坑：抽验字符串凭记忆写（我搜「战斗内移动模式」，实际译文是「战斗中移动模式」）→ 白跑一轮
  解法：验证抽验字符串**必须从源码里取**
- 坑：「build 成功」不等于「改动进了包」
  解法：每次都数一遍特征串

### 部署与升级
- 坑：只按 F5 不够（模块清单在「加载世界」那一刻读入）
  解法：部署三步（每次交付都要说）：删服务器 `Data\modules\aeris-tokens` 整个文件夹 → 解压新 zip 进同名文件夹（**防双层**）→ **重进世界**
- 坑：用户说「我确定了，我装了 L19，他还是无法移动」，真机 `game.modules.get("aeris-tokens").version` 读回来是 `13.0.19-LH.12`（差 7 个版本）
  解法：**交付后必须让用户报版本号**；「用户说装了」≠「装上了」
- 坑：两版都叫 LH.22（102018 / 102055 字节）→ 既无法定位用户装的是哪版、也无法用版本号做沟通锚点
  解法：**每版必须换版本号**
- 坑：改第三方模块没做 fork 手续 → 官方更新会一键覆盖你的改动
  解法：改第三方模块 = fork：保留 LICENSE + 原作者署名 + 换名区分 + **删 manifest/download**

### 中文化与依赖守卫
- 坑：中文化时动了存储 key → 世界数据丢失
  解法：只改 `game.settings.register(MODULE_ID, KEY, {name, hint, choices})` 里的**显示文本**；`choices` 的**存储 key 保持英文**（`Tactics`/`Exploration`/`Disabled`），`game.settings.get` 的 30 余处调用点全用英文 key
  证据：世界 DB 里的值不变 → 从原版升级/装回原版都不丢值（三路盲审逐行核对 diff 确认零破坏）
- 坑：缺 lib-wrapper 时原版 `Hooks.once("init")` 第一句 `patchTokenLayer()` 无守卫地调 `libWrapper.register` → `ReferenceError` 打断整个 init 回调 → 32 个设置一个都不注册 → 核心读未注册设置会**抛错**（`client/helpers/client-settings.mjs:271` `"${id}" is not a registered game setting`）
  解法：`registerSettings()` 提到 init 第一位 + 三处 register 加守卫（libWrapper / socketlib / aerisCore），坏一个不影响其余；打包时补 try/catch，绝不裸调
- 坑：用户报「战斗里不跳了」，以为是 bug
  解法：**不是 bug** —— `moduleFunctionalityScopeInCombat` 被写成 `Disabled`，改成 `Tactics` 即好

### 探针与诊断
- 坑：`execute-js` 端点只返 `{value:true}`，结果拿不到
  解法：结果必须脚本内 `ChatMessage.create` 再 `foundry_chat_get` 读回；**被拒的脚本会在聊天里留下 `<b>⚠ REST API execute-js:</b>`（whisper 给 GM）** —— 看到这条 = 脚本根本没执行
- 坑：已知会拦：`async`/`await`、`game.settings.set`、`localStorage`；实测含 `p.control(...)` / `_initializeDragLeft` / `_onDragLeftMove` / `_prepareDragLeftDropUpdates` / `_onDragLeftDrop` / `canvas.scene.updateEmbeddedDocuments` / `parseInt` 的长脚本被拒
  解法：拆小脚本、用 `.then()` 链代替 `await`、`var s=game.settings; s.set(...)`
- 坑：反复发长探针脚本会明显增加服务器负担（用户报「我服务器卡死了」）
  解法：探针要**少发、发小、只读**
- 坑：拿探针里没出现的字段当证据去否定用户的描述 —— 我的探针只打印了名字和 `bounds`，**根本没读 `disposition`**，据此写了「这次场上没有敌人」；用户当场纠正「那个敌人的效果是 PC 啊，不是 NPC 啊」（判据是 `token.document.disposition === -1`，**与 PC/NPC 无关**）
  解法：探针字段不全时**只能说「我没测到这个」，不能说「不存在」**；判敌我必须读 `disposition`（-1 敌对 / 0 中立 / 1 友善），不能靠名字、不能靠 PC/NPC
- 坑：误读 `hRaw`：把 `3700,1976 → 3700,1900` 读成「核心把 token 拉回来了」，实际那段 `cost = 0`，是**同一格内对齐格点**
  解法：读路径数据要先看 `cost` 再下结论
- 坑：模块如果有「自带诊断出口」，我却自己造了 v3/v4/v5/v6 四个探针，**全都在猜字段名**
  解法：`movementHistoryRuler.ts:1823` 的 `movementTrailDebug()` 挂在 `src/main.ts:64-65 + :82` 的 `globalThis.aerisTokens.debugMovementTrail()`，注释原话「一次就能看到本功能的全部现场状态，不用再来回猜」，其 `记录明细` 里直接就有账本（`已用格: c.cost`、`已用尺`、`上限格`）；**动手写探针前先 grep `globalThis.` / `debug` / `window.__`**
- 坑：改版过的模块，注释就是上一轮排错的结论文档（`movementHistoryRuler.ts:623-632`（LH.30）逐字记着同一个症状「实际走 7 格 = 35 ft → 显示『本回合 85 ft』= 17 格 × 5」，连真机 CAP 序列 `delta 4/6/7`、`prevCost 0/4/10`、`newCost 4/10/17` 都在；`:585-590`、`:642-652`（LH.33）同）
  解法：**开工先通读目标文件里带「真机证据 / 铁证 / 根因」字样的注释块**
- 坑：诊断版留下的埋点修好后急着删
  解法：`pushDiag()`（`:397-406`）把每次 `capture()` 的中间值塞进 `globalThis.__CAP`（上限 200 条）—— **本次定案的关键证据（4 条 `d=1,2,3,4`）正是这些埋点给出的**；「只塞数组、不参与任何判定」的埋点保留成本近乎零
- 坑：同一症状连续两版修不好还在「再改一处」
  解法：**第三版必须是「诊断版」而不是「修复版」**——不改任何判定逻辑、只把内部中间值吐到 `window.__CAP` 之类容器，交付时明确告诉用户「这版照样是坏的，它只负责抓数据」（LH.28 就是靠这个一次定位）
- 坑：三路独立盲审报 70+ 条，核实为真只有 20 条，其中 8 条是我自己前几版改出来的；连「乱码」都可能是审阅程序读文件的**编码假象**
  解法：审阅报告必须**逐条回原文核对**，否则审阅本身变成新的污染源

### 方法论 / 用户沟通
- 坑：用户给出「A 版好 / B 版坏」时，我却在往运行时发探针、逐个验证「我加的 13 个修复各自对不对」
  解法：**第一动作必须是解压两个包做 bundle diff**；该问的是「哪一个改变了 LH.11 原本正常的行为」（LH.11 vs LH.12 逐字对比仅 9 处是实质改动，其余 42 处全是 esbuild 变量重命名）
- 坑：用户一句「地面不要多余的线啊，有多余线那版没报错爱」是决定性线索 —— 把「改动史」和「症状第一次出现在哪个版本」对齐，比读代码定位快得多（尤其在没有真机、没有用户控制台报错时）
  解法：按此办案
- 坑：失败时先怀疑「资料不对」或「用户环境特殊」
  解法：先怀疑「我没读资料」
- 坑：用户说「关了自动寻路就容易出错」，我没有任何数据能证明这个因果
  解法：**对用户的因果观察：只照做，不背书** —— 照做要求（锁死）与承认因果是两件事，必须分开说清楚，否则下一轮出问题时两边都会以为「已经验证过了」
- 坑：`autoPath` 设置改 `default: false → true` 是没用的：`scope: "client"`（每个客户端各存一份），`default` 只对「从未设置过这一项」的客户端生效，救不回已经存过 `false` 的客户端；且它带快捷键 `autoPathKeybind`（`src/settings/autoPath.ts:8-14`），`onDown` 里 `game.settings.set(MODULE_ID, AUTO_PATH, !autoPathOn)` 一键取反并写进本地存储
  解法：彻底锁死 —— 不注册设置项 + 不注册快捷键，`isAutoPathEnabled()` 恒 `return true`；保留 `registerAutoPathSetting()` 为空实现（`_registerSettings.ts:2` 的调用处一行没动），想恢复时只需还原 `autoPath.ts` 一个文件
- 坑：交付时把「推理」说成「实测」
  解法：没有用户控制台报错时，**任何「修好了」都只是推理不是实测**；交付时如实标注
- 坑：一次改 18 处 → 出问题无法二分
  解法：同一症状相关的改动单独一版，且单版只改一处

## 血的教训-双形态武器与活动自动化篇

### AA（Automated Animations 6.8.1）动画与音效
- 坑：普攻一刀打三个木桩 → 画面上**三把刀**分别砍向三个人。根因：每个目标的伤害骰都会各自触发一次 `dnd5e.rollDamageV2`；`playonDamageCore` 开启时 `activity.type == "attack"` 那个条件不成立 ⇒ 不 return ⇒ 每目标各播一次
  证据：`modules/autoanimations/dist/autoanimations.js` `Hooks.on("dnd5e.rollDamageV2", ...)`
  解法：**要「只播一次」就让它只有一个目标** —— 单体活动天然只有一次伤害骰；多目标活动（线/锥/球）必然按目标数重复，这是 AA 的机制不是配置错误
- 坑：`dnd5e.rollAttackV2` 里也有一条：`activity?.damage?.parts?.length && activity?.type != "heal" && playOnDamage` 时 return ⇒ 带伤害骰的非 heal 活动在 `playOnDamage` 开启时**攻击动画整体让位给伤害动画**，只在 `rollDamageV2` 播
  解法：知道这条才知道该在哪配（不要在 attack 阶段找动画）
- 坑：活动级 flags 压过物品级，且判定顺序是「先 `isEnabled`/`killAnim`，再 `isCustomized`」——`flags.autoanimations.isEnabled = false`（或 `killAnim: true`）**直接掐掉**这个活动的动画，不管物品级配了什么；反过来 `isCustomized: true` 只影响「选哪份配置」，**管不住开关**
  解法：命中条件靠 `isCustomized` 标记 + **名字匹配**（`rinseName` 去空格小写），**不是活动 id、也不是 `activity.type`**
  证据：AA 源码 `const activityIsEnabled = activityFlags ? !!activityFlags.killAnim ? false : activityFlags.isEnabled ?? true : true;`
- 坑：点一下「装鞘」会莫名其妙挥一刀（`postUseActivity` 对没有伤害的 utility 活动照样播动画 —— 两条 return 条件都不满足：没有 template、没有伤害骰）
  解法：给 utility 活动配 `"flags": { "autoanimations": { "isEnabled": false, "killAnim": true, "isCustomized": true } }`；备选修法是在 `description.chatFlavor` 里塞 `[noaa]` 标记，但这段文字**会显示在聊天卡上**，很丑，非必要不用
- 坑：配了 `sound` 实机没声音、控制台**不报错**；**只写 `{ "enable": false }` = 根本没配**，不是「关掉声音」的写法
  解法：sound 是完整对象，七字段缺一不可：`{ "enable": true, "file": "…", "volume": 0.85, "delay": 0, "startTime": 0, "repeat": 1, "repeatDelay": 250 }`
- 坑：视频菜单路径（`dbSection / menuType / animation / variant / color`）填错时 `validateVideoPath` 失败直接 `return false`，**同样无报错**
  解法：配路径前先验证 `Sequencer.Database.entryExists("jb2a.melee_attack.04.katana.01")` —— 命中回真实路径（可能是带后缀的 `.0`），没命中回 `false`
- 坑：`FilePicker.browse` **只回文件、不回子目录** —— 目录里还有一层时 `files` 是空的，子目录在 `r.dirs` 里；psfx 库大部分音效在 `…/<类别>/v1/` 下面
  证据：`FilePicker.browse("data", "modules/psfx/library/weapon-attacks/sword")` → `{ dirs: ["v1"], files: [] }`；再 browse 到 `…/sword/v1` 才拿到 `sword-001-00.ogg … sword-001-05.ogg`
  解法：browse 两层
- 坑：`Sequencer.Database.getAllEntries()` **不是扁平 dbPath 表**（实测只回 4 个键）
  解法：别指望它枚举整个库，用 `foundry_search_animation`
- 坑：搜 `thrust` 在动画库里**返回 0 条**（这个关键词不存在）
  解法：换词根（`spear` / `glaive`）
- 坑：落点写错位置（写物品级不写活动级或反之）
  解法：**活动级**写在各活动的 `flags.autoanimations`；**物品级**写在 `item.flags.autoanimations`（活动级压物品级）
- 坑：两个招式（蓄力斩、穿刺）的 AA 音效写成同一个 `psfx.impacts.magicaleffects.lightning.0`，用户反馈「像管子一样」；我既没试听也没做区分
  解法：**音效是主观的**——能播出声不等于好听；有条件先播给用户听，或至少不同招式用不同文件，别用一个音效糊所有招式
- 本次实测可用路径（照抄）：太刀挥砍 `jb2a.melee_attack.04.katana.01`、大剑重斩 `jb2a.greatsword.melee.standard.white`、长柄挥扫 `jb2a.glaive.melee.01.white`、能量矛突刺 `jb2a.spear.melee.fire.blue`、雷线模板 `jb2a.breath_weapons.lightning.line.blue`；音效 `modules/psfx/library/weapon-attacks/sword/v1/sword-001-00…05.ogg`、`…/spear/v1/spear-001-00…05.ogg`、`impacts/slashing/v1/…`、`impacts/bludgeoning/v1/…`、`conditions/boon/boon-001-01…006-01.ogg`、`impacts/magicaleffects/{fire,cold,necrotic,psychic,lightning}/*.ogg`

### dnd5e 活动类型
- 坑：想要「一个动作、直接命中、不掷攻击骰」却用 `attack` 活动 —— `attack` 活动的 schema 里**没有任何「自动成功」选项**：`flat: { label: "", initial: false, type: "BooleanField" }` 只是个布尔，`attack.bonus` 只能堆加值，骰子照样掷
  解法：用 `damage` 活动 —— 其真实 schema `hasAttack: false` ⇒ **「不投攻击检定」是结构保证的**
  证据：实测 `CONFIG.DND5E.activityTypes.attack.documentClass.defineSchema()`；damage schema 键表 `["_id","type","name","img","sort","activation","consumption","description","duration","effects","flags","range","target","uses","visibility","damage","useConditionText","useConditionReason","effectConditionText","macroData","ignoreTraits","midiProperties","isOverTimeFlag","overTimeProperties"]` + `hasConsumption: true` / `hasMidiProps: true`
- 坑：试图「改活动类型」（把 `attack` 改成 `damage`）—— `ActivitiesField extends MappingField`，包的元素是固定的 `ActivityField`，落到 `TypedObjectField._updateDiff` 时用 `this.element._updateDiff(...)`，**按固定 element 走、没有按 `type` 分派**；dnd5e 的 UI 也**没有**「更改活动类型」这个入口
  解法：**新建一个目标类型的活动**，把旧的隐藏或删掉；隐藏的标准姿势是 `"midiProperties": { "automationOnly": true }`（不进「选择活动」弹窗、不能手动掷，但数据还在、改回 `false` 即复活，**比直接删安全得多**）
- 坑：一次写全新活动的所有字段 → 踩「默认值陷阱」
  解法：只给最小壳 `{ "system": { "activities": { "dnd5eactivity400": { "type": "damage", "name": "蓄力斩" } } } }`，dnd5e 会用默认值填满 schema，**然后读回 `toObject()` 看真实结构再配**；实测读回拿到 `"consumption": { "scaling": { "allowed": false }, "spellSlot": true, "targets": [] }` / `"range": { "units": "self", "override": false }` / `"midiProperties": { "otherActivityCompatible": true, ... }` —— ⚠️ **默认 `consumption.spellSlot: true`**，不关掉这个活动会**吃法术位**
- 坑：以为 `damage` 活动自带的 `ignoreTraits`（`{idi,idr,idv,ida,idm}` 布尔，dnd5e DataModel 层）和 midi 那层是同一个
  解法：**两处都得写** —— `"ignoreTraits": { "idi": true, "idr": true, "idv": false, "ida": false, "idm": false }` + `"midiProperties": { "ignoreTraits": ["idr", "idi"] }`

### midi（附赠动作 / 次数池 / ignoreTraits）
- 坑：`"midiProperties": { "ignoreTraits": { "idr": true, "idi": true } }` 写成布尔对象会被**静默清空**（`foundry_diff` 报「未落库（读回 undefined）」，**不报错**）
  证据：schema 探针 `ignoreTraitsSchema: "SetField"` / `ignoreTraitsElement: "StringField"` / `ignoreTraitsValue: {}`
  解法：正确写法是字符串数组 `"midiProperties": { "ignoreTraits": ["idr", "idi"] }`；四类前缀（出处 `midi-qol/Changelog.md` L725-731）`idi`=免疫 / `idr`=抗性 / `idv`=易伤 / `ida`=吸收，支持单词根粒度 `idi.fire` / `idr.cold`
- 坑：读 `SetField` 时 `JSON.stringify(ignoreTraits)` = `{}`，**看起来像被清空了**
  解法：**读 SetField 必须 `Array.from()`** —— `Object.prototype.toString.call(raw)` → `"[object Set]"`、`Array.from(raw)` → `["idr","idi"]`
- 坑：midi 的附赠动作**不会**自动记账 —— `needsBonusActionCheck(actor)` 依赖 `configSettings.enforceBonusActions === "all"` 或 `=== actor.type`；世界实测 `enforceBonusActions: "displayOnly"`（两条都不匹配）⇒ `needsBonusActionCheck` = false ⇒ 外层 `if` 整块跳过 ⇒ `workflow.itemUsesBonusAction` **恒为 false** ⇒ `setBonusActionUsed` 永远不会被自动调用
  证据：`modules/midi-qol/midi-qol.js` `function needsBonusActionCheck(actor) {...}` / `if ((usage.workflow.itemUsesBonusAction || ...) && this.actor && !hasUsedBonusAction(this.actor)) await setBonusActionUsed(this.actor);`
  解法：**手写调用是生效的** —— `setBonusActionUsed` 自己的门闸更宽（`if (!["all", "displayOnly"].includes(configSettings.enforceBonusActions) && configSettings.enforceBonusActions !== actor.type) return;`，`"displayOnly"` 在允许列表里）⇒ `displayOnly` = 「允许记录，但不自动触发、也不拦截」
- 坑：硬条件 `this.actor?.inCombat` —— **战斗外根本没有「轮」，也就没有附赠动作记账**
  解法：见「战斗外锁死」条
- 坑：`enforceBonusActions` **不是独立注册的设置项**（1998 个已注册项里搜不到）
  解法：它打包在 ConfigSettings 里：`game.settings.get("midi-qol", "ConfigSettings").enforceBonusActions`
- 坑：「一轮一次」靠世界设置/写代码 → 不牢
  解法：用 dnd5e 原生活动次数 + 消耗，**不依赖任何世界设置、不写一行代码**：
  ```json
  "uses": { "max": "1", "spent": 0, "recovery": [{ "period": "turnStart", "type": "recoverAll" }] },
  "consumption": { "spellSlot": false, "targets": [{ "type": "activityUses", "value": "1", "target": "", "scaling": { "mode": "", "formula": "" } }] }
  ```
  `consumption.targets[].type` 6 键全集（`config.mjs` L1117-1160）：`activityUses` / `itemUses` / `material` / `hitDice` / `spellSlots` / `attribute`
- 坑：池子不足时以为会静默失败或扣成负数
  解法：**抛 `ConsumptionError`，阻止这次使用并弹警告 —— 不静默、也不会扣成负数**，这是**强制**不是提示
- 坑：**配了 `uses` 但没配对应 `consumption` = 完全没有约束**（「追刃」白写了好几轮：它有 `uses:{max:"1", recovery: turnStart}` 但 `consumption.targets` 是空的，**从没被消耗过**，等于装饰）
  解法：两处必须配对写
- 坑：**战斗外会锁死**：`turnStart` 只在战斗内触发，战斗外用了不恢复，用一次就废
  解法：在物品宏开头补一段「不在战斗中就把活动次数清零」（**在使用动作之前生效**）：
  ```js
  if ( !game.combat ) {
    const own = wf.item;
    if ( own ) {
      const upd = {};
      for ( const a of (own.system.activities?.contents ?? []) ) {
        if ( (a.uses?.spent ?? 0) > 0 ) upd[`system.activities.${a.id}.uses.spent`] = 0;
      }
      if ( !foundry.utils.isEmpty(upd) ) await own.update(upd);
    }
  }
  ```
- 坑：拿**名字**推**语义** —— 看到 `activation.type: "bonus"` 和 `setBonusActionUsed` 这两个名字，就下结论「附赠动作由 dnd5e/midi 原生记账，我手写的那句多余」，并据此**删掉了手写记账**
  解法：**凡是「谁在什么时候调用谁」这类问题，只能读调用点源码，不能看名字**

### 物品宏
- 坑：物品宏只写一处 → 静默不触发
  解法：**三件套必须三处同写**：
  ```js
  flags["midi-qol"].onUseMacroName = "[postActiveEffects]ItemMacro"
  flags.itemacro.macro = { name, type: "script", scope: "global", command }
  flags.dae.macro      = { name, type: "script", scope: "global", command }
  ```
  ⚠️ **别自己拼 `"[pass]ItemMacro"` 串** —— AE 级那种逗号式写法在 midi 13.0.55 实测不触发
- 坑：宏体里不知道有哪些可用变量 / 怎么分流
  解法：可用 `workflow`、`rolledActivity`、`item`、`token`、`actor`、`game`、`MidiQOL`；常用判据是按活动名分流：
  ```js
  const act = wf.activity ?? ((typeof rolledActivity !== "undefined") ? rolledActivity : null);
  if (act?.name !== "装鞘") return;
  ```
- 坑：把「装鞘/拔鞘」做成**世界宏**（宏侧边栏里点）→ 玩家得跑去找宏侧边栏，跟武器是脱节的；而且活动类型写成 `activation.type: "bonus"` 后，动作类型本身就是宣告，世界宏反而绕远了
  解法：改成**刀上的行为** —— 给两把刀各加一个 `utility` 活动（`装鞘`/`拔鞘`，`activation.type: "bonus"`），物品宏在 `postActiveEffects` 里按活动名分流做事
- 坑：utility 活动写了 `useFlavor` 字段没反应
  解法：**utility 活动没有 `useFlavor` 字段**，风味文案走 `description.chatFlavor`
- 坑：宏里同步删掉自己所在的物品（跑在 `postActiveEffects`，workflow 还没走完 —— 聊天卡等），后续步骤可能拿到已删除的文档
  解法：把删建推迟出去 `setTimeout(run, 250)`；⚠️ `250ms` 这个延迟**未实测**够不够，只是经验值；切换时搬运 `data.system.uses.spent`（残心）与 `attuned`，`delete data._id` / `delete data.folder`，`data.system.equipped = true`，用 `deleteEmbeddedDocuments("Item", held.map(i=>i.id))` + `createEmbeddedDocuments("Item", [data])`
- 坑：宏里写死 `if ( held.length > 1 ) return ui.notifications.error("身上同时存在两种形态，请先手动删掉多余的那把。");` —— **用户身上正常就是两把**（他把两个形态都拖到角色卡上）⇒ 宏每次直接罢工，用户看到的是「功能怎么没有了」
  解法：**用 `equipped` 判定当前形态，多余的照删，不要报错**：`const cur = held.find(i => i.system.equipped) ?? held[0];`
- 坑：把**用户的实际状态**当成异常
  解法：**判据要写成「处理所有情况」，不是「把不符合预期的输入当错误弹回去」**

### 位移与碰撞
- 坑：`MidiQOL.moveToken(tokenRef, newCenter, options, legacyOptions)` 第三参传 boolean —— **自 13.0.56 起 deprecated**（会 `foundry.utils.logCompatibilityWarning`）
  解法：新写法是对象 `{ animate, teleport, ignoreWalls, ignoreTokens }`
- 坑：以为 `newCenter` 还要自己减 `w/2`
  解法：**`newCenter` 就是 token 中心**，内部自己 `-w/2`，别再减一次；midi 自动吸附格中心（`canvas.grid.getSnappedPoint(data.newCenter, { mode: CONST.GRID_SNAPPING_MODES.CENTER })`）；`ignoreCost: true` ⇒ 不扣移动力
- 坑：想做「穿到敌人身后」却一步都过不去 —— `ignoreTokens` **默认 `false`**，会挡住「穿过敌人所在格子」
  解法：显式 `ignoreTokens: true`
- 坑：拿 `moveTokenAwayFromPoint` 做突进 —— 它是「把 token **推离某点**」，施法者在敌人前面时方向是**反的**
  解法：突进不要用它
- 坑：V13 里 `canvas.walls.checkCollision` = **`undefined`**（已移除）
  解法：正确 API `CONFIG.Canvas.polygonBackends.move.testCollision(origin, destination, { mode = "all", ...config })`；`CONFIG.Canvas.polygonBackends` 键 `sight / light / darkness / sound / move / aura`
- 坑：不传 `type` 直接抛 `Error: A valid wall restriction type is required for testCollision.`
  解法：**必须传 `type`**（`CONST.WALL_RESTRICTION_TYPES = ["light","sight","sound","move"]`）
- 坑：★ **空数组在 JS 里是 truthy** —— `testCollision` 返回的是**碰撞点数组**不是布尔，`blocked = backend.testCollision(a,b,{type:"move"})` ⇒ `[]` 是 truthy ⇒ **永远判定撞墙，一步不走**
  解法：`const hitList = backend.testCollision(a, b, { type: "move" }); blocked = Array.isArray(hitList) ? hitList.length > 0 : !!hitList;`

### 探针与方法论
- 坑：靠翻文档/猜键名确定字段类型
  解法：**三种真相源按可靠性排序** —— ① 运行时 schema 探针 `act.constructor.defineSchema().fields`（本次靠它拿下 `ignoreTraits` 是 `SetField<StringField>`、`damage` 活动 `hasAttack: false`、`attack.flat` 只是 `BooleanField`）② `activity.labels.damages[].formula`（dnd5e 自己算出来的最终伤害）③ 源码原文（行为类问题只能读源码，文档和名字都靠不住）
- 坑：根据「`斩` 的 `damage.parts` 是 `[1d8]` 且 `includeBase: true`」**推断**它会是 2d8，还准备去「修」——实测 `labels.damages` 是 **1d8**，推断错了；追刃原本算出 **2d10**（翻倍），把 `damage.parts` 清空后才回到 1d10
  解法：**先查标签，再动手**
- 坑：探针「看一个值再决定下一个」
  解法：`foundry_execute_js` 一次把**所有可疑字段**读出来；读活动要连 **`toObject()`** 一起读，光看文档对象拿不到 `_source` 里的默认值全貌；**按名字/类型推语义是最容易翻车的地方**
- 坑：relay 的 forbidden-patterns 是**纯正则扫全文**，24 条黑名单写在注释、字符串、变量名里一样会被拒，报错**不告诉你是哪个词**（只说 `Script contains forbidden patterns`）
  解法：躲法表 —— `game.settings.settings` 被 `game.settings.set` 拦 → `const S = game["settings"];`；`apiKeys` 变量名 → 换名；任何含 `Proxy` 的单词 → 换名；`import(` → 换写法；其他易踩 `localStorage` / `document.cookie` / `eval(` / `atob(` / `btoa(` / `crypto.` / `Intl.` / `postMessage(` / `Function(` / `globalThis` / `Reflect.`
- 坑：`foundry_create_entity` 建宏被拦：`HTTP 400：Macro creation is disabled in REST API module settings. A GM must enable 'Allow Macro Creation/Editing' to allow this.`
  解法：设置键 **`foundry-rest-api.allowMacroWrite`**（world 级，默认 `false`）；路径：游戏内齿轮 → 模块设置 → **Foundry REST API**（同组还有 `allowMacroExecute` / `allowExecuteJs` / `codeExecutionPermission`）
- 坑：`foundry_file_system` 读 `Sequencer` / `FilePicker` 目录时 `source` 传 `modules`
  解法：合法值是 **`data`**
- 坑：破坏性替换（「蓄力斩」要从 `attack` 改成 `damage`）直接删旧建新 → 可能出现「旧的删了、新的没建对」的中间状态
  解法：**先立后破** —— 先建新的 `damage` 活动 → 实测通过 → 再按用户同意删掉旧的 `attack` 活动
- 坑：同一症状第二次没修好还在出修复版（这一轮连出 5 个修复版，前 4 个都在**换判据猜**：任意子串 → 只留句首 → 完整名+排除同名（写错成恒假）→ 换 `d.name`（把键搞错位））
  解法：**规则：同一症状第二次没修好，第三次必须是诊断版 —— 只打数据、不改逻辑**；第 5 次停下来改成只读探针，一次就拿到决定性证据 `actor: "唯死之舞 维瑞莎 Vressa" item: "回旋斩 Spinning Flourish" actName: "" tpl: radius|10`

### effects 读回陷阱与批量写
- 坑：★ `a._source.effects` 是**不刷新的假读回** —— 给 49 条模板物品的活动写 `effects` 引用后复核 `Array.from(a.effects).map(x=>x._id)` → `[]`、`a._source.effects` → `[]`，于是判断「一条都没落库」，接着试了 **5 种写法**全部零报错零生效（① `it.updateDocuments([{_id, ["system.activities."+aid+".effects"]:[{_id:eid}]}])` ② 嵌套对象 ③ `a.update({effects:[{_id:eid}]})` ④ `a.update(..., {diff:false})` ⑤ 带 `level: {}` 的嵌套）
  解法：**数据一直都在** —— 改用 REST 工具读同一条路径 `foundry_inspect{ uuid:"Item.vhzp4HDwE8uZWg8L", paths:["system.activities.pMTboj7vsn78mGqD.effects"] }` → `[{ "_id": "tplfx00000000002", "level": {}, "onSave": false }]`；页内用 `it.toObject().system.activities[aid].effects` 复核 **49/49 条物品、54/54 个活动链接全在**，`orphanRefs: []`；`preUpdateItem` hook 快照也证明载荷完全正确
  权威读法排序：`it.toObject().system.activities[aid].effects` ✅ / REST `foundry_inspect{paths:["system.activities.<aid>.effects"]}` ✅ / `Array.from(a.effects).map(x=>x._id)` ❌（`_id` 被隐藏）/ `a._source.effects` ❌（**不刷新**）
- 坑：活动文档 `a.update()` 只对部分字段生效 —— 实测 `a.update({name:"诊断改名"})` 后 `a.name` 仍是「豁免」、`a.update({sort:77})` 后 `a.sort` 仍是 0、`a.update({effects:[{_id}]})` ✅ 有效（用 `toObject` 才看得见）
  解法：改活动**名字/sort** 用 `a.update()` 无效；**别拿「改名成不成功」去判断「活动 update 通不通」** —— 本次就是被这条带偏了一整轮
- 坑：★ `Item.updateDocuments` 传 `effects: [...]` 是**按 `_id` 合并，删不掉元素** —— 想删 51 个多余 AE，写 `const keep = effs.filter(e=>!shouldDelete(e)); ups.push({_id: it.id, effects: keep}); await Item.updateDocuments(ups);` 返回 `wroteBack: 187` 无报错，读回 `oldBatchLeft: 58` —— 一个都没删掉，而同一批里的「新增」却生效了
  根因：`effects` 是 **EmbeddedCollection**，`update` 走嵌入式文档 merge-by-`_id` 语义（列表里出现的按 `_id` 更新、没出现的**一律不动**），跟普通 `ArrayField`（整体替换）不是一回事
  解法：`await it.deleteEmbeddedDocuments("ActiveEffect", ["id1", "id2"]);`；批量技巧：每条物品一次调用、**8 条并发** + 每批 `await sleep(120)`（避免逐条 await 拖死 relay），实测 **42 条物品 / 51 个 AE 一次跑完，`errors: []`**，`oldBatchLeft: 58 → 7`
  自检句：批量「改」生效、批量「删」没生效 —— **别怀疑 relay，先怀疑这个集合是不是嵌入式文档集合**
- 坑：批量建东西时批次不可区分 → 事后无法精确回滚（上一批 58 个里有 **45 个的活动链接是空的**死数据、13 个是活的其中还有 1 条挂反的）
  解法：**给批次留可区分的前缀/id 段** —— `tplfx` + `padStart(11,"0")` 分段：`tplfx00000000001`~`…058`（58）/ `tplfx00000000100`~`…333`（234）/ `tplfx00000000400`+（5）；判据一行 `const seqOf = (id) => parseInt(String(id).slice(5), 10); const isOld = seqOf(e._id) < 100;`；**任何跨轮次的批量写都先分配互不重叠的 id 段**（名字会重名、会改）
- 坑：★ 跨批删除 AE 会留下**悬空的活动级引用** —— 本批开头核验 `badLink: 49`：上一批用 `deleteEmbeddedDocuments` 删掉 51 个旧 AE，但活动级 `system.activities.<aid>.effects[]` 里**仍指着那些已删的 `_id`**（`deleteEmbeddedDocuments` 只删效果本身，不会回头改引用它的活动）
  解法：清扫写法
  ```js
  const effIds = new Set((it.toObject().effects || []).map(e => e._id));
  for (const aid of Object.keys(o.system.activities || {})) {
    const arr = o.system.activities[aid].effects || [];
    const keep = arr.filter(l => effIds.has(l._id));
    if (keep.length !== arr.length) ups.push({ _id: it.id, ["system.activities." + aid + ".effects"]: keep });
  }
  ```
  实测 **42 条**物品需要清扫，清完 `badLink: 0` / `orphanEffects: 0`；**每批删过 AE 之后必须跑「活动引用 × 现存效果」双向核对**
- 坑：清扫时「顺手补一条引用」—— 我先删了悬空引用（对），又**自作主张把现存的 `tplfx00000000103` 补挂到那个活动上**（错）：103 早已被 `dnd5eactivity000` 和 `L3strMR8qXM4yuH5` 正确引用，补挂会让一个不该施加「失能」的活动也施加它
  解法：**清扫只做减法，不做加法**；要加引用必须有明确依据（已改回 `effects: []`）
- 坑：`toObject()` 里 `{}` 的活动 = 类型没解析出来 —— `冰墙` 的三个活动 `L3strMR8qXM4yuH5` / `s7wufcXaACA4cGUP` / `QIRvcvREJcXiAV9w` 的 `name`/`type`/`activation` 全为 `undefined`
  解法：**活动 id 不是 `dnd5eactivityN` 形式的**，就可能是「dnd5e 不认识的类型」或历史残留；遇到这种别当成正常活动改，**先查明来源**

### 状态自动化的语义方向
- 坑：★ 判断「是否施加状态」时句子只按 `。`/`；` 切 → `扫尾 · 圆形 15 尺` 该挂 `prone` 却一直判成「免疫」被排除。原文「…失败受到等同于尾击的伤害，被推离 10 尺并倒地**，** 成功受到一半伤害且**不会**被推离或倒地。」整句只被切成 1 段，**同时含「倒地」和「不会倒地」**，否定词一命中就把整条否掉
  解法：按 `。；，、` **全切**取「细句」：
  ```js
  const fine = (s, i) => {
    let a = i; while (a > 0 && !/[。；，、]/.test(s[a - 1])) a--;
    let b = i; while (b < s.length && !/[。；，、]/.test(s[b])) b++;
    return s.slice(a, b);
  };
  if (NEG.test(fine(d, idx))) continue;
  ```
  改细切分后假阴性从 **18 条 → 4 条**（`镶嵌`/`路障冲锋`/`暴君冲锋`/`更伟大的利益`），补齐后归零；**中文里逗号也是分句边界**，5e 的「豁免失败…，豁免成功则不会…」几乎全是这个结构
- 坑：★★「不会陷入 X / 免疫 X」是**反向语义**，盲挂 AE 就是挂反 —— `鼓舞 · 圆形 120 尺` 原文「受鼓舞生物**不会**陷入魅惑或恐慌」，是**免疫**特性，上一批却给目标挂了 `charmed` + `frightened` 两个 AE
  解法：否定词表 `/(不会陷入|不会|免疫|免受|不受|除非|若已|已然|以此方式)/` **必须与状态词落在同一细句内**才生效
- 坑：真要表达「免疫魅惑/恐慌」用 `statuses:[...]`（那是**施加**）
  解法：应写 `changes` 去改 dnd5e 的条件免疫字段 —— 本次**未做**，只把错的删了，属于待办
- 坑：「不会陷入 X」不等于「免疫 X」—— 同一批 4 条看似相同的句子只有 1 条是真免疫，光靠「免疫/不受/不会陷入」关键词会做出 **4 条错 3 条**
  解法：四分类表 —— ①「受鼓舞生物**不会**陷入魅惑或恐慌」（效应持续 N）→ 持续期间免疫 ✓ 做 `ci` ②「豁免**成功**，则……不会陷入中毒状态」→ 一次性豁免结果 ✗ ③「成功则伤害减半且**不受**减速」✗ ④「24 小时内免疫该**幽魂的恐惧面容**」→ 免疫某个能力不是状态 ✗
- 坑：「没有状态可挂」不等于「没做自动化」—— 给「自中心」7 条补自动化时，`雷霆步`（传送 + 3d10 雷鸣范围伤害）、`引导神力：黎明曙光`（dispel + damage）、`引导神力`（总条目「各种魔法效应」）三条没有状态
  解法：**三条空着是对的，硬编一个状态就是编造**（用户先前明确否过「我们自己额外写一个」）；交付时必须**说明为什么空着**，而不是默默留空

### 条件免疫与交付自检
- 坑：条件免疫（ci）的 key 与 mode 写错
  解法：`actor.system.traits.ci` 运行时 keys = `["value","custom"]`，**`value` 是 `Set`**（活样本「三面傀 Tri-Mode Turret」= charmed/frightened/paralyzed/petrified/poisoned）；给物品/特性挂「免疫某状态」的 AE：
  ```js
  {
    name: "免疫魅惑", type: "base", transfer: false, disabled: false,
    statuses: [],                       // ← 免疫不是「获得状态」，statuses 必须留空
    changes: [{ key: "system.traits.ci.value", mode: 2, value: "charmed", priority: 20 }]
  }
  ```
  **`mode: 2`（ADD）会加进 Set**（实测 5 项 → 6 项 ✓）；**`mode: 5`（OVERRIDE）会替换整个 Set**（只剩你写的那个）—— **危险，禁用**；删 AE 后**完全还原** ✓；⚠️ 未实测「一个 AE 挂两个 changes 同加到同一 Set」⇒ 稳妥做法是**两个独立 AE、各 1 change**（本批「鼓舞」= `免疫魅惑` + `免疫恐慌` 两条）
- 坑：交付前没查死数据/重复/方向
  解法：**交付前必须查三件事** —— ① 死数据：每个 AE 的 `_id` 是否出现在**任一活动**的 `effects[]` 里（`transfer:false` 的物品级 AE **没有活动链接就永远不会被施加**，`deadEffects` 必须为 0）② 批次重复：同一物品上有没有两个 AE 挂同一个 `statuses` 值（本次查出 48 个）③ 语义方向（否定词与状态词是否同句）；权威读法 `it.toObject().effects` / `it.toObject().system.activities[aid].effects`，**不要用 `a._source.effects`**

### 描述文本替换（模板库）
- 坑：批量改名前不查重 —— 模板库里已有中文 `火焰吐息 · 锥形 30 尺`，我把英文来源的 `Fire Breath · 锥形 30 尺` 改名成同一个中文名 ⇒ **库里出现两条同名**
  解法：**改名前先查「目标名是否已存在」**；更深一层：那两条英文条目本来就是重复品（同 30 尺锥形吐息、同 DC、同骰数），建库时 `canon()` 没能把 `Fire Breath` 并入 `火焰吐息` ⇒ 中英混编的源里**归并要中英同义表，只做字符串 canon 不够**
- 坑：批量替换代词后留下病句 `该[[lookup @name]]{它}` → 渲染成「该战士」
  解法：**只扫 `该` 这一类**（`从…`/`向…`/`对…`/`为…`/`于…` + lookup 是通顺的）；本次 48 处 `[修饰词]+lookup` 候选里真病句只有 **29 处**
- 坑：源数据的「重复段」按句号切 → 切不干净（35 条模板描述里，完整句后面跟着一段**缺 DC、缺伤害的残次副本**，源自 5etools 的双段落结构）
  解法：按 **HTML 位置**截断 —— 把 `[[lookup @name]]{X}` 归一成**单字符占位符**，在归一后的纯文本上找「开头 16 字第二次出现」，再映射回 HTML 下标：
  ```js
  function buildPlain(html) {   // 返回 {plain, map}：map[i] = plain[i] 在 html 里的下标
    let plain = "", map = [], i = 0;
    while (i < html.length) {
      if (html[i] === "<") { const j = html.indexOf(">", i); i = (j < 0 ? html.length : j + 1); continue; }
      LKRE.lastIndex = i; const m = LKRE.exec(html);
      if (m && m.index === i) { plain += "¤"; map.push(i); i = m.index + m[0].length; continue; }
      plain += html[i]; map.push(i); i++;
    }
    return { plain, map };
  }
  // 命中条件：plain.indexOf(plain.slice(0,16), 16) >= 20
  ```
  **不先归一 `[[lookup @name]]` 就会误判** —— 每个占位符都含相同的 19 字符前缀（`[[lookup @name]]{它}`），`indexOf` 会到处命中
- 坑：★ **两个「名字」被混成一个** —— 去重键里的「招式名」（活动名；活动名为空时回退**物品名**）vs 描述里要替换的宿主名（**演员 Actor 名**）。我写成 `for (const it of d.items) walk(it.name, ...)`（❌ 把物品名当怪名）⇒「霸王龙」的扫尾特性宿主被记成「扫尾」自己，`h !== moveName` 把所有条目挡掉，一条都换不出去；改成 `walk(d.name, ...)` 后**去重键又整个错位**（479 → 83 条命中），因为**很多活动的名字是空串**（实测 `actName: ""`：actor `唯死之舞 维瑞莎 Vressa` / item `回旋斩 Spinning Flourish`）→ 回退到了演员名
  解法：两个名字**分别传参**：
  ```js
  const walk = (itemName, hostName, acts, desc) => {
    const raw = strip(a.name || "") || strip(itemName).split(/[（(]/)[0].trim();  // 键用物品名回退
    const key = normName(raw) + "|" + t.type + "|" + t.size + t.units;
    SRC[key] = { move: normName(raw), host: strip(hostName || itemName), desc };  // 替换用演员名
  };
  for (const d of idx.contents) {
    if (d.items?.length) { for (const it of d.items) walk(it.name, d.name, ...); }  // d.name = 演员名
    else walk(d.name, null, ...);                                                   // 顶层 Item：自己就是宿主
  }
  ```
  **一个变量同时承担「查询键」和「替换目标」两种语义时，它一定会错**
- 坑：写出了**恒假条件** —— `if (h.length >= 2 && h !== moveName && h !== src.hostName && s.includes(h)) ref = h;` 中 `h` 来自 `src.host`、`src.hostName` 由同一个字符串算出 ⇒ **`h !== src.hostName` 永远为 false**，`ref` 恒为 null，一条都替换不了；当时读回 `refFull: 3`，那 3 条只是纯英文宿主名让 `normName()` 返回 `null` 才漏过去 —— **这个「3」本身就是条件写错的自证**
  解法：**写完判据先问一句「这个条件有没有可能为真」**；两个由同源构造出的值做不相等比较，永远是恒假
- 坑：演员名是「中文名 英文名」，按**完整演员名**去 `includes()` **一条都匹配不上**（描述里写「维瑞莎」/「霸王龙」/「欧吕尔」，数据里是 `唯死之舞 维瑞莎 Vressa` / `霸王龙 Tyrannosaurus Rex` / `欧吕尔 Auril`）
  解法：取演员名里的**中文片段**（`/[\u4e00-\u9fa5]{3,}/g`），按长度降序命中第一个就替换：
  ```js
  const full = hostRaw.replace(/[\s·]+/g, "");
  if (full !== moveName && s.includes(full)) s = s.split(full).join(LK);
  else {
    const runs = (hostRaw.match(/[\u4e00-\u9fa5]{3,}/g) || [])
      .filter(r => r !== moveName).sort((a, b) => b.length - a.length);
    for (const r of runs) { if (s.includes(r)) { s = s.split(r).join(LK); break; } }
  }
  ```
  两个约束**必须**：① 只取 **≥3 字**的中文片段（2 字片段正是「高速**旋转**自身」「高温**蒸汽**喷出」被吃成病句的来源）② `!== moveName`（宿主名与招式同名时，「用一次**扫尾**将」会被吃成「用一次**[它]**将」）
  效果对比（同一批 479 条）：任意位置子串（≥2 字）→ 多命中但**有病句**；仅完整演员名 → 成功替换 15；**中文片段 ≥3 字 + 排除同名 → 命中 479 / 成功替换 86 / 无病句**
- 坑：找不到根因时连出 5 个修复版换判据猜
  解法：**同一症状第二次没修好，第三次必须是诊断版**（第 5 次改成只读探针，一次拿到 `actName: ""`，直接解释「为什么换成 d.name 之后命中从 479 掉到 83」）；我遵守得晚了三步，多烧了两轮

### midi 键名查证
- 坑：用户世界里 `flags.midi-qol.advantage*` 样本为 **0**，按铁律不许猜键名
  解法：查权威出处 `模块文档/midi-qol/FLAGS.md`（L395-466）——`advantage.all`（所有 d20 检定）/ `.ability.all` / `.save.all` / `.save.{ability}` / `.check.{ability}` / `.skill.{skill}` / `.attack.all` / `.attack.{attackType}` / `.concentration` / **`.deathSave`**（原生替代 `system.attributes.death.roll.mode = 1`）；全部是 **BooleanFormula / Evaluated** 字段，写 `mode: 0`（CUSTOM）+ `value: "1"` ✓；文档 L70：advantage / disadvantage / noAdvantage / noDisadvantage / fail / success / critical / noCritical / fumble / noFumble / grants / magicResistance / magicVulnerability **整类**都是 BooleanFormula；L450：`advantage.ability.check.dex` 会同时作用于所有敏捷系技能（体操/巧手/隐匿）

### 效果显示与删库前验证
- 坑：★ 效果名显示成 `MonksLittleDetails.StatusSlowed` 是**模块没中文翻译** —— 建 AE 时直接抄 `CONFIG.statusEffects[].name`，卡面上就会显示这串键名
  证据：`frightened`→恐慌 ✓ / `prone`→倒地 ✓ / `charmed`→魅惑 ✓ / **`slowed`→`MonksLittleDetails.StatusSlowed`** ✗ / **`turned`→`MonksLittleDetails.StatusTurned`** ✗ / **`dazed`→`Dazed`** ✗
  解法：**AE 的 `name` 单独手写中文**（减速 / 驱散 / 眩晕），`statuses` 仍填真 statusId，图标仍从 `CONFIG.statusEffects[].icon` 取；这不影响状态本身的功能，纯显示层
- 坑：★ 删库前不验证「同名命中」的来源 → 会把**用户自制招式当标准法术删掉**
  解法：先扫出候选、**逐条打印命中的包名与原名列**：
  ```js
  const packs = ["dnd5e.spells","dnd5e.spells24","dnd5e_classpack.spell",
                 "dnd5e_collection_2024.phb-content","drakkenheim-core.spells"];
  const map = {};
  for (const pid of packs) { const p = game.packs.get(pid); if (!p) continue;
    const idx = await p.getIndex();
    for (const d of idx.contents) { const k = strip(d.name).toLowerCase(); (map[k]=map[k]||[]).push(pid+" :: "+d.name); } }
  ```
  本批 19 条候选**全中**、无一是误判（`雾凇霜缚 Rime's Binding Ice`/`雷霆步Thunder Step`/`冰刃 Ice Knife` 只在 `dnd5e_classpack.spell`；`妄能爆破` 只在 `drakkenheim-core.spells`）；附带查出库里有**两个 id 同名**的 `纠缠术 · 矩形 20 尺`（真重复）
- 坑：同名不同物 ≠ 重复 —— 核验报 `duplicateNames: ["回旋斩 · 圆形 10 尺"]`，拉出两条一比（`sbZsAeMIg2tGF0bM`：充能 5-6 · DC 15 敏捷 · 4d6 挥砍 + 2d6 心灵 · `radius:10` · 描述用「她」（丝线傀儡）；`iW3gfMFcNGqkx8GV`：DC 14 敏捷 · 2d6 挥砍 + 1d6 暗蚀 · `circle:10` · 骑士黯刃巨剑）⇒ 同名、不同内容、不同来源
  解法：判断「是不是重复」**必须比内容**，不能只看名字；**不要删也不要自动改名**，改名要问用户（同一批里真重复的才该删）

### 成品形态（可照抄）
- 太刀 `Item.bUSHpGmJ9xYXYM1i`（`attunement: "required"`）：`pnO86vExH2C3L527` 斩(attack/action/—/继承物品级) / `dnd5eactivity400` 蓄力斩(**damage**/action/`itemUses:1`) / `dnd5eactivity500` 装鞘(utility/**bonus**/`activityUses:1`/`isEnabled:false`)
- 薙刀 `Item.eKAwDGLnNEnuJL6T`（`attunement: ""`，免同调）：`ltcIOBmp46bqcT0O` 薙(attack/action) / `dnd5eactivity200` 穿刺(save/action/`itemUses:1`) / `dnd5eactivity300` 追刃(attack/special/`activityUses:1`) / `dnd5eactivity400` 拔鞘(utility/bonus/`activityUses:1`/`isEnabled:false`)
- 残心池：物品级 `uses { max: "3", recovery: [{ period: "lr", type: "recoverAll" }] }`，两形态共用（宏切换时搬运 `spent`）
- **同调排布手法**：两把刀都写 `attunement: "required"` 会逼玩家同调两次 ⇒ **只让本体（太刀）需要同调，形态（薙刀）写 `""`**，描述里点明

## 血的教训-强迫目标移动篇

### 键名与机制查证
- 坑：臆造键名 `flags.midi-qol.DamageBonus` 给目标加伤 —— **这个键在用户世界 193 处物品导出里 0 实例**，midi 根本不读 → 效果「一点伤害也不判定」
  解法：**写之前先 grep 真实样本。0 样本 = 这个键不存在或不是给 midi 用的**；用到的每个 flags 键都要先找到真实样本
- 坑：「先写后查」的路径依赖 —— Foundry/midi 的知识库里先写的那一版**几乎必是错的**
  解法：遇到用户世界的金标准（磁轭手铳等），**第一步是读它、抄它**
- 坑：失败时先怀疑「资料不对」或「用户环境特殊」（5 小时里前 4 小时都在这个坑里打转）
  解法：先怀疑「我没读资料」；用户手把手拖进来的资料（`data-dict` / `monster-spec` / `world-scripter` / 磁轭手铳）务必**逐行读完**再动手

### macroPass 时点与格式
- 坑：时点选错 —— 把「命中后引爆」绑在 `postActiveEffects`（动态效果生效后 = 施放附魔那一刻）
  解法：**命中引爆应该用 `postAttackRoll`（攻击判定后）**；命中引爆用 `postAttackRoll`，效果添加用 `postActiveEffects`
- 坑：格式用错 —— 用物品级方括号旧式 `[postActiveEffects]ItemMacro` 去拼**效果级**，自然不触发
  解法：物品级用方括号旧式；**AE 级用逗号式** `ItemMacro, postAttackRoll`（`宏引用, 传递类型`）
- 坑：判别条件写错（卡最久）—— 用 `hitTargets > 0` 来区分「攻击命中」vs「施放」；**但施放法术时用户也会选目标，此时 workflow 的 `hitTargets` 也是 1** ⇒ 「施放」被误判成「攻击命中」→ 走引爆分支 → 但那时附魔效果还没挂上 → 直接 return → 效果没挂，后面攻击自然不触发
  解法：**施放 vs 攻击命中，必须用 midi 的 `macroPass` 字段区分，绝对不能靠 `hitTargets>0`**
- 坑：AE origin 为空 → midi 把宏名重写成 `ItemMacro.{空}` → **静默失败**
  解法：**AE origin 必填**
- 坑：「命中才触发」以为要加拦截/判断分支
  解法：**天然成立，根本不用在宏里加 `hitTargets>0` 的判断分支** —— miss 时 `wf.hitTargets` 为空 → `target=null` → 直接 return：
  ```js
  const target = Array.from(wf?.hitTargets ?? [])[0] ?? Array.from(wf?.targets ?? [])[0]
    ?? Array.from(game.user.targets ?? [])[0] ?? null;
  if (!target) return;   // ★ 未命中/无目标 → 不触发
  ```
  磁轭手铳出处：`怪物与物品卡\fvtt-Item-磁轭手铳-lodestone-hand-cannon-GvkWUmv1yELXojBh.json`

### 探针写法
- 坑：在宏里 `JSON.stringify(args[0])` 打日志，但 `args[0]` 含 `Token5e`（带 `_events → pointerover → context` 循环引用），**必崩**；崩在探针上挡住了后面的逻辑，用户以为「宏没触发」
  解法：**宏里打日志用 `console.log(对象)`，不要 `JSON.stringify` 含 token/actor 的东西**；宏体要过 `new Function()` 校验

### 强制移动实现正解
- 坑：一次铺 8 个法术，任何一个键废了全废，排查难度翻倍
  解法：**先打通 1 个，确认无误，再复制到同类**
- 机制（金标准数值）：目标做**体质豁免**（DC = 8 + 施法者熟练加值 + 施法主属性调整值），失败才移动；移动途中**撞墙或撞生物**→目标受撞击**力场**伤害、撞到生物则该生物也受伤害；**强制移动不引发借机攻击**；玩家端只读计算，位移与伤害交给 GM 端 `globalThis.LHGM.request({ sceneId, ops:[{tokenId, move:{x,y,animate:true}}, {tokenId, damage:[{value,type}]}] })`
  磁轭手铳：消耗 1 次牵引（次数 = 熟练加值，长休回满）→ 点地图选方向 → 体质豁免（DC = 8 + prof + dexMod）→ 失败强制移动**至多 15 尺**；撞墙/撞生物 → 目标 2d6 力场、被撞生物 1d6 力场
  冲击印记（`FVTT房规\自然猎手\冲击印记.json`，midi 13.0.55 实测通过）：1 环塑能、VSM + 10gp 琥珀（不消耗）、距离自身、专注 1 分钟 → 弹「引爆撞击」Dialog → 左键点地图选方向 → 体质豁免（DC = 施法者法术 DC）→ 失败推 **10 尺**；撞生物双方各 `(环阶+1)d6` 力场；撞墙目标额外 +1d6；升环每环 +1d6
- 移动计算蓝图（宏体内）：
  ```js
  const gridSize = canvas.grid.size;                 // 每格像素
  const ftPerSq  = canvas.scene.grid?.distance ?? 5; // 每格英尺
  const MAX_FT   = 10;
  const maxCells = Math.max(1, Math.round(MAX_FT / ftPerSq));
  const cen = (tk) => ({ x: tk.center?.x ?? (tk.x + tk.w/2), y: tk.center?.y ?? (tk.y + tk.h/2) });
  const SNAP = CONST.GRID_SNAPPING_MODES;
  const snapCenter = (p) => {
    try { return canvas.grid.getSnappedPoint({ x:p.x, y:p.y }, { mode: SNAP.CENTER, resolution: 1 }); }
    catch(e){ return { x: Math.round(p.x/gridSize)*gridSize, y: Math.round(p.y/gridSize)*gridSize }; }
  };
  ```
- 玩家点地图选方向：`new PIXI.Graphics()` 画圈（`lineStyle(2,0x66ccff,0.9)` + `beginFill(0x66ccff,0.05)` + `drawCircle(tc.x, tc.y, maxCells*gridSize)`）、`zIndex=10000`、`canvas.app.stage.addChild(g)`；监听 `pointerdown`，`ev.button === 2` **右键取消**、`snapCenter({x: ev.data.global.x, y: ev.data.global.y})`；**20 秒超时**自动 resolve(null)；方向向量归一化 `ux=vx/len, uy=vy/len`，逐格推进 `maxCells` 格、撞生物/墙提前 break
- 碰撞检测：`CONFIG.Canvas.polygonBackends.move.testCollision({type:"move", mode:"any", ...})`

## 血的教训-AC加值与DAE条件实测篇

### AC 是派生值
- 坑：`"ac": { "calc": "flat", "flat": 15 }` + AE `{"key":"system.attributes.ac.bonus","mode":2,"value":"2"}` → 实测读回 `ac.value` = **15**，加值**没生效**，而且**不报任何错**
  根因：`F:\FVTT\data\systems\dnd5e\dnd5e.mjs` 的 `prepareFinalData` L40278-40286 `switch (ac.calc) { case "flat": ac.value = Number(ac.flat); return; ... }` —— **直接 return，后面所有加值逻辑全跳过**（注释原文就写着「Flat AC (no additional bonuses)」，这是设计如此不是 bug）
  解法：想要 AC 加值 → **`calc` 必须写 `"natural"`**（`case "natural": ac.base = Number(ac.flat); break;` 走完整计算，`ac.value = Math.max(ac.min, ac.base + ac.shield + ac.bonus + ac.cover)` L40332-40335）；实测改 `natural` 后 `ac.value` = **17**（15 + 2）✓
- 坑：以为「AC 下限做不了自动化」（我曾当面跟用户这么断言）
  解法：`system.attributes.ac.min` 就是 AC 下限 —— 源码 L40335 的 `Math.max(ac.min, ...)`；AE 写 `{ "key": "system.attributes.ac.min", "mode": 5, "value": "15" }`；**先查源码，别凭印象否定**
- 坑：直接改 `ac.value` → 会被系统公式覆盖（这也是 `flat` 吞加值的根源）
  解法：加值走 `system.attributes.ac.bonus`（mode 2）、覆盖走 `ac.flat`、下限走 `ac.min`

### DAE 条件表达式
- 坑：条件表达式不写 `@` 前缀 → 字段不被替换 ⇒ **条件恒真**
  解法：一律用 `@attributes.xxx` / `@abilities.xxx` 带 @ 的形式；验证方法（用 DAE 自己的 API，一次问清）：
  ```js
  const ev = game.modules.get('dae').api.evalExpression();
  ev('@attributes.hp.temp > 0', actor.getRollData());   // → "20 > 0"          ✅ 替换成功
  ev('attributes.hp.temp > 0',  actor.getRollData());   // → 原样返回该字符串   ❌ 没替换 ⇒ 条件恒真
  ```
- 坑：★ 把条件写在 `enableCondition` 上（「防护插板」是 `transfer: true` 的常驻被动效果）→ 怎么写都没反应，我却由此得出「DAE 不重评」的**错误结论**
  真相：**字段用错了** —— `enableCondition` 是给**非转移效果**用的
  解法：两个字段分工（出自 DAE 官方变更日志原文）——`enableCondition`（UI 名「表达式，如果为假将从角色中移除效果」；假 → **删除**效果；**仅非转移效果**，即物品使用后施加到目标身上的效应）/ `disableCondition`（「表达式，如果为真将禁用效果」；真 → **标记禁用**不删除；**所有效果，含转移/被动**）；变更日志原话 `"Added effect enable condition to non-transfer active effects"` 与 `"works with all effects"`
- 坑：以为 DAE 是连续监听/轮询；在控制台直接改内存测试 → 看起来像「不重评」
  解法：求值时机 = **效果被应用时** + **携带该效果的 actor / token 被 `update()` 时**；**来源端**（施放者/物品）更新**不触发**检查；⚠️ **测试时别在控制台直接改内存**（不触发 update）
- 复现实测（2026-09-17，青脑叁型·安保模块，效果 `_id = armorPlate000001`，`transfer: true`，`changes = system.attributes.ac.bonus mode2 "2"`）：
  ```js
  await eff.update({ 'flags.dae.disableCondition': '@attributes.hp.temp <= 0',
                     'flags.dae.enableCondition': null });     → AC 17 / temp 20 / disabled false
  await actor.update({ 'system.attributes.hp.temp': 0 });   + 等 900ms → AC 15 / acBonus 0 / disabled true ✅
  await actor.update({ 'system.attributes.hp.temp': 20 });  + 等 900ms → AC 17 / disabled false          ✅
  ```
  ⇒「有临时 HP 期间 AC +2」完全自动，不需要 GM 手动禁用、也不需要写宏（原先那句「需 GM 手动禁用」**已作废**）
- 实务结论表：① 被动效果随字段开关 → **`flags.dae.disableCondition`** + 确保 actor 走 `update()` ② 更强的响应式（距离、多字段联动、事件驱动）→ `flags.dae.onUpdateTarget` / `onUpdateSource` + 物品宏，或 DAE 条件效果物品（DAEConditionalEffects），或模块 **SC - Conditional AE** ③ 一次性逻辑（使用时触发）→ 物品宏 / onUseMacro（**不适合**持续 AC 加成）

### dnd5e 5.3.x 字段路径
- 坑：按老骨架写 `attributes` 下的 `damage.immunities` 那套旧路径
  解法：**免疫与语言的真实路径** `system.traits.di.value` / `traits.ci.value` / `traits.languages.value`
- 坑：把感官写成 `senses.darkvision` 直挂
  解法：**感官在 `senses.ranges.*` 下**
- 坑：不清楚技能熟练等级字段
  解法：**`skills.<三字母>.value`** = 熟练等级（0 无 / 1 熟练 / 2 专精）；被动察觉由系统自动算（察觉+2 → 12）
- 坑：把多重攻击写成 `system.actions`
  解法：**多重攻击是 feat 物品 + `type:"utility"` 活动**，点了只在聊天卡提示、**不会自动打两次**（官方暮光审判官 / 铁卫都这么做）
- 坑：每回合回血不知道怎么实现
  解法：feat 的 heal 活动 + 物品级 AE 的 `flags.midi-qol.OverTime = "turn=start, damageRoll=10, damageType=healing, condition=@attributes.hp.value > 0"` —— **`damageType=healing` 就是回血的实现方式**（铁卫「核心再生」逐字形态，可直接照抄）
- 坑：NPC 攻击加值写死
  解法：`attack.ability:"str"` + `damage.parts[].bonus:"@mod"`，熟练由系统自动加

### 写文档的坑（大模板字符串文件）
- 坑：改 `src/reference.ts` 这类大模板字符串文件时，`old_string` 末尾带的标点/反引号，`new_string` **必须原样保留** —— 加 5 条坑到 `pitfalls` 主题时，`old_string` 末尾是 `...实体名可直接写中文.\``（带**闭合反引号**），我把 `new_string` 写成 `...实体名可直接写中文。\n<新增内容>`（**没带那个闭合反引号**）⇒ 整个主题的模板字符串从那里断掉，后面 1000 多行全被当成字符串内容
  证据：`tsc` 报 **200+ 个错**（TS1127 Invalid character / TS1434 / TS1160 Unterminated template literal），错误从 1797 行一路报到 2004 行，**根本看不出是 1017 行出的问题**
  解法：`old_string` 的标点/反引号必须原样搬进 `new_string`
- 坑：靠读 tsc 报错定位断掉的模板字符串（只会被 1797 行带偏）
  解法：写脚本**按行统计反引号累计数量，逐主题检查区间内反引号是否恰好 2 个**，一条命令就指到了 1017 行的 `pitfalls`：
  ```js
  const lines = fs.readFileSync('src/reference.ts', 'utf8').split('\n');
  const keys = [];
  for (let i = 0; i < lines.length; i++)
    if (/^  '?[a-z-]+'?: `/.test(lines[i])) keys.push({ line: i + 1, start: i });
  for (let k = 0; k < keys.length; k++) {
    const to = k + 1 < keys.length ? keys[k + 1].start : lines.length;
    const c = (lines.slice(keys[k].start, to).join('\n').match(/`/g) || []).length;
    if (c !== 2) console.log(`⚠️ 主题 L${keys[k].line} 区间反引号=${c}（应为 2）`);
  }
  ```

## 本次未能确定的问题

- **Aeris：蓝线折返（来回绕）** —— 至今未取证、未修。候选嫌疑全部未坐实（`BacktrableMovementTrail.update()` 的 autoPath 分支 `this._path = path` 整条替换、`_update()` 的 `_trailSplice(back + 1)` 回退与 `isLegalStep` 合并、墙角等长绕行跳变导致 `getPaintedTiles()` 格子顺序来回变）。锁死 autoPath 可能改变折返表现（两个方向都可能），下一个探针要一起看 `_path`。
- **Aeris：LH.40 / LH.41 的真机验收结果用户未回报** —— 数字是否不再双倍、设置项是否真的消失，都还没有第二份证据；原文只记录到「已交付」。
- **Aeris：纹理缓慢泄漏、画布外松手不落库、多选 token 不走跳跃特效（上游只处理 `controlled.length===1`）、socket 8 个 handler 无鉴权** —— 原文只列为「还没修的上游问题」，未给根因或修法。
- **双形态武器：`damage` 活动在 midi 里的完整结算流程没有实机跑过。**
- **双形态武器：活动次数耗尽时抛 `ConsumptionError` 给玩家的文案长什么样（大概率英文）没看过。**
- **双形态武器：物品宏里 `setTimeout(run, 250)` 延迟够不够让 workflow 收尾（未实测，只是经验值；战斗外「用前清零」那段分支也没有实机验证）。**
- **双形态武器：`description.chatFlavor` 里的 `[noaa]` 标记本次没用（改用 `isEnabled:false`）。**
- **双形态武器：未实测「一个 AE 挂两个 changes 同加到同一 `system.traits.ci.value` Set」** —— 本批用「两个独立 AE、各 1 change」规避。
- **双形态武器：「免疫魅惑/恐慌」本该写 `changes` 改条件免疫字段，本次未做，只把错的删了（原文自标为待办）。**
- **双形态武器：`enforceBonusActions` 的取值来源/可选值全集** —— 原文只实测到 `"displayOnly"` 一种，以及 `"all"` / `actor.type` 两个判据分支。
- **强迫目标移动：`LHGM.request` 的执行端实现细节** —— 原文只给了调用形态，没给玩家端/GM 端的鉴权或错误处理说明。
- **AC/DAE：`moduleFunctionalityScopeInCombat` 那类设置的取值范围**（只在 Aeris 篇提到 `Disabled` → `Tactics`，未给全集）。
<!-- 来源：血的教训-世界同步装置篇 / CSS面板配置篇 / 远程盲调UI篇 / 教学视频库优化篇 -->
## 血的教训-世界同步装置篇

### 架构根因（模型层面的病 · §0 九条）

- 坑：同一类事实存多份副本 —— 「哪个文件读失败了」由 **6 个模块级变量**分别记录、「操作互斥」有 **3 套并行实现**、「哪些键该写」有 **4 套判据**、「恢复范围」有 **2 套来源**、「失败怎么还原」有 **2 处近乎逐字重复**
  解法：一种事实只留一个来源；审阅者原话「这不是『一个模块』，是『一个模块 + 一份逐年加固的防御工事』」，12 轮里 9 次「声称修了、实际只改一半」全由此而来
- 坑：「读失败」被当成「不存在」→ 静默跳过保护 → 照常覆盖（在**账本、备份、锁**三条路径上都中过）
  解法：见下「读失败 ≠ 不存在」条，状态随结果返回 `{text, error}`；只有 HTTP 404 才是「确实不存在」
- 坑：写操作没做到三条铁律 —— 覆盖前不能反悔 / 反悔失败不吭声 / `.prev` 只写不读（等于没有反悔）
  解法：覆盖前必须能反悔 → 反悔失败必须如实说 → 被保护的东西必须真的被保护
- 坑：**加固本身变成新风险源** —— v1.2.2 到 v1.3.0 每一个版本里，12 轮中有 **9 个 bug 是我在「修 bug」时引入的**
  解法：每加一层保护，必须同时问「这层保护失效时会发生什么」
- 坑：把用户真机当测试机
  解法：本项目真正上过用户服务器的只有 2 条，其余 4 条全在交付前被拦 —— 拦住它们靠的是**三个不同角色的独立盲审**（破坏者 / 接手者 / 文档对现实），不是「我想得更仔细」
- 坑：**fail-open 判断做反** —— v1.2.8 把「另存上一份回档账本」的失败处理成只 `warn` 一句然后照常写新账本，注释理由写着「不要因为一个辅助动作失败就阻断主操作」；而账本是**唯一**的撤销点，覆盖即永失（服务器上没有副本，Foundry 也没有删除/恢复文件的 API）
  解法：正确判据 = **失去唯一副本 / 唯一撤销点 → 必须停下并说清；只损失一次便利 → 可以继续但必须出声**；fail-closed 的代价只是「这次没做成，修好磁盘/权限后重试」
- 坑：**善意的兜底把合法输入解释成另一种语义** —— `buildSelection()` 里「空 custom 视为全部（防止恢复什么都没做）」，把「取消所有模块 + 只保留模组启用状态」这个合法组合（勾选数同样是 0）当成了「全部同步」，用户明确不想被覆盖的模块设置被整份写掉
  解法：语义只允许一处说了算 —— 范围只由 `mode` 决定，「允不允许空」只由 `saveScopePref` 决定；写兜底前先问「这个『异常输入』，有没有可能只是我没考虑到的正常需求？」
- 坑：以为外部审阅的价值在「找出更多条」 —— 八轮里报出最多条的是盲审 subagent（19 条），但质量最高的是外部审阅那份**只有 4 条**的报告
  解法：这类「同一件事在 A 处和 B 处语义不同」的问题**测试抓不到**（测试只验单条路径）、**作者自审也抓不到**，只能靠换角色的外部审阅
- 坑：**v1.3.4 · 一条关系被拆成两半、分属两个文档系统** ——「哪个合集包放在哪个文件夹」的映射存 `core.compendiumConfiguration`（**Setting**），本体存 `game.folders` 里 `type === "Compendium"` 的 **Folder 文档**；模块全文 grep `Folder|compendium|game.folders` = **0 匹配**，只搬了映射、从头到尾没碰本体
  解法：判据 =「同步/迁移任何东西之前，先列出这条事实由几个载体共同表达」；带走了「A 指向 B」，必须同时问 **B 本身带走了吗**；用户当时描述「包都在，就是没归位」已经把层次说清（数据没丢，断的是关系）
  证据：核心查不到就静默当 null —— `client/documents/collections/compendium-collection.mjs:161-163` `get folder() { return game.folders.get(this.config.folder) ?? null; }`（该字段官方定义本就允许 null，同文件 `:95-96`），包静默散到顶层、零报错

### 版本时间线（每行一个坑 · §1）

- 坑：v1.0.0 拿 `game.settings.get/set` 去读**全部**世界设置 —— 对未注册键直接抛错
  解法：必须走「存储全集」`game.settings.storage.get("world")`（见下条）
- 坑：v1.0.1 存主世界报 `Target directory … does not exist`
  解法：`uploadPersistent` 的 path 参数是**目录**不是文件，传文件名会被服务端当目录做 `existsSync`
- 坑：v1.0.2 场景栏按钮放左侧边栏，入口位置选错
  解法：改到右侧设置旁（用户原话：「不要左侧边栏啊，改到右边」）
- 坑：v1.0.3–.6 自动恢复没恢复模组开关 / 导出打不开
  解法：自动应用的差集里**永远要含 `core.moduleConfiguration`**；Blob 不能用 `application/json`（浏览器会内联渲染 9MB 文本）
- 坑：v1.0.8 导出的文件没有文件名、只有一串 UUID
  解法：必须截断 FVTT 的全局超链接拦截（见 §4 下载条目）；`<a download>` 在 FVTT 里完全失效
- 坑：v1.0.9 回档账本跨世界串数据 —— 账本按固定文件名存、只记世界标题（不稳定的标识），A 世界的撤销点被 B 世界覆盖
  解法：账本改为每世界一文件（`apply-log-<世界ID>.json`）
- 坑：v1.1.0 命名空间列表只看当前世界 → 新世界恢复的核心场景直接消失；另有全选单向联动、`escapeHtml` 不转引号
  解法：按外部审阅修 12 条；`escapeHtml` 必须转引号
- 坑：v1.2.0 之前的侧边栏按钮用轮询注入 —— 是**下策**
  解法：改官方 hook `renderSidebar`（见 §3.1）
- 坑：v1.2.1 拍脑袋加缓存 → 反而在 v1.2.2 制造了「陈旧缓存」新 bug
  解法：删掉缓存路径
- 坑：v1.2.2 用单个模块级变量 `storageLastError` 记录读失败 —— 一次操作会连读 4 个文件，单变量被后一次读覆盖，上层根本说不清是哪个文件出了问题
  解法：`storageRead` 改为返回 `{text,error}`
- 坑：**v1.2.3–.5 致命** —— 跳过未装模组的逻辑只加在**写入循环**、而**记账循环记的是全部差异** → 回档会去删用户后来才配好的值
  解法：写入与记账必须共用同一条「有效目标值」规则（抽成 `keepSelfEnabled(key, 快照值, 当前值)`）
- 坑：v1.2.8–.9 恢复途中按 F5 → 会话闸（内存）与文件锁（sessionStorage）**两道互斥同时归零**
  解法：锁加 `pageToken`（内存，刷新即变）+ 会话闸自愈
- 坑：v1.3.0 只给 `storageRead` 加了超时，**忘了 `storageWrite` 也有一条**
  解法：超时/并发能力必须两条路径都加
- 坑：v1.3.2 面板把 `world` 当成「一个叫 world 的模组」、把未注册命名空间说成「未安装」
  解法：措辞说准 —— 面板列的不是「模组列表」，是「世界设置里出现过的命名空间」；`world.*` 本就是世界自己的命名空间（世界脚本/世界宏/小游戏不带模块 id 注册时落在这里）
- 坑：v1.3.3 外部审阅四条一个共同病根 —— **同一件事存在多套语义**：范围语义（空 custom）/ 目标值语义（差异 vs 写入）/ 锁语义（一个标量锁表达多把世界锁）/ 失败策略语义（fail-open vs fail-closed）
  解法：一次修完四条，每类语义收口到单一出口
- 坑：v1.3.4 同步了「包 ↔ 文件夹」的**映射**（Setting），却没同步文件夹**本体**（Folder 文档）⇒ 指针悬空、核心静默当 null，包全散到顶层
  解法：见 §2.9（`keepId: true` + 两步法）

### 世界级设置怎么读怎么写（§2.1）

- 坑：`game.settings.set/get` 对未注册的键直接抛错
  解法：走「存储全集」—— `game.settings.storage.get("world")` 是 `WorldCollection`，可枚举、可批量写；`for (const doc of store.values()) { if (doc.user) continue; }`（`doc.key` 形如 `"命名空间.键"`，`doc.value` 是**已解析好的对象**）；写用 `await Setting.updateDocuments([{_id, value: JSON.stringify(obj)}])` / `Setting.createDocuments([{key, user:null, value: JSON.stringify(obj)}])` / `Setting.deleteDocuments([id])` —— **value 必须自己 `JSON.stringify`**
  证据：`"xxx is not a registered game setting"`，出处 `client/helpers/client-settings.mjs:271`
- 坑：不知道枚举入口 —— `WorldSettings` 只有 `getSetting/getItem`
  解法：枚举要 `[...store.values()]`，出处 `client/documents/collections/world-settings.mjs:35-47`；存储全集与作用域见 `client/helpers/client-settings.mjs:42-47`（CLIENT→localStorage，WORLD/USER→世界集合）；`Setting.value` 是 `JSONField`（`common/documents/setting.mjs:45`，读出来是对象、写进去要字符串：`common/data/fields.mjs:3002-3027`）
- 坑：以为权限不足是静默过滤
  解法：**权限失败的形态是「抛错」** —— `Setting.canUserCreate` 要 `SETTINGS_MODIFY`；`core.permissions` **仅全权 GM**；助理 GM 只有 9 个 `core.*` 白名单键（`common/documents/setting.mjs:57 / 65-93`）
  证据：用户世界实测日志 `User Player2 lacks permission to update Setting`

### 锁与并发写入（§2.2 / §2.7 / §5-4 / §5-13）

- 坑：锁的判据只看 `worldId`，而被保护的主快照是**全局单文件** → 两个 DM 各开一个世界同时点「存主世界」，两边 worldId 不同 → **双方都放行** → 都写同一个文件、都报成功，可造出「主快照 = A 的内容、`.prev` = B 的内容」这种中间态，而 `.prev` 只有一代
  解法：锁的作用域必须与被保护的资源匹配 —— `const isGlobalOp = (opName === "snapshot"); const crossWorldConflict = isGlobalOp || (l?.scope === "global"); if (effExpires > now && (crossWorldConflict || l.worldId === currentWorldId()) && !(sameOwner && samePage)) return { ok: false, holder: l };`
- 坑：**一个标量锁文件表达不了「一把全局锁 + 多把世界锁」** —— 两类锁共用同一个 `operation-lock.json`：B 世界开始恢复会覆盖 A 的锁记录，B 先释放后 A 世界的第二位 GM 读到「没有人在操作」→ 两个恢复同时写同一个世界
  解法：v1.3.3 改为**所有同步写操作全局串行**（用户拍板：同步是低频管理动作，没有并发的必要，全局互斥换来「行为可推理」）；锁失效时必须出声
  证据：⚠️ 旧表述「全局文件用全局锁」已被推翻 —— 只把「读主快照」标成全局锁并不能解决覆盖问题，因为**锁文件本身仍是单份**；改成多世界锁表（`{global, worlds:{}}`）也不行，Foundry 持久化存储**没有 CAS**，文件级读改写竞态仍在
- 坑：读锁时直接信 `expiresAt` —— 它由写锁那一方用**它自己的本机时钟**算出，时钟快进 / 手工改锁文件 / 还原一份旧锁都可能塞进极大值 → 其他 GM 被**永久拒绝**，而提示还在说「约 2 分钟自动解锁」（假话）
  解法：读侧给到期时间加上限 —— `const hardCap = startedMs ? startedMs + 2 * LOCK_TTL_MS : 0; const effExpires = hardCap ? Math.min(Number(l?.expiresAt) || 0, hardCap) : (Number(l?.expiresAt) || 0);`（`LOCK_TTL_MS = 120000`）
- 坑：写锁失败把整个操作拖死
  解法：写锁失败不能把操作拖死，但**必须提示**「本次未做互斥检查」—— 静默放行等于让两个 GM 各写各的账本、撤销点互相覆盖，界面上看不出任何异常
- 坑：回读校验用 `l2?.operationId !== 自己的` 判 —— **`JSON.parse(null)` 不抛错、返回 `null`**，会把自己刚写的锁判成「别人的锁」
  解法：只认「明确的、非自己的 operationId」
- 坑：恢复途中按 F5，内存会话闸与 sessionStorage 文件锁同时归零
  解法：加 `pageToken`（内存，刷新即变）防「刷新后认领自己的旧锁」；`owner` 用 sessionStorage（刷新不变）
- 坑：**测试之间共享的全局状态会掩盖真实的互斥行为** —— 测试脚本的 `files` Map 跨用例共享，是「残留的锁把后续用例挡在门外」才把它暴露出来的；反过来想：如果残留的效果是「本该被挡却放行」，测试**永远不会发现**
  解法：每轮改锁 / 改互斥，先显式清一次共享状态再跑

### 快照覆盖前的体检（§2.3）

- 坑：体检只写在「存主世界」按钮里 → 导入 →「设为主快照」这条路径**完全没有体检**，一份空快照就能把 8.8MB 基准换掉；之后再存一次，唯一那份 `.prev` 也被覆盖 → **服务器上再无完整副本**，而界面还在说「上一份已备份为 X」
  解法：三条路径共用同一条判据 `preflightMasterOverwrite(newCount, label)`；常量 `MASTER_MIN_ITEMS = 20`（少于这么多项不可能是完整主世界配置）、`MASTER_SHRINK_RATIO = 0.3`（只剩不到三成 = 典型的「选错了世界」）
- 坑：体检依赖界面缓存，读不到时只 `console.warn` 后照常覆盖 —— 「判据不可用 → 反而更容易覆盖成功」是反的
  解法：判据读服务器上的真实文件；`if (error) return { ok: false, reason: "readError", detail: error }`（读不到 = 拒绝覆盖）；体检自身抛错也要取消本次保存，不能 `catch { console.warn }` 后继续
- 坑：确认状态用 `true/false` 记 —— 被警告后关掉面板、换个世界再点就失效了
  解法：确认按内容绑定 —— `let masterOverwriteAck = null; if (masterOverwriteAck === newCount) { masterOverwriteAck = null; return { ok: true, forced: true }; }`

### 恢复的三件套与三态提示（§2.4）

- 坑：先写设置后写账本 / 账本写不进还继续写设置
  解法：必须先写账本，写不进就一个设置都别动，并打标记 `e0.__notStarted = true` 让上层别谎称「已自动回滚」
- 坑：逐条 `await` 写 1300 项 = 1300 次往返
  解法：批量写 —— `SettingDoc.updateDocuments(updates, {})` / `SettingDoc.createDocuments(creates, {})`；`createDocuments` 的返回要记下来（`createdByKey.set(d.key, d._id ?? d.id)`）供失败还原精确删除
- 坑：失败还原也失败，却用一句「已回滚」盖过去
  解法：`e.__rollbackFailed = !!rollbackErr` 如实上报；提示必须分三态 —— `__notStarted`→「恢复没有开始：账本写不进服务器…世界的设置一个字都没动」；`__rollbackFailed`→「恢复失败，且自动回滚没能完成（世界可能停在中间状态）。**请不要刷新页面**」；其他→「恢复失败，已自动回滚到恢复前的状态」
- 坑：写完设置就崩，账本却没标「已完成」，事后被讲成「你又改过」
  解法：写完才 `await markLogApplied(logOpId)`

### 模组启用列表必须合并写入（§2.5）

- 坑：**本项目最容易被忽略、后果最像「把世界写坏」的一条** —— `moduleConfiguration` 整串覆盖：快照来自「当时没装模组 M 的世界」，恢复进装着 M 的世界 → 配置里没有 M 的键 → 刷新后 M 的脚本不被加载（= M 被静默关掉），而界面报告「同步成功」
  解法：以当前世界打底，只覆盖快照里显式存在的键 —— `function mergeModuleConfig(snapshotVal, currentVal) { const cur = (currentVal && typeof currentVal === "object") ? currentVal : null; const merged = cur ? { ...cur, ...snapshotVal } : snapshotVal; return { ...merged, [MODULE_ID]: true }; }`（本模块自己永远保留为启用）
  证据：页面注入 `dist/server/views/view.mjs` 的 `_getStaticContent` **只注入 `moduleConfig[id] === true`** 的模组；发送世界数据 `dist/packages/world.mjs` 里 `e.active = l[e.id] ?? false` —— **缺键 = false = 不激活**
- 坑：账本记的是 `diff.changed[i].to`（快照原值）而不是实际写入的值
  解法：账本必须记**合并后实际写入的值**，否则漂移检测会拿原值跟当前值比 → 永远误报「你又改过」

### 「读失败 ≠ 不存在」与 storageRead（§2.6）

- 坑：用单个模块级变量攒读错误 —— 一次操作会连读 锁 → 主快照 → 账本 → 旧账本，后一次读覆盖前一次，于是「刚读完 404、下一句又读到 5xx」这类交错会让所有错误提示说错原因
  解法：`storageRead` 返回 `{ text, error }`，把状态随结果一起返回
- 坑：`storageRead` 不区分 404 与 5xx
  解法：`const url = foundry.utils.getRoute(norm(STORAGE_DIR) + "/" + name);`（⚠️ 必须带路由前缀）；`fetch(url, { cache: "no-store" })`；`if (r.status === 404) return { text: null, error: null };`（唯一能确认「不存在」的分支）；`if (!r.ok) return { text: null, error: "服务器返回 HTTP " + r.status };`
- 坑：只解构 `text`、丢掉 `error`（本项目在 `openSyncPanel` 里正是这样）—— `storageRead` 对 5xx 不抛异常 → 下面的 `catch` 永远不会执行
  解法：`const { text } = await storageRead(MASTER_FILE);` 这种写法必须改成同时取 `error`；否则界面静默退化成「只有当前世界已有的模块」，用户可能保存一个残缺的恢复范围

### 回档账本：锁内读、锁内用（§2.8）

- 坑：账本在**锁外**读、锁内用 —— 从「读到账本」到「拿到锁」之间，别人完全可能完成一次恢复：主账本已换成新的 `prev/after`，而本流程仍按**旧账本**覆盖世界（用旧值抹掉更近的值），随后的 `markLogRolledBack()` 还会把**新账本**标成「已回档过」：用户唯一的撤销点被标成用过的
  解法：进锁后重读 —— `const r = await withOpLock("rollback", async () => { const fresh = await readApplyLog(); if (applyLogReadError) return { readError: applyLogReadError }; if (fresh?.prev) { if (log?.opId && fresh.opId && String(fresh.opId) !== String(log.opId)) return { stale: true }; log = fresh; } … });`
- 坑：账本记 `present:false` 的键（= 那次恢复时它本来不存在、是恢复过程创建的）回档时会 `deleteDocuments` 删掉它；如果用户在恢复之后**真的把它配起来了**，这一删**没有任何副本**（`before` 只在内存里，账本的 `after[key]` 记的还是当初写进去的值）
  解法：比对 `after[key]` 与当前值，不一致就 `continue` 保留不动，并在回档报告里单列「这 N 项是你在恢复之后又改过的，已原样保留」

### 引用与被引用文档必须一起搬（§2.9）

- 坑：`core.compendiumConfiguration` 形如 `{包id: {folder: "夹id"}}`，不在 `EXCLUDE_DEFAULT` 排除表里、每次都跟着快照走；而文件夹本体是 Folder 文档（`game.folders` 里 `type === "Compendium"` 那一批），模块从来没同步过 → 目标世界拿一串 `folder: "abc123"` 去查，查不到就静默返回 null → 包全散到顶层、**零报错**
  解法：搬「被引用的文档」，只带重建必需字段（`_stats` / `flags` 由核心自己维护，不要搬）：`const folders = game.folders.filter(f => f.type === "Compendium").map(f => ({ _id: f.id, name: f.name, folder: f._source?.folder ?? null, sort: Number.isFinite(f.sort) ? f.sort : 0, sorting: f.sorting === "m" ? "m" : "a", color: f.color ?? null }));`
- 坑：父夹可能还没建，先引用父子关系会失败
  解法：两步法 —— 先全部建在顶层（`.map(f => ({ ...f, type: "Compendium", folder: null }))`），再 `updateDocuments` 补父子关系
- 坑：**不传 `keepId` → 夹子全建成新 id**，`compendiumConfiguration` 里那些引用**一个都对不上**，症状与「什么都没搬」一模一样（而且更难查，因为夹子明明建出来了）
  解法：`await FolderCls.createDocuments(toCreate, { keepId: true });` —— `keepId` 是这类迁移的**唯一命门**
  证据：`common/abstract/document.mjs:454-460` —— `const { save = false, keepId = false, addSource = false, ...remaining } = context; if ( !keepId ) delete data._id;`；官方两处先例照抄：`client/documents/adventure.mjs:151-157`（注释 `// Keep adventure document IDs`）、`client/documents/collections/compendium-collection.mjs:570-577` 的 `importAll`
- 坑：按名字判重（同 id 的夹子被重复建/被覆盖）
  解法：按 `_id` 判重 —— `.filter(f => !game.folders.has(f._id))`，已有同 id 绝不动
- 坑：回档侧删夹子删过头
  解法：只删「本次建的 + 当前没被任何包引用 + 没有子夹」三个条件全满足的；`compendiumConfiguration` 读不到时**一个都不删**（fail closed）
- 坑：`validateApplyLogEntry()` 原来判「`prev` 为空 ⇒ 整个撤销点无效」，引入文件夹维度后，「设置全同、只同步文件夹」这种**合法情况**会被这个判据静默丢掉撤销点
  解法：每个「空即无效」的判据，在**新增一个维度**之后都必须重审

### UI 正解：按钮注入与图标（§3.1 / §3.2）

- 坑：用 `setInterval(1500)` 常驻轮询注按钮 —— ①每秒都在查 DOM（常驻开销）；②只能「事后补救」，DOM 重建到下一次轮询之间有窗口期；③与 FVTT 的渲染生命周期毫无关系，纯粹靠猜
  解法：用官方渲染钩子 —— `Hooks.on("renderSidebar", () => { if (game.user?.isGM) mountSidebarButton(); }); Hooks.on("changeSidebarTab", …)`；hook 名可推：`client/applications/api/application.mjs:1226-1233` `#callHooks` 里 `Hooks.callAll(hookName.replace("{}", cls.name), this, ...hookArgs)`，render 事件的 `hookName` 是 `"render"`（`:523` 一带 debugText "After render"），侧边栏类名 `Sidebar`（`client/applications/sidebar/sidebar.mjs:23`）⇒ **`renderSidebar`**；切页签另有 `Hooks.callAll("changeSidebarTab", ui[tab])`（同文件 `:250`）
- 坑：早期教训「挂上就 `clearInterval`」—— 切场景会重建控制栏 DOM，停了按钮就消失
  解法：不要主动停轮询；若用兜底重试，挂上即停（`ensureSidebarButton` 最多重试 `BTN_RETRY_MAX = 8` 次 × 1000ms，超限 `console.warn("…已放弃自动挂载，可从「设置 → 模组设置」进入")`）
- 坑：插入后不做校验 —— 插了不等于插上了
  解法：`$anchor.closest("li").after($li); if (!$("#" + BTN_ID).length) return false;`（回读校验）；锚点 `$('button[data-tab="settings"]').first()`，锚点没出现就交给重试
- 坑：**⚠️ 最致命** —— hook 等在 `ready` 再注册，错过首次渲染
  解法：hook 必须在模块加载期（文件顶层）注册
  证据：`client/game.mjs:772` `this.initializeUI()` 在 `:787` `Hooks.callAll("ready")` **之前**；`:992` `ui.sidebar.render({force:true})` —— 侧边栏渲染早于 ready
- 坑：`window.xxx = game.user?.isGM ? …` 这种语句写在模块顶层 → 顶层读 `game` 抛 `ReferenceError`，那个控制台入口**从来就没挂上过**
  解法：正确位置是 `Hooks.once("ready", …)`
  证据：`globalThis.game` 只在 `DOMContentLoaded` 回调里创建（`public/scripts/foundry.mjs:181079-181097`），而模组脚本是 `<script type="module">`（`templates/views/layouts/main.hbs:28`）= defer 语义、**早于 DOMContentLoaded 执行**
- 坑：自己拼图标类名 → 渲染成空白小方块
  解法：侧边栏/场景栏按钮类名照抄官方 `class="ui-control plain icon fa-solid fa-arrows-rotate"`；图标名来源三处 —— ①官方模板（`templates/sidebar/tabs.hbs` 等）②用户世界导出的 JSON 里 grep（**`0 样本 = 404 风险，禁用`**）③本机 FVTT 的 `resources/app/icons/` 实际列目录
- 坑：Dialog 按钮 `icon` 直接写 `"fa-solid fa-check"` 字符串 → 渲染成空白
  解法：必须是 HTML 字符串 —— `buttons: { ok: { icon: '<i class="fa-solid fa-check"></i>', label: "确定" } }`
- 坑：做「独立图标按钮（无文字）」—— 单独一个 fa 图标渲染成空白小方块
  解法：**不要做**

### 面板 / 主题 / 下载（§3.3）

- 坑：`new Dialog` 的 `classes` / `width` / `resizable` 放进第一个参数 → 窗口拿不到类、CSS 变量失效
  解法：必须放**第二参数**；4 条按钮回调签名是 `(html, event)`，要留着面板不关就 `evt.preventDefault()`
- 坑：CSS 变量挂在内层 div → 子窗/预览弹窗在作用域外拿不到
  解法：变量挂在**窗口元素**（`.wsync-app[data-theme]` + `.wsync-themed[data-theme]` 双保险）
- 坑：深色主题下底部标准按钮黑字黑底
  解法：`.dialog-buttons` 必须一并覆盖
- 坑：自己的按钮被 FVTT 全局 `body.game .app button{width:100%}`（`public/css/foundry2.css:11805-11816`，特异性 `(0,2,2)`）撑满
  解法：必须 `width: auto !important`
- 坑：`<a download>` 完全失效、文件名退化成 blob UUID
  解法：**下载文件必须截断 FVTT 的全局超链接拦截** —— `client/game.mjs:2018` 在冒泡阶段监听 click，`:2049-2055` 对任何 `a[href]` 做 `preventDefault + window.open` ⇒ 修法：捕获阶段 `stopPropagation` + `dispatchEvent(new MouseEvent("click", {bubbles:false}))`

### 打包与发布（§4）

- 坑：`Compress-Archive` 会把文件丢到 zip 根目录、丢失 `scripts/` 前缀 → 模块加载失败
  解法：必须用 .NET —— `Add-Type -AssemblyName System.IO.Compression` + `System.IO.Compression.FileSystem`，`[IO.Compression.ZipFile]::Open($dst, [IO.Compression.ZipArchiveMode]::Create)`，逐条 `[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $src $n), $n, [IO.Compression.CompressionLevel]::Optimal)`，`$zip.Dispose()`；条目名用**反斜杠**，读取时 `GetEntry` 也要用反斜杠
- 坑：版本不同步 → 用户装出「混合版」
  解法：**版本五处同步** —— `module.json` 的 `version` / JS 头注释 / `MODULE_VERSION` 常量 / CSS 头注释 / README 示例里的 `appVersion`
- 坑：**本项目（`persistentStorage: true`）绝不能删服务器文件夹** —— `storage/` 里的主快照与回档账本会被一起递归删除且不可恢复
  解法：只覆盖那 5 个文件（`module.json` / `scripts\world-sync.js` / `styles\world-sync.css` / `README.md` / `LICENSE`），`storage\` 原样不动 → 重进世界 → 验版本；其他模块才是「删整个文件夹 → 解压 → **重进世界**（模块清单在「加载世界」那一刻读入，只按 Ctrl+F5 不够）」
  证据：卸载模块会连 `storage/` 一起被递归删除 —— `dist/packages/package.mjs` 的 `uninstall` → `fs.rm(dir, {recursive:true, force:true})`（只有 `dist/packages/installer.mjs` 的安装/更新会保留）⇒ **升级永远用覆盖文件，不要「先卸载再装」**；要留底就导出到用户自己电脑
- 坑：v1.3.4 发布时凭记忆写产物名 —— 以为包叫 `lh-world-sync-v1.3.4.zip`，实际是 `lh-world-sync.zip`
  解法：上线前先 `Get-ChildItem *.zip` 实测，**再打开 zip 读包内 `module.json` 的 `version`** 核对（防装错版本）
- 坑：Release 附件名与 manifest 期望不一致 → 404
  解法：**Release 附件名 = manifest 里 `download` 字段的期望名**（本项目 `.../releases/latest/download/lh-world-sync.zip` → 附件必须叫 `lh-world-sync.zip`）
- 坑：只验 manifest 的 version 就以为发成功
  解法：线上验证要端到端 —— `Invoke-WebRequest -Method Head` 打那个 latest URL，`HTTP 200` 且 `Content-Length` 与本地包**一字节不差**
- 坑：拿字节数当内容结论 —— clone 的 git 工作区文件比 zip 大 21/32/292/408 字节，**恰好等于各自行数**
  解法：纯 CRLF vs LF（`core.autocrlf` 转的），`Compare-Object` 逐行是 **0 差异** ⇒ 覆盖别人的仓库前先**逐行 diff**，别拿字节数当结论
- 坑：`gh release view --json isLatest` 在 gh 2.98 **不是合法字段**
  解法：看 Latest 要用 `gh release list`
- 坑：自己编发布用的 git 身份
  解法：从旧仓库的提交里读 —— `git -C <旧clone> log --format='%an <%ae>'`；本项目一直是 `Ryuka16 <107329769+Ryuka16@users.noreply.github.com>`
- 坑：中文内容走命令行会乱码
  解法：发布固定流程一律走文件 —— `git add -A` → `git commit -F <commit-msg 文件>` → `git push origin main` → `git tag vX.Y.Z` → `git push origin vX.Y.Z` → `gh release create vX.Y.Z <zip> --title vX.Y.Z --notes-file <notes 文件>`

### 测试、自检与方法论（§5 铁律 / §6）

- 坑：同一件事有几条路径，只检查一条
  解法：有 N 条入口，就检查 N 条都过了同一个判据
- 坑：只改一处的「有效目标值」规则 → **永久假差异**：恢复 → 刷新 → 报完全一样的差异 → 再恢复，永不收敛，用户会以为模块坏了
  解法：不变量「你看到的目标值 = 实际写入的值 = 账本记下的值」—— 差异检测、实际写入、回档账本三处必须共用同一条规则（本项目抽成 `keepSelfEnabled(key, 快照值, 当前值)`）
- 坑：改完只信自己的改动 —— 本项目出现过 **8 次以上**「声称修了、实际只改了一半」：声称改了注释却漏了代码、改了函数体却没改参数名、把 `to` 的规则改了三处中的一处
  解法：每处改动后 grep 回读，并用断言把「签名」与「函数体」绑在一起
- 坑：只写文本断言 —— 文本断言只能证明「代码里有这句话」
  解法：优先写**行为断言**（本项目正是靠行为断言抓到过一次「头注释声称改了、代码只改了一半」）；做法：`vm.createContext` 加载真实脚本 + 打桩，落在 `%TEMP%\wsync-v1xx-test.js`，九套脚本共 **608 + 27 = 635 项**；v1.3.4 新增 `_tests\assert_folders.js`（27 项）
- 坑：新加的超时/并发能力直接用 `AbortController` —— `vm` 沙箱里没有该 API 会让**全部测试直接崩**
  解法：用**探测式**写法，如 `typeof AbortController !== "undefined"`
- 坑：审阅期间还在改代码 —— 审阅者原话「**审阅对象是移动靶**」，行号全部漂移，复核成本翻倍
  解法：审阅期间**冻结代码**
- 坑：改动一次几十处
  解法：改动**单轮不超过 10 处**；每改一处立刻写断言
- 坑：把防御性代码里的版本标记当废话删掉
  解法：模块 **3277 行**（v1.3.4 实测；v1.3.3 是 2955 行），其中约一半是防御性代码，`vX.Y.Z（第 N 轮盲审 Sx）` 的标记就是「这里死过人」的墓碑，**别删**
- 坑：审查教训不落盘
  解法：每轮审查的错误与修法必须落成 MD 存档（本机约定见 `FVTT技术资料\审查记录\`），否则下一轮会重复问同一件事
- 坑：交付前不做终检
  解法：交付前跑一遍《血的教训-代码审阅自检清单篇》的 14 项
- 坑：陷入「越修越多、越修越怕」
  解法：用户明确的收手标准（值得继承）—— **「只修会伤到你的，其余记档」**：会丢数据/永久卡死的修，提示措辞/极端场景防护的记档并写明影响范围

---

## 血的教训-CSS面板配置篇

### 全局 CSS 碾压（本文件核心）

- 坑：**路径输入框缩成 32px「两个字符小方块」** —— 用户原话「选择文件夹左边有一个特别特别小的小框，点它能点成蓝框，明显是个输入栏，两个字符大小」
  解法：模块按钮必带 `width: auto !important`（FVTT 全局 `body.game .app button { width: 100%; margin: 0 1px; }`，`public/css/foundry2.css:11805-11807`，特异性 `(0,2,2)` 高于 `.vlab-btn` 的 `(0,1,0)`，**必须 `!important`**）+ flex 行里的按钮 `flex: 0 0 auto`（`flex-grow:0 flex-shrink:0 flex-basis:auto` → 内容宽度，不撑满）
  证据：F12 实测 `行display:'flex'`、`行宽度:'902px'`、`输入框flex:'1 1 0%'`、**`输入框宽度:'32px'`**、子元素 3 项（input + 2 button）
- 坑：误判「flex 失效」或「CSS 没加载」
  解法：判据链 —— 在 flex 容器里按钮 `flex-basis` 默认 `auto`，`auto` 取 `width` → 每个按钮 `width:100%` = 整行宽（如 902px），两个按钮直接占死整行；input 的 `flex: 1`（= `flex: 1 1 0%`）确实生效了，**但没有正剩余空间可分**，只能停在 `flex-basis: 0%`，只剩 `padding 14×2 + border 2×2 = 32px`（`box-sizing: border-box` 下 padding+border 是硬下限）
- 坑：`* { box-sizing: border-box }`（`foundry2.css:14`）带来的最小宽度被当成 bug
  解法：理解数学 —— `0 + 14×2(padding) + 2×2(border) = 32px` 就是「两个字符小方块」的精确来历
- 坑：以为 `input` 也被全局 `width` 污染
  解法：**`input` 不写 `type` 属性时**，FVTT 的 `input[type="text"] { width: calc(100% - 2px) }`（`foundry2.css:11663`）**不匹配**（属性选择器只匹配显式 `type="text"`，不匹配默认值）⇒ 问题只在按钮
- 坑：`@layer` 能保住模块 CSS
  解法：CSS 规范上未分层 CSS（模块）优先级高于分层 CSS（FVTT 全局，`foundry2.css:57` `@layer variables.base` 等），**但 `@layer` 不影响特异性** —— `.vlab-btn`（1 类）仍会被 `body.game .app button`（2类2元素）在特异性上压过，该属性 FVTT 生效 ⇒ 必须 `!important` 或提高自身特异性

### Application / Dialog 版本与参数

- 坑：`extends foundry.applications.api.ApplicationV2` → **模块静默失败**：进世界后「选择打开点击加载没反应，F12 也没弹任何东西，重新打开 mod 选择它还是关的」，模块 init 阶段静默失败、Foundry 把开关弹回
  解法：改用用户已验证可靠的 `new Dialog` 金标准
- 坑：`new Dialog(data, options)` 的 `classes` / `width` / `height` / `resizable` 误放第一个 `data` 参数 → 窗口没拿到 `.video-lab-app` 类 → 所有 `var(--vlab-*)` 变量未定义，面板出来了但样式全丢、按钮黑字
  解法：选项**全进第二参数**（构造器只把第二个参数交给 Application）；`width: 680, height: 520, resizable: true, popOut: true`（v1 Dialog 默认 `popOut:true`，`application-v1.mjs:244`）；`dlg.render(true)` 强制渲染
- 坑：FVTT 强制 `themed theme-light` → 深色面板黑字压面
  解法：`classes: ["video-lab-app", "theme-dark"]` 自带 `theme-dark` + 关键文字 `!important`
  证据：`client/appv1/api/application-v1.mjs:81` 给 v1 应用强制 push `themed theme-light`（除非 classes 已含 `theme-dark`）
- 坑：预览弹窗挂在 `$("body")` → 主面板正常但点开的预览/权限弹窗按钮黑字
  解法：CSS 变量挂到 Dialog window 元素（`data-theme` 直接上窗口）+ 弹窗自己重新声明一份变量，或直接写死色值（弹窗不是 `.video-lab-app` 的子元素，`var(--vlab-*)` 拿不到）
- 坑：用内联 `onclick` 绑定面板事件 —— 会被 `HTMLField` 剥掉
  解法：用 document 级委托（`$(dlg.element).on("click", "[data-act]", handler)`）

### 图标

- 坑：文件夹行左边的 `<i class="fa-solid fa-folder-tree">` 渲染成两个字符大的空白小框
  解法：别用单独 icon 当装饰占位；图标只放在有文字的按钮里
- 坑：Dialog 底部按钮 `icon: "fa-solid fa-xmark"` 显示成「fa-solid fa-xmark 关闭」（被当**纯文本**渲染）
  解法：`icon: '<i class="fa-solid fa-xmark"></i>'`（FVTT 要 HTML）

### 变量名与作用域

- 坑：用了不存在的 `var(--surface)` → 面板透明一坨
  解法：V13 是 `--color-surface`，不是 `--surface`，且深色面板要兜底色（与《血的教训-简单陷阱篇.md》§1.12 同一条）

### 诊断方法（两次误诊的根因）

- 坑：**两次误诊「CSS 没加载」** —— ①拿 `<link rel=stylesheet>` 去查，查错了加载方式；②诊断时面板没打开导致 `.vlab-folder-input` `querySelector` 不到
  解法：①FVTT v13 模块 CSS **不是 `<link>`**，而是 `<style>` 标签内 `@import "{{src}}"` 注入（`templates/views/layouts/main.hbs:38-54` 的 `{{#each styles.modules}}@import "{{src}}"`）⇒ 查 `@import` / `document.querySelectorAll('style')`，**不要查 `document.styleSheets[].href`**（顶层 href 查不到 @import 嵌套）；②判断某条规则是否生效，直接 `getComputedStyle(元素).height` 等**实测 computed 值**，别用 querySelector 是否找到元素来推断
- 坑：分不清「没加载 / flex 失效 / 空间被抢」三件事
  解法：用三段诊断代码（§2.7）：①`[...document.querySelectorAll('style')].map(s => s.textContent).find(t => t.includes('video-lab'))` 判 `是否注入`；②`getComputedStyle(el)` 取 `{高度, flex, 宽度, 背景}`（`flex:'1 1 0%'` 但 `宽度:'32px'` = flex 生效但空间被抢，查按钮）；③查 `.vlab-folder-row` 的 `行display / 行宽度 / 输入框宽度 / 输入框flex / 子元素清单`
- 坑：面板样式不对就先怀疑文件没传上服务器
  解法：先 grep FVTT 源码 `foundry2.css`（本机路径 `F:\BaiduSyncdisk\FVTT\Foundry Virtual Tabletop\resources\app\public\css\foundry2.css`，14265 行），锁定是不是 `body.game .app button/input { width:100% }` 这类全局规则在覆盖你
- 坑：改完 CSS 用户看不到新样式
  解法：**每修一处 CSS 都升版本号 + 让用户 Ctrl+F5 强刷**（FVTT 会缓存模块 CSS）
- 坑：从零发明面板做法
  解法：做面板前先读《血的教训-开工方法论篇.md》§2 资料索引（grep FVTT 源码、查 gacha-banner 参考 UI、找图标真源的路子全在）

---

## 血的教训-远程盲调UI篇

### ★核心坑：点击命中检测不跟随 transform（8 轮的真正病根）

- 坑：**点扇形侧边牌，本身牌不发亮，旁边那张发亮，点击后选中的是旁边的牌**；而「点扇形中央（顶端）的牌，没问题」；历史抱怨「凯尔特十字横牌点不开」（第 2 张挑战牌 `rot 90` 横放，热区对不上）
  解法：**任何需要点击的元素，不许用 transform 位移定位**（`translate(-50%,-50%)` 视觉挪了、热区留在原地）；定位统一 **left/top 直摆** —— `left: (x - w/2)+"px"; top: (y - h/2)+"px";`；允许保留小角度 rotate 作朝向（±3° 热区误差可忽略）；`rotateY` 3D 翻牌（视觉盒与布局盒同位置镜像）可保留
- 坑：CSS 入位动画 keyframes 里写 `translate` —— `fill-mode:both` 的 to 帧会持续压住内联 transform，等于永远错位
  解法：入位动画 `vtarotIn`（CSS L355-359）**只有 opacity + scale，无 translate**
- 坑：牌位 `.vtarot-slot` 用 transform 居中
  解法：同样弃 transform —— `margin-left: calc(var(--slot-w,92px) * -0.5); margin-top: calc(var(--slot-h,150px) * -0.5);`（CSS L257-266）
- 坑：扇形牌定位依赖 CSS 变量继承
  解法：尺寸**内联写死**，不依赖 CSS 变量继承（FVTT 全局 CSS 静默碾压是另一个坑）；`renderFan` 初始堆叠 style 也只留 `left:50%;top:50%;z-index:i`（L118），无 transform，transition（CSS L383 `left/top/transform .55s`）负责从堆叠滑到弧线

### 几何与比例（改动前必须跑验证脚本）

- 坑：弧角 ±60° 让扇形横向铺满 + 两端牌下探，用户嫌「横」
  解法：`const FAN_START = -48, FAN_END = 48;`（弧角 ±48°）
- 坑：弧顶牌越界出画
  解法：**出界保护公式** —— 弧顶牌（角度 0）中心 `y = cy − r = 0.14h`；牌顶 `= 0.14h − fanH/2 ≥ 0 ⇒ fanH ≤ 0.28h`，留 8px 余量 ⇒ 上限 `h*0.28-8`；`const fanH = Math.min(Math.max((r * totalRad) / ((n-1) * 0.4 * 0.62), 60), Math.max(60, h * 0.28 - 8));`；hint 条已挪到底部（CSS L368 `bottom:14px`）不占顶；已验证 1200×700 / 900×450 / 700×380 三种尺寸四边零越界（`_fancheck.mjs` 输出）
- 坑：**牌比例被「顺手优化」从 0.62 改成 0.72**（注释写「更宽」，没人要求）→ 之后所有「横 / 矮胖」抱怨全由此引发，治了 6 轮自己造的伤
  解法：牌宽高比 **0.62 定案**（标准 RWS 500×838≈0.597 瘦高）；**0.72 永远不许再改宽**；没被要求的「顺手优化」一律不做；调不动时回滚到「用户说过挺好」的版本值
- 坑：凯尔特十字第 2 张「挑战/障碍」`rot: 90` 横牌在此环境点不开
  解法：改为 `{ x: 0.58, y: 0.38, rot: 0 }`（竖放）+ x 从 0.5 错开 0.08；第 1 张「现状」`{ x: 0.5, y: 0.48 }`，两张错开保证都可点
- 坑：改扇形几何不重跑验证脚本
  解法：`_fancheck.mjs` 与 `fanGeom`/`spreadFan` 同公式，**改几何必须重跑**
- 坑：弦长/半径公式靠眼估
  解法：定案公式 —— `cx = w/2; cy = h*0.95; r = Math.min(w*0.9, cy - h*0.14); totalRad = ((FAN_END-FAN_START)*Math.PI)/180; fanW = fanH*0.62;`
- 坑：扇形牌 z 序混乱（中央牌没在最上层）
  解法：`zIndex: 10 + Math.floor(n - Math.abs(k - mid) * 2)`；transform 只留 `rotate(${(-angle * 0.05).toFixed(1)}deg)`（±2.4° 微倾）

### 事件与交互

- 坑：内联 `onclick` 被 `HTMLField` 剥掉（ChatMessage 的坑）
  解法：document 级事件委托 + `ev.target.closest("[data-act]")`（本模块自绘 DOM，但统一用委托防坑）
- 坑：大卡弹窗点内容区就关掉
  解法：`.vtarot-card-popup`（CSS L409+）fixed `inset:0` `z 80`，`data-act="close-popup"`，点内容区不关（tarot.js L376-385 判断 `box.contains`）
- 坑：全屏 overlay 重复创建（点多次叠多张）
  解法：单例 —— `renderTarotApp()` 里 `_app.is(":visible")` 时直接 return（L426-427）

### 语法与本地校验

- 坑：**英文半角引号炸模块** —— `deck-cn.js` 中文牌义里混入 7 处 U+0022 直引号（如「别用"勇气"为鲁莽买单」）→ 字符串提前闭合、`SyntaxError: Unexpected identifier`、模块整体静默加载失败
  解法：中文文案交付前用正则扫 `["\u0022]`，一律改「」
- 坑：**`node --check` 误判通过** —— `$LASTEXITCODE` 只反映最后一条命令，`if($LASTEXITCODE -eq 0)` 掩盖了前面文件的报错
  解法：**逐个文件查退出码**，别用一条 `if` 打包

### 部署与版本一致性

- 坑：**旧代码缓存/部署不一致** —— 曾出现「诊断 0 张牌 vs 截图 20 张牌」（新旧代码混跑）
  解法：**每次听反馈前先拿 `window.__LHTAROT_VER`**；版本号必须在 `module.json` + JS 头部注释 + 探针变量**三处同步升**
  证据：`tarot.js` L17 `window.__LHTAROT_VER = "1.3.9"` —— **版本探针，远程调试生命线**
- 坑：以为 Ctrl+F5 就够
  解法：浏览器需 Ctrl+F5 强刷（`module.json` version 变更会触发新 URL）；部署 = 复制粘贴整个文件夹到服务器 `Data/modules/lh-tarot/`

### 臆造 API

- 坑：**文件重命名/删除 API 不存在** —— 别臆造 `FilePicker.rename`
  解法：v13 `dist/files/files.mjs` 的 `manageFiles` 只有 `browseFiles` / `createDirectory` / `configurePath` 三个 action
- 坑：`FilePicker.browse` 传了 `extensions` 参数反而出问题
  解法：去掉该参数，自己按后缀过滤（`mp4/webm/ogv/mov/m4v`）

### 音效

- 坑：音效广播给全桌
  解法：`(foundry.audio?.AudioHelper || AudioHelper).play({src, volume, loop:false}, false)` —— **第二个参数 `false` = 只本地播不广播**（`helper.mjs:413`）

### 「横」之战时间线（每轮一个坑 · §4）

- 坑：v1.3.2 `rotate(angle)→rotate(-angle)`，同时**擅自把牌比例 0.62→0.72** —— 用户反馈「横着细长；横牌点不开」，比例改宽 = 自创「矮胖横」之病
  解法：回滚比例到 0.62（v1.3.8 才做）；没被要求的优化一律不做
- 坑：v1.3.3 弧角 ±65→±40、`rotate` 改 `-angle*0.15` —— 治的是 rotate，真病是比例 + 定位
  解法：先问「用户的现象词是什么意思」再动手
- 坑：v1.3.4 弧角 ±40→±60、圆心/半径重算 —— 继续在几何里猜
  解法：同一根因改两次无效 = 根因错，必须换根因
- 坑：v1.3.5 尺寸改内联写死，但截图仍横（诊断显示旧 JS）—— 没先拿版本号
  解法：先拿 `window.__LHTAROT_VER` 排除旧代码
- 坑：v1.3.6 加版本探针后量牌诊断「146×203 竖牌 9°」证明是竖的，但仍没问「横指什么」
  解法：把用户的现象词反问锁定含义（「横」= 横躺 90°？太宽？整体铺开？）
- 坑：v1.3.7 `rotate` 0.15→0.05 —— 同一根因改第 4 次
  解法：有了新证据才允许换根因
- 坑：v1.3.8 比例 0.72→0.62，仍横 + 新线索「点侧边牌旁边亮、中央正常」；比例对了一半，热区错位未识破
  解法：这句「中央正常侧边错位」一句就能锁定热区错位 —— **它本可以在第 2 轮就问出来**
- 坑：v1.3.9 `left/top` 直摆弃 transform + fanH 出界保护 + 弧角 ±48 + 挑战牌竖放 —— 未验收，用户喊停
  解法：**每轮复盘 SOP** —— ①先拿 `window.__LHTAROT_VER` ②再要一张截图 / 让用户描述「哪里正常、哪里不正常」的对比 ③把用户现象词反问锁定含义 ④有了新证据才允许换根因

### 未验收 / 重启须知（§5）

- 坑：以为「语法全过、几何模拟全绿」= 验收通过
  解法：诚实清单 —— v1.3.9 **未经用户视觉验收**（用户停止调试）；未验证项：①`left/top` 直摆后侧边牌点选是否正常（理论上热区=视觉，但 left/top 方案本身不依赖该结论即可工作）②扇形 ±48° 观感 ③挑战牌竖放观感；**若重启：第一件事拿截图 + 版本号，一个像素都不许猜**

---

## 血的教训-教学视频库优化篇

### 游戏内删服务器文件（§1）

- 坑：模块做成 FilePicker browse 模式（点文件 = 复制路径）来实现「清理临时文件夹」，用户点「清除临时」发现**根本删不掉**
  解法：**Foundry 游戏内任何代码都无法自动删除服务器文件** —— 模块做「清单面板」（浏览/预览/发送/复制路径），删除引导用户服务器侧手动删；本模块 v1.6.3 最终形态：清理面板 = 浏览 `vlab-temp`，底部固定文案「**FVTT 源码不支持删除文件，请在下方地址手动进行删除：Data/vlab-temp/**」+ 一键复制文件夹地址
  证据一（文件 socket）：`F:\BaiduSyncdisk\FVTT\Foundry Virtual Tabletop\resources\app\dist\files\files.mjs` 的 socketListeners 里 `manageFiles` **只有三个 action**：`browseFiles` / `createDirectory` / `configurePath`，没有删除
  证据二（HTTP 路由）：`dist/server/views/view.mjs` 的 View 基类只有 `hasGet` / `hasPost`（`_methods` 只收 get/post），全部 views（auth/players/game/join/setup/license/update/quit/api/upload/error）无一有 delete 方法 ⇒ **游戏内任何代码发 HTTP DELETE 都是 404**
  证据三（模块代码跑在哪）：模块的 esmodules/scripts 只由 `dist/server/views/view.mjs` 的 `_getStaticContent` 注入**客户端 HTML 页面**，Node 端根本不加载模块代码（dist 全库无加载机制）→ 浏览器代码摸不到服务器硬盘
- 坑：以为 origin-vault（`01_跑团工具\Foundry模块\sora的专属mod，未使用，作为参考\origin-vault`）界面「能删文件」= 磁盘删除
  解法：它是**索引删除** —— `LibraryData.js:1181` 注释原话「由于 Foundry VTT 不支持 HTTP DELETE，我们使用标记删除法」，`LibraryData.js:1184-1204` `removeItem` 只写 `item.deleted=true`；`AssetData.js:233` / `ThumbnailManager.js:699-706` 里的 `fetch('/'+relativePath,{method:'DELETE'})` 是「尝试」删除，catch **静默吞失败**
- 坑：想用 socket 绕过去
  解法：走不通 —— 模块 manifest 的 `"socket": true` **只是布尔字段**（出处 `common/packages/base-package.mjs:387`），不等于给了服务器权限；`game.socket.emit/on` 只转发 `module.<id>` 和 `system.<id>` 命名空间，`world.*` 被**静默丢弃**；模块代码没跑在 Node 侧，socket 转发的两端都是浏览器，永远到不了 fs
  证据：用户世界实测坐实（`之前踩过的坑.txt:89`）

### 剪贴板（§2）

- 坑：用户贴日志 `复制失败：Cannot read properties of undefined (reading 'writeText') @ foundry.mjs:115132`
  解法：**HTTP 服务器上 `navigator.clipboard` 是 undefined** —— 浏览器把 HTTP 页面视为**非安全上下文**，这不是代码笔误，是浏览器安全策略；复制一律用 `game.clipboard.copyPlainText(text)`（官方 API 自带降级：先查 `navigator.permissions`，有 granted/prompt 走 `writeText`，否则降级 `document.execCommand("copy")`）；**模块里所有复制动作一律用它，别自己碰 `navigator.clipboard`**
  证据：`F:\BaiduSyncdisk\FVTT\Foundry Virtual Tabletop\resources\app\client\core\clipboard.js:19-34`；用户服务器 `http://146.56.232.12:30000`

### 自绘深色面板：底部标准按钮黑字落黑底（§3）

- 坑：白色主题下按钮正常，深色主题下「复制文件夹地址 / 刷新 / 关闭」纯黑看不清
  解法：模块作用域内显式覆盖 —— `.video-lab-app .dialog-buttons { background: var(--vlab-bg2) !important; border-top: 1px solid var(--vlab-border) !important; }` + `.video-lab-app .dialog-buttons .dialog-button { background: var(--vlab-surface2) !important; border: 1px solid var(--vlab-border) !important; color: var(--vlab-text) !important; }` + `:hover { border-color: var(--vlab-accent) !important; color: var(--vlab-hover-text) !important; box-shadow: 0 0 12px var(--vlab-glow) !important; }`
  证据：`.video-lab-app.window-app` 用 `background: var(--vlab-bg) !important` 把**整个窗口（含底部 `.dialog-buttons` 按钮栏区域）**染成主题底色（deep 近黑 `#0a0a0c`），但 Dialog v1 底部按钮 `.dialog-button` 走 FVTT 全局默认样式（深色字）；官方模板类名出处 `...\resources\app\templates\hud\dialog.html:4-6`
- 坑：铁律没记住 —— 「凡窗口整体染色的设计，Dialog 底部标准按钮区必须一并覆盖，不能只覆盖自绘元素」

### 版本探针与部署整包替换（§4）

- 坑：**混合版本事故** —— 用户说「升级了」，实际 `window.__VLAB_VER` 还是 `"1.6.0"`，且服务器仍请求 `modules/lh-video-lab/lang/cn.json`（该文件 v1.6.0 起已删）报 404；报错行号也是旧版行号 —— 诊断结论：用户只覆盖了 scripts/styles 两个文件，**没换 module.json**，新版整个没生效
  解法：①模块版本**三处同步**：`module.json version` + JS 头注释 + 探针 `window.__VLAB_VER = "x.y.z"`（探针变量在 ready 前尽早赋值）②远程调试第一步永远是拿探针版本 ③部署指引必须写「**整包替换**」：删服务器 `Data\modules\lh-video-lab` 整个文件夹 → 解压 zip → 提醒解压时选「解压到 lh-video-lab」防双嵌套 `lh-video-lab\lh-video-lab` → Ctrl+F5 → 探针验版
- 坑：`Compress-Archive -File` 只包顶层文件会**漏 scripts/styles 目录**（zip 异常小 3.5KB 才发现）
  解法：用 `-Path` 列全条目（`module.json`/`README`/`LICENSE`/`scripts`/`styles`）；zip 条目分隔符是**反斜杠**，抽验用 `GetEntry("scripts\\video-lab.js")`

### 粘贴 / 拖拽批量导入面板（§5）

- 坑：文件拖不进面板，或误触发归组等既有拖拽逻辑
  解法：`dragover` 必须判 `Array.from(e.originalEvent.dataTransfer.types).includes("Files")` 才 `preventDefault` + 高亮类；**归组等既有拖拽 handler 加同款 Files 守卫 return**；`drop` 里 `stopPropagation` 后开导入面板；面板 render 时挂 `dragover`/`drop`/`dragleave` 到 window 元素
- 坑：Dialog 确认按钮读不到批量导入面板的行状态（radio/checkbox/改名 input）
  解法：在 callback 里 `dialog.element.querySelector` 读 DOM，**别存闭包变量**（DialogV2 教训：内联事件不触发，callback 读 DOM 才是正解）
- 坑：剪贴板粘贴拿不到文件
  解法：document 级 `paste` 监听，`clipboardData.items` 取 `image/*`/`video/*` 的 `getAsFile()`；拿到 file 走批量导入面板，拿不到但剪贴板是文件路径文本 → 提示走本地上传按钮
- 坑：剪贴板图片文件名全是 `image.png`，批量导入重名覆盖
  解法：正则 `/^image\.(png|jpe?g)$/i` 判无名图，默认名给 `粘贴-时间戳.ext`；防重名 `used = new Set(dirSetCache)`，撞名加 `-1`/`-2`
- 坑：多选文件开多个窗口 / objectURL 泄漏
  解法：`openImportPanel(files)` **单例追加模式**（面板存在则往列表追加行，不新开窗口）；**objectURL 用完 revoke**，批量导入 `finally` 里统一回收
- 坑：导入动作顺序错（未建目录就上传 / 未加载列表就发消息）
  解法：`FilePicker.createDirectory` → `FilePicker.upload` → 按勾选 `sendDirect`（私聊/群发走 `ChatMessage.create`，`whisper` 数组）→ **有留存才 `loadList` 刷新列表**
- 坑：每行内容缺失（无缩略图/去向/是否发送）
  解法：每行 = 缩略图（图片 `objectURL` 点击开 ImagePopout 灯箱；视频 `<video preload="metadata" muted>` + 预览按钮 `window.open(objectURL)`）+ 改名 input + radio 去向（留存/临时，**临时默认**）+ checkbox 是否发送（**默认勾**）

### cmd 批处理（已弃用方案，教训留存 · §6）

- 坑：曾做 `vlab-cleanup-temp.bat` 让用户双击删 `vlab-temp`（后来用户要求通用化、已删），实测翻车两次 —— **坑一**：UTF-8 编码下 `chcp 65001` 切换代码页会破坏 cmd 缓冲解析；**坑二**：LF-only 换行会吞下一行行首字符（`echo`→`cho`、`del`→`el`、`set`→`ET`）
  解法：文件编码 **GBK(936) + CRLF 换行**，实测通过 —— PowerShell 里用 `[IO.File]::WriteAllText($p, $text, [Text.Encoding]::GetEncoding(936))` 或先写 UTF-8 再转码；换行写 `\r\n`
  证据：报 `'cho' is not recognized`

### 沿用的既有金标准（§7）

- 坑：`new Dialog` 的 classes/width/resizable 放错参数
  解法：`new Dialog(data, { classes, width, resizable, ... })` —— CSS 变量和 classes 放**第二参数**（第一参数只放 content/title/buttons）
- 坑：按钮 `icon` 用纯字符串
  解法：`icon` 用 `<i class="fa-solid ...">` HTML
- 坑：聊天图片放大双开
  解法：document **捕获阶段**委托 + ImagePopout —— `game.mjs:2018` 冒泡阶段 `_onClickHyperlink` 无条件 `preventDefault + window.open`，捕获阶段 `stopPropagation` 才不双开
- 坑：场景按钮轮询被主动停掉
  解法：1500ms 常驻轮询 `insertAfter("button.control.ui-control.layer.icon.fa-solid.fa-bookmark")`，**严禁 `clearInterval` 即停**（切场景重建 DOM）
- 坑：被 V1 `Application` deprecation 警告吓到去改 V2
  解法：**刻意选择**留在 v1（Dialog 金标准），v15 前安全，v16 才需要迁 V2

---

## 本次未能确定的问题

- **`building` / 骨架字段外的 world-sync 折叠项**：无（四篇均已读到末尾，行数与总行数一致：世界同步装置 551、CSS 面板 216、远程盲调 160、教学视频库 212）。
- **世界同步装置篇 §2.7 的「写锁失败必须提示」在 UI 上的具体写法**：原文只给出「必须提示『本次未做互斥检查』」这句话，没有给对应的函数名 / DOM 锚点 / 提示文案串的落点，无法据此定位代码位置。
- **世界同步装置篇 §2.9 回档侧「本次建的夹子」如何标记**：原文只说删夹子要同时满足「本次建的 + 当前没被任何包引用 + 没有子夹」，但没写「本次建的」这个标记存在哪里（账本字段名 / 内存集合），需要复现确认。
- **远程盲调UI篇 §5 三项未验证项**（left/top 直摆后侧边牌点选、±48° 观感、挑战牌竖放观感）原文明确标注「未经用户视觉验收」，属未结论状态，不是我能补的。
- **教学视频库篇 §6 的 bat 方案最终被删**：原文说「后来用户要求通用化、已删」，但没说替代方案是什么（是否完全由模块内面板 + 手动删取代）——按 §1.4 推断是，但原文未明说。
- **CSS面板配置篇引用的《血的教训-简单陷阱篇.md》§1.12 与《血的教训-开工方法论篇.md》§2 资料索引**：本次任务未包含这两个文件，未读，故 §1.12（`--surface` vs `--color-surface` 同条）与 §2 的资料索引内容无法核对。
<!-- 来源：11 篇小篇（midi-otherActivity / 之前踩过的坑 / 妄质百变腕甲 / 勘误与待办 / DialogV2 / 代码审阅自检清单 / 发布校验与查证纪律 / 开工方法论 / 桥接工具链 / 第三方同步并发写 / 简单陷阱） -->

# FVTT 踩坑速查（11 篇提取）

> 说明：`证据` 行号 = 该小节标题所指文件的原始行号。全部 11 篇已整读，未修改任何文件。

## midi-otherActivity-源码级结论.md

### otherActivityId 字段归属与绑定方向
- 坑：以为 `otherActivityId` 是 dnd5e 核心字段，纠结「核心 vs midi 谁说了算」
  解法：它是 **midi-qol 注入**的，只有一套机制「主活动指向子活动」；核心唯一的活动引用机制是 Forward 活动（`module/data/activity/forward-data.mjs` 的 `activity.id`）
  证据：L14-15、L21
- 坑：把 `otherActivityId` 写在子活动上（方向反了，子→主）
  解法：写在**主活动**顶层，值 = 被引用**子活动**的 id 或 identifier；只有 `attack`/`check`/`save`/`utility` 能当主
  证据：L28；Changelog:1246「Remove otherActivity setting from summons, cast, damage, forward, enchant and heal activities」
- 坑：工具文档把 `linkedTo` 描述成「子→主」，把人带反
  解法：实现是 `src/minimal.ts:185-191` `common.otherActivityId = target`（当前活动 → 目标活动）；文案已改为「主活动用：填被引用子活动的 name」
  证据：L117-120

### attack 的 otherActivityId 空串默认值（双份伤害真根因）
- 坑：`attack` 的 `otherActivityId` 默认 `""` = **自动探测 auto**，item 上任何「合格 + compatible」的活动都会被自动绑上 ⇒ 点一次攻击连带别人的豁免与伤害
  解法：显式写 `otherActivityId: "none"`
  证据：L34-37、L44；机制源头 `src/minimal.ts:1004` `otherActivityId: hasSave ? SAVE_KEY : ''`
- 坑：把「同 item 双份伤害」归因于 `otherActivityCompatible` 默认 true
  解法：`otherActivityCompatible` 只是**资格标记**（`MidiActivityMixin.ts:186`，`initial:true`），只卡编辑期下拉与自动探测；显式填 id 时 midi 不复查它。真正触发连带的是主活动 `otherActivityId` 为空串
  证据：L46-57（现象对、归因要改）
- 坑：以为「1 个 item 上不能放多个会结算的活动，必须拆成独立 item」（旧规范 `FVTT-monster-spec-v2_1.md:18/:54`）
  解法：把**每个**活动的 `otherActivityId` 显式写成 `"none"` 即可共存，不必拆物品
  证据：L132-134（2026-09-15 实机验证通过）
- 坑：以为 `utility` 不会被 auto 绑上
  解法：合格名单 `possibleOtherActivity` 含 `utility`（true：damage/heal/save/check/utility/contested-check；false：attack/enchant/summon/cast/forward/overtime/transform），所以 utility 同样会被连带，一样要显式 none
  证据：L51-52

### 弹窗规则
- 坑：以为有某个设置能关掉「选择活动」弹窗
  解法：候选筛选 = `canUse !== false && !riders.includes(id) && !midiProperties.automationOnly && !inProgress`；**0 个跳过 / 1 个直接用 / ≥2 个必弹**，无设置参与。要避免弹窗就给子活动标 `automationOnly: true`（从候选消失，主活动显式 otherActivityId 仍能调它）
  证据：L69-71

### 设置项幻觉
- 坑：去设置里找「自动合并行动」（`autoMergeActivityOther`）
  解法：**13.0.55 已不存在**该设置（12.4.31 起源码移除，只剩 i18n 文案）；用户导出的 `fvtt-midi-qol-settings.json`（1765 行 / 45.1 KB，`flags.exportSource` 明写 `midiVersion: "13.0.55"`）全文搜 `otherActivity` **0 命中**，搜 `merge` 只有 5 处全是聊天卡合并（`mergeCard`/`mergeCardCondensed`/`mergeCardMulti`/`mergeCardMultiDamage`）
  证据：L59-65

### 双份伤害机制 / useCondition
- 坑：想让「要么命中、要么豁免」只出**一份**伤害，却在 attack 与 save 都填了伤害
  解法：`MidiActivityMixin.rollDamage` 先掷主活动自身伤害（`super.rollDamage` → `setDamageRolls`），再 `if (this.otherActivity)` 走 `rollOtherDamage()` → `setOtherDamageRolls` ⇒ 两份都算、两次独立判定。要一份伤害就 **attack 活动不填伤害、伤害全放子活动**（Changelog:1772）；Dragon Slaying 是叠加模型（Changelog:1771）
  证据：L75-78
- 坑：不清楚子活动 `useConditionText` 何时求值、能用哪些变量
  解法：`buildOtherDamageMatches()` 对命中集合（attack 主活动 = `hitTargets ∪ hitTargetsEC`，非 attack = 全部 `targets`）逐目标 `evalActivationCondition` 求值**一次**，缓存在 `workflow.otherDamageMatches`；空条件 = 全部匹配，全被过滤 = 子伤害不掷；有 `consumption` 则延迟到 `rollDeferredOtherDamage`。可用变量 = `createConditionData()` 完整 rollData：`@target`(.saved/.failedSave/.superSaver/.isHit/.raceOrType/.items…)、`@targetUuid`、`@w`/`@workflow`、`@activity`、`@item`、`@raceOrType`/`@typeOrRace`、`@items`、`@worldTime`、`@options`、`@damageTypes`、`@isAttuned`、`@humanoid`、`@canSee`/`@canSense`
  证据：L80-86

### 工具包自身 bug（foundry-mcp/dsh-foundry-vtt）
- 坑：`src/minimal.ts:1004` `otherActivityId: hasSave ? SAVE_KEY : ''` —— 没有 save 时落空串 = midi 的 auto 探测（《铁棺》「点斩自动骰豁免、没过又额外吃炮击伤害」的确切机制）
  解法：改为 `otherActivityId: 'none'`（已修，现 `:1009`）
  证据：L112-116；《勘误》A0 第 1 条
- 坑：`linkedTo` schema 描述读起来像子→主
  解法：改文案为主→子（已修 `:1155`）
  证据：L117-120
- 坑：verify 段不核 `otherActivityId` 是否为 `''`
  解法：建议当 item 上存在 ≥2 个会结算活动、且任一活动 `otherActivityId === ''` 时推一条 `problems`
  证据：勘误文件 A3（L128-131）

### F12 探针（一次拿全）
- 坑：想抓 otherActivity 的运行时值却不知抓哪些字段
  解法：`const msg=[...game.messages].reverse().find(m=>m.flags?.["midi-qol"]?.messageType); const wf=msg?MidiQOL.Workflow.getWorkflow(msg.uuid):null;` 读 `wf.activity.otherActivityId`（`""`=auto、`"none"`=不绑）、`wf.otherActivity`（**getter，直接是活动对象**，不是 `{activity:{...}}`）、`wf.damageRolls`/`wf.otherDamageRolls`、`wf.hitTargets`/`wf.failedSaves`/`wf.superSavers`、`wf.otherDamageMatches`
  证据：L88-106

### 未闭合（不得当结论）
- 坑：《铁棺》「点**变形**（utility）也要过豁免，没过不给变」——源码说 utility 默认 `"none"`，理论上不该连带
  解法：未解释；需在同类物品上用 L9 探针实抓
  证据：L124
- 坑：`automationOnly: true` 到底是「仅自动化、不可手动使用」还是「只从『选择活动』弹窗里藏掉」
  解法：两说并存，**不选边**，需实测
  证据：L125
- 坑：v12 `autoMergeActivityOther` 的默认值
  解法：原文未给，源码已移除无法核验
  证据：L126

---

## 之前踩过的坑.txt

### 权限边界（玩家 vs GM）
- 坑：玩家客户端给敌人加/删 AE（倒地、状态、标记）、移动敌人 token、改敌人 HP/属性/flag、创建或删除场景文档（Region/Drawing/Tile/Wall/Light/Note）、增删 token → 报 `lacks permission`
  解法：判据口诀「这个操作改的是『我自己』还是『别人/场景』」，后者一律委托 GM；玩家本地能做的是动自己 token、给自己加临时生命/buff、掷骰、发聊天、放 Sequencer 动画（纯视觉）、读取任何可见 token 的 flag/属性（读不需要权限）
  证据：L1-5
- 坑：以为 PL 端那条 permission 日志是真失败
  解法：midi 替你把效果挂到敌人身上时 PL 端会记一条 permission 日志，但实际由 GM 完成 —— 那是噪音；只有宏自己直接对敌操作才是真失败
  证据：L39

### socket 委托
- 坑：socket 频道名写自定义 `world.*`（如 `world.possessionCharm`）→ Foundry 服务器**静默丢弃**，PL emit 的请求 GM 永远收不到；现象极具迷惑性：「GM 自己用能成（走本地直调没过 socket），PL 用没反应」
  解法：`game.socket.emit/on` 只转发 `module.<id>` 和 `system.<id>` 两种命名空间；一律用 `longhua-dm-toolkit` 那条已开 `socket:true` 的合法频道，靠 `action` 字段区分动作
  证据：L32、L88-89
- 坑：借没开 `socket:true` 的模块（如 world-scripter）发消息 → 石沉大海
  解法：该模块 manifest 必须有 `"socket": true`（longhua-dm-toolkit 的 module.json 已开）
  证据：L32
- 坑：socket 监听注册在顶层 → 丢（world-scripter 在 init 期求值时 `game.socket` / `game.users` 还没就绪）
  解法：放进 `Hooks.once("ready", ...)`
  证据：L33
- 坑：多 GM 时重复执行
  解法：`game.users.activeGM` 判定，只让一个动手
  证据：L34
- 坑：同一频道多个监听互相干扰
  解法：同一 `module.<id>` 频道可挂多个监听，各按 `action` 门控（传送门 PortalDevice 与 LHGM 就是共用一个频道）
  证据：L82

### LHGM 委托
- 坑：LHGM 不够用时在每个物品里各写一套 socket
  解法：往 LHGM 的 `apply` 里加一种新 op 类型（一处加、所有物品共享）
  证据：L28
- 坑：ops 里 `move` 的坐标取了中心点
  解法：token 的 x/y 是**左上角**坐标；拿中心点要减 `(width*格子尺寸)/2`（大体型也一样）
  证据：L19、L36
- 坑：委托不带场景 / GM 端用 `canvas.scene`
  解法：委托时带 `sceneId`，GM 端 `game.scenes.get(sceneId)`（GM 可能在看别的图）
  证据：L37
- 坑：Region/传送门双向传送，人刚搬进去就被 Region 传走
  解法：先把目标搬到位、**再造门**
  证据：L38、L45
- 模板写法：对敌/对场景收集 ops 交 GM —— `const ops=[]; ops.push({tokenId:tgt.id, addStatuses:["prone"]}); ops.push({tokenId:tgt.id, move:{x,y,animate:true}}); ops.push({tokenId:tgt.id, deleteFlag:{scope:"world", key:"xxx"}}); ops.push({tokenId:tgt.id, createEffects:[/*AE*/]}); if(ops.length) await globalThis.LHGM?.request({sceneId:canvas.scene.id, ops});`
  证据：L16-22

### 已弃用 / 移动 API
- 坑：用已弃用的 `MidiQOL.moveToken(tk, pos, 布尔)`
  解法：`tokenDoc.update({x,y}, {animate:false/true})`
  证据：L35

### 自动化机制不靠谱（必须进游戏实测）
- 坑：被动/反射伤害（碰到就掉血、光环掉血）——灼炉/凛冬之躯试了三种：CPR（能用但要手动点卡）、`auraDamageEnd`（实测无效）、ActiveAuras+OverTime 光环（图标挂上但不掉血）
  解法：回到 `touchDamage`；这类机制别指望一次成，优先选最简单能用的，留「挂图标 + 手动判」退路
  证据：L42
- 坑：OverTime 经 ActiveAuras 光环送达 → midi 不处理、不掉血
  解法：伤害类光环不要走这条路（只做属性增减益）
  证据：L43、L135
- 坑：effectmacro 的长休钩子（`onLongRest`、`dnd5e.longRest`）实测不触发
  解法：改用原生 `uses` + `recovery: lr`
  证据：L44

### 绝不猜标识符
- 坑：猜过一个不存在的锤子图标 → 空白
  解法：必须 grep 图标库拿真路径
  证据：L49
- 坑：self-centered AoE 按资料库旧规范写 `affects.type:"creature"` + `special:"-self"` → 实测不生效（碎镜猎刃·碎镜爆发）
  解法：正确配置是 `affects.type:"self"` + `special:"-self"`（`type:"self"` 让模板以自身为原点展开，再 `-self` 排除施法者）；2026-07-20 已修正规范 §M3/§5.2/§6
  证据：L50
- 坑：卡面描述里写无机制对应的纯风味文字（碎镜猎刃·镜影残像写了「折射光线让攻击者短暂目眩」但没有任何致盲/劣势/骰子惩罚）
  解法：卡面每个效果描述都必须有对应的真实机制 —— 这种文字是骗人的
  证据：L51
- 坑：手写猜 autoanimations 的 JB2A 键名（模块专属、还分版本）
  解法：复制一份能用的配置 / `isCustomized:false` 让 AA 自动匹配 / 找用户要一份导出
  证据：L52
- 坑：凭记忆记模块 ID / manifest 地址 / `socket:true` 这类规则
  解法：从官方仓库或 Foundry 文档查证（world-scripter 的 id 和 socket 规则都是查出来的）
  证据：L53

### 源文件可能是脏的
- 坑：导出的 `activities` 可能被污染/损坏（篡位者的死颅源文件就是）→ 直接重建干净版本，别沿用
  解法：重建
  证据：L57
- 坑：拿「我上一轮的设计」当真相（上个会话那只 saruk 被加过暗蚀、19-20 重击，与原卡不符）
  解法：规矩 —— **每次重读真实文件**，读真实导出而不是我的总结
  证据：L58

### 调试方法论
- 坑：把日志里成片的 v13 弃用警告（Ray / PreciseText / ChatMessageMidi#user / Math.clamped / CanvasAnimation…）当成 bug
  解法：先过滤，只盯真正的 `Error: permission` / `undefined` / `unregistered handler`
  证据：L62
- 坑：只在 DM 端验就交付
  解法：「DM 能用、PL 不能用」是最强信号，基本就是**权限 / socket / 场景视角**三件事之一；凡是给玩家用的必须以玩家身份实测
  证据：L63

### 内容/卡面规范
- 坑：把实现注释、「DM手动判」、自动化元信息写到卡面
  解法：卡面只写官方口吻的规则文字；这些只进自动化日志
  证据：L67
- 坑：带 Active Effect 的条目只写一处描述
  解法：效果定义（状态名 + 限制什么 + 多久）写**两处**：母条目描述 + 该 AE 自己的 `description`；两处都不写自动化元信息
  证据：L68
- 坑：给官方法术（《5E万法大全》里有的）手写描述/活动
  解法：官方只给清单你自己配；只有自创/改动的法术才写全
  证据：L69
- 坑：术语自译（necrotic / psychic）
  解法：照 §36：necrotic=暗蚀、psychic=心灵；拿不准别自译，问用户
  证据：L70

### 格式与校验硬规则
- 坑：`_id` 不是 16 位随机字母数字 / 中英文名之间空格不对 / 名字带括号 / 一个物品放多个活动
  解法：16 位随机字母数字 id；中英文名间**两个空格**；名字无括号；一物品一活动（怪物可多活动）
  ⚠️ 注：末条已被 `midi-otherActivity-源码级结论.md` 修订（显式 `otherActivityId:"none"` 后同一 item 可多活动）
  证据：L74、L132-134
- 坑：用 `node --check` 校验宏（FVTT 是 async 执行环境，会误报顶层 await）
  解法：按 AsyncFunction 那套贴近真实环境验
  证据：L75
- 坑：动态数值（晶槽数、价格）写死
  解法：实时从 actor/item 读
  证据：L76

### MIDI / dnd5e 协作
- 坑：手写宏去对敌施加效果
  解法：系统能办的（活动 `effects`、伤害、豁免）交系统，midi 把效果应用到敌人时会自动走 GM
  证据：L13、L80
- 坑：save 施加状态的写法不明
  解法：`activity.effects:[{_id, onSave:false}]` + 该 effect 带 `statuses`（onSave:false = 豁免失败才施加）
  证据：L81

### 权限转交 / 临时操控（附身符七连环）
- 坑：effectmacro 的 `onCreate`/`onDelete` 在【effect 拥有者那一端】跑，不是 GM 端；在 `onDelete` 里写 `if(!game.user.isGM) return;` → 整段收尾在玩家端被自己挡掉，GM 端压根没跑这个 effect 的 onDelete（又是「DM 测正常、PL 翻车」）
  解法：onDelete **不加 GM 守卫**；里面需要 GM 权限的活（收回控制权、删敌人标记、代敌人豁免）打包成一个 `cleanup` 经 socket 委托 GM；委托函数自身 `game.user.isGM ? 直接做 : emit 给 GM`
  证据：L91-93
- 坑：★最坑★ `actor.update({ ownership })` 是**深合并**不是替换 —— 收回时写回「不含该 PL 的旧 ownership 对象」，合并语义下 Foundry 只是「没动」那个 key，`PL=3` 纹丝不动；诊断打出来是「恢复后该玩家权限: 3」
  解法：删 ownership key 必须用删除语法 `await actor.update({ ownership: { ["-=" + userId]: null } });`；要还原旧值就 `ownership: { [userId]: 旧值 }`；`delete localObj[key]` 再整体 update **也没用**（删的是本地副本）。通用结论：加权限用合并没问题，**收权限必须 `-=` 删除**
  证据：L95-100
- 坑：unlinked（非链接）token 去改 `tokenDoc.actor`（synthetic）的 ownership → 不生效
  解法：`tokenDoc.actor.isToken===true` 时改基础世界 actor `game.actors.get(tokenDoc.actorId)`，投影 token 继承到 OWNER，玩家才能控制。副作用：附身期间那只怪会临时出现在玩家的角色目录里，收回后消失，正常
  证据：L102-103
- 坑：改完 ownership，玩家手里正选着的 token 不会自动松手（他还能拖）
  解法：收回后顺手发一个 release 信号（同频道一个 action，所有端都处理、放在 GM 守卫**之前**），让控制它的客户端 `canvas.tokens.get(id)?.release()`
  证据：L105-106
- 坑：「受伤挣脱」拿 `updateActor` 的 `opts.dnd5e.hp.value` 当门控（AlwaysHP/midi/手改血 各路径下不可靠）
  解法：`preUpdateActor` 里 `actor.system.attributes.hp.value` 还是更新**前**的真血量，拿它和新值比最稳；污染计数器之类杂改用「本次 change 里没有 hp.value 就 return」挡掉
  证据：L108-109
- 坑：一次性物品让系统自动销毁，打断「用了之后还要跑一长串后续」的流程
  解法：`autoDestroy` 设 false，由宏在恰当时机自己删/退费；智力够高免疫这类「没生效」要**退费**（`uses.spent-1`）不是销毁
  证据：L111-112
- 方法论：每一步都加一行诊断 `console.log` 打出关键值（grant 后权限=? revoke 后权限=?），用真实数值定位是哪一环没成 —— 这次就是 revoke 诊断打出「还是 3」才锁到深合并问题
  证据：L114

### 光环（Aura Effects）
- 坑：用 ActiveAuras 做属性增减益光环，只挂 `isAura:true` 旗标 → 不够
  解法：用 `auraeffects` 模块，把效果**类型**设成 `auraeffects.aura`（效果编辑器里类型会变成「光环」）；所有配置在效果的 `system` 块里：`distanceFormula:"30"`（别找 radius）、`disposition`（1=友方、-1=敌方、**0=全体，不是「仅中立」**）、`color:"#b63535"`、`opacity:0.25`、`showRadius:true` 才显示范围环、`applyToSelf`、`collisionTypes:["move"]` 让墙阻挡、`disableOnHidden`/`combatOnly`/`canStack`
  证据：L115-127
- 坑：`changes` 写哪些键不确定
  解法：`system.attributes.ac.bonus`（AC）、`system.attributes.movement.walk`（速度，乘= mode1）、`system.bonuses.mwak/rwak.damage`（武器伤害）、`system.bonuses.abilities.save`（全豁免）、`system.traits.ci.value`（状态免疫）
  证据：L130
- 坑：忘了补光环旗标
  解法：`flags.auraeffects = {"originalType":"base"}`；效果挂在发光环的 token 身上（如旗帜/图腾 Actor 的被动特性 transfer 效果），token 在就持续发光环，删除/摧毁即停；描述照旧双写
  证据：L131-133

### effectmacro 回合钩子
- 坑：导入带 `flags.effectmacro.onTurnStart`（及其它回合钩子）的效果后钩子不一定立刻生效 —— 表现为只触发一两次后失灵，或干脆不触发
  解法：打开那条效果**原样再保存一次**（或重载世界 F5），钩子即被重新注册、之后每轮稳定触发；验证方法：脚本顶部加 `console.log("...触发", game.combat?.round)` 看 F12 是否每轮打印
  证据：L136-137

---

## 制作妄质百变腕甲-踩坑与新知识.md

### ItemMacro 递归 / completeActivityUse
- 坑：`MidiQOL.completeActivityUse(隐藏活动)` 触发本物品自己的活动时，会再次激发**物品级** `flags.midi-qol.onUseMacroName`（`[postActiveEffects]ItemMacro`）→ 整个宏重跑 → 面板被重开、还能再投、子活动又投一次豁免
  解法：宏顶加守卫 `try{ const an=(typeof workflow!=="undefined"&&workflow?.activity?.name)?workflow.activity.name:""; if(an && !an.includes("拉杆")) return; }catch(e){}` 以及 `if(globalThis.__pvPanelOpen){ return; }`；面板关闭时复位 `globalThis.__pvPanelOpen=false`。宏只是 hook，提前 return 不影响 midi 结算
  证据：L10-17
- 坑：`await completeActivityUse` 之后再关面板 → 面板卡到伤害全部结算完才关
  解法：出结果后**立刻 `setTimeout` 安排关闭**（普通 3.4s / 大奖 5.2s），与 completeActivityUse **并行**；点结果卡也立即关
  证据：L19-20

### DialogV2 content 净化
- 坑：DialogV2(v13) 会清洗 content 里的 `<style>`/`<svg>`
  解法：content 只放 `<div class="pv-mount"></div>`，渲染后用 JS `innerHTML` 注入面板 HTML（保住 SVG）；CSS 用 `document.createElement('style')` 塞进 `document.head`，关闭时按 id 移除
  证据：L22-23

### Active Effect / 效果
- 坑：纯 `changes`、无 `status` 的效应默认不在 token 上显图标
  解法：`flags.dae.showIcon:true` + **临时** `duration` + 专属 `img`
  证据：L25-26
- 坑：效应的 `flags.dae` 只写三件，显得未配置
  解法：照官方样本（恶言相加）补齐 `disableIncapacitated / selfTarget / selfTargetAlways / dontApply / stackable / showIcon / durationExpression / macroRepeat / specialDuration`
  证据：L28-29
- 坑：临时生命用 AE 写 `hp.temp`
  解法：用 `actor.applyTempHP(n)`（dnd5e 方法，取高不叠加）
  证据：L47
- 坑：效应图标字段写成 `icon`
  解法：字段是 **`img`**
  证据：L108

### 目标配置
- 坑：单体目标「打到自己 / 不出骰」——根因是宏里预设了错目标（想锁最近敌却把自身设成 target），或活动 `affects.choice:false` 且无目标时 completeActivityUse 落到自身
  解法：照「火把」——单体活动目标设 `affects:{ type:"creature", count:"1", choice:true }`，让**活动自身弹「选择目标」**；宏**不要**预设目标（`choice:true` = UI 里「选择目标」勾上）
  证据：L31-33
- 坑：以为活动写了 `range` 就会拦超距
  解法：超出 `range` 仍能选中 —— 需开 **midi-qol → Workflow → Check Range = `center to center`**（世界设置，物品无法强制）
  证据：L35-36

### 时长
- 坑：轮(round) ≠ 回合(turn) —— `duration.rounds:N` 是**轮制**，会把「到你/它下回合结束」拖长一轮（轮1放、轮3才解除）
  解法：用 DAE **特殊时长** `specialDuration`（`1Attack` / `isSave` / `1Spell` / `turnEnd` / `turnEndSource`），并保留 `duration.rounds` 作兜底（万一 token 无效不至于变永久）
  证据：L38-39、L75-81

### 探针
- 坑：`MidiQOL.midiFlags` 元素是**对象不是字符串**（形如 `{name:"flags.midi-qol.disadvantage.attack.all"}`，共 ~1818 条），探针里 `String(对象)` = `[object Object]` 全落空
  解法：`JSON.stringify(x)` 或取 `x.name` 再匹配
  证据：L41-42

### 无可信自动键（不要乱挂）
- 坑：「伤害最大化 / 额外动作 / 瞬移 / 触及+尺 / 解除指定状态 / 复现戏法」这些想挂自动化
  解法：无可信自动键，不要乱挂；卡面用官方口吻写清，元信息标「由 DM 手动判定」；文案要 5E 官方化（去掉「恶作剧/打嗝」这类口语，免得 PL 钻空子）
  证据：L44-45

### 校验
- 坑：用 `node --check` 校验宏语法（会误报顶层 await）
  解法：用 **AsyncFunction 构造器**（匹配 FVTT 异步执行环境）
  证据：L110

### 已坐实的写法（写错会翻车）
- 坑：save 活动结构与「活动↔效果引用」写错
  解法：`"type":"save"`；`"save":{"ability":["dex"],"dc":{"calculation":"spellcasting","formula":""}}`（跟持有者法术DC）；`"damage":{"onSave":"half"/"none"/"full","parts":[{number,denomination,bonus:"",types:["fire"],custom:{enabled:false},scaling:{number:1}}],"critical":{"allow":false}}`；`"target":{"affects":{count,type:"enemy"/"creature",choice},"template":{type:"sphere",size,units:"ft"},"prompt":true}`；`"effects":[{"_id":"<itemEffectId>","onSave":false,"level":{"min":null,"max":null}}]`
  证据：L59-66（坐实：坠星祈唤者 / 恶言相加）
- 坑：midi 优势/劣势 flag 路径写错（写成 `disadvantage.ability.save`）
  解法：自身豁免是 **`flags.midi-qol.disadvantage.save.{all,str,dex,con,int,wis,cha}`**；自身攻击 `advantage|disadvantage.attack.{all,mwak,rwak,msak,rsak,heal,other,save,util,school.<key>}`；授予方向 `flags.midi-qol.grants.(no)?(dis)?advantage.attack|save.*`；取消用 `noAdvantage`/`noDisadvantage`；**change 用 `mode:2`(ADD)、value `"1"`**
  证据：L68-73（坐实：midiFlags 探针 + 恶言相加）
- 坑：以为对敌位移都要走 LHGM 世界脚本
  解法：midi 原生 `MidiQOL.moveTokenAwayFromPoint(tokenRef, distFt, point, animate=true, checkCollision=false)`（背离某点推开，玩家端可用，midi 自己走 socket）、`MidiQOL.moveToken(tokenRef, newCenter, animate=true)`；爆心 AoE 取 `wf.template.x/y`、单体取施法者 token `.center`；失败者 `wf.failedSaves`（Set，元素是 Token）。LHGM 仍用于 midi 覆盖不到的场景操作（删场景文档、复杂连招）
  证据：L83-88
- 坑：自身数值 AE 的 change 键写错
  解法：法术伤害 `system.bonuses.spell.damage`（mode2，`"2d6[fire]"` 可带类型）；法术 DC `system.bonuses.spell.dc`；法术攻击 `system.bonuses.msak.attack` + `system.bonuses.rsak.attack`；全局豁免 `system.bonuses.abilities.save`；抗性 `system.traits.dr.value`（**mode2 ADD**，value 填伤害类型字符串如 `"fire"`/`"force"`）；全速加值 `system.attributes.movement.bonus`（作用步行/攀爬/飞行/游泳全部）；单 `movement.walk` 只改步行、减半用 **mode1(乘)** `"0.5"`；AC `system.attributes.ac.bonus`
  证据：L90-97
- 坑：以为灯光只能设静态 `prototypeToken.light`
  解法：ATL 灯光 AE —— `token.light` 字段含 `negative, priority, alpha, angle, bright, color, coloration, dim, attenuation, luminosity, saturation, contrast, shadows, animation, darkness`；AE change 键 `ATL.light.dim`/`.bright`/`.color`/`.alpha`/`.animation`（animation 填 JSON 串 `{"type":"pulse","speed":2,"intensity":2}`），**mode 5(override)**，配临时 duration 实现「亮一回合后熄灭」；需装 `ATL` 模块
  证据：L99-101
- 坑：其它易错 API
  解法：临时生命 `actor.applyTempHP(n)`；伤害/治疗 `actor.applyDamage([{value, type:"fire"}])`（`type:"healing"` = 治疗）；最近敌 `MidiQOL.findNearby(-1, token, distFt, {includeIncapacitated:false})`（-1 = 敌对，相对）；状态 id `prone/blinded/incapacitated/restrained/frightened/grappled/stunned/poisoned/silenced`；每轮一次冷却 = 物品 `uses.max:"1"` + `recovery:[{period:"turnStart",type:"recoverAll"}]` + 主活动 `consumption.targets:[{type:"itemUses",value:"1"}]`
  证据：L103-109
- 参考样本来源：恶言相加（specialDuration + dae flags + 劣势 change mode2）/ 火把（单体目标 choice:true）/ 希瓦（灯光参数）/ 坠星祈唤者（save 活动完整结构、affects.type:"enemy" 自动锁敌）/ 奥能科技拳套（击退几何，但其执行走 LHGM）
  证据：L114-119

---

## 勘误与待办-otherActivity-移交另一个AI.md

### 归因错误（旧知识库）
- 坑：旧规范 `FVTT-monster-spec-v2_1.md:54` 写「禁止在同一个 item 内并列两个会结算的 activity，必须拆成独立 item」——**现象对、归因错**，会把后来者引向「为一个物品的两种招式拆成三件物品」的绕路
  解法：真正触发连带的是**主活动的 `otherActivityId` 为空串**（attack 默认 `""`=auto）；把每个活动显式写 `"none"` 即可共存。勘误时**只追加、不删除/不改写原第 54 行**（原归因在「默认值前提」下仍成立，只是不完整）
  证据：L14-18、L202；勘误正文逐字块在 L158-164
- 坑：症状描述失真 —— 「同一件武器上放 attack（挥砍）与 save（范围），点**一次**攻击：先按命中结算单体伤害 → 目标接着掷豁免 → 豁免失败再叠一份范围伤害」「点纯 `utility` 活动时也会莫名弹出豁免」
  解法：用实机点击验证确认机制（见下）
  证据：L24-30（用户原话：「首先 midi 自动触发了豁免，导致他每次攻击自动骰豁免，没过额外吃炮击伤害，变形也是，点一下变形要过豁免，没过不给我变」）

### 验证纪律
- 坑：工具返回 `verified:true` **不等于**字段真的按你想的落库（历史上多次出现「回执说成功、实际没写进去」）
  解法：三步验证 —— ①预览（`foundry_create_item_minimal` 传 `activities`，**不带 confirmToken**）检查两个活动 `otherActivityId` 是否均 `"none"`；②落库后用 `foundry_diff`，`expected` 传 `{"system.activities.<活动id>.otherActivityId": "none"}` ⇒ 应 `allMatched: true`（**必须做，不要跳**）；③实战点击（唯一能证明机制的一步）：点攻击只出命中不掷豁免、点豁免活动不掷命中、不弹「选择活动」
  证据：L168-177
- 坑：结论外推过度 —— 本次只验了 `attack` + `save` 两个活动的组合
  解法：**勿将本条结论外推为「任何组合都安全」**；历史那例「点纯 utility 变形活动也要过豁免」始终未解释，该物品已随世界换代消失、无法复现
  证据：L85

### 结构硬约束
- 坑：`activity._id` 位数不对
  解法：必须**恰好 16 位字母数字**（如 `dnd5eactivity000`）；超长会被拒绝或静默规范化
  证据：L203
- 坑：以为 save 活动会误吃武器基础伤害
  解法：`save` 活动的 `damage` 子 schema 只有 `onSave` / `critical` / `parts`（**无 `includeBase`**）；只有 `attack` 活动的 `damage` 有 `includeBase`
  证据：L204

### 待办 · 副本与模板（未做完的坑）
- 坑：`release/` 暂存里 2 份旧副本仍是老归因、无勘误（`foundry-mcp/release/dsh-foundry-vtt/plugin/src/knowledge-local/FVTT-monster-spec-v2_1.md:54`、`.../plugin/lib/knowledge-local/FVTT-monster-spec-v2_1.md:54`）
  解法：勘误正文**逐字追加**在第 54 行之后作为独立引用块，不删不改原行；⚠️ 动手前先确认这两份**不是**「每次发版自动重新生成」的产物（若是，改了会被覆盖，应改生成源）
  证据：L108-116
- 坑：两处 JSON 模板示范空串 —— `foundry-mcp/dsh-foundry-vtt/src/reference.ts:180` 与 `src/knowledge-docs/01-结构模板.md:137` 的 `"otherActivityId": ""`
  解法：**不要改 JSON 本身**（是真实导出结构的逐字快照，同块还有完整 `midiProperties`、`save.dc`）；只在 JSON 块**外的说明文字**加一句警示：`""` 是自动探测写法，需各活动独立时显式写 `"none"`
  证据：L118-127
- 坑：`tsc` 不会拷贝 `.md` 等非 TS 资源 ⇒ `src/knowledge-local/*.md` 的改动**永远进不了** `lib/knowledge-local/`
  解法：在 `build.sh` 编译步骤后加 `src/knowledge-local/`→`lib/knowledge-local/`、`src/knowledge-docs/`→`lib/knowledge-docs/` 同步；或加 `postbuild`；或引入单一真源只留一份。`FVTT-monster-spec-v2_1.md` 本机有 **5 份副本**靠手工同步
  证据：L133-150
- 坑：本机**跑不了构建**（2026-09-15 实测）—— `DSH_CHECKOUT` 环境变量未设置（`Get-ChildItem env:DSH*` 只有 `DSH_HOME`/`DSH_SESSION_ID`/`DSH_SESSION_JSONL`/`DSH_SHELL`/`DSH_WEB_URL`）；三个探测路径 `$HOME/dsh-harness`、`$HOME/dsh`、`$HOME/.dsh/dsh-harness` 均不存在；`node_modules/` 下 `cordis`、`schemastery`、`@deepseek-ai/dsh-tools` 均不存在（junction 已被清掉）
  解法：`src` 改动后**必须手工同步 `lib`**，或先把 `DSH_CHECKOUT` 指对再 `bash scripts/build.sh`。`src` 是权威：正常构建后 `lib` 会从 `src` 重新生成，手工镜像的内容会被同值覆盖
  证据：L143-145、L190-195
- 坑：以为编译后的 `lib` 不该有源码注释
  解法：本包编译后**保留源码注释**（`lib/minimal.js` 里能看到 `src` 的 `//` 注释），所以镜像注释到 `lib` 是符合预期的，不算「与构建产物不一致」
  证据：L205

### 环境事实
- 世界：**特醇佳酿**（worldId `"123"`，clientId `fvtt_84fa6f9c091a5f8d`）；dnd5e **5.3.3** / Foundry **13.351** / midi-qol **13.0.55**；包 `foundry-mcp/dsh-foundry-vtt`（`name: @dsh-external/dsh-foundry-vtt`，`version: 1.1.8`，`type: module`，`files: ["lib"]`，`"build": "bash scripts/build.sh"`，`"typecheck": "tsc -p tsconfig.json --noEmit"`）
  证据：L183-189

---

## 血的教训-DialogV2弹窗选择器篇.md

### 根因（内联事件失效）
- 坑：DialogV2 content 字符串里写内联事件（`onchange`/`onclick`）**实测不生效** —— 不是语法错、不是函数没定义，是事件处理器根本没绑上/被剥掉；症状是**静默保持默认值**（默认 `long`，点 `short` 也还是 `long`），最难排查的一类
  解法：content 只放带 `name` 的表单元素、不写任何内联事件；取值一律在按钮 callback 里读 DOM
  证据：L17、L38-40
- 坑：「默认值路径能跑」≠「弹窗交互能跑」—— v1/v2 用户说「能用」，只是因为默认状态恰好 = 全选+长休，确认后直接执行正确路径，事件死没死根本暴露不出来
  解法：任何带「切换选项改变行为」的弹窗宏，**必须实测「非默认选项」那条路径**（点 short 再确认、取消一个勾选再确认），否则等于没测
  证据：L18、L26
- 坑：排查方向一以为是「函数没挂到 window」—— 否，函数是显式赋 `window.__rsSync = ...` 的，定义没问题
  解法：定案方向是 content 内联事件根本不触发
  证据：L28-29
- 坑：`DialogV2.confirm` 只有布尔/`{confirmed}` 语义，**拿不到表单值** → 被迫走内联事件弯路
  解法：改用 `DialogV2.wait`
  证据：L54

### 正解（按钮 callback 读 DOM）
- 坑：不知道 v13 的按钮 callback 签名与提交值语义
  解法：官方 v13 API（foundryvtt.com/api/v13）逐字：`DialogV2ButtonCallback = (event: PointerEvent|SubmitEvent, button: HTMLButtonElement, dialog: DialogV2) => Promise<any>`；`DialogV2Button = { action; callback?; class?; default?; disabled?; icon?; label; style?; type? }`；**callback 返回值 = 该对话框的 submitted value**；无 callback 的按钮用其 `action` identifier 作提交值；`DialogV2.wait(config)` resolve 到「按钮 identifier 或 callback 返回值」；`dismiss` 且 `rejectClose:false` → resolve `null`
  证据：L29、L50-53
- 坑：关窗/ESC 会 reject 而不是 resolve
  解法：`rejectClose: false` → 关窗/ESC resolve `null`；配合 `if (!picked || picked === "cancel") return;`
  证据：L69、L83
- 坑：多个同类控件各写不同 name，取值要写一堆选择器
  解法：用**同名 `name`**（radio 天然互斥；checkbox 同名便于 `querySelectorAll` 一把抓）；`root.querySelector("input[name=rs-mode]:checked")?.value ?? "long"` + `[...root.querySelectorAll("input[name=rs-opt]:checked")].map(c => c.value)`
  证据：L75-77、L86
- 坑：需要「只读」的当前状态（如已勾选项数）靠内联事件实时维护
  解法：用 `Hooks` 或按钮 callback 里再读，别靠内联事件；40+ 角色这种量级时 content 控件只读、全量在 callback 读，**避免任何「实时维护选中集」的脆弱设计**
  证据：L87、L102
- 坑：纯确认弹窗也上复杂表单
  解法：无表单取值仍可用 `DialogV2.confirm`，别过度设计
  证据：L88
- 证据（系统同构，抄它别发明）：dnd5e `module/applications/api/application-v2-mixin.mjs` L433-451 `_confirmDialog`：`buttons` + `submit: result => resolve(result)` + `close → resolve(null)`；`module/applications/advancement/advancement-confirmation-dialog.mjs` L50-52 按钮 handler 里 `this.element.querySelector('[name="apply-advancement"]').checked` 读表单
  证据：L30、L91-92

### 同族坑 / 关联
- 坑：ChatMessage HTML 内容里的内联 `onclick` 同样被清洗（同族：FVTT 多处对 HTML 字段做净化）
  解法：用 `[data-act]` 事件委托（详见 `血的教训-远程盲调UI篇.md` §2.6 / §3-10）
  证据：L43、L108
- 机制推断（**未逐一坐实，写代码别依赖**）：疑似 content 字符串在 DialogV2 内部渲染时经过富文本净化
  解法：不依赖机制推断也能安全写码 —— 任何弹窗交互取值都走按钮 callback / submit 回调读 DOM
  证据：L42-44
- 修复后产物：`C:\Users\龙华\Desktop\智能体\FVTT房规\fvtt-Macro-角色休息.js`（v3，宏名「角色休息」，radio 长短休 + checkbox 角色列表 + 按钮 callback 读 DOM）
  证据：L110

---

## 血的教训-代码审阅自检清单篇.md

### 根本教训
- 坑：自跑 **52 项单元测试全绿**、`node --check` 全过、打包抽验全过，交给外部审阅一次仍被挑出 **12 条**，其中 **3 条是真会出错的行为错误**（新世界漏恢复、全选盖掉单独取消、导入名不副实）
  解法：测试通过 ≠ 代码没问题 —— 测试跑的是「我想到的场景」，审阅问的是「我没想到的场景」；打包前逐条扫 14 项通用清单
  证据：L5-9、L178
- 坑：v1.0.0 → v1.1.0 是十几轮增量打补丁攒出来的，每次只改局部、只在局部里自洽；作者视角看的永远是「我当时想干什么」，审阅者看的是「这行代码实际会干什么」
  解法：把「陌生人视角通读改动所在的**整个文件**（不是只看 diff）」变成固定动作
  证据：L25-28、L161-162

### 为什么 52 项测试没抓到
- 坑：新世界漏恢复 —— 我的测试世界里**恰好**有那几个模块的设置（测试数据是按「正常世界」构造的，而 bug 出在「新世界」）
  解法：把测试世界**清空到最干净**再跑一遍主流程（不是用「常用测试世界」）
  证据：L36、L54-58
- 坑：全选盖掉单独取消 —— 只测了「点全选 → 全部勾上」这条**正面路径**，没测「先全选 → 再取消一个」这条**反面路径**
  解法：手画状态转移表：全选→取消子项→再全选→再取消全部
  证据：L37、L68-70
- 坑：导入没真正导入主快照 —— 只测了函数**不能**做什么（不崩、不写坏），没测它的名字**承诺**了什么
  解法：把 UI 上每个按钮的文案抄出来，对着它的 handler 读一遍，看是否同义
  证据：L38、L62-64

### 14 项审阅清单（逐条 · 每条一个真实反例 + 过关标准）
- 1 状态模型一致性：坑 —— 回档账本固定写 `apply-log.json` 且只记世界**标题** ⇒ A 世界恢复、B 世界恢复（覆盖）、回 A 点回档 → 写进 A 的是 B 的旧值。解法：状态的键用**稳定 ID**（`world.id` / `actor.id`），不是可改的显示名
  证据：L48-52
- 2 首次使用与边界：坑 —— 模块勾选列表只由「当前世界已有的 Setting」生成 ⇒ 新世界没有该模块的设置就永远不出现在列表里，恢复不到。解法：空世界能跑通全流程，且不依赖任何历史残留
  证据：L54-58
- 3 命名与行为相符：坑 —— 按钮叫「从文件导入」，实际只把当前世界恢复成该快照、**没写服务器主快照**，而 README 把它写成跨服务器迁移手段。解法：文案能逐字对应代码行为；做不到就改文案（改文案永远比改行为安全）
  证据：L60-64
- 4 控件联动必须双向：坑 —— 「全选」默认勾上且只做单向联动 ⇒ 用户取消某个模块后点恢复，仍会恢复它。解法：子项永远是唯一真源，父项只是它的投影（`checked` + `indeterminate`）
  证据：L66-70
- 5 同一规则多处实现必须一致：坑 —— core 命名空间在手动恢复里被包含、在自动提醒里被排除 ⇒ 状态栏一直报差异、自动恢复永不处理。解法：抽成一个函数（`buildSelection()`），所有路径调用同一个；`grep -n` 把同一语义表达式（如 `ns !== "core"`）全找出来逐处比对
  证据：L72-76
- 6 用户偏好持久化：坑 —— 恢复范围只存在内存里 ⇒ 手动恢复遵守，进世界自动提醒自己造了另一套范围。解法：调过即落库，且自动路径与手动路径读同一份偏好
  证据：L78-82
- 7 外部输入硬校验：坑 —— `parseSnapshot` 只检查 `settings` 存在 ⇒ 非法文件可能写一半。解法：构造 8 类坏输入各一份（非 JSON、类型不对、缺字段、重复键、版本过新、超大、编码错、空）逐个喂进去；宁可拒收不可写坏，拒绝时给人话原因
  证据：L84-88
- 8 幂等与可重复执行：坑 —— 回档可以无限重复执行，几天后再点一次仍写旧值。解法：写操作带状态标记（`status: pending/rolled-back`），重复执行要么无害、要么被拦
  证据：L90-94
- 9 并发与重入：坑 —— 无任何锁，两个 GM 同时恢复 → 互相覆盖。解法：有锁或冲突检测；锁要有 TTL、崩溃不留死锁；文档写清「这是尽力而为，不是原子」
  证据：L96-100
- 10 权限纵深防御：坑 —— 界面对玩家隐藏，但 `window.lhWorldSync.applySnapshot()` 对所有人生效。解法：`grep -n "window\."` 找到所有对外暴露入口，逐个问「非 GM 调用会怎样」；每个写入口第一行就是身份守卫
  证据：L102-106
- 11 文档与实现一致：坑 —— README 写「同一服务器的所有世界共享用户列表」并标注「坐实」，实际 `users.mjs:21 class Users extends WorldCollection` ⇒ **User 是世界级数据**，写反了。解法：文档里每条事实性结论都能指到出处（文件 + 行号），指不出来就删掉或标「未验证」
  证据：L108-112
- 12 工程卫生：坑 —— 死代码 `storageList()` / `getItemValue()`；`isJSONEqual` 用 `JSON.stringify`（对象键序不同会误判成差异）；`escapeHtml` 不转引号（被用在 `value="…"` 属性上下文时必须转）；侧边栏 1.5 秒常驻轮询。解法：四条 grep —— `setInterval`（能否改事件 hook，轮询只在官方没有 hook 且 DOM 会被重建时才必要）、`JSON.stringify(.*)===JSON.stringify`、找从未被调用的函数、HTML 转义函数是否转引号
  证据：L114-122
- 13 版本三处同步与部署：坑 —— 用户只覆盖了 `scripts/` 和 `styles/`、没换 `module.json` ⇒ 服务器上跑的是**混合版本**（探针报 v1.6.0，却仍在请求旧版的 `lang/cn.json`）。解法：`module.json` 的 version + JS 头注释 + `window.__XXX_VER` 探针三处一起打印对照，打包后在 zip 里再抽验一次；交付话术里**永远强调「整包替换」**
  证据：L124-128
- 14 写操作可逆性（最硬）：坑 —— 账本改文件名后若顺手把旧 `apply-log.json` 删掉，用户就永久失去旧记录（且 v13 无删除 API，删了也回不来）。解法：任何**删除/覆盖/替换**先请示（说清删什么/为什么/影响范围/有没有备份，没同意一律不许删）；改既有代码前先留本地备份（源码全量 + 打包好的旧 zip + git tag）；升级涉及数据结构变更时**旧数据只读、不写、不删**（能读就兼容读，确认迁移无误后由用户自行清理）
  证据：L130-138
- 14.1 备份/保护动作失败时该继续还是停下：坑 —— **判据错了**：某模块把「恢复前另存上一份回档账本」的失败处理成 fail-open（`console.warn` + 通知一句，然后照常写新账本），代码注释理由是「不要因为一个辅助动作失败就阻断主操作」；但账本是**唯一**撤销点（服务器上没有它的副本，平台也没有删除/恢复文件的 API）。解法：判据不是「这个动作重不重要」，而是「这次失败会让用户失去什么」——失去**唯一副本/唯一撤销点** → **fail closed**（停下并说清「一个设置都没改动」以及为什么）；只损失一次便利 → 可继续但**必须出声**，不能静默降级；fail closed 抛出的错误要自带完整说明（什么失败了、世界有没有被改动、下一步做什么），别让它被套上不相干文案
  证据：L140-154
- 自检问法：把每个「失败后继续」的分支挑出来，逐个问「这一支继续下去，用户手里会少掉什么？那个东西还能不能再造出来？」答案里只要有一个「不能再造」→ 改成 fail closed
  证据：L150-152

### 写新代码时就该有的三个习惯
- 每写完一个交互控件，立刻问**反面操作**：取消、重复、空选、超量会怎样？
- 每写完一个持久化动作，立刻问**另一个同类对象同时存在**会怎样？
- 每写完一段逻辑，**换个入口再走一遍**（自动路径和手动路径都调用它，两条都试）
  证据：L168-172

### 铁律
- 测试全绿 ≠ 没问题 / 交付前把整体量一遍 / 作者视角换掉（问「这行字面行为是什么」不问「我当时想干什么」）/ 同一规则只写一遍 / UI 限制 ≠ 能力限制 / 文档每条断言指到出处 / 任何删除覆盖先请示、改前先备份、数据升级旧文件只读不删
  证据：L176-184
- 坑：「保守」成了「不改」的理由 —— 轮询、账本同文件两条，上一轮以「风险低」为由没改，被审阅再点一次才改
  解法：**「保守」不能成为「不改」的理由** —— 那往往是维护自己已经写好的东西
  证据：L185-186
- 坑：善意的兜底也是语义 —— 一句「空 custom 视为全部」，把「取消所有模块 + 只保留一个开关」这个**完全合法**的组合整份放大成了「全部同步」
  解法：写「检测到异常输入就退回成某种默认行为」之前，先问「这个异常输入有没有可能只是我没考虑到的正常需求？」
  证据：L190-193
- 坑：同一件事有几套语义就有几个 bug 候选 —— 把「有效目标值」只改了写入路径、漏了差异检测 ⇒ 永不收敛的假差异（恢复 → 刷新 → 报同样的差异 → 再恢复）
  解法：范围/目标值/锁/失败策略任何一类事实有两处以上各自实现就会出问题，改的时候**逐个点名**
  证据：L194-197
- 坑：承诺的能力配不上数据模型 —— 想用「一个标量锁文件」表达「一把全局锁 + 多把世界锁」，信息量上不成立
  解法：要么改数据模型，要么把并行改成串行；**别在实现细节上打转，先看承诺本身能不能兑现**
  证据：L198-200

---

## 血的教训-发布校验与查证纪律篇.md

- 坑：v1.1.5 发布的插件包漏了 **93 个样本文件**（用户/朋友下载后资料库残缺）—— 打包时按 **git 跟踪列表** 打，而 git 里只有 23 个（磁盘上 116 个，v1.1.0 起陆续加的，一直没提交进 git）⇒ 93 个被静默漏掉
  解法：v1.1.6 改打包方式（从磁盘抓）→ 116 个全进包；**发布前必数产物** —— 打包后立刻统计 zip 内关键文件数（样本数/文档数/lib 文件数）与磁盘对比，不一致**不发版**
  证据：L3、L17-27、L31、L36
- 坑：「补进 git」当成「补进包」—— v1.1.6 修的是「包」，v1.1.7 才把那 93 个提交进 git（修的是「仓库」，跟下载 zip 的人无关）
  解法：仓库层与分发层是两件独立的事，改动后必须**分别**验证，不许用一句「已更新」糊过去
  证据：L25-26、L37
- 坑：被用户质疑时**先解释再查证**（先讲「版本号内容一样」、让对方去点按钮验证），三轮里给出相反结论 ⇒ 用户被迫当了我的校验器，被绕晕后说「你玩我呢」
  解法：被质疑第一动作是**跑命令拿证据再开口**，任何解释性话语都必须排在证据之后；同一件事不给相反结论 —— 新证据推翻旧结论时直接说「我上一条错了，实测是 X」，不做找补式铺垫；把验证推给用户是禁止的（能自己下载、读取、数出来的绝不让用户去问第三方、点按钮或试一下）
  证据：L12、L32、L38-40、L53-55
- 发版前检查清单（逐条打勾）：zip 内样本数 = 磁盘样本数？/ zip 内 knowledge-docs 篇数 = 磁盘篇数？/ src ↔ lib 同步（`scripts/check-sync.mjs` 通过）？/ `package.json` description 里的工具数 = 实际注册工具数？/ Release 资产名 / 版本号 / 说明与实际内容一致？/ 临时产物（`_pack-*`、`dist/`）没被误提交进 git？
  证据：L42-49

---

## 血的教训-开工方法论篇.md

### 三条硬性指标（用户亲令，凌驾其余条款）
- 坑：猜用户的操作（他怎么点的、拖了多远、场上有什么、开了哪个开关、他改了哪个设置）
  解法：指标一 —— 只有用户知道的事实一律**直接问**，不得从数据反推、不得拿「应该是……吧」当前提；**禁止拿「我没测到的字段」当证据否定用户描述**（没测到≠不存在，判定要用齐全字段，如判敌要读到阵营字段本身，不能靠名字或角色类型推）；**用户的描述是事实，我的推断是假设，冲突时改假设不改事实**
  证据：L28-34
- 坑：挤牙膏式排错（先看一个值 → 再决定看下一个）
  解法：指标二 —— 要数据就一次性要全；**F12 控制台探针是必需品不是可选项**（遇问题第一动作 = 产出用户可直接粘贴运行的完整探针）；探针取不到完整信息时**宁可专门打一个「测试用 mod」**（只把内部中间值输出到全局变量或聊天里，**不改任何判定逻辑**）；探针要一次覆盖所有可疑分支；交付诊断版时必须**明说**「这一版不修 bug、照样是坏的，它只负责抓数据」
  证据：L38-44
- 坑：靠「读完源码 → 推断运行时会是这样」分析
  解法：指标三 —— 分析单元是**完整的运行时快照**（真实数据、真实中间变量、真实分支走向）；缺哪一段就补出来，不允许用推测替代；自检句「**如果这一版改动拿不出对应的实测字段，就说明还在猜，不许打包**」；同一症状**连续两版修不好，第三版必须是「诊断版」而不是「修复版」**；**每版必须换版本号**（曾出现两版都叫 LH.22：102018 / 102055 字节，无法定位用户装的是哪版）
  证据：L46-53
- 代价：「我们猜了 30 多版，20 个小时，70 块钱，我已经 30 多个小时没合眼了」——一件本该「拿一屏数据、一行改好」的事，被四版盲改拖成 8 小时的赌博
  证据：L26、L57

### 五大病根
- 坑：臆造优先于查证（先写码后查资料，键名/API/图标全靠「我记得」）
  解法：资料库 0 实例的键（`DamageBonus`、`flat`、`hunterway scope`）用了就是烧用户钱
  证据：L72
- 坑：把资料当实测（`AE 级 onUseMacroName`、`targetUuids` 都被 midi 13.0.55 无视）
  解法：裁决者只有一个 —— **用户世界 F12**
  证据：L73
- 坑：未验证即交付（一次甩 8 个法术 / 一整个大宏；语法过 ≠ 行为对）
  解法：验证成本不许转嫁用户
  证据：L74
- 坑：绕路不复盘（失败就加探针/缓存/托管层，把「照抄金标准」越改越复杂）
  解法：失败第一动作 —— 停下来回查金标准对照差异
  证据：L75
- 坑：教训不闭环（同类错跨项目反复犯，教训文档全是事后补的）
  解法：铁律必须前置进工作流
  证据：L76

### 七条（实为 12 条）根治铁律
- 开工三查：① 读「搓怪物做效果做mod…」全部坑书（**全读，不许挑大的读**）→ ② 查 data-dict / monster-spec / 飞书 → ③ grep 用户世界导出 JSON 找键名实例；**0 实例 = 臆造，不用**
  证据：L101、L81
- 出处责任制：交付里每个键名/API/图标路径必须能指到「文件+行号」；指不出的标「未验证」或删掉
  证据：L102
- 先方案后代码：文本方案用户点头再写码；**先做最小切片（1 个法术/1 个陷阱）实测通过再批量复制**
  证据：L103
- 本地验证到敢自己点：语法、字段存在性、图标存在性、逻辑用例全跑过才交付
  证据：L104
- 资料 ≠ 实测：用户环境是唯一裁决者；文档记载的机制第一次用必须实测确认
  证据：L105
- 失败走三步：根因 → 金标准对照 → 最小修复；不绕路加复杂度；同一条错不让用户踩第二次
  证据：L106
- 教训即时沉淀：翻车 24 小时内写进对应专题篇 + 更新《FVTT-已验证机制速查与开工铁律.md》废弃清单
  证据：L107
- 发布前必数产物 + 被质疑先查证
  证据：L108
- 交付前跑 14 项自审（最硬的是第 14 条：写操作可逆，删除/覆盖前先请示）
  证据：L109
- 坑：动手写 F12 探针前自己猜字段名
  解法：**先找「自带诊断出口」** —— 先 grep 目标模块的 `globalThis.` / `debug` / `window.__`，改版过的模块常自带诊断函数（如 aeris-tokens 的 `globalThis.aerisTokens.debugMovementTrail()`），它的字段名是权威的，比自己猜少一整轮迭代；跨版本留下的诊断埋点（`window.__CAP` 这类只塞数组、不参与判定的）修好之后**别急着删**，它是下一轮的第一手证据
  证据：L110
- 坑：按「用户提到的现象」列假设 —— 同一屏上同时出现的两个症状经常**不同源**
  解法：症状按「**显示层 / 数据层 / 方法包装层**」分层列假设。实例：用户一句「墙角折返跑步数不对」，实际是两条在代码里毫无交集的链 —— 蓝线画 `getPaintedTiles()`、数字读 `captures` 账本（详见《血的教训-Aeris-Tokens改版篇.md》§9）
  证据：L111
- 坑：把用户的因果观察当背书
  解法：**只照做、不背书** —— 用户说「关了 X 就容易出错」时，按他要求改是照做；**没有数据就别承认因果**，交付时明说「我没有证据支持这个因果，若改完症状照旧说明无关」；否则下一轮两边都以为「已经验证过了」
  证据：L112

### 翻车总账索引（其他篇里的事件，含已沉淀结论）
- 冲击印记命中击退（5 小时 30 块）：臆造键 / 时点 / 格式 / 判别 / 探针崩 / 一次 8 个 → 《血的教训-强迫目标移动篇.md》
  证据：L118
- 简单陷阱：UUID 三轮 / DC flat / midi targets / 图标 404 / V13 面板 / 按钮轮询 / flag 兼容 → 《简单陷阱篇》
  证据：L119
- socket 频道 / LHGM 委托 / 权限 / DM能PL不能 / 附身符七连环 / 光环 → 《之前踩过的坑.txt》
  证据：L120
- 活动结构 / 特殊时长 / change 键全表 / 递归触发 / 原生位移 → 《制作妄质百变腕甲-踩坑与新知识.md》
  证据：L121
- lh-video-lab 面板：ApplicationV2 静默失败 / Dialog 参数放错 / theme-light 黑字 / 全局 `button width:100%` 挤扁 input → 《血的教训-CSS面板配置篇.md》
  证据：L122
- 职业升级崩溃（tome-of-beasts-2 冲突，用户自诊）→ 模块冲突类：禁用模块硬刷新排查
  证据：L123
- 地图加载卡 98.46%（代理残留 + 大图）→ 地图处理手册（早期存档）
  证据：L124
- v1.1.5 包漏 93 个样本 → 《发布校验与查证纪律篇》
  证据：L125
- lh-world-sync 被外部审阅挑出 12 条、52 项单测全绿没抓到 → 《代码审阅自检清单篇》
  证据：L126
- 拖动时头顶数字虚高一倍（`cap.cost + liveCostOf` 双倍记账）；蓝线折返与数字同屏却**不同源** → 《Aeris-Tokens改版篇》§9
  证据：L127
- 「改 default 让它默认打开」无效：**client scope + 快捷键取反写库 = 误按一次永久关掉** → 《Aeris-Tokens改版篇》§9.4
  证据：L128
- `vite build` 清空 dist（28→26 条目）+ 沙箱 `spawn EPERM`；产物验证须数「不会被压缩器改名的特征串」 → 《Aeris-Tokens改版篇》§9.6
  证据：L129

### 查证资料库总索引（优先级顺序）
1. `01_跑团工具\FVTT技术资料\搓怪物做效果做mod任何时候，看到了一定要看仔细看\`（最高优先级，现有 14 份坑书 = 13 篇 .md + 1 份 .txt，**全读，不许挑大的读**）
2. `FVTT-data-dict-v9_1.md`（§14 CPR / §17 OverTime / §26 宏挂载 / §30C Optional 加值 / §747 applyDamage）
3. `FVTT-monster-spec-v2_1.md`（M7 宏三件套）
4. `fvtt-icon-paths.txt` + `FVTT图标，搓怪物做物品一定要看.txt`（图标真源，grep 拿真路径，绝不猜）
5. `01_搓怪物.md` + `FVTT特效同步规范-fxExecCode.md` + `dnd5e_classpack-cpr-mapping.json`
6. `飞书知识库\`（56 页：43-midi-qol标志参考 / 46-属性键值 / 51-推荐观看 / 34-力竭 / 55-函数签名 / 36-激活条件）
7. docx 五件：(已瘦身)自动化指北 / midi入门指南（必看）/ OvertimeActivity使用说明 / (已瘦身)CPR宇宙使用指南 / (已瘦身)宏相关
8. 用户世界导出 JSON：`01_跑团工具\怪物与物品卡\`（磁轭手铳=物品宏金标准、熔火战旗=加伤键、恶言相加/火把/坠星祈唤者=活动结构）+ `特效宏\`
9. `01_跑团工具\网格构筑师\`（Region/陷阱金标准：TRAP_SCRIPT、涂格 Drawing、cellsToPolygonShapes）
10. `FVTT-已验证机制速查与开工铁律.md`
  证据：L80-97

---

## 血的教训-桥接工具链实战篇.md

### dnd5e 版本兼容（★ 本库知识按 5.3.3 写）
- 坑：照抄 5.3.3 的写法到别的版本（如 5.2.5）会**静默失败**
  解法：套用前先用 `foundry_diff` 验一次
  证据：L23-26
- 已知差异：5.3.3 的武器伤害骰在 `system.damage.base{number,denomination,bonus,types}`，活动里配 `damage.includeBase:true`；旧版（2014 规则结构）把骰子写在 `activities[].damage.parts[].formula` —— **在 5.3.3 里会被静默清洗掉，不报错**；`save.dc.calculation` 官方枚举是 8 项（`""` / `spellcasting` / 六属性），**没有 `flat`**
  证据：L29-31
- 坑：把 reference 主题里的「本机核对 5.2.5」标注读成「5.2.5 也能这么写」
  解法：那是**取证来源说明**（我读的是哪个版本的源码），**别读反了**
  证据：L33-34

### 报错 → 原因 → 处置
- `Script contains forbidden patterns` —— execute_js 命中 relay 的 24 条黑名单（正则扫全文，注释里也算）。处置：本地预检已给行号，按行改；替代写法见 `foundry_reference{topic:"exec-js"}`
- `Buffer is not defined` —— 世界内没有 Node 的 Buffer（execute_js 跑在浏览器环境）。处置：别用 Buffer；base64 方案整体放弃
- `pack.index undefined` —— compendium 包**尚未加载**（懒加载）。处置：先 `await pack.getIndex()` 或 `pack.getDocuments()` 再取，别直接读 index
- `Entity not found: Item.xxx` —— 传了裸 id 或错的 uuid 形式。处置：世界物品 `Item.<id>`；角色身上的 `Actor.<actorId>.Item.<itemId>`；compendium `Compendium.<包>.<类型>.<id>`
- `No connected Foundry clients found` —— GM 浏览器不在线，或 relay 刚重启还没重连。处置：**先问用户「FVTT 开着吗」**；relay 重启后世界页面 **F5 才会重连**（实测：重启后一直报离线，F5 立即恢复）
- `Request timed out`（408）但数据其实在 —— **超时 ≠ 没执行**。处置：先回读确认，别直接重跑（会造重复文档）
- `folder: must be a valid 16-character alphanumeric ID` —— folder 传了 `Folder.xxx` 前缀。处置：传纯 16 位 ID（本插件工具会自动剥前缀；手搓 JSON 时要自己剥）
- 工具返回被拒 / `"value" must be an object` —— 工具返回了裸数组，DSH 输出校验拒收。处置：已修（返回统一包成对象）；老版本会遇到
  证据：L40-49

### 读两次再下结论（世界重载期读数不全）
- 坑：同一个世界的物品总数一次读到 **675**，几分钟前是 **1008** —— 不是「东西没了」，是**世界正在重载**（collection 与 compendium 只加载了一部分）
  解法：数字比预期少时**必须再读一次**（间隔十几秒），两次一致才下结论
  证据：L53-59

### 批量条数（环境差异，别照搬）
- 他的实测结论：**≤6 条最稳**（3~6），环境是 470 个模块的本地世界；我们的默认值：`foundry_create_batch` **默认 30 条 / 批间隔 90ms**，环境 204 个模块；我们实测过的上限：单次 `Item.create` 一次几百条会**静默返回 0**（世界一条没写，还不报错）
  解法：**没有普适数字**（模块越多、世界越大，单批安全条数越小）；撞到 408 或静默 0 条时把 `batchSize` 往下调（30 → 10 → 6），别一次调到最小（太慢）；判据 = 跑完用 `foundry_search` 数实际落库数，数量对不上就是批太大
  证据：L63-74

### 大 payload 投递
- 坑：超长内容（几万字符的子职描述、特性宏）直接塞进 `data` 会撑爆请求
  解法一（本地部署限定）：本地写 JSON 到 `Data/_import_cards/<name>.json` → 世界内 `fetch('/_import_cards/<name>.json')` 读回 → create（投过 48,346 字符的子职 + 12,207 字符的特性）；⚠️ 这条路依赖「能往 Foundry 数据目录写文件」，**云端部署走不通**
  解法二（云端该走的）：**relay 自带 `/upload` 端点**（对应 `foundry_file_upload` 工具）→ 上传到世界可访问路径 → 世界内 `fetch` 读回 → create；云端、本地通吃，不依赖本地磁盘
  解法三（更简单）：**拆** —— 把 48K 描述拆成几段分别写（`foundry_update_entity` 分段补 `system.description.value`），比投递文件少一个环节、少一处失败点。**能用拆解决的，别上投递**
  证据：L78-94
- 一句话总结（四条都反着理解一次，能省掉大半返工）：**超时不是没执行，verified 不是值对了，读数少不是东西没了，本地没有不是世界没有**
  证据：L98-102

---

## 血的教训-第三方同步模块并发写设置篇.md

### 现象与根因
- 坑：用户世界出现 **521 组**真重复 Setting 文档（同 key + 同 user 多份）、涉及 **1742 份**、多出 **1221 份**垃圾数据，**潜伏半年**才被发现；份数分布 2 份×63 组 / 3 份×218 组 / 4 份×238 组 / 5 份×2 组；内容完全相同 497 组（95%）、有差异 24 组；同一组内所有副本创建时间**精确到秒完全相同**
  解法：官方读设置用 `find` 取**第一份**，所以功能照常、界面无异常；不要以为「没报错就没事」
  证据：L5-6、L26-33、L120-122
- 坑：诊断只按 `key` 分组判重复 ⇒ 把「同一个键有 1 份世界级 + 每个玩家各 1 份个人级」这种正常情况误报成重复
  解法：判据必须是 **key + 归属者**两个维度
  证据：L127-128、L145
- 坑：靠猜「谁写的」
  解法：Setting 文档自带 `_stats.createdTime`，把每份文档的创建时间按小时聚合。**同一秒创建的多份 = 并发写入；不同时间创建的多份 = 反复导入**。本例副本时间集中在 `2026/2/20 04 时`（518 份）、`2026/2/21 17 时`（1024 份）、`2026/5/23 16 时`（195 份）、`2026/3/5` 与 `3/9`（共 5 份）；用户自己的模块是当年 9 月才做的，时间上根本对不上 ⇒ 与自己的模块无关；真正时间点全落在装了 `world-setting-sync`（theripper93，v2.0.0）之后
  证据：L35-58、L146
- 坑：**病灶代码** —— `promises.push(game.settings.set(namespace, key, value))` 立刻发起不 await，最后 `await Promise.all(promises)`，上千个写操作同时飞出去
  解法：**批量写设置不要 `push` 后 `Promise.all`** —— 串行 `for...await`，或先批量查询现有文档再 `updateDocuments`/`createDocuments`
  证据：`world-setting-sync/scripts/app/SettingsSync.js:442-476`（原文 L66-89、L143）
- 坑：`game.settings.set()` 内部是「**先找再写**」（`getSetting` → 找到就 update / 没找到就 create），并发时两次调用同时进入查找阶段、谁都看不到对方将要创建的文档 ⇒ 两边都走 create ⇒ 同一个键两份文档。`changes.settings.agnostic` 与 `changes.settings.system` 里键重叠越多重复份数越多，这解释了「2/3/4 份」的分布与**同一组副本值为什么不一样**（一份来自 agnostic 库、一份来自 system 库）
  解法：**一个键写一次**；同一批里若会出现同名键（多来源合并），先合并去重再写
  证据：L91-100、L144
- 坑：波及范围上千个键 —— `world-setting-sync/scripts/SettingsCompiler.js:28-32` 的 `get worldSettings()` 取 `Array.from(game.settings.settings).map(s=>s[1]).filter(s=>s.scope==="world")`，编译的是**整个注册表**（该世界装了 210+ 个模块），一次「同步全部」就可能触及上千个键
  解法：装第三方同步类模块前先问三个问题：它写哪些键？怎么写的（并发还是串行）？出问题能不能一键回退？—— 本例三个答案分别是「全部」「并发」「不能」
  证据：L104-114、L148

### 处置（诊断 → 备份 → 删除）
- 诊断（只读）：按 `key + user` 分组，输出重复组数、份数分布、各份创建时间、内容是否相同
  证据：L127
- 备份：把每组的完整信息（键、份数、id、创建时间、值）序列化后 `game.clipboard.copyPlainText(...)`，让用户粘到本地文件存好
  证据：L129
- 坑：删除时删错份数
  解法：`foundry.utils.getDocumentClass("Setting").deleteDocuments(ids, {})`，**删每组第二份及以后、保留第一份** —— 官方 `game.settings.set` 永远更新「找到的第一份」，所以第一份永远是最新值，后面的副本从那一刻起就是死的；给 **8~9 秒缓冲** + 明确告知「按 F5 可取消」再真正执行
  证据：L130-132、L147
- 坑：清理完不卸模块 ⇒ 下次同步又造新的
  解法：关掉/卸掉 `world-setting-sync`；`forien-copy-environment` 的导入路径里也有 `storage.setItem(data.key, data.value)`（`scripts/core.js:546`），属同类风险，一起注意
  证据：L136-137
- 坑：HTTP 环境下用浏览器原生 `navigator.clipboard`（undefined）—— 用户服务器 `http://146.56.232.12:30000` 是 HTTP 环境
  解法：必须用 `game.clipboard.copyPlainText`
  证据：L156
- 方法论：用户世界里出现「数据看着不对但功能正常」的现象时，**先怀疑历史遗留的批量写入**，别急着改自己的代码；用 `_stats.createdTime` 分组，十分钟就能定性；发现是第三方模块干的，要给出**可指认的代码行号**，不要只说「可能是某个模块」
  证据：L154-155

---

## 血的教训-简单陷阱篇.md

### 根本教训
- 坑：金标准一直摆在资料库里（`01_跑团工具\网格构筑师\` 的 TRAP_SCRIPT 就是陷阱结算的正确答案），却自己发明了 UUID 托管、缓存、清理三层，绕了三轮才回到原点
  解法：照抄网格构筑师，别自己发明
  证据：L15、L107
- 坑：图标猜路径 —— `icons/svg/status.svg`、`icons/svg/trap.svg`、`claw-hooked-barbed.webp` 全 **404**
  解法：必须先 grep 用户世界导出 JSON 拿真路径；0 样本 = 404 风险，禁用
  证据：L16、L108
- 坑：以为 midi 13.0.55 会用 `midiOptions.targetUuids` —— 实际目标来源是 `game.user.targets`
  解法：自动触发单目标时照抄网格构筑师（单 token 恰好能工作）；要换目标必须 `updateTokenTargets` 清脏 + 写入 + 延时
  证据：L17、L109

### 15 条翻车时间线（逐条根因 + 正解）
- 1 坑：UUID 陷阱第一轮被「物品无归属角色」拦截（合集包物品没挂 NPC，midi 拒绝结算）
  解法：必须复制物品挂到「网格机关·陷阱发动者」NPC 上
  证据：L23
- 2 坑：第二轮托管后卡死 —— `MidiActivityMixin.ts:598 Cannot read properties of undefined (reading 'uuid')`（midi 豁免结算读 `game.user.targets`，集合里有 undefined 脏项，smarttarget 模块嫌疑）⇒ 崩在 completeItemUse 内部、markDone 没执行、重复触发 = 卡死
  解法：结算前 `updateTokenTargets([])` 清空、`updateTokenTargets([tk.id])` 写踩入者、`await 80ms`、结算后清空
  证据：L24
- 3 坑：DC 覆盖永远是 10 —— `act.save.dc.calculation:"flat"` 不是合法值，系统丢回默认 10
  解法：`calculation:""` + `formula:数字`（网格构筑师 Line 303）
  证据：L25
- 4 坑：NPC 旧副本污染 —— 测试把 DC10 副本留在了「网格机关·陷阱发动者」NPC 物品栏
  解法：找同源副本（`gmlTrapCopy` + `sourceUuid` flag）直接 `actDoc.update({"save.dc.calculation":"","save.dc.formula":...})`，不再无脑复制
  证据：L26
- 5 坑：save 结算永远只炸第一个（midi 无视 `targetUuids`，用 `game.user.targets`）
  解法：最终弃用 midi 自掷豁免 —— `new Roll("1d20+"+bonus, actor.getRollData())` + `await r.evaluate()` + `r.toMessage({flavor, speaker: spk(actor, token)})`，三档语义 half/full/none 自己判
  证据：L27、L52-58
- 6 坑：「过了豁免还扣血」—— Overtime 参数 `rollType:"check"`（属性检定）写错，且 `damageBeforeSave:true` 先扣血观感错
  解法：`rollType:"save"`（豁免）+ `damageBeforeSave:false`
  证据：L28
- 7 坑：手动触发只命中一个 token —— 中心点判定 `t.document.x + t.document.width/2` 错：`width` 是**格数**不是像素
  解法：用 token 像素边界矩形（`t.x/t.y/t.width/t.height`）与陷阱多边形包围盒（`PIXI.Polygon`）相交判定，边界接触算
  证据：L29、L59
- 8 坑：改完代码陷阱不生效 —— RegionBehavior 的 `executeScript` **放置时固化**
  解法：改宏必须删旧陷阱重放
  证据：L30、L110
- 9 坑：旧版格子删不掉 —— flag 结构升级不兼容：旧平铺 `{simpleTrapsLayer:true}`（布尔）vs 新嵌套对象，删除逻辑只认对象
  解法：匹配用 `getFlag(...) !== undefined` 通吃两版 + 给清理脚本（`canvas.scene.drawings/regions.filter(d=>d.getFlag('world','simpleTrapsLayer')!==undefined)` → `deleteEmbeddedDocuments('Drawing'/'Region', ids)`）
  证据：L31、L96-101、L111
- 10 坑：面板宏升级后旧 DOM 不重建（`window.__st.panel` 持久对象，新控件「DC 覆盖框」看不到）
  解法：showPanel 开头做「新字段探测」，缺新字段则 remove 重建
  证据：L32、L112
- 11 坑：V13 面板崩溃 —— `Cannot set property element of #<Application> which has only a getter`（V1 Application 已弃，element 只读）
  解法：手搓 jQuery 浮窗（fixed 定位 + zIndex 10001 + appendTo body）
  证据：L33
- 12 坑：面板透明一坨 —— 用了不存在的 `var(--surface)`
  解法：V13 是 `--color-surface`，且要兜底色
  证据：L34
- 13 坑：按钮切场景消失 —— 唤醒块 `clearInterval(poller)` 注入成功即停；切场景重建控制栏 DOM 清掉按钮
  解法：**常驻轮询**（1.5s 心跳只做一次选择器查询，锚点没出现就 return、按钮已在就 return；**严禁 `clearInterval` 即停**）
  证据：L35、L78-88、L112
- 14 坑：导入报错 —— `_id` / `author` 必须 16 位字母数字（宏实体同 activity `_id`）；Import Data 只认单对象
  解法：见上
  证据：L36
- 15 坑：探针自己崩 —— `JSON.stringify(args[0])` 遇 Token5e **循环引用**；`Object.getPrototypeOf(undefined)`；`advancement?.length`（5.2+ 要用 `.size`）
  解法：探针也要本地验证；`JSON.stringify` 勿碰 token/actor
  证据：L37、L113

### 正解存档
- Overtime 参数（`51-推荐观看.md` + data-dict Line 564）：`flags.midi-qol.OverTime`（mode 0）—— `turn=start/end, damageRoll=..., damageType=..., saveDC=..., saveAbility=con, saveCount=1-, rollType=save（豁免！不是 check）, damageBeforeSave=false, actionSave=dialog, label=...`
  证据：L62-63
- 图标真源（grep 用户世界 193 处 img 验证过）：靶心 `icons/skills/targeting/target-glowing-yellow.webp`；流血 `icons/commodities/claws/claw-spiked-gold.webp`（`claw-hooked-barbed` 是 404）；转移/轨迹 `icons/magic/movement/trail-streak-zigzag-teal.webp`；击退 `icons/skills/ranged/bullet-sparks-yellow.webp`；状态兜底 `icons/svg/aura.svg`（`status.svg` / `trap.svg` 不存在）
  证据：L65-70
- TRAP_SCRIPT 金标准（网格构筑师 Line 23-45）：`if(!game.users.activeGM || game.user.id!==game.users.activeGM.id) return;` 主 GM 才结算；`const f = region.getFlag('world','simpleTrapsLayer'); if(!f) return;`；`const mode=f.triggerMode||'once'; if(mode==='once'&&f.triggered) return;`；`const token = event?.data?.token; if(!token?.actor) return;`；`perActor` 用 `triggeredActors` 数组去重；自掷豁免 `const sd=actor.system?.abilities?.[ab]||{}; const bonus=(typeof sd.save==="number"&&isFinite(sd.save))?sd.save:(sd.mod??0);`；`r.toMessage({flavor, speaker: spk(actor, token)})` **★带 speaker，消 AC5E/blfx 警告**；markDone 用 `region.setFlag('world','simpleTrapsLayer',{...f,...})`
  证据：L43-60
- 面板持久化：位置拖拽 mouseup 存 `localStorage['simpleTraps.panelPos']={left,top}`，恢复时 **clamp 防出屏**（left≥0、top≥0、right≤innerWidth-宽-8、bottom≤innerHeight-60），有记忆切 `left/top` + `right:'auto',bottom:'auto'`；主题存 `localStorage['simpleTraps.theme']`；显隐切换用 `$panel.find(".cls").toggle(...)`，**勿用 `.first()`**（只切第一个匹配项）
  证据：L90-93
- 交付纪律：**给用户控制台脚本纯文本顶格**，勿包 HTML 卡片（复制带 `<` 报 `Unexpected token`）
  证据：L114

---

## 本次未能确定的问题

- `automationOnly: true` 的确切语义两说并存未定：①「仅自动化、不可手动使用」（本地资料库 `(已瘦身)自动化指北——哪些自动化需要用到什么？.md:1875`）②「只从『选择活动』弹窗里藏掉」（midi 源码候选筛选 `!midiProperties.automationOnly`）。原文明写「不选边」。
- 未解释现象：《铁棺》「点纯 `utility` 变形活动也要过豁免，没过不给变」—— 源码说 utility 默认 `otherActivityId:"none"`，理论上不该连带；该物品已随世界换代消失、无法复现；需在同类物品上用 `midi-otherActivity-源码级结论.md` §9 探针实抓。
- `midi-otherActivity-源码级结论.md` §12 只实机验证了 `attack` + `save` 两个活动的组合，**不可外推为「任何组合都安全」**（`utility` 参与的连带仍无解释）。
- v12 时代 `autoMergeActivityOther` 的默认值无法核验（源码自 12.4.31 起移除，只剩 i18n 文案残留）。
- `foundry-mcp/release/dsh-foundry-vtt/plugin/{src,lib}/knowledge-local/FVTT-monster-spec-v2_1.md` 两份是「构建产物」还是「发布快照」**未确认**，动手改前必须先判定是否会被发版流程覆盖。
- DialogV2 content 内联事件失效的**机制**只是推断（疑似内部富文本净化），原文标注「未逐一坐实，写代码别依赖以下细节」。
- `制作妄质百变腕甲` 篇标注【标准·待实测】的项未进游戏坐实：`specialDuration` 的 `isSave` / `1Spell` / `turnEnd` / `turnEndSource`；`system.traits.dr.value` 数组加值的 mode2 写法。
- 《血的教训-桥接工具链实战篇》提到的冲突未在本批文件内闭合：他的 `≤6 条最稳` 与我们的 `30 条/90ms` 无普适数字，需按具体世界实测批次上限。
- 本批 11 篇中多篇引用的姊妹篇（`血的教训-强迫目标移动篇.md`、`血的教训-远程盲调UI篇.md`、`血的教训-CSS面板配置篇.md`、`血的教训-Aeris-Tokens改版篇.md`、`血的教训-世界同步装置篇.md`、`血的教训-教学视频库优化篇.md`）**不在本次要读的 11 个文件清单内**，其坑未提取。
<!-- 来源：lh-crafting（模板）\_开发铁律.md 全部 350 条编号 + 专题小节 -->

## 零 · 本项目线上实测结论（2026-09-18，非推测）
- 环境实测：Foundry **13.351** / dnd5e **5.3.3** / 世界 `wzsx`「危在松溪」/ 204 模块
- `CompendiumCollection.createCompendium(metadata, options)` 静态方法存在、GM 权限、走 socket 派发；建**世界包** `packageType:"world"` 两次成功（`world.lhprobe` / `world.lhfoodtest`）；包内建品类文件夹 `Folder.create({name,type:"Item"},{pack})` 成功；删包 `pack.deleteCompendium()` 成功、复查为空
- 坑：`item.folder` 有 object / string 两种形态（`Item.create()` 返回值里是 Folder 对象，`toObject()` 里是字符串 id）
  解法：一律用 `folderIdOf()` 归一化
- `CONFIG.DND5E.consumableTypes.food.subtypes = ["food","water","both"]`；consumable 的 `system.type={value:"food",subtype:"food"}` 原样落库、dnd5e 不清洗
- `game.restrecovery` 8 个官方函数全在（`setActorConsumableValues` / `getActorConsumableUpdates` 等）；`game.time.worldTime` 单位是**秒**（+28800 实测正好 8 小时后）；`JSZip` 是浏览器全局；`foundry.utils.saveDataToFile` / `readTextFromFile` 都在
- 全局 CSS `/css/foundry2.css` 在线可取（429,002 字符）—— 旧的 `F:\BaiduSyncdisk\FVTT\...` 路径已失效；服务器数据目录报错里出现过 `C:\BaiduSyncdisk\FVTT\Data\modules\`（**未验证**是服务端还是本机）
- 静态文件 fetch `modules/<id>/module.json` → 200

### ★ AppV2 静默失败的真根因（本次抓到）
- 坑：只写 `_renderHTML` → 报 `Application class is not renderable because it does not implement the abstract methods _renderHTML and _replaceHTML`
  解法：两个都写 —— `static DEFAULT_OPTIONS = { id:"...", window:{title:"..."}, position:{width:400,height:160} }` + `async _renderHTML(ctx, opts)` + `_replaceHTML(result, content, options){ content.innerHTML = result; }`；`HandlebarsApplicationMixin` 也可用（它会读 PARTS 里的模板文件）。用户世界「冒险者面板」宏只写了 `_renderHTML` ⇒ 13.351 上打不开

### ★ 重渲染路径与输入框（0.3.0 动手前专门跑的探针）
- `await panel.render({ force: true })` 真的会重跑两个抽象方法（实测调 3 次 → `_renderHTML` 跑 3 次、`_replaceHTML` 跑 3 次）
- 绑在 `content` 上的 input 事件委托收得到：`content.addEventListener("input", handler)` + `box.dispatchEvent(new Event("input",{bubbles:true}))`
- 坑：重渲染会把输入框打回模板里写死的 value，用户打一半的字会消失
  解法：`` `<input value="${esc(this.keyword)}">` `` 从实例回灌；`` `<input value="abc">` `` ❌
- 焦点恢复实测有效：打字时记 `this.restoreCaret = box.selectionStart`，`_replaceHTML` 里 innerHTML 之后 `box.focus(); box.setSelectionRange(caret, caret);`
- 窗口祖先链实测：`INPUT.lhc-search → SECTION.window-content → DIV.application lh-crafting lh-craft-window`（`this.element` = 最后那个 DIV；主题类挂它，CSS 变量继承下来）
- 坑：核心给 `.window-content` 里裸 `input` 的默认样式是个深灰盒子：`background rgb(59,59,59)` / `color rgb(255,255,255)` / `border 2px inset rgb(133,133,133)` / `padding 1px 2px` / `border-radius 0` / `height 23.5px`
  解法：`.lh-craft-window .lhc-search`（特异性 **0,2,0**）压过它，实测生效值 `bg rgb(251,246,233)` / `padding 7px 10px` / `radius 7px` / `height 33.5px`

## 一 · 模块骨架与生命周期（1–7）
- 1. 坑：模块文件顶层读 `game` → ReferenceError
  解法：要 `game` 的一律放 `Hooks.once("ready")` 之后（出处 `血的教训-世界同步装置篇.md:424-427`）
- 2. 坑：`Hooks.on` 放进 `ready` 会错过首次触发
  解法：所有 `Hooks.on` 在**文件顶层**注册（`W:405-419`）
- 3. 坑：顶层挂 `window.LHCraft` 之类调试入口挂不上
  解法：调试入口挂 `ready` 之后
- 4. 坑：依赖缺失裸调 libWrapper → ReferenceError 打断整个 init → 32 个设置一个都没注册
  解法：依赖要加守卫，没装 Rest Recovery 时其余功能必须照常注册（`A:113-118`）
- 5. 坑：包装 dnd5e 核心方法 / 改核心对象内部状态
  解法：不包装、不改内部状态；介入走 hook，改动一律包 try/catch（`A:158-159`、`A:263`）
- 6. 坑：全新安装 / 空世界跑不通
  解法：不依赖任何历史残留 Setting，必须能跑通全流程（`血的教训-代码审阅自检清单篇.md:54-58`）
- 7. 坑：把用户数据（配方/采集记录）写进 `persistentStorage` —— 卸载时 `storage/` 被 `fs.rm(recursive:true)` 一起删，不可恢复
  解法：用户数据放世界 compendium / flags（`W:145-147`）

## 二 · 世界包与文件夹（8–11）
- 8. 坑：把包归入「合集包文件夹」只写 `core.compendiumConfiguration` 的映射 → 指针悬空、包全散到顶层、**核心静默当 null、零报错**
  解法：必须同时创建/复用 Folder 文档本体并保住 `_id`（`W:56-69`、`W:330-360`）
- 9. 坑：先建子文件夹再补父级会乱
  解法：文件夹先全建在顶层，第二步再补父级；按 `_id` 判重，已有同 id 绝不动（`W:343-347`）
- 10. 坑：靠 id 引用的地方（配方→材料、配方→产物、包→文件夹）引用不到时核心定义成 null，丢数据与「本来就没有」在数据上完全一样
  解法：写完自己显式解析一次该 id 是否命中（`W:530-532`、`W:362-363`）
- 11. 坑：`item.folder` 有 object / string 两种形态
  解法：一律用 `folderIdOf()` 归一化（本项目实测）

## 三 · 批量写、导入、幂等（12–21）
- 12. 坑：`promises.push(某个 set)` + `Promise.all` 同键并发写 → 上千份重复文档且潜伏半年
  解法：批量写用 `createDocuments`/`updateDocuments`（`血的教训-第三方同步模块并发写设置篇.md:143`、`W:192-199`）
- 13. 坑：同一批写入里重复键
  解法：先合并去重、一个键只写一次；重复检测按 **key + user 两个维度**（`C:144-145`）
- 14. 坑：写「含其他模块键」的设置对象时缺键 = 该模块被静默关掉
  解法：用合并写（当前世界打底 + 本模块恒 true）（`W:228-238`）
- 15. 坑：坏 JSON/zip 直接写库
  解法：硬校验，构造 **8 类坏输入**逐条测：非 JSON / 类型不对 / 缺字段 / 重复键 / 版本过新 / 超大 / 编码错 / 空；宁可拒收不可写坏（`R:84-88`）
- 16. 坑：`JSON.stringify(a)===JSON.stringify(b)` 比较对象，键序不同会误判成有变化
  解法：不用它（`R:118`）
- 17. 坑：写操作连点两次出错
  解法：幂等 + 带状态标记，不靠用户手不抖（`R:90-94`）
- 18. 坑：清理/覆盖用户数据无备份
  解法：先导出备份，只删多余副本、保留官方实际读取的第一份（`C:147`）
- 19. 坑：持久化状态键用可改的显示名
  解法：用稳定 id（`actor.id`/`item.id`/`world.id`）（`R:49-52`）
- 20. 坑：写失败只报「已回滚」而世界停在中间
  解法：提示分三态（没开始 / 回滚失败 / 已回滚）（`W:212-219`）
- 21. 坑：同一判据在多处各写一份
  解法：只写一处，抽成函数供手动 / 自动 / 批量路径共用（`R:72-76`）

## 四 · 面板与前端（22–41）
- 22. 坑：FVTT 全局 `body.game .app button{width:100%;margin:0 1px}`（`foundry2.css`）特异性 `(0,2,2)` 压过模块单类选择器 `(0,1,0)` → 按钮撑满、input 被挤成 32px 小方块
  解法：自己的按钮加 `width: auto !important`（`血的教训-CSS面板配置篇.md:96-108`）
- 23. 坑：查 `document.styleSheets[].href` 找不到模块 CSS
  解法：模块 CSS 是 `<style>` 内 `@import` 注入，诊断查 `document.querySelectorAll('style')` 的 `@import`（`CSS面板配置篇:112-114`）
- 24. 坑：CSS 问题靠猜「没加载 / flex 失效 / 空间被抢」
  解法：用 `getComputedStyle` 实测 computed 值（`flex`/`width`/`display`）（`CSS面板配置篇:207`）
- 25. 坑：以为 `@layer` 会降低特异性
  解法：`@layer` 不影响特异性 —— 模块 CSS 未分层通常能压过分层的全局 CSS，但多元素选择器仍会在特异性上赢（`CSS面板配置篇:116-120`）
- 26. 坑：CSS 变量挂内层 div → 子窗/预览弹窗在作用域外拿不到
  解法：变量挂窗口元素（`CSS面板配置篇:153-156`）
- 27. 坑：颜色变量写 `--surface`
  解法：用 V13 真名 `--color-surface`（`CSS面板配置篇:68-70`）
- 28. 坑：Dialog/按钮 `icon` 写类名字符串 → 渲染成「fa-solid fa-xmark 关闭」这段文字
  解法：`icon` 必须是 HTML 字符串 `'<i class="fa-solid fa-xmark"></i>'`（`CSS面板配置篇:63-66`）
- 29. 坑：独立 fa 图标当装饰占位 → v13 下渲染成 2 字符空白方块
  解法：要图标用 SVG 或放进有文字的按钮里（`CSS面板配置篇:58-61`）
- 30. 坑：用户浏览器「点击命中检测不跟随 transform」——视觉挪了、热区留原地
  解法：任何需要点击的元素不许用 transform 位移定位，统一 `left/top` 直摆；CSS 入位动画 keyframes **不写 translate**（`血的教训-远程盲调UI篇.md:54-64`，8 轮才锁定）
- 31. 坑：DialogV2 content 字符串里写内联 onchange/onclick → 实测不触发、**静默保持默认值**
  解法：content 只放带 `name` 的表单元素；取值在 `callback: (event, button, dialog) => { ...读 dialog.element...; return 值 }` 里读 DOM，**返回值即提交值**（`DialogV2:17-19,57-88`）
- 32. 坑：只测「默认路径能用」不证明交互活着
  解法：测试弹窗必须走「非默认选项」路径（点非默认 radio、取消至少一个勾选再确认）（`DialogV2:18,100`）
- 33. 坑：DialogV2 会清洗 content 里的 `<style>`/`<svg>`
  解法：content 只放 `<div class="mount"></div>`，渲染后 JS `innerHTML` 注入面板、CSS 用 `createElement('style')` 塞 head（`制作妄质百变腕甲:22-23`）
- 34. 坑：注入按钮的轮询被 `clearInterval` 停掉，切场景重建 DOM 后按钮消失
  解法：轮询常驻：`Hooks.once("ready")` + `setInterval(1500)` + `insertAfter("button.control.ui-control.layer.icon.fa-solid.fa-bookmark")`（`简单陷阱篇:76-93`、`教学视频库优化篇:197-198`）
- 35. 坑：v13/v14 场景控制按钮参数形状不同
  解法：`Hooks.on("getSceneControlButtons", controls => {...})`，兼容判据 `const isV14 = !Array.isArray(controls);`（v13 数组、v14 对象）（gacha-banner `scripts/gacha.js:1019-1084`）
- 36. 坑：z-index 被其它模块污染
  解法：`isolation: isolate`（gacha-banner `styles/styles.css:52`）
- 37. 坑：全屏 AppV2 写法不明
  解法：`window:{frame:false,positioned:false,controls:[]}` + `position:{width:"100%",height:"100%"}` + CSS `position:fixed;inset:0`
- 38. 坑：TAB 切换重算 context 导致闪烁
  解法：单 PART 装整张表单，TAB 切换只换 class 不 render
- 39. 坑：手写事件派发
  解法：`actions: { name: fn }` 静态表 + `data-action` —— AppV2 原生事件派发，`this` 已是 App 实例
- 40. 坑：只靠按钮不显示做权限
  解法：面板每个写入口第一行就是身份守卫（GM / 拥有者）（`R:102-106`）
- 41. 坑：`window-open` 的 `::after` opacity 过渡被跳过（首帧即终态）
  解法：`requestAnimationFrame(() => root.classList.add("show"))`

## 五 · 玩家权限与 socket（42–50）
- 42. 坑：不知玩家能做什么
  解法：玩家能做 —— 动自己 token、给自己加 buff/临时 HP、掷骰、发聊天、Sequencer 动画、**读任何可见 token 的 flag**（读不需要权限）
- 43. 坑：不知哪些操作报 `lacks permission`
  解法：给敌人加/删 AE、移动敌人、改敌人 HP/属性/flag、增删场景文档（Region/Drawing/Tile/Wall/Light/Note）、增删 token —— 都会报
- 44. 坑：判不准该不该委托 GM
  解法：口诀 —— 这个操作改的是「我自己」还是「别人/场景」？后者一律委托 GM
- 45. 坑：socket 频道写 `world.*` → 服务器静默丢弃；**GM 自己用能成**（走本地直调没过 socket），PL 用没反应
  解法：频道只能是 `module.<id>` 或 `system.<id>`（`之前踩过的坑.txt:32,89`）
- 46. 坑：以为 `"socket": true` 给了服务器权限
  解法：它只是布尔字段（`common/packages/base-package.mjs:387`）（`教学视频库优化篇:70-72`）
- 47. 坑：自己重造委托通道
  解法：世界里 `longhua-dm-toolkit` 已开 `"socket": true`，`world-scripter` 里有常驻 `LHGM` 委托脚本；模板 `ops.push({ tokenId: tgt.id, addStatuses: ["prone"] }); if (ops.length) await globalThis.LHGM?.request({ sceneId: canvas.scene.id, ops });`（`之前踩过的坑.txt:6-28`）
- 48. 坑：多余绕 LHGM
  解法：midi 的活动效果（`activity.effects`）与位移 API 会自动以 GM 权限跑（`血的教训-强迫目标移动篇.md:152-153`）
- 49. 坑：物品没有归属 actor 时 midi 拒绝结算（`简单陷阱篇:23`）
  解法：先确保物品挂在某个 actor 上
- 50. 坑：`actor.update({ownership})` 是深合并，`delete localObj[key]` 再整体 update 无效
  解法：删 key 必须 `{"-=" + userId: null}`（`之前踩过的坑.txt:95-100`）

## 六 · dnd5e 物品 / 活动 / 效果结构（51–69）
- 51. 坑：`_id` 长度不对
  解法：所有 `_id`（activity、AE、宏）必须**恰好 16 位字母数字**（`勘误与待办-otherActivity-移交另一个AI.md:203`）
- 52. 坑：默认 `consumption.spellSlot: true`，不关掉活动会吃法术位
  解法：建活动先只给 `{type,name}` 最小壳，再 `toObject()` 读回真实默认值（`双形态武器与活动自动化篇.md:241-257`）
- 53. 坑：`attack` 的 `otherActivityId` 默认是空串 = midi 自动探测，会把同物品上任何合格活动（**utility 也算合格**）自动绑到这次攻击上
  解法：每个会结算的活动显式写 `otherActivityId: "none"`（`midi-otherActivity-源码级结论.md:34-44`）
- 54. 坑：拿 damage/heal 当主活动
  解法：只有 `attack`/`check`/`save`/`utility` 能当主活动（`midi-otherActivity:28`）
- 55. 坑：`transfer:false` 的物品级 AE 没有活动链接就永远不会被施加
  解法：活动 `effects[]._id` 必须指向真实存在的物品级 AE 的 `_id`（`双形态:981-987`）
- 56. 坑：`updateDocuments` 传 `effects:[...]` 是按 `_id` 合并，传更短的数组 ≠ 删除，无报错
  解法：删物品上的 effects 用 `deleteEmbeddedDocuments`（`双形态:894-919`）
- 57. 坑：用 `a._source.effects` 复核「写了没生效」→ 不刷新，得出假结论
  解法：只用 `it.toObject()`（`双形态:628-697`）
- 58. 坑：效应图标写 `icon`
  解法：字段是 `img` 不是 `icon`（`制作妄质百变腕甲:25-29`）
- 59. 坑：`ac.calc` 写 `"flat"` 会直接 return、吞掉全部加值且不报错
  解法：要加值必须 `"natural"`；加值走 `system.attributes.ac.bonus` mode2（`AC加值与DAE条件实测篇.md:8-67`）
- 60. 坑：走 `attributes` 下那套旧路径设抗性
  解法：traits 真实路径是 `system.traits.dr.value`（抗性）/ `di.value` / `ci.value`（`AC加值:142-143`）
- 61. 坑：「免疫某状态」用 `statuses`（那是施加）；`mode:5` 会替换整个 Set（禁用）
  解法：`changes:[{key:"system.traits.ci.value", mode:2, value:"charmed"}]` 且 `statuses: []`（`双形态:993-1009`）
- 62. 坑：抄 `CONFIG.statusEffects[].name` 会把 `MonksLittleDetails.StatusSlowed` 这类键名显示在卡面
  解法：AE 的 `name` 单独手写中文，`statuses` 仍填真 statusId（`双形态:1071-1084`）
- 63. 坑：纯 changes、无 status 的效应默认不显图标
  解法：加 `flags.dae.showIcon:true` + `duration` + `img`；`flags.dae` 要写全套（`制作妄质百变腕甲:25-29`）
- 64. 坑：`disableCondition` 表达式不带 `@` 前缀 = 字段不被替换 = 条件恒真
  解法：条件效果被动随字段开关一律用 `disableCondition`，表达式必须带 `@`（`AC加值:71-135`）
- 65. 坑：save 的 DC 覆盖写 `"flat"` —— 不是合法值
  解法：必须 `calculation:""` + `formula` 数字（`简单陷阱篇:109`）
- 66. 坑：`midiProperties.ignoreTraits` 写布尔对象会被静默清空成 `{}`
  解法：它是字符串数组（`["idr","idi"]`）；读这个 SetField 必须 `Array.from()`（`双形态:259-312`）
- 67. 坑：用别的方式做次数/材料约束
  解法：用活动自带 `consumption.targets`，6 键 = `activityUses`/`itemUses`/`material`/`hitDice`/`spellSlots`/`attribute`；池子不足抛 `ConsumptionError`，强制阻止使用（`双形态:382-386`）
- 68. 坑：只配 `uses` 不配对应 `consumption` = 完全没有约束（`双形态:390`）
  解法：`uses` 与 `consumption` 成对配
- 69. 坑：动态数值（晶槽数、价格）写死
  解法：实时从 actor/item 读（`之前踩过的坑.txt:76`）

## 七 · 图标与动画（70–71）
- 70. 坑：图标路径 0 样本 = 404（反例 `icons/svg/status.svg`、`icons/svg/trap.svg` 全 404）
  解法：先检索真源再写，一律用 `foundry_search_icon` 拿真路径原样照抄（`简单陷阱篇:16,65-70,108`）
- 71. 坑：AA 的 `sound` 只写 `{enable:false}` = 根本没配；视频/音效路径写错是**静默不播、无报错**
  解法：`sound` 是七字段对象 `enable/file/volume/delay/startTime/repeat/repeatDelay`（`双形态:129-146`）

## 八 · 发布与打包（72–81）
- 72. 坑：v1.1.5 包里静默漏了 93 个样本文件
  解法：打包后立刻数产物（zip 条目数 vs 磁盘），对不上就不发版（`发布校验与查证纪律篇.md:36,42-49`）
- 73. 坑：把「提交进 git」当「打进 zip」
  解法：两件独立的事，分别验证（`P:37`）
- 74. 坑：版本号漏改
  解法：version **三处以上同步**（`module.json` / JS 头注释 / 探针常量），打包前改完（`W:471-472`、`代码审阅自检清单篇.md:124-128`）
- 75. 坑：交付话术写「只覆盖某几个文件」
  解法：永远写「整包替换 + 重进世界（Ctrl+F5 不够）」
- 76. 坑：用户说装了 LH.19，真机读回是 LH.12，差 7 个版本
  解法：交付后必须让用户回报 `game.modules.get("lh-crafting").version`（`A:246-247`）
- 77. 坑：GitHub Release 附件名与 `download` 字段不一致 → latest 下载 404
  解法：附件名必须与 module.json 的 `download` 文件名逐字一致（`W:483-484`）
- 78. 坑：zip 条目名用反斜杠 —— 合规范的读取器会把 `scripts\lh-crafting.js` 当成根目录下一个名字带反斜杠的文件 ⇒ 模块里根本没有 `scripts/` ⇒ 直接坏掉。PowerShell `Compress-Archive -Path "$stage\*"` 生成的就是反斜杠条目名；而 Windows 侧 `Expand-Archive` **两种都能解** ⇒ 手工解压完全看不出问题
  解法：ZIP 规范（PKWARE APPNOTE 4.4.17.1）要求 `/`；用 `[System.IO.Compression.ZipFile]::Open($zip,'Create')` + `CreateEntryFromFile($arc,$file,$rel)`，`$rel` 自己 `-replace '\\','/'`；抽验 `GetEntry("scripts/lh-crafting.js")`。PowerShell 要 `Add-Type` **两个**程序集：`System.IO.Compression`（含 `ZipArchiveMode`/`CompressionLevel`）**和** `System.IO.Compression.FileSystem`（含 `ZipFile`/`ZipFileExtensions`），只加载后者报 `Unable to find type [System.IO.Compression.ZipArchiveMode]`。⚠️ 假象：`Compress-Archive` 会顺手把程序集加载进来，所以「先跑过一次 Compress-Archive 再用 .NET 类型」能成。🩸 **破坏性步骤必须放最后**：正确顺序 = 建到临时路径 → 回读校验条目数与分隔符 → 解压树校验 → 全过才挪到位（连做两次「先删旧 zip 再新建」都失败，一度没有产物）。另注：「Compress-Archive 会丢 `scripts/` 前缀」这句 2026-09-18 实测**未复现**
- 79. 坑：用 `<a download>` 下载 —— FVTT 全局拦截 `a[href]` 做 preventDefault+window.open，文件名退化成 blob UUID
  解法：捕获阶段 stopPropagation 后 dispatchEvent（`W:447-448`）
- 80. 坑：想做「游戏内删服务器文件」—— 做不到
  解法：`manageFiles` 只有 `browseFiles`/`createDirectory`/`configurePath`，没有删除；HTTP 路由只有 GET/POST，**任何 DELETE 都是 404** ⇒ 做「清单面板 + 指引用户手动删」（`教学视频库优化篇:40-81`）
- 81. 坑：HTTP 服务器上 `navigator.clipboard` 是 undefined（非安全上下文）
  解法：复制一律用 `game.clipboard.copyPlainText(text)`（`教学视频库优化篇:85-96`；本项目服务器正是 `http://146.56.232.12:30000`）

## 九 · 本地校验与交付纪律（82–92）
- 82. 坑：中文文案里用英文半角双引号（U+0022）→ 提前闭合字符串 → `SyntaxError` → **模块整体静默加载失败**
  解法：交付前用正则扫，一律改「」（`远程盲调UI篇.md:115`）
- 83. 坑：一条 `if` 打包检查 `$LASTEXITCODE` —— 它只反映最后一条命令
  解法：逐个文件查退出码（`远程盲调UI篇:116`）
- 84. 坑：用 `node --check` 校验宏语法（FVTT 是 async 执行环境）
  解法：用 `AsyncFunction` 构造器（`制作妄质百变腕甲:110`）
- 85. 坑：宏里 `JSON.stringify` token/actor → Token5e 循环引用必崩，崩在探针上会伪装成「宏没触发」
  解法：打日志用 `console.log(对象)`（`强迫目标移动篇:62-64`）
- 86. 坑：用「应该没问题」交付
  解法：主动说清「哪些验过、哪些没验、没验的风险是什么」（`R:165-166`、`A:167`）
- 87. 坑：被用户质疑先解释
  解法：第一动作是跑命令拿证据（`P:38-39`）
- 88. 坑：单轮改动太多
  解法：单轮不超过 **10 处**，每处写行为断言，改完 grep 回读（`W:544-548`）
- 89. 坑：同一症状连改两版
  解法：第三版必须是「诊断版」，明说不修 bug、只抓数据（`开工方法论篇:52`）
- 90. 坑：两版同号（曾两版都叫 LH.22：102018 / 102055 字节）
  解法：每版必须换版本号
- 91. 坑：`execute_js` 的 forbidden-patterns 是纯正则扫全文，注释/字符串/变量名里一样被拒且不告诉你哪个词
  解法：已知踩雷 —— `game.settings.set`（连 `game.settings.settings` 都拦）、任何含 `Proxy` 的词、`import(`、`apiKey`、`globalThis`、`Intl.`、`Reflect.`（`双形态:564-578`）
- 92. 坑：给用户跑的控制台探针包了 HTML 卡片，复制带 `<` 会 Unexpected token
  解法：探针纯文本顶格（`简单陷阱篇:114`）

## 十 · gacha-banner 可直接搬的视觉技法（零依赖）
- 1 全屏黑幕淡入：`::after` + `inset:0` + `transition:opacity`，配 `requestAnimationFrame` 加 `.show`
- 2 假粒子：三层 `radial-gradient` 点阵 + `background-size` 错开 + 不同时长/方向 `translateY(-100vh)`，零 DOM 零 JS
- 3 噪点：内联 SVG `feTurbulence` 当 `background-image`（data URI，不依赖图片文件）
- 4 扫描线：`linear-gradient(transparent 50%, rgba(0,0,0,.3) 50%)` + `background-size:100% .25rem`
- 5 扫光 shine：`background-size:200% 200%` + 只动 `background-position`（元素不动）
- 6 按钮流光：渐变条 `translateX(-100%→100%)`，父级 `overflow:hidden`
- 7 呼吸：**先 skew 再 scale**，否则斜切角随缩放抖动
- 8 SVG 描边流光：`stroke-dasharray:150 300` + 动 `stroke-dashoffset:0→900`，`stroke` 吃 CSS 变量可跟随变色
- 9 精灵图帧动画：`background-size:400% 200%` + `step-end` 逐帧改 `background-position`（`linear` 会糊）
- 10 渐变字：`color:transparent` + `background-clip:text` + 多色 `linear-gradient`（要 `-webkit-` 前缀）
- 11 霓虹字：同一色四层 `text-shadow`：`0 0 5px / 15px / 30px / 50px`

### ★「变色」的三套机制（用户点名要的功能）
- 1 世界级调色板：一组 CSS 变量内联注入根元素；`<input type="color">` 的 `name` = 调色板键名；`input` 事件里 `livePreview.style.setProperty("--c-xxx", value)` **实时预览**
- 2 等级着色：一个颜色同时喂三个变量名（`--item-color` / `--item-color-glow` / `--card-rarity-color`）；用 `${hex}90` 拼 8 位 alpha 做同色柔光。⚠️ 前提是 6 位 hex ⇒ 必须一并搬 `ensureValidHex`（3 位简写要展开），否则出垃圾色
- 3 主题换 class 前缀：`game.settings` 里一个 `configTheme`，渲染时 `this.element.classList.add("theme-" + theme)`

## 十一 · 0.4.0 新踩的（93–100）
- 93. 坑：dnd5e 5.3.3 的 `actor.rollSkill` 签名与 5.2.x 不同 —— 旧宏 `actor.rollSkill("sur", {fastForward:true, chatMessage:false})` 会**静默**退化成空检定（传字符串当 config ⇒ `config.skill` undefined ⇒ 走 `rollAbilityCheck` 那一支，不报错、卡面照出、掷的东西不对）
  解法：5.3.3 真实签名 `async #rollSkillTool(type, config={}, dialog={}, message={})`（`/systems/dnd5e/dnd5e.mjs` @1369566）；正确写法 `const rolls = await actor.rollSkill({ skill: "sur" }, {}, {});` 然后**必须判 null**（玩家按取消就是 `null`），再读 `rolls[0].total`（默认返回**数组**）。落地纪律：自己再校验 `CONFIG.DND5E.skills[id]` 存在。实测技能 id：`sur`=求生 `slt`=巧手 `prc`=察觉 `inv`=调查 `med`=医药 `nat`=自然 `ani`=驯兽 `arc`=奥秘。另实测 `CONFIG.Actor.documentClass.name === "MidiActor"`（midi-qol 用 libWrapper 包了一层，**签名不变**）；`CONFIG.statusEffects` 是**数组**（62 条，`poisoned` 中文名「中毒」）；`CONFIG.DND5E.currencies` = `pp/gp/ep/sp/cp`
- 94. 坑：物品侧边栏顶栏入口写不对（以为第 2 参是 jQuery，写 `html.find()` 直接报错）
  解法：照抄 `modules/mastercrafted/scripts/config.js` —— `Hooks.on("renderItemDirectory", (app, html) => { const bar = html.querySelector(".header-actions.action-buttons"); ...bar.appendChild(button); });`；该钩子确实触发、首参 `ItemDirectory5e`、**4 个参数**、第 2 参是 HTMLElement。落点 `section#items > header.directory-header > div.header-actions.action-buttons`。目录反复重渲染 ⇒ 注入前**必须判重**（`bar.querySelector("[data-xxx]")`）；`Hooks.on` 必须在**文件顶层**
- 95. 坑：只靠 `foundry_search_icon` 的返回就落盘 —— 实测 13 条候选里真有 **1 条 404**（`icons/consumables/meat/fish-tail-cut-gray.webp`），坏率 **7.7%**
  解法：凡是要写进数据的图标，**一条一条 `fetch` 查 status===200** 再落盘
- 96. 坑：在 `.mjs`/`.js` 文件头注释里写 `/*xxx*/` 会提前闭合注释（`*/` 把块注释提前结束）→ `SyntaxError: Invalid or unexpected token`
  解法：注释里要提占位符就**只写名字，别写完整记法**
- 97. 坑：类名扫描把自己用的外部类名当「用了但没定义样式」→ 假报警
  解法：留一张外部类名白名单，至少含 `chat-card` / `message` / `flexrow` / `flexcol` / `fas|far|fab|fad` / `fa-*` / 模块 id 本身
- 98. 坑：预览页数据手抄，一改就和真模块对不上且很难发现
  解法：用生成器注入 —— `_preview.src.html`（模板 + 数据占位符）→ `_gen-preview-data.mjs` 读 `factory/*.json` → 输出 `_preview.html`；`file://` 下 `fetch` 本地 json 会被浏览器拦，数据只能内联，内联又不能靠手抄 ⇒ 只剩生成器这一条路
- 99. 坑：不知道两个校验脚本谁管谁
  解法：`_check.mjs` 查模块自身（JSON / 语法 / 版本同步 / 类名 / 配色 / 引用）；`_lhp-verify.mjs` 查预览页（vm 里假 DOM 真跑 + 数据完整性 + 类名与 data 属性契约）；**两个都必须 exit 0 才算交付**
- 100. 坑：给面板做「确定性随机」不知道存哪、谁有权改、怎么同步
  解法：用 `hash32(店key + 版本号)` 播种 `mulberry32`，版本号取 `floor(worldTime / 刷新周期秒数)` ⇒ 同一周期内谁打开都是同一批货、到点自动换，**一个字节都不用存**

## 十二 · 0.5.0 新踩的（101–104）
- 101. 坑：做「点一下原地展开」要弹窗或插新元素
  解法：用 `grid-column: 1 / -1` —— 点开的格子横跨整行，仍是同一格、同一位置长出来，同时满足「和储物格一样」+「不要二级窗口」
- 102. 坑：有限库存不记账 → 玩家能把限量稀罕货一直买；清旧账只保留当前店会把别的店的账一起抹掉
  解法：货架本身用确定性随机算（不落库），「卖掉了多少」必须落库 —— 世界设置 `shopSold`，键 = `店|周期版本|分区|物品`；写的时候顺手清掉「不属于任何店当前周期」的旧账；常货（无限库存）`qty` 用 `Infinity`，判据统一写 `Number.isFinite(row.qty)`
- 103. 坑：「只给 GM 看」只靠 `disabled` / `hidden` —— 玩家 F12 一扒就能看见被隐藏或禁用的 input 的 value
  解法：GM 判断写在模板层（`game.user?.isGM ? 渲染 : ""`），**同时**在状态刷新时把该值强制锁成设置值（`if (!game.user?.isGM) this.gather.dc = readSettingNum("gatherDC", 15)`），两层都做
- 104. 坑：改完代码不跑自己的校验脚本
  解法：先跑校验 —— `_check.mjs` 一次抓出中文注释里两个半角双引号（第 1158 / 1994 行）；`_lhp-verify.mjs` 从 54 项涨到 **70 项**，新增的全是「点开货格会不会原地出现购买条」「常货角标是不是 ∞」「集市该不该有常货」这类**行为级**断言

## 十三 · 0.6.0 新踩的（105–113）
- 105. 坑：以为 `ApplicationV2` 的 `position:{height:"auto"}` 不可用；且 `.lhc-root` 是 `height:100%`，父级高度算不出（auto）时会塌成 0 ⇒ 一片空白
  解法：实测可用（`offsetHeight:210`、`styleHeight:""`、`position.height:"auto"`）。auto 高度的窗口（如购买窗）不能套 `.lhc-root`，要另起自带背景/字色、不设高度、只挂主题类的根元素（本项目 `.lhc-buycard`）。**窗口高度与根元素高度必须二选一写死**
- 106. 坑：校验断言用 `includes("类名")` 子串匹配 —— 把 `.lhc-side` 写成 `.lhc-sid` 照样通过（被 `lhc-side-scroll` 命中）
  解法：锚到 `check(sh.includes('class="lhc-side"'))`。通用判据：凡是有「同一前缀的更长类名」存在，`includes` 检查就是假的（`lhc-card` 被 `lhc-card-name` 命中、`lhc-buy` 被 `lhc-buycard` 命中）
- 107. 坑：报「数据是对的、界面显示 0」先翻数据
  解法：先把数据算一遍 —— node 跑 `factory/gather.json` + `factory/shops.json` 得草药柜池 12、常货 **11**，数据完全正常；根因在显示层（分区页签只数随机货，再过 `chance 0.8` ⇒ 20% 概率是 0）
- 108. 坑：用户说法自相矛盾（「用某种特质的物品代替钱购买」+「就是换皮」），严格只扣物品或纯换皮都会误伤
  解法：折中 —— `useSkin = min(持有量, floor(需要量 / 面额值))`，剩下的从**非被替代面额**的币里扣
- 109. 坑：`<button>` 里再嵌 `<button>`（HTML 规范不允许）
  解法：把内层按钮搬进独立窗口；否则只能把货格从 `button` 改成 `div`（丢键盘可达性和原生样式）
- 110. 坑：`registerSettings` 里 choices 标签只查 `THEMES.find(...)`，加的货币面额选项找不到主题 ⇒ 菜单显示成 `gp`
  解法：改成 `THEMES.find(...) ?? COIN_LABEL[id] ?? id`
- 111. 坑：周期/版本号在两处独立算术（`shopVersionOf()` 与商店页顶部「下次换货还有 X」）⇒ 出现「界面说还有 3 小时换货、货却已经换了」
  解法：收敛到一个函数 `shopCycleSeconds(preset)`，谁要周期都从它拿
- 112. 坑：交付前不做演练
  解法：把 4 类错故意种回副本目录 → 8 项失败、exit 1；正是这次演练才暴露出第 106 条那个假通过的断言。**一个从来没红过的检查，等于没有检查**
- 113. 坑：`ApplicationV2` 窗口标题从哪来靠猜
  解法：线上源码逐行确认（`/scripts/foundry.mjs`，Foundry 13.351，181,100 行）—— **L27027** 基类 `get title(){ return game.i18n.localize(this.options.window.title); }`；**L27219** `this._configureRenderOptions(options)`，其内 **L27291** `options.window.title = (options.window.title || this.title).replace(/\s+/g," ").trim();`；**L27288** 这段包在 `if (options.isFirstRender)` 里（只在首渲染跑一次）；**L27504-27507** `_updateFrame` 里 `if ("title" in window) this.#window.title.innerText = window.title;` ⇒ `render({force:true})` 里没有 `window` 键 ⇒ 会读 `this.title` ⇒ 子类覆盖 `get title()` 能决定窗口表头。⚠️ 约束：`this.row`/`this.document` 这类被 `get title()` 读的字段必须在构造器 `super()` 之后立刻赋好。抽象方法报错原文（L27203-27205）：`` `The ${this.constructor.name} Application class is not renderable because it does not implement the abstract methods _renderHTML and _replaceHTML. Consider using a mixin such as foundry.applications.api.HandlebarsApplicationMixin for this purpose.` ``

## 十四 · 0.7.0 新踩的（114–122）
- 114. 坑：自绘 `<button>` 被核心压成 2em（`--button-size` = **28px**）；「文字不见了」＝那个元素被压成 0px 高。别以为是特异性打不过 —— `<button>` 只有 (0,0,1)，比 `.lhc-cell` (0,1,0) 低，真正机制是**我们压根没写 `height`**
  解法：`a.button, button { display:flex; justify-content:center; align-items:center; height:var(--button-size); min-height:var(--button-size); gap:.25rem; padding:0 .5rem; }`。**`height` 与 `min-height` 两条都要写**（只写 `height:24px` 仍被核心 `min-height:2em` 撑到 28px；`.lhc-swatch` / `.lhc-qbtn` 就是这么错的）。A/B 实测：加 `height:auto; min-height:0` 后格子高 28px→**92px**、名字高 0px→15px。判据：凡自己画的 `button`，`height` 与 `min-height` 必须成对出现
- 115. 坑：「在 FVTT 里坏了」顺着症状猜
  解法：先查那个东西装没装 —— 探针查 `game.modules.get("lh-crafting")` = null，`/modules/lh-crafting/module.json` 等四条路径**全 404** ⇒ 他看的是**本地预览页勾了「载入 Foundry 全局样式」**。症状发生在哪是「只有用户知道的事实」，但可以先用一次探针把范围砍到 1 个候选
- 116. 坑：复现 CSS 冲突真去装整份 CSS
  解法：在真 FVTT 页面里 `document.createElement` 一个隐藏容器，按真实结构写进去（`div.application.lh-craft-window > section.window-content > div.lhc-root > …`），然后遍历 `document.styleSheets` → `rule.selectorText` → `el.matches(selectorText)`，把命中它的每一条外来规则（含来源文件、选择器、声明）全列出来
- 117. 坑：`node --check` 只查语法 —— 0.7.0 把 `gatherSecondsFor` 改名成 `hoursPerCheck`，`selfTest()` 里漏了一处，`node --check` 全绿、`_check.mjs` 23 项全绿，**只有 `_lint.mjs` 报出来**
  解法：新增 `_lint.mjs` 查「调用了但没定义」。写它本身三个坑：① 必须先把注释抹掉（保留换行对齐行号）② 类方法、`get`/`set` getter 都要收进「已定义」③ 调用点正则要排除 `.` 与 `#` 前缀 `(?<![\w$.#])`
- 118. 坑：以为「食用后做点什么」必须靠 midi-qol / DAE
  解法：核心 hook 就够（`/systems/dnd5e/dnd5e.mjs`）—— **L16822** `async use(usage={}, dialog={}, message={})`；**L16867** `if (Hooks.call("dnd5e.preUseActivity", activity, usageConfig, dialogConfig, messageConfig) === false) return;`；**L16917** `if (Hooks.call("dnd5e.postUseActivity", activity, usageConfig, results) === false) return results;`。⚠️ `Hooks.call`（不是 `callAll`）是**同步**的、**不会 await async handler** ⇒ handler 里必须 fire-and-forget（`.catch(...)` 兜住）。返回 `false` 会短路，但 async handler 返回 Promise（truthy）不会误触发。附带：一条正则能扫出 dnd5e 全部 **89 个 hook 名**
- 119. 坑：用 `rollSkill` 去「顺便」做属性检定 —— 技能 id 不存在时内部静默降级成 `rollAbilityCheck`，旧版能蒙对、5.3.3 退化成空检定且不报错
  解法：用 `rollAbilityCheck`（**L37418** `async rollAbilityCheck(config={}, dialog={}, message={})`；**L57064** 实证调用 `this.actor.rollAbilityCheck({ ability, event })`）；并在代码里显式校验 `CONFIG.DND5E.skills[id]` 存在
- 120. 坑：用 `dice[0].results[0]` 取自然骰面 —— 优势时那是被丢掉的那颗
  解法：真世界 `new Roll("2d20kh1").evaluate()` 结构为 `dice[0].results = [{result:6,active:false,discarded:true},{result:15,active:true}]` ⇒ **取第一个 `discarded !== true` 的 `result`**；`CONFIG.Dice.D20Roll` 实例结构同构（另有 `isCritical` 属性可用）
- 121. 坑：`_preview.src.html` 是 CRLF 换行 ⇒ 多行 `old_string` 的 `edit` 报「old_string was not found」
  解法：**单行**改没问题；多行改动时先把改动拆成一行一行的替换
- 122. 坑：`_preview.html` 的 `actorStock()` 是从 `STOCK_PRESETS` 现算的（不存状态），「点制作扣材料」在预览里看不出变化
  解法：另加一层 `state.stockDelta`（`actorStock()` 末尾把它减掉）；切背包档位时要清零

## 【0.8.0 新增】123–129
- 123. 坑：要在物品卡/角色卡注入徽章（`Hooks.on("renderActorSheet", (app,html) => ...querySelectorAll("[data-item-id]")...)`）—— 实测打脸：用户装了 Tidy5e Sheet，`game.items.contents[0].sheet.constructor.name` = `Tidy5eItemSheetQuadrone`，原生 DOM 已被整块换掉；全文 grep `/systems/dnd5e/dnd5e.mjs`（3,007,943 字节）搜 `renderActorSheet` → **0 次命中**，该钩子在 5.3.3 根本不存在
  解法：**名字与描述是任何 sheet 模块都必然渲染的字段** —— 改数据不改 DOM（名字后缀 `荒野香草（陈旧）`、描述追加 `<p class="lhc-fresh-line">新鲜度：陈旧</p>`）。代价与对策：基准名存 `flags`、操作幂等、只在档位真变时写库、给 DM 一个「不标注」开关
- 124. 坑：幂等标注缺一件 —— 没有第一件第二次跑会把「（陈旧）」当基准名标成「（陈旧）（陈旧）」；没有第二件每 15 秒 ticker 各刷一次、一次面板打开写几百次库
  解法：`const baseName = typeof meta.baseName === "string" ? meta.baseName : stripFreshSuffix(item.name); const wantName = wrong ? baseName : `${baseName}（${fresh.label}）`; const patch = {}; if (item.name !== wantName) patch.name = wantName; if (meta.baseName !== baseName) patch[`flags.${MOD_ID}.baseName`] = baseName; if (!Object.keys(patch).length) continue;`；ticker 里的标注要节流（75 秒一次）
- 125. 坑：以为「八小时后才显示材料」= 八小时后再掷骰
  解法：`runGather` 照常在接活时把 N 次检定掷完、结果存进待收条目，**只在渲染层与播报层把 `gained` 藏起来**（`ready = Number(p.readyAt) <= producedAtNow()`）。好处：DM 手动标记完成不需重掷、世界时间暂停/快进不错乱。**藏要藏干净**：`#pendingRows()` / `#doGather()` / `postGatherCard()` 三处都要改
- 126. 坑：弹窗里再造一套成功/失败提示
  解法：「先关窗再回调」交割模式 —— `const done = this.onDone; await this.close(); if (done) await done(sellMap);`（结果与报错都由【主面板的 notice】显示）。⚠️ `onDone` 必须在 `close()` **之前**取出来
- 127. 坑：choices 兜底链少一环，界面上就露英文 id
  解法：`return [id, found ? found.label : (COIN_LABEL[id] ?? CHOICE_LABELS[id] ?? id)];`；每加一个带 choices 的设置项，先想一遍它的标签从哪来
- 128. 坑：给共享函数加随机消耗 = 悄悄改掉所有人的结果 —— `shelfFor()` 里 `shelfAgeHours(m, rng)` 会吃掉 `rng()`，常货多吃掉 N 次随机数会让整个货架组成变化
  解法：只对随机货掷年龄、常货写死 `ageHours: 0`；通用规则：往确定性随机序列里插新的一次消耗前，先确认下游有没有人依赖原序列
- 129. 坑：检查脚本覆盖不到 `lh-` 命名空间
  解法：`_check.mjs` 的收集正则是 `for (const m of js.matchAll(/class="([A-Za-z0-9_ -]*)/g))` 与 `for (const m of js.matchAll(/"\s?(lhc-[a-z0-9-]+|is-[a-z0-9-]+)"/g))` —— 覆盖 `lhc-` 与 `is-` 两个命名空间，**在 `lh-` 前缀上它是瞎的**（写成 `lh-buy-windwo` 抓不到），那个空间目前只有窗口类，改动时自己多看一眼

## 0.9.0 新增（130–141）
- 130. 坑：AppV2 里 `<select>` 走 `change` 不走 `input` —— 事件委托少绑一条的症状是「下拉点了没反应」，而且**不报错**
  解法：`<input type=search>` 走 input、`<select>` 走 change，两条都绑；`_replaceHTML` 的 `if (!content.dataset.lhcBound)` 守卫里两条一起加
- 131. 坑：`if (act && this.element.contains(act) && /^(INPUT|SELECT|TEXTAREA)$/.test(act.tagName)) return;` —— 玩家选完「采集时长」焦点留在 `<select>` 上，于是**每一轮都 return**，倒计时一动不动（用户报「必须要重新打开一次面板才会刷新」）
  解法：每秒只改 `[data-lhc-count]` 那一格的 `textContent`（不重建 DOM、不碰焦点），真到点时才整块重画；另写**秒级**的 `formatCountdown`（`formatDuration` 只到分钟）
- 132. 坑：0.8.0 只藏了面板和通知，聊天卡照发逐条成败（用户原话「侧边栏就明明白白的写了，在我投完骰子的一刻」）
  解法：**三处都要藏**（面板待收行 / 通知文案 / 聊天卡）；最稳是**拆成两张卡**：接活那一刻发「出发卡」（零结果），到点收取时发「战报卡」
- 133. 坑：堆叠合并只按 splitKey 合，会把「新鲜」和「陈旧」混成一堆、整堆按最早那件的产出时刻走 ⇒ 保质期算错
  解法：判据取三样全同 `splitKey + tier + freshnessOf().id`
- 134. 坑：以为「腐坏还没做」—— `onFoodCheck / stampFreshness / toggleStatusEffect` 全在、`fetch` 回读也确认装上了，但 `factory/food.json` **五条实体一条都没写 `perishable`** ⇒ `perishable !== true` ⇒ `producedAt` 写 null ⇒ `tracked:false` ⇒ 名字不标、腐坏不挂
  解法：先拿 node 把数据数一遍（哪个文件几条 true / false / undefined）再回头看代码；这次是 49 条 true 在 gather.json，而用户手上那件来自 food.json
- 135. 坑：一套主题只给一个 `--lhc-accent` —— 淡底主题下拿它当按钮底，白字黑字都压不住（石榴红 `#e72d48` 配白字实测 **4.31:1**）
  解法：拆三档 —— `--lhc-accent`（描边发光，图形判据 3.0）/ `--lhc-accent-ink`（当文字，4.5）/ `--lhc-accent-deep` + `--lhc-on-accent`（实心填充）；用户给的原色可以一个不改地留在描边上
- 136. 坑：对比度靠眼看
  解法：写 `_contrast.mjs`（WCAG 相对亮度 + 17 条规则 × N 套主题）—— 85 条里抓到 7 条真不达标（石榴红 4.32、炭黑 4.33、深海蓝标题渐变 4.06）；判据按用途分开：正文 4.5、描边图形 3.0、纯光晕色只查「没和底色重合」
- 137. 坑：打包源目录里出现嵌套 `module.json`（工作目录里多了一份 0.8.0 旧副本 `lh-crafting\`），`Get-ChildItem -Recurse` 全收 → zip 变成 **18 个条目，一半是旧版**；根因不是脚本 bug，是**源目录不干净**
  解法：`foreach ($f in Get-ChildItem -Recurse -File -Filter "module.json")` 找出所有非根目录的 `module.json`，把它的**父目录整枝**排除；判定后再打，条目数必须等于预期数
- 138. 坑：`edit` 工具会抹掉 `.ps1` 的 UTF-8 BOM → PS 5.1 按 GBK 读、中文注释里的引号把语法吃掉 → 报 `Missing closing '}' in statement block or type definition`
  解法：`$c = [System.IO.File]::ReadAllText($f, [System.Text.UTF8Encoding]::new($false)); [System.IO.File]::WriteAllText($f, $c, [System.Text.UTF8Encoding]::new($true))`
- 139. 坑：`data-lhc-theme-pick` 里含 `lhc-theme-pick`，被 `/\b(lhc-[a-z0-9-]+|is-[a-z-]+)\b/g` 当成类名 → 报「CSS 里没有定义」假失败
  解法：`String(src).replace(/data-lhc-[a-z0-9-]+/g, " ")` 之后再扫，两边（预览页 / 模块）都摘；另 `_check.mjs` 的主题判定改成**只把声明了 `--lhc-bg` 的块算作色板**（比硬编码排除名单更耐改）
- 140. 坑：`fetch(...).text()` 得到的是 UTF-16 **码元数**不是字节数 —— 服务端 135757「字符」对应磁盘 163839 字节，差点当成「装错版本」（中文多的文件两者能差 20%）
  解法：比对文件长度时统一口径
- 141. 坑：`game.actors.contents` **扫不到**未链接 token 的合成 actor 身上的物品（那些在 `token.delta` 里）—— 第一次只扫 world actors 得到 `itemCount: 0`，差点据此判定「他没测过」
  解法：扫「物品在谁身上」必须连未链接 token 一起扫

## 1.0.0 新增（142–150）
- 142. 坑：给区块换底色只写 `el.style.color` —— 后代里用 `var(--lhc-txt)` / `var(--lhc-dim)` 直接贴该区块底的（版本号、未选中页签、分区标题…）拿到的还是给基础底配的色，满色时实测 **1.0:1**（deepblue 的 `--lhc-txt` 压在 `#f5efea` 上）
  解法：一个区块要几层「底」就覆盖几组变量
- 143. 坑：可调底色的自动字色阈值取「看起来差不多」的 0.34 —— 亮度 0.18~0.34 段的彩色底会被判给浅色字，实测只有 **2.7:1**（用户抱怨的「字很模糊」）
  解法：用**纯黑 / 纯白** + `INK_PIVOT = 0.179`（黑白在亮度 **0.1833** 交叉，`(L+0.05)/0.05 = 1.05/(L+0.05)`；两边留余量），任何底色都 ≥4.58:1
- 144. 坑：固定 `mix(ink, 底, 0.22)` 扫出 **84 条不达标**（最差 4.08），全在中间亮度那几档
  解法：`dimInk()` 在「完全用 ink」与「最多淡到 DIM_MAX」之间**二分 12 次**，取还压得住的最大淡化量
- 145. 坑：`_contrast.mjs` 把 `INK_PIVOT` 抄了一份 —— 源码改成 0.34 时脚本照样报全过，而屏幕上是糊的
  解法：`numFromJs("INK_PIVOT")` 从 `scripts/lh-crafting.js` 正则读；**读不到就报错退出，不默默用兜底值**。反证：改 JS 常量 ⇒ 87 条不达标；还原 ⇒ 全绿
- 146. 坑：`_paint-verify.mjs` 第一版用 `PAINT_REGIONS.map(...)` 造假元素 —— 把 `.lhc-head` 故意打成 `.lhc-headx`，假 DOM 里也跟着变，**照样报全过**
  解法：类名清单要**独立写死**（就是 CSS 与真实 HTML 里的名字）；改完同一个错立刻报 2260 条。适用于任何「从配置生成期望值再拿配置去比对」的自证循环
- 147. 坑：`linear-gradient(` 里的 `gradient(` 被 `_lint.mjs` 读成「调用了 gradient()」→ 假警
  解法：lookbehind 排掉 `-`：`(?<![\w$.#-])`；**检查器报的每一条都要先判真假，别闭眼改源码去迎合它**
- 148. 坑：主题色号在 JS（`THEMES` 的 `a/b/base`）和 CSS（变量）各存一份，漂移了就是「面板是紫的、底色按红的算」，谁都看不出来
  解法：`_check.mjs` 逐个主题核对三个色号是否出现在它自己的 CSS 块里。反证：改一个 ⇒ FAIL
- 149. 坑：用 `edit` 替换「一行的开头片段」时，会把自己写的整行接上原来的行尾 —— `old_string` 取到 `| **0.9.0** | **制作检定方式可配**` 为止、`new_string` 又完整重写了一遍 ⇒ 那一行变成「我的整行 + 原行剩下的部分」，1220 字符里半截重复
  解法：替换表格行时 `old_string` 要么取完整一行、要么取到换行符；改完**读回那一行核对长度**
- 150. 坑：顶栏从 1 个控件变 4 个（主题 / 排布 / 浓度 / 文字色），品牌名被挤没
  解法：`.lhc-head` 加 `flex-wrap: wrap; row-gap: 8px`（`.lhc-brand-wrap` 本来就是 `flex: 1 1 auto; min-width: 0`）；加控件前先算一遍「最窄窗口宽度下还剩多少」

## 151–156
- 151. 坑：检查脚本正则要求「属性前 / 后是空白」→ 一轮里连报两次误报：① `\s(data-lhc-[a-z-]+)[=>\s]` 漏判「先 `const common = \`data-lhc-dm="…"\`` 再 `${common}` 插进多处模板」的写法 ② 放宽前导后仍要求后面是 `=`/`>`/空白，而 `` `… data-lhc-tone-color` + ` value=…` `` 后面紧跟**反引号**
  解法：`/(?:^|[^\w-])(data-lhc-[a-z-]+)(?=[^\w-])/g` —— 前后都不是标识符字符。⚠️ 两次都先在源码里 grep 确认属性确实被输出（如 `lh-crafting.js:4509`）再改判定，不是「改到它通过为止」
- 152. 坑：会话早期 `read` 到的是陈旧缓存 —— 拿到 1.0.0 之前的 CSS（17 个变量、1657 行），磁盘上是 **19 个变量（含 `--lhc-warn`）、1840 行 / 43,530 字节**
  解法：变量表、行号、字段名这类「会照着写代码」的东西，落笔前用 `pwsh` 直读磁盘 + mtime/字节数复核；`edit` 的 `old_string` 匹配失败时**先怀疑缓存，再怀疑自己写错**；凡「改了 A 之后 B 的行号没跟着变」都先怀疑读到旧内容
- 153. 坑：工作库（compendium pack）三条硬约束 —— ① 以为包内不能嵌套文件夹（其实可以）② `{ pack }` 传集合对象会报 `Compendium pack "[object Map]" is not a valid Compendium identifier`（内部拿它去做 `game.packs.get()`，Collection 是 Map 的子类）③ `Item.create({...}, {pack, folder: id})` 被忽略、落成 `null`
  解法：① `Folder.create({name, folder: 父id}, {pack})` 两层正常 ② `{ pack }` 必须传**字符串 id**（`pack.collection`，如 `"world.lh-crafting-data"`）③ `folder` 必须写在**数据里**：`Item.create({…, folder: id}, {pack})` ✅。另：`pack.getDocument(id)` 能拿文档、`doc.update({folder})` 能移动、`Folder.update({name})` 能改名（都已实测）
- 154. 坑：`recipe.category` 与 `recipe.check.group` 干的是同一件事（`checkRowFor` 里 `check.group ?? category`），还逼用户填英文键（用户原话「我说一个小白他搞得懂吗?」）
  解法：把「新建制作类目」做成页签栏上的一个 `+`，类目同时就是页签、就是检定规则，id 只在内部流通、界面一律只显示中文名。通用教训：两个字段语义能合并时，合并比写文档解释更省事
- 155. 坑：DM 设置页写死每一项 → 漏、忘翻译、两处说明不一样
  解法：`#dmHtml` 不写死任何一项 —— `registerSettings()` 每注册一条就往 `SETTING_META[key]` 记一份 `{name, hint, kind, choices, def}`，页面按 `DM_PAGE_GROUPS` 分组渲染。⚠️ 连 `gatherHours_*`（按素材类型循环注册）和 `tierMult_*` 这些「代码里生成」的设置也要登记，否则会从 DM 页消失
- 156. 坑：外观小窗每改一档就 `render()` 主面板 → 主窗被 `bringToTop` 拽到前面**盖住小窗**
  解法：小窗自己重画；**关窗时**（`close()` 里回调一次，用 `this.onDone = null` 保证只喊一次）再刷主面板

## ★ 1.2.0 新增铁律（157–165）
- 157. 坑：旧脚本全绿证明不了新功能 —— 注入三个真错（区域取色失效 / 区域字色失效 / 轻重不一失效）后 `_paint-verify.mjs` 的 **612 条照样全过**（它只查「背景非空 / 字色是纯黑白 / 对比度够」，不看具体色值）
  解法：新能力必须配新断言 —— 专为新能力写的 `_look-verify.mjs` 在同一副本上报出 **328 条不合格**
- 158. 坑：把「效果不掉」只写成报告里的承诺
  解法：写成「与上一版逐字节等价」的回归锁 —— `_look-verify.mjs` 里 1200 条「默认等价」逐条比对 10 主题 × 4 铺法 × 5 档浓度 × 6 区域的实际底色。代价是设计上要让默认路径与原算法**数学上相等**：默认每个区域的 `mix` **不预乘权重**（权重留给 `vary` 再乘 → `mix * weight / 100` 正好等于旧版 `t * w`）；斜贯穿那两色用**全局浓度**算；「渐变渗往哪渗」取**用得第二多的色**。独立佐证：打印的斜贯穿两色 `#3e3264` / `#475720` 与 1.0.0 记录完全相同
- 159. 坑：校验脚本里的「笔记」用 ✓ 前缀 —— 三条真错注入后笔记照样打印 `✓ 顶栏改色后 = #9f82fd`（那正是被破坏的值）
  解法：改成中性 `·`。判据：一行输出如果错了也不会让脚本退出码变 1，它就不配用 ✓
- 160. 坑：PowerShell 里用 here-string `@'...'@` 匹配文件内容 —— 换行符与文件的不一定一致（README 是 CRLF），**静默不匹配**（4 处替换里唯一那处多行的没中）
  解法：改成**逐行替换**，并且每行都打印「中了 / 没中」
- 161. 坑：事件委托用 `el.matches("[data-xxx]")` 认控件 —— 功能上没错，但 `_check.mjs` 的「输出 + 监听成对」检查判成「只输出没监听」（`data-lhc-reg-color/-mix/-ink/-inkhex` 四个全中）
  解法：用 `closest("[data-xxx]")`；**检查器看不见就等于没有**
- 162. 坑：配置读取加缓存 —— `_paint-verify.mjs` 一次跑 600 轮、每轮都改 `settings.theme/look/mixPercent`，缓存住会全渲染成同一份，**测试等于没测**（而且照样全绿）
  解法：`lookConfig()` 故意每次现读现解析（一屏 JSON 的解析开销对「每次渲染一次」可忽略）
- 163. 坑：只扫预设那几个值 —— 调色板能塞**任意**颜色后，「只扫主题自带 a/b 两色（420 条）」完全不成立
  解法：新增 1800 条扫场：10 主题 × 18 种任意色（纯黑白 + 三原色 + 三间色 + 明暗两端 + 主题实际用色）× 5 档浓度，逐条验主字与次字 ≥4.5:1
- 164. 坑：一处色号敲错就整份清空 = 把用户二十分钟的活抹了
  解法：`sanitizeLookConfig()` 对调色板、铺法、每个区域的 `c / mix / ink` **各自独立**校验与夹取；只有「版本号对不上」这种整体性失效才整份回落
- 165. 坑：删掉调色板里一个色后，用着它的区域 `rc.c` **静默指向另一个色**（不报错、不崩，只是颜色悄悄变了）
  解法：`rc.c === i` 的挪到 0，`rc.c > i` 的减 1；同类规则：删数组元素后凡是存了**下标**的地方都要跟着挪（存 id / key 就没这个问题）

## 166–172（2026-09-19，1.2.1「侧边栏都没了」事故后补）
- 166. 坑：一处 TDZ（`const KIND_LABELS` 用了后面才声明的 `const GATHER_KINDS`）让**整个模块加载不起来**（用户：「侧边栏都没了，我都打不开面板了」），而六套脚本（`node --check` + `_lint.mjs` + `_check.mjs` + `_paint-verify.mjs` + `_look-verify.mjs` + `_contrast.mjs`）**全绿** —— 它们全都只作用于文件的切片，而这是整份文件的求值顺序问题
  解法：`_load-test.mjs` 用 `vm.runInContext` 把整份 JS 真跑一遍，并**焊进 `_pack.ps1` 第 0.7 步**，跑不过就拒绝打包
- 167. 坑：以为宽松桩什么都测不出来
  解法：`_load-test.mjs` 的全局对象全用「任何属性访问都返回另一个桩」的宽松写法 —— **TDZ 与「X is not defined」是 JS 语言层面的错误，属性桩再宽松也拦不住**；它报错就是真 bug，不报错说明求值期干净。桩要的是**薄**，不是「够真实」
- 168. 坑：修完一处 TDZ 就打包（`vm` 只在**第一个**错误处停下）
  解法：修完 `scripts/lh-crafting.js:234` 后**重跑到报「全程跑完」**，才证明没有第二处同类问题
- 169. 坑：把跨版本积压的功能当「已验证」—— `KIND_LABELS` 是 1.1.0 引入的，而**用户从没部署过 1.1.0**（1.0.0 → 1.2.0 直跳）
  解法：交付说明里**明说**「这一版是 X 版功能第一次跑」，让用户有心理准备
- 170. 坑：用 `game.modules.get(id).esmodules` 判断模块有没有加载 —— 它读出 `{}` 像「没被登记」；**对照组 `mastercrafted` 也是 `{}`，而它的按钮活得好好的**
  解法：任何「读出来的值看起来不对」的字段，**先找一个已知能工作的家伙做对照**再下结论
- 171. 坑：`read` 返回过期文本 → 基于它的 `edit` 报 `old_string was not found`（`read` 显示 `GATHER_KIND_MAP = new Map(GATHER_KINDS.map(k => [k.id, k.label]))`，磁盘上是 `[k.id, k]`）
  解法：匹配失败时**不要怀疑 edit 工具，先重读**；重读仍不一致就用 pwsh 直读磁盘复核。反过来也成立：差点把一个不存在的 bug 当 bug 去修
- 172. 坑：分不清模块「完全没加载」和「加载到一半崩了」
  解法：指纹是「早期的全局变量有值、后期的没有」—— `window.__LH_CRAFT_VER`（第 121 行）= `"1.2.0"` ✅，`window.LHCraft`（第 5946 行）= `undefined` ❌，`Hooks.once("init")`（第 5905 行）没生效 ⇒ 设置注册数 **0**。先读两个相隔很远的全局变量一眼区分

## 1.3.0 新增（173–180）
- 173. 坑：抠代码做验证器时区间取太宽（`const COIN_VALUE` → 币值显示结尾），把模块自己的 `readSettingStr` / `consumeItems` / `stacksNamed` 也带进来 —— 函数声明会**盖掉沙箱里的桩**，后果极隐蔽（真货 `consumeItems` 拿空 `stacks` 返回 false，`spendCopper` 永远失败，看起来像「业务逻辑不对」）
  解法：区间边界卡在桩函数之前；加 `LHC_SHOW_BLOCK=1` 自检，把抠出来的行数与头尾打出来、逐个报「桩被盖掉了？」
- 174. 坑：「计划」类函数对外给**差值** —— 大票换零会让某些面额变多（1 金币 → 10 银 → 10 铜），`purse[k] - wallet[k]` 算出**负的硬币数**（实测 `cp: -5`）
  解法：对外口径一律「**做完之后你手上剩多少**」（`plan.purse`），执行侧直接落库、不再减第二次
- 175. 坑：`ok:false` 却带着 `items:{gp:1}` 这种试探性扣款，调用方拿它显示「会扣这些」就是错的
  解法：专设 `failedPlan()`：`items` / `purse` 全部归零或还原成执行前的值
- 176. 坑：沙箱里抛异常让它冒泡 → 整个跑中断、**后面的失败全被埋掉**，看起来像「只有一个问题」
  解法：宿主侧 try/catch，输出 `✗ 沙箱里抛异常` + 确切报错行 + 「先修断言，让它用 ck() 报红而不是抛异常」
- 177. 坑：PowerShell 会把【单元素嵌套数组】展平 —— `Inject $d @(@('a','b','c'))` ⇒ `$pairs` 变 3 个字符串 ⇒ `$i[0]` 退化成**单字符**，`.Replace('c','o')` 把全文的 `c` 全换成 `o` 毁了源文件（而且 `Contains` 还返回 true，不报错）
  解法：用数组变量，`$pairs = @( @(a,b,c) )` 之后再 `foreach`
- 178. 坑：`formatCopper` 用在「你一共有多少钱」上 —— 它会把金额按面额拆开、再给被替代的面额贴上替代物的名字（300 铜币被折成 3 金币、显示成「3 龙鳞」）
  解法：`formatCopperRaw` 才是「只按硬币面额写」；凡是「身上有多少」的地方一律用它
- 179. 坑：拿浏览器环境的两个坑 —— ① `getComputedStyle(el)` 的**索引遍历拿不到自定义属性** ② `document.fonts.check("16px 家族名")` **对「没声明过的家族」也返回 true**
  解法：① 要读 `--*` 必须遍历 `document.styleSheets` → `cssRules` → 逐条 `rule.style[i]`，**而且必须递归** `@layer` / `@media`（`rule.cssRules`），否则得到「整个页面只有 12 个自定义属性」的假结论（实测：不递归 12 个、递归后 **459 个**）② 只有返回 **false** 的才可靠；判断字体是否真可用用 `document.fonts.forEach(f => f.status === "loaded")`
- 180. 坑：依赖外部字体 CDN —— gacha-banner `@import` 了 41 个 Google 字体，用户浏览器里**全部 `unloaded`**（`Abril Fatface` / `Cinzel` / `Rajdhani` / `Orbitron` / `Bebas Neue` / `Playfair Display` 全 false）
  解法：用户机器上真正 `loaded` 的 23 个家族里**没有任何中文字形**，可用拉丁 display 字体是 `Modesto Condensed` / `Oswald` / `Teko` / `Cal Sans` / `Roboto Condensed` ⇒ 中文展陈感只能靠系统字体栈 + 字号 + `font-weight:900` + `letter-spacing` + `skewX` + 高饱和色块

## 181–184 · 事件委托与版本号（1.3.1 事故）
- 181. 坑：`<button>` 只发 click、永远不发 change —— 把按钮的分支写进 change/input 处理器 = 那段代码永远进不去；而语法对、类名对、属性也确实被输出，静态检查全绿，只有用户点下去没反应
  解法：新工具 `_handlers.mjs` 把每个 `data-lhc-*` 的【渲染标签】与【处理它的事件】对照判定，焊进 `_pack.ps1` 的 0.8 步（跑不过就 throw，拒绝打包）
- 182. 坑：检查器把含 `data-lhc-X` 的行一律当成处理点 → `#currencyHtml()`（渲染方）被报成处理器，**45 项全误报**
  解法：渲染点 = 该行里属性前面有 HTML 标签；处理点 = 该行有 `closest/hit/matches("...")`。修正后 58 个属性只报 1 项 —— 而那一项就是真 bug。**误报率本身就是检查器质量的指标**
- 183. 坑：版本号替换一锅端 —— 1.3.0 → 1.3.1 时 `module.json` / `MOD_VER` / CSS 头注释共 3 处要改，而正文里 6 处「1.3.0 做过什么」的注释是历史、必须原样留着
  解法：Bump 脚本要断言锚点「恰好出现 1 次」，多于 1 次就跳过并报出来
- 184. 坑：改了 `.ps1` 没验 BOM → `Missing closing '}' in statement block or type definition`
  解法：`[System.IO.File]::WriteAllText($f, $c, [System.Text.UTF8Encoding]::new($true))`

## 185–193 · 外观重做 / 商店模块化 / 检查器的检查器（1.4.0）
- 185. 坑：「字不清晰 / 不好看」靠感觉
  解法：先量化 —— 实测【阶梯全落在 10–19px、11px/12px 占大头，且整个 CSS 的 font-family 声明数为 0】（中文靠核心给的 `Signika, "Palatino Linotype", sans-serif` 一路 fallback）
- 186. 坑：折叠区用 `<details>` —— `toggle` 事件不冒泡，且每次重渲染 `innerHTML` 都会重建元素，展开状态被打回关闭
  解法：用「实例上的状态位 + `<button>` + 已有的 click 委托」（同条适用于任何「渲染后被重建、却有内部状态」的原生控件）
- 187. 坑：检查器的词法器自己判断歪了，后果不是报错而是**后面的真实代码没被扫到**（假阴性）—— `esc()` 里 `.replace(/"/g, …)` 那个 `"` 被当成字符串开头，自此 7004 行里有 **3935 行（56%）** 边界全错，而脚本一直报「全过」
  解法：判据要挑一个「抹干净就必然消失」的记号（这里用 `/*`），还剩着就 exit 1；收紧正则前导集时 `}` 与 `)` **不要收**（`${due} / ` 这种除法才是常态）
- 188. 坑：按函数名抠代码直接找第一个 `{` 再配平 —— `function shelfFor(a, b = [], opts = {})` 默认值里就有 `{}`，只抠到 61 个字符
  解法：顺序必须是 找 `(` → 配平到 `)` → 再找函数体 `{` → 配平到 `}`
- 189. 坑：断言口径比声称的那件事宽 —— 声称「上了架的货不变」却拿整个 zone 对象去比，而 `{...zone}` 会把新增的 `items` 键**原样回显**，报出两条假失败
  解法：把断言写宽和写松一样有害，都会让人不再信任红灯
- 190. 坑：照抄上一层的键名 —— 商店这一层是 `name` / `img` / `desc`，分区那一层是 `label` / `icon`，写错不报错、只在页签上显示空白
  解法：照抄结构前先读一眼**真实出厂 JSON**
- 191. 坑：以为「换世界要能带走」可以靠世界设置或世界包 —— 两者**都绑世界**（包数据在 `worlds/<id>/packs/`）
  解法：真正的搬运手段只有导出 / 导入；选世界设置的理由是「同步读取、秒开」
- 192. 坑：1.3.0 与 1.3.1 两版都发过，README 更新日志里**一条都没有**
  解法：发版前对着 `module.json` 的版本号核一遍 README 的更新日志（grep `1\.3\.`）
- 193. 坑：验证器写完不演练
  解法：注入三个真错（去掉单独几率 / 去掉钉的常货 / 去掉跨种类池），报出 **7 条红**、精确指到每个注入点

## 194–200（1.5.0 新增）
- 194. 坑：「功能明明有了，用户说没有」被当成没做 —— 用户要的「每个区域自由选字色」和「调色板新建/删除颜色」**两件都是 1.2.0 就做好的**，只是 1.4.0 被他抱怨「太复杂」时收进了一条折叠条，而折叠条外面那行字没写清里面有什么
  解法：动手前把自己的控件在界面上的**路径**走一遍（在哪个页签 → 要不要先展开 → 要不要先把某个下拉切到某个值）；处置是**把最常用的那一件搬出来常显**（区域颜色框不再等下拉选到「指定色」），不是重写
- 195. 坑：设置项「注册」不等于「生效」—— `enableFood` / `enablePotion` / `enableScroll` / `enableMagicItem` / `enableForge` / `enableHarvest` 六个开关在 7003 行里只出现 7 次（6 次在 `SETTINGS` 注册、1 次在 DM 页分组清单），**没有任何一行读过它们**，从 1.0.0 到 1.4.0 一直是装饰品
  解法：`grep -c "<设置键名>"`，把「注册处 + 元数据处」减掉，剩下的才是真正用它的人；**剩 0 个就是没接线**
- 196. 坑：改 `GATHER_KINDS` 里 `fiber` 的 `label`（纤维 → 绳麻织物）后，世界里那份文件夹还叫「纤维」—— `ensureFolderPath` 找不到新名字会**新建一个**，旧文件夹连里面的东西一起留在原地，用户看到的是「东西丢了」
  解法：加 `FOLDER_RENAMES = { "纤维": "绳麻织物" }`，在 `Folder.create` **之前**先按老名字在**同一个父下面**找一遍，找到就 `update({ name })` 改名复用（幂等、不新建、不删任何东西）
- 197. 坑：先写完渲染/绑定、再补方法 —— 写了 `this.#onInput.bind(this)` 但 `#onInput` / `#onDrop` 还没加进类里 ⇒ `SyntaxError: Private field '#onInput' must be declared in an enclosing class`
  解法：每次批量改动后**立刻** `node --check`，不要攒到最后
- 198. 坑：用户说「玩家的订货，是预订货物」就去找「订货|预订」改文案 —— 全库 grep **0 命中**，预订系统根本还没做
  解法：先 grep 一遍 A 到底存不存在；**用户描述的是他的心智模型，不是代码现状**，两者不一致时先查代码再回报事实
- 199. 坑：竖排列表装不下（用户原话「商店编辑里，货物越来越多，竖排不行，点击常备货物，然后出个表，可以搜索的，大表，然后再加一个拖入框」）
  解法：① 分区卡上只留 `常备货物 (N)` 一行 ② 大表用**同一个 `data-lhc-*` 属性名与同样的 `${zi}|${ii}` 编码**复用原有处理器 ③ 已加入的行「就地」带上它自己的开关 ④ 拖入框要能收**不在工作库里的东西**（`fromUuid` → 没有 `splitKey` 就 `importItemIntoLibrary` 先收进来再重读 catalog）
- 200. 坑：「回归预设」会清空 `hiddenThemes` 并重置当前配色，一触即发
  解法：两步式确认 —— 第一下点把底栏按钮换成「确定回归 / 先不」，第二下才真动；状态存实例字段 `this.confirmReset`（重渲染不回弹）；**不用 `Dialog` / `DialogV2`**（零依赖、跨 v13/v14 稳定、与手写渲染风格一致）

## 201–204
- 201. 坑：`ApplicationV2` 原型链上有**只有 getter 没有 setter** 的属性（实测 `form`），子类构造器写 `this.form = { … }` 当场抛 `TypeError: Cannot set property form of #<ApplicationV2> which has only a getter` —— `new` 直接失败，而 `new` 在 async 事件处理器里 ⇒ 没人接的 promise ⇒ **界面上表现为「这个按钮点了完全没反应」，连控制台警告都没有**
  解法：① 子类状态一律用不与核心撞名的字段名（`draft` / `cycleVer`）② 拿不到核心只读属性全表时不要猜 —— 写 `coreReadonlyNames()` 在**运行时**枚举原型链（`Object.getOwnPropertyDescriptor` 判 `d.get && !d.set`）再读自己源码找 `this.<名字> =` 比对 ③ **所有委托事件处理器包一层 `safeHandler`**：同步抛错当场接住、async 抛错挂 `catch`，一律 `console.error` + `ui.notifications.error`
- 202. 坑：静态检查全绿 ≠ 这段代码跑过 —— 1.5.0「新建配方点了没反应」的 `LHRecipeDialog` **从来没被 `new` 过一次**（1.1.0 加的，用户从没部署过 1.1.0）；`node --check` 只看语法、`_lint.mjs` 只查「调用了但没定义」、`_check.mjs` 只查 JSON/版本/类名/花括号、`_load-test.mjs` 只把整份文件**求值**一遍、`_paint/_look/_shop/_skin-verify` 只抠引擎切片
  解法：① 每次新增 UI 类 / 新按钮，**必须有一次真的把它点开**（真机或至少 `new` 一次）② `_load-test.mjs` 加「把所有 `class X extends ApplicationV2` 都 try { new } 一次」（**截至 1.5.1 尚未做，记为待办**）③ 「用户从没部署过的版本」= 那批代码**从未运行过**，跨版本发版前先列出「这一步到下一步之间新增的东西」逐条确认
- 203. 坑：复杂文本变换用 PowerShell 写连续炸两次 —— ① `$(subexpression) is missing the closing ')'`（JS 模板串 `${...}` 与 PS 的 `$(...)` / `${...}` 打架，且 `pwsh -Command "<整段脚本>"` 多一层转义）② `$h.Split($oldRe).Count` **恒不等于 1**（PS 的 `String.Split(字符串)` 绑定到 `Split(char[])`，按字符逐个切）
  解法：① 凡是「多处替换 + 插入 + 断言计数」的改造，写成一次性 `.mjs` 用 `node` 跑（Node 里 `String.split(字符串)` 是普通子串切分，`split/join` 还能避开 `String.replace` 的 `$&` 展开坑）② 每处替换断言「命中恰好 1 次」，不命中就 throw、不写盘 ③ PS 只在跑 `_pack.ps1` 这类必须用它的地方用
- 204. 坑：功能藏在折叠条里 = 没做 —— 同一天连栽两次（「给字体加每个目标可以自由选择颜色的」、「外观调色那里…新建新的颜色和删除」都是 1.2.0 就做完的）；共同点是 1.4.0 用户说「外观太复杂」后我把控件收进了一条默认收起的折叠条（`this.fold = false`，`scripts/lh-crafting.js:5960`），1.5.0 只把色块改成常显、**没把折叠条打开**
  解法：① 用户报「没有 X」时**第一动作是搜代码确认 X 到底有没有**（直接照做会做出两套并存的重复功能）② 确认「有」后按可发现性解：提到外面常驻 / 让折叠条默认展开 / **不要**只是「在里面再显眼一点」 ③ 「太复杂了」和「找不到」是一对矛盾 —— 压控件数量时必须给出**通往被藏起来的东西的路径**（折叠条文案写清「这里面是什么」，而不是「高级设置」）

## 1.7.0 新增（205–210）
- 205. 坑：破坏性演练写了「复制 → 注入 → 跑检查」，检查器却读相对路径、而给 shell 的 cwd 是真目录 ⇒ 读的是真源码 ⇒ **47 条全绿，注入的错一个都没抓到**
  解法：跑演练的检查器之前先打印一条「源文件：<绝对路径>」并肉眼确认它在演练目录里，或让演练脚本自己断言 cwd
- 206. 坑：行为变更后老断言还成立吗 —— 1.7.0 的自动兜底**有意**改 `shelfFor` 的行为，而老断言声称「老路径没被动过」，两者不可能同时为真
  解法：把桩做成**可开关**（`setStapleAuto`），老断言在「关」的状态下跑、新行为另开一节在「开」的状态下跑；**别去改老断言的期望值迁就新行为**（那等于把「回归检测」改成「变更确认」）
- 207. 坑：口头声称「新逻辑不消耗随机数、不影响其他东西」
  解法：给它一个**恒等于不生效**的参数取值（这里 max = 0），再比较两次货架是否**逐字节相同**
- 208. 坑：自动生成的常货从池子里随机挑 → 玩家每开一次面板货架就变一次
  解法：按 `splitKey` 升序取（跨渲染、跨重索引都稳定）；**任何「每个区自动分配 N 个」的逻辑都要有确定序**
- 209. 坑：「常货得放在前面」→ 查代码发现 `#shopZoneHtml` 本来就先渲染常货，真原因是**那一区压根没有常货**
  解法：**先读用户世界里的真实配置数据，再读代码** —— 数据能一秒区分「没实现 / 没配置 / 没渲染」
- 210. 坑：`_doc170.mjs` 里 markdown 的 `` `code` `` 与 JS 模板串定界符是同一个字符 ⇒ `SyntaxError: Unexpected identifier`，整个脚本没跑、文档一个字都没写进去
  解法：先把内容 write 成独立 `.md`，再用脚本 append 那个文件（不要内联长文本）

## 十二 · 1.9.0 新增铁律（211–217）
- 211. 坑：给点击白名单删属性名时手滑留了个逗号 —— `closest("[A],[B],[C],", + "[D],[E]…")` 是**完全合法的 JS**（`closest(str1, NaN)` 多传一个参数、`closest` 忽略它），`node --check` 过、`_load-test.mjs` 过，**但白名单从第三段起整段失效** ⇒ `zone-add` / `zone-del` / `zone-kind` / `item-del` / `zone-items` / `pick-add` / `pick-close` 全变死按钮
  解法：唯一暴露它的是 `_gate-audit.mjs` 输出从「LHShopDialog 有总闸」变成「**LHShopDialog 没有总闸式点击入口（逐个 closest 写的），跳过：26 个属性**」⇒ 看到某个类从「有总闸」变成「nogate」，第一动作是去数那条 `+` 链有没有被劈开
- 212. 坑：`if (wholeZone || readSettingBool("stapleAuto", true))` 里两个条件是**两件事**，整段 `if` 删掉 = 把「整区常货」一起删没
  解法：撤功能前把 `if` 里每个条件单独过一遍「它属于被撤的那件事吗」；撤完**必须跑那个功能自己的断言**（本次 `_shop-verify.mjs` 的「整区常货：池子里的 common 全上架」当场报红才发现）
- 213. 坑：撤掉功能就把断言删掉
  解法：改成反向断言 `ck("撤掉自动兜底：池子里的 common 不会自己变成常货", …)` —— 删断言 ≠ 删行为，没有断言看着的功能随时会被下一次重构悄悄加回来
- 214. 坑：`#pickerHtml` 的分节、`#shopHtml` 的搜索写在类方法里 ⇒ 类方法抠不进 vm ⇒ 只能靠肉眼
  解法：提成模块级纯函数 `splitByStaple(choices, zoneItems, kw)` 与 `shopSearchZones(shelf, kw)`，`_craft-verify.mjs` 的 45 条行为断言一次写完
- 215. 坑：`src.indexOf(\`function ${name}(\`)` 会落在 `async ` 之后，抠出来的片段带 `await` 却没 `async` ⇒ `SyntaxError: await is only valid in async functions and the top level bodies of modules`
  解法：往左探 6 个字符看是不是 `async `，是就从那里切
- 216. 坑：「没在搜」与「没搜到」都返回 `[]`，调用方分不出该渲染哪一种
  解法：`shopSearchZones()` 空搜索词返回 `null`（= 照常按分区浏览）、搜不到返回 `[]`（= 界面说「没有这件东西」）；这类「空值有两种含义」一律用 `null` 与 `[]` 区分
- 217. 坑：断言报红就改代码 —— `_craft-verify.mjs` 报「一个词命中两个分区时两区都返回」，回读发现假货架里 z2 的 splitKey 是 `o.a`、**根本不包含 `m.`**，是期望写错
  解法：报红第一动作是**回读断言的事实依据**（与「反向验证」是一对：注入真错必须报红；报红也必须真的是代码错）

## 218–225（1.10.0 这轮）
- 218. 坑：`node --check` 报的行号是下游症状 —— 报 `第 5818 行 Private field '#commit' must be declared in an enclosing class`，真因是 5825 行 `const all = this.#choices();` 重复声明；私有字段名是**另一个解析阶段**检查的，所以先被报出来
  解法：一次改多处又报看不懂的错时**不要顺着报错查**，给补丁脚本加「只跑某一处」的开关（`ONLY=名字 node _fix.mjs`）逐个二分
- 219. 坑：替换区间从半途开始 —— 想换 `#pickerHtml` 主体、起点取 `const { added, staples, others } = …`，而它上面紧挨 `const all = this.#choices();`，替换块里也写了这行 ⇒ 重复声明
  解法：定区间前先**往上多看两行**，确认锚点之上没有属于同一块的语句
- 220. 坑：注释里出现被断言盯着的字面量（引用旧代码 `` `producedAt <= 0` ``、引用旧文案「已按当前世界时间重排货架」、引用 `this.form = {}`）⇒ 三条「不许再出现」的断言全部误报
  解法：任何被检查器当字面量扫的东西，注释里也别写
- 221. 坑：要求区间终点唯一 —— 会被正常的重复行误判成歧义（`+ \`</span>\`` 在同一文件出现几十次）
  解法：端锚不要求唯一，用「起点之后的第一个命中」就够
- 222. 坑：二分排障时拿的「批次A后基线」其实是上一轮已被写坏的版本 ⇒ 六个 `ONLY=` 全报 FAIL
  解法：基线一律从版本存档重建，重建完立刻 `node --check` 一次
- 223. 坑：给补丁脚本加 `ONLY` 后，全量断言（「`data-lhc-item-move` 至少要出现 3 次」）把单点运行全部拦下，看起来像「改坏了」
  解法：单点运行跳过全局断言，只跑「锚点命中恰好一次 + 写前形状检查」
- 224. 坑：撤掉控件只看第二个渲染点 —— `data-lhc-item-staple` 有两个渲染点（live 的 `#pickerHtml` 和早已不再被调用的 `#itemRowHtml`），只删 live 那处会保留它的 change 处理器
  解法：只删 live 那处、**保留 change 处理器**，`_handlers.mjs` 才不会把剩下那处报成「没有处理器」；数出现次数时记得**属性名字面量**（`data-lhc-x`）与 **dataset 驼峰访问**（`el.dataset.lhcX`）是两个不同字符串
- 225. 坑：「按钮什么都没干」被当小问题 —— 「刷新货架」的实现是 `render({force:true})` + 弹一句「已按当前世界时间重排货架」，用户点了很多次、每次都看到让他以为生效了的提示
  解法：界面上任何一句「已经做了 X」的提示，都要能指出**哪一行真的做了 X**；指不出来就是假话，必须删掉或补上真实现

## 226–238
- 226. 坑：`SETTINGS` 数组末尾漏逗号 —— `["..."]["neverRot", "...", false]` 被 JS 读成**成员访问**（方括号里是逗号表达式、值是 `false`），整个表达式算出 `undefined`。**语法完全合法**，`node --check` 绿灯、`_load-test` 也不报；然后 `for (const [k,...] of SETTINGS)` 解构 `undefined` 当场抛 TypeError，而外面包着 try/catch ⇒ **只在 console 里留一行 warn**，`registerSettings()` 后面注册的每项**全都没了**
  解法：给这种「一批同类配置」的循环加形状守卫（不是合法数组就 `console.error` + `continue`），并写一个**真的调用它**的脚本（见 227）
- 227. 坑：静态检查全绿 ≠ 这个函数跑过（202 的第二次实证）—— 1.2.0 是 TDZ、1.11.0 是下标取值，两次都 `node --check` ✅ `_load-test` ✅ `_lint` ✅ `_check` ✅ 四个闸门全绿而模块坏得彻底；根因一模一样：**这四个脚本没有一个会去【调用】出问题的那个函数**
  解法：只要一个函数是「注册 / 初始化 / 建对象」这类**只跑一次但决定全局**的，就必须有一个脚本在 Node 里真调它一次
- 228. 坑：砂箱 PRELUDE 里写 `var __warn = () => {};` 占位 —— `function warn(...a) { __warn(...a); }` 转发到一个**空函数**，被测代码里 `try { ... } catch (err) { warn("...", err); }` 吞掉的报错**一条都收不到**（报告写着「warn 0 条」）
  解法：**转发函数只转发，不占坑**；失败时把砂箱里的 warn / log **全量吐出来**
- 229. 坑：`_settings-verify.mjs` 第一版只做 `globalThis.__SETTINGS = SETTINGS;` ⇒ 报告「实际注册 0 个」（`registerSettings` 是函数声明，不求值就不执行）
  解法：抠代码做行为验证时，**声明 + 调用**是一对，少一个就是空跑
- 230. 坑：闸门自己会变瞎 —— `head = block.slice(at, at + 600)` 只取 `#onClick(` 之后 600 字符找 closest 白名单，白名单随版本越加越长（1.6.0 补 3 个、1.10.0 又补 2 个），拼接到第 6 行已超 600 ⇒ 那张闸**一个字都没改**却被判成「没有总闸」、整张名单跳过不审，报告照样打印「通过」
  解法：① 别用「猜个长度」的窗口，用结构边界（取到第一个分号为止）② 闸门要能区分「查过了、没毛病」和「压根没查」③ 结果里打印「扫了几个类、其中几个真的被审了」
- 231. 坑：用户说「点不动 / 存不进去」时读一千行源码
  解法：先看 console 里有没有 `"lh-crafting.shopConfig" is not a registered game setting`（一句就把范围缩到「设置注册链断了」）；配套取证遍历 `game.settings.settings`，把 `namespace === MOD_ID` 的 key 全列出来，再拿「代码里读到的 key」对一遍
- 232. 坑：出厂图标会过期 —— 同一台服务器上 `icons/consumables/meat/fish-fillet-steak-brown.webp`：0.4.0 实测 **200**、1.11.0 实测 **404**
  解法：① 每次发版前把出厂 JSON 里所有图标路径 fetch 一遍（本版 89 个里 1 个 404）② 改出厂 JSON 只管新装，**已经建进世界的那份不会变** ⇒ 配启动自愈表（`DEAD_ICONS` + `repairDeadIcons()`）③ 往自愈表加条目前**先在线 fetch 验新路径是 200**
- 233. 坑：补丁脚本把 `<button …>` 开标签接到三元分支 else 时写成 `: + \`<button type="button" …\`` —— **一元 `+` 作用在模板字符串上**得 `NaN`，整段开标签变成文字 `NaN title="…">换成…</button>` 渲染出来，**按钮根本没生成**；`node --check` ✅ `_load-test` ✅ `_lint` ✅ `_check` ✅ 四个闸门全绿
  解法：专门的笔误闸门 `_typo-verify.mjs`（已焊进 `_pack.ps1` 第 1.2 步），`const RE = /(?:\?|:)\s*\+\s*[`"']/;`；⚠️ 不要扩成「扫所有 `+ "`」。派生教训：往续行链中间插 `+ …` 时要回头确认上下文（三元分支、数组元素、参数列表前缀不同）
- 234. 坑：同一个模板串在多个类里重复 —— 给 `LHRecipeDialog._replaceHTML` 加行的锚点**命中 3 次**（三个二级窗的 `_replaceHTML` 长得一模一样）
  解法：锚点带上那个类独有的东西（这里是上一行 `content.dataset.lhcRcpBound = "1";`）；通用规则：凡是锚点落在 `_replaceHTML` / `_renderHTML` / `#onClick` / `#onChange` 里的，一律带那个类的 marker 名（`lhcRcpBound` / `lhcShopBound` / `lhcClaimBound` / `lhcLookBound` …）
- 235. 坑：锚点从「中间那一行」开始 —— 材料页换新顶栏时锚点从计数那行开始，**它上面还有两行原有的搜索框**没进锚点 ⇒ 页面上**上下叠着两个一模一样的搜索框**
  解法：替换一段块时锚点**从这一块的真正第一行开始**；判据：替换完**数一遍同类元素的出现次数**（本版补了「`data-lhc-mat-search` 应该只出现 3 次：1 处渲染 + 2 处处理」）
- 236. 坑：`module.json` 写 `lang:"zh-CN"` 而线上 `game.i18n.lang === "cn"` ⇒ **语言文件从来没被加载过**（从 0.1.0 潜伏了 11 个版本）
  解法：源码依据（Foundry 13.351 `/scripts/foundry.mjs`）`#filterLanguagePaths(pkg, lang) { ... if ( l.lang !== lang ) return arr; ... }` —— **严格相等**，没有前缀匹配、没有别名；验法一行 `game.i18n.localize("你的模块的某个键")`（返回原样 key = 没加载）；⚠️ 别拿「key 与值同名的文件」去验（`mastercrafted` 的 `cn.json` 只有一个键且键值都叫 `mastercrafted`）。对策：`languages` 里把可能的语言代码**都列上**（`cn` + `zh-CN` + `en`），多条指向同一文件不会重复加载
- 237. 坑：README 用整整一节教 DM「双击 `_preview.html` 就能预览」，而 `_pack.ps1` 的 `Test-Skip` 对任何以 `_` 开头的路径段直接跳过 ⇒ **那个文件根本不在发布包里**
  解法：README 凡提到具体文件的段落，写完回头对一遍 `_pack.ps1` 的排除规则（`_` 开头的路径段 + `*.zip`）；开发用的东西要么别写进 README，要么**标题里就写明「只有仓库里有」**
- 238. 坑：危险操作的一致性 —— 删配方/删材料/回归预设是两步式，而**删掉这家店**（一点即写世界设置）、**删掉这个分区**（16px 的 `×`，紧挨「整区常货」勾选框）、**从分区移出一件货**、**删自建类目**、**「从 zip 还原」**（直接弹文件框且会覆盖世界设置、界面一个字都没提）、**「把材料在配方里统一换掉」**（批量改写多张配方、不给条数、不确认）全都没有
  解法：二次确认是一致性问题 —— 只要有一类操作有，用户就会默认「都会问」，没问的就会被误触；本版先修了最危险的文案（zip 还原会覆盖什么），**其余确认流程留作下一版**（已在明细里列出）

## 1.13.2 新增铁律（250–253）
- 250. 坑：给 `paymentPlan` 加长锚点躲「命中 2 次」时，`oldS` 顺带包含了上一行 `const active = SKIN_DENOMS.filter(d => skins[d]);`，`newS` 里没写回来 ⇒ 那行被静默删掉；`node --check` 全绿，只有 `_skin-verify` 报 `active is not defined at paymentPlan (evalmachine.<anonymous>:108:19)`
  解法：整段替换的锚点里出现的每一行都必须在 `newS` 里写回；补丁脚本一律「命中次数必须正好 1 + 全程改内存 + `writeFileSync` 放最后」，报错就 throw
- 251. 坑：切片验证器报 `ReferenceError: warn is not defined at Object.sanitizeShop (evalmachine.<anonymous>:268:5)` —— 模块里 `warn()` 是真的，是沙箱没有
  解法：判据是「报错名字是不是模块自己的顶层函数/常量」—— 是 ⇒ 在 PRELUDE 里补桩；不是 ⇒ 可能真是代码错。别急着改业务代码迁就桩
- 252. 坑：加长锚点躲「命中多次」时 `oldS` 会连带吃掉更多行（`const need = Math.max(0, Math.round(Number(amount) || 0));` 在文件里出现 2 次）
  解法：加长锚点是对的，但要检查多出来的那个是不是同一个函数，并对照 250 处理连带行
- 253. 坑：只断言「新的对」不够 —— 如果那行代码从来没被执行到，新旧都得到同一个值，断言全绿而 bug 还在
  解法：修复类断言要配反证，且反证必须断言「老代码确实会错」—— 把老代码的 `Number()` 强转照抄一份写回沙箱，断言它必须给出 `tracked: true`（实测 `{"oldBoolTracked":true,"oldStrTracked":true}`）
- 250–253 原文重复：该块（含标题 `## 1.13.2 新增铁律`）在原文中**完整出现两次**，内容逐字相同

## 254–262
- 254. 坑：到货卡片里写 `freshnessOf({ perishable, producedAt })`，而真身是 `function freshnessOf(flags) { const meta = flags?.[MOD_ID] ?? {}; if (meta.perishable !== true) return null; }` ⇒ 传顶层字段等于传空对象，**静默 return null**，徽章永远不出现也不报错
  解法：凡是名字里带 `flags` 的函数，先读它的**第一行**看它从哪一层取值；做完顺手搜一遍全文件（`freshnessOf(` / 任何读 flags 的函数），确认每处调用都包了 `[MOD_ID]`
- 255. 坑：`return Math.max(1, Math.round(n * orderDepositPct() / 100));` —— `Math.max(1, …)` 把 DM 显式设的 0 抬成 1（0% 也收 1 铜）
  解法：`Math.max(1, …)` 的正当用途只有一个：防「有值但被四舍五入成 0」；正确写法是先把 0 那一支提前 return 掉：`const pct = orderDepositPct(); if (pct <= 0) return 0; return Math.max(1, Math.round(n * pct / 100));`。推广：凡有「比率/倍率/百分比」参数，都要分开问「参数是 0 时该怎样」和「算出来是 0 但参数不为 0 时该怎样」
- 256. 坑：`_apply.mjs` 的块格式里 OLD 文本自带一个结尾换行，所以 OLD 最后一行必须是**完整源码行**；反例 `@@@OLD 外观-侧板标题单独成块 / <div class="lhc-section">进 行 中</div> / @@@NEW` —— 源码那行是 `` return `<div class="lhc-side"><div class="lhc-section">进 行 中</div>` ``，`</div>` 后紧跟**反引号**不是换行 ⇒ 命中 0 次
  解法：把整行（连行首缩进和行尾那个反引号）抄进 OLD；判据：OLD 最后一行看起来「截断在半句」就是错的
- 257. 坑：续行注释对齐差一个空格 = not found —— 源码里续行是 **7** 个空格（对齐到 `/*` 的下一格），我写了 **8** 个 ⇒ 命中 0 次
  解法：定位手法 `const at = src.indexOf("某个一定出现在附近的锚点"); const real = src.slice(at - 4, at - 4 + oldS.length); let i = 0; while (i < oldS.length && oldS[i] === real[i]) i++; console.log(JSON.stringify(oldS.slice(i - 60, i + 60))); console.log(JSON.stringify(real.slice(i - 60, i + 60)));`
- 258. 坑：断言报红分不清「代码错」还是「期望错」
  解法：判据 —— 先问「我这条期望值是从需求推出来的，还是从我对代码的印象推出来的？」需求推出来的 ⇒ 改代码；印象推出来的 ⇒ 先把那个函数每一行读一遍再决定
- 259. 坑：给新的「钱 / 物品 / 权限」逻辑只靠一次性人眼审查（下一次谁再动这行代码，没有任何东西会叫）
  解法：配**永久闸门** `_order-verify.mjs`（抠进 vm 真跑 24 条，焊进 `_pack.ps1` 第 1.4 步，跑不过就 throw 不落盘）；断言里放**一条语义等式**（「定金 50% + 到货全价 100% = 加价后单价的 150%」），能挡住「每个函数都对、组合起来错」
- 260. 坑：扩 `PAINT_REGIONS` 时动了前几条的 color 与 weight
  解法：`_paint-verify.mjs` 与 `_look-verify.mjs` 把 `const W = { head: 1.00, nav: 0.80, list: 0.42, detail: 0.72, side: 0.55, notice: 0.28 }` 写死成常量 ⇒ 往数组**末尾追加**是安全的；新区域一律追加，`color` 用 1/2、`weight` 挑一个不与旧值重复的数
- 261. 坑：容器与子元素都要上色时顺序反了 —— `paintTheme` 按数组顺序逐条 `querySelectorAll` + 写内联样式，容器会把子块刚上的色整片盖掉
  解法：容器必须排在前面（`.lhc-list` 在前、`.lhc-tabs`（在 `.lhc-list` 里面）在后）
- 262. 坑：往 flex 容器里塞新块被当成**新的一列** —— `#orderHtml()` 挂在 `.lhc-body`（`display:flex`，子元素 `.lhc-list` 固定 268px / `.lhc-detail` / `.lhc-side`）下就成了第 4 列，被挤在右边占一大条（用户说「占据了一大半的商店页面」）
  解法：新块要放进某页时，先看那一页根节点是不是 `display:flex` / `grid`；是的话要么进**已存在的那个可滚动内容列**，要么自己显式 `flex: 1 1 100%`

## 263–269
- 263. 坑：把布尔语义（统一 / 不统一）塞进一个数值字段，靠 `0` 这个哨兵值表达，而 `0` 直觉上同时像「不换货」和「不停刷」——用户两个猜测都不是答案
  解法：判据 —— 如果一个设置项的用法**需要超过一句话解释**，或它的「特殊值」有任何歧义，那就是设计错了，改成**显式开关 + 数值**两个控件。**DM 一眼看不懂的设置，等于没做**
- 264. 坑：改默认值以为会影响已存值 —— 存储值优先于默认值 ⇒ 改默认值不会动已存的值，但会让「新世界」与「老世界」行为分叉（1.14.2 把 `shopRefreshHours` 默认 24 → 0：旧世界存着 24 ⇒ 仍走「统一 24」、用户看不到任何变化，而新世界走「每间店自己来」）
  解法：改默认值那一版必须**同时写出「旧世界会读到什么」的实测推断**，并写成闸门断言（见 `_cycle-verify.mjs` 的「★ 用户的现行世界」那一条）；1.14.3 加开关默认 true ⇒ 旧世界未设读到 true ⇒ 统一 24 ⇒ 与他升级前逐字节一致
- 265. 坑：只写「新算法应该输出 X」是自证（把新算法写成恒等函数它照样过）
  解法：`_cycle-verify.mjs` 里把**老算法原样写回来**跑同一组输入 —— 开关关掉时**新老结果必须不同**（新 72h / 老 24h）、开关未设时**新老结果必须相同**。**一条断言只有在「它能对着旧代码报红」时才有意义**
- 266. 坑：`README.md` 是 **CRLF**，多行锚点按 LF 写 ⇒ 命中 0 次（1.14.0 栽过、1.14.3 又栽）
  解法：改 README 的脚本第一行就写 `const cr = s => s.split("\n").join("\r\n")`，所有多行锚点与插入内容一律过 `cr()`；`_pack.ps1` 同理
- 267. 坑：期望由被测数据算出来的断言 = 自证 —— `_paint-verify.mjs` 对「自带底色」的块用 `theme[ownVar]` 当对比度参照，而引擎拿的也是同一个值 ⇒ 把 `charcoal.panel` 从 `#1a1a1d` 改成 `#3b3b3b`，**22 道闸门全绿**
  解法：这类「两边各存一份、必须一致」的常量（JS 的 panel/sunken vs CSS 的 `--lhc-panel`/`--lhc-sunken`）断言必须去核【另一份】；已补进 `_check.mjs` 的成对相等核对
- 268. 坑：破坏性演练注入 C 之前没把 B 改回去 ⇒ 测出来的红全是 B 的，C 到底有没有被抓住**从输出里分不出来**
  解法：每个注入前 `copyFileSync` 还原原始文件，或在同一个文件里改回原样再注入下一处
- 269. 坑：用户说「拖入功能没有了」—— 材料窗里写着「拖不进这扇窗 —— 直接在下面填名字与图标路径」，用户读到这句、试了、失败。**功能从来没做过，但界面自己写了「做不到」**，这比没写更糟
  解法：加能力时优先补上「界面已经承诺过的」那些，而不是另开新功能

## 1.14.5 新立铁律（270–274）
- 270. 坑：同一个 `data` 属性被两处写、含义还不一样 —— `data-lhc-count` 一处写绝对时刻、一处写时长，计时器只按一种读 ⇒ 另一种每帧都算成负数 ⇒ 每秒重画
  解法：任何被 JS 读的 data 属性，先 grep 出所有写入点确认口径一致；写一个值时顺手在属性名里带上单位/语义（`data-lhc-until` vs `data-lhc-remain`）比写注释管用
- 271. 坑：「设定值当开关用」（填 0 = 关）
  解法：延续 263 —— 凡是靠一个数字的边界值表达「另一个模式」的，用户必踩；改成显式开关 + 数值
- 272. 坑：抄隔壁类的构造器时参数名不对 —— `LHLookDialog` 是 `ctx`、别的几个窗是 `opts` ⇒ `opts is not defined`，而 `node --check` 不报（运行时才炸）、`_lint` 也不报（`opts` 在别的类里确实存在）
  解法：**只有「把每个窗 `new` 一次并真跑 `_renderHTML`」的闸门能抓到**；抄构造器时参数名当场核对
- 273. 坑：删掉一个 UI 元素却没删它的事件分支
  解法：同一次改动里一起删 —— `_check.mjs` 的「监听了但没有元素输出」会红（那条检查本来是为死按钮设计的，反过来正好也抓「删了界面忘了删处理器」）
- 274. 坑：只改用户世界、不改出厂数据 —— 删掉用户世界里的产出物后，如果 `factory/craft-extra.json` 里还留着，下一次 `LHCraft.setup()` / `syncFactoryToWorld()` 会把它们**原样建回来**
  解法：改工作库内容的操作，一律**先改出厂文件，再改世界**

## 275–283
- 275. 坑：「渲染得出来」的闸门抓不到「点得下去」（1.6.0 三个死按钮 / 1.14.5 `opts is not defined` / 1.14.2 白名单多一个逗号全是**渲染 100% 正常、交互 100% 坏**）
  解法：必须有一道闸门去「点」—— 抠出每个挂在 `<button>/<a>` 上的 `data-*`，合成事件，调真实注册的处理器，看抛不抛错
- 276. 坑：把 94 个点击打在同一份实例上 ⇒ 状态互相污染（「卖东西」第一次点开了、第二次点没变化），被误判成「点了没反应」
  解法：每一次点击都要从全新实例起
- 277. 坑：跨 realm 的 instanceof 会失效 —— vm 沙箱里的 `Map` 不是 Node 的 `Map`，`v instanceof Map` 返回 false ⇒ `JSON.stringify(new Map())` 得到 `"{}"`，所有靠 Map 存的状态变化全部看不见
  解法：判内建类型用**鸭子类型**（`typeof v.size === "number" && typeof v.get === "function"`）
- 278. 坑：抽查属性的正则写死 `data-lhc-` —— `data-lhcb-` 是另一个命名空间，购买窗那 4 个按钮**对三道闸门同时隐形**
  解法：用 `data-lhc[a-z]*-`；并且**先把命名空间枚举出来再写正则**（一行 PowerShell 就能枚举）
- 279. 坑：桩没照构造器真实参数个数喂 —— `LHBuyDialog` 是 `(row, zone, ctx)`，只喂两个 ⇒ `ctx = {}` ⇒ `this.actor = null` ⇒ 渲染成「这件货已经不在货架上了」空态，**闸门一路绿灯但整个窗没验过**
  解法：加窗进闸门前先数构造器的参数个数
- 280. 坑：报错内容显示成 `{}` —— vm 沙箱里 `new Error` 不是 Node 的 `Error`，`x instanceof Error` 为假 ⇒ 落到 `JSON.stringify(x)`，而 Error 的 message/stack **不可枚举** ⇒ 输出 `{}`
  解法：改成鸭子类型 `x && typeof x.message === "string"`（277 的另一种表现）
- 281. 坑：桩不像真货，绿色就是假的 —— `pack.index` 真货是 `Collection`（Map 子类）桩写成普通对象 ⇒ `[...index.values()]` 假报错；`pack.folders` 同理；`getDocument()` 返回 Document 有 `toObject()`；`JSZip` 有 `file()`
  解法：建桩时照真货的构造器与方法来（`Object.getPrototypeOf(x)` 看一眼）；补真之后三条假警全消失
- 282. 坑：只判「抛没抛」的驱动器漏掉一整类 bug —— `pack.folders.length` → `undefined` → `Math.max(0, NaN)` → **NaN**，全程不抛错，语法/命名/契约/求值/点击五层全绿，而界面上会显示「新建了 NaN 个」
  解法：驱动器除了判异常还要**判值**：凡是参与算术的结果，非有限就是问题；更根本的是这类「类型事实」只能从真世界读 ⇒ 补一道拿真值清单扫源码的闸门 `_coll-verify.mjs`
- 283. 坑：「标着没动」就交付 —— 用户原话「为啥标着没动，还要我再导入30版？」
  解法：把没查清的东西列在交付说明里交给用户 = 把排查成本推给他；**要么查完，要么事先问清楚再做** —— 中间态不许出包

## 284–292（1.14.8 · 三方审查这一轮）
- 284. 坑：闸门传常量 ≠ 覆盖 —— `_sell-verify` 一直传写死的 50/65，而「从设置读出来的 0」从没进过流水线 ⇒ 回收比例恒按 1 铜结算这个 bug 它一条都抓不到
  解法：凡是从设置读的值，闸门也必须从设置读
- 285. 坑：`Number(null) === 0` —— 「没设过」的哨兵不能用 null 又同时 `Number()` 它
  解法：要么显式判 null，要么用 undefined / NaN
- 286. 坑：`Number("") === 0` —— 写着「留空 = 用兜底」的输入框，兜底参数永远走不到
  解法：空串必须先判掉
- 287. 坑：前缀规则压组件宽度 —— `.lh-craft-window .lhc-input{width:100%}` 是 (0,2,0)，压掉 `.lhc-zn-num{width:66px}` (0,1,0)；本模块同族控件作者用了四种手法绕它（加前缀 / !important / flex 兜底 / 加类），**漏一个就满宽**
  解法：同族控件逐个核对是否都绕过了前缀规则
- 288. 坑：绝对定位宿主漏写 position ⇒ 同类按钮全叠在一处 —— `.lhc-lk-x` 的祖先四层一个 position 都没有 ⇒ 包含块冒到窗口根，N 个 × 全在同一个角，只有 DOM 最后一个点得到
  解法：绝对定位元素的祖先链必须有 position（作者其余 9 处同类模式都写对了）
- 289. 坑：循环里 await 发东西没包 try，且清队列放在可能抛错之后 —— `claimPending` 里 giveItemFromPack 一抛，setPending 就跑不到 ⇒ 点一次重发一批、这一单永远消不掉
  解法：循环里 await 必须包 try，且清队列要放在必达处
- 290. 坑：只写不读的字段是坏味道 —— `plan.overpay` 全文件只有赋值没有读取，多付的钱就是凭空消失的
  解法：加字段的同时要有读它的人
- 291. 坑：把审查报告当判决 —— 三个代理共报 33 条、自己剔除 10+ 条虚报，核实为真的 15 条全部修掉
  解法：线索也要逐条回源码核；演练必须证明新闸门真的会红（本次 2/2 + 3/3 + 3/3）—— **一次注入没红，先怀疑注入选错了**（本轮真发生过：改 aurora 的 CSS 而闸门读的是 JS 表）
- 292. 坑：在 JS 模板串里写 markdown 的反引号（第四次踩）—— `_doc148.mjs` 里 `` `.lhc-zn-pct` `` 直接把模板串截断，报 `ReferenceError: zn is not defined`
  解法：先 write 成独立 `.md`，再 `appendFileSync`

## 293–300（1.14.9：中英双语 + 清死代码）
- 293. 坑：新常量放错位置 —— 把语言标签表放在 `LOOK_LABELS` 那儿（逻辑上挨着「扁平化标签表」），但那落在三个配色验证器的**切片之外**，而它们要 `Object.assign(CHOICE_LABELS, …)` ⇒ 桩里没有 `CHOICE_LABELS` ⇒ **求值就炸**
  解法：新常量要放在「它最近的同类常量旁边」—— 挪到 `CHOICE_LABELS` 定义正下方立刻全绿。**接线位置本身就是约束**
- 294. 坑：属性正则用 `\b` 会让 `data-lhc-title="…"` 也命中（`-` 不是词字符）—— 内部属性被当界面文案翻掉，等于悄悄改逻辑
  解法：`\b(title|placeholder|alt)=` 要改成要求属性名前必须是空白字符
- 295. 坑：匹配里包含的分隔符替换时没写回 —— 改成 `/(\s)(title|…)="([^"]*)"/` 后忘了把捕获到的空白拼回输出 ⇒ `<div title="材料">` 渲染成 `<divtitle="Material">`，**整段标签粘坏、界面直接崩**
  解法：i18n 行为闸门里断言不能只查「还有没有中文」，要查**标签结构还在不在**
- 296. 坑：多语言改造影响母语
  解法：`tr()` 的第一句是 `if (uiLang() !== "en") return s;` —— 母语路径与改造前**逐字节一致**；配套两条：查不到回落原文（**永不显示 key**）、词表为空时全部原样
- 297. 坑：拿不在词表里的句子去测 —— 用 `还差 2 种材料。`（词表里根本没这句）⇒ 闸门报红，**是期望错不是代码错**
  解法：从词表里挑一条**真实带数字**的键，把数字换成同段数的其它数字，再断言仍整句翻掉、且新数字出现在译文里
- 298. 坑：`cr()`（LF→CRLF）反复套用 —— 对一段**已经是 CRLF** 的文本再调一次 ⇒ `\r\r\n`，Markdown 多出一个空行（这次一口气插进去 6 处）
  解法：要么只在确定是 LF 的文本上用它，要么统一走一次
- 299. 坑：删死代码误删
  解法：判据保守到不会误删 —— CSS：选择器的**全部**逗号分段都以死类名开头才整条删；死类名 = 在 JS 与预览页里**一次都没出现**且不是动态拼接（`lhc-theme-<id>` 这类要排除）；删完必须跑全链闸门（60 条规则 / 379 行删掉后 26 道全绿才算数）；删之前**先备份**，备份路径写进脚本输出里
- 300. 坑：「翻译覆盖率」拿兜底当交付 —— 889 条覆盖的是**渲染收割到的那批状态**（六个页签 + 十个二级窗 + 每个按钮点一遍），只在罕见状态下出现的句子（材料不够、钱不够的提示）**不在表里**，英文模式下会原样显示中文
  解法：如实说边界（这不是 bug、是刻意的兜底），并把词表路径指给用户（`lang/strings-en.json` 是纯 JSON，谁都能补）

## 301–308（1.14.9 三方审查那一轮）
- 301. 坑：补丁整段替换 `claimPending` 时删掉了 `sellQty` 的声明 ⇒ 玩家点【收取】100% 抛 `ReferenceError: sellQty is not defined`、待收队列永久卡死（`setPending` 在抛错点后面）；三道闸门一个都没拦住（`node --check` 只看语法、`_lint.mjs` 只查「函数调用有没有定义」、`_load-test` 只把整份文件求值一遍）
  解法：新建 `_undef-verify.mjs` —— 抹掉注释/字符串/模板/正则后用上下文栈扫，收「声明位」与「读取位」，读取位里有、声明位与全局白名单里都没有的 = 报错；演练：删掉 `const sellQty = …` ⇒ 精确报出 `scripts/lh-crafting.js:3914 sellQty` 并贴出那一行
- 302. 坑：第一版报 14 条**全是误报**：4 条来自正则字面量（`return /food/.test(…)`）、10 条来自**类成员名**（`static DEFAULT_OPTIONS =` / `method() {` / `get maxQty() {`）
  解法：声明位宁可收宽、读取位宁可收窄 —— 正则判据要 `trimEnd()`（12 字符窗口末尾常带空格，不 trim 匹配不上 `return$`）；类成员正则 `(?:^|\n)[ \t]*(?:static\s+)?(?:async\s+)?(?:(?:get|set)\s+)?#?NAME\s*[=(]` 全部当声明。**要先把误报压到 0，再看它报什么**
- 303. 坑：加了「中英混排闸门」后 `_i18n-verify` 的「长句片段替换生效」报红 —— 那是**期望过期**（我故意改的契约）不是 bug
  解法：改成测新契约，并补一条「整串命中仍然照翻」
- 304. 坑：`orderUnitCopper` 改成调 `orderMarkupPct` 后两个验证器直接 `ReferenceError` —— 它们的切片里没有新函数
  解法：**把新函数加进 grab 列表抓真货**，不是写个同逻辑的桩（写桩就变自证，见 267）
- 305. 坑：`_fix149v.mjs` 整个脚本因为模板串里出现反引号而语法错、**一个字都没跑**（第 5 次）
  解法：凡是要生成含反引号的代码，一律用 `[].join("\n")` 拼，或写进独立 `.txt` 交给 `_apply.mjs`
- 306. 坑：编辑块文件时多留了一个 `@@@NEW`，正文被劈成两半、还往源码里写进了一行字面量 `@@@NEW`；`_apply.mjs` 的断言只查「旧文本命中 1 次」查不出这个
  解法：加结构自检 —— 每块必须有**且只有一个** `@@@NEW`、并以 `@@@END` 收尾；工程纪律：**改块文件前先备份源码**（这次靠 `_版本存档` 的快照还原）
- 307. 坑：审查报告不知该信多少 —— 破坏性测试那份每条都带 vm 复现脚本与实测输出（`N1` 小数被 `Math.floor` 截断、`N3` `buyback` 的 `""`/`false`/`[]` 被算成 0%、`N4` `|| 150` 吞掉 0）全部核实为真；UI 那份自己剔除了 13 条虚报（含它自己检查器造成的 451 条假「button 嵌套」）；逻辑那份把 `sellQty` 连**根因补丁脚本**都挖出来了
  解法：判据 —— **报告里有没有「可复现的实测输出」**；有就优先按它查，没有的先自己复现再动手
- 308. 坑：短词条参与短语替换会误伤
  解法：词表里长度 < 2 的键会被 `buildEnIndex` 过滤掉（不进合并正则）⇒ 补单字词条（`改`/`删`/`位`/`倍`…）是安全的，只在「整串命中」那一支生效；**两字以上的词条会参与短语替换**，补进去前先想它会不会出现在别的句子里

## 309–314
- 309. 坑：`defaultLookConfig()` 返回 `{v, palette, regions, look}` **没有 `pageRegions`**，而写入路径是 `cfg.pageRegions[page] = {...}` ⇒ **全新安装**（从没存过 `lookConfig`）里第一次拖滑条就 `TypeError: Cannot set properties of undefined`；**既有环境永远测不到**
  解法：给配置对象加新键时，默认值构造函数与写入路径都要过一遍 —— 先问「这个键在最干净的输入里存在吗」，再问「写入时我是下标赋值还是整体替换」
- 310. 坑：给稳定系统加新维度时改底层函数签名（让 `regionSolid(cfg, r, theme, pageId)` 自己查覆盖）⇒ 那几千条断言全要重写，而且一定会漏
  解法：**在读取层做合并** —— `lookConfig(pageId)` 把覆盖并进 `regions` 再返回，底下的 `regionSolid` / `regionInk` / `paintTheme` 一行都不用动，而「不传 pageId 时结果与老版一字不差」这条不变式一立，`_paint-verify` 612 + `_look-verify` 3037 条既有断言全部继续有效
- 311. 坑：作用域改动只改读（`lookConfig(page)`）—— 界面**看起来生效**，但改动被写进全局那份 ⇒ 「调完这一页，别的页也跟着变了」，且下次打开还看着是对的，极难自查
  解法：读的点和写的点必须一起改；自查句：**这个值最终落在哪个键上？**
- 312. 坑：以为会话驱动器能判算法 —— `_ui-verify` 的会话驱动器只保证「渲染得出来、点下去不抛错」，「点了也对、就是算错」（覆盖没合并、去重没生效、dc 解析错）它**一律看不见**
  解法：新算法要另配**抠源码进 vm 的行为验证器**（`_r2-verify.mjs`），断言直接对着函数返回值写，不经过界面
- 313. 坑：`_ui-verify` 的 DIALOGS 是**手写清单**（不是扫类名自动发现），新加 `class LHXxxDialog` 忘了登记 ⇒ 它等于**一次都没被渲染过**，而闸门照样全绿
  解法：`grep -c 'class LH.* extends foundry.applications.api.ApplicationV2' scripts/lh-crafting.js` 与 DIALOGS 的条数对得上
- 314. 坑：新加的中文串**不会**让任何静态检查报错
  解法：英文模式端到端是唯一能发现「忘了配英文」的闸门 —— 把语种真掰成 en 再渲染一遍，才看见「英文模式下还剩 12.4% 中文」（加了 75 条词表后才降到 0）；配套 `LH_EN_SHOW=1` 时把**全部**残余片段打出来（原来只打前 15 条）

## 315–327（注意：315–319 的编号在原文中各出现两次、内容不同）
- 315. 坑：审查报告当判决（第 N 次实战）—— 三方两批共 50 条（代码工程师 10 + 新接手 DM 40），逐条回源码核实：为真并已修 **20 条**、已被并行改动修掉 **2 条**（代理读到的已是新版）、伪问题 **4 条**（最危险的一条是「`data-lhc-mat-remap-go` 是死代码」—— 它**不是**，删了就会重演 1.6.0 的死按钮事故）
  解法：**凡是「删代码 / 删属性 / 删分支」的建议，动手前必须 grep 一次渲染点**（代理看的是它读到的那个切片，不是全文件）
- 315（原文第二个同号条目）. 坑：可选链挡不住「未声明」—— `canvas?.tokens?.placeables` 在 `canvas` **压根没声明**时照样抛 `ReferenceError`；Foundry 里 `canvas` 是全局但 GM 客户端未初始化时可以是 undefined（这时可选链有效），而沙箱验证环境里它是彻底未声明 ⇒ 抛
  解法：`const cv = (typeof canvas === "undefined") ? null : canvas;`；判据：凡是访问 Foundry 全局（canvas / ui / game / CONFIG）里的**深层**对象，先 `typeof` 一次
- 316. 坑：自己的契约变了闸门会红（1.14.12 把出厂环境的 `skill` 从 `"sur"` 改成 `""`（未锁定 = 跟随采集页），`_r2-verify` 的 ⑩ 条立刻报红，因为它断言的是旧契约）
  解法：判据 —— 我改这个行为有明确的用户需求支撑（「鉴定技能不一定是这四个」），而断言是从旧实现反推出来的 ⇒ **期望过期**，改断言，同时**补 4 条新断言**（⑧b/⑧c/⑧d 覆盖兜底链的三条分支）
- 316（原文第二个同号条目）. 坑：改 lang 文件前没看清是「扁平点号键」还是「嵌套对象」—— 本模块 `lang/zh-CN.json` / `lang/en.json` 用扁平点号键（`"lh-crafting.settings.gatherDC.hint": "..."`），按嵌套路径写会凭空多出一个 `"lh-crafting": {...}` 顶层对象，而 **Foundry 两种读法都认、所以不报错**，但同一句话从此有两个来源
  解法：改前先 `Object.keys(o).filter(k => !k.includes('.'))` 看一眼；改后拿上一版快照对**键集合**（不是值）
- 317. 坑：修 A 的时候顺手加 B —— 给 `applyPreset` 补 `def.pageRegions = cur.pageRegions` 时自作主张又加了 `def.palette = cur.palette`，`_look-verify` 立即报 `套用预设：调色板该重置成 frost 那三个色，实得 ["#000000","#ff0000","#00ff00","#0000ff"]`
  解法：**套用预设的定义就是「换成这套配色的三个基准色」**，把调色板留住 = 「换配色方案」看着没反应；建议本身之外的改动哪怕动机合理也要单独验一次，被闸门否决时先读懂它在说什么
- 317（原文第二个同号条目）. 坑：用户说「某个按钮不存在」—— 文案 `已经到货 —— 点右边【购买】…` 只看时间（`left <= 0`），而【购买】按钮要 `orderStock` 里真有这一件（`arrived`）才渲染
  解法：**同一段界面里，文案的判据与控件的判据必须是同一个**，否则界面会指着一个不存在的东西
- 318. 坑：README 承诺的能力在界面上不存在 —— README 写「采集环境可以改**名字、图标**、技能、DC」，而环境设置窗里**没有图标栏**（`icon` 只存在于数据层），新 DM 会逐行找图标栏、找不到就怀疑装错版本
  解法：写文档列控件清单时**照着渲染函数数一遍**；做不到的就别写，或写明「只能在数据里改」
- 318（原文第二个同号条目）. 坑：「东西还在背包里却做不了」—— 腐坏材料仍被算作可用是**静默错值**（数量对、界面说够、扣料也真扣，只是扣错了那几堆）
  解法：修时必须**三处一起改**：① 判定（`recipeAvailability`）② 扣除（`consumeBySplitKey`）③ 文案（卡面说「已坏」）；只改判定会出现「按钮灰着但不知道为什么」，只改扣除会出现「材料没了还说没扣成」
- 319. 坑：同一个功能的两条提示用两份手写数据 ⇒ 必然打架 —— 「区块外观设置」的**引导提示**手写了 10 个块名，**失败提示**却是 `PAINT_REGIONS.map(r => r.label)` 动态生成（22 个）⇒ 用户想改「货格」，看引导提示里没有 → 判定做不到
  解法：同一份事实只留一个来源 —— 引导提示也改成 map 生成
- 319（原文第二个同号条目）. 坑：提醒语的判据与它提醒的动作判据不一致
  解法：同 317 —— 写任何「点 X 去做 Y」的提示前，先回到 Y 的渲染/可用条件上抄一遍
- 320. 坑：只写不读的参数是坏味道（第二次）—— `LHPickerDialog` 的 `allowEmpty` 从 1.14.0 起就存在、两处调用传 `false`、**全文件没有任何一行读它** ⇒ 材料页「换」窗里一样都没挑就点「确定」→ 静默关窗、什么都没发生，用户唯一感受是「按钮坏了」，**没有任何日志、没有任何报错**
  解法：参数写下去就要有读它的人；死参数比没有参数更坏
- 321. 坑：静默失败最贵的形态 —— 点了没反应且没有日志（报错至少能 grep，静默失败只能靠人一个个点）
  解法：把不可用的动作直接画成不可用 —— 空选时把「确定」置 `disabled` 并在旁边写「先在下面挑一样，再点确定」；**能靠 `disabled` + 一行说明表达的约束，不要靠回调里的守卫去兜**
- 322. 坑：以为「照文档做会踩空」不算 bug —— README 说有「图标」栏（没有）、空池提示让你去找一颗不存在的按钮、倒计时按游戏内时间却一个字没写；它们全都不抛错，但会让第一次用的人停在原地
  解法：交付前自问「一个没读过我代码的人，照 README 走一遍，会在哪一步停下来问『这是不是坏了』」；修一条通常只是一句话
- 323. 坑：改行为之前没看哪几条断言写的是旧契约 —— 把 `regionInk()` 从「强制色无条件生效」改成「全局那一档不达标就兜底」，`_paint-verify` 22 条红、`_look-verify` 4 条红
  解法：先分清是代码错还是期望过期（读断言喂的是什么，发现喂的是**全局** `textTone="custom"` ⇒ 正好是有意改掉的那条 ⇒ 期望过期，按新契约改写）；⚠️ 改写不能只放松一边 —— `_paint-verify` 那条改成**双向断言**（达标就必须原样压；不达标必须换掉且换出来的也达标）
- 324. 坑：「全局档」与「逐块档」混为一谈 —— 同一个 `forcedInk` 背后有两个来源：全局那一档（`textTone`）是用户设的「整体基调」，不达标时替他挑一个合理；区域行里那一档是他指着这一块选的，覆盖会让他困惑
  解法：兜底只能动全局那一档。★ 坑：区域行选「自定义色」时颜色值存在**全局** `textCustom` 里 ⇒ `own` 是空字符串，只看 `own` 会把这一档误判成「全局」；判据要看**区域那一行的 `ink` 还是不是 `auto`**
- 325. 坑：探针自己的假警报比漏报更贵 —— 一次刷出 13 条「被裁掉」+ 57 条「被盖住」+ 49 条「字号太小」，前两批**全是噪声**，真问题（「开始采集」被盖住）差点被淹掉。三处根因：①「被裁掉」判据写成 `overflowX !== "visible"`（把 `auto/scroll` 也算上了，可滚动区里超出本来就正常）②「被盖住」没判「中心点在不在面板矩形内」③ 字号与对比度共用一个打印分支
  解法：探针是给人看的 —— 宁可多分一栏「正常但值得知道」，也不要把噪声混进问题表
- 326. 坑：「大小写差一位」的 dataset 键 = 点了没反应而所有闸门全绿 —— `data-lhc-sh-delgo="1"` 的 dataset 键是 `lhcShDelgo`（小写 g），源码写成 `D.lhcShDelGo`（大写 G）⇒ 恒 `undefined` ⇒ 分支永远进不去；`node --check` / `_lint.mjs` / `_load-test.mjs` / `_handlers.mjs` / `_gate-audit.mjs` **五道闸门一条都看不见**
  解法：新增 `_dataset-audit.mjs` —— 把「渲染的 data- 属性名」按浏览器规则换算成驼峰，与「读 dataset 时写的名字」逐字对，**差大小写 = FAIL，压根没有该属性 = WARN**（两档不能合成一档，也不能用白名单放行，那是 fail-open）；自检三件：属性数 < 20 / 读取点 < 20 就 exit 1、拿 4 条线上实测样本验换算函数、反向断言「旧名字确实不在换算表里」
- 327. 坑：同一个元素被两个源写时文案不逐字相同 —— 初次渲染写 `12:01:27`，每秒走字写 `剩余 12:01:27` ⇒ 1 秒后文本长 3 个字符 ⇒ **三枚胶囊从一行挤成三行**
  解法：两边必须用同一个字符串表达式（本例直接让初次渲染也带「剩余」，并核对第三个同族渲染点本来就一致）。排查手法：**用户截图里两句话差的那几个字，就是根因**

## 328–338
- 328. 坑：默认值站在错误的一边 —— `recipeVisibleTo(recipe, opts = {})` 里 `userId` 默认 `game.user.id`、`isGM` 默认 `false`，两个同源参数默认口径相反 ⇒ **任何漏传 `isGM` 的调用点都会把 GM 关在门外**，症状是「权限少给了」，静默、不报错
  解法：默认值要跟「这件事在没人指定时最该干什么」一致；不确定就取当前上下文（`game.user`），不要写死一个方向
- 329. 坑：演练没红 —— case2 注入把兜底退回旧写法闸门却全绿，因为 `canCraftRecipe` 内部还有「名单里是数组就放行」「免费就放行」两条捷径，测试数据正好从捷径走了出去（第二次栽在同一件事上，第一次是 1.14.2 注入类型选错）
  解法：**改法不是放松断言，而是补一组只能走那条被判据的数据**（不在名单 + 要花钱 + 没学过），并配一条**对照组**证明函数不是恒返回 true；推论：**每条断言都要问一句「哪种数据能让它变红」**
- 330. 坑：两个参数同源却不同源兜底 —— `opts.isGM` 与 `opts.userId` 描述的是同一件事（谁在看），却一个默认当前值、一个默认 false
  解法：以后加同类参数**要么都从 `opts` 取、要么都从上下文兜**，不许一半一半
- 331. 坑：纯逻辑函数是闸门盲区 —— `recipeVisibleTo` / `canCraftRecipe` 这类函数「渲染得出来、点得下去、不抛异常」，`_ui-verify` 永远判不了它们，语法/名字/求值三道关更不碰
  解法：凡是「决定了什么东西显示给谁」的纯函数，都要有专门的行为闸门，不能因为「UI 上看得见」就以为验过了
- 332. 坑：「桩不像真货」会替被测代码打掩护（第三次栽）—— `_skin-verify.mjs` 的 `stacksNamed` 桩永远回 `stacks: []`，而 `consumeItems` 是恒真的假货，两者合起来正好把「三个面额各配不同替代物时，第一个扣成功、第二个失败不回滚」这个真 bug 掩饰了 **3 个版本**
  解法：桩要能表达被测代码**依赖的不变量**（这里是「堆里有几件」），不能只求「不抛错」；判据：桩里出现 `[]` / `{}` / `0` 这类空值，先问一句「真货这时候会是什么」
- 333. 坑：抠函数时「一行」是脆的 —— `src.slice(flagAt, src.indexOf("\n", flagAt))` 抠 `flagOn`（当时确实是单行），函数改成多行后抠出来是半个，沙箱直接 `Unexpected end of input`
  解法：抠函数一律**按大括号配平抠整段**，并对配平结果加断言（`fDepth !== 0` 就 exit 1）
- 334. 坑：被测函数新增依赖时验证器的切片区间没跟着扩 —— `orderUnitCopper` 改用 `coinUnitOf` 后两个验具都报 `ReferenceError: coinUnitOf is not defined`
  解法：**不要写桩**（那会让「改用统一的币值函数」这个修复本身失去验证意义），用同一套 `grab()` 把真货一起抓进来
- 335. 坑：抄锚点抄错一个字 = 命中 0 次 —— 「一电子币」抄成「一电币」（`_apply.mjs` 的「不命中就不写盘」救了场）
  解法：定位法是 `IndexOf` 找到头 60 字符的位置，然后**逐字符找第一个不同处，打印左右各 70 字符**
- 336. 坑：「出厂默认值」改不动老世界 —— `game.settings.register` 的 `default` **只在世界从未存过该键时生效**；把三个总开关从 `false` 改成 `true`，对已经存过 `false` 的世界**一个字都不变**
  解法：改默认值时必须同时回答「老世界怎么办？」—— 要么加一次性迁移并请示用户，要么在 README 里写清「要自己去打开」
- 337. 坑：定稿版还想动钱链上的显示口径 —— 清点窗「单价逐件取整 / 合计一次性取整」差 1 铜，修它要同时改三处金额计算，而三处都在付款路径上
  解法：**知道怎么修 ≠ 现在该修** —— 把「改动半径」和「收益」放在一起掂量，并把这个判断明确写进交付说明，而不是默默跳过
- 338. 坑：审查报告统一「修 / 不修」—— 这一轮 43 条
  解法：分三档处置 —— **已修 38**（逐条回源码核实过）、**部分修 1**（socket 归属只做到能做的部分，并把彻底修法记进待办）、**未动 4**（每条都写明理由与风险）；真正的价值在于**每一条都有一个明确的处置理由**，尤其是「知道怎么修但选择不动」的那几条

## 339–343（原文重复两套，内容不同）
- 339. 坑：`COIN_LABEL.ep` 自己编了「电子币」，用户问「电子币到底是什么，我们没有这个货币呀」—— `ep` = electrum piece，规则书正式译名是**「银金币」**（《拉尼卡公会长指南》宝藏篇「银金币Electrum」）；线上实测 `CONFIG.DND5E.currencies.ep = { label: "EP", abbreviation: "ep", conversion: 2 }`，`game.i18n.localize("DND5E.CurrencyEP")` 也只返回 `"EP"` ⇒ **系统自己没给中文名**
  解法：凡是要给「系统没提供名字的东西」起中文名时，**先去 `00_规则资料\5E 不全书-纯文本\` grep 一次**；查不到就照英文原样（EP），**绝不自己编一个「看着像」的词**
- 339（原文第二个同号条目）. 坑：把审查报告当判决（第三次实践）—— 两轮三方审查共报 55 条，有 **1 条**在本批补丁之前就已经修掉了（「配方钱材料两边口径不一致」，上一批 F4a/F4b 已统一成 `Math.max(1, Math.floor(Number(x) || 1))`）
  解法：**照抄报告去改，会把已经对的代码改错，而且浪费一整轮** —— 每条都先回源码确认
- 340. 坑：`_check.mjs` 的「类名都有 CSS 定义」用 `/class="([A-Za-z0-9_ -]*)/g` 扫**整个 JS 文件**（含注释），1.15.1 在新钩子注释里写了核心骨架标签名 ⇒ 被当成「JS 用了的类名」报红
  解法：① 写注释时避免写出完整的 `class="xxx"` 字面量 ② 确实是外部的（核心 / FontAwesome）就登记进 `EXTERNAL` 白名单**并注明来源**
- 340（原文第二个同号条目）. 坑：fail-closed 的判据写太宽 —— 第一版「`cats` 或 `recipes` 不是对象就是坏」，于是 `{}`（两个键都没写）与 `[]`（老版本可能存过）也被判成坏 ⇒ **一升级就把所有玩家锁在门外**，而 DM 自己看得见、完全不知道出了事，比原来的 fail-open 更难排查
  解法：只有「写过这个键、但类型不对」才算坏 —— `hasOwnProperty` 判写没写过，没写过一律当「没设过」；**任何 fail-closed 守卫都要问：哪些「本来正常的空值」会被它误伤？**
- 341. 坑：中继失败只 `warn` 然后 `return true` (`addShopSold` 的玩家端分支) —— 「记了日志」不等于「如实回报」，调用方把「库存其实没减」当成了成功
  解法：失败路径必须让调用方能区分；判断法：问一句「调用方拿到这个返回值之后，能分辨出这两种结局吗」
- 341（原文第二个同号条目）. 坑：守卫范围与语义不对齐 —— `runGather` 的 `cellDC > 0` 把「这一格**没设过** dc」（`Number(null) === 0`）与「这一格**明确设成 0**（不检定）」合并了
  解法：必须分成两个问题 —— **「设过吗」**（`!== null && !== undefined`）与**「值是不是 0」**；同一模式在 `dcValue` / `sanitizeCellCheck` / `sanitizeSkinMap` 里都出现过，改一处要顺手看同族
- 342. 坑：socket 的 `shop-sold` 分支只校验「发送者至少拥有一个角色」—— 挡得住旁观者，**挡不住一个有角色的玩家伪造 `qty:50` 把当周期的某件货清零**（消息里压根没说是替谁买的）
  解法：载荷必须带主体 id，接收端用 `userOwnsActor(sender, id)` 核对；对照检查法：同一个 handler 里的**其它分支**是怎么校验的（`claim-remove` 一直是对的）
- 342（原文第二个同号条目）. 坑：给新改的纯函数不配回归闸门
  解法：`_r12-verify.mjs` 27 条断言写完先跑绿，再往副本里注入 3 处**旧写法** ⇒ 6 条报红、exit 1；**只跑绿不算数**，要证明「改回旧写法它会红」；演练必须整目录复制到 `99_临时草稿\` 下跑、跑完删掉，绝不在真模块目录里注入
- 343. 坑：同一笔钱在两处显示取整口径不一致 —— 合计用「先汇总再 `Math.round`」、每一行用「单价 `Math.round`」⇒ 1 铜底价的行「单价 × 件数」加起来不等于合计（用户看到「数对不上」）
  解法：要么都逐行取整、要么都汇总取整；**改一处时要把另一处一起看**；验证法：让界面把「每一行的贡献」也显出来（本版加了 ` · 折算 X`）
- 343（原文第二个同号条目）. 坑：`_apply.mjs` 块解析是 `oldS = body.slice(0, sep)`（**含 `@@@NEW` 之前那个换行**）⇒ 当 OLD 最后一行后面还有别的内容（例如 `</div>` 后面还跟着 `))`）时，带换行的锚点永远命中 0 次
  解法：把 `@@@NEW` 放在 OLD 那一行的**行尾**，oldS 就不带换行了；⚠️ `_dry.mjs` 会裁掉尾部空行 ⇒ 它会对这种块**误报 OK**，不能只靠它

## 339–350（1.15.2 / 1.15.3 两轮三方审查里学到的）
- 339. 坑：审查报告是线索不是判决（第三次）—— 破坏性测试报的 12 条里有 1 条（配方钱材料两边口径）在它提交之前就已经被同批补丁修掉了
  解法：每条都要回源码逐字核，不能照抄
- 340. 坑：fail-closed 判据太宽 —— 把 `recipeAccessAll` 的坏名单判据从 fail-open 翻成 fail-closed 时，第一版把 `{}` / `[]` 也当坏名单 ⇒ **一升级就把所有玩家锁在门外**
  解法：**只有「写过了这个键、但类型不对」才算坏**（`hasOwnProperty` 判断写没写过；`Array.isArray` 为空就直接当没设过）
- 341. 坑：守卫范围与语义不对齐 —— `Number(null) === 0` 与「用户明确设成 0」必须分开问；`dcValue` 只挡精确空串，于是 `false` / `[]` / `"  "` 静默变成 **0 = 不检定**
  解法：把「设过吗」与「值是不是 0」拆成两个问题
- 342. 坑：新改的纯函数没配回归闸门与演练
  解法：立刻配 —— 否则下次改回去没人拦
- 343. 坑：审查代理没说清「它审的是哪个快照」—— 本次三个代理都主动报了「文件正在被并发修改，行号会漂、逐字原文不会漂」并给了 sha256
  解法：这是好习惯 —— **按引文 grep，不要按行号定位**
- 344. 坑：一个补丁被应用两次不会报错 —— 工序是「按文本匹配替换」，重复命中时只是多出一行一模一样的语句，语法检查、名字检查、契约检查**全都看不见**（二轮代码审查靠人眼逮到一处：`if (this.shopIndex >= presets.length) this.shopIndex = 0;` 连出两行）
  解法：新建永久闸门 `_dup-verify.mjs`（相邻重复行 = 0，只认完全相同且长度 > 20 的相邻行）
- 345. 坑：显示侧与计费侧没一次改完 —— `claimOrder` 改成「只补差额」后，**到货格、下单回执、下单聊天卡、商店页说明**四处还在报全价，下一轮审查又抓出「预订窗里两行互相打脸」
  解法：改一个口径时先 `grep` 它的**每一个**输出点（数值 + 文案都算）
- 346. 坑：`.lhc-x` 这类行首缩进照抄 —— `_apply.mjs` 按**子串**匹配，锚点里每一格空白都必须与磁盘逐字节相同（同一批 6 块里 3 块因为「我以为 6 空格、实际不是」命中 0 次）
  解法：锚点尽量不带行首缩进；带缩进的交给护栏拦（它拦住了三次，磁盘一次没坏）
- 347. 坑：小数硬币会让「破币」凭空造钱 —— `plan.purse[k] > 0` 对 `0.5` 成立 ⇒ 破开 1 枚 ⇒ 余额 −0.5，而落库那一步的 `coinClamp` 是 `Math.max(0, …)` 把 −0.5 **悄悄夹成 0** = 替玩家免掉 50 铜的债
  解法：硬币按整数论（`>= 1`），并且**规划结束前任何面额为负一律判失败，不许交给落库去「消化」**
- 348. 坑：同一个量有两条判据时其中一条必然是错的 —— 卡面「够不够」是**逐行**判、真正扣钱的 `craftRecipe` 是**汇总**判；配方同时要 1 金币 + 1 银币、身上只有 1 金币：逐行各判都过、合起来凑不出 ⇒ 卡面说可做、点下去动不了
  解法：「够不够」只能有一个数
- 349. 坑：缺字段的两种解释没统一 —— 「没有 `depositCopper`」在 `cancelOrder` 里被解释成「那时付的是全价」，在 `claimOrder` 里却被解释成「定金是 0」⇒ 老单子玩家被收两遍（2 倍原价）
  解法：同一个字段的缺省语义，全模块只能有一种读法
- 350. 坑：信任边界上的「不变式」看错层次 —— socket 那条「单条消息不超过该分区上架上限」只约束**每条消息**；同一条重复发 N 次每次都能过检查，累加到 ≥ 货架件数之后那件货就从**所有人**的货架上消失
  解法：上限必须落在**累计量**上，不是单条消息上

## 统计
- 实际抽出条目数：**381 条**（编号条目 **365 条** + 非编号专题条目 16 条）
  - 编号 1–238：238 条（全）
  - 编号 250–350：101 条（全）
  - 编号条目的重复计数：`250–253` 原文整块（含标题 `## 1.13.2 新增铁律`）**重复一次**（+4）；`315–319` 在原文中各出现**两次且内容不同**（+5）；`339–343` 在原文中各出现**三次**（2052–2094 一套、2095–2123 另一套、2128–2139 的 339–350 合并版）（+10）
  - 专题组：`零 · 本项目线上实测结论`（含「★ AppV2 静默失败的真根因」「★ 重渲染路径与输入框」两个子节）、`十 · gacha-banner 可直接搬的视觉技法`（11 条技法 + 「★『变色』的三套机制」）
- **跳号清单：`239`、`240`、`241`、`242`、`243`、`244`、`245`、`246`、`247`、`248`、`249` —— 原文无此号**（编号从 238 直接跳到 `## 1.13.2 新增铁律` 的 250，中间无任何 239–249 的段落或占位）
- 原文编号异常（非跳号，是重复）：315–319、339–343 各存在多套同号不同内容的条目；339–343 另在 `## 339–350（1.15.2 / 1.15.3 两轮三方审查里学到的）` 中再列一次
- 未修改任何文件：全程只做 `read` / `grep`

---

## 附 · 全书统计（合并脚本自动生成）

| 项 | 数 |
|---|---|
| 片段数 | 4 |
| _总典-片段1.md | 76,058 字节 |
| _总典-片段2.md | 56,776 字节 |
| _总典-片段3.md | 76,549 字节 |
| _总典-片段4.md | 133,537 字节 |
| **坑** 条数 | 458 |
| **解法** 条数 | 830 |
| 证据 条数 | 247 |
| 标注「原文未给」的 | 4 |
| 全书字符数 | 204,770 |
