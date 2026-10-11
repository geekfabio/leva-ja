import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { LogOut, Save, ShieldCheck } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';

export default function ProfileSettings() {
  const [name, setName] = useState('Armando Trindade');
  const [email, setEmail] = useState('admin@levaja.ao');
  const [phone, setPhone] = useState('+244 923 000 000');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [digestEmails, setDigestEmails] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);

  function saveProfile() {
    toast.success({ title: 'Perfil actualizado', message: 'Os teus dados pessoais foram guardados (mock).' });
  }

  function changePassword() {
    if (!password || password.length < 6) {
      toast.error({ title: 'Password inválida', message: 'Usa pelo menos 6 caracteres.' });
      return;
    }
    if (password !== confirmPassword) {
      toast.error({ title: 'As passwords não coincidem', message: 'Confirma a nova password correctamente.' });
      return;
    }
    toast.success({ title: 'Password alterada', message: 'Usa a nova password no próximo acesso (mock).' });
    setPassword('');
    setConfirmPassword('');
  }

  function logout() {
    setLogoutOpen(false);
    toast.info({ title: 'Sessão terminada', message: 'Até breve, Equipa Leva Já!' });
    router.replace('/admin/login' as never);
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Perfil da conta" subtitle="Dados pessoais e segurança da conta" />
      <ScrollView contentContainerClassName="pb-16">
        <View className="items-center rounded-3xl bg-ink p-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand">
            <Text className="text-xl font-black text-white">{name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text className="mt-3 text-lg font-black text-white">{name}</Text>
          <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            <ShieldCheck size={13} color="#86EFAC" />
            <Text className="text-xs font-bold text-green-200">Administrador</Text>
          </View>
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900">
          <Text className="font-black text-ink dark:text-white">Dados pessoais</Text>
          <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-white">Nome</Text>
          <TextInput value={name} onChangeText={setName} className="rounded-xl bg-slate-100 px-4 py-3 text-ink dark:bg-slate-800 dark:text-white" />
          <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-white">Email</Text>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" className="rounded-xl bg-slate-100 px-4 py-3 text-ink dark:bg-slate-800 dark:text-white" />
          <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-white">Telefone</Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" className="rounded-xl bg-slate-100 px-4 py-3 text-ink dark:bg-slate-800 dark:text-white" />
          <Pressable onPress={saveProfile} className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-brand py-3">
            <Save size={16} color="#fff" />
            <Text className="font-black text-white">Guardar alterações</Text>
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center justify-between rounded-3xl bg-white p-5 dark:bg-slate-900">
          <View className="flex-1 pr-3">
            <Text className="font-black text-ink dark:text-white">Resumo semanal por email</Text>
            <Text className="mt-1 text-sm text-muted">Recebe um resumo das operações todas as segundas-feiras</Text>
          </View>
          <Switch value={digestEmails} onValueChange={setDigestEmails} trackColor={{ true: '#16A34A' }} />
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900">
          <Text className="font-black text-ink dark:text-white">Alterar password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Nova password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-ink dark:bg-slate-800 dark:text-white"
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmar nova password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-ink dark:bg-slate-800 dark:text-white"
          />
          <Pressable onPress={changePassword} className="mt-4 rounded-xl bg-brand-soft py-3">
            <Text className="text-center font-black text-brand">Actualizar password</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => setLogoutOpen(true)} className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-red-50 py-4">
          <LogOut size={18} color="#DC2626" />
          <Text className="font-black text-red-600">Terminar sessão</Text>
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={logoutOpen}
        tone="danger"
        title="Terminar a sessão administrativa?"
        description="Vais precisar de iniciar sessão novamente para aceder ao painel."
        confirmLabel="Terminar sessão"
        onConfirm={logout}
        onCancel={() => setLogoutOpen(false)}
      />
    </View>
  );
}
