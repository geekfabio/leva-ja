import { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render as rtlRender, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import ReportScreen from "@/app/(client)/help/report";
import AlertsScreen from "@/app/(client)/alerts";
import EstimateStep from "@/app/(client)/booking/estimate";
import { buildNotifications } from "@/features/notifications/build";
import { useAccountStore } from "@/stores/useAccountStore";
import { useBookingStore } from "@/stores/useBookingStore";
import { useServiceStore } from "@/stores/useServiceStore";
import { useSessionStore } from "@/stores/useSessionStore";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => "/"),
}));
jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

const render = (ui: ReactElement) => rtlRender(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  useServiceStore.getState().reset();
  useSessionStore.setState({ role: "client" });
});

test("ocorrência: renderiza sem ciclo de actualizações e lista os pedidos do cliente", () => {
  render(<ReportScreen />);
  expect(screen.getByText("O que aconteceu?")).toBeTruthy();
  expect(screen.getAllByRole("radio").length).toBeGreaterThan(0);
});

test("notificações do cliente vêm da cronologia dos pedidos e marcam-se como lidas", () => {
  const { requests } = useServiceStore.getState();
  const items = buildNotifications("client", { requests, clientId: "cli-armando", transactions: [], documents: [] });
  expect(items.some((n) => n.title === "Pagamento confirmado")).toBe(true);
  render(<AlertsScreen />);
  fireEvent.press(screen.getByRole("button", { name: "Marcar como lidas" }));
  expect(useAccountStore.getState().readNotifications.length).toBe(items.length);
  expect(screen.queryByRole("button", { name: "Marcar como lidas" })).toBeNull();
});

test("estimativa sem destino oferece voltar ao trajecto", () => {
  useBookingStore.getState().start("cargo");
  render(<EstimateStep />);
  fireEvent.press(screen.getByRole("button", { name: "Escolher trajecto" }));
  expect(router.replace).toHaveBeenCalledWith("/booking/route");
});
