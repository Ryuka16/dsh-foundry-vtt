# midi-qol otherActivity 机制 · 源码级结论

> **适用环境**：Foundry **13.351** / dnd5e **5.3.3** / midi-qol **13.0.55**
> **来源与证据等级**：
> - 【源码】= 对 `tposney/midi-qol` v13.0.55 / 13.0.65 与 `foundryvtt/dnd5e` release-5.3.3 的直接源码核查（外部核查者提供，本机无法克隆验证）
> - 【交叉】= **本机独立印证**（`foundry-mcp/dsh-foundry-vtt/src/` 的真实代码、用户导出的设置文件、本地 Changelog）
> - 【未闭合】= 仍有矛盾或无法核验，**不得当结论使用**
> **记录日期**：2026-09-15

---

## 0 · 一句话

`otherActivityId` **不是** dnd5e 核心字段，是 **midi-qol 注入**的。
所以不存在「核心 vs midi 谁说了算」的冲突 —— 只有**一套**机制：**主活动指向子活动**。

---

## 1 · 字段归属

- 【源码】dnd5e **4.0.x – 6.0.x 全部 activity schema 都没有** `otherActivityId`。核心唯一「活动引用活动」的机制是 **Forward 活动**（`module/data/activity/forward-data.mjs` 的 `activity.id`），方向同样是「引用方 → 被引用方」。
- 【源码】`otherActivityId` 由 midi 注入，定义在 `src/module/activities/{Attack,Check,Save,Utility}Activity.ts` 的活动 schema **顶层**。
- 【交叉】本机 `foundry-mcp/dsh-foundry-vtt/src/reference.ts:143` 写的是「attack.otherActivityId=\"dnd5eactivity100\" + save 活动 + 物品顶层 effects」；`:150` 写的是「attack 活动必须设 otherActivityId 指向 save 活动」——**工具自己的模板就是主→子**。

## 2 · 绑定方向：**主 → 子**

- 写在**主活动**顶层，值 = **被引用子活动**的 id（或 identifier）。
- **只有 4 类能当「主」**：`attack` / `check` / `save` / `utility`。
  Changelog:1246 明确「Remove otherActivity setting from summons, cast, damage, forward, enchant and heal activities」。
- 【交叉】`src/minimal.ts:1343-1344` 的 verify 逻辑是 `attackAct.otherActivityId !== saveAct._id → problems.push(...)` ⇒ 运行期语义确认为**主→子**。

## 3 · 默认值（★ 最关键的一条）

| 活动类型 | `otherActivityId` 默认值 | 含义 |
|---|---|---|
| `attack` | `""`（空串） | **自动探测（auto）** |
| `check` / `save` / `utility` | `"none"` | 不绑定 |

- 【源码】运行期解析在 `MidiActivityMixin.ts` 的 `get otherActivity()`：
  - `""` → **自动探测**（只认**唯一**的 compatible 候选）
  - `"none"` → 无
  - 其余 → `activities.get(id)`；找不到再按 identifier 反查 —— **这一步不看兼容标记**

> ⇒ **attack 的默认值是 `""`（auto），这是最容易咬人的地方**：只要 item 上还存在另一个「合格 + compatible」的活动，它就会被自动绑到攻击上。

## 4 · `otherActivityCompatible` = 资格标记（写在**子**身上）

- 【源码】位于 `MidiActivityMixin.ts` 的 `midiProperties` schema，`initial: true`（**默认 true**），v13.0.55 的 `MidiActivityMixin.ts:186`。
- **只卡两处**：编辑期的下拉、以及**自动探测**。**显式填了 id 就不看它。**
- 【源码】双重门槛 = `possibleOtherActivity`（类型）**且** 兼容开关：
  - `= true`：`damage` / `heal` / `save` / `check` / `utility` / `contested-check`
  - `= false`：`attack` / `enchant` / `summon` / `cast` / `forward` / `overtime` / `transform`
- Changelog:1240 原文印证：「activities must be marked as Other Activity Compatible for the activity to be used as an otherActivity」

> ⚠️ **对本库旧结论的归因修正**：`FVTT-monster-spec-v2_1.md:18/:54` 把「同 item 双份伤害」归因于 `otherActivityCompatible` 默认 true。
> `otherActivityCompatible` 只是**资格**；真正触发连带的是**主活动的 `otherActivityId` 为空串**（attack 的默认值）。
> **现象是对的（实测确实双份），归因要改。**

## 5 · 「自动合并行动」设置：13.0.55 里**已不存在**

- 【源码】它是 v12.4.0 / 12.4.1 时代的 `autoMergeActivityOther`（"Auto merge other activity for Midi Attack Activities (Requires Reload)"）；到 **12.4.31** 与 **13.0.55** 源码中**已无注册，只剩 i18n 文案残留**。
- 【交叉·实测】用户导出设置 `fvtt-midi-qol-settings.json`（1765 行 / 45.1 KB，`flags.exportSource` 明写 `midiVersion: "13.0.55"`）：
  - 全文搜 `otherActivity` → **0 命中**
  - 全文搜 `merge` → 只有 5 处，全是 `mergeCard / mergeCardCondensed / mergeCardMulti / mergeCardMultiDamage`（**聊天卡**合并，与行动无关）
  - ⇒ **印证：不存在这个开关。**

## 6 · 弹窗规则（`MidiActivityChoiceDialog`）

- 【源码】候选筛选 = `canUse !== false && !riders.includes(id) && !midiProperties.automationOnly && !inProgress`
- **0 个候选 → 跳过；1 个 → 直接用；≥2 个 → 必弹。** 没有任何设置能参与。
- 想避免弹窗：给子活动标 `automationOnly: true`（它从候选里消失），而主活动的**显式** `otherActivityId` 仍能调用它。

## 7 · 双份伤害的确切机制

- 【源码】`MidiActivityMixin.rollDamage`：先 `if (this.hasDamage || this.hasHealing)` 掷**主活动自身**伤害（`super.rollDamage` → `setDamageRolls`），随后 `if (this.otherActivity)` 走 `rollOtherDamage()`（→ `setOtherDamageRolls`）。
  ⇒ attack 有伤害 + save 子活动也有伤害 = **命中后主伤害照算，再按豁免结果结算子伤害，两份伤害、两次独立判定**，卡片上两组骰。
- 要「要么命中、要么豁免」的**一份**伤害 → 标准做法是 **attack 活动不填伤害**，伤害全放子活动（Changelog:1772）。
- Dragon Slaying 武器就是叠加模型（Changelog:1771）。

## 8 · `useConditionText` 求值时机与可用变量

- 【源码】子活动的 useCondition 在 `buildOtherDamageMatches()` 里，对**命中集合**（attack 主活动 = `hitTargets ∪ hitTargetsEC`；非 attack = 全部 `targets`）逐目标用 `evalActivationCondition` 求值**一次**，结果缓存在 `workflow.otherDamageMatches`。
  空条件 = 全部匹配；全被过滤 = 子伤害不掷。
- 若子活动有 `consumption`，延迟到消耗确认后（`rollDeferredOtherDamage`）。
- 可用变量 = `createConditionData()` 的完整 rollData：
  `@target`（含 `.saved` / `.failedSave` / `.superSaver` / `.isHit` / `.raceOrType` / `.items` …）、`@targetUuid`、`@w` / `@workflow`、`@activity`、`@item`、`@raceOrType` / `@typeOrRace`、`@items`、`@worldTime`、`@options`、`@damageTypes`、`@isAttuned`、`@humanoid`、`@canSee` / `@canSense`。

## 9 · F12 抓取（一次拿全）

```js
const msg = [...game.messages].reverse().find(m => m.flags?.["midi-qol"]?.messageType);
const wf  = msg ? MidiQOL.Workflow.getWorkflow(msg.uuid) : null;
if (wf) console.log({
  main:        wf.activity?.name,
  mainId:      wf.activity?._id,
  mainOtherId: wf.activity?.otherActivityId,      // "" = auto, "none" = 不绑
  other:       wf.otherActivity?.name,            // ★ getter，直接是活动对象（不是 {activity:{...}}）
  mainDamage:  wf.damageRolls?.length,
  otherDamage: wf.otherDamageRolls?.length,
  hit:         [...wf.hitTargets].map(t => t.name),
  failed:      [...wf.failedSaves].map(t => t.name),
  otherMatched:[...wf.otherDamageMatches].map(t => t.name)   // useCondition 过滤后真正生效的子伤害目标
});
```

