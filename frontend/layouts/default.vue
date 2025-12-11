<script setup lang="ts">
const router = useRouter()
const searchTerm = ref('')

const cartStore = useCartStore()

const cartCount = computed(() => cartStore.totalItems)

onMounted(() => {
  cartStore.initFromStorage()
})

function onSearch() {
  const value = searchTerm.value.trim()
  if (!value) return
  router.push({ path: '/search', query: { q: value } })
  searchTerm.value = ''
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <!-- Logo & main nav -->
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="flex items-center gap-2">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
            >
              SS
            </span>
            <span class="text-sm font-semibold tracking-tight">
              Souvenir Shop
            </span>
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-3 text-xs font-medium text-gray-600">
            <NuxtLink
              to="/catalog"
              class="hover:text-slate-900 transition-colors"
              active-class="text-slate-900"
            >
              Каталог
            </NuxtLink>
            <NuxtLink
              to="/b2b"
              class="hover:text-slate-900 transition-colors"
              active-class="text-slate-900"
            >
              B2B
            </NuxtLink>
          </nav>
        </div>

        <!-- Search + cart -->
        <div class="flex-1 flex items-center justify-end gap-3">
          <form
            class="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 bg-gray-50"
            @submit.prevent="onSearch"
          >
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Поиск по товарам..."
              class="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              class="text-xs font-medium text-slate-900 hover:text-slate-700"
            >
              Найти
            </button>
          </form>

          <NuxtLink
            to="/cart"
            class="relative inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-gray-50"
          >
            <span class="mr-2">
              🛒
            </span>
            <span>Корзина</span>
            <span
              v-if="cartCount > 0"
              class="ml-2 inline-flex min-w-[1.5rem] justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold leading-4 text-white"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
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
