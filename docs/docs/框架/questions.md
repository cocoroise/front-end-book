# 常见问题

1. **写 React / Vue 项目时为什么要在列表组件中写 key，其作用是什么？**

>  [参考](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/1)

- 不用 key：
  **就地复用节点。**在比较新旧两个节点是否是同一个节点的过程中会判断成新旧两个节点是同一个节点，因为 a.key 和 b.key 都是 undefined。所以不会重新创建节点和删除节点，只会在节点的属性层面上进行比较和更新。所以可能在某种程度上（创建和删除节点方面）会有渲染性能上的提升；

  **无法维持组件的状态。**由于就地复用节点的关系，可能在维持组件状态方面会导致不可预知的错误，比如无法维持改组件的动画效果、开关等状态；

  **也有可能会带来性能下降。**因为是直接就地复用节点，如果修改的组件，需要复用的很多节点，顺序又和原来的完全不同的话，那么创建和删除的节点数量就会比带 key 的时候增加很多，性能就会有所下降；

- 用 key：
  **维持组件的状态，保证组件的复用。**因为有 key 唯一标识了组件，不会在每次比较新旧两个节点是否是同一个节点的时候直接判断为同一个节点，而是会继续在接下来的节点中找到 key 相同的节点去比较，能找到相同的 key 的话就复用节点，不能找到的话就增加或者删除节点。

  **查找性能上的提升。**有 key 的时候，会生成 hash，这样在查找的时候就是 hash 查找了，基本上就是 O(1) 的复杂度。

  **节点复用带来的性能提升。**因为有 key 唯一标识了组件，所以会尽可能多的对组件进行复用（尽管组件顺序不同），那么创建和删除节点数量就会变少，这方面的消耗就会下降，带来性能的提升。

- **总结**：性能提升不能只考虑一方面，不是 diff 快了性能就快，不是增删节点少了性能就快，不考虑量级的去评价性能，都只是泛泛而谈。

2. **vue 的diff算法和react的diff算法有何区别？**
   
