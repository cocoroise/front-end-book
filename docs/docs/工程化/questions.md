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

   cdn：内容分发网络。
   CDN的工作原理就是将源站的资源缓存到位于**全球各地的CDN节点上**，用户请求资源时，就近返回节点上缓存的资源，而不需要每个用户的请求都回您的源站获取，避免网络拥塞、缓解源站压力，保证用户访问资源的速度和体验。

   有了cdn之后的访问过程为：

   1. 用户输入访问的域名,操作系统向 LocalDns 查询域名的ip地址.
   2. LocalDns向 ROOT DNS 查询域名的授权服务器(这里假设LocalDns缓存过期)
   3. ROOT DNS将域名授权dns记录回应给 LocalDns
   4. LocalDns得到域名的授权dns记录后,继续向域名授权dns查询域名的ip地址
   5. 域名授权dns 查询域名记录后(一般是CNAME)，回应给 LocalDns
   6. LocalDns 得到域名记录后,向智能调度DNS查询域名的ip地址
   7. 智能调度DNS 根据一定的算法和策略(比如静态拓扑，容量等),将最适合的CDN节点ip地址回应给 LocalDns
   8. LocalDns 将得到的域名ip地址，回应给 用户端
   9. 用户得到域名ip地址后，访问站点服务器
   10. CDN节点服务器应答请求，将内容返回给客户端.(缓存服务器一方面在本地进行保存，以备以后使用，二方面把获取的数据返回给客户端，完成数据服务过程)

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

