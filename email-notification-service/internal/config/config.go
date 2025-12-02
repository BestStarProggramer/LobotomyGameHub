package config

import (
	"fmt"
	"os"
	"time"
)

type Config struct {
	BrokerURL    string
	MailAPIKey   string
	QueueName    string
	SenderEmail  string
	EmailTimeout time.Duration
}

func Load() (Config, error) {
	cfg := Config{
		BrokerURL: os.Getenv("BROKER_URL"),
		MailAPIKey: os.Getenv("MAIL_API_KEY"),
		QueueName: os.Getenv("QUEUE_NAME"),
		SenderEmail: os.Getenv("SENDER_EMAIL"),
	}

	if cfg.BrokerURL == "" {
		return Config{}, fmt.Errorf("BROKER_URL is required")
	}
	if cfg.MailAPIKey == "" {
		return Config{}, fmt.Errorf("MAIL_API_KEY is required")
	}

	if cfg.QueueName == "" {
		cfg.QueueName = "email_notifications"
	}
	if cfg.SenderEmail == "" {
		cfg.SenderEmail = "no-reply@localhost.com"
	}

	timeoutStr := os.Getenv("EMAIL_TIMEOUT")
	if timeoutStr == "" {
		timeoutStr = "5s"
	}

	duration, err := time.ParseDuration(timeoutStr)
	if err != nil {
		return Config{}, fmt.Errorf("invalid EMAIL_TIMEOUT format: %w", err)
	}

	cfg.EmailTimeout = duration

	return cfg, nil
}