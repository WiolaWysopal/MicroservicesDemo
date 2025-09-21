// apps/orders-service/src/app/orders/dto/update-order-status.dto.ts
import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'confirmed', 'cancelled'])
  status!: 'pending' | 'confirmed' | 'cancelled';
}