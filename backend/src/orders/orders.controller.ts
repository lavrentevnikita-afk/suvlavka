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

  // создание заказа
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto)
  }

  // Мои заказы (по email из токена)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Req() req: any) {
    const email: string = req.user.email
    const orders = await this.ordersService.getForEmail(email)
    return { orders }
  }

  // один заказ по id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.getOne(id)
    return { order }
  }
}
