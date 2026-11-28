---
title: JVM、JRE、JDK 与 Java 跨平台机制：从 .class 到编译解释共存
categories:
  - 后端筑基
tags:
  - Java基础
  - JVM
  - 八股
date: 2026-11-24 21:27:07
description: 复习 JavaGuide 中 JVM 基础：JVM/JRE/JDK 的关系、JDK9 模块化与 jlink、.class 与跨平台、JVM 规范与实现，以及编译与解释共存。
keywords:
  - JVM
  - JRE
  - JDK
  - 跨平台
  - JIT
toc: true
---

## 一、JVM、JRE、JDK 的包含关系

今天复习 JavaGuide 的 Java 基础内容，先看了 JVM、JRE、JDK 的讲解。简单来说，它们之间是包含关系，需要先知道它们分别是什么。

- **JVM**：Java 虚拟机，负责运行 Java 字节码。
- **JRE**：Java 运行环境，包含 JVM 以及运行 Java 程序所需的环境。
- **JDK**：Java 开发工具包，包含 JRE，以及开发和编译 Java 程序所需的工具。

需要注意的是，到了 **JDK9**，并不需要再死记 JDK 与 JRE 的包含关系了。JDK 被重新组装成 **94 个模块**，模块系统和 `jlink` 工具取而代之。甚至到了 **JDK11** 开始，JRE 也不再被 Oracle 单独提供下载。

## 二、JVM 是什么，解决什么问题

重点讲解的是 JVM 机制。JVM 是什么、用来解决什么问题、又是怎么实现的，是这一部分的主线。

JVM 可以理解为运行 Java 字节码的虚拟机。Java 程序并不是直接把源码交给操作系统运行，而是先经过编译得到字节码，再由 JVM 负责执行。这样做的核心价值之一，就是让同一份字节码可以在不同平台上运行。

大致流程如下：

![](/img/JVM.drawio.png)

也就是说，`.java` 源码先被 `javac` 编译为含有字节码的 `.class` 文件，然后由 JVM 针对不同平台的机器，用解释器解释，或者用编译器（JIT）编译成机器码来运行。

这体现了 Java 面对不同平台时的适应方式：**只要同一份 Java 源码编译出来的 `.class` 是同一份，就可以利用 JVM 实现跨平台。**

## 三、`.class` 不只属于 Java

从流程往前看，会涉及到 `.class` 文件。这里有一个容易忽略的点：并不是只有 Java 语言可以用 `javac` 把源码编译成 `.class`。

其他不同编程语言，例如 Java、Groovy、Kotlin、JRuby、Clojure 等，也可以通过各自的编译器编译成 `.class` 文件，并最终通过 JVM 在不同平台（Windows、Mac、Linux）上运行。

图解如下:
![](/img/class.drawio.png)

## 四、JVM 规范与不同实现

JVM 并不是只有一种。只要满足 JVM 规范，每个公司、组织甚至个人都可以有自己的 JVM 实现。例如 HotSpot 就是 JVM 规范的一种实现。

所以这里要区分两个层次：

- **JVM 规范**：规定 JVM 应该具备什么行为。
- **JVM 实现**：具体厂商或组织按照规范做出的虚拟机，例如 HotSpot。

## 五、编译与解释共存

一开始提到的编译和解释，其实是 Java 的一个特点，即**编译与解释共存**。

简单理解：

- **编译型语言**：在运行前整体编译成机器码，再执行。
- **解释型语言**：运行时逐行解释执行。

Java 先编译成字节码，再由 JVM 解释执行或通过 JIT 编译成机器码执行，因此体现出编译与解释共存的特点。

图解如下:
![](/img/JieShiORBianYi.drawio.png)

## 小结

今天这部分八股的主线是：JVM/JRE/JDK 的关系要清楚，JDK9 之后模块系统和 `jlink` 带来了变化；Java 跨平台依赖同一份 `.class` 和 JVM；`.class` 不是 Java 专属；JVM 有规范也有不同实现；Java 的执行方式是编译与解释共存。
