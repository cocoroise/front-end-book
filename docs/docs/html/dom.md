# 探究Dom🌲之旅

### 前言

我们每天都在接触dom，但都是由vue帮我们渲染的，现在想回顾一下有关dom的知识点。

详细api可以查阅 [文档对象模型 (DOM) - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model) 。

### 介绍 - 什么是dom

文档对象模型 (DOM) 是**HTML**和**XML**文档的编程接口。

DOM 将文档解析为一个由**节点和对象**（包含属性和方法的对象）组成的结构集合。

` API (web 或 XML 页面) = DOM + JS (脚本语言) `

### 重要的数据结构

- Document - **`Document`** 接口表示任何在浏览器中载入的网页，并作为网页内容的入口，也就是[DOM 树](https://developer.mozilla.org/en-US/docs/Using_the_W3C_DOM_Level_1_Core).
- element - `element` 是指由 DOM API 中成员返回的类型为 `element` 的一个元素或节点。
- nodeList - 元素的数组。如从 [document.getElementsByTagName()](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByTagName) 方法返回的就是这种类型。可以使用`list.item(1)`或者`list[1]`访问。

### 常用api

dom的api有很多，但是我们经常用到(现在也不咋用了)的并不多，写过jquery的朋友应该会熟悉一点。

#### dom事件

- dom0 - 事件绑定

```javascript
btn.onclick = function() {
        alert('Hello World');
    }
```

- dom2 - 事件监听

```javascript
btn.addEventListener('click', fn, false);
```

- stopPropagation - 阻止事件冒泡
- preventDefault - 阻止浏览器的默认行为触发，比如点击a标签打开一个页面。
- stopImmediatePropagation - 阻止监听同一
- 事件的其他事件监听器被调用。

#### 查询节点

- document.getElementById
- document.getElementsByTagName - 返回的是HTMLCollection
- document.getElementsByName
- document.getElementsByClassName
- document.querySelector
- document.querySelectorAll

#### 操作节点

- document.createElement
- document.createTextNode
- cloneNode
- document.createDocumentFragment - Fragment作为文档片段，对他进行dom操作是在内存中进行的，不会造成很大消耗。
- appendChild
- insertBefore
- removeChild
- replaceChild

#### 节点关系

- **parentNode** - 元素的父节点，可以是element,document或者documentFragment
- **parentElement** - 同样是元素的父节点，但是必须是element
- **childNodes** - 返回一个即时的NodeList，表示元素的子节点列表，子节点可能会包含文本节点，注释节点等
- **children** - 一个即时的HTMLCollection，子节点都是Element,使用elementNodeReference.children[1].nodeName来获取某个子元素的标签名称
- **previousSibling** - 返回当前节点的前一个兄弟节点,没有则返回null
- **nextSibling** - 返回其父节点的childNodes列表中紧跟在其后面的节点

#### classList操作

官方文档：[Element.classList](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/classList)

- div.classList.remove("className")
- div.classList.add("className")
- div.classList.toggle("className")
- div.classList.replace("className")

#### 页面加载

1. **window**

- window.onload
- window.onunload
- window.onscroll
- window.onresizestart
- window.onresizeend

2. **document**

- document.ready - 表示文档结构已经加载完成（不包含图片等非文字媒体文件）
- document.onload - 指示页面包含图片等文件在内的所有元素都加载完成

### 常见问题

1. HTMLCollection和NodeList的区别？

- HTMLCollection

  [HTMLCollection](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCollection)表示一个包含了元素（元素顺序为文档流中的顺序）的通用集合（generic collection），还提供了用来从该集合中选择元素的方法和属性。

- NodeList

  [NodeList](https://developer.mozilla.org/zh-CN/docs/Web/API/NodeList) 对象是节点的集合，通常是由属性，如Node.childNodes 和 方法，如document.querySelectorAll 返回的。

  NodeList**不是一个数组**，是一个类似数组的对象(*Like Array Object*)。
