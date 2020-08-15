# 单调栈和单调队列

### 单调栈

单调栈⽤途不太⼴泛，只处理⼀种典型 的问题，叫做 **Next Greater Element**。

 Next Greater Number 的原始问题：给你⼀个数组，返回⼀个等 ⻓的数组，对应索引存储着下⼀个更⼤元素，如果没有更⼤的元素，就存 -1。不好⽤语⾔解释清楚，直接上⼀个例⼦： 

给你⼀个数组 [2,1,2,4,3]，你返回数组 [4,2,4,-1,-1]。 

解释：第⼀个 2 后⾯⽐ 2 ⼤的数是 4; 1 后⾯⽐ 1 ⼤的数是 2；第⼆个 2 后⾯ ⽐ 2 ⼤的数是 4; 4 后⾯没有⽐ 4 ⼤的数，填 -1；3 后⾯没有⽐ 3 ⼤的数，填 -1。

<img src="http://image.cocoroise.cn/20200815172213.png" style="zoom:50%;" />

#### 解答模版

https://leetcode-cn.com/problems/next-greater-element-ii/

先是没有循环的单调栈

```javascript
const nextGreaterElements = function (nums) {
  let res = [];
  let stack = [];
  const len = nums.length - 1;
  for (let i = len; i >= 0; i--) {
    while (stack.length !== 0 && stack[stack.length - 1] <= nums[i]) {
      // 把比它矮的弹出去 没用了
      stack.pop();
    }
    res[i] = stack.length === 0 ? -1 : stack[stack.length - 1];
    stack.push(nums[i]);
  }
  return res;
};
```

然后加上循环的数组判断

利用整除来模仿循环数组 i%n

```javascript
const nextGreaterElements = function (nums) {
  let res = [];
  let stack = [];
  const len = nums.length;
  // 假装数组翻倍了
  for (let i = len * 2 - 1; i >= 0; i--) {
    while (stack.length !== 0 && stack[stack.length - 1] <= nums[i % len]) {
      // 把比它矮的弹出去 没用了
      stack.pop();
    }
    res[i % len] = stack.length === 0 ? -1 : stack[stack.length - 1];
    stack.push(nums[i % len]);
  }
  return res;
};
```

### 单调队列

其实单调队列就是⼀个「队列」，只 是使⽤了⼀点巧妙的⽅法，使得队列中的元素单调递增（或递减）。这个数 

据结构有什么⽤？可以解决**滑动窗⼝**的⼀系列问题。 

#### 题目

给定一个数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。

返回滑动窗口中的最大值。

进阶：

你能在线性时间复杂度内解决此题吗？

```
示例：
输入: nums = [1,3,-1,-3,5,3,6,7], 和 k = 3
输出: [3,3,5,5,6,7] 
解释: 

  滑动窗口的位置                最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```

#### 解析

双向队列

维持一个双向队列

- 每次push元素的时候，把队列里更小的元素删除
- 每次pop元素的时候，判断是否是头部的最大值，再删除一遍头部的元素即可

#### 实现

```javascript
/*
 * @lc app=leetcode.cn id=239 lang=javascript
 *
 * [239] 滑动窗口最大值
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
class slideWindow {
  constructor() {
    this.data = [];
  }
  push(val) {
    // 队列里有更小元素的时候应该被出队
    // 这样队头的那个肯定是最大值
    while (this.data.length > 0 && this.data[this.data.length - 1] < val) {
      this.data.pop();
    }
    this.data.push(val);
  }
  pop(val) {
    if (this.data.length > 0 && this.data[0] == val) {
      this.data.shift();
    }
  }
  max() {
    return this.data[0];
  }
}
const maxSlidingWindow = function (nums, k) {
  let len = nums.length;
  let res = [];
  let windows = new slideWindow();
  for (let i = 0; i < len; i++) {
    if (i < k - 1) {
      windows.push(nums[i]);
    } else {
      windows.push(nums[i]);
      res.push(windows.max());
      windows.pop(nums[i - k + 1]);
    }
  }
  return res;
};
// @lc code=end
```

