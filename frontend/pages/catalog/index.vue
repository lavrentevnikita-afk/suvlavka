<script setup lang="ts">
const config = useRuntimeConfig()

const apiBaseUrl = process.server
  ? config.apiBaseUrl
  : config.public.apiBaseUrl

const { data, pending, error } = await useAsyncData('categories', () =>
  $fetch('/api/catalog/categories', {
    baseURL: apiBaseUrl
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
      Загружаем категории...
    </div>

    <div v-else-if="error" class="text-sm text-red-500">
      Не удалось загрузить категории.
    </div>

    <ul
      v-else
      class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <li
        v-for="category in data?.categories"
        :key="category.slug"
      >
        <NuxtLink
          :to="`/catalog/${category.slug}`"
          class="group flex h-full flex-col rounded-lg border border-gray-200 bg-white p-3 text-sm transition hover:border-slate-300"
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
          <p
            v-else
            class="mt-1 text-xs text-gray-400"
          >
            Описание категории скоро появится.
          </p>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
