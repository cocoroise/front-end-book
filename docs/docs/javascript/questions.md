# js常见面试题

1. js数据类型有哪几种？

   最新的 ECMAScript 标准定义了 8 种数据类型:

   - 7 种原始类型:
     Boolean
     Null
     Undefined
     Number
     BigInt(新的)
     String
     Symbol 
   - 和 Object

2. 谈一下require和import的区别
   - require是commonjs的规范，在node中实现的api，import是es的语法，由编译器处理。所以import可以做模块依赖的静态分析，配合webpack、rollup等可以做treeshaking。
   - commonjs导出的值会复制一份，require引入的是复制之后的值（引用类型只复制引用），es module导出的值是同一份（不包括export default），不管是基础类型还是应用类型。
   - 写法上有差别，import可以使用import * 引入全部的export，也可以使用import aaa, { bbb}的方式分别引入default和非default的export，相比require更灵活。