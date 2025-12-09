import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth()
  }

  @Get('api/catalog/categories')
  getCategories() {
    return this.appService.getCategories()
  }

  @Get('api/catalog/products')
  getProducts(@Query('category') category?: string) {
    return this.appService.getProducts(category)
  }

  @Get('api/catalog/products/:id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.appService.getProduct(id)
  }
}
