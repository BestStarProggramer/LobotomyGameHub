package service_test

import (
	"email-notification-service/internal/service"
	"email-notification-service/pkg/model"
	"errors"
	"strings"
	"testing"
)

type MockMailer struct {
	To            string
	Subject       string
	Body          string
	Called        bool
	ErrorToReturn error
}

func (m *MockMailer) Send(to, subject, body string) error {
	m.Called = true
	m.To = to
	m.Subject = subject
	m.Body = body
	return m.ErrorToReturn
}

func BodyContains(body, sub string) bool {
	return strings.Contains(body, sub)
}

func TestEmailService_SendWelcome_Success(t *testing.T) {
	mockMailer := &MockMailer{}
	emailService := service.NewEmailService(mockMailer)

	msg := model.Message{
		RecipientEmail: "test@example.com",
		Data:           map[string]interface{}{"username": "TestUser"},
	}

	err := emailService.SendWelcome(msg)

	if err != nil {
		t.Fatalf("SendWelcome вернул ошибку: %v", err)
	}
	if !mockMailer.Called {
		t.Error("Метод Send на MockMailer не был вызван.")
	}
	if !BodyContains(mockMailer.Body, "TestUser") {
		t.Error("Тело письма не содержит имя пользователя.")
	}
}

func TestEmailService_SendWelcome_MissingUsername(t *testing.T) {
	mockMailer := &MockMailer{}
	emailService := service.NewEmailService(mockMailer)

	msg := model.Message{
		RecipientEmail: "test@example.com",
		Data:           map[string]interface{}{"some_other_key": "value"},
	}

	err := emailService.SendWelcome(msg)

	if err != nil {
		t.Fatalf("SendWelcome вернул ошибку: %v", err)
	}

	if mockMailer.Called {
		t.Error("Метод Send на MockMailer ошибочно был вызван при отсутствии 'username'.")
	}
}

func TestEmailService_SendResetPassword_Success(t *testing.T) {
	mockMailer := &MockMailer{}
	emailService := service.NewEmailService(mockMailer)

	code := "XYZ-123"
	msg := model.Message{
		RecipientEmail: "test@example.com",
		Data:           map[string]interface{}{"recovery_code": code},
	}

	err := emailService.SendResetPassword(msg)

	if err != nil {
		t.Fatalf("SendResetPassword вернул ошибку: %v", err)
	}
	if !BodyContains(mockMailer.Body, code) {
		t.Errorf("Тело письма не содержит код восстановления: %s", code)
	}
}

func TestEmailService_SendResetPassword_MissingCode(t *testing.T) {
	mockMailer := &MockMailer{}
	emailService := service.NewEmailService(mockMailer)

	msg := model.Message{
		RecipientEmail: "test@example.com",
		Data:           map[string]interface{}{"username": "TestUser"},
	}

	err := emailService.SendResetPassword(msg)

	if err == nil {
		t.Error("Ожидали ошибку при отсутствии 'recovery_code', получили nil.")
	}
	if mockMailer.Called {
		t.Error("Метод Send на MockMailer ошибочно был вызван.")
	}
}

func TestEmailService_SendEmail_Failure(t *testing.T) {
	sendError := errors.New("ошибка SMTP: сервер недоступен")
	mockMailer := &MockMailer{ErrorToReturn: sendError}
	emailService := service.NewEmailService(mockMailer)

	msg := model.Message{
		RecipientEmail: "test@example.com",
		Data:           map[string]interface{}{"username": "TestUser"},
	}

	err := emailService.SendWelcome(msg)

	if err == nil {
		t.Error("Ожидали ошибку от Mailer, получили nil.")
	}
	if !errors.Is(err, sendError) {
		t.Errorf("Ожидали ошибку %v, получили %v", sendError, err)
	}
	if !mockMailer.Called {
		t.Error("Метод Send не был вызван.")
	}
}
