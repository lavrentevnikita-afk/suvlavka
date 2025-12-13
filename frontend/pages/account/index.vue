<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-4">Личный кабинет</h1>

    <!-- Не авторизован -->
    <div v-if="!user">
      <p class="mb-4">Вы не авторизованы.</p>
      <NuxtLink
        to="/login"
        class="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition"
      >
        Войти
      </NuxtLink>
    </div>

    <!-- Авторизован -->
    <div v-else>
      <div class="mb-6 rounded-lg border border-slate-200 p-4 bg-white">
        <h2 class="text-lg font-semibold mb-2">Профиль</h2>
        <p><span class="font-medium">Имя:</span> {{ user.name }}</p>
        <p><span class="font-medium">Email:</span> {{ user.email }}</p>
        <p class="mt-2">
          <span class="font-medium">Тип аккаунта:</span>
          <span
            class="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
            :class="
              user.role === 'store'
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : user.role === 'manager'
                ? 'border-sky-300 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            "
          >
            {{ roleLabel }}
          </span>

          <NuxtLink
            v-if="user.role === 'store' || user.role === 'manager'"
            to="/b2b"
            class="ml-3 text-xs text-slate-900 underline"
          >
            Перейти в B2B
          </NuxtLink>

          <NuxtLink
            v-else
            to="/b2b/register"
            class="ml-3 text-xs text-slate-900 underline"
          >
            Зарегистрировать магазин
          </NuxtLink>
        </p>
      </div>

      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Мои заказы</h2>
        <button
          type="button"
          class="text-sm text-sky-600 hover:underline disabled:opacity-50"
          :disabled="loading"
          @click="fetchOrders"
        >
          Обновить
        </button>
      </div>

      <!-- Состояния -->
      <div v-if="loading" class="text-slate-500">Загружаем заказы…</div>

      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>

      <div v-else-if="orders.length === 0" class="text-slate-500">
        У вас пока нет заказов.
      </div>

      <!-- Список заказов -->
      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="border border-slate-200 rounded-lg p-4 bg-white"
        >
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div class="text-sm text-slate-500">
                Заказ № {{ order.id }}
              </div>
              <div class="text-xs text-slate-400">
                {{ formatDate(order.createdAt) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium">
                {{ order.status || 'new' }}
              </div>
              <div class="text-sm text-slate-600">
                {{ order.totalPrice }} ₽
              </div>
            </div>
          </div>

          <div v-if="order.items && order.items.length" class="mt-2">
            <div class="text-sm font-medium mb-1">Товары:</div>
            <ul class="text-sm list-disc list-inside space-y-0.5">
              <li v-for="(item, idx) in order.items" :key="idx">
                {{ item.name }} × {{ item.quantity }}
              </li>
            </ul>
          </div>

          <div class="mt-2 text-xs text-slate-500">
            Для: {{ order.customerName }} ({{ order.email }})
          </div>

          <div class="mt-3">
            <NuxtLink
              :to="`/order/${order.id}`"
              class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
            >
              Открыть чек
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AccountOrder {
  id: number
  customerName: string
  email: string
  address: string
  comment?: string | null
  totalPrice: string
  status: string
  createdAt: string
  items: {
    productId: number
    quantity: number
    price: string
    name: string
  }[]
}

const authStore = useAuthStore()
const config = useRuntimeConfig()

const user = computed(() => authStore.user)

const roleLabel = computed(() => {
  const role = user.value?.role
  if (role === 'store') return 'Магазин'
  if (role === 'manager') return 'Менеджер'
  return 'Розница'
})

const orders = ref<AccountOrder[]>([])
const loading = ref(false)
const error = ref('')

const formatDate = (value: string | Date | undefined) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('ru-RU')
}

const fetchOrders = async () => {
  // если нет токена — нет смысла стучаться в /my
  if (!authStore.accessToken) {
    error.value = 'Вы не авторизованы.'
    orders.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await $fetch<{ orders: AccountOrder[] }>('/api/orders/my', {
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })

    orders.value = res.orders ?? []
  } catch (err: any) {
    console.error(err)
    error.value =
      err?.data?.message || 'Не удалось загрузить список заказов.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
