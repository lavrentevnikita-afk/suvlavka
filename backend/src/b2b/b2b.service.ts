import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { UsersService } from '../users/users.service'
import { StoreProfile } from './store-profile.entity'
import { User } from '../users/user.entity'
import * as bcrypt from 'bcrypt'
import { Product } from '../catalog/product.entity'
import { Stock } from './stock.entity'

@Injectable()
export class B2bService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(StoreProfile)
    private readonly storeRepo: Repository<StoreProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
  ) {}

  async registerStore(dto: {
    name: string
    email: string
    password: string
    companyName: string
    inn?: string
    kpp?: string
    ogrn?: string
    contacts?: Record<string, any>
    displayName?: string
    logoUrl?: string
    address?: string
    city?: string
    phone?: string
    website?: string
  }) {
    const email = dto.email.trim().toLowerCase()
    const existing = await this.usersService.findByEmail(email)
    if (existing) throw new BadRequestException('Пользователь с таким email уже существует')

    const passwordHash = await bcrypt.hash(dto.password, 10)

    const user = await this.userRepo.save(
      this.userRepo.create({
        name: dto.name,
        email,
        passwordHash,
        role: 'store',
      })
    )

    const profile = await this.storeRepo.save(
      this.storeRepo.create({
        user,
        status: 'pending',
        companyName: dto.companyName,
        displayName: dto.displayName ?? dto.companyName ?? null,
        logoUrl: dto.logoUrl ?? null,
        address: dto.address ?? null,
        city: dto.city ?? null,
        phone: dto.phone ?? null,
        website: dto.website ?? null,
        inn: dto.inn ?? null,
        kpp: dto.kpp ?? null,
        ogrn: dto.ogrn ?? null,
        contacts: dto.contacts ?? null,
      })
    )

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      storeProfile: { id: profile.id, status: profile.status, companyName: profile.companyName },
    }
  }

  async getMe(user: User) {
    if (user.role !== 'store') throw new ForbiddenException('Доступ только для магазинов')

    const profile = await this.storeRepo.findOne({ where: { user: { id: user.id } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      storeProfile: {
        id: profile.id,
        status: profile.status,
        companyName: profile.companyName,
        displayName: profile.displayName,
        logoUrl: profile.logoUrl,
        address: profile.address,
        city: profile.city,
        phone: profile.phone,
        website: profile.website,
        inn: profile.inn,
        kpp: profile.kpp,
        ogrn: profile.ogrn,
        contacts: profile.contacts,
        priceGroupId: profile.priceGroupId,
      },
    }
  }

  async updateProfile(user: User, dto: Partial<{
    companyName: string
    displayName: string
    logoUrl: string
    address: string
    city: string
    phone: string
    website: string
    inn: string
    kpp: string
    ogrn: string
    contacts: Record<string, any>
    priceGroupId: number | null
  }>) {
    if (user.role !== 'store') throw new ForbiddenException('Доступ только для магазинов')

    const profile = await this.storeRepo.findOne({ where: { user: { id: user.id } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')

    // обновляем только разрешённые поля
    if (typeof dto.companyName === 'string') profile.companyName = dto.companyName
    if (typeof dto.displayName === 'string') profile.displayName = dto.displayName
    if (typeof dto.logoUrl === 'string' || dto.logoUrl === null) profile.logoUrl = (dto.logoUrl as any) ?? null
    if (typeof dto.address === 'string' || dto.address === null) profile.address = (dto.address as any) ?? null
    if (typeof dto.city === 'string' || dto.city === null) profile.city = (dto.city as any) ?? null
    if (typeof dto.phone === 'string' || dto.phone === null) profile.phone = (dto.phone as any) ?? null
    if (typeof dto.website === 'string' || dto.website === null) profile.website = (dto.website as any) ?? null
    if (typeof dto.inn === 'string' || dto.inn === null) profile.inn = (dto.inn as any) ?? null
    if (typeof dto.kpp === 'string' || dto.kpp === null) profile.kpp = (dto.kpp as any) ?? null
    if (typeof dto.ogrn === 'string' || dto.ogrn === null) profile.ogrn = (dto.ogrn as any) ?? null
    if (dto.contacts !== undefined) profile.contacts = dto.contacts ?? null
    if (dto.priceGroupId !== undefined) profile.priceGroupId = (dto.priceGroupId as any) ?? null

    profile.updatedAt = new Date()
    await this.storeRepo.save(profile)
    return this.getMe(user)
  }

  async activateStore(manager: User, userId: number) {
    if (manager.role !== 'manager') throw new ForbiddenException('Доступ только для менеджера')

    const profile = await this.storeRepo.findOne({ where: { user: { id: userId } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')

    profile.status = 'active'
    profile.updatedAt = new Date()
    await this.storeRepo.save(profile)

    return { ok: true }
  }

  async listStoresForManager(manager: User, status?: string) {
    if (manager.role !== 'manager') throw new ForbiddenException('Доступ только для менеджера')

    const qb = this.storeRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.user', 'u')
      .orderBy('sp.created_at', 'DESC')

    if (status) qb.where('sp.status = :status', { status })

    const rows = await qb.getMany()
    return {
      stores: rows.map((p) => ({
        id: p.id,
        status: p.status,
        companyName: p.companyName,
        displayName: p.displayName,
        logoUrl: p.logoUrl,
        address: p.address,
        city: p.city,
        phone: p.phone,
        website: p.website,
        inn: p.inn,
        kpp: p.kpp,
        ogrn: p.ogrn,
        priceGroupId: p.priceGroupId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        user: { id: p.user.id, name: p.user.name, email: p.user.email, role: p.user.role },
      })),
    }
  }

  /**
   * Остатки по артикулам (для быстрого заказа).
   * GET /api/b2b/stock?articles=SV-0001,SV-0002
   */
  async getStock(user: User, articles?: string) {
    if (user.role !== 'store' && user.role !== 'manager') {
      throw new ForbiddenException('Недостаточно прав')
    }

    const list = (articles ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (!list.length) return { items: [] }

    const products = await this.productRepo.find({ where: { article: In(list) } })
    const byArticle = new Map(products.map((p) => [p.article, p]))

    const rows = products.length
      ? await this.stockRepo.find({
          where: { product: { id: In(products.map((p) => p.id)) } },
        })
      : []

    const out = list.map((article) => {
      const p = byArticle.get(article)
      const stocks = p ? rows.filter((r) => r.product.id === p.id) : []
      const total = stocks.reduce((sum, r) => sum + (r.qty ?? 0), 0)
      return {
        article,
        productId: p?.id ?? null,
        name: (p as any)?.name ?? null,
        total,
        byWarehouse: stocks.map((s) => ({ warehouse: s.warehouse, qty: s.qty })),
      }
    })

    return { items: out }
  }
}
