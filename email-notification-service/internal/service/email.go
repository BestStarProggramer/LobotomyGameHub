package service

import (
	"email-notification-service/pkg/model"
	"fmt"
	"log"
)

type EmailServiceImpl struct {
}

func NewEmailService() *EmailServiceImpl {
	return &EmailServiceImpl{}
}

func (s *EmailServiceImpl) SendWelcome(msg model.Message) error {
	log.Printf("DEBUG: Подготовка приветственного письма для %s. Данные: %v", msg.RecipientEmail, msg.Data)

	fmt.Printf("Успешно отправлено WELCOME письмо пользователю: %s\n", msg.RecipientEmail)
	return nil
}

func (s *EmailServiceImpl) SendResetPassword(msg model.Message) error {
	code, ok := msg.Data["recovery_code"].(string)
	if !ok {
		return fmt.Errorf("отсутствует или неверный формат 'recovery_code' в данных для сброса пароля")
	}

	log.Printf("DEBUG: Подготовка письма сброса для %s. Код: %s", msg.RecipientEmail, code)
	
	fmt.Printf("Успешно отправлено RESET_PASSWORD письмо пользователю: %s\n", msg.RecipientEmail)
	return nil
}
