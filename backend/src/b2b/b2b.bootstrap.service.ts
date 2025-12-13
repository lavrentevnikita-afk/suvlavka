import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'
import { StoreProfile } from './store-profile.entity'

/**
 * Небольшой bootstrap-хак, чтобы в dev/демо окружении можно было
 * быстро промотать конкретный аккаунт в магазин.
 *
 * Важно: если такого пользователя нет — ничего не делаем.
 */
@Injectable()
export class B2bBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(B2bBootstrapService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(StoreProfile)
    private readonly storeRepo: Repository<StoreProfile>,
  ) {}

  async onModuleInit() {
    const targetEmail = 'lavrentev.nikita.personal@gmail.com'
      .trim()
      .toLowerCase()

    try {
      const user = await this.userRepo.findOne({ where: { email: targetEmail } })
      if (!user) return

      // 1) роль store
      if (user.role !== 'store') {
        user.role = 'store'
        await this.userRepo.save(user)
        this.logger.log(`Promoted user ${targetEmail} to role=store`)
      }

      // 2) профиль магазина
      let profile = await this.storeRepo.findOne({
        where: { user: { id: user.id } },
      })

      if (!profile) {
        profile = this.storeRepo.create({
          user,
          status: 'active',
          companyName: 'Магазин Lavrentev',
          inn: null,
          kpp: null,
          ogrn: null,
          contacts: null,
          priceGroupId: null,
        })
        await this.storeRepo.save(profile)
        this.logger.log(`Created active store profile for ${targetEmail}`)
      } else if (profile.status !== 'active') {
        profile.status = 'active'
        profile.updatedAt = new Date()
        await this.storeRepo.save(profile)
        this.logger.log(`Activated store profile for ${targetEmail}`)
      }
    } catch (e: any) {
      this.logger.warn(`Bootstrap store promotion failed: ${e?.message ?? e}`)
    }
  }
}
