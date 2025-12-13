<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

definePageMeta({ middleware: ['b2b'] })

const auth = useAuthStore()
const cart = useCartStore()
auth.initFromStorage()
cart.initFromStorage()

const router = useRouter()
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const error = ref<string | null>(null)
const orders = ref<any[]>([])

const filters = reactive({
  q: '',
  status: 'all',
  from: '',
  to: '',
})

const statusLabels: Record<string, string> = {
  new: 'Новый',
  processing: 'В обработке',
  paid: 'Оплачен',
  shipped: 'Отгружен',
  done: 'Выполнен',
  canceled: 'Отменён',
}

function normalize(s: any) {
  return String(s ?? '').trim().toLowerCase()
}

const filteredOrders = computed(() => {
  let list = [...orders.value]

  const q = normalize(filters.q)
  if (q) {
    list = list.filter((o) => normalize(o.id).includes(q) || normalize(o.customerName).includes(q))
  }

  if (filters.status !== 'all') {
    list = list.filter((o) => normalize(o.status) === normalize(filters.status))
  }

  const from = filters.from ? new Date(filters.from + 'T00:00:00') : null
  const to = filters.to ? new Date(filters.to + 'T23:59:59') : null
  if (from || to) {
    list = list.filter((o) => {
      const d = new Date(o.createdAt)
      if (from && d < from) return false
      if (to && d > to) return false
      return true
    })
  }

  return list
})

function orderItemsCount(o: any): number {
  return Array.isArray(o?.items) ? o.items.reduce((s: number, it: any) => s + Number(it.quantity ?? 0), 0) : 0
}

function formatMoney(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '—')
  return n.toFixed(2)
}

function formatDate(d: any) {
  try {
    const dt = new Date(d)
    return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(dt)
  } catch {
    return '—'
  }
}

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<{ orders: any[] }>('/api/orders/my', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    orders.value = Array.isArray(res?.orders) ? res.orders : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить список заказов'
  } finally {
    loading.value = false
  }
}

function repeatOrder(o: any) {
  const items = Array.isArray(o?.items) ? o.items : []
  for (const it of items) {
    const id = Number(it.productId)
    const qty = Number(it.quantity ?? 0)
    if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0) continue
    cart.addItem(
      {
        id,
        name: String(it.name ?? `Товар #${id}`),
        price: Number(it.price ?? 0),
      },
      qty
    )
  }
  router.push('/cart')
}

function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  if (!process.client) return
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportOrderCsv(o: any) {
  const header = ['order_id', 'created_at', 'status', 'customer_name', 'email', 'address', 'product_id', 'name', 'qty', 'price', 'line_total']
  const lines = [header.join(',')]
  const items = Array.isArray(o?.items) ? o.items : []
  for (const it of items) {
    const qty = Number(it.quantity ?? 0)
    const price = Number(it.price ?? 0)
    const lineTotal = qty * price
    const row = [
      o.id,
      JSON.stringify(o.createdAt),
      JSON.stringify(o.status),
      JSON.stringify(o.customerName),
      JSON.stringify(o.email),
      JSON.stringify(o.address),
      it.productId,
      JSON.stringify(it.name),
      qty,
      price,
      lineTotal,
    ]
    lines.push(row.join(','))
  }
  downloadText(`order-${o.id}.csv`, lines.join('\n'), 'text/csv;charset=utf-8')
}

function exportAllCsv() {
  const header = ['order_id', 'created_at', 'status', 'total_price', 'items_count']
  const lines = [header.join(',')]
  for (const o of filteredOrders.value) {
    lines.push([
      o.id,
      JSON.stringify(o.createdAt),
      JSON.stringify(o.status),
      Number(o.totalPrice ?? 0),
      orderItemsCount(o),
    ].join(','))
  }
  downloadText(`orders.csv`, lines.join('\n'), 'text/csv;charset=utf-8')
}

onMounted(load)
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-5">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Заказы</h1>
          <p class="text-sm text-gray-600 mt-1">
            История заказов магазина: фильтры, повтор заказа и выгрузка CSV.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
            @click="load"
          >
            Обновить
          </button>
          <button
            class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
            :disabled="filteredOrders.length === 0"
            @click="exportAllCsv"
          >
            Экспорт CSV
          </button>
          <NuxtLink
            to="/b2b/quick-order"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
          >
            ⚡ Новый заказ
          </NuxtLink>
        </div>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div class="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold">Фильтры</div>
          <div class="mt-4 space-y-3">
            <div>
              <label class="text-xs text-gray-500">Поиск (№ или имя)</label>
              <input v-model="filters.q" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-300/70" placeholder="#123" />
            </div>
            <div>
              <label class="text-xs text-gray-500">Статус</label>
              <select v-model="filters.status" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-300/70">
                <option value="all">Все</option>
                <option value="new">Новый</option>
                <option value="processing">В обработке</option>
                <option value="paid">Оплачен</option>
                <option value="shipped">Отгружен</option>
                <option value="done">Выполнен</option>
                <option value="canceled">Отменён</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs text-gray-500">От</label>
                <input type="date" v-model="filters.from" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-300/70" />
              </div>
              <div>
                <label class="text-xs text-gray-500">До</label>
                <input type="date" v-model="filters.to" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-300/70" />
              </div>
            </div>
            <button
              class="w-full px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
              @click="Object.assign(filters, { q: '', status: 'all', from: '', to: '' })"
            >
              Сбросить
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">Список заказов</div>
              <div class="text-xs text-gray-500 mt-1">Найдено: {{ filteredOrders.length }}</div>
            </div>
            <div v-if="loading" class="text-xs text-gray-500">Загрузка…</div>
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
              <tbody class="divide-y divide-gray-100">
                <tr v-if="!loading && filteredOrders.length === 0">
                  <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500">
                    Заказов пока нет.
                  </td>
                </tr>

                <tr v-for="o in filteredOrders" :key="o.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="font-semibold">#{{ o.id }}</div>
                    <div class="text-xs text-gray-500">{{ orderItemsCount(o) }} шт.</div>
                  </td>
                  <td class="px-4 py-3 text-gray-700">{{ formatDate(o.createdAt) }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ formatMoney(o.totalPrice) }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border border-gray-200 bg-white">
                      {{ statusLabels[o.status] || o.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex justify-end gap-2">
                      <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="repeatOrder(o)">
                        Повторить
                      </button>
                      <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="exportOrderCsv(o)">
                        CSV
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
