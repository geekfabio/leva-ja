/**
 * Registo único de imagens locais usadas pelos mocks. Na integração com a API,
 * `Photo.asset` passa a ser um URL remoto e este registo deixa de ser necessário.
 */
export const photoAssets = {
  "pickup-bed": require("../../assets/photos/pickup-bed.jpg"),
  "pickup-side": require("../../assets/photos/pickup-side.jpg"),
  "boxes-plant": require("../../assets/photos/boxes-plant.jpg"),
  "wrapped-sofa": require("../../assets/photos/wrapped-sofa.jpg"),
  "delivered-sofa": require("../../assets/photos/delivered-sofa.jpg"),
  "delivered-boxes": require("../../assets/photos/delivered-boxes.jpg"),
  "delivered-wrapped": require("../../assets/photos/delivered-wrapped.jpg"),
  "hilux-street": require("../../assets/photos/hilux-street.jpg"),
} as const;

export type PhotoAssetKey = keyof typeof photoAssets;

export const vehicleArt = {
  tow: require("../../assets/vehicles/tow.png"),
  pickup: require("../../assets/vehicles/pickup.png"),
  van: require("../../assets/vehicles/van.png"),
  box: require("../../assets/vehicles/box.png"),
  heavy: require("../../assets/vehicles/heavy.png"),
  support: require("../../assets/vehicles/support.png"),
} as const;

export type VehicleArtKey = keyof typeof vehicleArt;

export const illustrations = {
  onboardingAssistance: require("../../assets/illustrations/onboarding-assistance.jpg"),
  onboardingTracking: require("../../assets/illustrations/onboarding-tracking.jpg"),
  onboardingSafety: require("../../assets/illustrations/onboarding-safety.jpg"),
  profileClient: require("../../assets/illustrations/profile-client.jpg"),
  profileProvider: require("../../assets/illustrations/profile-provider.jpg"),
  registerHero: require("../../assets/illustrations/register-hero.jpg"),
  emailEnvelope: require("../../assets/illustrations/email-envelope.jpg"),
  cargoBoxes: require("../../assets/illustrations/cargo-boxes.jpg"),
  movingHouse: require("../../assets/illustrations/moving-house.jpg"),
  movingTeam: require("../../assets/illustrations/moving-team.jpg"),
  supportAgent: require("../../assets/illustrations/support-agent.jpg"),
} as const;

export const avatars = {
  "joao-manuel": require("../../assets/avatars/joao-manuel.jpg"),
  "armando-manuel": require("../../assets/avatars/armando-manuel.jpg"),
} as const;

export type AvatarKey = keyof typeof avatars;

export const brandMark = require("../../assets/brand/leva-ja-mark.png");
