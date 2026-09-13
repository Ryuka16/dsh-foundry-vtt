# Aeris Tokens 设置界面中文化 · 方案存档

> 状态：**已查证可行性，尚未动手**（用户 2026-09-10 决定「等等做，先存着怎么做的 md」）
> 目标：把 aeris-tokens v13.0.19 的设置界面（约 32 个设置项，全英文）变成中文
> 本文件放在技术资料区，**不进任何 Git 仓库**（用户明确要求技术资料不上传 GitHub）

---

## 一、结论（先行）

**能改，而且不用动 Aeris 一行源码。**

原因是 FVTT 的设置界面在渲染时**每次都现读** `game.settings.settings` 里那个对象的 `name` / `hint` 字段，而不是在注册时把文案固化进模板。所以只要「在 Aeris 把设置注册完之后」把这两个字段覆盖成中文，界面就变中文。

---

## 二、机制证据（本机 FVTT 13.351 源码，可逐行核对）

### 2.1 注册时存的是普通对象，键就是 `namespace.key`

`<FVTT安装目录>\resources\app\client\helpers\client-settings.mjs`

```js
register(namespace, key, data) {                                    // :125
  if ( !namespace || !key ) throw new Error("You must specify both namespace and key portions of the setting");
  data.key = key;                                                   // :127
  data.namespace = namespace;                                       // :128
  data.scope = Object.values(CONST.SETTING_SCOPES).includes(data.scope) ? data.scope : CONST.SETTING_SCOPES.CLIENT;
  data.id = `${namespace}.${key}`;                                  // :130  ← id 格式
  if ( data.type ) { ... data.type.label ??= data.label; data.type.hint ??= data.hint; }   // :140-145
  data.default ??= null;
  this.settings.set(data.id, data);                                 // :155  ← 存进 Map
  ...
}
```

- ⇒ `game.settings.settings.get("aeris-tokens.enableCombatMovementHistory")` 拿到的就是当时传进去的那个 `data` 对象
- ⇒ 它**不是** getter，`data.name = "..."` 直接赋值即可生效（这一点靠 `:127-130` 的写法佐证：同一对象上一直在写字段）
- ⚠️ **注意 `:142-144`**：如果该设置用了 `DataField` 类型，注册时会把 `label`/`hint` **同步一份到 `data.type` 上**。改顶层 `name`/`hint` 不影响已同步的那份，但渲染只读顶层，所以无碍。

### 2.2 设置界面渲染时现读 name / hint，并且过一次 i18n

`<FVTT安装目录>\resources\app\client\applications\settings\config.mjs`

```js
for ( const setting of game.settings.settings.values() ) {          // :66
  ...
  data.field.name = `${setting.namespace}.${setting.key}`;          // :115
  data.field.label ||= game.i18n.localize(setting.name ?? "");      // :116  ← 现读
  data.field.hint  ||= game.i18n.localize(setting.hint ?? "");      // :117  ← 现读
  const category = getCategory(setting.namespace);                  // :120
}
```

- ⇒ 覆盖 `setting.name` 后，**下次打开设置界面立刻显示中文**，不需要重载
- ⇒ 但会经过 `game.i18n.localize(...)`，见下方「三、两个未验证点」

### 2.3 子菜单是另一条路（颜色设置有独立入口）

`gridColor.ts:51` 用的是 `game.settings.registerMenu(...)`，它存进的是 `this.menus`（`client-settings.mjs:193`），**不是** `settings`。默认的主设置界面里那一行读的是菜单对象的 `name`/`hint`，所以**同名字段一样要覆盖，但要从 `game.settings.menus` 取**。

---

## 三、两个未验证点（动手前必须先实测，别当已知事实）

1. **`game.i18n.localize("纯中文串")` 返回什么？**
   - 预期：找不到这个键就原样返回（FVTT i18n 的常规行为），于是直接写中文串即可。
   - 风险：若返回空串或 `undefined`，界面会显示空白。
   - 实测方法：控制台 `game.i18n.localize("战斗中移动模式")`，看是否原样返回。
2. **`game.i18n.translations` 是否可写？**
   - 若可写，更规范的做法是注册翻译键再让 `name` 指向键（还能顺带被其他模块复用）。
   - 实测方法：`game.i18n.translations["LH.AERIS.TEST"]="测试"; game.i18n.localize("LH.AERIS.TEST")`。

