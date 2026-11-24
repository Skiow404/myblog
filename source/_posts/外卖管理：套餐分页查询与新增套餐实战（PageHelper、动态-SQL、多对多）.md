---
title: 外卖管理：套餐分页查询与新增套餐实战（PageHelper、动态 SQL、多对多）
categories:
  - 项目实战
tags:
  - 外卖管理
  - MyBatis
  - PageHelper
  - Spring Boot
description: 回顾外卖套餐分页查询与新增套餐业务，重点整理 PageHelper 的 ThreadLocal 分页机制、动态 SQL 条件查询，以及套餐与菜品多对多关系的新增流程。
keywords:
  - 外卖管理
  - PageHelper
  - 动态SQL
  - 多对多
  - SetmealVO
toc: true
date: 2026-11-24 21:50:29
---

## 本文大纲

- 背景：新增套餐、菜品起售停售、套餐分页查询
- 套餐分页查询：PageHelper 的使用
- PageHelper 的 ThreadLocal 注意点
- Mapper XML 与动态 SQL
- 新增套餐业务与多对多关系
- 小结

## 一、背景

今天回顾了新增套餐、菜品起售停售、套餐分页查询的代码。菜品起售停售在对应文章有详细记录，这里详细解释套餐分页查询，并补充新增套餐业务中的核心逻辑。

## 二、套餐分页查询：PageHelper 的使用

套餐分页查询的业务具体实现利用了 PageHelper 插件。

先调用 `startPage` 方法，把页码和每页记录数传进去。这个插件的 `startPage` 方法利用的是 new 一个 `Page` 对象，把页码和每页记录数塞给 `ThreadLocal`。

这里有一个注意点：正因为使用了 `ThreadLocal`，`startPage` 之后紧跟的“第一条查询”才会被分页，中间不能插入别的查询，否则会被“截胡”。

调用 mapper 方法之后，返回值应该是一个 `Page<SetmealVo>` 对象，最后返回 `PageResult`。

## 三、Mapper XML 与动态 SQL

再详细说一下这里的 mapper 方法中写的 XML，也就是 SQL 语句：

```xml
select s.*,
       c.name as categoryName
from setmeal s
left join category c on s.category_id = c.id

<where>
    <if test="name != null">
        and s.name like CONCAT('%', #{name}, '%')
    </if>
    <if test="categoryId != null">
        and s.category_id = #{categoryId}
    </if>
    <if test="status != null">
        and s.status = #{status}
    </if>
</where>
order by create_time desc
```

逐段理解：

- `select s.*`：查套餐表所有字段。
- `c.name as categoryName`：把关联到的分类表的 `name` 列改名为 `categoryName` 塞进结果，这样 VO 里的 `categoryName` 才有值。
- `from setmeal s`：主表是套餐表，别名 `s`。
- `left join category c on s.category_id = c.id`：左连接分类表，别名 `c`，连接条件是套餐的 `category_id` 等于分类的 `id`。用 `left join` 是为了即使某个套餐的分类被删了，套餐本身仍能查出来，此时 `categoryName` 为空。

`<where>` 是 MyBatis 标签，作用是：只有当里面至少有一个 `<if>` 成立时才生成 `WHERE` 关键字，并且会自动去掉开头多余的 `and`。所以这里每个 `<if>` 里可以放心写 `and xxx`，不用怕第一个条件前面多一个 `and`。

三个 `<if>` 是动态条件，传了才拼上，没传就忽略：

- `name != null`：按套餐名模糊查询，`CONCAT('%', #{name}, '%')` 拼成 `%关键字%`。`#{name}` 是占位符，可以防 SQL 注入。
- `categoryId != null`：按分类 id 精确过滤。
- `status != null`：按状态过滤，0 表示停售，1 表示起售。

`order by create_time desc` 表示按照创建时间倒序排列。

这一部分实现了普遍的查询功能，也就是可以查询套餐名、分类、售卖状态等条件。

结尾没有用 `limit`，是因为分页由 `PageHelper.startPage()` 在运行时自动追加 `limit`。

## 四、新增套餐业务与多对多关系

新增具体套餐的业务，需要先理清“分类”分为套餐分类、菜品分类。

一种套餐分类底下有具体的套餐；一种菜品分类底下有具体的菜品。

新增具体套餐功能实现还涉及三个子功能：

1. 上传图片。
2. 根据分类类型查询具体有什么套餐或菜品分类，也就是要列举出所有的菜品分类还是套餐分类。
3. 根据菜品分类的 id 查询菜品分类。这是一对多关系：一个分类里有多个具体菜品，一个菜品不能存在于多种分类，菜品表里已经记录了分类 id。

最核心的新增具体套餐，包含了多对多关系：一个套餐有多个菜品，一个菜品也能在多个套餐。也就是具体的套餐对应具体什么菜品。

这里需要按步骤处理：

1. 先插入主表。
2. 得到主表 id。
3. 把 id 回填至子表，也就是关系表，写入数据库，表示出多对多关系。
4. 加上 `@Transactional` 注解，防止脏数据产生。

注意：关系表里的 `dish id` 是由前端传进来的，毕竟新增套餐得先指定这个套餐有什么菜品。

## 小结

套餐分页查询的核心是 PageHelper 的 `startPage` 与 `ThreadLocal` 机制，`startPage` 后必须紧跟第一条查询；动态 SQL 用 `<where>` 和 `<if>` 组织条件，分页 `limit` 由 PageHelper 自动追加。新增套餐则要理清分类类型、一对多查询，以及套餐与菜品的多对多写入流程，并用事务保证一致性。