# css常见问题

1. **CSS 选择器有哪些**
   
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
   
2. **css sprite 是什么,有什么优缺点**

   - 概念：将多个小图片拼接到一个图片中。通过 background-position 和元素尺寸调节需要显示的背景图案。

   - 优点：

   1. 减少 HTTP 请求数，极大地提高页面加载速度
   2. 增加图片信息重复度，提高压缩比，减少图片大小
   3. 更换风格方便，只需在一张或几张图片上修改颜色或样式即可实现

   - 缺点：

   1. 图片合并麻烦
   2. 维护麻烦，修改一个图片可能需要重新布局整个图片，样式

3. **`display: none;`与`visibility: hidden;`的区别**

   联系：它们都能让元素不可见

   区别：

   1. display:none;会让元素完全从渲染树中消失，渲染的时候不占据任何空间；visibility: hidden;不会让元素从渲染树消失，渲染时元素继续占据空间，只是内容不可见。
   2. display: none;是非继承属性，子孙节点消失由于元素从渲染树消失造成，通过修改子孙节点属性无法显示；visibility: hidden;是继承属性，子孙节点由于继承了 hidden 而消失，通过设置 visibility: visible，可以让子孙节点显示。
   3. 修改常规流中元素的 display 通常会造成文档重排。修改 visibility 属性只会造成本元素的重绘。
   4. 读屏器不会读取 display: none;元素内容；会读取 visibility: hidden;元素内容。

