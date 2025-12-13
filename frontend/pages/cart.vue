<script setup lang="ts">
const cartStore = useCartStore()
const router = useRouter()

const items = computed(() => cartStore.items)
const totalPrice = computed(() => cartStore.totalPrice)
const isEmpty = computed(() => cartStore.isEmpty)
const productIds = computed(() => items.value.map((i) => i.product.id))

function onQuantityChange(itemId: number, value: string) {
  const num = Number(value)
  if (Number.isNaN(num)) return
  cartStore.setQuantity(itemId, num)
}

function removeItem(id: number) {
  cartStore.removeItem(id)
}

function goToCheckout() {
  if (cartStore.isEmpty) return
  router.push('/checkout')
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">Корзина</h1>
      <p class="text-sm text-gray-600">
        Проверьте товары перед оформлением заказа.
      </p>
    </header>

    <div v-if="isEmpty" class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
      Ваша корзина пуста. Откройте каталог и добавьте первые товары.
      <div class="mt-3">
        <NuxtLink
          to="/catalog"
          class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
        >
          В каталог
        </NuxtLink>
      </div>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
      <!-- Список товаров -->
      <div class="space-y-6">
        <ul class="space-y-3">
        <li
          v-for="item in items"
          :key="item.product.id"
          class="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm"
        >
          <div
            class="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50 flex items-center justify-center"
          >
            <img
              v-if="item.product.imageUrl"
              :src="item.product.imageUrl"
              :alt="item.product.name"
              class="h-full w-full object-cover"
            />
            <span v-else class="text-[10px] text-gray-400">
              Нет фото
            </span>
          </div>

          <div class="flex flex-1 flex-col gap-1">
            <div class="flex justify-between gap-3">
              <NuxtLink
                :to="`/product/${item.product.id}`"
                class="font-medium text-gray-900 hover:text-brand line-clamp-2"
              >
                {{ item.product.name }}
              </NuxtLink>
              <button
                type="button"
                class="text-[11px] text-gray-400 hover:text-red-500"
                @click="removeItem(item.product.id)"
              >
                Удалить
              </button>
            </div>

            <p class="text-xs text-gray-500" v-if="item.product.article">
              Артикул: {{ item.product.article }}
            </p>

            <div class="mt-1 flex items-center justify-between gap-3">
              <div class="inline-flex items-center rounded-full border border-gray-200 px-2 py-1 text-[11px]">
                <span class="mr-2 text-gray-500">
                  Количество
                </span>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  class="w-16 border-none bg-transparent text-xs outline-none"
                  @input="onQuantityChange(item.product.id, ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div class="text-right">
                <p class="text-xs text-gray-500">
                  Цена
                </p>
                <p class="text-sm font-semibold">
                  {{ item.product.price * item.quantity }} ₽
                </p>
              </div>
            </div>
          </div>
        </li>
        </ul>

        <CartCrossSell :product-ids="productIds" />
      </div>

      <!-- Итоги + доставка/оплата -->
      <CartSummary :items-count="cartStore.totalItems" :subtotal="totalPrice">
        <button
          type="button"
          class="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isEmpty"
          @click="goToCheckout"
        >
          Перейти к оформлению
        </button>
      </CartSummary>
    </div>
  </section>
</template>
