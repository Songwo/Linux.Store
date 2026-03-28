package response

import (
	"net/http"
	"time"

	apperr "devstore/server/internal/common/errors"
	"github.com/gin-gonic/gin"
)

type Result struct {
	Code      int         `json:"code"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	RequestID string      `json:"request_id,omitempty"`
	Timestamp int64       `json:"timestamp"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Result{Code: apperr.CodeOK, Message: "ok", Data: data, RequestID: c.GetString("request_id"), Timestamp: time.Now().UnixMilli()})
}

func Fail(c *gin.Context, httpStatus int, err *apperr.AppError) {
	c.JSON(httpStatus, Result{Code: err.Code, Message: err.Message, Data: gin.H{"detail": err.Detail}, RequestID: c.GetString("request_id"), Timestamp: time.Now().UnixMilli()})
}
