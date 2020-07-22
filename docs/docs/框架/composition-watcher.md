# Composition Watcher源码解析

### 🚗 前言

使用新出的vue的compositionApi时，发现watch的使用有和以前不同之处了

```javascript
// old
watch:{
    val:function(newVal,oldVal){
        // todo..
    }
}

//new
const count = ref(0)
// count.value变更的时候重新运行了这个函数
watchEffect(() => console.log(count.value))
// -> 打印出 0

setTimeout(() => {
  count.value++
  // -> 打印出 1
}, 100)
```

官网是这么介绍的：

> watchEffect: 立即执行传入的一个函数，并响应式追踪其依赖，并在其依赖变更时重新运行该函数。

之前watch需要手动指定某个值的名称，传入一个回调函数，但是现在传入的是一个匿名函数，然后可以在第二个参数里获取到新的值，为什么现在要选择传入一个函数的方式来指定watch的数据呢？

### 🛵 流程分析

新的api有两个方法可以进行监听操作，watchEffect和watch，唯一的不同之处就是watch可以监听多个值watchEffect只能监听一个。这里我们只看watchEffect的代码。

```typescript
// src/apis/watch.ts
export function watchEffect(effect: WatchEffect, options?: WatchOptionsBase): WatchStopHandle {
  const opts = getWatchEffectOption(options);
  const vm = getWatcherVM();
  return createWatcher(vm, effect, null, opts);
}
```

这个函数传入的是WatchEffect类型的函数，和一个options，返回的是一个用来终止watch的函数。看看他们的定义。

```typescript
export type WatchEffect = (onInvalidate: InvalidateCbRegistrator) => void;
type InvalidateCbRegistrator = (cb: () => void) => void;

export interface WatchOptionsBase {
  flush?: FlushMode;
  // onTrack?: ReactiveEffectOptions['onTrack'];
  // onTrigger?: ReactiveEffectOptions['onTrigger'];
}
export type FlushMode = 'pre' | 'post' | 'sync';

export type WatchStopHandle = () => void;
```

定义都很简单，watchEffect实际上就是个回调函数，optionsBase现在也只有个配置项，就是配置watch的触发时机。而终止watch的函数更简单了，就是个普通的void函数而已。重点看看实现方法把，代码里写的很清楚，先通过getWatchEffectOption获取到这个监听的配置项，然后通过getWatcherVM拿到当前vue的实例，最后为配置项创建一个watcher。

### 🏰 getWatchEffectOption

```typescript
function getWatchEffectOption(options?: Partial<WatchOptions>): WatchOptions {
  return {
    ...{
      immediate: true,
      deep: false,
      flush: 'post',
    },
    ...options,
  };
}
```

这个函数很简单，就是为每个watcher创建一个配置，目前现有的配置就是immediate，deep，和flush。

### ⛵ getWatcherVM

```typescript
function getWatcherVM() {
  let vm = getCurrentVM();
  if (!vm) {
    if (!fallbackVM) {
        // 没有vm实例也没有fallbackVM的时候，重新定义一个
      fallbackVM = defineComponentInstance(getCurrentVue());
    }
    vm = fallbackVM;
  } else if (!hasWatchEnv(vm)) {
    installWatchEnv(vm);
  }
  return vm;
}

// vm的watch队列不为空的情况下
function hasWatchEnv(vm: any) {
  return vm[WatcherPreFlushQueueKey] !== undefined;
}
// 注册一个watcher队列
function installWatchEnv(vm: any) {
  vm[WatcherPreFlushQueueKey] = []; // pre队列
  vm[WatcherPostFlushQueueKey] = []; // post队列
  vm.$on('hook:beforeUpdate', flushPreQueue);
  vm.$on('hook:updated', flushPostQueue);
}

// helper
export function defineComponentInstance<V extends Vue = Vue>(
  Ctor: VueConstructor<V>,
  options: ComponentOptions<V> = {}
) {
  const silent = Ctor.config.silent;
  Ctor.config.silent = true;
  const vm = new Ctor(options);
  Ctor.config.silent = silent;
  return vm;
}

// runtimeContext.ts
let currentVue: VueConstructor | null = null;
let currentVM: ComponentInstance | null = null;

export function getCurrentVue(): VueConstructor {
  return currentVue!;
}
export function getCurrentVM(): ComponentInstance | null {
  return currentVM;
}
```

这个函数也写的非常清楚（厉害的人写出来的代码就是优雅啊），每个函数都有它自己单一的执行目标，减少偶合。getWatcherVM就是获取当前ComponentInstance类型的vm实例，如果没有的话，就执行

 `const vm = new Ctor(options);`

来新建一个。然后再检查是否有watchEnv，这个watchEnv其实就是挂在vm上的一个数组，因为有不同的watch时机，所以分成 **WatcherPreFlushQueueKey** 和 **WatcherPostFlushQueueKey**数组。

### 🛁 createWatcher

做完上下文的检查工作之后，就要开始最重要的一步了，就是创建watcher，也是解答今天提出问题的关键性步骤。

我们先看watchEffect被创建的步骤：

1. createVueWatcher(vm, getter, noopFn,options)  // 创建通用的vue watcher
2. patchWatcherTeardown(watcher, runCleanup);  // 在每个teardown函数里插入cleanup函数
3. watcher.get = createScheduler(originGet);  // 确保每次get的时候都能执行监听的函数
4. watcher.teardown(); // 执行函数的收尾工作

#### 步骤一：createVueWatcher

