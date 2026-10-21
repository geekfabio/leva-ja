import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { PrimaryButton, SelectionCard, Stepper, StatusBadge } from "@/components/kit";
import LoginScreen from "@/app/(auth)/login";
import IncidentStep from "@/app/(client)/booking/incident";
import { useBookingStore } from "@/stores/useBookingStore";
import { useSessionStore } from "@/stores/useSessionStore";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true, dismissAll: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => "/"),
  Redirect: () => null,
}));
jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

beforeEach(() => jest.clearAllMocks());

test("o botão principal bloqueia enquanto carrega", () => {
  const onPress = jest.fn();
  render(<PrimaryButton label="Confirmar pedido" loading onPress={onPress} />);
  const button = screen.getByRole("button", { name: "Confirmar pedido" });
  expect(button).toBeDisabled();
  fireEvent.press(button);
  expect(onPress).not.toHaveBeenCalled();
});

test("SelectionCard expõe a semântica de rádio e o estado seleccionado", () => {
  const onPress = jest.fn();
  render(<SelectionCard title="Cartão" description="Visa" selected onPress={onPress} />);
  const card = screen.getByRole("radio", { name: "Cartão. Visa" });
  expect(card).toBeChecked();
  fireEvent.press(card);
  expect(onPress).toHaveBeenCalled();
});

test("Stepper respeita os limites", () => {
  const onChange = jest.fn();
  render(<Stepper label="Piso" value={0} min={0} max={2} onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Diminuir Piso" })).toBeDisabled();
  fireEvent.press(screen.getByRole("button", { name: "Aumentar Piso" }));
  expect(onChange).toHaveBeenCalledWith(1);
});

test("StatusBadge mostra sempre o estado em texto", () => {
  render(<StatusBadge status="en_route" />);
  expect(screen.getByLabelText("Estado: A caminho")).toBeTruthy();
});

test("login valida com Zod e entra na área do cliente", async () => {
  useSessionStore.setState({ role: "client", locationGranted: true });
  render(<LoginScreen />);
  fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
  expect(await screen.findByText("A palavra-passe tem pelo menos 6 caracteres.")).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText("Palavra-passe"), "segredo1");
  fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/home"), { timeout: 2000 });
  expect(useSessionStore.getState().authenticated).toBe(true);
});

test("o reboque começa pelo incidente e avança para a viatura", () => {
  useBookingStore.getState().start("tow");
  render(<IncidentStep />);
  fireEvent.press(screen.getByRole("radio", { name: "Acidente. Colisão ou despiste" }));
  expect(useBookingStore.getState().draft.tow.incident).toBe("accident");
  expect(screen.getByLabelText("Passo 1 de 4")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
  expect(router.push).toHaveBeenCalledWith("/booking/vehicle");
});
