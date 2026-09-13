# lh-tarot 交接文档 · 已坐实知识 + 完整踩坑清单（塔罗牌 8 轮「横竖之战」全记录）

> 学费 25 块（8 轮远程盲调）。本文档目的：下一个接手的人（或下一次对话的模型）**照着做，不许重走**。
> 模块路径：`01_跑团工具/Foundry模块/lh-tarot/`（本地工作区）；部署路径：FVTT 服务器 `Data/modules/lh-tarot/`（用户"复制粘贴整个文件夹"部署）。

---

## 1. 模块现状（v1.3.9）

文件清单与职责：

| 文件 | 职责 |
|---|---|
| `module.json` | id `lh-tarot`，version `1.3.9`，esmodules `scripts/tarot.js`，styles `styles/tarot.css` |
| `scripts/tarot.js` | 主逻辑 460 行。单例全屏 overlay（非 Dialog、非 ApplicationV2） |
| `scripts/deck-cn.js` | 22 张大阿卡纳中文牌义（id `major_00`~`major_21`） |
| `scripts/spreads.js` | 6 牌阵布局（单牌/三牌/圣三角/二选一/凯尔特十字10张/六芒星7张），slots 每项 {label,x,y,rot}，x/y 相对坐标 0~1 |
| `styles/tarot.css` | 520 行。主题变量 + 8 套星云背景 + 星空/流星/翻牌动画 |
| `cards/` | 78 张 RWS 牌图（500×838 竖图），22 张大阿卡纳 = major_00~21.jpg |
| `backgrounds/` | 8 张真实星云/银河图（统一裁切 1920×1080），`_来源与许可.txt` 记版权 |
| `audio/` | shuffle.mp3 + flip-1~5.m4a |
| `_fancheck.mjs` | 本地几何验证脚本（与 fanGeom/spreadFan 同公式，改几何必须重跑） |

tarot.js 函数索引（v1.3.9 行号）：
- L17 `window.__LHTAROT_VER = "1.3.9"` —— **版本探针，远程调试生命线**
- L19-28 BACKGROUNDS（8 背景）、L31-36 SFX（音效路径）、L36 STAR_SVG（四芒星，用户指定喜欢四芒星）
- L38-52 playSound/playFlipSound：`(foundry.audio?.AudioHelper || AudioHelper).play({src,volume,loop:false}, false)` —— 第二个参数 false = 只本地播不广播
- L54-58 freshState、L59-64 slotCard、L65-72 shuffledIndices
- L75-100 slotHTML（牌位 HTML：`.vtarot-slot` 内 `left:x%;top:y%` + `.vtarot-card-wrap` + `.vtarot-card` + label）
- L103-111 stageHTML（三态：无牌阵/点击洗牌/牌位）
- L114-127 renderFan（扇形层 HTML）
- L129-165 renderHTML（整面板：topbar/bgswatches/side/stage/sendbar）
- L169-186 selectSpread/stageClass、L188-205 shuffle（洗牌动画→1100ms 后 spreadFan）
- **L208-209 FAN_START=-48 / FAN_END=48**
- **L214-228 fanGeom（扇形几何，见 §2.4）**
- **L230-250 spreadFan（扇形摊开，left/top 直摆，见 §2.3）**
- L253-267 computeCardSizes（牌位 CSS 变量 --slot-w/--slot-h）
- L270-287 pickCard、L289-301 flipCard、L303-309 flipAll、L311-333 openCardPopup、L334-336 closePopup
- L338-346 setBg、L347-357 reset、L358-363 updateButtons
- L365-400 事件委托：`document.addEventListener("click")` + `ev.target.closest("[data-act]")`（内联 onclick 会被 HTMLField 剥掉，所以用委托）
- L407-411 resize 监听（重算尺寸 + phase==="fan" 时重 spreadFan）
- L414-424 流星、L427-440 renderTarotApp（单例，`$("<div class=vtarot-app>").appendTo("body")`）、L442-447 closeApp、L449 window.renderTarotApp 暴露
- L452-460 场景按钮：`Hooks.once("ready")` + `setInterval(1500ms)` 轮询 + `insertAfter("button.control.ui-control.layer.icon.fa-solid.fa-bookmark")` —— **v13 下 getSceneControlButtons 不可靠，轮询法是用户验证过的写法**

