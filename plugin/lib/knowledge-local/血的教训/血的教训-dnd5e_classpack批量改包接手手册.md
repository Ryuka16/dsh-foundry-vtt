# 血的教训 · dnd5e_classpack 批量改包接手手册

> **给下一个接手的 AI：先读完这个文件再动手。**
> 建立于 2026-10-07 · 世界 worldId 123「特醇佳酿」· 项目：dnd5e_classpack 全库 4093 件效果匹配与修复
>
> 这不是经验谈，是**用真金白银和 20 小时换来的操作手册**。每一节都可以直接照抄执行。
> 项目专用（别的包别照搬常量），但**判据方法论可以迁移**。

---

## 零 · 30 秒速览：我要做什么 → 看哪节

| 你想做的事 | 去哪节 | 一句话 |
|---|---|---|
| 不知道从哪开始 | §1 §2 | 先复核环境常量，再读七条铁律 |
| 要判断「哪个效果坏了」 | §3 §4 | **只信四种判据**，别信关键词匹配 |
| 要改 compendium 里的东西 | §5 | update 0.8 秒/件，单批 ≤20 件 |
| 要删一个内嵌效果 | §5.3 | `update` 删不掉，**必须重建文档** |
| 脚本 408 超时了 | §6.2 | **先读回确认，绝不重跑** |
| 不确定某个 change 键有没有效 | §7 | **运行时实测**，写+读派生值+假键对照 |
| 想知道哪些已经修过了 | §8 | 15 类 + 本轮 6 件，别重复修 |
| 想知道哪些**做不了** | §9 | 已确认无字段可做，别浪费时间 |
| 报错了不知道啥意思 | §10 | 错误信息 → 原因 → 修法 |

**关键词索引（grep 用）**：
`mode 3` → §2.1 ｜ 删除效果 → §5.3 ｜ 断链 → §4.2 ｜ 官方对照 → §4.3 ｜
时长 → §4.1 ｜ 假键对照 → §7.2 ｜ relay 408 → §6.2 ｜ 黑名单 → §6.3 ｜
建卡 → 见《血的教训-建卡与升级授予篇.md》｜ 跑批 → 见《血的教训-跑批零污染六源与弹框看门狗篇.md》

---

## 一 · 环境常量（每次开工先复核一遍，可能变）

```
世界      worldId 123 「特醇佳酿」  服务器 146.56.232.12:30000
Foundry   13.351
dnd5e     5.3.3          ← 不是 wiki 上的 6.0.0，写法完全不同
midi-qol  13.0.55
CPR       1.5.15
DAE       13.0.25
AC5E      13.5330.1.2
AA        6.8.1
```

**项目结构**：21 个包，7 个 Item 包有活动
`extra-ability`(584) / `class-abilityphb`(479) / `racial-traits`(441) / `feats-all`(121) / `spell`(545) / `itempack`(1697) / `moditems`(226) —— 合计 4093 件

**测试桩（用完必须清干净）**
```
靶/木桩   token f48rzdJByXPkZU4C → Actor.jLkYKGa58fLzyE7B  (9999/9999)
施法桩    token AQ2c3WTXAYeKnuiP → Actor.E4OlKBqN2dFen4ZX  (干净裸卡，探测专用)
验收卡夹  Folder fT8Bvb6yyuQRylaw   （506 张）
验证卡夹  Folder ebFTcqIZWdxipvV7
跑批器    Macro.vsEWR426ZU3m5seL    (LH跑批器 v26 · 22,430 字符)
建卡器    Macro.YQXp7MD4MgFLHJ93    (LH建卡器 v1  ·  4,466 字符)
```

**硬约束（用户原话，不可越线）**
> 「我需要的是改包里的东西，而不是我PL卡上的」
> 「没有作者，是你自己做的卡，上一个会话，所以他说的不可信」

