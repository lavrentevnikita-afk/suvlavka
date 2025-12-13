import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { LoginDto, RegisterDto } from './dto'
import { User } from '../users/user.entity'

interface JwtPayload {
  sub: number
  email: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  private buildToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    }

    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    }
  }

  async register(dto: RegisterDto) {
    // Нормализуем email, чтобы логин/регистрация не ломались из-за регистра/пробелов
    const email = dto.email.trim().toLowerCase()

    const existing = await this.usersService.findByEmail(email)
    if (existing) {
      throw new BadRequestException('Пользователь с таким email уже существует')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)

    const user = await this.usersService.create({
      name: dto.name,
      email,
      passwordHash,
    })

    return this.buildToken(user)
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase()

    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    return this.buildToken(user)
  }

  async validateUserById(id: number): Promise<User | null> {
    return this.usersService.findById(id)
  }
}
