# Foundry VTT 地图加载问题排查手册（v13）

> 记录于 2026-08，案例：背景图"突然消失"、保存场景报 `width/height must be a positive number`、大图卡死 98.46%。
> 服务器：`http://146.56.232.12:30000`（华为云），客户端：FLC 4.5.0 / Edge。

---

## 一、症状清单（可能同时出现多个）

| 症状 | 含义 |
|---|---|
| 保存场景报 `width: must be a positive number` / `height` 同样 | 场景宽高为 0（背景图读不到 → 尺寸算不出；或新建场景没填尺寸） |
| 背景图突然"没了"，画布纯灰但有网格和 Token | 背景纹理加载失败，场景数据通常完好 |
| 控制台 `Loaded xxx.jpg (98.46%)` 后卡住 | 文件传输中断，卡在接近 100% |
| 切场景 2-3 次后突然恢复 | 资源加载并发高峰失败后不重试，切换时重新加载成功 |
| 放多久都不出来 | 失败后不会自动重试 |
| 新建场景也报 width/height 错 | 选图后尺寸读不出（图加载失败），或没填宽高就保存 |
| 只有某个世界出问题，其他世界正常 | 该世界有大文件（巨型图/大视频），非全局问题 |

---

## 二、排查顺序（从快到慢，逐层排除）

### 1. 服务器文件层（30 秒）

用 **curl**（不走系统代理，结果可信）：

```powershell
# 状态码：200 正常，404 文件丢
curl.exe -s -o NUL -w "%{http_code}`n" "http://服务器:端口/路径"

# 文件大小
curl.exe -s -r 0-0 -D - -o NUL "http://服务器:端口/路径"
# 看返回里的 Content-Range: bytes 0-0/文件字节数

# 下载速度（判断是否带宽问题）
curl.exe -s -o NUL -w "%{speed_download} 字节/秒`n" "http://服务器:端口/路径"
```

### 2. 场景数据层（浏览器 F12 控制台）

```js
// 全部场景数据体检
console.table(game.scenes.map(s => ({名称:s.name, 宽:s.width, 高:s.height, 背景:s.background?.src||"无"})))

// 单场景
const s = game.scenes.active;
console.log(s.name, s.background?.src, s.width, s.height);
```

**判断**：宽高全正数 + 背景路径在 = 数据没坏，问题在客户端。

### 3. 浏览器加载层

```js
// 直接测试能否加载（带时间戳绕缓存）
const img = new Image();
img.onload = () => console.log("✅", img.naturalWidth + "x" + img.naturalHeight);
img.onerror = () => console.log("❌ 加载失败");
img.src = "/背景路径?" + Date.now();
```

```js
// 检查画布背景纹理状态
const t = canvas.primary?.background?.texture;
console.log("valid:", t?.valid, "| 尺寸:", t?.baseTexture?.width + "x" + t?.baseTexture?.height);
// valid:false + 0x0 = 纹理没加载进来
```

```js
// 检查 GPU 纹理上限（判断是否超大图）
const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
console.log("MAX_TEXTURE_SIZE:", gl.getParameter(gl.MAX_TEXTURE_SIZE));
// 常见 8192 / 16384。图宽超过它 = 纹理非法
```

### 4. ⭐ 无痕窗口对比（决定性一步）

**Ctrl+Shift+N** 无痕窗口访问服务器，直接进问题场景：

- **无痕好、正常坏** → 问题在浏览器本地状态（缓存/Service Worker/扩展/代理），服务器无罪
- **无痕也坏** → 客户端渲染或服务器问题

### 5. ⭐ 系统代理检查（本次真凶藏身处）

```powershell
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select ProxyEnable, ProxyServer
```

**关键判断**：`ProxyEnable: 1` 且 `ProxyServer: 127.0.0.1:某端口`，而那个端口没服务在听 → **代理软件退出但系统代理残留**。

```powershell
Test-NetConnection 127.0.0.1 -Port 12000   # TcpTestSucceeded: False = 死代理
```

> **死代理是隐形杀手**：浏览器流量全走死端口，大文件下载中断在 98%，小文件碰巧能过，curl 不走代理所以永远正常，无痕窗口测试时碰巧成功——一切"时好时坏"的诡异现象都能解释。

**修复**：Windows 设置 → 网络和 Internet → 代理 → 关闭"使用代理服务器"；或代理软件里彻底恢复系统设置。改完**完全重启浏览器**。

### 6. FLC 客户端专属（Foundry Lightweight Client）

FLC 是 WebView2 封装，缓存目录：
```
C:\Users\<用户>\AppData\Local\com.phenomen.flc\EBWebView\Default\Cache
```

**清理注意**：PowerShell `Remove-Item` 删不掉（文件锁），用 cmd 反而行：
```powershell
cmd /c rd /s /q "C:\Users\...\EBWebView\Default\Cache"
```
（必须完全退出 FLC 再删。）

FLC 4.5.0（2023-12）内核老旧，v13 环境下各种怪问题——**能换 Edge/Chrome 就别用 FLC**。

---

## 三、本次案件完整根因链

1. **表因**：大背景图（森林小路 19.7MB / 9600×14400，洞穴 17.7MB，龙巢 webm 17.9MB）+ 服务器 4MB/s 带宽 → 传输 5 秒级，易被并发加载（65 个资源同时请求）挤断；
2. **真凶**：代理软件关闭后残留 `127.0.0.1:12000` 死代理 → 浏览器大文件下载卡 98.46% 永不完成；
3. **帮凶**：多个模块在 v13 下崩溃（token-variants 挂场景配置表单、dicemega 挂切场景、sgeh 挂聊天渲染）→ 干扰排查、拖慢界面；
4. **背景风险**：Foundry 自动备份目录一直无效（"指定的备份目录无效！没有进行备份！"）→ 出事没有退路。

---

## 四、解决方案汇总（可复用）

### A. 场景保命修复（控制台）

```js
// 单场景救活（宽高写死正数，数据都在）
game.scenes.get("场景ID").update({ width: 100, height: 100 });

