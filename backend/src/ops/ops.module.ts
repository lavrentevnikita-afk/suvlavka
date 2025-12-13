import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from '../orders/order.entity'
import { Stock } from '../b2b/stock.entity'
import { Product } from '../catalog/product.entity'
import { OpsController } from './ops.controller'
import { OpsService } from './ops.service'
import { Warehouse } from './warehouse.entity'
import { StockMovement } from './stock-movement.entity'
import { ProductionTask } from './production-task.entity'
import { OrderComment } from './order-comment.entity'
import { Shipment } from './shipment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Stock,
      Product,
      Warehouse,
      StockMovement,
      ProductionTask,
      OrderComment,
      Shipment,
    ]),
  ],
  controllers: [OpsController],
  providers: [OpsService],
  exports: [OpsService],
})
export class OpsModule {}
