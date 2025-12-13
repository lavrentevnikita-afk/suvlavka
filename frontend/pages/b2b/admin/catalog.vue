<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const tab = ref<'categories' | 'products'>('products')

const loading = ref(false)
const error = ref<string | null>(null)

const categories = ref<any[]>([])
const products = ref<any[]>([])

const q = ref('')
const categoryId = ref<number | ''>('')

// forms
const catForm = ref<{ id?: number; slug: string; name: string; description?: string }>(
  { slug: '', name: '', description: '' },
)

const productForm = ref<any>({
  id: undefined,
  slug: '',
  name: '',
  article: '',
  price: '0.00',
  categoryId: '',
  isAvailable: true,
  description: '',
})

const fileUploading = ref<Record<number, boolean>>({})

function authHeaders() {
  return auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}
}

async function loadCategories() {
  if (!auth.accessToken) return
  const res = await $fetch<any>('/api/admin/catalog/categories', {
    baseURL: apiBaseUrl,
    headers: authHeaders(),
  })
  categories.value = Array.isArray(res?.categories) ? res.categories : []
}

async function loadProducts() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/catalog/products', {
      baseURL: apiBaseUrl,
      headers: authHeaders(),
      query: {
        q: q.value || undefined,
        categoryId: categoryId.value === '' ? undefined : categoryId.value,
        limit: 100,
      },
    })
    products.value = Array.isArray(res?.products) ? res.products : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить каталог'
  } finally {
    loading.value = false
  }
}

async function reloadAll() {
  loading.value = true
  error.value = null
  try {
    await loadCategories()
    await loadProducts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить данные'
  } finally {
    loading.value = false
  }
}

function resetCatForm() {
  catForm.value = { slug: '', name: '', description: '' }
}

function editCategory(c: any) {
  catForm.value = {
    id: c.id,
    slug: String(c.slug || ''),
    name: String(c.name || ''),
    description: c.description ? String(c.description) : '',
  }
  tab.value = 'categories'
}

async function saveCategory() {
  if (!auth.accessToken) return
  error.value = null
  const payload: any = {
    slug: String(catForm.value.slug || '').trim(),
    name: String(catForm.value.name || '').trim(),
    description: String(catForm.value.description || '').trim() || undefined,
  }
  try {
    if (catForm.value.id) {
      await $fetch<any>(`/api/admin/catalog/categories/${catForm.value.id}`, {
        baseURL: apiBaseUrl,
        method: 'PATCH',
        headers: authHeaders(),
        body: payload,
      })
    } else {
      await $fetch<any>('/api/admin/catalog/categories', {
        baseURL: apiBaseUrl,
        method: 'POST',
        headers: authHeaders(),
        body: payload,
      })
    }
    resetCatForm()
    await loadCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить категорию'
  }
}