// 按名批量修复所有场景
(async () => {
  for (const s of game.scenes) {
    if (s.width > 0 && s.height > 0) continue;
    await s.update({ width: 100, height: 100 });
    console.log("修复:", s.name);
  }
  console.log("完成，请 F5");
})()
```

### B. 一键重载背景宏（临时急救）

```js
(async () => {
  const s = game.scenes.active;
  if (!s?.background?.src) return ui.notifications.warn("无背景图");
  const tex = await foundry.canvas.loadTexture(s.background.src);
  canvas.primary.background.texture = tex;
  ui.notifications.info("背景已重载");
})()
```

### C. 新建场景报错的绕过

新建场景时**手动把 Width/Height 填正数**（如 50×50）再保存；或先选背景图让尺寸自动填充。

### D. 大图治本：缩小（推荐 ≤ 4096px 宽）

服务器上有 ffmpeg（Linux）：
```bash
ffmpeg -i 原图.jpg -vf "scale=4096:-2" 小图.jpg
```

本地 Windows（无 ffmpeg 时用 GDI+）：
```powershell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("原图.jpg")
$w = 4096; $h = [int]($img.Height * $w / $img.Width)
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($img, 0, 0, $w, $h)
$bmp.Save("小图.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
```

### E. 视频背景压缩（ffmpeg）

```bash
# 高质量、半分辨率（注意宽高必须偶数！奇数会报 Conversion failed）
ffmpeg -y -i 原.webm -vf "scale=-2:3150" -c:v libx264 -crf 23 -preset medium \
  -maxrate 2500k -bufsize 5000k -pix_fmt yuv420p -an -movflags +faststart 新.mp4

# -movflags +faststart 必须加：moov 前置，浏览器才能流式播放
# 网格尺寸 = 新图宽 ÷ 原格数（例：2024÷40格 ≈ 51）
```

### F. 缩图/新文件替换场景（控制台一键）

```js
// 上传（弹窗选本地文件，target 为服务器目标目录）
const input = document.createElement('input');
input.type = 'file';
input.onchange = async () => {
  const file = input.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('target', 'data/地图');
  const r = await fetch('/upload', { method: 'POST', body: fd });
  console.log(r.status, r.ok ? "✅ " + file.name : await r.text());
};
input.click();

// 场景指向新文件（中文文件名要 URL 编码；grid.size 按新图宽÷格数）
await game.scenes.getName("场景名").update({
  background: { src: "%E5%9C%B0%E5%9B%BE/文件名编码.jpg" },
  grid: { size: 43 }
});
```

---

## 五、模块健康检查（v13 环境下）

日志里的 `[Detected N package: xxx]` 报错 = 崩溃模块，直接禁用：
- **token-variants** → 挂 renderSceneConfig（场景配置表单打不开的元凶）
- **dicemega** → 挂 updateScene（每次切场景崩溃）
- **sgeh-monkeydm** → 挂 renderChatLog（聊天渲染报错）

无害噪音（不用管）：满屏 `Deprecated since Version 13`、`ComfyUI service is not running`、`Plutonium 404`、Babele no translation。

---

## 六、预防清单

1. **背景图 ≤ 8192px 宽**（理想 4096），文件 ≤ 10MB；
2. 视频背景 ≤ 10MB，转码时加 `-movflags +faststart`，宽高取偶数；
3. **代理软件退出后检查系统代理设置**（Windows 设置 → 代理 → 确认关闭）；
4. **修复备份目录**：设置 → 系统设置 → Backup Folder 指向真实可写目录——这是保命符；
5. 客户端优先用 Edge/Chrome，FLC 仅作低配备用且及时更新；
6. 模块能少装就少装，每个模块都是 v13 的潜在雷；
7. 重要操作前 `console.table(game.scenes.map(...))` 备份场景数据快照。

---

## 七、一句话总结

> 背景空白先查三件事：**系统代理残留（最阴险）、文件大小 × 带宽（最常犯）、崩溃模块（最吵）**。
> 服务器数据九成没坏——用 curl 验证文件、用 console.table 验证数据，别急着修服务器。
