# otherActivity 勘误 · 移交另一个 AI

> **本文件是自包含的。** 接手方没有生成此文件的那次对话的任何上下文，全部依据都写在本文里。
> 生成时间：2026-09-15 ｜ 涉及包：`@dsh-external/dsh-foundry-vtt`（本地路径 `foundry-mcp/dsh-foundry-vtt`）
>
> **注意**：本文同时覆盖两件不同的事，请先确认你被指派的是哪一件（见 §5 的 A / B 分组）：
> - **A 组** = 把已确认的勘误**落地到剩余的副本与文档**（纯文字追加，低风险）
> - **B 组** = 给工具包**新增「知识库副本自动同步」能力**（改构建脚本，需要判断）

---

## 1. 一句话

在 Foundry VTT 13.351 + dnd5e 5.3.3 + midi-qol 13.0.55 下，**同一个 item 里可以安全放多个「会结算」的活动**（attack + save 并存）——
前提是**每个活动的 `otherActivityId` 显式写成 `"none"`**。

现有知识库 `FVTT-monster-spec-v2_1.md:54` 写的是「禁止在同一个 item 内并列两个会结算的 activity，必须拆成独立 item」。
**这条现象对、归因错**，需要勘误。错误归因会把后来者引向「为了一个物品的两种招式而拆成三件物品」的绕路。

---

## 2. 症状（原始观察）

同一件武器上放 `attack`（挥砍）与 `save`（范围）两个活动，点**一次**攻击：
- 先按命中结算单体伤害 → 目标接着掷豁免 → 豁免失败再叠一份范围伤害 ⇒ **一次点击打出双份伤害**
- 点纯 `utility` 活动时，也会莫名弹出豁免

用户原话（历史记录）：

> 「首先 midi 自动触发了豁免，导致他每次攻击自动骰豁免，没过额外吃炮击伤害，变形也是，点一下变形要过豁免，没过不给我变」

---

## 3. 根因（两层，必须两层都对上）

### 3.1 midi-qol 侧

【源码，外部核查】结论来源：克隆 `tposney/midi-qol` v13（commit `6b10be5`）与 `foundryvtt/dnd5e` release-5.3.3 逐行核查。

- `otherActivityId` **不是 dnd5e 核心字段**，是 midi-qol 注入的，定义在 `src/module/activities/{Attack,Check,Save,Utility}Activity.ts` 活动 schema 顶层。
  dnd5e 核心唯一「活动引用活动」的机制是 Forward 活动（`module/data/activity/forward-data.mjs` 的 `activity.id`），方向同为「引用方 → 被引用方」。
- **绑定方向 = 主 → 子**：写在**主活动**顶层，值 = 被引用子活动的 id（或 identifier）。只有 `attack` / `check` / `save` / `utility` 能当主。
- **默认值（关键）**：`attack` = `""`（**空串 = 自动探测 auto**）；`check` / `save` / `utility` = `"none"`。
- 运行期解析在 `MidiActivityMixin` 的 `get otherActivity()`：`""` → 自动探测（只认**唯一**合格候选）；`"none"` → 无；其余 → 按 id 取，取不到再按 identifier 反查。
- `otherActivityCompatible` 是**资格标记**，位于 `MidiActivityMixin` 的 `midiProperties` schema，`initial: true`（**默认 true**），v13.0.55 的 `MidiActivityMixin.ts:186`。
  它写在**子**活动身上，**只影响编辑期下拉与自动探测**，不是「谁触发谁」的开关。
  ⚠️ **旧知识库把「双份伤害」归因于这个默认 true —— 这就是归因错的地方。**
- 双伤害的产生点：`MidiActivityMixin.rollDamage` 先 `if (this.hasDamage || this.hasHealing)` 掷主活动自身伤害，随后 `if (this.otherActivity)` 走 `rollOtherDamage()` ⇒ 两份都算、两次独立判定。
- 弹窗规则（`MidiActivityChoiceDialog`）：候选筛选 = `canUse !== false && !riders.includes(id) && !midiProperties.automationOnly && !inProgress`；0 个跳过、1 个直接用、**≥2 个必弹**，无任何设置参与。
- midi-qol 13.0.55 **已不存在**「自动合并行动」设置（`autoMergeActivityOther` 自 12.4.31 起从源码移除，只剩 i18n 文案残留）。⇒ 在设置里找它是白费功夫。

### 3.2 工具包侧（真正的 bug）

`foundry-mcp/dsh-foundry-vtt/src/minimal.ts` 里，attack 活动的构造原来写成：

```ts
otherActivityId: hasSave ? SAVE_KEY : '',   // ← 无 save 时落空串 = midi 的 auto 探测
```

