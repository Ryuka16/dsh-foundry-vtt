# 血的教训 · CPR 脱钩与消耗目标篇

> 来源：2026-09 实战会话（给 `dnd5e_classpack` 的 48 个自选专长做自动化，并与 CPR 彻底解耦）
> 全部结论均为**本世界实测**得到，非 wiki 转述。凡未实测的都在文末「未验证清单」里标出。
> 一句话：**CPR 认物品靠的是它自己那条记载（flags），不是名字；而挡它必须同时断掉「界面」和「运行」两条链。**

---

## 〇、只读十条（最贵的）

1. **CPR 有两条独立链路，挡住必须两条都断** —— 只断一条 = 界面没了但运行时照跑，或反之。
2. **`flags.chris-premades` 整条删掉，才是「让 CPR 认不出这是我们/不是它的东西」的干净做法**（语法 `{'flags.-=chris-premades': null}`）。
3. **「自动化已过期」有两个完全不同的原因**：① macros 引用了不存在的宏 ② 物品版本号比宏库里的旧。**两者都不能只改一半。**
4. **批量删除脚本禁止用「物品名」当判据** —— 原件与副本同名的场景下必然误伤（本会话因此误删 17 个 CPR 官方原件）。
5. **凡是批量写/删，必须先跑 dry-run 输出清单让用户过目**，再执行。
6. **克隆物品时 `consumption.targets` 里的 UUID 不会自动重指向副本** —— 这是「找不到耗用项」的头号根因。
7. **消耗目标优先写 identifier，不要写 UUID**（`_remapConsumptionTarget` 会把 identifier 原地改写成真实物品 id）。
8. **`actorLink:false` 的 token 必须用 `token.actor`（合成 actor）读** —— 只扫 `game.actors.contents` 会漏掉真实现场。
9. **`window.chrisPremades.macros` / `legacyMacros` 是「以 identifier 为键的对象」，不是数组** —— 键名就是 identifier。
10. **CPR 自己源物品的效果名是英文，且不在翻译表里** —— 这就是「CPR 改完是英文」的根源；改名是安全的，因为它按 identifier 找效果。

---

## 一、CPR 的两条独立链路（挡住必须两条都断）

CPR 判断「这个物品归不归我管」，走的是两套完全独立的机制：

| 链路 | 看什么字段 | 决定什么 |
|---|---|---|
| **医药箱显示** | `flags.chris-premades.info.identifier` | 医药箱显示什么颜色 / 什么文案 / 有没有「更新」按钮 |
| **运行时真跑不跑** | `flags.chris-premades.macros.midi.item` / `.midi.actor` 里引用的 identifier | midi 事件宏会不会被调起来 |

- 只改 `info.identifier` ⇒ 界面显示变了，但**运行照跑**。
- 只删 `macros` ⇒ 运行停了，但医药箱仍显示一个状态（甚至带更新按钮）。
- **两条一起断（整条删）才是真脱钩。**

实测出处（CPR 1.5.15，`modules/chris-premades/dist/main.js`，2,164,749 字节 minify）：
- `getIdentifier: function(e){ return e.flags?.["chris-premades"]?.info?.identifier }`
- `let r = i.flags?.["chris-premades"]?.macros?.midi?.item ?? []`
- 查宏唯一入口：`macroUtils.getMacro(identifier, rules)`

---

## 二、「自动化已过期」的两个完全不同的原因

医药箱那句「自动化已过期」，实测有两个互不相干的成因：

### 原因 A · 引用了不存在的宏（悬空引用）
- 状态：物品上有 `info`（有编号），`macros` 里引用了一个 **CPR 宏库里查不到的 identifier**。
- 复现方式：只把 `info.identifier` 改掉（比如加 `lh-` 前缀）却**没处理原本挂在物品上的 `macros.midi.*` 引用** ⇒ 变成「配备过自动化、但那个宏找不到」。
- 现象：医药箱显示「**自动化已过期**」（带更新按钮）。
- 解法：删掉 `macros` 子键（只删这一层，`info` 可以保留）。
  - 语法：`{'flags.chris-premades.-=macros': null}`

