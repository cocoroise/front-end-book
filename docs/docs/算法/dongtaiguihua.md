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

#### 斐波那契数列

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

#### 凑零钱问题

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

