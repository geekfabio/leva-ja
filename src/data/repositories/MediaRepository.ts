import type { Photo } from "@/types/domain";

export type CaptureContext = "cargo" | "vehicle" | "delivery";

/** Fotografias (câmara e envio). Na fase mock devolve fotos de exemplo. */
export interface MediaRepository {
  capture(context: CaptureContext, index: number): Promise<Photo>;
  /** Sequência de fotos de recolha que o prestador "regista". */
  pickupSet(): Promise<Photo[]>;
}
