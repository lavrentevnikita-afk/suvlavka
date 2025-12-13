<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
auth.initFromStorage()
const props = defineProps<{
  product: any
  mode?: 'retail' | 'b2b'
  prefetch?: boolean
}>()

const imageUrl = computed(() => props.product?.images?.[0]?.url || null)
const retailPrice = computed(() => props.product?.retailPrice ?? props.product?.price)
const wholesalePrice = computed(() => props.product?.wholesalePrice ?? null)

const ctxMode = computed(() =>
  ((props.mode === 'b2b') || route.path.startsWith('/b2b') || auth.user?.role === 'store') ? 'b2b' : 'retail'
)
const to = computed(() => `/product/${props.product.id}`)
</script>

<template>
  <article class="rounded-lg border border-gray-200 bg-white p-3 text-sm">
    <div class="flex gap-3">
      <NuxtLink :to="to" :prefetch="prefetch" class="flex gap-3 flex-1 min-w-0">
        <div
          class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="product.name"
            class="h-full w-full object-contain"
            loading="lazy"
          />
          <div v-else class="text-[11px] text-gray-400">Нет фото</div>
        </div>

        <div class="min-w-0">
          <p class="font-medium text-gray-900 line-clamp-2">{{ product.name }}</p>
          <p class="text-xs text-gray-500">{{ product.category?.name }}</p>
          <p v-if="product.article" class="text-[11px] text-gray-400">Артикул: {{ product.article }}</p>
        </div>
      </NuxtLink>

      <div class="w-28 flex-shrink-0">
        <ProductPriceBlock
          :retail-price="retailPrice"
          :wholesale-price="wholesalePrice"
          :mode="ctxMode"
          compact
        />
      </div>
    </div>
  </article>
</template>
