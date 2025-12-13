<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const error = ref<string | null>(null)

const status = ref<'all' | 'planned' | 'in_work' | 'ready'>('all')
const tasks = ref<any[]>([])

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/ops/production', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: status.value === 'all' ? {} : { status: status.value },
    })
    tasks.value = Array.isArray(res?.tasks) ? res.tasks : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить производство'
  } finally {
    loading.value = false
  }
}

async function setStatus(id: number, s: 'planned' | 'in_work' | 'ready') {
  if (!auth.accessToken) return
  await $fetch<any>(`/api/ops/production/${id}/status`, {
    baseURL: apiBaseUrl,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { status: s },
  })
  await load()
}

async function moveToStock(id: number) {
  if (!auth.accessToken) return
  await $fetch<any>(`/api/ops/production/${id}/move-to-stock`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { warehouse: 'MSK' },
  })
  await load()
}

watch(status, () => load())
onMounted(load)
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Производство</h1>
          <p class="text-sm text-gray-600 mt-1">Задачи под заказ (упрощённо)</p>
        </div>

        <div class="flex items-center gap-2">
          <select v-model="status" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option value="all">Все</option>
            <option value="planned">Запланировано</option>
            <option value="in_work">В работе</option>
            <option value="ready">Готово</option>
          </select>
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">
            Обновить
          </button>
        </div>
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
                <th class="text-left px-4 py-3">Задача</th>
                <th class="text-right px-4 py-3">Кол-во</th>
                <th class="text-left px-4 py-3">Статус</th>
                <th class="text-left px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tasks" :key="t.id" class="border-t border-gray-100">
                <td class="px-4 py-3">
                  <div class="font-medium">#{{ t.id }} · Заказ #{{ t.orderId }}</div>
                  <div class="text-xs text-gray-500">Товар ID: {{ t.productId }}</div>
                  <div v-if="t.movedToStockAt" class="text-xs text-emerald-700 mt-1">На складе: {{ new Date(t.movedToStockAt).toLocaleString() }}</div>
                </td>
                <td class="px-4 py-3 text-right tabular-nums">{{ t.qty }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                    {{ t.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-2">
                    <button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs" @click="setStatus(t.id, 'planned')">
                      Запланировать
                    </button>
                    <button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs" @click="setStatus(t.id, 'in_work')">
                      В работу
                    </button>
                    <button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs" @click="setStatus(t.id, 'ready')">
                      Готово
                    </button>
                    <button
                      class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                      :disabled="t.status !== 'ready' || !!t.movedToStockAt"
                      @click="moveToStock(t.id)"
                    >
                      На склад
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="tasks.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-500">Пусто</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
