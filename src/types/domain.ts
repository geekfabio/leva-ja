/**
 * Modelo de domínio da Leva Já. Os mocks e a futura API partilham estes tipos;
 * a substituição dos mocks deve respeitar estas formas.
 */
export type Role = "client" | "provider";

export type Coordinates = { latitude: number; longitude: number };

export type Place = {
  id: string;
  label: string;
  /** Bairro ou zona, ex.: "Ingombota". */
  area: string;
  city: string;
  coords: Coordinates;
};

export type ServiceKind = "tow" | "cargo" | "small_move" | "house_move";

export type IncidentType =
  | "mechanical"
  | "accident"
  | "flat_tire"
  | "battery"
  | "no_fuel";

export type CargoType =
  | "boxes"
  | "furniture"
  | "appliances"
  | "construction"
  | "goods"
  | "other";

export type WeightRange = "upto100" | "101to300" | "301to500" | "over500";
export type VolumeSize = "small" | "medium" | "large";
export type PropertyType = "t0_t1" | "t2" | "t3" | "t4_plus" | "office";
export type VehicleClass = "tow_truck" | "pickup" | "van" | "truck";

export type ServiceStatus =
  | "searching"
  | "assigned"
  | "en_route"
  | "arrived"
  | "pickup_confirmed"
  | "in_transit"
  | "delivered"
  | "paid"
  | "rated"
  | "cancelled";

export type PaymentMethodKind = "bank_reference" | "card" | "cash";

export type Photo = {
  id: string;
  /** Chave de uma ilustração local (ver `src/mocks/photos.ts`). */
  asset: string;
  caption: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  rating: number;
  /** URL da fotografia ou chave de imagem local (ver src/theme/images.ts). */
  avatar?: string;
};

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  plate: string;
  color: string;
  vehicleClass: VehicleClass;
  categoryLabel: string;
  capacityKg: number;
  year: number;
};

export type Provider = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  avatar?: string;
  vehicle: Vehicle;
  /** Posição simulada actual. */
  coords: Coordinates;
};

export type TowDetails = {
  incident: IncidentType;
  brand: string;
  model: string;
  plate: string;
  color: string;
  canMove: boolean;
};

export type CargoDetails = {
  cargoType: CargoType;
  description: string;
  weight: WeightRange;
  volume: VolumeSize;
  vehicleClass: VehicleClass;
  helper: boolean;
};

export type MovingDetails = {
  propertyType?: PropertyType;
  rooms: number;
  items: string;
  helpers: number;
  pickupFloor: number;
  deliveryFloor: number;
  elevator: boolean;
  disassembly: boolean;
  when: "now" | "scheduled";
  date?: string;
  time?: string;
};

export type PriceBreakdown = {
  base: number;
  distance: number;
  extras: number;
  platformFee: number;
  total: number;
};

export type ServiceEvent = { status: ServiceStatus; at: string };

export type DeliveryProofData = {
  photos: Photo[];
  signedBy: string;
  goodCondition: boolean;
  notes?: string;
  at: string;
};

export type PriceProposal = {
  amount: number;
  reason: string;
  status: "sent" | "accepted" | "declined";
};

export type ServiceRequest = {
  id: string;
  code: string;
  kind: ServiceKind;
  status: ServiceStatus;
  clientId: string;
  providerId?: string;
  /** Resumo do cliente, incluído pela API em cada pedido. */
  client?: Client;
  /** Prestador atribuído (ou que enviou proposta), incluído pela API. */
  provider?: Provider;
  origin: Place;
  destination: Place;
  stops: Place[];
  distanceKm: number;
  durationMin: number;
  /** Geometria da rota automóvel devolvida pelo serviço de routing. */
  routeGeometry?: Coordinates[];
  createdAt: string;
  scheduledFor?: string;
  tow?: TowDetails;
  cargo?: CargoDetails;
  moving?: MovingDetails;
  photos: Photo[];
  pickupPhotos: Photo[];
  instructions?: string;
  price: PriceBreakdown;
  /** Ganho estimado do prestador (valor após taxa). */
  providerEarning: number;
  proposal?: PriceProposal;
  paymentMethod?: PaymentMethodKind;
  rating?: number;
  review?: string;
  proof?: DeliveryProofData;
  timeline: ServiceEvent[];
  cancelReason?: string;
};

export type ChatMessage = {
  id: string;
  requestId: string;
  from: Role | "support";
  text: string;
  at: string;
  read: boolean;
};

export type TransactionKind = "earning" | "withdrawal" | "fee";
export type Transaction = {
  id: string;
  kind: TransactionKind;
  title: string;
  amount: number;
  at: string;
  status: "completed" | "pending" | "failed";
  serviceKind?: ServiceKind;
};

export type Review = {
  id: string;
  requestId: string;
  authorName: string;
  authorInitials: string;
  rating: number;
  comment: string;
  at: string;
};

export type DocumentState = "verified" | "pending" | "expired" | "needs_update";
export type ProviderDocument = {
  id: string;
  title: string;
  validUntil: string;
  state: DocumentState;
  icon: "license" | "id" | "vehicle" | "insurance";
};

export type Zone = {
  id: string;
  name: string;
  coords: Coordinates;
  radiusKm: number;
};

export type SavedAddress = {
  id: string;
  label: string;
  place: Place;
  icon: "home" | "work" | "pin";
};

export type PaymentMethod = {
  id: string;
  kind: PaymentMethodKind;
  title: string;
  detail: string;
  isDefault: boolean;
};

export type HelpTopic = {
  id: string;
  category: "orders" | "payments" | "safety" | "account";
  question: string;
  answer: string;
};
