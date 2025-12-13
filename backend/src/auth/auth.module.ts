import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    forwardRef(() => UsersModule), // <--- важно
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev_jwt_secret_change_me',
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
