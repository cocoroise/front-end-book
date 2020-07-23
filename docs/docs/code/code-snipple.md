# 前端常用原理总结

### 🌸前言

最近想总结一些常用简短的原理，包括平时经常使用到但是容易被忽略的工具实现，也可以包括原生api的简单实现。尽量用最少的代码实现最核心的功能。本篇持续更新。。。

- eventEmitter
- bind&call&apply 
- new
- koa-compose
- vue-router
- throttle&debounce
- promise
- async & await
- 。。。



### 1️⃣ EventEmitter

EventEmitter是一个事件触发器，在node里有原生的实现，在fs,net,koa里都有用到。

> 官方文档：http://nodejs.cn/api/events.html

使用方法如下：

```javascript
const event = new EventEmitter();
event.on("success", (data) => {
  console.log("something success", data);
});

event.emit("success", 1);

event.once("error", (data) => {
  console.log("once error", data);
});
```

先整理一下思路。我们核心要实现的功能其实就是一个emit触发事件，on监听事件。所以类里面肯定会有这两个方法。当然，类里肯定会有一个储存所有监听事件的map，键是事件的名称，值就是一个监听函数的数组，事件名称不能重复。于是，很简单的，有了如下的代码：

```javascript
class EventEmitter {
  constructor() {
    this._events = this._events || new Map();
  }

  on(name, fn) {
    this._events.set(name, fn);
  }
  emit(name, data) {
    if (this._events.get(name)) {
      this._events.get(name)(data);
    }
  }
  once(name, fn) {}
  removeListener(name, fn) {}
}
```

现在能够简单的实现监听和触发的功能，但是我们还需要加上触发器可能有多个的情况，于是就需要在handler做处理的时候添加上数组的情况。

```javascript
class EventEmitter {
  constructor() {
    this._events = this._events || new Map();
  }

  on(name, fn) {
    const handler = this._events.get(name);
    if (!handler) {
      this._events.set(name, fn);
    } else if (handler && handler instanceof Function) {
      this._events.set(name, [handler, fn]);
    } else {
      handler.push(fn);
    }
  }
  
  emit(name, data) {
    const handler = this._events.get(name);
    if (Array.isArray(handler)) {
      handler.map((fn) => {
        fn(data);
      });
    } else if (handler instanceof Function) {
      handler(data);
    }
  }
  
  once(name, fn) {}
  removeListener(name, fn) {}
}
```

监听器数组的功能实现了之后，我们就可以开始处理触发一次和移除监听器的操作了。

```javascript
/**
 * EventEmitter:
 * 1. on("eventName",fn)
 * 2. emit("eventName",data)
 * 3. once("eventName",fn)
 * 4. removeListener("eventName",fn)
 */

class EventEmitter {
  constructor() {
    this._events = this._events || new Map();
  }

  on(name, fn) {
    const handler = this._events.get(name);
    if (!handler) {
      this._events.set(name, fn);
    } else if (handler && handler instanceof Function) {
      this._events.set(name, [handler, fn]);
    } else {
      handler.push(fn);
    }
  }

  emit(name, ...args) {
    const handler = this._events.get(name);
    if (Array.isArray(handler)) {
      handler.map((fn) => {
        fn.call(this, ...args);
      });
    } else if (handler instanceof Function) {
      handler.call(this, ...args);
    }
  }

  once(name, fn) {
    const _this = this;
    // 中间函数，执行一次之后删除
    function only(...args) {
      fn.call(this, ...args);
      _this.removeListener(name, only);
    }
    // 保存原来的函数，用于remove的判断
    only.origin = fn;
    this.on(name, only);
  }

  removeListener(name, fn) {
    const handler = this._events.get(name);

    if (handler && handler instanceof Function) {
      this._events.delete(name);
    } else if (Array.isArray(handler)) {
      handler.filter((v) => {
        return v !== fn && v.origin !== fn;
      });
    }
  }
}
```

这里就是完整的代码，试验一下：

```javascript
const event = new EventEmitter();

const listenerFn = (data) => {
  console.log("listener get---->", data);
};

event.on("success", listenerFn);

event.emit("success", 1);

event.emit("success", 2);

event.removeListener("success", listenerFn);

event.emit("success", 3);

```

输出如下：

----

listener get----> 1
listener get----> 2

----

触发了两次`success`事件，然后移除了监听器，再次触发的时候就没用了，所以结果是正确的。这里很巧妙的一点就是在once里面为函数设置了一个中间函数，执行一次就删除了。还有一点，数据结构很重要，只要抽象出了问题的描述方式，后面很多问题就迎刃而解了，可能这就是小小的关于学算法有用的感悟吧。

