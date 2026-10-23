# Entrega Android — versão 0.1.0

O projecto começa em `version: 0.1.0` e `android.versionCode: 1`.

## Perfis de build

| Perfil | Artefacto | Destino |
| --- | --- | --- |
| `test-apk` | APK | Instalação directa para testes internos |
| `beta` | AAB | Google Play, canal Internal testing |
| `production` | AAB | Google Play, lançamento de produção como rascunho |

## Configuração única

1. Instalar e autenticar o EAS CLI: `npx eas-cli@latest login`.
2. Associar o projecto Expo: `npx eas-cli@latest init`. O comando adiciona o `projectId` à configuração Expo; confirmar e enviar essa alteração.
3. Criar uma API key Google Maps Android, restringindo-a ao package `ao.leva.app` e à assinatura da app. Guardar no EAS: `npx eas-cli@latest secret:create --name GOOGLE_MAPS_ANDROID_API_KEY --value "..." --scope project`.
4. Na Google Play Console, criar a aplicação com package `ao.leva.app`, completar a página inicial da loja e criar uma conta de serviço com acesso a lançamentos. Guardar o JSON codificado em base64 como segredo GitHub `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64`.
5. Criar também os segredos GitHub `EXPO_TOKEN` e `GOOGLE_MAPS_ANDROID_API_KEY`.

## Linha de comando

```bash
# APK instalável
npx eas-cli@latest build --platform android --profile test-apk

# AAB para beta interna
npx eas-cli@latest build --platform android --profile beta
npx eas-cli@latest submit --platform android --profile beta --latest

# AAB de produção: enviado como rascunho, nunca publicado automaticamente
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android --profile production --latest
```

## GitHub Actions

Em **Actions → Android delivery → Run workflow**, escolher:

- `test-apk` para gerar um APK e receber o link do EAS;
- `beta` com submissão activa para enviar ao canal **Internal testing**;
- `production` com submissão activa para criar um rascunho na Play Console.

O workflow valida tipos, lint e testes antes da build. A submissão exige explicitamente a opção `submit_to_play`; gerar uma build nunca publica uma versão por si só.
