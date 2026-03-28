package router

import (
	"net/http"
	"time"

	"devstore/server/internal/config"
	"devstore/server/internal/middleware"
	adminhandler "devstore/server/internal/module/admin/handler"
	announcementhandler "devstore/server/internal/module/announcement/handler"
	authhandler "devstore/server/internal/module/auth/handler"
	campaignhandler "devstore/server/internal/module/campaign/handler"
	cardsecrethandler "devstore/server/internal/module/cardsecret/handler"
	carthandler "devstore/server/internal/module/cart/handler"
	categoryhandler "devstore/server/internal/module/category/handler"
	couponhandler "devstore/server/internal/module/coupon/handler"
	healthhandler "devstore/server/internal/module/health/handler"
	oauthhandler "devstore/server/internal/module/oauth/handler"
	orderhandler "devstore/server/internal/module/order/handler"
	paymenthandler "devstore/server/internal/module/payment/handler"
	producthandler "devstore/server/internal/module/product/handler"
	reviewhandler "devstore/server/internal/module/review/handler"
	seckillhandler "devstore/server/internal/module/seckill/handler"
	signhandler "devstore/server/internal/module/sign/handler"
	userhandler "devstore/server/internal/module/user/handler"
	wallethandler "devstore/server/internal/module/wallet/handler"
	wishlisthandler "devstore/server/internal/module/wishlist/handler"
	jwtpkg "devstore/server/internal/pkg/jwt"
	"devstore/server/internal/pkg/metrics"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Handlers struct {
	Health       *healthhandler.Handler
	Auth         *authhandler.Handler
	User         *userhandler.Handler
	Admin        *adminhandler.Handler
	OAuth        *oauthhandler.Handler
	Product      *producthandler.Handler
	Review       *reviewhandler.Handler
	Category     *categoryhandler.Handler
	Cart         *carthandler.Handler
	Order        *orderhandler.Handler
	Payment      *paymenthandler.Handler
	Seckill      *seckillhandler.Handler
	Sign         *signhandler.Handler
	Coupon       *couponhandler.Handler
	Campaign     *campaignhandler.Handler
	Announcement *announcementhandler.Handler
	Wallet       *wallethandler.Handler
	Wishlist     *wishlisthandler.Handler
	CardSecret   *cardsecrethandler.Handler
}

func New(cfg *config.Config, db *gorm.DB, redisClient *redis.Client, log *zap.Logger, jwt *jwtpkg.Manager, handlers Handlers) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	metrics.Register()
	r := gin.New()
	r.Use(middleware.RequestID(), middleware.Recovery(), middleware.Logger(log), middleware.RateLimit(cfg.RateLimit.GlobalRPS, cfg.RateLimit.Burst))
	r.Use(otelgin.Middleware(cfg.OTel.ServiceName))

	r.GET("/metrics", gin.WrapH(promhttp.Handler()))
	r.GET("/ping", handlers.Health.Ping)
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"service": "devstore-server", "version": "0.1.0", "status": "running"})
	})

	api := r.Group("/api/v1")
	api.Use(middleware.OperationLog(db, log))
	api.POST("/auth/register", handlers.Auth.Register)
	api.POST("/auth/login", handlers.Auth.Login)
	api.GET("/auth/oauth/linux-do/authorize", handlers.OAuth.Authorize)
	api.GET("/auth/oauth/linux-do/callback", handlers.OAuth.Callback)
	api.GET("/categories", handlers.Category.List)
	api.GET("/products", handlers.Product.ProductList)
	api.GET("/products/:id", handlers.Product.ProductDetail)
	api.GET("/products/:id/reviews", handlers.Review.ListReviews)
	api.GET("/campaigns", handlers.Campaign.List)
	api.GET("/seckill/goods", handlers.Seckill.ListGoods)
	api.GET("/coupon/templates", handlers.Coupon.TemplateList)
	api.GET("/announcements", handlers.Announcement.PublicList)
	api.POST("/admin/auth/login", handlers.Admin.Login)

	userGroup := api.Group("/user")
	userGroup.Use(middleware.Auth(jwt), middleware.UserRateLimit(cfg.RateLimit.UserRPS, cfg.RateLimit.Burst))
	userGroup.GET("/profile", handlers.User.Profile)
	userGroup.GET("/center", handlers.User.Center)
	userGroup.POST("/products/:id/reviews", handlers.Review.CreateReview)
	userGroup.POST("/oauth/linux-do/bind", handlers.OAuth.Bind)
	userGroup.GET("/cart", handlers.Cart.List)
	userGroup.POST("/cart/items", handlers.Cart.AddItem)
	userGroup.DELETE("/cart/items/:skuId", handlers.Cart.Remove)
	userGroup.PUT("/cart/items/:skuId/checked", handlers.Cart.UpdateChecked)
	userGroup.PUT("/cart/items/:skuId/quantity", handlers.Cart.UpdateQuantity)
	userGroup.GET("/orders", handlers.Order.List)
	userGroup.GET("/orders/:orderNo", handlers.Order.Detail)
	userGroup.POST("/orders", handlers.Order.Create)
	userGroup.POST("/orders/:orderNo/cancel", handlers.Order.Cancel)
	userGroup.POST("/payments/balance", handlers.Payment.BalancePay)
	userGroup.GET("/cards", handlers.CardSecret.UserList)
	userGroup.POST("/cards/:id/reveal", handlers.CardSecret.UserReveal)
	userGroup.POST("/cards/:id/redeem", handlers.CardSecret.UserRedeem)
	userGroup.POST("/seckill/purchase", middleware.RedisUserWindowLimit(redisClient, "seckill-purchase", 3, time.Second), handlers.Seckill.Purchase)
	userGroup.GET("/seckill/result", middleware.RedisUserWindowLimit(redisClient, "seckill-result", 12, 5*time.Second), handlers.Seckill.Result)
	userGroup.GET("/sign/status", handlers.Sign.Status)
	userGroup.GET("/sign/history", handlers.Sign.History)
	userGroup.POST("/sign", handlers.Sign.Sign)
	userGroup.GET("/wallet", handlers.Wallet.Summary)
	userGroup.GET("/wallet/flows", handlers.Wallet.Flows)
	userGroup.GET("/wishlist", handlers.Wishlist.List)
	userGroup.GET("/wishlist/:productId", handlers.Wishlist.Status)
	userGroup.POST("/wishlist/:productId", handlers.Wishlist.Add)
	userGroup.DELETE("/wishlist/:productId", handlers.Wishlist.Remove)
	userGroup.GET("/coupons", handlers.Coupon.UserList)
	userGroup.POST("/coupons/claim", handlers.Coupon.Claim)

	adminGroup := api.Group("/admin")
	adminGroup.Use(middleware.AdminAuth(jwt))
	adminGroup.GET("/dashboard", handlers.Admin.Dashboard)
	adminGroup.GET("/users", handlers.Admin.UserList)
	adminGroup.POST("/users/:id/wallet/adjust", handlers.Admin.AdjustUserWallet)
	adminGroup.GET("/orders", handlers.Admin.OrderList)
	adminGroup.GET("/orders/:orderNo", handlers.Admin.OrderDetail)
	adminGroup.GET("/inventory", handlers.Admin.InventoryList)
	adminGroup.POST("/inventory/:skuId/adjust", handlers.Admin.AdjustInventory)
	adminGroup.GET("/balance-flows", handlers.Admin.BalanceFlowList)
	adminGroup.GET("/points-flows", handlers.Admin.PointsFlowList)
	adminGroup.GET("/operation-logs", handlers.Admin.OperationLogList)
	adminGroup.GET("/products", handlers.Product.AdminProductList)
	adminGroup.POST("/products", handlers.Product.AdminCreateProduct)
	adminGroup.PUT("/products/:id", handlers.Product.AdminUpdateProduct)
	adminGroup.GET("/categories", handlers.Category.AdminList)
	adminGroup.POST("/categories", handlers.Category.AdminCreate)
	adminGroup.PUT("/categories/:id", handlers.Category.AdminUpdate)
	adminGroup.GET("/campaigns", handlers.Campaign.AdminList)
	adminGroup.POST("/campaigns", handlers.Campaign.Create)
	adminGroup.PUT("/campaigns/:id", handlers.Campaign.Update)
	adminGroup.DELETE("/campaigns/:id", handlers.Campaign.Delete)
	adminGroup.GET("/card-secret-skus", handlers.CardSecret.AdminSKUOptions)
	adminGroup.GET("/card-secret-profiles", handlers.CardSecret.AdminListProfiles)
	adminGroup.POST("/card-secret-profiles", handlers.CardSecret.AdminCreateProfile)
	adminGroup.PUT("/card-secret-profiles/:id", handlers.CardSecret.AdminUpdateProfile)
	adminGroup.GET("/card-secret-items", handlers.CardSecret.AdminListItems)
	adminGroup.POST("/card-secret-items/import", handlers.CardSecret.AdminImportItems)
	adminGroup.PUT("/card-secret-items/:id/status", handlers.CardSecret.AdminUpdateItemStatus)

	adminGroup.GET("/seckill/campaigns", handlers.Seckill.AdminListCampaigns)
	adminGroup.POST("/seckill/campaigns", handlers.Seckill.AdminCreateCampaign)
	adminGroup.PUT("/seckill/campaigns/:campaignId", handlers.Seckill.AdminUpdateCampaign)
	adminGroup.DELETE("/seckill/campaigns/:campaignId", handlers.Seckill.AdminDeleteCampaign)
	adminGroup.POST("/seckill/:campaignId/warmup", handlers.Seckill.Warmup)
	adminGroup.GET("/seckill/goods", handlers.Seckill.AdminListGoods)
	adminGroup.POST("/seckill/goods", handlers.Seckill.AdminAddGood)
	adminGroup.PUT("/seckill/goods/:id", handlers.Seckill.AdminUpdateGood)
	adminGroup.DELETE("/seckill/goods/:id", handlers.Seckill.AdminDeleteGood)

	adminGroup.GET("/coupon/templates", handlers.Coupon.AdminTemplateList)
	adminGroup.POST("/coupon/templates", handlers.Coupon.AdminCreateTemplate)
	adminGroup.GET("/announcements", handlers.Announcement.AdminList)
	adminGroup.POST("/announcements", handlers.Announcement.Create)
	adminGroup.PUT("/announcements/:id", handlers.Announcement.Update)
	return r
}
