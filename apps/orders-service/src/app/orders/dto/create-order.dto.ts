// apps/orders-service/src/app/orders/dto/create-order.dto.ts
import { IsString, IsNotEmpty, ValidateNested, IsArray, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNotEmpty({ message: 'Product ID required' })
  productId!: number;

  @IsNotEmpty({ message: 'Amount is required' })
  @Min(1, { message: 'Amount has to be at least 1' })
  quantity!: number;
}

export class CreateOrderDto {
  @IsString({ message: 'Customer name has to be a string' })
  @IsNotEmpty({ message: 'Customer name is required' })
  customerName!: string;

  @IsArray({ message: 'Items has to be an array' })
  @ArrayMinSize(1, { message: 'You has to add at least one product' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
