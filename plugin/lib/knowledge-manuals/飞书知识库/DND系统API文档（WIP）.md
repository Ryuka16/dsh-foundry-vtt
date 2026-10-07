# DND系统API文档（WIP）

<callout emoji="❗">
本文档版本适配dnd系统v5.2.5
</callout>

## **1. 全局命名空间与配置**

系统将主要功能挂载在 `game.dnd5e` 和全局 `dnd5e` 对象上。

```JavaScript
// 访问方式
game.dnd5e.utils.formatNumber(10);
// 或
dnd5e.documents.Actor5e;
```

### **主要子模块**

| 模块 | 说明 |
|-|-|
| `dnd5e.utils` | 通用工具函数（格式化、公式处理、ID生成等） |
| `dnd5e.documents` | 扩展的 Document 类（Actor5e, Item5e, ActiveEffect5e 等） |
| `dnd5e.dataModels` | 数据模型类（Schema 定义） |
| `dnd5e.applications` | 所有 UI 应用类 |
| `dnd5e.dice` | 骰子类和掷骰辅助 |
| `dnd5e.enrichers` | 文本增强器（`[[/attack]]` 等） |
| `dnd5e.migrations` | 数据迁移工具 |
| `dnd5e.registry` | 注册表（职业、法术列表、召唤物等） |
| `dnd5e.canvas` | 画布扩展（Token, 测量版放置等） |
| `dnd5e.Filter` | 过滤查询引擎 |
| `CONFIG.DND5E` | 系统配置常量（能力、技能、伤害类型等） |



## **2. 通用工具函数（`dnd5e.utils`）**

所有函数均通过 `dnd5e.utils` 或直接从 `utils` 导入使用。

### **2.1 数字与单位格式化**

####  **'formatNumber(value, options)'**

格式化数字，支持序数、罗马数字、单词形式。

**参数：**

- `value` (number) – 要格式化的数字
- `options` (object) – 可选

  - `blank` (string) – 零或空值时显示的字符串
  - `numerals` (boolean) – 是否输出罗马数字
  - `ordinal` (boolean) – 是否输出序数（1st, 2nd, 3rd）
  - `words` (boolean) – 是否输出英文单词（如 "one", "two"）
  - 其他 `Intl.NumberFormat` 选项（`style`, `currency`, `minimumFractionDigits` 等）

**返回值：** string

**示例：**

```JavaScript
dnd5e.utils.formatNumber(3, { ordinal: true });   // "3rd"
dnd5e.utils.formatNumber(4, { numerals: true });  // "IV"
dnd5e.utils.formatNumber(0, { blank: "—" });      // "—"
dnd5e.utils.formatNumber(1234.5, { style: "currency", currency: "USD" });
```

####  **'formatCR(value, { narrow })'**

格式化挑战等级（CR），支持分数符号。

**参数：**

- `value` (number) – CR 数值（如 0.125, 0.25, 0.5, 1, 2...）
- `narrow` (boolean, 默认 true) – 是否使用窄分数符号（⅛ 而非 1/8）

**返回值：** string

**示例：**

```JavaScript
dnd5e.utils.formatCR(0.25);      // "¼"
dnd5e.utils.formatCR(0.25, { narrow: false }); // "1/4"
dnd5e.utils.formatCR(null);      // "—"
```



####  **'formatModifier(mod)'**

格式化属性调整值，带正负号并包裹在 `<span class="sign">` 中。

**参数：**

- `mod` (number) – 调整值

**返回值：** 'Handlebars.SafeString'

**示例：**

```JavaScript
dnd5e.utils.formatModifier(5);  // "<span class=\"sign\">+</span>5"
dnd5e.utils.formatModifier(-3); // "<span class=\"sign\">-</span>3"
```



####  **'formatLength(value, unit, options)'**

格式化长度值并附加单位。

**参数：**

- `value` (number) – 长度数值
- `unit` (string) – 单位（如 "ft", "m", "mi"），定义在 `CONFIG.DND5E.movementUnits`
- `options` (object) – 传递给 `formatNumber` 的选项

**返回值：** string

**示例：**

```JavaScript
dnd5e.utils.formatLength(30, "ft");   // "30 ft."
dnd5e.utils.formatLength(1.5, "m");   // "1.5 m"
```



#### **'formatWeight(value, unit, options)'**

格式化重量。

**参数：** 同 `formatLength`，单位来自 `CONFIG.DND5E.weightUnits`

**示例：**

```JavaScript
dnd5e.utils.formatWeight(10, "lb");   // "10 lb."
dnd5e.utils.formatWeight(5, "kg");    // "5 kg"
```



####  **'formatTime(value, unit, options)'**

格式化时间。

**参数：**

- `value` (number)
- `unit` (string) – 单位（"turn", "round", "minute", "hour", "day" 等）
- `options` (object) – 额外选项，如 `maximumFractionDigits`, `unitDisplay` ("long", "short", "narrow")

**示例：**

```JavaScript
dnd5e.utils.formatTime(1, "hour");                     // "1 hour"
dnd5e.utils.formatTime(2, "minute", { unitDisplay: "short" }); // "2 min"
```



####  **'formatRange(min, max, options)'**

格式化数字范围。

**参数：**

- `min`, `max` (number)
- `options` – `Intl.NumberFormat` 选项

**返回值：** string

**示例：**

```JavaScript
dnd5e.utils.formatRange(1, 5); // "1–5"
```



####  **'formatText(value)'**

将文本中的换行符转换为 `<br>`。

**参数：** 'value' (string)

**返回值：** 'Handlebars.SafeString'



### **2.2 公式与数据替换**

####  **'replaceFormulaData(formula, data, options)'**

替换公式中的 `@key` 占位符为实际数据值。

**参数：**

- `formula` (string) – 原始公式
- `data` (object) – 包含键值对的数据对象
- `options` (object) – 可选

  - `actor` (Actor5e) – 用于警告的 Actor
  - `item` (Item5e) – 用于警告的 Item
  - `missing` (string|null) – 缺失引用时的替换值（默认 "0"）
  - `property` (string) – 属性名称（用于警告消息）

**返回值：** string – 替换后的公式

**示例：**

```JavaScript
const formula = "1d20 + @abilities.str.mod + @prof";
const data = actor.getRollData();
const result = dnd5e.utils.replaceFormulaData(formula, data);
// "1d20 + 3 + 2"
```



####  **'simplifyBonus(bonus, data)'**

将加值公式简化为整数（如果公式是确定性的）。

**参数：**

- `bonus` (string|number|null) – 奖励公式或数值
- `data` (object) – 用于替换的数据（可选）

**返回值：** number – 简化后的数值，若非确定性则返回 0

**示例：**

```JavaScript
dnd5e.utils.simplifyBonus("@prof + 2", { prof: 3 }); // 5
dnd5e.utils.simplifyBonus("1d4");                    // 0 (非确定性)
```



####  **'parseDelta(raw, target)'**

解析增量字符串（如 "+5", "-2", "=10"）并应用到目标值。

**参数：**

- `raw` (string) – 增量表达式
- `target` (number) – 当前值

**返回值：** number – 新值

**示例：**

```JavaScript
dnd5e.utils.parseDelta("+3", 10);  // 13
dnd5e.utils.parseDelta("-2", 10);  // 8
dnd5e.utils.parseDelta("=15", 10); // 15
```



####  **'parseInputDelta(input, target)'**

从 HTML 输入元素读取增量并更新目标文档。

**参数：**

- `input` (HTMLInputElement) – 输入元素，应包含 `data-name` 或 `name` 属性
- `target` (Document) – 目标文档（Actor 或 Item）

**返回值：** number|void – 新值，若无变化则返回 undefined

**副作用：** 直接更新 `input.value` 和目标文档的属性（通过 `target.update` 调用）



### **2.3 ID 与标识符**

####  **'staticID(id)'**

生成或补齐 16 位固定 ID，用于系统内部标识（如内置效果 ID）。

**参数：** 'id' (string)

**返回值：** string – 长度为 16 的字符串

**示例：**

```JavaScript
dnd5e.utils.staticID("dnd5eactivity"); // "dnd5eactivity000"
dnd5e.utils.staticID("dnd5eexhaustion"); // "dnd5eexhaustion0"
```



####  **'formatIdentifier(input)'**

将字符串转换为有效的标识符（slugify，替换 `\|/` 为 `-`）。

**参数：** 'input' (string)

**返回值：** string

**示例：**

```JavaScript
dnd5e.utils.formatIdentifier("Arcane Recovery"); // "arcane-recovery"
dnd5e.utils.formatIdentifier("Fighter|Class");   // "fighter-class"
```



####  **'isValidIdentifier(identifier, options)'**

检查字符串是否为有效的标识符（仅字母数字、下划线、连字符）。

**参数：**

- `identifier` (string)
- `options.allowType` (boolean) – 是否允许冒号前缀（如 "class:fighter"）

**返回值：** boolean



### **2.4 链接与文档**

####  **'linkForUuid(uuid, options)'**

根据 UUID 生成 HTML 内容链接（`<a class="content-link">`）。

**参数：**

- `uuid` (string) – 文档 UUID
- `options.tooltip` (string) – 悬浮提示文本
- `options.renderBroken` (boolean) – 若文档不存在，是否渲染为破损链接（否则返回空字符串）

