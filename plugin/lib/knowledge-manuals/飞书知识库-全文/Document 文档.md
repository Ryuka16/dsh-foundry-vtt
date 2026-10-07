# Document 文档

`Document`直接派生自`DataModel`。它具有将其数据模式定义的数据永久存储在数据库中的能力。在FVTT中，所有数据都是围绕着文档这一概念进行存储的。你可以通过`foundry.abstract.Document`来访问它。

同其父类相比，`Document`主要额外实现了如下功能：

- 一组用于同数据库交互的方法，如`create`，`update`，`reset`，`delete`。这些数据库方法会在网络中进行通信，当一方进行调用时，其它连接的客户端也会及时获取到数据的更新。
- 一组用于权限测试的方法。主要检查用户是否具有权限对此`Document`进行某些操作，如将其作为指示物进行选取。
- 一组在特定时期执行的回调函数。如`_onCreate`，它会在调用`create`方法创建文档时被同时调用，以执行用户的指定逻辑。

不过，作为一种抽象类，我们并不能创建`Document`实例。事实上，`Document`甚至不具有可用的数据模式！考察其`defineSchema`方法便可得知，`Document`会在这里抛出一个错误。相反，我们应该将目光转向那些具有实际指代意义的`Document`派生类：`Actor`、`Item`、`ActiveEffect`、`ChatMessage`……它们可被正常实例化，也是FVTT实际存储至数据库的内容。`Document`的所有派生类名称可以通过`CONST.ALL_DOCUMENT_TYPES`来访问到，派生类本身可以直接通过其名称访问到。

那么，这些子类同其父类又有何差别？

简单地讲，根据其所代表的对象，这些子类会定义自己的数据模式，并重写已有方法或引入新方法。

让我们以`Actor`文档和`ChatMessage`文档为例。观察二者的`defineSchema`方法：

```JavaScript
console.log(Actor.defineSchema)
console.log(ChatMessage.defineSchema)
```

