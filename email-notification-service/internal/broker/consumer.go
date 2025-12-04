package broker

import (
	"log"

	"github.com/streadway/amqp"
)

type MessageHandler interface {
	Handle(messageBody []byte) error
}

type Consumer struct {
	Conn        *amqp.Connection
	url         string
	queueName   string
	handler     MessageHandler
	reconnectCh chan *amqp.Error
}

func NewConsumer(url, queueName string, h MessageHandler) (*Consumer, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	consumer := &Consumer{
		Conn:        conn,
		url:         url,
		queueName:   queueName,
		handler:     h,
		reconnectCh: make(chan *amqp.Error),
	}

	consumer.reconnectCh = conn.NotifyClose(make(chan *amqp.Error))

	return consumer, nil
}

func (c *Consumer) Run() error {
	log.Printf("INFO: Запуск потребителя для очереди: %s", c.queueName)

	ch, err := c.Conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(
		c.queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	err = ch.Qos(
		5,
		0,
		false,
	)
	if err != nil {
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
		return err
	}

	for d := range msgs {
		go c.handleMessage(d)
	}

	log.Println("WARNING: Канал брокера закрыт.")
	return nil
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
