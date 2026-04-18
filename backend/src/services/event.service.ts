import { EventModel } from "../models/Event";
import { EventMessageModel } from "../models/EventMessage";
import { AppError } from "../utils/app-error";
import { slugify } from "../utils/slug";
import { uploadImageBuffer } from "./cloudinary.service";

type EventInput = {
  title: string;
  category: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  ticketPrice: number;
  isFree: boolean;
  status: "draft" | "published" | "sold_out" | "cancelled";
  tags?: string[] | string;
};

const normalizeTags = (tags?: string[] | string) => {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.filter(Boolean);
  }

  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : tags.split(",").map((tag) => tag.trim());
  } catch {
    return tags.split(",").map((tag) => tag.trim());
  }
};

const ensureUniqueSlug = async (title: string, currentId?: string) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await EventModel.findOne({
      slug,
      ...(currentId ? { _id: { $ne: currentId } } : {})
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

export const getEvents = async (query: Record<string, string | undefined>) => {
  const filter: Record<string, unknown> = {};

  if (!query.includeAll) {
    filter.status = "published";
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { category: { $regex: query.search, $options: "i" } },
      { tags: { $in: [new RegExp(query.search, "i")] } }
    ];
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.organizerId) {
    filter.organizerId = query.organizerId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const limit = Number(query.limit ?? 12);
  const page = Number(query.page ?? 1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    EventModel.find(filter)
      .sort({ startDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("organizerId", "name avatar"),
    EventModel.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getFeaturedEvents = async () =>
  EventModel.find({ status: "published" })
    .sort({ attendeesCount: -1, startDate: 1 })
    .limit(6)
    .populate("organizerId", "name avatar");

export const getEventBySlug = async (slug: string) => {
  const event = await EventModel.findOne({ slug }).populate("organizerId", "name avatar");
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const messages = await EventMessageModel.find({ eventId: event._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("userId", "name avatar");

  return {
    event,
    messages
  };
};

export const createEvent = async (
  organizerId: string,
  input: EventInput,
  file?: Express.Multer.File
) => {
  const coverImage = await uploadImageBuffer(file, "eventchimp/events");
  const slug = await ensureUniqueSlug(input.title);

  const event = await EventModel.create({
    organizerId,
    title: input.title,
    slug,
    category: input.category,
    description: input.description,
    coverImage,
    location: input.location,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    capacity: input.capacity,
    ticketPrice: input.isFree ? 0 : input.ticketPrice,
    isFree: input.isFree,
    status: input.status,
    tags: normalizeTags(input.tags)
  });

  return event;
};

export const updateEvent = async (
  eventId: string,
  actor: Express.User,
  input: Partial<EventInput>,
  file?: Express.Multer.File
) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (actor.role !== "admin" && event.organizerId.toString() !== actor.id) {
    throw new AppError("You cannot update this event", 403);
  }

  if (input.title && input.title !== event.title) {
    event.slug = await ensureUniqueSlug(input.title, event._id.toString());
    event.title = input.title;
  }

  if (input.category) event.category = input.category;
  if (input.description) event.description = input.description;
  if (input.location) event.location = input.location;
  if (input.startDate) event.startDate = new Date(input.startDate);
  if (input.endDate) event.endDate = new Date(input.endDate);
  if (typeof input.capacity === "number") event.capacity = input.capacity;
  if (typeof input.ticketPrice === "number") event.ticketPrice = input.ticketPrice;
  if (typeof input.isFree === "boolean") {
    event.isFree = input.isFree;
    if (input.isFree) {
      event.ticketPrice = 0;
    }
  }
  if (input.status) event.status = input.status;
  if (input.tags) event.tags = normalizeTags(input.tags);
  if (file) {
    event.coverImage = await uploadImageBuffer(file, "eventchimp/events");
  }

  await event.save();
  return event;
};

export const deleteEvent = async (eventId: string, actor: Express.User) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (actor.role !== "admin" && event.organizerId.toString() !== actor.id) {
    throw new AppError("You cannot delete this event", 403);
  }

  await event.deleteOne();
};

export const getEventMessages = async (eventId: string) =>
  EventMessageModel.find({ eventId }).sort({ createdAt: -1 }).populate("userId", "name avatar");

export const createEventMessage = async (
  eventId: string,
  input: { content: string; guestName?: string },
  user?: Express.User
) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return EventMessageModel.create({
    eventId,
    userId: user?.id,
    guestName: user ? "" : input.guestName,
    content: input.content
  });
};
