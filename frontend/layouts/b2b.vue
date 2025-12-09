<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="font-semibold text-sm text-amber-300">Souvenir B2B</NuxtLink>
        <nav class="flex gap-4 text-xs md:text-sm">
          <NuxtLink to="/b2b" class="hover:text-amber-300">Главная</NuxtLink>
          <NuxtLink to="/b2b/quick-order" class="hover:text-amber-300">Быстрый заказ</NuxtLink>
          <NuxtLink to="/b2b/orders" class="hover:text-amber-300">Заказы</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
      <slot />
    </main>
  </div>
</template>
