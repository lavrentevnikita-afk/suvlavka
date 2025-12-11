<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug as string)

const priceMin = ref<string | null>((route.query.minPrice as string) || null)
const priceMax = ref<string | null>((route.query.maxPrice as string) || null)
const inStock = ref((route.query.inStock as string) === 'true')
const sort = ref((route.query.sort as string) || 'popularity')

const buildQuery = () => {
  const query: Record<string, string> = {
    category: slug.value,
    sort: sort.value
  }

  if (priceMin.value) query.minPrice = priceMin.value
  if (priceMax.value) query.maxPrice = priceMax.value
  if (inStock.value) query.inStock = 'true'

  return query
}

const { data, pending, error } = await useAsyncData(
  'category-products', // ключ ДОЛЖЕН быть строкой
  () =>
    $fetch('/api/catalog/products', {
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      query: buildQuery()
    }),
  {
    watch: [slug, () => route.query]
  }
)

function applyFilters() {
  router.push({
    path: `/catalog/${slug.value}`,
    query: {
      ...buildQuery()
    }
  })
}

const hasProducts = computed(() => (data.value?.products?.length ?? 0) > 0)
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">
        Категория: {{ slug }}
      </h1>
      <p class="text-sm text-gray-600">
        Фильтруйте товары по цене, наличию и сортируйте результаты.
      </p>
    </header>

    <div class="rounded-lg border border-gray-200 bg-white p-3 text-sm flex flex-wrap gap-3 items-end">
      <div class="flex flex-col">
        <label for="price-min" class="text-xs text-gray-500 mb-1">Цена от</label>
        <input
          id="price-min"
          v-model="priceMin"
          type="number"
          min="0"
          class="rounded-md border-gray-300 text-sm px-2 py-1 w-28"
          placeholder="0"
        />
      </div>

      <div class="flex flex-col">
        <label for="price-max" class="text-xs text-gray-500 mb-1">Цена до</label>
        <input
          id="price-max"
          v-model="priceMax"
          type="number"
          min="0"
          class="rounded-md border-gray-300 text-sm px-2 py-1 w-28"
          placeholder="∞"
        />
      </div>

      <label class="inline-flex items-center gap-2 text-xs text-gray-700">
        <input
          v-model="inStock"
          type="checkbox"
          class="rounded border-gray-300"
        />
        Только в наличии
      </label>

      <div class="flex flex-col">
        <label for="sort" class="text-xs text-gray-500 mb-1">Сортировка</label>
        <select
          id="sort"
          v-model="sort"
          class="rounded-md border-gray-300 text-sm px-2 py-1"
        >
          <option value="popularity">По популярности</option>
          <option value="price">По цене</option>
          <option value="new">По новизне</option>
        </select>
      </div>

      <button
        type="button"
        class="ml-auto inline-flex items-center px-3 py-1.5 rounded-full bg-brand text-white text-xs font-medium"
        @click="applyFilters"
      >
        Применить
      </button>
    </div>

    <div v-if="pending" class="text-sm text-gray-500">
      Загрузка товаров…
    </div>

    <div v-else-if="error" class="text-sm text-red-600">
      Ошибка при загрузке товаров
    </div>

    <div v-else-if="!hasProducts" class="text-sm text-gray-500">
      В этой категории пока нет товаров с такими условиями фильтра.
    </div>

    <div v-else class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <article
        v-for="product in data?.products"
        :key="product.id"
        class="rounded-lg border border-gray-200 bg-white p-3 text-sm flex flex-col"
      >
        <NuxtLink
          :to="`/product/${product.id}`"
          class="font-medium text-gray-900 hover:text-brand line-clamp-2"
        >
          {{ product.name }}
        </NuxtLink>

        <p class="mt-1 text-xs text-gray-500">
          {{ product.category?.name }}
        </p>

        <p class="mt-auto pt-2 font-semibold">
          {{ product.price }} ₽
        </p>
      </article>
    </div>
  </section>
</template>