⇒ 只要这个 item 上还有**任何类型合格（含 utility）且 `otherActivityCompatible` 为真**的活动，它就会被自动绑到这次攻击上 ⇒ 点一次攻击就连带别人的豁免与伤害。

**这就是症状的确切机制，不是偶发、不是「默认就会被合并」那么简单——是工具写了一个等于 auto 的空串。**

---

## 4. 验证（决定性，已实测）

**实测样本**：世界「特醇佳酿」物品 `Item.FTVO5Z2r5B98Yl0H`「《挽歌》」，同 item 上两个活动：
- `TCegmZU7uyhXC5t1`（attack，挥砍）
- `elegyBurst000001`（save，锥形 15 尺，雷鸣 4d6，敏捷豁免减半）

两者 `otherActivityId` 均显式写 `"none"`。

**用户实机点击结果：5 条全过**
| # | 验证项 | 结果 |
|---|---|---|
| 1 | 点「斩」只结算攻击，不带豁免 | ✅ |
| 2 | 点「裂弦」正常（模板由玩家手动放置，符合预期） | ✅ |
| 3 | 全程不弹「选择活动」对话框 | ✅ |
| 4 | 没有多出 4d6 伤害 | ✅ |
| 5 | 豁免 DC 正确 | ✅ |

⇒ **结论**：`otherActivityId:"none"` 有效；**同 item 多活动可以共存，不必拆物品**。

> 仍未闭合（不要当成已知）：本次只验了 `attack` + `save` 两个活动的组合。历史记录里还有一例「点纯 `utility` 变形活动也要过豁免」**始终没有得到解释**，该物品已随世界换代消失、无法复现。请勿将本条结论外推为「任何组合都安全」。

---

## 5. 待办清单

### A 组 · 勘误落地（纯文字追加，低风险）

#### A0. 已完成 —— **不要重复做**

以下 8 处已由上一轮会话完成并核对：

| # | 文件 | 位置 | 改动 |
|---|---|---|---|
| 1 | `foundry-mcp/dsh-foundry-vtt/src/minimal.ts` | `:1009` | `otherActivityId: hasSave ? SAVE_KEY : ''` → `'none'`，并加 5 行注释说明 |
| 2 | `foundry-mcp/dsh-foundry-vtt/src/minimal.ts` | `:1155` | `linkedTo` 参数描述：原写「让它成为某个活动的后续触发……本活动会被指向它」（读起来像子→主），改为明确的「**主 → 子**」表述 |
| 3 | `foundry-mcp/dsh-foundry-vtt/lib/minimal.js` | `:971` | 镜像 #1（含注释；该包编译后保留源码注释） |
| 4 | `foundry-mcp/dsh-foundry-vtt/lib/minimal.js` | 同文件 `linkedTo` 处 | 镜像 #2 |
| 5 | `01_跑团工具/FVTT技术资料/FVTT-monster-spec-v2_1.md` | `:56-60` | 追加 §6 的勘误正文 |
| 6 | `foundry-mcp/dsh-foundry-vtt/src/knowledge-local/FVTT-monster-spec-v2_1.md` | `:56-60` | 同上 |
| 7 | `foundry-mcp/dsh-foundry-vtt/lib/knowledge-local/FVTT-monster-spec-v2_1.md` | `:56-60` | 同上 |
| 8 | `01_跑团工具/FVTT技术资料/搓怪物做效果做mod任何时候，看到了一定要看仔细看/midi-otherActivity-源码级结论.md` | §12 | 「尚未实测」改为「已实测通过」 |

#### A1. 待办 · `release` 暂存里的 2 份旧副本

这两份仍是**老归因、无勘误**：

- `foundry-mcp/release/dsh-foundry-vtt/plugin/src/knowledge-local/FVTT-monster-spec-v2_1.md`（`第 54 行`）
- `foundry-mcp/release/dsh-foundry-vtt/plugin/lib/knowledge-local/FVTT-monster-spec-v2_1.md`（`第 54 行`）

**改法**：把 §6 的勘误正文**逐字追加**在第 54 行之后（作为独立的引用块段落），**不要删除或改写原有的第 54 行**。
⚠️ 动手前先确认这两份不是「每次发版自动重新生成」的产物——若是，改了会被覆盖，应该改生成源。

#### A2. 待办 · 两处仍示范空串的 JSON 模板

- `foundry-mcp/dsh-foundry-vtt/src/reference.ts:180` → `"otherActivityId": ""`
- `foundry-mcp/dsh-foundry-vtt/src/knowledge-docs/01-结构模板.md:137` → `"otherActivityId": ""`

