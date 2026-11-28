---
use_abbrlink: true
title: 从暴力遍历到阶梯搜索：LeetCode 240 二维矩阵查找
categories:
  - 算法
  - LeetCode 题解
tags:
  - 矩阵
  - LeetCode
keywords:
  - LeetCode 240
  - 搜索二维矩阵
  - 阶梯搜索
  - 矩阵查找
description: 记录 LeetCode 240 的解题过程，从暴力遍历到利用矩阵整体升序特性的阶梯搜索，重点分析端点选择背后的逻辑推导。
toc: true
abbrlink: cda2b504
date: 2026-11-26 19:46:35
---

## 题目回顾

LeetCode 240. 搜索二维矩阵 II：给定一个二维矩阵，每行从左到右升序、每列从上到下升序，判断目标值是否存在于矩阵中。

## 第一反应：暴力遍历

最直接的做法是两层循环遍历每一个元素，逐个比较。时间复杂度 O(m×n)，完全没有利用矩阵"行升序、列升序"的特性。能过，但并不高效。

## 关键洞察：为什么左上角/右下角不行

矩阵的二维整体升序意味着：对于左上角元素，向下和向右都在变大；对于右下角元素，向上和向左都在变小。这两个端点的两个可移动方向**变化方向一致**，无法根据目标值与当前值的比较结果排除任何一行或一列，于是只能退回遍历。

真正有用的端点，必须满足：**两个可移动方向，一个方向数字全变大，另一个方向全变小**。右上角和左下角正好满足。

## 阶梯搜索：选右上角作为端点

以右上角 `matrix[top][right]` 为例：

- 如果 `target == current`，直接命中；
- 如果 `target > current`：target 比当前行最大值还大，说明目标不在这一行，`top++` 向下收缩；
- 如果 `target < current`：target 比当前列最小值还小，说明目标不在这一列，`right--` 向左收缩。

每步都能确定性地排除一行或一列，边界动态收缩，直到边界交叉。

## 防御型编程与边界维护

进入循环前先做防御性判断：矩阵为 null、行数为 0、列数为 0 时直接返回 false。然后用 `top / bottom / left / right` 四个变量动态维护边界，循环条件为 `top <= bottom && left <= right`。

## 完整代码

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        // 利用矩阵的整体二维升序，
        // 找出一个端点，它的两个可移动方向，一个方向数字全变大，另一个方向全变小
        // 再根据这个端点在对应行列是最大最小而判断 target 是否可能在此行列，不可能就跳过

        // 重点：防御型编程
        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) return false;

        // 维护四个变量，利用它们动态表示边界
        int top = 0;
        int bottom = matrix.length - 1;
        int left = 0;
        int right = matrix[0].length - 1;

        while (top <= bottom && left <= right) {
            int current = matrix[top][right];
            if (target == current) {
                return true;
            } else if (target > current) {
                // target 比当前行最大值还大，说明不在这一行
                top++;
            } else {
                // target 比当前列最小值还小，说明不在这一列
                right--;
            }
        }
        return false;
    }
}
```

## 复杂度与总结

时间 O(m+n)，每步排除一行或一列；空间 O(1)，只用了四个边界变量。核心收获：**端点选择不是随手挑的，而是由"能否根据比较结果排除整行/整列"这个逻辑倒推出来的**。