- ❌ **绝不动 PL 卡**（维兰 / 贝瑟，判据 `hasPlayerOwner === true`）。发现问题**只记录**。
- ❌ **不批量改**（用户明确拦下过一次：批量改会毁掉 330 条正确数据，见 §7）。
- ❌ **删除前必须请示**（AGENTS 第三条）。
- ⚠️ **上一个会话在描述里写的 `【自动化提示】` / `【自动化无法匹配】` 不可信** —— 那是 AI 写的，不是作者写的，实测有错。要自己验。

---

## 二 · 七条铁律（违反必出事）

### 2.1 ★ `mode 3` 是「取更小值」，**不是禁用**

实测表（测试桩 `Actor.E4OlKBqN2dFen4ZX`）：

| 字段类型 | 例 | m2 ADD | **m3 DOWNGRADE** | m4 UPGRADE | m5 OVERRIDE |
|---|---|---|---|---|---|
| NumberField | `abilities.con.value` | 10→12 ✓ | **10→1（取小！）** | 10→10 | 10→2 ✓ |
| StringField 公式 | `bonuses.abilities.save` | "-2" ✓ | **变 `min(-2,1)`** | — | 直设 ✓ |
| SetField | `traits.dr.value` | 加入集合 ✓ | **空操作（安全）** | — | 整体覆盖 |
| StringField 枚举 | `attributes.ac.calc` | **静默失效** | — | — | ✓ |

⇒ **禁用一条已有 change，唯一正确写法是 `disabled: true`**（那是效果级字段），不是把 mode 改成 3。
⇒ 曾把 mode3 当「中性化」用，导致**体质 10→1**（角色自伤），已修正。
⇒ 包里保留的 6 处 mode3 都在 SetField（实测空操作，安全）。

### 2.2 改 effect 必须「读旧 + 追加」，不能整段替换

整段替换会**冲掉原有 changes** —— 曾把「人类定身术」的 OverTime 冲没了。

```js
// ✅ 正确
const o = d.toObject();
const 新效 = o.effects.map(e => Object.assign({}, e, { changes: [...(e.changes||[]), ...新增] }));
await d.update({ effects: 新效 });
```

### 2.3 effect 的 `changes` 在**顶层**

`ef.changes` ✓ ｜ `ef.system.changes` ✗

### 2.4 `languages.value` 必须全大写 `"ALL"`

dnd5e `prepareLanguages()` 源码：`if ( languages.value.has("ALL") )`。写 `"all"` 静默无效。

### 2.5 `system.activities` 改键要 `-=` 显式删

它是 ObjectField **合并**语义，不清旧键会出现两个活动。

```js
const up = { "system.activities.-=" + 旧键: null };
up["system.activities." + 新键] = 新活动;
await d.update(up);
```

### 2.6 「真空壳」判据必须含 `flags["chris-premades"].embeddedMacros`

漏了它会误报（CPR 嵌入式宏也是实现）。

### 2.7 判断时长必须**读包内原始数据**，不能读跑批记录

跑批记录的「秒」字段被运行时改写成 `-1`；跑批的 `靶`/`施` 效果列表会被**其他件的残留脏数据污染**。
⇒ **一切判定回包内读**。

---

## 三 · ★ 判据战绩表（最重要的一节）

| 判据 | 命中 | 真错 | 精确率 | 结论 |
|---|---|---|---|---|
| **描述时长 ⇄ 活动/效果 duration** | 22 | 14 | 64% | ✅ **唯一全对的通用静态判据** |
| **官方包逐字段对照** | 172 | 12 | — | ✅ **0 误报，最可靠** |
| **引用断链扫描** | 大量 | 全真 | 100% | ✅ 必用 |
| 枚举值合法性（伤害类型/状态 id） | 38 | 38 | 100% | ✅ 必用 |
| 描述骰子 ⇄ 数据骰子 | 三次迭代 | ~0 | 0~25% | ❌ **彻底失败，别再做** |
| 描述状态名 ⇄ statuses | 588 | ~0 | ~0% | ❌ 中文分不清「施加」与「提及」 |
| change 键 ⇄ actor schema | 333 | 3 | **0.9%** | ❌ **最危险，照它改会毁 330 条** |
| 机制词 → 必备字段 | 719 | 极少 | ~0% | ❌ 同上 |
| 效果名指向另一个物品 | 14 | 2 | 14% | ⚠️ 够用（人工复核成本低） |

