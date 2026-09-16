# FVTT 已验证数据字典 v9（自包含 + CONFIG 快照 + 视野/命名/动画坐实）

> 《FVTT 怪物 AI 生成规范 v1.7》的配套数据字典。所有枚举/路径/CPR 配置均来自真实控制台导出与真实 item 导出，**已验证可直接填**。
>
> **v9.2 补订（法术处理总则）**：配套规范 v2.0.2 确立「**官方法术只列清单、自创才手写**」——官方法术（《5E万法大全》清单中有，英文名匹配）不再建 stub item、不进 Actor JSON，直接随怪列一份清单（中文名 + 英文名 + 环阶）交 DM 用自有 FVTT 版本配置；§6bis F 旧"建 stub item 再用 CPR 医药箱匹配"做法相应收紧（见下 §6bis F）。只有清单中没有的自创 / 魔改法术才按 §6bis 手写外壳 + activity + effect。理由：手写官方法术机制极易出错，FVTT 内已有权威自动化版本。
> **v9.1.1 补订（UUID 库）**：新增 **§37「法术 / 物品 UUID 库」**——DM 用 F12 一次性导出的全库 name→UUID（50 包、2905 条），供怪物施法者交付时按 UUID 从世界包挂接官方法术（不写进卡，配规范 v2.1 §M8 挂接宏）。
> **v9.1 补订（术语层）**：以用户本地化包 F12 探针（`game.i18n.localize(CONFIG.DND5E.*)`）逐字导出，新增 **§36 术语对照表（国内官方译名 / 卡面用词权威源）**——伤害 / 治疗 / 状态 / 属性 / 技能 / 学派 / 生物类型 / 物品属性的玩家可见中文全部以本地化包为准坐实。重点：① `psychic`=**心灵**（非"精神"）、`necrotic`=**暗蚀**（非"死灵"；"死灵"仅指 `nec` 学派=死灵系）；② **就地纠正 §5 三处技能译名**与包不符：`acr` 杂技→**特技**、`med` 医疗→**医药**、`sur` 生存→**求生**；③ 收录 sgeh-monkeydm 枪械属性 + `dazed`/`flanked` 译名；`SGEH.property.wep.rlf`/`rls` 为未解析键、用不到不收。配套规范同步加「卡面术语照 §36」硬规则。
> **v9**：经 F12 探针（木桩 token 导出 / AA 6.8.1 autorec 全库 dump / 火球·暗影步 item flag）坐实 **视野·命名·动画** 三层——新增 **§33 视野映射**（`senses.ranges.*`→`prototypeToken.sight`+`detectionModes`；id：darkvision=`basicSight`、truesight=`seeAll`、blindsight=`blindsight`、tremorsense=`feelTremor`、见光=`lightPerception`）、**§34 指示物命名**（`appendNumber` 默认 false 不加数字后缀；普通小怪开 `prependAdjective` 随机形容词前缀）、**§35 动画 `flags.autoanimations`**（外壳 + melee/range/templatefx/ontoken/preset 五形态 schema + 合法 `dbSection→menuType→animation` 全词库 + variant/color 取值 + 招式调色板 + `enableCustom`+`customPath:"jb2a.…"` 直引）。配套规范升 **v2.0**。
> **v8**：以 **F12 控制台 `CONFIG.DND5E` 全量 dump（3 轮）** 为权威源，新增 **§32 CONFIG 权威枚举快照**——把怪物生成会用到的全部枚举一次性逐字坐实并集中收录：目标/模板/活动/激活/时长/消耗/恢复/范围类型、伤害/治疗/生物/状态/学派、属性/技能/体型/语言/感官/移动、武器/护甲/装备/特性/消耗品类型、稀有度/调律、施法进阶/升环/方式、阵营、单位。**自此枚举层全闭环，无须再逐个导 item 试探。** 重点变更：① `affects.type` 全 9 值坐实（含 `enemy`/`willing`/`object`/`space`/`creatureOrObject`/`any`），**§5bis 闭环**；② 模板 `areaTargetTypes` 坐实 10 值，**纠正旧版 `rect` 笔误**（系统无此值）；③ `consumption.targets[].type` 全集坐实（`activityUses/itemUses/material/hitDice/spellSlots/attribute`），§9bis 扩充；④ `activation.type`(17 值)、`duration.units`(12 值)、`range.units`、`featureTypes`/`equipmentTypes`/`itemRarity`/`attunementTypes`/`spellProgression` 等全部坐实。涉及 §0 索引、§5bis、§9bis、§32(新)、待补项。
> **v7**：经新探针（木桩 / 火球魔杖 / 威力法杖 / 焦炉守夜人炉火吐息）坐实两组实测必需结构——① **§9bis uses.recovery 全谱**（`recoverAll`/`formula`+`formula` 骰子串）+ 两段式（item `uses` + activity `consumption.targets`）；② **§5bis 目标 `affects.type` 阵营枚举**。
> **v6**：吸收 **midi 入门指南 / 宏相关 / OvertimeActivity 使用说明 / 自动化指北** 四份源文档——
> ① **§19** midi 生态与依赖；② **§20** 宏接入与 FVTT 文档/API；③ **§21** MidiQOL & workflow 函数全录；④ **§22** CPR 自定义宏制作流程；⑤ **§23** ActivityOverTime（机制已录·键名待坐实）；⑥ **§17bis** 新版 OverTime；⑦ **§24** 自动化路由速查；⑧ **§25** DAE/AE 机制；⑨ **§26** DAE 特殊键值 + DAE 宏；⑩ **§27** 角色侧 change-key 配方；⑪ **§28** 附魔键值；⑫ **§29** 激活条件全集；⑬ **§30** 反应触发 / 其他行动 vs 触发行动 / Optional 可选加值。
> 基础 JS 语法（变量/循环/对话框）按约定不收；Item Piles 按约定不收。**原 4 份文档可删，怪物自动化相关信息不丢。**
> **v5**：清空原两条待补——经探针采集 88 条 OverTime + 42 条 CR 抗性 + CPR 法术样本，**§16 状态抗性 CR/CV、新增 §17 OverTime 持续伤害、§18 内嵌 CPR 官方法术(1a) 全部逐字坐实**。
> **v4**：新增 **§6bis 法术外壳**——把法术专属枚举（`method`/`prepared`/`properties`/缩放）与法术 item 外壳 schema 全部坐实（来源：`CONFIG.DND5E` 控制台导出 + 真实火球术 item 导出）。**自此任意法术可直接手写，无需再侦察。**
> **v3**：CPR 章节做到**完全自包含**——含依赖、医药箱用法、全部 44 个通用怪物特性的字段 schema 与坑。**原 CPR 文档可删，信息不丢。**
> **平台**：Foundry core **13.351** / dnd5e **5.3.3**（涉及版本差异的 API 已就地标注 v11/v12/v13）。

---

## 0. 用哪张表填哪个字段

| 字段 | 取值来自 |
|---|---|
| `effects[].statuses` | §1 statuses |
| `traits.ci.value` | §3 conditionTypes |
| `traits.di/dr/dv.value`、`damage.*.types` | §2 damageTypes |
| `traits.dr.bypasses`（非魔法武器抗性） | §2 末（mgc/ada/sil） |
| `healing.types` | §9 healingTypes |
| `uses.recovery`（充能/次数/部分回复）+ `consumption.targets` 两段式 | §9bis uses 全谱 |
| `target.affects.type`（阵营/对象筛选：creature/ally/self） | §5bis 目标枚举 |
| **任意枚举（活动/激活/时长/消耗/范围/类型/稀有度/调律/施法/阵营/单位/状态）** | **§32 CONFIG 权威枚举快照** |
| `details.type.value` | §4 creatureTypes |
| `abilities.*`、`skills` 的 key | §5 |
| **卡面任意中文术语（description/name 给玩家看的文字）** | **§36 术语对照表** |
| `spell.school` | §6 spellSchools |
| 法术 item 外壳 / 施法者配置 | §6bis 法术外壳 |
| 持续伤害/流血/灼烧 OverTime | §17 OverTime |
| 内嵌 CPR 官方法术(1a) | §18 |
| `traits.size` | §7 actorSizes |
| `traits.languages.value` | §8 languages |
| DAE `changes[].key`（npc） | §10 |
| CPR 通用特性 | §12–§16 |
| midi mod 依赖 / 真实模块 id / 工作流配置 / transfer 效果 | §19 |
| 挂宏方式 / FVTT 文档·update·UUID / 状态效果·区域·dnd5e API | §20 |
| MidiQOL / workflow 函数签名 | §21 |
| CPR 自定义宏 fork 流程 / `chris-premades` 物品绑定 | §22 |
| ActivityOverTime（v13 行动版 OverTime） | §23（机制已录·键名待坐实） |
| 「需求→用什么机制」路由 / 挂宏与键值的 UI 位置 | §24 |
| DAE/AE 效果机制（变更模式·优先级·@/##·持续时间·叠加） | §25 |
| DAE 特殊键值（`flags.dae.*`/`macro.*`）+ DAE 宏（args/lastArg） | §26 |
| DAE 角色侧 change-key 配方（mode/值/掷骰数据） | §27（与 §10 路径互补） |
| 附魔键值（改物品/行动 `activities[type].*` / 系统键 / name·img·描述） | §28 |
| 激活条件（使用条件/效果条件/触发条件/DAE 表达式/Optional 条件） | §29 |
| 反应触发 / 其他行动 vs 触发行动 / Optional 可选加值 | §30 |

---

## 1. 状态 statuses（`effects[].statuses`）

```
blinded burning charmed concentration concentrating cursed dazed dead deafened
dehydration diseased disengage distracted dodging ethereal exhaustion exhausted
falling flanked flanking frightened grappled hasted hiding hovering incapacitated
invisible malnutrition marked paralyzed petrified poisoned prone rage reaction
restrained silenced sleeping slowed stable stunned suffocation surprised
transformed turned unconscious burrowing flying bleeding
cover coverHalf coverThreeQuarters coverTotal bonusaction encumbered
heavilyEncumbered exceedingCarryingCapacity
```
常用：`invisible frightened prone restrained grappled stunned paralyzed poisoned blinded charmed incapacitated unconscious`

## 2. 伤害类型 damageTypes（di/dr/dv 与 damage.*.types）

```
acid bludgeoning cold fire force lightning necrotic piercing
poison psychic radiant slashing thunder vitality  none midi-none
```
**伤害绕过 bypasses**（已坐实）：`mgc`(魔法武器) `ada`(精金) `sil`(白银)（+本世界 mod 的 `delm`/`mng`）。
**「非魔法武器抗性」标准写法**（幽灵/多数不死）：`traits.dr.value:["bludgeoning","piercing","slashing"]` + `traits.dr.bypasses:["mgc"]`（魔法武器照常造成伤害）。免疫同理用 `di`。

## 3. 状态免疫 conditionTypes（`traits.ci.value`）

```
bleeding blinded burning charmed cursed dazed deafened dehydration diseased
exhaustion falling flanked frightened grappled incapacitated invisible
malnutrition paralyzed petrified poisoned prone restrained silenced stunned
suffocation surprised transformed unconscious
```

## 4. 生物类型 creatureTypes（`details.type.value`）

```
aberration beast celestial construct dragon elemental fey fiend
giant humanoid monstrosity ooze plant undead
```

## 5. 属性 abilities / 技能 skills

abilities：`str dex con int wis cha`

skills（`"ste":{"value":1,"ability":"dex"}`）：

| key | 技能 | 属性 |  | key | 技能 | 属性 |
|---|---|---|---|---|---|---|
| acr | 特技 | dex |  | med | 医药 | wis |
| ani | 驯兽 | wis |  | nat | 自然 | int |
| arc | 奥秘 | int |  | prc | 察觉 | wis |
| ath | 运动 | str |  | prf | 表演 | cha |
| dec | 欺瞒 | cha |  | per | 游说 | cha |
| his | 历史 | int |  | rel | 宗教 | int |
| ins | 洞悉 | wis |  | slt | 巧手 | dex |
| itm | 威吓 | cha |  | ste | 隐匿 | dex |
| inv | 调查 | int |  | sur | 求生 | wis |

> 易混：`prc`察觉 `prf`表演 `per`游说 `itm`威吓 `inv`调查 `ins`洞悉。

## 5bis. 目标阵营/对象 + 区域模板枚举（`target.affects` / `target.template`）—— v8 全坐实

> 控制一个 activity「对谁生效」的字段是 **`target.affects.type`**（不是 midi 的 `autoTargetType`——实测全部样本恒 `"any"`，不参与阵营筛选）。豁免 AOE **必填** `affects.type`，否则模板里没有豁免对象、用了不掷豁免。

**`affects.type` 全集**（`CONFIG.DND5E.individualTargetTypes` F12 dump 坐实）：

| 值 | 含义 |
|---|---|
| `"self"` | 仅自身 |
| `"ally"` | 盟友 |
| `"enemy"` | 敌人（伤敌不伤友的 AOE 直接用它） |
| `"creature"` | 任意生物（含自己和友军） |
| `"willing"` | 自愿生物（群体增益/传送常用，配 `choice:true`） |
| `"object"` | 物件 |
| `"space"` | 空间 |
| `"creatureOrObject"` | 生物或物件 |
| `"any"` | 任意 |
| `""` | 不限定（如单体武器攻击，靠手动选目标） |

**`affects.special` / `.choice` / `.count`**（`affects` 完整字段：`{ "choice":false, "count":"", "type":"...", "special":"..." }`）：

| 配置 | 效果 |
|---|---|
| `{ "type": "creature" }` | 全体生物（含自己和友军） |
| `{ "type": "creature", "special": "-self" }` | 除自己外所有生物 |
| `{ "type": "enemy" }` | 仅敌方 |
| `{ "type": "ally", "special": "-self" }` | 仅友军、不含自己（木桩坐实） |
| `{ "type": "ally" }` | 友军 + 自己 |
| `{ "type": "self" }` | 仅自身（自 buff / 自疗） |
| `{ "type": "willing", "choice": true }` | 自愿生物，施法者手选 |
| `{ "type": "creature", "choice": true, "count": "3" }` | 范围内手选至多 3 个生物（木桩复制件坐实） |

> `special:"-self"` = 在 type 基础上再排除施法者本人（自身为心范围必加）。`choice:true` = 让施法者在范围内手选；`count` = 至多影响几个（留空＝不限）。
> 友善豁免：活动级 `friendlySave:"friendlySuccess"`（坐实）让友方在该豁免里自动判成功——`type:"creature"` 的范围伤害想"波及但不真伤友军"时用它。

**区域模板 `target.template.type` 全集**（`CONFIG.DND5E.areaTargetTypes` 坐实 · ⚠ **系统无 `rect`**）：

| 值 | 形状 |  | 值 | 形状 |
|---|---|---|---|---|
| `radius` | 半径 |  | `square` | 方形 |
| `sphere` | 球状 |  | `cube` | 立方 |
| `circle` | 圆形 |  | `wall` | 墙形 |
| `cylinder` | 柱状 |  | `line` | 线状（另填 `width`） |
| `cone` | 锥状 |  | `emanationNoTemplate` | 光环/半径·无测量板 |

> `template` 完整字段：`{ "type":"...", "size":"<尺寸>", "width":<线宽>, "units":"ft", "contiguous":false, "stationary":false, "count":"" }`。矩形用 `square`/`cube`/`wall`，**不要写 `rect`**。

## 6. 法术学派 spellSchools

`abj`防护 `con`咒法 `div`预言 `enc`附魔 `evo`塑能 `ill`幻术 `nec`死灵 `trs`变化

## 6bis. 法术外壳（已验证 schema · 可直接回写任意法术）

> 来源：真实火球术 item 导出 + 控制台 `CONFIG.DND5E` 枚举导出（`spellLevels`/`spellPreparationModes`/`spellcastingTypes`/`validProperties.spell`/`spellScalingModes`）+ 真实 npc 施法者。**法术与武器/特性共用同一套 activity 引擎**——命中/豁免/伤害/模板/上状态/治疗写法完全一致（见规范 §M1/M3/M6 + 本字典 §9）。本节只补"法术专属外壳"，补齐后任意法术可直接手写。

### A. 法术专属枚举（写死即可）

| 字段 | 合法值 |
|---|---|
| `level` | `0 1 2 3 4 5 6 7 8 9`（0=戏法） |
| `school` | §6：`abj con div enc evo ill nec trs` |
| `method` | `spell`(备法/法术位) `atwill`(随意) `innate`(天生) `ritual`(仪式) `pact`(契约/术士) `apothecary`(本世界制药) |
| `prepared`（**数字**） | `0`未备好 `1`已备好 `2`总是备好（怪物固定法术填 `1`） |
| `properties[]` | `vocal somatic material concentration ritual contaminated`（魔法物品另可加通用 `mgc`） |
| `ability` | `""`=用施法属性（推荐）；或指定 `str dex con int wis cha` |
| 升环缩放 `scaling.mode` | `level`(按额外环数) `none` `cantrip`(按 PC 等级，**怪物一般不需要**) |

### B. 法术 item 外壳（system 顶层 · 取自真实样本）

```json
{
  "type": "spell",
  "system": {
    "description": { "value": "<<官方风格能力描述>>" },
    "level": 3, "school": "evo", "method": "spell", "prepared": 1,
    "properties": ["vocal","somatic","material"],
    "ability": "",
    "activation": { "type": "action", "value": 1 },
    "duration": { "value": "", "units": "inst" },
    "range": { "value": "150", "units": "ft", "special": "" },
    "target": { "affects": {"count":"","type":""}, "template": {"type":"sphere","size":"20","units":"ft"} },
    "materials": { "value":"", "consumed":false, "cost":0, "supply":0 },
    "uses": { "max":"", "recovery":[], "spent":null },
    "activities": { "dnd5eactivity000": { "...": "见 C 节" } },
    "identifier": "<<英文 slug，可留空>>",
    "source": { "rules": "2014" }
  }
}
```

- 无模板的单体/自身法术：`target.template` 留 `{}`，按需填 `affects.count/type`（如 `{"count":"1","type":"creature"}` 或 `{"type":"self"}`）。
- `duration.units`：`inst`(立即) `minute` `hour` `round` `turn` `perm` `spec`；`value` 配数字串。
- `activation.type`：`action bonus reaction`（同武器/特性）。

### C. activity 四种常用变体（与武器/特性同引擎）

| 法术类型 | `activity.type` | 关键写法 |
|---|---|---|
| **攻击法术**（火焰箭等） | `attack` | `attack.ability:""`（=施法属性）+ `attack.type:{value:"ranged"\|"melee", classification:"spell"}` → 即 rsak/msak；伤害走 `damage.parts`（**法术无 `system.damage.base`**） |
| **豁免 AOE**（火球等） | `save` | `save.ability:["dex"]`；`save.dc` 两写法见 D；`damage.onSave:"half"`；`target.template`(sphere/cone/line/cube/cylinder/radius…全集见 §5bis)；`target.affects.type` 必填（§5bis）；自身为心加 `target.affects.special:"-self"` |
| **上状态**（束缚/恐惧等） | `save` | `save` + `activity.effects:[{_id}]` 引用本 item 的 effect（`statuses:[...]`，规范 §M6）；豁免成功不施加由 midi 处理 |
| **自buff / 治疗 / 临时HP** | `heal` | `target.affects.type:"self"` + `range.units:"self"`；`healing.types:["temphp"\|"healing"]`（§9），固定值 `number/denomination=null`+`bonus` |

- **消耗法术位**：activity 内 `consumption.spellSlot:true`（**戏法填 `false`**）。
- **升环加伤**：`consumption.scaling.allowed:true` + `damage.parts[].scaling:{mode:"whole",number:1}`（火球真实样本：每升 1 环 +1d6）。
- **专注**：`properties` 含 `concentration` 即由系统接管；activity 可另设 `duration.concentration:true`。

### D. 法术 DC 两种写法

| 写法 | activity `save.dc` | 何时用 |
|---|---|---|
| **写死数字（推荐·最稳）** | `{ "calculation":"", "formula":"15" }` | 怪物，不依赖全局施法 DC |
| **跟随施法 DC**（火球真实样本） | `{ "calculation":"spellcasting", "formula":"" }` | 想随角色法术 DC 浮动时 |

### E. 施法者 · Actor 层配置

```json
"attributes": { "spellcasting": "cha", "spell": { "level": 9 } },
"spells": {
  "spell1": { "value": 4, "override": 4 },
  "spell2": { "value": 3, "override": 3 },
  "spell3": { "value": 3, "override": 3 }
}
```

- `attributes.spellcasting` = 施法属性 key；`attributes.spell.dc` 系统自算（8+熟练+施法属性），要全局加值用 `bonuses.spell.dc`。
- 怪物各环法术位写 `spells.spellN.{value, override}`（`override` 写死上限）；契约位（术士）用 `spells.pact.{value,override,max}`。
- 戏法不占法术位，照常作为 `level:0` 的 spell item。

### F. 坑 / 纪律

- 法术伤害**一律走 activity `damage.parts`**，没有武器那种 `system.damage.base`。
- 每个会结算的法术**各自独立成一个 item**（同 §0 / 规范 §0 第 8 条）；"施一法 + 一戏法"的节奏用「多重攻击」feat 描述。
- **官方法术不手写、不建 item（v2.0.2 硬规则）**：法术是否"官方"以《5E万法大全》清单（**英文名**匹配）为准。官方法术**绝不手写描述 / activity / effect / 机制，也不放进 Actor JSON**——手写官方法术机制极易出错，而 DM 的 FVTT 内已有权威且配好自动化的版本。交付时只随怪**列一份「官方法术清单」**（中文名 + 英文名 + 环阶，按环阶分组），由 DM 从自有合集拖入并自配自动化（即便火球术 / 火焰箭这类常见法术也只列不写）。**只有清单中没有的自创 / 魔改法术**才按本节 schema 完整手搓外壳 + activity + effect。（本则取代旧"建 stub item 再用 CPR 医药箱匹配"做法；交付格式见规范 §M8「法术处理总则」。）

## 7. 体型 actorSizes（`traits.size`）+ token 尺寸

| size | 体型 | w/h |  | size | 体型 | w/h |
|---|---|---|---|---|---|---|
| tiny | 微型 | 0.5 |  | lg | 大型 | 2 |
| sm | 小型 | 1 |  | huge | 巨型 | 3 |
| med | 中型 | 1 |  | grg | 超巨型 | 4 |

## 8. 语言 languages（`traits.languages.value`）

标准：
```
common dwarvish elvish giant gnomish goblin halfling orc
draconic deep gith gnoll undercommon abyssal celestial infernal sylvan aarakocra
ignan auran aquan terran   cant druidic
```
本世界 mod 额外：`median medianOld jordic sidhe tylwyth angulotl timeRaider otyugh`

## 9. 治疗类型 healingTypes（`healing.types`）—— 原生临时 HP

合法值：`healing`(普通治疗) `temphp`(临时HP) `maximum`(最大HP) `vitality`(活力)。常用前两个。
```json
{ "type":"heal", "activation":{"type":"bonus","value":1},
  "target":{"affects":{"type":"self"}}, "range":{"units":"self"},
  "healing":{"number":null,"denomination":null,"bonus":"15","types":["temphp"]} }
```
固定值：`number/denomination=null`+`bonus`；骰子值：`number:2,denomination:6`。**禁用宏写 `hp.temp`**。

---

## 9bis. 有限次数：uses 池 + recovery 恢复 + consumption 消耗（两段式 · v7 坐实）

> 充能 / 每日次数 / 部分回复全靠 **item 级 `system.uses`**（池子怎么恢复）+ **activity 级 `consumption.targets`**（每次扣几格）两段拼成。**缺 `consumption.targets` 则用了不扣 `uses.spent`，充能/次数永不消耗**（实测"用了仍满充能"的根因）。

**① item 级 `system.uses`**：`{ "max":"<池大小>", "spent":0, "recovery":[ … ] }`

**`recovery[].period`（恢复周期，已坐实）**：`recharge` `sr`短休 `lr`长休 `day`每日 `dawn`黎明 `dusk`黄昏 `initiative`先攻时 `turnStart` `turnEnd` `turn`。

**`recovery[].type`（恢复方式，已坐实）**：

| type | 配套键 | 含义 | 坐实样本 |
|---|---|---|---|
| `"recoverAll"` | `recharge` 还需 `formula`（d6 下限） | 回满到 max | 焦炉炉火吐息 `{period:"recharge",formula:"5",type:"recoverAll"}` |
| `"formula"` | `formula`（骰子串） | **部分回复**：回掷出的格数 | 火球魔杖 `{period:"lr",type:"formula",formula:"1d6+1"}`、威力法杖 `{period:"dawn",type:"formula",formula:"2d8+4"}` |

**② activity 级 `consumption`**（真实结构）：
```json
"consumption": { "scaling": { "allowed": false }, "spellSlot": true, "targets": [ { "type": "itemUses", "value": "1" } ] }
```
- `targets[].value` = 这一下消耗几格，**独立于 `max`**。同一 item 不同 activity 可设不同 `value`：火球魔杖 7 格池子、七个 cast activity 分别消耗 `1`~`7`（各环火球）。
- 最小可用：`"consumption": { "targets": [ { "type": "itemUses", "value": "1" } ] }`（其余键导入补默认）。

**`consumption.targets[].type` 全集**（`CONFIG.DND5E.activityConsumptionTypes` 坐实）：

| type | 消耗什么 | 配套 `target` |
|---|---|---|
| `"itemUses"` | 本 item 的 `uses` 充能/次数（最常用） | 留空 `""` |
| `"activityUses"` | 本 activity 自己的 `uses` | 留空 |
| `"spellSlots"` | 法术位 | 环阶数字串（如 `"3"`） |
| `"hitDice"` | 生命骰 | 骰型/`"smallest"`/`"largest"` |
| `"attribute"` | 某属性资源（如 HP、传奇点 `resources.legact`） | 属性路径串 |
| `"material"` | 材料/弹药等物品 | 物品 id |

> 怪物常用 `itemUses`（充能/每日次数）。施法者怪用 `spellSlots`。「消耗自身 HP 发动」用 `attribute` + `target:"attributes.hp.value"`。传奇动作的传奇点由 `activation.type:"legendary"` 自动扣，无须在此配（见 §M9）。

**即用配方（逐字）**：
```text
充能 5-6（单格池）：
  uses: { "max":"1","spent":0,"recovery":[{"period":"recharge","formula":"5","type":"recoverAll"}] }
  ＋ activity: consumption.targets:[{ "type":"itemUses","value":"1" }]
  └ 充能 2-6 → formula "2"

6 次 / 长休回满：
  uses: { "max":"6","spent":0,"recovery":[{"period":"lr","type":"recoverAll"}] }
  └ 短休 "sr"、每日 "day"、黎明 "dawn"、先攻 "initiative" 同构（周期回满不需 formula）

部分回复（黎明回 2d8+4 格）：
  uses: { "max":"20","spent":0,"recovery":[{"period":"dawn","type":"formula","formula":"2d8+4"}] }

叠加（充能5-6 且长休回满）：
  recovery:[ {"period":"recharge","formula":"5","type":"recoverAll"}, {"period":"lr","type":"recoverAll"} ]
```

---

## 10. npc 数据路径（DAE `changes[].key`，前面加 `system.`）

**高频**

| key（省略 system.） | 用途 |
|---|---|
| `attributes.ac.bonus` `.flat` `.calc` `.cover` | AC |
| `attributes.hp.value` `.max` `.temp` `.tempmax` `.formula` | HP |
| `attributes.movement.walk` `.fly` `.swim` `.climb` `.burrow` `.hover` `.bonus` | 移速(+总加值 bonus) |
| `attributes.senses.ranges.darkvision` `.blindsight` `.tremorsense` `.truesight` | 感官（**必走 ranges.***） |
| `attributes.init.bonus` `.ability`、`attributes.spellcasting` `attributes.spell.dc` `.level` | 先攻/施法 |
| `bonuses.mwak.attack` `.damage`（+ `rwak`/`msak`/`rsak`） | 武器/法术命中、伤害加值（value 填 `1d6` 或 `1d6[necrotic]`） |
| `bonuses.abilities.check` `.save` `.skill`、`bonuses.spell.dc` | 全局加值 |
| `traits.di/dr/dv.value` `.bypasses` `.custom`、`traits.ci.value` | 抗性/免疫/状态免疫 |
| `traits.size`、`traits.languages.value` | 体型/语言 |
| `abilities.<abl>.value` `.proficient` `.bonuses.check` `.bonuses.save` | 六维 |
| `skills.<skl>.value` `.ability` `.bonuses.check` `.bonuses.passive` | 技能 |
| `resources.legact.max` `.spent`、`resources.legres.max` `.spent`、`resources.lair.value` `.initiative` `.inside` | 传奇/巢穴 |
| `spells.spell1..9.value` `.override` `.max`、`spells.pact.*` | 法术位 |
| `details.cr` `.alignment` `.type.value` `.type.subtype` `.biography.value` | 细节 |

**完整结构**（去重，省略 system.）
- `abilities.<str|dex|con|int|wis|cha>.{value,proficient,max,mod,dc,attack,checkBonus,checkProf,saveBonus,saveProf,bonuses.check,bonuses.save,save.value}`
- `skills.<acr|ani|arc|ath|dec|his|ins|inv|itm|med|nat|per|prc|prf|rel|slt|ste|sur>.{value,ability,proficient,prof,mod,bonus,passive,total,bonuses.check,bonuses.passive}`
- `attributes.ac.{armor,base,bonus,calc,cover,flat,formula,min,shield,value}`；`hp.{value,max,temp,tempmax,formula,damage,effectiveMax}`；`hd.{denomination,max,spent,value}`；`movement.{walk,fly,swim,climb,burrow,hover,bonus,speed,units}`；`senses.ranges.{darkvision,blindsight,tremorsense,truesight}`、`senses.{special,units}`；`init.{ability,bonus,mod,score,total}`；`spell.{dc,attack,mod,level}`、`spellcasting,prof,exhaustion`；`concentration.{ability,limit}`、`death.{success,failure}`、`attunement.{max,value}`
- `bonuses.{mwak,rwak,msak,rsak}.{attack,damage}`、`bonuses.abilities.{check,save,skill}`、`bonuses.spell.dc`
- `traits.{di,dr,dv,da}.{value,bypasses,custom}`、`traits.ci.{value,custom}`、`traits.dm.{amount,bypasses}`、`traits.{idi,idr,idv,ida,idm}.{value,bypasses,custom}`、`traits.{size,sizeNumeric}`、`traits.languages.{value,custom,communication}`
- `resources.legact.{max,spent,value,lr}`、`legres.{max,spent,lr}`、`lair.{value,initiative,inside}`
- `spells.spell1..9.{value,override,max,level}`、`spells.pact.{value,override,max}`
- `details.{cr,alignment,level,xp.value,type.value,type.subtype,type.swarm,type.custom,biography.value,biography.public}`
- `source.{rules,revision,license}`、`currency.{pp,gp,ep,sp,cp}`

---

## 11. 已确认的坑

1. 感官走 `senses.ranges.*`（扁平写法在 5.3 触发迁移警告）。
2. 失效 `compendiumSource` 链（`Scene.…Token.…Actor.…Item.…`）会让战斗 `fromUuid` 报错卡死；在侧边栏本体编辑、导出后清 `_stats.compendiumSource`/`duplicateSource` 为 null。
3. `game.system.model` 在 13.351 已移除（枚举 npc 路径改用"展平真实 npc 的 system"）。
4. 导出残留 `flags.dnd5e.dependents` 的跨角色 UUID 也要清。

---

## 12. CPR 宇宙 · 设置与依赖（自包含）

CPR（Cauldron of Plentiful Resources，原 Chris's Premades），一切功能集中在人物卡/物品/效果右上角的「医药箱」图标。
- **CPR 依赖**：midi-QOL、socketlib、DAE、Times-up、lib-wrapper。
- **GPS（Gambit's Premades）依赖**：Aura effects、Sequencer、Region Attacher。**MISC** = Midi Item Showcase-Community。
- **匹配规则**：医药箱一键匹配要求物品名与 CPR 合集英文名**完全一致（大小写、空格敏感）**。NPC 因中文名一般无法直接匹配，可临时把名字改成英文怪名匹配。
- ⚠️ **不要在合集包里一键匹配**（匹配到职业识别符内容会直接中断流程）。
- **合集包（featurePacks）**：`CPRMonsterFeatures` `CPRClassFeatures` `CPRSpellFeatures` `CPRSummonFeatures` `CPRItemFeatures` `CPRRaceFeatures` `CPROtherFeatures`（2024 版后缀 `2024`，如 `CPRMonsterFeatures2024`）。
- **API 路径**（已坐实）：`chrisPremades.macros.<标识符>`（每个通用特性带 `isGenericFeature:true` + `genericConfig` 字段定义数组）；`chrisPremades.utils.itemUtils.getGenericFeatureConfig(item,id)` = `item.flags["chris-premades"].config.generic[id]`；英雄激励 `chrisPremades.utils.actorUtils.giveHeroicInspiration(actor)`。

---

## 13. CPR 通用怪物特性 · 通用构造规则（最重要）

给一个 item 加 CPR 通用特性 `<id>`，只需两段 item 级 flags：

```json
"flags": {
  "chris-premades": {
    "config": { "generic": { "<id>": {
      "applied": true,
      "<字段1>": <值>,
      "<字段2>": <值>
    } } },
    "macros": { "midi": { "item": ["<id>"] } }
  }
}
```

- `config.generic.<id>` = `applied:true` + §14 里该特性每个字段（按需填，不填则取默认）。**经真实导出印证：除 applied 外无隐藏字段。**
- `macros.midi.item:["<id>"]` 触发该特性宏。
- 字段里 `activities` 类型 = 填本 item 内要应用该特性的活动 `_id` 数组（如 `["dnd5eactivity000"]`）。
- 纯被动特性（§14 标「无字段/无活动」者，如不死坚韧、集群战术、自爆）：只放 flags，**不用配活动**。

**字段类型 → 填什么**（§15 有 select 选项全集）：
`activities`=活动id数组 · `activity`=单个活动id · `text`=字符串/公式 · `number`=数字 · `checkbox`=true/false · `select`=单个选项value · `select-many`=value数组 · `damageTypes`/`creatureTypes`/`abilities`/`skills`=对应枚举数组 · `items`/`documents`=UUID数组 · `file`=图片路径

---

## 14. CPR 通用怪物特性 · 完整字段目录（全 44 条）

> 格式：**中文 `identifier`** — 作用。字段 `名(类型=默认)`。⚠坑。

**进攻/增益类**
- **优势伤害加值 `advantageDamageBonus`** — 命中带优势时加伤。`activities(activities=[])` `bonus(text=2d6)` `replace(checkbox=false)`
- **成军优势 `martialAdvantage`** — 旁有友军临近目标时加伤。`formula(text=2d6)` `auto(checkbox=false)` `playAnimation(checkbox=true)`
- **集群战术 `packTactics`** — 目标旁有未失能友军时攻击优势。**无字段**。
- **突袭打击 `surpriseAttack`** — 突袭加伤。`formula(text=2d6)` `showDialog(checkbox=true)`
- **血腥狂怒 `bloodFrenzy`** — 攻击生命不满目标带优势。`activities(activities=[])`
- **浴血狂怒 `bloodiedFrenzy`** — 自身浴血时攻击/豁免带优势（豁免优势未实现）。**无字段**。
- **狂怒 `berserk`** — 血肉魔像式。`hpThreshold(number=60)` `diceFormula(text=1d6)` `diceThreshold(number=6)`
- **擒抱攻击优势 `grappleAttackAdvantage`** — 攻击被擒抱目标带优势。`activities(activities=[])` `bonusDamage(text="")`
- **生命窃取 `lifesteal`** — 造伤回血。`activities([])` `formula(text="")` `percentage(select=1，见§15)` `healingType(select=healing)` `excessAsTemp(checkbox=false)` `reduceMaxHP(checkbox=false)` `maxHPCure(select=false/longRest/shortRest)` `checkSaves(checkbox=false)` `criticalOnly(checkbox=false)` `displayFormulaRoll(checkbox=true)` `damageTypes(damageTypes=[])` `ignoredCreatureTypes(creatureTypes=[undead,construct])` `validItems(select-many=[thisItem]，见§15)`

**伤害/扣血类**
- **接触伤害 `touchDamage`** — 范围内近战命中它时反伤。`range(number=5)`
- **回合开始计算伤害 `damageTurnStart`** — 带效果目标在来源回合开始受伤。`specificDamage(text="")`。⚠需配一个空效果；无伤害的特性/法术须填公式。
- **伤害光环 `auraDamageEnd`** — 范围内回合开始/结束受影响。`distance(number=30)` `immuneCreatures(creatureTypes=[undead,fiend])` `affectAllies(checkbox=true)` `trigger(select=end：start/end)`。⚠配它的活动设**射程=自身、目标空、区域空**，别设光环 aoe。
- **集群伤害 `swarmDamage`** — 浴血时伤害骰减半。**无字段**。
- **减少最大生命值 `reduceMaxHP`** — `activities([])` `damageTypeFilter(damageTypes=[])` `reduceByRoll(text="")` `shortRestCures(checkbox=false)` `longRestCures(checkbox=false)` `halfDamage(checkbox=false)` `checkSaves(checkbox=true)` `removeOnSave(checkbox=false)`
- **属性值吸取 `abilityDrain`** — `activities([])` `formula(text=1d4)` `expire(select=short：short/long/never)` `ability(select=str，见§15)` `checkSave(checkbox=true)`

**控制/位移类**
- **自动倒地 `autoProne`** — `activities([])` `sizeLimit(select=-1，数字串见§15)` `checkSaves(checkbox=true)`
- **自动推离 `autoPush`** — `activities([])` `distance(number=10，负数=拉近)` `failed(checkbox=true)` `hit(checkbox=true)` `maxSize(select=false，体型key见§15)`
- **自动擒抱 `autoGrapple`** — `activities([])` `dc(number=13)` `disadvantage(checkbox=false)` `restrained(checkbox=false)` `ignoreLimit(checkbox=false)` `sizeLimit(select=-1，数字串)`
- **逃逸 `escape`** — 需豁免的擒抱。`activities([])` `triggerActivities([])` `dc(text=13)` `disadvantage(checkbox=false)` `restrained(checkbox=false)` `ignoreLimit(checkbox=false)` `maxSize(select=false，体型key)`
- **吞没 `engulf`** — `activities([])` `checkSaves(checkbox=true)` `max(text=0)` `sizeLimit(select=-1，数字串)` `centerToken(checkbox=true)`。仅特效+体型限制，效果自做。
- **窒息 `suffocate`** — `activities([])` `startsOutOfAir(checkbox=false)`。⚠需配空效果。
- **移动加值行动 `movementBonusActivity`** — 冲锋增伤/触发。`activities([])` `triggerActivities([])` `checkSave(checkbox=false)` `distance(number=20)` `damageBonus(text="")` `replaceDamageFormula(checkbox=false)` `maxSize(select=false，体型key)`。可配合自动倒地做冲锋击倒。
- **通用传送 `genericTeleport`** — `activities([])` `range(number=30)` `animation(select=default，见§15动画表)`
- **凝视 `gaze`** — `distance(number=30)` `allowAvert(checkbox=true)` `avertGrantsAdvantage(checkbox=false)`

**防御/被动类**
- **不死坚韧 `undeadFortitude`** — HP→0 自动过豁免回 1 血。`bypassDamageTypes(damageTypes=[radiant])` `bypassCritical(checkbox=true)`。**无需配活动**。
- **再生 `genericRegeneration`** — 回合回血。`damageTypes(damageTypes=[acid,fire])` `threshold(number=0)` `zeroHP(checkbox=false)` `critical(checkbox=false)` `showIcons(checkbox=false)`。⚠需配一个射程/目标=**自身**的**治疗**活动、动作时间**特殊**。
- **招架 `parry`** — `formula(text=@prof)` `showRoll(checkbox=true)`。⚠需配合 MIDI 反应增强。
- **法术反转 `spellTurning`** — `advantage(checkbox=true)` `targetCaster(checkbox=true)` `spellLevel(number=7)`
- **效果免疫 `effectImmunity`** — `duration(number=86400 秒)` `activities([])`
- **受伤时重掷豁免 `rerollSaveOnDamage`** — `activities([])` `excludeSource(checkbox=false)` `saveDC(number=null)`。⚠须是豁免活动+一个附带效果。
- **敏锐感官 `keenSenses`** — `hearing(checkbox=false)` `sight(checkbox=false)` `smell(checkbox=false)`
- **日照敏感 `sunlightSensitivity`** — `auto(checkbox=false)`

**变体/工具类**
- **缩小 `reduce`** — `playAnimation(checkbox=true)` `oneDamage(checkbox=true)` `attackDisadvantage(checkbox=true)` `alwaysTiny(checkbox=true)` `stealthACBonus(checkbox=true)`
- **变巨术 `enlarge`** — `playAnimation(checkbox=true)` `doubleDice(checkbox=true)`
- **变形 `transform`** — 双形态。`checkSaves(checkbox=true)` 及 `profileOne/Two` × `Activities(activities)`/`Items(documents)`/`TokenImg(file)`/`TokenImgPriority(number=50)`/`AvatarImg(file)`/`AvatarImgPriority(number=50)`
- **自爆 `deathBurst`** — HP→0 自动用当前物品。**无字段**。
- **特殊物品使用 `specialItemUse`** — `activities([])` `triggerItems(items=[])`
- **行动掷骰 `rollForActivity`** — 眼魔射线式随机触发。`activities([])` `reroll(checkbox=true)`。⚠各行动取消「其他行动兼容」；备选行动命名 `1.XXX 2.XXX`（英文标点）。
- **失败差值 `failedByAmount`** — 豁免差值≥N 触发。`activities([])` `triggerActivities([])` `amount(number=5)`
- **休息时行动 `activityOnRest`** — `activities([])` `triggerActivities([])` `checkHit(checkbox=true)` `checkSave(checkbox=true)` `longRestOnly(checkbox=false)` `expireOnSave(checkbox=true)` `triggerOnce(checkbox=false)`
- **效果结束时行动 `activityOnEffectExpiry`** — `activities([])` `triggerActivities([])` `endEarly(checkbox=true)`
- **时序触发 `timeTrigger`** — `activities([])` `triggerActivity(activity="")` `checkSaves(checkbox=true)` `time(number=1)` `timeFormat(select=days：minutes/hours/days/months/years)`
- **背景加值 `contextualBonus`** — `saves(abilities=[])` `checks(abilities=[])` `skills(skills=[])` `condition(text="")` `advantage(checkbox=true)` `bonus(text="")`
- **ChooseDamage `chooseDamageType`** — `activities([])` `damageTypes(damageTypes=[])`

> 另：`vampireBite`/`ghoulClaw`/`goblinWarrior*` 等带 `.monsters` 的是**特定怪物预制**（靠英文怪名匹配），非可配置通用工具。

---

## 15. CPR select 选项全集（已解析 [fn]）

| 字段 | 选项 value |
|---|---|
| `ability`（abilityDrain） | `str dex con int wis cha` |
| `sizeLimit`（autoGrapple/autoProne/engulf，**数字串**） | `-1`(无) `0`(微) `1`(小) `2`(中) `3`(大) `4`(巨) `5`(超巨) |
| `maxSize`（autoPush/escape/movementBonusActivity，**体型key**） | `none tiny sm med lg huge grg` |
| `healingType`（lifesteal） | `healing temphp maximum vitality` |
| `percentage`（lifesteal） | `0.25 0.5 0.75 1 1.25 1.5 1.75 2`（字符串） |
| `validItems`（lifesteal，select-many） | `thisItem mwak rwak msak rsak spell feat item` |
| `maxHPCure`（lifesteal） | `false longRest shortRest` |
| `expire`（abilityDrain） | `short long never` |
| `trigger`（auraDamageEnd） | `start end` |
| `timeFormat`（timeTrigger） | `minutes hours days months years` |
| `animation`（genericTeleport） | `none default mistyStep hiddenPaths vortexWarp` ＋需 jb2a_patreon：`shadowStep crimsonMist thunderStep farStep` |

> ⚠️ **`sizeLimit` 用数字串、`maxSize` 用体型 key**——同是体型限制，两个字段格式不同，别填混。

---

## 16. CPR 效果级选项 / 状态抗性 / Overtime

**效果上的医药箱（配置）**
- **无动画**：让该效果"无特效"。等价做法：该 effect 的 `flags` 不带 `autoanimations`。
- **特殊持续时间**：DAE 做不到的特殊时长（工具检定、临时生命值检测等）。
- **测量板效果**：把活动的"测量板+效果"绑成"进入自动上效果、离开自动解除"。

**状态抗性/易伤（DAE changes · 已坐实）**——需开 CPR"状态抗性与易伤"。effect 的 `changes` 加一条：

```json
{ "key": "flags.chris-premades.CR.frightened", "mode": 5, "value": "1", "priority": 20 }
```

- `CR` = 状态抗性（resist），`CV` = 状态易伤（vuln）；`<状态>` 取 §3 状态 key（frightened/charmed/poisoned/paralyzed/restrained…）。
- **mode `5`（OVERRIDE）、value `"1"`** 为主流写法（42 条样本一致，如 Brave/Fey Ancestry/Psychic Defenses）；个别用 value `"true"`（Bracers of Celerity）或 mode `0`（gambits Toxic Shield），二者亦可用。
- ⚠️ **CV 未直接采到样本**，但与 CR **结构完全同构**——把 key 里的 `CR` 换成 `CV` 即可（`flags.chris-premades.CV.<状态>`，mode 5 / value "1"）。
- 与 AC5E 的状态抗性重复，二选一。

**Overtime（持续伤害/流血/灼烧）见 §17**（经典 `flags.midi-qol.OverTime` 已坐实）。

---

---

## 17. OverTime · 持续伤害 / 流血 / 灼烧（`flags.midi-qol.OverTime` · 已坐实）

> 来源：88 条真实样本（世界怪物 + CPR/GPS/MISC 合集）。这是把"中毒/流血/灼烧每回合掉血、可豁免移除"做成**单条 DAE change** 的标准做法——不需要单独建活动。挂在某个 effect 的 `changes` 上即可（该 effect 由 M6 的豁免/攻击施加给目标）。

**⚠️ 键名精确为 `flags.midi-qol.OverTime`（大写 O、大写 T）。** 结构：

```json
{ "key": "flags.midi-qol.OverTime", "mode": 0, "value": "<参数串>", "priority": 20 }
```

`value` 为**逗号分隔参数串**（空格/换行均可，下表参数全部来自真实样本）：

| 参数 | 含义 | 样本取值 |
|---|---|---|
| `turn=start` / `turn=end` | 触发时机：目标回合开始 / 结束（**必填**） | — |
| `damageRoll=2d6[fire]` 或 `damageRoll=2d6` | 持续伤害骰；类型可内嵌 `[fire]`，或另用 `damageType=` | `2d6[fire]` / `1d4` / `((@spellLevel)*2)d4` |
| `damageType=fire` | 伤害类型（骰里没内嵌时用） | §2 伤害类型 |
| `rollType=save` / `rollType=check` | 让目标掷豁免 / 检定（省略=只掉血不豁免） | — |
| `saveAbility=con` | 豁免/检定属性 | str…cha |
| `saveDC=15` / `saveDC=@attributes.spell.dc` / `$activity.dc` / `@abilities.con.dc` | DC：写死数字 **或** 公式 | — |
| `saveDamage=halfdamage` / `nodamage` / `fulldamage` | 豁免成功时的伤害 | — |
| `saveRemove=true` | 豁免成功移除该效果（"豁免结束"） | — |
| `saveMagic=true` | 按魔法豁免处理 | — |
| `damageBeforeSave=true/false` | 先结伤还是先豁免 | — |
| `allowIncapacitated=true` | 失能状态也触发 | — |
| `label="灼烧"` / `name=...` | 聊天栏显示名 | — |
| `rollMode=publicroll` · `fastForwardDamage=true` · `actionSave=roll`/`dialog` · `killAnim=true` · `saveCount=1-` | 可选杂项 | — |

**三个即用配方（逐字取自样本）**：

```text
纯灼烧·每回合开始掉血·无豁免（CPR "Fire Rune"）
turn=start,damageRoll=2d6[fire],rollMode=publicroll,

灼烧·豁免减半（世界怪物 "畸变侵蚀"）
turn=start, damageRoll=2d6, damageType=psychic, saveDC=15, saveAbility=wis, saveDamage=halfdamage, saveCount=1-, label="畸变侵蚀"

灼烧·掉血后可豁免结束（MISC "Alchemist's Fire"，最贴近"着火"）
turn=start, damageBeforeSave=true, fastForwardDamage=true, rollType=check, saveAbility=dex, saveDC=10, saveRemove=true, actionSave=dialog, damageRoll=1d4, damageType=fire, label=Alchemist's Fire Damage
```

> 用法：把上面这条 change 放进一个 `statuses:["burning"]`（或自定义）的 effect 的 `changes` 里，再用某个 save/attack activity 的 `effects:[{_id}]`（M6）把该 effect 施加给目标。豁免成功不施加由 midi 处理；`turn=start` 的伤害会在目标后续每个回合开始自动结算。

### 17bis. 新版 OverTime 扩展（v13.0.37+ · 来源：自动化指北）

> 旧语法（上表）仍可用，但 v14 后移除兼容。新版**键名仍是 `flags.midi-qol.OverTime`、mode 0**，只是 `value` 参数串支持更多参数——尤其是**豁免成功/失败计数**，可做石化术/疫病术这类「累计 N 次豁免才结算」的效果。⚠ 永久化在 v13.0.45 前有 bug，用 v13.0.45+。分隔符 `,` 或 `#`。

**新增参数**（在 §17 旧参数之上）：

| 参数 | 含义 | 默认 |
|---|---|---|
| `applyCondition=` / `condition=` | OverTime 触发须为真的条件表达式（写法见 §29） | — |
| `saveCount=N[-+]effectSpec` | **N 次成功豁免**后的行为 | — |
| `failCount=N[-+]effectSpec` | **N 次失败豁免**后的行为 | — |
| `removeCondition=` | 条件为真则移除效果（常给永久化效果留逃脱口，如 `##attributes.hp.value < 2`） | — |
| `actionSave=dialog` / `roll` | 需玩家**消耗动作**才能豁免（挣脱擒抱式）：dialog=回合开始弹框；roll=生成聊天卡手动点 | — |
| `itemName=` | 用作掷骰模板的物品 UUID/名（借其 flags/描述，实际行动效果会被替换；先搜角色物品再搜世界） | — |
| `macro=` | 处理期间调用宏（格式见下） | — |
| `killAnim=true/false` · `allowIncapacitated=true/false`(默认 true) · `fastForwardDamage=` | 杂项 | — |

- `saveCount/failCount` 语法 `N[-+]effectSpec`：`N`=所需成功/失败次数；`-`=达数移除该 OverTime；`+`=**永久化**（不再豁免）；`effectSpec`(可选)=达数时给角色加的东西。
- **effectSpec 选项**：`statusId`(如 `petrified`/`prone`/`stunned`) · `statusId|overlay`(覆盖层) · `effectUuid`(AE 的 uuid) · `function.函数名` · `Macro.世界宏名` · `ItemMacro` / `ItemMacro.物品名或UUID` · `ActivityMacro` / `ActivityMacro.uuid`。effectSpec **总是叠加给角色**（不替换 OverTime 效果本身）。指定计数后 `saveRemove=true` 被忽略。
- **`macro=` 格式**：`function.函数名`(如 `function.MidiQOL.doOverTimeDamage`) / `ItemMacro[.物品]` / `ActivityMacro[.uuid]` / `Macro.世界宏名`。
- **同一 effect 可挂多条 OverTime**：用不同子键，如 `flags.midi-qol.OverTime.burn`、`flags.midi-qol.OverTime.poison`。
- **`@` vs `##`**：非转移效果里 `@` 字段默认按**施法者**掷骰数据评估，要引用**目标**数据用 `##`（如 `##attributes.hp.value`）。
- 快速编辑：v13.0.43+ 内置 OverTime 编辑器（需 DAE 13.0.19+）——给效果加 `flags.midi-qol.OverTime` change 后，值输入框下方出现图标可点开。
- 旧→新批量迁移：用世界宏遍历 `pack.get(PACK_NAME)`，对含 `flags.midi-qol.OverTime` 的 change 转换语法（迁移宏在源文档，按需再要）。

**新版配方（逐字取自源文档）**：

```text
简单燃烧（每回合伤害，豁免成功则结束）
turn=end, damageRoll=1d6, damageType=fire, saveDC=12, saveAbility=dex, saveCount=1-, label="燃烧"

中毒（豁免成功伤害减半）
turn=start, damageRoll=2d6, damageType=poison, saveDC=14, saveAbility=con, saveDamage=halfdamage, saveCount=1-, label="中毒"

再生（治疗，无豁免，仅受伤时生效）
turn=start, damageRoll=2d6, damageType=healing, applyCondition=##attributes.hp.value < ##attributes.hp.max, label="再生"

人类定身术（回合结束用动作豁免）
turn=end, saveDC=@attributes.spell.dc, saveAbility=wis, saveCount=1-, actionSave=roll, label="人类定身术"

挣脱擒抱（动作豁免，力量或敏捷二选一）
turn=start, saveDC=14, saveAbility=str|dex, rollType=check, actionSave=dialog, saveCount=1-, label="被擒抱"

石化术（豁免失败3次=石化并结束；成功2次=结束）
turn=end, saveDC=@attributes.spelldc, saveAbility=con, saveCount=2-, failCount=3-petrified, label="血肉化为石头"

疫病术（失败3次=永久疾病；成功3次=结束）
turn=end, saveDC=@attributes.spelldc, saveAbility=con, saveCount=3-, failCount=3+, damageRoll=2d6, damageType=poison, label="疫病术"

渐进诅咒（失败2次=永久，仅 HP<2 或除咒可移除）
turn=end, saveDC=15, saveAbility=wis, failCount=2+, removeCondition=##attributes.hp.value < 2, label="蔓延诅咒"
```

## 18. 内嵌 CPR 自动化官方法术（1a · 已坐实）

> 用于：想让某只怪物**导入即带 CPR 脚本自动化的官方法术**，连医药箱匹配都省掉。普通法术（活动即自动化，如火球）**不需要**这层，直接照 §6bis 写。只有"自动化是 CPR 脚本"的法术才加下面 flags。

法术 item 顶层加：

```json
"flags": {
  "chris-premades": {
    "info": { "name": "Blight", "version": "1.1.10", "identifier": "blight", "source": "chris-premades" },
    "macros": { "midi": { "item": ["blight"] } }
  }
}
```

- `info.identifier` = CPR 内部 **camelCase 标识符**（样本：`magicMissile` `crimsonMist` `blight` `huntersMark`；一般是法术英文名去空格转小驼峰）。
- `macros.midi.item:[identifier]` 触发脚本——**脚本本体在 chris-premades 模块里**，靠 identifier 调用。
- 复杂法术还带：`config`（如猎人印记 `{formula:"1d6"}`、魔法飞弹 `{rollEach:false}`）、`hiddenActivities`/`spellActivities`/`activityIdentifiers`（多活动法术，列出各活动的 id 映射）。
- ⚠️ **因脚本靠 identifier 触发、且多数 CPR 法术是多 activity 结构，光有这层 flag 通常不够**。最稳：**在 app 里把该法术匹配好后整张导出 JSON 复用**（identifier + 全 activity 一起带）。本节 flags 用于已知 identifier 时补全/校验。

---

## 19. midi 生态与依赖（mod 清单 · 真实模块 id · 工作流配置 · transfer 效果）

> 来源：midi 入门指南。本节只收**影响怪物 JSON 能否正常自动化**的耐用知识；逐项 GM 配置 UI 巡览（每个勾选框）属操作手册，不纳入字典。模块 id 已用本世界 `我的mod.txt` 交叉核对（确认在装）。

### A. 模块依赖（显示名 → 实际模块 id）

| 类别 | 显示名 | 模块 id | 作用 / 备注 |
|---|---|---|---|
| **必备** | Dynamic Active Effects | `dae` | 缺则 midi 无法激活 |
| **必备** | libWrapper | `lib-wrapper` | 同上 |
| **必备** | socketlib | `socketlib` | 同上 |
| **强烈建议** | Times-up | `times-up` | 效果按世界时间 / 战斗轮·回合到期自动移除（特殊持续时间、OverTime 结束都依赖它） |
| 推荐 | DFreds Convenient Effects | `dfreds-convenient-effects` | 预配 midi flag 的状态效果（目盲/魅惑…）；⚠ v12 起 DCE **不再**改系统现有状态效果、也不再允许新建状态效果 |
| 推荐 | Monks Token Bar | `monks-tokenbar` | 让玩家自行掷豁免，midi 与之交互记录 |
| 推荐 | Automated Animations(+D&D5e Animations) | `autoanimations` / `dnd5e-animations` | 物品/法术使用动画，已配为与 midi 协同 |
| 推荐 | Dice So Nice | `dice-so-nice` | 3D 骰 |
| 推荐 | Active Token Effects | `ATL` | 视觉/光照类效果 |
| 推荐 | Effect Macro | `effectmacro` | 效果被应用/创建/切换时跑宏；更常用：配合 dnd 系统 hook 把宏存在效果上 |
| 推荐 | Active Auras / Aura Effects | `auraeffects` | 效果无需触发物品即应用到邻近 token（如圣武士保护光环） |
| 兼容注意 | AC5e | `automated-conditions-5e` | 其状态抗性与 CPR `CR/CV`（§16）重复，**二选一**；曾与 midi 两个设置冲突，现已修复 |
| 已弃用 | Anonymous | — | v13 已废弃（隐藏怪名） |
| 不再需要/支持 | Advanced Macros、ItemMacro | — | 源文档明示其功能已被行动组合/系统机制取代 |

> GPS=`gambits-premades`（依赖 `auraeffects`、`sequencer`、`region-attacher`）；MISC=`midi-item-showcase-community`；CPR=`chris-premades`；Bossloot=`boss-loot-*`。

**最快让 midi 生效**：装齐 3 个必备 → midi 设置勾「启用掷骰自动化」→ 工作流 → 快速设置 → 完全自动化。

### B. 影响怪物 JSON 行为的关键工作流设置

- **自动应用物品效果**：必须设为「不自动应用效果」**以外**的选项，否则怪物物品/法术上的 effect 不会在使用时自动施加给目标（M6 上状态全靠它）。
- **应用 DCE 效果**：设「如果 DCE 不存在则应用物品效果」——这样定义了 DCE 效果的法术/特性会在使用时自动上效果。
- **伤害减免豁免顺序**：决定「豁免减半」型伤害是先套 `traits.dm`（伤害调整）再减半，还是先减半再套——直接影响带 `dm` 的怪物实际承伤数（例：10 毒 + dm −5，可得 5、2 或 0）。
- **机制·HP 低于 % 加效果 / HP=0 加效果**：自动给阈值上「重伤」、0 血上「昏迷/死亡」状态——怪物无需自带这套。
- **专注**：midi 扩展系统专注；为兼容 midi 工作流应选「**掷骰专注**」；勾「受到伤害时强制专注豁免」「单次专注检定」（避免带豁免附加伤害的攻击提示两次）。
- **反应/附赠动作增强**：跟踪并防重复使用（「反应已使用」状态回合开始自动移除）。
- **攻击时检查武器射程**：超程可选「无关紧要 / 给劣势 / 阻止使用」；无网格斜格近战够不到时，把「误差因子」填 2（配合对角线按 √2 计算）。
- **DR vs dm 键**：`DR` 是 midi 旧版伤害减免键；现代系统统一用 `dm`（伤害调整，见 §10 `traits.dm.{amount,bypasses}`）。

### C. transfer（转移/被动）效果 vs 非 transfer 效果 —— 怪物配效果的分水岭

| 类型 | 勾选「对角色应用效果 / Transfer Effect to Actor」 | 何时生效 | 例 |
|---|---|---|---|
| **转移效果（被动）** | 勾上 | 物品进库存即把效果转移到持有者；dnd5e 还会查同调/装备 | 防护斗篷（需同调+装备才加 AC/豁免） |
| **非 transfer 效果** | 不勾 | 物品**被使用时**施加给目标；需在详情页取消「效果暂停」使其默认激活 | 祝福术（瞄准目标施法上效果） |

- 怪物给目标上 buff/debuff（M6）几乎都用**非 transfer**：不勾转移 + 取消「效果暂停」+ 工作流「自动应用物品效果」开。
- 目标可设「自身」→ 总是施加给施法者本人。
- SRD 物品多为「转移效果」，要在 midi 里当目标效果用，需把效果改成「装备时不转移到角色」。

**物品来源**：SRD、DCE、midi Sample Items、CPR、DDBi（D&D Beyond Importer）、GPS、MISC、Bossloot。官方法术/物品一般不用手搓——医药箱按英文名匹配（§12）；自制才照 §6bis 手写。

---

## 20. 宏接入与 FVTT 文档 / API 模型（怪物自动化常用）

> 来源：宏相关（去掉基础 JS 语法，保留 FVTT/MidiQOL 专有 API）。怪物 JSON 本身不含宏，但 CPR/特殊效果常挂宏，本节是读懂/微调那些宏的最小集。

### A. 挂宏的 6 个位置

- **快捷栏**：点击才执行，适合全局/单次（如清测量版）。
- **角色卡**：该角色相应动作时触发（如重击动画）。
- **物品**：物品使用时触发（如饮血剑、奥术回想）。
- **Hook**：绑全局事件。**区域/图块**：进入/离开等事件触发。**DAE 效果**：效果运行宏（配 `effectmacro`）。
- 让玩家能跑宏：核心设置 → 权限管理 → 开玩家宏权限。
- ⚠ **版本敏感**：dnd 系统常改/删 API，更新系统须一并更新宏；写/求宏务必注明 FVTT 版本 + 系统版本，报错按 F12 看。

### B. 文档模型与修改

- **Document** = 持久数据（存服务器 DB）；`token` 是可放置（非文档），其文档是 `token.document`（TokenDocument）；`actor` 是文档。
- 直接赋值（`token.document.name = "x"`）只改本地、刷新即失 → 必须 `.update({...})`。
- 与 DB 交互**异步** → 取更新后的值要 `await doc.update({...})`。
- ⚠ **`update` 只写文档 schema 里已定义的字段**，schema 没有的键被忽略（即使手动加该字段也不写入）。
- `setFlag(scope,key,val)` / `getFlag(scope,key)` = `update({"flags.scope.key":val})` 的简写；读可能未设的 flag 用可选链 `doc.flags.scope?.key` 防报错。

### C. ID / UUID / 取文档

- UUID 全局唯一（含场景/容器路径），比 ID 可靠；书本图标：**左键复制 ID、右键复制 UUID**。
- `await fromUuid(uuid)`（异步，合集/任意均可，**推荐**）；`fromUuidSync(uuid)`（同步，仅取内存中已加载的）。
- 按 ID：`collection.get(id)` / `canvas.scene.tokens.get(id)`；按名：`game.actors.getName(name)` / `actor.items.getName(name)`（返回**首个**同名）。
- Collections：`game.actors/items/scenes/journals/playlists`；`Actor.items` 是嵌入集合。
- 批量改：`scene.updateEmbeddedDocuments("Token",[{_id, "texture.src":"..."}])` —— `_id` 必填、仅限**同一 collection**、无 `game.tokens` 全局集合（跨场景须逐场景调）。

### D. 状态效果 API（注意版本）

- `await actor.toggleStatusEffect("poisoned")` —— **v12+**（v11 用 `token.toggleEffect`；v13 部分弃用）。
- `await actor.setStatusEffect(id, , {active:true/false})` 显式增删、`{overlay:true}` 全覆盖图标 —— **v13 已弃用**。
- `console.log(CONFIG.statusEffects)` 取状态列表，看每条 `id`（与 §1 statuses 同源）。

### E. 区域（Region）脚本/行为

```js
const { data, name, region, user } = event;
const token = data.token;
if (game.user !== game.users.activeGM) return; // 仅 GM 跑（改灯/门/图块/GM 私有内容）
if (user !== game.user) return;                // 仅进入者跑（改其 token/角色、弹对话框）
```

- 一次性：`behavior.update({ disabled:true })`；计数：`behavior.getFlag("core","uses")` / `setFlag(...)`。
- 「执行脚本」嵌在区域内、随场景导出、不可复用；「执行宏」填 uuid、不随场景导出、可复用。

### F. dnd5e 系统 / Foundry 常用调用

- `const save = await actor.rollAbilitySave("dex")` → `save.total`。
- `actor.applyDamage([{ value: 10, type: "fire" }])`；`type:"healing"` 即治疗。
- `const r = new Roll("4d8"); await r.roll(); r.toMessage({ flavor:"..." });`。
- 播放列表：`const pl = fromUuidSync("Playlist.X"); pl.playAll()/stopAll()/playSound(s)/stopSound(s)`；`pl.sounds.getName("Track")`。
- 单文件音频：`foundry.audio.AudioHelper.play({src,volume,loop}, true)`——`true`=所有用户、`false`=仅本机；刷新即停。
- 对话框（v13）：`new foundry.applications.api.DialogV2({ window:{title}, content, buttons:[{action,icon,label,callback}] }).render(true)`，`._onRender` 绑按钮事件。
- ⚠️ **DialogV2 content 字符串里写内联事件（onchange/onclick）实测不生效**（2026 休息宏：radio 切换恒停在默认值，「点短休仍走长休」）。content 只放带 `name` 的表单元素；取值在按钮 callback 里读 `dialog.element.querySelector(...)`，callback 返回值即提交值（`DialogV2ButtonCallback = (event, button, dialog)`）。正解全档见「血的教训-DialogV2弹窗选择器篇.md」。
- 聊天：`ChatMessage.create({ content:"<...>" })`。
- 事件：`Hooks.on(event, handler)` 监听 / `Hooks.call(event)` 触发；`init` hook 在 FVTT 初始化时发出。
- （源文档另含「从零搭建 game system」入门：`system.json`/`documentTypes`/`game.system`——属系统开发，超出怪物生成范围，此处仅留指针不展开。）
- `CONFIG.Canvas.polygonBackends.move.testCollision(A, B, { type:"move", mode:"any" })` → A、B 为坐标点 `{x,y}`；两点连线间存在挡移动的墙则返回真值，否则假值。用于「A→B 之间是否隔墙」判定（强制位移、碰撞）。核心 Foundry v13（13.351）实测可用。

---

## 21. MidiQOL & workflow 函数全录（逐字签名 · 来源：宏相关「MIDI 与 DAE 函数全录」）

> 标「施工中」，签名按源文档**原样保留**（默认参数即默认值）。⚠ `createEffects`/`removeEffects`/`updateEffects` PL 端无权限，PL 端跑须走 socket 或改用 `*EmbeddedDocuments`。

```text
MidiQOL.actorFromUuid(uuid)                     从物品/效果 uuid 取角色
MidiQOL.addConcentrationDependent(actorRef, dependent, item)   为专注效果加依赖
MidiQOL.addDependent(document, dependent)       为文档加依赖
MidiQOL.addRollTo(roll, bonusRoll)              为掷骰加加值掷骰
MidiQOL.applyTokenDamage(damageDetail, totalDamage, theTargets, item, saves, options={ label:"defaultDamage", existingDamage:[], superSavers:new Set(), semiSuperSavers:new Set(), workflow:undefined, updateOptions:{awaitDamageApplication:configSettings.waitForDamageApplication}, forceApply:false, noConcentrationCheck:false })   向 token 应用伤害(含治疗)
MidiQOL.canSee(tokenEntity, targetEntity)       能否看到→布尔
MidiQOL.canSense(tokenEntity, targetEntity, validModes=["all"])     能否感知→布尔
MidiQOL.canSenseModes(tokenEntity, targetEntity, validModes=["all"])  以何模式感知
MidiQOL.checkActivityRange(activityIn, tokenRef, targetsRef, showWarning=true)   检测行动射程
MidiQOL.checkDistance(t1, t2, distance, options={wallsBlock:false, includeCover:true})   检测两 token 距离
MidiQOL.checkIncapacitated(actorRef, logResult=true, warning=false)   是否失能
MidiQOL.checkNearby(disposition, tokenRef, distance, options={includeIncapacitated:false, canSee:false, isSeen:false, includeToken:false, relative:true})   周边是否有符合阵营的 token
MidiQOL.checkRule(rule)                          检查规则版本(宏中少用)
MidiQOL.chooseEffect({actor, token, item, workflow, options})   选择效果(多用于工作流)
MidiQOL.completeActivityUse(activityRef, usage={}, dialog={}, message={})   使用行动并掷骰(可预配目标/消耗/跳框)
MidiQOL.completeItemUse(itemRef, config={}, dialog={}, message={})   使用物品并掷骰(同上)
MidiQOL.computeCoverBonus(attackerIn, targetIn, activity)   算掩护加值
MidiQOL.computeDistance(t1, t2, options={wallsBlock:false, includeCover:true})   算两 token 距离
MidiQOL.contestedRoll(data:{source:{rollType,ability,token,rollOptions}, target:{rollType,ability,token,rollOptions}, displayResults, itemCardUuid, flavor, rollOptions, success:(r)=>{}, failure:(r)=>{}, drawn:(r)=>{}})   对抗掷骰
MidiQOL.createConditionData(data)               条件评估辅助
MidiQOL.createDamageDetail({roll, activity, defaultType=MidiQOL.MQdefaultDamageType})   为行动建伤害掷骰
MidiQOL.createEffects(data:{actorUuid, effects:ActiveEffect.CreateData[], options:{keepId}})   向角色建效果(PL 无权限)
MidiQOL.displayDSNForRoll(rolls, rollType, defaultRollMode)   展示掷骰 DSN 动画
MidiQOL.doConcentrationCheck(actor, saveDC)     强制专注检定
MidiQOL.doOverTimeEffect(actor, effect, startTurn=true, options={saveToUse:undefined, rollFlags:undefined, isActionSave:false})   对角色跑 OverTime 掷骰
MidiQOL.findNearby(disposition, tokenRef, distance, options={includeIncapacitated:false, canSee:false, isSeen:false, includeToken:false, relative:true})   范围内指定阵营 token 数据
MidiQOL.findNearbyCount(disposition, token, distance, options={...同上})   范围内数量
MidiQOL.getChanges(actorOrItem, key)            取所有含指定 key 的更改
MidiQOL.getConcentrationEffect(actor, itemRef)  取角色专注效应
MidiQOL.getTokenForActor(actor)                 取角色当前场景 token
MidiQOL.getTokenForActorAsSet(actor)            同上(Set)
MidiQOL.hasCondition(actorRef, condition)       是否有指定状态(如目盲)
MidiQOL.hasUsedBonusAction(actor)               是否已用附赠动作
MidiQOL.hasUsedReaction(actor)                  是否已用反应
MidiQOL.modifyDamageBy({damageItem, value, multiplier=1, type="none", reason})   调整受伤(最好仅 isDamaged 时调)
MidiQOL.moveToken(tokenRef, newCenter, animate=true)   移动 token
MidiQOL.moveTokenAwayFromPoint(targetRef, distance, point, animate=true, checkCollision=false)   以点为参推离/拉近
MidiQOL.reactionDialog(actor, triggerTokenUuid, reactionActivities, rollFlavor, triggerType, options={})   反应对话框
MidiQOL.removeBonusActionUsed(actor, force=false)   移除已用附赠标记
MidiQOL.removeReactionUsed(actor, force=false)      移除已用反应标记
MidiQOL.removeEffects(data:{actorUuid, effects:string[]})   移除指定效果(PL 无权限)
MidiQOL.selectTargetsForTemplates(templateDetails, selfTokenRef="", ignoreSelf=false, AoETargetType="any", autoTarget)   选定测量版上目标
MidiQOL.setBonusActionUsed(actor)               标记已用附赠
MidiQOL.setReactionUsed(actor)                  标记已用反应
MidiQOL.tokenForActor(actor)                    取角色 token
MidiQOL.updateEffects(data:{actorUuid, updates:ActiveEffect.UpdateData[]})   更新指定效应(PL 无权限)

workflow.setAttackRoll(roll)        设工作流攻击掷骰
workflow.setUtilityRolls(rolls)     设效用行动掷骰
workflow.setDamageRoll(roll)        设工作流伤害掷骰
workflow.addDamageRolls(rolls)      追加伤害掷骰
workflow.setDamageRolls(rolls)      设伤害掷骰
```

---

## 22. CPR 自定义宏制作流程（fork CPR 官方宏 · 来源：宏相关）

> 用途：想魔改/新增一条 CPR 自动化（而非 §13 那种「填 flag 调用现成通用特性」）。与 §13/§18 的 `chris-premades` 物品 flags 同源——本节是「生产那段宏 + identifier」的步骤。

1. 建一个**宏合集包**（随意命名）。CPR 配置 → 合集包选项 → 宏合集包 → 选这个包。配好后在该包新建宏会自动插入 CPR 模板代码。
2. 去 CPR GitHub 找目标宏拉到底，数有几个 `export let` —— **决定建几个宏**。
3. 复制各 export 引用的 `async function`（**不要复制 `import` 开头的行**）。例：储法戒指 `ringOfSpellStoring` 引用 `use` / `equipOrUpdateRing` / `unequipRing` 三函数 → 三个全复制到第一个宏；`ringOfSpellStoringSpell` 只引用 `earlySpell` → 复制它到第二个宏。
4. 把 `export let something =` 改成 `return`，其余 export 对象内容贴到新宏底部，并加 `identifier:'something'` + `rules:'legacy'`(2014 规则) 或 `rules:'modern'`(2024 规则)：

```js
return {
  identifier: 'ringOfSpellStoring',
  name: 'Ring of Spell Storing (0/5)',
  rules: 'legacy',
  version: '1.1.0',
  midi: { item: [ { pass: 'rollFinished', macro: use, priority: 50 } ] },
  equipment: { ringOfSpellStoring: { equipCallback: equipOrUpdateRing, unequipCallback: unequipRing } },
  ddbi: { renamedItems: { 'Ring of Spell Storing': 'Ring of Spell Storing (0/5)' } }
};
```

5. 默认会**覆盖**原 CPR 自动化；要做**新**自动化，把 `identifier` 改成新的唯一值（如 `'MynewringOfSpellStoring'`）。
6. 绑到物品：物品导出 JSON，加 `chris-premades` flags（结构随该宏的 export 部分而定）：

```json
"chris-premades": {
  "info": { "identifier": "ringOfSpellStoring", "rules": "legacy" },
  "macros": { "midi": { "item": ["ringOfSpellStoring"] } },
  "equipment": { "identifier": "ringOfSpellStoring" }
}
```

> 与 §13（`config.generic` 通用特性）/§18（内嵌官方法术）的 `chris-premades` flags 是同一套机制，按宏类型取对应子键（`macros.midi.item` / `equipment` / `config` …）。

---

## 23. ActivityOverTime · v13 行动版 OverTime（机制已录 · ⚠ 键名大小写未坐实）

> 来源：OvertimeActivity 使用说明（MidiQOL 12.4.28+）。这是把「**任意一个 midi 行动**」指定为持续触发的新机制，比 §17 经典 `flags.midi-qol.OverTime`（单条参数串、只能掷豁免/伤害）更灵活——可每轮召唤、每轮逼一次检定、含 AoE 等。

**机制**：在某 effect 的 `changes` 上挂一条键为 `flags.midi-qol.ActivityOverTime` 的更改，`value` 指向一个行动，用以下任一方式引用：

- 该行动的 **uuid**（合集内 uuid 稳定；⚠ 角色/物品跨世界导入导出时 uuid 会变）；
- 或**同一物品上该行动在 midi 标签页内的 identifier**（如 `bleeding-save`）——跨世界更稳，优先用。

**配方（逐字取自源文档·流血每回合掉血、过豁免移除）**：
1. 建一个豁免行动 `Bleeding Save`：体质豁免 DC 12、造 1d4 黯蚀伤害（豁免成功全额）；**目标类型留空**（让 midi 覆盖目标数据）；在该行动 midi 属性页设「Overtime 行动=true」「回合开始」「豁免移除」。
2. 在攻击行动上指定要应用的效果，效果里挂 `flags.midi-qol.ActivityOverTime`，`value` 填 `bleeding-save`（或粘贴 Bleeding Save 行动的 uuid）。

**规则要点**：
- 调用前检查使用条件 `attributes.hp.value > 0`（死马不鞭）。
- 同一效果可多条 ActivityOverTime change，按「回合开始」→「回合结束」→优先级（最低先）执行；可拆成开始/结束分别跑，各带不同移除条件。
- 沿用**原始施法环数**做缩放（不想缩放就在依赖行动里关掉缩放）。
- 依赖行动应**目标自身**；含 AoE 时选「光环 / 光环-半径·无模板」使其以「应用效果的 token」为心，其他目标选项会提示放模板。
- 任意行动都可当依赖行动；已测：豁免/检定/伤害/召唤；**未测**：转进 Forward / 施法 Cast（可能不按预期）。

**⚠ 坐实状态（重要 · 遵循"不猜标识符"纪律）**：
- 源文档内键名大小写**自相矛盾**——正文写 `flags.midi-qol.ActivityOverTime`（大写 T）、配方步骤 2 又写 `flags.midi-qol.ActivityOvertime`（小写 t），且把经典版写成 `flags.midi-qol.overTime`（小写 o）而 §17 经过 88 样本坐实为 `flags.midi-qol.OverTime`（大写 O 大写 T）。
- 行动版**完整 JSON 仍探针 0 命中**（世界/合集暂无在用样本）。
- **结论**：机制照本节用即可；但**精确键名大小写在落 JSON 前，须在实例里实测或导一份样本确认**，不要据本节大小写直接写死。绝大多数「持续伤害/流血/灼烧」需求用 §17 经典版已能覆盖，需要「每轮召唤/每轮检定/AoE」等才上行动版。

---

## 24. 自动化路由速查（需求 → 用什么机制 · 来源：自动化指北）

> 「第一步永远是查是否已有预制菜（CPR/GPS/MISC §12）。」下表把常见需求映射到该用的机制；具体写法见对应章节。

| 需求 | 用什么 |
|---|---|
| 物品只能在特定条件下使用 | 行动 Midi-QOL 页「使用条件」（§29 激活条件） |
| 物品仅在特定条件下施加效果 | 行动 Midi-QOL 页「激活效果条件」（§29） |
| 一连串操作（攻击后强制豁免等） | v4+ 用 Midi 页「其他行动兼容 / 触发行动」（§30） |
| 改其他物品掷骰方式（优势/伤害减免/射程） | 常规 DAE 效果 + MIDI flags（§27/§30 MIDI flags） |
| 仅特定条件给加值/优势/劣势/重骰 | Optional(midi) `flags.midi-qol.optional`（§30）或 AC5e |
| 应用/移除效果时执行操作 | DAE 宏 `macro.execute`/`macro.itemMacro`（§26） |
| 用掷骰公式表达效果持续时间 | 效果 DAE「以秒计的时长掷骰公式」（§25 持续时间） |
| 效果条件自禁用 / 自移除 | DAE「为真则禁用」/「为假则移除」表达式（§25/§29） |
| 特殊持续时间（一次攻击/豁免后失效等） | 效果「特殊持续时间」或 CPR 医药箱（§25） |
| 改常规键改不了的字段且要随效果撤销（如临时HP） | `macro.actorUpdate`（§26） |
| 固定间隔重复（回合开始/结束） | OverTime（§17/§17bis）；或 Times-Up + DAE 宏重复 |
| 响应「针对自己」的攻击/伤害（护盾术式·第一方反应） | 反应触发条件 `reaction===...`（§30） |
| 响应「发生在别人身上」的事件（法术反制·第三方反应） | MISC 的 Elwin TPR 框架，或 CPR 场景嵌入宏 |
| 只在掷出物品时有逻辑 | 物品标题栏 Midi-qol 调用宏 |
| 某角色任意物品掷出时有逻辑 | 角色使用宏 `flags.midi-qol.onUseMacroName`（§26） |
| 效果是光环 / 沉默术式区域效果 | Active Auras/Aura Effects（§19），参 Observer 示例 |

**挂宏/键值的 UI 位置**（v5.x）：物品宏=物品标题栏 DIME；行动宏=行动标题栏「行动宏编辑器」或 Midi 页底；世界宏=右侧栏 `</>`；flags.midi-qol=效果→编辑→更改页·属性名；条件评估=更改页「效果值」列；特殊持续时间=效果持续时间页底。
**角色使用宏**：建一个带 `flags.midi-qol.onUseMacroName | 自定义 | <A>,<B>` 的效果。`<A>`= `ItemMacro` / `ActivityMacro`(取第一个行动) / `ActivityMacro.<行动标识符|uuid|名称>` / 世界宏名；`<B>`=传给宏的参数。

---

## 25. DAE / 主动效果机制（效果详情页 · 持续时间 · 变更模式 · @/## 评估 · 来源：自动化指北）

### A. 效果详情页关键项

- **效果暂停**：临时禁用而非移除；⚠ 用 Times-Up 算时长时，暂停的效果**仍照常计时**。
- **将效果应用于角色**（=转移效果，§19C）。
- **状态条件**：受影响时视为有此状态（目盲/麻痹/石化…），**随效果移除而移除**；**单独状态条件**：施加时也上此状态，但与效果**相互独立**（不随移除）。
- **表达式·为假则移除**（仅非转移效果）：填 JS 表达式，评估为假则把效果从角色移除（如 `attributes.hp.value < 50` → HP≥50 时移除）。**仅支持角色掷骰数据，不支持工作流数据。**
- **表达式·为真则禁用**：评估为真则禁用（如 `!!attributes.ac.equippedArmor` → 着甲时禁用）。同上限制。
- **可叠加**：①不按名称和来源叠加（非转移默认）②不按名称叠加③不按来源叠加（同名异源可叠，如魅惑）④可多次叠加（n 个独立效果）⑤每次叠加计数 +1（名后加 `(n)`，删时删全部层）⑥应用+1/删除−1/到0删（删时只删 1 层）。⑤⑥可用 `##stackCount`(目标层数)/`@stackCount`(来源层数) 引用。
- **如果角色失能则效果结束**：用 midi `checkIncapacitated`（incapacitatedConditions：失能/麻痹/石化/死亡/昏迷/震慑 + DCE 同名）。
- **效果应用时应用于自身 / 物品掷骰时应用于自身 / 不应用效果**：如其名。

### B. 持续时间

- **效果持续时间（秒）**：没填「时长(战斗)」时，DAE 按此自动换算轮数（60 秒 = 10 轮）。
- **以秒计的时长掷骰公式**：可填公式/掷骰数据（如 `@abilities.int.mod+2d4`），单位秒。
- **效果时长（战斗）**：填了则战斗中覆盖「秒」，支持 m 轮 n 回合。
- **宏重复**：每回合开始/结束触发 DAE 宏，宏内对应 `args[0] == 'each'`。
- **特殊持续时间**：移动时结束/一次攻击后结束/持续到来源或目标下回合开始等（下拉框）；也可用 CPR 医药箱配。

### C. 变更模式（change mode）与默认优先级

| 模式 | 行为 |
|---|---|
| 加 ADD | 数值加减（`+1`/`-1`）；集合可增删条目（`mgc` 加 / `-mgc` 删） |
| 乘 MULTIPLY | 乘以效果值 |
| 覆盖 OVERRIDE | 替换；文本用 `{}` 保留原值（`Arcane {}` → `Arcane 胸甲`） |
| 降级 DOWNGRADE | 值不得**超过**设定（封顶） |
| 升级 UPGRADE | 值不得**低于**设定（保底） |
| 自定义 CUSTOM | 由系统/模组定义逻辑；**dnd5e 不用此模式**（但模组特殊键如 `flags.dae.*`/`macro.*` 走自定义） |

**默认优先级**（同键多更改按优先级低→高应用）：自定义 0 · 乘 10 · 加 20 · 降级 30 · 升级 40 · 覆盖 50。同键 `ADD 10` 与 `OVERRIDE 20` 默认结果 20（覆盖在后）；给 ADD 优先级 100、OVERRIDE 优先级 10 则结果 30。

### D. @/## 参数评估

- 被动/转移效果：几乎不改 value；内联掷骰会被求值；`@tokenUuid`/`@targetUuid`/`@actorUuid` 替换为对应 uuid，其余 `@字段` 留待 `actor.prepareData()` 查。
- 非转移效果（物品使用时施加）：`@字段`在**使用者**身上查并替换；`##字段`不求值、在**目标**身上创建的 change 值里被替成 `@字段`（再按被动规则评估）。例：力量18者打力量10目标，`@abilities.str.mod`→18，`##abilities.str.mod`→最终在目标算为10。
- **`[[公式]]`**：DAE 让本不接受掷骰数据的键也能用 `[[1d8]]` 强制引用 rolldata/掷骰公式。

### E. 控制台查数据路径（找 change-key）

```js
// 角色可用键
const t=Actor.implementation.TYPES;
t.map(x=>new Actor.implementation({name:x,type:x})).forEach(s=>console.log(s.type,s.toObject().system));
// 物品同理换 Item.implementation
```
键要带 `system.` 前缀（如 `system.abilities.str.value`）。⚠ `game.system.model` 在 13.351 已移除（§11.3），用上面的 implementation 法。

---

## 26. DAE / 模组特殊键值 + DAE 宏（来源：自动化指北）

### A. 特殊键值（变更模式均「自定义」）

| 键 | 含义 |
|---|---|
| `flags.dae.*` | 在目标设 dae flag，可用 `@flags.dae.*` 引用 |
| `flags.dae.onUpdateTarget` / `onUpdateSource` | 链接两角色、记录来源/目标 token，目标过滤字段更新时调宏。值 `Label, macroRef, updateFilter, args`；onUpdateSource 总建在使用者身上。⚠ 宏改 actor 须传 `{onUpdateCalled:true}` 防死循环 |
| `flags.dnd5e.DamageBonusMacro` | 伤害加值宏，伤害加值阶段触发 |
| `macro.execute` | 效果创建/删除/每回合执行**世界宏**（§B） |
| `macro.itemMacro` | 同上，执行效果来源**物品**上的宏 |
| `macro.activityMacro` | 同上，执行来源**行动**上的行动宏 |
| `macro.createItem` | 值=物品 UUID；效果创建时给目标创建该物品、移除时自动删 |
| `macro.createItemRunMacro` | 同上，且创建时跑该物品宏（`args[0]="onCreate"`） |
| `macro.actorUpdate` | 改常规键改不了的字段、且随效果撤销 |
| `flags.dae.deleteOrigin` | 效果删除时删其来源指向的物品（仅角色持有的） |
| `flags.dae.deleteUuid` | 效果删除时删 value 指向的 token/物品/AE |

### B. DAE 宏写法

- 语法：`macro.execute "宏名" 参数` / `macro.itemMacro 参数`；参数在物品掷骰时评估，`@`=使用者数据。
- `args[0]`：`'on'`(效果创建) / `'off'`(删除) / `'each'`(宏重复时点)，用 `if(args[0]=='on'){}` 分流。
- `'off'`/`'each'` 时标准 `actor`/`token` 未初始化 → 用 **`lastArg = args[args.length-1]`**（含 `effectId`/`origin`/`efData`/`actorId`/`actorUuid`/`tokenId`/`tokenUuid`，取角色优先用 uuid）。
- 仅宏参数可用：`@target`(目标token id)/`@targetUuid`/`@scene`/`@item`/`@spellLevel`(=施法环阶,首选)/`@damage`/`@token`/`@tokenUuid`/`@actor`/`@actorUuid`/`@unique`(随机id)/`@FIELD`；`##field`=不按来源评估、施加目标时替成 `@field`。

---

## 27. DAE 角色侧 change-key 配方（mode/值/掷骰数据 · 来源：自动化指北）

> 与 §10（路径树）互补：§10 给路径、本节给「该用什么变更模式、值格式、能否用掷骰数据」。`[公式]`=允许骰子+rolldata；`[数字]`=须可算成数（部分不允许骰子）。键前缀均 `system.`（除 `name`/`img`）。

**属性/检定/豁免/技能/先攻/专注**
- 覆盖/保底属性值：`abilities.[abl].value` 覆盖/升级 `[数字]`。
- 特定豁免/检定加值：`abilities.[abl].bonuses.save`/`.bonuses.check` 加 `[公式]`✓。全局：`bonuses.abilities.save`/`.check`/`.skill` 加 `[公式]`✓。
- 优势：`abilities.[abl].save.roll.mode` / `skills.[skl].roll.mode` 加 `1`（1=优势）。
- 先攻：`attributes.init.bonus` 加 `[公式]`✓。
- 专注加值：`attributes.concentration.bonuses.save` 加 `[公式]`✓；并发上限：`attributes.concentration.limit` 覆盖 `[数字]`。
- 技能加值/被动：`skills.[skl].bonuses.check` 加 `[公式]`✓ / `.bonuses.passive` 加 `[数字]`；专精：`skills.[skl].value` 升级 `0/0.5/1/2`。

**移动/AC/法术DC/攻击伤害**
- 移速：`attributes.movement.[walk|fly|swim|climb|burrow]` 乘 `[数字]`✓ / 升级 `[数字]`✓（飞行可引用 `@attributes.movement.walk`，反之不行）；全速加值 `attributes.movement.bonus` 加 `[公式]`✓；忽略困难地形 `attributes.movement.ignoredDifficultTerrain` 加 `all/magical/nonmagical/ice/liquid/plants/rocks/slope/snow`。
- AC：`attributes.ac.bonus` 加 `[数字]`✓；自定义 AC = `attributes.ac.calc` 覆盖 `custom` + `attributes.ac.formula` 覆盖 `12 + @abilities.int.mod`。
- 法术DC：`bonuses.spell.dc` 加 `[数字]`✓。
- 攻击/伤害加值：`bonuses.{mwak,rwak,msak,rsak}.attack`/`.damage` 加 `[公式]`✓；可内嵌类型 `1d8[radiant]`/`@abilities.cha.mod[radiant]`。

**免疫/抗性/易伤/调整/吸收 + 无视**
- `traits.di.value`(免疫)/`dr.value`(抗性)/`dv.value`(易伤) 加 `[伤害类型]`；`traits.ci.value` 加 `[状态]`。
- 伤害调整：`traits.dm.amount.[类型]` 加 `[数字]`✓（增减承伤）；吸收：`traits.da.[类型]` 加 布尔（转治疗）。
- 无视：`traits.{idi,idr,idv,idm,ida}.value` 加 `[伤害类型]`（伤害类型前加 `-` = 抑制对应无视）。

**生物类型/体型/比例值/HP/杂**
- 类型：`details.type.value` 覆盖 `[生物类型]` + `details.type.subtype` 覆盖 `[文本]`；体型：`traits.size` 覆盖（下拉）。
- 比例值 scale：`scale.[职业标识符].[比例标识符].{value|number|faces|modifiers}` 加 `[数字/文本]`（如 `scale.rogue.sneak-attack.number` 加偷袭骰；`@scale.X.Y` 取 `3d8`，`.denom` 取不带修饰的面）。
- HP：⚠ **切勿** AE 改 `hp.value`/`.max`/`.temp`；用 `attributes.hp.tempmax` 加 `[数字]`（援助术）/`hp.bonuses.overall` 加 `[数字]`✓（增最大HP）/`hp.bonuses.level` 加 `[数字]`✓（每级HP）。
- 杂：`name` 覆盖文本 / `img` 覆盖路径 / `attributes.prof` 覆盖 `[数字]`（熟练加值）。
- 负重：`attributes.encumbrance.multipliers.{encumbered|heavilyEncumbered|maximum|overall}`（乘）/ `.bonuses.*`（加）。

---

## 28. 附魔键值（改物品/行动 · 来源：自动化指北）

> 附魔=特殊主动效果，改**物品本身**而非角色。**附魔键与角色侧 change-key 不互通**。格式 `activities[<类型>].<路径>`（类型 = attack/save/heal/damage/utility… ；`base` 表通用）。

**行动通用 `activities[type].*`**：`activation.type`(动作/附赠/反应…)/`.value`/`.override`；`consumption.scaling.allowed/.max`、`consumption.spellSlot`(仅法术)、`consumption.targets`；`duration.concentration`；`target.affects.count/.type/.choice/.special`(`-self` 排除自身)；`uses.max`✓/`.spent`/`.recovery`；`range.units`/`range.value`；`img`/`name`；**`damage.parts`** 加/覆盖 `{number,denomination,bonus,types:[...]}` 或 `{custom:{enabled:true,formula:"…"}}`✓；`damage.includeBase`/`damage.critical.bonus`✓/`damage.critical.allow`。

**MIDI 附魔键 `activities[base].*`**：`effectConditionText`✓(激活效果条件)/`useConditionText`✓(使用条件)/`macroData.command`+`.name`(行动宏)/`midiProperties.automationOnly`/`.confirmTargets`(default/always/never)/`.forceDialog`/`.ignoreTraits`(`["idi","idr","idv","ida","idm"]`)/`.otherActivityCompatible`/`.triggeredActivityId`/`.triggeredActivityConditionText`/`.triggeredActivityRollAs`(self/firstTarget/firstHitTarget/firstMissedTarget/firstSaveTarget/firstFailedSaveTarget)/`.triggeredActivityTargets`。

**攻击行动**：`attack.ability` 覆盖；`attack.bonus` 加✓；`attack.critical.threshold`(降级=覆盖阈值/加=增减)；`attack.flat`(固定命中,无视熟练+属性)；`attack.type.classification`(武器/法术/徒手)/`.type.value`(近/远)；`attackMode`(单手/双手/投掷/远程)。
**豁免行动**：`damage.onSave`(none/half/full)；`save.ability`；`save.dc.calculation`(""=自定义/spellcasting/str…)/`.dc.formula`✓/`.dc.bonus`✓。
**治疗行动**：`healing.bonus`✓/`.custom.enabled`+`.custom.formula`✓/`.denomination`/`.number`/`.scaling.{formula,mode,number}`/`.types`(治疗/临时HP)。

**系统附魔键（改 Item）**：`system.armor.{dex,magicalBonus,value}`/`system.attuned`(布尔)/`system.attunement`(""/required/optional)/`system.damage.parts`(`[["formula","type"]]`)/`system.damage.types`覆盖/`system.damage.versatile.bonus`/`system.equipped`/`system.properties`(物品属性,见下)/`system.proficient`(0/1)/`system.uses.{max✓,spent,recovery}`。
**充能恢复周期** `uses.recovery.period`：`recharge` `sr`短休 `lr`长休 `day`每日 `dawn`黎明 `dusk`黄昏 `initiative`先攻时 `turnStart`/`turnEnd`/`turn`。**完整两段式（uses 池 + recovery + consumption 扣格 + 部分回复 `type:"formula"`）见 §9bis。**
**武器属性**(`system.properties`)：`ada`精金 `amm`弹药 `fin`灵巧 `fir`火器 `foc`法器 `hvy`重型 `lgt`轻型 `lod`装填 `mgc`魔法 `rch`长触及 `rel`重新装填 `ret`回旋 `sil`银质 `spc`特殊 `thr`投掷 `two`双手 `ver`多用。装备另有 `stealthDisadvantage`；容器另有 `weightlessContents`。
**附魔指南·名/图/描述**：`name` 覆盖（`{}` 保留原名做 `短剑, +1`）；`img` 覆盖路径；`system.description.value` 覆盖（`{}` 保留原描述，HTML）；`system.properties` 添加属性缩写。（施法/转进/召唤/变形/效用/附魔附魔键在源文档为空表，无内容。）

---

## 29. 激活条件全集（条件化自动化核心 · 来源：自动化指北）

> 同时适用于：Midi「使用条件 / 激活效果条件」、触发行动「触发条件」、DAE「为真禁用 / 为假移除」表达式、Optional `.activation`/`.force`。**怪物「在某条件下才……」的能力几乎都靠这层。**

**运算符**：`&&` 与 · `||` 或 · `??` 空值合并 · `!` 非 · `==`/`===` 等于/严格等于 · `<` `<=` `>` `>=`。

**可用变量（节选 · 全部来自源文档）**：
- `damageTypes`（本次所有伤害类型，`damageTypes.fire` / `["cold","thunder"].some(t=>damageTypes[t])`）；`defaultDamageType`(首个类型)。
- `isAttuned` · `isConcentrationCheck`(需 midi 选「掷骰专注」) · `isDeathSave` · `worldTime`(=`game.time?.worldTime`)。
- `actor.raceOrType`/`.typeOrRace`/`.isCombatTurn`。
- `target.actor.getRollData()` · `target.raceOrType`/`.typeOrRace` · `target.saved`/`.failedSave`/`.superSaver`/`.semiSuperSaver` · `target.isHit`/`.isHitEC` · `target.canSee`/`.canSense` · `target.isCombatTurn`。（`target` 去掉则指物品拥有者数据。）
- `tokenUuid`/`tokenId`/`actorId`/`actorUuid`/`actorType`/`targetId`/`targetUuid`/`targetActorId`/`targetActorUuid` · `raceOrType`(同 target.raceOrType) · `canSee`。
- `item`(`item.itemType`/`item.actionType`) · `activity` · `otherDamageActivity` · `shouldRollDamage` · `hasAttack`/`hasDamage`/`hasSave` · `workflow`(全工作流数据)。
- `humanoid`=类人种族名数组。
- `workflow.advantage`/`.isCritical`/`.attackMode`/`.selfTargeted`/`.diceRoll`(d20 原值, 攻击掷20 = `workflow.diceRoll == 20`)/`.attackTotal`/`.damageTotal`/`.saveDC`。
- 战斗中：`combatRound`/`combatTurn`/`combatTime`(=`round + turn/100`)/`isCombatTurn`；非战斗 `combatTime` 默认 0。

**就地范围函数**：`computeDistance(tokenUuid,targetUuid) <= 10`；`checkNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE, tokenUuid, 5)`(5尺内有敌)；`findNearbyCount('CONST.TOKEN_DISPOSITIONS.HOSTILE', tokenUuid, 5, 0)`(计数)；`findNearby(disposition, token, distance, {maxSize, includeIncapacitated})`。

**条件示例（逐字 · 直接抄改）**：
```text
item.itemType == "spell"                  掷骰物品是法术（亦可 weapon/feat/tool）
["spell","weapon"].includes(item.itemType)
item.level == 0                           法术基础环阶0（戏法）
item.school == "abj"                      防护学派（或 workflow.item.system.school == "abj"）
item.sourceClass == "cleric"             施法职业牧师（dnd更新或废弃）
workflow.item.system.properties.has("mgc")   武器有魔法属性
workflow.castData.baseLevel == 4          法术基础环阶4
workflow.castData.castLevel == 4          实际消耗环阶4
workflow.item.system.type?.baseItem == "longsword"      武器是长剑
["shortbow","longbow"].includes(workflow.item.system.type?.baseItem)
workflow.item.system?.rarity == "uncommon"
workflow.saveResults[0].total < 10        目标豁免<10（多目标只要一个满足即true）
workflow.saveRolls?.[0]?.hasAdvantage == true
workflow.activity.ability == "int"        行动用智力
target.appliedEffects.some(e => e.name.toLowerCase().includes("inspiration"))
target.effects.some(e => e.name == "Effect Name")
target.statuses.frightened                目标被恐慌
["lg","med","sm","tiny"].includes(target.traits.size)
target.items.some(i => i.name == "itemName")
target.attributes.hp.value != target.attributes.hp.max    目标已损血
target.attributes.hp.value < target.attributes.hp.max / 2  目标半血以下
target.abilities.str.value >= 22
target?.system?.traits?.ci?.value?.has("diseased")        目标免疫疾病
target.details.cr <= 3 / target.details.level == 10 / target.details.gender
raceOrType.includes("undead")             目标是不死生物
```

---

## 30. 反应触发 / 其他行动 vs 触发行动 / Optional 可选加值（来源：自动化指北）

### A. 反应触发条件（在反应行动 Midi 页「使用条件」填 `reaction === '...'`）

行动激活·时间选「反应」，默认 `isHit` 触发。触发时机：`preAttack`(被攻击前) · `isAttacked`(掷出攻击后未判命中) · `isMissed` · `isHit` · `isDamaged` · `isHealed` · `isSave`(被迫豁免、未裁决) · `isSaveSuccess` · `isSaveFail` · `"false"`(只能手动触发)。可与 §29 条件组合。

### B. 使用其他行动 vs 触发行动（二选一）

- **使用其他行动**：与主行动**同一工作流**；能用的行动有限。附属行动 Midi 页勾「其他行动兼容」+「仅自动化」、其自身「使用其他行动」设无；主行动 Midi 页「使用其他行动」选 Auto/豁免。条件控制写在附属行动「使用条件」。
- **触发行动**：视作**两个独立工作流**；可触发所有 midi 行动。附属行动 Midi 页勾「仅自动化」且**务必不勾「其他行动兼容」**；主行动 Midi 页填四键——**触发行动**(执行哪个)/**触发条件**(主工作流结束后评估，如 `target.attributes.hp.value <= 50`)/**触发目标**/**掷骰**(视同谁掷，影响豁免DC等)。

### C. Optional 可选加值 `flags.midi-qol.optional.NAME.*`（OVERRIDE）

> `NAME`=唯一串（建议同效果/物品名）。条件型加值/幸运重骰/把失败豁免转成功等。

`activation`(条件真则弹窗供选)/`force`(条件真则强制不弹窗)/`damage.{all|mwak|rwak|msak|rsak}`/`skill.{all|per|prc|...}`/`attack.{all|...}`/`check.{all|str|...}`/`save.{all|str|...}`(需开自动快进)/`save.fail.{all|str|...}` 与 `check.fail.*`/`skill.fail.*`(失败时加；`save.fail.dex` 覆盖 `success` 可把失败豁免转成功)/`label`/`criticalDamage`(true=伤害加值随重击翻倍)/`ac`(给目标AC,目标端提示)/`rollMode`(publicroll/gmroll/blindroll/selfroll)/`macroToCall`(ItemMacro/世界宏名)。
- **次数 `count`**：`every`(每次)/`reaction`(消耗反应)/数字/`turn`(本回合一次)/`each-turn`/`each-round`/`@field`(>0可用、用后递减)/`ItemUses.<identifier|partialNameMatch|exactNameMatch>.<值>`/`ActivityUses.<identifier|id|partialNameMatch|exactNameMatch>.<物品>.<行动>`；`countAlt`=附加须同时可用的计数（如既要次数又要反应）。
- **更改值可填**：骰子表达式 / 数字(配 `.activation`/`.force` 用运算符如 `+2`) / `reroll`、`reroll-max/-min/-kh/-kl/-query`、`reroll-withBonus +1d4` / `success`(确保成功·目前作重击) / `fail` / `replace <公式>`(如 `replace 4d20kh`) / `ItemMacro.<itemUUID>`(返回上述类型之一，如 `return '1d6[fire]'`)。

---

## 31. 原生变形 transformOptions（dnd5e 卡面变形 · 已坐实）

> 来源：两份真实变形结果 Actor 导出 + 「配置变形」对话框截图交叉确认。**触发=纯卡面手动**（开本体卡→拖入目标 Actor→对话框→选→变形），无 item/activity/宏；怪物卡上的变形按规范 §M14 做成描述性 feat。本节坐实变形后写入结果 Actor 顶层的 flags。

### A. flags.dnd5e 完整骨架（顶层 11 键全坐实，值类型确定）

```json
"flags": { "dnd5e": {
  "transformOptions": {
    "preset":         "polymorph",      // ✅ "polymorph" | "wildshape"（另"默认/仅外观"内部键⚠未证）
    "keep":           [],               // ✅值: mental class feats bio tempHP（子集，全集⚠）
    "merge":          [],               // ✅值: saves skills
    "effects":        [],               // ✅值: origin otherOrigin background class feat spell（子集，全集⚠）
    "other":          [],               // ⚠ 观测恒空，合法值未证
    "spellLists":     [],               // ✅ 数组
    "minimumAC":      "",               // ✅ 公式串
    "tempFormula":    "",               // ✅ 公式串
    "transformTokens": true,            // ✅ bool
    "mergeSaves":      false,           // ✅ bool（与 merge 的 "saves" 配对）
    "mergeSkills":     false            // ✅ bool（与 merge 的 "skills" 配对）
  },
  "originalActor":    "<源 Actor id>",  // ✅ 变形前本体
  "isPolymorphed":    true,             // ✅
  "previousActorIds": [ "<源 id>" ]     // ✅ 变形链，可逐层还原
} }
```

### B. 「配置变形」对话框 ↔ 键 全对照（✅坐实 / ⚠内部键未证·勾选导出即补）

| 对话框分区 | 标签 | → transformOptions | 状态 |
|---|---|---|---|
| 预设 | 变形术 | `preset:"polymorph"`（整只换形态、数值全替换） | ✅ |
| 预设 | 荒野变形 | `preset:"wildshape"`（保心智/职业/特性的塑形） | ✅ |
| 预设 | 默认 / 仅外观 | `preset:"?"` | ⚠ |
| 保留 | 精神属性 | `keep += "mental"` | ✅ |
| 保留 | 特性 | `keep += "feats"` | ✅ |
| 保留 | 传记 | `keep += "bio"` | ✅ |
| 保留 | 临时生命值 | `keep += "tempHP"` | ✅ |
| 保留 | 生理属性 / 豁免熟练 / 技能熟练 / 装备熟练 / 语言 / 熟练加值 / 装备 / 法术 / 生物类型 / 生命值与生命骰 / 伤害抗性 / 视觉 / 自身 | `keep += "?"` | ⚠ |
| 合并 | 豁免熟练 | `merge += "saves"` ＋ `mergeSaves:true` | ✅ |
| 合并 | 技能熟练 | `merge += "skills"` ＋ `mergeSkills:true` | ✅ |
| 激活效应 | 该角色 | `effects += "origin"` | ✅ |
| 激活效应 | 其他角色 | `effects += "otherOrigin"` | ✅ |
| 激活效应 | 背景效应 | `effects += "background"` | ✅ |
| 激活效应 | 职业效应 | `effects += "class"` | ✅ |
| 激活效应 | 特性效应 | `effects += "feat"` | ✅ |
| 激活效应 | 法术效应 | `effects += "spell"` | ✅ |
| 激活效应 | 所有效应 / 装备效应 | `effects += "?"` | ⚠ |
| 其他选项 | 最低护甲等级 | `minimumAC`（公式串） | ✅ |
| 其他选项 | 保留的法术列表 | `spellLists`（数组） | ✅ |
| 其他选项 | 临时生命值公式 | `tempFormula`（公式串） | ✅ |
| 其他选项 | 变形指示物 | `transformTokens`（bool） | ✅ |

> 注：`keep` 已坐实值里另有 `"class"`，疑由 wildshape 预设带入，未对到对话框某具体勾选框。

### C. 两份真实样本（坐实依据）

| 预设 | keep | merge | mergeSaves/Skills | effects | minimumAC |
|---|---|---|---|---|---|
| wildshape | mental,class,feats,bio,tempHP | saves,skills | true / true | origin,otherOrigin,background,class,feat,spell | `(13 + @abilities.wis.mod) * sign(@subclasses.moon.levels)` |
| polymorph | （空） | （空） | false / false | origin,otherOrigin,spell | `""` |

### D. 用法 / 坑

- **实战不用手写这段 JSON**：对话框选预设+勾框即可，本节用于「认结果快照」「写自定义配置」与还原变形链。
- 怪物卡上的变形 = **描述性 feat（无 activity）**，GM 手动操作；实现/操作步骤进自动化日志，不进卡面（规范 §0bis / §M14）。
- 补 ⚠ 键：勾上那个框变形一次，把结果 Actor 的 `transformOptions` 导出，对应内部键当场坐实，再回填本表。
- 此节补全后，§28 末「变形附魔键空表」对原生变形不再是空白（附魔键仍另算）。

---

## 32. CONFIG 权威枚举快照（F12 `CONFIG.DND5E` dump 坐实 · v8）

> 来源：在世界控制台 dump `CONFIG.DND5E` 全量枚举（3 轮，dnd5e 5.3.3）。**这是枚举的最权威来源**——比逐个导出 item 全。下列均为内部键（写 JSON 用这些，不是中文标签）。带 `*` 的是本世界 mod 注入值，原版不一定有。

### A. 目标 / 模板 / 范围

- **`target.affects.type`**（individualTargetTypes）：`self ally enemy creature willing object space creatureOrObject any`（+ `""` 不限）。详见 §5bis。
- **`target.template.type`**（areaTargetTypes）：`radius sphere circle cylinder cube square wall line cone emanationNoTemplate`。**无 `rect`**。详见 §5bis。
- **`range.units`**（rangeTypes + distanceUnits）：`self touch spec any` ＋ 距离单位 `ft mi m km`。
- **`movement.*` 移动类型**（movementTypes）：`walk burrow climb fly jump swim`；单位 `ft mi m km`。
- **`senses.ranges.*`**（senses）：`darkvision blindsight tremorsense truesight`。

### B. 活动 / 激活 / 时长 / 消耗 / 恢复

- **`activity.type`**（activityTypes）：`attack cast check damage enchant forward heal order save summon transform utility`（规范常用 attack/save/heal/utility/summon）。
- **`activation.type`**（activityActivationTypes）：`action bonus reaction minute hour day longRest shortRest encounter turnStart turnEnd legendary mythic lair crew special villain*`。
- **`duration.units`**（timePeriods）：即时/特殊 `inst spec`；时长 `turn round minute hour day month year`；永久 `disp`(至消散) `dstr`(至消散或触发) `perm`。
- **`consumption.targets[].type`**（activityConsumptionTypes）：`itemUses activityUses spellSlots hitDice attribute material`（+ mod 值 `ferocity* manifestDie* consumeSouls* barrel*`）。详见 §9bis。
- **`uses.recovery[].period`**（limitedUsePeriods）：`lr sr day dawn dusk initiative turnStart turnEnd turn`（+ `recharge` 特例，不在此 config 但合法）。
- **`uses.recovery[].type`**：`recoverAll`(回满) / `formula`(部分回复，+`formula` 骰子串) / `loseAll`。详见 §9bis。
- **升环缩放**：`damageScalingModes` = `whole`(每级) / `half`(每隔一级)；`spell` 升环 `spellScalingModes` = `level none cantrip`。

### C. 攻击 / 伤害 / 治疗

- **`attack.type.value`**（attackTypes）：`melee ranged`。
- **`attack.type.classification`**（attackClassifications）：`weapon spell unarmed`（+ `mcdm-class-bundle.power*`）。
- **旧版动作类型 `actionType`**（itemActionTypes）：`mwak rwak msak rsak abil save ench summ heal util other`。
- **`damage.*.types`**（damageTypes）：`acid bludgeoning cold fire force lightning necrotic piercing poison psychic radiant slashing thunder vitality none midi-none`。
- **`healing.types`**（healingTypes）：`healing temphp maximum vitality`。

### D. item 分类 / 物品属性 / 稀有度 / 调律

- **武器 `type.value`**（weaponTypes）：`simpleM simpleR martialM martialR natural improv siege firearm`。
- **护甲/装备 `type.value`**（equipmentTypes）：护甲 `light medium heavy natural shield`；饰品奇物 `clothing ring wand rod trinket wondrous vehicle`。
- **特性 `type.value`**（featureTypes）：`monster`(怪物特性·怪物默认用它) `class race background enchantment feat supernaturalGift vehicle spellFeature`；`class` 有大量 subtype（multiattack/channelDivinity/fightingStyle…），`feat` subtype `epicBoon/origin/general/fightingStyle`。
- **消耗品 `type.value`**（consumableTypes）：`ammo poison scroll wand wondrous rod food trinket potion`（+ `psiCrystal*`）。
- **`system.properties`**（itemProperties）：`mgc`(魔法) `ada`(精金) `sil`(镀银) `fin`(灵巧) `hvy`(重型) `lgt`(轻型) `two`(双手) `rch`(触及) `thr`(投掷) `ver`(多用) `foc`(法器) `ret`(回力) `amm`(弹药) `rel`(弹容) `lod`(装填) `fir`(枪械) `spc`(特殊) `vocal somatic ritual concentration material`(法术) `stealthDisadvantage`(护甲) `weightlessContents`(容器) …（+ 本世界 mod `delm* mng* art* …`）。
- **`rarity`**（itemRarity）：`common uncommon rare veryRare legendary artifact`。
- **`attunement`**（attunementTypes）：`required optional`（+ `""` 不需调律）；配 `"attuned": false`。

### E. 角色 / 施法 / 阵营

- **`abilities`**：`str dex con int wis cha`。
- **`skills`**：`acr ani arc ath dec his ins inv itm med nat per prc prf rel slt ste sur`（易混见 §5）。
- **`traits.size`**（actorSizes）：`tiny sm med lg huge grg`（token w/h 见 §7）。
- **`details.type.value`**（creatureTypes）：`aberration beast celestial construct dragon elemental fey fiend giant humanoid monstrosity ooze plant undead`。
- **`details.alignment`**（alignments，多数当**自由串**填如 `"Chaotic Evil"`；规范键）：`lg ng cg ln tn cn le ne ce`。
- **施法 `method`/方式**（spellcasting）：`atwill innate ritual pact spell apothecary*`（旧键 `spellPreparationModes`/`spellcastingTypes` **已弃用**，5.1 起改用 `spellcasting`）。
- **施法进阶**（spellProgression）：`none pact full half third artificer`（+ `heretic*`）。
- **`spell.level` / `spellLevels`**：`0`(戏法)`~9`。

### F. 状态 statusEffects（`effects[].statuses` 权威全集）

```
blinded burning charmed concentration concentrating cursed dazed dead deafened
dehydration diseased disengage distracted dodging ethereal exhaustion exhausted
falling flanked flanking frightened grappled hasted hiding hovering incapacitated
invisible malnutrition marked paralyzed petrified poisoned prone rage reaction
restrained silenced sleeping slowed stable stunned suffocation surprised
transformed turned unconscious burrowing flying bleeding
cover coverHalf coverThreeQuarters coverTotal bonusaction encumbered
heavilyEncumbered exceedingCarryingCapacity
```

> 状态免疫 `traits.ci.value` 用 §3 conditionTypes 的键（与上方多数重合）。

---

## 待补项

- ✅ CPR `flags.chris-premades.CR.<状态>` 已坐实（§16，mode 5/value "1"）；CV 同构（未见直接样本，结构相同）。
- ✅ OverTime 已坐实（§17 经典 + §17bis 新版 v13.0.37+：saveCount/failCount/effectSpec/石化疫病配方）。
- ✅ 内嵌 CPR 官方法术已坐实（§18）。
- ✅ midi 生态/依赖、宏接入与 FVTT 文档·API、MidiQOL/workflow 函数全录、CPR 自定义宏 fork 流程已并入（§19–§22）。
- ✅ 自动化指北已并入（§24 路由速查 / §25 DAE·AE 机制 / §26 DAE 特殊键值+DAE宏 / §27 角色侧 change-key 配方 / §28 附魔键值 / §29 激活条件全集 / §30 反应·其他行动·Optional），并补 §17bis 新版 OverTime。**原 4 份文档（midi/宏/overtime/自动化指北）均可删，怪物自动化信息不丢。**
- ✅ **v8 全坐实（F12 CONFIG dump · §32）**：目标 `affects.type` 全 9 值（**含 `enemy`/`willing`，§5bis 闭环**）、模板 `areaTargetTypes` 10 值（**纠正 `rect` 笔误**）、`activation.type`(17)、`duration.units`(12)、`consumption.targets[].type`(itemUses/activityUses/spellSlots/hitDice/attribute/material)、`range.units`、`featureTypes`/`equipmentTypes`/`itemRarity`/`attunementTypes`/`spellProgression`/`spellScalingModes`/`alignments`/`statusEffects` 等——**怪物生成枚举层全闭环**。
- ⚠ 行动版 `flags.midi-qol.ActivityOverTime`（v13 新机制）：**机制已录（§23）**，但精确键名大小写**仍未坐实**（两份源文档均自相矛盾 `ActivityOverTime`/`ActivityOvertime`，且完整 JSON 探针 0 命中）；**经典 §17 + 新版 §17bis 已覆盖绝大多数持续伤害需求**，需行动版时须先导样本确认键名。
- ⚠ 高级活动**内部结构**（非枚举）：`cast`(链接法术·消耗充能)、`enchant`、`transform`、`order`、`forward`、`check`、`damage` 这些 activity 的完整字段尚未逐一拆解（attack/save/heal/utility/summon 已覆盖）。需要某一种时，从对应真实 item 导出取（如 `cast` 见火球魔杖/威力法杖导出），不影响怪物核心生成。
- 其余**均已坐实**。


---

## 33. 视野映射（prototypeToken.sight + detectionModes）— 已坐实

环境 Foundry 13.351 / dnd5e 5.3.3。来源：木桩 token 导出 + 视野页中文标签。

**关键**：`system.attributes.senses.ranges.*` 只填卡面；token 真能看见须配 `prototypeToken.sight` + `detectionModes`，二者缺 → token 全瞎。

**sight 全字段**：`{ enabled:bool, range:数字, angle:360, visionMode:"basic"|"darkvision"|…, color:null, attenuation:0.1, brightness:0, saturation:0, contrast:0 }`

**detectionModes 条目**：`{ id:<下表>, range:数字(尺), enabled:true }`

| D&D 感官 | senses 键 | 视野页标签 | detectionMode `id` |
|---|---|---|---|
| 黑暗视觉 | darkvision | 黑暗视觉 | `basicSight` |
| 真视 | truesight | 全部可见 | `seeAll` |
| 盲视 | blindsight | 盲视 | `blindsight` |
| 振动感知 | tremorsense | 感知震颤 | `feelTremor` |
| 基础见光 | — | 感知光照 | `lightPerception` |
| （特殊：感知全部） | — | 感知全部 | `senseAll` |
| （特殊：感知隐形） | — | 感知隐形 | `senseInvisibility` |
| （特殊：隐形可见） | — | 隐形可见 | `seeInvisibility` |

**配法**：`sight.range` = 最大感官距离；有黑暗视觉则 `visionMode:"darkvision"`。`detectionModes` = `lightPerception` + 各感官对应 mode（range 填该感官尺数）。普通怪不挂 senseAll/senseInvisibility/seeInvisibility。

---

## 34. 指示物命名（prototypeToken）— 已坐实

- `appendNumber`(bool)：未关联 token 名后追加递增数字（「哥布林 3」）。
- `prependAdjective`(bool)：未关联 token 名前加随机形容词（「愤怒的哥布林」）。
- **`displayName`(number)：名字显示模式** —— 枚举在 **`foundry.CONST.TOKEN_DISPLAY_MODES`**（2026-09-17 世界实读坐实）：

  | 值 | 常量名 | 含义 |
  |---|---|---|
  | 0 | `NONE` | 从不显示 |
  | 10 | `CONTROL` | 仅控制者可见 |
  | **20** | **`OWNER_HOVER`** | **拥有者悬停时显示 —— 本项目默认** |
  | 30 | `HOVER` | 悬停时显示 |
  | 40 | `OWNER` | 仅拥有者可见 |
  | 50 | `ALWAYS` | 始终显示 |

  ⚠️ **v13 的 `CONFIG.Token.displayModes` 已不存在** —— 读它得 `undefined`，用它 localize 会得到 `n/a`；**必须走 `foundry.CONST`**（实测：`CONFIG.Token.displayModes` → undefined，`foundry.CONST.TOKEN_DISPLAY_MODES` → 完整六项）。
  ⚠️ 建卡设的是**原型**（`prototypeToken`），放到地图上的 token 会继承；**改 prototypeToken 不影响已放置的 token**（那已是独立文档，要单独改）。
  实测样本：世界「特醇佳酿」场景内「西格蒙德」的 token `displayName = 50`（ALWAYS）。

**规则**：`appendNumber` **默认 `false`**（不加数字后缀，除非 DM 特别想要编号）；`prependAdjective` 普通/杂兵/可成群小怪 → `true`（只加随机形容词前缀），独特/具名/精英/Boss → `false`。

---

## 35. 动画 flags.autoanimations（Automated Animations 6.8.1）— 已坐实

挂在 **item 顶层 `flags.autoanimations`**；不挂则走全局 autorec 自动匹配。

### 35.1 外壳
```json
"autoanimations": {
  "id": "<随机uuid>", "label": "<招式名>",
  "macro": { "enable": false, "playWhen": "0" },
  "menu": "melee|range|templatefx|ontoken|preset",
  "isEnabled": true, "isCustomized": true, "fromAmmo": false, "version": 5,
  "soundOnly": { "sound": { "enable": false } }
}
```
- **video 块**：`{ dbSection, menuType, animation, variant, color, enableCustom:false, customPath:"" }`。`enableCustom:true` 时改用 `customPath:"jb2a.…"`（数据库查看器取精确路径；实测 templatefx/preset 条目就用 customPath）。
- **sound 块**：`{ enable:true, file:"psfx.…", volume:0.75, delay:0, repeat:1, repeatDelay:250, startTime:0 }`（file 为 Pixelmancy psfx 路径）。
- **options 常用**：`delay, elevation(1000), opacity(1), playbackRate(1), repeat(1), zIndex(1), size(1，静态)/scale("1"，模板), anchor("0.5"), fadeIn(250), fadeOut(500), tint(false), tintColor("#FFFFFF")`。
- `levels3d` 块仅 3D 画布需要，2D 桌面可整段省略。

### 35.2 五形态字段
- **melee**：`primary` + `secondary{enable}` + `source{enable}` + `target{enable}` + `meleeSwitch{video,sound,options:{detect,range,returning,switchType}}`（远程切换，用不到设 enable 关）。
- **range**：`primary`(弹道) + `secondary{enable}`(命中爆) + `source{enable}` + `target{enable}`。
- **templatefx**：`primary` 落模板。持续地带（雾/网/黑暗）`primary.options`: `persistent:true, persistType:"attachtemplate", isMasked:true, occlusionMode:"3", scale:"1.5"`；瞬爆（火球/爆炸）`persistent:false`。
- **ontoken**：`primary.options.playOn:"target"`（落被作用目标）或 `"source"`（落自身，用于自增益/治疗自己）。
- **preset**（传送）：`presetType:"teleportation"` + `data:{ start, between, end, options, sound }`。`options:{ range, hideFromPlayers, measureType:"alternating", teleport:true, speed:120, delayMove:1000, alpha:0, delayFade:750, delayReturn:250, checkCollision:true }`。⚠ start/end 内启用键 AA 拼作 **`"enabe"`**（非 enable），照抄勿改；start/end 也可 `enableCustom:true`+`customPath`。

### 35.3 合法词库（dbSection → menuType → animation）

```text
range.weapon:    arrow bolt bomb boomerang boulder bullet cannonball chakram dart flask
                 grenade grenadelaunch hammer handaxe javelin lasershot lasersword
                 siegeboulder sling snipe snowball triboomerang
range.spell:     chainlightning disintegrate eldritchblast fireballbeam firebolt guidingbolt
                 magicmissile rayoffrost scorchingray witchbolt
range.generic:   conduit energybeam energystrand heart iceshard musicnote poison skull
melee.weapon:    club dagger falchion flurryofblows glaive greatclub halberd lasersword mace
                 quarterstaff rapier scimitar spear sword unarmedstrike wrench
melee.generic:   1hb 1hp 1hs 2hb 2hp 2hs slashing      (h=hand, b/p/s=钝/穿/斩)
static.spell:    antilifeshell armsofhadar bardicinspiration blacktentacles bless calllightning
                 curewounds darkness detectmagic divinesmite entangle fireball fogcloud
                 generichealing huntersmark mistystep moonbeam sacredflame shatter sleep
                 sneakattack spiritguardians thunderwave tollthedead wallofforce web whirlwind
static.generic:  boulderimpact explosion impact outpulse smoke ui vortex water whirl
static.creature: bite claw
static.conditions: crackedshield dizzystars fear heart horror light runes skull stun
static.magicsign: abjuration conjuration divination enchantment evocation illusion necromancy transmutation
static.chains:   diamond spike standard
static.marker:   boneshield bubble circleofstars energystrand light smokering standard towershield
static.fire:     eruption groundcrack
static.lightning: staticelectricity strike
static.ice:      icespikes snowflake
static.eyes:     few many single
static.energy:   circle dodecahedron energyfield shimmer sparkles strands
static.impact:   frost groundcrack
templatefx.circle: armsofhadar blacktentacles calllightning cloudofdaggers crackedshield darkness
                   detectmagic drop explosion fear fireball fogcloud heart horror magicsign moonbeam
                   outpulse runes shatter sleetstorm snowflake stun vortex water whirl
templatefx.ray:    breathweapon breathweaponspray01 gustofwind lightningbolt
templatefx.cone:   breathweapon burninghands coneofcold detectmagic
templatefx.square: armsofhadar drop entangle fear grease shields stun thunderwave web
```
**variant** 取值：`01 02 03 04 05 06 regular`，及主题串（`fire fire01 fire02 physical magical poison lightning cold acid intro loop outro source target burst pulse ...`）。
**color** 取值：`red darkred orange darkorange yellow orangeyellow green darkgreen lightgreen palegreen brightgreen blue darkblue lightblue teal darkteal purple darkpurple pink purplepink black grey white regular rainbow random ...`（共约 47 种，按特效有无该色而定）。

### 35.4 招式 → 配置调色板

| 招式类型 | menu | dbSection/menuType/animation | color |
|---|---|---|---|
| 近战利刃 | melee | melee/weapon/sword·scimitar·dagger | red/darkred(血)|
| 近战钝击 | melee | melee/weapon/mace·greatclub；melee/generic/2hb·2hs | regular/orange |
| 近战自身锥横扫 | templatefx | templatefx/cone/breathweapon | 随属性 |
| 远程箭 | range | range/weapon/arrow | regular |
| 远程枪弹 | range | range/weapon/bullet | regular |
| 远程火法弹 | range | range/spell/firebolt·fireballbeam | orange/red |
| 远程死灵/毒弹 | range | range/spell/eldritchblast；range/generic/skull·poison | purple/green |
| 范围·火爆 | templatefx | templatefx/circle/fireball·explosion | orange |
| 范围·毒/腐云 | templatefx | templatefx/circle/fogcloud(persistent) | green |
| 范围·锥吐息 | templatefx | templatefx/cone/breathweapon·coneofcold | 随属性 |
| 范围·线形 | templatefx | templatefx/ray/lightningbolt·breathweapon | 随属性 |
| 上状态·束缚 | ontoken | static/chains/standard·spike (playOn target) | regular |
| 上状态·致眩/恐慌 | ontoken | static/conditions/stun·fear·horror | regular |
| 自增益/光环 | ontoken | static/spell/divinesmite·bless；static/magicsign/evocation (playOn source) | 随属性 |
| 治疗/血瓶 | ontoken | static/spell/curewounds·generichealing (playOn target/self) | green/blue |
| 属性吸取/吸脑 | ontoken | static/spell/tollthedead；static/eyes/single | purple |
| 传送/闪现 | preset | start·end=static/spell/mistystep（或 customPath jb2a） | blue/随属性 |

### 35.5 整段范例
**近战(血刃)**：
```json
"flags": { "autoanimations": { "id":"<uuid>", "label":"<名>", "macro":{"enable":false,"playWhen":"0"},
 "menu":"melee", "isEnabled":true, "isCustomized":true, "fromAmmo":false, "version":5,
 "soundOnly":{"sound":{"enable":false}},
 "primary":{ "video":{"dbSection":"melee","menuType":"weapon","animation":"sword","variant":"01","color":"red","enableCustom":false,"customPath":""},
   "sound":{"enable":false}, "options":{"delay":0,"elevation":1000,"opacity":1,"playbackRate":1,"repeat":1,"size":1,"zIndex":1} },
 "secondary":{"enable":false}, "source":{"enable":false}, "target":{"enable":false} } }
```
**远程(火法弹)**：把 `menu` 改 `"range"`、`primary.video` 改 `{"dbSection":"range","menuType":"spell","animation":"firebolt","variant":"01","color":"orange"}`。
**范围(火爆)**：`menu:"templatefx"`、`primary.video {"dbSection":"templatefx","menuType":"circle","animation":"fireball","variant":"01","color":"orange"}`、`primary.options` 加 `"scale":"1","persistent":false`。
**上状态(致眩，落目标)**：`menu:"ontoken"`、`primary.video {"dbSection":"static","menuType":"conditions","animation":"stun","variant":"01","color":"yellow"}`、`primary.options` 加 `"playOn":"target"`。
**传送(闪现)**：见 §35.2 preset，start/end 用 `static/spell/mistystep`（variant 01/02），`data.options.range` 填技能射程。

---

## 36. 术语对照表（国内官方译名 / 卡面用词权威源）— 已坐实

> 来源：用户本地化包 F12 探针（`game.i18n.localize(CONFIG.DND5E.*)`）逐字导出。环境 `lang:cn` / dnd5e `5.3.3`。
> **硬规则**：卡面 `description.value`、`item.name` 内一切玩家可见术语（伤害 / 状态 / 属性 / 技能 / 学派 / 生物类型 / 物品属性）**必须逐字照本表**。本表显示英文或未解析 i18n 键（如 `SGEH.property.wep.*`）的词 = 包内无中文，**不得自行翻译，须走规范 §9 问 DM**。
> 代码键（`damage.*.types`、`traits.*.value` 等）仍填英文 key（见 §2–§9）；本表只管**给玩家看的文字**。

### 36.1 伤害类型 damageTypes

| key | 卡面中文 |  | key | 卡面中文 |
|---|---|---|---|---|
| acid | 强酸 |  | necrotic | **暗蚀** ⚠（非"死灵"） |
| bludgeoning | 钝击 |  | piercing | 穿刺 |
| cold | 寒冷 |  | poison | 毒素 |
| fire | 火焰 |  | psychic | **心灵** ⚠（非"精神"） |
| force | 力场 |  | radiant | 光耀 |
| lightning | 闪电 |  | slashing | 挥砍 |
| thunder | 雷鸣 |  | vitality | 活力 |
| none | 无类型 |  | midi-none | 无伤 |

### 36.2 治疗类型 healingTypes

| key | 卡面中文 |  | key | 卡面中文 |
|---|---|---|---|---|
| healing | 生命值 |  | maximum | 最大生命值 |
| temphp | 临时生命值 |  | vitality | 活力 |

### 36.3 状态 / 状态免疫 conditionTypes（statuses & traits.ci）

| key | 卡面中文 |  | key | 卡面中文 |
|---|---|---|---|---|
| bleeding | 失血 |  | incapacitated | 失能 |
| blinded | 目盲 |  | invisible | 隐形 |
| burning | 燃烧 |  | malnutrition | 饥饿 |
| charmed | 魅惑 |  | paralyzed | 麻痹 |
| cursed | 被诅咒 |  | petrified | 石化 |
| dazed | 眩晕 ⚠拟（包内无中文，sgeh/MCDM 来源） |  | poisoned | 中毒 |
| deafened | 耳聋 |  | prone | 倒地 |
| dehydration | 脱水 |  | restrained | 束缚 |
| diseased | 疾病 |  | silenced | 沉默 |
| exhaustion | 力竭 |  | stunned | 震慑 |
| falling | 坠落 |  | suffocation | 窒息 |
| flanked | 被夹击 ⚠拟（`flanking`=夹击 包已译） |  | surprised | 惊讶 |
| frightened | 恐慌 |  | transformed | 变形 |
| grappled | 受擒 |  | unconscious | 昏迷 |

### 36.4 属性 abilities

| key | 卡面中文 |  | key | 卡面中文 |
|---|---|---|---|---|
| str | 力量 |  | int | 智力 |
| dex | 敏捷 |  | wis | 感知 |
| con | 体质 |  | cha | 魅力 |

### 36.5 技能 skills（本表为准，已覆盖 §5 三处）

| key | 卡面中文 |  | key | 卡面中文 |
|---|---|---|---|---|
| acr | **特技**（原§5"杂技"） |  | med | **医药**（原§5"医疗"） |
| ani | 驯兽 |  | nat | 自然 |
| arc | 奥秘 |  | prc | 察觉 |
| ath | 运动 |  | prf | 表演 |
| dec | 欺瞒 |  | per | 游说 |
| his | 历史 |  | rel | 宗教 |
| ins | 洞悉 |  | slt | 巧手 |
| inv | 调查 |  | ste | 隐匿 |
| itm | 威吓 |  | sur | **求生**（原§5"生存"） |

### 36.6 生物类型 creatureTypes

| key | 卡面中文 |  | key | 卡面中文 |
|---|---|---|---|---|
| aberration | 异怪 |  | giant | 巨人 |
| beast | 野兽 |  | humanoid | 类人 |
| celestial | 天族 |  | monstrosity | 怪兽 |
| construct | 构装 |  | ooze | 泥怪 |
| dragon | 龙类 |  | plant | 植物 |
| elemental | 元素 |  | undead | 亡灵 |
| fey | 妖精 |  | fiend | 邪魔 |

### 36.7 法术学派 spellSchools

| key | 卡面中文 |  | key | 卡面中文 |
|---|---|---|---|---|
| abj | 防护系 |  | enc | 惑控系 |
| con | 咒法系 |  | evo | 塑能系 |
| div | 预言系 |  | ill | 幻术系 |
| nec | **死灵系** |  | trs | 变化系 |

⚠ `nec`=死灵系（学派）≠ `necrotic`=暗蚀（伤害）。"死灵"二字仅用于学派、绝不用于伤害类型。

### 36.8 物品属性 itemProperties（卡面 / 属性标签）

**系统原生（包已译）：**

| key | 卡面中文 |  | key | 卡面中文 |
|---|---|---|---|---|
| trait | 被动特质 |  | thr | 投掷 |
| material | 材料 |  | weightlessContents | 无重量内容 |
| rch | 触及 |  | vocal | 言语 |
| rel | 弹容 |  | ritual | 仪式 |
| amm | 弹药 |  | stealthDisadvantage | 隐匿劣势 |
| sil | 镀银 |  | hvy | 重型 |
| ver | 多用 |  | concentration | 专注 |
| foc | 法器 |  | gear | 装备 |
| ret | 回力 |  | lod | 装填 |
| sidekick | 伙伴 |  | somatic | 姿势 |
| ada | 精金 |  | fin | 灵巧 |
| mgc | 魔法 |  | fir | 枪械 |
| lgt | 轻型 |  | two | 双手 |
| spc | 特殊 |  |  |  |

**sgeh-monkeydm 枪械 / 材料属性（包未译，DM 拟定）：**

| key | 英文 | 卡面中文 |  | key | 英文 | 卡面中文 |
|---|---|---|---|---|---|---|
| art | Artillery | 火炮 |  | fnf | Fan Fire | 速射 |
| attached | Attached | 附装 |  | loud | Loud | 喧响 |
| brl | Barrel | 枪管 |  | mng | Moongold | 月金 ⚠拟（材料·同 ada/sil 一类） |
| blr | Blaring | 轰鸣 |  | socketable | Socketable | 可镶嵌 |
| boo | Booming | 隆响 |  | spr | Spread Fire | 散射 |
| cnc | Concussive | 震荡 |  | sdy | Steady | 稳固 |
| contaminated | Contaminated | 污染 |  | twb | Twinned Barrel | 双管 |
| delm | Delerium | 谵狂 ⚠拟（材料·同 ada/sil 一类） |  |  |  |  |

> **不收（用不到 / 未解析键）**：`rlf`、`rls`——探针仅回原始键 `SGEH.property.wep.rlf` / `SGEH.property.wep.rls`，本地化包连英文都未解析；DM 判定用不到，故不收。日后若需用到，在游戏内查实际效果后再补。

---

### §0 索引补充

| 字段 | 取值来自 |
|---|---|
| **卡面任意中文术语（description / name 给玩家看的文字）** | **§36 术语对照表** |

---

## 37. 法术 / 物品 UUID 库（世界包 · F12 全库导出 · v9.1 → 规范 v2.1）

> 来源：DM 用 F12 控制台一次性导出（`game.packs` 遍历 Item 合集），坐实 **50 个包、2905 条** name→UUID，无重复。**用途**：怪物施法者交付时，官方法术**不写进卡**，改在「挂接宏」的 `SPELLS` 数组里填 `["显示名", "完整UUID"]`，从世界包按 UUID `fromUuid` 自动挂接（见规范 §M8「世界包法术挂接工作流」）。**选包优先级**：带自动化的包（`dnd5e_classpack` / `chris-premades` / `gambits-premades` / `dlkhm-spell-tools` / `midi-item-showcase-community`）> 官方 `dnd5e.spells(24)` > 主题/第三方包。**每个代码块可整段或逐行复制进挂接宏。**

> ⚠ AI 无法直连实时世界自取 UUID；本库即"探针结果"。库中没有的法术，按规范 §9 让 DM 在世界里拖一次该法术、导出其 `_stats.compendiumSource` 追加进来。

> **DM 重新导出本库的 F12 片段**（按 F12→Console 粘贴执行，结果自动复制到剪贴板）：

```javascript
(async () => { const rows=[]; for (const pack of game.packs){ if(pack.metadata.type!=="Item")continue;
  const idx=await pack.getIndex({fields:["type"]}); for(const e of idx){ if(e.type!=="spell")continue;
    rows.push(`["${e.name}", "${e.uuid ?? `Compendium.${pack.collection}.Item.${e._id}`}"],`);} }
  const out=rows.join("\n"); console.log(out);
  try{await game.clipboard.copyPlainText(out);ui.notifications.info(`已复制 ${rows.length} 条`);}catch{ui.notifications.warn("见控制台");} })();
```
> （想连武器/特性/魔法物品一起导，删掉 `if(e.type!=="spell")continue;` 那行。）

### §37 · `dnd5e_classpack.new-icon`（545 条） — DM 常用·带自动化（魔剑士已验证此包）
```text
["七彩喷射 Color Spray", "Compendium.dnd5e_classpack.new-icon.Item.f9cAcIAOPQ46mkf6"],
["万箭齐发Conjure Volley", "Compendium.dnd5e_classpack.new-icon.Item.W60tLJr3EH8fDrw6"],
["不动物件Immovable Object", "Compendium.dnd5e_classpack.new-icon.Item.nu6VBNJDc6rwqxo4"],
["不灭明焰 Continual Flame", "Compendium.dnd5e_classpack.new-icon.Item.t8Kc66UhZbrerC9x"],
["不谐低语 Dissonant Whispers", "Compendium.dnd5e_classpack.new-icon.Item.j8wwbcc1tlY9hLRf"],
["云雾术 Fog Cloud", "Compendium.dnd5e_classpack.new-icon.Item.rKLSWNBCS8eqGUll"],
["亚比达奇凋死术Abi-Dalzim’s Horrid Wilting", "Compendium.dnd5e_classpack.new-icon.Item.8RSUSwl2GKuYOYtb"],
["亡灵召唤术 Summon Undead (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.DWDgKtljaEhfs9XQ"],
["亡者丧钟Toll the Dead", "Compendium.dnd5e_classpack.new-icon.Item.iTvzofXQ9Ebrq73c"],
["交友术 friends", "Compendium.dnd5e_classpack.new-icon.Item.JqyWE42E4J9IR1au"],
["人类定身术 Hold Person", "Compendium.dnd5e_classpack.new-icon.Item.syHHJlRPS4rVwCQA"],
["以太化 Etherealness", "Compendium.dnd5e_classpack.new-icon.Item.2dKpsNn8QZWECFtd"],
["任意门 Dimension Door", "Compendium.dnd5e_classpack.new-icon.Item.u86hMx0ODfccAtu8"],
["众星冠冕Crown of Stars", "Compendium.dnd5e_classpack.new-icon.Item.aOokBg3CGbTMixlm"],
["传讯术 Message", "Compendium.dnd5e_classpack.new-icon.Item.48ZtVviGH7XDaN5t"],
["传送术 Teleport", "Compendium.dnd5e_classpack.new-icon.Item.7wAk7D98B8gAgKzX"],
["传送法阵 Teleportation Circle", "Compendium.dnd5e_classpack.new-icon.Item.mcQ5lehafMClomzc"],
["伪装术 Seeming", "Compendium.dnd5e_classpack.new-icon.Item.pur5TFHAEgLmx0pz"],
["低阶恶魔召唤术 Summon Lesser Demon", "Compendium.dnd5e_classpack.new-icon.Item.lI7RcmepcbATWP5h"],
["侦测善恶 Detect Evil and Good", "Compendium.dnd5e_classpack.new-icon.Item.zeN5fxXLn4QE2YDa"],
["侦测思想 Detect Thoughts", "Compendium.dnd5e_classpack.new-icon.Item.YuGbz9k5JXA0kIgT"],
["侦测扭曲 Warp Sense", "Compendium.dnd5e_classpack.new-icon.Item.L1Pkt2d9NVFLDGII"],
["侦测毒性和疾病 Detect Poison and Disease", "Compendium.dnd5e_classpack.new-icon.Item.V3BKvj7g0q2XO0cg"],
["侦测魔法 Detect Magic", "Compendium.dnd5e_classpack.new-icon.Item.cGO3m3Xu4mtPegr4"],
["信仰守卫 Guardian of Faith", "Compendium.dnd5e_classpack.new-icon.Item.LPXdi1HhVx8kJWYy"],
["修复术 Mending", "Compendium.dnd5e_classpack.new-icon.Item.2LREP2D10afC4Y3V"],
["借鉴才学 Borrowed Knowledge", "Compendium.dnd5e_classpack.new-icon.Item.y5atnVjJQUco1hec"],
["假寐术Catnap", "Compendium.dnd5e_classpack.new-icon.Item.8DBuQOj9usmCqJzx"],
["假死术Feign Death", "Compendium.dnd5e_classpack.new-icon.Item.ahDUyok3DMRcYLnS"],
["假象术 Mislead", "Compendium.dnd5e_classpack.new-icon.Item.nTjAezWWIOZnxoB1"],
["催眠图纹 Hypnotic Pattern", "Compendium.dnd5e_classpack.new-icon.Item.BbpCbjCXt14a08Jp"],
["元素召唤术 Summon Elemental (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.9Yhs9yVaMLPnDlSC"],
["元素咒唤术 Conjure Elemental", "Compendium.dnd5e_classpack.new-icon.Item.D57cmKWEk3wx8iJf"],
["元素武器 Elemental Weapon", "Compendium.dnd5e_classpack.new-icon.Item.srjt2KPpCAtQGe7W"],
["元素灾厄Elemental Bane", "Compendium.dnd5e_classpack.new-icon.Item.A4LdLWXVvJ69X3zo"],
["光亮术 Light", "Compendium.dnd5e_classpack.new-icon.Item.rW5ZoeX4jjZw4hBO"],
["光墙Wall of Light", "Compendium.dnd5e_classpack.new-icon.Item.Tyseg90I6fQ8luXQ"],
["光导箭 Guiding Bolt", "Compendium.dnd5e_classpack.new-icon.Item.PHYXwNkXSdJjDCSD"],
["光耀祷词Word of Radiance", "Compendium.dnd5e_classpack.new-icon.Item.EoHUtMRA7ftylPNt"],
["克敌机先 True Strike", "Compendium.dnd5e_classpack.new-icon.Item.u4hnRPRScguoZKwp"],
["克隆术 Clone", "Compendium.dnd5e_classpack.new-icon.Item.IJyNCt6nPuM5jZBL"],
["典礼术Ceremony", "Compendium.dnd5e_classpack.new-icon.Item.g33DFEgRSIJNryCM"],
["兽之联结Beast Bond", "Compendium.dnd5e_classpack.new-icon.Item.I6yVljCLoGOdIjon"],
["再生术 Regenerate", "Compendium.dnd5e_classpack.new-icon.Item.hMMOVrqGDfRHSyN6"],
["写入空中Skywrite", "Compendium.dnd5e_classpack.new-icon.Item.6J9h2XnrPtbe9yHf"],
["冰刃 Ice Knife", "Compendium.dnd5e_classpack.new-icon.Item.7axIawhUyP8PVJPV"],
["冰墙术 Wall of Ice", "Compendium.dnd5e_classpack.new-icon.Item.kZ9PSqGyiR7bGViM"],
["冰风暴 Ice Storm", "Compendium.dnd5e_classpack.new-icon.Item.u2MG84qW8YLuECHa"],
["冷冻一指 Frost Finger", "Compendium.dnd5e_classpack.new-icon.Item.GnufPimtOtp06irY"],
["冷冻射线 Ray of Frost", "Compendium.dnd5e_classpack.new-icon.Item.tJzKo2vpEhXZfuJO"],
["冻寒之触 Chill Touch", "Compendium.dnd5e_classpack.new-icon.Item.JyNtTLwpaHOZqdZx"],
["净化灵光Aura of Purity", "Compendium.dnd5e_classpack.new-icon.Item.ujZGFLEqgI0L6oli"],
["净化食粮 Purify Food and Drink", "Compendium.dnd5e_classpack.new-icon.Item.UJ58LsXL4X8MTKJO"],
["创造人工生命体 Create Homunculus", "Compendium.dnd5e_classpack.new-icon.Item.RutIDh5qquiQOCxm"],
["创造半位面 Demiplane", "Compendium.dnd5e_classpack.new-icon.Item.UDxwT6janDc0eIYf"],
["创造法驱魔舵 Create Spelljamming Helm", "Compendium.dnd5e_classpack.new-icon.Item.AgGpzJGL5lTM1fNm"],
["创造篝火Create Bonfire", "Compendium.dnd5e_classpack.new-icon.Item.qkm8sXy5s1uIujJO"],
["创造魔卫 Create Magen", "Compendium.dnd5e_classpack.new-icon.Item.sH88a7FuSdBOuytz"],
["削弱芒刺Sapping Sting", "Compendium.dnd5e_classpack.new-icon.Item.OVgmvEJHFmGeeu7g"],
["剑刃护壁 Blade Barrier", "Compendium.dnd5e_classpack.new-icon.Item.7DjvSI1LXydh3BoH"],
["剑刃爆发 Sword Burst", "Compendium.dnd5e_classpack.new-icon.Item.uQET3NFYcJLBMcRe"],
["剑刃爆发 Sword Burst (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.FbWd9LrvqTSOdKwk"],
["剑刃防护 blade ward", "Compendium.dnd5e_classpack.new-icon.Item.PBY5rHfDrS6IOwdJ"],
["力场墙 Wall of Force", "Compendium.dnd5e_classpack.new-icon.Item.31jKHMGJ0vlqdvQU"],
["力场监牢 Forcecage", "Compendium.dnd5e_classpack.new-icon.Item.juLb5PHooXitZDWI"],
["加德尔急速邮差 Galder's Speedy Courier", "Compendium.dnd5e_classpack.new-icon.Item.4nhQ6KAK3ixbyEAI"],
["加德尔高塔术 Galder's Tower", "Compendium.dnd5e_classpack.new-icon.Item.Ex95MDR7FRqwfdMo"],
["加速术 Haste", "Compendium.dnd5e_classpack.new-icon.Item.YLYeCtTmbjIZsPvN"],
["动力短行 Kinetic Jaunt", "Compendium.dnd5e_classpack.new-icon.Item.LwjPYCh1MSAQnuOX"],
["动植物定位术 Locate Animals or Plants", "Compendium.dnd5e_classpack.new-icon.Item.qvyWYoN41u5nDj73"],
["动物交谈 Speak with Animals", "Compendium.dnd5e_classpack.new-icon.Item.3JUEqJSbgArlUBR5"],
["动物信使 Animal Messenger", "Compendium.dnd5e_classpack.new-icon.Item.9IngOEqWWDsYnzCJ"],
["动物咒唤术 Conjure Animals", "Compendium.dnd5e_classpack.new-icon.Item.JTNL68CjsZelE8b5"],
["动物形态 Animal Shapes", "Compendium.dnd5e_classpack.new-icon.Item.mac7quHJaKMYwCeM"],
["励志演讲 Motivational Speech", "Compendium.dnd5e_classpack.new-icon.Item.cEN6j0DDC7bnHHes"],
["劳洛希姆心灵长枪 Raulothim's Psychic Lance", "Compendium.dnd5e_classpack.new-icon.Item.Sk0oD2iaijbF0BXg"],
["匕首之云Cloud of Daggers", "Compendium.dnd5e_classpack.new-icon.Item.JzEhXKKRDAmT8axT"],
["匕首之云挥砍Cloud of Daggers", "Compendium.dnd5e_classpack.new-icon.Item.Nh6SUMSn1Xv7R5ep"],
["化兽为友 Animal Friendship", "Compendium.dnd5e_classpack.new-icon.Item.t09Fa4kTkkIgMoDu"],
["医疗术 Heal", "Compendium.dnd5e_classpack.new-icon.Item.nCLJRsp7CWAACqGE"],
["十字军披风 Crusader's Mantle", "Compendium.dnd5e_classpack.new-icon.Item.RPhG8GsHq9wkUygO"],
["卓姆吉瞬间召唤 Instant Summons", "Compendium.dnd5e_classpack.new-icon.Item.QoPqj3mhjxq3gPle"],
["卜筮术 Augury", "Compendium.dnd5e_classpack.new-icon.Item.umqpL5B9ccbkpJtJ"],
["卡牌喷射 Spray of Cards", "Compendium.dnd5e_classpack.new-icon.Item.QeeoKnO9JbeAkvQz"],
["印记斩 Branding Smite", "Compendium.dnd5e_classpack.new-icon.Item.JTEqFylsjhdBhz3c"],
["原初守护Primordial Ward", "Compendium.dnd5e_classpack.new-icon.Item.lNG6N14ifJqpURUX"],
["原初蛮击Primal Savagery", "Compendium.dnd5e_classpack.new-icon.Item.KpQRgQHde4tJ3OBE"],
["原力法阵 Circle of Power", "Compendium.dnd5e_classpack.new-icon.Item.Y7NbrJlvdfWKm57j"],
["反制善恶 Dispel Evil and Good", "Compendium.dnd5e_classpack.new-icon.Item.vWPApZRxvrKSiKKS"],
["反转重力 Reverse Gravity", "Compendium.dnd5e_classpack.new-icon.Item.wtbjaiqtpWK6kXl3"],
["反魔法场 Antimagic Field", "Compendium.dnd5e_classpack.new-icon.Item.YYb9R08YduTPpE2s"],
["变巨/缩小术 Enlarge/Reduce", "Compendium.dnd5e_classpack.new-icon.Item.1bUnNgI45qffE1P9"],
["变形术 Polymorph", "Compendium.dnd5e_classpack.new-icon.Item.IXs3Neqbl8xaT3yk"],
["变身术 Alter Self", "Compendium.dnd5e_classpack.new-icon.Item.eTtyu3Vpu1sZupC8"],
["召唤箭雨 Conjure Barrage", "Compendium.dnd5e_classpack.new-icon.Item.Ijq7k3y3AZoC76VF"],
["召雷术 Call Lightning", "Compendium.dnd5e_classpack.new-icon.Item.KPqCiGUT62tcmfgY"],
["史尼洛雪球群 Snilloc’s Snowball Swarm", "Compendium.dnd5e_classpack.new-icon.Item.48jBmNhO1hPernMz"],
["吉姆的发光硬币 Jim's  Glowing Coin", "Compendium.dnd5e_classpack.new-icon.Item.WMJPh4zw93TqduCm"],
["吉姆的魔法飞弹 Jim's  Magic Missile", "Compendium.dnd5e_classpack.new-icon.Item.tEy4rtxkojrzSLm7"],
["吉姆的魔法飞弹x1 Jim's  Magic Missile", "Compendium.dnd5e_classpack.new-icon.Item.5QR8X3O7jm5pd5X6"],
["启蒙术 Awaken", "Compendium.dnd5e_classpack.new-icon.Item.WqaekYnArzALJBmb"],
["吸收元素 Absorb Elements", "Compendium.dnd5e_classpack.new-icon.Item.UQuDHLKUVMyZIiTn"],
["吸血鬼之触 Vampiric Touch", "Compendium.dnd5e_classpack.new-icon.Item.FKjra48NDHtB4518"],
["命令术 Command", "Compendium.dnd5e_classpack.new-icon.Item.Ja6HpsLeGA9MQ0Rm"],
["命运宠儿Fortune’s Favor", "Compendium.dnd5e_classpack.new-icon.Item.QD0hMadacCVoJGkn"],
["哈达之欲 hunger of hadar", "Compendium.dnd5e_classpack.new-icon.Item.eT0LfvbxuKfMuRbs"],
["哈达之臂 arms of hadar", "Compendium.dnd5e_classpack.new-icon.Item.Eodwq0Zfd8ecEhdy"],
["唤起死灵 Create Undead", "Compendium.dnd5e_classpack.new-icon.Item.ORa3OSWbxr1phj4b"],
["回生术 Revivify", "Compendium.dnd5e_classpack.new-icon.Item.TkFsGmyAeHknESJ4"],
["回返真言 Word of Recall", "Compendium.dnd5e_classpack.new-icon.Item.saFwXc26RtQaVLWN"],
["回避侦测 Nondetection", "Compendium.dnd5e_classpack.new-icon.Item.VT60UFGIZOZhPgMi"],
["困惑术 Confusion", "Compendium.dnd5e_classpack.new-icon.Item.MZ1jwLEJukFjSv1a"],
["圈套术 Snare", "Compendium.dnd5e_classpack.new-icon.Item.AxOyPyPMswoy1UPZ"],
["土石喷发Erupting Earth", "Compendium.dnd5e_classpack.new-icon.Item.kzw0MEmXvkS4Qpi9"],
["圣居 Hallow", "Compendium.dnd5e_classpack.new-icon.Item.ZQnZLHUxTFdRi2ig"],
["圣洁灵光 Holy Aura", "Compendium.dnd5e_classpack.new-icon.Item.AChYumxQELnPxDwn"],
["圣火术 Sacred Flame", "Compendium.dnd5e_classpack.new-icon.Item.yu8LatUOZ08ORwSU"],
["圣言术 Divine Word", "Compendium.dnd5e_classpack.new-icon.Item.Hr0MfbPsxRZmU3XL"],
["地之骨Bones of the Earth", "Compendium.dnd5e_classpack.new-icon.Item.HgJJ83vmHOxKjExM"],
["地动术 Move Earth", "Compendium.dnd5e_classpack.new-icon.Item.dFZbU4lhcBhzb9p4"],
["地狱呼唤Infernal Calling", "Compendium.dnd5e_classpack.new-icon.Item.hu5sjWnByZjYiOQu"],
["地缚 Earthbind", "Compendium.dnd5e_classpack.new-icon.Item.nnyW5zUWFZU2P57L"],
["地震术 Earthquake", "Compendium.dnd5e_classpack.new-icon.Item.Yu7PAWvfqY70wBm2"],
["地颤 Earth Tremor", "Compendium.dnd5e_classpack.new-icon.Item.dADmhYuYM063hyy2"],
["坚固堡垒Mighty Fortress", "Compendium.dnd5e_classpack.new-icon.Item.zv4uMIQkGfANHAon"],
["塑土术 Mold Earth", "Compendium.dnd5e_classpack.new-icon.Item.dkqz1yASQkxNRWSS"],
["塑石术 Stone Shape", "Compendium.dnd5e_classpack.new-icon.Item.SKzCvyGhDCBEYZqg"],
["塔莎心灵鞭 Tasha’s Mind Whip  (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.S2Julj2sEMwh4rdc"],
["塔莎狂笑术 Hideous Laughter", "Compendium.dnd5e_classpack.new-icon.Item.n9RjfSJ88RfFhO1T"],
["塔莎超凡形态 Tasha’s Otherworldly Guise (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.LkEHyXctkvbdkbEV"],
["塔莎酸蚀酿 Tasha’s Caustic Brew (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.aRiWcyTXoQK7Z3ow"],
["复仇风暴 Storm of Vengeance", "Compendium.dnd5e_classpack.new-icon.Item.UYTedS2zsaG0Yoe3"],
["复生术 Resurrection", "Compendium.dnd5e_classpack.new-icon.Item.PLsEzUel26T6JUTO"],
["大步奔行 Longstrider", "Compendium.dnd5e_classpack.new-icon.Item.7z0VrhVv7IBe3mVJ"],
["大漩涡Maelstrom", "Compendium.dnd5e_classpack.new-icon.Item.dFyGbUifjYtM6Dj3"],
["天界召唤术 Summon Celestial (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.vYaGuPlgPM3SsUC2"],
["天界咒唤术 Conjure Celestial", "Compendium.dnd5e_classpack.new-icon.Item.aJR797NIkIG7k9uN"],
["奇术 Thaumaturgy", "Compendium.dnd5e_classpack.new-icon.Item.9utDFSqFjS9QRpNw"],
["奥图迷舞 Irresistible Dance", "Compendium.dnd5e_classpack.new-icon.Item.dfWSzxeojttvQ2J9"],
["妖火 Faerie Fire", "Compendium.dnd5e_classpack.new-icon.Item.sLkNbDcU39qcVt14"],
["嫌恶术/关怀术 Antipathy/Sympathy", "Compendium.dnd5e_classpack.new-icon.Item.NXHO4t01vJcJ8Ct8"],
["守卫刻文 Glyph of Warding", "Compendium.dnd5e_classpack.new-icon.Item.lybHyiBdyJywkQav"],
["守护之链 Warding Bond", "Compendium.dnd5e_classpack.new-icon.Item.DLyjjM6qTHBCSFCx"],
["守护之风Warding Wind", "Compendium.dnd5e_classpack.new-icon.Item.6xCAxPKlxSzzRc7P"],
["安定心神 Calm Emotions", "Compendium.dnd5e_classpack.new-icon.Item.6MYwBtZurc8Zw1ac"],
["完全变形术 True Polymorph", "Compendium.dnd5e_classpack.new-icon.Item.UWQoJUNmS2svVG6i"],
["完全复生术 True Resurrection", "Compendium.dnd5e_classpack.new-icon.Item.Nd9TfWfwNL9Wk5Yg"],
["寒冰赋权Investiture of Ice", "Compendium.dnd5e_classpack.new-icon.Item.lnwjh9uocouD1DBT"],
["寒冰锥 Cone of Cold", "Compendium.dnd5e_classpack.new-icon.Item.z9HXB89B3uO5NHW8"],
["寻找陷阱 Find Traps", "Compendium.dnd5e_classpack.new-icon.Item.xjQ8Y0IeRFDByIcZ"],
["寻获坐骑 Find Steed", "Compendium.dnd5e_classpack.new-icon.Item.KC9x6NnFfT6MYBnl"],
["寻获高等坐骑 Find Greater Steed", "Compendium.dnd5e_classpack.new-icon.Item.kH5v6a4XIYnELReD"],
["寻获魔宠 Find Familiar", "Compendium.dnd5e_classpack.new-icon.Item.daB7oGSKy1BglKlt"],
["寻路术 Find the Path", "Compendium.dnd5e_classpack.new-icon.Item.psqF5vrCUEKlJvwj"],
["崩坏现实Reality Break", "Compendium.dnd5e_classpack.new-icon.Item.gqGklSk6EiHsGrlr"],
["巧舌如簧 Gift of  Gab", "Compendium.dnd5e_classpack.new-icon.Item.CpvtM9z1XpTyxqj1"],
["巧言术 Tongues", "Compendium.dnd5e_classpack.new-icon.Item.uXksyb9oAbbHFCt9"],
["巨虫术 Giant Insect", "Compendium.dnd5e_classpack.new-icon.Item.yBd3ZN5cVZjfIR3b"],
["巫术箭 Witch Bolt", "Compendium.dnd5e_classpack.new-icon.Item.lSG6t1YSAUcqSLSa"],
["巫术箭激发 Witch Bolt", "Compendium.dnd5e_classpack.new-icon.Item.qG7nr15fd5iHn6oo"],
["希望信标 Beacon of Hope", "Compendium.dnd5e_classpack.new-icon.Item.dU8oQCE5dA1qZ6TD"],
["幻影巨龙 Illusory Dragon", "Compendium.dnd5e_classpack.new-icon.Item.qyECERKTnsRPNg7k"],
["幻景 Hallucinatory Terrain", "Compendium.dnd5e_classpack.new-icon.Item.hlEn0eBkhu3ODU2C"],
["幽影刃Shadow Blade", "Compendium.dnd5e_classpack.new-icon.Item.0zIXXYuN6VB0eKvy"],
["庇护术 Sanctuary", "Compendium.dnd5e_classpack.new-icon.Item.FbxdKcDpSPWuGTLA"],
["延迟爆裂火球 Delayed Blast Fireball", "Compendium.dnd5e_classpack.new-icon.Item.aqoBFpSlbzoIfl1M"],
["异怪召唤术 Summon Aberration (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.kkahnA5EClqV0LWA"],
["异界之门 Gate", "Compendium.dnd5e_classpack.new-icon.Item.bJdmgHYyhUJv8Zyc"],
["异界传送 Plane Shift", "Compendium.dnd5e_classpack.new-icon.Item.VveuAHLNPiAY0yd5"],
["异界探知 Contact Other Plane", "Compendium.dnd5e_classpack.new-icon.Item.QMldyRXZFRZJpA5b"],
["异界誓盟 Planar Ally", "Compendium.dnd5e_classpack.new-icon.Item.XbVBvp0A6Nf7imnf"],
["异界誓缚 Planar Binding", "Compendium.dnd5e_classpack.new-icon.Item.PmucSbzqmGhwisuE"],
["引力裂沟Gravity Sinkhole", "Compendium.dnd5e_classpack.new-icon.Item.c4Rwx5li2TEEQPzf"],
["弱智术 Feeblemind", "Compendium.dnd5e_classpack.new-icon.Item.44SIr16eJazVrdvi"],
["弹射术 Catapult", "Compendium.dnd5e_classpack.new-icon.Item.oxzyS5dpZEoVAOtT"],
["强令对决 Compelled Duel", "Compendium.dnd5e_classpack.new-icon.Item.C2KWIIG69H9UWb9e"],
["强化属性 Enhance Ability", "Compendium.dnd5e_classpack.new-icon.Item.SCmGEYM6V880rfaW"],
["强迫术 Compulsion", "Compendium.dnd5e_classpack.new-icon.Item.RpBbOYseLZCFXaFY"],
["形体变化 Shapechange", "Compendium.dnd5e_classpack.new-icon.Item.hbs71LqoXQqYF3N0"],
["律令医疗 Power Word Heal", "Compendium.dnd5e_classpack.new-icon.Item.FfrtzwJUyOdNzB5q"],
["律令死亡 Power Word Kill", "Compendium.dnd5e_classpack.new-icon.Item.gfuoSEAF57VLXJMJ"],
["律令痛苦Power Word Pain", "Compendium.dnd5e_classpack.new-icon.Item.kwJe1GfFuF1u61Uh"],
["律令震慑 Power Word Stun", "Compendium.dnd5e_classpack.new-icon.Item.JZSNvGikwyPAR0UY"],
["御风而行 Wind Walk", "Compendium.dnd5e_classpack.new-icon.Item.EZFj98JyxB5CFkZX"],
["德鲁伊伎俩 Druidcraft", "Compendium.dnd5e_classpack.new-icon.Item.Q6muyDarRcXMcuKv"],
["德鲁伊林地Druid Grove", "Compendium.dnd5e_classpack.new-icon.Item.uGPq5j00ZkoApJkQ"],
["徽记术  Symbol", "Compendium.dnd5e_classpack.new-icon.Item.eyGGLBnzrsZ5wCRB"],
["心灵之楔 Mind Sliver（TCE）", "Compendium.dnd5e_classpack.new-icon.Item.Il0iA9nttKqh0ACr"],
["心灵尖刺Mind Spike", "Compendium.dnd5e_classpack.new-icon.Item.s8UCeuM4ylInooTb"],
["心灵尖啸 Psychic Scream", "Compendium.dnd5e_classpack.new-icon.Item.5LX6eNc28we77dsA"],
["心灵屏障 Mind Blank", "Compendium.dnd5e_classpack.new-icon.Item.0gxr5GRxQHpBf6E6"],
["心灵感应	Telepathy", "Compendium.dnd5e_classpack.new-icon.Item.rwlJgCqupZtuska4"],
["心灵遥控 Telekinesis", "Compendium.dnd5e_classpack.new-icon.Item.MTNfEcCXSJZ2m2nG"],
["快速交友 Fast  Friends", "Compendium.dnd5e_classpack.new-icon.Item.wsJiWBorqcjxBFq2"],
["思想编码 Encode Thoughts", "Compendium.dnd5e_classpack.new-icon.Item.Lk16ZQMErMb3Gb1O"],
["怪影杀手 Weird", "Compendium.dnd5e_classpack.new-icon.Item.1NvIUMYnJ8tFknEr"],
["怪物定身术 Hold Monster", "Compendium.dnd5e_classpack.new-icon.Item.abm5MgV3kejSatZt"],
["恐惧术 Fear", "Compendium.dnd5e_classpack.new-icon.Item.wnJNHkm5kThiJixx"],
["恶言相加 Vicious Mockery", "Compendium.dnd5e_classpack.new-icon.Item.ZP65lHUVsQAd2NCc"],
["惊惧斩Staggering Smite", "Compendium.dnd5e_classpack.new-icon.Item.0GPWp8Rwlm5AizJD"],
["战斗荒野形态治疗 (月德)", "Compendium.dnd5e_classpack.new-icon.Item.CtR6F5RTXFEEp3dI"],
["托梦术 Dream", "Compendium.dnd5e_classpack.new-icon.Item.40z4HpFVUux7h03S"],
["扩大重力Magnify Gravity", "Compendium.dnd5e_classpack.new-icon.Item.wMEtvmN9ZcwU6o82"],
["扭曲价值 Distort  Value", "Compendium.dnd5e_classpack.new-icon.Item.lKh5urDChUKhj0iW"],
["投影术 Project Image", "Compendium.dnd5e_classpack.new-icon.Item.QQgNYijldqhDb6JP"],
["护盾术 Shield", "Compendium.dnd5e_classpack.new-icon.Item.6EjLIIN4ug7eSp4P"],
["拂晓Dawn", "Compendium.dnd5e_classpack.new-icon.Item.xhAj4FDxeycV7KiG"],
["拉瑞心灵联结 Telepathic Bond", "Compendium.dnd5e_classpack.new-icon.Item.mdnvLsKRorF3cx5S"],
["拟像术 Simulacrum", "Compendium.dnd5e_classpack.new-icon.Item.EMkV8ggV2LgT7aVd"],
["指使术 Geas", "Compendium.dnd5e_classpack.new-icon.Item.QdYv5sEuGwinew7D"],
["授予技能Skill Empowerment", "Compendium.dnd5e_classpack.new-icon.Item.XXPFaHCY8AJgUSp4"],
["探知 Scrying", "Compendium.dnd5e_classpack.new-icon.Item.OA4mCsVxg6nUrLjV"],
["控火术 Control Flames", "Compendium.dnd5e_classpack.new-icon.Item.HW5SwK2J1LzHdsx3"],
["提升抗性 Resistance", "Compendium.dnd5e_classpack.new-icon.Item.qKUaiFGevOUOF1BJ"],
["援助术 Aid", "Compendium.dnd5e_classpack.new-icon.Item.hAL0Dxp9w7gvkfZm"],
["摄心目光 Eyebite", "Compendium.dnd5e_classpack.new-icon.Item.Qs4Y2lVt4sTZlh6f"],
["摄心目光(患病) Eyebite", "Compendium.dnd5e_classpack.new-icon.Item.KEcpDFNPBEFjOSjf"],
["摄心目光(惊慌) Eyebite", "Compendium.dnd5e_classpack.new-icon.Item.FL1ww0jvWZ97B39T"],
["摄心目光(沉睡) Eyebite", "Compendium.dnd5e_classpack.new-icon.Item.kngwlKVYRizRdZfb"],
["操控天气 Control Weather", "Compendium.dnd5e_classpack.new-icon.Item.GSuEN1IlQzaTq8Ws"],
["操控水体 Control Water", "Compendium.dnd5e_classpack.new-icon.Item.9zy4xObdmQFW9VP7"],
["操控风力Control Wind", "Compendium.dnd5e_classpack.new-icon.Item.MXUrntrnxiM7FhS8"],
["操水术 Shape Water", "Compendium.dnd5e_classpack.new-icon.Item.zUyjMvhnrkkFHawx"],
["擒抱藤 Grasping  Vine", "Compendium.dnd5e_classpack.new-icon.Item.AAXts6UWV351MjQ4"],
["支配人类 Dominate Person", "Compendium.dnd5e_classpack.new-icon.Item.JudswpO6E5GBlyfQ"],
["支配怪物 Dominate Monster", "Compendium.dnd5e_classpack.new-icon.Item.f63uBXNvbalm1y7v"],
["支配野兽 Dominate Beast", "Compendium.dnd5e_classpack.new-icon.Item.xaSXewdCx3aWtczk"],
["放逐斩Banishing Smite", "Compendium.dnd5e_classpack.new-icon.Item.2CIeVJ6dzmDcGfic"],
["放逐术 Banishment", "Compendium.dnd5e_classpack.new-icon.Item.lopw7wVkPoE7gbNu"],
["敌意术 Antagonize", "Compendium.dnd5e_classpack.new-icon.Item.VPJpFGhhBofVfsku"],
["敌群环绕Enemies Abound", "Compendium.dnd5e_classpack.new-icon.Item.2Y7vWjRJHnvxqoqX"],
["散射术 Scatter", "Compendium.dnd5e_classpack.new-icon.Item.WwLfBBYVgk3YTrJn"],
["敲击术 Knock", "Compendium.dnd5e_classpack.new-icon.Item.VC9nFuUxF7yptXK5"],
["旋风术 Whirlwind", "Compendium.dnd5e_classpack.new-icon.Item.oVNlsoJvJriiUm1U"],
["无声幻影 Silent Image", "Compendium.dnd5e_classpack.new-icon.Item.Z7I5i8x6N2FZele1"],
["无敌术Invulnerability", "Compendium.dnd5e_classpack.new-icon.Item.WProXUcVKTcgGxCt"],
["时光蹂躏 Time Ravage", "Compendium.dnd5e_classpack.new-icon.Item.jlxVoUI0BpoOLcjx"],
["时流刹转Temporal Shunt", "Compendium.dnd5e_classpack.new-icon.Item.BhKGVcetRNPD2w6M"],
["时间停止 Time Stop", "Compendium.dnd5e_classpack.new-icon.Item.5V761kP78QMdqJpc"],
["易容术 Disguise Self", "Compendium.dnd5e_classpack.new-icon.Item.ju3LXSi72l6vso3l"],
["星界投影 Astral Projection", "Compendium.dnd5e_classpack.new-icon.Item.iPlnHVKnED0Oqb66"],
["昼明术 Daylight", "Compendium.dnd5e_classpack.new-icon.Item.uRF0L8no150cYca4"],
["智能壁垒 Intellect Fortress (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.EPA95aL0TTwT4WCb"],
["暗影衍体召唤术 Summon Shadowspawn (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.n9tVU1jnmwUqoUnf"],
["暗示术 Suggestion", "Compendium.dnd5e_classpack.new-icon.Item.Ubl35siOKv9ihW2M"],
["暗黑星辰Dark Star", "Compendium.dnd5e_classpack.new-icon.Item.KS5iEDJFWv7JWwb2"],
["暴风法球Storm Sphere", "Compendium.dnd5e_classpack.new-icon.Item.aDWH4875u9g0MGe8"],
["月华之光 Moonbeam", "Compendium.dnd5e_classpack.new-icon.Item.Vf5ZLLqRsGSy5ckY"],
["朦胧术 Blur", "Compendium.dnd5e_classpack.new-icon.Item.2XwLnziQi0Iv7GQT"],
["木遁术 Transport via Plants", "Compendium.dnd5e_classpack.new-icon.Item.L9NYP6PPcOKVOt8H"],
["李欧蒙小屋 Leomund's Tiny Hut", "Compendium.dnd5e_classpack.new-icon.Item.r32GM0pRthbUBqeT"],
["李欧蒙秘藏箱 Secret Chest", "Compendium.dnd5e_classpack.new-icon.Item.Xvbp5UwtqRWUmxqB"],
["构装召唤术 Summon Construct (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.46SldCNyO92qIwfQ"],
["林地之精咒唤术 Conjure Woodland Beings", "Compendium.dnd5e_classpack.new-icon.Item.TpcM6OLClA8OKDyI"],
["枯萎术 Blight", "Compendium.dnd5e_classpack.new-icon.Item.AVumturalJuP4paw"],
["树肤术 Barkskin", "Compendium.dnd5e_classpack.new-icon.Item.YbdMfI7wNgrKkpRK"],
["树跃术 Tree Stride", "Compendium.dnd5e_classpack.new-icon.Item.UqkkLccwOWYk8aO1"],
["棘墙术 Wall of Thorns", "Compendium.dnd5e_classpack.new-icon.Item.daOfNOfWYwZ7eNXK"],
["棘雹术Hail of Thorns", "Compendium.dnd5e_classpack.new-icon.Item.fJxQtdinEoAnrUG3"],
["植物交谈 Speak with Plants", "Compendium.dnd5e_classpack.new-icon.Item.n61LzTyqnbhiYxre"],
["植物滋长 Plant Growth", "Compendium.dnd5e_classpack.new-icon.Item.1TP8dARdcRojx7P1"],
["橡棍术 Shillelagh", "Compendium.dnd5e_classpack.new-icon.Item.d1CXvjrbciu5i40q"],
["次级元素咒唤术 Conjure Minor Elementals", "Compendium.dnd5e_classpack.new-icon.Item.2k4rF0AKjIb3eN2C"],
["次级复原术 Lesser Restoration", "Compendium.dnd5e_classpack.new-icon.Item.I1C2EQxwynPd7dOC"],
["次级幻影 Minor Illusion", "Compendium.dnd5e_classpack.new-icon.Item.ErbvJsxASx22Goxe"],
["欧提路克冰封法球 Freezing Sphere", "Compendium.dnd5e_classpack.new-icon.Item.7ogt8uGRk3Ts8fXZ"],
["欧提路克弹力法球 Resilient Sphere", "Compendium.dnd5e_classpack.new-icon.Item.cdeQPacCcm540OPy"],
["死云术 Cloudkill", "Compendium.dnd5e_classpack.new-icon.Item.T39k39dbE2poIFc5"],
["死亡一指 Finger of Death", "Compendium.dnd5e_classpack.new-icon.Item.r5y9Q7FglPwcglKB"],
["死亡法阵 Circle of Death", "Compendium.dnd5e_classpack.new-icon.Item.clm1RBYSIaV4pelJ"],
["死神灵魄 Spirit of Death", "Compendium.dnd5e_classpack.new-icon.Item.6vnUcrrwP7bygCfX"],
["死者交谈 Speak with Dead", "Compendium.dnd5e_classpack.new-icon.Item.o9GQEt4fYw6WjpB0"],
["死者复活 Raise Dead", "Compendium.dnd5e_classpack.new-icon.Item.63gAxMpLpbVW9Oja"],
["毒气喷溅 Poison Spray", "Compendium.dnd5e_classpack.new-icon.Item.odeHix5Pr59Dvg1n"],
["毕格比之手 Arcane Hand", "Compendium.dnd5e_classpack.new-icon.Item.naXxMtlZiJr9JYdU"],
["气化形体 Gaseous Form", "Compendium.dnd5e_classpack.new-icon.Item.gjE6zBmfdUOwXiae"],
["水上行走 Water Walk", "Compendium.dnd5e_classpack.new-icon.Item.fpEiFPEnSjOGP7wy"],
["水下呼吸 Water Breathing", "Compendium.dnd5e_classpack.new-icon.Item.cNIfr5CzsBZIPwHs"],
["水墙术 Wall of Water", "Compendium.dnd5e_classpack.new-icon.Item.AAbxHWiSKv5AG58p"],
["汲能术Enervation", "Compendium.dnd5e_classpack.new-icon.Item.ZtxJ6pZJvMhCH0kX"],
["汲能术持续汲取Enervation", "Compendium.dnd5e_classpack.new-icon.Item.QWDbg1DzggvVuW69"],
["沉默术 Silence", "Compendium.dnd5e_classpack.new-icon.Item.K8KLs8zFHqBZittr"],
["沙墙Wall of Sand", "Compendium.dnd5e_classpack.new-icon.Item.A5X9Cmx4dRvMziVY"],
["油腻术 Grease", "Compendium.dnd5e_classpack.new-icon.Item.ocOtoi8hLFVfkG8V"],
["治愈之魂Healing Spirit", "Compendium.dnd5e_classpack.new-icon.Item.hAc1Efpn9LxdZEtv"],
["治愈真言 Healing Word", "Compendium.dnd5e_classpack.new-icon.Item.L6dK0A5IfpiXRhdm"],
["治疗祷言 Prayer of Healing", "Compendium.dnd5e_classpack.new-icon.Item.9h978cNv0y7ZOepO"],
["法师之手 Mage Hand", "Compendium.dnd5e_classpack.new-icon.Item.H5gghxp0hfT3BAlC"],
["法师护甲 Mage Armor", "Compendium.dnd5e_classpack.new-icon.Item.KSMVJWpOg82yVTWG"],
["法术反制 Counterspell", "Compendium.dnd5e_classpack.new-icon.Item.895yeeloz2EhpEYC"],
["法术无效结界 Globe of Invulnerability", "Compendium.dnd5e_classpack.new-icon.Item.GG46WW8ccTRfoSxH"],
["注目术 Enthrall", "Compendium.dnd5e_classpack.new-icon.Item.YfT8hNtZ4Qt8aLKc"],
["活力灵光Aura of Vitality", "Compendium.dnd5e_classpack.new-icon.Item.XfYgB18GC8OgETjG"],
["活化死尸 Animate Dead", "Compendium.dnd5e_classpack.new-icon.Item.xYpJGRI4xcMa41kO"],
["活化物件 Animate Objects", "Compendium.dnd5e_classpack.new-icon.Item.Lub4e9tYHMHeVo7Y"],
["流星爆 Meteor Swarm", "Compendium.dnd5e_classpack.new-icon.Item.LtaU4r0YHdm4lpj3"],
["浓酸球Vitriolic Sphere", "Compendium.dnd5e_classpack.new-icon.Item.amBKEklOriWxAnof"],
["浮空术 Levitate", "Compendium.dnd5e_classpack.new-icon.Item.GNvrHluGdgqD06wZ"],
["海啸术Tsunami", "Compendium.dnd5e_classpack.new-icon.Item.fxyDbkauLN9jv6Wx"],
["海市蜃楼 Mirage Arcane", "Compendium.dnd5e_classpack.new-icon.Item.H2CB7pl6WjrpwN8i"],
["涅斯图魔法灵光 Arcanist's Magic Aura", "Compendium.dnd5e_classpack.new-icon.Item.JXjHc37DKcHrPtNz"],
["涡旋翘曲 Vortex Warp", "Compendium.dnd5e_classpack.new-icon.Item.f4HqyOlTVNlCFU77"],
["混乱箭 Chaos Bolt", "Compendium.dnd5e_classpack.new-icon.Item.hbVFl8RD8KWkMkSe"],
["清风赋权 Investiture of Wind", "Compendium.dnd5e_classpack.new-icon.Item.lEIq1Az7BNh4in1j"],
["渺远步Far Step", "Compendium.dnd5e_classpack.new-icon.Item.NUdLUwzAXBll0vvD"],
["湮灭波 Destructive Wave", "Compendium.dnd5e_classpack.new-icon.Item.h5iJ31zaIfqt8OgP"],
["潮涌Tidal Wave", "Compendium.dnd5e_classpack.new-icon.Item.VXCxWlN2yu8lKQoV"],
["激愤斩Wrathful Smite", "Compendium.dnd5e_classpack.new-icon.Item.ccsNUAD2zK3esckm"],
["火墙术 Wall of Fire", "Compendium.dnd5e_classpack.new-icon.Item.agTzLRmgNSVghaGk"],
["火焰刀 Flame Blade", "Compendium.dnd5e_classpack.new-icon.Item.h3GLhrJzhakxicz1"],
["火焰护盾 Fire Shield", "Compendium.dnd5e_classpack.new-icon.Item.AdWubx1kFJLe8QDa"],
["火焰箭 Fire Bolt", "Compendium.dnd5e_classpack.new-icon.Item.Oa5hMlxdpwLNtLWp"],
["火焰风暴 Fire Storm", "Compendium.dnd5e_classpack.new-icon.Item.zjYDXNUeJMtBikPd"],
["火球术 Fireball", "Compendium.dnd5e_classpack.new-icon.Item.Uh3zcz4PO4DXP3Dj"],
["灵体卫士 Spirit Guardians", "Compendium.dnd5e_classpack.new-icon.Item.SrPArp6F9Ixot8Mh"],
["灵体卫士(midi)Spirit Guardians 10.0.10", "Compendium.dnd5e_classpack.new-icon.Item.c7gxI1K0oOphAX76"],
["灵体武器 Spiritual Weapon", "Compendium.dnd5e_classpack.new-icon.Item.uLEtdTC6yBxuLNFe"],
["灵敏之赐 Gift of Alacrity", "Compendium.dnd5e_classpack.new-icon.Item.dxCs7oMMHNV7keND"],
["灵魂牢笼 Soul Cage", "Compendium.dnd5e_classpack.new-icon.Item.1O80t9X7nof3CkrS"],
["灼热射线 Scorching Ray", "Compendium.dnd5e_classpack.new-icon.Item.IkgKSSiBuGa5TPLB"],
["灼热金属 Heat Metal", "Compendium.dnd5e_classpack.new-icon.Item.tf3EIMrOkbZvOxSz"],
["灾厄之刃 Blade of Disaster (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.NvJ2XLsbQkA7XEvq"],
["灾祸术 Bane", "Compendium.dnd5e_classpack.new-icon.Item.XT4GwLQNAuPvtnrF"],
["炼狱叱喝 Hellish Rebuke", "Compendium.dnd5e_classpack.new-icon.Item.Qh8PTvCxR44isqVO"],
["炽焰斩Searing Smite", "Compendium.dnd5e_classpack.new-icon.Item.73yB6CHxGk3Np5ME"],
["炽焰法球 Flaming Sphere", "Compendium.dnd5e_classpack.new-icon.Item.TEZY0aYJtnuU4FlW"],
["炽焰赋权Investiture of Flame", "Compendium.dnd5e_classpack.new-icon.Item.asHIoOLQjV5WDpXb"],
["烈焰箭矢 Flame Arrows", "Compendium.dnd5e_classpack.new-icon.Item.z8vEOPNMfh8yEJcu"],
["烟火术 Pyrotechnics", "Compendium.dnd5e_classpack.new-icon.Item.23c6EOCEwMoRr5M2"],
["焚云术 Incendiary Cloud", "Compendium.dnd5e_classpack.new-icon.Item.FUiSyN2j2j3ufukn"],
["焚云术重复效应 Incendiary Cloud", "Compendium.dnd5e_classpack.new-icon.Item.icThXZJpsJrvHHdU"],
["焚烧术 Immolation", "Compendium.dnd5e_classpack.new-icon.Item.DMc82k2dKx3mOtDA"],
["焰击术 Flame Strike", "Compendium.dnd5e_classpack.new-icon.Item.Q8XNvy4kwTSQVizo"],
["燃火术 Produce Flame", "Compendium.dnd5e_classpack.new-icon.Item.axyaTwbdF8zn6BYi"],
["燃烧之手 Burning Hands", "Compendium.dnd5e_classpack.new-icon.Item.CB9z74KJLWMplGuz"],
["物件定位术 Locate Object", "Compendium.dnd5e_classpack.new-icon.Item.Fw3U8sQwWSPVoisW"],
["猎人印记 Hunter's Mark", "Compendium.dnd5e_classpack.new-icon.Item.EvKYUkiYevVt0lkq"],
["生命灵光 Aura of Life", "Compendium.dnd5e_classpack.new-icon.Item.9WDd3gopYOGyYnrT"],
["生命转换Life Transference", "Compendium.dnd5e_classpack.new-icon.Item.qAq3VjxYoobXoTIE"],
["生物定位术 Locate Creature", "Compendium.dnd5e_classpack.new-icon.Item.s9CC5wvKMHq42hPY"],
["电爪 Shocking Grasp", "Compendium.dnd5e_classpack.new-icon.Item.0kzjiCnyoMHwijsp"],
["界门封锁 Gate Seal", "Compendium.dnd5e_classpack.new-icon.Item.2034QhH5G2OJEKBr"],
["疗伤术 Cure Wounds", "Compendium.dnd5e_classpack.new-icon.Item.a5wqDP53A5UvGvSK"],
["疫病术 Contagion", "Compendium.dnd5e_classpack.new-icon.Item.gbHBG4jYU3I06JQO"],
["疫病虫群 Insect Plague", "Compendium.dnd5e_classpack.new-icon.Item.eGYMgP3fmIUQEXMm"],
["疯狂之暗Maddening Darkness", "Compendium.dnd5e_classpack.new-icon.Item.XXezqR08i0je7Vdq"],
["疯狂冠冕Crown of Madness", "Compendium.dnd5e_classpack.new-icon.Item.otAaRLMc7OfxRYAw"],
["目盲术/耳聋术 Blindness/Deafness", "Compendium.dnd5e_classpack.new-icon.Item.5GWYJBfc1aZ6415M"],
["真知术 True Seeing", "Compendium.dnd5e_classpack.new-icon.Item.QxQTaDIC55OIxpoy"],
["睡眠术 Sleep", "Compendium.dnd5e_classpack.new-icon.Item.hFHF7vm3FYyTN288"],
["短讯术 Sending", "Compendium.dnd5e_classpack.new-icon.Item.kRO1zjPXuOLm4qUU"],
["石化术 Flesh to Stone", "Compendium.dnd5e_classpack.new-icon.Item.oLtyOvrWeLNEJDIE"],
["石墙术 Wall of Stone", "Compendium.dnd5e_classpack.new-icon.Item.Q3dXN3afS9N86zSQ"],
["石肤术 Stoneskin", "Compendium.dnd5e_classpack.new-icon.Item.8xmyW0Ynz0z7Kt3X"],
["碧水法球 Watery Sphere", "Compendium.dnd5e_classpack.new-icon.Item.GJb7Voh9aWp1bshP"],
["磐石赋权 Investiture of Stone", "Compendium.dnd5e_classpack.new-icon.Item.DNdfU6rBkEKZr7FR"],
["祈愿术 Wish", "Compendium.dnd5e_classpack.new-icon.Item.xjn6gjItpWpldE53"],
["祝福术 Bless", "Compendium.dnd5e_classpack.new-icon.Item.U1GNY4potyr0c6mq"],
["神圣武器Holy Weapon", "Compendium.dnd5e_classpack.new-icon.Item.p3rZZLMndxwp1Xs4"],
["神导术 Guidance", "Compendium.dnd5e_classpack.new-icon.Item.QiU2ZZ09lBye0Iy4"],
["神导术(60尺-精魂诗人)", "Compendium.dnd5e_classpack.new-icon.Item.1xfvqwNyqqNINwql"],
["神庙术Temple of the Gods", "Compendium.dnd5e_classpack.new-icon.Item.G1TzQn2GM4lvqUOi"],
["神恩 Divine Favor", "Compendium.dnd5e_classpack.new-icon.Item.tT6AXKxZZGclrwhr"],
["神莓术 Goodberry", "Compendium.dnd5e_classpack.new-icon.Item.YBMBbBku5PW3IuGc"],
["禁制术 Forbiddance", "Compendium.dnd5e_classpack.new-icon.Item.4n7sz4dTLLpLhtlA"],
["禁锢术 Imprisonment", "Compendium.dnd5e_classpack.new-icon.Item.nT9lP0TTWedVkyhk"],
["秘法眼 Arcane Eye", "Compendium.dnd5e_classpack.new-icon.Item.uF6bn9CQaLwvmxwv"],
["秘法锁 Arcane Lock", "Compendium.dnd5e_classpack.new-icon.Item.Xdu0aGdkaf36cmvR"],
["秘法门 Arcane Gate", "Compendium.dnd5e_classpack.new-icon.Item.GoHxmQDNg9i6lWU3"],
["移除诅咒 Remove Curse", "Compendium.dnd5e_classpack.new-icon.Item.ewDH2w8w2yLSM021"],
["空气泡泡 Air Bubble", "Compendium.dnd5e_classpack.new-icon.Item.ElTkzRz8F2UyF3xQ"],
["穿墙术 Passwall", "Compendium.dnd5e_classpack.new-icon.Item.EoIuyVnLAF4DyTO7"],
["突触静止Synaptic Static", "Compendium.dnd5e_classpack.new-icon.Item.JPBsQ6vNXASfe3nk"],
["篡改记忆 Modify Memory", "Compendium.dnd5e_classpack.new-icon.Item.O865yy87cPevGeMj"],
["粉碎音波 Shatter", "Compendium.dnd5e_classpack.new-icon.Item.3m0QZZAQfR4jXS9q"],
["精神监狱Mental Prison", "Compendium.dnd5e_classpack.new-icon.Item.Nyi51I1ZPVV1gNpo"],
["精类召唤术 Summon Fey (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.p12lhL5QyiAvgpTx"],
["精类咒唤术  Conjure Fey", "Compendium.dnd5e_classpack.new-icon.Item.iOXjGiPZthxNw9VW"],
["系结本源Tether Essence", "Compendium.dnd5e_classpack.new-icon.Item.UmnebUDC5GoZtzQy"],
["繁彩球	Chromatic Orb", "Compendium.dnd5e_classpack.new-icon.Item.LglOxNHIfY66ZhZm"],
["纠缠术 Entangle", "Compendium.dnd5e_classpack.new-icon.Item.NZ4JOGBMJzeCKT5O"],
["纳撒尔恶作剧 Nathair's Mischief", "Compendium.dnd5e_classpack.new-icon.Item.3LdtRmL9ctnX8d0X"],
["维生术 Spare the Dying", "Compendium.dnd5e_classpack.new-icon.Item.EslxcnZE2B9JYgF1"],
["维生术(附赠30尺)", "Compendium.dnd5e_classpack.new-icon.Item.ypxWpsi7EpFstwW3"],
["缓慢术 Slow", "Compendium.dnd5e_classpack.new-icon.Item.2AgiR8EQ7IglGbci"],
["群体医疗术 Mass Heal", "Compendium.dnd5e_classpack.new-icon.Item.36p6tK4e5j9TUQS5"],
["群体变形术Mass Polymorph", "Compendium.dnd5e_classpack.new-icon.Item.aKVZ57BueXJL9xpO"],
["群体暗示术 Mass Suggestion", "Compendium.dnd5e_classpack.new-icon.Item.r6AKEvIbCOnYDRxg"],
["群体治愈真言 Mass Healing Word", "Compendium.dnd5e_classpack.new-icon.Item.6PTF3SN0jxkEqv6W"],
["群体疗伤术 Mass Cure Wounds", "Compendium.dnd5e_classpack.new-icon.Item.UBLAtJuRhRB3GokC"],
["羽落术 Feather Fall", "Compendium.dnd5e_classpack.new-icon.Item.NYTOuhtKx54qRDCT"],
["翠炎剑 Green-Flame Blade", "Compendium.dnd5e_classpack.new-icon.Item.E7iT0s1aQdjdOVdg"],
["翠炎剑 Green-Flame Blade（TCE）", "Compendium.dnd5e_classpack.new-icon.Item.0TR7HOOqbttnAGzj"],
["脆弱诅咒 hex", "Compendium.dnd5e_classpack.new-icon.Item.KhekI9OpHBERLsux"],
["脉冲波动 Pulse Wave", "Compendium.dnd5e_classpack.new-icon.Item.ZGvthYJNmIv8sDqj"],
["脚底抹油 Expeditious Retreat", "Compendium.dnd5e_classpack.new-icon.Item.JaxkuxSdKN1Weybr"],
["自然之怒Wrath of Nature", "Compendium.dnd5e_classpack.new-icon.Item.FhTBorrQFRM1IFPb"],
["自然守卫Guardian of Nature", "Compendium.dnd5e_classpack.new-icon.Item.GfB2Y0XAgzMHK5N3"],
["臭云术 Stinking Cloud", "Compendium.dnd5e_classpack.new-icon.Item.GensV9GQoTT2acka"],
["臭云术重复效应 Stinking Cloud", "Compendium.dnd5e_classpack.new-icon.Item.wltYuACh4gJ1qqKk"],
["致伤术 Inflict Wounds", "Compendium.dnd5e_classpack.new-icon.Item.Fl4lOWHo82WLp3g7"],
["致病射线 Ray of Sickness", "Compendium.dnd5e_classpack.new-icon.Item.PZQqlG5R6G24aWtm"],
["致病辐射Sickening Radiance", "Compendium.dnd5e_classpack.new-icon.Item.JSxPHbCjMysA0rRr"],
["致盲斩 Blinding Smite", "Compendium.dnd5e_classpack.new-icon.Item.9SpQuC75YyawO4ZJ"],
["舞光术 Dancing Lights", "Compendium.dnd5e_classpack.new-icon.Item.EytNGAyofbNy9Im9"],
["舞风术 Gust", "Compendium.dnd5e_classpack.new-icon.Item.FJPR0Q2JSQuR3S52"],
["艾伐黑触手 Black Tentacles", "Compendium.dnd5e_classpack.new-icon.Item.v8x6SQFAOTzUIRnU"],
["艾嘉西斯之铠 Armor of Agathys", "Compendium.dnd5e_classpack.new-icon.Item.l1SThGbqPfk8SZa7"],
["艾嘉西斯之铠反噬 Armor of Agathys", "Compendium.dnd5e_classpack.new-icon.Item.GYdsvWCRao9llLVM"],
["花言巧语 Glibness", "Compendium.dnd5e_classpack.new-icon.Item.AVZr4I1z6hvKI7cZ"],
["英雄宴 Heroes' Feast", "Compendium.dnd5e_classpack.new-icon.Item.bgKL1d85c4YYYeCO"],
["英雄气概 Heroism", "Compendium.dnd5e_classpack.new-icon.Item.eatsvLyUqyzEFzCv"],
["荆棘丛生 Spike Growth", "Compendium.dnd5e_classpack.new-icon.Item.1oL8DBOVZMuhaKpw"],
["荆棘之鞭 Thorn Whip", "Compendium.dnd5e_classpack.new-icon.Item.xdcwYwrogiY6Rvng"],
["莫伊之影 Shadow of Moil", "Compendium.dnd5e_classpack.new-icon.Item.Qh17U4Og0wrxBHIR"],
["蓝纱一梦 Dream of the Blue Veil (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.fVnBnVVjKm1Nnrh8"],
["虔诚护盾 Shield of Faith", "Compendium.dnd5e_classpack.new-icon.Item.FHot3Ii2ShP2NEt1"],
["虚假生命 False Life", "Compendium.dnd5e_classpack.new-icon.Item.DEl8kc5vGwLCNYpR"],
["虫群孳生Infestation", "Compendium.dnd5e_classpack.new-icon.Item.1OJgT7sXxE77j3xa"],
["虹光喷射 Prismatic Spray", "Compendium.dnd5e_classpack.new-icon.Item.oxvIiEKCQhht8JrO"],
["虹光法墙 Prismatic Wall", "Compendium.dnd5e_classpack.new-icon.Item.ESNeo2IdY8F19MMt"],
["蛛网术 Web", "Compendium.dnd5e_classpack.new-icon.Item.oopuSIBsaXzQKw1Q"],
["蛛行术 Spider Climb", "Compendium.dnd5e_classpack.new-icon.Item.FNDS75JLYFQy4WUq"],
["融身入石 Meld into Stone", "Compendium.dnd5e_classpack.new-icon.Item.pJ6hE8Vab5Ypuqm4"],
["行动无踪 Pass without Trace", "Compendium.dnd5e_classpack.new-icon.Item.lPGqq33qbJb90exM"],
["行动自如 Freedom of Movement", "Compendium.dnd5e_classpack.new-icon.Item.OZMc9g7XaWuRc36J"],
["衰弱射线 Ray of Enfeeblement", "Compendium.dnd5e_classpack.new-icon.Item.VRvKmIZL44nZWKaa"],
["西风打击Zephyr Strike", "Compendium.dnd5e_classpack.new-icon.Item.7eGFUp4WNpVmprQq"],
["解离术 Disintegrate", "Compendium.dnd5e_classpack.new-icon.Item.j4LqpyfXhYoUpUCz"],
["解除魔法 Dispel Magic", "Compendium.dnd5e_classpack.new-icon.Item.as6xgBANCbyoWPXX"],
["触发术 Contingency", "Compendium.dnd5e_classpack.new-icon.Item.phPySCLLBCsToa81"],
["警戒箭阵 Cordon of Arrows", "Compendium.dnd5e_classpack.new-icon.Item.Kji4U8lDHBAOoruA"],
["警报术 Alarm", "Compendium.dnd5e_classpack.new-icon.Item.xS2Astj9zhhqw7el"],
["识破隐形 See Invisibility", "Compendium.dnd5e_classpack.new-icon.Item.AYqzOw6GE7NT3FhJ"],
["诚实之域 Zone of Truth", "Compendium.dnd5e_classpack.new-icon.Item.T4zFq0zTHnzZeO9t"],
["诱捕打击 Ensnaring Strike", "Compendium.dnd5e_classpack.new-icon.Item.kAJS0ooYqHMVzyYX"],
["谭森变形术Tenser's Transformation", "Compendium.dnd5e_classpack.new-icon.Item.z2Dz06xt2UiWFcWe"],
["谭森浮碟术Tenser's Floating Disk", "Compendium.dnd5e_classpack.new-icon.Item.7ZXLBqcrw4qzSnt2"],
["负能量洪流Negative Energy Flood", "Compendium.dnd5e_classpack.new-icon.Item.b9Gz0n1PH63i86mY"],
["费茨本铂金盾Fizban's Platinum Shield", "Compendium.dnd5e_classpack.new-icon.Item.vP75Ws9NmLAm8uT4"],
["跳跃术 Jump", "Compendium.dnd5e_classpack.new-icon.Item.1B8U6kl0egesx3FK"],
["转化岩石Transmute Rock", "Compendium.dnd5e_classpack.new-icon.Item.kftB3w0yPx6DMT1b"],
["转生术 Reincarnate", "Compendium.dnd5e_classpack.new-icon.Item.8Q1GXPGBXIdBOoqY"],
["轰雷剑 Booming Blade", "Compendium.dnd5e_classpack.new-icon.Item.96hMNnbvC0O57baz"],
["轰雷剑 Booming Blade（TCE）", "Compendium.dnd5e_classpack.new-icon.Item.pumDQ5z7GSGX16nY"],
["迅捷箭袋 Swift Quiver", "Compendium.dnd5e_classpack.new-icon.Item.Kaszeh280qlKFsTf"],
["连锁闪电 Chain Lightning", "Compendium.dnd5e_classpack.new-icon.Item.8iz3UpuZkW0KARvg"],
["迷你仆役Tiny Servant", "Compendium.dnd5e_classpack.new-icon.Item.rpH65cKfcpJ6MFo3"],
["迷宫术 Maze", "Compendium.dnd5e_classpack.new-icon.Item.mUBhfPyZBYYXg5Eo"],
["迷幻手稿 Illusory Script", "Compendium.dnd5e_classpack.new-icon.Item.OoH3EeKdDgPHUqDr"],
["迷踪步 Misty Step", "Compendium.dnd5e_classpack.new-icon.Item.Cnzcy1Tu7gt6xYHm"],
["通晓传奇 Legend Lore", "Compendium.dnd5e_classpack.new-icon.Item.YJI4AeSEGPKf169b"],
["通晓语言 Comprehend Languages", "Compendium.dnd5e_classpack.new-icon.Item.v0KfpSysfp5ug9kx"],
["通神术 Commune", "Compendium.dnd5e_classpack.new-icon.Item.7tphgwQJI7dKIyfE"],
["造成恐惧Cause Fear", "Compendium.dnd5e_classpack.new-icon.Item.9mwkeiRHNZwBCNJD"],
["造水术／枯水术 Create or Destroy Water", "Compendium.dnd5e_classpack.new-icon.Item.V843ppI7fUmc5Gd6"],
["造物术 Creation", "Compendium.dnd5e_classpack.new-icon.Item.Zwe287Drdl1TkG8e"],
["造粮术 Create Food and Water", "Compendium.dnd5e_classpack.new-icon.Item.1wNlI6I8gtlQlm3q"],
["造风术 Gust of Wind", "Compendium.dnd5e_classpack.new-icon.Item.cGIrpk6h4Rf8QKV6"],
["遗体防腐 Gentle Repose", "Compendium.dnd5e_classpack.new-icon.Item.uzWirpWyQshzp1l0"],
["邪魔召唤术 Summon Fiend (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.5wQNcY6579h2jLeA"],
["酸液飞溅 Acid Splash", "Compendium.dnd5e_classpack.new-icon.Item.E7wFpzV30sX2e7t6"],
["重伤术 Harm", "Compendium.dnd5e_classpack.new-icon.Item.xEDZVzRlAqccmrG5"],
["重力分裂Gravity Fissure", "Compendium.dnd5e_classpack.new-icon.Item.ZxWCxjwKa6YPo14V"],
["野兽召唤术 Summon Beast  (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.exBreA0aIOBCV2hi"],
["野兽知觉 Beast Sense", "Compendium.dnd5e_classpack.new-icon.Item.aCbWarazGEZ7fMnd"],
["鉴定术 Identify", "Compendium.dnd5e_classpack.new-icon.Item.tyshE8ZcV1Xniej3"],
["钢风斩Steel Wind Strike", "Compendium.dnd5e_classpack.new-icon.Item.9Curi9o7Xk2ksXVr"],
["铜墙铁壁 Guards and Wards", "Compendium.dnd5e_classpack.new-icon.Item.8Cs1k28oBMvCLfgE"],
["银光锐语 Silvery Barbs", "Compendium.dnd5e_classpack.new-icon.Item.SRXFuIkZsIJecpSi"],
["镜影术 Mirror Image", "Compendium.dnd5e_classpack.new-icon.Item.1EkQSAH6o8WMxUU3"],
["闪现术 Blink", "Compendium.dnd5e_classpack.new-icon.Item.bj6fUAFiJScoI6wb"],
["闪电束 Lightning Bolt", "Compendium.dnd5e_classpack.new-icon.Item.dHg72reVMXYFu4lR"],
["闪电牵引 Lightning Lure", "Compendium.dnd5e_classpack.new-icon.Item.IkFYMlWnKZOskbxR"],
["闪电牵引 Lightning Lure（TCE）", "Compendium.dnd5e_classpack.new-icon.Item.9ez2X9q9mQmDqJ8Q"],
["闪电箭矢 Lightning Arrows", "Compendium.dnd5e_classpack.new-icon.Item.foXFIk5vUa6vCF0f"],
["问道自然 Commune with Nature", "Compendium.dnd5e_classpack.new-icon.Item.tnDSVQwVqkmqWFPP"],
["防护善恶 Protection from Evil and Good", "Compendium.dnd5e_classpack.new-icon.Item.IuzXxwP3EhWGhtXC"],
["防护善恶(奉献之誓) Protection from Evil and Good", "Compendium.dnd5e_classpack.new-icon.Item.hTv2Q5cwR93erqN7"],
["防护毒素 Protection from Poison", "Compendium.dnd5e_classpack.new-icon.Item.WhS1lv9X52SEYe3c"],
["防护法阵 Magic Circle", "Compendium.dnd5e_classpack.new-icon.Item.Vrzu8xpLMvOvOnx6"],
["防护能量伤害 Protection from Energy", "Compendium.dnd5e_classpack.new-icon.Item.DBrh7ALD21UoUApP"],
["防死结界 Death Ward", "Compendium.dnd5e_classpack.new-icon.Item.4gLdaCM7rxoNhj8d"],
["防活物护罩 Antilife Shell", "Compendium.dnd5e_classpack.new-icon.Item.XK3IvcqPquyj1W3P"],
["阳炎射线 Sunbeam", "Compendium.dnd5e_classpack.new-icon.Item.oU9SfwCYsV2eiZiQ"],
["阳炎爆 Sunburst", "Compendium.dnd5e_classpack.new-icon.Item.P8biBjQGeqe3c7M8"],
["阿莎德隆奔行 Ashardalon's Stride", "Compendium.dnd5e_classpack.new-icon.Item.FhUX1dok8J753raG"],
["阿莎德隆奔行(烧灼) Ashardalon's Stride", "Compendium.dnd5e_classpack.new-icon.Item.rlfAEh2BMcFhfkYT"],
["阿迦纳萨喷火术 Aganazzar’s Scorcher", "Compendium.dnd5e_classpack.new-icon.Item.oriOMAUpIf7Xkeq8"],
["降咒 Bestow Curse", "Compendium.dnd5e_classpack.new-icon.Item.kqh0eV640hXk4flg"],
["隐形仆役 Unseen Servant", "Compendium.dnd5e_classpack.new-icon.Item.EuKITnw8F4mHUEEL"],
["隐形术 Invisibility", "Compendium.dnd5e_classpack.new-icon.Item.V7BV9skWjd87Ebgj"],
["隔离术 Sequester", "Compendium.dnd5e_classpack.new-icon.Item.atESYZdoVCOxBRZO"],
["雪雨暴 Sleet Storm", "Compendium.dnd5e_classpack.new-icon.Item.InxRn0MsZsH5wslj"],
["雷霆步Thunder Step", "Compendium.dnd5e_classpack.new-icon.Item.klFs2IQ04Js45urt"],
["雷鸣斩 Thunderous Smite", "Compendium.dnd5e_classpack.new-icon.Item.Nnlg7rIKGf7VMWRl"],
["雷鸣波 Thunderwave", "Compendium.dnd5e_classpack.new-icon.Item.8GM6YBgYFPIcFXKg"],
["雾凇霜缚 Rime's Binding Ice", "Compendium.dnd5e_classpack.new-icon.Item.qzmof1d1v67ApGp9"],
["霜噬Frostbite", "Compendium.dnd5e_classpack.new-icon.Item.HiK5V74W9ttvQQvR"],
["靡叶生华 Wither and Bloom", "Compendium.dnd5e_classpack.new-icon.Item.TYDLwcLPhcRMUowk"],
["预置幻影 Programmed Illusion", "Compendium.dnd5e_classpack.new-icon.Item.N999l8iiW7Ub35fV"],
["预言术 Divination", "Compendium.dnd5e_classpack.new-icon.Item.0An7Gb3wSSffcHhV"],
["预警术 Foresight", "Compendium.dnd5e_classpack.new-icon.Item.W3JAUTQ0DetaeRts"],
["风墙术 Wind Wall", "Compendium.dnd5e_classpack.new-icon.Item.WLWSZA4pZSGb0Mku"],
["飞行术 Fly", "Compendium.dnd5e_classpack.new-icon.Item.N6gooaEP5pDVtJTV"],
["饕餮虚空Ravenous Void", "Compendium.dnd5e_classpack.new-icon.Item.jW7PSiC6nwFx2zyV"],
["马友夫强酸箭 Acid Arrow", "Compendium.dnd5e_classpack.new-icon.Item.jR5afVVOCCwjkbz2"],
["马友夫微流星Melf’s Minute Meteors", "Compendium.dnd5e_classpack.new-icon.Item.qEWQVF4XoNrMNQXp"],
["马友夫微流星x1 Melf’s Minute Meteors", "Compendium.dnd5e_classpack.new-icon.Item.8OAXWVD34QZT8WKC"],
["骷髅之舞Danse Macabre", "Compendium.dnd5e_classpack.new-icon.Item.X5XpXKOD2m4PzLQq"],
["高等复原术 Greater Restoration", "Compendium.dnd5e_classpack.new-icon.Item.7dqplcsKNYQgRh2S"],
["高等幻影 Major Image", "Compendium.dnd5e_classpack.new-icon.Item.XIw3jNqRlLXFo4AX"],
["高等隐形术 Greater Invisibility", "Compendium.dnd5e_classpack.new-icon.Item.Au584WRiGch84PXI"],
["高阶恶魔召唤术 Summon Greater Demon", "Compendium.dnd5e_classpack.new-icon.Item.Xh5cdHfYtKXl5Izi"],
["鬼斧神工 Fabricate", "Compendium.dnd5e_classpack.new-icon.Item.u7JAeqMO5fYhTnMy"],
["魂灵环绕 Spirit Shroud (TCE)", "Compendium.dnd5e_classpack.new-icon.Item.TH2wXQ3yssrGZ821"],
["魅影之力 phantasmal force", "Compendium.dnd5e_classpack.new-icon.Item.ScqNvMCUNcvTs5rG"],
["魅影杀手 Phantasmal Killer", "Compendium.dnd5e_classpack.new-icon.Item.BLNE7S7l2uTkx7w6"],
["魅影驹 Phantom Steed", "Compendium.dnd5e_classpack.new-icon.Item.94pGYJy85jxFKHi8"],
["魅惑人类 Charm Person", "Compendium.dnd5e_classpack.new-icon.Item.QFBZcGORjnBRgAYo"],
["魅惑怪物 Charm Monster", "Compendium.dnd5e_classpack.new-icon.Item.xVdP01470qrUp5AM"],
["魔化武器 Magic Weapon", "Compendium.dnd5e_classpack.new-icon.Item.14a3v5NF5h5Lgm9J"],
["魔嘴术 Magic Mouth", "Compendium.dnd5e_classpack.new-icon.Item.SDhDLJr9f5cm9EHx"],
["魔宠群 Flock of Familiars", "Compendium.dnd5e_classpack.new-icon.Item.JiWbZLEWgYfCUaDp"],
["魔法伎俩 Prestidigitation", "Compendium.dnd5e_classpack.new-icon.Item.zaUmr54yGtLyvUVC"],
["魔法飞弹 Magic Missile", "Compendium.dnd5e_classpack.new-icon.Item.q0FYQJX9EBseJ9KN"],
["魔石术 Magic Stone", "Compendium.dnd5e_classpack.new-icon.Item.2FVgIKqfITLH23j5"],
["魔绳术 Rope Trick", "Compendium.dnd5e_classpack.new-icon.Item.NddIAsoWizuASEW2"],
["魔能爆 Eldritch Blast", "Compendium.dnd5e_classpack.new-icon.Item.DREvt1bRjuglegTh"],
["魔袋术Wristpocket", "Compendium.dnd5e_classpack.new-icon.Item.7FYTE0jV0YzAv4BC"],
["魔邓肯之剑 Mordenkainen's Sword", "Compendium.dnd5e_classpack.new-icon.Item.QVFLf1y0tt8YT1iD"],
["魔邓肯忠犬 Mordenkainen's Faithful Hound", "Compendium.dnd5e_classpack.new-icon.Item.hZxR5NS02JzrXlrY"],
["魔邓肯私人密室 Mordenkainen's Private Sanctum", "Compendium.dnd5e_classpack.new-icon.Item.D4yRqzGl7iDpALz0"],
["魔邓肯豪宅术 Mordenkainen's Magnificent Mansion", "Compendium.dnd5e_classpack.new-icon.Item.Op4JXRBVkdPVuDov"],
["魔魂壶 Magic Jar", "Compendium.dnd5e_classpack.new-icon.Item.SWopkvFFxAkCwG7W"],
["鸣雷破Thunderclap", "Compendium.dnd5e_classpack.new-icon.Item.XB6QEYXfvvSu9mtU"],
["鹰眼术 Clairvoyance", "Compendium.dnd5e_classpack.new-icon.Item.WO2nFm8xEVkX4KJy"],
["麦克斯米利安的地之攫Maximilian’s Earthen Grasp", "Compendium.dnd5e_classpack.new-icon.Item.PIP2kvkvYMiqswwt"],
["黑暗术 Darkness", "Compendium.dnd5e_classpack.new-icon.Item.UyQ9nYcQlFdEbmeV"],
["黑暗视觉 Darkvision", "Compendium.dnd5e_classpack.new-icon.Item.YssPbm6Mm2QFW3zT"],
["鼓动贪欲 Incite  Greed", "Compendium.dnd5e_classpack.new-icon.Item.hjdeUFfvdxKo78ue"],
["龙卷尘暴 Dust Devil", "Compendium.dnd5e_classpack.new-icon.Item.QHD9S9sWWIpPnykD"],
["龙息术Dragon's Breath", "Compendium.dnd5e_classpack.new-icon.Item.qNKwrXw2h23fkWV1"],
["龙类变形 Draconic Transformation", "Compendium.dnd5e_classpack.new-icon.Item.p0HwQvm5DXHoQDgy"],
["龙类灵魄召唤术 Summon Draconic Spirit", "Compendium.dnd5e_classpack.new-icon.Item.ykhLadSsK6164q3o"],
```

### §37 · `chris-premades.CPRSpells`（153 条） — chris-premades 自动化法术
```text
["Absorb Elements", "Compendium.chris-premades.CPRSpells.Item.X2w82BVXGgX92pHS"],
["Animate Dead", "Compendium.chris-premades.CPRSpells.Item.xzaSENSrhnYcXFfi"],
["Antagonize", "Compendium.chris-premades.CPRSpells.Item.bJRgW6qhbNU3KgoR"],
["Armor of Agathys", "Compendium.chris-premades.CPRSpells.Item.D1Udp1L7lBCvwNS9"],
["Arms of Hadar", "Compendium.chris-premades.CPRSpells.Item.QPdpvT3NGfL5ddf9"],
["Aura of Life", "Compendium.chris-premades.CPRSpells.Item.3oAqhbjL7IJYQfG9"],
["Aura of Purity", "Compendium.chris-premades.CPRSpells.Item.0feMjFbdNwhkHnnr"],
["Aura of Vitality", "Compendium.chris-premades.CPRSpells.Item.awpQL2TLGrcukGLg"],
["Banishment", "Compendium.chris-premades.CPRSpells.Item.RaLrQbbOL0YNR0HX"],
["Beacon of Hope", "Compendium.chris-premades.CPRSpells.Item.KAYtfGt5Z3hHcVkN"],
["Bestow Curse", "Compendium.chris-premades.CPRSpells.Item.wcXCAKaYsRKz082i"],
["Bigby's Hand", "Compendium.chris-premades.CPRSpells.Item.6WGX5BcYogtSpEIt"],
["Blade Ward", "Compendium.chris-premades.CPRSpells.Item.pZ8DbfDL7hzra9ob"],
["Bless", "Compendium.chris-premades.CPRSpells.Item.cm7uKBqgAgMDHMry"],
["Blight", "Compendium.chris-premades.CPRSpells.Item.03mAoVpvYsL8vBTJ"],
["Blinding Smite", "Compendium.chris-premades.CPRSpells.Item.W23eL6uYFFKFICRW"],
["Blink", "Compendium.chris-premades.CPRSpells.Item.huykUpLG2Bku09p5"],
["Booming Blade", "Compendium.chris-premades.CPRSpells.Item.GFKKf63d2F5OBjCX"],
["Borrowed Knowledge", "Compendium.chris-premades.CPRSpells.Item.VNnBNK8PZGKOFOjE"],
["Branding Smite", "Compendium.chris-premades.CPRSpells.Item.cAhCNQn8DhzRS4o4"],
["Burning Hands", "Compendium.chris-premades.CPRSpells.Item.mHUbGidIxjWhPTlh"],
["Call Lightning", "Compendium.chris-premades.CPRSpells.Item.OSutbBoP3wbdEBaf"],
["Chain Lightning", "Compendium.chris-premades.CPRSpells.Item.wO7vVCe34GqH5IuW"],
["Chaos Bolt", "Compendium.chris-premades.CPRSpells.Item.8LjAL0ftTHiB4q1o"],
["Charm Person", "Compendium.chris-premades.CPRSpells.Item.HYOlqkH6CutWw9nF"],
["Chill Touch", "Compendium.chris-premades.CPRSpells.Item.w1q1xweJ153XkgT0"],
["Chromatic Orb", "Compendium.chris-premades.CPRSpells.Item.ikmfjwYJLw1uEQlo"],
["Cloudkill", "Compendium.chris-premades.CPRSpells.Item.6cVr1qR11gxRW7WE"],
["Compelled Duel", "Compendium.chris-premades.CPRSpells.Item.1Qm16lJpxNT3Zfwm"],
["Conjure Animals", "Compendium.chris-premades.CPRSpells.Item.f5kE51gy5yp65Zwd"],
["Conjure Celestial", "Compendium.chris-premades.CPRSpells.Item.6mpRaimgRvXMDuMm"],
["Conjure Elemental", "Compendium.chris-premades.CPRSpells.Item.sKELWrkFlEAVfShM"],
["Conjure Fey", "Compendium.chris-premades.CPRSpells.Item.wJFFjVY4IUusNI5k"],
["Conjure Minor Elementals", "Compendium.chris-premades.CPRSpells.Item.AOwZDZvpC04KdB5S"],
["Conjure Woodland Beings", "Compendium.chris-premades.CPRSpells.Item.HtXyMLpahzUqGpEw"],
["Crown of Madness", "Compendium.chris-premades.CPRSpells.Item.u7sMUnIuOipiEEwJ"],
["Crown of Stars", "Compendium.chris-premades.CPRSpells.Item.GyTu934ueYqWNU8C"],
["Crusader's Mantle", "Compendium.chris-premades.CPRSpells.Item.ByxQSHLzINqphWXt"],
["Danse Macabre", "Compendium.chris-premades.CPRSpells.Item.jByZs5GopLjQqwM8"],
["Darkness", "Compendium.chris-premades.CPRSpells.Item.MuWPhDrX6FoiiWxf"],
["Dawn", "Compendium.chris-premades.CPRSpells.Item.mX1tjq19mW3QC4Vc"],
["Death Ward", "Compendium.chris-premades.CPRSpells.Item.APPjibAcleVGIeTp"],
["Destructive Wave", "Compendium.chris-premades.CPRSpells.Item.F5iSHr85KqZ678FQ"],
["Detect Magic", "Compendium.chris-premades.CPRSpells.Item.1SpIIdggDTDyCaRd"],
["Detect Thoughts", "Compendium.chris-premades.CPRSpells.Item.3iEjjPAF9NlJnyOo"],
["Disintegrate", "Compendium.chris-premades.CPRSpells.Item.WcM0zek3AIdM932n"],
["Dragon's Breath", "Compendium.chris-premades.CPRSpells.Item.n8llSRoKI3twO2On"],
["Dust Devil", "Compendium.chris-premades.CPRSpells.Item.dUsTDvLq9k1M2nXa"],
["Earth Tremor", "Compendium.chris-premades.CPRSpells.Item.J9fweMD18JE61Tuw"],
["Eldritch Blast", "Compendium.chris-premades.CPRSpells.Item.qTY7Bawpp6ghwXUT"],
["Elemental Weapon", "Compendium.chris-premades.CPRSpells.Item.Rf5RWbzgs5uXQafe"],
["Enlarge/Reduce", "Compendium.chris-premades.CPRSpells.Item.a8WnOGL785CR1Glt"],
["Faerie Fire", "Compendium.chris-premades.CPRSpells.Item.OwIomqdEaKV5Fej7"],
["Far Step", "Compendium.chris-premades.CPRSpells.Item.8wRrSBq5es2zzgwC"],
["Find Familiar", "Compendium.chris-premades.CPRSpells.Item.5aj89Jwb6ueqrw2v"],
["Find Greater Steed", "Compendium.chris-premades.CPRSpells.Item.DJdgOUCqfSYjGEz8"],
["Find Steed", "Compendium.chris-premades.CPRSpells.Item.SjouT6rm1spfXexa"],
["Fire Shield", "Compendium.chris-premades.CPRSpells.Item.3t98iJbNxqoUSgEK"],
["Fire Storm", "Compendium.chris-premades.CPRSpells.Item.LoP3mcxWBpmHTggD"],
["Flame Blade", "Compendium.chris-premades.CPRSpells.Item.Vy05AC8r73JEKUvy"],
["Flaming Sphere", "Compendium.chris-premades.CPRSpells.Item.4xutyf2yKGxc0TMD"],
["Flock of Familiars", "Compendium.chris-premades.CPRSpells.Item.jQ5kWJqBIjWMN1f6"],
["Fly", "Compendium.chris-premades.CPRSpells.Item.l8ZBkqlhRB2xIBFd"],
["Fog Cloud", "Compendium.chris-premades.CPRSpells.Item.YK5Jx1lwn1Nt3nV0"],
["Frost Fingers", "Compendium.chris-premades.CPRSpells.Item.K1DstLCUIPWp4RjB"],
["Gaseous Form", "Compendium.chris-premades.CPRSpells.Item.ojuRram1XRcdqrUs"],
["Globe of Invulnerability", "Compendium.chris-premades.CPRSpells.Item.yKmsDS5Oof0ZkYTh"],
["Grease", "Compendium.chris-premades.CPRSpells.Item.fhJEAJbla3nqMZkM"],
["Green-Flame Blade", "Compendium.chris-premades.CPRSpells.Item.thOwK2n5EXjV4iJr"],
["Guardian of Faith", "Compendium.chris-premades.CPRSpells.Item.rxSh3AdVG8T9gnmq"],
["Guardian of Nature", "Compendium.chris-premades.CPRSpells.Item.KE7Ls8LCKXhXcxo9"],
["Guiding Bolt", "Compendium.chris-premades.CPRSpells.Item.DsuiPcjqffLLFLod"],
["Gust of Wind", "Compendium.chris-premades.CPRSpells.Item.447wkmGCCZ6ncoHZ"],
["Hail of Thorns", "Compendium.chris-premades.CPRSpells.Item.rErAGgcnd4kZ0C65"],
["Healing Spirit", "Compendium.chris-premades.CPRSpells.Item.tZuvHszxp0DNzOA0"],
["Heat Metal", "Compendium.chris-premades.CPRSpells.Item.xEQ5I9Z3QkCz9VB0"],
["Heroism", "Compendium.chris-premades.CPRSpells.Item.21XYYjQa7dUECFZo"],
["Hex", "Compendium.chris-premades.CPRSpells.Item.G2hV0TZsVZyLjC83"],
["Hold Person", "Compendium.chris-premades.CPRSpells.Item.hc3jHyU7Cxn4WCkT"],
["Holy Weapon", "Compendium.chris-premades.CPRSpells.Item.6ywyoJeO0noEFmJV"],
["Hunger of Hadar", "Compendium.chris-premades.CPRSpells.Item.5LFLXhtKKJtVN2Ha"],
["Hunter's Mark", "Compendium.chris-premades.CPRSpells.Item.0FaJBD2EfiBVGiYg"],
["Hypnotic Pattern", "Compendium.chris-premades.CPRSpells.Item.FAF67dWmHcz0IKRq"],
["Ice Storm", "Compendium.chris-premades.CPRSpells.Item.nJhRna7KmcI5KqZV"],
["Insect Plague", "Compendium.chris-premades.CPRSpells.Item.kZPWlxEb8pynXz3J"],
["Investiture of Flame", "Compendium.chris-premades.CPRSpells.Item.DIq2LjZcqJkUpqz5"],
["Investiture of Ice", "Compendium.chris-premades.CPRSpells.Item.WMmvgiCyG9OunCAm"],
["Investiture of Stone", "Compendium.chris-premades.CPRSpells.Item.VDEXvMHfoWT7XHRo"],
["Life Transference", "Compendium.chris-premades.CPRSpells.Item.BdC5osCaeYHFesTL"],
["Lightning Arrow", "Compendium.chris-premades.CPRSpells.Item.jOcDgy1HWZW8uDy6"],
["Lightning Lure", "Compendium.chris-premades.CPRSpells.Item.LcjMz6ITo2ESG9uy"],
["Magic Missile", "Compendium.chris-premades.CPRSpells.Item.89u3SA1lBLVdE4v7"],
["Mass Cure Wounds", "Compendium.chris-premades.CPRSpells.Item.HYjzRTurSqhTXSG1"],
["Maximilian's Earthen Grasp", "Compendium.chris-premades.CPRSpells.Item.kKKwLhnoTFRShrh1"],
["Melf's Acid Arrow", "Compendium.chris-premades.CPRSpells.Item.wmAPTO9QzUGSpLfH"],
["Mind Sliver", "Compendium.chris-premades.CPRSpells.Item.yifUefGRgr5GeG1m"],
["Mirror Image", "Compendium.chris-premades.CPRSpells.Item.W1tkIlyrXBeQL1kt"],
["Misty Step", "Compendium.chris-premades.CPRSpells.Item.SVAci8FYOO83jEQX"],
["Moonbeam", "Compendium.chris-premades.CPRSpells.Item.qWWH4jqLIEJD1jxd"],
["Pass without Trace", "Compendium.chris-premades.CPRSpells.Item.dzpUtyPpmW1rLJoi"],
["Protection from Evil and Good", "Compendium.chris-premades.CPRSpells.Item.LAjtSpMEyIDbeOct"],
["Raulothim's Psychic Lance", "Compendium.chris-premades.CPRSpells.Item.VNdKmyD4KJS5SpBH"],
["Ray of Enfeeblement", "Compendium.chris-premades.CPRSpells.Item.FULcUHg24L6ScSiv"],
["Rime's Binding Ice", "Compendium.chris-premades.CPRSpells.Item.vxc1eoyHDwvObOJ9"],
["Sanctuary", "Compendium.chris-premades.CPRSpells.Item.8acLWMMdfVkjaBSU"],
["Sapping Sting", "Compendium.chris-premades.CPRSpells.Item.fzd1vNjcyBMKEHmN"],
["Scorching Ray", "Compendium.chris-premades.CPRSpells.Item.UiVItoGxlMttoIU4"],
["Searing Smite", "Compendium.chris-premades.CPRSpells.Item.x4lkzaK3aDLLKFVg"],
["Shadow Blade", "Compendium.chris-premades.CPRSpells.Item.VCiJamBboU1RhJDD"],
["Shadow of Moil", "Compendium.chris-premades.CPRSpells.Item.6KMnRNiTHBW0fSDJ"],
["Shield", "Compendium.chris-premades.CPRSpells.Item.RpVLINL74RjPDkC4"],
["Shield of Faith", "Compendium.chris-premades.CPRSpells.Item.8ZsFXsPW3OVzYblM"],
["Shocking Grasp", "Compendium.chris-premades.CPRSpells.Item.HRo4kvKDfVoyQRDc"],
["Sickening Radiance", "Compendium.chris-premades.CPRSpells.Item.aUTbQTjDNAVZOZik"],
["Skill Empowerment", "Compendium.chris-premades.CPRSpells.Item.8v2wUjwtjHglTKda"],
["Sleet Storm", "Compendium.chris-premades.CPRSpells.Item.PCjGh4zb1kqlrTMO"],
["Spike Growth", "Compendium.chris-premades.CPRSpells.Item.LGYL8CVUiNcjbSzv"],
["Spirit Guardians", "Compendium.chris-premades.CPRSpells.Item.7yEepW2kGjbqe2pZ"],
["Spirit Shroud", "Compendium.chris-premades.CPRSpells.Item.lV39PQrao61fX2sS"],
["Spirit of Death", "Compendium.chris-premades.CPRSpells.Item.x0CpEasFp119IM0r"],
["Spiritual Weapon", "Compendium.chris-premades.CPRSpells.Item.6GP6erx1ebGbLKPp"],
["Spray of Cards", "Compendium.chris-premades.CPRSpells.Item.repVGfFzjjI1q9ZQ"],
["Staggering Smite", "Compendium.chris-premades.CPRSpells.Item.G745yc1awAaRUtRd"],
["Storm Sphere", "Compendium.chris-premades.CPRSpells.Item.SUhdzoGBisYm0pEh"],
["Summon Aberration", "Compendium.chris-premades.CPRSpells.Item.0o5EafMpcFwcu0By"],
["Summon Beast", "Compendium.chris-premades.CPRSpells.Item.hiZsWiV3h3v9Kide"],
["Summon Celestial", "Compendium.chris-premades.CPRSpells.Item.vWXD5hBcN6GNmPFC"],
["Summon Construct", "Compendium.chris-premades.CPRSpells.Item.K5T63xAqH96zpwoE"],
["Summon Draconic Spirit", "Compendium.chris-premades.CPRSpells.Item.6a5fa9HTVc9wMJ9T"],
["Summon Elemental", "Compendium.chris-premades.CPRSpells.Item.sw9Pqsri2e5WaZqk"],
["Summon Fey", "Compendium.chris-premades.CPRSpells.Item.bBrn1kpnRUHEWELc"],
["Summon Fiend", "Compendium.chris-premades.CPRSpells.Item.7yNmgttCUGNuiUCi"],
["Summon Lesser Demons", "Compendium.chris-premades.CPRSpells.Item.rldAZm9ukGTUL8m0"],
["Summon Shadowspawn", "Compendium.chris-premades.CPRSpells.Item.L5mfZv0RVJIwYwYj"],
["Summon Undead", "Compendium.chris-premades.CPRSpells.Item.9RSiTw9PDawlc0cO"],
["Synaptic Static", "Compendium.chris-premades.CPRSpells.Item.Oz1AJVQmfEX21HsX"],
["Tasha's Caustic Brew", "Compendium.chris-premades.CPRSpells.Item.kFUuuwXH2cKOdO0e"],
["Tasha's Otherworldly Guise", "Compendium.chris-premades.CPRSpells.Item.NVC9TFWKM0wgrzhG"],
["Teleport", "Compendium.chris-premades.CPRSpells.Item.2DsqTWj7IaWScTsr"],
["Thorn Whip", "Compendium.chris-premades.CPRSpells.Item.ocg11KjbDAJSOPPR"],
["Thunder Step", "Compendium.chris-premades.CPRSpells.Item.C7MrT1NBhPVDY6Fk"],
["Thunderous Smite", "Compendium.chris-premades.CPRSpells.Item.YsMKEjLC1IfgJh5i"],
["Thunderwave", "Compendium.chris-premades.CPRSpells.Item.WO5OsYrHj4b4Ez3i"],
["Tidal Wave", "Compendium.chris-premades.CPRSpells.Item.88BDPjCotisXf8hD"],
["Toll the Dead", "Compendium.chris-premades.CPRSpells.Item.yvqhb6wItjU6avpd"],
["Vampiric Touch", "Compendium.chris-premades.CPRSpells.Item.mbRmjaNYiCUT76kw"],
["Vitriolic Sphere", "Compendium.chris-premades.CPRSpells.Item.FlTZPltgWbixJY0K"],
["Vortex Warp", "Compendium.chris-premades.CPRSpells.Item.PTrGIyuolcil7nTH"],
["Wall of Fire", "Compendium.chris-premades.CPRSpells.Item.5IIXDS9Dst0VK47X"],
["Warding Bond", "Compendium.chris-premades.CPRSpells.Item.Nq0I44ydzxwlIZ6U"],
["Wither and Bloom", "Compendium.chris-premades.CPRSpells.Item.afBNCnv6K92P9dnu"],
["Wrathful Smite", "Compendium.chris-premades.CPRSpells.Item.Ws601XkNBfMKTItW"],
["Zone of Truth", "Compendium.chris-premades.CPRSpells.Item.GkXfdPV4El36LrZQ"],
```

### §37 · `chris-premades.CPRSpells2024`（133 条） — chris-premades 2024 自动化法术
```text
["Acid Splash", "Compendium.chris-premades.CPRSpells2024.Item.kABj3kEI5zeoBFZK"],
["Aid", "Compendium.chris-premades.CPRSpells2024.Item.3hY9m43Q8V5Zq1ci"],
["Alter Self", "Compendium.chris-premades.CPRSpells2024.Item.VhWmo8YftyVrLPSo"],
["Animal Friendship", "Compendium.chris-premades.CPRSpells2024.Item.eb4Dv0U5D8FWf4WB"],
["Animal Messenger", "Compendium.chris-premades.CPRSpells2024.Item.vDNCVGOleRGyyeZG"],
["Animate Dead", "Compendium.chris-premades.CPRSpells2024.Item.UtGhgP9KtmnVAj2W"],
["Antilife Shell", "Compendium.chris-premades.CPRSpells2024.Item.5SA4FqtDhuSfyhgA"],
["Arcane Vigor", "Compendium.chris-premades.CPRSpells2024.Item.0c3ludPAeYqlacA7"],
["Armor of Agathys", "Compendium.chris-premades.CPRSpells2024.Item.PjuAKxlpM4l9zrbi"],
["Arms of Hadar", "Compendium.chris-premades.CPRSpells2024.Item.rg5xVNuJBms18YMz"],
["Aura of Life", "Compendium.chris-premades.CPRSpells2024.Item.ETr6cIyGNjqXDhC7"],
["Aura of Purity", "Compendium.chris-premades.CPRSpells2024.Item.beSW9YtSxSvmJkkI"],
["Aura of Vitality", "Compendium.chris-premades.CPRSpells2024.Item.t3Kxi97FTeHZLa1I"],
["Bane", "Compendium.chris-premades.CPRSpells2024.Item.OPXL5WsMjmqtr7wy"],
["Banishing Smite", "Compendium.chris-premades.CPRSpells2024.Item.AqrisuprlAAiHdJW"],
["Banishment", "Compendium.chris-premades.CPRSpells2024.Item.FRDM1w1P29eWChZl"],
["Barkskin", "Compendium.chris-premades.CPRSpells2024.Item.cAvhuDD120ifmdVs"],
["Beacon of Hope", "Compendium.chris-premades.CPRSpells2024.Item.nHYjBLU9wB2QGTBC"],
["Bestow Curse", "Compendium.chris-premades.CPRSpells2024.Item.E3iKd6QczqJIRwJg"],
["Blade Ward", "Compendium.chris-premades.CPRSpells2024.Item.r1MLGWtfVPTVFBNt"],
["Bless", "Compendium.chris-premades.CPRSpells2024.Item.LVqLNYC2b1hX2hPJ"],
["Blight", "Compendium.chris-premades.CPRSpells2024.Item.A5q5m5KFFTD3OsPM"],
["Blinding Smite", "Compendium.chris-premades.CPRSpells2024.Item.Zz7Xj9mjog401VND"],
["Blindness/Deafness", "Compendium.chris-premades.CPRSpells2024.Item.PivGn3NQOAEkKOw8"],
["Blink", "Compendium.chris-premades.CPRSpells2024.Item.uk9mCwURvCX5zfQz"],
["Blur", "Compendium.chris-premades.CPRSpells2024.Item.wNW04yuVZ9Xagq5g"],
["Burning Hands", "Compendium.chris-premades.CPRSpells2024.Item.pr9OSdcpIfvViafp"],
["Cacophonic Shield", "Compendium.chris-premades.CPRSpells2024.Item.IOIMWWzNZny6v6Ze"],
["Call Lightning", "Compendium.chris-premades.CPRSpells2024.Item.WEr4WxCuiOKHX0oh"],
["Calm Emotions", "Compendium.chris-premades.CPRSpells2024.Item.f5dneWsWWR6YfbCI"],
["Chain Lightning", "Compendium.chris-premades.CPRSpells2024.Item.nzQAShj8ndmF2KI3"],
["Charm Monster", "Compendium.chris-premades.CPRSpells2024.Item.s8AYToUXwpA1cnIz"],
["Charm Person", "Compendium.chris-premades.CPRSpells2024.Item.zHaAWVlE6hB7camF"],
["Chill Touch", "Compendium.chris-premades.CPRSpells2024.Item.QDB74gRSJw3eiAth"],
["Chromatic Orb", "Compendium.chris-premades.CPRSpells2024.Item.SKmdptVk68FhWjM3"],
["Circle of Death", "Compendium.chris-premades.CPRSpells2024.Item.XoB7jhX26drrntBC"],
["Cloudkill", "Compendium.chris-premades.CPRSpells2024.Item.V7uGCnR6qIVqA6JZ"],
["Command", "Compendium.chris-premades.CPRSpells2024.Item.mKFv2wJLCSLzY2IG"],
["Compelled Duel", "Compendium.chris-premades.CPRSpells2024.Item.EkzkGFHAQL86Ec0M"],
["Conjure Animals", "Compendium.chris-premades.CPRSpells2024.Item.KBF8V5LGo2hygVBD"],
["Conjure Celestial", "Compendium.chris-premades.CPRSpells2024.Item.AeJR4YgBbZ5b9joY"],
["Conjure Fey", "Compendium.chris-premades.CPRSpells2024.Item.TKfmnitWbz3jgwwZ"],
["Conjure Minor Elementals", "Compendium.chris-premades.CPRSpells2024.Item.WgTOjn5iVSRy1pkh"],
["Conjure Woodland Beings", "Compendium.chris-premades.CPRSpells2024.Item.q3EnqXOwQzhsjXDU"],
["Crown of Madness", "Compendium.chris-premades.CPRSpells2024.Item.3jCuuiMvtGrzmMYz"],
["Crusader's Mantle", "Compendium.chris-premades.CPRSpells2024.Item.rTllkWMxnuGbfrLV"],
["Darkness", "Compendium.chris-premades.CPRSpells2024.Item.LU6P6r1fW52d2B1i"],
["Death Ward", "Compendium.chris-premades.CPRSpells2024.Item.HMD42mzSA7svwpw4"],
["Destructive Wave", "Compendium.chris-premades.CPRSpells2024.Item.aJtGlHwxODWlWGwI"],
["Detect Magic", "Compendium.chris-premades.CPRSpells2024.Item.nuc4fPAw5sX2H8kr"],
["Disintegrate", "Compendium.chris-premades.CPRSpells2024.Item.295oEbbUEP9CGfGm"],
["Divine Smite", "Compendium.chris-premades.CPRSpells2024.Item.HRdgTlmeuTclVROE"],
["Dragon's Breath", "Compendium.chris-premades.CPRSpells2024.Item.GxN22bmGnEDO6Rt9"],
["Dream", "Compendium.chris-premades.CPRSpells2024.Item.jmKbcq5Q3UDCDSTq"],
["Eldritch Blast", "Compendium.chris-premades.CPRSpells2024.Item.GIWWhOqWKRVbotF0"],
["Elemental Weapon", "Compendium.chris-premades.CPRSpells2024.Item.UVtWUtISe5p6TVZ9"],
["Enlarge/Reduce", "Compendium.chris-premades.CPRSpells2024.Item.5OjqPevPkxM3caRe"],
["Faerie Fire", "Compendium.chris-premades.CPRSpells2024.Item.3t8dxFste4EUphnI"],
["False Life", "Compendium.chris-premades.CPRSpells2024.Item.p8ISe5gUYYQP4qgM"],
["Find Familiar", "Compendium.chris-premades.CPRSpells2024.Item.GdV7YAgzesdeuxOY"],
["Fire Shield", "Compendium.chris-premades.CPRSpells2024.Item.WiFTWBHC4xTzkJ2i"],
["Fire Storm", "Compendium.chris-premades.CPRSpells2024.Item.CmKRaOP0e1L1RPi8"],
["Flame Blade", "Compendium.chris-premades.CPRSpells2024.Item.Vgets2smltLTIHTl"],
["Flaming Sphere", "Compendium.chris-premades.CPRSpells2024.Item.ssPKgcMfmLz0JztX"],
["Fly", "Compendium.chris-premades.CPRSpells2024.Item.zmvWN8MZr90BHHvd"],
["Fog Cloud", "Compendium.chris-premades.CPRSpells2024.Item.6WhWgBSO5NxxJaJB"],
["Gaseous Form", "Compendium.chris-premades.CPRSpells2024.Item.FHc5vFcpo3OVMIj9"],
["Globe of Invulnerability", "Compendium.chris-premades.CPRSpells2024.Item.yygr51CmRheM7RTC"],
["Grease", "Compendium.chris-premades.CPRSpells2024.Item.6tJJpvWH56Hq45i9"],
["Guardian of Faith", "Compendium.chris-premades.CPRSpells2024.Item.t1ET3JzcvHhLnHPU"],
["Guidance", "Compendium.chris-premades.CPRSpells2024.Item.mqHe92fMZixoEZJu"],
["Guiding Bolt", "Compendium.chris-premades.CPRSpells2024.Item.q8m4PLylGaSWiGlX"],
["Gust of Wind", "Compendium.chris-premades.CPRSpells2024.Item.jDhXYksO5uBtWSWw"],
["Heat Metal", "Compendium.chris-premades.CPRSpells2024.Item.u6ZsBwBybLYGLc4Q"],
["Heroism", "Compendium.chris-premades.CPRSpells2024.Item.DK3IlS7LpY5nbtFd"],
["Hex", "Compendium.chris-premades.CPRSpells2024.Item.wDeKgwoaBUTupxUl"],
["Hold Person", "Compendium.chris-premades.CPRSpells2024.Item.qF1ZugZRSB3pK6Zv"],
["Hunger of Hadar", "Compendium.chris-premades.CPRSpells2024.Item.jX0TbdULDigW3FuJ"],
["Hunter's Mark", "Compendium.chris-premades.CPRSpells2024.Item.6CSEfZqZzUdUG88Q"],
["Hypnotic Pattern", "Compendium.chris-premades.CPRSpells2024.Item.yGiPfUoUHZCpzfnZ"],
["Ice Storm", "Compendium.chris-premades.CPRSpells2024.Item.RjnE1e3OdpNhFb7k"],
["Insect Plague", "Compendium.chris-premades.CPRSpells2024.Item.Pm9wRNdaXuy1OTEb"],
["Mage Hand", "Compendium.chris-premades.CPRSpells2024.Item.jbdzzXqBWpIJFOCl"],
["Magic Missile", "Compendium.chris-premades.CPRSpells2024.Item.7ogMag9zkOqfjt2p"],
["Mass Cure Wounds", "Compendium.chris-premades.CPRSpells2024.Item.kPC9HqhQrEVXFAEU"],
["Melf's Acid Arrow", "Compendium.chris-premades.CPRSpells2024.Item.YYTDJVU8zexhvxMS"],
["Mind Sliver", "Compendium.chris-premades.CPRSpells2024.Item.TeMWcejb1ripRret"],
["Mirror Image", "Compendium.chris-premades.CPRSpells2024.Item.kkMkwHuCaPopj6lM"],
["Misty Step", "Compendium.chris-premades.CPRSpells2024.Item.wSqfN94GpKMI23FN"],
["Moonbeam", "Compendium.chris-premades.CPRSpells2024.Item.z92oDaB1tWGoASy3"],
["Pass without Trace", "Compendium.chris-premades.CPRSpells2024.Item.V5QNqnbFOnETCn9I"],
["Power Word Heal", "Compendium.chris-premades.CPRSpells2024.Item.iJdwzVKzGMbOuXmD"],
["Power Word Kill", "Compendium.chris-premades.CPRSpells2024.Item.wY0DhFVenhHICB8F"],
["Protection from Evil and Good", "Compendium.chris-premades.CPRSpells2024.Item.YLdLnvBtK8ksdXgd"],
["Resistance", "Compendium.chris-premades.CPRSpells2024.Item.n0FsWetF8dXlme2l"],
["Sanctuary", "Compendium.chris-premades.CPRSpells2024.Item.GyQ96fotef4enSO7"],
["Scorching Ray", "Compendium.chris-premades.CPRSpells2024.Item.b5QjV4tsv31a9vmL"],
["Searing Smite", "Compendium.chris-premades.CPRSpells2024.Item.3gaZzwNC57xmEO6K"],
["Shield", "Compendium.chris-premades.CPRSpells2024.Item.8LtjGzixLl1GvrEj"],
["Shield of Faith", "Compendium.chris-premades.CPRSpells2024.Item.XA5iQjOCcNJ8REE7"],
["Shining Smite", "Compendium.chris-premades.CPRSpells2024.Item.4N3giP0alIZDP5U7"],
["Shocking Grasp", "Compendium.chris-premades.CPRSpells2024.Item.3jA1NVRrYHqGGN9R"],
["Sleet Storm", "Compendium.chris-premades.CPRSpells2024.Item.8QPh6sLXEBP9oVT1"],
["Spellfire Flare", "Compendium.chris-premades.CPRSpells2024.Item.nY8v7uVD3GM2qgWG"],
["Spike Growth", "Compendium.chris-premades.CPRSpells2024.Item.aqwASYbBOqJCioG8"],
["Spirit Guardians", "Compendium.chris-premades.CPRSpells2024.Item.1Z3tR4yDPjQDHxbM"],
["Spiritual Weapon", "Compendium.chris-premades.CPRSpells2024.Item.Fq5v1j8GJf4WPEQk"],
["Staggering Smite", "Compendium.chris-premades.CPRSpells2024.Item.pWhk7JxUZQJWJpkk"],
["Steel Wind Strike", "Compendium.chris-premades.CPRSpells2024.Item.TCek7fsmIWt7A3mD"],
["Summon Aberration", "Compendium.chris-premades.CPRSpells2024.Item.PxQLTkGBdU7VQxxv"],
["Summon Beast", "Compendium.chris-premades.CPRSpells2024.Item.Jx8b4efe4BCZrby9"],
["Summon Celestial", "Compendium.chris-premades.CPRSpells2024.Item.AyKhLnj4OnXA46Mr"],
["Summon Construct", "Compendium.chris-premades.CPRSpells2024.Item.9hSq5MxHKwt4sxH7"],
["Summon Dragon", "Compendium.chris-premades.CPRSpells2024.Item.L4K47zMyxumTGTg7"],
["Summon Elemental", "Compendium.chris-premades.CPRSpells2024.Item.h17uAH1x4EQ0fVlX"],
["Summon Fey", "Compendium.chris-premades.CPRSpells2024.Item.LJzohmR8kZJq63FE"],
["Summon Fiend", "Compendium.chris-premades.CPRSpells2024.Item.CB0hTwilr557jN45"],
["Summon Undead", "Compendium.chris-premades.CPRSpells2024.Item.C9AVd6ktCWd4matT"],
["Synaptic Static", "Compendium.chris-premades.CPRSpells2024.Item.XAgWwMAi1giFHnzX"],
["Teleport", "Compendium.chris-premades.CPRSpells2024.Item.VQccat2Qmm3NpiyG"],
["Thorn Whip", "Compendium.chris-premades.CPRSpells2024.Item.HAUzYzrkcbifhM0P"],
["Thunderous Smite", "Compendium.chris-premades.CPRSpells2024.Item.vpUJ0FpXiaJfKzX1"],
["Thunderwave", "Compendium.chris-premades.CPRSpells2024.Item.bJAJgXCpLhN3JFER"],
["Time Stop", "Compendium.chris-premades.CPRSpells2024.Item.RyxxQzcIWWOGD0VQ"],
["Toll the Dead", "Compendium.chris-premades.CPRSpells2024.Item.ZP4AYkp8jKluNXCZ"],
["True Strike", "Compendium.chris-premades.CPRSpells2024.Item.qRXJYyQXej8O6EJ9"],
["Vampiric Touch", "Compendium.chris-premades.CPRSpells2024.Item.6ZnoNAyw39RH0w9K"],
["Vitriolic Sphere", "Compendium.chris-premades.CPRSpells2024.Item.Dy9Ye5uVIIDVZfC7"],
["Wall of Fire", "Compendium.chris-premades.CPRSpells2024.Item.hT6dOAd3hk0NPgiE"],
["Warding Bond", "Compendium.chris-premades.CPRSpells2024.Item.9hoDcPal5ONreoSf"],
["Wish", "Compendium.chris-premades.CPRSpells2024.Item.a8sTx0QQxlVohhuL"],
["Wrathful Smite", "Compendium.chris-premades.CPRSpells2024.Item.yqZqt2OBh48dR7Jf"],
["Zone of Truth", "Compendium.chris-premades.CPRSpells2024.Item.DVJF4dPyVRt4X9qt"],
```

### §37 · `chris-premades.CPRThirdPartySpells2024`（5 条） — chris-premades 第三方·2024
```text
["Blood Sacrifice", "Compendium.chris-premades.CPRThirdPartySpells2024.Item.RG5m7bgg8v1U0cR7"],
["Dissolution", "Compendium.chris-premades.CPRThirdPartySpells2024.Item.juChJim7p0s512tL"],
["Forest Guard", "Compendium.chris-premades.CPRThirdPartySpells2024.Item.YdjhN9yA6zyegRBH"],
["Sprout Foliage", "Compendium.chris-premades.CPRThirdPartySpells2024.Item.bfsBqa24iLaeT8DJ"],
["Wilting Smite", "Compendium.chris-premades.CPRThirdPartySpells2024.Item.IFEjs0FoNFS13Moh"],
```

### §37 · `chris-premades.CPRThirdPartySpells`（2 条） — chris-premades 第三方
```text
["Darkbolt", "Compendium.chris-premades.CPRThirdPartySpells.Item.QDswIqiFwQPsSO4p"],
["Veil of Dusk", "Compendium.chris-premades.CPRThirdPartySpells.Item.ypXv9MQMlC1Wpnzb"],
```

### §37 · `chris-premades.CPRItemFeatures`（1 条） — chris-premades 物品特性
```text
["Crimson Mist", "Compendium.chris-premades.CPRItemFeatures.Item.PiJLxf8PGhwYewd4"],
```

### §37 · `gambits-premades.gps-spells`（43 条） — gambits 自动化法术
```text
["Ashardalon's Stride", "Compendium.gambits-premades.gps-spells.Item.b4aKzkjuc43SDZxH"],
["Black Tentacles", "Compendium.gambits-premades.gps-spells.Item.b51TjlOij5U4490N"],
["Cause Fear", "Compendium.gambits-premades.gps-spells.Item.jrfU4qVqkBaEby1m"],
["Circle of Power", "Compendium.gambits-premades.gps-spells.Item.f5K18wOjvdx0vBQU"],
["Cloud of Daggers", "Compendium.gambits-premades.gps-spells.Item.0Gz9aO3EhQHVE6MV"],
["Command", "Compendium.gambits-premades.gps-spells.Item.H0gH5b7yt7Teo3hh"],
["Confusion", "Compendium.gambits-premades.gps-spells.Item.p2Hld67kdUYmlJKm"],
["Counterspell", "Compendium.gambits-premades.gps-spells.Item.NrZ0NLsWWFECkAiT"],
["Dimension Door", "Compendium.gambits-premades.gps-spells.Item.Vz5F4stiHajSm7NY"],
["Dissonant Whispers", "Compendium.gambits-premades.gps-spells.Item.lwpVLaytuLECDkYP"],
["Enemies Abound", "Compendium.gambits-premades.gps-spells.Item.pqtD79Rxet5ixIk2"],
["Enervation", "Compendium.gambits-premades.gps-spells.Item.zArPg7AlzWVW60Pd"],
["Entangle", "Compendium.gambits-premades.gps-spells.Item.1p4ZPVQTEVn7Aswx"],
["Fireball", "Compendium.gambits-premades.gps-spells.Item.GRSLd7PoNnRsXi1s"],
["Fizban's Platinum Shield", "Compendium.gambits-premades.gps-spells.Item.LTxLuJCxthHdlopJ"],
["Foresight", "Compendium.gambits-premades.gps-spells.Item.xeTgIuRWB3fR2mTu"],
["Fortune's Favour", "Compendium.gambits-premades.gps-spells.Item.aBmiR2Gn36tshCLK"],
["Freedom of Movement", "Compendium.gambits-premades.gps-spells.Item.mJyWiMZBCfY5PVMv"],
["Hellish Rebuke", "Compendium.gambits-premades.gps-spells.Item.3pIrA3YFHjZxnVkj"],
["Heroes' Feast", "Compendium.gambits-premades.gps-spells.Item.s7T3zuwpLEFzDQMx"],
["Hideous Laughter", "Compendium.gambits-premades.gps-spells.Item.0egCyhfiZhXnu2gz"],
["Holy Aura", "Compendium.gambits-premades.gps-spells.Item.sI3nFbNebL8C4pYC"],
["Ice Knife", "Compendium.gambits-premades.gps-spells.Item.KXy2QS5PX3krDHRZ"],
["Identify", "Compendium.gambits-premades.gps-spells.Item.Z5SH6Ds8iVagW225"],
["Infestation", "Compendium.gambits-premades.gps-spells.Item.GGjHiIlToe5js1uK"],
["Intellect Fortress", "Compendium.gambits-premades.gps-spells.Item.DEJrLlbplsT2KW8N"],
["Jump", "Compendium.gambits-premades.gps-spells.Item.8xaE6NjMvOnXSP8c"],
["Kinetic Jaunt", "Compendium.gambits-premades.gps-spells.Item.ByAHIAzdyr6ICq4k"],
["Light", "Compendium.gambits-premades.gps-spells.Item.WWQhRmbUYiVK44OB"],
["Mental Prison", "Compendium.gambits-premades.gps-spells.Item.rlrfM6muqv1HaFa9"],
["Motivational Speech", "Compendium.gambits-premades.gps-spells.Item.YKDseqsSmfuayOrX"],
["Phantasmal Killer", "Compendium.gambits-premades.gps-spells.Item.bUG2JJxbThnm9Uq3"],
["Power Word Heal", "Compendium.gambits-premades.gps-spells.Item.loYYSNKoISm2Gdkl"],
["Power Word Pain", "Compendium.gambits-premades.gps-spells.Item.FTEcSCtUZs0M1z9p"],
["Power Word Stun", "Compendium.gambits-premades.gps-spells.Item.QuYjryGrsYLd2yQD"],
["Ray of Sickness", "Compendium.gambits-premades.gps-spells.Item.dTmckL8aGMJ3nLqp"],
["Scatter", "Compendium.gambits-premades.gps-spells.Item.ZvJuVEDERncjdJrX"],
["Silvery Barbs", "Compendium.gambits-premades.gps-spells.Item.sqPja7ODbTOufLK9"],
["Stinking Cloud", "Compendium.gambits-premades.gps-spells.Item.LW4FED2CV3tFPnfe"],
["Temporal Shunt", "Compendium.gambits-premades.gps-spells.Item.nWMHG3NrwtqX7bHK"],
["Vicious Mockery", "Compendium.gambits-premades.gps-spells.Item.U4l3rrgk0ywcAkPm"],
["Web", "Compendium.gambits-premades.gps-spells.Item.6fotsSAlOL1ugQ9O"],
["Zephyr Strike", "Compendium.gambits-premades.gps-spells.Item.5IvSD4bkMwt5yfJy"],
```

### §37 · `gambits-premades.gps-spells-2024`（26 条） — gambits 自动化法术·2024
```text
["Black Tentacles", "Compendium.gambits-premades.gps-spells-2024.Item.uqWiaUp7GPJWiHMv"],
["Cloud of Daggers", "Compendium.gambits-premades.gps-spells-2024.Item.K4nbHdBY6TFtz94Y"],
["Command", "Compendium.gambits-premades.gps-spells-2024.Item.oCpuRWsUqMv69QdH"],
["Confusion", "Compendium.gambits-premades.gps-spells-2024.Item.wM9lSybW7BSAYta3"],
["Counterspell", "Compendium.gambits-premades.gps-spells-2024.Item.0joqoEE6UCYOW2Lt"],
["Dimension Door", "Compendium.gambits-premades.gps-spells-2024.Item.nh9KT6o80odnTxsS"],
["Dissonant Whispers", "Compendium.gambits-premades.gps-spells-2024.Item.MkGc3AFX2bOAJJtd"],
["Entangle", "Compendium.gambits-premades.gps-spells-2024.Item.DazxzlFrf2zXqADd"],
["Fireball", "Compendium.gambits-premades.gps-spells-2024.Item.28jMabet1GpDlIn4"],
["Foresight", "Compendium.gambits-premades.gps-spells-2024.Item.WhZ5Dx4xAlsXwN8d"],
["Freedom of Movement", "Compendium.gambits-premades.gps-spells-2024.Item.IclafHfG2VEsAe7O"],
["Hellish Rebuke", "Compendium.gambits-premades.gps-spells-2024.Item.mSw2KdZIGIY7cNJa"],
["Heroes' Feast", "Compendium.gambits-premades.gps-spells-2024.Item.hr7lp9WPTLzmV6zu"],
["Hideous Laughter", "Compendium.gambits-premades.gps-spells-2024.Item.kVfbU1w51rBuB3Pd"],
["Holy Aura", "Compendium.gambits-premades.gps-spells-2024.Item.szLjLQRn7ERricTz"],
["Ice Knife", "Compendium.gambits-premades.gps-spells-2024.Item.th9CaWOPw14iUQCl"],
["Identify", "Compendium.gambits-premades.gps-spells-2024.Item.lnkeOMJi3urtJSMz"],
["Light", "Compendium.gambits-premades.gps-spells-2024.Item.G2cfPA682lTPr8Zx"],
["Phantasmal Killer", "Compendium.gambits-premades.gps-spells-2024.Item.fRlsDsNXVyFszwPQ"],
["Power Word Heal", "Compendium.gambits-premades.gps-spells-2024.Item.0ezF0sdYIvGT2aq7"],
["Power Word Stun", "Compendium.gambits-premades.gps-spells-2024.Item.xw0rKHjHsjn4zl5h"],
["Ray of Sickness", "Compendium.gambits-premades.gps-spells-2024.Item.vz9Sl4eYk7BtUh2L"],
["Sleep", "Compendium.gambits-premades.gps-spells-2024.Item.nqi4SCtZKIvLk5Rd"],
["Stinking Cloud", "Compendium.gambits-premades.gps-spells-2024.Item.cYrgFDHXoGG97NGX"],
["Vicious Mockery", "Compendium.gambits-premades.gps-spells-2024.Item.gJf7O7xANUQYObGx"],
["Web", "Compendium.gambits-premades.gps-spells-2024.Item.5LGKYn2BWYTfbL8Z"],
```

### §37 · `gambits-premades.gps-3rd-party-spells`（23 条） — gambits 第三方法术
```text
["Biohazard", "Compendium.gambits-premades.gps-3rd-party-spells.Item.oKP2OqXi1gP3icCa"],
["Cecily’s Stormshot", "Compendium.gambits-premades.gps-3rd-party-spells.Item.j4GXP48dmpK487qo"],
["Cloak of Vermin", "Compendium.gambits-premades.gps-3rd-party-spells.Item.T880eXMSbSsHnxLx"],
["Contagious Healing", "Compendium.gambits-premades.gps-3rd-party-spells.Item.WGKG4HlYIWFNhVMO"],
["Dead Mist Lash", "Compendium.gambits-premades.gps-3rd-party-spells.Item.vAOwFP1SJBEvpFHX"],
["Drayfn’s Bane of Excellence", "Compendium.gambits-premades.gps-3rd-party-spells.Item.F9e121MhU4llxGyT"],
["Dream Shear", "Compendium.gambits-premades.gps-3rd-party-spells.Item.eXuzJWvb1n2Wvrjh"],
["Electric Eels", "Compendium.gambits-premades.gps-3rd-party-spells.Item.znMMm7q7iRlXWWnO"],
["Emotional Gamut", "Compendium.gambits-premades.gps-3rd-party-spells.Item.zsvefRqm90SEuIic"],
["Festering Fever", "Compendium.gambits-premades.gps-3rd-party-spells.Item.GqeDCrvZxpHJHuLO"],
["Gravity Well", "Compendium.gambits-premades.gps-3rd-party-spells.Item.78ellXr9PfciD7JN"],
["Grim Siphon", "Compendium.gambits-premades.gps-3rd-party-spells.Item.TeONoIQRP8IzePz3"],
["Healing Glyph", "Compendium.gambits-premades.gps-3rd-party-spells.Item.10NaF6o9vp9CZ6Q9"],
["Leiloch’s Interminable Yarn", "Compendium.gambits-premades.gps-3rd-party-spells.Item.wocgVbiYDe6ghSMn"],
["Memento Mori", "Compendium.gambits-premades.gps-3rd-party-spells.Item.nZ1BaCElvMKYCgXj"],
["Ominous Shadow", "Compendium.gambits-premades.gps-3rd-party-spells.Item.vtqlE2dhGGC5SVMQ"],
["Power Word Rebound", "Compendium.gambits-premades.gps-3rd-party-spells.Item.5eJLg9gnYJe3mq8F"],
["Shroom of Doom", "Compendium.gambits-premades.gps-3rd-party-spells.Item.CtkWDZZjzQBH19Sm"],
["Skeletal Tail", "Compendium.gambits-premades.gps-3rd-party-spells.Item.ZNpTrEiiqvJFpAUz"],
["Smolder", "Compendium.gambits-premades.gps-3rd-party-spells.Item.DMbWJuA83dZ1ilyX"],
["Spirit Balm", "Compendium.gambits-premades.gps-3rd-party-spells.Item.7lkAfOSVCDWeZe22"],
["Storm Mote", "Compendium.gambits-premades.gps-3rd-party-spells.Item.EKmXvjaUgx5JU1ND"],
["Toxic Shield", "Compendium.gambits-premades.gps-3rd-party-spells.Item.OYyZKc0Knk7fnEgX"],
```

### §37 · `gambits-premades.gps-homebrew-spells`（1 条） — gambits 自创法术
```text
["Mind Blast", "Compendium.gambits-premades.gps-homebrew-spells.Item.Oc2Fl4SwU4VxEFrH"],
```

### §37 · `dlkhm-spell-tools-item.dlkhmspell`（54 条） — dlkhm 法术工具
```text
["下毒术Envenom", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.rM29XqELKrTXu7pf"],
["中和场域 Neutralizing Field", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.qVnMAUx7uO70hiBS"],
["召唤摇头摆尾的家伙Summon the Thing with the Writhing Tail", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.AAjpDZRudTMiB99E"],
["夜影吐息Breath of Nightshade", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.uGNdH2QnvrFUaGZD"],
["大瘟疫Pandemic", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.2NfdAltdklBX2eA7"],
["尸爆Corpse Explosion", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.jCSgaUYwz7djdGbj"],
["强酸球 Acid Orb", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.duqbTX4ZFxVssZHt"],
["恶性坏死Vile Necrosis", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.FPxuyUpusVULqXo9"],
["恶毒剑Fetid Blade", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.T7vpGRPg1Qyjy3FN"],
["恶毒灵光Venomous Aura", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.FsWRJ9QbbTfftVak"],
["恶臭蒸汽Mephitic Vapors", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.WpE24QhTNejxvk2d"],
["感染术Infect", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.aVUHqWTQ4wneojZ8"],
["擒拿鬼手Grasping Ghost", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.grgaKKJgE0ojeexZ"],
["极恶创伤Grievous Wounds", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.w2J73HYPAkefUBAu"],
["死亡之触Touch of Death", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.useDfB8DajY6268n"],
["毒素护盾Toxic Shield", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.BgV6lwfD2nLOMMim"],
["毒药飞针Poison Needle", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.pumbvZhPHRywAGKW"],
["污染免疫 Contamination Immunity", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.doAUXB3JKjPiu2ex"],
["污染风暴Storm of Contamination", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.cZrXY8InCZZIPqpU"],
["污染：八虹光剑 Octarine Sword", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.kDiKSOqtxKgtbT63"],
["污染：匿于世界之隙Vanish to the Space Between Worlds", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.wWeqXk88pMinlKBQ"],
["污染：可控突变Controlled Mutation", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.UuN7keAcGhViqtS7"],
["污染：妄质元素召唤术Summon Delerium Elemental", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.G9A81KdXaXVb0sUO"],
["污染：妄质星爆Delerium Meteor Swarm", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.WD3XBZBlzzxxuqiB"],
["污染：彗星碎片Comet Shards", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.1hgQbmSNpFEkdFZ1"],
["污染：恐怖转变Horrific Transformation", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.8eCtHpVvCPaMeWuu"],
["污染：污染之手Contaminated Hands", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.CiKdmZUJMKREN898"],
["污染：编织古老图纹Weave the Elder Sign", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.m8GQnY5rvfqGPM6J"],
["污染：腐坏治疗Corrupted Cure", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.TLGvJ0GFp2di37I2"],
["污染：虹吸时间Siphon Time", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.9KmeNJJ6XBGWShDu"],
["污染：解除重力Unbind Gravity", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.ZFMNVKbRHLRVAq2L"],
["污染：逐于世界之隙Banish to the Space Between Worlds", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.lfP0Qv0UeMrqkuAK"],
["猛毒弹幕Toxic Barrage", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.qGxdcQkSY9N6ZFlQ"],
["猛毒波Poison Wave", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.uFeugM5vWmvSecKF"],
["生物危害Biohazard", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.Fsn6r6RQMnIeGQ34"],
["瘟疫术Pestilence", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.Z0fCiUJfi4Ss8Ouz"],
["瘟疫行风Plague Wind", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.KBaYIID9qG9BmyCI"],
["瘴气术Miasma", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.xzwuMYgH7z1uEmMb"],
["硫酸溢浆Vitriol Ichor", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.WWuD8Dl8feArKQ5F"],
["祛除污染 Purge Contamination", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.mnFTil3Kqmz7cBHj"],
["神经毒气Nerve Gas", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.xgQhBWqSrTAbQIjH"],
["精神焕发Invigorate", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.75cMY8NijUngQ75W"],
["细菌弹幕Bacterial Barrage", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.v5u3q3afVt6pdvQk"],
["终末仪式Last Rites", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.pt5HPWHLSNNS69jN"],
["肺痨湍流Stream of Consumption", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.0CQbvyI0cXACXIfs"],
["脓毒休克Septic Shock", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.mH1DiEOeIX3V9RtX"],
["腐坏孢子Corrupting Spores", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.1wf8r3UfddRkGJtU"],
["腐蚀之攥Caustic Grip", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.6Gajy5H4xDO3fVHo"],
["腐蚀爆裂Corrosive Blast", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.WCjCWfoDrj0Sgb8p"],
["裂眼术Ocular Necrosis", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.KJ1XQ6Dz317aVOIA"],
["酸蚀灼烧Acid Burn", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.F1EaIBRbG9TUhxSo"],
["酸雨术Acid Rain", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.0ggcxHKOj5s9g6Ls"],
["镇静毒素Tranquilizing Toxin", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.GGXXZZlsuokz66zV"],
["鲜血蠕虫Blood Worm", "Compendium.dlkhm-spell-tools-item.dlkhmspell.Item.54WyB0FRGCPUOht9"],
```

### §37 · `midi-item-showcase-community.misc-spells`（6 条） — MISC 社区法术
```text
["Crown of Stars", "Compendium.midi-item-showcase-community.misc-spells.Item.1A7im3YcJMO0OtRU"],
["Flame Arrows", "Compendium.midi-item-showcase-community.misc-spells.Item.ftgNWL4i9MmYBTn5"],
["Goodberry", "Compendium.midi-item-showcase-community.misc-spells.Item.HT3iNvnapuKIkVHy"],
["Negative Energy Flood", "Compendium.midi-item-showcase-community.misc-spells.Item.pCDV5X8NreuLkScf"],
["Produce Flame", "Compendium.midi-item-showcase-community.misc-spells.Item.drbcv6zGLRIOFBVN"],
["Tasha's Mind Whip", "Compendium.midi-item-showcase-community.misc-spells.Item.XtmgFO7YQv249UYp"],
```

### §37 · `midi-item-showcase-community.misc-spells-2024`（2 条） — MISC 社区法术·2024
```text
["Goodberry", "Compendium.midi-item-showcase-community.misc-spells-2024.Item.PDl672S4RI73v0WP"],
["Produce Flame", "Compendium.midi-item-showcase-community.misc-spells-2024.Item.sRr2wDcoVTw244Un"],
```

### §37 · `midi-item-showcase-community.misc-third-party`（1 条） — MISC 第三方
```text
["Spiny Shield", "Compendium.midi-item-showcase-community.misc-third-party.Item.Adw8BOzRJdjIH2V4"],
```

### §37 · `midi-qol.midiqol-sample-items`（44 条） — midi-qol 官方样例
```text
["Absorb Elements", "Compendium.midi-qol.midiqol-sample-items.Item.hbc8mhTMkQRZhqHS"],
["Acid Arrow", "Compendium.midi-qol.midiqol-sample-items.Item.pZBgzm2GEhD745VV"],
["Aura of Vitality", "Compendium.midi-qol.midiqol-sample-items.Item.E0EIO6qacu1z3RKs"],
["Banishment", "Compendium.midi-qol.midiqol-sample-items.Item.Y594kb8pSv6Q2d8R"],
["Befuddlement", "Compendium.midi-qol.midiqol-sample-items.Item.Befuddlement0000"],
["Branding Smite", "Compendium.midi-qol.midiqol-sample-items.Item.x1C4i0oA7cZCg1Pl"],
["Chill Touch", "Compendium.midi-qol.midiqol-sample-items.Item.SNhuBXUyQNl1X0pe"],
["Choose Blessing", "Compendium.midi-qol.midiqol-sample-items.Item.o3BiQo12if2yjgff"],
["Circle of Power", "Compendium.midi-qol.midiqol-sample-items.Item.Rl3Gvx6YK6oFPRbQ"],
["Delayed Blast Fireball", "Compendium.midi-qol.midiqol-sample-items.Item.DelayBlstFrball0"],
["Divine Smite", "Compendium.midi-qol.midiqol-sample-items.Item.Eb2MnoKGAh3XbgH9"],
["Divine Word", "Compendium.midi-qol.midiqol-sample-items.Item.DivineWord000000"],
["Eyebite", "Compendium.midi-qol.midiqol-sample-items.Item.EyebiteSpell0000"],
["Finger of Death", "Compendium.midi-qol.midiqol-sample-items.Item.FingerOfDeath000"],
["Flesh to Stone", "Compendium.midi-qol.midiqol-sample-items.Item.FleshToStone0000"],
["Foresight", "Compendium.midi-qol.midiqol-sample-items.Item.Foresight0000000"],
["Greater Invisibility", "Compendium.midi-qol.midiqol-sample-items.Item.nrvUid8zdhVAx8BB"],
["Guidance", "Compendium.midi-qol.midiqol-sample-items.Item.midiGuidance0000"],
["Harm", "Compendium.midi-qol.midiqol-sample-items.Item.HarmSpell0000000"],
["Hold Person", "Compendium.midi-qol.midiqol-sample-items.Item.fH3YVHeQyNcOQ3yP"],
["Hunter's Mark", "Compendium.midi-qol.midiqol-sample-items.Item.7jMEN36K5VvR3lxT"],
["Ice Knife", "Compendium.midi-qol.midiqol-sample-items.Item.0u9PqRJa5Qkkv9CC"],
["Imprisonment", "Compendium.midi-qol.midiqol-sample-items.Item.Imprisonment0000"],
["Invisibility", "Compendium.midi-qol.midiqol-sample-items.Item.NPEybW5XcLouBuFX"],
["Irresistible Dance", "Compendium.midi-qol.midiqol-sample-items.Item.IrresistDance000"],
["Mass Cure Wounds", "Compendium.midi-qol.midiqol-sample-items.Item.K2wjnJO3XS5g0Jlf"],
["Mass Heal", "Compendium.midi-qol.midiqol-sample-items.Item.MassHeal00000000"],
["Meteor Swarm", "Compendium.midi-qol.midiqol-sample-items.Item.MeteorSwarm00000"],
["Power Word Kill", "Compendium.midi-qol.midiqol-sample-items.Item.PowerWordKill000"],
["Power Word Stun", "Compendium.midi-qol.midiqol-sample-items.Item.J9FnAzEpUf9l0t6f"],
["Prismatic Spray", "Compendium.midi-qol.midiqol-sample-items.Item.PrismaticSpray00"],
["Regenerate", "Compendium.midi-qol.midiqol-sample-items.Item.Regenerate000000"],
["Reverse Gravity", "Compendium.midi-qol.midiqol-sample-items.Item.ReverseGravity00"],
["Shapechange", "Compendium.midi-qol.midiqol-sample-items.Item.Shapechange00000"],
["Shield", "Compendium.midi-qol.midiqol-sample-items.Item.Jx7qODRKPAwo6oFK"],
["Shining Smite", "Compendium.midi-qol.midiqol-sample-items.Item.ShiningSmite0000"],
["Spirit Guardians", "Compendium.midi-qol.midiqol-sample-items.Item.cQRmwQcPULIjCach"],
["Storm of Vengeance", "Compendium.midi-qol.midiqol-sample-items.Item.StormVengeance00"],
["Sunbeam", "Compendium.midi-qol.midiqol-sample-items.Item.SunbeamSpell0000"],
["Toll the Dead", "Compendium.midi-qol.midiqol-sample-items.Item.DGClDQQLcKrY2T2y"],
["True Polymorph", "Compendium.midi-qol.midiqol-sample-items.Item.TruePolymorph000"],
["True Resurrection", "Compendium.midi-qol.midiqol-sample-items.Item.TrueResurrect000"],
["Warding Bond", "Compendium.midi-qol.midiqol-sample-items.Item.INfoostPYhvVepHc"],
["Weird", "Compendium.midi-qol.midiqol-sample-items.Item.Weird00000000000"],
```

### §37 · `heliana-core.spells`（68 条） — Heliana 法术
```text
["不平等 Inequality", "Compendium.heliana-core.spells.Item.NHUOmUxPQBjQT6El"],
["偷天换日 Switcheroo", "Compendium.heliana-core.spells.Item.JCx4bYlJoAhLhP7b"],
["先攻 Initiative", "Compendium.heliana-core.spells.Item.Fob6UzLCKRfHDL3A"],
["内吸虫 Endoleech", "Compendium.heliana-core.spells.Item.eE0doyVNedGOrVXl"],
["凶猛打击 Ferocious Strike", "Compendium.heliana-core.spells.Item.WNKydUhLKbSUfmTv"],
["原初气息 Primal Scent", "Compendium.heliana-core.spells.Item.8XsLHZj4nqE8BdJp"],
["变色龙皮肤 Chameleon Skin", "Compendium.heliana-core.spells.Item.3hS7g0dyB7TxEbac"],
["咒唤异象 Conjure Anomaly", "Compendium.heliana-core.spells.Item.iqTRrkgV1Jueq89A"],
["图腾箭矢 Totem Arrows Totem Arrows", "Compendium.heliana-core.spells.Item.Xotu1dq4o2S2GAqe"],
["坚毅 Endure", "Compendium.heliana-core.spells.Item.fZiPMcpc0sMyc53A"],
["奥法磁斥 Arcanomagnetic Repulsion", "Compendium.heliana-core.spells.Item.w3DRqfTc9A25qLKP"],
["奥法磁暴 Arcanomagnetic Storm", "Compendium.heliana-core.spells.Item.SJBr55YmynD7XodE"],
["孢子云 Spore Cloud", "Compendium.heliana-core.spells.Item.rUEBPwA4Z2ugQwt4"],
["守护 Protection", "Compendium.heliana-core.spells.Item.NVXhbMSfeL20rfDB"],
["尖啸 Howl", "Compendium.heliana-core.spells.Item.2sh7zFG7hFjESMZo"],
["弯曲 The Bends", "Compendium.heliana-core.spells.Item.QVbvAKXRxJh1jF3C"],
["律令护盾 Power Word Shield", "Compendium.heliana-core.spells.Item.clo4aQGCuqLp9TtO"],
["恶臭 Stench", "Compendium.heliana-core.spells.Item.JVG1iSBAEUfEsJvz"],
["戏法 Cannotrip", "Compendium.heliana-core.spells.Item.7fLANMjZF2dg5Zvb"],
["戏法 Can’trip", "Compendium.heliana-core.spells.Item.Z9zDuUXMU7x61SkO"],
["护佑箴言 Shielding Word", "Compendium.heliana-core.spells.Item.vinyCakviJwkWSIH"],
["无法摔绊 Can’t Trip", "Compendium.heliana-core.spells.Item.sPbSSrDjIVhgbSVI"],
["机械魔法 Mechamagic", "Compendium.heliana-core.spells.Item.pz33GsewsT4gBWty"],
["梦游 Dreamwalk", "Compendium.heliana-core.spells.Item.Mh9KRMhYENVUGmz5"],
["水之长鞭 Water Whip", "Compendium.heliana-core.spells.Item.ayU45WdO2CU6Gv0U"],
["汉珀丁克的恶臭口气 Humperdink’s Halitosis", "Compendium.heliana-core.spells.Item.wutvKZX5JjmnEbMD"],
["污秽灵光 Aura of Impurity", "Compendium.heliana-core.spells.Item.rE4rl0TC3RyVaSKg"],
["泥浆球 Mireball", "Compendium.heliana-core.spells.Item.KRZqPNwbg8nVEZvo"],
["流感 Influenza", "Compendium.heliana-core.spells.Item.uY1r9GdSthzwTFfv"],
["深水冲锋 Depth Charge", "Compendium.heliana-core.spells.Item.55zAlZFvmvWOnk0z"],
["潜行者之眼 Stalker’s Eye", "Compendium.heliana-core.spells.Item.g4TH2ZvBF30OzfzV"],
["激怒 Enrage", "Compendium.heliana-core.spells.Item.1NaQOeGiOJyixRz6"],
["激流 Riptide", "Compendium.heliana-core.spells.Item.Er5smsXKIYO5Gkw4"],
["火花 Spark", "Compendium.heliana-core.spells.Item.VHMfmxlpDAun2oo2"],
["灵体 Incorporeality", "Compendium.heliana-core.spells.Item.Pzjr3uliw8r5ushv"],
["烟幕 Smokescreen", "Compendium.heliana-core.spells.Item.nevPmJFYRIBUrVwG"],
["热疫皮 Feverskin", "Compendium.heliana-core.spells.Item.1QS2m15NnsZXvlRP"],
["痛苦枷锁 Shackles of Pain", "Compendium.heliana-core.spells.Item.WakwViTKdMD6St6l"],
["白日梦 Daydream", "Compendium.heliana-core.spells.Item.iujuFJe89GUG72w2"],
["真菌感染 Fungal Infection", "Compendium.heliana-core.spells.Item.iTdcz4VSA6co8MiE"],
["磁力弹 Magnetobolt", "Compendium.heliana-core.spells.Item.3c0mKLGbpRSdoKSI"],
["磁铁矿碎片 Magnetite Shard", "Compendium.heliana-core.spells.Item.qv9JdFCOgavwz1nD"],
["糖分冲锋 Sugar Rush", "Compendium.heliana-core.spells.Item.v4G8JantRiTnEMFm"],
["织法扭曲 Weavebend", "Compendium.heliana-core.spells.Item.azg3ouEU4vU2wSCA"],
["维持 Preserve", "Compendium.heliana-core.spells.Item.VTllOou0Axd9DvrJ"],
["群体吸血 Mass Leech", "Compendium.heliana-core.spells.Item.PMMW3rwaCXVdfg16"],
["肺爆术 Lungburst", "Compendium.heliana-core.spells.Item.BRBJQzKtM6zjW024"],
["腐化脓液 Corrupting Ichor", "Compendium.heliana-core.spells.Item.CEOqe98njsk9Hvba"],
["致命脉动 Mortiferous Pulse", "Compendium.heliana-core.spells.Item.8uXEnEvpv5ECUVbO"],
["致盲强光 Blinding Radiance", "Compendium.heliana-core.spells.Item.74fj0MlRKjbDP8oy"],
["菲克西特 Fixit", "Compendium.heliana-core.spells.Item.hgJzgehnRZDO0wjS"],
["菲尔瑟之影 Firther’s Shadow", "Compendium.heliana-core.spells.Item.AtkZpad5GPUoFVYI"],
["薄荷板甲 Peppermint Plate", "Compendium.heliana-core.spells.Item.oFxZQRu9jcDFFYZN"],
["蛙皮 Frogskin", "Compendium.heliana-core.spells.Item.a7ymiJqLR9vo3kyr"],
["触手鞭笞 Tentacle Lash", "Compendium.heliana-core.spells.Item.s5f5OoRTVXLUmDug"],
["酸雨术 Acid Rain", "Compendium.heliana-core.spells.Item.5LcnNYno2cRdU4Z0"],
["重力斥力 Gravity Repulsion", "Compendium.heliana-core.spells.Item.CfiTVJRwUxFYcfdB"],
["重力粉碎 Gravity Smash", "Compendium.heliana-core.spells.Item.7hmhyHlC1gdjScTN"],
["针刺 Pins and Needles", "Compendium.heliana-core.spells.Item.uOvlYwbjt6zgw25Q"],
["闪光 Flare", "Compendium.heliana-core.spells.Item.liOgalNJ094VyhQ6"],
["闭嘴！ Zippit!", "Compendium.heliana-core.spells.Item.31GphTAUuhbv13xf"],
["集群 Swarm", "Compendium.heliana-core.spells.Item.b8EYbBfSOy6i4jP9"],
["震荡 Concussion", "Compendium.heliana-core.spells.Item.5NapHo3x3DWrAdL2"],
["饕餮之眠 Food Coma", "Compendium.heliana-core.spells.Item.LE5TEMag2ugpOKMj"],
["骨笼术 Bone Cage", "Compendium.heliana-core.spells.Item.Rta3Rh4XASy8Ogaa"],
["魔网纠缠 Weave Entanglement", "Compendium.heliana-core.spells.Item.RWq4vwd76YgpmGtn"],
["鳍肢形态 Flipperform", "Compendium.heliana-core.spells.Item.IsNST7IwyoRsNcEW"],
["鳗皮 Eelskin", "Compendium.heliana-core.spells.Item.yNDwJy6nMlIxoC27"],
```

### §37 · `dnd5e.spells`（319 条） — dnd5e 官方法术（2014）
```text
["七彩喷射 Color Spray", "Compendium.dnd5e.spells.Item.LWTUqKkUQdMAmOe0"],
["不灭明焰 Continual Flame", "Compendium.dnd5e.spells.Item.MK6gpQMeDFo0cP9f"],
["云雾术 Fog Cloud", "Compendium.dnd5e.spells.Item.IBJmWjzbQGu7M4UX"],
["以太化 Etherealness", "Compendium.dnd5e.spells.Item.PQuEgKyCdovOvhqN"],
["任意门 Dimension Door", "Compendium.dnd5e.spells.Item.A4RsPuSvB9wFtz1j"],
["传讯术 Message", "Compendium.dnd5e.spells.Item.icZokbgV1jIMpNCv"],
["传送术 Teleport", "Compendium.dnd5e.spells.Item.L4J89JXqbKs6puEV"],
["传送法阵 Teleportation Circle", "Compendium.dnd5e.spells.Item.8aWtP5hcrmcEesBW"],
["伪装术 Seeming", "Compendium.dnd5e.spells.Item.mbFw57uyfLkyiw5k"],
["位面转移 Plane Shift", "Compendium.dnd5e.spells.Item.J6Jpw5XzB5aTeqnz"],
["侦测善恶 Detect Evil and Good", "Compendium.dnd5e.spells.Item.Mzh95utKDPIrjiH8"],
["侦测思想 Detect Thoughts", "Compendium.dnd5e.spells.Item.ppWAAEul0QHtm4er"],
["侦测毒性和疾病 Detect Poison and Disease", "Compendium.dnd5e.spells.Item.2skfDtglk1mGrb3l"],
["侦测魔法 Detect Magic", "Compendium.dnd5e.spells.Item.ghXTfe7sgCbgf1Q8"],
["信仰守卫 Guardian of Faith", "Compendium.dnd5e.spells.Item.TgHsuhNasPbhu8MO"],
["修复术 Mending", "Compendium.dnd5e.spells.Item.kjmjY0zlE6IEiQVL"],
["假象术 Mislead", "Compendium.dnd5e.spells.Item.MBMaQLwoy05qzMJ3"],
["催眠图纹 Hypnotic Pattern", "Compendium.dnd5e.spells.Item.6g3WLOZ2u0EbaLAd"],
["光亮术 Light", "Compendium.dnd5e.spells.Item.Bnn9Nzajixvow9xi"],
["光导箭 Guiding Bolt", "Compendium.dnd5e.spells.Item.7buEm5KhI5lP8m1z"],
["克敌先击 True Strike", "Compendium.dnd5e.spells.Item.mGGlcLdggHwcL7MG"],
["克隆术 Clone", "Compendium.dnd5e.spells.Item.h830iyqParFleNqR"],
["再生术 Regenerate", "Compendium.dnd5e.spells.Item.9kGrFXnLiRg3Xnbo"],
["冰冻法球 Freezing Sphere", "Compendium.dnd5e.spells.Item.MImfWCzEPRMYD3Xp"],
["冰墙术 Wall of Ice", "Compendium.dnd5e.spells.Item.fzZnVKLmBMo2f5up"],
["冰风暴 Ice Storm", "Compendium.dnd5e.spells.Item.WN2LWEljYU6QqnRH"],
["冷冻射线 Ray of Frost", "Compendium.dnd5e.spells.Item.ctW81uiX56xZR2c5"],
["净化饮食 Purify Food and Drink", "Compendium.dnd5e.spells.Item.Kn7K5PtYUJAKZTTp"],
["剑刃护壁 Blade Barrier", "Compendium.dnd5e.spells.Item.dLJhxDfeyOsc3zsY"],
["力场墙 Wall of Force", "Compendium.dnd5e.spells.Item.o9ZCvuD2B1OTcubb"],
["力场监牢 Forcecage", "Compendium.dnd5e.spells.Item.Y7uWUO4yqUN0JKl0"],
["加速术 Haste", "Compendium.dnd5e.spells.Item.Szvk5FEVQW3uhJi5"],
["动植物定位术 Locate Animals or Plants", "Compendium.dnd5e.spells.Item.Iv2qqSAT7OkXKPFx"],
["动物交谈 Speak with Animals", "Compendium.dnd5e.spells.Item.aL1F8fvYLtNzUbKu"],
["动物信使 Animal Messenger", "Compendium.dnd5e.spells.Item.X8w9EzYLGc4vQ1H2"],
["动物形态 Animal Shapes", "Compendium.dnd5e.spells.Item.ohqAIBg6de989CIo"],
["化兽为友 Animal Friendship", "Compendium.dnd5e.spells.Item.hDOENzjuj5WpLq7B"],
["医疗术 Heal", "Compendium.dnd5e.spells.Item.qcYitWoSMTnKkzM1"],
["半位面 Demiplane", "Compendium.dnd5e.spells.Item.xNM9CzQQr2CieM4B"],
["卜筮术 Augury", "Compendium.dnd5e.spells.Item.4v2H3hHb3Ph9XLNd"],
["印记斩 Branding Smite", "Compendium.dnd5e.spells.Item.7UwUjJ6owIQkEPrs"],
["反转重力 Reverse Gravity", "Compendium.dnd5e.spells.Item.ERCv7yuRkQ0YjGx6"],
["反魔法场 Antimagic Field", "Compendium.dnd5e.spells.Item.Eon0jzGzQRNluTPQ"],
["变巨/缩小术 Enlarge/Reduce", "Compendium.dnd5e.spells.Item.WahI41a3goVUg0x1"],
["变形术 Polymorph", "Compendium.dnd5e.spells.Item.04nMsTWkIFvkbXlY"],
["变身术 Alter Self", "Compendium.dnd5e.spells.Item.8RTDOt80u8aBv9qx"],
["召雷术 Call Lightning", "Compendium.dnd5e.spells.Item.ehvmg9U9fcMEhE4z"],
["启蒙术 Awaken", "Compendium.dnd5e.spells.Item.MCEpGpvovcXagwQS"],
["吸血鬼之触 Vampiric Touch", "Compendium.dnd5e.spells.Item.UfHQhA54M4323gVO"],
["命令术 Command", "Compendium.dnd5e.spells.Item.arzCrMRgcNiQuh43"],
["咒唤元素 Conjure Elemental", "Compendium.dnd5e.spells.Item.1LkZvINag7KqBmDR"],
["咒唤兽群 Conjure Animals", "Compendium.dnd5e.spells.Item.1Drt0SHxbEAHxprN"],
["咒唤微元素群 Conjure Minor Elementals", "Compendium.dnd5e.spells.Item.KgEw3sDr39C6g8nY"],
["唤起亡灵 Create Undead", "Compendium.dnd5e.spells.Item.E4NXux0RHvME1XgP"],
["回生术 Revivify", "Compendium.dnd5e.spells.Item.LmRHHMtplpxr9fX6"],
["回返真言 Word of Recall", "Compendium.dnd5e.spells.Item.76C0FdcxlU8F9Rl2"],
["回避侦测 Nondetection", "Compendium.dnd5e.spells.Item.aU62xVUBYkAQWIHv"],
["困惑术 Confusion", "Compendium.dnd5e.spells.Item.9hQXdMSmerkTsHDe"],
["圣居 Hallow", "Compendium.dnd5e.spells.Item.SLxA9QhrggTz0taU"],
["圣洁灵光 Holy Aura", "Compendium.dnd5e.spells.Item.j8S49Rea8b1640Zi"],
["圣火术 Sacred Flame", "Compendium.dnd5e.spells.Item.n9pJzTDsAwQxJVRl"],
["圣言术 Divine Word", "Compendium.dnd5e.spells.Item.T1vpZLam7LezjToj"],
["地动术 Move Earth", "Compendium.dnd5e.spells.Item.yI0XWIgI0IGGsR3R"],
["地震术 Earthquake", "Compendium.dnd5e.spells.Item.x5JNBSyIBBZsjcGT"],
["塑石术 Stone Shape", "Compendium.dnd5e.spells.Item.QvGcdRUSNRKEQJlK"],
["复仇风暴 Storm of Vengeance", "Compendium.dnd5e.spells.Item.7KjExw0kmuqERa7C"],
["复生术 Resurrection", "Compendium.dnd5e.spells.Item.jhhT9PsHy5A7EojO"],
["大步奔行 Longstrider", "Compendium.dnd5e.spells.Item.B0pnIcc52O6G8hi8"],
["天界咒唤术 Conjure Celestial", "Compendium.dnd5e.spells.Item.XT7nzJmVGgv73uaf"],
["奇术 Thaumaturgy", "Compendium.dnd5e.spells.Item.MUO1uYN7JR1hm4dR"],
["奥术之手 Arcane Hand", "Compendium.dnd5e.spells.Item.a2KJHCIbY5Mi4Dmn"],
["奥术师的魔法灵光 Arcanist's Magic Aura", "Compendium.dnd5e.spells.Item.RvEqsD89Zvd5yex4"],
["奥能利剑 Arcane Sword", "Compendium.dnd5e.spells.Item.LTDNWoFVJNLjiiNa"],
["妖火 Faerie Fire", "Compendium.dnd5e.spells.Item.nqBDWkVOfcGZt4YU"],
["妖精咒唤术 Conjure Fey", "Compendium.dnd5e.spells.Item.yN3XZZujhR4aVvPa"],
["嫌恶术/关怀术 Antipathy/Sympathy", "Compendium.dnd5e.spells.Item.GJ2WYm3SQFR0winH"],
["守卫刻纹 Glyph of Warding", "Compendium.dnd5e.spells.Item.pB7XVYwdGNcUG935"],
["守护之链 Warding Bond", "Compendium.dnd5e.spells.Item.JVhKeanAXZH62DrF"],
["安定心神 Calm Emotions", "Compendium.dnd5e.spells.Item.3MYDjS6k9IYL0aTj"],
["完全变形术 True Polymorph", "Compendium.dnd5e.spells.Item.QbQZKoXOgHWN06aa"],
["完全复生术 True Resurrection", "Compendium.dnd5e.spells.Item.qLeEXZDbW5y4bmLY"],
["定身怪物 Hold Monster", "Compendium.dnd5e.spells.Item.l9Ju5KE7bbn3WpTm"],
["定身类人 Hold Person", "Compendium.dnd5e.spells.Item.3Lo9boi7P2ro6QV4"],
["寒冰锥 Cone of Cold", "Compendium.dnd5e.spells.Item.RpKjTlYASrfqUPVA"],
["寻找陷阱 Find Traps", "Compendium.dnd5e.spells.Item.KrM3oHVv13RAALrS"],
["寻获坐骑 Find Steed", "Compendium.dnd5e.spells.Item.5eh2HFbS13078Y3H"],
["寻获魔宠 Find Familiar", "Compendium.dnd5e.spells.Item.JGT5bNqu9REL7Fuz"],
["寻路术 Find the Path", "Compendium.dnd5e.spells.Item.cYI4RNNjI5GAmLhy"],
["小屋 Tiny Hut", "Compendium.dnd5e.spells.Item.NXWWWgHtWb7Nv21F"],
["巧言术 Tongues", "Compendium.dnd5e.spells.Item.gopnZvS0c2jD5FP8"],
["巨虫术 Giant Insect", "Compendium.dnd5e.spells.Item.czXrVRx6XYRWsHAi"],
["希望信标 Beacon of Hope", "Compendium.dnd5e.spells.Item.ZU9d6woBdUP8pIPt"],
["幻景 Hallucinatory Terrain", "Compendium.dnd5e.spells.Item.sTIkQK7KuQNOyY0C"],
["庇护术 Sanctuary", "Compendium.dnd5e.spells.Item.gvdA9nPuWLck4tBl"],
["延迟爆裂火球 Delayed Blast Fireball", "Compendium.dnd5e.spells.Item.AoTTjapz1FsGOIZz"],
["异界之门 Gate", "Compendium.dnd5e.spells.Item.XbwGq5kDJNvAxNXV"],
["异界探知 Contact Other Plane", "Compendium.dnd5e.spells.Item.dSTu1MaPhBqPITwM"],
["异界誓盟 Planar Ally", "Compendium.dnd5e.spells.Item.fkREcytuZ8sngWtC"],
["异界誓缚 Planar Binding", "Compendium.dnd5e.spells.Item.42O2aNBW7vK90gTL"],
["弱智术 Feeblemind", "Compendium.dnd5e.spells.Item.hYCrN82dMJFuJODB"],
["弹力法球 Resilient Sphere", "Compendium.dnd5e.spells.Item.1ADstb0Xec6HHRcU"],
["强化属性 Enhance Ability", "Compendium.dnd5e.spells.Item.9eOZDBImVKxbeOyZ"],
["强迫术 Compulsion", "Compendium.dnd5e.spells.Item.P6f1PPKPd9BCb742"],
["强酸箭 Acid Arrow", "Compendium.dnd5e.spells.Item.4H6YgYdKgnX6ZQ8M"],
["形体变化 Shapechange", "Compendium.dnd5e.spells.Item.N2UEFq8X5LRsLcOZ"],
["律令死亡 Power Word Kill", "Compendium.dnd5e.spells.Item.dmvaMLFWFtv0qx0S"],
["律令震慑 Power Word Stun", "Compendium.dnd5e.spells.Item.35j2QIMmIk6aEdxj"],
["御风而行 Wind Walk", "Compendium.dnd5e.spells.Item.8PJAsHmbu6UgDHC0"],
["德鲁伊伎俩 Druidcraft", "Compendium.dnd5e.spells.Item.SbSvZKkJASyk8jKo"],
["徽记术 Symbol", "Compendium.dnd5e.spells.Item.B2kbmgbA2WQR00kx"],
["心灵屏障 Mind Blank", "Compendium.dnd5e.spells.Item.bllEWfm9xfEKynhv"],
["心灵联结 Telepathic Bond", "Compendium.dnd5e.spells.Item.uAwtVZkiSTyP6ORB"],
["心灵遥控 Telekinesis", "Compendium.dnd5e.spells.Item.HQfd7jJyULIoGxrZ"],
["忠犬 Faithful Hound", "Compendium.dnd5e.spells.Item.SAj03P2WBDiWu7zu"],
["怪影杀手 Weird", "Compendium.dnd5e.spells.Item.Wl2vtJ4hCt2tpWfR"],
["恐惧术 Fear", "Compendium.dnd5e.spells.Item.XXUDGFELgoskdOD0"],
["恶言相加 Vicious Mockery", "Compendium.dnd5e.spells.Item.cdrYKaFi98YWaBMw"],
["托梦术 Dream", "Compendium.dnd5e.spells.Item.kSPRpeIx3w3nihrF"],
["投影术 Project Image", "Compendium.dnd5e.spells.Item.ePhRKHXRE7l1sEoQ"],
["护盾术 Shield", "Compendium.dnd5e.spells.Item.z1mx84ONwkXKUZd7"],
["抵抗术 Resistance", "Compendium.dnd5e.spells.Item.dl8YwvMboBqX2OC4"],
["拟像术 Simulacrum", "Compendium.dnd5e.spells.Item.jccbeBIfLrqEZnDP"],
["指使术 Geas", "Compendium.dnd5e.spells.Item.JQyigMNPiDnGI18b"],
["探知术 Scrying", "Compendium.dnd5e.spells.Item.fVbCxFRaORalHB20"],
["援助术 Aid", "Compendium.dnd5e.spells.Item.Opwh2PdX4runSBlm"],
["摄心目光 Eyebite", "Compendium.dnd5e.spells.Item.ZRqu3Xh9FmlBCZGy"],
["操控天气 Control Weather", "Compendium.dnd5e.spells.Item.ZPd73HtKF3At11jh"],
["操控水体 Control Water", "Compendium.dnd5e.spells.Item.7fFHlBk3UNX8gPKL"],
["支配怪物 Dominate Monster", "Compendium.dnd5e.spells.Item.eEpy1ONlXumKS1mp"],
["支配类人 Dominate Person", "Compendium.dnd5e.spells.Item.91Sw6vOIaO7U8DvM"],
["支配野兽 Dominate Beast", "Compendium.dnd5e.spells.Item.LrPvWHBPmiMQQsKB"],
["放逐术 Banishment", "Compendium.dnd5e.spells.Item.pxpb2eOB6bv4phAf"],
["敲击术 Knock", "Compendium.dnd5e.spells.Item.1nhIxh0DsJsntCfj"],
["无声幻影 Silent Image", "Compendium.dnd5e.spells.Item.BrBZdCCrJRIVg7YX"],
["时间停止 Time Stop", "Compendium.dnd5e.spells.Item.JYuRBwxpoFhXduvD"],
["易容术 Disguise Self", "Compendium.dnd5e.spells.Item.A3q2gTNqG6fvNGrv"],
["星界投影 Astral Projection", "Compendium.dnd5e.spells.Item.TIoadMIsUKD4edXi"],
["昼明术 Daylight", "Compendium.dnd5e.spells.Item.BP3GCwa66IAw1yTG"],
["暗示术 Suggestion", "Compendium.dnd5e.spells.Item.zMAWdyc8UVb37BK4"],
["月华之光 Moonbeam", "Compendium.dnd5e.spells.Item.bV3yun6MIuFj71Er"],
["朦胧术 Blur", "Compendium.dnd5e.spells.Item.UDUnlfPsOAbq2RSE"],
["木遁术 Transport via Plants", "Compendium.dnd5e.spells.Item.s7nXgot5gGZVcMrv"],
["林地之精咒唤术 Conjure Woodland Beings", "Compendium.dnd5e.spells.Item.dEfSELiY1eO3cpX9"],
["林间飞跃 Tree Stride", "Compendium.dnd5e.spells.Item.DUBgwHPakcLDkB6W"],
["枯萎术 Blight", "Compendium.dnd5e.spells.Item.pybg5MNc3lkerH4Y"],
["树肤 Barkskin", "Compendium.dnd5e.spells.Item.JPwIEfgUPVebr5AH"],
["棘墙术 Wall of Thorns", "Compendium.dnd5e.spells.Item.AQsBc94ES7W7s7iG"],
["植物交谈 Speak with Plants", "Compendium.dnd5e.spells.Item.2VXGS206tuChoeXy"],
["植物滋长 Plant Growth", "Compendium.dnd5e.spells.Item.YWtwzp6ZnQJMEmVW"],
["橡棍术 Shillelagh", "Compendium.dnd5e.spells.Item.VzgFzcmocr1X1cp4"],
["次等复原术 Lesser Restoration", "Compendium.dnd5e.spells.Item.F0GsG0SJzsIOacwV"],
["次级幻象 Minor Illusion", "Compendium.dnd5e.spells.Item.oIzA2MEHwxhtQneU"],
["死云术 Cloudkill", "Compendium.dnd5e.spells.Item.LkvI11Uue774QBKZ"],
["死亡一指 Finger of Death", "Compendium.dnd5e.spells.Item.HPvZm8YJO91k6Qdg"],
["死亡法阵 Circle of Death", "Compendium.dnd5e.spells.Item.KeunEkg1JYbOCOhV"],
["死者交谈 Speak with Dead", "Compendium.dnd5e.spells.Item.I2LUSF5ogc7Bj62e"],
["死者复活 Raise Dead", "Compendium.dnd5e.spells.Item.AGFMPAmuzwWO6Dfz"],
["毒气喷溅 Poison Spray", "Compendium.dnd5e.spells.Item.g2u9PYfqWQAyg9OI"],
["气化形体 Gaseous Form", "Compendium.dnd5e.spells.Item.2IWiZAJtOGDoKjiz"],
["水上行走 Water Walk", "Compendium.dnd5e.spells.Item.YBda6nLKjxdT1LbS"],
["水下呼吸 Water Breathing", "Compendium.dnd5e.spells.Item.13uVuBQP6VaiSPvC"],
["沉默术 Silence", "Compendium.dnd5e.spells.Item.5VhqFROQYjr1P9lp"],
["油腻术 Grease", "Compendium.dnd5e.spells.Item.etgcR9wqmrhyZ0tx"],
["治愈真言 Healing Word", "Compendium.dnd5e.spells.Item.o8Dh7fblk1d16tnO"],
["治疗祷言 Prayer of Healing", "Compendium.dnd5e.spells.Item.MOEmz9N0j0QPkKEE"],
["法师之手 Mage Hand", "Compendium.dnd5e.spells.Item.Utk1OQRwYkMkFRD3"],
["法师护甲 Mage Armor", "Compendium.dnd5e.spells.Item.CKZTpZlxj7hjjo2H"],
["法术反制 Counterspell", "Compendium.dnd5e.spells.Item.Ek45cBpVXvJdv1Qy"],
["法术无效结界 Globe of Invulnerability", "Compendium.dnd5e.spells.Item.WmQpxfjZwF3MGUby"],
["注目术 Enthrall", "Compendium.dnd5e.spells.Item.30ZgXtijJVCxQk5N"],
["活化死尸 Animate Dead", "Compendium.dnd5e.spells.Item.oyE5nVppa5mde5gT"],
["活化物件 Animate Objects", "Compendium.dnd5e.spells.Item.ATo0Eb63TDtnu6iA"],
["流星爆 Meteor Swarm", "Compendium.dnd5e.spells.Item.mF52ldF79Cr7wfQo"],
["浮空术 Levitate", "Compendium.dnd5e.spells.Item.MRxldJd6C4bsBo3O"],
["海市蜃楼 Mirage Arcane", "Compendium.dnd5e.spells.Item.f38w5rd9SgdmWc6F"],
["火墙术 Wall of Fire", "Compendium.dnd5e.spells.Item.X3DrXgxjwI2dvkD6"],
["火焰刀 Flame Blade", "Compendium.dnd5e.spells.Item.Advtckpz1B733bu9"],
["火焰护盾 Fire Shield", "Compendium.dnd5e.spells.Item.avD5XUtkBPQQR97c"],
["火焰箭 Fire Bolt", "Compendium.dnd5e.spells.Item.EOmsUcFQJTfG2oio"],
["火焰风暴 Fire Storm", "Compendium.dnd5e.spells.Item.J3uILDYS7MiOfmTJ"],
["火球术 Fireball", "Compendium.dnd5e.spells.Item.ztgcdrWPshKRpFd0"],
["灵体卫士 Spirit Guardians", "Compendium.dnd5e.spells.Item.uCud2s4TjMfjiXUb"],
["灵体武器 Spiritual Weapon", "Compendium.dnd5e.spells.Item.JbxsYXxSOTZbf9I0"],
["灼热射线 Scorching Ray", "Compendium.dnd5e.spells.Item.7u2obDvuvtZBkTfq"],
["灼热金属 Heat Metal", "Compendium.dnd5e.spells.Item.2yHXEcrRbadZDr5M"],
["灾祸 Bane", "Compendium.dnd5e.spells.Item.95K2aUhAGV9qXjnf"],
["炼狱叱喝 Hellish Rebuke", "Compendium.dnd5e.spells.Item.22dPoeXfaaAv4K3h"],
["炽焰法球 Flaming Sphere", "Compendium.dnd5e.spells.Item.FjYE214HTERCRZNm"],
["焚云术 Incendiary Cloud", "Compendium.dnd5e.spells.Item.pV04y1iXoWiom6bp"],
["焰击术 Flame Strike", "Compendium.dnd5e.spells.Item.5e1xTohkzqFqbYH4"],
["燃火术 Produce Flame", "Compendium.dnd5e.spells.Item.eCPQuQkIabFKTl9u"],
["燃烧之手 Burning Hands", "Compendium.dnd5e.spells.Item.5SuJewoa1CRWaj1F"],
["物件定位术 Locate Object", "Compendium.dnd5e.spells.Item.SleYkHovQ8NagmeV"],
["狂笑术 Hideous Laughter", "Compendium.dnd5e.spells.Item.BQk5Row4NymMnUQl"],
["猎人印记 Hunter's Mark", "Compendium.dnd5e.spells.Item.0xmXiPiuYws1OGcX"],
["生物定位术 Locate Creature", "Compendium.dnd5e.spells.Item.gXtzz9t1DTzJeLr4"],
["电爪 Shocking Grasp", "Compendium.dnd5e.spells.Item.XvbiNhNqXXIFisIy"],
["疗伤术 Cure Wounds", "Compendium.dnd5e.spells.Item.uUWb1wZgtMou0TVP"],
["疫病术 Contagion", "Compendium.dnd5e.spells.Item.CjIq8Ed7bu3vVwT1"],
["疫病虫群 Insect Plague", "Compendium.dnd5e.spells.Item.OVikYmSdHliAG2YD"],
["目盲术/耳聋术 Blindness/Deafness", "Compendium.dnd5e.spells.Item.zwGsAv6kmwzYGhh3"],
["真知术 True Seeing", "Compendium.dnd5e.spells.Item.XzkJpE6XpZfKjODD"],
["睡眠术 Sleep", "Compendium.dnd5e.spells.Item.KhwiSi9fwVfUPtku"],
["瞬间召唤 Instant Summons", "Compendium.dnd5e.spells.Item.SgrEKiC6dAtvy6Pz"],
["短讯术 Sending", "Compendium.dnd5e.spells.Item.GtGjNjPBgUHxGYAD"],
["石化术 Flesh to Stone", "Compendium.dnd5e.spells.Item.kozNy29b0X6exFhY"],
["石墙术 Wall of Stone", "Compendium.dnd5e.spells.Item.NmoRmM1mhuM3pqnY"],
["石肤术 Stoneskin", "Compendium.dnd5e.spells.Item.ReMbjfeOKoSj3O79"],
["祈愿术 Wish", "Compendium.dnd5e.spells.Item.3okM6Gn63zzEULkz"],
["祝福术 Bless", "Compendium.dnd5e.spells.Item.8dzaICjGy6mTUaUr"],
["神导术 Guidance", "Compendium.dnd5e.spells.Item.P7mF2MxSuVJwHRRY"],
["神恩 Divine Favor", "Compendium.dnd5e.spells.Item.8MICCMeOXT3aJUy9"],
["神莓术 Goodberry", "Compendium.dnd5e.spells.Item.Qf6CAZkc7ms4ZY3e"],
["禁制术 Forbiddance", "Compendium.dnd5e.spells.Item.64D1gNZ4hx7SWG2x"],
["禁锢术 Imprisonment", "Compendium.dnd5e.spells.Item.ZVnL9L8v1KC9TBF4"],
["私人密室 Private Sanctum", "Compendium.dnd5e.spells.Item.NJgxf7pmSsBArIG7"],
["秘法眼 Arcane Eye", "Compendium.dnd5e.spells.Item.ImlCJQwR1VL40Qem"],
["秘法锁 Arcane Lock", "Compendium.dnd5e.spells.Item.8cse7rit0oswRPUP"],
["秘藏箱 Secret Chest", "Compendium.dnd5e.spells.Item.8sgwRh8NUNkn9Vi0"],
["移除诅咒 Remove Curse", "Compendium.dnd5e.spells.Item.XZhdgVK3cLoxNCQl"],
["穿墙术 Passwall", "Compendium.dnd5e.spells.Item.d9MwcXi7Il3HROXd"],
["篡改记忆 Modify Memory", "Compendium.dnd5e.spells.Item.r3243JU4AyQJyfX4"],
["粉碎音波 Shatter", "Compendium.dnd5e.spells.Item.wJKpSvSTbSkTjqyb"],
["纠缠术 Entangle", "Compendium.dnd5e.spells.Item.gMrWeG8fMDPRFiVe"],
["维生术 Spare the Dying", "Compendium.dnd5e.spells.Item.8zT7njvqbpXs4Cel"],
["缓慢术 Slow", "Compendium.dnd5e.spells.Item.yqUDoxk4x0NWG5Bz"],
["群体医疗术 Mass Heal", "Compendium.dnd5e.spells.Item.Y6oItIuhOJZ0i0FC"],
["群体暗示术 Mass Suggestion", "Compendium.dnd5e.spells.Item.5OGFdJw35QXp6mh6"],
["群体治愈真言 Mass Healing Word", "Compendium.dnd5e.spells.Item.34ddoYIrnOZ2GFYi"],
["群体疗伤术 Mass Cure Wounds", "Compendium.dnd5e.spells.Item.Pyzmm8R7rVsNAPsd"],
["羽落术 Feather Fall", "Compendium.dnd5e.spells.Item.pub0OWVEB71XQx1n"],
["脚底抹油 Expeditious Retreat", "Compendium.dnd5e.spells.Item.zPGohqJRir6MyQ3U"],
["臭云术 Stinking Cloud", "Compendium.dnd5e.spells.Item.TwlD4PLcltv7Xh7j"],
["致伤术 Inflict Wounds", "Compendium.dnd5e.spells.Item.ksaaTxIbKx2sJfia"],
["舞光术 Dancing Lights", "Compendium.dnd5e.spells.Item.CAxSzHWizrafT033"],
["花言巧语 Glibness", "Compendium.dnd5e.spells.Item.1RzxKZzkQOoioxPj"],
["英雄宴 Heroes' Feast", "Compendium.dnd5e.spells.Item.mgFqi0ev8f7Ut19y"],
["英雄气概 Heroism", "Compendium.dnd5e.spells.Item.ge3Saet9zPTDyaoL"],
["荆棘丛生 Spike Growth", "Compendium.dnd5e.spells.Item.9gYGkrL6qFTsE6fw"],
["虔诚护盾 Shield of Faith", "Compendium.dnd5e.spells.Item.jZ6JNykRtdQ90MOo"],
["虚假生命 False Life", "Compendium.dnd5e.spells.Item.7e3QXF10hLNDEdr6"],
["虹光喷射 Prismatic Spray", "Compendium.dnd5e.spells.Item.eGMhwmuleAM46C6L"],
["虹光法墙 Prismatic Wall", "Compendium.dnd5e.spells.Item.jmfu8zj4zjjzUbeh"],
["蛛网术 Web", "Compendium.dnd5e.spells.Item.UJJu9c2UvCzVljiP"],
["蛛行 Spider Climb", "Compendium.dnd5e.spells.Item.KJRVzeMQXPj8Gtyx"],
["融身入石 Meld into Stone", "Compendium.dnd5e.spells.Item.64uo4fHriHLjRUrX"],
["行动无踪 Pass without Trace", "Compendium.dnd5e.spells.Item.pRMvmknwLf2tdMTj"],
["行动自如 Freedom of Movement", "Compendium.dnd5e.spells.Item.da0a1t2FqaTjRZGT"],
["衰弱射线 Ray of Enfeeblement", "Compendium.dnd5e.spells.Item.ODhLKBxLnvvLOnw1"],
["解离术 Disintegrate", "Compendium.dnd5e.spells.Item.HBHbOGKNVVprSlwn"],
["解除魔法 Dispel Magic", "Compendium.dnd5e.spells.Item.15Fa6q1nH27XfbR8"],
["触发术 Contingency", "Compendium.dnd5e.spells.Item.4smlOvpF5AQHcyg1"],
["警报术 Alarm", "Compendium.dnd5e.spells.Item.7p9IuWrSWFgfyQo2"],
["识破隐形 See Invisibility", "Compendium.dnd5e.spells.Item.DQzlB5Y3k791W5bH"],
["诚实之域 Zone of Truth", "Compendium.dnd5e.spells.Item.CylBa7jR8DSbo8Z3"],
["谭森浮碟术 Floating Disk", "Compendium.dnd5e.spells.Item.bnjXlk13ZRJuf5d0"],
["豪宅术 Magnificent Mansion", "Compendium.dnd5e.spells.Item.pn4SnsFDvYDiE6rC"],
["跳跃术 Jump", "Compendium.dnd5e.spells.Item.ZrTc23tToJ0JpH2h"],
["转生术 Reincarnate", "Compendium.dnd5e.spells.Item.zMEo5DKK8uxsuWnq"],
["连锁闪电 Chain Lightning", "Compendium.dnd5e.spells.Item.QbTxN5dWIbYZ4jLU"],
["迷宫术 Maze", "Compendium.dnd5e.spells.Item.clwv2PWOcT822hlr"],
["迷幻手稿 Illusory Script", "Compendium.dnd5e.spells.Item.82jM6qD9axLJsTrH"],
["迷舞 Irresistible Dance", "Compendium.dnd5e.spells.Item.TfRzwEgBHHkCc6Ql"],
["迷踪步 Misty Step", "Compendium.dnd5e.spells.Item.wqfAVANuQonNBgnL"],
["通晓传奇 Legend Lore", "Compendium.dnd5e.spells.Item.W4Qx5z0id6da0vqg"],
["通晓语言 Comprehend Languages", "Compendium.dnd5e.spells.Item.4dSvfvTy2ZIJ3K4k"],
["通神术 Commune", "Compendium.dnd5e.spells.Item.d54VDyFulD9xxY7J"],
["造水术/枯水术 Create or Destroy Water", "Compendium.dnd5e.spells.Item.a3XtAO5n2GrqiAh5"],
["造物术 Creation", "Compendium.dnd5e.spells.Item.lnaGnxMzpYnbw1uU"],
["造粮术 Create Food and Water", "Compendium.dnd5e.spells.Item.BV0mpbHh29IbbIj5"],
["造风术 Gust of Wind", "Compendium.dnd5e.spells.Item.FSMy6VAjDnXY9vWz"],
["遗体防腐 Gentle Repose", "Compendium.dnd5e.spells.Item.n4JDcFKe5ikzYmAc"],
["酸液飞溅 Acid Splash", "Compendium.dnd5e.spells.Item.JLTQyqXEaJDrTXyW"],
["重伤术 Harm", "Compendium.dnd5e.spells.Item.tMH6Ivn4GmE1naMj"],
["鉴定术 Identify", "Compendium.dnd5e.spells.Item.3OZnNhunvRtPOQmH"],
["铜墙铁壁 Guards and Wards", "Compendium.dnd5e.spells.Item.yw0tYQkOMCgKZ8Ur"],
["镜影术 Mirror Image", "Compendium.dnd5e.spells.Item.X4c8xCkmF8U9HUMz"],
["闪现术 Blink", "Compendium.dnd5e.spells.Item.GSvLWcdCZLQkilXT"],
["闪电束 Lightning Bolt", "Compendium.dnd5e.spells.Item.IyikgTEOTv701jgQ"],
["问道自然 Commune with Nature", "Compendium.dnd5e.spells.Item.dp6xny4v8PDoIGjh"],
["防护善恶 Protection from Evil and Good", "Compendium.dnd5e.spells.Item.xmDBqZhRVrtLP8h2"],
["防护毒素 Protection from Poison", "Compendium.dnd5e.spells.Item.MAxM77CDUu8dgIRQ"],
["防护法阵 Magic Circle", "Compendium.dnd5e.spells.Item.y8A4HfTwd93ypdEz"],
["防护能量 Protection from Energy", "Compendium.dnd5e.spells.Item.j8NtLXOOJ3GAKF8I"],
["防死结界 Death Ward", "Compendium.dnd5e.spells.Item.VtCXMdyM6mAdIJZb"],
["防活物护罩 Antilife Shell", "Compendium.dnd5e.spells.Item.wXzkqpeFP8eWgJzK"],
["阳炎射线 Sunbeam", "Compendium.dnd5e.spells.Item.2RC0EyvBLPH88PZF"],
["阳炎爆 Sunburst", "Compendium.dnd5e.spells.Item.hzK7FQya0BDjSmLE"],
["降咒 Bestow Curse", "Compendium.dnd5e.spells.Item.pO4zGe5LmFIYqJiL"],
["隐形仆役 Unseen Servant", "Compendium.dnd5e.spells.Item.ccduLIvutyNqvkgv"],
["隐形术 Invisibility", "Compendium.dnd5e.spells.Item.1N8dDMMgZ1h1YJ3B"],
["隔离术 Sequester", "Compendium.dnd5e.spells.Item.wvLbtemkH8gyBpdc"],
["雪雨暴 Sleet Storm", "Compendium.dnd5e.spells.Item.dhqBY4TvVjxVmOZd"],
["雷鸣波 Thunderwave", "Compendium.dnd5e.spells.Item.WTbOQBsarsL1LuXJ"],
["预置幻象 Programmed Illusion", "Compendium.dnd5e.spells.Item.bA2sk9eMKBeY7EPD"],
["预见术 Foresight", "Compendium.dnd5e.spells.Item.6HEEhLdJz32TL4Js"],
["预言术 Divination", "Compendium.dnd5e.spells.Item.XqzXSKNR75ZdYTA9"],
["颤栗之触 Chill Touch", "Compendium.dnd5e.spells.Item.vrN18tbTw7io5MWd"],
["风墙术 Wind Wall", "Compendium.dnd5e.spells.Item.ew6GA8dJy2spQmFW"],
["飞行术 Fly", "Compendium.dnd5e.spells.Item.yfbK8gZqESlaoY5t"],
["驱逐善恶 Dispel Evil and Good", "Compendium.dnd5e.spells.Item.TkJ8Wtg1L7TZtspm"],
["高等复原术 Greater Restoration", "Compendium.dnd5e.spells.Item.WzvJ7G3cqvIubsLk"],
["高等幻影 Major Image", "Compendium.dnd5e.spells.Item.nslx2nT3p4lNkmdp"],
["高等隐形术 Greater Invisibility", "Compendium.dnd5e.spells.Item.tEpDmYZNGc9f5OhJ"],
["鬼斧神工 Fabricate", "Compendium.dnd5e.spells.Item.7Fw7Bf1k3xxDVr5L"],
["魅影杀手 Phantasmal Killer", "Compendium.dnd5e.spells.Item.BYNvBJzHcF5VJhXw"],
["魅影驹 Phantom Steed", "Compendium.dnd5e.spells.Item.wpx42mtoZ5BmXRs1"],
["魅惑类人 Charm Person", "Compendium.dnd5e.spells.Item.eS7XnnApoxRxYXPs"],
["魔化武器 Magic Weapon", "Compendium.dnd5e.spells.Item.Sgjrf8qqv97CCWM4"],
["魔嘴术 Magic Mouth", "Compendium.dnd5e.spells.Item.7v06rdmUakoTk1LQ"],
["魔法伎俩 Prestidigitation", "Compendium.dnd5e.spells.Item.udsLtG0BugXHR2JQ"],
["魔法飞弹 Magic Missile", "Compendium.dnd5e.spells.Item.41JIhpDyM9Anm7cs"],
["魔绳术 Rope Trick", "Compendium.dnd5e.spells.Item.ap4dmtshjEbwU3Ts"],
["魔能爆 Eldritch Blast", "Compendium.dnd5e.spells.Item.Z9p1vezIn95jw1Yw"],
["魔魂壶 Magic Jar", "Compendium.dnd5e.spells.Item.ej6wyY4G1gOcb1U6"],
["鹰眼术 Clairvoyance", "Compendium.dnd5e.spells.Item.cg50KpBkBdPK6vPL"],
["黑暗术 Darkness", "Compendium.dnd5e.spells.Item.S7VbUetIfVT7B6Eq"],
["黑暗视觉 Darkvision", "Compendium.dnd5e.spells.Item.hJ6ZiA3fpoY8v9cp"],
["黑触手 Black Tentacles", "Compendium.dnd5e.spells.Item.DGONTFbk5eORs5qv"],
```

### §37 · `dnd5e.spells24`（340 条） — dnd5e 官方法术（2024）
```text
["Ice Knife", "Compendium.dnd5e.spells24.Item.phbsplIceKnife00"],
["七彩喷射 Color Spray", "Compendium.dnd5e.spells24.Item.phbsplColorSpray"],
["不灭明焰 Continual Flame", "Compendium.dnd5e.spells24.Item.phbsplContinualF"],
["不谐低语 Dissonant Whispers", "Compendium.dnd5e.spells24.Item.phbsplDissonantW"],
["云雾术 Fog Cloud", "Compendium.dnd5e.spells24.Item.phbsplFogCloud00"],
["以太化 Etherealness", "Compendium.dnd5e.spells24.Item.phbsplEtherealne"],
["任意门 Dimension Door", "Compendium.dnd5e.spells24.Item.phbsplDimensionD"],
["传讯术 Message", "Compendium.dnd5e.spells24.Item.phbsplMessage000"],
["传送术 Teleport", "Compendium.dnd5e.spells24.Item.phbsplTeleport00"],
["传送法阵 Teleportation Circle", "Compendium.dnd5e.spells24.Item.phbsplTeleportat"],
["伪装术 Seeming", "Compendium.dnd5e.spells24.Item.phbsplSeeming000"],
["位面转移 Plane Shift", "Compendium.dnd5e.spells24.Item.phbsplPlaneShift"],
["侦测善恶 Detect Evil and Good", "Compendium.dnd5e.spells24.Item.phbsplDetectEvil"],
["侦测思想 Detect Thoughts", "Compendium.dnd5e.spells24.Item.phbsplDetectThou"],
["侦测毒性和疾病 Detect Poison and Disease", "Compendium.dnd5e.spells24.Item.phbsplDetectPois"],
["侦测魔法 Detect Magic", "Compendium.dnd5e.spells24.Item.phbsplDetectMagi"],
["信仰守卫 Guardian of Faith", "Compendium.dnd5e.spells24.Item.phbsplGuardianof"],
["修复术 Mending", "Compendium.dnd5e.spells24.Item.phbsplMending000"],
["假象术 Mislead", "Compendium.dnd5e.spells24.Item.phbsplMislead000"],
["催眠图纹 Hypnotic Pattern", "Compendium.dnd5e.spells24.Item.phbsplHypnoticPa"],
["光亮术 Light", "Compendium.dnd5e.spells24.Item.phbsplLight00000"],
["光导箭 Guiding Bolt", "Compendium.dnd5e.spells24.Item.phbsplGuidingBol"],
["克敌先击 True Strike", "Compendium.dnd5e.spells24.Item.phbsplTrueStrike"],
["克隆术 Clone", "Compendium.dnd5e.spells24.Item.phbsplClone00000"],
["再生术 Regenerate", "Compendium.dnd5e.spells24.Item.phbsplRegenerate"],
["冰冻法球 Freezing Sphere", "Compendium.dnd5e.spells24.Item.phbsplOtilukesFr"],
["冰墙术 Wall of Ice", "Compendium.dnd5e.spells24.Item.phbsplWallofIce0"],
["冰风暴 Ice Storm", "Compendium.dnd5e.spells24.Item.phbsplIceStorm00"],
["冷冻射线 Ray of Frost", "Compendium.dnd5e.spells24.Item.phbsplRayofFrost"],
["净化饮食 Purify Food and Drink", "Compendium.dnd5e.spells24.Item.phbsplPurifyFood"],
["剑刃护壁 Blade Barrier", "Compendium.dnd5e.spells24.Item.phbsplBladeBarri"],
["力场墙 Wall of Force", "Compendium.dnd5e.spells24.Item.phbsplWallofForc"],
["力场监牢 Forcecage", "Compendium.dnd5e.spells24.Item.phbsplForcecage0"],
["加速术 Haste", "Compendium.dnd5e.spells24.Item.phbsplHaste00000"],
["动植物定位术 Locate Animals or Plants", "Compendium.dnd5e.spells24.Item.phbsplLocateAnim"],
["动物交谈 Speak with Animals", "Compendium.dnd5e.spells24.Item.phbsplSpeakwithA"],
["动物信使 Animal Messenger", "Compendium.dnd5e.spells24.Item.phbsplAnimalMess"],
["动物形态 Animal Shapes", "Compendium.dnd5e.spells24.Item.phbsplAnimalShap"],
["化兽为友 Animal Friendship", "Compendium.dnd5e.spells24.Item.phbsplAnimalFrie"],
["医疗术 Heal", "Compendium.dnd5e.spells24.Item.phbsplHeal000000"],
["半位面 Demiplane", "Compendium.dnd5e.spells24.Item.phbsplDemiplane0"],
["卜筮术 Augury", "Compendium.dnd5e.spells24.Item.phbsplAugury0000"],
["反转重力 Reverse Gravity", "Compendium.dnd5e.spells24.Item.phbsplReverseGra"],
["反魔法场 Antimagic Field", "Compendium.dnd5e.spells24.Item.phbsplAntimagicF"],
["变巨术/缩小术 Enlarge/Reduce", "Compendium.dnd5e.spells24.Item.phbsplEnlargeRed"],
["变形术 Polymorph", "Compendium.dnd5e.spells24.Item.phbsplPolymorph0"],
["变身术 Alter Self", "Compendium.dnd5e.spells24.Item.phbsplAlterSelf0"],
["召雷术 Call Lightning", "Compendium.dnd5e.spells24.Item.phbsplCallLightn"],
["启蒙术 Awaken", "Compendium.dnd5e.spells24.Item.phbsplAwaken0000"],
["吸血鬼之触 Vampiric Touch", "Compendium.dnd5e.spells24.Item.phbsplVampiricTo"],
["命令术 Command", "Compendium.dnd5e.spells24.Item.phbsplCommand000"],
["咒唤元素 Conjure Elemental", "Compendium.dnd5e.spells24.Item.phbsplConjureEle"],
["咒唤兽群 Conjure Animals", "Compendium.dnd5e.spells24.Item.phbsplConjureAni"],
["咒唤圣光 Conjure Celestial", "Compendium.dnd5e.spells24.Item.phbsplConjureCel"],
["咒唤妖精 Conjure Fey", "Compendium.dnd5e.spells24.Item.phbsplConjureFey"],
["咒唤微元素群 Conjure Minor Elementals", "Compendium.dnd5e.spells24.Item.phbsplConjureMin"],
["咒唤林地卫士 Conjure Woodland Beings", "Compendium.dnd5e.spells24.Item.phbsplConjureWoo"],
["唤起亡灵 Create Undead", "Compendium.dnd5e.spells24.Item.phbsplCreateUnde"],
["四象法门 Elementalism", "Compendium.dnd5e.spells24.Item.phbsplElementali"],
["回生术 Revivify", "Compendium.dnd5e.spells24.Item.phbsplRevivify00"],
["回返真言 Word of Recall", "Compendium.dnd5e.spells24.Item.phbsplWordofReca"],
["回避侦测 Nondetection", "Compendium.dnd5e.spells24.Item.phbsplNondetecti"],
["困惑术 Confusion", "Compendium.dnd5e.spells24.Item.phbsplConfusion0"],
["圣居 Hallow", "Compendium.dnd5e.spells24.Item.phbsplHallow0000"],
["圣洁灵光 Holy Aura", "Compendium.dnd5e.spells24.Item.phbsplHolyAura00"],
["圣火术 Sacred Flame", "Compendium.dnd5e.spells24.Item.phbsplSacredFlam"],
["圣言术 Divine Word", "Compendium.dnd5e.spells24.Item.phbsplDivineWord"],
["地动术 Move Earth", "Compendium.dnd5e.spells24.Item.phbsplMoveEarth0"],
["地震术 Earthquake", "Compendium.dnd5e.spells24.Item.phbsplEarthquake"],
["塑石术 Stone Shape", "Compendium.dnd5e.spells24.Item.phbsplStoneShape"],
["复仇风暴 Storm of Vengeance", "Compendium.dnd5e.spells24.Item.phbsplStormofVen"],
["复生术 Resurrection", "Compendium.dnd5e.spells24.Item.phbsplResurrecti"],
["复苏秘法 Arcane Vigor", "Compendium.dnd5e.spells24.Item.phbsplArcaneVigo"],
["大步奔行 Longstrider", "Compendium.dnd5e.spells24.Item.phbsplLongstride"],
["奇术 Thaumaturgy", "Compendium.dnd5e.spells24.Item.phbsplThaumaturg"],
["奥术之手 Arcane Hand", "Compendium.dnd5e.spells24.Item.phbsplBigbysHand"],
["奥术师的魔法灵光 Arcanist's Magic Aura", "Compendium.dnd5e.spells24.Item.phbsplNystulsMag"],
["奥能利剑 Arcane Sword", "Compendium.dnd5e.spells24.Item.phbswdMordenkain"],
["妖火 Faerie Fire", "Compendium.dnd5e.spells24.Item.phbsplFaerieFire"],
["嫌恶术/关怀术 Antipathy/Sympathy", "Compendium.dnd5e.spells24.Item.phbsplAntipathyS"],
["守卫刻纹 Glyph of Warding", "Compendium.dnd5e.spells24.Item.phbsplGlyphofWar"],
["守护之链 Warding Bond", "Compendium.dnd5e.spells24.Item.phbsplWardingBon"],
["安定心神 Calm Emotions", "Compendium.dnd5e.spells24.Item.phbsplCalmEmotio"],
["完全变形术 True Polymorph", "Compendium.dnd5e.spells24.Item.phbsplTruePolymo"],
["完全复生术 True Resurrection", "Compendium.dnd5e.spells24.Item.phbsplTrueResurr"],
["定身怪物 Hold Monster", "Compendium.dnd5e.spells24.Item.phbsplHoldMonste"],
["定身类人 Hold Person", "Compendium.dnd5e.spells24.Item.phbsplHoldPerson"],
["寒冰锥 Cone of Cold", "Compendium.dnd5e.spells24.Item.phbsplConeofCold"],
["寻找陷阱 Find Traps", "Compendium.dnd5e.spells24.Item.phbsplFindTraps0"],
["寻获坐骑 Find Steed", "Compendium.dnd5e.spells24.Item.phbsplFindSteed0"],
["寻获魔宠 Find Familiar", "Compendium.dnd5e.spells24.Item.phbsplFindFamili"],
["寻路术 Find the Path", "Compendium.dnd5e.spells24.Item.phbsplFindthePat"],
["小屋 Tiny Hut", "Compendium.dnd5e.spells24.Item.phbsplLeomundsTi"],
["巧言术 Tongues", "Compendium.dnd5e.spells24.Item.phbsplTongues000"],
["巨虫 Giant Insect", "Compendium.dnd5e.spells24.Item.phbsplGiantInsec"],
["希望信标 Beacon of Hope", "Compendium.dnd5e.spells24.Item.phbsplBeaconofHo"],
["幻景 Hallucinatory Terrain", "Compendium.dnd5e.spells24.Item.phbsplHallucinat"],
["庇护术 Sanctuary", "Compendium.dnd5e.spells24.Item.phbSanctuary0000"],
["延迟爆裂火球 Delayed Blast Fireball", "Compendium.dnd5e.spells24.Item.phbsplDelayedBla"],
["异界之门 Gate", "Compendium.dnd5e.spells24.Item.phbsplGate000000"],
["异界探知 Contact Other Plane", "Compendium.dnd5e.spells24.Item.phbsplContactOth"],
["异界誓盟 Planar Ally", "Compendium.dnd5e.spells24.Item.phbsplPlanarAlly"],
["异界誓缚 Planar Binding", "Compendium.dnd5e.spells24.Item.phbsplPlanarBind"],
["弹力法球 Resilient Sphere", "Compendium.dnd5e.spells24.Item.phbsplOtilukesRe"],
["强化属性 Enhance Ability", "Compendium.dnd5e.spells24.Item.phbsplEnhanceAbi"],
["强迫术 Compulsion", "Compendium.dnd5e.spells24.Item.phbsplCompulsion"],
["强酸箭 Acid Arrow", "Compendium.dnd5e.spells24.Item.phbsplMelfsAcidA"],
["形体变化 Shapechange", "Compendium.dnd5e.spells24.Item.phbsplShapechang"],
["律令医疗 Power Word Heal", "Compendium.dnd5e.spells24.Item.phbsplPowerWordH"],
["律令死亡 Power Word Kill", "Compendium.dnd5e.spells24.Item.phbsplPowerWordK"],
["律令震慑 Power Word Stun", "Compendium.dnd5e.spells24.Item.phbsplPowerWordS"],
["御风而行 Wind Walk", "Compendium.dnd5e.spells24.Item.phbsplWindWalk00"],
["德鲁伊伎俩 Druidcraft", "Compendium.dnd5e.spells24.Item.phbsplDruidcraft"],
["徽记术 Symbol", "Compendium.dnd5e.spells24.Item.phbsplSymbol0000"],
["心灵尖刺 Mind Spike", "Compendium.dnd5e.spells24.Item.phbsplMindSpike0"],
["心灵屏障 Mind Blank", "Compendium.dnd5e.spells24.Item.phbsplMindBlank0"],
["心灵联结 Telepathic Bond", "Compendium.dnd5e.spells24.Item.phbsplRarysTelep"],
["心灵遥控 Telekinesis", "Compendium.dnd5e.spells24.Item.phbsplTelekinesi"],
["怪影杀手 Weird", "Compendium.dnd5e.spells24.Item.phbsplWeird00000"],
["恐惧术 Fear", "Compendium.dnd5e.spells24.Item.phbsplFear000000"],
["恶言相加 Vicious Mockery", "Compendium.dnd5e.spells24.Item.phbsplViciousMoc"],
["托梦术 Dream", "Compendium.dnd5e.spells24.Item.phbsplDream00000"],
["投影术 Project Image", "Compendium.dnd5e.spells24.Item.phbsplProjectIma"],
["护盾术 Shield", "Compendium.dnd5e.spells24.Item.phbsplShield0000"],
["抵抗术 Resistance", "Compendium.dnd5e.spells24.Item.phbsplResistance"],
["拟像术 Simulacrum", "Compendium.dnd5e.spells24.Item.phbsplSimulacrum"],
["指使术 Geas", "Compendium.dnd5e.spells24.Item.phbsplGeas000000"],
["捕获打击 Ensnaring Strike", "Compendium.dnd5e.spells24.Item.phbsplEnsnaringS"],
["探知术 Scrying", "Compendium.dnd5e.spells24.Item.phbsplScrying000"],
["援助术 Aid", "Compendium.dnd5e.spells24.Item.phbsplAid0000000"],
["摄心目光 Eyebite", "Compendium.dnd5e.spells24.Item.phbsplEyebite000"],
["摧心术 Befuddlement", "Compendium.dnd5e.spells24.Item.phbsplBefuddleme"],
["操控天气 Control Weather", "Compendium.dnd5e.spells24.Item.phbsplControlWea"],
["操控水体 Control Water", "Compendium.dnd5e.spells24.Item.phbsplControlWat"],
["支配怪物 Dominate Monster", "Compendium.dnd5e.spells24.Item.phbsplDominateMo"],
["支配类人 Dominate Person", "Compendium.dnd5e.spells24.Item.phbsplDominatePe"],
["支配野兽 Dominate Beast", "Compendium.dnd5e.spells24.Item.phbsplDominateBe"],
["放逐术 Banishment", "Compendium.dnd5e.spells24.Item.phbsplBanishment"],
["敲击术 Knock", "Compendium.dnd5e.spells24.Item.phbsplKnock00000"],
["无声幻影 Silent Image", "Compendium.dnd5e.spells24.Item.phbsplSilentImag"],
["时间停止 Time Stop", "Compendium.dnd5e.spells24.Item.phbsplTimeStop00"],
["易容术 Disguise Self", "Compendium.dnd5e.spells24.Item.phbsplDisguiseSe"],
["星界投影 Astral Projection", "Compendium.dnd5e.spells24.Item.phbsplAstralProj"],
["昼明术 Daylight", "Compendium.dnd5e.spells24.Item.phbsplDaylight00"],
["暗示术 Suggestion", "Compendium.dnd5e.spells24.Item.phbsplSuggestion"],
["月华之光 Moonbeam", "Compendium.dnd5e.spells24.Item.phbsplMoonbeam00"],
["朦胧术 Blur", "Compendium.dnd5e.spells24.Item.phbsplBlur000000"],
["木遁术 Transport via Plants", "Compendium.dnd5e.spells24.Item.phbsplTransportv"],
["术法爆发 Sorcerous Burst", "Compendium.dnd5e.spells24.Item.phbsplSorcerousB"],
["枯萎术 Blight", "Compendium.dnd5e.spells24.Item.phbsplBlight0000"],
["树肤术 Barkskin", "Compendium.dnd5e.spells24.Item.phbsplBarkskin00"],
["树跃术 Tree Stride", "Compendium.dnd5e.spells24.Item.phbsplTreeStride"],
["棘墙术 Wall of Thorns", "Compendium.dnd5e.spells24.Item.phbsplWallofThor"],
["植物交谈 Speak with Plants", "Compendium.dnd5e.spells24.Item.phbsplSpeakwithP"],
["植物滋长 Plant Growth", "Compendium.dnd5e.spells24.Item.phbsplPlantGrowt"],
["橡棍术 Shillelagh", "Compendium.dnd5e.spells24.Item.phbsplShillelagh"],
["次等复原术 Lesser Restoration", "Compendium.dnd5e.spells24.Item.phbsplLesserRest"],
["次级幻象 Minor Illusion", "Compendium.dnd5e.spells24.Item.phbsplMinorIllus"],
["死云术 Cloudkill", "Compendium.dnd5e.spells24.Item.phbsplCloudkill0"],
["死亡一指 Finger of Death", "Compendium.dnd5e.spells24.Item.phbsplFingerofDe"],
["死亡法阵 Circle of Death", "Compendium.dnd5e.spells24.Item.phbsplCircleofDe"],
["死者交谈 Speak with Dead", "Compendium.dnd5e.spells24.Item.phbsplSpeakwithD"],
["死者复活 Raise Dead", "Compendium.dnd5e.spells24.Item.phbsplRaiseDead0"],
["毒气喷溅 Poison Spray", "Compendium.dnd5e.spells24.Item.phbsplPoisonSpra"],
["气化形体 Gaseous Form", "Compendium.dnd5e.spells24.Item.phbsplGaseousFor"],
["水上行走 Water Walk", "Compendium.dnd5e.spells24.Item.phbsplWaterWalk0"],
["水下呼吸 Water Breathing", "Compendium.dnd5e.spells24.Item.phbsplWaterBreat"],
["沉默术 Silence", "Compendium.dnd5e.spells24.Item.phbsplSilence000"],
["油腻术 Grease", "Compendium.dnd5e.spells24.Item.phbsplGrease0000"],
["治愈真言 Healing Word", "Compendium.dnd5e.spells24.Item.phbsplHealingWor"],
["治疗祷言 Prayer of Healing", "Compendium.dnd5e.spells24.Item.phbsplPrayerofHe"],
["法师之手 Mage Hand", "Compendium.dnd5e.spells24.Item.phbsplMageHand00"],
["法师护甲 Mage Armor", "Compendium.dnd5e.spells24.Item.phbsplMageArmor0"],
["法术反制 Counterspell", "Compendium.dnd5e.spells24.Item.phbsplCounterspe"],
["法术无效结界 Globe of Invulnerability", "Compendium.dnd5e.spells24.Item.phbsplGlobeofInv"],
["注目术 Enthrall", "Compendium.dnd5e.spells24.Item.phbsplEnthrall00"],
["活化死尸 Animate Dead", "Compendium.dnd5e.spells24.Item.phbsplAnimateDea"],
["活化物件 Animate Objects", "Compendium.dnd5e.spells24.Item.phbsplAnimateObj"],
["流星爆 Meteor Swarm", "Compendium.dnd5e.spells24.Item.phbsplMeteorSwar"],
["浓酸球 Vitriolic Sphere", "Compendium.dnd5e.spells24.Item.phbsplVitriolicS"],
["浮空术 Levitate", "Compendium.dnd5e.spells24.Item.phbsplLevitate00"],
["海啸术 Tsunami", "Compendium.dnd5e.spells24.Item.phbsplTsunami000"],
["海市蜃楼 Mirage Arcane", "Compendium.dnd5e.spells24.Item.phbsplMirageArca"],
["火墙术 Wall of Fire", "Compendium.dnd5e.spells24.Item.phbsplWallofFire"],
["火焰刀 Flame Blade", "Compendium.dnd5e.spells24.Item.phbsplFlameBlade"],
["火焰护盾 Fire Shield", "Compendium.dnd5e.spells24.Item.phbsplFireShield"],
["火焰箭 Fire Bolt", "Compendium.dnd5e.spells24.Item.phbsplFireBolt00"],
["火焰风暴 Fire Storm", "Compendium.dnd5e.spells24.Item.phbsplFireStorm0"],
["火球术 Fireball", "Compendium.dnd5e.spells24.Item.phbsplFireball00"],
["灵体卫士 Spirit Guardians", "Compendium.dnd5e.spells24.Item.phbsplSpiritGuar"],
["灵体武器 Spiritual Weapon", "Compendium.dnd5e.spells24.Item.phbsplSpiritualW"],
["灼热射线 Scorching Ray", "Compendium.dnd5e.spells24.Item.phbsplScorchingR"],
["灼热金属 Heat Metal", "Compendium.dnd5e.spells24.Item.phbsplHeatMetal0"],
["灾祸术 Bane", "Compendium.dnd5e.spells24.Item.phbsplBane000000"],
["点点星芒 Starry Wisp", "Compendium.dnd5e.spells24.Item.phbsplStarryWisp"],
["炼狱叱喝 Hellish Rebuke", "Compendium.dnd5e.spells24.Item.phbsplHellishReb"],
["炽焰斩 Searing Smite", "Compendium.dnd5e.spells24.Item.phbsplSearingSmi"],
["炽焰法球 Flaming Sphere", "Compendium.dnd5e.spells24.Item.phbsplFlamingSph"],
["焚云术 Incendiary Cloud", "Compendium.dnd5e.spells24.Item.phbsplIncendiary"],
["焰击术 Flame Strike", "Compendium.dnd5e.spells24.Item.phbsplFlameStrik"],
["燃火术 Produce Flame", "Compendium.dnd5e.spells24.Item.phbsplProduceFla"],
["燃烧之手 Burning Hands", "Compendium.dnd5e.spells24.Item.phbsplBurningHan"],
["物件定位术 Locate Object", "Compendium.dnd5e.spells24.Item.phbsplLocateObje"],
["狂笑术 Hideous Laughter", "Compendium.dnd5e.spells24.Item.phbsplTashasHide"],
["猎人印记 Hunter's Mark", "Compendium.dnd5e.spells24.Item.phbsplHuntersMar"],
["生命灵光 Aura of Life", "Compendium.dnd5e.spells24.Item.phbsplAuraofLife"],
["生物定位术 Locate Creature", "Compendium.dnd5e.spells24.Item.phbsplLocateCrea"],
["电爪 Shocking Grasp", "Compendium.dnd5e.spells24.Item.phbsplShockingGr"],
["疗伤术 Cure Wounds", "Compendium.dnd5e.spells24.Item.phbsplCureWounds"],
["疫病术 Contagion", "Compendium.dnd5e.spells24.Item.phbsplContagion0"],
["疫病虫群 Insect Plague", "Compendium.dnd5e.spells24.Item.phbsplInsectPlag"],
["目盲术/耳聋术 Blindness/Deafness", "Compendium.dnd5e.spells24.Item.phbsplBlindnessD"],
["真知术 True Seeing", "Compendium.dnd5e.spells24.Item.phbsplTrueSeeing"],
["睡眠 Sleep", "Compendium.dnd5e.spells24.Item.phbsplSleep00000"],
["瞬间召唤 Instant Summons", "Compendium.dnd5e.spells24.Item.phbsplDrawmijsIn"],
["短讯术 Sending", "Compendium.dnd5e.spells24.Item.phbsplSending000"],
["石化术 Flesh to Stone", "Compendium.dnd5e.spells24.Item.phbsplFleshtoSto"],
["石墙术 Wall of Stone", "Compendium.dnd5e.spells24.Item.phbsplWallofSton"],
["石肤术 Stoneskin", "Compendium.dnd5e.spells24.Item.phbsplStoneskin0"],
["祈愿术 Wish", "Compendium.dnd5e.spells24.Item.phbsplWish000000"],
["祝福术 Bless", "Compendium.dnd5e.spells24.Item.phbsplBless00000"],
["神导术 Guidance", "Compendium.dnd5e.spells24.Item.phbsplGuidance00"],
["神恩 Divine Favor", "Compendium.dnd5e.spells24.Item.phbsplDivineFavo"],
["神莓术 Goodberry", "Compendium.dnd5e.spells24.Item.phbsplGoodberry0"],
["禁入 Forbiddance", "Compendium.dnd5e.spells24.Item.phbsplForbiddanc"],
["禁锢术 Imprisonment", "Compendium.dnd5e.spells24.Item.phbsplImprisonme"],
["私人密室 Private Sanctum", "Compendium.dnd5e.spells24.Item.phbPrivateSanctu"],
["秘法眼 Arcane Eye", "Compendium.dnd5e.spells24.Item.phbsplArcaneEye0"],
["秘法锁 Arcane Lock", "Compendium.dnd5e.spells24.Item.phbsplArcaneLock"],
["秘藏箱 Secret Chest", "Compendium.dnd5e.spells24.Item.phbsplLeomundsSe"],
["移除诅咒 Remove Curse", "Compendium.dnd5e.spells24.Item.phbsplRemoveCurs"],
["穿墙术 Passwall", "Compendium.dnd5e.spells24.Item.phbsplPasswall00"],
["篡改记忆 Modify Memory", "Compendium.dnd5e.spells24.Item.phbsplModifyMemo"],
["粉碎音波 Shatter", "Compendium.dnd5e.spells24.Item.phbsplShatter000"],
["繁彩球 Chromatic Orb", "Compendium.dnd5e.spells24.Item.phbsplChromaticO"],
["纠缠术 Entangle", "Compendium.dnd5e.spells24.Item.phbsplEntangle00"],
["维生术 Spare the Dying", "Compendium.dnd5e.spells24.Item.phbsplSparetheDy"],
["缓慢术 Slow", "Compendium.dnd5e.spells24.Item.phbsplSlow000000"],
["群体医疗术 Mass Heal", "Compendium.dnd5e.spells24.Item.phbsplMassHeal00"],
["群体暗示术 Mass Suggestion", "Compendium.dnd5e.spells24.Item.phbsplMassSugges"],
["群体治愈真言 Mass Healing Word", "Compendium.dnd5e.spells24.Item.phbsplMassHealin"],
["群体疗伤术 Mass Cure Wounds", "Compendium.dnd5e.spells24.Item.phbsplMassCureWo"],
["羽落术 Feather Fall", "Compendium.dnd5e.spells24.Item.phbsplFeatherFal"],
["脆弱诅咒 Hex", "Compendium.dnd5e.spells24.Item.phbsplHex0000000"],
["脚底抹油 Expeditious Retreat", "Compendium.dnd5e.spells24.Item.phbsplExpeditiou"],
["臭云术 Stinking Cloud", "Compendium.dnd5e.spells24.Item.phbsplStinkingCl"],
["至圣斩 Divine Smite", "Compendium.dnd5e.spells24.Item.phbsplDivineSmit"],
["致伤术 Inflict Wounds", "Compendium.dnd5e.spells24.Item.phbsplInflictWou"],
["致病射线 Ray of Sickness", "Compendium.dnd5e.spells24.Item.phbsplRayofSickn"],
["舞光术 Dancing Lights", "Compendium.dnd5e.spells24.Item.phbsplDancingLig"],
["花言巧语 Glibness", "Compendium.dnd5e.spells24.Item.phbsplGlibness00"],
["英雄宴 Heroes' Feast", "Compendium.dnd5e.spells24.Item.phbsplHeroesFeas"],
["英雄气概 Heroism", "Compendium.dnd5e.spells24.Item.phbsplHeroism000"],
["荆棘丛生 Spike Growth", "Compendium.dnd5e.spells24.Item.phbsplSpikeGrowt"],
["虔诚护盾 Shield of Faith", "Compendium.dnd5e.spells24.Item.phbsplShieldofFa"],
["虚假生命 False Life", "Compendium.dnd5e.spells24.Item.phbsplFalseLife0"],
["虹光喷射 Prismatic Spray", "Compendium.dnd5e.spells24.Item.phbsplPrismaticS"],
["虹光法墙 Prismatic Wall", "Compendium.dnd5e.spells24.Item.phbsplPrismaticW"],
["蛛网术 Web", "Compendium.dnd5e.spells24.Item.phbsplWeb0000000"],
["蛛行 Spider Climb", "Compendium.dnd5e.spells24.Item.phbsplSpiderClim"],
["融身入石 Meld into Stone", "Compendium.dnd5e.spells24.Item.phbsplMeldintoSt"],
["行动无踪 Pass without Trace", "Compendium.dnd5e.spells24.Item.phbsplPasswithou"],
["行动自如 Freedom of Movement", "Compendium.dnd5e.spells24.Item.phbsplFreedomofM"],
["衰弱射线 Ray of Enfeeblement", "Compendium.dnd5e.spells24.Item.phbsplRayofEnfee"],
["解离术 Disintegrate", "Compendium.dnd5e.spells24.Item.phbsplDisintegra"],
["解除魔法 Dispel Magic", "Compendium.dnd5e.spells24.Item.phbsplDispelMagi"],
["触发术 Contingency", "Compendium.dnd5e.spells24.Item.phbsplContingenc"],
["警报术 Alarm", "Compendium.dnd5e.spells24.Item.phbsplAlarm00000"],
["识破隐形 See Invisibility", "Compendium.dnd5e.spells24.Item.phbsplSeeInvisib"],
["诚实之域 Zone of Truth", "Compendium.dnd5e.spells24.Item.phbsplZoneofTrut"],
["谭森浮碟术 Floating Disk", "Compendium.dnd5e.spells24.Item.phbsplTensersFlo"],
["豪宅术 Magnificent Mansion", "Compendium.dnd5e.spells24.Item.phbMagnificentMa"],
["跳跃术 Jump", "Compendium.dnd5e.spells24.Item.phbsplJump000000"],
["转生术 Reincarnate", "Compendium.dnd5e.spells24.Item.phbsplReincarnat"],
["连锁闪电 Chain Lightning", "Compendium.dnd5e.spells24.Item.phbsplChainLight"],
["迷宫术 Maze", "Compendium.dnd5e.spells24.Item.phbsplMaze000000"],
["迷幻手稿 Illusory Script", "Compendium.dnd5e.spells24.Item.phbsplIllusorySc"],
["迷舞 Irresistible Dance", "Compendium.dnd5e.spells24.Item.phbsplOttosIrres"],
["迷踪步 Misty Step", "Compendium.dnd5e.spells24.Item.phbsplMistyStep0"],
["通晓传奇 Legend Lore", "Compendium.dnd5e.spells24.Item.phbsplLegendLore"],
["通晓语言 Comprehend Languages", "Compendium.dnd5e.spells24.Item.phbsplComprehend"],
["通神术 Commune", "Compendium.dnd5e.spells24.Item.phbsplCommune000"],
["造水术/枯水术 Create or Destroy Water", "Compendium.dnd5e.spells24.Item.phbsplCreateorDe"],
["造物术 Creation", "Compendium.dnd5e.spells24.Item.phbsplCreation00"],
["造粮术 Create Food and Water", "Compendium.dnd5e.spells24.Item.phbsplCreateFood"],
["造风术 Gust of Wind", "Compendium.dnd5e.spells24.Item.phbsplGustofWind"],
["遗体防腐 Gentle Repose", "Compendium.dnd5e.spells24.Item.phbsplGentleRepo"],
["酸液飞溅 Acid Splash", "Compendium.dnd5e.spells24.Item.phbsplAcidSplash"],
["重伤术 Harm", "Compendium.dnd5e.spells24.Item.phbsplHarm000000"],
["鉴定术 Identify", "Compendium.dnd5e.spells24.Item.phbsplIdentify00"],
["铜墙铁壁 Guards and Wards", "Compendium.dnd5e.spells24.Item.phbsplGuardsandW"],
["镜影术 Mirror Image", "Compendium.dnd5e.spells24.Item.phbsplMirrorImag"],
["闪现术 Blink", "Compendium.dnd5e.spells24.Item.phbsplBlink00000"],
["闪电束 Lightning Bolt", "Compendium.dnd5e.spells24.Item.phbsplLightningB"],
["闪耀斩 Shining Smite", "Compendium.dnd5e.spells24.Item.phbsplShiningSmi"],
["问道自然 Commune with Nature", "Compendium.dnd5e.spells24.Item.phbsplCommunewit"],
["防护善恶 Protection from Evil and Good", "Compendium.dnd5e.spells24.Item.phbEvilAndGoodPr"],
["防护毒素 Protection from Poison", "Compendium.dnd5e.spells24.Item.phbsplProtection"],
["防护法阵 Magic Circle", "Compendium.dnd5e.spells24.Item.phbsplMagicCircl"],
["防护能量 Protection from Energy", "Compendium.dnd5e.spells24.Item.phbProtectionFro"],
["防死结界 Death Ward", "Compendium.dnd5e.spells24.Item.phbsplDeathWard0"],
["防活物护罩 Antilife Shell", "Compendium.dnd5e.spells24.Item.phbsplAntilifeSh"],
["阳炎射线 Sunbeam", "Compendium.dnd5e.spells24.Item.phbsplSunbeam000"],
["阳炎爆 Sunburst", "Compendium.dnd5e.spells24.Item.phbsplSunburst00"],
["降咒 Bestow Curse", "Compendium.dnd5e.spells24.Item.phbsplBestowCurs"],
["隐形仆役 Unseen Servant", "Compendium.dnd5e.spells24.Item.phbsplUnseenServ"],
["隐形术 Invisibility", "Compendium.dnd5e.spells24.Item.phbsplInvisibili"],
["隔离术 Sequester", "Compendium.dnd5e.spells24.Item.phbsplSequester0"],
["雪雨暴 Sleet Storm", "Compendium.dnd5e.spells24.Item.phbsplSleetStorm"],
["雷鸣波 Thunderwave", "Compendium.dnd5e.spells24.Item.phbsplThunderwav"],
["预置幻象 Programmed Illusion", "Compendium.dnd5e.spells24.Item.phbsplProgrammed"],
["预见术 Foresight", "Compendium.dnd5e.spells24.Item.phbsplForesight0"],
["预言术 Divination", "Compendium.dnd5e.spells24.Item.phbsplDivination"],
["颤栗之触 Chill Touch", "Compendium.dnd5e.spells24.Item.phbsplChillTouch"],
["风墙术 Wind Wall", "Compendium.dnd5e.spells24.Item.phbsplWindWall00"],
["飞行术 Fly", "Compendium.dnd5e.spells24.Item.phbsplFly0000000"],
["驱逐善恶 Dispel Evil and Good", "Compendium.dnd5e.spells24.Item.phbsplDispelEvil"],
["高等复原术 Greater Restoration", "Compendium.dnd5e.spells24.Item.phbsplGreaterRes"],
["高等幻影 Major Image", "Compendium.dnd5e.spells24.Item.phbsplMajorImage"],
["高等隐形术 Greater Invisibility", "Compendium.dnd5e.spells24.Item.phbsplGreaterInv"],
["鬼斧神工 Fabricate", "Compendium.dnd5e.spells24.Item.phbsplFabricate0"],
["魅影之力 Phantasmal Force", "Compendium.dnd5e.spells24.Item.phbPhantasmalFor"],
["魅影杀手 Phantasmal Killer", "Compendium.dnd5e.spells24.Item.phbsplPhantasmal"],
["魅影驹 Phantom Steed", "Compendium.dnd5e.spells24.Item.phbsplPhantomSte"],
["魅惑怪物 Charm Monster", "Compendium.dnd5e.spells24.Item.phbsplCharmMonst"],
["魅惑类人 Charm Person", "Compendium.dnd5e.spells24.Item.phbsplCharmPerso"],
["魔化武器 Magic Weapon", "Compendium.dnd5e.spells24.Item.phbsplMagicWeapo"],
["魔嘴术 Magic Mouth", "Compendium.dnd5e.spells24.Item.phbsplMagicMouth"],
["魔法伎俩 Prestidigitation", "Compendium.dnd5e.spells24.Item.phbsplPrestidigi"],
["魔法飞弹 Magic Missile", "Compendium.dnd5e.spells24.Item.phbsplMagicMissi"],
["魔绳术 Rope Trick", "Compendium.dnd5e.spells24.Item.phbsplRopeTrick0"],
["魔能爆 Eldritch Blast", "Compendium.dnd5e.spells24.Item.phbsplEldritchBl"],
["魔邓肯忠犬 Faithful Hound", "Compendium.dnd5e.spells24.Item.phbFaithfulHound"],
["魔魂壶 Magic Jar", "Compendium.dnd5e.spells24.Item.phbsplMagicJar00"],
["鹰眼术 Clairvoyance", "Compendium.dnd5e.spells24.Item.phbsplClairvoyan"],
["黑暗术 Darkness", "Compendium.dnd5e.spells24.Item.phbsplDarkness00"],
["黑暗视觉 Darkvision", "Compendium.dnd5e.spells24.Item.phbsplDarkvision"],
["黑触手 Black Tentacles", "Compendium.dnd5e.spells24.Item.phbsplEvardsBlac"],
["龙息术 Dragon's Breath", "Compendium.dnd5e.spells24.Item.phbsplDragonsBre"],
["龙类召唤术 Summon Dragon", "Compendium.dnd5e.spells24.Item.phbsplSummonDrag"],
```

### §37 · `dnd5e_collection_2024.phb-content`（391 条） — dnd5e 2024 PHB 内容
```text
["七彩喷射 Color Spray", "Compendium.dnd5e_collection_2024.phb-content.Item.iiSaCFEa4sk1Cy7W"],
["万箭齐发 Conjure Volley", "Compendium.dnd5e_collection_2024.phb-content.Item.EF5klu43zVVxcO3v"],
["不灭明焰 Continual Flame", "Compendium.dnd5e_collection_2024.phb-content.Item.MbhFpVSlc2FYEaG4"],
["不谐低语 Dissonant Whispers", "Compendium.dnd5e_collection_2024.phb-content.Item.7TnlLsQaf6xyCLkw"],
["云雾术 Fog Cloud", "Compendium.dnd5e_collection_2024.phb-content.Item.Rj80d3qVPV91csLW"],
["亡灵召唤术 Summon Undead", "Compendium.dnd5e_collection_2024.phb-content.Item.ALCsdq6jJZnmh6AJ"],
["亡者丧钟 Toll the Dead", "Compendium.dnd5e_collection_2024.phb-content.Item.6hwSu9iz5bQ1FJE9"],
["交友术 Friends", "Compendium.dnd5e_collection_2024.phb-content.Item.YCfjWD1CB38Q58Em"],
["以太化 Etherealness", "Compendium.dnd5e_collection_2024.phb-content.Item.pk5KHy4TZWVd3hHh"],
["任意门 Dimension Door", "Compendium.dnd5e_collection_2024.phb-content.Item.TCj9jgRFD7GWln6v"],
["传讯术 Message", "Compendium.dnd5e_collection_2024.phb-content.Item.navlSKAmuBu3auPf"],
["传送术 Teleport", "Compendium.dnd5e_collection_2024.phb-content.Item.yJSpRz19Z2u5CPLo"],
["传送法阵 Teleportation Circle", "Compendium.dnd5e_collection_2024.phb-content.Item.YhF0iJp8uRb0wZjW"],
["伪装术 Seeming", "Compendium.dnd5e_collection_2024.phb-content.Item.XzrRVuH9jNbuiN4t"],
["位面传送 Plane Shift", "Compendium.dnd5e_collection_2024.phb-content.Item.0F8DCDSOPas8fhtr"],
["侦测善恶 Detect Evil and Good", "Compendium.dnd5e_collection_2024.phb-content.Item.hkNchOAYqkaDN8DE"],
["侦测思想 Detect Thoughts", "Compendium.dnd5e_collection_2024.phb-content.Item.bpr4JyUSSArHjFtV"],
["侦测毒性和疾病 Detect Poison and Disease", "Compendium.dnd5e_collection_2024.phb-content.Item.rKzOsVAmqjUAIwyz"],
["侦测魔法 Detect Magic", "Compendium.dnd5e_collection_2024.phb-content.Item.V3R7ySjbxqIr6D6I"],
["信仰守卫 Guardian of Faith", "Compendium.dnd5e_collection_2024.phb-content.Item.obmayLLfJmrI3Jil"],
["修复术 Mending", "Compendium.dnd5e_collection_2024.phb-content.Item.NIAbAPgT8OE60Gxi"],
["假死术 Feign Death", "Compendium.dnd5e_collection_2024.phb-content.Item.GbDsGH7SIdsf5sO6"],
["假象术 Mislead", "Compendium.dnd5e_collection_2024.phb-content.Item.6gEhLhlP2WzVoENw"],
["催眠图纹 Hypnotic Pattern", "Compendium.dnd5e_collection_2024.phb-content.Item.FALa6Xs8gzCEF7fN"],
["元素召唤术 Summon Elemental", "Compendium.dnd5e_collection_2024.phb-content.Item.MhF2WVNLoOa41wp2"],
["元素武器 Elemental Weapon", "Compendium.dnd5e_collection_2024.phb-content.Item.DxGVeN9xu4xm9K5e"],
["光亮术 Light", "Compendium.dnd5e_collection_2024.phb-content.Item.IjDGjlzyZ8BlIv8s"],
["光导箭 Guiding Bolt", "Compendium.dnd5e_collection_2024.phb-content.Item.oDSWFRiXQkUXQ1jf"],
["光耀祷词 Word of Radiance", "Compendium.dnd5e_collection_2024.phb-content.Item.Kj276LGg5aPZFn86"],
["克敌先击 True Strike", "Compendium.dnd5e_collection_2024.phb-content.Item.Xj9p6rq0T7bQd8G4"],
["克隆术 Clone", "Compendium.dnd5e_collection_2024.phb-content.Item.xf6XKtFB6Ia3wD9Q"],
["再生术 Regenerate", "Compendium.dnd5e_collection_2024.phb-content.Item.lsuHFmD5ndQuzD3n"],
["冰刃 Ice Knife", "Compendium.dnd5e_collection_2024.phb-content.Item.LrYXrzXMcHOaSIgn"],
["冰墙术 Wall of Ice", "Compendium.dnd5e_collection_2024.phb-content.Item.CKyaVRtvJngRx2h7"],
["冰狱霜铠 Armor of Agathys", "Compendium.dnd5e_collection_2024.phb-content.Item.6BSyA5XABb2DzLV6"],
["冰风暴 Ice Storm", "Compendium.dnd5e_collection_2024.phb-content.Item.5YU6YLSuUuu1Kd7E"],
["冷冻射线 Ray of Frost", "Compendium.dnd5e_collection_2024.phb-content.Item.W37Fkt1CHGK7C1of"],
["净化灵光 Aura of Purity", "Compendium.dnd5e_collection_2024.phb-content.Item.1kfCyndFk9XGt1pj"],
["净化饮食 Purify Food and Drink", "Compendium.dnd5e_collection_2024.phb-content.Item.5G8MHfCsea7PfRRL"],
["创造半位面 Demiplane", "Compendium.dnd5e_collection_2024.phb-content.Item.vePD423lF9FnIeo9"],
["剑刃护壁 Blade Barrier", "Compendium.dnd5e_collection_2024.phb-content.Item.OjUDevMPweL0XvKH"],
["剑刃防护 Blade Ward", "Compendium.dnd5e_collection_2024.phb-content.Item.bi3nMcx9UIVmrTXg"],
["力场墙 Wall of Force", "Compendium.dnd5e_collection_2024.phb-content.Item.iFhf1xG1jvsgL0Q1"],
["力场监牢 Forcecage", "Compendium.dnd5e_collection_2024.phb-content.Item.2iwaq4eXhUr4qrzx"],
["加速术 Haste", "Compendium.dnd5e_collection_2024.phb-content.Item.7kfO7nFaWWHR644W"],
["动植物定位术 Locate Animals or Plants", "Compendium.dnd5e_collection_2024.phb-content.Item.HSMcGquBiwcFPE2l"],
["动物交谈 Speak with Animals", "Compendium.dnd5e_collection_2024.phb-content.Item.jQRd32RmMYG1DClA"],
["动物信使 Animal Messenger", "Compendium.dnd5e_collection_2024.phb-content.Item.dz3W7gqibqbanT3E"],
["动物形态 Animal Shapes", "Compendium.dnd5e_collection_2024.phb-content.Item.vKcW6U70aGy9d1ai"],
["匕首之云 Cloud of Daggers", "Compendium.dnd5e_collection_2024.phb-content.Item.7Q5RuFO5QEiZmxsU"],
["化兽为友 Animal Friendship", "Compendium.dnd5e_collection_2024.phb-content.Item.GULs1wblA99T7cqF"],
["医疗术 Heal", "Compendium.dnd5e_collection_2024.phb-content.Item.kcI6qUFXpNjSLth5"],
["十字军披风 Crusader's Mantle", "Compendium.dnd5e_collection_2024.phb-content.Item.n2GHLwUQGnICI7D4"],
["卓姆吉瞬间召唤 Drawmij's Instant Summons", "Compendium.dnd5e_collection_2024.phb-content.Item.s7ri3sMjPU3M1mT8"],
["卜筮术 Augury", "Compendium.dnd5e_collection_2024.phb-content.Item.tcBljA9jXN0WI03f"],
["原力法阵 Circle of Power", "Compendium.dnd5e_collection_2024.phb-content.Item.qutZJPSeE0cWvoeI"],
["反转重力 Reverse Gravity", "Compendium.dnd5e_collection_2024.phb-content.Item.DapNR7WvFbQG31AH"],
["反魔法场 Antimagic Field", "Compendium.dnd5e_collection_2024.phb-content.Item.LxthzbxPtlgAZ6c2"],
["变巨术／缩小术 Enlarge/Reduce", "Compendium.dnd5e_collection_2024.phb-content.Item.scYPQAmh5NO3cnO8"],
["变形术 Polymorph", "Compendium.dnd5e_collection_2024.phb-content.Item.S58EZtQXPSFycVf0"],
["变造自身 Alter Self", "Compendium.dnd5e_collection_2024.phb-content.Item.M2OyZeLgV7wQoHJz"],
["召雷术 Call Lightning", "Compendium.dnd5e_collection_2024.phb-content.Item.LXt9AkeaomVpNlrk"],
["启蒙术 Awaken", "Compendium.dnd5e_collection_2024.phb-content.Item.v1nSo3BafNcGJ2rk"],
["吸血鬼之触 Vampiric Touch", "Compendium.dnd5e_collection_2024.phb-content.Item.OINFEp8mIs728MPC"],
["命令术 Command", "Compendium.dnd5e_collection_2024.phb-content.Item.MExq97njl4rCtG9x"],
["咒唤元素 Conjure Elemental", "Compendium.dnd5e_collection_2024.phb-content.Item.VWgPbI7ZCkSdshqI"],
["咒唤兽群 Conjure Animals", "Compendium.dnd5e_collection_2024.phb-content.Item.TJdYum4ykwhcLIwi"],
["咒唤圣光 Conjure Celestial", "Compendium.dnd5e_collection_2024.phb-content.Item.jU0U91DzmiGadJUc"],
["咒唤妖精 Conjure Fey", "Compendium.dnd5e_collection_2024.phb-content.Item.uB1tgawIqhw9RU5t"],
["咒唤微元素群 Conjure Minor Elementals", "Compendium.dnd5e_collection_2024.phb-content.Item.TmU1hCcSugE8HlwS"],
["咒唤林地精群 Conjure Woodland Beings", "Compendium.dnd5e_collection_2024.phb-content.Item.QJfWkLTbK9aJuM6b"],
["哈达之欲 Hunger of Hadar", "Compendium.dnd5e_collection_2024.phb-content.Item.bVQs57spB6r1uKGY"],
["哈达之臂 Arms of Hadar", "Compendium.dnd5e_collection_2024.phb-content.Item.Ecw5toRzCEkIEs7K"],
["唤起亡灵 Create Undead", "Compendium.dnd5e_collection_2024.phb-content.Item.jeuqdYBCNlEXXuDC"],
["四象法门 Elementalism", "Compendium.dnd5e_collection_2024.phb-content.Item.wnoQeFTQDIL69NzT"],
["回生术 Revivify", "Compendium.dnd5e_collection_2024.phb-content.Item.41g2fyraSDkFXG7L"],
["回返真言 Word of Recall", "Compendium.dnd5e_collection_2024.phb-content.Item.6wBe5NGBaxobIAgh"],
["回避侦测 Nondetection", "Compendium.dnd5e_collection_2024.phb-content.Item.YfQEvlmrTzNhyyR0"],
["困惑术 Confusion", "Compendium.dnd5e_collection_2024.phb-content.Item.OuF5hUCX8HS3pms1"],
["圣居 Hallow", "Compendium.dnd5e_collection_2024.phb-content.Item.F6YxyeyONp392242"],
["圣洁灵光 Holy Aura", "Compendium.dnd5e_collection_2024.phb-content.Item.Nb0e142WXNHFXSH4"],
["圣火术 Sacred Flame", "Compendium.dnd5e_collection_2024.phb-content.Item.R6xjlmjmWbqnY0yt"],
["圣言术 Divine Word", "Compendium.dnd5e_collection_2024.phb-content.Item.ma0xlbHsoHLHIy6A"],
["地动术 Move Earth", "Compendium.dnd5e_collection_2024.phb-content.Item.0AxP2uU9WxQmpKHH"],
["地震术 Earthquake", "Compendium.dnd5e_collection_2024.phb-content.Item.rE0BCrb9X6Lm4ByM"],
["塑石术 Stone Shape", "Compendium.dnd5e_collection_2024.phb-content.Item.8IB5rTZNCLJMU8TM"],
["塔莎冒泡大锅 Tasha's Bubbling Cauldron", "Compendium.dnd5e_collection_2024.phb-content.Item.e3Rwg8fMvVLjL2l9"],
["塔莎狂笑术 Tasha's Hideous Laughter", "Compendium.dnd5e_collection_2024.phb-content.Item.zAC6NL1hj5EdH9xz"],
["复仇风暴 Storm of Vengeance", "Compendium.dnd5e_collection_2024.phb-content.Item.zGHh3PLInf0Mj9qD"],
["复生术 Resurrection", "Compendium.dnd5e_collection_2024.phb-content.Item.xv4KUJoLQAYzGZGK"],
["复苏秘法 Arcane Vigor", "Compendium.dnd5e_collection_2024.phb-content.Item.5LnZkOFhvz5LEov2"],
["大步奔行 Longstrider", "Compendium.dnd5e_collection_2024.phb-content.Item.w6XA7RxbogJtvSaM"],
["天界召唤术 Summon Celestial", "Compendium.dnd5e_collection_2024.phb-content.Item.JMx0DR5xwDplQZ4s"],
["奇术 Thaumaturgy", "Compendium.dnd5e_collection_2024.phb-content.Item.D9f0iZuL8BD9pfTx"],
["奥图迷舞 Otto's Irresistible Dance", "Compendium.dnd5e_collection_2024.phb-content.Item.LsrVLWiiCv3NlaRd"],
["妖火 Faerie Fire", "Compendium.dnd5e_collection_2024.phb-content.Item.h1Qg5REz27bZsFVj"],
["妖精召唤术 Summon Fey", "Compendium.dnd5e_collection_2024.phb-content.Item.mTZQF9DfqSqqC31y"],
["嫌恶术／关怀术 Antipathy/Sympathy", "Compendium.dnd5e_collection_2024.phb-content.Item.Tpr6II1W5ikMIYTA"],
["守卫刻纹 Glyph of Warding", "Compendium.dnd5e_collection_2024.phb-content.Item.oUURtReMn8pfKbzf"],
["守护之链 Warding Bond", "Compendium.dnd5e_collection_2024.phb-content.Item.GngRaFQR7Johygsp"],
["安定心神 Calm Emotions", "Compendium.dnd5e_collection_2024.phb-content.Item.Ia8YiW3kof5cdtTf"],
["完全变形术 True Polymorph", "Compendium.dnd5e_collection_2024.phb-content.Item.rsa4CS3gB928n3dw"],
["完全复生术 True Resurrection", "Compendium.dnd5e_collection_2024.phb-content.Item.D0loISbu0UWuUOyt"],
["定身怪物 Hold Monster", "Compendium.dnd5e_collection_2024.phb-content.Item.5OCvLgnt5T3wCEIe"],
["定身类人 Hold Person", "Compendium.dnd5e_collection_2024.phb-content.Item.WJtXG4RuJhysvKp3"],
["寻找陷阱 Find Traps", "Compendium.dnd5e_collection_2024.phb-content.Item.1AS07P8B23dHdXNV"],
["寻获坐骑 Find Steed", "Compendium.dnd5e_collection_2024.phb-content.Item.gBQVYt5Fl1XzRKdQ"],
["寻获魔宠 Find Familiar", "Compendium.dnd5e_collection_2024.phb-content.Item.rmW7l1rm1mqAacaA"],
["寻路术 Find the Path", "Compendium.dnd5e_collection_2024.phb-content.Item.PTI4avp06NAwcm0i"],
["巧言术 Tongues", "Compendium.dnd5e_collection_2024.phb-content.Item.bYNhX15NeZz9y2DZ"],
["巨虫术 Giant Insect", "Compendium.dnd5e_collection_2024.phb-content.Item.TrLUou5GiQJHFfZC"],
["巫术箭 Witch Bolt", "Compendium.dnd5e_collection_2024.phb-content.Item.048efYz2pvCkTdvJ"],
["希望信标 Beacon of Hope", "Compendium.dnd5e_collection_2024.phb-content.Item.EtUxGUXgvzlEjsVj"],
["幻景 Hallucinatory Terrain", "Compendium.dnd5e_collection_2024.phb-content.Item.t1p4yy1sHV6ReFU6"],
["庇护术 Sanctuary", "Compendium.dnd5e_collection_2024.phb-content.Item.VBIRHPowy28fcwWv"],
["延迟爆裂火球 Delayed Blast Fireball", "Compendium.dnd5e_collection_2024.phb-content.Item.9f6RHjkKebkZEe93"],
["异怪召唤术 Summon Aberration", "Compendium.dnd5e_collection_2024.phb-content.Item.xRhQD1lgVwYTRsZL"],
["异界之门 Gate", "Compendium.dnd5e_collection_2024.phb-content.Item.qsbpnLZhBtDBHZmB"],
["异界探知 Contact Other Plane", "Compendium.dnd5e_collection_2024.phb-content.Item.5KmXgIZHipOytGHv"],
["异界誓盟 Planar Ally", "Compendium.dnd5e_collection_2024.phb-content.Item.vncSyGg2cttZVJ1b"],
["异界誓缚 Planar Binding", "Compendium.dnd5e_collection_2024.phb-content.Item.nwOhvyfxFOB5Wf8P"],
["强令对决 Compelled Duel", "Compendium.dnd5e_collection_2024.phb-content.Item.Ld23U56MAOzVesGx"],
["强化属性 Enhance Ability", "Compendium.dnd5e_collection_2024.phb-content.Item.HzWr8VnhBMxpqcLU"],
["强迫术 Compulsion", "Compendium.dnd5e_collection_2024.phb-content.Item.xVwnpaN79CoHGto7"],
["形体变化 Shapechange", "Compendium.dnd5e_collection_2024.phb-content.Item.nte2TDrCunnUD0bs"],
["律令医疗 Power Word Heal", "Compendium.dnd5e_collection_2024.phb-content.Item.pOdOfRQFgdO6uSBA"],
["律令巩固 Power Word Fortify", "Compendium.dnd5e_collection_2024.phb-content.Item.1HOohqhAcBMlHleA"],
["律令死亡 Power Word Kill", "Compendium.dnd5e_collection_2024.phb-content.Item.wGoB7uO7cFOnKJUQ"],
["律令震慑 Power Word Stun", "Compendium.dnd5e_collection_2024.phb-content.Item.GIw2768jcfr3HuIw"],
["御风而行 Wind Walk", "Compendium.dnd5e_collection_2024.phb-content.Item.Hc6jJ1Py61aAJt7v"],
["德鲁伊伎俩 Druidcraft", "Compendium.dnd5e_collection_2024.phb-content.Item.XlWruJmpZpxGtcTc"],
["徽记术 Symbol", "Compendium.dnd5e_collection_2024.phb-content.Item.ApiOkF9MNo370cCZ"],
["心灵之楔 Mind Sliver", "Compendium.dnd5e_collection_2024.phb-content.Item.2RbK2EbBxaHUwd8R"],
["心灵尖刺 Mind Spike", "Compendium.dnd5e_collection_2024.phb-content.Item.uFn9eFz1txjgEdl7"],
["心灵屏障 Mind Blank", "Compendium.dnd5e_collection_2024.phb-content.Item.IWm3wrtazwPRM996"],
["心灵感应 Telepathy", "Compendium.dnd5e_collection_2024.phb-content.Item.S3xhXg4Djow4KsST"],
["心灵遥控 Telekinesis", "Compendium.dnd5e_collection_2024.phb-content.Item.qLOrI5OFfkvEFqGV"],
["怪影杀手 Weird", "Compendium.dnd5e_collection_2024.phb-content.Item.KNvTunXUwUb3qnTP"],
["恐惧术 Fear", "Compendium.dnd5e_collection_2024.phb-content.Item.gGgw5MhpAJKrtWFw"],
["恶言相加 Vicious Mockery", "Compendium.dnd5e_collection_2024.phb-content.Item.Omg54HcWrx1T21li"],
["悠兰德王者威仪 Yolande's Regal Presence", "Compendium.dnd5e_collection_2024.phb-content.Item.CJl79tlGJL0TgQ6G"],
["惊惧斩 Staggering Smite", "Compendium.dnd5e_collection_2024.phb-content.Item.qae9GQ1JfWQFDnho"],
["托梦术 Dream", "Compendium.dnd5e_collection_2024.phb-content.Item.Xpm5LPWcawGEkT5y"],
["投影术 Project Image", "Compendium.dnd5e_collection_2024.phb-content.Item.ymf7fkjQ1Ykauy4u"],
["护盾术 Shield", "Compendium.dnd5e_collection_2024.phb-content.Item.r5wTB4zwPJNcIdoz"],
["抵抗术 Resistance", "Compendium.dnd5e_collection_2024.phb-content.Item.bJPkyGkYWxeRQgMY"],
["拉瑞心灵联结 Rary's Telepathic Bond", "Compendium.dnd5e_collection_2024.phb-content.Item.Cm2MSSExmO3kXWP7"],
["拟像术 Simulacrum", "Compendium.dnd5e_collection_2024.phb-content.Item.FGTkYLckkrJkQzDV"],
["指使术 Geas", "Compendium.dnd5e_collection_2024.phb-content.Item.Z9wfLDPdhMwtPEBu"],
["捕获打击 Ensnaring Strike", "Compendium.dnd5e_collection_2024.phb-content.Item.kEMZzoQcl3D4PT1v"],
["探知 Scrying", "Compendium.dnd5e_collection_2024.phb-content.Item.0NnW4SYqrBBHYE8G"],
["援助术 Aid", "Compendium.dnd5e_collection_2024.phb-content.Item.UevxY83OWJZNKkwi"],
["摄心目光 Eyebite", "Compendium.dnd5e_collection_2024.phb-content.Item.A6m5VN5D026IScZ3"],
["摧心术 Befuddlement", "Compendium.dnd5e_collection_2024.phb-content.Item.1UVlORR5rE0oZV67"],
["操控天气 Control Weather", "Compendium.dnd5e_collection_2024.phb-content.Item.ZZtGns8bbx1znUkQ"],
["操控水体 Control Water", "Compendium.dnd5e_collection_2024.phb-content.Item.WATIXkl5bHb2B3ID"],
["擒抱藤 Grasping Vine", "Compendium.dnd5e_collection_2024.phb-content.Item.sLhkdFjYpHhX6egN"],
["支配怪物 Dominate Monster", "Compendium.dnd5e_collection_2024.phb-content.Item.wBtr3uDq1qBKS2KJ"],
["支配类人 Dominate Person", "Compendium.dnd5e_collection_2024.phb-content.Item.mgCuGXIkY8BWmLeh"],
["支配野兽 Dominate Beast", "Compendium.dnd5e_collection_2024.phb-content.Item.jKpkUfkgThZ3IQ8B"],
["放逐斩 Banishing Smite", "Compendium.dnd5e_collection_2024.phb-content.Item.CCKG9ajc6Fw6U4eB"],
["放逐术 Banishment", "Compendium.dnd5e_collection_2024.phb-content.Item.aly26veuWOjs69SH"],
["敲击术 Knock", "Compendium.dnd5e_collection_2024.phb-content.Item.hyjDEXtsLk2gfyb3"],
["无声幻影 Silent Image", "Compendium.dnd5e_collection_2024.phb-content.Item.u2nZaeVBmZiDSlY0"],
["时间停止 Time Stop", "Compendium.dnd5e_collection_2024.phb-content.Item.eQ5MbExU6LBcgYGv"],
["易容术 Disguise Self", "Compendium.dnd5e_collection_2024.phb-content.Item.A4J9qL2CsCXpdbfT"],
["星界投影 Astral Projection", "Compendium.dnd5e_collection_2024.phb-content.Item.C8cad5G6lUotua6Z"],
["昼明术 Daylight", "Compendium.dnd5e_collection_2024.phb-content.Item.u7IL5qlkhzAxCMFB"],
["暗示术 Suggestion", "Compendium.dnd5e_collection_2024.phb-content.Item.5KhBtK2VPnA5SzwC"],
["月光涌泉 Fount of Moonlight", "Compendium.dnd5e_collection_2024.phb-content.Item.SJgMvGhfqD8xpX3w"],
["月华之光 Moonbeam", "Compendium.dnd5e_collection_2024.phb-content.Item.hiuTYl4hoqrGdLoI"],
["朦胧术 Blur", "Compendium.dnd5e_collection_2024.phb-content.Item.SNs3Ici1qtLp3aYH"],
["木遁术 Transport via Plants", "Compendium.dnd5e_collection_2024.phb-content.Item.zP3qpni16IDIqHuB"],
["未来视 Foresight", "Compendium.dnd5e_collection_2024.phb-content.Item.5UQ7hQmzPkgJIJRM"],
["术法爆发 Sorcerous Burst", "Compendium.dnd5e_collection_2024.phb-content.Item.wBcVX4PXqteP8tPa"],
["李欧蒙小屋 Leomund's Tiny Hut", "Compendium.dnd5e_collection_2024.phb-content.Item.ZM6uPtO6TsTHHvgA"],
["李欧蒙秘藏箱 Leomund's Secret Chest", "Compendium.dnd5e_collection_2024.phb-content.Item.K3KV547b2kRFamY6"],
["构装召唤术 Summon Construct", "Compendium.dnd5e_collection_2024.phb-content.Item.aPvKxaO9gvYEN5mc"],
["枯萎术 Blight", "Compendium.dnd5e_collection_2024.phb-content.Item.sXEJfbqf05VjLSsp"],
["树肤术 Barkskin", "Compendium.dnd5e_collection_2024.phb-content.Item.p2i5Od6r6HhXeTMk"],
["树跃术 Tree Stride", "Compendium.dnd5e_collection_2024.phb-content.Item.VeBIRZDRq8BDfK9g"],
["棘墙术 Wall of Thorns", "Compendium.dnd5e_collection_2024.phb-content.Item.XqyZjXZsH4ww4h14"],
["植物交谈 Speak with Plants", "Compendium.dnd5e_collection_2024.phb-content.Item.fVOMDyis4qiWCVm6"],
["植物滋长 Plant Growth", "Compendium.dnd5e_collection_2024.phb-content.Item.QlZERO2JxyX94tFt"],
["橡棍术 Shillelagh", "Compendium.dnd5e_collection_2024.phb-content.Item.3NYmyBELaN1xflLc"],
["次级复原术 Lesser Restoration", "Compendium.dnd5e_collection_2024.phb-content.Item.uRgDAGoGKx1w4VHw"],
["次级幻影 Minor Illusion", "Compendium.dnd5e_collection_2024.phb-content.Item.JiMaBuExPb4AUKSh"],
["欧提路克冰封法球 Otiluke's Freezing Sphere", "Compendium.dnd5e_collection_2024.phb-content.Item.lSDON0WsZVEKY1Md"],
["欧提路克弹力法球 Otiluke's Resilient Sphere", "Compendium.dnd5e_collection_2024.phb-content.Item.96qMvTxiK1xY9TSW"],
["死云术 Cloudkill", "Compendium.dnd5e_collection_2024.phb-content.Item.y2qFJYQUUr13yzQc"],
["死亡一指 Finger of Death", "Compendium.dnd5e_collection_2024.phb-content.Item.PxhcvadpOmDmVWFr"],
["死亡法阵 Circle of Death", "Compendium.dnd5e_collection_2024.phb-content.Item.sRRXCVx2N98byfWf"],
["死者交谈 Speak with Dead", "Compendium.dnd5e_collection_2024.phb-content.Item.pBiqkcEYPnRqOlS0"],
["死者复活 Raise Dead", "Compendium.dnd5e_collection_2024.phb-content.Item.ZEX9RmEByJuYNy83"],
["毒气喷溅 Poison Spray", "Compendium.dnd5e_collection_2024.phb-content.Item.nz4AzzQBruyzom2F"],
["毕格比之手 Bigby's Hand", "Compendium.dnd5e_collection_2024.phb-content.Item.x9t3HUr22puApPCP"],
["气化形体 Gaseous Form", "Compendium.dnd5e_collection_2024.phb-content.Item.UJQyLmjqdxyCjw0a"],
["水上行走 Water Walk", "Compendium.dnd5e_collection_2024.phb-content.Item.7cpUXBjzHEYUzrWs"],
["水下呼吸 Water Breathing", "Compendium.dnd5e_collection_2024.phb-content.Item.7B0GplTzg5zX8Woi"],
["沉默术 Silence", "Compendium.dnd5e_collection_2024.phb-content.Item.CkmXU8PLzSdQOsDU"],
["油腻术 Grease", "Compendium.dnd5e_collection_2024.phb-content.Item.cmNz0KRpkFjP7hi2"],
["治愈真言 Healing Word", "Compendium.dnd5e_collection_2024.phb-content.Item.87l8gOHlAmpnuYsn"],
["治疗祷言 Prayer of Healing", "Compendium.dnd5e_collection_2024.phb-content.Item.qfp0jwBiXlFpjyPD"],
["法师之手 Mage Hand", "Compendium.dnd5e_collection_2024.phb-content.Item.FQW54HZHK6PwRCON"],
["法师护甲 Mage Armor", "Compendium.dnd5e_collection_2024.phb-content.Item.Ymha70SeVnoencdF"],
["法术反制 Counterspell", "Compendium.dnd5e_collection_2024.phb-content.Item.6nJTUypnxG65oxnC"],
["法术无效结界 Globe of Invulnerability", "Compendium.dnd5e_collection_2024.phb-content.Item.wWx2uIrrRNksWsJi"],
["注目术 Enthrall", "Compendium.dnd5e_collection_2024.phb-content.Item.EvHMvTssZlaoqy9V"],
["活力灵光 Aura of Vitality", "Compendium.dnd5e_collection_2024.phb-content.Item.HfsDcTrLefiPeBrn"],
["活化死尸 Animate Dead", "Compendium.dnd5e_collection_2024.phb-content.Item.zdIXi2IeUa2uhMAt"],
["活化物件 Animate Objects", "Compendium.dnd5e_collection_2024.phb-content.Item.AEvZ77RmbqZgu5SY"],
["流星爆 Meteor Swarm", "Compendium.dnd5e_collection_2024.phb-content.Item.nkgNj5H4VtY7bKui"],
["浓酸球 Vitriolic Sphere", "Compendium.dnd5e_collection_2024.phb-content.Item.eMqyqIFwV58LJUmT"],
["浮空术 Levitate", "Compendium.dnd5e_collection_2024.phb-content.Item.cin769FdhYaaQF1V"],
["海啸术 Tsunami", "Compendium.dnd5e_collection_2024.phb-content.Item.CqK2WYvTZm48uv35"],
["海市蜃楼 Mirage Arcane", "Compendium.dnd5e_collection_2024.phb-content.Item.9JgKk8orLnO8KHZG"],
["涅斯图魔法灵光 Nystul's Magic Aura", "Compendium.dnd5e_collection_2024.phb-content.Item.JxZ8YsIwjfrahS2R"],
["湮灭波 Destructive Wave", "Compendium.dnd5e_collection_2024.phb-content.Item.ej8Q1UfacXHTtxKd"],
["激愤斩 Wrathful Smite", "Compendium.dnd5e_collection_2024.phb-content.Item.K3w1CpdQVUZ7BW06"],
["火墙术 Wall of Fire", "Compendium.dnd5e_collection_2024.phb-content.Item.gsf730v9Syplbluw"],
["火焰刀 Flame Blade", "Compendium.dnd5e_collection_2024.phb-content.Item.8TIfs5TZoy2SmRDh"],
["火焰护盾 Fire Shield", "Compendium.dnd5e_collection_2024.phb-content.Item.7HdsSTOVSLycY5OG"],
["火焰箭 Fire Bolt", "Compendium.dnd5e_collection_2024.phb-content.Item.uHTVTyyr08JgRQ2U"],
["火焰风暴 Fire Storm", "Compendium.dnd5e_collection_2024.phb-content.Item.1WpU2I7Fm35TkL8l"],
["火球术 Fireball", "Compendium.dnd5e_collection_2024.phb-content.Item.PNhRzF6H22d3fUeB"],
["灵体卫士 Spirit Guardians", "Compendium.dnd5e_collection_2024.phb-content.Item.0vZ2YrSsKcZEKn53"],
["灵体武器 Spiritual Weapon", "Compendium.dnd5e_collection_2024.phb-content.Item.BW7bCXxArX8Z904Z"],
["灼热射线 Scorching Ray", "Compendium.dnd5e_collection_2024.phb-content.Item.eRWWPXSkH8M3q1Mh"],
["灼热金属 Heat Metal", "Compendium.dnd5e_collection_2024.phb-content.Item.gMOc4Ig2c74HwcV0"],
["灾祸术 Bane", "Compendium.dnd5e_collection_2024.phb-content.Item.pk12GnB134mQpaQS"],
["点点星芒 Starry Wisp", "Compendium.dnd5e_collection_2024.phb-content.Item.lg2FpR2sdlqs5faH"],
["炼狱叱喝 Hellish Rebuke", "Compendium.dnd5e_collection_2024.phb-content.Item.mK8TeXFCU0dKXajv"],
["炽焰斩 Searing Smite", "Compendium.dnd5e_collection_2024.phb-content.Item.kWq62uyXIxkN7sRX"],
["炽焰法球 Flaming Sphere", "Compendium.dnd5e_collection_2024.phb-content.Item.K760oyqaj53JHFQA"],
["焚云术 Incendiary Cloud", "Compendium.dnd5e_collection_2024.phb-content.Item.kJO1gGv9v4v8D0TI"],
["焰击术 Flame Strike", "Compendium.dnd5e_collection_2024.phb-content.Item.UomGNTGNS8dSuOnA"],
["燃火术 Produce Flame", "Compendium.dnd5e_collection_2024.phb-content.Item.UGWzuOgnqjPgHKyD"],
["燃烧之手 Burning Hands", "Compendium.dnd5e_collection_2024.phb-content.Item.UyLQcp3ZE9B3Npt4"],
["物件定位术 Locate Object", "Compendium.dnd5e_collection_2024.phb-content.Item.wpiNptTMW7g01sP2"],
["猎人印记 Hunter's Mark", "Compendium.dnd5e_collection_2024.phb-content.Item.011JcD4JPt3IBQYa"],
["生命灵光 Aura of Life", "Compendium.dnd5e_collection_2024.phb-content.Item.ARBklDeZsPaue9pu"],
["生物定位术 Locate Creature", "Compendium.dnd5e_collection_2024.phb-content.Item.iqOD23UlG9iA3jiV"],
["电爪 Shocking Grasp", "Compendium.dnd5e_collection_2024.phb-content.Item.hIHTtpu6OOWmmFu3"],
["疗伤术 Cure Wounds", "Compendium.dnd5e_collection_2024.phb-content.Item.7rVeRZS2tcyBY5Cu"],
["疫病术 Contagion", "Compendium.dnd5e_collection_2024.phb-content.Item.tJdLjwdFFJmRTlWK"],
["疫病虫群 Insect Plague", "Compendium.dnd5e_collection_2024.phb-content.Item.5m0oQFhzzKySuRN8"],
["疯狂冠冕 Crown of Madness", "Compendium.dnd5e_collection_2024.phb-content.Item.zl8WNV0AvfHufAQ8"],
["目盲术／耳聋术 Blindness/Deafness", "Compendium.dnd5e_collection_2024.phb-content.Item.uRJidjlAsHxJ4y7U"],
["真知术 True Seeing", "Compendium.dnd5e_collection_2024.phb-content.Item.cS85ci0ZozWf2ycx"],
["睡眠术 Sleep", "Compendium.dnd5e_collection_2024.phb-content.Item.jDqnWyDvvIV8HxZh"],
["短讯术 Sending", "Compendium.dnd5e_collection_2024.phb-content.Item.f1zs6hG07zBIrzAL"],
["石化术 Flesh to Stone", "Compendium.dnd5e_collection_2024.phb-content.Item.wxDiDKfDthmJ4ahM"],
["石墙术 Wall of Stone", "Compendium.dnd5e_collection_2024.phb-content.Item.FwtQ4ewj6dhJswqg"],
["石肤术 Stoneskin", "Compendium.dnd5e_collection_2024.phb-content.Item.sgfF4dShcwoZfRt7"],
["祈愿术 Wish", "Compendium.dnd5e_collection_2024.phb-content.Item.CQdMJeo4FI5jLAPU"],
["祝福术 Bless", "Compendium.dnd5e_collection_2024.phb-content.Item.t1RUq0PQkeJfELIr"],
["神导术 Guidance", "Compendium.dnd5e_collection_2024.phb-content.Item.p4A1qjnuCn6b3j6N"],
["神恩 Divine Favor", "Compendium.dnd5e_collection_2024.phb-content.Item.cXGo4UoAD0pHyjUW"],
["神莓术 Goodberry", "Compendium.dnd5e_collection_2024.phb-content.Item.Us469jKMIFvbzalb"],
["禁制术 Forbiddance", "Compendium.dnd5e_collection_2024.phb-content.Item.CGhf4cQJJ4Ah7EnB"],
["禁锢术 Imprisonment", "Compendium.dnd5e_collection_2024.phb-content.Item.hhWXfeO0TI8jT7WH"],
["秘法眼 Arcane Eye", "Compendium.dnd5e_collection_2024.phb-content.Item.cQ43kVLr8p7Ruxix"],
["秘法锁 Arcane Lock", "Compendium.dnd5e_collection_2024.phb-content.Item.AxfK0wW0YSzDUqLe"],
["秘法门 Arcane Gate", "Compendium.dnd5e_collection_2024.phb-content.Item.z3eMInZZbwZJiErB"],
["移除诅咒 Remove Curse", "Compendium.dnd5e_collection_2024.phb-content.Item.Jtt83qZ5kmO8nr1U"],
["穿墙术 Passwall", "Compendium.dnd5e_collection_2024.phb-content.Item.DclPZSG23QSoCRlj"],
["突触静止 Synaptic Static", "Compendium.dnd5e_collection_2024.phb-content.Item.eafbYHJJI5lCBbBl"],
["箭如雨下 Conjure Barrage", "Compendium.dnd5e_collection_2024.phb-content.Item.9pyloJdtX02QUaOa"],
["篡改记忆 Modify Memory", "Compendium.dnd5e_collection_2024.phb-content.Item.A2BwTrn1LSIRXKiB"],
["粉碎音波 Shatter", "Compendium.dnd5e_collection_2024.phb-content.Item.BSU4g9fq5m976vjp"],
["繁彩球 Chromatic Orb", "Compendium.dnd5e_collection_2024.phb-content.Item.D8Lt2QCRoMnTJys7"],
["纠缠术 Entangle", "Compendium.dnd5e_collection_2024.phb-content.Item.bVc4ORJ6m43jC6PC"],
["维生术 Spare the Dying", "Compendium.dnd5e_collection_2024.phb-content.Item.hj7mSOENP84VYPT2"],
["缓慢术 Slow", "Compendium.dnd5e_collection_2024.phb-content.Item.3X7rLuY8NbIxfYzw"],
["群体医疗术 Mass Heal", "Compendium.dnd5e_collection_2024.phb-content.Item.qce9AQhoiFeFtlqU"],
["群体暗示术 Mass Suggestion", "Compendium.dnd5e_collection_2024.phb-content.Item.q0GV9UmLaTmQ33cD"],
["群体治愈真言 Mass Healing Word", "Compendium.dnd5e_collection_2024.phb-content.Item.3ywysOT8IJ6MADZq"],
["群体疗伤术 Mass Cure Wounds", "Compendium.dnd5e_collection_2024.phb-content.Item.02k8jzwAjWG8S2nd"],
["羽落术 Feather Fall", "Compendium.dnd5e_collection_2024.phb-content.Item.evALu9oJV22vvn5i"],
["脆弱诅咒 Hex", "Compendium.dnd5e_collection_2024.phb-content.Item.XW0ppsxwSzgFOt7i"],
["脚底抹油 Expeditious Retreat", "Compendium.dnd5e_collection_2024.phb-content.Item.iddv88P02CPOma6a"],
["臭云术 Stinking Cloud", "Compendium.dnd5e_collection_2024.phb-content.Item.CyL40Fy99sUMr1Nb"],
["至圣斩 Divine Smite", "Compendium.dnd5e_collection_2024.phb-content.Item.G1U4aqGAhtB3btpY"],
["致伤术 Inflict Wounds", "Compendium.dnd5e_collection_2024.phb-content.Item.gFhgaGe8oTvD0za7"],
["致病射线 Ray of Sickness", "Compendium.dnd5e_collection_2024.phb-content.Item.mm0h36JwAtiqN4Uy"],
["致盲斩 Blinding Smite", "Compendium.dnd5e_collection_2024.phb-content.Item.Xgr68fmiJRvPxox5"],
["舞光术 Dancing Lights", "Compendium.dnd5e_collection_2024.phb-content.Item.jNU7adv2rucUPkKN"],
["艾伐黑触手 Evard's Black Tentacles", "Compendium.dnd5e_collection_2024.phb-content.Item.NjvgyGnJS5T29dLQ"],
["花言巧语 Glibness", "Compendium.dnd5e_collection_2024.phb-content.Item.gvp6d5ookHDtpR3g"],
["英雄宴 Heroes' Feast", "Compendium.dnd5e_collection_2024.phb-content.Item.BdNVbUiaRwzQDO6G"],
["英雄气概 Heroism", "Compendium.dnd5e_collection_2024.phb-content.Item.1zENqyRQICmbbLML"],
["荆棘丛生 Spike Growth", "Compendium.dnd5e_collection_2024.phb-content.Item.Q9hauZGsqoq4sczW"],
["荆棘之雨 Hail of Thorns", "Compendium.dnd5e_collection_2024.phb-content.Item.Tex5nbMbhvt6Myht"],
["荆棘之鞭 Thorn Whip", "Compendium.dnd5e_collection_2024.phb-content.Item.MBNxQnSD1ynNFxj2"],
["虔诚护盾 Shield of Faith", "Compendium.dnd5e_collection_2024.phb-content.Item.G7VWmOcNHsjoBboe"],
["虚假生命 False Life", "Compendium.dnd5e_collection_2024.phb-content.Item.2DBEnjSXORE5ScJh"],
["虹光喷射 Prismatic Spray", "Compendium.dnd5e_collection_2024.phb-content.Item.fbnhkEs6FmTvwxLy"],
["虹光法墙 Prismatic Wall", "Compendium.dnd5e_collection_2024.phb-content.Item.A0TcNxhjE3Dly2hW"],
["蛛网术 Web", "Compendium.dnd5e_collection_2024.phb-content.Item.wsGBy2GSy37W6xMV"],
["蛛行术 Spider Climb", "Compendium.dnd5e_collection_2024.phb-content.Item.goT67j43PNphHw3f"],
["融身入石 Meld Into Stone", "Compendium.dnd5e_collection_2024.phb-content.Item.gyKV7M6bS8fYd6N7"],
["行动无踪 Pass without Trace", "Compendium.dnd5e_collection_2024.phb-content.Item.7cFinqIAXTK3hEiZ"],
["行动自如 Freedom of Movement", "Compendium.dnd5e_collection_2024.phb-content.Item.B9PNDuhHWfdeLmdL"],
["衰弱射线 Ray of Enfeeblement", "Compendium.dnd5e_collection_2024.phb-content.Item.sxS5LCC2Q43WRYRj"],
["解离术 Disintegrate", "Compendium.dnd5e_collection_2024.phb-content.Item.vJ7VPMjff89cxkAF"],
["解除魔法 Dispel Magic", "Compendium.dnd5e_collection_2024.phb-content.Item.rhan6UOTxX3x8YrO"],
["触发术 Contingency", "Compendium.dnd5e_collection_2024.phb-content.Item.eZ79PxZiB5YYnnuz"],
["警戒箭阵 Cordon of Arrows", "Compendium.dnd5e_collection_2024.phb-content.Item.sdDS1uF0FMEpvHTg"],
["警报术 Alarm", "Compendium.dnd5e_collection_2024.phb-content.Item.iEzHPdMpS7ZIOSZg"],
["识破隐形 See Invisibility", "Compendium.dnd5e_collection_2024.phb-content.Item.wADlhnkkq5jIGxzc"],
["诚实之域 Zone of Truth", "Compendium.dnd5e_collection_2024.phb-content.Item.FgUntnTJYS4Lw7yc"],
["谭森浮碟术 Tenser's Floating Disk", "Compendium.dnd5e_collection_2024.phb-content.Item.trLkvAtRF3FEaaJK"],
["贾拉兹的光辉风暴 Jailarz's Storm of Radiance", "Compendium.dnd5e_collection_2024.phb-content.Item.ojt0fW53brdAyc3g"],
["跳跃术 Jump", "Compendium.dnd5e_collection_2024.phb-content.Item.cOjkvdvgnq0kGwA8"],
["转生术 Reincarnate", "Compendium.dnd5e_collection_2024.phb-content.Item.gYdkp87PdNIYdA3s"],
["迅捷箭袋 Swift Quiver", "Compendium.dnd5e_collection_2024.phb-content.Item.I1gx2hv9rNVBA6S6"],
["连锁闪电 Chain Lightning", "Compendium.dnd5e_collection_2024.phb-content.Item.f74PasucJ5nKKKzz"],
["迷宫术 Maze", "Compendium.dnd5e_collection_2024.phb-content.Item.PCnubGJxwZeZjQY5"],
["迷幻手稿 Illusory Script", "Compendium.dnd5e_collection_2024.phb-content.Item.yJMoTA9r2delUGs8"],
["迷踪步 Misty Step", "Compendium.dnd5e_collection_2024.phb-content.Item.uCKpeqTpJHbyaX5L"],
["通晓传奇 Legend Lore", "Compendium.dnd5e_collection_2024.phb-content.Item.XuNPcSUp7GXXLwvI"],
["通晓语言 Comprehend Languages", "Compendium.dnd5e_collection_2024.phb-content.Item.EutChehyNwRmocue"],
["通神术 Commune", "Compendium.dnd5e_collection_2024.phb-content.Item.gCddl8BtgNecIur3"],
["造水术／枯水术 Create or Destroy Water", "Compendium.dnd5e_collection_2024.phb-content.Item.udKSYj0yFWyn8PSs"],
["造物术 Creation", "Compendium.dnd5e_collection_2024.phb-content.Item.kA08119w5EgUFH90"],
["造粮术 Create Food and Water", "Compendium.dnd5e_collection_2024.phb-content.Item.oHHXDXChdGBhDr1U"],
["造风术 Gust of Wind", "Compendium.dnd5e_collection_2024.phb-content.Item.2pt4h2Fe1kf8ZhcN"],
["遗体防腐 Gentle Repose", "Compendium.dnd5e_collection_2024.phb-content.Item.jNC8hBAQnmL60RGs"],
["邪魔召唤术 Summon Fiend", "Compendium.dnd5e_collection_2024.phb-content.Item.PQ68PAVNGCV8rSTX"],
["酸液飞溅 Acid Splash", "Compendium.dnd5e_collection_2024.phb-content.Item.75S6zhRFifHpH327"],
["重伤术 Harm", "Compendium.dnd5e_collection_2024.phb-content.Item.Y6jMbepWapazv0Qx"],
["野兽召唤术 Summon Beast", "Compendium.dnd5e_collection_2024.phb-content.Item.SUVyjzkR4KQWbCul"],
["野兽感官 Beast Sense", "Compendium.dnd5e_collection_2024.phb-content.Item.zS7Ekl2NKeczj5kL"],
["鉴定术 Identify", "Compendium.dnd5e_collection_2024.phb-content.Item.Enj2mPEEXQ1Gm4da"],
["钢风斩 Steel Wind Strike", "Compendium.dnd5e_collection_2024.phb-content.Item.mBqR0Up3kKgpvoVB"],
["铜墙铁壁 Guards and Wards", "Compendium.dnd5e_collection_2024.phb-content.Item.lmQbDjfYGnMIf4MO"],
["锥域冻寒 Cone of Cold", "Compendium.dnd5e_collection_2024.phb-content.Item.tiCGN1S62LaeyBxm"],
["镜影术 Mirror Image", "Compendium.dnd5e_collection_2024.phb-content.Item.jC20px2nCW0jkAPA"],
["闪现术 Blink", "Compendium.dnd5e_collection_2024.phb-content.Item.yHA30Xu7hCW21IV2"],
["闪电束 Lightning Bolt", "Compendium.dnd5e_collection_2024.phb-content.Item.pRluZVjWUgDLqHOT"],
["闪电箭矢 Lightning Arrow", "Compendium.dnd5e_collection_2024.phb-content.Item.aoFtH0MAEAICjj5e"],
["闪耀斩 Shining Smite", "Compendium.dnd5e_collection_2024.phb-content.Item.f187OkBEDVNXfbl9"],
["问道自然 Commune with Nature", "Compendium.dnd5e_collection_2024.phb-content.Item.8fPrUiBPqfo6UBkK"],
["防护善恶 Protection from Evil and Good", "Compendium.dnd5e_collection_2024.phb-content.Item.2tRnB4Wd3ZniDg7R"],
["防护毒素 Protection from Poison", "Compendium.dnd5e_collection_2024.phb-content.Item.eH4siggByYDcLnuC"],
["防护法阵 Magic Circle", "Compendium.dnd5e_collection_2024.phb-content.Item.v7wDE7G4S5tpde17"],
["防护能量 Protection from Energy", "Compendium.dnd5e_collection_2024.phb-content.Item.Nx4AQJxIj8VOSHC4"],
["防死结界 Death Ward", "Compendium.dnd5e_collection_2024.phb-content.Item.dRuvDWlDoKsg694E"],
["防活物护罩 Antilife Shell", "Compendium.dnd5e_collection_2024.phb-content.Item.52pFJ3X4PEo2U0wg"],
["阳炎射线 Sunbeam", "Compendium.dnd5e_collection_2024.phb-content.Item.ytsdVf2azoBkh5Gl"],
["阳炎爆 Sunburst", "Compendium.dnd5e_collection_2024.phb-content.Item.KSnPjt9ytTrbp9NP"],
["降咒 Bestow Curse", "Compendium.dnd5e_collection_2024.phb-content.Item.x8EQzmz5I5Ej4xIJ"],
["隐形仆役 Unseen Servant", "Compendium.dnd5e_collection_2024.phb-content.Item.l67aK99VDwHpcoFE"],
["隐形术 Invisibility", "Compendium.dnd5e_collection_2024.phb-content.Item.fAZe8MXbQdnFBzbK"],
["隔离术 Sequester", "Compendium.dnd5e_collection_2024.phb-content.Item.gAI4FHn91RO3JTqT"],
["雪雨暴 Sleet Storm", "Compendium.dnd5e_collection_2024.phb-content.Item.Rs5qMI7uUkRfFRMY"],
["雷鸣斩 Thunderous Smite", "Compendium.dnd5e_collection_2024.phb-content.Item.wlg8zkcTqXaFxVZ8"],
["雷鸣波 Thunderwave", "Compendium.dnd5e_collection_2024.phb-content.Item.zm0WMdTOZYQNCCAx"],
["预置幻影 Programmed Illusion", "Compendium.dnd5e_collection_2024.phb-content.Item.dtRNK1uWuEQXbFjc"],
["预言术 Divination", "Compendium.dnd5e_collection_2024.phb-content.Item.805YWh9kPzKAKxGU"],
["颤栗之触 Chill Touch", "Compendium.dnd5e_collection_2024.phb-content.Item.gMFY0mzWacVrw2wL"],
["风墙术 Wind Wall", "Compendium.dnd5e_collection_2024.phb-content.Item.XLp80cYXVhuSXxlh"],
["飞行术 Fly", "Compendium.dnd5e_collection_2024.phb-content.Item.jfbY2J1NLBko50a7"],
["马友夫强酸箭 Melf's Acid Arrow", "Compendium.dnd5e_collection_2024.phb-content.Item.Zqfcca7uGMTZCCFw"],
["驱逐善恶 Dispel Evil and Good", "Compendium.dnd5e_collection_2024.phb-content.Item.euWMX9i7h5jU1Oyl"],
["高等复原术 Greater Restoration", "Compendium.dnd5e_collection_2024.phb-content.Item.1cgU7tJNnvOtYXzK"],
["高等幻影 Major Image", "Compendium.dnd5e_collection_2024.phb-content.Item.SA1n3B120bhxEut4"],
["高等隐形术 Greater Invisibility", "Compendium.dnd5e_collection_2024.phb-content.Item.oPcO2sMhJwNHxodC"],
["鬼斧神工 Fabricate", "Compendium.dnd5e_collection_2024.phb-content.Item.2BpcG0s1GPihbgUp"],
["魅影之力 Phantasmal Force", "Compendium.dnd5e_collection_2024.phb-content.Item.AGX3yNwiCCwHouUX"],
["魅影杀手 Phantasmal Killer", "Compendium.dnd5e_collection_2024.phb-content.Item.E0NnxwsSDLrSdz5k"],
["魅影驹 Phantom Steed", "Compendium.dnd5e_collection_2024.phb-content.Item.1DiHUTCUcsyqBvuQ"],
["魅惑人类 Charm Person", "Compendium.dnd5e_collection_2024.phb-content.Item.1lhrJ04UQGNmZNfn"],
["魅惑怪物 Charm Monster", "Compendium.dnd5e_collection_2024.phb-content.Item.kNgOt0qHJ5dYSEOj"],
["魔化武器 Magic Weapon", "Compendium.dnd5e_collection_2024.phb-content.Item.1IYqSOm6cn4O6hZA"],
["魔嘴术 Magic Mouth", "Compendium.dnd5e_collection_2024.phb-content.Item.UsiXe64q2zMDWudF"],
["魔法伎俩 Prestidigitation", "Compendium.dnd5e_collection_2024.phb-content.Item.jaCnmYn0CEGOXe1n"],
["魔法飞弹 Magic Missile", "Compendium.dnd5e_collection_2024.phb-content.Item.BTKxFabaDrLUbWu9"],
["魔绳术 Rope Trick", "Compendium.dnd5e_collection_2024.phb-content.Item.M5kKPclAF7VUL6Xg"],
["魔能爆 Eldritch Blast", "Compendium.dnd5e_collection_2024.phb-content.Item.CDEELxctG7dYjEoh"],
["魔邓肯之剑 Mordenkainen's Sword", "Compendium.dnd5e_collection_2024.phb-content.Item.uao9aldAvE86DrvD"],
["魔邓肯忠犬 Mordenkainen's Faithful Hound", "Compendium.dnd5e_collection_2024.phb-content.Item.Y0KW3UwJInF33G9l"],
["魔邓肯私人密室 Mordenkainen's Private Sanctum", "Compendium.dnd5e_collection_2024.phb-content.Item.lMELhRLH0BvfiR1G"],
["魔邓肯豪宅术 Mordenkainen's Magnificent Mansion", "Compendium.dnd5e_collection_2024.phb-content.Item.VsLLZQDNEOk0s78H"],
["魔魂壶 Magic Jar", "Compendium.dnd5e_collection_2024.phb-content.Item.3T9dAhgZkv0LgGi3"],
["鸣雷破 Thunderclap", "Compendium.dnd5e_collection_2024.phb-content.Item.HykV4esneJVpvrzm"],
["鹰眼术 Clairvoyance", "Compendium.dnd5e_collection_2024.phb-content.Item.kzOfBqCtCMYySPNh"],
["黑暗术 Darkness", "Compendium.dnd5e_collection_2024.phb-content.Item.nJXVzbrQWj7TD32S"],
["黑暗视觉 Darkvision", "Compendium.dnd5e_collection_2024.phb-content.Item.6XP41j50xXNRsSwA"],
["龙息术 Dragon's Breath", "Compendium.dnd5e_collection_2024.phb-content.Item.iPzx4yMEBKqh7cIT"],
["龙类召唤术 Summon Dragon", "Compendium.dnd5e_collection_2024.phb-content.Item.ambtJ1KNkQumn2Q1"],
```

### §37 · `dnd5e_collection_2024.derived-content`（31 条） — dnd5e 2024 派生内容
```text
["云雾术 Fog Cloud", "Compendium.dnd5e_collection_2024.derived-content.Item.f1GCHnoyErc9tCex"],
["冰风暴 Ice Storm", "Compendium.dnd5e_collection_2024.derived-content.Item.C29GW2F5SKeZrYHO"],
["冷冻射线 Ray of Frost", "Compendium.dnd5e_collection_2024.derived-content.Item.nXGBIQcoFLNY1h0a"],
["变形术 Polymorph", "Compendium.dnd5e_collection_2024.derived-content.Item.Rsp9K2qseCl0XQzj"],
["命令术 Command", "Compendium.dnd5e_collection_2024.derived-content.Item.mRU5zGyEYs2YwzQN"],
["定身类人 Hold Person", "Compendium.dnd5e_collection_2024.derived-content.Item.GMdkv43KENbZr1Vp"],
["寻获魔宠 Find Familiar", "Compendium.dnd5e_collection_2024.derived-content.Item.luDeoXY8j1Zrv6B0"],
["心灵遥控 Telekinesis", "Compendium.dnd5e_collection_2024.derived-content.Item.V3hV0b2DWSuAELHN"],
["朦胧术 Blur", "Compendium.dnd5e_collection_2024.derived-content.Item.fH6oUwUDDSNpj7iQ"],
["枯萎术 Blight", "Compendium.dnd5e_collection_2024.derived-content.Item.tZMpSLo2h1VSsJ5b"],
["树跃术 Tree Stride", "Compendium.dnd5e_collection_2024.derived-content.Item.167T0wEi3GQM4Mjh"],
["火焰箭 Fire Bolt", "Compendium.dnd5e_collection_2024.derived-content.Item.9KQgKipIEPCEjrQ8"],
["火球术 Fireball", "Compendium.dnd5e_collection_2024.derived-content.Item.TYCANYeHJN4Soijp"],
["灵体武器 Spiritual Weapon", "Compendium.dnd5e_collection_2024.derived-content.Item.mmOzcdkgnEsNkI5I"],
["燃烧之手 Burning Hands", "Compendium.dnd5e_collection_2024.derived-content.Item.1jZmrpsMHZEgUW1b"],
["电爪 Shocking Grasp", "Compendium.dnd5e_collection_2024.derived-content.Item.aqVf7yU6k9vrY2EB"],
["疫病虫群 Insect Plague", "Compendium.dnd5e_collection_2024.derived-content.Item.Snb1m5kkeakfHuo7"],
["睡眠术 Sleep", "Compendium.dnd5e_collection_2024.derived-content.Item.yJlQJdXe2h8v8IHA"],
["石墙术 Wall of Stone", "Compendium.dnd5e_collection_2024.derived-content.Item.usG5CpBuQE59tjbA"],
["臭云术 Stinking Cloud", "Compendium.dnd5e_collection_2024.derived-content.Item.ovqHboCQ6p7ibERL"],
["致病射线 Ray of Sickness", "Compendium.dnd5e_collection_2024.derived-content.Item.B7MsoNr6YnhGRfur"],
["虔诚护盾 Shield of Faith", "Compendium.dnd5e_collection_2024.derived-content.Item.f08mVjJZ2bYnIRQY"],
["蛛网术 Web", "Compendium.dnd5e_collection_2024.derived-content.Item.j2feDOpmBvBuScWZ"],
["行动自如 Freedom of Movement", "Compendium.dnd5e_collection_2024.derived-content.Item.BDGcHwQTYJbOS5G3"],
["识破隐形 See Invisibility", "Compendium.dnd5e_collection_2024.derived-content.Item.6yvW4KLYdWias6Au"],
["迷踪步 Misty Step", "Compendium.dnd5e_collection_2024.derived-content.Item.R7dJnJKm0LP97Yya"],
["酸液飞溅 Acid Splash", "Compendium.dnd5e_collection_2024.derived-content.Item.DKTV1gugc1sWIS1n"],
["锥域冻寒 Cone of Cold", "Compendium.dnd5e_collection_2024.derived-content.Item.nwPuNxcFmgGotRva"],
["闪电束 Lightning Bolt", "Compendium.dnd5e_collection_2024.derived-content.Item.87nmPqIVcxkEbrk9"],
["雪雨暴 Sleet Storm", "Compendium.dnd5e_collection_2024.derived-content.Item.odSRDYFL0gRJRKnD"],
["黑暗术 Darkness", "Compendium.dnd5e_collection_2024.derived-content.Item.vWGpWMCTgzZ36hTG"],
```

### §37 · `griffion-chn.griffon-item`（234 条）
```text
["#1 - 混沌碎片 (#1 - Fragment of Chaos)", "Compendium.griffion-chn.griffon-item.Item.4FQBoiuTnGilSeXW"],
["#2 - 混沌碎片 (#2 - Fragment of Chaos)", "Compendium.griffion-chn.griffon-item.Item.qhlvp0y7JaaJtZFm"],
["#3 - 混沌碎片 (#3 - Fragment of Chaos)", "Compendium.griffion-chn.griffon-item.Item.9caa7UQDk7D9EE8Z"],
["#4 - 混沌碎片 (#4 - Fragment of Chaos)", "Compendium.griffion-chn.griffon-item.Item.56o0JZCGlUlgDacA"],
["#5 - 混沌碎片 (#5 - Fragment of Chaos)", "Compendium.griffion-chn.griffon-item.Item.vJFszihQIHLG0pbx"],
["#6 - 混沌碎片 (#6 - Fragment of Chaos)", "Compendium.griffion-chn.griffon-item.Item.fGgjAjgzTZU3G2ns"],
["#7 - 混沌碎片 (#7 - Fragment of Chaos)", "Compendium.griffion-chn.griffon-item.Item.jft7QHi4xeLAUysn"],
["#8 - 混沌碎片 (#8 - Fragment of Chaos)", "Compendium.griffion-chn.griffon-item.Item.uTQwohPj6n58pXUa"],
["10尺立方体 (10-foot Cube)", "Compendium.griffion-chn.griffon-item.Item.tSZygb78EOyYljXI"],
["“继续前进！” (Keep Marching!)", "Compendium.griffion-chn.griffon-item.Item.1l0vBhpu2Kt3MzHk"],
["“请诸位垂注！” (Your Attention, Please!)", "Compendium.griffion-chn.griffon-item.Item.mqEWBcWa2saaafmD"],
["“跟我来！” (Follow Me!)", "Compendium.griffion-chn.griffon-item.Item.O5DxQ7INjzeUlkHv"],
["严寒之怒", "Compendium.griffion-chn.griffon-item.Item.hBkSgCC7CAmfr6ew"],
["严寒之怒（骑枪）", "Compendium.griffion-chn.griffon-item.Item.P2zcIkv2tDo0uzur"],
["中和天气 (Neutralize Weather)", "Compendium.griffion-chn.griffon-item.Item.Hpq7CvMIf09qrBLn"],
["五球术 (Fiveball)", "Compendium.griffion-chn.griffon-item.Item.BIFNWHONQWwevWjh"],
["伤害掷骰结果为10 (Rolled a 10 on Damage)", "Compendium.griffion-chn.griffon-item.Item.l8WIy0Rd0DnHxBGj"],
["侦察 (Scout)", "Compendium.griffion-chn.griffon-item.Item.2bmISo0gGvpk3i1C"],
["倒转 (Inversion)", "Compendium.griffion-chn.griffon-item.Item.SYMBnHl9kAGTpj2P"],
["共鸣 (Resonate)", "Compendium.griffion-chn.griffon-item.Item.9XRV8zZX8UKde9pM"],
["兵 (Pawn)", "Compendium.griffion-chn.griffon-item.Item.S982C6J3o7Jai5iO"],
["兵（全套棋子）(Pawn (Full Set))", "Compendium.griffion-chn.griffon-item.Item.j30n1ITSg8l2yZPn"],
["冰墙 (Ice Wall)", "Compendium.griffion-chn.griffon-item.Item.FFjTPrdW17dw70sl"],
["冰封之风", "Compendium.griffion-chn.griffon-item.Item.89WagBq4rznXlR4s"],
["冰雹齐射 (Hailstorm Volley)", "Compendium.griffion-chn.griffon-item.Item.5RewDLjPcyzKl0QD"],
["冰风暴 (Ice Storm)", "Compendium.griffion-chn.griffon-item.Item.uwv76Q8tabv3u6xb"],
["冰风暴 (湿滑) (Ice Storm (Slippery))", "Compendium.griffion-chn.griffon-item.Item.TOsNl54nWyR89Bpl"],
["凤凰之火 (Phoenix Fire)", "Compendium.griffion-chn.griffon-item.Item.xMEX2uGhjoySNgcD"],
["厄运 (Doom)", "Compendium.griffion-chn.griffon-item.Item.0CKQkUccnIGuYQIB"],
["反击 (Retaliate)", "Compendium.griffion-chn.griffon-item.Item.Xf8q6X0E4JySIop6"],
["反击（临时生命值）(Retaliate (Temp HP))", "Compendium.griffion-chn.griffon-item.Item.pe99SsBXfk1xwS0v"],
["反射光辉 (Reflect Radiance)", "Compendium.griffion-chn.griffon-item.Item.JzAt8DUTbjuMFiWT"],
["反馈（对自身心灵伤害）(Feedback (Psychic Damage to Self))", "Compendium.griffion-chn.griffon-item.Item.M1M0GSjOfZfw61r5"],
["召唤地狱犬 (Summon Hell Hound)", "Compendium.griffion-chn.griffon-item.Item.0gTOK7t4xDAM1SIa"],
["召唤工事（弓箭手）(Summon Fortifications (Archers))", "Compendium.griffion-chn.griffon-item.Item.emIQhHhhh3WP728l"],
["召唤肉身魔像 (Summon Flesh Golem)", "Compendium.griffion-chn.griffon-item.Item.78HmhmSIUZVmVZ1L"],
["召唤触须 (Summon Tentacle)", "Compendium.griffion-chn.griffon-item.Item.1b2ojeF3PBLbb01Y"],
["召唤触须（攻击）(Summon Tentacle (Attack))", "Compendium.griffion-chn.griffon-item.Item.Q11OvSf1OTMcNj5Y"],
["召唤集群 (Summon Swarm)", "Compendium.griffion-chn.griffon-item.Item.TQRxK9eqD3FikTuE"],
["召回集群 (Recall Swarm)", "Compendium.griffion-chn.griffon-item.Item.NVdTSJYrGhNnlOhR"],
["同源之血 (Of One Blood)", "Compendium.griffion-chn.griffon-item.Item.eB1hPfID9DVbZrap"],
["后 (Queen)", "Compendium.griffion-chn.griffon-item.Item.CrKmakyYDIDWG9UU"],
["后（全套棋子）(Queen (Full Set))", "Compendium.griffion-chn.griffon-item.Item.1f3Rwihw5REda32x"],
["吸收强酸", "Compendium.griffion-chn.griffon-item.Item.IpmNAIWouYmOeJYp"],
["呼啸之风 (The Wind That Howls)", "Compendium.griffion-chn.griffon-item.Item.ZhlKtwd4itFHWleG"],
["品红色光束", "Compendium.griffion-chn.griffon-item.Item.kPmwpicDCusm0jIu"],
["地动旋律 (Seismic Melody)", "Compendium.griffion-chn.griffon-item.Item.79dW3I4IMT9drhDb"],
["大端（快速） (Large End (Rapid))", "Compendium.griffion-chn.griffon-item.Item.h78Ui7YWSyRD4uzs"],
["大风暴 (Windstorm)", "Compendium.griffion-chn.griffon-item.Item.EXwmyvSYMKse9Yiu"],
["天使化身 (Angelic Avatar)", "Compendium.griffion-chn.griffon-item.Item.QHy4czPg87wWFwdp"],
["天平倾斜 (Scale Tip)", "Compendium.griffion-chn.griffon-item.Item.Kq1UdzQd0BYT21Su"],
["天平倾斜 (Scale Tip)", "Compendium.griffion-chn.griffon-item.Item.SkS9EY8vy0B3z5lt"],
["天平倾斜 (Scale Tip)", "Compendium.griffion-chn.griffon-item.Item.j5IXC43lMtv5F0uc"],
["奇美拉三叉戟 - 吐息 (Chimera Trident - Breath)", "Compendium.griffion-chn.griffon-item.Item.LBJssKeuUXFTJzK9"],
["奥术护盾 (Arcane Shield)", "Compendium.griffion-chn.griffon-item.Item.Hfp37jvKMVCZSKJn"],
["奥术聚变1：高之步（1环或更高）(Arcane Fusion 1: Step of Gaoh (1st level or higher))", "Compendium.griffion-chn.griffon-item.Item.3htOeO0hY8njSvXW"],
["奥术聚变2：阿蒙之拳（3环或更高）(Arcane Fusion 2: Fist of Amun (3rd level or higher))", "Compendium.griffion-chn.griffon-item.Item.ujzdiRKAFYzgaS53"],
["奥术聚变3：尼约德之矛（5环或更高）(Arcane Fusion 3: Javelins of Njord (5th level or higher))", "Compendium.griffion-chn.griffon-item.Item.eGU1LV1LMLMljjai"],
["奥术聚变4：阿涅摩伊之风（7环或更高）(Arcane Fusion 4: Gale of Anemoi (7th level or higher))", "Compendium.griffion-chn.griffon-item.Item.EYUbbizKaxlOW2Sx"],
["奥术聚变5：觉醒之风（9环）(Arcane Fusion 5: Awoken Wind (9th level))", "Compendium.griffion-chn.griffon-item.Item.YeIK5JytWkbLIXnP"],
["宿敌之势 (Rivalry)", "Compendium.griffion-chn.griffon-item.Item.rERcGvMnGfSND8sS"],
["寒冰发射", "Compendium.griffion-chn.griffon-item.Item.7MOPYvgQkygsTGbO"],
["寒冰护甲", "Compendium.griffion-chn.griffon-item.Item.oDXG0LLASUhcqegs"],
["小端（精确） (Small End (Precise))", "Compendium.griffion-chn.griffon-item.Item.ByWchMRxHAwiT2D0"],
["干旱劈斩 (Arid Cleave)", "Compendium.griffion-chn.griffon-item.Item.zFm9gjlNvgNfeRle"],
["平息 (Deescalate)", "Compendium.griffion-chn.griffon-item.Item.5zEJHDGHMrEB9tgx"],
["幽冥庇护 (Spectral Ward)", "Compendium.griffion-chn.griffon-item.Item.VJMLlqs6MTID1psD"],
["幽灵冲锋", "Compendium.griffion-chn.griffon-item.Item.NXdGx7lEXqxdv6oo"],
["幽魂之刃（闪现） (Ghostly Blade (Blink))", "Compendium.griffion-chn.griffon-item.Item.jLyISWMo6W6zrgAu"],
["幽魂巨口 (CR 10+) (Spectral Maw (CR 10+))", "Compendium.griffion-chn.griffon-item.Item.u9SJzAFkq5i2E9vK"],
["幽魂巨口 (CR 2-5) (Spectral Maw (CR 2-5))", "Compendium.griffion-chn.griffon-item.Item.MPTnrd9IN4JU5IqV"],
["幽魂巨口 (CR 6-9) (Spectral Maw (CR 6-9))", "Compendium.griffion-chn.griffon-item.Item.BOEB3bHjnOyP2aQq"],
["幽魂巨口 (CR <=1) (Spectral Maw (CR <=1))", "Compendium.griffion-chn.griffon-item.Item.BWqTdjAC7BNPbd5x"],
["幽魂集群 (Spirit Swarm)", "Compendium.griffion-chn.griffon-item.Item.AlgIgmsxPWeUpW37"],
["引雷针 (Lightning Rod)", "Compendium.griffion-chn.griffon-item.Item.GLRe5CLaKQCoW2am"],
["引雷针 (Lightning Rod)", "Compendium.griffion-chn.griffon-item.Item.MgqtksGfxIAVXNOF"],
["弩炮长枪（远程攻击）(Ballista Pike (Ranged Attack))", "Compendium.griffion-chn.griffon-item.Item.WtO4e4MBMSWNe82N"],
["彗星镖 (Comet Dart) (3d4)", "Compendium.griffion-chn.griffon-item.Item.EwKqZ85gjtNj6CoH"],
["彻骨之寒", "Compendium.griffion-chn.griffon-item.Item.ZZFdMCu6p0VCZ1BZ"],
["恐惧 (Terrify)", "Compendium.griffion-chn.griffon-item.Item.ebXOzOBptqZ891jb"],
["恐惧凝视", "Compendium.griffion-chn.griffon-item.Item.JoTvVni6OHcCvaSJ"],
["慧眼传语 (The Eyes That Speak)", "Compendium.griffion-chn.griffon-item.Item.JnT9nLgglcfLt0Xq"],
["慰魂钢安魂曲（能力） (Solacesteel Requiem (Ability))", "Compendium.griffion-chn.griffon-item.Item.uEu6uQYU5KmVNrzh"],
["打击 (Strike)", "Compendium.griffion-chn.griffon-item.Item.4uxFqKL6L7E2zEmk"],
["投矛 (Throw Spear) (1/轮)", "Compendium.griffion-chn.griffon-item.Item.iBZzMVUaRgkJeRNe"],
["拉札的视觉 (Lazar's Sight)", "Compendium.griffion-chn.griffon-item.Item.rUtgZad7k4cErdE6"],
["按钮1", "Compendium.griffion-chn.griffon-item.Item.opXb1GRidAI304jm"],
["按钮1", "Compendium.griffion-chn.griffon-item.Item.ypMHe1STBfa9yx7z"],
["按钮2", "Compendium.griffion-chn.griffon-item.Item.Fw3CfCH9v01Z7AUo"],
["按钮2", "Compendium.griffion-chn.griffon-item.Item.y04nEHu4z8kTiTb8"],
["按钮3", "Compendium.griffion-chn.griffon-item.Item.5wOw22UbRSfw0COc"],
["按钮3", "Compendium.griffion-chn.griffon-item.Item.GECe7FnakaWgdLQ9"],
["按钮4 (Button 4)", "Compendium.griffion-chn.griffon-item.Item.CdLz533E4Ab3Ywoy"],
["按钮5 (Button 5)", "Compendium.griffion-chn.griffon-item.Item.cTNdwOqP8XNoCSF3"],
["按钮6 (Button 6)", "Compendium.griffion-chn.griffon-item.Item.0wPN83OTBYDyyW2I"],
["掷骰得6 (Rolled a 6)", "Compendium.griffion-chn.griffon-item.Item.JiQmhx0Vxed4w7oT"],
["擒抱豁免 (Grapple Save)", "Compendium.griffion-chn.griffon-item.Item.3m5SgOseE5vp3D5M"],
["擦拭煤炭 (Drag Coal)", "Compendium.griffion-chn.griffon-item.Item.5dRKG14WW37LrWU1"],
["断折之枝 (The Twig That Snaps)", "Compendium.griffion-chn.griffon-item.Item.Uqg0dTGybPFXwqMx"],
["斯芬克斯镰刀 - 诘问", "Compendium.griffion-chn.griffon-item.Item.odv9txdk4FFdGh9p"],
["旋涡灵药（能力） (Vortex Elixir (Ability))", "Compendium.griffion-chn.griffon-item.Item.uA0gtnsmK4Cr6EAH"],
["旋转刃缘 (Spinning Blade)", "Compendium.griffion-chn.griffon-item.Item.NZB1AgnNdd1q7dyl"],
["日冕之焰 (Coronal Flame)", "Compendium.griffion-chn.griffon-item.Item.AAS2ZqeuYoU8ncPA"],
["星界卫士 (Astral Defender)", "Compendium.griffion-chn.griffon-item.Item.bOSbHwgm0ngxsFkJ"],
["星界结界 (Astral Ward)", "Compendium.griffion-chn.griffon-item.Item.51i8DW1KBYUTJVnk"],
["星辰崩塌", "Compendium.griffion-chn.griffon-item.Item.sfNrxM9coDafB3bw"],
["权杖形态 (Scepter Form)", "Compendium.griffion-chn.griffon-item.Item.RCh7mVZY0sM0XXd3"],
["极光帷幕 (Aurora Veil)", "Compendium.griffion-chn.griffon-item.Item.lwiQHPvcsKUbpL1i"],
["棘刺乱舞 (Flurry of Thorns)", "Compendium.griffion-chn.griffon-item.Item.BGSYXwcFfn4p1OdJ"],
["橙色光束", "Compendium.griffion-chn.griffon-item.Item.fwa6jbJdVWd9YcJb"],
["死亡警告 (Memento Mori)", "Compendium.griffion-chn.griffon-item.Item.Uk0XMaJRVjXsDgpw"],
["毒气喷溅（5环）", "Compendium.griffion-chn.griffon-item.Item.e02kmebvF4CnIKt9"],
["水泡 (Water Bubble)", "Compendium.griffion-chn.griffon-item.Item.h0tfZ1dvVNily8Vw"],
["永恒沉睡 (Eternal Slumber)", "Compendium.griffion-chn.griffon-item.Item.s9hSwQ6BcobGot6z"],
["法术吸收 (Spell Absorb)", "Compendium.griffion-chn.griffon-item.Item.Bz3NtcIuoGBGgFiw"],
["洪流 (Flood)", "Compendium.griffion-chn.griffon-item.Item.cwVYdka1StqXipEo"],
["派遣火焰 (Send Flame)", "Compendium.griffion-chn.griffon-item.Item.5uK17qhMSgpncAJK"],
["派遣火焰（伤害）(Send Flame (Damage))", "Compendium.griffion-chn.griffon-item.Item.5yFdUwM83P8ChKQu"],
["浴血铁拳 (伤害提升) (Bloody Knuckles (Damage Increase))", "Compendium.griffion-chn.griffon-item.Item.3YvBMpWJZNxQ9pYX"],
["消耗充能 (Expend Charges)", "Compendium.griffion-chn.griffon-item.Item.6pu42A4uy514DUgq"],
["潮汐爆发", "Compendium.griffion-chn.griffon-item.Item.QIPpGzB3O4s7xqRR"],
["潮汐爆发 - 发射", "Compendium.griffion-chn.griffon-item.Item.oN3VhuaN1vnrDsYD"],
["火焰风暴 (Firestorm)", "Compendium.griffion-chn.griffon-item.Item.PWqqDJ83OLofblWt"],
["灭火 (Douse Fire)", "Compendium.griffion-chn.griffon-item.Item.8iaWWvL02XQGX37e"],
["灭火 (反应) (Douse Fire (Reaction))", "Compendium.griffion-chn.griffon-item.Item.d4PNmkFtEmJb58Z8"],
["灼热巨蛇之牙（烈焰缠绕）(Fangs of the Searing Serpent (Wreathed in Flame))", "Compendium.griffion-chn.griffon-item.Item.978GxxfTTO0IwSLN"],
["点燃火焰 (Alight Flame)", "Compendium.griffion-chn.griffon-item.Item.22szdlsrwRnXx5AQ"],
["炼狱引擎 (1-9)", "Compendium.griffion-chn.griffon-item.Item.BkDXFYRgFi5YukvA"],
["炼狱引擎 (10)", "Compendium.griffion-chn.griffon-item.Item.FI3K1voNAvr6zcwR"],
["炼狱引擎 (11-19)", "Compendium.griffion-chn.griffon-item.Item.eCtWLPnNLvWRSXIb"],
["炼狱引擎 (20)", "Compendium.griffion-chn.griffon-item.Item.uuGfYQdfXy1uq79I"],
["炼狱引擎 (21-29)", "Compendium.griffion-chn.griffon-item.Item.BjrTzWKPSEsHZVWj"],
["炼狱引擎 (30)", "Compendium.griffion-chn.griffon-item.Item.CiDhqsFeAL0mAfN7"],
["炼狱引擎 (>30 爆发) (31-39)", "Compendium.griffion-chn.griffon-item.Item.k7l9qFSAInN8omM2"],
["炼狱引擎 (>30 爆发) (40)", "Compendium.griffion-chn.griffon-item.Item.EvbZpA9Hbi9Fdn2A"],
["炼金之刃（圣水）(Alchemy Blade (Holy Water))", "Compendium.griffion-chn.griffon-item.Item.1Soxxofy7xxTk7yw"],
["炼金之刃（基础毒药）(Alchemy Blade (Basic Poison))", "Compendium.griffion-chn.griffon-item.Item.QhBwZ6mPRV7VfjzQ"],
["炼金之刃（强酸瓶）(Alchemy Blade (Acid Vial))", "Compendium.griffion-chn.griffon-item.Item.txoJPw86GlJtQ9VS"],
["炼金之刃（炽火胶）(Alchemy Blade (Alchemist's Fire))", "Compendium.griffion-chn.griffon-item.Item.1HIvx5T10vjVKfTL"],
["炽热甲壳", "Compendium.griffion-chn.griffon-item.Item.v0UGeP5nOeoMY8QV"],
["炽热甲壳（爆炸）", "Compendium.griffion-chn.griffon-item.Item.ugMAjlauLtY8Q2GV"],
["烈焰喷射者（投掷爆炸物）(Spitfire (lob explosive))", "Compendium.griffion-chn.griffon-item.Item.V5nn0YOTdELKs6tp"],
["热锅 (Hot Skillet)", "Compendium.griffion-chn.griffon-item.Item.2zuvbiks0oCFQfVM"],
["煽动争斗 (Incite Strife)", "Compendium.griffion-chn.griffon-item.Item.oSiuUwezYdijaGB7"],
["熔岩旋律 (Molten Melody)", "Compendium.griffion-chn.griffon-item.Item.XCHJGqgQA6w1odke"],
["燃烧 (Burn)", "Compendium.griffion-chn.griffon-item.Item.pLi8qLKpDcR3PADZ"],
["燃烧毒液 (Burning Venom)", "Compendium.griffion-chn.griffon-item.Item.URtzOmQaFbn8Snrf"],
["爆发旋律 (Erupting Melody)", "Compendium.griffion-chn.griffon-item.Item.cK0la2p8RmtsGvIt"],
["爆炸 (Explode)", "Compendium.griffion-chn.griffon-item.Item.oWklzl2XuAplF8WN"],
["爆炸 (Explode)", "Compendium.griffion-chn.griffon-item.Item.wl1J970pAyJ35tMB"],
["爆裂火焰 (Bursting Flame)", "Compendium.griffion-chn.griffon-item.Item.H5mkTiYl1G0vaKUP"],
["狂风之力（圆柱）", "Compendium.griffion-chn.griffon-item.Item.YC0G40bG3wIk7jAv"],
["狂风之力（直线）", "Compendium.griffion-chn.griffon-item.Item.hlqUdRtFvsrajDSp"],
["猛扑 (Pounce)", "Compendium.griffion-chn.griffon-item.Item.Q4g6MI06oJvn9SDQ"],
["王（防活物护罩）(King (Antilife Shell))", "Compendium.griffion-chn.griffon-item.Item.k3fxmNpKQiVgJLg6"],
["电击演奏 (Shocking Performance)", "Compendium.griffion-chn.griffon-item.Item.fpMm7tvBk7R7BE0x"],
["盛怒守卫（伤害）(Wrathful Ward (Damage))", "Compendium.griffion-chn.griffon-item.Item.W2ORnYRREy78JF3M"],
["神圣对立 - 灾祸术", "Compendium.griffion-chn.griffon-item.Item.7Fn1TqsCnqbbSzy1"],
["神圣对立 - 祝福术", "Compendium.griffion-chn.griffon-item.Item.INAsRnCWz38ScpcF"],
["稀释 (Dilution)", "Compendium.griffion-chn.griffon-item.Item.BKJnpsiNqFTluTNF"],
["第三尖刺 (3rd Spike)", "Compendium.griffion-chn.griffon-item.Item.w58zdCTsuQS8qIbh"],
["紫色光束", "Compendium.griffion-chn.griffon-item.Item.5GJlxLFnIgk1rv3M"],
["红色光束", "Compendium.griffion-chn.griffon-item.Item.DmAY1zdgoGHbgZF8"],
["纯净之水（伤害）(Pure Water (damage))", "Compendium.griffion-chn.griffon-item.Item.P9bSk6CTrSi4afM3"],
["纯净之水（墙壁）(Pure Water (wall))", "Compendium.griffion-chn.griffon-item.Item.E8JmzrT01PwF1eVR"],
["绿色光束", "Compendium.griffion-chn.griffon-item.Item.9ZDZ3flQOTQ60Ejt"],
["羽饰压击 (Plumed Press)", "Compendium.griffion-chn.griffon-item.Item.aauFsdy7eS8EqFb7"],
["能量奔涌 (Energy Surge)", "Compendium.griffion-chn.griffon-item.Item.yprWewfRntHaB3eL"],
["能量奔涌 (范围效果) (Energy Surge (AoE))", "Compendium.griffion-chn.griffon-item.Item.y7BVGmrI1LHQPbTs"],
["腐蚀战镐（目标为金属或穿戴金属护甲）", "Compendium.griffion-chn.griffon-item.Item.eAZaN7jmVrJ3FJBi"],
["腐蚀超载", "Compendium.griffion-chn.griffon-item.Item.jvL5ayz27VB0uP3k"],
["色彩变换（白）", "Compendium.griffion-chn.griffon-item.Item.SY6ewmUNX3gQPVKr"],
["色彩变换（红）", "Compendium.griffion-chn.griffon-item.Item.VTC48aUg8Gv9IybA"],
["色彩变换（绿）", "Compendium.griffion-chn.griffon-item.Item.MZsypBo9pXHc94JE"],
["色彩变换（蓝）", "Compendium.griffion-chn.griffon-item.Item.7abaBFXP8fqVK3jp"],
["色彩变换（黑）", "Compendium.griffion-chn.griffon-item.Item.QKuccNtbrop2IC4h"],
["艾伐黑触手（黑触手刺剑版）", "Compendium.griffion-chn.griffon-item.Item.OhediomITaT6Y1Ed"],
["蓝色光束", "Compendium.griffion-chn.griffon-item.Item.KJtgQnNVFVaE7M8q"],
["蝠群瞬步 (Swarm Step)", "Compendium.griffion-chn.griffon-item.Item.j48cT1x1WjLPKDde"],
["血月 (Blood Moon)", "Compendium.griffion-chn.griffon-item.Item.dufycXdL0VilM6Tt"],
["血液转换", "Compendium.griffion-chn.griffon-item.Item.O5qgY77D1U6JraLu"],
["血矢（手弩）(Blood Bolt (Hand Crossbow))", "Compendium.griffion-chn.griffon-item.Item.XsAdE7WMi6hKoERJ"],
["血矢（轻弩）(Blood Bolt (Light Crossbow))", "Compendium.griffion-chn.griffon-item.Item.9QGmVFARDTZd1B2T"],
["血矢（重弩）(Blood Bolt (Heavy Crossbow))", "Compendium.griffion-chn.griffon-item.Item.JiRJzgYsbJGV80a8"],
["被包围生物豁免 (Surrounded Creature Save)", "Compendium.griffion-chn.griffon-item.Item.PoReUvXcMCtxHZ3W"],
["触碰火焰伤害 (Touch Fire Damage)", "Compendium.griffion-chn.griffon-item.Item.Pt48vb42s12l6ZjX"],
["诡异巨口消化 (Eldritch Maw Digestion)", "Compendium.griffion-chn.griffon-item.Item.Jn3kD3YtCVgOQS4w"],
["象 (Bishop)", "Compendium.griffion-chn.griffon-item.Item.Y6rJzOuXtzNSA4wN"],
["起舞！ (战鼓棍) (DANCE! (Battlebeat Club))", "Compendium.griffion-chn.griffon-item.Item.jccsf3FQ9FafG8Wi"],
["践踏冲锋 (Trampling Charge)", "Compendium.griffion-chn.griffon-item.Item.oCmuJyjltYG2GzZ7"],
["车 (Rook)", "Compendium.griffion-chn.griffon-item.Item.8Oj4l9OXQk7Wx5Ue"],
["车（全套棋子）(Rook (Full Set))", "Compendium.griffion-chn.griffon-item.Item.09RMtrFGFOSDT7do"],
["转移伤害 (Redirect Damage)", "Compendium.griffion-chn.griffon-item.Item.27tllUTq92TxcTcX"],
["造粮术 - 负釜者之杖 (Create Food and Water - Staff of the Cauldron Carrier)", "Compendium.griffion-chn.griffon-item.Item.QPx8VLZkiziDsH25"],
["重击效应 (Critical Effect)", "Compendium.griffion-chn.griffon-item.Item.mcTXxAu4A932wCFr"],
["重击效应 (Critical Effect)", "Compendium.griffion-chn.griffon-item.Item.rZ7qlPl5ZcQ9AXbn"],
["重击豁免 (Critical Hit Save)", "Compendium.griffion-chn.griffon-item.Item.o8ZnDTNv6ATbQYMD"],
["铂金荣耀 (Platinum Glory)", "Compendium.griffion-chn.griffon-item.Item.bZVMe0rwQv0Zzo7z"],
["锤击公羊 (Hammer Ram)", "Compendium.griffion-chn.griffon-item.Item.lIGbvwWdLGcL2M8J"],
["闪烁音能之刃 (Shimmering Blade of Sonic Power)", "Compendium.griffion-chn.griffon-item.Item.b0k0gt2tZSrawvUj"],
["闪电之柱 (Lightning Pillar)", "Compendium.griffion-chn.griffon-item.Item.mx8SUnGEDPGsVFsE"],
["闪耀之翼", "Compendium.griffion-chn.griffon-item.Item.Ddn05kS3XIJyjVFn"],
["阳炎斩 (Sunslash)", "Compendium.griffion-chn.griffon-item.Item.oZ7pHGZRQwgvSvJp"],
["阳炎爆（锥形）(Sunburst (cone))", "Compendium.griffion-chn.griffon-item.Item.yvJf4inLGRyXTi1G"],
["隐形火焰 (Invisible Flame)", "Compendium.griffion-chn.griffon-item.Item.a01LSjk5EHZxb39M"],
["障壁礁岩", "Compendium.griffion-chn.griffon-item.Item.mb04KdnE2aHhvWy0"],
["集群豁免 (Swarm Save)", "Compendium.griffion-chn.griffon-item.Item.zz4fogmDlA7vnrK4"],
["雷霆风暴 (Thunderstorm)", "Compendium.griffion-chn.griffon-item.Item.NGbL3qnRE50Er0o7"],
["雷霆风暴 (雷鸣效应) (Thunderstorm (Thunder Effect))", "Compendium.griffion-chn.griffon-item.Item.VXsjqZI41WW3yBCo"],
["雷鸣波 (Thunderwave)", "Compendium.griffion-chn.griffon-item.Item.IBfKztaz2EaQqhEQ"],
["雷鸣演奏（伤害）(Thunderous Performance (Damage))", "Compendium.griffion-chn.griffon-item.Item.MAJfqaHQBRg6qe3Z"],
["雷鸣演奏（治疗）(Thunderous Performance (Heal))", "Compendium.griffion-chn.griffon-item.Item.6KJxHZtDdH2PIuOK"],
["雷鸣终曲 (Thunderous Finale)", "Compendium.griffion-chn.griffon-item.Item.mncZRRm8fz5eJNGb"],
["震荡冲击波 (Concussive Blasts)", "Compendium.griffion-chn.griffon-item.Item.O8FldmM4XOL4o3se"],
["震荡冲击波（豁免）(Concussive Blasts (Save))", "Compendium.griffion-chn.griffon-item.Item.Es6XZbYFZ3G6eQ3u"],
["青色光束", "Compendium.griffion-chn.griffon-item.Item.eNeHXXeZwLWq7N7Y"],
["靛蓝色光束", "Compendium.griffion-chn.griffon-item.Item.X90luj5fSLUmf4yW"],
["顺风 (Tailwind)", "Compendium.griffion-chn.griffon-item.Item.giUZ7TeXFKZFZBb1"],
["额外伤害 (Extra Damage)", "Compendium.griffion-chn.griffon-item.Item.4aYjBaXBCVw81MZD"],
["飞翔 (Fly)", "Compendium.griffion-chn.griffon-item.Item.gg6LwgjtCfnqvC8r"],
["马 (Knight)", "Compendium.griffion-chn.griffon-item.Item.yzy1TFAXLSUtDo9r"],
["马（全套棋子）(Knight (Full Set))", "Compendium.griffion-chn.griffon-item.Item.RATJHrIC7RqZN8GQ"],
["魔能爆 (Eldritch Blast)", "Compendium.griffion-chn.griffon-item.Item.oyEeVfOrUWVteRzm"],
["黄色光束", "Compendium.griffion-chn.griffon-item.Item.cCo7paGhKurPl2kz"],
["黑洞 - 融合", "Compendium.griffion-chn.griffon-item.Item.4wBUdZtIpMBhWdln"],
["黑洞 - 远程武器攻击未命中你", "Compendium.griffion-chn.griffon-item.Item.9zzq58wOOhlu8Yqo"],
["黑色光束", "Compendium.griffion-chn.griffon-item.Item.TV0yhAn1Zj80NneZ"],
["黯蚀 (Darken)", "Compendium.griffion-chn.griffon-item.Item.XLFthkKfhLaDVjHB"],
["黯蚀伤害掷骰为8 (Necrotic Rolled an 8)", "Compendium.griffion-chn.griffon-item.Item.PLQuCI7P3Biz2L2z"],
["龙息（白）", "Compendium.griffion-chn.griffon-item.Item.SCROwzjgR7ZX2RaH"],
["龙息（红）", "Compendium.griffion-chn.griffon-item.Item.dDQRXbB5xKm5ipjd"],
["龙息（绿）", "Compendium.griffion-chn.griffon-item.Item.0lI2tPoY2CsPtIsd"],
["龙息（蓝）", "Compendium.griffion-chn.griffon-item.Item.iVWkzJdGMg0vRC1N"],
["龙息（黑）", "Compendium.griffion-chn.griffon-item.Item.lu5CB2hRu3eXuVKA"],
```

### §37 · `longjin-ditu.iack-1`（94 条）
```text
["七彩喷射 Color Spray", "Compendium.longjin-ditu.iack-1.Item.sJ3ML5DFm81r6RSo"],
["不灭明焰", "Compendium.longjin-ditu.iack-1.Item.MzA5MzYxYzE0NDVl"],
["传送法阵 Teleportation Circle", "Compendium.longjin-ditu.iack-1.Item.bljTzgKkh3dQNzY9"],
["传送法阵 Teleportation Circle", "Compendium.longjin-ditu.iack-1.Item.qe06F1tsz9gnwjTy"],
["侦测魔法", "Compendium.longjin-ditu.iack-1.Item.YjdlMmNiNDFjNGVh"],
["假寐术Catnap", "Compendium.longjin-ditu.iack-1.Item.YLgJduAsyP424e0z"],
["冰刃 Ice Knife", "Compendium.longjin-ditu.iack-1.Item.9gdAnuMn5SN93UI7"],
["冰风暴", "Compendium.longjin-ditu.iack-1.Item.MDEzMTE4MThmZWNl"],
["力场监牢 Forcecage", "Compendium.longjin-ditu.iack-1.Item.oaqVEVwA8Wj9jkDq"],
["加速术 Haste", "Compendium.longjin-ditu.iack-1.Item.uFwYg59IO1mzNZRi"],
["医疗术 Heal", "Compendium.longjin-ditu.iack-1.Item.UDAjGIgCzceGZSOS"],
["变巨/缩小术 Enlarge/Reduce", "Compendium.longjin-ditu.iack-1.Item.2z5CX1ovuURniCkm"],
["变形术", "Compendium.longjin-ditu.iack-1.Item.YmY0MTJiODFlNzI3"],
["变形术 Polymorph", "Compendium.longjin-ditu.iack-1.Item.d0rmQq5k7thh2z4p"],
["回避侦测", "Compendium.longjin-ditu.iack-1.Item.YTY1MzdlM2MzOGZj"],
["圣居 Hallow", "Compendium.longjin-ditu.iack-1.Item.eB77rqH1qrSQPUKO"],
["地狱呼唤Infernal Calling", "Compendium.longjin-ditu.iack-1.Item.62ucbpY2AxhTCBfP"],
["地缚 Earthbind", "Compendium.longjin-ditu.iack-1.Item.iazhmMEnG3CpXdIn"],
["塑石术 Stone Shape", "Compendium.longjin-ditu.iack-1.Item.IUnmkUryoama2MDY"],
["塔莎狂笑术 Hideous Laughter", "Compendium.longjin-ditu.iack-1.Item.lFgojuyfPqZYZc60"],
["守卫刻文 Glyph of Warding", "Compendium.longjin-ditu.iack-1.Item.kQhIFUWxS3tRDHU5"],
["守卫刻文 Glyph of Warding", "Compendium.longjin-ditu.iack-1.Item.mCLWRBaFUcLsey0W"],
["寒冰锥", "Compendium.longjin-ditu.iack-1.Item.YzM4YmVhYjJhNjQ5"],
["心灵遥控 Telekinesis", "Compendium.longjin-ditu.iack-1.Item.moXKlifUiST7baqw"],
["怪物定身术 Hold Monster", "Compendium.longjin-ditu.iack-1.Item.2OCfZcx3Bk1W0UGs"],
["护盾术", "Compendium.longjin-ditu.iack-1.Item.MWI2ODJhNDAxODgy"],
["指使术 Geas", "Compendium.longjin-ditu.iack-1.Item.mGMDZ3gvTFCxGDF7"],
["操水术 Shape Water", "Compendium.longjin-ditu.iack-1.Item.dDFkaDCuj5JT3Qde"],
["支配人类 Dominate Person", "Compendium.longjin-ditu.iack-1.Item.YKoI0aXiBs3Ve3dd"],
["时间停止 Time Stop", "Compendium.longjin-ditu.iack-1.Item.MAo4M05S66GeI78w"],
["易容术 (文森特·战壕)", "Compendium.longjin-ditu.iack-1.Item.OGQ3YmQ3MGYwMGVj"],
["暗示术", "Compendium.longjin-ditu.iack-1.Item.Nzk5OTc5OWRmZjBk"],
["暗示术 Suggestion", "Compendium.longjin-ditu.iack-1.Item.p6itP6yIg6Gqic3J"],
["李欧蒙秘藏箱 Secret Chest", "Compendium.longjin-ditu.iack-1.Item.MoswAskADzKUvdMf"],
["次级复原术 Lesser Restoration", "Compendium.longjin-ditu.iack-1.Item.d8xIfesqL4FARXNG"],
["死云术 Cloudkill", "Compendium.longjin-ditu.iack-1.Item.4Ekany2ZXCV6ojok"],
["毕格比之手 Arcane Hand", "Compendium.longjin-ditu.iack-1.Item.pXEtD3wLk0Duic8b"],
["水下呼吸", "Compendium.longjin-ditu.iack-1.Item.MTFjNWRhN2Q5YjI4"],
["沙墙Wall of Sand", "Compendium.longjin-ditu.iack-1.Item.wdeEqipwesHDIlsv"],
["法师护甲", "Compendium.longjin-ditu.iack-1.Item.ODU5ZTM4MzM0NTAz"],
["法术反制", "Compendium.longjin-ditu.iack-1.Item.MDFkZmYwNGY3ZjI0"],
["火球术", "Compendium.longjin-ditu.iack-1.Item.ODhlY2YyZTNlODQ0"],
["炽焰法球 Flaming Sphere", "Compendium.longjin-ditu.iack-1.Item.FaUOlHnjuinCsceS"],
["生物定位术", "Compendium.longjin-ditu.iack-1.Item.NjI5MTdkZjM2NDQz"],
["生物定位术 Locate Creature", "Compendium.longjin-ditu.iack-1.Item.0HkxLkVBu8z9aDTS"],
["疗伤术 Cure Wounds", "Compendium.longjin-ditu.iack-1.Item.CKcacLCJThJJnkgI"],
["疯狂冠冕Crown of Madness", "Compendium.longjin-ditu.iack-1.Item.xYBNQq0MzaA2Mguz"],
["睡眠术 Sleep", "Compendium.longjin-ditu.iack-1.Item.CzIf4a4uafsPSsqP"],
["睡眠术 Sleep", "Compendium.longjin-ditu.iack-1.Item.ptuX6OiQ4ZqJVlrG"],
["碧水法球 Watery Sphere", "Compendium.longjin-ditu.iack-1.Item.vO2UANpAdP1ADZKc"],
["秘法眼", "Compendium.longjin-ditu.iack-1.Item.YTk3ZjgwNmYyYjg2"],
["秘法锁", "Compendium.longjin-ditu.iack-1.Item.ODUyZjM3MjJhY2Jm"],
["移除诅咒 Remove Curse", "Compendium.longjin-ditu.iack-1.Item.LtseRt7iCWxBniHb"],
["篡改记忆", "Compendium.longjin-ditu.iack-1.Item.MWYzN2QwOGRlOWRi"],
["粉碎音波 Shatter", "Compendium.longjin-ditu.iack-1.Item.UgrZq8p2N7AOKuz1"],
["羽落术", "Compendium.longjin-ditu.iack-1.Item.YmM0YjkzODAwOTBi"],
["臭云术 Stinking Cloud", "Compendium.longjin-ditu.iack-1.Item.GXPbLtt4ks9XnhsO"],
["获得魔宠", "Compendium.longjin-ditu.iack-1.Item.ZDdiMTMxNDMzNjIy"],
["蛛网术 Web", "Compendium.longjin-ditu.iack-1.Item.OQ4CYjFkJW703gGE"],
["解离术", "Compendium.longjin-ditu.iack-1.Item.ZGQ2NDU2ZDA4MDE1"],
["解除魔法", "Compendium.longjin-ditu.iack-1.Item.ZjZhMTNjZTNlMDgw"],
["警报术 Alarm", "Compendium.longjin-ditu.iack-1.Item.Qu1RGmROYmxd2JhO"],
["警报术 Alarm", "Compendium.longjin-ditu.iack-1.Item.UcbLYGWWLVi7UeeO"],
["警报术 Alarm", "Compendium.longjin-ditu.iack-1.Item.UmCnvUUfkiW5ljPN"],
["迷你仆役Tiny Servant", "Compendium.longjin-ditu.iack-1.Item.sZq3Dd2YbNIAUA8J"],
["迷踪步", "Compendium.longjin-ditu.iack-1.Item.OTVlZjBmM2IyOGM1"],
["迷踪步 Misty Step", "Compendium.longjin-ditu.iack-1.Item.BcRQLAuUWvh9sNiF"],
["通晓语言", "Compendium.longjin-ditu.iack-1.Item.N2ZkNDY0Nzc0NmEz"],
["通晓语言 Comprehend Languages", "Compendium.longjin-ditu.iack-1.Item.sK53RNRHcF9JW2xF"],
["造成恐惧Cause Fear", "Compendium.longjin-ditu.iack-1.Item.fi200wM9ZKEB0UuF"],
["造水术／枯水术 Create or Destroy Water", "Compendium.longjin-ditu.iack-1.Item.BY8UGbiax1IqKWsa"],
["造风术 Gust of Wind", "Compendium.longjin-ditu.iack-1.Item.GZWjDATFRmS1Oju2"],
["闪电束", "Compendium.longjin-ditu.iack-1.Item.YTIxMmIxZjQyNGI0"],
["防护法阵 Magic Circle", "Compendium.longjin-ditu.iack-1.Item.YCbEKCwxPMT7cVVE"],
["隐形仆役", "Compendium.longjin-ditu.iack-1.Item.OWMxMjYxOTE5MDk3"],
["隐形仆役 Unseen Servant", "Compendium.longjin-ditu.iack-1.Item.AebSNVYmVdymYDnZ"],
["隐形术", "Compendium.longjin-ditu.iack-1.Item.YWY4ODc4M2Q5NDQ5"],
["雪雨暴 Sleet Storm", "Compendium.longjin-ditu.iack-1.Item.qvIMPMooSCXkMlTX"],
["雷鸣波 Thunderwave", "Compendium.longjin-ditu.iack-1.Item.p2XbCpzwyDUfxUl1"],
["飞行术", "Compendium.longjin-ditu.iack-1.Item.MmU2ZDQ3N2Y2Mjc3"],
["马友夫微流星Melf’s Minute Meteors", "Compendium.longjin-ditu.iack-1.Item.tFw0mmy6DBYjMnNG"],
["高等隐形术", "Compendium.longjin-ditu.iack-1.Item.ZjdmYmFmMjgzMTUw"],
["鬼斧神工", "Compendium.longjin-ditu.iack-1.Item.OTc4MWM3NGI5Y2Jm"],
["鬼斧神工 Fabricate", "Compendium.longjin-ditu.iack-1.Item.PM0CkHqOCZuDS41g"],
["魅影之力 phantasmal force", "Compendium.longjin-ditu.iack-1.Item.CU0NphEAuNOu5pz1"],
["魅惑怪物 Charm Monster", "Compendium.longjin-ditu.iack-1.Item.ITFJ01dc6EAMPmYY"],
["魔化武器", "Compendium.longjin-ditu.iack-1.Item.Yjk0Yjk0NDY2NjI5"],
["魔法飞弹", "Compendium.longjin-ditu.iack-1.Item.ZWY0NzczYzJhMWRm"],
["魔绳术", "Compendium.longjin-ditu.iack-1.Item.OTEzZDI3ZGY3M2Q0"],
["魔邓肯忠犬 Mordenkainen's Faithful Hound", "Compendium.longjin-ditu.iack-1.Item.Riww2oPMbrKwrG6B"],
["鹰眼术", "Compendium.longjin-ditu.iack-1.Item.ZTYzZDU4MDRjN2Zk"],
["黑暗视觉", "Compendium.longjin-ditu.iack-1.Item.YTJlNGZjMDRjNjZl"],
["黑暗视觉 Darkvision", "Compendium.longjin-ditu.iack-1.Item.Jz2I7p6KADArIGuT"],
["龙卷尘暴 Dust Devil", "Compendium.longjin-ditu.iack-1.Item.To68DQNEdwcUQFHT"],
```

### §37 · `sgeh-monkeydm.sgeh-items`（67 条）
```text
["先祖的纽带 Ancestral Bond", "Compendium.sgeh-monkeydm.sgeh-items.Item.yutBclp3I2ZgxpCg"],
["光耀之铃 Radiant Bell", "Compendium.sgeh-monkeydm.sgeh-items.Item.643o7GolFAgKAlyV"],
["凶兽恶哮 Bestial Roar", "Compendium.sgeh-monkeydm.sgeh-items.Item.OZYrR3HtUZkQ3Lxr"],
["凿骨术 Chisel Skull", "Compendium.sgeh-monkeydm.sgeh-items.Item.rww765B3hVojeB83"],
["发光 Glow", "Compendium.sgeh-monkeydm.sgeh-items.Item.4MdLQ4NEbV5Ha9RI"],
["可怖稻草人 Dread Scarecrow", "Compendium.sgeh-monkeydm.sgeh-items.Item.TTn54BYXHWqbeMDa"],
["圣令：揭示 Divine Order: Reveal", "Compendium.sgeh-monkeydm.sgeh-items.Item.8b22bszhgjsCJvmX"],
["圣令：祭献 Divine Order: Sacrifice", "Compendium.sgeh-monkeydm.sgeh-items.Item.sdQ2su6QUyqqPWnH"],
["圣令：超越 Divine Order: Transcend", "Compendium.sgeh-monkeydm.sgeh-items.Item.ElxHOSdLD6cIvBbI"],
["坟冢易序 Graveyard Shuffle", "Compendium.sgeh-monkeydm.sgeh-items.Item.9LjQeaKzYpW20uQ5"],
["坠星术 Starfall", "Compendium.sgeh-monkeydm.sgeh-items.Item.rdI5pnOdWqaAaBV3"],
["坠落术 Fall", "Compendium.sgeh-monkeydm.sgeh-items.Item.zLBkZnJ2o3udcEjr"],
["埋骨之地 Boneyard", "Compendium.sgeh-monkeydm.sgeh-items.Item.kD5ZRTrRpUyzrVXo"],
["大地破坏者 World Breaker", "Compendium.sgeh-monkeydm.sgeh-items.Item.TfM4nAlTTh02wlCQ"],
["天星屠戮 Radiant Slaughter", "Compendium.sgeh-monkeydm.sgeh-items.Item.QQTruSRdB0mEWgVy"],
["异界凝视 Otherworldly Gaze", "Compendium.sgeh-monkeydm.sgeh-items.Item.Nt5wYklrJqkQZnxt"],
["引力扭转 Gravitational Distortion", "Compendium.sgeh-monkeydm.sgeh-items.Item.uiVFpEglEeK0EbFG"],
["彼方一瞥 Cosmic Eye", "Compendium.sgeh-monkeydm.sgeh-items.Item.u0KgOtLyhzgZDwd1"],
["恐怖树林 Forest of Dread", "Compendium.sgeh-monkeydm.sgeh-items.Item.zQZ8Oh3YodxFnplE"],
["恶毒怨恨 Malicious Rancor", "Compendium.sgeh-monkeydm.sgeh-items.Item.4lpkCAkeC7TwMHg8"],
["惧怖猛击 Bludgeoning Horror", "Compendium.sgeh-monkeydm.sgeh-items.Item.PTtT0ES0IWdIFtGZ"],
["截肢术 Amputate", "Compendium.sgeh-monkeydm.sgeh-items.Item.jS6vB6eWq5oUGV3U"],
["手臂加农 Arm Cannon", "Compendium.sgeh-monkeydm.sgeh-items.Item.avCCaFh5IivQmTCV"],
["抑制重力 Dampen Gravity", "Compendium.sgeh-monkeydm.sgeh-items.Item.ktH5JyLhLlvyozYH"],
["投掷脆骨 Brittle Bone Throw", "Compendium.sgeh-monkeydm.sgeh-items.Item.ZMTEDMCjaPPiwL6h"],
["抛掷术 Fling", "Compendium.sgeh-monkeydm.sgeh-items.Item.LWC3s8VIfVjc57S2"],
["指骨射击 Phalangeal Shot", "Compendium.sgeh-monkeydm.sgeh-items.Item.1Ek7bUhviBeEcjkZ"],
["无羁密室 Unbound Chamber", "Compendium.sgeh-monkeydm.sgeh-items.Item.szOwFz0tj74WnHy6"],
["旧版虚假生命 Legacy's False Life", "Compendium.sgeh-monkeydm.sgeh-items.Item.VfaOb6GTwz1XJ5gs"],
["星界弹幕 Astral Barrage", "Compendium.sgeh-monkeydm.sgeh-items.Item.oYahmuizmZ79JNIT"],
["死之面相 Aspect of Death", "Compendium.sgeh-monkeydm.sgeh-items.Item.aUuXRZDBmRSR3wMU"],
["流质骨骼 Rubber Bones", "Compendium.sgeh-monkeydm.sgeh-items.Item.9gphmtH4LlYoILmI"],
["消影步 Vanishing Step", "Compendium.sgeh-monkeydm.sgeh-items.Item.FefzuGIfKRkQNAoh"],
["溶髓蚀骨 Osteophagia", "Compendium.sgeh-monkeydm.sgeh-items.Item.GQaRjxpnDRFbVqWT"],
["灵魄切割 Spectral Slash", "Compendium.sgeh-monkeydm.sgeh-items.Item.aKnjEOyzFLpG4c4x"],
["灵魄狂怒 Spectral Fury", "Compendium.sgeh-monkeydm.sgeh-items.Item.gl0ksMpsiHGQjcr9"],
["疾风连射 Flurry of Bullets", "Compendium.sgeh-monkeydm.sgeh-items.Item.9vHXYBJzHef2eq11"],
["破裂外壳 Fractured Shell", "Compendium.sgeh-monkeydm.sgeh-items.Item.S3QYEFCDCjgSJLQr"],
["碾压术 Crush", "Compendium.sgeh-monkeydm.sgeh-items.Item.e50aTCqFJq9NtTge"],
["虚空漫步 Void Walk", "Compendium.sgeh-monkeydm.sgeh-items.Item.j3Q7LMjNtwVooRdW"],
["跳跃震颤 Jumping Jolt", "Compendium.sgeh-monkeydm.sgeh-items.Item.MzACWcSpPwnkrSCb"],
["转移巨胃 Displacing Maw", "Compendium.sgeh-monkeydm.sgeh-items.Item.2Csy0FtJ8JeQiECE"],
["通电 Electrify", "Compendium.sgeh-monkeydm.sgeh-items.Item.WtxGDcgxsuBjMp4s"],
["重力井 Gravity Well", "Compendium.sgeh-monkeydm.sgeh-items.Item.LvZASHqiGdMaEAyU"],
["重力尖钉 Gravity Spike", "Compendium.sgeh-monkeydm.sgeh-items.Item.wJUHbUYAEYlKRmc1"],
["重力斩 Graviturgic Smite", "Compendium.sgeh-monkeydm.sgeh-items.Item.gfSQY0zLawDcnnd7"],
["重力防壁 Gravity Barrier", "Compendium.sgeh-monkeydm.sgeh-items.Item.KXnfPrvhn2ad8l8e"],
["重力鞭 Gravity Whip", "Compendium.sgeh-monkeydm.sgeh-items.Item.rvUAbLiUSRVVzVHl"],
["重力风暴 Gravity Storm", "Compendium.sgeh-monkeydm.sgeh-items.Item.8zRZgXF3cmW6FvrP"],
["重力飞跃 Gravity Leap", "Compendium.sgeh-monkeydm.sgeh-items.Item.Cxd5KJdxq4KS9q6V"],
["重压术 Bury", "Compendium.sgeh-monkeydm.sgeh-items.Item.8omIB2J2HpyqfCaF"],
["重压笼 Pressure Cage", "Compendium.sgeh-monkeydm.sgeh-items.Item.V37bLAQ67RCwMbON"],
["钙化记忆 Calcified Memories", "Compendium.sgeh-monkeydm.sgeh-items.Item.w40MOs8KknB3C3dr"],
["镀银外壳 Silvered Shell", "Compendium.sgeh-monkeydm.sgeh-items.Item.BzlBRl3gcYNG3Jie"],
["闪电喷井 Erupting Lightning", "Compendium.sgeh-monkeydm.sgeh-items.Item.Yf9iko14XQQxQcND"],
["隐蔽伏击 Blind Ambush", "Compendium.sgeh-monkeydm.sgeh-items.Item.0wFnTECYRVyTOhA3"],
["雷电充能 Lightning Charged", "Compendium.sgeh-monkeydm.sgeh-items.Item.aK8hWFH8kYLVMv70"],
["骨刺刑 Osseous Impalement", "Compendium.sgeh-monkeydm.sgeh-items.Item.kCepHwtOWwAFKCJs"],
["骨墙术 Wall of Bones", "Compendium.sgeh-monkeydm.sgeh-items.Item.xvz1sq1pNFgmbnAb"],
["骨处女 Maiden of Bones", "Compendium.sgeh-monkeydm.sgeh-items.Item.Io3gZo4GHQVf4v4C"],
["骨爪 Bone Claws", "Compendium.sgeh-monkeydm.sgeh-items.Item.JUzDjHCUR155zUfh"],
["骨盾术 Bone shield", "Compendium.sgeh-monkeydm.sgeh-items.Item.pQWClb5US98FruQp"],
["骨笼术 Osseous Cage", "Compendium.sgeh-monkeydm.sgeh-items.Item.kfj3OkeJrGnLrEd8"],
["骨茧 Bone Cocoon", "Compendium.sgeh-monkeydm.sgeh-items.Item.eL5gkoVU1Re3P7eB"],
["骨裂诅咒 Rupturing Curse", "Compendium.sgeh-monkeydm.sgeh-items.Item.qDAxr7A8uKLEmTAx"],
["骰掷骸骨 Rolling Bones", "Compendium.sgeh-monkeydm.sgeh-items.Item.P3ADqDaaeo3dfqd7"],
["骸尾术 Skeletal Tail", "Compendium.sgeh-monkeydm.sgeh-items.Item.wOJckT3oQ17uIcAh"],
```

### §37 · `sthdhh.sthdfs`（64 条）
```text
["先祖的纽带 Ancestral Bond", "Compendium.sthdhh.sthdfs.Item.0LxZZudGqVyUVgpR"],
["光耀之铃 Radiant Bell", "Compendium.sthdhh.sthdfs.Item.3MguMhO9f88fKn5M"],
["光辉屠杀r adiant Slaughter", "Compendium.sthdhh.sthdfs.Item.LPr0jbVux2IGAycJ"],
["凶兽恶哮 Bestial Roar", "Compendium.sthdhh.sthdfs.Item.I0nSDDZsWLXBGWau"],
["凿骨术 Chisel Skull", "Compendium.sthdhh.sthdfs.Item.GB4ZWNsCc1pvPStM"],
["可怖稻草人 Dread Scarecrow", "Compendium.sthdhh.sthdfs.Item.y0W8bjskLfjTeIRK"],
["圣令：揭示 Divine Order: Reveal", "Compendium.sthdhh.sthdfs.Item.2OJhSQOKI3EE2MY5"],
["圣令：祭献 Divine Order: Sacrifice", "Compendium.sthdhh.sthdfs.Item.Ox6p2B6BrwXg73ja"],
["圣令：超越 Divine Order: Transcend", "Compendium.sthdhh.sthdfs.Item.0V8nInOi4STxecHy"],
["坟冢易序 Graveyard Shuffle", "Compendium.sthdhh.sthdfs.Item.trf3EDO1TVRi8CyM"],
["坠星术 Starfall", "Compendium.sthdhh.sthdfs.Item.AHBQ6lvoqo1tp1ea"],
["坠落术 Fall", "Compendium.sthdhh.sthdfs.Item.BBZC7XHYiLK7Bj6G"],
["埋骨之地 Boneyard", "Compendium.sthdhh.sthdfs.Item.aNLoONSSLbBchiLU"],
["大地破坏者 world Breaker", "Compendium.sthdhh.sthdfs.Item.ZjV7lxtfvNKZIBwe"],
["异界凝视 Otherworldly Gaze", "Compendium.sthdhh.sthdfs.Item.J0oNHHYgLJWWsDVq"],
["引力扭转 Gravitational Distortion", "Compendium.sthdhh.sthdfs.Item.CbUOWxrxCSzZDFWs"],
["彼方一瞥 cosmic Eye", "Compendium.sthdhh.sthdfs.Item.EnGnkt1OX31wG8bA"],
["恐怖树林 Forest of Dread", "Compendium.sthdhh.sthdfs.Item.UIfnc7djxtSUoYdb"],
["恶毒怨恨 Malicious Rancor", "Compendium.sthdhh.sthdfs.Item.p47pd7AWtghQCvbn"],
["惧怖猛击 Bludgeoning Horror", "Compendium.sthdhh.sthdfs.Item.JAsANmFJjxAhMh2M"],
["截肢术 Amputate", "Compendium.sthdhh.sthdfs.Item.sOIC31hAbEYJmpZe"],
["手臂加农 Arm Cannon", "Compendium.sthdhh.sthdfs.Item.bAOqBDmokBrnYgYw"],
["抑制重力 ampen Gravity", "Compendium.sthdhh.sthdfs.Item.cYbPBkhSGWiOIbFz"],
["投掷脆骨 Brittle Bone Throw", "Compendium.sthdhh.sthdfs.Item.r4Np1Bzn3WiIJwav"],
["抛掷术 Fling", "Compendium.sthdhh.sthdfs.Item.NVI2r2DYMbSMrMvh"],
["指骨射击 Phalangeal Shot", "Compendium.sthdhh.sthdfs.Item.0itclqQIULyW6qqn"],
["无羁密室 Unbound Chamber", "Compendium.sthdhh.sthdfs.Item.NjTHTsZRpX9h1jCv"],
["星界弹幕 Astral Barrage", "Compendium.sthdhh.sthdfs.Item.1xLChQR5sqgbkZgi"],
["橡皮韧骨 Rubber Bones", "Compendium.sthdhh.sthdfs.Item.LXOhHD3TjP6FOFXB"],
["死之面相 Aspect of Death", "Compendium.sthdhh.sthdfs.Item.bpRmksFbmMLwtfo9"],
["消影步 Vanishing Step", "Compendium.sthdhh.sthdfs.Item.QbJnDhsWlF5KmOl8"],
["灵魄切割Spectral Slash", "Compendium.sthdhh.sthdfs.Item.0KFOvqfnDE0cWZAx"],
["灵魄狂怒 spectral Fury", "Compendium.sthdhh.sthdfs.Item.MeaNdjvhAc64B72H"],
["破裂外壳 Fractured Shell", "Compendium.sthdhh.sthdfs.Item.BVmUda0Sp45S2O5M"],
["碾压术 Crush", "Compendium.sthdhh.sthdfs.Item.A21C930gtYr2L2Hy"],
["虚空漫步 Void Walk", "Compendium.sthdhh.sthdfs.Item.uOwfUexRVovsHteC"],
["融消蚀骨 Osteophagia", "Compendium.sthdhh.sthdfs.Item.vvLy8Ji74FCXOHnu"],
["跳跃震颤 Jumping Jolt", "Compendium.sthdhh.sthdfs.Item.824icCGqe7WLhZT4"],
["转移巨胃 Displacing Maw", "Compendium.sthdhh.sthdfs.Item.Wp7HLypGaxD8R2Sc"],
["通电 Electrify", "Compendium.sthdhh.sthdfs.Item.tReuejU4JWiBhxlz"],
["重力井 Gravity Well", "Compendium.sthdhh.sthdfs.Item.nKWSFGn7KiKSXncm"],
["重力尖钉 Gravity Spike", "Compendium.sthdhh.sthdfs.Item.nnFCopdqKHUCc1S2"],
["重力屏障 Gravity Barrier", "Compendium.sthdhh.sthdfs.Item.2SrSL1GvHLK3mHSF"],
["重力斩 Graviturgic Smite", "Compendium.sthdhh.sthdfs.Item.LZ8EJzRgC5S0AwJu"],
["重力鞭 Gravity Whip", "Compendium.sthdhh.sthdfs.Item.rz7EqMusf4BJxxM6"],
["重力风暴 Gravity Storm", "Compendium.sthdhh.sthdfs.Item.37Rxp29HTnGMS5yN"],
["重力飞跃 Gravity Leap", "Compendium.sthdhh.sthdfs.Item.NM7GY1OEwl4A6ayF"],
["重压术 Bury", "Compendium.sthdhh.sthdfs.Item.PALhFXeV0sIsDZDc"],
["重压笼 Pressure Cage", "Compendium.sthdhh.sthdfs.Item.2GVRmM5uhBwB4cA4"],
["钙化记忆 Calcified Memories", "Compendium.sthdhh.sthdfs.Item.cAxKVdIycITxtEre"],
["镀银外壳Silvered Shell", "Compendium.sthdhh.sthdfs.Item.63jLYI6mgFVcUwdL"],
["闪电喷井 Erupting Lightning", "Compendium.sthdhh.sthdfs.Item.Pn9wKphPQtLb8Ydo"],
["隐蔽伏击 Blind Ambush", "Compendium.sthdhh.sthdfs.Item.ybcvHPr9eCpE9p8w"],
["雷电充能 Lightning Charged", "Compendium.sthdhh.sthdfs.Item.9QmuThakvhDgi2uJ"],
["骨刺刑 Osseous Impalement", "Compendium.sthdhh.sthdfs.Item.5Z2RqOeA7OEIXMtG"],
["骨墙术 Wall of Bones", "Compendium.sthdhh.sthdfs.Item.KXxItb4gl1onVca8"],
["骨处女 Maiden of Bones", "Compendium.sthdhh.sthdfs.Item.qeRNrS8e5lk4rXns"],
["骨爪 Bone Claws", "Compendium.sthdhh.sthdfs.Item.GT09vG3iJ8PSEt8V"],
["骨盾术 Bone shield", "Compendium.sthdhh.sthdfs.Item.yTtd2hKlKXDDstEd"],
["骨笼术 Osseous Cage", "Compendium.sthdhh.sthdfs.Item.oqpBcTT1NdY8LrMe"],
["骨茧 Bone Cocoon", "Compendium.sthdhh.sthdfs.Item.UmUnuXDNmpyapvwY"],
["骨裂诅咒 Rupturing Curse", "Compendium.sthdhh.sthdfs.Item.XbqWoyxJtRW1kiQh"],
["骰掷骸骨 Rolling Bones", "Compendium.sthdhh.sthdfs.Item.pvS1XblEZaRH30vZ"],
["骸尾术 Skeletal Tail", "Compendium.sthdhh.sthdfs.Item.4mIwf8hKNH67ZUMc"],
```

### §37 · `drakkenheim-scgd.spells`（54 条）
```text
["下毒术Envenom", "Compendium.drakkenheim-scgd.spells.Item.x9rCqOtPhpL6F68C"],
["中和场域Neutralizing Field", "Compendium.drakkenheim-scgd.spells.Item.XVfNWNJ36bDL758U"],
["八虹光剑Octarine Sword", "Compendium.drakkenheim-scgd.spells.Item.QkGEpz8UQoLtKGEv"],
["匿于世界之隙Vanish to the Space Between Worlds", "Compendium.drakkenheim-scgd.spells.Item.BgqUVivqJ43rgAxf"],
["召唤摇头摆尾的家伙Summon the Thing with the Writhing Tail", "Compendium.drakkenheim-scgd.spells.Item.nMEnehOCud1aRc3u"],
["可控突变Controlled Mutation", "Compendium.drakkenheim-scgd.spells.Item.OSEwx1jvbxzRSkC6"],
["夜影吐息Breath of Nightshade", "Compendium.drakkenheim-scgd.spells.Item.IRwpY2vcCKyoDiaL"],
["大瘟疫Pandemic", "Compendium.drakkenheim-scgd.spells.Item.Eo3Y9W0lHFECflay"],
["妄质元素召唤术Summon Delerium Elemental", "Compendium.drakkenheim-scgd.spells.Item.Zl5sRTuiieHzAePp"],
["妄质星爆Delerium Meteor Swarm", "Compendium.drakkenheim-scgd.spells.Item.iB2fcrOWD9LGdPoP"],
["尸爆Corpse Explosion", "Compendium.drakkenheim-scgd.spells.Item.zYbQfFPFHLHlWJ0i"],
["强酸球 Acid Orb", "Compendium.drakkenheim-scgd.spells.Item.LBSixFxWn8wbWrpI"],
["彗星碎片Comet Shards", "Compendium.drakkenheim-scgd.spells.Item.N5Y9HWajHMf0Ch0m"],
["恐怖转变Horrific Transformation", "Compendium.drakkenheim-scgd.spells.Item.t23nxyfP3uBLmWfp"],
["恶性坏死Vile Necrosis", "Compendium.drakkenheim-scgd.spells.Item.q1cVZoAH5Tcwj5X2"],
["恶毒剑Fetid Blade", "Compendium.drakkenheim-scgd.spells.Item.ipcAFt2m8Luht5Oj"],
["恶毒灵光Venomous Aura", "Compendium.drakkenheim-scgd.spells.Item.jD5KpnAgudUJshYU"],
["恶臭蒸汽Mephitic Vapors", "Compendium.drakkenheim-scgd.spells.Item.vTD7pqRl6jJ1OfnZ"],
["感染术Infect", "Compendium.drakkenheim-scgd.spells.Item.yv8R1NwzoZ6UJEsJ"],
["擒拿鬼手Grasping Ghost", "Compendium.drakkenheim-scgd.spells.Item.y0Hjt94L5pDGhot3"],
["极恶创伤Grievous Wounds", "Compendium.drakkenheim-scgd.spells.Item.sIraWdskPcHRnKqj"],
["死亡之触Touch of Death", "Compendium.drakkenheim-scgd.spells.Item.KACCzi5Q4iHU7eNq"],
["毒素护盾Toxic Shield", "Compendium.drakkenheim-scgd.spells.Item.1ghOJpyACQHvz78S"],
["毒药飞针Poison Needle", "Compendium.drakkenheim-scgd.spells.Item.dtoYtccI3x7J3KVy"],
["污染之手Contaminated Hands", "Compendium.drakkenheim-scgd.spells.Item.dvi6ZEKgBdDHGS0G"],
["污染免疫Contamination Immunity", "Compendium.drakkenheim-scgd.spells.Item.vs23ts2HfajIOxlI"],
["污染风暴Storm of Contamination", "Compendium.drakkenheim-scgd.spells.Item.2yJFeIgygqjpKdT0"],
["猛毒弹幕Toxic Barrage", "Compendium.drakkenheim-scgd.spells.Item.y81xp7yqTRbyE2Pq"],
["猛毒波Poison Wave", "Compendium.drakkenheim-scgd.spells.Item.8qqOkrAkojDeH3ju"],
["生物危害Biohazard", "Compendium.drakkenheim-scgd.spells.Item.pO02rAZlJJMhHwDV"],
["瘟疫术Pestilence", "Compendium.drakkenheim-scgd.spells.Item.xLVG3d2Q3vKNvWK8"],
["瘟疫行风Plague Wind", "Compendium.drakkenheim-scgd.spells.Item.IFbkSyQWXBPmNLlu"],
["瘴气术Miasma", "Compendium.drakkenheim-scgd.spells.Item.thhJ90CDXzQk1suL"],
["硫酸溢浆Vitriol Ichor", "Compendium.drakkenheim-scgd.spells.Item.HzB7W1LVcMvdJcKq"],
["祛除污染Purge Contamination", "Compendium.drakkenheim-scgd.spells.Item.RCZRkk5mU0PoswsG"],
["神经毒气Nerve Gas", "Compendium.drakkenheim-scgd.spells.Item.sU02lQ4LjO1dzcIK"],
["精神焕发Invigorate", "Compendium.drakkenheim-scgd.spells.Item.fSYZjZLqETuPd2Gy"],
["细菌弹幕Bacterial Barrage", "Compendium.drakkenheim-scgd.spells.Item.zYldIuIEiuGvUZze"],
["终末仪式Last Rites", "Compendium.drakkenheim-scgd.spells.Item.Wmg60KwX5QlbBvPd"],
["编织古老图文Weave the Elder Sign", "Compendium.drakkenheim-scgd.spells.Item.kkTnKuh9hPMvoVSN"],
["肺痨湍流Stream of Consumption", "Compendium.drakkenheim-scgd.spells.Item.ulr84866gzJh8Zxz"],
["脓毒休克Septic Shock", "Compendium.drakkenheim-scgd.spells.Item.i6X3czBV4C65jLKh"],
["腐坏孢子Corrupting Spores", "Compendium.drakkenheim-scgd.spells.Item.kGETHbocQaq9TTrM"],
["腐坏治疗Corrupted Cure", "Compendium.drakkenheim-scgd.spells.Item.6UBHaWHvd6Wwc4Vy"],
["腐蚀之攥Caustic Grip", "Compendium.drakkenheim-scgd.spells.Item.pncZLHI8BvRi0Lrt"],
["腐蚀爆裂Corrosive Blast", "Compendium.drakkenheim-scgd.spells.Item.YnQv0yvYTmG7w5kQ"],
["虹吸时间Siphon Time", "Compendium.drakkenheim-scgd.spells.Item.r2LmhwT41M46kPLP"],
["裂眼术Ocular Necrosis", "Compendium.drakkenheim-scgd.spells.Item.9YtFl0Xdl1mhIClK"],
["解除重力Unbind Gravity", "Compendium.drakkenheim-scgd.spells.Item.cp3f5G43UJnXDJSX"],
["逐于世界之隙Banish to the Space Between Worlds", "Compendium.drakkenheim-scgd.spells.Item.mu9LkyRcCnWaJl5R"],
["酸蚀灼烧Acid Burn", "Compendium.drakkenheim-scgd.spells.Item.6PvXFOMmpPCVuRzU"],
["酸雨术Acid Rain", "Compendium.drakkenheim-scgd.spells.Item.YsX6XFrUH1fVPgtn"],
["镇静毒素Tranquilizing Toxin", "Compendium.drakkenheim-scgd.spells.Item.i7m5NZLTHT3NabuX"],
["鲜血蠕虫Blood Worm", "Compendium.drakkenheim-scgd.spells.Item.xh4rMJG8taEAbE9I"],
```

### §37 · `9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086`（43 条）
```text
["咒术-巨人火焰", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.EFF1F2l4BbiHtcE2"],
["咒术-恶神火焰", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.L4tOzKCYeiy6O2dd"],
["咒术-投火", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.4Lm6x2OwbbQ4nwb3"],
["咒术-横扫黑焰", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.aKmK3vJo86BwCL71"],
["咒术-火焰之力", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.QQSyrlTW47Kj8Vtv"],
["咒术-火焰倾注", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.HNXp5OjkXY0uo1hb"],
["咒术-火焰吞噬一切", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.IWByIAzCvo50AbGH"],
["咒术-火焰喷发", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.Bz8RHiMPGhiYFSHO"],
["咒术-火焰庇佑", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.X3t6aNTZnNpb6P2T"],
["咒术-燃火", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.LpMrDz2NsuejSgAI"],
["咒术-爆燃火焰", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.rXhETYPnTLCXfNUG"],
["咒术-黑剑", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.0GB91RGUyTncL9zy"],
["咒术-黑焰", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.40RHPU5uIyC2kpkf"],
["咒术-黑焰仪式", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.3zrV0wPeYMugJ5U9"],
["咒术-黑焰庇佑", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.E0iRSu0WnQxO4zf3"],
["祈祷-光环", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.uE2TBfpRD9kCb16m"],
["祈祷-回归性原理", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.qV2Nk0ybVXNMguw1"],
["祈祷-拒绝", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.iqIZUnbdYDWNtco2"],
["祈祷-死亡雷击", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.Fkbxo4dQozATuin3"],
["祈祷-精确雷击", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.EUfWc4Ndta2UHhTT"],
["祈祷-紧急恢复", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.4Gx7nEmOHRgDtwTs"],
["祈祷-纠死圣律", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.f5GcRTdHBOi3Y3pM"],
["祈祷-维克的龙雷", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.84STK6ymV6o55fAc"],
["祈祷-艾尔登流星", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.T4cWrllQfA4fgyzU"],
["祈祷-雷击", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.XG0jZlXwNzlzyoj5"],
["祈祷-雷电枪", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.IwqfywzyYbaq3wPo"],
["祈祷-黄金树恩惠", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.6YBp7NdnNC0LNbz9"],
["祈祷-黄金树护佑", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.3qG3FM0w3qfl9FqC"],
["祈祷-黄金树疗愈", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.budX8iNqs72F27oQ"],
["祈祷-黄金树立誓", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.xy1NCdUkDQws3DvH"],
["辉石-创星雨", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.gHyiV3U3C0RhSXUN"],
["辉石-卡利亚剑阵", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.kZ1kpE5z6yOrMbwO"],
["辉石-卡利亚大剑", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.Rxr9LxmgF0LNtyDh"],
["辉石-卡利亚迅剑", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.dKxQ0aHccUz2UavN"],
["辉石-彗星亚兹勒", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.XRk60O2AiG8qpTut"],
["辉石-毁灭流星", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.OFCcUekuQDOKiaVI"],
["辉石-海摩大槌", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.PCCDNIWDYH9YYKUi"],
["辉石-结晶连弹", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.5yTLf1rb1DfL7ITA"],
["辉石-罗蕾塔的绝招", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.2aOxnudm0oOSp1KQ"],
["辉石-菈妮的暗月", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.OjXaqD5imG1hFzu0"],
["辉石-辉石魔砾", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.ngNaBisspH1EYAJb"],
["辉石-魔法辉剑", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.iaql5VofY7imGfn0"],
["辉石-黑夜彗星", "Compendium.9bbxceldenring.winter-of-ten-towns-9bbxc-1750314482086.Item.ceqmmFz76cMgLsGs"],
```

### §37 · `5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476`（35 条）
```text
["善战者披风-十字军披风", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.j8hJstmIlR7gxU0R"],
["地狱火手弩-灼热射线", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.IDxxcOfz6GN5mCZG"],
["城主的护盾", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.nY1vrXcrl68UR9Qt"],
["城主的治疗", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.MMaZo62P4OHhX8en"],
["城主的祝福术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.H4DrfQKbeSuGwARO"],
["天使之花-灵体卫士", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.br3xrxtrNIImZ2Zb"],
["天使之花-魂灵环绕", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.PNv6RvDzfuNHUljR"],
["奥图迷舞", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.xdwcEE15liCOfAZ8"],
["星界护符-跳跃术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.cuiXDdrSkRMqvcW4"],
["星界银剑-迷踪步", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.Ixws0Dj7RNxI4Lbw"],
["曳光弹", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.y1PCCeGmX8sUIv77"],
["月长石-群体治愈真言", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.WeNb1XIAhWeoC7Kt"],
["欧吕尔传说圣徽-冰风暴", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.UG7yS1hjW9eC2OfX"],
["欧吕尔传说圣徽-寒冰锥", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.XTLyOtvJQEVP7ZTA"],
["欧吕尔传说圣徽-雪雨暴", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.tArj0BzQMj8vY4hk"],
["燃烧之手", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.cfvTJipsDEodH6lh"],
["粹丽学院剑权杖-奇观之雨", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.Gcb95elXes6Fav92"],
["粹丽学院剑权杖-横扫剑击", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.K4hT5ZBtgaqxB7FK"],
["美杜莎的面孔-石化术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.5XSvxWfwGxJoK09J"],
["翠炎剑", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.dc6T2IQmopkvTwWS"],
["蛛网术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.Wamw9vNIdqTr615b"],
["蛛行术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.DfiVlUvR3WnwbeOT"],
["解离术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.UJ8PhkVbXlYFvdEn"],
["讥笑链枷-塔莎狂笑术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.tNhIRfgCBwulQr0g"],
["闪电束", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.Bbzkc1MAmsXvjbfZ"],
["阿曼纳塔的圣徽-阳炎射线", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.Szpj9b5ap6PrPnXe"],
["隐藏领主之盾-火墙术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.x78VQWXy7LjiAhFh"],
["隐藏领主之盾-火球术", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.e8XB0VIZo2r3i13J"],
["雷霆护腕-电爪", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.miQ3ktXZ0cVDPEaC"],
["靡华学院血印记-喋血", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.RfLtik9vF37HvGQt"],
["靡华学院血印记-记忆之血-出血", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.gGsxHxu88kL9dhzs"],
["靡华学院血印记-记忆之血-授血", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.y8SfraLHeSityaKt"],
["靡华学院血印记-记忆之血-献祭", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.TQA4QwxBsWcVNMNz"],
["靡华学院血印记-记忆之血-鲜血", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.Mw6CyzM330DnjE57"],
["魔能戒指-魔能爆", "Compendium.5bbxcpoison.winter-of-ten-towns-5bbxc-1750314279476.Item.iWDl8brcQEG6GS0L"],
```

### §37 · `heliana-core.items-heliana-gelatinous-polyhedrooze`（16 条）
```text
["住口！ Zippit!", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.bg2FnQnosGWPORsL"],
["内吸虫 Endoleech", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.Y5KbtmX3TYk3Ehc9"],
["内吸虫 Endoleech", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.bhNRxpQ93ZM65mTz"],
["变色龙皮肤 Chameleon Skin", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.06nKk1YowCoOT9Kx"],
["变色龙皮肤 Chameleon Skin", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.m31rn4eW1eGo6tG4"],
["维持 Preserve", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.ftUSsFk6hia4Md5a"],
["维持 Preserve", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.vW6AKnPsvXpDZaWF"],
["肺爆 Lungburst", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.aOsfZMfBbaurIjAn"],
["肺爆术 Lungburst", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.VEy6HKY85GYgM4Xe"],
["蛙皮 Frogskin", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.X5inmA6wATIU5HYw"],
["蛙皮 Frogskin", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.ZySpMsq6D46Wctw2"],
["针与刺 Pins and Needles", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.YgwjoXVTMsZKqlKS"],
["针与刺 Pins and Needles", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.iRHpMXjl1r5stsgG"],
["闭嘴！ Zippit!", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.cEOAj9HDKICigGAb"],
["骨笼 Bone Cage", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.3AnAomJOWYhOXARb"],
["骨笼术 Bone Cage", "Compendium.heliana-core.items-heliana-gelatinous-polyhedrooze.Item.k3KLKfajX0JByvuj"],
```

### §37 · `drakkenheim-core.spells`（14 条）
```text
["中和场域", "Compendium.drakkenheim-core.spells.Item.NeuT000000000006"],
["天火圣礼", "Compendium.drakkenheim-core.spells.Item.q1NhS5cx7cp2vBMl"],
["妄彩球", "Compendium.drakkenheim-core.spells.Item.DelT000000000004"],
["妄能爆破", "Compendium.drakkenheim-core.spells.Item.DelT000000000003"],
["强制进化", "Compendium.drakkenheim-core.spells.Item.ForT000000000005"],
["扭曲矢", "Compendium.drakkenheim-core.spells.Item.WarT000000000012"],
["污染之力", "Compendium.drakkenheim-core.spells.Item.ConT000000000002"],
["污染免疫", "Compendium.drakkenheim-core.spells.Item.ConT000000000001"],
["污染射线", "Compendium.drakkenheim-core.spells.Item.RayT000000000010"],
["污染转嫁", "Compendium.drakkenheim-core.spells.Item.SipT000000000011"],
["浓厚污霭咒唤术", "Compendium.drakkenheim-core.spells.Item.ConT000000000000"],
["祛除污染", "Compendium.drakkenheim-core.spells.Item.PurT000000000008"],
["第八虹光喷射", "Compendium.drakkenheim-core.spells.Item.OctT000000000007"],
["驱隙电闪", "Compendium.drakkenheim-core.spells.Item.RidT000000000009"],
```

### §37 · `boss-loot-assets-premium.blfx-spells`（12 条）
```text
["Darkness", "Compendium.boss-loot-assets-premium.blfx-spells.Item.zEcCiyFdUojfDnsR"],
["Daylight", "Compendium.boss-loot-assets-premium.blfx-spells.Item.nUyl4fpJxjXhC8qH"],
["朦胧术 Blur", "Compendium.boss-loot-assets-premium.blfx-spells.Item.JN7Dnd4zzQ4378ne"],
["火焰刀 Flame Blade", "Compendium.boss-loot-assets-premium.blfx-spells.Item.LI8u67M3CK130bIc"],
["灼热射线 Scorching Ray", "Compendium.boss-loot-assets-premium.blfx-spells.Item.ELB3D5vjwNXj4n6p"],
["炽焰法球 Flaming Sphere", "Compendium.boss-loot-assets-premium.blfx-spells.Item.MhN6c4H1U5WFu1Z6"],
["燃火术 Produce Flame", "Compendium.boss-loot-assets-premium.blfx-spells.Item.vBZoCL7yeSvQ6Ne1"],
["猎人印记 Hunter's Mark", "Compendium.boss-loot-assets-premium.blfx-spells.Item.zhXPmpiOfgyBtg3N"],
["荆棘之鞭 Thorn Lash", "Compendium.boss-loot-assets-premium.blfx-spells.Item.iq05SnDFMCfawo93"],
["造风术 Gust of Wind", "Compendium.boss-loot-assets-premium.blfx-spells.Item.PEy5BlTeIHaO156Q"],
["雷鸣波 Thunderwave", "Compendium.boss-loot-assets-premium.blfx-spells.Item.LBo0SL4KkaUGRZKz"],
["魔法飞弹 Magic Missile", "Compendium.boss-loot-assets-premium.blfx-spells.Item.bl7gkjWAhpJtph5t"],
```

### §37 · `heliana-core.items-heliana-a-tale-of-two-tails`（9 条）
```text
["安静！ Zippit!", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.KKlmcpEOkxBv6UtV"],
["恶臭 Stench", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.o9pgIFWwCIZdhTXm"],
["戏法 Cannotrip", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.aTaKGNGXXUdRjYZN"],
["戏法 Can’trip", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.bjaloh1M4MwdEXal"],
["暴怒 Enrage", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.KDV7TlyLmMFFkEV4"],
["污秽灵光 Aura of Impurity", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.muqh5ouGk5WHUmr9"],
["织法扭曲 Weavebend", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.FylFCDiye0FogiO6"],
["重力砸毁 Gravity Smash", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.scUNyO352YuhHAVZ"],
["魔网纠缠 Weave Entanglement", "Compendium.heliana-core.items-heliana-a-tale-of-two-tails.Item.7fNGmP00svvZTR5r"],
```

### §37 · `heliana-core.items-heliana-reign-of-iron`（8 条）
```text
["奥法磁力斥力 Arcanomagnetic Repulsion", "Compendium.heliana-core.items-heliana-reign-of-iron.Item.ru7lTMgeFGThzSuQ"],
["奥法磁暴 Arcanomagnetic Storm", "Compendium.heliana-core.items-heliana-reign-of-iron.Item.NiFIK5OjnYo4RzwD"],
["奥法磁暴 Arcanomagnetic Storm", "Compendium.heliana-core.items-heliana-reign-of-iron.Item.WmW8UQs9HysJnm1u"],
["奥磁斥力 Arcanomagnetic Repulsion", "Compendium.heliana-core.items-heliana-reign-of-iron.Item.kZIKYEK4P6Y2pHL3"],
["磁力箭 Magnetobolt", "Compendium.heliana-core.items-heliana-reign-of-iron.Item.ihfTzRqXTcnxlKXZ"],
["磁力飞弹 Magnetobolt", "Compendium.heliana-core.items-heliana-reign-of-iron.Item.XOTdfijFbqwhVmx0"],
["磁铁矿碎片 Magnetite Shard", "Compendium.heliana-core.items-heliana-reign-of-iron.Item.d3Nx4Y5XNx7R2ljj"],
["磁铁矿碎片 Magnetite Shard", "Compendium.heliana-core.items-heliana-reign-of-iron.Item.dAS39Sd5dq1aXnGl"],
```

### §37 · `heliana-core.items-heliana-shadow-of-the-broodmother`（8 条）
```text
["水之长鞭 Water Whip", "Compendium.heliana-core.items-heliana-shadow-of-the-broodmother.Item.wjoobOLBtiUgSXDU"],
["水鞭 Water Whip", "Compendium.heliana-core.items-heliana-shadow-of-the-broodmother.Item.gJ0Loc0BHXxqMxEP"],
["深水冲锋 Depth Charge", "Compendium.heliana-core.items-heliana-shadow-of-the-broodmother.Item.2G1l3X5uwcOyRF67"],
["深潜冲锋 Depth Charge", "Compendium.heliana-core.items-heliana-shadow-of-the-broodmother.Item.K7FSP5rRuwrZDVSI"],
["激流 Riptide", "Compendium.heliana-core.items-heliana-shadow-of-the-broodmother.Item.LuEm5stfqLbJp9qZ"],
["激流 Riptide", "Compendium.heliana-core.items-heliana-shadow-of-the-broodmother.Item.WZuuMBObBjHHoG2O"],
["集群 Swarm", "Compendium.heliana-core.items-heliana-shadow-of-the-broodmother.Item.GAokrniGxIPXiu2v"],
["集群 Swarm", "Compendium.heliana-core.items-heliana-shadow-of-the-broodmother.Item.W47ONyScHvE0piJF"],
```

### §37 · `heliana-core.items-heliana-the-veiled-lady`（8 条）
```text
["孢子云 Spore Cloud", "Compendium.heliana-core.items-heliana-the-veiled-lady.Item.kFs5m2XYcAUdCcx5"],
["烟幕 Smokescreen", "Compendium.heliana-core.items-heliana-the-veiled-lady.Item.MeAHICvn9eHG5Lml"],
["狂怒 Enrage", "Compendium.heliana-core.items-heliana-the-veiled-lady.Item.l0oALTQuDQJE5vKv"],
["痛苦镣铐 Shackles of Pain", "Compendium.heliana-core.items-heliana-the-veiled-lady.Item.oj0UVBJsE0I866Py"],
["真菌感染 Fungal Infection", "Compendium.heliana-core.items-heliana-the-veiled-lady.Item.cIWJunlaFvcCbpPQ"],
["肺爆术 Lungburst", "Compendium.heliana-core.items-heliana-the-veiled-lady.Item.kfYYVcVQ4tPlQwwk"],
["腐化溢浆 Corrupting Ichor", "Compendium.heliana-core.items-heliana-the-veiled-lady.Item.6lpk4zHNq5InAGMv"],
["致命脉冲 Mortiferous Pulse", "Compendium.heliana-core.items-heliana-the-veiled-lady.Item.Z4YoNd8AFxiLAkwW"],
```

### §37 · `mcdm-class-bundle.features`（8 条）
```text
["亵渎灵光 Aura of Desecration", "Compendium.mcdm-class-bundle.features.Item.MeIFOWtgVbxqYRYd"],
["地狱之鞭 Hell's Lash", "Compendium.mcdm-class-bundle.features.Item.7r3G6RwRiJu2U8VW"],
["地狱微尘 Mote of Hell", "Compendium.mcdm-class-bundle.features.Item.t1HVSGzNAeJzCr5R"],
["地狱火 Hellfire", "Compendium.mcdm-class-bundle.features.Item.pJouM3sgbYcLbaGo"],
["复仇刀锋 Vengeful Blade", "Compendium.mcdm-class-bundle.features.Item.CSTcX2JkgwzISZvc"],
["恶毒武器 Maligned Weapon", "Compendium.mcdm-class-bundle.features.Item.BuAvjSCwg3zvemwj"],
["死亡之墙 Wall of Death", "Compendium.mcdm-class-bundle.features.Item.mAxbmK6vv25Jz2ip"],
["炼狱挑战 Infernal Challenge", "Compendium.mcdm-class-bundle.features.Item.MsoWprfWbRJYZCw1"],
```

### §37 · `yihusishe.magic`（7 条）
```text
["引咒击", "Compendium.yihusishe.magic.Item.Yyt6UfWktLcNOQpd"],
["强效祝福术", "Compendium.yihusishe.magic.Item.7UOpXtWM4tM2Wquh"],
["恶毒打击", "Compendium.yihusishe.magic.Item.rSKT76DDBrY20fXI"],
["指引击", "Compendium.yihusishe.magic.Item.WwcfAOBXZouXyoJL"],
["漩涡箭", "Compendium.yihusishe.magic.Item.strQRb2LK8Bs1OTB"],
["眩晕击", "Compendium.yihusishe.magic.Item.UnGc3ScOm9wZqQdd"],
["缓速击", "Compendium.yihusishe.magic.Item.iMLaA2PrGtjxYXYC"],
```

### §37 · `heliana-core.items-heliana-dread-and-breakfast`（5 条）
```text
["腐化脓液 Corrupting Ichor", "Compendium.heliana-core.items-heliana-dread-and-breakfast.Item.uvRPagN1NWZpzpba"],
["致命脉冲 Mortiferous Pulse", "Compendium.heliana-core.items-heliana-dread-and-breakfast.Item.gt40CXH2et58T0Wt"],
["酸雨术 Acid Rain", "Compendium.heliana-core.items-heliana-dread-and-breakfast.Item.GxHajfGuGZrcBOVY"],
["针扎刺麻 Pins and Needles", "Compendium.heliana-core.items-heliana-dread-and-breakfast.Item.H4h3pErIkf8A4SCn"],
["闭嘴！ Zippit!", "Compendium.heliana-core.items-heliana-dread-and-breakfast.Item.44d4E769QyxHvCXp"],
```

### §37 · `heliana-core.items-heliana-hare-raising`（5 条）
```text
["白骨原野 Field of Bones", "Compendium.heliana-core.items-heliana-hare-raising.Item.xagR0OiYsgYoVOgh"],
["白骨领域 Field of Bones", "Compendium.heliana-core.items-heliana-hare-raising.Item.vSh80h7QSvU33rLZ"],
["血肉化骨 Flesh to Bone", "Compendium.heliana-core.items-heliana-hare-raising.Item.LQma1zB0iRlzhPf9"],
["骨笼 Bone Cage", "Compendium.heliana-core.items-heliana-hare-raising.Item.ec818UgToWeON2cQ"],
["骨笼术 Bone Cage", "Compendium.heliana-core.items-heliana-hare-raising.Item.gYDdFBY4JkD6Mcbh"],
```

### §37 · `heliana-core.items-heliana-dream-weaver`（4 条）
```text
["咒唤异象 Conjure Anomaly", "Compendium.heliana-core.items-heliana-dream-weaver.Item.eeTAMwvSc0JhjqOy"],
["梦游 Dreamwalk", "Compendium.heliana-core.items-heliana-dream-weaver.Item.RI7r7NyCEHg1OAU2"],
["灵体 Incorporeality", "Compendium.heliana-core.items-heliana-dream-weaver.Item.xmQ77BsX3jU9QrjL"],
["白日梦 Daydream", "Compendium.heliana-core.items-heliana-dream-weaver.Item.fF4CVRbF7pvRKRcz"],
```

### §37 · `heliana-core.items-heliana-mecha-koboldzilla`（4 条）
```text
["守护 Protection", "Compendium.heliana-core.items-heliana-mecha-koboldzilla.Item.1yqbhpbspeWyOxpv"],
["机械魔法 Mechamagic", "Compendium.heliana-core.items-heliana-mecha-koboldzilla.Item.W3IW4wfcQ3f8wzEj"],
["菲克西特 Fixit", "Compendium.heliana-core.items-heliana-mecha-koboldzilla.Item.RQtF5crD7M08VVmi"],
["酸雨术 Acid Rain", "Compendium.heliana-core.items-heliana-mecha-koboldzilla.Item.SgYnMLvtqZn2Qiqq"],
```

### §37 · `heliana-core.items-heliana-the-shining-shrine`（4 条）
```text
["激怒 Enrage", "Compendium.heliana-core.items-heliana-the-shining-shrine.Item.078hu2lSRWDkRu3O"],
["白日梦 Daydream", "Compendium.heliana-core.items-heliana-the-shining-shrine.Item.mP8JjvcRqiQyTP1w"],
["致盲光辉 Blinding Radiance", "Compendium.heliana-core.items-heliana-the-shining-shrine.Item.BLyDv9HymhQvFlza"],
["闪耀 Flare", "Compendium.heliana-core.items-heliana-the-shining-shrine.Item.dD9pa0csKOC1m8Vc"],
```

### §37 · `yihusishe.texing`（3 条）
```text
["圣杯座治疗", "Compendium.yihusishe.texing.Item.A9yWLraAdwbHMbzW"],
["圣武士的至圣斩", "Compendium.yihusishe.texing.Item.p67LOkFvF7dyY6ps"],
["射手座光箭", "Compendium.yihusishe.texing.Item.4zTSzyxQK7QRyUd7"],
```

### §37 · `boss-loot-adventures-premium.boss-loot-items-premium-pack`（2 条）
```text
["Arcane Shot Arcane Shot", "Compendium.boss-loot-adventures-premium.boss-loot-items-premium-pack.Item.Dsj6yvbFUVbMtFHT"],
["Mindflame Incision Mindflame Incision", "Compendium.boss-loot-adventures-premium.boss-loot-items-premium-pack.Item.CKwIGUaM26vRYk9r"],
```

### §37 · `heliana-core.items`（2 条）
```text
["隐形术（不留痕迹） Invisibility (Leave No Trace)", "Compendium.heliana-core.items.Item.cHz6XW7qdoZE2G7h"],
["鼓舞 Bolster", "Compendium.heliana-core.items.Item.5D2uuwkBLfMfNMu2"],
```

### §37 · `heliana-core.items-heliana-tarchaeology`（2 条）
```text
["泥浆球 Mireball", "Compendium.heliana-core.items-heliana-tarchaeology.Item.meaGr8g7x01XV0kC"],
["骨笼 Bone Cage", "Compendium.heliana-core.items-heliana-tarchaeology.Item.AtCsdknoWTC8nBu6"],
```

### §37 · `adv-reminder.sample-items`（1 条）
```text
["Guidance", "Compendium.adv-reminder.sample-items.Item.UVBfHzIpTpXcg0Rn"],
```

### §37 · `ATL.premade`（1 条）
```text
["Light", "Compendium.ATL.premade.Item.2lqBiA3sUT7ufe4U"],
```

### §37 · `drakkenheim-monsters.features`（1 条）
```text
["祛除污染 Purge Contamination", "Compendium.drakkenheim-monsters.features.Item.zgfmQrRMpvBoPAnB"],
```

### §37 · `drakkenheim-scgd.features`（1 条）
```text
["强化属性 Enhance Ability", "Compendium.drakkenheim-scgd.features.Item.t257Wyc0yYdsr7YI"],
```

### §37 · `yihusishe.sishewupin`（1 条）
```text
["风暴召唤！", "Compendium.yihusishe.sishewupin.Item.GPIqbpm5vMIZ6Z6i"],
```

> 合计 2905 条 / 50 个包。
