# Система учёта посещаемости по QR-коду

Веб-приложение для университета: организаторы и администраторы создают мероприятия и QR-коды событий, студенты отмечаются сканированием (личный QR и QR мероприятия), есть аналитика и управление пользователями.

## Возможности

- **Роли:** администратор, организатор, студент.
- **JWT:** доступ и обновление токена, защищённые маршруты на фронте.
- **Мероприятия:** создание, публикация, QR мероприятия, лимиты участников.
- **Посещаемость:** отметка через сканирование QR (в т.ч. с камеры телефона).
- **Аналитика:** дашборды и графики (Recharts).
- **API:** Express 5, REST, PostgreSQL, Sequelize ORM.

## Архитектура репозитория

| Каталог | Назначение |
|---------|------------|
| `back/` | Backend: Node.js, Express, Sequelize, PostgreSQL |
| `front/` | Frontend: React 18, Vite 5, MUI 5, Zustand, React Query |

В корне репозитория есть отдельный `package.json` с зависимостью `mammoth` (вспомогательные задачи с документами); **для запуска приложения достаточно каталогов `back/` и `front/`**.

## Требования к окружению

| Компонент | Рекомендация |
|-----------|--------------|
| **ОС** | Windows 10/11, macOS или Linux |
| **Node.js** | LTS (например **20.x** или **22.x**), вместе с **npm** |
| **PostgreSQL** | **14+** (создайте пустую базу и пользователя с правами на неё) |
| **Git** | для клонирования репозитория |

Дополнительно для разработки с телефона: ПК и телефон в **одной Wi‑Fi сети**; на ПК разрешён входящий трафик на порты **3000** (Vite) и **5000** (API) в брандмауэре.

## Клонирование проекта

Замените `<URL-репозитория>` на фактический адрес вашего Git-репозитория (HTTPS или SSH):

```bash
git clone <URL-репозитория>
cd Project
```

Если репозиторий ещё не опубликован, скопируйте папку проекта целиком и работайте в ней локально.

## Настройка PostgreSQL

1. Установите и запустите службу PostgreSQL.
2. Создайте базу и пользователя (пример в `psql` или pgAdmin):

```sql
CREATE USER attendance_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE attendance_db OWNER attendance_user;
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;
```

Запомните **имя БД**, **пользователя**, **пароль**, **хост** (часто `localhost`) и **порт** (по умолчанию `5432`).

## Переменные окружения backend

В каталоге `back/` создайте файл **`.env`** (его не коммитьте в публичный репозиторий с секретами).

Пример содержимого (подставьте свои значения):

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_db
DB_USER=attendance_user
DB_PASSWORD=your_secure_password

# Сервер
PORT=5000
NODE_ENV=development

# JWT (обязательно смените секреты в любом окружении кроме локального теста)
JWT_SECRET=замените_на_длинную_случайную_строку
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=другая_длинная_случайная_строка
JWT_REFRESH_EXPIRES_IN=7d

# Срок жизни QR мероприятия после окончания (часы), по умолчанию в коде 24
QR_EXPIRY_HOURS=24

# Только для production: URL фронтенда для CORS
# FRONTEND_URL=https://your-frontend-domain.com
```

**Важно про `NODE_ENV` и таблицы БД:** в файле `back/src/models/index.js` при `NODE_ENV === 'development'` вызов `sequelize.sync()` закомментирован, поэтому таблицы при таком значении **не создаются автоматически**. Варианты:

- не задавать `NODE_ENV` или задать значение, отличное от `development`, до первого успешного запуска и синхронизации; или  
- временно раскомментировать строку `await sequelize.sync({ alter: true });` в `development`, создать схему, затем снова закомментировать по желанию.

В режиме, отличном от `development`, при старте выполняется `sequelize.sync()` и таблицы создаются при первом подключении.

## Переменные окружения frontend

В каталоге `front/` файл **`.env`** (или создайте его по образцу):

```env
# В режиме разработки Vite проксирует /api → http://localhost:5000 (удобно и с ПК, и с телефона по IP)
VITE_API_BASE_URL=/api
VITE_APP_NAME=QR Attendance System
```

Для **сборки продакшена** без прокси Vite укажите полный URL API, например `VITE_API_BASE_URL=https://api.example.com/api`, и настройте CORS на бэкенде через `FRONTEND_URL`.

## Установка зависимостей

Из **корня** репозитория (или по отдельности):

```bash
cd back
npm install

cd ../front
npm install
```

