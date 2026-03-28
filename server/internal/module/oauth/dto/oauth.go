package dto

import (
	"encoding/json"
	"fmt"
	"strings"
)

type CallbackQuery struct {
	Code  string `form:"code" binding:"required"`
	State string `form:"state"`
}

type BindRequest struct {
	Code string `json:"code" binding:"required"`
}

type LinuxDOUser struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Name     string `json:"name"`
	Avatar   string `json:"avatar_template"`
	Email    string `json:"email"`
}

func (u *LinuxDOUser) UnmarshalJSON(data []byte) error {
	type rawLinuxDOUser struct {
		ID       json.RawMessage `json:"id"`
		Username string          `json:"username"`
		Name     string          `json:"name"`
		Avatar   string          `json:"avatar_template"`
		Email    string          `json:"email"`
	}

	var raw rawLinuxDOUser
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	var idString string
	if len(raw.ID) > 0 {
		if err := json.Unmarshal(raw.ID, &idString); err != nil {
			var idNumber json.Number
			if err := json.Unmarshal(raw.ID, &idNumber); err != nil {
				return fmt.Errorf("unmarshal linux.do user id failed: %w", err)
			}
			idString = idNumber.String()
		}
	}

	u.ID = idString
	u.Username = raw.Username
	u.Name = raw.Name
	u.Avatar = raw.Avatar
	u.Email = raw.Email
	return nil
}

func (u *LinuxDOUser) GetAvatarURL() string {
	if u.Avatar == "" {
		return ""
	}
	url := u.Avatar
	// Discourse avatar template contains {size}, replace it with a reasonable default
	if strings.Contains(url, "{size}") {
		url = strings.ReplaceAll(url, "{size}", "120")
	}
	// If it's a relative path, prepend the base site URL
	if strings.HasPrefix(url, "/") {
		url = "https://linux.do" + url
	}
	return url
}

func (u *LinuxDOUser) GetNickname() string {
	if u.Name != "" {
		return u.Name
	}
	return u.Username
}
