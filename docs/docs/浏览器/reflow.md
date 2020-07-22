# 页面回流重绘及优化

### 介绍

页面在首次加载时必然会经历回流和重绘。回流和重绘过程是非常消耗性能的，尤其是在移动设备上，它会破坏用户体验，有时会造成页面卡顿。所以我们应该尽可能少的减少它们。我们可以把回流理解成画页面的大体框架，把重绘理解为填充细节，上色🎨等操作。

只需要记住：回流必将引起重绘，重绘不一定会引起回流。

性能消耗上， 回流也大于重绘。

### 回流(reflow)

DOM节点中的各个元素都是以**盒模型**的形式存在，这些都需要浏览器去计算其位置和大小等。当Render Tree中部分或全部元素的尺寸、结构、或某些属性发生改变时，浏览器重新渲染部分或全部文档的过程称为回流(reflow)。

#### 会导致回流的操作

1. 页面首次渲染
2. 浏览器窗口大小发生改变
3. 元素尺寸或位置发生改变
4. 元素内容变化（文字数量或图片大小等等）
5. 元素字体大小变化
6. 页面滚动
7. 添加或者删除可见的DOM元素
8. 激活CSS伪类（例如：:hover）
9. 查询某些属性或调用某些方法(offsetLeft、offsetTop、offsetHeight、offsetWidth、scrollTop/Left/Width/Height、clientTop/Left/Width/Height、getComputedStyle()、currentStyle(in IE))；

### 重绘(repaint)

当页面中元素样式的改变并不影响它在文档流中的位置时（例如：color、background-color、visibility等），浏览器会将新样式赋予给元素并重新绘制它，这个过程称为重绘。

#### 会导致重绘的操作

1. color的修改，如color=#ddd；
2. text-align的修改，如text-align=center；
3. a:hover也会造成重绘。
4. :hover引起的颜色等不导致页面回流的style变动。
5. ...

### 如何优化

> 引用自Nicole Sullivan

1. **尽可能在DOM末梢通过改变class来修改元素的style属性**：尽可能的减少受影响的DOM元素。
2. **避免设置多项内联样式**：使用常用的class的方式进行设置样式，以避免设置样式时访问DOM的低效率。
3. **设置动画元素position属性为fixed或者absolute**：由于当前元素从DOM流中独立出来，因此受影响的只有当前元素，元素repaint。
4. **牺牲平滑度满足性能**：动画精度太强，会造成更多次的repaint/reflow，牺牲精度，能满足性能的损耗，获取性能和平滑度的平衡。
5. **避免使用table进行布局**：table的每个元素的大小以及内容的改动，都会导致整个table进行重新计算，造成大幅度的repaint或者reflow。改用div则可以进行针对性的repaint和避免不必要的reflow。
6. **避免在CSS中使用表达式**：学习CSS的时候就知道，这个应该避免，不应该加深到这一层再去了解，因为这个的后果确实非常严重，一旦存在动画性的repaint/reflow，那么每一帧动画都会进行计算，性能消耗不容小觑。

想查询某个属性是否会导致回流或者重绘可以参考：[css triggers](https://csstriggers.com/)

想在chrome里查看可以使用自带的工具：more tools / rendering

### 参考

[探讨css中repaint和reflow](https://www.cnblogs.com/shenqi0920/p/3545820.html)

