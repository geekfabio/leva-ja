import type { Repositories } from "../repositories";
import { db } from "./database";
import { MockAccountRepository } from "./MockAccountRepository";
import { MockAuthRepository } from "./MockAuthRepository";
import { MockChatRepository } from "./MockChatRepository";
import { MockLocationRepository } from "./MockLocationRepository";
import { MockMediaRepository } from "./MockMediaRepository";
import { MockNotificationRepository } from "./MockNotificationRepository";
import { MockPaymentRepository } from "./MockPaymentRepository";
import { MockProviderRepository } from "./MockProviderRepository";
import { MockRequestRepository } from "./MockRequestRepository";
import { MockSupportRepository } from "./MockSupportRepository";

export function createMockRepositories(database = db): Repositories {
  const requests = new MockRequestRepository(database);
  return {
    auth: new MockAuthRepository(database),
    requests,
    providers: new MockProviderRepository(database),
    locations: new MockLocationRepository(),
    chat: new MockChatRepository(database),
    account: new MockAccountRepository(database),
    support: new MockSupportRepository(database),
    media: new MockMediaRepository(),
    notifications: new MockNotificationRepository(database),
    payments: new MockPaymentRepository(requests, database),
  };
}

/** Repõe a base mock no estado inicial (Definições → Demonstração). */
export const resetMockDatabase = () => db.reset();

export { configureMock, mockRuntime } from "./runtime";
export { simulatedProviderFor } from "./MockRequestRepository";
