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
8.  **script 引入方式**
   - html 静态`<script>`引入
   - js 动态插入`<script>`
   - `<script defer>`: 延迟加载，元素解**析完成后执行**
   - `<script async>`: **异步**加载，但执行时会**阻塞**元素渲染

9. **V8执行js代码的流程？**
   1. 根据源代码生成ast树
   2. 根据ast树生成字节码
   3. 根据解析器逐行执行字节码，把字节码转换成机器能够识别的机器码。如果某段字节码重复出现，那么解析器会把它当成热点代码保存起来。

10. 数组拍平

    ```javascript
    function flat(arr){
      return arr.reduce((pre,cur)=>{
        return pre.concat(Array.isArray(cur)?flat(cur):cur)
      },[])
    }
    ```

11. reduce方法实现

    ```javascript
    Array.prototype.reduce  = function(callbackfn, initialValue) {
      // 异常处理，和 map 一样
      // 处理数组类型异常
      if (this === null || this === undefined) {
        throw new TypeError("Cannot read property 'reduce' of null or undefined");
      }
      // 处理回调类型异常
      if (Object.prototype.toString.call(callbackfn) != "[object Function]") {
        throw new TypeError(callbackfn + ' is not a function')
      }
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

    