**返回值：** string – HTML 字符串

**示例：**

```JavaScript
const link = dnd5e.utils.linkForUuid(actor.uuid);
// '<a class="content-link" data-uuid="..." draggable="true"><i class="fas fa-user"></i> Bob</a>'
```



####  **'getTargetDescriptors()'**

获取当前用户所有目标Token的摘要信息。

**返回值：** 'TargetDescriptor5e[]' – 每个对象包含 '{ name, img, uuid, ac }'



####  **'getSceneTargets(actor)'**

获取场景中选中的Token，若未选中则返回角色拥有的Token。

**参数：** 'actor' (Actor5e) – 可选，限制仅返回该 Actor 的Token

**返回值：** 'Token5e[]'



### **2.5 本地化与配置**

####  **'preLocalize(configKeyPath, options)'**

标记某个配置项需要在 `init` 阶段进行预本地化。

**参数：**

- `configKeyPath` (string) – `CONFIG.DND5E` 中的键路径
- `options.key` (string) – 若配置项是对象数组，指定用于本地化的键
- `options.keys` (string[]) – 多个本地化键（第一个用于排序）
- `options.sort` (boolean) – 是否排序

**内部使用**，通常在系统初始化时调用。



####  **'performPreLocalization(config)'**

执行预本地化，翻译并排序之前标记的配置项。

**参数：** 'config' (object) – 通常是 'CONFIG.DND5E'

**副作用：** 直接修改传入的配置对象。



### **2.6 其他实用函数**

####  **'generateIcon(icon, options)'**

根据图标字符串生成 HTML 元素（支持 FontAwesome 类或图片路径）。

**参数：**

- `icon` (string) – 如 `"fa-solid fa-dice-d20"` 或 `"icons/svg/upgrade.svg"`
- `options.alt` (string) – 替代文本
- `options.classes` (string) – 额外 CSS 类

**返回值：** 'HTMLElement|null' – '<i>' 或 '<img>' 或 '<dnd5e-icon>'

**示例：**

```JavaScript
const icon = dnd5e.utils.generateIcon("fa-solid fa-dice-d20", { classes: "rollable" });
element.appendChild(icon);
```



####  **'log(message, options)'**

带样式和控制台分组功能的日志输出。

**参数：**

- `message` (string)
- `options.color` (string) – 颜色（默认 "#6e0000"）
- `options.extras` (any[]) – 附加参数传递给 `console.log`
- `options.level` (string) – `"log"`, `"warn"`, `"error"`, `"groupCollapsed"` 等

**示例：**

```JavaScript
dnd5e.utils.log("Initializing module", { level: "groupCollapsed" });
// 在控制台显示 "[D&D 5e] Initializing module" 并开始折叠组
```



####  **'splitSemicolons(input)'**

按分号分割字符串，清理空白并过滤空条目。

**参数：** 'input' (string)

**返回值：** 'string[]'

**示例：**

```JavaScript
dnd5e.utils.splitSemicolons("Common; Draconic;  ;Gnomish"); // ["Common", "Draconic", "Gnomish"]
```



####  **'getPluralRules(options)'**

获取缓存的 `Intl.PluralRules` 实例。

**参数：** 'options.type' (string) – "cardinal"（默认）或 "ordinal"

**返回值：** 'Intl.PluralRules'



####  **'filteredKeys(obj, filter)'**

返回对象中满足过滤条件的键数组。

**参数：**

- `obj` (object)
- `filter` (Function) – 接收值，返回 boolean。若未提供则检查真值。

**返回值：** 'string[]'



####  **'sortObjectEntries(obj, sortKey)'**

按值或内部键对对象进行排序，返回新对象。

**参数：**

- `obj` (object)
- `sortKey` (string|Function) – 排序依据的键或比较函数

**返回值：** object



## **3. 文档类（'dnd5e.documents'）**

系统扩展了 Foundry 核心 Document 类，添加了大量方法和属性。

### **3.1 Actor5e**

#### **静态方法**

#####  **'Actor5e.fetchExisting(uuid, options)'**

从世界或 Compendium 中获取一个 Actor 实例。如果 Actor 在 Compendium 中且尚未导入世界，则会自动导入一个副本（标记为自动导入）。如果 Actor 已存在于世界，则直接返回。

**参数：**

- `uuid` (string) – Actor 的 UUID
- `options.origin` (object) – 可选，检查 Actor 是否具有特定来源（如 `{ key: "flags.dnd5e.summon.origin", value: "..." }`）

**返回值：** 'Promise<Actor5e>'

**示例：**

```JavaScript
const dragon = await Actor5e.fetchExisting("Compendium.dnd5e.actors24.Actor.abc123");
```



#####  **'Actor5e.formatCreatureType(typeData)'**

将生物类型数据对象格式化为可读字符串。

**参数：** 'typeData' (object) – 包含 'value', 'subtype', 'swarm', 'custom' 等字段

**返回值：** string

**示例：**

```JavaScript
const typeData = { value: "dragon", subtype: "red", swarm: "" };
Actor5e.formatCreatureType(typeData); // "Dragon (red)"
```



#### **实例属性**

| 属性 | 类型 | 说明 |
|-|-|-|
| `actor.classes` | `Record<string, Item5e>` | 角色拥有的职业（按 identifier 索引） |
| `actor.spellcastingClasses` | `Record<string, Item5e>` | 具有施法能力的职业 |
| `actor.subclasses` | `Record<string, Item5e>` | 子职业 |
| `actor.concentration` | `{ items: Set<Item5e>, effects: Set<ActiveEffect5e> }` | 当前专注的物品和效果 |
| `actor.isPolymorphed` | `boolean` | 是否处于变形状态 |
| `actor.armor` | `Item5e` | null |
| `actor.shield` | `Item5e` | null |
| `actor.summonedCreatures` | `Actor5e[]` | 由此 Actor 召唤的生物 |
| `actor.system` | `对应数据模型` | 角色系统数据（见第 4 节） |



#### **实例方法**

##### **经验值与等级**

######  **'actor.getLevelExp(level)'**

返回升至指定角色等级所需的总经验值（基于 `CONFIG.DND5E.CHARACTER_EXP_LEVELS`）。

**参数**  

- `level` (number) – 目标等级（1–20）

**返回值** (number)

**示例**

```JavaScript
const xpNeeded = actor.getLevelExp(5); // 6500
```



######  **'actor.getCRExp(cr)'**

返回击败指定挑战等级的怪物所获得的经验值。

**参数**  

- `cr` (number|null) – 挑战等级（如 0.125, 0.25, 0.5, 1, 2…）。若为 `null` 则返回 `null`。

**返回值** (number|null)

**示例**

```JavaScript
const xp = actor.getCRExp(3); // 700
```



##### 状态与条件

######  **'actor.hasConditionEffect(key)'**

检查角色是否受到某类状态影响（基于预定义的 `CONFIG.DND5E.conditionEffects` 映射）。

**参数**  

- `key` (string) – 效果键，如 `"noMovement"`, `"halfMovement"`, `"attackDisadvantage"`

**返回值** (boolean)

**示例**

```JavaScript
if (actor.hasConditionEffect("noMovement")) {
    console.log("Cannot move");
}
```



##### 先攻与掷骰

######  **'actor.getInitiativeRoll(options)'**

返回一个未评估的 `D20Roll` 实例，用于先攻检定。

**参数**  

- `options` (object) – 可选，与 `rollInitiative` 相同

**返回值** (D20Roll|null)

**示例**

```JavaScript
const roll = actor.getInitiativeRoll({ advantage: true });
await roll.evaluate();
```



######  **'actor.rollInitiative(options)'**

执行先攻检定并更新战斗中的先攻值。

**参数**  

- `options` (object) – 可选

  - `createCombatants` (boolean) – 是否创建战斗者（默认 true）
  - `initiativeOptions` (object) – 传递给 `getInitiativeRoll` 的选项

**返回值** (Promise<Combat|null>)



##### 专注

######  **'actor.beginConcentrating(activity, effectData)'**

开始对一个活动进行专注，创建专注效果。

**参数**  

- `activity` (Activity) – 触发专注的活动
- `effectData` (object) – 可选，合并到专注效果的数据

**返回值** (Promise<ActiveEffect5e|void>)

**示例**

```JavaScript
const effect = await actor.beginConcentrating(activity);
```



######  **'actor.endConcentrating(target)'**

结束专注。可指定要结束的效果或物品，若不指定则结束所有专注。

**参数**  

- `target` (Item5e|ActiveEffect5e|string) – 可选，专注的物品、效果或其 ID

**返回值** (Promise<ActiveEffect5e[]>)

**示例**

```JavaScript
await actor.endConcentrating(); // 结束所有专注
await actor.endConcentrating(effect); // 结束指定效果
```



######  **'actor.challengeConcentration(options)'**

创建一个聊天消息，提示进行专注检定（通常由 GM 发送给玩家）。

**参数**  

- `options.dc` (number) – 专注 DC（默认 10）
- `options.ability` (string) – 使用的属性（默认 `con`）

**返回值** (Promise<ChatMessage5e|null>)



######  **'actor.getConcentrationDC(damage)'**

根据受到的伤害计算专注检定 DC（通常为 `max(10, floor(damage/2))`）。

