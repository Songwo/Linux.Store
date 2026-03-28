package service

import (
	"context"
	"strconv"
	"strings"
	"time"

	apperr "devstore/server/internal/common/errors"
	signdto "devstore/server/internal/module/sign/dto"
	signrepo "devstore/server/internal/module/sign/repository"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Service struct {
	repo  *signrepo.Repository
	redis *redis.Client
}

func New(repo *signrepo.Repository, redisClient *redis.Client) *Service {
	return &Service{repo: repo, redis: redisClient}
}

func (s *Service) Status(ctx context.Context, userID uint64) (*signdto.SignStatusResponse, *apperr.AppError) {
	userIDStr := strconv.FormatUint(userID, 10)
	today := time.Now().Format("2006-01-02")
	statusKey := "devstore:prod:sign:status:" + userIDStr + ":" + strings.ReplaceAll(today, "-", "")
	if ok, _ := s.redis.Exists(ctx, statusKey).Result(); ok > 0 {
		streak, _ := s.redis.Get(ctx, "devstore:prod:sign:streak:"+userIDStr).Int()
		reward := calcReward(streak)
		return &signdto.SignStatusResponse{TodaySigned: true, StreakDays: streak, TodayReward: reward, RewardBalance: reward}, nil
	}
	latest, err := s.repo.GetLatestRecord(ctx, userID)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load sign status failed", err)
	}
	if err == gorm.ErrRecordNotFound {
		return &signdto.SignStatusResponse{TodaySigned: false, StreakDays: 0, TodayReward: 10, RewardBalance: 10}, nil
	}
	reward := calcReward(latest.StreakDays + 1)
	return &signdto.SignStatusResponse{TodaySigned: latest.SignDate.Format("2006-01-02") == today, StreakDays: latest.StreakDays, TodayReward: reward, RewardBalance: reward}, nil
}

func (s *Service) Sign(ctx context.Context, userID uint64) (interface{}, *apperr.AppError) {
	userIDStr := strconv.FormatUint(userID, 10)
	now := time.Now()
	todayStr := now.Format("2006-01-02")
	statusKey := "devstore:prod:sign:status:" + userIDStr + ":" + strings.ReplaceAll(todayStr, "-", "")
	locked, err := s.redis.SetNX(ctx, statusKey, "1", 48*time.Hour).Result()
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "set sign status failed", err)
	}
	if !locked {
		return nil, apperr.New(apperr.CodeSignAlreadyDone, "already signed today")
	}

	todayDate, _ := time.Parse("2006-01-02", todayStr)
	if _, err := s.repo.GetTodayRecord(ctx, userID, todayDate); err == nil {
		return nil, apperr.New(apperr.CodeSignAlreadyDone, "already signed today")
	}
	latest, err := s.repo.GetLatestRecord(ctx, userID)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load latest sign failed", err)
	}
	streak := 1
	if err == nil {
		yesterday := todayDate.AddDate(0, 0, -1).Format("2006-01-02")
		if latest.SignDate.Format("2006-01-02") == yesterday {
			streak = latest.StreakDays + 1
		}
	}
	reward := calcReward(streak)
	if err := s.repo.Sign(ctx, userID, todayDate, streak, reward); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return nil, apperr.New(apperr.CodeSignAlreadyDone, "already signed today")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "sign failed", err)
	}
	_ = s.redis.Set(ctx, "devstore:prod:sign:streak:"+userIDStr, streak, 30*24*time.Hour).Err()
	return map[string]interface{}{"today_signed": true, "streak_days": streak, "reward_points": reward, "reward_balance": reward, "today_reward": reward}, nil
}

func (s *Service) History(ctx context.Context, userID uint64, month string) (interface{}, *apperr.AppError) {
	base := time.Now()
	if strings.TrimSpace(month) != "" {
		parsed, err := time.Parse("2006-01", month)
		if err != nil {
			return nil, apperr.Wrap(apperr.CodeValidationError, "invalid month", err)
		}
		base = parsed
	}
	from := time.Date(base.Year(), base.Month(), 1, 0, 0, 0, 0, base.Location())
	to := from.AddDate(0, 1, -1)
	rows, err := s.repo.ListHistory(ctx, userID, from, to)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load sign history failed", err)
	}
	list := make([]signdto.SignHistoryItem, 0, len(rows))
	for _, row := range rows {
		list = append(list, signdto.SignHistoryItem{SignDate: row.SignDate.Format("2006-01-02"), StreakDays: row.StreakDays, RewardPoints: row.RewardPoints, RewardBalance: row.RewardPoints})
	}
	return map[string]interface{}{"month": from.Format("2006-01"), "list": list}, nil
}

func calcReward(streak int) int64 {
	if streak >= 7 {
		return 50
	}
	if streak >= 3 {
		return 20
	}
	return 10
}