async function deleteCategory(id: number) {
  if (!auth.accessToken) return
  if (!confirm('Удалить категорию?')) return
  error.value = null
  try {
    const res = await $fetch<any>(`/api/admin/catalog/categories/${id}`, {
      baseURL: apiBaseUrl,
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (res?.ok === false) {
      error.value = res?.message || 'Нельзя удалить категорию'
      return
    }
    await loadCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось удалить категорию'
  }
}

function resetProductForm() {
  productForm.value = {
    id: undefined,
    slug: '',
    name: '',
    article: '',
    price: '0.00',
    categoryId: categories.value?.[0]?.id || '',
    isAvailable: true,
    description: '',
  }
}

function editProduct(p: any) {
  productForm.value = {
    id: p.id,
    slug: String(p.slug || ''),
    name: String(p.name || ''),
    article: String(p.article || ''),
    price: String(p.price || '0.00'),
    categoryId: p.category?.id || '',
    isAvailable: !!p.isAvailable,
    description: p.description ? String(p.description) : '',
  }
  tab.value = 'products'
}

async function saveProduct() {
  if (!auth.accessToken) return
  error.value = null
  const payload: any = {
    slug: String(productForm.value.slug || '').trim(),
    name: String(productForm.value.name || '').trim(),
    article: String(productForm.value.article || '').trim(),
    price: String(productForm.value.price || '').trim(),
    categoryId: Number(productForm.value.categoryId),
    isAvailable: !!productForm.value.isAvailable,
    description: String(productForm.value.description || '').trim() || undefined,
  }

  try {
    if (productForm.value.id) {
      await $fetch<any>(`/api/admin/catalog/products/${productForm.value.id}`, {
        baseURL: apiBaseUrl,
        method: 'PATCH',
        headers: authHeaders(),
        body: payload,
      })
    } else {
      await $fetch<any>('/api/admin/catalog/products', {
        baseURL: apiBaseUrl,
        method: 'POST',
        headers: authHeaders(),
        body: payload,
      })
    }
    resetProductForm()
    await loadProducts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить товар'
  }
}

async function deleteProduct(id: number) {
  if (!auth.accessToken) return
  if (!confirm('Удалить товар?')) return
  error.value = null
  try {
    await $fetch<any>(`/api/admin/catalog/products/${id}`, {
      baseURL: apiBaseUrl,
      method: 'DELETE',
      headers: authHeaders(),
    })
    await loadProducts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось удалить товар'
  }
}

function imageUrl(url: string) {
  if (!url) return ''
  // абсолютный превью-URL
  if (url.startsWith('http')) return url
  return `${apiBaseUrl}${url}`
}

async function uploadImage(productId: number, file: File) {
  if (!auth.accessToken) return
  fileUploading.value[productId] = true
  error.value = null
  try {
    const fd = new FormData()
    fd.append('file', file)
    await $fetch<any>(`/api/admin/catalog/products/${productId}/images`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: authHeaders(),
      body: fd,
    })
    await loadProducts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить изображение'
  } finally {
    fileUploading.value[productId] = false
  }
}

onMounted(async () => {
  await reloadAll()
  resetProductForm()
})
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Админка — каталог</h1>
          <p class="text-sm text-gray-600 mt-1">Категории, товары, цены и изображения (локальное хранилище)</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="reloadAll">
            Обновить
          </button>
        </div>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 rounded-xl border text-sm"
          :class="tab === 'products' ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'"
          @click="tab = 'products'"
        >
          Товары
        </button>
        <button
          class="px-3 py-2 rounded-xl border text-sm"
          :class="tab === 'categories' ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'"
          @click="tab = 'categories'"
        >
          Категории
        </button>
      </div>

      <!-- Products -->
      <div v-if="tab === 'products'" class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <!-- form -->
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">{{ productForm.id ? 'Редактировать товар' : 'Новый товар' }}</div>
              <div class="text-xs text-gray-500">Цены — в поле price (розница). Опт считается в витрине автоматически.</div>
            </div>
            <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="resetProductForm">
              Сброс
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <input v-model="productForm.slug" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="slug" />
              <input v-model="productForm.article" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="артикул" />
            </div>
            <input v-model="productForm.name" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="название" />
            <div class="grid grid-cols-2 gap-2">
              <input v-model="productForm.price" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="цена (например 590.00)" />
              <select v-model="productForm.categoryId" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="" disabled>категория</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="productForm.isAvailable" />
              <span>Доступен (в наличии)</span>
            </label>
            <textarea v-model="productForm.description" class="px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[100px]" placeholder="описание" />
            <button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90" @click="saveProduct">
              Сохранить
            </button>
          </div>
        </div>

        <!-- list -->
        <div class="space-y-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <input v-model="q" class="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="поиск: название / артикул / slug" @keydown.enter="loadProducts" />
              <select v-model="categoryId" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm" @change="loadProducts">
                <option value="">все категории</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="loadProducts">
                Найти
              </button>
            </div>
          </div>

          <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

          <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div v-for="p in products" :key="p.id" class="rounded-2xl border border-gray-200 bg-white p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ p.name }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    #{{ p.id }} · {{ p.article }} · <span class="font-mono">{{ p.slug }}</span>
                  </div>
                  <div class="text-xs text-gray-500">Категория: {{ p.category?.name }}</div>
                  <div class="mt-2 flex items-center gap-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border" :class="p.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'">
                      {{ p.isAvailable ? 'в наличии' : 'нет' }}
                    </span>
                    <span class="text-sm font-semibold tabular-nums">{{ p.price }} ₽</span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="editProduct(p)">
                    Редактировать
                  </button>
                  <button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs" @click="deleteProduct(p.id)">
                    Удалить
                  </button>
                </div>
              </div>

              <div class="mt-4">
                <div class="text-xs font-semibold text-gray-700 mb-2">Изображения</div>
                <div class="flex flex-wrap gap-2">
                  <img
                    v-for="img in (p.images || [])"
                    :key="img.id"
                    :src="imageUrl(img.url)"
                    class="w-20 h-14 object-cover rounded-xl border border-gray-200"
                    :alt="p.name"
                  />
                  <div v-if="(p.images || []).length === 0" class="text-sm text-gray-500">нет</div>
                </div>

                <div class="mt-3 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    class="text-xs"
                    :disabled="fileUploading[p.id]"
                    @change="(e: any) => { const f = e?.target?.files?.[0]; if (f) uploadImage(p.id, f) }"
                  />
                  <span v-if="fileUploading[p.id]" class="text-xs text-gray-500">Загрузка…</span>
                  <span class="text-[11px] text-gray-500">(сохраняется в backend/uploads/products)</span>
                </div>
              </div>
            </div>

            <div v-if="products.length === 0" class="xl:col-span-2 text-center text-gray-500 py-10">
              Товары не найдены
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">{{ catForm.id ? 'Редактировать категорию' : 'Новая категория' }}</div>
              <div class="text-xs text-gray-500">Удаление блокируется, если внутри есть товары.</div>
            </div>
            <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="resetCatForm">
              Сброс
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <input v-model="catForm.slug" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="slug" />
            <input v-model="catForm.name" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="название" />
            <textarea v-model="catForm.description" class="px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[90px]" placeholder="описание" />
            <button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90" @click="saveCategory">
              Сохранить
            </button>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th class="text-left px-4 py-3">Категория</th>
                  <th class="text-left px-4 py-3">Slug</th>
                  <th class="text-right px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in categories" :key="c.id" class="border-t border-gray-100">
                  <td class="px-4 py-3">
                    <div class="font-medium">{{ c.name }}</div>
                    <div class="text-xs text-gray-500" v-if="c.description">{{ c.description }}</div>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ c.slug }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="inline-flex gap-2">
                      <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="editCategory(c)">
                        Редактировать
                      </button>
                      <button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs" @click="deleteCategory(c.id)">
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="categories.length === 0" class="border-t border-gray-100">
                  <td colspan="3" class="px-4 py-8 text-center text-gray-500">Категорий нет</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