**兜底策略**：方案 A（直写中文）若因 localize 出问题，立刻切方案 B（注册翻译键）；两者只差两行。

---

## 四、三条路线对比

| 路线 | 做法 | 优点 | 缺点 | 评价 |
|---|---|---|---|---|
| **A. 独立补丁模块** | 新写一个我们自己的模块，在 `init` 之后覆盖 name/hint | 不动 Aeris 源码；Aeris 升级不受影响；100% 是我们的 mod；只读操作、失败最多变回英文 | 多一个模块要装 | **推荐** |
| B. 改源码 fork | 改 `src/settings/*.ts` 里约 32 处 `name`/`hint`，重新 `vite build` 打包 | 顺带能修那几个 bug；只有一个包 | 每次 Aeris 升级都要重新构建；属于「改别人的作品再发布」需保留 LICENSE 与署名 | 仅在确定要修 bug 时才走 |
| C. 改 DOM | `Hooks.on("renderSettingsConfig")` 里替换界面文字 | 不需要碰数据 | 只改显示不改数据；设置搜索/其他 UI 读到的仍是英文；某次 FVTT 改模板就废 | 不推荐 |

---

## 五、路线 A 的实现骨架（补丁模块）

```js
// module.json 里 relationships.requires 声明依赖 aeris-tokens 与 lib-wrapper 可不写，纯顺序依赖用 init 相位即可
Hooks.once("init", () => {
    // 注意：必须在 aeris-tokens 注册完设置之后再覆盖。
    // 模块 init 相位按 modules 列表顺序执行，Aeris 在前、本模块在后即可；
    // 保险做法见下方 retry。
    translateAerisSettings();
});

// 更稳：init 之后延迟一拍，并用「设置项存在」作为成功判据
function translateAerisSettings() {
    const map = TRANSLATIONS;                       // 见第六节清单
    let hit = 0, miss = [];
    for (const [id, { name, hint }] of Object.entries(map)) {
        const s = game.settings.settings.get(id);   // id = "aeris-tokens.<key>"
        if (!s) { miss.push(id); continue; }
        if (name) s.name = name;
        if (hint) s.hint = hint;
        hit++;
    }
    console.log(`[aeris-cn] 已翻译 ${hit} 项设置` + (miss.length ? `，未找到 ${miss.length} 项（多半是 Aeris 改版改了键名）：` + miss.join(", ") : ""));
}
```

**要点**
- 用 `get(id)` 逐项取，**缺失就跳过并打日志**——不要假设 Aeris 的键名永远不变（它 v13 期间改过 manifest、加过设置）。
- 只写 `name`/`hint` 两个字段，**绝不碰 `default`/`scope`/`type`**，避免出现「补丁模块改了行为」这种最难查的问题。
- 想做得更保险：注册一个控制台入口 `window.aerisCN = { list: () => ..., apply: translateAerisSettings }`，出问题时能手动重跑。
- 子菜单（`Color Settings`）要单独处理：`game.settings.menus.get("aeris-tokens.colorMenu")`。

---

## 六、待翻译清单（约 32 项，来源：`src/settings/*.ts` grep 结果）

