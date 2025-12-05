package main

import (
	"email-notification-service/internal/broker"
	"email-notification-service/internal/config"
	"email-notification-service/internal/handler"
	"email-notification-service/internal/service"
	"email-notification-service/pkg/provider/mail"
	"log"
	"net/http"
)

func main() {
	log.Println("Запуск микросервиса Email-уведомлений...")

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("FATAL: Не удалось загрузить конфигурацию. Запуск невозможен: %v", err)
	}

	log.Println("Конфигурация успешно загружена.")
	log.Printf("Брокер: %s, Очередь: %s, Таймаут: %s", cfg.BrokerURL, cfg.QueueName, cfg.EmailTimeout)

	httpClient := &http.Client{
		Timeout: cfg.EmailTimeout,
	}

	mailCfg := mail.Config{
		APIKey:      cfg.MailAPIKey,
		SenderEmail: cfg.SenderEmail,
		HTTPClient:  httpClient,
	}
	mailClient := mail.NewSendGridClient(mailCfg)

	emailService := service.NewEmailService(mailClient)

	messageHandler := handler.NewHandler(emailService)

	consumer, err := broker.NewConsumer(cfg.BrokerURL, cfg.QueueName, messageHandler)
	if err != nil {
		log.Fatalf("FATAL: Ошибка соединения с брокером по URL %s: %v", cfg.BrokerURL, err)
	}
	defer consumer.Conn.Close()

	log.Println("Соединение с брокером установлено. Запуск прослушивания...")
	if err := consumer.Run(); err != nil {
		log.Fatalf("FATAL: Ошибка во время работы потребителя: %v", err)
	}

	log.Println("Сервис завершил работу.")
}