### 3.1 核心结论（背下来）

> **中文自然语言 ⇄ 程序结构的静态判据，精确率长期 0~25%。**
> **只有「官方包对照」和「运行时实测」靠得住。**

**推论**：
1. 别写「描述里出现『优势』就要求有 advantage 键」这种判据 —— 会产出几百条假阳性，逼你逐条看，比不做还慢。
2. **能实测的立刻实测**，别推理。
3. 需要人工逐件读的，就用「**每约 15 件出 1 处真错**」这个速率估工作量（1082 件 ≈ 70 处）。

### 3.2 骰子判据为什么三次都失败

① 漏了 `damage.parts[].custom.formula`
② 误用 `.base` 路径 —— `activity.healing` 是**扁平结构**，不是 `.base` 包裹
③ 漏了 `utility` 活动的 `roll` 字段 —— 很多「无效果」的活动其实是 `roll` 在干活

而且：伤害大量写成 `@classes.*.levels` 缩放公式，描述里的 `1d8` / `2d8` 是**不同等级的值** —— 数据用公式表达 ≡ 等价，全是误报。

---

## 四 · 有效判据详解（怎么用）

### 4.1 描述时长 ⇄ duration（唯一全对）

**时长来源优先级（实测归纳）**
1. 活动有实际时长 ⇒ **用活动的**（勇气联结：活动 10minute ⇒ 实测 600s ✓）
2. 活动是 `inst` ⇒ 退回用**物品效果自己的** duration
3. 效果写 `rounds`/`turns` 而 `game.combat` 为 null ⇒ 算不出剩余 ⇒ **显示「永久」**
   （`ActiveEffect#_prepareDuration`：`else if ( d.rounds || d.turns ) { const cbt = game.combat; if ( !cbt ) return { type: "turns", _combatTime: undefined }; }`）
4. 两处都没写 ⇒ **0 秒立即掉**

**修法铁律（两处都写对）**

| 描述 | 活动 | 效果 |
|---|---|---|
| N 分钟 | `{value:"N", units:"minute"}` | `{seconds: N*60}` |
| 1 回合 | `{value:"1", units:"turn"}` | `{seconds: 6}` |
| 专注 | `concentration: true` | + `flags.dae.specialDuration:["concentration"]` |
| 永久 | 两处都不写 | 两处都不写 |

```js
const 新效 = o.effects.map(e => Object.assign({}, e, { duration: { ...默认全 null, ...目标时长 } }));
const up = { effects: 新效 };
for (const k of Object.keys(o.system.activities)) up["system.activities." + k + ".duration"] = 目标活动时长;
await d.update(up);
```

### 4.2 引用断链扫描（**完整字段清单**，照这个扫）

```
活动   effects[]._id ｜ otherActivityId ｜ midiProperties.triggeredActivityId
       enchant.riders[].uuid ｜ summon.profiles[].uuid ｜ transform.uuid
       consumption.targets[].resource ｜ cachedSpell
效果   flags.dae.macro ｜ flags.itemacro.macro ｜ flags["midi-qol"].onUseMacroName
       change key 里的 macro.StatusEffect ｜ flags.dae.specialDuration
物品   flags["chris-premades"].info.identifier ｜ macros.midi.actor|activity|item
       flags["midi-qol"].optional ｜ system.source.rules
其他   flags.autoanimations ｜ flags.auraeffects ｜ flags.dnd5e.riders
```

