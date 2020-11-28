# Gitlab ci/cd的使用

### 介绍
GitLab提供持续集成服务。如果将.gitlab-ci.yml文件添加到存储库的根目录，并将GitLab项目配置为使用Runner，则每次提交或推送都会触发pipelin。默认有三个流水线,build->test->deploy.(tips:gitlab-runner比较吃内存,建议不要安装到同一台服务器上.)   
一条流水线有多个工序(stage),一个工序有多个作业(jobs).   



### yml文件介绍

.gitlab-ci.yml文件是用来配置GitLab CI进行构建流程的配置文件，其采用YAML语法,所以你需要额外注意要用空格来代替缩进，而不是Tabs。用`Stages`关键字来定义构建过程中的四个阶段。
`stages`会安装顺序进行，完成一个之后下一个才会开始，如果有一个失败整个`Pipeline`都算失败，全部成功才算构建成功。`caches`字段是用来指定下面将要进行的job任务中需要共享的文件目录,如果没有，每个`Job`开始的时候，GitLab Runner都会删掉.gitignore里面的文件。`Jobs`会并行执行，只有一个`Stage`中所有的`Jobs`都成功这个`Stages`才算成功。



### yml文件示例

````
# stages用来定义构建过程中的四个阶段 init->check->build->deploy
stages:
  - init
  - check
  - build
  - deploy

# cache定义dist和node_modules是可以全构建过程共享的
cache:
  key: ${CI_BUILD_REF_NAME}
  paths:
  - node_modules/
  - dist/

# 定义一个叫init的Job任务
init:
  stage: init
  script:
  -  cnpm install

# master_check任务：检查master分支上关键内容
master_check:
  stage: check
  script:
  - echo "Start Check Eros Config ..."
  - bash check.sh release 
  # only 表示只有这个分支有push事件才会触发这个任务
  only:
  - master
  
# dev_check 任务: 检查dev分支上关键内容
dev_check:
  stage: check
  script:
  - echo "Start Check Eros Config ..."
  - bash check.sh debug
  only:
  - dev

js_build:
  stage: build
  script:
  - eros build

master_deploy:
  stage: deploy
  script:
  - bash deploy.sh release
  only:
  - master

dev_deploy:
  stage: deploy
  script:
  - bash deploy.sh debug
  only:
  - dev
````


