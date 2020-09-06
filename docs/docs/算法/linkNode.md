# 链表

### 结构

```javascript
class ListNode{
	constructor(val,next){
		this.val = val;
		this.next = next;
	}
}
```

### 题目

#### 1. **反转单向链表**

```javascript
var reverseList = function(head) {
    // 判断下变量边界问题
    if (!head || !head.next) return head
    // 初始设置为空，因为第一个节点反转后就是尾部，尾部节点指向 null
    let pre = null
    let current = head
    let next
    // 判断当前节点是否为空
    // 不为空就先获取当前节点的下一节点
    // 然后把当前节点的 next 设为上一个节点
    // 然后把 current 设为下一个节点，pre 设为当前节点
    while(current) {
        next = current.next
        current.next = pre
        pre = current
        current = next
    }
    return pre
};
```

#### 2. 反转链表

https://leetcode-cn.com/problems/reverse-linked-list-ii/

反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。

说明:
1 ≤ m ≤ n ≤ 链表长度。

```
示例:

输入: 1->2->3->4->5->NULL, m = 2, n = 4
输出: 1->4->3->2->5->NULL
```

#### 解析

先写出递归反转前N个链表的函数，再等到第M个的时候，调用这个函数。

```javascript
/*
 * @lc app=leetcode.cn id=92 lang=javascript
 *
 * [92] 反转链表 II
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} m
 * @param {number} n
 * @return {ListNode}
 */
const reverseBetween = function (head, m, n) {
  if (m == 1) {
    // 反转的起点
    return reverseN(head, n);
  }
  head.next = reverseBetween(head.next, m - 1, n - 1);
  return head;
};
// 反转前n个节点
let node = undefined;
function reverseN(root, n) {
  if (n == 1) {
    node = root.next;
    return root;
  }
  let last = reverseN(root.next, n - 1);
  root.next.next = root;
  root.next = node;
  return last;
}
// @lc code=end
```

