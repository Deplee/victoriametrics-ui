# Victoria Metrics Web UI

Современный веб-интерфейс для Victoria Metrics кластера, аналогичный Prometheus UI, с поддержкой PromQL и MetricsQL запросов.

## Возможности

- 🔍 **PromQL и MetricsQL поддержка** - выполнение запросов к Victoria Metrics
- 📊 **Интерактивные графики** - визуализация метрик с помощью Chart.js
- 📈 **История запросов** - сохранение и повторное использование запросов
- 🌐 **Кластерная поддержка** - работа с vmselect
- 🏢 **Multi-tenancy** - поддержка accountID для кластерного режима
- ⏱️ **Гибкие временные диапазоны** - мгновенные запросы или запросы с диапазоном
- 🎨 **Современный UI** - адаптивный дизайн с темной/светлой темой
- ⚡ **Быстрая работа** - SPA архитектура без бэкенда

## Архитектура

```
vm-ui/
├── src/              # Исходный код React приложения
│   ├── components/   # React компоненты
│   ├── services/     # API сервисы
│   ├── types/        # TypeScript типы
│   ├── App.tsx       # Главный компонент
│   ├── main.tsx      # Точка входа
│   └── index.css     # Стили
├── docker-compose.yml # Docker конфигурация
├── Dockerfile        # Docker образ
├── package.json      # Зависимости
└── README.md         # Документация
```

**Примечание**: Это SPA приложение, которое напрямую обращается к Victoria Metrics API через vmselect. Для продакшена рекомендуется настроить CORS на vmselect или использовать reverse proxy.

## Установка и запуск

### Docker (рекомендуется)

```bash
# Создайте файл .env с адресом vmselect
cp env.example .env
# Отредактируйте .env файл с вашим адресом

# Запустите UI
docker-compose up -d

# Или передайте переменную напрямую
VM_SELECT_NODES=http://your-vmselect:8481 docker-compose up -d

```

### Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Настройте адрес vmselect в интерфейсе (кнопка "Настройки")

3. Запустите в режиме разработки:
```bash
npm run dev
```

### Конфигурация

#### Адрес vmselect

Укажите адрес вашей vmselect-ноды через интерфейс или переменную окружения:

```bash
# Переменная окружения для Docker
VM_SELECT_NODES=http://your-vmselect:8481

# Или создайте файл .env
cp env.example .env
# Отредактируйте .env с вашим адресом
```

#### AccountID для multi-tenancy

Для кластерного режима Victoria Metrics с multi-tenancy укажите accountID:

```bash
# Переменная окружения для Docker
VITE_DEFAULT_ACCOUNT_ID=0

# Или настройте через интерфейс (кнопка "Настройки")
```

**Примечание**: AccountID автоматически добавляется ко всем запросам к vmselect.

#### CORS настройка

Для работы SPA приложения необходимо настроить CORS на vmselect:

```bash
# Добавьте в команду запуска vmselect
-corsAllowOrigin="*"
```

## Использование

1. Откройте браузер и перейдите на `http://localhost:3000`
2. Введите PromQL или MetricsQL запрос
3. **Выберите тип запроса:**
   - **Мгновенный запрос** - снимите галочку "Использовать временной диапазон" для получения текущего значения метрики
   - **Запрос с диапазоном** - поставьте галочку "Использовать временной диапазон" и выберите временной диапазон
4. Нажмите "Execute" для выполнения запроса
5. Просматривайте результаты в виде графиков или таблиц

## Victoria Metrics API

Приложение использует стандартные Victoria Metrics API endpoints через vmselect с multi-tenancy:

- `GET /select/{accountID}/prometheus/api/v1/query` - выполнение запросов
- `GET /select/{accountID}/prometheus/api/v1/query_range` - запросы с временным диапазоном
- `GET /select/{accountID}/prometheus/api/v1/series` - получение списка серий
- `GET /select/{accountID}/prometheus/api/v1/labels` - получение списка лейблов
- `GET /select/{accountID}/prometheus/api/v1/label/{name}/values` - получение значений лейбла

**Примечание**: Для кластерного режима Victoria Metrics используется путь `/select/{accountID}/prometheus/` где `{accountID}` - идентификатор аккаунта (по умолчанию 0).

## Разработка

### Структура проекта

```
src/
├── components/        # React компоненты
│   ├── QueryEditor.tsx      # Редактор запросов
│   ├── TimeRangeSelector.tsx # Выбор временного диапазона
│   ├── ResultsViewer.tsx    # Отображение результатов
│   └── ConfigModal.tsx      # Настройки подключения
├── services/         # API сервисы
│   └── vmApi.ts      # Victoria Metrics API клиент
├── types/            # TypeScript типы
└── utils/            # Утилиты
```