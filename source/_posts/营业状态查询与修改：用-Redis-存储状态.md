---
use_abbrlink: true
title: 营业状态查询与修改：用 Redis 存储状态
categories:
  - 项目实战
  - 外卖管理系统
tags:
  - 外卖管理
  - Redis
  - Spring Boot
keywords:
  - 营业状态
  - Redis
  - Controller
  - 别名
  - 接口重名
description: 记录营业状态查询与修改功能的开发，状态采用 Redis 存储，以及商家端与客户端 Controller 重名时通过别名区分的处理。
toc: true
abbrlink: d1134714
date: 2026-11-26 20:42:47
---

## 功能背景

本次开发营业状态的查询与修改功能：商家端可以修改营业状态，客户端可以查询当前营业状态。状态是典型的热点数据，读写频繁、结构简单，正适合用 Redis 存储。

## 状态用 Redis 存储

营业状态本质上就是一个简单的键值，存进 Redis 后读写性能高，也避免了频繁打数据库。这也正好呼应了 Redis 适合存热点数据的定位。

## 踩坑：两端 Controller 重名

运行时发现一个问题：商家端和客户端的接口类**都叫** `ShopController`，名字重复会导致冲突。解决办法是给它们加上别名加以区分，保证两个 Controller 能共存并被正确加载。

## 小结

- 热点、简单的状态数据放 Redis，读写快；
- 同类接口在不同端出现时，注意类名冲突，用别名区分。
