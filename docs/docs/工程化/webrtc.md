# WebRTC介绍

### 介绍

**WebRTC** (Web Real-Time Communications) 是一项实时通讯技术，它允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点（Peer-to-Peer）的连接，实现视频流和（或）音频流或者其他任意数据的传输。WebRTC包含的这些标准使用户在无需安装任何插件或者第三方的软件的情况下，创建点对点（Peer-to-Peer）的数据分享和电话会议成为可能。

### 概览

![](http://image.cocoroise.cn/20200810161402.png)

![](http://image.cocoroise.cn/20200810161612.png)

### 协议

- **ICE**
  **交互式连接设施Interactive Connectivity Establishment (ICE)** 是一个允许你的浏览器和对端浏览器建立连接的协议框架。在实际的网络当中，有很多原因能导致简单的从A端到B端直连不能如愿完成。这需要绕过阻止建立连接的防火墙，给你的设备分配一个唯一可见的地址（通常情况下我们的大部分设备没有一个固定的公网地址），如果路由器不允许主机直连，还得通过一台服务器转发数据。ICE通过使用以下几种技术完成上述工作。

- **STUN**

  NAT的会话穿越功能[Session Traversal Utilities for NAT (STUN)](http://en.wikipedia.org/wiki/STUN) (缩略语的最后一个字母是NAT的首字母)是一个**允许位于NAT后的客户端找出自己的公网地址**，判断出路由器阻止直连的限制方法的协议。

  客户端通过给公网的STUN服务器发送请求获得自己的公网地址信息，以及是否能够被（穿过路由器）访问。

- **NAT**
  **网络地址转换协议Network Address Translation (NAT)** 用来给**你的（私网）设备映射一个公网的IP地址的协议**。一般情况下，路由器的WAN口有一个公网IP，所有连接这个路由器LAN口的设备会分配一个私有网段的IP地址（例如192.168.1.3）。私网设备的IP被映射成路由器的公网IP和唯一的端口，通过这种方式不需要为每一个私网设备分配不同的公网IP，但是依然能被外网设备发现。

  一些路由器严格地限定了部分私网设备的对外连接。这种情况下，即使STUN服务器识别了该私网设备的公网IP和端口的映射，依然无法和这个私网设备建立连接。这种情况下就需要转向TURN协议。

### 信令Signaling

我们说WebRTC的RTCPeerConnection是可以做到浏览器间（无服务）的通信。

但这里有个问题，当两个浏览器不通过服务器建立PeerConnection时，它们怎么知道彼此的存在呢？进一步讲，它们该怎么知道对方的网络连接位置（IP/端口等）呢？支持何种编解码器？甚至于什么时候开始媒体流传输、又该什么时候结束呢？

因此在建立WebRTC的RTCPeerConnection前，必须建立️另一条通道来交这些协商信息，这些也被称为**信令**，这条通道成为**信令通道（Signaling Channel）**。

两个客户端浏览器交换的信令具有以下功能：

- 协商媒体功能和设置
- 标识和验证会话参与者的身份（交换SDP对象中的信息：媒体类型、编解码器、带宽等元数据）
- 控制媒体会话、指示进度、更改会话、终止会话等

其中主要涉及SDP(offer、answer)会话描述协议，以及ICE candidate的交换。

**WebRTC标准本身没有规定信令交换的通讯方式，信令服务根据自身的情况实现**

一般会使用websocket通道来做信令通道，比如可以基于[http://socket.io](https://link.zhihu.com/?target=http%3A//socket.io)来搭建信令服务。当然业界也有很多开源且稳定成熟的信令服务方案可供选择。

### 简单连接

- 获取本地媒体（`getUserMedia()`，*MediaStream API*）
- 在浏览器和对等端（其它浏览器或终端）之间建立对等连接（*RTCPeerConnection API*）
- 将媒体和数据通道关联至该连接
- 交换会话描述（*RTCSessionDescription*）
- 浏览器M从Web服务器请求网页
- Web服务器向M返回带有WebRTC js的网页
- 浏览器L从Web服务器请求网页
- Web服务器向L返回带有WebRTC js的网页
- M决定与L通信，通过M自身的js将M的会话描述对象（offer，提议）发送至Web服务器
- Web服务器将M的会话描述对象发送至L上的js
- L上的js将L的会话描述对象（answer，应答）发送至Web服务器
- Web服务器转发应答至M上的js
- M和L开始交互，确定访问对方的最佳方式
- 完成后，M和L开始协商通信密钥
- M和L开始交换语音、视频或数据

### 参考

[WebRTC API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API)

[WebRTC介绍及简单应用](https://cloud.tencent.com/developer/article/1007317)

[Web前端的WebRTC攻略（一）基础介绍](https://zhuanlan.zhihu.com/p/91055127)