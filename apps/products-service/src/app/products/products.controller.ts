// products/products.controller.ts
import { Controller, Get, Post, Put, Param, Body, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // HEALTH ENDPOINT
  @Get('/health')
  async getHealth(): Promise<{ service: string; status: string; timestamp: string }> {
    return this.productsService.getHealthProducts();
  }

  @Get()
  findAll(): Product[] {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Product {
    return this.productsService.findOne(parseInt(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() productData: Partial<Product>): Product {
    return this.productsService.create(productData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() productData: Partial<Product>
  ): Product {
    return this.productsService.update(parseInt(id), productData);
  }

  // Endpoint dla sprawdzenia dostępności (używany przez Orders Service)
  @Get(':id/availability/:quantity')
  checkAvailability(
    @Param('id') id: string,
    @Param('quantity') quantity: string
  ): { available: boolean } {
    const available = this.productsService.checkAvailability(
      parseInt(id),
      parseInt(quantity)
    );
    return { available };
  }

  // Endpoint do sprawdzenia zmiejszania ilości na magazynie
  @Patch(':id/decrease')
  decreaseQuantity(
  @Param('id') id: string,
  @Body() body: {quantity: number}
  ) {
    return this.productsService.decreaseQuantity(parseInt(id), body.quantity); 
  }
}
