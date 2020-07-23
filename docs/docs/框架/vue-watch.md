# vue响应式原理--依赖收集和派发更新篇

### 👻前言

Watcher，是vue里最核心的一个部分。它负责关联数据和视图的更新，通知每个需要更新的数据进行更新，就像一个为各家各户派发报纸的角色。今天从watcher这个文件开始，逐渐联系到平时我们的使用，最后再回顾一下composition-api里对它的使用。

<img src="http://image.cocoroise.cn/截屏2020-06-27 下午11.30.35.png" style="zoom:50%;" />



### 👾从Deps开始

平时我们开发的时候可以很直观的看到deps和watcher，dep其实就是一个存储watcher的地方。

<img src="http://image.cocoroise.cn/企业微信截图_7c00e4a7-2aba-44d1-8421-83adcd518fb1.png" style="zoom:50%;" />

其实源码里关于deps的代码也写的不多，很简单的，dep类只有三个属性，id, subs 和 target。

```javascript
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  /*添加一个观察者对象*/
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  /*移除一个观察者对象*/
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  /*依赖收集，当存在Dep.target的时候添加观察者对象*/
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  /*通知所有订阅者*/
  notify () {
    // 浅拷贝一份数组
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

/*依赖收集完需要将Dep.target设为null，防止后面重复添加依赖。*/
Dep.target = null
const targetStack = []

/*将watcher观察者实例设置给Dep.target，用以依赖收集。同时将该实例存入target栈中*/
export function pushTarget (_target: Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

/*将观察者实例从target栈中取出并设置给Dep.target*/
export function popTarget () {
  Dep.target = targetStack.pop()
}

```

主要功能如图所示

<img src="http://image.cocoroise.cn/截屏2020-06-28 下午11.52.27.png" style="zoom:50%;" />

dep的作用实际上就是保存有依赖的watchers，在一开始渲染的时候，先调用页面上有使用到数据的getter，然后把它们的watchers保存进当前的subs里。当有数据更新的时候，再通过notify方法通知subs里面的watchers进行更新。

### 🎃Watchers的实现

再看这张图

<img src="http://image.cocoroise.cn/企业微信截图_7c00e4a7-2aba-44d1-8421-83adcd518fb1.png" style="zoom:50%;" />

dep里的subs里保存watchers的实例，而watchers里的deps里又保存着所依赖的其他dep。

