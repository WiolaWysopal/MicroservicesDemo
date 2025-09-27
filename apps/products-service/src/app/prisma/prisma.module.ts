// apps/products-service/src/app/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // opcjonalnie, aby PrismaService był dostępny wszędzie
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
