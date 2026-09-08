# 03 · 状态与中毒

**放什么**：命中后挂状态的实体——中毒/麻痹/恐惧/眩晕/石化等（ActiveEffect statuses + save 活动联动）。

**AI 何时来**：做「砍中→豁免→失败中状态」。重点抄：
- save 活动（dc/ability/effects 空壳）
- 物品顶层 ActiveEffect：`statuses:["poisoned"]` 等状态 id
- 附加 change：flags.midi-qol.disadvantage.attack.all（攻击劣势）等
- duration.seconds（状态持续）

**典型样本**：僵尸啃咬尸毒（中毒）、多多剑（毒刃）
