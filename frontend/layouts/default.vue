<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="font-bold text-lg text-brand">Souvenir Shop</NuxtLink>

        <nav class="hidden md:flex gap-4 text-sm">
          <NuxtLink to="/catalog" class="hover:text-brand">Каталог</NuxtLink>
          <NuxtLink to="/b2b" class="opacity-80 hover:text-brand">Для магазинов</NuxtLink>
        </nav>

        <div class="flex items-center gap-3 text-sm">
          <NuxtLink to="/cart" class="hover:text-brand">Корзина</NuxtLink>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4 py-3 text-xs text-gray-500 flex justify-between">
        <span>© {{ new Date().getFullYear() }} Souvenir Shop</span>
        <span>Стек: Nuxt 3 + NestJS</span>
      </div>
    </footer>
  </div>
</template>
