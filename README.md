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

Также, для поддержки протокола https для бекенда необходимо скачать Win64 OpenSSL v3.6.0 Light по ссылке https://slproweb.com/products/Win32OpenSSL.html, после чего устанавливаем программу в директорию C:\Program Files
Во время установки ОБЯЗАТЕЛЬНО отметь:
“Copy OpenSSL DLLs to the Windows system directory”
“Add OpenSSL to the system PATH” (если предложит)
Если не предложит, то добавляем РАТН вручную.
Для этого
Win + R
Введите:
SystemPropertiesAdvanced
Нажмите Environment Variables
В разделе System variables найди Path
Нажмите Edit
Добавьте новую строку:
C:\Program Files\OpenSSL-Win64\bin
Сохраните
Перезаходим в VSCode и пишем openssl version. Если версия выводится, то все ОК.
Далее переходим в папку server и пишем в терминале openssl req -nodes -new -x509 -keyout localhost.key -out localhost.cert
Заполняем инфу
Для примера

```
Country Name (2 letter code) [AU]:RU
State or Province Name (full name) [Some-State]:Moscow
Locality Name (eg, city) []:Moscow
Organization Name (eg, company) [Internet Widgits Pty Ltd]:LobotomyTeam
Organizational Unit Name (eg, section) []:-
Common Name (e.g. server FQDN or YOUR name) []:Dmitriy
Email Address []:3sheepcanfly3@gmail.com
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
