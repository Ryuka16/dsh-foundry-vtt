# Midi-qol 物品宏使用指南

> **认真读：这是一份「不使用世界脚本」的物品宏正解指南。**
> 你要做的「物品使用/命中后触发效果」自动化，**绝大多数可以用物品宏实现，不需要 world-scripter 世界脚本**。
> 本文所有机制均来自用户世界**已验证的金标准**（磁轭手铳 / 银鳞护佑 / 传送门装置 / 奥能科技拳套）
> 与权威资料（43-midi-qol标志参考.md / 34-力竭.md / FVTTdata-dict §26 / 29-DND5e v5.x.x.md）。
> 每条标注出处，照着抄即可。

---

## 0. 核心心法（30 秒看完）

**物品宏 = 把一段 JS 挂在「物品的 flags」上，让 midi-qol 在物品被使用的某个「时点」自动执行它。**
- 触发载体：物品的 `flags.midi-qol.onUseMacroName` 或 `itemacro.macro` 或 `dae.macro`。
- 触发时点：midi 的 **macroPass**（物品被使用/攻击/伤害/效果 各阶段）。
- 你只需要写：**宏体 JS**（读 workflow → 拿目标 → 执行效果）。

**做物品宏的三个必答问题：**
1. 挂在哪？（物品级方括号式 vs AE 级逗号式）
2. 何时触发？（macroPass）
3. 宏体怎么拿目标？（workflow.hitTargets）

---

## 1. 三种「宏」的存放位置（别搞混）

来源：data-dict §26、29-DND5e v5.x.x.md Line 84

| 宏类型 | 存放位置 | 触发时机 |
|---|---|---|
| **物品宏** | 物品标题栏「DIME」（DAE 物品宏编辑器）或 `flags.dae.macro` / `flags.itemacro.macro` | 该物品**被使用**时 |
| **行动宏** | 行动标题栏「行动宏编辑器」或 Midi 页底 | 该**行动**动作时 |
| **世界宏** | 右侧栏 `</>` 宏目录（需要时手动/被调用） | 手动或 hook/token 引用 |

> **本指南只讲「物品宏」**——因为它适合「物品使用、命中触发」类需求，且不需要额外世界脚本文件。

---

## 2. 物品宏的三件套（金标准结构）

出处：磁轭手铳 Line 222-233。

### 写法 A：`dae.macro` + `midi-qol.onUseMacroName`（最常用）

```json
"flags": {
  "dae": {
    "macro": {
      "name": "<宏名>",          // 任意名字
      "type": "script",
      "scope": "global",
      "command": "<宏体 JS 字符串>"
    }
  },
  "midi-qol": {
    "onUseMacroName": "[postActiveEffects]ItemMacro"
  }
}
```

### 写法 B：`itemacro.macro` + `midi-qol.onUseMacroName`
与写法 A 等价，只是宏体放在 `itemacro.macro.command`（DIME 编辑器自动生成）。磁轭手铳是写法 A（只有 dae.macro）。

> **判定：你的物品要么用 dae.macro、要么用 itemacro.macro，二选一存宏体；onUseMacroName 负责告诉 midi「在此时点调这个物品宏」。**

---

## 3. onUseMacroName 的两种写法（最关键，别混）

### 3.1 物品级（物品的 flags.midi-qol.onUseMacroName）—— 方括号旧式
```json
"midi-qol": { "onUseMacroName": "[postActiveEffects]ItemMacro" }
```
- 触发：**这个物品被使用**（施放/攻击）时，在指定阶段调用「物品本身」的宏（ItemMacro）。
- 出处：磁轭手铳 Line 232；用户世界 11 处物品全是此模式。

### 3.2 AE 级（效果/ActiveEffect 上的 flags.midi-qol.onUseMacroName）—— 逗号式
```json
"flags": { "midi-qol": { "onUseMacroName": "ItemMacro, postAttackRoll" } }
```
- 触发：**角色身上挂着这个效果**，使用任意物品时，在指定 macroPass 调用宏。
- 值格式 = **`宏引用, 传递类型`**（逗号分隔）。出处：43-midi-qol标志参考.md Line 49-57。
- 宏引用可 = `ItemMacro.{起源物品UUID}` / `ActivityMacro.{uuid|名称}` / `Macro.{宏名}`；多个用逗号连接。
- **非转移效果上 `ItemMacro` 会被自动重写成 `ItemMacro.{起源物品UUID}`**（Line 62-63）——所以 AE 的 `origin` 必须填。

