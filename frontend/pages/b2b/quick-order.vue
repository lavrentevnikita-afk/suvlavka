<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCartStore, type CartProductSnapshot } from '~/stores/cart'

definePageMeta({ middleware: ['b2b'] })

const auth = useAuthStore()
const cart = useCartStore()
auth.initFromStorage()
cart.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

type QuickRow = {
  article: string
  qty: number
  product: any | null
  price: number | null
  stockTotal: number | null
  stockByWarehouse: { warehouse: string; qty: number }[]
  error?: string | null
}

const rows = ref<QuickRow[]>([
  { article: '', qty: 1, product: null, price: null, stockTotal: null, stockByWarehouse: [], error: null },
])

const pasteText = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

function addRow() {
  rows.value.push({ article: '', qty: 1, product: null, price: null, stockTotal: null, stockByWarehouse: [], error: null })
}

function removeRow(i: number) {
  rows.value.splice(i, 1)
  if (!rows.value.length) addRow()
}

function clearAll() {
  pasteText.value = ''
  rows.value = [{ article: '', qty: 1, product: null, price: null, stockTotal: null, stockByWarehouse: [], error: null }]
}

function normalizeArticle(a: string) {
  return String(a ?? '').trim().toUpperCase()
}

function stockBadge(total: number | null) {
  if (total === null) return '—'
  if (total > 20) return 'много'
  if (total >= 5) return 'мало'
  return 'под заказ'
}

async function fetchProductByArticle(article: string) {
  // используем уже существующий поиск каталога
  const res = await $fetch<any>('/api/catalog/search', {
    baseURL: apiBaseUrl,
    query: { query: article, limit: 20 },
  })
  const list = Array.isArray(res?.products) ? res.products : []
  const exact = list.find((p: any) => normalizeArticle(p.article) === normalizeArticle(article))
  return exact ?? list[0] ?? null
}

async function resolveAll() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null

  try {
    // 1) нормализация артикула
    for (const r of rows.value) {
      r.article = normalizeArticle(r.article)
      r.error = null
      r.product = null
      r.price = null
      r.stockTotal = null
      r.stockByWarehouse = []
    }

    // 2) продукты
    for (const r of rows.value) {
      if (!r.article) continue
      const p = await fetchProductByArticle(r.article)
      if (!p) {
        r.error = 'Не найден'
        continue
      }
      r.product = p
      // оптовая цена приходит как wholesalePrice строкой
      const wp = Number(p.wholesalePrice ?? p.price ?? 0)
      r.price = Number.isFinite(wp) ? wp : null
    }

    // 3) остатки одним запросом
    const articles = rows.value.map((r) => r.article).filter(Boolean)
    if (articles.length) {
      const res = await $fetch<any>('/api/b2b/stock', {
        baseURL: apiBaseUrl,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        query: { articles: articles.join(',') },
      })

      const items = Array.isArray(res?.items) ? res.items : []
      const byArticle = new Map(items.map((it: any) => [normalizeArticle(it.article), it]))
      for (const r of rows.value) {
        const it = byArticle.get(normalizeArticle(r.article))
        if (!it) continue
        r.stockTotal = Number(it.total ?? 0)
        r.stockByWarehouse = Array.isArray(it.byWarehouse) ? it.byWarehouse : []
      }
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить товары/остатки'
  } finally {
    loading.value = false
  }
}

function importFromText() {
  const lines = pasteText.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return

  const next: QuickRow[] = []
  for (const line of lines) {
    const [a, q] = line.split(';').map((x) => x.trim())
    if (!a) continue
    const qty = Math.max(0, Number(q || 0))
    next.push({ article: normalizeArticle(a), qty: Number.isFinite(qty) ? qty : 0, product: null, price: null, stockTotal: null, stockByWarehouse: [], error: null })
  }
  if (next.length) rows.value = next
}

