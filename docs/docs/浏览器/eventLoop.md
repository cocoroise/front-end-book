# 事件循环机制

### ⛎前言

本文介绍一下js里实现异步的原理，并且了解在浏览器里面和node里的事件循环机制的区别。

### ♒️js异步的实现

>  进程是 CPU 资源分配的最小单位；线程是 CPU 调度的最小单位。

JS是单线程的，那单线程怎么实现的异步呢？

事实上所谓的"JS是单线程的"只是指JS的**主运行线程只有一个**，而不是整个运行环境都是单线程。JS的运行环境主要是浏览器，以大家都很熟悉的Chrome的内核为例，他不仅是多线程的，而且是**多进程**的。

<img src="http://image.cocoroise.cn/20200728105014.png" style="zoom:80%;" />

我们关心的主要是浏览器的渲染进程。看看每个进程里是做什么的：

- **GUI线程**
  - 主要负责页面的渲染，解析 HTML、CSS，构建 DOM 树，布局和绘制等。
  - 当界面需要重绘或者由于某种操作引发回流时，将执行该线程。
  - 该线程与 JS 引擎线程互斥，当执行 JS 引擎线程时，GUI 渲染会被挂起，当任务队列空闲时，JS 引擎才会去执行 GUI 渲染。

- **JS引擎线程**
  - 该线程当然是主要负责处理 JavaScript 脚本，执行代码。
  - 也是主要负责执行准备好待执行的事件，即定时器计数结束，或者异步请求成功并正确返回时，将依次进入任务队列，等待 JS 引擎线程的执行。
  - 当然，该线程与 GUI 渲染线程互斥，当 JS 引擎线程执行 JavaScript 脚本时间过长，将导致页面渲染的阻塞。

- **定时器触发线程**
  - 负责执行异步定时器一类的函数的线程，如： setTimeout，setInterval。
  - 主线程依次执行代码时，遇到定时器，会将定时器交给该线程处理，当计数完毕后，事件触发线程会将计数完毕后的事件加入到任务队列的尾部，等待 JS 引擎线程执行。

- **事件触发线程**

  - 主要负责将准备好的事件交给 JS 引擎线程执行。

  比如 setTimeout 定时器计数结束， ajax 等异步请求成功并触发回调函数，或者用户触发点击事件时，该线程会将整装待发的事件依次加入到任务队列的队尾，等待 JS 引擎线程的执行。

  定时器线程其实只是一个计时的作用，他并不会真正执行时间到了的回调，真正执行这个回调的还是JS主线程。所以当时间到了定时器线程会将这个回调事件给到事件触发线程，然后事件触发线程将它加到事件队列里面去。最终JS主线程从事件队列取出这个回调执行。事件触发线程不仅会将定时器事件放入任务队列，其他满足条件的事件也是他负责放进任务队列。

- **异步HTTP请求线程**
  - 负责执行异步请求一类的函数的线程，如： Promise，axios，ajax 等。
  - 主线程依次执行代码时，遇到异步请求，会将函数交给该线程处理，当监听到状态码变更，如果有回调函数，事件触发线程会将回调函数加入到任务队列的尾部，等待 JS 引擎线程执行。



所以JS异步的实现靠的就是浏览器的多线程，当他遇到异步API时，就将这个任务交给对应的线程，当这个异步API满足回调条件时，对应的线程又通过事件触发线程将这个事件放入任务队列，然后主线程从任务队列取出事件继续执行。

### ♈️浏览器 - 事件循环

浏览器的事件分为宏任务和微任务。

当某个宏任务执行完后，会查看是否有微任务队列。如果有，先执行微任务队列中的所有任务，如果没有，会读取宏任务队列中排在最前的任务，执行宏任务的过程中，遇到微任务，依次加入微任务队列。栈空后，再次读取微任务队列里的任务，依次类推。

- 宏任务

  setTimeout、setInterval、setImmediate、I/O、UI交互事件

- 微任务

  Promise、process.nextTick、MutaionObserver 等

看个例子：

```js
Promise.resolve().then(()=>{
  console.log('Promise1')
  setTimeout(()=>{
    console.log('setTimeout2')
  },0)
})
setTimeout(()=>{
  console.log('setTimeout1')
  Promise.resolve().then(()=>{
    console.log('Promise2')
  })
},0)
```

最后输出结果是 `Promise1，setTimeout1，Promise2，setTimeout2`

- 一开始执行栈的同步任务（这属于宏任务）执行完毕，会去查看是否有微任务队列，上题中存在(有且只有一个)，然后执行微任务队列中的所有任务输出 Promise1，同时会生成一个宏任务 setTimeout2
- 然后去查看宏任务队列，宏任务 setTimeout1 在 setTimeout2 之前，先执行宏任务 setTimeout1，输出 setTimeout1
- 在执行宏任务 setTimeout1 时会生成微任务 Promise2 ，放入微任务队列中，接着先去清空微任务队列中的所有任务，输出 Promise2
- 清空完微任务队列中的所有任务后，就又会去宏任务队列取一个，这回执行的是 setTimeout2

### ☸️Node - 事件循环

Node 中的 Event Loop 和浏览器中的是完全不相同的东西。Node.js 采用 V8 作为 js 的解析引擎，而 I/O 处理方面使用了自己设计的 libuv，libuv 是一个基于事件驱动的跨平台抽象层，封装了不同操作系统一些底层特性，对外提供统一的 API，事件循环机制也是它里面的实现。

