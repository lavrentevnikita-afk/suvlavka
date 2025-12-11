import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto'

@Controller('/api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(dto)
    return { order }
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.getOne(id)
    return { order }
  }
}