const totalSum = computed(() => {
  return rows.value.reduce((s, r) => {
    const qty = Number(r.qty ?? 0)
    const price = Number(r.price ?? 0)
    if (!Number.isFinite(qty) || !Number.isFinite(price)) return s
    return s + qty * price
  }, 0)
})

function addAllToCart() {
  let added = 0
  for (const r of rows.value) {
    if (!r.product) continue
    const qty = Number(r.qty ?? 0)
    if (!Number.isFinite(qty) || qty <= 0) continue
    const price = Number(r.price ?? r.product.wholesalePrice ?? r.product.price ?? 0)
    const snapshot: CartProductSnapshot = {
      id: Number(r.product.id),
      name: String(r.product.name ?? ''),
      price: Number.isFinite(price) ? price : 0,
      article: r.product.article,
      imageUrl: r.product?.images?.[0]?.url ?? r.product.imageUrl ?? null,
      categorySlug: r.product?.category?.slug ?? null,
      categoryName: r.product?.category?.name ?? null,
    }
    cart.addItem(snapshot, qty)
    added++
  }
  if (added > 0) navigateTo('/cart')
}
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-5">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Быстрый заказ</h1>
          <p class="text-sm text-gray-600 mt-1">
            Вставьте списком <span class="text-gray-700 font-medium">артикул;кол-во</span> или добавляйте строки вручную.
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
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
            :disabled="loading"
            @click="resolveAll"
          >
            {{ loading ? 'Загрузка…' : 'Проверить товары/остатки' }}
          </button>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95 disabled:opacity-50"
            :disabled="rows.every(r => !r.product)"
            @click="addAllToCart"
          >
            🛒 Добавить в корзину
          </button>
        </div>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold">Вставка списком</div>
          <div class="text-xs text-gray-500 mt-1">Формат: <span class="text-gray-600">артикул;кол-во</span></div>

          <textarea
            v-model="pasteText"
            class="mt-3 w-full min-h-[180px] rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-amber-300/70"
            placeholder="SV-0001;10\nSV-0002;4\nSV-0003;1"
          />

          <div class="mt-3 flex items-center gap-2">
            <button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="importFromText">
              Импортировать
            </button>
            <button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="clearAll">
              Очистить
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">Таблица позиций</div>
              <div class="text-xs text-gray-500 mt-1">Артикул → товар, цена, остаток. Кол-во можно менять.</div>
            </div>
            <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="addRow">
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
                  <th class="text-right font-medium px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(r, i) in rows" :key="i" class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <input
                      v-model="r.article"
                      class="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-amber-300/70"
                      placeholder="SV-0001"
                    />
                    <div v-if="r.error" class="text-[11px] text-red-600 mt-1">{{ r.error }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="r.product" class="font-medium">{{ r.product.name }}</div>
                    <div v-else class="text-gray-500">—</div>
                    <div v-if="r.product" class="text-[11px] text-gray-500">#{{ r.product.id }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="r.price !== null" class="font-medium">{{ r.price.toFixed(2) }}</div>
                    <div v-else class="text-gray-500">—</div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="font-medium">{{ stockBadge(r.stockTotal) }}</div>
                    <div v-if="r.stockTotal !== null" class="text-[11px] text-gray-500">{{ r.stockTotal }} шт.</div>
                    <div v-if="r.stockByWarehouse?.length" class="text-[11px] text-gray-500 mt-1">
                      <span v-for="(w, wi) in r.stockByWarehouse" :key="wi">
                        {{ w.warehouse }}: {{ w.qty }}<span v-if="wi < r.stockByWarehouse.length - 1"> · </span>
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <input
                      v-model.number="r.qty"
                      type="number"
                      min="0"
                      class="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-amber-300/70"
                    />
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs" @click="removeRow(i)">
                      Удалить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="text-xs text-gray-500">Итого: {{ totalSum.toFixed(2) }}</div>
            <div class="flex items-center gap-2">
              <button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="resolveAll">
                Пересчитать
              </button>
              <button
                class="px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95 disabled:opacity-50"
                :disabled="rows.every(r => !r.product)"
                @click="addAllToCart"
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
