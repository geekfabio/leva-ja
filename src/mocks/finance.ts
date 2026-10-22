import type { Transaction } from "@/types/domain";
import { daysAgo } from "@/utils/date";

export const initialTransactions: Transaction[] = [
  { id: "tx-1", kind: "earning", title: "Carga com pickup", amount: 10000, at: daysAgo(0, "12:41"), status: "completed", serviceKind: "cargo" },
  { id: "tx-2", kind: "earning", title: "Reboque de viatura", amount: 12500, at: daysAgo(0, "09:18"), status: "completed", serviceKind: "tow" },
  { id: "tx-3", kind: "earning", title: "Carga com pickup", amount: 10000, at: daysAgo(1, "16:20"), status: "completed", serviceKind: "cargo" },
  { id: "tx-4", kind: "earning", title: "Reboque de viatura", amount: 12500, at: daysAgo(1, "11:07"), status: "completed", serviceKind: "tow" },
  { id: "tx-5", kind: "withdrawal", title: "Levantamento para conta bancária", amount: -25000, at: daysAgo(2, "14:36"), status: "completed" },
  { id: "tx-6", kind: "earning", title: "Carga com pickup", amount: 10000, at: daysAgo(3, "10:12"), status: "completed", serviceKind: "cargo" },
  { id: "tx-7", kind: "earning", title: "Mudança pequena", amount: 15000, at: daysAgo(4, "15:40"), status: "completed", serviceKind: "small_move" },
  { id: "tx-8", kind: "earning", title: "Reboque de viatura", amount: 12000, at: daysAgo(5, "08:30"), status: "completed", serviceKind: "tow" },
];

export const initialBalance = 45000;

/** Ganhos diários dos últimos 7 dias (Seg → Dom) para o gráfico de barras (ref. 38). */
export const weeklyEarnings = [52000, 34000, 61000, 118000, 84000, 72000, 50000];

export const bankAccount = { bank: "BAI", iban: "AO06 0040 0000 1234 5678 1012 3", holder: "João Manuel" };
