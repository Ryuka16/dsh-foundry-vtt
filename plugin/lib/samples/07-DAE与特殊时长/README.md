# 07 · DAE 与特殊时长

**放什么**：DAE 高级效果的实体——特殊时长/动态效果/macro.execute/变身切换。

**AI 何时来**：做「下一次攻击生效」「直到被 X 解除」「附身/切换形态」类效果。重点抄：
- flags.dae.specialDuration: ["1Attack"] 等特殊时长
- duration.seconds 特殊值（60=10轮；特殊表达式）
- DAE 特殊键：macro.execute/itemMacro/activityMacro/createItem/actorUpdate
- change 键配方（tempmax 临时生命等）

**典型样本**：妄质百变腕甲（特殊时长+切换形态，坑书主角）
