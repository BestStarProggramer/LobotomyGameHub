package config

import (
	"fmt"
	"os"
	"time"
)

type Config struct {
	BrokerURL string
	QueueName string
	EmailTimeout time.Duration
	SenderEmail string

	SMTPHost string
	SMTPPort string
	SMTPUsername string
	SMTPPassword string
}

func Load() (*Config, error) {
	cfg := &Config{
		BrokerURL:    os.Getenv("BROKER_URL"),
		QueueName:    os.Getenv("QUEUE_NAME"),
		SenderEmail:  os.Getenv("SENDER_EMAIL"),

		SMTPHost:     os.Getenv("SMTP_HOST"),
		SMTPPort:     os.Getenv("SMTP_PORT"),
		SMTPUsername: os.Getenv("SMTP_USERNAME"),
		SMTPPassword: os.Getenv("SMTP_PASSWORD"),
	}

	if cfg.QueueName == "" {
		cfg.QueueName = "email_notifications"
	}

	timeoutStr := os.Getenv("EMAIL_TIMEOUT")
	if timeoutStr == "" {
		timeoutStr = "5s"
	}
	timeout, err := time.ParseDuration(timeoutStr)
	if err != nil {
		return nil, fmt.Errorf("ошибка парсинга EMAIL_TIMEOUT: %w", err)
	}
	cfg.EmailTimeout = timeout

	if cfg.BrokerURL == "" {
		return nil, fmt.Errorf("переменная среды BROKER_URL не задана")
	}
	if cfg.SenderEmail == "" {
		return nil, fmt.Errorf("переменная среды SENDER_EMAIL не задана")
	}

	if cfg.SMTPHost == "" || cfg.SMTPPort == "" || cfg.SMTPUsername == "" || cfg.SMTPPassword == "" {
		return nil, fmt.Errorf("одна или несколько переменных среды SMTP (HOST, PORT, USERNAME, PASSWORD) не заданы")
	}

	return cfg, nil
}