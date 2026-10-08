# 04 · 怎么改 —— compendium 写入手册

> **不看这一篇就动手，一定会改坏。**
> compendium 的写入语义和世界内的 `update()` **不同**，很多写法"返回成功但什么都没变"。

---

## 〇 · 动手前的三道闸（每次都要过）

```
① 勘察闸  读模块 CHANGELOG.md + module.json + 目录 + 200 件样本，一次拿全
② 因果闸  能说出「X 改正确之后 Y 会变成什么」吗？说不出 = 相关而非因果 = 不许改
③ 备份闸  能说出怎么恢复吗？说不出 = 不许执行；dump 后**必须落盘成本地文件**
```

**②的实例**：`system.traits.di.all` 这个键看着像"免疫全部"，但实测是死键。
- 说不出「改成 14 条 `di.value` 之后，什么会变」→ 不许改
- 说不出的原因：actor schema 递归扫出 **333 条"失效键"，实测只有 3 条真死**
- **不实测就批量改，会毁掉 330 条正确数据**

---

## 一 · ★★★ 写入手册：compendium 与世界内是两套语义

### 1.1 硬约束总表

| 想做什么 | ❌ 无效写法 | ✅ 正确写法 |
|---|---|---|
| 改 `flags` | `d.update({"flags.x":{...}})`<br>`updateDocuments([{_id,flags}])` | **重建文档**（见 1.2） |
| 清空 `system.activities` | `d.update({"system.activities":{}})` | **重建文档** |
| 替换 / 删除**某条效果** | `d.update({effects:[新数组]})` → **变成追加！**<br>`d.update({"effects.-=id":null})` → 失败<br>`d.update({"effects.0.name":"x"})` → 变成两条 | **重建文档** |
| 改**某条效果**的字段 | 只给 `_id`+name → 丢字段 | `effects: o.effects.map(e => e._id===id ? {...e, ...改动} : e)` |
| 改活动 | `Object.keys(a.system.activities)` → 恒 0 | `Object.values()` / `.contents` / `.get(key)` |
| 删活动 | `-=<键名>` → `TypeError: Cannot read properties of undefined (reading 'cachedSpell')` | 读→过滤→**重建文档**<br>或保留原 key 只改内容 |
| 换活动类型 | 删了重建（会碰到上面的报错） | **保留原 key，只换内容**：`upd["system.activities."+原key] = 新对象` |
| 改文档 `type` | `d.update({type:"weapon"})` → 返回 OK 但重读仍是 `loot` | **只能重建文档** |
| 批量 | 逐件 `d.update()` → 110 件必 408 | `pack.documentClass.updateDocuments([...], {pack})`（快两个数量级）<br>实测 160 件归档仅 377ms + 663ms |
| 锁定包 | 报 `You may not update documents in the locked compendium "..."` | `await pack.configure({locked:false})` |

### 1.2 重建文档标准写法（最重要的一个模板）

```js
// 内核：读出 → 改内存对象 → 用同一个 _id 重建
const o = 文档.toObject();

// ...在内存里随便改 o...
o.effects = o.effects.filter(e => e._id !== 要删的id);
o.system.activities = {};
o.flags["chris-premades"] = ...;

// ★ 关键三参数
await pack.documentClass.create(o, {
  pack: pack.collection,   // 目标包
  keepId: true             // 保持 _id 不变 ⇒ uuid 不变 ⇒ 其他包的 advancement 引用不断
});
```

**为什么 `keepId:true` 是必须的**
本包有 **88 件职业 advancement 引用法术**。如果重建时换了 `_id`，这些引用全部断链。
实测：GPS 43 件回填用 `keepId:true` 重建后，**引用缺失数 = 0**。

### 1.3 批量写法（省 100 倍时间）

```js
// ✅ 一次提交（实测 160 件 377ms）
await pack.documentClass.updateDocuments(
  目标.map(d => ({ _id: d.id, "system.armor.value": 官方基础值 })),
  { pack: "dnd5e_classpack.itempack" }
);
```

**⚠️ `updateDocuments` 的数组语义**（同 1.1）：
```js
// ❌ 效果变两条
updateDocuments([{_id, effects:[{_id:效果id, name:"新名"}]}])       // 丢字段
updateDocuments([{_id, "effects.0.name":"新名"}])                  // 追加

// ✅ 数量不变、原地更新
updateDocuments([{_id, effects: o.effects.map(e => ({...e, name: 新名}))}])
```