**参数**  

- `damage` (number) – 伤害值

**返回值** (number)



##### **战斗与恢复**

######  **'actor.recoverCombatUses(periods, results)'**

恢复战斗相关资源（如传奇动作）。通常由 `Combatant5e.recoverCombatUses` 调用。

**参数**  

- `periods` (string[]) – 恢复周期，如 `["encounter", "turnEnd"]`
- `results` (object) – 更新累积对象，会被修改

**返回值** (Promise<void>)



##### **生命值与伤害**

######  **'applyDamage(damages, options)'**

应用伤害或治疗到 Actor。

**参数：**

- `damages` – 可以是数字（直接伤害值）或 `DamageDescription[]` 数组，每个元素包含：

  - `value` (number) – 伤害/治疗量
  - `type` (string) – 伤害类型（如 "fire"）或 "healing"/"temphp"/"maximum"
  - `properties` (Set<string>) – 物理伤害的附加属性（用于判断物理伤害类型）
- `options` (object) – 可选

  - `multiplier` (number) – 伤害倍率（默认 1）
  - `only` (string) – `"damage"` 或 `"healing"`，限制应用类型
  - `ignore` (object) – 忽略特定抗性/免疫
  - `downgrade` (Set<string>) – 将某些伤害类型的免疫降级为抵抗
  - `invertHealing` (boolean) – 是否反转治疗为伤害（默认 true）
  - `originatingMessage` (ChatMessage5e) – 来源消息（用于记录）

**返回值：** 'Promise<Actor5e>' – 更新后的 Actor

**示例：**

```JavaScript
await actor.applyDamage([{ value: 10, type: "fire" }], { multiplier: 0.5 });
```



######  **'calculateDamage(damages, options)'**

仅计算伤害数值而不实际应用。返回结果与 `applyDamage` 内部计算相同。

**返回值：** 'DamageSummary' 或 'false'（若被钩子取消）



######  **'applyTempHP(amount)'**

设置临时生命值（仅当新值大于当前值时才更新）。

**参数：** 'amount' (number)

**返回值：** 'Promise<Actor5e>'



##### **检定与掷骰**

######  **'rollSkill(config, dialog, message)'**

进行技能检定。

**参数：**

- `config` (object) – 可选

  - `skill` (string) – 技能 ID（如 "acr", "prc"）
  - `ability` (string) – 强制使用某属性（如 "str"）
  - `advantage` (boolean) – 是否优势
  - `disadvantage` (boolean) – 是否劣势
  - `target` (number) – DC
  - `event` (Event) – 原始事件（用于键盘修饰键）
- `dialog` (object) – 对话框配置
- `message` (object) – 消息配置

**返回值：** 'Promise<D20Roll[]|null>'

**示例：**

```JavaScript
await actor.rollSkill({ skill: "prc", advantage: true });
```



######  **'rollToolCheck(config, dialog, message)'**

进行工具检定。`config.tool` 为工具 ID（如 "thief", "alchemist"）。



######  **'rollAbilityCheck(config, dialog, message)'**

进行属性检定。`config.ability` 为属性 ID。



 **'rollSavingThrow(config, dialog, message)'**

进行豁免检定。



######  **'rollDeathSave(config, dialog, message)'**

进行死亡豁免。自动处理成功/失败计数和复苏。



######  **'rollConcentration(config, dialog, message)'**

进行专注检定。



######  **'rollHitDie(config, dialog, message)'**

消耗一个生命骰并恢复生命值。

**参数：** 'config.denomination' (string) – 如 "d8"，若未指定则自动选择可用骰子

**返回值：** 'Promise<BasicRoll[]|null>'



##### **休息**

######  **'initiateRest(config)'**

开始休息（短休或长休）。返回 `RestResult` 包含更新的详细结果。

**参数：**

- `config.type` (string) – `"short"` 或 `"long"`
- `config.dialog` (boolean) – 是否显示对话框（默认 true）
- `config.chat` (boolean) – 是否发送聊天消息（默认 true）
- `config.autoHD` (boolean) – 是否自动消耗生命骰（短休）
- `config.autoHDThreshold` (number) – 自动消耗生命骰的阈值（默认 3）
- `config.newDay` (boolean) – 是否推进到新的一天（长休）
- `config.advanceTime` (boolean) – 是否推进游戏时间
- `config.recoverTemp`, `config.recoverTempMax` – 是否恢复临时生命

**返回值：** 'Promise<RestResult>'

**示例：**

```JavaScript
await actor.initiateRest({ type: "short", autoHD: true });
```



######  **'shortRest(config)'**

等同于 `initiateRest({ type: "short", ...config })`。



######  **'longRest(config)'**

等同于 `initiateRest({ type: "long", ...config })`。



##### **变形**

######  **'actor.getOriginalStats()'**

返回变形前原始角色的豁免和技能数据（用于合并）。

**返回值**  

```JavaScript
{ originalSaves: object|null, originalSkills: object|null }
```



######  **'transformInto(sourceActor, settings, options)'**

将当前 Actor 变形为另一个 Actor。

**参数：**

- `sourceActor` (Actor5e) – 目标形态的 Actor
- `settings` (TransformationSetting) – 变形设置（哪些部分保留、合并等）
- `options.renderSheet` (boolean) – 是否渲染变形后的角色表

**返回值：** 'Promise<Array<Token>>' – 更新的Token数组

**示例：**

```JavaScript
const wolf = game.actors.getName("Wolf");
const settings = new dnd5e.dataModels.settings.TransformationSetting({ keep: new Set(["hp", "skills"]) });
await actor.transformInto(wolf, settings);
```



######  **'revertOriginalForm(options)'**

解除变形，恢复原始形态。

**参数：** 'options.renderSheet' (boolean)

**返回值：** 'Promise<Actor5e|null>' – 原始 Actor 或 null



##### **数据与工具**

######  **'getRollData(options)'**

获取用于公式替换的数据对象。

**参数：** 'options.deterministic' (boolean) – 是否返回确定性数据（如将 '@prof' 替换为数值而非骰子表达式）

**返回值：** 'ActorRollData' – 包含 'abilities', 'skills', 'attributes', 'prof', 'flags' 等

**示例：**

```JavaScript
const data = actor.getRollData();
// data.abilities.str.mod, data.prof.term, data.attributes.spell.dc, ...
```



######  **'getAttributionData(property, options)'**

获取属性归因的 HTML 字符串，用于悬浮提示显示数值来源。

**参数：**

- `property` (string) – 属性路径，如 `"attributes.ac"`
- `options.title` (string) – 标题

**返回值：** 'Promise<string>' – HTML 内容

**内部调用** '\_prepareArmorClassAttribution' 等方法。



###### **dateEncumbrance(options)'**

根据当前负重更新状态效果（如 `encumbered`, `heavilyEncumbered`）。通常由系统自动调用。



######  **'updateBloodied(options)'**

根据当前生命值更新 `bloodied` 状态效果。



######  **'toggleStatusEffect(statusId, options)'**

切换状态效果。扩展了核心方法以处理互斥组（如不同等级的掩护）。

**参数：**

- `statusId` (string) – 效果 ID（如 "blind", "poisoned"）
- `options` – 参见核心方法

**返回值：** 'Promise<ActiveEffect5e|void>'



##### 辅助方法

######  **'actor.\_displayTokenEffect(changes)'**

在Token上显示滚动战斗文字（伤害、治疗等）。内部使用，通常不直接调用。

**参数**  

- `changes` (object) – `{ hp, temp, total }`



#### **生命周期钩子（Actor5e 内部）**

系统在以下时机触发钩子，模块可监听：

| 钩子名称 | 触发时机 |
|-|-|
| `dnd5e.preDamageActor` | 伤害应用前 |
| `dnd5e.damageActor` | 伤害应用后 |
| `dnd5e.preApplyDamage` | 伤害计算前 |
| `dnd5e.applyDamage` | 伤害应用后 |
| `dnd5e.preRollSkill` | 技能检定前 |
| `dnd5e.postRollSkill` | 技能检定后 |
| `dnd5e.preRest` | 休息前 |
| `dnd5e.postRest` | 休息后 |
| `dnd5e.transformActor` | 变形前 |
| `dnd5e.revertOriginalForm` | 解除变形前 |



### **3.2 Item5e**

#### **静态方法**

##### **m5e.createScrollFromSpell(spell, options, config)'**

从法术创建法术卷轴（消耗品）。

**参数：**

- `spell` (Item5e|object) – 法术或法术数据
- `options` (object) – 创建选项（如 `name`）
- `config` (object) – 卷轴配置

  - `explanation` (string) – `"full"`, `"reference"`, `"none"` – 描述中包含的法术内容
  - `level` (number) – 卷轴施法等级（可高于原法术）
  - `values` (object) – `bonus`, `dc` 覆盖值

**返回值：** 'Promise<Item5e|void>'

**示例：**

```JavaScript
const fireball = game.items.getName("Fireball");
const scroll = await Item5e.createScrollFromSpell(fireball, {}, { level: 5 });
await Item.create(scroll, { parent: actor });
```



#####  **'Item5e.createWithContents(items, context)'**

准备用于创建的物品数据，同时处理容器内的物品。

**参数：**

