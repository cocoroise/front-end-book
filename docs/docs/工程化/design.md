# 设计模式介绍

### 前言

设计模式代表了最佳的实践，通常被有经验的面向对象的软件开发人员所采用。设计模式是软件开发人员在软件开发过程中面临的一般问题的解决方案。这些解决方案是众多软件开发人员经过相当长的一段时间的试验和错误总结出来的。

### 设计模式的类型

**➜创建型**

- **单例模式**
- 原型模式
- **工厂模式**
- 抽象工厂模式
- 建造者模式

**➜结构型**

- **适配器模式**
- **装饰器模式**
- **代理模式**
- 外观模式
- 桥接模式
- 组合模式
- 享元模式

**➜行为型**

- **观察者模式**
- **迭代器模式**
- **策略模式**
- 模板方法模式
- **职责链模式**
- 命令模式
- **备忘录模式**
- 状态模式
- 访问者模式
- 中介者模式
- 解释器模式

太多了讲完也没意思，挑几种平时能用得到的了解一下就好，思想都是融会贯通的。

在讲解的过程中应该带上真实的例子，这样更方便理解记忆，以后如果遇到同样的场景也能立即想到并使用。

### 1. 工厂模式

工厂模式顾名思义就是类似一个工厂，你想要什么东西告诉工厂，它根据你的要求给你生产出同一种类但是不同参数的商品。

**适用场景**

- 不想让某个子系统与较大的那个对象之间形成强耦合
- 将new操作简单封装，遇到new的时候就应该考虑是否用工厂模式
- 需要依赖具体环境创建不同实例，这些实例都有相同的行为

```javascript
class Product {
    constructor(name) {
        this.name = name
    }
    init() {
        console.log('init')
    }
    fun() {
        console.log('fun')
    }
}

class Factory {
    create(name) {
        return new Product(name)
    }
}

// use
let factory = new Factory()
let p = factory.create('p1')
p.init()
p.fun()
```

**应用**

- vue异步组件

在大型应用中，我们可能需要将应用分割成小一些的代码块，并且只在需要的时候才从服务器加载一个模块。为了简化，Vue 允许你以一个工厂函数的方式定义你的组件，这个工厂函数会异步解析你的组件定义。Vue 只有在这个组件需要被渲染的时候才会触发该工厂函数，且会把结果缓存起来供未来重渲染。

```javascript
Vue.component('async-example', function (resolve, reject) {
  setTimeout(function () {
    // 向 `resolve` 回调传递组件定义
    resolve({
      template: '<div>I am async!</div>'
    })
  }, 1000)
})
```

### 2. 单例模式

单例模式我们平时用的不少。比如全局唯一的message，或者是唯一的vue store实例。

单例模式其实就是 一个类只有一个实例，并提供一个访问它的全局访问点。

```javascript
let instance;
if(instance || window.instance){
  return instance;
}else{
	instance = new Instance();
}
```

### 3. 适配器模式

将一个类的接口转化为另外一个接口，以满足用户需求，使类之间接口不兼容问题通过适配器得以解决。

如果使用适配器模式让使用者和代码复杂度都成倍的增长的话，应该考虑重构代码。

```javascript
class Plug {
  getName() {
    return 'iphone充电头';
  }
}

class Target {
  constructor() {
    this.plug = new Plug();
  }
  getName() {
    return this.plug.getName() + ' 适配器Type-c充电头';
  }
}

let target = new Target();
target.getName(); // iphone充电头 适配器转Type-c充电头
```

**应用**

- 整合第三方SDK

- 封装旧接口

- vue computed

  由于数据不符合要求所以通过计算属性重新把数据适配成我们需要的格式。

  ```
  computed: {
              reversedMessage: function() {
                  return this.message.split('').reverse().join('')
              }
          }
  ```

### 4. 装饰者模式

装饰者就是在不改变原有对象的基础上，对这个对象进行封装，给这个对象加上一些其他的功能。

**应用**

- react里的高阶组件HOC

  ```javascript
  export default function (description) {
      return function (WrappedComponent) {
          return class HOC extends Component{
              render() {
                  return <div>
                      <div className="geek-description">
                          {description?description:' '}
                      </div>
                      <WrappedComponent{...this.props}/>
                  </div>
              }
          }
      }
  }
  ```

- es7的 Decorator

  ```javascript
  @withDescription('aaa')
   export default class Geek extends Component{
       render() {
           return (
               //...
           );
       }
   }
  ```

### 5 . 代理模式

不直接触发事件或者调用函数，而是通过一层代理代替你做这个事。

**应用**

- html事件代理

  ```javascript
  <ul id="ul">
    <li>1</li>
    <li>2</li>
    <li>3</li>
  </ul>
  <script>
    let ul = document.querySelector('#ul');
    ul.addEventListener('click', event => {
      console.log(event.target);
    });
  </script>
  
  ```

- es6 proxy

  ```javascript
  let proxyObj = new Proxy(obj,{
          get : function (target,prop) {
              return prop in target ? target[prop] : 0
          },
          set : function (target,prop,value) {
              target[prop] = 888;
          }
      })
  ```

- 代理服务器

### 6. 观察者模式

