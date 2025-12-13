<script setup lang="ts">
definePageMeta({
  middleware: ['b2b'],
})
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-5">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Заказы</h1>
          <p class="text-sm text-gray-600 mt-1">
            История заказов магазина. Здесь появятся фильтры, статусы, повтор заказа и выгрузки.
          </p>
        </div>

        <NuxtLink
          to="/b2b/quick-order"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
        >
          ⚡ Новый заказ
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div class="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold">Фильтры</div>
          <div class="text-xs text-gray-500 mt-1">Скоро: статус, дата, сумма</div>

          <div class="mt-4 space-y-2">
            <div class="rounded-xl border border-gray-200 p-3">
              <div class="text-xs text-gray-500">Статус</div>
              <div class="text-sm text-slate-200 mt-1">Все</div>
            </div>
            <div class="rounded-xl border border-gray-200 p-3">
              <div class="text-xs text-gray-500">Период</div>
              <div class="text-sm text-slate-200 mt-1">30 дней</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-3 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">Список заказов</div>
              <div class="text-xs text-gray-500 mt-1">Пока заглушка UI (данные подключим следующим шагом)</div>
            </div>

            <div class="flex items-center gap-2">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Поиск по номеру"
                  class="w-56 max-w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-300/70"
                />
              </div>
              <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">Обновить</button>
            </div>
          </div>

          <div class="overflow-auto">
            <table class="min-w-full text-sm">
              <thead class="text-xs text-gray-500 bg-white">
                <tr>
                  <th class="text-left font-medium px-4 py-3">Заказ</th>
                  <th class="text-left font-medium px-4 py-3">Дата</th>
                  <th class="text-left font-medium px-4 py-3">Сумма</th>
                  <th class="text-left font-medium px-4 py-3">Статус</th>
                  <th class="text-right font-medium px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr class="hover:bg-gray-100/40">
                  <td class="px-4 py-3">
                    <div class="font-semibold">#000012</div>
                    <div class="text-xs text-gray-500">12 позиций</div>
                  </td>
                  <td class="px-4 py-3 text-slate-200">—</td>
                  <td class="px-4 py-3 text-slate-200">—</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Ожидает
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">Повторить</button>
                  </td>
                </tr>

                <tr class="hover:bg-gray-100/40">
                  <td class="px-4 py-3">
                    <div class="font-semibold">#000011</div>
                    <div class="text-xs text-gray-500">5 позиций</div>
                  </td>
                  <td class="px-4 py-3 text-slate-200">—</td>
                  <td class="px-4 py-3 text-slate-200">—</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Выполнен
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">Открыть</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>Показано: 2 (пример)</div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100">←</button>
              <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
