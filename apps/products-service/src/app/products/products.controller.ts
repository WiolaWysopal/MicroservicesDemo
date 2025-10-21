// apps/products-service/src/app/products/products.controller.ts
import {Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus, ParseIntPipe} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product, Prisma } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // HEALTH ENDPOINT
  @Get('/health')
  async getHealth(): Promise<{ service: string; status: string; timestamp: string }> {
    return this.productsService.getHealthProducts();
  }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(    @Param('id', ParseIntPipe) id: number,
                ): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() productData: Prisma.ProductCreateInput): Promise<Product> {
    return this.productsService.create(productData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() productData: Prisma.ProductUpdateInput
  ): Promise<Product> {
    return this.productsService.update(id, productData);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.delete(id);
  }

  @Get(':id/availability/:quantity')
  async checkAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Param('quantity', ParseIntPipe) quantity: number,
  ): Promise<{ available: boolean }> {
    const available = await this.productsService.checkAvailability(
      id,
      quantity
    );
    return { available };
  }

  @Post(':id/decrease-quantity/:quantity')
  async decreaseQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Param('quantity', ParseIntPipe) quantity: number,
  ): Promise<Product> {
    return this.productsService.decreaseQuantity(
      id,
      quantity
    );
  }
}
