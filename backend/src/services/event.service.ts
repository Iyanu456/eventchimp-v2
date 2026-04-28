import sanitizeHtml from "sanitize-html";
import { EventModel } from "../models/Event";
import { EventMessageModel } from "../models/EventMessage";
import { OrganizerProfileModel } from "../models/OrganizerProfile";
import { AppError } from "../utils/app-error";
import { slugify } from "../utils/slug";
import { uploadImageBuffer } from "./cloudinary.service";
import { getEventAccessContext } from "./event-access.service";

type TicketTierInput = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  order: number;
  perks?: string[];
};

type RecurrenceInput = {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  until?: string;
  daysOfWeek?: string[];
};

type StreamingInput = {
  provider: string;
  url?: string;
  meetingCode?: string;
  password?: string;
  notes?: string;
};

type GuestInput = {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  bio?: string;
};

type CustomFieldInput = {
  id: string;
  label: string;
  type: "text" | "number" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
};

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
  scheduleType?: "single" | "recurring";
  recurrence?: RecurrenceInput | string;
  attendanceMode?: "in_person" | "virtual" | "hybrid";
  streaming?: StreamingInput | string;
  ticketTiers?: TicketTierInput[] | string;
  guests?: GuestInput[] | string;
  customFields?: CustomFieldInput[] | string;
};

