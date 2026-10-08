import type { Order } from '@/types/order';

export const activeOrder: Order = {
  id: 'LJ-2601',
  merchant: 'Cantinho da Vila',
  category: 'Restaurante',
  amount: 8400,
  etaMinutes: 18,
  status: 'on_the_way',
  address: 'Rua da Missão, Ingombota',
  image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
};

export const nearbyOrders: Order[] = [
  activeOrder,
  {
    id: 'LJ-2590', merchant: 'Kero Express', category: 'Compras', amount: 12600,
    etaMinutes: 28, status: 'preparing', address: 'Mutamba, Luanda',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'LJ-2548', merchant: 'Farmácia Central', category: 'Farmácia', amount: 5200,
    etaMinutes: 22, status: 'delivered', address: 'Maianga, Luanda',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
  },
];
