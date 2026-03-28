package service

import (
	"context"
	"time"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	announcementdto "devstore/server/internal/module/announcement/dto"
	announcementrepo "devstore/server/internal/module/announcement/repository"
)

type Service struct{ repo *announcementrepo.Repository }

func New(repo *announcementrepo.Repository) *Service { return &Service{repo: repo} }

func (s *Service) PublicList(ctx context.Context) ([]model.Announcement, *apperr.AppError) {
	rows, err := s.repo.ListPublic(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load announcements failed", err)
	}
	return rows, nil
}

func (s *Service) AdminList(ctx context.Context, query announcementdto.ListQuery) (map[string]interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListAdmin(ctx, query.Status, query.Page, query.PageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin announcements failed", err)
	}
	return map[string]interface{}{"list": rows, "total": total, "page": query.Page, "page_size": query.PageSize}, nil
}

func (s *Service) Create(ctx context.Context, req announcementdto.AdminUpsertRequest) (*model.Announcement, *apperr.AppError) {
	startAt, endAt, appErr := parseRange(req.StartAt, req.EndAt)
	if appErr != nil {
		return nil, appErr
	}
	row := &model.Announcement{Title: req.Title, Content: req.Content, Link: req.Link, Level: normalizeLevel(req.Level), Sort: req.Sort, Pinned: req.Pinned, Status: normalizeStatus(req.Status), StartAt: startAt, EndAt: endAt}
	if err := s.repo.Create(ctx, row); err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "create announcement failed", err)
	}
	return row, nil
}

func (s *Service) Update(ctx context.Context, id uint64, req announcementdto.AdminUpsertRequest) (*model.Announcement, *apperr.AppError) {
	row, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeNotFound, "announcement not found", err)
	}
	startAt, endAt, appErr := parseRange(req.StartAt, req.EndAt)
	if appErr != nil {
		return nil, appErr
	}
	row.Title = req.Title
	row.Content = req.Content
	row.Link = req.Link
	row.Level = normalizeLevel(req.Level)
	row.Sort = req.Sort
	row.Pinned = req.Pinned
	row.Status = normalizeStatus(req.Status)
	row.StartAt = startAt
	row.EndAt = endAt
	if err := s.repo.Update(ctx, row); err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "update announcement failed", err)
	}
	return row, nil
}

func normalizeLevel(level string) string {
	switch level {
	case "success", "warning", "danger":
		return level
	default:
		return "info"
	}
}

func normalizeStatus(status int8) int8 {
	if status == 0 {
		return 0
	}
	return 1
}

func parseRange(start, end string) (*time.Time, *time.Time, *apperr.AppError) {
	var startAt *time.Time
	var endAt *time.Time
	if start != "" {
		parsed, err := time.Parse(time.DateTime, start)
		if err != nil {
			return nil, nil, apperr.Wrap(apperr.CodeValidationError, "invalid start_at", err)
		}
		startAt = &parsed
	}
	if end != "" {
		parsed, err := time.Parse(time.DateTime, end)
		if err != nil {
			return nil, nil, apperr.Wrap(apperr.CodeValidationError, "invalid end_at", err)
		}
		endAt = &parsed
	}
	return startAt, endAt, nil
}
