export type OrderStatus = 'matching' | 'on_the_way' | 'completed';

export type Order = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  etaMinutes: number;
  status: OrderStatus;
  image: string;
  address: string;
  vehicle: string;
  provider?: string;
  plate?: string;
};