### 3.3 两种写法怎么配合（「命中后引爆」范例）
- **物品级**（施放时）→ 执行「施放挂钩」：给角色挂一个带 AE 级 onUseMacroName 的效果。
- **AE 级**（命中时）→ 执行「引爆」：效果挂到角色后，角色每次武器攻击命中，都触发引爆宏。

```json
// 效果(AE) 关键字段：
{
  "name": "冲击印记",
  "transfer": false,
  "origin": "<物品UUID>",          // ★ 必填，否则 ItemMacro 重写成空
  "changes": [
    { "key": "flags.midi-qol.onUseMacroName", "mode": 0, "value": "ItemMacro, postAttackRoll", "priority": 20 }
  ],
  "duration": { "seconds": 60 },
  "flags": { "dae": { "stackable": "noneName", "showIcon": true } }
}
```

---

## 4. macroPass 全表（判断「在第几步执行」）

来源：Midi-Wiki Cheat Sheet；34-力竭.md Line 68。

| macroPass | 含义 | 常用于 |
|---|---|---|
| preItemRoll | 物品掷骰前 | 改骰前 |
| preAttackRoll | 攻击掷骰前 | 攻击加值调整 |
| preCheckHits | 攻击后、判定命中前 | |
| **postAttackRoll** | **攻击判定后** | **命中引爆** |
| preDamageRoll | 伤害掷骰前 | |
| postDamageRoll | 伤害骰后 | 附加伤害 |
| preSave / postSave | 豁免前/后 | |
| postActiveEffects | 动态效果生效后 | **施放附魔** |
| isDamaged / isHealed | 受击/治疗 | |

**宏体取时点：**
```js
const mp = String(args?.[0]?.macroPass ?? '');
```

---

## 5. 宏体骨架（抄这个，改效果即可）

### 5.1 通用骨架（读 workflow → 拿攻击者/目标/物品）
来源：磁轭手铳宏体。

```js
(async () => {
  // 1. 攻击者（token / actor）
  const me = canvas.tokens.controlled[0] ?? (typeof token !== "undefined" ? token : null);
  if (!me) return;
  const caster = me.actor;

  // 2. workflow（攻击流程上下文）
  const wf = (typeof workflow !== "undefined" && workflow) ? workflow
    : ((typeof MidiQOL !== "undefined") ? (MidiQOL.currentWorkflow ?? null) : null);

  // 3. 目标（命中才有 hitTargets；miss 为空）
  const target = Array.from(wf?.hitTargets ?? [])[0]
    ?? Array.from(wf?.targets ?? [])[0]
    ?? Array.from(game.user.targets ?? [])[0] ?? null;
  if (!target) return;                 // ★ miss → 不触发

  // 4. 源物品（若宏在物品上，可用 wf.item）
  const myItem = wf?.item ?? wf?.activity?.item ?? wf?.rolledItem ?? (typeof item !== "undefined" ? item : null);

  // 5. 这里的 `${}` 由 macroData 的 command 引擎解析
  // ... 你自己要的效果逻辑 ...
})();
```

### 5.2 macroPass 分流（施放 vs 命中）
```js
const mp = String(args?.[0]?.macroPass ?? '');
const IS_HIT = mp === 'postAttackRoll' || mp === 'postDamageRoll' || mp === 'postDamageApplication';
if (IS_HIT) {
  // 命中 → 引爆效果
} else {
  // 施放（mp=postActiveEffects）→ 挂附魔效果 / 附魔武器
}
```
> ★ **切勿用 `hitTargets > 0` 判定**——施放法术时用户选的施放目标也会计入 `hitTargets`（=1），会把「施放」误判成「命中」。

### 5.3 命中后「才触发」的正确姿势
**靠读 hitTargets，不靠拦截：**
```js
const target = Array.from(wf?.hitTargets ?? [])[0] ?? ... ?? null;
if (!target) return;   // miss → hitTargets 空 → return，天然「命中才触发」
```

---

## 6. 常用「效果」键（挂在 AE changes 里，给 midi 读）

> **用前先 grep 确认！** 以下都是用户在用的真实键。任何没把握的键，先在 data-dict / 用户世界导出里找样本，0 样本 = 别用。