### 原因 B · 版本号「比宏库旧」（最容易被忽略）
- 状态：物品上 `info.version` 比 CPR 宏库里同名宏的版本旧。
- 判定逻辑：`foundry.utils.isNewerVersion(macroVersion, itemVersion)` 为真 ⇒ Medkit 返回 `0` ⇒ 红 / 「自动化已过期」。
- **实测数据**：本世界的战技副本 `info.version = "0.0.0"`，而 CPR 宏库里 `maneuversParry` / `superiorityDice` = `1.1.0`（部分战技 `1.3.55`）⇒ 21 个我们建的副本全被判过期。
- **根因**：这些副本是**从 CPR 官方源物品克隆**的，把官方的 `flags.chris-premades.info`（官方编号 + `version: 0.0.0`）一并带了过来。而官方编号在宏库里真实存在 ⇒ 不是「找不到宏」，而是「宏比物品新」。
- **危险**：过期状态带一个「更新」按钮；一旦点了，CPR 会用**它模块自带官方源物品**重建，把我们的活动 / 消耗 / DC 公式 / 描述全部冲掉。

### 三种状态的对照（实测）

| 物品状态 | 医药箱显示 |
|---|---|
| 无 `flags.chris-premades` | **未找到自动化**（无更新按钮）← 这是我们想要的状态 |
| 有 `info`、无 `macros` | 「未找到自动化」或对应状态，取决于编号能否查到 |
| 有 `info` + `macros` 悬空 | **自动化已过期** |
| `info.version` 比宏库旧 | **自动化已过期**（即使没有 macros） |
| 版本一致 + 有 macros | 绿（CPR 自动化就绪） |

> ⚠️ 用户实测锚点：把「幸运」的编号改成 `lh-lucky` 后，医药箱显示「**未找到自动化**」⇒ 证明 **CPR 不会按物品名兜底匹配**。

---

## 三、彻底脱钩：删整条 flags.chris-premades

**做法**（对每个物品执行一次）：
```js
await doc.update({ 'flags.-=chris-premades': null });
```

**效果**：
- `getIdentifier` 返回 `undefined` ⇒ 医药箱显示「未找到自动化」+ **无更新按钮**
- 没有 `macros` ⇒ 运行时不跑
- `info` / `config` 等一并消失（需要时可原样写回，见备份）

**为什么不用「只把 version 改成和宏库一致」**：那会显示**绿**，等于告诉 CPR「这个自动化归你管」，既误导，又仍留着它的官方编号 —— 哪天谁点了配置，照样被冲。

**旁证**：CPR 自己的官方源物品 `Heavy Armor Master` 的自然状态就是「只有 `info`、没有 `macros`」⇒ 删 `macros` 是它的正常形态，不是破坏。

**本次执行结果**（可复盘）：
- 正确摘除 **34 件**（我们做的全部：11 个 feats-all 专长 + 1 个 BackgroundFeature + 16 个 class-abilityphb 副本 + 木桩 4 件 + 测试角色 2 件）
- 超魔法（10 项 + 术法点，用户指定交给 CPR）**一字未动**
- 其余 106 件 CPR 官方物品未动
- 复查：`oursStillWithCPR: 0` / `missingOriginals: 0`

---

## 四、⚠️ 批量删除脚本的铁律（本会话真实事故）

### 事故
给「批量摘除 CPR 记载」写脚本时，判据里加了一条**按物品名匹配**（名字含「战技: 」「卓越骰」）。
而 **CPR 官方的 15 个战技原件和原版卓越骰，与我们的副本完全同名** ⇒ 被一并扫入删除，**误删 17 个 CPR 官方原件**。

### 后果范围
只是摘掉了它们身上的 `flags.chris-premades` ⇒ 医药箱不再显示「可更新」；**物品本身的数据 / 活动 / 效果未受影响**。

### 恢复
改前值都在脚本返回值里 ⇒ 17 个用原值 `{"info":{"identifier":"…","source":"chris-premades","version":"0.0.0"}}` 原样写回，逐条读回验证 `17/17`。

### 铁律（写进流程）
1. **批量删除脚本禁止用「物品名」当判据** —— 原件与副本同名时必然误伤。
2. **只用「我们独有的标记」判据**：
   - `flags['lh-ma']`（副本溯源标记）
   - `flags['longhua-feats']`（自选专长标记）
   - 或**显式 id 白名单**
3. **先跑 dry-run，把清单交给用户过目，再执行。** 本会话跳过了这一步，是犯错的直接原因。
4. **执行前把「改前全量值」留在返回值里** —— 出事时这就是唯一的救命绳。

---

## 五、consumption.targets 克隆陷阱（「找不到耗用项」头号根因）

### 现象
```
DND5E.CONSUMPTION.Warning.MissingItem = 无法找到由行动 {activity} 配置在物品 {item} 上的耗用项。
```

