package service

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	cardsecretdto "devstore/server/internal/module/cardsecret/dto"
	cardsecretrepo "devstore/server/internal/module/cardsecret/repository"
	"devstore/server/internal/pkg/cardsecretx"
	"gorm.io/gorm"
)

type Service struct {
	repo  *cardsecretrepo.Repository
	codec *cardsecretx.Codec
}

func New(repo *cardsecretrepo.Repository, codec *cardsecretx.Codec) *Service {
	return &Service{repo: repo, codec: codec}
}

func (s *Service) ListUserCards(ctx context.Context, userID uint64, orderNo string) (map[string]interface{}, *apperr.AppError) {
	rows, err := s.repo.ListOwnedCards(ctx, userID, strings.TrimSpace(orderNo))
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load user cards failed", err)
	}
	return map[string]interface{}{"list": rows}, nil
}

func (s *Service) Reveal(ctx context.Context, userID, id uint64, ip, userAgent string) (map[string]interface{}, *apperr.AppError) {
	record, err := s.repo.RevealOwnedCard(ctx, userID, id, ip, userAgent)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.New(apperr.CodeNotFound, "卡密不存在")
		}
		if errors.Is(err, cardsecretrepo.ErrCardSecretItemUnavailable) {
			return nil, apperr.New(apperr.CodeBadRequest, "卡密当前不可查看")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "reveal card secret failed", err)
	}
	payload, err := s.codec.DecryptPayload(record.Item.EncryptedPayload)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "decrypt card secret failed", err)
	}
	return buildUserCardResult(record, payload, false), nil
}

func (s *Service) Redeem(ctx context.Context, userID, id uint64, ip, userAgent string) (map[string]interface{}, *apperr.AppError) {
	record, err := s.repo.RedeemOwnedCard(ctx, userID, id, ip, userAgent)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.New(apperr.CodeNotFound, "卡密不存在")
		}
		if errors.Is(err, cardsecretrepo.ErrCardSecretItemUnavailable) {
			return nil, apperr.New(apperr.CodeBadRequest, "卡密当前不可兑换")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "redeem card secret failed", err)
	}
	payload, err := s.codec.DecryptPayload(record.Item.EncryptedPayload)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "decrypt card secret failed", err)
	}
	return buildUserCardResult(record, payload, true), nil
}

func (s *Service) AdminListSKUOptions(ctx context.Context) (interface{}, *apperr.AppError) {
	rows, err := s.repo.ListSKUOptions(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load sku options failed", err)
	}
	return rows, nil
}

func (s *Service) AdminListProfiles(ctx context.Context) (interface{}, *apperr.AppError) {
	rows, err := s.repo.ListProfiles(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load card secret profiles failed", err)
	}
	return rows, nil
}

func (s *Service) AdminCreateProfile(ctx context.Context, req cardsecretdto.AdminProfileSaveRequest) (interface{}, *apperr.AppError) {
	profile, _, appErr := s.normalizeProfile(ctx, 0, req)
	if appErr != nil {
		return nil, appErr
	}
	if existing, err := s.repo.GetProfileBySKU(ctx, profile.SKUID); err == nil && existing != nil {
		return nil, apperr.New(apperr.CodeValidationError, "该 SKU 已绑定卡密档案")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperr.Wrap(apperr.CodeInternalError, "check card secret profile failed", err)
	}
	if err := s.repo.CreateProfile(ctx, profile); err != nil {
		if isDuplicateError(err) {
			return nil, apperr.New(apperr.CodeValidationError, "该 SKU 已绑定卡密档案")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "create card secret profile failed", err)
	}
	return profile, nil
}

