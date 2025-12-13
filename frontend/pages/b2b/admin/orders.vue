<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const error = ref<string | null>(null)
const orders = ref<any[]>([])

// UI режимы: не ломаем старую таблицу — канбан включается отдельным режимом
const view = ref<'table' | 'kanban'>('table')

// фильтры
const q = ref('')
const status = ref<'all' | 'new' | 'confirmed' | 'in_work' | 'shipped' | 'closed'>('all')

// комментарии
const openedComments = ref<Record<number, boolean>>({})
const comments = ref<Record<number, any[]>>({})
const commentDraft = ref<Record<number, string>>({})

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    // Сначала пробуем новый менеджерский API (операционка). Если его нет — откатимся на старый.
    try {
      const res = await $fetch<any>('/api/ops/orders', {
        baseURL: apiBaseUrl,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        query: {
          q: q.value || undefined,
          status: status.value === 'all' ? undefined : status.value,
        },
      })
      orders.value = Array.isArray(res?.orders) ? res.orders : []
    } catch (e2: any) {
      const res = await $fetch<any>('/api/orders/admin/all', {
        baseURL: apiBaseUrl,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      orders.value = Array.isArray(res?.orders) ? res.orders : []
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить заказы'
  } finally {
    loading.value = false
  }
}

const statusTitles: Record<string, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  in_work: 'В работе',
  shipped: 'Отгружен',
  closed: 'Закрыт',
}

const nextStatus: Record<string, string | null> = {
  new: 'confirmed',
  confirmed: 'in_work',
  in_work: 'shipped',
  shipped: 'closed',
  closed: null,
}

// компактные иконки для канбана
const nextIcon: Record<string, string> = {
  new: '✅',
  confirmed: '🛠️',
  in_work: '🚚',
  shipped: '🏁',
}

async function setOrderStatus(id: number, s: string) {
  if (!auth.accessToken) return
  await $fetch<any>(`/api/ops/orders/${id}/status`, {
    baseURL: apiBaseUrl,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { status: s, warehouse: 'MSK' },
  })
  await load()
}

function toggleComments(id: number) {
  openedComments.value[id] = !openedComments.value[id]
  if (openedComments.value[id] && !comments.value[id]) {
    loadComments(id)
  }
}

async function loadComments(id: number) {
  if (!auth.accessToken) return
  const res = await $fetch<any>(`/api/ops/orders/${id}/comments`, {
    baseURL: apiBaseUrl,
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })
  comments.value[id] = Array.isArray(res?.comments) ? res.comments : []
}

async function addComment(id: number) {
  if (!auth.accessToken) return
  const text = String(commentDraft.value[id] || '').trim()
  if (!text) return
  const res = await $fetch<any>(`/api/ops/orders/${id}/comments`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { text },
  })
  comments.value[id] = Array.isArray(res?.comments) ? res.comments : []
  commentDraft.value[id] = ''
}

const grouped = computed(() => {
  const cols: Record<string, any[]> = { new: [], confirmed: [], in_work: [], shipped: [], closed: [] }
  for (const o of orders.value) {
    const st = String(o.status || 'new')
    if (cols[st]) cols[st].push(o)
    else cols.new.push(o)
  }
  return cols
})

watch([q, status], () => load())

