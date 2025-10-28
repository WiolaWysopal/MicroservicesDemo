// apps/products-service/src/app/products/dto/update-product.dto.ts
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Name has to be string' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price has to be a number' })
  @Min(0, { message: 'Price cannot be a negative value' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Amount has to be a number!' })
  @Min(0, { message: 'Amount cannot be a negative value' })
  quantity?: number;

  @IsOptional()
  @IsString({ message: 'Description has to be a string' })
  description?: string;
}
