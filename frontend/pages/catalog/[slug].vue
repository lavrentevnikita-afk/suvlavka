<script setup lang="ts">
import { useCityStore } from '~/stores/city'
const route = useRoute()
const auth = useAuthStore()
auth.initFromStorage()
const router = useRouter()
const config = useRuntimeConfig()
const cityStore = useCityStore()

onMounted(() => {
  cityStore.init()
})

const apiBaseUrl = process.server ? config.apiBaseUrl : config.public.apiBaseUrl

const slug = computed(() => route.params.slug as string)

// Filters (keep backward compatible query params)
const priceMin = ref<string | null>((route.query.minPrice as string) || null)
const priceMax = ref<string | null>((route.query.maxPrice as string) || null)
const inStock = ref((route.query.inStock as string) === 'true')
const sort = ref((route.query.sort as string) || 'popularity')

// View mode (grid/list)
const { mode } = useCatalogViewMode()

// Price mode (retail/b2b) – simple context rule: B2B area shows wholesale first.
const priceMode = computed(() =>
  (route.path.startsWith('/b2b') || auth.user?.role === 'store') ? 'b2b' : 'retail'
)

const buildQuery = () => {
  const query: Record<string, string> = {
    category: slug.value,
    sort: sort.value,
  }
  if (cityStore.code) query.city = cityStore.code
  if (priceMin.value) query.minPrice = priceMin.value
  if (priceMax.value) query.maxPrice = priceMax.value
  if (inStock.value) query.inStock = 'true'
  return query
}

function applyFilters() {
  router.push({ path: `/catalog/${slug.value}`, query: buildQuery() })
}

// Quick chips state is derived from current filters
const quickActive = computed(() => ({
  new: sort.value === 'new',
  hits: sort.value === 'popularity',
  inStock: inStock.value,
}))

function toggleQuick(key: 'new' | 'hits' | 'inStock') {
  if (key === 'inStock') {
    inStock.value = !inStock.value
  } else if (key === 'new') {
    sort.value = sort.value === 'new' ? 'popularity' : 'new'
  } else if (key === 'hits') {
    sort.value = sort.value === 'popularity' ? 'new' : 'popularity'
  }
  applyFilters()
}

// Products (pagination + load more)
const page = ref(1)
const limit = ref(24)
const products = ref<any[]>([])
const total = ref<number>(0)
const pending = ref(false)
const loadError = ref(false)

async function fetchPage(p: number, replace = false) {
  pending.value = true
  loadError.value = false
  try {
    const res = await $fetch<any>('/api/catalog/products', {
      baseURL: apiBaseUrl,
      query: { ...buildQuery(), page: String(p), limit: String(limit.value) },
    })
    total.value = Number(res?.total ?? 0)
    const next = Array.isArray(res?.products) ? res.products : []
    products.value = replace ? next : [...products.value, ...next]
  } catch {
    loadError.value = true
    if (replace) products.value = []
  } finally {
    pending.value = false
  }
}

const hasProducts = computed(() => products.value.length > 0)
const canLoadMore = computed(() => products.value.length < total.value)

watch(
  [slug, () => route.query],
  () => {
    // sync from URL -> local refs
    priceMin.value = (route.query.minPrice as string) || null
    priceMax.value = (route.query.maxPrice as string) || null
    inStock.value = (route.query.inStock as string) === 'true'
    sort.value = (route.query.sort as string) || 'popularity'

    page.value = 1
    products.value = []
    fetchPage(1, true)
  },
  { immediate: true }
)

async function loadMore() {
  if (pending.value || !canLoadMore.value) return
  page.value += 1
  await fetchPage(page.value)
}

// Micro-banners: simple promo blocks per category
const microBanners = computed(() => {
  const map: Record<string, Array<{ title: string; text?: string; href?: string }>> = {
    souvenirs: [
      {
        title: 'Промо недели',
        text: 'Соберите набор из 3 сувениров — удобно для подарков и витрины.',
        href: '/catalog/souvenirs?sort=popularity',
      },
    ],
    gifts: [
      {
        title: 'Нанесение логотипа',
        text: 'Корпоративные подарки — подскажем варианты и сроки.',
        href: '/catalog/gifts?sort=new',
      },
    ],
  }
  return map[slug.value] ?? []
})

// Recently viewed
const { items: recentlyViewed } = useRecentlyViewed()

// Simple list virtualization (only for compact list, when many items are already loaded)
const virtualEnabled = computed(() => mode.value === 'list' && products.value.length >= 120)
const scroller = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const rowHeight = 108
const overscan = 8

function onScroll() {
  if (!scroller.value) return
  scrollTop.value = scroller.value.scrollTop
}

const visibleRange = computed(() => {
  if (!virtualEnabled.value) return { start: 0, end: products.value.length }
  const viewport = scroller.value?.clientHeight ?? 600
  const start = Math.max(0, Math.floor(scrollTop.value / rowHeight) - overscan)
  const visibleCount = Math.ceil(viewport / rowHeight) + overscan * 2
  const end = Math.min(products.value.length, start + visibleCount)
  return { start, end }
})

