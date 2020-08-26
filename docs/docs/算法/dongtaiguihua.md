# 动态规划

### 核心

动态规划的核心就是穷举。

动态规划的问题存在 **重叠子问题**，而且一定具备 **最优子结构**。

解决：列出**状态转移方程**。

明确base case -> 明确 「状态」-> 明确 「选择」-> 定义dp数组/函数的含义。

### 框架

```python
# 初始化 base case
dp[0][0][...] = base
# 进行状态转移
for 状态1 in 状态1的所有取值：
    for 状态2 in 状态2的所有取值：
        for ...
            dp[状态1][状态2][...] = 求最值(选择1，选择2...)
```

### 举例

#### 1. 斐波那契数列

- 一般写法

```c
int fib(int N){
	if(N==1 || N==2)return 1;
	return fib(N-1) + fib(N-2);
}
```

这个写法很通用，但是重复计算了很多无用节点，就是说想要计算原问题 `f(20)`，我就得先计算出子问题 `f(19)` 和 `f(18)`，然后要计算 `f(19)`，我就要先算出子问题 `f(18)` 和 `f(17)`，以此类推。最后遇到 `f(1)` 或者 `f(2)` 的时候，结果已知，就能直接返回结果，递归树不再向下生长了。

- 解决方法

  备忘录递归

  使用一个数组或者map记录已经计算过的节点

  ```javascript
  function fib(n) {
    if (n < 1) return 0;
    let helpArr = new Map();
    return helper(n, helpArr);
  }
  
  const helper = function (n, arr) {
    if (n == 1 || n == 2) return 1;
    if (arr.get(n)) return arr.get(n);
    const next = helper(n - 1, arr) + helper(n - 1, arr);
    arr.set(n, next);
    return next;
  };
  
  console.log(fib(10));
  ```

#### 2. 凑零钱问题

给你 `k` 种面值的硬币，面值分别为 `c1, c2 ... ck`，每种硬币的数量无限，再给一个总金额 `amount`，问你**最少**需要几枚硬币凑出这个金额，如果不可能凑出，算法返回 -1 。这种问题其实就是背包问题，从剩下的状态里选择最优的状态集合。

![](http://image.cocoroise.cn/20200814085315.png)

```javascript
function coinChange(coins, amount) {
  let dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

let arr = [1, 2, 5];
console.log(coinChange(arr, 11));
```

#### 3. 跳跃游戏

给定一个非负整数数组，你最初位于数组的第一个位置。

数组中的每个元素代表你在该位置可以跳跃的最大长度。

判断你是否能够到达最后一个位置。

```
输入: [2,3,1,1,4]
输出: true
解释: 我们可以先跳 1 步，从位置 0 到达 位置 1, 然后再从位置 1 跳 3 步到达最后一个位置。
```

**解答**

```javascript
function canJump(nums){
	let jump=0;
  const len = nums.length;
  for(let i=0;i<len-1;i++){
    jump = Math.max(jump,i+nums[i]);
    if(jump <= i) return false;
  }
  return jump>=len-1;
}
```

#### 4. 打家劫舍

https://leetcode-cn.com/problems/house-robber/

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。

```
输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。
```

经典的动态规划题目，弄清楚状态转移方程，然后再使用备忘录做优化。

```javascript
/*
 * @lc app=leetcode.cn id=198 lang=javascript
 *
 * [198] 打家劫舍
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
let memo = undefined;

const rob = function (nums) {
  memo = new Array(nums.length).fill(-1);
  return dp(nums, 0);
};

function dp(nums, start) {
  if (start >= nums.length) {
    return 0;
  }
  if (memo[start] != -1) return memo[start];
  let res = Math.max(dp(nums, start + 1), nums[start] + dp(nums, start + 2));
  memo[start] = res;
  return res;
}

// @lc code=end
```

