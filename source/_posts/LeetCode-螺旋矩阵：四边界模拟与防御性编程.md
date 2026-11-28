---
use_abbrlink: true
title: LeetCode 螺旋矩阵：四边界模拟与防御性编程
categories:
  - 算法
  - LeetCode 题解
tags:
  - 数组
  - LeetCode
description: 用四个边界变量模拟螺旋矩阵遍历，并记录空指针与数组越界相关的防御性编程注意点。
keywords:
  - 螺旋矩阵
  - 四边界
  - 防御性编程
  - LeetCode
toc: true
abbrlink: ea5fd42e
date: 2026-11-24 21:40:04
---

## 一、题目思路：维护四个边界

今天做的算法题是螺旋矩阵。核心思路是维护四个变量，动态表示上、下、左、右四个边界。

通过四个边界控制每一轮遍历的范围，按顺序走完一条边后收缩对应边界，直到边界交叉为止。

## 二、遍历顺序与边界收缩

可以围绕四个边界来组织过程：

- 上边界：从左到右遍历
- 右边界：从上到下遍历
- 下边界：从右到左遍历
- 左边界：从下到上遍历

每走完一条边，就收缩对应的边界。循环过程中要保证边界不交叉，否则说明已经遍历完成。

## 三、防御性编程注意点

这道题除了模拟边界，还要注意防御性编程，尤其是空指针和数组越界异常。

实际写的时候需要先考虑矩阵为空、行列长度为 0 等情况，再进入边界遍历逻辑。循环条件也要严格围绕四个边界收缩来写，避免越界访问。

## 四、代码实现

```java
class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> list = new ArrayList<>();
        //重点:防御型编程
        if(matrix == null || matrix.length == 0 || matrix[0].length == 0){
            return list;
        }
        //维护四个变量，利用他们动态表示出边界
        int top = 0;
        int bottom = matrix.length - 1;
        int left = 0;
        int right = matrix[0].length - 1;
        while(top <= bottom && left <= right){
            //输出当前边界并判断是否
            for (int i = left; i <= right; i++) list.add(matrix[top][i]);
            //并且在输出下一个边界之前动态移动当前边界
            top++;
            //最终判断一下边界关系(即是否已经互相越过)
            if(top > bottom) break;

            for (int i = top; i <= bottom; i++) list.add(matrix[i][right]);
            right--;
            if(left > right) break;

            for (int i = right; i >= left; i--) list.add(matrix[bottom][i]);
            bottom--;
            if(top > bottom) break;

            for (int i = bottom; i >= top; i--) list.add(matrix[i][left]);
            left++;
            if(left > right) break;
        }
        return list;
        
    }
}
```

## 小结

螺旋矩阵的关键不是硬编码方向，而是用上下左右四个边界描述当前可走范围，并在每轮遍历后收缩边界。同时，边界类题目要特别注意空指针和数组越界。
