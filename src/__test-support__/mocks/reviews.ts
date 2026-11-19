import type { Review } from "@/types/domain";
import { daysAgo } from "@/utils/date";

export const providerReviews: Review[] = [
  { id: "rv-1", requestId: "req-prv-1", authorName: "Carlos Mendes", authorInitials: "CM", rating: 5, comment: "Pontual e simpático.", at: daysAgo(0, "13:10") },
  { id: "rv-2", requestId: "req-prv-2", authorName: "Ana Sebastião", authorInitials: "AS", rating: 5, comment: "Resolveu tudo rapidamente.", at: daysAgo(0, "10:02") },
  { id: "rv-3", requestId: "req-prv-3", authorName: "Manuel Costa", authorInitials: "MC", rating: 4, comment: "Bom serviço, chegou um pouco depois.", at: daysAgo(1, "17:00") },
];
