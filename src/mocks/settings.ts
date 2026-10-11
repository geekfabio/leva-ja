export type TeamMember = { id: string; name: string; email: string; role: 'Administrador' | 'Operações' | 'Suporte' | 'Financeiro'; status: 'Activo' | 'Convidado' | 'Suspenso' };

export const teamMembers: TeamMember[] = [
  { id: 'AD-01', name: 'Armando Trindade', email: 'armando@levaja.ao', role: 'Administrador', status: 'Activo' },
  { id: 'AD-02', name: 'Sofia Manuel', email: 'sofia@levaja.ao', role: 'Operações', status: 'Activo' },
  { id: 'AD-03', name: 'Paulo Domingos', email: 'paulo@levaja.ao', role: 'Suporte', status: 'Activo' },
  { id: 'AD-04', name: 'Joana Miguel', email: 'joana@levaja.ao', role: 'Financeiro', status: 'Convidado' },
  { id: 'AD-05', name: 'Carlos Alberto', email: 'carlos@levaja.ao', role: 'Operações', status: 'Suspenso' },
];

export type IntegrationStatus = { id: string; name: string; description: string; connected: boolean };

export const paymentIntegrations: IntegrationStatus[] = [
  { id: 'multicaixa', name: 'Multicaixa Express', description: 'Pagamentos por referência e QR code', connected: true },
  { id: 'unitel-money', name: 'Unitel Money', description: 'Carteira móvel para clientes e prestadores', connected: true },
  { id: 'afrimoney', name: 'AfriMoney', description: 'Carteira móvel alternativa', connected: false },
];

export const apiKeys = [
  { id: 'key_live', label: 'Chave de produção', value: 'lj_live_6f2a9c84d1e34bb7a2c0', createdAt: 'Criada em 2 Set 2026' },
  { id: 'key_test', label: 'Chave de testes', value: 'lj_test_0b71c4e8f23a4d19bb55', createdAt: 'Criada em 2 Set 2026' },
];

export const webhookUrl = 'https://ops.levaja.ao/webhooks/pagamentos';

export const notificationTemplates = [
  { id: 'tpl-1', title: 'Pedido confirmado', channel: 'Push + SMS', audience: 'Clientes' },
  { id: 'tpl-2', title: 'Prestador a caminho', channel: 'Push', audience: 'Clientes' },
  { id: 'tpl-3', title: 'Novo pedido disponível', channel: 'Push', audience: 'Prestadores' },
  { id: 'tpl-4', title: 'Documento a expirar', channel: 'Email + Push', audience: 'Prestadores' },
];

export const sessionsMock = [
  { id: 'ses-1', device: 'MacBook Pro · Chrome', location: 'Luanda, Angola', lastActive: 'Activo agora' },
  { id: 'ses-2', device: 'iPhone 15 · App Leva Já', location: 'Luanda, Angola', lastActive: 'Há 2 horas' },
  { id: 'ses-3', device: 'Windows · Edge', location: 'Benguela, Angola', lastActive: 'Há 3 dias' },
];
