import type { Merchant, Product } from '@/types/commerce';

export const merchants: Merchant[] = [
  { id: 'cantinho', name: 'Cantinho da Vila', category: 'Restaurante', rating: 4.8, eta: '18–25 min', accent: '#FFF0EA', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=82' },
  { id: 'kero', name: 'Kero Express', category: 'Mercado', rating: 4.7, eta: '25–35 min', accent: '#EEF2FF', image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=900&q=82' },
  { id: 'farmacia', name: 'Farmácia Central', category: 'Farmácia', rating: 4.9, eta: '20–30 min', accent: '#ECFDF5', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=82' },
];

export const products: Product[] = [
  { id: 'p1', merchantId: 'cantinho', name: 'Menu grelhado da casa', description: 'Frango grelhado, arroz, batata e salada fresca.', price: 5200, tag: 'Mais pedido', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=82' },
  { id: 'p2', merchantId: 'cantinho', name: 'Massa cremosa', description: 'Massa artesanal, molho cremoso e frango desfiado.', price: 4800, image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=900&q=82' },
  { id: 'p3', merchantId: 'kero', name: 'Cabaz essencial', description: 'Selecção prática para o dia-a-dia em casa.', price: 12600, tag: 'Poupa tempo', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=82' },
  { id: 'p4', merchantId: 'farmacia', name: 'Kit bem-estar', description: 'Essenciais para o teu cuidado diário.', price: 6500, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=82' },
];