---

## 2. 已坐实的知识定案（这次确定下来的，直接抄用）

### 2.1 用户环境
- FVTT v13.351 + dnd5e 5.3.3；服务器 146.56.232.12:30000；部署=复制粘贴整个文件夹；浏览器需 Ctrl+F5 强刷（module.json version 变更会触发新 URL）。
- 世界有 socketlib 频道 `module.your-dm-toolkit`、midi-qol、Tidy5E（非标准卡）等大量模块。
- **本机 FVTT 源码黄金来源**：`<FVTT安装目录>\resources\app\`（public/css/foundry2.css、client/ 等），查 API 先 grep 这里。

### 2.2 ★核心坑：用户浏览器「点击命中检测不跟随 transform」（现象级坐实）
证据链（用户实测原话）：
1. "点扇形侧边牌，本身牌不会发亮，旁边那张发亮，点击后选中的是旁边的牌"
2. "点扇形中央（顶端）的牌，没问题，会发亮也能选中"（中央牌上方无相邻牌，错位后鼠标仍落在自己身上）
3. 历史抱怨："凯尔特十字横牌点不开"（第 2 张挑战牌 rot 90 横放，热区对不上）

结论与铁律：
- **任何需要点击的元素，不许用 transform 位移定位**（translate(-50%,-50%) 视觉挪了、热区留在原地）。
- 定位统一 **left/top 直摆**：`left: (x - w/2)+"px"; top: (y - h/2)+"px"`。
- 允许保留小角度 rotate 作朝向（±3° 热区误差可忽略）；rotateY 3D 翻牌（视觉盒与布局盒同位置镜像）可保留。
- CSS 入位动画 keyframes **不写 translate**（fill-mode:both 的 to 帧会持续压住内联 transform，等于永远错位）。

### 2.3 扇形牌定位定案（tarot.js L230-250，v1.3.9 已落地）
```js
$(el).css({
  left: (x - fanW/2) + "px",
  top:  (y - fanH/2) + "px",
  width: fanW + "px",
  height: fanH + "px",
  zIndex: 10 + Math.floor(n - Math.abs(k - mid) * 2),   // 中央牌最上层
  transform: `rotate(${(-angle * 0.05).toFixed(1)}deg)`, // 只留 ±2.4° 微倾
});
```
- 尺寸**内联写死**，不依赖 CSS 变量继承（FVTT 全局 CSS 静默碾压是另一个坑）。
- renderFan 初始堆叠 style 也只留 `left:50%;top:50%;z-index:i`（L118），无 transform；transition（CSS L383 `left/top/transform .55s`）负责从堆叠滑到弧线。
- 牌位 `.vtarot-slot`（CSS L257-266）同样弃 transform：`margin-left: calc(var(--slot-w,92px) * -0.5); margin-top: calc(var(--slot-h,150px) * -0.5);`。

### 2.4 扇形几何定案（tarot.js L208-228，改参数前必须跑 _fancheck.mjs）
```js
const FAN_START = -48, FAN_END = 48;      // 弧角 ±48°（±60° 曾让扇形横向铺满+两端牌下探，用户嫌"横"）
const cx = w / 2;
const cy = h * 0.95;                       // 圆心在底部下方
const r  = Math.min(w * 0.9, cy - h * 0.14);
const totalRad = ((FAN_END - FAN_START) * Math.PI) / 180;
const fanH = Math.min(Math.max((r * totalRad) / ((n-1) * 0.4 * 0.62), 60), Math.max(60, h * 0.28 - 8));
const fanW = fanH * 0.62;
```
- **出界保护公式**：弧顶牌（角度 0）中心 y = cy − r = 0.14h；牌顶 = 0.14h − fanH/2 ≥ 0 ⇒ fanH ≤ 0.28h。留 8px 余量 ⇒ 上限 `h*0.28-8`。hint 条已挪到底部（CSS L368 `bottom:14px`）不占顶。
- 已验证：1200×700 / 900×450 / 700×380 三种尺寸四边零越界（_fancheck.mjs 输出）。
- 牌宽高比 **0.62 定案**（标准 RWS 500×838≈0.597 瘦高）。**0.72 曾是我的自作主张，就是"横/矮胖"的元凶，永远不许再改宽。**

### 2.5 凯尔特十字定案（spreads.js L58-59）
- 第 2 张「挑战/障碍」：`{ x: 0.58, y: 0.38, rot: 0 }`——**rot 从 90 改 0（竖放）+ x 从 0.5 错开 0.08**，因为 rot 90 横牌在此环境点不开。
- 第 1 张「现状」`{ x: 0.5, y: 0.48 }`。两张错开保证都可点。

### 2.6 交互与动画定案
- 事件：document 级委托 + `[data-act]`（内联 onclick 会被 ChatMessage 的 HTMLField 清洗——那是 chat 的坑；本模块是自绘 DOM，但统一用委托防坑）。
- 入位动画 `vtarotIn`（CSS L355-359）：只有 opacity + scale，**无 translate**。
- 洗牌动画 vtarotShuffle 在 `.vtarot-fan-cards` 父层（CSS L397），1.05s 后 spreadFan。
- 大卡弹窗 `.vtarot-card-popup`（CSS L409+）：fixed inset:0 z 80，`data-act="close-popup"`，点内容区不关（tarot.js L376-385 判断 box.contains）。
- 全屏 overlay 单例：`renderTarotApp()` 有 `_app.is(":visible")` 时直接 return（L426-427）。

---

## 3. 踩坑清单（现象 → 根因 → 避法，全部亲历）

1. **ApplicationV2 静默失败**：lh-video-lab 曾用 `extends foundry.applications.api.ApplicationV2` → 模块开关弹回、F12 无报错。→ 永远用 `new Dialog`（金标准）或本模块的自绘 overlay。
2. **Dialog v1 参数错位**：`new Dialog(data, options)` 第二参数才接 classes/width/height/resizable；放第一参数则 CSS 类全丢。且 v13 强制 `theme-light`（黑字压面），classes 必须自带 `theme-dark`。
3. **全局 CSS 碾压**：`body.game .app button{width:100%}`（foundry2.css:11805，特异性 (0,2,2)）把模块按钮撑满、input 挤成小方块。→ 模块按钮必带 `width:auto !important`。
4. **transform 定位热区错位**：见 §2.2，本项目最大的坑，8 轮"横"的最后两轮才锁定。
5. **擅自改参数**：v1.3.2 把牌比例 0.62→0.72（注释"更宽"，没人要求）→ 之后所有"横/矮胖"抱怨全由此引发，我治了 6 轮自己造的伤。→ 没被要求的"顺手优化"一律不做；调不动时回滚到"用户说过挺好"的版本值。
6. **英文半角引号炸模块**：deck-cn.js 中文牌义里混入 7 处 U+0022 直引号（如「别用"勇气"为鲁莽买单」）→ 字符串提前闭合，`SyntaxError: Unexpected identifier`，模块整体静默加载失败。→ 中文文案交付前用正则扫 `["\u0022]`，一律改「」。
7. **node --check 误判通过**：`$LASTEXITCODE` 只反映最后一条命令，`if($LASTEXITCODE -eq 0)` 掩盖了前面文件的报错。→ **逐个文件查退出码**，别用一条 if 打包。
8. **独立 fa 图标渲染成空白小方块**（lh-video-lab 经历）：FVTT v13 下单独 `<i class="fa-solid">` 占位会渲染成 2 字符空白框。→ 图标放按钮/元素内随内容，或直接 SVG。
9. **旧代码缓存/部署不一致**：曾出现"诊断 0 张牌 vs 截图 20 张牌"（新旧代码混跑）。→ **每次听反馈前先拿 `window.__LHTAROT_VER`**；版本号必须在 module.json + JS 头部注释 + 探针变量三处同步升。
10. **ChatMessage HTMLField 剥内联事件**（lh-video-lab 经历）：聊天内容内联 onclick 在服务端存档时被清洗。→ 聊天内容用 `a[href]` 原生行为或 GM 端 document 捕获阶段委托。
11. **文件重命名/删除 API 不存在**（lh-video-lab 经历）：v13 `dist/files/files.mjs` 的 manageFiles 只有 browseFiles/createDirectory/configurePath 三个 action。→ 别臆造 FilePicker.rename。
12. **FilePicker.browse 的 extensions 参数**（lh-video-lab 经历）：传了反而出问题，去掉后自己按后缀过滤（mp4/webm/ogv/mov/m4v）。

---

## 4. 「横」之战完整时间线（每轮改了什么、错在哪）

| 版本 | 我改了什么 | 用户反馈 | 错在哪 |
|---|---|---|---|
| v1.3.2 | rotate(angle)→rotate(-angle)；**牌比例 0.62→0.72（自作主张"更宽"）** | 横着细长；横牌点不开 | 比例改宽=自创"矮胖横"之病 |
| v1.3.3 | 弧角±65→±40；rotate 改 -angle*0.15；四芒星 | 微微竖了点，但太奇怪 | 治的是 rotate，真病是比例+定位 |
| v1.3.4 | 弧角±40→±60；圆心/半径重算 | 还是横躺 | 继续在几何里猜 |
| v1.3.5 | 尺寸改内联写死 | 截图仍横（但诊断显示旧 JS） | 没先拿版本号 |
| v1.3.6 | 加 window.__LHTAROT_VER 探针 | 量牌诊断：146×203 竖牌 9° | 诊断证明竖，但仍没问"横指什么" |
| v1.3.7 | rotate 0.15→0.05 | 还是横的 | 同一根因改第 4 次 |
| v1.3.8 | 比例 0.72→0.62 | 仍横 + 新线索：点侧边牌旁边亮、中央正常 | 比例对了一半；热区错位未识破 |
| v1.3.9 | left/top 直摆弃 transform；fanH 出界保护；弧角±48；挑战牌竖放 | 未验收，用户喊停 | — |

**每轮复盘的正确做法（SOP）**：
1. 先拿 `window.__LHTAROT_VER`（排除旧代码）。
2. 再要一张截图 / 让用户描述"哪里正常、哪里不正常"的对比（v1.3.8 那句"中央正常侧边错位"一步锁定热区错位——它本可以在第 2 轮就问出来）。
3. 把用户的现象词反问锁定含义（"横"=横躺90°？太宽？整体铺开？）。
4. 有了新证据才允许换根因；同一根因改两次无效 = 根因错。

---

## 5. 待验证 / 未验收项（诚实清单）

- v1.3.9 代码语法全过、几何模拟全绿，但**未经用户视觉验收**（用户停止调试）。
- 未验证项：①left/top 直摆后侧边牌点选是否正常（理论上热区=视觉，但用户环境"命中检测不跟随 transform"是现象级结论，left/top 方案本身不依赖该结论即可工作）；②扇形 ±48° 观感是否满意；③挑战牌竖放观感。
- 若重启：**第一件事拿截图 + 版本号，一个像素都不许猜。**

---

## 6. 复用关系（此模块与生态）

- 窗口形态参考 lh-video-lab 的 `new Dialog` 金标准（本模块改为全屏 overlay 是用户 v1.2.0 明确要求"去 Dialog 方框"）。
- 场景按钮轮询法 = 用户世界《简单陷阱》《冒险者履历》验证写法。
- 动画移植自 gacha-banner（styles.css 的 shine/flow/glow 套路）。
- 音效 AudioHelper.play 第二参数 false = 只本地播（helper.mjs:413）。
- 牌义/牌图源 the-arcana（MIT）；背景图 4 NASA 公有领域 + 4 CC BY（见 backgrounds/_来源与许可.txt）。