func (s *Service) AdminUpdateProfile(ctx context.Context, id uint64, req cardsecretdto.AdminProfileSaveRequest) (interface{}, *apperr.AppError) {
	if _, err := s.repo.GetProfileByID(ctx, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.New(apperr.CodeNotFound, "卡密档案不存在")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "load card secret profile failed", err)
	}
	profile, _, appErr := s.normalizeProfile(ctx, id, req)
	if appErr != nil {
		return nil, appErr
	}
	if existing, err := s.repo.GetProfileBySKU(ctx, profile.SKUID); err == nil && existing != nil && existing.ID != id {
		return nil, apperr.New(apperr.CodeValidationError, "该 SKU 已绑定其他卡密档案")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperr.Wrap(apperr.CodeInternalError, "check card secret profile failed", err)
	}
	profile.ID = id
	if err := s.repo.UpdateProfile(ctx, profile); err != nil {
		if isDuplicateError(err) {
			return nil, apperr.New(apperr.CodeValidationError, "该 SKU 已绑定其他卡密档案")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "update card secret profile failed", err)
	}
	return profile, nil
}

func (s *Service) AdminImportItems(ctx context.Context, req cardsecretdto.AdminImportItemsRequest) (interface{}, *apperr.AppError) {
	profile, err := s.repo.GetProfileByID(ctx, req.ProfileID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.New(apperr.CodeNotFound, "卡密档案不存在")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "load card secret profile failed", err)
	}
	if len(req.Items) == 0 {
		return nil, apperr.New(apperr.CodeValidationError, "请至少导入一条卡密")
	}
	if len(req.Items) > 1000 {
		return nil, apperr.New(apperr.CodeValidationError, "单次最多导入 1000 条卡密")
	}
	batchNo := strings.TrimSpace(req.BatchNo)
	if batchNo == "" {
		batchNo = fmt.Sprintf("BATCH-%d", time.Now().UnixNano())
	}
	seen := make(map[string]int, len(req.Items))
	items := make([]model.CardSecretItem, 0, len(req.Items))
	for idx, row := range req.Items {
		payload, err := cardsecretx.NormalizePayload(cardsecretx.Payload{
			CardCode:     row.CardCode,
			CardPassword: row.CardPassword,
			RedeemCode:   row.RedeemCode,
			ExtraNote:    row.ExtraNote,
		})
		if err != nil {
			return nil, apperr.New(apperr.CodeValidationError, fmt.Sprintf("第 %d 条卡密格式不正确: %s", idx+1, err.Error()))
		}
		hash := cardsecretx.HashPayload(payload)
		if previous, exists := seen[hash]; exists {
			return nil, apperr.New(apperr.CodeValidationError, fmt.Sprintf("第 %d 条与第 %d 条卡密内容重复", idx+1, previous))
		}
		seen[hash] = idx + 1
		encryptedPayload, err := s.codec.EncryptPayload(payload)
		if err != nil {
			return nil, apperr.Wrap(apperr.CodeInternalError, "encrypt card secret failed", err)
		}
		items = append(items, model.CardSecretItem{
			ProfileID:        profile.ID,
			ProductID:        profile.ProductID,
			SKUID:            profile.SKUID,
			BatchNo:          batchNo,
			MaskedSummary:    cardsecretx.MaskPayload(payload),
			SecretHash:       hash,
			EncryptedPayload: encryptedPayload,
			Status:           10,
		})
	}
	if err := s.repo.ImportItems(ctx, items); err != nil {
		if isDuplicateError(err) {
			return nil, apperr.New(apperr.CodeValidationError, "检测到重复卡密，导入已拒绝")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "import card secrets failed", err)
	}
	return map[string]interface{}{"profile_id": profile.ID, "batch_no": batchNo, "count": len(items)}, nil
}

func (s *Service) AdminListItems(ctx context.Context, query cardsecretdto.AdminItemListQuery) (interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListAdminItems(ctx, query.ProfileID, query.Status, query.Keyword, query.Page, query.PageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load card secret items failed", err)
	}
	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 || pageSize > 200 {
		pageSize = 20
	}
	return map[string]interface{}{"list": rows, "total": total, "page": page, "page_size": pageSize}, nil
}

func (s *Service) AdminUpdateItemStatus(ctx context.Context, id uint64, status int8) (interface{}, *apperr.AppError) {
	if status != 10 && status != 40 {
		return nil, apperr.New(apperr.CodeValidationError, "仅支持启用或停用未发放卡密")
	}
	if err := s.repo.UpdateUnusedItemStatus(ctx, id, status); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.New(apperr.CodeNotFound, "卡密不存在")
		}
		if errors.Is(err, cardsecretrepo.ErrCardSecretItemUnavailable) {
			return nil, apperr.New(apperr.CodeBadRequest, "仅未发放卡密支持启用或停用")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "update card secret item status failed", err)
	}
	return map[string]interface{}{"id": id, "status": status}, nil
}

