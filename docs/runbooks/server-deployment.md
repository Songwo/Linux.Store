# Server Deployment Runbook

## Scope

This runbook prepares DevStore for deployment on a single Linux host with Docker Compose.
It is the fastest path for bringing up MySQL, Redis, RabbitMQ, API, web, admin, Nginx, Prometheus, Grafana, and Jaeger together.

## 1. Server requirements

- 4 vCPU or higher
- 8 GB RAM or higher
- 30 GB free disk space
- Docker Engine 24+
- Docker Compose v2+
- Open ports: `80`, `3000`, `3306`, `5672`, `6379`, `8080`, `9090`, `15672`, `16686`

## 2. Upload the project

```bash
scp -r devstore user@your-server:/opt/devstore
ssh user@your-server
cd /opt/devstore
```

## 3. Prepare configuration

- Keep `server/configs/config.yaml.example` as the container runtime config.
- If you need domain-specific OAuth callback URLs, copy and edit a private config file:

```bash
cp server/configs/config.yaml.example server/configs/config.yaml
```

- Update at least these values before production:
  - `jwt.secret`
  - `oauth.linux_do.client_id`
  - `oauth.linux_do.client_secret`
  - `oauth.linux_do.redirect_url`
  - `otel.endpoint` if observability endpoints are externalized

## 4. Database initialization

The canonical database bootstrap file is:

- `deploy/mysql/devstore-all.sql`

Docker Compose already mounts this file into the MySQL container.
Compatibility wrappers remain at:

- `deploy/mysql/init.sql`
- `server/scripts/init.sql`

## 5. Start the full stack

```bash
docker compose up -d --build
```

## 6. Verify services

```bash
docker compose ps
docker compose logs server --tail=200
docker compose logs nginx --tail=100
```

Expected entrypoints:

- Frontend: `http://your-server/`
- Admin: `http://your-server/admin/`
- API health: `http://your-server/api/v1/health`
- Prometheus: `http://your-server:9090/`
- Grafana: `http://your-server:3000/`
- Jaeger: `http://your-server:16686/`
- RabbitMQ console: `http://your-server:15672/`

## 7. Seeded demo accounts

The SQL bootstrap seeds these credentials:

- Frontend demo user: `demo@devstore.local` / `Admin@123456`
- Admin user: `admin` / `Admin@123456`

Change passwords immediately for any non-demo environment.

## 8. Operational checks after startup

- Log in to `/admin/`
- Open the seckill campaign list and run inventory warmup
- Browse `/products`
- Place a normal order and pay with balance
- Open `/orders` and verify detail delivery rendering
- Run one seckill request and confirm queue/result feedback

## 9. Upgrade workflow

```bash
cd /opt/devstore
git pull
docker compose up -d --build
```

If SQL changed and you need to rebuild the database from scratch:

```bash
docker compose down
# remove volumes only if you really intend to reset data
docker volume rm devstore_mysql-data
```

## 10. Production hardening checklist

- Replace seeded passwords and secrets
- Move MySQL, Redis, and RabbitMQ credentials into private config management
- Place HTTPS in front of Nginx or terminate TLS at your cloud load balancer
- Restrict access to Grafana, Jaeger, RabbitMQ, and Prometheus
- Back up MySQL volume and exported dashboards
- Tune MySQL and Redis for your host size before public traffic
