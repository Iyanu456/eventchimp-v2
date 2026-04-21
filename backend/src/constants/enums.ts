export const USER_ROLES = ["attendee", "organizer", "admin"] as const;
export const AUTH_PROVIDERS = ["local", "google"] as const;
export const EVENT_STATUSES = ["draft", "published", "sold_out", "cancelled"] as const;
export const PAYMENT_STATUSES = ["pending", "success", "failed", "refunded"] as const;
export const ORDER_PAYMENT_STATUSES = [
  "initialized",
  "pending",
  "paid",
  "failed",
  "refunded",
  "cancelled"
] as const;
export const ORDER_FULFILLMENT_STATUSES = [
  "pending",
  "processing",
  "fulfilled",
  "failed",
  "refunded"
] as const;
export const SETTLEMENT_STATUSES = [
  "pending",
  "reconciled",
  "mismatch",
  "refunded"
] as const;
export const ORGANIZER_PAYOUT_STATUSES = [
  "not_started",
  "pending_review",
  "verified",
  "rejected",
  "suspended"
] as const;
export const RISK_STATUSES = ["clear", "under_review", "blocked"] as const;
export const EVENT_ACCESS_STATUSES = ["active", "suspended"] as const;
export const LEDGER_ENTRY_TYPES = [
  "payment_received",
  "organizer_principal_reserved",
  "platform_fee_accrued",
  "refund_issued",
  "reconciliation_adjustment"
] as const;
export const WEBHOOK_PROCESSING_STATUSES = ["received", "processed", "failed", "ignored"] as const;
export const REFUND_STATUSES = [
  "requested",
  "processing",
  "succeeded",
  "failed",
  "rejected"
] as const;
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
export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number];
export type OrderFulfillmentStatus = (typeof ORDER_FULFILLMENT_STATUSES)[number];
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number];
export type OrganizerPayoutStatus = (typeof ORGANIZER_PAYOUT_STATUSES)[number];
export type RiskStatus = (typeof RISK_STATUSES)[number];
export type EventAccessStatus = (typeof EVENT_ACCESS_STATUSES)[number];
export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];
export type WebhookProcessingStatus = (typeof WEBHOOK_PROCESSING_STATUSES)[number];
export type RefundStatus = (typeof REFUND_STATUSES)[number];
export type BrandingAssetType = (typeof BRANDING_ASSET_TYPES)[number];