定义了一种一对多的关系，让多个观察者对象同时监听某一个主题对象，这个主题对象的状态发生变化时就会通知所有的观察者对象，使它们能够自动更新自己，当一个对象的改变需要同时改变其它对象，并且它不知道具体有多少对象需要改变的时候，就应该考虑使用观察者模式。

```javascript
class Subject {
  constructor() {
    this.state = 0
    this.observers = []
  }
  getState() {
    return this.state
  }
  setState(state) {
    this.state = state
    this.notifyAllObservers()
  }
  notifyAllObservers() {
    this.observers.forEach(observer => {
      observer.update()
    })
  }
  attach(observer) {
    this.observers.push(observer)
  }
}

// 观察者
class Observer {
  constructor(name, subject) {
    this.name = name
    this.subject = subject
    this.subject.attach(this)
  }
  update() {
    console.log(`${this.name} update, state: ${this.subject.getState()}`)
  }
}

// 测试
let s = new Subject()
let o1 = new Observer('o1', s)
let o2 = new Observer('02', s)

s.setState(12)
```

#### **发布-订阅模式**

**在发布订阅模式里，发布者，并不会直接通知订阅者，换句话说，发布者和订阅者，彼此互不相识。**

互不相识？那他们之间如何交流？

**答案是，通过第三者，也就是在消息队列里面，我们常说的经纪人Broker。**

**应用**

- DOM事件

  ```javascript
  document.body.addEventListener('click', function() {
      console.log('hello world!');
  });
  document.body.click()
  ```

  

- vue响应式原理

### 7. 迭代器模式

提供一种方法顺序一个聚合对象中各个元素，而又不暴露该对象的内部表示。

```javascript
class Iterator {
    constructor(conatiner) {
        this.list = conatiner.list
        this.index = 0
    }
    next() {
        if (this.hasNext()) {
            return this.list[this.index++]
        }
        return null
    }
    hasNext() {
        if (this.index >= this.list.length) {
            return false
        }
        return true
    }
}

class Container {
    constructor(list) {
        this.list = list
    }
    getIterator() {
        return new Iterator(this)
    }
}

// 测试代码
let container = new Container([1, 2, 3, 4, 5])
let iterator = container.getIterator()
while(iterator.hasNext()) {
  console.log(iterator.next())
}
```

**应用**

- Array.prototype.forEach
- jQuery中的$.each()
- ES6 Iterator

### 8. 策略模式

定义一系列的算法，把它们一个个封装起来，并且使它们可以互相替换。

```javascript
const strategies = {
          isNoEmpty: function (value, errorMsg) {
            if (value === '') {
              return errorMsg;
            }
          },
          maxLength: function (value, length, errorMsg) {
            if (value.length > length) {
              return errorMsg;
            }
          },
          isMobile: function (value, errorMsg) {
            if (!/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[7]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test(value)) {
              return errorMsg;
            }                
          }
        }
```

**应用**

- 表单验证

### 9.  职责链模式

使多个对象都有机会处理请求，从而避免请求的发送者和接受者之间的耦合关系，将这些对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止。

```javascript
// 请假审批，需要组长审批、经理审批、总监审批
class Action {
    constructor(name) {
        this.name = name
        this.nextAction = null
    }
    setNextAction(action) {
        this.nextAction = action
    }
    handle() {
        console.log( `${this.name} 审批`)
        if (this.nextAction != null) {
            this.nextAction.handle()
        }
    }
}

let a1 = new Action("组长")
let a2 = new Action("经理")
let a3 = new Action("总监")
a1.setNextAction(a2)
a2.setNextAction(a3)
a1.handle()
```

**应用**

- JS 中的事件冒泡
- 作用域链
- 原型链

### 10. 备忘录模式

在不破坏封装性的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态。这样以后就可将该对象恢复到保存的状态。

```javascript
//备忘类
class Memento{
    constructor(content){
        this.content = content
    }
    getContent(){
        return this.content
    }
}
// 备忘列表
class CareTaker {
    constructor(){
        this.list = []
    }
    add(memento){
        this.list.push(memento)
    }
    get(index){
        return this.list[index]
    }
}
// 编辑器
class Editor {
    constructor(){
        this.content = null
    }
    setContent(content){
        this.content = content
    }
    getContent(){
     return this.content
    }
    saveContentToMemento(){
        return new Memento(this.content)
    }
    getContentFromMemento(memento){
        this.content = memento.getContent()
    }
}

//测试代码

let editor = new Editor()
let careTaker = new CareTaker()

editor.setContent('111')
editor.setContent('222')
careTaker.add(editor.saveContentToMemento())
editor.setContent('333')
careTaker.add(editor.saveContentToMemento())
editor.setContent('444')

console.log(editor.getContent()) //444
editor.getContentFromMemento(careTaker.get(1))
console.log(editor.getContent()) //333

editor.getContentFromMemento(careTaker.get(0))
console.log(editor.getContent()) //222
```

**应用**

- 分页控件
- 撤销组件
- 页面vuex持久化



### 参考

[JavaScript设计模式es6（23种)](https://juejin.im/post/6844904032826294286)

[观察者模式 vs 发布订阅模式](https://zhuanlan.zhihu.com/p/51357583)