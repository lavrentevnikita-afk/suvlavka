import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  auth.initFromStorage()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  // подтянем актуального юзера (роль)
  try {
    await auth.fetchMe()
  } catch {
    auth.logout()
    return navigateTo('/login')
  }

  if (auth.user?.role !== 'store') {
    // не магазин — не пускаем в B2B
    return navigateTo('/')
  }
})
