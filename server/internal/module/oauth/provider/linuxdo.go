package provider

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"devstore/server/internal/config"
	oauthdto "devstore/server/internal/module/oauth/dto"
)

type LinuxDOProvider struct {
	cfg    config.LinuxDOConfig
	client *http.Client
}

func NewLinuxDOProvider(cfg config.LinuxDOConfig) *LinuxDOProvider {
	transport := http.DefaultTransport.(*http.Transport).Clone()
	if strings.TrimSpace(cfg.ProxyURL) != "" {
		proxyURL, err := url.Parse(cfg.ProxyURL)
		if err == nil {
			transport.Proxy = http.ProxyURL(proxyURL)
		}
	}
	return &LinuxDOProvider{
		cfg: cfg,
		client: &http.Client{
			Timeout:   10 * time.Second,
			Transport: transport,
		},
	}
}

func (p *LinuxDOProvider) AuthorizeURL(state string) string {
	q := url.Values{}
	q.Set("client_id", p.cfg.ClientID)
	q.Set("response_type", "code")
	q.Set("redirect_uri", p.cfg.RedirectURL)
	q.Set("scope", "read")
	q.Set("state", state)
	return p.cfg.AuthorizeURL + "?" + q.Encode()
}

func (p *LinuxDOProvider) ExchangeToken(ctx context.Context, code string) (string, error) {
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("redirect_uri", p.cfg.RedirectURL)
	form.Set("code", code)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, p.cfg.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")
	req.SetBasicAuth(p.cfg.ClientID, p.cfg.ClientSecret)

	resp, err := p.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("linux.do token exchange failed: status=%d body=%s", resp.StatusCode, compactBody(body))
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
	}
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", fmt.Errorf("decode linux.do token response failed: %w, body=%s", err, compactBody(body))
	}
	if tokenResp.AccessToken == "" {
		if tokenResp.Error != "" {
			return "", fmt.Errorf("linux.do token exchange failed: %s", tokenResp.Error)
		}
		return "", fmt.Errorf("empty access token")
	}
	return tokenResp.AccessToken, nil
}

func (p *LinuxDOProvider) FetchUser(ctx context.Context, token string) (*oauthdto.LinuxDOUser, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, p.cfg.UserInfoURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("linux.do fetch user failed: status=%d body=%s", resp.StatusCode, compactBody(body))
	}

	var user oauthdto.LinuxDOUser
	if err := json.Unmarshal(body, &user); err != nil {
		return nil, fmt.Errorf("decode linux.do user response failed: %w, body=%s", err, compactBody(body))
	}
	return &user, nil
}

func compactBody(body []byte) string {
	text := strings.TrimSpace(string(body))
	text = strings.ReplaceAll(text, "\n", " ")
	text = strings.ReplaceAll(text, "\r", " ")
	text = strings.Join(strings.Fields(text), " ")
	if len(text) > 300 {
		return text[:300] + "..."
	}
	return text
}
