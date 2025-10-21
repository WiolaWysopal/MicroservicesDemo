// apps/orders-service/src/app/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // eksportujemy, żeby inne moduły mogły używać
})
export class PrismaModule {}
