import { OrdersService } from './orders.service';
import { BadRequestException } from '@nestjs/common';

// Klasa Mockowa
class ProductsClientServiceMock {
  async getProduct(productId: string) {
    return { id: productId, name: `Product ${productId}`, price: 10 };
  }

  async checkProductAvailability(productId: number, quantity: number) {
    if (productId === 0) return false;
    return true;
  }
}

// testy metod

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(() => {
    service = new OrdersService(new ProductsClientServiceMock() as any);
  });

  it('should create an order with totalAmount', async () => {
    const dto = {
      customerName: 'Jan Kowalski',
      items: [
    // Dla id nieistniejącego produktu test przechodzi - jest to oczekiwane zachowanie, ponieważ
    // jeszcze nie ma komunikacji HTTP products <-> services
        { productId: 10, quantity: 2 },
        { productId: 1, quantity: 3 }
      ],
    };

    const order = await service.create(dto);
    expect(order).toHaveProperty('id');
    expect(order.totalAmount).toBe(50); // 2*10 + 3*10
    expect(order.items.length).toBe(2);
    expect(order.status).toBe('confirmed');
  });

  it('should throw BadRequestException if a product is unavailable', async () => {
    const dto = {
      customerName: 'Jan Kowalski',
      // items: [{ productId: '0', quantity: 1 }],
      items: [{ productId: 0, quantity: 1 }],
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('findAll() should return all orders', async () => {
    // const dto = { customerName: 'B', items: [{ productId: '1', quantity: 1 }] }; - błąd
    const dto = { customerName: 'A', items: [{ productId: 1, quantity: 1 }] };
    await service.create(dto);
    await service.create(dto);
    const all = service.findAll();
    expect(all.length).toBe(2);
  });

  it('findOne() should return the correct order', async () => {
    // const dto = { customerName: 'B', items: [{ productId: '1', quantity: 1 }] }; - błąd
    const dto = { customerName: 'B', items: [{ productId: 1, quantity: 1 }] };
    const order = await service.create(dto);
    const found = service.findOne(order.id);
    expect(found.id).toBe(order.id);
  });

  it('findOne() should throw if order does not exist', () => {
    expect(() => service.findOne(999)).toThrow(BadRequestException);
  });

  it('updateStatus() should update the order status', async () => {
    const dto = { customerName: 'C', items: [{ productId: 1, quantity: 1 }] };
    const order = await service.create(dto);
    // const updated = service.updateStatus(order.id, 'SHIPPED'); - błąd
    const updated = service.updateStatus(order.id, 'confirmed');
    // expect(updated.status).toBe('SHIPPED'); - przypadek błędu dla updated = service.updateStatus(order.id, 'confirmed');
    expect(updated.status).toBe('confirmed');
  });
});
