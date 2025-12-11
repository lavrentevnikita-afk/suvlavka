import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('/api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    const user = (req as any).user
    // если пользователь авторизован и у него есть email — перезатираем email из формы
    const email = user?.email ?? dto.email

    const order = await this.ordersService.create({
      ...dto,
      email,
    })
    return { order }
  }

  // Личный кабинет — заказы текущего пользователя по email
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Req() req: any) {
    const email: string = req.user.email
    const orders = await this.ordersService.getForEmail(email)
    return { orders }
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.getOne(id)
    return { order }
  }
}
