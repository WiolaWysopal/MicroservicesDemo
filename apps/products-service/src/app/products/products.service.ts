// apps/products-service/src/app/products/products.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data,
      });
    } catch (error : any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Product> {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error : any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async checkAvailability(id: number, requestedQuantity: number): Promise<boolean> {
    const product = await this.findOne(id);
    return product.quantity >= requestedQuantity;
  }

  async decreaseQuantity(id: number, quantity: number): Promise<Product> {
    // atomic check-and-decrement
    const result = await this.prisma.product.updateMany({
      where: { id, quantity: { gte: quantity } }, // tylko jeśli ilość >= requested
      data: { quantity: { decrement: quantity } },
    });

    if (result.count === 0) {
      // oznacza: nie znaleziono produktu z wystarczającą ilością
      // może być brak produktu albo za mało sztuk
      const exists = await this.prisma.product.findUnique({ where: { id } });
      if (!exists) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw new ConflictException('Insufficient quantity');
    }

    return this.prisma.product.findUniqueOrThrow({ where: { id } });
  }
}