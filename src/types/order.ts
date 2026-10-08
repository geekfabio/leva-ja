export type OrderStatus = 'preparing' | 'on_the_way' | 'delivered';

export type Order = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  etaMinutes: number;
  status: OrderStatus;
  image: string;
  address: string;
};
