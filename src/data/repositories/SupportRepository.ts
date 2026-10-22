import type { Coordinates, HelpTopic } from "@/types/domain";

export type EmergencyContact = { id: string; label: string; number: string };
export type TicketInput = { requestId: string; reason: string; description: string };

/** Ajuda, ocorrências e segurança. */
export interface SupportRepository {
  searchHelp(query: string, category?: HelpTopic["category"]): Promise<HelpTopic[]>;
  emergencyContacts(): Promise<EmergencyContact[]>;
  /** Regista uma ocorrência e devolve o código (ex.: OC-1234). */
  createTicket(input: TicketInput): Promise<string>;
  sendSosAlert(input: { requestId?: string; coords: Coordinates }): Promise<void>;
}
