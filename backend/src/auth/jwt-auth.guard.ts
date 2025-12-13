import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

interface JwtPayload {
  sub: number
  email: string
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const header =
      (request.headers['authorization'] ||
        request.headers['Authorization']) ?? ''

    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Необходима авторизация')
    }

    const token = header.slice(7)

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token)

      const user = await this.authService.validateUserById(payload.sub)
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден')
      }

      ;(request as any).user = user
      return true
    } catch {
      throw new UnauthorizedException(
        'Сессия недействительна, войдите заново'
      )
    }
  }
}