这两处是**真实导出结构的逐字快照**（同块里还有完整的 `midiProperties`、`save.dc` 等），`""` 在原始导出里本来就是这样。
**因此不要改 JSON 本身**（改了就不再是逐字记录）。改法：**在 JSON 块外的说明文字里加一句警示**，大意：

> ⚠️ 本模板中 `"otherActivityId": ""` 是**自动探测（auto）**的写法——若该 item 上还有其它类型合格且 `otherActivityCompatible` 为真的活动，会被自动绑到本活动上。需要各活动独立时，请显式写 `"none"`。

#### A3. 可选 · verify 段补一项校验

`src/minimal.ts` 的 verify 段（`problems` 收集逻辑）目前不核 `otherActivityId` 是否为 `''`。
建议：当 item 上存在 ≥2 个会结算的活动、且任一活动的 `otherActivityId === ''` 时，推一条 `problems`，提醒可能被 auto 探测串接。

### B 组 · 新增「知识库副本自动同步」能力（需判断）

**问题**：`FVTT-monster-spec-v2_1.md` 在本机有 **5 份副本**，内容必须一致，但目前靠**手工同步**：

1. `01_跑团工具/FVTT技术资料/FVTT-monster-spec-v2_1.md`
2. `foundry-mcp/dsh-foundry-vtt/src/knowledge-local/FVTT-monster-spec-v2_1.md`
3. `foundry-mcp/dsh-foundry-vtt/lib/knowledge-local/FVTT-monster-spec-v2_1.md`
4. `foundry-mcp/release/dsh-foundry-vtt/plugin/src/knowledge-local/FVTT-monster-spec-v2_1.md`
5. `foundry-mcp/release/dsh-foundry-vtt/plugin/lib/knowledge-local/FVTT-monster-spec-v2_1.md`

**根因**：`foundry-mcp/dsh-foundry-vtt/scripts/build.sh` 只做两件事——junction link 依赖 + `"$TSC" -p tsconfig.json`。
**`tsc` 不会拷贝 `.md` 等非 TS 资源**，所以 `src/knowledge-local/*.md` 的改动**永远进不了 `lib/knowledge-local/`**。
今天正是靠手工编辑 `lib` 那份才让改动生效的。

**建议方向**（请自行判断，不必照做）：
- 在 `build.sh` 的编译步骤后加一步 `src/knowledge-local/` → `lib/knowledge-local/` 与 `src/knowledge-docs/` → `lib/knowledge-docs/` 的同步；
- 或在 `package.json` 加 `postbuild` 脚本；
- 或引入单一真源（例如只保留 `01_跑团工具/FVTT技术资料/` 一份，其余在构建时复制），彻底消灭 5 份副本。

⚠️ **动手前必须确认**：`release/` 下的两份到底是「构建产物」还是「发布快照」。若是发布快照由发布流程再生，就不该手工改（见 A1 的警告）。

---

## 6. 勘误正文（逐字，供 §5-A1 直接粘贴）

```markdown
> ⚠️ **勘误（2026-09-15 · 源码级 + 实机验证）**：本条**现象对、归因错**。真正触发连带的是**主活动的 `otherActivityId` 为空串** —— midi-qol 里 `attack` 的该字段默认即 `""` = **自动探测**（`check`/`save`/`utility` 默认 `"none"`）；`otherActivityCompatible` 只是**资格标记**（默认 true），只影响编辑期下拉与自动探测。
> ⇒ **把每个会结算的活动的 `otherActivityId` 显式写成 `"none"`，同一 item 内即可安全共存多个活动，不必拆物品**（显式填 id 时 midi 不复查兼容标记）。
> ✅ **已实测**：《挽歌》（attack + save 同 item）点斩不带豁免、点裂弦不带攻击、不弹「选择活动」、伤害不串、DC 正确。
> 另：13.0.55 已**不存在**「自动合并行动」设置（`autoMergeActivityOther` 自 12.4.31 起从源码移除，只剩 i18n 文案）。
> 详见 `搓怪物做效果做mod任何时候，看到了一定要看仔细看\midi-otherActivity-源码级结论.md`。§0 摘要版同样适用本勘误。
```

---

## 7. 改完怎么验

1. **预览**（不写世界）：调 `foundry_create_item_minimal`，传 `activities` 数组（一个 `attack` + 一个 `save`），
   **不带 `confirmToken`** ⇒ 只返回预览。检查预览里两个活动的 `otherActivityId` 是否均为 `"none"`。
2. **落库后核对**：用 `foundry_diff`，`expected` 传
   `{"system.activities.<活动id>.otherActivityId": "none"}` ⇒ 应 `allMatched: true`。
