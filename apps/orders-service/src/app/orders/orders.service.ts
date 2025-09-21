import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Order, OrderItem } from './order.entity';
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

// Aggregate quantities by productId to validate combined availability
    const aggregated = new Map<number, number>();
    for (const { productId, quantity } of createOrderDto.items) {
      aggregated.set(productId, (aggregated.get(productId) ?? 0) + quantity);
    }

    const uniqueProductIds = [...aggregated.keys()];

    // Fetch product details and availability in parallel
    const [products, availability] = await Promise.all([
      Promise.all(uniqueProductIds.map((id) => this.productsClient.getProduct(id))),
      Promise.all(uniqueProductIds.map((id) =>
        this.productsClient.checkProductAvailability(id, aggregated.get(id)!)
      )),
    ]);

    const productMap = new Map<number, { name: string; price: number }>();
    products.forEach((p, idx) => productMap.set(uniqueProductIds[idx], { name: p.name, price: p.price }));

    // Validate aggregated availability
    availability.forEach((ok, idx) => {
      if (!ok) {
        const id = uniqueProductIds[idx];
        const p = productMap.get(id);
        throw new BadRequestException(`Product ${p?.name ?? id} is not available in requested quantity`);
      }
    });

    // Build order items preserving original lines
    for (const item of createOrderDto.items) {
      const product = productMap.get(item.productId)!;
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
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  updateStatus(id: number, status: IOrder['status']): IOrder {
    const order = this.findOne(id);
    order.status = status;
    return order;
  }
}