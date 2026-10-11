import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { Copy, KeyRound, RefreshCw, Save, Webhook } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';
import { apiKeys, paymentIntegrations, webhookUrl } from '@/mocks/settings';

export default function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState(paymentIntegrations);
  const [webhook, setWebhook] = useState(webhookUrl);
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const [regenerateId, setRegenerateId] = useState<string | null>(null);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);

  function toggleIntegration(id: string) {
    const integration = integrations.find((item) => item.id === id);
    if (!integration) return;
    if (integration.connected) {
      setDisconnectId(id);
      return;
    }
    setIntegrations((current) => current.map((item) => (item.id === id ? { ...item, connected: true } : item)));
    toast.success({ title: 'Integração ligada', message: `${integration.name} está pronto para processar pagamentos (mock).` });
  }

  function confirmDisconnect() {
    const integration = integrations.find((item) => item.id === disconnectId);
    setIntegrations((current) => current.map((item) => (item.id === disconnectId ? { ...item, connected: false } : item)));
    setDisconnectId(null);
    if (integration) toast.success({ title: 'Integração desligada', message: `${integration.name} deixou de processar novos pagamentos (mock).` });
  }

  function copyKey() {
    toast.success({ title: 'Chave copiada', message: 'A chave foi copiada para a área de transferência (mock).' });
  }

  function confirmRegenerate() {
    const key = apiKeys.find((item) => item.id === regenerateId);
    setRegenerateId(null);
    toast.success({ title: 'Chave regenerada', message: `${key?.label} actualizada. Integrações antigas deixam de funcionar (mock).` });
  }

  function saveWebhook() {
    toast.success({ title: 'Webhook guardado', message: 'Os eventos de pagamento passam a ser enviados para este endereço (mock).' });
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Integrações e pagamentos" subtitle="Carteiras móveis, Multicaixa e API" />
      <ScrollView contentContainerClassName="pb-16">
        <Text className="mb-3 font-black text-ink dark:text-white">Métodos de pagamento</Text>
        {integrations.map((integration) => (
          <View key={integration.id} className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
            <View className="flex-1 pr-3">
              <Text className="font-black text-ink dark:text-white">{integration.name}</Text>
              <Text className="mt-1 text-sm text-muted">{integration.description}</Text>
            </View>
            <Switch value={integration.connected} onValueChange={() => toggleIntegration(integration.id)} trackColor={{ true: '#16A34A' }} />
          </View>
        ))}

        <Text className="mb-3 mt-5 font-black text-ink dark:text-white">Chaves de API</Text>
        {apiKeys.map((key) => (
          <View key={key.id} className="mb-3 rounded-2xl bg-white p-4 dark:bg-slate-900">
            <View className="flex-row items-center">
              <View className="rounded-xl bg-brand-soft p-2.5">
                <KeyRound size={16} color="#16A34A" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-black text-ink dark:text-white">{key.label}</Text>
                <Text className="mt-1 text-xs text-muted">{key.createdAt}</Text>
              </View>
            </View>
            <View className="mt-3 flex-row items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5 dark:bg-slate-800">
              <Text className="flex-1 font-mono text-xs text-ink dark:text-white" numberOfLines={1}>
                {visibleKey === key.id ? key.value : `${key.value.slice(0, 10)}••••••••••`}
              </Text>
              <Pressable onPress={() => setVisibleKey(visibleKey === key.id ? null : key.id)}>
                <Text className="ml-2 text-xs font-black text-brand">{visibleKey === key.id ? 'Ocultar' : 'Ver'}</Text>
              </Pressable>
            </View>
            <View className="mt-3 flex-row gap-2">
              <Pressable onPress={copyKey} className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 dark:bg-slate-800">
                <Copy size={14} color="#102018" />
                <Text className="text-xs font-black text-ink dark:text-white">Copiar</Text>
              </Pressable>
              <Pressable onPress={() => setRegenerateId(key.id)} className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2.5">
                <RefreshCw size={14} color="#DC2626" />
                <Text className="text-xs font-black text-red-600">Regenerar</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Text className="mb-3 mt-5 font-black text-ink dark:text-white">Webhook de pagamentos</Text>
        <View className="rounded-2xl bg-white p-4 dark:bg-slate-900">
          <View className="flex-row items-center gap-2">
            <Webhook size={16} color="#16A34A" />
            <Text className="text-sm font-bold text-ink dark:text-white">URL de destino</Text>
          </View>
          <TextInput
            value={webhook}
            onChangeText={setWebhook}
            autoCapitalize="none"
            className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-ink dark:bg-slate-800 dark:text-white"
          />
          <Pressable onPress={saveWebhook} className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-brand py-3">
            <Save size={16} color="#fff" />
            <Text className="font-black text-white">Guardar webhook</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={disconnectId !== null}
        tone="danger"
        title="Desligar esta integração?"
        description="Novos pagamentos por este método ficam indisponíveis até reconectar."
        confirmLabel="Desligar"
        onConfirm={confirmDisconnect}
        onCancel={() => setDisconnectId(null)}
      />
      <ConfirmModal
        visible={regenerateId !== null}
        tone="danger"
        title="Regenerar esta chave?"
        description="A chave actual deixa de funcionar imediatamente. Actualiza qualquer integração externa que a utilize."
        confirmLabel="Regenerar chave"
        onConfirm={confirmRegenerate}
        onCancel={() => setRegenerateId(null)}
      />
    </View>
  );
}
