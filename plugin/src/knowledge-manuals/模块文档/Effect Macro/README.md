# Effect Macro

> 来源：https://git.gay/Zhell/effectmacro （Forgejo 自建仓库，**不是 GitHub**）
> 仓库 `readme.md` 原文 + 中文对照（2026-09-17 抓取）
> 模块 id：`effectmacro` ｜ 作者：Zhell（GitHub 用户名 krbz999）｜ 本机版本 13.0.3
> 注意：manifest 里写的 `https://github.com/krbz999/effectmacro` **已 404**，真源码在 git.gay

Interested in following along with development of any of my modules? Join the [Discord server](https://discord.gg/QAG8eWABGT).

## 它是什么

A module that allows users to embed macros directly into effects.
These macros are then called automatically when the appropriate trigger happens.

**中文**：把宏直接**嵌进效果（ActiveEffect）**里，触发时机到了就自动调用 —— 相当于给每个 AE 挂自己的物品宏，但**不需要物品**，且触发时机比 midi 的物品宏更细（回合/轮/战斗）。

## 触发时机全集（11 种 + 1 个 never）

The options are:

| # | 英文原文 | 中文 |
|---|---|---|
| 1 | When an effect is created. | 效果**被创建**时 |
| 2 | When an effect is deleted. | 效果**被删除**时 |
| 3 | When an effect is toggled (on, off, or both). | 效果**被切换**时（开 / 关 / 两者） |
| 4 | When the actor who has the effect starts their turn. | 持有该效果的角色**开始自己的回合**时 |
| 5 | When the actor who has the effect ends their turn. | 持有该效果的角色**结束自己的回合**时 |
| 6 | At the start of any combatant's turn. | **任意**战斗者回合开始时 |
| 7 | At the start of every round. | **每轮**开始时 |
| 8 | At the end of every round. | **每轮**结束时 |
| 9 | When the actor who has the effect is marked defeated in combat. | 持有该效果的角色**在战斗中被标记为战败**时 |
| 10 | When combat is started. | **战斗开始**时 |
| 11 | When combat is ended. | **战斗结束**时 |

An effect can have a macro of any of these types, not just one.
There is also the static 'never' type meant for being explicitly called by other scripts.
This type is never called automatically.

**中文**：**一个效果可以同时挂多种类型的宏**（不止一个）。
另有静态的 `never` 类型，**只供其他脚本显式调用，永不自动触发**。

## 怎么用（How to）

Macros are added in the ActiveEffect config.
Selecting the type of trigger and clicking 'Add Macro' (or 'Edit Macro' for an existing macro) opens a macro editor.

**中文**：在**效果（ActiveEffect）配置界面**里加。选触发类型 → 点 `Add Macro`（已有的点 `Edit Macro`）→ 打开宏编辑器。

When an embedded macro is triggered, it is executed for the owner of the actor who has the effect.
If no such owner, then it is executed as if by the GM.

**中文**：触发时，**以「持有该效果的 actor 的 owner」身份执行**；若该 actor 没有 owner，则**以 GM 身份执行**。

The module will automatically iterate over all effects that *currently affect the actor*.

**中文**：模块会自动遍历**当前影响该 actor 的所有效果**（所以物品上的 transfer 效果也会被算进去）。

## 脚本预定义变量（Script Helpers）

By default, these variables are pre-defined in any effect macro.

| 变量 | 英文原文 | 中文 |
|---|---|---|
| `effect` | The effect itself. | 该效果本身 |
| `actor` | The actor who owns the effect (even if the effect is on an item). If no actor, then `null`. | 持有该效果的 actor（**即使效果挂在物品上**）。无则 `null` |
| `character` | The user's assigned actor. If no assigned actor, then `null`. | 当前用户绑定的角色。无则 `null` |
| `token` | If the actor is synthetic (unlinked), then `token` is the token placeable on the actor's scene, otherwise the first token found on the currently viewed scene belonging to `actor`. If none found, then `null`. | 若 actor 是 unlinked（合成），则是其场景上那个 token；否则是**当前查看场景**上属于该 actor 的第一个 token。找不到则 `null` |
| `scene` | The scene on which `token` is embedded. If there is no token, then the currently active scene is used. If no scene, then `null`. | `token` 所在场景；无 token 则用**当前激活场景**；无场景则 `null` |
| `origin` | The document that `ActiveEffect#origin` points to. If no such thing, then `null`. | `ActiveEffect.origin` 指向的文档。无则 `null` |
| `speaker` | The 'speaker' object normally used in chat messages, speaking as the `actor` if they exist. | 聊天消息用的 speaker 对象（以 actor 的名义说话） |
| `item` | If the effect is on an item and not an actor, this is that, otherwise `null`. | 若效果挂在**物品**上（而非 actor），这是那个物品；否则 `null` |

## 系统专属触发器（System Specific Triggers）

The module works in every system that has Active Effect support, however it can leverage system-specific hooks as well, if added.
The module is open to contributions for this purpose.

**中文**：凡是支持 Active Effect 的系统都能用；若有系统专属 hook 也能挂（欢迎贡献）。
dnd5e 的系统专属触发在仓库 `code/triggers/systems/dnd5e.mjs`（8,584 B）。

## 源码位置（本机已 clone，供以后查证）

```
code/triggers/combat.mjs          5,105 B   战斗/回合/轮相关触发
code/triggers/effect.mjs          5,900 B   效果创建/删除/切换触发
code/triggers/systems/dnd5e.mjs   8,584 B   dnd5e 专属触发
code/utils/utils.mjs              6,129 B   工具函数
code/hooks/render-active-effect-config.mjs  3,092 B   效果配置界面注入按钮
code/applications/sheets/macro.mjs          2,359 B   宏编辑器
lang/en.json  2,772 B ／ lang/pt-BR.json 3,055 B
```
