# 06 · 物品宏

**放什么**：带物品宏的实体 JSON——`flags.midi-qol.onUseMacroName` + `flags.dae.macro` 三件套完整实例。

**AI 何时来**：做物品宏（使用物品时跑宏）。重点抄：
- `flags.midi-qol.onUseMacroName`: "[postActiveEffects]ItemMacro"（物品级方括号式）
- `flags.dae.macro{name,type:"script",scope:"global",command}` 宏体挂载
- macroPass 时机选择（postActiveEffects 施放附魔等）

**典型样本**：磁轭手铳（物品宏金标准）
