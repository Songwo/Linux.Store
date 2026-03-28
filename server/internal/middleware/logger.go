package middleware

import (
	"time"

	"devstore/server/internal/pkg/metrics"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func Logger(log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		latency := time.Since(start)
		status := c.Writer.Status()
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}
		metrics.HTTPRequests.WithLabelValues(c.Request.Method, path, httpStatusLabel(status)).Inc()
		metrics.HTTPRequestDuration.WithLabelValues(c.Request.Method, path).Observe(latency.Seconds())
		log.Info("http_request", zap.String("request_id", c.GetString("request_id")), zap.String("method", c.Request.Method), zap.String("path", path), zap.Int("status", status), zap.Duration("latency", latency), zap.String("ip", c.ClientIP()))
	}
}

func httpStatusLabel(code int) string {
	if code >= 500 {
		return "5xx"
	}
	if code >= 400 {
		return "4xx"
	}
	if code >= 300 {
		return "3xx"
	}
	return "2xx"
}
