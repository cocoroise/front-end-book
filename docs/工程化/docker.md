# Docker介绍和使用

> 本篇主要介绍一哈docker常用的命令和网络基础。

### 🎆docker常用命令

1. 获取镜像

   `docker pull ubuntu`

2. 创建一个新的容器并运行一个命令

   `docker run [OPTIONS] IMAGE [COMMAND] [ARG...]`

   **参数**：

   - **-d:** 后台运行容器，并返回容器ID；
   - **-i:** 以交互模式运行容器，通常与 -t 同时使用；
   - **-p:** 指定端口映射，格式为：**主机(宿主)端口:容器端口**，-P：随机端口
   - **--name="nginx-lb":** 为容器指定一个名称；
   - **--net="bridge":** 指定容器的网络连接类型，支持 bridge/host/none/container: 四种类型；
   - **--link=[]:** 添加链接到另一个容器；
   - **--expose=[]:** 开放一个端口或一组端口；

   **实例**：

   - 启动并进入容器，使用交互shell `docker run -it ubuntu /bin/bash`

   - 使用镜像nginx:latest以后台模式启动一个容器,并将容器的80端口映射到主机随机端口。

     `docker run -P -d nginx:latest`

3. 退出容器

   `exit`

4. 查看容器

   `docker ps [OPTIONS]`

   参数：

   - **-a :**显示所有的容器，包括未运行的。
   - **-f :**根据条件过滤显示的内容。
   - **-l :**显示最近创建的容器。

   实例：

   - 列出所有在运行的容器信息。`docker ps`
   - 列出所有创建的容器ID。`docker ps -a -q`
   - 根据名称过滤。`docker ps --filter "label=color"`

5. 启动/停止/重启容器

   - 启动：`docker start [OPTIONS] CONTAINER [CONTAINER...]`
   - 停止：`docker stop [OPTIONS] CONTAINER [CONTAINER...]`
   - 重启：`docker restart [OPTIONS] CONTAINER [CONTAINER...]`

6. 列出本地镜像

   `docker images [OPTIONS] [REPOSITORY[:TAG]]`

   参数：

   - **-a :**列出本地所有的镜像（含中间映像层，默认情况下，过滤掉中间映像层）
   - **--digests :**显示镜像的摘要信息；
   - **-f :**显示满足条件的镜像；
   - **-q :**只显示镜像ID。

7. 将本地的镜像上传到镜像仓库

   `docker push [OPTIONS] NAME[:TAG]`

   实例：

   - 上传本地镜像myapache:v1到镜像仓库中。`docker push myapache:v1`

### :artificial_satellite: dockerfile介绍

dockerfile是一个用文件来创建镜像的脚本，它把需要手动部署的工作简化成一行行的配置文件，在每次部署的时候，只要用的dockerfile一样，就不用担心项目因为机器的环境不同而跑不起来的问题。

基本命令：

- 复制文件：**ADD** [source directory or URL] [destination directory]
- 执行命令：**CMD** application 'args','args'...，在镜像构建容器后被调用
- 设置环境变量：**ENV** key value
- 设置端口：**EXPOSE** [port]
- 拉取基础镜像：**FROM** [image name]
- 创建镜像命令：**RUN** [command]
- 访问宿主机目录：**VOLUME** ["/dir_1", "/dir_2" ..]
- 设置运行目录：**WORKDIR** /path

````dockerfile
# 拉取openjdk的镜像
FROM openjdk:7
# 复制文件，和add命令相似
COPY . /usr/src/myapp
# 设置运行目录为刚刚复制的文件夹
WORKDIR /usr/src/myapp
# 执行命令 编译main.java文件
RUN javac Main.java
CMD ["java", "Main"]
````



### 🍇docker的网络模型

`docker run -net `这个命令可以创建不同的网络模式，分别是：

- host模式：使用--net=host指定，告诉docker不要将容器网络放到隔离的名字空间内，此时容器使用本地主机的网络，拥有完全的本地主机的接口访问权限。
- container模式：使用--net=container:NAME_or_ID指定，把新建的容易放到一个已有的容器的网络栈中，和它共享ip地址和端口等网络资源，可以像局域网一样通过lo环回接口通信。
- none模式：使用--net=none指定，用户可以自行配置网络。
- bridge模式：使用--net=bridge指定，默认设置，连接到默认的网桥。

这里着重介绍一下桥接模式：

![](http://image.cocoroise.cn/docker-1.jpg)

上图为docker的网络模型，docker的网络接口都是虚拟的，实际是通过Linux在内核中复制文件实现的接口转发。其中的veth pair就是转发的通道。docker在本地主机和容器内分别创建一个虚拟接口，如图里的docker0就是本机的接口，而eth0就是容器里使用的接口，这个接口只在容器内可见。容器内和容器外通信实际上都要通过docker0接口。

docker0 会为每一个容器分配一个新的空闲的 IP 地址并将 docker0 的 IP 地址设置为默认的网关。网桥 docker0 通过 iptables 中的配置与宿主机器上的网卡相连，所有符合条件的请求都会通过 iptables 转发到 docker0 并由网桥分发给对应的机器。

所以，当有 Docker 的容器需要将服务暴露给宿主机器，就会为容器分配一个 IP 地址，同时向 iptables 中追加一条新的规则。这样就能将容器内部的端口暴露出来并对数据包进行转发。

### :ear_of_rice: 尾声

Docker 目前已经成为了非常主流的技术，已经在很多成熟公司的生产环境中使用，但是 Docker 的核心技术其实已经有很多年的历史了，Linux 命名空间、控制组和 UnionFS 三大技术支撑了目前 Docker 的实现，也是 Docker 能够出现的最重要原因。

### :book: 参考

[Docker 核心技术与实现原理](https://draveness.me/docker)

[「Docker」 - Dockerfile](https://zhuanlan.zhihu.com/p/57335983)
