# vue响应式原理--数据篇

### ⛰️前言

每个人都知道vue处理数据是使用 `Object.defineproperty`这个api，那么如果让你来设计使用这个api来代理数据你会怎么写。

<img src="http://image.cocoroise.cn/截屏2020-06-27 下午11.30.35.png" style="zoom:50%;" />

### 🌋提问时间

1. 为什么能直接通过`this.xxx`获取到数据，而不是`this._data.xxx`
2. vue对数据和对象，以及普通类型的数据处理有何不同之处

### 🗻大致流程

在`core/instance/state.js`里可以看到初始化data进行了以下几个操作，判断data是不是纯对象，如果是的话就遍历这个对象，进行数据的代理和监听。

<img src="http://image.cocoroise.cn/截屏2020-06-27 下午11.42.29.png" style="zoom:64%;" />

### 🗽代理方法

在initData方法里写到了代理数据的操作，遍历一遍数据，然后通过传入的`_data`来拿到对应`vue`实例上的数据，再通过`Object.defineProperty`为这个对象设置好这个代理。

这里就解答了我们第一个问题。

```javascript
function initData(vm){
  // ...
  /*遍历data对象*/
  const keys = Object.keys(data)
  const props = vm.$options.props
  let i = keys.length

  //遍历data中的数据
  while (i--) {

    /*保证data中的key不与props中的key重复，props优先，如果有冲突会产生warning*/
    if (props && hasOwn(props, keys[i])) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${keys[i]}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(keys[i])) {
      /*判断是否是保留字段*/

      /*这里是我们前面讲过的代理，将data上面的属性代理到了vm实例上*/
      proxy(vm, `_data`, keys[i])
    }
  }
    observe(data, true /* asRootData */)
}

// 通过代理设置和获取数据
export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

### 🏝观察数据

注意到initData里有个`observe`方法，看名字就知道这个就是监听对象的重点了，看看它里面是怎么写的。

```javascript
// 方法定义在 core/observer/index.js
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value)) {
    return
  }
  let ob: Observer | void
  // 省略判断是不是已有Observer的逻辑
  ob = new Observer(value)
  if (asRootData && ob) {
     /*如果是根数据则计数，后面Observer中的observe的asRootData非true*/
    ob.vmCount++
  }
  return ob
}
```

然后顺藤摸瓜找到 `Observer`这个关键对象，看看是不是跟我们平时看到的响应式对象差不多。

```javascript
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    
    // 将Observer实例绑定到data的__ob__属性上面去
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      /*
          如果是数组，将修改后可以截获响应的数组方法替换掉该数组的原型中的原生方法
          达到监听数组数据变化响应的效果。
          这里如果当前浏览器支持__proto__属性，则直接覆盖当前数组对象原型上的原生数组方法
          如果不支持该属性，则直接覆盖数组对象的原型。
      */
      const augment = hasProto
        ? protoAugment  /*直接覆盖原型的方法来修改目标对象*/
        : copyAugment   /*定义（覆盖）目标对象或数组的某一个方法*/
      augment(value, arrayMethods, arrayKeys)

      /*如果是数组则需要遍历数组的每一个成员进行observe*/
      this.observeArray(value)
    } else {
      /*如果是对象则直接walk进行绑定*/
      this.walk(value)
    }
  }

   /*
      遍历每一个对象并且在它们上面绑定getter与setter
      这个方法只有在value的类型是对象的时候才能被调用
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    /*walk方法会遍历对象的每一个属性进行defineReactive绑定*/
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

   /*对一个数组的每一个成员进行observe*/
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      /*数组需要遍历每一个成员进行observe*/
      observe(items[i])
    }
  }
}
```

这个class主要就是分别处理数据和对象，如果是对象，遍历，为每个键都添加响应式监听。

如果是数组，那就为数组的每个值添加响应式的监听。但是，看回上面的`observe`方法，如果数组里面不是对象，而是单纯的原始类型的话，那就直接跳过，这就是数组类型直接改值不会出发监听的原因。

<img src="http://image.cocoroise.cn/截屏2020-06-28 上午12.41.19.png" style="zoom:50%;" />

#### 数组原型方法覆盖

虽然直接修改数组的值没有效果，但是我们可以用shift,pop之类的方法触发到响应式更新，这里的玄机在于

```javascript
import { arrayMethods } from './array'
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

