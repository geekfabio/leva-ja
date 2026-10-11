import { fireEvent, render, screen } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";
import PhoneScreen from "@/app/(auth)/phone";
import OtpScreen from "@/app/(auth)/otp";
import ServiceScreen from "@/app/request/service";
import DestinationScreen from "@/app/request/destination";
import { AppButton } from "@/components/ui/AppButton";
import { useRequestDraft } from "@/stores/useRequestDraft";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));
jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({});
  useRequestDraft.getState().reset();
});

test("the phone form prevents invalid numbers and preserves the partner role", () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ role: "provider" });
  render(<PhoneScreen />);
  fireEvent.changeText(screen.getByLabelText("Número de telemóvel"), "123");
  expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  fireEvent.changeText(
    screen.getByLabelText("Número de telemóvel"),
    "923456789",
  );
  fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/(auth)/otp",
    params: { phone: "923456789", role: "provider" },
  });
});

test("an incorrect code shows feedback; the demo code opens the partner area", () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ role: "provider" });
  render(<OtpScreen />);
  fireEvent.changeText(
    screen.getByLabelText("Código de confirmação"),
    "999999",
  );
  fireEvent.press(screen.getByRole("button", { name: "Confirmar e entrar" }));
  expect(router.replace).not.toHaveBeenCalled();
  expect(
    screen.getByText("Código incorrecto. Nesta demonstração, usa 123456."),
  ).toBeTruthy();
  fireEvent.changeText(
    screen.getByLabelText("Código de confirmação"),
    "123456",
  );
  fireEvent.press(screen.getByRole("button", { name: "Confirmar e entrar" }));
  expect(router.replace).toHaveBeenCalledWith("/provider");
});

test("service choices survive returning to the request screen", () => {
  const view = render(<ServiceScreen />);
  fireEvent.press(screen.getByRole("radio", { name: "Bateria descarregada" }));
  view.unmount();
  render(<ServiceScreen />);
  expect(
    screen.getByRole("radio", { name: "Bateria descarregada" }),
  ).toBeChecked();
});

test("destination search filters suggestions and confirmation saves the choice", () => {
  render(<DestinationScreen />);
  fireEvent.changeText(screen.getByLabelText("Pesquisar destino"), "Mutamba");
  expect(
    screen.queryByRole("radio", { name: "Oficina Auto Centro" }),
  ).toBeNull();
  fireEvent.press(screen.getByRole("radio", { name: "Auto Rápido Luanda" }));
  fireEvent.press(screen.getByRole("button", { name: "Confirmar destino" }));
  expect(useRequestDraft.getState().destination).toBe("Auto Rápido Luanda");
  expect(router.back).toHaveBeenCalledTimes(1);
});

test("loading actions cannot be submitted twice", () => {
  const onPress = jest.fn();
  render(<AppButton label="Continuar" loading onPress={onPress} />);
  fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
  expect(onPress).not.toHaveBeenCalled();
});

test("cargo vehicle selection uses labelled 3D artwork and preserves the choice", () => {
  useRequestDraft.getState().reset("light_cargo");
  const VehicleScreen = require("@/app/request/vehicle").default;
  render(<VehicleScreen />);
  expect(screen.getByLabelText("Imagem 3D: Pickup · tipo Hilux")).toBeTruthy();
  fireEvent.press(screen.getByRole("radio", { name: "Carrinha fechada" }));
  expect(useRequestDraft.getState().vehicleType).toBe("van");
  fireEvent.press(screen.getByRole("button", { name: "Confirmar viatura" }));
  expect(router.push).toHaveBeenCalledWith("/request/location");
});

test("moving details require a load description, weight and dimensions before continuing", () => {
  useRequestDraft.getState().reset("moving");
  const IncidentScreen = require("@/app/request/incident").default;
  render(<IncidentScreen />);
  expect(
    screen.getByRole("button", { name: "Escolher transporte" }),
  ).toBeDisabled();
  fireEvent.changeText(
    screen.getByLabelText("O que vais levar na mudança?"),
    "Sofá e 12 caixas",
  );
  fireEvent.changeText(
    screen.getByLabelText("Peso total aproximado (kg)"),
    "250",
  );
  fireEvent.changeText(
    screen.getByLabelText("Dimensões do maior volume"),
    "2 m × 1 m × 1 m",
  );
  expect(
    screen.getByRole("button", { name: "Escolher transporte" }),
  ).toBeEnabled();
  fireEvent.press(screen.getByRole("button", { name: "Escolher transporte" }));
  expect(router.push).toHaveBeenCalledWith("/request/vehicle");
});

test("payment confirmation creates only one request when pressed twice", () => {
  const { useOrderStore } = require("@/stores/useOrderStore");
  useRequestDraft.getState().reset("moving");
  useRequestDraft
    .getState()
    .update({
      cargoDescription: "Sofá e 12 caixas",
      weightKg: "250",
      dimensions: "2 m × 1 m × 1 m",
      destination: "Rua 12, Talatona",
    });
  const initialCount = useOrderStore.getState().orders.length;
  const PaymentScreen = require("@/app/request/payment").default;
  render(<PaymentScreen />);
  fireEvent.press(screen.getByRole("button", { name: "Confirmar pedido" }));
  fireEvent.press(screen.getByRole("button", { name: "Confirmar pedido" }));
  expect(useOrderStore.getState().orders).toHaveLength(initialCount + 1);
  expect(useOrderStore.getState().selectedOrder.cargoDescription).toBe(
    "Sofá e 12 caixas",
  );
  expect(router.replace).toHaveBeenCalledTimes(1);
});
