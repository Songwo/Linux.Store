package dto

type SignStatusResponse struct {
	TodaySigned   bool  `json:"today_signed"`
	StreakDays    int   `json:"streak_days"`
	TodayReward   int64 `json:"today_reward"`
	RewardBalance int64 `json:"reward_balance"`
}

type SignHistoryItem struct {
	SignDate       string `json:"sign_date"`
	StreakDays     int    `json:"streak_days"`
	RewardPoints   int64  `json:"reward_points"`
	RewardBalance  int64  `json:"reward_balance"`
}
