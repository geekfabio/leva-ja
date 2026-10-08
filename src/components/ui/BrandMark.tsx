import { Image, Text, View } from 'react-native';

type BrandMarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  const wordmark = inverse ? 'text-white' : 'text-ink dark:text-white';

  return (
    <View className="flex-row items-center gap-2">
      <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-brand shadow-sm">
        <Image source={require('../../../assets/brand/leva-ja-mark.png')} className="h-10 w-10" resizeMode="contain" accessibilityLabel="Símbolo Leva Já" />
      </View>
      {!compact ? <Text className={`text-lg font-black tracking-tight ${wordmark}`}>LEVA JÁ</Text> : null}
    </View>
  );
}