> 核心思想：
>
> events : { 'success' : [fn,fn,fn...] }

参考：[eventEmitter - nodeJs](https://github.com/nodejs/node/blob/master/lib/events.js)



### 2️⃣ Bind&call&apply 

这几个函数的作用都是手动改变函数内this的指向，

- bind 改变context，返回一个新的函数
- call 立即调用，一个一个的传参
- apply 立即调用，第二个参数传数组

```javascript
Function.prototype.call = function(context,...args){
	let context = context || window;
  context.fn = this;
  
  let result = context.fn(...args);
  delete context.fn;
  return result;
}

Function.prototype.apply = function(context,arr){
	let context = context || window;
  context.fn = this;
  
  let result = context.fn(arr);
  delete context.fn;
  return result;
}

Function.prototype.bind = function () {
  var thatFunc = this,
    thatArg = arguments[0];
  var slice = Array.prototype.slice;
  var args = slice.call(arguments, 1);

  return function () {
    var funcArgs = args.concat(slice.call(arguments));
    return thatFunc.apply(thatArg, funcArgs);
  };
};
```

> 核心思想：
>
> apply & call : context.fn = this
>
> bind : return function () { return thatFnc.apply(...) }  

参考：

[Function.prototype.bind - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)



### 3️⃣ new的实现

1. 使用父原型创建一个新的对象

2. 把this和调用参数传给构造器执行

4. 如果构造器没有手动返回对象，就返回第一步创建的新对象。如果有，就返回手动返回的对象。

```javascript
function _new(Parent, ...args) {
  let child = Object.create(Parent.prototype);
  let result = Parent.apply(child, args);
  return typeof result === "object" ? result : child;
}

// 用法
let Parent = function (name, age) {
  this.name = name;
  this.age = age;
};
Parent.prototype.sayName = function () {
  console.log(this.name);
};

const child = _new(Parent, "echo", 26);
child.sayName(); //'echo';
```

这里顺便复习一下原型链的知识吧，无论是前面实现的bind或者call,new都需要用到这方面的知识。

示例代码：

```javascript
function Foo() {...};
let f1 = new Foo();
```

![](http://image.cocoroise.cn/20190311193622793.png)

要点：

- `__proto__`和`constructor`属性是**对象**所独有的； `prototype`属性是**函数**所独有的，因为函数也是一种对象，所以函数也拥有`__proto__`和`constructor`属性。

- __proto__属性的作用就是当访问一个对象的属性时，如果该对象内部不存在这个属性，那么就会去它的__proto__属性所指向的那个对象（父对象）里找，一直找，直到__proto__属性的终点null，再往上找就相当于在null上取值，会报错。通过__proto__属性将对象连接起来的这条链路即我们所谓的原型链。

- prototype属性的作用就是让该函数所实例化的对象们都可以找到公用的属性和方法，即 f1.__proto__ === Foo.prototype

- `constructor`属性的含义就是**指向该对象的构造函数**，所有函数（此时看成对象了）最终的构造函数都指向**Function**。

  简略图：

  <img src="http://image.cocoroise.cn/20200718174124.png" style="zoom:50%;" />

>  参考自：
>
> - [继承与原型链 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
>
> - [帮你彻底搞懂JS中的 prototype , proto_与 constructor（图解）](https://blog.csdn.net/cc18868876837/article/details/81211729?utm_medium=distribute.pc_relevant_right.none-task-blog-BlogCommendFromMachineLearnPai2-7.nonecase&depth_1-utm_source=distribute.pc_relevant_right.none-task-blog-BlogCommendFromMachineLearnPai2-7.nonecase)



### 4️⃣ koa-compose

看过koa源码的人应该知道，compose方法是koa里比较核心的一个点，但是它的实现也并不复杂。它的作用主要是把中间价串联起来，通过用户手动调用 next 的方式，控制中间件的执行。

使用方式：

```javascript
compose([a, b, c, ...])
```

实现：

```javascript
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

使用：

```javascript
const fn1 = async function (ctx, next) {
  console.log("fn1 before--->");
  await next();

  await setTimeout(() => {
    console.log("fn1 after--->");
  }, 1000);
};

const fn2 = async function (ctx, next) {
  await setTimeout(() => {
    console.log("fn2 before--->");
  }, 1000);

  await next();

  console.log("fn2 after--->");
};

const run = compose([fn1, fn2]);
run();

// 运行：
// fn1 before---> 
// fn2 after---> 
// wait 1s
// fn2 before---> 
// fn1 after---> 
```

其实也很简单，就是一个递归，在运行的时候把下一个中间件当作函数穿进去。

核心代码：

```javascript
return Promise.resolve(fn(context,dispatch.bind(null,i+1)))
```

参考：[compose - koaJs](https://github.com/koajs/compose)



### 5️⃣ vue-router

router是我们经常使用的vue全家桶之一，其实它的实现原理也不难。核心就是监听浏览器的跳转事件，匹配对应的组件进行渲染。一般有两种方式可以使用，hash模式和history模式。hash模式监听`hashchange`事件，history模式监听history api的`pushState`方法。

```javascript
class Routers {
  constructor() {
    this.routes = {};
    this.currentUrl = "";
    this.refresh = this.refresh.bind(this);
    // 监听load和haschange事件，探测url改变
    window.addEventListener("load", this.refresh, false);
    window.addEventListener("hashchange", this.refresh, false);
  }
  route(path, callback) {
    this.routes[path] = callback || function () {};
  }
  refresh() {
    this.currentUrl = location.hash.slice(1) || "/";
    this.routes[this.currentUrl]();
  }
}

```



### 6️⃣ throttle&debounce

节流和防抖，前端很常见的功能了。节流主要是限制事件次数 比如 **一秒只触发一次事件** ，防抖则是为了 **探测事件发生完的空档期**，比如说用户输入完1S之后向后台请求接口。

节流：

```javascript
function throttle(fn, time) {
  let prev = Date.now();

  return function (...args) {
    const context = this;
    let now = Date.now();
    if (now - prev >= time) {
      fn.apply(context, args);
      prev = Date().now();
    }
  };
}

// test
const handle = () => {
  console.log("scroll");
};
setInterval(throttle(handle, 1000), 200);

// 通常使用方式
window.addEventListener("scroll", throttle(handle, 1000));

```

核心代码：

```javascript
if(now - prev >= time)
```

防抖：

```javascript
function debounce(fn, time) {
  let timeout = null;
  return function (...args) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(()=>{
    	fn.apply(context,args);
    }, time);
  };
}

const handle = () => {
  console.log("input change");
};
// 通常使用：
$("#input").addEventListener("change",debounce(handler,1000))
```



### 7️⃣ promise

promise也是我们经常使用到的一个工具，只不过现在我们一般都用更方便的 async 和 await 来做异步请求了，但是async 和 await也只是promise的一个语法糖而已，知道内部的实现还是挺有必要的。先来看看promise有哪些功能，如何使用的，再来探究它的数据结构吧。

>  promise介绍：[Promise - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

使用：

```javascript
new Promise((resolve,reject)=>{
  resolve('这是第一个 resolve 值')
}).then((data)=>{
  console.log(data)
}).catch((err)=>{
	console.log('error--->',err)
})
```

分析：

1. promise有三种状态，pending,rejected和fullfilled，所以肯定有个值记录当前异步的状态
2. promise接收一个函数作为入参，返回自身，以便链式调用
3. 函数调用reslove之后，状态会从pending => fullfilled， 调用reject之后，状态会从pending => rejected

<img src="http://image.cocoroise.cn/20200719114507.png" style="zoom:70%;" />

代码：

```javascript
class MyPromise {
  constructor(fn) {
    this.status = this.STATUS_MAP.PENDING;
    this.result = null;
    this.reason = null;

    this.onfullfilledList = []; // 成功之后的回调函数列表
    this.onRejectedList = []; // 失败的

    this.excutor(fn);
  }

  STATUS_MAP = {
    PENDING: "pending",
    REJECTED: "rejected",
    FULFILLED: "fulfilled",
  };

  resolve(value) {
    if (this.status !== this.STATUS_MAP.PENDING) return;
    this.status = this.STATUS_MAP.FULFILLED;
    this.result = value;
    this.onfullfilledList.forEach((fn) => fn());
  }
  reject(reason) {
    if (this.status !== this.STATUS_MAP.PENDING) return;
    this.status = this.STATUS_MAP.REJECTED;
    this.reason = reason;
    this.onRejectedList.forEach((fn) => fn());
  }
  excutor(fn) {
    const self = this;

    try {
      fn(this.resolve.bind(self), this.reject.bind(self));
    } catch (err) {
      this.reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      onFulfilled instanceof Function ? onFulfilled : (value) => value;
    onRejected =
      onRejected instanceof Function
        ? onRejected
        : (reason) => {
            throw reason;
          };
    const self = this;
    let promise2 = new MyPromise((resolve, reject) => {
      if (self.status === self.STATUS_MAP.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(self.result);
            self.resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      } else if (self.status === self.STATUS_MAP.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(self.reason);
            self.resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      } else if (self.status === self.STATUS_MAP.PENDING) {
        self.onfullfilledList.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(self.result);
              self.resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
        self.onRejectedList.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(self.reason);
              self.resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    });
    return promise2;
  }
  resolvePromise(promise2, x, resolve, reject) {
    const that = this;
    if (promise2 === x) {
      reject("循环调用");
    }
    if ((x && typeof x === "object") || typeof x === "function") {
      let used = false;
      try {
        let then = x.then;
        if (typeof then === "function") {
          then.call(
            x,
            (y) => {
              if (used) return;
              used = true;
              // 支持链式调用
              that.resolvePromise(promise2, y, resolve, reject);
            },
            (r) => {
              if (used) return;
              used = true;
              reject(r);
            }
          );
        } else {
          if (used) return;
          used = true;
          resolve(x);
        }
      } catch (err) {
        if (used) return;
        used = true;
        reject(err);
      }
    } else {
      // 普通对象比如数字或字符直接reslove
      resolve(x);
    }
  }
  finally(cb) {
    return this.then(
      (value) => {
        this.resolve(cb()).then(() => value);
      },
      (error) => {
        this.resolve(cb()).then(() => {
          throw error;
        });
      }
    );
  }
}
```

测试：

```
// test
function async1() {
  return new MyPromise((resolve, reject) => {
    console.log("async1 start");
    setTimeout(() => {
      resolve("async1 finished");
    }, 1000);
  });
}

function async2() {
  return new MyPromise((resolve, reject) => {
    console.log("async2 start");
    setTimeout(() => {
      resolve("async2 finished");
    }, 500);
  });
}

function async3() {
  return new MyPromise((resolve, reject) => {
    console.log("async3 start");
    setTimeout(() => {
      resolve("async3 finished");
    }, 2000);
  });
}

async1()
  .then((data) => {
    console.log(data);
    return async2();
  })
  .then((data) => {
    console.log(data);
    return async3();
  })
  .then((data) => {
    console.log(data);
  });

// run
// async1 start
// async1 finished
// async2 start
// async2 finished
// async3 start
// async3 finished
```

> 参考：
>
> [then/promise - Github](https://github.com/then/promise)
>
> [Promise实现原理（附源码）](https://juejin.im/post/5b83cb5ae51d4538cc3ec354)
>
> [Promise的源码实现（完美符合Promise/A+规范）- Github](https://github.com/YvetteLau/Blog/issues/2)



### 8️⃣ async & await

async和await是es6里面Generator的语法糖。与之不同的是，Generator需要手动调用`next`方法执行下一个迭代器里的迭代，而async不用，它自动帮你调用了next函数。先来看看Generator是怎么使用的吧。

```javascript
function* foo(x) {
    let a = yield x + 1;
    let b= yield a + 2;
    return x + 3;
}
const result = foo(0) // foo {<suspended>}
result.next(1);  // {value: 1, done: false}
result.next(2);  // {value: 2, done: false}
result.next(3);  // {value: 3, done: true}
result.next(4);  //{value: undefined, done: true}
```

可以把yield后面跟着的函数看作一个步骤，每次用户调用next就前往下一个步骤。

而async的实现就是把Generator和自动执行器包装在一个函数里面。

```javascript
async function fn(args) {
  // ...
}

// 等同于

function fn(args) {
  return spawn(function* () {
    // ...
  });
}
```

其中这个spawn函数就是核心函数

```javascript
function spawn(genF) {
  return new Promise((reslove, reject) => {
    const gen = genF();
    function step(nextF) {
      let next;
      try {
        next = nextF();
      } catch (err) {
        return reject(err);
      }
      if (next.done) {
        return reslove(next.value);
      }
      Promise.resolve(next.value).then(
        (v) => {
          step(() => {
            return gen.next(v);
          });
        },
        (err) => {
          step(() => {
            return gen.throw(err);
          });
        }
      );
    }
    step(() => {
      return gen.next(undefined);
    });
  });
}

```

> 参考：
>
> [async、await和generator函数内部原理](https://juejin.im/post/5d401ce4e51d4561d106cb63)



### 🌻总结和参考

多看源码，多思考工具后面的实现方式，尝试运用到平时写的业务里，才能把自己的角色从 **用工具的人**转换成**写工具的人**。

