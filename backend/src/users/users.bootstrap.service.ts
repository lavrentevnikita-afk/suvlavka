import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './user.entity'

// Создаём сервисные аккаунты при запуске (dev-friendly)
@Injectable()
export class UsersBootstrapService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.ensureManager()
  }

  private async ensureManager() {
    const email = (process.env.MANAGER_EMAIL || 'manager@souvenir.local').trim().toLowerCase()
    const password = process.env.MANAGER_PASSWORD || 'Manager123!'

    const existing = await this.userRepo.findOne({ where: { email } })
    if (existing) {
      if (existing.role !== 'manager') {
        existing.role = 'manager'
        await this.userRepo.save(existing)
      }
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const manager = this.userRepo.create({
      name: 'Менеджер',
      email,
      passwordHash,
      role: 'manager',
    })
    await this.userRepo.save(manager)
  }
}
