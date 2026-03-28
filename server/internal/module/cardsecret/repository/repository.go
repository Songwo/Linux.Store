package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrCardSecretStockNotEnough  = errors.New("card secret stock not enough")
	ErrCardSecretItemUnavailable = errors.New("card secret item unavailable")
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

type SKUOption struct {
	ProductID     uint64 `json:"product_id"`
	SKUID         uint64 `json:"sku_id"`
	ProductName   string `json:"product_name"`
	SKUTitle      string `json:"sku_title"`
	SKUCode       string `json:"sku_code"`
	ProductStatus int8   `json:"product_status"`
	SKUStatus     int8   `json:"sku_status"`
}

type ProfileListItem struct {
	ID             uint64     `json:"id"`
	ProductID      uint64     `json:"product_id"`
	SKUID          uint64     `json:"sku_id"`
	ProfileName    string     `json:"profile_name"`
	ProductName    string     `json:"product_name"`
	SKUTitle       string     `json:"sku_title"`
	SKUCode        string     `json:"sku_code"`
	ProductURL     string     `json:"product_url"`
	RedeemURL      string     `json:"redeem_url"`
	GuideText      string     `json:"guide_text"`
	PrivacyNote    string     `json:"privacy_note"`
	SupportContact string     `json:"support_contact"`
	Status         int8       `json:"status"`
	AvailableCount int64      `json:"available_count"`
	AssignedCount  int64      `json:"assigned_count"`
	RedeemedCount  int64      `json:"redeemed_count"`
	DisabledCount  int64      `json:"disabled_count"`
	CreatedAt      *time.Time `json:"created_at,omitempty"`
	UpdatedAt      *time.Time `json:"updated_at,omitempty"`
}

type AdminItemListItem struct {
	ID            uint64     `json:"id"`
	ProfileID     uint64     `json:"profile_id"`
	ProductID     uint64     `json:"product_id"`
	SKUID         uint64     `json:"sku_id"`
	BatchNo       string     `json:"batch_no"`
	MaskedSummary string     `json:"masked_summary"`
	Status        int8       `json:"status"`
	OrderNo       string     `json:"order_no"`
	UserID        *uint64    `json:"user_id,omitempty"`
	ProductName   string     `json:"product_name"`
	SKUTitle      string     `json:"sku_title"`
	SKUCode       string     `json:"sku_code"`
	ProfileName   string     `json:"profile_name"`
	AssignedAt    *time.Time `json:"assigned_at,omitempty"`
	RevealedAt    *time.Time `json:"revealed_at,omitempty"`
	RevealCount   int64      `json:"reveal_count"`
	RedeemedAt    *time.Time `json:"redeemed_at,omitempty"`
	DisabledAt    *time.Time `json:"disabled_at,omitempty"`
	CreatedAt     *time.Time `json:"created_at,omitempty"`
	UpdatedAt     *time.Time `json:"updated_at,omitempty"`
}

type UserCardListItem struct {
	ID             uint64     `json:"id"`
	ProfileID      uint64     `json:"profile_id"`
	ProductID      uint64     `json:"product_id"`
	SKUID          uint64     `json:"sku_id"`
	OrderNo        string     `json:"order_no"`
	BatchNo        string     `json:"batch_no"`
	MaskedSummary  string     `json:"masked_summary"`
	Status         int8       `json:"status"`
	ProductName    string     `json:"product_name"`
	SKUTitle       string     `json:"sku_title"`
	SKUCode        string     `json:"sku_code"`
	ProfileName    string     `json:"profile_name"`
	ProductURL     string     `json:"product_url"`
	RedeemURL      string     `json:"redeem_url"`
	GuideText      string     `json:"guide_text"`
	PrivacyNote    string     `json:"privacy_note"`
	SupportContact string     `json:"support_contact"`
	AssignedAt     *time.Time `json:"assigned_at,omitempty"`
	RevealedAt     *time.Time `json:"revealed_at,omitempty"`
	RevealCount    int64      `json:"reveal_count"`
	RedeemedAt     *time.Time `json:"redeemed_at,omitempty"`
	CreatedAt      *time.Time `json:"created_at,omitempty"`
}

type OrderCardSummary struct {
	ID            uint64     `json:"id"`
	OrderNo       string     `json:"order_no"`
	ProfileID     uint64     `json:"profile_id"`
	ProductID     uint64     `json:"product_id"`
	SKUID         uint64     `json:"sku_id"`
	MaskedSummary string     `json:"masked_summary"`
	Status        int8       `json:"status"`
	ProductName   string     `json:"product_name"`
	SKUTitle      string     `json:"sku_title"`
	SKUCode       string     `json:"sku_code"`
	ProfileName   string     `json:"profile_name"`
	ProductURL    string     `json:"product_url"`
	RedeemURL     string     `json:"redeem_url"`
	AssignedAt    *time.Time `json:"assigned_at,omitempty"`
	RevealedAt    *time.Time `json:"revealed_at,omitempty"`
	RevealCount   int64      `json:"reveal_count"`
	RedeemedAt    *time.Time `json:"redeemed_at,omitempty"`
}

type OwnedCardRecord struct {
	Item        model.CardSecretItem
	Profile     model.CardSecretProfile
	ProductName string
	SKUTitle    string
	SKUCode     string
}

func (r *Repository) ListSKUOptions(ctx context.Context) ([]SKUOption, error) {
	var rows []SKUOption
	err := r.db.WithContext(ctx).
		Table("product_skus ps").
		Select("ps.id as sku_id, ps.product_id, COALESCE(p.name, '') as product_name, COALESCE(ps.title, '') as sku_title, COALESCE(ps.sku_code, '') as sku_code, p.status as product_status, ps.status as sku_status").
		Joins("join products p on p.id = ps.product_id").
		Where("p.deleted_at IS NULL").
		Order("p.id desc, ps.id asc").
		Find(&rows).Error
	return rows, err
}

func (r *Repository) GetSKUOptionByID(ctx context.Context, skuID uint64) (*SKUOption, error) {
	var row SKUOption
	err := r.db.WithContext(ctx).
		Table("product_skus ps").
		Select("ps.id as sku_id, ps.product_id, COALESCE(p.name, '') as product_name, COALESCE(ps.title, '') as sku_title, COALESCE(ps.sku_code, '') as sku_code, p.status as product_status, ps.status as sku_status").
		Joins("join products p on p.id = ps.product_id").
		Where("ps.id = ? AND p.deleted_at IS NULL", skuID).
		First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *Repository) GetProfileByID(ctx context.Context, id uint64) (*model.CardSecretProfile, error) {
	var profile model.CardSecretProfile
	if err := r.db.WithContext(ctx).First(&profile, id).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *Repository) GetProfileBySKU(ctx context.Context, skuID uint64) (*model.CardSecretProfile, error) {
	var profile model.CardSecretProfile
	if err := r.db.WithContext(ctx).Where("sku_id = ?", skuID).First(&profile).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *Repository) CreateProfile(ctx context.Context, profile *model.CardSecretProfile) error {
	return r.db.WithContext(ctx).Create(profile).Error
}

func (r *Repository) UpdateProfile(ctx context.Context, profile *model.CardSecretProfile) error {
	return r.db.WithContext(ctx).
		Model(&model.CardSecretProfile{}).
		Where("id = ?", profile.ID).
		Select("ProductID", "SKUID", "ProfileName", "ProductURL", "RedeemURL", "GuideText", "PrivacyNote", "SupportContact", "Status").
		Updates(profile).Error
}

func (r *Repository) ListProfiles(ctx context.Context) ([]ProfileListItem, error) {
	var rows []ProfileListItem
	err := r.db.WithContext(ctx).
		Table("card_secret_profiles csp").
		Select(`csp.id, csp.product_id, csp.sku_id, csp.profile_name, csp.product_url, csp.redeem_url, csp.guide_text, csp.privacy_note, csp.support_contact, csp.status, csp.created_at, csp.updated_at,
			COALESCE(p.name, '') as product_name, COALESCE(ps.title, '') as sku_title, COALESCE(ps.sku_code, '') as sku_code,
			COALESCE(SUM(CASE WHEN csi.status = 10 THEN 1 ELSE 0 END), 0) as available_count,
			COALESCE(SUM(CASE WHEN csi.status = 20 THEN 1 ELSE 0 END), 0) as assigned_count,
			COALESCE(SUM(CASE WHEN csi.status = 30 THEN 1 ELSE 0 END), 0) as redeemed_count,
			COALESCE(SUM(CASE WHEN csi.status = 40 THEN 1 ELSE 0 END), 0) as disabled_count`).
		Joins("left join products p on p.id = csp.product_id").
		Joins("left join product_skus ps on ps.id = csp.sku_id").
		Joins("left join card_secret_items csi on csi.profile_id = csp.id").
		Group("csp.id, csp.product_id, csp.sku_id, csp.profile_name, csp.product_url, csp.redeem_url, csp.guide_text, csp.privacy_note, csp.support_contact, csp.status, csp.created_at, csp.updated_at, p.name, ps.title, ps.sku_code").
		Order("csp.id desc").
		Find(&rows).Error
	return rows, err
}

func (r *Repository) ImportItems(ctx context.Context, items []model.CardSecretItem) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(&items).Error
}

func (r *Repository) ListAdminItems(ctx context.Context, profileID uint64, status, keyword string, page, pageSize int) ([]AdminItemListItem, int64, error) {
	page, pageSize = normalizePage(page, pageSize)
	base := r.db.WithContext(ctx).
		Table("card_secret_items csi").
		Select(`csi.id, csi.profile_id, csi.product_id, csi.sku_id, csi.batch_no, csi.masked_summary, csi.status, csi.order_no, csi.user_id,
			csi.assigned_at, csi.revealed_at, csi.reveal_count, csi.redeemed_at, csi.disabled_at, csi.created_at, csi.updated_at,
			COALESCE(p.name, '') as product_name, COALESCE(ps.title, '') as sku_title, COALESCE(ps.sku_code, '') as sku_code,
			COALESCE(csp.profile_name, '') as profile_name`).
		Joins("left join card_secret_profiles csp on csp.id = csi.profile_id").
		Joins("left join products p on p.id = csi.product_id").
		Joins("left join product_skus ps on ps.id = csi.sku_id")
	if profileID > 0 {
		base = base.Where("csi.profile_id = ?", profileID)
	}
	if strings.TrimSpace(status) != "" && status != "all" {
		base = base.Where("csi.status = ?", status)
	}
	if keyword = strings.TrimSpace(keyword); keyword != "" {
		like := "%" + keyword + "%"
		base = base.Where("csi.order_no like ? OR csi.batch_no like ? OR csi.masked_summary like ? OR p.name like ? OR ps.title like ?", like, like, like, like, like)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []AdminItemListItem
	err := base.Order("csi.id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

func (r *Repository) UpdateUnusedItemStatus(ctx context.Context, id uint64, status int8) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var item model.CardSecretItem
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&item, id).Error; err != nil {
			return err
		}
		if item.Status != 10 && item.Status != 40 {
			return ErrCardSecretItemUnavailable
		}
		if item.UserID != nil || strings.TrimSpace(item.OrderNo) != "" {
			return ErrCardSecretItemUnavailable
		}
		now := time.Now()
		updates := map[string]interface{}{"status": status}
		if status == 40 {
			updates["disabled_at"] = &now
		} else {
			updates["disabled_at"] = nil
		}
		return tx.Model(&model.CardSecretItem{}).Where("id = ?", id).Updates(updates).Error
	})
}

func (r *Repository) AllocateForOrderItem(tx *gorm.DB, order *model.Order, item model.OrderItem) (bool, []model.CardSecretItem, error) {
	var profile model.CardSecretProfile
	if err := tx.Where("sku_id = ? AND status = 1", item.SKUID).First(&profile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil, nil
		}
		return false, nil, err
	}
	if item.Quantity <= 0 {
		return true, nil, nil
	}
	var cards []model.CardSecretItem
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("profile_id = ? AND status = ?", profile.ID, 10).
		Order("id asc").
		Limit(item.Quantity).
		Find(&cards).Error; err != nil {
		return true, nil, err
	}
	if len(cards) != item.Quantity {
		return true, nil, ErrCardSecretStockNotEnough
	}
	ids := make([]uint64, 0, len(cards))
	for _, card := range cards {
		ids = append(ids, card.ID)
	}
	now := time.Now()
	result := tx.Model(&model.CardSecretItem{}).
		Where("id IN ? AND status = ?", ids, 10).
		Updates(map[string]interface{}{
			"status":        20,
			"order_no":      order.OrderNo,
			"order_item_id": item.ID,
			"user_id":       order.UserID,
			"assigned_at":   &now,
			"disabled_at":   nil,
		})
	if result.Error != nil {
		return true, nil, result.Error
	}
	if result.RowsAffected != int64(len(ids)) {
		return true, nil, ErrCardSecretStockNotEnough
	}
	userID := order.UserID
	orderItemID := item.ID
	for i := range cards {
		cards[i].Status = 20
		cards[i].OrderNo = order.OrderNo
		cards[i].UserID = &userID
		cards[i].OrderItemID = &orderItemID
		cards[i].AssignedAt = &now
	}
	return true, cards, nil
}

func (r *Repository) ListOwnedCards(ctx context.Context, userID uint64, orderNo string) ([]UserCardListItem, error) {
	base := r.db.WithContext(ctx).
		Table("card_secret_items csi").
		Select(`csi.id, csi.profile_id, csi.product_id, csi.sku_id, csi.order_no, csi.batch_no, csi.masked_summary, csi.status,
			csi.assigned_at, csi.revealed_at, csi.reveal_count, csi.redeemed_at, csi.created_at,
			COALESCE(p.name, '') as product_name, COALESCE(ps.title, '') as sku_title, COALESCE(ps.sku_code, '') as sku_code,
			COALESCE(csp.profile_name, '') as profile_name, COALESCE(csp.product_url, '') as product_url, COALESCE(csp.redeem_url, '') as redeem_url,
			COALESCE(csp.guide_text, '') as guide_text, COALESCE(csp.privacy_note, '') as privacy_note, COALESCE(csp.support_contact, '') as support_contact`).
		Joins("left join card_secret_profiles csp on csp.id = csi.profile_id").
		Joins("left join products p on p.id = csi.product_id").
		Joins("left join product_skus ps on ps.id = csi.sku_id").
		Where("csi.user_id = ?", userID)
	if orderNo = strings.TrimSpace(orderNo); orderNo != "" {
		base = base.Where("csi.order_no = ?", orderNo)
	}
	var rows []UserCardListItem
	err := base.Order("csi.id desc").Find(&rows).Error
	return rows, err
}

func (r *Repository) ListOrderCards(ctx context.Context, orderNo string) ([]OrderCardSummary, error) {
	var rows []OrderCardSummary
	err := r.db.WithContext(ctx).
		Table("card_secret_items csi").
		Select(`csi.id, csi.order_no, csi.profile_id, csi.product_id, csi.sku_id, csi.masked_summary, csi.status,
			csi.assigned_at, csi.revealed_at, csi.reveal_count, csi.redeemed_at,
			COALESCE(p.name, '') as product_name, COALESCE(ps.title, '') as sku_title, COALESCE(ps.sku_code, '') as sku_code,
			COALESCE(csp.profile_name, '') as profile_name, COALESCE(csp.product_url, '') as product_url, COALESCE(csp.redeem_url, '') as redeem_url`).
		Joins("left join card_secret_profiles csp on csp.id = csi.profile_id").
		Joins("left join products p on p.id = csi.product_id").
		Joins("left join product_skus ps on ps.id = csi.sku_id").
		Where("csi.order_no = ?", strings.TrimSpace(orderNo)).
		Order("csi.id asc").
		Find(&rows).Error
	return rows, err
}

