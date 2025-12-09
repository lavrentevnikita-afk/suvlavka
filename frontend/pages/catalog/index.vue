<script setup lang="ts">
const { data, pending, error } = await useAsyncData('categories', () =>
  $fetch('/api/catalog/categories', {
    baseURL: useRuntimeConfig().public.apiBaseUrl
  })
)
</script>

<template>
  <section class="space-y-3">
    <h1 class="text-xl font-semibold">Каталог</h1>
    <p class="text-sm text-gray-600">
      Список категорий (данные сейчас заглушечные с backend NestJS).
    </p>

    <div v-if="pending" class="text-sm text-gray-500">Загрузка категорий…</div>
    <div v-else-if="error" class="text-sm text-red-500">Ошибка загрузки категорий</div>

    <ul v-else class="space-y-2">
      <li
        v-for="category in data?.categories"
        :key="category.slug"
      >
        <NuxtLink
          :to="`/catalog/${category.slug}`"
          class="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-brand text-sm"
        >
          {{ category.name }}
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
