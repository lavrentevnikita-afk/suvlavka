<script setup lang="ts">
const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  comment: ''
})

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const hasItems = computed(() => !cartStore.isEmpty)

async function submitOrder() {
  if (!authStore.accessToken) {
    errorMessage.value = 'Нужно войти в аккаунт, чтобы оформить заказ.'
    router.push('/login')
    return
  }

  if (!hasItems.value) {
    errorMessage.value = 'Корзина пуста. Добавьте товары перед оформлением заказа.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const body = {
      customerName: form.name,
      phone: form.phone,
      // email берём из формы, а если пусто — из токена
      email: form.email || authStore.user?.email || undefined,
      address: form.address,
      comment: form.comment || undefined,
      items: cartStore.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    }

    const response = await $fetch<{ id: number }>('/api/orders', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })

    cartStore.clear()
    router.push(`/order/${response.id}`)
  } catch (error: any) {
    // Nuxt / ofetch error shape
    const message =
      error?.data?.message ||
      error?.message ||
      'Не удалось отправить заказ. Попробуйте ещё раз.'
    errorMessage.value = Array.isArray(message) ? message.join(', ') : message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">Оформление заказа</h1>
      <p class="text-sm text-gray-600">
        Заполните контактные данные и адрес доставки.
      </p>
    </header>

    <div v-if="cartStore.isEmpty" class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
      Корзина пуста. Сначала добавьте товары.
      <div class="mt-3">
        <NuxtLink
          to="/catalog"
          class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
        >
          В каталог
        </NuxtLink>
      </div>
    </div>

    <form
      v-else
      class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start"
      @submit.prevent="submitOrder"
    >
      <div class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Имя и фамилия
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <input
              v-model="form.phone"
              type="tel"
              required
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="+7"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              E-mail (по желанию)
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Адрес доставки
            </label>
            <textarea
              v-model="form.address"
              required
              rows="3"
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400 resize-none"
              placeholder="Город, улица, дом, квартира"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Комментарий к заказу
            </label>
            <textarea
              v-model="form.comment"
              rows="3"
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400 resize-none"
              placeholder="Например, удобное время для звонка или доставки"
            />
          </div>
        </div>

        <p v-if="errorMessage" class="text-xs text-red-500">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="mt-2 inline-flex items-center rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Отправляем заказ...</span>
          <span v-else>Подтвердить заказ</span>
        </button>
      </div>

      <aside class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <h2 class="text-sm font-semibold">Ваш заказ</h2>

        <ul class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <li
            v-for="item in cartStore.items"
            :key="item.product.id"
            class="flex justify-between gap-2 text-xs"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-900 line-clamp-2">
                {{ item.product.name }}
              </p>
              <p class="text-[11px] text-gray-500">
                x{{ item.quantity }}
              </p>
            </div>
            <div class="text-right whitespace-nowrap">
              <p class="font-semibold">
                {{ item.product.price * item.quantity }} ₽
              </p>
            </div>
          </li>
        </ul>

        <div class="flex justify-between text-sm font-semibold">
          <span>Итого</span>
          <span>{{ cartStore.totalPrice }} ₽</span>
        </div>
      </aside>
    </form>
  </section>
</template>
