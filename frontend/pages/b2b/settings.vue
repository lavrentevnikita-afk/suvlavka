<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const profile = ref<any>(null)

const form = reactive({
  companyName: '',
  displayName: '',
  logoUrl: '' as string,
  address: '',
  city: '',
  phone: '',
  website: '',
  inn: '',
  kpp: '',
  ogrn: '',
})

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/b2b/me', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    profile.value = res?.storeProfile ?? null

    form.companyName = profile.value?.companyName ?? ''
    form.displayName = profile.value?.displayName ?? ''
    form.logoUrl = profile.value?.logoUrl ?? ''
    form.address = profile.value?.address ?? ''
    form.city = profile.value?.city ?? ''
    form.phone = profile.value?.phone ?? ''
    form.website = profile.value?.website ?? ''
    form.inn = profile.value?.inn ?? ''
    form.kpp = profile.value?.kpp ?? ''
    form.ogrn = profile.value?.ogrn ?? ''
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить профиль магазина'
  } finally {
    loading.value = false
  }
}

async function onLogoFileChange(evt: Event) {
  const input = evt.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Читаем как data-url, чтобы работать без отдельного хранилища
  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    form.logoUrl = result
  }
  reader.readAsDataURL(file)
}

async function save() {
  if (!auth.accessToken) return
  saving.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/b2b/profile', {
      method: 'PUT',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: {
        companyName: form.companyName,
        displayName: form.displayName || null,
        logoUrl: form.logoUrl || null,
        address: form.address || null,
        city: form.city || null,
        phone: form.phone || null,
        website: form.website || null,
        inn: form.inn || null,
        kpp: form.kpp || null,
        ogrn: form.ogrn || null,
      },
    })
    profile.value = res?.storeProfile ?? profile.value
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить настройки'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div>
        <h1 class="text-2xl font-semibold">Настройки магазина</h1>
        <p class="text-sm text-gray-600 mt-1">
          Заполните витринные данные (название, лого, адрес) — так менеджеру и вашим клиентам будет проще.
        </p>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 space-y-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="text-sm font-semibold">Основное</div>
            <div class="text-xs text-gray-500 mt-1">То, что будет видно в B2B кабинете</div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="md:col-span-2">
                <label class="text-xs text-gray-500">Юр. название (как в реквизитах)</label>
                <input v-model="form.companyName" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" />
              </div>
              <div class="md:col-span-2">
                <label class="text-xs text-gray-500">Публичное название (как будет отображаться)</label>
                <input v-model="form.displayName" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="Напр., Магазин Сувениров на Невском" />
              </div>
              <div>
                <label class="text-xs text-gray-500">Город</label>
                <input v-model="form.city" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" />
              </div>
              <div>
                <label class="text-xs text-gray-500">Телефон</label>
                <input v-model="form.phone" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="+7…" />
              </div>
              <div class="md:col-span-2">
                <label class="text-xs text-gray-500">Адрес</label>
                <input v-model="form.address" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="Улица, дом, офис" />
              </div>
              <div class="md:col-span-2">
                <label class="text-xs text-gray-500">Сайт (необязательно)</label>
                <input v-model="form.website" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="https://…" />
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="text-sm font-semibold">Реквизиты</div>
            <div class="text-xs text-gray-500 mt-1">Можно оставить пустым и заполнить позже</div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="text-xs text-gray-500">ИНН</label>
                <input v-model="form.inn" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" />
              </div>
              <div>
                <label class="text-xs text-gray-500">КПП</label>
                <input v-model="form.kpp" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" />
              </div>
              <div>
                <label class="text-xs text-gray-500">ОГРН</label>
                <input v-model="form.ogrn" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" />
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              :disabled="saving"
              class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold disabled:opacity-50"
              @click="save"
            >
              {{ saving ? 'Сохранение…' : 'Сохранить' }}
            </button>
            <NuxtLink to="/b2b" class="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">
              Назад в B2B
            </NuxtLink>
          </div>
        </div>

        <aside class="space-y-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="text-sm font-semibold">Логотип</div>
            <div class="text-xs text-gray-500 mt-1">Можно загрузить картинку (сохранится как data-url)</div>

            <div class="mt-3 flex items-center gap-3">
              <div class="w-16 h-16 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                <img v-if="form.logoUrl" :src="form.logoUrl" alt="logo" class="w-full h-full object-contain" />
                <span v-else class="text-[11px] text-gray-400">Нет</span>
              </div>
              <div class="flex-1">
                <input type="file" accept="image/*" class="text-xs" @change="onLogoFileChange" />
                <button
                  v-if="form.logoUrl"
                  class="mt-2 text-xs text-gray-600 hover:text-gray-900"
                  @click="form.logoUrl = ''"
                >
                  Убрать логотип
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="text-xs text-gray-500">Статус</div>
            <div class="mt-1 flex items-center gap-2">
              <span
                class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                :class="profile?.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : profile?.status === 'pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'"
              >
                {{ profile?.status || '—' }}
              </span>
              <span class="text-xs text-gray-500">(активация менеджером)</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </NuxtLayout>
</template>
