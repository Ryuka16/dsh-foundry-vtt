# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/JAjFwgbxsiOFyIkLiJrcToyFnnh

本文档预计简单快捷地告诉你不同需求的自动化需要用到些什么
须知，第一步永远是查看是否有已经做好的预制菜
[激活条件](https://xcnplziulnma.feishu.cn/wiki/SDBHwnvcWigh6gkvZpEc48xQn2f)以下条件判断可查阅： 
#### 物品只能在特定条件下使用
行动Midi-QOL标签页中的使用条件
![图片](images/BvoVbQIdnovwN6xPp4CcsXP4nJg.png)
#### 物品仅在特定条件下施加主动效果
行动Midi-QOL标签页中的激活效果条件
![图片](images/ML4HbuoKBowqeyxCk25cp5RWnkc.png)
#### 物品有一连串要执行的操作
例如进行一次攻击检定，并在特定条件下强加一次豁免检定
在 DND5e v4.x.x 及更高版本中：使用Midi-QOL标签页的其他行动兼容或触发行动功能
![图片](images/Pm7pbYU5Votn9txihaIcR9iWn6c.png)
#### 物品应用一个效果来修改其他物品的掷骰方式
用于调整优势、伤害减免、修改射程等。
[midi Flags介绍](https://xcnplziulnma.feishu.cn/wiki/W2XYwGUu2i3O5MkswVzckLD6ngd)依靠的是常规的 DAE 效果，你可以在这查询现有的可用属性键： ，在 FVTT 里大部分属性键已经完成汉化。
#### 物品仅在特定条件下为掷骰提供加值/优势/劣势/重骰
例如使用次数有限、提示选择何时使用，或其他一些逻辑。
[Automated conditions 5e的使用方法](https://xcnplziulnma.feishu.cn/wiki/Sl6QwVxRqi6SUrkKe8wc0yoJnuh)[Optional(midi)](https://xcnplziulnma.feishu.cn/wiki/XTHzwfanviDMMRkTGOCcOnfwnu2)使用 创建一个主动效果，或者参考 
#### 物品需要在应用或移除主动效果时执行某些操作
[主动效果（AE）系统综述](https://xcnplziulnma.feishu.cn/wiki/D6piw0oiriXMnBkVh5KcN8sInte)参考 中的DAE宏。
#### 使用掷骰公式表达效果的持续时间
[掷骰数据](https://xcnplziulnma.feishu.cn/wiki/PxmxwHtBniay5LkIH7nce8LunGh)在效果上使用 DAE 的输入框：以秒计数的效果持续时间投骰公式，该表达式仅能访问持有该效果的角色的 actor.getRollData()，也即 。
![图片](images/YUKabdt70oCoizx3quwcfphYnIg.png)
#### 一个效果在特定条件下自行禁用
[掷骰数据](https://xcnplziulnma.feishu.cn/wiki/PxmxwHtBniay5LkIH7nce8LunGh)在效果上使用 DAE 的输入框：表达式，如果为真则禁用该效果，该表达式仅能访问持有该效果的角色的 actor.getRollData()，也即 。
[Optional(midi)](https://xcnplziulnma.feishu.cn/wiki/XTHzwfanviDMMRkTGOCcOnfwnu2)你可以参考 里的激活条件来书写此处。
![图片](images/U9oFbCe66odtaZx7axmc5sa6nKh.png)
#### 一个效果在特定条件下自行移除
[掷骰数据](https://xcnplziulnma.feishu.cn/wiki/PxmxwHtBniay5LkIH7nce8LunGh)在效果上使用 DAE 的输入框：表达式，如果为假则将该效果从角色身上移除，该表达式仅能访问持有该效果的角色的 actor.getRollData()，也即 。
[Optional(midi)](https://xcnplziulnma.feishu.cn/wiki/XTHzwfanviDMMRkTGOCcOnfwnu2)你可以参考 里的激活条件来书写此处。
![图片](images/G9aBbkPHXobeDWxjXqrchKx2nGb.png)
#### 一个效果有着特殊的持续时间
一些有特殊持续时间的效果描述会有如一次攻击失效/一次豁免失效。
效果持续时间标签页下的特殊持续时间，或者CPR医药箱中的特殊持续时间。
![图片](images/IxBpbfQKTouNSbxTtPKcQOoWnbg.png)
![图片](images/Ornkb13TVotZk2xxqXicO0PCnFd.png)
#### 我想要效果可以修改一些常用键值无法修改的角色字段（如角色的临时生命值），并希望其更改可以随着效果的移除而撤销？
[macro.actorUpdate使用方法](https://xcnplziulnma.feishu.cn/wiki/ZeLAwD52pijnUkkzHhGcIxpTnnf)你需要使用dae的macro.actorUpdate方法： 
#### 物品需要按固定间隔重复执行某些操作
[Overtime(midi)](https://xcnplziulnma.feishu.cn/wiki/U6eAwHEiPiOkOBkq2gBcFdI0nSe)在战斗轮次开始/结束时，可能结合技能/检定/豁免来移除： 
使用 Times-Up 时，DAE 宏可以在轮次开始/结束时运行
![图片](images/HLNzb1wdLoTB1pxZuxVcmG5bnHb.png)
#### 物品用于响应针对持有该物品的角色的攻击或伤害
[额外反应触发条件](https://xcnplziulnma.feishu.cn/wiki/UmjMwULZbilApZkwkfCckDkrnSf) 
#### 物品用于响应发生在另一个角色身上的事件，且该角色事先未被赋予效果
这是第三方反应，需要 MISC 中的 Elwin 的 TPR 这样的框架，或者使用 CPR 的嵌入宏功能的场景宏
![图片](images/KQWkbSTuxoLnQKxmJd7cYmOnnNP.png)
#### 物品不属于上述任何类别
##### 你只需要在掷出物品时有逻辑：物品的标题栏的Midi-qol
![图片](images/E7StbGSUNoSulaxrvS8clpAanBe.png)
##### 你需要特定角色持有的任何物品被掷出时的逻辑：角色使用宏
![图片](images/O2rJbsn5Io9bTzxGvIJcpbfvnn6.png)
![图片](images/QR32bQabNonAqnxdLlrcYJn6nCg.png)
在 MidiQOL 自述文件 中查找关于编写宏的文档
# DND5e v5.x.x
#### 如何设置行动的使用激活条件？
在行动的Midi-QOL标签页的使用条件
![图片](images/RPAfbuMkNoOaYUxLuWgcM8QOnHc.png)
#### 如何设置效果的应用条件？
在行动的Midi-QOL标签页的激活效果条件
![图片](images/Rh6pboRNooZvacxNPjYcIwIpn9f.png)
#### 如何配置其他行动？
在来源行动的Midi-QOL标签页的使用其他行动
目标行动必须启用选项：Midi-QOL标签页的与其他行动兼容（默认已启用）
![图片](images/Mnnmb4Nlco5TuXxpxkgcSwK1nQg.png)
#### 如何配置触发行动？
在来源行动的Midi-QOL标签页的触发行动
![图片](images/TB6ubXtHXomRIHxuvp1cmrOrnnf.png)
#### 如何使用 flags.midi-qol？
在物品的效果标签页 -> 编辑 -> 效果的更改标签页 -> 属性名
![图片](images/TqIxb0mzvogKjBxZrWec4Z2Dnqe.png)
#### 在哪里放置效果键值的条件评估？
在效果的更改标签页的效果值列
![图片](images/KK5PbL9RCo2gqHxIabQc5mTjnKb.png)
#### 如何设置 DAE 的特殊效果持续时间？
在效果的持续时间标签页底部的特殊持续时间
![图片](images/QfZjb2uURobfY4x19EycBO9YnlJ.png)
#### 在哪里放置宏？
物品宏：物品的标题栏 > DIME (DAE 物品宏编辑器)
![图片](images/KWuobojxPobYgBxmmdRcdGaXnhf.png)
![图片](images/MihYbrNEaohmwnx1tVWcR6TEn5z.png)
行动宏：行动的标题栏 >  行动宏编辑器或行动的Midi-QOL标签页底部
![图片](images/OyFEb9rwrom394xu5w5cff1UnBg.png)
![图片](images/ITCMbYsKaofHSKxNhG5cWsfUnfg.png)
世界宏：屏幕右侧边栏中的 </> 图标
![图片](images/XTK8bmBrEoP42WxvDnDcU2xZnOe.png)
#### 如何添加物品使用调用宏？
物品的标题栏的Midi-qol
![图片](images/LX6sb4xRcoeemxxKWf9c0bMYnHe.png)
#### 如何添加角色使用调用宏？
创建一个具有 flags.midi-qol.onUseMacroName | 自定义 | <A>,<B> 的主动效果
将 <A> 替换为以下之一：
- ItemMacro
- ActivityMacro (仅从第一个行动中获取)
- ActivityMacro.<C>，其中 <C> 是以下之一：
  - 行动标识符
  - 行动 uuid
  - 行动名称
- 一个世界宏的名称
将 <B> 替换为一个宏传递参数
![图片](images/AUP6be4M9owyLQxilobcUhYznBg.png)
#### 效果应该是光环！
[Observer的自动化物品示例](https://xcnplziulnma.feishu.cn/wiki/GrmQwCjWiioCCpkcTAmcfKfznug) 
#### 创建沉默术类的区域性效果？
[Observer的自动化物品示例](https://xcnplziulnma.feishu.cn/wiki/GrmQwCjWiioCCpkcTAmcfKfznug) 