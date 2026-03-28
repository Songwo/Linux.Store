package handler

import (
	"devstore/server/internal/common/response"
	"github.com/gin-gonic/gin"
)

type Handler struct{}

func New() *Handler { return &Handler{} }

func (h *Handler) Ping(c *gin.Context) { response.Success(c, gin.H{"status": "ok"}) }
