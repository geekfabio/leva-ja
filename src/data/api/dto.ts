import { z } from "zod";

/**
 * Formato de fio da API AngoLeva (o JSON que o backend envia e recebe).
 * Difere de propósito do modelo de domínio (`src/types/domain.ts`): campos em
 * snake_case, coordenadas `lat`/`lng`, valores em `*_kz`, `null` em vez de
 * campos ausentes. Os mappers (`mappers.ts`) fazem a ponte nos dois sentidos.
 *
 * Os esquemas Zod validam cada resposta: se o backend mudar o contrato, a app
 * falha com um erro claro em vez de mostrar dados errados.
 */

const serviceType = z.enum(["tow", "cargo", "small_move", "house_move"]);
const serviceStatus = z.enum(["searching", "assigned", "en_route", "arrived", "pickup_confirmed", "in_transit", "delivered", "paid", "rated", "cancelled"]);
const paymentType = z.enum(["bank_reference", "card", "cash"]);
const vehicleClass = z.enum(["tow_truck", "pickup", "van", "truck"]);
const participant = z.enum(["client", "provider", "support"]);

// —— Envelopes ——

export const envelope = <T extends z.ZodTypeAny>(data: T) => z.object({ data });
export const listEnvelope = <T extends z.ZodTypeAny>(item: T) => z.object({ data: z.array(item), meta: z.object({ count: z.number().int() }) });
export const changesEnvelope = <T extends z.ZodTypeAny>(item: T) => z.object({ data: z.array(item), meta: z.object({ cursor: z.string() }) });

export const ApiErrorDto = z.object({ error: z.object({ code: z.string(), message: z.string(), details: z.record(z.unknown()).optional() }) });
export type ApiErrorDto = z.infer<typeof ApiErrorDto>;

// —— Entidades ——

export const LocationDto = z.object({ lat: z.number(), lng: z.number() });
export type LocationDto = z.infer<typeof LocationDto>;

export const PlaceDto = z.object({ id: z.string(), label: z.string(), district: z.string(), city: z.string(), lat: z.number(), lng: z.number() });
export type PlaceDto = z.infer<typeof PlaceDto>;

export const PhotoDto = z.object({ id: z.string(), url: z.string(), caption: z.string() });
export type PhotoDto = z.infer<typeof PhotoDto>;

export const ClientDto = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string(),
  phone: z.string(),
  rating: z.number(),
  avatar_url: z.string().nullable(),
});
export type ClientDto = z.infer<typeof ClientDto>;

export const VehicleDto = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  plate: z.string(),
  color: z.string(),
  class: vehicleClass,
  category_label: z.string(),
  capacity_kg: z.number(),
  year: z.number().int(),
});
export type VehicleDto = z.infer<typeof VehicleDto>;

export const ProviderDto = z.object({
  id: z.string(),
  full_name: z.string(),
  phone: z.string(),
  rating: z.number(),
  reviews_count: z.number().int(),
  verified: z.boolean(),
  avatar_url: z.string().nullable(),
  vehicle: VehicleDto,
  location: LocationDto,
});
export type ProviderDto = z.infer<typeof ProviderDto>;

export const TowDetailsDto = z.object({
  incident: z.enum(["mechanical", "accident", "flat_tire", "battery", "no_fuel"]),
  brand: z.string(),
  model: z.string(),
  plate: z.string(),
  color: z.string(),
  can_move: z.boolean(),
});

export const CargoDetailsDto = z.object({
  cargo_type: z.enum(["boxes", "furniture", "appliances", "construction", "goods", "other"]),
  description: z.string(),
  weight_range: z.enum(["upto100", "101to300", "301to500", "over500"]),
  volume: z.enum(["small", "medium", "large"]),
  vehicle_class: vehicleClass,
  helper: z.boolean(),
});

export const MovingDetailsDto = z.object({
  property_type: z.enum(["t0_t1", "t2", "t3", "t4_plus", "office"]).nullable(),
  rooms: z.number().int(),
  items: z.string(),
  helpers: z.number().int(),
  pickup_floor: z.number().int(),
  delivery_floor: z.number().int(),
  elevator: z.boolean(),
  disassembly: z.boolean(),
  when: z.enum(["now", "scheduled"]),
  date: z.string().nullable(),
  time: z.string().nullable(),
});

export const PricingDto = z.object({ base_kz: z.number(), distance_kz: z.number(), extras_kz: z.number(), platform_fee_kz: z.number(), total_kz: z.number() });

export const ProofDto = z.object({ photos: z.array(PhotoDto), signed_by: z.string(), good_condition: z.boolean(), notes: z.string().nullable(), delivered_at: z.string() });

export const ServiceRequestDto = z.object({
  id: z.string(),
  code: z.string(),
  service_type: serviceType,
  status: serviceStatus,
  client_id: z.string(),
  provider_id: z.string().nullable(),
  client: ClientDto.nullable(),
  provider: ProviderDto.nullable(),
  pickup: PlaceDto,
  dropoff: PlaceDto,
  stops: z.array(PlaceDto),
  distance_km: z.number(),
  duration_min: z.number(),
  created_at: z.string(),
  scheduled_for: z.string().nullable(),
  tow_details: TowDetailsDto.nullable(),
  cargo_details: CargoDetailsDto.nullable(),
  moving_details: MovingDetailsDto.nullable(),
  photos: z.array(PhotoDto),
  pickup_photos: z.array(PhotoDto),
  instructions: z.string().nullable(),
  pricing: PricingDto,
  provider_earning_kz: z.number(),
  proposal: z.object({ amount_kz: z.number(), reason: z.string(), status: z.enum(["sent", "accepted", "declined"]) }).nullable(),
  payment_method: paymentType.nullable(),
  rating: z.number().nullable(),
  review: z.string().nullable(),
  proof: ProofDto.nullable(),
  timeline: z.array(z.object({ status: serviceStatus, at: z.string() })),
  cancel_reason: z.string().nullable(),
});
export type ServiceRequestDto = z.infer<typeof ServiceRequestDto>;

