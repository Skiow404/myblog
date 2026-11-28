---
use_abbrlink: true
title: 'LeetCode 160:相交链表——从零理解链表结构与双指针技巧'
categories:
  - 算法
  - LeetCode 题解
tags:
  - 链表
  - LeetCode
keywords: 'LeetCode 160, 相交链表, 链表基础, 双指针, 浪漫双指针, Java'
description: 记录 LeetCode 160 相交链表的两种解法，并基于 ListNode 的定义深入剖析链表在内存中的真实结构与串联过程。
toc: true
abbrlink: be6ecfd8
date: 2026-11-27 22:45:14
---

## 题目描述

[LeetCode 160. 相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/)

给你两个单链表的头节点 `headA` 和 `headB`，请你找出并返回两个单链表相交的起始节点。如果两个链表不存在相交节点，返回 `null`。

## 解题思路

对于这道题，虽然从字面上看是寻找相交节点，但正如我刚开始刷题时的感受，**这道题最重要的并不是思路本身（因为思路其实很直接），而是对链表定义的理解以及对链表操作细节的把控。**

针对题目本身，有两种常见的解法：

### 解法一：哈希集合法

直接利用哈希表。先遍历链表 A，将其中的所有节点存入哈希集合中。然后再遍历链表 B，判断当前节点是否在哈希集合中出现过。出现的第一个节点即为相交节点。

### 解法二：双指针法（浪漫双指针）

为了提高空间效率，可以使用双指针来实现 `O(1)` 的空间复杂度。

核心思想是：**你走你的路，走完走我的。**

让指针 `pA` 指向链表 A 的头节点，`pB` 指向链表 B 的头节点。它们同时向后移动，如果 `pA` 遍历完链表 A，就跳到链表 B 的头节点继续遍历；同理，`pB` 遍历完链表 B 就跳到链表 A。

这样，无论两个链表长度如何，两个指针走过的总路程始终是相同的（`a + c + b = b + c + a`）。如果它们有交点，必定会在相交节点处相遇；如果无交点，最终会同时走到 `null`，此时退出循环。

## 初识链表：从 ListNode 到内存模型

在写具体的代码之前，必须先彻底搞懂什么是链表。**类定义只是描述"一个节点长什么样"，而真正形成链表的，是实例化并串联节点的代码。**

### 链表节点的定义

```java
public class ListNode {
    int val;           // 节点中存储的数据，类型是 int
    ListNode next;     // 指向下一个节点的引用，类型是 ListNode 本身
    ListNode(int x) {
        val = x;
        next = null;   // 新节点的 next 默认为 null (后面还没接节点)
    }
}
```

通过这个类，我们就能实例化出一个节点。而链表的核心，就是节点通过 `next` 串联起来。最后一个节点的 `next` 为 `null`，表示链表结束。

### 链表在内存中是如何形成的？

我们来看下面这三行代码，这是真正让链表运转起来的魔法：

```java
ListNode head = new ListNode(1);
head.next = new ListNode(2);
head.next.next = new ListNode(3);
```

**第 1 行：** `new ListNode(1)` 在内存中创建一个节点对象，此时 `val = 1`，`next = null`。变量 `head` 保存的是这个对象的引用（即指向该节点的地址）。此时内存里：

```text
head ──> [val=1, next=null]
```

**第 2 行：** `new ListNode(2)` 又创建了一个新节点，`val = 2`，`next = null`。`head.next = ...` 的意思是，把 `head` 所指节点的 `next` 字段，赋值为这个新节点的引用。此时内存里：

```text
head ──> [val=1, next=●] ──> [val=2, next=null]
```

**第 3 行：** 同理，把第二个节点的 `next` 指向第三个节点 `new ListNode(3)`。此时内存里：

```text
head ──> [val=1, next=●] ──> [val=2, next=●] ──> [val=3, next=null]
```

这就是链表的本质——一堆内存中散落的节点，通过引用（指针）像铁链一样扣在一起。

## 代码实现

### 哈希集合法代码

```java
public class Solution {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        Set<ListNode> visited = new HashSet<>();

        // 遍历A链表，将节点存入Set
        ListNode temp = headA;
        while (temp != null) {
            visited.add(temp);
            temp = temp.next;
        }

        // 遍历B链表，寻找第一个在Set中的节点
        temp = headB;
        while (temp != null) {
            if (visited.contains(temp)) {
                return temp;
            }
            temp = temp.next;
        }

        return null;
    }
}
```

### 双指针（浪漫双指针）法代码

这里我保留了从 if-else 到三元运算符的推演过程，方便日后复习时回忆起当时的思考逻辑：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class Solution {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        if(headA == null || headB == null) return null;

        ListNode pA = headA;
        ListNode pB = headB;
        //只要不相遇或者不同时为null就一直走
        while(pA != pB){
            //走到头了
            /*if(pA == null){
                //走B的路
                pA = headB;
            }else{
                pA = pA.next;
            }*/
            pA = pA == null ? headB : pA.next;

            /*if(pB == null){
                //走B的路
                pB = headA;
            }else{
                pB = pB.next;
            }*/
            pB = pB == null ? headA : pB.next;
        }
        //返回交点或者null
        return pA;

    }
}
```

## 复杂度分析

**时间复杂度：**

- 哈希法：`O(m + n)`，其中 `m`、`n` 分别为链表 A 和 B 的长度。
- 双指针法：`O(m + n)`，在相交前两者最多各遍历两个链表的长度。

**空间复杂度：**

- 哈希法：`O(m)`，需要额外空间存储链表 A 的节点。
- 双指针法：`O(1)`，只需要常数级别的额外空间存放指针。