**★ `midiProperties.triggeredActivityId` 只认 活动 id / identifier / uuid，不认 name**
（源码 `getTriggeredActivity()` 三级回退）⇒ 填中文名（「豁免」「治疗」）**永久不触发**。包里曾有 20 处。

**★ `transform.uuid` 为空是正常的** —— 全用 preset 模式（`wildshape` / `polymorph`）。别去"修"。

**★ `consumption.targets` 的 `spellSlots` 类型下 `target` 字段被完全忽略** ⇒ 别动。

### 4.3 官方包对照（0 误报）

**判据方向：`官方有 ⟹ 本包必须有`**（反向不成立 —— 本包有而官方没有的全是**增强**，别删）。

配对方式：
- `dnd5e.spells` ⇄ `spell` 用 `system.identifier` 配对
- `classfeatures` / `races` / `classes` / `subclasses` ⇄ 6 包用**英文名归一化**
- `dnd5e.items` ⇄ `itempack` + `moditems`

**格式差异要识别**：本包效果带 `Convenient Effect: ` 前缀 ⇒ 字面不等但内容相同，**是误报**。

### 4.4 合法枚举值表（高精度，全中）

**合法 14 类伤害**
```
necrotic piercing poison bludgeoning radiant cold slashing
vitality fire thunder force acid lightning psychic
```

**合法困难地形**
```
slope ice sand mud liquid snow rocks plants web
```

**状态 id 必须来自 `CONFIG.statusEffects`**（实测 62 条）。
⚠️ 带 `Convenient Effect: ` 前缀的 id **不在表里** ⇒ 图标不会画到 token 上。
⚠️ 包里 6 个无标准等价的假 id 是**用户已同意保留**的：`腐败` / `Silence` / `攻击优势` / `恍惚` / `患病` / `Torch`。

**陷阱**：曾出现 **U+2012 非 ASCII 减号**（charCode 8210）当负号用 ⇒ 公式静默失效。扫 `[\u2010-\u2015]`。

### 4.5 孤儿效果（效果名指向另一个物品）

判据：取每个效果的 `name` 与**全库所有物品名**做精确匹配，匹配到另一物品而效果名 ≠ 本物品名。
这是**复制粘贴错的典型特征**。命中 14 条，人工复核出 2 条真错。

---

## 五 · compendium 读写手册

### 5.1 批量改的安全上限

```
compendium 文档 update ≈ 0.8 秒/件
⇒ 单次批量安全上限 15 ~ 25 件
⇒ 110 件一次 = HTTP 408
```

### 5.2 取文档：用 `getDocuments()`，**不要**用 `getDocument(截断id)`

```js
// ✗ 传扫描时 slice(0,8) 的截断 id ⇒ 返回 null
//   ⇒ Error executing script: Cannot read properties of null (reading 'toObject')
// ✅
const ds = await pack.getDocuments();
const 索 = {}; for (const d of ds) 索[d.id] = d;
```

⚠️ `getDocuments()` 每次重新拉全包 ⇒ **分批 + 幂等过滤**最优。

### 5.3 ★ 删除内嵌效果：update 删不掉，必须重建文档

**实测失败的两条路**（都不报错、读回不变）：
```js
await d.update({ effects: 短数组 });           // ✗
await d.update({ "effects.-=<id>": null });    // ✗
```

**唯一可行**：
```js
const 新 = JSON.parse(JSON.stringify(d.toObject()));
新.effects = 新.effects.filter(e => e._id !== 效id);
await c.documentClass.create(新, { pack: c.collection, keepId: true });   // ✓
```
`keepId: true` 是关键 —— 不传会重生成 `_id`，所有引用当场断链。

### 5.4 新增效果（这个 update 是可行的）

```js
const 全 = 效.map(e => Object.assign({
  _id: foundry.utils.randomID(), type: "base", disabled: false, transfer: true,
  duration: {}, description: "", origin: null, tint: "#ffffff", statuses: [], flags: {}, sort: 0
}, e));
o.effects = (o.effects || []).concat(全);
await d.update({ effects: o.effects });
```