前者为自己定义了这样一系列数据成员：象征着角色姓名的name，象征着角色类型的type（用于判断这个角色是一个npc还是玩家角色。它还有个更为通用的名称：文档子类型），象征着角色图像的img……，而后者则定义了：象征着发送者的author，象征着发送信息内容的content……这些字段同FVTT的正常运转高度关联，这意味着我们不太应该随意修改一个`Document`派生类的数据字段定义。如果你想要为一个文档添加自定义数据，你应该通过*DataModel*那节所介绍的方法进行操作，或是给文档设置`flags`。与flags有关的内容可以在[这篇文章](https://foundryvtt.wiki/en/development/api/flags)中学习到。

再来考察引入的新方法。依旧以`Actor`文档为例，其定义了一个名为`getDefaultArtwork`的静态方法，它用于从提供的`Actor`文档数据中提取角色的图片信息，而ChatMessage并没有——也没有这种需求——实现这一方法。

这两方面的考察向我们揭示了一些关于文档特点：显然，`Document`更为注重于方法的实现和修改，因为其数据方面的工作都已经被剥离出去——defineSchema已被提前定义好，自定义数据则是通过修改CONFIG的对应字段。这意味着当我们派生一个文档——如`class NewActor extends Actor`时，我们应该总是将目光放在其功能逻辑的实现上。

接下来让我们学习如何创建一个文档。

在FVTT中，一个文档的创建通过调用其`create`静态方法实现。以`Actor`为例：

```JavaScript
let myActor = Actor.create({name:"ActorName",type:"character"});
//任何文档的create方法都接受一个对象，其中保存着用于初始化文档的数据，这两者（文档和传入的对象）的值键对成一一对应关系。
//一些文档的create方法要求你必须提供特定数据，如Actor.create和Item.create就要求你必须提供name和type（示例中已给出）。
//注意，type应该同你于system.json的documentTypes中声明的对应文档子类型相同。
```

那么，我们为什么不使用`new Actor({name:"ActorName",type:"character"})`这种方式？

这是因为简简单单地使用`new Actor`只会在你的本地生成对应的文档对象，而不会向服务器的数据库创建和写入对应记录。`create`方法会同服务器进行交互，并将文档在数据库中对应的记录编号保存在`_id`成员中，以供其它需要同数据库对应记录交互的方法使用，如`update`、`delete`等。如果你通过`new`来创建一个文档，那么这个文档并不会存入数据库中以持久存储，自然也不会具有_id成员，那些同数据库交互的方法也无法正常使用。

> 始终使用`create`静态方法创建对应文档。

被创建的文档会被存储到game对象下的对应成员中。如`Actor`文档就会被存储在game.actors中，`Item`文档则在game.items中。不过这其中仍有例外，若你仔细观察，你会发现game对象下并不存在用于存放`ActiveEffect`文档的成员，相反，`ActiveEffect`文档通常会被存储在`Actor`文档内部。这是因为文档与文档之间亦有区别：像`Actor`这类可独立存在的文档被称作Primary Documents主文档，而`ActiveEffect`这类与其它文档强关联以至无法独立存储的文档则被称作Embedded Documents嵌入文档。你可以通过`CONST.PRIMARY_DOCUMENT_TYPES`和`CONST.EMBEDDED_DOCUMENT_TYPES`访问到它们的名称。

不过，主文档和嵌入文档之间的关系并没有那么泾渭分明。虽然嵌入文档确实无法独立存在，但主文档也可以嵌入在其它主文档之中，一个例子便是`Actor`文档内的`Items`成员。

通常的，一个嵌入文档以如下的形式创建：

```JavaScript
let myActor = game.actors.get(id);//通过id从game.actors中获得对应文档数据。
//let myActor = fromUuidSync(uuid);//老办法，通过对应的uuid来获取对应文档数据。二者结果等价。
let myEffect = ActiveEffect.create({name:"new active effect"},{parent:myActor});
//第二个参数用于指定ActiveEffect该存储到哪个文档下。
//若缺少此参数，FVTT会在创建时出现错误，导致ActiveEffect文档创建失败。
```

关于`Document.create`方法的详细描述，可在[这里](https://foundryvtt.com/api/v13/classes/foundry.abstract.Document.html#create)获知。

嵌入文档与主文档之间并无什么特别不同，我们于本节学习的内容对于两者都是可用的。大部分时间我们都使用文档来指代二者，仅在必要时进行区分。

文档创建完后，其中的数据必然要经历修改。对于文档类，我们应该使用其`update`方法而非`updateSource`方法，这和使用`create`而非new关键字也是同样的道理。

目前，我们对`Document`的背后运作机理已有了些许了解。让我们学习该如何派生自己的`Document`类并将其注册到FVTT中。

---

在FVTT中，我们可以通过修改CONFIG中的对应字段来修改系统默认使用的文档。

```JavaScript
CONFIG.Actor.documentClass = MyActorClass;
//这会将默认使用的Actor文档设置为我们的MyActorClass。
//值得注意的是，系统使用的Actor/Item文档只能有一个，
//而文档所含有的自定义数据则根据文档子类型可以有多个。
```

那这么做有什么好处呢？

依旧以角色为例，当我们按下创建角色按钮时，FVTT会根据`CONFIG.Actor.documentClass`内引用的文档类而进行`create`操作，而非使用默认的`Actor`文档类。当用户在角色卡上进行操作时，也必然要使用到文档内新添的方法。通过修改`CONFIG.Actor.documentClass`可以保证用户几乎一定会使用我们派生的文档类。

现在让我们考察派生文档类中值得注意的一些方法。

🔶`prepareData`方法。这个方法会在文档初始化和使用`update`方法进行数据更新时调用。FVTT将它的功能定义为：计算那些不需要被存储进数据库中的数据，并将之临时性地存储在文档中。譬如计算一个角色的重伤程度，在其生命值跌至一半以下时陷入浴血。与其将这个浴血状态存储至数据库，不如每次更新都在`prepareData`中进行判断和赋值更为适合。

默认地，`prepareData`方法会以如下顺序调用这些函数：

1. 若你的数据模式派生自`TypeDataModel`，则调用其实例的`prepareBaseData`方法。
2. 调用文档的`prepareBaseData`方法。
3. 调用文档的`prepareEmbeddedDocuments`方法。
4. 若你的数据模式派生自`TypeDataModel`，则调用其实例的`prepareDerivedData`方法。
5. 调用文档的`prepareDerivedData`方法。

FVTT并不赞同你重写这一方法，相反，你应该重写文档的`prepareBaseData`方法和`prepareDerivedData`方法。此外，由于`prepareData`方法会在创建和更新文档时调用，因此在重写相关方法时，切莫调用`update`方法，否则会引起无限递归的错误。

一个经过重写后的`prepareDerivedData`方法应该类似于：

```JavaScript
prepareDerivedData(){
    const health = this.system.resources.health;

    const hp = health.value;
    const maxHp = health.max;

    health.wound =  (hp===maxHp)?"无损伤":
                    (hp>=Math.round(maxHp*0.8))?"轻伤":
                    (hp>=Math.round(maxHp*0.4))?"中伤":
                    (hp>0)?"重伤":
                    "死亡";
}
```

🔶`getRollData`方法。通常地，一个`Actor`文档通过这个方法来向其它模块提供掷骰用数据。当你于聊天栏中键入`/r 1d20+@health.value`这般的掷骰表达式时，@health.value便会被解析为`getRollData`方法返回的对应值。另一个例子是在DND系统进行自动化工作时，你所引用的那些以@开头的数据们。

`getRollData`方法返回一个对象，其中存储了可在掷骰表达式中以`@xxx.yyy`形式访问的数据。默认的`gerRollData`方法返回你文档的system成员，即你的自定义数据们。

一个`getRollData`方法的实现和使用可能如下：

```JavaScript
getRollData(){
    let ret = super.getRollData();
    ret.newValue = 1;
    return ret;
}

async rollForActor(){
    const roll = new Roll("1d20+@newValue",this.getRollData());
    const ret = await roll.evaluate();
    return ret;
}//一个我们新添加的方法，调用了文档自身的getRollData方法来获取掷骰数据，计算骰值并返回。
```

---

除去上述提及的方法外，文档依旧存在着相当之多的方法值得考察和重写，你可以在官方api文档的[Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)页面，以及FVTT文件目录下，名为`foundry.mjs`的源文件的`ClientDocumentMixin`函数中找到它们。

关于文档的其它教学，可以参看[这篇](https://foundryvtt.wiki/en/development/api/document)FVTT英文社区的文章。

接下来，您可以继续阅读数据一节的后续内容，或是转而阅读模板卡小节。