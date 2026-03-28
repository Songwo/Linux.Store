package bootstrap

import (
	"context"
	"fmt"

	"devstore/server/internal/common/logger"
	"devstore/server/internal/config"
	adminhandler "devstore/server/internal/module/admin/handler"
	adminrepo "devstore/server/internal/module/admin/repository"
	adminsvc "devstore/server/internal/module/admin/service"
	announcementhandler "devstore/server/internal/module/announcement/handler"
	announcementrepo "devstore/server/internal/module/announcement/repository"
	announcementsvc "devstore/server/internal/module/announcement/service"
	authhandler "devstore/server/internal/module/auth/handler"
	authrepo "devstore/server/internal/module/auth/repository"
	authsvc "devstore/server/internal/module/auth/service"
	campaignhandler "devstore/server/internal/module/campaign/handler"
	campaignrepo "devstore/server/internal/module/campaign/repository"
	campaignsvc "devstore/server/internal/module/campaign/service"
	cardsecrethandler "devstore/server/internal/module/cardsecret/handler"
	cardsecretrepo "devstore/server/internal/module/cardsecret/repository"
	cardsecretsvc "devstore/server/internal/module/cardsecret/service"
	carthandler "devstore/server/internal/module/cart/handler"
	cartrepo "devstore/server/internal/module/cart/repository"
	cartsvc "devstore/server/internal/module/cart/service"
	categoryhandler "devstore/server/internal/module/category/handler"
	categoryrepo "devstore/server/internal/module/category/repository"
	categorysvc "devstore/server/internal/module/category/service"
	couponhandler "devstore/server/internal/module/coupon/handler"
	couponrepo "devstore/server/internal/module/coupon/repository"
	couponsvc "devstore/server/internal/module/coupon/service"
	healthhandler "devstore/server/internal/module/health/handler"
	oauthhandler "devstore/server/internal/module/oauth/handler"
	oauthprovider "devstore/server/internal/module/oauth/provider"
	oauthrepo "devstore/server/internal/module/oauth/repository"
	oauthsvc "devstore/server/internal/module/oauth/service"
	orderhandler "devstore/server/internal/module/order/handler"
	orderrepo "devstore/server/internal/module/order/repository"
	ordersvc "devstore/server/internal/module/order/service"
	paymenthandler "devstore/server/internal/module/payment/handler"
	paymentrepo "devstore/server/internal/module/payment/repository"
	paymentsvc "devstore/server/internal/module/payment/service"
	producthandler "devstore/server/internal/module/product/handler"
	productrepo "devstore/server/internal/module/product/repository"
	productsvc "devstore/server/internal/module/product/service"
	reviewhandler "devstore/server/internal/module/review/handler"
	reviewrepo "devstore/server/internal/module/review/repository"
	reviewsvc "devstore/server/internal/module/review/service"
	seckillhandler "devstore/server/internal/module/seckill/handler"
	seckillrepo "devstore/server/internal/module/seckill/repository"
	seckillsvc "devstore/server/internal/module/seckill/service"
	signhandler "devstore/server/internal/module/sign/handler"
	signrepo "devstore/server/internal/module/sign/repository"
	signsvc "devstore/server/internal/module/sign/service"
	userhandler "devstore/server/internal/module/user/handler"
	userrepo "devstore/server/internal/module/user/repository"
	usersvc "devstore/server/internal/module/user/service"
	wallethandler "devstore/server/internal/module/wallet/handler"
	walletrepo "devstore/server/internal/module/wallet/repository"
	walletsvc "devstore/server/internal/module/wallet/service"
	wishlisthandler "devstore/server/internal/module/wishlist/handler"
	wishlistrepo "devstore/server/internal/module/wishlist/repository"
	wishlistsvc "devstore/server/internal/module/wishlist/service"
	mqconsumer "devstore/server/internal/mq/consumer"
	mqproducer "devstore/server/internal/mq/producer"
	"devstore/server/internal/pkg/cardsecretx"
	jwtpkg "devstore/server/internal/pkg/jwt"
	"devstore/server/internal/pkg/mysqlx"
	"devstore/server/internal/pkg/otelx"
	"devstore/server/internal/pkg/rabbitmqx"
	"devstore/server/internal/pkg/redisx"
	"devstore/server/internal/pkg/validatorx"
	"devstore/server/internal/router"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type App struct {
	Config        *config.Config
	Router        *gin.Engine
	Logger        *zap.Logger
	ShutdownTrace func(context.Context) error
}

func New(ctx context.Context, cfgPath string) (*App, error) {
	cfg, err := config.Load(cfgPath)
	if err != nil {
		return nil, err
	}
	log, err := logger.New(cfg.Log)
	if err != nil {
		return nil, fmt.Errorf("init logger failed: %w", err)
	}
	if err := validatorx.Init(); err != nil {
		return nil, err
	}
	db, err := mysqlx.New(cfg.MySQL)
	if err != nil {
		return nil, err
	}
	if err := ensureSchema(db); err != nil {
		return nil, err
	}
	redisClient, err := redisx.New(cfg.Redis)
	if err != nil {
		return nil, err
	}
	rabbitConn, err := rabbitmqx.New(cfg.RabbitMQ)
	if err != nil {
		return nil, err
	}
	shutdownTrace, err := otelx.Init(ctx, cfg.OTel)
	if err != nil {
		return nil, err
	}
	cardSecretCodec, err := cardsecretx.NewCodec(cfg.CardSecret.EncryptionKey, cfg.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("init card secret codec failed: %w", err)
	}

	jwtManager := jwtpkg.New(cfg.JWT)
	mqPub := mqproducer.New(rabbitConn)
	if err := mqconsumer.NewSeckillOrderConsumer(db, redisClient, rabbitConn).Start(ctx); err != nil {
		return nil, fmt.Errorf("start seckill consumer failed: %w", err)
	}
	if err := mqconsumer.NewPaymentSuccessConsumer(db, redisClient, rabbitConn).Start(ctx); err != nil {
		return nil, fmt.Errorf("start payment consumer failed: %w", err)
	}
	if err := mqconsumer.NewOrderCloseConsumer(db, redisClient, rabbitConn).Start(ctx); err != nil {
		return nil, fmt.Errorf("start order close consumer failed: %w", err)
	}
	authRepository := authrepo.New(db)
	authService := authsvc.New(authRepository, jwtManager)
	adminRepository := adminrepo.New(db)
	cardSecretRepository := cardsecretrepo.New(db)
	adminService := adminsvc.New(adminRepository, jwtManager, cardSecretRepository)
	oauthProvider := oauthprovider.NewLinuxDOProvider(cfg.OAuth.LinuxDO)
	oauthRepository := oauthrepo.New(db)
	oauthService := oauthsvc.New(oauthProvider, oauthRepository, jwtManager)
	productRepository := productrepo.New(db)
	productService := productsvc.New(productRepository, redisClient)
	categoryRepository := categoryrepo.New(db)
	categoryService := categorysvc.New(categoryRepository)
	reviewRepository := reviewrepo.New(db)
	reviewService := reviewsvc.New(reviewRepository)
	cartRepository := cartrepo.New(db)
	cartService := cartsvc.New(cartRepository)
	orderRepository := orderrepo.New(db)
	orderService := ordersvc.New(orderRepository, mqPub, redisClient, cardSecretRepository)
	paymentRepository := paymentrepo.New(db, cardSecretRepository)
	paymentService := paymentsvc.New(paymentRepository, mqPub)
	seckillRepository := seckillrepo.New(db)
	seckillService := seckillsvc.New(seckillRepository, redisClient, mqPub)
	signRepository := signrepo.New(db)
	signService := signsvc.New(signRepository, redisClient)
	userRepository := userrepo.New(db)
	userService := usersvc.New(userRepository)
	walletRepository := walletrepo.New(db)
	walletService := walletsvc.New(walletRepository)
	wishlistRepository := wishlistrepo.New(db)
	wishlistService := wishlistsvc.New(wishlistRepository)
	announcementRepository := announcementrepo.New(db)
	announcementService := announcementsvc.New(announcementRepository)
	couponRepository := couponrepo.New(db)
	couponService := couponsvc.New(couponRepository)
	campaignRepository := campaignrepo.New(db)
	campaignService := campaignsvc.New(campaignRepository)
	cardSecretService := cardsecretsvc.New(cardSecretRepository, cardSecretCodec)

	engine := router.New(cfg, db, redisClient, log, jwtManager, router.Handlers{
		Health:       healthhandler.New(),
		Auth:         authhandler.New(authService),
		User:         userhandler.New(userService),
		Admin:        adminhandler.New(adminService),
		OAuth:        oauthhandler.New(oauthService),
		Product:      producthandler.New(productService),
		Review:       reviewhandler.New(reviewService),
		Category:     categoryhandler.New(categoryService),
		Cart:         carthandler.New(cartService),
		Order:        orderhandler.New(orderService),
		Payment:      paymenthandler.New(paymentService),
		Seckill:      seckillhandler.New(seckillService),
		Sign:         signhandler.New(signService),
		Coupon:       couponhandler.New(couponService),
		Campaign:     campaignhandler.New(campaignService),
		Announcement: announcementhandler.New(announcementService),
		Wallet:       wallethandler.New(walletService),
		Wishlist:     wishlisthandler.New(wishlistService),
		CardSecret:   cardsecrethandler.New(cardSecretService),
	})
	return &App{Config: cfg, Router: engine, Logger: log, ShutdownTrace: shutdownTrace}, nil
}