const augment = hasProto
        ? protoAugment  /*直接覆盖原型__proto__的方法来修改目标对象*/
        : copyAugment   /*定义（覆盖）目标对象或数组的方法 def(target, key, src[key])*/
      augment(value, arrayMethods, arrayKeys)
```

数组通过覆盖原有的方法，来为操作数组提供响应式的监听，在用户改变数组之后，重新调用了`observeArray`方法，并且通知了所有订阅者重新update。

这里有个点关于`leaking arguments`,参考[这篇文章]([https://www.lasy.site/views/%E5%89%8D%E7%AB%AF/JS-leaking-arguments.html#leaking-arguments-%E6%98%AF%E4%BB%80%E4%B9%88](https://www.lasy.site/views/前端/JS-leaking-arguments.html#leaking-arguments-是什么))的解释可以知道，如果把一个函数的arg当作参数传给另外一个函数，会让V8引擎跳过优化，导致性能下降，于是尤大就采取了把aru存下来，然后再传递的做法。

```javascript
// core/observer/array.js

/*取得原生数组的原型*/
const arrayProto = Array.prototype
/*创建一个新的数组对象，修改该对象上的数组的七个方法，防止污染原生数组方法*/
export const arrayMethods = Object.create(arrayProto)

/* 这里重写了数组的这些方法，在保证不污染原生数组原型的情况下重写数组的这些方法，
 * 截获数组的成员发生的变化，执行原生数组操作的同时dep通知关联的所有观察者进行响应式处理
 */
[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  /*将数组的原生方法缓存起来，后面要调用*/
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator () {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    let i = arguments.length
    const args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    /*调用原生的数组方法*/
    const result = original.apply(this, args)

    /*数组新插入的元素需要重新进行observe才能响应式*/
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2) // 只有传递三个参数 才有追加效果
        break
    }
    if (inserted) ob.observeArray(inserted)
      
    // notify change
    /*dep通知所有注册的观察者进行响应式处理*/
    ob.dep.notify()
    return result
  })
})
```

#### 对象处理

处理对象主要是看`defineReactive`方法，记得这个方法在上一篇`composition-api`里也有介绍到，感兴趣的可以翻翻。处理对象这里主要是需要进行依赖的收集和通知操作，如果对象有子对象的话，还需要继续进行递归的操作。

```javascript
/*为对象defineProperty上在变化时通知的属性*/
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: Function
) {
  /*在闭包中定义一个dep对象*/
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)

  /*如果之前该对象已经预设了getter以及setter函数则将其取出来，新定义的getter/setter中会将其执行，保证不会覆盖之前已经定义的getter/setter。*/
  const getter = property && property.get
  const setter = property && property.set

  /*对象的子对象递归进行observe并返回子节点的Observer对象*/
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      /*如果原本对象拥有getter方法则执行*/
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        /*进行依赖收集*/
        dep.depend()
        if (childOb) {
          /*子对象进行依赖收集，其实就是将同一个watcher观察者实例放进了两个depend中，一个是正在本身闭包中的depend，另一个是子元素的depend*/
          childOb.dep.depend()
        }
        if (Array.isArray(value)) {
          /*是数组则需要对每一个成员都进行依赖收集，如果数组的成员还是数组，则递归。*/
          dependArray(value)
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      /*通过getter方法获取当前值，与新值进行比较，一致则不需要执行下面的操作*/
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
     
      if (setter) {
        /*如果原本对象拥有setter方法则执行setter*/
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      
      /*新的值需要重新进行observe，保证数据响应式*/
      childOb = observe(newVal)
      /*dep对象通知所有的观察者*/
      dep.notify()
    }
  })
}
```

### 🏕总结

关于数据的处理就到这里啦，那么一开始的两个问题现在其实很清晰了。

在vm实例上能取到值是因为有个叫`proxy`的代理函数，对数据和对象不同的处理之处在于数组是遍历之后，对每个数组成员添加监听，对这个数组本身呢，则是通过覆盖数组的原生方法来实现监听的。而对象则是通过getter的时候调用`dep.depend()`,setter的时候调用`dep.notify()`，递归的来实现对象的监听。对于`defineProperty`能不能监听数据变化的问题，具体看[这篇文章](https://segmentfault.com/a/1190000015783546)，总结来说，其实是因为考虑到性能问题，才区分数据和对象，如果是使用es6的proxy的话，就不需要区分了，但是无法支持IE，就是这样。
