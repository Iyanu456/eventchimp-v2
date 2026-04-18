import { InferSchemaType, Schema, model } from "mongoose";

const organizerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    displayName: { type: String, required: true },
    bio: { type: String, default: "" },
    payoutPlaceholder: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    brandingPreferences: {
      accentColor: { type: String, default: "#4F46E5" },
      signatureTone: { type: String, default: "Premium and polished" }
    }
  },
  { timestamps: true }
);

export type OrganizerProfileDocument = InferSchemaType<typeof organizerProfileSchema> & { _id: string };

export const OrganizerProfileModel = model("OrganizerProfile", organizerProfileSchema);
