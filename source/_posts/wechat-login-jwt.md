---
use_abbrlink: true
title: 微信小程序登录流程与JWT鉴权实现
categories:
  - 项目实战
  - 外卖管理系统
tags:
  - 外卖管理
  - 微信登录
  - JWT
  - Spring Boot
keywords: '外卖管理, 微信小程序登录, HttpClient, 微信服务器, openid, JWT令牌, yml配置'
description: >-
  记录外卖管理项目中用户端微信登录功能的开发历程。涵盖微信登录业务闭环、HttpClient发送HTTP请求、小程序端代码入门以及JWT令牌的集成与yml配置。
toc: true
abbrlink: 9b61c233
date: 2026-11-27 23:29:05
---

## 一、 业务背景：微信登录的基本闭环

在开发用户端（微信小程序）时，登录是获取用户身份的第一步。由于没有传统的账号密码体系，我们需要依赖微信的授权机制来完成登录。

整个微信登录的核心流程如下：

1. **前端获取 Code**：用户在小程序点击登录，前端调用微信官方接口，获取一个临时的登录凭证 `code`。
2. **后端请求微信服务器**：我们的 Java 后端（服务端）接收到这个 `code` 后，需要结合小程序提供的 `AppID` 和 `AppSecret`，向微信服务器发送一个 HTTP 请求。
3. **获取 OpenID**：微信服务器校验通过后，返回该用户的唯一标识 `openid`（以及 `session_key`）。
4. **业务逻辑处理**：后端拿到 `openid` 后，进行核心业务判断：
   - 判断 `openid` 是否为空，为空则抛出异常（登录失败）。
   - 拿着 `openid` 去数据库查询是否已有该用户。
   - 如果是新用户，则自动完成**注册**（将信息插入数据库）。
5. **签发 JWT 令牌**：登录成功后，后端生成 JWT（JSON Web Token）并返回给前端。后续用户的所有请求都会携带这个 Token，用于身份校验。

## 二、 服务端通信利器：HttpClient

在步骤 2 中，我们的 Java 程序需要向微信服务器发起网络请求。在 Java 后端开发中，除了我们熟知的 `RestTemplate` 或 `OkHttp`，**HttpClient** 也是一个非常经典的发送 HTTP 请求的工具。

- **它是什么**：HttpClient 是 Apache 提供的一个强大的 HTTP 客户端编程工具包。
- **它的作用**：它可以实现服务端与服务器之间的通信。比如本次项目中，就是让我们的 Java 代码"伪装"成一个客户端，去向微信服务器要数据。

在 HttpClient 的代码编写中，最基础的操作就是掌握 **GET** 和 **POST** 请求的写法。对于微信的登录接口，我们通常需要构建一个包含 `code`、`AppID` 等参数请求，发送过去并解析返回的 JSON 结果。

## 三、 微信小程序开发入门

项目前端使用的是微信小程序。作为一个之前接触过前端（如 Vue）的开发者，学习小程序的上手成本并不高。它的代码结构和前端框架非常像：

- **数据绑定**：通过 `{{ }}` 进行双向或单向绑定。
- **生命周期**：拥有 `onLoad`、`onShow` 等页面生命周期钩子。
- **事件绑定**：通过 `bindtap` 等属性绑定点击事件。

在用户点击登录按钮后，小程序会通过 `wx.login` 获取到 `code`，然后利用 `wx.request` 发起一个网络请求，将 `code` 传递给我们的后端接口。

## 四、 核心业务实现与 JWT 配置

在完成了接口定义后，我们在后端编写了具体的 Controller 和 Service 层逻辑。

### 登录核心业务逻辑

业务层（Service）的核心代码如下，包含了与微信服务器的通信以及自动注册的逻辑：

```java
/**
 * 微信登录核心逻辑
 * @param userLoginDTO 包含前端传来的 code
 * @return 登录成功返回用户信息和 Token
 */
public User login(UserLoginDTO userLoginDTO) {
    // 1. 获取前端传来的临时凭证 code
    String code = userLoginDTO.getCode();

    // 2. 通过 HttpClient 向微信服务器发送请求，获取 openid
    // 这里的 URL 拼接了 appid, secret 和 code
    String url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + weChatProperties.getAppid() +
                 "&secret=" + weChatProperties.getSecret() +
                 "&js_code=" + code + "&grant_type=authorization_code";

    // 发送 GET 请求并解析返回的 JSON
    String jsonResult = HttpClientUtil.doGet(url);
    JSONObject jsonObject = JSON.parseObject(jsonResult);

    // 3. 获取 openid 并进行判空校验
    String openid = jsonObject.getString("openid");
    if (openid == null) {
        // 获取不到 openid，抛出业务异常
        throw new LoginFailedException("登录失败，获取微信 openid 异常");
    }

    // 4. 判断是否为新用户
    User user = userMapper.getByOpenid(openid);
    if (user == null) {
        // 5. 新用户，自动完成注册（执行插入库操作）
        user = User.builder()
                .openid(openid)
                .createTime(LocalDateTime.now())
                .build();
        userMapper.insert(user);
    }

    // 6. 生成 JWT 令牌并返回
    // 这里的 jwtProperties 也是从 yml 读取的配置
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", user.getId());
    String token = JwtUtil.createJWT(jwtProperties.getUserSecretKey(), jwtProperties.getUserTtl(), claims);

    user.setToken(token);
    return user;
}
```

### 配置管理（yml）

为了方便管理，我们将微信的 `appid`、`secret` 以及 JWT 的签名密钥、过期时间等敏感信息，都统一配置在了 `application.yml` 中，并通过 `@ConfigurationProperties` 注解映射到对应的配置类中，体现了良好的工程规范。

```yaml
# 微信小程序配置
wechat:
  appid: your_appid_here
  secret: your_secret_here

# JWT 用户端配置
jwt:
  user-secret-key: your_secret_key_here
  user-ttl: 7200000 # 令牌有效期，单位毫秒
  user-token-name: authentication
```

## 五、 总结

今天通过完整实现微信登录功能，不仅跑通了"小程序获取 Code -> 后端 HttpClient 请求微信 -> 获取 OpenID -> 自动注册/查询 -> 签发 JWT"的全链路，还对服务端网络请求、JWT 鉴权机制以及小程序的开发模式有了初步的认识。
