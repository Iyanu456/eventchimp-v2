export const USER_ROLES = ["attendee", "organizer", "admin"] as const;
export const AUTH_PROVIDERS = ["local", "google"] as const;
export const EVENT_STATUSES = ["draft", "published", "sold_out", "cancelled"] as const;
export const PAYMENT_STATUSES = ["pending", "success", "failed"] as const;
export const BRANDING_ASSET_TYPES = [
  "instagram_frame",
  "wristband",
  "badge_pass",
  "sponsor_backdrop"
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type BrandingAssetType = (typeof BRANDING_ASSET_TYPES)[number];
