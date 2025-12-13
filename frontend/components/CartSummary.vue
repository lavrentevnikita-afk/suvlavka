<script setup lang="ts">
const props = defineProps<{ itemsCount: number; subtotal: number }>()

type Delivery = 'pickup' | 'courier'
type Payment = 'card' | 'cash'

const STORAGE_KEY = 'cart:summary:v1'

const state = reactive({
  delivery: 'pickup' as Delivery,
  payment: 'card' as Payment,
})

function load() {
  if (!process.client) return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed?.delivery) state.delivery = parsed.delivery
    if (parsed?.payment) state.payment = parsed.payment
  } catch {
    // ignore
  }
}

function save() {
  if (!process.client) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

onMounted(load)
watch(state, save, { deep: true })

// Simple, transparent rules (can be replaced later by real delivery API)
const deliveryPrice = computed(() => {
  if (state.delivery === 'pickup') return 0
  // courier: free from 5000₽, otherwise 390₽
  return props.subtotal >= 5000 ? 0 : 390
})

const total = computed(() => props.subtotal + deliveryPrice.value)

const deliveryLabel = computed(() => (state.delivery === 'pickup' ? 'Самовывоз' : 'Курьер'))
const paymentLabel = computed(() => (state.payment === 'card' ? 'Карта' : 'Наличные'))
</script>

<template>
  <aside class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">Резюме</h2>
      <span class="text-[11px] text-gray-500">{{ itemsCount }} шт.</span>
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium text-gray-700">Доставка</p>
      <div class="grid gap-2">
        <label class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
          <span class="text-sm">Самовывоз</span>
          <input v-model="state.delivery" type="radio" value="pickup" />
        </label>
        <label class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
          <span class="text-sm">Курьер</span>
          <input v-model="state.delivery" type="radio" value="courier" />
        </label>
        <p class="text-[11px] text-gray-500">
          Курьер: бесплатно от 5000 ₽, иначе 390 ₽.
        </p>
      </div>
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium text-gray-700">Оплата</p>
      <div class="grid gap-2">
        <label class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
          <span class="text-sm">Карта</span>
          <input v-model="state.payment" type="radio" value="card" />
        </label>
        <label class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
          <span class="text-sm">Наличные</span>
          <input v-model="state.payment" type="radio" value="cash" />
        </label>
      </div>
    </div>

    <div class="space-y-2 border-t border-gray-100 pt-3">
      <div class="flex justify-between text-xs text-gray-600">
        <span>Товары</span>
        <span>{{ subtotal }} ₽</span>
      </div>
      <div class="flex justify-between text-xs text-gray-600">
        <span>Доставка ({{ deliveryLabel }})</span>
        <span>{{ deliveryPrice }} ₽</span>
      </div>
      <div class="flex justify-between text-base font-semibold">
        <span>Итого</span>
        <span>{{ total }} ₽</span>
      </div>
      <p class="text-[11px] text-gray-500">
        Выбрано: {{ deliveryLabel }}, {{ paymentLabel }}.
      </p>
    </div>

    <slot />
  </aside>
</template>
