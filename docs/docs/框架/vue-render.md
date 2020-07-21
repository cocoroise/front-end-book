# vue响应式原理--渲染篇

### 🐼前言

在前两篇，数据和依赖收集里，我们大概知道了vue是怎么处理数据的，在watcher里面，能看到在update方法里，传入的getter就是`updateComponent`,而在这个方法里，我们就会调用到平时不怎么常用到的`vm._render`方法，这篇就从这个奇妙的`render`方法入手，看看vue是怎么处理我们写的template，然后渲染成dom的吧。

### 🐰大致流程

<img src="http://image.cocoroise.cn/截屏2020-07-10 上午12.10.38.png" style="zoom:50%;" />

#### 创建vnode

<img src="http://image.cocoroise.cn/截屏2020-07-03 上午12.18.56.png" style="zoom:50%;" />

在vue初始化的时候，会把`createElement()`挂在vue的实例上，在组件渲染的时候，会在watcher收集依赖的时候触发update函数，从而触发vue的render函数。这个函数会生成vnode，之后再渲染到浏览器里面。

#### 渲染vnode

<img src="http://image.cocoroise.cn/截屏2020-07-03 上午12.38.38.png" style="zoom:50%;" />

写的有点乱，这个图片只是最简单的流程，vm._patch函数实际上是通过`createPatchFunction`来生成的，实际上vue的渲染还区分了几种不同的环境，包括weex和服务端渲染等等，然后真正渲染的时候，调用`createElm`, 这个方法的作用是通过虚拟节点创建真实的 DOM 并插入到它的父节点中。

### 🐨_render创建vnode

1. 初始化render

   ```javascript
   export function initRender (vm: Component) {
     vm._vnode = null // the root of the child tree
     vm._staticTrees = null
     const parentVnode = vm.$vnode = vm.$options._parentVnode // 父树中的占位符节点
     const renderContext = parentVnode && parentVnode.context
     
     /*将createElement函数绑定到该实例上，该vm存在闭包中，不可修改，vm实例则固定。这样我们就可以得到正确的上下文渲染*/
     vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
     /*常规方法被用于公共版本，被用来作为用户界面的渲染方法*/
     vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
   }
   ```

   这里可以看到初始化方法里把`createElement`方法和其他一些属性挂在了vm实例上。

2. createElement

   这个方法的定义在`vdom/create-element`里。它返回一个vnode。

   ```javascript
   /*创建VNode节点*/
   export function _createElement (
     context: Component,
     tag?: string | Class<Component> | Function | Object,
     data?: VNodeData,
     children?: any,
     normalizationType?: number
   ): VNode {
     let vnode, ns
     if (typeof tag === 'string') {
       let Ctor
       /*获取tag的名字空间*/
       ns = config.getTagNamespace(tag)
       /*判断是否是保留的标签*/
       if (config.isReservedTag(tag)) {
         // platform built-in elements
         /*如果是保留的标签则创建一个相应节点*/
         vnode = new VNode(
           config.parsePlatformTagName(tag), data, children,
           undefined, undefined, context
         )
       } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
         // component
         /*从vm实例的option的components中寻找该tag，存在则就是一个组件，创建相应节点，Ctor为组件的构造类*/
         vnode = createComponent(Ctor, data, context, children, tag)
       } else {
         // unknown or unlisted namespaced elements
         // check at runtime because it may get assigned a namespace when its
         // parent normalizes children
         /*未知的元素，在运行时检查，因为父组件可能在序列化子组件的时候分配一个名字空间*/
         vnode = new VNode(
           tag, data, children,
           undefined, undefined, context
         )
       }
     } else {
       // direct component options / constructor
       /*tag不是字符串的时候则是组件的构造类*/
       vnode = createComponent(tag, data, context, children)
     }
     if (isDef(vnode)) {
       /*如果有名字空间，则递归所有子节点应用该名字空间*/
       if (ns) applyNS(vnode, ns)
       return vnode
     } else {
       /*如果vnode没有成功创建则创建空节点*/
       return createEmptyVNode()
     }
   }
   ```

   这个函数的流程大概如下

   <img src="http://image.cocoroise.cn/截屏2020-07-10 上午12.40.57.png" style="zoom:50%;" />

   createElement实际上只是判断一下不同的情况，然后调用生成组件`createComponent`的方法或者可以直接生成一个vnode，调用`VNode`方法，如果都不满足情况就直接生成一个空的vnode完事。

