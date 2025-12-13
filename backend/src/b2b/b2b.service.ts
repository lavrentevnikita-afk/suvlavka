import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsersService } from '../users/users.service'
import { StoreProfile } from './store-profile.entity'
import { User } from '../users/user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class B2bService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(StoreProfile)
    private readonly storeRepo: Repository<StoreProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
        inn: profile.inn,
        kpp: profile.kpp,
        ogrn: profile.ogrn,
        contacts: profile.contacts,
        priceGroupId: profile.priceGroupId,
      },
    }
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
}
