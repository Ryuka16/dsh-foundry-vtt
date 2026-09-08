# 样本库（世界导出的真实配置实体）

> **AI 铁律：建物品/怪物/特效前，先来这找同类真实样本——读它的结构 → 照抄 → 只改 name/img/数值/描述。0 实例的键名禁用，禁止从零手写结构。**
> **用户添加：把 FVTT 导出的实体 JSON 拖进对应分类文件夹，新对话 AI 自动可见（无需改代码）。本目录随 git 发布——拖入的 JSON 会一起发布，供别人 clone 参考（不想发布就放本机扩展目录，AI 也能读）。**

## 分类（10 类）

| 文件夹 | 放什么 | AI 何时来这找 |
|---|---|---|
| 01-武器与攻击 | weapon 物品，含带豁免特效的武器 | 建武器/怪物攻击（attack+save 三件套） |
| 02-怪物卡 | npc/character actor 完整卡 | 建怪物/NPC（数值骨架+特性+装备+动作） |
| 03-状态与中毒 | 挂状态效果（中毒/麻痹/恐惧等 statuses） | 做「命中→豁免→失败中状态」 |
| 04-持续伤害与OverTime | flags.midi-qol.OverTime 实体 | 做流血/灼烧/每回合伤害 |
| 05-光环 | auraeffects 光环 | 做范围增益/减益/伤害光环 |
| 06-物品宏 | onUseMacroName + dae.macro 三件套 | 做物品宏（磁轭手铳=金标准） |
| 07-DAE与特殊时长 | DAE 特殊键/特殊时长/切换形态 | 做「下一次攻击生效」/变身类 |
| 08-法术与特性 | spell/feat 物品 | 建法术/职业特性 |
| 09-装备与消耗品 | equipment/consumable/backpack/tool | 建装备/药水/卷轴 |
| 10-奇物与复杂活动 | 多活动奇物（变形/召唤/多形态） | 做多功能/多形态物品 |

## AI 读取方式

1. `foundry_knowledge{topic:"samples"}` → 分类树索引（文件夹+文件名+大小）
2. `foundry_knowledge{topic:"samples", file:"03-状态与中毒/某样本.json"}` → 读样本（file 带分类子路径）
3. 大文件先 `query:"关键词"`（如 OverTime/onUseMacroName/activities）grep 定位，再 `offset` 翻页
4. 每分类文件夹有 README（放什么/抄什么），需要时也用 file 读它

## 规则

- 样本结构照抄，只改 name/img/数值/描述——**不动字段层级**
- 同功能优先照抄样本；样本里没有的键名=0 实例，禁止使用
- 索引还有「本机扩展」区（config 的 sampleDir）：未入 git 的私藏样本放那，AI 同样能读
