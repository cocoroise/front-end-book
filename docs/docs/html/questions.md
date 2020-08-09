# Html常见问题

1.  **前端需要注意哪些 SEO**
    
    1.  合理的 title、description、keywords：搜索对着三项的权重逐个减小，title 值强调重点即可，重要关键词出现不要超过 2 次，而且要靠前，不同页面 title 要有所不同；description 把页面内容高度概括，长度合适，不可过分堆砌关键词，不同页面 description 有所不同；keywords 列举出重要关键词即可
    2.  语义化的 HTML 代码，符合 W3C 规范：语义化代码让搜索引擎容易理解网页
    3.  重要内容 HTML 代码放在最前：搜索引擎抓取 HTML 顺序是从上到下，有的搜索引擎对抓取长度有限制，保证重要内容一定会被抓取
    4.  重要内容不要用 js 输出：爬虫不会执行 js 获取内容
    5.  少用 iframe：搜索引擎不会抓取 iframe 中的内容
    6.  非装饰性图片必须加 alt
    7.  提高网站速度：网站速度是搜索引擎排序的一个重要指标
    
2. **web 开发中会话跟踪的方法有哪些**
   
   1. cookie
   2. session
   3. url 重写
   4. 隐藏 input
   5. ip 地址
   
3. **doctype 是什么,举例常见 doctype 及特点**
   
   1. `<!doctype>`声明必须处于 HTML 文档的头部，在`<html>`标签之前，HTML5 中不区分大小写
   2. `<!doctype>`声明不是一个 HTML 标签，是一个用于告诉浏览器当前 HTMl 版本的指令
   3. 现代浏览器的 html 布局引擎通过检查 doctype 决定使用兼容模式还是标准模式对文档进行渲染，一些浏览器有一个接近标准模型。
   4. 在 HTML4.01 中`<!doctype>`声明指向一个 DTD，由于 HTML4.01 基于 SGML，所以 DTD 指定了标记规则以保证浏览器正确渲染内容
   5. HTML5 不基于 SGML，所以不用指定 DTD
   
