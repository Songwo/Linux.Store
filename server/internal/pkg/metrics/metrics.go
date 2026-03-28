package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	HTTPRequests        = prometheus.NewCounterVec(prometheus.CounterOpts{Name: "devstore_http_requests_total", Help: "Total HTTP requests"}, []string{"method", "path", "status"})
	HTTPRequestDuration = prometheus.NewHistogramVec(prometheus.HistogramOpts{Name: "devstore_http_request_duration_seconds", Help: "HTTP request duration", Buckets: prometheus.DefBuckets}, []string{"method", "path"})
)

func Register() {
	prometheus.MustRegister(HTTPRequests, HTTPRequestDuration)
}
