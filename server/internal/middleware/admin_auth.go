package middleware

import (
	"net/http"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	jwtpkg "devstore/server/internal/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func AdminAuth(jwt *jwtpkg.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !applyAuth(c, jwt) {
			c.Abort()
			return
		}
		if c.GetString("role") != "admin" {
			response.Fail(c, http.StatusForbidden, apperr.New(apperr.CodeForbidden, "admin only"))
			c.Abort()
			return
		}
		c.Next()
	}
}
