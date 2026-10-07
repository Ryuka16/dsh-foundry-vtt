# socket通信

这一小节我们主要学习：

- 通过socket通信绕过权限系统限制

---

在FVTT中，权限系统主要由两部分构成：

- 用户本身的权限，如否能执行脚本，能否创建播放列表，能否主动掷骰……根据所处的用户组的不同，其默认地具有部分权限。
- 用户对角色的权限，这决定了用户能否操控角色作为指示物，以及修改其背后的数据。

假设这样一种情况：我们于派生的`Actor`文档中实现了`attackActor`方法。正如其名，它用于处理角色之间的攻击事务，其实现可能如下：

```JavaScript
async attackActor(){
    const targets = game.user.targets;//获取选中目标
    targets.forEach(target => {
        const diff = {
            system:{
                health:0
            }
        };
        const r = new Roll("1d20+@resources.damage",this.getRollData());
        await r.evaluate();//等待计算掷骰结果
        diff.system.health = target.system.health - r.result;//计算剩余生命值
        target.update(diff);//更新目标的生命值数据
    });
}
```

当你以GM的用户组调用此方法时，其行为正常。但若调用此方法的是一名权限在你之下的玩家，则FVTT会拒绝执行`update`方法，并汇报这样一条错误：

```Plain Text
User [PlayerName] lacks permission to update ActorDelta [ActorDeltaID] in parent Token [TokenID]
```

显然，这一问题的根源在于：用户并没有足够的权限对其它角色的数据进行修改。若想解决，一个显而易见的方法是额外赋予用户那一角色的权限。当然，其弊端同样明显，超出限制的权限可能导致各种问题。

最好的方法是使用FVTT自带的socket.io库进行网络通信，并将修改角色的任务交予GM用户组。在此用户组的成员拥有全部角色的权限。

<callout emoji="💬">
### 为什么是`ActorDelta`？
在FVTT中，当我们向画布拖放一个角色时，系统会创建一个`Token`文档实例，其中存储着那一角色的引用，以及一个`ActorDelta`文档实例。  
当我们通过uuid获取角色时，FVTT会记录同这一角色相关联的`Token`文档实例。这样，当我们在角色上调用`update`方法时，FVTT会检测`Token`文档是否设置了 **与关联角色同步数据** 的选项。  
若有：则正常修改角色数据。  
若无：则转而修改`ActorDelta`文档实例。当引用到角色数据时，FVTT会自动使用对应的`ActorDelta`文档实例中的数据。  
更多相关的话题，可以参看这一[文章](https://foundryvtt.com/article/v11-actor-delta)。
</callout>

---

若想在FVTT中使用socket.io库，你必须先在system.json中添加如下字段：

```JSON
"socket":true
```

这会使得FVTT为你分配一个名为`system.${id}`的套接字事件。你可以使用如下语句来广播这一事件并传递数据，**除你以外**的相连客户端都会接收到它们：

```JavaScript
game.socket.emit("system.mysystem",{data1:"Hello",data2:"World"});
//广播system.mysystem事件，并传输指定数据。除你以外的客户端都会接收到这一事件和相关的数据。
```

当一个客户端接收到一个socket事件，它会调用绑定好的监听函数作为回应：

```JavaScript
Hooks.once('init',()=>{
    game.socket.on('system.mysystem',(val)=>{//绑定监听函数，当收到system.mysystem事件时，执行对应函数
        switch(val.type){
            case 'damage':
                handleDamage(val.data);
                break;
            default:
                console.log('ERROR EVENT TYPE!!!');
        }
    })
})
```

对于我们先前的示例，即`AttackActor`方法，则可以利用socket的知识改写成这样：

```JavaScript
/*监听函数*/
Hooks.once('init',()=>{
    game.socket.on('system.mysystem',(val)=>{
        if(game.user.isGM){//检测权限
            const actor = fromUuidSync(val.uuid);//检索受伤角色
            actor.update({system:{health:val.damage}});//应用伤害
        }
    })
})

/*修改Actor派生类的AttackActor方法*/
async attackActor(){
    const targets = game.user.targets;//获取选中目标
    targets.forEach(target => {
        const data = {uuid:target.uuid,damage:0};
        const r = new Roll("1d20+@resources.damage",this.getRollData());
        await r.evaluate();
        data.damage = target.system.health - r.result;
        if(game.user.isGM())target.update({system:{health:data.damage}});//若用户为GM，则直接更新，因为socket事件并不会被发送给发出者。
        else game.socket.emit('system.mysystem',data);
    });
}
```

---

若你想知道更多关于Sockets的详细信息，可以参看[此文章](https://foundryvtt.wiki/en/development/api/sockets)。