export const NearbyRequestDto = z.object({ request: ServiceRequestDto, distance_km: z.number() });

export const SessionDto = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  /** Segundos até o token de acesso expirar. */
  expires_in: z.number().int().positive(),
  refresh_token: z.string(),
  user: ClientDto,
  provider_id: z.string().nullable(),
});
export type SessionDto = z.infer<typeof SessionDto>;
export const MeDto = z.object({ user: ClientDto, provider_id: z.string().nullable() });

export const TransactionDto = z.object({
  id: z.string(),
  type: z.enum(["earning", "withdrawal", "fee"]),
  title: z.string(),
  amount_kz: z.number(),
  created_at: z.string(),
  status: z.enum(["completed", "pending", "failed"]),
  service_type: serviceType.nullable(),
});
export type TransactionDto = z.infer<typeof TransactionDto>;

export const DocumentDto = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(["license", "id", "vehicle", "insurance"]),
  valid_until: z.string(),
  status: z.enum(["verified", "pending", "expired", "needs_update"]),
});

export const ZoneDto = z.object({ id: z.string(), name: z.string(), lat: z.number(), lng: z.number(), radius_km: z.number() });

export const CoverageDto = z.object({ zone_ids: z.array(z.string()), service_types: z.array(serviceType) });

export const ProviderStateDto = z.object({
  profile: ProviderDto,
  online: z.boolean(),
  coverage: CoverageDto,
  documents: z.array(DocumentDto),
  wallet: z.object({
    balance_kz: z.number(),
    transactions: z.array(TransactionDto),
    payout_account: z.object({ bank: z.string(), iban: z.string(), holder: z.string() }),
  }),
  declined_request_ids: z.array(z.string()),
});
export type ProviderStateDto = z.infer<typeof ProviderStateDto>;

export const EarningsDto = z.object({ today_kz: z.number(), today_count: z.number().int(), week_kz: z.number(), completed_count: z.number().int(), last_7_days_kz: z.array(z.number()) });

export const ReviewDto = z.object({ id: z.string(), request_id: z.string(), author_name: z.string(), rating: z.number(), comment: z.string(), created_at: z.string() });

export const NearbyVehicleDto = z.object({ id: z.string(), lat: z.number(), lng: z.number(), type: z.enum(["tow", "cargo", "move"]) });

export const ChatMessageDto = z.object({ id: z.string(), thread_id: z.string(), sender: participant, body: z.string(), sent_at: z.string(), read: z.boolean() });
export type ChatMessageDto = z.infer<typeof ChatMessageDto>;

/** Eventos do canal de tempo real de uma conversa. */
export const ChatEventDto = z.discriminatedUnion("type", [
  z.object({ type: z.literal("message"), message: ChatMessageDto }),
  z.object({ type: z.literal("typing"), sender: participant, typing: z.boolean() }),
]);
export type ChatEventDto = z.infer<typeof ChatEventDto>;

export const SavedAddressDto = z.object({ id: z.string(), label: z.string(), icon: z.enum(["home", "work", "pin"]), place: PlaceDto });

export const PaymentMethodDto = z.object({ id: z.string(), type: paymentType, title: z.string(), detail: z.string(), is_default: z.boolean() });

export const HelpTopicDto = z.object({ id: z.string(), category: z.enum(["orders", "payments", "safety", "account"]), question: z.string(), answer: z.string() });

export const EmergencyContactDto = z.object({ id: z.string(), label: z.string(), phone_number: z.string() });

export const TicketDto = z.object({ code: z.string() });

export const PaymentDto = z.object({
  id: z.string(),
  request_id: z.string(),
  payment_method: paymentType,
  status: z.enum(["pending", "confirmed", "failed", "expired"]),
  amount_kz: z.number(),
  /** Só na referência Multicaixa. */
  bank_reference: z.object({ entity: z.string(), reference: z.string(), expires_at: z.string() }).nullable(),
  created_at: z.string(),
  confirmed_at: z.string().nullable(),
});
export type PaymentDto = z.infer<typeof PaymentDto>;

/** Resposta de `POST /uploads` (multipart: `file` + `context`). */
export const UploadDto = z.object({ id: z.string(), url: z.string(), content_type: z.string() });

// —— Corpos enviados pela app ——

export const CreateRequestBodyDto = z.object({
  service_type: serviceType,
  client_id: z.string(),
  pickup: PlaceDto,
  dropoff: PlaceDto,
  stops: z.array(PlaceDto),
  scheduled_for: z.string().nullable(),
  tow_details: TowDetailsDto.nullable(),
  cargo_details: CargoDetailsDto.nullable(),
  moving_details: MovingDetailsDto.nullable(),
  photos: z.array(PhotoDto),
  instructions: z.string().nullable(),
  payment_method: paymentType.nullable(),
});

export const ProofBodyDto = ProofDto.omit({ delivered_at: true });
export const VehiclePatchDto = VehicleDto.omit({ id: true }).partial();
export const ProfilePatchDto = z.object({ full_name: z.string().min(1), email: z.string().email(), phone: z.string() }).partial();
export const RegisterBodyDto = z.object({ full_name: z.string().min(1), email: z.string().email(), phone: z.string(), password: z.string().min(6) });
export const AddressBodyDto = SavedAddressDto.omit({ id: true });
export const TicketBodyDto = z.object({ request_id: z.string(), reason: z.string(), description: z.string() });
