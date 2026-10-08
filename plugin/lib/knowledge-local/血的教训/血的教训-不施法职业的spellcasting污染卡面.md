# 血的教训 · 不施法职业的 spellcasting.ability 会污染卡面

> **一句话**：职业/子职物品上的 `system.spellcasting.ability` 只要有值（哪怕 `progression:"none"` 不施法），
> 拖进卡里就会**永久写死** `actor.system.attributes.spellcasting` ⇒ 卡面凭空出现「感知 DC 13 / 法术攻击 +5」。
> **写空串** `""` 才是正确形态。

---

## 一 · 现象

- 武僧 / 战士 / 游荡者 / 野蛮人这类**不施法**职业，卡面（法术书页）却显示
  `[属性名] DC <值>` —— 例如武僧显示「**感知** DC 13」、法术攻击 +5
- 玩家以为这职业有施法能力
- **改包也修不掉已有的卡**（见第四节）

---

## 二 · 根因（源码，dnd5e 5.3.3）

```js
// F:\FVTT\data\systems\dnd5e\dnd5e.mjs —— 拖入职业/子职物品时执行
// ★ 注意：不检查 progression
await actor.update({ "system.attributes.spellcasting": this.parent.spellcasting.ability });
```

```js
// DC 的兜底算法：spellcasting 为空时 ability 取不到 ⇒ 兜底 8 + 熟练
this.attributes.spell.dc = ability ? ability.dc : 8 + this.attributes.prof;
```

```js
// dnd5e.mjs L58495 —— 这个只控制「法术等级输入框禁不禁用」，不是整体显示开关
context.classSpellcasting = Object.values(this.actor.classes).some(c => c.spellcasting?.levels);
```

**两个关键事实：**

1. **`attributes.spellcasting` 是 StringField 存档字段**，写进 `_source` 就**永久留在卡上**，
   不是每次重新算的派生值。
2. **`spell.dc` 永远有值**（最少 `8 + prof` = 10）—— 不存在「DC 为空所以不显示」这种情况。

**卡面显示位置**：「法术 DC」标签（`DND5E.AbbreviationDC`）在整个 dnd5e 模板里**只出现一次**：

```
F:\FVTT\data\systems\dnd5e\templates\actors\parts\actor-spellbook.hbs
  L11: <select name="system.attributes.spellcasting" ...>     ← 属性名来自这里
  L15: <span>{{localize "DND5E.AbbreviationDC"}} {{system.attributes.spell.dc}}</span>   ← 无条件
```

⇒ **写空 `ability` 的真实效果 = 下拉框空白**（不再顶着「感知/智力」），DC 数字仍在（那是兜底值）。

---

## 三 · 判据与探针

### 3.1 静态判据（全库扫，零误报）

```
异常条件：spellcasting 存在 ∧ ability 非空 ∧ progression ∉ {full, half, third, pact, artificer}
```

**注意别误伤**：`progression: "third"`（诡术师 / 奥法骑士等第三施法者）**保留 `ability:"int"` 是正确的**。

### 3.2 F12 控制台探针（一次拿全，可直接粘贴）

```js
(async () => {
  const 合法 = ["full","half","third","pact","artificer"];
  const 出 = { 包内异常: [], 卡上异常: [] };
  for (const p of game.packs) {
    if (p.documentName !== "Item") continue;
    if (String(p.collection).indexOf("classpack") < 0 && String(p.collection).indexOf("dnd5e.") !== 0) continue;
    for (const d of await p.getDocuments()) {
      const s = d.system && d.system.spellcasting;
      if (!s) continue;
      const ab = String(s.ability || ""), pr = String(s.progression || "");
      if (ab !== "" && !合法.includes(pr))
        出.包内异常.push(p.collection + " ¦ " + d.name + " prog=" + pr + " ab=" + ab);
    }
  }
  for (const a of game.actors) {
    if (a.type !== "character") continue;
    const sc = a.system.attributes.spellcasting;
    if (!sc) continue;
    const cls = a.items.filter(i => ["class","subclass"].includes(i.type));
    const 有施法职业 = cls.some(c => 合法.includes(String((c.system.spellcasting||{}).progression||"")));
    if (!有施法职业)
      出.卡上异常.push(a.name + " ⇒ attributes.spellcasting='" + sc + "' but 无施法职业；卡上物=" +
        cls.map(c => c.name + "(" + ((c.system.spellcasting||{}).ability||"") + ")").join(","));
  }
  console.table(出.包内异常);
  console.table(出.卡上异常);
  console.log("完整结果见上方两个表；也可 window.__sc出 = 出 后自行展开", window.__sc出 = 出);
})()
```