```typescript
function createVueWatcher(
  vm: ComponentInstance,
  getter: () => any,
  callback: (n: any, o: any) => any,
  options: {
    deep: boolean;
    sync: boolean;
    immediateInvokeCallback?: boolean;
    noRun?: boolean;
    before?: () => void;
  }
): VueWatcher {
  const index = vm._watchers.length;
  // 使用vue原本的watch api 监听getter
  vm.$watch(getter, callback, {
    immediate: options.immediateInvokeCallback,
    deep: options.deep,
    lazy: options.noRun,
    sync: options.sync,
    before: options.before,
  });

  return vm._watchers[index];
}
// 注册了一个cleanup函数，实际就是用catch捕获了一下错误
const registerCleanup: InvalidateCbRegistrator = (fn: () => void) => {
    cleanup = () => {
      try {
        fn();
      } catch (error) {
        logError(error, vm, 'onCleanup()');
      }
    };
  };

const watcher = createVueWatcher(vm, getter, noopFn, {
      deep: options.deep || false,
      sync: isSync,
      before: runCleanup,
    });
```

#### 步骤二：patchWatcherTeardown

```typescript
// 在watcher的teardown函数上monkeypatch一个runCleanup()方法
// 这样每次watcher执行完毕之前都能执行一次cleanUp()
// monkeypatch:可以理解为在原有的函数上加了一个自己的函数
// teardown函数：每次函数执行到最后 才需要执行的函数 可以理解为和setup函数配套
function patchWatcherTeardown(watcher: VueWatcher, runCleanup: () => void) {
  const _teardown = watcher.teardown;
  watcher.teardown = function (...args) {
    _teardown.apply(watcher, args);
    runCleanup();
  };
}
// cleanup before running getter again
  const runCleanup = () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  };
```

#### 步骤三：createScheduler

```typescript
const createScheduler = <T extends Function>(fn: T): T => {
    if (isSync || /* without a current active instance, ignore pre|post mode */ vm === fallbackVM) {
      return fn;
    }
    return (((...args: any[]) =>
      // 清除已有watcher队列，放入新的fn
      queueFlushJob(
        vm,
        () => {
          fn(...args);
        },
        flushMode as 'pre' | 'post'
      )) as any) as T;
  };

// 允许watcher更新
watcher.lazy = false;
const originGet = watcher.get.bind(watcher);

// always run watchEffect
watcher.get = createScheduler(originGet);
```

步骤四：teardown

```typescript
return () => {
      watcher.teardown();
};
```

这里返回teardown函数之后呢，我们就可以这么操作

```typescript
const stop = watchEffect(() => {
  /* ... */
})
// 停止监听
stop()
```

这个teardown方法是哪里来的呢

```typescript
export interface VueWatcher {
  lazy: boolean;
  get(): any;
  teardown(): void;
}
```

找到VueWatcher里有它的定义，但是在哪里被传入值的呢

```typescript
// vue/src/apis/watcher.js
teardown () {
    if (this.active) {
      /*从vm实例的观察者列表中将自身移除，由于该操作比较耗费资源，所以如果vm实例正在被销毁则跳过该步骤。*/
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
```

原来这个teardown函数是定义在vue的源码里的，它主要是做了移除所有观察者的操作。如果vm实例正在被销毁，那么直接删除vm.watchers这个对象。

那么，watchEffect的函数实现就全部结束了，回想一下：

在使用`watchEffect(()=>{console.log('data change=>',count.value)})`的时候，相当于运行了

```typescript
const effect = () => {console.log('data change=>',count.value)}
return createWatcher(vm, effect, null, opts)
// 然后
const getter = () => (source as WatchEffect)(registerCleanup);
const watcher = createVueWatcher(vm, getter, noopFn, options);

// 这里实际上是调用了
vm.$watch(getter, callback, options)

// 然后注入cleanup函数
patchWatcherTeardown(watcher, runCleanup);

// 然后watcher.get上绑定自己
watcher.lazy = false;
const originGet = watcher.get.bind(watcher);
watcher.get = createScheduler(originGet);
// 这里创建sceduler 实际调用了flushQueue

return () => {
  // 最后执行watcher的收尾操作
  watcher.teardown();
};
```

最后看看函数队列是怎么被清空的：

```typescript
// 清空函数队列
function flushQueue(vm: any, key: any) {
  const queue = vm[key];
  for (let index = 0; index < queue.length; index++) {
    queue[index]();
  }
  queue.length = 0;
}

// 清空 WatcherPreFlushQueueKey 和 WatcherPostFlushQueueKey 队列
function queueFlushJob(vm: any, fn: () => void, mode: Exclude<FlushMode, 'sync'>) {
  // 在 beforeUpdate 和 updated 
  const fallbackFlush = () => {
    vm.$nextTick(() => {
      if (vm[WatcherPreFlushQueueKey].length) {
        flushQueue(vm, WatcherPreFlushQueueKey);
      }
      if (vm[WatcherPostFlushQueueKey].length) {
        flushQueue(vm, WatcherPostFlushQueueKey);
      }
    });
  };

  switch (mode) {
    case 'pre':
      fallbackFlush();
      // 上一次队列里的函数清空了之后，再运行新的函数
      vm[WatcherPreFlushQueueKey].push(fn);
      break;
    case 'post':
      fallbackFlush();
      vm[WatcherPostFlushQueueKey].push(fn);
      break;
    default:
      assert(false, `flush must be one of ["post", "pre", "sync"], but got ${mode}`);
      break;
  }
}
```

### 🌥 总结

这个新出的api实际上使用的watcher方法也是原本vue自己实现的$watcher方法，但是经过了一些封装。

核心就是这么两句

```typescript
const originGet = watcher.get.bind(watcher);
watcher.get = createScheduler(originGet);
```

在watch的get方法执行的时候,重新运行一个sceduler,就能达到依赖改变的时候就重新运行函数的效果.

源码也不复杂，推荐一看啦。

😇 最后附上官方文档:[watchEffect](https://composition-api.vuejs.org/zh/api.html#watcheffect)
