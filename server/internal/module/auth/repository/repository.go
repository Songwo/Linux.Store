package repository

import (
	"context"

	"devstore/server/internal/model"
	"gorm.io/gorm"
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) CreateUser(ctx context.Context, user *model.User, auth *model.UserAuth) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(user).Error; err != nil {
			return err
		}
		auth.UserID = user.ID
		if err := tx.Create(auth).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.UserBalanceAccount{UserID: user.ID, Balance: 0, FrozenBalance: 0, Version: 0}).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.UserPointsAccount{UserID: user.ID, Points: 0, TotalPoints: 0, UsedPoints: 0, Version: 0}).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *Repository) GetUserAuthByIdentifier(ctx context.Context, identifier string) (*model.UserAuth, error) {
	var auth model.UserAuth
	if err := r.db.WithContext(ctx).Where("identifier = ?", identifier).First(&auth).Error; err != nil {
		return nil, err
	}
	return &auth, nil
}

func (r *Repository) GetUserByID(ctx context.Context, userID uint64) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
