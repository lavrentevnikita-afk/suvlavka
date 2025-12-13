<script setup lang="ts">
type Img = { url: string; id?: number | string }

const props = defineProps<{ images: Img[]; alt: string }>()

const active = ref(0)
const isOpen = ref(false)
const zoomed = ref(false)

const list = computed(() => Array.isArray(props.images) ? props.images : [])

const mainUrl = computed(() => {
  if (!list.value.length) return null
  return list.value[active.value]?.url ?? list.value[0]?.url ?? null
})

function select(index: number) {
  if (index < 0 || index >= list.value.length) return
  active.value = index
  zoomed.value = false
}

function open() {
  if (!mainUrl.value) return
  isOpen.value = true
  zoomed.value = false
}

function close() {
  isOpen.value = false
  zoomed.value = false
}

function derive(url: string, ext: 'avif' | 'webp') {
  // Convention-based: foo.jpg -> foo.avif / foo.webp
  return url.replace(/\.(png|jpe?g)$/i, `.${ext}`)
}

const srcsetAvif = computed(() => (mainUrl.value ? derive(mainUrl.value, 'avif') : null))
const srcsetWebp = computed(() => (mainUrl.value ? derive(mainUrl.value, 'webp') : null))

watch(isOpen, (v) => {
  if (!process.client) return
  document.documentElement.style.overflow = v ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (!process.client) return
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="space-y-4">
    <button
      type="button"
      class="group relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-white flex items-center justify-center"
      @click="open"
    >
      <template v-if="mainUrl">
        <picture>
          <source v-if="srcsetAvif" :srcset="srcsetAvif" type="image/avif" />
          <source v-if="srcsetWebp" :srcset="srcsetWebp" type="image/webp" />
          <img
            :src="mainUrl"
            :alt="alt"
            class="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
            loading="lazy"
          />
        </picture>
        <span
          class="pointer-events-none absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[10px] text-gray-600 shadow"
        >
          Нажмите для zoom
        </span>
      </template>
      <div v-else class="text-xs text-gray-400">Нет изображения</div>
    </button>

    <div v-if="list.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(image, index) in list"
        :key="image.id || index"
        type="button"
        class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border"
        :class="index === active ? 'border-slate-900' : 'border-gray-200 hover:border-gray-300'"
        @click="select(index)"
      >
        <img :src="image.url" :alt="alt" class="h-full w-full object-cover" loading="lazy" />
      </button>
    </div>

    <!-- Modal zoom -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="close"
      >
        <div class="relative w-full max-w-4xl">
          <button
            type="button"
            class="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800"
            @click="close"
          >
            Закрыть
          </button>

          <div class="overflow-hidden rounded-2xl bg-white shadow-xl">
            <button
              type="button"
              class="block w-full bg-white"
              @click="zoomed = !zoomed"
              :title="zoomed ? 'Уменьшить' : 'Увеличить'"
            >
              <img
                v-if="mainUrl"
                :src="mainUrl"
                :alt="alt"
                class="h-[70vh] w-full object-contain transition-transform duration-200"
                :class="zoomed ? 'scale-[1.7] cursor-zoom-out' : 'scale-100 cursor-zoom-in'"
              />
            </button>
            <div class="flex items-center justify-between px-4 py-3 text-xs text-gray-600">
              <span>Клик по изображению: {{ zoomed ? 'уменьшить' : 'увеличить' }}</span>
              <span v-if="list.length">{{ active + 1 }} / {{ list.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
