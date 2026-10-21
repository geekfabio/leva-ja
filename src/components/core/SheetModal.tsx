import { ReactNode, forwardRef, useCallback } from "react";
import { View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";

type Props = {
  title?: string;
  children: ReactNode;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
};

/** Folha inferior modal (@gorhom/bottom-sheet) para escolhas, filtros e confirmações. */
export const SheetModal = forwardRef<BottomSheetModal, Props>(function SheetModal(
  { title, children, snapPoints, onDismiss },
  ref,
) {
  const insets = useSafeAreaInsets();
  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );
  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      backdropComponent={backdrop}
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: colors.card, borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: colors.borderStrong, width: 44 }}
      accessibilityLabel={title}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20) + 8, gap: 12 }}
      >
        {title ? (
          <View style={{ paddingVertical: 4 }}>
            <AppText variant="h2" accessibilityRole="header">
              {title}
            </AppText>
          </View>
        ) : null}
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
