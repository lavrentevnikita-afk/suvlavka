import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CatalogController } from './catalog.controller'
import { AdminCatalogController } from './admin-catalog.controller'
import { CatalogService } from './catalog.service'
import { Category } from './category.entity'
import { Product } from './product.entity'
import { ProductImage } from './product-image.entity'
import { Stock } from '../b2b/stock.entity'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, ProductImage, Stock]), AuthModule],
  controllers: [CatalogController, AdminCatalogController],
  providers: [CatalogService],
  exports: [CatalogService]
})
export class CatalogModule {}
