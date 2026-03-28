# DevStore RabbitMQ 设计

## 交换机

| Exchange | 类型 | 用途 |
| --- | --- | --- |
| `devstore.order.exchange` | direct | 普通订单链路 |
| `devstore.payment.exchange` | direct | 支付事件 |
| `devstore.points.exchange` | direct | 积分发放 |
| `devstore.seckill.exchange` | direct | 秒杀削峰 |
| `devstore.delay.exchange` | direct | 延迟关单 |
| `devstore.dlx.exchange` | direct | 死信补偿 |
| `devstore.notify.exchange` | topic | 通知扩展 |

## 队列

| Queue | Routing Key | 说明 |
| --- | --- | --- |
| `devstore.seckill.order.queue` | `seckill.order.create` | 秒杀异步下单 |
| `devstore.order.close.delay.queue` | `order.close.delay` | 订单延迟关单 |
| `devstore.order.close.queue` | `order.close` | 死信转入后执行关单 |
| `devstore.payment.success.queue` | `payment.success` | 支付成功事件 |
| `devstore.points.grant.queue` | `points.grant` | 支付后积分发放 |
| `devstore.inventory.compensate.queue` | `inventory.compensate` | 库存补偿 |
| `devstore.system.dlx.queue` | `dead.letter` | 兜底死信队列 |

## 统一消息结构

```json
{
  "message_id": "01HQ8P4M2R8YFMBJ8ZB4N2X9YV",
  "event": "seckill.order.create",
  "biz_key": "campaign:1001:user:88",
  "trace_id": "9a70f3b9af2d4c79a87f4c0d7c54e941",
  "timestamp": 1710000000,
  "payload": {}
}
```

## 链路要求

- 秒杀请求成功后仅写 Redis 和 MQ，不同步写订单主流程
- 支付完成后发送 `payment.success`，由积分消费者异步发放奖励
- 订单创建后投递延迟队列，TTL 过期经死信交换机进入关闭队列
- 消费幂等通过 `mq_consume_logs` 表和 Redis `devstore:prod:mq:consume:{messageId}` 双保险
