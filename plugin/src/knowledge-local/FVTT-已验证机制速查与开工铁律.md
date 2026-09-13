# FVTT 已验证机制速查 + 开工铁律（user世界）

> 本文件 = 过去所有反复折腾换来的结论。每条机制都带用户世界实例出处，可直接 grep 验证。
> 任何 AI（包括我）接 FVTT 房规/宏/物品/世界脚本任务时，**开工第一步先读本文件**。

## 开工铁律（违反任何一条 = 重演简单陷阱式灾难）

1. **先查证再写码**：任何键名/机制，先在用户世界导出 JSON 里 grep 实例。没有实例的键名一律禁用。
2. **金标准优先级**：`01_跑团工具\怪物与物品卡\*.json`（用户世界导出）> `01_跑团工具\网格构筑师\`（gridarchitect_command.js）> `FVTT技术资料\FVTT-data-dict-v9_1.md` + `FVTT-monster-spec-v2_1.md` > 飞书知识库 55 页 md。
3. **写码前贴方案 + 查证依据给用户确认**，用户点头后才动 JSON。
4. **交付前本地验证**：node `new Function` 语法、断言脚本、逻辑自洽。只把「必须进 Foundry 才能验」的最小一步留给用户。
5. 用户明确说过的约束是硬约束（例：「不要世界脚本」就不能碰世界脚本）。
6. 文件双副本（merge\your-dm-toolkit\ 与 merge\stage-*\）必须 Copy-Item 同步，勿 edit 改 stage 副本。

## 已验证机制速查（全部带出处）

### 加伤 / 特效
- **武器加伤**：`system.bonuses.{mwak,rwak,msak,rsak}.damage`，mode **2（ADD）**，value 骰子串如 `"1d4[fire]"`。出处：熔火战旗 Line 762/770、秘法魔剑士 Line 1888。
- **Optional 加值**：`flags.midi-qol.optional.NAME.damage.all`(mode 0) + `.force`(mode 0，条件表达式，真则强制不弹窗) + `.label`。出处：data-dict §30C、46-属性键值.md Line 14。
- **持续伤害**：`flags.midi-qol.OverTime`（大写 O 大写 T）mode 0，value 逗号参数串：`turn=start,damageRoll=1d4,damageType=piercing,saveDC=14,saveAbility=con,saveCount=1-,label="放血"`。`saveCount=1-` 需 midi 13.0.37+（用户 13.0.55 ✓）；`saveRemove` 已弃用。出处：秘法魔剑士 Line 1298、data-dict Line 564。
- **无视护甲**：`flags.midi-qol.ignoreArmor` / `ignoreShield` mode 0 value `"true"` + `flags.dae.specialDuration:["1Attack"]`。
- **重击阈值**：`flags.midi-qol.criticalThreshold` mode 0 value `"19"`。
- **移动减速**：`system.attributes.movement.walk` mode 1（MULTIPLY）value `"0.5"`；加速 mode 2 value `"10"`。
- **mode 表**：0=CUSTOM（交模块）1=MULTIPLY 2=ADD 3=DOWNGRADE 4=UPGRADE 5=OVERRIDE。

### 物品宏
- **物品级标准件**（磁轭手铳金标准，两件套）：`flags.midi-qol.onUseMacroName="[postActiveEffects]ItemMacro"` + `flags.dae.macro{name,type:"script",scope:"global",command}`（itemacro 非必需）。宏体读 `workflow` / `MidiQOL.currentWorkflow` / `wf.hitTargets`。
- **AE 级 onUseMacroName 逗号格式**（"ItemMacro, postAttackRoll"）：资料描述存在，但**在用户 midi 13.0.55 环境实测不触发**——不要依赖。
- **陷阱 Region 触发**：RegionBehavior `{type:"executeScript",system:{source:TRAP_SCRIPT,events:["tokenMoveIn"]}}`，脚本内 `region.getFlag("world","simpleTrapsLayer")`。**RegionBehavior 脚本放置时固化，改代码必须删陷阱重放。**

### midi-qol 13.0.55 环境坑（全部实测）
- **豁免结算只认 `game.user.targets`**，`midiOptions.targetUuids` 被无视。自动结算流程：`game.user.updateTokenTargets([])` 清脏目标 → `updateTokenTargets([tk.id])` 写入 → `await new Promise(r=>setTimeout(r,80))` → `MidiQOL.completeItemUse(...)` → 结算后再清空目标。
- **免弹卡**：`completeItemUse(item, { fastForward: true, midiOptions:{...} }, { configure: false })`。
- **合集包物品无归属角色不能结算** → 复制到 NPC「网格机关·陷阱发动者」（`flags.world.gmlTrapActor:true`），副本打标记 `flags.world.gmlTrapCopy:true` + `flags.world.sourceUuid:<原uuid>`；复用副本时直接 `actDoc.update(...)` 改字段，防旧副本堆积。
- **save.dc 写法**：`act.save.dc.calculation = ""; act.save.dc.formula = "16"`（calculation 留空）。**`"flat"` 不合法**，会被丢回默认 10。出处：网格构筑师 Line 303。
- **ActiveEffect 自定义 flag scope**：MidiActiveEffect.getFlag 只认注册 scope，自定义 scope（如 "hunterway"）一读就抛 `Flag scope "hunterway" is not valid`。**一律直读 `e.flags?.hunterway?.caster`**，绕过 getFlag。

### JSON / 导入
- **Import Data 只认单对象**，不接受数组；每个物品/宏一个 JSON 文件逐个导入。
- **宏 JSON 删掉 `_id` 和 `author`**，让 Foundry 自动生成（否则 `must be a valid 16-character alphanumeric ID` 报错）。
- **activity _id 必须 16 位字母数字**（如 `hntrmarkact00001`）。
- **批量导入宏**：command 内嵌大 JSON 字面量会被模块宏面板报 `Unexpected token ':'` → 改 base64：`const b64='...'; const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)); const items=JSON.parse(new TextDecoder('utf-8').decode(bytes));`。
- 宏 JSON 验证用 node 读文件（PowerShell Get-Content 默认 GBK 会乱码假报错）。

### 图标（用户世界验证）
**存在**：`icons/svg/aura.svg`、`icons/svg/teleport.svg`、`icons/skills/targeting/target-glowing-yellow.webp`、`icons/creatures/mammals/wolf-shadow-black.webp`、`icons/magic/movement/trail-streak-zigzag-teal.webp`、`icons/skills/ranged/bullet-sparks-yellow.webp`、`icons/commodities/claws/claw-spiked-gold.webp`、`icons/magic/perception/eye-ringed-glow-angry-red.webp`、`icons/magic/control/mouth-smile-deception-purple.webp`、`icons/magic/fire/projectile-fireball-smoke-orange.webp`、`icons/magic/nature/root-vine-caduceus-healing.webp`、`icons/creatures/magical/construct-golem-stone-blue.webp`。
**不存在（404）**：`icons/svg/status.svg`、`icons/svg/trap.svg`、`icons/svg/dice-target.svg`、`icons/commodities/claws/claw-hooked-barbed.webp`。

### Foundry v13 / dnd5e 5.3
- V1 Application 框架弃用（element 只读 getter，`this.element=` 赋值必抛错）→ 弹窗一律手搓 jQuery 浮窗。
- `mergeObject` 用 `foundry.utils.mergeObject`。
- 颜色变量用 `--color-surface`（`--surface` 不存在，会透明）。
- advancement 用 `.size` 不用 `.length`；`game.modules` 是 Map，`[...game.modules.values()]` 展开。
- Canvas stage 是 PIXI，事件绑定不支持 `.namespace` 后缀；jQuery 支持 `keydown.simpleTraps`。

### 世界基础设施
- **YGM**（GM 代办）：`globalThis.YGM.request({sceneId,ops})`，socket NS=`module.your-dm-toolkit`，ops 支持 `move`/`addStatuses`/`damage`/`deleteFlag`/`deleteEffectIds`。玩家宏对非自己 token 的特权操作全走它。
- **骰控**：`BasicDie.prototype.mapRandomFace` 挂载点，查 `globalThis.__rngFaceRig[faces]`。
- **世界脚本分块**：runCode 用间接 eval `(0,eval)(code)`（顶层 function/globalThis 跨块可见，const/let 不跨）。

## 已废弃的错误路线（禁止再用）
- `flags.midi-qol.DamageBonus` —— 臆造键，0 实例。
- `flags.dnd5e.DamageBonusMacro` mode 0 内联代码串 —— midi 只认宏名，报 `Could not find macro`。
- AE 级 `flags.midi-qol.onUseMacroName` 触发命中后动作 —— 实测不触发。
- `save.dc.calculation="flat"` —— 不合法。
- 用户世界里 `tome-of-beasts-2` 与 tidy5e-sheet 冲突（升级弹窗 `Cannot read properties of null (reading 'offsetWidth')`），已禁用。
