const app = require("./app.json");

/**
 * A chave Google Maps é lida apenas durante a build Android. Mantê-la fora do
 * repositório permite que o react-native-maps apresente os tiles OSM em builds
 * internas e de produção. A chave deve ser restringida no Google Cloud ao
 * package e certificado de assinatura da aplicação.
 */
const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

module.exports = {
  ...app.expo,
  android: {
    ...app.expo.android,
    ...(googleMapsApiKey
      ? {
          config: {
            ...app.expo.android.config,
            googleMaps: { ...app.expo.android.config?.googleMaps, apiKey: googleMapsApiKey },
          },
        }
      : {}),
  },
};
