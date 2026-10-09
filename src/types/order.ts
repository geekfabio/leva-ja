export type OrderStatus = 'draft' | 'matching' | 'accepted' | 'on_the_way' | 'arrived' | 'service_started' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

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
  destination?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  incidentNote?: string;
  severity?: 'low' | 'medium' | 'high';
};