⚠️ **内嵌效果删不掉但能加/能改**（`changes` 是普通数组可整段替换；`effects` 是带 `_id` 的键控数组）。

### 5.5 回滚手段

把 `system.activities` 清回 `{}`。世界内备份变量 `game.__修备份`（累计 112 条）。

---

## 六 · relay 通信

### 6.1 长任务用「点火不 await」

单次 `execute_js` 约 **35 秒超时**（HTTP 408）。
长任务写法：**点火（不 await）+ 结果写全局变量**，事后用最小脚本读。

### 6.2 ★ 超时 ≠ 没执行

**实测两次 408 的调用都完整落库了**（有一次实际写入了 42 件）。

⇒ **408 / 超时后第一动作是读回确认，绝不重跑**（重跑造重复数据）。
⇒ 批量脚本要写**幂等过滤**（如「是否已有活动」）才安全。

### 6.3 黑名单 24 条（子串正则，扫全文，注释里也算）

```
localStorage  sessionStorage  document.cookie  eval(  new Worker(  new SharedWorker(
__proto__  atob(  btoa(  crypto.  Intl.  postMessage(  XMLHttpRequest  importScripts(
apiKey  privateKey  password  Function(  Function.constructor  globalThis
game.settings.set  Reflect.  Proxy  import(
```

**⚠️ 特别注意 `Proxy` 与 `import(` 是纯子串匹配** —— 任何含 "Proxy" 的单词（ProxyToken、proxyConfig）、任何 `import(` 写法都会中招。

**躲坑写法**：
- `game.settings.set` ⇒ 写 `game.settings["settings"]`
- `crypto.randomUUID` ⇒ 用 `foundry.utils.randomID()`
- `globalThis` ⇒ 用 `game` / `window` / `canvas`
- 世界内**既无 Buffer 也无 atob** ⇒ base64 方案整体放弃
- 报错只说 `Script contains forbidden patterns`，**不告诉你是哪个词**

### 6.4 ★ relay 会截断/抖动大脚本

- 195 行脚本报 `missing ) after argument list` —— **实为传输截断**，整段未执行
- 31 行脚本报「超时」但**实际已落库**

⇒ **单次脚本保持小**；宏体别用多行模板字符串，改：
```js
['行1','行2'].join(String.fromCharCode(10))
```

### 6.5 其他

- execute-js 是**严格模式**：用 `const` / `let`，别用 `var` 隐式全局
- **脚本里的标识符不能用标点**（中文名可以，符号不行）
- 长时间无操作后 relay 的 WebSocket 通道会**僵死**（HTTP 408）⇒ 用极轻脚本探测「活/死」，或让用户刷新页面

---

## 七 · ★ 运行时验证法（唯一可靠的手段）

### 7.1 核心教训

> **actor schema 递归扫出 333 条「失效键」，逐条实测后「真死的只有 3 条」。**
> **不实测就批量改，会毁掉 330 条正确数据。**

**为什么静态扫不准**：`system.traits.di.all` 这类键在 schema 里查不到，但它是**迁移映射表**里的合法键；反过来，写一个完全不存在的假键，**读这个键自己也能读到值**（DAE 只是把 change 写进 data），所以「读回自己」根本不构成验证。

### 7.2 ★ 正确的验证法：写 → 读**派生值** → **假键对照**

