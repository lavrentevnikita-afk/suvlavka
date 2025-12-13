import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator'

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string
}
