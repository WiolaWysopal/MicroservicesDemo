// apps/products-service/src/app/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super(); // teraz Prisma weźmie DATABASE_URL z .env
  }

  async onModuleInit() {
    await this.$connect();

    // Tymczasowe dane testowe
    const count = await this.product.count();
    if (count === 0) {
      await this.product.createMany({
        data: [
          { name: 'Produkt A', price: 10.5, quantity: 100, description: 'Pierwszy produkt' },
          { name: 'Produkt B', price: 25.0, quantity: 50, description: 'Drugi produkt' },
          { name: 'Produkt C', price: 7.99, quantity: 200 }
        ],
      });
      console.log('Seed data inserted via PrismaService (products-service > src > app > prisma > prisma.service.ts)');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}