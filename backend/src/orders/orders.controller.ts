import {
  Body,
  Controller,
  Get,
  NotFoundException,
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
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    // Привязываем заказ к email из токена, чтобы он гарантированно отображался в кабинете
    const emailFromToken: string | undefined = req?.user?.email
    const normalizedEmail = emailFromToken?.trim().toLowerCase()

    return this.ordersService.create({
      ...dto,
      email: normalizedEmail ?? dto.email,
    })
  }

  // Мои заказы (по email из токена)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Req() req: any) {
    const email: string = req.user.email
    const orders = await this.ordersService.getForEmail(email)
    return { orders }
  }

  // Админ: все заказы (для менеджера)
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async adminAll(@Req() req: any) {
    if (req?.user?.role !== 'manager') {
      throw new NotFoundException('Not found')
    }
    const orders = await this.ordersService.findAll()
    return { orders }
  }

  // один заказ по id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const order = await this.ordersService.getOne(id)

    const tokenEmail: string | undefined = req?.user?.email
    const normalizedTokenEmail = tokenEmail?.trim().toLowerCase()

    // В MVP прячем чужие заказы (как будто не существует)
    // менеджер может смотреть всё
    if (req?.user?.role !== 'manager' && normalizedTokenEmail && order.email !== normalizedTokenEmail) {
      throw new NotFoundException('Order not found')
    }

    return { order }
  }
}