---

## 二 · 读数据手册

### 2.1 拿文档的三种方式

```js
const pack = game.packs.get("dnd5e_classpack.spell");

// ① 建索引（快，但**不含 flags**）
const idx = await pack.getIndex();
idx.contents.forEach(e => e._id);      // ★ 是 _id 不是 id！

// ② 全量拿（慢，含 flags，大包会 408）
const docs = await pack.getDocuments();

// ③ 按 id 拿（推荐：建索引 + 分批）
const d = await pack.getDocument(_id);   // ★ 必须完整 16 位 id，截断的返回 null
```

**★ `getIndex()` 不索引 flags** —— `index.contents[i].flags === undefined`。
用 index 统计挂 CPR 的件数会**恒得 0**（我曾因此误报「classpack 里 CPR = 0」）。要读 flags 必须 `getDocuments()`。

### 2.2 遍历 21 个包的正确姿势

```js
const 包名 = ["itempack","moditems","extra-ability","class-abilityphb","racial-traits",
              "feats-all","spell","subclass","classes-new","loots","races-item",
              "BackgroundList","BackgroundFeature","monster","monsterspack","macro",
              "races","summons","monster","class-table","spell-table"];

// ❌ 一次全遍历 ⇒ 必 408（relay 单次 execute_js 约 35 秒超时）
// ✅ 一次 1~2 个包（最多 4 个小包）
```

**408 之后**：
```
① 先读回确认（实测 408 的调用**其实已经写入**了 42 件）
② 绝不重跑（会造重复）
③ 确认通道活着：跑 `return "活"`
④ 幂等过滤：用「是否已有活动」这类条件当过滤，重跑才安全
```

---

## 三 · 写入的五个不要

```
① 不要逐件 d.update()  —— 110 件必 408
② 不要在没读回的情况下声明成功
③ 不要在 408 之后重跑
④ 不要用 `-=` 删活动（会触发 FeatData.preUpdateActivities 报错）
⑤ 不要忘了 keepId:true（会断掉 88 件 advancement 引用）
```

---

## 四 · 写完怎么验（三件事）

### 4.1 读回验证（改完立刻）
```js
const d = await pack.getDocument(id);
return {
  活动数: Object.values(d.system.activities ?? {}).length,
  活动名: Object.values(d.system.activities ?? {}).map(a => a.name),
  效果数: d.effects.length,
  效果名: d.effects.map(e => e.name),
  关键字段: d.system.xxx,
  flags: Object.keys(d.flags ?? {})
};
```

### 4.2 用 `foundry_diff` 逐路径比对（省一轮）
```js
foundry_diff({
  uuid: "Actor.xxx.Item.yyy",
  expected: {
    "system.rarity": "rare",
    "system.damage.base.denomination": 8,
    "system.activities.dnd5eactivity100.save.dc.formula": "13"
  }
})
// mismatched 非空 ⇒ 没落库或被系统改写 ⇒ 不许当成成功交付
```

### 4.3 全库复扫（每轮收尾必做）
```
检查项（全部应为 0）：
- 活动→效果断链
- triggeredActivityId 断链
- 非法伤害类型 / 非法治疗类型
- 空 uuid 的 cast
- 非法状态 id（★ 6 个已知假 id 除外：腐败/Silence/患病/攻击优势/恍惚/Torch）
- 无活动武器
- 空挂 onUseMacroName=…ItemMacro
- 纯英文物品名
```

**⚠️ 一次扫 20 个包必 408 ⇒ 分批 2~3 包。**

---

## 五 · 特殊场景手册

### 5.1 补一条效果（读旧 + 追加，**不要整段替换**）
```js
const o = d.toObject();
const 新效 = {
  _id: foundry.utils.randomID(),        // ★ 必须恰好 16 位字母数字
  name: "效果名", type: "base",
  transfer: true,                        // 常驻；false = 使用时挂
  disabled: false,
  statuses: [],
  changes: [{ key: "system.traits.dr.value", mode: 2, value: "fire", priority: 20 }],
  duration: { startTime:null, seconds:null, combat:null, rounds:null, turns:null,
              startRound:null, startTurn:null },
  description: "",
  origin: null, tint: "#ffffff", flags: {}, sort: 0
};
o.effects.push(新效);
await pack.documentClass.create(o, { pack: pack.collection, keepId: true });
```
**★ 整段替换会冲掉原有 changes（曾冲掉人类定身术的 OverTime）。**

