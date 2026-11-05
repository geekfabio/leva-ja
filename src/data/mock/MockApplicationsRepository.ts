import type { ApplicationInput, ApplicationsRepository } from "../repositories/ApplicationsRepository";
import { RepositoryError } from "../repositories/types";
import { simulate } from "./runtime";

/**
 * Candidatura simulada: valida como o endpoint público faria e devolve
 * `pending`, sem guardar nada permanente (não há candidaturas na base mock).
 */
export class MockApplicationsRepository implements ApplicationsRepository {
  submit(input: ApplicationInput) {
    return simulate(() => {
      if (input.name.trim().length < 3) throw new RepositoryError("validation", "Indica o teu nome completo.");
      if (!input.serviceTypes.length) throw new RepositoryError("validation", "Escolhe pelo menos um serviço.");
      if (!input.zoneIds.length) throw new RepositoryError("validation", "Escolhe pelo menos uma zona.");
      return { status: "pending" };
    }, 900);
  }
}
