# css常见问题

1. CSS 选择器有哪些
   1. ***通用选择器**：选择所有元素，**不参与计算优先级**，兼容性 IE6+
   2. **#X id 选择器**：选择 id 值为 X 的元素，兼容性：IE6+
   3. **.X 类选择器**： 选择 class 包含 X 的元素，兼容性：IE6+
   4. **X Y 后代选择器**： 选择满足 X 选择器的后代节点中满足 Y 选择器的元素，兼容性：IE6+
   5. **X 元素选择器**： 选择标所有签为 X 的元素，兼容性：IE6+
   6. **:link，:visited，:focus，:hover，:active 链接状态**： 选择特定状态的链接元素，顺序 LoVe HAte，兼容性: IE4+
   7. **X + Y 直接兄弟选择器**：在**X 之后第一个兄弟节点**中选择满足 Y 选择器的元素，兼容性： IE7+
   8. **X > Y 子选择器**： 选择 X 的子元素中满足 Y 选择器的元素，兼容性： IE7+
   9. **X ~ Y 兄弟**： 选择**X 之后所有兄弟节点**中满足 Y 选择器的元素，兼容性： IE7+
   10. **[attr]**：选择所有设置了 attr 属性的元素，兼容性 IE7+
   11. **[attr=value]**：选择属性值刚好为 value 的元素
   12. **[attr~=value]**：选择属性值为空白符分隔，其中一个的值刚好是 value 的元素
   13. **[attr|=value]**：选择属性值刚好为 value 或者 value-开头的元素
   14. **[attr^=value]**：选择属性值以 value 开头的元素
   15. **[attr$=value]**：选择属性值以 value 结尾的元素
   16. **[attr\*=value]**：选择属性值中包含 value 的元素
   17. **[:checked]**：选择单选框，复选框，下拉框中选中状态下的元素，兼容性：IE9+
   18. **X:after, X::after**：after 伪元素，选择元素虚拟子元素（元素的最后一个子元素），CSS3 中::表示伪元素。兼容性:after 为 IE8+，::after 为 IE9+
   19. **:hover**：鼠标移入状态的元素，兼容性 a 标签 IE4+， 所有元素 IE7+
   20. **:not(selector)**：选择不符合 selector 的元素。**不参与计算优先级**，兼容性：IE9+
   21. **::first-letter**：伪元素，选择块元素第一行的第一个字母，兼容性 IE5.5+
   22. **::first-line**：伪元素，选择块元素的第一行，兼容性 IE5.5+
   23. **:nth-child(an + b)**：伪类，选择前面有 an + b - 1 个兄弟节点的元素，其中 n >= 0， 兼容性 IE9+
   24. **:nth-last-child(an + b)**：伪类，选择后面有 an + b - 1 个兄弟节点的元素 其中 n >= 0，兼容性 IE9+
   25. **X:nth-of-type(an+b)**：伪类，X 为选择器，**解析得到元素标签**，选择**前面**有 an + b - 1 个**相同标签**兄弟节点的元素。兼容性 IE9+
   26. **X:nth-last-of-type(an+b)**：伪类，X 为选择器，解析得到元素标签，选择**后面**有 an+b-1 个相同**标签**兄弟节点的元素。兼容性 IE9+
   27. **X:first-child**：伪类，选择满足 X 选择器的元素，且这个元素是其父节点的第一个子元素。兼容性 IE7+
   28. **X:last-child**：伪类，选择满足 X 选择器的元素，且这个元素是其父节点的最后一个子元素。兼容性 IE9+
   29. **X:only-child**：伪类，选择满足 X 选择器的元素，且这个元素是其父元素的唯一子元素。兼容性 IE9+
   30. **X:only-of-type**：伪类，选择 X 选择的元素，**解析得到元素标签**，如果该元素没有相同类型的兄弟节点时选中它。兼容性 IE9+
   31. **X:first-of-type**：伪类，选择 X 选择的元素，**解析得到元素标签**，如果该元素 是此此类型元素的第一个兄弟。选中它。兼容性 IE9+

2. css sprite 是什么,有什么优缺点

   - 概念：将多个小图片拼接到一个图片中。通过 background-position 和元素尺寸调节需要显示的背景图案。

   - 优点：

   1. 减少 HTTP 请求数，极大地提高页面加载速度
   2. 增加图片信息重复度，提高压缩比，减少图片大小
   3. 更换风格方便，只需在一张或几张图片上修改颜色或样式即可实现

   - 缺点：

   1. 图片合并麻烦
   2. 维护麻烦，修改一个图片可能需要重新布局整个图片，样式

3. `display: none;`与`visibility: hidden;`的区别

   联系：它们都能让元素不可见

   区别：

   1. display:none;会让元素完全从渲染树中消失，渲染的时候不占据任何空间；visibility: hidden;不会让元素从渲染树消失，渲染时元素继续占据空间，只是内容不可见。
   2. display: none;是非继承属性，子孙节点消失由于元素从渲染树消失造成，通过修改子孙节点属性无法显示；visibility: hidden;是继承属性，子孙节点由于继承了 hidden 而消失，通过设置 visibility: visible，可以让子孙节点显示。
   3. 修改常规流中元素的 display 通常会造成文档重排。修改 visibility 属性只会造成本元素的重绘。
   4. 读屏器不会读取 display: none;元素内容；会读取 visibility: hidden;元素内容。

4. `link`与`@import`的区别

   1. `link`是 HTML 方式， `@import`是 CSS 方式
   2. `link`最大限度支持并行下载，`@import`过多嵌套导致串行下载，出现[FOUC](http://www.bluerobot.com/web/css/fouc.asp/)
   3. `link`可以通过`rel="alternate stylesheet"`指定候选样式
   4. 浏览器对`link`支持早于`@import`，可以使用`@import`对老浏览器隐藏样式
   5. `@import`必须在样式规则之前，可以在 css 文件中引用其他文件
   6. 总体来说：**[link 优于@import](http://www.stevesouders.com/blog/2009/04/09/dont-use-import/)**

5. 如何创建块级格式化上下文(block formatting context),BFC 有什么用

   - 创建规则：

   1. 根元素
   2. 浮动元素（`float`不是`none`）
   3. 绝对定位元素（`position`取值为`absolute`或`fixed`）
   4. `display`取值为`inline-block`,`table-cell`, `table-caption`,`flex`, `inline-flex`之一的元素
   5. `overflow`不是`visible`的元素

   - 作用：

   1. 可以包含浮动元素
   2. 不被浮动元素覆盖
   3. 阻止父子元素的 margin 折叠

6. 浏览器渲染的过程是什么？
   1. 解析html生成dom树
   2. 解析css生成cssom规则树
   3. 将dom树和cssom合并在一起形成渲染树
   4. 遍历渲染树，开始计算布局，计算每个节点的大小和位置信息
   5. 把渲染树的每个节点绘制到屏幕上