# LH 建卡器 · 规格与重建说明（v1）

> 日期：2026-10-06 傍晚｜用途：给 `dnd5e_classpack` 建全职业/子职/种族/背景的 20 级验收卡
> **宏**：`Macro.YQXp7MD4MgFLHJ93`｜名 `LH建卡器 v1 · 全职业子职种族背景20级`｜**4466 字符**
> ⚠️ **源码尚未落盘**（v1 全文只存在于世界内宏）。换世界期间不可用 —— **换回后第一件事：`foundry_get_entity` 读该宏全文并落盘为 `LH建卡器-v1源码.js`**。本文件是「万一丢了也能重建」的规格。

---

## 一 · 用法

```js
game.macros.get("YQXp7MD4MgFLHJ93").execute();   // ★ 不要 await（宏在后台跑，不受 relay HTTP 超时限制）
```
| 用途 | 变量 |
|---|---|
| 中断 | `game.__建卡stop = true` |
| 进度 | `game.__建卡.进度` |
| 结果 | `game.__建卡` + JournalEntry「LH建卡结果」的 flag |
| 外部塞队列 | `game.__建卡队列 = [{k, id, n, 职id}]`（为 null 时自动构造全量） |

**队列项格式**：`k` ∈ `class` / `subclass` / `race` / `background`；`id` = 包内文档 id；`n` = 名称；`职id` = 子职专属（指向所属职业物品 id）。

**产出**：Actor 文件夹 **「LH验收卡」**，命名 **`LH验收·<名称>`**。

---

## 二 · 建卡主流程

```js
// 1. 建角色
const 角 = await Actor.create({ name: "LH验收·" + 名称, type: "character", folder: 验收卡文件夹id, system: { abilities: {...} } });

// 2. 装包内文档（必须 toObject()；getDocuments() 拿到的才是对象，getIndex() 只有索引）
await 角.createEmbeddedDocuments("Item", [包内文档.toObject()]);

// 3. 对 class item 设等级
await 职业物品.update({ "system.levels": 20 });

// 4. 跑 advancement（见第三节）
```

**⚠️ 读包必须用 `getDocuments()` 不能用 `getIndex()`**：`getIndex()` 的条目字段是 **`_id` 不是 `id`**（临时脚本用 `x.id` 会得 undefined），且**拿不到 `activities`/`advancement`**（首条只有 `source, identifier`）。

**实测读包耗时**：feats-all 121 条 374ms｜racial-traits 441 条 1506ms。

---

## 三 · ★ advancement 应用 API（源码级，实测有效）

**读 advancement 必须用 `d.toObject().system.advancement`** —— `d.system.advancement` 是 `AdvancementCollection`，`Object.keys()` 恒为 0。
Collection 可用：`.size` / `.contents`（数组）/ `.get()` / `.forEach()` / `.values()`。

| 类型 | 正确调用 | 踩过的坑 |
|---|---|---|
| **ItemGrant** | `await adv.apply(level, {}, { initial: true })` | ✗ `apply(20)` / `apply(20, {})` ⇒ 返回 0 件。**关键在第三个参数 `initial: true`** |
| **Trait** | `const au = await adv.automaticApplicationValue(lv, { initial: true }); if (au) await adv.apply(lv, au, { initial: true })` | 直接 apply 会因为 `keys` 为空而 `return` |
| **HitPoints** | **逐级**：`for (let L = 1; L <= 20; L++) await adv.apply(L, {}, { initial: true })` | ✗ `apply(20, {}, {initial:true})` ⇒ HP 0/0 |
| **Subclass** | `await sb.apply(3, { uuid: "Compendium.dnd5e_classpack.subclass.Item.<id>" }, {})` | ★ **不能带 `initial`** —— `if (options.initial) return;` 直接返回；且必须传 `uuid` |
| **ScaleValue** | **不用调**（`apply(level, data, options) { }` 是空函数） | — |
| **AbilityScoreImprovement** | `await as.apply(lv, { type: "asi" }, { initial: true })` | — |
| **ItemChoice** | 内部调 `super.apply` ⇒ 走 ItemGrant 逻辑 | 见 `血的教训-建卡与升级授予篇.md` 第二节 |