func (s *Service) normalizeProfile(ctx context.Context, id uint64, req cardsecretdto.AdminProfileSaveRequest) (*model.CardSecretProfile, *cardsecretrepo.SKUOption, *apperr.AppError) {
	sku, err := s.repo.GetSKUOptionByID(ctx, req.SKUID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, apperr.New(apperr.CodeValidationError, "SKU 不存在")
		}
		return nil, nil, apperr.Wrap(apperr.CodeInternalError, "load sku failed", err)
	}
	profileName := strings.TrimSpace(req.ProfileName)
	if profileName == "" {
		profileName = strings.TrimSpace(strings.Join([]string{sku.ProductName, sku.SKUTitle}, " / "))
	}
	if profileName == "" {
		return nil, nil, apperr.New(apperr.CodeValidationError, "卡密档案名称不能为空")
	}
	productURL := strings.TrimSpace(req.ProductURL)
	if appErr := validateURL("商品链接", productURL); appErr != nil {
		return nil, nil, appErr
	}
	redeemURL := strings.TrimSpace(req.RedeemURL)
	if appErr := validateURL("兑换链接", redeemURL); appErr != nil {
		return nil, nil, appErr
	}
	guideText := strings.TrimSpace(req.GuideText)
	if guideText == "" {
		guideText = "支付成功后请前往卡密中心查看完整卡密，再按兑换链接与说明完成兑换。"
	}
	privacyNote := strings.TrimSpace(req.PrivacyNote)
	if privacyNote == "" {
		privacyNote = "完整卡密仅对购买用户可见，后台默认仅展示脱敏摘要并保留访问审计。"
	}
	status := int8(1)
	if req.Status == 0 {
		status = 0
	}
	return &model.CardSecretProfile{
		ID:             id,
		ProductID:      sku.ProductID,
		SKUID:          sku.SKUID,
		ProfileName:    profileName,
		ProductURL:     productURL,
		RedeemURL:      redeemURL,
		GuideText:      guideText,
		PrivacyNote:    privacyNote,
		SupportContact: strings.TrimSpace(req.SupportContact),
		Status:         status,
	}, sku, nil
}

func validateURL(label, value string) *apperr.AppError {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	parsed, err := url.ParseRequestURI(value)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return apperr.New(apperr.CodeValidationError, label+"格式不正确，必须是 http/https 地址")
	}
	return nil
}

func buildUserCardResult(record *cardsecretrepo.OwnedCardRecord, payload cardsecretx.Payload, includeRedirect bool) map[string]interface{} {
	result := map[string]interface{}{
		"id":              record.Item.ID,
		"order_no":        record.Item.OrderNo,
		"status":          record.Item.Status,
		"masked_summary":  record.Item.MaskedSummary,
		"product_name":    record.ProductName,
		"sku_title":       record.SKUTitle,
		"sku_code":        record.SKUCode,
		"profile_name":    record.Profile.ProfileName,
		"product_url":     record.Profile.ProductURL,
		"redeem_url":      record.Profile.RedeemURL,
		"guide_text":      record.Profile.GuideText,
		"privacy_note":    record.Profile.PrivacyNote,
		"support_contact": record.Profile.SupportContact,
		"revealed_at":     record.Item.RevealedAt,
		"reveal_count":    record.Item.RevealCount,
		"redeemed_at":     record.Item.RedeemedAt,
		"secret":          payload,
	}
	if includeRedirect {
		redirectURL := strings.TrimSpace(record.Profile.RedeemURL)
		if redirectURL == "" {
			redirectURL = strings.TrimSpace(record.Profile.ProductURL)
		}
		result["redirect_url"] = redirectURL
	}
	return result
}

func isDuplicateError(err error) bool {
	if err == nil {
		return false
	}
	message := strings.ToLower(err.Error())
	return strings.Contains(message, "duplicate") || strings.Contains(message, "1062")
}
