# 飞书知识库《FVTT：从入门到入土》完整镜像

> 来源: https://xcnplziulnma.feishu.cn/wiki/K0C3wDuDjioEywk96V0cLMEanXe
> 抓取方式: curl + cookie + referer（公开 wiki SSR，解析 block_map 还原正文/表格/内链/图片）
> 抓取日期: 2026 会话（BFS 递归全抓，56 页，00-55；表格展开 + 图片本地化）
> 每页头部均内嵌「> 来源: <原始URL>」，可回溯原站核对更新

## 目录分组

### 入门与安装
| 文件 | 主题 |
|---|---|
| 00-总目录-FVTT从入门到入土.md | 知识库总目录（视频/购买/服务器/FLC 浏览器/各主题导航） |
| 01-常用访问链接.md | FVTT 系统、DND5e/PF2、汉化、资源与世界的常用链接 |
| 02-mod 相关.md | mod 安装注意事项（含版本/兼容常见坑） |
| 03-FVTT 下载加速代理.md | 在线安装所需加速代理补丁 |
| 04-DND5e_5R版本选取建议.md | DND 规则系统版本选择 |
| 08-FVTT 基础教程.md | （空页） |
| 09-在线安装教程.md | 在线安装系统/世界/mod |
| 11-V13系统开发教程（施工中）.md | 面向 JS 用户的系统开发入门 |
| 12-常见问题.md | （几乎空） |
| 13-手动安装教程.md | 手动安装流程 |
| 14-基础教程之基础教程.md | FVTT 基础操作 |
| 15-PF2 版本选取建议.md | PF2 系统版本选择 |
| 17-mod 教程.md | （空页） |
| 21-dnd5.3兼容性检查表.md | dnd5e v5.3 常用 mod 兼容检查表 |
| 22-自动化最小MOD组（DND5.2.5）.md | FVTT v13.351 快速部署：已确认兼容的自动化+动画最小 mod 组 |

### 自动化与宏（核心）
| 文件 | 主题 |
|---|---|
| 10-自动化教程.md | 自动化体系导航（11 个下一层页面） |
| 16-宏相关.md | 宏的三种挂载位置（快捷栏/人物/物品）+ AI 辅助写宏 |
| 28-midi相关额外教程（建议阅读）：.md | midi 额外教程目录（含 Overtime 链接） |
| 29-DND5e v5.x.x.md | DND5e 版本下的 midi 自动化要点 |
| 30-掷骰数据.md | DND5e 系统可引用的掷骰数据 |
| 31-行动通用键值.md | 行动通用键值 |
| 33-属性.md | 核心 dnd5e 可用的属性效果（变更模式/键值表格） |
| 34-力竭.md | 力竭（exhaustion）自动化处理 |
| 35-ATL语法.md | Active Token Effects 语法 |
| 36-激活条件.md | midi 使用条件/行动使用条件/dae 评估表达式（BooleanFormula 详解） |
| 39-宏基础入门教程.md | 宏基础入门（外部链接导航） |
| 42-自动化核心.md | 自动化核心概念 |
| 43-midi-qol标志参考.md | flags.midi-qol.* 全参考（onUseMacroName/延迟求值/条件表达式） |
| 44-前言.md | （某自动化主题前言） |
| 45-语法.md | 条件表达式/数据引用语法 |
| 46-属性键值.md | 属性键值速查 |
| 49-使用其他行动.md | 使用其他行动 |
| 50-MidiQOL函数大全.md | MidiQOL.* API 全函数说明（applyTokenDamage/checkActivityRange/completeActivityUse…） |
| 52-MIDI反应自动化.md | midi 反应触发时机（preAttack/isHit/isSave…）+ reaction 条件 |
| 53-midi多属性豁免.md | v13.0.43 多属性豁免/检定工作机制 |
| 54-特殊目标-self.md | 目标写入 -self 的用法 |
| 55-函数签名.md | 相关函数签名 |

### CPR 体系（chris-premades 自定义自动化）
| 文件 | 主题 |
|---|---|
| 23-前置要求.md | CPR 使用前置要求 |
| 24-参照模板.md | CPR 参照模板 |
| 27-一、什么是CPR宇宙？.md | CPR 宇宙介绍 |
| 32-一、该 mod 的面对对象.md | （AC5e 面向对象说明） |
| 47-CPR自定义宏制作.md | 手把手：CPR 自定义宏（export→return→identifier→绑定物品） |

### 资源与社区
| 文件 | 主题 |
|---|---|
| 05-汉化相关.md | 汉化包说明 |
| 06-服务器推荐.md | 服务器购买与部署建议 |
| 07-拼车资源.md | 拼车渠道 |
| 18-Plutonium-CN介绍.md | Plutonium 中文魔改版（5eTools 一键导入，内测中） |
| 20-为什么我的动画或音效无法播放？.md | JB2A/动画音效排障 |
| 26-视频链接.md | 视频教程链接 |
| 37-为什么我的token的链接放到指示物设置里面后发现用不了？.md | token 链接排障 |
| 40-FVTT需求反馈.md | 社区宏投稿与需求反馈 |
| 41-DND资源.md | DND 资源汇总 |
| 48-推荐观看.md | 推荐观看列表 |
| 51-推荐观看.md | 推荐观看列表 |

### 空页（占位无内容）
08、19、25、38

## 已知缺失
- `Overtime使用说明`（https://xcnplziulnma.feishu.cn/wiki/U6eAwHEiPiOkOBkq2gBcFdI0nSe）：已被限制权限，公开访问返回登录壳，抓取失败。该主题用户本地已有 `OvertimeActivity使用说明.docx` 覆盖。

## 使用提示
- 正文、代码块、标题、内链、表格、图片均完整；图片已下载到 `images/` 子目录，md 内引用相对路径。
- 文件（📎）与视频（🎬）为占位，未下载二进制附件。
- 原站更新后如需同步，重跑 `99_临时草稿\飞书文档解析\fetch_all.js --refresh`（幂等：已下载图片跳过，只重写有变化的页）。
