import type { Repositories } from "../repositories";
import { db } from "./database";
import { MockAccountRepository } from "./MockAccountRepository";
import { MockAuthRepository } from "./MockAuthRepository";
import { MockChatRepository } from "./MockChatRepository";
import { MockLocationRepository } from "./MockLocationRepository";
import { MockMediaRepository } from "./MockMediaRepository";
import { MockNotificationRepository } from "./MockNotificationRepository";
import { MockProviderRepository } from "./MockProviderRepository";
import { MockRequestRepository } from "./MockRequestRepository";
import { MockSupportRepository } from "./MockSupportRepository";

export function createMockRepositories(database = db): Repositories {
  return {
    auth: new MockAuthRepository(database),
    requests: new MockRequestRepository(database),
    providers: new MockProviderRepository(database),
    locations: new MockLocationRepository(),
    chat: new MockChatRepository(database),
    account: new MockAccountRepository(database),
    support: new MockSupportRepository(database),
    media: new MockMediaRepository(),
    notifications: new MockNotificationRepository(database),
  };
}

/** Repõe a base mock no estado inicial (Definições → Demonstração). */
export const resetMockDatabase = () => db.reset();

export { configureMock, mockRuntime } from "./runtime";
export { simulatedProviderFor } from "./MockRequestRepository";
