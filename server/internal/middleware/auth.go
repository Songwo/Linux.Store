package middleware

import (
	"net/http"
	"strings"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	jwtpkg "devstore/server/internal/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func Auth(jwt *jwtpkg.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !applyAuth(c, jwt) {
			c.Abort()
			return
		}
		c.Next()
	}
}

func applyAuth(c *gin.Context, jwt *jwtpkg.Manager) bool {
	authHeader := c.GetHeader("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		response.Fail(c, http.StatusUnauthorized, apperr.New(apperr.CodeUnauthorized, "missing token"))
		return false
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := jwt.Parse(token)
	if err != nil {
		response.Fail(c, http.StatusUnauthorized, apperr.New(apperr.CodeTokenInvalid, "invalid token"))
		return false
	}
	c.Set("user_id", claims.UserID)
	c.Set("email", claims.Email)
	c.Set("nickname", claims.Nickname)
	c.Set("role", claims.Role)
	return true
}
