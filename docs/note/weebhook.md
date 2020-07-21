# 两个脚本使用webhook部署博客

### 🍪前言

买了域名之后一直很想把github上的博客移植过来，知道github有这样一个钩子可以监听到push事件，之前刚好又看了Node的书，感觉可以在阿里云上监听一下这个事件，写完之后本地push直接用脚本构建推到github,在服务器拉取仓库地址就行，虽然也简单，不过昨天也搞到晚上一点:sleeping: 。

步骤如下：

1. 有一个本地的博客，比如hexo，我现在使用的是hugo
2. github上有一个仓库保存静态资源
3. github上添加webhook，填入服务器地址，设置好secret
4. 服务器上需要添加SSH keys，安装node环境（源码安装，不然centos上设置本地变量的时候找不到node命令），全局安装pm2，用来后台守护脚本的运行
5. 运行脚本，使用github-webhook-handler监听github的事件，使用shell脚本拉取git仓库，无缝重启pm2

前面几步就不说了，安装node的时候的确遇到很多坑。先是使用yum安装，安装的很快可是后来需要配置环境变量的时候找不到node/bin在哪，后来卸载了使用安装包安装才成功.

````bash
wget https://npm.taobao.org/mirrors/node/v8.0.0/node-v8.0.0-linux-x64.tar.xz
tar -xvf  node-v8.0.0-linux-x64.tar.xz
mv node-v8.1.4-linux-x64 node
vim /etc/profile
# set for nodejs  
export NODE_HOME=/usr/local/tool/nodejs/node  
export PATH=$NODE_HOME/bin:$PATH
source /etc/profile
# 检查是否安装成功
node -v
npm -v
# 全局使用npm和node
ln -s /usr/local/tool/nodejs/node/bin/node /usr/local/bin/node 
ln -s /usr/local/tool/nodejs/node/bin/npm  /usr/local/bin/npm
# 全局安装pm2
ln -s /usr/local/node_global/bin/pm2 /usr/local/bin
# 如果不成功可以使用
rm softlink
````

### 👀 Js脚本

````javascript
const http = require("http")
const spawn = require("child_process").spawn
const createHandler = require("github-webhook-handler")
const port = 7777 // 自定义端口号，注意不要和别的端口冲突了
const handler = createHandler({
	path: "/",
	secret: "secret_key" // 这里填你在github webhook上配置的secret key
})

http.createServer((req, res) => {
	handler(req, res, function(err) {
		res.statusCode = 404
		res.end("yes sir!")
	})
}).listen(port)

handler.on("push", e => {
	try {
		const s = spawn("sh", ["./auto_build.sh"]) // 运行sh脚本
		s.stdout.on("data", data => {
            // 输出一些github返回的仓库信息
			console.log(`${e.payload.repository.name}: ${data}`)
		})
		s.stderr.on("data", data => {
			console.log(`${e.payload.repository.name}: ${data}`)
		})
		s.on("error", err => {
			console.log("进程启动失败", err)
		})
		s.on("close", data => {
			console.log("进程正在退出", data)
		})
		console.log(e.payload.repository.name, "has rebuild")
	} catch (err) {
		console.log("push event error-->", err)
	}
})

````

提示：运行node ./script.js之前需要npm install  -g github-webhook-handler。

### 🛒shell脚本

````shell
#!/bin/bash

git reset --hard origin/master
git clean -f
git pull origin master
pm2 reload ./script.js
````

### 🍴运行pm2

直接`pm2 start ./script.js`后台运行js脚本。

`pm2 list`或者`pm2 monit`查看运行的进程。如果status报错的话，就手动启动那个脚本试试。

![](http://image.cocoroise.cn/webhook-1.png)

这样的话已经算是成功了。详情的信息可以使用`pm2 monit`命令看看，我们在webhook页发个请求试试。

![](http://image.cocoroise.cn/webhook-2.png)

在服务器可以看到请求。

![](http://image.cocoroise.cn/webhook-3.png)

😍这样就完成了~~~~
