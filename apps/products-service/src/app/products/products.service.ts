import { Injectable, NotFoundException } from '@nestjs/common';
import { IProduct } from '@microservices-demo/shared-interfaces';

@Injectable()
export class ProductsService {
  // Symulacja bazy danych - w prawdziwym projekcie użyj TypeORM/Prisma
  private products: IProduct[] = [
    { id: 1, name: 'Laptop', price: 2500, quantity: 10, description: 'Gaming laptop' },
    { id: 2, name: 'Mouse', price: 50, quantity: 100, description: 'Wireless mouse' },
  ];
  private idCounter = 3;

  findAll(): IProduct[] {
    return this.products;
  }

  findOne(id: number): IProduct {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  create(productData: Partial<IProduct>): IProduct {
    const newProduct: IProduct = {
      id: this.idCounter++,
      name: productData.name || '',
      price: productData.price || 0,
      quantity: productData.quantity || 0,
      description: productData.description,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  update(id: number, productData: Partial<IProduct>): IProduct {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.products[index] = { ...this.products[index], ...productData };
    return this.products[index];
  }

  // Metoda pomocnicza dla Orders Service
  checkAvailability(id: number, requestedQuantity: number): boolean {
    const product = this.findOne(id);
    return product.quantity >= requestedQuantity;
  }

  // Metoda do zmniejszania stanu magazynowego
  decreaseQuantity(id: number, quantity: number): void {
    const product = this.findOne(id);
    if (product.quantity < quantity) {
      throw new Error('Insufficient quantity');
    }
    product.quantity -= quantity;
  }
}