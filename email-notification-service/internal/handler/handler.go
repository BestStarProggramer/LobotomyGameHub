package handler

import (
	"email-notification-service/internal/service"
	"email-notification-service/pkg/model"
	"encoding/json"
	"log"
)

type Handler struct {
	emailService service.EmailService
}

func NewHandler(es service.EmailService) *Handler {
	return &Handler{
		emailService: es,
	}
}

func (h *Handler) Handle(messageBody []byte) error {
	var msg model.Message

	if err := json.Unmarshal(messageBody, &msg); err != nil {
		log.Printf("ERROR: Невозможно декодировать сообщение в JSON: %s. Тело: %s", err, string(messageBody))
		return nil
	}

	log.Printf("INFO: Получено сообщение типа: %s для: %s", msg.Type, msg.RecipientEmail)

	switch msg.Type {
	case "WELCOME":
		return h.emailService.SendWelcome(msg)

	case "RESET_PASSWORD":
		return h.emailService.SendResetPassword(msg)

	case "EMAIL_CHANGE_CODE":
		return h.emailService.SendEmailChangeCode(msg)

	default:
		log.Printf("WARNING: Получен неизвестный тип сообщения: %s", msg.Type)
		return nil
	}
}
