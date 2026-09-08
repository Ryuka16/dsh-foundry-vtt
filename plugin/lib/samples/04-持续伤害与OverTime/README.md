# 04 · 持续伤害与 OverTime

**放什么**：持续伤害/持续效果实体——流血/灼烧/每回合伤害/回合结束生效（flags.midi-qol.OverTime）。

**AI 何时来**：做「每回合开始掉血」「N 回合后解除」类效果。重点抄：
- change key：`flags.midi-qol.OverTime`
- value 逗号式参数：`turn=start,damageRoll=1d4,damageType=slashing,saveDC=11,saveAbility=con,saveCount=1-,label=流血`
- saveCount=1- 每回合可豁免移除；turn=start/end 时机

**典型样本**：守卫锯肉刀（流血 OverTime 完整实例）
