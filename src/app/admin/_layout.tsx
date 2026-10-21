import {
  useStackOptions,
  webScreenLayout,
} from "@/components/core/ScreenTransitions";
import { Stack } from "expo-router";

const screenLayout = webScreenLayout("fade");
export default function AdminLayout() {
  const options = useStackOptions("fade");
  return <Stack screenOptions={options} screenLayout={screenLayout} />;
}
