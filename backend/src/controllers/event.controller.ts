import { Request, Response } from "express";
import {
  createEvent,
  createEventMessage,
  deleteEvent,
  getEventBySlug,
  getEventMessages,
  getEvents,
  getFeaturedEvents,
  updateEvent
} from "../services/event.service";
import { apiResponse } from "../utils/api-response";

export const getEventsController = async (req: Request, res: Response) => {
  const payload = await getEvents(req.query as Record<string, string | undefined>);
  res.json(apiResponse(payload, "Events fetched successfully"));
};

export const getFeaturedEventsController = async (_req: Request, res: Response) => {
  const payload = await getFeaturedEvents();
  res.json(apiResponse(payload, "Featured events fetched successfully"));
};

export const getEventBySlugController = async (req: Request, res: Response) => {
  const payload = await getEventBySlug(String(req.params.slug));
  res.json(apiResponse(payload, "Event fetched successfully"));
};

export const createEventController = async (req: Request, res: Response) => {
  const payload = await createEvent(req.user!.id, req.body, req.file);
  res.status(201).json(apiResponse(payload, "Event created successfully"));
};

export const updateEventController = async (req: Request, res: Response) => {
  const payload = await updateEvent(String(req.params.id), req.user!, req.body, req.file);
  res.json(apiResponse(payload, "Event updated successfully"));
};

export const deleteEventController = async (req: Request, res: Response) => {
  await deleteEvent(String(req.params.id), req.user!);
  res.json(apiResponse(null, "Event deleted successfully"));
};

export const getEventMessagesController = async (req: Request, res: Response) => {
  const payload = await getEventMessages(String(req.params.id));
  res.json(apiResponse(payload, "Event messages fetched successfully"));
};

export const createEventMessageController = async (req: Request, res: Response) => {
  const payload = await createEventMessage(String(req.params.id), req.body, req.user);
  res.status(201).json(apiResponse(payload, "Event message posted"));
};
