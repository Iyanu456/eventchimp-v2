"use client";

import { useQuery } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { queryKeys } from "@/lib/query-keys";

export const usePayoutBanksQuery = () =>
  useQuery({
    queryKey: queryKeys.organizer.banks,
    queryFn: async () => (await request.getPayoutBanks()).data
  });
