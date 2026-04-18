"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";

export const useMyTicketsQuery = () =>
  useQuery({
    queryKey: queryKeys.tickets.mine,
    queryFn: async () => (await request.getMyTickets()).data
  });

export const useEventTicketsQuery = (eventId?: string) =>
  useQuery({
    queryKey: eventId ? queryKeys.tickets.event(eventId) : ["tickets", "empty"],
    queryFn: async () => (await request.getEventTickets(eventId!)).data,
    enabled: Boolean(eventId)
  });
