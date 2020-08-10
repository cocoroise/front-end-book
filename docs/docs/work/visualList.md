# 聊天框之虚拟列表实现

### 场景

在直播中，一个房间里可能有很多学生，尤其是发布会的场景，可能会达到几万人的程度。这个时候如果每人发一条聊天，聊天框里也是好几万甚至好几十万的列表渲染量，如果按照正常的方式来渲染，每秒更新并且平滑滚动那浏览器不仅会受不了，还有崩溃的可能。这个时候，想到了虚拟列表的解决方案。

### 解决

1. 区别真实列表和虚拟列表，真实列表里只渲染页面能见的列表，虚拟列表用来撑起容器的高度

2. 在容器滚动的时候计算滚动的高度，计算真实列表里应该存放的数据

3. 使用transform计算真实列表的偏移量

   ```javascript
   export default {
       name: 'ListView',
       
       props: {
       data: {
           type: Array,
         required: true
       },
   
       itemHeight: {
         type: Number,
         default: 30
       }
     },
     
     computed: {
       contentHeight() {
           return this.data.length * this.itemHeight + 'px';
       }
     },
   
     mounted() {
       this.updateVisibleData();
     },
   
     data() {
       return {
         visibleData: []
       };
     },
   
     methods: {
       updateVisibleData(scrollTop) {
           scrollTop = scrollTop || 0;
           const visibleCount = Math.ceil(this.$el.clientHeight / this.itemHeight);
         	const start = Math.floor(scrollTop / this.itemHeight);
         	const end = start + visibleCount;
          // 真实列表 
         	this.visibleData = this.data.slice(start, end);
         	this.$refs.content.style.webkitTransform = `translate3d(0, ${ start * 			this.itemHeight }px, 0)`;
       },
   
       handleScroll() {
         const scrollTop = this.$el.scrollTop;
         this.updateVisibleData(scrollTop);
       }
     }
   }
   ```

这个列表的实现方法缺陷在于，只能渲染固定高度的列表。如果列表里每个元素的高度不相同的话，就无法使用这种方法。

### 除了虚拟列表的解决方案

1. js运行异步处理: 分割任务，实现时间切片处理, 类似react fiber, 每次执行记录时间, 超过一定执行时间则settimeout或requestAnimation推迟到下一个时间片,一般一个时间片为16ms
2. 大量纯展示的数据,不需要追踪变化的 用object.freeze冻结，阻止vue添加响应劫持

### demo

codepen一个虚拟列表的demo

[codepen](https://codepen.io/ChristianPrint/pen/EzNWwa)

### 参考

[再谈前端虚拟列表的实现](https://zhuanlan.zhihu.com/p/34585166)

[「前端进阶」高性能渲染十万条数据(虚拟列表)](https://cloud.tencent.com/developer/article/1533206)