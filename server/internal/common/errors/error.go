package errors

import "fmt"

type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"detail,omitempty"`
}

func (e *AppError) Error() string {
	if e.Detail == "" {
		return fmt.Sprintf("code=%d message=%s", e.Code, e.Message)
	}
	return fmt.Sprintf("code=%d message=%s detail=%s", e.Code, e.Message, e.Detail)
}

func New(code int, message string) *AppError {
	return &AppError{Code: code, Message: message}
}

func Wrap(code int, message string, err error) *AppError {
	if err == nil {
		return &AppError{Code: code, Message: message}
	}
	return &AppError{Code: code, Message: message, Detail: err.Error()}
}