- `items` (Item5e[]) – 要创建的物品
- `context.container` (Item5e) – 目标容器
- `context.keepId` (boolean) – 是否保留原始 ID
- `context.transformAll` (Function) – 对每个物品及其内容调用的转换函数
- `context.transformFirst` (Function) – 仅对顶层物品调用的转换函数

**返回值：** 'Promise<object[]>' – 可用于 'Item.createDocuments' 的数据数组



#### **实例属性**

| 属性 | 类型 | 说明 |
|-|-|-|
| `item.actor` | `Actor5e` | null |
| `item.container` | `Item5e` | Promise<Item5e> |
| `item.system` | `对应数据模型` | 物品系统数据 |
| `item.hasAttack` | `boolean` | 是否包含攻击行动 |
| `item.hasSave` | `boolean` | 是否包含豁免行动 |
| `item.hasLimitedUses` | `boolean` | 是否有限使用次数 |
| `item.isActive` | `boolean` | 是否可激活（有行动） |
| `item.isArmor` | `boolean` | 是否为护甲 |
| `item.isHealing` | `boolean` | 是否包含治疗行动 |
| `item.isMountable` | `boolean` | 是否为可安装部件（如攻城武器） |
| `item.isVersatile` | `boolean` | 是否为 versatile 武器 |
| `item.hasRecharge` | `boolean` | 是否有 recharge 机制 |
| `item.isOnCooldown` | `boolean` | 是否在冷却中（recharge 未就绪） |
| `item.requiresConcentration` | `boolean` | 是否需要专注 |
| `item.class` | `Item5e` | null |
| `item.subclass` | `Item5e` | null |
| `item.scaleValues` | `Record<string, any>` | 来自 ScaleValue 升级项的值 |
| `item.scalingIncrease` | `number` | 扩展值（如法术升环等级） |
| `item.spellcasting` | `SpellcastingDescription` | null |
| `item.advancement` | `AdvancementCollection` | 升级项集合 |



#### **实例方法**

##### **使用与激活**

###### **em.use(config, dialog, message)\`**

使用物品。如果物品有多个行动，会弹出选择对话框（除非按住 Shift 键或指定 `chooseActivity: false`）。

**参数：**

- `config.chooseActivity` (boolean) – 是否强制弹出选择（即使只有一个行动）
- `config.event` (Event) – 原始事件（用于键盘修饰键）
- 其他行动使用配置（见 `Activity.use`）

**返回值：** `Promise<ActivityUsageResults|ChatMessage|void>`

**示例：**

```JavaScript
await item.use({ event: clickEvent });
```



######  **'item.displayCard(message)'**

在聊天中显示物品卡片（不使用行动）。

**参数：** 'message' – 聊天消息配置

**返回值：** 'Promise<ChatMessage5e|object|void>'



##### **行动管理**

###### **'eateActivity(type, data, options)'**

创建新行动。

**参数：**

- `type` (string) – 行动类型（"attack", "cast", "check", "damage", "enchant", "forward", "heal", "save", "summon", "transform", "utility"）
- `data` (object) – 行动数据
- `options.renderSheet` (boolean) – 是否立即打开行动配置表

**返回值：** 'Promise<ActivitySheet|null>'



######  **'updateActivity(id, updates)'**

更新行动。

**参数：**

- `id` (string) – 行动 ID
- `updates` (object) – 更新数据

**返回值：** 'Promise<Item5e>'



######  **'deleteActivity(id)'**

删除行动。

**参数：** 'id' (string)

**返回值：** 'Promise<Item5e>'



##### **升级项管理**

###### **'eateAdvancement(type, data, options)'**

创建升级项。

**参数：**

- `type` (string) – 升级项类型（"AbilityScoreImprovement", "HitPoints", "ItemChoice", "ItemGrant", "ScaleValue", "Size", "Subclass", "Trait"）
- `data` (object) – 升级项数据
- `options.renderSheet` (boolean) – 是否打开配置表
- `options.source` (boolean) – 是否仅更新源数据（不提交数据库）

**返回值：** 'Promise<AdvancementConfig|Item5e>'



######  **'updateAdvancement(id, updates, options)'**

更新升级项。



######  **'deleteAdvancement(id, options)'**

删除升级项。



######  **'duplicateAdvancement(id, options)'**

复制升级项（重置值并赋予新 ID）。



##### **其他**

######  **'rollToolCheck(options)'**

若物品为工具，进行工具检定。



######  **'getRollData(options)'**

获取用于公式的数据对象。包含 `item` 属性（物品自身数据）和 `scaling`（扩展值）。



######  **'getChatData(htmlOptions)'**

准备聊天卡片的数据。



######  **'clone(data, options)'**

克隆物品。重写以正确处理嵌入状态。



######  **'deleteDialog(options, operation)'**

显示删除确认对话框，若物品有容器或升级项则显示特殊提示。



### **3.3 ActiveEffect5e**

#### **静态方法**

######  **'ActiveEffect5e.fromStatusEffect(statusId, data, options)'**

从状态配置创建效果（覆盖核心方法以支持描述嵌入）。



#### **实例属性**

| 属性 | 类型 | 说明 |
|-|-|-|
| `effect.isAppliedEnchantment` | `boolean` | 是否是已应用到物品上的附魔效果 |
| `effect.dependentOrigin` | `ActiveEffect5e` | null |
| `effect.isConcealed` | `boolean` | 是否对当前用户隐藏（如血条效果对敌对玩家隐藏） |



#### **实例方法**

######  **'effect.getSource()'**

获取效果来源（Actor 或 Item）。如果效果来自另一个效果（赋予），则返回最终来源。

**返回值：** 'Promise<Actor5e|Item5e|null>'



######  **'effect.createRiderConditions()'**

为此效果创建赋予条件效果（如 `unconscious` 自动添加 `prone`）。

**返回值：** 'Promise<ActiveEffect5e[]>'



######  **'effect.createRiderEnchantments(options)'**

为附魔效果创建赋予行动、效果或物品。

**参数：** 'options' – 包含 'chatMessageOrigin', 'enchantmentProfile', 'activityId' 等



######  **'effect.getDependents()'**

获取依赖于该效果的所有文档（其他效果或物品）。

**返回值：** 'Array<ActiveEffect5e|Item5e>'



###### **'ect.richTooltip(enrichmentOptions)'**

生成效果的工具提示 HTML。

**返回值：** 'Promise<{ content: string, classes: string[] }>'



### **3.4 ChatMessage5e**

#### **实例属性**

| 属性 | 类型 | 说明 |
|-|-|-|
| `message.canApplyDamage` | `boolean` | 是否可应用伤害（用于右键菜单） |
| `message.canSelectTargets` | `boolean` | 是否可选择目标（用于攻击消息） |
| `message.shouldDisplayChallenge` | `boolean` | 是否显示 DC、AC 等挑战信息（基于 GM 设置） |



#### **实例方法**

######  **'message.getAssociatedActor()'**

获取消息关联的 Actor（通过 speaker 解析）。

**返回值：** 'Actor5e|void'



######  **'message.getAssociatedItem()'**

获取消息关联的物品（通过 flags 或嵌入数据）。

**返回值：** 'Item5e|void'



######  **'message.getAssociatedActivity()'**

获取消息关联的行动。

**返回值：** 'Activity|void'



######  **'message.getAssociatedRolls(type)'**

获取由此消息触发（通过 `originatingMessage` 标志）的后续掷骰消息。

**参数：** 'type' (string) – 可选，过滤掷骰类型（"attack", "damage", "save", "skill" 等）

**返回值：** 'ChatMessage5e[]'



######  **'message.getOriginatingMessage()'**

获取创建此消息的原始消息（通过 `originatingMessage` 标志）。

**返回值：** 'ChatMessage5e'



######  **'message.applyChatCardDamage(li, multiplier)'**

将消息中的伤害应用到当前控制的Token（右键菜单调用）。

**参数：**

- `li` (HTMLElement) – 聊天条目元素
- `multiplier` (number) – 伤害倍率（0.5, 1, 2 等）



######  **'message.selectTargets(li, type)'**

根据攻击结果选择命中或未命中的目标（右键菜单调用）。

**参数：**

- `li` (HTMLElement)
- `type` (string) – `"hit"` 或 `"miss"`



#### **静态方法**

######  **'ChatMessage5e.addChatMessageContextOptions(html, options)'**

添加聊天消息的右键菜单选项（伤害应用、目标选择等）。



######  **'ChatMessage5e.toggleModifiers({ releaseAll })'**

切换聊天界面上的修饰键视觉提示（Shift, Ctrl, Alt）。



### **3.5 Combat5e / Combatant5e**

#### **Combat5e**

**实例方法**

- `combat.createGroups()` – 创建战斗分组（用于 UI 分组显示）。返回 `Map<string, { combatants: Combatant5e[], expanded: boolean }>`
- `combat._recoverUses(types)` – 在战斗开始、回合开始/结束时恢复战斗相关资源（传奇动作等）。`types` 对象可包含 `encounter`, `turn`, `turnStart`, `turnEnd`, `initiative` 等键，值为 `true` 或具体的 `Combatant5e`。



#### **Combatant5e**

**实例方法**