3. **实战**（唯一能证明机制的一步）：点攻击 → 只出命中、不掷豁免；点豁免活动 → 不掷命中；不弹「选择活动」对话框。

⚠️ 工具返回 `verified:true` **不等于**字段真的按你想的落库（历史上多次出现「回执说成功、实际没写进去」）。
第 2 步的读回是**必须**做的，不要跳。

---

## 8. 环境与工具包事实

- 世界：**特醇佳酿**（worldId `"123"`，clientId `fvtt_84fa6f9c091a5f8d`）；dnd5e **5.3.3** / Foundry **13.351**；midi-qol **13.0.55**
- 包：`foundry-mcp/dsh-foundry-vtt`，`name: @dsh-external/dsh-foundry-vtt`，`version: 1.1.8`，`type: module`，`files: ["lib"]`
  - `"build": "bash scripts/build.sh"`，`"typecheck": "tsc -p tsconfig.json --noEmit"`
- `scripts/build.sh`（70 行）流程：
  1. 探测 `DSH_CHECKOUT`：环境变量 → `$HOME/dsh-harness` / `$HOME/dsh` / `$HOME/.dsh/dsh-harness`（要求该目录含 `packages/`）
  2. `link_pkg` 建 junction：`cordis`→`vendor/cordis`、`cosmokit`→`vendor/cosmokit`、`schemastery`→`vendor/schemastery`、`@deepseek-ai/dsh-tools`→`packages/core/tools`、`@deepseek-ai/dsh-llm`→`packages/llm/llm`、`@deepseek-ai/dsh-system-prompt`→`packages/core/system-prompt`、`@types/node`→`node_modules/@types/node`
  3. `"$TSC" -p tsconfig.json` 编译 `src/` → `lib/`
- ⚠️ **本机当前跑不了构建**（2026-09-15 实测）：
  - `DSH_CHECKOUT` 环境变量未设置（`Get-ChildItem env:DSH*` 只有 `DSH_HOME` / `DSH_SESSION_ID` / `DSH_SESSION_JSONL` / `DSH_SHELL` / `DSH_WEB_URL`）
  - 三个探测路径 `$HOME/dsh-harness`、`$HOME/dsh`、`$HOME/.dsh/dsh-harness` **均不存在**
  - `foundry-mcp/dsh-foundry-vtt/node_modules/` 下 `cordis`、`schemastery`、`@deepseek-ai/dsh-tools` **均不存在**（junction 已被清掉）
  ⇒ 所以 `src` 改动后**必须手工同步 `lib`**，或先把 `DSH_CHECKOUT` 指对再 `bash scripts/build.sh`。
  `src` 是权威：正常构建后 `lib` 会从 `src` 重新生成，手工镜像的内容会被同值覆盖。

---

## 9. 注意事项 / 禁止事项

- **不要**改 §5-A2 里那两处 JSON 快照的 `"otherActivityId": ""` 本身（它们是逐字导出记录），只在旁注说明。
- **不要**删除 `FVTT-monster-spec-v2_1.md:54` 的原文——只追加勘误块。原归因在「默认值前提」下仍然成立，只是不完整。
- `activity._id` 必须**恰好 16 位字母数字**（如 `dnd5eactivity000`）；超长会被拒绝或静默规范化。
- `save` 活动的 `damage` 子 schema 只有 `onSave` / `critical` / `parts`（**无 `includeBase`**）⇒ 它不会误吃武器基础伤害；而 `attack` 活动的 `damage` 有 `includeBase`。
- 本包编译后**保留源码注释**（`lib/minimal.js` 里能看到 `src` 的 `//` 注释），所以镜像注释到 `lib` 是符合预期的，不算「与构建产物不一致」。

---

## 10. 相关文件（供接手方追溯）

- `01_跑团工具/FVTT技术资料/搓怪物做效果做mod任何时候，看到了一定要看仔细看/midi-otherActivity-源码级结论.md` —— 本勘误的完整推理记录（12 节，每条标注【源码】/【交叉】/【未闭合】）
- `01_跑团工具/FVTT技术资料/FVTT-monster-spec-v2_1.md` —— 被勘误的知识库本体（怪物规格硬规则）
- `foundry-mcp/dsh-foundry-vtt/src/reference.ts` —— 内置结构模板（`save-activity` 主题里也讲了「attack 必须设 otherActivityId 指向 save 活动」，方向正确）
- `foundry-mcp/dsh-foundry-vtt/src/knowledge-local/(已瘦身)自动化指北——哪些自动化需要用到什么？.md` —— 中文自动化指北，`:1875` 讲 `automationOnly`、`:1895` 讲 `otherActivityCompatible`
