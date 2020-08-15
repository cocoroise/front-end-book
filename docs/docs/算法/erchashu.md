# 二叉树

### 框架

```
function traverse(root){
  // 前序遍历
	traverse(root.left);
	// 中序遍历
	traverse(root.right);
	// 后序遍历
}
```

### 题目

#### 1. 二叉树的序列化和反序列化

```
题目：你可以将以下二叉树：

    1
   / \
  2   3
     / \
    4   5

序列化为 "[1,2,3,null,null,4,5]"
```

```javascript
/*
 * @lc app=leetcode.cn id=297 lang=javascript
 *
 * [297] 二叉树的序列化与反序列化
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
 * Encodes a tree to a single string.
 *
 * @param {TreeNode} root
 * @return {string}
 */
var serialize = function (root) {
  let result = [];
  helper(root, result);
  return JSON.stringify(result);
};

function helper(root, result) {
  if (!root) return result.push("#");
  result.push(root.val);
  helper(root.left, result);
  helper(root.right, result);
}

/**
 * Decodes your encoded data to tree.
 *
 * @param {string} data
 * @return {TreeNode}
 */
// 反序列化
var deserialize = function (data) {
  data = JSON.parse(data);
  return helper2(data);
};

function helper2(data) {
  const val = data.shift();
  if (val === "#") return null;
  const root = new TreeNode(val);
  root.left = helper2(data);
  root.right = helper2(data);
  return root;
}

/**
 * Your functions will be called as such:
 * deserialize(serialize(root));
 */
// @lc code=end
```

#### 2. 二叉树的最近公共祖先

给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。

[百度百科](https://baike.baidu.com/item/最近公共祖先/8918834?fr=aladdin)中最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（**一个节点也可以是它自己的祖先**）。”

<img src="http://image.cocoroise.cn/20200814151819.png" style="zoom:50%;" />



p 和 qq 在 root 的子树中，且分列 root 的 异侧（即分别在左、右子树中）；

1. p = root,p=root ，且 qq 在 root 的左或右子树中；
2. q = root,q=root ，且 pp 在 root 的左或右子树中；

```javascript
/*
 * @lc app=leetcode.cn id=236 lang=javascript
 *
 * [236] 二叉树的最近公共祖先
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
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function (root, p, q) {
  if (root == null) return null;
  if (root == p || root == q) return root;
  let left = lowestCommonAncestor(root.left, p, q);
  let right = lowestCommonAncestor(root.right, p, q);
  if (left != null && right != null) {
    return root;
  }
  if (left == null && right == null) {
    return null;
  }
  return left == null ? right : left;
};
// @lc code=end
```

#### 3. 判断两颗树是否相同

```javascript
const isSameTree = function (p, q) {
  if (p == null && q == null) return true;
  if (p == null || q == null) return false;
  if (p.val != q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};
```

#### 4. 二叉搜索树

⼆叉搜索树（Binary Search Tree，简称 BST）是⼀种很常⽤的的⼆叉树。它 的定义是：⼀个⼆叉树中，任意节点的值要⼤于等于左⼦树所有节点的值，且要⼩于等于右边⼦树的所有节点的值。

<img src="http://image.cocoroise.cn/20200814165629.png" style="zoom:33%;" />

问题：实现BST的查找和插入操作，并需要判断一颗二叉树是否是正确的二叉搜索树。

1. 判断二叉搜索树

   ```javascript
   const isValidBST = function (root) {
     return helper(root, -Infinity, Infinity);
   };
   
   function helper(root, min, max) {
     if (root === null) return true;
     if (root.val >= max || root.val <= min) {
       return false;
     }
     // 左树，最小值是自己，最大值是根节点
     // 右树，最小值是根节点，最大值是自己
     return helper(root.left, min, root.val) && helper(root.right, root.val, max);
   }
   ```

2. BFS的查找优化

   利用搜索树的特性，我们可以比遍历更快的找到值在哪。类似于二分搜索，只不过这个数据结构换成了树，但是思想还是一样的。

   ```javascript
   // 如果值比要进入的节点大，就去右树，比节点小，就去左树
   function isInBFS(root, target) {
     if (!root) return false;
     if (root.val === target) return true;
     if (target < root.val) {
       isInBFS(root.left, target);
     } else {
       isInBFS(root.right, target);
     }
   }
   ```

3. 插入一个数

   ```javascript
   function insertIntoBST(root, target) {
     if (root===null) return new TreeNode(target);
     if (root.val === target) return true;
     if (target < root.val) {
       insertIntoBST(root.left, target);
     } else {
       insertIntoBST(root.right, target);
     }
     return root;
   }
   ```

   

