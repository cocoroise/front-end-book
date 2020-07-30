# vue slot传递问题

工作里使用到了之前一直没有好好研究的slots和scopedslots，今天深入研究了一下这两个东西，算作一个记录吧。

### 场景

需要封装ant-design-vue的组件，需要传递用户的插槽给原来的组件。已知使用的是jsx写法，求怎么实现？

以collapse为例。

```javascript
// 用户的插槽
<template #expandIcon="props">
   <a-icon type="book" :rotate="props.isActive ? 90 : 0" />
</template>
```

### 介绍

- **$slot**

  类型：`{ [name: string]: ?Array<VNode> }`

  介绍：里面保存着的是所有VNode的数组。每个[具名插槽](https://cn.vuejs.org/v2/guide/components-slots.html#具名插槽)有其相应的 property。

  (例如：`v-slot:foo` 中的内容将会在 `vm.$slots.foo` 中被找到)。

  可以通过`this.$slots`访问**静态插槽**的内容。

  `default` property 包括了所有没有被包含在具名插槽中的节点，或 `v-slot:default` 的内容。

  ```javascript
  render: function (createElement) {
    // `<div><slot></slot></div>`
    return createElement('div', this.$slots.default)
  }
  ```

  

- **$scopedSlot**

  类型：`{ [name: string]: props => Array<VNode> | undefined }`

  介绍：里面保存着的是渲染函数的对象，执行这个函数能得到一个VNode。

  用来访问[作用域插槽](https://cn.vuejs.org/v2/guide/components-slots.html#作用域插槽)。对于包括 `默认 slot` 在内的每一个插槽，该对象都包含一个返回相应 VNode 的函数。

  ```javascript
  props: ['message'],
  render: function (createElement) {
    // `<div><slot :text="message"></slot></div>`
    return createElement('div', [
      this.$scopedSlots.default({
        text: this.message
      })
    ])
  }
  ```

### 解答

```javascript
import { getOptionProps, getListeners } from '../_util/props-util';
import { Collapse } from 'ant-design-vue';

export default {
  name: 'MyCollapse',

  methods: {
    renderExpandIcon(_, { isActive }) {
      // 通过this.$scopedSlots可获取用户传入的插槽
      const { expandIcon } = this.$scopedSlots;
      let icon;
      if (expandIcon instanceof Function) {
        // expandIcon其实就是createElement函数，把isActive传给用户的插槽
        icon = expandIcon({ isActive });
      } else {
        icon = expandIcon || <a-icon type="caret-right" rotate={isActive ? 90 : undefined} />;
      }
      return icon;
    },
  },
  render() {
    const rcCollapeProps = {
      props: {
        ...getOptionProps(this),
        expandIcon: this.renderExpandIcon,
      },
      on: getListeners(this),
    };
    // this.$slots.default里面包含了静态插槽，直接渲染
    return <Collapse {...rcCollapeProps}>{this.$slots.default}</Collapse>;
  },
};

```

### 高级用法

在渲染动态组件的时候，我们想把外层的slot传给这个动态生成的组件。

遇到了这个问题。

使用jsx的语法可以很容易的把slot当作一个对象传给子组件，但是使用单文件的模式就比较复杂。

这里记录一下单文件下从父组件的slot传到子组件的姿势。

$slot传静态插槽。

$scopedSlots传作用域插槽，还需要把父组件的参数给传下去。

```javascript
Vue.component('W', {
  props: ['child'],
  template: `
  <component :is="child">
      <slot v-for="(_, name) in $slots" :name="name" :slot="name" />
      <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
  </component>`
})
```

这里可以更深入的理解这两个api的差别，slot只是静态的，有个name直接渲染就好。

而scopedSlot在需要插槽里的参数的时候用再合适不过了。

### 参考

[插槽 - vueJS](https://cn.vuejs.org/v2/guide/render-function.html#%E6%8F%92%E6%A7%BD)

[[翻译] VUE：如何把slot从父组件传到子组件](https://www.jianshu.com/p/4bf15380b7f9)