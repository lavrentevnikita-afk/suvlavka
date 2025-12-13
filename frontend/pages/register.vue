<script setup lang="ts">
const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const authStore = useAuthStore()

const onSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // регистрация + сразу авторизация через Pinia-store
    await authStore.register(name.value, email.value, password.value)

    // сразу ведём в личный кабинет
    await router.push('/account')
  } catch (err: any) {
    console.error(err)
    errorMessage.value =
      err?.data?.message ||
      'Не удалось зарегистрироваться. Проверьте данные и попробуйте ещё раз.'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <section class="max-w-md mx-auto mt-8 bg-white rounded-lg shadow-sm p-6">
    <h1 class="text-xl font-semibold mb-4">Регистрация покупателя</h1>

    <p class="text-sm text-slate-500 mb-4">
      Создайте аккаунт, чтобы отслеживать заказы и быстрее оформлять покупки.
    </p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-700">Имя</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

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
          minlength="6"
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
        {{ loading ? 'Регистрируем...' : 'Зарегистрироваться' }}
      </button>
    </form>

    <p class="text-xs text-slate-500 mt-4">
      Уже есть аккаунт?
      <NuxtLink to="/login" class="text-slate-900 font-medium">
        Войти
      </NuxtLink>
    </p>
  </section>
</template>
