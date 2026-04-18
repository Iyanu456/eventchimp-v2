import { BrandingAssetMetadataModel } from "../models/BrandingAssetMetadata";
import { EventModel } from "../models/Event";
import { AppError } from "../utils/app-error";

export const getBrandingTemplates = async (user: Express.User, eventId?: string) => {
  const baseFilter = user.role === "admin" ? {} : { organizerId: user.id };
  const events = await EventModel.find({
    ...baseFilter,
    ...(eventId ? { _id: eventId } : {})
  });

  const eventIds = events.map((event) => event._id);
  const savedTemplates = await BrandingAssetMetadataModel.find({ eventId: { $in: eventIds } });

  return events.map((event) => ({
    event,
    assets: savedTemplates.filter((asset) => asset.eventId.toString() === event._id.toString())
  }));
};

export const upsertBrandingMetadata = async (
  user: Express.User,
  payload: {
    eventId: string;
    type: "instagram_frame" | "wristband" | "badge_pass" | "sponsor_backdrop";
    eventName: string;
    date: string;
    venue: string;
    organizerName: string;
    sponsorName?: string;
    logo?: string;
    accentColor?: string;
  }
) => {
  const event = await EventModel.findById(payload.eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (user.role !== "admin" && event.organizerId.toString() !== user.id) {
    throw new AppError("You cannot edit branding for this event", 403);
  }

  const previewUrl = `https://placehold.co/1200x800/E0E7FF/111111?text=${encodeURIComponent(
    `${payload.type} - ${payload.eventName}`
  )}`;

  return BrandingAssetMetadataModel.findOneAndUpdate(
    { eventId: payload.eventId, type: payload.type },
    {
      eventId: payload.eventId,
      type: payload.type,
      customization: {
        eventName: payload.eventName,
        date: payload.date,
        venue: payload.venue,
        organizerName: payload.organizerName,
        sponsorName: payload.sponsorName ?? "",
        logo: payload.logo ?? "",
        accentColor: payload.accentColor ?? "#4F46E5"
      },
      previewUrl
    },
    { upsert: true, new: true }
  );
};
