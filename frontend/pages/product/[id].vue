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
</script>

<template>
  <section v-if="pending" class="text-sm text-gray-500">
    Загрузка товара…
  </section>

  <section v-else-if="error" class="text-sm text-red-500">
    Ошибка загрузки товара
  </section>

  <section v-else-if="data?.product" class="space-y-3">
    <h1 class="text-xl font-semibold">{{ data.product.name }}</h1>
    <p class="text-sm text-gray-600">{{ data.product.description }}</p>
    <p class="text-lg font-semibold">{{ data.product.price }} ₽</p>

    <NuxtLink
      to="/cart"
      class="inline-flex items-center px-4 py-2 rounded-full bg-brand text-white text-sm"
    >
      Добавить в корзину (заглушка)
    </NuxtLink>
  </section>

  <section v-else class="text-sm text-gray-500">
    Товар не найден
  </section>
</template>
