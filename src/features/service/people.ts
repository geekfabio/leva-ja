import type { Client, ServiceRequest } from "@/types/domain";

const UNKNOWN_CLIENT: Client = { id: "unknown", name: "Cliente", email: "", phone: "", initials: "C", rating: 0 };

/** Cliente incluído no pedido pela API/repositório (com valor de recurso). */
export const clientOf = (request?: Pick<ServiceRequest, "client">): Client => request?.client ?? UNKNOWN_CLIENT;
