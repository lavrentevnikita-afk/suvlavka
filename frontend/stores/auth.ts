import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

export interface AuthUser {
  id: number
  name: string
  email: string
  role?: 'customer' | 'store' | 'manager'
  createdAt: string
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  initialized: boolean
}

const STORAGE_KEY = 'souvenir_auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user && !!state.accessToken,
  },
  actions: {
    initFromStorage() {
      if (this.initialized) return
      if (process.client) {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as {
              user: AuthUser
              accessToken: string
            }
            this.user = parsed.user
            this.accessToken = parsed.accessToken
          } catch {
            // ignore
          }
        }
      }
      this.initialized = true
    },
    persist() {
      if (!process.client) return
      if (!this.user || !this.accessToken) {
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: this.user,
          accessToken: this.accessToken,
        })
      )
    },
    setSession(payload: { user: AuthUser; accessToken: string }) {
      this.user = payload.user
      this.accessToken = payload.accessToken
      this.persist()
    },
    clearSession() {
      this.user = null
      this.accessToken = null
      this.persist()
    },
    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      const { accessToken, user } = await $fetch<{
        accessToken: string
        user: AuthUser
      }>('/api/auth/login', {
        method: 'POST',
        baseURL: apiBaseUrl,
        body: { email, password },
      })

      this.setSession({ accessToken, user })
    },
    async register(name: string, email: string, password: string) {
      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      const { accessToken, user } = await $fetch<{
        accessToken: string
        user: AuthUser
      }>('/api/auth/register', {
        method: 'POST',
        baseURL: apiBaseUrl,
        body: { name, email, password },
      })

      this.setSession({ accessToken, user })
    },
    async fetchMe() {
      if (!this.accessToken) return

      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      const { user } = await $fetch<{ user: AuthUser }>('/api/auth/me', {
        baseURL: apiBaseUrl,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      this.user = user
      this.persist()
    },
    logout() {
      this.clearSession()
    },
  },
})