3. createComponent

   component和vnode的差别就是，component有自己的事件和生命周期，数据需要处理，createComponent这个函数就是统一处理这些事件，然后把处理好的结果传给vnode，最后生成的是一个以`vue-component`开头的vnode。

   ```javascript
   /*创建一个组件节点，返回Vnode节点*/
   export function createComponent (
     Ctor: Class<Component> | Function | Object | void,
     data?: VNodeData,
     context: Component,
     children: ?Array<VNode>,
     tag?: string
   ): VNode | void {
     /*_base存放了Vue,作为基类，可以在里面添加扩展*/
     const baseCtor = context.$options._base
   
     /*处理异步组件*/
     if (isUndef(Ctor.cid)) {
       Ctor = resolveAsyncComponent(Ctor, baseCtor, context)
     }
   
     // resolve constructor options in case global mixins are applied after
     // component constructor creation
     resolveConstructorOptions(Ctor)
   
     data = data || {}
   
     // transform component v-model data into props & events
     if (isDef(data.model)) {
       transformModel(Ctor.options, data)
     }
   
     // extract props
     const propsData = extractPropsFromVNodeData(data, Ctor, tag)
   
     // functional component
     if (isTrue(Ctor.options.functional)) {
       return createFunctionalComponent(Ctor, propsData, data, context, children)
     }
   
     // extract listeners, since these needs to be treated as
     // child component listeners instead of DOM listeners
     const listeners = data.on
     // replace with listeners with .native modifier
     data.on = data.nativeOn
   
     if (isTrue(Ctor.options.abstract)) {
       // abstract components do not keep anything
       // other than props & listeners
       data = {}
     }
   
     // merge component management hooks onto the placeholder node
     mergeHooks(data)
   
     // return a placeholder vnode
     const name = Ctor.options.name || tag
     const vnode = new VNode(
       `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
       data, undefined, undefined, undefined, context,
       { Ctor, propsData, listeners, tag, children }
     )
     return vnode
   }
   ```

   这个方法涉及到比较多的分支，但是我们这里只关心它的核心流程--组件的渲染。总结的大致流程图如下：
   
   <img src="http://image.cocoroise.cn/20200712191012.png" style="zoom:50%;" />
   
   第一步：初始化子类的构造函数，通过$options._base可以拿到当前vue的实例，然后使用extend方法构造子组件的构造函数。
   
   ```javascript
   /*
      extend方法：
      使用基础 Vue 构造器，创建一个“子类”。
      其实就是扩展了基础构造器，形成了一个可复用的有指定选项功能的子构造器。
      参数是一个包含组件option的对象。
   */
     Vue.extend = function (extendOptions: Object): Function {
       extendOptions = extendOptions || {}
       const Super = this
       const SuperId = Super.cid
       const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
       /*如果构造函数中已经存在了该cid，则代表已经extend过了，直接返回*/
       if (cachedCtors[SuperId]) {
         return cachedCtors[SuperId]
       }
   
       const name = extendOptions.name || Super.options.name
       /*
         Sub构造函数其实就一个_init方法，这跟Vue的构造方法是一致的，在_init中处理各种数据初始化、生命周期等。
         因为Sub作为一个Vue的扩展构造器，所以基础的功能还是需要保持一致，跟Vue构造器一样在构造函数中初始化_init。
       */
       const Sub = function VueComponent (options) {
         this._init(options)
       }
       
       Sub.prototype = Object.create(Super.prototype)
       Sub.prototype.constructor = Sub
       /*创建一个新的cid*/
       Sub.cid = cid++
       /*将父组件的option与子组件的合并到一起(Vue有一个cid为0的基类，即Vue本身，会将一些默认初始化的option何入)*/
       Sub.options = mergeOptions(
         Super.options,
         extendOptions
       )
       /*es6语法，super为父类构造*/
       Sub['super'] = Super
   
       /*在扩展时，我们将计算属性以及props通过代理绑定在Vue实例上（也就是vm），这也避免了Object.defineProperty被每一个实例调用*/
       if (Sub.options.props) {
         /*初始化props，将option中的_props代理到vm上*/
         initProps(Sub)
       }
       if (Sub.options.computed) {
         /*处理计算属性，给计算属性设置defineProperty并绑定在vm上*/
         initComputed(Sub)
       }
   
       /*加入extend、mixin以及use方法，允许将来继续为该组件提供扩展、混合或者插件*/
       Sub.extend = Super.extend
       Sub.mixin = Super.mixin
       Sub.use = Super.use
   
       /*使得Sub也会拥有父类的私有选项（directives、filters、components）*/
       ASSET_TYPES.forEach(function (type) {
         Sub[type] = Super[type]
       })
       
       /*把组件自身也加入components中，为递归自身提供可能（递归组件也会查找components是否存在当前组件，也就是自身）*/
       if (name) {
         Sub.options.components[name] = Sub
       }
   
       /*保存一个父类的options，此后我们可以用来检测父类的options是否已经被更新*/
       Sub.superOptions = Super.options，
       
       Sub.extendOptions = extendOptions
       /*保存一份option，extend的作用是将Sub.options中的所有属性放入{}中*/
       Sub.sealedOptions = extend({}, Sub.options)
   
       /*缓存构造函数（用cid），防止重复extend*/
       cachedCtors[SuperId] = Sub
       return Sub
     }
   ```
   
   第二步：安装组件钩子函数
   
   整个安装的过程就是把`componentVNodeHooks`的钩子函数合并到`data.hook`里面，在vnode执行patch的时候执行相关的钩子函数。
   
   如果组件里已经存在某个钩子，那就调用`mergeHook`方法，把两个钩子函数依次执行。
   
   ```javascript
   function mergeHooks (data: VNodeData) {
     if (!data.hook) {
       data.hook = {}
     }
     for (let i = 0; i < hooksToMerge.length; i++) {
       const key = hooksToMerge[i]
       const fromParent = data.hook[key]
       const ours = componentVNodeHooks[key]
       data.hook[key] = fromParent ? mergeHook(ours, fromParent) : ours
     }
   }
   
   function mergeHook (one: Function, two: Function): Function {
     return function (a, b, c, d) {
       one(a, b, c, d)
       two(a, b, c, d)
     }
   }
   ```
   
   组件里存在的钩子如下：
   
   ```javascript
   /*被用来在VNode组件patch期间触发的钩子函数集合*/
   const componentVNodeHooks = {
     init (
       vnode: VNodeWithData,
       hydrating: boolean,
       parentElm: ?Node,
       refElm: ?Node
     ): ?boolean {
       if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
         const child = vnode.componentInstance = createComponentInstanceForVnode(
           vnode,
           activeInstance,
           parentElm,
           refElm
         )
         child.$mount(hydrating ? vnode.elm : undefined, hydrating)
       } else if (vnode.data.keepAlive) {
         // kept-alive components, treat as a patch
         const mountedNode: any = vnode // work around flow
         componentVNodeHooks.prepatch(mountedNode, mountedNode)
       }
     },
     
     // prepatch 
     prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
       const options = vnode.componentOptions
       const child = vnode.componentInstance = oldVnode.componentInstance
       updateChildComponent(
         child,
         options.propsData, // updated props
         options.listeners, // updated listeners
         vnode, // new parent vnode
         options.children // new children
       )
     },
     
     // insert  
     insert (vnode: MountedComponentVNode) {
       const { context, componentInstance } = vnode
       if (!componentInstance._isMounted) {
         componentInstance._isMounted = true
         callHook(componentInstance, 'mounted')
       }
       if (vnode.data.keepAlive) {
         if (context._isMounted) {
           // vue-router#1212
           // During updates, a kept-alive component's child components may
           // change, so directly walking the tree here may call activated hooks
           // on incorrect children. Instead we push them into a queue which will
           // be processed after the whole patch process ended.
           queueActivatedComponent(componentInstance)
         } else {
           activateChildComponent(componentInstance, true /* direct */)
         }
       }
     },
   
     // destroy  
     destroy (vnode: MountedComponentVNode) {
       const { componentInstance } = vnode
       if (!componentInstance._isDestroyed) {
         if (!vnode.data.keepAlive) {
           componentInstance.$destroy()
         } else {
           deactivateChildComponent(componentInstance, true /* direct */)
         }
       }
     }
   }
   ```
   
   
   
   第三步：实例化vnode
   
   ```javascript
     const name = Ctor.options.name || tag
     const vnode = new VNode(
       `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
       data, undefined, undefined, undefined, context,
       { Ctor, propsData, listeners, tag, children }
     )
     return vnode
   ```
   
   
   
   >  这里推荐细看： [https://ustbhuangyi.github.io/vue-analysis/v2/components/create-component.html#%E6%9E%84%E9%80%A0%E5%AD%90%E7%B1%BB%E6%9E%84%E9%80%A0%E5%87%BD%E6%95%B0](https://ustbhuangyi.github.io/vue-analysis/v2/components/create-component.html#构造子类构造函数)

### 🐵_update渲染vnode

当我们创建完组件的vnode之后，接下来就会执行_update方法。

_update的作用就是根据不同的平台调用patch方法，比如说web和weex。

patch方法是通过一个叫`createPatchFunction`的函数生成的，它之所以要多一个生成的步骤，就是为了能区分不同的环境。patch的主要逻辑是相同的，但是不同环境上有些dom的操作不一样，所以它把差异化的参数提前固化，这样就不用每次调用的时候传重复的参数了。

```javascript
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

export function createPatchFunction (backend) {
  let i, j
  const cbs = {}

  const { modules, nodeOps } = backend

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  // 省略了一些关于dom操作的代码...
  // 返回的patch函数
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
      const isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR)
            hydrating = true
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true)
              return oldVnode
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode)
        }

        // replacing existing element
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent
          const patchable = isPatchable(vnode)
          while (ancestor) {
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor)
            }
            ancestor.elm = vnode.elm
            if (patchable) {
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor)
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]()
                }
              }
            } else {
              registerRef(ancestor)
            }
            ancestor = ancestor.parent
          }
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes(parentElm, [oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}
```

这个返回的patch方法大致流程是这样的：

<img src="http://image.cocoroise.cn/20200712232704.png" style="zoom:50%;" />

其实就是判断是否满足patch的条件，如果dom的结构没有修改的话，我们就调用patchVNode这个方法去patch最小改动的地方。如果不满足条件，就调用createElm方法去创建新的元素。

这个createElm方法非常重要，看看它的代码和流程：

```javascript
function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    /*insertedVnodeQueue为空数组[]的时候isRootInsert标志为true*/
    vnode.isRootInsert = !nested // for transition enter check
    /*创建一个组件节点*/
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
      setScope(vnode)

      /* weex环境 */
      if (__WEEX__) {
        // in Weex, the default insertion order is parent-first.
        // List items can be optimized to use children-first insertion
        // with append="tree".
        const appendAsTree = isDef(data) && isTrue(data.appendAsTree)
        if (!appendAsTree) {
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue)
          }
          insert(parentElm, vnode.elm, refElm)
        }
        createChildren(vnode, children, insertedVnodeQueue)
        if (appendAsTree) {
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue)
          }
          insert(parentElm, vnode.elm, refElm)
        }
      } else {
        createChildren(vnode, children, insertedVnodeQueue)
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        insert(parentElm, vnode.elm, refElm)
      }

      if (process.env.NODE_ENV !== 'production' && data && data.pre) {
        inPre--
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }
```

createElm其实就是通过虚拟节点创建真实的dom插入到正确的父节点位置中。可以看到它通过createChildren创建了子元素,或者根据不同的tag类型创建了不同的元素。

```javascript
function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true)
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text))
    }
  }
```

最后调用 `insert` 方法把 `DOM` 插入到父节点中，因为是递归调用，子元素会优先调用 `insert`，所以整个 `vnode` 树节点的插入顺序是先子后父。

```javascript
insert(parentElm, vnode.elm, refElm)
 
function insert (parent, elm, ref) {
  if (isDef(parent)) {
    if (isDef(ref)) {
      if (ref.parentNode === parent) {
        nodeOps.insertBefore(parent, elm, ref)
      }
    } else {
      nodeOps.appendChild(parent, elm)
    }
  }
}

// nodeOps辅助方法 调用原生api的地方
export function insertBefore (parentNode: Node, newNode: Node, referenceNode: Node) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function appendChild (node: Node, child: Node) {
  node.appendChild(child)
}
```

到这里，创建元素的过程就结束了，总结一哈：

在调用_update方法的时候，会调用`createPatchFunction`方法来为不同的平台生成真正的patch方法，patch方法通过判断不同的情况来生成对应的DOM元素或者进行diff DOM的操作。生成dom的操作其实就是从vnode里取需要的数据，然后通过原生的方法生成真实的dom元素，比如`document.createElementNS`,或者`document.createTextNod`等等。

> 强烈推荐这篇：[https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/update.html#%E6%80%BB%E7%BB%93](https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/update.html#总结)

### 🐤总结

这篇主要浏览了一下关于update和patch的核心代码，当然还有很多分支没有涉及到。我们知道了在写完一个template之后，vue大致的渲染流程是怎么样的。先是通过转换成ast树，然后提取想要的信息，生成render函数。这个render函数能为我们生成vnode树，然后我们通过createElm来调用原生的api，依次生成真实的dom元素，insert进对应的位置，这样，一个页面的渲染就完成了。虽然每一步看起来很简单，其实里面还涉及到大量的优化，条件判断，关于ast树和patch的规则这里也没有展开，还需要学习的地方还有很多哇。。。

### 🦄参考

> [vue技术揭秘-update](https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/update.html#总结)
>
> [聊聊Vue的template编译]([https://github.com/answershuto/learnVue/blob/master/docs/%E8%81%8A%E8%81%8AVue%E7%9A%84template%E7%BC%96%E8%AF%91.MarkDown](https://github.com/answershuto/learnVue/blob/master/docs/聊聊Vue的template编译.MarkDown))

