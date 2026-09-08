# 08 · 法术与特性

**放什么**：spell / feat 类物品 JSON——法术（等级/学派/施法时间/豁免/伤害）、职业特性（使用次数/恢复）。

**AI 何时来**：建法术/特性。重点抄：
- spell：system.level/school/preparation/duration/range/target/uses + activities
- feat：system.type/recharge/uses + activities（主动特性带动作）
- 特性里的 effects（被动增益）

**典型样本**：从世界包导入的法术/特性（foundry_search 搜到后 get 照抄也行）

**数据表**：`dnd5e_classpack-cpr-mapping.json`（82KB，477 条）——CPR（Chris's Premades）引用 classpack 内容的映射速查表，每条 {collection,id,name,identifier,version}。AI 做 CPR 宏/自动化要写 identifier 时先 query 搜条目名（如 query:"巨人打击" 或 query:"strikeOfTheGiants"）拿 identifier 和 id。分布：spell 156 / extra-ability 152 / class-abilityphb 104 / itempack 41 / racial-traits 10 / feats-all 10。
