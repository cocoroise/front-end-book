# Koa源码解析

### 🎧简介

[Koa](https://koa.bootcss.com/)是一个简单轻量的node开发框架，用来创建http请求，拦截错误，使用中间件的形式处理http发送和返回的请求。

在研究一个东西之前，先想想这个东西为什么会出现。原生的创建一个http请求并监听的代码是这样的：

```javascript
const http = require('http');

// 创建httpServer
const server = http.createServer((req, res) => {
  res.writeHead(200);
  // 这里写处理请求的函数
  res.end('hello world');
});
// 监听端口
server.listen(3000, () => {
  console.log('server start at 3000');
});
```

在httpServer这个方法里可以接受一个回调函数，如果我们不拆分代码的话，这里就会变得非常的冗杂。就算拆分了，在这里写一系列的处理函数，也很难控制和知道请求现在走到哪一步了。如果换做用Koa，就会像下面这样：

```javascript
const Koa = require('koa');
const app = new Koa();

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// response
app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);

```

> 官方解释：当请求开始时首先请求流通过 `x-response-time` 和 `logging` 中间件，然后继续移交控制给 `response` 中间件。当一个中间件调用 `next()` 则该函数暂停并将控制传递给定义的下一个中间件。当在下游没有更多的中间件执行后，堆栈将展开并且每个中间件恢复执行其上游行为。

这样组织的代码非常的清晰易懂，在node应用里，我们可以通过这样的方法引入别人写的中间件，比如日志，路由，cors，bodyPaeser等，也可以自己写一个中间件，每一步从发起请求到返回的数据，都能看到很清晰的数据流向。
    
### 🎐几个Koa API


- app.listen  // 监听函数，传入端口号
- app.callback()  // http.createServer()的回调函数
- app.use()   // 传入中间件
- app.context  // ctx上下文，里面有ctx.request和ctx.response

    
  
### 🎦疑问


1. koa如何把http的request和response挂到ctx这个对象上的?
2. 中间件机制是如何实现的？next()函数又是啥？
3. koa是怎么处理http的错误的？




### 📖koa整体架构

> 源码参考自：[koa GitHub](https://github.com/koajs/koa) [learn-koa2](https://github.com/deepred5/learn-koa2)
>

![](http://image.cocoroise.cn/image/Koa.png)

- request.js -> 请求体，里面包含一系列对http request get和set的方法，所有的操作都是在this.req上进行的
- response.js -> 返回体，同上，只不过数据结构和请求体不同
- context.js -> 使用[delegates](https://www.npmjs.com/package/delegates)把原生的http请求数据挂到this.ctx.request和this.ctx.response上
- application.js -> 核心文件，负责发起请求，监听，错误处理，传入中间件，处理request和response

接下来细说各个部分的功能。


#### 🙍‍♀️request.js和response.js

这两个是处理请求体的工具，主要作用就是把http上的数据拿过来自己用，封装了一层，这样使用的人就不会直接更改到http上的数据，而是通过了它再处理的。看一小段源码就很容易看懂了。

```javascript
// request.js
module.exports={
  get header() {
    return this.req.headers;
  },
  set header(val) {
    this.req.headers = val;
  },
  get href() {
    // support: `GET http://example.com/foo`
    if (/^https?:\/\//i.test(this.originalUrl)) return this.originalUrl;
    return this.origin + this.originalUrl;
  },
  set path(path) { // 把传入的path写在了this.url上
    const url = parse(this.req);
    if (url.pathname === path) return;

    url.pathname = path;
    url.path = null;

    this.url = stringify(url);
  },
    // ....
}
```

再看response.js的源码，同样也是把http response对象挂在this.res上。

```javascript
// response.js
module.exports={
    get length() { // 各种情况下length的处理
        if (this.has('Content-Length')) {
          return parseInt(this.get('Content-Length'), 10) || 0;
        }

        const { body } = this;
        if (!body || body instanceof Stream) return undefined;  // stream 类型
        if ('string' === typeof body) return Buffer.byteLength(body);  // string类型
        if (Buffer.isBuffer(body)) return body.length;  // buffer类型
        return Buffer.byteLength(JSON.stringify(body));
    },
    get lastModified() {
        const date = this.get('last-modified');
        if (date) return new Date(date);
    },
    set lastModified(val) {
        if ('string' == typeof val) val = new Date(val);
        this.set('Last-Modified', val.toUTCString());
    },
    // ...
}
```

总之，这两货就是把http的一些方法挂在自己下面，当时我们平时用不是通过this.ctx.req和this.ctx.res拿的吗，那是怎么又到ctx这家伙下面的呢，接下来就是context出场了。


#### 🙋‍♀️context.js

看看context下都写了些啥。

```javascript
const proto = module.exports={
    toJSON() { // 返回json的对象
        return {
          request: this.request.toJSON(),
          response: this.response.toJSON(),
          app: this.app.toJSON(),
          originalUrl: this.originalUrl,
          req: '<original node req>',
          res: '<original node res>',
          socket: '<original node socket>'
        };
  },
    onerror(err) { // 错误捕获
        const { res } = this;

        if ('ENOENT' == err.code) {
          err.status = 404;
        } else {
          err.status = 500;
        }

        this.status = err.status;

        // 核心：触发error事件
        this.app.emit('error', err, this);

        res.end(err.message || 'Internal error');
  	},
    // get Cookies() && set Cookies()
}

// 把上面的request和response delegates 到自己名下
// 相当于👇
// proto.attachment() = response.attachment();
// proto.status = response.status;
/**
 * Request delegation.
 */
delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('has')
  .method('set')
  .method('append')
  .method('flushHeaders')
  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')
  .getter('headerSent')
  .getter('writable');

/**
 * Request delegation.
 */
delegate(proto, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncodings')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')
  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('method')
  .access('query')
  .access('path')
  .access('url')
  .access('accept')
  .getter('origin')
  .getter('href')
  .getter('subdomains')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('URL')
  .getter('header')
  .getter('headers')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip');
```

上面三个文件可以说是把需要的res和req都准备好了，接下来就是最重要的调用过程，这个过程都写在applicaiton.js文件里。


#### 🙆‍♀️application.js

​        ![](http://image.cocoroise.cn/image/koa-2.png)

整体运行过程：

1. 初始化，示例化几个重要的变量。
2. 调用`use(fn)`，传入中间件。实际就是往`this.middleware`里push函数。
3. 调用`listen(...argd)`，监听一个端口，传入回调函数。回调函数依次执行了compose几个中间件，创建ctx，处理request，处理response，捕获错误，结束这次请求（也就是把response.finished设成true）。

先抛开compose函数后面详讲，这里请求的流向非常的一目了然。res和req先进入`createContext(res,req)`里，被koa代理成为this上的数据。

```javascript
createContext(req, res) {
    const context = Object.create(this.context);
    const request = (context.request = Object.create(this.request));
    const response = (context.response = Object.create(this.response));
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.state = {};
    return context;
  }
```

接着，包装好的`ctx`和`fns`就进入`handleReQuest(ctx,fn)`。

```javascript
handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx) // 执行中间件
      .then(handleResponse) // 处理response
      .catch(onerror); // 捕获错误
  }
```

`hanldeResponse(ctx)`主要处理了一些body的情况。

```javascript
// ...
  if (Buffer.isBuffer(body)) return res.end(body);
  if ("string" == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
```

最后调用一下结束http的回调函数`onFinished(res,onerror)`，整个流程就算是结束了。


### 📌大名鼎鼎的compose函数

回到一开始的例子，为啥程序运行到`await next()`的时候就会进入下一个中间件，处理完之后才会仔回过头来继续处理。compose的源码放在[koa/compose](https://github.com/koajs/compose)这个仓库里。其实这个函数也很简单，就是一个递归的概念。

```javascript
function compose(middleware) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('传入的参数必须为一个数组');
  }
  for (const fn of middleware) {
    if (typeof fn !== 'function') {
      throw new TypeError('中间件必须为一个函数');
    }
  }

  return function(context, next) {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index) {
        Promise.reject(new Error('next被调用了多次'));
      }
      index = i;
      // 当前执行的中间件
      let fn = middleware[i];
      // 中间件的函数全部执行完毕
      if (i === middleware.length) {
        // 这里的next其实没有用 只是用来处理i ===middleware.length的情况 
      	// next永远是空 这个next和下面的next是不一样的
        fn = next;
      }
      if (!fn) return Promise.resolve();
      try {
          /* 
          * 使用了bind函数返回新的函数，类似下面的代码
          return Promise.resolve(fn(context, function next () {
            return dispatch(i + 1)
          }))
        */
        // dispatch.bind(null, i + 1)就是中间件里的next参数，调用它就可以进入下一个中间件
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  };
}
```

> next就是一个包裹了dispatch的函数
>
> 在第n个中间件中执行next，就是执行dispatch(n+1)，也就是进入第n+1个中间件
>
> 因为dispatch返回的都是Promise，所以在第n个中间件await next(); 进入第n+1个中间件。当第n+1个中间件执行完成后，可以返回第n个中间件
>
> 如果在某个中间件中不再调用next，那么它之后的所有中间件都不会再调用了


​    
### 🎨总结

这个短小精湛的库，总共只有4个文件和2000+代码，但是结构和设计都很优雅，设计到了数据代理，逻辑拆分，洋葱模型之类的概念，并且支持async await，使用起来也非常的方便。市面上也有成熟基于 koa2 的企业级解决方案，如 eggjs 和 thinkjs。以后有空再康康阿里的egg，看看在koa的基础上拓展了什么东西😜。

