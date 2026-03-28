FROM golang:1.23.6-alpine AS builder
WORKDIR /src
RUN apk add --no-cache git ca-certificates tzdata
COPY server/go.mod ./server/go.mod
WORKDIR /src/server
RUN go mod download
COPY server/ .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/devstore-api ./cmd/api

FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata
COPY --from=builder /out/devstore-api /app/devstore-api
COPY server/configs /app/configs
EXPOSE 8080
CMD ["/app/devstore-api", "-config", "/app/configs/config.yaml"]
