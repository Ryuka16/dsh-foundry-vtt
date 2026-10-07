# OOS（阿里云对象储存）链接FVTT

## 📌 前置参考

<blockquote><p>如需结合视频或详细文字教程，请点击下方链接。</p><p><b>有大佬写了更好的教程，可以参考这个：</b><b><cite doc-id="KryHwxkYhiXBhmkOGcmc0QUwnRc" file-type="wiki" title="Foundry VTT V13 接入阿里云 OSS（S3 云存储）教程" type="doc"></cite></b></p><ul><li><a href="https://www.bilibili.com/video/BV1S7421K7K2/?vd_source=eabbea4b9514f6b0856f064f2ee21a16">📺 银龙 视频教程</a></li><li><a href="https://www.peatsuki.com/015.html">📖 双月 博客说明</a></li></ul></blockquote>

---

## 🚀 第一步：创建存储桶 (Bucket)

1. 登录 [阿里云 OSS 控制台](https://oss.console.aliyun.com/bucket)。
2. 点击 **“创建 Bucket”**。
3. **关键参数配置指南：**

   - **Bucket 名称：** 建议使用小写字母、数字，例如 `my-fvtt-assets`。
   - **读写权限：** 建议设置为 `公共读` (Public Read)，否则 FVTT 里的图片可能无法正常加载。
   - **地域 (Region)：** 选择离你（或你的玩家）最近的地区，如 `华北2 (北京)`。

![创建bucket 公有读](https://feishu.cn/file/JohIbg3ECoICvFxF4ObcNWwfnff)

![创建完成](https://feishu.cn/file/CKl2bcfduo9j45xlwQJcdvHynZd)

💡 **专家建议：**

> 记录下你选择的“地域”，例如“华北2 (北京)”，对应的 Region 代码是 `cn-beijing`。

---

## ⚙️ 第二步：配置存储桶 (关键设置)

进入刚创建的 Bucket，请务必完成以下操作：

### 1️⃣ 打开公共访问以及设置跨域访问 (CORS)

> 由于 FVTT 会跨域请求 OSS 资源，必须开启 CORS 否则报错。

- **路径：** 数据安全 > 跨域设置 > 创建规则。
- **配置：**

  - 来源：`*`
  - 允许 Methods：全部勾选
  - 允许 Headers：`*`
  - 暴露 Headers：`ETag`

  ![图片展示了阿里云OSS控制台中“阻止公共访问”设置界面。左侧导航栏选中“阻止公共访问”，右侧显示“阻止公共访问”已开启，下方有“我确认关闭阻止公共访问”按钮。右侧弹出“确定关闭阻止阻止公共访问？”提示框，说明关闭阻止公共访问后，OSS建议开启，以降低数据被盗用和滥用风险，还提示ACL设置为私有或设置不包含公共的存储权限等注意事项，下方有“我确认关闭阻止公共访问”按钮。该图与文档中配置存储桶时需开启阻止公共访问的操作说明相关。](https://feishu.cn/file/PE8lbgWS7oklr9xihkCcl120nFh)

  ![图片展示的是阿里云OSS存储桶权限设置界面。左侧显示“阻止公共访问”和“读写权限”选项卡，当前选中“读写权限”。右侧弹出“确认选择公共读？”提示框，说明开启公共读权限可能产生额外公网流量费用，建议选择私有。框内有“选择私有”和“继续修改”按钮。该图片与文档中“打开公共访问以及设置跨域访问(CORS)”的操作步骤相关，用于说明开启公共读权限时的提示情况。](https://feishu.cn/file/Aw4tbGZGsoTwKGxs1R2cUtXZn4f)

  ![图片展示了在阿里云OSS中配置存储桶的“跨域设置”界面。左侧为Bucket列表，右侧是“跨域设置”弹窗，其中“创建规则”选项被选中。弹窗中“来源”设置为“*”，“允许Methods”全部勾选，包括GET、POST、PUT、DELETE、HEAD等，且“允许Headers”也设置为“*”。该图片与文档中“打开公共访问以及设置跨域访问(CORS)”的操作步骤相关，直观呈现了开启CORS时的配置要求。](https://feishu.cn/file/K2iSbvNNFoaw9dxlSFLcm671nXc)

---

## 🔑 第三步：获取endpoint，region以及AccessKey

为了 FVTT 能读取你的 OSS 空间，你需要生成一对身份验证密钥。

⚠️ **安全警告：**

> 绝对不要在任何公开群聊或 GitHub 分享你的 `secretAccessKey`！一旦泄露，他人可盗刷你的流量费。

- **获取路径：** 鼠标悬停控制台右上角头像 -> **AccessKey 管理**。
- **操作：** 创建一个 AccessKey，并立即复制下载保存。

  - `accessKeyId`: 相当于用户名
  - `secretAccessKey`: 相当于密码

  ![endpoint](https://feishu.cn/file/QYkTbM2JoorFd5xS8Mcc2Ixenvd)

  ![key1](https://feishu.cn/file/Z6t7bZrz1oaR3FxnB1HcjG4Sn4d)

  ![key2](https://feishu.cn/file/Zvvib6qKIomUitx8V7RcGPFHnFh)

  ![key3，下载你的keyID与Secret](https://feishu.cn/file/MUfUbkFx6oXxKPxtNOOciIvknfg)

---

## 🔗 第四步：在 FVTT 中配置 JSON

你需要编写一个 JSON 配置文件，并将其路径填入 FVTT 的 S3 配置项中。

### 1. JSON 配置模版

请复制下方代码，替换其中的 `【中括号】` 内容：

codeJSON

```Plain Text
{
    "endpoint": "https://【如oss-cn-beijing】.aliyuncs.com", 
    "credentials": {
        "accessKeyId": "【LTAI5t9xxxxxxxxxxxxxxx】",
        "secretAccessKey": "【xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx】"
    },
    "region": "【地区，如cn-beijing】"
}
```

### 2. 参数对应表

| **参数** | **获取说明** | **示例** |
|-|-|-|
| **endpoint** | 格式为 https://[地域节点].[aliyuncs.com](http://aliyuncs.com) | [https://oss-cn-beijing.aliyuncs.com](https://oss-cn-beijing.aliyuncs.com) |
| **accessKeyId** | 刚才保存的 API 密钥 ID | LTAI... |
| **secretAccessKey** | 刚才保存的 API 密钥 Secret | \*\*\*\*\*\* |
| **region** | 地域代码（不带 oss- 和 .[aliyuncs.com](http://aliyuncs.com)） | cn-beijing |

<grid>
<column width-ratio="0.279495">
![图片展示的是一个名为“ajson”的文件图标，图标上有类似文件夹的图案。该图片与文档中“创建一个json文件”步骤相关，可能是用于说明在云服务器上创建的json文件外观，文件名为“ajson”，位于C:\\Users\\Administrator\\Desktop路径下，用于后续上传至FVTT以配置OOS链接。](https://feishu.cn/file/ZSb7bEZQsoWIhzxS2ilc96evn6f)
创建一个json文件
</column>
<column width-ratio="0.720505">
![例](https://feishu.cn/file/XHx3bNIgmory30xFFWKczpw8nrd)
</column>
</grid>

### 3. 上传json文件到云服务器，调整FVTT设置

`C:\Users\Administrator\Desktop\a.json`

记住这个绝对链接，打开服务器界面-设置，往下滑，修改配置文件路径，保存

![图片展示了FVTT（Foundry Virtual Tabletop）应用配置界面中的AWS配置文件路径设置部分。红框突出显示了“AWS配置文件路径”及对应的绝对链接“C:\\Users\\Administrator\\Desktop\\a.json”。该图片与文档中“上传json文件到云服务器，调整FVTT设置”步骤相关，用于指导用户](https://feishu.cn/file/PSYJbWPkToAieAxjLNxcQ0JWnqf)

### 4. 大功告成

打开世界包，打开文件浏览器，发现多了一个Amazon S3的选项。

**注：**下图文件浏览器由 [Filepicker+](https://foundryvtt.com/packages/filepicker-plus) 提供。

![图片展示了FVTT（Foundry Virtual Tabletop）游戏平台中文件浏览器界面。左侧为游戏场景，右侧界面中“Amazon S3”选项被红框突出显示，下方“S3文件桶”处显示“harukacaiw99”，“显示模式”为网格。界面底部有“文件浏览器”图标被红框圈出。该图片与文档中“在FVTT中配置JSON”步骤相关，用于说明在完成配置后，打开世界包并打开文件浏览器时，会发现多出的Amazon S3选项，此图直观呈现了这一变化。](https://feishu.cn/file/WwOhbDD9GoDfMex3sPHcTu56ntb)