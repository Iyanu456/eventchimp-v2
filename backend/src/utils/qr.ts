import QRCode from "qrcode";

export const generateQrCode = async (payload: string) => QRCode.toDataURL(payload);
