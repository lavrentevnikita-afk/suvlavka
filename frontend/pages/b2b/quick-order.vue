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
          <h1 class="text-2xl font-semibold">Быстрый заказ</h1>
          <p class="text-sm text-gray-600 mt-1">
            Наберите позиции по артикулам или вставьте списком. Сейчас это UI-заготовка — подключим данные и корзину следующим шагом.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/b2b/orders"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
          >
            🧾 К заказам
          </NuxtLink>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
            disabled
            title="Подключим после логики быстрого заказа"
          >
            Оформить (скоро)
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold">Вставка списком</div>
          <div class="text-xs text-gray-500 mt-1">Формат: <span class="text-gray-600">артикул;кол-во</span> (каждая строка — отдельная позиция)</div>

          <textarea
            class="mt-3 w-full min-h-[180px] rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-amber-300/70"
            placeholder="A-1001;10\nB-2020;4\nC-3300;1"
          />

          <div class="mt-3 flex items-center gap-2">
            <button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" disabled>
              Импортировать (скоро)
            </button>
            <button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" disabled>
              Очистить
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">Таблица позиций</div>
              <div class="text-xs text-gray-500 mt-1">Добавляйте позиции вручную и редактируйте количество</div>
            </div>
            <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" disabled>
              + Строка
            </button>
          </div>

          <div class="overflow-auto">
            <table class="min-w-full text-sm">
              <thead class="text-xs text-gray-500 bg-white">
                <tr>
                  <th class="text-left font-medium px-4 py-3">Артикул</th>
                  <th class="text-left font-medium px-4 py-3">Товар</th>
                  <th class="text-left font-medium px-4 py-3">Цена (опт)</th>
                  <th class="text-left font-medium px-4 py-3">Остаток</th>
                  <th class="text-left font-medium px-4 py-3">Кол-во</th>
                  <th class="text-right font-medium px-4 py-3"> </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr class="hover:bg-gray-100/40">
                  <td class="px-4 py-3">
                    <input class="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none" placeholder="A-1001" />
                  </td>
                  <td class="px-4 py-3 text-gray-500">—</td>
                  <td class="px-4 py-3 text-gray-500">—</td>
                  <td class="px-4 py-3 text-gray-500">—</td>
                  <td class="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      class="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none"
                      value="1"
                    />
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs" disabled>Удалить</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="text-xs text-gray-500">Итого: —</div>
            <div class="flex items-center gap-2">
              <button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" disabled>
                Сохранить шаблон (скоро)
              </button>
              <button class="px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95" disabled>
                В корзину (скоро)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
