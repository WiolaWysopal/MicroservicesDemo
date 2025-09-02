export class CreateOrderDto {
    customerName!: string;
    items!: {
        productId: number;
        quantity: number;
    }[];
}