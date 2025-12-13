<script setup lang="ts">
const props = defineProps<{
  retailPrice: string | number
  wholesalePrice?: string | number | null
  mode?: 'retail' | 'b2b'
  compact?: boolean
}>()

const retail = computed(() => Number(props.retailPrice))
const wholesale = computed(() =>
  props.wholesalePrice == null ? null : Number(props.wholesalePrice)
)

const format = (v: number | null) => {
  if (v == null || !Number.isFinite(v)) return null
  return `${Math.round(v)} ₽`
}

const top = computed(() => (props.mode === 'b2b' ? wholesale.value : retail.value))
const bottom = computed(() => (props.mode === 'b2b' ? retail.value : wholesale.value))

const topLabel = computed(() => (props.mode === 'b2b' ? 'Опт' : 'Розница'))
const bottomLabel = computed(() => (props.mode === 'b2b' ? 'Розница' : 'Опт'))

const topText = computed(() => format(top.value) ?? '—')
const bottomText = computed(() => (format(bottom.value) ? format(bottom.value) : null))
</script>

<template>
  <div class="space-y-0.5" :class="compact ? 'text-xs' : ''">
    <div class="flex items-baseline justify-between gap-2">
      <p class="font-semibold" :class="compact ? 'text-sm' : 'text-lg'">
        {{ topText }}
      </p>
      <span class="text-[10px] uppercase tracking-wide text-gray-400">
        {{ topLabel }}
      </span>
    </div>

    <div v-if="bottomText" class="flex items-baseline justify-between gap-2">
      <p class="text-gray-600" :class="compact ? 'text-xs' : 'text-sm'">
        {{ bottomText }}
      </p>
      <span class="text-[10px] uppercase tracking-wide text-gray-400">
        {{ bottomLabel }}
      </span>
    </div>
  </div>
</template>
