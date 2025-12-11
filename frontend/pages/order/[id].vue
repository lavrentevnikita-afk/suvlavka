<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const id = computed(() => Number(route.params.id))

const apiBaseUrl = process.server
  ? config.apiBaseUrl
  : config.public.apiBaseUrl

const { data, pending, error } = await useAsyncData(
  'order', // <-- простой строковый ключ
  () =>
    $fetch(`/api/orders/${id.value}`, {
      baseURL: apiBaseUrl
    }),
  { watch: [id] }
)

const order = computed(() => data.value?.order ?? null)

</script>

<template>
  <section v-if="pending" class="text-sm text-gray-500">
    Загрузка информации о заказе...
  </section>

  <section v-else-if="error || !order" class="space-y-2">
    <h1 class="text-xl font-semibold">Заказ не найден</h1>
    <p class="text-sm text-gray-600">
      Возможно, номер заказа указан неверно или заказ был удалён.
    </p>
    <NuxtLink
      to="/"
      class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
    >
      На главную
    </NuxtLink>
  </section>

  <section v-else class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">
        Заказ №{{ order.id }}
      </h1>
      <p class="text-sm text-gray-600">
        Спасибо! Мы приняли ваш заказ и скоро свяжемся с вами для подтверждения.
      </p>
    </header>

    <div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
      <div class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <h2 class="text-sm font-semibold">Статус заказа</h2>
        <p class="text-xs text-gray-600">
          Текущий статус:
          <span class="font-medium text-gray-900">
            {{ order.status }}
          </span>
        </p>
        <p class="text-xs text-gray-600" v-if="order.createdAt">
          Дата создания:
          <span class="font-medium text-gray-900">
            {{ new Date(order.createdAt).toLocaleString() }}
          </span>
        </p>
      </div>

      <aside class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <h2 class="text-sm font-semibold">Состав заказа</h2>

        <ul class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <li
            v-for="item in order.items"
            :key="item.productId + '-' + item.quantity"
            class="flex justify-between gap-2 text-xs"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-900 line-clamp-2">
                {{ item.name || ('Товар #' + item.productId) }}
              </p>
              <p class="text-[11px] text-gray-500">
                x{{ item.quantity }}
              </p>
            </div>
            <div class="text-right whitespace-nowrap">
              <p class="font-semibold">
                {{ Number(item.price) * item.quantity }} ₽
              </p>
            </div>
          </li>
        </ul>

        <div class="flex justify-between text-sm font-semibold">
          <span>Итого</span>
          <span>{{ Number(order.totalPrice) }} ₽</span>
        </div>
      </aside>
    </div>

    <NuxtLink
      to="/catalog"
      class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
    >
      Продолжить покупки
    </NuxtLink>
  </section>
</template>
