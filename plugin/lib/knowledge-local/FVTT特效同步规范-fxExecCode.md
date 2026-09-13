# FVTT 特效同步规范（fxExecCode 模板）

> 核心问题：DOM 特效（canvas filter、div 粒子、字幕、覆盖层）只在 GM 本地浏览器生效，玩家端看不到。
> 解决办法：用 `game.socket.emit` 广播特效代码，玩家端通过 world scripter 里的 `fxExecCode` 监听执行。

---

## 一、前提：world scripter 里加这段（一次性，加完一劳永逸）

```javascript
// 通用跨端代码执行（GM 广播任意代码给所有客户端，用于特效同步）
game.socket.on("module.your-dm-toolkit", (data) => {
    if (data?.action !== "fxExecCode") return;
    try { new Function(data.code)(); } catch (e) { console.error("fxExecCode 执行出错", e); }
});
```

通道名 `module.your-dm-toolkit` 是已验证可用的（传送门/附身符/YGM 同通道）。

---

## 二、关键原则

| 特效类型 | 是否自动同步 | 处理方式 |
|---|---|---|
| **Sequencer 特效**（effect / canvasPan / sound / text） | ✅ 自动同步 | GM 端 `seq.play()` 即可，不要广播 |
| **DOM 特效**（canvas filter / div 粒子 / 字幕 / 覆盖层） | ❌ 不同步 | 抽成自包含函数，`fxExecCode` 广播 |
| **actor 数据变化**（变形 / 换形态 / 属性） | ✅ 自动同步 | GM 端操作即可 |

---

## 三、特效宏模板（纯 DOM 版）

```javascript
(async () => {
    if (!game.user.isGM) return ui.notifications.warn("⚖️ 此宏仅限 GM 运行！");

    // 特效函数：完全自包含，不引用外部变量（token 等用参数传入）
    function fxEffect(param) {
        // ... DOM 特效逻辑（document.createElement / board.style.filter / setTimeout）...
    }

    // 函数转字符串广播给所有客户端
    const code = "(" + fxEffect.toString() + ")(" + JSON.stringify(param) + ");";
    game.socket.emit("module.your-dm-toolkit", { action: "fxExecCode", code });

    // GM 本地也执行
    fxEffect(param);
})();
```

## 四、特效宏模板（混合版：DOM 广播 + Sequencer 自动同步）

```javascript
(async () => {
    if (!game.user.isGM) return ui.notifications.warn("⚖️ 此宏仅限 GM 运行！");

    // DOM 部分（canvas filter 等）抽成函数广播
    function fxFilter() {
        const board = document.getElementById("board");
        // ... canvas filter 时序 ...
    }
    game.socket.emit("module.your-dm-toolkit", { action: "fxExecCode", code: "(" + fxFilter.toString() + ")();" });
    fxFilter();

    // Sequencer 部分（自动同步，仅 GM 端播放）
    const seq = new Sequence();
    seq.effect()...; seq.canvasPan()...;
    await seq.play();
})();
```

---

## 五、铁律

1. **特效函数必须自包含**：所有辅助函数（sleep / makeDiv / spawnShards 等）定义在函数内部；token、src、name 等外部数据用参数传入（`JSON.stringify` 传参）。
2. **Sequencer 绝不广播**：`seq.play()` 只在 GM 端执行，Sequencer 自动同步，广播会导致双重播放。
3. **canvas filter 操作 `#board` 元素**：`document.getElementById("board")`，改完记得恢复原值（`origFilter`）。
4. **广播用 `game.socket.emit`**，不依赖 socketlib；玩家端靠 world scripter 的 `fxExecCode` 监听执行。
5. **GM 本地也要执行**：广播 + 本地执行要同时做，否则 GM 自己看不到。

---

## 六、已验证的特效宏清单

- 凯旋结算（开关式全端同步）
- BOSS 威压展示（出场）
- 斩杀特效（斩杀）
- 二阶段变形（黑白闪屏部分）
- 时停慢镜
- 血红斩击
- 英雄觉醒爆种
- 牺牲陨落
