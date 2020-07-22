# composition-api reactive探究

### 💛  前言

今天工作的时候遇到一个奇怪的问题，在reactive里定义的数组不能被响应式，比如说

```javascript
const data = reactive({
	a:1, // 这个可以
	b:{c:2}, // 这个也可以
	c:[1,2,3] // 这个不行
	d:{
		e:[1,2,3] // 这个也不行
	},
    storeData:store.common.dataList // 实际使用的场景，只能取到空值
})
```

这个问题很奇怪，因为我想创建一个对象，里面包含store，但是初始值是空的，如果store里的数据加载了但是没有通知到data进行改变，那么组件上渲染的就一直都是空的。

为了研究这个问题，决定康康reactive和vue2上封装响应式数据的实现，有没有别的解决方案。

这里介绍一哈，新的composition-api分成两种响应式，一种是通过reactive封装的数据，一种通过ref，这两种其实没有本质的区别，只是在使用上根据个人喜好的不同来自己选择使用。只是注意使用ref的话存取值都要通过`xxx.value=1`来实现（的确有点hooks的感觉哈）。

```typescript
// 风格一
const x = ref(0)
const y = ref(0)
const isDisplay = ref(false)

// 风格二
const state = reactive({
  x: 0,
  y: 0,
  isDisplay: false
})
```

### 🧡  提问时间

1. reactive关于数组这块是怎么处理的，为什么跟对象处理不一样
2. vue2里对于响应式的处理与新的函数式api有何不同
4. 为什么ref包装的数据要保存在value里面

带着这些问题，先往下看代码。

### 💙  reactive流程

compositon-api有关于封装响应式数据的代码就在`src/reactive`里，从`index`开始看，这里只是暴露了一些api

```typescript
export { reactive, isReactive, markRaw, shallowReactive, toRaw, isRaw } from './reactive';
export {
  ref,
  isRef,
  Ref,
  createRef,
  UnwrapRef,
  toRefs,
  toRef,
  unref,
  shallowRef,
  triggerRef,
} from './ref';
export { set } from './set';
```

直接从reactive这个函数开始找，一般写的好的代码都是用一个函数写清所有的调用步骤，这里也不例外

```typescript
/**
 * Make obj reactivity
 */
export function reactive<T extends object>(obj: T): UnwrapRef<T> {
    // 非空/已响应式化/原生数据/不可扩展的数据 直接返回
  if (!isPlainObject(obj) || isReactive(obj) || isRaw(obj) || !Object.isExtensible(obj)) {
    return obj as any;
  }

  const observed = observe(obj);
  // def(obj, ReactiveIdentifierKey, ReactiveIdentifier); 注：这句被移到了markReactive里
  markReactive(obj);
  setupAccessControl(observed);
  return observed as UnwrapRef<T>;
}
```

很清晰，把一个数据响应化的步骤只有三步：

- const observed = observe(obj) // 加getter和setter
- markReactive(obj) // 标记为响应式的数据
- setupAccessControl(observed) // 代理对象，方便对象的取值和设值

下面来一个函数一个函数的分析

##### observe(obj)

```typescript
function observe<T>(obj: T): T {
  const Vue = getCurrentVue(); // 获取当前vue实例
  let observed: T;
  if (Vue.observable) {
    observed = Vue.observable(obj); // 直接调用vue的方法来响应化
  } else {
    const vm = defineComponentInstance(Vue, {
      data: {
        $$state: obj,
      },
    });
    observed = vm._data.$$state;
  }

  return observed;
}

```

##### markReactive(obj)

```typescript
export function markReactive(target: any, shallow = false) {
  // 空对象/原生对象/数组/ref类型/组件实例 直接跳出不能被标记 
  if (
    !isPlainObject(target) ||
    isRaw(target) ||
    Array.isArray(target) ||
    isRef(target) ||
    isComponentInstance(target)
  ) {
    return;
  }

  // 已被标记过为reactive对象的也不用再标记 
  if (
    hasOwn(target, ReactiveIdentifierKey) &&
    target[ReactiveIdentifierKey] === ReactiveIdentifier
  ) {
    return;
  }

  // 核心 调用def函数
  if (Object.isExtensible(target)) {
    def(target, ReactiveIdentifierKey, ReactiveIdentifier);
  }

  // shallowReactive也不用标记
  if (shallow) {
    return;
  }
  // 使用对象的key做的遍历 
  const keys = Object.keys(target);
  for (let i = 0; i < keys.length; i++) {
    markReactive(target[keys[i]]); // 递归一下，遇到上面说的不能被定义的类型就退出了
  }
}

// utils.ts
// 添加对象的属性
export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable, // 枚举属性
    writable: true, // value可修改
    configurable: true,// obj可修改
  });
}
```