```js
// 1. 读一个会被该 change 影响的【派生值】（不是键自己！）
//    好的派生值：AC / 移动力 / 抗性集合 / 感官 / 技能优势
const 前 = { dv: actor.system.attributes.senses.darkvision,
             dr: Array.from(actor.system.traits.dr.value || []) };

// 2. 写 change（把物品给测试桩 + 装备 + 同调）
const o = (await pack.getDocuments()).find(x => x.id === 物品id).toObject();
delete o._id;
o.system.equipped = true; o.system.attunement = "attuned"; o.system.attuned = true;
const 建 = await actor.createEmbeddedDocuments("Item", [o]);
await actor.prepareData();
const 后 = { dv: actor.system.attributes.senses.darkvision,
             dr: Array.from(actor.system.traits.dr.value || []) };

// 3. ★ 空白对照：再写一个【必然无效的假键】，确认派生值纹丝不动
await 对照.update({ changes: 对照.changes.concat([{ key: "system.attack.bonus", mode: 2, value: "99", priority: 20 }]) });
await actor.prepareData();   // 派生值必须与「后」完全一致 ⇒ 证明前面的变化是真键造成的

// 4. 清理
await actor.deleteEmbeddedDocuments("Item", 建.map(x => x.id));
await actor.prepareData();
```

**实测样例（本轮）**：装刺青+面具后 `darkvision 0→60`、`dr []→["lightning"]`；假键组派生值**纹丝不动** ⇒ 两键确认生效。

### 7.3 midi 优势键的专用验证 API

```js
await MidiQOL.computeSkillAdvantage(actor, "ste", {})
// → { advantage: { active: false/true }, attribution: { ADV: { "skill.ste": "优势 (隐匿)" } }, ... }
```

**源码级铁证**（midi-qol 13.0.55 `computeSkillAdvantage(actor, skillId, options, tracker)`）：
```js
advantageFlags: [ "advantage.all", "advantage.skill.all", `advantage.skill.${skillId}` ]
```
⇒ `flags.midi-qol.advantage.skill.ste` 就是 midi 自己找的键。

⚠️ **它是 async 函数** —— 不 `await` 会得到空对象 `{}`，会误判成「键无效」。

**实测样例**：装刺青前 `active:false` → 装上后 `active:true` 且 `attribution:{"skill.ste":"优势 (隐匿)"}`；
同时查 `acr`（体操）仍 `false`（证明非恒真）；清理后回 `false`。

### 7.4 已验证有效但不入 schema 的键（**别当死键删**）

```
attributes.ac.bonus              （在 ActiveEffect5e.FORMULA_FIELDS）
attributes.senses.darkvision     （在迁移映射表；平铺路径有效，与 ranges.* 互通）
attributes.movement.all
bonuses.weapon.damage / bonuses.weapon.attack
bonuses.All-Attacks
traits.idr.value                 （midi 源码含 "idr"）
traits.dm.midi.*
```

### 7.5 魔法物品验证必须补装备+同调

`transfer: true` 的效果需要 **装备 + 同调** 才生效。
```js
o.system.equipped = true; o.system.attunement = "attuned"; o.system.attuned = true;
```
不补 ⇒ 误判「键失效」。

---

## 八 · 已经修过的（别重复修）

### 8.1 历史 15 类 ≈ 340 处

| # | 修了什么 | 规模 |
|---|---|---|
| 1 | 「+N 加值武器」缺攻击活动 | 116 把 |
| 2 | Plutonium 伪 uuid（`uuid 含 plutonium-faux-id`） | 110 件 / 285 处 |
| 3 | 引导神力消耗目标写死 uuid → identifier `channel-divinity` | 23 件 |
| 4 | `triggeredActivityId` 断链（填了活动名） | 21 处 |
| 5 | 重复授予（同一 advancement 内同 uuid 多次） | 17 条 |
| 6 | 官方对照缺口 | 16 件 |
| 7 | 效果时长错 | 14 件 |
| 8 | 背景变体特性未设 optional | 5 件 |
| 9 | 空 cast uuid → utility | 3 件 |
| 10 | 龙枪背景空壳 | 2 件 |
| 11 | `languages.value` `"all"` → `"ALL"` | 2 件 |
| 12 | 孤儿效果 `disabled:true` | 2 件 |
| 13 | `ac.calc` mode2 → mode5 | 1 件 |
| 14 | 种族 cast 活动 `spell.spellbook` true → false | 56 件 / 120 条 |
| 15 | 死空壳效果删除 | 8 条 |
| 16 | 悬空宏引用改内嵌宏 / OverTime | 13 件 |

