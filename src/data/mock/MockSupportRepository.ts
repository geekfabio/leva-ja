import type { HelpTopic } from "@/types/domain";
import { emergencyContacts, helpTopics } from "@/mocks/account";
import type { SupportRepository, TicketInput } from "../repositories/SupportRepository";
import { RepositoryError } from "../repositories/types";
import { db, type MockDatabase } from "./database";
import { clone, simulate } from "./runtime";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export class MockSupportRepository implements SupportRepository {
  constructor(private readonly database: MockDatabase = db) {}

  searchHelp(query: string, category?: HelpTopic["category"]) {
    return simulate(
      () => clone(helpTopics.filter((t) => (!category || t.category === category) && (!query || normalize(`${t.question} ${t.answer}`).includes(normalize(query))))),
      300,
    );
  }

  emergencyContacts() {
    return simulate(() => clone(emergencyContacts), 0);
  }

  createTicket(input: TicketInput) {
    return simulate(() => {
      if (input.description.trim().length < 10) throw new RepositoryError("validation", "Descreve o problema com pelo menos 10 caracteres.");
      const code = `OC-${1000 + this.database.tickets.length + Math.floor(Math.random() * 8000)}`;
      this.database.tickets.push({ code, ...input });
      return code;
    }, 900);
  }

  sendSosAlert() {
    return simulate(() => undefined, 1200);
  }
}
