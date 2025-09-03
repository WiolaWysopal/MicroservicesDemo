export interface IOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  id: number;
  customerName: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}