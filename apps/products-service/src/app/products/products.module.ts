import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // <-- WAŻNE
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Ważne dla przyszłej integracji!
})
export class ProductsModule {}