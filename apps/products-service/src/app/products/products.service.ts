import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  productsClient: any;
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(ProductsService.name);

  async findAll(): Promise<Product[]> {
    this.logger.log('Fetching all products');
    return this.prisma.product.findMany();
  }

  async findOne(id: number): Promise<Product> {
    this.logger.log(`Fetching product with ID: ${id}`);
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    this.logger.log(`Creating new product: ${data.name}`);
    const product = await this.prisma.product.create({ data });
    this.logger.log(`Product created successfully with ID: ${product.id}`);
    return product;
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    try {
      this.logger.log(`Updating product with ID: ${id}`);
      const updatedProduct = await this.prisma.product.update({ where: { id }, data });
      this.logger.log(`Product ${id} updated successfully`);
      return updatedProduct;
    } catch (error:any) {
      this.logger.error(`Failed to update product ${id}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Product> {
    try {
      this.logger.log(`Deleting product with ID: ${id}`);
      const deletedProduct = await this.prisma.product.delete({ where: { id } });
      this.logger.log(`Product ${id} deleted successfully`);
      return deletedProduct;
    } catch (error : any) {
      this.logger.error(`Failed to delete product ${id}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async checkAvailability(id: number, requestedQuantity: number): Promise<boolean> {
    const product = await this.findOne(id);
    this.logger.debug(`Checking availability for product ${id}, requested: ${requestedQuantity}, available: ${product.quantity}`);
    return product.quantity >= requestedQuantity;
  }

  async decreaseQuantity(id: number, quantity: number): Promise<Product> {
    this.logger.log(`Decreasing quantity for product ${id} by ${quantity}`);
    const product = await this.findOne(id);

    if (product.quantity < quantity) {
      this.logger.warn(`Insufficient quantity for product ${id}. Available: ${product.quantity}, requested: ${quantity}`);
      throw new BadRequestException('Insufficient quantity');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { quantity: { decrement: quantity } },
    });
    this.logger.log(`Product ${id} quantity decreased by ${quantity}`);
    return updatedProduct;
  }

  // HEALTH FUNCTION
  async getHealthProducts(): Promise<{ service: string; status: string; timestamp: string }> {
    this.logger.log('Checking health of products-service');
    try {
      await this.prisma.product.findMany({ take: 1 }); // prosty test bazy
      return {
        service: 'products-service',
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed for products-service', error);
      return {
        service: 'products-service',
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