**源码原文（关键三处）**：
```js
// Trait
async apply(level, data, options={}) {
  if ( options.initial ) data = await this.automaticApplicationValue(level, {initial:true});
  const keys = data.chosen ? data.chosen : data.key ? [data.key] : null; if (!keys) return;
// HitPoints
async apply(level, data, options={}) {
  if ( options.initial ) { if ((level===1) && this.item.isOriginalClass) data[level]="max"; else if (this.value[level-1]==="avg") data[level]="avg"; }
// Subclass
async apply(level, { retainedData={}, uuid }={}, options={}) {
  if ( options.initial ) return;
```

---

## 四 · 实跑数据（2026-10-06 17:35 点火）

```
队列 391 项：class 14 ｜ subclass 122 ｜ race 170 ｜ background 85
速度：约 15 秒/张 ⇒ 391 张 ≈ 1.7 小时
子职按职业：druid 7 / cleric 15 / rogue 9 / warlock 9 / ranger 8 / fighter 10 / monk 10 / artificer 4 /
            sorcerer 8 / barbarian 10 / bard 9 / paladin 9 / wizard 14（血猎手无子职）
职业 advancement 数：德鲁伊35 游侠34 圣武士34 奇械师32 魔契师32 吟游诗人32 牧师31 武僧30
                    游荡者28 野蛮人27 战士24 术士23 法师17 血猎手25
```
**验证样本（3 张零错误）**：`LH验收·职业-战士 Fighter` 物8 adv20｜`LH验收·子职-奥法骑士` 物15 adv26｜`LH验收·种族-提夫林(飞翼)` 物12 adv25

**战士 L20 + 奥法骑士卡最终 15 件**：战士 Fighter / 战斗风格 / 回气 / 动作如潮 / 武术范型 / 替换武术 / 额外攻击 / 不屈 / 奥法骑士 / 施法（奥法骑士）/ 武器联结 / 战争魔法 / 秘法打击 / 秘法冲锋 / 精通战争魔法
**与 PL 贝瑟（L3）对照**：贝瑟有的 8 件全部对上；卡上多的 7 件（替换武术 L4+、额外攻击 L5+、不屈 L9+、战争魔法 L7+、秘法打击 L10+、秘法冲锋 L15+、精通战争魔法 L18+）全是 3 级不该有的 ⇒ **等级驱动自动授予这条链是通的**。

**⚠️ 已知现象**：卡名会带职业后缀（`LH验收·职业-战士 Fighter`）—— 因为 `Actor.create` 直接用了包内文档名。

---

## 五 · 建卡后发现的问题（都在包侧，已修或待修）

| # | 现象 | 根因 | 状态 |
|---|---|---|---|
| 1 | 龙枪两背景专长/技能一件不给 | `advancement` 空壳（只有 `{"level":0}`，无 `type`/`_id`） | ✅ 已补 |
| 2 | 变体特性两个都给 | `ItemGrant.optional` 全 false | ✅ 5 个背景已改 |
| 3 | 引导神力「找不到耗用项」 | `consumption.targets` 写死 uuid 而卡上装的是同名另一件 | ✅ 23 件改 identifier |
| 4 | 替换武术重复 5 个 | 同一 uuid 跨 5 级各授一次 | ✅ 已清；**真解是 ItemChoice 替换级（待做）** |
| 5 | 战斗风格永远换不了 | 6 处 ItemChoice `replacement: false` | ⏳ **晚上做** |

**⚠️ 批量 API 建的卡会「僵尸化」**：`actor.items.get(id)` 说存在，`update()`/`delete()` 报 `Item "xxx" does not exist!`，两条删除路径都失败。**要改就改包，改完重拖；别在老卡上耗时间。**

---

## 六 · 重建清单

1. 复刻宏体：`Actor.create` → `createEmbeddedDocuments` → `update({system.levels})` → 按第三节逐类型跑 advancement
2. 建 Actor 文件夹「LH验收卡」
3. 队列构造：遍历 `classes-new`(14) + `subclass`(122) + `races-item`(170) + `BackgroundList`(85)，用 **`getDocuments()`** 取 `id` 与 `name`
4. 断言：每张卡建成后读回 `items.size`，**< 8 件视为异常**（正常最少 12 件）
5. 结果同时写 `game.__建卡` 与 JournalEntry flag（**不要只留在全局变量里**）
