# 搜索

### 1. 二分查找

区间对半找。

搜索区间：[left,right]

**关键**：

- while(left<=right)
- left = mid -1
- right = mid +1

```javascript
function binarySearch(nums,target){
  let left=0,right=nums.length-1;
  while(left<=right){
    let mid = left + (right - left) / 2;
    if(nums[mid] < target){
      left = mid -1;
    }else if(nums[mid] > target){
      right = mid +1;
    }else if(nums[mid] == target){
      return mid;
    }
  }
  return -1;
}
```

### 2. 最长回文子串

https://leetcode-cn.com/problems/longest-palindromic-substring/

给定一个字符串 `s`，找到 `s` 中最长的回文子串。你可以假设 `s` 的最大长度为 1000。

```
输入: "babad"
输出: "bab"
注意: "aba" 也是一个有效答案。
```

**思路：**从中间开始向两边扩散来判断回文串

```
for 0 <= i < len(s):
    奇数回文串 - 找到以 s[i] 为中心的回文串
    偶数回文串 - 找到以 s[i] 和 s[i+1] 为中心的回文串
    更新答案
```

**答案：**

```javascript
/*
 * @lc app=leetcode.cn id=5 lang=javascript
 *
 * [5] 最长回文子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string}
 */
const longestPalindrome = function (s) {
  let res = "";
  for (let i = 0; i < s.length; i++) {
    let s1 = palindrome(s, i, i);
    let s2 = palindrome(s, i, i + 1);
    res = res.length > s1.length ? res : s1;
    res = res.length > s2.length ? res : s2;
  }
  return res;
};

function palindrome(s, left, right) {
  while (left >= 0 && right < s.length && s[left] == s[right]) {
    left--;
    right++;
  }
  return s.substr(left + 1, right - left - 1);
}

// @lc code=end
```

### 3. TwoSum

给你一个数组和一个整数`target`，可以保证数组中**存在**两个数的和为`target`，请你返回这两个数的索引。

比如输入`nums = [3,1,3,6],target = 6`，算法应该返回数组`[0,2]`，因为 3 + 3 = 6。

**思路：**先排序，然后使用二分查找，两边向中间缩小范围。

**答案：**

```javascript
function twoSum(nums,target){
  if(nums.length === 0)return 0;
  nums.sort((a,b) => {return a - b});
  let left = 0,right = nums.length - 1;
  while(left < right){
    let sum = nums[left] + nums[right];
    if(sum == target){
      return [left, right]
    }else if(sum > target){
      right --;
    }else if(sum < target){
      left ++;
    }
  }
  return [-1, -1];
}
```

