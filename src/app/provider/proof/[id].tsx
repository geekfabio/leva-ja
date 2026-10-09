import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProofRow } from '@/components/ui/ProofRow';
export default function ProviderProof() { return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title="Provas do serviço" subtitle="Fotos e assinatura mockadas" /><ScrollView contentContainerClassName="pb-28"><ProofRow title="Antes da recolha" subtitle="2 fotos adicionadas" complete /><ProofRow title="Viatura carregada" subtitle="Adicionar foto" /><ProofRow title="Entrega no destino" subtitle="Adicionar foto" /><ProofRow title="Assinatura do cliente" subtitle="Capturar confirmação" /></ScrollView><View className="absolute bottom-0 left-0 right-0 px-5 pb-7"><AppButton label="Guardar provas" onPress={() => router.back()} /></View></View>; }