| 效果 | key | mode | value | 说明 |
|---|---|---|---|---|
| 附加伤害（命中目标） | `flags.midi-qol.optional.NAME.damage.all` | 0 | `"1d6[force]"` | Optional 加值；配 `.force` 填条件真则强制+伤害不弹窗 |
| 附加伤害（武器攻击） | `system.bonuses.mwak.damage` / `rwak.damage` | 2 (ADD) | `"1d4[fire]"` | 伤害加值；熔火战旗/秘法魔剑士在用 |
| 持续伤害（DoT） | `flags.midi-qol.OverTime` | 0 | `turn=start,damageRoll=1d4,damageType=piercing,label=放血` | 逗号参数串；可加 saveDC/saveAbility/saveCount |
| 无视护甲 | `flags.midi-qol.ignoreArmor` | 0 | `"true"` | 破甲 |
| 无视盾 | `flags.midi-qol.ignoreShield` | 0 | `"true"` | |
| 重击阈值 | `flags.midi-qol.criticalThreshold` | 0 | `"19"` | 19-20 重击 |
| 移动减速 | `system.attributes.movement.walk` | 1 (MULTIPLY) | `"0.5"` | 速度减半 |
| 移动加速 | `system.attributes.movement.walk` | 0 (CUSTOM)* | `"10"` | *部分系统用 ADD；按实测 |

### mode 表（ACTIVE_EFFECT_MODES）
`0=CUSTOM(交模组处理, midi flags 都用这个) / 1=MULTIPLY乘 / 2=ADD加 / 3=DOWNGRADE / 4=UPGRADE / 5=OVERRIDE`

### AE 创建时易错点
- **origin 必填**：`origin: myItem?.uuid`，否则 ItemMacro 重写成空。
- **勿 JSON.stringify token/actor**（circular 必崩）；打日志用 `console.log(对象)`。
- **identifier 只能英文/数字/破折号/下划线**，不能用中文。

---

## 7. 完整实例：冲击印记（命中后引爆，midi 13.0.55 实测通过）

产物：`FVTT房规\自然猎手\冲击印记.json`

**实现流程：**
1. 物品级 `onUseMacroName="[postActiveEffects]ItemMacro"` → 施放时宏体走「施放分支」：给角色挂一个带 `flags.midi-qol.onUseMacroName="ItemMacro, postAttackRoll"` 的效果(AE)。
2. 角色带该 AE 后，每次武器攻击命中（postAttackRoll）→ 宏体走「引爆分支」：弹 Dialog「引爆撞击」→ 左键点地图选方向 → 目标体质豁免 → 击退 10 尺 + 撞生物/撞墙伤害 → 交 YGM.request 执行移动和伤害。

**已验证链路**（用户 F12 日志原话）：
```
施放:  冲击印记[宏] {mp: "postActiveEffects", itemType: "spell", hasBrand: false} → "武器附魔完成"
攻击:  冲击印记[宏] {mp: "postAttackRoll", itemType: "weapon", hasBrand: true}  → 弹"引爆撞击" → "左键点地图选冲击方向"
结算:  rollDmg → YGM.request → applyDamage（木桩被击退 + 受伤）✅
```

---

## 8. 铁律清单（做物品宏前过一遍）

1. **先抄已有金标准**（磁轭手铳/银鳞护佑/传送门装置/奥能科技拳套/唤水铃），别发明。
2. **每个 flags 键先 grep 验证**，0 样本 = 臆造键，禁用。
3. **时点找准**：命中引爆=`postAttackRoll`；效果添加=`postActiveEffects`。
4. **格式匹配**：物品级方括号式；**AE 级逗号式** `ItemMacro, postAttackRoll`。
5. **AE origin 必填**，否则宏静默失败。
6. **宏体 `new Function()` 校验通过**再交付；打日志别 JSON.stringify(token)。
7. **一次只做一个**，通了再复制到同类。
8. **用户拖给你的资料 = 金标准**，逐行读完再动手。

---

## 9. 参考文件索引

| 用途 | 路径 |
|---|---|
| 命中后物品宏金标准 | `怪物与物品卡\fvtt-Item-磁轭手铳-lodestone-hand-cannon-GvkWUmv1yELXojBh.json` |
| 物品宏 DIME / 宏存放 | `飞书知识库\29-DND5e v5.x.x.md`（Line 84） |
| onUseMacroName 逗号式/AE 级 | `飞书知识库\43-midi-qol标志参考.md`（Line 49-63） |
| macroPass 判别范本 | `飞书知识库\34-力竭.md`（Line 68） |
| 全部标志/效果键全表 | `FVTT-data-dict-v9_1.md`（§14 CPR、§26 onUseMacroName、§29 激活条件） |
| 血的教训（为何别重蹈覆辙） | `血的教训-强迫目标移动篇.md` |

> **产物均已实测**：冲击印记（命中后引爆击退）在 midi 13.0.55 完整跑通。其余同类法术可照此套用。
