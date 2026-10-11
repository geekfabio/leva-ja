import type { ServiceId, VehicleId } from "@/domain/catalog";
export type OrderStatus =
  | "draft"
  | "matching"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "service_started"
  | "completed"
  | "cancelled"
  | "disputed";
export type PaymentStatus = "pending" | "confirmed" | "failed" | "refunded";

export type Order = {
  rating?: number;
  review?: string;
  messages?: string[];
  complaint?: { reason: string; note: string };
  serviceId?: ServiceId;
  vehicleType?: VehicleId;
  cargoDescription?: string;
  weightKg?: string;
  dimensions?: string;
  helpers?: boolean;
  pickupAccess?: string;
  deliveryAccess?: string;
  pricing?: { base: number; assistance: number; fee: number };
  evidence?: string[];
  proof?: string[];
  proposedAmount?: number;
  proposalNote?: string;
  id: string;
  merchant: string;
  category: string;
  amount: number;
  etaMinutes: number;
  status: OrderStatus;
  image: string;
  address: string;
  vehicle: string;
  provider?: string;
  plate?: string;
  destination?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  incidentNote?: string;
  severity?: "low" | "medium" | "high";
};
