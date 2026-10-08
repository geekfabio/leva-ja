import { Pressable, Text } from 'react-native';
import { ReactNode } from 'react';

type Props = { label: string; onPress?: () => void; icon?: ReactNode; variant?: 'primary' | 'ghost' };

export function AppButton({ label, onPress, icon, variant = 'primary' }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 ${primary ? 'bg-brand' : 'bg-brand-soft'}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {icon}
      <Text className={`font-semibold ${primary ? 'text-white' : 'text-brand'}`}>{label}</Text>
    </Pressable>
  );
}
