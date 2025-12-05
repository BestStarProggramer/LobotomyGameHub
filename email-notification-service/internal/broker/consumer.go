package broker

import (
	"log"
	"context"
	"github.com/streadway/amqp"
)

type MessageHandler interface {
	Handle(messageBody []byte) error
}

type Consumer struct {
	Conn *amqp.Connection
	url string
	queueName string
	handler MessageHandler
	reconnectCh chan *amqp.Error
	ch *amqp.Channel
}

func NewConsumer(url, queueName string, h MessageHandler) (*Consumer, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	consumer := &Consumer{
		Conn: conn,
		url: url,
		queueName: queueName,
		handler: h,
		reconnectCh: conn.NotifyClose(make(chan *amqp.Error)),
	}

	return consumer, nil
}

func (c *Consumer) Stop() error {
	log.Println("INFO: Остановка Consumer. Закрытие канала брокера...")
	if c.ch != nil {
		return c.ch.Close()
	}
	return nil
}

func (c *Consumer) Run(ctx context.Context) error {
	log.Printf("INFO: Запуск потребителя для очереди: %s", c.queueName)
	
	ch, err := c.Conn.Channel()
	if err != nil {
		return err
	}
	c.ch = ch

	_, err = ch.QueueDeclare(
		c.queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		return err
	}
	
	err = ch.Qos(
		5,
		0,
		false,
	)
	if err != nil {
		ch.Close()
		return err
	}
	
	msgs, err := ch.Consume(
		c.queueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		return err
	}
	
	for {
		select {
		case <-ctx.Done():
			return c.Stop()
		case d, ok := <-msgs:
			if !ok {
				log.Println("WARNING: Канал доставки сообщений закрыт.")
				return nil
			}
			go c.handleMessage(d)
		}
	}
}

func (c *Consumer) handleMessage(d amqp.Delivery) {
	err := c.handler.Handle(d.Body)

	if err != nil {
		log.Printf("ERROR: Ошибка обработки сообщения: %v", err)
		
		if err := d.Nack(false, true); err != nil {
			log.Printf("ERROR: Не удалось отправить NACK: %v", err)
		}
		return
	}

	if err := d.Ack(false); err != nil {
		log.Printf("ERROR: Не удалось отправить ACK: %v", err)
	}
}