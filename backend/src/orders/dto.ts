import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateOrderItemDto {
  @IsInt()
  @Type(() => Number)
  productId!: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number
}

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  customerName!: string  // <-- ИМЯ КЛИЕНТА ТУТ

  @IsOptional()
  @IsEmail()
  email?: string

  @IsString()
  @MinLength(5)
  address!: string

  @IsOptional()
  @IsString()
  comment?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[]
}
