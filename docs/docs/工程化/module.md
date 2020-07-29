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

#### cmd模块的异步加载

1. 首先，通过 use 方法来加载入口模块，并接收一个回调函数， 当模块加载完成， 会调用回调函数，并传入对应的模块。use 方法会 check 模块有没有缓存，如果有，则从缓存中获取模块，如果没有，则创建并加载模块。
2. 获取到模块后，模块可能还没有 load 完成，所以需要在模块上绑定一个 "complete" 事件，模块加载完成会触发这个事件，这时候才调用回调函数。
3. 创建一个模块时，id就是模块的地址，通过**创建 script 标签**的方式异步加载模块的代码（factory），factory 加载完成后，会 check factory 中有没有 require 别的子模块:
       \- 如果有，继续加载其子模块，并在子模块上绑定 "complete" 事件，来触发本身 的 "complete" 事件；
       \- 如果没有则直接触发本身的 "complete" 事件。
4. 如果子模块中还有依赖，则会递归这个过程。
5. 通过事件由里到外的传递，当所有依赖的模块都 complete 的时候，最外层的入口模块才会触发 "complete" 事件，use 方法中的回调函数才会被调用。

#### **webpack_require.e** 异步加载

异步加载的核心其实也是使用`类jsonp`的方式，通过动态创建`script`的方式实现异步加载。

```js
__webpack_require__.e = function requireEnsure(chunkId) {
  var promises = [];

  // 判断当前chunk是否已经安装，如果已经使用
  var installedChunkData = installedChunks[chunkId];
  // installedChunkData为0表示已经加载了
  if (installedChunkData !== 0) {
    //installedChunkData 不为空且不为0表示该 Chunk 正在网络加载中
    if (installedChunkData) {
      promises.push(installedChunkData[2]);
    } else {
      //installedChunkData 为空，表示该 Chunk 还没有加载过，去加载该 Chunk 对应的文件
      var promise = new Promise(function(resolve, reject) {
        installedChunkData = installedChunks[chunkId] = [resolve, reject];
      });
      promises.push((installedChunkData[2] = promise));

      // 通过 DOM 操作，往 HTML head 中插入一个 script 标签去异步加载 Chunk 对应的 JavaScript 文件
      var script = document.createElement("script");
      var onScriptComplete;

      script.charset = "utf-8";
      script.timeout = 120;
      if (__webpack_require__.nc) {
        script.setAttribute("nonce", __webpack_require__.nc);
      }
      // 文件的路径为配置的 publicPath、chunkId 拼接而成
      script.src = jsonpScriptSrc(chunkId);

      // create error before stack unwound to get useful stacktrace later
      var error = new Error();
      // 当脚本加载完成，执行对应回调
      onScriptComplete = function(event) {
        // 避免IE的内存泄漏
        script.onerror = script.onload = null;
        clearTimeout(timeout);
        // 去检查 chunkId 对应的 Chunk 是否安装成功，安装成功时才会存在于 installedChunks 中
        var chunk = installedChunks[chunkId];
        if (chunk !== 0) {
          if (chunk) {
            var errorType =
              event && (event.type === "load" ? "missing" : event.type);
            var realSrc = event && event.target && event.target.src;
            error.message =
              "Loading chunk " +
              chunkId +
              " failed.\n(" +
              errorType +
              ": " +
              realSrc +
              ")";
            error.name = "ChunkLoadError";
            error.type = errorType;
            error.request = realSrc;
            chunk[1](error);
          }
          installedChunks[chunkId] = undefined;
        }
      };
      // 设置异步加载的最长超时时间
      var timeout = setTimeout(function() {
        onScriptComplete({ type: "timeout", target: script });
      }, 120000);
      // 在 script 加载和执行完成时回调
      script.onerror = script.onload = onScriptComplete;
      document.head.appendChild(script);
    }
  }
  return Promise.all(promises);
};
```

webpackJsonpCallback 

webpackJsonpCallback的主要作用其实是 **加载并安装每个异步模块**。webpack会安装对应的 webpackJsonp文件。

```javascript
var jsonpArray = (window["webpackJsonp"] = window["webpackJsonp"] || []);
var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
// 重写数组 push 方法，重写之后，每当webpackJsonp.push的时候，就会执行webpackJsonpCallback代码
jsonpArray.push = webpackJsonpCallback;
jsonpArray = jsonpArray.slice();
for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);

function webpackJsonpCallback(data) {
  //chunkIds 异步加载的文件中存放的需要安装的模块对应的 Chunk ID
  //  moreModules 异步加载的文件中存放的需要安装的模块列表
  var chunkIds = data[0];
  var moreModules = data[1];

  //循环去判断对应的chunk是否已经被安装，如果，没有被安装就吧对应的chunk标记为安装。
  var moduleId,
    chunkId,
    i = 0,
    resolves = [];
  for (; i < chunkIds.length; i++) {
    chunkId = chunkIds[i];
    if (
      Object.prototype.hasOwnProperty.call(installedChunks, chunkId) &&
      installedChunks[chunkId]
    ) {
      // 此处的resolves push的是在__webpack_require__.e 异步加载中的 installedChunks[chunkId] = [resolve, reject];的resolve
      resolves.push(installedChunks[chunkId][0]);
    }
    installedChunks[chunkId] = 0;
  }
  for (moduleId in moreModules) {
    if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
      modules[moduleId] = moreModules[moduleId];
    }
  }
  if (parentJsonpFunction) parentJsonpFunction(data);

  while (resolves.length) {
    // 执行异步加载的所有 promise 的 resolve 函数
    resolves.shift()();
  }
}
```

参考：[JS模块加载器加载原理是怎么样的？ - 知乎](https://www.zhihu.com/question/21157540)

![](http://image.cocoroise.cn/20200729232035.png)

### 🐿模块打包过程

知道了模块的种类之后，我们可以联系到平时使用的webpack，看看写的代码是如何变成模块的。

```javascript
 (function(modules) { // webpackBootstrap
   //...
   // Load entry module and return exports
   return __webpack_require__(__webpack_require__.s = 36);
 })({
  "./src/index.js": 
  (function(module, __webpack_exports__, __webpack_require__) {/*模块内容*/}),
  "./src/es.js": 
  (function(module, __webpack_exports__, __webpack_require__) {/*模块内容*/}),
  "./src/common.js": 
  (function(module, exports) {/*模块内容*/})
});
//# sourceMappingURL=main.6196cc781843c8696cda.js.map
```

模块打包后精简的代码大致如上，从上面大概可以看出几点：

1. 我们模块被转换成了立即执行函数表达式，函数会自己执行，然后进行模块的创建和链接等工作。

2. 所有的模块被转换成对象作为参数传给webpackBootstrap。

   对象的构成：`{ [文件的路径]：[被包装后的模块内容] }`

3. 每个模块都被构造的函数包裹。

### 🐥参考

[模块方法 - webpack](https://webpack.docschina.org/api/module-methods/)

[JavaScript modules 模块 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)

[JavaScript 模块化入门Ⅰ：理解模块](https://zhuanlan.zhihu.com/p/22890374)

[前端模块化详解(完整版)](https://juejin.im/post/5c17ad756fb9a049ff4e0a62)

[Webpack模块化实现&动态模块加载原理](https://www.xingmal.com/article/article/1245642330535497728)

[webpack模块异步加载原理解析](https://juejin.im/post/5e082fc9e51d4557fd7716bf)