- vue 和 react 的 diff 算法有相同和有不同，相同是都是用同层比较，不同是 vue使用双指针比较，react 是用 key 集合级比较
  
   - 现代前端框架有两种方式侦测变化,一种是pull一种是push
   
     pull: 其代表为React,我们可以回忆一下React是如何侦测到变化的,我们通常会用`setState`API显式更新,然后React会进行一层层的Virtual Dom Diff操作找出差异,然后Patch到DOM上,React从一开始就不知道到底是哪发生了变化,只是知道「有变化了」,然后再进行比较暴力的Diff操作查找「哪发生变化了」，另外一个代表就是Angular的脏检查操作。
   
     push: Vue的响应式系统则是push的代表,当Vue程序初始化的时候就会对数据data进行依赖的收集,一但数据发生变化,响应式系统就会立刻得知,因此Vue是一开始就知道是「在哪发生变化了」,但是这又会产生一个问题,如果你熟悉Vue的响应式系统就知道,通常一个绑定一个数据就需要一个Watcher,一但我们的绑定细粒度过高就会产生大量的Watcher,这会带来内存以及依赖追踪的开销,而细粒度过低会无法精准侦测变化,因此Vue的设计是选择中等细粒度的方案,在组件级别进行push侦测的方式,也就是那套响应式系统,通常我们会第一时间侦测到发生变化的组件,然后在组件内部进行Virtual Dom Diff获取更加具体的差异,而Virtual Dom Diff则是pull操作,Vue是push+pull结合的方式进行变化侦测的.
   
   - vue 的 diff算法
   
     [解析vue2.0的diff算法](https://github.com/aooy/blog/issues/2)
   
     [http://www.cxymsg.com/guide/virtualDom.html#virtual-dom%E7%9A%84%E4%BC%98%E5%8C%96](http://www.cxymsg.com/guide/virtualDom.html#virtual-dom的优化)
   
     ```javascript
     function patch (oldVnode, vnode) {
     	if (sameVnode(oldVnode, vnode)) {
     		patchVnode(oldVnode, vnode)
     	} else {
     		const oEl = oldVnode.el
     		let parentEle = api.parentNode(oEl)
     		createEle(vnode)
     		if (parentEle !== null) {
     			api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl))
     			api.removeChild(parentEle, oldVnode.el)
     			oldVnode = null
     		}
     	}
     	return vnode
     }
     // 比较的是key和sel
     function sameVnode(oldVnode, vnode){
     	return vnode.key === oldVnode.key && vnode.sel === oldVnode.sel
     }
     
     function patchVnode (oldVnode, vnode) {
         const el = vnode.el = oldVnode.el
         let i, oldCh = oldVnode.children, ch = vnode.children
         if (oldVnode === vnode) return
         // 文本节点 
         if (oldVnode.text !== null && vnode.text !== null && oldVnode.text !== vnode.text) {
             api.setTextContent(el, vnode.text)
         }else {
             updateEle(el, vnode, oldVnode)
         	if (oldCh && ch && oldCh !== ch) {// 两个节点都有子节点，且他们不同
     	    	updateChildren(el, oldCh, ch)
     	    }else if (ch){//只有新的节点有子节点
     	    	createEle(vnode)
     	    }else if (oldCh){//只有旧的节点有子节点
     	    	api.removeChildren(el)
     	    }
         }
     }
     ```
   
     
   
3. **react fiber的原理**

   `Fiber Reconciler` 是为了解决 React v15 的DOM元素多，频繁刷新场景下的主线程阻塞问题，直观显示，则是“掉帧”问题。v15 是一次同步处理整个组件树，通过递归的方式进行渲染，使用 JavaScript 引擎自身的函数调用栈，它会一直执行到栈空位置，一旦工作量大就会阻塞整个主线程。

   然而我们的更新工作可能并不需要一次性同步完成，其中是可以按照优先级调整工作，把整个过程分片处理的，这就是 Fiber 想做的事。

   `Fiber Reconciler` 以**链表**的形式遍历组件树，可以灵活的暂停、继续、放弃当前任务。通过 Scheduler 调度器来进行任务分配，每次只做一个小任务，通过 `requestIdleCallback` 回到主线程看看有没有更高优先级的任务需要处理，如果有就暂停当前任务，去做优先级更高的，否则就继续执行。

4. **为什么react需要fiber而vue不需要？**

   [这可能是最通俗的 React Fiber(时间分片) 打开方式](https://juejin.im/post/6844903975112671239)

   - vue比较轻量，fiber太重，而且vue3的静态模版分析优化也能给vue带来很大的性能优化空间
   - 而react里，更新过程是同步的，可能会导致性能问题。组件树很大的时候，更新就会一直占据着线程的空间。
   - vue的响应式原理走的是异步更新队列，简单说就是所有setter的更新都会被推入watcher队列，等nextTick的时候再执行Render Function。可能vue目前的场景还比较偏移动端，单词大量更新的场景所带来的性能问题还不是它的核心渲染问题场景，引入fiber为时过早。

5. **React 16 中 Diff 算法的变化**

   [react16的diff算法相比于react15有什么改动？ - 知乎](https://www.zhihu.com/question/266800762)

   - **Schedule DOM** - 改为以链表形式实现的虚拟DOM，和VDOM的实现和遍历方式完全不同，类似于在用户态单线程的条件下实现多进程的系统级别调度
   - SDOM的每个一个节点都是一个**Fiber**，是链表上的一个节点
   - 新的fiber架构中，我们有两颗fiber树，一颗旧的，一颗新的。更新完毕之后，新的**Alternate树**会变成我们的老树，以此进行新旧交替。
   - 原来的VDOM是一颗由上至下的树，通过深度优先遍历，层层递归往下更新。但是这样不可中断。16里面这个树是一个由链表连接而成的树，每个fiber节点都记录着很多信息，以便**走到某个节点的时候中断，下次再回来继续更新。**

6. **vue.nextTick的原理**

   [第 139 题：谈一谈 nextTick 的原理](http://muyiy.cn/question/frame/139.html)

   Vue.js中的 nextTick 函数，会传入一个 cb ，这个 cb 会被存储到一个**队列**中，在下一个 tick 时触发队列中的所有 cb 事件。

   因为目前浏览器平台并没有实现 nextTick 方法，所以 Vue.js 源码中分别用 **Promise、setTimeout、setImmediate** 等方式在 microtask（或是task）中创建一个事件，目的是在当前调用栈执行完毕以后（不一定立即）才会去执行这个事件。

   ```javascript
   export function nextTick (cb?: Function, ctx?: Object) {
     let _resolve
     callbacks.push(() => {
       if (cb) {
         try {
           cb.call(ctx)
         } catch (e) {
           handleError(e, ctx, 'nextTick')
         }
       } else if (_resolve) {
         _resolve(ctx)
       }
     })
     if (!pending) {
       pending = true
       timerFunc()
     }
     // $flow-disable-line
     if (!cb && typeof Promise !== 'undefined') {
       return new Promise(resolve => {
         _resolve = resolve
       })
     }
   }
   ```

7. **v-if、v-show、v-html 的原理是什么，它是如何封装的？**

   - **v-if**会调用addIfCondition方法，生成vnode的时候会**忽略对应节点**，render的时候就不会渲染

   -  **v-show**会生成vnode，render的时候也会渲染成真实节点，只是在render过程中会在节点的属性中修改show属性值，也就是常说的**display**

   -  **v-html**会先移除节点下的所有节点，调用html方法，通过addProp添加innerHTML属性，归根结底还是**设置innerHTML为v-html的值**

8. **实现一个简单的mvvn**

   ```javascript
   // js部分
   class Watcher{
   	constructor(cb){
   		this.cb = cb;
   	}
   	update(){
   		this.cb()
   	}
   }
   class Dep{
   	constructor(){
   		this.subs = [];
   	}
   	publish(){
   		this.subs.forEach((item)=>{
   			item.update && item.update();
   		})
   	}
   }
   class MVVM{
   	constructor(data){
   		let that = this;
   		this.dep = new Dep();
   		this.data = new Proxy(data,{
   			get(obj, key, prox){
   				that.dep.target && that.dep.subs.push(that.dep.target);
   				return obj[key]
   			},
   			set(obj, key, value, prox){
   				obj[key] = value;
   				that.dep.publish();
   				return true;
   			}
   		})
   		this.compile();
   	}
   	compile(){
   		let divWatcher = new Watcher(()=>{
   			this.compileUtils().div();
   		})
   		this.dep.target = divWatcher;
   		this.compileUtils().div();
   		this.dep.target = null;
   		
   		let inputWatcher = new Watcher(()=>{
   			this.compileUtils().input();
   		})
   		this.dep.target = inputWatcher;
   		this.compileUtils().input();
   		this.compileUtils().addListener();
   		this.dep.target = null;
   	}
   	compileUtils(){
   		let that = this;
   		return {
   			div(){
   				document.getElementById('foo').innerHTML = that.data.foo;
   			},
   			input(){
   				document.getElementById('bar').value = that.data.bar;
   			},
   			addListener(){
   				document.getElementById('bar').addEventListener('input', function(){
   					that.data.bar = this.value;
   				})
   			}
   		}
   	}
   }
   let mvvm = new MVVM({foo: 'foo233', bar: 'bar233'})
   ```

   