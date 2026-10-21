import { placeList } from "@/mocks/places";
import { useAccountStore } from "@/stores/useAccountStore";
import { mockRequest } from "./mockClient";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Pesquisa de moradas simulada (sem geocodificação real). */
export const placesApi = {
  search: (query: string) =>
    mockRequest(() => {
      const q = normalize(query.trim());
      const saved = useAccountStore.getState().addresses;
      const results = placeList.filter((p) => !q || normalize(`${p.label} ${p.area}`).includes(q));
      return { saved: q ? saved.filter((a) => normalize(`${a.label} ${a.place.label}`).includes(q)) : saved, results };
    }, 250),
};
