# lerna使用

> lerna是一个管理多package的npm工具。

### 🎈现状
仓库在一段时间之后变得越来越大，如果想分别管理仓库的依赖和版本会很麻烦，如果发版和测试会对所有的模块进行更新和测试，工作量较大。这个时候就可以使用`lerna`进行管理，把所有相关的模块都放在一个仓库，但是使用`lerna`进行分别管理，独立发布。 

### 🎨示例
每个模块用一个单独的仓库管理，如`webpack`，`webpack`下的`webpack-cli`和`webpack-dev-server`。  
![](http://image.cocoroise.cn/image/lerna-1.png)

每个模块用一个仓库管理，使用标准的文件夹格式进行区分，分别指定依赖。如`babel`仓库和年久失修的`mint-ui`。`babel`在安装的时候需要分别安装`babel`和`bable-core`等等,有时候几个版本不兼容还会报错。
````
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save @babel/polyfill
````
![](http://image.cocoroise.cn/image/lerna-2.png)


### 🎁lerna的安装
````
npx lerna init
````
或者
````
npm i -g lerna
lerna init
````
安装了之后会自动在根目录添加`lerna.json`文件，和`packages`文件夹。  
Lerna 提供两种不同的方式来管理你的项目：`Fixed` 或 `Independent`，默认采用 `Fixed` 模式，如果你想采用 `Independent` 模式，只需在执行 `init` 命令的时候加上 --`independent` 或 `-i` 参数即可。   

#### 固定模式
固定模式下lerna在单一版本线上运行。版本号保存在`lerna.json`文件下的`version`字段里面。如果一个模块在上次发布之后有更新，它会自动更新到这里你要发布的版本。   

#### 独立模式
独立模式下每个模块都有它独立的版本。每次发布时都能收到每个包更新的提示。在这个模式下`lerna.json`的`version`值将会被忽略。   

### 🎯lerna的使用
创建一个lerna管理的模块。
````
$ lerna create <name> [location]
````
引入一个lerna管理的模块。
````
$ lerna import <git_dir>
````
查看lerna下所有管理的包。
````
lerna list
````
添加部分依赖包
````
$ lerna add <package>[@version] [--dev] [--exact]
````
当我们执行此命令后，将会执行下面那2个动作：

1. 在每一个符合要求的模块里安装指明的依赖包，类似于在指定模块文件夹中执行 `npm install <package>`。
2. 更新每个安装了该依赖包的模块中的 `package.json` 中的依赖包信息

安装所有依赖包
````
lerna bootstrap
````
当执行完上面的命令后，会发生以下的行为：

1. 在各个模块中执行 `npm install` 安装所有依赖
2. 将所有相互依赖的 `Lerna` 模块 链接在一起
3. 在安装好依赖的所有模块中执行 `npm run prepublish`
4. 在安装好依赖的所有模块中执行 `npm run prepare`   

### 🛠lerna的配置

公共模块使用一个`package.json`和`lerna.json`，其他的模块放在`packages`文件夹下，单独维护`package.json`文件。
```
my-lerna-repo/
    ┣━ packages/
    ┃     ┣━ package-1/
    ┃     ┃      ┣━ ...
    ┃     ┃      ┗━ package.json
    ┃     ┗━ package-2/
    ┃            ┣━ ...
    ┃            ┗━ package.json
    ┣━ ...
    ┣━ lerna.json
    ┗━ package.json
```

### 💻参考
[手摸手教你玩转 Lerna](http://www.uedlinker.com/2018/08/17/lerna-trainning/)
