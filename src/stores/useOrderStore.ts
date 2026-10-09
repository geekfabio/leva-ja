import { create } from 'zustand';
import { activeOrder, nearbyOrders } from '@/mocks/orders';
import type { Order } from '@/types/order';

type OrderState = {
  orders: Order[];
  selectedOrder: Order;
  selectOrder: (orderId: string) => void;
  updateStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => void;
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: nearbyOrders,
  selectedOrder: activeOrder,
  selectOrder: (orderId) => set((state) => ({
    selectedOrder: state.orders.find((item) => item.id === orderId) ?? state.selectedOrder,
  })),
  updateStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((order) => order.id === orderId ? { ...order, status, etaMinutes: status === 'arrived' ? 0 : order.etaMinutes } : order),
    selectedOrder: state.selectedOrder.id === orderId ? { ...state.selectedOrder, status, etaMinutes: status === 'arrived' ? 0 : state.selectedOrder.etaMinutes } : state.selectedOrder,
  })),
  cancelOrder: (orderId) => set((state) => ({
    orders: state.orders.map((order) => order.id === orderId ? { ...order, status: 'cancelled' } : order),
    selectedOrder: state.selectedOrder.id === orderId ? { ...state.selectedOrder, status: 'cancelled' } : state.selectedOrder,
  })),
}));
