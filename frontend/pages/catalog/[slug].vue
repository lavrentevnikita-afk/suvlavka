<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

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

  if (priceMin.value) {
    query.minPrice = priceMin.value
  }
  if (priceMax.value) {
    query.maxPrice = priceMax.value
  }
  if (inStock.value) {
    query.inStock = 'true'
  }

  return query
}

const { data, pending, error } = await useAsyncData(
  () => ['category-products', slug.value, { ...route.query }],
  () =>
    $fetch('/api/catalog/products', {
      baseURL: config.public.apiBaseUrl,
      query: buildQuery()
    }),
  {
    watch: [slug, () => route.query]
  }
)

const hasProducts = computed(() => (data.value?.products?.length ?? 0) > 0)

function applyFilters() {
  router.push({
    path: `/catalog/${slug.value}`,
    query: buildQuery()
  })
}
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

    <!-- Фильтры -->
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
        <input
          v-model="inStock"
          type="checkbox"
          class="h-3 w-3 rounded border-gray-300 text-slate-900"
        />
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

      <button
        type="submit"
        class="ml-auto inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
      >
        Применить
      </button>
    </form>

    <!-- Список товаров -->
    <div v-if="pending" class="text-sm text-gray-500">
      Загружаем товары...
    </div>

    <div v-else-if="error" class="text-sm text-red-500">
      Ошибка при загрузке товаров.
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
          {{ Number(product.price) }} ₽
        </p>
      </article>
    </div>
  </section>
</template>
