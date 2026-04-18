"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";

export const useOrganizerDashboardQuery = () =>
  useQuery({
    queryKey: queryKeys.dashboard.organizer,
    queryFn: async () => (await request.getOrganizerDashboard()).data
  });
