<script setup lang="ts">
const { data, pending, error } = await useAsyncData('categories', () =>
  $fetch('/api/catalog/categories', {
    baseURL: useRuntimeConfig().public.apiBaseUrl
  })
)
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">Каталог</h1>
      <p class="text-sm text-gray-600">
        Выберите категорию, чтобы посмотреть доступные товары.
      </p>
    </header>

    <div v-if="pending" class="text-sm text-gray-500">
      Загрузка категорий…
    </div>

    <div v-else-if="error" class="text-sm text-red-600">
      Ошибка при загрузке категорий
    </div>

    <ul
      v-else
      class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <li
        v-for="category in data?.categories"
        :key="category.slug"
        class="group"
      >
        <NuxtLink
          :to="`/catalog/${category.slug}`"
          class="block h-full rounded-lg border border-gray-200 bg-white p-3 text-sm transition hover:border-brand hover:shadow-sm"
        >
          <h2 class="font-medium text-gray-900 group-hover:text-brand">
            {{ category.name }}
          </h2>
          <p
            v-if="category.description"
            class="mt-1 text-xs text-gray-500 line-clamp-2"
          >
            {{ category.description }}
          </p>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