### runner的配置

  1. [安装gitlab-runner或者gitlab-ci-multiple-runner](https://juejin.im/post/5cb92a3ae51d456e5f76c485)
  2. runner register，把gitlab上面的token和url配置进去
  3. runner start
  4. 如果要传文件给别的服务器的话，要配置免密登陆，在开发机上先切换gitlab-runner的用户，然后跑一下命令
   ````
   ssh-keygen -t rsa
   cd ~/.ssh/config(没有则创建)
   添加以下配置
   ----------------
    Host any_name
      Port your_port
      HostName server_ip
      User user
      IdentityFile ~/.ssh/id_rsa
   ----------------
   ssh-copy-id -i ~/.ssh/id_rsa.pub username@ip
   ssh -p PORT any_name
   ````



### 作业关键字

|    Keyword    | Required |                           Description                           |
| :-----------: | :------: | :-------------------------------------------------------------: |
|    script     |   yes    |                     Runner执行的命令或脚本                      |
|     image     |    no    |             所使用的docker镜像，查阅使用docker镜像              |
|   services    |    no    |             所使用的docker服务，查阅使用docker镜像              |
|     stage     |    no    |                             定义job                             | stage（默认：test） |
|   variables   |    no    |                        定义job级别的变量                        |
|     only      |    no    |                 定义一列git分支，并为其创建job                  |
|    except     |    no    |                   定义一列git分支，不创建job                    |
|     tags      |    no    | 定义一列tags，用来指定选择哪个Runner（同时Runner也要设置tags）  |
| allow_failure |    no    |             允许job失败。失败的job不影响commit状态              |
|     when      |    no    | 定义何时开始job。可以是on_success，on_failure，always或者manual |
| dependencies  |    no    |        定义job依赖关系，这样他们就可以互相传递artifacts         |
|   artifacts   |    no    |                 定义下个job可以使用的artifacts                  | artifacts job列表   |
|     cache     |    no    |               定义应在后续运行之间缓存的文件列表                |
| before_script |    no    |                  覆盖在作业之前执行的一组命令                   |
| after_script  |    no    |                    覆盖作业后执行的一组命令                     |
|  environment  |    no    |                  定义此作业完成部署的环境名称                   |
|   coverage    |    no    |                  定义给定作业的代码覆盖率设置                   |
|     retry     |    no    |             定义在发生故障时可以自动重试作业的次数              |


### gitlab-ci和Jenkins对比
&emsp; gitlab-ci作为gitlab提供的一个持续集成的套件，完美和gitlab进行集成，gitlab-ci已经集成进gitlab服务器中，在使用的时候只需要安装配置gitlab-runner即可。

> `jenkins`: 老牌的持续集成框架，代码仓库和编译服务分离。支持丰富的插件，可以支持很多有用的功能，比如说编译状况统计，代码拉取和编译之前之后的钩子回调等等。但是配置起来可能比较麻烦。  
> `gitlab-ci`: gitlab提供的套件，和gitlab完美集成，只需要配置一个gitlab-ci.yml文件，就能通过gitlab-runner跑起来，并且能在gitlab里直接看到集成的步骤等。只是它对于编译的环境都要自行安装，就不像jenkins那样可以在控制台安装。  

所以如果是一个需要简洁的集成环境的，那就选gitlab自己提供的工具就可以，如果是一个比较大型的团队，有运维，测试等等一起维护环境的，那就用Jenkins，职责分明，不会出错。



### 总结 
&emsp; 就我贫瘠的知识只知道两种上线方法，一个就是运用webhook这样的东西，简单的脚本，直接把打包好的静态资源复制到nginx对应的目录下。后端还要麻烦一点，可能服务器上要安装一个tomcat或者docker，docker里拉一个tomcat的镜像，再进行操作。另外一种就是运用这种比较自动的方式，通过写一份配置文件来进行部署，但是jenkins没有回滚的功能很让人疑惑。如果要用到别的管理docker镜像的工具的话，那上线也太麻烦了一点（之前实习的公司就是用的jenkins和rancher，需要手动复制jenkins打包出来的docker镜像地址到rancher上，但是这样可以有个管理镜像的功能）😜。   
&emsp; 另外公司在用的一个叫蜂巢的东西，用了部分的k8s，意图是想解决混乱的测试环境问题。比如说A项目和B项目想进行联调，这里需要用到C项目的公共测试环境，但是这个时候如果C项目挂了，A和B的联调就同时进行不下去。如果在联调的时候能创建一个单独的环境，或者说C的可用的镜像，然后放在只有A和B和C的一个容器里，这样就能愉快的进行联调了。



### 参考资料
- [Gitlab官方文档](https://docs.gitlab.com/ce/ci/yaml/README.html)
- [利用GitLab提供的GitLab-CI以及GitLab-Runner搭建持续集成/部署环境](https://juejin.im/entry/5ad8627d6fb9a045d639b043)
- [Gitlab搭配Gitlab-runner实现流水自动化部署](https://rorschachchan.github.io/2019/08/21/Gitlab%E6%90%AD%E9%85%8DGitlab-runner%E5%AE%9E%E7%8E%B0%E6%B5%81%E6%B0%B4%E8%87%AA%E5%8A%A8%E5%8C%96%E9%83%A8%E7%BD%B2/)
- [GitLab CI/CD 介绍和使用](https://blinkfox.github.io/2018/11/22/ruan-jian-gong-ju/devops/gitlab-ci-jie-shao-he-shi-yong/)
- [Gitlab CI/CD流水线 （三）](https://www.anonym0x1.com/gitlab-ci-cd/593.html)
- [GitLab-CI 从安装到差点放弃](https://segmentfault.com/a/1190000007180257)
