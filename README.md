# Проект LobotomyGH



## Настройка окружения

Перед запуском бэкенда необходимо создать файл `.env` в папке `server/`.

Пример содержания `server/.env`:
```env
PORT=8800
PGUSER=postgres
PGHOST=localhost
PGDATABASE=lobotomy_db
PGPASSWORD=ваш_пароль
PGPORT=5432
JWT_SECRET=секретный_ключ_для_токенов
```



## Запуск Backend:

1. Перейдите в папку server:
```bash
cd server
```
2. Установите зависимости:
```bash
npm install
```
3. Запустите сервер:
```bash
npm start
```



## Запуск Frontend:

1. Перейдите в папку client:
```bash
cd client
```
2. Установите зависимости:
```bash
npm install
```
3. Запустите приложение:
```bash
npm start
```



`Ctrl + C` - для завершения процесса.
