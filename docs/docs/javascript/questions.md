# js常见面试题

[400 道前端面试题！阿里、头条、网易等 19 家大厂面经全公开！](https://baijiahao.baidu.com/s?id=1631033043618227573&wfr=spider&for=pc)

[【面试流水账】一年半经验前端年底求职路](https://juejin.im/post/6844903971480403976?utm_source=gold_browser_extension)

1. **js数据类型有哪几种？**

   最新的 ECMAScript 标准定义了 8 种数据类型:

   - 7 种原始类型:
     Boolean
     Null
     Undefined
     Number
     BigInt(新的) - 只要在数字末尾添加n就可以
     String
     Symbol 
   - 和 Object

2. **对象转原始类型的流程**

   1. 如果Symbol.toPrimitive()方法，优先调用再返回
   2. 调用valueOf()，如果转换为原始类型，则返回
   3. 调用toString()，如果转换为原始类型，则返回
   4. 如果都没有返回原始类型，会报错

3. **数据是如何存储的？**

   - 原始类型里，除了object，都是存放在栈里的。
- 所有的对象类型，都是存放在堆里面的。
   
栈内存小，适合存储相对基础的数据类型，如果用于存放复杂的对象类型，那么程序切换上下文的开销会变得很大。在内存回收机制里，上下文切换之后，栈顶的空间会被自动回收。但是对于堆而言，内存的回收就相对复杂了。在v8进行内存回收的时候，会阻塞业务代码的执行，存放在堆内存里的数据很大，但是也会带来相应的时间开销。
   
4. **谈一下require和import的区别**

   - require是commonjs的规范，在node中实现的api，import是es的语法，由编译器处理。所以import可以做模块依赖的静态分析，配合webpack、rollup等可以做treeshaking。
   - commonjs导出的值会复制一份，require引入的是复制之后的值（引用类型只复制引用），es module导出的值是同一份（不包括export default），不管是基础类型还是应用类型。
   - 写法上有差别，import可以使用import * 引入全部的export，也可以使用import aaa, { bbb}的方式分别引入default和非default的export，相比require更灵活。

5. **深拷贝的实现**

   ```javascript
   const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;
   
   const deepClone = (target, map = new Map()) => { 
     if(map.get(target))  
       return target; 
    
     if (isObject(target)) { 
       map.set(target, true); 
       const cloneTarget = Array.isArray(target) ? []: {}; 
       for (let prop in target) { 
         if (target.hasOwnProperty(prop)) { 
             cloneTarget[prop] = deepClone(target[prop],map); 
         } 
       } 
       return cloneTarget; 
     } else { 
       return target; 
     } 
   }
   
   ```

6. **为什么 typeof null 等于 Object?**

   不同的对象在底层原理的存储是用二进制表示的，在 `javaScript`中，如果二进制的前三位都为 0 的话，系统会判定为是 `Object`类型。`null`的存储二进制是 `000`，也是前三位，所以系统判定 `null`为 `Object`类型。

7. **typeof 与 instanceof 有什么区别？**

   - `typeof` 是一元运算符，同样返回一个字符串类型。一般用来判断原始类型，因为判断数组和对象判断不出来。

     除了 `null` 类型以及 `Object` 类型不能准确判断外，其他数据类型都可能返回正确的类型。

   - `instanceof` 运算符用来测试一个对象在其原型链中是否存在一个构造函数的 `prototype` 属性。

6. **什么是内存泄漏？为什么会导致内存泄漏？**

   内存泄露是因为我们已经引用不到某个值，但是垃圾回收器却认为我们还在使用，于是这个对象就一直不能被释放。

   常见内存泄露的方式：

   - 全局变量
   - 被遗忘的定时器和回调函数
   - dom引用
   - 错误使用闭包

   Es6里的**WeekMap**和**WeekSet**就是可以让用户手动声明的弱引用。它们对值的引用都是不计入垃圾回收机制的。所以如果想在对象上添加数据，又不干扰垃圾回收机制的话，就可以使用弱引用。

7. **Object.definePrototype和Proxy有何区别？**
   - Object.definePrototype可以自己定义对象的get和set方法，不兼容IE6
   - Proxy用于定义基本操作的自定义行为，比上一个多了很多对对象的处理方法，还多了捕捉object原型上方法的方法。比如[`Object.getOwnPropertyDescriptor`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) 方法的捕捉器，可以在用户调用某个object api的时候知道用户调用了。
   
9. **V8执行js代码的流程？**
   1. 根据源代码生成ast树
   2. 根据ast树生成字节码
   3. 根据解析器逐行执行字节码，把字节码转换成机器能够识别的机器码。如果某段字节码重复出现，那么解析器会把它当成热点代码保存起来。

12. **数组拍平去重并排序**

    已知如下数组：

    var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10];

    编写一个程序将数组扁平化去并除其中重复部分数据，最终得到一个升序且不重复的数组

    > 去重 set
    >
    > Flat 数组自带方法

    ```javascript
    Array.from(new Set(arr.flat(Infinity))).sort((a,b)=>{return a-b})
    ```

    单纯拍平

    ```javascript
    // flat
    function flat(arr){
      return arr.reduce((pre,cur)=>{
        return pre.concat(Array.isArray(cur)?flat(cur):cur)
      },[])
    }
    ```

12. **reduce方法实现**

    ```javascript
    Array.prototype.reduce  = function(callbackfn, initialValue) {
      let O = Object(this);
      let len = O.length >>> 0;
      let k = 0;
      let accumulator = initialValue;
      if (accumulator === undefined) {
        for(; k < len ; k++) {
          // 查找原型链
          if (k in O) {
            accumulator = O[k];
            k++;
            break;
          }
        }
      }
      // 表示数组全为空
      if(k === len && accumulator === undefined) 
        throw new Error('Each element of the array is empty');
      for(;k < len; k++) {
        if (k in O) {
          // 注意，核心！
          accumulator = callbackfn.call(undefined, accumulator, O[k], k, O);
        }
      }
      return accumulator;
    }
    ```

    14. **一道异步题**

        https://juejin.im/post/6860646761392930830

        ```javascript
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        
        const subFlow = createFlow([() => delay(1000).then(() => log("c"))]);
        
        createFlow([
          () => log("a"),
          () => log("b"),
          subFlow,
          [() => delay(1000).then(() => log("d")), () => log("e")],
        ]).run(() => {
          console.log("done");
        });
        
        // 需要按照 a,b,延迟1秒,c,延迟1秒,d,e, done 的顺序打印
        ```

        按照上面的测试用例，实现 `createFlow`：

        - `flow` 是指一系列 `effects` 组成的逻辑片段。
        - `flow` 支持嵌套。
        - `effects` 的执行只需要支持串行。

        解答：

        ```javascript
        function createFlow(effects = []) {
          let sources = effects.slice().flat();
          function run(callback) {
            while (sources.length) {
              const task = sources.shift();
              // 把callback放到下一个flow的callback时机里执行
              const next = () => createFlow(sources).run(callback)
              if (typeof task === "function") {
                const res = task();
                if (res?.then) {
                  res.then(next);
                  return;
                }
              } else if (task?.isFlow) {
                task.run(next);
                return;
              }
            }
            callback?.();
          }
          return {
            run,
            isFlow: true,
          };
        }
        const delay = () => new Promise((resolve) => setTimeout(resolve, 1000));
        createFlow([
          () => console.log("a"),
          () => console.log("b"),
          createFlow([() => console.log("c")]),
          [() => delay().then(() => console.log("d")), () => console.log("e")],
        ]).run();
        ```

    15. **v8引擎里一段js代码如何执行的**

        1. 在执行一段代码时，JS 引擎会首先创建一个执行栈

        2. 然后JS引擎会创建一个全局执行上下文，并push到执行栈中, 这个过程JS引擎会为这段代码中所有变量分配内存并赋一个初始值（undefined）
        3. 在创建完成后，JS引擎会进入执行阶段，这个过程JS引擎会逐行的执行代码，即为之前分配好内存的变量逐个赋值(真实值)。

        如果这段代码中存在function的声明和调用，那么JS引擎会创建一个函数执行上下文，并push到执行栈中，其创建和执行过程跟全局执行上下文一样。但有特殊情况，即当函数中存在对其它函数的调用时，JS引擎会在父函数执行的过程中，将子函数的全局执行上下文push到执行栈，这也是为什么子函数能够访问到父函数内所声明的变量。

        还有一种特殊情况是，在子函数执行的过程中，父函数已经return了，这种情况下，JS引擎会将父函数的上下文从执行栈中移除，与此同时，JS引擎会为还在执行的子函数上下文创建一个闭包，这个闭包里保存了父函数内声明的变量及其赋值，子函数仍然能够在其上下文中访问并使用这边变量/常量。当子函数执行完毕，JS引擎才会将子函数的上下文及闭包一并从执行栈中移除。

        最后，JS引擎是单线程的，那么它是如何处理高并发的呢？即当代码中存在**异步调用**时JS是如何执行的。比如setTimeout或fetch请求都是non-blocking的，当异步调用代码触发时，JS引擎会将需要异步执行的代码移出调用栈，直到等待到返回结果，JS引擎会立即将与之对应的回调函数push进任务队列中等待被调用，当调用(执行)栈中已经没有需要被执行的代码时，JS引擎会立刻将任务队列中的回调函数逐个push进调用栈并执行。这个过程我们也称之为事件循环。

    16. **Cookie 和 SameSite 属性**

        https://github.com/mqyqingfeng/Blog/issues/157

    17. **实现一个sleep方法**

        ```javascript
        //Promise
        const sleep = time => {
          return new Promise(resolve => setTimeout(resolve,time))
        }
        sleep(1000).then(()=>{
          console.log(1)
        })
        
        //Generator
        function* sleepGenerator(time) {
          yield new Promise(function(resolve,reject){
            setTimeout(resolve,time);
          })
        }
        sleepGenerator(1000).next().value.then(()=>{console.log(1)})
        
        //async
        function sleep(time) {
          return new Promise(resolve => setTimeout(resolve,time))
        }
        async function output() {
          let out = await sleep(1000);
          console.log(1);
          return out;
        }
        output();
        
        //ES5
        function sleep(callback,time) {
          if(typeof callback === 'function')
            setTimeout(callback,time)
        }
        
        function output(){
          console.log(1);
        }
        sleep(output,1000);
        ```

    18. **function原型问题**

        ```javascript
        function Foo() {
          Foo.a = function() {
          	console.log(1)
          }
          this.a = function() {
          	console.log(2)
          }
        }
        Foo.prototype.a = function() {
        	console.log(3)
        }
        Foo.a = function() {
        	console.log(4)
        }
        Foo.a(); // 4，Foo里的属性方法a还没有被调用过
        let obj = new Foo();
        obj.a(); // 2，调用了属性方法，内部属性优先级高于原型方法
        Foo.a();// 1，Foo初始化之后覆盖了同名的静态方法
        ```

        **输出：**

        4

        2

        1

        **解释：**

        1. `Foo.a()` 这个是调用 Foo 函数的静态方法 a，虽然 Foo 中有优先级更高的属性方法 a，但 Foo 此时没有被调用，所以此时输出 Foo 的静态方法 a 的结果：**4**
        2. `let obj = new Foo();` 使用了 new 方法调用了函数，返回了函数实例对象，此时 Foo 函数内部的属性方法初始化，原型方法建立。
        3. `obj.a();` 调用 obj 实例上的方法 a，该实例上目前有两个 a 方法：一个是内部属性方法，另一个是原型方法。当这两者重名时，前者的优先级更高，会覆盖后者，所以输出：**2**
        4. `Foo.a();` 根据第2步可知 Foo 函数内部的属性方法已初始化，覆盖了同名的静态方法，所以输出：**1**

    19. **string转换问题**

        ```javascript
        String('11') == new String('11'); // true
        String('11') === new String('11'); // false
        ```

        **解释：**

        String() 返回 字符串，new String()返回对象

        == 的时候，实际上调用的是new String('11').toString() 也就是‘11’

    20. **实现 (5).add(3).minus(2) **

        ```javascript
        Number.prototype.add = function (number) {
            if (typeof number !== 'number') {
                throw new Error('请输入数字～');
            }
            return this + number;
        };
        Number.prototype.minus = function (number) {
            if (typeof number !== 'number') {
                throw new Error('请输入数字～');
            }
            return this - number;
        };
        console.log((5).add(3).minus(2));
        ```

    21. **要求设计 LazyMan 类，实现以下功能**

        ```js
        LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(10).eat('junk food');
        // Hi I am Tony
        // 等待了5秒...
        // I am eating lunch
        // I am eating dinner
        // 等待了10秒...
        // I am eating junk food
        ```

        **解答：**

        ```javascript
        class LazyManClass {
          constructor(name) {
            this.name = name
            this.queue = []
            console.log(`Hi I am ${name}`)
            setTimeout(() => {
              this.next()
            },0)
          }
        
          sleepFirst(time) {
            const fn = () => {
              setTimeout(() => {
                console.log(`等待了${time}秒...`)
                this.next()
              }, time)
            }
            this.queue.unshift(fn)
            return this
          }
        
          sleep(time) {
            const fn = () => {
              setTimeout(() => {
                console.log(`等待了${time}秒...`)
                this.next()
              },time)
            }
            this.queue.push(fn)
            return this
          }
        
          eat(food) {
            const fn = () => {
              console.log(`I am eating ${food}`)
              this.next()
            }
            this.queue.push(fn)
            return this
          }
        
          next() {
            const fn = this.queue.shift()
            fn && fn()
          }
        }
        
        function LazyMan(name) {
          return new LazyManClass(name)
        }
        ```

    22. **使用ES5里的var 实现 ES6 语法中的 const 声明**

        ```javascript
        // 使用es5 的语法 去实现 ES6 中的 const 的声明
        // 首先我们要知道 const 有什么特性：
        // - 不能重新定义
        // - 不能重新赋值
        // - 语义化标识，表示声明后不可更改的不变量
        // - 声明时 完成 初始化
        // 本质上：const 所保证的并不是变量的值不可改变 而是 变量所指向的内存地址不可改变 简单的数据类型保存在内存地址中 等同于常量
        	var _const=function(param,value){
        		// 使用一个对象 这里设置成 window
        		var _global = window;
        		// 判断要声明的 param 是否合法   不可以是关键字
        		var key_arr = ['class','var','let','const','return']// 还可以在增加限定关键字
        		if(!param || key_arr.i45ytygndexOf(param)>-1){
        			throw new Error(`${param} 属于关键字 声明不合法`)
        		}
        		// 判断是否已经存在了
        		if(_global.hasOwnProperty(param)){
        			throw new Error(`${param} 已经被声明过了`)
        		}
        		// 给 _global 添加属性 param 
        		_global[param] = value;
        		// 使用定义属性方法  defineProperty
        		Object.defineProperty(_global,param,{
        			get:function(){
        				return value;
        			},
        			set:function(){
        				// 检查赋值 已经存在了 不可再进行赋值
        				if(_global.hasOwnProperty(param)){
        					throw new Error(`${param} 不可再进行赋值`)
        				}
        				return value;
        			}
        		})
        	}
        	_const('TEST', "test_value"); 
        	console.log("TEST",TEST);
        	//_const('TEST', "test_value"); // Uncaught Error: TEST 已经被声明过了
        	TEST = "9999"//Uncaught Error: TEST 不可再进行赋值
        
        	console.log("TEST2",TEST);
        ```

    23. **for in和for of的区别**

        - for in

          会遍历出对象的所有可枚举的属性, 比如prototype上的，解决方法：使用hasOwnProperty判断一下

          ```javascript
          var obj = {a:1, b: 2}
          obj.__proto__.c = 3;
          Object.prototype.d = 4
          for(let val in obj) {
              console.log(val) // a,b,c,d
          }
          // 优化
          for(let val in obj) {
              if(obj.hasOwnProperty(val)) { // 判断属性是存在于当前对象实例本身，而非原型上
                  console.log(val) // a,b
              }   
          }
          ```

        - for of

          只有提供了 Iterator 接口的数据类型才可以使用 for-of，Array 等类型是默认提供的。

          ```javascript
          const obj = { a:1, b: 2 }
          
          for(let {key, value} of obj){
              console.log( key, value );
              // a 1
              // b 2
          }
          ```

          

