import type { z } from "zod";
import type {
  CargoDetails,
  ChatMessage,
  Client,
  Coordinates,
  DeliveryProofData,
  HelpTopic,
  MovingDetails,
  Payment,
  PaymentMethod,
  Photo,
  Place,
  Provider,
  ProviderDocument,
  Review,
  SavedAddress,
  ServiceRequest,
  TowDetails,
  Transaction,
  Vehicle,
  Zone,
} from "@/types/domain";
import type { RequestInput } from "@/features/booking/factory";
import { initialsOf } from "@/utils/format";
import type { Session } from "../repositories/AuthRepository";
import type { ChatEvent } from "../repositories/ChatRepository";
import type { NearbyVehicle } from "../repositories/LocationRepository";
import type { Coverage, EarningsSummary, ProviderState } from "../repositories/ProviderRepository";
import type { NearbyRequest } from "../repositories/RequestRepository";
import type { EmergencyContact, TicketInput } from "../repositories/SupportRepository";
import type * as Dto from "./dto";

/**
 * Tradução entre o formato da API (`dto.ts`) e o modelo de domínio.
 * `toX` lê respostas da API; `fromX` produz o JSON que a API espera (e é
 * também o que a API simulada usa para responder).
 */

type D<T extends z.ZodTypeAny> = z.infer<T>;
const orNull = <T>(value: T | undefined) => (value === undefined ? null : value);
const orUndefined = <T>(value: T | null) => (value === null ? undefined : value);

// —— Lugares e fotografias ——

export const toCoordinates = (dto: Dto.LocationDto): Coordinates => ({ latitude: dto.lat, longitude: dto.lng });
export const fromCoordinates = (c: Coordinates): Dto.LocationDto => ({ lat: c.latitude, lng: c.longitude });

export const toPlace = (dto: Dto.PlaceDto): Place => ({ id: dto.id, label: dto.label, area: dto.district, city: dto.city, coords: { latitude: dto.lat, longitude: dto.lng } });
export const fromPlace = (p: Place): Dto.PlaceDto => ({ id: p.id, label: p.label, district: p.area, city: p.city, lat: p.coords.latitude, lng: p.coords.longitude });

/** Na API a fotografia é um URL; na fase mock é a chave de uma imagem empacotada (o `imageSource` aceita as duas). */
export const toPhoto = (dto: Dto.PhotoDto): Photo => ({ id: dto.id, asset: dto.url, caption: dto.caption });
export const fromPhoto = (p: Photo): Dto.PhotoDto => ({ id: p.id, url: p.asset, caption: p.caption });

// —— Pessoas e viaturas ——

export const toClient = (dto: Dto.ClientDto): Client => ({
  id: dto.id,
  name: dto.full_name,
  email: dto.email,
  phone: dto.phone,
  initials: initialsOf(dto.full_name),
  rating: dto.rating,
  avatar: orUndefined(dto.avatar_url),
});
export const fromClient = (c: Client): Dto.ClientDto => ({ id: c.id, full_name: c.name, email: c.email, phone: c.phone, rating: c.rating, avatar_url: orNull(c.avatar) });

export const toVehicle = (dto: Dto.VehicleDto): Vehicle => ({
  id: dto.id,
  brand: dto.brand,
  model: dto.model,
  plate: dto.plate,
  color: dto.color,
  vehicleClass: dto.class,
  categoryLabel: dto.category_label,
  capacityKg: dto.capacity_kg,
  year: dto.year,
});
export const fromVehicle = (v: Vehicle): Dto.VehicleDto => ({
  id: v.id,
  brand: v.brand,
  model: v.model,
  plate: v.plate,
  color: v.color,
  class: v.vehicleClass,
  category_label: v.categoryLabel,
  capacity_kg: v.capacityKg,
  year: v.year,
});

/** Alteração parcial da viatura (PATCH): só os campos presentes. */
export function fromVehiclePatch(values: Partial<Vehicle>): Partial<Dto.VehicleDto> {
  const full = fromVehicle({ ...({} as Vehicle), ...values });
  return Object.fromEntries(Object.entries(full).filter(([, v]) => v !== undefined)) as Partial<Dto.VehicleDto>;
}
export const toVehiclePatch = (dto: Partial<Dto.VehicleDto>): Partial<Vehicle> =>
  Object.fromEntries(Object.entries(toVehicle(dto as Dto.VehicleDto)).filter(([, v]) => v !== undefined)) as Partial<Vehicle>;

