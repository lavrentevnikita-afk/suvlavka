export function useCatalogViewMode() {
  const KEY = 'souvenir_catalog_view'
  const mode = ref<'grid' | 'list'>('grid')

  if (process.client) {
    const saved = window.localStorage.getItem(KEY)
    if (saved === 'grid' || saved === 'list') mode.value = saved
  }

  watch(mode, (v) => {
    if (!process.client) return
    window.localStorage.setItem(KEY, v)
  })

  return { mode }
}
