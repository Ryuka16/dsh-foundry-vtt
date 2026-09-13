# 血的教训 · DialogV2 弹窗选择器篇（content 内联事件失效 + 按钮 callback 读 DOM 正解）

> ## ⚠️ 文件说明（务必严肃阅读）
>
> 本文记录 **Foundry v13（core 13.351）+ dnd5e 5.3.3 下，宏弹窗里「单选框/复选框切换不生效」的完整坑与正解**。
> 用户实测现象：「点短休还是长休」——弹窗 radio 切到短休，确认后仍执行长休。
> 根因：**DialogV2 content 字符串里的内联事件处理器不生效**，状态恒为默认值。
>
> 翻到本文件的任何 AI / 开发者 / 用户，请先花 3 分钟读完本节再动手。
> **如果你即将做「DialogV2 弹窗 + 单选框/复选框让用户选择」的宏/模块，这里写的就是全部的坑和正解。**
> 已同步警示进 `FVTT-data-dict-v9_1.md`（对话框 v13 条目下方）。

---

## 0. 血的教训（最重要，先看这条）

1. **DialogV2 content 字符串里写内联事件（`onchange`/`onclick`）实测不生效**——不是语法错、不是函数没定义，是事件处理器根本没绑上/被剥掉。症状：弹窗里怎么点 radio，程序读到的状态恒为 HTML 里写死的默认值（本文案例：默认 `long`，点 `short` 也还是 `long`）。
2. **「默认值路径能跑」≠「弹窗交互能跑」**——第一版长休宏用户说「能用」，是因为它的默认状态恰好=全选+长休，确认后直接执行正确路径，事件死没死根本暴露不出来。**任何带「切换选项改变行为」的弹窗宏，必须实测「非默认选项」那条路径**（点 short 再确认、取消一个勾选再确认），否则等于没测。
3. **正解 = 不在 content 里绑事件，在按钮 callback 里读 DOM**：content 只放带 `name` 的表单元素；「执行」按钮带 `callback: (event, button, dialog) => { ...读 dialog.element...; return 值; }`，返回值即 DialogV2 提交值。这是 Foundry 官方 v13 API 文档逐字给出的写法，也是 dnd5e 系统源码 `_confirmDialog` 自己的写法——抄它，别发明。

---

## 1. 复盘：休息宏「点短休仍长休」时间线（每坑一句话根因）

1. **长休宏 v1（全体长休）**：GM-only，无弹窗、直接逐个 `a.longRest({dialog:false,chat:false})`——能用。
2. **v2 加弹窗**：DialogV2.confirm，content 里 `checkbox` 默认全勾 + 内联 `onchange="window.__lrSync()"` 存勾选到 `window`——用户实测「能用」。（真相：只是默认全选路径可用，内联事件一直是死的。）
3. **合并宏「角色休息」**：弹窗加 radio「长休/短休」（默认 long），模式同步同样走内联 `onchange` → **点短休仍长休**。这次非默认路径才把事件失效暴露出来。
4. **排查方向一：函数没挂到 window？** 否——函数是显式赋 `window.__rsSync = ...` 的，定义没问题。
5. **排查方向二（定案）：content 内联事件根本不触发**。查官方 v13 API（foundryvtt.com/api/v13）：`DialogV2Button` 接口带 `callback?: DialogV2ButtonCallback`；`DialogV2ButtonCallback = (event: PointerEvent|SubmitEvent, button: HTMLButtonElement, dialog: DialogV2) => Promise<any>`；按钮 callback 的**返回值即对话框的 submitted value**；静态 `DialogV2.wait(config)` resolve 到「按钮 identifier 或该按钮 callback 的返回值」，dismiss 且 `rejectClose:false` 时 resolve `null`。
6. **同构佐证**：dnd5e 系统源码 `module/applications/api/application-v2-mixin.mjs` 433-451 `_confirmDialog()`——`new DialogV2({..., buttons:[{action,label,...,callback?...}], submit: result => resolve(result)})` + close 事件兜底 resolve(null)。系统自己也是「按钮回调/提交回调拿值」，不在 content 里绑事件。
7. **修复（v3）**：content 内联事件全删，radio/checkbox 只留 `name`；「执行」按钮 `callback` 里 `dialog.element.querySelector("input[name=rs-mode]:checked")` / `querySelectorAll("input[name=rs-opt]:checked")` 读 DOM，返回 `{mode, ids}`；`DialogV2.wait` 的 resolve 值即用户选择。用户复测：「能用了」。

---

## 2. 根因与机制（分「已坐实」和「机制推断」）

### 2.1 已坐实（现象级）
- DialogV2 content 为 **HTML 字符串**时，其中的内联 `onchange`/`onclick` 在用户环境（v13.351）**不会触发**。
- 触发不了的表现不是报错，而是**静默保持默认值**——最难排查的一类。
- 修法（按钮 callback 读 DOM）在用户环境**复测通过**。

