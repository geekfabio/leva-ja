import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { BottomAction } from "./BottomAction";

type Props = {
  children: ReactNode;
  /** Cabeçalho fixo fora da área rolável. */
  header?: ReactNode;
  /** Acção fixa no fundo (ver BottomAction). */
  footer?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  background?: string;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  gap?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
};

/** Contentor base de todos os ecrãs: área segura, teclado, scroll e acção inferior. */
export function ScreenContainer({
  children,
  header,
  footer,
  scroll = true,
  padded = true,
  background = colors.background,
  edges = ["top"],
  contentStyle,
  gap = 16,
  refreshing,
  onRefresh,
}: Props) {
  const content = [
    { paddingHorizontal: padded ? 20 : 0, paddingBottom: footer ? 16 : 32, gap },
    contentStyle,
  ];
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {header}
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ flexGrow: 1 }, ...content]}
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, ...content]}>{children}</View>
        )}
        {footer ? <BottomAction>{footer}</BottomAction> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
