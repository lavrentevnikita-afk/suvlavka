<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)

const { data, pending, error } = await useAsyncData(
  () => `product-${id.value}`,
  () =>
    $fetch(`/api/catalog/products/${id.value}`, {
      baseURL: useRuntimeConfig().public.apiBaseUrl
    }),
  { watch: [id] }
)

const activeImageIndex = ref(0)

const images = computed(() => data.value?.product?.images ?? [])
const activeImage = computed(() => images.value[activeImageIndex.value] || null)

watch(
  () => images.value.length,
  (len) => {
    if (len === 0) activeImageIndex.value = 0
    if (activeImageIndex.value >= len) activeImageIndex.value = 0
  }
)
</script>

<template>
  <section v-if="pending" class="text-sm text-gray-500">
    Загрузка товара…
  </section>

  <section v-else-if="error" class="text-sm text-red-600">
    Ошибка при загрузке товара
  </section>

  <section v-else-if="data?.product" class="space-y-6">
    <div class="grid gap-6 md:grid-cols-2 items-start">
      <!-- Галерея -->
      <div class="space-y-3">
        <div class="aspect-[4/3] rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
          <img
            v-if="activeImage"
            :src="activeImage.url"
            alt=""
            class="w-full h-full object-cover"
          />
          <div v-else class="text-xs text-gray-500">
            Изображение товара появится здесь
          </div>
        </div>

        <div v-if="images.length" class="flex gap-2 overflow-x-auto">
          <button
            v-for="(image, index) in images"
            :key="image.id ?? index"
            type="button"
            class="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border"
            :class="index === activeImageIndex ? 'border-brand' : 'border-gray-200'"
            @click="activeImageIndex = index"
          >
            <img
              :src="image.url"
              alt=""
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      <!-- Информация о товаре -->
      <div class="space-y-4">
        <header class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-gray-400">
            {{ data.product.category?.name }}
          </p>
          <h1 class="text-2xl font-semibold">
            {{ data.product.name }}
          </h1>
          <p class="text-xs text-gray-500">
            Артикул: {{ data.product.article }}
          </p>
        </header>

        <p class="text-2xl font-semibold">
          {{ data.product.price }} ₽
        </p>

        <p class="text-sm">
          <span
            v-if="data.product.isAvailable"
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700"
          >
            В наличии
          </span>
          <span
            v-else
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600"
          >
            Нет в наличии
          </span>
        </p>

        <p v-if="data.product.description" class="text-sm text-gray-700">
          {{ data.product.description }}
        </p>

        <NuxtLink
          to="/cart"
          class="inline-flex items-center px-4 py-2 rounded-full bg-brand text-white text-sm"
        >
          Добавить в корзину (заглушка)
        </NuxtLink>
      </div>
    </div>

    <!-- Характеристики -->
    <section v-if="data.product.specs" class="space-y-2">
      <h2 class="text-base font-semibold">Характеристики</h2>
      <dl class="divide-y divide-gray-200 rounded-lg border bg-white">
        <div
          v-for="(value, key) in data.product.specs"
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

  <section v-else class="text-sm text-gray-500">
    Товар не найден
  </section>
</template>
