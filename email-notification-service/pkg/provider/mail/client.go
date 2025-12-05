package mail

import (
	"fmt"
	"net/smtp"
)

type Client interface {
	Send(recipientEmail, subject, body string) error
}

type Config struct {
	Host string
	Port string
	Username string
	Password string
	SenderEmail string
}

type SMTPClient struct {
	cfg Config
}

func NewSMTPClient(cfg Config) *SMTPClient {
	return &SMTPClient{cfg: cfg}
}

func (c *SMTPClient) Send(recipientEmail, subject, body string) error {
	addr := c.cfg.Host + ":" + c.cfg.Port
	
	auth := smtp.PlainAuth("", c.cfg.Username, c.cfg.Password, c.cfg.Host)

	msg := []byte(fmt.Sprintf(
		"To: %s\r\n"+
		"From: %s\r\n"+
		"Subject: %s\r\n"+
		"Content-Type: text/plain; charset=utf-8\r\n"+
		"\r\n"+
		"%s\r\n",
		recipientEmail,
		c.cfg.SenderEmail,
		subject,
		body,
	))

	return smtp.SendMail(addr, auth, c.cfg.SenderEmail, []string{recipientEmail}, msg)
}