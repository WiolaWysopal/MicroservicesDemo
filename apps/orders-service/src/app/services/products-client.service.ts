import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ProductsClientService {
  private readonly productsServiceUrl = 'http://localhost:3000/api';

  constructor(private readonly httpService: HttpService) {}

  async getProduct(productId: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.productsServiceUrl}/products/${productId}`)
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async checkProductAvailability(productId: number, quantity: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.productsServiceUrl}/products/${productId}/availability/${quantity}`
        )
      );
      return response.data.available;
    } catch (error) {
      this.handleError(error as AxiosError);
      return false;
    }
  }

  private handleError(error: AxiosError): void {
    if (error.response?.status === 404) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    throw new HttpException(
      'Error communicating with Products Service',
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}