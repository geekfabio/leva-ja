import * as ImagePicker from "expo-image-picker";
import type { CaptureContext } from "../repositories/MediaRepository";

/** Imagem escolhida no dispositivo, ainda por enviar. */
export type PickedImage = { uri: string; mimeType: string; fileName: string };

/** Câmara/galeria do dispositivo. O envio para a API é feito pelo MediaRepository. */
export interface DeviceCamera {
  /** Abre a câmara (ou a galeria, se não houver câmara); `null` se o utilizador cancelar. */
  take(context: CaptureContext): Promise<PickedImage | null>;
}

const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.6, allowsEditing: false, exif: false };

const toPicked = (result: ImagePicker.ImagePickerResult): PickedImage | null => {
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  const mimeType = asset.mimeType ?? "image/jpeg";
  return { uri: asset.uri, mimeType, fileName: asset.fileName ?? `foto-${Date.now()}.${mimeType.split("/")[1] ?? "jpg"}` };
};

/** Implementação real sobre o expo-image-picker. */
export class ExpoDeviceCamera implements DeviceCamera {
  async take(_context: CaptureContext) {
    const camera = await ImagePicker.requestCameraPermissionsAsync().catch(() => ({ granted: false }));
    if (camera.granted) {
      try {
        return toPicked(await ImagePicker.launchCameraAsync(options));
      } catch {
        // Sem câmara (ex.: web ou simulador): segue para a galeria.
      }
    }
    const library = await ImagePicker.requestMediaLibraryPermissionsAsync().catch(() => ({ granted: false }));
    if (!library.granted) return null;
    return toPicked(await ImagePicker.launchImageLibraryAsync(options));
  }
}
