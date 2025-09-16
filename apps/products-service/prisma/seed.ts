// apps/products-service/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Wyczyść istniejące dane
  await prisma.product.deleteMany();

  // Dodaj przykładowe produkty
  await prisma.product.createMany({
    data: [
      { name: 'Laptop Dell XPS 13', price: 4500, quantity: 10, description: 'Ultrabook premium' },
      { name: 'iPhone 15 Pro', price: 5999, quantity: 25, description: 'Najnowszy smartphone Apple' },
      { name: 'Sony WH-1000XM5', price: 1599, quantity: 50, description: 'Słuchawki z ANC' },
      { name: 'iPad Air', price: 2999, quantity: 15, description: 'Tablet 10.9\"' },
      { name: 'Samsung Galaxy Watch', price: 1299, quantity: 30, description: 'Smartwatch' },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
