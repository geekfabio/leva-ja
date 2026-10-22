import { View } from "react-native";
import { Image } from "expo-image";
import { BadgeCheck } from "lucide-react-native";
import { imageSource } from "@/theme/images";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";

/** Fotografia (quando existe no mock) ou iniciais, com selo de verificação opcional. */
export function Avatar({
  name,
  initials,
  photo,
  size = 56,
  verified,
  online,
}: {
  name: string;
  initials: string;
  /** URL ou chave de imagem local (campo `avatar` de cliente/prestador). */
  photo?: string;
  size?: number;
  verified?: boolean;
  online?: boolean;
}) {
  return (
    <View accessible accessibilityLabel={`Fotografia de ${name}${verified ? ", verificado" : ""}`} style={{ width: size, height: size }}>
      {photo ? (
        <Image source={imageSource(photo)} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.deep,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText weight="bold" color={colors.white} style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}>
            {initials}
          </AppText>
        </View>
      )}
      {verified ? (
        <View
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            backgroundColor: colors.card,
            borderRadius: 999,
            padding: 1,
          }}
        >
          <BadgeCheck size={Math.max(16, size * 0.3)} color={colors.white} fill={colors.accent} />
        </View>
      ) : null}
      {online ? (
        <View
          style={{
            position: "absolute",
            right: 1,
            bottom: 1,
            width: size * 0.24,
            height: size * 0.24,
            borderRadius: size,
            backgroundColor: colors.accent,
            borderWidth: 2,
            borderColor: colors.card,
          }}
        />
      ) : null}
    </View>
  );
}
