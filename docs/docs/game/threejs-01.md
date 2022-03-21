## 使用threeJS搭建一个简单的场景吧

### 啥是threeJS

​	Three.js是基于原生WebGL封装运行的三维引擎，在所有WebGL引擎中，Three.js是国内文资料最多、使用**最广泛**的三维引擎。

​    它的原作者为Mr.Doob，项目地址为：https://github.com/mrdoob/three.js/。

### 啥是WEBGL

- WebGL（全写Web Graphics Library）是一种**3D绘图标准**
- WebGL在电脑的**GPU**中运行
- WebGL可以为**HTML5 Canvas**提供硬件3D加速渲染

### 今天的目标

1. 了解3D场景的基本元素

2. 创建属于我们的第一个场景

3. 在场景里添加物体

4. 添加鼠标事件

   <img src="http://image.cocoroise.cn/blog/20220221173129.png" />

### BEGIN！

#### 1. 3D的基本元素

1. 场景(scene)

2. 相机(camera)

   a.  正交相机(orthographic) ：在数学几何学课上老师教我们画的效果，对于在三维空间内平行的线，投影到二维空间中也一定是平行的（下图左）

   b. 透视相机(perspective)  ： 类似人眼在真实世界中看到的有“近大远小”的效果（下图右）

3. 物体(mesh)

4. 灯光(light)

   <img src="http://image.cocoroise.cn/blog/20220221181929.png" />

#### 2. 创建场景

创建一个简单的场景，想象在一个舞台上，我们先使用three自带的**Scene()**方法搭建一个舞台，然后在适合的角度架上一个摄像机，想要让场景能动起来，我们还需要关键的一步，循环调用**requestAnimationFrame(render)**方法，让摄像机开始工作。

详细见如下的代码：

![](http://image.cocoroise.cn/carbon.png)

![](http://image.cocoroise.cn/blog/20220221114217.png)

现在创建了基本的场景和简单的摄像机，能看到一块蓝色的背景的舞台，接下来我们就往上添加一些演员吧！

#### 3. 添加物体

![](http://image.cocoroise.cn/carbon-1.png)

我们往场景里添加了4个小正方体，并随机设置了他们的位置和渲染的角度，现在看到的应该是下面这样：

<img src="http://image.cocoroise.cn/blog/20220221153615.png" />

#### 4. 事件控制

事件这块我们想添加根据鼠标转动视角，和方块自旋转的能力。

自旋转通过在render方法中动态改变方块的角度，由于我们当初把他们加入了同一个组，所以只需要改变组的rotate属性。

![](http://image.cocoroise.cn/carbon-2.png)

转动视角我们需要获取鼠标的位置，计算出摄像机需要转动的角度，然后改变它的x,y,z参数。

![](http://image.cocoroise.cn/carbon-3.png)

然后在render函数上增加每帧改变摄像角度的处理，现在的render函数已经变成了如下这样：

![](http://image.cocoroise.cn/carbon-4.png)

做完这步之后，现在正方体应该可以在没人的时候自己默默转动，有鼠标移动的时候跟随鼠标的移动而移动了。但是，物体的比例，角度，视觉还是有点奇怪，想要做到开头完美的效果，还需要继续调试它的参数。

#### 5. 代码优化

##### 增加形状&数量

使用不同的api随机生成不同的形状

![](http://image.cocoroise.cn/carbon-5.png)

##### 调整视角

![](http://image.cocoroise.cn/carbon-6.png)

##### 鼠标移动

![](http://image.cocoroise.cn/carbon-7.png)

最后，我们的作品就是这个样子啦。

在没有鼠标的时候随机旋转视角，有鼠标移动的时候跟随鼠标移动视角。

<img src="http://image.cocoroise.cn/image-20220227234344421.png" />

### END

附上一些参考资料：

最终版demo：https://codepen.io/ChristianPrint/pen/bGbjyzx

ThreeJS文档：https://techbrood.com/threejs/docs/

freeCodeCamp入门教程：https://www.freecodecamp.org/news/three-js-tutorial/