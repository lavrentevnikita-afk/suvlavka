<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const error = ref<string | null>(null)

const warehouses = ref<any[]>([])
const warehouse = ref('MSK')
const stocks = ref<any[]>([])

// инвентаризация (ручной ввод факта)
const invQty = ref<Record<number, number | null>>({})
const invNote = ref<Record<number, string>>({})
const invSaving = ref<Record<number, boolean>>({})

async function inventorySet(productId: number) {
  if (!auth.accessToken) return
  invSaving.value[productId] = true
  try {
    const qty = Number(invQty.value[productId] ?? 0)
    const note = String(invNote.value[productId] || '').trim() || undefined
    await $fetch<any>('/api/ops/stocks/adjust', {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { warehouse: warehouse.value, productId, qty, note },
    })
    await loadStocks()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить инвентаризацию'
  } finally {
    invSaving.value[productId] = false
  }
}

async function loadWarehouses() {
  if (!auth.accessToken) return
  const res = await $fetch<any>('/api/ops/warehouses', {
    baseURL: apiBaseUrl,
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })
  warehouses.value = Array.isArray(res?.warehouses) ? res.warehouses : []
  if (!warehouses.value.find((w) => w.code === warehouse.value) && warehouses.value[0]?.code) {
    warehouse.value = warehouses.value[0].code
  }
}

async function loadStocks() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/ops/stocks', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: { warehouse: warehouse.value },
    })
    stocks.value = Array.isArray(res?.stocks) ? res.stocks : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить остатки'
  } finally {
    loading.value = false
  }
}

watch(warehouse, () => loadStocks())

onMounted(async () => {
  await loadWarehouses()
  await loadStocks()
})
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Склад</h1>
          <p class="text-sm text-gray-600 mt-1">Доступно / резерв / под заказ (упрощённо)</p>
        </div>

        <div class="flex items-center gap-2">
          <select v-model="warehouse" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option v-for="w in warehouses" :key="w.code" :value="w.code">{{ w.code }} — {{ w.name || w.code }}</option>
          </select>
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="loadStocks">
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
                <th class="text-left px-4 py-3">Товар</th>
                <th class="text-right px-4 py-3">Доступно</th>
                <th class="text-right px-4 py-3">Резерв</th>
                <th class="text-right px-4 py-3">Под заказ</th>
                <th class="text-left px-4 py-3">Инвентаризация (факт)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in stocks" :key="s.id" class="border-t border-gray-100">
                <td class="px-4 py-3">
                  <div class="font-medium">{{ s.product?.name || ('#' + s.product?.id) }}</div>
                  <div class="text-xs text-gray-500">Артикул: {{ s.product?.article || '—' }} · ID: {{ s.product?.id }}</div>
                </td>
                <td class="px-4 py-3 text-right tabular-nums">{{ s.qty }}</td>
                <td class="px-4 py-3 text-right tabular-nums">{{ s.reservedQty || 0 }}</td>
                <td class="px-4 py-3 text-right tabular-nums">{{ s.onOrderQty || 0 }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <input
                      v-model.number="invQty[s.product?.id]"
                      type="number"
                      min="0"
                      class="w-full sm:w-28 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                      :placeholder="String(s.qty)"
                    />
                    <input
                      v-model="invNote[s.product?.id]"
                      class="w-full sm:flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                      placeholder="Комментарий…"
                    />
                    <button
                      class="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-100"
                      :disabled="invSaving[s.product?.id]"
                      :title="'Зафиксировать факт (ID ' + s.product?.id + ')'"
                      @click="inventorySet(s.product?.id)"
                    >
                      <span class="text-lg">📝</span>
                    </button>
                  </div>
                  <div class="text-[11px] text-gray-500 mt-1">
                    Вводите фактическое «Доступно» (не дельту). Резерв/под заказ не трогаем.
                  </div>
                </td>
              </tr>
              <tr v-if="stocks.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">Пусто</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
