import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: true,

  modules: [
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  typescript: {
    strict: true,
    typeCheck: false
  },

  // ✅ ВОТ СЮДА ДОБАВЛЯЕМ
  routeRules: {
    '/uploads/**': {
      proxy: 'http://localhost:4000/uploads/**'
    },
    '/api/**': {
      proxy: 'http://localhost:4000/api/**'
    }
  },

  runtimeConfig: {
    apiBaseUrl: process.env.NUXT_API_BASE_URL || 'http://backend:4000',

    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Souvenir Shop',
      pwaEnabled: process.env.NUXT_PUBLIC_PWA_ENABLED !== 'false'
    }
  },

  app: {
    head: {
      title: 'Souvenir Shop',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Souvenir Shop',
      short_name: 'Souvenir',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#3659fa',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,webp,ico,json}']
    },
    client: {
      installPrompt: true
    },
    injectRegister: 'auto'
  },

  compatibilityDate: '2025-12-10'
})
