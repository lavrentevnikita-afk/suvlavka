<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const status = ref<string>('pending')
const loading = ref(false)
const error = ref<string | null>(null)
const stores = ref<any[]>([])

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/b2b/admin/stores', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: status.value ? { status: status.value } : undefined,
    })
    stores.value = Array.isArray(res?.stores) ? res.stores : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить заявки'
  } finally {
    loading.value = false
  }
}

async function activate(userId: number) {
  if (!auth.accessToken) return
  try {
    await $fetch(`/api/b2b/activate/${userId}`, {
      method: 'POST',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось активировать'
  }
}

watch(status, load)
onMounted(load)
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Заявки магазинов</h1>
          <p class="text-sm text-gray-600 mt-1">Модерация регистраций B2B</p>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-600">Статус</label>
          <select v-model="status" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option value="pending">pending</option>
            <option value="active">active</option>
            <option value="rejected">rejected</option>
            <option value="">все</option>
          </select>
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">
            Обновить
          </button>
        </div>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

      <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th class="text-left px-4 py-3">Магазин</th>
                <th class="text-left px-4 py-3">Контакт</th>
                <th class="text-left px-4 py-3">Статус</th>
                <th class="text-right px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in stores" :key="s.id" class="border-t border-gray-100">
                <td class="px-4 py-3">
                  <div class="font-medium">{{ s.displayName || s.companyName }}</div>
                  <div class="text-xs text-gray-500">{{ s.city }} {{ s.address }}</div>
                </td>
                <td class="px-4 py-3">
                  <div>{{ s.user?.name }}</div>
                  <div class="text-xs text-gray-500">{{ s.user?.email }}</div>
                  <div class="text-xs text-gray-500" v-if="s.phone">{{ s.phone }}</div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                    :class="s.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : s.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'"
                  >
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    v-if="s.status !== 'active'"
                    class="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:opacity-90"
                    @click="activate(s.user?.id)"
                  >
                    Активировать
                  </button>
                  <span v-else class="text-xs text-gray-500">Активен</span>
                </td>
              </tr>
              <tr v-if="stores.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-500">Пусто</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
