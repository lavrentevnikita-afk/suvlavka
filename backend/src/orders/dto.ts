import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class OrderItemDto {
  @IsInt()
  @IsPositive()
  productId!: number

  @IsInt()
  @IsPositive()
  quantity!: number
}

export class CreateOrderDto {
  @IsNotEmpty()
  @MinLength(2)
  customerName!: string

  @IsNotEmpty()
  phone!: string

  @IsOptional()
  @IsEmail()
  email: string

  @IsNotEmpty()
  address!: string

  @IsOptional()
  comment?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[]
}
