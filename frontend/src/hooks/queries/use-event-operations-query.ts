"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";

export const useEventCollaboratorsQuery = (eventId: string) =>
  useQuery({
    queryKey: queryKeys.events.collaborators(eventId),
    queryFn: async () => (await request.getEventCollaborators(eventId)).data,
    enabled: Boolean(eventId)
  });

export const useEventMetricsQuery = (eventId: string) =>
  useQuery({
    queryKey: queryKeys.events.metrics(eventId),
    queryFn: async () => (await request.getEventMetrics(eventId)).data,
    enabled: Boolean(eventId)
  });