4. **`link`与`@import`的区别**

   1. `link`是 HTML 方式， `@import`是 CSS 方式
   2. `link`最大限度支持并行下载，`@import`过多嵌套导致串行下载，出现[FOUC](https://juejin.im/entry/6844903474954502151)
   3. `link`可以通过`rel="alternate stylesheet"`指定候选样式
   4. 浏览器对`link`支持早于`@import`，可以使用`@import`对老浏览器隐藏样式
   5. `@import`必须在样式规则之前，可以在 css 文件中引用其他文件
   6. 总体来说：**[link 优于@import](http://www.stevesouders.com/blog/2009/04/09/dont-use-import/)**
   7. 当解析到`link`时，页面会同步加载所引的 css，而`@import`所引用的 css 会等到页面加载完才被加载

5. **如何创建块级格式化上下文(block formatting context),BFC 有什么用**

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

6. **层叠上下文**

   元素提升为一个比较特殊的图层，在三维空间中 **(z轴)** 高出普通元素一等。

   ![](http://image.cocoroise.cn/168e9d9f3a1d368b)

7. **浏览器渲染的过程是什么？**

   1. 浏览器通过请求得到一个HTML文本
   2. 渲染进程解析HTML文本，构建DOM树
   3. 解析HTML的同时，如果遇到内联样式或者样式脚本，则下载并构建样式规则（stytle rules），若遇到JavaScript脚本，则会下载执行脚本。
   4. DOM树和样式规则构建完成之后，渲染进程将两者合并成渲染树（render tree）
   5. 渲染进程开始对渲染树进行布局，生成布局树（layout tree）
   6. 渲染进程对布局树进行绘制，生成绘制记录
   7. 渲染进程的对布局树进行分层，分别栅格化每一层，并得到合成帧
   8. 渲染进程将合成帧信息发送给GPU进程显示到页面中

8. **瀑布流计算逻辑，类pinterest首页的实现**

   1. 找出图片高度最小的那一列，在那一列插入，然后继续找下一个高度最小的，直到渲染完所有图片为止
   2. 计算出每一列距离浏览器整体的距离，也就是`position`里的`left`或`right`，有什么用呢？当你知道某一列的`left`的时候，相当于就知道了在它下面插入图片时，图片如何定位到这一列了，只要图片的`left`值和列是一样的，那么图片自然就插入到列里面了

9. **CSS 幽灵空白节点与解决方案**

   在 HTML5 文档声明中，**内联元素**的所有解析和渲染表现就如同每个行框盒子的前面有一个“空白节点”一样。这个“空白节点”永远透明，不占据任何宽度，看不见也无法通过脚本获取，就好像幽灵一样，但又确确实实地存在，表现如同文本节点一样，因此，称之为“幽灵空白节点”。

   比如：

   ```
   <div>
   	<span></span>
   </div>
   ```

   会有个高度为0的line box。

   解决方案：把内联元素转化为bfc元素，例如给span元素添加display:inline-block属性。

11. **css多行省略**

    https://juejin.im/entry/6844903461209767944

    一行省略代码(部分浏览器需要设置宽度)：

    ```css
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ```

    多行省略：

    - webkit浏览器

      ```css
      overflow : hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      ```

    - 其他浏览器

      ```css
      p {
          position:relative;
          line-height:1.5em;
          /* 高度为需要显示的行数*行高，比如这里我们显示两行，则为3 */
          height:3em;
          overflow:hidden;
      }
      p:after {
          content:"...";
          position:absolute;
          bottom:0;
          right:0;
          padding: 0 5px;
          background-color: #fff;
      }
      ```

12. **移动端1px如何解决？**

    1. 边框使用图片

       - 优点：兼容方便

       - 缺点：麻烦，颜色变了就要重新做一张图片，圆角模糊

       ```css
         border: 1px solid transparent;
         border-image: url('./../../image/96.jpg') 2 repeat;
       ```

    2. 伪元素

       为伪元素设置绝对定位，并且和父元素左上角对其。将伪元素的长和宽先放大2倍，然后再设置一个边框，以左上角为中心，缩放到原来的`0.5倍`。

       - 优点：兼容性好，可以圆角

       - 缺点：用了after伪元素，可能影响浮动

       ```css
       .setBorderAll{
            position: relative;
              &:after{
                  content:" ";
                  position:absolute;
                  top: 0;
                  left: 0;
                  width: 200%;
                  height: 200%;
                  transform: scale(0.5);
                  transform-origin: left top;
                  box-sizing: border-box;
                  border: 1px solid #E5E5E5;
                  border-radius: 4px;
             }
           }
       ```

    3. 设置viewport的scale值

       利用viewport+rem+js 实现

       - 优点：全机型兼容，直接写1px

       - 缺点：老项目改动比较大

       ```html
       <html>
         <head>
             <title>1px question</title>
             <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
             <meta name="viewport" id="WebViewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">        
             <style>
                 html {
                     font-size: 1px;
                 }            
                 * {
                     padding: 0;
                     margin: 0;
                 }
                 .top_b {
                     border-bottom: 1px solid #E5E5E5;
                 }
       
                 .a,.b {
                             box-sizing: border-box;
                     margin-top: 1rem;
                     padding: 1rem;                
                     font-size: 1.4rem;
                 }
       
                 .a {
                     width: 100%;
                 }
       
                 .b {
                     background: #f5f5f5;
                     width: 100%;
                 }
             </style>
             <script>
                 var viewport = document.querySelector("meta[name=viewport]");
                 //下面是根据设备像素设置viewport
                 if (window.devicePixelRatio == 1) {
                     viewport.setAttribute('content', 'width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no');
                 }
                 if (window.devicePixelRatio == 2) {
                     viewport.setAttribute('content', 'width=device-width,initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no');
                 }
                 if (window.devicePixelRatio == 3) {
                     viewport.setAttribute('content', 'width=device-width,initial-scale=0.3333333333333333, maximum-scale=0.3333333333333333, minimum-scale=0.3333333333333333, user-scalable=no');
                 }
                 var docEl = document.documentElement;
                 var fontsize = 32* (docEl.clientWidth / 750) + 'px';
                 docEl.style.fontSize = fontsize;
             </script>
         </head>
         <body>
             <div class="top_b a">下面的底边宽度是虚拟1像素的</div>
             <div class="b">上面的边框宽度是虚拟1像素的</div>
         </body>
       </html>
       ```

       

