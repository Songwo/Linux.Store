package validatorx

import (
	"fmt"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func Init() error {
	v, ok := binding.Validator.Engine().(*validator.Validate)
	if !ok {
		return fmt.Errorf("validator engine unavailable")
	}
	_ = v.RegisterValidation("password", func(fl validator.FieldLevel) bool {
		value := fl.Field().String()
		return len(value) >= 8 && len(value) <= 32
	})
	return nil
}