export const toProvider = (dto: Dto.ProviderDto): Provider => ({
  id: dto.id,
  name: dto.full_name,
  initials: initialsOf(dto.full_name),
  phone: dto.phone,
  rating: dto.rating,
  reviewsCount: dto.reviews_count,
  verified: dto.verified,
  avatar: orUndefined(dto.avatar_url),
  vehicle: toVehicle(dto.vehicle),
  coords: toCoordinates(dto.location),
});
export const fromProvider = (p: Provider): Dto.ProviderDto => ({
  id: p.id,
  full_name: p.name,
  phone: p.phone,
  rating: p.rating,
  reviews_count: p.reviewsCount,
  verified: p.verified,
  avatar_url: orNull(p.avatar),
  vehicle: fromVehicle(p.vehicle),
  location: fromCoordinates(p.coords),
});

// —— Pedidos ——

const toTow = (dto: D<typeof Dto.TowDetailsDto>): TowDetails => ({ incident: dto.incident, brand: dto.brand, model: dto.model, plate: dto.plate, color: dto.color, canMove: dto.can_move });
const fromTow = (t: TowDetails): D<typeof Dto.TowDetailsDto> => ({ incident: t.incident, brand: t.brand, model: t.model, plate: t.plate, color: t.color, can_move: t.canMove });

const toCargo = (dto: D<typeof Dto.CargoDetailsDto>): CargoDetails => ({
  cargoType: dto.cargo_type,
  description: dto.description,
  weight: dto.weight_range,
  volume: dto.volume,
  vehicleClass: dto.vehicle_class,
  helper: dto.helper,
});
const fromCargo = (c: CargoDetails): D<typeof Dto.CargoDetailsDto> => ({
  cargo_type: c.cargoType,
  description: c.description,
  weight_range: c.weight,
  volume: c.volume,
  vehicle_class: c.vehicleClass,
  helper: c.helper,
});

const toMoving = (dto: D<typeof Dto.MovingDetailsDto>): MovingDetails => ({
  propertyType: orUndefined(dto.property_type),
  rooms: dto.rooms,
  items: dto.items,
  helpers: dto.helpers,
  pickupFloor: dto.pickup_floor,
  deliveryFloor: dto.delivery_floor,
  elevator: dto.elevator,
  disassembly: dto.disassembly,
  when: dto.when,
  date: orUndefined(dto.date),
  time: orUndefined(dto.time),
});
const fromMoving = (m: MovingDetails): D<typeof Dto.MovingDetailsDto> => ({
  property_type: orNull(m.propertyType),
  rooms: m.rooms,
  items: m.items,
  helpers: m.helpers,
  pickup_floor: m.pickupFloor,
  delivery_floor: m.deliveryFloor,
  elevator: m.elevator,
  disassembly: m.disassembly,
  when: m.when,
  date: orNull(m.date),
  time: orNull(m.time),
});

const toProof = (dto: D<typeof Dto.ProofDto>): DeliveryProofData => ({
  photos: dto.photos.map(toPhoto),
  signedBy: dto.signed_by,
  goodCondition: dto.good_condition,
  notes: orUndefined(dto.notes),
  at: dto.delivered_at,
});
const fromProof = (p: DeliveryProofData): D<typeof Dto.ProofDto> => ({
  photos: p.photos.map(fromPhoto),
  signed_by: p.signedBy,
  good_condition: p.goodCondition,
  notes: orNull(p.notes),
  delivered_at: p.at,
});

export const toServiceRequest = (dto: Dto.ServiceRequestDto): ServiceRequest => ({
  id: dto.id,
  code: dto.code,
  kind: dto.service_type,
  status: dto.status,
  clientId: dto.client_id,
  providerId: orUndefined(dto.provider_id),
  client: dto.client ? toClient(dto.client) : undefined,
  provider: dto.provider ? toProvider(dto.provider) : undefined,
  origin: toPlace(dto.pickup),
  destination: toPlace(dto.dropoff),
  stops: dto.stops.map(toPlace),
  distanceKm: dto.distance_km,
  durationMin: dto.duration_min,
  createdAt: dto.created_at,
  scheduledFor: orUndefined(dto.scheduled_for),
  tow: dto.tow_details ? toTow(dto.tow_details) : undefined,
  cargo: dto.cargo_details ? toCargo(dto.cargo_details) : undefined,
  moving: dto.moving_details ? toMoving(dto.moving_details) : undefined,
  photos: dto.photos.map(toPhoto),
  pickupPhotos: dto.pickup_photos.map(toPhoto),
  instructions: orUndefined(dto.instructions),
  price: { base: dto.pricing.base_kz, distance: dto.pricing.distance_kz, extras: dto.pricing.extras_kz, platformFee: dto.pricing.platform_fee_kz, total: dto.pricing.total_kz },
  providerEarning: dto.provider_earning_kz,
  proposal: dto.proposal ? { amount: dto.proposal.amount_kz, reason: dto.proposal.reason, status: dto.proposal.status } : undefined,
  paymentMethod: orUndefined(dto.payment_method),
  rating: orUndefined(dto.rating),
  review: orUndefined(dto.review),
  proof: dto.proof ? toProof(dto.proof) : undefined,
  timeline: dto.timeline.map((e) => ({ status: e.status, at: e.at })),
  cancelReason: orUndefined(dto.cancel_reason),
});

