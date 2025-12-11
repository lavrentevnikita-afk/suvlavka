<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

interface AccountOrder {
  id: number
  customerName: string
  customerEmail: string // вместо email, если так в entity
  address: string
  comment?: string | null
  totalPrice: string | number
  status: string
  createdAt: string
}

const orders = ref<AccountOrder[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  authStore.initFromStorage()
  if (!authStore.isAuthenticated) {
    return
  }

  loading.value = true
  errorMessage.value = null

  try {
    const apiBaseUrl = process.server
      ? (config as any).apiBaseUrl
      : (config.public as any).apiBaseUrl

    const response = await $fetch<{ orders: AccountOrder[] }>('/api/orders/my', {
      baseURL: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })

    orders.value = response.orders
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || err?.message || 'Не удалось загрузить ваши заказы'
  } finally {
    loading.value = false
  }
})

function goToOrder(id: number) {
  // Детали заказа уже есть на /order/:id
  router.push(`/order/${id}`)
}
</script>

<template>
  <NuxtLayout>
    <section class="space-y-4">
      <h1 class="text-xl font-semibold">Личный кабинет</h1>

      <div v-if="!authStore.isAuthenticated" class="space-y-2 text-sm">
        <p class="text-slate-600">
          Для просмотра заказов войдите в аккаунт.
        </p>
        <div class="flex gap-2">
          <NuxtLink
            to="/login"
            class="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            Войти
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="rounded-md border border-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900"
          >
            Регистрация
          </NuxtLink>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="rounded-md border border-gray-200 bg-white p-3 text-xs">
          <p class="font-medium text-slate-900">
            {{ authStore.user?.name }}
          </p>
          <p class="text-[11px] text-slate-500">
            {{ order.customerEmail }}
         </p>
        </div>

        <section class="space-y-2">
          <h2 class="text-sm font-semibold">Мои заказы</h2>

          <p v-if="loading" class="text-xs text-slate-500">
            Загружаем заказы...
          </p>

          <p v-else-if="errorMessage" class="text-xs text-red-500">
            {{ errorMessage }}
          </p>

          <p
            v-else-if="!orders.length"
            class="text-xs text-slate-500"
          >
            Заказов пока нет. Перейдите в каталог и сделайте первый заказ 🙂
          </p>

          <div v-else class="space-y-2">
            <div
              v-for="order in orders"
              :key="order.id"
              class="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs"
            >
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-900">
                    Заказ #{{ order.id }}
                  </span>
                  <span
                    class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700"
                  >
                    {{ order.status }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500">
                  {{ new Date(order.createdAt).toLocaleString() }}
                </p>
                <p class="text-[11px] text-slate-500">
                  Получатель: {{ order.customerName }}
                </p>
              </div>

              <div class="flex flex-col items-end gap-1">
                <span class="text-sm font-semibold text-slate-900">
                  {{ Number(order.totalPrice) }} ₽
                </span>
                <button
                  type="button"
                  class="text-[11px] font-medium text-slate-900 underline"
                  @click="goToOrder(order.id)"
                >
                  Детали заказа
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </NuxtLayout>
</template>