##### setupAccessControl(observed)

这个函数就是遍历当前的对象，通过拿到对象原来的getter和setter，让我们在用的时候能够透过代理直接用value.a = 1 的方式拿到正确的值。也可以直接赋值的方式来设置正确的值。

```typescript
/**
 * Proxing property access of target.
 * We can do unwrapping and other things here.
 */
function setupAccessControl(target: AnyObject): void {
  // 设置一些递归跳出的条件
  if (
    !isPlainObject(target) ||
    isRaw(target) ||
    Array.isArray(target) ||
    isRef(target) ||
    isComponentInstance(target)
  ) {
    return;
  }

  if (
    hasOwn(target, AccessControlIdentifierKey) &&
    target[AccessControlIdentifierKey] === AccessControlIdentifier
  ) {
    return;
  }

  if (Object.isExtensible(target)) {
    def(target, AccessControlIdentifierKey, AccessControlIdentifier);
  }
  // 核心 遍历 和 递归  
  const keys = Object.keys(target);
  for (let i = 0; i < keys.length; i++) {
    defineAccessControl(target, keys[i]);
  }
}

/**
 * Auto unwrapping when access property
 */
export function defineAccessControl(target: AnyObject, key: any, val?: any) {
  let getter: (() => any) | undefined;
  let setter: ((x: any) => void) | undefined;
  const property = Object.getOwnPropertyDescriptor(target, key);
  if (property) {
    if (property.configurable === false) {
      return;
    }
    // 取原来对象的getter和setter
    getter = property.get;
    setter = property.set;
    if ((!getter || setter) /* not only have getter */ && arguments.length === 2) {
      val = target[key];
    }
  }

  // 递归设置val的getter和setter
  setupAccessControl(val);
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function getterHandler() {
      const value = getter ? getter.call(target) : val;
      // Ref类型的值设置在value上
      if (key !== RefKey && isRef(value)) {
        return value.value;
      } else {
        return value;
      }
    },
    set: function setterHandler(newVal) {
        // 有getter没有setter 直接跳出
      if (getter && !setter) return;

      const value = getter ? getter.call(target) : val;
      // If the key is equal to RefKey, skip the unwrap logic
      // If and only if "value" is ref and "newVal" is not a ref,
      // the assignment should be proxied to "value" ref.
      if (key !== RefKey && isRef(value) && !isRef(newVal)) {
        value.value = newVal; // ref的处理
      } else if (setter) {
        setter.call(target, newVal);
      } else {
        val = newVal;
      }
      // 递归设置改变后对象的getter和setter 
      setupAccessControl(newVal);
    },
  });
}
```

### 💚  ref实现分析

看看ref的定义

```typescript
export interface Ref<T = any> {
  readonly [_refBrand]: true; // ref对象本身是只读的，它上面的value才是响应式的
  value: T; // ref对象上的value
}

class RefImpl<T> implements Ref<T> {
  readonly [_refBrand]!: true;
  public value!: T;
  constructor({ get, set }: RefOption<T>) {
    // 在这个对象上面加了value属性 
    proxy(this, 'value', {
      get,
      set,
    });
  }
}
```

ref的实现类里关键就是添加了一个Proxy方法，看看这个方法做了啥事

```typescript
// utils.ts
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noopFn,
  set: noopFn,
};

export function proxy(target: any, key: string, { get, set }: { get?: Function; set?: Function }) {
  sharedPropertyDefinition.get = get || noopFn;
  sharedPropertyDefinition.set = set || noopFn;
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

其实这个方法就是帮你代理在target上的key里，加上get和set属性而已。

继续往下看ref的实现，关键代码

```typescript
export function ref(raw?: unknown) {
  if (isRef(raw)) {
    return raw;
  }

  // ref.value实际上也是一个reactive  
  const value = reactive({ [RefKey]: raw });
  return createRef({
    get: () => value[RefKey] as any,
    set: (v) => ((value[RefKey] as any) = v),
  });
}

