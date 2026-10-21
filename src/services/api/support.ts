import { helpTopics } from "@/mocks/account";
import { mockRequest } from "./mockClient";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const supportApi = {
  searchHelp: (query: string, category?: string) =>
    mockRequest(() =>
      helpTopics.filter(
        (t) => (!category || t.category === category) && (!query || normalize(`${t.question} ${t.answer}`).includes(normalize(query))),
      ),
    300),
};
