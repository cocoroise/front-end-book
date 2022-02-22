## 使用threeJS搭建一个简单的场景吧

### 啥是threeJS

​	Three.js是基于原生WebGL封装运行的三维引擎，在所有WebGL引擎中，Three.js是国内文资料最多、使用**最广泛**的三维引擎。![](http://image.cocoroise.cn/blog/20220221180120.png)

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

![](http://image.cocoroise.cn/blog/20220221173129.png)

### BEGIN！

#### 1. 3D的基本元素

1. 场景(scene)

2. 相机(camera)

   a. 透视相机(perspective)

   b. 正交相机(orthographic)

3. 物体(mesh)

4. 灯光(light)

   ![](http://image.cocoroise.cn/blog/20220221181929.png)

#### 2. 创建场景

创建一个简单的场景，想象在一个舞台上，我们先使用three自带的**Scene()**方法搭建一个舞台，然后在适合的角度架上一个摄像机，想要让场景能动起来，我们还需要关键的一步，循环调用**requestAnimationFrame(render)**方法，让摄像机开始工作。

详细见如下的代码：

```javascript
// ⭐️场景
const scene = new THREE.Scene();

const nearDist = 0.1;
const farDist = 10000;

// ⭐️创建透视摄像机
const camera = new THREE.PerspectiveCamera(
	75, // 视野角度
	window.innerWidth / window.innerHeight, // 渲染区域的纵横比
	nearDist, // 最近离镜头的距离
	farDist //  最远离镜头的距离
);
// 设置相机的位置
camera.position.set(200, 200, 200);
// 设置相机的观察角度
camera.lookAt(scene.position); 

// ⭐️创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor("#4DD0E1"); // 背景颜色
// 设置设备像素比率，兼容高HiDPI的设备，防止模糊
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setSize(window.innerWidth, window.innerHeight);// 设置尺寸
// 把场景挂在对应的dom上
document.querySelector("#canvas-wrapper").appendChild(renderer.domElement);

// ⭐️循环渲染
const render = () => {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
};
render();
```

![](http://image.cocoroise.cn/blog/20220221114217.png)

现在创建了基本的场景和简单的摄像机，能看到一块蓝色的背景的舞台，接下来我们就往上添加一些演员吧！

#### 3. 添加物体

```javascript
// ⭐️创建物体
const cubeSize = 150; // 物体尺寸

// Buffer属性可以更有效的渲染
const geometry = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize); 

// ⭐️材质
const material = new THREE.MeshNormalMaterial();

// ⭐️添加一个组
const group = new THREE.Group();
for (let i = 0; i < 4; i++) {
	let mesh = new THREE.Mesh(geometry, material); // 形状和材料

	const tau = 2 * Math.PI; // One turn
	mesh.position.x = Math.random() * 300;
	mesh.position.y = Math.random() * 300;
	mesh.position.z = Math.random() * 300;
	mesh.rotation.x = Math.random() * tau;
	mesh.rotation.y = Math.random() * tau;
	mesh.rotation.z = Math.random() * tau;
  
  mesh.updateMatrix();
// 把刚刚的物体放进这个组里
	group.add(mesh);
}

scene.add(group);
```

我们往场景里添加了4个小正方体，并随机设置了他们的位置和渲染的角度，现在看到的应该是下面这样：

![](http://image.cocoroise.cn/blog/20220221153615.png)

#### 4. 事件控制

事件这块我们想添加根据鼠标转动视角，和方块自旋转的能力。

自旋转通过在render方法中动态改变方块的角度，由于我们当初把他们加入了同一个组，所以只需要改变组的rotate属性。

```javascript
  const t = Date.now() * 0.001;
	const rx = Math.sin(t * 0.7) * 0.5;
	const ry = Math.sin(t * 0.3) * 0.5;
	const rz = Math.sin(t * 0.2) * 0.5;
	group.rotation.x = rx;
	group.rotation.y = ry;
	group.rotation.z = rz;
```

转动视角我们需要获取鼠标的位置，计算出摄像机需要转动的角度，然后改变它的x,y,z参数。

```javascript
let mouseX = 0;
let mouseY = 0;

const mouseFX = {
	windowHalfX: window.innerWidth / 2,
	windowHalfY: window.innerHeight / 2,
	coordinates: function(coordX, coordY) {
		mouseX = (coordX - mouseFX.windowHalfX) * 10;
		mouseY = (coordY - mouseFX.windowHalfY) * 10;
	},
	onMouseMove: function(e) {
		mouseFX.coordinates(e.clientX, e.clientY);
	}
};
// 在dom上添加鼠标的事件监听
document.addEventListener("mousemove", mouseFX.onMouseMove, false);
```

然后在render函数上增加每帧改变摄像角度的处理，现在的render函数已经变成了如下这样：

```javascript
const render = () => {
	requestAnimationFrame(render);
	// 根据鼠标改变摄像机的角度
	camera.position.x += (mouseX - camera.position.x) * 0.05;
	camera.position.y += (mouseY * -1 - camera.position.y) * 0.05;
	// 正方体自旋转的处理
	const t = Date.now() * 0.001;
	const rx = Math.sin(t * 0.7) * 0.5;
	const ry = Math.sin(t * 0.3) * 0.5;
	const rz = Math.sin(t * 0.2) * 0.5;
	group.rotation.x = rx;
	group.rotation.y = ry;
	group.rotation.z = rz;
	renderer.render(scene, camera);
};
```

做完这步之后，现在正方体应该可以在没人的时候自己默默转动，有鼠标移动的时候跟随鼠标的移动而移动了。但是，物体的比例，角度，视觉还是有点奇怪，想要做到开头完美的效果，还需要继续努力。

#### 5. 参数调优

待补充



### END

附上一些链接

最终版demo：https://codepen.io/ChristianPrint/pen/bGbjyzx

ThreeJS文档：https://techbrood.com/threejs/docs/

freeCodeCamp入门教程：https://www.freecodecamp.org/news/three-js-tutorial/