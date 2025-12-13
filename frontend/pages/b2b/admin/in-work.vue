<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const error = ref<string | null>(null)
const orders = ref<any[]>([])

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/ops/orders', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: { status: 'in_work' },
    })
    orders.value = Array.isArray(res?.orders) ? res.orders : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить заказы'
  } finally {
    loading.value = false
  }
}

function fmtItem(i: any) {
  const name = i?.name ? String(i.name) : (i?.productId ? `#${i.productId}` : 'Товар')
  const qty = Number(i?.quantity || 0)
  return `${name} — ${qty} шт.`
}

onMounted(load)
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div class="flex items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">В работе</h1>
          <p class="text-sm text-gray-600 mt-1">Заказы со статусом «В работе» с артикулами и количеством</p>
        </div>
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">
          Обновить
        </button>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="o in orders" :key="o.id" class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="font-semibold">Заказ #{{ o.id }}</div>
              <div class="text-xs text-gray-500">{{ o.customerName }} · {{ o.totalPrice }} ₽</div>
              <div class="text-xs text-gray-500 mt-1">{{ o.address }}</div>
            </div>
            <NuxtLink :to="`/order/${o.id}`" class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">
              Открыть
            </NuxtLink>
          </div>

          <div class="mt-4">
            <div class="text-xs font-semibold text-gray-700 mb-2">Позиции</div>
            <div class="space-y-2">
              <div
                v-for="(i, idx) in (o.items || [])"
                :key="idx"
                class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="truncate">{{ i.name || ('#' + i.productId) }}</div>
                    <div class="text-[11px] text-gray-500">ID: {{ i.productId }}</div>
                  </div>
                  <div class="tabular-nums font-semibold">{{ i.quantity }} шт.</div>
                </div>
              </div>
              <div v-if="(o.items || []).length === 0" class="text-sm text-gray-500">Позиции не найдены</div>
            </div>
          </div>
        </div>

        <div v-if="orders.length === 0" class="lg:col-span-2 text-center text-gray-500 py-10">
          Пока нет заказов «В работе»
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
