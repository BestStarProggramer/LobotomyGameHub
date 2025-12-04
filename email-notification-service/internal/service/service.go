package service

import "email-notification-service/pkg/model"

type EmailService interface {
	SendWelcome(msg model.Message) error
	SendResetPassword(msg model.Message) error
}