## Запуск на ПК (режим разработки)

Нужны **два терминала**.

**Терминал 1 — backend:**

```bash
cd back
npm run dev
```

Сервер слушает порт из `PORT` (по умолчанию **5000**). Проверка: откройте в браузере `http://localhost:5000/health`.

**Терминал 2 — frontend:**

```bash
cd front
npm run dev
```

Откройте в браузере **`http://localhost:3000`**. Запросы к `/api` проксируются на `http://localhost:5000`.

### Заполнение демо-данными (опционально)

После того как база доступна и таблицы созданы:

```bash
cd back
npm run db:seed
```

В скрипте `src/utils/seedDatabase.js` создаются тестовые пользователи (в т.ч. `admin@university.edu` / `admin123` и др.) — **смените пароли** перед любым публичным развёртыванием.

## Запуск с телефона в той же Wi‑Fi сети

1. Узнайте **локальный IP** ПК в сети Wi‑Fi (например `192.168.1.10`). В Windows: `ipconfig`, раздел адаптера Wi‑Fi → IPv4.
2. Убедитесь, что брандмауэр разрешает входящие подключения на **3000** и **5000** (или временно отключите проверку для локальной сети только на время отладки).
3. Backend и frontend должны быть запущены на ПК (как выше).
4. **Камера для сканирования QR** в браузере на телефоне требует **безопасного контекста** (HTTPS или localhost). С телефона `localhost` недоступен, поэтому для сканера используйте HTTPS dev-сервер Vite:

```bash
cd front
npm run dev:https
```

На телефоне откройте адрес вида **`https://<IP-ПК>:3000`** (порт 3000). Сертификат самоподписанный — в браузере нужно принять предупреждение о безопасности.

API по-прежнему доступен с ПК на порту 5000; прокси Vite на ПК перенаправляет `/api` с телефона на `localhost:5000`, поэтому отдельно открывать порт API на телефоне не требуется, если фронт открыт через тот же ПК.

Если бы вы открывали **собранный** фронт без Vite-прокси, пришлось бы задать `VITE_API_BASE_URL` как `http://<IP-ПК>:5000/api` и убедиться, что CORS и сеть это допускают.

## Скрипты npm

### Backend (`back/package.json`)

| Скрипт | Действие |
|--------|----------|
| `npm run dev` | Запуск с nodemon |
| `npm start` | Запуск без перезагрузки (`node src/server.js`) |
| `npm run db:create` | Создание БД через sequelize-cli (нужна корректная конфигурация CLI) |
| `npm run db:migrate` | Миграции sequelize-cli |
| `npm run db:seed` | Заполнение демо-данными |

### Frontend (`front/package.json`)

| Скрипт | Действие |
|--------|----------|
| `npm run dev` | Vite, HTTP, порт **3000**, доступ по LAN (`host: true`) |
| `npm run dev:https` | То же с HTTPS (для камеры QR с телефона) |
| `npm run build` | Продакшен-сборка в `front/dist` |
| `npm run preview` | Локальный просмотр сборки |
| `npm run lint` | ESLint |

## Основные зависимости (библиотеки)

**Backend:** `express`, `sequelize`, `pg`, `jsonwebtoken`, `bcryptjs`, `cors`, `helmet`, `morgan`, `express-validator`, `dotenv`, `qrcode`, `uuid`, `date-fns`, `swagger-ui-express`, `yamljs`.

**Frontend:** `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react`, `axios`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `@mui/x-date-pickers`, `date-fns`, `react-hook-form`, `yup`, `@hookform/resolvers`, `zustand`, `react-query`, `notistack`, `html5-qrcode`, `react-qr-code`, `recharts`.

Точные версии указаны в `back/package.json` и `front/package.json`.

## API (кратко)

Корень описания после запуска сервера: `GET http://localhost:5000/api`.

Маршруты: `/api/auth`, `/api/events`, `/api/attendance`, `/api/users`, `/api/analytics`. Состояние сервиса: `GET /health`.

## Продакшен-сборка (кратко)

1. Соберите фронт: `cd front && npm run build`.
2. Раздавайте статику из `front/dist` через nginx/другой веб-сервер или хостинг.
3. Запустите backend с `NODE_ENV=production`, задайте `FRONTEND_URL` для CORS, надёжные `JWT_*` секреты и параметры PostgreSQL.

---

Проект: дипломная работа по системе учёта посещаемости мероприятий с использованием QR-кодов.
