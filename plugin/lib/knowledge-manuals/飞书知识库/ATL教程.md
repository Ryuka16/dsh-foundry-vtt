<title>ATL教程</title>

> *v14就要并入原生功能了，能不能不写了*

![图片中是一只白色的鸽子，它站在地面上，眼神平静，姿态悠然。鸽子上方配有文字“不着急，不着急！”。该图片位于“ATL教程”文档中，在提及v14即将并入原生功能以及询问能否不写相关内容之后，与ATL语法等后续介绍并无直接关联，可能是用以缓和情绪、表达一种从容态度，给教程阅读者带来轻松的氛围。](https://feishu.cn/file/Q1aHbfE5eoCHV2xHDk0cVJ9InWh)

ATL，全称[Active Token Effect](https://foundryvtt.com/packages/ATL)，大部分的应用情形是为token添加光源以实现火把或光亮术的自动化，不过就其功能而言，其能做到的不止于此，而是通过主动效果来修改token文档的几乎所有数据，包括尺寸，视野，Token名称等等。

https://github.com/kandashi/Active-Token-Lighting/wiki/Key-Reference

# ATL语法

ATL的所有键值都是`ATL.X`的形式，X是对应token属性的数据路径，其更改键值队通常如下

```JavaScript
ATL.X | 自定义 | 值
```

取决于具体的数据路径，更改模式也可以是`加ADD`或是`覆盖OVERRIDE`。

token文档的数据路径通常由以下宏在控制台打印获得

```JavaScript
const selfToken = canvas.tokens.controlled[0];
console.log(selfToken.document)
```

![图片展示了一段代码，内容为一个名为“PC (2)”的actor对象属性。该对象包含actorId、actorLink、actors、alpha等众多属性，如alpha值为1，bar1和bar2属性值为null，light属性有negative、priority等子属性，movementAction为“walk”，name为“PC (2)”，texture属性有src等子属性，sight属性有enabled、range等子属性，x、y坐标分别为3600、2900等。此代码与上下文介绍的ATL语法相关，展示了token文档数据路径获取宏在控制台打印的示例。](https://feishu.cn/file/OYOGb149HonkmhxcdVScsMyWnkf)

除此之外，ATL自带的合集包中也附带了一部分物品示例以供参考。



# 常用键值

- `[number]` - 数值
- `[min, max]` - 在min与max之间的数值
- `[string]` - 字符串
- `[file]` - 文件路径, e.g. `icons/svg/mystery-man.svg`
- `[color]` - 十六进制颜色, e.g. `#EE9B3A`
- `[boolean]` - 布尔值, `true` 或 `false`

## 本体部分

| **属性键** | **接受的值** | **描述** |
|-|-|-|
| `ATL.name` | `[string]` | token名称，更改模式支持`加`/`覆盖` |
| `ATL.displayName` | `[number]` | 决定token名称显示模式的方式，**具体接受值见下文**。 |
| `ATL.actorId` | `[string]` | 修改token的关联角色.....你不会想这么做的 |
| `ATL.actorLink` | `[boolean]` | token是否关联角色数据 |
| `ATL.x`  <br/>`ATL.y` | `[number]` | token的坐标 |
| `ATL.sort` | `[number]` | token排序 |
| `ATL.rotation` | `[number]` | token的旋转角度 |
| `ATL.elevation` | `[number]` | 修改token在场景上的高度 |
| `ATL.movementAction` | `[string]` | 修改token的移动动作，**具体接受值见下文**。 |
| `ATL.occludable.radius` | `[number]` | token的遮挡半径 |
| `ATL.disposition` | `[number]` | 决定token的态度（友善/中立/敌对等），**具体接受值见下文**。 |

### token名称显示模式

| **数值** | **对应的显示模式** |
|-|-|
| 0 | 从不显示 |
| 10 | 控制时显示 |
| 20 | 拥有者悬停时显示 |
| 30 | 任何人悬停时显示 |
| 40 | 始终向所有者显示 |
| 50 | 始终向所有人显示 |

> **来源：**CONST.TOKEN_DISPLAY_MODES

### token态度

| **数值** | **对应的态度** |
|-|-|
| -2 | 未知 |
| -1 | 敌对 |
| 0 | 中立 |
| 1 | 友善 |

> **来源：**CONST.TOKEN_DISPOSITIONS

### token移动动作

| **字符串** | **对应的移动动作** |
|-|-|
| `blink` | 传送（闪现） |
| `burrow` | 掘穴 |
| `climb` | 攀爬 |
| `crawl` | 匍匐 |
| `fly` | 飞行 |
| `jump` | 跳跃 |
| `swim` | 游泳 |
| `walk` | 步行 |

> **来源：**CONFIG.Token?.movement?.actions

## 外观

| **属性键** | **接受的值** | **描述** |
|-|-|-|
| `ATL.texture.src` | `[file]` | token图像 |
| `ATL.width`  <br/>`ATL.height` | `[0.5, Infinity]` | token的尺寸 |
| `ATL.shape` | `[number]` | token的形状，**具体接受值见下文**。 |
| `ATL.hexagonalShape` | `[number]` | 已弃用，现由`ATL.shape`代替。 |
| `ATL.texture.fit` | `[string]` | token图像适配模式，接受的值见下文 |
| `ATL.texture.anchorX`  <br/>`ATL.texture.anchorY` | `[number]` | token锚点 |
| `ATL.texture.scaleX`  <br/>`ATL.texture.scaleY` | `[0.2,3]` | token的图像X/Y方向缩放比例 |
| `ATL.texture.tint` | `[color]` | token图像着色颜色 |
| `ATL.texture.offsetX`  <br/>`ATL.texture.offsetY` | `[number]` |  |
| `ATL.alpha` | `[0, 1]` | token的不透明度 |
| `ATL.lockRotation` | `[boolean]` | 是否锁定token旋转 |

### token形状

|  |  |
|-|-|
|  |  |

### token图像适配模式

## 动态token环

## 视觉

| **属性键** | **接受的值** | **描述** |
|-|-|-|
| `ATL.sight.enabled` | `[boolean]` | 是否启用指示物的视觉 |
| `ATL.sight.range` | `[number]` | 视野范围 |
| `ATL.sight.angle` | `[0,360]` | 视野角度 |
| `ATL.sight.visionMode` | `[string]` | 视觉模式，具体接受的值见下文 |
| `ATL.sight.color` | `[color]` | 视野颜色 |
|  |  |  |

## 光照

| **属性键** | **接受的值** | **描述** |
|-|-|-|
| ATL.light.negative | `[boolean]` | 是否为黑暗光源 |
| ATL.light.dim | [0, Infinity] | 微光光照范围 |
| ATL.light.bright | [0, Infinity] | 明亮光照范围 |
| ATL.light.angle | [0.360] | 光源发散角度 |
| ATL.light.color | `[color]` | 光照颜色 |
| ATL.light.alpha | [0,1] | 光源强度 |