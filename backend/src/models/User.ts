import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";
import { AUTH_PROVIDERS, USER_ROLES } from "../constants/enums";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: USER_ROLES, default: "attendee" },
    avatar: { type: String, default: null },
    provider: { type: String, enum: AUTH_PROVIDERS, default: "local" }
  },
  { timestamps: true }
);

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const UserModel = model("User", userSchema);
