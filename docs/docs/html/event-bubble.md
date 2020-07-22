# 事件冒泡，捕获和委托

### 介绍

- 事件冒泡 - 当一个元素接收到事件的时候，会把他接收到的事件传给父级，一直传到window 
- 事件捕获 - 事件从文档的根节点流向目标对象节点。途中经过各个层次的DOM节点，并在各节点上触发捕获事件，直到到达事件的目标节点。

### 机制

<img src="http://image.cocoroise.cn/20200722122007.png" style="zoom:50%;" />

1. 一个完整的JS事件流是从window开始，最后回到window的一个过程
2. 事件流被分为三个阶段(1~5)捕获过程、(5~6)目标过程、(6~10)冒泡过程
   1. 捕获阶段：首先window会获捕获到事件，之后document、documentElement、body会捕获到，再之后就是在body中DOM元素一层一层的捕获到事件
   2. 冒泡阶段：和捕获相反的一层层把事件传递到window

#### 阻止冒泡的方式

- 标准的W3C 方式：e.stopPropagation();这里的stopPropagation是标准的事件对象的一个方法，调用即可


- 非标准的IE方式:ev.cancelBubble=true;  这里的cancelBubble是 IE事件对象的属性，设为true就可以了

#### 关于e.target和e.currentTarget

- e.target - target是真正发生事件的dom元素
- e.currentTarget - 当前事件绑定的元素

### 事件委托

知道了冒泡的过程和e.target,e.currentTarget就可以利用它来实现事件委托了。

```javascript
<!DOCTYPE html>
<html>
<head>
    <title></title>
</head>
<body>
    <div id="do">
        <ul>
            <li id="111">111</li>
            <li id="222">222</li>
            <li id="333">333</li>
            <li id="444">444</li>
        </ul>
    </div>
    <script type="text/javascript">
      var dos = document.getElementById('do')
      dos.onclick = function(ELE){
        console.log(ELE.target.innerHTML)
      }
    </script>
</body>
</html>
```

**什么时候不适合事件委托**

1. focus、blur 之类的事件（又比如mouseenter, mouseleave）本身没有事件冒泡机制，无法进行委托。
2. mousemove、mouseout 这样的事件触发频繁，对性能消耗高，不适合于事件委托。

### codepen

可以自己修改代码运行，能够更直观的了解冒泡的顺序。

[codePen地址](https://codepen.io/ChristianPrint/pen/BayzWyJ?editors=1011)

