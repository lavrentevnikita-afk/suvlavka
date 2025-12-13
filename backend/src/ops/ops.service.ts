import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from '../orders/order.entity'
import { Stock } from '../b2b/stock.entity'
import { Warehouse } from './warehouse.entity'
import { StockMovement, StockMovementType } from './stock-movement.entity'
import { ProductionTask, ProductionStatus } from './production-task.entity'
import { OrderComment } from './order-comment.entity'
import { Shipment } from './shipment.entity'
import { Product } from '../catalog/product.entity'

export type OrderStatus = 'new' | 'confirmed' | 'in_work' | 'shipped' | 'closed'

const ALLOWED_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'in_work',
  'shipped',
  'closed',
]

@Injectable()
export class OpsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Stock)
    private readonly stocksRepository: Repository<Stock>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    @InjectRepository(StockMovement)
    private readonly movementsRepository: Repository<StockMovement>,
    @InjectRepository(ProductionTask)
    private readonly productionRepository: Repository<ProductionTask>,
    @InjectRepository(OrderComment)
    private readonly commentsRepository: Repository<OrderComment>,
    @InjectRepository(Shipment)
    private readonly shipmentsRepository: Repository<Shipment>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  // ---------- Orders ----------

  async listOrders(params: {
    status?: string
    q?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const qb = this.ordersRepository
      .createQueryBuilder('o')
      .orderBy('o.createdAt', 'DESC')

    if (params.status && ALLOWED_STATUSES.includes(params.status as OrderStatus)) {
      qb.andWhere('o.status = :status', { status: params.status })
    }

    if (params.q) {
      const q = String(params.q).trim().toLowerCase()
      if (q) {
        // по id, имени, email
        if (/^\d+$/.test(q)) {
          qb.andWhere('o.id = :id', { id: Number(q) })
        } else {
          qb.andWhere(
            '(LOWER(o.customerName) LIKE :q OR LOWER(o.email) LIKE :q OR LOWER(o.address) LIKE :q)',
            { q: `%${q}%` },
          )
        }
      }
    }

    if (params.dateFrom) {
      qb.andWhere('o.createdAt >= :df', { df: new Date(params.dateFrom) })
    }
    if (params.dateTo) {
      qb.andWhere('o.createdAt <= :dt', { dt: new Date(params.dateTo) })
    }

    const orders = await qb.getMany()
    return { orders }
  }

  async setOrderStatus(orderId: number, status: OrderStatus, warehouse = 'MSK') {
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new BadRequestException('Invalid status')
    }
    const order = await this.ordersRepository.findOne({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')

    // переходы (мягко: разрешаем выставлять любой валидный статус, но делаем операции на ключевых)
    if (status === 'confirmed') {
      await this.ensureWarehouse(warehouse)
      await this.reserveForOrder(order, warehouse)
    }

    if (status === 'shipped') {
      await this.ensureWarehouse(warehouse)
      await this.shipOrder(order, warehouse)
      order.shippedAt = new Date()
      // зафиксируем отгрузку
      await this.ensureShipment(order.id)
      await this.shipmentsRepository.update(
        { orderId: order.id },
        { status: 'shipped', shippedAt: order.shippedAt },
      )
    }

    if (status === 'closed') {
      order.closedAt = new Date()
    }

    order.status = status
    await this.ordersRepository.save(order)
    return { order }
  }

  private async ensureShipment(orderId: number) {
    const existing = await this.shipmentsRepository.findOne({ where: { orderId } })
    if (existing) return existing
    const created = this.shipmentsRepository.create({ orderId, status: 'created', shippedAt: null })
    return this.shipmentsRepository.save(created)
  }

  // ---------- Comments ----------

  async listComments(orderId: number) {
    const items = await this.commentsRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    })
    return { comments: items }
  }

  async addComment(orderId: number, authorUserId: number, text: string) {
    const t = String(text ?? '').trim()
    if (!t) throw new BadRequestException('Empty comment')
    const order = await this.ordersRepository.findOne({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')

    const c = this.commentsRepository.create({ orderId, authorUserId, text: t })
    await this.commentsRepository.save(c)
    return this.listComments(orderId)
  }

  // ---------- Warehouses & Stocks ----------

  async ensureWarehouse(code: string) {
    const c = String(code || 'MSK').trim().toUpperCase()
    let wh = await this.warehousesRepository.findOne({ where: { code: c } })
    if (!wh) {
      wh = this.warehousesRepository.create({ code: c, name: c })
      wh = await this.warehousesRepository.save(wh)
    }
    return wh
  }

  async listWarehouses(): Promise<{ warehouses: Warehouse[] }> {
    const warehouses = await this.warehousesRepository.find({ order: { id: 'ASC' } })
    if (warehouses.length === 0) {
      // чтобы UI всегда имел "MSK" из коробки
      await this.ensureWarehouse('MSK')
      return this.listWarehouses()
    }
    return { warehouses }
  }

  async upsertWarehouse(code: string, name: string) {
    const c = String(code).trim().toUpperCase()
    if (!c) throw new BadRequestException('Warehouse code required')
    const n = String(name ?? '').trim()
    let wh = await this.warehousesRepository.findOne({ where: { code: c } })
    if (!wh) {
      wh = this.warehousesRepository.create({ code: c, name: n || c })
    } else {
      wh.name = n || wh.name || c
    }
    wh = await this.warehousesRepository.save(wh)
    return { warehouse: wh }
  }

  async listStocks(warehouse: string) {
    const wh = String(warehouse || 'MSK').trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const stocks = await this.stocksRepository.find({
      where: { warehouse: wh } as any,
      order: { id: 'ASC' },
    })
    return { warehouse: wh, stocks }
  }

  async receiveStock(warehouse: string, productId: number, qty: number, note?: string) {
    return this.applyStockDelta(warehouse, productId, qty, 'in', note)
  }
  async issueStock(warehouse: string, productId: number, qty: number, note?: string) {
    return this.applyStockDelta(warehouse, productId, -Math.abs(qty), 'out', note)
  }
  async adjustStock(warehouse: string, productId: number, qty: number, note?: string) {
    // qty - абсолютное значение, записываем как adjust, и выставляем qty на значение
    const wh = String(warehouse || 'MSK').trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const product = await this.productsRepository.findOne({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')

    let stock = await this.stocksRepository.findOne({
      where: { warehouse: wh, product: { id: productId } } as any,
    })
    if (!stock) {
      stock = this.stocksRepository.create({ warehouse: wh, product, qty: 0, reservedQty: 0, onOrderQty: 0 })
    }
    stock.qty = Math.max(0, Number(qty) || 0)
    await this.stocksRepository.save(stock)
    await this.movementsRepository.save(
      this.movementsRepository.create({
        warehouse: wh,
        productId,
        type: 'adjust',
        qty: Number(qty) || 0,
        orderId: null,
        note: note ?? null,
      }),
    )
    return { stock }
  }

  private async applyStockDelta(
    warehouse: string,
    productId: number,
    delta: number,
    movementType: StockMovementType,
    note?: string,
  ) {
    const wh = String(warehouse || 'MSK').trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const product = await this.productsRepository.findOne({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')

    let stock = await this.stocksRepository.findOne({
      where: { warehouse: wh, product: { id: productId } } as any,
    })
    if (!stock) {
      stock = this.stocksRepository.create({ warehouse: wh, product, qty: 0, reservedQty: 0, onOrderQty: 0 })
    }
    stock.qty = Math.max(0, stock.qty + delta)
    await this.stocksRepository.save(stock)
    await this.movementsRepository.save(
      this.movementsRepository.create({
        warehouse: wh,
        productId,
        type: movementType,
        qty: Math.abs(delta),
        orderId: null,
        note: note ?? null,
      }),
    )
    return { stock }
  }

  // ---------- Production ----------

  async listProduction(status?: string) {
    const where: any = {}
    if (status && ['planned', 'in_work', 'ready'].includes(status)) {
      where.status = status
    }
    const tasks = await this.productionRepository.find({ where, order: { createdAt: 'DESC' } })
    return { tasks }
  }

  async setProductionStatus(id: number, status: ProductionStatus) {
    if (!['planned', 'in_work', 'ready'].includes(status)) {
      throw new BadRequestException('Invalid status')
    }
    const task = await this.productionRepository.findOne({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    task.status = status
    await this.productionRepository.save(task)
    return { task }
  }

  async moveProductionToStock(id: number, warehouse = 'MSK') {
    const task = await this.productionRepository.findOne({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.status !== 'ready') {
      throw new BadRequestException('Task must be ready')
    }
    if (task.movedToStockAt) {
      return { task }
    }

    const wh = String(warehouse || 'MSK').trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const product = await this.productsRepository.findOne({ where: { id: task.productId } })
    if (!product) throw new NotFoundException('Product not found')

    let stock = await this.stocksRepository.findOne({
      where: { warehouse: wh, product: { id: task.productId } } as any,
    })
    if (!stock) {
      stock = this.stocksRepository.create({ warehouse: wh, product, qty: 0, reservedQty: 0, onOrderQty: 0 })
    }
    stock.qty += task.qty
    stock.onOrderQty = Math.max(0, (stock.onOrderQty || 0) - task.qty)
    await this.stocksRepository.save(stock)
    await this.movementsRepository.save(
      this.movementsRepository.create({
        warehouse: wh,
        productId: task.productId,
        type: 'in',
        qty: task.qty,
        orderId: task.orderId,
        note: 'production -> stock',
      }),
    )

    task.movedToStockAt = new Date()
    await this.productionRepository.save(task)
    return { task, stock }
  }

  // ---------- Internal: reserve & ship ----------

  private async reserveForOrder(order: Order, warehouse: string) {
    const wh = String(warehouse || 'MSK').trim().toUpperCase()

    for (const item of order.items || []) {
      const productId = Number(item.productId)
      const need = Math.max(0, Number(item.quantity) || 0)
      if (!productId || !need) continue

      const product = await this.productsRepository.findOne({ where: { id: productId } })
      if (!product) continue

      let stock = await this.stocksRepository.findOne({
        where: { warehouse: wh, product: { id: productId } } as any,
      })
      if (!stock) {
        stock = this.stocksRepository.create({ warehouse: wh, product, qty: 0, reservedQty: 0, onOrderQty: 0 })
      }

      const canReserve = Math.min(stock.qty, need)
      if (canReserve > 0) {
        stock.qty -= canReserve
        stock.reservedQty = (stock.reservedQty || 0) + canReserve
        await this.stocksRepository.save(stock)
        await this.movementsRepository.save(
          this.movementsRepository.create({
            warehouse: wh,
            productId,
            type: 'reserve',
            qty: canReserve,
            orderId: order.id,
            note: null,
          }),
        )
      }

      const missing = need - canReserve
      if (missing > 0) {
        // под заказ/производство
        stock.onOrderQty = (stock.onOrderQty || 0) + missing
        await this.stocksRepository.save(stock)
        await this.ensureProductionTask(order.id, productId, missing)
      }
    }
  }

  private async ensureProductionTask(orderId: number, productId: number, qty: number) {
    // если уже есть задача для этого заказа+товара в planned/in_work/ready без movedToStockAt — не плодим
    const existing = await this.productionRepository.findOne({
      where: { orderId, productId, movedToStockAt: null } as any,
      order: { id: 'DESC' },
    })
    if (existing) {
      existing.qty += qty
      return this.productionRepository.save(existing)
    }
    const task = this.productionRepository.create({
      orderId,
      productId,
      qty,
      status: 'planned',
      movedToStockAt: null,
    })
    return this.productionRepository.save(task)
  }

  private async shipOrder(order: Order, warehouse: string) {
    const wh = String(warehouse || 'MSK').trim().toUpperCase()

    for (const item of order.items || []) {
      const productId = Number(item.productId)
      const need = Math.max(0, Number(item.quantity) || 0)
      if (!productId || !need) continue

      let stock = await this.stocksRepository.findOne({
        where: { warehouse: wh, product: { id: productId } } as any,
      })
      if (!stock) {
        throw new BadRequestException('Not reserved')
      }

      if ((stock.reservedQty || 0) < need) {
        throw new BadRequestException('Not enough reserved stock to ship')
      }

      stock.reservedQty -= need
      await this.stocksRepository.save(stock)
      await this.movementsRepository.save(
        this.movementsRepository.create({
          warehouse: wh,
          productId,
          type: 'out',
          qty: need,
          orderId: order.id,
          note: null,
        }),
      )
    }
  }
}