### 2.2 机制推断（未逐一坐实，写代码别依赖以下细节）
- 疑似 content 字符串在 DialogV2 内部渲染时经过富文本净化（与 ChatMessage 内容剥内联事件同理，见「血的教训-远程盲调UI篇」§2.6/§3-10 的 `[data-act]` 委托结论——FVTT 多处对 HTML 字段做净化）。
- 不依赖机制推断也能安全写码：**任何弹窗交互取值都走按钮 callback / submit 回调读 DOM，绝不在 content 内联事件里存状态**。

---

## 3. 正解存档（照抄这些，别再发明）

### 3.1 官方 v13 API 签名（foundryvtt.com/api/v13）
- `DialogV2ButtonCallback`：`(event: PointerEvent | SubmitEvent, button: HTMLButtonElement, dialog: DialogV2) => Promise<any>`
- `DialogV2Button`：`{ action: string; callback?; class?; default?; disabled?; icon?; label: string; style?; type? }`——**callback 返回值 = 该对话框的 submitted value**；无 callback 的按钮用其 `action` identifier 作提交值。
- 静态 `DialogV2.wait(config): Promise<any>`：resolve 到「按钮 identifier 或 callback 返回值」；dismiss 且 `rejectClose:false` → resolve `null`。
- 静态 `DialogV2.confirm(config)`：仅布尔/`{confirmed}` 语义，**拿不到表单值**——本文案例第一版用 confirm 只能等用户点完，无法在点确认瞬间读选项，才被迫走内联事件弯路。

### 3.2 可直接照抄的宏骨架（v3 定案写法）
```js
// content：只放带 name 的表单元素，不写任何内联事件
const content = `
  <label><input type="radio" name="rs-mode" value="long" checked> 长休</label>
  <label><input type="radio" name="rs-mode" value="short"> 短休</label>
  <label><input type="checkbox" name="rs-opt" value="ID1" checked> 甲</label>
  <label><input type="checkbox" name="rs-opt" value="ID2" checked> 乙</label>`;

const picked = await foundry.applications.api.DialogV2.wait({
  window: { title: "角色休息", icon: "fa-solid fa-bed-pulse" },
  content,
  modal: true,
  rejectClose: false,          // 关窗/ESC → resolve null（而不是 reject）
  buttons: [
    {
      action: "go", label: "执行", icon: "fa-solid fa-check", default: true,
      callback: (event, button, dialog) => {       // ★ 点击瞬间读 DOM
        const root = dialog.element;
        const mode = root.querySelector("input[name=rs-mode]:checked")?.value ?? "long";
        const ids = [...root.querySelectorAll("input[name=rs-opt]:checked")].map(c => c.value);
        return { mode, ids };                       // ★ 返回值 = wait 的 resolve 值
      }
    },
    { action: "cancel", label: "取消", icon: "fa-solid fa-xmark" }
  ]
});
if (!picked || picked === "cancel") return;         // dismiss → null 也在此拦下
const { mode, ids } = picked;
```
- 多个同类控件用**同名 `name`**（radio 天然互斥；checkbox 同名便于 `querySelectorAll` 一把抓）。
- 需要「只读」的当前状态（如已勾选项数）→ 用 `Hooks` 或按钮 callback 里再读，别靠内联事件实时维护。
- 纯确认弹窗（无表单取值）仍可用 `DialogV2.confirm`，别过度设计。

### 3.3 系统同构参照（源码路径，v13 时代一致）
- `module/applications/api/application-v2-mixin.mjs` L433-451 `_confirmDialog`：`buttons` + `submit: result => resolve(result)` + `close → resolve(null)`。
- `module/applications/advancement/advancement-confirmation-dialog.mjs` L50-52：按钮 handler 里 `this.element.querySelector('[name="apply-advancement"]').checked` 读表单——**系统自己就是按钮处理器里读 DOM**，铁证。

---

## 4. 铁律（本次沉淀）

1. **DialogV2 content 字符串内禁写内联事件**（onchange/onclick 不生效）；content 只放带 `name` 的表单元素。
2. **弹窗取值一律在按钮 callback / submit 回调里读 `dialog.element` DOM**，callback 返回值即提交值。
3. **测试弹窗宏必须走「非默认选项」路径**：点 non-default radio、取消至少一个勾选，再确认。「默认路径能用」不证明交互活着。
4. 查 v13 API 用 foundryvtt.com/api/v13（本文签名均逐字取自该站 + dnd5e 5.3.3 源码，非臆造）。
5. 单选/多选数量级大时（本文 40+ 角色）：content 控件只读、全量在 callback 读，避免任何「实时维护选中集」的脆弱设计。

---

## 5. 关联知识与文件

- 同族坑（FVTT 剥内联事件的其他位置）：`血的教训-远程盲调UI篇.md` §2.6 / §3-10（ChatMessage HTML 内容内联 onclick 被清洗 → 用 `[data-act]` 事件委托）。
- 速查表同步警示：`FVTT-data-dict-v9_1.md`「对话框（v13）」条目下方。
- 修复后产物：`<工作目录>\FVTT房规\fvtt-Macro-角色休息.js`（v3，宏名「角色休息」，radio 长短休 + checkbox 角色列表 + 按钮 callback 读 DOM）。