export const fromServiceRequest = (r: ServiceRequest): Dto.ServiceRequestDto => ({
  id: r.id,
  code: r.code,
  service_type: r.kind,
  status: r.status,
  client_id: r.clientId,
  provider_id: orNull(r.providerId),
  client: r.client ? fromClient(r.client) : null,
  provider: r.provider ? fromProvider(r.provider) : null,
  pickup: fromPlace(r.origin),
  dropoff: fromPlace(r.destination),
  stops: r.stops.map(fromPlace),
  distance_km: r.distanceKm,
  duration_min: r.durationMin,
  created_at: r.createdAt,
  scheduled_for: orNull(r.scheduledFor),
  tow_details: r.tow ? fromTow(r.tow) : null,
  cargo_details: r.cargo ? fromCargo(r.cargo) : null,
  moving_details: r.moving ? fromMoving(r.moving) : null,
  photos: r.photos.map(fromPhoto),
  pickup_photos: r.pickupPhotos.map(fromPhoto),
  instructions: orNull(r.instructions),
  pricing: { base_kz: r.price.base, distance_kz: r.price.distance, extras_kz: r.price.extras, platform_fee_kz: r.price.platformFee, total_kz: r.price.total },
  provider_earning_kz: r.providerEarning,
  proposal: r.proposal ? { amount_kz: r.proposal.amount, reason: r.proposal.reason, status: r.proposal.status } : null,
  payment_method: orNull(r.paymentMethod),
  rating: orNull(r.rating),
  review: orNull(r.review),
  proof: r.proof ? fromProof(r.proof) : null,
  timeline: r.timeline.map((e) => ({ status: e.status, at: e.at })),
  cancel_reason: orNull(r.cancelReason),
});

export const toNearbyRequest = (dto: D<typeof Dto.NearbyRequestDto>): NearbyRequest => ({ request: toServiceRequest(dto.request), distanceKm: dto.distance_km });
export const fromNearbyRequest = (n: NearbyRequest): D<typeof Dto.NearbyRequestDto> => ({ request: fromServiceRequest(n.request), distance_km: n.distanceKm });

// —— Corpos de pedidos (app → API) ——

export type CreateRequestInput = Omit<RequestInput, "status" | "id">;

export const fromCreateRequest = (input: CreateRequestInput) => ({
  service_type: input.kind,
  client_id: input.clientId,
  pickup: fromPlace(input.origin),
  dropoff: fromPlace(input.destination),
  stops: (input.stops ?? []).map(fromPlace),
  scheduled_for: orNull(input.scheduledFor),
  tow_details: input.tow ? fromTow(input.tow) : null,
  cargo_details: input.cargo ? fromCargo(input.cargo) : null,
  moving_details: input.moving ? fromMoving(input.moving) : null,
  photos: (input.photos ?? []).map(fromPhoto),
  instructions: orNull(input.instructions),
  payment_method: orNull(input.paymentMethod),
});
export type CreateRequestBody = ReturnType<typeof fromCreateRequest>;

export const toCreateRequest = (body: CreateRequestBody): CreateRequestInput => ({
  kind: body.service_type,
  clientId: body.client_id,
  origin: toPlace(body.pickup),
  destination: toPlace(body.dropoff),
  stops: body.stops.map(toPlace),
  scheduledFor: orUndefined(body.scheduled_for),
  tow: body.tow_details ? toTow(body.tow_details) : undefined,
  cargo: body.cargo_details ? toCargo(body.cargo_details) : undefined,
  moving: body.moving_details ? toMoving(body.moving_details) : undefined,
  photos: body.photos.map(toPhoto),
  instructions: orUndefined(body.instructions),
  paymentMethod: orUndefined(body.payment_method),
});

