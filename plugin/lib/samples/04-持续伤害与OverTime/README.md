# 04 · 持续伤害与 OverTime

**放什么**：持续伤害/持续效果实体——流血/灼烧/每回合伤害/回合结束生效（flags.midi-qol.OverTime）。

**AI 何时来**：做「每回合开始掉血」「N 回合后解除」类效果。重点抄：
- change key：`flags.midi-qol.OverTime`
- value 逗号式参数：`turn=start,damageRoll=1d4,damageType=slashing,saveDC=11,saveAbility=con,saveCount=1-,label=流血`
- saveCount=1- 每回合可豁免移除；turn=start/end 时机

**典型样本**（均提炼自用户世界实测配置 dce常用设置.json = DFreds CE 111 效果集）：
- `灼烧-每回合1d4火焰.json` — turn=start 每回合火伤 + saveCount=1- 每回合豁免熄灭
- `酸蚀-下回合结算2d4.json` — turn=end 一次性结算 + removeCondition=true 结算后自动移除
- `倒地-下回合可站起.json` — 纯 statuses:["prone"]，站起靠 dnd5e 规则花一半移动力（无需 OverTime）
- `狂笑术-每回合智慧豁免.json` — 多 change 综合（grants 优势/劣势 + movement *0.5 + OverTime 动态 DC `saveDC=@attributes.spelldc`）

**dce 源文件中的旧式变体（用户世界真实运行）**：`saveRemove=true`（旧式，midi 13.0.37+ 官方推荐 saveCount=1-）；配合 `dae.specialDuration:["isSaveSuccess.dex"]` 可做「仅敏捷豁免成功才熄灭」；`saveMagic=true` 计为魔法豁免。
