# HttpProxyMiddleware源码解析

### 🍶介绍

**HttpProxyMiddleware**是一个提供http请求代理的插件，平常我们会通过`webpack`的`devServer`使用到它，在`config`里配置一下

```
proxy: {
      "^/user": {
        target: "http://yourServerName.com",
        ws: false,
        changeOrigin: true,
        logLevel: "debug",
      },
    },
```

就能把你的请求代理到 `http://yourServerName.com`,从而避免开发时跨域的情况。

### 🍐使用

```javascript
 1 // 引用依赖
 2 const express = require('express');
 3 const proxy = require('http-proxy-middleware');
 4 
 5 // proxy 中间件的选择项
 6 const options = {
 7         target: 'http://www.example.org', // 目标服务器 host
 8         changeOrigin: true,               // 默认false，是否需要改变原始主机头为目标URL
 9         ws: true,                         // 是否代理websockets
10         pathRewrite: {
11             '^/api/old-path' : '/api/new-path',     // 重写请求，比如我们源访问的是api/old-  path，那么请求会被解析为/api/new-path
12             '^/api/remove/path' : '/path'           // 同上
13         },
14         router: {
15             // 如果请求主机 == 'dev.localhost:3000',
16             // 重写目标服务器 'http://www.example.org' 为 'http://localhost:8000'
17             'dev.localhost:3000' : 'http://localhost:8000'
18         }
19     };
20 
21 // 创建代理
22 const exampleProxy = proxy(options);
23 
24 // 使用代理
25 const app = express();
26     app.use('/api', exampleProxy);
27     app.listen(3000);
```



### 🍤转发规则

从原理层面简单的归纳转发规则，就是客户端请求路径到目标服务器地址的映射关系。

http-proxy 库将转发规则分为两部分加以配置，context 用于匹配需要转发的客户端请求，options.target 用于设定目标服务器的 host；

- option.router 根据客户端请求重新设定目标服务器的 host（这样，根据不同的请求，可以设定多个目标服务器）；

- option.pathRewrite 用于辅助将客户端请求路径转化为目标服务器地址。

### 🥠运行流程

其实流程也挺简单，就是通过正则判断一下是否需要代理，然后把对应的路径替换成你想要的路径，再给到http-proxy进行代理。虽然看起来不麻烦，但是看看人家组织的代码，还是有很多可以学习的地方。

主流程如下：

1. 创建config，通过`createConfig`函数调用创建config的工厂类，主要有`options`和 `context`;
2. 配置logger实例
3. 通过 `http-proxy`创建代理服务器
4. 最核心的一个步骤， `createPathRewriter`会根据 `options.pathRewrite`生成对应转化的路径
5. 通过 `handler`创建监听函数，监听 `http-proxy`的事件
6. 创建转发 http, https, websocket 请求的代理中间件

### 🍪代码详情

代码里入口文件是 `http-proxy-middleware.ts`,这个文件100多行吧，相当于控制器，起到调用其他功能的作用。其他功能比如logger,path-rewrite,handlers都写在另外的文件里，就会让主控制器的代码显得非常的干净。

在`http-proxy-middleware.ts`的构造函数里就已经写了整个调度的过程了

```typescript
constructor(context, opts) {
    this.config = createConfig(context, opts);
    this.proxyOptions = this.config.options;

    // 创建代理
    this.proxy = httpProxy.createProxyServer({});
    this.logger.info(
      `[HPM] Proxy created: ${this.config.context}  -> ${this.proxyOptions.target}`
    );

    // 重写path
    this.pathRewriter = PathRewriter.createPathRewriter(
      this.proxyOptions.pathRewrite
    ); // returns undefined when "pathRewrite" is not provided

    // 监听 http-proxy 的事件
    handlers.init(this.proxy, this.proxyOptions);

    // 监听错误事件
    this.proxy.on('error', this.logError);
  }
```

再往下看,这里是实际代理到 `http-proxy`的代理函数。这个 `this.proxy`就是实例化的代理服务器。

```typescript
public middleware = async (req, res, next) => {
    if (this.shouldProxy(this.config.context, req)) {
      const activeProxyOptions = this.prepareProxyRequest(req);
      this.proxy.web(req, res, activeProxyOptions);
    } else {
      next();
    }

    if (this.proxyOptions.ws === true) {
      // use initial request to access the server object to subscribe to http upgrade event
      this.catchUpgradeRequest(req.connection.server);
    }
  };
```

其中最主要的就是 `prepareProxyRequest`方法，看看里面为代理准备了什么东西。

```typescript
private prepareProxyRequest = req => {
    req.url = req.originalUrl || req.url;

    // 保存一开始的请求路径
    const originalPath = req.url;
    const newProxyOptions = _.assign({}, this.proxyOptions);

    // 按顺序重写转发规则：
    // 1. option.router
    // 2. option.pathRewrite
    this.applyRouter(req, newProxyOptions);
    this.applyPathRewrite(req, this.pathRewriter);

    return newProxyOptions;
  };

// 重新映射新的服务器地址
  private applyRouter = (req, options) => {
    let newTarget;

    if (options.router) {
      newTarget = Router.getTarget(req, options);

      if (newTarget) {
        this.logger.debug(
          '[HPM] Router new target: %s -> "%s"',
          options.target,
          newTarget
        );
        // 改变的是请求的目标
        options.target = newTarget;
      }
    }
  };

// 根据规则重写请求的url
  private applyPathRewrite = (req, pathRewriter) => {
    if (pathRewriter) {
      const path = pathRewriter(req.url, req);

      if (typeof path === 'string') {
        // 改变的是请求的url 
        req.url = path;
      } else {
        this.logger.info(
          '[HPM] pathRewrite: No rewritten path found. (%s)',
          req.url
        );
      }
    }
  };
```

### 🌲总结

其实这个库就是一个封装 [http-proxy](https://github.com/http-party/node-http-proxy)的仓库，让我们使用代理起来更加简单。如果想了解关于 `http-proxy` 更多，可以看 [这篇文章](https://zhuanlan.zhihu.com/p/49119286)。
