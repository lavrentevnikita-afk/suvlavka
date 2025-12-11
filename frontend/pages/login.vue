<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const config = useRuntimeConfig()
const router = useRouter()

const onSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch('/auth/login', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
      credentials: 'include',
    })

    await router.push('/account/orders')
  } catch (err: any) {
    console.error(err)
    errorMessage.value =
      err?.data?.message || 'Неверный email или пароль.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-md mx-auto mt-8 bg-white rounded-lg shadow-sm p-6">
    <h1 class="text-xl font-semibold mb-4">Вход для покупателей</h1>

    <p class="text-sm text-slate-500 mb-4">
      Войдите в личный кабинет, чтобы просматривать заказы и быстрее
      оформлять покупки.
    </p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-700">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-700">Пароль</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <p v-if="errorMessage" class="text-xs text-red-600">
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

    <p class="text-xs text-slate-500 mt-4">
      Нет аккаунта?
      <NuxtLink to="/register" class="text-slate-900 font-medium">
        Зарегистрироваться
      </NuxtLink>
    </p>
  </section>
</template>
