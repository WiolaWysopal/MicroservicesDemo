import { Injectable, BadRequestException } from '@nestjs/common';
import { Order, OrderItem } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsClientService } from '../services/products-client.service';

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private idCounter = 1;

  constructor(private readonly productsClient: ProductsClientService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderItems: OrderItem[] = [];
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
    const newOrder: Order = {
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

  findAll(): Order[] {
    return this.orders;
  }

  findOne(id: number): Order {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new BadRequestException(`Order with ID ${id} not found`);
    }
    return order;
  }

  updateStatus(id: number, status: Order['status']): Order {
    const order = this.findOne(id);
    order.status = status;
    return order;
  }
}