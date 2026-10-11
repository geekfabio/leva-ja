import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  emoji: string;
  tone?: readonly [string, string];
  size?: number;
};

export function ServiceIcon({ emoji, tone = ['#22C55E', '#14532D'] as const, size = 52 }: Props) {
  const radius = size * 0.32;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        shadowColor: tone[1],
        shadowOpacity: 0.35,
        shadowRadius: size * 0.22,
        shadowOffset: { width: 0, height: size * 0.12 },
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={tone}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1, borderRadius: radius, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -size * 0.3,
            left: -size * 0.2,
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: size * 0.48,
            backgroundColor: 'rgba(255,255,255,0.28)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: -size * 0.3,
            right: -size * 0.25,
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: size * 0.35,
            backgroundColor: 'rgba(0,0,0,0.12)',
          }}
        />
        <Text style={{ fontSize: size * 0.48, lineHeight: size * 0.56 }}>{emoji}</Text>
      </LinearGradient>
    </View>
  );
}
