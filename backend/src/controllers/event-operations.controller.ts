import { Request, Response } from "express";
import {
  acceptEventInvitation,
  getEventMetrics,
  inviteEventCollaborator,
  listEventCollaboratorsWithInvites,
  updateEventSettings
} from "../services/event-operations.service";
import { scanEventTicket, checkInEventTicket } from "../services/ticket.service";
import { apiResponse } from "../utils/api-response";

export const listEventCollaboratorsController = async (req: Request, res: Response) => {
  const payload = await listEventCollaboratorsWithInvites(String(req.params.eventId), req.user!);
  res.json(apiResponse(payload, "Event collaborators fetched successfully"));
};

export const inviteEventCollaboratorController = async (req: Request, res: Response) => {
  const payload = await inviteEventCollaborator(String(req.params.eventId), req.user!, req.body);
  res.status(201).json(apiResponse(payload, "Collaborator invitation sent successfully"));
};

export const acceptEventInvitationController = async (req: Request, res: Response) => {
  const payload = await acceptEventInvitation(String(req.params.token), req.user!);
  res.json(apiResponse(payload, "Invitation accepted successfully"));
};

export const updateEventSettingsController = async (req: Request, res: Response) => {
  const payload = await updateEventSettings(String(req.params.eventId), req.user!, req.body);
  res.json(apiResponse(payload, "Event settings updated successfully"));
};

export const getEventMetricsController = async (req: Request, res: Response) => {
  const payload = await getEventMetrics(String(req.params.eventId), req.user!);
  res.json(apiResponse(payload, "Event metrics fetched successfully"));
};

export const scanEventTicketController = async (req: Request, res: Response) => {
  const payload = await scanEventTicket(String(req.params.eventId), req.user!, String(req.body.qrToken ?? ""));
  res.json(apiResponse(payload, "Ticket scan completed"));
};

export const checkInEventTicketController = async (req: Request, res: Response) => {
  const payload = await checkInEventTicket(String(req.params.eventId), req.user!, String(req.body.qrToken ?? ""));
  res.json(apiResponse(payload, "Ticket checked in successfully"));
};
