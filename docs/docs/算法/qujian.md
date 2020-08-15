# 区间问题

### 思路

先排序，然后观察规律。

### 题目

#### 1. 合并区间

https://leetcode-cn.com/problems/merge-intervals/

给出一个区间的集合，请合并所有重叠的区间。

```
示例 1:

输入: intervals = [[1,3],[2,6],[8,10],[15,18]]
输出: [[1,6],[8,10],[15,18]]
解释: 区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].
```

**题解**

```javascript
const merge = function (intervals) {
  const res = [];
  if (intervals.length <= 0) return [];
  intervals.sort((a, b) => {
    return a[0] - b[0];
  });
  res.push(intervals[0]);

  for (let i = 1; i < intervals.length; i++) {
    // 不相交，直接push
    if (intervals[i][0] > res[res.length - 1][1]) {
      res.push(intervals[i]);
    } else if (intervals[i][1] > res[res.length - 1][1]) {
      // 改变res的右边界
      res[res.length - 1][1] = intervals[i][1];
    }
  }
  return res;
};
```

