const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// O servidor falso e os dados de exemplo (src/__test-support__) só existem nos testes: sem
// EXPO_PUBLIC_E2E=1 qualquer import deles resolve para um módulo vazio e fica fora do bundle.
if (process.env.EXPO_PUBLIC_E2E !== "1") {
  const resolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName.includes("__test-support__")) return { type: "empty" };
    return resolveRequest ? resolveRequest(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = withNativeWind(config, { input: "./global.css" });
