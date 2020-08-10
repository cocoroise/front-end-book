# 常见问题

1. **iframe 中脚本的执行是否会阻塞主页面的渲染线程和 JS 线程**

   js是单线程的，就算是iframe里动态脚本的执行也会阻塞主页面的线程。

   - frame会阻塞主页面的onload事件
   - 主页面和iframe共享同一个连接池

   四种加载iframe的方法：

   - **普通方法**：阻塞主页面的onload
   - **在onload之后加载iframe**：onload触发以后再动态插入一个iframe标签，不会阻塞加载，但是iframe加载的时候页面也会转圈
   - **setTimeout加载**：通过setTimeout设置iframe的src值，可以避免阻塞，iframe会在主页面onload之前进行加载，这是比上一个方法好的地方
   - **友好型iframe加载**（一般用来加载广告）：
     - 先创建一个iframe，然后设置它的src为同一个域名下的静态文件
     - 在这个iframe里面，设置js变量inDapIF=true来告诉广告它已经加载在这个iframe里面了
     - 在这个iframe里面，创建一个script元素加上广告的url作为src，然后像普通广告代码一样加载
     - 当广告加载完成，重置iframe大小来适应广告

