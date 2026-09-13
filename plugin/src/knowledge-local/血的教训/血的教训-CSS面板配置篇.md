# 血的教训 · CSS 面板配置篇

> ## ⚠️ 文件说明（务必严肃阅读）
>
> 本文件是**一份教训记录，不是普通攻略**。它记录了「lh-video-lab 教学视频库」模块面板
> （自建 UI 面板 + 自定义 CSS 主题 + 文件夹/素材/发送一整套控件）从「模块打不开」到
> 「输入框缩成两个字符小方块」的全过程翻车与正解。
>
> **模块与环境背景（新 AI 接手必读）：**
> - 模块位置：`01_跑团工具\Foundry模块\lh-video-lab\`，文件 = `module.json` / `scripts/video-lab.js`（约 1360 行）/ `styles/video-lab.css`（约 876 行）/ `lang/cn.json` / `README.md`。
> - 用户环境：**FVTT v13.351 + dnd5e 5.3.3**，服务器 146.56.232.12:30000，用户用「复制粘贴整个文件夹」方式部署到 `Data/modules/`。
> - 用户用的是 **Tidy5E 非标准卡**；世界里有 socketlib 频道 `module.your-dm-toolkit`、midi-qol、Plutonium 等大量模块。
> - **本机 FVTT 源码（grep 全局 CSS 的唯一权威来源）**：`<FVTT安装目录>\resources\app\`，其中全局样式在 `public\css\foundry2.css`（14265 行）。
>
> 翻到本文件的任何 AI / 开发者 / 用户，请先花 3 分钟读完本节再动手。
> **如果你即将做「FVTT v13 模块自建 UI 面板 / 自定义 CSS 主题 / Dialog 弹窗样式」，这里写的就是全部的坑和正解。**

---

## 0. 血的教训（最重要，先看这条）

1. **FVTT 的全局 CSS 会静默碾压你的模块样式**——不是「你的 CSS 没加载」，而是「加载了但被更高特异性/更高优先级的全局规则覆盖」。诊断时要先分清这两者，别一上来就怀疑没加载。
2. **模块 CSS 不是用 `<link>` 加载的**——FVTT v13 用 `<style>` 标签内的 `@import` 注入。拿 `<link rel=stylesheet>` 去查当然查不到，这是两次误诊「CSS 没加载」的元凶。
3. **按钮在 flex 行里被压成小方块的根因，十有八九是 FVTT 全局 `button { width: 100% }`**——不是你的 flex 没生效。看 computed `flex` 值判断：`flex` 显示 `1 1 0%`（flex 生效了）而 `width` 却只有几十 px（内容没增长）→ 是别的元素把空间抢走了。

> 用户为这个面板反复贴 F12 日志、来回导入十余版，真实反馈（原话，值得每个 AI 记住）：
> - 「丑的惨绝人寰」「我不是给你参考了嘛」——指 UI 没照参考的 gacha-banner 做、没动画。
> - 「那个图标还，就是路径输入框，特别特别小，图标交回来，然后输入框放大」——输入框缩成小方块。
> - 「全体玩家那个小框，和发送给全体玩家的框卡在一起了」——按钮 width:100% 撑满导致的布局粘连。
> - 「是啥原因呢，现在正常了」——最终定位到全局 CSS width:100% 后才修好。
> **这些不是抱怨，是「AI 只动手、没先 grep FVTT 源码查全局 CSS」的直接后果。**

---

## 1. 复盘：面板翻车时间线（每条含 症状 → 铁证 → 根因 → 修复）

按 lh-video-lab 面板的开发顺序排，每一条都是真实踩过、用 F12 铁证锁定的坑：

### 1.1 ApplicationV2 写法 → 模块静默失败（开关弹回关闭）
- **症状**：进世界后「选择打开点击加载没反应，F12 也没弹任何东西，重新打开 mod 选择它还是关的」——模块 init 阶段静默失败，Foundry 把开关弹回。
- **根因**：`extends foundry.applications.api.ApplicationV2` 这套没在真实 FVTT 验证过，基类引用不对时模块加载即抛异常。
- **修复**：改用用户已验证可靠的 `new Dialog` 金标准（见 §2.4）。

### 1.2 v1 Dialog 选项放错参数 → CSS 变量全失效
- **症状**：面板出来了但样式全丢、按钮黑字。
- **根因**：`new Dialog(data, options)` 构造器**只把第二个参数交给 Application**；把 `classes/width/height/resizable` 误放第一个 `data` 参数 → 窗口没拿到 `.video-lab-app` 类 → 所有 `var(--vlab-*)` 变量未定义。
- **修复**：选项全进第二参数（见 §2.4）。

### 1.3 FVTT 强制 `themed theme-light` → 深色面板黑字压面
- **根因**：`client/appv1/api/application-v1.mjs:81` 给 v1 应用强制 push `themed theme-light`（除非 classes 已含 `theme-dark`）。
- **修复**：classes 自带 `theme-dark` + 关键文字 `!important`（见 §2.4）。

### 1.4 预览弹窗挂在 `$("body")` → 变量又失效
- **症状**：主面板正常，但点开的预览/权限弹窗按钮黑字。
- **根因**：弹窗不是 `.video-lab-app` 的子元素，`var(--vlab-*)` 拿不到。
- **修复**：CSS 变量挂到 Dialog window 元素（`data-theme` 直接上窗口）+ 弹窗自带变量（见 §2.5）。

### 1.5 独立 fa 图标渲染成空白小方块
- **症状**：文件夹行左边的 `<i class="fa-solid fa-folder-tree">` 渲染成两个字符大的空白小框。
- **根因**：FVTT v13 单独的 fa 图标占位会渲染成空白方块。
- **修复**：别用单独 icon 当装饰占位；图标只放在有文字的按钮里。

### 1.6 Dialog 底部按钮 icon 用字符串 → 渲染成坏字
- **症状**：关闭按钮显示成「fa-solid fa-xmark 关闭」。
- **根因**：`icon: "fa-solid fa-xmark"` 被当**纯文本**渲染；FVTT 要 HTML。
- **修复**：`icon: '<i class="fa-solid fa-xmark"></i>'`（见 §2.4）。

### 1.7 用了不存在的 `var(--surface)` → 面板透明一坨
- **根因**：V13 是 `--color-surface`，不是 `--surface`，且深色面板要兜底色。
- **修复**：用真名 + 兜底色（与《血的教训-简单陷阱篇.md》§1.12 同一条）。

### 1.8 CSS「没加载」是误诊（两次）
- **根因**：① 查 `<link rel=stylesheet>` 查错了加载方式（见 §2.2）；② 诊断时面板没打开导致 `.vlab-folder-input` querySelector 不到。
- **修复**：用 §2.7 的诊断方式，先确认「面板已打开」再查元素。

### 1.9 ★本次核心★ 路径输入框缩成 32px「小方块」
- **症状**：用户说「选择文件夹左边有一个特别特别小的小框，点它能点成蓝框，明显是个输入栏，两个字符大小」。
- **铁证**（F12 控制台，见 §2.7 诊断代码）：`行display:'flex'`、`行宽度:'902px'`、`输入框flex:'1 1 0%'`（flex 生效）、**`输入框宽度:'32px'`**（内容没增长）、子元素 3 项（input + 2 button）。
- **根因**：FVTT 全局 `body.game .app button { width: 100% }`（`foundry2.css:11805`）把「选择文件夹…」「应用」两个按钮每个都拉成 100% 宽，两个按钮占满整行，input 的 `flex:1` 无剩余空间可增长，只剩 padding+border 撑出 32px。
- **修复**：见 §2.1。

---

## 2. 正解存档（照抄这些，别再发明）

### 2.1 ★本次核心★ 模块按钮宽度覆盖（FVTT 全局 width:100% 顶回去）

**根因链（铁证）**：
- FVTT 全局 `body.game .app button { width: 100%; margin: 0 1px; }`（`public/css/foundry2.css:11805-11807`）。
- 特异性：`body.game .app button` = `(0, 2, 2)`（body+button 两元素，.game+.app 两类）；模块 `.vlab-btn` = `(0, 1, 0)`。**`(0,2,2) > (0,1,0)`，FVTT 胜。**
- 在 flex 容器里，按钮 `flex-basis` 默认 `auto`，`auto` 取 `width` → 每个按钮 `width:100%` = 整行宽（如 902px），两个按钮直接占死整行。
- input 的 `flex: 1`（= `flex: 1 1 0%`）确实生效了，但**没有正剩余空间可分**，只能停在 `flex-basis:0%`，只剩 `padding 14×2 + border 2×2 = 32px`（`box-sizing: border-box` 下 padding+border 是硬下限）。

**判断铁证**：控制台查 `getComputedStyle(input).flex` 返回 `1 1 0%`（flex 生效）而 `.width` 返回 `32px`（内容没增长），同时 `.vlab-folder-row` 的 `display:flex`、`width:902px` 正常 → 是按钮 width:100% 抢走空间，**不是 flex 失效、不是 CSS 没加载**。

**修复（照抄）**：
```css
/* 给所有模块按钮把宽度拉回内容宽度，覆盖 FVTT 的 width:100% */
.vlab-btn {
  width: auto !important; /* 必须 !important：FVTT 特异性 (0,2,2) 高于 .vlab-btn 的 (0,1,0) */
  /* ...其余样式照常... */
}
/* flex 行里的按钮：明确不抢空间 */
.vlab-folder-row .vlab-btn.vlab-folder-btn {
  flex: 0 0 auto; /* flex-grow:0 flex-shrink:0 flex-basis:auto → 内容宽度，不撑满 */
  /* ...其余样式照常... */
}
```

### 2.2 模块 CSS 加载方式判断（别再误诊「没加载」）

- FVTT v13 模块 CSS **不是 `<link rel=stylesheet>`**，而是 `<style>` 标签内 `@import "{{src}}"` 注入（`templates/views/layouts/main.hbs:38-54` 的 `{{#each styles.modules}}@import "{{src}}"`）。
- 判断 CSS 是否加载，查 `@import` / `document.querySelectorAll('style')`，**不要查 `document.styleSheets[].href`**（顶层 href 查不到 @import 嵌套）。
- 判断某条规则是否生效，直接 `getComputedStyle(元素).height` 等**实测 computed 值**，别用 querySelector 是否找到元素来推断（面板没打开当然查不到）。

### 2.3 @layer 优先级（模块 CSS 与 FVTT 全局的层级关系）

- FVTT 全局 CSS 用了 `@layer`（`foundry2.css:57` `@layer variables.base` 等）。
- CSS 规范：**未分层的 CSS（你的模块 CSS）优先级高于分层的 CSS（FVTT 全局）**——所以模块 CSS 的「属性」通常能压过 FVTT。
- **但**：`@layer` 不影响**特异性**。你的 `.vlab-btn`（1 类）仍可能被 FVTT 的多元素选择器 `body.game .app button`（2类2元素）在**特异性**上压过 → 该属性 FVTT 生效。这时必须 `!important` 或提高自身特异性。

### 2.4 v1 Dialog 选项放第二参数 + theme-dark（完整金标准骨架）

```js
const dlg = new Dialog(
  {
    content: html,                       // ★ 第一参数：只有 data（content/title/buttons）
    title: "教学视频库",
    buttons: {
      close: {
        icon: '<i class="fa-solid fa-xmark"></i>',  // ★ icon 用 HTML，不用纯字符串
        label: "关闭",
        callback: () => {}
      }
    }
  },
  {                                      // ★ 第二参数：Application 选项
    classes: ["video-lab-app", "theme-dark"], // ★ 自带 theme-dark，防 FVTT 强制 theme-light
    width: 680, height: 520, resizable: true,
    popOut: true,                        // v1 Dialog 默认 popOut:true（application-v1.mjs:244）
  }
);
dlg.render(true);                        // ★ render(true) 强制渲染

// ★ 事件绑定：用 document 级委托（内联 onclick 会被 HTMLField 剥掉，见聊天消息教训）
//   或渲染后 $(dlg.element).on("click", "[data-act]", handler)
```

- `classes`/`width`/`height`/`resizable` **全进第二参数**，放第一参数窗口拿不到类 → CSS 变量失效。
- `theme-dark` 必须显式写进 classes，否则 `application-v1.mjs:81` 强制 push `themed theme-light`。
- 底部按钮 `icon` 用 HTML 字符串，别用 `"fa-solid fa-xmark"` 纯字符串。

### 2.5 CSS 变量作用域（预览弹窗/子窗不丢变量）

- 主题变量挂到 **Dialog 的 window 元素**（渲染后 `dlg.element` 上设 `data-theme`），不要只挂在 `.vlab-root` 内层。
- 挂在 `$("body")` 上的独立弹窗（预览、权限窗）**在 window 元素作用域外**，拿不到 `var(--vlab-*)` → 弹窗自己重新声明一份变量，或直接写死色值。

### 2.6 盒模型与 flex 计算（理解「小方块」的数学）

- FVTT 全局 `* { box-sizing: border-box }`（`foundry2.css:14`）。
- `flex: 1` = `flex-grow:1; flex-shrink:1; flex-basis:0%`。
- `border-box` 下 `flex-basis:0%` 让内容盒目标 0，但 `padding+border` 是硬下限，会撑出最小宽度：`0 + 14×2(padding) + 2×2(border) = 32px`——这就是「两个字符小方块」的精确来历。
- `input` 不写 `type` 属性时，FVTT 的 `input[type="text"] { width: calc(100% - 2px) }`（`foundry2.css:11663`）**不匹配**（属性选择器只匹配显式 `type="text"`，不匹配默认值）——所以 input 自身的 width 没被全局规则污染，问题只在按钮。

### 2.7 诊断速查（遇到面板问题，先跑这三段，再动手）

**① CSS 是否加载（@import 注入判断）**：
```js
(() => {
  const imp = [...document.querySelectorAll('style')].map(s => s.textContent).find(t => t.includes('video-lab'));
  return { 是否注入: !!imp, 片段: imp ? imp.trim().slice(0, 80) : null };
})()
```
→ 返回 `是否注入:true` 说明 CSS 加载了；`false` 才去查 module.json 的 styles 字段 / 文件是否传上服务器。

**② 某条规则是否生效（computed 实测）**：
```js
(() => {
  const el = document.querySelector('.vlab-folder-input');
  if (!el) return '面板没打开，先点开面板';
  const cs = getComputedStyle(el);
  return { 高度: cs.height, flex: cs.flex, 宽度: cs.width, 背景: cs.backgroundColor };
})()
```
→ `flex:'1 1 0%'` 但 `宽度:'32px'` = flex 生效但空间被抢，查按钮（见③）。

**③ flex 行布局（谁抢了空间）**：
```js
(() => {
  const row = document.querySelector('.vlab-folder-row');
  const input = document.querySelector('.vlab-folder-input');
  const rcs = row ? getComputedStyle(row) : null;
  const ics = input ? getComputedStyle(input) : null;
  return {
    行display: rcs?.display, 行宽度: rcs?.width,
    输入框宽度: ics?.width, 输入框flex: ics?.flex,
    子元素清单: row ? [...row.children].map(c => c.tagName + '|' + (c.className||'') + '|' + (c.textContent||'').trim().slice(0,10)) : '行不存在'
  };
})()
```
→ 若「输入框宽度」几十 px、子元素清单里按钮正常 → 查按钮 computed width 是不是 100%（FVTT 全局覆盖）。

---

## 3. 铁律（本次沉淀）

1. **面板样式「不对」，先 grep FVTT 源码 `foundry2.css`**（本机路径 `<FVTT安装目录>\resources\app\public\css\foundry2.css`），锁定是不是 `body.game .app button/input { width:100% }` 这类全局规则在覆盖你，别先怀疑文件没传。
2. **诊断 CSS 用 `getComputedStyle` 实测 computed 值**（`flex`/`width`/`height`/`display`），一条就能分清「没加载 / flex 失效 / 空间被抢」三件事，别靠 querySelector 或猜。
3. **模块 CSS 是 `@import` 注入，不是 `<link>`**——查加载状态看 `querySelectorAll('style')` 里的 `@import`，别查 `document.styleSheets`。
4. **模块按钮必带 `width: auto !important`**——FVTT 全局 `button{width:100%}` 特异性 (0,2,2) 压过单类选择器，不 `!important` 就等着按钮撑满、input 被挤扁。
5. **v1 Dialog 选项进第二参数 + classes 自带 `theme-dark`**——否则窗口没类、CSS 变量失效、主题被强制回浅色。
6. **CSS 变量挂 window 元素，不挂内层 div**——子窗/预览弹窗在作用域外，要自带变量或写死色值。
7. **图标两条**：Dialog 按钮 `icon` 用 `<i>` HTML 不用字符串；别用独立 fa 图标当装饰占位（渲染成空白方块）。
8. **颜色变量用 V13 真名**（`--color-surface` 不是 `--surface`），且深色面板要兜底色。
9. **每修一处 CSS 都升版本号 + 让用户 Ctrl+F5 强刷**——FVTT 会缓存模块 CSS，不刷新看不到新样式。
10. **做面板前先读《血的教训-开工方法论篇.md》§2 资料索引**——里面 grep FVTT 源码、查 gacha-banner 参考 UI、找图标真源的路子全在，别从零发明。