### 根因
**克隆物品时，`consumption.targets` 里写死的 UUID 不会自动重指向副本。**
实测：15 个战技副本每个活动的消耗都写着
```json
[{ "type": "itemUses", "value": "1",
   "target": "Compendium.dnd5e_classpack.class-abilityphb.Item.etA1oLtnnD27jna2" }]
```
`etA1oLtnnD27jna2` 是**战斗大师原版那枚骰子**；而玩家拿到的是副本（identifier `superiority-dice-martial-adept`）⇒ 永远对不上。

### 解法：写 identifier，不写 UUID
```json
[{ "type": "itemUses", "value": "1",
   "target": "superiority-dice-martial-adept" }]
```
路径写法（整数组替换，别用下标）：
```js
upd['system.activities.' + a.id + '.consumption.targets'] = [ /* 新数组 */ ];
```

### 机理（实测）
- `Activity.prototype._remapConsumptionTarget(target)`：
  - UUID 形式走 `actor.sourcedItems.get(target)`（按来源）
  - **非 UUID 串走 `actor.identifiedItems.get(target)`（按 identifier）**
  - 命中后**原地改写**成真实物品 id
- 硬证据：临时角色上直接调用 ⇒ `mapped = "WYR32lmWgy80hCMs"`（真实物品 id）、`mappedIsRealItem: true`；而喂原 UUID 进去 ⇒ `oldUUIDResolves: false`。
- 「消耗不足，需要 N」= 已成功找到物品、只是可用次数不够（与 MissingItem 是两回事）。

### 判据纪律（本会话吃过一次亏）
改消耗时**只判「活动有没有 itemUses 消耗」是不够的** —— 必须同时判「这是不是该改的那一类物品」。
本会话曾因此把超魔法（升阶 3 点 / 谨慎 1 点）也改成了「扣 1 颗卓越骰」，靠改前记录才全部回滚。

---

## 六、token delta 陷阱（`actorLink:false`）

### 现象
扫描「某角色身上有没有某个物品」时得到空结果，但用户明明在地图上那个 token 上测过。

### 根因
地图上的 token 若 `actorLink: false`（未链接），它**自带一份 `delta`**，合成出来的 actor 与侧边栏那个母版 actor **不是一回事**。
只扫 `game.actors.contents` 会**漏掉真实现场**。

### 正确读法
```js
const syn = token.actor;          // 合成 actor，带 delta
syn.items.contents                // 这里才是这个 token 真正有的物品
```

### 另一个坑：id 可能对不上
实测同一件物品，`token.toObject().delta.items[]._id` 与合成 actor 上的 `item.id` **可能不一致**（读到过两个不同的值）。
⇒ **改动一律「现列现改」**：先遍历合成 actor 找出目标，拿到当时的 id 立刻改，不要依赖提前记住的 id。

### 改回写
对合成 actor 的 embedded item 做 update，会正确写回 token 的 delta：
```js
await syn.items.get(id).update({ /* … */ });
```

---

## 七、CPR 宏库的真实结构（探针报 0 的坑）

### 形状（实测）
```js
window.chrisPremades.macros        // Object，575 个键
window.chrisPremades.legacyMacros  // Object，1074 个键
window.chrisPremades.customMacros  // Function（注册入口，不是数据）
// 去重后共 1394 个 identifier
```
- **键名就是 identifier**；值里**不一定**有 `identifier` 字段。

### 反面写法（会静默得到 0）
```js
Object.values(macros).filter(x => x.identifier)   // ✗ 拿到 0 条，因为值里没有 identifier
```
### 正确写法
```js
for (const k of Object.keys(window.chrisPremades.macros)) { /* k 就是 identifier */ }
```

### 查宏的唯一入口
```js
window.chrisPremades.utils.macroUtils.getMacro(identifier, 'legacy' | 'modern')
```

### 实测对照
```
sorceryPoints / empoweredSpell / distantSpell / heightenedSpell / carefulSpell
lucky / martialAdept / strikeOfTheGiants / superiorityDice / maneuvers*   → 全部 FOUND
lh-lucky / lh-martial-adept / lh-strike-of-the-giants                     → 全部 NOT_FOUND
```
⇒ 证实：加本地前缀「挡住」是**有效的**，而且是**完全可逆**的（CPR 宏库里的原宏一个没动）。

---

## 八、CPR 的「英文名」根源与安全汉化法

### 现状拆解
| 层面 | 语言 | 说明 |
|---|---|---|
| 医药箱界面 / 弹窗 / 配置项 | **中文** | 走 CPR 的 i18n（`CHRISPREMADES.*`，宏文案 390 条键 + 整套 Medkit 界面），已汉化 |
| CPR 宏产生的提示 | **中文** | 同上（例如 `CHRISPREMADES.Dialog.Use` 用物品名格式化） |
| **CPR 自己源物品的效果名** | **英文** | **不在翻译表里** ⇒ 「CPR 改完是英文」的真正来源 |

