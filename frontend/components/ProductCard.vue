<script setup lang="ts">
const route = useRoute()

const props = defineProps<{
  product: any
  mode?: 'retail' | 'b2b'
  prefetch?: boolean
}>()

const imageUrl = computed(() => props.product?.images?.[0]?.url || null)

function derive(url: string, ext: 'avif' | 'webp') {
  return url.replace(/\.(png|jpe?g)$/i, `.${ext}`)
}

const imgAvif = computed(() => (imageUrl.value ? derive(imageUrl.value, 'avif') : null))
const imgWebp = computed(() => (imageUrl.value ? derive(imageUrl.value, 'webp') : null))
const isB2B = computed(() => props.mode === 'b2b')

const retailPrice = computed(() => props.product?.retailPrice ?? props.product?.price)
const wholesalePrice = computed(() => props.product?.wholesalePrice ?? null)

const ctxMode = computed(() => (isB2B.value ? 'b2b' : 'retail') as const)

const to = computed(() => `/product/${props.product.id}`)
</script>

<template>
  <article class="rounded-lg border border-gray-200 bg-white p-3 text-sm flex flex-col">
    <NuxtLink :to="to" :prefetch="prefetch" class="space-y-2">
      <div
        class="aspect-square w-full overflow-hidden rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center"
      >
        <picture v-if="imageUrl">
          <source v-if="imgAvif" :srcset="imgAvif" type="image/avif" />
          <source v-if="imgWebp" :srcset="imgWebp" type="image/webp" />
          <img
            :src="imageUrl"
            :alt="product.name"
            class="h-full w-full object-contain"
            loading="lazy"
          />
        </picture>
        <div v-else class="text-[11px] text-gray-400">Нет фото</div>
      </div>

      <div class="space-y-1">
        <p class="font-medium text-gray-900 line-clamp-2">{{ product.name }}</p>
        <p class="text-xs text-gray-500">{{ product.category?.name }}</p>
      </div>
    </NuxtLink>

    <div class="mt-auto pt-2">
      <ProductPriceBlock
        :retail-price="retailPrice"
        :wholesale-price="wholesalePrice"
        :mode="ctxMode"
      />
    </div>
  </article>
</template>