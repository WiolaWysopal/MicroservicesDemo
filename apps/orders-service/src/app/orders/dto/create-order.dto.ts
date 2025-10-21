import { IsNotEmpty, IsString, ValidateNested, ArrayMinSize, IsInt, Min, IsDefined, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
class OrderItemDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  items!: OrderItemDto[];
}
