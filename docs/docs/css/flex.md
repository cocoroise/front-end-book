# flex布局

flex容器默认存在两个轴，水平主轴，竖直交叉轴。

### 容器

在对某元素设置为flex后，该元素自动成为容器，内部元素为容器成员。

> 容器有六个属性可用：1.flex-direction 2.flex-wrap 3.flex-flow 4.justify-content 5.align-items 6.align-content

**flex-direction**
flex-direction:row|row-reverse|column|column-reverse
分别对应左起水平，右起水平，从上到下，从下到上。
**flex-wrap**
用于规定在排不下时如何换行。
flex-wrap:nowrap|wrap|wrap-reverse
分别对应于不换行 换号且第一行在上 换号且第一行在下。

> flex-direction+flex-wrap = flex-flow
> 默认值为 row nowrap

**justify-content**
规定了主轴对齐方式。
justify-content: flex-start | flex-end | center | space-between | space-around;

- flex-start（默认值）：左对齐
- flex-end：右对齐
- center： 居中
- space-between：两端对齐，项目之间的间隔都相等。
- space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。

**align-items**
定义了交叉轴对齐方式。

- align-items: flex-start | flex-end | center | baseline | stretch;
- flex-start：交叉轴的起点对齐。
- flex-end：交叉轴的终点对齐。
- center：交叉轴的中点对齐。
- baseline: 项目的第一行文字的基线对齐。
- stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。
  **align-content**
  多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
- flex-start：与交叉轴的起点对齐。
- flex-end：与交叉轴的终点对齐。
- center：与交叉轴的中点对齐。
- space-between：与交叉轴两端对齐，轴线之间的间隔平均分布。
- space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
- stretch（默认值）：轴线占满整个交叉轴。

### 盒子

> 有六个属性可以使用：1.order 2.flex-grow 3.flex-shrink 4.flex-basis 5.flex 6.align-self

**order**
规定了元素的排列顺序。默认值为0，数值越小越靠前。
**flex-grow**
控制元素放大比例。默认为0，即有空余空间也不放大。
**flex-shrink**
项目的缩小比例，默认为1，即如果空间不足，该项目将缩小
**flex-basis**
定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。
**flex**
flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto。后两个属性可选。
**align-self**
align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。

### 参考

[Flex 布局教程：语法篇 - 阮一峰 ](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)

[flex 布局的基本概念 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox)