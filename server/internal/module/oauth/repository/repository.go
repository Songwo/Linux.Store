package repository

import (
	"context"
	"encoding/json"
	"strings"

	"devstore/server/internal/model"
	oauthdto "devstore/server/internal/module/oauth/dto"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) GetBindingByProviderUID(ctx context.Context, provider, providerUserID string) (*model.OAuthBinding, error) {
	var binding model.OAuthBinding
	if err := r.db.WithContext(ctx).Where("provider = ? AND provider_user_id = ?", provider, providerUserID).First(&binding).Error; err != nil {
		return nil, err
	}
	return &binding, nil
}

func (r *Repository) GetUserByID(ctx context.Context, userID uint64) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).Where("email = ?", strings.ToLower(strings.TrimSpace(email))).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) CreateOAuthUser(ctx context.Context, provider string, oauthUser *oauthdto.LinuxDOUser, accessToken string, firstLoginReward int64) (*model.User, error) {
	var created model.User
	payload, _ := json.Marshal(oauthUser)
	email := strings.ToLower(strings.TrimSpace(oauthUser.Email))
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		user := model.User{
			UUID:     uuid.NewString(),
			Nickname: oauthUser.GetNickname(),
			Avatar:   oauthUser.GetAvatarURL(),
			Status:   1,
			Source:   provider,
		}
		if email != "" {
			user.Email = &email
		}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		binding := model.OAuthBinding{
			UserID:           user.ID,
			Provider:         provider,
			ProviderUserID:   oauthUser.ID,
			ProviderUsername: oauthUser.Username,
			AccessToken:      accessToken,
			RawProfile:       string(payload),
		}
		if err := tx.Create(&binding).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.UserBalanceAccount{UserID: user.ID, Balance: 0, FrozenBalance: 0, Version: 0}).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.UserPointsAccount{UserID: user.ID, Points: firstLoginReward, TotalPoints: firstLoginReward, UsedPoints: 0, Version: 0}).Error; err != nil {
			return err
		}
		if firstLoginReward > 0 {
			flow := model.UserPointsFlow{UserID: user.ID, BizType: "first_login", BizNo: provider + ":" + oauthUser.ID, Direction: 1, Points: firstLoginReward, PointsAfter: firstLoginReward, Remark: "linux.do first login reward"}
			if err := tx.Create(&flow).Error; err != nil {
				return err
			}
		}
		created = user
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &created, nil
}

func (r *Repository) BindOAuthToUser(ctx context.Context, userID uint64, provider string, oauthUser *oauthdto.LinuxDOUser, accessToken string) error {
	payload, _ := json.Marshal(oauthUser)
	binding := model.OAuthBinding{UserID: userID, Provider: provider, ProviderUserID: oauthUser.ID, ProviderUsername: oauthUser.Username, AccessToken: accessToken, RawProfile: string(payload)}
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "provider"}, {Name: "provider_user_id"}},
		DoUpdates: clause.Assignments(map[string]interface{}{
			"user_id":           userID,
			"provider_username": oauthUser.Username,
			"access_token":      accessToken,
			"raw_profile":       string(payload),
		}),
	}).Create(&binding).Error
}
