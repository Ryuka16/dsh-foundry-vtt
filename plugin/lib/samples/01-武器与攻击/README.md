# 01 · 武器与攻击

**放什么**：weapon 类物品 JSON——普通武器、带豁免特效的武器（命中→豁免→状态/持续伤害）、怪物攻击动作（attack 活动）。

**AI 何时来**：建武器/给怪物加攻击。重点抄：
- `system.damage.base{number,denomination,bonus,types}` 伤害骰
- attack 活动全字段（attack/range/damage.includeBase/target）
- 带特效武器：attack 活动 `otherActivityId` 指向 save 活动 + save 活动本体 + 物品顶层 effects

**典型样本**：金属龙吐息武器-自动化版（攻+豁免+效果全配置）
