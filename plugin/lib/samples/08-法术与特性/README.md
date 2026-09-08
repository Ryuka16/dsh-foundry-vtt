# 08 · 法术与特性

**放什么**：spell / feat 类物品 JSON——法术（等级/学派/施法时间/豁免/伤害）、职业特性（使用次数/恢复）。

**AI 何时来**：建法术/特性。重点抄：
- spell：system.level/school/preparation/duration/range/target/uses + activities
- feat：system.type/recharge/uses + activities（主动特性带动作）
- 特性里的 effects（被动增益）

**典型样本**：从世界包导入的法术/特性（foundry_search 搜到后 get 照抄也行）