export const fromProofInput = (p: Omit<DeliveryProofData, "at">) => ({ photos: p.photos.map(fromPhoto), signed_by: p.signedBy, good_condition: p.goodCondition, notes: orNull(p.notes) });
export const toProofInput = (body: ReturnType<typeof fromProofInput>): Omit<DeliveryProofData, "at"> => ({
  photos: body.photos.map(toPhoto),
  signedBy: body.signed_by,
  goodCondition: body.good_condition,
  notes: orUndefined(body.notes),
});

// —— Sessão ——

export const toSession = (dto: Dto.SessionDto): Session => ({ token: dto.access_token, refreshToken: dto.refresh_token, user: toClient(dto.user), providerId: orUndefined(dto.provider_id) });
export const fromSession = (s: Session, expiresInSeconds: number): Dto.SessionDto => ({
  access_token: s.token,
  token_type: "Bearer",
  expires_in: Math.max(1, Math.round(expiresInSeconds)),
  refresh_token: s.refreshToken ?? "",
  user: fromClient(s.user),
  provider_id: orNull(s.providerId),
});

// —— Prestador ——

export const toTransaction = (dto: Dto.TransactionDto): Transaction => ({
  id: dto.id,
  kind: dto.type,
  title: dto.title,
  amount: dto.amount_kz,
  at: dto.created_at,
  status: dto.status,
  serviceKind: orUndefined(dto.service_type),
});
export const fromTransaction = (t: Transaction): Dto.TransactionDto => ({
  id: t.id,
  type: t.kind,
  title: t.title,
  amount_kz: t.amount,
  created_at: t.at,
  status: t.status,
  service_type: orNull(t.serviceKind),
});

export const toDocument = (dto: D<typeof Dto.DocumentDto>): ProviderDocument => ({ id: dto.id, title: dto.title, icon: dto.kind, validUntil: dto.valid_until, state: dto.status });
export const fromDocument = (d: ProviderDocument): D<typeof Dto.DocumentDto> => ({ id: d.id, title: d.title, kind: d.icon, valid_until: d.validUntil, status: d.state });

export const toZone = (dto: D<typeof Dto.ZoneDto>): Zone => ({ id: dto.id, name: dto.name, coords: { latitude: dto.lat, longitude: dto.lng }, radiusKm: dto.radius_km });
export const fromZone = (z: Zone): D<typeof Dto.ZoneDto> => ({ id: z.id, name: z.name, lat: z.coords.latitude, lng: z.coords.longitude, radius_km: z.radiusKm });

export const toCoverage = (dto: D<typeof Dto.CoverageDto>): Coverage => ({ zones: dto.zone_ids, services: dto.service_types });
export const fromCoverage = (c: Coverage): D<typeof Dto.CoverageDto> => ({ zone_ids: c.zones, service_types: c.services });

export const toProviderState = (dto: Dto.ProviderStateDto): ProviderState => ({
  profile: toProvider(dto.profile),
  online: dto.online,
  coverage: toCoverage(dto.coverage),
  documents: dto.documents.map(toDocument),
  wallet: { balance: dto.wallet.balance_kz, transactions: dto.wallet.transactions.map(toTransaction), payout: { ...dto.wallet.payout_account } },
  declined: dto.declined_request_ids,
});
export const fromProviderState = (s: ProviderState): Dto.ProviderStateDto => ({
  profile: fromProvider(s.profile),
  online: s.online,
  coverage: fromCoverage(s.coverage),
  documents: s.documents.map(fromDocument),
  wallet: { balance_kz: s.wallet.balance, transactions: s.wallet.transactions.map(fromTransaction), payout_account: { ...s.wallet.payout } },
  declined_request_ids: s.declined,
});

export const toEarnings = (dto: D<typeof Dto.EarningsDto>): EarningsSummary => ({ today: dto.today_kz, todayCount: dto.today_count, week: dto.week_kz, completed: dto.completed_count, chart: dto.last_7_days_kz });
export const fromEarnings = (e: EarningsSummary): D<typeof Dto.EarningsDto> => ({ today_kz: e.today, today_count: e.todayCount, week_kz: e.week, completed_count: e.completed, last_7_days_kz: e.chart });

