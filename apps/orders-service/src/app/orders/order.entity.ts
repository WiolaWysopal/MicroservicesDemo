export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export class Order {
    id!: number;
    customerName!: string;
    items!: OrderItem[];
    totalAmount!: number;
    status!: 'pending' | 'confirmed' | 'cancelled';
    createdAt!: Date;
}