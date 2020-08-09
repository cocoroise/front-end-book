# Websocket介绍和使用

### 介绍

**WebSocket**是一种网络传输协议，可在**单个TCP连接上进行全双工通信**，位于OSI模型的**应用层**。

WebSocket协议支持Web浏览器与Web服务器之间的交互，具有较低的开销，便于实现客户端与服务器的实时数据传输。 服务器可以通过标准化的方式来实现，而无需客户端首先请求内容，并允许消息在保持连接打开的同时来回传递。通过这种方式，可以在客户端和服务器之间进行双向持续对话。 通信通过TCP端口**80**或**443**完成，这在防火墙阻止非Web网络连接的环境下是有益的。

### 使用

Websocket使用`ws`或`wss`的统一资源标志符（URI）。其中`wss`表示使用了TLS的Websocket。如：

```
ws://example.com/wsapi
wss://secure.example.com/wsapi
```

Api

```javascript
const ws = new WebSocket(url);
ws.onclose = function () {
    //something
};
ws.onerror = function () {
    //something
};
        
ws.onopen = function () {
   //something
};
ws.onmessage = function (event) {
   //something
}
```

保持连接

```javascript
ws.onclose = function () {
    reconnect();
};
ws.onerror = function () {
    reconnect();
};
```

### 心跳机制

WebSocket为了保持客户端、服务端的实时双向通信，需要确保客户端、服务端之间的TCP通道保持连接没有断开。然而，对于长时间没有数据往来的连接，如果依旧长时间保持着，可能会浪费包括的连接资源。

但不排除有些场景，客户端、服务端虽然长时间没有数据往来，但仍需要保持连接。这个时候，可以采用心跳来实现。所以我们只需要定时的发送消息，去触发websocket.send方法，如果网络断开了，浏览器便会触发onclose。

```javascript
const heartCheck = {
    timeout: 60000,//60ms
    timeoutObj: null,
    reset: function(){
        clearTimeout(this.timeoutObj);　　　　 this.start();
    },
    start: function(){
        this.timeoutObj = setTimeout(function(){
            ws.send("HeartBeat");
        }, this.timeout)
    }
}

ws.onopen = function () {
   heartCheck.start();
};
ws.onmessage = function (event) {
    heartCheck.reset();
}
```

### 优点

- 较少的控制开销
- 更强的实时性
- 保持连接状态
- 支持扩展
- 更好的压缩效果

### 参考

[WebSocket - 维基](https://zh.wikipedia.org/wiki/WebSocket)

[Websocket浅析](https://cloud.tencent.com/developer/article/1071645)