import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppButton } from '@/components/ui/AppButton';
import { ProofRow } from '@/components/ui/ProofRow';
export default function EvidenceScreen() { return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title="Fotos e evidências" subtitle="Anexos do incidente" /><ScrollView contentContainerClassName="pb-28"><View className="mb-5 rounded-3xl bg-ink p-5"><Camera size={28} color="#86EFAC" /><Text className="mt-4 text-xl font-black text-white">Ajuda-nos a preparar o serviço.</Text><Text className="mt-2 text-sm leading-6 text-slate-300">As imagens são simuladas e ficam associadas ao pedido.</Text></View><ProofRow title="Foto geral da viatura" subtitle="JPG · enviada agora" complete /><ProofRow title="Detalhe do problema" subtitle="Adiciona uma imagem do local ou avaria" /><ProofRow title="Documento adicional" subtitle="Opcional" /></ScrollView><View className="absolute bottom-0 left-0 right-0 px-5 pb-7"><AppButton label="Continuar" onPress={() => router.back()} /></View></View>; }
