// apps/orders-service/src/app/orders/orders.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderItem, Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsClientService } from '../services/products-client.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private readonly productsClient: ProductsClientService
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    let totalAmount = 0;

    // Walidacja i pobranie informacji o produktach
    for (const item of createOrderDto.items) {
      // Sprawdź czy produkt istnieje
      const product = await this.productsClient.getProduct(item.productId);
      
      // Sprawdź dostępność
      const isAvailable = await this.productsClient.checkProductAvailability(
        item.productId,
        item.quantity
      );

      if (!isAvailable) {
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

    // Zmniejsz stan magazynowy produktów
    for (const item of createOrderDto.items) {
       await this.productsClient.decreaseQuantity(item.productId, item.quantity);
     }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        items: true,
      },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new BadRequestException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: { status },
        include: {
          items: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new BadRequestException(`Order with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Order> {
    try {
      return await this.prisma.order.delete({
        where: { id },
        include: {
          items: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new BadRequestException(`Order with ID ${id} not found`);
      }
      throw error;
    }
  }
}