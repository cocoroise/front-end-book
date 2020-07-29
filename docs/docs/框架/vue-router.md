# vue Router原理

>  参考：[前端路由简介以及vue-router实现原理](https://zhuanlan.zhihu.com/p/37730038)

### 🚐  简介

路由这个概念最先是后端出现的。在以前用模板引擎开发页面时，经常会看到这样

```
http://www.xxx.com/login
```

大致流程可以看成这样：

1. 浏览器发出请求
2. 服务器监听到 80 端口（或443）有请求过来，并解析url路径
3. 根据服务器的路由配置，返回相应信息（可以是 html 字串，也可以是 json 数据，图片等）
4. 浏览器根据数据包的 Content-Type 来决定如何解析数据

简单来说路由就是用来跟后端服务器进行交互的一种方式，通过不同的路径，来请求不同的资源，请求不同的页面是路由的其中一种功能。



### 🎀  路由模式

![](http://image.cocoroise.cn/router-1.png)

常用的路由模式就只有两种，hash模式和history模式。平时我们用的时候没有什么区别，官网里介绍也就是hash模式的路径里会带上一个丑丑的`#`。如果想要配置`history`模式的话，需要在nginx里配置一下，把路径匹配到根页面下就行了。



### 🍥  VueRouter的实现--注册

![](http://image.cocoroise.cn/router-2.png)



### 🌼  VueRouter的实现--初始化

![](http://image.cocoroise.cn/router-3.png)



### 🍙  VueRouter的实现--hash模式的实现

在看源码之前，先想想如果是我们来实现一个路由会怎么实现。首先，是不是得先有个路由的数据结构，平时开发的时候看到的数据都是这样的：

```
{
	fullPath:"/",
	hash:"",
	matched:[],
	meta:{},
	name:'aaa',
	params:{},
	path:"/",
	query:{}
}
```

那咱们就要构造一个这样的数据结构存放路由的信息。接下来在跳转之前，添加对应的监听方法，在`hash`模式里对应的监听方法就是`hashChange`。这个方法里传入的回调，当然就是解析路径里`#`之后的路径，然后使用match方法去匹配对应的组件，再交给vue渲染就行了。当然，我们平时用到的`beforeEach `,`beforeRouteEnter `都在需要添加进入相应的钩子。

按照这样的思路去看源码，可以看到对应的操作。

1. 先构造对应的路由数据结构

   ```javascript
   export function createRoute (
     record: ?RouteRecord,
     location: Location,
     redirectedFrom?: ?Location,
     router?: VueRouter
   ): Route {
     const stringifyQuery = router && router.options.stringifyQuery
   
     let query: any = location.query || {}
     try {
       // 一个深拷贝
       query = clone(query)
     } catch (e) {}
   
     const route: Route = {
       name: location.name || (record && record.name),
       meta: (record && record.meta) || {},
       path: location.path || '/',
       hash: location.hash || '',
       query,
       params: location.params || {},
       fullPath: getFullPath(location, stringifyQuery),
       matched: record ? formatMatch(record) : []
     }
     if (redirectedFrom) {
       route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
     }
     return Object.freeze(route)
   }
   
   export const START = createRoute(null, {
     path: '/'
   })
   
   this.current = START
   ```

   2. 根据`this.router.match`来获取`route`对象。

      ```javascript
       function match (
          raw: RawLocation,  // 目标url
          currentRoute?: Route, // 当前url对应的route对象
          redirectedFrom?: Location // 重定向
        ): Route {
          // 解析当前 url，得到 hash、path、query和name等信息
          const location = normalizeLocation(raw, currentRoute, false, router)
          const { name } = location
          // 如果是命名路由
          if (name) {
            //  得到路由记录
            const record = nameMap[name]
            // 不存在记录 返回
            if (!record) return _createRoute(null, location)
            const paramNames = record.regex.keys
              .filter(key => !key.optional)
              .map(key => key.name)
      
            if (typeof location.params !== 'object') {
              location.params = {}
            }
            // 复制 currentRoute.params 到  location.params
            if (currentRoute && typeof currentRoute.params === 'object') {
              for (const key in currentRoute.params) {
                if (!(key in location.params) && paramNames.indexOf(key) > -1) {
                  location.params[key] = currentRoute.params[key]
                }
              }
            }
            // 如果存在 record 记录
            if (record) {
              location.path = fillParams(record.path, location.params, `named route "${name}"`)
              return _createRoute(record, location, redirectedFrom)
            }
          } else if (location.path) {
            // 处理非命名路由
            location.params = {}
             // 这里会遍历pathList，找到合适的record，因此命名路由的record查找效率更高
            for (let i = 0; i < pathList.length; i++) {
              const path = pathList[i]
              const record = pathMap[path]
              if (matchRoute(record.regex, location.path, location.params)) {
                return _createRoute(record, location, redirectedFrom)
              }
            }
          }
          // 没有匹配到的情况
          return _createRoute(null, location)
        }
      ```

      所以 `match`的主要功能是通过目标路径匹配定义的route 数据，根据匹配到的记录，来进行`_createRoute`操作。而`_createRoute`会根据RouteRecord执行相关的路由操作，最后返回Route对象。

      3. 得到路由对象之后，开始路由的跳转操作。在这里我们需要加入钩子函数，给用户跳转前和跳转后的回调。

         ```javascript
         const {
               updated,
               deactivated,
               activated
             } = resolveQueue(this.current.matched, route.matched)
             
             // 整个切换周期的队列
             const queue: Array<?NavigationGuard> = [].concat(
               // 得到即将被销毁组建的 beforeRouteLeave 钩子函数
               extractLeaveGuards(deactivated),
               // 全局 router before hooks
               this.router.beforeHooks,
               // 得到组件 updated 钩子
               extractUpdateHooks(updated),
               // 将要更新的路由的 beforeEnter 钩子
               activated.map(m => m.beforeEnter),
               // 异步组件
               resolveAsyncComponents(activated)
             )
         
             this.pending = route
             // 每一个队列执行的 iterator 函数
             const iterator = (hook: NavigationGuard, next) => {
                // ...
             }
             
             // 执行队列 leave 和 beforeEnter 相关钩子
             runQueue(queue, iterator, () => {
                // ...
             })
           }
         ```
         
这里依次执行了一下几个方法：
         
- **resolveQueue** - 是交叉比对当前路由的路由记录和现在的这个路由的路由记录来确定出哪些组件需要更新，哪些需要激活，哪些组件被卸载。再执行其中的对应钩子函数
         - **extractLeaveGuards** - 找到即将被销毁的路由组件的`beforeRouteLeave`钩子函数。处理成一个由深到浅的顺序组合的数组。
         - **extractUpdateHooks** - 处理`beforeRouteUpdate`钩子函数
         - **resolveAsyncComponents** - 处理异步组件问题
         - **runQueue** - 执行钩子函数的任务队列queue，在执行的时候通过iterator来构造迭代器，用户传入next方法，确定执行的过程。整个任务队列执行完毕之后，执行完成后的回调函数。
         
```javascript
         runQueue(queue, iterator, () => {
  const postEnterCbs = []
           const isValid = () => this.current === route
           // 获取 beforeRouteEnter 钩子函数
           const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
           // 获取 beforeResolve 钩子函数 并合并生成另一个 queue
           const queue = enterGuards.concat(this.router.resolveHooks)
           runQueue(queue, iterator, () => {
             // 处理完，就不需要再次执行
             if (this.pending !== route) {
               return abort()
             }
             // 清空
             this.pending = null
             // 调用 onComplete 函数
             onComplete(route)
             if (this.router.app) {
               // nextTick 执行 postEnterCbs 所有回调
               this.router.app.$nextTick(() => {
                 postEnterCbs.forEach(cb => { cb() })
               })
             }
           })
         })
         ```
         
         


### 🥕  VueRouter的实现--history模式的实现

在经历了配置一次nginx之后，才突然意识到真正的history路由的作用(之前都只是知道有两种路由模式而已)，其实MDN里也写的很清楚

```javascript
history.pushState(state, title, url); // 添加一条历史记录，不刷新页面
```

在nginx没有配置好之前，每次使用的都是后端路由，每次刷新都会去查找服务器里的对应目录的html文件，但是我们是单页面应用，肯定是没有这些文件的，只有一个根页面`index.html`，这个时候nginx就会返回404。配置了之后每次一查找目录的时候就重定向到index，然后让前端来展示路由，这个路由其实是没有任何作用的，相当于一个只是给用户看的路由，路由的改变和携带信息都是由前端来完成的。当然，有这么方便的api实现起路由来也很简单。大致逻辑和`hash`的也差不多，不过不用处理`#`,监听的函数不一样，而且有现成的API可以用。

```javascript
  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.push(location, onComplete, onAbort)
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.replace(location, onComplete, onAbort)
  }

  go (n: number) {
    this.history.go(n)
  }

  back () {
    this.go(-1)
  }

  forward () {
    this.go(1)
  }
```

在HTML5History的构造方法里有写监听

```javascript
constructor (router: Router, base: ?string) {
    // 实现 base 基类中的构造函数
    super(router, base)
    
    // 滚动信息处理
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
      setupScroll()
    }

    const initLocation = getLocation(this.base)
    window.addEventListener('popstate', e => {
      const current = this.current

      // 避免在有的浏览器中第一次加载路由就会触发 `popstate` 事件
      const location = getLocation(this.base)
      if (this.current === START && location === initLocation) {
        return
      }
      // 执行跳转动作
      this.transitionTo(location, route => {
        if (supportsScroll) {
          handleScroll(router, route, current, true)
        }
      })
    })
  }
```



### 🥜  迷你路由小demo的实现

有了上面的积累，实现路由基本步骤就是以下几步：

1. 构造路由对象
2. 对路由数据做劫持，每当路由改变的时候就重新渲染对应的组件
3. 分别实现两种路由模式下的方法，监听不同的路由改变API
4. 构造钩子队列，在路由执行前后传入用户输入的next回调

```javascript
// base router --> 两种路由通用的方法
export class Base {
  constructor (router) {
    this.router = router
    this.current = {
      path: '/',
      query: {},
      params: {},
      name: '',
      fullPath: '/',
      route: {}
    }
  }

  /**
   * 路由转换
   * @param target 目标路径
   * @param cb 成功后的回调
   */
  transitionTo(target, cb) {
    // 通过对比传入的 routes 获取匹配到的 targetRoute 对象
    const targetRoute = match(target, this.router.routes)
    this.confirmTransition(targetRoute, () => {
      this.current.route = targetRoute
      this.current.name = targetRoute.name
      this.current.path = targetRoute.path
      this.current.query = targetRoute.query || getQuery()
      this.current.fullPath = getFullPath(this.current)
      cb && cb()
    })
  }

  /**
   * 确认跳转
   * @param route
   * @param cb
   */
  confirmTransition (route, cb) {
    // 钩子函数执行队列
    let queue = [].concat(
      this.router.beforeEach,
      this.current.route.beforeLeave,
      route.beforeEnter,
      route.afterEnter
    )

    // 通过 step 调度执行
    let i = -1
    const step = () => {
      i ++
      if (i > queue.length) {
        cb()
      } else if (queue[i]) {
        queue[i](step)
      } else {
        step()
      }

    }
    step(i)
  }
}

function getFullPath ({ path, query = {}, hash = '' }, _stringifyQuery){
  const stringify = _stringifyQuery || stringifyQuery
  return (path || '/') + stringify(query) + hash
}

export function match(path, routeMap) {
  let match = {}
  if (typeof path === 'string' || path.name === undefined) {
    for(let route of routeMap) {
      if (route.path === path || route.path === path.path) {
        match = route
        break;
      }
    }
  } else {
    for(let route of routeMap) {
      if (route.name === path.name) {
        match = route
        if (path.query) {
          match.query = path.query
        }
        break;
      }
    }
  }
  return match
}

export function getQuery() {
  const hash = location.hash
  const queryStr = hash.indexOf('?') !== -1 ? hash.substring(hash.indexOf('?') + 1) : ''
  const queryArray = queryStr ? queryStr.split('&') : []
  let query = {}
  queryArray.forEach((q) => {
    let qArray = q.split('=')
    query[qArray[0]] = qArray[1]
  })
  return query
}

function stringifyQuery (obj) {
  const res = obj ? Object.keys(obj).map(key => {
    const val = obj[key]

    if (val === undefined) {
      return ''
    }

    if (val === null) {
      return key
    }

    if (Array.isArray(val)) {
      const result = []
      val.forEach(val2 => {
        if (val2 === undefined) {
          return
        }
        if (val2 === null) {
          result.push(key)
        } else {
          result.push(key + '=' + val2)
        }
      })
      return result.join('&')
    }

    return key + '=' + val
  }).filter(x => x.length > 0).join('&') : null
  return res ? `?${res}` : ''
}
```

hash的实现

```javascript
import {Base, match} from './base'

export class HashHistory extends Base {
  constructor (router) {
    super(router)
    this.ensureSlash()
      // 这里监听hashchange方法
    window.addEventListener('hashchange', () => {
      this.transitionTo(this.getCurrentLocation())
    })
  }

  push (location) {
    const targetRoute = match(location, this.router.routes)

    this.transitionTo(targetRoute, () => {
      changeUrl(this.current.fullPath.substring(1))
    })
  }

  replaceState (location) {
    const targetRoute = match(location, this.router.routes)

    this.transitionTo(targetRoute, () => {
      changeUrl(this.current.fullPath.substring(1), true)
    })
  }

  ensureSlash () {
    const path = this.getCurrentLocation()
    if (path.charAt(0) === '/') {
      return true
    }
    changeUrl(path)
    return false
  }

  getCurrentLocation() {
    const href = window.location.href
    const index = href.indexOf('#')
    // 处理带#的路径
    return index === -1 ? '' : href.slice(index + 1)
  }
}

function changeUrl(path, replace) {
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  // 判断需不需要跳转
  if (replace) {
    window.history.replaceState({}, '', `${base}#/${path}`)
  } else {
    window.history.pushState({}, '', `${base}#/${path}`)
  }
}

```

history的实现

```javascript
import {Base, match} from './base'

export class HTML5History extends Base {
  constructor (router) {
    super(router)
      // 监听对应的方法
    window.addEventListener('popstate', () => {
      this.transitionTo(getLocation())
    })
  }

  /**
   * 跳转，添加历史记录
   * @param location
   * @example this.push({name: 'home'})
   * @example this.push('/')
   */
  push (location) {
    const targetRoute = match(location, this.router.routes)

    this.transitionTo(targetRoute, () => {
      changeUrl(this.router.base, this.current.fullPath)
    })
  }

  /**
   * 跳转，添加历史记录
   * @param location
   * @example this.replaceState({name: 'home'})
   * @example this.replaceState('/')
   */
  replaceState(location) {
    const targetRoute = match(location, this.router.routes)

    this.transitionTo(targetRoute, () => {
      changeUrl(this.router.base, this.current.fullPath, true)
    })
  }

  go (n) {
    window.history.go(n)
  }

  getCurrentLocation () {
    return getLocation(this.router.base)
  }
}

function getLocation (base = ''){
  let path = window.location.pathname
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}

function changeUrl(base, path, replace) {
  if (replace) {
    window.history.replaceState({}, '', (base + path).replace(/\/\//g, '/'))
  } else {
    window.history.pushState({}, '', (base + path).replace(/\/\//g, '/'))
  }
}
```

router函数的实现

```javascript
import {supportsPushState} from './util/push-state'
import {HashHistory} from './history/hash'
import {HTML5History} from './history/html5'
import {observer} from "./util/observer"
import {Watcher} from "./util/watcher"

class Router {
  constructor(options) {
    this.base = options.base
    this.routes = options.routes
    this.container = options.id
    this.mode = options.mode || 'hash'
    this.fallback = this.mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
      this.mode = 'hash'
    }

    this.history = this.mode === 'history' ? new HTML5History(this) : new HashHistory(this)

    Object.defineProperty(this, 'route', {
      get: () => {
        return this.history.current
      }
    })

    this.init()
  }

  push(location) {
    this.history.push(location)
  }

  replace(location) {
    this.history.replace(location)
  }

  go (n) {
    this.history.go(n)
  }

  render() {
    let i
    if ((i = this.history.current) && (i = i.route) && (i = i.component)) {
      document.getElementById(this.container).innerHTML = i
    }
  }

  init() {
    const history = this.history
    observer.call(this, this.history.current)
    // watch路由，改变时重新渲染对应的页面
    new Watcher(this.history.current, 'route', this.render.bind(this))
    history.transitionTo(history.getCurrentLocation())
  }
}

window.Router = Router
```

