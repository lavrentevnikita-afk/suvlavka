import { defineStore } from 'pinia'

export interface CartProductSnapshot {
  id: number
  name: string
  price: number
  article?: string
  imageUrl?: string | null
  // optional metadata for smarter UI (non-breaking)
  categorySlug?: string | null
  categoryName?: string | null
}

export interface CartItem {
  product: CartProductSnapshot
  quantity: number
}

interface CartState {
  items: CartItem[]
}

const STORAGE_KEY = 'cart'

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => ({
      ...item,
      product: {
        ...item.product,
        // ensure number
        id: Number(item.product.id),
        price: Number(item.product.price)
      }
    }))
  } catch {
    return []
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: []
  }),
  getters: {
    totalItems(state): number {
      return state.items.reduce((acc, item) => acc + item.quantity, 0)
    },
    totalPrice(state): number {
      return state.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    },
    isEmpty(): boolean {
      return this.totalItems === 0
    }
  },
  actions: {
    initFromStorage() {
      if (this.items.length) return
      const items = loadFromStorage()
      this.items = items
    },
    addItem(product: CartProductSnapshot, quantity = 1) {
      const existing = this.items.find((i) => i.product.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ product, quantity })
      }
      saveToStorage(this.items)
    },
    removeItem(productId: number) {
      this.items = this.items.filter((item) => item.product.id !== productId)
      saveToStorage(this.items)
    },
    setQuantity(productId: number, quantity: number) {
      const item = this.items.find((i) => i.product.id === productId)
      if (!item) return
      if (quantity <= 0) {
        this.removeItem(productId)
      } else {
        item.quantity = quantity
        saveToStorage(this.items)
      }
    },
    clear() {
      this.items = []
      saveToStorage(this.items)
    }
  }
})