const parseStructuredValue = <T>(value: T | string | undefined, fallback: T): T => {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  if (!value.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
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

const sanitizeDescription = (description: string) =>
  sanitizeHtml(description, {
    allowedTags: ["p", "br", "strong", "em", "u", "ul", "ol", "li", "h2", "h3", "blockquote", "a"],
    allowedAttributes: {
      a: ["href", "target", "rel"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tagName: string, attribs: Record<string, string>) => ({
        tagName: "a",
        attribs: {
          href: attribs.href,
          target: "_blank",
          rel: "noreferrer noopener"
        }
      })
    }
  });

const normalizeTicketTiers = (
  value: TicketTierInput[] | string | undefined,
  fallbackPrice: number,
  isFree: boolean,
  capacity: number
) => {
  const parsed = parseStructuredValue<TicketTierInput[]>(value, []);
  const normalized = parsed
    .map((tier, index) => ({
      id: tier.id || `tier-${index + 1}`,
      name: tier.name?.trim() || `Ticket ${index + 1}`,
      price: Math.max(Number(tier.price ?? 0), 0),
      quantity: Math.max(Number(tier.quantity ?? capacity), 1),
      order: Number.isFinite(tier.order) ? Number(tier.order) : index,
      perks: (tier.perks ?? []).map((perk) => perk.trim()).filter(Boolean)
    }))
    .sort((a, b) => a.order - b.order);

  if (normalized.length) {
    return normalized;
  }

  return [
    {
      id: "general-admission",
      name: isFree || fallbackPrice === 0 ? "Free pass" : "General admission",
      price: isFree ? 0 : Math.max(fallbackPrice, 0),
      quantity: Math.max(capacity, 1),
      order: 0,
      perks: []
    }
  ];
};

const summarizeTicketTiers = (tiers: ReturnType<typeof normalizeTicketTiers>) => {
  const lowestPrice = Math.min(...tiers.map((tier) => tier.price));
  const isFree = tiers.every((tier) => tier.price === 0);

  return {
    ticketPrice: Number.isFinite(lowestPrice) ? lowestPrice : 0,
    isFree
  };
};

const normalizeRecurrence = (scheduleType: string, recurrence?: RecurrenceInput | string) => {
  if (scheduleType !== "recurring") {
    return null;
  }

  const parsed = parseStructuredValue<RecurrenceInput | null>(recurrence, null);
  if (!parsed) {
    return {
      frequency: "weekly" as const,
      interval: 1,
      until: null,
      daysOfWeek: []
    };
  }

  return {
    frequency: parsed.frequency,
    interval: Math.max(Number(parsed.interval ?? 1), 1),
    until: parsed.until ? new Date(parsed.until) : null,
    daysOfWeek: (parsed.daysOfWeek ?? []).filter(Boolean)
  };
};

const normalizeStreaming = (attendanceMode: string, streaming?: StreamingInput | string) => {
  if (attendanceMode === "in_person") {
    return null;
  }

  const parsed = parseStructuredValue<StreamingInput | null>(streaming, null);
  if (!parsed) {
    return null;
  }

  return {
    provider: parsed.provider || "zoom",
    url: parsed.url?.trim() ?? "",
    meetingCode: parsed.meetingCode?.trim() ?? "",
    password: parsed.password?.trim() ?? "",
    notes: parsed.notes?.trim() ?? ""
  };
};

const normalizeGuests = (value?: GuestInput[] | string) =>
  parseStructuredValue<GuestInput[]>(value, [])
    .map((guest, index) => ({
      id: guest.id || `guest-${index + 1}`,
      name: guest.name?.trim() ?? "",
      role: guest.role?.trim() ?? "",
      imageUrl: guest.imageUrl?.trim() ?? "",
      bio: guest.bio?.trim() ?? ""
    }))
    .filter((guest) => guest.name && guest.role);

const normalizeCustomFields = (value?: CustomFieldInput[] | string) =>
  parseStructuredValue<CustomFieldInput[]>(value, [])
    .map((field, index) => ({
      id: field.id || `field-${index + 1}`,
      label: field.label?.trim() ?? "",
      type: field.type ?? "text",
      required: Boolean(field.required),
      placeholder: field.placeholder?.trim() ?? "",
      options: (field.options ?? []).map((option) => option.trim()).filter(Boolean)
    }))
    .filter((field) => field.label);

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

const ensureRealisticEventDates = (startDate: Date, endDate: Date, options: { requireFutureStart: boolean }) => {
  if (Number.isNaN(startDate.getTime())) {
    throw new AppError("Choose a valid event start date and time", 400);
  }

  if (Number.isNaN(endDate.getTime())) {
    throw new AppError("Choose a valid event end date and time", 400);
  }

  if (options.requireFutureStart && startDate.getTime() < Date.now() - 60 * 1000) {
    throw new AppError("Event start time cannot be in the past", 400);
  }

  if (endDate <= startDate) {
    throw new AppError("Event end time must be after the start time", 400);
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

export const createEvent = async (organizerId: string, input: EventInput, file?: Express.Multer.File) => {
  const coverImage = await uploadImageBuffer(file, "eventchimp/events");
  const slug = await ensureUniqueSlug(input.title);
  const ticketTiers = normalizeTicketTiers(input.ticketTiers, input.ticketPrice, input.isFree, input.capacity);
  const ticketSummary = summarizeTicketTiers(ticketTiers);
  const organizerProfile = await OrganizerProfileModel.findOne({ userId: organizerId });
  const payoutReady = Boolean(organizerProfile?.payoutReady) && organizerProfile?.payoutStatus === "verified";
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  ensureRealisticEventDates(startDate, endDate, { requireFutureStart: true });

  if (!payoutReady) {
    throw new AppError("Complete and verify your payout profile before creating events", 403);
  }

  const event = await EventModel.create({
    organizerId,
    title: input.title,
    slug,
    category: input.category,
    description: sanitizeDescription(input.description),
    coverImage,
    location: input.location,
    startDate,
    endDate,
    capacity: input.capacity,
    ticketPrice: ticketSummary.ticketPrice,
    isFree: ticketSummary.isFree,
    status: "published",
    tags: normalizeTags(input.tags),
    scheduleType: input.scheduleType ?? "single",
    recurrence: normalizeRecurrence(input.scheduleType ?? "single", input.recurrence),
    attendanceMode: input.attendanceMode ?? "in_person",
    streaming: normalizeStreaming(input.attendanceMode ?? "in_person", input.streaming),
    ticketTiers,
    guests: normalizeGuests(input.guests),
    customFields: normalizeCustomFields(input.customFields),
    payoutReady,
    accessStatus: "active",
    riskStatus: organizerProfile?.riskStatus ?? "clear",
    suspensionReason: ""
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

  const accessContext = await getEventAccessContext(eventId, actor);
  if (accessContext.role !== "admin" && accessContext.role !== "owner" && accessContext.role !== "manager") {
    throw new AppError("You cannot update this event", 403);
  }

  if (input.title && input.title !== event.title) {
    event.slug = await ensureUniqueSlug(input.title, event._id.toString());
    event.title = input.title;
  }

  if (input.category) event.category = input.category;
  if (input.description !== undefined) event.description = sanitizeDescription(input.description);
  if (input.location) event.location = input.location;
  if (input.startDate) event.startDate = new Date(input.startDate);
  if (input.endDate) event.endDate = new Date(input.endDate);
  if (typeof input.capacity === "number") event.capacity = input.capacity;
  if (input.tags !== undefined) event.tags = normalizeTags(input.tags);
  if (input.scheduleType) {
    event.scheduleType = input.scheduleType;
    event.recurrence = normalizeRecurrence(input.scheduleType, input.recurrence);
  } else if (input.recurrence !== undefined) {
    event.recurrence = normalizeRecurrence(event.scheduleType, input.recurrence);
  }
  if (input.attendanceMode) {
    event.attendanceMode = input.attendanceMode;
    event.streaming = normalizeStreaming(input.attendanceMode, input.streaming);
  } else if (input.streaming !== undefined) {
    event.streaming = normalizeStreaming(event.attendanceMode, input.streaming);
  }
  if (input.guests !== undefined) event.guests = normalizeGuests(input.guests) as never;
  if (input.customFields !== undefined) event.customFields = normalizeCustomFields(input.customFields) as never;

  const hasTierUpdate =
    input.ticketTiers !== undefined || typeof input.ticketPrice === "number" || typeof input.isFree === "boolean";

  if (hasTierUpdate) {
    const capacity = typeof input.capacity === "number" ? input.capacity : event.capacity;
    const ticketTiers = normalizeTicketTiers(
      input.ticketTiers !== undefined ? input.ticketTiers : (event.ticketTiers as unknown as TicketTierInput[]),
      typeof input.ticketPrice === "number" ? input.ticketPrice : event.ticketPrice,
      typeof input.isFree === "boolean" ? input.isFree : event.isFree,
      capacity
    );
    const ticketSummary = summarizeTicketTiers(ticketTiers);
    const organizerProfile = await OrganizerProfileModel.findOne({ userId: event.organizerId });
    const payoutReady = Boolean(organizerProfile?.payoutReady) && organizerProfile?.payoutStatus === "verified";
    event.ticketTiers = ticketTiers as never;
    event.ticketPrice = ticketSummary.ticketPrice;
    event.isFree = ticketSummary.isFree;
    event.payoutReady = payoutReady;
  }

  if (input.status) {
    if (input.status === "draft" && actor.role !== "admin") {
      event.status = event.status === "draft" ? "draft" : "published";
    } else {
      event.status = input.status;
    }
  }

  if (event.status === "published") {
    const organizerProfile = await OrganizerProfileModel.findOne({ userId: event.organizerId });
    const payoutReady = Boolean(organizerProfile?.payoutReady) && organizerProfile?.payoutStatus === "verified";
    if (!payoutReady) {
      throw new AppError("A verified payout profile is required before publishing events", 403);
    }
    event.payoutReady = true;
  }

  if (file) {
    event.coverImage = await uploadImageBuffer(file, "eventchimp/events");
  }

  ensureRealisticEventDates(event.startDate, event.endDate, { requireFutureStart: false });

  await event.save();
  return event;
};

export const deleteEvent = async (eventId: string, actor: Express.User) => {
  const accessContext = await getEventAccessContext(eventId, actor);
  if (accessContext.role !== "admin" && accessContext.role !== "owner") {
    throw new AppError("You cannot delete this event", 403);
  }

  await (accessContext.event as { deleteOne: () => Promise<unknown> }).deleteOne();
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
