// src/products/products.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(data: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    try {
      return await this.prisma.product.update({ where: { id }, data });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Product> {
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch (error: any) {
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
      throw new BadRequestException('Insufficient quantity');
    }

    return this.prisma.product.update({
      where: { id },
      data: { quantity: { decrement: quantity } },
    });
  }
}
