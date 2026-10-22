import { View } from "react-native";
import { Camera, CheckCircle2, PenLine } from "lucide-react-native";
import type { DeliveryProofData, Photo } from "@/types/domain";
import { formatLongDateTime } from "@/utils/date";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { Card, IconCircle } from "@/components/core/Card";
import { Checkbox } from "@/components/core/Controls";
import { AddPhotoTile, PhotoTile } from "./Media";
import { SignaturePad } from "./SignaturePad";

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <IconCircle size={44}>{icon}</IconCircle>
      <View style={{ flex: 1 }}>
        <AppText variant="title">{title}</AppText>
        <AppText variant="caption" color={colors.muted}>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

/** Registo do comprovativo de entrega: fotos, assinatura e condição (ref. 46). */
export function DeliveryProofForm({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onSigned,
  goodCondition,
  onConditionChange,
  photoError,
  signatureError,
}: {
  photos: Photo[];
  onAddPhoto: () => void;
  onRemovePhoto: (id: string) => void;
  onSigned: (signed: boolean) => void;
  goodCondition: boolean;
  onConditionChange: (v: boolean) => void;
  photoError?: string;
  signatureError?: string;
}) {
  return (
    <View style={{ gap: 14 }}>
      <Card style={{ gap: 14 }}>
        <SectionTitle icon={<Camera size={22} color={colors.primary} />} title="Adicionar fotos da entrega" subtitle="Tire fotos que comprovem a entrega dos bens" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          {photos.slice(0, 3).map((photo) => (
            <PhotoTile key={photo.id} photo={photo} size="flex" aspect={0.78} onRemove={() => onRemovePhoto(photo.id)} />
          ))}
          {photos.length < 4 ? <AddPhotoTile variant="dashed" onPress={onAddPhoto} label="Tirar foto da entrega" /> : null}
        </View>
        {photoError ? (
          <AppText variant="caption" color={colors.danger} accessibilityRole="alert">
            {photoError}
          </AppText>
        ) : null}
      </Card>
      <Card style={{ gap: 14 }}>
        <SectionTitle icon={<PenLine size={22} color={colors.primary} />} title="Assinatura do cliente" subtitle="Peça ao cliente para assinar confirmando a entrega" />
        <SignaturePad onChange={onSigned} />
        {signatureError ? (
          <AppText variant="caption" color={colors.danger} accessibilityRole="alert">
            {signatureError}
          </AppText>
        ) : null}
      </Card>
      <Checkbox checked={goodCondition} onChange={onConditionChange} label="Tudo entregue em boas condições" />
    </View>
  );
}

/** Comprovativo já registado, apresentado no recibo e no histórico. */
export function DeliveryProofSummary({ proof }: { proof: DeliveryProofData }) {
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <CheckCircle2 size={22} color={colors.accent} />
        <AppText variant="title">Comprovativo de entrega</AppText>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {proof.photos.slice(0, 3).map((photo) => (
          <PhotoTile key={photo.id} photo={photo} size="flex" />
        ))}
      </View>
      <AppText variant="caption" color={colors.muted}>
        Assinado por {proof.signedBy} · {formatLongDateTime(proof.at)}
      </AppText>
      <AppText variant="caption" color={proof.goodCondition ? colors.primary : colors.warning}>
        {proof.goodCondition ? "Entregue em boas condições" : `Ocorrência: ${proof.notes ?? ""}`}
      </AppText>
    </Card>
  );
}
