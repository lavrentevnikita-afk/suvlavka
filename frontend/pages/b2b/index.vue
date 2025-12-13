<script setup lang="ts">
definePageMeta({
  middleware: ['b2b'],
})
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Дэшборд</h1>
          <p class="text-sm text-gray-600 mt-1">
            Быстрый доступ к заказам и набору позиций. Здесь позже появится аналитика и уведомления.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/b2b/quick-order"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
          >
            ⚡ Быстрый заказ
          </NuxtLink>
          <NuxtLink
            to="/b2b/orders"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
          >
            🧾 Заказы
          </NuxtLink>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-xs text-gray-500">Статус</div>
          <div class="mt-1 text-lg font-semibold">Аккаунт магазина</div>
          <div class="text-sm text-gray-600 mt-2">
            Оптовые цены активны. Если не видите опт — обновите профиль в аккаунте.
          </div>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-xs text-gray-500">Заказы</div>
          <div class="mt-1 text-lg font-semibold">История и повтор</div>
          <div class="text-sm text-gray-600 mt-2">
            Список заказов магазина, статусы, повтор заказа одной кнопкой.
          </div>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-xs text-gray-500">Набор</div>
          <div class="mt-1 text-lg font-semibold">Быстрый ввод</div>
          <div class="text-sm text-gray-600 mt-2">
            Табличный интерфейс: артикул → количество, плюс импорт списком.
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">Быстрый старт</div>
              <div class="text-xs text-gray-500 mt-1">То, что обычно нужно магазину каждый день</div>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <NuxtLink to="/b2b/quick-order" class="rounded-xl border border-gray-200 hover:bg-gray-100 p-3">
              <div class="text-sm font-medium">⚡ Создать заказ</div>
              <div class="text-xs text-gray-500 mt-1">Набрать позиции по артикулам</div>
            </NuxtLink>
            <NuxtLink to="/b2b/orders" class="rounded-xl border border-gray-200 hover:bg-gray-100 p-3">
              <div class="text-sm font-medium">🧾 Посмотреть заказы</div>
              <div class="text-xs text-gray-500 mt-1">Статусы, повтор, выгрузки</div>
            </NuxtLink>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold">Что дальше (v0.2.x)</div>
          <ul class="mt-3 space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2"><span class="mt-1">•</span><span>Остатки по складам / группам складов</span></li>
            <li class="flex items-start gap-2"><span class="mt-1">•</span><span>Шаблоны заказов и импорт «артикул;кол-во»</span></li>
            <li class="flex items-start gap-2"><span class="mt-1">•</span><span>Индивидуальные цены и выбор ценовой группы</span></li>
          </ul>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