export function createRef<T>(options: RefOption<T>) {
  // seal the ref, this could prevent ref from being observed
  // It's safe to seal the ref, since we really shouldn't extend it.
  // related issues: #79
  // Object.seal() 方法可以让一个对象密封，并返回被密封后的对象。密封对象将会阻止向对象添加新的属性，并且会将所有已有属性的可配置性（configurable）置为不可配置（false），即不可修改属性的描述或删除属性。但是可写性描述（writable）为可写（true）的属性的值仍然可以被修改。
  return Object.seal(new RefImpl<T>(options));
}
```

ref的实现就是这么的简单直接，但是我们平时还会用到一个函数，把reactive的对象转化成ref类型，这个方法就是toRefs(),方法的代码如下：

```typescript
export function toRefs<T extends Data = Data>(obj: T): ToRefs<T> {
  if (!isPlainObject(obj)) return obj as any;

  if (__DEV__ && !isReactive(obj)) {
    warn(`toRefs() expects a reactive object but received a plain one.`);
  }

  const ret: any = {};
  // 遍历 转换
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }

  return ret;
}

export function toRef<T extends object, K extends keyof T>(object: T, key: K): Ref<T[K]> {
  const v = object[key];
  if (isRef<T[K]>(v)) return v;

  return createRef({
    get: () => object[key],
    set: (v) => (object[key] = v),
  });
}
```

### 🖤  shallowReactive的实现

这个api的作用是 只为某个对象的私有（第一层）属性创建浅层的响应式代理，不会对“属性的属性”做深层次、递归地响应式代理，而只是保留原样。

官方示例：

```typescript
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2,
  },
})

// 变更 state 的自有属性是响应式的
state.foo++
// ...但不会深层代理
isReactive(state.nested) // false
state.nested.bar++ // 非响应式
```

又回到reactive的文件里

```typescript
export function shallowReactive<T extends object = any>(obj: T): T {
  // 这里传入的是一个空对象而不是obj
  const observed = observe({});
  markReactive(observed, true);
  setupAccessControl(observed);

  const ob = (observed as any).__ob__;

  for (const key of Object.keys(obj)) {
    let val = obj[key];
    let getter: (() => any) | undefined;
    let setter: ((x: any) => void) | undefined;
    const property = Object.getOwnPropertyDescriptor(obj, key);
    if (property) {
      if (property.configurable === false) {
        continue;
      }
      getter = property.get;
      setter = property.set;
      if ((!getter || setter) /* not only have getter */ && arguments.length === 2) {
        val = obj[key];
      }
    }
      
    // setupAccessControl(val);
    // 只遍历第一层 为第一层创建响应式监听
    Object.defineProperty(observed, key, {
      enumerable: true,
      configurable: true,
      get: function getterHandler() {
        const value = getter ? getter.call(obj) : val;
        // 依赖收集
        ob.dep.depend();
        return value;
      },
      set: function setterHandler(newVal) {
        if (getter && !setter) return;
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        // setupAccessControl(newVal);
        // 直接变更通知 
        ob.dep.notify();
      },
    });
  }
  return (observed as unknown) as T;
}
```

可以看到实现浅响应式对象的方式跟普通的差不多，只不过只为第一层的对象添加响应式的属性，不再往深层的对象里添加响应式的方法，而是直接就搜集依赖和变更通知了。

### 💜  回答时间

1. reactive关于数组这块是怎么处理的，为什么跟对象处理不一样

   > 可以看到代码里面对于array都是直接就跳过，只代理array的属性，因为使用的api就是Object.defineProperty，不能代理数组的属性

   

2. vue2里对于响应式的处理与新的函数式api有何不同

   > 实质上没有什么不同，等同于 2.x 的 `Vue.observable()`。实际上源码里也能看见，使用的api就是Vue.observable()。

   

3. 为什么ref包装的数据要保存在value里面

   > 为了定义可响应的原生属性，比如说string,number之类。但是因为vue只能通过对象来为数据添加响应式的属性，所以需要添加一个value属性，来统一通过value这个属性来get值和set值。

