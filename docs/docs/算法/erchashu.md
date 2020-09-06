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

二叉搜索树的特点：中序遍历是升序数组。

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


#### 5. 判断二叉树路径总和

给定一个二叉树和一个目标和，判断该树中是否存在根节点到叶子节点的路径，这条路径上所有节点值相加等于目标和。

**说明:** 叶子节点是指没有子节点的节点。

**示例：**

给定如下二叉树，以及目标和 `sum = 22`，返回 `true`, 因为存在目标和为 22 的根节点到叶子节点的路径 `5->4->11->2`。

```
              5
             / \
            4   8
           /   / \
          11  13  4
         /  \      \
        7    2      1
```

**思路：**简单的递归二叉树，从sum开始减少，到最后如果在叶子结点上减剩的值等于那个值，那就说明有这样的一个路径。

```javascript
/*
 * @lc app=leetcode.cn id=112 lang=javascript
 *
 * [112] 路径总和
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
 * @param {number} sum
 * @return {boolean}
 */
const hasPathSum = function (root, sum) {
  if (root === null) return false;
  if (root.left == null && root.right == null) {
    return sum == root.val;
  }

  return (
    hasPathSum(root.left, sum - root.val) ||
    hasPathSum(root.right, sum - root.val)
  );
};

// @lc code=end
```

#### 6. 遍历二叉树

给你一个二叉树，请你返回其按 **层序遍历** 得到的节点值。 （即逐层地，从左到右访问所有节点）。

```
示例：二叉树：[3,9,20,null,null,15,7],

    3
   / \
  9  20
    /  \
   15   7
```

答案：

```javascript
const levelOrder = function(root) {
    const ret = [];
    if (!root) return ret;

    const q = [];
    q.push(root);
    while (q.length !== 0) {
        const currentLevelSize = q.length;
        ret.push([]);
        for (let i = 1; i <= currentLevelSize; ++i) {
            const node = q.shift();
            ret[ret.length - 1].push(node.val);
            if (node.left) q.push(node.left);
            if (node.right) q.push(node.right);
        }
    }
        
    return ret;
};
```

#### 7. 镜像二叉树

https://leetcode-cn.com/problems/dui-cheng-de-er-cha-shu-lcof/

给定一个二叉树，检查它是否是镜像对称的。

例如，二叉树 `[1,2,2,3,4,4,3]` 是对称的。

```
    1
   / \
  2   2
 / \ / \
3  4 4  3
```

递归遍历判断

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isSymmetric = function(root) {
   if(root==null)return true;
   return help(root.left,root.right);
};
function help(left,right){
    if(left==null && right==null) return true;
    if(left==null || right==null || left.val != right.val) return false;
    return help(left.left,right.right) && help(left.right,right.left);
}
```

#### 8. 重构二叉树

重构题目的思路在于：熟悉遍历的流程

**前序遍历**的形式总是根节点总是前序遍历中的第一个节点。

```
[ 根节点, [左子树的前序遍历结果], [右子树的前序遍历结果] ]
```


而**中序遍历**的形式总是

```
[ [左子树的中序遍历结果], 根节点, [右子树的中序遍历结果] ]
```

**后序遍历**的形式是

```
[ [左子树的中序遍历结果], [右子树的中序遍历结果], 根节点 ]
```

只要能通过两个结果递归的找到根节点的位置，就能够还原任意一颗二叉树。

从前序或者后序找到根节点的位置，然后切割中序遍历的数组。

递归结束条件就是中序遍历的数组为空。

- 给出前序遍历和中序遍历，构造二叉树

  ```
  前序遍历 preorder = [3,9,20,15,7]
  中序遍历 inorder = [9,3,15,20,7]
  结果：
      3
     / \
    9  20
      /  \
     15   7
  ```

  答案：

  ```javascript
  const buildTree = function (preorder, inorder) {
    if (inorder.length === 0) return null;
    let res = new TreeNode(preorder[0]);
    let index = inorder.indexOf(preorder[0]); // 最重要的一步，找根节点
    res.left = buildTree(preorder.slice(1, index + 1), inorder.slice(0, index));
    res.right = buildTree(preorder.slice(index + 1), inorder.slice(index + 1));
    return res;
  };
  ```

- 给出中序遍历和后序遍历，构造二叉树

  ```
  中序遍历 inorder = [9,3,15,20,7]
  后序遍历 postorder = [9,15,7,20,3]
  结果：
      3
     / \
    9  20
      /  \
     15   7
  ```

  答案：

  ```javascript
  var buildTree = function (inorder, postorder) {
    if (inorder.length === 0) return null;
    let value = postorder[postorder.length - 1];
    let root = new TreeNode(value);
    let mid = inorder.indexOf(value);
  
    root.left = buildTree(inorder.slice(0, mid), postorder.slice(0, mid));
    root.right = buildTree(
      inorder.slice(mid + 1),
      postorder.slice(mid, postorder.length - 1)
    );
    return root;
  };
  ```

  

