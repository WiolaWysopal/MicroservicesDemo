export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export class Order {
    id!: number;
    customName!: string;
    items!: OrderItem[];
    totalAmount!: number;
    status!: 'pending' | 'confirmed' | 'cancelled';
    createdAt!: Date;
}

export class CreateOrderDto {
    customerName!: string;
    items!: {
        productId: number;
        quantity: number;
    }[];
}