4. **HTML 全局属性(global attribute)有哪些**

   参考资料：[MDN: html global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes)或者[W3C HTML global-attributes](http://www.w3.org/TR/html-markup/global-attributes.html#common.attrs.core)

- `accesskey`:设置快捷键，提供快速访问元素如[aaa](https://github.com/qiu-deqing/FE-interview#)在 windows 下的 firefox 中按`alt + shift + a`可激活元素
- `class`:为元素设置类标识，多个类名用空格分开，CSS 和 javascript 可通过 class 属性获取元素
- `contenteditable`: 指定元素内容是否可编辑
- `contextmenu`: 自定义鼠标右键弹出菜单内容
- `data-*`: 为元素增加自定义属性
- `dir`: 设置元素文本方向
- `draggable`: 设置元素是否可拖拽
- `dropzone`: 设置元素拖放类型： copy, move, link
- `hidden`: 表示一个元素是否与文档。样式上会导致元素不显示，但是不能用这个属性实现样式效果
- `id`: 元素 id，文档内唯一
- `lang`: 元素内容的的语言
- `spellcheck`: 是否启动拼写和语法检查
- `style`: 行内 css 样式
- `tabindex`: 设置元素可以获得焦点，通过 tab 可以导航
- `title`: 元素相关的建议信息
- `translate`: 元素和子孙节点内容是否需要本地化

5. **从浏览器地址栏输入 url 到显示页面的步骤(以 HTTP 为例)**

   1. 在浏览器地址栏输入 URL

   2. 浏览器查看缓存，如果请求资源在缓存中并且新鲜，跳转到转码步骤

      1. 如果资源未缓存，发起新请求

      2. 如果已缓存，检验是否足够新鲜，足够新鲜直接提供给客户端，否则与服务器进行验证。

      3. 检验新鲜通常有两个 HTTP 头进行控制，Expires和Cache-Control

         - HTTP1.0 提供 Expires，值为一个绝对时间表示缓存新鲜日期
   - HTTP1.1 增加了 Cache-Control: max-age=,值为以秒为单位的最大新鲜时间    
      
3. 浏览器**解析 URL**获取协议，主机，端口，path
   
   4. 浏览器**组装一个 HTTP（GET）请求报文**
   
5. 浏览器
   
   获取主机 ip 地址，过程如下：
   
      1. 浏览器缓存
      2. 本机缓存
   3. hosts 文件
      4. 路由器缓存
      5. ISP DNS 缓存
      6. DNS 递归查询（可能存在负载均衡导致每次 IP 不一样）
   
   6. 打开一个 socket 与目标 IP 地址，端口建立 TCP 链接，三次握手如下：
   
      1. 客户端发送一个 TCP 的**SYN=1，Seq=X**的包到服务器端口
      2. 服务器发回**SYN=1， ACK=X+1， Seq=Y**的响应包
      3. 客户端发送**ACK=Y+1， Seq=Z**
   
   7. TCP 链接建立后**发送 HTTP 请求**
   
   8. 服务器接受请求并解析，将请求转发到服务程序，如虚拟主机使用 HTTP Host 头部判断请求的服务程序
   
   9. 服务器检查**HTTP 请求头是否包含缓存验证信息**如果验证缓存新鲜，返回**304**等对应状态码
   
   10. 处理程序读取完整请求并准备 HTTP 响应，可能需要查询数据库等操作
   
   11. 服务器将**响应报文通过 TCP 连接发送回浏览器**
   
   12. 浏览器接收 HTTP 响应，然后根据情况选择
   
       关闭 TCP 连接或者保留重用，关闭 TCP 连接的四次握手如下：
   
       1. 主动方发送**Fin=1， Ack=Z， Seq= X**报文
       2. 被动方发送**ACK=X+1， Seq=Z**报文
       3. 被动方发送**Fin=1， ACK=X， Seq=Y**报文
        4. 主动方发送**ACK=Y， Seq=X**报文
   
6. 浏览器检查响应状态吗：是否为 1XX，3XX， 4XX， 5XX，这些情况处理与 2XX 不同

7. 如果资源可缓存，**进行缓存**

   8. 对响应进行**解码**（例如 gzip 压缩）

   9. 根据资源类型决定如何处理（假设资源为 HTML 文档）

   10. **解析 HTML 文档，构件 DOM 树，下载资源，构造 CSSOM 树，执行 js 脚本**，这些操作没有严格的先后顺序，以下分别解释

   11. 构建 DOM 树：

       1. **Tokenizing**：根据 HTML 规范将字符流解析为标记
       2. **Lexing**：词法分析将标记转换为对象并定义属性和规则
       3. **DOM construction**：根据 HTML 标记关系将对象组成 DOM 树

12. 解析过程中遇到图片、样式表、js 文件，**启动下载**

13. 构建CSSOM 树：

    1. **Tokenizing**：字符流转换为标记流
    2. **Node**：根据标记创建节点

14. **CSSOM**：节点创建 CSSOM 树

[根据 DOM 树和 CSSOM 树构建渲染树](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction)

   1. 从 DOM 树的根节点遍历所有**可见节点**，不可见节点包括：1）`script`,`meta`这样本身不可见的标签。2)被 css 隐藏的节点，如`display: none`

2. 对每一个可见节点，找到恰当的 CSSOM 规则并应用，发布可视节点的内容和计算样式

3. js 解析，浏览器创建 Document 对象并解析 HTML，将解析到的元素和文本节点添加到文档中，此时**document.readystate 为 loading**

4. HTML 解析器遇到**没有 async 和 defer 的 script 时**，将他们添加到文档中，然后执行行内或外部脚本。这些脚本会同步执行，并且在脚本下载和执行时解析器会暂停。这样就可以用 document.write()把文本插入到输入流中。**同步脚本经常简单定义函数和注册事件处理程序，他们可以遍历和操作 script 和他们之前的文档内容**

    当解析器遇到设置了**async**属性的 script 时，开始下载脚本并继续解析文档。脚本会在它**下载完成后尽快执行**，但是**解析器不会停下来等它下载**。异步脚本**禁止使用 document.write()**，它们可以访问自己 script 和之前的文档元素
 5. 当文档完成解析，document.readState 变成 interactive

    所有**defer**脚本会**按照在文档出现的顺序执行**，延迟脚本**能访问完整文档树**，禁止使用 document.write()
 6. 浏览器**在 Document 对象上触发 DOMContentLoaded 事件**

    此时文档完全解析完成，浏览器可能还在等待如图片等内容加载，等这些**内容完成载入并且所有异步脚本完成载入和执行**，document.readState 变为 complete,window 触发 load 事件

7. **显示页面**（HTML 解析过程中会逐步显示页面）

<img src="http://image.cocoroise.cn/20200722124406.png" style="zoom:67%;" />

6. **如何进行网站性能优化**

   [雅虎 Best Practices for Speeding Up Your Web Site](https://developer.yahoo.com/performance/rules.html)：

   - content 方面
     1. 减少 HTTP 请求：合并文件、CSS 精灵、inline Image
     2. 减少 DNS 查询：DNS 查询完成之前浏览器不能从这个主机下载任何任何文件。方法：DNS 缓存、将资源分布到恰当数量的主机名，平衡并行下载和 DNS 查询
     3. 避免重定向：多余的中间访问
     4. 使 Ajax 可缓存
     5. 非必须组件延迟加载
     6. 未来所需组件预加载
     7. 减少 DOM 元素数量
     8. 将资源放到不同的域下：浏览器同时从一个域下载资源的数目有限，增加域可以提高并行下载量
     9. 减少 iframe 数量
     10. 不要 404
   - Server 方面
     1. 使用 CDN
     2. 添加 Expires 或者 Cache-Control 响应头
     3. 对组件使用 Gzip 压缩
     4. 配置 ETag
     5. Flush Buffer Early
     6. Ajax 使用 GET 进行请求
     7. 避免空 src 的 img 标签
   - Cookie 方面
     1. 减小 cookie 大小
     2. 引入资源的域名不要包含 cookie
   - css 方面
     1. 将样式表放到页面顶部
     2. 不使用 CSS 表达式
     3. 使用不使用@import
     4. 不使用 IE 的 Filter
   - Javascript 方面
     1. 将脚本放到页面底部
     2. 将 javascript 和 css 从外部引入
     3. 压缩 javascript 和 css
     4. 删除不需要的脚本
     5. 减少 DOM 访问
     6. 合理设计事件监听器
   - 图片方面
     1. 优化图片：根据实际颜色需要选择色深、压缩
     2. 优化 css 精灵
     3. 不要在 HTML 中拉伸图片
     4. 保证 favicon.ico 小并且可缓存
   - 移动方面
     1. 保证组件小于 25k
     2. Pack Components into a Multipart Document