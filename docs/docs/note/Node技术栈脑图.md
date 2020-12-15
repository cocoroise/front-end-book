# Node技术栈脑图

### 🥝start

>  以下内容来自[《Node.js技术栈》](https://www.nodejs.red/#/nodejs/base/what-is-nodejs) 

本文适用于对javascript有一定了解，想知道node的基础体系的人服用。

建议看完图再看小册，最后随意翻看node文档，平时工作里写写node的脚本啥的应该够用了（手动🐶头）。



### 🍉Node介绍

在众多的语言里，node作为单线程语言，没有酷炫的多线程上下切换，没有资源争夺的尔虞我诈，只是老老实实安安静静的守着属于自己的消息到来。它的定位一开始就很简单：**提供一种简单安全的方法在 JavaScript 中构建高性能和可扩展的网络应用程序**。由于有消息队列的加持，在执行完一个任务之后，Node就可以让线程去执行其他的任务，有结果了再回来通知自己(回调函数)。这样大大减少了等待的时间，特别是像密集I/O的情形，node就显得十分的高效。

![](http://image.cocoroise.cn/image/node-1.png)

推荐几个Node库：

- [electron](https://github.com/electron/electron)
- [express](https://github.com/expressjs/express)
- [nest](https://github.com/nestjs/nest)
- [sofaRPC](https://github.com/sofastack/sofa-rpc-node)

### 🍑模块系统

node模块采用了commonJS机制，可以通过`module.exports`和`require`来导出和引入一个模块。

> 在模块加载机制中，Node.js 采用了延迟加载的策略，只有在用到的情况下，系统模块才会被加载，加载完成后会放到 binding_cache 中。可以通过require.cache查看已缓存的模块。

![](http://image.cocoroise.cn/image/node-2.png)

### 🍆EventEmitter

事件触发器是一个很重要的模块，核心模块例如`HTTP`,`FS`,`Stream`，都在使用它，还有常用的`Koa`和`Egg`也都有它的继承类。它的核心其实就是发布/订阅模式，我们也经常在vue里听说这个模式。

![](http://image.cocoroise.cn/image/node-3.png)



### 🍧缓冲Buffer

[缓冲(Buffer)](http://nodejs.cn/api/buffer.html)是Node给我们提供的读取或者操作数据流的类。这个类属于全局，我们不需要`require`就可以使用。它一般用于操作网络协议、数据库、图片和文件 I/O 等一些需要大量二进制数据的场景。Buffer 在创建时大小已经被确定且是无法调整的，在内存申请这块 Buffer 是由 C++ 层面提供而不是 V8，但是回收却是由js进行回收的 。

![](http://image.cocoroise.cn/image/20200218233130.png)

在Buffer分配的过程中主要使用一个局部变量`pool`作为中间处理对象，处于分配状态的slab单元都指向它。

在进行小而频繁的Buffer操作的时候，采用slab的机制进行预先申请和事后分配，可以让js到操作系统之间没有那么多的内存申请的调用。大块的Buffer则是直接使用c++的内存SlowBuffer，不用进行细腻的分配操作。



### 🥦进程和线程

所谓**进程**，是**系统进行资源分配和调度的基本单位**，就是我们平时启动的一个服务，一个实例。

**线程**呢，是**操作系统能够进行运算调度的最小单位**。线程可以看作是进程的儿子，一个进程可以包含多个线程。

>  同一块代码，可以根据系统CPU核心数启动多个进程，每个进程都有属于自己的**独立运行空间**，进程之间是不相互影响的。同一进程中的多条线程将共享该进程中的全部系统资源，如虚拟地址空间，文件描述符和信号处理等。但同一进程中的多个线程有各自的调用栈（call stack），自己的寄存器环境（register context），自己的线程本地存储（thread-local storage)，线程又有单线程和多线程之分，具有代表性的 JavaScript、Java 语言。

再说web服务，从古至今已经经历了几代的变迁。从同步模型，到复制进程，再到多线程，最后到现在的事件驱动。技术随着业务的复杂度和硬件的进步的不断上升也跟着不停的提高，以适应这个复杂多变迅速繁华的时代。

我们不满足于同步执行的低效，再到多线程的探索，现在又发现并发上万时候会出现C10K的问题，最后出现了这种基于事件驱动的模型。简单来说就是想方设法榨干CPU。

用单线程模型可以避免多线程的不必要的内存开销和上下文切换，但是它也只能榨干计算机的一个核，如果想同时榨干多核CPU，也不是没有办法，node提供了`child_process`模块，我们也可以很轻易的使用` child_process.fork()`函数来实现进程的复制。

> 在单核 CPU 系统之上我们采用 `单进程 + 单线程` 的模式来开发。在多核 CPU 系统之上，可以用过 child_process.fork 开启多个进程（Node.js 在 v0.8 版本之后新增了Cluster 来实现多进程架构） ，即 `多进程 + 单线程` 模式。注意：开启多进程不是为了解决高并发，主要是解决了单进程模式下 Node.js CPU 利用率不足的情况，充分利用多核 CPU 的性能。

![](http://image.cocoroise.cn/image/20200219014148.png)

这篇内容可能比较多而且复杂，想详细了解建议看看[process进程和线程](https://www.nodejs.red/#/nodejs/process-threads)，[多进程模型和进程间通讯](https://eggjs.org/zh-cn/core/cluster-and-ipc.html)，《深入浅出nodeJS》第九章-玩转进程。

### 🍤网络模块

Node提供了net,dgram,http,https这几个模块，分别用于处理TCP,UDP,HTTP,HTTPS，适用于服务端和客户端。要是不清楚tcp和udp是啥的小伙伴，可以康康我之前写的[计算机网络基础](https://cocoroise.github.io/2020/02/12/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C%E5%A4%A7%E7%BA%B2/)。这个图介绍的是比较底层的TCP，但是它是HTTP的基础，虽然我们平常用的都是`http.createServer`，说实话用的应该都是封装好的`app.listen(3000)`了把，但是了解了解基础是啥还是挺重要的，毕竟dubbo也是基于tcp封装的。学了一些基础就能写一些更底层更厉害的东西，这也是学基础的好处之一把。

![](http://image.cocoroise.cn/image/20200220000347.png)

现在我们可以理解HTTP模块其实就是在TCP模块上封装了一层，http模块拿到连接中传来的数据，调用模块`http_parser`进行解析，在解析完请求报文的报头后，触发request事件，调用用户的业务逻辑。http模块详细的不多介绍了，如果想知道咋用，参见[文档](http://nodejs.cn/api/net.html#net_new_net_server_options_connectionlistener)或者直接用koa，express，egg就行。

### 🍅End

终于结束了，不过这篇文章介绍的也只是Node的一些比较基础的模块，想详细学习Node的话可以看[NodeJs进阶篇](https://www.nodejs.red/#/nodejs/logger)，再把朴灵大佬的《深入浅出NodeJS》看一遍，node就算入门了。现在疫情的情况好了一些了，话不多说，武汉加油💪。

![](http://image.cocoroise.cn/image/NodeJS.png)
