import { IsBooleanString, IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

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
}
