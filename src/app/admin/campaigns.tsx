import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Bell, Send } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppButton } from '@/components/ui/AppButton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';

export default function Campaigns() {
  const [audience, setAudience] = useState('Clientes');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  function send() {
    setConfirmOpen(false);
    toast.success({ title: 'Campanha enviada', message: `Notificação enviada para ${audience.toLowerCase()} (mock).` });
    setTitle('');
    setMessage('');
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Notificações e campanhas" subtitle="Criar aviso mockado" />
      <ScrollView contentContainerClassName="pb-28">
        <View className="rounded-3xl bg-ink p-5">
          <Bell size={27} color="#86EFAC" />
          <Text className="mt-4 text-xl font-black text-white">Comunicação segmentada</Text>
          <Text className="mt-2 text-sm text-slate-300">Envia notificações para clientes, prestadores ou ambos.</Text>
        </View>

        <Text className="mb-3 mt-6 font-black text-ink dark:text-white">Audiência</Text>
        <View className="flex-row gap-2">
          {['Clientes', 'Prestadores', 'Todos'].map((item) => (
            <Pressable key={item} onPress={() => setAudience(item)} className={`flex-1 rounded-xl py-3 ${audience === item ? 'bg-brand' : 'bg-white dark:bg-slate-900'}`}>
              <Text className={`text-center text-xs font-black ${audience === item ? 'text-white' : 'text-ink dark:text-white'}`}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Título da campanha"
          placeholderTextColor="#94A3B8"
          className="mt-5 rounded-xl bg-white p-4 text-ink dark:bg-slate-900 dark:text-white"
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Mensagem"
          placeholderTextColor="#94A3B8"
          className="mt-3 min-h-28 rounded-xl bg-white p-4 text-ink dark:bg-slate-900 dark:text-white"
          multiline
        />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 pb-7">
        <AppButton
          label="Enviar campanha"
          icon={<Send size={18} color="#fff" />}
          disabled={!title.trim() || !message.trim()}
          onPress={() => setConfirmOpen(true)}
        />
      </View>

      <ConfirmModal
        visible={confirmOpen}
        title="Enviar esta campanha?"
        description={`"${title}" será enviada imediatamente para ${audience.toLowerCase()} (notificação simulada).`}
        confirmLabel="Enviar agora"
        onConfirm={send}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
}
