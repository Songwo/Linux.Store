package cardsecretx

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"
)

type Codec struct {
	key [32]byte
}

type Payload struct {
	CardCode     string `json:"card_code,omitempty"`
	CardPassword string `json:"card_password,omitempty"`
	RedeemCode   string `json:"redeem_code,omitempty"`
	ExtraNote    string `json:"extra_note,omitempty"`
}

func NewCodec(configuredKey, fallbackSecret string) (*Codec, error) {
	secret := strings.TrimSpace(configuredKey)
	if secret == "" {
		secret = "jwt-fallback:" + strings.TrimSpace(fallbackSecret)
	}
	if len(secret) < 16 {
		return nil, errors.New("card secret encryption key is too short")
	}
	sum := sha256.Sum256([]byte("devstore/card-secret/v1/" + secret))
	return &Codec{key: sum}, nil
}

func NormalizePayload(payload Payload) (Payload, error) {
	payload.CardCode = strings.TrimSpace(payload.CardCode)
	payload.CardPassword = strings.TrimSpace(payload.CardPassword)
	payload.RedeemCode = strings.TrimSpace(payload.RedeemCode)
	payload.ExtraNote = strings.TrimSpace(payload.ExtraNote)
	if payload.CardCode == "" && payload.CardPassword == "" && payload.RedeemCode == "" {
		return Payload{}, errors.New("card_code, card_password and redeem_code cannot all be empty")
	}
	return payload, nil
}

func (c *Codec) EncryptPayload(payload Payload) (string, error) {
	normalized, err := NormalizePayload(payload)
	if err != nil {
		return "", err
	}
	plain, err := json.Marshal(normalized)
	if err != nil {
		return "", fmt.Errorf("marshal payload failed: %w", err)
	}
	block, err := aes.NewCipher(c.key[:])
	if err != nil {
		return "", fmt.Errorf("init cipher failed: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("init gcm failed: %w", err)
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("generate nonce failed: %w", err)
	}
	cipherText := gcm.Seal(nil, nonce, plain, nil)
	return base64.RawURLEncoding.EncodeToString(nonce) + "." + base64.RawURLEncoding.EncodeToString(cipherText), nil
}

func (c *Codec) DecryptPayload(value string) (Payload, error) {
	parts := strings.Split(strings.TrimSpace(value), ".")
	if len(parts) != 2 {
		return Payload{}, errors.New("invalid encrypted payload")
	}
	nonce, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return Payload{}, fmt.Errorf("decode nonce failed: %w", err)
	}
	cipherText, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return Payload{}, fmt.Errorf("decode ciphertext failed: %w", err)
	}
	block, err := aes.NewCipher(c.key[:])
	if err != nil {
		return Payload{}, fmt.Errorf("init cipher failed: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return Payload{}, fmt.Errorf("init gcm failed: %w", err)
	}
	plain, err := gcm.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return Payload{}, fmt.Errorf("decrypt payload failed: %w", err)
	}
	var payload Payload
	if err := json.Unmarshal(plain, &payload); err != nil {
		return Payload{}, fmt.Errorf("unmarshal payload failed: %w", err)
	}
	return NormalizePayload(payload)
}

func HashPayload(payload Payload) string {
	normalized, _ := NormalizePayload(payload)
	sum := sha256.Sum256([]byte(canonicalPayload(normalized)))
	return hex.EncodeToString(sum[:])
}

func MaskPayload(payload Payload) string {
	normalized, _ := NormalizePayload(payload)
	parts := make([]string, 0, 3)
	if normalized.CardCode != "" {
		parts = append(parts, "卡号:"+MaskValue(normalized.CardCode))
	}
	if normalized.CardPassword != "" {
		parts = append(parts, "密码:"+MaskValue(normalized.CardPassword))
	}
	if normalized.RedeemCode != "" {
		parts = append(parts, "兑换码:"+MaskValue(normalized.RedeemCode))
	}
	if len(parts) == 0 {
		return "已导入卡密"
	}
	return strings.Join(parts, " | ")
}

func MaskValue(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	runes := []rune(value)
	switch {
	case len(runes) <= 2:
		return string(runes[:1]) + "*"
	case len(runes) <= 6:
		return string(runes[:1]) + strings.Repeat("*", len(runes)-2) + string(runes[len(runes)-1:])
	default:
		return string(runes[:3]) + strings.Repeat("*", len(runes)-6) + string(runes[len(runes)-3:])
	}
}

func canonicalPayload(payload Payload) string {
	return strings.Join([]string{
		"card_code=" + payload.CardCode,
		"card_password=" + payload.CardPassword,
		"redeem_code=" + payload.RedeemCode,
		"extra_note=" + payload.ExtraNote,
	}, "\n")
}
