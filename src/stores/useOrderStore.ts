import { create } from 'zustand';
import { activeOrder, nearbyOrders } from '@/mocks/orders';
import type { Order } from '@/types/order';

type OrderState = {
  orders: Order[];
  selectedOrder: Order;
  selectOrder: (orderId: string) => void;
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: nearbyOrders,
  selectedOrder: activeOrder,
  selectOrder: (orderId) => set((state) => ({
    selectedOrder: state.orders.find((item) => item.id === orderId) ?? state.selectedOrder,
  })),
}));
