<title>Linux（Ubuntu）安装FVTT</title>

# **前置要求**

由于FVTT版本迭代，FVTT V13.X必须被安装在node.js 18.x以上的环境中才能正常运行，而node.js 18.x以上又刚需Ubuntu 20.x以上的Linux系统，虽然这个刚需可以被解决，但是要是从这里开始讲起的话也未免太麻烦了，因此请先确保自己的Ubuntu系统版本在20.x以上。



# **登录与远程**

鉴于可能有小白是第一次接触Linux系统，因此从盘古开天地开始讲起。

首先在购入服务器之后，你会获得三个东西——用户名、密码、端口。

![图片展示的是服务器登录信息界面。上方有“登录信息”及一个蓝色的“重置密码”按钮。下方显示用户名名“root”，密码部分被蓝色遮挡处理，端口也用灰色遮挡。该图片与文档中“登录与远程”部分内容相关，对应购入服务器后获得的用户名、密码、端口等登录信息，帮助用户了解如何登录服务器。](https://feishu.cn/file/O1fvboc1Ro3yI6xU3eYcCCODnAe)

无论你是从哪个平台购买的服务器，它都一定会给你提供一个远程链接到服务器的功能，也可以是VNC。

![图片展示了服务器购买信息界面，其中“VNC”按钮被红色框线突出显示。该图片对应文档中“登录与远程”部分，用于说明从哪个平台购买的服务器，都会提供一个远程链接到服务器的功能，也可以是VNC。图片直观呈现了VNC按钮的位置，帮助用户理解在远程到服务器后，界面应呈现的样式，辅助小白用户更好地进行后续操作。](https://feishu.cn/file/WU6SbVltTo07jlxThpRcVHWgnLe)

在你远程到服务器上后，你的界面应该是这样的。

![图片展示的是Ubuntu 22.04 LTS系统登录界面。界面上方显示“Ubuntu 22.04 LTS tsy1270 tty1”，下方提示“tsy1270 login: _”，表明当前系统版本为22.04 LTS，登录用户为tsy1270，当前处于tty1终端。该图片与文档中“登录与远程”部分内容相关，用于说明在购入服务器并远程到服务器后，界面应呈现的登录状态，帮助小白了解Linux系统登录界面的基本情况。](https://feishu.cn/file/IPNwb4wq8oeq2jxPgdZc3TgBnCc)

这代表着你的服务器在等待你登录。

先输入用户名root，随后回车，你会看到这样的字符。

![图片展示的是Ubuntu 22.04 LTS系统登录界面。界面上方显示“Ubuntu 22.04 LTS tsy1270 tty1”，下方提示“tsy1270 login: root”，并要求输入“Password:”。这与文档中“前置要求”部分的内容相关，说明在Ubuntu系统中输入密码登录root账号的操作步骤，是后续进行服务器管理等操作的前提。](https://feishu.cn/file/GUOob8Y5Vo7c0OxifP8ceh8On4c)

此时你需要密码，然后你可能会发现，欸我输入密码怎么没有反应啊，输入不进去。

**其实不是这样的**，这里只是将你输入的内容隐藏了，你只需要输入密码然后回车就行，如果你的账号密码都正确，登录成功后你应该会得到这样的字符串。

![图片展示的是Linux系统下Ubuntu服务器的命令行界面。界面上方显示“root@tsy1270:~#`，表明当前用户为root，登录的主机名为tsy1270，当前目录为用户主目录。该图片与文档中“前置要求”部分相关，用于说明在输入密码登录成功后，会得到类似此界面的字符串，且此时可以随意输入文本，代表登录成功，之后每次重启服务器开机时需重复此登录操作。](https://feishu.cn/file/DPIybWs0Moy6Uuxts2rcomn0neg)

可能略有不同，但一般都是以:\~#结尾，并且此时你可以随意输入文本了，这就代表你成功登录了，之后你每次重启服务器之后在开机的时候都需要重复一次登录的操作才能进行服务器的管理。



# **服务器环境配置**

确保自己是root用户，接下来我们开始安装FVTT所需要的前置环境，直接一行行复制粘贴回车即可，不需要额外操作

1、node.js

执行

`curl -sL ``https://deb.nodesource.com/setup_24.x`` | sudo bash -`

执行完毕后，如无报错，继续执行

`sudo apt install -y nodejs`

执行完毕后，输入`nodejs -v`，如果返回的结果类似如图所示，就代表安装成功了

![图片展示了在Linux（Ubuntu）系统中检查nodejs版本的命令执行结果。命令为`nodejs -v`，执行后返回版本号`v24.12.0`。该图片与文档中“服务器环境配置”部分的node.js安装步骤相关，用于验证node.js安装成功，若返回类似结果则代表安装成功。](https://feishu.cn/file/SL75btbtjoB0ZhxVGUBcstFLngh)



2、libssl-dev

执行

`sudo apt install -y libssl-dev`

无报错即成功



3、unzip

执行

`sudo apt install unzip`

执行完毕后，输入unzip -v，如果返回的结果类似如图所示，就代表安装成功了

![图片展示的是在Linux系统中unzip命令的执行结果。画面中列出了UnZip的特殊编译选项，如ACORN_FTYPE_NFS、COPYRIGHT_CLEAN等，以及UnZip和ZipInfo环境选项，如UNZIP、UNZIPOPT等，均显示为\[none\]。该图片与文档中“服务器环境配置”部分的“unzip”安装步骤相关，用于验证unzip安装成功，执行unzip -v后应类似此结果。](https://feishu.cn/file/CmI3bwy3soqJt9xJS6Ac2cVcn9f)



4、pm2

执行`npm install -g pm2`

无报错即成功



# **FVTT下载与安装**

此步之前确认你已经购买了FVTT，来到下载页面，系统选择Linux，不要直接下载，点击旁边的TIMED URL，这会让你复制一个临时的下载链接

![图片展示的是FVTT（Foundry Virtual Tabletop）购买软件许可证页面。页面上方显示“Purchased Software Licenses”。下方有“Download Foundry Virtual Tabletop Software”标题，提示仅可查看自己看到此页。页面中有“Download Version”和“Operating System”下拉菜单，当前“Operating System”选中“Linux”。还有“TIMED URL”和“DOWNLOAD”按钮，其中“TIMED URL”被红色框突出显示。该图片与文档中FVTT下载与安装步骤相关，对应文档中“来到下载页面，系统选择Linux，不要直接下载，点击旁边的TIMED URL，这会让你复制一个临时的下载链接”这一操作步骤。](https://feishu.cn/file/CyUVbByNNoD9tkxArJzcOp4Pnyf)

回到服务器，执行

`mkdir foundryvtt`

执行后没有反应是正常的，继续执行

`mkdir foundrydata`

执行后也会没有反应，随后我们执行

`cd foundryvtt`

此时，你的输入光标前面的字符串会变成这样

![图片展示了在Linux（Ubuntu）系统中安装FVTT时，执行命令后的服务器界面。输入光标前面的字符串为“root@tsy1270:~/foundryvtt#”，表明当前用户是root，工作目录为“~/foundryvtt”，光标位于命令行提示符后。该图片与上文“FVTT下载与安装”步骤相关，是在执行`wget -O foundryvtt.zip 你从下载页面复制的TIMED URL`命令后，服务器开始下载FVTT压缩包前的界面展示，用于说明操作环境。](https://feishu.cn/file/K2U3b7PkIo6yG8x4y9ycT9Xhn2c)



现在，执行下面的命令

`wget -O foundryvtt.zip 你从下载页面复制的TIMED URL`

此时，你的服务器就会开始下载FVTT压缩包，在下载完成之后，执行以下命令进行解压

`unzip foundryvtt.zip`

解压完毕后，输入`ls`，如果像这样有着各种杂七杂八的文件就代表解压基本没问题了

![图片展示了在Linux系统中FVTT安装完成后，执行`ls`命令的终端界面。界面上显示了多个文件和文件夹，其中“LICENSE.electron.txt”“LICENSES.chromium.html”“LICENSES.chrome-sandbox”等文件以绿色高亮显示，表明它们是系统文件。此外，“resources”“locales”等文件夹也以绿色突出显示。该图片与上文FVTT安装步骤相关，用于验证解压完成后文件的正确性，若出现各种杂七杂八的文件，即代表解压基本没问题。](https://feishu.cn/file/LNQNbosBJoPrHaxXpiJclFtvnWg)

自此，FVTT就算安装完成了



# **FVTT的运行与PM2**

要运行FVTT，你得对外开放一些端口，如果有各种安全考虑，那么请自行酌情开放，如果你完全不理解什么是端口，你也可以全部打开

你购买服务器的平台的管理页面一般会有类似于「安全组」「防火墙」这样的设置，打开它，新增策略，如果需要选择【出】或者【入】，那么请选择【入】，协议选择全部，端口范围如果你想全部打开那就直接输入1-65535，否便输入自己需要开放的端口，如果需要填写授权IP，就填写【0.0.0.0/0】

FVTT默认使用的端口号是30000



现在，我们可以开始运行你的FVTT了

执行以下命令

`node resources/app/main.js --dataPath=$HOME/foundrydata`

如果等待一段时间之后，你能看见（类似）以下信息，恭喜你，你运行成功了！

![图片展示的是在Linux（Ubuntu）系统中运行FVTT时的终端输出信息。显示了FVTT的版本号、运行在Node.js版本、加载数据路径等信息，还列出了Application Options，如port、upnp、fullscreen等选项的设置情况。最后有“Software license requires signature.”的警告提示。该图片与文档中“FVTT的运行与PM2”部分内容相关，用于说明在执行指定命令后，若能看见类似此信息，即表示FVTT运行成功。](https://feishu.cn/file/MzW6bDLhIo7zjsxlpYDcVP39nyf)

此时，通过在你的本地浏览器输入你的服务器IP地址:30000，你应该就能够进入FVTT的界面并进行配置了

但还没完，你还有最后一件事情要做，现在，回到你的服务器，键盘输入ctrl+c终止FVTT服务。

执行

`pm2 start foundryvtt/resources/app/main.js`

如果你能看见以下信息，恭喜你，你已经完成了安装的全部步骤！现在，继续研究FVTT怎么用吧（？）

![图片展示的是Linux（Ubuntu）安装FVTT后执行`pm2 start foundryvtt/resources/app/main.js`指令后的运行结果。画面中显示“Starting /root/foundryvtt/resources/app/main.jsjsjs3](https://feishu.cn/file/EbwVbbRoGoD4vgxIycGcdXJXnqe)

此时，只要你的服务器不关闭，你随时都可以通过你的服务器IP地址:30000来进入FVTT，你还可以通过在FVTT的设置里将端口号从30000修改为80，来让你只需要输入服务器IP地址就能进入FVTT，不需要后面的端口号，但这就是可选项了。



如果之后你重启了服务器，需要重新启动FVTT，继续使用上面这条指令即可。

祝你使用愉快喵



# **附加项：Winscp**

考虑到有一些资源你不能从FVTT本身的MOD下载里获取到，你需要从本地下载或者从群聊中下载再放到FVTT的Module中来进行安装——而

而大伙都觉得小白应该不知道如何将mod文件从本机上传到Linux服务器，所以有了这个附加条目

Winscp是一个非常方便的Linux远程图形化文件管理器，它是免费的，你可以从官网直接下载它

下载链接：`https://winscp.net/eng/index.php`（不要问我怎么下载噢）

使用教程：`https://zhuanlan.zhihu.com/p/1949861979310265239`

需要注意的是，链接配置中的端口需要输入你购入服务器的平台中给予你的那个端口号，即：

![图片展示的是Linux服务器登录信息界面。上方显示“登录信息”及一个蓝色的“重置密码”按钮。中间部分有用户名“root”，密码部分被蓝色遮挡处理，端口也用灰色遮挡。该图片与文档中介绍Linux服务器登录信息的内容相关，用于说明在使用Winscp等工具将mod文件从本机上传到Linux服务器时，需输入的登录信息，如用户名、端口等，端口需输入购入服务器平台给予的端口号。](https://feishu.cn/file/Jbotb9n0Mo7uOAxOyHbceKeHn9b)

这个的端口，文件协议选择SFTP，链接成功后，就可以非常方便的从本机往Linux服务器上上传文件了

具体的Mod安装方法，请参考：

<cite doc-id="TatpwFDdQiAEzekbIuFcfOTDnUh" file-type="wiki" title="手动安装教程" type="doc"></cite>