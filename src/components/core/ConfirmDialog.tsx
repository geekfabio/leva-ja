import { ReactNode } from "react";
import { Dialog, Portal } from "react-native-paper";
import { View } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";
import { DangerButton, PrimaryButton, TextButton } from "./Buttons";

/** Confirmação modal (React Native Paper Dialog) para acções irreversíveis. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Voltar",
  destructive,
  loading,
  onConfirm,
  onCancel,
  children,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const Confirm = destructive ? DangerButton : PrimaryButton;
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} style={{ backgroundColor: colors.card, borderRadius: 24 }}>
        <Dialog.Content style={{ gap: 8, paddingTop: 8 }}>
          <AppText variant="h2" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body" color={colors.muted}>
            {message}
          </AppText>
          {children}
        </Dialog.Content>
        <View style={{ paddingHorizontal: 24, paddingBottom: 20, gap: 4 }}>
          <Confirm label={confirmLabel} onPress={onConfirm} loading={loading} />
          <TextButton label={cancelLabel} onPress={onCancel} />
        </View>
      </Dialog>
    </Portal>
  );
}
