export type ServicePillar = 'assistance' | 'transport';
export type VehicleClass = 'moto_cargo' | 'carrinha' | 'camiao_pequeno';

export type ServiceDefinition = {
  id: string;
  pillar: ServicePillar;
  title: string;
  description: string;
  emoji: string;
  tone: readonly [string, string];
  vehicleClass?: VehicleClass;
};

export const assistanceServices: ServiceDefinition[] = [
  { id: 'tow', pillar: 'assistance', title: 'Reboque de viatura', description: 'Levar a viatura para uma oficina ou outro local.', emoji: '🚛', tone: ['#22C55E', '#15803D'] },
  { id: 'battery', pillar: 'assistance', title: 'Bateria descarregada', description: 'Ajuda para dar carga ou substituir a bateria.', emoji: '🔋', tone: ['#34D399', '#047857'] },
  { id: 'tire', pillar: 'assistance', title: 'Pneu furado', description: 'Troca de pneu ou assistência no local.', emoji: '🛞', tone: ['#4ADE80', '#166534'] },
  { id: 'fuel', pillar: 'assistance', title: 'Falta de combustível', description: 'Entrega de combustível onde estás.', emoji: '⛽', tone: ['#16A34A', '#102018'] },
  { id: 'other', pillar: 'assistance', title: 'Outro problema', description: 'Explica-nos o que aconteceu.', emoji: '🧰', tone: ['#64748B', '#102018'] },
];

export const transportServices: ServiceDefinition[] = [
  { id: 'pickup', pillar: 'transport', title: 'Pick-up / entrega rápida', description: 'Leva uma compra ou encomenda num instante.', emoji: '📦', tone: ['#4ADE80', '#15803D'], vehicleClass: 'moto_cargo' },
  { id: 'cargo_medium', pillar: 'transport', title: 'Carga média', description: 'Mobília pequena, eletrodomésticos, material de loja.', emoji: '🛻', tone: ['#22C55E', '#166534'], vehicleClass: 'carrinha' },
  { id: 'cargo_large', pillar: 'transport', title: 'Carga grande / mudança', description: 'Mudança de casa ou carga de obra.', emoji: '🚚', tone: ['#16A34A', '#102018'], vehicleClass: 'camiao_pequeno' },
];

export const allServices = [...assistanceServices, ...transportServices];

export const vehicleClassLabel: Record<VehicleClass, string> = {
  moto_cargo: 'Mota de carga',
  carrinha: 'Carrinha',
  camiao_pequeno: 'Camião pequeno',
};
