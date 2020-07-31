# vuex源码解析

> 参考：[[Vuex框架原理与源码分析](https://tech.meituan.com/2017/04/27/vuex-code-analysis.html)](https://tech.meituan.com/2017/04/27/vuex-code-analysis.html)

### 😊前言

看vuex的源码是为了解答我最近几个问题，在学习使用vue-composition-api的时候，觉得如果可以自己创建全局的响应式数据，那么使用vuex就没有那么大的必要了，所以想自己实现一个composition模式下的状态管理方案，单是实现的话，没有什么太大的问题，主要是数据流向不清晰，没有记录，和时间穿梭怎么处理，于是，有了以下几个问题：

1. vuex如何实现namespace
2. vuex对象怎么挂载到vue上
3. 改变数据的时候，如何知道数据被改变了，被谁改变了
4. 如何实现时间穿梭
5. mutation除了给state赋值还有什么作用吗，能不能去掉mutation这种模板代码

### 😍框架核心流程

1. 初始化vuex，vuex变量注入vue
2. 初始化store
4. 挂载dispatch对象和_commit对象
4. module安装

### 😯步骤一 初始化操作

按照一般的安装插件逻辑，插件需要提供一个install方法，然后vue会进行调用，把自己给传进去，然后执行插件传入的初始化方法，初始插件的对象

```javascript
export function install (_Vue) {
  if (Vue && _Vue === Vue) {
    if (__DEV__) {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
```

然后再执行的是 **applyMixin** 方法

```javascript
export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // 封装并替换vue原型上面的_init方法
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * 将初始化Vue根组件时传入的store设置到this对象的$store属性上
   */

  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
```

### 😕步骤二 初始化store对象

对应源码里的store本来面目是这样的

```javascript
	this._committing = false // 正在提交
    this._actions = Object.create(null) // actions
    this._actionSubscribers = []
    this._mutations = Object.create(null) // mutation
    this._wrappedGetters = Object.create(null) // getters
    this._modules = new ModuleCollection(options) // Vuex支持store分模块传入，存储分析后的modules
    this._modulesNamespaceMap = Object.create(null)// 模块命名空间
    this._subscribers = [] // 订阅函数集合
    this._watcherVM = new Vue() // vuex里实现的watch函数实际是借用了vue的watch函数
    this._makeLocalGettersCache = Object.create(null)
```

设置对应的commit和dispatch

```javascript
 // bind commit and dispatch to self
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }
```

这里封装替换原型中的dispatch和commit方法，将this指向当前store对象。

### 🤪步骤三 实现dispatch和commit函数

上面把dispath和commit挂到了this上，下面就来看看实际的函数长什么样。

```javascript
dispatch (_type, _payload) {
    // 查找object上有没有type属性
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload)

    const action = { type, payload }
    // 使用type取对应的actions操作
    const entry = this._actions[type]
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown action type: ${type}`)
      }
      return
    }

    try {
      this._actionSubscribers
        .slice() // 浅拷贝，防止订阅者取消订阅的时候迭代器失效
        .filter(sub => sub.before)
        .forEach(sub => sub.before(action, this.state))
    } catch (e) {
      if (__DEV__) {
        console.warn(`[vuex] error in before action subscribers: `)
        console.error(e)
      }
    }

    const result = entry.length > 1
     // 异步调用所有handler处理 ，传入一些参数(payload)
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)

    return new Promise((resolve, reject) => {
      result.then(res => {
        try {
          this._actionSubscribers
            .filter(sub => sub.after)
            // 把返回的结果给到订阅者
            .forEach(sub => sub.after(action, this.state))
        } catch (e) {
          if (__DEV__) {
            console.warn(`[vuex] error in after action subscribers: `)
            console.error(e)
          }
        }
        resolve(res)
      }, error => {
        try {
          this._actionSubscribers
            .filter(sub => sub.error)
            // 发生错误的时候调用订阅者的错误函数
            .forEach(sub => sub.error(action, this.state, error))
        } catch (e) {
          if (__DEV__) {
            console.warn(`[vuex] error in error action subscribers: `)
            console.error(e)
          }
        }
        reject(error)
      })
    })
  }
```

commit的实现

```javascript
commit (_type, _payload, _options) {
    // check object-style commit
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation = { type, payload }
    const entry = this._mutations[type]
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }
    // 专用修改state方法，其他修改state方法均是非法修改
    this._withCommit(() => {
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })

    // 通知所有_subscribers（订阅函数）本次操作的mutation对象以及当前的state状态
    this._subscribers
      .slice()
      .forEach(sub => sub(mutation, this.state))
  }
```

这里可以看到，与dispatch实现不同的的地方就是在执行commit的时候，我们被一个_withCommit函数给代理了，这个函数记录了我们是否是通过commit修改的对象

```javascript
_withCommit (fn) {
    // 缓存之前的提交状态
    const committing = this._committing
    // 提交时设置为true，如果不设置为true，在strict模式下，会出现警告
    this._committing = true
    fn()
    // 函数执行之后还原之前的状态
    this._committing = committing
  }
