export type ReportPeriod = 'Hoje' | 'Esta semana' | 'Este mês' | 'Este ano';

export const reportPeriods: ReportPeriod[] = ['Hoje', 'Esta semana', 'Este mês', 'Este ano'];

export const reportSummaryByPeriod: Record<ReportPeriod, { revenue: string; orders: string; avgTicket: string; completion: string }> = {
  Hoje: { revenue: '1 240 000 AOA', orders: '42', avgTicket: '29 524 AOA', completion: '96%' },
  'Esta semana': { revenue: '7 850 000 AOA', orders: '238', avgTicket: '32 983 AOA', completion: '94%' },
  'Este mês': { revenue: '31 420 000 AOA', orders: '986', avgTicket: '31 866 AOA', completion: '93%' },
  'Este ano': { revenue: '318 700 000 AOA', orders: '10 842', avgTicket: '29 395 AOA', completion: '91%' },
};

export const serviceBreakdown = [
  { label: 'Reboque de viaturas', value: 48, revenue: '3 768 000 AOA', color: '#16A34A' },
  { label: 'Assistência de bateria', value: 24, revenue: '1 206 000 AOA', color: '#4ADE80' },
  { label: 'Pneu furado', value: 18, revenue: '847 000 AOA', color: '#86EFAC' },
  { label: 'Entrega de combustível', value: 10, revenue: '412 000 AOA', color: '#102018' },
];

export const paymentMethodBreakdown = [
  { label: 'Referência Multicaixa', value: 56, color: '#16A34A' },
  { label: 'Numerário', value: 28, color: '#94A3B8' },
  { label: 'Voucher / Promoção', value: 16, color: '#102018' },
];

export const topProviders = [
  { id: 'PR-20', name: 'João Manuel', services: 86, rating: '4,9', earnings: '2 140 000 AOA' },
  { id: 'PR-21', name: 'AutoHelp Luanda', services: 74, rating: '4,8', earnings: '1 980 000 AOA' },
  { id: 'PR-22', name: 'Carlos Miguel', services: 61, rating: '4,7', earnings: '1 540 000 AOA' },
  { id: 'PR-23', name: 'Ngola Reboques', services: 55, rating: '4,6', earnings: '1 320 000 AOA' },
];

export const recentTransactions = Array.from({ length: 10 }, (_, index) => ({
  id: `TX-${9400 - index}`,
  order: `LJ-${2610 - index}`,
  customer: ['Armando Trindade', 'Sofia Manuel', 'Paulo Domingos', 'Joana Miguel'][index % 4],
  amount: 7000 + (index % 6) * 3200,
  method: ['Multicaixa', 'Numerário', 'Voucher'][index % 3],
  status: ['Confirmado', 'Pendente', 'Reembolsado'][index % 3],
  date: `9 Out · ${8 + index}:${index % 2 ? '30' : '00'}`,
}));

export const operationsWeekly = {
  labels: ['Seg\n5 Out', 'Ter\n6 Out', 'Qua\n7 Out', 'Qui\n8 Out', 'Sex\n9 Out', 'Sáb\n10 Out', 'Dom\n11 Out'],
  revenue: [92, 132, 148, 142, 210, 184, 138],
  orders: [54, 70, 62, 76, 101, 90, 67],
};
