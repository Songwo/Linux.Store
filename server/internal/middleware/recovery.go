package middleware

import (
	"net/http"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	"github.com/gin-gonic/gin"
)

func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		response.Fail(c, http.StatusInternalServerError, &apperr.AppError{Code: apperr.CodeInternalError, Message: "internal server error", Detail: "panic recovered"})
	})
}
