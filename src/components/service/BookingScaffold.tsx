import { ReactNode } from "react";
import { ArrowRight } from "lucide-react-native";
import { AppHeader } from "@/components/core/AppHeader";
import { PrimaryButton } from "@/components/core/Buttons";
import { ScreenContainer } from "@/components/core/ScreenContainer";
import { colors } from "@/theme/colors";

/** Estrutura comum dos passos do pedido: marca, "x de y" e "Continuar" fixo no fundo. */
export function BookingScaffold({
  step,
  children,
  onContinue,
  continueLabel = "Continuar",
  loading,
  disabled,
  header,
  padded = true,
}: {
  step?: { current: number; total: number };
  children: ReactNode;
  onContinue: () => void;
  continueLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  header?: ReactNode;
  padded?: boolean;
}) {
  return (
    <ScreenContainer
      header={header ?? <AppHeader brand step={step} />}
      padded={padded}
      gap={18}
      footer={
        <PrimaryButton
          label={continueLabel}
          onPress={onContinue}
          loading={loading}
          disabled={disabled}
          trailingIcon={<ArrowRight size={22} color={colors.white} />}
        />
      }
    >
      {children}
    </ScreenContainer>
  );
}
