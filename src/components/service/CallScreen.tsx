import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path } from "react-native-svg";
import { router } from "expo-router";
import { Grid3x3, MicOff, Mic, PhoneOff, Volume2 } from "lucide-react-native";
import type { AvatarKey } from "@/mocks/assets";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { Avatar } from "@/components/core/Avatar";
import { PulseRings } from "@/components/map/PulseRings";

function CallToggle({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon: React.ReactNode }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: active }} accessibilityLabel={label} onPress={onPress} style={{ alignItems: "center", gap: 8 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: active ? colors.accent : "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", borderWidth: active ? 0 : 1, borderColor: "rgba(255,255,255,0.2)" }}>
        {icon}
      </View>
      <AppText variant="caption" color={colors.white}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** 25 · Chamada simulada: sem áudio real, apenas estados e temporizador. */
export function CallScreen({ name, subtitle, initials, photo, from, to }: { name: string; subtitle: string; initials: string; photo?: AvatarKey; from: string; to: string }) {
  const [state, setState] = useState<"calling" | "connected" | "ended">("calling");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [keypad, setKeypad] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setState("connected"), 2200);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (state !== "connected") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);
  const end = () => {
    setState("ended");
    setTimeout(() => router.back(), 700);
  };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const status = state === "calling" ? "A ligar…" : state === "connected" ? "Chamada em curso" : "Chamada terminada";

  return (
    <View style={{ flex: 1, backgroundColor: colors.deeper }}>
      <StatusBar style="light" />
      <Svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 10 }, (_, i) => (
          <Path key={i} d={`M${i * 50 - 100} 0 L ${i * 50 + 60} 860`} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
        ))}
        <Path d="M90 100 C 150 100, 140 150, 200 160 S 330 240, 370 280" stroke={colors.accent} strokeWidth={4} fill="none" />
        <Circle cx={90} cy={100} r={9} fill={colors.deeper} stroke={colors.accent} strokeWidth={4} />
        <Circle cx={370} cy={280} r={9} fill={colors.deeper} stroke={colors.accent} strokeWidth={4} />
      </Svg>
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16 }}>
        <View style={{ alignSelf: "stretch", flexDirection: "row", justifyContent: "space-between" }}>
          <AppText variant="label" color={colors.white}>
            {from}
          </AppText>
          <AppText variant="label" color={colors.white}>
            {to}
          </AppText>
        </View>
        <View style={{ alignItems: "center", gap: 8 }} accessible accessibilityLabel={`${status} com ${name}${state === "connected" ? `, ${time}` : ""}`}>
          <View style={{ borderWidth: 4, borderColor: colors.accent, borderRadius: 110, padding: 4 }}>
            {state === "calling" ? <PulseRings x={96} y={96} size={300} /> : null}
            <Avatar name={name} initials={initials} photo={photo} size={180} />
          </View>
          <AppText variant="h1" color={colors.white} style={{ marginTop: 12 }}>
            {name}
          </AppText>
          <AppText variant="h3" weight="regular" color="#D3EFDF">
            {subtitle}
          </AppText>
          <AppText variant="title" color="#7BE3A6" style={{ marginTop: 12 }} accessibilityLiveRegion="polite">
            {status}
          </AppText>
          <AppText variant="h2" color={colors.white}>
            {state === "connected" ? time : " "}
          </AppText>
        </View>
        {keypad ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", width: 240, justifyContent: "center", gap: 12 }}>
            {"123456789*0#".split("").map((k) => (
              <View key={k} style={{ width: 64, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
                <AppText variant="h3" color={colors.white}>
                  {k}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
        <View style={{ alignSelf: "stretch", gap: 28 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <CallToggle label="Silenciar" active={muted} onPress={() => setMuted((v) => !v)} icon={muted ? <MicOff size={30} color={colors.white} /> : <Mic size={30} color={colors.white} />} />
            <CallToggle label="Teclado" active={keypad} onPress={() => setKeypad((v) => !v)} icon={<Grid3x3 size={30} color={colors.white} />} />
            <CallToggle label="Altifalante" active={speaker} onPress={() => setSpeaker((v) => !v)} icon={<Volume2 size={30} color={colors.white} />} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Terminar chamada"
            onPress={end}
            style={({ pressed }) => ({ minHeight: 60, borderRadius: 30, backgroundColor: pressed ? "#B42318" : colors.danger, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 })}
          >
            <PhoneOff size={24} color={colors.white} />
            <AppText variant="title" color={colors.white}>
              Terminar chamada
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
