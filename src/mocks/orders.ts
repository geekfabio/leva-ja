import type { Order } from '@/types/order';

export const activeOrder: Order = {
  id: 'LJ-2601', merchant: 'Reboque urgente', category: 'Reboque de viatura', amount: 18500, etaMinutes: 18,
  status: 'on_the_way',
  address: 'Rua da Missão, Ingombota', vehicle: 'Toyota Corolla · 2015', provider: 'João Manuel', plate: 'LD-42-18-AF',
  destination: 'Oficina Auto Centro, Maianga', paymentMethod: 'Referência Multicaixa', paymentStatus: 'confirmed', incidentNote: 'Motor desligou durante a condução.', severity: 'medium',
  image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
};

export const activeTransportOrder: Order = {
  id: 'LJ-3001', merchant: 'Carga média', category: 'Transporte', amount: 14000, etaMinutes: 16,
  status: 'on_the_way', serviceType: 'transport',
  address: 'Mercado do Kinaxixi, Ingombota', vehicle: 'Carrinha de carga · 1,5 ton', provider: 'Ngola Transportes', plate: 'LD-56-TR',
  destination: 'Avenida Pedro de Castro Van-Dúnem, Maianga', paymentMethod: 'Referência Multicaixa', paymentStatus: 'confirmed',
  incidentNote: '6 caixas de material de loja, sem necessidade de ajudante.',
  image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80',
};

export const nearbyOrders: Order[] = [
  activeOrder,
  {
    id: 'LJ-2590', merchant: 'Bateria descarregada', category: 'Assistência no local', amount: 9500,
    etaMinutes: 28, status: 'completed', address: 'Mutamba, Luanda', vehicle: 'Hyundai i10 · 2020', provider: 'AutoHelp Luanda', plate: 'LD-81-06-BB',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'LJ-2548', merchant: 'Pneu furado', category: 'Assistência no local', amount: 7000,
    etaMinutes: 22, status: 'completed', address: 'Maianga, Luanda', vehicle: 'Kia Sportage · 2018', provider: 'João Manuel', plate: 'LD-10-96-CC',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
  },
  activeTransportOrder,
];
