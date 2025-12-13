import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'
import type { UserRole } from '../users/user.entity'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // Если роли не заданы — пропускаем (не ломаем существующие контроллеры)
    if (!required || required.length === 0) return true

    const req = context.switchToHttp().getRequest()
    const user = req?.user
    const role = user?.role as UserRole | undefined

    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Недостаточно прав')
    }

    return true
  }
}
