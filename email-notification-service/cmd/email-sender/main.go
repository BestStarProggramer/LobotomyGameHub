package main

import (
	"email-notification-service/internal/broker"
	"email-notification-service/internal/config"
	"email-notification-service/internal/handler"
	"log"
)

func main() {
	log.Println("Запуск микросервиса Email-уведомлений...")

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("FATAL: Не удалось загрузить конфигурацию. Запуск невозможен: %v", err)
	}

	log.Println("Конфигурация успешно загружена.")

	messageHandler := handler.NewStubHandler()

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