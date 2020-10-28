# 排序算法

### 通用数组交换

```javascript
function swap(array, left, right) {
    let rightValue = array[right]
    array[right] = array[left]
    array[left] = rightValue
}
```

### 冒泡O(n2)

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

### 快排O(N*logN)

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

### 选择排序O(n2)

第一次遍历n-1，找到最小的值和第一个数交换位置，

第二次遍历n-2，找到最小的和第二个值交换位置

```javascript
function selection(array) {
  if (!checkArray(array)) return
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      minIndex = array[j] < array[minIndex] ? j : minIndex;
    }
    swap(array, i, minIndex);
  }
  return array;
}
```

### 插入排序O(n2)

在要排序的一组数中，假定前n-1个数已经排好序，现在将第n个数插到前面的有序数列中，使得这n个数也是排好顺序的。如此反复循环，直到全部排好顺序。

```javascript
function insertion(array) {
  if (!checkArray(array)) return
  for (let i = 1; i < array.length; i++) {
    for (let j = i - 1; j >= 0 && array[j] > array[j + 1]; j--)
      swap(array, j, j + 1);
  }
  return array;
}
```

### 希尔排序

有步长的插入排序

```javascript
function shellSort(arr) {
    let len = arr.length;
    let temp, gap = 1;
    //确定步长
    while (gap < len / 3) {
        gap = gap * 3 + 1;
    }
    while (gap >= 1) {
        for (let i = gap; i < len; i++) {
            temp = arr[i];
            for (let j = i - gap; j >= 0 && arr[j] > temp; j -= gap) {
                arr[j + gap] = arr[j];
            }
            arr[j + gap] = temp;
        }
        //重置步长
        gap = (gap - 1) / 3;
    }
    return arr;
}
```

### 归并排序O(N*logN)

```javascript
function mergeSort(arr) {
    let len = arr.length;
    if (len < 2) {
        return arr;
    }
    let middle = Math.floor(len / 2);
    let left = arr.slice(0, middle);
    let right = arr.slice(middle);
    return merge(mergeSort(left), mergeSort(right));
}
function merge(left, right) {
    let result = [];
    while (left.length && right.length) {
        if (left[0] < right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }
    while (left.length) {
        result.push(left.shift());
    }
    while (right.length) {
        result.push(right.shift());
    }
    return result;
}
```

### 一些题目

1. 移动零到数组末尾

   ```javascript
   // 快慢指针，慢指针遇到非0前进一步，遇到0和快指针交换位置
   function moveZero(arr) {
     let i = 0
     let j = 0
     while (j < arr.length) {
       if (arr[i] !== 0) {
         i++
       } else if (arr[j] !== 0) {
         [arr[i], arr[j]] = [arr[j], arr[i]];
         i++
       }
       j++
     }
   }
   ```

   