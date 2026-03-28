# DevStore Redis Key 设计规范

## 命名规则

- 统一前缀：`devstore:{env}:{module}:{biz}:{id}`
- 分隔符统一使用 `:`
- 热点数据统一加随机过期时间，防止缓存雪崩
- 空对象缓存 + 布隆过滤器处理缓存穿透
- 热点商品缓存重建使用互斥锁或逻辑过期处理击穿

## Key 明细

| Key | 类型 | TTL | 说明 |
| --- | --- | --- | --- |
| `devstore:prod:auth:token:{uid}:{jti}` | string | 7d | JWT 白名单 |
| `devstore:prod:user:profile:{uid}` | string | 30m | 用户信息缓存 |
| `devstore:prod:product:detail:{productId}` | string | 30m | 商品详情缓存 |
| `devstore:prod:product:hot:list` | zset | 10m | 热门商品榜单 |
| `devstore:prod:category:tree` | string | 30m | 分类树缓存 |
| `devstore:prod:cart:{uid}` | hash | 30d | 用户购物车 |
| `devstore:prod:sign:status:{uid}:{yyyyMMdd}` | string | 48h | 当日签到状态 |
| `devstore:prod:sign:streak:{uid}` | string | 30d | 连续签到天数 |
| `devstore:prod:order:idempotent:{token}` | string | 30m | 下单幂等 token |
| `devstore:prod:payment:callback:{payNo}` | string | 24h | 支付回调幂等 |
| `devstore:prod:mq:consume:{messageId}` | string | 7d | MQ 消费幂等 |
| `devstore:prod:seckill:campaign:{campaignId}` | hash | 活动结束+1h | 秒杀活动缓存 |
| `devstore:prod:seckill:stock:{campaignId}:{skuId}` | string | 活动结束+1h | 秒杀库存 |
| `devstore:prod:seckill:buyers:{campaignId}:{skuId}` | set | 活动结束+24h | 秒杀购买用户集合 |
| `devstore:prod:seckill:req:{campaignId}:{uid}` | string | 10s | 秒杀请求防重 |
| `devstore:prod:seckill:result:{campaignId}:{uid}` | string | 30m | 秒杀结果查询 |
| `devstore:prod:rate:user:{uid}:{api}` | string | 1m | 用户级限流 |
| `devstore:prod:rate:ip:{ip}:{api}` | string | 1m | IP 级限流 |
| `devstore:prod:lock:product:{productId}` | string | 10s | 商品缓存锁 |
| `devstore:prod:lock:close-order:{orderNo}` | string | 60s | 关单补偿锁 |

## 秒杀 Lua Key 约定

- `KEYS[1] = devstore:prod:seckill:stock:{campaignId}:{skuId}`
- `KEYS[2] = devstore:prod:seckill:buyers:{campaignId}:{skuId}`
- `KEYS[3] = devstore:prod:seckill:req:{campaignId}:{uid}`
- `ARGV[1] = userId`
- `ARGV[2] = requestTTLSeconds`

返回值约定：

- `0` 抢购成功
- `1` 库存不足
- `2` 一人一单重复抢购
- `3` 重复请求
