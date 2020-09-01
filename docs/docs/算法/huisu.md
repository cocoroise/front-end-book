# 回溯

### 框架

```python
def backtrack(路径, 选择列表):
    if 满足结束条件:
        result.add(路径)
        return

    for 选择 in 选择列表:
        做选择
        backtrack(路径, 选择列表)
        撤销选择
```

在递归之前做选择，在递归之后撤销刚才的选择，就能得到正确的每个节点的选择列表和路径。

### 题目

#### 1. 解数独

https://leetcode-cn.com/problems/sudoku-solver/

编写一个程序，通过已填充的空格来解决数独问题。一个数独的解法需遵循如下规则：

数字 1-9 在每一行只能出现一次。
数字 1-9 在每一列只能出现一次。
数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。
空白格用 '.' 表示。

**解法**

```javascript
/*
 * @lc app=leetcode.cn id=37 lang=javascript
 *
 * [37] 解数独
 */

// @lc code=start
/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
const solveSudoku = function (board) {
  help(board, 0, 0);
  return board;
};
function help(board, i, j) {
  const m = 9,
    n = 9;
  // 最后一列 换下一行
  if (j == n) {
    return help(board, i + 1, 0);
  }
  // 最后一行了 已经找到了可行解
  if (i == m) {
    return true;
  }
  if (board[i][j] != ".") {
    return help(board, i, j + 1);
  }
  for (let ch = 1; ch <= 9; ch++) {
    // 不符合的数字
    if (!isValid(board, i, j, ch)) {
      continue;
    }
    // 做选择
    board[i][j] = ch + "";
    if (help(board, i, j + 1)) {
      return true;
    }
    // 撤销选择
    board[i][j] = ".";
  }
  return false;
}
function isValid(board, r, c, n) {
  for (let i = 0; i < 9; i++) {
    // 行重复
    if (board[r][i] == n) return false;
    // 列重复
    if (board[i][c] == n) return false;
    // 对角线重复
    const row = Math.floor(r / 3) * 3 + Math.floor(i / 3);
    const col = Math.floor(c / 3) * 3 + (i % 3);
    if (board[row][col] == n) {
      return false;
    }
  }
  return true;
}
// @lc code=end
```

#### 2. 全排列

https://leetcode-cn.com/problems/permutations/

给定一个 **没有重复** 数字的序列，返回其所有可能的全排列。

```
输入: [1,2,3]
输出:
[
  [1,2,3],
  [1,3,2],
  [2,1,3],
  [2,3,1],
  [3,1,2],
  [3,2,1]
]
```

做选择：选择1,2,3

撤回 track.pop()

**答案：**

```javascript
/*
 * @lc app=leetcode.cn id=46 lang=javascript
 *
 * [46] 全排列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
const permute = function (nums) {
  let res = [];// 保存结果
  let track = []; // 保存当前的排列
  help(nums, res, track);
  return res;
};
function help(nums, res, track) {
  // 结束条件
  if (track.length == nums.length) {
    let tmp = track.slice(); // 拷贝一份数组 不然最后都是空值
    res.push(tmp);
  }
  // 做选择
  for (let i = 0; i < nums.length; i++) {
    if (track.includes(nums[i])) {
      continue;
    }
    track.push(nums[i]);
    help(nums, res, track);
    track.pop();
  }
}
// @lc code=end
```

#### 3. 组合总和2

第40题：https://leetcode-cn.com/problems/combination-sum-ii/

给定一个数组 `candidates` 和一个目标数 `target` ，找出 `candidates` 中所有可以使数字和为 `target` 的组合。

`candidates` 中的每个数字在每个组合中只能使用一次。

```
输入: candidates = [10,1,2,7,6,1,5], target = 8,
所求解集为:
[
  [1, 7],
  [1, 2, 5],
  [2, 6],
  [1, 1, 6]
]
```

**思路：**

通用的回溯模版

剪枝是其中的关键步骤。能够有重复的值，但是又不能把重复的值给剪掉。

```javascript
这个避免重复当思想是在是太重要了。
这个方法最重要的作用是，可以让同一层级，不出现相同的元素。即
                  1
                 / \
                2   2  这种情况不会发生 但是却允许了不同层级之间的重复即：
               /     \
              5       5
                例2
                  1
                 /
                2      这种情况确是允许的
               /
              2  
                
为何会有这种神奇的效果呢？
首先 cur-1 == cur 是用于判定当前元素是否和之前元素相同的语句。这个语句就能砍掉例1。
可是问题来了，如果把所有当前与之前一个元素相同的都砍掉，那么例二的情况也会消失。 
因为当第二个2出现的时候，他就和前一个2相同了。
                
那么如何保留例2呢？
那么就用cur > begin 来避免这种情况，你发现例1中的两个2是处在同一个层级上的，
例2的两个2是处在不同层级上的。
在一个for循环中，所有被遍历到的数都是属于一个层级的。我们要让一个层级中，
必须出现且只出现一个2，那么就放过第一个出现重复的2，但不放过后面出现的2。
第一个出现的2的特点就是 cur == begin. 第二个出现的2 特点是cur > begin.
```

**答案：**

```javascript
function combinationSum2(candidates,target){
  if(candidates.length===0)return [];
  candidates = candidates.sort((a,b)=>{return a-b});
  let res=[];
  const backtrack = function(i,sum,track){
    // 满足条件
    if(sum === target){
      res.push(track);
      return;
    }
    // 选择
    for(let j=i;j<candidates.length;j++){
      if(sum + candidates[j] > target)break;
      if(j>i && candidates[j] === candidates[j-1])continue;
      
      backtrack(j+1,sum+candidates[j],[...list,candidates[j]])
    }
  }
  backtrack(0,0,[]);
  return res;
}
```

