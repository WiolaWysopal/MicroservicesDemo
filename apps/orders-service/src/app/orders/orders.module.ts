// apps/orders-service/src/app/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsClientService } from '../services/products-client.service';
import { PrismaModule } from '../prisma/prisma.module'; // <- dodaj import

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule, // <- dodaj tutaj
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ProductsClientService],
})
export class OrdersModule {}