- V8 引擎解析 JavaScript 脚本。

- 解析后的代码，调用 Node API。

- libuv 库负责 Node API 的执行。它将不同的任务分配给不同的线程，形成一个 Event Loop（事件循环），以异步的方式将任务的执行结果返回给 V8 引擎。

- V8 引擎再将结果返回给用户。

  

具体执行过程如下：

- **timers 阶段**：这个阶段执行 **timer**（setTimeout、setInterval）的回调
- **I/O callbacks 阶段**：处理一些上一轮循环中的少数未执行的 **I/O 回调**
- **idle, prepare 阶段**：仅 **node 内部**使用
- **poll 阶段**：获取**新的 I/O 事件**, 适当的条件下 node 将阻塞在这里
- **check 阶段**：执行 **setImmediate()** 的回调
- **close callbacks 阶段**：执行 **socket 的 close 事件**回调

<img src="http://image.cocoroise.cn/20200728113219.png" style="zoom:90%;" />

接下去我们详细介绍`timers`、`poll`、`check`这 3 个阶段，因为日常开发中的绝大部分异步任务都是在这 3 个阶段处理的。

- timer

  timers 阶段会执行 setTimeout 和 setInterval 回调，并且是由 poll 阶段控制的。
  同样，**在 Node 中定时器指定的时间也不是准确时间，只能是尽快执行**。

- poll

  poll 是一个至关重要的阶段，这一阶段中，系统会做两件事情：回到timer阶段执行回调，执行I/O回调

  并且在进入该阶段时如果没有设定了 timer 的话，会发生以下两件事情

  - 如果 **poll 队列不为空**，会遍历回调队列并同步执行，直到队列为空或者达到系统限制
  - 如果 **poll 队列为空时**，会有两件事发生
    - 如果有 **setImmediate** 回调需要执行，poll 阶段会停止并且进入到 check 阶段执行回调
    - 如果没有 **setImmediate** 回调需要执行，会等待回调被加入到队列中并立即执行回调，这里同样会有个超时时间设置防止一直等待下去

  当然设定了 timer 的话且 poll 队列为空，则会判断是否有 timer 超时，如果有的话会回到 timer 阶段执行回调。

- Check

  setImmediate()的回调会被加入 check 队列中。

看个例子：

```javascript
console.log('start')
setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)
setTimeout(() => {
  console.log('timer2')
  Promise.resolve().then(function() {
    console.log('promise2')
  })
}, 0)
Promise.resolve().then(function() {
  console.log('promise3')
})
console.log('end')
```

**运行结果：**

Start -> end -> promise3 -> timer1 -> timer2 -> promise1 -> promise2

**解析：**

- 一开始执行栈的同步任务（这属于宏任务）执行完毕后（依次打印出 start end，并将 2 个 timer 依次放入 timer 队列）,会先去执行微任务（**这点跟浏览器端的一样**），所以打印出 promise3
- 然后进入 timers 阶段，执行 timer1 的回调函数，打印 timer1，并将 promise.then 回调放入 microtask 队列，同样的步骤执行 timer2，打印 timer2；这点跟浏览器端相差比较大，**timers 阶段有几个 setTimeout/setInterval 都会依次执行**，并不像浏览器端，每执行一个宏任务后就去执行一个微任务。



### 🕉浏览器和Node环境的差别

浏览器环境下，microtask 的任务队列是**每个 macrotask 执行完之后执行**。

而在 Node.js 中，**microtask 会在事件循环的各个阶段之间执行**，也就是一个阶段执行完毕，就会去执行 microtask 队列的任务。

<img src="http://image.cocoroise.cn/20200728114500.png" style="zoom:90%;" />

再看个例子：

```javascript
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```

- 浏览器的输出结果：

  timer1 -> promise1 -> timer2 -> promise2

- Node端的输出结果：

  timer1 -> timer2 -> promise1 -> promise2

可以这样记忆，浏览器是一个宏任务一个微任务，而node环境是一个阶段一个微任务，而注册的好几个宏任务都会一起在timer阶段依次执行。



### 💟总结

- JS所谓的“单线程”只是指主线程只有一个，并不是整个运行环境都是单线程
- JS的异步靠底层的多线程实现
- 异步线程与主线程通讯靠的是Event Loop
- 异步线程完成任务后将其放入任务队列
- 主线程不断轮询任务队列，拿出任务执行
- 任务队列有宏任务队列和微任务队列的区别
- 微任务队列的优先级更高，所有微任务处理完后才会处理宏任务
- `Promise`是微任务
- Node.js的Event Loop跟浏览器的Event Loop不一样，他是分阶段的
- `setImmediate`和`setTimeout(fn, 0)`哪个回调先执行，需要看他们本身在哪个阶段注册的，如果在定时器回调或者I/O回调里面，`setImmediate`肯定先执行。如果在最外层或者`setImmediate`回调里面，哪个先执行取决于当时机器状况。
- `process.nextTick`不在Event Loop的任何阶段，他是一个特殊API，他会立即执行，然后才会继续执行Event Loop，vue的$nextTick里就用到了这个api



### ♐️参考

[浏览器和Node的事件循环有何区别？](https://blog.fundebug.com/2019/01/15/diffrences-of-browser-and-node-in-event-loop/)

[一文看懂浏览器事件循环](https://juejin.im/post/5df071a9518825123e7aef17)

[setTimeout和setImmediate到底谁先执行，本文让你彻底理解Event Loop](https://juejin.im/post/5e782486518825490455fb17)