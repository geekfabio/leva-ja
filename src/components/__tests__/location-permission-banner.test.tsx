import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render as rtlRender, screen, waitFor } from "@testing-library/react-native";
import { LocationPermissionBanner } from "@/components/kit";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

const render = () => rtlRender(<QueryClientProvider client={new QueryClient()}>{<LocationPermissionBanner />}</QueryClientProvider>);

describe("LocationPermissionBanner", () => {
  it("aparece quando a localização está desligada e fecha ao tocar em Agora não", async () => {
    render();
    await waitFor(() => expect(screen.getByText("Localização desligada")).toBeTruthy());
    fireEvent.press(screen.getByRole("button", { name: "Agora não" }));
    await waitFor(() => expect(screen.queryByText("Localização desligada")).toBeNull());
  });

  it("ao tocar em Activar, pede autorização ao sistema e o aviso desaparece quando concedida", async () => {
    render();
    await waitFor(() => expect(screen.getByText("Localização desligada")).toBeTruthy());
    await act(async () => fireEvent.press(screen.getByRole("button", { name: "Activar" })));
    await waitFor(() => expect(screen.queryByText("Localização desligada")).toBeNull());
  });
});