```javascript
import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

let uid = 0
 /*
    一个解析表达式，进行依赖收集的观察者，同时在表达式数据变更时触发回调函数。它被用于$watch api以及指令
 */
export default class Watcher {
  vm: Component;
  id: number;
  deep: boolean;
  deps: Array<Dep>;
  depIds: ISet;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ) {
    this.vm = vm
    /*_watchers存放订阅者实例*/
    vm._watchers.push(this)
    this.deps = []
    this.depIds = new Set()
  }
 
   /*获得getter的值并且重新进行依赖收集*/
  get () {
    /*将自身watcher观察者实例设置给Dep.target，用以依赖收集。*/
    pushTarget(this)
    let value
    const vm = this.vm
    /*
      执行了getter操作，看似执行了渲染操作，其实是执行了依赖收集。
      在将Dep.target设置为自身观察者实例以后，执行getter操作。
      譬如说现在的的data中可能有a、b、c三个数据，getter渲染需要依赖a跟c，
      那么在执行getter的时候就会触发a跟c两个数据的getter函数，
      在getter函数中即可判断Dep.target是否存在然后完成依赖收集，
      将该观察者对象放入闭包中的Dep的subs中去。
    */
      value = this.getter.call(vm, vm)
    
    /*如果存在deep，则触发每个深层对象的依赖，追踪其变化*/
    if (this.deep) {
      /*递归每一个对象或者数组，触发它们的getter，使得对象或数组的每一个成员都被依赖收集，形成一个“深（deep）”依赖关系*/
      traverse(value)
    }

    /*将观察者实例从target栈中取出并设置给Dep.target*/
    popTarget()
    this.cleanupDeps()
    return value
  }

   /*添加一个依赖关系到Deps集合中*/
  addDep (dep: Dep) {
    const id = dep.id
      if (!this.depIds.has(id)) {
        dep.addSub(this)
    }
  }

   /*清理依赖收集*/
  cleanupDeps () {
    /*移除所有观察者对象*/
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
  }

   /*
      调度者接口，当依赖发生改变的时候进行回调。
   */
  update () {
    if (this.sync) {
      /*同步则执行run直接渲染视图*/
      this.run()
    } else {
      /*异步推送到观察者队列中，下一个tick时调用。*/
      queueWatcher(this)
    }
  }

   /*
      调度者工作接口，将被调度者回调。
    */
  run () {
    if (this.active) {
      /* get操作在获取value本身也会执行getter从而调用update更新视图 */
      const value = this.get()
      if (
        value !== this.value ||
        /*
            即便值相同，拥有Deep属性的观察者以及在对象／数组上的观察者应该被触发更新，因为它们的值可能发生改变。
        */
        isObject(value) ||
        this.deep
      ) {
        const oldValue = this.value
        /*设置新的值*/
        this.value = value
        /*触发回调*/
          this.cb.call(this.vm, value, oldValue)
      }
    }
  }

   /*获取观察者的值*/
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

   /*收集该watcher的所有deps依赖*/
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

   /*将自身从所有依赖收集订阅列表删除*/
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      /*从vm实例的观察者列表中将自身移除，由于该操作比较耗费资源，所以如果vm实例正在被销毁则跳过该步骤。*/
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}

 /*递归每一个对象或者数组，触发它们的getter
 使得对象或数组的每一个成员都被依赖收集，形成一个“深（deep）”依赖关系*/
 /*用来存放Oberser实例等id，避免重复读取*/
const seenObjects = new Set()
function traverse (val: any) {
  seenObjects.clear()
  _traverse(val, seenObjects)
}

function _traverse (val: any, seen: ISet) {
  let i, keys
  const isA = Array.isArray(val)
  /*非对象或数组或是不可扩展对象直接return，不需要收集深层依赖关系。*/
  if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
    return
  }
  if (val.__ob__) {
    /*避免重复读取*/
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }

  /*递归对象及数组*/
  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}
```

将观察者Watcher实例赋值给全局的Dep.target，然后触发render操作。只有被Dep.target标记过的才会进行依赖收集。

有Dep.target的对象会将Watcher的实例push到subs中，在对象被修改触发setter操作的时候dep会调用subs中的Watcher实例的update方法进行渲染。

### 😲总结

依赖收集的简单的流程如下图：

<img src="http://image.cocoroise.cn/vue-watch1.png" style="zoom:50%;" />



派发更新的大致流程如下：

<img src="http://image.cocoroise.cn/vue-watch2.png" style="zoom:67%;" />

总结一下，在vue初始化的时候，会调用initState 来给所有data添加getter和setter，getter里会调用 `dep.depend()`进行依赖的收集，然后当前这个数据的watcher会被保存进dep.subs数组里。

在有数据更新的时候，调用`dep.notify()`通知所有名下的观察者，他们会依次调用自己watcher的update()，然后同步或者异步渲染视图。

### 🥺参考

> [派发更新]([https://ustbhuangyi.github.io/vue-analysis/v2/reactive/setters.html#%E8%BF%87%E7%A8%8B%E5%88%86%E6%9E%90](https://ustbhuangyi.github.io/vue-analysis/v2/reactive/setters.html#过程分析))
>
> [从源码角度再看数据绑定]([https://github.com/answershuto/learnVue/blob/master/docs/%E4%BB%8E%E6%BA%90%E7%A0%81%E8%A7%92%E5%BA%A6%E5%86%8D%E7%9C%8B%E6%95%B0%E6%8D%AE%E7%BB%91%E5%AE%9A.MarkDown](https://github.com/answershuto/learnVue/blob/master/docs/从源码角度再看数据绑定.MarkDown))

