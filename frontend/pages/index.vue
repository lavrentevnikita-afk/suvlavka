<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight mb-2">
        Souvenir Shop
      </h1>
      <p class="text-sm text-gray-600 max-w-xl">
        Простой и быстрый интернет-магазин сувениров с поддержкой розничных покупателей и магазинов на одном сайте.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 class="font-semibold mb-1">Каталог</h2>
        <p class="text-sm text-gray-600">
          Просматривайте товары, фильтруйте и добавляйте их в корзину.
        </p>
        <NuxtLink to="/catalog" class="inline-flex mt-3 items-center px-3 py-1.5 rounded-full bg-brand text-white text-xs font-medium">
          Открыть каталог
        </NuxtLink>
      </article>

      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 class="font-semibold mb-1">Магазинам</h2>
        <p class="text-sm text-gray-600">
          Зарегистрируйте магазин, чтобы получать оптовые цены и доступ в B2B‑кабинет.
        </p>
        <NuxtLink to="/b2b/register" class="inline-flex mt-3 items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium">
          Регистрация магазина
        </NuxtLink>
      </article>
    </div>

    <p class="text-xs text-gray-500">
      API: <strong>{{ config.public.apiBaseUrl }}</strong>
    </p>
  </section>
</template>
