import {
  IsBoolean,
  IsBooleanString,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

// ----------------------
// Public catalog DTOs
// ----------------------

export class GetProductsQueryDto {
  @IsString()
  @IsOptional()
  category?: string

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number

  @IsOptional()
  @IsBooleanString()
  inStock?: string

  @IsOptional()
  @IsString()
  sort?: 'popularity' | 'price' | 'new'

  @IsOptional()
  @IsString()
  city?: string

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number
}

export class SearchQueryDto {
  @IsString()
  query!: string

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number

  @IsOptional()
  @IsString()
  city?: string
}

// ----------------------
// Admin catalog DTOs (manager)
// ----------------------

export class CreateCategoryDto {
  @IsString()
  slug!: string

  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string
}

export class CreateProductDto {
  @IsString()
  slug!: string

  @IsString()
  name!: string

  @IsString()
  article!: string

  // numeric string: keep compatible with existing Product.price string
  @IsNumberString()
  price!: string

  @IsInt()
  @Type(() => Number)
  categoryId!: number

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  specs?: Record<string, string>

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  article?: string

  @IsOptional()
  @IsNumberString()
  price?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  specs?: Record<string, string>

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean
}

export class AdminProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number

  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number
}

export class UpdateImageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number
}
