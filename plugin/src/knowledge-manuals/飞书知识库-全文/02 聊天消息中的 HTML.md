<title>02 聊天消息中的 HTML</title>

我们已经介绍了一些关于输入框的基本 HTML 知识；在本节中，我们将学习一些用于在聊天消息中格式化文本的基本标签。

---

# 文本样式

## 粗体

要使文本变为粗体，请使用 `<b>` 标签。

示例：

```JavaScript
ChatMessage.create({ content: `<b>This is bold text</b>` });
```

## 斜体

要使文本变为斜体，请使用 `<i>` 标签。

示例：

```JavaScript
ChatMessage.create({ content: `<i>This is italic text</i>` });
```

## 下划线

要为文本添加下划线，请使用 `<u>` 标签。

示例：

```JavaScript
ChatMessage.create({ content: `<u>This is underlined text</u>` });
```

## 删除线

要添加删除线效果，请使用 `<s>` 标签。

示例：

```JavaScript
ChatMessage.create({ content: `<s>This is strikethrough text</s>` });
```

## 颜色

要更改文本颜色，我们需要使用样式。

示例：

```JavaScript
ChatMessage.create({ content: `<span style="color: red;">This is red text</span>` });
```

### Span

当没有特定标签适用于您想要应用的样式时，使用`<span>` 标签包裹您想要设置样式的文本，然后用style设定特定样式。

### 字体大小

要更改文本的字体大小，我们需要使用样式。

示例：

```JavaScript
ChatMessage.create({ content: `<span style="font-size: 20px;">This is 20px text</span>` });
```

## Font Family 字体族

要更改文本的字体族，我们需要使用样式。

示例：

```JavaScript
ChatMessage.create({ content: `<span style="font-family: Arial;">This is Arial text</span>` });
```

---

# 标题

标题用于使文本突出显示，对于强调重要信息非常有用。

共有六种标题类型：

- `<h1>` - 一级标题
- `<h2>` - 二级标题
- `<h3>` - 三级标题
- `<h4>` - 标题 4
- `<h5>` - 标题 5
- `<h6>` - 标题 6

示例：

```JavaScript
ChatMessage.create({ content: `<h1>This is a heading</h1>` });
```

---

# 表格

要创建表格，请使用 `<table>` 标签。

示例：

```JavaScript
ChatMessage.create({ content: `<table><tr><td>This is a table cell</td></tr></table>` });
```

表格由行组成。每行由单元格组成。

- `<tr>` - 行
- `<td>` - 单元格

复杂表格：

```JavaScript
ChatMessage.create({ content: `
<table>    
        <tr>        
                <td>This is a table cell</td>        
                <td>This is another table cell</td>    
        </tr>    
        <tr>        
                <td>This is a table cell</td>        
                <td>This is another table cell</td>    
        </tr>
</table>
` });
```

如你所见，你可以使用换行来更清晰地呈现所写内容。最终输出效果将保持不变。

## 表格标题

要创建表格标题，请使用 `<th>` 标签。

示例：

```JavaScript
ChatMessage.create({ content: `<table><tr><th>This is a table header</th></tr></table>` });
```

## 实践应用：为掷骰属性创建表格

假设我们想创建一个宏，用于为角色掷出一组属性值，但我们只想保留最高的 4 个结果，并在表格中显示它们。

```JavaScript
const results = []; // 创建一个空数组存储结果
for (let i = 0; i < 6; i++) { // 循环6次    
    const roll = new Roll("3d6");    
    await roll.evaluate();    
    results.push(roll.total); // 把结果存到数组
} 
const sortedResults = results.sort((a, b) => b - a); // 将结果降序排序
const topResults = sortedResults.slice(0, 4); // 获取最高的四个结果 
let table = `<table><tr><th>Name</th><th>Value</th></tr>`; // 我们可以拼接字符串以避免重复的代码。我们会使用 let 关键字来声明一个可以更改的变量。
for (let i = 0; i < topResults.length; i++) { // 在最高的四个结果循环
    const result = topResults[i]; // 获取结果
    const resultNumber = i + 1; // 获取结果编号 
    table += `<tr><td>Result ${resultNumber}</td><td><b>${result}</b></td></tr>`; // 将结果添加到表格中，我们使用 += 算子将结果加到原始字符串中
} 
table += `</table>`; // 给表增加结束标签 
ChatMessage.create({ content: table }); // 将表格发送到聊天
```

---

# 图片

要在聊天消息中添加图片，请使用 `<img>` 标签。

示例：

```JavaScript
ChatMessage.create({ 
    content: `<img src="https://example.com/image.png" alt="An example image" />` 
});
```

---

# 实践：创建宏以随机选取物品并显示其名称和图片

假设我们想要创建一个宏，该宏将从一个列表中随机选取一个物品，并在聊天消息中显示其名称和图片。

```JavaScript
const item1 = game.items.getName("Item 1"); // 通过姓名获取物品
const item2 = game.items.getName("Item 2"); // 通过姓名获取物品
const item3 = game.items.getName("Item 3"); // 通过姓名获取物品
const items = [item1, item2, item3]; // 创建物品数组
const randomItem = items[Math.floor(Math.random() * items.length)]; // 从列表中获得一个随机物品
const image = randomItem.img; // 获取随机物品的图片路径
ChatMessage.create({ content: `<h1>${randomItem.name}</h1><img src="${image}" alt="${randomItem.name}" />` }); // 发送图片和名字到聊天信息
```

掌握了这些知识，您就能创建各种宏，为玩家们打造引人入胜的聊天消息了！