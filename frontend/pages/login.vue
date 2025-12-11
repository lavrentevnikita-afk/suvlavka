<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

onMounted(() => {
  authStore.initFromStorage()
  if (authStore.isAuthenticated) {
    router.replace('/account')
  }
})

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string | undefined) || '/account'
    router.replace(redirect)
  } catch (err: any) {
    const message =
      err?.data?.message || err?.message || 'Не удалось войти. Попробуйте ещё раз.'
    errorMessage.value = message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NuxtLayout>
    <section class="max-w-md mx-auto space-y-4">
      <h1 class="text-xl font-semibold">Вход для покупателей</h1>
      <p class="text-sm text-slate-500">
        Войдите в личный кабинет, чтобы просматривать заказы и быстрее оформлять покупки.
      </p>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <label class="block text-xs font-medium text-slate-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-medium text-slate-700">Пароль</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <p v-if="errorMessage" class="text-xs text-red-500">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Входим...' : 'Войти' }}
        </button>
      </form>

      <p class="text-xs text-slate-500">
        Нет аккаунта?
        <NuxtLink to="/register" class="text-slate-900 font-medium">
          Зарегистрироваться
        </NuxtLink>
      </p>
    </section>
  </NuxtLayout>
</template>
