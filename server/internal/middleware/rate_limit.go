package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"golang.org/x/time/rate"
)

type limiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type limiterStore struct {
	mu       sync.Mutex
	limiters map[string]*limiterEntry
	r        rate.Limit
	burst    int
	ttl      time.Duration
}

func newLimiterStore(rps int, burst int) *limiterStore {
	store := &limiterStore{
		limiters: make(map[string]*limiterEntry),
		r:        rate.Limit(rps),
		burst:    burst,
		ttl:      10 * time.Minute,
	}
	go store.cleanup(5 * time.Minute)
	return store
}

func (s *limiterStore) get(key string) *rate.Limiter {
	now := time.Now()
	s.mu.Lock()
	defer s.mu.Unlock()
	if entry, ok := s.limiters[key]; ok {
		entry.lastSeen = now
		return entry.limiter
	}
	limiter := rate.NewLimiter(s.r, s.burst)
	s.limiters[key] = &limiterEntry{limiter: limiter, lastSeen: now}
	return limiter
}

func (s *limiterStore) cleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for range ticker.C {
		cutoff := time.Now().Add(-s.ttl)
		s.mu.Lock()
		for key, entry := range s.limiters {
			if entry.lastSeen.Before(cutoff) {
				delete(s.limiters, key)
			}
		}
		s.mu.Unlock()
	}
}

func RateLimit(globalRPS, burst int) gin.HandlerFunc {
	if globalRPS <= 0 || burst <= 0 {
		return func(c *gin.Context) { c.Next() }
	}
	store := newLimiterStore(globalRPS, burst)
	return func(c *gin.Context) {
		if !store.get("global").Allow() {
			response.Fail(c, http.StatusTooManyRequests, apperr.New(apperr.CodeTooManyRequests, "too many requests"))
			c.Abort()
			return
		}
		c.Next()
	}
}

func UserRateLimit(rps, burst int) gin.HandlerFunc {
	if rps <= 0 || burst <= 0 {
		return func(c *gin.Context) { c.Next() }
	}
	store := newLimiterStore(rps, burst)
	return func(c *gin.Context) {
		key := fmt.Sprintf("%d:%s", c.GetUint64("user_id"), c.FullPath())
		if c.GetUint64("user_id") == 0 {
			key = c.ClientIP() + ":" + c.FullPath()
		}
		if !store.get(key).AllowN(time.Now(), 1) {
			response.Fail(c, http.StatusTooManyRequests, apperr.New(apperr.CodeTooManyRequests, "user rate limit exceeded"))
			c.Abort()
			return
		}
		c.Next()
	}
}

var redisWindowLimitScript = redis.NewScript(`
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[2])
end
local ttl = redis.call("PTTL", KEYS[1])
return {current, ttl}
`)

func RedisUserWindowLimit(redisClient *redis.Client, prefix string, limit int64, window time.Duration) gin.HandlerFunc {
	if redisClient == nil || limit <= 0 || window <= 0 {
		return func(c *gin.Context) { c.Next() }
	}
	return func(c *gin.Context) {
		identity := c.ClientIP()
		if userID := c.GetUint64("user_id"); userID > 0 {
			identity = fmt.Sprintf("u:%d", userID)
		}
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}
		key := fmt.Sprintf("devstore:prod:ratelimit:%s:%s:%s", prefix, identity, path)
		values, err := redisWindowLimitScript.Run(c.Request.Context(), redisClient, []string{key}, limit, window.Milliseconds()).Slice()
		if err != nil {
			c.Next()
			return
		}

		current := toInt64(values, 0)
		ttlMs := toInt64(values, 1)
		remaining := limit - current
		if remaining < 0 {
			remaining = 0
		}
		c.Header("X-RateLimit-Limit", strconv.FormatInt(limit, 10))
		c.Header("X-RateLimit-Remaining", strconv.FormatInt(remaining, 10))
		if ttlMs > 0 {
			c.Header("X-RateLimit-Reset", strconv.FormatInt(time.Now().Add(time.Duration(ttlMs)*time.Millisecond).Unix(), 10))
		}

		if current > limit {
			if ttlMs > 0 {
				retryAfter := ttlMs / 1000
				if retryAfter <= 0 {
					retryAfter = 1
				}
				c.Header("Retry-After", strconv.FormatInt(retryAfter, 10))
			}
			response.Fail(c, http.StatusTooManyRequests, apperr.New(apperr.CodeTooManyRequests, "requests too frequent, please retry later"))
			c.Abort()
			return
		}
		c.Next()
	}
}

func toInt64(values []interface{}, idx int) int64 {
	if idx < 0 || idx >= len(values) {
		return 0
	}
	switch value := values[idx].(type) {
	case int64:
		return value
	case int:
		return int64(value)
	case uint64:
		return int64(value)
	case string:
		parsed, _ := strconv.ParseInt(value, 10, 64)
		return parsed
	default:
		return 0
	}
}
