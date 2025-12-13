<script setup lang="ts">
import CityPicker from '~/components/CityPicker.vue'
import { useCityStore } from '~/stores/city'
const router = useRouter()
const searchTerm = ref('')

const cartStore = useCartStore()
const authStore = useAuthStore()
const cityStore = useCityStore()

const cartCount = computed(() => cartStore.totalItems)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.user)
const isB2BUser = computed(() => {
  const role = currentUser.value?.role
  return role === 'store' || role === 'manager'
})

onMounted(() => {
  cartStore.initFromStorage()
  authStore.initFromStorage()
  cityStore.init()
})

function onSearch() {
  const value = searchTerm.value.trim()
  if (!value) return
  router.push({ path: '/search', query: { q: value } })
}

function onLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div
        class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4"
      >
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

          <nav
            class="hidden md:flex items-center gap-3 text-xs font-medium text-gray-600"
          >
            <NuxtLink
              to="/catalog"
              class="hover:text-slate-900 transition-colors"
              active-class="text-slate-900"
            >
              Каталог
            </NuxtLink>
            <NuxtLink
              v-if="isB2BUser"
              to="/b2b"
              class="hover:text-slate-900 transition-colors"
              active-class="text-slate-900"
            >
              B2B
            </NuxtLink>
            <NuxtLink
              v-if="isAuthenticated"
              to="/account"
              class="hover:text-slate-900 transition-colors"
              active-class="text-slate-900"
            >
              Мои заказы
            </NuxtLink>
          </nav>
        </div>

        <!-- Search + auth + cart -->
        <div class="flex-1 flex items-center justify-end gap-3">
          <CityPicker />

          <form
            class="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 bg-gray-50"
            @submit.prevent="onSearch"
          >
            <input
              v-model="searchTerm"
              type="text"
              class="flex-1 bg-transparent text-xs outline-none"
              placeholder="Поиск по товарам..."
            />
            <button
              type="submit"
              class="text-[11px] font-medium text-slate-700 hover:text-slate-900"
            >
              Найти
            </button>
          </form>

          <!-- Auth -->
          <div class="flex items-center gap-2 text-xs">
            <template v-if="isAuthenticated && currentUser">
              <div class="hidden sm:flex flex-col items-end leading-tight">
                <span class="font-medium text-slate-900">
                  {{ currentUser.name }}
                </span>
                <span class="text-[11px] text-slate-500">
                  {{ currentUser.email }}
                </span>
              </div>
              <button
                type="button"
                class="text-[11px] font-medium text-slate-700 hover:text-slate-900"
                @click="router.push('/account')"
              >
                Кабинет
              </button>
              <button
                type="button"
                class="text-[11px] text-red-500 hover:text-red-600"
                @click="onLogout"
              >
                Выйти
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="text-[11px] font-medium text-slate-700 hover:text-slate-900"
              >
                Войти
              </NuxtLink>
              <span class="text-[11px] text-slate-400">/</span>
              <NuxtLink
                to="/register"
                class="text-[11px] font-medium text-slate-700 hover:text-slate-900"
              >
                Регистрация
              </NuxtLink>
            </template>
          </div>

          <!-- Cart -->
          <NuxtLink
            to="/cart"
            class="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            <span>Корзина</span>
            <span
              v-if="cartCount > 0"
              class="inline-flex min-w-[20px] justify-center rounded-full bg-white/10 px-1 text-[11px]"
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
      <div
        class="max-w-6xl mx-auto px-4 py-3 text-xs text-gray-500 flex justify-between"
      >
        <span>© {{ new Date().getFullYear() }} Souvenir Shop</span>
        <span>Стек: Nuxt 3 + NestJS</span>
      </div>
    </footer>
  </div>
</template>
