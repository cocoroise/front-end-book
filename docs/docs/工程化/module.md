# 前端模块化总结

### 🐭前言

在webpack打包的时候，我们可以选择打包成window(浏览器端)，global(node端)，umd，amd，system，甚至还能打包成jsonp，只需要设置：

```
output: {
    filename: 'lib/index.js',
    library: {
      root: 'myBtns',
      commonjs: 'my-buttons',
      amd: 'my-buttons'
    },
    // 设置导出模块类型
    libraryTarget: 'umd'
  },
```

那么这些模块都有什么区别呢，今天就来探索详细介绍一下前端的模块化方面的知识。

### 🐰开始

想一下，我们平时引入库的时候有几种方法：

- script

  ```html
  <script src="demo.js"></script>
  <script>demo();</script>
  ```

- amd

  ```js
  define(['demo'], function(demo) {
    demo();
  });
  ```

- commonJs - node

  ```js
  const demo = require('demo');
    
  demo();
  ```

- Es6 module

  ```javascript
  import demo from 'demo';
  
  demo();
  ```

在js刚开始的时候，我们可以使用类似jq的模式引入，使用单个单个变量把所有的代码包含在一个函数内，由此来创建私有的命名空间和作用域。

```javascript
var jQuery = function(){
  return new jQuery.fn.init();
}
jQuery.fn = jQuery.prototype = {
  constructor: jQuery,
  init: function(){
    this.jquery = 3.0;
    return this;
  },
  each: function(){
    console.log('each');
    return this;
  }
}
```

但是后来模块逐渐复杂，而且需要自己管理依赖的时候，就演变出很多的问题。这个时候CommonJS和AMD就出现了。

- **CommonJS**

  通过指定导出的对象名称，CommonJS模块系统可以识别在其他文件引入这个模块时应该如何解释。

  这种实现比起模块模式有两点好处：

  - 避免全局命名空间污染
  - 明确代码之间的依赖关系

  ```javascript
  const fs = require("fs");
  
  function mo(){
    console.log('commonjs module')
  }
  module.exports = mo;
  ```

  但是需要注意的一点是，CommonJS以**服务器优先**的方式来同步载入模块，假使我们引入三个模块的话，他们会**一个个地被载入**。

  它在服务器端用起来很爽，可是在浏览器里就不会那么高效了。毕竟读取网络的文件要比本地耗费更多时间。只要它还在读取模块，浏览器载入的页面就会一直卡着不动。

- **AMD**

  假使我们想要实现异步加载模块该怎么办？答案就是Asynchronous Module Definition（异步模块定义规范），简称AMD。

  ```javascript
  define(['myModule', 'myOtherModule'], function(myModule, myOtherModule) {
    console.log(myModule.hello());
  });
  ```

  除了异步加载以外，AMD的另一个优点是你可以在**模块里使用对象、函数、构造函数、字符串、JSON或者别的数据类型**，而CommonJS只支持对象。

  再补充一点，AMD不支持Node里的一些诸如 IO,文件系统等其他服务器端的功能。另外语法上写起来也比CommonJS麻烦一些。

  [RequireJS](http://requirejs.org/)和[curl.js](https://github.com/cujojs/curl)就是实现了AMD规范。而且RequireJS在实现AMD的同时，还提供了一个CommonJS包裹，这样CommonJS模块可以几乎直接被RequireJS引入。

  ```javascript
  define(function(require, exports, module) {
  	var someModule = require('someModule'); // in the vein of node
  	exports.doSomethingElse = function() { return someModule.doSomething() + "bar"; };
  });
  ```

  

- **UMD**

  官网：https://github.com/umdjs/umd

  在一些同时需要AMD和CommonJS功能的项目中，你需要使用另一种规范：**Universal Module Definition（通用模块定义规范）**。

  UMD创造了一种同时使用两种规范的方法，并且也支持全局变量定义。所以UMD的模块可以**同时在客户端和服务端使用**。

  ```javascript
  ;(function(){
      function MyModule() {
          // ...
      }
      
      var moduleName = MyModule;
      if (typeof module !== 'undefined' && typeof exports === 'object') {
          module.exports = moduleName;
      } else if (typeof define === 'function' && (define.amd || define.cmd)) {
          define(function() { return moduleName; });
      } else {
          this.moduleName = moduleName;
      }
  }).call(function() {
      return this || (typeof window !== 'undefined' ? window : global);
  });
  ```

  缺点：

  - 代码量多
  - 代码合并不方便。requireJs合并不了UMD的代码。在独立项目里不需要使用UMD。

- **CMD**

  CMD规范专门用于浏览器端，模块的加载是异步的，模块使用时才会加载执行。CMD规范整合了CommonJS和AMD规范的特点。在 Sea.js 中，所有 JavaScript 模块都遵循 CMD模块定义规范。

  **AMD 推崇依赖前置、提前执行，CMD推崇依赖就近、延迟执行**。CMD 是 SeaJS 在推广过程中对模块定义的规范化产出。

  ```javascript
  //定义没有依赖的模块
  define(function(require, exports, module){
    exports.xxx = value
    module.exports = value
  })
  
  //定义有依赖的模块
  define(function(require, exports, module){
    //引入依赖模块(同步)
    var module2 = require('./module2')
    //引入依赖模块(异步)
      require.async('./module3', function (m3) {
      })
    //暴露模块
    exports.xxx = value
  })
  
  // 使用
  define(function (require) {
    var m1 = require('./module1')
    var m4 = require('./module4')
    m1.show()
    m4.show()
  })
  ```

  

- **ES6 module**

  在es6里，引入了一种新的模块功能，支持同步和异步两种。

  它的思想是尽量静态化，使得编译时就能确定模块的依赖关系，以及输入输出的变量。

  在script标签上加上`type="module"`的话，就可以直接在浏览器里定义你的模块啦。

  - es6模块和commonJs模块的差别

    1. CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。

    2. CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。



### 🐼异步模块加载原理

cmd模块的加载流程：

1. 首先，通过 use 方法来加载入口模块，并接收一个回调函数， 当模块加载完成， 会调用回调函数，并传入对应的模块。use 方法会 check 模块有没有缓存，如果有，则从缓存中获取模块，如果没有，则创建并加载模块。
2. 获取到模块后，模块可能还没有 load 完成，所以需要在模块上绑定一个 "complete" 事件，模块加载完成会触发这个事件，这时候才调用回调函数。
3. 创建一个模块时，id就是模块的地址，通过创建 script 标签的方式异步加载模块的代码（factory），factory 加载完成后，会 check factory 中有没有 require 别的子模块:
       \- 如果有，继续加载其子模块，并在子模块上绑定 "complete" 事件，来触发本身 的 "complete" 事件；
       \- 如果没有则直接触发本身的 "complete" 事件。
4. 如果子模块中还有依赖，则会递归这个过程。
5. 通过事件由里到外的传递，当所有依赖的模块都 complete 的时候，最外层的入口模块才会触发 "complete" 事件，use 方法中的回调函数才会被调用。

参考：[JS模块加载器加载原理是怎么样的？ - 知乎](https://www.zhihu.com/question/21157540)



### 🐥参考

[模块方法 - webpack](https://webpack.docschina.org/api/module-methods/)

[JavaScript modules 模块 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)

[JavaScript 模块化入门Ⅰ：理解模块](https://zhuanlan.zhihu.com/p/22890374)

[前端模块化详解(完整版)](https://juejin.im/post/5c17ad756fb9a049ff4e0a62)