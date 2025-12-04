package handler

import (
	"log"
	"time"
)

type StubHandler struct{}

func NewStubHandler() *StubHandler {
	return &StubHandler{}
}

func (h *StubHandler) Handle(messageBody []byte) error {
	log.Printf("INFO: Получено сообщение (длина: %d). Имитация обработки...", len(messageBody))

	time.Sleep(100 * time.Millisecond)

	log.Printf("INFO: Сообщение обработано. Тело: %s", string(messageBody))

	return nil
}
