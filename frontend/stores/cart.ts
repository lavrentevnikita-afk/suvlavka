import { defineStore } from 'pinia'

interface CartItem {
  productId: string
  quantity: number
}

interface CartState {
  items: CartItem[]
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: []
  }),
  actions: {
    addItem(productId: string, quantity = 1) {
      const existing = this.items.find((i) => i.productId === productId)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ productId, quantity })
      }
    }
  }
})
