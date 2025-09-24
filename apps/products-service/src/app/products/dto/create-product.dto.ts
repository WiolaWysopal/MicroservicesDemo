// src/products/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min, IsInt } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0, { message: 'Price must be a non-negative number' })
  price!: number;

  @IsInt()
  @Min(0, { message: 'Quantity must be a non-negative integer' })
  quantity!: number;
}
