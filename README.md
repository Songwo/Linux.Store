<div align="center">

# DevStore

**一个面向开发者的高并发数字商品电商系统**

**A production-grade high-concurrency developer commerce platform**

[![Go](https://img.shields.io/badge/Go-1.23-00ADD8?style=flat-square&logo=go)](https://golang.org)
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?style=flat-square&logo=rabbitmq&logoColor=white)](https://rabbitmq.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 中文 | Chinese

### 项目简介

DevStore 是一个真实的全栈生产级开发者电商平台，不是普通 CRUD 演示。集成了完整的高并发处理、电商业务流程和可观测性体系。

**核心亮点：**
- 🚀 **高并发秒杀**：Redis Lua 原子扣库存 + RabbitMQ 异步订单，防超卖
- 🛒 **完整电商流程**：商品 → 购物车 → 订单 → 支付 → 卡密发货
- 💰 **用户资产体系**：钱包余额、积分流水、每日签到、优惠券
- 🔐 **多种登录方式**：JWT 邮箱密码 + Linux.do OAuth2
- 📊 **全链路可观测**：Prometheus + Grafana + Jaeger
- 🌐 **国际化支持**：前端中英文一键切换
- 🐳 **一键部署**：`docker compose up -d` 启动所有服务

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端 API | Go 1.23 · Gin · GORM | 模块化单体，领域分层，JWT 鉴权 |
| 数据库 | MySQL 8.0 · Redis 7 | 事务、缓存、Lua 原子操作 |
| 消息队列 | RabbitMQ 3.13 | 秒杀异步处理、支付回调 |
| 用户前端 | Vue 3 · Vite · Element Plus | 响应式商城，中英文切换 |
| 管理后台 | Vue 3 · Vite · Element Plus | 商品/订单/用户全功能管理 |
| 可观测性 | Prometheus · Grafana · Jaeger | 指标、仪表盘、链路追踪 |
| 部署 | Docker Compose · Nginx | 一键启动，反向代理 |

### 快速开始

**前置要求：** Docker >= 24.0，Docker Compose >= 2.20

```bash
# 1. 克隆项目
git clone https://github.com/your-username/Linux.Store.git
cd Linux.Store

# 2. 复制环境变量
cp .env.example .env
# （可选）修改 .env 中的密码和 JWT_SECRET

# 3. 一键启动
docker compose up -d

# 4. 查看状态
docker compose ps
```

首次启动约需 1-2 分钟（MySQL 初始化）。

### 访问地址

| 服务 | 地址 | 默认账号 |
|------|------|----------|
| 用户商城 | http://localhost | — |
| 管理后台 | http://localhost/admin/ | admin / Admin@123456 |
| RabbitMQ 管理 | http://localhost:15672 | guest / guest |
| Grafana 监控 | http://localhost:3000 | admin / admin123456 |
| Prometheus | http://localhost:9090 | — |
| Jaeger 链路追踪 | http://localhost:16686 | — |

> 商城用户账号：注册后使用，或用 SQL 脚本预置演示数据。

### 功能模块

- **商品系统**：分类管理、多 SKU、Redis 缓存加速、商品收藏
- **秒杀系统**：Redis Lua 原子扣减 + RabbitMQ 异步下单，多 Worker 消费
- **订单系统**：购物车结算、余额/积分混合支付、优惠券抵扣
- **卡密系统**：支付后自动发货，脱敏存储，查看/兑换审计追踪
- **用户资产**：钱包余额、积分流水、每日签到连续奖励
- **优惠活动**：优惠券模板、领取、核销全流程
- **管理后台**：商品、SKU、库存、订单、用户、卡密、公告全功能
- **限流保护**：全局 + 用户级 Redis 滑动窗口限流

### 目录结构

```
Linux.Store/
├── server/          # Go 后端 API
│   ├── cmd/api/     # 入口
│   ├── internal/    # 业务模块（auth/product/order/seckill/...）
│   └── configs/     # 配置文件
├── web/             # 用户商城前端（Vue 3）
├── admin/           # 管理后台前端（Vue 3）
├── deploy/          # Docker、Nginx、MySQL、Prometheus、Grafana
├── docs/            # API 文档、架构设计
├── docker-compose.yml
└── .env.example
```

### 停止服务

```bash
# 停止保留数据
docker compose down

# 停止并清除所有数据（慎用）
docker compose down -v
```

---

## English

### Overview

DevStore is a full-stack production-grade developer e-commerce platform — not a typical CRUD demo. It integrates real high-concurrency handling, complete e-commerce business flows, and a full observability stack.

**Highlights:**
- 🚀 **Flash Sale (Seckill)**: Redis Lua atomic stock deduction + RabbitMQ async order processing, oversell-proof
- 🛒 **Full E-commerce Flow**: Product → Cart → Order → Payment → Card delivery
- 💰 **User Asset System**: Wallet balance, points ledger, daily sign-in rewards, coupons
- 🔐 **Auth**: JWT email/password + Linux.do OAuth2
- 📊 **Observability**: Prometheus + Grafana + Jaeger
- 🌐 **i18n**: Full Chinese/English switch on the frontend
- 🐳 **One-command Deploy**: `docker compose up -d` starts everything

### Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Backend API | Go 1.23 · Gin · GORM | Modular monolith, domain-layered, JWT auth |
| Database | MySQL 8.0 · Redis 7 | Transactions, cache, Lua atomic ops |
| Message Queue | RabbitMQ 3.13 | Async seckill orders, payment callbacks |
| Storefront | Vue 3 · Vite · Element Plus | Responsive, i18n |
| Admin Console | Vue 3 · Vite · Element Plus | Full product/order/user management |
| Observability | Prometheus · Grafana · Jaeger | Metrics, dashboards, tracing |
| Deploy | Docker Compose · Nginx | One-command startup, reverse proxy |

### Quick Start

**Prerequisites:** Docker >= 24.0, Docker Compose >= 2.20

```bash
# 1. Clone
git clone https://github.com/your-username/Linux.Store.git
cd Linux.Store

# 2. Copy env file
cp .env.example .env
# (Optional) Edit .env to change passwords and JWT_SECRET

# 3. Start all services
docker compose up -d

# 4. Check status
docker compose ps
```

First startup takes ~1-2 min for MySQL initialization.

### Service URLs

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Storefront | http://localhost | Register to use |
| Admin Console | http://localhost/admin/ | admin / Admin@123456 |
| RabbitMQ Management | http://localhost:15672 | guest / guest |
| Grafana | http://localhost:3000 | admin / admin123456 |
| Prometheus | http://localhost:9090 | — |
| Jaeger | http://localhost:16686 | — |

### Features

- **Product System**: Category management, multi-SKU, Redis cache, wishlist
- **Flash Sale**: Redis Lua atomic stock + RabbitMQ async orders, multi-worker consumers
- **Order System**: Cart checkout, balance/points mixed payment, coupon discount
- **Card Delivery**: Auto-deliver after payment, masked storage, audit trail
- **User Assets**: Wallet, points ledger, daily streak sign-in rewards
- **Coupons**: Template management, claim, redemption full flow
- **Admin Console**: Full product, SKU, inventory, order, user, card, announcement management
- **Rate Limiting**: Global + per-user Redis sliding window

### Project Structure

```
Linux.Store/
├── server/          # Go backend API
│   ├── cmd/api/     # Entrypoint
│   ├── internal/    # Business modules (auth/product/order/seckill/...)
│   └── configs/     # Config files
├── web/             # User storefront (Vue 3)
├── admin/           # Admin console (Vue 3)
├── deploy/          # Docker, Nginx, MySQL, Prometheus, Grafana
├── docs/            # API docs, architecture
├── docker-compose.yml
└── .env.example
```

### Stop Services

```bash
# Stop but keep data
docker compose down

# Stop and remove all data (caution!)
docker compose down -v
```

### Local Development (without Docker)

```bash
# Backend
cp server/configs/config.yaml.example server/configs/config.local.yaml
# Edit config.local.yaml with your local MySQL/Redis/RabbitMQ addresses
cd server && go run ./cmd/api

# Frontend
cd web && npm install && npm run dev    # http://localhost:5173
cd admin && npm install && npm run dev  # http://localhost:5174
```

---

## Contributing

PR and issues are welcome. Please open an issue first for major changes.

## License

[MIT](LICENSE)
