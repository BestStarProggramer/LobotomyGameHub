package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	
	"email-notification-service/internal/broker" 
	"email-notification-service/internal/config"
	"email-notification-service/internal/handler" 
	"email-notification-service/internal/service" 
	"email-notification-service/pkg/provider/mail" 
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
		APIKey: cfg.MailAPIKey,
		SenderEmail: cfg.SenderEmail,
		HTTPClient: httpClient,
	}
	mailClient := mail.NewSendGridClient(mailCfg)

	emailService := service.NewEmailService(mailClient) 
	messageHandler := handler.NewHandler(emailService)

	consumer, err := broker.NewConsumer(cfg.BrokerURL, cfg.QueueName, messageHandler)
	if err != nil {
		log.Fatalf("FATAL: Ошибка соединения с брокером по URL %s: %v", cfg.BrokerURL, err)
	}
	defer consumer.Conn.Close() 

	ctx, cancel := context.WithCancel(context.Background())
	
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	consumerDone := make(chan error)

	log.Println("Соединение с брокером установлено. Запуск прослушивания...")
	go func() {
		consumerDone <- consumer.Run(ctx)
	}()
	
	select {
	case sig := <-quit:
		log.Printf("WARNING: Получен сигнал остановки (%s). Начинаем завершение...", sig)
		cancel()
		
		select {
		case err := <-consumerDone:
			if err != nil {
				log.Fatalf("FATAL: Ошибка во время работы потребителя: %v", err)
			}
		case <-time.After(10 * time.Second):
			log.Println("WARNING: Consumer не завершился вовремя. Принудительное закрытие.")
		}
		
	case err := <-consumerDone:
		if err != nil {
			log.Fatalf("FATAL: Ошибка во время работы потребителя: %v", err)
		}
	}
	
	log.Println("Сервис завершил работу.") 
}