- `combatant.createTurnMessage({ deltas, periods, rolls })` – 创建回合开始时的聊天消息，显示资源恢复和可用行动。
- `combatant.getGroupingKey()` – 返回用于分组的键（基于先攻值、阵营、基础 Actor）。若无组则返回 `null`。
- `combatant.recoverCombatUses(periods)` – 恢复战斗相关资源（如传奇动作次数）。
- `combatant.refreshDynamicRing()` – 刷新Token的动态光环（如有）。



### **3.6 TokenDocument5e**

扩展核心 `TokenDocument`，添加系统特定逻辑。

#### **静态方法**

######  **'TokenDocument5e.getConsumedAttributes(data)'**

返回可用于消耗的属性列表（用于物品消耗配置）。

**参数：** 'data' (object) – Actor 数据

**返回值：** 'string[]' – 如 '["abilities.str.value", "attributes.hp.value"]'



######  **'TokenDocument5e.getMovementActionCostFunction(type, token, options)'**

返回特定移动类型（步行、游泳、飞行等）的成本计算函数。

**参数：**

- `type` (string) – 移动类型（"walk", "fly", "swim" 等）
- `token` (TokenDocument5e)
- `options` – 移动选项

**返回值：** 'Function'



#### **实例方法**

- `token.getRingColors()` – 返回强制使用的光环颜色（如死亡时为黑色）。
- `token.getRingEffects()` – 返回光环效果数组（如隐身时的虚化效果）。
- `token.flashRing(type)` – 使Token光环闪烁（用于伤害、治疗、临时生命）。
- `token.getBarAttribute(barName, options)` – 扩展资源条属性，支持物品使用次数（路径以 `.` 开头，如 `.Item.abc123`）。



## **4. 数据模型（'dnd5e.dataModels'）**

系统使用 `DataModel` 定义 Actor 和 Item 的结构。所有数据模型位于 `CONFIG.Actor.dataModels` 和 `CONFIG.Item.dataModels` 中。



### **4.1 Actor 数据模型**

| 模型 | 类型 | 说明 |
|-|-|-|
| `CharacterData` | `character` | 玩家角色 |
| `NPCData` | `npc` | 非玩家角色 |
| `VehicleData` | `vehicle` | 载具 |
| `GroupData` | `group` | 队伍 |
| `EncounterData` | `encounter` | 遭遇（一组 NPC） |



#### **通用字段（所有 Actor 共有）**

- `system.abilities` – 属性对象（str, dex, con, int, wis, cha 等）
- `system.skills` – 技能对象（acr, ani, arc 等）
- `system.tools` – 工具熟练度
- `system.traits` – 特性（大小、语言、抗性、免疫等）
- `system.currency` – 货币
- `system.bonuses` – 全局加值（攻击、伤害、豁免等）



#### **角色特有字段**

- `system.details.level` – 等级
- `system.details.xp` – 经验值
- `system.attributes.inspiration` – 激励
- `system.attributes.death` – 死亡豁免进度
- `system.resources` – 资源（primary, secondary, tertiary）
- `system.favorites` – 收藏夹（行动、物品、技能等）



#### **NPC 特有字段**

- `system.details.cr` – 挑战等级
- `system.attributes.hd` – 生命骰
- `system.resources.legact` – 传奇行动次数
- `system.resources.legres` – 传奇抗性次数
- `system.details.habitat` – 栖息地
- `system.details.treasure` – 宝藏类型



#### **载具特有字段**

- `system.attributes.actions` – 行动点数
- `system.crew` – 船员
- `system.passengers` – 乘客
- `system.draft` – 牵引动物
- `system.travel` – 旅行速度



### **4.2 Item 数据模型**

| 模型 | 类型 | 说明 |
|-|-|-|
| `ClassData` | `class` | 职业 |
| `SubclassData` | `subclass` | 子职业 |
| `RaceData` | `race` | 种族 |
| `BackgroundData` | `background` | 背景 |
| `FeatData` | `feat` | 专长/特性 |
| `SpellData` | `spell` | 法术 |
| `WeaponData` | `weapon` | 武器 |
| `EquipmentData` | `equipment` | 装备（护甲、奇物等） |
| `ToolData` | `tool` | 工具 |
| `ConsumableData` | `consumable` | 消耗品（药水、弹药、卷轴） |
| `ContainerData` | `container` | 容器 |
| `LootData` | `loot` | 战利品 |
| `FacilityData` | `facility` | 堡垒设施 |



#### **通用字段（所有 Item 共有）**

- `system.description` – 描述（value, chat）
- `system.source` – 来源（书、页码、规则版本）
- `system.activities` – 行动集合
- `system.uses` – 使用次数（max, spent, recovery）



#### **武器特有字段**

- `system.damage.base` – 基础伤害（DamageData 对象）
- `system.damage.versatile` – 多用伤害
- `system.properties` – 属性（"fin", "hvy", "lgt", "two" 等）
- `system.mastery` – 武器熟稔类型
- `system.range` – 射程（value, long, reach, units）



#### **法术特有字段**

- `system.level` – 法术等级
- `system.school` – 学派
- `system.method` – 施法方式（"spell", "pact", "innate", "ritual"）
- `system.prepared` – 准备状态（0=未准备, 1=已准备, 2=总是准备）
- `system.materials` – 材料成分



#### **装备特有字段**

- `system.armor` – 护甲值（value, dex 上限等）
- `system.equipped` – 是否装备
- `system.attunement` – 同调要求（"required", "optional"）
- `system.attuned` – 是否已同调



### **4.3 共享字段与测量版**

 **'DamageData'**

表示一个伤害/治疗部分。

