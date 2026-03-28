# DevStore API 文档

## 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "request_id": "uuid"
}
```

## 错误码

| code | 含义 |
| --- | --- |
| 0 | 成功 |
| 40001 | 参数校验失败 |
| 40010 | 重复下单 |
| 40011 | 重复支付 |
| 40012 | 重复签到 |
| 40013 | 优惠券不可用 |
| 40020 | 库存不足 |
| 40021 | 秒杀重复下单 |
| 40023 | 秒杀请求过快 |
| 40100 | 未授权 |
| 40103 | Token 无效 |
| 40300 | 无权限 |
| 50000 | 服务器内部错误 |

## 认证接口

### `POST /api/v1/auth/register`

请求体：

```json
{
  "email": "demo@devstore.local",
  "password": "Admin@123456",
  "nickname": "DemoUser"
}
```

### `POST /api/v1/auth/login`

请求体：

```json
{
  "identifier": "demo@devstore.local",
  "password": "Admin@123456"
}
```

### `GET /api/v1/auth/oauth/linux-do/authorize`

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "authorize_url": "https://connect.linux.do/oauth2/authorize?..."
  }
}
```

### `GET /api/v1/auth/oauth/linux-do/callback?code=xxx`

OAuth 回调成功后会自动：

- 查找 `oauth_bindings`
- 尝试按邮箱绑定已有本地账号
- 不存在则自动创建新用户
- 首次登录赠送 100 积分
- 返回本地 JWT

前端推荐把 Linux.do 回调地址配置为 `http://localhost/oauth/linux-do/callback`，然后由前台页面拿到 `code` 后再调用本接口完成本地登录。

## 商品与活动接口

### `GET /api/v1/categories`
### `GET /api/v1/products`
### `GET /api/v1/products/:id`
### `GET /api/v1/campaigns`
### `GET /api/v1/coupon/templates`

## 用户接口

所有 `/api/v1/user/*` 需要 `Authorization: Bearer <token>`。

### `GET /api/v1/user/profile`
### `POST /api/v1/user/oauth/linux-do/bind`

```json
{ "code": "linux-do-auth-code" }
```

### `GET /api/v1/user/cart`
### `POST /api/v1/user/cart/items`
### `DELETE /api/v1/user/cart/items/:skuId`
### `POST /api/v1/user/orders`

请求体：

```json
{
  "items": [
    { "sku_id": 1, "quantity": 1 }
  ],
  "coupon_id": 12,
  "submit_token": "b9be9df2817f4f46ad6727d94ebdb068",
  "remark": "web create order"
}
```

说明：

- `coupon_id` 可选，传入的是用户已领取优惠券 `user_coupons.id`
- 下单成功后优惠券会先进入“锁定中”
- 订单支付成功后优惠券变为“已使用”
- 用户取消订单或超时关闭后，优惠券会自动释放回“待使用”
### `GET /api/v1/user/orders`
### `POST /api/v1/user/orders/:orderNo/cancel`
### `POST /api/v1/user/payments/balance`
### `GET /api/v1/user/sign/status`
### `POST /api/v1/user/sign`
### `GET /api/v1/user/coupons`
### `POST /api/v1/user/coupons/claim`

```json
{ "template_id": 1 }
```

### `POST /api/v1/user/seckill/purchase`
### `GET /api/v1/user/seckill/result?campaign_id=1`

## 后台接口

所有 `/api/v1/admin/*` 需要管理员 JWT，登录接口除外。

### `POST /api/v1/admin/auth/login`

```json
{
  "username": "admin",
  "password": "Admin@123456"
}
```

### `GET /api/v1/admin/dashboard`

响应字段：

- `user_count`
- `order_count`
- `gmv`
- `campaign_count`
- `today_paid_count`
- `pending_pay_count`
- `seckill_order_count`

### `GET /api/v1/admin/users?page=1&page_size=10&keyword=demo`

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": 1,
        "nickname": "DemoUser",
        "email": "demo@devstore.local",
        "balance": 1000,
        "points": 5000,
        "source": "seed",
        "status": 1,
        "created_at": "2026-03-20T10:00:00+08:00"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 10
  }
}
```

### `GET /api/v1/admin/orders?page=1&page_size=10&status=20`

### `GET /api/v1/admin/inventory?page=1&page_size=10&keyword=GO-BOOK`

### `GET /api/v1/admin/products`
### `POST /api/v1/admin/products`

### `GET /api/v1/admin/campaigns`
### `POST /api/v1/admin/seckill/:campaignId/warmup`

### `GET /api/v1/admin/coupon/templates`
### `POST /api/v1/admin/coupon/templates`

请求体：

```json
{
  "name": "新人满减券",
  "type": "discount",
  "total": 1000,
  "amount": 20,
  "threshold_amount": 99,
  "points_cost": 0,
  "start_at": "2026-03-20 00:00:00",
  "end_at": "2026-12-31 23:59:59",
  "description": "注册后可领取"
}
```
