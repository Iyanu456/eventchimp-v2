import crypto from "crypto";
import QRCode from "qrcode";
import { env } from "../config/env";

export const generateQrCode = async (payload: string) => QRCode.toDataURL(payload);

export const generateQrToken = () => crypto.randomBytes(24).toString("hex");

export const hashQrToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const buildTicketVerificationUrl = (token: string) => `${env.CLIENT_URL}/verify-ticket/${token}`;
