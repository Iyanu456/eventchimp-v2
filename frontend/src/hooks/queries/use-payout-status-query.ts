"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";

export const usePayoutStatusQuery = () =>
  useQuery({
    queryKey: queryKeys.organizer.payoutStatus,
    queryFn: async () => (await request.getPayoutStatus()).data
  });
