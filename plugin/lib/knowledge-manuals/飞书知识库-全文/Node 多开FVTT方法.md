# Node 多开FVTT方法

<readonly-block href="https://player.bilibili.com/player.html?bvid=1xSpbekE57" type="iframe"></readonly-block>

1. 安装Nodejs 22
2. 安装Node版本的FVTT
3. 创建不同FVTT需要的数据文件夹
4. 创建启动脚本
5. 创建位于桌面的启动快捷方式

## Nodejs下载地址

<bookmark name="下载 | Node.js 中文网" href="https://nodejs.cn/download/"></bookmark>

## FVTT下载地址

需登录，记得下Node版本，是个压缩包不是exe

![图片展示的是Foundry Virtual Tabletop Software的下载页面。页面上方显示“Download Foundry Virtual Tabletop Software”。下方有“Download Version”下拉框，当前选中“Release 13.351 (Build 351)”。在“Operating System”下拉框中，突出显示了“Node.js”。页面底部有“TIMED URL”和“DOWNLOAD”按钮。该图片与文档中“安装Node版本的FVTT”步骤相关，用于说明在下载FVTT时需选择Node.js操作系统版本。](https://feishu.cn/file/RtW1bi7OsohS8lxev9bcWgFtnnh)

## FVTT运行脚本

node main.js --dataPath=【FVTT数据路径】 --port=【运行的端口号】

**FVTT数据路径：**是FVTT数据文件存放的位置。

**运行的端口号：**是FVTT运行的端口号，也是访问时需要的`ip:端口`中要填写的端口。