### 为什么改名安全（逐条实测）
- **双持客**：其宏用 `getEffectByIdentifier(actor, "dualWielder")` 找效果 —— 靠**编号不是名字**；而编号存在效果自己的 `flags["chris-premades"].info.identifier` 里 ⇒ 与 `name` 无关。
- **重甲大师**：**根本没有宏**（宏库里只有 name / version 两行），效果是纯 AE ⇒ 改名无影响。
- **神射手**：宏体 532 字符读全，只改 `activity.attack.bonus` 和伤害公式，**完全不引用效果** ⇒ 改名无影响。

### 本次已汉化（三处）
| 物品 | 原效果名 | 现效果名 |
|---|---|---|
| 双持客 `FxqzGF7L6pkO21sD` | `Dual Wielder` | 双持客：双手持械时 AC +1 |
| 重甲大师 `NNZtbgPBPfGsCUOB` | `Heavy Armor Master` | 重甲大师：着重甲时非魔法钝击/穿刺/挥砍 −3 |
| 神射手 `pse4sD7e9JsbIMgG` | `Sharpshooter - Range Adjustment` | 神射手：射程与掩体调整 |

### ⚠️ 唯一风险
**别在医药箱里点「配置」** —— CPR 的配置是用**它模块自带的官方源物品**重建，源物品里的效果名还是英文，一点就变回去。现在这三个是「绿」（版本一致），医药箱不出「更新」按钮，不主动动它就一直是中文。

---

## 九、包是「模块包」还是「世界包」—— 决定换世界跟不跟

查法：
```js
pack.metadata.packageType   // 'module' | 'world' | 'system'
pack.metadata.path          // 物理路径，一眼看出归属
```
- `module` ⇒ 路径形如 `modules/<模块id>/packs/<包名>` ⇒ **所有世界共用同一份** ⇒ 改一次，换世界也在。
- `world` ⇒ 只有那个世界有 ⇒ 换世界不跟。

**实测**：`dnd5e_classpack`（标题「DND5E不全包」，v4.4.0）是**模块**，21 个包的 `packageType` 全是 `module`，路径 `modules/dnd5e_classpack/packs/*` ⇒ **跨世界共享**。

### 由此带出的真风险
我们的东西（48 个自选专长 / 16 个战技副本 / 汉化）**全部写在这个别人的模块包里** ⇒ **玩家哪天点模块更新，这些会一起被冲掉。**
⇒ 建议：**更新前把服务器上的 `Data/modules/dnd5e_classpack/` 整个文件夹复制留底**，更新后对比。

---

## 十、未验证清单（动手前先确认）

1. **CPR 的 `getAllAutomations(item, {identifier, rules})` 到底按什么匹配** —— 该函数在 minify 后的包里被改名，拿不到实现。已知：不按物品名兜底（用户实测）；是否按 `system.identifier` 兜底**未验证**。
2. **真人点战技 → 扣骰子这条完整路** —— 已验证到「消耗指向正确、能被 `_remapConsumptionTarget` 解析到真实骰子」，但真人点击那一步未跑满全程。
3. **`cp.macros.midi.item` 之外是否还有别的运行入口** —— 本次只覆盖 `midi.item` / `midi.actor` 两种槽位；发现过**顶层 `item` 槽**（`dualWielder` 宏的 `m.item` 就是数组，与 `midi` 并列），该槽位的运行语义未完全验证。
4. **CPR 医药箱「配置」的完整写入范围** —— 已知会用官方源物品重建并主动删掉 `flags.midi-qol.onUseMacroName`，但保留 `name` / `system.description.value`；其余字段的取舍未逐项验证。

---

## 附：本次涉及的物品 / 编号速查

- 我们的 48 个自选专长包：`dnd5e_classpack.feats-all`（+ `BackgroundFeature` 1 个）
- 战技副本所在：`dnd5e_classpack.class-abilityphb`，文件夹「战技（战技专家）」
- 卓越骰副本：`k1E8EVHKGmgJvO2a`（identifier `superiority-dice-martial-adept`）
- 战技专家专长：`TwtHsbSo6b7vZAwB`（ItemChoice pool=15 + ItemGrant 卓越骰）
- CPR 宏库：1394 个 identifier（新版 575 / 旧版 1074）
- 备份产物：`99_临时草稿\_CPR全量摘除-改前备份与事故记录.json`、`99_临时草稿\_CPR悬挂引用-改前备份.json`
