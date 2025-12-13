import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from './auth'

export type CityOption = { code: string; name: string }

const STORAGE_KEY = 'souvenir_city'

export const CITY_OPTIONS: CityOption[] = [
  { code: 'MSK', name: 'Москва' },
  { code: 'SPB', name: 'Санкт‑Петербург' },
  { code: 'KZN', name: 'Казань' },
  { code: 'NSK', name: 'Новосибирск' },
]

interface CityState {
  city: CityOption | null
  initialized: boolean
}

export const useCityStore = defineStore('city', {
  state: (): CityState => ({
    city: null,
    initialized: false,
  }),
  getters: {
    code: (s) => s.city?.code ?? null,
    name: (s) => s.city?.name ?? null,
  },
  actions: {
    init() {
      if (this.initialized) return
      if (!process.client) {
        this.initialized = true
        return
      }

      // 1) localStorage
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CityOption
          if (parsed?.code && parsed?.name) this.city = parsed
        } catch {
          // ignore
        }
      }

      // 2) account city (if logged in)
      const auth = useAuthStore()
      auth.initFromStorage()
      const accountCity = auth.user?.city
      if (accountCity) {
        const found = CITY_OPTIONS.find((c) => c.code === accountCity) || {
          code: String(accountCity),
          name: String(accountCity),
        }
        this.city = found
      }

      this.initialized = true
      this.persist()
    },
    persist() {
      if (!process.client) return
      if (!this.city) {
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.city))
    },
    async setCity(code: string | null) {
      if (!code) {
        this.city = null
        this.persist()
        return
      }

      const next = CITY_OPTIONS.find((c) => c.code === code) || {
        code,
        name: code,
      }

      this.city = next
      this.persist()

      // если авторизован — сохраняем на аккаунт
      const auth = useAuthStore()
      if (!auth.accessToken) return

      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      try {
        const res = await $fetch<{ user: any }>('/api/users/me', {
          baseURL: apiBaseUrl,
          method: 'PATCH',
          body: { city: next.code },
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        })

        // обновим auth user, чтобы не рассинхрониться
        if (res?.user) {
          auth.user = { ...(auth.user as any), ...res.user }
          auth.persist()
        }
      } catch {
        // не ломаем UI, город всё равно сохранён локально
      }
    },
  },
})