| 字段 | 类型 | 说明 |
|-|-|-|
| `number` | number | 骰子数量 |
| `denomination` | number | 骰子面数（4, 6, 8, 10, 12, 20, 100） |
| `bonus` | string | 固定加值公式 |
| `types` | Set<string> | 伤害类型（"fire", "slashing" 等）或 "healing" |
| `custom.enabled` | boolean | 是否使用自定义公式 |
| `custom.formula` | string | 自定义公式 |
| `scaling.mode` | string | 扩展模式（"whole", "half", ""） |
| `scaling.number` | number | 每级增加的骰子数量 |
| `scaling.formula` | string | 扩展公式（额外加值） |



 **\`UsesField\`**

表示使用次数和恢复配置。

| 字段 | 类型 | 说明 |
|-|-|-|
| `max` | string | 最大次数公式 |
| `spent` | number | 已使用次数 |
| `recovery` | array | 恢复配置数组，每个包含 `period`（"lr","sr","day","dawn","dusk","recharge"等）、`type`（"recoverAll","loseAll","formula"）、`formula` |



**### \`ActivationField\`**

表示激活类型（动作、附赠动作、反应等）。

| 字段 | 类型 | 说明 |
|-|-|-|
| `type` | string | "action","bonus","reaction","minute","hour","day","legendary","mythic","lair","crew" |
| `value` | number | 数量（如动作次数） |
| `condition` | string | 触发条件（如反应） |



**#### \`DurationField\`**

表示持续时间。

| 字段 | 类型 | 说明 |
|-|-|-|
| `value` | string | 数值公式 |
| `units` | string | "turn","round","minute","hour","day","month","year","inst","perm","disp" 等 |
| `concentration` | boolean | 是否需要专注 |



**#### \`TargetField\`**

表示目标和区域。

| 字段 | 类型 | 说明 |
|-|-|-|
| `template.type` | string | "cone","cube","cylinder","line","radius","sphere","square","wall" |
| `template.size` | string | 尺寸公式 |
| `template.count` | string | 数量公式 |
| `affects.type` | string | 个体目标类型（"creature","ally","enemy","self" 等） |
| `affects.count` | string | 目标数量公式 |



**#### \`SourceField\`**

表示来源信息。

| 字段 | 类型 | 说明 |
|-|-|-|
| `book` | string | 来源书缩写 |
| `page` | string | 页码 |
| `custom` | string | 自定义来源 |
| `rules` | string | 规则版本（"2014" 或 "2024"） |
| `label` | string | 计算后的显示标签 |



## **5. 应用界面（\`dnd5e.applications\`）**

所有应用类均继承自 `Application5e` 或 `DocumentSheet5e`，支持 V2 应用 API。



### **5.1 角色表**

**#### \`CharacterActorSheet\`**

玩家角色表。

**默认选项：**

- `width: 800`, `height: 1000`
- 标签页：details, inventory, features, spells, effects, biography, bastion, specialTraits

**方法：**

- `_prepareAbilities(context)` – 准备属性数据
- `_prepareSkillsTools(context, property)` – 准备技能或工具
- `_prepareSpellbook(context)` – 准备法术书（法术位、法术列表）
- `_prepareTraits(context)` – 准备特性（抗性、免疫、语言等）
- `_prepareFavorites()` – 准备收藏夹

**#### \`NPCActorSheet\`**

NPC 表。

**默认选项：**

- `width: 700`, `height: 700`
- 标签页：features, inventory, spells, effects, biography, specialTraits



**#### \`VehicleActorSheet\`**

载具表。

**标签页：** inventory, crew, effects, description



**#### \`GroupActorSheet\`**

队伍表。

**标签页：** members, inventory, biography

**特殊功能：** 可切换库存来源（队伍共享库存或主要载具库存）。



**#### \`EncounterActorSheet\`**

遭遇表（一组 NPC）。

**标签页：** members, inventory, description

**特殊功能：** 计算遭遇难度，可批量掷骰决定数量。



### **5.2 物品表**

**#### \`ItemSheet5e\`**

通用物品表。

**默认选项：**

- `width: 500`
- 标签页：description, details, activities, effects, advancement（根据物品类型动态显示）

**方法：**

- `_getAdvancement()` – 准备升级项数据
- `_prepareActivitiesContext()` – 准备行动列表
- `_prepareEffectsContext()` – 准备效果列表



**#### \`ContainerSheet\`**

容器物品表，增加“内容”标签页显示内部物品。



### **5.3 配置对话框**

所有配置对话框位于 `dnd5e.applications.actor` 命名空间下，通常通过角色表上的齿轮图标或右键菜单打开。

| 类 | 用途 | 典型调用 |
|-|-|-|
| `AbilityConfig` | 配置单个属性的熟练度、加值 | `new AbilityConfig({ document: actor, key: "str" }).render(true)` |
| `SkillsConfig` | 批量配置技能熟练度 | `new SkillsConfig({ document: actor }).render(true)` |
| `ToolsConfig` | 批量配置工具熟练度 | `new ToolsConfig({ document: actor }).render(true)` |
| `WeaponsConfig` | 配置武器熟练度和熟稔 | `new WeaponsConfig({ document: actor }).render(true)` |
| `TraitsConfig` | 配置抗性、免疫等 | `new TraitsConfig({ document: actor, trait: "di" }).render(true)` |
| `LanguagesConfig` | 配置语言 | `new LanguagesConfig({ document: actor }).render(true)` |
| `ArmorClassConfig` | 配置 AC 计算方式 | `new ArmorClassConfig({ document: actor }).render(true)` |
| `HitPointsConfig` | 配置生命值（NPC 公式、加值） | `new HitPointsConfig({ document: actor }).render(true)` |
| `HitDiceConfig` | 调整生命骰剩余数量 | `new HitDiceConfig({ document: actor }).render(true)` |
| `SpellSlotsConfig` | 覆盖法术位数量 | `new SpellSlotsConfig({ document: actor }).render(true)` |
| `MovementSensesConfig` | 配置移动速度和感官 | `new MovementSensesConfig({ document: actor, type: "movement" }).render(true)` |
| `CreatureTypeConfig` | 配置生物类型 | `new CreatureTypeConfig({ document: actor }).render(true)` |
| `SourceConfig` | 配置来源信息 | `new SourceConfig({ document: actor, keyPath: "system.source" }).render(true)` |
| `TransformDialog` | 变形配置对话框 | `TransformDialog.promptSettings(actor, sourceActor)` |



### **5.4 通用对话框与工具**

**#### \`CompendiumBrowser\`**

浏览 Compendium 内容并支持筛选。

**静态方法：**

- `CompendiumBrowser.select(options, renderOptions)` – 打开浏览器并等待用户选择，返回 `Promise<Set<string>|null>`（选中的 UUID 集合）
- `CompendiumBrowser.selectOne(options, renderOptions)` – 选择单个条目，返回 `Promise<string|null>`

**示例：**

```JavaScript
const uuid = await dnd5e.applications.CompendiumBrowser.selectOne({
  filters: { locked: { types: new Set(["feat"]) } }
});
```



**#### \`CurrencyManager\`**

管理货币兑换和转移。

**用法：**

```JavaScript
new CurrencyManager({ document: actor }).render(true);
```



**#### \`Award\`**

发放 XP 和货币（GM 工具）。

**静态方法：**

- `Award.awardCurrency(amounts, destinations, config)` – 发放货币
- `Award.awardXP(amount, destinations, config)` – 发放 XP
- `Award.handleAward(message)` – 解析聊天中的 `/award` 命令

**示例：**

```JavaScript
const award = new Award({ award: { xp: 100, currency: { gp: 50 } }, origin: partyActor });
award.render(true);
```



**#### \`PropertyAttribution\`**

显示属性归因的悬浮提示。

**用法：**

```JavaScript
const attribution = new PropertyAttribution(actor, sources, "attributes.ac", { title: "Armor Class" });
const html = await attribution.renderTooltip();
```



## **6. 骰子系统（\`dnd5e.dice\`）**

### **6.1 基础类**

**#### \`BasicRoll\`**

扩展核心 `Roll`，增加构建流程和消息创建。

**静态方法：**

- `BasicRoll.build(config, dialog, message)` – 完整流程（配置 → 掷骰 → 发消息）
- `BasicRoll.buildConfigure(config, dialog, message)` – 仅配置阶段（若需要用户输入则弹出对话框）
- `BasicRoll.buildEvaluate(rolls, config, message)` – 评估掷骰结果
- `BasicRoll.buildPost(rolls, config, message)` – 创建聊天消息
- `BasicRoll.fromConfig(config, process)` – 从配置对象创建掷骰实例
- `BasicRoll.constructParts(parts, data)` – 根据键值对构建公式部分和数据对象

**实例方法：**

- `roll.invert()` – 返回一个新的掷骰，其公式符号取反（用于治疗转伤害等）
- `roll.simplify()` – 将骰子项中的复杂数字（如嵌套掷骰）简化为数值
- `roll.preCalculateDiceTerms(options)` – 根据最大化/最小化选项预计算骰子项

**属性：**

- `roll.isSuccess` / `roll.isFailure` – 如果设置了 `options.target`，则判断是否成功/失败



**#### \`D20Roll\`**

扩展 `BasicRoll`，专用于 d20 检定。

**静态属性：**

- `D20Roll.ADV_MODE` – `{ NORMAL: 0, ADVANTAGE: 1, DISADVANTAGE: -1 }`

**实例方法：**

- `roll.configureModifiers()` – 应用优势/劣势、可靠天赋、半身人幸运等修饰符
- `roll.applyKeybindings(config, dialog, message)` – 根据键盘修饰键自动设置优势/劣势

**属性：**

- `roll.hasAdvantage` / `roll.hasDisadvantage`
- `roll.isCritical` / `roll.isFumble`



**#### \`DamageRoll\`**

扩展 `BasicRoll`，专用于伤害/治疗。

**实例方法：**

- `roll.configureDamage({ critical })` – 应用重击倍数、强效重击等
- `roll.preprocessFormula()` – 预处理公式，将 `d6` 转换为 `1d6` 以便重击翻倍



### **6.2 骰子面（Die）**

**#### \`BasicDie\`**

扩展核心 `Die`，支持 `adv`/`dis` 修饰符（优势/劣势掷多个骰子并取最好/最差）。



**#### \`D20Die\`**

扩展 `BasicDie`，固定为 20 面，增加 `isCriticalSuccess` 和 `isCriticalFailure` 属性。



### **6.3 辅助函数**

**#### \`aggregateDamageRolls(rolls, options)\`**

将多个伤害骰按类型和属性合并。

**参数：**

- `rolls` (DamageRoll[])
- `options.respectProperties` (boolean) – 是否区分物理伤害属性（如魔法、银质）

**返回值：** \`DamageRoll[]\` – 合并后的骰子



**#### \`simplifyRollFormula(formula, options)\`**

简化骰子公式，合并常数项，移除非确定性项（可选）。

**参数：**

- `formula` (string)
- `options.preserveFlavor` (boolean) – 保留 flavor 文本
- `options.deterministic` (boolean) – 仅保留确定性部分

**返回值：** \`string\`



## **7. 文本增强器（\`dnd5e.enrichers\`）**

系统注册了自定义的 `[[/command ...]]` 语法，可在聊天框、Journal 条目、物品描述等支持富文本的地方使用。

### **7.1 可用命令**

| 命令 | 示例 | 说明 |
|-|-|-|
| `[[/attack ...]]` | `[[/attack +5]]` | 攻击掷骰 |
| `[[/check ...]]` | `[[/check skill=acr dc=15]]` | 属性/技能/工具检定 |
| `[[/save ...]]` | `[[/save ability=dex dc=18]]` | 豁免检定 |
| `[[/damage ...]]` | `[[/damage 2d6 fire]]` | 伤害掷骰 |
| `[[/heal ...]]` | `[[/heal 2d8]]` | 治疗掷骰 |
| `[[/item ...]]` | `[[/item "Healing Potion"]]` | 使用物品 |
| `[[/award ...]]` | `[[/award 100 xp party]]` | 发放奖励（仅 GM） |
| `[[/lookup ...]]` | `[[/lookup @attributes.hp.value]]` | 查询属性值 |
| `[[/reference ...]]` | `[[/reference condition=unconscious]]` | 引用规则条目 |



### **7.2 主要函数**

**#### \`enrichString(match, options)\`**

将匹配的增强命令转换为 HTML 元素。

**参数：**

- `match` (RegExpMatchArray) – 正则匹配结果
- `options.relativeTo` (Document) – 相对文档（用于解析相对 UUID）
- `options.rollData` (object) – 掷骰数据

**返回值：** \`Promise<HTMLElement|null>\`



**#### \`registerCustomEnrichers()\`**

注册自定义增强器（系统在 `init` 时调用）。



**#### \`activateChatListeners(message, html)\`**

为聊天消息中的增强元素绑定事件（如掷骰按钮、请求按钮）。



### **7.3 辅助函数**

- `parseConfig(match, options)` – 解析命令配置字符串
- `getRulesVersion(config, options)` – 确定使用的规则版本（2014/2024）
- `createRollLabel(config)` – 生成按钮标签文本
- `createRequestLink(label, dataset)` – 创建带请求按钮的链接（GM 可见）



## **8. 注册表（\`dnd5e.registry\`）**

注册表在系统初始化完成后可用，可通过 `dnd5e.registry.ready` 等待。

### **8.1\`registry.classes\` / \`registry.subclasses\`**

存储所有职业/子职业的索引（从 Compendium 中加载）。

**属性：**

- `classes.options` – 用于 `<select>` 的选项数组 `{ value: identifier, label: name }`
- `classes.choices` – 对象 `{ identifier: name }`

**方法：**

- `classes.get(identifier)` – 返回 `{ name, img, identifier, sources }` 或 `undefined`
- `classes.initialize()` – 加载索引（自动调用）



### **8.2\`registry.spellLists\`**

管理法术列表（职业法术、种族法术等）。

**静态方法：**

- `SpellListRegistry.forSpell(uuid)` – 返回包含该法术的所有法术列表（Set<SpellList>）
- `SpellListRegistry.forType(type, identifier)` – 返回特定法术列表实例
- `SpellListRegistry.register(uuid)` – 注册一个法术列表（从 JournalEntryPage 的 UUID）

**属性：**

- `spellLists.options` – 所有法术列表的选项，按类型分组
- `spellLists.ready` – 是否加载完成



### **8.3\`registry.summons\`**

追踪召唤生物与召唤者的关系。

**方法：**

- `summons.creatures(actor)` – 返回该 Actor 召唤的生物列表（Actor5e[]）
- `summons.track(summoner, summoned)` – 记录召唤关系
- `summons.untrack(summoner, summoned)` – 移除记录



### **8.4\`registry.enchantments\`**

追踪附魔效果及其应用的物品。

**方法：**

- `enchantments.applied(uuid)` – 返回由指定行动或物品应用的附魔效果（ActiveEffect5e[]）



### **8.5\`registry.dependents\`**

追踪依赖特定效果的其他文档。

**方法：**

- `dependents.get(effect)` – 返回依赖该效果的所有文档（Document[]）



### **8.6\`registry.messages\`**

追踪通过 `originatingMessage` 标志关联的消息链。

**方法：**

- `messages.get(origin, type)` – 返回从指定消息触发的后续消息（按时间排序）



## **9. 过滤器（\`dnd5e.Filter\`）**

提供一套声明式过滤语法，用于在 Compendium Browser 和其他列表中筛选文档。

### **9.1 操作符**

| 操作符 | 函数 | 说明 |
|-|-|-|
| `AND` | `AND(data, filter)` | 所有子条件满足 |
| `OR` | `OR(data, filter)` | 任一子条件满足 |
| `NOT` | `NOT(data, filter)` | 子条件不满足 |
| `NAND` | `NAND(data, filter)` | 不是所有子条件满足 |
| `NOR` | `NOR(data, filter)` | 没有子条件满足 |
| `XOR` | `XOR(data, filter)` | 奇数个子条件满足 |



### **9.2 比较函数**

| 函数 | 说明 | 示例 |
|-|-|-|
| `exact` | 严格相等 | `{ k: "name", v: "Fireball" }` |
| `contains` | 字符串包含 | `{ k: "name", o: "contains", v: "Fire" }` |
| `icontains` | 忽略大小写包含 |  |
| `startswith` / `istartswith` | 前缀匹配 |  |
| `endswith` | 后缀匹配 |  |
| `gt` / `gte` / `lt` / `lte` | 数值比较 | `{ k: "system.level", o: "gte", v: 3 }` |
| `has` | 集合包含元素 | `{ k: "system.properties", o: "has", v: "mgc" }` |
| `hasany` | 集合包含任一元素 |  |
| `hasall` | 集合包含所有元素 |  |
| `in` | 值在集合中 | `{ k: "type", o: "in", v: ["weapon", "equipment"] }` |



### **9.3 主要函数**

**#### \`performCheck(data, filter)\`**

对单个数据对象执行过滤。

**参数：**

- `data` (object) – 数据对象
- `filter` (FilterDescription|FilterDescription[]) – 过滤条件

**返回值：** boolean



**#### \`uniqueKeys(filter)\`**

返回过滤条件中涉及的所有属性路径（用于索引优化）。

**参数：** \`filter\` (FilterDescription[])

**返回值：** \`Set<string>\`



## **10. 画布扩展（\`dnd5e.canvas\`）**

### **10.1\`Token5e\`**

扩展核心 `Token`，增加移动路径阻挡和困难地形判定。

**实例方法：**

- `token.findMovementPath(waypoints, options)` – 重写移动路径查找，考虑其他Token阻挡
- `token.constrainMovementPath(waypoints, options)` – 重写路径约束，在遇到阻挡时提前停止
- `token._drawHPBar(number, bar, data)` – 自定义 HP 条绘制（支持临时生命、最大生命变化）

**静态方法：**

- `Token5e.onTargetToken(user, token, targeted)` – 当Token被瞄准时触发光环闪烁



### **10.2\`AbilityTemplate\`**

用于交互式放置区域测量版（锥形、圆形、矩形等）。

**静态方法：**

- `AbilityTemplate.fromActivity(activity, options)` – 从行动配置创建测量版对象

**实例方法：**

- `template.drawPreview()` – 开始交互式放置，返回 Promise 在放置完成后解析为创建的 `MeasuredTemplateDocument`



### **10.3\`TokenPlacement\`**

批量放置Token的辅助类，询问用户位置。

**静态方法：**

- `TokenPlacement.place(config)` – 执行放置流程

**参数：**

- `config.origin` (TokenDocument) – 放置原点（用于相对位置）
- `config.tokens` (PrototypeToken[]) – 要放置的Token原型数组

**返回值：** \`Promise<TokenPlacementData[]>\` – 每个放置的Token数据



### **10.4\`MapLocationControlIcon\`**

用于在地图上绘制自定义位置标记（如“A”、“B”）。

**构造函数：**

```JavaScript
new MapLocationControlIcon({ code: "A", size: 40, style: { backgroundColor: 0xFBF8F5, ... } })
```



## **11. 数据迁移（\`dnd5e.migrations\`）**

### **11.1\`migrateWorld(options)\`**

迁移整个世界的数据（Actor, Item, Scene, Compendium）。系统在版本更新时自动调用，模块也可手动调用。

**参数：** \`options.bypassVersionCheck\` (boolean) – 跳过版本检查（强制迁移）



### **11.2\`migrateCompendium(pack, options)\`**

迁移单个 Compendium 包。

**参数：**

- `pack` (CompendiumCollection)
- `options.bypassVersionCheck` (boolean)
- `options.strict` (boolean) – 遇到错误是否停止



### **11.3\`refreshCompendium(pack, options)\`**

刷新 Compendium 包，重新导入所有文档以应用新的数据模型结构。



### **11.4\`refreshAllCompendiums(options)\`**

刷新所有 Compendium 包。



### **11.5 低级迁移函数**

| 函数 | 用途 |
|-|-|
| `migrateActorData(actor, actorData, migrationData, flags)` | 迁移单个 Actor 数据 |
| `migrateItemData(item, itemData, migrationData, flags)` | 迁移单个 Item 数据 |
| `migrateSceneData(scene, migrationData)` | 迁移场景中的Token覆盖数据 |
| `migrateEffects(parent, migrationData, itemUpdateData, flags)` | 迁移嵌入式效果 |
| `migrateCopyActorTransferEffects(actor, effects, options)` | 将转移效果从物品复制到 Actor |



## **12. 钩子事件（Hooks）**

系统在多个环节触发钩子，模块可以监听并修改行为。

### **12.1 Actor 相关**

| 钩子 | 参数 | 说明 |
|-|-|-|
| `dnd5e.preDamageActor` | `actor, amount, updates, options` | 伤害应用前 |
| `dnd5e.damageActor` | `actor, changes, update, userId` | 伤害应用后 |
| `dnd5e.preRollSkill` | `config, dialog, message` | 技能检定前 |
| `dnd5e.rollSkill` | `rolls, data` | 技能检定后 |
| `dnd5e.preRollSavingThrow` | `config, dialog, message` | 豁免检定前 |
| `dnd5e.rollSavingThrow` | `rolls, data` | 豁免检定后 |
| `dnd5e.preRest` | `actor, config` | 休息前 |
| `dnd5e.rest` | `actor, config` | 休息配置完成后 |
| `dnd5e.restCompleted` | `actor, result, config` | 休息完成后 |
| `dnd5e.transformActor` | `host, source, data, settings, options` | 变形前 |
| `dnd5e.applyDamage` | `actor, amount, options` | 伤害应用后（与 `damageActor` 类似） |
| `dnd5e.preApplyDamage` | `actor, amount, updates, options` | 伤害计算后、应用前 |



### **12.2 Item 相关**

| 钩子 | 参数 | 说明 |
|-|-|-|
| `dnd5e.preUseItem` | `item, usage, dialog, message` | 使用物品前 |
| `dnd5e.postUseItem` | `item, usage, results` | 使用物品后 |
| `dnd5e.preDisplayCard` | `item, message` | 显示物品卡片前 |
| `dnd5e.displayCard` | `item, card` | 显示物品卡片后 |
| `dnd5e.getItemContextOptions` | `item, menuItems` | 构建物品右键菜单时 |
| `dnd5e.getItemActivityContext` | `activity, target, menuItems` | 构建行动右键菜单时 |



### **12.3 ActiveEffect 相关**

| 钩子 | 参数 | 说明 |
|-|-|-|
| `dnd5e.preBeginConcentrating` | `actor, item, effectData, activity` | 开始专注前 |
| `dnd5e.beginConcentrating` | `actor, item, effect, activity` | 开始专注后 |
| `dnd5e.preEndConcentration` | `actor, effect` | 结束专注前 |
| `dnd5e.endConcentration` | `actor, effect` | 结束专注后 |
| `dnd5e.preApplyEnchantment` | `item, enchantmentData, options` | 应用附魔前 |
| `dnd5e.applyEnchantment` | `item, enchantment, options` | 应用附魔后 |



### **12.4 掷骰相关**

| 钩子 | 参数 | 说明 |
|-|-|-|
| `dnd5e.preRoll` | `config, dialog, message` | 任何掷骰前（通用） |
| `dnd5e.postRollConfiguration` | `rolls, config, dialog, message` | 掷骰配置完成后 |
| `dnd5e.rollAttack` | `rolls, data` | 攻击掷骰后 |
| `dnd5e.rollDamage` | `rolls, data` | 伤害掷骰后 |
| `dnd5e.rollDeathSave` | `rolls, details` | 死亡豁免后（包含更新数据） |



### **12.5 界面相关**

| 钩子 | 参数 | 说明 |
|-|-|-|
| `dnd5e.renderChatMessage` | `message, html` | 聊天消息渲染后 |
| `dnd5e.renderActorDirectory` | `app, html` | Actor 目录渲染后 |
| `dnd5e.renderCompendiumDirectory` | `app, html` | Compendium 目录渲染后 |
| `dnd5e.renderJournalEntryPageSheet` | `app, html` | 规则页面渲染后（用于添加样式） |
| `dnd5e.renderActiveEffectConfig` | `app, html, context` | 效果配置表渲染后 |



### **12.6 其他**

| 钩子 | 参数 | 说明 |
|-|-|-|
| `dnd5e.preSetupCalendar` | – | 日历初始化前 |
| `dnd5e.initializeItemSource` | `item, source, options` | 初始化 Compendium 中的物品源数据前 |
| `dnd5e.initializeActorSource` | `actor, source, options` | 初始化 Compendium 中的 Actor 源数据前 |
| `dnd5e.compendiumBrowserSelection` | `browser, selected` | Compendium 浏览器提交选择时 |
| `dnd5e.preCreateActivityTemplate` | `activity, templateData` | 创建行动测量版前 |
| `dnd5e.createActivityTemplate` | `activity, templates` | 创建行动测量版后 |
| `dnd5e.filterItem` | `sheet, item, filters` | 过滤物品时（可隐藏物品） |



## **13. 常量配置（\`CONFIG.DND5E\`）**



系统的大部分游戏数据都通过 `CONFIG.DND5E` 对象暴露，可在运行时修改。

### **13.1 核心游戏元素**

| 配置键 | 类型 | 说明 |
|-|-|-|
| `abilities` | `Record<string, { label, abbreviation, type, reference }>` | 属性（str, dex, con, int, wis, cha, hon, san） |
| `skills` | `Record<string, { label, ability, reference }>` | 技能（acr, ani, arc, ath 等） |
| `tools` | `Record<string, { ability, id }>` | 工具（thief, alchemist, herbalism 等） |
| `damageTypes` | `Record<string, { label, icon, isPhysical, color }>` | 伤害类型 |
| `healingTypes` | `Record<string, { label, labelShort, icon, color }>` | 治疗类型 |
| `conditionTypes` | `Record<string, { name, img, reference, levels? }>` | 状态效果 |
| `statusEffects` | `Array<StatusEffectConfig>` | 额外状态效果（扩展核心） |



### **13.2 法术相关**

| 配置键 | 说明 |
|-|-|
| `spellLevels` | 法术等级标签（0–9） |
| `spellSchools` | 法术学派（abj, con, div, enc, evo, ill, nec, trs） |
| `spellcasting` | 施法方式（spell, pact, innate, ritual, atwill） |
| `spellProgression` | 施法进度（full, half, third, artificer） |



### **13.3 物品相关**

| 配置键 | 说明 |
|-|-|
| `weaponTypes` | 武器类型（simpleM, martialM, natural 等） |
| `armorTypes` | 护甲类型（light, medium, heavy, shield） |
| `equipmentTypes` | 装备类型（合并护甲和杂项） |
| `consumableTypes` | 消耗品类型（ammo, potion, scroll, wand 等） |
| `itemProperties` | 物品属性（amm, fin, hvy, lgt, mgc, two, ver 等） |
| `validProperties` | 各物品类型允许的属性集合 |



### **13.4 单位与测量**

| 配置键 | 说明 |
|-|-|
| `movementUnits` | 移动单位（ft, mi, m, km）及其转换系数 |
| `weightUnits` | 重量单位（lb, tn, kg, Mg） |
| `travelUnits` | 旅行速度单位（mph, kph） |
| `timeUnits` | 时间单位（turn, round, minute, hour, day, month, year） |
| `defaultUnits` | 默认单位（根据公制/英制设置） |



### **13.5 计算与规则**

| 配置键 | 说明 |
|-|-|
| `encumbrance` | 负重计算参数（阈值、速度减少、负重倍数） |
| `travelPace` | 旅行速度（slow, normal, fast）的倍率 |
| `restTypes` | 休息类型（short, long）的持续时间、恢复内容 |
| `armorClasses` | AC 计算方式（flat, natural, default, mage, unarmoredMonk 等） |
| `proficiencyLevels` | 熟练度等级标签（0, 0.5, 1, 2） |



### **13.6 界面与艺术**

| 配置键 | 说明 |
|-|-|
| `defaultArtwork` | 各文档类型的默认图标 |
| `tokenHPColors` | HP 条颜色（伤害、治疗、临时生命） |
| `tokenRingColors` | 光环颜色（伤害、死亡、治疗） |
| `calendar` | 日历配置（日历列表、格式化器） |



### **13.7 行动与升级**

| 配置键 | 说明 |
|-|-|
| `activityTypes` | 行动类型（attack, cast, check, damage, enchant 等） |
| `advancementTypes` | 升级项类型（AbilityScoreImprovement, HitPoints, ItemGrant 等） |
| `activityActivationTypes` | 行动激活类型（action, bonus, reaction, legendary 等） |
| `activityConsumptionTypes` | 消耗类型（itemUses, material, hitDice, spellSlots, attribute） |



## **14. 常见任务示例**

### **14.1 获取角色并执行动作**

```JavaScript
const actor = game.user.character;
if (!actor) return;

