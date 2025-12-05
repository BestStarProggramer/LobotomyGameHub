package service

import (
	"email-notification-service/pkg/model"
	"email-notification-service/pkg/provider/mail"
	"fmt"
	"log"
)

type EmailServiceImpl struct {
	mailClient mail.Client
}

func NewEmailService(mc mail.Client) *EmailServiceImpl {
	return &EmailServiceImpl{
		mailClient: mc,
	}
}

func (s *EmailServiceImpl) SendWelcome(msg model.Message) error {
	username, ok := msg.Data["username"].(string)
	if !ok {
		return nil
	}

	subject := "Добро пожаловать в наш сервис!"
	body := fmt.Sprintf("Здравствуйте, %s!\nСпасибо за регистрацию. Мы рады видеть вас.", username)

	if err := s.mailClient.Send(msg.RecipientEmail, subject, body); err != nil {
		log.Printf("ERROR: Не удалось отправить WELCOME письмо для %s: %v", msg.RecipientEmail, err)
		return err
	}
	log.Printf("INFO: Успешно отправлено WELCOME письмо пользователю: %s", msg.RecipientEmail)
	return nil
}

func (s *EmailServiceImpl) SendResetPassword(msg model.Message) error {
	code, ok := msg.Data["recovery_code"].(string)
	if !ok {
		return fmt.Errorf("отсутствует или неверный формат 'recovery_code' в данных для сброса пароля")
	}

	subject := "Сброс пароля"
	body := fmt.Sprintf("Ваш код для сброса пароля: %s. Не сообщайте его никому.", code)

	if err := s.mailClient.Send(msg.RecipientEmail, subject, body); err != nil {
		log.Printf("ERROR: Не удалось отправить RESET_PASSWORD письмо для %s: %v", msg.RecipientEmail, err)
		return err
	}
	log.Printf("INFO: Успешно отправлено RESET_PASSWORD письмо пользователю: %s", msg.RecipientEmail)
	return nil
}
