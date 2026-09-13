# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/UmjMwULZbilApZkwkfCckDkrnSf

MIDI提供了一定的反应自动化——当然，MIDI自身的反应自动化相当局限，比如它只能实现第一方反应，这一类型典型的例子的护盾术，而对第三方反应无能为力，比如法术反制/吟游诗人的语出惊人。事实上，第三方反应属于自动化中比较复杂且优化堪忧的部分。
要使用MIDI的反应，你需要首先在行动的激活—时间页面为激活消耗的费用选择反应，如果你不做额外的配置，反应默认会在isHit（被命中）阶段执行，也就是说，反应会在物品拥有者被命中时弹出。为了调整反应的触发时机满足需求，我们需要前往行动MIDI标签页中修改它的使用条件
![图片](images/Z8INbeC32oMmb2xTj5Zc3qMMnUe.png)
反应有一系列专用的触发条件——当然，你可以用到的条件也并不局限于此
- 'preAttack'：在物品（产生攻击掷骰，或用 Fvtt 数据模式术语来说 item.hasAttack == true）进行攻击掷骰之前调用，即被物品攻击前
- 'isAttacked'：在 item.hasAttack 掷出攻击后但在检查命中/未命中之前调用，即被物品攻击
- 'isMissed'：item.hasAttack 未命中，即被物品攻击但是未被命中
- 'isHit'：item.hasAttack 命中，即被物品攻击且被命中
- 'isDamaged'：被伤害
- 'isHealed'：物品进行治疗（actionType == 'heal' 或者第一个伤害类型是 'healing' 或 'temporary healing'），被治疗
- 'isSave'：item.hasSave 触发豁免检定，但在结果被裁决之前调用，被迫使进行豁免，但豁免裁决未开始
- 'isSaveSuccess'：item.hasSave 且豁免成功，被迫使进行豁免且成功
- 'isSaveFail'：item.hasSave 且豁免失败，被迫使进行豁免且失败
- "false": 反应不会自动触发，只能由持有者手动触发，在某些时候可能会很有用
用法
在 MidiQOL 物品详情选项卡的激活条件字段，添加例如 reaction === 'isHit'。
[激活条件](https://xcnplziulnma.feishu.cn/wiki/SDBHwnvcWigh6gkvZpEc48xQn2f)与一般的使用条件类似，你可以用 进行排列组合以达到你的特定反应触发时机