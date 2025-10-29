// apps/orders-service/src/app/orders/orders.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderItem, Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsClientService } from '../services/products-client.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private prisma: PrismaService,
    private readonly productsClient: ProductsClientService
  ) {}

async create(createOrderDto: CreateOrderDto): Promise<Order> {
  this.logger.log(`Creating new order (transaction) for customer: ${createOrderDto.customerName}`);

  return await this.prisma.$transaction(async (tx) => {
    try {
      this.logger.log('🚀 Starting transaction...');

      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
      let totalAmount = 0;

      // 1️⃣ Walidacja produktów i obliczanie sumy
      for (const item of createOrderDto.items) {
        const product = await this.productsClient.getProduct(item.productId);
        this.logger.debug(`Fetched product ${product.name} with ID ${item.productId}`);

        const isAvailable = await this.productsClient.checkProductAvailability(
          item.productId,
          item.quantity
        );

        if (!isAvailable) {
          this.logger.warn(`Product ${product.name} not available in requested quantity`);
          throw new BadRequestException(
            `Product ${product.name} is not available in requested quantity`
          );
        }

        orderItems.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
        });

        totalAmount += product.price * item.quantity;
      }

      // 2️⃣ Tworzenie zamówienia i jego pozycji w ramach transakcji
      const order = await tx.order.create({
        data: {
          customerName: createOrderDto.customerName,
          totalAmount,
          status: 'confirmed',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // 3️⃣ Aktualizacja stanów magazynowych produktów
      for (const item of createOrderDto.items) {
        await this.productsClient.decreaseQuantity(item.productId, item.quantity);
      }

      this.logger.log(`✅ Transaction committed successfully. Order ID: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error('❌ Transaction failed, rolling back...', error.stack);
      throw error; // rollback następuje automatycznie przy wyjątku
    }
  });
}


  async findAll(): Promise<Order[]> {
    this.logger.log('Fetching all orders');
    return this.prisma.order.findMany({
      include: {
        items: true,
      },
    });
  }

  async findOne(id: number): Promise<Order> {
    this.logger.log(`Fetching order with ID: ${id}`);
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      this.logger.warn(`Order with ID ${id} not found`);
      throw new BadRequestException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    try {
      this.logger.log(`Updating status of order ${id} to "${status}"`);
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: { status },
        include: {
          items: true,
        },
      });
      this.logger.log(`Order ${id} status updated successfully`);
      return updatedOrder;
    } catch (error: any) {
      this.logger.error(`Failed to update status for order ${id}`, error.stack);
      if (error.code === 'P2025') {
        throw new BadRequestException(`Order with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Order> {
    try {
      this.logger.log(`Deleting order with ID: ${id}`);
      const deletedOrder = await this.prisma.order.delete({
        where: { id },
        include: {
          items: true,
        },
      });
      this.logger.log(`Order ${id} deleted successfully`);
      return deletedOrder;
    } catch (error: any) {
      this.logger.error(`Failed to delete order ${id}`, error.stack);
      if (error.code === 'P2025') {
        throw new BadRequestException(`Order with ID ${id} not found`);
      }
      throw error;
    }
  }

  // HEALTH FUNCTION
  async getHealthService(): Promise<{ service: string; status: string; timestamp: string }> {
  this.logger.log('Checking health of orders-service');
  return {
    service: 'orders-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
}
