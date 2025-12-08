package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() error {
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		log.Println("INFO: Файл .env не найден. Пропускаем загрузку env-переменных из файла.")
		return nil
	}

	err := godotenv.Load()
	if err != nil {
		return err
	}

	log.Println("INFO: Переменные окружения успешно загружены из файла .env.")
	return nil
}