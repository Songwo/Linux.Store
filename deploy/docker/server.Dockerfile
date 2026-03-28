FROM golang:1.23.6-alpine AS builder

WORKDIR /src

RUN apk add --no-cache git ca-certificates tzdata

# 国内 Go 代理，避免 proxy.golang.org 超时
ENV GOPROXY=https://goproxy.cn,direct
ENV GOSUMDB=sum.golang.google.cn
ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64

# 先只拷贝依赖文件，充分利用缓存
COPY server/go.mod ./server/go.mod
COPY server/go.sum ./server/go.sum

WORKDIR /src/server

# 下载依赖
RUN go mod download

# 再拷贝源码
COPY server/ ./

# 构建二进制
RUN go build -ldflags="-s -w" -o /out/devstore-api ./cmd/api

# =========================
# Runtime
# =========================
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /out/devstore-api /app/devstore-api
COPY server/configs /app/configs

EXPOSE 8080

CMD ["/app/devstore-api", "-config", "/app/configs/config.yaml"]