export * from "./types";
export type * from "./AuthRepository";
export type * from "./RequestRepository";
export type * from "./ProviderRepository";
export type * from "./LocationRepository";
export type * from "./ChatRepository";
export type * from "./AccountRepository";
export type * from "./SupportRepository";
export type * from "./MediaRepository";
export type * from "./NotificationRepository";
export type * from "./PaymentRepository";

import type { AccountRepository } from "./AccountRepository";
import type { AuthRepository } from "./AuthRepository";
import type { ChatRepository } from "./ChatRepository";
import type { LocationRepository } from "./LocationRepository";
import type { MediaRepository } from "./MediaRepository";
import type { NotificationRepository } from "./NotificationRepository";
import type { PaymentRepository } from "./PaymentRepository";
import type { ProviderRepository } from "./ProviderRepository";
import type { RequestRepository } from "./RequestRepository";
import type { SupportRepository } from "./SupportRepository";

/** Conjunto de repositórios que a app consome. */
export type Repositories = {
  auth: AuthRepository;
  requests: RequestRepository;
  providers: ProviderRepository;
  locations: LocationRepository;
  chat: ChatRepository;
  account: AccountRepository;
  support: SupportRepository;
  media: MediaRepository;
  notifications: NotificationRepository;
  payments: PaymentRepository;
};
