<script setup lang="ts">
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const form = reactive({
  name: '',
  email: '',
  password: '',
  companyName: '',
  inn: '',
  kpp: '',
  ogrn: '',
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

async function submit() {
  loading.value = true
  error.value = null
  success.value = false
  try {
    await $fetch('/api/b2b/register', {
      method: 'POST',
      baseURL: apiBaseUrl,
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        inn: form.inn || undefined,
        kpp: form.kpp || undefined,
        ogrn: form.ogrn || undefined,
      },
    })
    // Автологин после регистрации магазина
    await auth.login(form.email, form.password)
    success.value = true
    // Ведём сразу в настройки, чтобы добить профиль (лого, адрес и т.д.)
    await navigateTo('/b2b/settings')
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось отправить заявку'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div>
        <h1 class="text-2xl font-semibold">Регистрация магазина</h1>
        <p class="text-sm text-gray-600 mt-1">
          Заполните данные — заявка уйдёт менеджеру. До активации доступ будет в статусе “на модерации”.
        </p>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>
      <div v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Заявка отправлена. Ожидайте активации менеджером.
      </div>

      <form class="grid grid-cols-1 lg:grid-cols-2 gap-3" @submit.prevent="submit">
        <div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold">Контакт</div>
          <div class="text-xs text-gray-500 mt-1">Данные для связи и входа</div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div class="md:col-span-1">
              <label class="text-xs text-gray-500">Контактное имя</label>
              <input
                v-model="form.name"
                class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"
                placeholder="Например, Никита"
              />
            </div>
            <div class="md:col-span-1">
              <label class="text-xs text-gray-500">Email</label>
              <input
                v-model="form.email"
                class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"
                placeholder="email@company.ru"
              />
            </div>
            <div class="md:col-span-1">
              <label class="text-xs text-gray-500">Пароль</label>
              <input
                v-model="form.password"
                type="password"
                class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold">Реквизиты</div>
          <div class="text-xs text-gray-500 mt-1">Можно заполнить минимум, остальное — позже</div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div class="md:col-span-2">
              <label class="text-xs text-gray-500">Название организации</label>
              <input
                v-model="form.companyName"
                class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"
                placeholder='ООО "Ромашка"'
              />
            </div>
            <div>
              <label class="text-xs text-gray-500">ИНН (необязательно)</label>
              <input
                v-model="form.inn"
                class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"
                placeholder="1234567890"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500">КПП (необязательно)</label>
              <input
                v-model="form.kpp"
                class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"
                placeholder="123456789"
              />
            </div>
            <div class="md:col-span-2">
              <label class="text-xs text-gray-500">ОГРН (необязательно)</label>
              <input
                v-model="form.ogrn"
                class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"
                placeholder="1234567890123"
              />
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            :disabled="loading"
            class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-300 text-slate-900 font-semibold disabled:opacity-50"
          >
            {{ loading ? 'Отправка…' : 'Отправить заявку' }}
          </button>
          <NuxtLink to="/login" class="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm text-center">
            Уже есть аккаунт? Войти
          </NuxtLink>
        </div>
      </form>
    </section>
  </NuxtLayout>
</template>
