import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  productsClient: any;
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  // FIND ALL
  async findAll(): Promise<Product[]> {
    this.logger.log('Fetching all products');
    try {
      const products = await this.prisma.product.findMany();
      this.logger.debug(`Fetched ${products.length} products`);
      return products;
    } catch (error) {
      this.logger.error('Failed to fetch products', error.stack);
      throw error;
    }
  }

  // FIND ONE
  async findOne(id: number): Promise<Product> {
    this.logger.log(`Fetching product with ID: ${id}`);
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) {
        this.logger.warn(`Product with ID ${id} not found`);
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      this.logger.error(`Error fetching product with ID ${id}`, error.stack);
      throw error;
    }
  }

  // CREATE
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    this.logger.log(`Creating new product: ${data.name}`);
    try {
      const product = await this.prisma.product.create({ data });
      this.logger.log(`Product created with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error('Failed to create product', error.stack);
      throw error;
    }
  }

  // UPDATE
  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    this.logger.log(`Updating product with ID: ${id}`);
    try {
      const updated = await this.prisma.product.update({ where: { id }, data });
      this.logger.log(`Product ${id} updated successfully`);
      return updated;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`Product with ID ${id} not found`);
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      this.logger.error(`Failed to update product ${id}`, error.stack);
      throw error;
    }
  }

  // DELETE
  async delete(id: number): Promise<Product> {
    this.logger.log(`Deleting product with ID: ${id}`);
    try {
      const deleted = await this.prisma.product.delete({ where: { id } });
      this.logger.log(`Product ${id} deleted successfully`);
      return deleted;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`Product with ID ${id} not found`);
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      this.logger.error(`Failed to delete product ${id}`, error.stack);
      throw error;
    }
  }

  // CHECK AVAILABILITY
  async checkAvailability(id: number, requestedQuantity: number): Promise<boolean> {
    this.logger.log(`Checking availability for product ${id}, quantity requested: ${requestedQuantity}`);
    try {
      const product = await this.findOne(id);
      const available = product.quantity >= requestedQuantity;
      this.logger.debug(`Product ${id} availability: ${available}`);
      return available;
    } catch (error) {
      this.logger.error(`Error checking availability for product ${id}`, error.stack);
      throw error;
    }
  }

  // DECREASE QUANTITY
  async decreaseQuantity(id: number, quantity: number): Promise<Product> {
    this.logger.log(`Decreasing quantity for product ${id} by ${quantity}`);
    try {
      const product = await this.findOne(id);
      if (product.quantity < quantity) {
        this.logger.warn(`Insufficient quantity for product ${id}`);
        throw new Error('Insufficient quantity');
      }
      const updated = await this.prisma.product.update({
        where: { id },
        data: { quantity: { decrement: quantity } },
      });
      this.logger.log(`Product ${id} quantity decreased successfully`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to decrease quantity for product ${id}`, error.stack);
      throw error;
    }
  }

  // HEALTH FUNCTION
  async getHealthProducts(): Promise<{ service: string; status: string; timestamp: string }> {
    this.logger.log('Checking health of products-service');
    try {
      await this.prisma.product.findMany({ take: 1 }); // prosty test bazy
      this.logger.log('Products-service health OK');
      return {
        service: 'products-service',
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Products-service health ERROR', error.stack);
      return {
        service: 'products-service',
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
