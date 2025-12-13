import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CatalogService } from './catalog.service'
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
  AdminProductsQueryDto,
  UpdateImageDto,
} from './dto'

@Controller('api/admin/catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
export class AdminCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // Categories
  @Get('categories')
  listCategories() {
    return this.catalogService.getCategories()
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto)
  }

  @Patch('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, dto)
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteCategory(id)
  }

  // Products
  @Get('products')
  listProducts(@Query() query: AdminProductsQueryDto) {
    return this.catalogService.adminListProducts(query)
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto)
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto)
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteProduct(id)
  }

  // Images (Object Storage)
  @Post('products/:id/images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )

  uploadProductImage(
    @Param('id', ParseIntPipe) productId: number,
    @UploadedFile() file?: any,
  ) {
    return this.catalogService.uploadProductImage(productId, file)
  }

  @Patch('images/:id')
  updateImage(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateImageDto) {
    return this.catalogService.updateImage(id, dto)
  }

  @Delete('images/:id')
  deleteImage(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteImage(id)
  }
}
