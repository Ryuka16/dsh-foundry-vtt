# 10 · 奇物与复杂活动

**放什么**：复杂多活动奇物——多种活动（攻击+豁免+治疗+工具）、变形/召唤/多形态切换实体。

**AI 何时来**：做多形态/多功能物品（一键多种用法）。重点抄：
- activities 多活动并存（attack/save/heal/utility/enchant 混用）
- otherActivityId 链式触发
- 跨物品引用（otherActivityUuid）
- 复杂 flags 组合

**典型样本**：妄质百变腕甲（140KB 完整字段）、奥能科技拳套、`便捷效果库-DFredsCE-111效果.json`（203KB，DFreds CE 111 个真实配置效果总集：法术/特性/道具自动化全覆盖，做状态效果前先 query 搜效果名，如 query:"OverTime" 或 "灼烧"）
