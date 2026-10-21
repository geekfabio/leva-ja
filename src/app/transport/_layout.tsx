import {
  useStackOptions,
  webScreenLayout,
} from "@/components/core/ScreenTransitions";
import { Stack } from "expo-router";

const screenLayout = webScreenLayout("push");

export default function TransportLayout() {
  const options = useStackOptions("push");
  return <Stack screenOptions={options} screenLayout={screenLayout} />;
}
