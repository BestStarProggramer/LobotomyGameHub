package main

import (
	"email-notification-service/internal/config"
	"log"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Не удалось загрузить конфигурацию. Запуск невозможен! %v", err)
	}

	log.Println("Конфигурация загружена. Микросервис готов к запуску!")

	log.Printf("Broker: %s; Queue: %s; Timeout: %s", cfg.BrokerURL, cfg.QueueName, cfg.EmailTimeout)
}