func (r *Repository) RevealOwnedCard(ctx context.Context, userID, id uint64, ip, userAgent string) (*OwnedCardRecord, error) {
	var record *OwnedCardRecord
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		locked, err := r.lockOwnedCard(tx, userID, id)
		if err != nil {
			return err
		}
		now := time.Now()
		if err := tx.Model(&model.CardSecretItem{}).Where("id = ?", locked.Item.ID).Updates(map[string]interface{}{
			"reveal_count": gorm.Expr("reveal_count + 1"),
			"revealed_at":  &now,
		}).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.CardSecretAccessLog{
			CardSecretItemID: locked.Item.ID,
			ProfileID:        locked.Item.ProfileID,
			UserID:           userID,
			Action:           "reveal",
			IP:               strings.TrimSpace(ip),
			UserAgent:        truncate(userAgent, 500),
			CreatedAt:        &now,
		}).Error; err != nil {
			return err
		}
		locked.Item.RevealCount++
		locked.Item.RevealedAt = &now
		record = locked
		return nil
	})
	if err != nil {
		return nil, err
	}
	return record, nil
}

func (r *Repository) RedeemOwnedCard(ctx context.Context, userID, id uint64, ip, userAgent string) (*OwnedCardRecord, error) {
	var record *OwnedCardRecord
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		locked, err := r.lockOwnedCard(tx, userID, id)
		if err != nil {
			return err
		}
		now := time.Now()
		if locked.Item.Status == 20 {
			if err := tx.Model(&model.CardSecretItem{}).Where("id = ? AND status = ?", locked.Item.ID, 20).Updates(map[string]interface{}{
				"status":      30,
				"redeemed_at": &now,
			}).Error; err != nil {
				return err
			}
			locked.Item.Status = 30
			locked.Item.RedeemedAt = &now
		}
		if err := tx.Create(&model.CardSecretAccessLog{
			CardSecretItemID: locked.Item.ID,
			ProfileID:        locked.Item.ProfileID,
			UserID:           userID,
			Action:           "redeem",
			IP:               strings.TrimSpace(ip),
			UserAgent:        truncate(userAgent, 500),
			CreatedAt:        &now,
		}).Error; err != nil {
			return err
		}
		record = locked
		return nil
	})
	if err != nil {
		return nil, err
	}
	return record, nil
}

func (r *Repository) lockOwnedCard(tx *gorm.DB, userID, id uint64) (*OwnedCardRecord, error) {
	var item model.CardSecretItem
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		return nil, err
	}
	if item.Status != 20 && item.Status != 30 {
		return nil, ErrCardSecretItemUnavailable
	}
	var profile model.CardSecretProfile
	if err := tx.Where("id = ?", item.ProfileID).First(&profile).Error; err != nil {
		return nil, err
	}
	var meta struct {
		ProductName string `gorm:"column:product_name"`
		SKUTitle    string `gorm:"column:sku_title"`
		SKUCode     string `gorm:"column:sku_code"`
	}
	if err := tx.Table("product_skus ps").
		Select("COALESCE(p.name, '') as product_name, COALESCE(ps.title, '') as sku_title, COALESCE(ps.sku_code, '') as sku_code").
		Joins("left join products p on p.id = ps.product_id").
		Where("ps.id = ?", item.SKUID).
		Scan(&meta).Error; err != nil {
		return nil, err
	}
	return &OwnedCardRecord{Item: item, Profile: profile, ProductName: meta.ProductName, SKUTitle: meta.SKUTitle, SKUCode: meta.SKUCode}, nil
}

func normalizePage(page, pageSize int) (int, int) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 200 {
		pageSize = 20
	}
	return page, pageSize
}

func truncate(value string, limit int) string {
	value = strings.TrimSpace(value)
	if limit <= 0 || len(value) <= limit {
		return value
	}
	return value[:limit]
}
