import amqp from "amqplib";
import "dotenv/config";

const AMQP_URL = process.env.BROKER_URL;
const QUEUE_NAME = process.env.QUEUE_NAME || "email_notifications";

let connection = null;
let channel = null;

const connectToRabbitMQ = async () => {
  if (channel) {
    return channel;
  }

  if (!AMQP_URL) {
    console.error("FATAL: BROKER_URL не задан в переменных окружения.");
    return null;
  }

  try {
    console.log("INFO: Подключение к RabbitMQ...");
    connection = await amqp.connect(AMQP_URL);

    connection.on("error", (err) => {
      console.error("ERROR: RabbitMQ connection error:", err.message);
      channel = null;
    });

    connection.on("close", () => {
      console.warn(
        "WARNING: RabbitMQ connection closed. Attempting to reconnect on next publish..."
      );
      channel = null;
    });

    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log("INFO: Соединение с RabbitMQ установлено. Канал создан.");

    return channel;
  } catch (error) {
    console.error("ERROR: Не удалось подключиться к RabbitMQ:", error.message);
    channel = null;
    connection = null;
    return null;
  }
};

export const publishEmailNotification = async (
  type,
  recipientEmail,
  data = {}
) => {
  try {
    const ch = await connectToRabbitMQ();
    if (!ch) {
      console.error(
        "ERROR: Не удалось получить канал RabbitMQ. Уведомление не отправлено."
      );
      return false;
    }

    const messagePayload = {
      type,
      recipient_email: recipientEmail,
      data,
    };

    const message = JSON.stringify(messagePayload);

    const sent = ch.sendToQueue(QUEUE_NAME, Buffer.from(message), {
      persistent: true,
    });

    if (sent) {
      console.log(
        `INFO: Сообщение "${type}" для ${recipientEmail} отправлено в очередь.`
      );
    } else {
      console.warn(
        `WARNING: Сообщение "${type}" для ${recipientEmail} не отправлено (буфер заполнен).`
      );
    }

    return sent;
  } catch (error) {
    console.error(
      `ERROR: Ошибка при публикации сообщения "${type}" для ${recipientEmail}:`,
      error.message
    );
    return false;
  }
};