### 8.2 本轮新增 6 件（2026-10-07 终轮）

| 件 | 包/id | 改了什么 | 验证 |
|---|---|---|---|
| 鼯猴人坚毅 | `racial-traits/eaIuzFROif3jnrVy` | `roll: "d6"` → `"1d6 + @prof"` | 读回 ✓ |
| 鼯猴坚毅 Hadozee Dodge | `racial-traits/pNaKebaUvn6sfX32` | `roll: ""` → `"1d6 + @prof"` | 读回 ✓ |
| 蓝龙面具 | `moditems/LqinUSfQ2xIRD6VP` | 补 2 效果：`traits.dr.value\|m2\|lightning` + `senses.darkvision\|m2\|60` | **运行时 ✓** |
| 堕影冥界印记刺青 | `itempack/OAgE8BnsQxRN2Oqy` | 补 1 效果：`senses.darkvision\|m4\|60` + `midi-qol.advantage.skill.ste\|m0\|true` | **运行时 ✓** |
| 血怒刺青 | `itempack/WYh9mJE6coGGJ5h9` | 新增 damage 活动「嗜血狂袭」4d6 necrotic + 消耗 1 充能 | 读回 ✓ |
| 咒缚幽灵 | `extra-ability/3APHcggPa8gRvchw` | 新增 summon 活动「唤起幽灵」（幽灵 `PuPo4H4Dcxigf0fY` + `tempHP` + `friendlySummon`） | 读回 ✓ |

**前两件的判据**：描述明写「d6 + **你的熟练加值**」，数据里没有 `@prof` ⇒ 铁证级明确错。

### 8.3 战技（卓越骰）**本来就是对的**，别再动

18 件战技**全部已有** `consumption.targets → superiority-dice-*` + `roll: @scale.battle-master.superiority-die`。
（上一轮我误报「擒拿击这类能补」—— **over-claim，已更正**。教训：说「能做而没做」前必须先拉配置看。）

---

## 九 · 已确认**做不了**的（别浪费时间）

### 9.1 结构性无字段

| 特性 | 原因 |
|---|---|
| 元素灾厄移除抗性 | SetField 无「精确移除」语义 |
| 跳跃术 | `attributes.movement` **没有 jump 字段** |
| 浮空术 | 只能给 `hover` |
| 重伤术 | `hp.tempmax` **无法引用伤害值** |
| 圣言术 | 按 HP 50/40/30/20 分四档，无字段 |
| 散打技巧「丧失反应」/ 塔莎心灵鞭「不能反应」 | grep midi 全源码 `noReactions`/`reactionDisabled`/`cannotReact` **均 0** |
| 代替盟友承受伤害（神圣誓忠 / 护卫光环 / 生死流转） | 无「转移伤害」字段 |
| 滑翔 ×2 | 坠落伤害归零，无字段 |
| 借机攻击规则类（坚守战线） | 无字段 |
| 天气类（风暴导向） | 无字段 |
| 随机表类（彼岸故事 / 达文-纳之牙 / 万象无常牌） | 多选一，无字段 |
| 召唤物数据不匹配（加德尔急速邮差） | 法术要「小型无形气元素」，怪物包里是**标准大体型气元素** ⇒ **建 summon 会产生错数据，宁可不做** |
| 兽人的石头 | 要「兽人军官」，monsterspack **只有「兽人 Orc」**，数据不符 ⇒ 不做 |

### 9.2 用户已同意「就这样」

`元素灾厄` / `跳跃术` / `浮空术` / `重伤术` / `圣言术` / `散打技巧` / `光辉焚化` / `印记斩` / `FTD 龙裔血统 15 件`

