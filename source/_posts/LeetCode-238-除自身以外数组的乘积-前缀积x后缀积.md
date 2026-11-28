---
use_abbrlink: true
title: 'LeetCode 238.除自身以外数组的乘积:前缀积x后缀积'
categories:
  - 算法
  - LeetCode 题解
tags:
  - 数组
  - LeetCode
abbrlink: fa71571e
date: 2026-11-22 18:03:20
---

## 题目
LeetCode 238. 除自身以外数组的乘积。
[题目链接](https://leetcode.cn/problems/product-of-array-except-self/)

## 思路
这道题要求不能用除法，且要在 O(n) 时间内完成。
核心公式是：**结果 = 当前元素左侧所有元素的乘积 × 右侧所有元素的乘积**。
我一开始想用两个数组分别存左积和右积，后来发现可以用一个动态变量来节省空间。

## 关键点
1. **端点处理**：第一个元素左侧乘积为 1，最后一个元素右侧乘积为 1。
2. 用动态变量 `leftProduct` / `rightProduct` 累积。
3. **进阶**：用输出数组本身当左积数组，省一个 O(n) 空间。

## 代码
这里贴我的 Java 代码：

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        
        // 第一次遍历：计算左侧乘积
        answer[0] = 1;
        //leftProduct = 1;
        for (int i = 1; i < n; i++) {
          //leftProduct = leftProduct * nums[i - 1];
          //answer[i] = leftProduct;
          answer[i] = answer[i - 1] * nums[i - 1];
        }
        
        // 第二次遍历：计算右侧乘积并得出最终结果
        //answer[nums.length - 1]右侧无任何元素，不需要管，或者说要乘1
        int rightProduct = 1;
        for (int i = n - 2; i >= 0; i--) {
            rightProduct = rightProduct * nums[i + 1];
            answer[i] = answer[i] * rightProduct;
        }
        return answer;
    }
}
```

## 复杂度
- 时间复杂度：O(n)，其中 n 是数组长度。两次遍历数组。
- 空间复杂度：O(1)，如果不算输出数组的话，只用了常数个变量。
