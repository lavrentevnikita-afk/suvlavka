<script setup lang="ts">
const props = defineProps<{ isAvailable: boolean; hint?: string | null }>()

// We don't have stock quantity in the API yet, so we derive a "level".
// If backend later adds a real field (e.g., availabilityStatus), we can pass it via `hint`.
const level = computed(() => {
  const raw = (props.hint ?? '').toLowerCase().trim()
  if (raw.includes('под заказ') || raw.includes('заказ')) return 'preorder'
  if (raw.includes('мало') || raw.includes('few')) return 'low'
  if (raw.includes('много') || raw.includes('many')) return 'many'
  return props.isAvailable ? 'many' : 'preorder'
})

const text = computed(() => {
  if (level.value === 'low') return 'Мало'
  if (level.value === 'preorder') return 'Под заказ'
  return 'Много'
})

const klass = computed(() => {
  if (level.value === 'low') return 'bg-amber-100 text-amber-800'
  if (level.value === 'preorder') return 'bg-gray-100 text-gray-600'
  return 'bg-emerald-100 text-emerald-800'
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
    :class="klass"
  >
    <span class="mr-1">{{ level === 'preorder' ? '○' : '●' }}</span>
    {{ text }}
  </span>
</template>
