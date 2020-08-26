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

