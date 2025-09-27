// src/products/products.controller.ts
import { Controller, Get, Post, Put, Param, Body, HttpCode, HttpStatus, Patch, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  // Endpoint dla sprawdzenia dostępności
  @Get(':id/availability/:quantity')
  checkAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Param('quantity', ParseIntPipe) quantity: number,
  ): Promise<{ available: boolean }> {
    return this.productsService
      .checkAvailability(id, quantity)
      .then((available) => ({ available }));
  }

  // Endpoint do zmniejszania ilości na magazynie
  @Patch(':id/decrease')
  decreaseQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { quantity: number },
  ): Promise<Product> {
    return this.productsService.decreaseQuantity(id, body.quantity);
  }
}