| # | key（`aeris-tokens.` 之后） | 英文原文 | 建议中文 |
|---|---|---|---|
| 1 | `moduleFunctionalityScopeOutOfCombat` | Out-of-Combat Movement Mode | 战斗外移动模式 |
| 2 | `moduleFunctionalityScopeInCombat` | In-Combat Movement Mode | 战斗中移动模式 |
| 3 | `enableDistanceLabelToken` | Show Distance Labels Above Tokens During Movement | 移动时在 token 上方显示距离 |
| 4 | `enableCombatMovementHistory` | Enable Movement History in Combat | 战斗中累计移动量 |
| 5 | `uncapExploration` | Uncapped Movement in Exploration Mode | 探索模式不限制移动距离 |
| 6 | `allowPathBeyondRange` | Allow Pathing Beyond Movement Range | 允许拖拽超出移动范围 |
| 7 | `autoPath` | Auto-Path Tokens During Movement | 自动寻路（直接找最短路径） |
| 8 | `enableOthersPreview` | Enabled Others' Token Previews | 显示其他玩家的移动预览 |
| 9 | `showOthersPaths` | Show Others' Grid Paths | 显示其他玩家的网格路径 |
| 10 | `othersAlphaMultiplier` | Others' Grid Path Alpha Multiplier | 他人路径透明度倍率 |
| 11 | `enableGridPainting` | Enable Grid Painting | 启用网格填色（关闭可能提升性能） |
| 12 | `gridFillActivePath` 等 7 个颜色项 | Grid Fill: Active Path / Reachable Area / Bonus Area / Invalid Area / Unreachable Area / Grid Stroke Color / Grid Accent Color | 当前路径填充 / 可到达区域填充 / 加成区域填充 / 超出范围填充 / 不可达区域填充 / 网格描边色 / 强调色 |
| 13 | `colorMenu`（registerMenu） | Color Settings | 颜色设置 |
| 14 | `enableGridSelectSound` | Enable Grid Selection Sound | 启用选格音效 |
| 15 | `gridSelectSound` | Grid Selection Sound | 选格音效 |
| 16 | `enableGridTravelSound` | Enable Grid Travel Sound | 启用移动音效 |
| 17 | `gridTravelSound` | Grid Travel Sound | 移动音效 |
| 18 | `moveCameraOnHold` | Move Camera on Token Hold | 按住 token 时移动镜头（需 Aeris Cinematic View） |
| 19 | `cameraPanPadding` | Camera Pan Padding | 镜头边距 |
| 20 | `scaleJumpFactor` | Token Jump Scale Factor | 跳跃放大倍率 |
| 21 | `tokenMoveSpeed` | Token Speed | 移动速度（秒/格） |
| 22 | `movementMultiplier` | Movement multiplier | 移动范围倍率 |
| 23 | `movementMultiplierKey` | Movement multiplier hotkey | 移动倍率快捷键 |
| 24 | `baseMovementOverride` | Base Movement Override | 基础移动力覆盖（0=读角色数据） |
| 25 | `fontImport` | CSS @import for your font | 字体 CSS @import |
| 26 | `fontFamily` | Font-Family name | 字体名 |
| 27 | `movementDataPathSetting.*` | （按 `movementPropertyPath.ts:21` 动态生成：walk/fly/swim/climb/burrow 等） | 移动力数据路径：步行/飞行/游泳/攀爬/掘地 |

> ⚠️ 上表是**按 grep 结果整理**，第 12、27 项的具体 key 拼写必须在动手时用 `game.settings.settings` 实际遍历核对（别照抄本表）。
> 快速核对脚本（控制台，纯文本顶格）：
> ```js
> Object.values(game.settings.settings).filter(s=>s.namespace==="aeris-tokens").map(s=>({key:s.key,name:s.name,scope:s.scope,config:s.config}))
> ```

---

## 七、动手时的检查清单

1. `game.i18n.localize("纯中文")` 实测（第三节未验证点 1）。
2. 遍历 `game.settings.settings` 拿**当前真实**的 key 清单，与本文件第六节对照，补齐/修正。
3. 覆盖后打开设置界面，逐项确认：中文显示、提示文字在、**开关仍能正常改值**（改一个再读 `game.settings.get` 验证）。
4. 记录「Aeris 升级后哪些 key 失效了」——补丁模块必须能容忍缺失（`miss` 数组 + 日志，不抛错）。
5. 版本三处同步（module.json / 头注释 / `window.__XXX_VER` 探针），本地 `node --check`，按既有惯例打包。

---

## 八、附：为什么这件事值得做在「我们的模块」里

- Aeris Tokens 的 32 个设置全是硬编码英文，没有走 i18n（原文件里写的是 `name: "Enable Movement History in Combat"` 而不是 `name: "AERIS.MOVEMENT_HISTORY.name"`），所以官方不会出中文。
- 中文化是**纯展示层**改动，风险极低；即便 FVTT 或 Aeris 改版导致某个键取不到，最坏结果也只是那一项显示回英文，不会影响功能。
- 与 `your-world-sync` 配合时注意：被翻译的只是界面文字，**设置的值（存进世界的那些 key）完全没变**，因此快照兼容性不受任何影响。
