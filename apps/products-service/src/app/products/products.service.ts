// apps/products-service/src/app/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  productsClient: any;
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
    } catch (error) {
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
    } catch (error) {
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
    const product = await this.findOne(id);
    
    if (product.quantity < quantity) {
      throw new Error('Insufficient quantity');
    }
    
    return this.prisma.product.update({
      where: { id },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  // HEALTH FUNCTION
  async getHealthProducts(): Promise<{ service: string; status: string; timestamp: string }> {
    try {
      await this.prisma.product.findMany({ take: 1 }); // prosty test bazy
      return {
        service: 'products-service',
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'products-service',
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}