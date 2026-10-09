import type { Order } from '@/types/order';

export type DemoScenario = { id: string; title: string; description: string; orderId: string; orders: Order[] };

const base: Order = { id: 'LJ-2601', merchant: 'Reboque urgente', category: 'Reboque de viatura', amount: 18500, etaMinutes: 18, status: 'on_the_way', address: 'Rua da Missão, Ingombota', vehicle: 'Toyota Corolla · 2015', provider: 'João Manuel', plate: 'LD-42-18-AF', destination: 'Oficina Auto Centro, Maianga', paymentMethod: 'Referência Multicaixa', paymentStatus: 'confirmed', incidentNote: 'Motor desligou durante a condução.', severity: 'medium', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80' };
const history: Order[] = [
  { ...base, id: 'LJ-2590', merchant: 'Bateria descarregada', category: 'Assistência no local', amount: 9500, etaMinutes: 28, status: 'completed', address: 'Mutamba, Luanda', vehicle: 'Hyundai i10 · 2020', provider: 'AutoHelp Luanda', plate: 'LD-81-06-BB' },
  { ...base, id: 'LJ-2548', merchant: 'Pneu furado', category: 'Assistência no local', amount: 7000, etaMinutes: 22, status: 'completed', address: 'Maianga, Luanda', vehicle: 'Kia Sportage · 2018' },
  { ...base, id: 'LJ-2604', merchant: 'Entrega de combustível', category: 'Assistência no local', amount: 8500, etaMinutes: 14, status: 'matching', address: 'Talatona, Rua do MAT', vehicle: 'Kia Sportage · 2018', provider: undefined, paymentStatus: 'pending' },
  { ...base, id: 'LJ-2603', merchant: 'Reboque de viatura', amount: 24000, etaMinutes: 0, status: 'arrived', address: 'Kilamba, Condomínio Cruzeiro', vehicle: 'Toyota Hilux · 2021', provider: 'Carlos Mendes', plate: 'LD-77-KM' },
];
export const demoScenarios: DemoScenario[] = [
  { id: 'tracking', title: 'Cliente · reboque a caminho', description: 'João Manuel desloca-se ao cliente; ideal para tracking, chat e chamada.', orderId: base.id, orders: [base, ...history] },
  { id: 'provider', title: 'Prestador · pedido por aceitar', description: 'Pedido novo disponível para aceitar e avançar por todos os estados.', orderId: 'LJ-2604', orders: [{ ...history[2] }, base, ...history.filter((item) => item.id !== 'LJ-2604')] },
  { id: 'arrival', title: 'Prestador · chegou ao local', description: 'Viatura já localizada; permite recolha, provas e conclusão.', orderId: 'LJ-2603', orders: [{ ...history[3] }, base, ...history.filter((item) => item.id !== 'LJ-2603')] },
  { id: 'payment-failed', title: 'Cliente · pagamento falhou', description: 'Fluxo de recuperação de pagamento e suporte.', orderId: 'LJ-2601', orders: [{ ...base, paymentStatus: 'failed', status: 'accepted' }, ...history] },
  { id: 'dispute', title: 'Operações · pedido em disputa', description: 'Cenário para reclamação, SOS e intervenção administrativa.', orderId: 'LJ-2601', orders: [{ ...base, status: 'disputed', paymentStatus: 'refunded' }, ...history] },
];
export const presentationSeed = { customer: { name: 'Armando Trindade', phone: '+244 912 345 678', vehicles: ['Toyota Corolla · 2015', 'Kia Sportage · 2018'] }, provider: { name: 'João Manuel', phone: '+244 923 456 789', rating: '4,9', documents: ['Carta de condução', 'Seguro da viatura', 'Registo do reboque'] }, workshops: ['Oficina Auto Centro · Maianga', 'Auto Rápido Luanda · Mutamba', 'Garage Kilamba · Kilamba'], zones: ['Ingombota', 'Maianga', 'Mutamba', 'Talatona', 'Kilamba'] };