```

### 😷步骤四 module的安装

绑定完dispatch和commit之后进行了模块的安装操作。

```javascript
installModule(this, state, [], this._modules.root)
```

这里传入了root module，然后递归的注册了子模块，顺便还把所有的getters放在了_wrappedGetters下面

来看代码：

```javascript
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  // 获取命名空间
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (module.namespaced) {
      // 查找是否有重复命名
    if (store._modulesNamespaceMap[namespace] && __DEV__) {
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  if (!isRoot && !hot) {
    // 分析path拿到state
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      // 非根组件设置 state 方法
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)
  
  // 为每一个模块设置相应的mutation,action,getter方法
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

registerMutation方法中，获取store中的对应mutation type的处理函数集合，将新的处理函数push进去。这里将我们设置在mutations type上对应的 handler 进行了封装，给原函数传入了state。

在执行 `commit('xxx', payload)` 的时候，type为 xxx 的mutation的所有handler都会接收到state以及payload，这就是在handler里面拿到state的原因。

```javascript
function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}
```

设置action

```javascript
function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  // 存储新的handler
  entry.push(function wrappedActionHandler (payload) {
    // 传入dispath，commit等对象供我们使用，这样就能通过 {dispath,commit}拿到本模块的方法
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    if (!isPromise(res)) {
        // 兼容promise的链式调用
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        // 有错误的话触发devtool的事件 
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}
```

设置getter

```javascript
function registerGetter (store, type, rawGetter, local) {
  store._wrappedGetters[type] = function wrappedGetter (store) {
    // 为原getters传入对应状态
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}
```

action handler比mutation handler以及getter wrapper多拿到dispatch和commit操作方法，因此action可以进行dispatch action和commit mutation操作。

### 🙄步骤五 插件注入

vuex可以在vue的devtool里看到详细的数据和操作记录，是怎么做到的呢

```javascript
// plugin/devtools.js
const target = typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
    ? global
    : {}
// devtool暴露出来的在window上的一个对象
const devtoolHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__

export default function devtoolPlugin (store) {
  if (!devtoolHook) return

  store._devtoolHook = devtoolHook
    
  // 通过触发事件来告诉devtool vuex如何变化了
  devtoolHook.emit('vuex:init', store)

  devtoolHook.on('vuex:travel-to-state', targetState => {
    store.replaceState(targetState)
  })

  store.subscribe((mutation, state) => {
    devtoolHook.emit('vuex:mutation', mutation, state)
  }, { prepend: true })

  store.subscribeAction((action, state) => {
    devtoolHook.emit('vuex:action', action, state)
  }, { prepend: true })
}

```

### 🤔总结

回想一开始思考的几个问题

1. vuex如何实现namespace

> vuex里有一个makeLocalContext方法,所有的module都有local context,如果是在local内部执行dispatch的时候,拿到的都是内部的local state,就不需要再加路径.但是访问其他模块的话,就会依靠path来查找对应模块下的方法.

2. vuex对象怎么挂载到vue上

> 在vuex的install方法里,给vue原型上挂了一个$store对象,可以通过这个对象访问.

3. 改变数据的时候，如何知道数据被改变了，被谁改变了

> 改变数据的时候,被一个_withCommit函数包了一层,在修改数据的时候,只有通过commit触发的修改才会置内部的变量为true,所以开了严格模式的时候,只要watch 一下state,修改的时候看变量是否为true,就可以知道是被this.state.a=xxx改变的还是被commit改变的

4. 如何实现时间穿梭

> devtoolPlugin中提供了此功能。因为dev模式下所有的state change都会被记录下来，’时空穿梭’ 功能其实就是将当前的state替换为记录中某个时刻的state状态，利用 `store.replaceState(targetState)` 方法将执行`this._vm.state = state` 实现。

5. mutation除了给state赋值还有什么作用吗，能不能去掉mutation这种模板代码

> 其实我个人感觉这一层mutation只有简单赋值的作用,并没有太大的作用,vue里的数据本来就是响应式的,就算所有操作state的操作都放在dispatch里,然后在dispatch里添加对应的_withCommit方法也没有问题,也同样可以实现时间旅行和记录的功能.这样做有点强行对应redux的感觉,个人觉得略麻烦/
>
> 官方文档里说到mutation一定得是同步的,因为异步的函数执行了之后什么时候会修改状态是未知的,这样就无法知道每个时刻state的状态.但是如果想给同步和异步函数添加时间旅行的功能的话,只要在异步函数的promise执行完之后再设置记录就可以把.现在是强行把这一个步骤塞给了用户,让用户自己去设置这个Mutaion,这样就多写了很多样板代码.
