<script setup lang="ts">
definePageMeta({
  middleware: ['b2b'],
})
</script>

<template>
  <NuxtLayout name="b2b">
    <section class="space-y-3">
      <h1 class="text-xl font-semibold">Заказы магазина</h1>
      <p class="text-sm text-slate-300">
        Здесь будет список заказов магазина с фильтрами и возможностью повтора.
      </p>
    </section>
  </NuxtLayout>
</template>
