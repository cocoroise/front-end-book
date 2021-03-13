# 跨域

### 原因

跨域问题其实就是浏览器的同源策略所导致的。

**「同源策略」**是一个重要的安全策略，它用于限制一个origin的文档或者它加载的脚本如何能与另一个源的资源进行交互。它能帮助阻隔恶意文档，减少可能被攻击的媒介。

同源：协议，域名，端口一致。

### 解决方法

1. #### CROS

   跨域资源共享(CORS) 是一种机制，它使用额外的 HTTP 头来告诉浏览器 让运行在一个 origin (domain) 上的 Web 应用被准许访问来自不同源服务器上的指定的资源。当一个资源从与该资源本身所在的服务器「不同的域、协议或端口」请求一个资源时，资源会发起一个「跨域 HTTP 请求」。

   这个前端不需要做什么操作，只主要后端配置响应头。

   ```javascript
   app.use(async (ctx, next) => {
     ctx.set("Access-Control-Allow-Origin", ctx.headers.origin);
     ctx.set("Access-Control-Allow-Credentials", true);
     ctx.set("Access-Control-Request-Method", "PUT,POST,GET,DELETE,OPTIONS");
     ctx.set(
       "Access-Control-Allow-Headers",
       "Origin, X-Requested-With, Content-Type, Accept, cc"
     );
     if (ctx.method === "OPTIONS") {
       ctx.status = 204;
       return;
     }
     await next();
   });
   ```

   关于cros的cookie问题

   - web 请求设置`withCredentials`
   - Access-Control-Allow-Credentials 为 true
   - Access-Control-Allow-Origin为非 *

2. #### nginx反向代理

3. #### jsonp

   `JSONP` 主要就是利用了 `script` 标签没有跨域限制的这个特性来完成的。

   使用限制：只能进行get请求。

4. #### postMessage

   **「window.postMessage()」** 方法可以安全地实现跨源通信。通常，对于两个不同页面的脚本，只有当执行它们的页面位于具有相同的协议（通常为 https），端口号（443 为 https 的默认值），以及主机 (两个页面的模数 `Document.domain`设置为相同的值) 时，这两个脚本才能相互通信。**「window.postMessage()」** 方法提供了一种受控机制来规避此限制，只要正确的使用，这种方法就很安全。

   用途：

   1.页面和其打开的新窗口的数据传递

   2.多窗口之间消息传递

   3.页面与嵌套的 iframe 消息传递

[10种跨域解决方案](https://mp.weixin.qq.com/s/Nk8YPYQDUJOKgQ9Qa7byag)

