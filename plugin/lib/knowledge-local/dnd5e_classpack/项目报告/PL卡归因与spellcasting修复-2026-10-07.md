# dnd5e_classpack · 五张 PL 卡归因排查 + spellcasting 修复（2026-10-07）

## 一 · 用户指令（逐字）

1. 「你看看这些问题，是不是因为我们得包有问题？导致的？排查一下，**不要动卡**」
2. 「好，修了就行，**PL卡不动了**」
3. （追问伦恩的卡要不要顺手修）⇒ 选择 **「完全不动，就这样」**

**硬约束：不改任何 PL 卡。**

---

## 二 · ★★★ 最重要的新知识：`spellcasting.ability` 会污染卡数据

### 2.1 机制（源码 + 实测双证）

`attributes.spellcasting` 是 **StringField 存档字段**（不是派生值），一旦写进 actor 的
`_source`，就**永久留在卡上**。

```js
// dnd5e.mjs —— 拖入职业/子职物品时执行，★ 不检查 progression
await actor.update({ "system.attributes.spellcasting": this.parent.spellcasting.ability });
```

⇒ **只要 `spellcasting.ability` 非空，就会被写进卡**，即使 `progression: "none"`（不施法）。

### 2.2 DC 的兜底算法

```js
this.attributes.spell.dc = ability ? ability.dc : 8 + this.attributes.prof;
```

⇒ `spellcasting` 为空时 ability 取不到 ⇒ 兜底 `8 + 熟练加值`（2 级熟练时 = **10**）。
**所以 `spell.dc` 永远有值，不存在"空"。**

```js
// dnd5e.mjs L58495
context.classSpellcasting = Object.values(this.actor.classes).some(c => c.spellcasting?.levels);
```

### 2.3 卡面到底显不显示

- 「法术 DC」标签（`DND5E.AbbreviationDC`）在整个 dnd5e 模板里**只出现一次**：
  `templates\actors\parts\actor-spellbook.hbs:15` ⇒ **只在法术书页，且无条件渲染**
- 属性名来自同页 L11-12 的下拉框 `selected=system.attributes.spellcasting`
- ⇒ **`ability: ""` 的效果 = 下拉框空白，不再顶着"感知/智力"字样**

### 2.4 ★ 后果（这就是三处错的危害）

不施法角色被写上 `ability` ⇒ 法术书页显示 `[属性名] DC <真实值>`（如「感知 DC 13」），
**看起来像一个真施法者**；写空后变成 `[空] DC 10`（明显是空栏）。

---

## 三 · 归因结论（用户报的 9 条症状）

### A · classpack 真错 —— 3 处，同一字段

| 物品 | 包 | id | 原值 | 改后 |
|---|---|---|---|---|
| **武僧 Monk** | `dnd5e_classpack.classes-new` | `JNX3agrVFrpJYqca` | `ability: "wis"` | `""` |
| **血猎手 Blood Hunter** | `dnd5e_classpack.classes-new` | `3Ld4At71IH11j4tK` | `ability: "int"` | `""` |
| **魔射手 Arcane Archer（XGE）** | `dnd5e_classpack.subclass` | `NOdNl8paEppqJs06` | `ability: "int"` | `""` |

- 14 个职业中另外 12 个与官方 `dnd5e.classes` **逐字一致**，无需改
- 血猎手、魔射手官方包没有（非 SRD），靠规则书 + 同族对照定案

### B · 不是包的事（5 条）

- **贝瑟 AC 21**：包里护盾术（`spell` 包 Item.`6EjLIIN4ug7eSp4P`）**写得完全正确**
  —— `transfer:false`、`duration={seconds:6,rounds:1}`、`changes=[{system.attributes.ac.bonus|2|+5}]`、
  活动 `utility` + `units:"inst"`。实测当前 AC=16(bonus 0) ⇒ **21 是点用护盾术那一瞬的状态**。
- **星逸黑暗视觉 120**：来自**第三方包** `mage-hand-press-valdas-spire-of-secrets.valdas-subclasses`
  Item.`eQsXGO6UuLwJZaV2`（变形生物 Shapechanger），**不是 classpack**。它用**旧字段**
  `system.attributes.senses.darkvision` + **mode 2（相加）**，半精灵用**新字段**
  `senses.ranges.darkvision` + **mode 4（取大）**，两字段底层同源 ⇒ 60+60。
- **安史地法师之手重复**：包原件 `spell.Item.H5gghxp0hfT3BAlC` = **效0**；卡上两条同源
  （`Ow3jg5ZJWGaSo6m5` 效0 / `u5JZGacmh743hjhi` **效1**）⇒ **卡上重复拖入**。
- **维兰弩矢**：包里**配了** —— 术士 `classes-new.Item.dLA1lQ2nRUUWFwZU` 的 `startingEquipment`
  含 `{type:"linked",count:20,key:"...itempack.Item.95FAB1D8AC957844"}` ⇒ **建卡没导入**。