### 5.2 补一个活动（照抄同族模板）
```js
// ① 先找同类的正确件当模板（别手搓）
const 模板包 = game.packs.get("dnd5e_classpack.spell");
const 模板件 = await 模板包.getDocument("XXX");
const 模板活动 = Object.values(模板件.toObject().system.activities)[0];

// ② 改字段
const 新活动 = { ...模板活动, _id: null, name: "新活动名" };
// ★ 全部 _id 必须恰好 16 位字母数字（17 位会被 5.3.3 拒绝）

// ③ 重建
const o = d.toObject();
o.system.activities[新活动._id] = 新活动;
await pack.documentClass.create(o, { pack: pack.collection, keepId: true });
```

**⚠️ `activity.effects[].level` 一律写 `{}`**（装备类无 level 字段，填值会**静默过滤掉效果**）。

### 5.3 修活动类型（不删，只换内容）
```js
const o = d.toObject();
const 键 = Object.keys(o.system.activities).find(k => o.system.activities[k].name === 目标名);
o.system.activities[键] = 全新活动对象;   // 保留原 key ⇒ 不触发 -= 报错
await pack.documentClass.create(o, { pack: pack.collection, keepId: true });
```
实测：dnd5e 会按新 type **重新实例化**——旧类型字段被清掉、新类型字段自动补上。

### 5.4 删除一件物品
```js
// 用户已授权删除时
await pack.documentClass.deleteDocuments([id], { pack: pack.collection });
```
**⚠️ 删除前必须请示**（说清删什么/为什么/影响范围/有没有备份）。

### 5.5 批量改名（必须锁包）
```js
await pack.configure({ locked: false });     // 21 包里 20 个默认 locked:true
await pack.documentClass.updateDocuments(
  目标.map(d => ({ _id: d.id, name: 新名 })),
  { pack: pack.collection }
);
```

---

## 六 · CPR / GPS 专题手册

### 6.1 匹配机制（★ 不是靠名字！）
```
CPR（chris-premades）：靠 flags["chris-premades"].info.identifier（驼峰，如 cloudOfDaggers）
GPS（gambits-premades）：靠**英文物品名**（identifier 是短横线，如 cloud-of-daggers）
归一化函数：s.toLowerCase().replace(/[^a-z0-9]/g, "")
```
**⚠️ 匹配必须用 `identifier`，名字会配错件**：
反面案例 —— 本包「护盾术 Shield」(`ident: shield`) 按名字搜 "Shield" ⇒ 命中
`CPRMonsterFeatures` 的 `"Shield"`，其 ident 是 **`shieldGuardianShield`（盾牌守卫的盾）**，
完全另一个东西**且不报错**。

### 6.2 CPR 回退的替换规则
| 用 CPR 官方的 | 保留本包的 |
|---|---|
| `system.activities`（自动化核心） | `name`（中文名） |
| `flags["chris-premades"]`（宏绑定/版本号） | `system.description.value`（中文描述） |
| `flags["midi-qol"]`（`itemCondition` 等触发条件） | `effects`（★ 见下） |
| `flags["midiProperties"]` / `flags["dnd5e"]` | `img` 等元数据 |

**★★ 反常识点：官方效果反而更差。**
官方护盾术效果 = `{"name":"Shield","changes":[{"key":"system.attributes.ac.bonus","mode":2,"value":"5"}],"duration":{"rounds":1,"seconds":null}}`
⇒ `seconds:null` ⇒ 无战斗时算不出剩余时长。本包版本已修成 `{rounds:1, seconds:6}` ⇒ **更完整**。
**所以效果不替换，只同步活动 + flags。**

### 6.3 CPR 嵌入宏三条路径
```js
{ name, type:"midi-item", pass:"rollFinished", priority:50, macro:"JS串" }   // 物品级
{ name, type:"combat",    pass:"turnStartNear", priority:50, macro:"JS串" }  // 挂 AE 上（trigger.entity = 效果本体）
flags.chris-premades.embeddedActivityMacros.<activityId> = [...]             // Activity 级
```
官方写入函数：`macroUtils.addEmbeddedMacro(doc, { name, type, pass, priority, macro })`

