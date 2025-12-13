import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev_jwt_secret_change_me',
    })
  }

  async validate(payload: any) {
    // То, что вернётся тут, будет в req.user
    // Нам нужен полный пользователь (role, name, phone...), а не только payload.
    const id = Number(payload?.sub)
    if (!id) return null

    const user = await this.authService.validateUserById(id)
    return user
  }
}
