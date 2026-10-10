import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BadgeCheck, Clock3, XCircle } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProofRow } from '@/components/ui/ProofRow';
import { ServiceIcon } from '@/components/ui/ServiceIcon';

const providerTypes = [
  { id: 'assistance', label: 'Assistência', emoji: '🚛', tone: ['#22C55E', '#15803D'] as const },
  { id: 'transport', label: 'Transportador', emoji: '🚚', tone: ['#16A34A', '#102018'] as const },
] as const;

const proofsByType: Record<(typeof providerTypes)[number]['id'], { title: string; subtitle: string; complete: boolean }[]> = {
  assistance: [
    { title: 'Carta de condução', subtitle: 'Válida até 2031', complete: true },
    { title: 'Seguro da viatura', subtitle: 'Em validação', complete: false },
    { title: 'Registo do reboque', subtitle: 'Em validação', complete: false },
  ],
  transport: [
    { title: 'Carta de condução', subtitle: 'Válida até 2031', complete: true },
    { title: 'Seguro da viatura de carga', subtitle: 'Em validação', complete: false },
    { title: 'Registo da viatura de carga', subtitle: 'Em validação', complete: false },
    { title: 'Comprovativo de capacidade de carga', subtitle: 'Peso/volume máximo suportado', complete: false },
  ],
};

export default function ProviderOnboarding() {
  const [state, setState] = useState('Pendente');
  const [type, setType] = useState<(typeof providerTypes)[number]['id']>('assistance');
  const Icon = state === 'Aprovado' ? BadgeCheck : state === 'Bloqueado' ? XCircle : Clock3;

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Aprovação da conta" subtitle="Documentos e viatura" />
      <ScrollView>
        <View className="rounded-3xl bg-ink p-5">
          <Icon size={30} color="#86EFAC" />
          <Text className="mt-4 text-xl font-black text-white">Estado: {state}</Text>
          <Text className="mt-2 text-sm text-slate-300">Altera o cenário para validar todos os estados mockados.</Text>
        </View>

        <Text className="mb-3 mt-5 font-black text-ink dark:text-white">Tipo de prestador</Text>
        <View className="flex-row gap-3">
          {providerTypes.map(({ id, label, emoji, tone }) => {
            const active = type === id;
            return (
              <Pressable key={id} onPress={() => setType(id)} className={`flex-1 flex-row items-center gap-3 rounded-2xl border p-3 ${active ? 'border-brand bg-brand-soft' : 'border-transparent bg-white dark:bg-slate-900'}`}>
                <ServiceIcon emoji={emoji} tone={tone} size={36} />
                <Text className="font-black text-ink dark:text-white">{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-5 flex-row gap-2">
          {['Pendente', 'Aprovado', 'Bloqueado'].map((item) => (
            <Pressable key={item} onPress={() => setState(item)} className={`flex-1 rounded-xl py-3 ${state === item ? 'bg-brand' : 'bg-white dark:bg-slate-900'}`}>
              <Text className={`text-center text-xs font-black ${state === item ? 'text-white' : 'text-ink dark:text-white'}`}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View className="mt-5"><StatusBadge status={state} /></View>

        <View className="mt-4">
          {proofsByType[type].map((proof) => (
            <ProofRow key={proof.title} title={proof.title} subtitle={proof.subtitle} complete={proof.complete} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
