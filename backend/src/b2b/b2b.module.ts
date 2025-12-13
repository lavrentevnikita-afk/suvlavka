import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
import { B2bController } from './b2b.controller'
import { B2bService } from './b2b.service'
import { StoreProfile } from './store-profile.entity'
import { User } from '../users/user.entity'
import { B2bBootstrapService } from './b2b.bootstrap.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreProfile, User]),
    UsersModule,
    AuthModule,
  ],
  controllers: [B2bController],
  providers: [B2bService, B2bBootstrapService],
})
export class B2bModule {}
