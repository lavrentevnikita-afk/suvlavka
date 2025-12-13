import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { B2bService } from './b2b.service'

@Controller('/api/b2b')
export class B2bController {
  constructor(private readonly b2bService: B2bService) {}

  // регистрация магазина (НЕ трогаем /api/auth/register)
  @Post('register')
  register(@Body() dto: any) {
    return this.b2bService.registerStore(dto)
  }

  // профиль магазина
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.b2bService.getMe(req.user)
  }

  // обновление настроек магазина
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Req() req: any, @Body() dto: any) {
    return this.b2bService.updateProfile(req.user, dto)
  }

  // список заявок/магазинов (для менеджера)
  @UseGuards(JwtAuthGuard)
  @Get('admin/stores')
  adminStores(@Req() req: any, @Query('status') status?: string) {
    return this.b2bService.listStoresForManager(req.user, status)
  }

  // активация менеджером
  @UseGuards(JwtAuthGuard)
  @Post('activate/:userId')
  activate(@Req() req: any, @Param('userId') userId: string) {
    return this.b2bService.activateStore(req.user, Number(userId))
  }
}
