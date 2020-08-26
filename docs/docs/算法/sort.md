# 排序算法

### 冒泡

简单粗暴，两个全数组遍历。

```javascript
function bubbles(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = temp;
      }
    }
  }
  return arr;
}
```

### 快排

比较理解但是需要额外空间的一种解法，定义左数组和右数组，另外还需要一个基准值pivot，这个基准值单独处理。递归放入需要的元素。

```javascript
function quickSort(arr) {
  if (arr.length < 1) return arr;
  let pivotIndex = Math.floor(arr.length / 2);
  // 把基准值从数组里去掉
  let pivot = arr.splice(pivotIndex, 1)[0];
  let left = [];
  let right = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] <= pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return quickSort(left).concat([pivot], quickSort(right));
}
```

### 插入排序

```javascript
function insertSort(arr){
  const len = arr.length;
  let preIndex,current;
  for(let i=1;i<len;i++){
    preIndex = i - 1;
    current = arr[i];
    while(preIndex >= 0 && arr[preIndex] > current){
      arr[preIndex + 1] = arr[preIndex];
      preIndex--;
    }
    arr[preIndex+1] = current;
  }
  return arr;
}
```

