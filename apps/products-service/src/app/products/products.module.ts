// apps/products-service/src/app/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import {HttpModule} from "@nestjs/axios";
import {PrismaModule} from "../prisma/prisma.module";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule, // <- dodaj tutaj
  ],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, PrismaService],
  exports: [ProductsService],
})
export class ProductsModule {}
