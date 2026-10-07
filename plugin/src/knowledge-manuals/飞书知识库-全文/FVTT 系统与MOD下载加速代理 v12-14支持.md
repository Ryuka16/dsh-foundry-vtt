<title>FVTT 系统与MOD下载加速代理 v12-14支持</title>

FVTT下载慢怎么解决？MOD与系统管理器打不开怎么解决？Time Out报错总是弹出？  
FoundryVTT 的 GitHub/GitLab 下载加速解决方案，包含后端代理服务器和客户端补丁，通过hook客户端源码重定向至公益镜像源，解决FVTT服务器部署在国内时无法打开内置系统与MOD管理器的速度，解决无法快捷更新、安装的问题。

本项目改进自 **@sora** 的原始程序。

本文转载自 <cite type="user" user-id="ou_cc45fe6b261d5de629ba4f2e5abe5d4f" user-name="星尘"></cite> 老师所撰写的Github说明，以下为原文地址：

<bookmark name="GitHub - kagangtuya-star/foundryvtt-packages-proxy: foundryvtt模组、游戏系统与世界的下载代理" href="https://github.com/kagangtuya-star/foundryvtt-packages-proxy"></bookmark>

<grid><column width-ratio="0.500000"><figure view-type="Card"><source name="FVTTv 14.358fix mod与系统下载加速补丁.zip" mime="application/x-zip-compressed" size="25054" token="KhTsbg2bBoUMRjxk0f8cB4oonMb"/></figure><figure view-type="Card"><source name="FVTTv 14.357fix mod与系统下载加速补丁.zip" mime="application/x-zip-compressed" size="15146" token="YhcYbqw6Io9gkGx8zR9caNAvn8d"/></figure><figure view-type="Card"><source name="FVTTv 14mod与系统下载加速补丁.7z" mime="application/x-compressed" size="14641" token="Ni9lbVu6JodwKUxf7XucWittnwb"/></figure></column><column width-ratio="0.500000"><figure view-type="Card"><source name="FVTTv 13mod与系统下载加速补丁.zip" mime="application/x-zip-compressed" size="19044" token="GyffbROTNo1xLWx4wSNcGj2xnQh"/></figure><figure view-type="Card"><source name="FVTTv 12mod与系统下载加速补丁.zip" mime="application/x-zip-compressed" size="28674" token="ZBu4bgbuzoelMkxmjB4cUHKznSc"/></figure></column></grid>

**注意，FVTT 14.357以上版本必须安装对应的fix版本补丁！严格对应版本号！！！**  
**否则模组管理器会无法加载分类内容或无法加载！！！**

## 目前只兼容FVTT v14、v13与v12！其他版本安装会正常启动但无法识别数据；注意选择正确的版本，版本错误会导致启动后无法读取数据！可卸载补丁(不是卸载FVTT)还原。

## 如何安装

1. 下载上述压缩包至服务器任意区域；
2. 解压缩包，进入文件夹；
3. 双击点击install.bat(Linux先赋权在运行sh脚本)，输入FVTT的**程序文件夹路径**(注意，是程序的目录文件夹，不是含Data的数据文件夹！也就是那个含有exe文件和许多dll/js文件的文件夹)

<callout emoji="❗">
右键桌面的FVTT快捷方式，选择属性，复制其中的起始位置就是**程序文件夹路径**
</callout>