字段：`wf.activity`（本次实际执行的主活动）、`wf.otherActivity`（**getter**，= `activity.otherActivity`，被绑定结算的子活动）、`wf.damageRolls` / `wf.otherDamageRolls`（主/子伤害 Roll 数组）、`wf.hitTargets` / `wf.failedSaves` / `wf.superSavers`、`wf.otherDamageMatches`。

---

## 10 · 本机工具（`foundry-mcp/dsh-foundry-vtt`）的对应 bug ★ 待修

- **`src/minimal.ts:1004`**：`otherActivityId: hasSave ? SAVE_KEY : ''`
  ⇒ **没有 save 时，attack 的 `otherActivityId` 落成空串 = midi 的 auto 探测**
  ⇒ item 上任何「合格 + compatible」的活动（**`utility` 也在合格名单里**）都会被自动绑到攻击上 ⇒ **点一次攻击就连带别人的豁免与伤害**。
  ⇒ **这就是《铁棺》那次「点斩自动骰豁免、没过又额外吃炮击伤害」的确切机制。**
  ⇒ 建议改为 `otherActivityId: 'none'`。
- **`src/minimal.ts:1150`**：`linkedTo` 的 schema 描述写「让它成为某个活动的后续触发 —— 填那个活动的 name，本活动会被指向它（otherActivityId）」
  ⇒ 读起来像「写在**子**活动上」（子→主），容易把人带反。
  实际实现（`src/minimal.ts:185-191` `common.otherActivityId = target`）是**当前活动 → 目标活动**，即**主→子**。
  ⇒ 建议文案改为：「**主活动**用：填**被引用子活动**的 name，本活动的 `otherActivityId` 会指向它（方向：主 → 子）。」

## 11 · 未闭合（不得当结论）

- 【未闭合】《铁棺》「点**变形**（utility）也要过豁免，没过不给变」—— 源码说 `utility` 默认 `"none"`，理论上不该连带。**尚未解释**（需要在同类物品上用第 9 节探针实抓）。
- 【未闭合】`automationOnly: true` 到底是「**仅自动化、不可手动使用**」（本地资料库 `(已瘦身)自动化指北——哪些自动化需要用到什么？.md:1875`）还是「**只从『选择活动』弹窗里藏掉**」（源码候选筛选 `!midiProperties.automationOnly`）。**两说并存，不选边。**
- 【未闭合】v12 `autoMergeActivityOther` 的默认值无法核验（源码已移除，只剩文案）。

## 12 · 对本团的直接结论

- **《挽歌》`Item.FTVO5Z2r5B98Yl0H`**：斩 `TCegmZU7uyhXC5t1` 与 裂弦 `elegyBurst000001` 都写 `otherActivityId: "none"` ⇒ **这是必需的，不是保险**。
  若留空串，midi 会把唯一的 compatible 候选（裂弦）**自动绑到斩上**。
- **1 个 item 上放多个活动，不再必须拆 item** —— 只要把**每个**活动的 `otherActivityId` 显式写成 `"none"`。
  ⇒ 这一条**修订** `FVTT-monster-spec-v2_1.md:18/:54` 的「必须拆成独立 item」硬规则：那条规则成立于**默认值**前提（attack 落空串 ⇒ auto ⇒ 连带），**显式写 `none` 后即可共存**。
  ⇒ ✅ **已于 2026-09-15 实机验证通过**：《挽歌》（attack + save 同 item）—— 点斩不带豁免、点裂弦不带攻击、**不弹「选择活动」**、伤害不串、DC 正确（= 8 + 熟练 + 力）。
  ⇒ ⚠️ 本次只验了 `attack` + `save` 两个活动的组合；`utility` 参与的连带仍无解释（见 §11）。
