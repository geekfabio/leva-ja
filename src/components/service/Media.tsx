import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Camera, ImagePlus, Plus, X } from "lucide-react-native";
import type { Photo } from "@/types/domain";
import { photoAssets, vehicleArt, type PhotoAssetKey, type VehicleArtKey } from "@/mocks/assets";
import { colors, radius } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";

/** Ilustração 3D local de uma viatura (pickup, reboque, carrinha, camião…). */
export function VehicleImage({ art, width = 140, height, label }: { art: VehicleArtKey; width?: number; height?: number; label?: string }) {
  return (
    <Image
      source={vehicleArt[art]}
      style={{ width, height: height ?? width * 0.64 }}
      contentFit="contain"
      accessibilityLabel={label ?? "Ilustração da viatura"}
    />
  );
}

export function PhotoTile({
  photo,
  size = 96,
  onRemove,
  rounded = radius.md,
  aspect = 1,
}: {
  photo: Photo;
  size?: number | "flex";
  onRemove?: () => void;
  rounded?: number;
  aspect?: number;
}) {
  const source = photoAssets[photo.asset as PhotoAssetKey];
  return (
    <View style={size === "flex" ? { flex: 1, aspectRatio: aspect } : { width: size, height: size / aspect }}>
      <Image
        source={source}
        style={{ width: "100%", height: "100%", borderRadius: rounded, backgroundColor: "#E6ECE8" }}
        contentFit="cover"
        accessibilityLabel={photo.caption}
        transition={150}
      />
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover foto: ${photo.caption}`}
          onPress={onRemove}
          hitSlop={8}
          style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" }}
        >
          <X size={16} color={colors.ink} strokeWidth={2.5} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Espaço para adicionar foto (câmara simulada). */
export function AddPhotoTile({ onPress, size = "flex", variant = "placeholder", label = "Adicionar foto" }: { onPress: () => void; size?: number | "flex"; variant?: "placeholder" | "dashed"; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        size === "flex" ? { flex: 1, aspectRatio: 1 } : { width: size, height: size },
        {
          borderRadius: radius.md,
          backgroundColor: variant === "dashed" ? colors.primarySoft : "#ECEFED",
          borderWidth: variant === "dashed" ? 1.5 : 0,
          borderStyle: "dashed",
          borderColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {variant === "dashed" ? <Camera size={30} color={colors.primary} /> : <ImagePlus size={32} color={colors.subtle} />}
      {variant === "placeholder" ? (
        <View style={{ position: "absolute", right: 8, bottom: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.subtle, alignItems: "center", justifyContent: "center" }}>
          <Plus size={16} color={colors.white} strokeWidth={3} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function PhotoCount({ count }: { count: number }) {
  return (
    <AppText variant="caption" color={colors.muted}>
      {count === 1 ? "1 foto registada" : `${count} fotos registadas`}
    </AppText>
  );
}
