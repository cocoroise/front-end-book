# BFS - 广度优先搜索

问题的本质就 是让你在⼀幅「**图**」中找到从**起点 start 到终点 target 的最短距离。**

核心思想：抽象成图，从一个点开始，向四周扩散。一般写BFS都是用**队列**这种数据结构，每次把一个节点周围的所有节点加入队列。

BFS和DFS最主要的差别就是：BFS找到的路径一定是**最短**的，代价就是空间复杂度比DFS大很多。

### 框架

```c
// 计算从起点 start 到终点 target 的最近距离 
int BFS(Node start, Node target) { 
	Queue<Node> q; // 核⼼数据结构
  Set<Node> visited; // 避免⾛回头路 
  q.offer(start); // 将起点加⼊队列 
  visited.add(start); 
  int step = 0; // 记录扩散的步数 
  while (q not empty) {
    int sz = q.size(); /* 将当前队列中的所有节点向四周扩散 */
    for (int i = 0; i < sz; i++) { 
      Node cur = q.poll(); /* 划重点：这⾥判断是否到达终点 */
      if (cur is target) return step; 
      /* 将 cur 的相邻节点加⼊队列 */ 
      for (Node x : cur.adj()) 
        if (x not in visited) { 
          q.offer(x); visited.add(x); 
        } 
    }
    /* 划重点：更新步数在这⾥ */ 
    step++; 
  }
}
```

### 题目

#### 1. 二叉树的最小深度

https://leetcode-cn.com/problems/minimum-depth-of-binary-tree/

**题目：**

给定一个二叉树，找出其最小深度。

最小深度是从根节点到最近叶子节点的最短路径上的节点数量。

说明: 叶子节点是指没有子节点的节点。

**示例：**

给定二叉树 [3,9,20,null,null,15,7],

```
   3
   / \
  9  20
    /  \
   15   7
```

返回它的最小深度  2。

**思路：**起点就是root根节点，终点就是最靠近根节点的那个叶子节点，这个叶子节点的特征就是左右两个子节点都为空。

用一个队列存储所有的节点，遇到了条件就返回深度，没遇到就把周围的所有节点都放入队列里面。

**答案：**

```javascript
/*
 * @lc app=leetcode.cn id=111 lang=javascript
 *
 * [111] 二叉树的最小深度
 */

// @lc code=start
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
const minDepth = function (root) {
  if (root == null) return 0;
  let q = []; // 储存节点的队列
  q.push(root);
  let depth = 1;

  while (q.length !== 0) {
    let size = q.length;
    for (let i = 0; i < size; i++) {
      let cur = q.shift();
      // 到达终点
      if (cur.left == null && cur.right == null) {
        return depth;
      }
      if (cur.left != null) {
        q.push(cur.left);
      }
      if (cur.right != null) {
        q.push(cur.right);
      }
    }
    depth++;
  }
  return depth;
};
// @lc code=end
```

