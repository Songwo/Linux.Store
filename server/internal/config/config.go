package config

import "time"

type Config struct {
	App        AppConfig        `mapstructure:"app"`
	MySQL      MySQLConfig      `mapstructure:"mysql"`
	Redis      RedisConfig      `mapstructure:"redis"`
	RabbitMQ   RabbitMQConfig   `mapstructure:"rabbitmq"`
	JWT        JWTConfig        `mapstructure:"jwt"`
	CardSecret CardSecretConfig `mapstructure:"card_secret"`
	Log        LogConfig        `mapstructure:"log"`
	OTel       OTelConfig       `mapstructure:"otel"`
	Prometheus PrometheusConfig `mapstructure:"prometheus"`
	OAuth      OAuthConfig      `mapstructure:"oauth"`
	RateLimit  RateLimitConfig  `mapstructure:"rate_limit"`
}

type AppConfig struct {
	Name            string        `mapstructure:"name"`
	Env             string        `mapstructure:"env"`
	Port            int           `mapstructure:"port"`
	ReadTimeout     time.Duration `mapstructure:"read_timeout"`
	WriteTimeout    time.Duration `mapstructure:"write_timeout"`
	ShutdownTimeout time.Duration `mapstructure:"shutdown_timeout"`
}

type MySQLConfig struct {
	DSN             string        `mapstructure:"dsn"`
	MaxOpenConns    int           `mapstructure:"max_open_conns"`
	MaxIdleConns    int           `mapstructure:"max_idle_conns"`
	ConnMaxLifetime time.Duration `mapstructure:"conn_max_lifetime"`
}

type RedisConfig struct {
	Addr     string `mapstructure:"addr"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
}

type RabbitMQConfig struct {
	URL string `mapstructure:"url"`
}

type JWTConfig struct {
	Secret      string `mapstructure:"secret"`
	ExpireHours int    `mapstructure:"expire_hours"`
	Issuer      string `mapstructure:"issuer"`
}

type CardSecretConfig struct {
	EncryptionKey string `mapstructure:"encryption_key"`
}

type LogConfig struct {
	Level    string `mapstructure:"level"`
	Encoding string `mapstructure:"encoding"`
}

type OTelConfig struct {
	Enabled     bool   `mapstructure:"enabled"`
	Endpoint    string `mapstructure:"endpoint"`
	ServiceName string `mapstructure:"service_name"`
}

type PrometheusConfig struct {
	Enabled bool `mapstructure:"enabled"`
}

type OAuthConfig struct {
	LinuxDO LinuxDOConfig `mapstructure:"linux_do"`
}

type LinuxDOConfig struct {
	ClientID     string `mapstructure:"client_id"`
	ClientSecret string `mapstructure:"client_secret"`
	RedirectURL  string `mapstructure:"redirect_url"`
	AuthorizeURL string `mapstructure:"authorize_url"`
	TokenURL     string `mapstructure:"token_url"`
	UserInfoURL  string `mapstructure:"user_info_url"`
	ProxyURL     string `mapstructure:"proxy_url"`
}

type RateLimitConfig struct {
	Enabled   bool `mapstructure:"enabled"`
	GlobalRPS int  `mapstructure:"global_rps"`
	UserRPS   int  `mapstructure:"user_rps"`
	Burst     int  `mapstructure:"burst"`
}