// 进行一次察觉检定（技能）
await actor.rollSkill({ skill: "prc" });

// 进行一次力量豁免，DC 15
await actor.rollSavingThrow({ ability: "str", target: 15 });

// 消耗一个生命骰
await actor.rollHitDie({ denomination: "d8" });
```



### **14.2 使用物品**

```JavaScript
const item = actor.items.getName("Healing Potion");
if (item) {
  await item.use({ event: clickEvent });
}
```



### **14.3 创建自定义行动**

```JavaScript
const attackActivity = await item.createActivity("attack", {
  name: "Bite",
  attack: { bonus: "+5", type: { value: "melee", classification: "weapon" } },
  damage: { parts: [{ number: 1, denomination: 6, types: ["piercing"] }] }
});
```



### **14.4 打开 Compendium 浏览器并获取选中项**

```JavaScript
const selectedUuids = await dnd5e.applications.CompendiumBrowser.select({
  filters: { locked: { documentClass: "Item", types: new Set(["feat"]) } },
  selection: { min: 1, max: 3 }
});
if (selectedUuids) {
  for (const uuid of selectedUuids) {
    const feat = await fromUuid(uuid);
    // 处理选中的专长
  }
}
```



### **14.5 监听伤害应用**

```JavaScript
Hooks.on("dnd5e.preApplyDamage", (actor, amount, updates, options) => {
  if (amount > 50) {
    ui.notifications.warn(`${actor.name} took massive damage!`);
  }
});
```



### **14.6 修改法术列表**

```JavaScript
// 获取某个法术列表的所有法术
const spellList = dnd5e.registry.spellLists.forType("class", "wizard");
if (spellList) {
  const spells = await spellList.getSpells();
  console.log(spells.map(s => s.name));
}
```



### **14.7 手动掷骰并发送消息**

```JavaScript
const roll = new CONFIG.Dice.D20Roll("1d20 + @abilities.str.mod", actor.getRollData());
await roll.evaluate();
await roll.toMessage({
  flavor: "Strength Check",
  speaker: ChatMessage.getSpeaker({ actor })
});
```



### **14.8 格式化数据用于显示**

```JavaScript
const hp = actor.system.attributes.hp;
const hpString = `${hp.value}/${hp.max} HP`;
const acString = dnd5e.utils.formatNumber(actor.system.attributes.ac.value);
const speedString = dnd5e.utils.formatLength(actor.system.attributes.movement.walk, "ft");
```