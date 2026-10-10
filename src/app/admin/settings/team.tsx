import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Send, UserPlus } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';
import { teamMembers, type TeamMember } from '@/mocks/settings';

const roleColors: Record<TeamMember['role'], string> = {
  Administrador: 'bg-brand-soft text-brand',
  Operações: 'bg-blue-100 text-blue-700',
  Suporte: 'bg-amber-100 text-amber-700',
  Financeiro: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<TeamMember['status'], string> = {
  Activo: 'bg-brand-soft text-brand',
  Convidado: 'bg-amber-100 text-amber-700',
  Suspenso: 'bg-red-100 text-red-700',
};

export default function TeamSettings() {
  const [members, setMembers] = useState(teamMembers);
  const [email, setEmail] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  function invite() {
    setInviteOpen(false);
    setMembers((current) => [
      { id: `AD-0${current.length + 1}`, name: email.split('@')[0] ?? 'Novo membro', email, role: 'Operações', status: 'Convidado' },
      ...current,
    ]);
    toast.success({ title: 'Convite enviado', message: `${email} vai receber um link de acesso ao painel (mock).` });
    setEmail('');
  }

  function toggleSuspend(member: TeamMember) {
    const next = member.status === 'Suspenso' ? 'Activo' : 'Suspenso';
    setMembers((current) => current.map((item) => (item.id === member.id ? { ...item, status: next } : item)));
    toast.success({ title: next === 'Suspenso' ? 'Membro suspenso' : 'Membro reactivado', message: `${member.name} ${next === 'Suspenso' ? 'perdeu' : 'recuperou'} o acesso ao painel (mock).` });
  }

  function removeMember() {
    const member = members.find((item) => item.id === removeId);
    setMembers((current) => current.filter((item) => item.id !== removeId));
    setRemoveId(null);
    if (member) toast.success({ title: 'Membro removido', message: `${member.name} já não tem acesso ao painel administrativo (mock).` });
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Equipa e permissões" subtitle={`${members.length} contas administrativas`} />
      <ScrollView contentContainerClassName="pb-16">
        <View className="rounded-3xl bg-white p-5 dark:bg-slate-900">
          <Text className="font-black text-ink dark:text-white">Convidar novo membro</Text>
          <View className="mt-3 flex-row items-center gap-2">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@levaja.ao"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-ink dark:bg-slate-800 dark:text-white"
            />
            <Pressable disabled={!email.includes('@')} onPress={() => setInviteOpen(true)} className={`rounded-xl bg-brand p-3.5 ${!email.includes('@') ? 'opacity-40' : ''}`}>
              <UserPlus size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        <Text className="mb-3 mt-5 font-black text-ink dark:text-white">Membros</Text>
        {members.map((member) => (
          <View key={member.id} className="mb-3 rounded-2xl bg-white p-4 dark:bg-slate-900">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
                <Text className="text-xs font-black text-brand">{member.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-black text-ink dark:text-white">{member.name}</Text>
                <Text className="mt-1 text-xs text-muted">{member.email}</Text>
              </View>
            </View>
            <View className="mt-3 flex-row items-center gap-2">
              <View className={`rounded-full px-2 py-1 ${roleColors[member.role].split(' ')[0]}`}>
                <Text className={`text-[10px] font-black ${roleColors[member.role].split(' ')[1]}`}>{member.role.toUpperCase()}</Text>
              </View>
              <View className={`rounded-full px-2 py-1 ${statusColors[member.status].split(' ')[0]}`}>
                <Text className={`text-[10px] font-black ${statusColors[member.status].split(' ')[1]}`}>{member.status.toUpperCase()}</Text>
              </View>
              <View className="flex-1" />
              <Pressable onPress={() => toggleSuspend(member)} className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
                <Text className="text-xs font-black text-ink dark:text-white">{member.status === 'Suspenso' ? 'Reactivar' : 'Suspender'}</Text>
              </Pressable>
              <Pressable onPress={() => setRemoveId(member.id)} className="rounded-lg bg-red-50 px-3 py-2">
                <Text className="text-xs font-black text-red-600">Remover</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <ConfirmModal
        visible={inviteOpen}
        title="Enviar convite?"
        description={`Um link de acesso será enviado para ${email} com permissões de Operações (mock).`}
        confirmLabel="Enviar convite"
        icon={<Send size={20} color="#16A34A" />}
        onConfirm={invite}
        onCancel={() => setInviteOpen(false)}
      />
      <ConfirmModal
        visible={removeId !== null}
        tone="danger"
        title="Remover este membro?"
        description="A conta perde imediatamente o acesso ao painel administrativo. Esta acção pode ser revertida com um novo convite."
        confirmLabel="Remover"
        onConfirm={removeMember}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}
