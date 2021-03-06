# HTTP详解

### 介绍

http是基于tcp的一种协议，处于应用层。基于自己对它其实一知半解的状态，这篇想把相关的知识都总结一下。先是介绍它的特点，数据格式，然后延伸到https的加密方式，http2的特点和简单原理。系统的梳理一遍之后，应该对整个请求连接的建立都有了比较全面的认识。

### HTTP篇

#### 特点

- 简单：客户向服务器请求服务时，只需传送请求方法和路径。请求方法常用的有GET、HEAD、POST。每种方法规定了客户与服务器联系的不同类型。由于HTTP协议简单，使得HTTP服务器的程序规模小，因而通信速度很快。

- 灵活：HTTP允许传输任意类型的数据对象。正在传输的类型由Content-Type加以标记。

- 请求-响应模式：客户端每次向服务器发起一个请求时都建立一个连j接， 服务器处理完客户的请求即断开连接。

- 无状态：HTTP协议是无状态协议。无状态是指协议对于事务处理没有记忆能力。缺少状态意味着如果后续处理需要前面的信息，则它必须重传，这样可能导致每次连接传送的数据量增大。 

#### 数据格式

请求行、消息报头、请求正文

![截屏2020-10-25 下午4.17.24](http://image.cocoroise.cn/截屏2020-10-25 下午4.17.24.png)

#### 请求方法

HTTP1.0定义了三种请求方法： GET, POST 和 HEAD方法。
HTTP1.1新增了五种请求方法：OPTIONS, PUT, DELETE, TRACE 和 CONNECT 方法。

### HTTPS篇

HTTPS（全称：Hypertext Transfer Protocol over Secure Socket Layer），是以安全为目标的HTTP通道，简单讲是HTTP的安全版。

#### 加密方式

- 对称加密：加密解密都是一个密钥
- 非对称加密：公钥和私钥成对出现，公钥加密私钥解密，私钥加密公钥解密

#### 对称和非对称的区别

- 对称加密速度快，非对称加密速度慢
- 对称加密只有一个密钥，不安全
- 非对称加密暴漏公钥，供客户端加密，服务端使用私钥解密

#### 加密流程

![截屏2020-10-25 下午4.51.28](http://image.cocoroise.cn/截屏2020-10-25 下午4.51.28.png)

#### 中间人攻击

中间人的确无法拿到私钥A‘进行解密，但是只要能拿到浏览器生成的X和服务器端进行通信不就行了。上面的加密流程的确能确保X是只有客户端和服务器能拿到的吗？其实不是。

1. 中间人生成一对自己的密钥B和B’。
2. 中间人劫持服务器发来的公钥A，把自己的公钥B发给浏览器。
3. 浏览器拿到B之后，生成一个随机密钥X，使用公钥B加密X，发给服务器。
4. 中间人劫持浏览器的数据，用自己的私钥B‘解密这个数据，拿到随机密钥X。
5. 中间人发送用A加密的数据给服务器，浏览器和服务器都没有发现异常。

这个问题产生的原因在于，浏览器不知道公钥被替换了。数字证书就是为了解决这个问题的。

#### 数字证书

网站在使用HTTPS之前，需要向CA机构申请一份数字证书，证书里有证书持有者，公钥等信息，服务器直接把证书发送给浏览器，浏览器直接从证书里获取公钥就好了。

证书防伪的技术是 **数字签名**。

数字签名的制作过程：

1. CA拥有非对称加密的私钥和公钥。
2. CA对证书明文信息进行hash。
3. 对hash后的值用私钥加密，得到数字签名。

明文和数字签名共同组成了数字证书，这样一份数字证书就可以颁发给网站了。
那浏览器拿到服务器传来的数字证书后，如何验证它是不是真的？（有没有被篡改、掉包）

浏览器验证过程：

1. 浏览器 发送随机数 random1 + 支持的加密算法列表 到服务器
2. 服务器 发送随机数 random2 + 选择的加密算法 + 数字证书（公钥在证书里） + 确认信息
3. 浏览器 验证证书有效性
4. 浏览器 生成一个随机数 pre-master，**采用非对称加密**通过服务器的公钥加密发送给服务器，同时根据加密算法将 random1 + random2 + pre-master 生成 master-secret 用于后续数据传输
5. 服务器 用私钥解密得到 pre-master，根据算法将 random1 + random2 + pre-master 生成 master-secret用于数据传输
6. **对称加密**，浏览器和服务器之间使用 master-secret 加密的数据进行通信

#### HTTPS必须在每次请求中都要先在SSL/TLS层进行握手传输密钥吗？

服务器会为每个浏览器（或客户端软件）维护一个session ID，在TSL握手阶段传给浏览器，浏览器生成好密钥传给服务器后，服务器会把该密钥存到相应的session ID下，之后浏览器每次请求都会携带session ID，服务器会根据session ID找到相应的密钥并进行解密加密操作，这样就不必要每次重新制作、传输密钥了！

### HTTP2.0篇

#### 特点

- 多路复用 - 允许同时通过单一的 HTTP/2 连接发起多重的**请求-响应**消息。
- 二进制分帧 - 应用层(HTTP/2)和传输层(TCP or UDP)之间增加一个**二进制分帧层**。
- 首部压缩 - HTTP/2 使用了专门为首部压缩而设计的 [HPACK](https://link.zhihu.com/?target=http%3A//http2.github.io/http2-spec/compression.html) 算法。
- 服务端推送 - 服务器可以对客户端的一个请求发送多个响应。

