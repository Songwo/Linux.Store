package jwt

import (
	"fmt"
	"time"

	"devstore/server/internal/common/types"
	"devstore/server/internal/config"
	jwtv5 "github.com/golang-jwt/jwt/v5"
)

type Manager struct {
	secret []byte
	issuer string
	expire time.Duration
}

type Claims struct {
	types.UserClaims
	jwtv5.RegisteredClaims
}

func New(cfg config.JWTConfig) *Manager {
	return &Manager{secret: []byte(cfg.Secret), issuer: cfg.Issuer, expire: time.Duration(cfg.ExpireHours) * time.Hour}
}

func (m *Manager) Generate(claims types.UserClaims) (string, error) {
	now := time.Now()
	token := jwtv5.NewWithClaims(jwtv5.SigningMethodHS256, Claims{UserClaims: claims, RegisteredClaims: jwtv5.RegisteredClaims{Issuer: m.issuer, ExpiresAt: jwtv5.NewNumericDate(now.Add(m.expire)), IssuedAt: jwtv5.NewNumericDate(now), NotBefore: jwtv5.NewNumericDate(now)}})
	return token.SignedString(m.secret)
}

func (m *Manager) Parse(token string) (*Claims, error) {
	parsed, err := jwtv5.ParseWithClaims(token, &Claims{}, func(_ *jwtv5.Token) (interface{}, error) { return m.secret, nil })
	if err != nil {
		return nil, err
	}
	claims, ok := parsed.Claims.(*Claims)
	if !ok || !parsed.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}
