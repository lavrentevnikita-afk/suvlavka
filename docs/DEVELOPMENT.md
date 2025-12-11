# Руководство по разработке (DEVELOPMENT)

Этот документ описывает структуру проекта и общие подходы к разработке.  
Он дополняет ARCHITECTURE_AND_DEPLOYMENT.md и DESIGN_SYSTEM.md.

---

## Структура репозитория

```text
souvenir-shop/
├── frontend/              # Nuxt 3 (Vue 3 + TS + Pinia + Tailwind + PWA)
├── backend/               # NestJS (TS) API
├── uploads/               # локальное хранилище изображений
├── docker-compose.yml
├── README.md
├── ARCHITECTURE_AND_DEPLOYMENT.md
├── DESIGN_SYSTEM.md
├── ROADMAP.md
└── CONTRIBUTING.md
```

---

## Общие принципы разработки

1. **TypeScript везде**  
   И frontend, и backend пишутся на TS.

2. **Чистая архитектура и модульность**  
   Код разбивается по функциональным зонам: каталог, заказы, пользователи, склад и т.д.

3. **Соблюдение дизайн‑системы**  
   Все визуальные изменения должны соответствовать DESIGN_SYSTEM.md:
   - использовать палитру,
   - использовать токены Tailwind,
   - сохранять пропорции и скругления.

4. **Тестируемость**  
   По мере развития проекта добавляются модульные и e2e‑тесты.

---

## Документы для подробностей

- Архитектура и окружения — ARCHITECTURE_AND_DEPLOYMENT.md
- Визуальный язык — DESIGN_SYSTEM.md
- План фич и этапов — ROADMAP.md
- Правила вкладов и code style — CONTRIBUTING.md