![这张图片是Foundry Virtual Tabletop的属性窗口，展示了用于获取程序文件夹路径的界面，该路径是安装FVTT系统与MOD下载加速代理时需填写的内容。窗口中明确标注了“起始位置”栏，其内容为“C:\\Program Files\\Foundry Virtual Tabletop”，该起始位置即为所需的程序文件夹路径，与安装步骤中提及的“右键桌面FVTT快捷方式，选择属性后复制该路径”的操作要求完全对应，可帮助用户准确获取安装所需的程序目录路径。](https://feishu.cn/file/ZAk9biAyWoGoFnxmpLjcee1Tnff)

1. 回车继续运行，程序会自动备份源文件并打上补丁。



## 如何卸载

1. 同安装
2. 同安装
3. 双击点击uninstall.bat(Linux赋权再运行)，选择卸载与还原备份即可。



不想研究部署和原理不用看下面。

——————

# 服务端（自建，用户无需查看）

FoundryVTT 的 GitHub/GitLab 下载加速解决方案，包含后端代理服务器和客户端补丁。

## 功能特性

- ✅ GitHub/GitLab 代理 - 加速模组和系统下载
- ✅ 多代理自动切换 - 失败时自动尝试下一个代理
- ✅ 统一代理端点 - `/proxy/{url}` 同时支持 GitHub 和 GitLab
- ✅ FVTT API 缓存 - 30 分钟 TTL，减少 API 请求
- ✅ Docker 部署 - 一键部署
- ✅ HTTPS 支持 - 可配置 SSL 证书

## 快速开始

### 方式一：Docker 部署（推荐）

```Plain Text
# 1. 克隆项目
git clone <repo-url>
cd FVTT下载改进

# 2. 创建配置
cp config.example.yaml config.yaml
# 编辑 config.yaml 修改 publicUrl

# 3. 启动
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```



### 方式二：直接运行

```Plain Text
npm install
cp config.example.yaml config.yaml
npm start
```



## 项目结构

```Plain Text
├── server/                 # 后端服务器
│   ├── index.js           # 入口文件
│   ├── config.js          # 配置加载
│   ├── routes/
│   │   ├── api.js         # API 路由
│   │   ├── fvtt.js        # FVTT API 代理
│   │   └── proxy.js       # GitHub/GitLab 代理
│   └── utils/
│       ├── cache.js       # 缓存管理
│       └── logger.js      # 日志
├── client/                 # 客户端补丁
│   ├── package.mjs        # 替换 FVTT 的 package.mjs
│   └── views.mjs          # 替换 FVTT 的 views.mjs
├── config.example.yaml    # 配置模板
├── Dockerfile             # Docker 构建
└── docker-compose.yml     # Docker Compose
```



## 服务端 API

<sheet sheet-id="MtakZf" token="ApPGsbgJJh4Y2NtxZazcbNIqnZf"></sheet>

### 使用示例

```Plain Text
# 代理 GitHub 文件
curl https://your-server.com/proxy/https://github.com/user/repo/releases/download/v1.0/file.zip

# 代理 GitLab 文件
curl https://your-server.com/proxy/https://gitlab.com/user/repo/-/archive/main/repo-main.zip

# 健康检查
curl https://your-server.com/api/health
```



## 客户端配置

### 方式一：一键安装（推荐）

**Windows:**

```Plain Text
# 双击运行 install.bat，按提示输入 FVTT 目录
install.bat

# 或直接指定目录
install.bat "C:\Program Files\FoundryVTT"
```

Linux/macOS:

```Plain Text
# 添加执行权限
chmod +x install.sh

# 运行安装脚本
./install.sh /path/to/foundryvtt
```

**功能：**

- ✅ 自动搜索 FVTT 的 `dist/packages/` 目录
- ✅ 自动备份原文件（带时间戳）
- ✅ 从 `client.zip` 解压并安装补丁
- ✅ 安装完成后提示重启 FVTT

**卸载/恢复：**

```Plain Text
# Windows
uninstall.bat

# Linux/macOS
./uninstall.sh
```

### 方式二：手动配置

#### 修改客户端文件

解压 `client.zip`，编辑 `package.mjs` 和 `views.mjs` 顶部的配置区域：

```Plain Text
// ╔═══════════════════════════════════════════════════════════════╗
// ║                    手动配置区域 - 请在此处修改                  ║
// ╚═══════════════════════════════════════════════════════════════╝

const GITHUB_PROXIES = [
  "https://your-proxy.com/proxy/",
  "https://gh-proxy.com/",
  // 更多代理...
];

const GITLAB_PROXIES = [
  "https://your-proxy.com/proxy/",
];

// FVTT API 代理 (可选)
const FVTT_API_PROXY = "https://your-proxy.com/api/fvtt/packages";
```

#### 复制到 FVTT

将修改后的文件复制到 FVTT 安装目录：

```Plain Text
# Windows
copy package.mjs "C:\Program Files\FoundryVTT\resources\app\dist\packages\"
copy views.mjs "C:\Program Files\FoundryVTT\resources\app\dist\packages\"

# Linux/macOS
cp package.mjs /path/to/foundry/resources/app/dist/packages/
cp views.mjs /path/to/foundry/resources/app/dist/packages/
```

#### 重启 FVTT



## 服务端配置 (config.yaml)

```Plain Text
server:
  port: 3000
  host: "0.0.0.0"
  publicUrl: "https://your-server.com"

proxies:
  github:
    - "https://gh-proxy.com/"
    - "https://ghproxy.net/"
  gitlab:
    - "https://gitlab.com/"
  timeout: 10000

cache:
  enabled: true
  ttl: 1800  # 30 分钟

logging:
  level: "info"

cors:
  enabled: true
  origins: ["*"]
```



## Docker 部署

### docker-compose.yml

```Plain Text
version: '3.8'
services:
  fvtt-proxy:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./config.yaml:/app/config.yaml:ro
    environment:
      - HOST=0.0.0.0
    restart: unless-stopped
```



### 常用命令

```Plain Text
docker-compose up -d        # 启动
docker-compose down         # 停止
docker-compose logs -f      # 查看日志
docker-compose restart      # 重启
docker-compose build --no-cache  # 重新构建
```



## 反向代理配置 (Nginx)

```Plain Text
server {
    listen 443 ssl http2;
    server_name your-proxy.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 大文件传输
        proxy_buffering off;
        proxy_read_timeout 300s;
        client_max_body_size 0;
    }
}
```



## 注意事项

1. FVTT 更新 - FVTT 更新后需重新复制客户端文件
2. HTTPS - 生产环境建议使用 HTTPS
3. 服务器位置 - 建议部署在能快速访问 GitHub 的地区（如香港、日本、美国）
4. FVTT API 是 POST - `/api/fvtt/packages` 是 POST 请求，浏览器直接访问会 404