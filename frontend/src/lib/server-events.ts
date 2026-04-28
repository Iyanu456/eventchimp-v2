import { EventDetailResponse } from "@/types/domain";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export const DEFAULT_EVENT_PREVIEW_PATH = "/eventchimp-event-preview.svg";

export const getSiteUrl = () => SITE_URL.replace(/\/$/, "");
export const getApiUrl = () => API_URL.replace(/\/$/, "");
export const toAbsoluteUrl = (path: string) => (path.startsWith("http") ? path : `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`);

export const stripHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getEventPreviewImage = (image?: string | null) =>
  image && image.trim() ? toAbsoluteUrl(image) : toAbsoluteUrl(DEFAULT_EVENT_PREVIEW_PATH);

export const fetchEventBySlugServer = async (slug: string): Promise<EventDetailResponse | null> => {
  try {
    const response = await fetch(`${getApiUrl()}/events/slug/${slug}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: EventDetailResponse;
    };

    return payload.data ?? null;
  } catch {
    return null;
  }
};
