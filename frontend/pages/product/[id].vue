<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const apiBaseUrl = process.server
  ? config.apiBaseUrl
  : config.public.apiBaseUrl

const cartStore = useCartStore()

const id = computed(() => Number(route.params.id))

const { data, pending, error } = await useAsyncData(
  'product',
  () =>
    $fetch(`/api/catalog/products/${id.value}`, {
      baseURL: apiBaseUrl
    }),
  { watch: [id] }
)

const activeImageIndex = ref(0)

const product = computed(() => data.value?.product ?? null)

const images = computed(() => product.value?.images ?? [])

const mainImage = computed(() => {
  if (!images.value.length) return null
  return images.value[activeImageIndex.value]?.url ?? images.value[0]?.url ?? null
})

const isAvailable = computed(() => !!product.value?.isAvailable)

const addingToCart = ref(false)
const addError = ref<string | null>(null)

function selectImage(index: number) {
  if (index < 0 || index >= images.value.length) return
  activeImageIndex.value = index
}

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
        imageUrl: images.value[0]?.url ?? null
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
      <div class="space-y-4">
        <div
          class="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-white flex items-center justify-center"
        >
          <img
            v-if="mainImage"
            :src="mainImage"
            :alt="product.name"
            class="h-full w-full object-contain"
          />
          <div v-else class="text-xs text-gray-400">
            Нет изображения
          </div>
        </div>

        <div
          v-if="images.length > 1"
          class="flex gap-2 overflow-x-auto pb-1"
        >
          <button
            v-for="(image, index) in images"
            :key="image.id || index"
            type="button"
            class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border"
            :class="
              index === activeImageIndex
                ? 'border-slate-900'
                : 'border-gray-200 hover:border-gray-300'
            "
            @click="selectImage(index)"
          >
            <img
              :src="image.url"
              :alt="product.name"
              class="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>

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

        <div class="flex items-center gap-4">
          <p class="text-2xl font-semibold">
            {{ Number(product.price) }} ₽
          </p>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
            :class="
              isAvailable
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-500'
            "
          >
            <span class="mr-1">
              {{ isAvailable ? '●' : '○' }}
            </span>
            {{ isAvailable ? 'В наличии' : 'Нет в наличии' }}
          </span>
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
  </section>
</template>
