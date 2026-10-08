import { Pressable, Text } from 'react-native';
import { ReactNode } from 'react';

type Props = { label: string; onPress?: () => void; icon?: ReactNode; variant?: 'primary' | 'ghost'; disabled?: boolean };

export function AppButton({ label, onPress, icon, variant = 'primary', disabled = false }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      className={`min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 ${primary ? 'bg-brand' : 'bg-brand-soft'} ${disabled ? 'opacity-45' : ''}`}
      style={({ pressed }) => ({ opacity: pressed || disabled ? 0.85 : 1 })}
    >
      {icon}
      <Text className={`font-semibold ${primary ? 'text-white' : 'text-brand'}`}>{label}</Text>
    </Pressable>
  );
}