### 6.4 17 类事件 × pass（实测 `getAllDocumentPasses`）
```
check     : situational/sceneSituational/context/bonus/sceneBonus/post
save      : (+targetSituational)
aura      : create
combat    : turnEnd/turnStart/everyTurn/turnEndNear/turnStartNear/combatStart/combatEnd
item      : created/deleted/actorCreated/actorDeleted/equipped/unequipped/
            actorEquipped/actorUnequipped/itemMedkit/actorMedkit/actorMunch/updated/actorUpdated
death     : dead
effect    : actorCreated/actorDeleted
midi-item : preTargeting/preItemRoll/preambleComplete/preAttackRollConfig/postAttackRoll/
            attackRollComplete/savesComplete/damageRollComplete/rollFinished/
            applyDamage/utilityRollComplete …（共 29 个）
midi-actor: 同 29 个
movement  : moved/movedScene/movedNear/create/sceneCreate/deleted/sceneDeleted
region    : （空）
rest      : short/long
skill     : 
template  : （空）
toolCheck : 
d20       : preEvaluation/scenePreEvaluation/postEvaluation/scenePostEvaluation
time      : timeUpdated
```
**宏内可用变量**：
- `midi-item` 得 `{trigger, workflow, ditem}`
- `combat` 得 `{trigger}`（`trigger.entity` = 效果本身）
- 宏体内可直接裸用：`effectUtils / rollUtils / workflowUtils / itemUtils / macroUtils /
  dialogUtils / tokenUtils / combatUtils / actorUtils`

### 6.5 「可选触发」怎么写（用户最想要的能力）
**机制：CPR 宏在触发时调 `dialogUtils.confirm()` 弹确认框。**
```js
// ① 给物品加 config（医药箱"配置"页的来源）
flags["chris-premades"].config = { auto: false };

// ② 宏里读它
const 配置 = itemUtils.getConfig(源物品, "auto");       // 物品值优先 → 宏 default
if (!配置) {
  const 确认 = await dialogUtils.confirm(
    物品名,
    `是否将 <b>${目标名}</b> 推离 5 尺？`
  );
  if (!确认) return;
}
```
**完整 config 结构**：
```js
config: [{ value:"auto", label:"自动使用", type:"checkbox", default:false, category:"mechanics" }]
// type 只有四种：checkbox / select / text / file
// category：animation / sound / mechanics / homebrew
// 读：itemUtils.getConfig(item, key)   写：itemUtils.setConfig(item, key, val)
```

### 6.6 其他常用 API
```js
combatUtils.perTurnCheck(entity, identifier)     // 每回合判重（用 combat round-turn 作键）
combatUtils.setTurnCheck(entity, identifier)
actorUtils.hasUsedReaction / setReactionUsed / hasUsedBonusAction / setBonusActionUsed
effectUtils.createEffect(entity, effectData, { concentrationItem, parentEntity, identifier })
effectUtils.getEffectByIdentifier(actor, identifier)
effectUtils.applyConditions(actor, [statusId])
tokenUtils.pushToken(origin, target, 距离)
rollUtils.requestRoll(actor, rollType, ability, options)
dialogUtils.confirm(title, html, {userId, buttons}) → true/false
dialogUtils.selectDialog(title, html, {label, name, options:{options:[...]}}) → 选中值
dialogUtils.buttonDialog(title, html, [[label, name], ...])
macroUtils.getMacro(identifier)   // ★ 跨新旧库查，是查 CPR 宏存不存在的官方 API
```

---

## 七 · 更新同步（包改了，卡上副本不会跟）

```
★ 改的永远是 compendium 里的**原件**。
★ 已拖到角色卡上的物品是**独立副本**，包改了不会自动更新。

要生效必须：
① 重新从包里拖一次，或
② 直接改卡（⚠️ 违反硬约束，需用户明确同意）
```

**这也是「改包不改卡」策略的代价**：修好的包对新卡立即生效，旧卡要重拖。
每次修完要提醒用户这一条。

---

## 八 · 落盘模板（每轮收尾）

```markdown
# <项目名> · <本轮主题>（YYYY-MM-DD）

## 用户指令（逐字）
> 「...」

## 一 · 发现了什么
<表格：件 / id / 错在哪 / 证据>

## 二 · 改了什么
<表格：id / 改前 / 改后 / 读回结果>

## 三 · 运行时实测证据
<脚本 + 输出>

## 四 · 全库复扫
<数字>

## 五 · 踩坑
<现象 → 根因 → 正确做法>

## 六 · 未做 / 待办

## 七 · 环境常量
```

