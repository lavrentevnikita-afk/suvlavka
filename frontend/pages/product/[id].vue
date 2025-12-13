<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const apiBaseUrl = process.server
  ? config.apiBaseUrl
  : config.public.apiBaseUrl

const cartStore = useCartStore()
const { add: addRecentlyViewed } = useRecentlyViewed()

const id = computed(() => Number(route.params.id))

const { data, pending, error } = await useAsyncData(
  'product',
  () =>
    $fetch(`/api/catalog/products/${id.value}`, {
      baseURL: apiBaseUrl
    }),
  { watch: [id] }
)

const product = computed(() => data.value?.product ?? null)

// Pricing mode: in B2B area show wholesale first
const priceMode = computed(() => (route.path.startsWith('/b2b') ? 'b2b' : 'retail'))

const retailPrice = computed(() => product.value?.retailPrice ?? product.value?.price)
const wholesalePrice = computed(() => product.value?.wholesalePrice ?? null)

const images = computed(() => product.value?.images ?? [])

const isAvailable = computed(() => !!product.value?.isAvailable)

const availabilityHint = computed(() => {
  const specs = (product.value as any)?.specs
  return (specs?.['Наличие'] ?? specs?.availability ?? null) as string | null
})

watch(
  product,
  (p) => {
    if (!process.client || !p) return
    addRecentlyViewed({
      id: p.id,
      name: p.name,
      retailPrice: String(p.retailPrice ?? p.price),
      wholesalePrice: p.wholesalePrice ?? null,
      imageUrl: images.value[0]?.url ?? null,
      categoryName: p.category?.name ?? null,
    })
  },
  { immediate: true }
)

// Similar products by category
const similar = ref<any[]>([])
const similarPending = ref(false)

watch(
  () => product.value?.category?.slug,
  async (catSlug) => {
    if (!catSlug || !product.value) {
      similar.value = []
      return
    }
    similarPending.value = true
    try {
      const res = await $fetch<any>('/api/catalog/products', {
        baseURL: apiBaseUrl,
        query: {
          category: catSlug,
          sort: 'popularity',
          limit: '8',
          page: '1',
        },
      })
      const items = Array.isArray(res?.products) ? res.products : []
      similar.value = items.filter((x: any) => x?.id !== product.value?.id).slice(0, 6)
    } catch {
      similar.value = []
    } finally {
      similarPending.value = false
    }
  },
  { immediate: true }
)

const addingToCart = ref(false)
const addError = ref<string | null>(null)

function addToCart() {
  if (!product.value || !isAvailable.value) return
  addError.value = null
  addingToCart.value = true
  try {
    cartStore.addItem(
      {
        id: product.value.id,
        name: product.value.name,
        price: Number(product.value.price),
        article: product.value.article,
        imageUrl: images.value[0]?.url ?? null,
        categorySlug: product.value?.category?.slug ?? null,
        categoryName: product.value?.category?.name ?? null,
      },
      1
    )
  } catch (e) {
    addError.value = 'Не удалось добавить товар в корзину'
  } finally {
    addingToCart.value = false
  }
}
</script>

<template>
  <section v-if="pending" class="text-sm text-gray-500">
    Загрузка товара...
  </section>

  <section v-else-if="error || !product" class="text-sm text-gray-500">
    Товар не найден
  </section>

  <section v-else class="space-y-6">
    <div class="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
      <!-- Галерея изображений -->
      <ProductGallery :images="images" :alt="product.name" />

      <!-- Основная информация -->
      <div class="space-y-4">
        <header class="space-y-1">
          <h1 class="text-xl font-semibold leading-snug">
            {{ product.name }}
          </h1>
          <p class="text-xs text-gray-500">
            Артикул: {{ product.article }}
          </p>
          <p class="text-xs text-gray-500" v-if="product.category">
            Категория: {{ product.category.name }}
          </p>
        </header>

        <div class="flex flex-wrap items-center gap-3">
          <ProductPriceBlock
            :retail-price="retailPrice"
            :wholesale-price="wholesalePrice"
            :mode="priceMode"
          />
          <ProductAvailabilityBadge :is-available="isAvailable" :hint="availabilityHint" />
        </div>

        <div class="space-y-3 text-sm">
          <p class="text-gray-700 whitespace-pre-line" v-if="product.description">
            {{ product.description }}
          </p>
          <p v-else class="text-gray-500">
            Описание для этого товара пока не заполнено.
          </p>
        </div>

        <div class="space-y-2">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="!isAvailable || addingToCart"
            @click="addToCart"
          >
            <span v-if="addingToCart">Добавляем...</span>
            <span v-else>Добавить в корзину</span>
          </button>
          <p v-if="addError" class="text-xs text-red-500 mt-1">
            {{ addError }}
          </p>
        </div>
      </div>
    </div>

    <!-- Характеристики -->
    <section v-if="product.specs" class="space-y-2">
      <h2 class="text-base font-semibold">Характеристики</h2>
      <dl class="divide-y divide-gray-200 rounded-lg border bg-white">
        <div
          v-for="(value, key) in product.specs"
          :key="key"
          class="grid grid-cols-2 gap-3 px-3 py-2 text-sm"
        >
          <dt class="text-gray-500">
            {{ key }}
          </dt>
          <dd class="font-medium text-gray-900 text-right">
            {{ value }}
          </dd>
        </div>
      </dl>
    </section>

    <!-- Recommendations -->
    <section class="space-y-3" v-if="similarPending || similar.length">
      <h2 class="text-base font-semibold">Похожие товары</h2>

      <div v-if="similarPending" class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <ProductCardSkeleton v-for="n in 6" :key="n" />
      </div>

      <div v-else class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <ProductCard v-for="p in similar" :key="p.id" :product="p" :mode="priceMode" :prefetch="true" />
      </div>
    </section>

    <!-- Reviews -->
    <ProductReviewsBasic :product-id="product.id" :product-name="product.name" />
  </section>
</template>
