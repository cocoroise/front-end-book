# 常见面试问题

1. 对tree-shaking的了解？
   - 虽然生产模式下默认开启，但是由于经过了babel编译，全部模块都被封装成IIFE
   - IIFE存在副作用无法被tree-shaking掉
   - 需要配置 `{ module: false }`和 `sideEffects: false`
   - rollup 和 webpack 的 shaking 程度不同
2. commonJs和es6 module的区别？
   - commonjs是加载时运行，而es module是编译时运行
   - commonjs输出的是值的浅拷贝，es module是值的引用
   - webpack的webpack_require对他们的处理方式不同
3. 前端大型文件上传优化？
   - 文件切片
   - 用web-worker单独计算文件的hash值
   - 进度条处理
   - 对已经传过的文件跳过秒传，对失败的文件做重传处理
   - 上传由于和其他接口同一域名，所以要做并发数处理

4. hmr实现原理