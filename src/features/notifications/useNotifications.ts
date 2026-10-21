import { useMemo } from "react";
import { useAccountStore } from "@/stores/useAccountStore";
import { useProviderStore } from "@/stores/useProviderStore";
import { useServiceStore } from "@/stores/useServiceStore";
import { useSessionStore } from "@/stores/useSessionStore";
import type { Role } from "@/types/domain";
import { buildNotifications } from "./build";

/** Notificações do perfil activo e quantas estão por ler. */
export function useNotifications(roleOverride?: Role) {
  const sessionRole = useSessionStore((s) => s.role);
  const role = roleOverride ?? sessionRole ?? "client";
  const clientId = useSessionStore((s) => s.user.id);
  const requests = useServiceStore((s) => s.requests);
  const transactions = useProviderStore((s) => s.transactions);
  const documents = useProviderStore((s) => s.documents);
  const read = useAccountStore((s) => s.readNotifications);
  return useMemo(() => {
    const items = buildNotifications(role, { requests, clientId, transactions, documents });
    const readSet = new Set(read);
    return { role, items: items.map((n) => ({ ...n, unread: !readSet.has(n.id) })), unread: items.filter((n) => !readSet.has(n.id)).length };
  }, [role, requests, clientId, transactions, documents, read]);
}
