# Cookie 和 SameSite 属性

### cookie介绍

作为一段一般不超过 4KB 的小型文本数据，它由一个名称（Name）、一个值（Value）和其它几个用于控制 Cookie 有效期、安全性、使用范围的可选属性组成。

因为http是一个无状态的协议，所以一开始没有localstorage的时候，就只能通过cookie保存用户的状态。cookie是服务器端返回的数据，在服务器返回cookie之后，浏览器会把它保存在本地，然后在请求头里携带，这样浏览器就能识别唯一的用户状态了。

### cookie设置

1. 客户端发送 HTTP 请求到服务器
2. 当服务器收到 HTTP 请求时，在响应头里面添加一个 **Set-Cookie** 字段
3. 浏览器收到响应后保存下 Cookie
4. 之后对该服务器每一次请求中都通过 Cookie 字段将 Cookie 信息发送给服务器。

### cookie属性

- Name/value

  用 JavaScript 操作 Cookie 的时候注意对 Value 进行编码处理。

- expires

  用于设置过期时间

  > Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT;

- max-age

  Max-Age 用于设置在 Cookie 失效之前需要经过的秒数。

  > Set-Cookie: id=a3fWa; Max-Age=604800;

- domain

  指定cookie可以送达的域名。可以设置二级域名，但是不能设置成其他域名，比如把阿里域下的domain设置成百度的是无效的。

- path

  Path 指定了一个 URL 路径，这个路径必须出现在要请求的资源的路径中才可以发送 Cookie 首部。

- secure

  标记为 Secure 的 Cookie 只应通过被HTTPS协议加密过的请求发送给服务端。使用 HTTPS 安全协议，可以保护 Cookie 在浏览器和 Web 服务器间的传输过程中不被窃取和篡改。

- httponly

  设置 HTTPOnly 属性可以防止客户端脚本通过 document.cookie 等方式访问 Cookie，有助于避免 XSS 攻击。

- samesite

  SameSite 属性可以让 Cookie 在跨站请求时不会被发送，从而可以阻止跨站请求伪造攻击。

  接下来细讲。

### Same-site属性

SameSite 可以有下面三种值：

1. **Strict** 仅允许一方请求携带 Cookie，即浏览器将只发送相同站点请求的 Cookie，即当前网页 URL 与请求目标 URL 完全一致。
2. **Lax** 允许部分第三方请求携带 Cookie。
3. **None** 无论是否**跨站**都会发送 Cookie。

之前默认是 None 的，Chrome80 后默认是 Lax。

#### 跨站和跨域

- 跨站：eTLD不一致

- 跨域：协议，域名，端口不一致

#### chrome改了samesite属性影响

改了之后，有一些使用iframe内嵌的页面，比如订单支付，广告，埋点等等，需要通过cookie来获取用户状态，就无法获取到了。

解决办法是手动把samesite设置回去。

### Cookie 的作用

Cookie 主要用于以下三个方面：

1. 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
2. 个性化设置（如用户自定义设置、主题等）
3. 浏览器行为跟踪（如跟踪分析用户行为等）

### 参考

[浏览器系列之Cookie和same-site属性](https://github.com/mqyqingfeng/Blog/issues/157)

