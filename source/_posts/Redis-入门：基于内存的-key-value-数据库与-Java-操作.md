---
title: Redis 入门：基于内存的 key-value 数据库与 Java 操作
categories:
  - 技术笔记
tags:
  - Redis
  - Java
keywords: 
  - Redis
  - key-value
  - RedisTemplate
  - 数据类型
  - 缓存
description: Redis 基础入门笔记，涵盖 Redis 的定位与特点、五种数据类型及使用场景、常用指令，以及 Java 中通过 RedisTemplate 操作 Redis 的步骤。
toc: true
date: 2026-11-26 20:03:30
---

## 一、Redis 是什么

Redis 是一个**基于内存的 key-value 结构数据库**。核心特点是基于内存存储、读写性能高，适合存放热点数据。相比传统磁盘数据库，它把数据放在内存里，用速度换容量，典型用途就是缓存。

## 二、数据类型与使用场景

Redis 提供多种数据类型，各自对应不同场景：

- **String**：最基础的类型，适合存单个值、计数器等；
- **Hash**：适合存对象，字段可单独读写；
- **List**：有序可重复，适合队列、消息列表；
- **Set**：无序不可重复，适合去重、集合运算；
- **ZSet（有序集合）**：带分数排序，适合排行榜类场景。

![](/img/Redis.png)

## 三、各类型常用指令

针对 Redis 的五种基础数据类型，以下是日常开发中最常用的指令及说明。在实际操作中，可以通过 `redis-cli` 或 Spring 的 `RedisTemplate` 来调用它们。

### String（字符串）
最基础的类型，常用于缓存对象、计数器等。

| 指令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `SET` | 设置指定 key 的值 | `SET username "Skiow"` |
| `GET` | 获取指定 key 的值 | `GET username` |
| `SETEX` | 设置 key 的值，并指定过期时间（秒） | `SETEX token 3600 "abc123"` |
| `SETNX` | 只有在 key 不存在时才设置 key 的值 | `SETNX lock "1"` |
| `INCR` | 将 key 中储存的数字值增一 | `INCR views` |

### Hash（哈希）
适合存储对象（如用户信息），可以单独对对象中的某个字段进行读写。

| 指令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `HSET` | 将哈希表 key 中的字段 field 的值设为 value | `HSET user:1 name "Skiow"` |
| `HGET` | 获取哈希表中指定字段的值 | `HGET user:1 name` |
| `HDEL` | 删除哈希表 key 中的一个或多个指定字段 | `HDEL user:1 name` |
| `HGETALL` | 获取哈希表中所有字段和值 | `HGETALL user:1` |

### List（列表）
简单的字符串列表，按插入顺序排序，常用于消息队列、最新列表等。

| 指令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `LPUSH` | 将一个或多个值插入到列表头部（左） | `LPUSH news "头条1"` |
| `RPUSH` | 将一个或多个值插入到列表尾部（右） | `RPUSH news "头条2"` |
| `LPOP` | 移出并获取列表的第一个元素 | `LPOP news` |
| `LRANGE` | 获取列表指定范围内的元素 | `LRANGE news 0 -1` (获取全部) |

### Set（集合）
无序且不可重复的集合，适合做去重、共同好友、交并集运算等。

| 指令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `SADD` | 向集合添加一个或多个成员 | `SADD tags "Java" "Redis"` |
| `SMEMBERS` | 返回集合中的所有成员 | `SMEMBERS tags` |
| `SISMEMBER` | 判断成员元素是否是集合的成员 | `SISMEMBER tags "Java"` |
| `SINTER` | 返回给定所有集合的交集 | `SINTER set1 set2` |

### ZSet（有序集合）
每个元素关联一个分数（score），按分数排序。适合做排行榜、带权重的队列等。

| 指令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `ZADD` | 向有序集合添加一个或多个成员，或更新已存在成员的分数 | `ZADD rank 100 "player1"` |
| `ZRANGE` | 通过索引区间返回有序集合指定区间内的成员（按分数升序） | `ZRANGE rank 0 -1 WITHSCORES` |
| `ZREVRANGE`| 返回有序集合中指定区间内的成员（按分数降序） | `ZREVRANGE rank 0 2` (获取Top3) |
| `ZINCRBY` | 有序集合中对指定成员的分数加上增量 increment | `ZINCRBY rank 50 "player1"` |

> **提示**：在 Java 中使用 `RedisTemplate` 操作时，通常会使用 `opsForValue()`、`opsForHash()`、`opsForList()`、`opsForSet()`、`opsForZSet()` 来分别对应上述五种数据类型的操作。

## 四、Java 中操作 Redis 的步骤

在 Java 里操作 Redis，流程是固定的四步：

1. 导入 Maven 坐标（依赖）；
2. 配置 Redis 数据源（地址、端口等）；
3. 编写配置类，创建 `RedisTemplate`；
4. 通过 `RedisTemplate` 对象操作 Redis。

`RedisTemplate` 就是 Java 侧操作 Redis 的统一入口，拿到它之后，各类数据结构的操作都通过它完成。