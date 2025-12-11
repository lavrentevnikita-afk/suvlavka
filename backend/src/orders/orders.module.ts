import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from './order.entity'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { AuthModule } from '../auth/auth.module'
import { Product } from '../catalog/product.entity' // 👈 добавили

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product]), // 👈 тут тоже добавили Product
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
