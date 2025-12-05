package mail

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Client interface {
	Send(recipientEmail, subject, body string) error
}

type Config struct {
	APIKey string
	SenderEmail string
	HTTPClient *http.Client
}

type SendGridClient struct {
	cfg Config
	baseURL string
}

func NewSendGridClient(cfg Config) *SendGridClient {
	return &SendGridClient{
		cfg: cfg,
		baseURL: "https://api.sendgrid.com/v3/mail/send",
	}
}

func (c *SendGridClient) Send(recipientEmail, subject, body string) error {
	payload := map[string]interface{}{
		"personalizations": []map[string]interface{}{
			{
				"to": []map[string]string{
					{"email": recipientEmail},
				},
				"subject": subject,
			},
		},
		"from": map[string]string{
			"email": c.cfg.SenderEmail,
		},
		"content": []map[string]string{
			{"type": "text/plain", "value": body},
		},
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, c.baseURL, bytes.NewReader(jsonPayload))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.cfg.APIKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.cfg.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("mail provider failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}