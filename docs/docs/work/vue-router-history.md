# VueRouter history模式下的nginx配置

###  vue-router介绍
vue-router 或者 react-router 路由模式有两种，一种是使用hash来控制视图的跳转。另一种是使用 history 模式，使用 history.pushState API 来控制视图的跳转。使用 hash 的缺点是路由的样子会是 #/a/b 这种样子，而且在微信分享时会出现问题。所以推荐使用history模式的路由。

### 背景

我们都知道`vue router`的路由模式有两种，默认是`hash`模式，如果指定了`mode:history`就会使用`history`模式，但是前几天在一个项目里把路由模式改成`history`模式的时候，却遇到了nginx配置不正确的问题。

在`history`模式下，由于使用的路由是 `xxx.com/a/b`的路径，服务器会去找根目录下的a目录下的b目录，但是这个目录一般都不存在，在前端打包完之后都只剩了几个js和一个index.html文件，所以在nginx这里配置的时候，需要拦截一下所有请求的url，然后重定向到根目录下的index.html文件下，由前端路由进行页面的渲染。

nginx的修改配置里重点是这句话

````nginx
    try_files $uri $uri/ index.html;
````

try_files 是指当用户请求url资源时 [www.xxx.com/xxx](https://link.jianshu.com/?t=http://www.xxx.com/xxx)，try_files 会到硬盘资源根目录里找 xxx。如果存在名为 xxx 的文件就返回，如果找不到在找名为 xxx 的目录，再找不到就会执行index.html。（$uri指找文件， $uri/指找目录）。

后来配置了

`````nginx
server_name aa.com;
  root /data/var/aa/prod;
  try_files $uri $uri/ index.html;

  location / {
    if (!-e $request_filename){
      rewrite ^/(.*) /index.html last;
    }
  }
`````

但是在`hash`模式下，比如像是一个`www.aa.com/#/a/b`的路径，服务器不会去找对应路径下的目录，在#后面的东西完全不会被发送到服务端，改变`hash`的话也不会重新加载页面。

hash 模式和 history 模式都属于浏览器自身的特性，Vue-Router 只是利用了这两个特性，在改变视图的同时不会向后端发出请求，通过调用浏览器提供的接口来实现前端路由。
