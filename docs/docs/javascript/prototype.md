# 原型链详解

### 前言

一直对原型链这块都是一知半解，今天就彻底搞懂这个东西吧。

预计讲解概念，再结合几个实际的例子进行应用，最后再看看js是怎么模拟class实现的。

本文统一使用如下例子：

```js
function Foo() {...};
let f1 = new Foo();
```



### 提问

1. `__proto__`和`prototype`的区别？
2. 为什么 `Foo.prototype.constructor = Foo`?
3. js里的class是如何实现的？



### 开始

#### 前提

在介绍三个概念之前，先介绍js里函数和对象的概念。在js里面，万物皆对象，无论是函数还是数组，本质都是有对象实现的。但是函数还是和对象有一点点的区别：

对象拥有的属性：

- [[proto]] - 也就是 `__proto__`，浏览器实现的和ES标准不同，总之这两是一个东西
- constructor - 函数的构造函数

函数拥有的属性：

> 函数是特殊的对象，它拥有对象的属性，自己又独有一个prototype属性

- [[proto]] 
- constructor
- prototype

#### 1. `__proto__`

`__proto__`这个属性就是把原型链连接起来的扣环。它由一个对象指向另外一个对象，一层一层的把对象连接起来，最后指向null，原型链结束。

<img src="http://image.cocoroise.cn/proto.png" style="zoom:67%;" />

#### 2. constructor

这个是对象的构造函数。它从一个对象指向一个函数。其实就是让对象指向它的构造函数。

**Function**这个对象比较特殊，它的构造函数就是它自己（因为Function可以看成是一个函数，也可以是一个对象），所有函数和对象最终都是由Function构造函数得来，所以`constructor`属性的终点就是**Function**这个函数。

由于Foo既是函数又是对象，Foo作为函数时，它的prototype指向Foo的原型对象，然而Foo的原型的constructor又指向作为函数的Foo，所以就形成了这样一个闭环：

```js
Foo.prototype.constructor = Foo
```

<img src="http://image.cocoroise.cn/proto1.png" style="zoom:67%;" />

#### 3. prototype

这个是函数才有的属性，这个代表的是函数的原型对象。它从函数指向它自己的原型对象。

由于实例对象的`__proto__`也指向原型对象，所以有下面这个等式

```js
f1.__proto__ = Foo.prototype
```

> prototype的**作用**就是包含可以由特定类型的所有实例共享的属性和方法，也就是让该函数所实例化的对象们都可以找到公用的属性和方法。**任何函数在创建的时候，其实会默认同时创建该函数的prototype对象。**

<img src="http://image.cocoroise.cn/proto2.png" style="zoom:67%;" />

#### 

#### 4. 联系

小小的总结一下，为什么原型链要这样设计。

我们的目的是让所有的对象都能找到它的构造函数，所以我们先加入了`__proto__`属性把父子对象联系起来，然后加入了`constructor`属性，指向对象自己的构造函数。最后，我们想把函数和对象联系起来，于是我们在函数上加入了`prototype`属性，指向他们的原型对象，这样由函数实例化的对象也可以找到正确的原型对象。这样无论是函数还是对象，我们不仅都可以找到它的原型对象，也能找到它的构造函数。这样一条链就形成了。



<img src="http://image.cocoroise.cn/20190311193622793.png" style="zoom:67%;" />



### 应用

#### 1. new的实现

```js
function myNew(Parent,...args){
	const child = Object.create(Parent.prototype);
	const result = Parent.apply(child,args);
  // 如果构造函数里有对象，返回构造函数里返回的对象，且构造函数里的对象里的this指向child
	return typeof result === 'object' ? result : child;
}
```



#### 2.class的原理

```js
// 示例
class Cat {
  // 构造函数
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  // 挂在prototype上的方法
  Say() {
    return "我的名字是" + this.name;
  }
}

class Lion extends cat {
  constructor() {
    super.Say();
  }
}
```

在babel上转译过后：

```js
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var Cat = /*#__PURE__*/ (function () {
  // 构造函数
  function Cat(name, age) {
    this.name = name;
    this.age = age;
  } // 挂在prototype上的方法

  var _proto = Cat.prototype;

  _proto.Say = function Say() {
    return "我的名字是" + this.name;
  };

  return Cat;
})();

var Lion = /*#__PURE__*/ (function (_cat) {
  _inheritsLoose(Lion, _cat);

  function Lion() {
    var _this;

    _cat.prototype.Say.call(_assertThisInitialized(_this));

    return _assertThisInitialized(_this);
  }

  return Lion;
})(cat);
```

核心就是这个函数，它实现了class的继承

```js
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}
```

结合我们本文的知识点解释一下：

它先是通过**Object.create(parent.prototype)**创建了一个新的对象，这个实现和我们在new里看到的一样。

但是不同点在于，我们继承了父类之后，想传自己的参数，但是想使用到父类的方法。

于是

我们会把构造函数指回自己

```js
subClass.prototype.constructor = subClass;
```

再把原型链跟父类给连接上，这样我们还能使用到父类的方法

```
subClass.__proto__ = superClass;
```

参考：

> [Es6 Class是如何实现的？](https://juejin.im/post/5b0abc85f265da0dbd7a648a)
>
> [ES6—类的实现原理](https://segmentfault.com/a/1190000008390268)
>
> [【翻译】JavaScript原型继承工作原理](https://www.ituring.com.cn/article/56184)



### 参考

强烈推荐😁：[帮你彻底搞懂JS中的prototype、__proto__与constructor（图解）](https://blog.csdn.net/cc18868876837/article/details/81211729)

[继承与原型链 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)