- **星逸 2 环位 2/0**：游侠 3 级无 2 环位，卡上 `spell2={value:2,max:0}` 是残值。

### C · 我们审错了，撤回（2 条）

- **星逸「技能多 1 项」**：第 8 项来自游侠 1 级「自然探索者」，advancement `value.chosen=["skills:nat"]` ⇒ 应有 8。
- **星逸「语言多 1 门」**：gnomish 来自游侠 1 级「宿敌」，`value.chosen=["languages:standard:gnomish"]` ⇒ 应有 5。

---

## 四 · ★ 三个读法错误（此前误判的根因，务必避免再犯）

1. **`Actor#effects` 只含卡文档自身的效果，transfer 效果不在里面** ⇒ 要读 **`actor.appliedEffects`**。
   按 `a.effects` 读会得出「五张卡效果全空」的错误结论。
2. **技能熟练存在 `system.skills.X.value`**（0/1/2/0.5），**不是** `proficient`（后者恒为 0 或不存在）。
3. **dnd5e 5.3.3 没有 `system.attributes.spelldc`**。`attributes` 的键 =
   `["ac","init","movement","attunement","senses","spellcasting","exhaustion","concentration","loyalty","hp","death","inspiration","hd","prof","encumbrance","spell"]`。
   卡面 DC 是 UI 现算的。

---

## 五 · ★★★ 实测证据（不是推断）

### 5.1 伦恩.雷德的卡（症状复现，只读）

```
伦恩.雷德  职[武僧 prog=none, ab='wis'] + 子[醉拳宗 prog=none, ab='']
        ⇒ attributes.spellcasting='wis'  dc=13  atk=5      ← 症状完全复现
        ⇒ _source.system.attributes.spellcasting = "wis"   ← ★ 永久写进卡数据的源文档
        卡上武僧物品 RQSVcwXbbMqKSMyo: prog=none, ab='wis'  ← 旧副本
        包里武僧     JNX3agrVFrpJYqca: prog=none, ab=''    ← 已修好
```

### 5.2 另外四张 PL 卡（全部正确，无需改）

```
安史地 职[游荡者 none,''] + 子[诡术师 third,'int']      ⇒ spellcasting='int' dc=12 ✅
星逸   职[游侠 half,'wis'] + 子[野兽血脉 none,'']       ⇒ spellcasting='wis' dc=13 ✅
维兰   职[术士 full,'cha'] + 子[龙族血脉 none,'']       ⇒ spellcasting='cha' dc=15 ✅
贝瑟   职[战士 none,'']    + 子[奥法骑士 third,'int']   ⇒ spellcasting='int' dc=12 ✅
```

⇒ **诡术师 / 奥法骑士是 `third`（第三施法者）⇒ 保留 `int` 是正确的，没动。**

### 5.3 改包对新卡生效（建卡实测，测完即删）

```
建临时角色卡 ⇒ 拖入包里武僧(ab='') ⇒ attributes.spellcasting = "[]"  ← 空 ✓
                                ⇒ spell.dc = 10（兜底值）, attack = 2
删除临时卡 ⇒ 已删 ✓
```

### 5.4 ★ 奥术射击 DC 不依赖 spellcasting（一刀分清的对照实验）

```
桩: intMod=5, prof=2, spellcasting="[]"(空), scMod=null
实测: 放逐矢 save.dc.calculation=[int] ⇒ dcValue=15 ; 活动自身 ability=[int]
假说A 按 int 算        = 8+2+5 = 15  ← ✓ 命中
假说B 按 spellcasting 算 = 8+2+0 = 10  ← ✗ 排除
```

⇒ **`save.dc.calculation` 非空时取活动的 `this.ability`，与 `attributes.spellcasting` 无关**
⇒ 魔射手那处改动**零风险**。

（第一次实验用木桩 npc 做，`intMod=0` 且 `spellcasting` 空 ⇒ 两个假说都得 10，**分不清**；
重做时把 int 设成 20 才一刀分清 —— **实验设计必须让两个假说产生不同结果，否则等于没做**。）

---

## 六 · 附带发现并修复：爆裂矢 DC 属性写错

**判据来源**：`00_规则资料\5E 不全书-纯文本\珊娜萨的万事指南\角色选项\战士\魔射手.txt:65`

> 「如果选项要求生物进行豁免检定，你的**奥术射击豁免 DC 等同于 8 + 你的熟练调整值 + 你的智力调整值**。」

| 矢 | save.ability（目标用什么豁免） | 改前 dc.calculation | 改后 |
|---|---|---|---|
| 遮影矢 | wis ✅ | `int` ✅ | 不动 |
| 穿梭矢 | dex ✅ | `int` ✅ | 不动 |
| 放逐矢 | cha ✅ | `int` ✅ | 不动 |
| 欺诈矢 | wis ✅ | `int` ✅ | 不动 |
| 虚弱矢 | con ✅ | `int` ✅ | 不动 |
| **爆裂矢** | dex | **`""` + formula `8 + @prof + @abilities.dex.mod`** | **`int` + 空 formula** ✅ |

