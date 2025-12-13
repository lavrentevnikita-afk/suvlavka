import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Order, OrderItemRecord } from './order.entity'
import { CreateOrderDto } from './dto'
import { Product } from '../catalog/product.entity'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item')
    }

    const productIds = dto.items.map((i) => i.productId)

    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
    })

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id))
      const missing = productIds.filter((id) => !foundIds.has(id))
      throw new NotFoundException(
        `Products not found: ${missing.join(', ')}`,
      )
    }

    const items: OrderItemRecord[] = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        // На всякий случай, хотя выше уже есть проверка
        throw new NotFoundException(
          `Product with id ${item.productId} not found`,
        )
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        price: String((product as any).price), // приводим к строке
        name: product.name,
      }
    })

    const totalPriceNumber = items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity
    }, 0)

    const order = this.ordersRepository.create({
      customerName: dto.customerName,   // <-- ИСПОЛЬЗУЕМ customerName ИЗ DTO
      email: dto.email,
      address: dto.address,
      comment: dto.comment ?? null,
      totalPrice: totalPriceNumber.toFixed(2),
      status: 'new',
      items,
    })

    return this.ordersRepository.save(order)
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } })

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }

    return order
  }

  async getForEmail(email: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { customerEmail: email },
      order: { createdAt: 'DESC' },
    })
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async getOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } })

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }

    return order
  }
}
