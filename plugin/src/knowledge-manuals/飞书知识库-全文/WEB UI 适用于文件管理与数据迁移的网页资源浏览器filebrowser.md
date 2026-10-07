# WEB UI 适用于文件管理与数据迁移的网页资源浏览器filebrowser

![图片展示了FileBrowser网页资源浏览器的界面。左侧有“admin”用户信息及“我的文件”“新建文件夹”“新建文件”“设置”“登出”等选项。右侧显示了多个文件和文件夹，如“IVBS_FILE!”“CHANGELOG.md”“filebrowser.db”等，其中“filebrowser.exe”文件大小为34.34 MB，“LICENSE”文件大小为11.09 KB，“README.md”文件大小为2 KB，“run.bat”文件大小为30 B。界面底部显示“221 GB of 244 GB used”。该图直观呈现了FileBrowser的文件管理界面，与文档中介绍其可方便管理FVTT目录下文件的内容相契合。](https://feishu.cn/file/NnKubbMc3olDdcxLW8vcHkEpnPf)

<figure view-type="Card"><source name="windows-amd64-filebrowser.zip" mime="application/x-zip-compressed" size="15042683" token="OgBbbTLJeoF01Nx0Cancg5qSnkh"/></figure>

**↑下载↑**

## 介绍

[**filebrowser**](https://github.com/filebrowser/filebrowser)**是一款将本地文件系统于网页管理的开源易用软件，如上，它可以非常方便地管理器FVTT目录下的文件，而不需要登录服务器。**

**此外，用于远程桌面链接的RDP协议对于传输大文件非常不稳定，这个软件就可以解决上传与下载大文件，尤其是压缩包报错的问题，有效适用于迁移、备份FVTT与安装大型MOD的情况。**

## 安装步骤

下载上述压缩包，解压。

![图片展示了FVTT的根目录`Data`下的文件列表。其中，“运行我.bat”文件被红色框线突出显示，其右侧有红色箭头指向，表明该文件是运行FileBrowser服务的关键。此外，还有`README.md`、`LICENSE`、`filebrowser.exe`和`CHANGELOG.md`等文件。该图片与文档中关于运行`运行我.bat`文件以开启FileBrowser服务的内容相关，直观呈现了操作前的文件状态。](https://feishu.cn/file/JydFb5miNoGFGwxAVivcokslnKb)

`运行我.bat`执行后，会默认在**8080**端口开启服务，请确保服务器防火墙已经放行。

将`运行我.bat`与`filebrowser.exe`放置于**FVTT的根目录**`Data`下，运行**.bat**文件，会出现一个黑色命令行窗口，保持开启即可，复制其中的密码。

![这张图片展示了FVTT的根目录Data文件夹的内容，包含多个文件夹、.bat、.exe、.json、.ogg、.webm等类型的文件。其中核心信息为`filebrowser.exe`文件，其大小为36.0MB，修改时间为2026年3月6日，图片中红色光标正指向该文件，契合将`filebrowser.exe`放置于FVTT根目录Data下的操作要求，是该文件管理工具部署流程中的目标文件展示。](https://feishu.cn/file/OeeBbuPcfoAUm2xieAGcht35nef)

![图片展示的是在命令行中运行`filebrowser -a 0.0.0.0 -p 8080`命令后的输出结果。其中，关键信息是“User 'admin' initialized with randomly generated password JHI0CHM9eb2ZQsjQ”，即管理员账户`admin`已使用随机生成的密码`JHI0CHM9eb2ZQsjQ`初始化。该图片与文档中“运行`运行我.bat`文件后，复制其中的密码”的内容相关，用于说明获取文件浏览器管理员密码的操作结果。](https://feishu.cn/file/OcGRbgkXnoEC3mx85vqcKUROnQh)

前往网址：`http://你的服务器IP:8080 `

输入账户密码

![图片展示的是File Browser的登录界面。界面上方显示网址为127.0.0.1:8080/login。中间有一个蓝色圆圈图标，内有蓝色圆点和白色圆点。下方有“File Browser”字样。输入框中显示用户名“admin”，密码部分以“*”显示。底部有一个蓝色的“登录”按钮。该界面与文档中“运行`运行我.bat`后，出现黑色命令行窗口，复制其中密码，前往网址`http://你的服务器IP:8080`输入账户密码，设定为中文界面，就可以随意管理文件了”的内容相关，是登录操作的展示。](https://feishu.cn/file/FFcZb6fHGoVcv6xJc2fcry2inyf)

设定为中文界面

![图片展示的是File Browser的Global Settings界面。左侧有admin、My files等导航栏。右侧“Global Settings”部分，有允许用户注册、创建新用户时自动创建用户主目录、隐藏登录按钮等选项，当前“隐藏登录按钮”被勾选。下方“Base path for user home directories”设置为“/users”，“Minimum password length”为12。右侧“User default settings”中，语言为English，权限设置中“Administrator”选项被勾选，可创建、删除文件和目录等。该界面与文档中设定中文界面的操作相关。](https://feishu.cn/file/NBjDb80gzokHVXxkCCDc7NFMnae)

就可以随意管理文件了，如同一个功能全面的小网盘

![图片展示的是FVTT文件浏览器界面。左侧有“admin”用户信息及“我的文件”“新建文件夹”“新建文件”“设置”“登出”等选项。右侧是文件管理区域，显示了“assets”“modules”“sound”等文件夹及“filebrowser.db”“p5weak.ogg”“运行我.bat”等文件，部分文件有图标标识，如“运行我.bat”有黄色箭头。该图与文档中介绍FVTT文件浏览器操作流程的内容相关，直观呈现了文件管理界面。](https://feishu.cn/file/NeqcbiZNzoLW9gxvYYXc8fw9nLd)