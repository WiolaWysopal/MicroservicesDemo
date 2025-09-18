import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsClientService } from '../services/products-client.service';
import { IOrder, IOrderItem } from '@microservices-demo/shared-interfaces';

@Injectable()
export class OrdersService {
  private orders: IOrder[] = [];
  private idCounter = 1;

  constructor(private readonly productsClient: ProductsClientService) {}

  async create(createOrderDto: CreateOrderDto): Promise<IOrder> {
    const orderItems: IOrderItem[] = [];
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

    // Utwórz zamówienie
    const newOrder: IOrder = {
      id: this.idCounter++,
      customerName: createOrderDto.customerName,
      items: orderItems,
      totalAmount,
      status: 'confirmed',
      createdAt: new Date(),
    };

    this.orders.push(newOrder);
    return newOrder;
  }

  findAll(): IOrder[] {
    return this.orders;
  }

  findOne(id: number): IOrder {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new BadRequestException(`Order with ID ${id} not found`);
    }
    return order;
  }

  updateStatus(id: number, status: IOrder['status']): IOrder {
    const order = this.findOne(id);
    order.status = status;
    return order;
  }

  // HEALTH FUNCTION
  async getHealthService(): Promise<{ service: string; status: string; timestamp: string }> {
  return {
    service: 'orders-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
}