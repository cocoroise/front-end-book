# webpack使用和原理

### 前言

**webpack** 是一个用于现代 JavaScript 应用程序的*静态模块打包工具*。当 webpack 处理应用程序时，它会在内部构建一个 [依赖图(dependency graph)](https://webpack.docschina.org/concepts/dependency-graph/)，此依赖图对应映射到项目所需的每个模块，并生成一个或多个 *bundle*。

目前前端工程通过webpack的构建，支持ESModule和CommonJs的写法，达到前端模块化的需求。

### 概念介绍

1. **入口[entry]**

   入口告诉webpack应该使用哪个模块来打包，开作为构建内部以来图的开始。

   默认值是 `./src/index.js`，但你可以通过在 [webpack configuration](https://webpack.docschina.org/configuration) 中配置 `entry` 属性，来指定一个（或多个）不同的入口起点。

2. **输出[output]**

   **output** 属性告诉 webpack 在哪里输出它所创建的 *bundle*，以及如何命名这些文件。

   主要输出文件的默认值是 `./dist/main.js`，其他生成文件默认放置在 `./dist` 文件夹中。

3. **加载器[loader]**

   webpack 只能理解 JavaScript 和 JSON 文件，这是 webpack 开箱可用的自带能力。**loader** 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 [模块](https://webpack.docschina.org/concepts/modules)，以供应用程序使用，以及被添加到依赖图中。

   我们一般会使用loader去解析例如图片，vue文件，less文件等等的资源。

4. **插件[plugin]**

   loader 用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。

   包括：打包优化，资源管理，注入环境变量。

   常用的插件：tree-shaking,html-webpack-plugin

### webpack打包原理

使用过的人都知道，我们会通过**入口参数**指定webpack打包的起点，webpack会根据这个起点递归的生成一份**依赖图**。然后经过加载器和loader的处理，生成可以直接运行的**bundle**文件。

打包的主要流程：

1. 需要读到入口文件里面的内容。
2. 分析入口文件，递归的去读取模块所依赖的文件内容，生成AST语法树。
3. 根据AST语法树，生成浏览器能够运行的代码

简单代码：

```javascript
const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')
const getModuleInfo = (file)=>{
    const body = fs.readFileSync(file,'utf-8')
    const ast = parser.parse(body,{
        sourceType:'module' //表示我们要解析的是ES模块
    });
    const deps = {}
    traverse(ast,{
        ImportDeclaration({node}){
            const dirname = path.dirname(file)
            const abspath = "./" + path.join(dirname,node.source.value)
            deps[node.source.value] = abspath
        }
    })
    const {code} = babel.transformFromAst(ast,null,{
        presets:["@babel/preset-env"]
    })
    const moduleInfo = {file,deps,code}
    return moduleInfo
}
const parseModules = (file) =>{
    const entry =  getModuleInfo(file)
    const temp = [entry]
    const depsGraph = {}
    for (let i = 0;i<temp.length;i++){
        const deps = temp[i].deps
        if (deps){
            for (const key in deps){
                if (deps.hasOwnProperty(key)){
                    temp.push(getModuleInfo(deps[key]))
                }
            }
        }
    }
    temp.forEach(moduleInfo=>{
        depsGraph[moduleInfo.file] = {
            deps:moduleInfo.deps,
            code:moduleInfo.code
        }
    })
    return depsGraph
}

const bundle = (file) =>{
    const depsGraph = JSON.stringify(parseModules(file))
    return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {}
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`

}
const content = bundle('./src/index.js')

console.log(content);
```

大致流程：

<img src="http://image.cocoroise.cn/20200802190529.png" style="zoom:67%;" />

### 动态模块加载

其实异步模块加载这块使用的是类jsonP加载的方式。

加载步骤：

1. 创建一个Promise对象，使用installedChunks记录下其resolve和reject，便于后面获取资源后切换上下文，控制.then()的执行时机；
2. installedChunks用于记录已加载和加载中的chunk；
3. 创建Script标签，发起异步请求，监听onload和onerror方法，获取模块加载的状态

<img src="http://image.cocoroise.cn/20200802223519.png" style="zoom:67%;" />

### loader加载原理

根据上面的介绍可以知道，loader就是用来处理webpack不能识别的文件类型，比如说vue文件，样式文件，图片 等等。在webpack打包的过程中，如果有遇到不能识别的文件类型，就会去查找对应配置的loader，loader会帮它生成它能识别的代码。

这里我们拷贝了vue-loader的仓库，具体看看loader到底是怎么处理文件的。我们这里不涉及vue的template是怎么转换成js代码的，我们只看最简单的流程。代码都在lib/index.js里面。

1. 获取webpack传过来的source，进行初步处理

   ```javascript
   module.exports = function(source){
      const loaderContext = this
      const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r)
      const {
       target,
       request,
       minimize,
       sourceMap,
       rootContext,
       resourcePath,
       resourceQuery
     } = loaderContext
   }
   ```

2. 使用vue-compiler处理vue里的template代码

   ```javascript
   const { parse } = require('@vue/component-compiler-utils')
   
   const descriptor = parse({
       source,
       compiler: options.compiler || loadTemplateCompiler(loaderContext),
       filename,
       sourceRoot,
       needMap: sourceMap
     })
   
   // template
     let templateImport = `var render, staticRenderFns`
     let templateRequest
     if (descriptor.template) {
       const src = descriptor.template.src || resourcePath
       const idQuery = `&id=${id}`
       const scopedQuery = hasScoped ? `&scoped=true` : ``
       const attrsQuery = attrsToQuery(descriptor.template.attrs)
       const query = `?vue&type=template${idQuery}${scopedQuery}${attrsQuery}${inheritQuery}`
       const request = templateRequest = stringifyRequest(src + query)
       templateImport = `import { render, staticRenderFns } from ${request}`
     }
   ```

3. 处理script代码，样式代码同理

   ```javascript
   // script
     let scriptImport = `var script = {}`
     if (descriptor.script) {
       const src = descriptor.script.src || resourcePath
       const attrsQuery = attrsToQuery(descriptor.script.attrs, 'js')
       const query = `?vue&type=script${attrsQuery}${inheritQuery}`
       const request = stringifyRequest(src + query)
       scriptImport = (
         `import script from ${request}\n` +
         `export * from ${request}` // support named exports
       )
     }
   
     // styles
     let stylesCode = ``
     if (descriptor.styles.length) {
       stylesCode = genStylesCode(
         loaderContext,
         descriptor.styles,
         id,
         resourcePath,
         stringifyRequest,
         needsHotReload,
         isServer || isShadow // needs explicit injection?
       )
     }
   ```

4. 合并以上处理好的代码，再加上一些别的代码，完事，返回code

   ```javascript
   const componentNormalizerPath = require.resolve('./runtime/componentNormalizer')
   
   let code = `
   ${templateImport}
   ${scriptImport}
   ${stylesCode}
   
   /* normalize component */
   import normalizer from ${stringifyRequest(`!${componentNormalizerPath}`)}
   var component = normalizer(
     script,
     render,
     staticRenderFns,
     ${hasFunctional ? `true` : `false`},
     ${/injectStyles/.test(stylesCode) ? `injectStyles` : `null`},
     ${hasScoped ? JSON.stringify(id) : `null`},
     ${isServer ? JSON.stringify(hash(request)) : `null`}
     ${isShadow ? `,true` : ``}
   )
     `.trim() + `\n`
   
     if (descriptor.customBlocks && descriptor.customBlocks.length) {
       code += genCustomBlocksCode(
         descriptor.customBlocks,
         resourcePath,
         resourceQuery,
         stringifyRequest
       )
     }
   
     if (needsHotReload) {
       code += `\n` + genHotReloadCode(id, hasFunctional, templateRequest)
     }
   
     code += `\nexport default component.exports`
     return code
   ```

#### 多个loader加载 

> 我们将webpack事件流理解为webpack构建过程中的一系列事件，他们分别表示着不同的构建周期和状态，我们可以像在浏览器上监听click事件一样监听事件流上的事件，并且为它们挂载事件回调。我们也可以自定义事件并在合适时机进行广播，这一切都是使用了webpack自带的模块 `Tapable` 进行管理的。我们不需要自行安装 `Tapable` ，在webpack被安装的同时它也会一并被安装，如需使用，我们只需要在文件里直接 `require` 即可。 -- 《深入浅出webpack》

现在我们知道了单个loader是如何处理webpack传进来的source代码的，多个loader同时处理的时候，执行顺序是从后往前的，第一个执行的loader会接受源文件作为参数，下一个执行的loader会接受前一个loader执行的结果作为参数，继续执行。那么在这个流程里，消息是如何传递的呢。这里就涉及到了一个webpack内置库 - tapable，在webpack上所有的事件钩子都是tapable的实例。

#### loader的分类

- pre： 前置loader
- normal： 普通loader
- inline： 内联loader
- post： 后置loader

#### tapable

分为同步和异步两种，主要是用来触发事件，通知别人的。

- 同步
  - **syncHook** - 同步串行，不关心返回值
  - **syncBailHook** - 同步串行，只要有一个监听的函数返回值不为null，跳过剩下所有逻辑
  - **syncWaterfallHook** - 同步串行，上个函数的返回值可以传给下个函数
  - **syncLoopHook** - 同步循环，只要监听函数返回true会反复执行这个函数
- 异步
  - **asyncParalleHook** - 异步并发，不关心监听函数的返回值
  - **asyncParallelBailHook** - 异步并发，只要监听函数的返回值不为null，就忽略后面的监听函数的执行
  - **asyncSeriesHook** - 异步串行，不关心callback函数的参数
  - **asyncSeriesBailHook** - 异步串行，callback函数的参数不为null，就直接执行触发函数绑定的回调函数
  - **asyncSeriesWaterfallHook** - 异步串行，上个监听函数中的callback的第二个参数可以作为下个监听函数的参数

基本格式：

```javascript
class SyncHook{
    constructor(){
        this.hooks = [];
    }

    // 订阅事件
    tap(name, fn){
        this.hooks.push(fn);
    }

    // 发布
    call(){
        this.hooks.forEach(hook => hook(...arguments));
    }
}
```



### 插件加载原理

1. webpack插件本质上是一个函数，它的原型上存在一个名为**apply**函数。

   webpack在初始化时 (在最早触发的environment事件之前) 会执行这个函数，并将一个包含了webpack所有配置信息的compiler作为参数传递给apply函数。

2. 插件可以通过监听webpack本身触发的事件，在不同的时间阶段介入进行你想做的操作。

3. 通过获取到的compiler对象，我们可以结合tapable在插件中自定义事件并将其广播。

4. 在插件中监听一些特定的事件 (thisCompilation到afterEmit这个阶段的事件)，你可以拿到一个compilation对象，里面包含了各种编译资源，你可以通过操作这个对象对生成的资源进行添加和修改等操作。

![](http://image.cocoroise.cn/4547206-db7e5612ee08473d.png)

### 参考

[webpack官方文档](https://webpack.docschina.org/concepts/)

[Webpack模块化实现&动态模块加载原理8K+字长文](https://www.xingmal.com/article/article/1245642330535497728)

[手写webpack核心原理，再也不怕面试官问我webpack原理](https://juejin.im/post/5f1a2e226fb9a07eb1525d17#heading-10)

[webpack模块化原理-异步加载模块](https://zhuanlan.zhihu.com/p/88332125)

[webpack4.0源码分析之Tapable](https://juejin.im/post/6844903588112629767)

[webpack插件编写及原理解析](https://www.jianshu.com/p/2995fbf92e66)