import { Request, Response } from "express";
import { checkInTicket, getEventGuestList, getMyTickets } from "../services/ticket.service";
import { apiResponse } from "../utils/api-response";

export const getMyTicketsController = async (req: Request, res: Response) => {
  const payload = await getMyTickets(req.user!.id);
  res.json(apiResponse(payload, "Tickets fetched successfully"));
};

export const getEventGuestListController = async (req: Request, res: Response) => {
  const payload = await getEventGuestList(String(req.params.eventId), req.user!);
  res.json(apiResponse(payload, "Guest list fetched successfully"));
};

export const checkInTicketController = async (req: Request, res: Response) => {
  const payload = await checkInTicket(String(req.params.ticketId), req.user!);
  res.json(apiResponse(payload, "Guest checked in successfully"));
};