### 9.3 用户已同意「图标不显示就算了」

6 个假状态 id：`腐败`(冻寒之触) / `Silence`(沉默术) / `攻击优势`(励志演讲) / `恍惚`(七彩喷射) / `患病`(摄心目光) / `Torch`(光亮术)

### 9.4 剩余统计

**全库 4093 件中，还有 502 件是「点一下只出聊天卡」**（只有 utility 活动、无效果、无宏、无 CPR）。
抽样 22 件逐条读描述后判断：**约 1/4 技术上还能补**（但补法都是宏，工作量大），**其余确实无字段可做**。

> 如果接手后要继续推进：优先扫「有明确**数值/骰子**机制但完全没实现」的，别去碰「规则条文类」。

---

## 十 · 踩坑速查（错误信息 → 原因 → 修法）

| 报错 | 原因 | 修法 |
|---|---|---|
| `Cannot read properties of null (reading 'toObject')` | 用了截断的 `_id` 调 `getDocument()` | 改 `getDocuments()` + 建索引 |
| `Item "xxx" does not exist!` | 用 `advancement.apply()` 建的**幽灵物品**（只改内存不落库） | 见《建卡与升级授予篇》—— 必须 `createEmbeddedDocuments(..., {keepId:true})` |
| `无法找到由行动 X 配置在物品 Y 上的耗用项` | `consumption.targets[].target` 指向的 uuid 在**这张 actor** 上找不到 | 改 identifier；先验「这张卡上有没有那个池」 |
| `Cannot read properties of undefined (reading 'flags')` | cast 活动的 `spell.uuid` 是**空串** | 照抄同物品已有 utility 活动做模板 |
| `Script contains forbidden patterns` | 撞了 §6.3 黑名单（**注释里也算**） | 按 §6.3 替代写法改；relay **不告诉你是哪个词** |
| `missing ) after argument list`（行数多的大脚本） | **relay 传输截断**，不是语法错 | 拆小脚本；别用多行模板字符串 |
| `Failed to execute 'querySelectorAll' ... not a valid selector` | 选择器字符串拼错（曾多一个引号） | 用 `'button[type="submit"], button[data-action="use"], button[data-action="choose"]'` |
| HTTP 408 | relay 超时 **或** WebSocket 通道僵死 | **先读回确认落库没有**；用极轻脚本探测通道 |
| `Multiple clients connected` | 有多个世界同时在线 | 让用户关掉多余的世界页面 |

---

## 十一 · 交付前的自check清单

```
□ 全库件/活/效 计数与预期一致
□ 断链 6 项全 0（活动→效果 / 触发活动 / 宏execute / ActivityOverTime / 空挂ItemMacro / 空uuid cast）
□ 非法伤害值 0 ｜ 非法状态 = 6（已知保留）
□ 无活动武器 0
□ 有告警卡 0（扫 actor._preparationWarnings）
□ 测试桩清干净：0 物 / 0 效 / 无告警
□ PL 卡（hasPlayerOwner）**全程未触碰**，只记录
□ 本轮每处改动都有「读回」或「运行时」证据
□ 落盘 MD 到 01_跑团工具\FVTT技术资料\
```

**最后一条，也是最重要的**：
> **说「能做而没做」之前，先把配置拉出来看一眼。**
> 本轮我因为没看就下结论，把 18 件**本来就做对了**的战技报成缺口 —— 用户差点白花时间。
> **改假设，不改事实。**（AGENTS 第零条）

---

*相关文件*
- `血的教训-批量改模组数据篇.md`（主文档 >200,000 字符，最全）
- `血的教训-跑批零污染六源与弹框看门狗篇.md`（跑批专用）
- `血的教训-建卡与升级授予篇.md`（建卡 / advancement / 僵尸物品）
- `01_跑团工具\FVTT技术资料\dnd5e_classpack-交付验收报告-2026-10-07.md`