**落盘位置**：`01_跑团工具\FVTT技术资料\dnd5e_classpack-<主题>-<日期>.md`
**并且**：在 `01_跑团工具\FVTT技术资料\_索引.md` 对应位置插一条 ⭐ 条目。

---

## 附 · 2026-10-08 新增（十批抽样轮，全部实测）

### A · `mode 1 = MULTIPLY`（乘法）—— mode 语义补全

| mode | 语义 | 备注 |
|---|---|---|
| 1 | **MULTIPLY（乘法）** | ★ 新增。填 "2" 就是 ×2 |
| 2 | ADD（相加） | 数值取加、公式会被包成 `min(a,b)`；字符串字段多为拼接 |
| 3 | DOWNGRADE（**取更小值**） | **不是禁用！** 禁要用 `disabled:true` |
| 4 | UPGRADE（取更大值） | |
| 5 | OVERRIDE（覆盖） | StringField 必须用这个 |

**「移速加倍」的官方写法**（`dnd5e.spells` 加速术 / `dnd5e.equipment24` 速度之靴逐字一致）：
```js
{ key: "system.attributes.movement.walk",   mode: 1, priority: 20, value: "2" }
{ key: "system.attributes.movement.fly",    mode: 1, priority: 20, value: "2" }
{ key: "system.attributes.movement.climb",  mode: 1, priority: 20, value: "2" }
{ key: "system.attributes.movement.swim",   mode: 1, priority: 20, value: "2" }
{ key: "system.attributes.movement.burrow", mode: 1, priority: 20, value: "2" }
```
**⚠️ 移速字段绝不能自引用** —— 实测 `walk = @attributes.movement.walk`（m2）与 `2*@…`（m5）**都归零**；
跨字段引用安全（`fly = +@walk` → 30 ✓、`fly = 2*@walk` → 60 ✓）；`movement.all` m2 `+30` **无效**。

### B · 工具熟练：`system.tools.<id>.value`（不是 `traits.toolProf`）
```js
{ key: "system.tools.tinker.value", mode: 5, priority: 20, value: "1" }   // ✓ 实测生效
{ key: "system.traits.toolProf.value", mode: 2, priority: 20, value: "tinker" }  // ✗ 拆成 7 个单字符
```
`traits` 真实子字段：`size, di, dr, dv, dm, ci, languages, weaponProf, armorProf`（**无 toolProf**）。
工具 id 全集：`CONFIG.DND5E.tools`（44 项）。

### C · `consumption.targets[].target` 写 **identifier**，不写 uuid
```js
{ type: "itemUses", value: "1", target: "sorcery-points", scaling: { mode: "", formula: "" } }
```
已用 identifier 的池：`sorcery-points`（术法点）/ `channel-divinity`（引导神力）/ `superiority-dice`（卓越骰）/ `ki-points`（气）/ `wild-shape`（荒野形态）。
**⚠️ 同一活动的 `targets` 里去重** —— 实测发现 2 件写了两条完全相同的消耗项（会扣两次）。

### D · `bonuses.*` 读回是字符串 = 正常
`system.bonuses.mwak.attack` 写入 `+@abilities.cha.mod` 后读回仍是该字符串 —— dnd5e 在**掷骰时**才替换 `@`。
**验证法**：`new Roll("0" + 值, actor.getRollData()).evaluateSync().total`。
**副产品**：`system.bonuses.weapon.attack` 同时影响 mwak 与 rwak。

### E · AC5E 的「对抗法术」条件写法（照抄「侏儒魔法抗性」）
```js
{ key: "flags.automated-conditions-5e.save.advantage", mode: 5, priority: 20,
  value: "!!(originItem && originItem.school) || !!originActivity && !!originActivity.school" }
```

### F · 实测扫描到的真问题形态（可复用判据）
1. **效果/活动一条不缺但「0 效果」** ⇒ 先查四种合法形态（自选专长 `flags.your-feats` / CPR `embeddedMacros` / ActiveAuras / dnd5e 原生 flag）
2. **同一活动 `consumption.targets` 有完全重复的项** ⇒ 会重复扣
3. **`flags.midi-qol.onUseMacroName` 里 `,` 后带空格** ⇒ midi 不 trim pass 名，会解析失败
4. **描述的「N 点资源」与 `consumption` 不符** ⇒ 逐条对照（本轮 9 件超魔法全缺）
5. **`flags.ActiveAuras.isAura:true` 但模块没装** ⇒ 光环完全不生效（改走 Aura Effects / region-attacher）