⇒ **6 件全部 `calc='int'`，与规则书和同族写法一致。**

**爆裂矢的「敏捷豁免」本身保留** —— 它的描述里自己写了「敏捷豁免减半」，属**有意近似**，不是错。

---

## 七 · 待判（未修，需用户定夺）

**追踪矢 Seeking Arrow** `extra-ability/i3YthtU7oYjfnZgB`

- **规则书**：不进行攻击检定 → 选择目标 → 目标做**敏捷豁免** → 失败受箭伤 + `1d6` 穿刺，
  成功**减半**；18 级 2d6
- **数据**：`attack` 活动（会弹 d20 攻击检定）+ 无 save，伤害 `1d6 + @abilities.dex.mod` 穿刺
- **描述**：已自注【自动化提示】「**不用投攻击骰**，直接选中目标」
- **性质**：不是笔误，是**机制近似**；改成 save 活动属于**玩法变更**（引入豁免与减半），
  且需同步改描述文案 ⇒ 按 AGENTS 第三条先请示，未擅自动

---

## 八 · 遗留（用户已知悉并接受）

- **伦恩.雷德的卡**：`attributes.spellcasting='wis'` 仍在（用户选「完全不动，就这样」），
  他的法术书页仍显示「感知 DC 13」。
  **若要修**：把卡上 `_source.system.attributes.spellcasting` 改回空 + 卡上那份武僧物品的
  `spellcasting.ability` 改成空即可（两个字段，不碰别的）。
- **6 个假状态 id**（图标不显示）：`腐败` / `Silence` / `攻击优势` / `恍惚` / `患病` / `Torch` —— 用户已说算了
- **旧验收卡上 273 条孤儿副本** —— 策略上不重建

---

## 九 · 全库复扫（全绿）

```
itempack 1679/1745/230 │ moditems 226/250/28 │ extra-ability 584/480/232
class-abilityphb 479/325/237 │ racial-traits 441/269/229 │ feats-all 121/114/56
spell 545/620/308 │ subclass 122/0/0 │ classes-new 14/0/0
─────────────────────────────────────────────────────────
合计  4211 件 / 3803 活动 / 1320 效果
spellcasting 残留 = 0            ← 全库零残留
奥术射击 DC = 6 件全部 calc='int' ← 全部一致
```

扫描基数：1739（classes-new/subclass/feats-all/extra-ability/racial-traits/BackgroundList/class-abilityphb）
+ 2893（itempack/moditems/spell/races-item/BackgroundList/BackgroundFeature/loots）
+ 全量复扫 4211。

---

## 十 · 环境常量

- 世界 **123 特醇佳酿**（`<你的服务器>:30000`）
- Foundry **13.351** / dnd5e **5.3.3** / midi-qol **13.0.55** / CPR **1.5.15**
  / DAE **13.0.25** / AC5E **13.5330.1.2** / AA **6.8.1**
- dnd5e 源码路径：**`F:\FVTT\data\systems\dnd5e\dnd5e.mjs`（2,881,906 字节）**
  （另一份备份 `F:\BaiduSyncdisk\DSH备份\智能体\99_临时草稿\_tmp_dnd5e\dnd5e.mjs`）
- 模板路径：**`F:\FVTT\data\systems\dnd5e\templates\`**
- 测试桩：木桩 `Actor.jLkYKGa58fLzyE7B`（token `f48rzdJByXPkZU4C`，unlinked，npc）
- **★ PL 卡实为 5 张**（`hasPlayerOwner=true`）：安史地 `U8aqQiw6bdeGRJyD`
  ｜星逸 `OxBEtTyV0mi9tiIc`｜维兰 `mCIwm7aluKWfu83k`｜贝瑟 `aYOozAHGKshs9vLN`
  ｜**伦恩.雷德 `7OR2mc2pT0J70oBb`**（owner `j6ZPazj45pCFhWu4`）
  —— 此前只记 4 张，**漏了伦恩**，本次更正
- Actor 夹：LH验证卡(0 空) / NPC(10) / 冒险者小队(0) / 插画(3) / 特醇佳酿2(5) / 生物(4)
- 世界宏：`LH跑批器 v26` = `vsEWR426ZU3m5seL`｜`LH建卡器 v1` = `YXQp7MD4MgFLHJ93`
- relay 单次 `execute_js` 约 **35 秒超时**；脚本标识符不能用标点；
  `game.settings.settings` 会命中黑名单 `game.settings.set`
- `d.toObject().system.advancement` 是**对象**不是数组（`.map()` 会报
  `adv.map is not a function`）⇒ 用 `Object.values()`
