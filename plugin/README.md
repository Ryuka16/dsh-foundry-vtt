# @dsh-external/dsh-foundry-vtt

DSH 原生 FVTT 控制工具包：把 Foundry VTT 的操控能力做成 **88 个 DSH 插件工具**，
任何 DSH 新对话的 AI 都能直接调用，像普通闲聊一样指挥你的 Foundry VTT。

底层走 ThreeHats `foundry-rest-api` 模块的**本地 relay**（`localhost:3010`）HTTP API，
不依赖独立 MCP 进程——插件用 node 内置 `fetch` 直连 relay（`x-api-key` header + `clientId` query + 信封解包），零运行时依赖。

---

## 工具全清单（88 个，分组）

| 组 | 工具 |
|---|---|
| 世界·实体 9 | `foundry_list_worlds` · `search` · `get_entity` · `create_entity` · `update_entity` · `delete_entity` · `modify_actor` · `create_creature` · `manage_folder` |
| 掷骰·自动化 7 | `roll` · `get_recent_rolls` · `get_last_roll` · `list_status_effects` · `get_effects` · `add_effect` · `remove_effect` |
| 导入·放置 4 | `import_entity` · `place_token` · `move_token` · `get_scene` |
| dnd5e 检定 7 | `dnd5e_ability_check` · `ability_save` · `skill_check` · `death_save` · `concentration_save` · `concentration` · `break_concentration` |
| dnd5e 动作 14 | `dnd5e_get_actor_details` · `use_item` · `use_spell` · `use_feature` · `use_ability` · `equip_item` · `attune_item` · `prepare_spell` · `long_rest` · `short_rest` · `modify_currency` · `transfer_currency` · `modify_experience` · `modify_item_charges` |
| 遭遇 9 | `encounter_list` · `start` · `end` · `add` · `remove` · `next_turn` · `last_turn` · `next_round` · `last_round` |
| 场景·画布 11 | `scene_create` · `scene_update` · `scene_delete` · `scene_switch` · `canvas_get` · `canvas_create` · `canvas_update` · `canvas_delete` · `measure_distance` · `select` · `get_selected` |
| 聊天 4 | `chat_send` · `chat_get` · `chat_clear` · `chat_delete` |
| 用户·宏·文件 11 | `user_list` · `user_get` · `user_create` · `user_update` · `user_delete` · `macro_list` · `macro_execute` · `execute_js` · `structure` · `file_system` · `file_upload` |
| 声音·世界 10 | `playlist_list` · `playlist_play` · `playlist_stop` · `playlist_next` · `playlist_volume` · `play_sound` · `stop_sound` · `world_info` · `get_folder` · `player_list` |
| 本地知识 2 | `foundry_reference`（内置 dnd5e 5.3.3 结构模板+效应配方，14 主题，零 HTTP 秒回省 token）· `foundry_knowledge`（按需读你本地 FVTT 资料库：血泪教训/data-dict/图标真源/世界宏金标准，query 定位+分页） |

每条工具的中文 `description` 就是 AI 调用时看到的说明书，里面写进了实测踩坑总结的死规则：

- **世界包的怪：search → import_entity → place_token，禁止新建**（新建丢汉化/数值/特性）
- **dnd5e 5.3.x 伤害骰必须放 `damage.base{number,denomination,bonus,types}`**，`parts[].formula` 会被系统清洗
- **用户说「放地图上」未指定场景 → 先 `get_scene(active=true)`**，place_token 不传 sceneId 即默认激活场景
- **写操作带回读确认**：模块端偶发 fromUuid 回读误报，工具会识别特征并返回 `verified:true`
- **删除/清空/任意 JS 执行前必须与用户确认**
- **建物品/加自动化前先 `foundry_reference{topic}` 查内置模板**，别拉完整样本怪照抄（一次几十 KB token）；覆盖不到的深层问题（复杂 flags/宏/陷阱/光环/图标）先 `foundry_knowledge` 查资料库，**0 实例的键名禁用**
- `update_entity`/`get_entity` 支持内嵌物品 uuid `Actor.<actorId>.Item.<itemId>`（改物品自动化不用 execute_js）

## 配置

插件配置优先读 `~/.dsh/dsh-foundry-vtt/config.json`（与插件目录分离，重装 DSH 不丢），
兜底环境变量 `FOUNDRY_RELAY_URL` / `FOUNDRY_API_KEY` / `FOUNDRY_CLIENT_ID`，再兜底 `http://localhost:3010`。

```json
{
  "relayUrl": "http://localhost:3010",
  "apiKey": "<relay 的 scoped API key（64 位 hex）>",
  "clientId": "<模块配对后的 clientId，如 fvtt_xxxxxxxxxxxxxxxx>",
  "knowledgeDir": "C:\\Users\\<你的用户名>\\Desktop\\智能体\\01_跑团工具\\FVTT技术资料"
}
```

> 文件必须 UTF-8 无 BOM。`knowledgeDir` 指向你的 FVTT 资料库根目录（foundry_knowledge 用它按需读血泪教训/数据字典/图标真源），不填走默认路径。

## 构建 / 装配

```powershell
# ① 编译（无 DSH 源码 checkout 时用 npm 的 tsc）
npm install --no-audit --no-fund
.\node_modules\.bin\tsc.cmd -p tsconfig.json   # 产出 lib/

# ② 装配进 DSH profile（用 dsh-super-injector 的 dev_install_package，免重启+重启持久）
```

完整部署流程（relay 编译、模块配对、API key、验证、踩坑大全）见 [../docs/部署教程.md](../docs/部署教程.md)。

## 有意不包的端点（诚实账）

relay openapi 共 106 端点，包了 86 个数据工具，另加 2 个本地知识工具（`foundry_reference` 内置模板 + `foundry_knowledge` 资料库检索），共 88 个。剩下 20 个端点有意不包：auth/key-request 4 个（密钥管理不交给 AI）、SSE 订阅流 6 个（指令驱动，不做监听）、headless session 4 个（与 GM 浏览器架构冲突）、截图/下载 3 个（二进制，JSON 通道装不下）、deprecated 1 个。

## 许可

BSD-3-Clause。底层协议与 `foundry-rest-api-mcp-server` 一致（x-api-key + clientId + 信封），后者为 MIT。
