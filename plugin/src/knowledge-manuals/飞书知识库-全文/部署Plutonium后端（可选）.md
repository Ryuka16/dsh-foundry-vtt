# 部署Plutonium后端（可选）

在安装 Plutonium 之后，你可以通过修改 FVTT 内部文件来启用一下额外的功能，需注意，这将使得Plutonium可以访问或修改你的文件系统，以此来解决导入美术资源时的问题。



**部署后端并非必须的**！Plutonium的核心功能完全不依赖于后端，如果你对这一章节的安装教程有任何疑问，完全可以跳过这一步，访问下方英文Wiki来获取更多内容

<bookmark name="Plutonium" href="https://wiki.tercept.net/en/Plutonium"></bookmark>

<callout emoji="▶️">
部署后端无法通过Fvtt自动安装，需要手动修改Fvtt内部的文件
</callout>

<callout emoji="⛔">
部署后端可能会导致一下安全问题。请阅读Readme.md中的内容，并在深思熟虑后决定是否要部署后端。下文中会提及一部分常见的问题。
</callout>



## 安装后端组件

- 找到Data\modules\plutonium\server\\<FVTT版本>\plutonium-backend.mjs
- 拷贝此文件到Fvtt的FoundryVTT\resources\app 文件夹下
- 修改app文件夹下的main.mjs文件：

  - 先找到最后面的几行

```Plain Text
init.default({
    args: process.argv,
    root: root,
    messages: startupMessages,
    debug: isDebug
  })
})();
```

- 将这几行替换为以下内容

```Plain Text
await init.default({
    args: process.argv,
    root: root,
    messages: startupMessages,
    debug: isDebug
  });
  (await import("./plutonium-backend.mjs")).Plutonium.init();
})();
```

- 重启 FVTT server
- 确定是否安装成功：进入世界看左上角的logo是否变绿了

![图片展示了FVTT界面左上角的图标区域，其中“Plutonium Backend Mod Active: v0.7.5”图标被绿色圆圈突出显示。该图标位于多个图标中间，包括人物、地图、骰子等。此图与文档中“确定是否安装成功：进入世界看左上角的logo是否变绿了”内容相关，表明若Plutonium后端安装成功，左上角logo会变绿，此图直观呈现了这一变化。](https://feishu.cn/file/Dslqb2gA9o5oekxsZdqcYrqunJg)

每当Fvtt自动升级之后，app文件夹可能被重置，此时需要重新安装部署Plutonium后端。

安装完成后，即可启用美术资源浏览器等功能

![图片展示了FVTT界面中美术资源浏览器的使用情况。左侧为资源分类列表，如建筑、生物等。中间是资源展示区域，展示了不同类型的美术资源，如建筑、生物、物品等。右侧是资源详情区域，显示了选中资源的详细信息。该图片与文档中部署Plutonium后端后启用美术资源浏览器等功能的上下文对应，直观呈现了资源浏览器的界面和使用效果。](https://feishu.cn/file/CE9GbzU5MoLW8Kx7nQWcovNmnyb)

 

## 后端扩展组件

Plutonium提供了一系列后端扩展组件，如果你已经安装了后端，那么你可以装上这些扩展试试。

安装扩展组组件后记得重启 FoundryVTT



### 自定义Setup页面（首页）

此组件可以在Setup页面加载自定义的CSS样式和JavaScript脚本，这样你就可以添加一些额外的样式和函数。

**安装：**复制**plutonium-backend-addon-custom-setup.mjs**到app文件夹

**使用：**在Data文件夹（modules、systems和worlds所在的那个文件夹）里创建setup.css和setup.js，这些文件将在浏览器访问/setup页面时自动被自动加载

你可以在server/<FVTT版本>/custom-setup-samples文件夹中找到例子



### 自定义世界登录页面

此组件可以在世界登录页面加载自定义的CSS样式和JavaScript脚本，这样你就可以添加一些额外的样式和函数。

**安装：**复制**plutonium-backend-addon-custom-login.mjs**到app文件夹

**使用：**在Data文件夹（modules、systems和worlds所在的那个文件夹）里创建login.css和login.js，这些文件将在浏览器访问/setup页面时自动被自动加载

你可以在server/<FVTT版本>/custom-login-samples文件夹中找到例子



### Electron 组件

**plutonium-backend-addon-electron.js**脚本可以将FVTT作为一个原生的（Electron）应用来使用。

**安装：**复制**plutonium-backend-addon-electron.js**到app文件夹

请注意，比起Electron应用，更推荐通过浏览器来使用FVTT。