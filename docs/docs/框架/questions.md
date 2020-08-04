# 常见问题

1. 写 React / Vue 项目时为什么要在列表组件中写 key，其作用是什么？

>  [参考](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/1)

答： 见[vue/patch.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L424)，在不带key的情况下，判断[sameVnode](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L35)时因为a.key和b.key都是undefined，**对于列表渲染**来说已经可以判断为相同节点然后调用patchVnode了，实际根本不会进入到答主给的else代码，也就无从谈起“带key比不带key时diff算法更高效”了。

然后，官网推荐推荐的使用key，应该理解为“使用唯一id作为key”。因为index作为key，和不带key的效果是一样的。index作为key时，每个列表项的index在变更前后也是一样的，都是直接判断为sameVnode然后复用。

说到底，key的作用就是更新组件时**判断两个节点是否相同**。相同就复用，不相同就删除旧的创建新的。

正是因为带唯一key时每次更新都不能找到可复用的节点，不但要销毁和创建vnode，在DOM里添加移除节点对性能的影响更大。所以会才说“不带key可能性能更好”。

2. vue 的diff算法和react的diff算法有何区别？
   - vue 和 react 的 diff 算法有相同和有不同，相同是都是用同层比较，不同是 vue使用双指针比较，react 是用 key 集合级比较

3. 为什么react需要fiber而vue不需要？

