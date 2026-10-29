import type { ReactElement } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { act, fireEvent, render as rtlRender, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import CargoStep from "@/app/(client)/booking/cargo";
import { useBookingStore } from "@/stores/useBookingStore";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true, dismissAll: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => "/"),
  Redirect: () => null,
}));
jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

/** O campo «Tipo de carga» abre uma folha (bottom sheet), que precisa do fornecedor. */
const render = (ui: ReactElement) => rtlRender(<BottomSheetModalProvider>{ui}</BottomSheetModalProvider>);
const vehicle = (name: RegExp) => screen.getByRole("radio", { name });
const checked = (name: RegExp) => vehicle(name).props.accessibilityState?.checked;

beforeEach(() => {
  jest.clearAllMocks();
  useBookingStore.getState().start("cargo");
});

test("escolher o peso selecciona a viatura adequada e explica a sugestão", () => {
  render(<CargoStep />);
  expect(checked(/^Pickup/)).toBe(true);

  fireEvent.press(screen.getByRole("radio", { name: "301 – 500 kg" }));
  expect(checked(/^Carrinha/)).toBe(true);
  expect(checked(/^Pickup/)).toBe(false);
  expect(screen.getByText(/Sugerimos carrinha para 301 – 500 kg/)).toBeTruthy();

  fireEvent.press(screen.getByRole("radio", { name: "Mais de 500 kg" }));
  expect(checked(/^Camião/)).toBe(true);

  fireEvent.press(screen.getByRole("radio", { name: "Até 100 kg" }));
  expect(checked(/^Pickup/)).toBe(true);
});

test("o utilizador pode trocar a viatura sugerida; a escolha segue para o pedido", async () => {
  render(<CargoStep />);
  fireEvent.press(screen.getByRole("radio", { name: "Mais de 500 kg" }));
  fireEvent.press(vehicle(/^Carrinha/));
  expect(checked(/^Carrinha/)).toBe(true);
  expect(screen.queryByText(/Sugerimos/)).toBeNull();

  await act(async () => fireEvent.press(screen.getByRole("button", { name: "Continuar" })));
  await waitFor(() => expect(router.push).toHaveBeenCalled());
  expect(useBookingStore.getState().draft.cargo).toMatchObject({ weight: "over500", vehicleClass: "van" });
});

test("entrega de mercadoria: tuk-tuk para cargas pequenas, troca automática ao subir peso ou volume", async () => {
  useBookingStore.getState().start("cargo", "goods");
  render(<CargoStep />);
  expect(checked(/^Tuk-tuk/)).toBe(true);

  fireEvent.press(screen.getByRole("radio", { name: "101 – 300 kg" }));
  expect(checked(/^Pickup/)).toBe(true);

  // «Até 100 kg» é também a descrição do cartão do tuk-tuk: o primeiro é o peso.
  fireEvent.press(screen.getAllByRole("radio", { name: "Até 100 kg" })[0]!);
  expect(checked(/^Tuk-tuk/)).toBe(true);
  expect(screen.getByText(/Sugerimos tuk-tuk para até 100 kg e volume pequeno/)).toBeTruthy();

  fireEvent.press(screen.getByRole("radio", { name: "Médio · 1 a 3 m³" }));
  expect(checked(/^Pickup/)).toBe(true);
});
