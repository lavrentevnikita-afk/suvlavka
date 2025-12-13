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
    success.value = true
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось отправить заявку'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="max-w-xl space-y-3">
      <h1 class="text-xl font-semibold">Регистрация магазина</h1>
      <p class="text-sm text-slate-300">
        Заявка будет в статусе “на модерации”, пока менеджер не активирует доступ.
      </p>

      <div v-if="error" class="text-sm text-red-300">{{ error }}</div>
      <div v-if="success" class="text-sm text-green-300">
        Заявка отправлена. Ожидайте активации менеджером.
      </div>

      <form class="space-y-2" @submit.prevent="submit">
        <input v-model="form.name" class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="Контактное имя" />
        <input v-model="form.email" class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="Email" />
        <input v-model="form.password" type="password" class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="Пароль" />

        <div class="pt-2 border-t border-slate-800"></div>

        <input v-model="form.companyName" class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="Название организации" />
        <input v-model="form.inn" class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="ИНН (необязательно)" />
        <input v-model="form.kpp" class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="КПП (необязательно)" />
        <input v-model="form.ogrn" class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="ОГРН (необязательно)" />

        <button :disabled="loading" class="px-4 py-2 rounded bg-amber-400 text-slate-900 font-semibold disabled:opacity-50">
          {{ loading ? 'Отправка…' : 'Отправить заявку' }}
        </button>
      </form>
    </section>
  </NuxtLayout>
</template>
