import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Check, FileCheck2, MessageCircle, ShieldAlert, UserRound, WalletCards } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProofRow } from '@/components/ui/ProofRow';
import { AppButton } from '@/components/ui/AppButton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';

const config: Record<string, { title: string; subtitle: string; status: string; icon: typeof UserRound }> = {
  order: { title: 'Operação do pedido', subtitle: 'LJ-2601 · Reboque de viatura', status: 'A caminho', icon: MessageCircle },
  customer: { title: 'Perfil do cliente', subtitle: 'Armando Trindade · CL-100', status: 'Activo', icon: UserRound },
  provider: { title: 'Revisão do prestador', subtitle: 'João Manuel · PR-20', status: 'Pendente', icon: FileCheck2 },
  payment: { title: 'Pagamento e recibo', subtitle: 'PG-800 · Pedido LJ-2601', status: 'Confirmado', icon: WalletCards },
  safety: { title: 'Alerta SOS', subtitle: 'SOS-40 · Armando Trindade', status: 'Aberto', icon: ShieldAlert },
};

export default function AdminDetail() {
  const { type = 'order', id } = useLocalSearchParams<{ type: string; id: string }>();
  const item = config[type] ?? config.order;
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState('');
  const [blockOpen, setBlockOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const Icon = item.icon;

  function toggleBlock() {
    if (status === 'Bloqueado') {
      setStatus('Activo');
      toast.success({ title: 'Cliente desbloqueado', message: `${item.subtitle.split(' · ')[0]} voltou a ter acesso à plataforma (mock).` });
      return;
    }
    setBlockOpen(true);
  }

  function confirmBlock() {
    setBlockOpen(false);
    setStatus('Bloqueado');
    toast.success({ title: 'Cliente bloqueado', message: 'O acesso foi suspenso e o cliente foi notificado (mock).' });
  }

  function confirmRefund() {
    setRefundOpen(false);
    setStatus('Reembolsado');
    toast.success({ title: 'Reembolso emitido', message: 'O valor será devolvido ao método de pagamento original em 48h (mock).' });
  }

  function approveProvider() {
    setStatus('Aprovado');
    toast.success({ title: 'Prestador aprovado', message: 'João Manuel já pode receber pedidos na plataforma (mock).' });
  }

  function confirmCorrection() {
    setCorrectionOpen(false);
    setStatus('Em análise');
    toast.info({ title: 'Correcção solicitada', message: 'O prestador foi notificado sobre os documentos pendentes (mock).' });
  }

  function resolveAlert() {
    setStatus('Resolvido');
    toast.success({ title: 'Alerta resolvido', message: note ? 'Nota do responsável registada no histórico (mock).' : 'Alerta marcado como resolvido (mock).' });
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title={item.title} subtitle={item.subtitle} />
      <ScrollView contentContainerClassName="pb-28">
        <View className="rounded-3xl bg-ink p-5">
          <Icon size={28} color="#86EFAC" />
          <Text className="mt-4 text-xl font-black text-white">{item.subtitle}</Text>
          <View className="mt-3">
            <StatusBadge status={status} />
          </View>
        </View>

        {type === 'provider' && (
          <View className="mt-5">
            <ProofRow title="Carta de condução" subtitle="Válida até Maio de 2031" complete />
            <ProofRow title="Registo da viatura de reboque" subtitle="Matrícula LD-23-45-AJ" complete />
            <ProofRow title="Seguro do veículo" subtitle="Expira em Abril de 2027" complete />
            <Text className="mt-3 font-black text-ink dark:text-white">Auditoria</Text>
            <Text className="mt-2 text-sm leading-6 text-muted">Sem ocorrências, multas ou reclamações registadas. Risco baixo.</Text>
          </View>
        )}

        {type === 'order' && (
          <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900">
            <Text className="font-black text-ink dark:text-white">Timeline e intervenção</Text>
            {['Pedido confirmado', 'Prestador aceite', 'A caminho', 'Serviço iniciado'].map((label, index) => (
              <View key={label} className="mt-4 flex-row gap-3">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-brand">
                  <Check size={14} color="#fff" />
                </View>
                <Text className="pt-1 font-bold text-ink dark:text-white">{label}{index === 2 ? ' · agora' : ''}</Text>
              </View>
            ))}
            <Pressable onPress={() => toast.info({ title: 'Chat aberto', message: 'Conversa com o prestador e o cliente iniciada (mock).' })} className="mt-5 rounded-xl bg-brand-soft p-4">
              <Text className="text-center font-black text-brand">Abrir chat e suporte</Text>
            </Pressable>
          </View>
        )}

        {type === 'customer' && (
          <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900">
            <Text className="font-black text-ink dark:text-white">Viaturas e histórico</Text>
            <Text className="mt-3 text-sm text-muted">Toyota Corolla · 2015 · 8 pedidos · avaliação média 4,8</Text>
            <Pressable onPress={toggleBlock} className={`mt-5 rounded-xl py-3 ${status === 'Bloqueado' ? 'bg-brand-soft' : 'bg-red-50'}`}>
              <Text className={`text-center font-black ${status === 'Bloqueado' ? 'text-brand' : 'text-red-600'}`}>{status === 'Bloqueado' ? 'Desbloquear cliente' : 'Bloquear cliente (mock)'}</Text>
            </Pressable>
          </View>
        )}

        {type === 'payment' && (
          <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900">
            <Text className="font-black text-ink dark:text-white">Reconciliação</Text>
            <Text className="mt-3 text-sm text-muted">18.500 Kz · Referência Multicaixa · Recibo REC-2601</Text>
            <Pressable onPress={() => setRefundOpen(true)} className="mt-5 rounded-xl bg-brand-soft py-3">
              <Text className="text-center font-black text-brand">Emitir reembolso (mock)</Text>
            </Pressable>
          </View>
        )}

        {type === 'safety' && (
          <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900">
            <Text className="font-black text-ink dark:text-white">Gestão do alerta</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Nota do responsável"
              placeholderTextColor="#94A3B8"
              className="mt-4 min-h-24 rounded-xl bg-slate-100 p-3 text-ink dark:bg-slate-800 dark:text-white"
              multiline
            />
            <Pressable onPress={resolveAlert} className="mt-4 rounded-xl bg-brand py-3">
              <Text className="text-center font-black text-white">Resolver alerta</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {type === 'provider' && (
        <View className="absolute bottom-0 left-0 right-0 flex-row gap-2 bg-surface px-5 pb-7 pt-3 dark:bg-slate-950">
          <View className="flex-1">
            <AppButton label="Aprovar" onPress={approveProvider} />
          </View>
          <View className="flex-1">
            <AppButton label="Pedir correcção" variant="ghost" onPress={() => setCorrectionOpen(true)} />
          </View>
        </View>
      )}

      <ConfirmModal
        visible={blockOpen}
        tone="danger"
        title="Bloquear este cliente?"
        description="O cliente deixa de poder pedir assistências até ser desbloqueado manualmente."
        confirmLabel="Bloquear"
        onConfirm={confirmBlock}
        onCancel={() => setBlockOpen(false)}
      />
      <ConfirmModal
        visible={refundOpen}
        tone="danger"
        title="Emitir reembolso de 18.500 Kz?"
        description="O valor é devolvido ao método de pagamento original e o pedido fica marcado como reembolsado."
        confirmLabel="Emitir reembolso"
        onConfirm={confirmRefund}
        onCancel={() => setRefundOpen(false)}
      />
      <ConfirmModal
        visible={correctionOpen}
        title="Pedir correcção ao prestador?"
        description="João Manuel recebe uma notificação a pedir o reenvio dos documentos em falta ou incorrectos."
        confirmLabel="Pedir correcção"
        onConfirm={confirmCorrection}
        onCancel={() => setCorrectionOpen(false)}
      />
    </View>
  );
}
