# FVTT基础认知

在正式开始学习之前，确立对以下事实的认知是必要的：

## 如何获取文档数据

FVTT中几乎所有能被持久性保存——即不会随着页面刷新而消失——的数据，都**派生**自同一个类：`Document`，即`文档`。在一场游戏中，你的人物背后的数据就是一个`Document`，其内包含着它的名称、指示物图片链接等信息；人物所持用的武器也被存储为`Document`，其内包含着物品名、物品图片链接等信息……有关`Document`的更多信息将在后面介绍。

让我们看看如何获取文档数据。FVTT为此提供了许多方法，但最为简单的还是`fromUuidSync`全局函数。这个函数接受一个存储了文档Uuid的字符串作为参数，并将Uuid对应的文档返回。如：

```JavaScript
const actor = fromUuidSync('Actor.114514itjustwork');
//获得对应Uuid的角色数据。类型为Actor，Document的一种派生类。
//其它类似的Document派生类有Item、ChatMessage……
```

一般而言，你总是能够通过对应文档的`卡模板`来获取其Uuid。



## 文档的修改

当你在FVTT中访问数据时，你实际上是将存储于服务器端数据库的对应数据拷贝至本地。也就是说，每个人所访问的数据实际上是相互独立的。

要想同步且根本地修改数据，必须通过某种方法将修改写入服务器端的数据库中。为满足这一需求，FVTT为文档实现了`update`方法。它接受一个对象作为参数，通过对照参数和文档内的值键对来进行数据的修改。一次对`update`方法的调用应该如下：

```JavaScript
const newValue = {
  "name":"paper1",
  "power":{
    "value":1,
    "max":10
  }
};
actor.update(newValue);
//若newValue中含有文档定义中不具备的数据，则对应值不会被写入。
//如：若actor.power.value并不存在，调用后，actor.name和actor.power.max会被正常修改，actor.power.value依旧不存在。
//即使是你手动给actor附上此字段，update依旧不会修改此值。
//也就是说：update只修改文档定义中具备的数据，无视文档定义中不具备的数据。
```



## 事件监听

若你体验过JS编程，那么浏览器的事件监听必然是不可绕过的话题。一般的，我们可以通过以下语句来创建一个事件监听器：

```JavaScript
DOMElement.addEventListener(event_name,handle);
```

在FVTT中，还有一种和这个同样常用的事件监听机制：`Hooks`。它的语法和`addEventListener`类似：

```JavaScript
function sayHello(){
  console.log("HelloWorld");
}

Hooks.on('Hello',sayHello);//接收到Hello事件后，调用sayHello

Hooks.call('Hello');//发送一个Hello事件
```

对于系统编程，我们必须额外注意FVTT自动发送的这个Hook事件：`init`。这个Hook事件会在FVTT初始化时发出，一些系统初始化的工作只能在此刻完成。

---

访问[这里](https://foundryvtt.com/api/functions/foundry.utils.fromUuidSync.html)以获取更多关于fromUuidSync的信息。

访问[这里](https://foundryvtt.com/api/classes/foundry.helpers.Hooks.html)以获取更多关于Hooks的信息。