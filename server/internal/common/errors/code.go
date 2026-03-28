package errors

const (
	CodeOK                = 0
	CodeBadRequest        = 40000
	CodeValidationError   = 40001
	CodeOrderDuplicate    = 40010
	CodePaymentDuplicate  = 40011
	CodeSignAlreadyDone   = 40012
	CodeCouponUnavailable = 40013
	CodeCouponAlreadyClaimed = 40014
	CodeStockNotEnough    = 40020
	CodeSeckillRepeat     = 40021
	CodeSeckillEnded      = 40022
	CodeSeckillBusy       = 40023
	CodeUnauthorized      = 40100
	CodeAuthFailed        = 40101
	CodeTokenExpired      = 40102
	CodeTokenInvalid      = 40103
	CodeForbidden         = 40300
	CodeUserDisabled      = 40301
	CodeNotFound          = 40400
	CodeTooManyRequests   = 42900
	CodeInternalError     = 50000
)
