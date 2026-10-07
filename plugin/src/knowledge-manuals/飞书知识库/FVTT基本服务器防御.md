# FVTT基本服务器防御

没有不可攻克的防御，但简单的办法就可以极大拉高攻击成本接近完美防御。

1. 为服务器登陆、fvtt管理员、GM账户设定高强度复杂密码，PL账户可设定简单密码私发玩家。

<bookmark name="安全、强大的密码生成器 | 1Password" href="https://1password.com/zh-cn/password-generator"></bookmark>

1. 点击主界面右上角的齿轮图标开启设置界面，默认的**`30000`**端口换成`10000-65535`内的随机端口号，并记得同步修改服务器防火墙的配置。之后的访问地址为`http://IP``:新端口号`。

   ![这张图是FVTT基本服务器防御流程中对应端口设置的界面截图，界面处于服务器配置板块，当前显示默认端口为30003，右侧“Enable UPnP”选项已勾选，界面下方文字说明该端口是供Foundry Virtual Tabletop进行TCP连接通信使用的，且可选择启用或禁用通用即插即用功能，该界面内容和文档中关于将FVTT默认端口修改为10000-65535内随机端口并同步调整防火墙配置的要求直接对应，展示了FVTT服务器端口设置的相关操作界面。](https://feishu.cn/file/Alnob8HDXo6ifUxVzTocaaHUnyf)

**确保只将FVTT地址私发给PL，不要公开暴露。**

1. 定期备份，只需关闭fvtt后复制world即可，也可以使用fvtt内置备份功能。
2. 更强大的变更远程端口防护参考

<bookmark name="基本FVTT服务器防护" href="https://www.peatsuki.com/018.html"></bookmark>