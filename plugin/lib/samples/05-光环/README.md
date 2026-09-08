# 05 · 光环

**放什么**：带光环的实体——auraeffects 光环（范围增益/减益/持续伤害光环）。

**AI 何时来**：做「X 尺内友方加伤」「靠近受伤害」类光环。重点抄：
- 效果 type：`auraeffects.aura`
- system.distanceFormula（半径）/disposition（1 友 -1 敌 0 全体）/applyToSelf
- collisionTypes:["move"]/color/opacity/showRadius
- flags.auraeffects: {originalType:"base"}

**典型样本**：光环效果挂光源 token 的 transfer 效果（坑书有完整实例）
