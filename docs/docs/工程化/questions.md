# 常见问题

1. **对tree-shaking的了解？**
   
   - 虽然生产模式下默认开启，但是由于经过了babel编译，全部模块都被封装成IIFE，所以其实shaking的程度并不如我们想象的那么多
   - es6是静态加载的，所以它可以在代码不运行的条件下就能分析出不需要使用的代码，而commonjs是动态加载的，对shaking支持不够
   - 使用过的export被标记为/ * harmony export ([type]) * /，没有被使用过的export被标记为/ * unused harmony export [FuncName] * /
   - IIFE存在副作用无法被tree-shaking掉
   - sideEffect决定了副作用的处理方式，可以提高有效代码的纯粹度。为false的时候，表示可以安全的删除未使用的export；为true或者一个文件数组的时候，表示这个文件可以有副作用，不能将它删除。
   - 使用rollup打包的好处：可以导出es模块的包，支持程序流分析，可以更正确的判断项目本身的代码是否有副作用，对tree-shaking支持更友好
   
   参考：
   
   [Tree-Shaking性能优化实践 - 原理篇](https://juejin.im/post/6844903544756109319)
   
   [Tree Shaking原理 -【webpack进阶系列】](https://segmentfault.com/a/1190000022194321)
   
   推荐 - [你的Tree-shaking并没什么卵用](https://segmentfault.com/a/1190000012794598)
   
2. **commonJs和es6 module的区别？**

   - commonjs是加载时运行，而es module是编译时运行
   - commonjs输出的是值的浅拷贝，es module是值的引用
   - webpack的webpack_require对他们的处理方式不同
   - CommonJS规范主要用于服务端编程，加载模块是同步的，这并不适合在浏览器环境，因为同步意味着阻塞加载，浏览器资源是异步加载的，因此有了AMD CMD解决方案。

3. **前端大型文件上传优化？**

   - 文件切片

   - 用web-worker单独计算文件的hash值

- 进度条处理
  
   - 对已经传过的文件跳过秒传，对失败的文件做重传处理
   
   - 上传由于和其他接口同一域名，所以要做并发数处理
   
     https://juejin.im/post/6844904046436843527
   
4. **hmr实现原理**

   - 用户修改了某个文件，被webpack监听到了，根据配置文件对模块重新编译打包，并将打包后的代码通过简单的对象保存在内存中。

   - webpack-dev-server监听静态文件的变化，通知浏览器进行live reload。

   - Webpack-dev-server通过sockjs在浏览器和服务器之间建立一个websocket长链接，把webpack编译打包的各个阶段的状态告诉浏览器。主要传递的信息其实就是新模块的hash值。

   - HMR运行时再替换更新中的模块。如果确定这些模块无法更新，则触发整个页面刷新

5. **JSBridge 原理**

   1. 首先，向body里添加一个不可见的iframe，通过拦截url的方式来执行相应的操作，但是页面本身是不能跳转的，所以通过这种方式能用户无感知的传达信息。
   2. H5页面初始化的时候，注册handler，js把消息内容放在sendMessageQueue里面，设置iframe的src为`andriod://__QUEUE_MESSAGE_`(自行约定)。
   3. 通过shouldOverrideUrlLoading来拦截约定规则的url，再做具体的操作。

6. **CDN 的特点，用 CDN 资源为什么快**

   CDN：内容分发网络。
   CDN的工作原理就是将源站的资源缓存到位于**全球各地的CDN节点上**，用户请求资源时，就近返回节点上缓存的资源，而不需要每个用户的请求都回您的源站获取，避免网络拥塞、缓解源站压力，保证用户访问资源的速度和体验。

   首先，浏览器会先请求CDN域名，CDN域名服务器会给浏览器返回指定域名的CNAME，浏览器在对这些CNAME进行解析，得到CDN缓存服务器的IP地址，浏览器在去请求缓存服务器，CDN缓存服务器根据内部专用的DNS解析得到实际IP，然后缓存服务器会向实际IP地址请求资源，缓存服务器得到资源后进行本地保存和返回给浏览器客户端。

7. **如何实现一个组件按需加载**

   依照tree-shaking的原理，想按需加载就得使用es6的import语法。

   - 组件按需加载的实现可以参考an-design的技术方案，使用import引入，并提供一个babel插件`babel-plugin-import`，把用户的引入

     ```
     import {Button} from 'ant-design';
     ```

     转化成

     ```
     import Button from 'ant-design-vue/lib/Button'
     import 'ant-design-vue/lib/button/style'; 
     ```

   - 使用()=>import('components/...')，异步加载组件

8. **全局错误监控的原理是什么**

   [学习 sentry 源码整体架构，打造属于自己的前端异常监控SDK](https://juejin.im/post/6844903984457580551#heading-2)

   - 重写window.error方法，重写window.onunhandledrejection方法，拦截全局的错误
   - 使用ajax或者img.src上报错误，支持fetch的话使用fetch，如果不支持使用xhr

9. **WebAssembly 是什么，一般用来做什么**

   [JavaScript 工作原理之六－WebAssembly 对比 JavaScript 及其使用场景](https://juejin.im/post/6844903606244605959)

   WebAssembly（又称 wasm） 是一种用于开发网络应用的高效，底层的字节码。

   WASM 让你在其中使用除 JavaScript 的语言以外的语言（比如 C, C++, Rust 及其它）来编写应用程序，然后编译成（提早） WebAssembly。

   浏览器会更加快速地加载 WebAssembly，因为 WebAssembly 只会传输已经编译好的 **wasm** 文件。而且 wasm 是底层的类汇编语言，具有非常紧凑的二进制格式。

   使用场景：

   - WebAssembly 的最初版本主要是为了解决**大量计算密集型的计算**的（比如处理数学问题）。最为主流的使用场景即游戏－处理大量的像素。

   - 你可以使用你熟悉的 **OpenGL** 绑定来编写 C++/Rust 程序，然后编译成 wasm。之后，它就可以在浏览器中运行。
   - 另一个合理使用 WebAssembly （高性能）的情况即实现一些处理**计算密集型的库**。比如，一些图形操作。

10. **扫码登录的实现逻辑**

    1. 把登陆的网址和一个全局唯一id拼成一个网址，比如https://login.weixin.qq.com/l/obsbQ-Dzag==，生成二维码
    2. 用户打开手机扫描这个网址，手机把这个全局id和用户的信息一起提交给服务器
    3. 服务器把这个id和用户的账号绑定到一起，通知网页登陆成功，通知手机登陆成功

11. **如何使用动态的 JS 代码生成动态的 Web Worker 实例**

    [动态创建 Web Worker 实践指南](https://zhuanlan.zhihu.com/p/59981684)

    Blob + URL.createObjectURL

    ```javascript
    window.URL = window.URL || window.webkitURL;
    
    const response = `onmessage = ({ data: { data } }) => {
      console.log('Message received from main script');
      const {method} = data;
      if (data.data && method === 'format') {
        postMessage({
          data: {
            'res': 'I am a customized result string.',
          }
        });
      }
      console.log('Posting message back to main script');
    }`;
    const blob = new Blob([response], {type: 'application/javascript'});
    
    const worker = new Worker(
      URL.createObjectURL(blob)
    );
    
    ```

12. **Websocket 和 TCP Socket的区别是什么？**Websocket 的握手过程，为什么要基于 HTTP 请求来握手？

    Websocket协议是基于TCP协议之上的一种实现，就像HTTP也是基于TCP的一种实现一样。

    每个WebSocket连接都始于一个HTTP请求。 具体来说，WebSocket协议在第一次握手连接时，需要通过HTTP协议在传送WebSocket支持的版本号，协议的字版本号，原始地址，主机地址等等一些列字段给服务器端。

    - WebSocket设计上就是天生为HTTP增强通信（全双工通信等），所以在HTTP协议连接的基础上是很自然的一件事，并因此而能获得HTTP的诸多便利。

    - 基于HTTP连接将获得最大的一个兼容支持，比如即使服务器不支持WebSocket也能建立HTTP通信，只不过返回的是onError而已，这显然比服务器无响应要好的多。

13. **如何判断模块的循环引用**

    DFS 拓扑排序:

    将一个有**向图无环图（DAG）**的所有顶点排成一个线性序列，若该线性序列满足：**每一个顶点都不会通过边，指向其在此序列中的前驱顶点**，则该线性序列称为该图的一个拓扑排序。

    解决：

    - CommonJS模块的重要特性是加载时执行，即脚本代码在`require`的时候，就会全部执行。**CommonJS的做法是，一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出。**
    - ES6模块的运行机制与CommonJS不一样，它遇到模块加载命令`import`时，不会去执行模块，而是只生成一个引用。等到真的需要用到时，再到模块里面去取值。因此，ES6模块是动态引用，不存在缓存值的问题，而且模块里面的变量，绑定其所在的模块。

14. **如何提高Node.js 程序的稳健性**

    1. 保持良好的代码结构
    2. 使用try catch来捕获抛出异常
    3. 使用process.on来处理未被捕捉的错误
    4. 使用domain模块来处理程序的异常 - domain是 [EventEmitter](http://nodeapi.ucdok.com/api/events.html#events_class_events_eventemitter)类的一个子类。监听它的`error`事件来处理它捕捉到的错误。
    5. 使用log4js来记录程序运行日志
    6. 使用forever模块来管理nodejs - 它能帮助你重启服务器

15. **假设现在有一个微信公众号文章的页面，可以展示文章、图片、视频和读者留言，从安全和交互性能的角度去讲一下如何优化**

    安全：用户输入的时候编辑页面防止 XSS 攻击、敏感字符过滤、外链资源白名单过滤、图片资源脱敏处理转换为本地资源；优化：关键请求路径优化、事件监听节流、非首屏资源懒加载、代码压缩、服务端渲染、利用好缓存策略、开启 HTTP2

16. **使用import时，Webpack对node_modules里的依赖会做什么 - 模块解析**

    [模块解析(module resolution) - webpack](https://www.webpackjs.com/concepts/module-resolution/)

    1. 模块将在 [`resolve.modules`](https://www.webpackjs.com/configuration/resolve/#resolve-modules) 中指定的所有目录内搜索。
    2. 可以替换初始模块路径，此替换路径通过使用 [`resolve.alias`](https://www.webpackjs.com/configuration/resolve/#resolve-alias) 配置选项来创建一个别名。
    3. 如果路径指向一个文件
       1. 如果路径具有文件扩展名，则被直接将文件打包。
       2. 否则，使用[reslove.extensions]选项作为文件拓展名来解析。
    4. 如果路径指向一个文件夹
       1. 如果文件夹包括一个package.json文件，那么从package.json的main字段里获取入口信息
       2. 如果不包含这个文件，那么按照按照顺序查找 [`resolve.mainFiles`](https://www.webpackjs.com/configuration/resolve/#resolve-mainfiles) 配置选项中指定的文件名，看是否能在 import/require 目录下匹配到一个存在的文件名。

17. **Pm2怎么做进程管理，如何使用pm2稳定运行项目**

    进程管理：

    - 负载均衡
    - fork不支持定时重启，cluster支持定时重启
    - pm2 monit 可以监控项目运行状态

    稳定运行：

    - 定时重启
    - 最大内存限制
    - 合理min_uptime，min_uptime是应用正常启动的最小持续运行时长，超出此时间则被判定为异常启动；
    - 设定异常重启延时和异常重启次数，可以解决某些异常下重启次数过多的问题

18. **定时器为什么是不精确的**

    - **setTimeout**函数做的事情是，设置一个定时器，当定时器到点了就执行某个函数。但是如果当前的事件队列里的事件很多，没有执行完的话，就可能会延迟执行。

    - **setInterval**的回调函数并不是到时后立即执行，而是等**系统计算资源空闲下来后才会执行**。而下一次触发时间则是在setInterval回调函数执行完毕之后才开始计时，所以如果setInterval内执行的计算过于耗时，或者有其他耗时任务在执行，setInterval的计时会越来越不准。

19. **Babel的原理是什么?** 

    babel 的转译过程也分为三个阶段，这三步具体是： 

    1. **解析** Parse: 将代码解析⽣成抽象语法树( 即AST )，即词法分析与语法分析的过程 

    2. **转换** Transform: 对于 AST 进⾏变换⼀系列的操作，babel 接受得到 AST 并通过 babel-traverse 对其进⾏遍历，在 此过程中进⾏添加、更新及移除等操作 

    3. **⽣成** Generate: 将变换后的 AST 再转换为 JS 代码, 使⽤到的模块是 babel-generator 

20. **前端如何做性能监控？**

    对于性能监控来说，我们可以直接使用浏览器自带的 [Performance API](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance) 来实现这个功能。

    对于性能监控来说，其实我们只需要调用 `performance.getEntriesByType('navigation')` 这行代码就行了。

    复杂一点也可以使用chrome的puppeteer api。

21. **使用import时，Webpack对node_modules里的依赖会做什么**