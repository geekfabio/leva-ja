import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { Laptop, Save, ShieldCheck, Smartphone } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';
import { sessionsMock } from '@/mocks/settings';

export default function SecuritySettings() {
  const [freeWindow, setFreeWindow] = useState('5');
  const [cancelFee, setCancelFee] = useState('1 500');
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessions, setSessions] = useState(sessionsMock);
  const [endSessionId, setEndSessionId] = useState<string | null>(null);

  function savePolicy() {
    toast.success({ title: 'Política guardada', message: 'As regras de cancelamento e SOS foram actualizadas (mock).' });
  }

  function toggleTwoFactor() {
    setTwoFactor((current) => !current);
    toast.success({ title: twoFactor ? 'Autenticação em dois factores desligada' : 'Autenticação em dois factores activa', message: 'Esta definição aplica-se a todas as contas administrativas (mock).' });
  }

  function endSession() {
    setSessions((current) => current.filter((session) => session.id !== endSessionId));
    setEndSessionId(null);
    toast.success({ title: 'Sessão terminada', message: 'O dispositivo foi desconectado do painel administrativo (mock).' });
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Políticas de segurança" subtitle="Cancelamentos, SOS e sessões" />
      <ScrollView contentContainerClassName="pb-16">
        <View className="rounded-3xl bg-white p-5 dark:bg-slate-900">
          <Text className="font-black text-ink dark:text-white">Cancelamento</Text>
          <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-white">Janela de cancelamento gratuito (min)</Text>
          <TextInput value={freeWindow} onChangeText={setFreeWindow} keyboardType="numeric" className="rounded-xl bg-slate-100 px-4 py-3 font-black text-ink dark:bg-slate-800 dark:text-white" />
          <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-white">Taxa de cancelamento tardio (AOA)</Text>
          <TextInput value={cancelFee} onChangeText={setCancelFee} keyboardType="numeric" className="rounded-xl bg-slate-100 px-4 py-3 font-black text-ink dark:bg-slate-800 dark:text-white" />
          <Pressable onPress={savePolicy} className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-brand py-3">
            <Save size={18} color="#fff" />
            <Text className="font-black text-white">Guardar política</Text>
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center rounded-3xl bg-white p-5 dark:bg-slate-900">
          <View className="flex-1 pr-3">
            <Text className="font-black text-ink dark:text-white">Escalonamento automático de SOS</Text>
            <Text className="mt-1 text-sm text-muted">Alertas não respondidos em 3 min avançam para a equipa de segurança</Text>
          </View>
          <Switch value={autoEscalate} onValueChange={setAutoEscalate} trackColor={{ true: '#16A34A' }} />
        </View>

        <View className="mt-5 flex-row items-center rounded-3xl bg-white p-5 dark:bg-slate-900">
          <View className="rounded-xl bg-brand-soft p-3">
            <ShieldCheck size={20} color="#16A34A" />
          </View>
          <View className="ml-3 flex-1 pr-3">
            <Text className="font-black text-ink dark:text-white">Autenticação em dois factores</Text>
            <Text className="mt-1 text-sm text-muted">Obrigatória para todas as contas administrativas</Text>
          </View>
          <Switch value={twoFactor} onValueChange={toggleTwoFactor} trackColor={{ true: '#16A34A' }} />
        </View>

        <Text className="mb-3 mt-5 font-black text-ink dark:text-white">Sessões activas</Text>
        {sessions.map((session) => (
          <View key={session.id} className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
            <View className="rounded-xl bg-brand-soft p-3">
              {session.device.includes('iPhone') ? <Smartphone size={18} color="#16A34A" /> : <Laptop size={18} color="#16A34A" />}
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-black text-ink dark:text-white">{session.device}</Text>
              <Text className="mt-1 text-xs text-muted">{session.location} · {session.lastActive}</Text>
            </View>
            {session.lastActive !== 'Activo agora' && (
              <Pressable onPress={() => setEndSessionId(session.id)} className="rounded-lg bg-red-50 px-3 py-2">
                <Text className="text-xs font-black text-red-600">Terminar</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      <ConfirmModal
        visible={endSessionId !== null}
        tone="danger"
        title="Terminar esta sessão?"
        description="O dispositivo é desconectado imediatamente e precisará de autenticar-se novamente."
        confirmLabel="Terminar sessão"
        onConfirm={endSession}
        onCancel={() => setEndSessionId(null)}
      />
    </View>
  );
}
