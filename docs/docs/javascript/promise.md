# Promise总结

### 特点

- 状态 - pending,fulfilled,rejected
- promise.then(onFulfilled, onRejected)
- 链式调用
- then返回一个新的promise对象

### 一些promise执行顺序的题目

1. promise的状态

   ```javascript
   const promise1 = new Promise((resolve, reject) => {
     setTimeout(() => {
       resolve("success");
       console.log("timer1");
     }, 1000);
     console.log("promise1里的内容");
   });
   const promise2 = promise1.then(() => {
     throw new Error("error!!!");
   });
   console.log("promise1", promise1);
   console.log("promise2", promise2);
   setTimeout(() => {
     console.log("timer2");
     console.log("promise1", promise1);
     console.log("promise2", promise2);
   }, 2000);
   ```

   结果：

   ```
   'promise1里的内容'
   'promise1' Promise{<pending>} // 这个时候promise还是pending状态
   'promise2' Promise{<pending>}
   'timer1'
   test5.html:102 Uncaught (in promise) Error: error!!! at test.html:102
   'timer2'
   'promise1' Promise{<resolved>: "success"}
   'promise2' Promise{<rejected>: Error: error!!!} // 返回了一个新的promise
   ```

2. then的期望传参

   ```javascript
   Promise.resolve(1)
     .then(2)
     .then(Promise.resolve(3))
     .then(console.log)
   // 结果 1
   ```

   `.then` 或者 `.catch` 的参数期望是函数，传入非函数则会发生**值透传**。

   第一个`then`和第二个`then`中传入的都不是函数，一个是数字类型，一个是对象类型，因此发生了透传，将`resolve(1)` 的值直接传到最后一个`then`里。

3. async和await

   ```javascript
   async function async1() {
     console.log("async1 start");
     await async2();
     console.log("async1 end");
   }
   async function async2() {
     console.log("async2");
   }
   async1();
   console.log('start')
   
   // 'async1 start'
   // 'async2'
   // 'start'
   // 'async1 end'
   ```

   理解为await后面的语句放在了promise.then里面

   而console.log("async2"); 放在new Promise()里面

4. 综合promise和async

   ```javascript
   async function async1 () {
     console.log('async1 start');
     await new Promise(resolve => {
       console.log('promise1')
       resolve('promise resolve')
     })
     console.log('async1 success');
     return 'async1 end'
   }
   console.log('srcipt start')
   async1().then(res => {
     console.log(res)
   })
   new Promise(resolve => {
     console.log('promise2')
     setTimeout(() => {
       console.log('timer')
     })
   })
   
   // srcipt start
   // async1 start
   // promise1
   // promise2
   // async1 success
   // async1 end
   // timer
   ```

   在`async1`中的`new Promise`它的`resovle`的值和`async1().then()`里的值是没有关系的在`async1`中的`new Promise`它的`resovle`的值和`async1().then()`里的值是没有关系的。

### 一些大厂面试题 

1. 使用promise每隔一秒输出1,2,3

   使用promise包裹每个数字，让它成为一个promise，reduce初始值是Promise.resolve()

   ```javascript
   const arr = [1, 2, 3];
     arr.reduce((pre, cur) => {
       return pre.then(() => {
         return new Promise((r) => {
           setTimeout(() => r(console.log(cur)), 1000);
         });
       });
     }, Promise.resolve());
   ```

2. 使用Promise实现红绿灯交替重复亮

   红灯3秒亮一次，黄灯2秒亮一次，绿灯1秒亮一次；如何让三个灯不断交替重复亮灯？（用Promise实现）三个亮灯函数已经存在：

   ```javascript
   function red() {
       console.log('red');
   }
   function green() {
       console.log('green');
   }
   function yellow() {
       console.log('yellow');
   }
   ```

   答案：

   封装一个light函数，时间到了就执行亮灯函数，然后resovle结果。

   steps函数负责串联执行，结束之后调用自己。

   ```javascript
   function light(fn, time) {
     return new Promise((resolve) => {
       setTimeout(() => {
         fn();
         resolve();
       }, time);
     });
   }
   
   function steps() {
     Promise.resolve()
       .then(() => {
         return light(red, 3000);
       })
       .then(() => {
         return light(green, 2000);
       })
       .then(() => {
         return light(yellow, 1000);
       })
       .then(() => {
         return steps();
       });
   }
   ```

3. 实现mergePromise函数

   实现mergePromise函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组data中。

   答案：

   ```javascript
   const time = (timer) => {
     return new Promise((resolve) => {
       setTimeout(() => {
         resolve();
       }, timer);
     });
   };
   const ajax1 = () =>
     time(2000).then(() => {
       console.log(1);
       return 1;
     });
   const ajax2 = () =>
     time(1000).then(() => {
       console.log(2);
       return 2;
     });
   const ajax3 = () =>
     time(1000).then(() => {
       console.log(3);
       return 3;
     });
     
   function mergePromise(arr) {
     // 在这里写代码
     let result = [];
     let promise = Promise.resolve();
     arr.forEach((fn) => {
       promise = promise.then(fn).then((res) => {
         result.push(res);
         return result;
       });
     });
     return promise;
   }
   
   mergePromise([ajax1, ajax2, ajax3]).then((data) => {
     console.log("done");
     console.log(data); // data 为 [1, 2, 3]
   });
   ```

   

### 总结

- `Promise`的状态一经改变就不能再改变。
- `.then`和`.catch`都会返回一个新的`Promise`。
- `catch`不管被连接到哪里，都能捕获上层未捕捉过的错误。
- 在`Promise`中，返回任意一个非 `promise` 的值都会被包裹成 `promise` 对象，例如`return 2`会被包装为`return Promise.resolve(2)`。
- `Promise` 的 `.then` 或者 `.catch` 可以被调用多次, 但如果`Promise`内部的状态一经改变，并且有了一个值，那么后续每次调用`.then`或者`.catch`的时候都会直接拿到该值。
- `.then` 或者 `.catch` 中 `return` 一个 `error` 对象并不会抛出错误，所以不会被后续的 `.catch` 捕获。
- `.then` 或 `.catch` 返回的值不能是 promise 本身，否则会造成死循环。
- `.then` 或者 `.catch` 的参数期望是函数，传入非函数则会发生值透传。
- `.then`方法是能接收两个参数的，第一个是处理成功的函数，第二个是处理失败的函数，再某些时候你可以认为`catch`是`.then`第二个参数的简便写法。
- `.finally`方法也是返回一个`Promise`，他在`Promise`结束的时候，无论结果为`resolved`还是`rejected`，都会执行里面的回调函数。

### 参考

- [45道promise题](https://juejin.im/post/6844904077537574919)
- [ES6 系列之我们来聊聊 Promise #98](https://github.com/mqyqingfeng/Blog/issues/98)
- [Promises/A+规范](http://www.ituring.com.cn/article/66566)

