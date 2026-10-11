import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Mail, MessageSquare, Send, Smartphone } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppButton } from '@/components/ui/AppButton';
import { toast } from '@/lib/toast';
import { notificationTemplates } from '@/mocks/settings';

const channels = [
  { id: 'push', icon: Smartphone, label: 'Notificações push' },
  { id: 'sms', icon: MessageSquare, label: 'SMS' },
  { id: 'email', icon: Mail, label: 'Email' },
];

export default function NotificationsSettings() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ push: true, sms: true, email: false });
  const [templates, setTemplates] = useState(notificationTemplates.map((template) => ({ ...template, active: true })));

  function toggleChannel(id: string) {
    setEnabled((current) => ({ ...current, [id]: !current[id] }));
    const channel = channels.find((item) => item.id === id);
    if (channel) toast.success({ title: `${channel.label} ${enabled[id] ? 'desactivado' : 'activado'}`, message: 'Preferência de canal actualizada (mock).' });
  }

  function toggleTemplate(id: string) {
    setTemplates((current) => current.map((template) => (template.id === id ? { ...template, active: !template.active } : template)));
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Notificações e campanhas" subtitle="Canais e modelos de comunicação" />
      <ScrollView contentContainerClassName="pb-28">
        <Text className="mb-3 font-black text-ink dark:text-white">Canais activos</Text>
        {channels.map(({ id, icon: Icon, label }) => (
          <View key={id} className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
            <View className="rounded-xl bg-brand-soft p-3">
              <Icon size={18} color="#16A34A" />
            </View>
            <Text className="ml-3 flex-1 font-black text-ink dark:text-white">{label}</Text>
            <Switch value={enabled[id]} onValueChange={() => toggleChannel(id)} trackColor={{ true: '#16A34A' }} />
          </View>
        ))}

        <Text className="mb-3 mt-5 font-black text-ink dark:text-white">Modelos de notificação</Text>
        {templates.map((template) => (
          <View key={template.id} className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
            <View className="flex-1">
              <Text className="font-black text-ink dark:text-white">{template.title}</Text>
              <Text className="mt-1 text-xs text-muted">{template.channel} · {template.audience}</Text>
            </View>
            <Switch value={template.active} onValueChange={() => toggleTemplate(template.id)} trackColor={{ true: '#16A34A' }} />
          </View>
        ))}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 pb-7">
        <AppButton label="Criar nova campanha" icon={<Send size={18} color="#fff" />} onPress={() => router.push('/admin/campaigns' as never)} />
      </View>
    </View>
  );
}
