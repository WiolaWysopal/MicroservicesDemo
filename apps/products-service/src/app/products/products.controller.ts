// apps/products-service/src/app/products/products.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product, Prisma } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(parseInt(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() productData: Prisma.ProductCreateInput): Promise<Product> {
    return this.productsService.create(productData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() productData: Prisma.ProductUpdateInput
  ): Promise<Product> {
    return this.productsService.update(parseInt(id), productData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Product> {
    return this.productsService.delete(parseInt(id));
  }

  @Get(':id/availability/:quantity')
  async checkAvailability(
    @Param('id') id: string,
    @Param('quantity') quantity: string
  ): Promise<{ available: boolean }> {
    const available = await this.productsService.checkAvailability(
      parseInt(id),
      parseInt(quantity)
    );
    return { available };
  }

  @Post(':id/decrease-quantity/:quantity')
  async decreaseQuantity(
    @Param('id') id: string,
    @Param('quantity') quantity: string
  ): Promise<Product> {
    return this.productsService.decreaseQuantity(
      parseInt(id),
      parseInt(quantity)
    );
  }
}