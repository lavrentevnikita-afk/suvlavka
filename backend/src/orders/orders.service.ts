import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Order } from './order.entity'
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
      throw new BadRequestException(
        `Some products were not found: ${missing.join(', ')}`,
      )
    }

    const productMap = new Map(products.map((p) => [p.id, p]))

    const items = dto.items.map((i) => {
      const product = productMap.get(i.productId)
      if (!product) {
        throw new BadRequestException(`Product ${i.productId} not found`)
      }

      return {
        productId: product.id,
        quantity: i.quantity,
        price: Number(product.price), // <-- число
        name: product.name,
      }
    })

    const totalPriceNumber = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    const order = this.ordersRepository.create({
      customerName: dto.customerName,
      phone: dto.phone,
      email: dto.email ?? null,
      address: dto.address,
      comment: dto.comment ?? null,
      items,
      totalPrice: totalPriceNumber.toFixed(2),
      status: 'new',
    })

    return this.ordersRepository.save(order)
  }

  async getOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } })
    if (!order) {
      throw new NotFoundException('Order not found')
    }
    return order
  }
}
