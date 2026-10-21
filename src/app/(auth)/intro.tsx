import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import { Appear, AppText, DotsIndicator, PrimaryButton, TextButton } from "@/components/kit";
import { illustrations } from "@/theme/images";
import { useSessionStore } from "@/stores/useSessionStore";
import { swap } from "@/features/navigation";
import { colors } from "@/theme/colors";

const slides = [
  { image: illustrations.onboardingAssistance, title: "Ajuda quando\nprecisas", text: "Pede reboque, transporte de carga ou mudança em poucos passos." },
  { image: illustrations.onboardingTracking, title: "Acompanha\nem tempo real", text: "Vê a chegada do teu prestador no mapa." },
  { image: illustrations.onboardingSafety, title: "Mais segurança\nna estrada", text: "Prestadores verificados e apoio sempre perto." },
];

/** 02–04 · Onboarding: assistência, acompanhamento e segurança. */
export default function IntroScreen() {
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 520);
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const finish = () => {
    useSessionStore.getState().completeOnboarding();
    swap("/profile-select");
  };
  const next = () => {
    if (page === slides.length - 1) return finish();
    scroller.current?.scrollTo({ x: pageWidth * (page + 1), animated: true });
    setPage(page + 1);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / pageWidth));
  const last = page === slides.length - 1;

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView ref={scroller} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScroll} style={{ flex: 1 }}>
        {slides.map((slide, i) => (
          <View key={i} style={{ width: pageWidth, flex: 1 }} accessibilityElementsHidden={i !== page} importantForAccessibility={i === page ? "auto" : "no-hide-descendants"}>
            <View style={{ flex: 1.25 }}>
              <Image source={slide.image} style={{ flex: 1 }} contentFit="cover" contentPosition="top" accessibilityLabel="" />
            </View>
            <Appear key={i === page ? `on-${i}` : `off-${i}`} style={{ flex: 0.75, paddingHorizontal: 28, paddingTop: 20, alignItems: "center", gap: 12 }}>
              <AppText variant="h1" align="center" accessibilityRole="header" style={{ fontSize: 32, lineHeight: 38 }}>
                {slide.title}
              </AppText>
              <AppText variant="body" color={colors.text} align="center" style={{ fontSize: 17, lineHeight: 25 }}>
                {slide.text}
              </AppText>
            </Appear>
          </View>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingBottom: 16, gap: 18 }}>
        <DotsIndicator count={slides.length} active={page} />
        <PrimaryButton
          label={last ? "Começar" : "Continuar"}
          onPress={next}
          trailingIcon={last ? undefined : <ArrowRight size={22} color={colors.white} />}
        />
        <TextButton label={last ? " " : "Saltar"} onPress={finish} disabled={last} />
      </View>
    </SafeAreaView>
  );
}
