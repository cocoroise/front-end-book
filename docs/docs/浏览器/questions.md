# 常见问题

1. **iframe 中脚本的执行是否会阻塞主页面的渲染线程和 JS 线程**

   js是单线程的，就算是iframe里动态脚本的执行也会阻塞主页面的线程。

   - frame会阻塞主页面的onload事件
   - 主页面和iframe共享同一个连接池

   四种加载iframe的方法：

   - **普通方法**：阻塞主页面的onload
   - **在onload之后加载iframe**：onload触发以后再动态插入一个iframe标签，不会阻塞加载，但是iframe加载的时候页面也会转圈
   - **setTimeout加载**：通过setTimeout设置iframe的src值，可以避免阻塞，iframe会在主页面onload之前进行加载，这是比上一个方法好的地方
   - **友好型iframe加载**（一般用来加载广告）：
     - 先创建一个iframe，然后设置它的src为同一个域名下的静态文件
     - 在这个iframe里面，设置js变量inDapIF=true来告诉广告它已经加载在这个iframe里面了
     - 在这个iframe里面，创建一个script元素加上广告的url作为src，然后像普通广告代码一样加载
     - 当广告加载完成，重置iframe大小来适应广告

2. **事件循环输出**

   ```javascript
   console.log('script start')
   
   async function async1() {
   await async2()
   console.log('async1 end')
   }
   async function async2() {
   console.log('async2 end')
   }
   async1()
   
   setTimeout(function() {
   console.log('setTimeout')
   }, 0)
   
   new Promise(resolve => {
   console.log('Promise')
   resolve()
   })
   .then(function() {
   console.log('promise1')
   })
   .then(function() {
   console.log('promise2')
   })
   
   console.log('script end')
   ```

   输出：

   ---  第一轮宏任务 ---

   script start

   async2 end

   Promise

   script end

   async1 end

   --- 第一轮微任务 ---

   promise1

   promise2

   --- 第二轮宏任务 ---

   setTimeout

3. **事件循环题**

   ```javascript
   new Promise(resolve => {
       resolve(1);
       
       Promise.resolve().then(() => {
       	// t2
       	console.log(2)
       });
       console.log(4)
   }).then(t => {
   	// t1
   	console.log(t)
   });
   console.log(3);
   ```

   **输出：**
     4 3 2 1

4. **bind函数后this的指向问题**

   ```javascript
   function Parent(name) {
     this.nickName = name;
     this.say = function () {
       console.log("nickName--->", this.nickName);
       setTimeout(() => {
         console.log("nickName setTime--->", this.nickName);
       }, 1000);
     };
   }
   
   const obj = {
     nickName: "aaa",
     say: function () {
       console.log("child say", this.nickName);
     },
   };
   
   const child = Parent.bind(obj, "2");
   const c = new child();
   c.say();
   ```

   **输出：**

   nickName---> 2

   // 1s后

   nickName setTime---> 2

5. **let，const 和 var 的区别**

   https://muyiy.cn/question/js/27.html

   let/const会生成块级作用域，可以理解为

   ```javascript
   let a = 10;
   const b = 20;
   // 相当于：
   (function(){
            var  a = 10;
            var b = 20;
   })()
   ```

   所以window上无法访问let,const声明的变量，但是可以访问var声明的变量。

   > GlobalEnv是一个复合环境，包括一个由global构成的对象环境(objEnv)和一个一般声明的环境(declsEnv)组合而成，它是双环境组成的，统一交付一个环境存取的界面（objEnv/declsEnv 对应 Global/Script)
   >
   > let/const 声明会放在declsEnv里面，而var的变量会通过ObjEnv来声明, 所以显而易见说明，let,const 声明的变量不在window对象

   **实现原理区别：**

   - var - 直接在栈内存里**预分配内存空间**，等到实际执行的时候，在存储对应的变量。如果传递的是引用类型，则会在堆内存里开辟一个内存空间，存储实际内容，栈内存里会存储一个指向堆内存的指针。
   - let - 不会预分配空间，在**栈内存里分配变量**时，做一个检查，有相同变量名就会报错。
   - const - 也不会分配空间，对于基本类型无法修改定义的值，对于引用类型无法修改栈里面的指针，但是可以修改堆内存里对象的属性。

6. **为什么操作dom会很慢？**

   因为DOM是属于渲染引擎的东西，而JS又是JS引擎的东西。当我们从JS操作DOM的时候，其实设计到了两个线程之间的通信，那么势必会带来性能上的损耗。操作DOM的次数一多，也就一直在进行线程中的通信，同时可能会带来重绘回流的情况，所以也导致了性能上的问题。

   **所以插入几万个dom，怎么才能不卡顿呢？**

   回答：虚拟滚动