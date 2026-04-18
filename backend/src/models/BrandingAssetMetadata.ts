import { InferSchemaType, Schema, model } from "mongoose";
import { BRANDING_ASSET_TYPES } from "../constants/enums";

const brandingAssetMetadataSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    type: { type: String, enum: BRANDING_ASSET_TYPES, required: true },
    customization: {
      eventName: { type: String, required: true },
      date: { type: String, required: true },
      venue: { type: String, required: true },
      organizerName: { type: String, required: true },
      sponsorName: { type: String, default: "" },
      logo: { type: String, default: "" },
      accentColor: { type: String, default: "#4F46E5" }
    },
    previewUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export type BrandingAssetMetadataDocument = InferSchemaType<typeof brandingAssetMetadataSchema> & {
  _id: string;
};

export const BrandingAssetMetadataModel = model(
  "BrandingAssetMetadata",
  brandingAssetMetadataSchema
);
