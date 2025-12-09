<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data, pending, error } = await useAsyncData(
  () => `category-${slug.value}`,
  () =>
    $fetch('/api/catalog/products', {
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      query: { category: slug.value }
    }),
  { watch: [slug] }
)
</script>

<template>
  <section class="space-y-3">
    <h1 class="text-xl font-semibold">Категория: {{ slug }}</h1>
    <p class="text-sm text-gray-600">Список товаров — пока заглушка с backend.</p>

    <div v-if="pending" class="text-sm text-gray-500">Загрузка товаров…</div>
    <div v-else-if="error" class="text-sm text-red-500">Ошибка загрузки товаров</div>

    <div v-else class="grid gap-3 grid-cols-2 md:grid-cols-4">
      <article
        v-for="product in data?.products"
        :key="product.id"
        class="rounded-lg border border-gray-200 bg-white p-3 text-sm"
      >
        <NuxtLink :to="`/product/${product.id}`" class="font-medium text-gray-900 hover:text-brand">
          {{ product.name }}
        </NuxtLink>
        <p class="mt-1 font-semibold">{{ product.price }} ₽</p>
      </article>
    </div>
  </section>
</template>
