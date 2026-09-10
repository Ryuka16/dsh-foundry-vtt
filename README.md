# dsh-foundry-vtt

**让 DSH 里的 AI 直接操控 Foundry VTT 的插件全家桶。**

开一个新对话，说「帮我在激活地图上放一只僵尸」「给这个怪加个啃咬，命中后过体质豁免，失败中毒」「帮我掷 1d20+5」「把这场遭遇的先攻全掷了」——AI 会自己挑工具、查世界包、动手操作，并回报结果。

---

## 架构

```
┌──────────────────────┐        WebSocket         ┌──────────────────┐
│  腾讯云 FVTT V13      │ ◄──────────────────────► │  你的 Windows 桌机 │
│  （dnd5e 系统）        │   GM 浏览器里的模块发起    │  relay (:3010)    │
│  装模块               │                          │  SQLite 存配对/密钥 │
│  foundry-rest-api     │                          └────────┬─────────┘
└──────────────────────┘                                    │ HTTP (x-api-key)
                                                             ▼
                                              ┌──────────────────────────┐
                                              │ DSH 插件 dsh-foundry-vtt  │
                                              │ 90 个工具（数据API/参考库/检索）│
                                              │ → 新对话 AI 直接调用        │
                                              └──────────────────────────┘
```

核心思路：**模块的 WebSocket 由 GM 浏览器（云端 FVTT 页面）发起**，回连到你桌机的 relay——云端服务器零公网暴露、零安全组改动、零内网穿透。relay 把世界数据包成 HTTP API，DSH 插件再把 API 包成 90 个 AI 工具。

## 仓库内容

| 目录 | 是什么 | 说明 |
|---|---|---|
| `plugin/` | **DSH 插件（本仓库自研）** | 90 个工具（88 数据/操作 API + 内置结构参考库 + 内置知识·样本库），零静态依赖（只用 node 内置 fetch），是 AI 的「手」 |
| `relay/` | 本地 relay（收录 ThreeHats 开源源码 + 启动模板） | 云端 FVTT 与桌机之间的桥 |
| `tools/` + 根目录的 `*.bat` | **一键工具箱**（体检 / 修复装配 / 升级 / relay 自启） | 双击就能用，出问题不用问人 |
| `mcp-server/` | 独立 MCP server 形态（可选，收录上游源码） | 想接标准 MCP client（而非 DSH 插件）时用它 |
| `docs/部署教程.md` | 从零到跑通的全流程教程 | 含配对、密钥、DSH 装配、升级、故障恢复、踩坑大全 |

## 快速开始

完整流程看 **[docs/部署教程.md](docs/部署教程.md)**。一句话版：

1. 云端 FVTT 装模块 `foundry-rest-api`（manifest URL 见教程）
2. 桌机编译并启动 relay（`relay/start-relay.ps1`）
3. 模块配对（教程推荐 Enter Code 流程，含 curl 命令）
4. relay 建 API key + 写 `~/.dsh/dsh-foundry-vtt/config.json`
5. DSH 装配 `plugin/`，开新对话说人话

## 一键工具箱（出问题不用问人）

全家桶根目录有几个双击就能用的按钮：

| 双击 | 干什么 |
|---|---|
| `体检.bat` | 打印全链路状态 + 结论（Node / 插件装配 / relay / 配对数据 / 配置）——**出问题第一个双击它** |
| `修复装配.bat` | 把插件写回 DSH profile（依赖 + bundles + 链接一次补齐）——**DSH 重启后工具消失就双击它** |
| `升级.bat` | 覆盖式升级：旧版整目录改名备份 → 拷新版 → 自动校验装配 |
| `安装relay自启.bat` | 让 relay 开机自动跑（DSH 挂了，FVTT 那侧照样活着） |
| `卸载relay自启.bat` | 取消自启 |

> **为什么不建议手动覆盖解压升级**：① 旧版目录名带版本号（`dsh-foundry-vtt-full-v1.1.5`），而 DSH 装配记录里存的是**绝对路径** —— 目录名一换，路径悬空，插件就「消失」；② 逐文件覆盖遇到「旧的是文件、新的是目录」会直接中断报错。
> 正确做法：**安装目录名固定、不带版本号**，升级只换内容不挪窝，且走 `升级.bat`。

详细用法见 [docs/部署教程.md](docs/部署教程.md) 的「升级到新版本」和「故障恢复」两章。

## 上游致谢

- **ThreeHats/foundryvtt-rest-api** —— FVTT 模块 + relay（本仓库 `relay/go-relay` 收录其源码，版权归上游）
- **PhillypHenning/foundry-rest-api-mcp-server** —— MCP server 形态（本仓库 `mcp-server/` 收录其源码，版权归上游）
- **dsh-super-injector** —— DSH 插件装配基础设施

本仓库自研部分（`plugin/`）以 BSD-3-Clause 发布，见 [LICENSE](LICENSE)。

## 免责声明

`execute-js` 等工具权限极高（可读写世界任意数据）。工具描述已内置「删除/清空/任意 JS 执行前必须与用户确认」的约束，但最终行为由调用它的 AI 决定，请自行评估风险。
