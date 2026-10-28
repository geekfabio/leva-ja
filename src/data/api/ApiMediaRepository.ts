import type { Photo } from "@/types/domain";
import type { CaptureContext, MediaRepository } from "../repositories/MediaRepository";
import type { DeviceCamera, PickedImage } from "../device/DeviceCamera";
import { call, http } from "../http/client";
import * as Dto from "./dto";
import { parse } from "./parse";

const captions: Record<CaptureContext, string> = {
  cargo: "Foto da carga",
  vehicle: "Foto da viatura",
  delivery: "Comprovativo de entrega",
};

/**
 * Parte `file` do multipart. No React Native nativo o FormData aceita
 * `{ uri, name, type }`; na web (e nos testes) é preciso um Blob.
 */
async function filePart(image: PickedImage): Promise<Blob | { uri: string; name: string; type: string }> {
  const native = typeof (FormData.prototype as { getParts?: unknown }).getParts === "function";
  if (native) return { uri: image.uri, name: image.fileName, type: image.mimeType };
  return (await fetch(image.uri)).blob();
}

/** Fotografias reais: câmara ou galeria do dispositivo e envio para `POST /uploads`. */
export class ApiMediaRepository implements MediaRepository {
  constructor(private readonly camera: DeviceCamera) {}

  async upload(image: PickedImage, context: CaptureContext): Promise<Photo> {
    const form = new FormData();
    form.append("context", context);
    form.append("file", (await filePart(image)) as Blob, image.fileName);
    const body = await call(http.post("/uploads", form, { headers: { "Content-Type": "multipart/form-data" } }));
    const uploaded = parse(Dto.envelope(Dto.UploadDto), body, "upload").data;
    return { id: uploaded.id, asset: uploaded.url, caption: captions[context] };
  }

  async capture(context: CaptureContext) {
    const image = await this.camera.take(context);
    return image ? this.upload(image, context) : null;
  }

  async pickupSet() {
    const photo = await this.capture("cargo");
    return photo ? [photo] : [];
  }
}
