import { Text, View } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';

type BrandMarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  const wordmark = inverse ? 'text-white' : 'text-ink dark:text-white';

  return (
    <View className="flex-row items-center gap-2">
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand shadow-sm">
        <ArrowUpRight size={22} color="#FFFFFF" strokeWidth={2.8} />
      </View>
      {!compact ? <Text className={`text-lg font-black tracking-tight ${wordmark}`}>LEVA JÁ</Text> : null}
    </View>
  );
}
