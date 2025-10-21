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
    this.logger.log(`Creating new order for customer: ${createOrderDto.customerName}`);
    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    let totalAmount = 0;

    // Walidacja i pobranie informacji o produktach
    for (const item of createOrderDto.items) {
      // Sprawdź czy produkt istnieje
      const product = await this.productsClient.getProduct(item.productId);
      this.logger.debug(`Fetched product ${product.name} with ID ${item.productId}`);

      // Sprawdź dostępność
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

      // Przygotuj pozycję zamówienia
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    // Utwórz zamówienie w bazie danych
    const order = await this.prisma.order.create({
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
    this.logger.log(`Order created successfully with ID: ${order.id}`);

    // Zmniejsz stan magazynowy produktów
    for (const item of createOrderDto.items) {
       await this.productsClient.decreaseQuantity(item.productId, item.quantity);
     }

    return order;
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
      return await this.prisma.order.update({
        where: { id },
        data: { status },
        include: {
          items: true,
        },
      });
      this.logger.log(`Order ${id} status updated successfully`);
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
      this.logger.log(`Order ${id} status updated successfully`);
      return await this.prisma.order.delete({
        where: { id },
        include: {
          items: true,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to update status for order ${id}`, error.stack);
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
