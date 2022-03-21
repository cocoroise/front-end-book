# TS使用记录

记录自己使用Ts的过程，方便查阅。

文档地址（中文）：https://www.tslang.cn/docs/home.html

官方地址（英文）：https://www.typescriptlang.org/docs/handbook/intro.html

## 基础使用

### 🦉数据类型

https://www.tslang.cn/docs/handbook/basic-types.html

1. 布尔值boolean : `let isDone: boolean = false;` 

2. 数字number

3. 字符串string

4. 数组array

5. 元素tuple : 和数组的区别是里面元素的类型不必相同

   `let x: [string, number];`

   `x = ['hello', 10];`

6. 枚举enum

   `enum Color {Red, Green, Blue} `

   `let c: Color = Color.Green;`

7. Any : 任意类型

8. viod : 空类型

9. null & uundefined

10. Never : 永不存在的类型

    `// 返回never的函数必须存在无法达到的终点`

    ` function error(message: string): never {    throw new Error(message); }`

11. 类型断言 : 使用者来指定数据的类型

    a. 尖括号 `let strLength: number = (<string>someValue).length;`

    b. As `let strLength: number = (someValue as string).length;`

### 🦋接口interface

https://www.tslang.cn/docs/handbook/interfaces.html

接口的作用就是为这些类型命名和为你的代码或第三方代码定义契约。

可以理解为一份数据结构的声明。

1. 基础声明

   ```typescript
   interface LabelledValue {
     label: string;
   }
   ```

   

2. 可选属性

   ```typescript
   interface SquareConfig {
     color?: string;
     width?: number;
   }
   ```

   

3. 只读属性

   对象属性只能在刚创建的时候修改它的值。

   ```typescript
   interface Point {
       readonly x: number;
       readonly y: number;
   }
   ```

   

4. 为函数声明类型

   ```typescript
   // 输入source & substring, 输出boolean的一个函数
   interface SearchFunc {
     (source: string, subString: string): boolean;
   }
   // 使用
   let myFn: SearchFunc;
   myFn = function(source:string,subString:string){
     return false;
   }
   ```

   

5. Implements实现接口

   ```typescript
   interface ClockInterface {
       currentTime: Date;
   }
   
   class Clock implements ClockInterface {
       currentTime: Date;
       constructor(h: number, m: number) { }
   }
   ```

### 🦀class类

https://www.tslang.cn/docs/handbook/classes.html

#### 基本使用

```typescript
class Animal {
    // public 公用属性
    public name: string;
    // private 私有属性
    private age: number;
    // readonly 只读属性，必须在声明或者构造函数里被初始化
    readonly nameOfLengths: number = 5;
    // 构造函数 protected表示不能在包含它的类外被实例化，但是可以被继承
    protected constructor(theName: string) { this.name = theName; }
    public move(distanceInMeters: number = 0) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
    }
}

// extends继承语法
class Snake extends Animal {
    constructor(name: string) { super(name); }
    move(distanceInMeters = 5) {
        console.log("Slithering...");
        // super语法使用父类的方法 
        super.move(distanceInMeters);
    }
}
```

#### 使用get&set控制对象成员的访问

```typescript
let passcode = "secret passcode";

class Employee {
    private _fullName: string;
		// get
    get fullName(): string {
        return this._fullName;
    }
    // set
    set fullName(newName: string) {
        if (passcode && passcode == "secret passcode") {
            this._fullName = newName;
        }
        else {
            console.log("Error: Unauthorized update of employee!");
        }
    }
}

```

### 🐟函数使用

1. 指定入参类型，可选和默认值的用法

   ```typescript
   function buildName(firstName: string, lastName?: string = 'xxx') {
       return firstName + " " + lastName;
   }
   ```

   

2. 剩余的参数

   ```typescript
   function buildName(firstName: string, ...restOfName: string[]) {
     return firstName + " " + restOfName.join(" ");
   }
   ```

### 🦓泛型

创建自己定义的数据类型。

```typescript
// 如果传入的arg是number，那么T代表的就是number
function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: <T>(arg: T) => T = identity;
```

### 🐝命名空间

namespace开启一块命名空间，编译成js的话，其实就是闭包。

namespace主要是为了合理拆分模块，避免和其他人命名的函数名称产生冲突。

```typescript
namespace Validation {
    export function a (){
        return '1'
    }
}
```

转成js之后

```javascript
var Validation;
(function (Validation) {
    function a() {
        return '1';
    }
    Validation.a = a;
})(Validation || (Validation = {}));
```



## vue3&ts中使用的小tips

### 🌿模板

1. lang改成ts

   ```vue
   <script lang="ts">
   import { defineComponent } from 'vue'
   
   export default defineComponent({
   
   })
   </script>
   ```

2. Shims-vue.d.ts

   这个文件是为了让ts解析vue的文件，放在src文件夹下。

   ```typescript
   declare module '*.vue' {
     import type { DefineComponent } from 'vue'
     const component: DefineComponent<{}, {}, any>
     export default component
   }
   ```

   

### 🌸Vue定义

1. 在vue实例上增加属性，如$http

   ```typescript
   import axios from 'axios'
   declare module '@vue/runtime-core' {
     export interface ComponentCustomProperties {
       $http: typeof axios
       $validate: (data: object, rule: object) => boolean
     }
   }
   ```

   

### 🌹Vuex使用

1. 需要为store声明一下类型

   ```typescript
   // 在src/@types/vuex.d.ts下
   import { ComponentCustomProperties } from 'vue'
   import { Store } from 'vuex'
   
   declare module '@vue/runtime-core' {
     // 声明自己的 store state
     interface State {
       count: number
     }
   
     // 为 `this.$store` 提供类型声明
     interface ComponentCustomProperties {
       $store: Store<State>
     }
   }
   ```

2. 装饰器使用

   方便了vuex模块的书写，不用写冗长的函数，简洁方便。

   ```typescript
   import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
   
   @Mutation
     private TOGGLE_DEVICE(device: DeviceType) {
       this.device = device
   }
   
   @Action
     public SetSize(size: string) {
       this.SET_SIZE(size)
   }
   ```

   

