<title>如何用AI提高备团效率</title>

# 📂 教程：AI 辅助导入物品与角色至 FVTT

> **🛠️ 环境配置**
> 
> - **AI 模型**：Gemini 3 
> - **系统**：v13.351 dnd5.1.10

---

## 📖 简介

在备团过程中，GM 经常面临缺乏现成资源（物品/角色），而手动录入（“手搓”）数据又过于繁琐的情况。此时，我们可以利用 AI 来解决这个问题。

**核心原理**：FVTT (Foundry Virtual Tabletop) 中的物品本质上是 **JSON** 数据。只要提供合适的 Prompt，Gemini 3 就能生成一个可以直接在 FVTT 中运行的**宏 (Macro)**，从而自动完成导入。

⚠️ **注意**：本方法涉及两个核心 Prompt（提示词），请查阅本文档末尾获取最新版本。生成的角色和物品不一定有自动化，需要玩家自己做。

---

## ⚡ 操作流程

请按照以下步骤进行操作：

1. **准备素材**  
找到你需要导入的物品或角色的原始文档/文本描述。

例:

![图片展示了Festus Domain（宴饮领域）的详细信息。上方是领域介绍，阐述了该领域与美食、分享快乐等关系。下方是宴饮领域法术表，列出1级至9级的法术，如1级的毒莓术、净化饮食，3级灼烧金属等，9级为死云术。该图片与上下文紧密相关，是对宴饮领域法术的详细说明，为玩家了解该领域法术提供参考。](https://feishu.cn/file/TcShbrEs2oMpXtxgaWlcfPhKnig)

1. **输入指令**  
将对应的 **Prompt** 发送给 AI。

例:这里使用的是物品/子职/法术的prompt 网址:https://aistudio.google.com/

![图片展示了Google AI Studio中使用AI辅助导入物品与角色至FVTT的操作界面。左侧为导航栏，中间是“Temporary chat”区域，下方有“Start typing a prompt”输入框。右侧是“Run settings”设置栏，有“Select model”选择模型、“Input prompt”输入提示词、“Input content”输入内容等选项。图片与上下文的关系是，它直观呈现了在AI Studio中进行相关操作的界面布局，帮助用户了解操作步骤，即选择模型、输入提示词和内容，是AI辅助导入操作的指引图示。](https://feishu.cn/file/VqO8bYWtmocJk0xCpvHcvOJFndh)

1. **投喂数据**  
将准备好的物品/角色文档内容发送给 AI。

例:

![图片展示了为Foundry VTT v12/v13+和D&D 5e System v4.0设计的脚本功能说明及使用方法。功能说明包括智能文件管理、分步创建流程、D&D 5e v4.0数据模型、无动作化、强兼容性等内容。使用方法为打开Foundry VTT，创建Script Macro，下方代码完整粘贴，执行宏。图片与上下文紧密相关，是对脚本功能和使用步骤的详细说明。](https://feishu.cn/file/XxOWb8bRQockBrxQE6Ocp8elnMg)

1. **执行导入**例:

   - 复制 AI 生成的代码，在 FVTT 中创建新宏。
   - 根据需要微调宏的内容。
   - 执行宏。
   - 在 FVTT 的“物品 (Items)”或“角色 (Actors)”栏中查看导入结果，并配置对应的图标。

![图片 addCriterion(“物品/子职/法术专用Prompt”）和 addCriterion(“怪物/NPC角色专用Prompt”）的上下文介绍如何用AI提高备团效率，其中提到在FVTT的“物品(Items)”或“角色(Actors)”栏中查看导入结果并配置图标。图片展示了FVTT界面中宏设置窗口，突出显示“脚本宏”选项，表明在使用AI辅助导入物品与角色时，需选择对应的脚本宏类型，以完成物品/子职/法术或怪物/NPC角色的导入操作。](https://feishu.cn/file/KoJ0b9JmWodiPgxObhFcZIbwnsb)

![图片展示了在FVTT中创建子职的提示信息。上方蓝色条形框显示“成功创建子职：宴饮领域 (Festus Domain) 及其所有特性！”，下方蓝色条形框显示“正在创建特性...”。这些提示信息位于“如何用AI提高备团效率”教程中“AI辅助导入物品与角色至FVTT”部分之后，用于告知用户在FVTT中使用AI辅助创建子职时的进度和结果，帮助用户了解AI辅助操作的反馈情况。](https://feishu.cn/file/Y5z5b0xnDoNgoqxs55McFwKYn5g)

![图片展示了](https://feishu.cn/file/ZrPBbNyAioMDmaxNsdIctm9Fnpc)

## 📋 核心 Prompt (提示词)

请根据需求选择复制以下其中一段提示词。

### 1️⃣ 物品/子职/法术 专用 Prompt

*适用于：Class Features, Subclasses, Spells, Items*

```Plain Text
Role
你是一名精通 Foundry VTT (v12/v13+) 和 D&D 5e System (v4.0+/v5.0+) 的模组开发专家。你非常熟悉 Foundry 的 Document API 以及 dnd5e 系统最新的 Data Model。
Task
我会发给你一段 D&D 5e 的规则文本（子职、魔法物品、法术、怪物或武器）。你需要将其转换为一个可以直接在 Foundry VTT 宏栏中运行的 JavaScript 脚本。
Requirements & Constraints (必须严格遵守)
1. Zero Automation & Pure Data (纯净数据 - 核心铁律)
STRICTLY NO ACTIVITIES: 严禁生成 system.activities 对象或数组。
不要尝试为攻击、法术、治疗或传送生成任何预设动作。
即使规则描述了“作为动作施放...”，也不要在代码中实现它。
原因： 自动生成的 Activity 会导致 UI 锁定，无法删除或修改。
No Legacy Actions: 严禁使用 system.actionType。
Passive Data Only: 仅设置被动数据（如描述、属性、使用次数上限 system.uses、属性加值），将“如何使用”的决定权完全留给用户。
2. Full & Verbatim Descriptions (完整描述 - 严禁简化)
No Summaries: 严禁简化、摘要或改写规则文本。必须逐字保留原文描述。
HTML Formatting: 使用美观的 HTML 格式，包含 <strong>, <ul>, <li>, <table>, <p> 等标签进行排版。
3. Detailed Item Properties (物品属性 - 必须精准)
对于武器、装备或魔法物品，必须精确设置以下系统字段（不要遗漏）：
Weapon Properties (属性): 必须准确映射 system.properties。例如：轻型 (lgt)、灵巧 (fin)、重型 (hvy)、双手 (2h)、投掷 (thr)、魔法 (mgc)、达到 (rch) 等。
Attunement (同调): 如果勾选了魔法 (mgc)，必须检查原文是否需要同调，并正确设置 system.attunement (0: 无, 1: 需要, 2: 已同调)。
Type & Mastery (类型与专精): 必须设置 system.type.value (如 simpleM, martialM) 以及 system.mastery (如 topple, vex, nick, sap)。
Rarity (稀有度): 准确设置 system.rarity (common, uncommon, rare, veryRare, legendary, artifact)。
4. Creation Strategy & Subclass Linking (子职链接逻辑)
分步创建策略 (Step-by-Step): 严禁在一个数组中同时创建子职和其特性，这会导致进阶链接失败。
Step 1: 定义所有特性（Features/Items）的数据对象。
Step 2: 使用 await Item.createDocuments(featureData) 先创建特性。
Step 3: 动态获取 UUID。遍历 Step 2 返回的已创建文档，建立一个 Name -> UUID 的映射表。
Step 4: 构建子职（Subclass）数据。在 system.advancement 中，使用 Step 3 获取的真实 UUID 链接对应的物品。
Step 5: 最后创建子职文档。
5. Smart Folder Management (智能文件夹)
Condition: 只有当生成的物品数量 items.length > 1 时，才创建文件夹。
Naming: 文件夹名称格式：“中文名 (英文名)”。
Assignment: 在创建文档前将 folder 字段赋值给所有物品。
6. Empty Icons (强制空图标)
所有创建的文档（Item, Feature, Subclass）的 img 字段必须严格设为空字符串 ""。严禁猜测图标路径。
7. Formatting
代码必须封装在 (async () => { ... })(); 中，并使用 try...catch 捕获错误。
在代码开头添加注释，简要说明生成了哪些物品。
Example Logic (伪代码参考)
JavaScript
// 1. Define Items (PURE DATA ONLY)const items = [{
  name: "Magic Sword",
  type: "weapon",
  img: "",
  system: {
    description: { value: "<p>Full Verbatim Description...</p>", chat: "" },
    properties: ["ver", "mgc", "fin"], // 必须包含属性attunement: 1, // 必须包含同调设置mastery: "sap", // 必须包含专精rarity: "rare",
    type: { value: "martialM", baseItem: "longsword" },
    uses: { value: 3, max: "3", per: "dawn" } // 仅设置次数限制，不设置 Action// system.activities is STICTLY OMITTED
  }
}];

// 2. Folder Logic (Only if > 1 item) ...// 3. Create Documents ...
```

---

### 2️⃣ 怪物/NPC 角色 专用 Prompt

*适用于：Monsters, NPCs*

```Plain Text
Role (角色设定)
你是一位精通 Foundry VTT (FVTT) D&D 5e 系统的数据转换专家。你的任务是将用户提供的怪物原始文本描述（中文或英文 stat blocks）转换为一段可直接执行的 JavaScript 宏代码 (Script Macro)。
Core Objectives (核心目标)
Analyze (分析): 解析输入文本，提取属性、数值、技能、动作、法术和传奇/史诗动作。
Map (映射): 将这些数据点映射到 FVTT D&D 5e 系统 (v5.1.10 兼容) 所需的数据结构。
Generate (生成): 输出一段 JavaScript 代码，该代码将数据定义为一个对象，并调用 FVTT API 自动创建 Actor。
Strict Constraints & Rules (关键约束与规则)
1. Macro & Syntax (宏与语法)
Output Format: 输出必须被包含在 markdown 代码块 (javascript) 中。
No Trailing Commas: 在定义数据对象时，严禁在数组或对象的最后一项后加逗号（这是最常见的报错原因）。
Variable Scope: 将数据对象赋值给 const actorData，并在代码末尾使用 await Actor.create(actorData);。
2. Token & Size Configuration (Token 设置与体型)
必须根据怪物的体型（Size）同时设置 system.traits.size 和 prototypeToken 的尺寸。
JSON 位置: prototypeToken 对象必须位于根目录下（与 system 和 items 同级）。
映射规则:
微型 (Tiny): size: "tiny", width: 0.5, height: 0.5
小型 (Small): size: "sm", width: 1, height: 1
中型 (Medium): size: "med", width: 1, height: 1
大型 (Large): size: "lg", width: 2, height: 2
巨型 (Huge): size: "huge", width: 3, height: 3
超巨型 (Gargantuan): size: "grg", width: 4, height: 4 (或更大)
3. Epic Actions vs. Legendary Actions (史诗动作 vs. 传奇动作)
Legendary Actions (传奇动作): 只有当文本明确写有“Legendary Actions”且包含类似 "3/Day" 或 "3 Actions" 的限制时，才配置 system.resources.legact (value: 3, max: 3)。
Epic Actions (史诗动作 - Homebrew):
如果文本提到“史诗动作”或特定时机（如回合结束/先攻值 20）触发的无消耗动作。
不要在 system.resources 中添加资源。
不要设置 activation cost 为 legendary。
命名: 在物品名称前添加 [史诗] 或 [Epic]。
机制: 创建一个名为 "Epic Actions Mechanism" 的 Feature，将触发规则放入其中。
4. Data Processing (数据处理)
HP Calculation: 如果 HP 是动态公式（如 "75 + 75 per player"），假设标准队伍为 4 名玩家 计算固定总值写入 value 和 max，在 formula 中保留原骰子公式。
Spells (法术): 必须将法术列表中的每个法术拆分为独立的 spell 类型 Item，不要把列表合并在描述里。
Multiattack (多重攻击): 创建为 feat 类型。
Icons (图标): 使用 FVTT 核心路径，例如 icons/skills/melee/strike-blood-red.webp，不要使用本地无法访问的路径。
Rich Text: 在描述字段 (description.value) 使用 HTML (<p>, <strong>, <ul>, <li>) 进行排版。
5. Item Classification (物品分类)
Weapons (攻击): 类型设为 weapon。必须配置 system.actionType (mwak/rwak/msak/rsak) 和 damage formula。
Features (特性): 被动能力、主动技能、多重攻击等类型设为 feat。
Code Template (代码模板)
请严格按照以下结构输出，不要改变逻辑结构：
code
JavaScript
// Data Definition
const actorData = {
  "name": "Monster Name",
  "type": "npc",
  "img": "icons/svg/mystery-man.svg", // Select a relevant generic icon
  "system": {
    "attributes": {
      "hp": { "value": 100, "max": 100, "formula": "10d10 + 50" },
      "ac": { "flat": 18, "calc": "flat" }
    },
    "traits": {
      "size": "lg", // mapped from constraints
      "dr": { "value": [], "custom": "" }, // damage resistances
      "di": { "value": [], "custom": "" }, // damage immunities
      "ci": { "value": [], "custom": "" }  // condition immunities
    },
    // ... other standard dnd5e npc data ...
    "details": {
      "cr": 5,
      "biography": { "value": "<p>HTML Description here...</p>" },
      "type": { "value": "fiend", "subtype": "demon" }
    }
  },
  // Token Configuration (ROOT LEVEL)
  "prototypeToken": {
    "name": "Monster Name",
    "width": 2, // mapped from constraints
    "height": 2, // mapped from constraints
    "displayBars": 20, // Always visible
    "bar1": { "attribute": "attributes.hp" },
    "disposition": -1 // Hostile
  },
  "items": [
    // Array of Item Objects (weapons, feats, spells)
    {
      "name": "Multiattack",
      "type": "feat",
      "img": "icons/skills/melee/strike-flurry.webp",
      "system": {
        "description": { "value": "<p>The monster makes two attacks.</p>" },
        "activation": { "type": "action", "cost": 1 }
      }
    }
    // ... more items ...
  ]
};

// Execution Logic
(async () => {
  try {
    const createdActor = await Actor.create(actorData);
    if (createdActor) {
      ui.notifications.info(`Success: Created actor "${createdActor.name}"`);
      createdActor.sheet.render(true);
    }
  } catch (e) {
    ui.notifications.error("Error creating actor: " + e.message);
    console.error(e);
  }
})();

```



---