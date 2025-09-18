import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsClientService } from '../services/products-client.service';
import { IOrder, IOrderItem } from '@microservices-demo/shared-interfaces';

@Injectable()
export class OrdersService {
  private orders: IOrder[] = [];
  private idCounter = 1;
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly productsClient: ProductsClientService) {}

  // CREATE ORDER
  async create(createOrderDto: CreateOrderDto): Promise<IOrder> {
    this.logger.log(`Creating new order for customer: ${createOrderDto.customerName}`);
    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;

    try {
      for (const item of createOrderDto.items) {
        // Pobierz produkt
        const product = await this.productsClient.getProduct(item.productId);
        this.logger.debug(`Fetched product ${product.name} with ID ${item.productId}`);

        // Sprawdź dostępność
        const isAvailable = await this.productsClient.checkProductAvailability(
          item.productId,
          item.quantity,
        );

        if (!isAvailable) {
          this.logger.warn(`Product ${product.name} not available in requested quantity`);
          throw new BadRequestException(
            `Product ${product.name} is not available in requested quantity`,
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

      const newOrder: IOrder = {
        id: this.idCounter++,
        customerName: createOrderDto.customerName,
        items: orderItems,
        totalAmount,
        status: 'confirmed',
        createdAt: new Date(),
      };

      this.orders.push(newOrder);
      this.logger.log(`Order created successfully with ID: ${newOrder.id}`);
      return newOrder;

    } catch (error) {
      this.logger.error('Failed to create order', error.stack);
      throw error;
    }
  }

  // FIND ALL ORDERS
  findAll(): IOrder[] {
    this.logger.log('Fetching all orders');
    return this.orders;
  }

  // FIND ONE ORDER
  findOne(id: number): IOrder {
    this.logger.log(`Fetching order with ID: ${id}`);
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      this.logger.warn(`Order with ID ${id} not found`);
      throw new BadRequestException(`Order with ID ${id} not found`);
    }
    return order;
  }

  // UPDATE ORDER STATUS
  updateStatus(id: number, status: IOrder['status']): IOrder {
    this.logger.log(`Updating status of order ${id} to "${status}"`);
    try {
      const order = this.findOne(id);
      order.status = status;
      this.logger.log(`Order ${id} status updated successfully`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to update status for order ${id}`, error.stack);
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