### 3.3 运行时对照实验（要证实「DC 用哪个属性」，必须让两个假说产生**不同**结果）

```
桩：intMod=5, prof=2, attributes.spellcasting="" （空）
挂上目标物品，读 a.save.dc.value
  假说A 按活动自己的 int 算 = 8+2+5 = 15
  假说B 按 spellcasting 属性算 = 8+2+0 = 10
```

★ **踩过的坑**：第一次拿 `intMod=0` 的 npc 做，两个假说**都得 10** ⇒ 等于没做。
**实验设计必须让两个假说产生不同的数字。**

**结论（已实测）**：`save.dc.calculation` 非空时，dnd5e 取的是**活动自己的 `this.ability`**，
**与 `attributes.spellcasting` 完全无关** ⇒ 把子职的 `ability` 写空**不会破坏**它的能力 DC。

---

## 四 · ★ 为什么「改包」修不好已有的卡

`attributes.spellcasting` 一旦写进卡，**改包不会回头去清它** ——
卡上的物品是**副本**，包的改动对它无效；而卡数据里的 `attributes.spellcasting` 是**独立字段**。

**症状**：改完包，新建的卡是对的，但**老卡照旧显示假 DC**。

**修法（改卡，需用户同意）**：两个字段，不碰别的 ——

```js
await actor.update({ "system.attributes.spellcasting": "" });                    // ① 卡级
await actor.items.get("<卡上那份职业物品的id>").update({ "system.spellcasting.ability": "" });  // ② 卡上副本
```

**替代方案**：把卡上那份职业物品删掉，**重新从包里拖一份**（会重跑一次 update，自动写空）。

---

## 五 · 正确形态（可直接照抄）

```json
"system": {
  "spellcasting": {
    "progression": "none",
    "ability": "",
    "preparation": { "formula": "" }
  }
}
```

- **不施法**：`progression: "none"` + `ability: ""`
- **全施法**：`full` + `int/wis/cha`
- **半施法**：`half` + `wis/cha`（游侠/圣武士）
- **第三施法者**：`third` + `int`（诡术师/奥法骑士）
- **魔契师**：`pact` + `cha`；**奇械师**：`artificer` + `int`

---

## 六 · 本次实例（dnd5e_classpack，2026-10-07）

| 物品 | 包 | id | 原值 | 改后 |
|---|---|---|---|---|
| 武僧 Monk | `classes-new` | `JNX3agrVFrpJYqca` | `wis` | `""` |
| 血猎手 Blood Hunter | `classes-new` | `3Ld4At71IH11j4tK` | `int` | `""` |
| 魔射手 Arcane Archer（XGE） | `subclass` | `NOdNl8paEppqJs06` | `int` | `""` |

**魔射手的定案依据**（它确实用智力，但不施法）：

- 规则书 `00_规则资料\5E 不全书-纯文本\珊娜萨的万事指南\角色选项\战士\魔射手.txt:65`：
  「你的奥术射击豁免 DC 等同于 **8 + 你的熟练调整值 + 你的智力调整值**」
- 它的奥术射击物品已经用 `save.dc.calculation: "int"` 表达了这件事（6 件全部 `int`）
- ⇒ `spellcasting.ability: "int"` 是**重复且错误**的表达方式（它不施法，不该有施法属性）

---

## 七 · 一句话清单

1. **不施法职业/子职 ⇒ `ability` 必须写空串 `""`**，`progression: "none"` 不能豁免你
2. **`third`（诡术师/奥法骑士）保留 `int` 是对的**，别一刀切
3. **能力 DC 用 `save.dc.calculation` 表达，不要靠 `spellcasting.ability`**
4. **改包修不了老卡** —— `attributes.spellcasting` 是存档字段，要单独清
5. **验证 DC 归属时，两个假说必须产生不同数字**，否则实验无效
