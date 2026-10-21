import type { Photo } from "@/types/domain";
import { cargoPhotos, deliveryPhotos } from "@/mocks/photos";
import type { CaptureContext, MediaRepository } from "../repositories/MediaRepository";
import { simulate } from "./runtime";

const vehiclePhotos: Photo[] = [{ id: "tow-1", asset: "hilux-street", caption: "Viatura parada na estrada" }];

/** Câmara simulada: devolve, por ordem, fotos de exemplo empacotadas na app. */
export class MockMediaRepository implements MediaRepository {
  capture(context: CaptureContext, index: number) {
    const pool = context === "delivery" ? deliveryPhotos : context === "vehicle" ? [...vehiclePhotos, ...cargoPhotos] : cargoPhotos;
    const source = pool[index % pool.length]!;
    return simulate(() => ({ ...source, id: `${source.id}-${Date.now()}-${index}` }), 0);
  }

  pickupSet() {
    return simulate(() => cargoPhotos.map((p) => ({ ...p })));
  }
}