onMounted(load)
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Все заказы</h1>
          <p class="text-sm text-gray-600 mt-1">Менеджерский список заказов (розница + B2B)</p>
        </div>
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">
          Обновить
        </button>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

      <div v-else class="space-y-4">
        <!-- controls -->
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              v-model="q"
              placeholder="Поиск: id / email / имя / адрес"
              class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm w-full sm:w-[320px]"
            />
            <select v-model="status" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
              <option value="all">Все статусы</option>
              <option value="new">Новые</option>
              <option value="confirmed">Подтверждённые</option>
              <option value="in_work">В работе</option>
              <option value="shipped">Отгруженные</option>
              <option value="closed">Закрытые</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-3 py-2 rounded-xl border text-sm"
              :class="view === 'table' ? 'border-gray-300 bg-gray-100' : 'border-gray-200 hover:bg-gray-100'"
              @click="view = 'table'"
            >
              Таблица
            </button>
            <button
              class="px-3 py-2 rounded-xl border text-sm"
              :class="view === 'kanban' ? 'border-gray-300 bg-gray-100' : 'border-gray-200 hover:bg-gray-100'"
              @click="view = 'kanban'"
            >
              Канбан
            </button>
          </div>
        </div>

        <!-- table view -->
        <div v-if="view === 'table'" class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th class="text-left px-4 py-3">№</th>
                  <th class="text-left px-4 py-3">Клиент</th>
                  <th class="text-left px-4 py-3">Сумма</th>
                  <th class="text-left px-4 py-3">Статус</th>
                  <th class="text-left px-4 py-3">Дата</th>
                  <th class="text-left px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="o in orders" :key="o.id">
                  <tr class="border-t border-gray-100">
                    <td class="px-4 py-3 font-medium">#{{ o.id }}</td>
                    <td class="px-4 py-3">
                      <div class="font-medium">{{ o.customerName }}</div>
                      <div class="text-xs text-gray-500">{{ o.email }}</div>
                      <div class="text-xs text-gray-500 line-clamp-1">{{ o.address }}</div>
                    </td>
                    <td class="px-4 py-3">{{ o.totalPrice }} ₽</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                        {{ o.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600">
                      {{ new Date(o.createdAt).toLocaleString() }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-if="nextStatus[o.status]"
                          class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                          @click="setOrderStatus(o.id, nextStatus[o.status] as string)"
                        >
                          → {{ statusTitles[nextStatus[o.status] as string] }}
                        </button>
                        <button
                          class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                          @click="toggleComments(o.id)"
                        >
                          Комментарии
                        </button>
                        <NuxtLink
                          :to="`/order/${o.id}`"
                          class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                        >
                          Открыть
                        </NuxtLink>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="openedComments[o.id]" class="border-t border-gray-100 bg-gray-50/50">
                    <td colspan="6" class="px-4 py-4">
                      <div class="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4">
                        <div>
                          <div class="text-xs text-gray-600 mb-2">Журнал комментариев</div>
                          <div class="space-y-2">
                            <div
                              v-for="c in (comments[o.id] || [])"
                              :key="c.id"
                              class="rounded-xl border border-gray-200 bg-white px-3 py-2"
                            >
                              <div class="text-xs text-gray-500">{{ new Date(c.createdAt).toLocaleString() }}</div>
                              <div class="text-sm whitespace-pre-wrap">{{ c.text }}</div>
                            </div>
                            <div v-if="(comments[o.id] || []).length === 0" class="text-sm text-gray-500">Пока пусто</div>
                          </div>
                        </div>

                        <div class="rounded-2xl border border-gray-200 bg-white p-3">
                          <div class="text-xs text-gray-600 mb-2">Добавить</div>
                          <textarea
                            v-model="commentDraft[o.id]"
                            rows="4"
                            class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                            placeholder="Комментарий для менеджеров"
                          />
                          <div class="flex items-center justify-end mt-2 gap-2">
                            <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="loadComments(o.id)">
                              Обновить
                            </button>
                            <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="addComment(o.id)">
                              Сохранить
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>

                <tr v-if="orders.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">Пусто</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- kanban view -->
        <div v-else class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div v-for="(list, key) in grouped" :key="key" class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div class="text-xs font-semibold">{{ statusTitles[key] }}</div>
              <div class="text-xs text-gray-500">{{ list.length }}</div>
            </div>
            <div class="p-2 space-y-2">
              <div v-for="o in list" :key="o.id" class="rounded-2xl border border-gray-200 bg-white p-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="font-semibold text-sm">#{{ o.id }}</div>
                    <div class="text-xs text-gray-500">{{ o.customerName }} · {{ o.totalPrice }} ₽</div>
                  </div>
                  <button
                    v-if="nextStatus[o.status]"
                    class="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
                    :title="'Перевести в: ' + statusTitles[nextStatus[o.status] as string]"
                    :aria-label="'Перевести в: ' + statusTitles[nextStatus[o.status] as string]"
                    @click="setOrderStatus(o.id, nextStatus[o.status] as string)"
                  >
                    <span>{{ nextIcon[o.status] || '→' }}</span>
                  </button>
                </div>
                <div class="text-xs text-gray-500 mt-2 line-clamp-2">{{ o.address }}</div>
                <div class="flex gap-2 mt-3">
                  <button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs" @click="toggleComments(o.id)">
                    Комменты
                  </button>
                  <NuxtLink :to="`/order/${o.id}`" class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs">
                    Открыть
                  </NuxtLink>
                </div>

                <div v-if="openedComments[o.id]" class="mt-3 pt-3 border-t border-gray-200">
                  <div class="space-y-2">
                    <div v-for="c in (comments[o.id] || [])" :key="c.id" class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                      <div class="text-[11px] text-gray-500">{{ new Date(c.createdAt).toLocaleString() }}</div>
                      <div class="text-sm whitespace-pre-wrap">{{ c.text }}</div>
                    </div>
                    <div v-if="(comments[o.id] || []).length === 0" class="text-sm text-gray-500">Пока пусто</div>
                  </div>
                  <div class="mt-2 flex gap-2">
                    <input
                      v-model="commentDraft[o.id]"
                      class="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                      placeholder="Комментарий…"
                    />
                    <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="addComment(o.id)">
                      ОК
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="list.length === 0" class="text-sm text-gray-500 p-3">Пусто</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
