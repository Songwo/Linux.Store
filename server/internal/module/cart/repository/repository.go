package repository

import (
	"context"

	"devstore/server/internal/model"
	"gorm.io/gorm"
)

type CartWithProduct struct {
	model.CartItem
	ProductName string  `gorm:"column:product_name" json:"product_name"`
	Cover       string  `gorm:"column:cover" json:"cover"`
	Price       float64 `gorm:"column:price" json:"price"`
	PointsPrice int64   `gorm:"column:points_price" json:"points_price"`
	SKUTitle    string  `gorm:"column:sku_title" json:"sku_title"`
}

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) EnsureCart(ctx context.Context, userID uint64) (*model.Cart, error) {
	var cart model.Cart
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&cart).Error; err == nil {
		return &cart, nil
	}
	cart = model.Cart{UserID: userID, Status: 1}
	if err := r.db.WithContext(ctx).Create(&cart).Error; err != nil {
		return nil, err
	}
	return &cart, nil
}

func (r *Repository) UpsertCartItem(ctx context.Context, item *model.CartItem) error {
	return r.db.WithContext(ctx).Where("user_id = ? AND sku_id = ?", item.UserID, item.SKUID).Assign(map[string]interface{}{"quantity": item.Quantity, "checked": item.Checked, "product_id": item.ProductID, "cart_id": item.CartID}).FirstOrCreate(item).Error
}

func (r *Repository) ListCartItems(ctx context.Context, userID uint64) ([]CartWithProduct, error) {
	var rows []CartWithProduct
	err := r.db.WithContext(ctx).Table("cart_items ci").Select("ci.*, p.name as product_name, p.cover, ps.price, ps.points_price, ps.title as sku_title").Joins("join products p on p.id = ci.product_id").Joins("join product_skus ps on ps.id = ci.sku_id").Where("ci.user_id = ?", userID).Order("ci.id desc").Find(&rows).Error
	return rows, err
}

func (r *Repository) DeleteCartItem(ctx context.Context, userID, skuID uint64) error {
	return r.db.WithContext(ctx).Where("user_id = ? AND sku_id = ?", userID, skuID).Delete(&model.CartItem{}).Error
}

func (r *Repository) GetSKU(ctx context.Context, skuID uint64) (*model.ProductSKU, error) {
	var sku model.ProductSKU
	if err := r.db.WithContext(ctx).First(&sku, skuID).Error; err != nil {
		return nil, err
	}
	return &sku, nil
}

func (r *Repository) GetProduct(ctx context.Context, productID uint64) (*model.Product, error) {
	var product model.Product
	if err := r.db.WithContext(ctx).First(&product, productID).Error; err != nil {
		return nil, err
	}
	return &product, nil
}
func (r *Repository) UpdateChecked(ctx context.Context, userID, skuID uint64, checked int8) error {
	return r.db.WithContext(ctx).Model(&model.CartItem{}).Where("user_id = ? AND sku_id = ?", userID, skuID).Update("checked", checked).Error
}

func (r *Repository) UpdateQuantity(ctx context.Context, userID, skuID uint64, quantity int) error {
	return r.db.WithContext(ctx).Model(&model.CartItem{}).Where("user_id = ? AND sku_id = ?", userID, skuID).Update("quantity", quantity).Error
}
