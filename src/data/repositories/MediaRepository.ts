import type { Photo } from "@/types/domain";

export type CaptureContext = "cargo" | "vehicle" | "delivery";

/** Fotografias (câmara e envio). Na fase mock devolve fotos de exemplo. */
export interface MediaRepository {
  /** Obtém uma fotografia (câmara ou galeria) já enviada; `null` se o utilizador cancelar. */
  capture(context: CaptureContext, index: number): Promise<Photo | null>;
  /** Sequência de fotos de recolha que o prestador "regista". */
  pickupSet(): Promise<Photo[]>;
}
