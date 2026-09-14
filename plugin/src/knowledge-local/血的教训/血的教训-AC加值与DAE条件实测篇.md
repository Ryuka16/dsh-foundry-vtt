# 血的教训 · AC 加值被吞 与 DAE 条件表达式

> 来源：2026-09-17 制作「青脑叁型」三模块怪物（安保/医疗/搜救）时的实测。
> 两条都有源码或实机证据，不是推测。**写怪物、写 AC 类效果、写条件效果前必看。**

---

## 一、AC 加值被吞 —— `ac.calc` 写 `"flat"` 就完全不吃加值

### 现象

给怪物写「有临时生命值期间 AC +2」：

```json
"ac": { "calc": "flat", "flat": 15 },
// 效果 changes: [{ "key": "system.attributes.ac.bonus", "mode": 2, "value": "2" }]
```

实测读回 `ac.value` = **15**，加值**没生效**，而且**不报任何错**。

### 根因（源码实据）

`F:\FVTT\data\systems\dnd5e\dnd5e.mjs` 的 `prepareFinalData`：

```js
// L40278-40286
switch ( ac.calc ) {
  // Flat AC (no additional bonuses)
  case "flat":
    ac.value = Number(ac.flat);
    return;                          // ← 直接 return，后面所有加值逻辑全跳过
  // Natural AC (includes bonuses)
  case "natural":
    ac.base = Number(ac.flat);
    break;                           // ← 走完整计算
  ...
}

// L40332-40335
ac.min   = simplifyBonus(ac.min, rollData);
ac.bonus = ...;
ac.value = Math.max(ac.min, ac.base + ac.shield + ac.bonus + ac.cover);
```

注释原文就写着 **「Flat AC (no additional bonuses)」** —— 这是设计如此，不是 bug，但**很容易踩**。

### 正确写法

想要 AC 加值 → **`calc` 必须写 `"natural"`**：

```json
"ac": { "calc": "natural", "flat": 15 }
```

实测：改 `natural` 后 `ac.value` = **17**（15 + 2）✓

### 附带：`ac.min` 就是「AC 下限」字段

源码 `L40335` 的 `Math.max(ac.min, ...)` 说明 **`system.attributes.ac.min` 就是 AC 下限**。
要写「AC 不会降低至 15 以下」，AE 用：

```json
{ "key": "system.attributes.ac.min", "mode": 5, "value": "15" }
```

> **自我更正**：交付「青脑叁型」时我曾当面跟用户断言「AC 下限做不了自动化」。
> 有 `Math.max(ac.min, ...)` 这行源码就不该那么说。**先查源码，别凭印象否定。**

---

## 二、DAE 条件表达式 —— `enableCondition` 与 `disableCondition` 别用错【本节已更正】

### ① 表达式必须带 `@` 前缀（否则字段不被替换）

DAE 的条件表达式不是 JS，是**先做字段替换再求值**。验证方法（用 DAE 自己的 API，一次问清）：

```js
const ev = game.modules.get('dae').api.evalExpression();
ev('@attributes.hp.temp > 0', actor.getRollData());   // → "20 > 0"          ✅ 替换成功
ev('attributes.hp.temp > 0',  actor.getRollData());   // → 原样返回该字符串   ❌ 没替换 ⇒ 条件恒真
```

⇒ 写法一律用 `@attributes.xxx` / `@abilities.xxx` 这种**带 @** 的形式。

### ② ★ 更正：不是「不重评」，是**字段用错了**

**我当时的错误**：把条件写在 `enableCondition` 上，而那是给**非转移效果**用的字段。
「防护插板」是 `transfer: true` 的常驻被动效果 —— **根本不在 `enableCondition` 的作用范围**，
所以条件怎么写都没反应，我却由此得出了「DAE 不重评」的错误结论。

**两个字段的分工**（出自 DAE 官方变更日志原文）：

| 字段 | UI 名 | 语义 | 适用范围 |
|---|---|---|---|
| `enableCondition` | 表达式，如果为假将从角色中移除效果 | 假 → **删除**效果 | **仅非转移效果**（物品使用后施加到目标身上的效应） |
| `disableCondition` | 表达式，如果为真将禁用效果 | 真 → **标记禁用**（不删除） | **所有效果，含转移 / 被动** |

变更日志原话：enable 条件是 `"Added effect enable condition to non-transfer active effects"`，
disable 条件 `"works with all effects"`。

### ③ 求值时机：效果应用时 + 携带者被 `update()` 时

- 在**效果被应用时**、以及**携带该效果的 actor / token 被 `update()` 时**重新求值。
- **来源端**（施放者 / 物品）更新**不触发**检查。
- 不是连续监听或轮询 —— 只有真的发起 `actor.update()` / `token.update()`
  （角色卡编辑、token HUD 拖血、midi 结算伤害、宏里调用 update）才会重评。
- ⚠️ **测试时别在控制台直接改内存**（不触发 update，看起来就像「不重评」）。

