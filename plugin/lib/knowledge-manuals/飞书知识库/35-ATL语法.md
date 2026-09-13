# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/Qn24w0i9EiFBqIkG4ZzczYzvn8g

v14就要并入原生功能了，能不能不写了
![图片](images/Q1aHbfE5eoCHV2xHDk0cVJ9InWh.png)
ATL，全称Active Token Effect，大部分的应用情形是为token添加光源以实现火把或光亮术的自动化，不过就其功能而言，其能做到的不止于此，而是通过主动效果来修改token文档的几乎所有数据，包括尺寸，视野，Token名称等等。
https://github.com/kandashi/Active-Token-Lighting/wiki/Key-Reference
# ATL语法
ATL的所有键值都是ATL.X的形式，X是对应token属性的数据路径，其更改键值队通常如下
```
ATL.X | 自定义 | 值
```
取决于具体的数据路径，更改模式也可以是加ADD或是覆盖OVERRIDE。
token文档的数据路径通常由以下宏在控制台打印获得
```
const selfToken = canvas.tokens.controlled[0];
console.log(selfToken.document)
```
![图片](images/OYOGb149HonkmhxcdVScsMyWnkf.png)
除此之外，ATL自带的合集包中也附带了一部分物品示例以供参考。
# 常用键值
- [number] - 数值
- [min, max] - 在min与max之间的数值
- [string] - 字符串
- [file] - 文件路径, e.g. icons/svg/mystery-man.svg
- [color] - 十六进制颜色, e.g. #EE9B3A
- [boolean] - 布尔值, true 或 false
## 本体部分
| 属性键 | 接受的值 | 描述 |
|---|---|---|
| ATL.name | [string] | token名称，更改模式支持加/覆盖 |
| ATL.displayName | [number] | 决定token名称显示模式的方式，具体接受值见下文。 |
| ATL.actorId | [string] | 修改token的关联角色.....你不会想这么做的 |
| ATL.actorLink | [boolean] | token是否关联角色数据 |
| ATL.x ATL.y | [number] | token的坐标 |
| ATL.sort | [number] | token排序 |
| ATL.rotation | [number] | token的旋转角度 |
| ATL.elevation | [number] | 修改token在场景上的高度 |
| ATL.movementAction | [string] | 修改token的移动动作，具体接受值见下文。 |
| ATL.occludable.radius | [number] | token的遮挡半径 |
| ATL.disposition | [number] | 决定token的态度（友善/中立/敌对等），具体接受值见下文。 |
### token名称显示模式
| 数值 | 对应的显示模式 |
|---|---|
| 0 | 从不显示 |
| 10 | 控制时显示 |
| 20 | 拥有者悬停时显示 |
| 30 | 任何人悬停时显示 |
| 40 | 始终向所有者显示 |
| 50 | 始终向所有人显示 |
来源：CONST.TOKEN_DISPLAY_MODES
### token态度
| 数值 | 对应的态度 |
|---|---|
| -2 | 未知 |
| -1 | 敌对 |
| 0 | 中立 |
| 1 | 友善 |
来源：CONST.TOKEN_DISPOSITIONS
### token移动动作
| 字符串 | 对应的移动动作 |
|---|---|
| blink | 传送（闪现） |
| burrow | 掘穴 |
| climb | 攀爬 |
| crawl | 匍匐 |
| fly | 飞行 |
| jump | 跳跃 |
| swim | 游泳 |
| walk | 步行 |
来源：CONFIG.Token?.movement?.actions
## 外观
| 属性键 | 接受的值 | 描述 |
|---|---|---|
| ATL.texture.src | [file] | token图像 |
| ATL.width ATL.height | [0.5, Infinity] | token的尺寸 |
| ATL.shape | [number] | token的形状，具体接受值见下文。 |
| ATL.hexagonalShape | [number] | 已弃用，现由ATL.shape代替。 |
| ATL.texture.fit | [string] | token图像适配模式，接受的值见下文 |
| ATL.texture.anchorX ATL.texture.anchorY | [number] | token锚点 |