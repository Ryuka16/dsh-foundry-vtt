# 09 · 装备与消耗品

**放什么**：equipment / consumable / backpack / tool / loot 等物品 JSON——护甲、药水、卷轴、容器。

**AI 何时来**：建装备/消耗品。重点抄：
- equipment：system.type.value（light/medium/heavy/shield）/ armor 数值
- consumable：system.type.subtype（potion/scroll...）+ uses
- 带效果的装备：顶层 effects（ActiveEffect 结构，见 03/04 类）

**典型样本**：精铁胸甲、绿色孢子、传送门装置
