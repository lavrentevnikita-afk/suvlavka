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
    const res = await $fetch<any>('/api/orders/admin/all', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    orders.value = Array.isArray(res?.orders) ? res.orders : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить заказы'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Все заказы</h1>
          <p class="text-sm text-gray-600 mt-1">Менеджерский список заказов (розница + B2B)</p>
        </div>
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">
          Обновить
        </button>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

      <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th class="text-left px-4 py-3">№</th>
                <th class="text-left px-4 py-3">Клиент</th>
                <th class="text-left px-4 py-3">Сумма</th>
                <th class="text-left px-4 py-3">Статус</th>
                <th class="text-left px-4 py-3">Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in orders" :key="o.id" class="border-t border-gray-100">
                <td class="px-4 py-3 font-medium">#{{ o.id }}</td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ o.customerName }}</div>
                  <div class="text-xs text-gray-500">{{ o.email }}</div>
                  <div class="text-xs text-gray-500 line-clamp-1">{{ o.address }}</div>
                </td>
                <td class="px-4 py-3">{{ o.totalPrice }} ₽</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                    {{ o.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600">
                  {{ new Date(o.createdAt).toLocaleString() }}
                </td>
              </tr>
              <tr v-if="orders.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">Пусто</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
