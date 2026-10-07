# DataModel 数据模型

`DataModel`——直译为`数据模型`——是FVTT用于构建各类数据结构的基本单元，`Document`实际上就是以之为父类进行派生后得到的产物（记住，`Document`可被持续性存储是因为其自身的实现，而非`DataModel`的特性）。你可以通过`foundry.abstract.DataModel`来访问它。

它主要实现以下功能：

- 定义数据模式(Data Schema)
- 对数据进行迁移、清洗、验证和初始化
- 数据更新以及规格化处理

以上定义或许太过生拗，让我们回顾FVTT基础认知中的说辞，其中关于文档修改的部分曾言道`文档定义`这一概念。这是一种不规范的说法，它实际上指的是在`DataModel`中定义的数据模式。简单地讲，数据模式描述的是对`DataModel`实例化后，所得的对象内应当具有哪些值键对。

让我们使用同样在FVTT基础认知中介绍到的`fromUuidSync`函数来获取一个`Document`。先前讲过，`Document`实际上是`DataModel`的派生类，这使得通过其来考察`DataModel`的某些性质是相当合适的。通过引用文档的schema字段，我们可以观察到数据模式是如何被定义的：

![图片展示了`SchemaField`类的结构，其`fields`属性包含多个`\[DataType\]Field`实例。其中`effects`为`EmbeddedCollectionField`，`flags`为`DocumentFlagsField`，`folder`为`ForeignDocumentField`，`img`为`FilePathField`，`items`为`EmbeddedCollectionField`，`name`为`StringField`，`ownership`为`DocumentOwnershipField`，`prototypeToken`为`EmbeddeddataField`，`sort`为`IntegerSortField`，`system`为`TypeDataField`，`type`为`DocumentTypeField`，`_id`为`DocumentIDField`，`_stats`为`DocumentStatsField`。这些字段对应文档的不同属性，体现了`SchemaField`对数据](https://feishu.cn/file/IPUdbVwIHo3yYexFKSvcsoUPn8d)

我们可以观察到，数据模式由一个名为`SchemaField`的类进行定义，在这个`SchemaField`内，还包含了许许多多其他的`[DataType]Field`（对这种类的简称，后文以此说法指代这些类）。同文档schema外的数据进行对比，你会发现，通常的数据成员和数据模式中的定义是一一对应的。

`[DataType]Field`类是一系列被专门设计以满足数据模式定义之需的类，你可以很简单地从其前缀的DataType来判断，这一字段（Field）到底是用于存储什么类型的数据的。

一些简单的`[DataType]Field`概念单一，如`NumberField`代表着一个数字，`StringField`代表着一串字符串；而另外的一些`[DataType]Field`更为复杂，如`SchemaField`可以存储很多额外的`[DataType]Field`，以将那些`[DataType]Field`在逻辑上关联起来。

更多有关于`[DataType]Field`的内容可以在[这里](https://foundryvtt.com/api/modules/foundry.data.fields.html)获取。

让我们上手实操！在FVTT中运行如下代码（宏或是控制台），然后观察输出结果的字段。

```JavaScript
const {
    SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;

class CharacterDataModel extends foundry.abstract.DataModel {
    static defineSchema() {//我们不直接操作schema，而是通过defineSchema静态方法来定义数据模式。
        return {
            name: new StringField({ initial: "Hello" }),//初始值为Hello字符串
            bag: new SchemaField({
                things: new ArrayField(new StringField(),{initial:["glass","sword","gayhub"]}),//数组，初始值为三个字符串
                number: new NumberField({ min: 0, initial: 3, integer: true })//初始值为3，且总应被存储为整数，其值不会小于0
            })
        };
    }
}

let val = new CharacterDataModel();
console.log(val);
```

如果无误，你应该会注意到，所有被你定义在数据模式中的字段都出现在了`DataModel`派生类的实例中。

---

接下来，让我们继续考察DataModel的其它方面。

具开头所言，DataModel还具有对数据进行迁移、清洗、验证、更新的能力。以下这段代码在赋值语句中特意使用了同数据模式相悖的类型。按理来说，这些赋值语句应当在数据验证时出错。

```JavaScript
const {
    SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;

class CharacterDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            name: new StringField({ initial: "Hello" }),//初始值为Hello字符串
            bag: new SchemaField({
                things: new ArrayField(new StringField(),{initial:["glass","sword","gayhub"]}),
                number: new NumberField({ min: 0, initial: 3, integer: true })
            })
        };
    }
}

let val = new CharacterDataModel();
console.log(val);

val.name = 114514;//错误的类型。它能正常工作吗？
val.bag.things.push("newItem");
val.bag.number = 1.2;//错误的类型。它能正常工作吗？
console.log(val);
```

但结果却出乎我们意料：新值被成功赋予。这是怎么回事？事实上，如果我们想要享受到数据模式中对于类型的严格约束，我们应该使用`DataModel`的`updateSource`方法。这个方法同其派生类`Document文档`的update方法相似，接受一个对象作为参数。它会调用`DataModel`中用于清理数据的`cleanData`方法，而后调用处理数据验证的方法：`validate`，经过了这些，数据才会被正式写入源对象中。

关于`updateSource`方法的更多信息，可以在[这里](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#updatesource)了解到。

让我们运行如下代码：

```JavaScript
const {
    SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;

class CharacterDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            name: new StringField({ initial: "Hello" }),//初始值为Hello字符串
            bag: new SchemaField({
                things: new ArrayField(new StringField(),{initial:["glass","sword","gayhub"]}),
                number: new NumberField({ min: 0, initial: 3, integer: true })
            })
        };
    }
}

let val = new CharacterDataModel();
console.log(val);

const diff = {
    name:114514,
    bag:{
        things:[...val.bag.things,"newItem"],
        number:1.2
    }
}

val.updateSource(diff)//错误的类型，它能正常工作吗？
console.log(val);
```

如果无误，那么你应该能看到正确无误的信息被写入`DataModel`实例中。

---

我们对`数据模型`的考察目前可以告一段落了。作为这一节最后的内容，让我们学习：如何通过`数据模型`为角色或物品添加可持续性保存的自定义数据。

回顾我们于目录结构中所做的工作，我们已经为`角色`和`物品`都定义了一个子类型。在FVTT中，不同的子类型可以具备不同的自定义数据，对我们而言，子类型的名称就是确定文档应当具有哪类自定义数据的钥匙。

以`Actor文档`的`character`子类型为例，如果我们想要为其添加自定义的数据，以下步骤是必须的：

1. 定义`数据模型 DataModel`，其中应该包含以`[DataType]Field`表示的，你自定义数据的数据模式。
2. 使用Hooks监听init事件，在其中运行如下代码：

```Plain Text
CONFIG.Actor.dataModels = {
        character:CharacterDataModel//类型名:数据模型
};
```

将代码保存为具有合适名称的mjs文件，如`system.mjs`，而后修改你`system.json`的定义，在其中添加这样一条语句：

```JSON
"esmodules":["system.mjs"]
```

这会使得FVTT在初始化世界时，运行system.mjs中的代码。

重启你的FVTT，创建一个character类型的角色，而后使用`fromUuidSync`方法来获取这一角色的文档数据。你会发现，在其system属性下，你于数据模型中定义的自定义数据已经被写入其中，且可以如同处理文档本身一样被更新和持久性存储。



关于数据模型的更多信息，将在后续章节中予以介绍。

---

FVTT官方更为推荐使用`DataModel`的派生类`TypeDataModel`进行文档自定义数据的定义。不过为防止困惑，我们依旧使用了`DataModel`。你应该去阅读[相关的文档](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html)并对代码加以修改，此后教程的示例也将遵循这一官方指导。

访问这四个网页来获取更多关于DataModel的信息：[介绍系统数据模型](https://foundryvtt.com/article/system-data-models/)、[FVTT V10版本于DataModel的改动](https://foundryvtt.com/article/v10-data-model/)、[官方DataModel api文档](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)、[FVTTwiki 数据模型](https://foundryvtt.wiki/en/development/api/DataModel)

访问[这个](https://foundryvtt.com/api/modules/foundry.data.fields.html)网页来获取更多关于`[DataType]Field`的信息