### ④ 实测复现（2026-09-17，青脑叁型·安保模块）

```
效果 _id = armorPlate000001（transfer: true，changes = system.attributes.ac.bonus mode2 "2"）

await eff.update({ 'flags.dae.disableCondition': '@attributes.hp.temp <= 0',
                   'flags.dae.enableCondition': null });
                                                    → AC 17 / temp 20 / disabled false
await actor.update({ 'system.attributes.hp.temp': 0 });   + 等 900ms
                                                    → AC 15 / acBonus 0 / disabled = true  ✅
await actor.update({ 'system.attributes.hp.temp': 20 });  + 等 900ms
                                                    → AC 17 / disabled = false             ✅ 恢复
```

⇒ **「有临时 HP 期间 AC +2」完全自动**，不需要 GM 手动禁用，也不需要写宏。
（本节原先那句「防护插板效果默认挂着 = AC 永远 17，需 GM 手动禁用」**已作废**，
物品描述里的手动提示也已删掉。）

### 实务结论（替换原来的「建议改用物品宏」）

| 需求 | 做法 |
|---|---|
| 被动效果随字段开关（如本例） | **`flags.dae.disableCondition`** + 确保 actor 走 `update()` |
| 更强的响应式（距离、多字段联动、事件驱动） | `flags.dae.onUpdateTarget` / `onUpdateSource` + 物品宏；或 DAE 条件效果物品（DAEConditionalEffects）；或模块 **SC - Conditional AE** |
| 一次性逻辑（使用时触发） | 物品宏 / onUseMacro（**不适合**持续 AC 加成） |

**配套**：AC 是派生值 —— 加值走 `system.attributes.ac.bonus`（mode 2）、覆盖走 `ac.flat`、下限走 `ac.min`；
直接改 `ac.value` 会被系统公式覆盖（这也是第一节 `flat` 吞加值的根源）。

---

## 三、顺带记下的「青脑叁型」其他实测

- **免疫与语言的真实路径**：`system.traits.di.value` / `traits.ci.value` / `traits.languages.value`
  —— 不是 `attributes` 下的 `damage.immunities` 那套旧路径（很多老骨架写错了）。
- **感官在 `senses.ranges.*` 下**，不是 `senses.darkvision` 直挂。
- **`skills.<三字母>.value`** = 熟练等级（0 无 / 1 熟练 / 2 专精）；被动察觉由系统自动算（察觉+2 → 12）。
- **多重攻击不是 `system.actions`**：是 feat 物品 + `type:"utility"` 活动，
  点了只在聊天卡提示，**不会自动打两次**（官方暮光审判官 / 铁卫都这么做）。
- **每回合回血**：feat 的 heal 活动 + 物品级 AE 的
  `flags.midi-qol.OverTime = "turn=start, damageRoll=10, damageType=healing, condition=@attributes.hp.value > 0"`
  —— **`damageType=healing` 就是回血的实现方式**。铁卫「核心再生」逐字形态，可直接照抄。
- **NPC 攻击加值别写死**：`attack.ability:"str"` + `damage.parts[].bonus:"@mod"`，熟练由系统自动加。

---

## 四、写文档时自己的坑（给下一个 AI）

改 `src/reference.ts` 这类**大模板字符串文件**时：

**`old_string` 末尾带的标点 / 反引号，`new_string` 必须原样保留。**

本次翻车经过：加 5 条坑到 `pitfalls` 主题时，`old_string` 末尾是
`...实体名可直接写中文。\``（带**闭合反引号**），我把 `new_string` 写成
`...实体名可直接写中文。\n<新增内容>` —— **没带那个闭合反引号**。

后果：整个主题的模板字符串从那里断掉，后面 1000 多行全被当成字符串内容，
`tsc` 报 **200+ 个错**（TS1127 Invalid character / TS1434 / TS1160 Unterminated template literal），
错误从 1797 行一路报到 2004 行，**根本看不出是 1017 行出的问题**。

**定位手段（一次就能定位，比读报错快得多）**：
写个脚本，按行统计反引号累计数量，逐主题检查区间内反引号是否恰好 2 个：

```js
const lines = fs.readFileSync('src/reference.ts', 'utf8').split('\n');
const keys = [];
for (let i = 0; i < lines.length; i++)
  if (/^  '?[a-z-]+'?: `/.test(lines[i])) keys.push({ line: i + 1, start: i });
for (let k = 0; k < keys.length; k++) {
  const to = k + 1 < keys.length ? keys[k + 1].start : lines.length;
  const c = (lines.slice(keys[k].start, to).join('\n').match(/`/g) || []).length;
  if (c !== 2) console.log(`⚠️ 主题 L${keys[k].line} 区间反引号=${c}（应为 2）`);
}
```

**一条命令就指到了 1017 行的 `pitfalls`** —— 而读 tsc 的报错只会被 1797 行带偏。
