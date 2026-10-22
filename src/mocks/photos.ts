import type { Photo } from "@/types/domain";

export const cargoPhotos: Photo[] = [
  { id: "ph-1", asset: "pickup-bed", caption: "Carga arrumada na caixa da pickup" },
  { id: "ph-2", asset: "pickup-side", caption: "Sofá protegido com película" },
  { id: "ph-3", asset: "boxes-plant", caption: "Caixas e vaso" },
  { id: "ph-4", asset: "wrapped-sofa", caption: "Colchão embalado" },
];

export const deliveryPhotos: Photo[] = [
  { id: "dp-1", asset: "delivered-sofa", caption: "Sofá entregue na sala" },
  { id: "dp-2", asset: "delivered-boxes", caption: "Caixas entregues" },
  { id: "dp-3", asset: "delivered-wrapped", caption: "Colchão entregue embalado" },
];

/** Fotos "tiradas" pela câmara simulada, por ordem. */
export const cameraRoll: Photo[] = [...cargoPhotos, ...deliveryPhotos];