export const toReview = (dto: D<typeof Dto.ReviewDto>): Review => ({
  id: dto.id,
  requestId: dto.request_id,
  authorName: dto.author_name,
  authorInitials: initialsOf(dto.author_name),
  rating: dto.rating,
  comment: dto.comment,
  at: dto.created_at,
});
export const fromReview = (r: Review): D<typeof Dto.ReviewDto> => ({ id: r.id, request_id: r.requestId, author_name: r.authorName, rating: r.rating, comment: r.comment, created_at: r.at });

// —— Localização ——

export const toNearbyVehicle = (dto: D<typeof Dto.NearbyVehicleDto>): NearbyVehicle => ({ id: dto.id, coords: { latitude: dto.lat, longitude: dto.lng }, kind: dto.type });
export const fromNearbyVehicle = (v: NearbyVehicle): D<typeof Dto.NearbyVehicleDto> => ({ id: v.id, lat: v.coords.latitude, lng: v.coords.longitude, type: v.kind });

// —— Pagamentos ——

export const toPayment = (dto: Dto.PaymentDto): Payment => ({
  id: dto.id,
  requestId: dto.request_id,
  method: dto.payment_method,
  status: dto.status,
  amount: dto.amount_kz,
  reference: dto.bank_reference ? { entity: dto.bank_reference.entity, reference: dto.bank_reference.reference, expiresAt: dto.bank_reference.expires_at } : undefined,
  createdAt: dto.created_at,
  confirmedAt: orUndefined(dto.confirmed_at),
});
export const fromPayment = (p: Payment): Dto.PaymentDto => ({
  id: p.id,
  request_id: p.requestId,
  payment_method: p.method,
  status: p.status,
  amount_kz: p.amount,
  bank_reference: p.reference ? { entity: p.reference.entity, reference: p.reference.reference, expires_at: p.reference.expiresAt } : null,
  created_at: p.createdAt,
  confirmed_at: orNull(p.confirmedAt),
});

// —— Chat ——

export const toChatMessage = (dto: Dto.ChatMessageDto): ChatMessage => ({ id: dto.id, requestId: dto.thread_id, from: dto.sender, text: dto.body, at: dto.sent_at, read: dto.read });
export const fromChatMessage = (m: ChatMessage): Dto.ChatMessageDto => ({ id: m.id, thread_id: m.requestId, sender: m.from, body: m.text, sent_at: m.at, read: m.read });

export const toChatEvent = (dto: Dto.ChatEventDto): ChatEvent =>
  dto.type === "message" ? { type: "message", message: toChatMessage(dto.message) } : { type: "typing", from: dto.sender, typing: dto.typing };
export const fromChatEvent = (e: ChatEvent): Dto.ChatEventDto =>
  e.type === "message" ? { type: "message", message: fromChatMessage(e.message) } : { type: "typing", sender: e.from, typing: e.typing };

// —— Conta e suporte ——

export const toSavedAddress = (dto: D<typeof Dto.SavedAddressDto>): SavedAddress => ({ id: dto.id, label: dto.label, icon: dto.icon, place: toPlace(dto.place) });
export const fromSavedAddress = (a: SavedAddress): D<typeof Dto.SavedAddressDto> => ({ id: a.id, label: a.label, icon: a.icon, place: fromPlace(a.place) });

export const toPaymentMethod = (dto: D<typeof Dto.PaymentMethodDto>): PaymentMethod => ({ id: dto.id, kind: dto.type, title: dto.title, detail: dto.detail, isDefault: dto.is_default });
export const fromPaymentMethod = (p: PaymentMethod): D<typeof Dto.PaymentMethodDto> => ({ id: p.id, type: p.kind, title: p.title, detail: p.detail, is_default: p.isDefault });

export const toHelpTopic = (dto: D<typeof Dto.HelpTopicDto>): HelpTopic => ({ ...dto });
export const fromHelpTopic = (t: HelpTopic): D<typeof Dto.HelpTopicDto> => ({ ...t });

export const toEmergencyContact = (dto: D<typeof Dto.EmergencyContactDto>): EmergencyContact => ({ id: dto.id, label: dto.label, number: dto.phone_number });
export const fromEmergencyContact = (c: EmergencyContact): D<typeof Dto.EmergencyContactDto> => ({ id: c.id, label: c.label, phone_number: c.number });

export const fromTicketInput = (t: TicketInput) => ({ request_id: t.requestId, reason: t.reason, description: t.description });
export const toTicketInput = (body: ReturnType<typeof fromTicketInput>): TicketInput => ({ requestId: body.request_id, reason: body.reason, description: body.description });
