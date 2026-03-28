package dto

import (
	"encoding/json"
	"testing"
)

func TestLinuxDOUser_UnmarshalJSON(t *testing.T) {
	jsonData := `{
		"id": 12345,
		"username": "testuser",
		"name": "Test User",
		"avatar_template": "/user_avatar/linux.do/testuser/{size}/1.png",
		"email": "test@example.com"
	}`

	var user LinuxDOUser
	if err := json.Unmarshal([]byte(jsonData), &user); err != nil {
		t.Fatalf("Unmarshal failed: %v", err)
	}

	if user.ID != "12345" {
		t.Errorf("Expected ID 12345, got %s", user.ID)
	}
	if user.Username != "testuser" {
		t.Errorf("Expected username testuser, got %s", user.Username)
	}
	if user.Name != "Test User" {
		t.Errorf("Expected name Test User, got %s", user.Name)
	}
	if user.Avatar != "/user_avatar/linux.do/testuser/{size}/1.png" {
		t.Errorf("Expected avatar_template, got %s", user.Avatar)
	}
	if user.Email != "test@example.com" {
		t.Errorf("Expected email test@example.com, got %s", user.Email)
	}
}

func TestLinuxDOUser_GetAvatarURL(t *testing.T) {
	tests := []struct {
		name     string
		template string
		expected string
	}{
		{
			"Relative template",
			"/user_avatar/linux.do/testuser/{size}/1.png",
			"https://linux.do/user_avatar/linux.do/testuser/120/1.png",
		},
		{
			"Absolute URL",
			"https://external.com/avatar.png",
			"https://external.com/avatar.png",
		},
		{
			"Empty",
			"",
			"",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u := &LinuxDOUser{Avatar: tt.template}
			got := u.GetAvatarURL()
			if got != tt.expected {
				t.Errorf("GetAvatarURL() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestLinuxDOUser_GetNickname(t *testing.T) {
	u1 := &LinuxDOUser{Username: "user1", Name: "Name 1"}
	if u1.GetNickname() != "Name 1" {
		t.Errorf("Expected Name 1, got %s", u1.GetNickname())
	}

	u2 := &LinuxDOUser{Username: "user2", Name: ""}
	if u2.GetNickname() != "user2" {
		t.Errorf("Expected user2, got %s", u2.GetNickname())
	}
}
