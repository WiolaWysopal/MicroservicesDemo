// apps/orders-service/src/app/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsClientService } from '../services/products-client.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ProductsClientService, PrismaService],
})
export class OrdersModule {}