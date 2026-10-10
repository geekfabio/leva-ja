import { Modal, Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react-native';

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'brand' | 'danger';
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'brand',
  icon,
  onConfirm,
  onCancel,
}: Props) {
  const danger = tone === 'danger';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/55 px-6" onPress={onCancel}>
        <Pressable onPress={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-slate-900">
          <View className={`h-12 w-12 items-center justify-center rounded-2xl ${danger ? 'bg-red-100' : 'bg-brand-soft'}`}>
            {icon ?? <TriangleAlert size={22} color={danger ? '#DC2626' : '#16A34A'} />}
          </View>
          <Text className="mt-4 text-lg font-black text-ink dark:text-white">{title}</Text>
          {description ? <Text className="mt-2 text-sm leading-6 text-muted">{description}</Text> : null}
          <View className="mt-6 flex-row gap-3">
            <Pressable onPress={onCancel} className="flex-1 rounded-xl bg-slate-100 py-3.5 dark:bg-slate-800">
              <Text className="text-center font-black text-ink dark:text-white">{cancelLabel}</Text>
            </Pressable>
            <Pressable onPress={onConfirm} className={`flex-1 rounded-xl py-3.5 ${danger ? 'bg-red-600' : 'bg-brand'}`}>
              <Text className="text-center font-black text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
