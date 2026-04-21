import { InferSchemaType, Schema, model } from "mongoose";
import { ORGANIZER_PAYOUT_STATUSES, RISK_STATUSES } from "../constants/enums";

const payoutProfileSchema = new Schema(
  {
    businessName: { type: String, default: "" },
    bankCode: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    accountName: { type: String, default: "" },
    currency: { type: String, default: "NGN" },
    subaccountCode: { type: String, default: "" },
    subaccountId: { type: Number, default: null },
    settlementSchedule: { type: String, default: "AUTO" },
    percentageCharge: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" }
  },
  { _id: false }
);

const organizerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    displayName: { type: String, required: true },
    bio: { type: String, default: "" },
    payoutPlaceholder: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    payoutReady: { type: Boolean, default: false },
    payoutStatus: { type: String, enum: ORGANIZER_PAYOUT_STATUSES, default: "not_started" },
    riskStatus: { type: String, enum: RISK_STATUSES, default: "clear" },
    payoutProfile: { type: payoutProfileSchema, default: () => ({}) },
    brandingPreferences: {
      accentColor: { type: String, default: "#4F46E5" },
      signatureTone: { type: String, default: "Premium and polished" }
    }
  },
  { timestamps: true }
);

export type OrganizerProfileDocument = InferSchemaType<typeof organizerProfileSchema> & { _id: string };

export const OrganizerProfileModel = model("OrganizerProfile", organizerProfileSchema);
