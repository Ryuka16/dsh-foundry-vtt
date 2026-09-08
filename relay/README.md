# relay（本地桥）

云端 FVTT 与桌机之间的中转：GM 浏览器里的模块经 WebSocket 连到这里，这里再把世界数据包成 HTTP API 给 DSH 插件 / MCP server。

## 本目录内容

- `go-relay/` —— ThreeHats `foundryvtt-rest-api-relay` 源码（Go，收录自上游开源仓库，版权归上游）
- `start-relay.ps1` —— 启动模板（改邮箱/密码即可用）
- `data/` —— 启动后自动生成，**`relay.db` 是命根子**（配对关系 + API key），记得备份，**不要提交到公开仓库**

## 快速开始

```powershell
cd go-relay
$env:GOPROXY = 'https://goproxy.cn,direct'
go build -o relay.exe ./cmd/server/
cd ..
# 编辑 start-relay.ps1 的 ADMIN_EMAIL / ADMIN_PASSWORD
.\start-relay.ps1
```

验证：`Invoke-RestMethod http://localhost:3010/api/health` → `ok`

完整配对/密钥流程见 [../docs/部署教程.md](../docs/部署教程.md)。

## 关键环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `PORT` | 3010 | HTTP 端口 |
| `DB_TYPE` | sqlite | 数据库类型 |
| `DATA_DIR` | `..` | relay.db 存放目录 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | — | 首次启动自动建管理员 |
| `KEY_REQUEST_RATE_LIMIT` | 20/15min | **必须调大**（模块轮询会 429） |
| `PAIRING_RATE_LIMIT` | 10 | **必须调大**（配对交换限流） |
| `FRONTEND_URL` | — | 配对批准页前缀（批准页前端未构建，走 Enter Code 流程） |

## 上游

- 仓库：https://github.com/ThreeHats/foundryvtt-rest-api （模块 + relay）
- 本目录源码来自其 release 源码包，仅作收录便于构建，未做改动。
