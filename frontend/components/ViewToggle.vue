<script setup lang="ts">
const props = defineProps<{
  modelValue: 'grid' | 'list'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: 'grid' | 'list'): void
}>()

const set = (v: 'grid' | 'list') => emit('update:modelValue', v)
</script>

<template>
  <div class="inline-flex overflow-hidden rounded-full border border-gray-200 bg-white text-xs">
    <button
      type="button"
      class="px-3 py-1.5"
      :class="modelValue === 'grid' ? 'bg-slate-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
      @click="set('grid')"
    >
      Плитка
    </button>
    <button
      type="button"
      class="px-3 py-1.5"
      :class="modelValue === 'list' ? 'bg-slate-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
      @click="set('list')"
    >
      Список
    </button>
  </div>
</template>
