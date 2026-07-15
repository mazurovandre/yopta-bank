# Yopta Bank

REST API на NestJS для управления пользователями: регистрация, аутентификация по JWT (access/refresh токены), профиль текущего пользователя, список пользователей с пагинацией и поиском, обновление и мягкое удаление профиля.

## Стек

- [NestJS](https://nestjs.com/)
- PostgreSQL + [TypeORM](https://typeorm.io/)
- Docker Compose (поднимает только БД)
- JWT (`@nestjs/jwt`) для аутентификации/авторизации
- `class-validator` / `class-transformer` для валидации входных данных
- Swagger (`@nestjs/swagger`) для документации API
- Jest для юнит-тестов

## Возможности

- Регистрация и логин с выдачей пары `access_token`/`refresh_token`, обновление токенов по refresh-токену.
- Получение профиля текущего пользователя (`/profile`) без передачи id — по данным из токена.
- Список пользователей (`/users`) с пагинацией, фильтром по логину/email и диапазону возраста — доступен только авторизованным пользователям.
- Обновление и мягкое удаление (soft-delete) текущего пользователя через `/profile`.
- Swagger-документация со схемой авторизации через Bearer-токен.

## Запуск

1. Скопировать переменные окружения (пример):

   ```env
   DATABASE_TYPE=postgres
   DATABASE_USER=<db-user>
   DATABASE_PASSWORD=<db-password>
   DATABASE_PORT=<db-port>
   DATABASE_HOST=<db-host>
   DATABASE_NAME=<db-name>
   JWT_SECRET=<jwt-secret>
   JWT_EXPIRATION_TIME=<jwt-expiration-seconds>
   ```

2. Поднять PostgreSQL:

   ```bash
   docker-compose up -d
   ```

3. Установить зависимости и запустить приложение:

   ```bash
   npm install
   npm run start:dev
   ```

Приложение стартует на `http://localhost:3000`, Swagger-документация доступна по адресу `http://localhost:3000/api`.

## Основные эндпоинты

| Метод | Путь         | Описание                                   | Авторизация |
| ----- | ------------ | ------------------------------------------- | ----------- |
| POST  | `/auth/signup` | Регистрация пользователя                    | —           |
| POST  | `/auth/login` | Вход по логину/паролю                       | —           |
| POST  | `/auth/refresh` | Обновление пары токенов по refresh-токену   | —           |
| GET   | `/profile`   | Профиль текущего пользователя               | Bearer      |
| PATCH | `/profile`   | Обновление текущего пользователя            | Bearer      |
| DELETE| `/profile`   | Мягкое удаление текущего пользователя        | Bearer      |
| GET   | `/users`     | Список пользователей (пагинация, поиск)     | Bearer      |
| GET   | `/users/:id` | Пользователь по id                          | Bearer      |

## Тесты

```bash
npm run test
```
