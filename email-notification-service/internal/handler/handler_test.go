package handler_test

import (
	"email-notification-service/internal/handler"
	"email-notification-service/pkg/model"
	"encoding/json"
	"errors"
	"testing"
)

type MockEmailService struct {
	WelcomeCalled       bool
	ResetPasswordCalled bool
	EmailChangeCalled   bool
	ErrorToReturn       error
}

func (m *MockEmailService) SendWelcome(msg model.Message) error {
	m.WelcomeCalled = true
	return m.ErrorToReturn
}

func (m *MockEmailService) SendResetPassword(msg model.Message) error {
	m.ResetPasswordCalled = true
	return m.ErrorToReturn
}

func (m *MockEmailService) SendEmailChangeCode(msg model.Message) error {
	m.EmailChangeCalled = true
	return m.ErrorToReturn
}

func TestHandler_HandleMessage_WelcomeSuccess(t *testing.T) {
	mockService := &MockEmailService{}
	h := handler.NewHandler(mockService)

	msgData := model.Message{
		Type:           "WELCOME",
		RecipientEmail: "user@test.ru",
		Data:           map[string]interface{}{"username": "Test"},
	}
	msgBytes, _ := json.Marshal(msgData)

	err := h.Handle(msgBytes)

	if err != nil {
		t.Errorf("Handle вернул ошибку: %v", err)
	}
	if !mockService.WelcomeCalled {
		t.Error("Для WELCOME не был вызван SendWelcome.")
	}
}

func TestHandler_HandleMessage_ResetPasswordSuccess(t *testing.T) {
	mockService := &MockEmailService{}
	h := handler.NewHandler(mockService)

	msgData := model.Message{
		Type:           "RESET_PASSWORD",
		RecipientEmail: "user@test.ru",
		Data:           map[string]interface{}{"recovery_code": "XYZ"},
	}
	msgBytes, _ := json.Marshal(msgData)

	err := h.Handle(msgBytes)

	if err != nil {
		t.Errorf("Handle вернул ошибку: %v", err)
	}
	if !mockService.ResetPasswordCalled {
		t.Error("Для RESET_PASSWORD не был вызван SendResetPassword.")
	}
}

func TestHandler_HandleMessage_InvalidJSON(t *testing.T) {
	mockService := &MockEmailService{}
	h := handler.NewHandler(mockService)

	invalidBytes := []byte(`{"type": "WELCOME", "email": "a`)

	err := h.Handle(invalidBytes)

	if err != nil {
		t.Errorf("Ожидали nil (для ACK), но получили ошибку: %v", err)
	}
	if mockService.WelcomeCalled || mockService.ResetPasswordCalled {
		t.Error("Сервис был вызван при ошибке декодирования JSON.")
	}
	if mockService.WelcomeCalled || mockService.ResetPasswordCalled || mockService.EmailChangeCalled { // <-- Обновлено
		t.Error("Сервис был вызван при ошибке декодирования JSON.")
	}
}

func TestHandler_HandleMessage_UnknownType(t *testing.T) {
	mockService := &MockEmailService{}
	h := handler.NewHandler(mockService)

	msgData := model.Message{Type: "UNKNOWN_TYPE"}
	msgBytes, _ := json.Marshal(msgData)

	err := h.Handle(msgBytes)

	if err != nil {
		t.Errorf("Ожидали nil (для ACK), но получили ошибку: %v", err)
	}
	if mockService.WelcomeCalled || mockService.ResetPasswordCalled {
		t.Error("Сервис был вызван при неизвестном типе сообщения.")
	}
	if mockService.WelcomeCalled || mockService.ResetPasswordCalled || mockService.EmailChangeCalled { // <-- Обновлено
		t.Error("Сервис был вызван при неизвестном типе сообщения.")
	}
}

func TestHandler_HandleMessage_ServiceErrorPropagation(t *testing.T) {
	expectedError := errors.New("ошибка отправки почты")
	mockService := &MockEmailService{ErrorToReturn: expectedError}
	h := handler.NewHandler(mockService)

	msgData := model.Message{Type: "WELCOME"}
	msgBytes, _ := json.Marshal(msgData)

	err := h.Handle(msgBytes)

	if err == nil {
		t.Error("Ожидали ошибку от сервиса, получили nil.")
	}
	if !errors.Is(err, expectedError) {
		t.Errorf("Ожидали ошибку %v, получили %v", expectedError, err)
	}
}

func TestHandler_HandleMessage_EmailChangeCodeSuccess(t *testing.T) {
	mockService := &MockEmailService{}
	h := handler.NewHandler(mockService)

	msgData := model.Message{
		Type:           "EMAIL_CHANGE_CODE",
		RecipientEmail: "user@test.ru",
		Data:           map[string]interface{}{"change_code": "ABC"},
	}
	msgBytes, _ := json.Marshal(msgData)

	err := h.Handle(msgBytes)

	if err != nil {
		t.Errorf("Handle вернул ошибку: %v", err)
	}
	if !mockService.EmailChangeCalled {
		t.Error("Для EMAIL_CHANGE_CODE не был вызван SendEmailChangeCode.")
	}
}