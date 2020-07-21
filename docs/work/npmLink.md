# npm link命令的使用

### 背景
在工作中有遇到复用接口的问题，就是不同的两个仓库复用同一个store，一个pc端用一个移动端用，于是决定在公司的npm库里发布一个公用的包。发布包简单，但是调试的时候就麻烦了，调研过好几种方法，可以~~拷贝文件~~，npm install 绝对路径，使用软链(不同系统语法不同)，还可以使用webpack的语法直接指定调试时候的第三方框架的依赖

```
resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue-router': resolve('node_modules/vue-router'),
            '@': resolve('src')
        }
    }
```

但是，其实npm自带就有一个神奇的指令， `npm link`，这个其实就相当于 unix系统里面的软链命令 ln ，但是使用起来更加的方便和直观。如果是内部的包只需要在包前面加上 `@scoped`就可以了。

```shell
$ cd path/to/my-project
$ npm link path/to/my-utils
```

命令就是这么的简单直接，但是这只是个开始。

### use

运行这个命令之后，发现它链接到的地址是 个人文件夹下的npm所有包的地址，但是我们肯定是想链接到本地开发仓库的地址，这个时候需要运行

```shell
$ # 先去到模块目录，把它 link 到全局
$ cd path/to/my-utils
$ npm link
$
$ # 再去项目目录通过包名来 link
$ cd path/to/my-project
$ npm link my-utils
```

运行了这个步骤之后，再打开我的项目，发现根本运行不了，提示找不到依赖！于是再次打开浏览器搜索，找到了问题的解决方法：

```shell
npm link @scoped/packageName --preserve-symlinks
```

官方解释在这里: [preserve-symlinks](http://nodejs.cn/api/cli/preserve_symlinks.html)

大致意思就是当node使用符号链接加载一个模块的时候，它会根据这个符号链接的地址解析出它的绝对路径，把它当作 "真实路径"，而且会从这个路径加载依赖，正常情况下不会出现问题，但是如果像是下图的情况的时候。就会抛出异常：

```text
{appDir}
 ├── app
 │   ├── index.js
 │   └── node_modules
 │       ├── moduleA -> {appDir}/moduleA
 │       └── moduleB
 │           ├── index.js
 │           └── package.json
 └── moduleA
     ├── index.js
     └── package.json
```

就像一个文件夹appDir下放着一个项目app，一个模块moduleA，项目依赖这个模块，它会从appDir里解析这个模块的路径，如果使用模块的绝对路径，那肯定找不到使用的依赖的位置，使用了那个参数之后，node就会从符号路径也就是appDir解析模块的地址，这样就能正确的找到依赖了。

但是，这个命令也有一些其他的问题。如果符号链接的moduleA在依赖树里有超过两个模块，就会加载失败。

在最后成功的时候，控制台就会输出这样的信息：

```
@scoped/moduleA --> C:/user/administer/node_modules/@scoped/moduleA --> D:/appDir/app/moduleA
```

表示这个符号被链接了两次，最后指向了你本地开发的那个文件夹。

这样就能在本地愉快的联调npm模块啦~

### 参考
[你所不知道的模块调试技巧 - npm link](https://github.com/atian25/blog/issues/17)
