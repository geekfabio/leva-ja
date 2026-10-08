import { create } from 'zustand';
import type { CartLine, Product } from '@/types/commerce';

type CartState = {
  lines: CartLine[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  add: (product) => set((state) => {
    const existing = state.lines.find((line) => line.id === product.id);
    return { lines: existing ? state.lines.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...state.lines, { ...product, quantity: 1 }] };
  }),
  remove: (productId) => set((state) => ({ lines: state.lines.filter((line) => line.id !== productId) })),
  clear: () => set({ lines: [] }),
}));
