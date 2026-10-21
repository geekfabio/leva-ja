import { weeklyEarnings } from "@/mocks/finance";
import { providerReviews } from "@/mocks/reviews";
import { useProviderStore } from "@/stores/useProviderStore";
import { useServiceStore } from "@/stores/useServiceStore";
import { currentProvider } from "@/mocks/people";
import { mockRequest } from "./mockClient";

const sameDay = (iso: string, d = new Date()) => {
  const x = new Date(iso);
  return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() && x.getDate() === d.getDate();
};

export const financeApi = {
  summary: () =>
    mockRequest(() => {
      const { transactions, balance } = useProviderStore.getState();
      const earnings = transactions.filter((t) => t.kind === "earning" && t.status === "completed");
      const today = earnings.filter((t) => sameDay(t.at));
      const weekAgo = Date.now() - 7 * 86_400_000;
      const week = earnings.filter((t) => new Date(t.at).getTime() >= weekAgo);
      const completed = useServiceStore
        .getState()
        .requests.filter((r) => r.providerId === currentProvider.id && ["delivered", "paid", "rated"].includes(r.status)).length;
      // O gráfico usa a série mock e acrescenta os ganhos reais de hoje à barra do dia actual.
      const todayIndex = (new Date().getDay() + 6) % 7;
      const chart = weeklyEarnings.map((v, i) => (i === todayIndex ? Math.max(v, today.reduce((s, t) => s + t.amount, 0)) : v));
      return {
        balance,
        today: today.reduce((s, t) => s + t.amount, 0),
        todayCount: today.length,
        week: week.reduce((s, t) => s + t.amount, 0) + 40000,
        completed: completed + 8,
        chart,
      };
    }),
  transactions: (filter: "all" | "earning" | "withdrawal") =>
    mockRequest(() =>
      useProviderStore
        .getState()
        .transactions.filter((t) => filter === "all" || t.kind === filter)
        .sort((a, b) => b.at.localeCompare(a.at)),
    ),
  reviews: () => mockRequest(() => providerReviews),
};
