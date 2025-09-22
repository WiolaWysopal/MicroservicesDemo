import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Invalid product ID');
    }
  }

  private validateData(data: Prisma.ProductCreateInput | Prisma.ProductUpdateInput) {
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Invalid product data');
    }
    if ('name' in data && (!data.name || typeof data.name !== 'string')) {
      throw new BadRequestException('Product name must be a non-empty string');
    }
    if ('price' in data && (typeof data.price !== 'number' || data.price < 0)) {
      throw new BadRequestException('Product price must be a non-negative number');
    }
    if ('quantity' in data && (!Number.isInteger(data.quantity) || data.quantity < 0)) {
      throw new BadRequestException('Product quantity must be a non-negative integer');
    }
  }

  private validateQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new BadRequestException('Requested quantity must be a non-negative integer');
    }
  }

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }

  async findOne(id: number): Promise<Product> {
    this.validateId(id);
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    this.validateData(data);
    return this.prisma.product.create({ data });
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    this.validateId(id);
    this.validateData(data);

    try {
      return await this.prisma.product.update({ where: { id }, data });
    } catch (error:any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Product> {
    this.validateId(id);
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch (error : any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async checkAvailability(id: number, requestedQuantity: number): Promise<boolean> {
    this.validateId(id);
    this.validateQuantity(requestedQuantity);
    const product = await this.findOne(id);
    return product.quantity >= requestedQuantity;
  }

  async decreaseQuantity(id: number, quantity: number): Promise<Product> {
    this.validateId(id);
    this.validateQuantity(quantity);

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
