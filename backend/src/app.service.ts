import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHealth() {
    return { status: 'ok' }
  }

  getCategories() {
    return {
      categories: [
        { slug: 'souvenirs', name: 'Сувениры' },
        { slug: 'gifts', name: 'Подарки' }
      ]
    }
  }

  getProducts(category?: string) {
    // Временные статичные данные
    return {
      products: [
        { id: 1, name: 'Кружка сувенирная', price: 450 },
        { id: 2, name: 'Магнит на холодильник', price: 120 }
      ]
    }
  }

  getProduct(productId: number) {
    return {
      product: {
        id: productId,
        name: `Тестовый товар #${productId}`,
        description: 'Описание товара будет здесь.',
        price: 999
      }
    }
  }
}
