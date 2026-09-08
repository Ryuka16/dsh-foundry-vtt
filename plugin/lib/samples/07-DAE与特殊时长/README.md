# 07 · DAE 与特殊时长

**放什么**：DAE 高级效果的实体——特殊时长/动态效果/macro.execute/变身切换。

**AI 何时来**：做「下一次攻击生效」「直到被 X 解除」「附身/切换形态」类效果。重点抄：
- flags.dae.specialDuration: ["1Attack"] 等特殊时长
- duration.seconds 特殊值（60=10轮；特殊表达式）
- DAE 特殊键：macro.execute/itemMacro/activityMacro/createItem/actorUpdate
- change 键配方（tempmax 临时生命等）

**典型样本**（均提炼自 dce 效果集，覆盖全部常用 specialDuration 类型）：
- `克敌机先-1Attack.json` — 下一次攻击消耗（1Attack）
- `曳光弹-isAttacked.json` — 被攻击即消耗（isAttacked）
- `银光锐语-多条件.json` — 多条件数组（1Action/isSave/isCheck/isSkill）
- `格挡Parry-turnStart.json` — 到自己回合开始移除（turnStart）+ AC 加值 change
- `吸收元素-turnEndSource.json` — 来源回合结束移除（turnEndSource）+ 空 changes 壳
- `驱散不死生物-isDamaged.json` — 受伤即灭（isDamaged）
- 其他变体：turnEnd（普通回合结束）、turnStartSource、isSaveSuccess.dex（豁免成功即灭，见 04-灼烧）、None（禁用特殊时长）

**注意**：这些值 AI 凭空写不出来（无 UI 可点），必须照样本抄。DAE 的 UI 好配，但 AI 写的是 JSON——这分类是给 AI 照抄用的。
