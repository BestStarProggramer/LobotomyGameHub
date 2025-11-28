# Проект LobotomyGH

## Настройка окружения

### Перед запуском бэкенда необходимо создать файл `.env` в папке `server/`.

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

### Поддержка протокола `https` для бекенда на Windows

Необходимо скачать Win64 OpenSSL v3.6.0 Light по сслылке:

```
https://slproweb.com/products/Win32OpenSSL.html
```

Далее нужно установить программу в директорию `C:\Program Files`.

Во время установки ОБЯЗАТЕЛЬНО отметить:

```
- Copy OpenSSL DLLs to the Windows system directory
- Add OpenSSL to the system PATH
```

Если не предложит добавить в PATH автоматически, то необходимо добавить в РАТН вручную.

1. Win + R
2. Введите: `SystemPropertiesAdvanced`
3. Нажмите Environment Variables
4. В разделе System variables найдите Path
5. Нажмите Edit
6. Добавьте новую строку: `C:\Program Files\OpenSSL-Win64\bin`
7. Сохраните

Проверим, что все установлено (например, в терминале VSCode). Если версия выводится, то всё правильно:

```
openssl version
```

Далее перейдите в папку server и напишите в терминале

```
cd server

openssl req -nodes -new -x509 -keyout localhost.key -out localhost.cert
```

Заполните информацию (далее пример):

```
Country Name (2 letter code) [AU]:RU
State or Province Name (full name) [Some-State]:Moscow
Locality Name (eg, city) []:Moscow
Organization Name (eg, company) [Internet Widgits Pty Ltd]:LobotomyTeam
Organizational Unit Name (eg, section) []:-
Common Name (e.g. server FQDN or YOUR name) []:Dmitriy
Email Address []:3sheepcanfly3@gmail.com
```

### Поддержка протокола `https` для бекенда на Linux(Debian/Ubuntu)

Установите OpenSSL:

```
sudo apt update

sudo apt install openssl
```

Чтобы убедиться, что OpenSSL установлен и доступен, выполните команду:

```
openssl version
```

Если версия выводится, значит, все ОК.

Далее перейдите в папку server и напишите в терминале

```
cd server

openssl req -nodes -new -x509 -keyout localhost.key -out localhost.cert
```

Заполните информацию (далее пример):

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

```
cd server
```

2. Установите зависимости:

```
npm install
```

3. Запустите сервер:

```
npm start
```

4. `Ctrl + C` - для завершения процесса.

## Запуск Frontend:

1. Перейдите в папку client:

```
cd client
```

2. Установите зависимости:

```
npm install
```

3. Запустите приложение:

```
npm start
```

4. `Ctrl + C` - для завершения процесса.