const topSpacer = computed(() => (virtualEnabled.value ? visibleRange.value.start * rowHeight : 0))
const bottomSpacer = computed(() => {
  if (!virtualEnabled.value) return 0
  const hidden = products.value.length - visibleRange.value.end
  return Math.max(0, hidden * rowHeight)
})

const visibleProducts = computed(() => {
  const { start, end } = visibleRange.value
  return products.value.slice(start, end)
})
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <h1 class="text-xl font-semibold">Категория: {{ slug }}</h1>
          <p class="text-sm text-gray-600">Быстрые фильтры, переключение вида и быстрые загрузки — как в современных e‑commerce.</p>
        </div>

        <ViewToggle v-model="mode" />
      </div>

      <QuickFilterChips :active="quickActive" @toggle="toggleQuick" />
    </header>

    <!-- Filters (advanced) -->
    <form
      class="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-3 text-xs"
      @submit.prevent="applyFilters"
    >
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-gray-500">Цена от</label>
        <input
          v-model="priceMin"
          type="number"
          min="0"
          class="w-28 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-gray-500">Цена до</label>
        <input
          v-model="priceMax"
          type="number"
          min="0"
          class="w-28 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"
        />
      </div>

      <label class="inline-flex items-center gap-1 text-[11px] text-gray-700">
        <input v-model="inStock" type="checkbox" class="h-3 w-3 rounded border-gray-300 text-slate-900" />
        Только в наличии
      </label>

      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-gray-500">Сортировка</label>
        <select
          v-model="sort"
          class="rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"
        >
          <option value="popularity">По популярности</option>
          <option value="price">По цене</option>
          <option value="new">Сначала новые</option>
        </select>
      </div>

      <button type="submit" class="ml-auto inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white">
        Применить
      </button>
    </form>

    <!-- Micro banners -->
    <div v-if="microBanners.length" class="grid gap-3 md:grid-cols-2">
      <CategoryMicroBanner v-for="(b, i) in microBanners" :key="i" :title="b.title" :text="b.text" :href="b.href" />
    </div>

    <!-- Products -->
    <div v-if="pending && !products.length" class="space-y-3">
      <div v-if="mode === 'grid'" class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <ProductCardSkeleton v-for="n in 12" :key="n" />
      </div>
      <div v-else class="space-y-2">
        <ProductRowSkeleton v-for="n in 8" :key="n" />
      </div>
    </div>

    <div v-else-if="loadError" class="text-sm text-red-500">Ошибка при загрузке товаров.</div>
    <div v-else-if="!hasProducts" class="text-sm text-gray-500">В этой категории пока нет товаров с такими условиями фильтра.</div>

    <template v-else>
      <!-- Grid -->
      <div v-if="mode === 'grid'" class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product" :mode="priceMode" :prefetch="true" />
      </div>

      <!-- Compact list (+ optional virtualization) -->
      <div v-else>
        <div
          v-if="virtualEnabled"
          ref="scroller"
          class="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-2"
          @scroll="onScroll"
        >
          <div :style="{ height: topSpacer + 'px' }" />
          <div class="space-y-2">
            <ProductRow v-for="product in visibleProducts" :key="product.id" :product="product" :mode="priceMode" :prefetch="true" />
          </div>
          <div :style="{ height: bottomSpacer + 'px' }" />
        </div>

        <div v-else class="space-y-2">
          <ProductRow v-for="product in products" :key="product.id" :product="product" :mode="priceMode" :prefetch="true" />
        </div>
      </div>

      <div class="pt-2 flex items-center justify-center">
        <button
          v-if="canLoadMore"
          type="button"
          class="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          :disabled="pending"
          @click="loadMore"
        >
          <span v-if="pending">Загружаем…</span>
          <span v-else>Показать ещё</span>
        </button>
      </div>
    </template>

    <!-- Recently viewed -->
    <section v-if="recentlyViewed.length" class="space-y-3 pt-4">
      <h2 class="text-base font-semibold">Недавно просмотренные</h2>
      <div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <article
          v-for="rv in recentlyViewed.slice(0, 6)"
          :key="rv.id"
          class="rounded-lg border border-gray-200 bg-white p-3 text-sm flex flex-col"
        >
          <NuxtLink :to="`/product/${rv.id}`" prefetch class="space-y-2">
            <div class="aspect-square w-full overflow-hidden rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center">
              <img v-if="rv.imageUrl" :src="rv.imageUrl" :alt="rv.name" class="h-full w-full object-contain" loading="lazy" />
              <div v-else class="text-[11px] text-gray-400">Нет фото</div>
            </div>
            <p class="font-medium text-gray-900 line-clamp-2">{{ rv.name }}</p>
            <p class="text-xs text-gray-500">{{ rv.categoryName }}</p>
          </NuxtLink>
          <div class="mt-auto pt-2">
            <ProductPriceBlock
              :retail-price="rv.retailPrice"
              :wholesale-price="rv.wholesalePrice"
              :mode="priceMode"
              compact
            />
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
