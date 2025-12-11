import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common'
import { CatalogService } from './catalog.service'
import { GetProductsQueryDto, SearchQueryDto } from './dto'

@Controller('api/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  getCategories() {
    return this.catalogService.getCategories()
  }

  @Get('products')
  getProducts(@Query() query: GetProductsQueryDto) {
    return this.catalogService.getProducts(query)
  }

  @Get('products/:id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getProduct(id)
  }

  @Get('search')
  search(@Query() query: SearchQueryDto) {
    return this.catalogService.search(query)
  }
}
